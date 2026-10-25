import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';
import { prepareImageInput } from '../prepared-image-input.js';
import { resolveImageOrientation, resolveImageTaskOrientations } from '../image-orientation.js';

// Acceptance: scene-planner-design.md, paid dimensions and view-owned URLs.
const base64 = 'aGVsbG8=';
const nativeFetch = globalThis.fetch;
const recipe = { overrideSize: 'auto', seeds: [1], timeout: 30000, requestDelay: { min: 0, max: 0 },
    apiBaseUrl: 'https://example.com', apiKey: 'fixture', autoLearnEnabled: false, autoLearnMode: 'new_only',
    params: { model: 'nai-diffusion-3', width: 832, height: 1216, seed: 1 } };

test('landscape survives cache, saved chat, export/import and the actual redraw action', async t => {
    const h = await fixture(['[image:slot-landscape]']);
    t.after(h.stop);
    const prepared = prepareImageInput('novelai', [{ scene: 'scene', orientation: 'landscape' }], recipe);
    await h.api.storePreview({ ...prepared.metadata[0], imgId: 'landscape', slotId: 'slot-landscape', base64, messageId: 0 });
    await h.api.setSlotSelection('slot-landscape', 'landscape');
    const portable = await h.api.exportPortablePreviewsForSlots(['slot-landscape']);
    assert.equal(portable.previews[0].orientation, 'landscape');
    await h.api.deletePreview('landscape');
    await h.api.importPortablePreviews(portable.previews, portable.selections);
    await h.api.updatePreviewSavedUrl('landscape', '/images/landscape.png');
    await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview('landscape'));
    await h.api.deletePreview('landscape');
    const saved = h.api.getDrawSavedPreview(h.messages[0], 'slot-landscape', 0, h.ctx.chatId);
    assert.equal(saved.orientation, 'landscape');
    await h.api.materializeDrawSavedPreview(h.messages[0], 'slot-landscape', { messageId: 0, chatId: h.ctx.chatId });
    let requests = 0;
    h.api.registerPreparedImageProvider('novelai', async input => {
        requests++;
        const tasks = await resolveImageTaskOrientations(input.tasks, recipe.overrideSize);
        assert.equal(Object.hasOwn(tasks[0], 'sourceImage'), false);
        const batch = prepareImageInput('novelai', tasks, recipe);
        const params = batch.compiledBatch.items[0].request.payload.parameters;
        assert.deepEqual([params.width, params.height], [1216, 832]);
    });
    const card = document.createElement('div');
    Object.assign(card.dataset, { mesid: '0', slotId: 'slot-landscape', imgId: 'landscape' });
    h.body(0).append(card);
    await h.api.redrawImageCard('novelai', card);
    assert.equal(requests, 1);
    await h.api.storeFailedPlaceholder({ imgId: 'failed-landscape', slotId: 'slot-landscape', ...prepared.metadata[0] });
    assert.equal((await h.api.getPreview('failed-landscape')).orientation, 'landscape');
});

test('legacy dimensions are read only for automatic sizing and failed reads never submit a guessed size', async t => {
    let loads = 0;
    const originalImage = globalThis.Image;
    t.after(() => { globalThis.Image = originalImage; });
    globalThis.Image = class {
        naturalWidth = 1216; naturalHeight = 832;
        set src(value) { if (value) { loads++; queueMicrotask(() => this.onload()); } }
    };
    assert.equal(await resolveImageOrientation({ base64 }), 'landscape');
    assert.equal(await resolveImageOrientation({ status: 'failed' }), null);
    const tasks = [{ scene: 'scene', sourceImage: { savedUrl: '/missing.png' } }];
    assert.equal((await resolveImageTaskOrientations(tasks, '1024x1024'))[0].orientation, null);
    assert.equal(loads, 1);
    globalThis.Image = class { set src(value) { if (value) queueMicrotask(() => this.onerror()); } };
    await assert.rejects(resolveImageTaskOrientations(tasks, 'auto'));
    // Cancellation while a legacy image is still loading must release its URL
    // and the preparation wait, rather than keeping the redraw occupied.
    let imageUrl;
    globalThis.Image = class { set src(value) { if (value) imageUrl = value; } };
    const controller = new AbortController();
    const waiting = resolveImageTaskOrientations([{ sourceImage: { base64 } }], 'auto', controller.signal);
    controller.abort();
    await assert.rejects(waiting, { name: 'AbortError' });
    await assert.rejects(nativeFetch(imageUrl));
});

test('history pages carry no payloads and only visible gallery URLs live until released', async t => {
    const h = await fixture(['message']);
    t.after(() => { h.api.closeGallery(); h.stop(); });
    const prototype = Object.getPrototypeOf(h.body(0));
    const originalScroll = prototype.scrollIntoView;
    prototype.scrollIntoView = () => {};
    t.after(() => { prototype.scrollIntoView = originalScroll; });
    const records = Array.from({ length: 129 }, (_, index) => ({
        imgId: `image-${index}`, slotId: 'history', base64, timestamp: index + 1,
    }));
    await h.api.importPortablePreviews(records);
    const all = [];
    for (let offset = 0; offset < 129; offset += 24) {
        const page = await h.api.getSlotPreviewPage('history', { offset, limit: 24 });
        assert.equal(page.hasMore, offset + 24 < 129);
        assert.ok(page.items.length <= 24);
        assert.ok(page.items.every(item => !item.base64));
        all.push(...page.items.map(item => item.imgId));
    }
    assert.deepEqual(all, records.map(item => item.imgId).reverse());
    await h.api.openGallery('history', null, {}, 'image-128');
    const thumbs = [...document.querySelectorAll('.nd-gallery-thumb')];
    assert.equal(thumbs.length, 129);
    assert.ok(thumbs.every(image => !image.getAttribute('src')));
    const observer = h.observers.at(-1);
    observer.callback(thumbs.slice(-3).map(target => ({ target, isIntersecting: true })));
    await h.settle(100);
    const urls = thumbs.slice(-3).map(image => image.src);
    assert.equal(thumbs.filter(image => image.getAttribute('src')).length, 3);
    for (const url of urls) assert.equal(await (await nativeFetch(url)).text(), 'hello');
    await h.api.deletePreview('image-128');
    assert.equal(await (await nativeFetch(document.getElementById('nd-gallery-img').src)).text(), 'hello');
    h.api.closeGallery();
    for (const url of urls) await assert.rejects(nativeFetch(url));
    const page = await h.api.getSlotPreviewPage('history');
    assert.equal(page.items[0].imgId, 'image-127');
});
