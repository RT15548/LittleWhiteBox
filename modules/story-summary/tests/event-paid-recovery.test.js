import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
import 'fake-indexeddb/auto';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { entry } from './helpers/story-summary-entry.js';
import { getChatIdentity } from '../data/chat-identity.js';
import { buildEventVectorText, selectMissingEventVectorPairs } from '../vector/pipeline/event-vector-input.js';
import { inputDigest } from '../vector/utils/vector-input-digest.js';
import { orphanVectorIds } from '../vector/utils/vector-source.js';
import { createEmbeddingFailureError } from '../vector/llm/embedding-failure.js';
import { createAbortError, mergeAbortSignals } from '../../../shared/common/abort-utils.js';
import { trackVectorActivity } from '../vector/runtime/vector-activity.js';

// Exercise the real L2 production entrypoints together with one shared receipt
// owner and IndexedDB. Failed edit/summary follow-up cannot masquerade as a new
// paid request when a later integrity repair sees the same source gap.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * as store from './modules/story-summary/vector/storage/chunk-store.js';",
        "export { db } from './modules/story-summary/data/db.js';",
        "export { createEmbeddingReceipts } from './modules/story-summary/vector/runtime/embedding-receipts.js';",
        "export { getEngineFingerprint } from './modules/story-summary/vector/utils/embedder.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'external-boundaries', setup(api) {
        const shims = {
            'runtime.js': 'export const applyRecallRuntimeMutationBestEffort=()=>{}; export const clearRecallRuntime=async()=>{};',
            'siliconflow.js': 'export const embed=()=>{throw new Error("Unexpected real transport");};',
        };
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated isolated local test bundle, no external code.
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));
after(() => mod.db.close());
let host, bridge, receipts, sequence = 0;
beforeEach(async () => {
    for (const table of mod.db.tables) await table.clear();
    host = {
        context: { chatId: `paid-events-${++sequence}`, characterId: 0, characters: [{ avatar: 'original.png' }] },
        config: { enabled: true, embeddingApi: { model: 'test-model', key: 'test-key' } },
        memory: { json: { events: [{ id: 'event-0', title: 'Event 0', summary: 'Source 0' }] } },
        inputs: [], onEmbed: null, saveError: null, beforeCommit: null, checks: 0,
    };
    receipts = mod.createEmbeddingReceipts({ embed: async texts => {
        host.inputs.push([...texts]);
        await host.onEmbed?.(texts);
        return texts.map(() => [1, 0]);
    } });
    bridge = entry(['collectMissingEventVectorPairs', 'repairMissingEventVectorsNow', 'repairMissingEventVectorsInner',
        'syncEventVectorsOnEditWrite', 'autoVectorizeMissingEventsInner'], {
        structuredClone, ...receipts, getChatIdentity,
        getContext: () => host.context, getVectorConfig: () => host.config,
        getSummaryStore: () => host.memory,
        getEngineFingerprint: mod.getEngineFingerprint,
        getMeta: mod.store.getMeta, getEventVectorDescriptors: mod.store.getEventVectorDescriptors,
        deleteEventVectorsByIds: mod.store.deleteEventVectorsByIds,
        saveEventVectorsToDb: async (...args) => {
            if (host.saveError) throw host.saveError;
            return mod.store.saveEventVectors(...args);
        },
        buildEventVectorText, selectMissingEventVectorPairs, inputDigest, orphanVectorIds,
        createAbortError, mergeAbortSignals, trackVectorActivity,
        eventEditSyncToken: 1,
        isVectorWriteSessionCurrent: session => !session.signal.aborted,
        isStorySummaryEnabledForCurrentChat: () => true,
        isStorySummaryConsumableForCurrentChat: () => true,
        isChatStale: chatId => chatId !== host.context.chatId,
        assertSummaryExecutionActive: execution => {
            if (getChatIdentity(host.context) !== execution.identity) throw createAbortError();
        },
        createSummaryGenerationCancelledError: createAbortError,
        sendVectorStatsToFrame: async () => {},
        scheduleVectorIntegrityCheck: () => { host.checks++; },
        MODULE_ID: 'l2-paid-recovery-test', xbLog: { info() {}, warn() {}, error() {} },
    });
});
function session() {
    return { signal: new AbortController().signal, commit: async task => {
        await host.beforeCommit?.();
        return task();
    } };
}
function repair(options = {}) {
    return bridge.repairMissingEventVectorsNow(host.context.chatId, session(), null, options);
}
function edit() {
    return bridge.syncEventVectorsOnEditWrite(host.memory.json.events.map(event => event.id), 1,
        host.context.chatId, session());
}
function summary() {
    const execution = { chatId: host.context.chatId, identity: getChatIdentity(host.context), controller: new AbortController() };
    return bridge.autoVectorizeMissingEventsInner(host.memory, execution, session(), { update() {} });
}
async function start(pathName, fails = false) {
    if (pathName === 'repair') return repair();
    const run = pathName === 'edit' ? edit() : summary();
    if (fails && pathName === 'summary') return assert.rejects(run);
    return run;
}
const stored = () => mod.store.getEventVectorDescriptors(host.context.chatId);
const timeout = () => createEmbeddingFailureError('uncertain timeout', { kind: 'timeout' });
function fillEvents(count) {
    host.memory.json.events = Array.from({ length: count }, (_, index) => ({
        id: `event-${index}`, title: `Event ${index}`, summary: `Source ${index}`,
    }));
}

for (const pathName of ['edit', 'summary', 'repair']) {
    test(`${pathName} uncertain failure stays blocked until manual repair retries it once`, async () => {
        const problem = timeout();
        host.onEmbed = () => { throw problem; };
        await start(pathName, true);
        assert.equal(host.inputs.length, 1);
        if (pathName === 'edit') assert.ok(host.checks > 0);
        host.onEmbed = null;
        for (let scan = 0; scan < 3; scan++) {
            const result = await repair();
            assert.equal(result.success, false);
            assert.equal(result.error, problem);
        }
        assert.equal(host.inputs.length, 1);
        assert.equal((await stored()).length, 0);
        assert.equal((await repair({ retryFailed: true })).repaired, 1);
        assert.equal(host.inputs.length, 2);
        assert.equal((await stored()).length, 1);
        assert.equal((await repair({ retryFailed: true })).repaired, 0);
        assert.equal(host.inputs.length, 2);
    });

    test(`${pathName} paid response with failed save is reused by integrity repair`, async () => {
        host.saveError = new Error('vector storage unavailable');
        await start(pathName, true);
        assert.equal(host.inputs.length, 1);
        assert.equal((await stored()).length, 0);
        host.saveError = null;
        assert.equal((await repair({ retryFailed: true })).repaired, 1);
        assert.equal(host.inputs.length, 1);
        const [saved] = await stored();
        assert.equal(saved.sourceHash, inputDigest('event', buildEventVectorText(host.memory.json.events[0])));
        assert.equal((await repair()).repaired, 0);
        assert.equal(host.inputs.length, 1);
    });
}

for (const pathName of ['edit', 'summary', 'repair']) {
    test(`${pathName} partial batches stop on first failure and preserve successful paid work across repair`, async () => {
        fillEvents(45);
        host.onEmbed = () => { if (host.inputs.length === 2) throw timeout(); };
        await start(pathName, true);
        assert.deepEqual(host.inputs.map(batch => batch.length), [20, 20]);
        const committed = await stored();
        assert.equal(committed.length, 20);
        assert.equal((await repair()).success, false);
        assert.equal(host.inputs.length, 2);
        assert.equal((await repair({ retryFailed: true })).repaired, 25);
        assert.deepEqual(host.inputs.map(batch => batch.length), [20, 20, 20, 5]);
        assert.equal(host.inputs.flat().filter(text => text === 'Event 0 Source 0').length, 1);
        const all = await stored();
        assert.equal(all.length, 45);
        assert.deepEqual(all.filter(item => committed.some(saved => saved.eventId === item.eventId)), committed);
    });

    test(`${pathName} cannot commit a paid response into a same-filename different character`, async () => {
        const original = host.context;
        host.onEmbed = () => {
            host.context = { ...original, characterId: 1,
                characters: [...original.characters, { avatar: 'other.png' }] };
        };
        await start(pathName, true);
        assert.equal((await stored()).length, 0);
        host.context = original;
        host.onEmbed = null;
        assert.equal((await repair()).repaired, 1);
        assert.equal(host.inputs.length, 1);
    });
}

for (const pathName of ['edit', 'repair']) test(`${pathName} rechecks character ownership inside the queued storage commit`, async () => {
    const original = host.context;
    host.beforeCommit = () => {
        host.context = { ...original, characterId: 1,
            characters: [...original.characters, { avatar: 'other.png' }] };
    };
    await start(pathName);
    assert.equal((await stored()).length, 0);
    host.context = original;
    host.beforeCommit = null;
    assert.equal((await repair()).repaired, 1);
    assert.equal(host.inputs.length, 1);
});

for (const withDeletion of [false, true]) test(`edit with mismatched cache metadata makes no paid request or vector write (cleanup: ${withDeletion})`, async () => {
    const chatId = host.context.chatId;
    const oldFingerprint = 'previous-vector-engine';
    await mod.store.saveEventVectors(chatId, [
        { eventId: 'event-0', vector: [0, 1], sourceHash: inputDigest('event', 'previous event content') },
        ...(withDeletion ? [{ eventId: 'deleted-event', vector: [0, 1], sourceHash: inputDigest('event', 'deleted event') }] : []),
    ], oldFingerprint);
    await mod.store.updateMeta(chatId, { fingerprint: oldFingerprint });
    const original = (await stored()).find(item => item.eventId === 'event-0');
    let writes = 0;
    const save = bridge.saveEventVectorsToDb;
    bridge.saveEventVectorsToDb = (...args) => { writes++; return save(...args); };
    const scheduled = [];
    bridge.scheduleVectorIntegrityCheck = (delay, options) => { scheduled.push({ delay, options }); };
    const changed = ['event-0', ...(withDeletion ? ['deleted-event'] : [])];
    await bridge.syncEventVectorsOnEditWrite(changed, 1, chatId, session());
    assert.equal(host.inputs.length, 0);
    assert.equal(writes, 0);
    assert.deepEqual(await stored(), [original]);
    assert.equal((await mod.store.getMeta(chatId)).fingerprint, oldFingerprint);
    assert.equal(scheduled.length, 1);
    assert.equal(scheduled[0].options.allowEventRepair, false);
    assert.equal(scheduled[0].options.allowChunkRepair, false);
    assert.equal(scheduled[0].options.allowStateRepair, false);
});
