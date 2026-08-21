import assert from 'node:assert/strict';
import test from 'node:test';

import {
    EVENT_RERANK_CANDIDATE_MAX,
    selectEventRerankCandidates,
} from '../vector/retrieval/event-rerank-admission.js';

function recalledEvent(index, similarity = index) {
    return {
        event: {
            id: `event-${index}`,
            title: `事件 ${index}`,
            summary: `事件 ${index} (#${index + 1})`,
        },
        similarity,
    };
}

test('event rerank admission selects top 60 from recalled similarities without rescoring', () => {
    const source = Array.from({ length: 65 }, (_, index) => recalledEvent(index, index / 100));
    source.reverse();

    const result = selectEventRerankCandidates(source);

    assert.equal(result.candidates.length, EVENT_RERANK_CANDIDATE_MAX);
    assert.deepEqual(
        result.candidates.map(item => item.event.id),
        Array.from({ length: 60 }, (_, index) => `event-${64 - index}`),
    );
    assert.deepEqual(result.tail.map(item => item.event.id), [
        'event-4',
        'event-3',
        'event-2',
        'event-1',
        'event-0',
    ]);
});

test('event rerank admission still protects an exact-time event below the similarity cut', () => {
    const marker = '113年11月20日03:48';
    const source = Array.from({ length: 65 }, (_, index) => recalledEvent(index, 100 - index));
    source[63].event.summary = '非目标事件 (#1)';
    source[64].event.summary = '时间目标 (#65)';
    const chat = Array.from({ length: 65 }, (_, index) => ({
        mes: index === 64 ? `<time>${marker}</time>` : `消息 ${index}`,
    }));

    const result = selectEventRerankCandidates(source, {
        temporalQuery: marker,
        chat,
    });

    assert.equal(result.candidates.length, EVENT_RERANK_CANDIDATE_MAX);
    assert.equal(result.exactTimeForcedCount, 1);
    assert.equal(result.candidates.some(item => item.event.id === 'event-64'), true);
    assert.equal(result.candidates.some(item => item.event.id === 'event-59'), false);
});

test('event rerank admission preserves eligible order and ineligible tail below the cap', () => {
    const ineligible = { event: { id: 'missing-summary' }, similarity: 1 };
    const first = recalledEvent(1, 0.1);
    const second = recalledEvent(2, 0.9);

    const result = selectEventRerankCandidates([first, ineligible, second]);

    assert.deepEqual(result.candidates, [first, second]);
    assert.deepEqual(result.tail, [ineligible]);
});
