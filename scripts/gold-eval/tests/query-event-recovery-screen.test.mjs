import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildQueryEventCandidates,
    packQueryEventCandidates,
} from '../experiments/query-event-recovery-screen.mjs';

function event(id, summary = `事件 ${id} (#1)`) {
    return { id, title: id, summary, participants: ['甲'] };
}

test('query-event recovery 只取 dense gate 后的非 core top candidates', () => {
    const rows = buildQueryEventCandidates({
        allEvents: [event('a'), event('b'), event('c'), event('d')],
        eventScoreEntries: [['a', 0.8], ['b', 0.9], ['c', 0.7], ['d', 0.5]],
        minimumSimilarity: 0.6,
        excludedIds: new Set(['event:b']),
        limit: 2,
    });
    assert.deepEqual(rows.map(item => [item.event.id, item.denseRank]), [['a', 1], ['c', 2]]);
});

test('query-event recovery 按完整事件单位装箱且不截断后续可放事件', () => {
    const candidates = [
        { eventId: 'large', text: '大'.repeat(100) },
        { eventId: 'small', text: '小'.repeat(8) },
    ];
    const oneSmall = packQueryEventCandidates([candidates[1]], 20);
    const packed = packQueryEventCandidates(candidates, oneSmall.tokens);
    assert.deepEqual(packed.selected.map(item => item.eventId), ['small']);
    assert.match(packed.text, /小{8}/);
    assert.doesNotMatch(packed.text, /大/);
});
