import assert from 'node:assert/strict';
import test from 'node:test';

import {
    floorsForDirectEvidenceParents,
    selectDirectEvidenceAdmission,
    selectDirectEvidenceParents,
} from '../vector/retrieval/direct-evidence-admission.js';

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

test('DIRECT evidence parents stay bounded while retaining temporal events', () => {
    const source = Array.from({ length: 25 }, (_, index) => event(index, index * 2 + 1, index * 2 + 2));
    const selected = selectDirectEvidenceParents(source, { temporalFloors: [44] });

    assert.equal(selected.length, 21);
    assert.deepEqual(selected.slice(0, 20).map(item => item.event.id), source.slice(0, 20).map(item => item.event.id));
    assert.equal(selected.some(item => item.event.id === 'evt-21'), true);
    assert.equal(selected.some(item => item.event.id === 'evt-22'), false);
    assert.deepEqual(floorsForDirectEvidenceParents([event(0, 2, 4)]), [1, 2, 3]);
});

test('an ordinary parent winner does not promote a temporal runner-up', () => {
    const ordinary = [
        event(0, 10),
        ...Array.from({ length: 19 }, (_, index) => event(index + 2, index + 30)),
    ];
    const selected = selectDirectEvidenceParents([
        ...ordinary,
        event(1, 10),
    ], { temporalFloors: [9] });

    assert.deepEqual(selected.map(item => item.event.id), ordinary.map(item => item.event.id));
});

test('extra temporal parents are globally capped at five', () => {
    const ordinary = Array.from({ length: 20 }, (_, index) => event(index, index + 101));
    const temporal = Array.from({ length: 12 }, (_, index) => event(index + 20, index + 1));
    const source = [...ordinary, ...temporal];
    const selected = selectDirectEvidenceParents(source, {
        temporalFloors: Array.from({ length: 12 }, (_, index) => index),
    });

    assert.equal(selected.length, 25);
    assert.deepEqual(selected.map(item => item.event.id), source.slice(0, 25).map(item => item.event.id));
});

test('DIRECT evidence admission keeps an exact-time chunk inside 60 candidates', () => {
    const source = Array.from({ length: 65 }, (_, index) => chunk(
        index,
        100 - index,
        index === 64 ? '<time>113年 11月20日 03:48</time>' : `chunk ${index}`,
    ));
    const admission = selectDirectEvidenceAdmission(source, {
        timeMarker: '113年11月20日03:48',
    });

    assert.equal(admission.candidates.length, 60);
    assert.equal(admission.temporalProtectedCount, 1);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-64'), true);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-59'), false);
});

test('DIRECT evidence admission keeps the requested side of a temporal turn', () => {
    const source = Array.from({ length: 65 }, (_, index) => ({
        ...chunk(index, 100 - index),
        floor: index,
        isUser: index === 64,
    }));
    const admission = selectDirectEvidenceAdmission(source, {
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
    assert.equal(admission.temporalProtectedCount, 1);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-64'), true);
    assert.equal(admission.candidates.find(item => item.chunkId === 'c-64')._directEvidenceTemporalCarrier, true);
});

test('a temporal turn protects only its highest-query-score chunk', () => {
    const source = [
        { ...chunk(1, 0.9), floor: 8, isUser: true },
        { ...chunk(2, 0.8), floor: 8, isUser: true },
        { ...chunk(3, 0.7), floor: 8, isUser: true },
    ];
    const admission = selectDirectEvidenceAdmission(source, {
        timeMarker: '113年11月20日03:38',
        temporalCarrier: {
            marker: '113年11月20日03:38',
            exactFloors: [9],
            userFloors: [8],
            assistantFloors: [9],
            querySpeaker: 'user',
        },
    });

    assert.equal(admission.temporalCandidateCount, 3);
    assert.equal(admission.temporalProtectedCount, 1);
    assert.deepEqual(
        admission.candidates.filter(item => item._directEvidenceTemporalCarrier).map(item => item.chunkId),
        ['c-1'],
    );
});

test('temporal candidate privilege is capped at forty percent without excluding ordinary matches', () => {
    const temporal = Array.from({ length: 48 }, (_, index) => ({
        ...chunk(index, 100 - index),
        floor: index,
        isUser: true,
    }));
    const ordinary = Array.from({ length: 12 }, (_, index) => chunk(48 + index, 52 - index));
    const admission = selectDirectEvidenceAdmission([...temporal, ...ordinary], {
        timeMarker: '113年11月20日03:38',
        temporalCarrier: {
            marker: '113年11月20日03:38',
            exactFloors: temporal.map(item => item.floor),
            userFloors: temporal.map(item => item.floor),
            assistantFloors: [],
            querySpeaker: 'user',
        },
    });

    assert.equal(admission.temporalProtectionCap, 24);
    assert.equal(admission.temporalProtectedCount, 24);
    assert.equal(admission.temporalOverflowCount, 24);
    assert.equal(admission.candidates.filter(item => item._directEvidenceTemporalCarrier).length, 24);
    assert.equal(admission.candidates.filter(item => item._directEvidenceTemporalMatch).length, 48);
});

test('only protected temporal winners are forced into the candidate set', () => {
    const regular = Array.from({ length: 60 }, (_, index) => chunk(index, 100 - index));
    const temporal = Array.from({ length: 30 }, (_, index) => ({
        ...chunk(60 + index, 30 - index),
        floor: 100 + index,
        isUser: true,
    }));
    const admission = selectDirectEvidenceAdmission([...regular, ...temporal], {
        temporalCarrier: {
            marker: '113年11月20日03:38',
            exactFloors: temporal.map(item => item.floor),
            userFloors: temporal.map(item => item.floor),
            assistantFloors: [],
            querySpeaker: 'user',
        },
    });

    assert.equal(admission.temporalForcedCount, 24);
    assert.equal(admission.candidates.filter(item => item._directEvidenceTemporalCarrier).length, 24);
    assert.equal(admission.candidates.some(item => item.chunkId === 'c-84'), false);
});

test('marker-only matches protect one winner on each actual chunk floor', () => {
    const admission = selectDirectEvidenceAdmission([
        chunk(1, 1, '113年11月20日03:38 first'),
        { ...chunk(2, 0.9, '113年11月20日03:38 second'), floor: 9 },
        chunk(3, 0.8),
        chunk(4, 0.7),
        chunk(5, 0.6),
    ], {
        timeMarker: '113年11月20日03:38',
    });

    assert.equal(admission.temporalProtectedCount, 2);
    assert.deepEqual(
        admission.candidates.filter(item => item._directEvidenceTemporalCarrier).map(item => item.chunkId),
        ['c-1', 'c-2'],
    );
});
