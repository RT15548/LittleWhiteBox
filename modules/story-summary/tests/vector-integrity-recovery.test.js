import assert from 'node:assert/strict';
import { test } from 'node:test';
import { entry } from './helpers/story-summary-entry.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { buildVectorIntegrityIssues } from '../vector/integrity-policy.js';
import { planVectorRecovery, classifyVectorRecoveryFailure, mergeVectorRecoveryFailures } from '../vector/integrity-recovery.js';
import { validateCurrentSources } from '../vector/storage/current-source-validation.js';
import * as coordinator from '../vector/runtime/maintenance-coordinator.js';

// Acceptance: an automatic inspection buys only actual gaps, repairs each chosen
// layer once, then verifies after releasing the real generation/write queues.
// Host sources/storage and model responses are boundaries; decisions and the
// production entrypoints run unchanged. No network or esbuild is needed.
function recoveryFixture({ missingL0 = 1, obsoleteL0 = 0, missingL1 = 0, missingL2 = 0,
    cacheMode = 'inconsistent', sourceInvalid = false, fingerprintMismatch = false,
    failPhase = null, failure = { code: 'embedding_http_failed', httpStatus: 401 },
    switchOnEmbedding = false, failVerification = false, invalidateQueuedSource = false, onRead = null } = {}) {
    const chatId = 'recovery-chat';
    const context = { chatId, chat: [{ mes: 'Current authoritative source.' }] };
    const config = { enabled: true, model: 'current-model' };
    const sources = { atoms: [{ atomId: 'atom-0-0', floor: 0, semantic: 'Current saved anchor.', edges: [] }],
        events: [{ id: 'event-1', title: 'Saved event', summary: 'Current event source.' }] };
    const state = { missingL0, obsoleteL0, missingL1, missingL2, failPhase, failure, sourceInvalid,
        live: true, metadataPending: false, tasksFinished: 0, scans: 0, verificationFailed: false };
    const calls = { tasks: [], stages: [], embeddings: [], writes: [], published: [], scheduled: [], snapshots: [], plans: [], sourceReads: 0 };
    const running = new Set();
    const guard = {
        isAnyRunning: (...names) => names.some(name => running.has(name)),
        acquire(name) {
            if (running.has(name)) return null;
            running.add(name);
            return () => running.delete(name);
        },
    };
    const isLive = target => target === chatId && context.chatId === target && config.enabled && state.live;
    const hasGap = () => state.missingL0 + state.obsoleteL0 + state.missingL1 + state.missingL2 > 0;
    const read = async (boundary, value) => { await onRead?.(boundary); return value(); };
    async function repair(phase, target, options) {
        calls.stages.push(phase);
        const key = phase === 'L0' ? 'missingL0' : phase === 'L1' ? 'missingL1' : 'missingL2';
        const missing = state[key];
        const obsolete = phase === 'L0' ? state.obsoleteL0 : 0;
        if (!missing && !obsolete && !(phase === 'L1' && state.metadataPending)) return { success: true, repaired: 0 };
        const cancelled = () => !isLive(target) || options.signal?.aborted || options.shouldCancel?.() === true;
        if (cancelled()) return { cancelled: true };
        if (missing) {
            calls.embeddings.push({ phase, target, count: missing });
            if (switchOnEmbedding) {
                context.chatId = 'different-chat';
                coordinator.cancelEmbeddingWriteTasks('fixture chat changed');
            }
            if (cancelled()) return { cancelled: true };
            if (phase === state.failPhase && state.failure.code !== 'metadata_write_failed') {
                return { success: false, repaired: 0, ...state.failure };
            }
        }
        await options.commit(() => {
            if (cancelled()) return;
            calls.writes.push({ phase, target, count: missing, obsolete });
            state[key] = 0;
            if (phase === 'L0') state.obsoleteL0 = 0;
        });
        if (phase === 'L1') {
            state.metadataPending = phase === state.failPhase && state.failure.code === 'metadata_write_failed';
            if (state.metadataPending) return { success: false, repaired: missing, ...state.failure };
        }
        return { success: true, repaired: missing };
    }
    const api = entry(['vectorRecoveryFailure', 'integrityReadVersion', 'integrityLifecycleVersion', 'checkVectorIntegrity', 'refreshVectorIntegrity',
        'repairVectorCacheForCurrentChat', 'repairVectorLayers', 'clearDeferredBackgroundTasks'], {
        structuredClone, guard, getContext: () => context, getVectorConfig: () => config,
        getChatIdentity: value => value.chatId,
        getEngineFingerprint: value => value.model, isChatStale: target => !isLive(target),
        isBackgroundWorkLive: isLive, isHostGenerating: () => false,
        getMemoryCommitState: () => 'confirmed', ensureCurrentSources: async () => {
            calls.sourceReads++;
            await read('sources', () => undefined);
        },
        pendingVectorMaintenanceByChat: new Map(), deferVectorIntegrityUntilMaintenance: () => false,
        clearTimeout() {}, lexicalWarmupTimer: null, vectorIntegrityTimer: null, vectorIntegrityRetryDelayMs: 0,
        vectorMaintenanceScheduler: { clear() {} }, clearVectorMaintenance() {}, autoSummaryTimers: new Map(),
        captureMaintenanceSnapshot: target => {
            const snapshot = coordinator.captureMaintenanceSnapshot(target);
            calls.snapshots.push({ available: Boolean(snapshot), held: guard.isAnyRunning('vector'), finished: state.tasksFinished });
            return snapshot;
        },
        isMaintenanceSnapshotCurrent: coordinator.isMaintenanceSnapshotCurrent,
        getSummaryStore: () => ({ json: { events: sources.events } }), getStateAtoms: () => sources.atoms,
        getAnchorStats: () => read('anchors', () => ({ incomplete: 0 })),
        getMeta: () => read('meta', () => ({ fingerprint: fingerprintMismatch ? 'previous-model' : config.model })),
        getL0VectorBuildStatus: () => read('state', () => ({ success: true, missing: state.missingL0,
            missingFloors: state.missingL0 ? 1 : 0, obsoleteCount: state.obsoleteL0 })),
        collectMissingEventVectorPairs: () => read('events', () => Array.from({ length: state.missingL2 }, (_, index) => ({ id: `event-${index}` }))),
        checkVectorCacheConsistency: async options => {
            state.scans++;
            assert.equal(options.isCurrent(), true);
            await read('cache', () => undefined);
            if (!options.isCurrent()) return { status: 'deferred' };
            if (failVerification && state.tasksFinished && !state.verificationFailed) {
                state.verificationFailed = true;
                throw new Error('fixture verification storage read failed');
            }
            if (state.sourceInvalid) return { status: 'inconsistent', sourceInvalid: true, repairable: false };
            if (cacheMode === 'inconsistent' && hasGap()) return { status: 'inconsistent', repairable: true };
            return { status: state.missingL1 ? 'incomplete' : 'consistent', missingChunkFloors: state.missingL1 ? [0] : [] };
        },
        planVectorRecovery: options => {
            calls.plans.push({ readOnly: options.readOnly, allowChunkRepair: options.allowChunkRepair,
                allowStateRepair: options.allowStateRepair, allowEventRepair: options.allowEventRepair });
            return planVectorRecovery(options);
        },
        buildVectorIntegrityIssues, mergeVectorRecoveryFailures, validateCurrentSources,
        publishVectorIntegrity: (status, issues = []) => calls.published.push({ status, issues: structuredClone(issues), target: context.chatId }),
        scheduleVectorIntegrityCheck: (delay, options) => calls.scheduled.push({ delay, options }),
        BACKGROUND_VISIBLE_GRACE_MS: 6000, SUMMARY_FEEDBACK_COPY,
        VECTOR_WRITE_SCOPES: coordinator.VECTOR_WRITE_SCOPES,
        isVectorWriteSessionCurrent: coordinator.isVectorWriteSessionCurrent,
        runVectorGenerationTask: (options, run) => coordinator.runVectorGenerationTask(options, async session => {
            calls.tasks.push({ target: options.chatId });
            if (invalidateQueuedSource) {
                sources.atoms[0].floor = context.chat.length;
                state.sourceInvalid = true;
            }
            try { return await run(session); }
            finally { state.tasksFinished++; }
        }),
        repairMissingChunks: options => repair('L1', options.chatId, options),
        vectorizeMissingStateAtoms: (target, _progress, options) => repair('L0', target, options),
        repairMissingEventVectorsNow: (target, session) => repair('L2', target, session),
        addChunkDocuments() {}, scheduleLexicalWarmup() {},
        xbLog: { warn() {} }, MODULE_ID: 'recovery-fixture',
    });
    return { api, calls, state, context, config };
}

function assertVerificationAfterRelease(fixture) {
    assert.deepEqual(fixture.calls.snapshots, [
        { available: true, held: false, finished: 0 },
        { available: true, held: false, finished: 1 },
    ]);
    const verify = fixture.calls.plans[1];
    assert.equal(verify.allowChunkRepair, false);
    assert.equal(verify.allowStateRepair, false);
    assert.equal(verify.allowEventRepair, false);
}

const defaultPlan = overrides => planVectorRecovery({ cacheCheck: { status: 'consistent' },
    l0Status: { success: true, missing: 0, obsoleteCount: 0 }, ...overrides });

// Cancelling a paid operation must not buy its remaining work via the status
// refresh. Cost: unintended API spending. A later manual repair still works.
for (const checkBeforeSettlement of [false, true]) {
    test(`cancel refresh never starts paid recovery (operation still settling: ${checkBeforeSettlement})`, async () => {
        const f = recoveryFixture({ missingL0: 1, missingL1: 1, missingL2: 1 });
        let scheduled, checking, entered, finish;
        const started = new Promise(resolve => { entered = resolve; });
        const settling = new Promise(resolve => { finish = resolve; });
        const route = entry(['handleFrameMessage', 'scheduleVectorIntegrityCheck'], {
            document: { getElementById: () => ({}) }, isTrustedMessage: () => true,
            cancelVectorWriteOperation: coordinator.cancelVectorWriteOperation,
            VECTOR_GENERATION_OPERATION: 'vector-generation',
            vectorIntegrityTimer: null, integrityLifecycleVersion: 0, vectorIntegrityRetryDelayMs: 0,
            getContext: () => f.context, isChatStale: () => false, getBackgroundQuietWaitMs: () => 0,
            clearTimeout() {}, setTimeout(callback) { scheduled = callback; return 1; },
            checkVectorIntegrity: options => (checking = f.api.checkVectorIntegrity(options)),
        });
        const release = f.api.guard.acquire('vector');
        let cancelled = false;
        const manual = coordinator.runVectorGenerationTask({ chatId: f.context.chatId, operationId: 'vector-generation' }, async session => {
            entered();
            await new Promise(resolve => session.signal.addEventListener('abort', () => {
                cancelled = true;
                resolve();
            }, { once: true }));
            await settling;
        }).finally(release);
        try {
            await started;
            await route.handleFrameMessage({ data: { type: 'VECTOR_CANCEL_GENERATE' } });
            assert.equal(cancelled, true);
            if (!checkBeforeSettlement) { finish(); await manual; }
            scheduled();
            await checking;
            assert.deepEqual(f.calls.embeddings, []);
            assert.deepEqual(f.calls.writes, []);
            assert.deepEqual(f.calls.scheduled, []);
        } finally {
            finish();
            await manual;
        }
        await coordinator.runVectorGenerationTask({ chatId: f.context.chatId, operationId: 'vector-generation' }, session =>
            f.api.repairVectorLayers(f.config, f.context.chatId, session, { retryFailed: true }));
        assert.deepEqual(f.calls.embeddings.map(call => call.phase), ['L1', 'L0', 'L2']);
    });
}

test('recovery planning separates display thresholds, orphan cleanup, and individual layer permissions', () => {
    for (const l0Status of [{ success: true, missing: 1, obsoleteCount: 0 }, { success: true, missing: 0, obsoleteCount: 1 }]) {
        assert.deepEqual(defaultPlan({ l0Status }), ['L0']);
        assert.deepEqual(defaultPlan({ l0Status, allowStateRepair: false }), []);
    }
    const cacheCheck = { status: 'inconsistent', repairable: true };
    assert.deepEqual(defaultPlan({ cacheCheck }), ['L1', 'L0', 'L2']);
    assert.deepEqual(defaultPlan({ cacheCheck, allowStateRepair: false }), ['L1', 'L2']);
    assert.deepEqual(defaultPlan({ cacheCheck, allowChunkRepair: false, allowEventRepair: false }), ['L0']);
    assert.deepEqual(defaultPlan({ cacheCheck, allowChunkRepair: false, allowStateRepair: false, allowEventRepair: false }), []);
});

test('read-only, changed models, invalid sources and unrepairable caches never select paid recovery', () => {
    const cacheCheck = { status: 'inconsistent', repairable: true };
    for (const options of [{ readOnly: true }, { fingerprintMismatch: true },
        { cacheCheck: { ...cacheCheck, sourceInvalid: true } },
        { cacheCheck: { status: 'inconsistent', repairable: false } }, { cacheCheck: { status: 'deferred' } }]) {
        assert.deepEqual(defaultPlan({ cacheCheck, ...options }), []);
    }
});

for (const [result, expected] of [
    [{ code: 'embedding_config_missing' }, { reason: 'credentials' }],
    [{ code: 'embedding_url_invalid' }, { reason: 'endpoint' }],
    [{ code: 'embedding_http_failed', httpStatus: 401 }, { reason: 'credentials', httpStatus: 401 }],
    [{ code: 'embedding_http_failed', httpStatus: 429 }, { reason: 'quota', httpStatus: 429 }],
    [{ code: 'embedding_http_failed', httpStatus: 503 }, { reason: 'service', httpStatus: 503 }],
    [{ code: 'embedding_http_failed', httpStatus: 404 }, { reason: 'request', httpStatus: 404 }],
    [{ code: 'embedding_timeout' }, { reason: 'timeout' }],
    [{ code: 'embedding_network_failed' }, { reason: 'network' }],
    [{ code: 'invalid_embedding_response' }, { reason: 'response' }],
    [{ code: 'embedding_receipt_storage_failed' }, { reason: 'request_record' }],
    [{ error: { embeddingFailure: { kind: 'receipt_storage' } } }, { reason: 'request_record' }],
    [{ code: 'state_vector_write_failed' }, { reason: 'storage' }],
    [{ code: 'event_vector_read_failed' }, { reason: 'storage' }],
    [{ code: 'fingerprint_mismatch' }, { reason: 'model_changed' }],
]) test(`recovery classifies ${result.code}${result.httpStatus ? ` HTTP ${result.httpStatus}` : ''} without prescribing a rebuild`, () => {
    assert.deepEqual(classifyVectorRecoveryFailure(result), expected);
});

test('recovery retains a transport classification through a generic wrapper and cause', () => {
    const transport = Object.assign(new Error('fixture HTTP error'), { embeddingFailure: { kind: 'http', status: 403 } });
    const error = new Error('stage wrapper', { cause: transport });
    assert.deepEqual(classifyVectorRecoveryFailure({ code: 'repair_failed', error }), { reason: 'credentials', httpStatus: 403 });
});

test('a stale L0 cache recovers once across all layers, preserving healthy layers, then verifies ready', async () => {
    const fixture = recoveryFixture();
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.deepEqual(fixture.calls.stages, ['L1', 'L0', 'L2']);
    assert.deepEqual(fixture.calls.embeddings, [{ phase: 'L0', target: 'recovery-chat', count: 1 }]);
    assert.deepEqual(fixture.calls.writes, [{ phase: 'L0', target: 'recovery-chat', count: 1, obsolete: 0 }]);
    assert.equal(fixture.calls.published.at(-1).status, 'ready');
    assert.deepEqual(fixture.calls.scheduled, []);
    assertVerificationAfterRelease(fixture);
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, 1);
});

for (const orphanOnly of [false, true]) test(`L0 ${orphanOnly ? 'orphan cleanup' : 'single-floor vector gap'} recovers below the warning threshold`, async () => {
    const fixture = recoveryFixture({ cacheMode: 'consistent', missingL0: orphanOnly ? 0 : 1, obsoleteL0: orphanOnly ? 1 : 0 });
    await fixture.api.checkVectorIntegrity();
    assert.deepEqual(fixture.calls.stages, ['L0']);
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, orphanOnly ? 0 : 1);
    assert.equal(fixture.calls.writes.length, 1);
    assert.equal(fixture.state.obsoleteL0, 0);
    assert.equal(fixture.calls.published.at(-1).status, 'ready');
    assertVerificationAfterRelease(fixture);
});

test('one failed repair does not self-retry and subsequent panel reads retain the specific API cause', async () => {
    const fixture = recoveryFixture({ failPhase: 'L0' });
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.deepEqual(fixture.calls.stages, ['L1', 'L0']);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.deepEqual(fixture.calls.scheduled, []);
    const terminal = fixture.calls.published.at(-1);
    assert.equal(terminal.status, 'issues');
    assert.deepEqual(terminal.issues.map(({ code, reason, httpStatus, action }) => ({ code, reason, httpStatus, action })), [
        { code: 'recovery_failed', reason: 'credentials', httpStatus: 401, action: 'resolve_recovery' },
    ]);
    assertVerificationAfterRelease(fixture);
    await fixture.api.refreshVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'credentials');
});

test('read-only panel inspection never schedules or purchases repairs', async () => {
    const fixture = recoveryFixture({ missingL2: 1 });
    await fixture.api.refreshVectorIntegrity();
    assert.deepEqual(fixture.calls.tasks, []);
    assert.deepEqual(fixture.calls.stages, []);
    assert.deepEqual(fixture.calls.embeddings, []);
    assert.deepEqual(fixture.calls.writes, []);
    assert.deepEqual(fixture.calls.scheduled, []);
    assert.equal(fixture.calls.sourceReads, 0);
    assert.equal(fixture.calls.published.at(-1).status, 'issues');
});

for (const sourceInvalid of [false, true]) test(`${sourceInvalid ? 'invalid source memory' : 'a changed engine fingerprint'} cannot trigger automatic embedding`, async () => {
    const fixture = recoveryFixture({ sourceInvalid, fingerprintMismatch: !sourceInvalid });
    await fixture.api.checkVectorIntegrity();
    assert.deepEqual(fixture.calls.tasks, []);
    assert.deepEqual(fixture.calls.embeddings, []);
    assert.deepEqual(fixture.calls.writes, []);
    const issue = fixture.calls.published.at(-1).issues[0];
    assert.equal(issue.code, sourceInvalid ? 'memory_source_invalid' : 'fingerprint_mismatch');
});

test('switching chats during embedding suppresses old writes and publication into the new chat', async () => {
    const fixture = recoveryFixture({ switchOnEmbedding: true });
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.context.chatId, 'different-chat');
    assert.equal(fixture.calls.tasks.length, 1);
    assert.deepEqual(fixture.calls.writes, []);
    assert.equal(fixture.calls.published.some(item => item.target === 'different-chat'), false);
    assert.equal(fixture.calls.published.some(item => item.status === 'ready' || item.status === 'issues'), false);
    assert.deepEqual(fixture.calls.scheduled, []);
});

test('a failed earlier layer stops the pass before any later layer can spend', async () => {
    const fixture = recoveryFixture({ missingL1: 1, missingL2: 1, failPhase: 'L1', failure: { code: 'vector_write_failed' } });
    await fixture.api.checkVectorIntegrity();
    assert.deepEqual(fixture.calls.stages, ['L1']);
    assert.deepEqual(fixture.calls.embeddings.map(call => call.phase), ['L1']);
    assert.deepEqual(fixture.calls.writes, []);
    assert.equal(fixture.state.missingL0, 1);
    assert.equal(fixture.state.missingL2, 1);
    assert.equal(fixture.state.missingL1, 1);
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'storage');
    assert.equal(fixture.calls.tasks.length, 1);
    assertVerificationAfterRelease(fixture);
});

test('failure merging replaces only attempted layers, retaining unrelated evidence without mutating earlier receipts', () => {
    const l0 = { phase: 'L0', result: { code: 'embedding_http_failed', httpStatus: 401 } };
    const l1 = { phase: 'L1', result: { code: 'metadata_write_failed' } };
    const l2 = { phase: 'L2', result: { code: 'embedding_timeout' } };
    const previous = [l0, l1];
    const snapshot = structuredClone(previous);
    assert.deepEqual(mergeVectorRecoveryFailures(previous, ['L2'], [l2]), [l0, l1, l2]);
    assert.deepEqual(mergeVectorRecoveryFailures(previous, ['L1'], []), [l0]);
    const retriedL0 = { phase: 'L0', result: { code: 'embedding_timeout' } };
    assert.deepEqual(mergeVectorRecoveryFailures(previous, ['L0'], [retriedL0]), [l1, retriedL0]);
    assert.deepEqual(previous, snapshot);
});

test('metadata repair is selected even with zero vector gaps, but never during read-only verification', () => {
    assert.deepEqual(defaultPlan({ metadataFailure: true }), ['L1']);
    assert.deepEqual(defaultPlan({ metadataFailure: true, allowChunkRepair: false }), []);
    assert.deepEqual(defaultPlan({ metadataFailure: true, readOnly: true }), []);
});

test('queued repair revalidates current memory sources after the earlier inspection and before any model request', async () => {
    const fixture = recoveryFixture({ invalidateQueuedSource: true });
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.deepEqual(fixture.calls.stages, []);
    assert.deepEqual(fixture.calls.embeddings, []);
    assert.deepEqual(fixture.calls.writes, []);
    assert.equal(fixture.calls.published.at(-1).status, 'issues');
    assert.equal(fixture.calls.published.at(-1).issues[0].code, 'memory_source_invalid');
    assert.deepEqual(fixture.calls.scheduled, []);
});

test('successfully repairing another layer cannot erase a previous unattempted L0 API failure', async () => {
    const fixture = recoveryFixture({ cacheMode: 'consistent', failPhase: 'L0' });
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'credentials');
    fixture.state.missingL2 = 1;
    await fixture.api.checkVectorIntegrity({ allowStateRepair: false, allowChunkRepair: false });
    assert.equal(fixture.calls.tasks.length, 2);
    assert.deepEqual(fixture.calls.stages, ['L0', 'L2']);
    assert.deepEqual(fixture.calls.embeddings.map(call => call.phase), ['L0', 'L2']);
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'credentials');
    assert.equal(fixture.calls.published.at(-1).issues[0].httpStatus, 401);
    await fixture.api.refreshVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 2);
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'credentials');
});

test('a metadata save failure stays visible at zero gaps until a metadata-only retry actually succeeds', async () => {
    const fixture = recoveryFixture({ cacheMode: 'consistent', missingL0: 0, missingL1: 1,
        failPhase: 'L1', failure: { code: 'metadata_write_failed' } });
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.state.missingL1, 0);
    assert.equal(fixture.state.metadataPending, true);
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.equal(fixture.calls.published.at(-1).status, 'issues');
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'storage');
    await fixture.api.refreshVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.published.at(-1).issues[0].reason, 'storage');
    fixture.state.failPhase = null;
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 2);
    assert.deepEqual(fixture.calls.stages, ['L1', 'L1']);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.equal(fixture.calls.writes.at(-1).count, 0);
    assert.equal(fixture.state.metadataPending, false);
    assert.equal(fixture.calls.published.at(-1).status, 'ready');
});

for (const boundary of ['sources', 'anchors', 'meta', 'state', 'events', 'cache']) {
    for (const invalidation of ['disable', 'same-chat lifecycle']) {
        test(`${invalidation} during ${boundary} inspection never publishes or requeues a retired result`, async () => {
            let entered, release, paused = false;
            const started = new Promise(resolve => { entered = resolve; });
            const gate = new Promise(resolve => { release = resolve; });
            const fixture = recoveryFixture({ missingL0: 0, cacheMode: 'consistent', onRead: name => {
                if (name !== boundary || paused) return;
                paused = true;
                entered();
                return gate;
            } });
            const checking = fixture.api.checkVectorIntegrity();
            await started;
            if (invalidation === 'disable') {
                fixture.config.enabled = false;
                fixture.state.live = false;
            } else fixture.api.clearDeferredBackgroundTasks();
            const published = fixture.calls.published.length;
            release();
            await checking;
            assert.equal(fixture.context.chatId, 'recovery-chat');
            assert.equal(fixture.calls.published.length, published);
            assert.deepEqual(fixture.calls.scheduled, []);
            assert.deepEqual(fixture.calls.tasks, []);
            assert.deepEqual(fixture.calls.embeddings, []);
            assert.deepEqual(fixture.calls.writes, []);
        });
    }
}

test('refreshing the panel does not retire an independent background recovery inspection', async () => {
    let entered, release, paused = false;
    const started = new Promise(resolve => { entered = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    const fixture = recoveryFixture({ onRead: boundary => {
        if (boundary !== 'state' || paused) return;
        paused = true;
        entered();
        return gate;
    } });
    const background = fixture.api.checkVectorIntegrity();
    await started;
    await fixture.api.refreshVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 0);
    release();
    await background;
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.equal(fixture.state.missingL0, 0);
    assert.equal(fixture.calls.published.at(-1).status, 'ready');
    assert.deepEqual(fixture.calls.scheduled, []);
});

test('a failed verification requeues only inspection, not already attempted paid recovery', async () => {
    const fixture = recoveryFixture({ failVerification: true });
    await fixture.api.checkVectorIntegrity();
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.equal(fixture.calls.published.at(-1).status, 'unavailable');
    assert.equal(fixture.calls.scheduled.length, 1);
    const { options } = fixture.calls.scheduled[0];
    assert.equal(options.allowChunkRepair, false);
    assert.equal(options.allowStateRepair, false);
    assert.equal(options.allowEventRepair, false);
    await fixture.api.checkVectorIntegrity(options);
    assert.equal(fixture.calls.tasks.length, 1);
    assert.equal(fixture.calls.embeddings.length, 1);
    assert.equal(fixture.calls.published.at(-1).status, 'ready');
});
