import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { entry, uiEntry } from './helpers/story-summary-entry.js';
import { normalizeRecallTimeoutSec, normalizeRerankTimeoutSec, MAX_RECALL_TIMEOUT_SEC } from '../data/recall-settings.js';
import { createRecallPrefetchCoordinator } from '../generate/recall-prefetch.js';
import { recallCancellationNotice } from '../generate/recall-failure.js';

// Acceptance contracts (cost: silently discarded settings or interrupted recall):
// - Saving/reloading the chosen request budget preserves it through the panel and runtime.
// - Requests and connection tests may finish after 15 seconds within the chosen budget.
// - Every batch respects its deadline without retries; existing timeout fallback remains.
// - Caller cancellation still wins immediately over a longer request budget.
// - A saved deadline change retires adopted fallback memory before regeneration;
//   unchanged or failed saves preserve it (cost: silently reusing failed recall).
// - Deadline-only changes are silent and preserve the current generation;
//   content-changing configuration keeps its existing cancellation behavior.
const root = fileURLToPath(new URL('../../../', import.meta.url));
globalThis.__rerankTimeoutTest = { disk: null };
after(() => { delete globalThis.__rerankTimeoutTest; });
const shims = {
    'modules/text-api/repository.js': 'export const getTextApiRepository = async () => ({load: async () => {}});',
    'core/debug-core.js': 'export const xbLog = {info(){},warn(){},error(){}};',
    'core/server-storage.js': `const state = globalThis.__rerankTimeoutTest;
        export const CommonSettingStorage = {
            async setAndSave(_, value) {
                if (state.saveError) throw state.saveError;
                state.disk = structuredClone(value);
            },
            clearCache() {}, async getStrict() { return structuredClone(state.disk); }
        };`,
    'modules/story-summary/data/config-local-cache.js': 'export const SUMMARY_CONFIG_LOCAL_STORAGE_KEY="isolated-rerank-test"; export const writeSummaryConfigLocalCache=()=>{};',
};
const bundle = await build({
    stdin: { resolveDir: root, contents: `export * from './modules/story-summary/data/config.js';
        export * from './modules/story-summary/data/config-transitions.js';
        export * from './modules/story-summary/generate/recall-reuse.js';
        export * from './modules/story-summary/vector/llm/reranker.js';` },
    bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{ name: 'rerank-timeout-host-boundaries', setup(api) {
        api.onResolve({ filter: /extensions\.js$/ }, () => ({ path: 'extensions', namespace: 'stub' }));
        api.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const extension_settings = {};', loader: 'js' }));
        api.onLoad({ filter: /\.js$/ }, args => {
            const relative = path.relative(root, args.path).replaceAll('\\', '/');
            if (shims[relative]) return { contents: shims[relative], loader: 'js' };
        });
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Imports only our locally bundled test module.
const api = await import(await createTestModuleUrl(bundle.outputFiles[0].text));
function configure(timeoutSec) {
    api.applySummaryPanelConfigSnapshot({ vector: { rerankApi: {
        provider: 'custom', url: 'https://rerank.test/v1', key: 'isolated-fixture', model: 'rerank-fixture', timeoutSec,
    } } });
    return api.getVectorConfig().rerankApi;
}

function transport(t) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const requests = [];
    t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((resolve, reject) => {
        const request = { signal: options.signal, body: JSON.parse(options.body) };
        const abort = () => reject(new DOMException('fixture aborted', 'AbortError'));
        request.finish = () => {
            options.signal.removeEventListener('abort', abort);
            resolve(new Response(JSON.stringify({ results: request.body.documents.map((_, index) => ({ index, relevance_score: 1 })) })));
        };
        requests.push(request);
        if (options.signal.aborted) abort();
        else options.signal.addEventListener('abort', abort, { once: true });
    }));
    return requests;
}

test('saved request budgets survive server readback and panel normalization without changing other APIs', async () => {
    for (const [input, expected] of [[undefined, 15], [60, 60], ['', 15], [-1, 15], [Infinity, 15], [3_000_000, MAX_RECALL_TIMEOUT_SEC]]) {
        configure(input);
        const before = api.getSummaryPanelConfig();
        await api.saveSummaryPanelConfigVerified(before);
        api.applySummaryPanelConfigSnapshot({});
        await api.loadConfigFromServer();
        const saved = api.getVectorConfig();
        assert.equal(saved.rerankApi.timeoutSec, expected);
        assert.deepEqual(saved.l0Api, before.vector.l0Api);
        assert.deepEqual(saved.embeddingApi, before.vector.embeddingApi);
        const ui = uiEntry(['normalizeVectorConfigUI'], {
            config: { vector: saved }, normalizeProviderProfiles: () => ({}),
            normalizeRecallTimeoutSec, normalizeRerankTimeoutSec,
        });
        assert.equal(ui.normalizeVectorConfigUI(saved).rerankApi.timeoutSec, expected);
    }
});

test('normal requests and connection tests finish past the former limit using the saved budget', async t => {
    const requests = transport(t);
    const config = configure(60);
    for (const run of [() => api.rerank('query', ['document']), () => api.testRerankService(config)]) {
        const pending = run();
        t.mock.timers.tick(16_000);
        const request = requests.at(-1);
        assert.equal(request.signal.aborted, false);
        assert.equal(Object.hasOwn(request.body, 'timeoutSec'), false);
        request.finish();
        const result = await pending;
        assert.equal(result.failed ?? !result.success, false);
    }
    assert.equal(requests.length, 2);
});

test('saving a changed deadline retires timed-out memory so regeneration reranks again', async t => {
    const requests = transport(t);
    configure(15);
    const cache = api.createRecallReuse();
    const context = { chatId: 'isolated', chat: [{ is_user: true, mes: 'query' }] };
    const first = cache.prepare(context, 'normal');
    const pending = api.rerankChunks('query', [{ text: 'memory' }]);
    t.mock.timers.tick(15_000);
    const fallback = await pending;
    assert.equal(fallback[0]._rerankFailed, true);
    cache.adopt(first.ticket, context, { text: fallback[0].text, boundary: 0, role: 'system', report: '' });
    context.chat.push({ is_user: false, mes: 'answer' });
    let invalidations = 0;
    const save = timeoutSec => {
        const config = api.getSummaryPanelConfig();
        config.vector.rerankApi.timeoutSec = timeoutSec;
        return api.changeSummaryConfig({
            chatId: context.chatId, reason: 'panel-save', vectorChanged: true,
            applyChange: () => api.saveSummaryPanelConfigVerified(config),
            invalidateRecall: () => { invalidations++; cache.invalidate(); },
            afterVectorChange: async () => false,
        });
    };
    await save('15');
    assert.equal(invalidations, 0);
    assert.ok(cache.prepare(context, 'swipe').memory);
    globalThis.__rerankTimeoutTest.saveError = new Error('isolated save failure');
    try {
        await assert.rejects(save(60), { message: 'isolated save failure' });
    } finally {
        delete globalThis.__rerankTimeoutTest.saveError;
    }
    assert.equal(api.getVectorConfig().rerankApi.timeoutSec, 15);
    assert.equal(invalidations, 0);
    assert.ok(cache.prepare(context, 'swipe').memory);

    await save(60);
    assert.equal(invalidations, 1);
    assert.equal(cache.getStats().count, 0);
    assert.equal(requests.length, 1); // Saving alone must not buy another request.
    context.chat.pop(); // Native regeneration removes the current answer first.
    assert.equal(cache.prepare(context, 'regenerate').memory, null);
    const retry = api.rerankChunks('query', [{ text: 'memory' }]);
    t.mock.timers.tick(16_000);
    assert.equal(requests.length, 2);
    assert.equal(requests[1].signal.aborted, false);
    requests[1].finish();
    assert.equal(api.getRerankBatchDiagnostics(await retry).failedBatches, 0);
    await save(90); // Changing the deadline without an adopted result is harmless.
    assert.equal(cache.getStats().count, 0);
    assert.equal(requests.length, 2);
});

test('deadline saves and reloads retire only reusable memory without warnings or cancelling the current recall', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    for (const operation of ['save', 'reload']) {
        for (const phase of ['running', 'ready', 'idle', 'model-change']) {
            configure(15);
            const before = api.getSummaryPanelConfig();
            const next = structuredClone(before);
            next.vector.rerankApi.timeoutSec = 60;
            if (phase === 'model-change') {
                next.vector.rerankApi.model = 'different-model';
                next.vector.rerankApi.providers.custom.model = 'different-model';
            }
            const context = { chatId: 'isolated', chat: [{ is_user: true, mes: 'query' }] };
            const cache = api.createRecallReuse();
            cache.adopt(cache.prepare(context).ticket, context, { text: 'memory', boundary: 0, role: 'system', report: '' });
            let finish;
            const coordinator = createRecallPrefetchCoordinator({
                getContext: () => context, maxAgeMs: 120_000,
                prepare: () => new Promise(resolve => { finish = resolve; }),
            });
            const run = phase === 'idle' ? null : coordinator.join({ chatId: context.chatId, type: 'normal' }).slot;
            await Promise.resolve();
            if (phase === 'ready') {
                finish({ text: 'prepared' });
                await run.outcome;
            }
            const notices = [];
            let clearedPrompts = 0;
            const host = entry([
                'changePanelConfig', 'synchronizeSavedSummaryConfig', 'invalidateRecallForConfigChange',
                'cancelRecallAndClearPrompt', 'cancelActiveRecall', 'RECALL_REASONS_THAT_ABORT_GENERATION',
            ], {
                changeSummaryConfig: api.changeSummaryConfig, synchronizeSummaryConfig: api.synchronizeSummaryConfig,
                recallConfigKey: api.recallConfigKey, getRecallConfigChange: api.getRecallConfigChange,
                getContext: () => context, recallReuse: cache, recallPrefetch: coordinator, recallSourceSignal: null,
                serviceTests: { cancel() {} }, finishVectorConfigTransition: async () => false,
                recallCancellationNotice, notifyRecallFailure: notice => notices.push(notice),
                clearExtensionPrompt: () => { clearedPrompts++; },
            });
            try {
                if (operation === 'save') {
                    await host.changePanelConfig('panel-save', () => api.saveSummaryPanelConfigVerified(next));
                } else {
                    await api.saveSummaryPanelConfigVerified(next);
                    api.applySummaryPanelConfigSnapshot(before);
                    await host.synchronizeSavedSummaryConfig();
                }
                assert.equal(cache.getStats().count, 0);
                const cancelsCurrent = phase === 'model-change';
                assert.equal(notices.length, Number(cancelsCurrent), `${operation}/${phase}: warning`);
                assert.equal(clearedPrompts, Number(cancelsCurrent), `${operation}/${phase}: injected prompt`);
                if (run) assert.equal(run.controller.signal.aborted, cancelsCurrent, `${operation}/${phase}: cancellation`);
                if (run && !cancelsCurrent) {
                    finish({ text: 'current recall still completes' });
                    assert.equal((await coordinator.waitForOutcome(run)).ok, true);
                }
            } finally {
                finish?.({ text: 'cleanup' });
                coordinator.finish(run);
            }
        }
    }
});

test('each batch reaches the configured deadline once and preserves timeout fallback', async t => {
    const requests = transport(t);
    configure(60);
    const chunks = Array.from({ length: 45 }, (_, index) => ({ text: `memory-${index}` }));
    const pending = api.rerankChunks('query', chunks, { topN: chunks.length });
    t.mock.timers.tick(59_999);
    assert.equal(requests.length, 3);
    assert.ok(requests.every(request => !request.signal.aborted));
    t.mock.timers.tick(1);
    const result = await pending;
    assert.ok(requests.every(request => request.signal.aborted));
    assert.equal(requests.length, 3);
    assert.equal(api.getRerankBatchDiagnostics(result).failedBatches, 3);
    assert.ok(result.every(item => item._rerankFailed));
    assert.deepEqual(result.map(item => item.text), chunks.map(item => item.text));
});

test('an unchanged configuration keeps the original deadline for requests and probes', async t => {
    const requests = transport(t);
    const config = configure(undefined);
    const normal = api.rerank('query', ['document']);
    const probe = api.testRerankService(config).catch(error => error);
    t.mock.timers.tick(14_999);
    assert.ok(requests.every(request => !request.signal.aborted));
    t.mock.timers.tick(1);
    assert.equal((await normal).diagnostic.kind, 'timeout');
    assert.equal((await probe).cause.name, 'AbortError');
});

test('caller cancellation interrupts requests and probes without waiting for the chosen deadline', async t => {
    const requests = transport(t);
    const config = configure(120);
    const owner = new AbortController();
    const normal = api.rerank('query', ['document'], { signal: owner.signal });
    const probe = api.testRerankService(config, { signal: owner.signal });
    const rejected = [assert.rejects(normal, { name: 'AbortError' }), assert.rejects(probe, { name: 'AbortError' })];
    owner.abort();
    await Promise.all(rejected);
    assert.ok(requests.every(request => request.signal.aborted));
    assert.equal(requests.length, 2);
});
