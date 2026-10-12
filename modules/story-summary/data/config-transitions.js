import { createAbortError } from '../../../shared/common/abort-utils.js';
import { applySummaryPanelConfigSnapshot, getSummaryPanelConfig, getVectorConfig, readSummaryPanelConfigFromServer } from './config.js';
import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import {
    VECTOR_WRITE_SCOPES, cancelEmbeddingWriteTasks, isVectorWriteSessionCurrent, runVectorWriteTask, runVectorConfigTransition,
} from '../vector/runtime/maintenance-coordinator.js';

export async function changeSummaryConfig({ chatId, reason, vectorChanged = true, applyChange, invalidateRecall, afterVectorChange }) {
    const apply = async session => {
        const previousConfig = getSummaryPanelConfig();
        const previousVectorConfig = previousConfig.vector;
        const result = await applyChange();
        const nextVectorConfig = getVectorConfig();
        const appliedVectorChanged = JSON.stringify(previousVectorConfig) !== JSON.stringify(nextVectorConfig);
        if (appliedVectorChanged && !vectorChanged) cancelEmbeddingWriteTasks('summary-config-changed');
        if (vectorChanged || appliedVectorChanged) invalidateRecall();
        const changed = await afterVectorChange(previousVectorConfig, nextVectorConfig, session);
        return { previousConfig, previousVectorConfig, nextVectorConfig, result, changed };
    };
    // Non-vector settings still share the order, without cancelling unrelated
    // embedding work merely because the user saved a summary/UI setting.
    const pending = vectorChanged
        ? runVectorConfigTransition({ chatId, reason }, apply)
        : runVectorWriteTask({ chatId, kind: 'config-save', scope: VECTOR_WRITE_SCOPES.CONFIG }, apply);
    if (vectorChanged) invalidateRecall();
    const result = await pending;
    // Superseded/shutdown queue entries never ran applyChange, so cannot
    // acknowledge a user save as successful with the previous configuration.
    if (!result) throw createAbortError(SUMMARY_FEEDBACK_COPY.configSaveCancelled);
    return result;
}

// Reloads share the existing write order, but are not user configuration
// changes: they must never supersede a pending save. Read inside the queue so
// that the snapshot includes every preceding committed save.
export async function synchronizeSummaryConfig({ chatId, assertCurrent = () => {}, beforeApply, afterVectorChange }) {
    const result = await runVectorWriteTask(
        { chatId, kind: 'config-reload', scope: VECTOR_WRITE_SCOPES.CONFIG },
        async session => {
            const check = () => {
                assertCurrent();
                if (!isVectorWriteSessionCurrent(session)) throw createAbortError();
            };
            check();
            const loaded = await readSummaryPanelConfigFromServer();
            check();
            const previous = getSummaryPanelConfig();
            const vectorChanged = JSON.stringify(previous.vector) !== JSON.stringify(loaded.vector);
            if (vectorChanged) cancelEmbeddingWriteTasks('server-config-reloaded');
            beforeApply(previous, loaded);
            const saved = applySummaryPanelConfigSnapshot(loaded);
            if (vectorChanged) await afterVectorChange(previous.vector, saved.vector, session);
            check();
            return saved;
        },
    );
    // A queued reload can be superseded by a user save or feature shutdown.
    if (!result) throw createAbortError();
    return result;
}
