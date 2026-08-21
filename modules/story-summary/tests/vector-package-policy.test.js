import test from 'node:test';
import assert from 'node:assert/strict';

import {
    assertVectorPackageChunkCounts,
    orderCompleteChunkVectors,
} from '../vector/storage/vector-package-policy.js';

test('chunk vectors are ordered by chunk metadata without synthetic placeholders', () => {
    const ordered = orderCompleteChunkVectors(
        [{ chunkId: 'a' }, { chunkId: 'b' }],
        [{ chunkId: 'b', vector: [2] }, { chunkId: 'a', vector: [1] }],
    );

    assert.deepEqual(ordered, [[1], [2]]);
    assert.throws(
        () => orderCompleteChunkVectors(
            [{ chunkId: 'a' }, { chunkId: 'b' }],
            [{ chunkId: 'a', vector: [1] }],
        ),
        /数据与向量不完整/,
    );
});

test('package counts reject a zero-filled legacy chunk vector payload', () => {
    assert.throws(
        () => assertVectorPackageChunkCounts(
            { chunkCount: 2, chunkVectorCount: 1 },
            2,
            2,
        ),
        /chunk 向量 数量与清单不匹配/,
    );

    assert.doesNotThrow(() => assertVectorPackageChunkCounts(
        { chunkCount: 2, chunkVectorCount: 2 },
        2,
        2,
    ));
});
