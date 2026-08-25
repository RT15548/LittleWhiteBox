export const L0_MAX_ATTEMPTS = 3;
export const L0_MIN_SCENE_LENGTH = 15;

const RETRY_DELAYS_MS = Object.freeze([1000, 2000]);

export function getL0RetryDelayMs(failedAttemptIndex) {
    const index = Number(failedAttemptIndex);
    if (!Number.isInteger(index) || index < 0) return null;
    return RETRY_DELAYS_MS[index] ?? null;
}

export function getL0ResponseSchemaFailure(value) {
    if (!Array.isArray(value?.anchors)) return { kind: 'invalid_schema' };
    if (value.anchors.length === 0) return null;

    const selected = value.anchors.slice(0, 2);
    const valid = selected.every(anchor => (
        anchor
        && typeof anchor === 'object'
        && !Array.isArray(anchor)
        && typeof anchor.scene === 'string'
        && anchor.scene.trim().length >= L0_MIN_SCENE_LENGTH
    ));
    return valid ? null : { kind: 'invalid_schema' };
}

export function createL0FailureError(message, failure = {}, cause = null) {
    const error = cause
        ? new Error(String(message || 'L0 request failed'), { cause })
        : new Error(String(message || 'L0 request failed'));
    error.l0Failure = { ...failure };
    return error;
}

export function getL0FailureDetails(error) {
    const failure = error?.l0Failure || {};
    const kind = String(failure.kind || '');
    let code = 'l0_llm_failed';

    if (kind === 'configuration') code = 'l0_config_missing';
    else if (kind === 'timeout') code = 'l0_timeout';
    else if (kind === 'network') code = 'l0_network_failed';
    else if (kind === 'http') code = 'l0_http_failed';
    else if (['empty', 'invalid_json', 'invalid_schema', 'protocol'].includes(kind)) code = 'l0_invalid_response';

    const httpStatus = kind === 'http' && Number.isInteger(Number(failure.status))
        ? Number(failure.status)
        : null;
    return { code, httpStatus };
}

export function isRetryableL0Failure(failure = {}) {
    const kind = String(failure?.kind || '');
    if (['network', 'timeout', 'empty', 'invalid_json', 'invalid_schema'].includes(kind)) return true;
    if (kind !== 'http') return false;

    const status = Number(failure?.status);
    return status === 408 || status === 429 || (status >= 500 && status <= 599);
}
