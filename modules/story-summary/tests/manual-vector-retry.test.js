import assert from 'node:assert/strict';
import test from 'node:test';
import { entry } from './helpers/story-summary-entry.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { classifyVectorRecoveryFailure, mergeVectorRecoveryFailures } from '../vector/integrity-recovery.js';
import { buildVectorIntegrityIssues } from '../vector/integrity-policy.js';

// Exercise both UI routing and the real manual repair orchestration. Boundaries
// provide selected gaps and paid outcomes; no model or live cache is accessed.
function fixture({ failedPhase = null, preparationError = null, mismatch = false, busy = false, disabled = false, switchOwner = false, switchDuringMeta = false } = {}) {
    const context = { chatId: 'same-name', owner: 'alice', chat: [{ mes: 'Saved source' }] };
    const calls = { stages: [], notices: [], frames: [], globalResets: 0, repairs: 0, snapshots: 0 };
    const config = { enabled: !disabled };
    const remaining = new Set(['L1', 'L0', 'L2']);
    const blocked = new Set(remaining);
    let held = busy;
    const classify = classifyVectorRecoveryFailure;
    const run = async (phase, options) => {
        calls.stages.push({ phase, retry: options.retryFailed });
        if (!remaining.has(phase)) return { success: true, repaired: 0 };
        if (options.retryFailed) blocked.delete(phase);
        if (blocked.has(phase)) throw new Error('unselected failure remains blocked');
        if (switchOwner) context.owner = 'bob';
        if (failedPhase === phase) {
            blocked.add(phase);
            return { success: false, code: 'embedding_http_failed', httpStatus: 401 };
        }
        remaining.delete(phase);
        calls.repairs++;
        return { success: true, repaired: 1 };
    };
    const boundary = entry(['vectorRecoveryFailure', 'handleFrameMessage', 'handleGenerateVectors', 'repairVectorsNow',
        'reportVectorRepairResult', 'repairVectorLayers', 'sendMemoryMaintenanceResults'], {
        structuredClone, getContext: () => context, getChatIdentity: value => value.owner,
        getVectorConfig: () => config, getEngineFingerprint: () => 'current',
        isChatStale: id => id !== context.chatId || context.owner !== 'alice',
        guard: { isAnyRunning: () => held, acquire: () => { held = true; return () => { held = false; }; } },
        ensureCurrentSources: () => preparationError ? Promise.reject(preparationError) : Promise.resolve(),
        runVectorGenerationTask: async (options, callback) => { await options.ready; return callback({}); },
        isVectorWriteSessionCurrent: () => switchDuringMeta || context.owner === 'alice',
        VECTOR_WRITE_SCOPES: { EMBEDDING: 'embedding' }, VECTOR_GENERATION_OPERATION: 'fixture',
        getMeta: async () => {
            if (switchDuringMeta) context.owner = 'bob';
            return { fingerprint: mismatch ? 'other' : 'current' };
        },
        getStateAtoms: () => [], getSummaryStore: () => ({ json: { events: [] } }), validateCurrentSources() {},
        repairMissingChunks: options => run('L1', options),
        vectorizeMissingStateAtoms: (_id, _progress, options) => run('L0', options),
        repairMissingEventVectorsNow: (_id, _session, _progress, options) => run('L2', options),
        retryStoredEmbeddings: () => { calls.globalResets++; },
        addChunkDocuments() {}, scheduleLexicalWarmup() {},
        classifyVectorRecoveryFailure: classify, mergeVectorRecoveryFailures, SUMMARY_FEEDBACK_COPY,
        shouldNotifyMemoryFailure: () => true,
        executeSlashCommand: async value => { calls.notices.push(value); },
        postToFrame: value => { calls.frames.push(value); },
        sendVectorStatsToFrame: async () => { calls.snapshots++; }, publishVectorIntegrity() {},
        memoryMaintenance: { chat: { get identity() { return context.owner; } },
            results: async () => ({ chatId: context.chatId, index: { status: 'ready', count: 0 }, state: { status: 'idle' }, items: [] }) },
        document: { getElementById: () => ({}) }, isTrustedMessage: () => true,
        xbLog: { error() {}, warn() {} }, MODULE_ID: 'manual-retry-fixture',
    });
    return { boundary, calls, remaining, blocked, context };
}
const click = f => f.boundary.handleFrameMessage({ data: { type: 'MEMORY_MAINTENANCE_REPAIR' } });
const maintenanceFrames = f => f.calls.frames.filter(frame => frame.type === 'MEMORY_MAINTENANCE_RESULTS');

test('maintenance retry repairs all three current-chat layers immediately and stays silent on success', async () => {
    const f = fixture();
    await click(f);
    assert.deepEqual(f.calls.stages, ['L1', 'L0', 'L2'].map(phase => ({ phase, retry: true })));
    assert.equal(f.calls.repairs, 3);
    assert.equal(f.calls.globalResets, 0);
    assert.equal(f.remaining.size, 0);
    assert.deepEqual(f.calls.notices, []);
    assert.equal(maintenanceFrames(f).at(-1).payload.index.status, 'ready');
    await click(f);
    assert.equal(f.calls.repairs, 3);
});

test('a failed first layer leaves unattempted layers blocked and reports the actual HTTP cause in the panel', async () => {
    const f = fixture({ failedPhase: 'L1' });
    await click(f);
    assert.deepEqual(f.calls.stages, [{ phase: 'L1', retry: true }]);
    assert.equal(f.calls.globalResets, 0);
    assert.deepEqual([...f.blocked].sort(), ['L0', 'L1', 'L2']);
    const result = maintenanceFrames(f).at(-1).payload.index;
    assert.equal(result.status, 'pending');
    assert.equal(result.count, undefined); // Maintenance-only counts cannot describe all-chat failure.
    assert.deepEqual({ ...result.failure }, { reason: 'credentials', httpStatus: 401 });
    assert.equal(f.calls.notices.length, 1);
    assert.equal(f.calls.notices[0], `/echo severity=warning ${SUMMARY_FEEDBACK_COPY.vectorIntegrity.manualFailure(result.failure)}`);
    await f.boundary.sendMemoryMaintenanceResults();
    assert.equal(maintenanceFrames(f).at(-1).payload.index.failure.reason, 'credentials');
});

test('an unrecognized preparation error is visible without clearing any failed request', async () => {
    const f = fixture({ preparationError: new Error('private internal text') });
    await click(f);
    assert.equal(f.calls.globalResets, 0);
    assert.equal(f.calls.stages.length, 0);
    assert.equal(maintenanceFrames(f).at(-1).payload.index.failure.reason, 'unknown');
    assert.equal(f.calls.notices[0], `/echo severity=warning ${SUMMARY_FEEDBACK_COPY.vectorIntegrity.manualFailure({ reason: 'unknown' })}`);
});

for (const mode of ['busy', 'disabled', 'mismatch']) test(`${mode} cannot authorize any retry and still refreshes the maintenance button`, async () => {
    const f = fixture({ [mode]: true });
    await click(f);
    assert.equal(f.calls.stages.length, 0);
    assert.equal(f.calls.globalResets, 0);
    assert.equal(f.blocked.size, 3);
    assert.equal(maintenanceFrames(f).length, 1);
    assert.equal(f.calls.notices.length, 1);
});

test('switching same-filename owner during work cannot publish completion or errors to the new owner', async () => {
    const f = fixture({ switchOwner: true });
    await click(f);
    assert.deepEqual(f.calls.stages, [{ phase: 'L1', retry: true }]);
    assert.equal(f.calls.notices.length, 0);
    assert.equal(maintenanceFrames(f).length, 0);
    assert.equal(f.calls.snapshots, 0);
});

test('same-filename owner switch during preflight cannot authorize paid work before cancellation events arrive', async () => {
    const f = fixture({ switchDuringMeta: true });
    await click(f);
    assert.equal(f.calls.stages.length, 0);
    assert.equal(f.blocked.size, 3);
    assert.equal(f.calls.notices.length, 0);
    assert.equal(maintenanceFrames(f).length, 0);
});

test('read-only integrity refresh retains a preparation failure while any layer still has a gap', () => {
    const issues = buildVectorIntegrityIssues({ chunkFloorGap: 1,
        recoveryFailures: [{ phase: 'all', result: { code: 'vector_preparation_failed', error: new Error('unknown') } }] });
    assert.equal(issues.length, 1);
    assert.equal(issues[0].reason, 'unknown');
    assert.equal(issues[0].action, 'resolve_recovery');
});

for (const [error, expected] of [
    [{ code: 'fingerprint_mismatch' }, 'model_changed'],
    [{ code: 'source_invalid' }, 'source_invalid'],
    [{ code: 'index_read_failed' }, 'storage'],
]) test(`typed ${error.code} inspection failure keeps its domain classification`, () => {
    assert.deepEqual(classifyVectorRecoveryFailure({ error }), { reason: expected });
});
