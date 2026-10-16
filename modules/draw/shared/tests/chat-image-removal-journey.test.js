import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBIndex } from 'fake-indexeddb';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (cost: ineffective actions / lost paid data / corrupt other chats):
// - Confirmation removes source and UI immediately, even with a held save/lock/readback.
// - Save failure is reported without restoring the card or deleting its stored data.
// - Failed local withdrawal cannot silently reattach the explicitly removed slot.
// - Navigation during background work must not save the newly opened chat.
// - Portable image metadata leaves with the slot in the same confirmed chat save.
async function setup(t, options = {}) {
    const h = await fixture(['before\n[image:remove-me]\nafter'], options);
    t.after(() => h.stop());
    await h.api.storePreview({ imgId: 'input', slotId: 'remove-me', messageId: 0,
        chatId: h.ctx.chatId, tags: 'never submitted', status: 'ungenerated' });
    h.start(); await h.pump(6);
    assert.ok(h.body(0).querySelector('.xb-nd-img'));
    return h;
}

function remove(h) {
    const operation = h.api.removeChatImageSlot(h.body(0).querySelector('.xb-nd-img'));
    // Deliberately before any await: neither IndexedDB nor a network/lock can
    // be part of acknowledgement. Final-state-only assertions missed this bug.
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    assert.equal(h.ctx.chat[0].mes, 'before\n\nafter');
    assert.equal(h.ctx.chat[0].swipes[0], h.ctx.chat[0].mes);
    assert.equal(h.counters.requests.length, 0);
    return operation;
}

for (const outcome of ['ok', 'read-fail']) test(`ungenerated removal is immediate and stays removed through a held ${outcome} save`, async t => {
    const h = await setup(t); h.setMode('hold');
    const operation = remove(h).then(() => null, error => error);
    await h.pump(6);
    assert.equal(h.counters.saves, 1);
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    assert.ok(await h.api.getPreview('input')); // Cleanup cannot race confirmation.
    h.setMode(outcome); h.releaseSave();
    const error = await operation;
    assert.equal(Boolean(error), outcome !== 'ok');
    if (error) assert.ok(error.cause);
    await h.pump(6);
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    assert.equal(Boolean(await h.api.getPreview('input')), outcome !== 'ok');
});

test('another save holding the mutation lock cannot delay visible removal', async t => {
    const h = await setup(t);
    let release;
    const previous = h.api.withConfirmableChatMutation(h.ctx, () => new Promise(resolve => { release = resolve; }));
    await h.settle();
    const operation = remove(h);
    await h.pump(6);
    assert.equal(h.counters.saves, 0);
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    release(); await previous; await operation;
    assert.equal(h.counters.saves, 1);
    assert.equal(h.persisted()[0].mes, h.ctx.chat[0].mes);
});

test('readback can remain pending without a visible card; metadata uses the same single save', async t => {
    const h = await setup(t);
    h.ctx.chat[0].extra = { xiaobaixDrawSaved: { 'remove-me': { imgId: 'input', savedUrl: '/saved.png' } } };
    let release;
    const hold = new Promise(resolve => { release = resolve; });
    globalThis.fetch = async () => { await hold; return { ok: true, json: async () => structuredClone(h.persisted()) }; };
    const operation = remove(h);
    assert.equal(h.ctx.chat[0].extra.xiaobaixDrawSaved, undefined);
    await h.pump(6);
    assert.equal(h.counters.saves, 1);
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    assert.equal(h.persisted()[0].extra.xiaobaixDrawSaved, undefined);
    assert.ok(await h.api.getPreview('input'));
    release(); await operation;
    assert.equal(h.counters.saves, 1);
    assert.equal(await h.api.getPreview('input'), undefined);
});

test('switching roles with the same filename during queued removal cannot save B or erase retained data', async t => {
    const h = await setup(t);
    Object.assign(h.ctx, { groupId: null, characterId: 0,
        characters: [{ name: 'Same', avatar: 'a.png' }, { name: 'Same', avatar: 'b.png' }] });
    let release;
    const previous = h.api.withConfirmableChatMutation(h.ctx, () => new Promise(resolve => { release = resolve; }));
    await h.settle();
    const operation = remove(h).then(() => null, error => error);
    await h.settle();
    h.ctx.chat.splice(0, 1, { mes: 'B untouched', swipe_id: 0 });
    globalThis.__drawJourneyReview.ctx = { ...h.ctx, characterId: 1 };
    h.body(0).textContent = 'B untouched';
    release(); await previous;
    assert.ok(await operation);
    assert.equal(h.counters.saves, 0);
    assert.equal(h.body(0).textContent, 'B untouched');
    assert.ok(await h.api.getPreview('input'));
});

test('a failed local withdrawal reports failure and cannot resurrect the card; a native edit can retry it', async t => {
    const h = await setup(t);
    await h.api.updatePreviewRecord('input', { placement: h.api.captureImagePlacement(
        h.api.getImageChatIdentity(h.ctx), 'before\n\nafter', 0, { mode: 'tail' }, 0) });
    const original = IDBIndex.prototype.openCursor;
    let abort = true;
    IDBIndex.prototype.openCursor = function (...args) {
        const request = original.apply(this, args);
        if (abort && this.name === 'slotId' && this.objectStore.name === 'previews') {
            abort = false;
            this.objectStore.transaction.abort();
        }
        return request;
    };
    t.after(() => { IDBIndex.prototype.openCursor = original; });
    await assert.rejects(remove(h));
    await h.pump(6);
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    assert.equal(h.counters.saves, 0);
    assert.ok((await h.api.getPreview('input')).placement);
    await assert.rejects(h.api.adoptChatImageMessage(h.ctx, 0));
    await h.emit('MESSAGE_EDITED', 0);
    assert.equal((await h.api.getPreview('input')).placement, null);
    assert.equal(await h.api.adoptChatImageMessage(h.ctx, 0), false);
});
