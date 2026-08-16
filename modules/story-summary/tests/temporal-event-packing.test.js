import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTemporalEventPackingOrder } from '../generate/temporal-event-packing.js';

function event(id, start, end = start) {
    return { event: { id, summary: `${id} (#${start}-${end})` } };
}

test('L2 时间保护每个楼层只取普通排名最高的事件', () => {
    const result = buildTemporalEventPackingOrder([
        event('winner', 10),
        event('ordinary', 30),
        event('same-floor-runner-up', 10),
    ], [9]);

    assert.deepEqual(result.order, [
        { candidateRank: 0, temporal: true },
        { candidateRank: 1, temporal: false },
        { candidateRank: 2, temporal: false },
    ]);
    assert.equal(result.winnerCount, 1);
    assert.equal(result.protectedCount, 1);
});

test('L2 时间保护全局最多五项，溢出项回普通排名', () => {
    const candidates = Array.from({ length: 7 }, (_, index) => event(`evt-${index}`, index * 3 + 1));
    const result = buildTemporalEventPackingOrder(
        candidates,
        Array.from({ length: 7 }, (_, index) => index * 3),
        { maxProtectedEvents: 5 },
    );

    assert.deepEqual(result.order.map(row => row.candidateRank), [0, 1, 2, 3, 4, 5, 6]);
    assert.deepEqual(result.order.map(row => row.temporal), [true, true, true, true, true, false, false]);
    assert.equal(result.overflowCount, 2);
});

test('一个事件覆盖多个时间楼层时只占一个保护名额', () => {
    const result = buildTemporalEventPackingOrder([
        event('wide', 1, 3),
        event('runner-up', 2),
    ], [0, 1, 2]);

    assert.equal(result.winnerCount, 1);
    assert.equal(result.protectedCount, 1);
});
