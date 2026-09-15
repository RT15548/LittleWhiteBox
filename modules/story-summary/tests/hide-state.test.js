import assert from 'node:assert/strict';
import test from 'node:test';
import { createHideStateController } from '../hide-state.js';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

function fixture({ length = 61, hiddenThrough = 56, summaryBoundary = 49, vectorBoundary = 60 } = {}) {
    const chat = Array.from({ length }, (_, id) => ({ is_system: id <= hiddenThrough }));
    const state = { chatId: 'test', chat, enabled: true, summaryBoundary, useVectorBoundary: true, keepVisibleCount: 4 };
    const rendered = new Map(chat.map((message, id) => [id, message.is_system]));
    const saves = [];
    const errors = [];
    let read = async () => vectorBoundary;
    let save = async captured => saves.push(captured.chat.map(message => message.is_system));
    let refreshes = 0;
    const controller = createHideStateController({
        getState: () => state,
        readVectorBoundary: (...args) => read(...args),
        renderMessage: (id, hidden) => rendered.set(id, hidden),
        refresh: () => { refreshes++; },
        save: captured => save(captured),
        onError: (error, stage) => errors.push({ error, stage }),
        debounceMs: 10,
    });
    return {
        state, chat, controller, rendered, saves, errors,
        readWith: fn => { read = fn; },
        saveWith: fn => { save = fn; },
        visible: () => state.chat.flatMap((message, id) => message.is_system ? [] : [id]),
        refreshes: () => refreshes,
    };
}

test('deleting below a stale vector boundary keeps the configured tail and saves only the final state', async () => {
    const f = fixture();
    await f.controller.reconcile();
    assert.equal(f.saves.length, 0);
    f.chat.length = 56;
    await f.controller.reconcile();
    assert.deepEqual(f.visible(), [52, 53, 54, 55]);
    assert.deepEqual([...f.rendered].filter(([id, hidden]) => id < 56 && !hidden).map(([id]) => id), f.visible());
    assert.equal(f.saves.length, 1);
    assert.deepEqual(f.saves[0], Array.from({ length: 56 }, (_, id) => id <= 51));
    assert.equal(f.refreshes(), 1);
    await f.controller.reconcile();
    assert.equal(f.saves.length, 1, 'unchanged visibility does not save again');
});

test('loading already-aligned metadata repairs persisted all-hidden flags', async () => {
    const f = fixture({ length: 56, hiddenThrough: 55, vectorBoundary: 55 });
    await f.controller.reconcile();
    assert.deepEqual(f.visible(), [52, 53, 54, 55]);
    assert.equal(f.saves.length, 1);
});

test('failed vector reads restore to the valid summary boundary instead of retaining stale hiding', async () => {
    const f = fixture({ length: 56, hiddenThrough: 55 });
    f.readWith(async () => { throw new Error('read failed'); });
    await f.controller.reconcile();
    assert.deepEqual(f.visible(), Array.from({ length: 10 }, (_, i) => i + 46));
    assert.equal(f.errors[0].stage, 'boundary');
    assert.equal(f.saves.length, 1);
});

test('no summary, invalid summary, disabled hiding and empty chats do not retain automatic hiding', async () => {
    for (const patch of [{ summaryBoundary: -1 }, { enabled: false }, { chat: [] }]) {
        const f = fixture();
        Object.assign(f.state, patch);
        f.readWith(() => { throw new Error('must not read vectors'); });
        await f.controller.reconcile();
        assert.equal(f.state.chat.some(message => message.is_system), false);
        assert.deepEqual(f.errors, []);
    }
});

test('zero visible floors is intentional; a reserve larger than the chat hides nothing', async () => {
    const f = fixture({ length: 3, summaryBoundary: 1 });
    await f.controller.reconcile();
    assert.deepEqual(f.visible(), [0, 1, 2]);
    f.state.keepVisibleCount = 0;
    await f.controller.reconcile();
    assert.deepEqual(f.visible(), []);
    f.state.useVectorBoundary = false;
    await f.controller.reconcile();
    assert.deepEqual(f.visible(), [2]);
});

test('ordinary boundary changes can shrink as well as grow without leaving hidden tail messages', async () => {
    const f = fixture();
    await f.controller.reconcile();
    f.readWith(async () => 52);
    await f.controller.reconcile({ full: false });
    assert.equal(f.visible()[0], 49);
    f.chat.push({ is_system: true }, { is_system: true });
    f.readWith(async () => 62);
    await f.controller.reconcile({ full: false });
    assert.deepEqual(f.visible(), [59, 60, 61, 62]);
});

test('clear restores every message immediately and revokes an in-flight read, including failed reads', async () => {
    for (const fail of [false, true]) {
        const f = fixture();
        const boundary = deferred();
        const saving = deferred();
        f.readWith(() => boundary.promise);
        const pending = f.controller.reconcile();
        f.saveWith(() => saving.promise);
        const clearing = f.controller.clear();
        assert.equal(f.visible().length, 61, 'restoration does not wait for saving');
        if (fail) boundary.reject(new Error('late read failure'));
        else boundary.resolve(60);
        await pending;
        assert.equal(f.visible().length, 61);
        assert.deepEqual(f.errors, [], 'cancelled work cannot report stale errors');
        saving.resolve();
        await clearing;
    }
});

test('clear cancels a pending debounce and disabled background work cannot re-hide', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const f = fixture();
    f.controller.schedule();
    await f.controller.clear();
    t.mock.timers.tick(20);
    await Promise.resolve();
    assert.equal(f.visible().length, 61);
    f.state.enabled = false;
    f.controller.schedule();
    t.mock.timers.tick(20);
    await Promise.resolve();
    assert.equal(f.visible().length, 61);
    assert.equal(f.saves.length, 1);
});

test('late results cannot overwrite a newer range or another chat', async () => {
    for (const switchChat of [false, true]) {
        const f = fixture();
        const old = deferred();
        f.readWith(() => old.promise);
        const pending = f.controller.reconcile();
        if (switchChat) {
            f.state.chatId = 'another';
            f.state.chat = Array.from({ length: 56 }, () => ({ is_system: false }));
        } else f.chat.length = 56;
        f.readWith(async () => 55);
        await f.controller.reconcile();
        old.resolve(60);
        await pending;
        assert.deepEqual(f.visible(), [52, 53, 54, 55]);
        assert.equal(f.saves.length, 1);
    }
});

test('changing the chat or hide settings during a read discards that result even without a newer request', async () => {
    for (const change of [f => { f.chat.length = 56; }, f => { f.state.enabled = false; }, f => { f.state.chatId = 'another'; }]) {
        const f = fixture();
        const read = deferred();
        f.readWith(() => read.promise);
        const pending = f.controller.reconcile();
        change(f);
        read.resolve(60);
        await pending;
        assert.equal(f.saves.length, 0);
        assert.equal(f.refreshes(), 0);
    }
});

test('save failure is reported without reverting restored visibility', async () => {
    const f = fixture();
    f.saveWith(async () => { throw new Error('save failed'); });
    await f.controller.clear();
    assert.equal(f.visible().length, 61);
    assert.equal(f.errors[0].stage, 'save');
});

test('chat-disable can include immediate restoration in its own metadata save without a duplicate write', async () => {
    const f = fixture();
    await f.controller.reconcile();
    // Clear means ALL hidden floors, including a host-hidden message outside
    // the automatic range established by the preceding reconciliation.
    f.chat[60].is_system = true;
    f.rendered.set(60, true);
    const clearing = f.controller.clear({ persist: false });
    assert.equal(f.visible().length, 61);
    assert.equal([...f.rendered.values()].some(Boolean), false);
    await clearing;
    assert.equal(f.saves.length, 0);
});
