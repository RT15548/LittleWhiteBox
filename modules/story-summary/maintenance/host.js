import { getContext } from '../../../../../../extensions.js';
import { getSummaryStore } from '../data/store.js';
import { commitSummaryMemory, getMemoryCommitState, assertMemoryWritable, readPublishedSummaryMemory, waitForMemoryCommit } from '../data/memory-commit.js';
import { getSummaryPanelConfig } from '../data/config.js';
import { getStateAtoms, getL0Index, deleteStateVectorsByIds } from '../vector/storage/state-store.js';
import { deleteEventVectorsByIds } from '../vector/storage/chunk-store.js';
import { clearRecallRuntime } from '../vector/runtime/runtime.js';
import { runVectorWriteTask, VECTOR_WRITE_SCOPES, cancelEmbeddingWriteTasks } from '../vector/runtime/maintenance-coordinator.js';
import { createMemorySession } from './session.js';
import { commitMemorySession } from './commit.js';
import { createSharedMemoryAgent, runMemoryAgent } from './runner.js';
import { createMemoryScheduler } from './scheduler.js';
import { projectMaintenanceReceipts, maintenanceHistoryImpact } from './history.js';
import { registerMemoryMaintenance } from './notification.js';
import { inspectMaintenanceIndexes, repairMaintenanceIndexes } from './indexes.js';
import { requireMemory } from './errors.js';
import { presentMaintenanceReceipt } from './presentation.js';
import { readMaintenanceSource } from './source-view.js';
import { maintenanceRanges } from './ranges.js';

export function createMemoryMaintenanceHost({ canRun, invalidateRecall, refreshSummary, changed }) {
    let unregister = null;
    const read = () => {
        const context = getContext();
        const store = getSummaryStore();
        return { chatId: context.chatId, chat: context.chat, store, json: store?.json,
            cutoff: store?.lastSummarizedMesId, atoms: getStateAtoms(), l0Index: getL0Index() };
    };
    const scheduler = createMemoryScheduler({
        enabled: () => canRun() && getSummaryPanelConfig().memoryMaintenanceEnabled,
        changed,
        async run(task, signal, phase) {
            requireMemory(canRun(), 'no_boundary');
            const current = read();
            requireMemory(current.chatId === task.chatId && current.cutoff === task.cutoff && current.cutoff >= 0, 'conflict');
            const batch = current.store.summaryHistory.find(entry => entry.endMesId === task.cutoff);
            const filterRules = batch?.policy ? batch.policy.filterRules : getSummaryPanelConfig().textFilterRules;
            const session = createMemorySession({ ...current, ...task, filterRules });
            const readCurrent = async () => {
                await waitForMemoryCommit(signal);
                assertMemoryWritable(task.chatId);
                requireMemory(canRun(), 'no_boundary');
                return read();
            };
            const agent = await createSharedMemoryAgent();
            let index = { status: 'ready' };
            let latest = null;
            const save = async (edit, final = false) => {
                // Cancellation must not wait for, or compete with, another owner's save.
                if (final && signal.aborted && getMemoryCommitState() === 'saving') return null;
                const committed = await runVectorWriteTask({ chatId: task.chatId, kind: 'memory-maintenance-commit', scope: VECTOR_WRITE_SCOPES.CONSISTENCY }, async () => {
                    if (final && signal.aborted && getMemoryCommitState() === 'saving') return null;
                    if (!signal.aborted) await readCurrent();
                    return commitMemorySession(session, edit, {
                        read,
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
                if (getContext().chatId === task.chatId) {
                    invalidateRecall();
                    refreshSummary(committed.impact);
                }
                if (final) return { ...committed, current: savedCurrent };
                phase('indexing', { runId: edit.runId, saved: session.operations.length + committed.receipt.operations.length });
                try {
                    const repaired = await repairMaintenanceIndexes(task.chatId, committed.impact);
                    if (index.status !== 'pending') index = repaired;
                } catch (error) { index = { status: 'pending', code: error.code || 'index_failed' }; }
                return { ...committed, current: savedCurrent };
            };
            const result = await runMemoryAgent(session, { ...agent, signal,
                readCurrent,
                onProgress: progress => phase('running', progress),
                onSave: edit => save(edit),
                onFinish: edit => save(edit, true),
            });
            return { ...latest, ...result, index };
        },
    });
    return {
        start() {
            if (!unregister) unregister = registerMemoryMaintenance(batch => scheduler.submitted(batch));
        },
        stop() { scheduler.cancel(); unregister?.(); unregister = null; },
        cancel: () => scheduler.cancel(),
        async results(offset = 0) {
            const chatId = getContext().chatId;
            getSummaryStore();
            const published = readPublishedSummaryMemory();
            const store = published.storySummary;
            const page = projectMaintenanceReceipts(store, Math.max(0, Number(offset) || 0));
            page.items = page.items.map(receipt => presentMaintenanceReceipt(receipt, { json: store.json || {}, atoms: published.stateAtoms }));
            const state = scheduler.snapshot(chatId);
            if (['running', 'saving', 'indexing'].includes(state.status)) {
                for (const receipt of page.items) if (receipt.runId === state.progress?.runId) receipt.outcome = { status: state.status };
            }
            if (getMemoryCommitState() === 'unconfirmed') state.status = 'unconfirmed';
            else if (store.summaryInvalid) state.status = 'history_invalid';
            else if (store.sourceInvalidFromFloor != null || getMemoryCommitState() === 'source_invalid') state.status = 'source_invalid';
            if (state.status === 'unconfirmed') page.items = page.items.filter(receipt => !receipt.receiptIds.includes(state.receiptId));
            const impact = maintenanceHistoryImpact(store);
            let index;
            try {
                const inspection = await inspectMaintenanceIndexes(chatId, impact);
                index = { status: inspection.status, count: inspection.events.length + inspection.atoms.length };
            } catch (error) { index = { status: 'pending', code: error.code || 'index_read_failed' }; }
            return { ...page, state, index, chatId, ranges: maintenanceRanges(store.summaryHistory || [], store.lastSummarizedMesId ?? -1) };
        },
        source(request) {
            const context = getContext();
            return readMaintenanceSource({ chatId: context.chatId, chat: context.chat,
                store: readPublishedSummaryMemory().storySummary }, request);
        },
        async repairIndexes() {
            assertMemoryWritable();
            requireMemory(canRun(), 'no_boundary');
            const current = read();
            const impact = maintenanceHistoryImpact(current.store);
            return repairMaintenanceIndexes(current.chatId, impact);
        },
    };
}
