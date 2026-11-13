import assert from 'node:assert/strict';
import test from 'node:test';
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

test('a slot with another successful version only loses the deleted one', async t => {
    const h = await setup(t, { versions: ['img-a', 'img-b'] });
    const card = h.body(0).querySelector('.xb-nd-img');
    const result = await h.api.deleteCardImageVersion(card);
    assert.equal(result.retained, null);
    assert.deepEqual(result.remaining.map(item => item.imgId), ['img-a']);
    assert.equal(await h.api.getPreview('img-b'), undefined);
    assert.equal((await h.api.getPreview('img-a')).status, 'success');
});