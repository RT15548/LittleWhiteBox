export const DEFAULT_RECALL_TIMEOUT_SEC = 30;
export const DEFAULT_RERANK_TIMEOUT_SEC = 15;

// Browser timers use a signed 32-bit millisecond delay.
export const MAX_RECALL_TIMEOUT_SEC = Math.floor(2_147_483_647 / 1000);

function normalizeTimeoutSec(value, fallback) {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds > 0
        ? Math.min(MAX_RECALL_TIMEOUT_SEC, Math.max(1, Math.floor(seconds)))
        : fallback;
}

export function normalizeRecallTimeoutSec(value) {
    return normalizeTimeoutSec(value, DEFAULT_RECALL_TIMEOUT_SEC);
}

export function normalizeRerankTimeoutSec(value) {
    return normalizeTimeoutSec(value, DEFAULT_RERANK_TIMEOUT_SEC);
}
