import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance: old paid images/selection survive upgrade, and index-only
// directories track every write without carrying the original payloads.
test('released v3 inline records upgrade without changing images or selection', async t => {
    const h = await fixture(['message']); t.after(h.stop);
    const legacy = { imgId: 'old', slotId: 'slot', characterName: 'Alice', timestamp: 123,
        base64: 'aGVsbG8=', tags: 'legacy tags', orientation: 'landscape', status: 'success' };
    await new Promise((resolve, reject) => {
        const request = h.idb.open('xb_novel_draw_previews', 3);
        request.onupgradeneeded = () => {
            const store = request.result.createObjectStore('previews', { keyPath: 'imgId' });
            for (const name of ['messageId', 'chatId', 'timestamp', 'slotId', 'characterName']) store.createIndex(name, name);
            store.put(legacy);
            request.result.createObjectStore('selections', { keyPath: 'slotId' }).put({ slotId: 'slot', selectedImgId: 'old', timestamp: 123 });
        };
        request.onsuccess = () => { request.result.close(); resolve(); };
        request.onerror = () => reject(request.error);
    });
    const { galleryMetadata, ...stored } = await h.api.getPreview('old');
    assert.deepEqual(stored, legacy);
    assert.ok(galleryMetadata.length);
    assert.equal(await h.api.getSlotSelection('slot'), 'old');
    const page = await h.api.getCharacterSlotsPage('Alice');
    assert.deepEqual(page.order, ['slot']);
    assert.equal(page.slots.slot[0].base64, undefined);
    assert.equal((await h.api.getGalleryOverview()).stats.sizeBytes, 6);
});

test('import, edit, save and delete keep the payload-free directory consistent', async t => {
    const h = await fixture(['message']); t.after(h.stop);
    await h.api.importPortablePreviews([
        { imgId: 'one', slotId: 'slot', characterName: 'Alice', timestamp: 10, base64: 'aGVsbG8=' },
        { imgId: 'two', slotId: 'slot', characterName: 'Alice', timestamp: 20, base64: 'aGVsbG8=' },
    ]);
    await h.api.storeFailedPlaceholder({ imgId: 'failed', slotId: 'failed', characterName: 'Alice' });
    const versions = await h.api.getSlotVersions('Alice', 'slot');
    assert.deepEqual(versions.map(row => row.imgId), ['two', 'one']);
    assert.ok(versions.every(row => !Object.hasOwn(row, 'base64')));
    await h.api.updatePreviewRecord('one', { characterName: 'Bob', timestamp: 30 });
    assert.deepEqual((await h.api.getCharacterSlotsPage('Bob')).order, ['slot']);
    await h.api.updatePreviewSavedUrl('two', '/images/two.png');
    const overview = await h.api.getGalleryOverview();
    assert.equal(overview.stats.successCount, 2);
    assert.equal(overview.stats.failedCount, 1);
    assert.equal(overview.stats.sizeBytes, Math.round((await h.api.getPreview('one')).base64.length * 0.75));
    assert.equal(overview.summary.Alice.slots.slot.hasSaved, true);
    await h.api.deletePreview('two');
    assert.equal((await h.api.getGallerySummary()).Alice, undefined);
    assert.deepEqual((await h.api.getSlotPreviewPage('slot')).items.map(row => row.imgId), ['one']);
});
