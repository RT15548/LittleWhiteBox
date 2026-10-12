import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createRecallPrefetchCoordinator,
    getRecallPrefetchStartAction,
} from '../generate/recall-prefetch.js';
import { RECALL_TIMEOUT_MS, RECALL_TIMEOUT_REASONS, recallFailureNotice } from '../generate/recall-failure.js';

function createScheduler() {
    let clock = 0;
    let nextId = 0;
    const tasks = new Map();

    function setTimeout(callback, delay = 0) {
        const id = ++nextId;
        tasks.set(id, {
            callback,
            at: clock + Math.max(0, Number(delay) || 0),
        });
        return id;
    }

    function clearTimeout(id) {
        tasks.delete(id);
    }

    function advanceBy(milliseconds) {
        const target = clock + milliseconds;
        while (true) {
            const next = [...tasks.entries()]
                .filter(([, task]) => task.at <= target)
                .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
            if (!next) break;
            const [id, task] = next;
            tasks.delete(id);
            clock = task.at;
            task.callback();
        }
        clock = target;
    }

    return {
        setTimeout,
        clearTimeout,
        advanceBy,
        now: () => clock,
        pendingCount: () => tasks.size,
    };
}

function createHarness(prepare, options = {}) {
    const scheduler = createScheduler();
    const context = { chatId: 'chat-a', chat: [] };
    const coordinator = createRecallPrefetchCoordinator({
        getContext: () => context,
        prepare,
        pollMs: 16,
        maxAgeMs: options.maxAgeMs || 100,
        setTimeout: scheduler.setTimeout,
        clearTimeout: scheduler.clearTimeout,
        now: scheduler.now,
        onJoinedCancel: options.onJoinedCancel,
        createRetryNotice: options.createRetryNotice,
    });
    return { context, coordinator, scheduler };
}

async function flushMicrotasks() {
    await Promise.resolve();
    await Promise.resolve();
}

test('long query waiting can join prefetch; remaining preparation budget resumes without resetting', async () => {
    let finishQuery;
    const { context, coordinator, scheduler } = createHarness(async (_type, _signal, _diagnostics, withQueryEmbedding) => {
        scheduler.advanceBy(40);
        await withQueryEmbedding(() => new Promise(resolve => { finishQuery = resolve; }));
        return new Promise(() => {});
    });
    coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
    const user = { is_user: true, mes: 'fixture' };
    context.chat.push(user);
    scheduler.advanceBy(16);
    await flushMicrotasks();
    scheduler.advanceBy(60_000);
    const { slot, path } = coordinator.join({ chatId: context.chatId, type: 'normal', focusRef: user });
    assert.equal(path, 'prefetch');
    assert.equal(slot.controller.signal.aborted, false);
    finishQuery();
    await flushMicrotasks();
    scheduler.advanceBy(59);
    assert.equal(slot.controller.signal.aborted, false);
    scheduler.advanceBy(1);
    assert.equal(slot.cancelReason, RECALL_TIMEOUT_REASONS.compute);
    assert.equal(slot.controller.signal.aborted, true);
    assert.equal(scheduler.pendingCount(), 0);
});

for (const reason of ['generation-stopped', 'chat-changed', 'message-edited', 'unregistered']) {
    test(`${reason} immediately cancels a joined long query and clears its notice`, async () => {
        let finishQuery;
        let visible = false;
        const { context, coordinator, scheduler } = createHarness(async (_type, _signal, _diagnostics, withQueryEmbedding) => {
            await withQueryEmbedding(() => new Promise(resolve => { finishQuery = resolve; }));
            return { text: 'late' };
        }, { createRetryNotice: () => ({ show() { visible = true; }, clear() { visible = false; } }) });
        const { slot } = coordinator.join({ chatId: context.chatId, type: 'normal' });
        await flushMicrotasks();
        scheduler.advanceBy(30_000);
        assert.equal(visible, true);
        const pending = coordinator.waitForOutcome(slot);
        coordinator.cancel(reason);
        await assert.rejects(pending, { name: 'AbortError' });
        assert.equal(visible, false);
        finishQuery();
        await slot.outcome;
        assert.equal(coordinator.getCurrent(), null);
        assert.equal(scheduler.pendingCount(), 0);
    });
}

for (const alreadyRunning of [false, true]) {
    test(`a retained stop cannot be counted as interrupted work on later edits (existing=${alreadyRunning})`, () => {
        const { coordinator, context } = createHarness(() => assert.fail('stopped preparation must not start'));
        if (alreadyRunning) {
            const run = coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
            assert.equal(coordinator.getActive(), run);
        }
        const stopped = coordinator.cancel('generation-stopped', { retainForJoin: true, chatId: context.chatId });
        assert.equal(coordinator.getCurrent(), stopped);
        assert.equal(coordinator.getActive(), null);
        for (const reason of ['message-edited', 'recall-config-changed', 'summary-edited', 'cache-cleared']) {
            assert.equal(coordinator.getActive(), null);
            coordinator.cancel(reason);
        }
        const next = coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
        assert.equal(coordinator.getActive(), next);
        coordinator.cancel('message-edited');
        assert.equal(coordinator.getActive(), null);
    });
}

test('prepared recall remains interruptible until adopted; completed recall is no longer active', async () => {
    const { coordinator, context } = createHarness(async () => ({ text: 'memory' }));
    const { slot } = coordinator.join({ chatId: context.chatId, type: 'normal' });
    assert.equal(coordinator.getActive(), slot);
    await coordinator.waitForOutcome(slot);
    assert.equal(coordinator.getActive(), slot);
    coordinator.finish(slot);
    assert.equal(coordinator.getActive(), null);
});

test('cancellation publishes once at cancellation time, before late work can affect a newer run', async () => {
    const cancellations = [];
    let finishOld;
    const { coordinator, context } = createHarness((_type, _signal, diagnostics) => {
        diagnostics.stage = 'round1-embed';
        return new Promise(resolve => { finishOld = resolve; });
    }, { onJoinedCancel: slot => cancellations.push({ reason: slot.cancelReason, stage: slot.diagnostics.stage }) });
    const old = coordinator.join({ chatId: context.chatId, type: 'normal' }).slot;
    await flushMicrotasks();
    coordinator.cancel('generation-stopped');
    assert.deepEqual(cancellations, [{ reason: 'generation-stopped', stage: 'round1-embed' }]);
    assert.ok(Number.isFinite(old.diagnostics.finishedAt));
    const next = coordinator.join({ chatId: context.chatId, type: 'normal' }).slot;
    finishOld({ text: 'late' });
    await old.outcome;
    coordinator.finish(old);
    assert.equal(coordinator.getCurrent(), next);
    assert.equal(cancellations.length, 1);
    coordinator.finish(next);
});

test('a retained pre-join cancellation reports only when joined and is never reported twice', () => {
    const cancellations = [];
    const { coordinator, context } = createHarness(() => { throw new Error('cancelled work must not start'); }, {
        onJoinedCancel: slot => cancellations.push(slot.cancelReason),
    });
    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    coordinator.cancel('generation-stopped', { retainForJoin: true });
    assert.deepEqual(cancellations, []);
    const joined = coordinator.join({ chatId: context.chatId, type: 'normal' }).slot;
    assert.deepEqual(cancellations, ['generation-stopped']);
    coordinator.join({ chatId: context.chatId, type: 'normal' });
    coordinator.cancel('generation-stopped', { retainForJoin: true });
    coordinator.finish(joined);
    assert.deepEqual(cancellations, ['generation-stopped']);
});

test('dry-run is ignored without superseding a real run, while real non-user generations cancel only', () => {
    assert.equal(getRecallPrefetchStartAction('normal', {}, true), 'ignore');
    assert.equal(
        getRecallPrefetchStartAction('normal', { automatic_trigger: true }, false),
        'cancel-only',
    );
    assert.equal(getRecallPrefetchStartAction('swipe', {}, false), 'cancel-only');
    assert.equal(getRecallPrefetchStartAction('normal', {}, false), 'watch');
    assert.equal(getRecallPrefetchStartAction('quiet', {}, false), 'ignore');
    assert.equal(getRecallPrefetchStartAction('impersonate', {}, false), 'cancel-only');
});

test('maintenance invalidations coalesce without aborting the host or overlapping preparations', async () => {
    const tasks = [];
    const refreshed = Promise.withResolvers();
    let active = 0;
    let peak = 0;
    const { coordinator, context } = createHarness(async (_type, signal) => {
        peak = Math.max(peak, ++active);
        const pending = Promise.withResolvers();
        tasks.push({ ...pending, signal });
        if (tasks.length === 2) refreshed.resolve();
        try { return await pending.promise; } finally { active--; }
    });
    const run = coordinator.join({ chatId: context.chatId, type: 'normal' }).slot;
    const result = coordinator.waitForOutcome(run);
    await flushMicrotasks();
    for (let i = 0; i < 20; i++) coordinator.invalidate();
    assert.equal(tasks.length, 1);
    assert.equal(tasks[0].signal.aborted, false);
    tasks[0].resolve({ text: 'stale' });
    await refreshed.promise;
    assert.equal(tasks.length, 2);
    tasks[1].resolve({ text: 'latest' });
    assert.deepEqual(await result, { ok: true, value: { text: 'latest' } });
    assert.equal(peak, 1);
    assert.equal(run.cancelReason, null);
    coordinator.finish(run);
});

test('prefetch waits for a real USER object and reuses that exact object at join', async () => {
    const calls = [];
    const { context, coordinator, scheduler } = createHarness((type, signal) => {
        calls.push({ type, signal, focus: context.chat.at(-1) });
        return { text: 'memory' };
    });

    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    scheduler.advanceBy(16);
    await flushMicrotasks();
    assert.equal(calls.length, 0);

    const userMessage = { is_user: true, mes: 'hello' };
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await flushMicrotasks();

    assert.equal(calls.length, 1);
    assert.equal(calls[0].focus, userMessage);

    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    assert.equal(joined.path, 'prefetch');
    assert.equal(joined.slot.capturedRef, userMessage);
    assert.deepEqual(await joined.slot.outcome, {
        ok: true,
        value: { text: 'memory' },
    });
    assert.equal(calls.length, 1);

    coordinator.finish(joined.slot);
    assert.equal(coordinator.getCurrent(), null);
    assert.equal(scheduler.pendingCount(), 0);
});

test('system-only changes and a throttled watcher fall back without an early request', async () => {
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return { text: 'fallback' };
    });

    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    context.chat.push({ is_user: false, mes: 'system' });
    scheduler.advanceBy(16);
    await flushMicrotasks();
    assert.equal(calls, 0);

    const firstFallback = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: null,
    });
    await flushMicrotasks();
    assert.equal(firstFallback.path, 'fallback');
    assert.equal(calls, 1);
    coordinator.finish(firstFallback.slot);

    const userMessage = { is_user: true, mes: 'arrived before the throttled timer' };
    coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: context.chat.length,
    });
    context.chat.push(userMessage);

    const throttledFallback = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    await flushMicrotasks();
    assert.equal(throttledFallback.path, 'fallback');
    assert.equal(calls, 2);
    coordinator.finish(throttledFallback.slot);
    assert.equal(scheduler.pendingCount(), 0);
});

test('waiting for the host without starting recall reports host waiting, not a recall timeout', async () => {
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return { text: 'fallback' };
    }, { maxAgeMs: 40 });

    const watching = coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: 0,
    });
    scheduler.advanceBy(40);
    await flushMicrotasks();

    assert.equal(calls, 0);
    assert.equal(watching.controller.signal.aborted, true);
    assert.equal(coordinator.getCurrent(), watching);
    assert.equal(scheduler.pendingCount(), 0);

    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: null,
    });
    await flushMicrotasks();
    assert.equal(joined.path, RECALL_TIMEOUT_REASONS.host);
    assert.equal(recallFailureNotice(joined.slot.cancelReason).issueCode, 'recall_host_wait_timeout');
    assert.equal(joined.slot.diagnostics.stage, 'waiting-for-user');
    await assert.rejects(coordinator.waitForOutcome(joined.slot), { name: 'AbortError' });
    assert.equal(calls, 0);
    coordinator.finish(joined.slot);
    assert.equal(coordinator.getCurrent(), null);
});

test('an object-reference mismatch aborts the prefetched run and recomputes once', async () => {
    let releaseFirst;
    const firstPending = new Promise(resolve => { releaseFirst = resolve; });
    const signals = [];
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness((_type, signal) => {
        signals.push(signal);
        calls++;
        return calls === 1 ? firstPending : { text: 'current' };
    });

    const original = { is_user: true, mes: 'original' };
    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    context.chat.push(original);
    scheduler.advanceBy(16);
    await flushMicrotasks();
    const prefetched = coordinator.getCurrent();
    assert.equal(calls, 1);
    scheduler.advanceBy(74);

    const replacement = { is_user: true, mes: 'replacement' };
    context.chat[0] = replacement;
    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: replacement,
    });
    await flushMicrotasks();

    assert.equal(joined.path, 'fallback');
    assert.equal(prefetched.controller.signal.aborted, true);
    assert.equal(signals[0].aborted, true);
    assert.equal(calls, 2);
    assert.deepEqual(await joined.slot.outcome, {
        ok: true,
        value: { text: 'current' },
    });

    releaseFirst({ text: 'stale' });
    assert.equal((await prefetched.outcome).error.name, 'AbortError');
    assert.equal(coordinator.getCurrent(), joined.slot);
});

test('moving the captured USER object to another floor invalidates the prefetch', async () => {
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return { text: calls === 1 ? 'stale' : 'current' };
    });
    context.chat.push({ is_user: false, mes: 'prior floor' });
    const userMessage = { is_user: true, mes: 'focus' };

    coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: context.chat.length,
    });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await flushMicrotasks();
    const prefetched = coordinator.getCurrent();
    assert.equal(prefetched.messageIndex, 1);
    assert.equal(calls, 1);

    context.chat.shift();
    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    await flushMicrotasks();

    assert.equal(joined.path, 'fallback');
    assert.equal(prefetched.controller.signal.aborted, true);
    assert.equal(calls, 2);
});

test('joining pending recall keeps its computation deadline without counting the earlier host wait', async () => {
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return pending;
    });
    const userMessage = { is_user: true, mes: 'focus' };

    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await flushMicrotasks();
    scheduler.advanceBy(74);

    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    assert.equal(joined.path, 'prefetch');
    assert.equal(calls, 1);

    const waiting = coordinator.waitForOutcome(joined.slot);
    const rejected = assert.rejects(waiting, { name: 'AbortError' });
    scheduler.advanceBy(25);
    assert.equal(joined.slot.controller.signal.aborted, false);
    scheduler.advanceBy(1);
    await rejected;
    assert.equal(joined.slot.cancelReason, RECALL_TIMEOUT_REASONS.compute);
    assert.equal(recallFailureNotice(joined.slot.cancelReason).issueCode, 'recall_timeout');
    assert.equal(joined.slot.controller.signal.aborted, true);
    assert.equal(calls, 1);
    release({ text: 'late' });
    await joined.slot.outcome;
    await assert.rejects(coordinator.waitForOutcome(joined.slot), { name: 'AbortError' });
    coordinator.finish(joined.slot);
});

test('a completed recall survives a host join beyond the recall budget without repeating work', async () => {
    let calls = 0;
    const expected = { text: 'memory' };
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return expected;
    }, { maxAgeMs: RECALL_TIMEOUT_MS });
    const userMessage = { is_user: true, mes: 'focus' };
    const slot = coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    const outcome = await slot.outcome;
    const finishedAt = slot.diagnostics.finishedAt;

    scheduler.advanceBy(RECALL_TIMEOUT_MS + 1000);
    const joined = coordinator.join({ chatId: context.chatId, type: 'normal', focusRef: userMessage });
    assert.equal(joined.path, 'prefetch');
    assert.equal(await coordinator.waitForOutcome(joined.slot), outcome);
    assert.equal(outcome.value, expected);
    assert.equal(slot.controller.signal.aborted, false);
    assert.equal(slot.diagnostics.finishedAt, finishedAt);
    assert.equal(calls, 1);
    assert.equal(scheduler.pendingCount(), 0);
    coordinator.finish(slot);
});

test('a failed recall preserves its original API error when the host joins late', async () => {
    const expected = Object.assign(new Error('embedding request failed'), {
        code: 'RECALL_EMBEDDING_FAILED', cause: new Error('HTTP 503'),
    });
    const { context, coordinator, scheduler } = createHarness(() => { throw expected; });
    const userMessage = { is_user: true, mes: 'focus' };
    const slot = coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await slot.outcome;
    scheduler.advanceBy(1000);

    const joined = coordinator.join({ chatId: context.chatId, type: 'normal', focusRef: userMessage });
    const outcome = await coordinator.waitForOutcome(joined.slot);
    assert.equal(outcome.ok, false);
    assert.equal(outcome.error, expected);
    assert.equal(slot.controller.signal.aborted, false);
    assert.equal(recallFailureNotice(slot.cancelReason, outcome.error).issueCode, 'recall_embedding_failed');
    assert.equal(scheduler.pendingCount(), 0);
    coordinator.finish(slot);
});

test('waiting for USER nearly exhausts the host budget but leaves a full recall budget', async () => {
    let release;
    const { context, coordinator, scheduler } = createHarness(() => new Promise(resolve => { release = resolve; }));
    const userMessage = { is_user: true, mes: 'focus' };
    coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
    scheduler.advanceBy(90);
    context.chat.push(userMessage);
    scheduler.advanceBy(6);
    await flushMicrotasks();
    scheduler.advanceBy(99);
    const joined = coordinator.join({ chatId: context.chatId, type: 'normal', focusRef: userMessage });
    assert.equal(joined.slot.controller.signal.aborted, false);
    const expected = { text: 'memory' };
    release(expected);
    assert.deepEqual(await coordinator.waitForOutcome(joined.slot), { ok: true, value: expected });
    assert.equal(scheduler.pendingCount(), 0);
    coordinator.finish(joined.slot);
});

test('replacing the source of a ready result computes new memory with a fresh budget', async () => {
    let calls = 0;
    let release;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return calls === 1 ? { text: 'old' } : new Promise(resolve => { release = resolve; });
    });
    const userMessage = { is_user: true, mes: 'old source' };
    const old = coordinator.startWatching({ chatId: context.chatId, initialLength: 0 });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await old.outcome;
    scheduler.advanceBy(1000);

    const replacement = { is_user: true, mes: 'new source' };
    context.chat[0] = replacement;
    const joined = coordinator.join({ chatId: context.chatId, type: 'normal', focusRef: replacement });
    await flushMicrotasks();
    scheduler.advanceBy(99);
    assert.equal(old.controller.signal.aborted, true);
    assert.equal(joined.slot.controller.signal.aborted, false);
    assert.equal(calls, 2);
    const expected = { text: 'current memory' };
    release(expected);
    assert.deepEqual(await coordinator.waitForOutcome(joined.slot), { ok: true, value: expected });
    coordinator.finish(joined.slot);
});

test('completed results remain cancellable by stop, source signal, dispatch, chat change, and supersede', async t => {
    const actions = {
        stop: ({ coordinator }) => coordinator.cancel('generation-stopped', { retainForJoin: true }),
        source: ({ host }) => host.abort(),
        dispatch: ({ coordinator, context, userMessage }) => {
            const dispatch = new AbortController();
            coordinator.join({ chatId: context.chatId, type: 'normal', focusRef: userMessage,
                runContext: { signal: dispatch.signal } });
            dispatch.abort();
        },
        chat: ({ coordinator, context }) => {
            context.chatId = 'chat-b';
            coordinator.cancel('chat-changed');
        },
        supersede: ({ coordinator, context }) => coordinator.startWatching({
            chatId: context.chatId, initialLength: context.chat.length,
        }),
    };
    for (const [name, cancel] of Object.entries(actions)) {
        await t.test(name, async () => {
            const { context, coordinator, scheduler } = createHarness(() => ({ text: 'memory' }));
            const host = new AbortController();
            const userMessage = { is_user: true, mes: 'focus' };
            const slot = coordinator.startWatching({ chatId: context.chatId, initialLength: 0, signal: host.signal });
            context.chat.push(userMessage);
            scheduler.advanceBy(16);
            await slot.outcome;
            cancel({ coordinator, context, host, userMessage });
            await assert.rejects(coordinator.waitForOutcome(slot), { name: 'AbortError' });
            assert.equal(recallFailureNotice(slot.cancelReason), null);
            coordinator.cancel('test-finished');
            assert.equal(scheduler.pendingCount(), 0);
        });
    }
});

test('failure classification distinguishes actual deadlines, API failures, errors, and cancellation', () => {
    assert.equal(recallFailureNotice(RECALL_TIMEOUT_REASONS.host).issueCode, 'recall_host_wait_timeout');
    assert.equal(recallFailureNotice(RECALL_TIMEOUT_REASONS.compute).issueCode, 'recall_timeout');
    for (const code of ['RECALL_EMBEDDING_FAILED', 'RECALL_EMBEDDING_INVALID_RESPONSE']) {
        assert.equal(recallFailureNotice(null, { code }).issueCode, 'recall_embedding_failed');
    }
    assert.equal(recallFailureNotice(null, new Error('internal failure')).issueCode, 'recall_failed');
    assert.equal(recallFailureNotice(null, { code: 'MEMORY_SOURCE_CHANGED' }).issueCode, 'recall_source_changed');
    assert.equal(recallFailureNotice(null, { code: 'MEMORY_SOURCE_UNSAFE' }).issueCode, 'recall_source_unsafe');
    assert.equal(recallFailureNotice(null, new DOMException('request aborted', 'AbortError')).issueCode, 'recall_failed');
    assert.equal(recallFailureNotice('generation-stopped', new Error('late failure')), null);
});

test('the optional generation signal cancels prefetch without a fallback retry', async () => {
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    let calls = 0;
    const host = new AbortController();
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return pending;
    });
    const userMessage = { is_user: true, mes: 'focus' };

    const watching = coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: 0,
        signal: host.signal,
    });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await flushMicrotasks();
    assert.equal(calls, 1);

    host.abort();
    assert.equal(watching.cancelReason, 'generation-signal-aborted');
    assert.equal(watching.controller.signal.aborted, true);
    assert.equal(coordinator.getCurrent(), watching);
    assert.equal(scheduler.pendingCount(), 0);

    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    assert.equal(joined.path, 'generation-signal-aborted');
    await assert.rejects(coordinator.waitForOutcome(joined.slot), { name: 'AbortError' });
    assert.equal(calls, 1);

    release({ text: 'late' });
    await watching.outcome;
    coordinator.finish(joined.slot);
});

test('a stopped generation remains claimable and never starts a fallback recall', async () => {
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return { text: 'must not run' };
    });

    const watching = coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: 0,
    });
    coordinator.cancel(RECALL_TIMEOUT_REASONS.host, {
        retainForJoin: true,
        chatId: context.chatId,
    });
    coordinator.cancel('generation-stopped', {
        retainForJoin: true,
        chatId: context.chatId,
        type: null,
    });
    const userMessage = { is_user: true, mes: 'saved after stop' };
    context.chat.push(userMessage);
    scheduler.advanceBy(16);

    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    assert.equal(joined.slot, watching);
    assert.equal(joined.path, 'generation-stopped');
    await assert.rejects(coordinator.waitForOutcome(joined.slot), { name: 'AbortError' });
    assert.equal(calls, 0);
    assert.equal(scheduler.pendingCount(), 0);
    coordinator.finish(joined.slot);

    const placeholder = coordinator.cancel('generation-stopped', {
        retainForJoin: true,
        chatId: context.chatId,
        type: null,
    });
    const placeholderJoin = coordinator.join({
        chatId: context.chatId,
        type: 'regenerate',
        focusRef: null,
    });
    assert.equal(placeholderJoin.slot, placeholder);
    assert.equal(placeholderJoin.path, 'generation-stopped');
    assert.equal(calls, 0);
    coordinator.finish(placeholderJoin.slot);
});

test('supersede, dispatch abort, and chat change cancel timers and computation', async () => {
    let release;
    const pending = new Promise(resolve => { release = resolve; });
    const { context, coordinator, scheduler } = createHarness(() => pending);

    const first = coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: 0,
    });
    const second = coordinator.startWatching({
        chatId: context.chatId,
        type: 'normal',
        initialLength: 0,
    });
    assert.equal(first.controller.signal.aborted, true);
    assert.equal(coordinator.getCurrent(), second);

    context.chatId = 'chat-b';
    scheduler.advanceBy(16);
    assert.equal(second.controller.signal.aborted, true);
    assert.equal(coordinator.getCurrent(), null);
    assert.equal(scheduler.pendingCount(), 0);

    context.chatId = 'chat-a';
    const dispatch = new AbortController();
    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: null,
        runContext: { signal: dispatch.signal },
    });
    await flushMicrotasks();
    dispatch.abort();

    assert.equal(joined.slot.cancelReason, 'dispatch-aborted');
    assert.equal(joined.slot.controller.signal.aborted, true);
    assert.equal(coordinator.getCurrent(), null);
    release({ text: 'late' });
    await joined.slot.outcome;
});

test('cancelling before the queued compute starts does not call prepare', async () => {
    let calls = 0;
    const { context, coordinator, scheduler } = createHarness(() => {
        calls++;
        return { text: 'must not run' };
    });
    const userMessage = { is_user: true, mes: 'hello' };

    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    const slot = coordinator.getCurrent();
    coordinator.cancel('generation-stopped');
    await flushMicrotasks();

    assert.equal(calls, 0);
    assert.equal(slot.controller.signal.aborted, true);
    assert.equal((await slot.outcome).ok, false);
    assert.equal(coordinator.getCurrent(), null);
    assert.equal(scheduler.pendingCount(), 0);
});

test('a prefetched rejection is stored as an outcome instead of leaking a rejected promise', async () => {
    const expected = new Error('expected recall failure');
    const { context, coordinator, scheduler } = createHarness(() => {
        throw expected;
    });
    const userMessage = { is_user: true, mes: 'hello' };

    coordinator.startWatching({ chatId: context.chatId, type: 'normal', initialLength: 0 });
    context.chat.push(userMessage);
    scheduler.advanceBy(16);
    await flushMicrotasks();

    const joined = coordinator.join({
        chatId: context.chatId,
        type: 'normal',
        focusRef: userMessage,
    });
    const outcome = await joined.slot.outcome;
    assert.equal(joined.path, 'prefetch');
    assert.equal(outcome.ok, false);
    assert.equal(outcome.error, expected);
});
