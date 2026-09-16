import assert from 'node:assert/strict';
import test from 'node:test';
import { diffuseFromSeeds } from '../vector/retrieval/diffusion.js';

const interaction = [{ s: 'Alice', t: 'Bob', r: '交谈' }];
function diffuse(atoms, { rVector = null, seedId = atoms[0]?.atomId } = {}) {
    const metrics = {};
    const vectors = atoms.map(atom => ({ atomId: atom.atomId, vector: [1, 0], rVector }));
    const items = diffuseFromSeeds([{ atomId: seedId, similarity: 1 }], atoms, vectors, [1, 0], metrics, { name1: '用户' });
    return { items, ...metrics.diffusion };
}

test('WHAT edges include same-floor and exactly 80-floor pairs, but exclude 81-floor pairs in either input order', () => {
    for (const distance of [0, 80, 81]) {
        const atoms = [
            { atomId: 'origin', floor: 0, edges: interaction },
            { atomId: 'target', floor: distance, edges: interaction },
        ];
        for (const input of [atoms, [...atoms].reverse()]) {
            const result = diffuse(input, { seedId: 'origin' });
            assert.equal(result.graphEdges, distance <= 80 ? 1 : 0);
            assert.equal(result.candidatePairs, result.graphEdges);
            assert.deepEqual(result.items.map(item => item.atomId), distance <= 80 ? ['target'] : []);
        }
    }
});

test('shuffled floors preserve WHAT connectivity and multiple interaction groups do not duplicate edges', () => {
    const atoms = [81, 0, 80].map((floor, index) => ({
        atomId: `a-${index}`, floor,
        edges: [...interaction, { s: 'Bob', t: 'Clara', r: '见面' }],
    }));
    const result = diffuse(atoms, { seedId: 'a-1' });
    assert.equal(result.graphEdges, 2);
    assert.equal(result.pairsFromWhat, 2);
    assert.equal(result.candidatePairs, 2);
    assert.equal(result.whatWindowSkippedOccurrences, 2, 'one far pair occurs in two interaction groups');
    assert.deepEqual(new Set(result.items.map(item => item.atomId)), new Set(['a-0', 'a-2']));
});

test('R semantic candidates remain independent of WHAT, and USER remains excluded from WHAT', () => {
    const atoms = [
        { atomId: 'a', floor: 0, edges: [{ s: '用户', t: 'Alice', r: '交谈' }] },
        { atomId: 'b', floor: 80, edges: [{ s: '用户', t: 'Alice', r: '交谈' }] },
    ];
    assert.equal(diffuse(atoms).graphEdges, 0);
    const semantic = diffuse(atoms, { rVector: [1, 0] });
    assert.equal(semantic.pairsFromWhat, 0);
    assert.equal(semantic.pairsFromRSem, 1);
    assert.equal(semantic.graphEdges, 1);
    assert.deepEqual(semantic.items.map(item => item.atomId), ['b']);
    assert.equal(diffuse([atoms[0], { ...atoms[1], floor: 81 }], { rVector: [1, 0] }).graphEdges, 0);
});

test('distant repetitions never materialize a quadratic candidate set', () => {
    const count = 1500;
    const atoms = Array.from({ length: count }, (_, index) => ({
        atomId: `a-${index}`, floor: index * 81, edges: interaction,
    }));
    const result = diffuse(atoms);
    assert.equal(result.candidatePairs, 0);
    assert.equal(result.pairsFromWhat, 0);
    assert.equal(result.whatWindowSkippedOccurrences, count * (count - 1) / 2);
    assert.deepEqual(result.items, []);
});
