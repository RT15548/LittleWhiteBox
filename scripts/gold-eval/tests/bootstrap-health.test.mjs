import assert from 'node:assert/strict';
import test from 'node:test';

import { assertBootstrapHealthy } from '../baseline/bootstrap-health.mjs';

function healthy(overrides = {}) {
    return {
        targetFloor: 9,
        summaryStore: { lastSummarizedMesId: 9 },
        l0Result: { built: 5, cancelled: false },
        l0Stats: { pending: 0, fail: 0 },
        l1Result: { built: 10, errors: 0 },
        l2Result: { built: 3 },
        stateAtomsCount: 5,
        stateVectorsCount: 5,
        storageStats: { chunks: 10, chunkVectors: 10, eventVectors: 3 },
        ...overrides,
    };
}

test('评测 bootstrap 只接受总结边界与三层向量全部完整的 snapshot', () => {
    assert.deepEqual(assertBootstrapHealthy(healthy()), {
        summaryBoundary: 9,
        l0: { atoms: 5, vectors: 5, pending: 0, failed: 0 },
        l1: { chunks: 10, vectors: 10, failedBatches: 0 },
        l2: { vectors: 3 },
    });
});

test('评测 bootstrap 拒绝被插件降级吞掉的外部失败', () => {
    assert.throws(
        () => assertBootstrapHealthy(healthy({
            l0Stats: { pending: 1, fail: 2 },
            stateVectorsCount: 4,
            l1Result: { built: 8, errors: 1 },
            storageStats: { chunks: 10, chunkVectors: 8, eventVectors: 2 },
        })),
        /evaluation_bootstrap_invalid:.*L0 incomplete.*L0 vector mismatch.*L1 embedding batches failed.*L1 vector mismatch.*L2 vector mismatch/,
    );
});
