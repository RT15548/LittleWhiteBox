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
    let pendingSave = null;
    let save = async captured => saves.push(captured.chat.map(message => message.is_system));
    let refreshes = 0;
    const controller = createHideStateController({
        getState: () => state,
        getPendingSave: () => pendingSave,
        readVectorBoundary: (...args) => read(...args),
        renderMessage: (id, hidden) => rendered.set(id, hidden),
        refresh: () => { refreshes++; },
        save: captured => save(captured),
        onError: (error, stage) => errors.push({ error, stage }),
        debounceMs: 10,
    });
    return {
        state, chat, controller, rendered, saves, errors,
        move: (sourceId, targetId) => {
            // The host swaps adjacent message objects and moves their DOM nodes;
            // is_system travels with the object, without replacing the chat array.
            assert.equal(Math.abs(sourceId - targetId), 1);
            [state.chat[sourceId], state.chat[targetId]] = [state.chat[targetId], state.chat[sourceId]];
            const sourceHidden = rendered.get(sourceId);
            rendered.set(sourceId, rendered.get(targetId));
            rendered.set(targetId, sourceHidden);
        },
        readWith: fn => { read = fn; },
        saveWith: fn => { save = fn; },
        pendingSave: promise => { pendingSave = promise; },
        visible: () => state.chat.flatMap((message, id) => message.is_system ? [] : [id]),
        refreshes: () => refreshes,
    };
}

test('automatic visibility waits through consecutive saves and uses the final boundary', async () => {
    const f = fixture();
    const first = deferred(), second = deferred();
    const initial = f.chat.map(message => message.is_system);
    f.state.enabled = false;
    f.pendingSave(first.promise);
    const updating = f.controller.reconcile();
    assert.deepEqual(f.chat.map(message => message.is_system), initial);
    assert.equal(f.saves.length, 0);
    f.pendingSave(second.promise);
    first.resolve();
    await Promise.resolve();
    assert.deepEqual(f.chat.map(message => message.is_system), initial);
    f.state.enabled = true;
    f.readWith(async () => 55);
    f.pendingSave(null);
    second.resolve();
    await updating;
    assert.equal(f.visible()[0], 52);
    assert.equal(f.saves.length, 1);
    assert.deepEqual(f.errors, []);
});

test('a save starting during a vector read discards its boundary and reads the committed one', async () => {
    const f = fixture();
    const read = deferred(), saving = deferred();
    f.readWith(() => read.promise);
    const updating = f.controller.reconcile();
    f.pendingSave(saving.promise);
    f.state.enabled = false;
    read.resolve(60);
    await Promise.resolve();
    assert.equal(f.visible()[0], 57);
    assert.equal(f.saves.length, 0);
    f.readWith(async () => 55);
    f.state.enabled = true;
    f.pendingSave(null);
    saving.resolve();
    await updating;
    assert.equal(f.visible()[0], 52);
    assert.equal(f.saves.length, 1);
    assert.deepEqual(f.errors, []);
});

test('waiting visibility work cannot outlive cancellation, replacement or a chat reload', async () => {
    for (const action of ['cancel', 'replace', 'switch', 'reload']) {
        const f = fixture();
        const saving = deferred();
        f.pendingSave(saving.promise);
        const oldChat = f.chat;
        const updating = f.controller.reconcile();
        if (action === 'switch') f.state.chatId = 'another';
        if (action === 'switch' || action === 'reload') f.state.chat = structuredClone(oldChat);
        if (action === 'cancel') f.controller.cancel();
        let replacement;
        if (action === 'replace') {
            f.state.enabled = false;
            replacement = f.controller.reconcile();
        }
        f.pendingSave(null);
        saving.resolve();
        await Promise.all([updating, replacement]);
        assert.equal(f.saves.length, action === 'replace' ? 1 : 0);
        assert.equal(oldChat.filter(message => message.is_system).length, action === 'replace' ? 0 : 57);
        assert.deepEqual(f.errors, []);
    }
});

test('clear restores immediately during saving; teardown may persist it but a chat switch may not', async () => {
    for (const switchChat of [false, true]) {
        const f = fixture();
        const saving = deferred();
        f.pendingSave(saving.promise);
        const clearing = f.controller.clear();
        assert.equal(f.visible().length, f.chat.length);
        assert.equal(f.saves.length, 0);
        f.controller.cancel(); // Teardown cancels projections, not the restoration's save.
        if (switchChat) f.state.chatId = 'another';
        f.pendingSave(null);
        saving.resolve();
        await clearing;
        assert.equal(f.saves.length, switchChat ? 0 : 1);
        assert.deepEqual(f.errors, []);
    }
});

test('ordinary tail edits inspect only edited visibility flags, including after a reorder was reconciled', async () => {
    for (const reorder of [false, true]) {
        const f = fixture({ length: 1000, hiddenThrough: 995, summaryBoundary: 899, vectorBoundary: 999 });
        await f.controller.reconcile();
        if (reorder) {
            f.move(996, 995);
            await f.controller.reconcile({ full: false, messageId: 995 });
        }
        const savedBeforeEditing = f.saves.length;
        const inspected = new Set();
        for (const [id, message] of f.chat.entries()) {
            let hidden = message.is_system;
            Object.defineProperty(message, 'is_system', {
                enumerable: true,
                get() { inspected.add(id); return hidden; },
                set(value) { hidden = value; },
            });
        }
        for (const messageId of [998, 999]) {
            f.chat[messageId].mes = `edited ${messageId}`;
            f.controller.cancel({ resetProjection: false });
            await f.controller.reconcile({ full: false, messageId });
        }
        // References may be checked for order; unrelated visibility flags must not be re-audited.
        assert.deepEqual([...inspected], [998, 999]);
        assert.equal(f.saves.length, savedBeforeEditing);
        assert.equal(f.chat[998].mes, 'edited 998');
        assert.equal(f.chat[999].mes, 'edited 999');
    }
});

test('an edit repairs its visibility and moving boundary, saving the resulting state once', async () => {
    const f = fixture();
    await f.controller.reconcile();
    f.chat[59].is_system = true;
    f.rendered.set(59, true);
    f.chat[59].mes = 'edited second-to-last message';
    f.readWith(async () => 58);
    f.controller.cancel({ resetProjection: false });
    await f.controller.reconcile({ full: false, messageId: 59 });
    assert.deepEqual(f.visible(), [55, 56, 57, 58, 59, 60]);
    assert.equal(f.rendered.get(59), false);
    assert.equal(f.chat[59].mes, 'edited second-to-last message');
    assert.equal(f.saves.length, 1);
    f.controller.cancel({ resetProjection: false });
    await f.controller.reconcile({ full: false, messageId: 59 });
    assert.equal(f.saves.length, 1);
});

test('saving a message moved from 57 to 56 restores every floor from 52 through 60', async () => {
    const f = fixture();
    await f.controller.reconcile();
    const moved = f.chat[57];
    const displaced = f.chat[56];
    f.move(57, 56);
    f.chat[56].mes = 'edited after moving up';
    f.readWith(async () => 55);
    f.controller.cancel({ resetProjection: false });
    await f.controller.reconcile({ full: false, messageId: 56 });

    const expected = Array.from({ length: 61 }, (_, id) => id <= 51);
    assert.equal(f.state.chat, f.chat);
    assert.equal(f.chat[56], moved);
    assert.equal(f.chat[57], displaced);
    assert.equal(f.chat[56].mes, 'edited after moving up');
    assert.deepEqual(f.visible(), [52, 53, 54, 55, 56, 57, 58, 59, 60]);
    assert.deepEqual([...f.rendered.values()], expected);
    assert.deepEqual(f.saves, [expected]);
    await f.controller.reconcile({ full: false, messageId: 56 });
    assert.equal(f.saves.length, 1);
});

test('reorders repair both sides of the hidden boundary, including repeated moves and background reconciliation', async () => {
    for (const { moves, messageId } of [
        { moves: [[57, 56]], messageId: 56 },
        { moves: [[56, 57]], messageId: 57 },
        { moves: [[58, 57], [57, 56], [56, 55]], messageId: 55 },
        { moves: [[55, 56], [56, 57], [57, 58]], messageId: 58 },
        { moves: [[57, 56]], messageId: undefined },
        // A different edit must not endorse an unnoticed earlier reorder.
        { moves: [[57, 56]], messageId: 60 },
    ]) {
        const f = fixture();
        await f.controller.reconcile();
        for (const [sourceId, targetId] of moves) f.move(sourceId, targetId);
        f.controller.cancel({ resetProjection: false });
        await f.controller.reconcile({ full: false, messageId });
        const expected = Array.from({ length: 61 }, (_, id) => id <= 56);
        assert.deepEqual(f.chat.map(message => message.is_system), expected);
        assert.deepEqual([...f.rendered.values()], expected);
        assert.deepEqual(f.saves, [expected]);
    }
});

test('reordering during a boundary read discards its result and the next reconciliation repairs visibility', async () => {
    const f = fixture();
    await f.controller.reconcile();
    const boundary = deferred();
    f.readWith(() => boundary.promise);
    const pending = f.controller.reconcile({ full: false, messageId: 57 });
    f.move(57, 56);
    const afterMove = f.chat.map(message => message.is_system);
    boundary.resolve(55);
    await pending;
    assert.deepEqual(f.chat.map(message => message.is_system), afterMove);
    assert.deepEqual([...f.rendered.values()], afterMove);
    assert.equal(f.saves.length, 0);
    assert.equal(f.refreshes(), 0);

    f.readWith(async () => 55);
    await f.controller.reconcile({ full: false, messageId: 56 });
    const expected = Array.from({ length: 61 }, (_, id) => id <= 51);
    assert.deepEqual(f.chat.map(message => message.is_system), expected);
    assert.deepEqual([...f.rendered.values()], expected);
    assert.deepEqual(f.saves, [expected]);
});

test('edit cancellation revokes old projections while chat changes and error recovery still audit fully', async () => {
    const f = fixture();
    await f.controller.reconcile();
    const pendingBoundary = deferred();
    f.readWith(() => pendingBoundary.promise);
    const stale = f.controller.reconcile({ full: false, messageId: 59 });
    f.controller.cancel({ resetProjection: false });
    f.readWith(async () => 58);
    await f.controller.reconcile({ full: false, messageId: 59 });
    pendingBoundary.resolve(60);
    await stale;
    assert.deepEqual(f.visible(), [55, 56, 57, 58, 59, 60]);

    f.state.chatId = 'new-chat';
    f.state.chat = Array.from({ length: 61 }, () => ({ is_system: true }));
    f.controller.cancel();
    await f.controller.reconcile({ full: false, messageId: 59 });
    assert.deepEqual(f.visible(), [55, 56, 57, 58, 59, 60]);
    f.state.chat[60].is_system = true;
    await f.controller.clear();
    assert.equal(f.visible().length, 61);
});

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
