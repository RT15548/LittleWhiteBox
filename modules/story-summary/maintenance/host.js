import { getContext } from '../../../../../../extensions.js';
import { getSummaryStore } from '../data/store.js';
import { getMemoryCommitState, assertMemoryWritable, getPublishedSummaryMemory } from '../data/memory-commit.js';
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
import { readMaintenanceDiagnostics, createMaintenanceStatusReader } from './diagnostics.js';
import { createMemoryChatController } from './chat-controller.js';

export function createMemoryMaintenanceHost({ isEnabled, invalidateRecall, refreshSummary, changed, readSummaryDiagnostics, chatChanged = () => {} }) {
    let unregister = null, chat = null, executing = 0, refreshAfterRun = false, publishedRevision = 0;
    const readStatus = createMaintenanceStatusReader();
    const enabled = () => isEnabled() && getSummaryPanelConfig().memoryMaintenanceEnabled;
    const summaryStyle = () => getSummaryPanelConfig().prompts.summaryStyle;
    const read = () => {
        const context = getContext();
        const store = getSummaryStore();
        return { identity: getChatIdentity(context), chatId: context.chatId, chat: context.chat, store, json: store?.json,
            cutoff: store?.lastSummarizedMesId, atoms: getStateAtoms(), l0Index: getL0Index() };
    };
    const execute = async (task, options) => {
        executing++;
        try {
            return await executeMemoryTask(task, {
                read, enabled: isEnabled, automaticEnabled: enabled,
                filterRules: () => getSummaryPanelConfig().textFilterRules,
                summaryStyle,
                invalidateRecall, refreshSummary, readMaintenance: diagnostics, ...options,
            });
        } finally {
            executing--;
            if (task.identity === getChatIdentity(getContext())) refreshAfterRun = true;
        }
    };
    const scheduler = createMemoryScheduler({ enabled,
        changed: notifyState,
        run: (task, signal, phase) => execute(task, { signal, phase }),
    });
    function publishedState() {
        getSummaryStore();
        return { store: getPublishedSummaryMemory().storySummary,
            state: scheduler.snapshot(getContext().chatId, getChatIdentity(getContext())), commitState: getMemoryCommitState(), enabled: enabled() };
    }
    function maintenanceState(status) {
        const state = status.automatic;
        if (status.persistence === 'unconfirmed') state.status = 'unconfirmed';
        else if (!status.historyValid) state.status = 'history_invalid';
        return state;
    }
    function notifyState() {
        const status = readStatus(publishedState());
        if (!publishedRevision) publishedRevision = status.revision;
        if (!executing && (refreshAfterRun || publishedRevision !== status.revision)) {
            refreshAfterRun = false;
            publishedRevision = status.revision;
            changed();
        } else {
            changed({ stateOnly: true, chatId: getContext().chatId, state: maintenanceState(status), ranges: status.ranges });
        }
        if (chat) chatChanged(chat.liveSnapshot());
    }
    function diagnostics(args) {
        return { ...readMaintenanceDiagnostics(publishedState(), args), summaryGeneration: readSummaryDiagnostics(args) };
    }
    chat = createMemoryChatController({
        identity: () => getChatIdentity(getContext()), chatId: () => getContext().chatId,
        scheduler, execute, summaryStyle, status: () => readStatus(publishedState()),
        previewTask: () => {
            const current = read();
            return isEnabled() && hasMaintenanceBoundary(current) && getMemoryCommitState() !== 'unconfirmed'
                ? maintenanceTask(current.store.summaryHistory, current.cutoff) : null;
        },
        changed: () => { if (chat) chatChanged(chat.liveSnapshot()); },
    });
    return {
        chat,
        start() {
            if (!unregister) unregister = registerMemoryMaintenance(batch => {
                if (batch.identity === getChatIdentity(getContext())) scheduler.submitted(batch);
            });
        },
        stop() { scheduler.cancel(); chat.reset({ preview: false }); unregister?.(); unregister = null; },
        reset() { scheduler.cancel(); chat.reset(); },
        cancel: () => scheduler.cancel(),
        cancelAutomatic: () => scheduler.cancelAutomatic(),
        async results(offset = 0) {
            const chatId = getContext().chatId, owner = getChatIdentity(getContext());
            getSummaryStore();
            const published = getPublishedSummaryMemory();
            const store = published.storySummary;
            const page = projectMaintenanceReceipts(store, Math.max(0, Number(offset) || 0));
            page.items = page.items.map(receipt => presentMaintenanceReceipt(receipt, { json: store.json || {}, atoms: published.stateAtoms }));
            const impact = maintenanceHistoryImpact(store);
            let index;
            try {
                const inspection = await inspectMaintenanceIndexes(chatId, impact);
                index = { status: inspection.status, count: inspection.events.length + inspection.atoms.length };
            } catch (error) { index = { status: 'pending', code: error.code || 'index_read_failed' }; }
            // Index inspection may yield while a newer progress frame is published.
            const status = owner === getChatIdentity(getContext()) ? readStatus(publishedState()) : null;
            const state = status ? maintenanceState(status) : scheduler.snapshot(chatId, owner);
            if (['running', 'saving', 'indexing'].includes(state.status)) {
                for (const receipt of page.items) if (receipt.runId === state.progress?.runId) receipt.outcome = { status: state.status };
            }
            if (state.status === 'unconfirmed') page.items = page.items.filter(receipt => !receipt.receiptIds.includes(state.receiptId));
            return { ...page, state, index, chatId, ranges: status ? status.ranges : maintenanceRanges(store.summaryHistory || [], store.lastSummarizedMesId ?? -1) };
        },
        source(request) {
            const context = getContext();
            return readMaintenanceSource({ chatId: context.chatId, chat: context.chat,
                store: getPublishedSummaryMemory().storySummary }, request);
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
