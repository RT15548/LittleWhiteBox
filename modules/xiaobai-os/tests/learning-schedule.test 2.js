import assert from 'node:assert/strict';
import test from 'node:test';

import { assessLearning } from '../domains/learning/assessment.js';
import {
    advanceLearningSchedule, correctLearningSchedules, learningReviewQuality, learningReviewTier, learningScheduleAt, learningScheduled,
    learningScheduleReason, newLearningSchedule, parseLearningSchedule, selectDueLearningItems,
} from '../domains/learning/schedule.js';

const T0 = '2026-09-01T08:00:00.000Z';
const day = (n, from = T0) => new Date(Date.parse(from) + n * 86400000).toISOString();
const help = (overrides = {}) => ({ answer: false, hint: false, feedback: false, transcript: false, replays: 0, slowPlayback: false, ...overrides });
const item = (id, dueAt, extra = {}) => ({ id, label: id, scope: { kind: 'public' }, skill: 'vocabulary', evidence: [], schedule: learningScheduleAt(dueAt), ...extra });

test('only grammar and vocabulary are scheduled; a new item is first due the next day', () => {
    assert.deepEqual(['grammar', 'vocabulary', 'reading', 'writing', 'listening'].map(learningScheduled), [true, true, false, false, false]);
    assert.deepEqual(newLearningSchedule(T0), { ef: 2.5, repetitions: 0, intervalDays: 0, dueAt: day(1), lastAttemptId: null, lastQuality: null });
    assert.deepEqual(parseLearningSchedule(newLearningSchedule(T0)), newLearningSchedule(T0));
    for (const bad of [{ ef: 1.2 }, { ef: Infinity }, { ef: '2.5' }, { lastQuality: 6 }, { repetitions: -1 }, { dueAt: 'tomorrow' }, { extra: 1 }]) {
        assert.throws(() => parseLearningSchedule({ ...newLearningSchedule(T0), ...bad }));
    }
});

test('review quality comes from verdict, help and recall signal; a disputed judgement does not move memory', () => {
    const q = (verdict, signal, h = help()) => learningReviewQuality({ help: h }, { verdict, ...(signal ? { signal } : {}) });
    assert.equal(q('correct'), 5);
    assert.equal(q('correct', 'clean'), 5);
    assert.equal(q('correct', 'hesitant'), 4);
    assert.equal(q('correct', undefined, help({ hint: true })), 3);
    assert.equal(q('correct', 'hesitant', help({ answer: true })), 3);
    assert.equal(q('partial'), 2);
    assert.equal(q('incorrect'), 1);
    assert.equal(q('incorrect', 'blank'), 0);
    assert.equal(q('correct', 'blank'), 0);
    assert.equal(q('disputed', 'clean'), null);
});

test('SM-2 steps 1, 6, then interval x ease; a lapse restarts without losing ease; one attempt advances once', () => {
    let s = newLearningSchedule(T0);
    s = advanceLearningSchedule(s, 5, 'a1', day(1));
    assert.deepEqual(s, { ef: 2.6, repetitions: 1, intervalDays: 1, dueAt: day(2), lastAttemptId: 'a1', lastQuality: 5 });
    assert.equal(advanceLearningSchedule(s, 1, 'a1', day(3)), s);
    s = advanceLearningSchedule(s, 4, 'a2', day(2));
    assert.deepEqual(s, { ef: 2.6, repetitions: 2, intervalDays: 6, dueAt: day(8), lastAttemptId: 'a2', lastQuality: 4 });
    s = advanceLearningSchedule(s, 3, 'a3', day(8));
    assert.deepEqual(s, { ef: 2.46, repetitions: 3, intervalDays: 16, dueAt: day(24), lastAttemptId: 'a3', lastQuality: 3 });
    s = advanceLearningSchedule(s, 0, 'a4', day(24));
    assert.deepEqual(s, { ef: 2.46, repetitions: 0, intervalDays: 1, dueAt: day(25), lastAttemptId: 'a4', lastQuality: 0 });
    let low = learningScheduleAt(T0);
    for (let i = 0; i < 12; i++) { low = advanceLearningSchedule(low, 3, `low${i}`, T0); }
    assert.equal(low.ef, 1.3);
});

test('a deleted, disputed or re-judged attempt returns only the items it last moved to the entry state', () => {
    const moved = item('moved', T0);
    moved.schedule = advanceLearningSchedule(moved.schedule, 5, 'a1', T0);
    const other = item('other', T0);
    other.schedule = advanceLearningSchedule(other.schedule, 5, 'a2', T0);
    const before = structuredClone(other.schedule);
    correctLearningSchedules([moved, other], 'a1', day(3));
    assert.deepEqual(moved.schedule, newLearningSchedule(day(3)));
    assert.deepEqual(other.schedule, before);
});

function reviewHistory(sameTime = false) {
    const scope = { kind: 'public' };
    return { language: 'en', unit: null, completions: [], items: [item('i1', T0)],
        review: { id: 'rv', kind: 'review', title: 'Review', goal: 'Recall shade', scope, originOsId: 'story-a',
            reward: { tier: 'short', amount: 17 }, materials: [], revealed: { answers: [], hints: [] }, assessments: [],
            exercises: [{ id: 'r1', skill: 'vocabulary', materialIds: [], prompt: 'Use shade.', hint: '', itemId: 'i1',
                response: { kind: 'text' }, rule: { kind: 'semantic' } }],
            attempts: ['a', 'b', 'c', 'd'].map((id, index) => ({ id, exerciseId: 'r1', scope,
                answer: { kind: 'text', text: 'Trees provide shade.' }, submittedAt: day(sameTime ? 0 : index), help: help({ feedback: index > 0 }) })) } };
}

function judgeReview(profile, attemptId, verdict, now, extra = {}) {
    return assessLearning(profile, { attemptId, verdict, understanding: '', expression: '', guidance: 'Reviewed.', ...extra }, {
        attemptId, review: true, inputScope: { kind: 'public' }, osId: 'story-a', createId: () => 'unused', now: () => now,
    }).profile;
}

for (const archived of [false, true]) {
    for (const verdict of ['correct', 'incorrect']) {
        test(`resolving an initially disputed answer ${verdict} follows an older schedule but preserves a newer one, ${archived ? 'archived' : 'current'}`, () => {
            const first = judgeReview(reviewHistory(), 'a', 'correct', T0);
            const disputed = judgeReview(first, 'b', 'disputed', day(1));
            assert.deepEqual(disputed.items[0].schedule, first.items[0].schedule);
            const available = structuredClone(disputed);
            if (archived) { available.review = null; }
            const resolved = judgeReview(available, 'b', verdict, day(2));
            const expected = verdict === 'correct'
                ? { ef: 2.46, repetitions: 2, intervalDays: 6, dueAt: day(8), lastAttemptId: 'b', lastQuality: 3 }
                : { ef: 2.6, repetitions: 0, intervalDays: 1, dueAt: day(3), lastAttemptId: 'b', lastQuality: 1 };
            assert.deepEqual(resolved.items[0].schedule, expected);
            assert.deepEqual(judgeReview(resolved, 'b', verdict, day(3)).items[0].schedule, expected);

            const newer = judgeReview(disputed, 'c', 'correct', day(2));
            const before = structuredClone(newer.items[0].schedule);
            if (archived) { newer.review = null; }
            const rejudged = judgeReview(newer, 'b', verdict, day(3));
            assert.equal(rejudged.items[0].evidence.find(entry => entry.attempt.id === 'b').assessment.verdict, verdict);
            assert.deepEqual(rejudged.items[0].schedule, before);
        });
    }
}

test('current answer order breaks timestamp ties without letting an older disputed answer overwrite a newer schedule', () => {
    const first = judgeReview(reviewHistory(true), 'a', 'correct', T0);
    const disputed = judgeReview(first, 'b', 'disputed', T0);
    const resolved = judgeReview(disputed, 'b', 'correct', day(1));
    assert.deepEqual(resolved.items[0].schedule, {
        ef: 2.46, repetitions: 2, intervalDays: 6, dueAt: day(7), lastAttemptId: 'b', lastQuality: 3,
    });
    const newer = judgeReview(disputed, 'c', 'correct', T0);
    assert.deepEqual(judgeReview(newer, 'b', 'incorrect', day(1)).items[0].schedule, newer.items[0].schedule);
});

test('a current scheduled answer still establishes order after its representative evidence is pruned', () => {
    let profile = judgeReview(reviewHistory(), 'a', 'correct', T0);
    for (const [index, id] of ['b', 'c', 'd'].entries()) { profile = judgeReview(profile, id, 'disputed', day(index + 1)); }
    assert.equal(profile.items[0].evidence.some(entry => entry.attempt.id === 'a'), false);
    assert.deepEqual(judgeReview(profile, 'd', 'correct', day(4)).items[0].schedule, {
        ef: 2.46, repetitions: 2, intervalDays: 6, dueAt: day(10), lastAttemptId: 'd', lastQuality: 3,
    });
});

test('rejudging archived evidence uses the prior schedule before a new item link prunes its source', () => {
    const history = reviewHistory();
    history.review.attempts[1].help = help();
    let profile = judgeReview(history, 'a', 'correct', T0);
    profile = judgeReview(profile, 'b', 'disputed', day(1));
    const [disputed, first] = profile.items[0].evidence;
    // Other practice keeps the old success as part of an independent pair; the disputed answer is retained elsewhere.
    const other = structuredClone(first);
    other.unitId = 'lesson';
    delete other.exercise.itemId;
    other.exercise.prompt = 'Find shade outdoors.';
    other.attempt.id = 'c'; other.attempt.submittedAt = day(2);
    other.assessment.attemptId = 'c'; other.assessment.verdict = 'partial';
    const latest = structuredClone(other);
    latest.attempt.id = 'd'; latest.attempt.submittedAt = day(3);
    latest.assessment.attemptId = 'd'; latest.assessment.verdict = 'correct';
    profile.items[0].evidence = [latest, first, other];
    profile.items.push(item('i2', T0, { evidence: [disputed] }));
    profile.review = null;
    const resolved = judgeReview(profile, 'b', 'correct', day(4), { items: [{ itemId: 'i1' }] });
    assert.equal(resolved.items[0].evidence.some(entry => entry.attempt.id === 'a'), false);
    assert.deepEqual(resolved.items[0].schedule, {
        ef: 2.7, repetitions: 2, intervalDays: 6, dueAt: day(10), lastAttemptId: 'b', lastQuality: 5,
    });
});

test('due selection is sorted, readable in this story, and at most twenty; the tier follows the count', () => {
    const items = [
        item('late', day(2)), item('first', day(-3)), item('private', day(-5), { scope: { kind: 'story', osId: 'story-b' } }),
        item('reading', day(-9), { skill: 'reading', schedule: undefined }), item('second', day(-1)), item('now', T0),
    ];
    delete items[3].schedule;
    assert.deepEqual(selectDueLearningItems({ items }, T0, 'story-a').map(entry => entry.id), ['first', 'second', 'now']);
    assert.deepEqual(selectDueLearningItems({ items }, T0).map(entry => entry.id), ['private', 'first', 'second', 'now']);
    const many = Array.from({ length: 25 }, (_, index) => item(`i${index}`, day(-index)));
    const due = selectDueLearningItems({ items: many }, T0);
    assert.equal(due.length, 20);
    assert.equal(due[0].id, 'i24');
    assert.deepEqual([1, 5, 6, 12, 13, 20].map(learningReviewTier), ['short', 'short', 'regular', 'regular', 'deep', 'deep']);
    assert.throws(() => learningReviewTier(0));
    assert.throws(() => learningReviewTier(21));
});

test('each schedule explains its next review in one line', () => {
    assert.equal(learningScheduleReason(newLearningSchedule(T0)), '还没有复习记录，从头开始');
    const reasons = [0, 1, 3, 4, 5].map(quality => learningScheduleReason(advanceLearningSchedule(newLearningSchedule(T0), quality, 'a', T0)));
    assert.deepEqual(reasons, ['上次没想起来，明天再复习', '上次没答对，明天再复习', '上次借助提示答对，1 天后复习', '上次答对但有犹豫，1 天后复习', '上次独立答对，1 天后复习']);
});
