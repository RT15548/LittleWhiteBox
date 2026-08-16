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

test('人物归属只读取当前消息，并把我/你解析为当前双方', () => {
    assert.deepEqual(
        resolveFocusCharacters('我亲了你。', [], { name1: '玩家', name2: '林月' }),
        ['玩家', '林月'],
    );
    assert.deepEqual(
        resolveFocusCharacters('小周刚才做了什么？', ['小周'], { name1: '玩家', name2: '林月' }),
        ['小周'],
    );
});

test('continue 的 AI 焦点反转我/你归属，并保持事件分类一致', () => {
    const context = { name1: '玩家', name2: '林月' };

    assert.deepEqual(resolveFocusCharacters('我会继续。', [], context, true), ['玩家']);
    assert.deepEqual(resolveFocusCharacters('你听见了吗？', [], context, true), ['林月']);
    assert.deepEqual(resolveFocusCharacters('我会继续。', [], context, false), ['林月']);
    assert.deepEqual(resolveFocusCharacters('你听见了吗？', [], context, false), ['玩家']);

    const continueFocus = new Set(resolveFocusCharacters('我会继续。', [], context, false));
    assert.equal(classifyEventRecall(eventWithParticipants('林月'), continueFocus, 0.1).recallType, 'DIRECT');
    assert.equal(classifyEventRecall(eventWithParticipants('玩家'), continueFocus, 0.9).recallType, 'RELATED');
});

test('AI 焦点中双方代词按 AI 在前的视角去重', () => {
    assert.deepEqual(
        resolveFocusCharacters('我亲了你。', [], { name1: '玩家', name2: '林月' }, false),
        ['林月', '玩家'],
    );
});
