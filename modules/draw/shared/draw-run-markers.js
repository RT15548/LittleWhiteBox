import { assertDrawRunId } from './draw-run-identifiers.js';
import { isSceneSlotAlive } from './scene-placement.js';

export const DRAW_RUN_MARKER_VERSION = 1;

const AUTO_DONE_KEYS = Object.freeze({
    novelai: 'xb_novel_auto_done',
    'sd-webui': 'xb_sd_auto_done',
    comfyui: 'xb_comfy_auto_done',
});

function requireMessage(message) {
    if (!message || typeof message !== 'object') throw new TypeError('Draw Run marker 需要目标消息');
    return message;
}

function normalizeSwipeIndex(message, swipeIndex) {
    const fallback = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    const index = swipeIndex === undefined ? fallback : Number(swipeIndex);
    if (!Number.isSafeInteger(index) || index < 0) throw new TypeError('Draw Run swipe 索引无效');
    return index;
}

function hasSwipeExtra(message, index) {
    return Array.isArray(message.swipe_info)
        && message.swipe_info[index]
        && typeof message.swipe_info[index] === 'object';
}

function isActiveSwipe(message, index) {
    const activeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    return activeIndex === index;
}

function markerMap(extra, create = false) {
    if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return null;
    if (!extra.xbDrawRuns && create) extra.xbDrawRuns = {};
    return extra.xbDrawRuns && typeof extra.xbDrawRuns === 'object' && !Array.isArray(extra.xbDrawRuns)
        ? extra.xbDrawRuns
        : null;
}

function extraForSwipe(message, index, create = false) {
    if (isActiveSwipe(message, index)) {
        if ((!message.extra || typeof message.extra !== 'object' || Array.isArray(message.extra)) && create) {
            message.extra = {};
        }
        return message.extra || null;
    }
    if (!hasSwipeExtra(message, index)) {
        if (create) throw new Error('目标 swipe 不存在，无法保存 Draw Run marker');
        return null;
    }
    const swipe = message.swipe_info[index];
    if ((!swipe.extra || typeof swipe.extra !== 'object' || Array.isArray(swipe.extra)) && create) {
        swipe.extra = {};
    }
    return swipe.extra || null;
}

function syncActiveMarker({ message, messageId, swipeIndex, syncActiveSwipe }) {
    if (!Number.isInteger(message.swipe_id)
        || !isActiveSwipe(message, swipeIndex)
        || !hasSwipeExtra(message, swipeIndex)) return;
    if (typeof syncActiveSwipe !== 'function') {
        throw new TypeError('活动 swipe 的 Draw Run marker 必须通过 syncMesToSwipe 镜像');
    }
    if (syncActiveSwipe(messageId) !== true) {
        throw new Error('活动 swipe 的 Draw Run marker 镜像失败');
    }
}

export function createDrawRunMarker({
    provider,
    sourceHash,
    targetHash,
    createdAt = Date.now(),
    cancelRequestedAt,
    automatic,
} = {}) {
    const normalizedProvider = String(provider || '').trim();
    const normalizedHash = String(sourceHash || '').trim();
    const normalizedTargetHash = String(targetHash || '').trim();
    const timestamp = Number(createdAt);
    if (!normalizedProvider || !normalizedHash || !normalizedTargetHash
        || !Number.isFinite(timestamp) || timestamp <= 0) {
        throw new TypeError('Draw Run marker 内容无效');
    }
    const cancellationTime = cancelRequestedAt === undefined
        ? 0
        : Number(cancelRequestedAt);
    if (cancelRequestedAt !== undefined
        && (!Number.isFinite(cancellationTime) || cancellationTime <= 0)) {
        throw new TypeError('Draw Run marker 取消时间无效');
    }
    return Object.freeze({
        version: DRAW_RUN_MARKER_VERSION,
        provider: normalizedProvider,
        sourceHash: normalizedHash,
        targetHash: normalizedTargetHash,
        createdAt: Math.floor(timestamp),
        ...(cancellationTime > 0 ? { cancelRequestedAt: Math.floor(cancellationTime) } : {}),
        ...(automatic === true ? { automatic: true } : {}),
    });
}

export function getDrawRunAutomaticCompletion(message, swipeIndex, provider) {
    const target = requireMessage(message);
    const index = normalizeSwipeIndex(target, swipeIndex);
    const key = AUTO_DONE_KEYS[String(provider || '').trim()];
    if (!key) return false;
    return extraForSwipe(target, index, false)?.[key] === true;
}

export function setDrawRunAutomaticCompletion({
    message,
    messageId,
    swipeIndex,
    provider,
    completed,
    syncActiveSwipe,
} = {}) {
    const target = requireMessage(message);
    const index = normalizeSwipeIndex(target, swipeIndex);
    const key = AUTO_DONE_KEYS[String(provider || '').trim()];
    if (!key) throw new TypeError('Draw Run 自动配图 Provider 无效');
    const extra = extraForSwipe(target, index, completed === true);
    const previous = extra?.[key];
    if (completed === true) extra[key] = true;
    else if (extra) delete extra[key];
    try {
        syncActiveMarker({ message: target, messageId, swipeIndex: index, syncActiveSwipe });
    } catch (error) {
        if (extra) {
            if (previous === undefined) delete extra[key];
            else extra[key] = previous;
        }
        throw error;
    }
    return previous === true;
}

export function listActiveSwipeDrawRunMarkers(message) {
    const activeSwipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    return listDrawRunMarkers(message).filter(entry => entry.swipeIndex === activeSwipeIndex);
}

export function setDrawRunMarker({
    message,
    messageId,
    swipeIndex,
    runId,
    marker,
    syncActiveSwipe,
} = {}) {
    const target = requireMessage(message);
    const index = normalizeSwipeIndex(target, swipeIndex);
    const id = assertDrawRunId(runId);
    const normalizedMarker = createDrawRunMarker(marker);
    const extra = extraForSwipe(target, index, true);
    const markers = markerMap(extra, true);
    const hadPrevious = Object.hasOwn(markers, id);
    const previous = markers[id];
    markers[id] = { ...normalizedMarker };
    try {
        syncActiveMarker({ message: target, messageId, swipeIndex: index, syncActiveSwipe });
    } catch (error) {
        if (hadPrevious) markers[id] = previous;
        else delete markers[id];
        if (Object.keys(markers).length === 0) delete extra.xbDrawRuns;
        throw error;
    }
    return normalizedMarker;
}

export function removeDrawRunMarker({
    message,
    messageId,
    swipeIndex,
    runId,
    syncActiveSwipe,
} = {}) {
    const target = requireMessage(message);
    const index = normalizeSwipeIndex(target, swipeIndex);
    const id = assertDrawRunId(runId);
    const extra = extraForSwipe(target, index, false);
    const markers = markerMap(extra, false);
    if (!markers || !Object.hasOwn(markers, id)) return false;
    const previous = markers[id];
    delete markers[id];
    if (Object.keys(markers).length === 0) delete extra.xbDrawRuns;
    try {
        syncActiveMarker({ message: target, messageId, swipeIndex: index, syncActiveSwipe });
    } catch (error) {
        markerMap(extra, true)[id] = previous;
        throw error;
    }
    return true;
}

export function getDrawRunMarker(message, swipeIndex, runId) {
    const target = requireMessage(message);
    const index = normalizeSwipeIndex(target, swipeIndex);
    const markers = markerMap(extraForSwipe(target, index, false), false);
    const marker = markers?.[assertDrawRunId(runId)];
    return marker && typeof marker === 'object' ? { ...marker } : null;
}

export function listDrawRunMarkers(message) {
    const target = requireMessage(message);
    const results = [];
    const seen = new Set();
    const activeIndex = normalizeSwipeIndex(target);
    const collect = (index, extra) => {
        const markers = markerMap(extra, false);
        Object.entries(markers || {}).forEach(([runId, marker]) => {
            if (seen.has(runId) || !marker || typeof marker !== 'object') return;
            try {
                assertDrawRunId(runId);
            } catch {
                return;
            }
            seen.add(runId);
            results.push({ runId, swipeIndex: index, marker: { ...marker } });
        });
    };
    collect(activeIndex, target.extra);
    if (Array.isArray(target.swipe_info)) {
        target.swipe_info.forEach((swipe, index) => {
            collect(index, swipe?.extra);
        });
    }
    return results;
}

export function findDrawRunMarker(chat, runId) {
    const id = assertDrawRunId(runId);
    for (const [messageId, message] of (Array.isArray(chat) ? chat : []).entries()) {
        if (!message || typeof message !== 'object') continue;
        const entry = listDrawRunMarkers(message).find(candidate => candidate.runId === id);
        if (entry) return { ...entry, message, messageId };
    }
    return null;
}

export function getDrawRunMarkerText(target) {
    const message = target?.message;
    const swipeIndex = Number(target?.swipeIndex);
    if (!message || !Number.isSafeInteger(swipeIndex) || swipeIndex < 0) return null;
    const activeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    if (swipeIndex === activeIndex) return typeof message.mes === 'string' ? message.mes : null;
    return Array.isArray(message.swipes) && typeof message.swipes[swipeIndex] === 'string'
        ? message.swipes[swipeIndex]
        : null;
}

export function setDrawRunMarkerText(target, text) {
    const message = target?.message;
    const swipeIndex = Number(target?.swipeIndex);
    const value = String(text ?? '');
    if (!message || !Number.isSafeInteger(swipeIndex) || swipeIndex < 0) return false;
    const activeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    if (swipeIndex === activeIndex) {
        message.mes = value;
        if (Array.isArray(message.swipes) && swipeIndex < message.swipes.length) {
            message.swipes[swipeIndex] = value;
        }
        return true;
    }
    if (!Array.isArray(message.swipes) || swipeIndex >= message.swipes.length) return false;
    message.swipes[swipeIndex] = value;
    return true;
}

export function persistedChatHasDrawRunSlots(persistedChat, runId, slotIds = []) {
    const target = findDrawRunMarker(persistedChat, runId);
    const text = getDrawRunMarkerText(target);
    const expected = [...new Set((Array.isArray(slotIds) ? slotIds : [])
        .map(value => String(value || '').trim())
        .filter(Boolean))];
    if (typeof text !== 'string' || expected.length === 0) return false;
    return expected.every(slotId => isSceneSlotAlive(text, slotId));
}

export function findPersistedDrawRunDeliveryTarget(persistedChat, delivery) {
    const messageId = Number(delivery?.messageId);
    const swipeIndex = Number(delivery?.swipeIndex);
    if (!Number.isSafeInteger(messageId) || messageId < 0
        || !Number.isSafeInteger(swipeIndex) || swipeIndex < 0) return null;
    if (!Array.isArray(persistedChat)) return null;
    // SillyTavern 的聊天文件第 0 项是 { chat_metadata }，ctx.chat 则只含消息。
    // journal 冻结的是 ctx.chat 下标，因此读回文件时必须跨过元数据头。
    const hasMetadataHeader = persistedChat[0]?.chat_metadata
        && typeof persistedChat[0].chat_metadata === 'object';
    const message = persistedChat[messageId + (hasMetadataHeader ? 1 : 0)];
    if (!message || typeof message !== 'object') return null;
    return { message, messageId, swipeIndex };
}

export function persistedChatHasDeliverySlots(persistedChat, delivery, slotIds = []) {
    const target = findPersistedDrawRunDeliveryTarget(persistedChat, delivery);
    const text = getDrawRunMarkerText(target);
    const expected = [...new Set((Array.isArray(slotIds) ? slotIds : [])
        .map(value => String(value || '').trim())
        .filter(Boolean))];
    if (expected.length === 0) return false;
    if (typeof text === 'string' && expected.every(slotId => isSceneSlotAlive(text, slotId))) {
        return true;
    }
    // messageId 只是 adoption 当时的数组下标。用户删除更早的楼层后下标会移动，
    // 但确定性 slotId 才是交付身份；恢复时必须按它在所有正文与非活动 swipe 中找回。
    return (Array.isArray(persistedChat) ? persistedChat : []).some((message) => {
        if (!message || typeof message !== 'object') return false;
        const activeSwipe = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
        const candidates = [message.mes];
        if (Array.isArray(message.swipes)) {
            message.swipes.forEach((swipeText, index) => {
                if (index !== activeSwipe) candidates.push(swipeText);
            });
        }
        return candidates.some(candidate => typeof candidate === 'string'
            && expected.every(slotId => isSceneSlotAlive(candidate, slotId)));
    });
}

export function persistedDrawRunTargetMatches(persistedChat, runId, expectedText, expectedMarker = {}) {
    const target = findDrawRunMarker(persistedChat, runId);
    if (!target || getDrawRunMarkerText(target) !== String(expectedText ?? '')) return false;
    const marker = target.marker;
    return marker.version === DRAW_RUN_MARKER_VERSION
        && (!expectedMarker.provider || marker.provider === expectedMarker.provider)
        && (!expectedMarker.sourceHash || marker.sourceHash === expectedMarker.sourceHash)
        && (!expectedMarker.targetHash || marker.targetHash === expectedMarker.targetHash)
        && (!expectedMarker.createdAt || marker.createdAt === expectedMarker.createdAt)
        && (expectedMarker.automatic !== true || marker.automatic === true);
}

export function persistedChatHasDrawRunAutomaticCompletion(
    persistedChat,
    { messageId, swipeIndex, provider } = {},
) {
    const target = findPersistedDrawRunDeliveryTarget(persistedChat, { messageId, swipeIndex });
    return target
        ? getDrawRunAutomaticCompletion(target.message, target.swipeIndex, provider)
        : false;
}

export function persistedChatHasDrawRunMarker(persistedChat, runId, expectedMarker = {}) {
    const id = assertDrawRunId(runId);
    return (Array.isArray(persistedChat) ? persistedChat : []).some((message) => {
        if (!message || typeof message !== 'object') return false;
        return listDrawRunMarkers(message).some((entry) => (
            entry.runId === id
            && entry.marker.version === DRAW_RUN_MARKER_VERSION
            && (!expectedMarker.provider || entry.marker.provider === expectedMarker.provider)
            && (!expectedMarker.sourceHash || entry.marker.sourceHash === expectedMarker.sourceHash)
            && (!expectedMarker.targetHash || entry.marker.targetHash === expectedMarker.targetHash)
            && (!expectedMarker.createdAt || entry.marker.createdAt === expectedMarker.createdAt)
            && (!expectedMarker.cancelRequestedAt
                || entry.marker.cancelRequestedAt === expectedMarker.cancelRequestedAt)
            && (expectedMarker.automatic !== true || entry.marker.automatic === true)
        ));
    });
}
