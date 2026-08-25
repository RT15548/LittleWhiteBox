import test from 'node:test';
import assert from 'node:assert/strict';

import {
    createL0FailureError,
    getL0FailureDetails,
    getL0RetryDelayMs,
    getL0ResponseSchemaFailure,
    isRetryableL0Failure,
    L0_MAX_ATTEMPTS,
} from '../vector/llm/l0-retry-policy.js';

test('L0失败对用户暴露稳定错误码而不暴露响应正文', () => {
    assert.deepEqual(
        getL0FailureDetails(createL0FailureError('secret response', { kind: 'http', status: 429 })),
        { code: 'l0_http_failed', httpStatus: 429 },
    );
    assert.deepEqual(
        getL0FailureDetails(createL0FailureError('timed out', { kind: 'timeout' })),
        { code: 'l0_timeout', httpStatus: null },
    );
    assert.deepEqual(
        getL0FailureDetails(createL0FailureError('bad json', { kind: 'invalid_json' })),
        { code: 'l0_invalid_response', httpStatus: null },
    );
});

test('L0最多尝试三次，失败后依次等待1秒和2秒', () => {
    assert.equal(L0_MAX_ATTEMPTS, 3);
    assert.equal(getL0RetryDelayMs(0), 1000);
    assert.equal(getL0RetryDelayMs(1), 2000);
    assert.equal(getL0RetryDelayMs(2), null);
});

test('L0只重试瞬时传输错误、空响应、JSON解析失败和响应结构错误', () => {
    for (const failure of [
        { kind: 'http', status: 408 },
        { kind: 'http', status: 429 },
        { kind: 'http', status: 500 },
        { kind: 'http', status: 503 },
        { kind: 'network' },
        { kind: 'timeout' },
        { kind: 'empty' },
        { kind: 'invalid_json' },
        { kind: 'invalid_schema' },
    ]) {
        assert.equal(isRetryableL0Failure(failure), true, JSON.stringify(failure));
    }

    for (const failure of [
        { kind: 'http', status: 400 },
        { kind: 'http', status: 401 },
        { kind: 'http', status: 403 },
        { kind: 'http', status: 404 },
        { kind: 'cancelled' },
        { kind: 'configuration' },
        { kind: 'protocol' },
        {},
    ]) {
        assert.equal(isRetryableL0Failure(failure), false, JSON.stringify(failure));
    }
});

test('合法JSON缺少anchors时分类为可重试的invalid_schema', () => {
    assert.deepEqual(getL0ResponseSchemaFailure({ answer: [] }), { kind: 'invalid_schema' });
    assert.deepEqual(getL0ResponseSchemaFailure({ anchors: {} }), { kind: 'invalid_schema' });
    assert.equal(getL0ResponseSchemaFailure({ anchors: [] }), null);
});

test('L0 schema拒绝空对象、null和过短scene，避免永久标成empty', () => {
    for (const anchor of [null, {}, { scene: '太短' }]) {
        assert.deepEqual(getL0ResponseSchemaFailure({ anchors: [anchor] }), { kind: 'invalid_schema' });
    }
    assert.equal(getL0ResponseSchemaFailure({
        anchors: [{ scene: '这是一个长度足够并且可以安全转换为锚点的完整场景描述' }],
    }), null);
});
