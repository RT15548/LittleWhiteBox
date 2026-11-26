import assert from 'node:assert/strict';
import Ajv from 'ajv';
import { drawTools } from '../../assistant/contract.js';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { createDrawPublicApi } from '../../shared/public-api.js';
import { prepareImageInput } from '../../shared/prepared-image-input.js';
import { compileDrawRunImages } from '../../node-entry.js';
import { IMAGE_COLLECTION_MIME, packImageCollection } from '../../shared/image-collection.js';
import { compileMultimodalBatch, createGenerationRecipe } from './compiler.js';
import { adaptUnplannedTask, createDirectGeneration } from './direct-generation.js';
import { createDefaultSettings } from './settings-model.js';
import { createMultimodalFrontendTransport } from './frontend-transport.js';
import service from '../../server/image-jobs/service.js';
import gemini from '../../server/providers/gemini/adapter.js';
import openai from '../../server/providers/openai/adapter.js';
import { decodeFixtureImage } from '../../shared/tests/helpers/image-decoder.js';

const image = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64'));
const refs = [{ mimeType: 'image/png', data: Buffer.from(image).toString('base64') }];
const description = 'A fully clothed traveler gazes out over a moonlit river.';
const makeSettings = provider => ({ ...createDefaultSettings(provider), apiKey: 'test-key', apiBaseUrl: 'https://image.example.test/v1', sendMode: 'backend' });
const wireText = (provider, item) => provider === 'gemini' ? item.payload.contents[0].parts[0].text : item.payload.prompt;

test('the assistant can request GPT Image WebP for this call without changing the saved preset', async () => {
    const validate = new Ajv().compile(drawTools()[0].function.parameters);
    const request = { provider: 'openai', prompt: 'Draw a paper lantern', params: { outputFormat: 'webp' } };
    assert.equal(validate(request), true);
    assert.equal(validate({ ...request, params: { outputFormat: 'gif' } }), false);
    const settings = { ...makeSettings('openai'), sendMode: 'frontend' };
    const captured = [];
    const adapter = createDirectGeneration('openai', {
        plan: async () => ({ prompt: description }),
        frontend: { async requestImage(_context, item) {
            captured.push(item.request.payload.output_format);
            return [new Blob([image], { type: 'image/png' })];
        } },
    });
    await adapter.generate(request, settings);
    await adapter.generate({ prompt: request.prompt }, settings);
    assert.deepEqual(captured, ['webp', 'jpeg']);
});

for (const provider of ['gemini', 'openai']) {
    test(`${provider}: front-end generation and edits use the custom address without a backend job`, async () => {
        const settings = { ...makeSettings(provider), sendMode: 'frontend' };
        const calls = [];
        const adapter = createDirectGeneration(provider, {
            plan: async (_id, input) => ({ ...input, prompt: description }),
            frontend: createMultimodalFrontendTransport(provider, { decodeImage: decodeFixtureImage, fetchImage: async (url, init) => {
                calls.push({ url: url.href, init });
                return Response.json(provider === 'gemini'
                    ? { candidates: [{ content: { parts: [{ inlineData: refs[0] }] } }] }
                    : { data: [{ b64_json: refs[0].data }] });
            } }),
        });
        for (const referenceImages of [undefined, refs]) {
            const result = await adapter.generate({ prompt: 'draw a river', referenceImages }, settings);
            assert.equal(result[0].type, 'image/png');
        }
        const [generate, edit] = calls;
        if (provider === 'gemini') {
            assert.equal(generate.url, `${settings.apiBaseUrl}/models/${settings.paramsPresets[0].params.model}:generateContent`);
            assert.equal(edit.url, generate.url);
            assert.equal(edit.init.headers['x-goog-api-key'], settings.apiKey);
            assert.deepEqual(JSON.parse(generate.init.body).contents[0].parts, [{ text: description }]);
            assert.deepEqual(JSON.parse(edit.init.body).contents[0].parts, [{ text: description }, { inlineData: refs[0] }]);
        } else {
            assert.equal(generate.url, `${settings.apiBaseUrl}/images/generations`);
            assert.equal(JSON.parse(generate.init.body).prompt, description);
            assert.equal(edit.url, `${settings.apiBaseUrl}/images/edits`);
            assert.equal(edit.init.headers.Authorization, `Bearer ${settings.apiKey}`);
            assert.equal(edit.init.body.get('prompt'), description);
            assert.deepEqual(new Uint8Array(await edit.init.body.get('image[]').arrayBuffer()), image);
        }
    });

    for (const referenceImages of [undefined, refs]) {
        test(`${provider}: ${referenceImages ? 'edit' : 'generate'} passes the real image-job validator`, async () => {
            const adapter = createDirectGeneration(provider, {
                plan: async (_id, input) => ({ ...input, prompt: description }),
                jobs: { async runJob(job, handlers) {
                    const normalized = service.normalizeImageJobRequest({ ...job, requestId: 'direct-job' }, { gemini, openai });
                    const [image] = normalized.items;
                    assert.equal(image.request.resultMode, 'all');
                    assert.deepEqual(image.request.referenceImages, referenceImages);
                    await handlers.onItemReady({ response: new Response(imageBytes, { headers: { 'Content-Type': 'image/png' } }) });
                } },
            });
            const imageBytes = image;
            assert.equal((await adapter.generate({ prompt: 'draw a river', referenceImages }, makeSettings(provider))).length, 1);
        });
    }
    test(`${provider}: public edit adapts all guidance before sending and collects charged partial results`, async () => {
        const settings = makeSettings(provider);
        const stages = [];
        let collected;
        const adapter = createDirectGeneration(provider, { snapshot: () => settings,
            async plan(id, input, config) {
                stages.push('plan');
                assert.equal(id, provider);
                assert.equal(config.apiKey, settings.apiKey);
                assert.equal(input.prompt, 'original request');
                assert.equal(input.positivePrefix, 'art direction');
                assert.equal(input.negativePrompt, 'explicit exclusions');
                assert.deepEqual(input.characterPrompts, [{ name: 'Dawn', prompt: 'silver coat', uc: 'red trim' }]);
                return { ...input, prompt: description };
            },
            jobs: { async runJob(job, handlers) {
                stages.push('submit');
                assert.equal(job.provider, provider);
                assert.deepEqual(job.context, { url: settings.apiBaseUrl, key: settings.apiKey,
                    ...(provider === 'openai' ? { imageApi: 'images', responsesModel: '' } : {}) });
                assert.equal(job.items.length, 1);
                assert.equal(handlers.retryCreate, false);
                const { request } = job.items[0];
                assert.equal(wireText(provider, request), description);
                assert.equal(request.resultMode, 'all');
                assert.deepEqual(request.referenceImages, refs);
                assert.equal(provider === 'gemini' ? request.payload.generationConfig.imageConfig.aspectRatio : request.payload.size,
                    provider === 'gemini' ? '4:3' : '1536x1024');
                await handlers.onItemReady({ response: new Response(packImageCollection([image], true), { headers: { 'Content-Type': IMAGE_COLLECTION_MIME } }) });
            } },
        });
        const draw = createDrawPublicApi({ isEnabled: () => true, getProvider: () => provider, providers: { [provider]: adapter },
            captureGallery: () => async (images, metadata) => { stages.push('collect'); collected = { images, metadata }; },
        });
        await assert.rejects(draw.generate({ prompt: 'original request', positivePrefix: 'art direction', negativePrompt: 'explicit exclusions',
            characterPrompts: [{ name: 'Dawn', prompt: 'silver coat', uc: 'red trim' }], referenceImages: refs,
            overrideSize: provider === 'gemini' ? '4:3' : '1536x1024',
        }), { code: 'partial_result' });
        assert.deepEqual(stages, ['plan', 'submit', 'collect']);
        assert.equal(collected.images[0].type, 'image/png');
        assert.equal(collected.metadata.presetId, settings.selectedParamsPresetId);
    });

    test(`${provider}: registered compilers preserve native and redraw placement and consume only adapted text`, async () => {
        const settings = makeSettings(provider);
        const placements = [{ mode: 'replace', marker: '[img]original[/img]', start: 11, end: 30 }, { mode: 'existing', slotId: 'original-slot' }];
        const prompts = [];
        const tasks = await Promise.all(placements.map(placement => adaptUnplannedTask(provider, { scene: 'raw', placement,
            characterPrompts: [{ name: 'Dawn', prompt: 'silver coat', uc: 'red trim', center: { x: 0.5, y: 0.5 } }],
            post_prompt: 'saved detail', negativePrompt: 'saved exclusions', title: 'River',
        }, settings, { async plan(_provider, input) { prompts.push(input); return { prompt: description }; } })));
        assert.equal(prompts.length, placements.length);
        for (const input of prompts) {
            assert.equal(input.prompt, 'raw\nsaved detail');
            assert.equal(input.negativePrompt, 'saved exclusions');
            assert.deepEqual(input.characterPrompts, [{ name: 'Dawn', prompt: 'silver coat', uc: 'red trim' }]);
        }
        placements.forEach((placement, index) => assert.equal(tasks[index].placement, placement));
        const recipe = createGenerationRecipe(provider, settings);
        const prepared = prepareImageInput(provider, tasks, recipe);
        assert.deepEqual(prepared.metadata.map(entry => entry.tags), [description, description]);
        assert.deepEqual(prepared.metadata.map(entry => entry.title), ['River', 'River']);
        assert.deepEqual(compileDrawRunImages(provider, tasks, recipe).items, prepared.compiledBatch.items);
        assert.deepEqual(prepared.compiledBatch.items.map(({ request }) => wireText(provider, request)), [description, description]);
    });
}

test('Gemini refuses an undecodable image before either sending mode hands it to the gallery', async t => {
    const context = { url: 'https://image.example.test/v1', key: 'fixture-key' };
    const { items: [item] } = compileMultimodalBatch('gemini', [{ scene: description }], createGenerationRecipe('gemini', makeSettings('gemini')));
    const fetchImage = t.mock.method(globalThis, 'fetch', async () => Response.json({ candidates: [{ content: { parts: [
        { inlineData: { mimeType: 'image/png', data: 'iVBORw0KGgo=' } },
    ] } }] }));
    const signal = new AbortController().signal;
    const frontend = createMultimodalFrontendTransport('gemini', { decodeImage: decodeFixtureImage });
    await assert.rejects(frontend.requestImage(context, item, { signal }), { code: 'invalid_result', imageRequestOutcome: 'rejected' });
    await assert.rejects(gemini.execute({ context, item, signal }), { code: 'invalid_result' });
    assert.equal(fetchImage.mock.callCount(), 2);
});

test('direct requests still deliver and honor both cancellation and timeout without AbortSignal.any', async () => {
    const any = Object.getOwnPropertyDescriptor(AbortSignal, 'any');
    const timeout = Object.getOwnPropertyDescriptor(AbortSignal, 'timeout');
    const deadline = new AbortController();
    Object.defineProperty(AbortSignal, 'any', { ...any, value: undefined });
    Object.defineProperty(AbortSignal, 'timeout', { ...timeout, value: () => deadline.signal });
    try {
        const settings = makeSettings('openai');
        const { context, items: [item] } = compileMultimodalBatch('openai', [{ scene: description }], createGenerationRecipe('openai', settings));
        const cancel = new AbortController();
        let interrupt;
        const transport = createMultimodalFrontendTransport('openai', { decodeImage: decodeFixtureImage, fetchImage: async (_url, { signal }) => {
            interrupt?.();
            signal.throwIfAborted();
            return Response.json({ data: [{ b64_json: refs[0].data }] });
        } });
        const request = signal => transport.requestImage(context, item, { signal });
        assert.equal(await request(cancel.signal), refs[0].data);
        interrupt = () => cancel.abort();
        await assert.rejects(request(cancel.signal), { name: 'AbortError' });
        interrupt = () => deadline.abort(new DOMException('timeout fixture', 'TimeoutError'));
        await assert.rejects(request(new AbortController().signal), { name: 'TimeoutError' });
    } finally {
        Object.defineProperty(AbortSignal, 'any', any);
        Object.defineProperty(AbortSignal, 'timeout', timeout);
    }
});

test('a cancelled adaptation cannot send an image job even if the planner produced text', async () => {
    const provider = 'openai';
    const controller = new AbortController();
    let submitted = false;
    const adapter = createDirectGeneration(provider, { jobs: { async runJob() { submitted = true; } },
        async plan(_provider, input) { controller.abort(); return { ...input, prompt: description }; },
    });
    await assert.rejects(adapter.generate({ prompt: 'raw' }, makeSettings(provider), { signal: controller.signal }), { name: 'AbortError' });
    assert.equal(submitted, false);
});
