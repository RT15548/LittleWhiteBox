import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { uiEntry } from './helpers/story-summary-entry.js';
import * as deadlines from '../data/recall-settings.js';

// Acceptance contracts:
// - Save, reload and provider switching retain the query deadline without changing
//   other API settings (cost: silently discarded settings and repeated requests).
// - A slow query gets its chosen budget; only expiry permits the existing retry,
//   and edits affect the next query, not an active run (cost: duplicate billed work).
// - Cancellation stops both an active attempt and its retry wait; non-query
//   embedding deadlines remain unchanged (cost: unwanted requests/chat interruption).
const root = fileURLToPath(new URL('../../../', import.meta.url));
globalThis.__queryTimeoutTest = { disk: null };
after(() => { delete globalThis.__queryTimeoutTest; });
const shims = {
    'modules/text-api/repository.js': 'export const getTextApiRepository = async () => ({load: async () => {}});',
    'core/debug-core.js': 'export const xbLog = {info(){},warn(){},error(){}};',
    'core/server-storage.js': `const state = globalThis.__queryTimeoutTest;
        export const CommonSettingStorage = {
            async setAndSave(_, value) { state.disk = structuredClone(value); },
            clearCache() {}, async getStrict() { return structuredClone(state.disk); }
        };`,
    'modules/story-summary/data/config-local-cache.js': 'export const SUMMARY_CONFIG_LOCAL_STORAGE_KEY="isolated-query-test"; export const writeSummaryConfigLocalCache=()=>{};',
};
const bundle = await build({
    stdin: { resolveDir: root, contents: `export * from './modules/story-summary/data/config.js';
        export * from './modules/story-summary/vector/retrieval/query-embedding.js';
        export { embed } from './modules/story-summary/vector/utils/embedder.js';` },
    bundle: true, write: false, platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{ name: 'query-timeout-host-boundaries', setup(api) {
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
    api.applySummaryPanelConfigSnapshot({ vector: { recallTimeoutSec: 90,
        embeddingApi: { provider: 'custom', url: 'https://embedding.test/v1', key: 'isolated-fixture', model: 'embedding-fixture', timeoutSec },
        rerankApi: { timeoutSec: 45 },
    } });
    return api.getVectorConfig();
}

test('query deadline survives the actual form, saved readback and provider switching independently of other budgets', async () => {
    const { document } = parseHTML(readFileSync(new URL('../story-summary.html', import.meta.url), 'utf8'));
    const config = { vector: configure(6) };
    const ui = uiEntry(['getVectorApiConfig', 'loadVectorApiConfig', 'normalizeVectorConfigUI', 'normalizeProviderProfiles', 'createDefaultProviderProfile', 'saveCurrentVectorApiProfile', 'updateVectorProviderUI'], {
        config, $: id => document.getElementById(id), ...deadlines,
        VECTOR_API_TIMEOUT_NORMALIZERS: { embedding: deadlines.normalizeQueryEmbeddingTimeoutSec, rerank: deadlines.normalizeRerankTimeoutSec },
        VECTOR_API_SUPPORTED_PROVIDERS: { embedding: ['siliconflow', 'custom'], l0: ['siliconflow', 'openrouter', 'custom'], rerank: ['siliconflow', 'custom'] },
        VECTOR_API_DEFAULT_MODELS: { embedding: 'embedding-fixture' },
        VECTOR_PROVIDER_DEFAULTS: { siliconflow: {url: 'https://api.siliconflow.cn/v1', needKey: true, canFetch: true}, custom: {url: '', needKey: true, canFetch: true} },
        setSelectOptions() {},
    });
    ui.loadVectorApiConfig('embedding', config.vector.embeddingApi);
    document.getElementById('embedding-api-timeout').value = '60';
    ui.saveCurrentVectorApiProfile('embedding', 'custom');
    ui.updateVectorProviderUI('embedding', 'siliconflow');
    ui.updateVectorProviderUI('embedding', 'custom');
    const before = api.getSummaryPanelConfig();
    const draft = structuredClone(before);
    draft.vector.embeddingApi = JSON.parse(JSON.stringify(ui.getVectorApiConfig('embedding')));
    await api.saveSummaryPanelConfigVerified(draft);
    api.applySummaryPanelConfigSnapshot({});
    await api.loadConfigFromServer();
    const saved = api.getVectorConfig();
    assert.equal(saved.embeddingApi.timeoutSec, 60);
    assert.deepEqual(saved.rerankApi, before.vector.rerankApi);
    assert.deepEqual(saved.l0Api, before.vector.l0Api);
    assert.equal(saved.recallTimeoutSec, before.vector.recallTimeoutSec);
    config.vector = ui.normalizeVectorConfigUI(saved);
    document.getElementById('embedding-api-timeout').value = '';
    ui.loadVectorApiConfig('embedding', config.vector.embeddingApi);
    assert.equal(document.getElementById('embedding-api-timeout').value, '60');
});

test('missing and invalid imported query deadlines keep a usable browser timer', () => {
    for (const [input, expected] of [[undefined, 6], ['', 6], [-1, 6], [Infinity, 6], [60, 60], [3_000_000, deadlines.MAX_RECALL_TIMEOUT_SEC]]) {
        assert.equal(configure(input).embeddingApi.timeoutSec, expected);
    }
});

function transport(t) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const requests = [];
    t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((resolve, reject) => {
        const request = { signal: options.signal, body: JSON.parse(options.body) };
        const abort = () => reject(new DOMException('fixture aborted', 'AbortError'));
        request.finish = () => {
            options.signal.removeEventListener('abort', abort);
            resolve(new Response(JSON.stringify({ data: request.body.input.map((_, index) => ({ index, embedding: [1, 0] })) })));
        };
        requests.push(request);
        if (options.signal.aborted) abort();
        else options.signal.addEventListener('abort', abort, { once: true });
    }));
    return requests;
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('a slow query completes beyond six seconds without issuing duplicate work', async t => {
    const requests = transport(t);
    const pending = api.embedRecallQuery(['old', 'recent', 'focus'], configure(60));
    t.mock.timers.tick(30_000);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].signal.aborted, false);
    assert.deepEqual(Object.keys(requests[0].body).sort(), ['input', 'model']);
    requests[0].finish();
    assert.equal((await pending).length, 3);
});

test('expiry retries after the existing pause with one frozen budget, while the next query uses edits', async t => {
    const requests = transport(t);
    const config = configure(60);
    const owner = new AbortController();
    const pending = api.embedRecallQuery(['focus'], config, { signal: owner.signal });
    const cancelled = assert.rejects(pending, { name: 'AbortError' });
    config.embeddingApi.timeoutSec = 120;
    t.mock.timers.tick(59_999);
    assert.equal(requests[0].signal.aborted, false);
    t.mock.timers.tick(1);
    await flush();
    assert.equal(requests[0].signal.aborted, true);
    t.mock.timers.tick(999);
    await flush();
    assert.equal(requests.length, 1);
    t.mock.timers.tick(1);
    await flush();
    assert.equal(requests.length, 2);
    assert.deepEqual(requests[1].body, requests[0].body);
    t.mock.timers.tick(60_000);
    await flush();
    assert.equal(requests[1].signal.aborted, true);
    owner.abort();
    await cancelled;
    t.mock.timers.tick(10_000);
    await flush();
    assert.equal(requests.length, 2);
    const next = api.embedRecallQuery(['focus'], config);
    t.mock.timers.tick(61_000);
    assert.equal(requests[2].signal.aborted, false);
    requests[2].finish();
    await next;
});

test('stopping cancels a long attempt immediately and non-query embedding keeps its existing timeout', async t => {
    const requests = transport(t);
    const config = configure(120);
    const owner = new AbortController();
    const pending = api.embedRecallQuery(['focus'], config, { signal: owner.signal });
    const cancelled = assert.rejects(pending, { name: 'AbortError' });
    owner.abort();
    await cancelled;
    assert.equal(requests[0].signal.aborted, true);
    t.mock.timers.tick(121_000);
    await flush();
    assert.equal(requests.length, 1);
    const background = api.embed(['background'], config);
    const timedOut = assert.rejects(background, error => error.embeddingFailure?.kind === 'timeout');
    t.mock.timers.tick(30_000);
    await timedOut;
    assert.equal(requests[1].signal.aborted, true);
});
