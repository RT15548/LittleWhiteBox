import assert from 'node:assert/strict';
import test from 'node:test';
import { createReplyProgressRuntime } from '../../reply-progress/runtime.js';
import { createRecallPrefetchCoordinator, getRecallPrefetchStartAction } from '../generate/recall-prefetch.js';
import { observeRecallPreparation } from '../generate/recall-progress.js';
import { runRequiredRecall } from '../generate/required-recall.js';
import { usesStoryRecall } from '../generate/recall-policy.js';
import {
    GENERATE_INTERCEPTOR_ORDER,
    observeGenerateInterceptors,
    registerGenerateInterceptor,
    unregisterGenerateInterceptor,
} from '../../../shared/common/generate-interceptor.js';

// Real coordinator, preparation observation, reply runtime and dispatcher.
// Host events preserve awaited listener order; only host/presenter/time and the
// actual recall computation are controlled. No UI copy or source-text contracts.
function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

function clockFixture() {
    let now = 1000, nextId = 0;
    const timers = new Map();
    function add(callback, delay, repeat = false) {
        const id = ++nextId;
        timers.set(id, { callback, at: now + delay, delay, repeat });
        return id;
    }
    return {
        get now() { return now; },
        timeout: (callback, delay) => add(callback, delay),
        interval: (callback, delay) => add(callback, delay, true),
        clear: id => timers.delete(id),
        advance(ms) {
            const target = now + ms;
            for (;;) {
                const next = [...timers].filter(([, timer]) => timer.at <= target)
                    .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
                if (!next) break;
                const [id, timer] = next;
                now = timer.at;
                if (timer.repeat) timers.set(id, { ...timer, at: now + timer.delay });
                else timers.delete(id);
                timer.callback();
            }
            now = target;
        },
    };
}

function eventFixture() {
    const listeners = new Map();
    const entries = event => {
        if (!listeners.has(event)) listeners.set(event, []);
        return listeners.get(event);
    };
    return {
        on(event, listener) { entries(event).push(listener); },
        makeFirst(event, listener) { entries(event).unshift(listener); },
        removeListener(event, listener) {
            const list = entries(event), index = list.indexOf(listener);
            if (index >= 0) list.splice(index, 1);
        },
        async emit(event, ...args) {
            for (const listener of [...entries(event)]) await listener(...args);
        },
    };
}

function fixture(t, { timeoutMs = 2000, presenterFails = false, queryWait = false } = {}) {
    const clock = clockFixture();
    t.mock.method(performance, 'now', () => clock.now);
    const events = eventFixture();
    const eventNames = ['GENERATION_STARTED', 'GENERATION_AFTER_COMMANDS', 'MESSAGE_SENT', 'USER_MESSAGE_RENDERED',
        'STREAM_TOKEN_RECEIVED', 'GENERATION_STOPPED', 'GENERATION_ENDED', 'MESSAGE_RECEIVED',
        'GROUP_WRAPPER_STARTED', 'GROUP_WRAPPER_FINISHED', 'CHAT_CHANGED'];
    const context = { chatId: 'progress-chat', chat: [{ is_user: false, mes: 'history' }] };
    const gate = deferred(), calls = [], frames = [], preparations = [], interceptorEvents = [], commits = [], joins = [], errors = [];
    const registered = new Set(), unobserve = [];
    let current = null, restored = 0, actions = null;
    const coordinator = createRecallPrefetchCoordinator({
        getContext: () => context,
        prepare: (type, signal, diagnostics, withQueryEmbedding) => {
            const pending = calls.length ? deferred() : gate;
            calls.push({ type, signal, diagnostics, withQueryEmbedding, gate: pending });
            return queryWait ? withQueryEmbedding(() => pending.promise) : pending.promise;
        },
        maxAgeMs: timeoutMs,
        now: () => clock.now,
        setTimeout: clock.timeout,
        clearTimeout: clock.clear,
    });
    const runtime = createReplyProgressRuntime({
        events, eventTypes: Object.fromEntries(eventNames.map(name => [name, name])),
        getTextarea: () => ({ value: '' }), getChat: () => context.chat,
        getStream: () => null, isSendPressed: () => true,
        observeRequest: () => () => {},
        observeRecall: observeRecallPreparation,
        observeActions: callbacks => { actions = callbacks; return () => { actions = null; }; },
        now: () => clock.now, schedule: clock.interval, unschedule: clock.clear,
        createPresenter: () => ({
            show(progress) {
                if (presenterFails && progress.phase === 'recall') throw new Error('presenter-test-failure');
                current = { ...progress };
                frames.push(current);
            },
            restore() { restored++; current = null; },
        }),
        reportError: (_message, error) => errors.push(error),
    });
    unobserve.push(observeRecallPreparation(event => preparations.push(event)));
    unobserve.push(observeGenerateInterceptors(event => interceptorEvents.push(event)));
    runtime.setEnabled(true);
    events.on('GENERATION_AFTER_COMMANDS', (type, params, dryRun) => {
        const action = getRecallPrefetchStartAction(type, params, dryRun);
        if (action === 'ignore') return;
        coordinator.cancel('superseded');
        if (action === 'watch') coordinator.startWatching({
            chatId: context.chatId, type: type || 'normal', initialLength: context.chat.length, signal: params?.signal,
        });
    });
    function register(id, handler, order) {
        registered.add(id);
        registerGenerateInterceptor(id, handler, order);
    }
    function installStory() {
        register('story-summary', async (_chat, _size, abort, type, runContext) => {
            if (!usesStoryRecall(type)) return null;
            const joined = coordinator.join({ chatId: context.chatId, type, focusRef: context.chat.at(-1), runContext });
            joins.push(joined);
            try {
                const outcome = await runRequiredRecall({
                    coordinator, run: joined.slot, abort,
                    onProgress: diagnostics => runContext.reportProgress(diagnostics),
                    commit: value => { commits.push(value); return value; },
                });
                return outcome.ok ? outcome.value : null;
            } finally {
                runContext.reportProgress(null);
            }
        }, GENERATE_INTERCEPTOR_ORDER.STORY_SUMMARY);
    }
    t.after(() => {
        runtime.destroy();
        coordinator.cancel('test-finished');
        for (const stop of unobserve) stop();
        for (const id of registered) unregisterGenerateInterceptor(id);
    });
    return {
        clock, events, context, coordinator, runtime, gate, calls, frames, preparations, interceptorEvents,
        commits, joins, errors, register, installStory, unobserve,
        get current() { return current; },
        get restored() { return restored; },
        get actions() { return actions; },
        async start(type = 'normal', params = {}, dryRun = false) {
            await events.emit('GENERATION_STARTED', type, params, dryRun);
            await events.emit('GENERATION_AFTER_COMMANDS', type, params, dryRun);
        },
        async pushUser() {
            const message = { is_user: true, mes: 'next question' };
            context.chat.push(message);
            clock.advance(16);
            await flush();
            return message;
        },
        dispatch(type = 'normal') { return globalThis.xiaobaixGenerateInterceptor(context.chat, 0, () => {}, type); },
    };
}

for (const renderBeforeReady of [false, true]) {
    test(`prefetch is visible between chat push and interceptor while host message listeners await (render first: ${renderBeforeReady})`, async t => {
        const f = fixture(t), hostGate = deferred();
        const hostOrder = [];
        f.events.on('MESSAGE_SENT', async () => { hostOrder.push('sent'); await hostGate.promise; hostOrder.push('sent-done'); });
        f.events.on('USER_MESSAGE_RENDERED', () => { hostOrder.push('rendered'); });
        await f.start();
        const startedAt = f.clock.now;
        f.context.chat.push({ is_user: true, mes: 'new input' });
        const sent = f.events.emit('MESSAGE_SENT', 1);
        await flush();
        assert.deepEqual(hostOrder, ['sent']);
        assert.equal(f.current.phase, 'message');
        f.clock.advance(16);
        await flush();
        assert.equal(f.calls.length, 1);
        assert.equal(f.current.phase, 'recall');
        assert.equal(f.current.detail, 'prepare');
        assert.equal(f.current.elapsedMs, 16);
        assert.equal(f.interceptorEvents.length, 0);
        assert.equal(f.preparations[0].source, f.context.chat[1]);
        assert.equal(f.preparations[0].detail, f.calls[0].diagnostics);
        assert.deepEqual(hostOrder, ['sent']); // Preparation runs during another listener's wait.
        hostGate.resolve();
        await sent; // Finishes even though recall is still unresolved.
        if (renderBeforeReady) {
            await f.events.emit('USER_MESSAGE_RENDERED', 1);
            assert.equal(f.current.phase, 'recall');
        }
        f.calls[0].diagnostics.stage = 'query-vector';
        f.clock.advance(200);
        assert.equal(f.current.detail, 'query-vector');
        const slot = f.coordinator.getCurrent();
        const prepared = { text: 'prepared-memory', boundary: 0 };
        f.gate.resolve(prepared);
        assert.deepEqual(await slot.outcome, { ok: true, value: prepared });
        assert.equal(f.current.phase, renderBeforeReady ? 'context' : 'message');
        assert.equal(f.current.detail, null);
        assert.equal(f.current.elapsedMs, f.clock.now - startedAt);
        if (!renderBeforeReady) await f.events.emit('USER_MESSAGE_RENDERED', 1);
        assert.equal(f.current.phase, 'context');
        assert.deepEqual(hostOrder, ['sent', 'sent-done', 'rendered']);
        assert.equal(f.calls.length, 1);
        assert.equal(f.commits.length, 0); // Only the interceptor can adopt prepared memory.
    });
}

test('a ninety-second query wait restores the host phase and continues through the interceptor without resetting elapsed time', async t => {
    const f = fixture(t, { timeoutMs: 30_000, queryWait: true });
    await f.start();
    const startedAt = f.clock.now;
    await f.pushUser();
    const slot = f.coordinator.getCurrent();
    await f.events.emit('MESSAGE_SENT', 1);
    slot.diagnostics.stage = 'query-vector';
    f.clock.advance(90_000);
    assert.equal(slot.controller.signal.aborted, false);
    assert.equal(f.current.phase, 'recall');
    assert.equal(f.current.detail, 'query-vector');
    const prepared = { text: 'long-query-result' };
    f.gate.resolve(prepared);
    await slot.outcome;
    assert.equal(f.current.phase, 'message');
    assert.equal(f.current.detail, null);
    assert.equal(f.current.elapsedMs, f.clock.now - startedAt);
    await f.events.emit('USER_MESSAGE_RENDERED', 1);
    assert.equal(f.current.phase, 'context');
    f.installStory();
    await f.dispatch();
    assert.equal(f.joins[0].slot, slot);
    assert.deepEqual(f.commits, [prepared]);
    assert.equal(f.current.phase, 'context');
    assert.equal(f.current.elapsedMs, 90_016);
    assert.equal(f.calls.length, 1);
});

test('dispatch accepts a still-pending ninety-second query after rendering without expiring its display lease', async t => {
    const f = fixture(t, { timeoutMs: 30_000, queryWait: true });
    await f.start();
    await f.pushUser();
    const slot = f.coordinator.getCurrent();
    await f.events.emit('MESSAGE_SENT', 1);
    await f.events.emit('USER_MESSAGE_RENDERED', 1);
    slot.diagnostics.stage = 'query-vector';
    f.clock.advance(90_000);
    assert.equal(f.current.phase, 'recall');
    assert.equal(f.current.detail, 'query-vector');
    f.installStory();
    const dispatching = f.dispatch();
    await flush();
    assert.equal(f.joins[0].slot, slot);
    assert.equal(slot.controller.signal.aborted, false);
    assert.equal(f.current.phase, 'recall');
    assert.equal(f.current.detail, 'query-vector');
    assert.equal(f.current.elapsedMs, 90_016);
    const prepared = { text: 'pending-query-result' };
    f.gate.resolve(prepared);
    await dispatching;
    assert.deepEqual(f.commits, [prepared]);
    assert.equal(f.current.phase, 'context');
    assert.equal(f.calls.length, 1);
});

test('a real dispatch owns other-module progress and joins the same diagnostics and prepared result once', async t => {
    const f = fixture(t), drawGate = deferred(), seenResults = [];
    await f.start();
    const startedAt = f.clock.now;
    await f.pushUser();
    const original = f.coordinator.getCurrent();
    f.register('draw', () => drawGate.promise, GENERATE_INTERCEPTOR_ORDER.DRAW);
    f.installStory();
    f.register('ena-planner', (_chat, _size, _abort, _type, runContext) => {
        seenResults.push(runContext.results.get('story-summary'));
    }, GENERATE_INTERCEPTOR_ORDER.ENA_PLANNER);
    const dispatching = f.dispatch();
    await flush();
    assert.deepEqual({ phase: f.current.phase, detail: f.current.detail }, { phase: 'interceptor', detail: 'draw' });
    original.diagnostics.stage = 'query-vector';
    f.clock.advance(200);
    assert.equal(f.current.phase, 'interceptor');
    assert.equal(f.current.detail, 'draw');
    drawGate.resolve({ image: true });
    await flush();
    assert.equal(f.joins[0].path, 'prefetch');
    assert.equal(f.joins[0].slot, original);
    assert.equal(f.calls.length, 1);
    assert.equal(f.current.phase, 'recall');
    assert.equal(f.current.detail, 'query-vector');
    const reported = f.interceptorEvents.find(event => event.phase === 'handler-progress' && event.detail);
    assert.equal(reported.detail, f.preparations[0].detail);
    assert.equal(reported.detail, f.calls[0].diagnostics);
    const prepared = { text: 'same-result', boundary: 0 };
    f.gate.resolve(prepared);
    await dispatching;
    assert.deepEqual(f.commits, [prepared]);
    assert.equal(seenResults[0], prepared);
    assert.equal(f.current.phase, 'context');
    assert.equal(f.current.elapsedMs, f.clock.now - startedAt);
    assert.equal(f.coordinator.getCurrent(), null);
    assert.deepEqual(original.diagnostics.observations.filter(item => item.channel === 'host').map(item => item.phase),
        ['prefetch-observed', 'interceptor-start']);
});

test('quiet activity neither starts a display nor replaces an overlapping foreground preparation', async t => {
    const f = fixture(t);
    f.installStory();
    await f.start('quiet');
    await f.dispatch('quiet');
    assert.equal(f.current, null);
    assert.equal(f.calls.length, 0);
    await f.start();
    await f.pushUser();
    const slot = f.coordinator.getCurrent(), restores = f.restored;
    await f.start('quiet');
    await f.dispatch('quiet');
    await f.events.emit('GENERATION_ENDED');
    assert.equal(f.restored, restores);
    assert.equal(f.current.phase, 'recall');
    assert.equal(f.coordinator.getCurrent(), slot);
    assert.equal(slot.controller.signal.aborted, false);
    assert.equal(f.calls.length, 1);
    f.gate.resolve({ text: 'foreground' });
    await slot.outcome;
    assert.equal(f.current.phase, 'context');
});

test('a superseded preparation cannot clear or restart the newer reply display', async t => {
    const f = fixture(t);
    await f.start();
    await f.pushUser();
    const first = f.coordinator.getCurrent();
    await f.start();
    await f.pushUser();
    const second = f.coordinator.getCurrent();
    assert.notEqual(second, first);
    assert.equal(first.controller.signal.aborted, true);
    assert.equal(f.current.phase, 'recall');
    second.diagnostics.stage = 'round1-retrieval';
    second.diagnostics.backend = 'worker';
    f.clock.advance(200);
    assert.equal(f.current.detail, 'worker-retrieval');
    f.gate.resolve({ text: 'old-result' });
    await first.outcome;
    assert.equal(f.current.phase, 'recall');
    assert.equal(f.current.detail, 'worker-retrieval');
    f.calls[1].gate.resolve({ text: 'new-result' });
    await second.outcome;
    assert.equal(f.current.phase, 'context');
    assert.equal(f.preparations.filter(event => event.run === first && event.phase === 'settled').length, 0);
    assert.equal(f.preparations.filter(event => event.run === second && event.phase === 'settled').length, 1);
    assert.equal(f.calls.length, 2);
});

for (const stopReason of ['chat-change', 'user-stop', 'disabled']) {
    test(`${stopReason} cannot be resurrected by late preparation or host notifications`, async t => {
        const f = fixture(t), source = new AbortController();
        await f.start('normal', { signal: source.signal });
        await f.pushUser();
        const slot = f.coordinator.getCurrent();
        assert.equal(f.current.phase, 'recall');
        if (stopReason === 'chat-change') {
            f.context.chat = [{ is_user: false, mes: 'other chat' }];
            f.context.chatId = 'other-chat';
            await f.events.emit('CHAT_CHANGED');
        } else if (stopReason === 'user-stop') {
            f.actions.onStop();
            source.abort();
        } else f.runtime.setEnabled(false);
        assert.equal(f.current, null);
        const frameCount = f.frames.length, restores = f.restored;
        f.gate.resolve({ text: 'late-result' });
        await slot.outcome;
        await f.events.emit('GENERATION_AFTER_COMMANDS', 'normal', {}, false);
        await f.events.emit('MESSAGE_SENT', f.context.chat.length - 1);
        await f.events.emit('USER_MESSAGE_RENDERED', f.context.chat.length - 1);
        f.clock.advance(200);
        assert.equal(f.current, null);
        assert.equal(f.frames.length, frameCount);
        assert.equal(f.restored, restores);
        assert.equal(f.calls.length, 1);
    });
}

for (const failure of ['none', 'preparation-observer', 'presenter', 'dispatcher-observer']) {
    test(`${failure} preserves compute count, result adoption and the original preparation deadline`, async t => {
        t.mock.method(console, 'warn', () => {});
        const f = fixture(t, { timeoutMs: 500, presenterFails: failure === 'presenter' });
        if (failure === 'preparation-observer') f.unobserve.push(observeRecallPreparation(() => { throw new Error('observer-test-failure'); }));
        if (failure === 'dispatcher-observer') f.unobserve.push(observeGenerateInterceptors(() => { throw new Error('observer-test-failure'); }));
        await f.start();
        await f.pushUser();
        const first = f.coordinator.getCurrent();
        assert.equal(first.deadlineAt, first.computeStartedAt + 500);
        assert.equal(f.calls.length, 1);
        f.clock.advance(499);
        assert.equal(first.controller.signal.aborted, false);
        const prepared = { text: 'preserved-result', boundary: 0 };
        f.gate.resolve(prepared);
        assert.deepEqual(await first.outcome, { ok: true, value: prepared });
        f.clock.advance(1000); // A completed result has no stale compute expiry.
        assert.equal(first.controller.signal.aborted, false);
        f.installStory();
        await f.dispatch();
        assert.equal(f.joins[0].slot, first);
        assert.deepEqual(f.commits, [prepared]);
        assert.equal(f.calls.length, 1);
        assert.equal(failure === 'presenter' ? f.errors.length > 0 : f.errors.length === 0, true);
        // A fresh computation still expires at its frozen deadline, not a UI tick.
        const second = f.coordinator.startWatching({ chatId: f.context.chatId, initialLength: f.context.chat.length });
        await f.pushUser();
        assert.equal(f.calls.length, 2);
        f.clock.advance(499);
        assert.equal(second.controller.signal.aborted, false);
        f.clock.advance(1);
        assert.equal(second.controller.signal.aborted, true);
        assert.equal(second.cancelReason, 'recall-timeout');
        f.calls[1].gate.resolve({ text: 'expired-result' });
        await second.outcome;
        assert.equal(second.phase, 'cancelled');
        assert.deepEqual(f.commits, [prepared]);
        assert.equal(f.calls.length, 2);
    });
}
