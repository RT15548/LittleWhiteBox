/* global Buffer */
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Real connection workflow, transport and feedback. Only host configuration,
// runtime preparation, diagnostics and fetch/toast boundaries are replaced.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__embeddingConnectionTest = {};
const shims = {
    'config.js': 'export const getVectorConfig=()=>globalThis.__embeddingConnectionTest.config;',
    'debug-core.js': 'export const xbLog={isEnabled:()=>false,warn:(...args)=>globalThis.__embeddingConnectionTest.logs.push(args)};',
};
const bundle = await build({
    stdin: { resolveDir: root, contents: `
        export * from './modules/story-summary/vector/embedding-connection.js';
    ` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'connection-host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- locally bundled production modules and fixed host shims only
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const original = { fetch: globalThis.fetch, toastr: globalThis.toastr, warn: console.warn };
const apiConfig = () => ({ provider: 'custom', url: 'https://embedding.invalid/v1', key: 'fixture-key', model: 'fixture-model' });
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
let connection;
const automatic = () => connection.warmup({ isCurrent: () => host.current });
const manual = api => connection.test({ apiConfig: api || host.config.embeddingApi, isCurrent: () => host.current });

beforeEach(() => {
    connection?.cancel();
    Object.assign(host, {
        config: { enabled: true, embeddingApi: apiConfig() }, current: true,
        requests: [], notices: [], logs: [], errors: [], steps: [], states: [],
        async read(assertCurrent) { assertCurrent(); return { vector: host.config }; },
        async prepare() {},
    });
    connection = mod.createEmbeddingConnection({
        async synchronizeConfig(assertCurrent) { host.steps.push('configuration'); return host.read(assertCurrent); },
        async prepareRuntime(assertCurrent) { host.steps.push('runtime'); return host.prepare(assertCurrent); },
        getVectorConfig: () => host.config,
        onStatus: state => host.states.push(state),
    });
    console.warn = (...args) => host.errors.push(args);
    globalThis.toastr = { warning: (...args) => { host.notices.push(args); return { finish() {} }; }, clear() {} };
    globalThis.fetch = async (url, options) => {
        host.steps.push('probe');
        host.requests.push({ url, headers: options.headers, body: JSON.parse(options.body) });
        return new Response(JSON.stringify({ data: [{ index: 0, embedding: [1, 0] }] }));
    };
});

after(() => {
    connection.cancel();
    globalThis.fetch = original.fetch;
    if (original.toastr === undefined) delete globalThis.toastr;
    else globalThis.toastr = original.toastr;
    console.warn = original.warn;
    delete globalThis.__embeddingConnectionTest;
});

test('automatic and manual probes use the same ordered workflow, request and deadline without saving', async t => {
    const timeouts = [];
    const nativeTimeout = globalThis.setTimeout;
    t.mock.method(globalThis, 'setTimeout', (callback, delay, ...args) => {
        timeouts.push(delay); return nativeTimeout(callback, delay, ...args);
    });
    const before = structuredClone(host.config);
    assert.deepEqual(await automatic(), { success: true, dims: 2 });
    assert.deepEqual(await manual(), { success: true, dims: 2 });
    assert.deepEqual(host.steps, ['configuration', 'runtime', 'probe', 'configuration', 'runtime', 'probe']);
    assert.equal(host.requests.length, 2);
    assert.deepEqual(host.requests[0], host.requests[1]);
    assert.deepEqual(timeouts, [timeouts[0], timeouts[0]]);
    assert.deepEqual(host.config, before);
    assert.equal(host.notices.length, 0);
});

test('a manual draft is tested without installing it as the running configuration', async () => {
    const before = structuredClone(host.config);
    const draft = { ...apiConfig(), key: 'draft-key', model: 'draft-model' };
    let finish;
    host.prepare = () => new Promise(resolve => { finish = resolve; });
    const pending = manual(draft);
    await flush();
    assert.equal(connection.getStatus().status, 'downloading'); // Panel refresh must not unlock a running draft test.
    finish();
    await pending;
    assert.equal(host.requests[0].headers.Authorization, 'Bearer draft-key');
    assert.equal(host.requests[0].body.model, draft.model);
    assert.deepEqual(host.config, before);
    assert.equal(connection.getStatus().status, 'idle'); // A draft test is not proof about saved settings.
    host.prepare = async () => {};
    await automatic();
    assert.equal(host.requests[1].body.model, before.embeddingApi.model);
});

test('disabled automatic retrieval reads settings but neither prepares runtime nor calls the provider', async () => {
    host.config.enabled = false;
    assert.equal(await automatic(), null);
    assert.deepEqual(host.steps, ['configuration']);
    assert.equal(host.notices.length, 0);
    await manual(); // Explicit tests can check an API before enabling retrieval.
    assert.equal(host.requests.length, 1);
});

for (const [stage, key] of [['configuration', 'read'], ['runtime', 'prepare']]) {
    test(`${stage} failure stays visible with its cause and never starts a probe or retries`, async () => {
        const failure = new Error('local boundary failed');
        let calls = 0;
        host[key] = async () => { calls++; throw failure; };
        await automatic();
        assert.equal(calls, 1);
        assert.equal(host.requests.length, 0);
        assert.equal(host.notices.length, 0);
        assert.equal(connection.getStatus().status, 'error');
        assert.equal(connection.getStatus().stage, stage);
        assert.equal(host.errors[0][1].stage, stage);
        assert.equal(host.errors[0][1].cause, failure);
        await assert.rejects(manual(), error => error.stage === stage && error.cause === failure);
    });
}

test('a later initialization can recover from a failed configuration read', async () => {
    const read = host.read;
    host.read = async () => { throw new Error('offline'); };
    await automatic();
    host.read = read;
    assert.equal((await automatic()).success, true);
    assert.equal(host.requests.length, 1);
    assert.equal(connection.getStatus().status, 'success');
});

test('network failure keeps its original cause and repeated failures do not stack notices', async () => {
    const failure = new TypeError('network unavailable');
    let requests = 0;
    globalThis.fetch = async () => { requests++; throw failure; };
    await automatic(); await automatic();
    assert.equal(requests, 2);
    assert.equal(host.notices.length, 0);
    assert.equal(connection.getStatus().status, 'error');
    assert.equal(host.logs.length, 2);
    assert.equal(host.errors[0][1].cause.cause.cause, failure);
});

test('a real probe deadline is reported without a second automatic request', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let requests = 0;
    globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
        requests++;
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
    const pending = automatic();
    await flush();
    t.mock.timers.runAll();
    await pending;
    assert.equal(requests, 1);
    assert.equal(host.notices.length, 0);
    assert.equal(connection.getStatus().status, 'error');
    assert.equal(host.errors[0][1].cause.cause.embeddingFailure.kind, 'timeout');
});

test('chat changes during configuration loading prevent applying stale state or probing', async () => {
    host.read = async assertCurrent => { host.current = false; assertCurrent(); assert.fail('obsolete load applied'); };
    await automatic();
    assert.deepEqual(host.steps, ['configuration']);
    assert.equal(host.requests.length, 0);
    assert.equal(host.notices.length, 0);
    assert.equal(connection.getStatus().status, 'idle');
});

test('a configuration change during preparation prevents a stale request', async () => {
    host.prepare = async () => { host.config.embeddingApi.model = 'new-model'; };
    await automatic();
    assert.equal(host.requests.length, 0);
    assert.equal(host.notices.length, 0);
});

test('teardown aborts a pending probe without a failure toast', async () => {
    let requestSignal;
    globalThis.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => {
        requestSignal = signal;
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    });
    const pending = automatic();
    await flush();
    connection.cancel();
    await pending;
    assert.equal(requestSignal.aborted, true);
    assert.equal(host.notices.length, 0);
});

test('background initialization does not interrupt or duplicate an explicit test', async () => {
    let finish;
    host.prepare = () => new Promise(resolve => { finish = resolve; });
    const pending = manual();
    await flush();
    assert.equal(await automatic(), null);
    finish();
    assert.equal((await pending).success, true);
    assert.equal(host.requests.length, 1);
});

test('cancelling a stalled configuration read releases the next initialization without late publication', async () => {
    let finishRead;
    let published = false;
    const read = host.read;
    host.read = async assertCurrent => {
        await new Promise(resolve => { finishRead = resolve; });
        assertCurrent();
        published = true;
        return { vector: host.config };
    };
    const pending = manual();
    const cancelled = assert.rejects(pending, { name: 'AbortError' });
    await flush();
    connection.cancel();
    await cancelled;
    host.read = read;
    assert.equal((await automatic()).success, true);
    finishRead();
    await flush();
    assert.equal(published, false);
    assert.equal(host.requests.length, 1);
    assert.equal(host.notices.length, 0);
});
