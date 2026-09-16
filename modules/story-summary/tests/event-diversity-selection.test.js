import assert from 'node:assert/strict';
import test from 'node:test';
import { selectDiverseEvents } from '../vector/retrieval/event-diversity-selection.js';
import { selectBoundedEventCandidates } from '../vector/retrieval/event-candidate-selection.js';

// Deliberately exhaustive oracle for the selection contract, not its optimization.
function exhaustiveSelection(candidates, capacity, lambda) {
    const cosine = (a, b) => {
        if (!a?.length || !b?.length || a.length !== b.length) return 0;
        const dot = a.reduce((sum, value, i) => sum + value * b[i], 0);
        const aa = a.reduce((sum, value) => sum + value * value, 0);
        const bb = b.reduce((sum, value) => sum + value * value, 0);
        return aa && bb ? dot / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
    };
    const selected = [];
    while (selected.length < capacity) {
        let best = null;
        let bestScore = -Infinity;
        for (const candidate of candidates) {
            if (selected.some(item => item._id === candidate._id)) continue;
            const redundancy = Math.max(0, ...selected.map(item => cosine(candidate.vector, item.vector)));
            const score = lambda * candidate.similarity - (1 - lambda) * redundancy;
            if (score > bestScore) { best = candidate; bestScore = score; }
        }
        if (!best) break;
        selected.push(best);
    }
    return selected;
}

test('incremental event diversity preserves exhaustive MMR order across relevance and vector distributions', () => {
    let randomState = 42;
    const random = () => {
        randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
        return randomState / 4294967296;
    };
    for (const count of [1, 12, 100]) {
        const candidates = Array.from({ length: count }, (_, i) => ({
            _id: `evt-${i}`, similarity: random(),
            vector: Float32Array.from({ length: 16 }, () => random() * 2 - 1),
        }));
        for (const capacity of [0, 3, 50]) {
            for (const lambda of [0, 0.72, 1]) {
                assert.deepEqual(selectDiverseEvents(candidates, capacity, lambda),
                    exhaustiveSelection(candidates, capacity, lambda));
            }
        }
    }
});

test('ties, missing vectors and duplicate IDs retain input order without mutating or retaining selection state', () => {
    const candidates = Object.freeze([
        { _id: 'first', similarity: 0.8, vector: [1, 0] },
        { _id: 'first', similarity: 0.8, vector: [0, 1] },
        { _id: 'missing', similarity: 0.8, vector: null },
        { _id: 'zero', similarity: 0.8, vector: [0, 0] },
        { _id: 'different-dims', similarity: 0.8, vector: [1] },
        { _id: 'opposite', similarity: 0.8, vector: [-1, 0] },
        { _id: 'similar', similarity: 0.8, vector: [1, 0] },
    ].map(item => Object.freeze({ ...item, vector: item.vector && Object.freeze(item.vector) })));
    const expected = exhaustiveSelection(candidates, 50, 0.72);
    assert.deepEqual(selectDiverseEvents(candidates, 50, 0.72), expected);
    assert.deepEqual(selectDiverseEvents(candidates, 50, 0.72), expected);
    assert.equal(expected[0]._id, 'first');
    assert.equal(expected.at(-1)._id, 'similar');
    assert.equal(new Set(expected.map(item => item._id)).size, expected.length);
    assert.deepEqual(selectDiverseEvents([], 50, 0.72), []);
});

test('event diversity still hands its unchanged ordinary order to bounded time protection', () => {
    const candidates = Array.from({ length: 100 }, (_, i) => ({
        _id: `evt-${i}`, event: { id: `evt-${i}`, summary: `事件 (#${i * 2 + 1})` },
        similarity: 1 - i / 200, vector: [1, 0],
    }));
    const floors = candidates.slice(-7).map((_, i) => (93 + i) * 2);
    const actual = selectBoundedEventCandidates(candidates, 50, floors, selectDiverseEvents(candidates, 50, 0.72));
    const expected = selectBoundedEventCandidates(candidates, 50, floors, exhaustiveSelection(candidates, 50, 0.72));
    assert.deepEqual(actual, expected);
    assert.equal(actual.forced, 5);
    assert.equal(actual.candidates.length, 50);
});
