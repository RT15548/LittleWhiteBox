/* global Buffer */
import assert from 'node:assert/strict';
import { beforeEach, after, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';
import { zipSync, unzipSync, strFromU8, strToU8 } from '../../../libs/fflate.mjs';

// Protect the import/export boundary: real ZIP codecs, Dexie transactions,
// chunk projection and embedding-input digests. Only host/network/UI boundaries
// are replaced; assertions concern persisted data, not source-code spelling.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = JSON.parse(await readFile(new URL('./fixtures/vector-package-v2.json', import.meta.url), 'utf8'));
const host = globalThis.__vectorPackageTest = { metadata: {}, context: {}, filters: [], config: {} };
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__vectorPackageTest.context; export const saveMetadataDebounced=()=>{globalThis.__vectorPackageTest.metadataWrites++;};',
    'script.js': 'export const chat_metadata=globalThis.__vectorPackageTest.metadata; export const isChatSaving=false; export const getRequestHeaders=()=>({});',
    // Older supported hosts do not export SHA-256; digesting belongs to the plugin.
    'lib.js': 'export {};',
    'debug-core.js': 'export const xbLog={isEnabled:()=>globalThis.__vectorPackageTest.monitoring,info:(...args)=>globalThis.__vectorPackageTest.logs.push(args),warn:(...args)=>globalThis.__vectorPackageTest.logs.push(args),error(){},debug(){}};',
    'config.js': 'export const getVectorConfig=()=>globalThis.__vectorPackageTest.config; export const getTextFilterRules=()=>globalThis.__vectorPackageTest.filters;',
    'runtime.js': 'export const refreshRecallRuntime=async()=>{globalThis.__vectorPackageTest.runtimeInvalidations++;}; export const applyRecallRuntimeMutationBestEffort=()=>{globalThis.__vectorPackageTest.runtimeMutations++;}; export const clearRecallRuntime=async()=>{};',
    'lexical-index.js': 'export const invalidateLexicalIndex=()=>{globalThis.__vectorPackageTest.lexicalInvalidations++;};',
    'siliconflow.js': 'export const embed=async(texts)=>{const host=globalThis.__vectorPackageTest; host.embeddingInputs.push(...texts); host.onEmbed?.(texts); if(host.embeddingError) throw host.embeddingError; return texts.map(()=>[1,0]);};',
    'llm-service.js': 'export const callLLM=async()=>{throw new Error("unexpected LLM call");};',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/vector/storage/package/service.js';",
        "export * from './modules/story-summary/vector/storage/package/codec.js';",
        "export * from './modules/story-summary/vector/storage/package/sources.js';",
        "export * from './modules/story-summary/vector/utils/vector-input-digest.js';",
        "export * from './modules/story-summary/vector/integrity-policy.js';",
        "export * as coordinator from './modules/story-summary/vector/runtime/maintenance-coordinator.js';",
        "export * as io from './modules/story-summary/vector/storage/vector-io.js';",
        "export * as store from './modules/story-summary/vector/storage/chunk-store.js';",
        "export * as stateStore from './modules/story-summary/vector/storage/state-store.js';",
        "export * as pipeline from './modules/story-summary/vector/pipeline/state-integration.js';",
        "export * as chunkPipeline from './modules/story-summary/vector/pipeline/chunk-builder.js';",
        "export * from './modules/story-summary/vector/pipeline/chunk-maintenance.js';",
        "export * from './modules/story-summary/vector/pipeline/chunk-repair.js';",
        "export * from './modules/story-summary/vector/pipeline/event-vector-input.js';",
        "export { db } from './modules/story-summary/data/db.js';",
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
// eslint-disable-next-line no-unsanitized/method -- Local test bundle, no external code.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const { db } = mod;
after(() => db.close());

beforeEach(async () => {
    for (const table of db.tables) await table.clear();
    Object.assign(host, { filters: [], config: { enabled: true }, monitoring: true, logs: [], metadataWrites: 0, runtimeInvalidations: 0, runtimeMutations: 0, lexicalInvalidations: 0, embeddingInputs: [], embeddingError: null, onEmbed: null });
    host.context = { chatId: fixture.chatId, chat: structuredClone(fixture.chat) };
    for (const key of Object.keys(host.metadata)) delete host.metadata[key];
    host.metadata.extensions = { LittleWhiteBox: {
        stateAtoms: structuredClone(fixture.atoms),
        l0Index: { version: 1, byFloor: { 0: { status: 'ok', atoms: 1, updatedAt: 1 }, 9: { status: 'empty' } } },
        storySummary: { json: { events: structuredClone(fixture.events) } },
    } };
    globalThis.fetch = async () => assert.fail('unexpected external fetch');
});

function memory() { return host.metadata.extensions.LittleWhiteBox; }
function sourceIndex() { return mod.buildSourceIndex({ chat: host.context.chat, atoms: memory().stateAtoms, events: memory().storySummary.json.events }); }
async function seedCache() {
    const source = sourceIndex();
    const chunks = [...source.chunks.values()].map(row => row.chunk);
    await mod.store.saveChunks(fixture.chatId, chunks);
    await mod.store.saveChunkVectors(fixture.chatId, chunks.map(chunk => ({ chunkId: chunk.chunkId, vector: [1, 0], sourceHash: source.chunks.get(chunk.chunkId).sourceHash })), fixture.fingerprint);
    await mod.stateStore.saveStateVectors(fixture.chatId, [...source.states.values()].map(row => ({ atomId: row.id, floor: row.floor, vector: [1, 0], rVector: [0, 1], sourceHash: row.sourceHash, relationHash: row.relationHash })), fixture.fingerprint);
    await mod.store.saveEventVectors(fixture.chatId, [...source.events.values()].map(row => ({ eventId: row.id, vector: [0.5, 0.5], sourceHash: row.sourceHash })), fixture.fingerprint);
    await mod.store.updateMeta(fixture.chatId, { fingerprint: fixture.fingerprint, lastChunkFloor: host.context.chat.length - 1 });
}
async function cacheSnapshot() { return Promise.all(db.tables.map(table => table.toArray())); }
function automaticReceipts() { return host.logs.flat().filter(value => value?.action === 'automatic'); }
async function createBytes() { await seedCache(); return (await mod.createVectorPackage()).bytes; }

function maintainL1(options = {}) {
    return mod.maintainChunks({ targetChatId: fixture.chatId, chatSnapshot: host.context.chat, vectorConfig: host.config, ...options });
}

// Exact saved inputs, independent of later chat/cleaning changes. Tests use
// real digests and storage, not source-code or wording assertions.
async function seedStoredChunkInputs(floor, texts) {
    const meta = await mod.store.getMeta(fixture.chatId);
    await mod.store.deleteChunksAtFloor(fixture.chatId, floor);
    const chunks = texts.map((text, chunkIdx) => ({
        chunkId: mod.store.makeChunkId(floor, chunkIdx), floor, chunkIdx,
        speaker: '角色', isUser: false, text, textHash: mod.store.hashText(text),
    }));
    await mod.store.saveChunks(fixture.chatId, chunks);
    await mod.store.saveChunkVectors(fixture.chatId, chunks.map(chunk => ({
        chunkId: chunk.chunkId, vector: [0, 1], sourceHash: mod.inputDigest('chunk', chunk.text),
    })), fixture.fingerprint);
    await db.meta.put(meta);
}

for (const prose of ['First.\n\nSecond.', 'First  word\t next.', 'First.\r\n\r\nSecond.']) {
    test(`existing unmarked L1 inputs preserve whitespace through export and restore: ${JSON.stringify(prose)}`, async () => {
        host.context.chat[0].mes = prose;
        await seedCache();
        // Seed the actual pre-projection input, not the current cleaner output.
        await seedStoredChunkInputs(0, [prose]);
        const sourceHash = mod.inputDigest('chunk', prose);
        const { bytes } = await mod.createVectorPackage();
        await db.chunks.clear();
        await db.chunkVectors.clear();
        await mod.restoreVectorPackage(bytes);
        assert.equal((await mod.store.getAllChunks(fixture.chatId))[0].text, prose);
        assert.equal((await db.chunkVectors.toArray())[0].sourceHash, sourceHash);
        assert.deepEqual(host.embeddingInputs, []);
    });
}

test('new functional markers and voice emotion changes do not invalidate current vectors', async () => {
    host.context.chat[0].mes = '她走进屋内。\n[voice:happy:你好]';
    await seedCache();
    const before = await cacheSnapshot();
    for (const marker of ['[image:slot-1]', '[img:rain]', '[图片:雨]', '[dice:check_1]', '[tts:emotion=happy]']) {
        host.context.chat[0].mes = `她走进屋内。\n${marker}\n\n[语音:sad:你好]`;
        assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
        assert.equal((await maintainL1()).repaired, 0);
        await assert.rejects(mod.createVectorPackage(), error => error.code === 'incomplete_cache');
    }
    assert.deepEqual(host.embeddingInputs, []);
    assert.deepEqual(await cacheSnapshot(), before);
});

for (const input of ['她走进屋内。[image:slot-1]', '她走进屋内。[img:rain]', '她走进屋内。[图片:雨]', '她走进屋内。[dice:check_1]', '[voice:happy:她走进屋内。]', '她走进屋内。\n\n']) {
    test(`saved inputs remain paired without silent projection rebuilds: ${input}`, async () => {
        host.context.chat[0].mes = '她走进屋内。';
        host.context.chat.push({ mes: 'Another healthy floor.' });
        await seedCache();
        await seedStoredChunkInputs(0, [input]);
        const before = await cacheSnapshot();
        const metadata = structuredClone(host.metadata);
        const check = await mod.checkVectorCacheConsistency();
        assert.equal(check.status, 'consistent');
        assert.deepEqual(check.missingChunkFloors, []);
        assert.equal((await maintainL1()).success, true);
        assert.deepEqual(host.embeddingInputs, []);
        assert.deepEqual(await cacheSnapshot(), before);
        assert.deepEqual(host.metadata, metadata);
        assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
        // ZIP v3 has no saved text; its separate current-source guard remains.
        await assert.rejects(mod.createVectorPackage(), error => error.code === 'incomplete_cache');
        assert.equal((await maintainL1()).repaired, 0);
        assert.equal(host.embeddingInputs.length, 0);
    });
}

test('later cleaning changes never remove healthy saved chunks, including split markers', async () => {
    host.context.chat[0].mes = '她走进屋内。';
    await seedCache();
    await seedStoredChunkInputs(0, ['她走进屋内。[img:ra', 'in, ho', 'use]']);
    const before = await cacheSnapshot();
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
    assert.equal((await maintainL1()).success, true);
    assert.deepEqual(host.embeddingInputs, []);
    assert.deepEqual(await cacheSnapshot(), before);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
});

test('a now-empty projected floor retains its saved material and vector', async () => {
    host.context.chat[0].mes = '[image:slot-1]';
    await seedCache();
    await seedStoredChunkInputs(0, ['[image:slot-1]']);
    const before = await cacheSnapshot();
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
    const result = await maintainL1();
    assert.equal(result.success, true);
    assert.equal(result.repaired, 0);
    assert.deepEqual(await cacheSnapshot(), before);
    assert.deepEqual(host.embeddingInputs, []);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
});

test('unrecognized additions cannot manufacture gaps even when current prose splits into extra chunks', async () => {
    host.context.chat[0].mes = '她走进屋内';
    await seedCache();
    const before = await cacheSnapshot();
    host.context.chat[0].mes += '[inventory:sword]'.repeat(500);
    assert.ok(sourceIndex().chunks.size > 1);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
    assert.equal((await maintainL1()).repaired, 0);
    assert.deepEqual(host.embeddingInputs, []);
    assert.deepEqual(await cacheSnapshot(), before);
    await assert.rejects(mod.createVectorPackage(), error => error.code === 'incomplete_cache');
});

test('an orphan vector identifies a missing material without treating added chunks as gaps', async () => {
    host.context.chat[0].mes = '她走进屋内，然后关上门。'.repeat(100);
    await seedCache();
    const source = sourceIndex();
    const missing = source.chunks.get('c-0-1').chunk;
    assert.ok(source.chunks.size > 2);
    await db.chunks.delete([fixture.chatId, missing.chunkId]);
    const healthy = await db.chunkVectors.get([fixture.chatId, 'c-0-0']);
    host.context.chat[0].mes += '[inventory:sword]'.repeat(500);
    assert.ok(sourceIndex().chunks.size > source.chunks.size);
    const check = await mod.checkVectorCacheConsistency();
    assert.equal(check.status, 'incomplete');
    assert.deepEqual(check.missingChunkFloors, [0]);
    assert.equal((await maintainL1()).repaired, 1);
    assert.deepEqual(host.embeddingInputs, [missing.text]);
    assert.equal(await db.chunks.count(), source.chunks.size);
    assert.deepEqual(await db.chunkVectors.get([fixture.chatId, 'c-0-0']), healthy);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
});

for (const change of ['edit', 'swipe', 'delete']) {
    test(`explicit ${change} invalidation still updates L1 instead of preserving invalidated inputs`, async () => {
        host.context.chat.push({ mes: 'Old ending.' });
        await seedCache();
        const healthy = await db.chunkVectors.get([fixture.chatId, 'c-0-0']);
        if (change === 'delete') host.context.chat.pop();
        else host.context.chat[1].mes = 'New ending. [image:slot-1]';
        if (change === 'swipe') await mod.chunkPipeline.syncOnMessageSwiped(fixture.chatId, 1);
        else await mod.chunkPipeline.syncOnMessageDeleted(fixture.chatId, 1);
        assert.equal((await maintainL1()).success, true);
        assert.deepEqual(host.embeddingInputs, change === 'delete' ? [] : ['New ending.']);
        assert.equal(await db.chunks.count(), host.context.chat.length);
        assert.deepEqual(await db.chunkVectors.get([fixture.chatId, 'c-0-0']), healthy);
        assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
    });
}

for (const currentText of ['她走进屋内。[inventory:sword]'.repeat(100), '[image:slot-1]']) {
    test(`missing vectors use saved text even when live prose changes: ${currentText.slice(0, 30)}`, async () => {
        const original = '她走进屋内。[image:slot-1]';
        await seedCache();
        await seedStoredChunkInputs(0, [original]);
        await db.chunkVectors.clear();
        host.context.chat[0].mes = currentText;
        const check = await mod.checkVectorCacheConsistency();
        assert.equal(check.status, 'incomplete');
        assert.deepEqual(check.missingChunkFloors, [0]);
        assert.equal((await maintainL1()).success, true);
        assert.deepEqual(host.embeddingInputs, [original]);
        assert.equal((await db.chunks.get([fixture.chatId, 'c-0-0'])).text, original);
        assert.equal((await db.chunkVectors.get([fixture.chatId, 'c-0-0'])).sourceHash, mod.inputDigest('chunk', original));
        assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
        assert.equal((await maintainL1()).repaired, 0);
    });
}

test('daily checks distinguish absent proof from contradicted or mixed vector inputs', async () => {
    host.context.chat[0].mes = 'red door';
    await seedCache();
    await seedStoredChunkInputs(0, ['red door[image:slot-1]']);
    await db.chunkVectors.toCollection().modify(row => { delete row.sourceHash; });
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
    await seedStoredChunkInputs(0, ['red door[image:slot-1]']);
    await db.stateVectors.toCollection().modify(row => { row.fingerprint = 'another-model'; });
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'inconsistent');
    assert.deepEqual(host.embeddingInputs, []);
});

for (const missing of ['vector', 'material', 'both']) {
    test(`automatic L1 maintenance repairs a ${missing} gap behind a complete watermark without rebuying healthy vectors`, async () => {
        host.context.chat.push({ mes: 'Middle floor.' }, { mes: 'Healthy later floor.' });
        await seedCache();
        if (missing !== 'material') await db.chunkVectors.delete([fixture.chatId, 'c-1-0']);
        if (missing !== 'vector') await db.chunks.delete([fixture.chatId, 'c-1-0']);
        const check = await mod.checkVectorCacheConsistency();
        assert.equal(check.status, 'incomplete');
        assert.deepEqual(check.missingChunkFloors, [1]);
        assert.deepEqual(mod.buildVectorIntegrityIssues({
            cacheInconsistent: check.status === 'inconsistent', chunkFloorGap: check.missingChunkFloors.length,
        }), []);
        const healthy = await db.chunkVectors.get([fixture.chatId, 'c-2-0']);
        const result = await maintainL1();
        assert.equal(result.success, true);
        assert.equal(result.repaired, 1);
        assert.deepEqual(host.embeddingInputs, ['Middle floor.']);
        assert.deepEqual(await db.chunkVectors.get([fixture.chatId, 'c-2-0']), healthy);
        assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
        const after = await cacheSnapshot();
        const again = await maintainL1();
        assert.equal(again.repaired, 0);
        assert.deepEqual(host.embeddingInputs, ['Middle floor.']);
        assert.deepEqual(await cacheSnapshot(), after);
    });
}

test('automatic L1 maintenance handles new floors and old holes in the same round', async () => {
    await seedCache();
    await db.chunkVectors.clear();
    host.context.chat.push({ mes: 'New reply.' });
    const result = await maintainL1();
    assert.equal(result.success, true);
    assert.equal(result.built, 1);
    assert.equal(result.repaired, 1);
    assert.deepEqual(host.embeddingInputs, ['New reply.', fixture.chat[0].mes]);
    assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, 1);
});

test('a lagging L1 watermark never causes complete restored vectors to be requested again', async () => {
    host.context.chat.push({ mes: 'Missing middle.' }, { mes: 'Already restored.' });
    await seedCache();
    await db.chunkVectors.delete([fixture.chatId, 'c-1-0']);
    await mod.store.updateMeta(fixture.chatId, { lastChunkFloor: -1 });
    const healthy = await db.chunkVectors.get([fixture.chatId, 'c-2-0']);
    const result = await maintainL1();
    assert.equal(result.success, true);
    assert.equal(result.repaired, 1);
    assert.deepEqual(host.embeddingInputs, ['Missing middle.']);
    assert.deepEqual(await db.chunkVectors.get([fixture.chatId, 'c-2-0']), healthy);
    assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, 2);
});

test('a long absent floor retains all 28 materials when the second repair batch fails', async () => {
    host.context.chat = [{ mes: '甲乙丙丁。'.repeat(1100) }];
    let requests = 0;
    host.onEmbed = () => {
        if (++requests === 2) host.embeddingError = Object.assign(new Error(), { embeddingFailure: { kind: 'http', status: 429 } });
    };
    const repair = () => mod.repairMissingChunks({ chatId: fixture.chatId, chat: host.context.chat, vectorConfig: host.config });
    const first = await repair();
    assert.equal(first.success, false);
    assert.equal(first.repaired, 20);
    assert.equal(await db.chunks.count(), 28);
    assert.equal(await db.chunkVectors.count(), 20);
    assert.equal((await mod.store.getMeta(fixture.chatId)).lastChunkFloor, -1);
    const saved = await db.chunkVectors.toArray();
    host.onEmbed = null;
    host.embeddingError = null;
    host.embeddingInputs = [];
    assert.equal((await repair()).repaired, 8);
    assert.equal(host.embeddingInputs.length, 8);
    assert.equal(await db.chunkVectors.count(), 28);
    for (const row of saved) assert.deepEqual(await db.chunkVectors.get([row.chatId, row.chunkId]), row);
    assert.equal((await mod.store.getMeta(fixture.chatId)).lastChunkFloor, 0);
});

for (const failure of ['request', 'cancel']) {
    test(`a partial L1 repair resumes only missing vectors after ${failure}`, async () => {
        host.context.chat = Array.from({ length: 25 }, (_, i) => ({ mes: `Floor ${i}.` }));
        await seedCache();
        await db.chunkVectors.clear();
        const controller = new AbortController();
        let requests = 0;
        host.onEmbed = () => {
            if (++requests !== 2) return;
            if (failure === 'cancel') controller.abort();
            else host.embeddingError = Object.assign(new Error(), { embeddingFailure: { kind: 'http', status: 401 } });
        };
        const result = await maintainL1({ signal: controller.signal });
        assert.equal(result.success, false);
        assert.equal(result.repaired, 20);
        assert.equal(await db.chunkVectors.count(), 20);
        const completed = await db.chunkVectors.toArray();
        const completedIds = new Set(completed.map(row => row.chunkId));
        const remainingTexts = [...sourceIndex().chunks.values()].filter(row => !completedIds.has(row.id)).map(row => row.chunk.text);
        host.onEmbed = null;
        host.embeddingError = null;
        host.embeddingInputs = [];
        const next = await maintainL1();
        assert.equal(next.success, true);
        assert.equal(next.repaired, 5);
        assert.deepEqual(host.embeddingInputs.sort(), remainingTexts.sort());
        for (const row of completed) assert.deepEqual(await db.chunkVectors.get([row.chatId, row.chunkId]), row);
    });
}

test('L2 gap checking uses event identities, not counts, and needs no decoded vectors or model call', async () => {
    await seedCache();
    const events = memory().storySummary.json.events;
    assert.deepEqual(mod.selectMissingEventVectorPairs(events, await mod.store.getEventVectorDescriptors(fixture.chatId), fixture.fingerprint), []);
    await db.eventVectors.clear();
    await mod.store.saveEventVectors(fixture.chatId, [{ eventId: 'unrelated-event', vector: [1, 0] }], fixture.fingerprint);
    const descriptors = await mod.store.getEventVectorDescriptors(fixture.chatId);
    assert.deepEqual(descriptors, [{ eventId: 'unrelated-event', fingerprint: fixture.fingerprint }]);
    assert.deepEqual(mod.selectMissingEventVectorPairs(events, descriptors, fixture.fingerprint).map(pair => pair.id), events.map(event => event.id));
    assert.equal(host.embeddingInputs.length, 0);
});

for (const [reason, mutate] of [
    ['missing_source_hash', () => db.chunkVectors.toCollection().modify(record => { delete record.sourceHash; })],
    ['l1_count_mismatch', () => db.chunks.clear()],
    ['l1_content_mismatch', () => db.chunks.toCollection().modify(record => { record.text += ' changed'; })],
    ['missing_relation_hash', () => db.stateVectors.toCollection().modify(record => { delete record.relationHash; })],
]) {
    test(`automatic local check detects ${reason} without export, upload or a model request`, async () => {
        await seedCache();
        await mutate();
        const before = await cacheSnapshot();
        const result = await mod.checkVectorCacheConsistency();
        const recoverable = reason === 'l1_count_mismatch';
        const absentProof = ['missing_source_hash', 'missing_relation_hash'].includes(reason);
        assert.equal(result.status, absentProof ? 'consistent' : recoverable ? 'incomplete' : 'inconsistent');
        if (recoverable) assert.deepEqual(result.missingChunkFloors, [0]);
        else if (reason === 'l1_content_mismatch') assert.equal(result.diagnostic.code, 'source_mismatch');
        else if (!absentProof) assert.equal(result.diagnostic.details.reason, reason);
        assert.equal(result.diagnostic.action, 'automatic');
        const issues = mod.buildVectorIntegrityIssues({ cacheInconsistent: result.status === 'inconsistent' });
        assert.deepEqual(issues.map(({ code, action }) => ({ code, action })), recoverable || absentProof ? [] : [{ code: 'cache_inconsistent', action: 'rebuild' }]);
        assert.deepEqual(await cacheSnapshot(), before);
        assert.equal(host.metadataWrites, 0);
        assert.equal(host.embeddingInputs.length, 0);
    });

    test(`cache rejection records ${reason}, counts, watermark and L0 failures without a write or upload`, async () => {
        await seedCache();
        memory().l0Index.byFloor[0] = { status: 'fail', attempts: 3 };
        await mutate();
        const before = await cacheSnapshot();
        await assert.rejects(mod.io.backupToServer(), error => {
            assert.equal(error.code, 'incomplete_cache');
            assert.equal(error.details.reason, reason);
            const receipt = error.cacheDiagnostic;
            assert.equal(receipt.l1Chunks, reason === 'l1_count_mismatch' ? 0 : 1);
            assert.equal(receipt.l1Vectors, 1);
            assert.equal(receipt.lastChunkFloor, 0);
            assert.equal(receipt.l0.pending, 0);
            assert.deepEqual(receipt.l0.failedFloors, [{ floor: 0, attempts: 3, terminal: true }]);
            assert.ok(host.logs.some(args => args.includes(receipt)));
            return true;
        });
        assert.deepEqual(await cacheSnapshot(), before);
        assert.equal(host.metadataWrites, 0);
        assert.equal(host.embeddingInputs.length, 0);
    });
}

test('a failed L0 extraction alone does not imply one of the four export cache faults', async () => {
    await seedCache();
    memory().l0Index.byFloor[0] = { status: 'fail', attempts: 3 };
    memory().stateAtoms = [];
    await db.stateVectors.clear();
    const receipt = await mod.recordVectorCacheDiagnostic('before-rebuild');
    assert.equal(receipt.code, 'valid');
    assert.equal(receipt.l0.terminalFail, 1);
    assert.equal(receipt.l0Vectors, 0);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
});

test('ordinary pending floors and a fresh empty cache are not treated as inconsistent stored vectors', async () => {
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'incomplete');
    await seedCache();
    for (let gap = 1; gap <= 5; gap++) {
        host.context.chat.push({ is_user: true, mes: `pending message ${gap}` });
        const result = await mod.checkVectorCacheConsistency();
        assert.equal(result.status, 'incomplete');
        assert.equal(result.missingChunkFloors.length, gap);
        const issues = mod.buildVectorIntegrityIssues({ cacheInconsistent: result.status === 'inconsistent', chunkFloorGap: result.missingChunkFloors.length });
        assert.deepEqual(issues.map(issue => issue.code), gap < 5 ? [] : ['l1_gap']);
    }
    assert.equal(host.embeddingInputs.length, 0);
    assert.equal(automaticReceipts().length, 0);
});

test('automatic checking waits for idle and never inspects a half-written cache', async () => {
    await seedCache();
    await db.chunks.clear();
    let finishWrite;
    const held = new Promise(resolve => { finishWrite = resolve; });
    const write = mod.coordinator.runVectorWriteTask({ chatId: fixture.chatId, scope: 'io' }, () => held);
    try {
        assert.deepEqual(await mod.checkVectorCacheConsistency(), { status: 'deferred' });
    } finally {
        finishWrite();
        await write;
    }
    assert.deepEqual(await mod.checkVectorCacheConsistency({ isCurrent: () => false }), { status: 'deferred' });
    assert.equal(automaticReceipts().length, 0);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'incomplete');
});

test('many missing L1 segments in one floor stay silent after a failed repair and recover on a later round', async () => {
    host.context.chat.push({ mes: '长句'.repeat(4000) }, { mes: 'Healthy last floor.' });
    await seedCache();
    const missing = [...sourceIndex().chunks.values()].filter(row => row.chunk.floor === 1);
    assert.ok(missing.length >= 5);
    await db.chunkVectors.bulkDelete(missing.map(row => [fixture.chatId, row.id]));
    host.embeddingError = Object.assign(new Error(), { embeddingFailure: { kind: 'http', status: 503 } });
    const failed = await maintainL1();
    assert.equal(failed.success, false);
    const check = await mod.checkVectorCacheConsistency();
    assert.equal(check.status, 'incomplete');
    assert.deepEqual(check.missingChunkFloors, [1]);
    assert.deepEqual(mod.buildVectorIntegrityIssues({
        cacheInconsistent: check.status === 'inconsistent', chunkFloorGap: check.missingChunkFloors.length,
    }), []);
    host.embeddingInputs = [];
    host.embeddingError = null;
    assert.equal((await maintainL1()).success, true);
    assert.deepEqual(host.embeddingInputs.sort(), missing.map(row => row.chunk.text).sort());
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
});

test('five actual incomplete L1 floors warn to fill after failure even with a complete watermark', async () => {
    host.context.chat.push(...Array.from({ length: 6 }, (_, i) => ({ mes: `Middle ${i}.` })));
    await seedCache();
    await db.chunkVectors.bulkDelete([1, 2, 3, 4, 5].map(floor => [fixture.chatId, `c-${floor}-0`]));
    host.embeddingError = Object.assign(new Error(), { embeddingFailure: { kind: 'http', status: 429 } });
    assert.equal((await maintainL1()).success, false);
    const check = await mod.checkVectorCacheConsistency();
    assert.equal(check.status, 'incomplete');
    assert.deepEqual(check.missingChunkFloors, [1, 2, 3, 4, 5]);
    assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, 6);
    assert.deepEqual(mod.buildVectorIntegrityIssues({
        cacheInconsistent: check.status === 'inconsistent', chunkFloorGap: check.missingChunkFloors.length,
    }).map(({ code, action }) => ({ code, action })), [{ code: 'l1_gap', action: 'fill' }]);
});

test('a vector without material is recoverable only if its input still matches the current source', async () => {
    await seedCache();
    await db.chunks.clear();
    host.context.chat[0].mes += ' changed';
    const check = await mod.checkVectorCacheConsistency();
    assert.equal(check.status, 'inconsistent');
    assert.equal(check.diagnostic.code, 'source_mismatch');
    assert.equal(host.embeddingInputs.length, 0);
});

for (const change of ['chat', 'source', 'generation', 'writer']) {
    test(`an automatic check discards its result when ${change} changes during storage reading`, async () => {
        await seedCache();
        await db.chunks.toCollection().modify(record => { record.text += ' stale'; });
        let current = true;
        const mutateDuringRead = record => {
            if (change === 'chat') host.context.chatId = 'other-chat';
            if (change === 'source') host.context.chat[0].mes += ' edited';
            if (change === 'generation') current = false;
            if (change === 'writer') mod.coordinator.invalidateMaintenanceEpoch();
            return record;
        };
        db.chunks.hook('reading', mutateDuringRead);
        try {
            assert.deepEqual(await mod.checkVectorCacheConsistency({ isCurrent: () => current }), { status: 'deferred' });
            assert.equal(automaticReceipts().length, 0);
        } finally {
            db.chunks.hook('reading').unsubscribe(mutateDuringRead);
        }
    });
}

test('a storage read failure propagates instead of prescribing a rebuild', async () => {
    await seedCache();
    const failure = new Error('storage unavailable');
    const failRead = () => { throw failure; };
    db.chunks.hook('reading', failRead);
    try {
        await assert.rejects(mod.checkVectorCacheConsistency(), error => error === failure);
        assert.equal(automaticReceipts().length, 0);
    } finally {
        db.chunks.hook('reading').unsubscribe(failRead);
    }
});

test('cache failure remains diagnosable in the console when monitoring is disabled', async t => {
    await seedCache();
    await db.chunks.clear();
    host.monitoring = false;
    const receipts = [];
    t.mock.method(console, 'warn', (...args) => receipts.push(args[1]));
    await assert.rejects(mod.createVectorPackage(), error => error.code === 'incomplete_cache');
    assert.equal(receipts.length, 1);
    assert.equal(receipts[0].details.reason, 'l1_count_mismatch');
});

test('before/after rebuild receipts expose the repaired cache fault without changing L0 extraction status', async () => {
    await seedCache();
    memory().l0Index.byFloor[0] = { status: 'fail', attempts: 3 };
    await db.chunks.toCollection().modify(record => { record.text += ' stale'; });
    const before = await mod.recordVectorCacheDiagnostic('before-rebuild');
    assert.equal(before.details.reason, 'l1_content_mismatch');
    await mod.chunkPipeline.buildAllChunks({ vectorConfig: host.config });
    const after = await mod.recordVectorCacheDiagnostic('after-rebuild');
    assert.equal(after.code, 'valid');
    assert.deepEqual(after.l0, before.l0);
    assert.equal(host.metadataWrites, 0);
    assert.equal((await mod.checkVectorCacheConsistency()).status, 'consistent');
});
function rewriteZip(bytes, change) {
    const files = unzipSync(bytes);
    const manifest = JSON.parse(strFromU8(files['manifest.json']));
    change(files, manifest);
    files['manifest.json'] = strToU8(JSON.stringify(manifest));
    return zipSync(files);
}

test('deleting a chat clears every local cache layer without touching another chat', async () => {
    await seedCache();
    const otherChat = [];
    for (const table of db.tables) {
        const rows = (await table.toArray()).map(row => ({ ...row, chatId: 'retained-chat' }));
        assert.ok(rows.length > 0);
        await table.bulkPut(rows);
        otherChat.push(rows);
    }
    await mod.store.clearChatData(fixture.chatId);
    assert.deepEqual(await cacheSnapshot(), otherChat);
    // Deleting an already absent chat is also safe.
    await mod.store.clearChatData(fixture.chatId);
    assert.deepEqual(await cacheSnapshot(), otherChat);
});

test('a local chat-cache deletion failure rolls back all cache layers', async () => {
    await seedCache();
    const before = await cacheSnapshot();
    const failure = new Error('storage deletion failed');
    const failDelete = () => { throw failure; };
    db.stateVectors.hook('deleting', failDelete);
    try {
        await assert.rejects(mod.store.clearChatData(fixture.chatId), error => error === failure);
    } finally {
        db.stateVectors.hook('deleting').unsubscribe(failDelete);
    }
    assert.deepEqual(await cacheSnapshot(), before);
});

test('current package contains only cache payloads and source digests, not chat/L0/L1 prose', async () => {
    const before = structuredClone(host.metadata);
    const bytes = await createBytes();
    const files = unzipSync(bytes);
    // Exact filenames/fields are the public ZIP protocol, not internal code layout.
    assert.deepEqual(Object.keys(files).sort(), ['chunks.bin', 'events.bin', 'manifest.json', 'relations.bin', 'states.bin']);
    const manifest = JSON.parse(strFromU8(files['manifest.json']));
    assert.equal(manifest.version, 3);
    assert.deepEqual(Object.keys(manifest.chunks[0]).sort(), ['floor', 'id', 'index', 'sourceHash']);
    assert.deepEqual(Object.keys(manifest.states[0]).sort(), ['floor', 'id', 'relationHash', 'sourceHash']);
    assert.deepEqual(Object.keys(manifest.events[0]).sort(), ['id', 'sourceHash']);
    assert.deepEqual(host.metadata, before);
    assert.equal(host.metadataWrites, 0);
});

for (const method of ['importVectors', 'restoreFromServer']) {
    test(`${method}: restores all cache layers, rebuilds L1, leaves metadata and other chats untouched`, async () => {
        const bytes = await createBytes();
        const before = structuredClone(host.metadata);
        for (const table of db.tables) await table.clear();
        await db.meta.put({ chatId: 'unrelated', fingerprint: 'keep' });
        globalThis.fetch = async () => new Response(bytes);
        const result = method === 'importVectors' ? await mod.io.importVectors(new Blob([bytes])) : await mod.io.restoreFromServer();
        assert.equal(result.chunkCount, 1);
        assert.equal(result.eventCount, 1);
        assert.equal(result.stateVectorCount, 1);
        assert.equal((await db.chunks.get([fixture.chatId, 'c-0-0'])).text, fixture.chat[0].mes);
        assert.deepEqual(Array.from((await mod.stateStore.getAllStateVectors(fixture.chatId))[0].rVector), [0, 1]);
        assert.equal((await db.meta.get('unrelated')).fingerprint, 'keep');
        assert.deepEqual(host.metadata, before);
        assert.equal(host.metadataWrites, 0);
        assert.equal(host.embeddingInputs.length, 0);
        assert.equal(host.runtimeInvalidations, 1);
        assert.equal(host.lexicalInvalidations, 1);
    });
}

for (const cacheKind of ['all-layers', 'l0-only']) {
    test(`local export and server backup serialize the same cache protocol: ${cacheKind}`, async () => {
        if (cacheKind === 'all-layers') await seedCache();
        else {
            // Normal maintenance continues L0 vectorization after L1 fails. It does
            // not create L1 metadata; these generated L0 vectors are still exportable.
            host.embeddingError = Object.assign(new Error(), { embeddingFailure: { kind: 'http', status: 401 } });
            const chunkResult = await mod.chunkPipeline.buildIncrementalChunks({ vectorConfig: host.config });
            assert.equal(chunkResult.code, 'embedding_http_failed');
            host.embeddingError = null;
            const stateResult = await mod.pipeline.vectorizeMissingStateAtoms(fixture.chatId, null, { vectorConfig: host.config });
            assert.equal(stateResult.success, true);
            assert.equal(await db.meta.get(fixture.chatId), undefined);
        }
        const before = await cacheSnapshot();
        host.config = cacheKind === 'l0-only' ? {} : { embeddingApi: { provider: 'custom', model: 'different-model' } };
        const configBefore = structuredClone(host.config);
        let downloaded;
        let uploaded;
        let manifest = [];
        const originalCreate = URL.createObjectURL;
        const originalRevoke = URL.revokeObjectURL;
        const originalDocument = globalThis.document;
        URL.createObjectURL = blob => { downloaded = blob; return 'blob:fixture'; };
        URL.revokeObjectURL = () => {};
        globalThis.document = { createElement: () => ({ click() {} }), body: { appendChild() {}, removeChild() {} } };
        globalThis.fetch = async (url, options) => {
            if (!options?.body) return new Response(JSON.stringify(manifest));
            const request = JSON.parse(options.body);
            if (request.name.endsWith('.zip')) uploaded = new Uint8Array(Buffer.from(request.data, 'base64'));
            else manifest = JSON.parse(Buffer.from(request.data, 'base64').toString('utf8'));
            return new Response(JSON.stringify({ path: `user/files/${request.name}` }));
        };
        try {
            await mod.io.exportVectors();
            await mod.io.backupToServer();
            assert.deepEqual(mod.decodePackage(new Uint8Array(await downloaded.arrayBuffer())), mod.decodePackage(uploaded));
            assert.equal(mod.decodePackage(uploaded).states.length, 1);
            assert.equal(mod.decodePackage(uploaded).fingerprint, fixture.fingerprint);
            assert.equal(manifest[0].chatId, fixture.chatId);
            assert.deepEqual(await cacheSnapshot(), before);
            assert.deepEqual(host.config, configBefore);
        } finally {
            URL.createObjectURL = originalCreate;
            URL.revokeObjectURL = originalRevoke;
            globalThis.document = originalDocument;
        }
    });
}

const otherBackup = { filename: 'LWB_VectorBackup_other.zip', serverPath: 'user/files/LWB_VectorBackup_other.zip',
    size: 100, chatId: 'other-chat', backupTime: '2026-09-01T00:00:00.000Z' };

for (const [failure, readFailure] of [
    ['network', () => { throw new TypeError('connection lost'); }],
    ['unauthorized', () => new Response(null, { status: 401 })],
    ['server', () => new Response(null, { status: 500 })],
    ['invalid-json', () => new Response('{')],
    ['non-array', () => Response.json({})],
    ['invalid-entry', () => Response.json([otherBackup, { filename: 'unexpected.zip' }])],
]) {
    for (const operation of ['backup', 'delete']) {
        test(`${operation}: ${failure} reading the backup manifest cannot overwrite existing entries`, async () => {
            if (operation === 'backup') await seedCache();
            const original = JSON.stringify([otherBackup]);
            let manifest = original;
            let manifestWrites = 0;
            let zipChanged = false;
            globalThis.fetch = async (url, options) => {
                if (!options?.body) return readFailure();
                const request = JSON.parse(options.body);
                if (url === '/api/files/delete' || request.name.endsWith('.zip')) zipChanged = true;
                else {
                    manifestWrites++;
                    manifest = Buffer.from(request.data, 'base64').toString('utf8');
                }
                return Response.json({ path: `user/files/${request.name}` });
            };
            // Listing must distinguish an unreadable manifest from an empty one.
            await assert.rejects(mod.io.fetchManifest(), error => error.code === 'backup_manifest_read_failed');
            if (operation === 'backup') {
                await assert.rejects(mod.io.backupToServer(), error =>
                    error.code === 'backup_manifest_failed' && error.cause.code === 'backup_manifest_read_failed');
            } else {
                await assert.rejects(mod.io.deleteServerBackup(mod.io.getBackupFilename(fixture.chatId)),
                    error => error.partial === true);
            }
            assert.equal(zipChanged, true);
            assert.equal(manifestWrites, 0);
            assert.equal(manifest, original);
        });
    }
}

for (const initial of ['missing', 'existing']) {
    test(`server backup updates a ${initial} manifest without losing other chats`, async () => {
        await seedCache();
        let manifest = initial === 'existing' ? [otherBackup] : null;
        globalThis.fetch = async (_url, options) => {
            if (!options?.body) return manifest === null ? new Response(null, { status: 404 }) : Response.json(manifest);
            const request = JSON.parse(options.body);
            if (!request.name.endsWith('.zip')) manifest = JSON.parse(Buffer.from(request.data, 'base64').toString('utf8'));
            return Response.json({ path: `user/files/${request.name}` });
        };
        if (initial === 'missing') assert.deepEqual(await mod.io.fetchManifest(), []);
        const result = await mod.io.backupToServer();
        const current = manifest.find(entry => entry.filename === result.filename);
        assert.equal(current.chatId, fixture.chatId);
        assert.equal(current.size, result.size);
        if (initial === 'existing') assert.deepEqual(manifest.find(entry => entry.filename === otherBackup.filename), otherBackup);
        assert.equal(manifest.length, initial === 'existing' ? 2 : 1);
    });
}

test('backup manifest verification read failure is reported without retrying a destructive empty rewrite', async () => {
    await seedCache();
    let manifest = [otherBackup];
    let reads = 0;
    let manifestWrites = 0;
    globalThis.fetch = async (_url, options) => {
        if (!options?.body) return ++reads === 1 ? Response.json(manifest) : new Response(null, { status: 500 });
        const request = JSON.parse(options.body);
        if (!request.name.endsWith('.zip')) {
            manifestWrites++;
            manifest = JSON.parse(Buffer.from(request.data, 'base64').toString('utf8'));
        }
        return Response.json({ path: `user/files/${request.name}` });
    };
    await assert.rejects(mod.io.backupToServer(), error => error.code === 'backup_manifest_failed');
    assert.equal(manifestWrites, 1);
    assert.equal(manifest.length, 2);
    assert.deepEqual(manifest[0], otherBackup);
});

test('export preserves a consistent source model independently of L1 metadata', async () => {
    await seedCache();
    for (const fingerprint of [null, 'stale-l1-model']) {
        await db.meta.update(fixture.chatId, { fingerprint });
        assert.equal(mod.decodePackage((await mod.createVectorPackage()).bytes).fingerprint, fixture.fingerprint);
    }
    await db.meta.delete(fixture.chatId);
    for (const [table, id] of [[db.chunkVectors, 'c-0-0'], [db.stateVectors, 'atom-0-0'], [db.eventVectors, 'e-1']]) {
        await table.update([fixture.chatId, id], { fingerprint: 'different-model' });
        await assert.rejects(mod.createVectorPackage(), error => error.code === 'invalid_package' && error.details.field === 'fingerprint');
        await table.update([fixture.chatId, id], { fingerprint: fixture.fingerprint });
    }
});

for (const failure of ['embedding', 'metadata-write', 'cancel', 'none']) {
    test(`restored L1 with a middle gap survives incremental ${failure}`, async () => {
        host.context.chat.push({ mes: 'Missing middle floor.' }, { mes: 'Restored later floor.' });
        const data = mod.decodePackage(await createBytes());
        data.chunks = data.chunks.filter(row => row.floor !== 1);
        data.chunks.find(row => row.floor === 2).vector = [0, 1];
        await mod.restoreVectorPackage(mod.encodePackage(data));
        assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, 0);
        const before = await cacheSnapshot();
        const metadata = structuredClone(host.metadata);
        const mutations = host.runtimeMutations;
        const controller = new AbortController();
        const injected = new Error();
        let reachedWrite = false;
        const hook = () => {
            reachedWrite = true;
            if (failure === 'metadata-write') throw injected;
            if (failure === 'cancel') controller.abort();
        };
        if (failure === 'embedding') host.embeddingError = Object.assign(injected, { embeddingFailure: { kind: 'http', status: 401 } });
        db.meta.hook('updating', hook);
        let result;
        try {
            result = await mod.chunkPipeline.buildIncrementalChunks({ vectorConfig: host.config, signal: controller.signal });
        } finally { db.meta.hook('updating').unsubscribe(hook); }
        assert.equal(reachedWrite, failure !== 'embedding');
        if (failure === 'none') {
            assert.equal(result.success, true);
            assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, 2);
            assert.deepEqual((await mod.store.getAllChunks(fixture.chatId)).map(row => row.floor).sort(), [0, 1, 2]);
            assert.equal((await mod.store.getAllChunkVectors(fixture.chatId)).length, 3);
            assert.equal(mod.decodePackage((await mod.createVectorPackage()).bytes).chunks.length, 3);
        } else {
            assert.equal(result.success, false);
            assert.equal(result.code, { embedding: 'embedding_http_failed', 'metadata-write': 'metadata_write_failed', cancel: 'vector_config_changed' }[failure]);
            if (failure === 'embedding') assert.equal(result.httpStatus, 401);
            if (failure === 'metadata-write') assert.equal(result.error, injected);
            if (failure === 'cancel') assert.equal(result.status, 'cancelled');
            assert.deepEqual(await cacheSnapshot(), before);
            assert.equal(host.runtimeMutations, mutations);
        }
        assert.deepEqual(host.metadata, metadata);
        assert.equal(host.metadataWrites, 0);
    });
}

for (const [name, change] of [
    ['L1 text', () => { host.context.chat[0].mes = 'A different scene.'; }],
    ['L0 text', () => { memory().stateAtoms[0].semantic = 'A different anchor.'; }],
    ['L0 relation', () => { memory().stateAtoms[0].edges[0].r = 'leaves'; }],
    ['event text', () => { memory().storySummary.json.events[0].summary = 'A different event.'; }],
    ['filter rules', () => { host.filters = [{ start: 'Alice', end: '' }]; }],
]) {
    test(`same IDs with changed ${name}: import AND re-export reject stale vectors`, async () => {
        const bytes = await createBytes();
        change();
        const metadata = structuredClone(host.metadata);
        const cache = await cacheSnapshot();
        await assert.rejects(mod.restoreVectorPackage(bytes), error => error.code === 'source_mismatch');
        await assert.rejects(mod.createVectorPackage(), error => ['source_mismatch', 'incomplete_cache'].includes(error.code));
        assert.deepEqual(await cacheSnapshot(), cache);
        assert.deepEqual(host.metadata, metadata);
    });
}

test('unknown input provenance cannot be fabricated at export', async () => {
    await seedCache();
    await db.stateVectors.update([fixture.chatId, 'atom-0-0'], { sourceHash: undefined });
    await assert.rejects(mod.createVectorPackage(), error => error.code === 'incomplete_cache');
});

for (const method of ['importVectors', 'restoreFromServer']) {
    for (const [name, config] of [['unconfigured', {}], ['different-model', { embeddingApi: { provider: 'custom', model: 'another-model' } }]]) {
        test(`${method}: restores with ${name} settings without changing configuration or source model`, async () => {
            const data = mod.decodePackage(await createBytes());
            data.fingerprint = 'custom:source-model:1024';
            const bytes = mod.encodePackage(data);
            host.config = structuredClone(config);
            globalThis.fetch = async () => new Response(bytes);
            const result = method === 'importVectors' ? await mod.io.importVectors(new Blob([bytes])) : await mod.io.restoreFromServer();
            assert.equal(result.stateVectorCount, data.states.length);
            for (const table of [db.meta, db.chunkVectors, db.stateVectors, db.eventVectors]) {
                assert.ok((await table.toArray()).every(row => row.fingerprint === data.fingerprint));
            }
            assert.equal(mod.decodePackage((await mod.createVectorPackage()).bytes).fingerprint, data.fingerprint);
            assert.deepEqual(host.config, config);
            assert.equal(host.embeddingInputs.length, 0);
            assert.equal(host.metadataWrites, 0);
        });
    }
}

test('changing only model settings during IO does not cancel or relabel the package', async () => {
    await seedCache();
    let generation = 0;
    const changeConfig = () => { host.config = { embeddingApi: { model: `model-${generation++}` } }; };
    const { bytes } = await mod.createVectorPackage(changeConfig);
    assert.equal(mod.decodePackage(bytes).fingerprint, fixture.fingerprint);
    let changedDuringWrite = false;
    const changeDuringWrite = () => { changedDuringWrite = true; changeConfig(); };
    db.stateVectors.hook('creating', changeDuringWrite);
    try { await mod.restoreVectorPackage(bytes); }
    finally { db.stateVectors.hook('creating').unsubscribe(changeDuringWrite); }
    assert.equal(changedDuringWrite, true);
    assert.equal((await db.meta.get(fixture.chatId)).fingerprint, fixture.fingerprint);
    assert.equal(host.embeddingInputs.length, 0);
});

for (const [name, corrupt] of [
    ['zero dimensions', (files, manifest) => { manifest.dims = 0; }],
    ['truncated binary', files => { files['states.bin'] = files['states.bin'].slice(1); }],
    ['non-finite component', files => { new DataView(files['chunks.bin'].buffer, files['chunks.bin'].byteOffset).setFloat32(0, NaN, true); }],
    ['duplicate source ID', (files, manifest) => { manifest.states.push(manifest.states[0]); }],
    ['unsupported version', (files, manifest) => { manifest.version = 100; }],
]) {
    test(`rejects ${name} without touching persisted data`, async () => {
        const bytes = rewriteZip(await createBytes(), corrupt);
        const cache = await cacheSnapshot();
        const metadata = structuredClone(host.metadata);
        await assert.rejects(mod.restoreVectorPackage(bytes), error => ['invalid_package', 'unsupported_version'].includes(error.code));
        assert.deepEqual(await cacheSnapshot(), cache);
        assert.deepEqual(host.metadata, metadata);
    });
}

for (const failure of ['storage', 'cancel', 'chat-switch', 'source-edit']) {
    test(`transaction rollback on ${failure} after earlier cache tables have been written`, async () => {
        const bytes = await createBytes();
        const cache = await cacheSnapshot();
        const metadata = structuredClone(host.metadata);
        const controller = new AbortController();
        const injected = new Error('injected storage failure');
        let reachedWrite = false;
        const hook = () => {
            reachedWrite = true;
            if (failure === 'storage') throw injected;
            if (failure === 'cancel') controller.abort();
            if (failure === 'chat-switch') host.context.chatId = 'other-chat';
            if (failure === 'source-edit') host.context.chat[0].mes = 'Changed during transaction.';
        };
        db.stateVectors.hook('creating', hook);
        const expectedCode = { cancel: 'cancelled', 'chat-switch': 'chat_changed', 'source-edit': 'source_changed' }[failure];
        try {
            await assert.rejects(mod.restoreVectorPackage(bytes, null, { signal: controller.signal }), error => failure === 'storage' ? error === injected : error.code === expectedCode);
        }
        finally { db.stateVectors.hook('creating').unsubscribe(hook); }
        assert.equal(reachedWrite, true);
        assert.deepEqual(await cacheSnapshot(), cache);
        assert.deepEqual(host.metadata, metadata);
        assert.equal(host.runtimeInvalidations, 0);
        assert.equal(host.lexicalInvalidations, 0);
    });
}

test('empty metadata is not initialized by import or export', async () => {
    const bytes = await createBytes();
    delete host.metadata.extensions;
    await assert.rejects(mod.restoreVectorPackage(bytes), error => error.code === 'source_mismatch');
    await assert.rejects(mod.createVectorPackage());
    assert.deepEqual(host.metadata, {});
    assert.equal(host.metadataWrites, 0);
});

test('a partial snapshot cannot mark absent L1 floors complete', async () => {
    host.context.chat.push({ mes: 'A new message.', is_user: false, name: 'Alice' });
    const data = mod.decodePackage(await createBytes());
    data.chunks = data.chunks.filter(row => row.floor === 0);
    await mod.restoreVectorPackage(mod.encodePackage(data));
    assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, 0);
});

test('an L0-only cache restores without inventing relation vectors or completed L1 floors', async () => {
    const data = mod.decodePackage(await createBytes());
    data.chunks = [];
    data.events = [];
    data.states[0].rVector = null;
    data.states[0].relationHash = null;
    const result = await mod.restoreVectorPackage(mod.encodePackage(data));
    assert.equal(result.stateVectorCount, 1);
    assert.equal(result.chunkCount, 0);
    assert.equal(result.eventCount, 0);
    assert.equal((await db.stateVectors.get([fixture.chatId, 'atom-0-0'])).rVector, null);
    assert.equal((await db.meta.get(fixture.chatId)).lastChunkFloor, -1);
});

for (const method of ['importVectors', 'restoreFromServer']) {
    test(`${method}: switching chat while reading the file cannot retarget the restore`, async () => {
        const bytes = await createBytes();
        const cache = await cacheSnapshot();
        const file = { arrayBuffer: async () => {
            host.context.chatId = 'other-chat';
            return bytes;
        } };
        globalThis.fetch = async () => ({ ok: true, ...file });
        await assert.rejects(method === 'importVectors' ? mod.io.importVectors(file) : mod.io.restoreFromServer(), error => error.code === 'chat_changed');
        assert.deepEqual(await cacheSnapshot(), cache);
        assert.equal(host.metadataWrites, 0);
    });
}

test('frozen upstream v2 package verifies L0/L1, drops unproven events with a semantic warning', async () => {
    const before = structuredClone(host.metadata);
    const result = await mod.restoreVectorPackage(new Uint8Array(Buffer.from(fixture.zipBase64, 'base64')));
    assert.equal(result.chunkCount, 1);
    assert.equal(result.stateVectorCount, 1);
    assert.equal(result.eventCount, 0);
    assert.deepEqual(result.warningCodes, ['legacy_events_omitted']);
    assert.equal((await db.stateVectors.get([fixture.chatId, 'atom-0-0'])).sourceHash, mod.inputDigest('state', fixture.atoms[0].semantic));
    assert.deepEqual(host.metadata, before);
    assert.equal(host.metadataWrites, 0);
    assert.equal(host.embeddingInputs.length, 0);
});

test('a legacy archive with only unverifiable events cannot clear the existing cache', async () => {
    await seedCache();
    const before = await cacheSnapshot();
    const bytes = rewriteZip(new Uint8Array(Buffer.from(fixture.zipBase64, 'base64')), (files, manifest) => {
        manifest.chunkCount = manifest.chunkVectorCount = manifest.stateAtomCount = manifest.stateVectorCount = manifest.stateRVectorCount = 0;
        for (const name of ['chunks.jsonl', 'chunk_vectors.bin', 'state_vectors.jsonl', 'state_vectors.bin', 'state_r_vectors.bin']) files[name] = new Uint8Array();
        files['state_atoms.json'] = strToU8('[]');
    });
    await assert.rejects(mod.restoreVectorPackage(bytes), error => error.code === 'legacy_unverifiable');
    assert.deepEqual(await cacheSnapshot(), before);
    assert.equal(host.metadataWrites, 0);
});

test('legacy text is only evidence: a changed current anchor is not overwritten from the old ZIP', async () => {
    memory().stateAtoms[0].semantic = 'Current authoritative anchor.';
    const before = structuredClone(host.metadata);
    await assert.rejects(mod.restoreVectorPackage(new Uint8Array(Buffer.from(fixture.zipBase64, 'base64'))), error => error.code === 'source_mismatch');
    assert.deepEqual(host.metadata, before);
});

test('generation records the actual L0 and L1 embedding inputs for subsequent export', async () => {
    const chunkResult = await mod.chunkPipeline.buildIncrementalChunks({ vectorConfig: host.config });
    const stateResult = await mod.pipeline.vectorizeMissingStateAtoms(fixture.chatId, null, { vectorConfig: host.config });
    assert.equal(chunkResult.success, true);
    assert.equal(stateResult.success, true);
    const data = mod.decodePackage((await mod.createVectorPackage()).bytes);
    assert.equal(data.chunks[0].sourceHash, mod.inputDigest('chunk', host.embeddingInputs[0]));
    assert.equal(data.states[0].sourceHash, mod.inputDigest('state', host.embeddingInputs[1]));
    assert.equal(data.states[0].relationHash, mod.inputDigest('relation', host.embeddingInputs[2]));
});
