import { ImageRequestOutcome, withImageRequestOutcome } from '../../shared/image-request-outcome.js';

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
    let previousFailure;
    const checkAdmission = () => {
        if (signal?.aborted) throw previousFailure ?? withImageRequestOutcome(
            new DOMException(signal.reason?.message, 'AbortError'), ImageRequestOutcome.NOT_SUBMITTED);
    };
    // attempt 0 = 首试；1 = 5xx 或 429 的一次重试；2 = 429 的第二次重试。
    for (let attempt = 0; attempt < 3; attempt++) {
        checkAdmission();
        if (await beforeRequest?.() === false) return null;
        checkAdmission();
        try {
            return await request();
        } catch (error) {
            previousFailure = error;
            const busy = error?.status === 429 && (sendMode === 'frontend' || error.upstreamResponse === true);
            if (busy && attempt < 2 && retryDelayMs > 0) {
                // 每次退避递增，避免连续撞上同一个限速窗口。
                try { await waitForRetry(retryDelayMs * (attempt + 1), signal); }
                catch { throw error; } // Cancellation after a definite refusal is still an unbilled refusal.
                continue;
            }
            if (attempt > 0 || sendMode !== 'frontend' || signal?.aborted
                || !(error?.status >= 500 && error.status < 600)) throw error;
        }
    }
}
