import { getContext } from '../../../../../../extensions.js';
import { getRequestHeaders } from '../../../../../../../script.js';
import { createModuleEvents, event_types } from '../../../core/event-manager.js';
import {
    createImageBackendJobsClient,
    readImageBackendResultBase64,
} from './backend-image-jobs.js';
import { createDrawRunClient } from './draw-run-client.js';
import { runDrawRunRecoveryPass } from './draw-run-recovery-runtime.js';
import {
    clearSlotSelection,
    deletePreview,
    getPreview,
    setSlotSelection,
    storeFailedPlaceholder,
    storePreview,
} from './gallery-cache.js';
import { executeImageJobReattachEntry } from './image-job-recovery-executor.js';
import { planImageJobReattach, ReattachAction } from './image-job-reattach.js';
import { getPendingImageJob, listPendingImageJobs, PendingJobState } from './pending-image-jobs.js';
import { commitSceneSlotDelivery } from './scene-placement.js';
import {
    classifyError,
    ErrorType,
    isAnyMessageBeingEdited,
    isMessageBeingEdited,
    renderPreviewsForMessage,
} from './draw-common.js';
import {
    classifyImageJobDeliveryTarget,
    commitImageJobDeliverySlotRemoval,
    ImageJobDeliveryTargetState,
    requireImageJobDeliveryTarget,
} from './image-job-delivery-target.js';

const RETRY_DELAY_MS = 15_000;
const backendClient = createImageBackendJobsClient({ getHeaders: getRequestHeaders });
const drawRunClient = createDrawRunClient({ getHeaders: getRequestHeaders });
const resultDecoders = new Map([
    ['sd-webui', ({ response }) => readImageBackendResultBase64(response)],
    ['comfyui', ({ response }) => readImageBackendResultBase64(response)],
]);

let runtimeEvents = null;
let recoveryTimer = null;
let recoveryTimerAt = 0;
let recoveryRunning = null;
let recoveryQueued = false;
let runtimeClient = backendClient;
let runtimeDrawRunClient = drawRunClient;

function handleRecoveryVisibilityChange() {
    if (document.visibilityState === 'visible') scheduleRecovery();
}

function recordTarget(record, item = null) {
    if (record.delivery?.mode !== 'slots') {
        return { state: ImageJobDeliveryTargetState.REMOVED, message: null, messageId: null, swipe: null, ctx: getContext() };
    }
    const ctx = getContext();
    const target = classifyImageJobDeliveryTarget({
        currentChatId: ctx?.chatId,
        targetChatId: record.delivery.chatId,
        chat: ctx?.chat,
        slotId: item?.slotId,
    });
    return { ...target, ctx };
}

function requireAvailableTarget(record, item = null) {
    if (record.delivery?.mode !== 'slots') return null;
    const ctx = getContext();
    return requireImageJobDeliveryTarget({
        currentChatId: ctx?.chatId,
        targetChatId: record.delivery.chatId,
        chat: ctx?.chat,
        slotId: item?.slotId,
    });
}

function previewOptions(record, item, target) {
    return {
        ...record.gallery,
        chatId: record.gallery?.chatId || record.delivery?.chatId || '',
        messageId: target?.messageId ?? record.gallery?.messageId ?? record.delivery?.messageId ?? '',
        slotId: item.slotId,
        imgId: item.imgId,
        tags: item.previewMetadata?.tags || '',
        positive: item.previewMetadata?.positive || '',
        characterPrompts: item.previewMetadata?.characterPrompts ?? null,
        negativePrompt: item.previewMetadata?.negativePrompt ?? null,
    };
}

async function renderRecord(record, { final = false } = {}) {
    if (record.delivery?.mode !== 'slots') return;
    const slotsByMessage = new Map();
    for (const item of record.items) {
        const target = recordTarget(record, item);
        if (target.state !== ImageJobDeliveryTargetState.ALIVE || !target.isActiveSwipe) continue;
        const slots = slotsByMessage.get(target.messageId) || [];
        slots.push(item.slotId);
        slotsByMessage.set(target.messageId, slots);
    }
    await Promise.all([...slotsByMessage].map(([messageId, slotIds]) => renderPreviewsForMessage(
        messageId,
        {
            refreshSlotIds: final
                ? [...new Set([...slotIds, ...(record.replacedSlotIds || [])])]
                : slotIds,
        },
    )));
}

function describeMissingJob(record) {
    return record.state === PendingJobState.PREPARING
        ? ErrorType.JOB_NOT_SUBMITTED
        : ErrorType.JOB_EXPIRED;
}

function createDeliveryAdapter() {
    return {
        describeError(error, record) {
            if (error?.code === 'job_not_found') return describeMissingJob(record);
            return classifyError(error);
        },
        describeMissingJob,
        async deliver(record, item, payload, guard) {
            const decode = resultDecoders.get(record.provider);
            if (!decode) throw new Error(`不支持接回图片 Provider: ${record.provider}`);
            const base64 = await decode(payload);
            await guard();
            if (record.delivery?.mode === 'gallery') {
                await storePreview({ ...previewOptions(record, item, null), base64 });
                return;
            }
            const committed = await commitSceneSlotDelivery({
                committedEarly: true,
                resolveTarget: () => requireAvailableTarget(record, item),
                guard,
                persist: target => storePreview({ ...previewOptions(record, item, target), base64 }),
                rollbackPersisted: () => deletePreview(item.imgId),
                select: () => setSlotSelection(item.slotId, item.imgId),
                rollbackSelection: () => clearSlotSelection(item.slotId),
            });
            if (committed) {
                await renderRecord(record);
            } else {
                // 用户在结果到达前删除了这个槽位：尊重正文，但已付费的图片仍必须落进画廊。
                await guard();
                await storePreview({ ...previewOptions(record, item, null), base64 });
            }
        },
        async failItem(record, item, error, guard) {
            // gallery-only 没有正文槽位，也不伪造一张失败卡；后端失败项本身就是终态。
            if (record.delivery?.mode === 'gallery') return;
            const errorType = error?.label ? error : classifyError(error);
            const failedImgId = `failed-${item.imgId}`;
            const committed = await commitSceneSlotDelivery({
                committedEarly: true,
                resolveTarget: () => requireAvailableTarget(record, item),
                guard,
                persist: target => storeFailedPlaceholder({
                    ...previewOptions(record, item, target),
                    imgId: failedImgId,
                    errorType: errorType.label,
                    errorMessage: errorType.desc,
                }),
                rollbackPersisted: () => deletePreview(failedImgId),
                select: () => setSlotSelection(item.slotId, failedImgId),
                rollbackSelection: () => clearSlotSelection(item.slotId),
            });
            if (committed) await renderRecord(record);
        },
        async settle(record, settlement, _details, guard) {
            if (record.delivery?.mode === 'gallery') {
                await guard();
                return;
            }
            const slotsToRemove = [];
            if (settlement.mode === 'discard') {
                for (const item of record.items) {
                    const [delivered, failed] = await Promise.all([
                        getPreview(item.imgId).catch(() => null),
                        getPreview(`failed-${item.imgId}`).catch(() => null),
                    ]);
                    await guard();
                    const target = requireAvailableTarget(record, item);
                    if (!delivered && !failed && target) slotsToRemove.push(item.slotId);
                }
            } else if (settlement.mode === 'fail') {
                const errorType = settlement.errorType?.label ? settlement.errorType : describeMissingJob(record);
                for (const item of record.items) {
                    const [delivered, failed] = await Promise.all([
                        getPreview(item.imgId).catch(() => null),
                        getPreview(`failed-${item.imgId}`).catch(() => null),
                    ]);
                    await guard();
                    if (delivered || failed) continue;
                    await this.failItem(record, item, errorType, guard);
                }
            }
            if (settlement.mode !== 'discard') slotsToRemove.push(...(record.replacedSlotIds || []));
            let removedTargets = [];
            if (slotsToRemove.length > 0) {
                removedTargets = await commitImageJobDeliverySlotRemoval({
                    slotIds: slotsToRemove,
                    resolveTarget: slotId => requireAvailableTarget(record, { slotId }),
                    isEditing: isMessageBeingEdited,
                    isAnyEditing: isAnyMessageBeingEdited,
                    guard,
                    persist: async () => {
                        const target = recordTarget(record, record.items[0]);
                        if (target.ctx?.saveChat) await Promise.resolve(target.ctx.saveChat());
                    },
                });
            }
            await guard();
            await renderRecord(record);
            const removedMessageIds = new Set(removedTargets
                .filter(target => target.isActiveSwipe)
                .map(target => target.messageId));
            await Promise.all([...removedMessageIds].map(messageId => renderPreviewsForMessage(
                messageId,
                { refreshSlotIds: slotsToRemove },
            )));
        },
        async beforeForget(record, _settlement, _details, guard) {
            if (!record.originRunId) return;
            await guard();
            const current = await getPendingImageJob(record.jobId);
            // 非 adopting 的 Draw Run journal 按 normalize 契约必然已经打开 ACK gate；
            // 这里是删除前的最后一道不变量断言，不是正常等待分支。
            if (!current?.originRunAckReady) {
                const error = new Error('Draw Run marker 尚未确认清理，暂缓 ACK');
                error.code = 'DRAW_RUN_MARKER_NOT_CLEARED';
                throw error;
            }
            await runtimeDrawRunClient.acknowledgeRun(record.originRunId);
            await guard();
        },
        async afterForget(record) {
            await renderRecord(record, { final: true });
        },
    };
}

function clearRecoveryTimer() {
    if (recoveryTimer) clearTimeout(recoveryTimer);
    recoveryTimer = null;
    recoveryTimerAt = 0;
}

function scheduleRecovery(delay = 0) {
    if (!runtimeEvents) return;
    const runAt = Date.now() + Math.max(0, delay);
    if (recoveryTimer && recoveryTimerAt <= runAt) return;
    clearRecoveryTimer();
    recoveryTimerAt = runAt;
    recoveryTimer = setTimeout(() => {
        recoveryTimer = null;
        recoveryTimerAt = 0;
        void reconcilePendingImageJobs();
    }, Math.max(0, runAt - Date.now()));
}

async function runRecoveryPass() {
    const ctx = getContext();
    const chatId = String(ctx?.chatId || '');
    if (!chatId) return;
    let allRecords;
    try {
        allRecords = await listPendingImageJobs();
    } catch (error) {
        console.warn('[ImageJobs] 暂时无法读取后台任务恢复记录，稍后重试:', error);
        scheduleRecovery(RETRY_DELAY_MS);
        return;
    }
    try {
        await runDrawRunRecoveryPass({
            ctx,
            records: allRecords,
            client: runtimeDrawRunClient,
            scheduleRecovery,
        });
    } catch (error) {
        // 第二刀恢复失败不能阻断同一轮第一刀任务交付，也不能失去后续唤醒。
        console.warn('[Draw Run] 后台规划任务恢复异常，稍后重试:', error);
        scheduleRecovery(RETRY_DELAY_MS);
    }
    // adoption 可能刚创建或激活 journal，必须重新读取当前事实再交给第一刀。
    try {
        allRecords = await listPendingImageJobs();
    } catch (error) {
        console.warn('[ImageJobs] 暂时无法刷新后台任务恢复记录，稍后重试:', error);
        scheduleRecovery(RETRY_DELAY_MS);
        return;
    }
    const records = allRecords.filter(record => (
        record.state !== PendingJobState.ADOPTING
        && (record.delivery?.mode === 'gallery' || record.delivery?.chatId === chatId)
    ));
    if (records.length === 0) return;

    let backendJobs;
    try {
        backendJobs = await runtimeClient.listJobs();
    } catch (error) {
        console.warn('[ImageJobs] 暂时无法查询后台任务，等待网络恢复:', error);
        scheduleRecovery(RETRY_DELAY_MS);
        return;
    }

    const { plan, unclaimed } = planImageJobReattach({ records, backendJobs });
    if (unclaimed.length > 0) {
        console.info(`[ImageJobs] 后端有 ${unclaimed.length} 个不属于当前浏览器日志的任务，保持不动`);
    }

    const waits = plan.filter(entry => entry.action === ReattachAction.WAIT);
    if (waits.length > 0) {
        const nextExpiry = Math.min(...waits.map(entry => entry.record.leaseExpiresAt));
        scheduleRecovery(Math.max(100, nextExpiry - Date.now() + 10));
    }

    const delivery = createDeliveryAdapter();
    const actionable = plan.filter(entry => {
        if (entry.action !== ReattachAction.ATTACH) return entry.action !== ReattachAction.WAIT;
        return resultDecoders.has(entry.record.provider);
    });
    const results = await Promise.allSettled(actionable.map(entry => executeImageJobReattachEntry({
        entry,
        client: runtimeClient,
        delivery,
    })));
    for (const result of results) {
        if (result.status === 'rejected' && result.reason?.code !== 'PENDING_JOB_LEASE_LOST') {
            console.warn('[ImageJobs] 后台任务接回未完成，保留记录稍后重试:', result.reason);
            scheduleRecovery(RETRY_DELAY_MS);
        } else if (result.status === 'fulfilled' && result.value === false) {
            // plan 与 claim 之间被其他标签页抢先接管；若对方随后退出，仍需在租约后重试。
            scheduleRecovery(RETRY_DELAY_MS);
        }
    }
}

export async function reconcilePendingImageJobs() {
    if (!runtimeEvents) return;
    if (recoveryRunning) {
        recoveryQueued = true;
        return recoveryRunning;
    }
    recoveryRunning = (async () => {
        do {
            recoveryQueued = false;
            await runRecoveryPass();
        } while (runtimeEvents && recoveryQueued);
    })();
    try {
        await recoveryRunning;
    } finally {
        recoveryRunning = null;
    }
}

export function startImageJobRecovery({ decoders = {}, client, drawRunsClient } = {}) {
    for (const [provider, decode] of Object.entries(decoders)) {
        if (typeof decode === 'function') resultDecoders.set(provider, decode);
    }
    if (client) runtimeClient = client;
    if (drawRunsClient) runtimeDrawRunClient = drawRunsClient;
    if (runtimeEvents) {
        scheduleRecovery();
        return;
    }

    runtimeEvents = createModuleEvents('imageJobRecovery');
    runtimeEvents.on(event_types.CHAT_CHANGED, () => scheduleRecovery(200));
    window.addEventListener('online', reconcilePendingImageJobs);
    document.addEventListener('visibilitychange', handleRecoveryVisibilityChange);
    scheduleRecovery();
}

export function stopImageJobRecovery() {
    if (!runtimeEvents) return;
    runtimeEvents.cleanup();
    runtimeEvents = null;
    clearRecoveryTimer();
    window.removeEventListener('online', reconcilePendingImageJobs);
    document.removeEventListener('visibilitychange', handleRecoveryVisibilityChange);
    // The active attachment is intentionally not aborted: this signal means extension teardown,
    // not user cancellation. It may finish persistence, or the page can die and its lease will expire.
}
