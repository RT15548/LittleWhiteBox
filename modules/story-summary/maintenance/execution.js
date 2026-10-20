import { commitSummaryMemory, getMemoryCommitState, assertMemoryWritable, waitForMemoryCommit } from '../data/memory-commit.js';
import { deleteStateVectorsByIds } from '../vector/storage/state-store.js';
import { deleteEventVectorsByIds } from '../vector/storage/chunk-store.js';
import { clearRecallRuntime } from '../vector/runtime/runtime.js';
import { runVectorWriteTask, VECTOR_WRITE_SCOPES, cancelEmbeddingWriteTasks } from '../vector/runtime/maintenance-coordinator.js';
import { createMemorySession } from './session.js';
import { commitMemorySession } from './commit.js';
import { createSharedMemoryAgent, runMemoryAgent, memoryRunId } from './runner.js';
import { repairMaintenanceIndexes } from './indexes.js';
import { requireMemory } from './errors.js';
import { memoryRunError } from './run-feedback.js';

export function hasMaintenanceBoundary(current) {
    const history = current.store?.summaryHistory;
    return !current.store?.summaryInvalid && Number.isInteger(current.cutoff) && current.cutoff >= 0
        && Array.isArray(history) && history.at(-1)?.endMesId === current.cutoff;
}

/** A fresh domain session for every turn, independent of the lifetime of its UI/history. */
export async function executeMemoryTask(task, {
    read, enabled, automaticEnabled, filterRules: currentFilterRules, invalidateRecall, refreshSummary,
    signal, phase = () => {}, mode = 'auto', question, history, readMaintenance,
    onCall, onStream, onContext, onProgress,
}) {
    const identity = task.identity ?? read().identity;
    const assertIdentity = () => {
        const current = read();
        requireMemory(current.chatId === task.chatId && current.identity === identity, 'conflict');
        return current;
    };
    let owner = null;
    const readTask = (final = false) => {
        if (!final) requireMemory(mode === 'chat' ? enabled() : automaticEnabled(), 'no_boundary');
        const current = assertIdentity();
        requireMemory(!owner || current.store === owner, 'conflict');
        requireMemory(!current.store?.summaryInvalid, 'invalid_history');
        requireMemory(Number.isInteger(current.cutoff) && current.cutoff >= 0, 'no_boundary');
        requireMemory(current.cutoff >= task.cutoff, 'conflict');
        const batches = current.store.summaryHistory;
        requireMemory(Array.isArray(batches) && batches.some(entry => entry.endMesId === task.cutoff)
            && batches.at(-1)?.endMesId === current.cutoff, 'invalid_history');
        return current;
    };
    const readCurrent = async (final = false) => {
        do { await waitForMemoryCommit(signal); } while (getMemoryCommitState() === 'saving');
        assertMemoryWritable(task.chatId);
        return readTask(final);
    };
    let current;
    if (mode === 'chat') {
        current = assertIdentity();
        if (hasMaintenanceBoundary(current) && enabled() && getMemoryCommitState() === 'saving') {
            await waitForMemoryCommit(signal);
            current = assertIdentity();
        }
        task = { ...task, start: 0, cutoff: current.cutoff };
    } else {
        current = await readCurrent();
        requireMemory(current.cutoff === task.cutoff, 'conflict');
    }
    const canMaintain = enabled() && hasMaintenanceBoundary(current) && getMemoryCommitState() !== 'unconfirmed';
    const batch = canMaintain ? current.store.summaryHistory.find(entry => entry.endMesId === task.cutoff) : null;
    const session = canMaintain ? createMemorySession({ ...current, ...task,
        filterRules: batch?.policy ? batch.policy.filterRules : currentFilterRules() }) : null;
    owner = current.store;
    let index = { status: 'ready' }, latest = null;
    const save = async (edit, final = false) => {
        if (final && signal.aborted && getMemoryCommitState() === 'saving') return null;
        const committed = await runVectorWriteTask({ chatId: task.chatId, kind: 'memory-maintenance-commit', scope: VECTOR_WRITE_SCOPES.CONSISTENCY }, async () => {
            if (final && signal.aborted && getMemoryCommitState() === 'saving') return null;
            if (!signal.aborted) await readCurrent(final);
            return commitMemorySession(session, edit, {
                read: () => readTask(final),
                async commit(next, previous, impact, validate) {
                    phase('saving');
                    return commitSummaryMemory(task.chatId, next, { previous, validate, maintenanceWrite: true, invalidate: async () => {
                        if (!impact.summary && !impact.atomIds.length) return;
                        if (impact.eventIds.length || impact.atomIds.length) cancelEmbeddingWriteTasks('Memory records edited');
                        invalidateRecall();
                        if (impact.eventIds.length) await deleteEventVectorsByIds(task.chatId, impact.eventIds);
                        if (impact.atomIds.length) await deleteStateVectorsByIds(task.chatId, impact.atomIds);
                        await clearRecallRuntime(task.chatId);
                    } });
                },
            }, final ? undefined : signal);
        });
        if (!committed && final) return null;
        requireMemory(committed, 'cancelled');
        latest = committed;
        const savedCurrent = structuredClone(committed.current);
        if (read().identity === identity) { invalidateRecall(); refreshSummary(committed.impact); }
        if (final) return { ...committed, current: savedCurrent };
        phase('indexing', { runId: edit.runId, saved: session.operations.length + committed.receipt.operations.length });
        try {
            const repaired = await repairMaintenanceIndexes(task.chatId, committed.impact,
                { signal, operationId: `memory-maintenance-index:${edit.runId}` });
            if (index.status !== 'pending') index = repaired;
        } catch (error) { index = { status: 'pending', code: error.code || 'index_failed' }; }
        return { ...committed, current: savedCurrent };
    };
    const runId = memoryRunId();
    let agent;
    try { agent = await createSharedMemoryAgent(); }
    catch (error) {
        // Configuration failures also leave an inspectable automatic-run result when history is writable.
        if (mode === 'auto' && session && !signal.aborted) {
            const outcome = { status: 'failed', code: error.code || 'agent_failed', error: { ...memoryRunError(error), stage: 'setup' } };
            session.conclude(outcome);
            await save({ runId, calls: [], mode }, true);
        }
        throw error;
    }
    assertIdentity();
    const result = await runMemoryAgent(session, { ...agent, signal, mode, question, history, runId,
        readMaintenance: async args => { assertIdentity(); return readMaintenance(args); },
        readCurrent, onCall, onStream, onContext,
        onProgress: progress => { phase('running', progress); onProgress?.(progress); },
        onSave: edit => save(edit), onFinish: edit => save(edit, true),
    });
    return { ...latest, ...result, index };
}
