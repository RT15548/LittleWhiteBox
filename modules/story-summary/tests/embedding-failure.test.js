import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createEmbeddingFailureError,
    createInvalidEmbeddingResponseError,
    getEmbeddingFailureDetails,
    isRetryableEmbeddingFailure,
    readEmbeddingVectors,
} from '../vector/llm/embedding-failure.js';

test('Embedding传输与响应失败映射为稳定安全错误码', () => {
    const cases = [
        ['configuration', 'embedding_config_missing'],
        ['configuration_url', 'embedding_url_invalid'],
        ['timeout', 'embedding_timeout'],
        ['network', 'embedding_network_failed'],
        ['invalid_response', 'invalid_embedding_response'],
    ];
    for (const [kind, code] of cases) {
        assert.deepEqual(
            getEmbeddingFailureDetails(createEmbeddingFailureError('private detail', { kind })),
            { code, httpStatus: null },
        );
    }

    assert.deepEqual(
        getEmbeddingFailureDetails(createEmbeddingFailureError('private response', { kind: 'http', status: 503 })),
        { code: 'embedding_http_failed', httpStatus: 503 },
    );
});

test('Embedding数量或零维响应归入无效响应', () => {
    assert.deepEqual(
        getEmbeddingFailureDetails(createInvalidEmbeddingResponseError(4, 0)),
        { code: 'invalid_embedding_response', httpStatus: null },
    );
});

test('Embedding响应必须按连续唯一索引返回同维有限数数组', () => {
    assert.deepEqual(
        readEmbeddingVectors({ data: [
            { index: 1, embedding: [3, 4] },
            { index: 0, embedding: [1, 2] },
        ] }, 2),
        [[1, 2], [3, 4]],
    );

    const malformed = [
        { data: [{ index: 0, embedding: [1] }, { index: 0, embedding: [2] }] },
        { data: [{ index: 0, embedding: [1, Number.NaN] }] },
        { data: [{ index: 0, embedding: [Number.MAX_VALUE] }] },
        { data: [{ index: 0, embedding: [1] }, { index: 1, embedding: [2, 3] }] },
        { data: [{ index: 0, embedding: '123' }] },
    ];
    for (const data of malformed) {
        assert.throws(
            () => readEmbeddingVectors(data, data.data.length),
            error => getEmbeddingFailureDetails(error).code === 'invalid_embedding_response',
        );
    }
});

test('Embedding只对瞬时传输错误重试', () => {
    for (const kind of ['network', 'timeout']) {
        assert.equal(isRetryableEmbeddingFailure(createEmbeddingFailureError('x', { kind })), true);
    }
    for (const status of [408, 429, 500, 503]) {
        assert.equal(isRetryableEmbeddingFailure(createEmbeddingFailureError('x', { kind: 'http', status })), true);
    }
    for (const status of [400, 401, 403, 404]) {
        assert.equal(isRetryableEmbeddingFailure(createEmbeddingFailureError('x', { kind: 'http', status })), false);
    }
    assert.equal(isRetryableEmbeddingFailure(createInvalidEmbeddingResponseError(1, 0)), false);
    assert.equal(isRetryableEmbeddingFailure(createEmbeddingFailureError('x', { kind: 'configuration' })), false);
    assert.equal(isRetryableEmbeddingFailure(createEmbeddingFailureError('x', { kind: 'configuration_url' })), false);
});
