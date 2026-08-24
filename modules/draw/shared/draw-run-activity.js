const listeners = new Set();

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
