/* global Buffer */
// Real summary/anchor/history transaction, HTTP confirmation and IndexedDB boundary.
// Protects import undo, source retirement and ambiguous saves; no model calls or source-text assertions.
import assert from 'node:assert/strict';
import { beforeEach, after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { setImmediate as nextTurn } from 'node:timers/promises';
import path from 'node:path';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';
import { maintenanceFixture, joinedEventPatch } from './fixtures/memory-maintenance.js';
import { memoryPolicy } from '../data/memory-policy.js';
import { entry } from './helpers/story-summary-entry.js';
import { createHideStateController } from '../hide-state.js';
import { memorySaveError } from '../data/memory-copy.js';
import * as vectorWrites from '../vector/runtime/maintenance-coordinator.js';
import { createAbortError, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';
import { METADATA_CONFIRMATION_TIMEOUT_MS } from '../data/metadata-confirmation.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const host = globalThis.__memoryStorageTest = { metadata: {}, context: {} };
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__memoryStorageTest.context;',
    'script.js': 'export let chat_metadata=globalThis.__memoryStorageTest.metadata; export function reload(){chat_metadata=globalThis.__memoryStorageTest.metadata;} export const getRequestHeaders=()=>({});',
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){},debug(){}};',
    'runtime.js': 'export const applyRecallRuntimeMutationBestEffort=(chatId,change)=>globalThis.__memoryStorageTest.mutations.push({chatId,...change}); export const clearRecallRuntime=async()=>{};',
    'modules/story-summary/data/config.js': 'export const getTextFilterRules=()=>[]; export const getVectorConfig=()=>globalThis.__memoryStorageTest.vectorConfig; export const getSummaryPanelConfig=()=>({memoryMaintenanceEnabled:false,trigger:{},ui:{hideSummarized:true,keepVisibleCount:0}}); export const getSettings=()=>({storySummary:{enabled:true}}); export const DEFAULT_MEMORY_PROMPT_TEMPLATE="{$剧情记忆}";',
    'modules/story-summary/generate/llm.js': 'export const generateSummary=(...args)=>globalThis.__memoryStorageTest.generate(...args); export const parseSummaryJson=JSON.parse; export const isSummaryGenerationCancelledError=()=>false;',
    'modules/story-summary/maintenance/runner.js': 'export const createSharedMemoryAgent=()=>{throw Error("unexpected Agent request");}; export const runMemoryAgent=createSharedMemoryAgent;',
    'modules/story-summary/vector/utils/embedder.js': 'export const getEngineFingerprint=()=>"test-engine";',
    'modules/story-summary/vector/llm/siliconflow.js': 'export const embed=(texts)=>globalThis.__memoryStorageTest.embed(texts);',
    'modules/story-summary/vector/retrieval/recall.js': 'export const recallMemory=(...args)=>globalThis.__memoryStorageTest.recall(...args); export const hydrateDirectEvidence=()=>{throw Error("unexpected hydration");}; export const releaseDirectEvidenceContext=async()=>{};',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/data/store.js';",
        "export * from './modules/story-summary/data/memory-commit.js';",
        "export * from './modules/story-summary/data/summary-import.js';",
        "export { normalizeCharacterAliases } from './modules/story-summary/data/character-aliases.js';",
        "export * from './modules/story-summary/data/summary-history.js';",
        "export * from './modules/story-summary/data/anchor-extraction.js';",
        "export * from './modules/story-summary/data/anchor-invalidation.js';",
        "export * from './modules/story-summary/data/message-sources.js';",
        "export * from './modules/story-summary/data/source-sync.js';",
        "export * from './modules/story-summary/maintenance/domain.js';",
        "export * from './modules/story-summary/maintenance/history.js';",
        "export * from './modules/story-summary/maintenance/ranges.js';",
        "export * from './modules/story-summary/maintenance/session.js';",
        "export * from './modules/story-summary/maintenance/commit.js';",
        "export * from './modules/story-summary/maintenance/host.js';",
        "export * from './modules/story-summary/generate/generator.js';",
        "export { buildVectorPromptText } from './modules/story-summary/generate/prompt.js';",
        "export * from './modules/story-summary/vector/storage/state-store.js';",
        "export { db, stateVectorsTable, chunksTable, chunkVectorsTable, metaTable } from './modules/story-summary/data/db.js';",
        "export { deleteChunksFromFloor, deleteChunksAtFloor, updateMeta, clearAllChunks, clearEventVectors } from './modules/story-summary/vector/storage/chunk-store.js';",
        "export { reload } from 'script.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const relative = path.relative(root, path.resolve(args.resolveDir, args.path)).replaceAll('\\', '/');
            const key = Object.hasOwn(shims, relative) ? relative : path.basename(args.path);
            return Object.hasOwn(shims, key) ? { path: key, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const originalFetch = globalThis.fetch;
after(() => { mod.db.close(); globalThis.fetch = originalFetch; delete globalThis.__memoryStorageTest; });
const ext = () => host.metadata.extensions.LittleWhiteBox;
const disk = () => host.files.get(host.context.chatId).extensions.LittleWhiteBox;

beforeEach(async () => {
    for (const table of mod.db.tables) await table.clear();
    const fixture = maintenanceFixture();
    Object.assign(host, { fixture, mode: 'save', reads: 0, writes: 0, mutations: [], afterSave: null, files: new Map(), metadata: { extensions: { LittleWhiteBox: {} } } });
    host.vectorConfig = { enabled: false, embeddingApi: {} };
    host.generate = () => assert.fail('unexpected summary request');
    host.embed = () => assert.fail('unexpected embedding request');
    host.recall = () => assert.fail('unexpected recall request');
    host.context = { ...fixture, characterId: 0, characters: [{ name: '角色', chat: fixture.chatId, avatar: 'fixture.png' }],
        saveMetadata: async () => {
            host.writes++;
            if (host.mode !== 'old') host.files.set(host.context.chatId, structuredClone(host.metadata));
            await host.afterSave?.();
            if (host.mode === 'throw_after' || host.mode === 'old') throw new Error('transport');
        },
    };
    host.files.set(fixture.chatId, structuredClone(host.metadata));
    globalThis.fetch = async (url, request) => {
        host.reads++;
        if (host.mode === 'read_fail') throw new Error('read offline');
        const key = JSON.parse(request.body).file_name;
        return new Response(JSON.stringify([{ chat_metadata: host.files.get(key) }]));
    };
    mod.reload();
    mod.getSummaryStore();
});

async function importFixture() {
    const next = mod.prepareImportedSummary(mod.readSummaryMemory(), host.fixture.json, host.fixture.cutoff);
    await mod.commitSummaryMemory(host.context.chatId, next);
    return structuredClone(ext().storySummary.json);
}

test('switching characters with the same filename does not roll back or save the target summary', async () => {
    await importFixture();
    const tracker = mod.createMessageSourceTracker();
    tracker.reset({ ...host.context, characterId: 1, chat: [...host.context.chat, { mes: 'other owner extra floor' }] });
    tracker.switchChat(host.context);
    const before = structuredClone(disk());
    const writes = host.writes;
    assert.equal((await mod.synchronizeSourceCaches(tracker, host.context)).status, 'unchanged');
    assert.deepEqual(disk(), before);
    assert.equal(host.writes, writes);
});

for (const edited of [false, true]) test(`invalid L2 history does not block raw-source maintenance (edited: ${edited})`, async () => {
    await importFixture();
    ext().storySummary.summaryInvalid = true;
    const tracker = mod.createMessageSourceTracker(); tracker.reset(host.context);
    if (edited) host.context.chat[0].mes += ' edited';
    const gate = entry(['ensureCurrentSources'], {
        ...mod, ...vectorWrites, createAbortError, throwIfSignalAborted, memorySaveError,
        getContext: () => host.context, messageSources: tracker, isChatStale: () => false,
        isStorySummaryConsumableForCurrentChat: () => mod.isSummaryConsumable(mod.getSummaryStore(), host.context.chat.length),
        synchronizeCurrentSources: () => mod.synchronizeSourceCaches(tracker, host.context),
    });
    await gate.ensureCurrentSources(null, { requireSummary: false });
    assert.equal(tracker.inspect(host.context), null);
    assert.equal(ext().storySummary.summaryInvalid, true);
    await assert.rejects(gate.ensureCurrentSources(), { code: 'summary_history_invalid' });
});

test('an uncertain save can be confirmed on the next operation without replaying the save', async () => {
    await importFixture();
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = 'saved while offline';
    host.mode = 'read_fail';
    await assert.rejects(mod.commitSummaryMemory(host.context.chatId, next), { code: 'metadata_save_unconfirmed' });
    const writes = host.writes;
    host.mode = 'save';
    await mod.waitForMemoryCommit();
    assert.equal(mod.getMemoryCommitState(), 'ready');
    assert.equal(host.writes, writes);
    assert.deepEqual(mod.readPublishedSummaryMemory(), next);
    mod.assertMemoryWritable();
});

test('stalled readback releases the writer within its deadline, including a noncooperative transport', async t => {
    await importFixture();
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let entered, signal, otherWrite = false;
    const reading = new Promise(resolve => { entered = resolve; });
    globalThis.fetch = (_url, options) => {
        signal = options.signal;
        entered();
        return new Promise(() => {});
    };
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = 'saved';
    const saving = assert.rejects(vectorWrites.runVectorWriteTask({ scope: vectorWrites.VECTOR_WRITE_SCOPES.IO },
        () => mod.commitSummaryMemory(host.context.chatId, next)), { code: 'metadata_save_unconfirmed' });
    const following = vectorWrites.runVectorWriteTask({ scope: vectorWrites.VECTOR_WRITE_SCOPES.CONFIG }, () => { otherWrite = true; });
    await reading;
    assert.equal(otherWrite, false);
    t.mock.timers.tick(METADATA_CONFIRMATION_TIMEOUT_MS);
    await Promise.all([saving, following]);
    assert.equal(signal.aborted, true);
    assert.equal(otherWrite, true);
    assert.equal(mod.getMemoryCommitState(), 'unconfirmed');
    await vectorWrites.shutdownVectorWriteCoordinator();
    vectorWrites.resumeVectorWriteCoordinator();
});

async function seedAnchors() {
    const next = mod.readSummaryMemory();
    next.stateAtoms = structuredClone(host.fixture.atoms);
    next.l0Index = structuredClone(host.fixture.l0Index);
    await mod.commitSummaryMemory(host.context.chatId, next);
}

async function maintain(commands) {
    const next = mod.readSummaryMemory();
    const { memory, results } = mod.editMemoryBatch({ json: next.storySummary.json, atoms: next.stateAtoms }, commands, host.fixture.cutoff);
    const operations = results.map((result, index) => ({ ...commands[index], changes: result.changes }));
    next.storySummary.json = memory.json;
    next.stateAtoms = memory.atoms;
    mod.appendMaintenanceReceipt(next.storySummary, { version: 2, id: `receipt-${host.writes}`, runId: 'storage-test', policy: memoryPolicy(), operations,
        coverage: { supplied: [], missingAnchors: [] } });
    await mod.commitSummaryMemory(host.context.chatId, next);
    return operations;
}
const fixFact = { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '未经证实的传闻' } };
const fixAnchor = { kind: 'edit', collection: 'anchors', key: 'atom-1-0', patch: { semantic: '夏实说听说可能如此，自己没有确证。' } };

async function seedCacheRange(chatId, floors, lastChunkFloor = Math.max(...floors)) {
    const keys = floors.map(floor => ({ chatId, floor, chunkId: `c-${floor}-0` }));
    await mod.chunksTable.bulkPut(keys.map(row => ({ ...row, text: `floor ${row.floor}` })));
    await mod.chunkVectorsTable.bulkPut(keys.map(({ chatId: owner, chunkId }) => ({ chatId: owner, chunkId, vector: new ArrayBuffer(8) })));
    await mod.saveStateVectors(chatId, floors.map(floor => ({ atomId: `a-${floor}`, floor, vector: [1, 0] })), 'test');
    await mod.metaTable.put({ chatId, lastChunkFloor, fingerprint: 'test', updatedAt: 1 });
}

function observeCacheWrites(t) {
    let writes = 0;
    const record = () => { writes++; };
    for (const table of mod.db.tables) for (const event of ['creating', 'updating', 'deleting']) {
        table.hook(event, record);
        t.after(() => table.hook(event).unsubscribe(record));
    }
    return () => writes;
}

for (const scenario of [
    { name: 'floor zero USER edit', kind: 'edit', floor: 0, change: chat => { chat[0].mes += ' changed'; }, chunks: [0], anchors: [0, 1] },
    { name: 'AI continuation', change: chat => { chat[1].mes += ' continued'; }, chunks: [1], anchors: [1] },
    { name: 'swipe', kind: 'swipe', floor: 1, change: chat => { chat[1].mes = 'replacement'; }, chunks: [1], from: 1 },
    { name: 'reorder then quiet', kind: 'edit', floor: 2, change: chat => { [chat[1], chat[2]] = [chat[2], chat[1]]; }, from: 1 },
    { name: 'middle deletion', kind: 'delete', change: chat => { chat.splice(2, 1); }, from: 2 },
    { name: 'tail deletion', kind: 'delete', change: chat => { chat.splice(22); }, from: 22 },
]) test(`source owner retires persisted cache: ${scenario.name}`, async t => {
    await seedAnchors();
    const { chatId, chat } = host.context;
    await seedCacheRange(chatId, chat.map((_, floor) => floor));
    const tracker = mod.createMessageSourceTracker(); tracker.reset(host.context);
    scenario.change(chat);
    tracker.observeCompletion(host.context, chat.length - 1);
    assert.ok(tracker.inspect(host.context));
    const result = await mod.synchronizeSourceCaches(tracker, host.context, scenario);
    assert.equal(result.status, 'synced');
    assert.equal(tracker.inspect(host.context), null);
    const removedChunk = floor => scenario.chunks ? scenario.chunks.includes(floor) : floor >= scenario.from;
    const removedAnchor = floor => scenario.anchors ? scenario.anchors.includes(floor) : floor >= scenario.from;
    const chunks = await mod.chunksTable.where('chatId').equals(chatId).toArray();
    assert.deepEqual(chunks.map(row => row.floor).sort((a, b) => a - b), Array.from({ length: 24 }, (_, floor) => floor).filter(floor => !removedChunk(floor)));
    assert.equal(await mod.chunkVectorsTable.where('chatId').equals(chatId).count(), chunks.length);
    assert.ok(ext().stateAtoms.every(atom => !removedAnchor(atom.floor)));
    assert.ok((await mod.getAllStateVectors(chatId)).every(row => !removedAnchor(row.floor)));
    assert.deepEqual(disk(), ext());
    const writes = observeCacheWrites(t), saves = host.writes;
    assert.equal((await mod.synchronizeSourceCaches(tracker, host.context, scenario)).status, 'unchanged');
    assert.equal(writes(), 0);
    assert.equal(host.writes, saves);
});

// Exercise the real entry's hide wiring, not a second copy of its save policy.
function memoryVisibility() {
    const errors = [], rendered = [], saves = [];
    let warnings = 0;
    host.context.saveChat = async () => saves.push(host.context.chat.map(message => message.is_system));
    const ui = entry(['hideState', 'applyHideState', 'clearHideState', 'isStorySummaryConsumableForCurrentChat'], {
        ...mod, createHideStateController, memorySaveError,
        getContext: () => host.context,
        getStorySummaryEnablement: () => ({ context: host.context, effectiveEnabled: true }),
        getHideUiSettings: () => ({ hideSummarized: true, useVectorBoundary: false, keepVisibleCount: 4 }),
        getVectorConfig: () => host.vectorConfig,
        events: {}, MODULE_ID: 'story-summary',
        document: { querySelector: selector => ({ setAttribute: (_key, value) => rendered.push({ selector, value }) }) },
        window: { toastr: { warning: () => { warnings++; } } },
        xbLog: { error: (_module, _message, error) => errors.push(error.code) },
    });
    return { ...ui, errors, rendered, saves, warnings: () => warnings };
}

for (const uncertain of [false, true]) test(`first swipe during initial visibility waits for its own save (uncertain: ${uncertain})`, async () => {
    await importFixture();
    const context = host.context;
    context.chat.push({ mes: '次日', is_user: true }, { mes: '原回复', is_user: false, swipe_id: 0 });
    const memory = mod.readSummaryMemory();
    memory.l0Index.byFloor[25] = { floor: 25, status: 'empty', atoms: 0 };
    await mod.commitSummaryMemory(context.chatId, memory);
    // Loaded persisted flags/cache, with no edit or generation in this session.
    context.chat.forEach((message, floor) => { message.is_system = floor <= 19; });
    const initial = context.chat.map(message => message.is_system);
    const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
    const ui = memoryVisibility();
    let release, entered;
    const saveStarted = new Promise(resolve => { entered = resolve; });
    host.afterSave = () => { entered(); return new Promise(resolve => { release = resolve; }); };
    if (uncertain) host.mode = 'read_fail';
    context.chat[25].swipe_id = 1;
    const syncing = mod.synchronizeSourceCaches(tracker, context, { kind: 'swipe', floor: 25 });
    const synced = uncertain ? assert.rejects(syncing, { code: 'metadata_save_unconfirmed' }) : syncing;
    await saveStarted;
    const updating = ui.applyHideState();
    try {
        assert.equal(mod.getMemoryCommitState(), 'saving');
        assert.deepEqual(context.chat.map(message => message.is_system), initial);
        assert.deepEqual(ui.rendered, []);
        assert.deepEqual(ui.saves, []);
        assert.deepEqual(ui.errors, []);
        assert.equal(ui.warnings(), 0);
    } finally {
        host.afterSave = null;
        release();
        await synced;
        await updating;
    }
    assert.deepEqual(ui.saves, []); // Never write an unconfirmed draft with a visibility save.
    assert.equal(ui.warnings(), uncertain ? 1 : 0);
    assert.deepEqual(ui.errors, uncertain ? ['metadata_unconfirmed'] : []);
    assert.equal(mod.getMemoryCommitState(), uncertain ? 'unconfirmed' : 'ready');
    assert.equal(mod.isSummaryConsumable(mod.getSummaryStore(), context.chat.length), !uncertain);
    if (uncertain) assert.ok(context.chat.every(message => !message.is_system));
    else {
        assert.equal(tracker.inspect(context), null);
        assert.deepEqual(context.chat.map(message => message.is_system), initial);
        assert.deepEqual(ui.rendered, []);
        assert.deepEqual(disk(), ext());
    }
});

test('same-chat reload preserves every persisted L0/L1 row and extraction receipt with zero writes', async t => {
    await importFixture(); await seedAnchors();
    const context = host.context;
    await seedCacheRange(context.chatId, [0, 1, 2, 3]);
    const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
    const beforeMemory = mod.readSummaryMemory();
    const beforeTables = await Promise.all(mod.db.tables.map(table => table.toArray()));
    const saves = host.writes, writes = observeCacheWrites(t);
    context.chat.splice(0, context.chat.length, ...structuredClone(context.chat));
    host.metadata = structuredClone(host.files.get(context.chatId));
    mod.reload();
    tracker.switchChat(context);
    assert.equal((await mod.synchronizeSourceCaches(tracker, context)).status, 'unchanged');
    assert.deepEqual(mod.readSummaryMemory(), beforeMemory);
    assert.deepEqual(await Promise.all(mod.db.tables.map(table => table.toArray())), beforeTables);
    assert.equal(host.writes, saves);
    assert.equal(writes(), 0);
});

for (const failure of ['cache', 'save']) test(`failed ${failure} never confirms source safety`, async t => {
    await seedAnchors();
    await seedCacheRange(host.context.chatId, [0, 1, 2, 3]);
    const tracker = mod.createMessageSourceTracker(); tracker.reset(host.context);
    host.context.chat[0].mes += ' changed';
    if (failure === 'cache') {
        const fail = () => { throw new Error('storage unavailable'); };
        mod.chunkVectorsTable.hook('deleting', fail);
        t.after(() => mod.chunkVectorsTable.hook('deleting').unsubscribe(fail));
    } else host.mode = 'old';
    await assert.rejects(mod.synchronizeSourceCaches(tracker, host.context));
    assert.ok(tracker.inspect(host.context));
    assert.equal(mod.isSummaryConsumable(ext().storySummary, host.context.chat.length), false);
});

for (const kind of ['edit', 'swipe']) test(`queued ${kind} survives leaving and returning before the consistency writer runs`, async () => {
    await importFixture(); await seedAnchors();
    const context = host.context;
    await seedCacheRange(context.chatId, [0, 1, 2, 3]);
    const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
    context.chat[1].mes += ' changed';
    mod.retainSourceChange(tracker, context, { kind, floor: 1 });
    const other = { chatId: 'other', chat: [] };
    tracker.switchChat(other);
    assert.equal((await mod.synchronizeSourceCaches(tracker, other, { kind, floor: 1, isCurrent: () => false })).status, 'stale');
    tracker.switchChat(context);
    const result = await mod.synchronizeSourceCaches(tracker, context);
    assert.equal(await mod.chunksTable.where('[chatId+floor]').equals([context.chatId, 1]).count(), 0);
    if (kind === 'edit') {
        assert.equal(result.status, 'synced');
        assert.equal(tracker.inspect(context), null);
        assert.equal(mod.isSummaryConsumable(ext().storySummary, context.chat.length), true);
    } else {
        // Historical swipe crossed the imported baseline: preserve, but block L2.
        assert.equal(result.status, 'failed');
        assert.equal(ext().storySummary.sourceInvalidFromFloor, 1);
        assert.equal(mod.isSummaryConsumable(ext().storySummary, context.chat.length), false);
    }
    assert.deepEqual(disk(), ext());
});

function importEntry(tracker) {
    const noop = () => {};
    return entry(['importSummaryMemoryPackage', 'extractSummaryImportJson', 'cloneSummaryJsonForPortability',
        'normalizePortableFact', 'normalizeInternalFact', 'stripFloorMarker'], { ...mod, getContext: () => host.context, messageSources: tracker,
        invalidateLexicalIndex: noop, refreshEntityLexiconAndWarmup: noop, scheduleLexicalWarmup: noop,
        clearHideState: noop, sendFrameBaseData: noop, sendFrameFullData: noop, sendAnchorStatsToFrame: noop,
        sendVectorStatsToFrame: noop, notifyStorySummaryChatState: noop });
}

for (const order of ['event-first', 'background-first']) for (const sameText of [false, true]) test(`${order}: a selected swipe change cannot leave imported L2 consumable (same text: ${sameText})`, async () => {
    await importFixture(); await seedAnchors();
    const context = host.context;
    context.chat[1].swipe_id = 0;
    const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
    context.chat[1].swipe_id = 1;
    if (!sameText) context.chat[1].mes += ' selected another branch';
    const first = await mod.synchronizeSourceCaches(tracker, context, order === 'event-first' ? { kind: 'swipe', floor: 1 } : {});
    assert.equal(first.status, 'failed');
    assert.equal(mod.isSummaryConsumable(ext().storySummary, context.chat.length), false);
    assert.equal((await mod.synchronizeSourceCaches(tracker, context, { kind: 'swipe', floor: 1 })).status, 'failed');
    assert.equal(ext().storySummary.sourceInvalidFromFloor, 1);
    assert.deepEqual(disk(), ext());
});

for (const generated of [false, true]) test(`unselected swipe deletion then immediate edit preserves L2 (generated: ${generated})`, async t => {
    await importFixture(); await seedAnchors();
    const context = host.context;
    if (generated) {
        context.chat.push({ mes: '次日', is_user: true }, { mes: '共同出发', is_user: false });
        host.generate = async () => JSON.stringify({ events: [], factUpdates: [{ s: '旅人', p: '行程', o: '共同出发', isState: false }] });
        await mod.runSummaryGeneration(25, { trigger: { delayFloors: 0 } });
    }
    const floor = generated ? 25 : 1;
    await seedCacheRange(context.chatId, [floor]);
    const message = context.chat[floor];
    message.swipes = ['unused', message.mes]; message.swipe_id = 1;
    const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
    const before = structuredClone(ext().storySummary);
    const metadataWrites = host.writes, cacheWrites = observeCacheWrites(t);
    message.swipes.splice(0, 1); message.swipe_id = 0;
    tracker.observeSwipeDeleted(context, { messageId: floor, swipeId: 0 });
    assert.equal(host.writes, metadataWrites);
    assert.equal(cacheWrites(), 0);
    // No intervening inspect/sync: the edit must not disguise the renumbering as a branch replacement.
    message.mes += ' ordinary edit'; message.swipes[0] = message.mes;
    assert.equal((await mod.synchronizeSourceCaches(tracker, context, { kind: 'edit', floor })).status, 'synced');
    assert.deepEqual(ext().storySummary, before);
    assert.equal(mod.isSummaryConsumable(ext().storySummary, context.chat.length), true);
    assert.equal(await mod.chunksTable.where('[chatId+floor]').equals([context.chatId, floor]).count(), 0);
    assert.deepEqual(disk(), ext());
});

// Verified native contracts: 1.14 loads the replacement before deletion notification
// and then reloads; 1.18 notifies first, then loads it and emits MESSAGE_SWIPED.
for (const order of ['body-before-notice', 'body-after-notice']) for (const sameText of [false, true]) {
    test(`selected swipe deletion rolls generated L2 back once (${order}, same text: ${sameText})`, async () => {
        await importFixture();
        const baselineFacts = structuredClone(ext().storySummary.json.facts);
        const context = host.context;
        context.chat.push({ mes: '次日', is_user: true }, { mes: '共同出发', is_user: false });
        host.generate = async () => JSON.stringify({ events: [], factUpdates: [{ s: '旅人', p: '行程', o: '共同出发', isState: false }] });
        await mod.runSummaryGeneration(25, { trigger: { delayFloors: 0 } });
        assert.equal(ext().storySummary.lastSummarizedMesId, 25);
        assert.ok(ext().storySummary.json.facts.some(fact => fact.p === '行程' && fact.o === '共同出发'));
        const message = context.chat[25];
        message.swipes = [message.mes, sameText ? message.mes : '独自留下']; message.swipe_id = 0;
        const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
        message.swipes.splice(0, 1);
        if (order === 'body-before-notice') message.mes = message.swipes[0];
        tracker.observeSwipeDeleted(context, { messageId: 25, swipeId: 0 });
        assert.equal((await mod.synchronizeSourceCaches(tracker, context)).status, 'synced');
        assert.equal(ext().storySummary.lastSummarizedMesId, 23);
        assert.deepEqual(ext().storySummary.json.facts, baselineFacts);
        const rolledBack = structuredClone(ext().storySummary);
        if (order === 'body-after-notice') {
            message.mes = message.swipes[0];
            await mod.synchronizeSourceCaches(tracker, context, { kind: 'swipe', floor: 25 });
        } else {
            context.chat = structuredClone(context.chat);
            tracker.switchChat(context);
        }
        assert.equal(tracker.inspect(context), null);
        assert.deepEqual(ext().storySummary, rolledBack);
        assert.deepEqual(disk(), ext());
    });
}

for (const kind of ['swipe', 'delete']) for (const stage of ['queued', 'failed']) for (const action of ['import', 'clear']) test(`confirmed ${action} resolves ${stage} ${kind} rollback intent without confirming source caches`, async () => {
    await importFixture(); await seedAnchors();
    const context = host.context;
    await seedCacheRange(context.chatId, [0, 1, 2, 3]);
    const tracker = mod.createMessageSourceTracker(); tracker.reset(context);
    if (kind === 'swipe') context.chat[1].mes += ' swiped';
    else context.chat.splice(1, 1);
    mod.retainSourceChange(tracker, context, { kind, floor: 1 });
    if (stage === 'failed') assert.equal((await mod.synchronizeSourceCaches(tracker, context)).status, 'failed');
    // Explicit recovery can follow a queued, cancelled or failed consistency task.
    const sourceBasis = tracker.capture(context);
    let imported;
    if (action === 'import') {
        await importEntry(tracker).importSummaryMemoryPackage(JSON.stringify({ ...mod.SUMMARY_MEMORY_PACKAGE,
            data: { facts: [{ 人物名字: '夏实', 种类: '去向', 描述: '导入后确认的新路线' }] } }), context.chatId);
        imported = structuredClone(mod.readSummaryMemory().storySummary.json);
    } else await mod.clearSummaryData(context.chatId);
    tracker.resolveRollback(sourceBasis, context);
    assert.ok(tracker.inspect(context));
    assert.equal((await mod.synchronizeSourceCaches(tracker, context, { kind, floor: 1 })).status, 'synced');
    assert.equal(tracker.inspect(context), null);
    assert.equal(await mod.chunksTable.where('[chatId+floor]').equals([context.chatId, 1]).count(), 0);
    assert.ok(ext().stateAtoms.every(atom => atom.floor !== 1));
    assert.equal(ext().storySummary.sourceInvalidFromFloor, undefined);
    if (action === 'import') {
        assert.equal(mod.isSummaryConsumable(ext().storySummary, context.chat.length), true);
        assert.deepEqual(ext().storySummary.json, imported);
    }
    assert.deepEqual(disk(), ext());
});

test('tail invalidation preserves other chats and earlier floors, with a matching durable L1 boundary', async () => {
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [0, 5, 22, 23]);
    await seedCacheRange('other-chat', [22, 23]);
    host.mutations = [];
    assert.equal(await mod.deleteStateVectorsFromFloor(chatId, 22), 2);
    assert.deepEqual(await mod.deleteChunksFromFloor(chatId, 22), { deletedCount: 2, boundaryChanged: true, lastChunkFloor: 21 });
    assert.deepEqual((await mod.chunksTable.where('chatId').equals(chatId).toArray()).map(row => row.floor).sort((a, b) => a - b), [0, 5]);
    assert.deepEqual((await mod.stateVectorsTable.where('chatId').equals(chatId).toArray()).map(row => row.floor).sort((a, b) => a - b), [0, 5]);
    assert.equal(await mod.chunkVectorsTable.where('chatId').equals(chatId).count(), 2);
    for (const table of [mod.chunksTable, mod.chunkVectorsTable, mod.stateVectorsTable]) {
        assert.equal(await table.where('chatId').equals('other-chat').count(), 2);
    }
    const meta = await mod.metaTable.get(chatId);
    assert.equal(meta.lastChunkFloor, 21);
    assert.equal(meta.fingerprint, 'test');
    assert.ok(host.mutations.every(change => change.chatId === chatId));
});

for (const failureStage of ['vectors', 'boundary']) test(`L1 range deletion rolls back all tables when ${failureStage} fail`, async t => {
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [20, 22, 23]);
    const before = await Promise.all(mod.db.tables.map(table => table.toArray()));
    host.mutations = [];
    const fail = () => { throw new Error('fixture storage failure'); };
    const table = failureStage === 'vectors' ? mod.chunkVectorsTable : mod.metaTable;
    const event = failureStage === 'vectors' ? 'deleting' : 'updating';
    table.hook(event, fail);
    t.after(() => table.hook(event).unsubscribe(fail));
    await assert.rejects(mod.deleteChunksFromFloor(chatId, 22));
    assert.deepEqual(await Promise.all(mod.db.tables.map(table => table.toArray())), before);
    assert.deepEqual(host.mutations, []);
});

test('empty invalidation does not write, create metadata or announce cache changes', async t => {
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [0, 5], 5);
    const originalMeta = await mod.metaTable.get(chatId);
    host.mutations = [];
    const writes = observeCacheWrites(t);
    for (const owner of [chatId, 'missing-chat']) {
        assert.equal(await mod.deleteStateVectorsFromFloor(owner, 22), 0);
        assert.deepEqual(await mod.deleteChunksFromFloor(owner, 22), {
            deletedCount: 0, boundaryChanged: false, lastChunkFloor: owner === chatId ? 5 : -1,
        });
    }
    assert.equal(writes(), 0);
    assert.deepEqual(await mod.metaTable.get(chatId), originalMeta);
    assert.equal(await mod.metaTable.get('missing-chat'), undefined);
    assert.deepEqual(host.mutations, []);
});

test('L1 boundary rewinds even when a processed range contains no chunks', async () => {
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [0], 23);
    host.mutations = [];
    assert.deepEqual(await mod.deleteChunksFromFloor(chatId, 22), { deletedCount: 0, boundaryChanged: true, lastChunkFloor: 21 });
    assert.equal((await mod.metaTable.get(chatId)).lastChunkFloor, 21);
    assert.equal(host.mutations.length, 1);
});

test('ordinary tail edits without affected memory do not add a memory save or readback', async t => {
    await importFixture(); await seedAnchors();
    const before = mod.readSummaryMemory(), saves = host.writes, reads = host.reads;
    const cacheWrites = observeCacheWrites(t);
    host.mutations = [];
    host.context.chat[22].mes = 'edited user text';
    await mod.rollbackSummaryIfNeeded({ invalidateFloors: [22, 23] });
    await mod.deleteChunksAtFloor(host.context.chatId, 22);
    assert.deepEqual(mod.readSummaryMemory(), before);
    assert.equal(host.writes, saves);
    assert.equal(host.reads, reads);
    assert.equal(cacheWrites(), 0);
    assert.deepEqual(host.mutations, []);
});

test('an extraction status alone still requires a confirmed source invalidation', async () => {
    await importFixture();
    const memory = mod.readSummaryMemory();
    memory.l0Index.byFloor[23] = { floor: 23, status: 'empty', atoms: 0 };
    await mod.commitSummaryMemory(host.context.chatId, memory);
    const saves = host.writes;
    await mod.rollbackSummaryIfNeeded({ invalidateFloors: [22, 23] });
    assert.equal(host.writes, saves + 1);
    assert.equal(ext().l0Index.byFloor[23], undefined);
    assert.deepEqual(disk(), ext());
});

test('ordinary edit preserves later memory/vectors and retires only the affected anchor history', async () => {
    await importFixture(); await seedAnchors(); await maintain([fixAnchor]); await completeRange();
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [0, 1, 3, 22, 23]);
    await seedCacheRange('other', [1, 3]);
    const before = structuredClone(ext());
    await mod.rollbackSummaryIfNeeded({ invalidateFloors: [1] });
    await mod.deleteChunksAtFloor(chatId, 1);
    assert.deepEqual(ext().stateAtoms, before.stateAtoms.filter(atom => atom.floor !== 1));
    assert.deepEqual(ext().storySummary.json, before.storySummary.json);
    assert.equal(ext().l0Index.byFloor[1], undefined);
    assert.deepEqual(mod.maintenanceRanges(ext().storySummary.summaryHistory, 23).pending, [{ from: 2, to: 2 }]);
    for (const table of [mod.chunksTable, mod.stateVectorsTable]) {
        assert.deepEqual((await table.where('chatId').equals(chatId).toArray()).map(row => row.floor).sort((a, b) => a - b), [0, 3, 22, 23]);
        assert.equal(await table.where('chatId').equals('other').count(), 2);
    }
    assert.equal(await mod.chunkVectorsTable.where('chatId').equals(chatId).count(), 4);
    assert.equal((await mod.metaTable.get(chatId)).lastChunkFloor, 0);
    assert.deepEqual(disk(), ext());
});

for (const failureStage of ['vectors', 'boundary']) test(`local edit invalidation is atomic on ${failureStage} failure`, async t => {
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [0, 1, 3]);
    const before = await Promise.all(mod.db.tables.map(table => table.toArray()));
    host.mutations = [];
    const table = failureStage === 'vectors' ? mod.chunkVectorsTable : mod.metaTable;
    const event = failureStage === 'vectors' ? 'deleting' : 'updating';
    const fail = () => { throw new Error('fixture storage failure'); };
    table.hook(event, fail);
    t.after(() => table.hook(event).unsubscribe(fail));
    await assert.rejects(mod.deleteChunksAtFloor(chatId, 1));
    assert.deepEqual(await Promise.all(mod.db.tables.map(table => table.toArray())), before);
    assert.deepEqual(host.mutations, []);
});

test('pure source retirement preserves its input, including absent anchors and completed history', async () => {
    await importFixture(); await seedAnchors(); await maintain([{ ...fixAnchor, kind: 'delete' }]); await completeRange();
    const before = mod.readSummaryMemory(), original = structuredClone(before);
    const result = mod.invalidateMemoryAnchors(before, 1);
    assert.deepEqual(before, original);
    assert.deepEqual(result.next.storySummary.json, original.storySummary.json);
    assert.ok(result.atomIds.includes('atom-1-0'));
    assert.ok(result.retired > 0);
    assert.ok(result.next.stateAtoms.every(atom => atom.floor < 1));
    assert.deepEqual(mod.maintenanceRanges(result.next.storySummary.summaryHistory, 23).pending, [{ from: 2, to: 24 }]);
    const repeated = mod.invalidateMemoryAnchors(result.next, 1);
    assert.deepEqual(repeated.next, result.next);
    assert.equal(repeated.retired, 0);
    assert.deepEqual(repeated.atomIds, []);
});

for (const identityShape of ['portable', 'duplicate']) {
    test(`imported ${identityShape} fact identities support maintenance and undo without changing their content`, async () => {
        // The portable decoder supplies empty IDs; import is the identity boundary.
        const facts = host.fixture.json.facts;
        for (const fact of facts) fact.id = identityShape === 'portable' ? '' : 'f-8';
        facts.at(-1).id = 'retained-identity';
        const content = facts.map(({ id: _id, ...fact }) => fact);
        const imported = await importFixture();
        assert.equal(new Set(imported.facts.map(f => f.id)).size, facts.length);
        assert.ok(imported.facts.every(f => f.id));
        assert.equal(imported.facts.at(-1).id, 'retained-identity');
        if (identityShape === 'duplicate') assert.equal(imported.facts[0].id, 'f-8');
        assert.deepEqual(imported.facts.map(({ id: _id, _addedAt: _floor, ...fact }) => fact),
            content.map(({ _addedAt: _floor, ...fact }) => fact));
        assert.deepEqual(disk().storySummary.json.facts, imported.facts);

        await maintain([{ ...fixFact, key: imported.facts[0].id }]);
        assert.equal(ext().storySummary.json.facts[0].o, fixFact.patch.o);
        assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
        assert.deepEqual(ext().storySummary.json.facts, imported.facts);
        assert.deepEqual(disk().storySummary.json.facts, imported.facts);
    });
}

function readMaintenanceState() {
    const store = mod.getSummaryStore();
    return { chatId: host.context.chatId, chat: host.context.chat, store, json: store.json,
        cutoff: store.lastSummarizedMesId, atoms: mod.getStateAtoms(), l0Index: mod.getL0Index() };
}

async function saveMaintenanceSession(session) {
    return mod.commitMemorySession(session, { runId: 'session-test', calls: [] }, {
        read: readMaintenanceState,
        commit: (next, previous, _impact, validate) => mod.commitSummaryMemory(host.context.chatId, next,
            { previous, validate, maintenanceWrite: true }),
    });
}

for (const action of ['completion', 'outcome', 'anchor', 'summary']) {
    test(`pending generation survives ${action} maintenance unless its summary input changed`, async () => {
        await importFixture(); await seedAnchors();
        const initial = mod.readSummaryMemory();
        initial.storySummary.updatedAt = 1;
        await mod.commitSummaryMemory(host.context.chatId, initial);
        host.context.chat.push({ mes: '次日', is_user: true }, { mes: '共同出发', is_user: false });
        const session = mod.createMemorySession(readMaintenanceState()); session.initial();
        let release, entered;
        const started = new Promise(resolve => { entered = resolve; });
        host.generate = () => { entered(); return new Promise(resolve => { release = resolve; }); };
        const generating = mod.runSummaryGeneration(25, { trigger: { delayFloors: 0 } });
        await started;
        if (action === 'completion') session.runTool('CompleteMaintenance', { from: 1, to: 24 });
        else if (action === 'outcome') session.conclude({ status: 'partial', summary: '下次继续' });
        else session.runTool('EditMemory', { edits: [action === 'anchor' ? fixAnchor : fixFact] });
        let saved;
        try { saved = await saveMaintenanceSession(session); }
        finally { release(JSON.stringify({ events: [], factUpdates: [{ s: '旅人', p: '行程', o: '共同出发', isState: false }] })); }
        const result = await generating;
        assert.equal(result.success, action !== 'summary', JSON.stringify(result));
        assert.equal(result.stale === true, action === 'summary');
        assert.equal(saved.current.store.updatedAt === 1, action !== 'summary');
        assert.ok(ext().storySummary.summaryHistory[0].maintenance.some(receipt => receipt.id === saved.receipt.id));
        assert.equal(ext().storySummary.lastSummarizedMesId, action === 'summary' ? 23 : 25);
        if (action === 'summary') assert.equal(ext().storySummary.json.facts[0].o, fixFact.patch.o);
        if (action === 'anchor') assert.equal(ext().stateAtoms[0].semantic, fixAnchor.patch.semantic);
    });
}

for (const scenario of ['completion', 'outcome', 'anchor', 'summary', 'source-edit', 'cancel', 'chat-switch', 'save-rejected', 'save-unconfirmed']) {
    test(`summary response during ${scenario} maintenance save waits, then revalidates before committing`, async () => {
        await importFixture(); await seedAnchors();
        const initial = mod.readSummaryMemory();
        host.context.chat.push({ mes: '次日', is_user: true }, { mes: '共同出发', is_user: false });
        const session = mod.createMemorySession(readMaintenanceState()); session.initial();
        const controller = new AbortController();
        let release, entered, calls = 0, settled = false;
        const started = new Promise(resolve => { entered = resolve; });
        host.generate = () => { calls++; entered(); return new Promise(resolve => { release = resolve; }); };
        const generating = mod.runSummaryGeneration(25, { trigger: { delayFloors: 0 } }, {}, { signal: controller.signal })
            .then(result => { settled = true; return result; });
        await started;
        if (scenario === 'outcome') session.conclude({ status: 'partial', summary: '下次继续' });
        else if (scenario === 'anchor' || scenario === 'summary') {
            session.runTool('EditMemory', { edits: [scenario === 'anchor' ? fixAnchor : fixFact] });
        } else session.runTool('CompleteMaintenance', { from: 1, to: 24 });
        let finishSave, saveEntered;
        const saveStarted = new Promise(resolve => { saveEntered = resolve; });
        host.afterSave = () => { saveEntered(); return new Promise(resolve => { finishSave = resolve; }); };
        if (scenario === 'save-rejected') {
            host.mode = 'old';
            const saveMetadata = host.context.saveMetadata;
            host.context.saveMetadata = async () => {
                try { await saveMetadata(); }
                finally { host.mode = 'save'; host.context.saveMetadata = saveMetadata; }
            };
        }
        if (scenario === 'save-unconfirmed') host.mode = 'read_fail';
        const writes = host.writes;
        const saving = saveMaintenanceSession(session);
        const saved = scenario === 'save-rejected'
            ? assert.rejects(saving, { code: 'metadata_not_saved', uncertain: false })
            : scenario === 'save-unconfirmed'
                ? assert.rejects(saving, { code: 'metadata_save_unconfirmed', uncertain: true }) : saving;
        let result, maintenance;
        try {
            await saveStarted;
            release(JSON.stringify({ events: [], factUpdates: [{ s: '旅人', p: '行程', o: '共同出发', isState: false }] }));
            await nextTurn();
            assert.equal(settled, false);
            assert.equal(host.writes, writes + 1);
            if (scenario === 'source-edit') host.context.chat[24].mes = '修改后的来源';
            if (scenario === 'chat-switch') host.context = { ...host.context, chatId: 'other-chat' };
            if (scenario === 'cancel') {
                controller.abort();
                await nextTurn();
                assert.equal(settled, true); // Cancellation must not wait for the unrelated save.
            }
        } finally {
            host.afterSave = null;
            finishSave?.();
            try { maintenance = await saved; }
            finally { host.mode = 'save'; result = await generating; }
        }
        const commits = ['completion', 'outcome', 'anchor', 'save-rejected', 'save-unconfirmed'].includes(scenario);
        assert.equal(result.success, commits, JSON.stringify(result));
        assert.equal(result.stale === true, ['summary', 'source-edit'].includes(scenario));
        assert.equal(result.cancelled === true, ['cancel', 'chat-switch'].includes(scenario));
        assert.equal(mod.getMemoryCommitState(), 'ready');
        assert.equal(calls, 1);
        assert.equal(host.writes, writes + 1 + Number(commits));
        assert.equal(ext().storySummary.lastSummarizedMesId, commits ? 25 : 23);
        if (maintenance) assert.ok(ext().storySummary.summaryHistory[0].maintenance.some(receipt => receipt.id === maintenance.receipt.id));
        if (scenario === 'save-rejected') assert.deepEqual(ext().storySummary.summaryHistory[0].maintenance,
            initial.storySummary.summaryHistory[0].maintenance);
        assert.equal(ext().storySummary.json.facts.some(fact => fact.s === '旅人' && fact.p === '行程' && fact.o === '共同出发'), commits);
        if (scenario === 'summary') assert.equal(ext().storySummary.json.facts[0].o, fixFact.patch.o);
        if (scenario === 'anchor') assert.equal(ext().stateAtoms[0].semantic, fixAnchor.patch.semantic);
        assert.deepEqual(host.files.get(host.fixture.chatId).extensions.LittleWhiteBox, ext());
    });
}

for (const kind of ['edit', 'merge']) {
    test(`${kind} event canonicalizes names and causes before receipts; reload preserves exact rollback`, async () => {
        const original = await importFixture();
        await maintain([{ kind, collection: 'events', key: 'evt-1',
            ...(kind === 'merge' ? { removeIds: ['evt-2'] } : {}),
            patch: { ...(kind === 'merge' ? joinedEventPatch : {}), participants: [' 夏实 ', ' 药君 '], causedBy: [' evt-3 '] } }]);
        const receipt = disk().storySummary.summaryHistory[0].maintenance[0];
        const savedEvent = disk().storySummary.json.events.find(event => event.id === 'evt-1');
        assert.deepEqual(savedEvent.participants, ['夏实', '药君']);
        assert.deepEqual(savedEvent.causedBy, ['evt-3']);
        assert.deepEqual(receipt.operations[0].changes.find(change => change.key === 'evt-1').after, savedEvent);
        host.metadata = structuredClone(host.files.get(host.context.chatId)); mod.reload(); mod.getSummaryStore();
        assert.deepEqual(ext().storySummary.json.events.find(event => event.id === 'evt-1'), savedEvent);
        assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
        assert.deepEqual(ext().storySummary.json, original);
        assert.deepEqual(disk(), ext());
    });
}

test('index status and repair include earlier runs regardless of results pagination', async () => {
    await importFixture(); await seedAnchors();
    await maintain([{ kind: 'edit', collection: 'events', key: 'evt-1', patch: { title: '红山项链误会' } }, fixAnchor]);
    const next = mod.readSummaryMemory();
    for (let i = 0; i < 10; i++) mod.appendMaintenanceReceipt(next.storySummary, {
        version: 2, id: `later-${i}`, runId: `later-run-${i}`, policy: memoryPolicy(), operations: [],
        coverage: { supplied: [], missingAnchors: [] }, outcome: { status: 'partial' },
    });
    await mod.commitSummaryMemory(host.context.chatId, next, { maintenanceWrite: true });
    host.vectorConfig.enabled = true;
    const maintenance = mod.createMemoryMaintenanceHost({ canRun: () => true, changed() {} });
    const first = await maintenance.results(), older = await maintenance.results(10);
    assert.equal(first.items.length, 10); assert.equal(older.items.length, 1);
    assert.deepEqual(first.index, { status: 'pending', count: 2 });
    assert.deepEqual(older.index, first.index);
    let embedded = 0;
    host.embed = texts => { embedded += texts.length; return texts.map(() => [1, 0]); };
    assert.equal((await maintenance.repairIndexes()).status, 'ready');
    assert.equal(embedded, 3); // One event, one anchor's scene and one relation vector.
    assert.deepEqual((await maintenance.results()).index, { status: 'ready', count: 0 });
    assert.deepEqual((await maintenance.results(10)).index, { status: 'ready', count: 0 });
});

async function completeRange(from = 1, to = 24) {
    const next = mod.readSummaryMemory();
    mod.appendMaintenanceReceipt(next.storySummary, { version: 2, id: `complete-${host.writes}`, runId: 'complete-run', policy: memoryPolicy(),
        cutoff: host.fixture.cutoff + 1, operations: [], completion: { from, to }, coverage: { supplied: [], missingAnchors: [] } });
    await mod.commitSummaryMemory(host.context.chatId, next, { maintenanceWrite: true });
}
const progress = () => mod.maintenanceRanges(ext().storySummary.summaryHistory, ext().storySummary.lastSummarizedMesId);

test('completion survives reload; manual edits invalidate its fixed baseline in the same confirmed save', async () => {
    await importFixture(); await completeRange();
    host.metadata = structuredClone(host.metadata); mod.reload(); mod.getSummaryStore();
    assert.deepEqual(progress().pending, []);
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = '用户改动';
    await mod.commitSummaryMemory(host.context.chatId, next);
    assert.deepEqual(progress().pending, [{ from: 1, to: 24 }]);
    assert.deepEqual(disk(), ext());
});

test('late anchors reopen just their floor; clear and same-ID regeneration never resurrect completion', async () => {
    await importFixture(); await completeRange();
    const next = mod.readSummaryMemory(); next.stateAtoms.push(structuredClone(host.fixture.atoms[0]));
    await mod.commitSummaryMemory(host.context.chatId, next);
    assert.deepEqual(progress().pending, [{ from: 2, to: 2 }]);
    await completeRange(2, 2);
    const { next: cleared } = mod.invalidateMemoryAnchors(mod.readSummaryMemory(), 1, 'anchors_cleared');
    await mod.commitSummaryMemory(host.context.chatId, cleared);
    assert.equal(ext().stateAtoms.length, 0);
    const afterClear = progress();
    host.metadata = structuredClone(host.metadata); mod.reload(); mod.getSummaryStore();
    const rebuilt = mod.readSummaryMemory(); rebuilt.stateAtoms.push(structuredClone(host.fixture.atoms[0]));
    await mod.commitSummaryMemory(host.context.chatId, rebuilt);
    assert.deepEqual(progress(), afterClear);
    assert.deepEqual(disk(), ext());
});

test('own edits retain completed ranges; import replacement and rollback remove their receipts', async () => {
    await importFixture(); await completeRange();
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = '维护修正';
    await mod.commitSummaryMemory(host.context.chatId, next, { maintenanceWrite: true });
    assert.deepEqual(progress().pending, []);
    await mod.rollbackSummaryOnce(host.context.chatId);
    assert.deepEqual(progress().completed, []);
    await completeRange(); await importFixture();
    assert.deepEqual(progress().completed, []);
});

test('old-server save and uncertain save never publish newly completed ranges', async () => {
    for (const mode of ['old', 'read_fail']) {
        host.mode = 'save'; await importFixture();
        host.mode = mode;
        await assert.rejects(completeRange());
        const published = mod.readPublishedSummaryMemory();
        assert.deepEqual(mod.maintenanceRanges(published.storySummary.summaryHistory, 23).completed, []);
        if (mode === 'read_fail') assert.equal(mod.getMemoryCommitState(), 'unconfirmed');
    }
});

test('actual import baseline: repeated maintenance is reversible but imported events/facts are not erased', async () => {
    const original = await importFixture();
    assert.equal(mod.getRollbackOnceTargetEndMesId(ext().storySummary), null);
    await maintain([fixFact]);
    await maintain([{ ...fixFact, patch: { o: '夏实只听说，未查证' } }]);
    host.metadata = structuredClone(host.metadata); mod.reload();
    const result = await mod.rollbackSummaryOnce(host.context.chatId);
    assert.equal(result.success, true);
    assert.equal(result.targetEndMesId, 23);
    assert.deepEqual(ext().storySummary.json, original);
    assert.equal(original.events.length, 4);
    assert.equal(original.facts.length, 5);
    assert.equal(mod.getRollbackOnceTargetEndMesId(ext().storySummary), null);
    assert.deepEqual(disk(), ext());
});

test('fact correction survives the next generated batch; batch then maintenance rollback restores the original facts', async () => {
    host.fixture.json.facts.push({ id: 'f-6', s: '药君', p: '物品', o: '拥有药杖', since: 3, _addedAt: 19 });
    const original = await importFixture();
    const correction = { kind: 'edit', collection: 'facts', key: 'f-2', patch: { s: '药君', o: '拥有药箱和药杖' } };
    await assert.rejects(maintain([correction]), { code: 'fact_conflict' });
    assert.deepEqual(disk().storySummary.json, original);
    await maintain([correction, { kind: 'delete', collection: 'facts', key: 'f-6' }]);
    const corrected = structuredClone(ext().storySummary.json);
    const next = mod.readSummaryMemory();
    const merged = mod.mergeNewData(next.storySummary.json, { factUpdates: [] }, 25, { returnMeta: true });
    assert.deepEqual(merged.json.facts, corrected.facts);
    next.storySummary.json = merged.json;
    next.storySummary.lastSummarizedMesId = 25;
    mod.addSummarySnapshot(next.storySummary, 23, 25, merged.undo);
    host.context.chat.push({ mes: '次日', is_user: true }, { mes: '出发' });
    await mod.commitSummaryMemory(host.context.chatId, next);
    assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
    assert.deepEqual(ext().storySummary.json, corrected);
    assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
    assert.deepEqual(ext().storySummary.json, original);
    assert.deepEqual(disk(), ext());
});

test('upstream import boundary converts once; corrupt exact inverse cannot become a baseline', () => {
    const oldImport = [{ endMesId: 23 }];
    const upgraded = mod.upgradeSummaryHistory(oldImport);
    assert.equal(upgraded.value[0].kind, 'baseline');
    assert.equal(mod.getRollbackOnceTargetEndMesId({ lastSummarizedMesId: 23, summaryHistory: upgraded.value }), null);
    assert.throws(() => mod.upgradeSummaryHistory([{ format: 1, previousEndMesId: -1, endMesId: 23, undo: { version: 1, unknown: true } }]));
});

for (const kind of ['edit', 'delete']) {
    test(`${kind} anchor: clear retires history, reload and same-ID extraction cannot resurrect old source`, async () => {
        const original = await importFixture();
        await seedAnchors();
        await maintain([fixFact, { ...fixAnchor, kind }]);
        await mod.saveStateVectors(host.context.chatId, [{ atomId: 'atom-1-0', floor: 1, vector: [1, 0] }], 'test');
        const writes = host.writes;
        await mod.invalidateSummaryAnchors(host.context.chatId, 0, 'anchors_cleared');
        assert.equal(host.writes - writes, 1);
        assert.equal((await mod.getAllStateVectors(host.context.chatId)).length, 0);
        const receipt = ext().storySummary.summaryHistory[0].maintenance[0];
        assert.equal(receipt.operations[1].changes[0].retired.reason, 'anchors_cleared');
        assert.equal(mod.maintenanceImpact(receipt.operations).atomIds.length, 0);
        assert.ok(receipt.operations[1].changes[0].before);
        host.metadata = structuredClone(host.metadata); mod.reload();
        const extraction = mod.createAnchorExtractionDraft(host.context.chatId, host.context.chat);
        const regenerated = { ...host.fixture.atoms[0], semantic: '重新提取的新正文，不能被旧撤销覆盖' };
        extraction.addAtoms([regenerated]);
        extraction.setStatus(1, { status: 'ok', atoms: 1 });
        await extraction.commit();
        assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
        assert.deepEqual(ext().storySummary.json, original);
        assert.deepEqual(ext().stateAtoms, [regenerated]);
    });
}

test('active anchor conflicts still refuse undo; retirement only skips explicitly invalidated changes', async () => {
    await importFixture(); await seedAnchors(); await maintain([fixFact, fixAnchor]);
    const edit = mod.readSummaryMemory();
    edit.stateAtoms[0].semantic = '人工修改';
    await mod.commitSummaryMemory(host.context.chatId, edit);
    const before = structuredClone(ext());
    const result = await mod.rollbackSummaryOnce(host.context.chatId);
    assert.equal(result.reason, 'history_discontinuous');
    assert.deepEqual(ext(), before);
});

test('source invalidation scans every batch, including absent anchors, before undoing a generated batch', async () => {
    await importFixture(); await seedAnchors();
    await maintain([{ ...fixAnchor, kind: 'delete' }]);
    // Add a new generated batch after the imported baseline.
    const next = mod.readSummaryMemory();
    const merged = mod.mergeNewData(next.storySummary.json, { factUpdates: [{ s: '夏实', p: '城市', o: '北京' }] }, 25, { returnMeta: true });
    next.storySummary.json = merged.json;
    next.storySummary.lastSummarizedMesId = 25;
    mod.addSummarySnapshot(next.storySummary, 23, 25, merged.undo);
    await mod.commitSummaryMemory(host.context.chatId, next);
    host.context.chat.push({ mes: 'new', is_user: true }, { mes: 'new reply', is_user: false });
    // Ordinary edit keeps L2 but retires the older, already absent L0 operation.
    await mod.rollbackSummaryIfNeeded({ invalidateFromFloor: 1 });
    assert.equal(ext().storySummary.lastSummarizedMesId, 25);
    assert.ok(ext().storySummary.summaryHistory[0].maintenance[0].operations[0].changes[0].retired);
    const result = await mod.rollbackSummaryIfNeeded({ changedFromFloor: 24 });
    assert.equal(result.status, 'rolled_back');
    assert.equal(ext().storySummary.lastSummarizedMesId, 23);
    assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
    assert.equal(ext().stateAtoms.length, 0);
});

test('source replacement across baseline preserves imported content and persists only source invalidity', async () => {
    const original = await importFixture(); await seedAnchors();
    host.context.chat[20].mes = 'changed';
    const result = await mod.rollbackSummaryIfNeeded({ changedFromFloor: 20 });
    assert.equal(result.reason, 'source_boundary_invalid');
    assert.deepEqual(ext().storySummary.json, original);
    assert.equal(ext().storySummary.sourceInvalidFromFloor, 20);
    assert.equal(ext().storySummary.summaryInvalid, undefined);
    assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
    assert.deepEqual(disk(), ext());
});

test('undoing baseline maintenance cannot clear an unresolved source boundary', async () => {
    const original = await importFixture(); await maintain([fixFact]);
    await mod.rollbackSummaryIfNeeded({ changedFromFloor: 20 });
    assert.equal((await mod.rollbackSummaryOnce(host.context.chatId)).success, true);
    assert.deepEqual(ext().storySummary.json, original);
    assert.equal(ext().storySummary.sourceInvalidFromFloor, 20);
    assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
});

test('source stays blocked when both rollback and safety-marker saves are confirmed not saved', async () => {
    await importFixture();
    host.mode = 'old';
    await assert.rejects(mod.rollbackSummaryIfNeeded({ changedFromFloor: 20 }), { code: 'metadata_not_saved' });
    assert.equal(mod.getMemoryCommitState(), 'source_invalid');
    assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
    assert.equal(ext().storySummary.summaryInvalid, undefined);
    host.mode = 'save';
    await mod.clearSummaryData(host.context.chatId);
    assert.equal(mod.getMemoryCommitState(), 'ready');
});

test('ordinary source edit with failed vector cleanup blocks old anchors without corrupting history', async t => {
    await importFixture(); await seedAnchors(); await maintain([fixAnchor]);
    const original = structuredClone(ext().storySummary.json);
    const cacheFailure = t.mock.method(mod.stateVectorsTable, 'where', () => { throw new Error('cache offline'); });
    host.context.chat[1].mes = 'edited source';
    await assert.rejects(mod.rollbackSummaryIfNeeded({ invalidateFromFloor: 1 }), { code: 'memory_cache_invalidation_failed' });
    assert.deepEqual(ext().storySummary.json, original);
    assert.equal(ext().storySummary.summaryInvalid, undefined);
    assert.equal(ext().storySummary.sourceInvalidFromFloor, 1);
    assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
    assert.deepEqual(disk(), ext());
    cacheFailure.mock.restore();
    await mod.clearSummaryData(host.context.chatId);
    assert.equal(ext().stateAtoms.length, 0);
    assert.equal(mod.getMemoryCommitState(), 'ready');
});

test('ordinary source edit with failed metadata save remains blocked until invalid anchors are cleared', async () => {
    await importFixture(); await seedAnchors(); await maintain([fixAnchor]);
    host.mode = 'old';
    host.context.chat[1].mes = 'edited source';
    await assert.rejects(mod.rollbackSummaryIfNeeded({ invalidateFromFloor: 1 }), { code: 'metadata_not_saved' });
    assert.equal(mod.getMemoryCommitState(), 'source_invalid');
    assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
    host.mode = 'save';
    await mod.clearSummaryData(host.context.chatId);
    assert.equal(ext().stateAtoms.length, 0);
    assert.deepEqual(ext().l0Index.byFloor, {});
    assert.equal(mod.getMemoryCommitState(), 'ready');
});

test('a local L1 cleanup failure preserves memory and blocks the old source through the confirmed save boundary', async t => {
    await importFixture(); await seedAnchors();
    const chatId = host.context.chatId;
    await seedCacheRange(chatId, [0, 1, 3]);
    const before = structuredClone(ext());
    const fail = () => { throw new Error('L1 storage offline'); };
    mod.chunkVectorsTable.hook('deleting', fail);
    t.after(() => mod.chunkVectorsTable.hook('deleting').unsubscribe(fail));
    await assert.rejects(mod.rollbackSummaryIfNeeded({ invalidateFloors: [1],
        invalidateSourceCache: () => mod.deleteChunksAtFloor(chatId, 1) }));
    assert.deepEqual(ext().stateAtoms, before.stateAtoms);
    assert.deepEqual(ext().storySummary.json, before.storySummary.json);
    assert.equal(ext().storySummary.sourceInvalidFromFloor, 1);
    assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
    assert.deepEqual(disk(), ext());
});

for (const cancel of [false, true]) test(`manual summary owns cancellation while an earlier edit is saving (cancel: ${cancel})`, async () => {
    await importFixture();
    host.context.chat.push({ mes: 'new question', is_user: true }, { mes: 'new answer', is_user: false });
    const messageSources = mod.createMessageSourceTracker();
    messageSources.reset(host.context);
    let finishSave, running = false, requests = 0;
    host.afterSave = () => new Promise(resolve => { finishSave = resolve; });
    const next = mod.readSummaryMemory();
    next.storySummary.json.facts[0].o = 'edited fact';
    const saving = mod.commitSummaryMemory(host.context.chatId, next);
    while (!finishSave) await Promise.resolve();
    const messages = [], errors = [];
    const noop = () => {};
    const ui = entry(['handleFrameMessage', 'handleManualGenerate', 'ensureCurrentSources',
        'isSummaryGenerating', 'beginSummaryExecution', 'cancelActiveSummaryExecution',
        'finishSummaryExecution', 'notifySummaryState', 'postSummaryExecution'], {
        ...mod, ...vectorWrites, messageSources, AbortController, createAbortError, throwIfSignalAborted,
        memorySaveError, SUMMARY_FEEDBACK_COPY, activeSummaryExecution: null, currentMesId: null,
        getContext: () => host.context, document: { getElementById: noop }, isTrustedMessage: () => true,
        isStorySummaryEnabledForCurrentChat: () => true,
        isStorySummaryConsumableForCurrentChat: () => mod.isSummaryConsumable(mod.getSummaryStore(), host.context.chat.length),
        isChatStale: () => false, synchronizeCurrentSources: async () => {},
        guard: { isRunning: () => running, acquire: () => {
            if (running) return null;
            running = true;
            return () => { running = false; };
        } },
        postToFrame: message => messages.push(message), cancelPendingHide: noop,
        reportUnconfirmedMemory: noop, reportMemorySaveFailure: error => errors.push(error),
        formatErrorDetails: error => error.message, xbLog: { error: (_module, _text, error) => errors.push(error) }, MODULE_ID: 'summary',
        runSummaryGeneration: async () => { requests++; return { committed: false }; },
    });
    const request = ui.handleFrameMessage({ data: { type: 'REQUEST_GENERATE' } });
    await nextTurn();
    const registeredWhileSaving = running;
    const requestsWhileSaving = requests;
    if (cancel) await ui.handleFrameMessage({ data: { type: 'REQUEST_CANCEL' } });
    await nextTurn();
    const runningAfterCancel = running;
    const saveStateAfterCancel = mod.getMemoryCommitState();
    finishSave();
    await saving;
    await request;
    await nextTurn();
    assert.equal(registeredWhileSaving, true);
    assert.equal(requestsWhileSaving, 0);
    assert.equal(runningAfterCancel, !cancel);
    assert.equal(saveStateAfterCancel, 'saving');
    assert.equal(requests, cancel ? 0 : 1);
    assert.equal(running, false);
    assert.equal(messages.some(message => message.type === 'SUMMARY_ERROR'), false);
    assert.deepEqual(errors, []);
    assert.deepEqual(disk(), next); // Stopping summary does not cancel the separate edit's save.
});

test('in-flight saves publish no draft receipt and reject another writer without overwriting it', async () => {
    await importFixture(); await seedAnchors();
    const before = mod.readPublishedSummaryMemory();
    let finish;
    host.afterSave = () => new Promise(resolve => { finish = resolve; });
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = 'pending';
    next.stateAtoms = [];
    const saving = mod.commitSummaryMemory(host.context.chatId, next);
    while (!finish) await Promise.resolve();
    let resumed = false;
    const waiting = mod.waitForMemoryCommit().then(() => { resumed = true; });
    const controller = new AbortController();
    const cancelled = mod.waitForMemoryCommit(controller.signal);
    controller.abort();
    await assert.rejects(cancelled, { name: 'AbortError' });
    await Promise.resolve();
    assert.equal(resumed, false);
    assert.equal(mod.getMemoryCommitState(), 'saving');
    assert.notEqual(mod.readPublishedSummaryMemory().storySummary.json.facts[0].o, 'pending');
    assert.deepEqual(mod.getPublishedSummaryStore(), before.storySummary);
    assert.deepEqual(mod.getPublishedStateAtoms(), before.stateAtoms);
    assert.deepEqual(mod.getFacts(), before.storySummary.json.facts.filter(fact => !fact.retracted));
    await assert.rejects(mod.commitSummaryMemory(host.context.chatId, mod.readSummaryMemory()), { code: 'metadata_saving' });
    finish(); await saving;
    await waiting;
    assert.equal(resumed, true);
    assert.equal(mod.readPublishedSummaryMemory().storySummary.json.facts[0].o, 'pending');
    assert.deepEqual(mod.getPublishedStateAtoms(), []);
});

for (const mode of ['save', 'old']) test(`recall started before a ${mode} commit never follows its unpublished draft`, async () => {
    host.fixture.json.arcs = [{ name: '夏实', trajectory: '仍在学习信任旅人', moments: [] }];
    await importFixture();
    const publishedArc = structuredClone(mod.getPublishedSummaryStore().json.arcs[0]);
    const draftArc = { ...publishedArc, trajectory: '已经决定独自离开' };
    host.vectorConfig.enabled = true;
    let enterRecall, finishRecall, finishSave;
    const started = new Promise(resolve => { enterRecall = resolve; });
    const recalled = new Promise(resolve => { finishRecall = resolve; });
    host.recall = async events => {
        enterRecall();
        await recalled;
        return { events: [{ event: events[0], similarity: 1, _recallType: 'DIRECT' }], focusCharacters: [publishedArc.name] };
    };
    const borrowed = mod.getPublishedSummaryStore();
    const boundary = borrowed.lastSummarizedMesId;
    const prompt = mod.buildVectorPromptText();
    await started;
    host.mode = mode;
    host.afterSave = () => new Promise(resolve => { finishSave = resolve; });
    const next = mod.readSummaryMemory();
    next.storySummary.json.arcs = [draftArc];
    next.storySummary.lastSummarizedMesId = boundary + 1;
    const saving = mod.commitSummaryMemory(host.context.chatId, next).then(() => null, error => error);
    while (!finishSave) await Promise.resolve();
    finishRecall();
    const result = await prompt;
    const assemblyState = mod.getMemoryCommitState();
    const borrowedBoundary = borrowed.lastSummarizedMesId;
    finishSave();
    const error = await saving;
    assert.equal(assemblyState, 'saving');
    // The assertions identify injected fixture data, not prompt wording.
    assert.ok(result.text.includes(publishedArc.trajectory));
    assert.equal(result.text.includes(draftArc.trajectory), false);
    assert.equal(borrowedBoundary, boundary);
    assert.equal(error?.code ?? null, mode === 'old' ? 'metadata_not_saved' : null);
    assert.equal(mod.getMemoryCommitState(), 'ready');
    assert.deepEqual(borrowed.json.arcs, [publishedArc]);
    assert.deepEqual(mod.getPublishedSummaryStore().json.arcs, [mode === 'save' ? draftArc : publishedArc]);
});

test('failed save confirmed old restores the entire previous snapshot in one place', async () => {
    await importFixture(); await seedAnchors();
    const before = structuredClone(ext());
    host.mode = 'old';
    const next = mod.prepareImportedSummary(mod.readSummaryMemory(), { events: [], facts: [] }, 23);
    await assert.rejects(mod.commitSummaryMemory(host.context.chatId, next), { code: 'metadata_not_saved', uncertain: false });
    assert.deepEqual(ext(), before);
    assert.deepEqual(disk(), before);
    assert.equal(mod.getMemoryCommitState(), 'ready');
});

for (const mode of ['read_fail', 'different']) {
    test(`${mode}: ambiguous import never restores old memory, gates every write, and reload is read-only recovery`, async () => {
        await importFixture(); await seedAnchors();
        const before = mod.readPublishedSummaryMemory();
        host.mode = mode;
        if (mode === 'different') host.afterSave = () => { disk().storySummary.json.facts[0].o = 'external disk edit'; };
        const next = mod.prepareImportedSummary(mod.readSummaryMemory(), host.fixture.json, 23);
        next.storySummary.json.facts[0].o = 'new import';
        const reads = host.reads;
        await assert.rejects(mod.commitSummaryMemory(host.context.chatId, next), { uncertain: true });
        assert.equal(ext().storySummary.json.facts[0].o, 'new import');
        assert.equal(ext().stateAtoms.length, 0);
        assert.equal(mod.getMemoryCommitState(), 'unconfirmed');
        assert.deepEqual(mod.getPublishedSummaryStore(), before.storySummary);
        assert.deepEqual(mod.getPublishedStateAtoms(), before.stateAtoms);
        assert.deepEqual(mod.getFacts(), before.storySummary.json.facts.filter(fact => !fact.retracted));
        if (mode === 'read_fail') await assert.rejects(mod.waitForMemoryCommit(), { code: 'metadata_save_unconfirmed' });
        else await mod.waitForMemoryCommit();
        assert.throws(() => mod.assertMemoryWritable(), { uncertain: true });
        assert.equal(ext().storySummary.summaryInvalid, undefined);
        assert.equal(mod.isSummaryConsumable(ext().storySummary, 24), false);
        assert.equal(host.reads - reads, mode === 'read_fail' ? 6 : 1);
        const writes = host.writes;
        await assert.rejects(mod.clearSummaryData(host.context.chatId), { uncertain: true });
        await assert.rejects(mod.invalidateSummaryAnchors(host.context.chatId), { uncertain: true });
        assert.throws(() => mod.createAnchorExtractionDraft(host.context.chatId, host.context.chat), { uncertain: true });
        assert.equal(host.writes, writes);
        host.metadata = structuredClone(host.files.get(host.context.chatId)); mod.reload(); mod.getSummaryStore();
        assert.equal(mod.getMemoryCommitState(), 'ready');
        assert.equal(host.writes, writes);
    });
}

test('thrown save with confirmed new disk is success, not a false rollback', async () => {
    await importFixture(); host.mode = 'throw_after';
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = 'confirmed';
    await mod.commitSummaryMemory(host.context.chatId, next);
    assert.deepEqual(disk(), ext());
    assert.equal(mod.getMemoryCommitState(), 'ready');
});

test('concurrent manual mutation during a failed save is preserved and quarantined, never restored over', async () => {
    await importFixture(); host.mode = 'old';
    host.afterSave = () => { ext().storySummary.json.facts[1].o = 'later manual edit'; };
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = 'staged';
    await assert.rejects(mod.commitSummaryMemory(host.context.chatId, next), { uncertain: true });
    assert.equal(ext().storySummary.json.facts[1].o, 'later manual edit');
    assert.equal(mod.getMemoryCommitState(), 'unconfirmed');
});

test('draft validation and vector failure leave canonical memory unchanged and release the write gate', async () => {
    await importFixture();
    const before = structuredClone(ext());
    const writes = host.writes;
    await assert.rejects(mod.commitSummaryMemory(host.context.chatId, mod.readSummaryMemory(), {
        invalidate: async () => { throw new Error('cache unavailable'); },
    }));
    assert.deepEqual(ext(), before);
    assert.equal(host.writes, writes);
    assert.equal(mod.getMemoryCommitState(), 'ready');
});

test('L0 results remain draft-only, merge with newer summary, but cannot overwrite an edited source', async () => {
    await importFixture();
    const extraction = mod.createAnchorExtractionDraft(host.context.chatId, host.context.chat);
    extraction.addAtoms(host.fixture.atoms.slice(0, 1)); extraction.setStatus(1, { status: 'ok', atoms: 1 });
    assert.equal(ext().stateAtoms.length, 0);
    await maintain([fixFact]);
    await extraction.commit();
    assert.equal(ext().storySummary.json.facts[0].o, fixFact.patch.o);
    const stale = mod.createAnchorExtractionDraft(host.context.chatId, host.context.chat);
    stale.setStatus(3, { status: 'empty', atoms: 0 });
    host.context.chat[2].mes = 'changed USER';
    await assert.rejects(stale.commit(), { code: 'metadata_draft_conflict' });
    assert.equal(ext().l0Index.byFloor[3], undefined);
});

test('a chat switch during confirmation never restores or installs into the newly opened chat', async () => {
    await importFixture();
    const old = host.metadata;
    host.afterSave = () => {
        host.metadata = { extensions: { LittleWhiteBox: { storySummary: { json: { facts: ['other chat'] } } } } };
        host.context = { ...host.context, chatId: 'other' }; mod.reload();
    };
    const next = mod.readSummaryMemory(); next.storySummary.json.facts[0].o = 'first chat';
    await mod.commitSummaryMemory(host.context.chatId, next);
    assert.equal(old.extensions.LittleWhiteBox.storySummary.json.facts[0].o, 'first chat');
    assert.deepEqual(ext().storySummary.json.facts, ['other chat']);
    assert.equal(mod.getMemoryCommitState(), 'ready');
});
