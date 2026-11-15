import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { fixture } from './helpers/draw-journey.js';

// Acceptance contracts:
// - A third-party container displays saved images without native floors or a
//   generation request (lost access to paid images / unwanted charges).
// - Native, external and iframe views read the same selected version; display
//   updates preserve open drafts and surrounding prose (lost edits / stale actions).
// - Repainting/remounting delivers clicks once through the active provider;
//   destroying/changing chat revokes the old view (duplicate actions / wrong target).
// - Closing one view cannot cancel another view's pending history read (lost access).
// - The managed native chat keeps its content lease during provider startup (broken chat rendering).
// - Queued/in-flight refreshes cannot resurrect a destroyed view or write into
//   its next mount; other views still follow selections (stale/wrong image actions).
async function setup(t) {
    const h = await fixture(['before [image:slot] after'], { sources: ['image-card-events.js'] });
    t.after(h.stop);
    for (const imgId of ['first', 'second']) await h.api.storePreview({ slotId: 'slot', imgId,
        messageId: 0, savedUrl: `/${imgId}.png`, tags: imgId });
    await h.api.setSlotSelection('slot', 'first');
    h.start();
    return h;
}

function surface(h, iframe = false) {
    const doc = iframe ? parseHTML('<html><head></head><body></body></html>').document : document;
    doc.defaultView.IntersectionObserver = globalThis.IntersectionObserver;
    doc.defaultView.innerHeight = 800;
    const element = doc.createElement('section');
    element.textContent = h.ctx.chat[0].mes;
    element.getBoundingClientRect = () => ({ top: 0, bottom: 100 });
    doc.body.append(element);
    const mount = () => h.api.mountChatMessageImages({ element, messageId: 0 });
    return { element, doc, mount, card: () => element.querySelector('.xb-nd-img') };
}

test('mounting old images works without native floors; prose and saved data survive refresh and destroy', async t => {
    const h = await setup(t);
    document.getElementById('chat').remove();
    const s = surface(h), before = structuredClone(h.ctx.chat);
    const prose = s.element.firstChild;
    const view = s.mount();
    await view.refresh();
    assert.equal(s.card()?.dataset.imgId, 'first');
    assert.ok(s.element.firstChild === prose);
    await view.refresh();
    assert.equal(s.element.querySelectorAll('.xb-nd-img').length, 1);
    assert.deepEqual(h.ctx.chat, before);
    assert.equal(h.counters.saves, 0);
    assert.deepEqual(h.counters.requests, []);
    view.destroy();
    assert.equal(s.card(), null);
    assert.equal(s.element.textContent, before[0].mes);
});

test('native and two external documents follow the selected version and preserve a live draft', async t => {
    const h = await setup(t);
    const surfaces = [surface(h), surface(h, true)];
    const views = surfaces.map(s => s.mount());
    await Promise.all(views.map(view => view.refresh()));
    await h.pump(4);
    const editor = surfaces[1].card().querySelector('.xb-nd-edit');
    editor.style.display = 'flex';
    editor.querySelector('textarea').value = 'draft';
    await h.api.setSlotSelection('slot', 'second');
    await h.pump(4);
    for (const s of surfaces) assert.equal(s.card().dataset.imgId, 'second');
    assert.equal(h.body(0).querySelector('.xb-nd-img').dataset.imgId, 'second');
    assert.ok(surfaces[1].card().querySelector('.xb-nd-edit') === editor);
    assert.equal(editor.querySelector('textarea').value, 'draft');
    assert.ok(surfaces[1].doc.getElementById('xiaobaix-draw-image-styles'));
    views.forEach(view => view.destroy());
});

test('provider handlers run once per document and remount; teardown stops the old controls', async t => {
    const h = await setup(t);
    const s = surface(h, true), sibling = surface(h);
    let clicks = 0;
    let dispose = h.api.bindImageCardEvents([['click', () => { clicks++; }, { capture: true }]]);
    t.after(() => dispose());
    const old = s.mount(), other = sibling.mount();
    await Promise.all([old.refresh(), other.refresh()]);
    const current = s.mount();
    old.destroy();
    await current.refresh();
    const click = () => s.card().dispatchEvent(new s.doc.defaultView.Event('click', { bubbles: true }));
    click();
    assert.equal(clicks, 1);
    dispose();
    dispose = h.api.bindImageCardEvents([['click', () => { clicks += 10; }, { capture: true }]]);
    click();
    assert.equal(clicks, 11);
    current.destroy();
    s.element.dispatchEvent(new s.doc.defaultView.Event('click', { bubbles: true }));
    assert.equal(clicks, 11);
    assert.ok(sibling.card());
    h.ctx.chatId = 'different';
    await h.emit('CHAT_CHANGED');
    assert.equal(sibling.card(), null);
    await other.refresh();
    assert.equal(sibling.card(), null);
});

test('repaint and source removal update only image slots, without native DOM or new requests', async t => {
    const h = await setup(t);
    document.getElementById('chat').remove();
    const s = surface(h), view = s.mount();
    await view.refresh();
    s.element.textContent = h.ctx.chat[0].mes;
    await view.refresh();
    assert.equal(s.card().dataset.imgId, 'first');
    h.ctx.chat[0].mes = '';
    await view.refresh();
    assert.equal(s.card(), null);
    assert.deepEqual(h.counters.requests, []);
});

test('destroying one view during a shared history read leaves its sibling usable', async t => {
    const h = await setup(t);
    const a = surface(h), b = surface(h, true);
    const first = a.mount(), second = b.mount();
    const reading = [first.refresh(), second.refresh()];
    first.destroy();
    await Promise.all(reading);
    assert.equal(a.card(), null);
    assert.equal(b.card()?.dataset.imgId, 'first');
    assert.deepEqual(h.counters.requests, []);
});

test('queued automatic refresh cannot resurrect a destroyed root or break its next mount', async t => {
    const h = await setup(t);
    document.getElementById('chat').remove();
    const a = surface(h), b = surface(h, true);
    const old = a.mount(), sibling = b.mount();
    await Promise.all([old.refresh(), sibling.refresh()]);
    await h.pump(3);
    const queued = h.api.renderPreviewsForMessage(0, { refreshSlotIds: ['slot'] });
    old.destroy();
    await queued;
    await h.pump(4);
    assert.equal(h.api.drawMessageViewport.has(a.element), false);
    assert.equal(a.card(), null);
    const current = a.mount();
    await current.refresh();
    await h.api.setSlotSelection('slot', 'second');
    await h.pump(4);
    assert.equal(a.card()?.dataset.imgId, 'second');
    assert.equal(b.card()?.dataset.imgId, 'second');
    assert.deepEqual(h.counters.requests, []);
});

test('an in-flight render cannot write into the next mount of the same element', async t => {
    const h = await fixture(['[image:slot]'], { stubs: {
        'pending-image-jobs.js': `export const PendingJobState={CANCELLING:'cancelling'};
            export const PendingJobAdoptionPhase={READY:'ready'};
            export const listPendingImageJobs=async()=>[];
            export const getPendingImageJobSlots=async()=>{await globalThis.__drawJourneyReview.pendingRead;return new Map()};
            export const discardPendingImageSlot=async()=>{};`,
    } });
    t.after(h.stop);
    await h.api.storePreview({ slotId: 'slot', imgId: 'first', messageId: 0, savedUrl: '/first.png' });
    h.start();
    document.getElementById('chat').remove();
    const s = surface(h), old = s.mount();
    await old.refresh();
    await h.pump(3);
    let unblock;
    globalThis.__drawJourneyReview.pendingRead = new Promise(resolve => { unblock = resolve; });
    const reading = h.api.renderPreviewsForMessage(0, { refreshSlotIds: ['slot'] });
    await h.settle();
    old.destroy();
    const current = s.mount();
    const refreshing = current.refresh();
    await h.settle();
    unblock();
    await reading;
    assert.equal(s.card()?.dataset.imgId, undefined, 'old result must not paint the new mount before its own read');
    await refreshing;
    assert.equal(s.card()?.dataset.imgId, 'first');
    assert.deepEqual(h.counters.requests, []);
});

test('managed native content keeps its host lifecycle while the provider starts', async t => {
    const h = await fixture(['[image:slot]'], { sources: ['../../../integrations/tauritavern/features/draw/index.js'] });
    t.after(h.stop);
    window.xiaobaixDraw.getStatus = () => ({ ready: false, enabled: true });
    const failures = [];
    const decorate = h.api.createTauriTavernDrawDecorator({ settings: { enabled: true },
        isDrawProviderActive: () => true, onError: error => failures.push(error) });
    const controller = new AbortController();
    const release = decorate({ content: h.body(0), mesid: 0, signal: controller.signal });
    assert.equal(typeof release, 'function');
    assert.equal(h.api.drawMessageViewport.has(h.body(0)), true);
    controller.abort();
    release();
    await h.settle();
    assert.equal(h.api.drawMessageViewport.has(h.body(0)), false);
    assert.deepEqual(failures, []);
    assert.deepEqual(h.counters.requests, []);
});
