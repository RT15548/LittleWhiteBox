import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (cost: deleting a good image / paid input by mistake):
// - "移除同层" removes only this floor's failed/unavailable slots, never a successful image or another floor.
// - Declining the confirmation changes nothing; it never submits a drawing request.
const PNG = 'UEFJRA==';

async function setup(t, { failed = ['f1', 'f2'], withJournal = false, sources = [], stubs = {} } = {}) {
    const source = [...failed, 'ok'].map(id => `[image:${id}]`).join('\n');
    const h = await fixture(['[image:other-floor]', source], { sources: ['slot-activity.js', ...(withJournal ? ['pending-image-jobs.js'] : []), ...sources],
        stubs: { ...(withJournal ? { 'pending-image-jobs.js': null } : {}), ...stubs } });
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
    assert.equal(h.persisted()[1].mes, h.ctx.chat[1].mes);
    assert.equal(await h.api.getPreview('f1-img'), undefined);
    assert.equal(await h.api.getPreview('f2-img'), undefined);
    assert.ok(await h.api.getPreview('ok-img'));
    assert.ok(await h.api.getPreview('other-img'));
    assert.equal(h.ctx.chat[0].mes, '[image:other-floor]');
    assert.equal(h.counters.requests.length, 0);
});

test('a silent host save failure keeps the saved floor and its redraw inputs intact', async t => {
    const h = await setup(t);
    h.setMode('ignore');
    const result = await h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: () => true });
    assert.equal(result.removed, 0);
    assert.equal(result.failed, 2);
    assert.ok(h.persisted()[1].mes.includes('[image:f1]'));
    assert.ok((await h.api.getPreview('f1-img')).tags);
});

test('floor clicks keep admission order across slow preparation and release the next floor after failure', async t => {
    const h = await setup(t);
    const a = failedCards(h)[0];
    // The viewport only mounts the latest floor; mount the older interactive card for this two-floor journey.
    const body = h.body(0);
    const b = a.cloneNode(true);
    Object.assign(b.dataset, { mesid: '0', slotId: 'other-floor', imgId: 'other-img' });
    body.replaceChildren(b);
    const order = [];
    h.api.registerPreparedImageProvider('order-probe', async ({ messageId }) => {
        order.push(messageId);
        if (messageId === 1) throw new Error('storage full');
    });
    const batchA = h.api.redrawFloorFailedImageCards('order-probe', a);
    const batchB = h.api.redrawFloorFailedImageCards('order-probe', b);
    await Promise.all([assert.rejects(batchA, /storage full/), batchB]);
    assert.deepEqual(order, [1, 0]);
});

test('restoring a queued floor to a paid version cancels its purchase', async t => {
    const h = await setup(t);
    await h.api.storePreview({ imgId: 'paid', slotId: 'other-floor', messageId: 0, base64: PNG });
    const a = failedCards(h)[0], b = a.cloneNode(true);
    Object.assign(b.dataset, { mesid: '0', slotId: 'other-floor', imgId: 'other-img' });
    h.body(0).replaceChildren(b);
    const calls = [], hold = Promise.withResolvers();
    h.api.registerPreparedImageProvider('restore-probe', async ({ messageId }) => { calls.push(messageId); await hold.promise; });
    const first = h.api.redrawFloorFailedImageCards('restore-probe', a);
    const second = h.api.redrawFloorFailedImageCards('restore-probe', b);
    try { assert.equal(await h.api.restoreImageCard(b), true); }
    finally { hold.resolve(); }
    await Promise.all([first, second]);
    assert.deepEqual(calls, [1]);
});

test('a queued floor can cancel before A finishes; a later click still waits for A', async t => {
    const h = await setup(t, { withJournal: true, sources: ['image-card-redraw-provider.js', 'floor-image-job.js', 'draw-run-controls.js'],
        stubs: { 'script.js': 'export const getRequestHeaders=()=>({});export const messageFormatting=t=>t;' } });
    const a = failedCards(h)[0], b = a.cloneNode(true);
    Object.assign(b.dataset, { mesid: '0', slotId: 'other-floor', imgId: 'other-img' });
    h.body(0).replaceChildren(b);
    const jobs = new Map(), calls = [], hold = Promise.withResolvers(), started = Promise.withResolvers();
    h.api.registerPreparedImageProvider('cancellable', async ({ messageId }) => {
        calls.push(messageId);
        if (messageId === 1) { started.resolve(); await hold.promise; }
    }, h.api.createImageCardRedrawProvider({ getCurrentContext: () => h.ctx, setStateForMessage() {},
        createJob: (id, opts) => h.api.acquireFloorImageJob(jobs, h.ctx, id,
            () => ({ controller: new AbortController(), backendCancel: new AbortController() }), opts),
        releaseJob: job => h.api.releaseFloorImageJob(jobs, job) }));
    const first = h.api.redrawFloorFailedImageCards('cancellable', a);
    await started.promise;
    const second = h.api.redrawFloorFailedImageCards('cancellable', b);
    const queued = h.api.getFloorImageJobs(jobs, h.ctx, 0);
    try {
        assert.equal(queued.length, 1);
        assert.equal(await h.api.cancelFloorDrawWork(0, { jobs: queued, recordsLoader: async () => [] }), true);
        await second;
        assert.deepEqual(calls, [1]);
        const third = h.api.redrawFloorFailedImageCards('cancellable', b);
        await h.settle();
        assert.deepEqual(calls, [1]);
        hold.resolve();
        await third;
        assert.deepEqual(calls, [1, 0]);
    } finally { hold.resolve(); await first; }
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

test('a backend job without live page activity protects its slot and is not cancelled by floor removal', async t => {
    const h = await setup(t, { withJournal: true });
    const job = await h.api.recordPendingImageJob({ jobId: 'recover-me', provider: 'novelai',
        delivery: { mode: 'slots', chatId: h.ctx.chatId, messageId: '1' }, gallery: {},
        items: [{ index: 0, slotId: 'f2', imgId: 'paid', previewMetadata: {} }] });
    await h.api.markPendingImageJobActive(job.jobId, job.leaseId);
    const result = await h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: message => {
        assert.ok(message.includes('1 个失败图位'));
        return true;
    } });
    assert.deepEqual([result.removed, result.skipped], [1, 1]);
    assert.ok(h.ctx.chat[1].mes.includes('[image:f2]'));
    assert.equal((await h.api.getPendingImageJobSlots()).get('f2').jobId, job.jobId);
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

test('portable history protects a failed slot even after its old cache entry disappeared', async t => {
    const h = await setup(t);
    const message = h.ctx.chat[1];
    message.extra = { xiaobaixDrawSaved: { f1: { imgId: 'portable', savedUrl: '/old.png', tags: 'old' } } };
    const result = await h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: () => true });
    assert.equal(result.removed, 1);
    assert.ok(message.mes.includes('[image:f1]'));
    assert.equal(message.extra.xiaobaixDrawSaved.f1.imgId, 'portable');
});

test('changing branch while reading history cannot remove a shared marker from the new branch', async t => {
    const h = await setup(t);
    const msg = h.ctx.chat[1];
    const alternate = 'alternate [image:f1]';
    const operation = h.api.removeFloorFailedImageCards(failedCards(h)[0], { confirmRemoval: () => true });
    msg.swipes.push(alternate);
    msg.swipe_id = 1;
    msg.mes = alternate;
    await operation;
    assert.equal(msg.mes, alternate);
    assert.ok(await h.api.getPreview('f1-img'));
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
