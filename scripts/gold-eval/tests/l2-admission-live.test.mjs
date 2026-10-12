// Protect the external rerank completeness boundary; no provider calls required.
import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCompleteRerank } from '../experiments/l2-admission-live.mjs';

test('rerank accepts complete finite scores independent of response ordering', () => {
    assertCompleteRerank({ results: [{ index: 1, relevance_score: 0 }, { index: 0, relevance_score: 0.9 }] }, ['a', 'b']);
});

test('incomplete, duplicate, outside-range or invalid-score receipts cannot become assembly evidence', () => {
    for (const results of [[], [{ index: 0, relevance_score: 1 }, { index: 0, relevance_score: 0 }],
        [{ index: 0, relevance_score: 1 }, { index: 2, relevance_score: 0 }],
        [{ index: 0, relevance_score: 1 }, { index: 1, relevance_score: NaN }]]) {
        assert.throws(() => assertCompleteRerank({ results }, ['a', 'b']));
    }
});
