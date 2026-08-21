import test from 'node:test';
import assert from 'node:assert/strict';

import {
    classifyEventRecall,
    eventOwnership,
    resolveFocusCharacters,
} from '../vector/retrieval/event-recall-classification.js';

function eventWithParticipants(...participants) {
    return { participants };
}

const FOCUS = new Set(['林月']);

test('归属与语义解耦：focus 命中即 DIRECT，与相似度无关', () => {
    assert.deepEqual(
        classifyEventRecall(eventWithParticipants('林月', '小周'), FOCUS, 0.61),
        { ownership: 'focus', recallType: 'DIRECT', evidenceEligible: true },
    );
    assert.equal(eventOwnership(eventWithParticipants('林月'), FOCUS), 'focus');
});

test('归属 other（明确谈别人）永远 RELATED', () => {
    assert.deepEqual(
        classifyEventRecall(eventWithParticipants('小周'), FOCUS, 0.95),
        { ownership: 'other', recallType: 'RELATED', evidenceEligible: false },
    );
});

test('unknown 保持 RELATED，语义分数不能替代人物归属', () => {
    const nameless = new Set();

    assert.equal(eventOwnership(eventWithParticipants('小周'), nameless), 'unknown');
    assert.equal(eventOwnership(eventWithParticipants(), FOCUS), 'unknown');

    assert.deepEqual(
        classifyEventRecall(eventWithParticipants('小周'), nameless, 0.69),
        { ownership: 'unknown', recallType: 'RELATED', evidenceEligible: false },
    );
    assert.deepEqual(
        classifyEventRecall(eventWithParticipants('小周'), nameless, 0.70),
        { ownership: 'unknown', recallType: 'RELATED', evidenceEligible: true },
    );
});

test('焦点人物只接受当前消息显式提到且已由剧情确认的角色', () => {
    const confirmed = new Set(['林月', '小周']);

    assert.deepEqual(
        resolveFocusCharacters(['小周', '陌生人'], confirmed, ['玩家']),
        ['小周'],
    );
    assert.deepEqual(
        resolveFocusCharacters(['林月'], confirmed, ['玩家']),
        ['林月'],
    );
});

test('代词不会自动加入 USER 名或角色卡名', () => {
    const confirmed = new Set(['林月']);
    assert.deepEqual(resolveFocusCharacters([], confirmed, ['玩家']), []);
    assert.deepEqual(resolveFocusCharacters(['我', '你', '我们'], confirmed, ['玩家']), []);
});

test('name2 只有已被剧情确认且被显式提到时才进入焦点人物', () => {
    const cardName = '跨服饲养';

    assert.deepEqual(resolveFocusCharacters([cardName], new Set(), ['蓝袖']), []);
    assert.deepEqual(
        resolveFocusCharacters([cardName], new Set([cardName]), ['蓝袖']),
        [cardName],
    );
});

test('USER 名即使出现在确认集合中也永不进入焦点人物', () => {
    const confirmed = new Set(['蓝袖', '林月']);
    const focusCharacters = resolveFocusCharacters(['蓝袖', '林月'], confirmed, ['蓝袖']);

    assert.deepEqual(focusCharacters, ['林月']);
    assert.equal(classifyEventRecall(eventWithParticipants('蓝袖'), new Set(focusCharacters), 0.9).recallType, 'RELATED');
    assert.equal(classifyEventRecall(eventWithParticipants('林月'), new Set(focusCharacters), 0.1).recallType, 'DIRECT');
});
