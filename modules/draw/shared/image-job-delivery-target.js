import { isSceneSlotAlive, removeSceneSlotPlaceholders } from './scene-placement.js';

export const ImageJobDeliveryTargetState = {
    UNAVAILABLE: 'unavailable',
    REMOVED: 'removed',
    ALIVE: 'alive',
};

export class ImageJobDeliveryDeferredError extends Error {
    constructor(message = '目标聊天当前不可用，等待用户返回后继续交付') {
        super(message);
        this.name = 'ImageJobDeliveryDeferredError';
        this.code = 'IMAGE_JOB_TARGET_UNAVAILABLE';
        this.preserveBackendResult = true;
    }
}

function createAliveTarget(message, messageId, swipe, text) {
    return {
        state: ImageJobDeliveryTargetState.ALIVE,
        message,
        messageId,
        swipe,
        text,
        isActiveSwipe: swipe === null || Number(message?.swipe_id || 0) === swipe,
    };
}

export function findImageJobDeliverySlot(chat, slotId) {
    if (!Array.isArray(chat) || !slotId) return null;
    for (let messageId = 0; messageId < chat.length; messageId++) {
        const message = chat[messageId];
        if (!message) continue;
        const activeSwipe = Number(message.swipe_id);
        const hasActiveSwipe = Array.isArray(message.swipes)
            && Number.isInteger(activeSwipe)
            && activeSwipe >= 0
            && activeSwipe < message.swipes.length;
        // mes is the live text shown and edited by SillyTavern. An out-of-sync swipes[swipe_id]
        // must never resurrect a slot that the user already removed from the active text.
        if (isSceneSlotAlive(message.mes, slotId)) {
            return createAliveTarget(message, messageId, hasActiveSwipe ? activeSwipe : null, message.mes);
        }
        if (Array.isArray(message.swipes)) {
            for (let swipe = 0; swipe < message.swipes.length; swipe++) {
                if (hasActiveSwipe && swipe === activeSwipe) continue;
                const text = message.swipes[swipe];
                if (isSceneSlotAlive(text, slotId)) return createAliveTarget(message, messageId, swipe, text);
            }
        }
    }
    return null;
}

export function setImageJobDeliveryTargetText(target, text) {
    if (target?.state !== ImageJobDeliveryTargetState.ALIVE || !target.message) return false;
    const value = String(text ?? '');
    if (Number.isInteger(target.swipe)) {
        if (!Array.isArray(target.message.swipes) || target.swipe >= target.message.swipes.length) return false;
        target.message.swipes[target.swipe] = value;
        if (Number(target.message.swipe_id || 0) === target.swipe) target.message.mes = value;
    } else {
        target.message.mes = value;
    }
    target.text = value;
    return true;
}

export function getImageJobDeliveryTextAt(chat, { messageId, swipeIndex } = {}) {
    const index = Number(messageId);
    if (!Array.isArray(chat) || !Number.isSafeInteger(index) || index < 0) return null;
    const hasMetadataHeader = chat[0]?.chat_metadata && typeof chat[0].chat_metadata === 'object';
    const message = chat[index + (hasMetadataHeader ? 1 : 0)];
    if (!message || typeof message !== 'object') return null;
    const swipe = Number(swipeIndex);
    if (!Number.isSafeInteger(swipe) || swipe < 0) {
        return typeof message.mes === 'string' ? message.mes : null;
    }
    const activeSwipe = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    if (swipe === activeSwipe) return typeof message.mes === 'string' ? message.mes : null;
    return Array.isArray(message.swipes) && typeof message.swipes[swipe] === 'string'
        ? message.swipes[swipe]
        : null;
}

export function persistedImageJobDeliveryChangesMatch(persistedChat, changes = [], textKey = 'beforeText') {
    const expected = Array.isArray(changes) ? changes : [];
    if (expected.length === 0 || !['beforeText', 'afterText'].includes(textKey)) return false;
    return expected.every(change => getImageJobDeliveryTextAt(persistedChat, {
        messageId: change?.target?.messageId,
        swipeIndex: Number.isInteger(change?.target?.swipe)
            ? change.target.swipe
            : change?.target?.message?.swipe_id,
    }) === String(change?.[textKey] ?? ''));
}

export function classifyImageJobDeliveryTarget({
    currentChatId,
    targetChatId,
    chat,
    slotId,
} = {}) {
    if (String(currentChatId || '') !== String(targetChatId || '') || !Array.isArray(chat)) {
        return { state: ImageJobDeliveryTargetState.UNAVAILABLE, message: null, messageId: null, swipe: null };
    }
    const target = findImageJobDeliverySlot(chat, slotId);
    return target || { state: ImageJobDeliveryTargetState.REMOVED, message: null, messageId: null, swipe: null };
}

export function requireImageJobDeliveryTarget(options) {
    const target = classifyImageJobDeliveryTarget(options);
    if (target.state === ImageJobDeliveryTargetState.UNAVAILABLE) {
        throw new ImageJobDeliveryDeferredError();
    }
    return target.state === ImageJobDeliveryTargetState.ALIVE ? target : null;
}

export async function commitImageJobDeliverySlotRemoval({
    slotIds = [],
    resolveTarget,
    isEditing = () => false,
    isAnyEditing = () => false,
    guard = async () => {},
    persist,
} = {}) {
    const ids = [...new Set((Array.isArray(slotIds) ? slotIds : [])
        .map(value => String(value || '').trim())
        .filter(Boolean))];
    if (ids.length === 0) return [];

    await guard();
    const targets = ids.map(slotId => ({ slotId, target: resolveTarget?.(slotId) }))
        .filter(entry => entry.target);
    if (targets.some(({ target }) => isEditing(target.messageId)) || isAnyEditing()) {
        throw new ImageJobDeliveryDeferredError('目标楼层正在编辑，等待编辑结束后继续结算');
    }

    const grouped = new Map();
    for (const { slotId, target } of targets) {
        let bySwipe = grouped.get(target.message);
        if (!bySwipe) {
            bySwipe = new Map();
            grouped.set(target.message, bySwipe);
        }
        const swipeKey = Number.isInteger(target.swipe) ? target.swipe : -1;
        const group = bySwipe.get(swipeKey) || { target, slotIds: [] };
        group.slotIds.push(slotId);
        bySwipe.set(swipeKey, group);
    }
    const changes = [];
    for (const bySwipe of grouped.values()) {
        for (const { target, slotIds: targetSlotIds } of bySwipe.values()) {
            const beforeText = target.text;
            const afterText = removeSceneSlotPlaceholders(beforeText, targetSlotIds);
            if (afterText === beforeText) continue;
            setImageJobDeliveryTargetText(target, afterText);
            changes.push({ target, beforeText, afterText });
        }
    }

    // 即使本轮已找不到 slot 也要保存：这可能是上一次内存删除成功、saveChat 响应失败后的重试。
    try {
        await persist?.({ targets, changes });
    } catch (error) {
        // 写前核对明确阻止了保存时，内存修改尚未离开本页，可以安全恢复；
        // 保存已尝试但读回不确定时则保持现状，交给下一轮持久化事实判定。
        if (error?.saveAttempted === false) {
            for (const change of [...changes].reverse()) {
                if (change.target.text === change.afterText) {
                    setImageJobDeliveryTargetText(change.target, change.beforeText);
                }
            }
        }
        throw error;
    }
    return targets.map(entry => entry.target);
}
