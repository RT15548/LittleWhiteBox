import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createRecallPrefetchCoordinator,
    getRecallPrefetchStartAction,
} from '../generate/recall-prefetch.js';

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
    });
    return { context, coordinator, scheduler };
}

async function flushMicrotasks() {
    await Promise.resolve();
    await Promise.resolve();
}

test('dry-run is ignored without superseding a real run, while real non-user generations cancel only', () => {
    assert.equal(getRecallPrefetchStartAction('normal', {}, true), 'ignore');
    assert.equal(
        getRecallPrefetchStartAction('normal', { automatic_trigger: true }, false),
        'cancel-only',
    );
    assert.equal(getRecallPrefetchStartAction('swipe', {}, false), 'cancel-only');
    assert.equal(getRecallPrefetchStartAction('normal', {}, false), 'watch');
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

test('an expired watcher is joined as timed out without repeating the request', async () => {
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
    assert.equal(joined.path, 'prefetch-timeout');
    assert.equal(joined.remainingMs, 0);
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
    assert.equal(joined.remainingMs, 10);
    assert.equal(prefetched.controller.signal.aborted, true);
    assert.equal(signals[0].aborted, true);
    assert.equal(calls, 2);
    assert.deepEqual(await joined.slot.outcome, {
        ok: true,
        value: { text: 'current' },
    });

    releaseFirst({ text: 'stale' });
    assert.equal((await prefetched.outcome).ok, true);
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

test('joining a prefetch keeps the original absolute deadline', async () => {
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
    assert.equal(joined.remainingMs, 10);
    assert.equal(calls, 1);

    scheduler.advanceBy(10);
    assert.equal(joined.slot.cancelReason, 'prefetch-timeout');
    assert.equal(joined.slot.controller.signal.aborted, true);
    assert.equal(calls, 1);
    release({ text: 'late' });
    await joined.slot.outcome;
    coordinator.finish(joined.slot);
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
    assert.equal(joined.remainingMs, 0);
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
    coordinator.cancel('prefetch-timeout', {
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
    assert.equal(joined.remainingMs, 0);
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
