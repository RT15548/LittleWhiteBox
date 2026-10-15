export const DEFAULT_RECALL_TIMEOUT_SEC = 30;

// Browser timers use a signed 32-bit millisecond delay.
export const MAX_RECALL_TIMEOUT_SEC = Math.floor(2_147_483_647 / 1000);

export function normalizeRecallTimeoutSec(value) {
    const seconds = Number(value);
    return Number.isFinite(seconds) && seconds > 0
        ? Math.min(MAX_RECALL_TIMEOUT_SEC, Math.max(1, Math.floor(seconds)))
        : DEFAULT_RECALL_TIMEOUT_SEC;
}
