import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistantDrawing } from './service.js';
import { DRAW_ERRORS } from './contract.js';
const image = () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' });
function harness(generate, write = async files => files.map(({ path, blob }) => ({ path, name: path.split('/').at(-1), kind: 'image', mimeType: blob.type, sizeBytes: blob.size, blobId: path }))) {
    let calls = 0; const seen = [];
    const service = createAssistantDrawing({ getApi: () => ({ generate: async args => { calls++; seen.push(args); return generate(args); }, getPresets: async () => ({ provider: 'novelai', api: [], params: [], workflows: [] }) }),
        writeImages: write, observePaths: async paths => paths, identifier: () => 'test-draw' });
    return { service, seen, calls: () => calls };
}

test('drawing forwards free public parameters and returns original workspace files without changing presets', async () => {
    const h = harness(async () => ({ images: [image(), image()] }));
    const request = { provider: 'novelai', prompt: 'night station', negativePrompt: '', positivePrefix: '', overrideSize: '1216x832', params: { steps: 28, seed: 41 }, characterPrompts: [{ prompt: 'traveller', uc: 'hat', center: { x: 0.25, y: 0.5 } }] };
    const output = await h.service.generate(request);
    assert.equal(h.calls(), 1); assert.equal(output.ok, true); assert.equal(output.images.length, 2);
    for (const key of Object.keys(request)) assert.deepEqual(h.seen[0][key], request[key]);
    assert.equal(output.images[0].path, 'local/images/draw-test-draw-1.png');
    assert.notEqual(output.images[0].path, output.images[1].path);
    assert.equal(Object.hasOwn(output.images[0], 'blob'), false);
});

test('received images survive cancellation and saving retries do not buy another generation', async () => {
    const controller = new AbortController(); let failSave = true;
    const h = harness(async () => { controller.abort(); throw Object.assign(new Error('cancelled'), { code: 'aborted', partialResult: { images: [image()] } }); }, async files => {
        if (failSave) throw new Error('quota');
        return files.map(({ path }) => ({ path, kind: 'image', blobId: 'retained' }));
    });
    const first = await h.service.generate({ prompt: 'flower' }, { signal: controller.signal });
    assert.equal(first.error, 'workspace_image_save_failed'); assert.equal(first.receivedCount, 1);
    const pending = h.service.save();
    assert.equal(pending.pending.length, 1); assert.equal(pending.pending[0].receiptId, first.receiptId);
    assert.equal(pending.pending[0].receivedCount, 1); assert.equal(h.calls(), 1);
    failSave = false;
    const saved = await h.service.save({ receiptId: first.receiptId });
    assert.equal(saved.images.length, 1); assert.equal(saved.error, 'aborted'); assert.equal(h.calls(), 1);
    assert.equal((await h.service.save({ receiptId: first.receiptId })).error, 'draw_receipt_missing');
});

test('a received receipt cannot be saved concurrently into two destinations', async () => {
    let start, finish; const started = new Promise(resolve => { start = resolve; });
    const h = harness(async () => ({ images: [image()] }), async files => {
        start(); await new Promise(resolve => { finish = resolve; });
        return files.map(({ path }) => ({ path, kind: 'image' }));
    });
    const generation = h.service.generate({ prompt: 'x' }); await started;
    const pending = h.service.save().pending[0]; assert.equal(pending.saving, true);
    const competing = await h.service.save({ receiptId: pending.receiptId, outputDir: 'local/another' });
    assert.equal(competing.error, 'draw_receipt_saving');
    finish(); const saved = await generation;
    assert.equal(saved.images.length, 1); assert.equal(h.service.save().pending.length, 0); assert.equal(h.calls(), 1);
});

test('invalid destinations and failed provider responses never produce success or automatic repeats', async () => {
    const h = harness(async () => { throw Object.assign(new Error('secret response'), { code: 'provider_error', status: 503 }); });
    await assert.rejects(h.service.generate({ outputDir: '../wrong', prompt: 'x' })); assert.equal(h.calls(), 0);
    const result = await h.service.generate({ prompt: 'x' });
    assert.equal(result.ok, false); assert.deepEqual(result.images, []); assert.equal(result.status, 503); assert.equal(h.calls(), 1);
    assert.equal(JSON.stringify(result).includes('secret response'), false);
});

test('an unavailable drawing API retains its distinct cause for drawing and preset lookup', async () => {
    const service = createAssistantDrawing({ getApi: () => undefined, observePaths: async () => [],
        writeImages: () => assert.fail('No images to save'), identifier: () => 'missing-api' });
    for (const result of [await service.generate({ prompt: 'fixture' }), await service.presets()]) {
        assert.equal(result.ok, false);
        assert.equal(result.error, 'drawing_unavailable');
        assert.equal(result.message, DRAW_ERRORS.drawing_unavailable, 'Use the domain explanation, not the provider fallback');
    }
});

for (const code of ['disabled', 'not_configured', 'partial_result', 'collection_failed']) test(`drawing explains ${code} without losing the returned images or cause`, async () => {
    const partial = ['partial_result', 'collection_failed'].includes(code);
    const h = harness(async () => { throw Object.assign(new Error('private-provider-body'), {
        code, ...(partial ? { partialResult: { images: [image()] } } : {}),
    }); });
    const result = await h.service.generate({ prompt: 'fixture' });
    assert.equal(result.ok, false);
    assert.equal(result.error, code);
    assert.equal(result.message, DRAW_ERRORS[code]);
    assert.equal(result.images.length, partial ? 1 : 0);
    assert.equal(h.calls(), 1);
});
