import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entry } from './helpers/story-summary-entry.js';
import { createMessageSourceTracker } from '../data/message-sources.js';
import { createServiceTests } from '../vector/service-tests.js';
import { createAbortError, commitIfSignalActive, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';
import * as vectorWrites from '../vector/runtime/maintenance-coordinator.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { buildVectorIntegrityIssues } from '../vector/integrity-policy.js';
import { replaceCharacterAliases } from '../data/character-aliases.js';
import { createRecallReuse } from '../generate/recall-reuse.js';

// Execute production entrypoints; replace only host, storage and transport boundaries.
// No assertions about source spelling or implementation structure.
const noop = () => {};
function chatFixture() {
    const context = { chatId: 'chat', characterId: 0, characters: [{ avatar: 'fixture.png' }], chat: [
        { mes: 'greeting', is_user: false }, { mes: 'question', is_user: true },
        { mes: 'answer', is_user: false }, { mes: 'tail', is_user: false },
    ] };
    const messageSources = createMessageSourceTracker();
    messageSources.reset(context);
    return { context, messageSources };
}

function sourceSyncDependencies({ context, messageSources }, recallReuse = createRecallReuse()) {
    return {
        ...vectorWrites, getContext: () => context, messageSources, recallReuse,
        isChatStale: () => false, isStorySummaryEnabledForCurrentChat: () => true,
        retainSourceChange: (tracker, current, options) => { tracker.retain(current, options); return tracker.inspect(current); },
        waitForMemoryCommit: async () => {},
        synchronizeSourceCaches: (tracker, current) => tracker.synchronize(current, async () => ({ status: 'not_needed' })),
        rememberVectorMaintenance: noop, scheduleAutoL0Backfill: noop, AUTO_L0_BACKFILL_DELAY_MS: 0,
        removeDocumentsFromFloor: noop, removeDocumentsByFloor: noop, scheduleLexicalWarmup: noop,
        applyHideState: async () => {}, notifyStorySummaryChatState: noop,
    };
}

for (const owner of ['character', 'group']) for (const continued of [false, true]) {
    for (const source of ['message_received', 'generation_ended']) test(`${owner} ${source}: ${continued ? 'continued' : 'new'} AI reply schedules maintenance once`, () => {
        const { context, messageSources } = chatFixture();
        if (owner === 'group') context.groupId = 'group';
        messageSources.reset(context);
        if (continued) context.chat.at(-1).mes += ' continued';
        else context.chat.push({ mes: 'new answer', is_user: false });
        const scheduled = [], hints = [];
        let timers = 0;
        const host = entry(['notifyStorySummaryAfterAi'], {
            getContext: () => context, messageSources, isStorySummaryEnabledForCurrentChat: () => true,
            getVectorConfig: () => ({ enabled: true }), rememberVectorMaintenance: (...args) => scheduled.push(args),
            scheduleAutoL0Backfill: () => { timers++; }, notifyAfterAiHint: hint => hints.push(hint),
            MODULE_ID: 'summary', AUTO_L0_BACKFILL_DELAY_MS: 0,
        });
        const floor = context.chat.length - 1;
        host.notifyStorySummaryAfterAi(floor, source);
        host.notifyStorySummaryAfterAi(floor, 'message_received');
        host.notifyStorySummaryAfterAi(undefined, 'generation_ended');
        assert.deepEqual(scheduled, [[context.chatId, floor, 'after_ai']]);
        assert.equal(timers, 1);
        assert.equal(hints.length, 1);
        host.notifyStorySummaryAfterAi(floor, 'character_message_rendered');
        assert.equal(timers, 1);
    });
}

for (const route of ['background', 'content-change']) for (const history of ['unchanged', 'edit', 'delete', 'reorder']) {
    test(`${route} sync after a normal send preserves recall unless older history changed (${history})`, async () => {
        const fixture = chatFixture(), { context } = fixture;
        const recallReuse = createRecallReuse();
        context.chat.push({ mes: 'new question', is_user: true });
        const { ticket } = recallReuse.prepare(context);
        assert.equal(recallReuse.adopt(ticket, context, { text: 'memory', boundary: 0, role: 'system', report: '' }), true);
        context.chat.push({ mes: 'new answer', is_user: false });
        assert.ok(recallReuse.prepare(context, 'swipe').memory);
        if (history === 'edit') context.chat[0].mes += ' edited';
        if (history === 'delete') context.chat.shift();
        if (history === 'reorder') [context.chat[0], context.chat[1]] = [context.chat[1], context.chat[0]];
        const host = entry(['synchronizeCurrentSources', 'runContentChangeSync'], {
            ...sourceSyncDependencies(fixture, recallReuse), memoryMaintenance: { cancel: noop },
            handleMessageUpdated: noop, cancelPendingHide: noop,
        });
        let pending;
        if (route === 'background') pending = host.synchronizeCurrentSources(context.chatId);
        else host.runContentChangeSync(chatId => (pending = host.synchronizeCurrentSources(chatId)));
        await pending;
        assert.equal(!!recallReuse.prepare(context, 'swipe').memory, history === 'unchanged');
    });
}

for (const sameOwner of [false, true]) test(`chat-change entry preserves recall only for the same owner (${sameOwner})`, () => {
    const { context, messageSources } = chatFixture();
    context.characterId = 0;
    messageSources.reset(context);
    const controller = new AbortController();
    let syncs = 0;
    const host = entry(['handleChatChange'], {
        getContext: () => context, messageSources, activeChatId: context.chatId, activeSummaryExecution: null,
        embeddingConnection: { cancel: noop }, serviceTests: { cancel: noop }, memoryMaintenance: { cancel: noop },
        cancelRecallAndClearPrompt: () => controller.abort(), cancelActiveSummaryExecution: noop,
        cancelEmbeddingWriteTasks: noop, cancelPendingHide: noop, scheduleWithChatGuard: noop,
        runContentChangeSync: () => { syncs++; }, synchronizeCurrentSources: noop,
    });
    context.characterId = sameOwner ? 0 : 1;
    context.chat = structuredClone(context.chat.slice(0, 2));
    host.handleChatChange();
    assert.equal(controller.signal.aborted, !sameOwner);
    assert.equal(syncs, Number(sameOwner));
    if (!sameOwner) assert.equal(messageSources.inspect(context), null);
});

test('unchanged aliases neither write nor cancel recall', async () => {
    const store = { json: { characterAliases: [] } };
    const host = entry(['handleFrameMessage'], {
        document: { getElementById: noop }, isTrustedMessage: () => true,
        getContext: () => ({ chatId: 'chat' }), waitForMemoryCommit: async () => {}, assertMemoryWritable: noop,
        getSummaryStore: () => store, readSummaryMemory: () => ({ storySummary: store }), structuredClone,
        replaceCharacterAliases, getCurrentFloorHint: () => 1,
        cancelRecallAndClearPrompt: () => assert.fail('unchanged aliases cancelled recall'),
        memoryMaintenance: { cancel: () => assert.fail('unchanged aliases cancelled maintenance') },
        commitSummaryMemory: () => assert.fail('unchanged aliases saved'), reportMemorySaveFailure: error => { throw error; },
    });
    await host.handleFrameMessage({ data: { type: 'UPDATE_CHARACTER_ALIASES', aliases: [] } });
});

test('manual incremental summary completion preserves an already successful recall', async () => {
    const execution = { chatId: 'chat', controller: new AbortController() };
    const controller = new AbortController();
    let completed = false;
    const host = entry(['handleManualGenerate'], {
        isSummaryGenerating: () => false, guard: { acquire: () => noop }, beginSummaryExecution: () => execution,
        ensureCurrentSources: async () => {}, notifySummaryState: noop, assertSummaryExecutionActive: noop,
        activeSummaryExecution: execution, getContext: () => ({ chatId: 'chat' }),
        cancelRecallAndClearPrompt: () => controller.abort(), postToFrame: noop, buildFramePayload: value => value,
        refreshEntityLexiconAndWarmup: noop, applyHideStateDebounced: noop, updateFrameStatsAfterSummary: noop,
        autoVectorizeMissingEvents: noop, rebuildActiveVectorCacheAfterSummary: noop, finishSummaryExecution: noop,
        isStorySummaryConsumableForCurrentChat: () => true, scheduleVectorIntegrityCheck: noop,
        xbLog: { error: (_module, _message, error) => { throw error; } }, MODULE_ID: 'summary',
        runSummaryGeneration: async (_floor, _config, callbacks) => {
            await callbacks.onComplete({ store: {}, newEventIds: [] });
            completed = true;
            return { committed: true };
        },
    });
    await host.handleManualGenerate(3, {});
    assert.equal(completed, true);
    assert.equal(controller.signal.aborted, false);
});

for (const change of ['edit', 'append', 'delete', 'stale', 'stale-rollback']) test(`source maintenance ${change} updates only its affected lexical documents`, async () => {
    const { context, messageSources } = chatFixture();
    const removals = [], events = [], maintenance = [];
    let scheduled = 0;
    if (change === 'append') context.chat.push({ mes: 'new floor', is_user: false });
    else if (change === 'delete' || change === 'stale-rollback') context.chat.pop();
    else context.chat[2].mes += ' edited';
    const store = { json: { events: [{ id: 'retained-l2' }] } };
    const host = entry(['synchronizeCurrentSources'], {
        ...sourceSyncDependencies({ context, messageSources }),
        runVectorWriteTask: async (_options, run) => run(),
        synchronizeSourceCaches: (tracker, current) => tracker.synchronize(current, async () => {
            if (change.startsWith('stale')) context.chat[2].mes += ' later';
            return { status: change === 'delete' || change === 'stale-rollback' ? 'rolled_back' : 'not_needed' };
        }),
        recallReuse: { invalidate: noop, historyChanged: noop },
        rememberVectorMaintenance: (_chat, floor) => maintenance.push(floor),
        scheduleAutoL0Backfill: () => { scheduled++; }, AUTO_L0_BACKFILL_DELAY_MS: 0,
        invalidateLexicalIndex: () => assert.fail('local maintenance must retain the corpus'),
        removeDocumentsFromFloor: floor => removals.push(['suffix', floor]),
        removeDocumentsByFloor: floor => removals.push(['floor', floor]),
        replaceEventDocuments: next => events.push(next), getPublishedSummaryStore: () => store,
        scheduleLexicalWarmup: noop, applyHideState: async () => {}, notifyStorySummaryChatState: noop,
    });
    const outcome = await host.synchronizeCurrentSources(context.chatId, change === 'edit' ? 'edit' : 'observed');
    assert.equal(scheduled, 1);
    if (change.startsWith('stale')) {
        assert.equal(outcome.status, 'stale');
        assert.ok(messageSources.inspect(context));
        if (change === 'stale') assert.ok(maintenance.includes(2));
    } else {
        assert.equal(outcome.status, 'synced');
        assert.equal(messageSources.inspect(context), null);
    }
    assert.deepEqual(removals, [change === 'edit' || change === 'stale' ? ['floor', 2] : ['suffix', change === 'append' ? 4 : 3]]);
    assert.deepEqual(events, change === 'delete' || change === 'stale-rollback' ? [store.json.events] : []);
});

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
        waitForMemoryCommit: async () => {},
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
        const fixture = chatFixture();
        fixture.context.chat.push({ mes: 'not yet synchronized', is_user: true });
        const sources = new Promise(resolve => { releaseSources = resolve; });
        const host = entry(['handleAnchorGenerate', 'handleGenerateVectors', 'ensureCurrentSources', 'synchronizeCurrentSources'], {
            ...sourceSyncDependencies(fixture), guard: { isAnyRunning: () => false, acquire: () => () => { released = true; } },
            waitForMemoryCommit: () => sources, createAbortError, throwIfSignalAborted, assertMemoryWritable: noop,
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
        isStorySummaryEnabledForCurrentChat: () => true, isL0FloorDeferred: () => false,
        isHostGenerating: () => false, isChatStale: id => id !== context.chatId,
        isBackgroundWorkLive: () => true, ensureCurrentSources: noop,
        guard: { acquire: () => { locked = true; return () => { locked = false; }; }, isAnyRunning: () => locked },
        pendingVectorMaintenanceByChat: pending,
        getAnchorStats: async () => ({ pending: 0, incomplete: 0 }),
        getL0VectorBuildStatus: async () => ({ success: true, missing: 0 }),
        runVectorGenerationTask: async () => { writes++; return {
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

for (const change of ['edit', 'append', 'clone', 'saving', 'switch', 'stop']) for (const phase of ['before-commit', 'during-notice']) test(`${change} ${phase}: current recall survives local maintenance, but not stop or chat switch`, async () => {
    const { context, messageSources } = chatFixture();
    const prompts = {};
    const prepared = { chatId: context.chatId, sourceBasis: messageSources.capture(context),
        text: 'successful evidence', depth: 2, role: 0, notice: { message: 'fixture notice' } };
    const controller = new AbortController();
    let saving = false;
    const mutate = () => {
        if (change === 'edit') context.chat[0].mes += ' changed';
        if (change === 'append') context.chat.push({ mes: 'new floor', is_user: false });
        if (change === 'clone') context.chat = structuredClone(context.chat);
        if (change === 'saving') saving = true;
        if (change === 'switch') context.chatId = 'another';
        if (change === 'stop') controller.abort();
    };
    const host = entry(['commitMemoryPrompt'], {
        getContext: () => context, messageSources, throwIfSignalAborted, createAbortError, commitIfSignalActive,
        isStorySummaryConsumableForCurrentChat: () => !saving,
        isStorySummaryEnabledForCurrentChat: () => true,
        recallReuse: { adopt: noop }, performance, lastRecallLogText: '',
        formatRecallDiagnostics: () => 'report', postToFrame: noop, xbLog: { info: noop }, MODULE_ID: 'summary',
        extension_prompt_types: { IN_CHAT: 1 },
        extension_prompts: prompts, EXT_PROMPT_KEY: 'memory',
        claimWarningCooldown: () => true, RECALL_ADVISORY_COOLDOWN_MS: 0,
        executeSlashCommand: async () => { if (phase === 'during-notice') mutate(); },
    });
    if (phase === 'before-commit') mutate();
    if (['switch', 'stop'].includes(change)) {
        await assert.rejects(host.commitMemoryPrompt(prepared, controller.signal), { name: 'AbortError' });
        assert.equal(prompts.memory, undefined);
    } else {
        const result = await host.commitMemoryPrompt(prepared, controller.signal);
        assert.equal(result.text, prepared.text);
        assert.equal(prompts.memory.value, prepared.text);
        assert.equal(prompts.memory.depth, prepared.depth);
    }
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
            ensureCurrentSources: async () => { throw Object.assign(new Error('unconfirmed'), { code: 'metadata_unconfirmed' }); },
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
