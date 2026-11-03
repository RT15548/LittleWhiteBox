import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBIndex } from 'fake-indexeddb';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (cost: ineffective actions / lost paid data / corrupt other chats):
// - Confirmation removes source, portable metadata and UI immediately, before any await.
// - Removal never saves the chat itself; the host's autosave carries the edit.
// - Failed local withdrawal cannot silently reattach the explicitly removed slot.
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

test('removal is immediate, never saves the chat, and deletes the stored record', async t => {
    const h = await setup(t);
    h.ctx.chat[0].extra = { xiaobaixDrawSaved: { 'remove-me': { imgId: 'input', savedUrl: '/saved.png' } } };
    const operation = remove(h);
    assert.equal(h.ctx.chat[0].extra.xiaobaixDrawSaved, undefined);
    await operation; await h.pump(6);
    assert.equal(h.body(0).querySelector('.xb-nd-img'), null);
    assert.equal(await h.api.getPreview('input'), undefined);
    assert.equal(h.counters.saves, 0);
});
test('reload before the host saves leaves a removable card, never a new request', async t => {
    const h = await setup(t);
    await remove(h); await h.pump(6);
    h.ctx.chat[0] = structuredClone(h.persisted()[0]); h.body(0).textContent = h.ctx.chat[0].mes;
    await h.emit('CHAT_CHANGED'); await h.pump(8);
    assert.equal(h.ctx.chat[0].mes, 'before\n[image:remove-me]\nafter');
    assert.ok(h.body(0).querySelector('.xb-nd-img'));
    await remove(h);
    assert.equal(h.counters.requests.length, 0);
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
