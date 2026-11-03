import assert from 'node:assert/strict';
import test from 'node:test';
import { buildLearningContext } from '../apps/learning/agent/context.js';
import { readLearning } from '../apps/learning/agent/data-projection.js';
import { learningClassView } from '../apps/learning/application/projection.js';
import { defaultLearningProfile } from '../domains/learning/profile.js';

const snapshot = { player: { displayName: 'Learner', persona: '' }, characters: [], storyEvents: '', recentMessages: [], worldInfo: { before: '', after: '', depth: [] } };
const scope = { kind: 'public' };
function fixture() {
    const material = { id: 'm1', title: 'Trees', provenance: { kind: 'authored' }, transcriptRevealed: true,
        paragraphs: [{ id: 'p1', text: 'Trees cool streets.' }, { id: 'p2', text: 'Shade makes walking easier.' }] };
    const exercise = { id: 'e1', skill: 'reading', materialIds: ['m1'], prompt: 'What do trees change?',
        response: { kind: 'text' }, rule: { kind: 'exact', answer: { kind: 'text', text: 'The temperature.' }, explanation: 'An unrevealed answer explanation.' }, hint: 'An unrevealed hint.' };
    const unit = { id: 'u1', kind: 'lesson', title: 'Trees', goal: 'Read', scope, originOsId: 'story-a', reward: { tier: 'short', amount: 20 },
        materials: [material], exercises: [exercise], attempts: [], assessments: [], revealed: { answers: [], hints: [] },
        explanations: [{ materialId: 'm1', paragraphId: 'p1', explanation: 'Use cool as a verb.', terms: [{ text: 'cool', note: 'make cooler' }] }], modelEssay: null };
    const profile = { ...defaultLearningProfile('en'), level: 'A2', interests: 'cities', goal: { description: 'Write clearly', exam: 'IELTS', targetLevel: 'B2', targetDate: null },
        unit, review: null, items: [], completions: [] };
    return { profiles: [profile] };
}
function injected(data, action = { kind: 'companion', materialId: 'm1', paragraphId: 'p1' }, exerciseId) {
    const result = buildLearningContext({ actor: 'companion', data, language: 'en', osId: 'story-a', teacher: { name: 'Companion', note: '' },
        context: { snapshot, teacherDetails: '' }, action, exerciseId, message: '', asOf: '2026-09-01T08:00:00.000Z' });
    // This is the model-facing data envelope, not a source-code/string-presence test.
    return JSON.parse(result.messages[0].content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
}

test('workbench guidance is current companion request data, appears only while busy, and precedes the learner', () => {
    let busy = false;
    const message = 'Can we talk about my weekend?';
    for (const kind of ['talk', 'companion', 'task-result']) {
        const context = buildLearningContext({ actor: 'companion', data: fixture(), language: 'en', osId: 'story-a',
            teacher: { name: 'Companion', note: '' }, context: { snapshot, teacherDetails: '' }, action: { kind }, message,
            workbench: () => ({ busy, tasks: [] }) });
        const prefix = structuredClone(context.prefix); const turn = structuredClone(context.turn);
        const requests = [false, true, false].map(value => {
            busy = value;
            const messages = context.messages;
            assert.equal(messages.length, 1); assert.equal(messages[0].role, 'user');
            const [dataText, learnerText] = messages[0].content.split('</learning_request>');
            const data = JSON.parse(dataText.split('<learning_request>\n')[1]);
            assert.equal(data.workbench.busy, busy);
            assert.equal(Object.hasOwn(data.workbench, 'notice'), busy);
            if (busy) { assert.equal(typeof data.workbench.notice, 'string'); assert.ok(data.workbench.notice.length); }
            if (kind === 'talk') { assert.ok(learnerText.endsWith(message)); }
            assert.deepEqual(context.prefix, prefix); assert.deepEqual(context.turn, turn);
            return messages;
        });
        assert.deepEqual(requests[0], requests[2]);
    }
});

test('conversation and unprompted reading always receive the complete workbench material and actual settings', () => {
    const data = fixture();
    for (const kind of ['companion', 'talk']) {
        const request = injected(data, { kind, materialId: 'm1', paragraphId: 'p1' });
        const ui = learningClassView(data, 'en', 'story-a');
        assert.deepEqual(request.training.materials, ui.unit.materials);
        assert.deepEqual(request.training.exercises, ui.unit.exercises);
        assert.deepEqual(request.training.explanations, ui.unit.explanations);
        assert.equal(request.training.materials[0].paragraphs.length, 2);
        assert.equal(request.profile.profile.level, 'A2');
        assert.equal(request.profile.profile.goal.targetLevel, 'B2');
        assert.equal(request.profile.profile.interests, 'cities');
        assert.deepEqual(readLearning(data, 'en', 'story-a', { section: 'training' }).data, request.training);
    }
});

test('the focused paragraph is an anchor and does not duplicate or replace the whole article', () => {
    const data = fixture();
    // Long representative material is retained, never silently changed to a summary or a first-page view.
    data.profiles[0].unit.materials[0].paragraphs[1].text = 'A longer paragraph. '.repeat(250);
    const request = injected(data);
    assert.deepEqual(request.focus, { unitId: 'u1', materialId: 'm1', paragraphId: 'p1' });
    assert.deepEqual(request.training.materials[0].paragraphs, data.profiles[0].unit.materials[0].paragraphs);
});

test('public context and reads cannot reveal answer keys, hints, or hidden listening text', () => {
    const data = fixture();
    const unit = data.profiles[0].unit;
    unit.exercises[0].skill = 'listening';
    unit.materials[0].transcriptRevealed = false;
    const request = injected(data);
    assert.deepEqual(request.training.materials[0].paragraphs, []);
    assert.deepEqual(request.training.explanations, []);
    assert.equal(request.training.exercises[0].solution, null);
    assert.equal(request.training.exercises[0].hint, null);
    assert.equal(Object.hasOwn(request.training.exercises[0], 'rule'), false);
    const read = section => readLearning(data, 'en', 'story-a', { section }, undefined, 'public').data;
    assert.deepEqual(read('materials'), []);
    assert.deepEqual(read('unit').materials[0].paragraphs, []);
    assert.equal(Object.hasOwn(read('exercises')[0], 'rule'), false);
    // An explicit, saved reveal is reflected in every consumer of the same projection.
    unit.materials[0].transcriptRevealed = true;
    unit.revealed.answers.push('e1'); unit.revealed.hints.push('e1');
    assert.deepEqual(injected(data).training.exercises[0].solution, unit.exercises[0].rule);
    assert.equal(read('exercises')[0].hint, unit.exercises[0].hint);
    assert.equal(read('materials').length, 2);
});

test('no lesson and another story both provide an empty training surface rather than invented material', () => {
    const data = fixture();
    data.profiles[0].unit.scope = { kind: 'story', osId: 'another-story' };
    assert.equal(injected(data).training, null);
    assert.equal(injected(data).focus, null);
    data.profiles[0].unit = null;
    assert.equal(injected(data, { kind: 'talk' }).training, null);
});

const savedAnswer = (id = 'a1') => ({ id, exerciseId: 'e1', answer: { kind: 'text', text: 'Trees cool streets.' },
    scope, submittedAt: '2026-09-01T08:00:00.000Z', help: { answer: false, hint: false, feedback: false, transcript: false, replays: 0, slowPlayback: false } });

test('review questions and follow-up conversation share the selected review, saved answer and public feedback', () => {
    const data = fixture(); const profile = data.profiles[0];
    profile.review = { ...structuredClone(profile.unit), id: 'review-1', kind: 'review', title: 'Recall',
        attempts: [savedAnswer()], assessments: [{ attemptId: 'a1', verdict: 'incorrect', understanding: '', expression: '', guidance: 'Use the past tense.', scope }] };
    for (const kind of ['talk']) {
        const request = injected(data, { kind, unitId: profile.review.id }, 'e1');
        assert.equal(request.training.id, profile.review.id);
        assert.equal(request.training.kind, 'review');
        assert.equal(request.focus.exercise.id, 'e1');
        assert.deepEqual(request.focus.attempt.answer, savedAnswer().answer);
        assert.equal(request.focus.assessment.verdict, 'incorrect');
        assert.equal(request.focus.assessment.guidance, profile.review.assessments[0].guidance);
        assert.equal(request.focus.exercise.solution, null);
        assert.equal(Object.hasOwn(request.focus.exercise, 'rule'), false);
    }
    profile.review.scope = { kind: 'story', osId: 'another-story' };
    assert.throws(() => injected(data, { kind: 'talk', unitId: 'review-1' }, 'e1'));
    profile.review = null;
    assert.throws(() => injected(data, { kind: 'talk', unitId: 'review-1' }, 'e1'));
    assert.equal(injected(data, { kind: 'talk', unitId: 'u1' }).training.id, 'u1');
});

test('summary feedback receives a public question and a paragraph anchor, without hidden hints or duplicated material', () => {
    const data = fixture(); const unit = data.profiles[0].unit;
    unit.exercises[0].paragraphId = 'p1'; unit.attempts.push(savedAnswer());
    const request = injected(data, { kind: 'summary-review', attemptId: 'a1' });
    assert.deepEqual(request.focus.exercise, request.training.exercises[0]);
    assert.equal(request.focus.materialId, 'm1'); assert.equal(request.focus.paragraphId, 'p1');
    assert.equal(request.focus.materials, undefined); assert.equal(request.focus.explanation, undefined);
    assert.equal(request.focus.exercise.hint, null); assert.equal(request.focus.exercise.solution, null);
    assert.equal(request.focus.attempt.answer.text, 'Trees cool streets.');
});

test('assessment supplies withheld or archived source content exactly once, preserving a changed archived version', () => {
    const data = fixture(); const unit = data.profiles[0].unit;
    unit.attempts.push(savedAnswer());
    const action = { kind: 'assess', attemptId: 'a1', review: true };
    assert.deepEqual(injected(data, action).focus.materials, []);
    unit.exercises[0].skill = 'listening'; unit.materials[0].transcriptRevealed = false;
    const hidden = injected(data, action);
    assert.deepEqual(hidden.training.materials[0].paragraphs, []);
    assert.deepEqual(hidden.focus.materials, unit.materials);
    const archived = structuredClone(unit.materials[0]); archived.paragraphs[0].text = 'Earlier source content.';
    data.profiles[0].items = [{ id: 'i1', skill: 'reading', scope, label: 'Main idea', evidence: [{ unitId: 'old-unit', scope,
        materials: [archived], exercise: structuredClone(unit.exercises[0]), attempt: unit.attempts.pop(),
        assessment: { attemptId: 'a1', verdict: 'correct', understanding: '', expression: '', guidance: '', scope } }] }];
    unit.materials[0].transcriptRevealed = true;
    const historical = injected(data, action);
    assert.equal(historical.focus.unitId, 'old-unit');
    assert.deepEqual(historical.focus.materials, [archived]);
    assert.notDeepEqual(historical.training.materials[0].paragraphs, archived.paragraphs);
});
