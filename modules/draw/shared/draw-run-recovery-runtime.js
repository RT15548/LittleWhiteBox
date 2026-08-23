import { getContext } from '../../../../../../extensions.js';
import { syncMesToSwipe } from '../../../../../../../script.js';
import { adoptExistingJobFromDrawRun } from './draw-run-adoption.js';
import { clearDrawRunMarkerAndConfirm } from './draw-run-coordinator.js';
import {
    findDrawRunMarker,
    getDrawRunMarkerText,
    listDrawRunMarkers,
    persistedChatHasDeliverySlots,
    persistedChatHasDrawRunMarker,
    persistedChatHasDrawRunSlots,
    persistedDrawRunTargetMatches,
    removeDrawRunMarker,
    setDrawRunMarkerText,
} from './draw-run-markers.js';
import {
    DRAW_RUN_BLOCKED_RETRY_MS,
    DrawRunAdoptionRecoveryStatus,
    DrawRunPendingAdoptionAction,
    DrawRunRecoveryAction,
    planDrawRunAdoptionRetry,
    planDrawRunPollDelay,
    planDrawRunRecovery,
    planPendingAdoptionRecovery,
} from './draw-run-recovery.js';
import {
    createConfirmableChatTarget,
    readChatAndConfirm,
    saveChatAndConfirm,
} from './confirmable-chat-save.js';
import {
    activateAdoptingPendingImageJob,
    claimPendingImageJob,
    fencePendingImageJobLease,
    forgetPendingImageJob,
    getPendingImageJob,
    markPendingImageJobAdoptionReady,
    markPendingImageJobOriginRunAckReady,
    PendingJobAdoptionPhase,
    PendingJobState,
    releasePendingImageJobLease,
} from './pending-image-jobs.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from './scene-source.js';
import { isMessageBeingEdited, syncRenderedMessageFromState } from './draw-common.js';

function collectCurrentDrawRunMarkers(ctx) {
    const chatId = String(ctx?.chatId || '');
    const entries = [];
    for (const [messageId, message] of (Array.isArray(ctx?.chat) ? ctx.chat : []).entries()) {
        if (!message || typeof message !== 'object') continue;
        for (const markerEntry of listDrawRunMarkers(message)) {
            entries.push({ ...markerEntry, message, messageId, chatId });
        }
    }
    return entries;
}

function resolveCurrentDrawRunTarget(runId) {
    const ctx = getContext();
    const found = findDrawRunMarker(ctx?.chat, runId);
    return found ? { ...found, chatId: String(ctx?.chatId || '') } : null;
}

async function confirmAdoptedSlots({ ctx, runId, slotIds, target }) {
    const live = resolveCurrentDrawRunTarget(runId);
    if (!live || live.chatId !== String(ctx?.chatId || '') || live.message !== target?.message) {
        const error = new Error('Draw Run 目标聊天已切换，暂缓保存占位符');
        error.code = 'DRAW_RUN_TARGET_CHANGED';
        throw error;
    }
    await saveChatAndConfirm({
        ctx,
        verify: persistedChat => persistedChatHasDrawRunSlots(persistedChat, runId, slotIds),
    });
}

function notifyDrawRun(level, message) {
    const method = window?.toastr?.[level];
    if (typeof method !== 'function') return;
    try {
        method(message, '小白X画图');
    } catch (error) {
        console.warn('[Draw Run] 用户提示显示失败:', error);
    }
}

function notifyTerminalDrawRun(run) {
    if (run?.state === 'failed') {
        const detail = typeof run.error === 'string' ? run.error : run.error?.message;
        notifyDrawRun('error', detail || '后台场景规划失败，未创建图片任务。');
    } else if (run?.state === 'cancelled') {
        notifyDrawRun('info', '后台画图任务已取消。');
    } else if (run?.state === 'child_expired') {
        notifyDrawRun('warning', '后台图片任务已过期，请重新画图。');
    } else {
        notifyDrawRun('warning', '后台规划任务已经失效，未生成可接回的图片；请重新画图。');
    }
}

function syncCurrentMarkerSwipe(current) {
    const live = getContext();
    if (String(live?.chatId || '') !== current.chatId
        || live?.chat?.[current.messageId] !== current.message) return false;
    return syncMesToSwipe(current.messageId);
}

function dropLocalDrawRunMarker(markerEntry) {
    const current = resolveCurrentDrawRunTarget(markerEntry.runId);
    if (!current || current.message !== markerEntry.message) return false;
    return removeDrawRunMarker({
        message: current.message,
        messageId: current.messageId,
        swipeIndex: current.swipeIndex,
        runId: current.runId,
        syncActiveSwipe: () => syncCurrentMarkerSwipe(current),
    });
}

async function readMarkerPersistenceState({ ctx, markerEntry, chatTarget }) {
    const result = await readChatAndConfirm({
        ctx,
        target: chatTarget,
        verify: () => true,
    });
    const persistedTarget = findDrawRunMarker(result.persistedChat, markerEntry.runId);
    if (!persistedTarget) return 'absent';
    return persistedDrawRunTargetMatches(
        result.persistedChat,
        markerEntry.runId,
        getDrawRunMarkerText(markerEntry),
        markerEntry.marker,
    ) ? 'matching' : 'conflict';
}

async function clearRecoveredDrawRunMarker({ ctx, markerEntry }) {
    const current = resolveCurrentDrawRunTarget(markerEntry.runId);
    if (!current || current.chatId !== String(ctx?.chatId || '')
        || isMessageBeingEdited(current.messageId)) return false;
    const persistenceState = await readMarkerPersistenceState({
        ctx,
        markerEntry: current,
        chatTarget: createConfirmableChatTarget(ctx),
    });
    if (persistenceState === 'conflict') return false;
    if (persistenceState === 'absent') {
        dropLocalDrawRunMarker(current);
        return true;
    }
    await clearDrawRunMarkerAndConfirm({
        ctx,
        message: current.message,
        messageId: current.messageId,
        swipeIndex: current.swipeIndex,
        runId: current.runId,
        marker: current.marker,
        syncActiveSwipe: () => syncCurrentMarkerSwipe(current),
        saveAndConfirm: saveChatAndConfirm,
        fetchImpl: globalThis.fetch,
    });
    return true;
}

async function ensureRecoveredMarkerAbsent({ ctx, markerEntry, record }) {
    if (markerEntry) return clearRecoveredDrawRunMarker({ ctx, markerEntry });
    const readback = await readChatAndConfirm({
        ctx,
        target: record.chatTarget,
        verify: persistedChat => !persistedChatHasDrawRunMarker(
            persistedChat,
            record.originRunId,
        ),
    });
    return readback.confirmed;
}

async function claimAdoptingRecord(record) {
    const owned = await claimPendingImageJob(record.jobId);
    if (owned) return { owned, outcome: null };
    const current = await getPendingImageJob(record.jobId);
    if (!current || current.state !== PendingJobState.ADOPTING) {
        return {
            owned: null,
            outcome: {
                status: DrawRunAdoptionRecoveryStatus.COMPLETED,
                reason: 'already_settled',
            },
        };
    }
    if (current.leaseExpiresAt > Date.now()) {
        return {
            owned: null,
            outcome: {
                status: DrawRunAdoptionRecoveryStatus.LEASE_ACTIVE,
                leaseExpiresAt: current.leaseExpiresAt,
            },
        };
    }
    return {
        owned: null,
        outcome: { status: DrawRunAdoptionRecoveryStatus.BLOCKED, reason: 'claim_unavailable' },
    };
}

async function finalizeAdoptingRecord({ ctx, markerEntry, record, run = null }) {
    let owned = record;
    try {
        owned = await fencePendingImageJobLease(owned.jobId, owned.leaseId);
        const markerAbsent = await ensureRecoveredMarkerAbsent({
            ctx,
            markerEntry,
            record: owned,
        });
        if (!markerAbsent) {
            await releasePendingImageJobLease(owned.jobId, owned.leaseId);
            return { status: DrawRunAdoptionRecoveryStatus.BLOCKED, reason: 'marker_not_cleared' };
        }
        owned = await fencePendingImageJobLease(owned.jobId, owned.leaseId);
        owned = await markPendingImageJobOriginRunAckReady(
            owned.jobId,
            owned.leaseId,
            owned.originRunId,
        );
        // journal 创建后的取消由本轮最新 Draw Run 快照补入；激活完成后再发生的取消
        // 由后端直接传播给 child，第一刀会从 child 终态完成结算。
        owned = await activateAdoptingPendingImageJob(owned.jobId, owned.leaseId, {
            cancelling: owned.cancelRequested || Number(run?.cancelRequestedAt) > 0,
        });
        if (owned.delivery?.mode === 'gallery') {
            notifyDrawRun(
                'info',
                '聊天或楼层已经变化，后台生成的图片不会写入原楼层；可在画图设置的图片管理中查看。',
            );
        }
        return { status: DrawRunAdoptionRecoveryStatus.COMPLETED };
    } catch (error) {
        await releasePendingImageJobLease(owned.jobId, owned.leaseId).catch(() => {});
        throw error;
    }
}

async function recoverAdoptingRecord({ ctx, markerEntry, record, run = null }) {
    const claimed = await claimAdoptingRecord(record);
    if (!claimed.owned) return claimed.outcome;
    let { owned } = claimed;
    try {
        if (owned.adoptionPhase === PendingJobAdoptionPhase.PENDING) {
            const readback = await readChatAndConfirm({
                ctx,
                target: owned.chatTarget,
                verify: () => true,
            });
            const pendingPlan = planPendingAdoptionRecovery({
                persistedMarkerPresent: Boolean(findDrawRunMarker(
                    readback.persistedChat,
                    owned.originRunId,
                )),
            });
            if (pendingPlan.action === DrawRunPendingAdoptionAction.WAIT_FOR_TARGET) {
                await releasePendingImageJobLease(owned.jobId, owned.leaseId);
                return {
                    status: DrawRunAdoptionRecoveryStatus.BLOCKED,
                    reason: pendingPlan.reason,
                };
            }
            owned = await markPendingImageJobAdoptionReady(
                owned.jobId,
                owned.leaseId,
                pendingPlan.delivery,
            );
        } else if (owned.adoptionPhase === PendingJobAdoptionPhase.PLACING
            || (owned.adoptionPhase === PendingJobAdoptionPhase.READY
                && owned.delivery.mode === 'slots')) {
            const readback = await readChatAndConfirm({
                ctx,
                target: owned.chatTarget,
                verify: persistedChat => persistedChatHasDeliverySlots(
                    persistedChat,
                    owned.delivery,
                    owned.items.map(item => item.slotId),
                ),
            });
            if (readback.confirmed && markerEntry) {
                const current = resolveCurrentDrawRunTarget(owned.originRunId);
                const persisted = findDrawRunMarker(readback.persistedChat, owned.originRunId);
                const persistedText = getDrawRunMarkerText(persisted);
                const localSourceHash = hashSceneSource(normalizeMessageSceneSourceText(
                    getDrawRunMarkerText(current),
                ));
                if (current && typeof persistedText === 'string'
                    && localSourceHash === owned.sourceHash
                    && !isMessageBeingEdited(current.messageId)) {
                    setDrawRunMarkerText(current, persistedText);
                    const activeSwipe = Number.isInteger(current.message?.swipe_id)
                        ? current.message.swipe_id
                        : 0;
                    if (current.swipeIndex === activeSwipe) {
                        await syncRenderedMessageFromState(current.messageId, {
                            chatId: current.chatId,
                            expectedMessage: current.message,
                        });
                    }
                }
            }
            owned = await markPendingImageJobAdoptionReady(
                owned.jobId,
                owned.leaseId,
                readback.confirmed
                    ? owned.delivery
                    : { mode: 'gallery', reason: 'slots_missing' },
            );
        }
        return await finalizeAdoptingRecord({ ctx, markerEntry, record: owned, run });
    } catch (error) {
        await releasePendingImageJobLease(owned.jobId, owned.leaseId).catch(() => {});
        throw error;
    }
}

async function abandonPendingAdoption({ ctx, markerEntry, record }) {
    const claimed = await claimAdoptingRecord(record);
    if (!claimed.owned) return claimed.outcome;
    let { owned } = claimed;
    try {
        owned = await fencePendingImageJobLease(owned.jobId, owned.leaseId);
        const markerAbsent = await ensureRecoveredMarkerAbsent({
            ctx,
            markerEntry,
            record: owned,
        });
        if (!markerAbsent) {
            await releasePendingImageJobLease(owned.jobId, owned.leaseId);
            return { status: DrawRunAdoptionRecoveryStatus.BLOCKED, reason: 'marker_not_cleared' };
        }
        owned = await fencePendingImageJobLease(owned.jobId, owned.leaseId);
        await forgetPendingImageJob(owned.jobId, owned.leaseId);
        return { status: DrawRunAdoptionRecoveryStatus.COMPLETED, reason: 'abandoned' };
    } catch (error) {
        await releasePendingImageJobLease(owned.jobId, owned.leaseId).catch(() => {});
        throw error;
    }
}

function scheduleAdoptionOutcome(outcome, scheduleRecovery) {
    const delay = planDrawRunAdoptionRetry(outcome);
    if (delay !== null) scheduleRecovery(delay);
}

export async function runDrawRunRecoveryPass({ ctx, records = [], client, scheduleRecovery } = {}) {
    if (!client || typeof client.listRuns !== 'function' || typeof client.acknowledgeRun !== 'function') {
        throw new TypeError('Draw Run recovery 缺少后端客户端');
    }
    if (typeof scheduleRecovery !== 'function') {
        throw new TypeError('Draw Run recovery 缺少调度器');
    }
    const markers = collectCurrentDrawRunMarkers(ctx);
    const originRecords = records.filter(record => record.originRunId);
    if (markers.length === 0 && originRecords.length === 0) return;
    let runs;
    try {
        runs = await client.listRuns();
    } catch (error) {
        console.warn('[Draw Run] 暂时无法查询后台规划任务，等待网络恢复:', error);
        scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
        return;
    }

    const { plan } = planDrawRunRecovery({
        markers,
        runs,
        records: originRecords,
        currentChatId: String(ctx?.chatId || ''),
    });
    const pollDelay = planDrawRunPollDelay(plan);
    if (pollDelay !== null) scheduleRecovery(pollDelay);

    for (const entry of plan) {
        try {
            if (entry.action === DrawRunRecoveryAction.WAIT) continue;
            if (entry.action === DrawRunRecoveryAction.CLEAR_MISSING_MARKER) {
                const cleared = await clearRecoveredDrawRunMarker({ ctx, markerEntry: entry.markerEntry });
                if (cleared) {
                    notifyDrawRun('warning', '后台没有找到这次画图任务，已清理失效标记。');
                } else {
                    scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
                }
                continue;
            }
            if (entry.action === DrawRunRecoveryAction.DROP_STALE_LOCAL_MARKER) {
                if (!dropLocalDrawRunMarker(entry.markerEntry)) {
                    scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
                }
                continue;
            }
            if (entry.action === DrawRunRecoveryAction.RECOVER_ADOPTION) {
                const outcome = await recoverAdoptingRecord({
                    ctx,
                    markerEntry: entry.markerEntry,
                    record: entry.record,
                    run: entry.run,
                });
                scheduleAdoptionOutcome(outcome, scheduleRecovery);
                continue;
            }
            if (entry.action === DrawRunRecoveryAction.ABANDON_ADOPTION) {
                const outcome = await abandonPendingAdoption({
                    ctx,
                    markerEntry: entry.markerEntry,
                    record: entry.record,
                });
                scheduleAdoptionOutcome(outcome, scheduleRecovery);
                if (outcome.status !== DrawRunAdoptionRecoveryStatus.COMPLETED
                    || outcome.reason !== 'abandoned') continue;
                notifyTerminalDrawRun(entry.run);
                if (entry.run) await client.acknowledgeRun(entry.run.id);
                continue;
            }
            if (entry.action === DrawRunRecoveryAction.SETTLE_TERMINAL) {
                const cleared = await clearRecoveredDrawRunMarker({ ctx, markerEntry: entry.markerEntry });
                if (!cleared) {
                    scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
                    continue;
                }
                notifyTerminalDrawRun(entry.run);
                await client.acknowledgeRun(entry.run.id);
                continue;
            }
            if (entry.action !== DrawRunRecoveryAction.ADOPT) continue;

            const result = await adoptExistingJobFromDrawRun({
                run: entry.run,
                marker: entry.markerEntry.marker,
                resolveTarget: resolveCurrentDrawRunTarget,
                isMessageBeingEdited,
                chatTarget: createConfirmableChatTarget(ctx),
                confirmSlots: details => confirmAdoptedSlots({ ctx, ...details }),
                syncSlots: async ({ target }) => {
                    const activeSwipe = Number.isInteger(target.message?.swipe_id)
                        ? target.message.swipe_id
                        : 0;
                    if (target.swipeIndex === activeSwipe) {
                        await syncRenderedMessageFromState(target.messageId, {
                            chatId: target.chatId,
                            expectedMessage: target.message,
                        });
                    }
                },
            });
            if (result.status === 'active') {
                dropLocalDrawRunMarker(entry.markerEntry);
                continue;
            }
            if (result.status !== 'ready' || !result.owned) {
                if (result.status === 'wait') {
                    scheduleAdoptionOutcome(
                        result.reason === 'lease_active'
                            ? {
                                status: DrawRunAdoptionRecoveryStatus.LEASE_ACTIVE,
                                leaseExpiresAt: result.record?.leaseExpiresAt,
                            }
                            : {
                                status: DrawRunAdoptionRecoveryStatus.BLOCKED,
                                reason: result.reason,
                            },
                        scheduleRecovery,
                    );
                }
                continue;
            }
            const outcome = await finalizeAdoptingRecord({
                ctx,
                markerEntry: entry.markerEntry,
                record: result.record,
                run: entry.run,
            });
            scheduleAdoptionOutcome(outcome, scheduleRecovery);
        } catch (error) {
            if (error?.code === 'PENDING_JOB_LEASE_LOST') continue;
            console.warn(`[Draw Run] 后台规划任务 ${entry.markerEntry?.runId || ''} 接回未完成，稍后重试:`, error);
            scheduleRecovery(DRAW_RUN_BLOCKED_RETRY_MS);
        }
    }
}
