import { createTestModuleUrl } from './helpers/bundle-module.js';
// Exercise the real operation-scoped coordinator. Only storage/embedding/host
// boundaries are replaced; cancellation must settle without buying another call.
import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { getEventListeners } from 'node:events';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__maintenanceIndexCancellationTest = {};
const shims = {
    'extensions.js': 'export const getContext=()=>({chatId:"chat"});',
    'modules/story-summary/data/config.js': 'export const getVectorConfig=()=>({enabled:true,embeddingApi:{}});',
    'modules/story-summary/data/store.js': 'export const getSummaryStore=()=>globalThis.__maintenanceIndexCancellationTest.store;',
    'modules/story-summary/data/memory-commit.js': 'export const assertMemoryWritable=()=>{}; export const waitForMemoryCommit=async()=>{};',
    'modules/story-summary/vector/storage/state-store.js': 'export const getStateAtoms=()=>globalThis.__maintenanceIndexCancellationTest.atoms; export const getStateVectorDescriptors=async()=>[]; export const saveStateVectors=(...args)=>globalThis.__maintenanceIndexCancellationTest.saveStates(...args);',
    'modules/story-summary/vector/storage/chunk-store.js': 'export const getAllEventVectors=()=>globalThis.__maintenanceIndexCancellationTest.readEvents(); export const saveEventVectors=(...args)=>globalThis.__maintenanceIndexCancellationTest.saveEvents(...args);',
    'modules/story-summary/vector/utils/embedder.js': 'export const getEngineFingerprint=()=>"fixture-fingerprint";',
    'modules/story-summary/vector/utils/vector-input-digest.js': 'export const inputDigest=(kind,text)=>kind+":"+text;',
    'modules/story-summary/vector/pipeline/event-vector-input.js': 'export const buildEventVectorText=event=>event?.summary||"";',
    'modules/story-summary/vector/pipeline/state-vector-input.js': 'export const buildRAggregateText=atom=>atom?.semantic||"";',
    'modules/story-summary/vector/llm/siliconflow.js': 'export const embed=(...args)=>globalThis.__maintenanceIndexCancellationTest.embed(...args);',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/maintenance/indexes.js';",
        "export * from './modules/story-summary/vector/runtime/maintenance-coordinator.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'maintenance-index-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const relative = path.relative(root, path.resolve(args.resolveDir, args.path)).replaceAll('\\', '/');
            const key = Object.hasOwn(shims, relative) ? relative : path.basename(args.path);
            return Object.hasOwn(shims, key) ? { path: key, namespace: 'fixture' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));
const impact = { eventIds: ['event'], atomIds: ['atom'] };
const deferred = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
};
const drain = () => mod.runVectorGenerationTask({ chatId: 'chat', kind: 'fixture-drain' }, async () => {});
const options = { timeout: 3000 };
beforeEach(t => {
    // Expected aborts/late fixture failures are already observed by assertions;
    // suppress the coordinator's diagnostic copy (its URL is this generated bundle).
    t.mock.method(console, 'warn', () => {});
    Object.assign(host, {
        store: { json: { events: [{ id: 'event', summary: 'current event' }] } },
        atoms: [{ atomId: 'atom', floor: 1, semantic: 'current anchor' }],
        requests: [], eventWrites: [], stateWrites: [],
        readEvents: async () => [],
        embed: async (texts, settings) => { host.requests.push({ texts, settings }); return texts.map(() => [1, 0]); },
        saveEvents: async (...args) => { host.eventWrites.push(args); },
        saveStates: async (...args) => { host.stateWrites.push(args); },
    });
});
afterEach(async () => { await mod.shutdownVectorWriteCoordinator(); mod.resumeVectorWriteCoordinator(); });
after(() => { delete globalThis.__maintenanceIndexCancellationTest; });

for (const owned of [false, true]) test(`${owned ? 'owned' : 'manual button'} repair still saves derived indexes normally`, options, async () => {
    const owner = new AbortController();
    const result = await mod.repairMaintenanceIndexes('chat', impact, owned ? { signal: owner.signal, operationId: 'owned-success' } : undefined);
    assert.equal(result.status, 'ready');
    assert.equal(host.requests.length, 1);
    assert.equal(host.eventWrites.length, 1);
    assert.equal(host.stateWrites.length, 1);
    assert.equal(getEventListeners(owner.signal, 'abort').length, 0);
});

test('ordinary embedding failures also detach the owner listener without writing indexes', options, async () => {
    const owner = new AbortController();
    host.embed = async () => { throw Object.assign(new Error('fixture failure'), { code: 'fixture_failed' }); };
    await assert.rejects(mod.repairMaintenanceIndexes('chat', impact, { signal: owner.signal, operationId: 'failed' }), { code: 'fixture_failed' });
    assert.equal(getEventListeners(owner.signal, 'abort').length, 0);
    assert.equal(host.eventWrites.length + host.stateWrites.length, 0);
});

test('an already cancelled owner never enqueues embedding or index writes', options, async () => {
    const owner = new AbortController(); owner.abort();
    await assert.rejects(mod.repairMaintenanceIndexes('chat', impact, { signal: owner.signal, operationId: 'pre-cancelled' }), { name: 'AbortError' });
    await drain();
    assert.equal(host.requests.length, 0);
    assert.equal(host.eventWrites.length + host.stateWrites.length, 0);
    assert.equal(getEventListeners(owner.signal, 'abort').length, 0);
});

test('cancelling queued repair settles promptly without aborting the unrelated operation ahead of it', options, async () => {
    const started = deferred(), release = deferred(), owner = new AbortController();
    let unrelatedSignal;
    const blocker = mod.runVectorGenerationTask({ chatId: 'chat', operationId: 'unrelated' }, async ({ signal }) => {
        unrelatedSignal = signal; started.resolve(); await release.promise;
    });
    try {
        await started.promise;
        const repair = mod.repairMaintenanceIndexes('chat', impact, { signal: owner.signal, operationId: 'queued-owned' });
        const rejected = assert.rejects(repair, { name: 'AbortError' });
        await nextTurn();
        owner.abort();
        await rejected; // The blocker has deliberately not been released yet.
        assert.equal(unrelatedSignal.aborted, false);
        assert.equal(host.requests.length, 0);
        assert.equal(getEventListeners(owner.signal, 'abort').length, 0);
    } finally { release.resolve(); await blocker; await drain(); }
    assert.equal(host.eventWrites.length + host.stateWrites.length, 0);
});

for (const late of ['resolve', 'reject']) test(`cancelled active embedding cannot write after its provider later ${late}s`, options, async () => {
    const started = deferred(), release = deferred(), owner = new AbortController();
    let requestSignal, count;
    host.embed = async (texts, { signal }) => { count = texts.length; requestSignal = signal; started.resolve(); return release.promise; };
    const repair = mod.repairMaintenanceIndexes('chat', impact, { signal: owner.signal, operationId: `active-${late}` });
    const rejected = assert.rejects(repair, { name: 'AbortError' });
    try {
        await started.promise;
        owner.abort();
        await rejected;
        assert.equal(requestSignal.aborted, true);
        assert.equal(getEventListeners(owner.signal, 'abort').length, 0);
    } finally {
        if (late === 'resolve') release.resolve(Array.from({ length: count }, () => [1, 0]));
        else release.reject(new Error('late provider failure'));
        await drain();
    }
    assert.equal(host.eventWrites.length + host.stateWrites.length, 0);
});

test('cancellation during index inspection prevents a later embedding request', options, async () => {
    const started = deferred(), release = deferred(), owner = new AbortController();
    host.readEvents = async () => { started.resolve(); return release.promise; };
    const repair = mod.repairMaintenanceIndexes('chat', impact, { signal: owner.signal, operationId: 'inspection' });
    const rejected = assert.rejects(repair, { name: 'AbortError' });
    try {
        await started.promise;
        owner.abort();
        await rejected;
    } finally { release.resolve([]); await drain(); }
    assert.equal(host.requests.length, 0);
    assert.equal(host.eventWrites.length + host.stateWrites.length, 0);
});

test('cancellation after an already-started event save prevents the subsequent anchor write', options, async () => {
    const started = deferred(), release = deferred(), owner = new AbortController();
    host.saveEvents = async (...args) => { host.eventWrites.push(args); started.resolve(); await release.promise; };
    const repair = mod.repairMaintenanceIndexes('chat', impact, { signal: owner.signal, operationId: 'saving' });
    const rejected = assert.rejects(repair, { name: 'AbortError' });
    try {
        await started.promise;
        owner.abort();
        await rejected;
    } finally { release.resolve(); await drain(); }
    assert.equal(host.eventWrites.length, 1); // An already-issued storage operation is not rolled back.
    assert.equal(host.stateWrites.length, 0);
    assert.equal(getEventListeners(owner.signal, 'abort').length, 0);
});
