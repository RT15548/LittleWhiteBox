import test from 'node:test';
import assert from 'node:assert/strict';

import {
    packCurrentEvents,
    packTwoPassEvents,
} from '../experiments/prompt-packing-screen.mjs';

function event(id, floor, similarity, summaryBody = '简短事件摘要') {
    return {
        event: {
            id,
            title: id,
            timeLabel: '',
            summary: `${summaryBody} (#${floor + 1})`,
            participants: ['甲', '乙'],
            causedBy: [],
        },
        similarity,
        _recallType: 'DIRECT',
    };
}

test('两遍式只改变装配顺序，不改变冻结候选排序', () => {
    const recallResult = {
        events: [event('evt-a', 0, 0.9), event('evt-b', 1, 0.8), event('evt-c', 2, 0.7)],
        causalChain: [],
        l0Selected: [],
        l1ByFloorEntries: [],
    };
    const current = packCurrentEvents(recallResult);
    const arm = packTwoPassEvents(recallResult);
    assert.deepEqual(current.selected.map(item => item.eventId), ['evt-a', 'evt-b', 'evt-c']);
    assert.deepEqual(arm.selected.map(item => item.eventId), ['evt-a', 'evt-b', 'evt-c']);
    assert.ok(current.eventTokens <= 5000);
    assert.ok(arm.eventTokens <= 5000);
});

test('两遍式先保留更多摘要，证据只按原序整体回填', () => {
    const longEvidence = '证据'.repeat(900);
    const longSummary = '摘要'.repeat(380);
    const recallResult = {
        events: Array.from({ length: 7 }, (_, index) => (
            event(`evt-${index}`, index, 0.9 - index / 10, index === 0 ? '简短事件摘要' : longSummary)
        )),
        causalChain: [],
        l0Selected: [{ id: 'atom-a', floor: 0, atom: { semantic: longEvidence } }],
        l1ByFloorEntries: [],
    };
    const current = packCurrentEvents(recallResult);
    const arm = packTwoPassEvents(recallResult);
    assert.ok(arm.selected.length > current.selected.length);
    assert.deepEqual(
        arm.selected.map(item => item.eventId),
        Array.from({ length: arm.selected.length }, (_, index) => `evt-${index}`),
    );
    assert.equal(arm.selected[0].evidenceFloors.length, 0);
    assert.ok(arm.eventTokens <= 5000);
});

test('RELATED 子预算仍为硬边界', () => {
    const related = Array.from({ length: 20 }, (_, index) => ({
        ...event(`evt-${index}`, index, 1 - index / 100, '相关事件'.repeat(20)),
        _recallType: 'RELATED',
    }));
    const recallResult = { events: related, causalChain: [], l0Selected: [], l1ByFloorEntries: [] };
    const current = packCurrentEvents(recallResult);
    const arm = packTwoPassEvents(recallResult);
    assert.ok(current.relatedTokens <= 500);
    assert.ok(arm.relatedTokens <= 500);
});
