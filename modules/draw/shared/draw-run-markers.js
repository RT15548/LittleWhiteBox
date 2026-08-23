import { assertDrawRunId } from './draw-run-identifiers.js';

export const DRAW_RUN_MARKER_VERSION = 1;

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

export function createDrawRunMarker({ provider, sourceHash, createdAt = Date.now() } = {}) {
    const normalizedProvider = String(provider || '').trim();
    const normalizedHash = String(sourceHash || '').trim();
    const timestamp = Number(createdAt);
    if (!normalizedProvider || !normalizedHash || !Number.isFinite(timestamp) || timestamp <= 0) {
        throw new TypeError('Draw Run marker 内容无效');
    }
    return Object.freeze({
        version: DRAW_RUN_MARKER_VERSION,
        provider: normalizedProvider,
        sourceHash: normalizedHash,
        createdAt: Math.floor(timestamp),
    });
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

export function persistedChatHasDrawRunMarker(persistedChat, runId, expectedMarker = {}) {
    const id = assertDrawRunId(runId);
    return (Array.isArray(persistedChat) ? persistedChat : []).some((message) => {
        if (!message || typeof message !== 'object') return false;
        return listDrawRunMarkers(message).some((entry) => (
            entry.runId === id
            && entry.marker.version === DRAW_RUN_MARKER_VERSION
            && (!expectedMarker.provider || entry.marker.provider === expectedMarker.provider)
            && (!expectedMarker.sourceHash || entry.marker.sourceHash === expectedMarker.sourceHash)
            && (!expectedMarker.createdAt || entry.marker.createdAt === expectedMarker.createdAt)
        ));
    });
}
