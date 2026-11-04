import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (data loss): compression must preserve the exact PNG before replacing
// its cache; failed saves, deletions and concurrent edits must retain their outcome.
const PNG = 'data:image/png;base64,' + 'iVBORw0KGgoA'.repeat(20);
const JPEG = 'data:image/jpeg;base64,/9j/AA==';
async function setup(t) {
    const saved = [];
    const runtime = { convert: async () => JPEG, save: async input => { saved.push(input); return '/images/original.png'; } };
    globalThis.__legacyJpeg = runtime;
    const h = await fixture([], { stubs: {
        'image-save.js': 'export const saveImageToServer=input=>globalThis.__legacyJpeg.save(input);export const getImageFolderName=()=>"review";',
        'gallery-image-codec.js': 'export const convertImageToJpeg=input=>globalThis.__legacyJpeg.convert(input);export const GALLERY_JPEG_COPY={originalSaveFailed:"save failed"};',
    } });
    t.after(() => { h.stop(); delete globalThis.__legacyJpeg; });
    await h.api.storePreview({ imgId: 'image', slotId: 'slot', characterName: 'Review', base64: PNG, tags: 'original' });
    return { ...h, runtime, saved };
}
test('batch compression durably saves the exact original and updates gallery metadata', async t => {
    const h = await setup(t);
    const result = await h.api.convertLegacyPreviewsToJpeg();
    assert.equal(result.converted, 1);
    assert.equal(h.saved[0].base64, PNG.split(',')[1]);
    assert.equal(h.saved[0].format, 'png');
    const preview = await h.api.getPreview('image');
    assert.equal(preview.base64, JPEG);
    assert.equal(preview.savedUrl, '/images/original.png');
    assert.equal((await h.api.getGalleryMetadata())[0].savedUrl, preview.savedUrl);
    assert.equal((await h.api.convertLegacyPreviewsToJpeg()).converted, 0);
    assert.equal(h.saved.length, 1);
});
test('failed original save retains the only PNG', async t => {
    const h = await setup(t);
    h.runtime.save = async () => { throw new Error('disk full'); };
    const result = await h.api.convertLegacyPreviewsToJpeg();
    assert.equal(result.failed, 1);
    assert.equal((await h.api.getPreview('image')).base64, PNG);
});
test('an old saved URL never substitutes for preserving the cached PNG bytes', async t => {
    const h = await setup(t);
    await h.api.updatePreviewRecord('image', { savedUrl: '/now-a-login-page' });
    const result = await h.api.convertLegacyPreviewsToJpeg();
    assert.equal(result.converted, 1);
    assert.equal(h.saved[0].base64, PNG.split(',')[1]);
    assert.equal((await h.api.getPreview('image')).savedUrl, '/images/original.png');
});
test('conversion never resurrects a deleted image and preserves concurrent tag edits', async t => {
    for (const deleted of [false, true]) {
        const h = await setup(t);
        h.runtime.save = async () => {
            if (deleted) await h.api.deletePreview('image');
            else await h.api.updatePreviewRecord('image', { tags: 'edited while saving' });
            return '/images/original.png';
        };
        const result = await h.api.convertLegacyPreviewsToJpeg();
        const image = await h.api.getPreview('image');
        if (deleted) { assert.equal(result.converted, 0); assert.equal(image, undefined); }
        else { assert.equal(result.converted, 1); assert.equal(image.tags, 'edited while saving'); }
        h.stop();
    }
});
