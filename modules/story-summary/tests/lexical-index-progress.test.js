import { createTestModuleUrl } from './helpers/bundle-module.js';
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';

// Exercise real corpus, tokenizer, vocabulary and writer scheduling. Only the
// host/storage boundaries are replaced; assertions concern events and results.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__lexicalProgressTest = {};
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__lexicalProgressTest.context;',
    'store.js': 'export const getPublishedSummaryStore=()=>{const h=globalThis.__lexicalProgressTest; h.summaryReads++; return h.store;};',
    'chunk-store.js': 'export const getAllChunks=chatId=>{const h=globalThis.__lexicalProgressTest; h.chunkReads++; return h.readChunks(chatId);};',
    'state-store.js': 'export const getPublishedStateAtoms=()=>{const h=globalThis.__lexicalProgressTest; h.stateReads++; return [];};',
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){},debug(){}};',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/vector/retrieval/lexical-index.js';",
        "export { LexicalCorpus } from './modules/story-summary/vector/retrieval/lexical-corpus.js';",
        "export { reset } from './modules/story-summary/vector/utils/tokenizer.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));
after(() => { delete globalThis.__lexicalProgressTest; });

function resetFixture() {
    mod.invalidateLexicalIndex();
    mod.reset();
    Object.assign(host, {
        context: { chatId: 'chat-a' },
        store: { json: { events: [{ id: 'event-1', summary: 'orchard promise' }] } },
        chunks: [{ chunkId: 'chunk-1', floor: 1, text: 'orchard lantern' }],
        chunkReads: 0,
        summaryReads: 0,
        stateReads: 0,
        readChunks: () => Promise.resolve(host.chunks),
    });
}
beforeEach(resetFixture);

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

const observe = events => ({ onProgress: event => events.push(event) });
const chunkIds = (index, term) => mod.searchLexicalIndex(index, [term]).chunkIds;

test('cold callers distinguish starting and joining, then hit the same cache without another read', async () => {
    const read = deferred();
    host.readChunks = () => read.promise;
    const ownerEvents = [], joinEvents = [], hitEvents = [];
    const owner = mod.getLexicalIndex(observe(ownerEvents));
    const joining = mod.getLexicalIndex(observe(joinEvents));
    assert.deepEqual(ownerEvents, [{ phase: 'build', mode: 'build' }]);
    assert.deepEqual(joinEvents, [{ phase: 'wait', mode: 'build' }]);
    assert.equal(host.chunkReads, 0); // Scheduling remains deferred, even with callbacks.
    read.resolve(host.chunks);
    const [index, shared] = await Promise.all([owner, joining]);
    assert.equal(index, shared);
    assert.equal(host.chunkReads, 1);
    assert.deepEqual(ownerEvents, [{ phase: 'build', mode: 'build' }, { phase: 'ready', mode: 'build', documentCount: 2 }]);
    assert.deepEqual(joinEvents, [{ phase: 'wait', mode: 'build' }, { phase: 'ready', mode: 'build', documentCount: 2 }]);
    assert.deepEqual(chunkIds(index, 'lantern'), ['chunk-1']);
    assert.deepEqual(mod.searchLexicalIndex(index, ['promise']).eventIds, ['event-1']);
    const cached = mod.getLexicalIndex(observe(hitEvents));
    assert.deepEqual(hitEvents, [{ phase: 'hit', documentCount: 2 }]);
    assert.equal(await cached, index);
    assert.equal(host.chunkReads, 1);
    await mod.addChunkDocuments([{ chunkId: 'later', floor: 2, text: 'harbor' }]);
    assert.equal(ownerEvents.length, 2);
    assert.equal(joinEvents.length, 2);
    assert.equal(hitEvents.length, 1); // Completed calls are not writer subscriptions.
});

test('a vocabulary change starts an update against the existing corpus without reading chunks', async () => {
    const index = await mod.getLexicalIndex();
    host.context.name2 = 'Lantern';
    const events = [];
    const updating = mod.getLexicalIndex(observe(events));
    assert.deepEqual(events, [{ phase: 'update', mode: 'update' }]);
    assert.equal(await updating, index);
    assert.deepEqual(events, [{ phase: 'update', mode: 'update' }, { phase: 'ready', mode: 'update', documentCount: 2 }]);
    assert.deepEqual(chunkIds(index, 'Lantern'), ['chunk-1']);
    assert.equal(host.chunkReads, 1);
});

test('joining an incremental writer keeps update mode before and after it takes the cache', async t => {
    const index = await mod.getLexicalIndex();
    const entered = deferred(), release = deferred();
    const applyBatch = mod.LexicalCorpus.prototype.applyBatch;
    t.mock.method(mod.LexicalCorpus.prototype, 'applyBatch', async function (...args) {
        entered.resolve();
        await release.promise;
        return applyBatch.apply(this, args);
    });
    const upsert = t.mock.method(mod.LexicalCorpus.prototype, 'upsert');
    const updating = mod.addChunkDocuments([{ chunkId: 'chunk-2', floor: 2, text: 'harbor' }]);
    const earlyEvents = [], lateEvents = [];
    const early = mod.getLexicalIndex(observe(earlyEvents));
    assert.deepEqual(earlyEvents, [{ phase: 'wait', mode: 'update' }]);
    assert.equal(upsert.mock.callCount(), 0);
    await entered.promise;
    assert.equal(mod.getLexicalIdfAccessor().enabled, false);
    const late = mod.getLexicalIndex(observe(lateEvents));
    assert.deepEqual(lateEvents, [{ phase: 'wait', mode: 'update' }]);
    release.resolve();
    const results = await Promise.all([updating, early, late]);
    assert.ok(results.every(result => result === index));
    assert.deepEqual(earlyEvents, [{ phase: 'wait', mode: 'update' }, { phase: 'ready', mode: 'update', documentCount: 3 }]);
    assert.deepEqual(lateEvents, earlyEvents);
    assert.deepEqual(chunkIds(index, 'harbor'), ['chunk-2']);
    assert.equal(host.chunkReads, 1);
});

test('a reader joins an update committed as its prior writer settles before reporting ready', async () => {
    await mod.getLexicalIndex();
    const first = mod.addChunkDocuments([{ chunkId: 'chunk-2', floor: 2, text: 'harbor' }]);
    const following = first.then(() => mod.addChunkDocuments([{ chunkId: 'chunk-3', floor: 3, text: 'compass' }]));
    const events = [];
    const reader = mod.getLexicalIndex(observe(events));
    const [index, published] = await Promise.all([reader, following]);
    assert.equal(index, published);
    assert.deepEqual(events, [
        { phase: 'wait', mode: 'update' },
        { phase: 'wait', mode: 'update' },
        { phase: 'ready', mode: 'update', documentCount: 4 },
    ]);
    assert.deepEqual(chunkIds(index, 'harbor'), ['chunk-2']);
    assert.deepEqual(chunkIds(index, 'compass'), ['chunk-3']);
    assert.equal(host.chunkReads, 1);
});

test('throwing observers do not change reads, indexing work, shared results or cache behavior', async t => {
    const upsert = t.mock.method(mod.LexicalCorpus.prototype, 'upsert');
    async function acquire(options) {
        resetFixture();
        upsert.mock.resetCalls();
        const owner = mod.getLexicalIndex(options);
        const joining = mod.getLexicalIndex(options);
        const [index, shared] = await Promise.all([owner, joining]);
        assert.equal(shared, index);
        assert.equal(await mod.getLexicalIndex(options), index);
        const updating = mod.addChunkDocuments([{ chunkId: 'chunk-2', floor: 2, text: 'harbor orchard' }]);
        assert.equal(await mod.getLexicalIndex(options), await updating);
        host.context.name2 = 'Lantern';
        assert.equal(await mod.getLexicalIndex(options), index);
        return {
            hits: index.search('orchard'),
            count: index.documentCount,
            chunkReads: host.chunkReads,
            summaryReads: host.summaryReads,
            stateReads: host.stateReads,
            indexed: upsert.mock.callCount(),
        };
    }
    const baseline = await acquire();
    const events = [];
    const observed = await acquire({ onProgress(event) {
        events.push(event);
        throw new Error('observer failure');
    } });
    assert.deepEqual(observed, baseline);
    assert.equal(observed.chunkReads, 1);
    assert.deepEqual(new Set(events.map(event => event.phase)), new Set(['build', 'wait', 'ready', 'hit', 'update']));
});

test('a shared read failure reports the original error even when observers throw, and can retry', async () => {
    const failure = new Error('storage unavailable');
    host.readChunks = () => Promise.reject(failure);
    const ownerEvents = [], joinEvents = [];
    const options = events => ({ onProgress(event) { events.push(event); throw new Error('observer failure'); } });
    const owner = mod.getLexicalIndex(options(ownerEvents));
    const joining = mod.getLexicalIndex(options(joinEvents));
    await Promise.all([assert.rejects(owner, error => error === failure), assert.rejects(joining, error => error === failure)]);
    assert.deepEqual(ownerEvents, [{ phase: 'build', mode: 'build' }, { phase: 'failed', mode: 'build', error: failure }]);
    assert.deepEqual(joinEvents, [{ phase: 'wait', mode: 'build' }, { phase: 'failed', mode: 'build', error: failure }]);
    assert.equal(host.chunkReads, 1);
    host.readChunks = () => Promise.resolve(host.chunks);
    const retryEvents = [];
    const index = await mod.getLexicalIndex(observe(retryEvents));
    assert.equal(index.documentCount, 2);
    assert.equal(retryEvents[0].phase, 'build');
    assert.equal(host.chunkReads, 2);
});

test('incremental failures retain their update mode and original rejection', async t => {
    await mod.getLexicalIndex();
    const failure = new Error('index update unavailable');
    t.mock.method(mod.LexicalCorpus.prototype, 'applyBatch', async () => { throw failure; });
    const writer = mod.addChunkDocuments([{ chunkId: 'chunk-2', floor: 2, text: 'harbor' }]);
    const events = [];
    const reader = mod.getLexicalIndex({ onProgress(event) { events.push(event); throw new Error('observer failure'); } });
    await Promise.all([assert.rejects(writer, error => error === failure), assert.rejects(reader, error => error === failure)]);
    assert.deepEqual(events, [{ phase: 'wait', mode: 'update' }, { phase: 'failed', mode: 'update', error: failure }]);
    assert.equal(mod.getLexicalIdfAccessor().enabled, false);
    assert.equal(host.chunkReads, 1);
});

for (const abandon of ['invalidate', 'switch-chat']) {
    test(`${abandon} keeps an abandoned reader null and does not publish its cache`, async () => {
        const entered = deferred(), read = deferred();
        host.readChunks = () => { entered.resolve(); return read.promise; };
        const events = [];
        const abandoned = mod.getLexicalIndex(observe(events));
        await entered.promise;
        if (abandon === 'invalidate') mod.invalidateLexicalIndex();
        else host.context.chatId = 'chat-b';
        host.readChunks = () => Promise.resolve([{ chunkId: 'fresh', floor: 3, text: 'harbor' }]);
        const freshEvents = [];
        const fresh = await mod.getLexicalIndex(observe(freshEvents));
        read.resolve(host.chunks);
        assert.equal(await abandoned, null);
        assert.deepEqual(events, [{ phase: 'build', mode: 'build' }, { phase: 'failed', mode: 'build' }]);
        assert.deepEqual(freshEvents, [{ phase: 'build', mode: 'build' }, { phase: 'ready', mode: 'build', documentCount: 2 }]);
        assert.equal(await mod.getLexicalIndex(), fresh);
        assert.deepEqual(chunkIds(fresh, 'harbor'), ['fresh']);
        assert.deepEqual(chunkIds(fresh, 'lantern'), []);
        assert.equal(host.chunkReads, 2);
    });
}

test('no active chat remains a null result without progress or reads', async () => {
    host.context.chatId = null;
    const events = [];
    assert.equal(await mod.getLexicalIndex(observe(events)), null);
    assert.deepEqual(events, []);
    assert.equal(host.chunkReads, 0);
    assert.equal(host.summaryReads, 0);
    assert.equal(host.stateReads, 0);
});
