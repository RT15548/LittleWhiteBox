import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { readImageCollection } from '../image-collection.js';
import { runPublicImageJob } from '../public-image-job.js';
import { createImageBackendJobsClient } from '../backend-image-jobs.js';
import { createDrawPublicApi } from '../public-api.js';
const require = createRequire(import.meta.url);
const sd = require('../../server/providers/sd-webui/adapter.js');
const comfy = require('../../server/providers/comfyui/adapter.js');
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0]);
const jpeg = Buffer.from([255, 216, 255, 0]);

// The card must see cancellation, not an invalid-result error, after an unobserved create is fenced.
test('public API reports aborted after cancelling an unobserved backend create', async () => {
    const controller = new AbortController();
    let creates = 0;
    let cancellations = 0;
    const client = createImageBackendJobsClient({ getOwner: () => 'fixture', createRequestId: () => 'cancelled-public-request',
        fetchImpl: async (url, options) => {
            if (url.endsWith('/v1/jobs')) { creates++; controller.abort(); throw new DOMException('aborted', 'AbortError'); }
            if (url.endsWith('/v1/cancel')) { cancellations++; return Response.json({ ok: true }); }
            assert.equal(options.method, 'GET');
            return Response.json({ ok: false }, { status: 404 });
        } });
    const api = createDrawPublicApi({ isEnabled: () => true, getProvider: () => 'test', providers: { test: {
        snapshot: () => ({}),
        generate: (_request, _settings, controls) => runPublicImageJob(client, { items: [{}] }, controls),
    } } });
    await assert.rejects(api.generate({ prompt: 'dynamic', signal: controller.signal }), { code: 'aborted' });
    assert.equal(creates, 1);
    assert.equal(cancellations, 1);
});

// Collection failures retain the sole paid backend copy; ACK errors retain already downloaded results.
test('public delivery preserves the backend copy on decode failure and the frontend copy on ACK failure', async () => {
    let preserved = false;
    const failed = { runJob: async (_request, options) => {
        assert.equal(options.retryCreate, false);
        try { await options.onItemReady({ response: new Response('not an image') }); }
        catch (error) { preserved = error.preserveBackendResult; }
    } };
    await assert.rejects(runPublicImageJob(failed, {}, {}), { code: 'invalid_result' });
    assert.equal(preserved, true);
    const ackFailed = { runJob: async (_request, options) => {
        await options.onItemReady({ response: new Response(png) });
        throw new Error('ack failed');
    } };
    await assert.rejects(runPublicImageJob(ackFailed, {}, {}), error => error.partialResult.images[0].type === 'image/png');
});

// Contracts: optional collection mode retains the frozen single-image wire contract;
// all paid results and partial results survive the backend buffer transport; no generation retries.
test('SD backend returns every image only when collection mode was requested', async t => {
    const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ images: [png.toString('base64'), jpeg.toString('base64')] }); };
    const input = { context: { url: 'https://example.invalid', auth: '' }, item: { request: { payload: {} } }, signal: new AbortController().signal };
    const single = await sd.execute(input);
    assert.equal(single.mime, 'image/png'); assert.deepEqual(single.buffer, png);
    input.item.request.resultMode = 'all';
    const collection = await sd.execute(input);
    const images = await readImageCollection(new Response(collection.buffer, { headers: { 'content-type': collection.mime } }));
    assert.deepEqual(images.map(blob => blob.type), ['image/png', 'image/jpeg']);
    assert.equal(calls, 2);
});
test('Comfy backend keeps selected-node order and retains successful downloads after a later failure', async t => {
    const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
    let posts = 0; let failSecond = false;
    globalThis.fetch = async (input) => {
        const url = new URL(input);
        if (url.pathname.endsWith('/prompt')) { posts++; return Response.json({ prompt_id: 'one' }); }
        if (url.pathname.includes('/history/')) return Response.json({ one: { status: { completed: true }, outputs: {
            1: { images: [{ filename: 'a.png' }, { filename: 'b.jpg' }] }, 2: { images: [{ filename: 'unused.png' }] },
        } } });
        assert.equal(url.pathname.endsWith('/view'), true);
        const second = url.searchParams.get('filename') === 'b.jpg';
        if (second && failSecond) return new Response('read failed', { status: 500 });
        return new Response(second ? jpeg : png);
    };
    const input = { context: { url: 'https://example.invalid/base' }, item: { request: {
        workflow: { 1: { class_type: 'SaveImage' }, 2: { class_type: 'SaveImage' } }, preferredSaveImageNodeId: '1', resultMode: 'all',
    } }, signal: new AbortController().signal };
    const result = await comfy.execute(input);
    const images = await readImageCollection(new Response(result.buffer, { headers: { 'content-type': result.mime } }));
    assert.deepEqual(images.map(blob => blob.type), ['image/png', 'image/jpeg']);
    failSecond = true;
    const partial = await comfy.execute(input);
    await assert.rejects(readImageCollection(new Response(partial.buffer, { headers: { 'content-type': partial.mime } })),
        error => error.code === 'partial_result' && error.partialResult.images.length === 1);
    assert.equal(posts, 2);
});
