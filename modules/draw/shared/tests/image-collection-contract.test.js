import assert from 'node:assert/strict';
import test from 'node:test';
import { IMAGE_COLLECTION_MIME, decodeImageList, packImageCollection, readImageCollection } from '../image-collection.js';
import { resolveComfyDirectOutputImage, resolveComfyDirectOutputImages } from '../../providers/comfyui/compiler.js';
import { createSerialImageRequestQueue } from '../serial-image-request-queue.js';

// Contracts: no generated image is dropped; preserve partial results (lost paid results);
// exact MIME/output node is retained (protocol); UI cleanup cannot cancel another caller's queue.
const png = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10, 0);
const jpeg = Uint8Array.of(255, 216, 255, 0);
test('the existing single-buffer transport carries every result with its true MIME', async () => {
    const response = new Response(packImageCollection([png, jpeg]), { headers: { 'content-type': IMAGE_COLLECTION_MIME } });
    const result = await readImageCollection(response);
    assert.deepEqual(result.map(item => item.type), ['image/png', 'image/jpeg']);
    assert.deepEqual(new Uint8Array(await result[1].arrayBuffer()), jpeg);
});
test('incomplete collection and malformed later image preserve earlier paid results', async () => {
    await assert.rejects(readImageCollection(new Response(packImageCollection([png], true), { headers: { 'content-type': IMAGE_COLLECTION_MIME } })), error => error.code === 'partial_result' && error.partialResult.images.length === 1);
    assert.throws(() => decodeImageList([png, Uint8Array.of(0)]), error => error.code === 'partial_result' && error.partialResult.images.length === 1);
    assert.throws(() => decodeImageList([png, Uint8Array.of(0), jpeg]), error => error.code === 'partial_result' && error.partialResult.images.length === 2);
});
test('Comfy collection uses the same selected output node as the single-image consumer', () => {
    const workflow = { 1: { class_type: 'SaveImage' }, 2: { class_type: 'SaveImage' }, 3: { class_type: 'PreviewImage' } };
    const item = { outputs: { 1: { images: [{ filename: 'a.png' }, { filename: 'b.png' }] }, 2: { images: [{ filename: 'other.png' }] }, 3: { images: [{ filename: 'preview.png' }] } } };
    const result = resolveComfyDirectOutputImages(item, workflow, '1');
    assert.deepEqual(result.map(image => image.filename), ['a.png', 'b.png']);
    assert.deepEqual(resolveComfyDirectOutputImage(item, workflow, '1'), result[0]);
});
test('provider UI cleanup leaves an external queued request alive', async () => {
    let release;
    const queue = createSerialImageRequestQueue();
    const first = queue.enqueue(() => new Promise(resolve => { release = resolve; }));
    await Promise.resolve();
    const second = queue.enqueue(() => 'public result', { scope: 'public' });
    queue.clear({ scope: 'default' }); release('first');
    await first;
    assert.equal(await second, 'public result');
});
