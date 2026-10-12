import { getContext } from '../../../../../../extensions.js';
import { getCurrentUserHandle } from '../../../../../../user.js';
import { getRequestHeaders } from '../../../../../../../script.js';
import { publishDrawRunActivity } from './draw-run-activity.js';
import { createImageBackendJobsClient } from './backend-image-jobs.js';
import { cancelDrawWork, captureDrawCancellationJobs, holdDrawCancellation } from './draw-work-cancellation.js';
import {
    listActiveSwipeDrawRunMarkers,
} from './draw-run-markers.js';
import {
    listPendingImageJobs,
    PendingJobState,
} from './pending-image-jobs.js';
import { isSceneSlotAlive } from './scene-placement.js';

const imageClient = createImageBackendJobsClient({ getHeaders: getRequestHeaders, getOwner: getCurrentUserHandle });
const pendingStateReadVersions = new WeakMap();
let pendingStateReadVersion = 0;

export function captureDrawCancellationTarget(messageId, ctx = getContext()) {
    const normalizedId = messageId === null || messageId === undefined ? -1 : Number(messageId);
    const message = ctx?.chat?.[normalizedId];
    return { ctx, message, owner: getCurrentUserHandle(), messageId: normalizedId, chatId: String(ctx?.chatId || ''),
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
        if (!record || ![PendingJobState.PREPARING, PendingJobState.ADOPTING, PendingJobState.ACTIVE, PendingJobState.CANCELLING]
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

// One floor click owns one exact backend cancellation set. Persist it before
// any monitor may issue a single-job cancellation. No chat mutation is needed:
// the intent journal covers refresh, and backend state covers acknowledged runs.
export function cancelFloorDrawWork(messageId, {
    target = captureDrawCancellationTarget(messageId),
    jobs = [],
    imageJobClient = imageClient,
    recordsLoader = listPendingImageJobs,
    cancellationJournal,
} = {}) {
    const capturedJobs = [...jobs];
    const liveJobIds = captureDrawCancellationJobs(capturedJobs.map(job => job.backendCancel.signal));
    const recordsPromise = recordsLoader();
    const operation = holdDrawCancellation(capturedJobs.map(job => job.backendCancel.signal), async () => {
        const records = await recordsPromise;
        const children = findPendingChildDrawRuns(target.messageId, records, { chatId: target.chatId,
            chat: { [target.messageId]: { mes: target.text, swipe_id: target.swipeIndex } } });
        const targets = {
            owner: target.owner,
            jobIds: [...new Set([...liveJobIds, ...children.map(record => record.jobId)])],
            runIds: [...new Set([...target.entries.map(entry => entry.runId),
                ...capturedJobs.map(job => job.runId).filter(Boolean),
                ...children.map(record => record.originRunId).filter(Boolean)])],
        };
        const activity = { chatId: target.chatId, messageId: target.messageId, swipeIndex: target.swipeIndex,
            provider: children[0]?.provider || target.entries[0]?.marker?.provider || '',
            runId: targets.runIds[0] || '' };
        publishDrawRunActivity({ ...activity, phase: 'cancelling' });
        try {
            const cancelled = await cancelDrawWork(targets, imageJobClient, cancellationJournal);
            publishDrawRunActivity({ ...activity, phase: 'cancelling', wakeRecovery: true });
            return cancelled || capturedJobs.length > 0;
        } catch (error) {
            publishDrawRunActivity({ ...activity, phase: 'cancel_failed', error, wakeRecovery: true });
            throw error;
        }
    });
    for (const job of capturedJobs) {
        job.abortReason ||= 'user';
        job.backendCancel.abort();
        job.controller.abort();
    }
    return operation;
}
