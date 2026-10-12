import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { learningReplyNote } from '../apps/learning/application/reply-note.js';

const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });

for (const kind of ['lesson', 'reading-writing']) {
    test(`a saved ${kind} answer supplies the reply target for narration and notes`, async t => {
        const spoken = [];
        const facade = { isEnabled: () => true, getVoices: () => ({ defaultVoice: 'fixture', voices: [{ id: 'fixture', available: true }] }),
            createPlayer: () => ({ activate: () => true, playNow: () => true, dispose() {}, setPlaybackRate: value => value }),
            synthesize: async text => { spoken.push(text); return new Blob(['fixture']); }, openSettings() {} };
        const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind }, getTtsFacade: () => facade });
        t.after(h.dispose); await h.openLesson();
        if (kind === 'reading-writing') { await h.command('choose-original'); }
        const unit = h.profile().unit; const exercise = unit.exercises[0];
        await h.command('submit', { unitId: unit.id, exerciseId: exercise.id,
            answer: kind === 'lesson' ? { kind: 'choice', ids: ['a'] } : { kind: 'text', text: 'Trees cool streets.' } });
        const reply = h.state().reply;
        assert.equal(reply.action, kind === 'lesson' ? 'assess' : 'summary-review');
        assert.equal(reply.id, h.state().workbenchConversation.turns.at(-1).id);
        assert.equal(reply.unitId, unit.id); assert.equal(reply.exerciseId, exercise.id);
        await h.command('say-reply', { target: 'workbench', id: reply.id });
        assert.deepEqual(spoken, [reply.text]);
        await h.command('save-note', { target: 'workbench', id: reply.id, unitId: unit.id });
        assert.deepEqual(h.profile().unit.notes.map(note => [note.exerciseId, note.text]), [[exercise.id, reply.text]]);
        assert.equal((await h.reenter()).unit.notes[0].exerciseId, exercise.id);
    });
}

test('identical replies keep their own message targets through chat retry and a newer answer', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, exercises: [fixtureLesson.exercises[0], { ...fixtureLesson.exercises[0], key: 'q2' }] } });
    t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const [first, second] = unit.exercises;
    const selection = { materialId: unit.materials[0].id, paragraphId: unit.materials[0].paragraphs[0].id,
        start: 0, end: 6, quote: unit.materials[0].paragraphs[0].text.slice(0, 6) };
    h.flags.providerFailure = true;
    await h.command('talk', { target: 'workbench', unitId: unit.id, exerciseId: first.id, selection, message: 'Explain this part.' });
    const failed = h.state().workbenchConversation.turns.at(-1);
    h.flags.providerFailure = false;
    h.flags.teacherResponse = () => ({ text: 'The explanation.' });
    await h.command('retry-chat', { target: 'workbench', id: failed.id });
    const firstReply = h.state().reply;
    assert.equal(firstReply.id, failed.id); assert.equal(firstReply.exerciseId, first.id); assert.deepEqual(firstReply.selection, selection);
    await h.command('submit', { unitId: unit.id, exerciseId: second.id, answer: { kind: 'choice', ids: ['a'] } });
    const secondReply = h.state().reply;
    assert.equal(secondReply.exerciseId, second.id); assert.notEqual(firstReply.id, secondReply.id);
    assert.equal(firstReply.text, secondReply.text);
    await h.command('save-note', { target: 'workbench', id: firstReply.id, unitId: unit.id });
    assert.equal(learningReplyNote(h.state().unit, secondReply).saved, false);
    await h.command('save-note', { target: 'workbench', id: secondReply.id, unitId: unit.id });
    assert.equal(learningReplyNote(h.state().unit, secondReply).saved, true);
    assert.deepEqual(h.profile().unit.notes.map(note => [note.exerciseId, note.selection]), [[first.id, selection], [second.id, null]]);
});

for (const hiddenReplacement of [false, true]) {
test(`a retained-answer review keeps its archived location (hidden replacement: ${hiddenReplacement})`, async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const old = h.profile().unit;
    await h.command('submit', { unitId: old.id, exerciseId: old.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    const attempt = h.profile().unit.attempts[0];
    await h.command('prepare', { message: 'Begin another lesson.' });
    const replacement = h.profile().unit; assert.notEqual(replacement.id, old.id);
    if (hiddenReplacement) {
        const document = h.repository.snapshot().document; const data = structuredClone(document.data);
        data.profiles[0].unit.scope = { kind: 'story', osId: 'another-story' };
        await h.repository.save(document, data, () => true);
    }
    let focused;
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) {
            const input = JSON.parse(request.messages.findLast(entry => entry.role === 'user').content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
            focused = input.focus;
            return { toolCalls: [call('LearningAssess', { attemptId: attempt.id, review: true, verdict: 'correct',
                understanding: 'Clear.', expression: '', guidance: 'Read the contrast.' })] };
        }
        return { text: 'Archived answer reviewed.' };
    };
    await h.command('assess', { attemptId: attempt.id, review: true, message: 'Review my earlier answer.' });
    const reply = h.state().reply;
    assert.equal(focused.attempt.id, attempt.id);
    assert.equal(reply.unitId, old.id); assert.equal(reply.exerciseId, attempt.exerciseId);
    assert.equal(learningReplyNote(h.state().unit, reply), null);
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
    const writes = h.counts.userWrites;
    await h.command('save-note', { target: 'workbench', id: reply.id, unitId: replacement.id });
    assert.equal(h.counts.userWrites, writes); assert.deepEqual(h.profile().unit.notes ?? [], []);
});
}
