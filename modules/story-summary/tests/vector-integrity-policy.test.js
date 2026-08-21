import test from 'node:test';
import assert from 'node:assert/strict';

import { buildVectorIntegrityIssues } from '../vector/integrity-policy.js';

test('temporary L1 gaps below five floors stay silent', () => {
    assert.deepEqual(buildVectorIntegrityIssues({ chunkFloorGap: 0 }), []);
    assert.deepEqual(buildVectorIntegrityIssues({ chunkFloorGap: 1 }), []);
    assert.deepEqual(buildVectorIntegrityIssues({ chunkFloorGap: 4 }), []);
});

test('an L1 gap of five floors warns', () => {
    assert.deepEqual(
        buildVectorIntegrityIssues({ chunkFloorGap: 5 }),
        [{ code: 'l1_gap', message: '5 层片段未向量化' }],
    );
});

test('fingerprint and unrepaired event-vector failures still warn immediately', () => {
    assert.deepEqual(
        buildVectorIntegrityIssues({
            fingerprintMismatch: true,
            chunkFloorGap: 2,
            missingEventVectorCount: 3,
        }),
        [
            { code: 'fingerprint_mismatch', message: '向量引擎/模型已变更' },
            { code: 'event_vectors_missing', message: '3 个事件未向量化' },
        ],
    );
});
