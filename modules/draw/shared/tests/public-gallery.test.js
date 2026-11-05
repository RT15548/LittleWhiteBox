import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { IDBObjectStore } from 'fake-indexeddb';
import { fixture } from './helpers/draw-journey.js';

// Acceptance contracts:
// - All returned images belong to the starting chat, including concurrent batches (lost/misattributed images).
// - Refresh/expiry cannot remove paid gallery results; explicit deletion must work without editing chat (data loss).
// - A failed local write cannot lose other results, reject paid generation or trigger another request (lost images/double charge).
// - The existing autosave switch applies only to new requests, including partial results (unexpected uploads/lost images).
// - Slow or failed uploads cannot delay card results, edit chat or repeat generation (broken cards/wrong-chat writes/double charge).
// - Concurrent public requests retain their prepared provenance, including partial results (invisible metadata loss).
async function setup(t) {
    const previousReader = globalThis.FileReader;
    globalThis.FileReader = class {
        readAsDataURL(blob) {
            blob.arrayBuffer().then(bytes => {
                this.result = `data:${blob.type};base64,${Buffer.from(bytes).toString('base64')}`;
                this.onload();
            }, error => { this.error = error; this.onerror(); });
        }
    };
    const h = await fixture(['unchanged'], {
        sources: ['public-api.js', 'public-gallery.js', '../../../shared/media-api.js'],
        stubs: {
            'image-autosave.js': null,
            'image-save.js': 'export const saveImageToServer=options=>globalThis.__drawJourneyReview.upload(options);export const getImageFolderName=()=>globalThis.__drawJourneyReview.ctx.characterName;',
        },
    });
    h.ctx.characterName = 'Original';
    t.after(() => { h.api.destroyGalleryCache(); h.stop(); globalThis.FileReader = previousReader; });
    const images = [new Blob(['one'], { type: 'image/png' }), new Blob(['two'], { type: 'image/jpeg' }), new Blob(['three'], { type: 'image/webp' })];
    const uploads = [];
    const upload = { wait: null, fail: false };
    globalThis.__drawJourneyReview.upload = async options => {
        uploads.push(options);
        if (upload.wait) await upload.wait;
        if (upload.fail) throw new Error('upload failed');
        return `/user/images/${options.charName}/${options.fileName}.${options.format}`;
    };
    let calls = 0;
    const adapter = { snapshot: () => ({}), generate: async () => { calls++; return images; } };
    const api = h.api.createDrawPublicApi({
        isEnabled: () => true, getProvider: () => 'sdwebui', captureGallery: h.api.capturePublicGallery,
        providers: { sdwebui: adapter, novelai: adapter, comfyui: adapter },
    });
    return { ...h, publicApi: api, adapter, images, calls: () => calls, uploads, upload };
}

test('public batches retain original ownership and bytes across reopening/expiry, without touching chat', async t => {
    const h = await setup(t), originalChatId = h.ctx.chatId;
    const originalChat = structuredClone(h.ctx.chat), originalMetadata = structuredClone(h.ctx.chatMetadata);
    const first = h.publicApi.generate({ prompt: 'scene', negativePrompt: '', characterPrompts: [{ prompt: 'character' }] });
    h.ctx.chatId = 'switched-chat'; h.ctx.characterName = 'Switched';
    const second = h.publicApi.generate({ prompt: 'scene' });
    assert.equal((await first).images, h.images);
    assert.equal((await second).images, h.images);
    assert.equal(h.calls(), 2);
    await h.settle();
    assert.deepEqual(h.uploads, []);
    h.api.destroyGalleryCache();
    const rows = await h.api.getGalleryMetadata();
    assert.equal(rows.length, 6);
    assert.equal(new Set(rows.map(row => row.slotId)).size, 2);
    assert.equal(rows.filter(row => row.characterName === 'Original').length, 3);
    for (const row of rows) {
        const record = await h.api.getPreview(row.imgId);
        assert.equal(record.chatId, record.characterName === 'Original' ? originalChatId : 'switched-chat');
        assert.equal(record.source, h.api.PUBLIC_DRAW_SOURCE);
        assert.equal(record.placement, null);
        assert.equal(record.messageId, undefined);
        const index = Number(record.imgId.split('-').at(-1));
        assert.equal(record.base64, `data:${h.images[index].type};base64,${Buffer.from(await h.images[index].arrayBuffer()).toString('base64')}`);
        await h.api.updatePreviewRecord(row.imgId, { timestamp: 1 });
    }
    await h.api.storePreview({ imgId: 'expiring-test', base64: 'test', source: 'quick-test' });
    await h.api.updatePreviewRecord('expiring-test', { timestamp: 1 });
    await h.api.clearExpiredCache(3);
    assert.equal((await h.api.getGalleryMetadata()).length, 6);
    assert.equal(await h.api.getPreview('expiring-test'), undefined);
    assert.deepEqual(h.ctx.chat, originalChat);
    assert.deepEqual(h.ctx.chatMetadata, originalMetadata);
    for (const row of rows) await h.api.deletePreview(row.imgId);
    assert.equal((await h.api.getGalleryMetadata()).length, 0);
});

test('public Vibe provenance is frozen per request and survives partial delivery', async t => {
    const h = await setup(t);
    h.adapter.generate = async (request, _settings, { onPrepared }) => {
        const metadata = { presetId: request.prompt, vibeNames: request.prompt };
        onPrepared(metadata);
        metadata.vibeNames = 'later edit';
        await h.settle();
        if (request.prompt === 'partial') throw new h.api.MediaApiError('partial_result', { partialResult: { images: h.images } });
        return h.images;
    };
    await Promise.all([
        h.publicApi.generate({ provider: 'novelai', prompt: '水彩' }),
        assert.rejects(h.publicApi.generate({ provider: 'novelai', prompt: 'partial' }), { code: 'partial_result' }),
    ]);
    h.api.destroyGalleryCache();
    const rows = await h.api.getGalleryMetadata();
    assert.equal(rows.length, 6);
    for (const row of rows) {
        const record = await h.api.getPreview(row.imgId);
        assert.equal(record.vibeNames, record.tags);
        assert.equal(record.presetId, record.tags);
    }
});

test('autosave uses the resolved provider and original owner without delaying card results or writing chat', async t => {
    const h = await setup(t);
    h.api.getSharedDrawSettings().autoSaveImages = true;
    const originalChat = structuredClone(h.ctx.chat), originalMetadata = structuredClone(h.ctx.chatMetadata);
    let release;
    h.upload.wait = new Promise(resolve => { release = resolve; });
    t.after(release);
    const first = h.publicApi.generate({ prompt: 'default provider' });
    h.ctx.characterName = 'Switched'; h.ctx.chatId = 'another-chat';
    const second = h.publicApi.generate({ provider: 'novelai', prompt: 'explicit provider' });
    const third = h.publicApi.generate({ provider: 'comfyui', prompt: 'explicit provider' });
    assert.ok((await Promise.all([first, second, third])).every(result => result.images === h.images));
    await h.settle();
    assert.equal(h.uploads.length, 9);
    assert.equal(h.uploads.filter(item => item.charName === 'Original' && item.fileName.startsWith('sd_')).length, 3);
    assert.equal(h.uploads.filter(item => item.charName === 'Switched' && item.fileName.startsWith('novel_')).length, 3);
    assert.equal(h.uploads.filter(item => item.charName === 'Switched' && item.fileName.startsWith('comfy_')).length, 3);
    release();
    await h.settle();
    h.api.destroyGalleryCache();
    const rows = await h.api.getGalleryMetadata();
    for (const row of rows) {
        const record = await h.api.getPreview(row.imgId);
        assert.ok(record.savedUrl.startsWith(`/user/images/${record.characterName}/`));
        assert.equal(record.base64, null);
    }
    assert.deepEqual(h.ctx.chat, originalChat);
    assert.deepEqual(h.ctx.chatMetadata, originalMetadata);
    assert.equal(h.counters.saves, 0);
    assert.equal(h.calls(), 3);
});

test('turning autosave on during a pending request does not upload it or earlier gallery records', async t => {
    const h = await setup(t), settings = h.api.getSharedDrawSettings();
    let now = Date.now();
    t.mock.method(Date, 'now', () => now);
    await h.publicApi.generate({ prompt: 'before' });
    let release;
    h.adapter.snapshot = () => new Promise(resolve => { release = resolve; });
    const pending = h.publicApi.generate({ prompt: 'pending' });
    settings.autoSaveImages = true; settings.autoSaveImagesSince = ++now;
    release({});
    await pending;
    await h.settle();
    assert.deepEqual(h.uploads, []);
    h.adapter.snapshot = () => ({});
    await h.publicApi.generate({ prompt: 'after' });
    await h.settle();
    assert.equal(h.uploads.length, 3);
    settings.autoSaveImages = false;
    await h.publicApi.generate({ prompt: 'disabled again' });
    await h.settle();
    assert.equal(h.uploads.length, 3);
});

test('upload failure preserves local images and returns the paid batch without retries', async t => {
    const h = await setup(t);
    t.mock.method(console, 'warn', () => {});
    h.api.getSharedDrawSettings().autoSaveImages = true;
    h.upload.fail = true;
    assert.equal((await h.publicApi.generate({ prompt: 'paid batch' })).images, h.images);
    await h.settle();
    assert.equal(h.uploads.length, 3);
    assert.equal(h.calls(), 1);
    assert.equal(h.counters.warnings.length, 1);
    for (const row of await h.api.getGalleryMetadata()) {
        const record = await h.api.getPreview(row.imgId);
        assert.ok(record.base64);
        assert.ok(!record.savedUrl);
    }
});

test('partial paid results follow autosave without changing the generation error or retrying', async t => {
    const h = await setup(t);
    h.api.getSharedDrawSettings().autoSaveImages = true;
    let calls = 0;
    h.adapter.generate = async () => {
        calls++;
        throw new h.api.MediaApiError('partial_result', { partialResult: { images: h.images } });
    };
    await assert.rejects(h.publicApi.generate({ prompt: 'partial' }), error => {
        assert.equal(error.code, 'partial_result');
        assert.equal(error.partialResult.images, h.images);
        return true;
    });
    await h.settle();
    assert.equal(h.uploads.length, 3);
    assert.equal(calls, 1);
});

test('one failed gallery write still returns the entire paid batch and persists later images', async t => {
    const h = await setup(t);
    const put = IDBObjectStore.prototype.put;
    let attempted = 0;
    IDBObjectStore.prototype.put = function (record, ...args) {
        if (record.source === h.api.PUBLIC_DRAW_SOURCE) {
            attempted++;
            if (record.imgId.endsWith('-1')) throw new DOMException('full', 'QuotaExceededError');
        }
        return put.call(this, record, ...args);
    };
    t.after(() => { IDBObjectStore.prototype.put = put; });
    const result = await h.publicApi.generate({ prompt: 'paid batch' });
    assert.equal(result.images, h.images);
    assert.equal(h.calls(), 1);
    assert.equal(attempted, 3);
    assert.equal((await h.api.getGalleryMetadata()).length, 2);
    assert.equal(h.counters.errors.length, 2); // One diagnostic and one visible notification, not a generation error.
});
