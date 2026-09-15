import assert from 'node:assert/strict';
import test from 'node:test';
import { selectBoundedEventCandidates } from '../vector/retrieval/event-candidate-selection.js';
import { selectEventRerankCandidates } from '../vector/retrieval/event-rerank-admission.js';
import { buildTemporalTurnCarrier } from '../vector/retrieval/temporal-turn-carrier.js';

const hit = (id, floor, similarity) => ({
    event: { id, summary: '事件 (#' + (floor + 1) + ')' },
    similarity,
});

test('diversity selection cannot undo protection and the reserve remains at most five', () => {
    const source = Array.from({ length: 100 }, (_, i) => hit('event-' + i, i * 2, 1 - i / 200));
    const floors = source.slice(-7).map((_, i) => (93 + i) * 2);
    const selected = selectBoundedEventCandidates(source, 50, floors, source.slice(0, 50));
    assert.equal(selected.candidates.length, 50);
    assert.equal(selected.reserved, 5);
    assert.equal(selected.forced, 5);
    assert.equal(selected.overflow, 2);
    assert.deepEqual(selected.candidates.slice(-5).map(item => item.event.id).sort(),
        ['event-93', 'event-94', 'event-95', 'event-96', 'event-97']);
});

test('a date in the current question or its swiped reply is not historical evidence', () => {
    const query = '113年11月20日03:38发生了什么？';
    const chat = [
        { is_user: true, mes: '今天去集市吗？' },
        { is_user: false, mes: '买了水果。' },
        { is_user: true, mes: query },
        { is_user: false, mes: '113年11月20日03:38：待重生成的回答' },
    ];
    const carrier = buildTemporalTurnCarrier({ chat, query, queryFloor: 2 });
    assert.deepEqual(carrier.exactFloors, []);
    const source = Array.from({ length: 60 }, (_, i) => hit('ordinary-' + i, 0, 0.9));
    const wrong = hit('preceding-market', 1, 0.61);
    const result = selectEventRerankCandidates([...source, wrong], {
        chat, temporalQuery: query, queryFloor: 2,
    });
    assert.equal(result.exactTimeForcedCount, 0);
    assert.ok(!result.candidates.includes(wrong));
});
