import { getContext } from '../../../../../../extensions.js';
import { getRequestHeaders, syncMesToSwipe } from '../../../../../../../script.js';
import { publishDrawRunActivity } from './draw-run-activity.js';
import { createImageBackendJobsClient } from './backend-image-jobs.js';
import { createDrawRunClient } from './draw-run-client.js';
import {
    saveChatAndConfirm,
    withConfirmableChatMutation,
} from './confirmable-chat-save.js';
import {
    getDrawRunMarkerText,
    listActiveSwipeDrawRunMarkers,
    listDrawRunMarkers,
    persistedChatHasDrawRunMarker,
    persistedDrawRunTargetMatches,
    setDrawRunMarker,
} from './draw-run-markers.js';
import {
    listPendingImageJobs,
    PendingJobState,
    requestPendingImageJobCancellation,
} from './pending-image-jobs.js';
import { isSceneSlotAlive } from './scene-placement.js';
import { DRAW_SLOT_COPY } from './image-record.js';

const client = createDrawRunClient({ getHeaders: getRequestHeaders });
const imageClient = createImageBackendJobsClient({ getHeaders: getRequestHeaders });
const pendingStateReadVersions = new WeakMap();
let pendingStateReadVersion = 0;

export function captureDrawCancellationTarget(messageId, ctx = getContext()) {
    const message = ctx?.chat?.[Number(messageId)];
    return { ctx, message, messageId: Number(messageId), chatId: String(ctx?.chatId || ''),
        swipeIndex: message?.swipe_id ?? 0, text: String(message?.mes ?? ''),
        entries: message ? listActiveSwipeDrawRunMarkers(message) : [] };
}

export function isDrawCancellationTargetCurrent(target) {
    const ctx = getContext();
    return String(ctx?.chatId || '') === target.chatId && ctx.chat?.includes(target.message)
        && (target.message.swipe_id ?? 0) === target.swipeIndex;
}

function getPendingDrawRuns(messageId, ctx = getContext()) {
    const normalizedMessageId = Number(messageId);
    if (!Number.isSafeInteger(normalizedMessageId) || normalizedMessageId < 0) return [];
    const message = ctx?.chat?.[normalizedMessageId];
    if (!message) return [];
    return listActiveSwipeDrawRunMarkers(message);
}

function findPendingChildDrawRuns(messageId, records, ctx = getContext()) {
    const normalizedMessageId = Number(messageId);
    if (!Number.isSafeInteger(normalizedMessageId) || normalizedMessageId < 0) return [];
    const chatId = String(ctx?.chatId || '');
    const message = ctx?.chat?.[normalizedMessageId];
    if (!chatId || !message) return [];
    const activeSwipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    const activeText = String(message.mes ?? '');
    return (Array.isArray(records) ? records : []).filter(record => {
        if (!record || ![PendingJobState.ADOPTING, PendingJobState.ACTIVE, PendingJobState.CANCELLING]
                .includes(record.state)) return false;
        if (String(record.chatTarget?.chatId || record.delivery?.chatId || '') !== chatId) return false;
        const recordSwipeIndex = Number(record.delivery?.mode === 'slots'
            ? record.delivery?.swipeIndex
            : record.gallery?.swipeIndex);
        if (record.delivery?.mode === 'slots') {
            // messageId 是数组下标；用户删除更早楼层后会移动。slotId 才是 slots
            // 交付的稳定身份；swipe 下标也会在用户删除更早 swipe 后移动，因此
            // slots 模式只按当前正文定位，不能拿任何冻结下标误判任务消失。
            return record.items?.some(item => !item.discarded && isSceneSlotAlive(activeText, item?.slotId));
        }
        if (recordSwipeIndex !== activeSwipeIndex) return false;
        return Number(record.gallery?.messageId) === normalizedMessageId;
    });
}

export function hasPendingDrawRun(messageId, ctx = getContext()) {
    return getPendingDrawRuns(messageId, ctx).length > 0;
}

function getPendingDrawRunState(messageId, ctx = getContext()) {
    const entries = getPendingDrawRuns(messageId, ctx);
    const message = ctx?.chat?.[Number(messageId)];
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    return {
        pending: entries.length > 0,
        cancelling: entries.some(entry => Number(entry.marker?.cancelRequestedAt) > 0),
        provider: entries[0]?.marker?.provider || '',
        runId: entries[0]?.runId || '',
        swipeIndex,
    };
}

export async function getPendingDrawWorkState(messageId, ctx = getContext()) {
    const normalizedMessageId = Number(messageId);
    const chatId = String(ctx?.chatId || '');
    const message = ctx?.chat?.[normalizedMessageId];
    const readVersion = ++pendingStateReadVersion;
    if (message) pendingStateReadVersions.set(message, readVersion);
    const markerState = getPendingDrawRunState(messageId, ctx);
    if (markerState.pending) return { ...markerState, backendAccepted: false };
    if (!chatId || !message) return { ...markerState, backendAccepted: false };
    const swipeIndex = Number.isSafeInteger(message.swipe_id) ? message.swipe_id : 0;
    const records = await listPendingImageJobs();
    if (pendingStateReadVersions.get(message) !== readVersion) return null;
    // IndexedDB 读取期间用户可能切换聊天、swipe，或者同一楼层对象已被重载。
    // 旧读取不能覆盖新上下文刚刚发布的状态。
    const liveCtx = getContext();
    const liveMessage = liveCtx?.chat?.[normalizedMessageId];
    const liveSwipeIndex = Number.isSafeInteger(liveMessage?.swipe_id) ? liveMessage.swipe_id : 0;
    if (String(liveCtx?.chatId || '') !== chatId
        || liveMessage !== message
        || liveSwipeIndex !== swipeIndex) return null;
    const children = findPendingChildDrawRuns(messageId, records, liveCtx);
    return {
        pending: children.length > 0,
        cancelling: children.some(record => (
            record.state === PendingJobState.CANCELLING || record.cancelRequested === true
        )),
        provider: children[0]?.provider || '',
        runId: children[0]?.originRunId || '',
        swipeIndex,
        backendAccepted: children.length > 0,
    };
}

export async function cancelPendingDrawRuns(messageId, {
    ctx = getContext(),
    target = captureDrawCancellationTarget(messageId, ctx),
    drawRunClient = client,
    saveAndConfirm = saveChatAndConfirm,
    syncActiveSwipe = syncMesToSwipe,
    now = Date.now,
} = {}) {
    const entries = target.entries;
    if (entries.length === 0) return false;
    const activityProvider = entries[0]?.marker?.provider || '';
    const activityTarget = {
        provider: activityProvider,
        chatId: target.chatId,
        messageId: target.messageId,
        swipeIndex: entries[0]?.swipeIndex,
        runId: entries[0]?.runId,
    };
    publishDrawRunActivity({
        ...activityTarget,
        phase: 'cancelling',
    });

    // 先把用户取消意图写进 marker。提交 POST 与取消 POST 可能交错：取消先到会
    // 暂时得到 404，只有这个持久事实才能让刷新后的恢复器在 run 出现时补发取消。
    const cancellationTime = Math.max(1, Math.floor(Number(now()) || Date.now()));
    const targetMessage = target.message;
    const originalTargets = new Map(entries.map(entry => [entry.runId, {
        marker: { ...entry.marker },
        text: getDrawRunMarkerText({ message: targetMessage, swipeIndex: entry.swipeIndex }),
    }]));
    let persistenceError = null;
    try {
        await withConfirmableChatMutation(ctx, async () => {
            const message = targetMessage;
            const liveId = ctx.chat?.indexOf(message) ?? -1;
            if (liveId < 0 || String(getContext()?.chatId || '') !== target.chatId) throw new Error(DRAW_SLOT_COPY.sourceChanged);
            const liveEntries = listDrawRunMarkers(message)
                .filter(entry => originalTargets.has(entry.runId));
            if (liveEntries.length === 0) return;
            for (const entry of liveEntries) {
                entry.marker = setDrawRunMarker({
                    message,
                    messageId: liveId,
                    swipeIndex: entry.swipeIndex,
                    runId: entry.runId,
                    marker: { ...entry.marker, cancelRequestedAt: cancellationTime },
                    syncActiveSwipe,
                });
                const original = entries.find(candidate => candidate.runId === entry.runId);
                if (original) original.marker = entry.marker;
            }
            await saveAndConfirm({
                ctx,
                precondition: persistedChat => liveEntries.every((entry) => {
                    const original = originalTargets.get(entry.runId);
                    return persistedDrawRunTargetMatches(
                        persistedChat,
                        entry.runId,
                        original?.text,
                        original?.marker,
                    );
                }),
                verify: persistedChat => liveEntries.every(entry => persistedChatHasDrawRunMarker(
                    persistedChat,
                    entry.runId,
                    entry.marker,
                )),
            });
        });
    } catch (error) {
        persistenceError = error;
        if (error?.saveAttempted === false) {
            const message = targetMessage;
            const liveId = ctx.chat?.indexOf(message) ?? -1;
            for (const entry of liveId >= 0 ? listDrawRunMarkers(message).filter(item => originalTargets.has(item.runId)) : []) {
                try {
                    entry.marker = setDrawRunMarker({
                        message,
                        messageId: liveId,
                        swipeIndex: entry.swipeIndex,
                        runId: entry.runId,
                        marker: originalTargets.get(entry.runId)?.marker,
                        syncActiveSwipe,
                    });
                } catch (rollbackError) {
                    console.warn('[Draw Run] 未落盘的本地取消意图恢复失败:', rollbackError);
                }
            }
        }
        console.warn('[Draw Run] 取消意图未能确认落盘，仍尝试直接取消后台任务:', error);
    }

    const results = await Promise.allSettled(
        entries.map(entry => drawRunClient.cancelRun(entry.runId)),
    );
    const cancellationError = results.find(result => result.status === 'rejected')?.reason || null;
    if (cancellationError || persistenceError) {
        publishDrawRunActivity({
            ...activityTarget,
            phase: 'cancel_failed',
            error: cancellationError || persistenceError,
            wakeRecovery: true,
        });
        if (cancellationError && typeof cancellationError === 'object') {
            cancellationError.persistenceError = persistenceError;
        }
        throw cancellationError || persistenceError;
    }
    publishDrawRunActivity({
        ...activityTarget,
        phase: 'cancelling',
        wakeRecovery: true,
    });
    return true;
}

export async function cancelPendingChildDrawRuns(messageId, {
    ctx = getContext(),
    target = captureDrawCancellationTarget(messageId, ctx),
    drawRunClient = client,
    imageJobClient = imageClient,
    recordsLoader = listPendingImageJobs,
} = {}) {
    const records = await recordsLoader();
    const children = findPendingChildDrawRuns(target.messageId, records, { chatId: target.chatId,
        chat: { [target.messageId]: { mes: target.text, swipe_id: target.swipeIndex } } });
    if (children.length === 0) return false;

    const provider = children[0]?.provider || '';
    const activityTarget = {
        provider,
        chatId: target.chatId,
        messageId: target.messageId,
        swipeIndex: target.swipeIndex,
        runId: children[0]?.originRunId,
    };
    publishDrawRunActivity({
        ...activityTarget,
        phase: 'cancelling',
    });
    const errors = [];
    await Promise.all(children.map(async record => {
        try {
            if (!await requestPendingImageJobCancellation(record.jobId)) return;
        } catch (error) { errors.push(error); }
        const attempts = await Promise.allSettled([
            ...(record.originRunId ? [drawRunClient.cancelRun(record.originRunId)] : []),
            imageJobClient.cancelJob(record.jobId),
        ]);
        errors.push(...attempts.filter(result => result.status === 'rejected').map(result => result.reason));
    }));
    publishDrawRunActivity({
        ...activityTarget,
        phase: errors.length ? 'cancel_failed' : 'cancelling',
        wakeRecovery: true,
    });
    if (errors.length) throw new globalThis.AggregateError(errors, DRAW_SLOT_COPY.cancelFailed);
    return true;
}
