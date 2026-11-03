import assert from 'node:assert/strict';
import test from 'node:test';
import { selectContextualRerankChunks } from '../vector/retrieval/rerank-context-chunks.js';

const chunk = (side, idx, score) => ({ chunkId: `${side}-${idx}`, chunkIdx: idx,
    text: `${side}-${idx}`, _cosineScore: score });
const select = (userChunks, aiChunks) => selectContextualRerankChunks({ userChunks, aiChunks });

test('keeps every USER chunk in source order regardless of score or length', () => {
    const user = [chunk('u', 2, 0), chunk('u', 0, 9), chunk('u', 1, 0)];
    user[0].text = '字'.repeat(1200);
    const result = select(user, [chunk('a', 0, 1)]);
    assert.deepEqual(result.userChunks, [user[1], user[2], user[0]]);
});

test('USER scores cannot consume any of the three AI anchors', () => {
    const user = [chunk('u', 0, 9), chunk('u', 1, 8), chunk('u', 2, 7)];
    const scores = new Map([[2, 0.9], [6, 0.8], [10, 0.7]]);
    const ai = Array.from({ length: 12 }, (_, i) => chunk('a', i, scores.get(i) ?? 0));
    const result = select(user, ai);
    assert.deepEqual(result.userChunks, user);
    assert.deepEqual(result.aiChunks.map(item => item.chunkIdx), [1, 2, 3, 5, 6, 7, 9, 10, 11]);
});

test('deduplicates overlapping AI windows and excludes unrelated chunks', () => {
    const ai = [chunk('a', 3, 9), chunk('a', 4, 8), chunk('a', 2, 7),
        chunk('a', 0, 6), chunk('a', 1, 5), chunk('a', 5, 4)];
    assert.deepEqual(select([], ai).aiChunks.map(item => item.chunkIdx), [1, 2, 3, 4, 5]);
});

test('neighbours do not jump missing indices or cross into the USER message', () => {
    const user = [chunk('u', 1, 99), chunk('u', 3, 98)];
    const ai = [chunk('a', 2, 9), chunk('a', 8, 8), chunk('a', 12, 7), chunk('a', 4, 6)];
    const result = select(user, ai);
    assert.deepEqual(result.userChunks, user);
    assert.deepEqual(result.aiChunks.map(item => item.chunkIdx), [2, 8, 12]);
});

test('empty or short messages remain empty or complete without duplication', () => {
    assert.deepEqual(select([], []), { userChunks: [], aiChunks: [] });
    const user = [chunk('u', 0, 1)];
    assert.deepEqual(select(user, []), { userChunks: user, aiChunks: [] });
    const ai = [chunk('a', 0, 2), chunk('a', 1, 1)];
    assert.deepEqual(select([], ai), { userChunks: [], aiChunks: ai });
});

test('does not mutate shared scored lists or their chunks', () => {
    const user = Object.freeze([chunk('u', 1, 2), chunk('u', 0, 1)].map(Object.freeze));
    const ai = Object.freeze([chunk('a', 3, 2), chunk('a', 1, 3), chunk('a', 0, 1)].map(Object.freeze));
    const result = select(user, ai);
    assert.deepEqual(result.userChunks, [user[1], user[0]]);
    assert.deepEqual(result.aiChunks, [ai[2], ai[1], ai[0]]);
    assert.deepEqual(user.map(item => item.chunkIdx), [1, 0]);
    assert.deepEqual(ai.map(item => item.chunkIdx), [3, 1, 0]);
    assert.notEqual(result.userChunks, user);
    assert.notEqual(result.aiChunks, ai);
});
