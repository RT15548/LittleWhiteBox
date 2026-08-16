import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildTemporalTurnCarrier,
    chunkMatchesTemporalCarrier,
    eventMatchesTemporalFloors,
    getTemporalProtectionLimit,
    parseEventRange,
    selectTemporalFloorWinners,
} from '../vector/retrieval/temporal-turn-carrier.js';

test('an assistant timestamp binds the preceding user turn for a user quote question', () => {
    const chat = [
        { is_user: true, name: '玛雅', mes: '玛雅说出的原话' },
        { is_user: false, mes: '113年11月20日 03:38｜魈的回答' },
    ];
    const carrier = buildTemporalTurnCarrier({
        chat,
        query: '玛雅在113年11月20日03:38对魈说了什么？',
        userName: 'unused',
    });

    assert.deepEqual(carrier.exactFloors, [1]);
    assert.deepEqual(carrier.userFloors, [0]);
    assert.deepEqual(carrier.assistantFloors, [1]);
    assert.equal(carrier.querySpeaker, 'user');
    assert.equal(chunkMatchesTemporalCarrier({ floor: 0, isUser: true, text: '原话' }, carrier), true);
    assert.equal(chunkMatchesTemporalCarrier({ floor: 1, isUser: false, text: carrier.marker }, carrier), false);
});

test('a user timestamp binds the following assistant turn for an assistant quote question', () => {
    const chat = [
        { is_user: true, mes: '113年11月20日 03:48｜提问' },
        { is_user: false, mes: '魈的完整回答' },
    ];
    const carrier = buildTemporalTurnCarrier({
        chat,
        query: '魈在113年11月20日03:48对玛雅说了什么？',
        userName: '玛雅',
    });

    assert.equal(carrier.querySpeaker, 'assistant');
    assert.deepEqual(carrier.assistantFloors, [1]);
    assert.equal(chunkMatchesTemporalCarrier({ floor: 1, isUser: false, text: '回答' }, carrier), true);
});

test('temporal floors match an event range and its adjacent turn', () => {
    assert.equal(eventMatchesTemporalFloors({
        summary: '答案事件 (#642-643)',
    }, [642]), true);
    assert.equal(eventMatchesTemporalFloors({
        summary: '相邻事件 (#642)',
    }, [642]), true);
    assert.equal(eventMatchesTemporalFloors({
        summary: '无关事件 (#100)',
    }, [642]), false);
});

test('temporal protection limits use the configured capacity and floor the share', () => {
    assert.equal(getTemporalProtectionLimit(60, 0.40), 24);
    assert.equal(getTemporalProtectionLimit(4000, 0.40), 1600);
    assert.equal(getTemporalProtectionLimit(3001, 0.40), 1200);
});

test('shared event range parser keeps the existing zero-based clamping contract', () => {
    assert.deepEqual(parseEventRange('single (#1)'), { start: 0, end: 0 });
    assert.deepEqual(parseEventRange('range (#3-5)'), { start: 2, end: 4 });
    assert.deepEqual(parseEventRange('legacy zero (#0)'), { start: 0, end: 0 });
    assert.equal(parseEventRange('missing'), null);
});

test('one ordinarily ranked item can win several floors without using extra slots', () => {
    const rows = [
        { id: 'wide', floors: [1, 2] },
        { id: 'runner-up', floors: [2] },
        { id: 'next', floors: [3] },
    ];
    assert.deepEqual(
        selectTemporalFloorWinners(rows, row => row.floors).map(row => row.id),
        ['wide', 'next'],
    );
});
