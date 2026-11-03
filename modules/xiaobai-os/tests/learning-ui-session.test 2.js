import assert from 'node:assert/strict';
import test from 'node:test';
import { computed } from 'vue';
import { createLearningUiSession, hasLearningUnsavedInput, learningContextNeedsConfirmation, learningSettingsInput } from '../apps/learning/ui/learning-session.js';
import { createLearningAnswerDraft } from '../apps/learning/ui/answer-draft.js';
import { createLearningCompanionScheduler } from '../apps/learning/application/companion.js';

const stateWith = (unit, turns = []) => ({ unit, review: null, conversation: { turns, removedTurns: 0 } });
test('identity changes ask before discarding work, but navigation and saving the selected teacher do not', () => {
    const session = createLearningUiSession();
    const unit = { id: 'article', exercises: [], attempts: [], assessments: [], stage: { stage: 'writing' } };
    const state = { ...stateWith(unit), language: 'en', teacher: { name: 'Companion', note: '' } };
    session.unit('article').writing.essay = { text: 'My unfinished essay.', submitted: null, rewriting: false };
    assert.equal(learningContextNeedsConfirmation(session, state, 'language', { language: 'ja' }), true);
    assert.equal(learningContextNeedsConfirmation(session, state, 'language', { language: 'en' }), false);
    assert.equal(learningContextNeedsConfirmation(session, state, 'teacher', { teacher: { name: 'Another', note: '' } }), false);
    session.chat.text = 'An unsent thought.';
    assert.equal(learningContextNeedsConfirmation(session, state, 'teacher', { teacher: { name: 'Another', note: '' } }), true);
    assert.equal(learningContextNeedsConfirmation(session, state, 'records', {}), false);
    // The course belongs to the language, not to its companion. Resolving a teacher save keeps current work.
    session.reset(true, true);
    assert.equal(session.unit('article').writing.essay.text, 'My unfinished essay.');
    session.reset();
    Object.assign(session.setup, { step: 1, name: 'Another', note: 'Manual selection' });
    assert.equal(learningContextNeedsConfirmation(session, state, 'teacher', { teacher: { name: 'Another', note: 'Manual selection' } }), false);
});
test('a review first opened from another page reacts to an answer without remounting', () => {
    const session = createLearningUiSession();
    const local = computed(() => session.unit('new-review').review);
    local.value.drafts.q1 = { value: createLearningAnswerDraft({ kind: 'choice', options: [{ id: 'a', text: 'A' }], multiple: false }), retry: false };
    const ready = computed(() => local.value.drafts.q1.value.picked.length > 0);
    assert.equal(ready.value, false);
    local.value.drafts.q1.value.picked.push('a');
    assert.equal(ready.value, true);
    assert.deepEqual(session.unit('new-review').review.drafts.q1.value.picked, ['a']);
});

test('review re-answer input survives failed saves and navigation, then retires after its saved attempt', () => {
    const session = createLearningUiSession();
    const exercise = { id: 'q1', response: { kind: 'choice', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], multiple: false } };
    const review = { id: 'review', exercises: [exercise], attempts: [{ id: 'old', exerciseId: exercise.id }], assessments: [], stage: { stage: 'complete' } };
    const state = { ...stateWith(null), review };
    const local = session.unit(review.id).review;
    local.drafts.q1 = { value: createLearningAnswerDraft(exercise.response), retry: true, submitted: { before: 'old' } };
    local.drafts.q1.value.picked.push('b');
    assert.equal(hasLearningUnsavedInput(session, state), true);
    session.reconcile(state);
    assert.deepEqual(session.unit(review.id).review.drafts.q1.value.picked, ['b']);
    review.attempts.push({ id: 'new', exerciseId: exercise.id });
    session.reconcile(state);
    assert.equal(local.drafts.q1, undefined);
    assert.equal(hasLearningUnsavedInput(session, state), false);
});
test('hidden writing keeps new input when an earlier submission is acknowledged, and retires only the saved draft', () => {
    const session = createLearningUiSession();
    const writing = session.unit('article').writing;
    writing.summary = { text: 'A new thought, typed while saving.', rewriting: false, submitted: { before: undefined, text: 'The submitted summary.' } };
    const unit = { id: 'article', attempts: [{ id: 'a1', exerciseId: 'summary', answer: { kind: 'text', text: 'The submitted summary.' } }] };
    session.reconcile(stateWith(unit));
    assert.equal(writing.summary.text, 'A new thought, typed while saving.');
    assert.equal(writing.summary.rewriting, true);
    assert.equal(writing.summary.submitted, null);
    writing.essay = { text: 'My essay.', rewriting: true, submitted: { before: 'old', text: 'My essay.' } };
    unit.attempts.push({ id: 'a2', exerciseId: 'essay', answer: { kind: 'text', text: 'My essay.' } });
    session.reconcile(stateWith(unit));
    assert.equal(writing.essay.text, '');
    assert.equal(writing.essay.rewriting, false);
    session.unit('article').edits.note = { value: 'An unfinished revision.', done: false };
    session.unit('article').expanded.knowledge = true;
    session.reconcile(stateWith(unit));
    assert.equal(session.unit('article').edits.note.value, 'An unfinished revision.');
    assert.equal(session.unit('article').expanded.knowledge, true);
    session.reconcile(stateWith(null));
    assert.deepEqual(Object.keys(session.units), []);
});

test('conversation acknowledgement finds its own turn even when the workbench appended another turn', () => {
    const session = createLearningUiSession();
    Object.assign(session.chat, { text: 'An unsent follow-up.', focus: { exerciseId: 'q1' }, scroll: 340, following: false,
        sent: { text: 'Explain this.', user: 'Explain this.\n\nQuoted passage.', after: 0 } });
    session.reconcile(stateWith(null, [{ purpose: 'talk', user: 'Explain this.\n\nQuoted passage.' }, { purpose: 'prepare', user: 'Prepare.' }]));
    assert.equal(session.chat.sent, null);
    assert.equal(session.chat.text, 'An unsent follow-up.');
    assert.deepEqual([session.chat.scroll, session.chat.following], [340, false]);
    session.reset();
    assert.equal(session.chat.text, '');
    assert.equal(session.chat.focus, null);
});

test('reading references survive an unmounted reader but are invalidated by a changed passage', () => {
    const session = createLearningUiSession();
    const unit = { id: 'article', materials: [{ id: 'm1', paragraphs: [{ id: 'p1', text: 'A tree gives shade.' }] }], attempts: [] };
    const reference = { materialId: 'm1', paragraphId: 'p1', start: 7, end: 12, quote: 'gives' };
    session.unit(unit.id).selection = reference;
    session.reconcile(stateWith(unit));
    assert.deepEqual(session.unit(unit.id).selection, reference);
    unit.materials[0].paragraphs[0].text = 'A tree needs water.';
    session.reconcile(stateWith(unit));
    assert.equal(session.unit(unit.id).selection, null);
});

test('settings remain editable after a failed save and do not close over newer edits', () => {
    const session = createLearningUiSession();
    const settings = session.settings;
    settings.open = true;
    settings.form.exam = ' IELTS ';
    const value = learningSettingsInput(settings.form);
    settings.submitted = { value, form: { ...settings.form } };
    session.reconcile({ ...stateWith(null), storage: 'unconfirmed', busy: false, profile: { settings: value } });
    assert.equal(settings.open, true);
    assert.ok(settings.submitted);
    settings.form.interests = 'Science';
    session.reconcile({ ...stateWith(null), storage: 'ready', busy: false, profile: { settings: value } });
    assert.equal(settings.open, true);
    assert.equal(settings.form.interests, 'Science');
    assert.equal(settings.submitted, null);
    settings.submitted = { value: learningSettingsInput(settings.form), form: { ...settings.form } };
    session.reconcile({ ...stateWith(null), storage: 'ready', busy: false, profile: { settings: learningSettingsInput(settings.form) } });
    assert.equal(settings.open, false);
});

test('an activity submitted before unmount is retired by its confirmed answer, not by closing the view', () => {
    const session = createLearningUiSession();
    const unit = { id: 'lesson', attempts: [] };
    const local = session.unit(unit.id);
    local.activityDrafts.q1 = { response: 'text', value: { text: 'My answer.', picked: [], values: {}, order: [] }, submitted: { before: undefined } };
    session.reconcile(stateWith(unit));
    assert.equal(local.activityDrafts.q1.value.text, 'My answer.');
    unit.attempts.push({ id: 'a1', exerciseId: 'q1', answer: { kind: 'text', text: 'My answer.' } });
    session.reconcile(stateWith(unit));
    assert.equal(local.activityDrafts.q1, undefined);
});

test('leaving warns for unsaved input, not untouched sorting cards or already saved review answers', () => {
    const session = createLearningUiSession();
    const exercise = { id: 'q1', response: { kind: 'order', options: [{ id: 'a', text: 'first' }, { id: 'b', text: 'second' }] } };
    const unit = { id: 'review', exercises: [exercise], attempts: [], assessments: [], stage: { stage: 'answering' } };
    const local = session.unit(unit.id);
    local.review.drafts.q1 = { value: createLearningAnswerDraft(exercise.response), retry: false };
    assert.equal(hasLearningUnsavedInput(session, stateWith(unit)), false);
    local.review.drafts.q1.value.order.reverse();
    assert.equal(hasLearningUnsavedInput(session, stateWith(unit)), true);
    unit.attempts.push({ exerciseId: 'q1' });
    assert.equal(hasLearningUnsavedInput(session, stateWith(unit)), false);
    session.chat.text = 'An unsent thought.';
    assert.equal(hasLearningUnsavedInput(session, stateWith(unit)), true);
    session.reset();
    assert.equal(hasLearningUnsavedInput(session, stateWith(unit)), false);
});

test('companion opportunities keep one timer, do not reset for continued reading and never catch up after interruption', () => {
    let next = 0;
    const timers = new Map();
    const elapsed = [];
    let spoke = 0;
    const scheduler = createLearningCompanionScheduler({
        setTimer: (callback, delay) => { elapsed.push(delay); timers.set(++next, callback); return next; },
        clearTimer: id => timers.delete(id), random: () => 0.5, opportunity: () => { spoke++; },
    });
    scheduler.update(true);
    for (let scroll = 0; scroll < 50; scroll++) { scheduler.update(true); }
    assert.equal(timers.size, 1);
    assert.equal(elapsed.length, 1);
    const expired = [...timers.values()][0];
    scheduler.update(false);
    assert.equal(timers.size, 0);
    expired(); // Even an already-dispatched callback cannot speak after backgrounding.
    assert.equal(spoke, 0);
    scheduler.update(true);
    expired();
    assert.equal(spoke, 0);
    assert.equal(timers.size, 1);
    const [id, fire] = [...timers.entries()][0]; timers.delete(id); fire();
    assert.equal(spoke, 1);
    assert.equal(timers.size, 1);
    assert.equal(elapsed.every(delay => delay === 450000), true);
    scheduler.dispose();
    assert.equal(timers.size, 0);
});
