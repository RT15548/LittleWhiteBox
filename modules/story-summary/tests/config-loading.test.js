/* global Buffer */
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StorageFile } from '../../../core/storage-file.js';

// Exercise the real settings normalization and server storage reader. The only
// replacements are host settings, diagnostics, browser storage and HTTP.
const host = globalThis.__summaryConfigLoadingTest = {};
const previousLocalStorage = globalThis.localStorage;
const previousFetch = globalThis.fetch;
const local = new Map();
globalThis.localStorage = {
    getItem: key => local.get(key) ?? null,
    setItem: (key, value) => local.set(key, String(value)),
};
const shims = {
    'extensions.js': 'export const extension_settings={};',
    'debug-core.js': 'export const xbLog={isEnabled:()=>false,info(){},warn(){},error(){}};',
    'server-storage.js': `export const CommonSettingStorage={
        getStrict:(...args)=>globalThis.__summaryConfigLoadingTest.storage.getStrict(...args),
        setAndSave:(...args)=>globalThis.__summaryConfigLoadingTest.storage.setAndSave(...args),
        clearCache:()=>globalThis.__summaryConfigLoadingTest.storage.clearCache(),
    };`,
};
const root = fileURLToPath(new URL('../../../', import.meta.url));
const bundled = await build({
    stdin: { resolveDir: root, contents: `
        export * from './modules/story-summary/data/config.js';
        export * from './modules/story-summary/data/config-transitions.js';
        export * from './modules/story-summary/vector/embedding-connection.js';
        export * from './modules/story-summary/vector/runtime/maintenance-coordinator.js';
    ` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'settings-host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- locally bundled production modules and fixed host shims only
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const config = model => ({ vector: { enabled: true, embeddingApi: { provider: 'custom', providers: {
    custom: { url: 'https://fixture.invalid/v1', key: 'fixture-key', model },
} } } });
const flush = async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); };
const synchronize = (assertCurrent = () => {}) => mod.synchronizeSummaryConfig({
    chatId: 'fixture', assertCurrent, beforeApply() {}, afterVectorChange: async () => {},
});
const save = (candidate, vectorChanged = true) => mod.changeSummaryConfig({
    vectorChanged,
    chatId: 'fixture', reason: 'panel-save', applyChange: () => mod.saveSummaryPanelConfigVerified(candidate),
    invalidateRecall() {}, afterVectorChange: async () => {},
});

beforeEach(() => {
    local.clear();
    host.requests = [];
    host.status = 200;
    host.document = { storySummaryPanelConfig: config('saved-model'), anotherFeature: { keep: true } };
    host.read = async () => new Response(JSON.stringify(host.document), { status: host.status });
    host.storage = new StorageFile('test-settings.json', { readTimeoutMs: 5000, fetch: async (url, options = {}) => {
        host.requests.push({ url, method: options.method || 'GET' });
        if (options.method === 'POST') {
            const payload = JSON.parse(options.body);
            host.document = JSON.parse(Buffer.from(payload.data, 'base64').toString('utf8'));
            return new Response('{}');
        }
        return host.read(options);
    } });
    mod.applySummaryPanelConfigSnapshot(config('cached-model'));
});

after(() => {
    if (previousLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousLocalStorage;
    globalThis.fetch = previousFetch;
    delete globalThis.__summaryConfigLoadingTest;
});

test('a failed server read rejects instead of returning cached credentials or rewriting storage', async () => {
    host.status = 503;
    const before = mod.getSummaryPanelConfig();
    const browserBefore = [...local];
    await assert.rejects(mod.loadConfigFromServer());
    assert.deepEqual(mod.getSummaryPanelConfig(), before);
    assert.deepEqual([...local], browserBefore);
    assert.deepEqual(host.requests.map(item => item.method), ['GET']);
});

test('a later attempt reads the server again and installs saved settings without a server write', async () => {
    host.status = 503;
    await assert.rejects(mod.loadConfigFromServer());
    host.status = 200;
    const documentBefore = structuredClone(host.document);
    const loaded = await mod.loadConfigFromServer();
    assert.equal(loaded.vector.embeddingApi.model, 'saved-model');
    assert.equal(mod.getVectorConfig().embeddingApi.model, 'saved-model');
    assert.deepEqual(host.document, documentBefore);
    assert.deepEqual(host.requests.map(item => item.method), ['GET', 'GET']);
});

test('confirmed absence preserves local settings without creating a server record', async () => {
    delete host.document.storySummaryPanelConfig;
    const loaded = await mod.readSummaryPanelConfigFromServer();
    assert.deepEqual(loaded, mod.getSummaryPanelConfig());
    assert.equal(mod.getVectorConfig().embeddingApi.model, 'cached-model');
    assert.deepEqual(host.requests.map(item => item.method), ['GET']);
});

for (const vectorChanged of [true, false]) {
    test(`initialization cannot cancel or undo a queued user save (vector change: ${vectorChanged})`, async () => {
        let release;
        const io = mod.runVectorWriteTask({ chatId: 'fixture', scope: mod.VECTOR_WRITE_SCOPES.IO },
            () => new Promise(resolve => { release = resolve; }));
        await flush();
        const model = vectorChanged ? 'user-new' : 'cached-model';
        const candidate = { ...config(model), api: { provider: 'openai', model: 'new-summary-model' } };
        const saved = save(candidate, vectorChanged);
        const reloaded = synchronize();
        release();
        const [, receipt, loaded] = await Promise.all([io, saved, reloaded]);
        assert.equal(receipt.result.vector.embeddingApi.model, model);
        assert.equal(loaded.vector.embeddingApi.model, model);
        assert.equal(loaded.api.model, 'new-summary-model');
        assert.equal(mod.getVectorConfig().embeddingApi.model, model);
        assert.equal(host.document.storySummaryPanelConfig.vector.embeddingApi.model, model);
        assert.equal(host.requests.filter(request => request.method === 'POST').length, 1);
    });
}

test('a superseded queued save rejects instead of acknowledging unchanged settings', async () => {
    let release;
    const io = mod.runVectorWriteTask({ chatId: 'fixture', scope: mod.VECTOR_WRITE_SCOPES.IO },
        () => new Promise(resolve => { release = resolve; }));
    await flush();
    const first = assert.rejects(save(config('superseded')), { name: 'AbortError' });
    const last = save(config('last-user-save'));
    release();
    await Promise.all([io, first, last]);
    assert.equal(host.document.storySummaryPanelConfig.vector.embeddingApi.model, 'last-user-save');
    assert.equal(host.requests.filter(request => request.method === 'POST').length, 1);
});

test('a user save supersedes an in-flight reload before it can publish a stale snapshot', async () => {
    let release;
    host.read = () => new Promise(resolve => { release = resolve; });
    const reload = assert.rejects(synchronize(), { name: 'AbortError' });
    await flush();
    const saved = save(config('user-new'));
    host.read = async () => new Response(JSON.stringify(host.document));
    release(new Response(JSON.stringify(host.document)));
    await Promise.all([reload, saved]);
    assert.equal(mod.getVectorConfig().embeddingApi.model, 'user-new');
    assert.equal(host.document.storySummaryPanelConfig.vector.embeddingApi.model, 'user-new');
});

test('cancelling initialization with a stalled real storage read cannot block the next probe indefinitely', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let requests = 0;
    let readSignal;
    host.read = ({ signal }) => {
        readSignal = signal;
        return new Promise(() => {}); // Simulate a transport that ignores abort.
    };
    globalThis.fetch = async () => {
        requests++;
        return new Response(JSON.stringify({ data: [{ index: 0, embedding: [1, 0] }] }));
    };
    const connection = mod.createEmbeddingConnection({ synchronizeConfig: synchronize,
        prepareRuntime: async () => {}, getVectorConfig: mod.getVectorConfig });
    const first = assert.rejects(connection.test({ apiConfig: mod.getVectorConfig().embeddingApi }), { name: 'AbortError' });
    await flush();
    connection.cancel();
    await first;
    host.read = async () => new Response(JSON.stringify(host.document));
    const next = connection.test({ apiConfig: mod.getVectorConfig().embeddingApi });
    t.mock.timers.tick(5000);
    assert.equal((await next).success, true);
    assert.equal(readSignal.aborted, true);
    assert.equal(host.requests.length, 2);
    assert.equal(requests, 1);
});
