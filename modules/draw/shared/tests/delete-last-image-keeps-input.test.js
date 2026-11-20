import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBDatabase } from 'fake-indexeddb';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (cost: a paid image's inputs lost, redraw submitted with zero characters):
// - Deleting the last image of a slot keeps scene, characters, negatives and orientation as a failed record.
// - The placeholder card carries that record's imgId, so TAG editing and redraw read the full inputs.
// - A slot that still has another successful version is deleted normally.
const PNG = 'UEFJRA==';
const characters = [{ name: 'Alice', prompt: 'red dress', uc: 'hat', center: { x: 0.2, y: 0.5 } }];

async function setup(t, { versions = ['img-a'], chatSaved = false } = {}) {
    const h = await fixture(['[image:slot-1]'], { sources: ['slot-activity.js'] });
    t.after(() => h.stop());
    for (const [index, imgId] of versions.entries()) {
        await h.api.storePreview({ imgId, slotId: 'slot-1', messageId: 0, chatId: h.ctx.chatId,
            tags: 'portrait', positive: 'portrait', base64: chatSaved ? null : PNG, savedUrl: chatSaved ? '/user/images/a.png' : null,
            status: 'success', characterPrompts: structuredClone(characters), negativePrompt: 'scene negative',
            postPrompt: 'tail', orientation: 'portrait', title: 'T', continuityChars: [{ name: 'Alice', appear: '', costume: 'red dress', action: 'x' }] });
        if (index === versions.length - 1) await h.api.setSlotSelection('slot-1', imgId);
    }
    h.start(); await h.pump(10);
    return h;
}

test('deleting the last image keeps every input on a failed record and on the placeholder card', async t => {
    const h = await setup(t);
    const card = h.body(0).querySelector('.xb-nd-img');
    const result = await h.api.deleteCardImageVersion(card);
    assert.equal(result.retained.imgId, 'img-a');
    const record = await h.api.getPreview('img-a');
    assert.equal(record.status, 'failed');
    assert.equal(record.base64, null);
    assert.equal(record.savedUrl, null);
    assert.deepEqual(record.characterPrompts, characters);
    assert.equal(record.negativePrompt, 'scene negative');
    assert.equal(record.postPrompt, 'tail');
    assert.equal(record.orientation, 'portrait');
    assert.equal(record.title, 'T');
    assert.equal(record.continuityChars[0].costume, 'red dress');
    await h.api.renderPreviewsForMessage(0, { refreshSlotIds: ['slot-1'] }); await h.pump(10);
    const placeholder = h.body(0).querySelector('.xb-nd-img');
    assert.equal(placeholder.dataset.state, 'failed');
    assert.equal(placeholder.dataset.imgId, 'img-a');
    assert.equal(h.counters.requests.length, 0);
});

test('a chat-saved image with no cache record is restored from the chat entry, then kept as a failed record', async t => {
    const h = await setup(t, { chatSaved: true });
    h.ctx.chat[0].extra = { xiaobaixDrawSaved: { 'slot-1': { imgId: 'img-a', savedUrl: '/user/images/a.png', tags: 'portrait',
        characterPrompts: structuredClone(characters), negativePrompt: 'scene negative', orientation: 'portrait' } } };
    await h.api.deletePreview('img-a');
    const card = h.body(0).querySelector('.xb-nd-img');
    card.dataset.imgId = 'img-a';
    const result = await h.api.deleteCardImageVersion(card);
    assert.equal(result.retained.imgId, 'img-a');
    const record = await h.api.getPreview('img-a');
    assert.equal(record.status, 'failed');
    assert.deepEqual(record.characterPrompts, characters);
    // The chat's portable entry must go too, or its savedUrl renders the slot as an image again.
    assert.equal(h.ctx.chat[0].extra.xiaobaixDrawSaved, undefined);
    await h.api.renderPreviewsForMessage(0, { refreshSlotIds: ['slot-1'] }); await h.pump(10);
    assert.equal(h.body(0).querySelector('.xb-nd-img').dataset.state, 'failed');
});

test('a changed source is reported, never silently deleted', async t => {
    const h = await setup(t, { chatSaved: true });
    h.ctx.chat[0].extra = { xiaobaixDrawSaved: { 'slot-1': { imgId: 'img-a', savedUrl: '/user/images/a.png', tags: 'portrait' } } };
    await h.api.deletePreview('img-a');
    const card = h.body(0).querySelector('.xb-nd-img');
    card.dataset.imgId = 'img-a';
    h.ctx.chat[0].mes = 'the slot marker is gone';
    await assert.rejects(h.api.deleteCardImageVersion(card));
    assert.ok(h.ctx.chat[0].extra.xiaobaixDrawSaved);
});

test('a silent save failure preserves the paid version and the same card can retry without reloading', async t => {
    const h = await setup(t, { chatSaved: true });
    const card = h.body(0).querySelector('.xb-nd-img');
    await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview('img-a'));
    h.setMode('ignore');
    await assert.rejects(h.api.deleteCardImageVersion(card), { message: h.api.DRAW_SLOT_COPY.deleteSaveFailed });
    for (const message of [h.ctx.chat[0], h.persisted()[0]]) {
        assert.equal(h.api.getDrawSavedEntry(message, 'slot-1').savedUrl, '/user/images/a.png');
    }
    assert.equal((await h.api.getPreview('img-a')).status, 'success');
    h.setMode('ok');
    const unreachable = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
    await assert.rejects(h.api.deleteCardImageVersion(card), { message: h.api.DRAW_SLOT_COPY.deleteUnconfirmed });
    assert.equal(h.api.getDrawSavedEntry(h.persisted()[0], 'slot-1'), null);
    assert.equal((await h.api.getPreview('img-a')).status, 'success');
    unreachable.mock.restore();
    await h.api.deleteCardImageVersion(card);
    assert.equal(h.api.getDrawSavedEntry(h.persisted()[0], 'slot-1'), null);
    assert.deepEqual((await h.api.getPreview('img-a')).characterPrompts, characters);
});

test('a cached card whose slot vanished must keep its paid image', async t => {
    const h = await setup(t);
    const card = h.body(0).querySelector('.xb-nd-img');
    h.ctx.chat[0].mes = 'changed';
    await assert.rejects(h.api.deleteCardImageVersion(card));
    assert.equal((await h.api.getPreview('img-a')).base64, PNG);
    // Management deletes the gallery record by ID without editing any reply.
    h.ctx.chat[0].swipes.push('[image:slot-1]');
    await h.api.captureGalleryDeletion()('img-a');
    assert.equal(await h.api.getPreview('img-a'), undefined);
    assert.deepEqual(h.ctx.chat[0].swipes, ['[image:slot-1]', '[image:slot-1]']);
});

test('a slot with another successful version only loses the deleted one', async t => {
    const h = await setup(t, { versions: ['img-a', 'img-b'] });
    const card = h.body(0).querySelector('.xb-nd-img');
    const result = await h.api.deleteCardImageVersion(card);
    assert.equal(result.retained, null);
    assert.deepEqual(result.remaining.map(item => item.imgId), ['img-a']);
    assert.equal(await h.api.getPreview('img-b'), undefined);
    assert.equal((await h.api.getPreview('img-a')).status, 'success');
});

test('a renamed chat can delete from its own card and still keep its redraw inputs', async t => {
    const h = await setup(t, { chatSaved: true });
    await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview('img-a'));
    h.ctx.chatId = 'another-chat';
    await h.api.deleteCardImageVersion(h.body(0).querySelector('.xb-nd-img'));
    assert.deepEqual((await h.api.getPreview('img-a')).characterPrompts, characters);
    assert.equal((await h.api.getPreview('img-a')).status, 'failed');
    assert.equal(h.api.getDrawSavedEntry(h.persisted()[0], 'slot-1'), null);
});

test('a late upload cannot write a saved URL onto a deleted version', async t => {
    const h = await setup(t);
    await h.api.deleteCardImageVersion(h.body(0).querySelector('.xb-nd-img'));
    await h.api.updatePreviewSavedUrl('img-a', '/late.png');
    assert.equal((await h.api.getPreview('img-a')).savedUrl, null);
});

test('gallery deletion needs neither the original chat nor a chat lookup, for single and bulk deletes', async t => {
    const h = await fixture(['detached']);
    t.after(() => h.stop());
    Object.assign(h.ctx, { groupId: null, characterId: 0, chatId: 'Friday',
        characters: [{ name: 'Alice', avatar: 'Alice.png' }, { name: 'Bob', avatar: 'Bob.png' }] });
    h.start();
    const store = (imgId, placement) => h.api.storePreview({ imgId, slotId: imgId, messageId: 0,
        chatId: h.ctx.chatId, base64: PNG, tags: 'portrait', placement });
    await store('detached', { owner: h.api.getImageChatIdentity(h.ctx), swipeIndex: 0 });
    await store('older');
    await h.api.clearPreviewPlacements(h.api.getImageChatIdentity(h.ctx), ['detached']);
    h.ctx.characterId = 1;
    await store('bobs-image');
    const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Gallery-only deletion must not read chats'); });
    await h.api.captureGalleryDeletion()('detached');
    assert.equal(await h.api.getPreview('detached'), undefined);
    assert.deepEqual(await h.api.deleteGallerySelection(['older']), { deletedIds: ['older'], failures: [] });
    assert.equal(await h.api.getPreview('older'), undefined);
    assert.equal((await h.api.getPreview('bobs-image')).base64, PNG);
    assert.equal(fetch.mock.callCount(), 0);
    assert.equal(h.counters.saves, 0);
});

test('one batch saves and checks the chat once, keeps failed writes retryable and never selects another checked version', async t => {
    const h = await fixture(['[image:first] [image:second]']);
    t.after(() => h.stop());
    for (const [imgId, slotId] of [['older', 'first'], ['a', 'first'], ['b', 'second']]) {
        await h.api.storePreview({ imgId, slotId, messageId: 0, savedUrl: '/' + imgId + '.png', tags: imgId });
        await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview(imgId));
    }
    const ids = ['a', 'older', 'b'];
    const read = t.mock.method(globalThis, 'fetch', globalThis.fetch);
    const saves = h.counters.saves;
    h.setMode('ignore');
    assert.equal((await h.api.deleteGallerySelection(ids)).failures.some(f => f.id === 'a'), true);
    for (const [id, slot] of [['a', 'first'], ['b', 'second']]) {
        assert.equal((await h.api.getPreview(id)).savedUrl, '/' + id + '.png');
        assert.equal(h.api.getDrawSavedEntry(h.ctx.chat[0], slot).imgId, id);
    }
    h.setMode('ok');
    const left = [];
    for (const id of ids) if ((await h.api.getPreview(id))?.savedUrl) left.push(id);
    assert.deepEqual((await h.api.deleteGallerySelection(left)).deletedIds, left);
    assert.equal(h.counters.saves - saves, 2);
    assert.equal(read.mock.callCount(), 2);
    for (const slot of ['first', 'second']) {
        assert.equal(h.api.getDrawSavedEntry(h.persisted()[0], slot), null);
        assert.equal((await h.api.getPreviewsBySlot(slot)).some(h.api.hasPreviewImage), false);
    }
});

test('switching swipe on deletion commit leaves the original branch consistently deleted', async t => {
    const h = await setup(t, { chatSaved: true });
    const message = h.ctx.chat[0];
    await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview('img-a'));
    const transaction = IDBDatabase.prototype.transaction;
    let switched = false;
    t.mock.method(IDBDatabase.prototype, 'transaction', function (...args) {
        const tx = transaction.apply(this, args);
        if (!switched && args[1] === 'readwrite' && tx.objectStoreNames.contains('previews')) {
            tx.addEventListener('complete', () => { switched = true; message.swipe_id = 1; }, { once: true });
        }
        return tx;
    });
    await h.api.deleteCardImageVersion(h.body(0).querySelector('.xb-nd-img'));
    assert.ok(switched);
    message.swipe_id = 0;
    assert.equal(h.api.getDrawSavedEntry(message, 'slot-1'), null);
    assert.equal((await h.api.getPreview('img-a')).status, 'failed');
    assert.equal(h.persisted()[0].extra?.xiaobaixDrawSaved, undefined);
});
