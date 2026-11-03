import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createLearningSeenUnits, applyLearningSentenceRevisions, learningAnnotatedSegments, learningSeeAgainLabel,
} from '../apps/learning/ui/workbench.js';
import { learningCompanionDelay } from '../apps/learning/application/companion.js';
import { learningGrowth } from '../apps/learning/application/projection.js';
import { learningAnswerParagraphs } from '../domains/learning/facts.js';
import { measureLearningText } from '../domains/learning/text.js';

test('writing count uses characters for CJK and words elsewhere', () => {
    assert.deepEqual(measureLearningText('公园让城市更凉快。', 'zh-CN'), { count: 8, unit: 'characters' });
    assert.deepEqual(measureLearningText('公園は 涼しい', 'ja'), { count: 6, unit: 'characters' });
    assert.deepEqual(measureLearningText("Parks don't just cool cities — they calm people.", 'en'), { count: 8, unit: 'words' });
    assert.deepEqual(measureLearningText('   ', 'fr'), { count: 0, unit: 'words' });
});

test('sentence revisions rewrite quotes inside the counted paragraph and keep the rest', () => {
    const draft = 'Parks is good.\n\nTrees gives shade. Trees gives air.\r\nThe end.';
    const result = applyLearningSentenceRevisions(draft, [
        { id: 'a1', paragraphIndex: 0, quote: 'Parks is', replacement: 'Parks are' },
        { id: 'a2', paragraphIndex: 1, quote: 'Trees gives air', replacement: 'Trees give air' },
        { id: 'a3', paragraphIndex: 2, quote: 'missing', replacement: 'x' },
        { id: 'a4', paragraphIndex: 9, quote: 'The', replacement: 'x' },
    ]);
    assert.equal(result.text, 'Parks are good.\n\nTrees gives shade. Trees give air.\r\nThe end.');
    assert.deepEqual(result.missing, ['a3', 'a4']);
    assert.deepEqual(learningAnswerParagraphs(result.text).length, learningAnswerParagraphs(draft).length);
    // Replacement text is literal, not a replace() pattern.
    assert.equal(applyLearningSentenceRevisions('a b', [{ id: 'x', paragraphIndex: 0, quote: 'b', replacement: '$&$&' }]).text, 'a $&$&');
    assert.deepEqual(result.applied, ['a1', 'a2']);
});

test('sentence revisions place every quote in the original draft, so edits never break each other', () => {
    // A longer rewrite on the left would shift an index found later; the right one still lands on its own words.
    const shifted = applyLearningSentenceRevisions('He go home and she go out.', [
        { id: 'a', paragraphIndex: 0, quote: 'He go', replacement: 'Every evening he goes' },
        { id: 'b', paragraphIndex: 0, quote: 'she go', replacement: 'she goes' },
    ]);
    assert.equal(shifted.text, 'Every evening he goes home and she goes out.');
    assert.deepEqual(shifted.applied, ['a', 'b']);
    // Two notes on the same words take the two places, in note order; an unchanged note keeps its place.
    const twice = [{ id: 'first', quote: 'is go' }, { id: 'second', quote: 'is go' }];
    const draft = 'He is go. She is go.';
    const second = applyLearningSentenceRevisions(draft, twice.map(mark => ({ ...mark, paragraphIndex: 0, replacement: mark.id === 'second' ? 'went' : mark.quote })));
    assert.equal(second.text, 'He is go. She went.');
    assert.deepEqual(second.applied, ['second']);
    assert.deepEqual(learningAnnotatedSegments(draft, twice).filter(segment => segment.id).map(segment => segment.id), ['first', 'second']);
    // A quote overlapping an earlier note has no place of its own and is reported, not half-applied.
    const overlap = applyLearningSentenceRevisions('I goes to school.', [
        { id: 'a', paragraphIndex: 0, quote: 'I goes', replacement: 'I go' },
        { id: 'b', paragraphIndex: 0, quote: 'goes to', replacement: 'went to' },
    ]);
    assert.deepEqual([overlap.text, overlap.missing, overlap.applied], ['I go to school.', ['b'], ['a']]);
    // Nothing placed means nothing to submit.
    assert.deepEqual(applyLearningSentenceRevisions('Fine.', [{ id: 'x', paragraphIndex: 0, quote: 'gone', replacement: 'went' }]),
        { text: 'Fine.', missing: ['x'], applied: [] });
});

test('annotated segments mark first matches without overlap', () => {
    assert.deepEqual(learningAnnotatedSegments('I goes to school and I goes home.', [
        { id: 'b', quote: 'goes home' }, { id: 'a', quote: 'I goes' }, { id: 'c', quote: 'goes to' }, { id: 'd', quote: 'absent' },
    ]), [{ text: 'I goes', id: 'a' }, { text: ' to school and I ' }, { text: 'goes home', id: 'b' }, { text: '.' }]);
    assert.deepEqual(learningAnnotatedSegments('plain', []), [{ text: 'plain' }]);
});

test('companion delay stays between 3 and 12 minutes', () => {
    assert.equal(learningCompanionDelay(() => 0), 180_000);
    assert.equal(learningCompanionDelay(() => 1), 720_000);
    assert.equal(learningCompanionDelay(() => 0.5), 450_000);
    assert.equal(learningCompanionDelay(() => 7), 720_000);
});

test('see-again chip counts calendar days', () => {
    const now = new Date(2026, 8, 1, 12).getTime();
    assert.equal(learningSeeAgainLabel(new Date(2026, 8, 1, 20).toISOString(), now), '今天复习');
    assert.equal(learningSeeAgainLabel(new Date(2026, 7, 20).toISOString(), now), '今天复习');
    assert.equal(learningSeeAgainLabel(new Date(2026, 8, 2, 1).toISOString(), now), '明天再见');
    assert.equal(learningSeeAgainLabel(new Date(2026, 8, 7, 9).toISOString(), now), '6 天后再见');
});

test('growth only speaks from evidence and admits when there is too little', () => {
    const item = (label, state, evidenceCount, readable = true) => ({ label, skill: 'grammar', state, evidenceCount, readable });
    assert.equal(learningGrowth([item('冠词', 'strengthen', 1), item('新词', 'unassessed', 0)], 0).enough, false);
    const growth = learningGrowth([item('冠词', 'independent', 3), item('时态', 'strengthen', 2), item('搭配', 'practised', 1), item('隐藏', 'independent', 5, false)], 2);
    assert.equal(growth.enough, true);
    assert.deepEqual([growth.steady, growth.struggling, growth.practising, growth.evidence, growth.completed], [['冠词'], ['时态'], ['搭配'], 6, 2]);
});

test('a finished unit is remembered as seen in storage, and for the session when storage fails', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const first = createLearningSeenUnits(() => storage);
    assert.equal(first.has('rv1'), false);
    first.mark('rv1');
    assert.equal(createLearningSeenUnits(() => storage).has('rv1'), true);
    values.set('xiaobai-learning-seen-units', '{broken');
    assert.equal(createLearningSeenUnits(() => storage).has('rv1'), false);
    const failing = createLearningSeenUnits(() => ({ getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } }));
    failing.mark('rv2');
    assert.equal(failing.has('rv2'), true);
    assert.equal(createLearningSeenUnits(() => null).has('rv2'), false);
});
