/* global Buffer */
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { StorageFile } from '../../../core/storage-file.js';
import { writeSummaryConfigLocalCache } from '../data/config-local-cache.js';

// Exercise the real settings normalization and server storage reader. The only
// replacements are host settings, diagnostics, browser storage and HTTP.
const host = globalThis.__summaryConfigLoadingTest = {};
const previousLocalStorage = globalThis.localStorage;
const previousFetch = globalThis.fetch;
const local = new Map();
globalThis.localStorage = {
    getItem: key => local.get(key) ?? null,
    setItem: (key, value) => {
        if (host.localError) throw host.localError;
        local.set(key, String(value));
    },
};
const shims = {
    'extensions.js': 'export const extension_settings={};',
    'debug-core.js': `export const xbLog={isEnabled:()=>false,info(){},
        warn:(...args)=>globalThis.__summaryConfigLoadingTest.warnings.push(args),error(){}};`,
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
    host.localError = null;
    host.warnings = [];
    host.requests = [];
    host.status = 200;
    host.writeStatus = 200;
    host.persist = true;
    host.document = { storySummaryPanelConfig: config('saved-model'), anotherFeature: { keep: true } };
    host.read = async () => new Response(JSON.stringify(host.document), { status: host.status });
    host.storage = new StorageFile('test-settings.json', { readTimeoutMs: 5000, fetch: async (url, options = {}) => {
        host.requests.push({ url, method: options.method || 'GET' });
        if (options.method === 'POST') {
            const payload = JSON.parse(options.body);
            if (host.writeStatus === 200 && host.persist) {
                host.document = JSON.parse(Buffer.from(payload.data, 'base64').toString('utf8'));
            }
            return new Response('{}', { status: host.writeStatus });
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

// Browser cache availability must not decide whether authoritative server
// settings can be used. Real storage reads, writes and read-back checks run here.
for (const errorName of ['QuotaExceededError', 'SecurityError']) {
    for (const [entry, read] of [['startup', () => mod.loadConfigFromServer()], ['panel', synchronize]]) {
        test(`${entry} installs server settings when browser caching raises ${errorName}`, async () => {
            host.localError = new DOMException('fixture storage failure', errorName);
            const browserBefore = [...local];
            const serverBefore = structuredClone(host.document);
            const loaded = await read();
            assert.equal(loaded.vector.embeddingApi.model, 'saved-model');
            assert.equal(mod.getVectorConfig().embeddingApi.model, 'saved-model');
            assert.deepEqual([...local], browserBefore);
            assert.deepEqual(host.document, serverBefore);
            assert.deepEqual(host.requests.map(item => item.method), ['GET']);
            assert.equal(host.warnings.length, 1);
            assert.equal(JSON.stringify(host.warnings).includes('fixture-key'), false);
        });
    }

    test(`verified saving succeeds and caching can recover after ${errorName}`, async () => {
        host.localError = new DOMException('fixture storage failure', errorName);
        const browserBefore = [...local];
        const receipt = await save(config('user-new'));
        assert.equal(receipt.result.vector.embeddingApi.model, 'user-new');
        assert.equal(mod.getVectorConfig().embeddingApi.model, 'user-new');
        assert.equal(host.document.storySummaryPanelConfig.vector.embeddingApi.model, 'user-new');
        assert.deepEqual(host.document.anotherFeature, { keep: true });
        assert.deepEqual(host.requests.map(item => item.method), ['GET', 'POST', 'GET']);
        assert.deepEqual([...local], browserBefore);
        assert.equal(host.warnings.length, 1);

        host.localError = null;
        const loaded = await synchronize();
        assert.deepEqual([...local.values()].map(JSON.parse), [loaded]);
        assert.equal(host.requests.filter(item => item.method === 'POST').length, 1);
    });
}

for (const failure of ['read', 'write', 'verification']) {
    test(`unavailable browser cache does not hide a server ${failure} failure`, async () => {
        host.localError = new DOMException('fixture storage failure', 'QuotaExceededError');
        const before = mod.getSummaryPanelConfig();
        const browserBefore = [...local];
        const serverBefore = structuredClone(host.document);
        if (failure === 'read') host.status = 503;
        if (failure === 'write') host.writeStatus = 503;
        if (failure === 'verification') host.persist = false;
        const candidate = { ...config('unconfirmed'), api: { provider: 'openai', model: 'unconfirmed' } };
        await assert.rejects(failure === 'read' ? synchronize() : save(candidate));
        assert.deepEqual(mod.getSummaryPanelConfig(), before);
        assert.deepEqual([...local], browserBefore);
        assert.deepEqual(host.document, serverBefore);
        assert.equal(host.warnings.length, 0);
    });
}

test('invalid configuration serialization is not mistaken for an optional cache failure', () => {
    const browserBefore = [...local];
    const cyclic = {};
    cyclic.self = cyclic;
    assert.throws(() => writeSummaryConfigLocalCache(cyclic, (...args) => host.warnings.push(args)), TypeError);
    assert.deepEqual([...local], browserBefore);
    assert.equal(host.warnings.length, 0);
});

test('background L0 configuration changes and unchanged saves preserve current recall', async () => {
    for (const field of ['l0Api', 'l0Concurrency', 'unchanged', 'embeddingApi']) {
        const candidate = mod.getSummaryPanelConfig();
        if (field === 'l0Concurrency') candidate.vector.l0Concurrency++;
        else if (field !== 'unchanged') candidate.vector[field].providers[candidate.vector[field].provider].model = 'changed-model';
        let invalidations = 0;
        await mod.changeSummaryConfig({ chatId: 'fixture', vectorChanged: true,
            applyChange: () => mod.saveSummaryPanelConfigVerified(candidate),
            invalidateRecall: () => { invalidations++; }, afterVectorChange: async () => {} });
        assert.equal(invalidations, field === 'embeddingApi' ? 1 : 0);
    }
});

test('configuration reads complete while a background model request is still pending', async () => {
    let release, entered, loaded = false;
    const gate = new Promise(resolve => { release = resolve; });
    const started = new Promise(resolve => { entered = resolve; });
    const generation = mod.runVectorGenerationTask({ chatId: 'fixture' }, async () => { entered(); await gate; });
    await started;
    const reading = synchronize().then(result => { loaded = true; return result; });
    try {
        await flush();
        assert.equal(loaded, true);
    } finally { release(); await Promise.all([generation, reading]); }
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
