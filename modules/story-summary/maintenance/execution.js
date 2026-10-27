import { commitSummaryMemory, getMemoryCommitState, assertMemoryWritable, waitForMemoryCommit, getPublishedSummaryMemory } from '../data/memory-commit.js';
import { MetadataConfirmationError } from '../data/metadata-confirmation.js';
import { deleteStateVectorsByIds } from '../vector/storage/state-store.js';
import { deleteEventVectorsByIds } from '../vector/storage/chunk-store.js';
import { clearRecallRuntime } from '../vector/runtime/runtime.js';
import { runVectorWriteTask, VECTOR_WRITE_SCOPES, cancelEmbeddingWriteTasks } from '../vector/runtime/maintenance-coordinator.js';
import { createMemorySession } from './session.js';
import { commitMemorySession, publishedMaintenanceCommit } from './commit.js';
import { createSharedMemoryAgent, runMemoryAgent, memoryRunId } from './runner.js';
import { repairMaintenanceIndexes } from './indexes.js';
import { requireMemory } from './errors.js';
import { memoryRunError } from './run-feedback.js';

export function hasMaintenanceBoundary(current) {
    const history = current.store?.summaryHistory;
    return !current.store?.summaryInvalid && Number.isInteger(current.cutoff) && current.cutoff >= 0
        && Array.isArray(history) && history.at(-1)?.endMesId === current.cutoff;
}

/** The host task owns the draft and final save, independently of the iframe. */
export async function executeMemoryTask(task, {
    read, enabled, automaticEnabled, filterRules: currentFilterRules, summaryStyle, invalidateRecall, refreshSummary,
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
        requireMemory(current.json && typeof current.json === 'object', 'no_boundary');
        requireMemory(Number.isInteger(current.cutoff) && current.cutoff >= 0, 'no_boundary');
        requireMemory(current.cutoff >= task.cutoff, 'conflict');
        const batches = current.store.summaryHistory;
        requireMemory(Array.isArray(batches) && batches.some(entry => entry.endMesId === task.cutoff)
            && batches.at(-1)?.endMesId === current.cutoff, 'invalid_history');
        return current;
    };
    const waitWritable = async (final = false) => {
        do { await waitForMemoryCommit(signal); } while (getMemoryCommitState() === 'saving');
        assertMemoryWritable(task.chatId);
        return readTask(final);
    };
    // Reads during recovery use confirmed memory, not the installed but unconfirmed save.
    const readCurrent = async () => {
        if (getMemoryCommitState() === 'saving') await waitForMemoryCommit(signal);
        const current = readTask();
        const published = getPublishedSummaryMemory();
        return { ...current, store: published.storySummary, json: published.storySummary.json,
            atoms: published.stateAtoms, l0Index: published.l0Index, cutoff: published.storySummary.lastSummarizedMesId };
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
        current = await waitWritable();
        requireMemory(current.cutoff === task.cutoff, 'conflict');
    }
    const canMaintain = enabled() && hasMaintenanceBoundary(current) && getMemoryCommitState() !== 'unconfirmed';
    const batch = canMaintain ? current.store.summaryHistory.find(entry => entry.endMesId === task.cutoff) : null;
    const session = canMaintain ? createMemorySession({ ...current, ...task,
        filterRules: batch?.policy ? batch.policy.filterRules : currentFilterRules() }) : null;
    owner = current.store;
    let index = { status: 'ready' }, latest = null, prepared = null, saveError = null;
    async function publishResult(committed, runId) {
        if (latest === committed) return committed;
        latest = committed;
        try {
            if (read().identity === identity) { invalidateRecall(); refreshSummary(committed.impact); }
            if (signal?.aborted || read().identity !== identity) {
                index = { status: 'pending', code: 'cancelled' };
                return committed;
            }
            if (committed.impact.summary || committed.impact.atomIds.length) {
                phase('indexing', { runId, saved: committed.receipts.flatMap(receipt => receipt.operations).length });
                try {
                    index = await repairMaintenanceIndexes(task.chatId, committed.impact,
                        { signal, operationId: `memory-maintenance-index:${runId}` });
                } catch (error) { index = { status: 'pending', code: error.code || 'index_failed' }; }
            }
            return committed;
        } catch (error) {
            if (committed.impact.summary || committed.impact.atomIds.length) index = { status: 'pending', code: 'index_failed' };
            throw Object.assign(error, { code: 'memory_refresh_failed', confirmed: true, commitResult: committed });
        }
    }
    const save = async edit => {
        try {
            const committed = await runVectorWriteTask({ chatId: task.chatId, kind: 'memory-maintenance-commit', scope: VECTOR_WRITE_SCOPES.CONSISTENCY }, async () => {
                readTask(true); // Chat switches discard drafts even when the request was stopped.
                requireMemory(!(signal?.aborted && getMemoryCommitState() === 'saving'), 'cancelled');
                if (!signal?.aborted) await waitWritable(true);
                return commitMemorySession(session, edit, {
                    read: () => readTask(true),
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
                });
            });
            requireMemory(committed, 'cancelled');
            prepared = committed;
            saveError = null;
            return publishResult(committed, edit.runId);
        } catch (error) {
            saveError = error;
            prepared = error.commitResult || null;
            throw error;
        }
    };
    const applyConfirmationProof = () => {
        if (saveError?.confirmation?.state === 'not_saved') saveError = new MetadataConfirmationError('metadata_not_saved', false, saveError);
    };
    const recover = async edit => {
        assertIdentity();
        applyConfirmationProof();
        requireMemory(saveError, 'save_unavailable');
        const assertConfirmed = condition => {
            if (condition) return;
            saveError.uncertain = true;
            throw saveError;
        };
        if (edit.action === 'retry') {
            requireMemory(!saveError.uncertain, 'save_retry_unconfirmed');
            return { ...await save(edit), state: 'confirmed' };
        }
        if (!saveError.uncertain) return { state: 'not_saved', error: memoryRunError(saveError, agent.config) };
        phase('saving', { runId: edit.runId, action: 'checking_save', saved: session.savedCount, staged: session.stagedCount });
        try { await waitForMemoryCommit(signal); }
        catch (error) {
            if (error.code !== 'metadata_not_saved') error.uncertain = true;
            error.confirmation ||= saveError.confirmation;
            saveError = error;
            applyConfirmationProof();
            throw saveError;
        }
        applyConfirmationProof();
        if (!saveError.uncertain) return { state: 'not_saved', error: memoryRunError(saveError, agent.config) };
        assertIdentity();
        assertConfirmed(getMemoryCommitState() !== 'unconfirmed');
        const published = getPublishedSummaryMemory();
        const ids = new Set((published.storySummary.summaryHistory || []).flatMap(batch => (batch.maintenance || []).map(receipt => receipt.id)));
        assertConfirmed(prepared && prepared.receipts.every(receipt => ids.has(receipt.id)));
        prepared = publishedMaintenanceCommit(prepared, published);
        saveError = null;
        return { ...await publishResult(prepared, edit.runId), state: 'confirmed' };
    };
    const runId = memoryRunId();
    let agent;
    try { agent = await createSharedMemoryAgent(); }
    catch (error) {
        if (mode === 'auto' && session && !signal?.aborted) {
            session.conclude({ status: 'failed', code: error.code || 'agent_failed', error: { ...memoryRunError(error), stage: 'setup' } });
            await save({ runId, calls: [], mode });
        }
        throw error;
    }
    assertIdentity();
    const result = await runMemoryAgent(session, { ...agent, signal, mode, question, history, runId,
        summaryStyle: summaryStyle(),
        readMaintenance: async args => {
            assertIdentity();
            let saveState;
            // A later diagnostic-only question has no draft of its own, but can
            // still inspect the original owner's pending save rather than merely
            // repeating the cached unconfirmed flag.
            if (!saveError && getMemoryCommitState() === 'unconfirmed') {
                try { await waitForMemoryCommit(signal); saveState = { state: 'confirmed' }; }
                catch (error) { saveState = { state: error.code === 'metadata_not_saved' && !error.uncertain ? 'not_saved' : 'unknown', error: memoryRunError(error, agent.config) }; }
                assertIdentity();
            }
            return { ...await readMaintenance(args), ...(saveState ? { saveState } : {}) };
        },
        readCurrent, onCall, onStream, onContext,
        onProgress: progress => { phase('running', progress); onProgress?.(progress); },
        onFinish: save, onRecover: recover,
    });
    return { ...latest, ...result, index };
}
