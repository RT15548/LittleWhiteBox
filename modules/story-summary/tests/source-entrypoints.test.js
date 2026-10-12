import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entry } from './helpers/story-summary-entry.js';
import { createMessageSourceTracker } from '../data/message-sources.js';
import { createServiceTests } from '../vector/service-tests.js';
import { throwIfSignalAborted } from '../../../shared/common/abort-utils.js';
import * as vectorWrites from '../vector/runtime/maintenance-coordinator.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { buildVectorIntegrityIssues } from '../vector/integrity-policy.js';

// Execute production entrypoints; replace only host, storage and transport boundaries.
// No assertions about source spelling or implementation structure.
const noop = () => {};
function chatFixture() {
    const context = { chatId: 'chat', chat: [
        { mes: 'greeting', is_user: false }, { mes: 'question', is_user: true },
        { mes: 'answer', is_user: false }, { mes: 'tail', is_user: false },
    ] };
    const messageSources = createMessageSourceTracker();
    messageSources.reset(context);
    return { context, messageSources };
}

for (const transition of ['switch', 'reload', 'save']) test(`chat initialization after visibility wait respects ownership: ${transition}`, async () => {
    const { context } = chatFixture();
    let store = { json: { events: [{ id: 'old' }] } };
    let release, entered, backgroundRequests = 0;
    const pending = new Promise(resolve => { release = resolve; });
    const waiting = new Promise(resolve => { entered = resolve; });
    const publications = [];
    const startBackground = () => { backgroundRequests++; };
    const host = entry(['handleChatChanged', 'isChatStale'], {
        ...vectorWrites, events: {}, activeChatId: context.chatId,
        getContext: () => context, getSummaryStore: () => store,
        clearDeferredBackgroundTasks: noop, lastRecallLogText: '', postToFrame: noop,
        notifyStorySummaryChatState: noop, initButtonsForAll: noop,
        isStorySummaryEnabledForCurrentChat: () => true,
        logRecallRuntimeCheckpoint: noop, retainRecallRuntimeOnly: noop,
        rollbackSummaryIfNeeded: async () => ({ status: 'unchanged' }), reconcileVectorFloorsOnLoad: noop,
        applyHideState: () => { entered(); return pending; }, frameReady: true,
        sendFrameBaseData: async current => publications.push({ stats: current.json.events.length }),
        sendFrameFullData: current => publications.push({ chatId: context.chatId, events: current.json.events }),
        sendAnchorStatsToFrame: noop, sendVectorStatsToFrame: noop,
        refreshEntityLexiconAndWarmup: startBackground, invalidateLexicalIndex: noop,
        scheduleLexicalWarmup: startBackground, CHAT_CHANGE_LEXICAL_WARMUP_MS: 0,
        embeddingConnection: { warmup: startBackground }, scheduleVectorIntegrityCheck: startBackground,
    });
    const initializing = host.handleChatChanged();
    await waiting;
    assert.deepEqual(publications, []);
    assert.equal(backgroundRequests, 0);
    // A normal commit updates the store in place; a reload replaces metadata,
    // even when the host reuses both the chat ID and the chat array.
    if (transition === 'switch') context.chatId = host.activeChatId = 'other-chat';
    if (transition === 'reload') store = structuredClone(store);
    store.json.events = [{ id: 'confirmed' }];
    release();
    await initializing;
    if (transition === 'save') {
        assert.deepEqual(publications, [{ stats: 1 }, { chatId: context.chatId, events: store.json.events }]);
        assert.ok(backgroundRequests > 0);
    } else {
        assert.deepEqual(publications, []);
        assert.equal(backgroundRequests, 0);
    }
});

for (const kind of ['anchor', 'vector-rebuild', 'vector-repair']) for (const interruption of ['stop', 'chat', 'config', 'unload', 'none']) {
    test(`${kind}: ${interruption} during source synchronization owns the subsequent generation request`, async () => {
        let releaseSources, requests = 0, released = false;
        const sources = new Promise(resolve => { releaseSources = resolve; });
        const host = entry(['handleAnchorGenerate', 'handleGenerateVectors'], {
            ...vectorWrites, guard: { isAnyRunning: () => false, acquire: () => () => { released = true; } },
            getContext: () => ({ chatId: 'chat' }), ensureCurrentSources: () => {
                vectorWrites.cancelEmbeddingWriteTasks('Source synchronization');
                return sources;
            },
            ANCHOR_GENERATION_OPERATION: 'manual-anchor', VECTOR_GENERATION_OPERATION: 'manual-vector',
            getVectorConfig: () => ({ enabled: true }),
            handleAnchorGenerateNow: async () => { requests++; },
            generateVectorsNow: async () => { requests++; }, repairVectorsNow: async () => { requests++; },
            postToFrame: noop, sendVectorStatsToFrame: noop, executeSlashCommand: noop,
            isChatStale: () => false, reportMemorySaveFailure: noop, xbLog: { error: noop }, MODULE_ID: 'summary',
        });
        const running = kind === 'anchor' ? host.handleAnchorGenerate() : host.handleGenerateVectors(kind === 'vector-repair' ? 'repair' : 'rebuild');
        const operationId = kind === 'anchor' ? 'manual-anchor' : 'manual-vector';
        let cancelled, transition;
        if (interruption === 'stop') cancelled = vectorWrites.cancelVectorWriteOperation(operationId);
        if (interruption === 'chat') vectorWrites.cancelEmbeddingWriteTasks();
        if (interruption === 'config') transition = vectorWrites.runVectorConfigTransition({}, noop);
        if (interruption === 'unload') transition = vectorWrites.shutdownVectorWriteCoordinator();
        releaseSources();
        await running;
        await transition;
        if (interruption === 'unload') vectorWrites.resumeVectorWriteCoordinator();
        if (interruption === 'stop') assert.equal(cancelled, true);
        assert.equal(requests, interruption === 'none' ? 1 : 0);
        assert.equal(released, true);
        assert.equal(vectorWrites.cancelVectorWriteOperation(operationId), false);
    });
}

test('quiet completion cannot acknowledge a historical reorder before Done', () => {
    const { context, messageSources } = chatFixture();
    const scheduled = [];
    const host = entry(['notifyStorySummaryAfterAi'], {
        getContext: () => context, messageSources,
        isStorySummaryEnabledForCurrentChat: () => true,
        isStorySummaryConsumableForCurrentChat: () => true, getVectorConfig: () => ({ enabled: true }),
        rememberVectorMaintenance: (...args) => scheduled.push(args),
        scheduleAutoL0Backfill: noop, notifyAfterAiHint: noop, MODULE_ID: 'summary', AUTO_L0_BACKFILL_DELAY_MS: 0,
    });
    [context.chat[1], context.chat[2]] = [context.chat[2], context.chat[1]];
    host.notifyStorySummaryAfterAi(undefined, 'generation_ended');
    assert.equal(messageSources.inspect(context, 2)?.fromFloor, 1);
    assert.equal(scheduled.length, 0);
});

function statsFixture() {
    const context = { chatId: 'chat', chat: [] };
    const messages = [];
    const timers = new Map();
    const executed = [];
    let nextTimer = 0;
    const host = entry(['sendVectorStatsToFrame', 'scheduleVectorIntegrityCheck', 'checkVectorIntegrity', 'refreshVectorIntegrity', 'publishVectorIntegrity', 'stopVectorMaintenanceAfterFailure'], {
        getContext: () => context, getSummaryStore: () => ({}),
        getStorageStats: async () => ({}), getChunkBuildStatus: async () => ({}),
        getStateVectorsCount: async () => 0, getCurrentRecallRuntimeStat: noop,
        postToFrame: message => messages.push(message), frameReady: true,
        embeddingConnection: { getStatus: () => ({ status: 'idle' }) },
        serviceTests: { getStatus: () => ({ status: 'idle' }) },
        SUMMARY_FEEDBACK_COPY: { vectorIntegrity: { checking: 'checking' } },
        vectorIntegrityTimer: null, vectorIntegrityRetryDelayMs: 0,
        integrityReadVersion: 0,
        setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; },
        clearTimeout: id => timers.delete(id), isChatStale: () => false, getBackgroundQuietWaitMs: () => 0,
        getVectorConfig: () => ({ enabled: true }), guard: { isAnyRunning: () => false },
        isBackgroundWorkLive: () => true, clearVectorMaintenance: noop,
    });
    return { context, host, timers, messages, executed };
}

for (const order of ['refresh-first', 'maintenance-first']) test(`read-only panel refresh preserves maintenance responsibility: ${order}`, async () => {
    const { host, timers, executed } = statsFixture();
    host.checkVectorIntegrity = async options => executed.push(options);
    if (order === 'maintenance-first') host.scheduleVectorIntegrityCheck(100);
    await host.sendVectorStatsToFrame();
    if (order === 'refresh-first') host.scheduleVectorIntegrityCheck(100);
    for (const callback of [...timers.values()]) callback();
    await Promise.resolve();
    assert.ok(executed.some(options => options.allowEventRepair && options.allowChunkRepair));
    assert.ok(executed.some(options => options.readOnly && !options.allowEventRepair && !options.allowChunkRepair));
});

test('panel refresh after failed maintenance cannot reopen its paid repair permissions', async () => {
    const { host, timers, executed } = statsFixture();
    host.checkVectorIntegrity = async options => executed.push(options);
    host.stopVectorMaintenanceAfterFailure('chat', { allowEventRepair: false, allowChunkRepair: false });
    await host.sendVectorStatsToFrame();
    for (const callback of [...timers.values()]) callback();
    await Promise.resolve();
    assert.ok(executed.length >= 2);
    assert.ok(executed.every(options => !options.allowEventRepair && !options.allowChunkRepair));
});

test('empty chat never leaves a checking status behind', async () => {
    const { host, messages } = statsFixture();
    await host.sendVectorStatsToFrame();
    await host.checkVectorIntegrity();
    const last = messages.filter(message => message.type === 'VECTOR_INTEGRITY').at(-1);
    assert.equal(last?.status, 'idle');
});

for (const failed of [false, true]) test(`maintenance releases its lock before its terminal read-only panel check (failed: ${failed})`, async () => {
    const context = { chatId: 'chat', chat: [{ mes: 'answer', is_user: false }] };
    const messages = [], scheduled = [];
    const pending = new Map([['chat', { floors: new Set([0]), reasons: new Set(['after-ai']) }]]);
    let locked = false, writes = 0;
    const host = entry(['maybeRunDelayedVectorMaintenance', 'finishVectorMaintenance', 'clearVectorMaintenance',
        'stopVectorMaintenanceAfterFailure', 'sendVectorStatsToFrame', 'refreshVectorIntegrity', 'checkVectorIntegrity',
        'publishVectorIntegrity', 'deferVectorIntegrityUntilMaintenance'], {
        ...vectorWrites, SUMMARY_FEEDBACK_COPY, buildVectorIntegrityIssues,
        getContext: () => context, getVectorConfig: () => ({ enabled: true }),
        isStorySummaryConsumableForCurrentChat: () => true, isL0FloorDeferred: () => false,
        isHostGenerating: () => false, isChatStale: id => id !== context.chatId,
        isBackgroundWorkLive: () => true, ensureCurrentSources: noop,
        guard: { acquire: () => { locked = true; return () => { locked = false; }; }, isAnyRunning: () => locked },
        pendingVectorMaintenanceByChat: pending,
        getAnchorStats: async () => ({ pending: 0, incomplete: 0 }),
        getL0VectorBuildStatus: async () => ({ success: true, missing: 0 }),
        runVectorWriteTask: async () => { writes++; return {
            chunkResult: { success: !failed, built: 0 }, eventResult: { success: true },
            l0Result: { built: 0 }, l0VectorResult: { success: true }, l0Status: { incomplete: 0 },
        }; },
        sendAnchorStatsToFrame: noop, getStorageStats: async () => ({}), getChunkBuildStatus: async () => ({}),
        getStateVectorsCount: async () => 0, getCurrentRecallRuntimeStat: noop,
        getSummaryStore: () => ({}), getMeta: async () => ({}), getEngineFingerprint: () => 'fixture',
        collectMissingEventVectorPairs: async () => [],
        checkVectorCacheConsistency: async () => ({ status: failed ? 'inconsistent' : 'ready' }),
        postToFrame: message => messages.push(message), frameReady: true,
        embeddingConnection: { getStatus: () => ({ status: 'idle' }) }, serviceTests: { getStatus: () => ({ status: 'idle' }) },
        integrityReadVersion: 0, MODULE_ID: 'summary',
        xbLog: { info: noop, warn: noop, error: error => { throw error; } },
        scheduleVectorIntegrityCheck: (_delay, options) => scheduled.push(options),
        scheduleAutoL0Backfill: () => assert.fail('must not schedule another paid round'),
    });
    await host.maybeRunDelayedVectorMaintenance('chat');
    assert.equal(locked, false);
    assert.equal(pending.size, 0);
    assert.equal(messages.filter(message => message.type === 'VECTOR_INTEGRITY').at(-1)?.status, failed ? 'issues' : 'ready');
    for (const options of scheduled) await host.checkVectorIntegrity(options);
    assert.ok(scheduled.every(options => !options.allowEventRepair && !options.allowChunkRepair));
    assert.equal(writes, 1);
});

for (const target of ['l0', 'rerank']) test(`${target} test releases its button after chat changes`, async () => {
    let chatId = 'old';
    let resolve;
    const pending = new Promise(done => { resolve = done; });
    const messages = [];
    const serviceTests = createServiceTests({ probes: { l0: () => pending, rerank: () => pending },
        onStatus: (target, state) => messages.push({ target, ...state }) });
    const host = entry(['handleTestOnlineService'], {
        getContext: () => ({ chatId }), serviceTests, events: {}, xbLog: { warn: noop },
    });
    const running = host.handleTestOnlineService({}, target);
    chatId = 'new';
    resolve({});
    await running;
    assert.notEqual(messages.at(-1)?.status, 'downloading');
});

for (const phase of ['before-commit', 'during-notice']) test(`source mutation ${phase} rejects a stale prompt rather than succeeding empty`, async () => {
    const { context, messageSources } = chatFixture();
    const prompts = { memory: 'old' };
    const prepared = { chatId: context.chatId, sourceBasis: messageSources.capture(context),
        text: 'outdated prepared evidence', notice: { message: 'fixture notice' } };
    let invalidated = false;
    const host = entry(['commitMemoryPrompt', 'sourceSafetyError', 'clearExtensionPrompt'], {
        getContext: () => context, messageSources, throwIfSignalAborted,
        isStorySummaryConsumableForCurrentChat: () => true,
        recallReuse: { invalidate: () => { invalidated = true; } },
        extension_prompts: prompts, EXT_PROMPT_KEY: 'memory',
        SUMMARY_FEEDBACK_COPY: { recallInterrupted: { edited: 'source changed' } },
        claimWarningCooldown: () => true, RECALL_ADVISORY_COOLDOWN_MS: 0,
        executeSlashCommand: async () => { context.chat[0].mes += ' changed'; },
    });
    if (phase === 'before-commit') [context.chat[1], context.chat[2]] = [context.chat[2], context.chat[1]];
    await assert.rejects(host.commitMemoryPrompt(prepared), { code: 'MEMORY_SOURCE_CHANGED' });
    assert.equal(invalidated, true);
    assert.equal(prompts.memory, undefined);
});

for (const name of ['autoRunSummaryWithRetry', 'handleManualGenerate']) {
    test(`${name}: unsafe sources stop before summary or subsequent memory maintenance can spend`, async () => {
        let calls = 0, released = false;
        const notices = [];
        const host = entry([name], {
            guard: { acquire: () => () => { released = true; } },
            beginSummaryExecution: () => ({ controller: new AbortController() }),
            finishSummaryExecution: noop, notifySummaryState: noop,
            isSummaryGenerating: () => false, isSummaryExecutionActive: () => true,
            ensureCurrentSources: async () => { throw Object.assign(new Error('unsafe'), { code: 'MEMORY_SOURCE_UNSAFE' }); },
            runSummaryGeneration: async () => { calls++; return { success: true }; },
            isStorySummaryConsumableForCurrentChat: () => true, scheduleVectorIntegrityCheck: noop,
            postSummaryExecution: (_run, notice) => notices.push(notice),
            formatErrorDetails: error => error.code, xbLog: { error: noop }, MODULE_ID: 'summary',
        });
        await host[name](3, {});
        assert.equal(calls, 0);
        assert.equal(released, true);
        assert.ok(notices.some(notice => notice.type === 'SUMMARY_ERROR'));
    });
}
