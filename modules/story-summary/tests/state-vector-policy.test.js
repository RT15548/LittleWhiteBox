import test from 'node:test';
import assert from 'node:assert/strict';

import {
    canRepairStateVectors,
    selectMissingStateVectorAtoms,
} from '../vector/pipeline/state-vector-policy.js';

test('L0派生向量仅以 atomId、当前指纹和双向量完整性认定有效', () => {
    const atoms = [
        { atomId: 'a' },
        { atomId: 'b' },
        { atomId: 'c' },
        { atomId: 'd' },
    ];
    const vectors = [
        { atomId: 'a', fingerprint: 'fp', vector: [1], rVector: [2] },
        { atomId: 'b', fingerprint: 'old', vector: [1], rVector: [2] },
        { atomId: 'c', fingerprint: 'fp', vector: [], rVector: [2] },
        { atomId: 'd', fingerprint: 'fp', vector: [1], rVector: [] },
    ];

    assert.deepEqual(
        selectMissingStateVectorAtoms(atoms, vectors, 'fp').map(atom => atom.atomId),
        ['b', 'c', 'd'],
    );

    assert.deepEqual(
        selectMissingStateVectorAtoms(atoms.slice(0, 1), [{
            atomId: 'a',
            fingerprint: 'fp',
            vectorValid: true,
            rVectorValid: true,
        }], 'fp'),
        [],
    );
});

test('只有无既有指纹或指纹一致时允许局部补齐 L0 向量', () => {
    assert.equal(canRepairStateVectors(null, 'fp'), true);
    assert.equal(canRepairStateVectors('', 'fp'), true);
    assert.equal(canRepairStateVectors('fp', 'fp'), true);
    assert.equal(canRepairStateVectors('old', 'fp'), false);
});
