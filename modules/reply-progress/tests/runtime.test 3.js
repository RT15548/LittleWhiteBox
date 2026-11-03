import assert from 'node:assert/strict';
import test from 'node:test';
import { createReplyProgressRuntime, UNCONFIRMED_HINT_MS } from '../runtime.js';
import { createPlaceholderPresenter } from '../placeholder.js';
import { observeHostRequest } from '../request-observer.js';
import { registerGenerateInterceptor, unregisterGenerateInterceptor } from '../../../shared/common/generate-interceptor.js';

const TYPES = Object.fromEntries([
    'GENERATION_STARTED', 'GENERATION_AFTER_COMMANDS', 'MESSAGE_SENT', 'USER_MESSAGE_RENDERED',
    'STREAM_TOKEN_RECEIVED', 'MESSAGE_RECEIVED', 'GENERATION_STOPPED', 'GENERATION_ENDED',
    'CHAT_CHANGED', 'GROUP_WRAPPER_STARTED', 'GROUP_WRAPPER_FINISHED', 'CHAT_COMPLETION_SETTINGS_READY',
].map(name => [name, name]));

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

function harness(t, beforeEnable = () => {}) {
    const listeners = new Map();
    const events = {
        on(event, fn) { listeners.set(event, [...(listeners.get(event) || []), fn]); },
        makeFirst(event, fn) { listeners.set(event, [fn, ...(listeners.get(event) || []).filter(other => other !== fn)]); },
        removeListener(event, fn) { listeners.set(event, (listeners.get(event) || []).filter(other => other !== fn)); },
        async emit(event, ...args) {
            // Native ST snapshots and awaits listeners in order.
            for (const listener of [...(listeners.get(event) || [])]) await listener(...args);
        },
    };
    beforeEnable(events);
    const attributes = new Map([['placeholder', 'original']]);
    const textarea = {
        value: 'draft', readOnly: false, disabled: false,
        getAttribute: name => attributes.get(name) ?? null,
        setAttribute: (name, value) => attributes.set(name, value),
        removeAttribute: name => attributes.delete(name),
    };
    let clock = 0;
    let tick = null;
    let clickedStop = null;
    let replyAction = null;
    let chat = [];
    let stream = null;
    let sendPressed = true;
    let groupId = null;
    let connected = true;
    let progress = null;
    let restores = 0;
    let boundary = true;
    let showFailure = null;
    let restoreFailure = null;
    const errors = [];
    const runtime = createReplyProgressRuntime({
        events, eventTypes: TYPES, getTextarea: () => textarea, getChat: () => chat, getStream: () => stream,
        isSendPressed: () => sendPressed,
        getGroupId: () => groupId, isConnected: () => connected,
        observeRequest: (generation, onRequest) => boundary ? observeHostRequest({ events, eventTypes: TYPES, ...generation, onRequest }) : null,
        observeActions: ({ onStop, onReply }) => {
            clickedStop = onStop; replyAction = onReply;
            return () => { clickedStop = replyAction = null; };
        },
        now: () => clock, schedule: fn => { tick = fn; return 1; }, unschedule: () => { tick = null; },
        reportError: (_message, error) => errors.push(error),
        createPresenter: element => {
            const presenter = createPlaceholderPresenter(element, { watch: () => () => {} });
            return {
                show(value) { if (showFailure) throw showFailure; progress = value; presenter.show(value); },
                restore() {
                    restores++; progress = null;
                    presenter.restore();
                    if (restoreFailure) throw restoreFailure;
                },
            };
        },
    });
    runtime.setEnabled(true);
    t.after(() => runtime.destroy());
    return {
        events, runtime, textarea, errors,
        chat: () => chat, switchChat: value => { chat = value; },
        stream: value => { stream = value; }, group: value => { groupId = value; },
        sendPressed: value => { sendPressed = value; },
        connected: value => { connected = value; }, boundary: value => { boundary = value; },
        failShow: error => { showFailure = error; }, failRestore: error => { restoreFailure = error; },
        progress: () => progress, restores: () => restores, ticking: () => tick !== null,
        current: () => textarea.getAttribute('placeholder'),
        advance: ms => { clock += ms; tick?.(); }, stopClick: () => clickedStop?.(), replyAction: () => replyAction?.(),
        prepared: (type = 'normal') => events.emit(TYPES.CHAT_COMPLETION_SETTINGS_READY, { type, stream: false }),
    };
}

function register(t, id, handler = async () => {}) {
    registerGenerateInterceptor(id, handler);
    t.after(() => unregisterGenerateInterceptor(id));
}
async function begin(h, type = 'normal', params = {}, dryRun = false) {
    await h.events.emit(TYPES.GENERATION_STARTED, type, params, dryRun);
    await h.events.emit(TYPES.GENERATION_AFTER_COMMANDS, type, params, dryRun);
}
const dispatch = (type = 'normal') => globalThis.xiaobaixGenerateInterceptor([], 0, () => {}, type);
const newStream = (type = 'normal', messageId = 0) => ({
    type, messageId, result: '', isFinished: false, isStopped: false, abortController: new AbortController(),
});

test('one reply keeps total elapsed time through message, joined recall and response preparation', async t => {
    const h = harness(t);
    const seen = [];
    register(t, 'story-summary', async (_chat, _size, _abort, _type, context) => {
        const diagnostics = { stage: 'event-rerank' };
        context.reportProgress(diagnostics);
        h.advance(3000);
        seen.push(h.progress());
        diagnostics.stage = 'prompt-assembly';
        h.advance(200);
        seen.push(h.progress());
        context.reportProgress(null);
    });
    await begin(h);
    h.advance(1000);
    h.chat().push({ is_user: true, mes: 'hello' });
    await h.events.emit(TYPES.MESSAGE_SENT, 0);
    h.advance(2000);
    await h.events.emit(TYPES.USER_MESSAGE_RENDERED, 0);
    await dispatch();
    assert.deepEqual(seen, [
        { phase: 'recall', detail: 'event-rerank', elapsedMs: 6000 },
        { phase: 'recall', detail: 'prompt-assembly', elapsedMs: 6200 },
    ]);
    await h.prepared();
    assert.deepEqual(h.progress(), { phase: 'waiting', detail: null, elapsedMs: 6200 });
    assert.equal(h.textarea.value, 'draft');
    assert.equal(h.textarea.readOnly, false);
    assert.equal(h.textarea.disabled, false);
});

test('background, automatic, preview and consumed slash calls cannot start a reply timer', async t => {
    const h = harness(t);
    register(t, 'draw');
    for (const [type, params, dryRun] of [
        ['quiet', {}, false], ['impersonate', {}, false], ['normal', {}, true],
        ['normal', { automatic_trigger: true }, false], ['normal', { quiet_prompt: 'background' }, false],
    ]) {
        await begin(h, type, params, dryRun);
        await dispatch(type);
        await h.prepared(type);
        await h.events.emit(TYPES.GENERATION_ENDED);
        assert.equal(h.progress(), null);
        assert.equal(h.ticking(), false);
    }
    h.textarea.value = '/help';
    await h.events.emit(TYPES.GENERATION_STARTED, 'normal', {}, false);
    assert.equal(h.progress(), null);
    // A post-command event by itself is not a new user reply either.
    await h.events.emit(TYPES.GENERATION_AFTER_COMMANDS, 'normal', {}, false);
    assert.equal(h.progress(), null);
});

test('a background request and its untyped ending cannot reset or end the foreground wait', async t => {
    const h = harness(t);
    register(t, 'draw');
    await begin(h);
    await dispatch();
    h.advance(5000);
    const waiting = h.progress();
    await begin(h, 'quiet');
    await dispatch('quiet');
    await h.prepared('quiet');
    await h.events.emit(TYPES.GENERATION_ENDED);
    await h.events.emit(TYPES.GENERATION_STOPPED);
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, 'quiet');
    await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, 'background text');
    assert.deepEqual(h.progress(), waiting);
    await h.prepared();
    assert.equal(h.progress().elapsedMs, 5000);
    h.chat().push({ is_user: false, mes: 'answer' });
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, 'normal');
    assert.equal(h.progress(), null);
    // Background work continues after the answer, with no timer resurrection.
    await dispatch('quiet');
    await h.prepared('quiet');
    await h.events.emit(TYPES.GENERATION_AFTER_COMMANDS, 'normal', {}, false);
    h.advance(20 * 60_000);
    assert.equal(h.progress(), null);
    assert.equal(h.ticking(), false);
});

test('a pinned reply stream ends on its own first text even when another stream replaces the host pointer', async t => {
    const h = harness(t);
    register(t, 'draw');
    const previous = newStream();
    previous.result = 'previous reply';
    h.stream(previous);
    await begin(h);
    await dispatch();
    h.advance(1000);
    assert.ok(h.progress());
    const foreground = newStream();
    h.stream(foreground);
    await h.prepared();
    h.advance(UNCONFIRMED_HINT_MS * 2);
    assert.ok(h.progress());
    const background = newStream('quiet');
    h.stream(background);
    background.result = 'background output';
    await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, background.result);
    await h.events.emit(TYPES.GENERATION_ENDED);
    assert.ok(h.progress());
    foreground.result = 'first foreground text';
    await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, foreground.result);
    assert.equal(h.progress(), null);
    assert.equal(h.current(), 'original');
    assert.equal(h.ticking(), false);
});

test('host failure before streaming begins releases the hint without mutating or aborting the orphaned stream', async t => {
    const h = harness(t);
    // No summary or other plugin is needed to reproduce this failure.
    for (const type of ['normal', 'regenerate', 'swipe', 'continue']) {
        h.sendPressed(true);
        await begin(h, type);
        const stream = newStream(type, -1);
        h.stream(stream);
        h.advance(200);
        assert.equal(h.progress().phase, 'waiting');

        // Native onError: unblock (emitting ENDED), then discard the stream.
        // The failed request never reaches generate()/onErrorStreaming().
        h.sendPressed(false);
        await h.events.emit(TYPES.GENERATION_ENDED);
        h.stream(null);
        assert.equal(h.progress(), null);
        assert.equal(h.ticking(), false);
        assert.equal(h.current(), 'original');
        assert.equal(stream.isStopped, false);
        assert.equal(stream.isFinished, false);
        assert.equal(stream.abortController.signal.aborted, false);
        h.advance(UNCONFIRMED_HINT_MS * 2);
        assert.equal(h.progress(), null);
    }
    // A subsequent successful send is independent of the failed one.
    h.sendPressed(true);
    await begin(h);
    const stream = newStream();
    h.stream(stream);
    h.advance(200);
    assert.ok(h.progress());
    stream.result = 'answer';
    h.advance(200);
    assert.equal(h.progress(), null);
});

test('a fast streaming failure can be identified at ENDED before the first timer tick', async t => {
    const h = harness(t);
    await begin(h);
    h.stream(newStream('normal', -1));
    h.sendPressed(false);
    await h.events.emit(TYPES.GENERATION_ENDED);
    assert.equal(h.progress(), null);
    assert.equal(h.ticking(), false);
});

test('host cleanup does not depend on being the first ENDED listener', async t => {
    const h = harness(t);
    await begin(h);
    h.stream(newStream('normal', -1));
    h.advance(200);
    const earlier = deferred();
    h.events.makeFirst(TYPES.GENERATION_ENDED, () => earlier.promise);
    h.sendPressed(false);
    // The host emits without awaiting: it clears the pointer while another
    // extension is still handling the event before our observer.
    const ending = h.events.emit(TYPES.GENERATION_ENDED);
    h.stream(null);
    earlier.resolve();
    await ending;
    assert.equal(h.progress(), null);
    assert.equal(h.ticking(), false);
});

test('neither unrelated endings nor idle alone close an identified slow stream', async t => {
    const h = harness(t);
    await begin(h);
    const foreground = newStream();
    h.stream(foreground);
    h.advance(200);
    // An untyped event while the host is still sending has no ownership.
    await begin(h, 'quiet');
    await h.events.emit(TYPES.GENERATION_ENDED);
    assert.ok(h.progress());
    h.sendPressed(false);
    h.advance(UNCONFIRMED_HINT_MS * 2);
    assert.ok(h.progress());
    // Even idle + ENDED is not this reply's end if the pointer is replaced.
    h.stream(newStream('quiet'));
    await h.events.emit(TYPES.GENERATION_ENDED);
    assert.ok(h.progress());
    foreground.result = 'answer';
    h.advance(200);
    assert.equal(h.progress(), null);
});

for (const finish of ['finished', 'stopped', 'aborted']) {
    test(`an identified stream ${finish} ends the hint without waiting for background work`, async t => {
        const h = harness(t);
        register(t, 'draw');
        await begin(h);
        await dispatch();
        const stream = newStream();
        h.stream(stream);
        h.advance(200);
        h.stream(newStream('quiet'));
        if (finish === 'finished') stream.isFinished = true;
        if (finish === 'stopped') stream.isStopped = true;
        if (finish === 'aborted') stream.abortController.abort();
        h.advance(200);
        assert.equal(h.progress(), null);
    });
}

test('unrelated streams, tokens and prior messages cannot complete this reply', async t => {
    const h = harness(t);
    register(t, 'draw');
    h.chat().push({ is_user: false, mes: 'old answer' });
    await begin(h);
    await dispatch();
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, 'normal');
    for (const stream of [newStream('quiet'), newStream('impersonate'), newStream('normal', 0)]) {
        stream.result = 'unrelated text';
        h.stream(stream);
        await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, stream.result);
        assert.ok(h.progress());
    }
    h.chat().push({ is_user: false, mes: 'new answer' });
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 1, 'normal');
    assert.equal(h.progress(), null);
});

for (const [type, receivedType] of [['normal', 'normal'], ['regenerate', 'normal'], ['swipe', 'swipe'], ['continue', 'appendFinal']]) {
    test(`${type}: a typed reply completes even if background tasks remain`, async t => {
        const h = harness(t);
        register(t, 'draw');
        if (['swipe', 'continue'].includes(type)) h.chat().push({ is_user: false, mes: 'existing answer' });
        await begin(h, type);
        await dispatch(type);
        if (type === 'continue') {
            await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, receivedType);
            assert.ok(h.progress());
            h.chat()[0].mes += ' continuation';
        } else if (type !== 'swipe') h.chat().push({ is_user: false, mes: 'answer' });
        await begin(h, 'quiet');
        await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, receivedType);
        assert.equal(h.progress(), null);
        assert.equal(h.current(), 'original');
    });
}

test('a joined slow plugin stays visible while unrelated completions are ignored, preserving listener order', async t => {
    const entered = deferred();
    const release = deferred();
    const order = [];
    const h = harness(t, events => {
        events.on(TYPES.MESSAGE_SENT, async () => { order.push(1); entered.resolve(); await release.promise; });
        events.on(TYPES.MESSAGE_SENT, () => order.push(2));
    });
    await begin(h);
    h.chat().push({ is_user: true, mes: 'hello' });
    const sending = h.events.emit(TYPES.MESSAGE_SENT, 0);
    try {
        await entered.promise;
        h.advance(3000);
        await h.events.emit(TYPES.GENERATION_ENDED);
        assert.deepEqual(h.progress(), { phase: 'message', detail: null, elapsedMs: 3000 });
        assert.deepEqual(order, [1]);
    } finally { release.resolve(); await sending; }
    assert.deepEqual(order, [1, 2]);
    await h.events.emit(TYPES.USER_MESSAGE_RENDERED, 0);
    assert.equal(h.progress().elapsedMs, 3000);
});

test('only the claimed interceptor can show detail; late dispatches cannot steal its wait', async t => {
    const h = harness(t);
    const release = deferred();
    let context;
    register(t, 'story-summary', async (_chat, _size, _abort, type, runContext) => {
        if (type === 'quiet') { runContext.reportProgress({ stage: 'background' }); return; }
        context = runContext;
        context.reportProgress({ stage: 'event-rerank' });
        await release.promise;
    });
    await begin(h);
    const joined = dispatch();
    try {
        h.advance(UNCONFIRMED_HINT_MS * 2);
        await dispatch('quiet');
        await h.events.emit(TYPES.GENERATION_ENDED);
        assert.deepEqual(h.progress(), { phase: 'recall', detail: 'event-rerank', elapsedMs: UNCONFIRMED_HINT_MS * 2 });
        context.reportProgress({ stage: 'prompt-assembly' });
    } finally { release.resolve(); await joined; }
    await h.prepared();
    const waiting = h.progress();
    await dispatch();
    assert.deepEqual(h.progress(), waiting);
});

test('unattributed preflight failure expires only its display and background events cannot extend the lease', async t => {
    const h = harness(t);
    await begin(h, 'regenerate');
    h.advance(UNCONFIRMED_HINT_MS - 1);
    assert.ok(h.progress());
    await begin(h, 'quiet');
    await h.prepared('quiet');
    await h.events.emit(TYPES.GENERATION_ENDED);
    h.advance(1);
    assert.equal(h.progress(), null);
    assert.equal(h.ticking(), false);
    assert.equal(h.textarea.value, 'draft');
    assert.equal(h.textarea.readOnly, false);
});

test('a user stop click or this request signal ends only the hint; observers do not cancel a request', async t => {
    const h = harness(t);
    const controller = new AbortController();
    await begin(h, 'normal', { signal: controller.signal });
    h.stopClick();
    assert.equal(h.progress(), null);
    assert.equal(controller.signal.aborted, false);
    await begin(h, 'normal', { signal: controller.signal });
    controller.abort();
    h.advance(200);
    assert.equal(h.progress(), null);
});

test('an aborted foreground dispatch closes its hint', async t => {
    const h = harness(t);
    register(t, 'draw', async (_chat, _size, abort) => abort(true));
    await begin(h);
    await dispatch();
    assert.equal(h.progress(), null);
});

for (const originalType of ['normal', 'regenerate', 'continue']) {
    test(`${originalType}: in-round recall waiting preserves total waiting time`, async t => {
        const h = harness(t);
        const ready = deferred();
        register(t, 'story-summary', async (_chat, _size, _abort, type, context) => {
            if (type === 'quiet') return;
            context.reportProgress({ stage: 'round1-embed' });
            await ready.promise;
            context.reportProgress(null);
        });
        if (originalType === 'continue') h.chat().push({ is_user: false, mes: 'old' });
        await begin(h, originalType);
        const pending = dispatch(originalType);
        h.advance(5000);
        await begin(h, 'quiet');
        await h.events.emit(TYPES.GENERATION_ENDED);
        assert.equal(h.progress().phase, 'recall');
        ready.resolve();
        await pending;
        await h.prepared(originalType);
        assert.equal(h.progress().elapsedMs, 5000);
        if (originalType === 'continue') h.chat()[0].mes += ' next';
        else h.chat().push({ is_user: false, mes: 'answer' });
        await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, originalType === 'continue' ? 'appendFinal' : 'normal');
        assert.equal(h.progress(), null);
        assert.equal(h.restores(), 1);
    });
}

test('a group reply starts once and never restarts for later members after its first text', async t => {
    const h = harness(t);
    h.group('group-a');
    register(t, 'draw');
    await begin(h);
    h.advance(1000);
    await h.events.emit(TYPES.GROUP_WRAPPER_STARTED, { selected_group: 'group-a', type: 'normal' });
    await begin(h);
    await dispatch();
    assert.equal(h.progress().elapsedMs, 1000);
    const stream = newStream();
    h.stream(stream);
    stream.result = 'first member';
    await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, stream.result);
    assert.equal(h.progress(), null);
    await begin(h);
    await dispatch();
    await h.prepared();
    assert.equal(h.progress(), null);
    await h.events.emit(TYPES.GROUP_WRAPPER_FINISHED, { selected_group: 'group-a', type: 'normal' });
    await begin(h);
    assert.ok(h.progress());
});

test('group completion is scoped to the current chat and group, including an empty reply', async t => {
    const h = harness(t);
    h.group('group-a');
    await begin(h);
    await h.events.emit(TYPES.GROUP_WRAPPER_STARTED, { selected_group: 'group-a', type: 'normal' });
    for (const payload of [
        { selected_group: 'group-b', type: 'normal' }, { selected_group: 'group-a', type: 'quiet' },
    ]) {
        await h.events.emit(TYPES.GROUP_WRAPPER_FINISHED, payload);
        assert.ok(h.progress());
    }
    await h.events.emit(TYPES.GROUP_WRAPPER_FINISHED, { selected_group: 'group-a', type: 'normal' });
    assert.equal(h.progress(), null);
});

test('stale dispatch progress and settings listeners cannot alter a replacement reply', async t => {
    const h = harness(t);
    const first = deferred();
    let oldContext;
    register(t, 'story-summary', async (_chat, _size, _abort, _type, context) => {
        if (!oldContext) { oldContext = context; await first.promise; }
        else context.reportProgress({ stage: 'event-rerank' });
    });
    await begin(h);
    const oldRequest = dispatch();
    await begin(h);
    await dispatch();
    await h.prepared();
    const waiting = h.progress();
    oldContext.reportProgress({ stage: 'prompt-assembly' });
    first.resolve();
    await oldRequest;
    assert.deepEqual(h.progress(), waiting);
});

test('display and cleanup errors do not reject a host event or prevent later listeners', async t => {
    const h = harness(t);
    const failure = new Error('display unavailable');
    const cleanupFailure = new Error('cleanup unavailable');
    h.failShow(failure);
    h.failRestore(cleanupFailure);
    let proceeded = false;
    h.events.on(TYPES.GENERATION_STARTED, () => { proceeded = true; });
    await begin(h);
    assert.equal(proceeded, true);
    assert.equal(h.progress(), null);
    assert.equal(h.ticking(), false);
    assert.deepEqual(h.errors, [cleanupFailure, failure]);
});

test('chat changes, disconnection and disabling release observers without overwriting another placeholder', async t => {
    const h = harness(t);
    register(t, 'draw');
    for (const finish of [
        () => h.events.emit(TYPES.CHAT_CHANGED),
        () => { h.switchChat([]); h.advance(200); },
        () => { h.connected(false); h.advance(200); },
        () => h.runtime.setEnabled(false),
    ]) {
        h.connected(true);
        h.runtime.setEnabled(true);
        await begin(h);
        await dispatch();
        h.textarea.setAttribute('placeholder', 'new host placeholder');
        await finish();
        await h.prepared();
        assert.equal(h.progress(), null);
        assert.equal(h.current(), 'new host placeholder');
        assert.equal(h.ticking(), false);
        assert.equal(h.textarea.value, 'draft');
    }
});

test('hosts without typed settings still show a generic wait and recognize their own stream', async t => {
    const h = harness(t);
    h.boundary(false);
    register(t, 'draw');
    await begin(h);
    await dispatch();
    h.advance(1000);
    assert.deepEqual(h.progress(), { phase: 'waiting', detail: null, elapsedMs: 1000 });
    const stream = newStream();
    h.stream(stream);
    stream.result = 'answer';
    await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, stream.result);
    assert.equal(h.progress(), null);
});

test('first text ends tracking even when no LittleWhiteBox interceptor is registered', async t => {
    const h = harness(t);
    await begin(h);
    const stream = newStream();
    h.stream(stream);
    h.advance(200);
    assert.equal(h.progress().phase, 'waiting');
    stream.result = 'answer';
    await h.events.emit(TYPES.STREAM_TOKEN_RECEIVED, stream.result);
    assert.equal(h.progress(), null);
});

test('the reply position accounts for messages inserted by joined processing', async t => {
    const h = harness(t);
    register(t, 'draw', async () => h.chat().push({ is_user: false, is_system: true, mes: 'processing notice' }));
    await begin(h);
    await dispatch();
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, 'normal');
    assert.ok(h.progress());
    h.chat().push({ is_user: false, mes: 'answer' });
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 1, 'normal');
    assert.equal(h.progress(), null);
});

test('native automatic continuation cannot restart an answered reply, but manual continuation can', async t => {
    const h = harness(t);
    register(t, 'draw');
    await begin(h);
    await dispatch();
    h.chat().push({ is_user: false, mes: 'answer' });
    await h.events.emit(TYPES.MESSAGE_RECEIVED, 0, 'normal');
    await begin(h, 'continue');
    await dispatch('continue');
    await h.prepared('continue');
    assert.equal(h.progress(), null);
    h.replyAction();
    await begin(h, 'continue');
    await dispatch('continue');
    assert.ok(h.progress());
    assert.equal(h.progress().elapsedMs, 0);
});
