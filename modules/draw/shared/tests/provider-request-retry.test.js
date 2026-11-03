import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { fixture } from './helpers/draw-journey.js';
import { IMAGE_BATCH_JOBS_CAPABILITY, DRAW_WORK_CANCELLATION_CAPABILITY } from '../backend-image-jobs.js';

// Acceptance contracts (cost: duplicate charges / discarded paid results):
// - Only direct NovelAI HTTP 5xx retries once; proxy modes and transport failures never regenerate.
// - Removal or cancellation before either submission prevents that submission.
// - A successful retry is delivered once; final failure keeps its actual cause on the card.
const host = {};
globalThis.__providerRetryTest = host;
const { window, document } = parseHTML('<html><body></body></html>');
Object.assign(globalThis, { window, document });
const stubs = {
    'extensions.js': 'exports.getContext=()=>({chat:[],characters:[]});',
    'script.js': 'exports.getRequestHeaders=()=>({});',
    'utils.js': 'exports.uuidv4=()=>"retry-fixture";',
    'user.js': 'exports.getCurrentUserHandle=()=>"retry-user";',
    'event-manager.js': 'exports.createModuleEvents=()=>({});exports.event_types={};',
    'server-storage.js': 'exports.NovelDrawStorage={};exports.SdDrawStorage={};exports.ComfyDrawStorage={};',
    'scene-planner.js': 'module.exports={};',
    'worldbook-processor.js': 'module.exports={};',
    'draw-agent.js': 'module.exports={};',
    'draw-common.js': 'exports.DEFAULT_MESSAGE_FILTER_RULES=[];',
    'after-ai-gate.js': 'module.exports={};',
    'serial-image-request-queue.js': 'exports.createSerialImageRequestQueue=()=>({enqueue:run=>run()});',
    'recoverable-image-jobs.js': 'exports.submitRecoverableImageJob=input=>globalThis.__providerRetryTest.backendJob(input);',
};
const bundle = await build({
    stdin: { contents: `export {runNovelImageBatch} from '../../providers/novelai/novel-draw.js';
        export {generateSdImage} from '../../providers/sd-webui/sd-draw.js';
        export {generateComfyImage} from '../../providers/comfyui/comfy-draw.js';`,
    resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, platform: 'node', format: 'esm',
    plugins: [{ name: 'retry-host-boundaries', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        builder.onLoad({ filter: /[\\/]novel-draw\.js$/ }, async ({ path }) => ({
            contents: `${await readFile(path, 'utf8')}
                getRuntimeSettings=()=>globalThis.__providerRetryTest.settings;
                checkBackendPluginStatus=async()=>globalThis.__providerRetryTest.backendStatus;
                export {runNovelImageBatch};`,
        }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Only local source and fixed offline host stubs enter this bundle.
const api = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=provider-request-retry-fixture.mjs').toString('base64'));
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN3sAAAAASUVORK5CYII=', 'base64');
const compiledBatch = { items: [{ request: { url: 'https://novelai.invalid/ai/generate-image', transport: 'legacy-image', payload: {} } }] };
function novel(sendMode = 'frontend', handlers = {}, useImageBackendJobs = false) {
    host.settings = { apiKey: 'offline-fixture', sendMode, timeout: 30000, useImageBackendJobs };
    host.backendStatus = { ready: true, capabilities: [IMAGE_BATCH_JOBS_CAPABILITY, DRAW_WORK_CANCELLATION_CAPABILITY] };
    return api.runNovelImageBatch({ requests: [{}], compiledBatch, ...handlers });
}

test('actual providers retry HTTP 5xx only for direct NovelAI, at most once', async t => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });
    for (const status of [500, 501, 502, 503, 504, 599]) {
        for (const mode of ['frontend', 'frontend-v5', 'backend', 'sd', 'comfy-proxy', 'comfy-direct']) {
            let requests = 0;
            globalThis.fetch = async () => { requests++; return new Response('upstream failure', { status }); };
            if (mode === 'frontend' || mode === 'frontend-v5' || mode === 'backend') {
                const result = mode === 'frontend-v5' ? await novel('frontend', {
                    compiledBatch: { items: [{ request: { ...compiledBatch.items[0].request, transport: 'msgpack-stream' } }] },
                }) : await novel(mode);
                assert.equal(result.outcomes[0].state, 'failed');
                assert.equal(result.outcomes[0].error.status, status);
            } else if (mode === 'sd') {
                await assert.rejects(api.generateSdImage({ payload: {}, generationConfig: { host: 'https://sd.invalid', prepared: true } }));
            } else {
                await assert.rejects(api.generateComfyImage({ prepared: { workflow: {} },
                    generationConfig: { host: 'https://comfy.invalid', prepared: true,
                        connectionMode: mode === 'comfy-direct' ? 'direct' : 'proxy' } }));
            }
            assert.equal(requests, mode.startsWith('frontend') ? 2 : 1, `${mode}: HTTP ${status}`);
        }
    }
    let submissions = 0;
    host.backendJob = async handlers => {
        submissions++;
        await handlers.onItemSettled({ index: 0, state: 'failed', error: { status: 503, message: 'upstream failure' } });
        return {};
    };
    globalThis.fetch = async () => { throw Error('Background failure must not fall back to another request'); };
    const result = await novel('backend', { recoverable: { plan: {} } }, true);
    assert.equal(submissions, 1);
    assert.equal(result.outcomes[0].state, 'failed');
    assert.equal(result.outcomes[0].error.status, 503);
});

test('direct NovelAI never retries rejection, disconnection, timeout or a broken success body', async t => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });
    const failures = [
        ...[400, 401, 402, 429].map(status => () => new Response('rejected', { status })),
        () => { throw new TypeError('Failed to fetch'); },
        () => { throw new DOMException('timeout', 'AbortError'); },
        () => new Response(new ReadableStream({ start(controller) { controller.error(new TypeError('stream lost')); } }),
            { headers: { 'Content-Type': 'image/png' } }),
    ];
    for (const failure of failures) {
        let requests = 0;
        globalThis.fetch = async () => { requests++; return failure(); };
        const result = await novel();
        assert.equal(requests, 1);
        assert.equal(result.outcomes[0].state, 'failed');
    }
});

test('a successful NovelAI retry is delivered once and checks admission twice', async t => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });
    let requests = 0, starts = 0, deliveries = 0;
    globalThis.fetch = async () => ++requests === 1 ? new Response('busy', { status: 503 })
        : new Response(image, { headers: { 'Content-Type': 'image/png' } });
    const result = await novel('frontend', {
        onItemStarting: () => { starts++; }, onItemReady: () => { deliveries++; },
    });
    assert.equal(result.outcomes[0].state, 'ready');
    assert.equal(requests, 2); assert.equal(starts, 2); assert.equal(deliveries, 1);
});

test('cancellation during either admission or the first HTTP failure cannot resubmit', async t => {
    const originalFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = originalFetch; });
    for (const cancelAt of ['first-admission', 'http-failure', 'retry-admission']) {
        const controller = new AbortController();
        let requests = 0, starts = 0;
        globalThis.fetch = async () => {
            requests++;
            if (cancelAt === 'http-failure') controller.abort();
            return new Response('unavailable', { status: 503 });
        };
        await novel('frontend', { signal: controller.signal, onItemStarting: async () => {
            starts++;
            if (cancelAt === 'first-admission' || cancelAt === 'retry-admission' && starts === 2) controller.abort();
        } });
        assert.equal(requests, cancelAt === 'first-admission' ? 0 : 1);
    }
});

test('removing an actual in-flight card prevents a NovelAI retry and leaves no image record', async t => {
    const h = await fixture(['body']); t.after(h.stop);
    h.start(); await h.pump(3);
    let requests = 0, release;
    globalThis.fetch = async () => {
        requests++;
        if (requests === 1) return new Promise(resolve => { release = resolve; });
        return new Response(image, { headers: { 'Content-Type': 'image/png' } });
    };
    const completed = h.api.submitPreparedChatImages({ ctx: h.ctx, message: h.ctx.chat[0], messageId: 0,
        sourceText: 'body', tasks: [{ scene: 'image', placement: { mode: 'tail' } }], metadata: [{ tags: 'image' }],
        backend: false, run: handlers => novel('frontend', handlers) });
    await h.pump(8);
    assert.equal(requests, 1);
    await h.api.removeChatImageSlot(h.body(0).querySelector('.xb-nd-img'));
    release(new Response('unavailable', { status: 503 }));
    const output = await completed;
    assert.equal(requests, 1);
    assert.equal(output.results[0].discarded, true);
    assert.deepEqual(await h.api.getPreviewsForMessage(h.ctx.chatId, 0), []);
});

test('the final provider error reaches the stored failure card without replacement warnings', async t => {
    const h = await fixture(['body']); t.after(h.stop);
    let lastError;
    globalThis.fetch = async () => new Response('upstream unavailable', { status: 503 });
    await h.api.submitPreparedChatImages({ ctx: h.ctx, message: h.ctx.chat[0], messageId: 0,
        sourceText: 'body', tasks: [{ scene: 'image', placement: { mode: 'tail' } }], metadata: [{ tags: 'image' }],
        backend: false, run: handlers => novel('backend', { ...handlers, onItemSettled: async details => {
            lastError = details.error;
            await handlers.onItemSettled(details);
        } }) });
    const [record] = await h.api.getPreviewsForMessage(h.ctx.chatId, 0);
    assert.equal(record.errorMessage, lastError.message);
    assert.ok(h.body(0).textContent.includes(lastError.message));
    assert.deepEqual(h.counters.warnings, []);
});
