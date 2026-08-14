export const L0_MAX_ATTEMPTS = 3;

const RETRY_DELAYS_MS = Object.freeze([1000, 2000]);

export function getL0RetryDelayMs(failedAttemptIndex) {
    const index = Number(failedAttemptIndex);
    if (!Number.isInteger(index) || index < 0) return null;
    return RETRY_DELAYS_MS[index] ?? null;
}

export function isRetryableL0Failure(failure = {}) {
    const kind = String(failure?.kind || '');
    if (['network', 'timeout', 'empty', 'invalid_json'].includes(kind)) return true;
    if (kind !== 'http') return false;

    const status = Number(failure?.status);
    return status === 408 || status === 429 || (status >= 500 && status <= 599);
}
