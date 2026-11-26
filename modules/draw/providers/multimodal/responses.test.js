import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { createMultimodalFrontendTransport } from './frontend-transport.js';
import { decodeFixtureImage } from '../../shared/tests/helpers/image-decoder.js';
import { compileMultimodalBatch, createGenerationRecipe } from './compiler.js';
import { createDefaultSettings } from './settings-model.js';
import { createBackendItemError } from '../../shared/backend-image-jobs.js';
import { readImageCollection } from '../../shared/image-collection.js';
import service from '../../server/image-jobs/service.js';
import openai from '../../server/providers/openai/adapter.js';
import protocol from '../../shared/multimodal-image-protocol.cjs';

const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const jpg = '/9j/4A==';
const images = [{ mimeType: 'image/jpeg', data: jpg }, { mimeType: 'image/png', data: png }];
const prompt = 'Two travelers walk on the beach.';
const final = { type: 'image_generation_call', status: 'completed', result: png };
const completed = (...output) => ({ type: 'response.completed', response: { output } });
const partial = { type: 'response.image_generation_call.partial_image', partial_image_b64: jpg };
const frame = event => `event: ${event.type}\r\ndata: ${JSON.stringify(event)}\r\n\r\n`;
const byteStream = (data, size = 7) => {
    const bytes = new TextEncoder().encode(data);
    let offset = 0;
    return new Response(new ReadableStream({ pull(controller) {
        if (offset >= bytes.length) { controller.close(); return; }
        controller.enqueue(bytes.subarray(offset, offset += size));
    } }), { headers: { 'Content-Type': 'text/event-stream' } });
};
const stream = (...events) => byteStream(events.map(frame).join(''));

for (const mode of ['frontend', 'backend']) {
    test(`${mode}: GPT Image sends the selected format and fixed low moderation; Responses never resends failures`, async t => {
        const calls = [];
        let reply;
        const fetchImage = async (url, request) => {
            calls.push({ url: url.href, method: request.method, headers: request.headers, body: request.body });
            return reply();
        };
        const frontend = createMultimodalFrontendTransport('openai', { fetchImage, decodeImage: decodeFixtureImage });
        if (mode === 'backend') t.mock.method(globalThis, 'fetch', fetchImage);
        const run = async ({ referenceImages, imageApi = 'responses', all = false, description = prompt, params = {} } = {}) => {
            const settings = { ...createDefaultSettings('openai'), apiBaseUrl: 'https://images.example.test/custom/v1',
                apiKey: 'offline-token', imageApi, responsesModel: 'relay-caller', sendMode: mode };
            const { context, delay, items } = compileMultimodalBatch('openai', [{ scene: description }],
                createGenerationRecipe('openai', settings, { referenceImages, params: { size: '1536x1024', quality: 'high', background: 'opaque', ...params } }));
            if (all) items[0].request.resultMode = 'all';
            const signal = new AbortController().signal;
            if (mode === 'frontend') return frontend.requestImage(context, items[0], { signal });
            const normalized = service.normalizeImageJobRequest({ provider: 'openai', requestId: 'responses-offline', context, delay, items }, { openai });
            let result;
            try { result = await openai.execute({ context: normalized.context, item: normalized.items[0], signal }); }
            catch ({ code, message, status }) {
                throw createBackendItemError({ state: 'failed', error: { code, message, status } }, normalized.context);
            }
            const { buffer, mime } = result;
            return all ? readImageCollection(new Response(buffer, { headers: { 'Content-Type': mime } })) : buffer.toString('base64');
        };
        for (const referenceImages of [undefined, images]) {
            reply = () => stream(partial, completed({ type: 'message', content: [] }, final));
            const all = Boolean(referenceImages);
            const params = referenceImages ? { outputFormat: 'webp', background: 'transparent' } : {};
            const result = await run({ referenceImages, all, params });
            assert.equal(all ? Buffer.from(await result[0].arrayBuffer()).toString('base64') : result, png);
            const call = calls.at(-1);
            assert.equal(call.url, 'https://images.example.test/custom/v1/responses');
            assert.equal(call.method, 'POST');
            assert.deepEqual(call.headers, { Authorization: 'Bearer offline-token', 'Content-Type': 'application/json' });
            assert.deepEqual(JSON.parse(call.body), {
                model: 'relay-caller', tool_choice: 'required', stream: true,
                input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }, ...(referenceImages ? [
                    { type: 'input_image', image_url: `data:image/jpeg;base64,${jpg}` },
                    { type: 'input_image', image_url: `data:image/png;base64,${png}` },
                ] : [])] }],
                tools: [{ type: 'image_generation', model: 'gpt-image-2.6-flare', size: '1536x1024', quality: 'high',
                    background: referenceImages ? 'transparent' : 'opaque', output_format: referenceImages ? 'webp' : 'jpeg',
                    moderation: 'low', action: referenceImages ? 'edit' : 'generate' }],
            });
        }
        reply = () => stream(completed({ type: 'message', content: [{ text: 'Only text' }] }));
        await assert.rejects(run(), { code: 'responses_no_image' });
        reply = () => byteStream('event: error\rdata: {"code":"invalid_image","status":422,"message":"private key and prompt here"}\r\r', 1);
        await assert.rejects(run({ referenceImages: images }), error => {
            assert.equal(error.code, 'responses_image_failed');
            assert.equal(error.status, 422);
            assert.match(error.message, /invalid_image/);
            assert.doesNotMatch(error.message, /private key and prompt/);
            return true;
        });
        reply = () => stream(completed({ ...final, status: 'failed' }));
        await assert.rejects(run(), { code: 'responses_image_failed' });
        reply = () => stream(partial, { type: 'response.output_item.done', item: final });
        await assert.rejects(run(), { code: 'responses_stream_interrupted', imageRequestOutcome: 'unknown' });
        reply = () => stream(completed({ ...final, result: Buffer.from('not a picture').toString('base64') }));
        await assert.rejects(run(), { code: 'invalid_result' });
        reply = () => Response.json({ error: { message: 'private', code: 'not_found' } }, { status: 404 });
        await assert.rejects(run(), { code: 'responses_not_found', status: 404 });
        await assert.rejects(run({ imageApi: 'images' }), { code: 'images_not_found', status: 404 });
        assert.equal(calls.length, 9);
        assert.deepEqual(calls.slice(2).map(({ url }) => new URL(url).pathname), [
            ...Array(6).fill('/custom/v1/responses'), '/custom/v1/images/generations',
        ]);
        reply = () => byteStream('event: error\ndata: secret-key and secret-prompt\n\n', 1);
        await assert.rejects(run(), error => error.code === 'responses_image_failed'
            && error.imageRequestOutcome === 'rejected' && !error.message.includes('secret-'));
        const beforeFailures = calls.length;
        reply = () => new Response('Gateway timed out', { status: 504 });
        await assert.rejects(run(), { status: 504, imageRequestOutcome: 'unknown' });
        reply = () => { throw new TypeError('socket closed'); };
        await assert.rejects(run(), { code: 'image_connection_lost', imageRequestOutcome: 'unknown' });
        reply = () => new Response(null, { status: 401 });
        await assert.rejects(run(), { status: 401, imageRequestOutcome: 'rejected' });
        assert.equal(calls.length - beforeFailures, 3);
        for (const imageApi of ['images', 'responses']) {
            const badPng = 'iVBORw0KGgo=';
            const resultWith = (...data) => imageApi === 'responses'
                ? stream(completed(...data.map(result => ({ ...final, result })))) : Response.json({ data: data.map(b64_json => ({ b64_json })) });
            reply = () => resultWith(badPng);
            await assert.rejects(run({ imageApi }), { code: 'invalid_result', imageRequestOutcome: 'rejected' });
            reply = () => resultWith(badPng, png);
            await assert.rejects(run({ imageApi, all: true }), asyncError => {
                assert.equal(asyncError.code, 'partial_result');
                assert.equal(asyncError.partialResult.images[0].size, Buffer.from(png, 'base64').length);
                return true;
            });
            reply = () => imageApi === 'responses' ? stream(completed(final)) : Response.json({ data: [{ b64_json: png }] });
            assert.equal(await run({ imageApi, description: 'a'.repeat(32000) }), png);
            const beforeInvalid = calls.length;
            await assert.rejects(run({ imageApi, description: 'a'.repeat(32001) }), { code: 'invalid_image_prompt' });
            assert.equal(calls.length, beforeInvalid);
        }
        reply = () => Response.json({ data: [{ b64_json: png }] });
        await run({ imageApi: 'images' });
        assert.equal(new URL(calls.at(-1).url).pathname, '/custom/v1/images/generations');
        assert.deepEqual(JSON.parse(calls.at(-1).body), { model: 'gpt-image-2.6-flare', prompt, size: '1536x1024',
            quality: 'high', background: 'opaque', output_format: 'jpeg', n: 1, moderation: 'low' });
        await run({ imageApi: 'images', referenceImages: images, params: { outputFormat: 'png', background: 'transparent' } });
        const edit = calls.at(-1);
        assert.equal(new URL(edit.url).pathname, '/custom/v1/images/edits');
        assert.deepEqual(Object.fromEntries([...edit.body].filter(([key]) => key !== 'image[]')), {
            model: 'gpt-image-2.6-flare', prompt, size: '1536x1024', quality: 'high',
            background: 'transparent', output_format: 'png', n: '1', moderation: 'low',
        });
        assert.equal(edit.body.getAll('image[]').length, images.length);
        const beforeIncompatible = calls.length;
        for (const imageApi of ['images', 'responses']) {
            await assert.rejects(run({ imageApi, params: { background: 'transparent', outputFormat: 'jpeg' } }), {
                code: 'image_transparency_requires_alpha', imageRequestOutcome: 'not-submitted',
            });
        }
        assert.equal(calls.length, beforeIncompatible);
    });
}

test('a completed Responses frame is read once, regardless of line endings and chunk boundaries', async () => {
    const context = { imageApi: 'responses' };
    for (const newline of ['\n', '\r\n', '\r']) {
        const body = [': keepalive', '', 'event: response.completed', 'data: {"response":', `data: ${JSON.stringify({
            output: [{ type: 'message', content: [{ text: '灯下避雨' }] }, final],
        })}}`, '', ''].join(newline);
        const result = await protocol.protocols.openai.readResult(byteStream(body, 1), context);
        assert.deepEqual(result.values, [{ data: png }]);
    }
    const resultData = png + 'A'.repeat(8 * 1024 * 1024);
    const result = await protocol.protocols.openai.readResult(byteStream(frame(completed({ ...final, result: resultData })), 4096), context);
    assert.equal(result.values[0].data, resultData);
});
