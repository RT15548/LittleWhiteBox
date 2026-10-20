import { getContext } from '../../../../../../extensions.js';
import { getSummaryStore } from '../data/store.js';
import { getMemoryCommitState, assertMemoryWritable, readPublishedSummaryMemory } from '../data/memory-commit.js';
import { getSummaryPanelConfig } from '../data/config.js';
import { getStateAtoms, getL0Index } from '../vector/storage/state-store.js';
import { getChatIdentity } from '../data/chat-identity.js';
import { createMemoryScheduler } from './scheduler.js';
import { projectMaintenanceReceipts, maintenanceHistoryImpact } from './history.js';
import { registerMemoryMaintenance } from './notification.js';
import { inspectMaintenanceIndexes, repairMaintenanceIndexes } from './indexes.js';
import { requireMemory } from './errors.js';
import { presentMaintenanceReceipt } from './presentation.js';
import { readMaintenanceSource } from './source-view.js';
import { maintenanceRanges, maintenanceTask } from './ranges.js';
import { executeMemoryTask, hasMaintenanceBoundary } from './execution.js';
import { readMaintenanceDiagnostics } from './diagnostics.js';
import { createMemoryChatController } from './chat-controller.js';

export function createMemoryMaintenanceHost({ isEnabled, invalidateRecall, refreshSummary, changed, chatChanged = () => {} }) {
    let unregister = null, chat = null;
    const enabled = () => isEnabled() && getSummaryPanelConfig().memoryMaintenanceEnabled;
    const read = () => {
        const context = getContext();
        const store = getSummaryStore();
        return { identity: getChatIdentity(context), chatId: context.chatId, chat: context.chat, store, json: store?.json,
            cutoff: store?.lastSummarizedMesId, atoms: getStateAtoms(), l0Index: getL0Index() };
    };
    const execute = (task, options) => executeMemoryTask(task, {
        read, enabled: isEnabled, automaticEnabled: enabled,
        filterRules: () => getSummaryPanelConfig().textFilterRules,
        invalidateRecall, refreshSummary, readMaintenance: diagnostics, ...options,
    });
    const scheduler = createMemoryScheduler({ enabled,
        changed: () => { changed(); if (chat) chatChanged(chat.snapshot()); },
        run: (task, signal, phase) => execute(task, { signal, phase }),
    });
    function diagnostics(args) {
        getSummaryStore();
        const published = readPublishedSummaryMemory();
        return readMaintenanceDiagnostics({ store: published.storySummary,
            state: scheduler.snapshot(getContext().chatId, getChatIdentity(getContext())), commitState: getMemoryCommitState(), enabled: enabled() }, args);
    }
    chat = createMemoryChatController({
        identity: () => getChatIdentity(getContext()), chatId: () => getContext().chatId,
        scheduler, execute, diagnostics,
        previewTask: () => {
            const current = read();
            return isEnabled() && hasMaintenanceBoundary(current) && getMemoryCommitState() !== 'unconfirmed'
                ? maintenanceTask(current.store.summaryHistory, current.cutoff) : null;
        },
        changed: () => { if (chat) chatChanged(chat.snapshot()); },
    });
    return {
        chat,
        start() {
            if (!unregister) unregister = registerMemoryMaintenance(batch => {
                if (batch.identity === getChatIdentity(getContext())) scheduler.submitted(batch);
            });
        },
        stop() { scheduler.cancel(); chat.reset(); unregister?.(); unregister = null; },
        reset() { scheduler.cancel(); chat.reset(); },
        cancel: () => scheduler.cancel(),
        cancelAutomatic: () => scheduler.cancelAutomatic(),
        async results(offset = 0) {
            const chatId = getContext().chatId;
            getSummaryStore();
            const published = readPublishedSummaryMemory();
            const store = published.storySummary;
            const page = projectMaintenanceReceipts(store, Math.max(0, Number(offset) || 0));
            page.items = page.items.map(receipt => presentMaintenanceReceipt(receipt, { json: store.json || {}, atoms: published.stateAtoms }));
            const state = scheduler.snapshot(chatId, getChatIdentity(getContext()));
            if (['running', 'saving', 'indexing'].includes(state.status)) {
                for (const receipt of page.items) if (receipt.runId === state.progress?.runId) receipt.outcome = { status: state.status };
            }
            if (getMemoryCommitState() === 'unconfirmed') state.status = 'unconfirmed';
            else if (store.summaryInvalid) state.status = 'history_invalid';
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
            requireMemory(isEnabled(), 'no_boundary');
            const current = read();
            const impact = maintenanceHistoryImpact(current.store);
            return repairMaintenanceIndexes(current.chatId, impact);
        },
    };
}
