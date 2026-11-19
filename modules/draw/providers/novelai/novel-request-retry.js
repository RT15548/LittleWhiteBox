// Only direct NovelAI HTTP failures authorize one retry. Proxy failures and
// transport interruptions do not say whether the provider generated an image.
// 429 是限速：等一个冷却再试一次，别把一次排队抖动直接报成失败。

function waitForRetry(duration, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) { reject(signal.reason ?? new Error('aborted')); return; }
        const onAbort = () => {
            clearTimeout(timer);
            reject(signal.reason ?? new Error('aborted'));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
        }, duration);
        signal?.addEventListener('abort', onAbort, { once: true });
    });
}

export async function requestNovelImageWithRetry({ request, sendMode, signal, beforeRequest,
    retryDelayMs = 0 }) {
    // attempt 0 = 首试；1 = 5xx 或 429 的一次重试；2 = 429 的第二次重试。
    for (let attempt = 0; attempt < 3; attempt++) {
        signal?.throwIfAborted();
        if (await beforeRequest?.() === false) return null;
        signal?.throwIfAborted();
        try {
            return await request();
        } catch (error) {
            const busy = error?.status === 429;
            if (busy && attempt < 2 && retryDelayMs > 0) {
                // 每次退避递增，避免连续撞上同一个限速窗口。
                await waitForRetry(retryDelayMs * (attempt + 1), signal);
                continue;
            }
            if (attempt > 0 || sendMode !== 'frontend' || signal?.aborted
                || !(error?.status >= 500 && error.status < 600)) throw error;
        }
    }
}
