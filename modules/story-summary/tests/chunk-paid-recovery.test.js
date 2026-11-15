import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { createEmbeddingFailureError } from '../vector/llm/embedding-failure.js';

// Protect the paid-request/storage boundary using real receipts, L1 pipelines,
// chunk projection and IndexedDB. Only host/network/runtime edges are replaced.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const previousSessionStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
const sessionEntries = new Map();
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: {
    get length() { return sessionEntries.size; },
    key(index) { return [...sessionEntries.keys()][index] ?? null; },
    getItem(key) { return sessionEntries.get(String(key)) ?? null; },
    setItem(key, value) { sessionEntries.set(String(key), String(value)); },
    removeItem(key) { sessionEntries.delete(String(key)); },
} });
after(() => {
    if (previousSessionStorage) Object.defineProperty(globalThis, 'sessionStorage', previousSessionStorage);
    else delete globalThis.sessionStorage;
});
const host = globalThis.__chunkPaidRecoveryTest = { context: {} };
const shims = {
    'extensions.js': 'export const getContext=()=>globalThis.__chunkPaidRecoveryTest.context;',
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){},debug(){}};',
    'config.js': 'export const getTextFilterRules=()=>[];',
    'runtime.js': 'export const applyRecallRuntimeMutationBestEffort=()=>{}; export const clearRecallRuntime=async()=>{};',
    'siliconflow.js': 'export const embed=(texts,options)=>globalThis.__chunkPaidRecoveryTest.embed(texts,options);',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/vector/pipeline/chunk-builder.js';",
        "export * from './modules/story-summary/vector/pipeline/chunk-repair.js';",
        "export * from './modules/story-summary/vector/pipeline/chunk-maintenance.js';",
        "export * from './modules/story-summary/vector/runtime/embedding-receipts.js';",
        "export * from './modules/story-summary/vector/storage/chunk-store.js';",
        "export { getChatIdentity } from './modules/story-summary/data/chat-identity.js';",
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
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));
after(() => { mod.db.close(); delete globalThis.__chunkPaidRecoveryTest; });
let sequence = 0;
beforeEach(async () => {
    sessionEntries.clear();
    for (const table of mod.db.tables) await table.clear();
    host.context = { chatId: `paid-l1-${++sequence}`, characterId: 0,
        characters: [{ avatar: 'fixture.png' }], chat: [{ mes: 'source-0' }] };
    host.config = { enabled: true, embeddingApi: { model: 'test-model', key: 'test-key' } };
    host.inputs = [];
    host.onEmbed = null;
    host.embed = async (texts, options) => {
        host.inputs.push([...texts]);
        await host.onEmbed?.(texts, options);
        return texts.map(() => [1, 0]);
    };
});
function fillChat(count) {
    host.context.chat = Array.from({ length: count }, (_, floor) => ({ mes: `source-${floor}` }));
}
function incremental(options = {}) {
    return mod.buildIncrementalChunks({ targetChatId: host.context.chatId,
        chatSnapshot: host.context.chat, vectorConfig: host.config, ...options });
}
function repair(options = {}) {
    return mod.repairMissingChunks({ chatId: host.context.chatId,
        chat: host.context.chat, vectorConfig: host.config, ...options });
}
const identity = () => mod.getChatIdentity(host.context);
const timeout = () => createEmbeddingFailureError('timed out', { kind: 'timeout' });

test('incremental failure makes one request and cannot be retried by scans or chat switches', async () => {
    host.onEmbed = () => { throw timeout(); };
    assert.equal((await incremental()).code, 'embedding_timeout');
    assert.equal((await incremental()).success, false);
    const original = host.context;
    host.context = { ...original, chatId: 'other-chat', chat: [] };
    assert.equal((await incremental()).success, false);
    host.context = original;
    host.onEmbed = null;
    assert.equal((await incremental()).success, false);
    assert.equal(host.inputs.length, 1);
    mod.retryStoredEmbeddings(identity());
    assert.equal((await incremental()).success, true);
    assert.equal(host.inputs.length, 2);
});

test('later failed incremental batch retains earlier paid responses for explicit recovery', async () => {
    fillChat(45);
    host.onEmbed = () => { if (host.inputs.length === 2) throw timeout(); };
    assert.equal((await incremental()).success, false);
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 0);
    assert.equal((await incremental()).success, false);
    assert.equal(host.inputs.length, 2);
    mod.retryStoredEmbeddings(identity());
    assert.equal((await incremental()).built, 45);
    assert.deepEqual(host.inputs.map(batch => batch.length), [20, 20, 20, 5]);
    assert.equal(host.inputs.flat().filter(text => text === 'source-0').length, 1);
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 45);
});

test('incremental storage recovery reuses every paid response without another network request', async () => {
    fillChat(25);
    const failed = await incremental({ commit: async () => {
        throw Object.assign(new Error('storage unavailable'), { code: 'chunk_write_failed' });
    } });
    assert.equal(failed.success, false);
    assert.equal(host.inputs.length, 2);
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 0);
    assert.equal((await incremental()).built, 25);
    assert.equal(host.inputs.length, 2);
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 25);
});

test('repair storage recovery saves the retained response without rebuying it', async () => {
    let commits = 0;
    const failed = await repair({ commit: task => {
        if (++commits === 2) throw new Error('vector storage unavailable');
        return task();
    } });
    assert.equal(failed.code, 'vector_write_failed');
    assert.equal(host.inputs.length, 1);
    assert.equal((await repair({ retryFailed: true })).repaired, 1);
    assert.equal(host.inputs.length, 1);
    assert.equal((await repair()).repaired, 0);
});

test('manual repair retries only the failed batch once and preserves committed vectors', async () => {
    fillChat(40);
    host.onEmbed = () => { if (host.inputs.length === 2) throw timeout(); };
    const failed = await repair();
    assert.equal(failed.repaired, 20);
    assert.equal(failed.success, false);
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 20);
    const committed = await mod.getChunkVectorDescriptors(host.context.chatId);
    assert.equal((await repair()).success, false);
    assert.equal(host.inputs.length, 2);
    const recovered = await repair({ retryFailed: true });
    assert.equal(recovered.success, true);
    assert.equal(recovered.repaired, 20);
    assert.deepEqual(host.inputs.map(batch => batch.length), [20, 20, 20]);
    assert.equal(host.inputs.flat().filter(text => text === 'source-0').length, 1);
    const all = await mod.getChunkVectorDescriptors(host.context.chatId);
    assert.equal(all.length, 40);
    assert.deepEqual(all.filter(item => committed.some(saved => saved.chunkId === item.chunkId)), committed);
    assert.equal((await repair({ retryFailed: true })).repaired, 0);
    assert.equal(host.inputs.length, 3);
});

test('manual repair leaves a different failed input blocked', async () => {
    const selected = host.context.chat[0].mes;
    host.onEmbed = () => { throw timeout(); };
    assert.equal((await repair()).success, false);
    host.context.chat[0].mes = 'unselected failed source';
    await mod.deleteChunksFromFloor(host.context.chatId, 0);
    assert.equal((await repair()).success, false);
    host.context.chat[0].mes = selected;
    await mod.deleteChunksFromFloor(host.context.chatId, 0);
    host.onEmbed = null;
    assert.equal((await repair({ retryFailed: true })).repaired, 1);
    assert.equal(host.inputs.length, 3);
    host.context.chat[0].mes = 'unselected failed source';
    await mod.deleteChunksFromFloor(host.context.chatId, 0);
    assert.equal((await repair()).success, false);
    assert.equal(host.inputs.length, 3);
});

test('full build saves successful batches and stops before later paid work on first failure', async () => {
    fillChat(45);
    host.onEmbed = () => { if (host.inputs.length === 2) throw timeout(); };
    assert.deepEqual(await mod.buildAllChunks({ vectorConfig: host.config }), { built: 20, errors: 1 });
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 20);
    assert.equal((await mod.getMeta(host.context.chatId)).lastChunkFloor, -1);
    const maintain = () => mod.maintainChunks({ targetChatId: host.context.chatId,
        chatSnapshot: host.context.chat, vectorConfig: host.config });
    assert.equal((await maintain()).success, false);
    assert.equal(host.inputs.length, 2);
    mod.retryStoredEmbeddings(identity());
    assert.equal((await maintain()).success, true);
    assert.deepEqual(host.inputs.map(batch => batch.length), [20, 20, 20, 5]);
    assert.equal((await mod.getStorageStats(host.context.chatId)).chunkVectors, 45);
});

test('cancelled dispatched incremental request remains uncertain and is not bought by a fresh scan', async () => {
    const controller = new AbortController();
    host.onEmbed = async (_texts, { signal }) => {
        controller.abort();
        throw signal.reason;
    };
    assert.equal((await incremental({ signal: controller.signal })).status, 'cancelled');
    host.onEmbed = null;
    assert.equal((await incremental()).success, false);
    assert.equal(host.inputs.length, 1);
});

test('genuinely changed source remains eligible after an older input failed', async () => {
    host.onEmbed = () => { throw timeout(); };
    assert.equal((await incremental()).success, false);
    host.onEmbed = null;
    host.context.chat[0].mes = 'new authoritative source';
    assert.equal((await incremental()).success, true);
    assert.equal(host.inputs.length, 2);
});

test('same-filename character switch cannot commit or discard the original paid response', async () => {
    const original = host.context;
    host.onEmbed = () => {
        host.context = { ...original, characterId: 1,
            characters: [...original.characters, { avatar: 'other-character.png' }] };
    };
    assert.equal((await incremental()).status, 'cancelled');
    assert.equal((await mod.getStorageStats(original.chatId)).chunkVectors, 0);
    host.context = original;
    host.onEmbed = null;
    assert.equal((await incremental()).success, true);
    assert.equal(host.inputs.length, 1);
});
