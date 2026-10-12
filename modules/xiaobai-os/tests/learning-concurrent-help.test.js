import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture } from './fixtures/learning-classroom.js';
import { exposeLearningContent } from '../domains/learning/exposure.js';

test('saving an assessment after conversational help preserves both facts and the original answer conditions', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.openLesson();
    const baseline = h.repository.snapshot().document;
    const profile = baseline.data.profiles[0];
    const exerciseId = profile.unit.exercises[0].id;
    const help = structuredClone(baseline.data);
    exposeLearningContent(help.profiles[0], 'hints', exerciseId);
    assert.equal((await h.repository.save(baseline, help, () => true)).status, 'confirmed');
    const assessed = structuredClone(baseline.data);
    assessed.profiles[0].unit.attempts.push({ id: 'answer-before-help', exerciseId,
        answer: { kind: 'choice', ids: ['a'] }, submittedAt: '2026-09-30T08:00:00.000Z', scope: profile.unit.scope,
        help: { answer: false, hint: false, feedback: false, transcript: false, replays: 0, slowPlayback: false } });
    assessed.profiles[0].unit.assessments.push({ attemptId: 'answer-before-help', verdict: 'correct', understanding: 'Correct meaning', expression: '', guidance: 'Explain your reason next time.', scope: profile.unit.scope });
    const result = await h.repository.save(baseline, assessed, () => true);
    assert.equal(result.status, 'confirmed');
    assert.deepEqual(h.profile().unit.revealed.hints, [exerciseId]);
    assert.equal(h.profile().unit.assessments.length, 1);
    assert.equal(h.profile().unit.attempts[0].help.hint, false);
});

test('unrelated concurrent edits are not silently merged, and a pending help save still blocks writes', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.openLesson();
    const baseline = h.repository.snapshot().document;
    const changed = structuredClone(baseline.data);
    changed.profiles[0].goal.description = 'A genuinely different goal';
    assert.equal((await h.repository.save(baseline, changed, () => true)).status, 'confirmed');
    const stale = structuredClone(baseline.data);
    stale.profiles[0].unit.notes = [{ id: 'n1', text: 'A note', exerciseId: stale.profiles[0].unit.exercises[0].id, selection: null }];
    assert.equal((await h.repository.save(baseline, stale, () => true)).status, 'cancelled');
    assert.equal(h.profile().goal.description, changed.profiles[0].goal.description);
    const fresh = h.repository.snapshot().document;
    const help = structuredClone(fresh.data);
    exposeLearningContent(help.profiles[0], 'hints', help.profiles[0].unit.exercises[0].id);
    h.flags.userFailure = true;
    assert.equal((await h.repository.save(fresh, help, () => true)).status, 'unconfirmed');
    await assert.rejects(h.repository.save(fresh, fresh.data, () => true), error => error.code === 'learning_resolve_pending_first');
});

test('two distinct help writes from one snapshot both survive the serialized save boundary', async t => {
    const h = await createClassroomFixture({ listening: true }); t.after(h.dispose);
    await h.openLesson();
    const baseline = h.repository.snapshot().document;
    const hint = structuredClone(baseline.data);
    const transcript = structuredClone(baseline.data);
    exposeLearningContent(hint.profiles[0], 'hints', hint.profiles[0].unit.exercises[0].id);
    exposeLearningContent(transcript.profiles[0], 'transcripts', transcript.profiles[0].unit.materials[0].id);
    const results = await Promise.all([h.repository.save(baseline, hint, () => true), h.repository.save(baseline, transcript, () => true)]);
    assert.deepEqual(results.map(result => result.status), ['confirmed', 'confirmed']);
    assert.equal(h.profile().unit.materials[0].transcriptRevealed, true);
    assert.equal(h.profile().unit.revealed.hints.length, 1);
});

test('help for a reused question ID never attaches to a replaced passage in either save order', async t => {
    for (const helpFirst of [true, false]) {
        await t.test(helpFirst ? 'help saved first' : 'new passage saved first', async sub => {
            const h = await createClassroomFixture(); sub.after(h.dispose); await h.openLesson();
            const baseline = h.repository.snapshot().document;
            const unit = baseline.data.profiles[0].unit;
            const helped = structuredClone(baseline.data);
            exposeLearningContent(helped.profiles[0], 'hints', unit.exercises[0].id);
            const changed = structuredClone(baseline.data);
            changed.profiles[0].unit.materials[0].paragraphs[0].text = 'The train leaves at seven.';
            if (helpFirst) {
                assert.equal((await h.repository.save(baseline, helped, () => true)).status, 'confirmed');
                assert.equal((await h.repository.save(baseline, changed, () => true)).status, 'confirmed');
            } else {
                assert.equal((await h.repository.save(baseline, changed, () => true)).status, 'confirmed');
                assert.equal((await h.repository.save(baseline, helped, () => true)).status, 'cancelled');
            }
            assert.deepEqual(h.profile().unit.revealed.hints, []);
        });
    }
});
