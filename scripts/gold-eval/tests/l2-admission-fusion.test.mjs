import test from 'node:test';
import assert from 'node:assert/strict';
import { compareL2Admission } from '../experiments/l2-admission-fusion.mjs';

const pool = size => Array.from({ length: size }, (_, i) => ({
    event: { id: `e${i}`, summary: `record (#${i + 1})` }, similarity: 1 - i / 200,
}));
const options = { lexicalEventIds: [], selectedFloors: [], chat: [], temporalQuery: '', queryFloor: 0 };
const ids = items => items.map(item => item.event.id);

// Protect the approved experimental isolation, not an asserted quality benefit.
test('small pools and absent alternate evidence preserve admission', () => {
    for (const size of [0, 10, 60, 100]) {
        const result = compareL2Admission(pool(size), options);
        assert.deepEqual(ids(result.treatment.candidates), ids(result.control.candidates));
        assert.equal(result.promoted.length, 0);
    }
});

test('alternate evidence promotes eligible events without changing pool or capacity', () => {
    const source = pool(100);
    const result = compareL2Admission(source, { ...options, lexicalEventIds: ['foreign', 'e90'], selectedFloors: [90] });
    assert.ok(result.promoted.some(row => row.eventId === 'e90'));
    assert.equal(result.treatment.candidates.length, 60);
    assert.deepEqual([...ids(result.treatment.candidates), ...ids(result.treatment.tail)].sort(), ids(source).sort());
    assert.equal(result.displaced.length, result.promoted.length);
    const row = result.rows.find(row => row.eventId === 'e90');
    assert.equal(row.lexicalRank, 1);
    assert.equal(row.floorSupportEventRank, 1);
});

test('repeated floor support is not extra votes; same best floor receives tied rank', () => {
    const source = pool(100);
    source[80].event.summary = 'record (#91-93)';
    const a = compareL2Admission(source, { ...options, selectedFloors: [90, 91, 92] });
    const b = compareL2Admission(source, { ...options, selectedFloors: [90, 90, 91, 92, 92] });
    assert.deepEqual(a.rows, b.rows);
    const get = id => a.rows.find(row => row.eventId === id);
    assert.equal(get('e80').floorSupportEventRank, get('e90').floorSupportEventRank);
    assert.equal(get('e80').contributions.floor, get('e90').contributions.floor);
});

test('existing exact-time winner remains protected inside the same capacity', () => {
    const source = pool(100);
    const opts = { ...options, lexicalEventIds: ids(source).reverse(), selectedFloors: [],
        chat: Array.from({ length: 100 }, (_, i) => ({ mes: i === 99 ? '11月26日03:15' : '' })),
        temporalQuery: '11月26日03:15', queryFloor: 100 };
    const result = compareL2Admission(source, opts);
    assert.ok(ids(result.control.candidates).includes('e98'));
    assert.ok(ids(result.treatment.candidates).includes('e98'));
    assert.equal(result.treatment.candidates.length, 60);
});
