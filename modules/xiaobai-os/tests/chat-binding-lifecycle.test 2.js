import assert from 'node:assert/strict';
import test from 'node:test';

import { createChatBindingLifecycle } from '../storage/chat-binding-lifecycle.js';

function eventTarget() {
    const listeners = new Map();
    return {
        visibilityState: 'visible',
        on(event, listener) { this.addEventListener(event, listener); },
        removeListener(event, listener) { this.removeEventListener(event, listener); },
        addEventListener(event, listener) {
            const values = listeners.get(event) ?? new Set();
            values.add(listener);
            listeners.set(event, values);
        },
        removeEventListener(event, listener) { listeners.get(event)?.delete(listener); },
        emit(event, ...args) { for (const listener of listeners.get(event) ?? []) { listener(...args); } },
        count(event) { return listeners.get(event)?.size ?? 0; },
    };
}

const eventNames = {
    chatChanged: 'chat-changed',
    chatRenamed: 'chat-renamed',
    chatDeleted: 'chat-deleted',
    groupChatDeleted: 'group-chat-deleted',
    characterRenamed: 'character-renamed',
};

test('chat events resolve once; reopening, focus and visibility do not re-read storage', async () => {
    const events = eventTarget();
    const windowTarget = eventTarget();
    const documentTarget = eventTarget();
    let resolves = 0;
    let sidecarRefreshes = 0;
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const manager = {
        async resolveCurrent() { resolves++; await gate; return { status: 'ready', envelope: {}, created: false }; },
        async retryPendingCurrent() { return { status: 'empty' }; },
        async handleChatDeleted() { return 'retained'; },
        async handleCharacterRenamed() {},
    };
    const lifecycle = createChatBindingLifecycle({
        manager,
        installResolvedSidecar: async () => { sidecarRefreshes++; },
        events,
        eventNames,
        windowTarget,
        documentTarget,
    });

    lifecycle.start();
    events.emit('chat-changed');
    windowTarget.emit('focus');
    documentTarget.emit('visibilitychange');
    release();
    await lifecycle.refresh();
    assert.equal(resolves, 1);
    assert.equal(sidecarRefreshes, 1);
    windowTarget.emit('focus');
    documentTarget.emit('visibilitychange');
    await lifecycle.ready();
    await lifecycle.ready();
    assert.equal(resolves, 1);
    assert.equal(windowTarget.count('focus'), 0);
    assert.equal(documentTarget.count('visibilitychange'), 0);

    events.emit('chat-changed');
    await lifecycle.refresh();
    assert.equal(resolves, 2);
    assert.equal(sidecarRefreshes, 2);

    await lifecycle.stop();
    assert.equal(events.count('chat-changed'), 0);
    events.emit('chat-changed');
    await Promise.resolve();
    assert.equal(resolves, 2);
});

test('rename and deletion events route only lifecycle maintenance facts', async () => {
    const events = eventTarget();
    const windowTarget = eventTarget();
    const documentTarget = eventTarget();
    const calls = [];
    const manager = {
        async resolveCurrent() { calls.push(['resolve']); return { status: 'empty' }; },
        async retryPendingCurrent() { return { status: 'empty' }; },
        async handleChatDeleted(chatId) { calls.push(['delete', chatId]); return 'retained'; },
        async handleCharacterRenamed(oldAvatar, newAvatar) { calls.push(['character', oldAvatar, newAvatar]); },
    };
    const lifecycle = createChatBindingLifecycle({
        manager,
        installResolvedSidecar: async () => {},
        events,
        eventNames,
        windowTarget,
        documentTarget,
    });
    lifecycle.start();
    await lifecycle.refresh();
    events.emit('chat-deleted', 'single-chat');
    events.emit('group-chat-deleted', 'group-chat');
    events.emit('character-renamed', 'old.png', 'new.png');
    events.emit('chat-renamed', { oldFileName: 'old', newFileName: 'new' });
    await new Promise(resolve => setTimeout(resolve, 0));
    await lifecycle.refresh();

    assert.deepEqual(calls.filter(call => call[0] === 'delete'), [
        ['delete', 'single-chat'],
        ['delete', 'group-chat'],
    ]);
    assert.deepEqual(calls.find(call => call[0] === 'character'), ['character', 'old.png', 'new.png']);
    assert.ok(calls.filter(call => call[0] === 'resolve').length >= 2);
    await lifecycle.stop();
});

test('stop waits for an active resolution and suppresses its late sidecar refresh', async () => {
    const events = eventTarget();
    const windowTarget = eventTarget();
    const documentTarget = eventTarget();
    let finishResolution;
    let sidecarRefreshes = 0;
    const manager = {
        resolveCurrent: () => new Promise(resolve => { finishResolution = resolve; }),
        async retryPendingCurrent() { return { status: 'empty' }; },
        async handleChatDeleted() { return 'retained'; },
        async handleCharacterRenamed() {},
    };
    const lifecycle = createChatBindingLifecycle({
        manager,
        installResolvedSidecar: async () => { sidecarRefreshes++; },
        events,
        eventNames,
        windowTarget,
        documentTarget,
    });

    lifecycle.start();
    while (typeof finishResolution !== 'function') { await Promise.resolve(); }
    let stopped = false;
    const stopping = lifecycle.stop().then(() => { stopped = true; });
    await Promise.resolve();
    assert.equal(stopped, false);
    finishResolution({ status: 'ready', envelope: {}, created: false });
    await stopping;
    assert.equal(sidecarRefreshes, 0);
});

test('a refresh requested during resolution discards the overtaken result', async () => {
    const events = eventTarget();
    const windowTarget = eventTarget();
    const documentTarget = eventTarget();
    let releaseFirst;
    let resolves = 0;
    const installed = [];
    const firstResolution = new Promise(resolve => { releaseFirst = resolve; });
    const lifecycle = createChatBindingLifecycle({
        manager: {
            async resolveCurrent() {
                resolves += 1;
                if (resolves === 1) { await firstResolution; }
                return { status: 'ready', envelope: { revision: resolves }, created: false };
            },
            async retryPendingCurrent() { return { status: 'empty' }; },
            async handleChatDeleted() { return 'retained'; },
            async handleCharacterRenamed() {},
        },
        installResolvedSidecar: async envelope => { installed.push(envelope.revision); },
        events,
        eventNames,
        windowTarget,
        documentTarget,
    });

    lifecycle.start();
    while (resolves === 0) { await Promise.resolve(); }
    events.emit('chat-changed');
    releaseFirst();
    await lifecycle.refresh();

    assert.equal(resolves, 2);
    assert.deepEqual(installed, [2]);
    await lifecycle.stop();
});

test('a failed resolved-sidecar install invalidates the stale local projection', async () => {
    const events = eventTarget();
    const windowTarget = eventTarget();
    const documentTarget = eventTarget();
    let invalidations = 0;
    const errors = [];
    const lifecycle = createChatBindingLifecycle({
        manager: {
            async resolveCurrent() { return { status: 'ready', envelope: {}, created: false }; },
            async retryPendingCurrent() { return { status: 'empty' }; },
            async handleChatDeleted() { return 'retained'; },
            async handleCharacterRenamed() {},
        },
        installResolvedSidecar: async () => { throw new Error('server unavailable'); },
        invalidateSidecar: () => { invalidations += 1; },
        events,
        eventNames,
        windowTarget,
        documentTarget,
        onError: error => errors.push(error),
    });

    lifecycle.start();
    await lifecycle.refresh();
    assert.equal(invalidations, 1);
    assert.match(errors[0].message, /server unavailable/);
    await lifecycle.stop();
});
