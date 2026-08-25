export function createEmbeddingFailureError(message, failure = {}, cause = null) {
    const error = cause
        ? new Error(String(message || 'Embedding request failed'), { cause })
        : new Error(String(message || 'Embedding request failed'));
    error.embeddingFailure = { ...failure };
    return error;
}

export function createInvalidEmbeddingResponseError(expected, actual, reason = 'count_or_empty') {
    return createEmbeddingFailureError(
        `Embedding response mismatch: expected ${expected} valid vectors, got ${actual} (${reason})`,
        { kind: 'invalid_response', expected, actual, reason },
    );
}

/**
 * OpenAI-compatible Embedding 的协议边界。只有与输入一一对应、索引连续、维度一致且
 * 全部为有限数的向量才能离开传输层，避免下游推进边界后把坏数据当成完整结果。
 */
export function readEmbeddingVectors(data, expectedCount) {
    const expected = Number(expectedCount);
    const items = data?.data;
    if (!Number.isInteger(expected) || expected <= 0 || !Array.isArray(items) || items.length !== expected) {
        throw createInvalidEmbeddingResponseError(expected, Array.isArray(items) ? items.length : 0, 'count');
    }

    const vectors = new Array(expected);
    let dimensions = null;

    for (const item of items) {
        const index = item?.index;
        const vector = item?.embedding;
        if (
            typeof index !== 'number'
            || !Number.isInteger(index)
            || index < 0
            || index >= expected
            || vectors[index] !== undefined
        ) {
            throw createInvalidEmbeddingResponseError(expected, vectors.filter(Boolean).length, 'index');
        }
        if (
            !Array.isArray(vector)
            || vector.length <= 0
            || !vector.every(value => (
                typeof value === 'number'
                && Number.isFinite(value)
                && Number.isFinite(Math.fround(value))
            ))
        ) {
            throw createInvalidEmbeddingResponseError(expected, vectors.filter(Boolean).length, 'values');
        }

        if (dimensions === null) dimensions = vector.length;
        else if (vector.length !== dimensions) {
            throw createInvalidEmbeddingResponseError(expected, vectors.filter(Boolean).length, 'dimensions');
        }
        vectors[index] = vector;
    }

    if (vectors.some(vector => vector === undefined)) {
        throw createInvalidEmbeddingResponseError(expected, vectors.filter(Boolean).length, 'index');
    }
    return vectors;
}

export function getEmbeddingFailureDetails(error) {
    const failure = error?.embeddingFailure || {};
    const kind = String(failure.kind || '');
    let code = 'embedding_failed';

    if (kind === 'configuration') code = 'embedding_config_missing';
    else if (kind === 'configuration_url') code = 'embedding_url_invalid';
    else if (kind === 'timeout') code = 'embedding_timeout';
    else if (kind === 'network') code = 'embedding_network_failed';
    else if (kind === 'http') code = 'embedding_http_failed';
    else if (kind === 'invalid_response') code = 'invalid_embedding_response';

    const httpStatus = kind === 'http' && Number.isInteger(Number(failure.status))
        ? Number(failure.status)
        : null;
    return { code, httpStatus };
}

export function isRetryableEmbeddingFailure(error) {
    const failure = error?.embeddingFailure || {};
    const kind = String(failure.kind || '');
    if (kind === 'network' || kind === 'timeout') return true;
    if (kind !== 'http') return false;

    const status = Number(failure.status);
    return status === 408 || status === 429 || (status >= 500 && status <= 599);
}
