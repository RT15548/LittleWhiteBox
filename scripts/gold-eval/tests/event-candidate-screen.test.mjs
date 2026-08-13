import test from 'node:test';
import assert from 'node:assert/strict';

import { mmrSelect, selectFinalEventCandidates } from '../experiments/event-candidate-screen.mjs';

function candidate(id, similarity) {
    return { event: { id }, similarity, _recallType: 'DIRECT' };
}

test('H-EVENT final selection deduplicates then caps the merged set', () => {
    const candidates = [candidate('evt-a', 0.9), candidate('evt-a', 0.8), candidate('evt-b', 0.9), candidate('evt-c', 0.7)];
    const vectors = new Map([['evt-a', [1, 0]], ['evt-b', [0, 1]], ['evt-c', [1, 1]]]);
    const result = selectFinalEventCandidates(candidates, vectors);
    assert.equal(result.ok, true);
    assert.equal(result.inputEvents, 3);
    assert.deepEqual(result.events.map(item => item.event.id), ['evt-a', 'evt-b', 'evt-c']);
});

test('H-EVENT treats a missing final-candidate vector as invalid', () => {
    const result = selectFinalEventCandidates([candidate('evt-a', 0.9), candidate('evt-missing', 0.8)], new Map([['evt-a', [1, 0]]]));
    assert.equal(result.ok, false);
    assert.deepEqual(result.missingVectorIds, ['evt-missing']);
    assert.deepEqual(result.events, []);
});

test('H-EVENT MMR keeps insertion order for exact score ties', () => {
    const selected = mmrSelect([candidate('evt-first', 0.9), candidate('evt-second', 0.9)], new Map([
        ['evt-first', [1, 0]],
        ['evt-second', [1, 0]],
    ]), { limit: 1 });
    assert.deepEqual(selected.map(item => item.event.id), ['evt-first']);
});
