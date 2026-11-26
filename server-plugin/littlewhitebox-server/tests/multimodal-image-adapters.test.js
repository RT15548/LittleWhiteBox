'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const gemini = require('../../../modules/draw/server/providers/gemini/adapter.js');
const openai = require('../../../modules/draw/server/providers/openai/adapter.js');
const { normalizeImageJobRequest } = require('../../../modules/draw/server/image-jobs/service.js');
const { MAX_REFERENCE_BYTES, MAX_REFERENCE_IMAGES } = require('../../../modules/draw/shared/reference-image-contract.cjs');

const adapters = { gemini, openai };
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aA/0AAAAASUVORK5CYII=', 'base64');
const reference = { mimeType: 'image/png', data: png.toString('base64') };
const prompt = 'Paint a watercolour picture of a lighthouse.';
const geminiPayload = {
    model: 'gemini-nano-banana-2.1',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '1:1', imageSize: '1K' } },
};
const openaiPayload = { model: 'gpt-image-2.6-flare', prompt, size: '1024x1024', quality: 'medium', background: 'opaque', output_format: 'png', n: 1 };
const builtinUrls = { gemini: 'https://generativelanguage.googleapis.com/v1', openai: 'https://api.openai.com/v1' };

function job(provider, request = {}, url = builtinUrls[provider]) {
    return {
        provider, requestId: 'image-api-test', context: { url, key: 'sample-key' }, delay: { min: 1, max: 1 },
        items: [{ request: { payload: provider === 'gemini' ? geminiPayload : openaiPayload, ...request }, timeout: 5000 }],
    };
}

async function execute(body, signal = new AbortController().signal) {
    const { provider, context, items: [item] } = normalizeImageJobRequest(body, adapters);
    return adapters[provider].execute({ context, item, signal });
}

function geminiResult(...parts) {
    return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts } }] });
}

test('Gemini selects the model by endpoint and encodes only explicit reference images as inlineData', async t => {
    const upstream = t.mock.method(globalThis, 'fetch', async () => geminiResult({ text: 'Caption' }, { inlineData: reference }));
    assert.deepEqual(await execute(job('gemini')), { buffer: png, mime: 'image/png' });
    assert.deepEqual(await execute(job('gemini', { referenceImages: [reference] }, 'https://custom.example.test/google/v1beta/')), { buffer: png, mime: 'image/png' });
    const [official, custom] = upstream.mock.calls.map(call => call.arguments);
    for (const [, init] of [official, custom]) {
        assert.equal(init.method, 'POST');
        assert.equal(init.headers['x-goog-api-key'], 'sample-key');
        assert.equal(init.headers['Content-Type'], 'application/json');
        assert.equal(init.redirect, 'manual');
    }
    assert.equal(official[0].href, `https://generativelanguage.googleapis.com/v1/models/${geminiPayload.model}:generateContent`);
    assert.equal(custom[0].href, `https://custom.example.test/google/v1beta/models/${geminiPayload.model}:generateContent`);
    const { contents, generationConfig } = geminiPayload;
    assert.deepEqual(JSON.parse(official[1].body), { contents, generationConfig });
    assert.deepEqual(JSON.parse(custom[1].body), { contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: reference }] }], generationConfig });
});

test('GPT Image sends JSON generations and multipart edits with ordered binary image[] parts', async t => {
    const upstream = t.mock.method(globalThis, 'fetch', async () => Response.json({ data: [{ b64_json: reference.data }] }));
    assert.deepEqual(await execute(job('openai')), { buffer: png, mime: 'image/png' });
    const jpeg = Buffer.from([255, 216, 255, 217]);
    assert.deepEqual(await execute(job('openai', {
        referenceImages: [reference, { mimeType: 'image/jpeg', data: jpeg.toString('base64') }],
    }, 'https://custom.example.test/openai/v1/')), { buffer: png, mime: 'image/png' });
    const [[generateUrl, generate], [editUrl, edit]] = upstream.mock.calls.map(call => call.arguments);
    assert.equal(generateUrl.href, 'https://api.openai.com/v1/images/generations');
    assert.equal(editUrl.href, 'https://custom.example.test/openai/v1/images/edits');
    for (const init of [generate, edit]) assert.equal(init.headers.Authorization, 'Bearer sample-key');
    assert.equal(generate.headers['Content-Type'], 'application/json');
    const expected = { ...openaiPayload, moderation: 'low' };
    assert.deepEqual(JSON.parse(generate.body), expected);
    const editRequest = new Request(editUrl, edit);
    assert.match(editRequest.headers.get('content-type'), /^multipart\/form-data; boundary=/);
    const form = await editRequest.formData();
    for (const [key, value] of Object.entries(expected)) assert.equal(form.get(key), String(value));
    const files = form.getAll('image[]');
    assert.deepEqual(files.map(file => file.type), ['image/png', 'image/jpeg']);
    assert.deepEqual(await Promise.all(files.map(async file => Buffer.from(await file.arrayBuffer()))), [png, jpeg]);
});

test('Gemini keeps final images in partial results, ignores thinking images, and does not retry', async t => {
    const controller = new AbortController();
    const upstream = t.mock.method(globalThis, 'fetch', async () => {
        const body = JSON.stringify({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [
            { thought: true, inlineData: reference }, { inlineData: reference },
        ] } }] });
        // The HTTP body arrived, but cancellation races with saving those bytes.
        return new Response(new ReadableStream({ start(stream) {
            stream.enqueue(new TextEncoder().encode(body));
            stream.close();
            controller.abort();
        } }));
    });
    const { readImageCollection } = await import('../../../modules/draw/shared/image-collection.js');
    const result = await execute(job('gemini', { referenceImages: [reference], resultMode: 'all' }), controller.signal);
    await assert.rejects(readImageCollection(new Response(result.buffer, { headers: { 'Content-Type': result.mime } })), asyncError => {
        assert.equal(asyncError.code, 'partial_result');
        assert.equal(asyncError.partialResult.images.length, 1);
        assert.equal(asyncError.partialResult.images[0].type, 'image/png');
        assert.equal(asyncError.partialResult.images[0].size, png.length);
        return true;
    });
    assert.equal(upstream.mock.callCount(), 1);
});

test('reference failures are surfaced without redirects, retries, or removal of the reference', async t => {
    const upstream = t.mock.method(globalThis, 'fetch', async url => url.host === 'api.openai.com'
        ? new Response(null, { status: 307, headers: { Location: 'https://redirect.example.test/' } })
        : Response.json({ candidates: [{ finishReason: 'IMAGE_SAFETY' }] }));
    await assert.rejects(execute(job('openai', { referenceImages: [reference] })), { code: 'upstream_error', status: 307 });
    await assert.rejects(execute(job('gemini', { referenceImages: [reference] })), { code: 'image_blocked' });
    assert.equal(upstream.mock.callCount(), 2);
    assert.ok(upstream.mock.calls.every(call => call.arguments[1].redirect === 'manual'));
});

test('image jobs reject query parameters in custom base URLs before contacting a provider', async t => {
    const upstream = t.mock.method(globalThis, 'fetch');
    for (const provider of ['gemini', 'openai']) {
        await assert.rejects(execute(job(provider, {}, 'https://custom.example.test/v1?key=not-forwarded')), { code: 'invalid_request', status: 400 });
    }
    assert.equal(upstream.mock.callCount(), 0);
});

test('image jobs enforce one shared reference signature, count, and decoded byte budget', () => {
    const large = Buffer.alloc(MAX_REFERENCE_BYTES / 2 + 1);
    png.copy(large);
    const largeReference = { mimeType: 'image/png', data: large.toString('base64') };
    const invalid = [
        [{ ...reference, mimeType: 'image/jpeg' }],
        [{ ...reference, data: 'iVBORw0KGgo\n' }],
        Array(MAX_REFERENCE_IMAGES + 1).fill(reference),
        [largeReference, largeReference],
    ];
    for (const provider of ['gemini', 'openai']) {
        assert.deepEqual(normalizeImageJobRequest(job(provider, { referenceImages: [largeReference] }), adapters).items[0].request.referenceImages, [largeReference]);
        for (const referenceImages of invalid) {
            assert.throws(() => normalizeImageJobRequest(job(provider, { referenceImages }), adapters), { code: 'invalid_request', status: 400 });
        }
    }
});
