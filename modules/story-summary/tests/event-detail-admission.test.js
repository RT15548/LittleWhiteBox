import assert from 'node:assert/strict';
import test from 'node:test';

import {
    floorsForEventDetailParents,
    selectEventDetailAdmission,
    selectEventDetailParents,
    selectPackedEventDetails,
} from '../vector/retrieval/event-detail-admission.js';

function event(index, start = index + 1, end = start) {
    return {
        event: { id: `evt-${index}`, summary: `事件 ${index} (#${start}-${end})` },
        _recallType: 'DIRECT',
    };
}

function chunk(index, score, text = `chunk ${index}`) {
    return {
        chunkId: `c-${index}`,
        floor: index,
        chunkIdx: 0,
        text,
        _cosineScore: score,
        _vectorPresent: true,
    };
}

test('detail parents stay inside the first 20 selected DIRECT events plus temporal parents', () => {
    const source = Array.from({ length: 25 }, (_, index) => event(index, index * 2 + 1, index * 2 + 2));
    const selected = selectEventDetailParents(source, { limit: 20, temporalFloors: [44] });

    assert.equal(selected.length, 22);
    assert.deepEqual(selected.slice(0, 20).map(item => item.event.id), source.slice(0, 20).map(item => item.event.id));
    assert.equal(selected.some(item => item.event.id === 'evt-21'), true);
    assert.equal(selected.some(item => item.event.id === 'evt-22'), true);
    assert.deepEqual(floorsForEventDetailParents([event(0, 2, 4)]), [1, 2, 3]);
});

test('detail admission keeps an exact-time chunk inside the fixed 60 slots', () => {
    const source = Array.from({ length: 65 }, (_, index) => chunk(
        index,
        100 - index,
        index === 64 ? '<time>113年 11月20日 03:48</time>' : `chunk ${index}`,
    ));
    const admission = selectEventDetailAdmission(source, {
        limit: 60,
        timeMarker: '113年11月20日03:48',
    });

    assert.equal(admission.candidates.length, 60);
    assert.equal(admission.temporalReservedCount, 1);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-64'), true);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-59'), false);
});

test('detail admission keeps the requested speaker side of a temporal turn', () => {
    const source = Array.from({ length: 65 }, (_, index) => ({
        ...chunk(index, 100 - index),
        floor: index,
        isUser: index === 64,
    }));
    const admission = selectEventDetailAdmission(source, {
        limit: 60,
        timeMarker: '113年11月20日03:38',
        temporalCarrier: {
            marker: '113年11月20日03:38',
            exactFloors: [65],
            userFloors: [64],
            assistantFloors: [65],
            querySpeaker: 'user',
        },
    });

    assert.equal(admission.candidates.length, 60);
    assert.equal(admission.temporalReservedCount, 1);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-64'), true);
    assert.equal(admission.candidates.find(item => item.chunkId === 'c-64')._detailTemporalCarrier, true);
});

test('detail packing keeps a low-ranked temporal carrier inside top24 and 1500 tokens', () => {
    const ranked = Array.from({ length: 60 }, (_, index) => ({
        chunkId: `c-${index}`,
        score: 100 - index,
        _detailTemporalCarrier: index === 58,
        cost: 60,
    }));
    const packed = selectPackedEventDetails(ranked, {
        budget: 1500,
        limit: 24,
        costFor: item => item.cost,
    });

    assert.equal(packed.guardedChunkId, 'c-58');
    assert.equal(packed.selected.length, 24);
    assert.equal(packed.selected.some(item => item.chunkId === 'c-58'), true);
    assert.equal(packed.selected.some(item => item.chunkId === 'c-23'), false);
    assert.ok(packed.used <= 1500);
});
