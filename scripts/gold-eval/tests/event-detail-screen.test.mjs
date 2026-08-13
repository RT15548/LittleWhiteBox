import test from 'node:test';
import assert from 'node:assert/strict';

import {
    answerSurfaceInText,
    floorCoveredByRanges,
    parseFloorRange,
} from '../experiments/event-detail-screen.mjs';

test('H-L1-EVENT-DETAIL parses 1-based event floor hints into 0-based ranges', () => {
    assert.deepEqual(parseFloorRange('事件摘要 (#12-14)'), { start: 11, end: 13 });
    assert.deepEqual(parseFloorRange('事件摘要 (#8)'), { start: 7, end: 7 });
    assert.equal(parseFloorRange('no floor hint'), null);
});

test('H-L1-EVENT-DETAIL checks floor coverage against recalled event ranges', () => {
    const ranges = [
        { eventId: 'evt-a', range: { start: 10, end: 12 } },
        { eventId: 'evt-b', range: { start: 20, end: 20 } },
    ];
    assert.equal(floorCoveredByRanges(11, ranges), true);
    assert.equal(floorCoveredByRanges(20, ranges), true);
    assert.equal(floorCoveredByRanges(13, ranges), false);
});

test('H-L1-EVENT-DETAIL normalizes punctuation for exact answer surface checks', () => {
    const goldCase = { expectedAnswer: { type: 'exact', values: ['继父的背叛'] } };
    assert.equal(answerSurfaceInText('她说的是“继父背叛”这件事。', goldCase), true);
    assert.equal(answerSurfaceInText('她说的是母亲关系。', goldCase), false);
});
