import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getL0RetryDelayMs,
    isRetryableL0Failure,
    L0_MAX_ATTEMPTS,
} from '../vector/llm/l0-retry-policy.js';

test('L0最多尝试三次，失败后依次等待1秒和2秒', () => {
    assert.equal(L0_MAX_ATTEMPTS, 3);
    assert.equal(getL0RetryDelayMs(0), 1000);
    assert.equal(getL0RetryDelayMs(1), 2000);
    assert.equal(getL0RetryDelayMs(2), null);
});

test('L0只重试瞬时传输错误、空响应和JSON解析失败', () => {
    for (const failure of [
        { kind: 'http', status: 408 },
        { kind: 'http', status: 429 },
        { kind: 'http', status: 500 },
        { kind: 'http', status: 503 },
        { kind: 'network' },
        { kind: 'timeout' },
        { kind: 'empty' },
        { kind: 'invalid_json' },
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
