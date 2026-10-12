import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture } from './fixtures/learning-classroom.js';
import { prepareRetainedLearningWork } from './fixtures/learning-retained-work.js';

for (const retire of [false, true]) {
    test(`public evidence can be reviewed and deleted after its course becomes private (retired: ${retire})`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose);
        const { evidence, itemId, completions, privateUnit } = await prepareRetainedLearningWork(h, { retire });
        assert.equal(privateUnit.scope.kind, 'story');
        assert.equal(h.state().blockedUnit, !retire);
        assert.deepEqual(h.state().record.evidence[0].actions, { review: true, remove: true });
        const before = h.requests.length;
        await h.command('assess', { attemptId: evidence.attempt.id, review: true, message: 'Review this saved public answer.' });
        assert.ok(h.requests.length > before);
        const request = h.requests[before];
        const input = JSON.parse(request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>'))
            .content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
        assert.equal(input.training, null);
        assert.deepEqual(input.focus.materials, evidence.materials);
        assert.deepEqual(input.focus.exercise, evidence.exercise);
        assert.deepEqual(input.focus.attempt.answer, evidence.attempt.answer);
        assert.equal(input.focus.assessment.verdict, 'disputed');
        assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
        assert.deepEqual(h.state().reply.scope, { kind: 'public' });
        assert.equal(h.state().reply.unitId, evidence.unitId);
        const saved = h.profile().items.find(item => item.id === itemId).evidence[0];
        assert.equal(saved.assessment.verdict, 'partial');
        assert.deepEqual(saved.scope, evidence.scope);
        assert.deepEqual(saved.materials, evidence.materials);
        assert.deepEqual(h.profile().completions, completions);
        if (!retire) {
            assert.deepEqual(h.profile().unit.materials, privateUnit.materials);
            assert.deepEqual(h.profile().unit.scope, privateUnit.scope);
            assert.deepEqual(h.profile().unit.assessments.find(entry => entry.attemptId === evidence.attempt.id), saved.assessment);
        }
        await h.reenter();
        await h.command('records', { id: itemId });
        assert.deepEqual(h.state().record.evidence[0].actions, { review: true, remove: true });
        await h.command('delete-attempt', { id: evidence.attempt.id });
        assert.equal(h.profile().unit?.attempts.some(entry => entry.id === evidence.attempt.id) ?? false, false);
        assert.equal(h.profile().items.flatMap(item => item.evidence).some(entry => entry.attempt.id === evidence.attempt.id), false);
        assert.deepEqual(h.profile().completions, completions);
    });
}

test('a failed retained-evidence review retries without acquiring its hidden course scope', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose);
    const { evidence, completions } = await prepareRetainedLearningWork(h);
    h.flags.providerFailure = true;
    await h.command('assess', { attemptId: evidence.attempt.id, review: true, message: 'Review this answer.' });
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'failed');
    assert.equal(h.profile().items[0].evidence[0].assessment.verdict, 'disputed');
    assert.deepEqual(h.profile().items[0].evidence[0].scope, { kind: 'public' });
    h.flags.providerFailure = false;
    await h.command('assess', { attemptId: evidence.attempt.id, review: true, message: 'Retry this review.' });
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
    assert.deepEqual(h.state().reply.scope, { kind: 'public' });
    assert.equal(h.profile().items[0].evidence[0].assessment.verdict, 'partial');
    assert.deepEqual(h.profile().completions, completions);
});
