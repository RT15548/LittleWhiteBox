import { getContext } from '../../../../../../extensions.js';
import { syncMesToSwipe } from '../../../../../../../script.js';
import { adoptExistingJobFromDrawRun, normalizeDrawRunHandoff } from './draw-run-adoption.js';
import { publishDrawRunActivity } from './draw-run-activity.js';
import { clearDrawRunMarker } from './draw-run-coordinator.js';
import { findDrawRunMarker, listDrawRunMarkers } from './draw-run-markers.js';
import { DRAW_RUN_BLOCKED_RETRY_MS, DrawRunRecoveryAction, planDrawRunPollDelay, planDrawRunRecovery } from './draw-run-recovery.js';
import { createConfirmableChatTarget } from './confirmable-chat-save.js';
import { requestDrawChatSave } from './draw-chat-save.js';
import { getImageChatIdentity } from './chat-image-persistence.js';
import { restoreDrawRunTargets } from './draw-run-target.js';
import { activateAdoptingPendingImageJob, bindPendingDrawRunItems, claimPendingImageJob, forgetPendingImageJob,
    markPendingImageJobAdoptionReady, markPendingImageJobOriginRunAckReady,
    releasePendingImageJobLease } from './pending-image-jobs.js';
import { consumePageFarewell } from './page-farewell.js';
import { isMessageBeingEdited, syncRenderedMessageFromState } from './draw-common.js';
import { logDrawRunPlannerDiagnostics } from './draw-run-debug.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';

function currentTarget(runId) {
    const ctx = getContext();
    const target = findDrawRunMarker(ctx?.chat, runId);
    return target ? { ...target, chat: ctx.chat, chatId: String(ctx.chatId) } : null;
}

function activityTarget(entry) {
    return { provider: entry?.marker?.provider, chatId: entry?.chatId,
        messageId: entry?.messageId, swipeIndex: entry?.swipeIndex, runId: entry?.runId };
}

function clearLocalMarker(ctx, entry, completeAutomatic = false) {
    const target = currentTarget(entry?.runId);
    if (!target || target.chat !== ctx.chat || isMessageBeingEdited(target.messageId)) return;
    clearDrawRunMarker({ ctx, ...target, completeAutomatic,
        syncActiveSwipe: () => syncMesToSwipe(target.messageId), requestSave: requestDrawChatSave });
}

function notifyTerminal(run) {
    if (run?.state === 'failed') window.toastr?.error?.(run.error?.message || run.error || '后台场景规划失败。', '小白X画图');
    else if (run?.state === 'cancelled') window.toastr?.info?.('后台画图任务已取消。', '小白X画图');
}

export async function runDrawRunRecoveryPass({ excludedRunIds = new Set(), acknowledgedRunIds = new Set(),
    onCancellationSettled, ctx, records = [], farewells = [], client, scheduleRecovery, onAdoptionReady } = {}) {
    const owner = getImageChatIdentity(ctx);
    records = records.filter(record => !record.submission || record.submission.owner === owner);
    const restored = restoreDrawRunTargets(ctx, records, { syncActiveSwipe: syncMesToSwipe, isEditing: isMessageBeingEdited });
    if (restored.size) requestDrawChatSave(ctx);
    const markers = ctx.chat.flatMap((message, messageId) => listDrawRunMarkers(message).map(entry => ({
        ...entry, message, messageId, chatId: String(ctx.chatId),
    }))).filter(entry => !excludedRunIds.has(entry.runId));
    const originRecords = records.filter(record => record.originRunId && !excludedRunIds.has(record.originRunId));
    const attemptedSettlements = new Set();
    const settleCancellation = async runId => {
        if (!acknowledgedRunIds.has(runId) || attemptedSettlements.has(runId)) return;
        attemptedSettlements.add(runId);
        try { await onCancellationSettled?.(runId); }
        catch (error) {
            console.warn('[Draw Run] 取消日志收尾暂未完成:', error);
            scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
        }
    };
    // The server's exact-set cancellation receipt already proves no new work
    // can start. Clearing an old chat marker is not a second cancellation ACK.
    if (!markers.length && !originRecords.length) {
        for (const runId of acknowledgedRunIds) if (!excludedRunIds.has(runId)) await settleCancellation(runId);
        return;
    }
    let runs;
    try { runs = await client.listRuns(); }
    catch (error) {
        console.warn('[Draw Run] 暂时无法查询后台规划任务:', error);
        scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
        return;
    }
    if (getContext()?.chat !== ctx.chat || getImageChatIdentity(getContext()) !== owner) return;
    const { plan } = planDrawRunRecovery({ markers, runs, records: originRecords, acknowledgedRunIds,
        farewells, currentChatId: String(ctx.chatId) });
    const pollDelay = planDrawRunPollDelay(plan);
    if (pollDelay !== null) scheduleRecovery(pollDelay);
    // Entries have separate journal leases. No chat save/readback, and no slow
    // planner can hold another run's ready image behind its housekeeping.
    await Promise.all(plan.map(async entry => {
        let owned;
        const runId = entry.markerEntry?.runId || entry.record?.originRunId;
        try {
            if (entry.run) {
                logDrawRunPlannerDiagnostics(entry.run);
                if (entry.runFarewell) consumePageFarewell(entry.runFarewell);
                if (entry.markerEntry) publishDrawRunActivity({ ...activityTarget(entry.markerEntry), phase: 'active',
                    stage: entry.run.progress?.stage || entry.run.state,
                    ...(entry.run.progress?.retry ? { retry: entry.run.progress.retry } : {}) });
            }
            if (entry.action === DrawRunRecoveryAction.WAIT) return;
            if (entry.action === DrawRunRecoveryAction.REQUEST_CANCEL) {
                await client.cancelRun(runId); scheduleRecovery(100); return;
            }
            if (entry.action === DrawRunRecoveryAction.DROP_STALE_LOCAL_MARKER) {
                clearLocalMarker(ctx, entry.markerEntry, true); return;
            }
            const terminal = [DrawRunRecoveryAction.CLEAR_MISSING_MARKER, DrawRunRecoveryAction.SETTLE_TERMINAL,
                DrawRunRecoveryAction.SETTLE_CANCELLATION, DrawRunRecoveryAction.ABANDON_ADOPTION].includes(entry.action);
            if (terminal) {
                if (entry.record) {
                    owned = await claimPendingImageJob(entry.record.jobId, { farewell: entry.jobFarewell });
                    if (!owned) { scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS); return; }
                    await forgetPendingImageJob(owned.jobId, owned.leaseId); owned = null;
                }
                clearLocalMarker(ctx, entry.markerEntry);
                notifyTerminal(entry.run);
                publishDrawRunActivity({ ...activityTarget(entry.markerEntry), runId, phase: 'reconciled' });
                await settleCancellation(runId);
                if (entry.run && ['failed', 'cancelled', 'child_expired'].includes(entry.run.state)) await client.acknowledgeRun(runId);
                return;
            }
            if (entry.run?.handoffManifest && entry.markerEntry) {
                const result = await adoptExistingJobFromDrawRun({ run: entry.run, marker: entry.markerEntry.marker,
                    resolveTarget: currentTarget, isMessageBeingEdited, chatTarget: createConfirmableChatTarget(ctx),
                    farewell: entry.jobFarewell, syncSlots: async ({ target }) => {
                        if (target.swipeIndex === (target.message.swipe_id ?? 0)) await syncRenderedMessageFromState(target.messageId, {
                            chatId: target.chatId, expectedMessage: target.message,
                        });
                    } });
                if (result.status === 'active') { clearLocalMarker(ctx, entry.markerEntry, true); return; }
                if (result.status !== 'ready' || !result.owned) {
                    scheduleRecovery(result.reason === 'lease_active'
                        ? Math.max(100, result.record.leaseExpiresAt - Date.now() + 10) : DRAW_RUN_BLOCKED_RETRY_MS);
                    return;
                }
                owned = result.record;
            } else if (entry.record) {
                owned = await claimPendingImageJob(entry.record.jobId, { farewell: entry.jobFarewell });
                if (!owned) { scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS); return; }
                if (!owned.items.length && entry.run?.handoffManifest) {
                    owned = await bindPendingDrawRunItems(owned.jobId, owned.leaseId,
                        normalizeDrawRunHandoff(entry.run, owned.submission.marker).items);
                }
                // A removed original branch does not prevent retaining its paid
                // results. No guessing or writing into another message.
                owned = await markPendingImageJobAdoptionReady(owned.jobId, owned.leaseId,
                    { mode: 'gallery', reason: 'target_missing' });
            }
            if (!owned) return;
            owned = await markPendingImageJobOriginRunAckReady(owned.jobId, owned.leaseId, owned.originRunId);
            clearLocalMarker(ctx, entry.markerEntry, true);
            const adopted = owned;
            await activateAdoptingPendingImageJob(owned.jobId, owned.leaseId, {
                cancelling: owned.cancelRequested || Number(entry.run?.cancelRequestedAt) > 0,
            });
            owned = null;
            if (onAdoptionReady) observeBackgroundTask(Promise.resolve().then(() => onAdoptionReady(adopted)),
                { source: import.meta.url, operation: 'onAdoptionReady' });
            await settleCancellation(runId);
        } catch (error) {
            if (owned) await releasePendingImageJobLease(owned.jobId, owned.leaseId);
            if (error?.code !== 'PENDING_JOB_LEASE_LOST') console.warn('[Draw Run] 接回暂未完成:', error);
            scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
        }
    }));
    for (const runId of acknowledgedRunIds) if (!excludedRunIds.has(runId)) await settleCancellation(runId);
}
