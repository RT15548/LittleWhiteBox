const listeners = new Set();

function normalizeTarget(source = {}) {
    const chatId = String(source.chatId || '');
    const messageId = Number(source.messageId);
    const swipeIndex = Number(source.swipeIndex);
    const provider = String(source.provider || '').trim();
    const runId = String(source.runId || '').trim();
    return {
        chatId,
        messageId,
        swipeIndex,
        provider,
        runId,
    };
}

function hasRenderedTarget(target) {
    return Boolean(target.chatId)
        && Number.isSafeInteger(target.messageId) && target.messageId >= 0
        && Number.isSafeInteger(target.swipeIndex) && target.swipeIndex >= 0;
}

export function matchesDrawRunActivityTarget(detail = {}, target = {}) {
    const actual = normalizeTarget(detail);
    const expected = normalizeTarget(target);
    if (expected.chatId && actual.chatId !== expected.chatId) return false;
    if (Number.isSafeInteger(expected.messageId) && expected.messageId >= 0
        && actual.messageId !== expected.messageId) return false;
    if (Number.isSafeInteger(expected.swipeIndex) && expected.swipeIndex >= 0
        && actual.swipeIndex !== expected.swipeIndex) return false;
    if (expected.provider && actual.provider !== expected.provider) return false;
    if (expected.runId && actual.runId !== expected.runId) return false;
    return true;
}

// 事件只有点名到当前 chat/message/swipe 才能触发 UI 读取。Provider 是任务属性，
// 不是当前打开的设置页：用户切换 Provider 后仍应看见并能取消原任务。
export function resolveCurrentDrawRunActivityTarget(detail = {}, ctx = {}) {
    const target = normalizeTarget(detail);
    if (!hasRenderedTarget(target) || target.chatId !== String(ctx?.chatId || '')) return null;
    const message = ctx?.chat?.[target.messageId];
    if (!message) return null;
    const activeSwipeIndex = Number.isInteger(message.swipe_id) ? message.swipe_id : 0;
    if (target.swipeIndex !== activeSwipeIndex) return null;
    return target;
}

export function subscribeDrawRunActivity(listener) {
    if (typeof listener !== 'function') throw new TypeError('Draw Run activity listener 必须是函数');
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function publishDrawRunActivity(detail = {}) {
    for (const listener of listeners) {
        try {
            listener(detail);
        } catch (error) {
            console.warn('[Draw Run] UI 状态监听失败:', error);
        }
    }
}
