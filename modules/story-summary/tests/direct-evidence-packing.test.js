import assert from 'node:assert/strict';
import test from 'node:test';

import {
    admitDirectEvidenceItems,
    buildRankRelevance,
} from '../generate/direct-evidence-packing.js';

const costOf = item => item.tokens;

test('oversized evidence does not block a later item that fits', () => {
    const budget = { used: 0, max: 12 };
    const items = [
        { id: 'large', floor: 1, score: 1, tokens: 20 },
        { id: 'small', floor: 2, score: 0.5, tokens: 5 },
    ];

    const admitted = admitDirectEvidenceItems(items, budget, {
        getTokenCost: costOf,
        floorOverheadTokens: 2,
    });
    const claimed = new Set(admitted.map(item => item.id));

    assert.deepEqual(admitted.map(item => item.id), ['small']);
    assert.deepEqual([...claimed], ['small']);
    assert.equal(budget.used, 7);
});

test('temporal evidence is admitted before a higher-score regular item', () => {
    const budget = { used: 0, max: 8 };
    const admitted = admitDirectEvidenceItems([
        { id: 'ranked', floor: 1, score: 1, tokens: 6 },
        { id: 'temporal', floor: 2, score: 0.1, tokens: 6, temporal: true },
    ], budget, {
        getTokenCost: costOf,
        floorOverheadTokens: 2,
    });

    assert.deepEqual(admitted.map(item => item.id), ['temporal']);
    assert.equal(admitted[0].temporalProtected, true);
});

test('temporal evidence over the protected budget returns to ordinary relevance', () => {
    const budget = { used: 0, max: 20 };
    const protectedBudget = { used: 0, max: 8 };
    const admitted = admitDirectEvidenceItems([
        { id: 'regular', floor: 1, score: 1, tokens: 5 },
        { id: 'temporal-overflow', floor: 2, score: 0.1, tokens: 7, temporal: true },
    ], budget, {
        protectedBudget,
        getTokenCost: costOf,
        floorOverheadTokens: 2,
    });

    assert.deepEqual(admitted.map(item => item.id), ['regular', 'temporal-overflow']);
    assert.equal(admitted[1].temporal, false);
    assert.equal(admitted[1].temporalProtected, false);
    assert.equal(protectedBudget.used, 0);
});

test('protected-budget overflow does not preserve a minimum-score exemption', () => {
    const budget = { used: 0, max: 20 };
    const admitted = admitDirectEvidenceItems([
        {
            id: 'protected-only',
            floor: 2,
            score: 0.1,
            tokens: 7,
            temporal: true,
            ordinaryEligible: false,
        },
        { id: 'regular', floor: 1, score: 1, tokens: 5 },
    ], budget, {
        protectedBudget: { used: 0, max: 8 },
        getTokenCost: costOf,
        floorOverheadTokens: 2,
    });

    assert.deepEqual(admitted.map(item => item.id), ['regular']);
});

test('protected budget includes floor overhead and protects one item per floor', () => {
    const budget = { used: 0, max: 21 };
    const protectedBudget = { used: 0, max: 10 };
    const admitted = admitDirectEvidenceItems([
        { id: 'floor-1-winner', floor: 1, score: 1, tokens: 5, temporal: true },
        { id: 'floor-1-runner-up', floor: 1, score: 0.9, tokens: 2, temporal: true },
        { id: 'floor-2-overflow', floor: 2, score: 0.8, tokens: 5, temporal: true },
    ], budget, {
        protectedBudget,
        getTokenCost: costOf,
        floorOverheadTokens: 2,
    });

    assert.deepEqual(admitted.map(item => item.id), [
        'floor-1-winner',
        'floor-1-runner-up',
        'floor-2-overflow',
    ]);
    assert.deepEqual(admitted.map(item => item.temporalProtected), [true, false, false]);
    assert.equal(protectedBudget.used, 7);
    assert.equal(budget.used, 16);
});

test('floor overhead is charged once across admission phases', () => {
    const budget = { used: 0, max: 12 };
    const admittedFloors = new Set();
    const options = {
        admittedFloors,
        getTokenCost: costOf,
        floorOverheadTokens: 2,
    };

    const primary = admitDirectEvidenceItems([
        { id: 'l0', floor: 3, score: 1, tokens: 5 },
    ], budget, options);
    const fallback = admitDirectEvidenceItems([
        { id: 'l1', floor: 3, score: 1, tokens: 5 },
    ], budget, options);

    assert.deepEqual([...primary, ...fallback].map(item => item.id), ['l0', 'l1']);
    assert.equal(budget.used, 12);
});

test('rank relevance uses one scale across short and long source lists', () => {
    const short = buildRankRelevance(['a', 'b', 'c'], item => item);
    const long = buildRankRelevance(
        Array.from({ length: 60 }, (_, index) => `item-${index}`),
        item => item,
    );

    assert.equal(short.get('a'), long.get('item-0'));
    assert.equal(short.get('b'), long.get('item-1'));
    assert.equal(short.get('c'), long.get('item-2'));
});
