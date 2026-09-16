import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { register } from 'node:module';
import { Buffer } from 'node:buffer';
import { setImmediate } from 'node:timers';
import { createRecallDiagnostics, formatRecallDiagnostics } from '../recall-diagnostics.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const prefix = '/scripts/extensions/third-party/LittleWhiteBox/';
const loader = [
    "import path from 'node:path'; import { pathToFileURL } from 'node:url';",
    'export async function resolve(specifier, context, next) {',
    'if (specifier.startsWith(' + JSON.stringify(prefix) + ')) return {',
    'url: pathToFileURL(path.join(' + JSON.stringify(root) + ', specifier.slice(' + prefix.length + '))).href,',
    'shortCircuit: true }; return next(specifier, context); }',
].join('\n');
register('data:text/javascript;base64,' + Buffer.from(loader).toString('base64'), import.meta.url);
globalThis.fetch = async input => {
    assert.equal(String(input), prefix + 'libs/jieba-wasm/jieba_rs_wasm_bg.wasm', 'unexpected external request');
    return new Response(await readFile(path.join(root, 'libs/jieba-wasm/jieba_rs_wasm_bg.wasm')), {
        headers: { 'content-type': 'application/wasm' },
    });
};

// Only host/storage boundaries are replaced. Matching, WASM, MiniSearch, IDF,
// query construction and cache lifecycle are the actual production modules.
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__lexicalTestHost.context;',
    'store.js': 'export const getSummaryStore=()=>globalThis.__lexicalTestHost.store;',
    'chunk-store.js': 'export const getAllChunks=()=>globalThis.__lexicalTestHost.readChunks();',
    'state-store.js': 'export const getStateAtoms=()=>globalThis.__lexicalTestHost.atoms;',
    'config.js': 'export const getTextFilterRules=()=>[];',
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){},debug(){},isEnabled(){return false;}};',
    'embedder.js': 'export const getEngineFingerprint=()=>"test"; export const embed=async texts=>texts.map(()=>[1,0]);',
    'runtime.js': [
        'const host=()=>globalThis.__lexicalTestHost;',
        'export const beginRecallRuntimeSession=async()=>({stats:{}});',
        'export const endRecallRuntimeSession=async()=>{host().released++;};',
        'export const getRecallRuntimeMeta=async()=>({fingerprint:"test"});',
        'export const scoreRecallRuntimeAnchors=async()=>({scores:[]});',
        'export const scoreRecallRuntimeEvents=async()=>({scores:host().scores});',
        'export const diffuseRecallRuntimeL0=async()=>({diffused:[]});',
        'export const scoreRecallRuntimeL1=async()=>new Map();',
        'export const selectRecallRuntimeL1Evidence=async()=>({items:[],status:"applied",stats:{}});',
        'export const getRecallRuntimeEventVectorsByIds=async(chatId,ids)=>{',
        'host().vectorRequests.push(ids); return ids.map(eventId=>({eventId,vector:[1,0]})); };',
    ].join('\n'),
    'reranker.js': [
        'export const getRerankBatchDiagnostics=()=>({totalBatches:1,failedBatches:0,failures:[]});',
        'export const rerankChunks=async(query,candidates)=>{',
        'globalThis.__lexicalTestHost.rerankRequests.push(candidates.map(row=>row.item?.event?.id));',
        'return candidates.map(row=>({...row,_rerankScore:row.item?.similarity||0.8})); };',
    ].join('\n'),
};
const bundled = await build({
    stdin: {
        resolveDir: root,
        contents: [
            "export * from './modules/story-summary/vector/retrieval/lexical-index.js';",
            "export * from './modules/story-summary/vector/retrieval/lexical-corpus.js';",
            "export { default as MiniSearch } from './libs/minisearch.mjs';",
            "export * from './modules/story-summary/vector/retrieval/query-builder.js';",
            "export * from './modules/story-summary/vector/utils/tokenizer.js';",
            "export * from './modules/story-summary/vector/retrieval/recall.js';",
        ].join('\n'),
    },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{
        name: 'host-boundaries',
        setup(api) {
            api.onResolve({ filter: /.*/ }, args => {
                const name = path.basename(args.path);
                return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
            });
            api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], loader: 'js' }));
        },
    }],
});
// The module is built exclusively from local production sources and the shims above.
// eslint-disable-next-line no-unsanitized/method
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
let host;
beforeEach(() => {
    mod.invalidateLexicalIndex();
    mod.reset();
    host = {
        context: { chatId: 'test-chat', name1: 'User', name2: '旁白', chat: [] },
        store: { json: { characters: { main: [] }, arcs: [], events: [], characterAliases: [] } },
        chunks: [], atoms: [], reads: 0,
        scores: [], vectorRequests: [], rerankRequests: [], released: 0,
        async readChunks() { this.reads++; return this.chunks; },
    };
    globalThis.__lexicalTestHost = host;
});

const chunk = (id, text, floor = 0) => ({ chunkId: id, text, floor });
const hits = (index, terms) => mod.searchLexicalIndex(index, terms).chunkIds;

test('concurrent tokenizer loads preserve the original failure and keep fallback tokenization usable', async (t) => {
    const error = new Error('WASM download failed', { cause: new Error('network unavailable') });
    t.mock.method(globalThis, 'fetch', async () => { throw error; });
    const attempts = await Promise.allSettled([mod.preload(), mod.preload()]);
    for (const attempt of attempts) {
        assert.equal(attempt.status, 'rejected');
        assert.equal(attempt.reason, error);
    }
    assert.equal(mod.isReady(), false);
    mod.injectEntities(new Set(['雪照宁']));
    assert.deepEqual(mod.tokenizeForIndex('雪照宁'), ['雪照宁']);
});

test('a fallback corpus is repaired when the real segmentation engine becomes ready', async () => {
    host.chunks = [chunk('university', '她就读北京大学计算机学院')];
    const index = await mod.getLexicalIndex();
    assert.deepEqual(hits(index, ['北京大学']), []);
    assert.equal(await mod.preload(), true);
    assert.deepEqual(hits(await mod.getLexicalIndex(), ['北京大学']), ['university']);
    assert.equal(host.reads, 1, 'engine change must not reload the persisted corpus');
});

test('newly recognized names repair old documents without F5 or a corpus rebuild', async () => {
    host.store.json.characters.main = ['上官'];
    host.chunks = [chunk('old', '她见到了上官映雪站在城门口')];
    const index = await mod.getLexicalIndex();
    host.store.json.characters.main.push('上官映雪');
    const added = chunk('new', '上官映雪来到客栈', 1);
    host.chunks.push(added);
    mod.addChunkDocuments([added]);
    const current = await mod.getLexicalIndex();
    assert.equal(current, index);
    assert.deepEqual(hits(current, ['上官映雪']).sort(), ['new', 'old']);
    assert.equal(host.reads, 1);
});

test('person queries use exact names while ordinary keyword prefix search still works', async () => {
    host.store.json.characters.main = ['Ann'];
    host.chunks = [chunk('wrong', 'anniversary celebration'), chunk('right', 'Ann arrived', 1)];
    const index = await mod.getLexicalIndex();
    const query = mod.buildQueryBundle([{ is_user: true, mes: 'Ann' }]);
    assert.deepEqual(hits(index, query.lexicalTerms), ['right']);
    assert.deepEqual(hits(index, ['celebrat']), ['wrong']);
});

test('warm queries reuse vocabulary and snapshots, but nested source edits are never stale', async () => {
    host.store.json.characters.main = [{ name: 'Alice' }];
    host.store.json.arcs = [{ name: 'Bob' }];
    host.store.json.events = [{ id: 'event', participants: ['Carol'] }];
    host.atoms = [{ edges: [{ s: 'Dora', t: 'Erin' }] }];
    const message = [{ is_user: true, mes: 'Alice Bob Carol Dora Erin' }];
    const first = mod.buildQueryBundle(message);
    const snapshot = mod.getTokenizerSnapshot();
    const index = await mod.getLexicalIndex();
    for (let i = 0; i < 10; i++) {
        const warm = mod.buildQueryBundle(message);
        assert.equal(warm.allCharacters, first.allCharacters, 'unchanged sources reuse vocabulary allocations');
        assert.equal(mod.getTokenizerSnapshot(), snapshot);
        assert.equal(await mod.getLexicalIndex(), index);
        assert.deepEqual(warm.focusTerms, first.focusTerms);
    }
    host.store.json.characters.main[0].name = 'Faye';
    host.store.json.arcs[0].name = 'Grace';
    host.store.json.events[0].participants[0] = 'Helen';
    host.atoms[0].edges[0].s = 'Irene';
    host.atoms[0].edges[0].t = 'Julia';
    const edited = mod.buildQueryBundle([{ is_user: true, mes: 'Faye Grace Helen Irene Julia' }]);
    assert.deepEqual(edited.focusTerms, ['Faye', 'Grace', 'Helen', 'Irene', 'Julia']);
    assert.deepEqual(edited.focusCharacters, ['Faye', 'Grace', 'Helen']);
    assert.deepEqual(mod.buildQueryBundle(message).focusTerms, []);
    assert.equal(host.reads, 1);
});

test('in-place alias target, USER and role edits invalidate the shared vocabulary', async () => {
    host.store.json.characters.main = ['Alice', 'Bob', 'Carol'];
    host.store.json.characterAliases = [{ from: 'Masked', to: 'Alice' }];
    const message = [{ is_user: true, mes: 'Masked Alice Bob Carol' }];
    assert.deepEqual(mod.buildQueryBundle(message).focusTerms, ['Alice', 'Bob', 'Carol']);
    host.store.json.characterAliases[0].to = 'Bob';
    assert.deepEqual(mod.buildQueryBundle(message).focusTerms, ['Bob', 'Alice', 'Carol']);
    host.context.name1 = 'Carol';
    host.context.name2 = 'Dora';
    const edited = mod.buildQueryBundle([{ is_user: true, mes: 'Masked Alice Carol Dora' }]);
    assert.deepEqual(edited.focusTerms, ['Bob', 'Alice', 'Dora']);
    host.store.json.characterAliases.length = 0;
    assert.deepEqual(mod.buildQueryBundle(message).focusTerms, ['Alice', 'Bob']);
});

test('a multilingual alias makes the chat spelling a direct event participant', () => {
    host.store.json.characters.main = ['五条悟'];
    host.store.json.events = [{ id: 'evt-1', participants: ['五条悟'], summary: '五条悟抵达东京。' }];
    host.store.json.characterAliases = [{ from: 'Gojo Satoru', to: '五条悟' }];

    const bundle = mod.buildQueryBundle([{ is_user: true, mes: 'Gojo Satoru 接下来会做什么？' }]);

    assert.deepEqual(bundle.focusTerms, ['五条悟']);
    assert.deepEqual(bundle.focusCharacters, ['五条悟']);
});

test('canonical and alias queries find historical prose without double-counting aliases', async () => {
    host.store.json.characters.main = ['雪照宁', '黑衣人'];
    host.chunks = [chunk('old-alias', '黑衣人来到城里')];
    const index = await mod.getLexicalIndex();
    host.store.json.characterAliases = [{ from: '黑衣人', to: '雪照宁', evidence: '明确揭示身份', _addedAt: 1 }];
    const current = await mod.getLexicalIndex();
    assert.equal(current, index);
    const canonical = mod.searchLexicalIndex(current, ['雪照宁']);
    assert.deepEqual(canonical.chunkIds, ['old-alias']);
    assert.deepEqual(mod.searchLexicalIndex(current, ['雪照宁', '黑衣人']).chunkScores, canonical.chunkScores);
    assert.equal(host.chunks[0].text, '黑衣人来到城里');
    assert.equal(host.reads, 1);
    host.store.json.characterAliases = [];
    assert.deepEqual(hits(await mod.getLexicalIndex(), ['雪照宁']), [], 'undo must not retain the identity reveal');
});

test('a failed chunk read is retryable instead of publishing a partial cache', async () => {
    host.chunks = [chunk('recovered', 'Alice arrived')];
    host.store.json.characters.main = ['Alice'];
    host.readChunks = async function () {
        if (++this.reads === 1) throw new Error('temporary database failure');
        return this.chunks;
    };
    await assert.rejects(mod.getLexicalIndex(), /temporary database failure/);
    assert.deepEqual(hits(await mod.getLexicalIndex(), ['Alice']), ['recovered']);
    assert.equal(host.reads, 2);
});

test('writes and removals during the initial build are included before it is published', async () => {
    host.store.json.characters.main = ['Alice'];
    const stale = chunk('removed', 'Alice old memory');
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    host.readChunks = async () => { await gate; return [stale]; };
    const pending = mod.getLexicalIndex();
    await Promise.resolve();
    mod.removeDocumentsByFloor(0);
    const event = { id: 'new-event', participants: ['Alice'], summary: 'Alice arrived (#2)' };
    host.store.json.events = [event];
    mod.addEventDocuments([event]);
    mod.addDocumentsForFloor(1, [chunk('new-chunk', 'Alice arrived', 1)]);
    release();
    const result = mod.searchLexicalIndex(await pending, ['Alice']);
    assert.deepEqual(result.chunkIds, ['new-chunk']);
    assert.deepEqual(result.eventIds, ['new-event']);
    mod.removeEventDocuments(['new-event']);
    assert.deepEqual(mod.searchLexicalIndex(await mod.getLexicalIndex(), ['Alice']).eventIds, []);
});

test('a name learned during a pending build is searchable when that build finishes', async () => {
    host.store.json.characters.main = ['上官'];
    let release;
    host.readChunks = () => new Promise(resolve => { release = resolve; });
    const pending = mod.getLexicalIndex();
    await Promise.resolve();
    host.store.json.characters.main.push('上官映雪');
    release([chunk('history', '上官映雪站在城门口')]);
    const current = await pending;
    assert.deepEqual(hits(current, ['上官映雪']), ['history']);
    assert.equal(await mod.getLexicalIndex(), current);
});

test('event edits replace old postings and empty edits remove the searchable document', async () => {
    host.store.json.characters.main = ['Alice', 'Bob'];
    host.store.json.events = [{ id: 'edited', participants: ['Alice'], summary: 'arrived' }];
    const index = await mod.getLexicalIndex();
    assert.deepEqual(mod.searchLexicalIndex(index, ['Alice']).eventIds, ['edited']);
    const edited = { id: 'edited', participants: ['Bob'], summary: 'departed' };
    host.store.json.events = [edited];
    mod.addEventDocuments([edited]);
    await mod.getLexicalIndex();
    assert.deepEqual(mod.searchLexicalIndex(index, ['Alice']).eventIds, []);
    assert.deepEqual(mod.searchLexicalIndex(index, ['Bob']).eventIds, ['edited']);
    const empty = { id: 'edited' };
    host.store.json.events = [empty];
    mod.addEventDocuments([empty]);
    await mod.getLexicalIndex();
    assert.deepEqual(mod.searchLexicalIndex(index, ['Bob']).eventIds, []);
    assert.equal(index.documentCount, 0);
});

test('a queued identity reveal and repeated event edits index only the final version', async (t) => {
    host.store.json.characters.main = ['黑衣人'];
    const original = { id: 'event', title: '相遇', participants: ['黑衣人'], summary: '黑衣人来到上官映雪曾经居住的客栈。 (#1)' };
    host.store.json.events = [original];
    const initial = await mod.getLexicalIndex();
    const writes = [];
    // Count actual writes at the search-engine boundary, not wall-clock time or
    // the corpus's private planning steps. Each write consumes freshly cut tokens.
    const add = mod.MiniSearch.prototype.add;
    t.mock.method(mod.MiniSearch.prototype, 'add', function (document) {
        writes.push(document.id);
        return add.call(this, document);
    });
    host.store.json.characterAliases = [{ from: '黑衣人', to: '上官映雪' }];
    const intermediate = { ...original, participants: ['上官映雪'] };
    const final = { ...intermediate, title: '最终记录' };
    host.store.json.events = [final];
    mod.addEventDocuments([intermediate]);
    mod.addEventDocuments([final]);
    const current = await mod.getLexicalIndex();
    assert.equal(current, initial);
    assert.deepEqual(writes, ['event']);
    assert.deepEqual(mod.searchLexicalIndex(current, ['上官映雪']).eventIds, ['event']);
    assert.deepEqual(mod.searchLexicalIndex(current, ['黑衣人']).eventIds, ['event']);
    assert.equal(host.reads, 1);
});

test('cold loading folds pending floor replacements before any obsolete source is indexed', async (t) => {
    host.store.json.characters.main = ['上官'];
    let release;
    host.readChunks = () => new Promise(resolve => { release = resolve; });
    const writes = [];
    const add = mod.MiniSearch.prototype.add;
    t.mock.method(mod.MiniSearch.prototype, 'add', function (document) {
        writes.push(document.id);
        return add.call(this, document);
    });
    const pending = mod.getLexicalIndex();
    await Promise.resolve();
    host.store.json.characters.main.push('上官映雪');
    mod.addDocumentsForFloor(0, [chunk('intermediate', '上官映雪的中间记录')]);
    mod.addDocumentsForFloor(0, [chunk('final', '上官映雪的最终记录')]);
    release([chunk('obsolete', '上官映雪的旧记录')]);
    const current = await pending;
    assert.deepEqual(writes, ['final']);
    assert.deepEqual(hits(current, ['上官映雪']), ['final']);
});

test('a failed batch replacement is discarded and rebuilt from committed sources on retry', async (t) => {
    host.store.json.characters.main = ['Alice', 'Bob'];
    host.store.json.events = [{ id: 'event', participants: ['Alice'], summary: 'arrived' }];
    const initial = await mod.getLexicalIndex();
    const add = mod.MiniSearch.prototype.add;
    let fail = true;
    t.mock.method(mod.MiniSearch.prototype, 'add', function (document) {
        if (fail) { fail = false; throw new Error('index write failed'); }
        return add.call(this, document);
    });
    const edited = { id: 'event', participants: ['Bob'], summary: 'departed' };
    host.store.json.events = [edited];
    mod.addEventDocuments([edited]);
    await assert.rejects(mod.getLexicalIndex(), /index write failed/);
    const recovered = await mod.getLexicalIndex();
    assert.notEqual(recovered, initial, 'a partly modified corpus must not be reused');
    assert.equal(recovered.documentCount, 1);
    assert.deepEqual(mod.searchLexicalIndex(recovered, ['Bob']).eventIds, ['event']);
    assert.deepEqual(mod.searchLexicalIndex(recovered, ['Alice']).eventIds, []);
    assert.equal(host.reads, 2);
});

test('an unawaited failed background index update stays retryable without an unhandled rejection', async (t) => {
    host.store.json.characters.main = ['Alice'];
    await mod.getLexicalIndex();
    const error = new Error('background index write failed');
    let failed;
    const attempted = new Promise(resolve => { failed = resolve; });
    const add = mod.MiniSearch.prototype.add;
    let shouldFail = true;
    t.mock.method(mod.MiniSearch.prototype, 'add', function (document) {
        if (shouldFail) {
            shouldFail = false;
            failed();
            throw error;
        }
        return add.call(this, document);
    });
    const event = { id: 'new-event', participants: ['Alice'], summary: 'arrived' };
    host.store.json.events = [event];
    mod.addEventDocuments([event]); // Production callers enqueue without awaiting.
    await attempted;
    await new Promise(resolve => setImmediate(resolve)); // Let unhandled-rejection reporting run.
    const recovered = await mod.getLexicalIndex();
    assert.deepEqual(mod.searchLexicalIndex(recovered, ['Alice']).eventIds, [event.id]);
});

test('updates around build completion are never lost, including deletes', async () => {
    host.store.json.characters.main = ['Alice'];
    for (let delay = 0; delay < 20; delay++) {
        mod.invalidateLexicalIndex();
        const original = chunk('old', 'Alice original', 0);
        let release;
        const gate = new Promise(resolve => { release = resolve; });
        host.readChunks = async () => { await gate; return [original]; };
        const pending = mod.getLexicalIndex();
        await Promise.resolve();
        release();
        for (let tick = 0; tick < delay; tick++) await Promise.resolve();
        mod.removeDocumentsByFloor(0);
        mod.addChunkDocuments([chunk('new', 'Alice replacement', 1)]);
        await pending;
        assert.deepEqual(hits(await mod.getLexicalIndex(), ['Alice']), ['new'], 'microtask offset ' + delay);
    }
});

test('clearing and rebuilding chunks preserves events and rejects late writes from another chat', async () => {
    host.store.json.characters.main = ['Alice'];
    host.store.json.events = [{ id: 'event', participants: ['Alice'], summary: 'arrived' }];
    host.chunks = [chunk('old', 'Alice original')];
    const initial = await mod.getLexicalIndex();
    mod.clearChunkDocuments(host.context.chatId);
    mod.addChunkDocuments([chunk('rebuilt', 'Alice rebuilt')], host.context.chatId);
    mod.addChunkDocuments([chunk('wrong-chat', 'Alice elsewhere')], 'previous-chat');
    const rebuilt = await mod.getLexicalIndex();
    assert.equal(rebuilt, initial, 'chunk maintenance must not rebuild the event corpus');
    assert.deepEqual(hits(rebuilt, ['Alice']), ['rebuilt']);
    assert.deepEqual(mod.searchLexicalIndex(rebuilt, ['Alice']).eventIds, ['event']);
    mod.clearChunkDocuments(host.context.chatId);
    assert.deepEqual(hits(await mod.getLexicalIndex(), ['Alice']), []);
    assert.equal(host.reads, 1);
});

test('bulk alias edits yield to the event loop and a read waits for all queued edits', async () => {
    host.store.json.characters.main = ['黑衣人', '雪照宁', 'Alice'];
    host.store.json.events = Array.from({ length: 1000 }, (_, i) => ({
        id: 'event-' + i, participants: ['黑衣人'],
        summary: '黑衣人离开城门，来到客栈，与掌柜讨论昨夜的事情。'.repeat(8),
    }));
    const initial = await mod.getLexicalIndex();
    host.store.json.characterAliases = [{ from: '黑衣人', to: '雪照宁', evidence: '明确揭示身份', _addedAt: 1 }];
    host.store.json.events = host.store.json.events.map(event => ({ ...event, participants: ['雪照宁'] }));
    let heartbeat = false;
    const nextTurn = new Promise(resolve => setTimeout(() => {
        heartbeat = true;
        const finalEdit = { id: 'event-0', participants: ['Alice'], summary: 'a subsequent edit' };
        host.store.json.events[0] = finalEdit;
        mod.addEventDocuments([finalEdit]);
        resolve();
    }, 0));
    mod.addEventDocuments(host.store.json.events);
    assert.equal(mod.getLexicalIdfAccessor().enabled, false, 'partial writes must not supply IDF');
    const current = await mod.getLexicalIndex();
    assert.equal(heartbeat, true, 'the batch must yield before completing');
    await nextTurn;
    assert.equal(current, initial);
    assert.equal(current.documentCount, 1000);
    assert.deepEqual(mod.searchLexicalIndex(current, ['Alice']).eventIds, ['event-0']);
    assert.equal(mod.searchLexicalIndex(current, ['雪照宁']).eventIds.length, 999);
    assert.equal(host.reads, 1);
});

test('an abandoned build cannot replace the next chat corpus', async () => {
    host.store.json.characters.main = ['Alice'];
    let release;
    host.readChunks = () => new Promise(resolve => { release = resolve; });
    const abandoned = mod.getLexicalIndex();
    await Promise.resolve();
    host.context.chatId = 'next-chat';
    host.chunks = [chunk('next', 'Alice new chat')];
    host.readChunks = async () => host.chunks;
    mod.invalidateLexicalIndex();
    const current = await mod.getLexicalIndex();
    release([chunk('old-chat', 'Alice old chat')]);
    assert.equal(await abandoned, null);
    assert.deepEqual(hits(await mod.getLexicalIndex(), ['Alice']), ['next']);
    assert.equal(await mod.getLexicalIndex(), current);
});

test('a chat switch during vocabulary repair cannot reuse the partly repaired corpus', async () => {
    host.store.json.characters.main = ['上官'];
    const originalChunks = Array.from({ length: 1000 }, (_, i) => chunk('old-' + i, '上官映雪站在城门口', i));
    host.chunks = originalChunks;
    await mod.getLexicalIndex();
    host.store.json.characters.main.push('上官映雪');
    const repairing = mod.getLexicalIndex();
    await new Promise(resolve => setTimeout(resolve, 0));
    host.context.chatId = 'other-chat';
    let releaseOther;
    host.readChunks = () => new Promise(resolve => { releaseOther = resolve; });
    const other = mod.getLexicalIndex();
    await Promise.resolve();
    host.context.chatId = 'test-chat';
    host.store.json.characters.main = ['上官'];
    host.readChunks = async () => originalChunks;
    const returned = await mod.getLexicalIndex();
    releaseOther([]);
    await Promise.all([repairing, other]);
    assert.equal(hits(returned, ['上官']).length, originalChunks.length);
});

test('a vocabulary-only change does not re-tokenize unrelated documents', async () => {
    mod.injectEntities(new Set(['上官']));
    const corpus = new mod.LexicalCorpus(mod.getTokenizerSnapshot());
    await corpus.applyBatch([{ docs: [
        { id: 'affected', type: 'chunk', floor: 0, text: '上官映雪站在城门口' },
        { id: 'untouched', type: 'chunk', floor: 1, text: '北京大学计算机学院' },
    ] }], corpus.tokenizer, () => true);
    mod.injectEntities(new Set(['上官', '上官映雪']));
    const next = mod.getTokenizerSnapshot();
    const processed = [];
    await corpus.applyBatch([], {
        ...next,
        tokenizeForIndex(text) { processed.push(text); return next.tokenizeForIndex(text); },
    }, () => true);
    assert.deepEqual(processed, ['上官映雪站在城门口']);
    assert.deepEqual(corpus.search('上官映雪', { exact: true }).map(item => item.id), ['affected']);
    assert.deepEqual(corpus.search('北京大学').map(item => item.id), ['untouched']);
});

test('batch repair cuts only retained affected documents and the final replacement', async () => {
    mod.injectEntities(new Set(['上官']));
    const corpus = new mod.LexicalCorpus(mod.getTokenizerSnapshot());
    const retained = { id: 'retained', type: 'chunk', floor: 0, text: '上官映雪站在城门口' };
    const edited = { id: 'edited', type: 'event', floor: null, text: '上官映雪的旧事件' };
    const removed = { id: 'removed', type: 'chunk', floor: 1, text: '上官映雪的待删除记录' };
    const identical = { id: 'identical', type: 'chunk', floor: 2, text: '上官映雪的未改变记录' };
    const unaffected = { id: 'unaffected', type: 'chunk', floor: 3, text: '北京大学计算机学院' };
    for (const doc of [retained, edited, removed, identical, unaffected]) corpus.upsert(doc);
    mod.injectEntities(new Set(['上官', '上官映雪']));
    const next = mod.getTokenizerSnapshot();
    const processed = [];
    const tracked = { ...next, tokenizeForIndex(text) { processed.push(text); return next.tokenizeForIndex(text); } };
    const final = { ...edited, text: '上官映雪的最终事件' };
    await corpus.applyBatch([
        { floor: 2, docs: [{ ...edited, text: '上官映雪的中间事件' }] },
        { removeIds: ['removed'], docs: [final, identical] },
        { docs: [final] },
    ], tracked, () => true);
    assert.deepEqual(processed.sort(), [retained.text, identical.text, final.text].sort());
    const rebuilt = new mod.LexicalCorpus(next);
    for (const doc of [retained, identical, final, unaffected]) rebuilt.upsert(doc);
    assert.equal(corpus.documentCount, rebuilt.documentCount);
    assert.equal(corpus.getIdf('上官映雪'), rebuilt.getIdf('上官映雪'));
    assert.deepEqual(corpus.search('上官映雪', { exact: true }).map(hit => hit.id).sort(), ['edited', 'identical', 'retained']);
    assert.equal(corpus.tokenizer, tracked);
});

test('batch folding preserves sequential clear, move, replacement and deletion semantics', async () => {
    const tokenizer = { tokenizeForIndex: text => text.split(' ') };
    const moving = { id: 'moving', type: 'chunk', floor: 0, text: 'alpha alpha beta' };
    const other = { id: 'other', type: 'chunk', floor: 1, text: 'gamma delta' };
    const event = { id: 'event', type: 'event', floor: null, text: 'epsilon beta' };
    const originals = [moving, other, event];
    const commands = [
        { floor: 0 },
        { floor: 1, docs: [{ ...moving, floor: 1, text: 'alpha gamma' }] },
        { docs: [moving] },
        { clearChunks: true },
        { removeIds: ['moving', 'event'] },
        { docs: [{ ...moving, type: 'event', floor: null, text: 'delta delta' }] },
        { docs: [{ ...event, type: 'chunk', floor: 0, text: 'epsilon gamma' }] },
        { docs: [{ ...moving, text: '' }] },
    ];
    for (const first of commands) for (const second of commands) {
        const updates = [first, second];
        // Straight sequential document semantics are the oracle; no tokenization
        // or batch planning is involved in deciding the expected final sources.
        const expected = new Map(originals.map(doc => [doc.id, doc]));
        for (const update of updates) {
            if (update.clearChunks || update.floor !== undefined) {
                for (const [id, doc] of expected) {
                    if (doc.type === 'chunk' && (update.clearChunks || doc.floor === update.floor)) expected.delete(id);
                }
            }
            for (const id of update.removeIds || []) expected.delete(id);
            for (const doc of update.docs || []) {
                if (doc.text) expected.set(doc.id, doc);
                else expected.delete(doc.id);
            }
        }
        const corpus = new mod.LexicalCorpus(tokenizer);
        for (const doc of originals) corpus.upsert(doc);
        await corpus.applyBatch(updates, tokenizer, () => true);
        const rebuilt = new mod.LexicalCorpus(tokenizer);
        for (const doc of expected.values()) rebuilt.upsert(doc);
        assert.equal(corpus.documentCount, expected.size);
        for (const term of ['alpha', 'beta', 'gamma', 'delta', 'epsilon']) {
            const found = index => index.search(term, { exact: true }).sort((a, b) => a.id.localeCompare(b.id));
            const actualHits = found(corpus);
            const expectedHits = found(rebuilt);
            assert.deepEqual(actualHits.map(({ id, type, floor }) => ({ id, type, floor })), expectedHits.map(({ id, type, floor }) => ({ id, type, floor })));
            assert.equal(corpus.getIdf(term), rebuilt.getIdf(term));
            actualHits.forEach((hit, i) => assert.ok(Math.abs(hit.score - expectedHits[i].score) < 1e-9));
        }
    }
});

test('floor edits preserve other floors, and moved/repeated-term documents leave no stale postings or IDF', async () => {
    const tokenizer = { tokenizeForIndex: text => text.split(' ') };
    const corpus = new mod.LexicalCorpus(tokenizer);
    const first = { id: 'moving', type: 'chunk', floor: 0, text: 'alpha alpha beta' };
    const retained = { id: 'retained', type: 'chunk', floor: 1, text: 'beta gamma' };
    const event = { id: 'event', type: 'event', floor: null, text: 'gamma delta' };
    await corpus.applyBatch([{ docs: [first, retained, event] }], tokenizer, () => true);
    const moved = { ...first, floor: 2, text: 'alpha alpha alpha gamma' };
    corpus.upsert(moved);
    await corpus.applyBatch([{ floor: 0 }], tokenizer, () => true);
    assert.deepEqual(corpus.search('alpha', { exact: true }).map(hit => hit.id), ['moving']);

    await corpus.applyBatch([{ floor: 2 }], tokenizer, () => true);
    const rebuilt = new mod.LexicalCorpus(tokenizer);
    await rebuilt.applyBatch([{ docs: [retained, event] }], tokenizer, () => true);
    assert.equal(corpus.documentCount, 2);
    assert.deepEqual(corpus.search('alpha', { exact: true }), []);
    for (const term of ['alpha', 'beta', 'gamma', 'delta']) {
        const scores = index => index.search(term, { exact: true }).map(({ id, score }) => ({ id, score }));
        assert.deepEqual(scores(corpus), scores(rebuilt));
        assert.equal(corpus.getIdf(term), rebuilt.getIdf(term));
    }
    await corpus.applyBatch([{ clearChunks: true }], tokenizer, () => true);
    assert.equal(corpus.documentCount, 1);
    assert.deepEqual(corpus.search('gamma', { exact: true }).map(hit => hit.id), ['event']);
});

test('clearing many small floors yields and stops safely when its owner is cancelled', async () => {
    const corpus = new mod.LexicalCorpus({ tokenizeForIndex: text => text.split(' ') });
    const docs = Array.from({ length: 30 }, (_, floor) => ({ id: 'chunk-' + floor, type: 'chunk', floor, text: 'alpha beta' }));
    await corpus.applyBatch([{ docs }], corpus.tokenizer, () => true);
    let current = true;
    let clock = 0;
    const originalPerformance = globalThis.performance;
    const heartbeat = new Promise(resolve => setTimeout(() => { current = false; resolve(); }, 0));
    try {
        // Controlled elapsed work, not a machine-speed threshold. A sequence of
        // small floors must share the time budget and let cancellation run.
        globalThis.performance = { now: () => { clock += 3; return clock; } };
        await corpus.applyBatch([{ clearChunks: true }], corpus.tokenizer, () => current);
        assert.equal(current, false);
        assert.ok(corpus.documentCount > 0, 'cancellation must stop work, including during batch planning');
    } finally {
        globalThis.performance = originalPerformance;
        await heartbeat;
    }
    await corpus.applyBatch([{ clearChunks: true }], corpus.tokenizer, () => true);
    assert.equal(corpus.documentCount, 0);
    assert.deepEqual(corpus.search('alpha', { exact: true }), []);
});

function temporalRecallFixture(targetParticipant) {
    const marker = '113年11月20日03:38';
    host.store.json.characters.main = ['Alice', 'Bob'];
    host.context.chat = Array.from({ length: 470 }, (_, floor) => ({
        is_user: floor % 2 === 1,
        mes: floor === 462 ? marker + '：历史现场' : '普通消息',
    }));
    host.context.chat[469] = { is_user: true, mes: 'Alice在' + marker + '发生了什么？' };
    const events = Array.from({ length: 231 }, (_, i) => ({
        id: 'ordinary-' + i,
        title: 'Alice '.repeat(8),
        participants: ['Alice'],
        summary: '一般事件 (#' + (i * 2 + 1) + ')',
    }));
    const target = {
        id: 'time-target', title: 'Alice', participants: [targetParticipant],
        summary: '发生在目标时间的事件。'.repeat(40) + ' (#463)',
    };
    const rejected = { ...target, id: 'below-gate' };
    host.store.json.events = [...events, target, rejected];
    host.scores = [
        ...events.map((event, i) => ({ eventId: event.id, similarity: 0.95 - i / 1000 })),
        { eventId: target.id, similarity: 0.60 },
        { eventId: rejected.id, similarity: 0.599 },
    ];
    return { target, rejected };
}

function diagnosticRecallFixture() {
    const event = { id: 'memory', title: 'Alice returned', participants: ['Alice'], summary: 'Alice returned home. (#1)' };
    host.store.json.characters.main = ['Alice'];
    host.store.json.events = [event];
    host.context.chat = [{ is_user: true, mes: 'Where did Alice return?' }];
    host.scores = [{ eventId: event.id, similarity: 0.95 }];
    return event;
}

test('repeated index read failures preserve dense recall and report the storage cause as degraded', async () => {
    const event = diagnosticRecallFixture();
    host.readChunks = async function () {
        this.reads++;
        throw new Error('lexical index read failed', { cause: new Error('database unavailable') });
    };
    const diagnostics = createRecallDiagnostics(host.context.chatId);
    const result = await mod.recallMemory([event], { enabled: true }, { diagnostics });
    assert.equal(host.reads, 2, 'both speculative preload and the recall-stage read fail');
    assert.ok(result.events.some(item => item.event.id === event.id), 'dense recall must remain usable');
    const report = formatRecallDiagnostics(diagnostics, { status: 'success' });
    assert.match(report, /status: degraded/);
    assert.match(report, /fallback \[lexical-preload\]: lexical index read failed/);
    assert.match(report, /fallback \[lexical-search\]: lexical index read failed/);
    assert.match(report, /Caused by: database unavailable/);
    assert.equal(host.released, 1);
});

test('a recovered preload reports its failure only in the affected recall run', async () => {
    const event = diagnosticRecallFixture();
    host.readChunks = async function () {
        if (++this.reads === 1) throw new Error('temporary preload read failure');
        return this.chunks;
    };
    const diagnostics = createRecallDiagnostics(host.context.chatId);
    const result = await mod.recallMemory([event], { enabled: true }, { diagnostics });
    assert.ok(result.events.some(item => item.event.id === event.id));
    assert.equal(result.metrics.lexical.eventHits, 1, 'the recall-stage retry may still succeed');
    assert.equal(diagnostics.fallbacks.length, 1);
    assert.match(formatRecallDiagnostics(diagnostics, { status: 'success' }), /fallback \[lexical-preload\]: temporary preload read failure/);
    const next = createRecallDiagnostics(host.context.chatId);
    await mod.recallMemory([event], { enabled: true }, { diagnostics: next });
    assert.deepEqual(next.fallbacks, []);
    assert.match(formatRecallDiagnostics(next, { status: 'success' }), /status: success/);
});

test('late speculative preload failure cannot change a cancelled recall report', async () => {
    const event = diagnosticRecallFixture();
    let failRead;
    host.readChunks = () => new Promise((resolve, reject) => { failRead = reject; });
    const controller = new AbortController();
    const diagnostics = createRecallDiagnostics(host.context.chatId);
    const pending = mod.recallMemory([event], { enabled: true }, { diagnostics, signal: controller.signal });
    await Promise.resolve();
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    diagnostics.finishedAt = performance.now();
    const before = formatRecallDiagnostics(diagnostics, { status: 'cancelled' });
    failRead(new Error('late storage failure'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(formatRecallDiagnostics(diagnostics, { status: 'cancelled' }), before);
    assert.deepEqual(diagnostics.fallbacks, []);
});

test('a failed lexical term keeps other hits but reports partial recall with its cause', async (t) => {
    const event = diagnosticRecallFixture();
    const index = await mod.getLexicalIndex();
    const originalSearch = index.search;
    t.mock.method(index, 'search', function (term, options) {
        if (term === 'alice') throw new Error('postings unavailable', { cause: new Error('broken search state') });
        return originalSearch.call(this, term, options);
    });
    const partial = mod.searchLexicalIndex(index, ['Alice', 'returned']);
    assert.deepEqual(partial.eventIds, [event.id], 'a failed term must not discard other usable lexical hits');
    const diagnostics = createRecallDiagnostics(host.context.chatId);
    const result = await mod.recallMemory([event], { enabled: true }, { diagnostics });
    assert.ok(result.events.some(item => item.event.id === event.id));
    const report = formatRecallDiagnostics(diagnostics, { status: 'success' });
    assert.match(report, /status: degraded/);
    assert.match(report, /fallback \[lexical-search\]:.*alice/);
    assert.match(report, /Caused by: postings unavailable\nCaused by: broken search state/);
});

test('full recall reranks even with a saved false flag and preserves a late lexical time event within caps', async () => {
    const { target, rejected } = temporalRecallFixture('Bob');
    const index = await mod.getLexicalIndex();
    const lexicalOrder = mod.searchLexicalIndex(index, ['Alice']).eventIds;
    assert.ok(lexicalOrder.indexOf(target.id) > 150, 'fixture must reproduce the truncated lexical tail');
    const result = await mod.recallMemory(host.store.json.events, { enabled: true, eventRerankEnabled: false });
    assert.ok(result.events.some(item => item.event.id === target.id));
    assert.ok(!result.events.some(item => item.event.id === rejected.id));
    assert.equal(result.events.find(item => item.event.id === target.id)._recallType, 'RELATED');
    assert.equal(result.events.length, 150);
    assert.equal(new Set(result.events.map(item => item.event.id)).size, result.events.length);
    assert.ok(host.vectorRequests.every(ids => ids.length <= 100 && !ids.includes(target.id)),
        'the other-owned 0.60 event must not bypass dense ownership admission');
    assert.ok(host.rerankRequests.some(ids => ids.length === 60 && ids.includes(target.id)));
    assert.equal(host.released, 1);
});

test('full recall protects a focused time event before dense top-100 and diversity top-50', async () => {
    const { target, rejected } = temporalRecallFixture('Alice');
    const result = await mod.recallMemory(host.store.json.events, { enabled: true });
    assert.ok(host.vectorRequests.every(ids => ids.length === 100 && ids.includes(target.id)));
    assert.ok(result.events.some(item => item.event.id === target.id && item._recallType === 'DIRECT'));
    assert.ok(!result.events.some(item => item.event.id === rejected.id));
    assert.ok(result.events.length <= 150);
    assert.ok(host.rerankRequests.some(ids => ids.length === 60 && ids.includes(target.id)));
    assert.equal(host.released, 1);
});
