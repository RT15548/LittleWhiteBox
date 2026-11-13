import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (cost: deleting a good image / paid input by mistake):
// - "移除同层" removes only this floor's failed/unavailable slots, never a successful image or another floor.
// - Declining the confirmation changes nothing; it never submits a drawing request.
const PNG = 'UEFJRA==';

async function setup(t, { failed = ['f1', 'f2'] } = {}) {
    const source = [...failed, 'ok'].map(id => `[image:${id}]`).join('\n');
    const h = await fixture(['[image:other-floor]', source], { sources: ['slot-activity.js'] });
    t.after(() => h.stop());
    for (const slotId of failed) {
        await h.api.storePreview({ imgId: `${slotId}-img`, slotId, messageId: 1, chatId: h.ctx.chatId,
            tags: 'portrait', status: 'failed', errorType: 'x', errorMessage: 'y',
            characterPrompts: [{ name: 'A', prompt: 'p', uc: '' }] });
        await h.api.setSlotSelection(slotId, `${slotId}-img`);
    }
    await h.api.storePreview({ imgId: 'ok-img', slotId: 'ok', messageId: 1, chatId: h.ctx.chatId,
        tags: 'good', base64: PNG, status: 'success' });
    await h.api.setSlotSelection('ok', 'ok-img');
    await h.api.storePreview({ imgId: 'other-img', slotId: 'other-floor', messageId: 0, chatId: h.ctx.chatId,
        tags: 'other', status: 'failed', errorType: 'x', errorMessage: 'y' });
    await h.api.setSlotSelection('other-floor', 'other-img');
    h.start(); await h.pump(10);
    return h;
}

const failedCards = h => [...h.body(1).querySelectorAll('.xb-nd-img[data-state="failed"]')];

test('removes every failed slot on the floor, keeps the successful image and other floors', async t => {
    const h = await setup(t);
    assert.equal(failedCards(h).length, 2);
    const result = await h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: () => true });
    await h.pump(6);
    assert.deepEqual([result.removed, result.skipped, result.failed], [2, 0, 0]);
    assert.equal(h.ctx.chat[1].mes, '\n\n[image:ok]');
    assert.equal(await h.api.getPreview('f1-img'), undefined);
    assert.equal(await h.api.getPreview('f2-img'), undefined);
    assert.ok(await h.api.getPreview('ok-img'));
    assert.ok(await h.api.getPreview('other-img'));
    assert.equal(h.ctx.chat[0].mes, '[image:other-floor]');
    assert.equal(h.counters.requests.length, 0);
});

test('declining the confirmation leaves everything untouched', async t => {
    const h = await setup(t);
    const result = await h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: () => false });
    assert.equal(result.cancelled, true);
    assert.equal(h.ctx.chat[1].mes, '[image:f1]\n[image:f2]\n[image:ok]');
    assert.ok(await h.api.getPreview('f1-img'));
    assert.ok(await h.api.getPreview('f2-img'));
});

test('a slot with a running task is skipped, not removed', async t => {
    const h = await setup(t);
    const cards = failedCards(h);
    h.api.setSlotActivity('f2', { index: 0, total: 1, phase: 'generating', label: 'x', owner: 'test' });
    const result = await h.api.removeFloorFailedImageCards(cards[0], { confirmRemoval: () => true });
    assert.deepEqual([result.removed, result.skipped], [1, 1]);
    assert.equal(h.ctx.chat[1].mes, '\n[image:f2]\n[image:ok]');
    assert.ok(await h.api.getPreview('f2-img'));
});
test('a failed card that still has an earlier successful version is skipped, so the old image survives', async t => {
    const h = await setup(t);
    await h.api.storePreview({ imgId: 'f1-old', slotId: 'f1', messageId: 1, chatId: h.ctx.chatId,
        tags: 'old', base64: PNG, status: 'success' });
    const cards = failedCards(h);
    const result = await h.api.removeFloorFailedImageCards(cards[0], { confirmRemoval: () => true });
    assert.deepEqual([result.removed, result.skipped], [1, 1]);
    assert.ok(await h.api.getPreview('f1-old'));
    assert.ok(await h.api.getPreview('f1-img'));
    assert.equal(await h.api.getPreview('f2-img'), undefined);
});

test('a floor being edited is refused without asking and nothing is removed', async t => {
    const h = await setup(t);
    const mes = h.body(1).closest('.mes');
    const area = mes.ownerDocument.createElement('textarea');
    area.className = 'edit_textarea';
    mes.append(area);
    let asked = false;
    const result = await h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: () => { asked = true; return true; } });
    assert.equal(asked, false);
    assert.equal(result.removed, 0);
    assert.ok(await h.api.getPreview('f1-img'));
});

test('a second click joins the running removal instead of starting another one', async t => {
    const h = await setup(t);
    const cards = failedCards(h);
    let asked = 0;
    const confirmRemoval = () => { asked += 1; return true; };
    const first = h.api.removeFloorFailedImageCards(cards[0], { confirmRemoval });
    const second = h.api.removeFloorFailedImageCards(cards[1], { confirmRemoval });
    assert.equal(first, second);
    await first;
    assert.equal(asked, 1);
});