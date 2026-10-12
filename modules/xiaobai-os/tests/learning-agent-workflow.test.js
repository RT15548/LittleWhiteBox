import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { createLearningService } from '../apps/learning/application/service.js';
import { readLearning } from '../apps/learning/agent/data-projection.js';
import { createLearningReading } from '../apps/learning/agent/reading.js';
import { buildLearningContext } from '../apps/learning/agent/context.js';
import { createLearningUiSession, hasLearningUnsavedInput } from '../apps/learning/ui/learning-session.js';
import { newLearningSchedule } from '../domains/learning/schedule.js';

const call = (name, args = name === 'LearningRequest' ? { task: 'Carry out the learner request, preserving its selected question and original answer.' } : {}) => ({ id: name, name, arguments: JSON.stringify(args) });
const textLesson = () => {
    const lesson = structuredClone(fixtureLesson);
    lesson.exercises[0].response = { kind: 'text' }; lesson.exercises[0].rule = { kind: 'semantic' };
    return lesson;
};
const results = request => request.messages.filter(message => message.role === 'tool').map(message => ({ name: message.toolName, ...JSON.parse(message.content) }));
const send = (h, name, input = {}) => h.bridge.request(`learning/${name}`, { chatIdentity: h.state().chatIdentity, ...input });
async function saveAnswer(h) {
    const unit = h.profile().unit;
    await createLearningService(h.repository).prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: unit.exercises[0].id,
        answer: { kind: 'choice', ids: ['a'] }, scope: unit.scope, osId: unit.originOsId, replays: 0, slowPlayback: false }).save(() => true);
    return h.profile().unit.attempts.at(-1);
}
async function until(check) {
    const deadline = Date.now() + 3000;
    while (!check()) { assert.ok(Date.now() < deadline, 'Expected workflow state'); await setImmediate(); }
}

test('companion delegates a complete compound request and receives a separate workbench result', async t => {
    const h = await createClassroomFixture({ agentConfig: { tavilyApiKey: 'fixture-no-network' } }); t.after(h.dispose); await h.openLesson();
    const before = structuredClone(h.profile().unit);
    const message = '把我的水平改成B2，目标日期设到明年六月一日。本课再加一道写作题，不换课。';
    let handedBack;
    h.flags.teacherResponse = (request, round) => {
        const companion = request.tools.some(tool => tool.function.name === 'LearningRequest');
        if (companion) {
            if (round === 1) { return { toolCalls: [call('LearningRequest')] }; }
            handedBack = results(request).at(-1);
            return { text: '已经加好了。' };
        }
        assert.ok(request.messages.some(entry => entry.content.includes(message)));
        assert.ok(request.tools.some(tool => tool.function.name === 'LearningSearch'));
        if (round === 1) { return { toolCalls: [call('LearningProfileEdit', { level: 'B2', goal: { targetDate: '2027-06-01' } }),
            call('LearningLessonEdit', { exercises: [{ key: 'extra', skill: 'writing', materialKeys: [], prompt: 'Explain your own view.', response: { kind: 'text' }, rule: { kind: 'semantic' } }] })] }; }
        return { text: '设置已保存，本课已加一道写作题。' };
    };
    await h.command('talk', { message });
    assert.equal(h.profile().level, 'B2'); assert.equal(h.profile().goal.targetDate, '2027-06-01');
    assert.equal(h.profile().unit.id, before.id); assert.equal(h.profile().unit.exercises.length, before.exercises.length + 1);
    assert.equal(h.state().approval, null); assert.equal(handedBack.status, 'accepted');
    assert.equal(h.state().delegatedTasks[0].result.changed, true);
    assert.equal(h.state().delegatedTasks[0].notification, 'delivered');
    assert.deepEqual(h.profile().unit.reward, before.reward);
});

for (const approved of [true, false]) {
    test(`replacement decision resumes the waiting tool and permits follow-up work (${approved})`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const old = structuredClone(h.profile().unit); let receipt;
        const announcement = 'Replacement from this tool batch';
        h.flags.teacherResponse = (request, round) => {
            if (round === 1) { return { text: announcement, toolCalls: [call('LearningLessonEdit', { ...fixtureLesson, title: 'Another lesson', newLesson: true })] }; }
            if (round === 2) {
                receipt = results(request).at(-1);
                return { toolCalls: [call('LearningProfileEdit', { interests: 'nature' })] };
            }
            return { text: '按你的选择继续处理了。' };
        };
        await send(h, 'talk', { target: 'workbench', message: '换课，然后把兴趣设为自然。' });
        await until(() => h.state().approval);
        const approval = h.state().approval;
        assert.deepEqual(h.profile().unit, old);
        await send(h, 'approve-operation', { id: 'wrong-id', approved: true });
        assert.equal(h.state().approval.id, approval.id);
        await send(h, 'approve-operation', { id: approval.id, approved });
        await until(() => !h.state().workbenchBusy);
        assert.equal(h.profile().unit.id !== old.id, approved);
        assert.equal(receipt.status, approved ? 'confirmed' : 'declined');
        assert.equal(h.profile().interests, 'nature');
        assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
        assert.equal(h.state().workbenchConversation.turns.at(-1).messages.some(message => message.content === announcement), approved);
    });
}

test('cancelling an approval removes it and never executes a late acceptance', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); const old = structuredClone(h.profile());
    h.flags.teacherResponse = () => ({ toolCalls: [call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] });
    await send(h, 'talk', { target: 'workbench', message: '换一课。' }); await until(() => h.state().approval);
    const id = h.state().approval.id;
    await send(h, 'cancel-chat', { target: 'workbench' }); await until(() => !h.state().workbenchBusy);
    await send(h, 'approve-operation', { id, approved: true });
    assert.equal(h.state().approval, null); assert.deepEqual(h.profile(), old);
});

for (const tool of ['LearningArticle', 'LearningLessonEdit']) {
    test(`${tool} validates a replacement before asking for consent, then continues with corrected arguments`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const old = structuredClone(h.profile().unit); const writes = h.counts.userWrites;
        let invalidResult; let savedResult; let approvals = 0;
        const unsubscribe = h.bridge.subscribe(() => { if (h.state().approval) { approvals++; } }); t.after(unsubscribe);
        h.flags.teacherResponse = (request, round) => {
            if (round === 1) { return { toolCalls: [call(tool, { title: 'Incomplete replacement', ...(tool === 'LearningLessonEdit' ? { newLesson: true } : {}) })] }; }
            if (round === 2) {
                invalidResult = results(request).at(-1);
                assert.equal(approvals, 0);
                return { toolCalls: [call(tool, tool === 'LearningArticle'
                    ? { title: 'Corrected article', goal: 'Read an article', kind: 'authored', tier: 'short', text: fixtureLesson.materials[0].text }
                    : { ...fixtureLesson, title: 'Corrected lesson', newLesson: true })] };
            }
            savedResult = results(request).at(-1); return { text: 'Ready.' };
        };
        await send(h, 'talk', { target: 'workbench', message: 'Prepare another lesson.' });
        await until(() => h.state().approval || !h.state().workbenchBusy);
        assert.equal(invalidResult?.ok, false);
        assert.ok(invalidResult.errors.length > 0);
        assert.equal(h.state().approval?.unitId, old.id);
        assert.deepEqual(h.profile().unit, old); assert.equal(h.counts.userWrites, writes);
        await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
        await until(() => !h.state().workbenchBusy);
        assert.equal(savedResult.status, 'confirmed'); assert.notEqual(h.profile().unit.id, old.id);
        assert.equal(h.counts.userWrites, writes + 1);
        assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
    });
}

test('consent for a validated replacement cannot overwrite a different lesson saved while waiting', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); let receipt;
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] }; }
        receipt = results(request).at(-1); return { text: 'The selected lesson changed.' };
    };
    await send(h, 'talk', { target: 'workbench', message: 'Replace this lesson.' }); await until(() => h.state().approval);
    const id = h.state().approval.id;
    const expected = h.repository.snapshot().document; const next = structuredClone(expected.data);
    next.profiles[0].unit.id = 'another-current-lesson';
    await h.repository.save(expected, next, () => true); const writes = h.counts.userWrites;
    await send(h, 'approve-operation', { id, approved: true }); await until(() => !h.state().workbenchBusy);
    assert.equal(receipt.ok, false); assert.equal(receipt.errors[0].path, 'unitId');
    assert.equal(h.profile().unit.id, 'another-current-lesson'); assert.equal(h.counts.userWrites, writes);
});

test('companion continues its original exchange after the delegated task replaces the current unit', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const oldId = h.profile().unit.id;
    h.flags.teacherResponse = (request, round) => {
        if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
            return round === 1 ? { toolCalls: [call('LearningRequest')] } : { text: '换好了，我们接着看。' };
        }
        return round === 1 ? { toolCalls: [call('LearningPresent', { kind: 'exercise', id: h.profile().unit.exercises[0].id }),
            call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] } : { text: '新课已保存。' };
    };
    await send(h, 'talk', { target: 'companion', message: '换一课。' }); await until(() => h.state().approval);
    await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
    await until(() => !h.state().chatBusy && !h.state().workbenchBusy);
    assert.notEqual(h.profile().unit.id, oldId);
    assert.equal(h.state().conversation.turns.at(-1).status, 'finished');
    assert.equal(h.state().workbenchConversation.turns.at(-1).presentation, undefined);
});

test('a saved edit survives later provider failure and valid repeated reads do not end a task', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherResponse = (_request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningProfileEdit', { level: 'C1' })] }; }
        if (round <= 6) { return { toolCalls: [call('LearningRead', {})] }; }
        throw Object.assign(new Error('fixture'), { status: 503 });
    };
    const before = h.counts.provider;
    await h.command('talk', { target: 'workbench', message: '修改水平，再查一下。' });
    assert.equal(h.counts.provider - before, 7); assert.equal(h.profile().level, 'C1');
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'failed');
});

test('delegated submission saves only the learner text and its original help conditions', async t => {
    const lesson = structuredClone(fixtureLesson);
    lesson.exercises[0].response = { kind: 'text' }; lesson.exercises[0].rule = { kind: 'semantic' };
    const h = await createClassroomFixture({ lesson }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const exerciseId = unit.exercises[0].id;
    const text = 'Trees makes streets cooler.'; let rejects;
    h.flags.teacherResponse = (request, round) => {
        if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
            return round === 1 ? { toolCalls: [call('LearningRequest')] } : { text: '交好了。' };
        }
        if (round === 1) { return { toolCalls: [call('LearningSubmit', { unitId: unit.id, exerciseId, text: 'Corrected teacher answer.' })] }; }
        if (round === 2) {
            rejects = results(request).at(-1);
            return { toolCalls: [call('LearningProfileEdit', { interests: 'nature' }),
                call('LearningReveal', { unitId: unit.id, kind: 'hints', id: exerciseId }), call('LearningSubmit', { unitId: unit.id, exerciseId, text })] };
        }
        return { text: '原答已保存。' };
    };
    await h.command('talk', { unitId: unit.id, exerciseId, message: `请提交我的原答：${text}` });
    assert.equal(rejects.ok, false);
    assert.equal(h.profile().unit.attempts.length, 1);
    assert.equal(h.profile().unit.attempts[0].answer.text, text);
    assert.equal(h.profile().unit.attempts[0].help.hint, false);
    assert.equal(h.profile().interests, 'nature');
    assert.deepEqual(h.profile().unit.revealed.hints, [exerciseId]);
});

test('native partial revision asks for its own feedback while the other drafts are still unwritten', async t => {
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind: 'reading-writing' } }); t.after(h.dispose);
    await h.openLesson(); if (h.state().sourceChoice) { await h.command('choose-original'); }
    const unit = h.profile().unit; const exerciseId = unit.exercises[0].id;
    let reviewed;
    h.flags.teacherResponse = (request, round) => {
        if (round > 1) { return { text: '评好了。' }; }
        const input = JSON.parse(request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>'))
            .content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
        if (input.action.kind === 'summary-review') { return { text: '可以继续完善。' }; }
        const attemptId = input.action.kind === 'revision-review' ? input.focus.revisions[0].revision.id : input.focus.drafts[0].attempt.id;
        if (input.action.kind === 'revision-review') { reviewed = attemptId; }
        return { toolCalls: [call('LearningAssess', { attemptId, verdict: 'correct', understanding: 'Meaning is clear.', expression: 'Improve the wording.', guidance: 'Choose a precise noun.',
            ...(input.action.kind === 'grade' ? { annotations: [{ category: 'vocabulary', severity: 'improve', paragraphIndex: 0, quote: 'Shade', explanation: 'Name its source.', suggestion: 'Trees' }] } : {}) })] };
    };
    await h.command('submit', { unitId: unit.id, exerciseId, answer: { kind: 'text', text: 'Shade helps people.' } });
    await h.command('grade', { unitId: unit.id });
    const original = h.profile().unit.attempts[0];
    const ui = createLearningUiSession();
    const annotation = h.state().unit.assessments[0].annotations[0];
    ui.unit(unit.id).edits[annotation.id] = { value: 'Trees', done: true };
    assert.equal(hasLearningUnsavedInput(ui, h.state()), true);
    await h.command('submit-revision', { unitId: unit.id, revisions: [{ attemptId: original.id, text: 'Trees help people.' }] });
    assert.equal(reviewed, h.profile().unit.attempts.at(-1).id);
    assert.equal(h.state().unit.stage.stage, 'writing');
    assert.equal(h.state().unit.stage.exercises[0].status, 'done');
    assert.equal(hasLearningUnsavedInput(ui, h.state()), false);
});

test('private coursework read during public preparation keeps the reply in its original story', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const document = structuredClone(h.repository.snapshot().document);
    const unit = document.data.profiles[0].unit;
    unit.scope = { kind: 'story', osId: unit.originOsId }; unit.title = 'A private classroom fact';
    h.replaceUser(document); await h.command('read');
    h.flags.teacherResponse = (request, round) => round === 1 ? { toolCalls: [call('LearningRead', { section: 'unit' })] }
        : { text: results(request).at(-1).data.title };
    await h.command('replace-lesson', { unitId: unit.id, message: 'Read the previous lesson before choosing another.' });
    assert.deepEqual(h.state().workbenchConversation.turns.at(-1).scope, unit.scope);
    await h.changeChat();
    assert.ok(h.state().workbenchConversation.turns.every(turn => turn.teacher !== unit.title));
});

for (const ending of ['confirmed', 'rejected', 'unconfirmed']) {
    test(`reply publication waits for all writes in its tool batch (${ending})`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const unit = h.profile().unit; const answer = 'The answer is a.'; let exposedBeforeSave = false;
        const off = h.bridge.subscribe(() => {
            const revealed = h.profile().unit.revealed.answers.includes(unit.exercises[0].id);
            const visible = h.state().workbenchConversation.turns.at(-1)?.messages.some(message => message.content === answer);
            exposedBeforeSave ||= visible && !revealed;
            if (h.profile().interests === 'nature' && !revealed) {
                h.flags.userRejected = ending === 'rejected'; h.flags.userFailure = ending === 'unconfirmed';
            }
        });
        t.after(off);
        h.flags.teacherResponse = (_request, round) => round === 1 ? { text: answer, toolCalls: [
            call('LearningProfileEdit', { interests: 'nature' }), call('LearningReveal', { unitId: unit.id, kind: 'answers', id: unit.exercises[0].id }),
        ] } : { text: 'Done.' };
        await h.command('talk', { target: 'workbench', message: 'Save my interest and show the answer.' });
        assert.equal(exposedBeforeSave, false); assert.equal(h.profile().interests, 'nature');
        assert.equal(h.state().workbenchConversation.turns.at(-1).messages.some(message => message.content === answer), ending === 'confirmed');
    });
}

for (const target of ['workbench', 'companion']) {
    test(`retrying ${target} reuses this message's saved submission, while a new message can answer again`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture({ lesson: textLesson() }); t.after(h.dispose); await h.openLesson();
        const unit = h.profile().unit; const text = 'Trees help people.';
        const args = { unitId: unit.id, exerciseId: unit.exercises[0].id, text }; let failing = true;
        h.flags.teacherResponse = (request, round) => {
            const companion = request.tools.some(tool => tool.function.name === 'LearningRequest');
            if (round === 1) { return { toolCalls: [companion ? call('LearningRequest') : call('LearningSubmit', args)] }; }
            if (failing && (target === 'workbench' || companion)) { throw new Error('Provider failed after submission'); }
            return { text: 'Saved.' };
        };
        await h.command('talk', { target, unitId: unit.id, exerciseId: args.exerciseId, message: text });
        const lane = target === 'workbench' ? 'workbenchConversation' : 'conversation';
        const failed = h.state()[lane].turns.findLast(turn => turn.purpose === 'talk'); const original = structuredClone(h.profile().unit.attempts);
        assert.equal(failed.retryable, true); assert.equal(original.length, 1);
        failing = false;
        await h.command('retry-chat', { target, id: failed.id });
        assert.equal(h.state()[lane].turns.at(-1).status, 'finished'); assert.deepEqual(h.profile().unit.attempts, original);
        await h.command('talk', { target, unitId: unit.id, exerciseId: args.exerciseId, message: text });
        assert.equal(h.profile().unit.attempts.length, 2);
    });
}

test('a retried answer keeps the help and timestamp from the original message', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ lesson: textLesson() }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const exerciseId = unit.exercises[0].id; const text = 'Trees help people.';
    h.flags.teacherResponse = (_request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningReveal', { unitId: unit.id, kind: 'hints', id: exerciseId })] }; }
        throw new Error('Interrupted after help');
    };
    await h.command('talk', { target: 'workbench', unitId: unit.id, exerciseId, message: text });
    const failed = h.state().workbenchConversation.turns.at(-1);
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [call('LearningSubmit', { unitId: unit.id, exerciseId, text })] } : { text: 'Saved.' };
    await h.command('retry-chat', { target: 'workbench', id: failed.id });
    assert.equal(h.profile().unit.attempts[0].help.hint, false);
    assert.deepEqual(h.profile().unit.revealed.hints, [exerciseId]);
});

test('native submission may finish and replace its lesson without losing the reply or reward', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await h.economy.ensureOpen(() => true);
    const unit = h.profile().unit;
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [
        call('LearningAssess', { attemptId: h.profile().unit.attempts.at(-1).id, items: [{ label: 'The role of trees' }] }),
        call('LearningComplete', { unitId: unit.id, attemptIds: [h.profile().unit.attempts.at(-1).id], summary: 'Finished.' }),
        call('LearningLessonEdit', { ...fixtureLesson, newLesson: true }),
    ] } : { text: 'Your next lesson is ready.' };
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.notEqual(h.profile().unit.id, unit.id); assert.equal(h.state().message, '');
    assert.equal(h.state().completions.find(entry => entry.unitId === unit.id).rewardStatus, 'paid');
});

test('revisions record an already published model essay as answer help', async t => {
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind: 'reading-writing' } }); t.after(h.dispose); await h.openLesson();
    if (h.state().sourceChoice) { await h.command('choose-original'); }
    const unit = h.profile().unit; const exercise = unit.exercises.find(entry => !entry.paragraphId);
    h.flags.teacherResponse = () => ({ text: 'Saved.' });
    await h.command('submit', { unitId: unit.id, exerciseId: exercise.id, answer: { kind: 'text', text: 'Trees help.' } });
    const attempt = h.profile().unit.attempts[0];
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [
        call('LearningAssess', { attemptId: attempt.id, verdict: 'partial', understanding: 'Clear idea.', expression: '', guidance: 'Expand the idea.' }),
        call('LearningModelEssay', { unitId: unit.id, text: 'Trees bring shade and cool cities.', level: 'B1' }),
    ] } : { text: 'Feedback and example are ready.' };
    await h.command('talk', { target: 'workbench', message: 'Assess my essay and show an example.' });
    h.flags.teacherResponse = () => ({ text: 'Saved.' });
    await h.command('submit-revision', { unitId: unit.id, revisions: [{ attemptId: attempt.id, text: 'Trees bring shade and cool cities.' }] });
    assert.equal(h.profile().unit.attempts.at(-1).help.answer, true);
    assert.equal(h.profile().unit.attempts[0].help.answer, false);
});

test('reading provenance follows the actual feedback and page, not the public answer ID', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    await saveAnswer(h); await saveAnswer(h);
    const document = h.repository.snapshot().document;
    const unit = document.data.profiles[0].unit;
    const privateScope = { kind: 'story', osId: unit.originOsId };
    unit.assessments[1].scope = privateScope;
    unit.assessments[1].guidance = 'Feedback known only in this story';
    h.replaceUser(document); await h.command('read');
    for (const offset of [0, 1]) {
        const reading = createLearningReading();
        const result = readLearning(document.data, 'en', unit.originOsId, { section: 'attempts', offset, limit: 1 }, undefined, 'teaching', 'unit', reading);
        assert.deepEqual(reading.inspect(result).scope, offset ? privateScope : unit.scope);
        assert.ok(reading.inspect(result).references.includes(unit.attempts[offset].id));
        assert.ok(!reading.inspect(result).references.includes(unit.attempts[1 - offset].id));
    }
    for (const section of ['overview', 'training', 'unit']) {
        const reading = createLearningReading();
        const result = readLearning(document.data, 'en', unit.originOsId, { section }, undefined, 'teaching', 'unit', reading);
        const provenance = reading.inspect(result);
        assert.ok(provenance.references.includes(unit.materials[0].id));
        assert.ok(provenance.references.includes(unit.exercises[0].id));
        assert.deepEqual(provenance.scope, section === 'unit' ? privateScope : unit.scope);
    }
    const context = buildLearningContext({ data: document.data, language: 'en', osId: unit.originOsId, actor: 'workbench', teacher: null, context: null,
        action: { kind: 'talk', unitId: unit.id }, exerciseId: unit.exercises[0].id, message: 'Review my feedback.' });
    assert.deepEqual(context.scope, privateScope);
    h.flags.teacherResponse = (request, round) => round === 1 ? { toolCalls: [call('LearningRead', { section: 'attempts' })] }
        : { text: results(request).at(-1).data[1].assessment.guidance };
    await h.command('replace-lesson', { unitId: unit.id, message: 'Read the feedback first.' });
    assert.deepEqual(h.state().workbenchConversation.turns.at(-1).scope, privateScope);
    await h.changeChat();
    assert.ok(h.state().workbenchConversation.turns.every(turn => turn.teacher !== unit.assessments[1].guidance));
});

test('private completion summaries taint a public preparation reply even after the source unit is retired', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await saveAnswer(h);
    const unit = h.profile().unit;
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [call('LearningComplete', {
        unitId: unit.id, attemptIds: [unit.attempts[0].id], summary: 'Private completion detail',
    })] } : { text: 'Done.' };
    await h.command('complete');
    const document = h.repository.snapshot().document;
    const scope = { kind: 'story', osId: unit.originOsId };
    document.data.profiles[0].completions[0].scope = scope;
    document.data.profiles[0].unit = null;
    h.replaceUser(document); await h.command('read');
    const context = buildLearningContext({ data: document.data, language: 'en', osId: unit.originOsId, actor: 'workbench', teacher: null, context: null,
        action: { kind: 'talk' }, message: 'How did I do?' });
    assert.deepEqual(context.scope, scope);
    h.flags.teacherResponse = (request, round) => round === 1 ? { toolCalls: [call('LearningRead', { section: 'completions' })] }
        : { text: results(request).at(-1).data[0].summary };
    await h.command('prepare', { message: 'Read the previous summary.' });
    assert.deepEqual(h.state().workbenchConversation.turns.at(-1).scope, scope);
    await h.changeChat();
    assert.ok(h.state().workbenchConversation.turns.every(turn => turn.teacher !== 'Private completion detail'));
});

test('an invalid tool hides only its own response while correction and subsequent saves continue', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const hidden = 'Answer from the rejected batch';
    let rejection;
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) { return { text: hidden, toolCalls: [call('LearningProfileEdit', { level: 'B2' }),
            call('LearningReveal', { unitId: unit.id, kind: 'answers', id: 'missing' })] }; }
        if (round === 2) {
            rejection = results(request).at(-1);
            return { text: 'Corrected answer', toolCalls: [call('LearningReveal', { unitId: unit.id, kind: 'answers', id: unit.exercises[0].id })] };
        }
        return { text: 'Finished.' };
    };
    await h.command('talk', { target: 'workbench', message: 'Show the answer.' });
    const turn = h.state().workbenchConversation.turns.at(-1);
    assert.equal(rejection.ok, false); assert.equal(turn.status, 'finished'); assert.equal(h.profile().level, 'B2');
    assert.ok(!turn.messages.some(message => message.content === hidden));
    assert.ok(turn.messages.some(message => message.content === 'Corrected answer'));
    await h.reenter();
    assert.ok(!h.state().workbenchConversation.turns.at(-1).teacher.includes(hidden));
});

    for (const ending of ['failure', 'cancel']) {
        test(`workbench can retry its own replacement after ${ending}, retaining the original selection`, async t => {
            t.mock.method(console, 'error', () => {});
            const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
            const unit = h.profile().unit;
            const selection = { materialId: unit.materials[0].id, paragraphId: 'p1', start: 0, end: 6, quote: 'A tree' };
            let release; let waiting = false;
            h.flags.teacherResponse = (_request, round) => {
                if (round === 1) { return { toolCalls: [call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] }; }
                if (ending === 'failure') { throw new Error('Interrupted after replacement'); }
                waiting = true; return new Promise(resolve => { release = () => resolve({ text: 'Late text' }); });
            };
            await send(h, 'talk', { target: 'workbench', unitId: unit.id, exerciseId: unit.exercises[0].id, selection, message: 'Replace this lesson.' });
            await until(() => h.state().approval); await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
            if (ending === 'cancel') { await until(() => waiting); await send(h, 'cancel-chat', { target: 'workbench' }); release(); }
            const lane = 'workbenchConversation';
            await until(() => h.state()[lane].turns.at(-1).retryable);
            const failed = h.state()[lane].turns.at(-1); const newUnitId = h.profile().unit.id;
            assert.notEqual(newUnitId, unit.id);
            let resumed; let readUnit; let editReceipt;
            h.flags.teacherResponse = (request, round) => {
                const input = request.messages.find(message => message.role === 'user' && message.content.includes('<learning_request>'));
                resumed = JSON.parse(input.content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
                if (round === 1) { return { toolCalls: [call('LearningRead', { section: 'unit' })] }; }
                if (round === 2) {
                    readUnit = results(request).at(-1).data;
                    return { toolCalls: [call('LearningLessonEdit', { exercises: [{ key: 'extra', skill: 'writing', materialKeys: [],
                        prompt: 'Describe a tree.', response: { kind: 'text' }, rule: { kind: 'semantic' } }] })] };
                }
                editReceipt = results(request).at(-1);
                return { text: 'Continued.' };
            };
            await h.command('retry-chat', { target: 'workbench', id: failed.id });
            assert.equal(h.state()[lane].turns.at(-1).status, 'finished'); assert.equal(h.profile().unit.id, newUnitId);
            assert.deepEqual(resumed.selection, selection); assert.equal(resumed.action.unitId, unit.id);
            assert.equal(resumed.focus, null);
            assert.equal(readUnit?.id, newUnitId); assert.equal(editReceipt?.status, 'confirmed');
            assert.equal(h.profile().unit.exercises.length, unit.exercises.length + 1);
        });
    }

test('a result turn can delegate follow-up work against the latest lesson', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const old = structuredClone(h.profile().unit); let handoffs = 0; const receipts = [];
    h.flags.teacherResponse = (request, round) => {
        if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
            if (round > 1) { receipts.push(results(request).at(-1)); }
            if (round === 1) { handoffs++; return { toolCalls: [call('LearningRequest', { task: 'Replace the lesson.' })] }; }
            return { text: 'Finished.' };
        }
        return round === 1 ? { toolCalls: [call('LearningLessonEdit', handoffs === 1 ? { ...fixtureLesson, newLesson: true }
            : { exercises: [{ key: 'extra', skill: 'writing', materialKeys: [], prompt: 'Describe a tree.', response: { kind: 'text' }, rule: { kind: 'semantic' } }] })] }
            : { text: 'Saved.' };
    };
    h.flags.notificationResponse = (request, round) => {
        if (handoffs === 1 && round === 1) { handoffs++; return { toolCalls: [call('LearningRequest', { task: 'Add a writing question to the new lesson.' })] }; }
        if (round > 1) { receipts.push(results(request).at(-1)); }
        return { text: 'Follow-up received.' };
    };
    await send(h, 'talk', { target: 'companion', unitId: old.id, exerciseId: old.exercises[0].id, message: 'Replace this lesson and add a writing question.' });
    await until(() => h.state().approval);
    await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
    await until(() => !h.state().chatBusy && !h.state().workbenchBusy);
    assert.notEqual(h.profile().unit.id, old.id);
    assert.equal(h.profile().unit.exercises.length, old.exercises.length + 1);
    assert.equal(receipts.length, 2); assert.ok(receipts.every(result => result.ok && result.status === 'accepted'));
});

test('a delegated review replacement keeps its focus through subsequent tools without editing the lesson', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const document = h.repository.snapshot().document; const data = structuredClone(document.data);
    const profile = data.profiles[0]; const lesson = structuredClone(profile.unit);
    profile.items = [{ id: 'review-item', label: 'shade', scope: lesson.scope, skill: 'vocabulary', evidence: [], schedule: newLearningSchedule('2026-01-01T00:00:00Z') }];
    const question = { ...fixtureLesson.exercises[0], key: 'review-question', skill: 'vocabulary', materialKeys: [], itemId: 'review-item' };
    profile.review = { ...lesson, id: 'review-original', kind: 'review', materials: [],
        exercises: [{ ...lesson.exercises[0], id: 'review-question', skill: 'vocabulary', materialIds: [], itemId: 'review-item' }] };
    await h.repository.save(document, data, () => true);
    let read; let edit;
    h.flags.teacherResponse = (request, round) => {
        if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
            if (round === 1) { return { toolCalls: [call('LearningRequest')] }; }
            return { text: 'Finished.' };
        }
        if (round === 1) { return { toolCalls: [call('LearningLessonEdit', { kind: 'review', newLesson: true,
            title: 'Next review', goal: 'Recall shade.', exercises: [question] })] }; }
        if (round === 2) { return { toolCalls: [call('LearningRead', { section: 'unit' })] }; }
        if (round === 3) {
            read = results(request).at(-1).data; return { toolCalls: [call('LearningLessonEdit', { title: 'Revised review' })] };
        }
        edit = results(request).at(-1); return { text: 'Saved.' };
    };
    await send(h, 'talk', { target: 'companion', unitId: 'review-original', exerciseId: 'review-question', message: 'Replace this review and revise its title.' });
    await until(() => h.state().approval);
    await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
    await until(() => !h.state().chatBusy && !h.state().workbenchBusy);
    assert.notEqual(read?.id, 'review-original'); assert.equal(read?.id, h.profile().review.id);
    assert.equal(edit?.status, 'confirmed'); assert.equal(h.profile().review.title, 'Revised review');
    assert.deepEqual(h.profile().unit, lesson);
});

for (const newLesson of [undefined, false]) {
    test(`replacement preparation can edit its published article (newLesson: ${newLesson})`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const oldId = h.profile().unit.id; let articleId; let editReceipt;
        h.flags.teacherResponse = (request, round) => {
            if (round === 1) { return { toolCalls: [call('LearningArticle', { title: 'Next article', goal: 'Read next', tier: 'short',
                kind: 'authored', text: fixtureLesson.materials[0].text })] }; }
            if (round === 2) {
                articleId = results(request).at(-1).ids[0];
                return { toolCalls: [call('LearningLessonEdit', { ...(newLesson === undefined ? {} : { newLesson }),
                    exercises: [{ key: 'extra', skill: 'writing', materialKeys: [], prompt: 'Describe a tree.', response: { kind: 'text' }, rule: { kind: 'semantic' } }] })] };
            }
            editReceipt = results(request).at(-1); return { text: 'Saved.' };
        };
        await h.command('replace-lesson', { unitId: oldId, kind: 'reading-writing', message: 'Replace the article and add a writing question.' });
        await h.command('choose-original');
        assert.notEqual(articleId, oldId); assert.equal(h.profile().unit.id, articleId);
        assert.equal(editReceipt.ok, true); assert.equal(editReceipt.status, 'confirmed');
        assert.equal(h.profile().unit.exercises.filter(exercise => !exercise.paragraphId).length, 1);
        assert.equal(h.state().approval, null);
    });
}

for (const recovery of ['verify', 'retry-save', 'adopt-server', 'adopt-missing']) {
    for (const revision of [false, true]) {
        test(`a ${revision ? 'revision' : 'submission'} confirmed by ${recovery} stays the same operation on companion retry`, async t => {
            t.mock.method(console, 'error', () => {});
            const h = await createClassroomFixture({ lesson: revision ? { ...fixtureLesson, kind: 'reading-writing' } : textLesson() });
            t.after(h.dispose); await h.openLesson(); if (h.state().sourceChoice) { await h.command('choose-original'); }
            const unit = h.profile().unit; const exerciseId = unit.exercises[0].id; const service = createLearningService(h.repository);
            let originalId;
            if (revision) {
                const original = service.prepareAttempt({ language: 'en', unitId: unit.id, exerciseId, answer: { kind: 'text', text: 'Trees helps people.' },
                    scope: unit.scope, osId: unit.originOsId, replays: 0, slowPlayback: false });
                await original.save(() => true); originalId = original.attemptId;
                h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [call('LearningAssess', { attemptId: originalId,
                    verdict: 'partial', understanding: 'Clear.', expression: 'Check agreement.', guidance: 'Use help.' })] } : { text: 'Assessed.' };
                await h.command('talk', { target: 'workbench', message: 'Assess my draft.' });
            }
            const args = { unitId: unit.id, exerciseId, text: 'Trees help people.', ...(revision ? { revisesAttemptId: originalId } : {}) };
            let failing = true; let receipt;
            h.flags.teacherResponse = (request, round) => {
                const companion = request.tools.some(tool => tool.function.name === 'LearningRequest');
                if (round === 1) { return { toolCalls: [companion ? call('LearningRequest') : call('LearningSubmit', args)] }; }
                if (companion && failing) { throw new Error('Provider interrupted after the save receipt was lost'); }
                if (!companion) { receipt = results(request).at(-1); }
                return { text: 'Saved.' };
            };
            h.flags.userFailure = true;
            await h.command('talk', { target: 'companion', unitId: unit.id, exerciseId, message: args.text });
            const failed = h.state().conversation.turns.findLast(turn => turn.purpose === 'talk');
            assert.equal(h.state().storage, 'unconfirmed'); assert.equal(receipt.status, 'unconfirmed');
            if (recovery === 'retry-save' || recovery === 'adopt-missing') { h.flags.userFailure = false; } else { h.confirmUser(); }
            await h.command(recovery === 'adopt-missing' ? 'adopt-server' : recovery);
            const saved = structuredClone(h.profile().unit.attempts);
            assert.equal(saved.length, Number(revision) + Number(recovery !== 'adopt-missing'));
            assert.equal(h.state().conversation.turns.find(turn => turn.id === failed.id).retryable, true);
            failing = false;
            await h.command('retry-chat', { target: 'companion', id: failed.id });
            assert.equal(h.state().conversation.turns.find(turn => turn.id === failed.id).status, 'finished');
            assert.deepEqual(h.profile().unit.attempts, saved);
            assert.equal(h.state().delegatedTasks.length, 1);
        });
    }
}

test('verification after cancelling an in-flight handoff still acknowledges its saved submission', async t => {
    let release; let waiting = false;
    const gate = new Promise(resolve => { release = () => resolve({ text: 'Late response.' }); });
    const h = await createClassroomFixture({ lesson: textLesson() }); t.after(() => { release?.(); return h.dispose(); }); await h.openLesson();
    const unit = h.profile().unit; const args = { unitId: unit.id, exerciseId: unit.exercises[0].id, text: 'Trees help people.' };
    h.flags.userFailure = true;
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) { return { toolCalls: [request.tools.some(tool => tool.function.name === 'LearningRequest')
            ? call('LearningRequest') : call('LearningSubmit', args)] }; }
        waiting = true; return gate;
    };
    await send(h, 'talk', { target: 'companion', unitId: unit.id, message: args.text });
    await until(() => waiting); await send(h, 'cancel-chat', { target: 'companion' }); release();
    await until(() => !h.state().chatBusy && !h.state().workbenchBusy);
    const failed = h.state().conversation.turns.findLast(turn => turn.purpose === 'talk');
    h.confirmUser(); await h.command('verify');
    const saved = structuredClone(h.profile().unit.attempts); let repeatedWork = 0;
    h.flags.teacherResponse = (request, round) => {
        const companion = request.tools.some(tool => tool.function.name === 'LearningRequest');
        if (round === 1) { return { toolCalls: [companion ? call('LearningRequest') : call('LearningSubmit', args)] }; }
        if (!companion) { repeatedWork++; } return { text: 'Saved.' };
    };
    await h.command('retry-chat', { target: 'companion', id: failed.id });
    assert.equal(repeatedWork, 0); assert.equal(saved.length, 1); assert.deepEqual(h.profile().unit.attempts, saved);
});

for (const firstTool of ['LearningSubmit', 'LearningProfileEdit']) {
test(`verification of ${firstTool} while the model is still running lets its next tool continue`, async t => {
    let release; let waiting = false; let receipt;
    const h = await createClassroomFixture({ lesson: textLesson() }); t.after(() => { release?.(); return h.dispose(); }); await h.openLesson();
    const unit = h.profile().unit;
    h.flags.userFailure = true;
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) { return { toolCalls: [call(firstTool, firstTool === 'LearningSubmit'
            ? { unitId: unit.id, exerciseId: unit.exercises[0].id, text: 'Trees help people.' } : { interests: 'nature' })] }; }
        if (round === 2) {
            waiting = true; return new Promise(resolve => { release = () => resolve({ toolCalls: [call('LearningProfileEdit', { level: 'B2' })] }); });
        }
        receipt = results(request).at(-1); return { text: 'Saved.' };
    };
    await send(h, 'talk', { target: 'workbench', message: 'Trees help people. Set my stated level to B2 too.' });
    await until(() => waiting); h.confirmUser(); await send(h, 'verify');
    await until(() => h.state().storage === 'ready' && !h.state().busy); release();
    await until(() => !h.state().workbenchBusy);
    assert.equal(receipt.status, 'confirmed'); assert.equal(h.profile().level, 'B2');
    assert.equal(h.profile().unit.attempts.length, Number(firstTool === 'LearningSubmit'));
    if (firstTool === 'LearningProfileEdit') { assert.equal(h.profile().interests, 'nature'); }
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
});
}

test('a replacement confirmed later can be edited by a new delegation, not by replaying the original task', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const old = structuredClone(h.profile().unit);
    h.flags.teacherResponse = (request, round) => {
        if (round === 1) { return { toolCalls: [request.tools.some(tool => tool.function.name === 'LearningRequest')
            ? call('LearningRequest') : call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] }; }
        throw new Error('Interrupted after pending replacement');
    };
    await send(h, 'talk', { target: 'companion', unitId: old.id, exerciseId: old.exercises[0].id, message: 'Replace this lesson, then add practice.' });
    await until(() => h.state().approval); h.flags.userFailure = true;
    await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
    await until(() => !h.state().chatBusy && !h.state().workbenchBusy);
    h.confirmUser(); await h.command('verify');
    const replacement = structuredClone(h.profile().unit);
    assert.notEqual(replacement.id, old.id);
    assert.equal(h.state().conversation.turns.findLast(turn => turn.purpose === 'talk').retryable, false);
    let receipt;
    h.flags.teacherResponse = (request, round) => {
        const companion = request.tools.some(tool => tool.function.name === 'LearningRequest');
        if (round === 1) { return { toolCalls: [companion ? call('LearningRequest') : call('LearningLessonEdit', {
            exercises: [{ key: 'extra', skill: 'writing', materialKeys: [], prompt: 'Describe a tree.', response: { kind: 'text' }, rule: { kind: 'semantic' } }] })] }; }
        if (!companion) { receipt = results(request).at(-1); } return { text: 'Saved.' };
    };
    await h.command('talk', { target: 'companion', unitId: replacement.id, message: 'Add the writing question to this lesson.' });
    assert.equal(receipt.status, 'confirmed'); assert.equal(h.profile().unit.id, replacement.id);
    assert.equal(h.profile().unit.exercises.length, replacement.exercises.length + 1);
});

for (const entry of ['native', 'workbench', 'companion', 'preparation']) {
    for (const ending of ['finished', 'failure']) {
        test(`${entry} settles a retired completion once even when the run ends in ${ending}`, async t => {
            t.mock.method(console, 'error', () => {});
            const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await h.economy.ensureOpen(() => true);
            if (entry !== 'native') { await saveAnswer(h); }
            const unit = h.profile().unit; const balance = h.economy.getPlayerBalance();
            h.flags.teacherResponse = (request, round) => {
                if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
                    return round === 1 ? { toolCalls: [call('LearningRequest')] } : { text: 'Handed back.' };
                }
                if (round === 1) { return { toolCalls: [call('LearningComplete', { unitId: unit.id,
                    attemptIds: [h.profile().unit.attempts.at(-1).id], summary: 'Finished.' }),
                call('LearningArticle', { title: 'Next article', goal: 'Read next', tier: 'short', kind: 'authored', text: fixtureLesson.materials[0].text })] }; }
                if (ending === 'failure') { throw new Error('Interrupted after saved work'); }
                return { text: 'Ready.' };
            };
            if (entry === 'native') { await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } }); }
            else if (entry === 'preparation') {
                await h.command('replace-lesson', { kind: 'reading-writing', unitId: unit.id, message: 'Finish this and prepare the next article.' });
                if (h.state().sourceChoice) { await h.command('choose-original'); }
            } else { await h.command('talk', { target: entry, message: 'Finish this and prepare the next article.' }); }
            assert.notEqual(h.profile().unit.id, unit.id);
            assert.equal(h.state().completions.find(entry => entry.unitId === unit.id).rewardStatus, 'paid');
            assert.equal(h.economy.getPlayerBalance(), balance + unit.reward.amount);
            const writes = h.counts.ledgerWrites;
            await h.reenter(); await h.command('read');
            assert.equal(h.counts.ledgerWrites, writes);
        });
    }
}

test('external replacement retires an interrupted request instead of applying it to unrelated work', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherResponse = () => { throw new Error('Provider unavailable'); };
    await h.command('talk', { target: 'workbench', unitId: h.profile().unit.id, message: 'Explain this.' });
    const failed = h.state().workbenchConversation.turns.at(-1);
    assert.equal(failed.retryable, true);
    const document = h.repository.snapshot().document; const data = structuredClone(document.data);
    data.profiles[0].unit.id = 'externally-replaced';
    await h.repository.save(document, data, () => true);
    const calls = h.counts.provider;
    await h.command('retry-chat', { target: 'workbench', id: failed.id });
    assert.equal(h.counts.provider, calls);
    assert.equal(h.state().workbenchConversation.turns.at(-1).retryable, false);
});

test('stopping after a saved completion and replacement still settles that completion', async t => {
    let release; let waiting = false;
    const h = await createClassroomFixture(); t.after(() => { release?.(); return h.dispose(); }); await h.openLesson(); await saveAnswer(h);
    await h.economy.ensureOpen(() => true);
    const unit = h.profile().unit; const balance = h.economy.getPlayerBalance();
    h.flags.teacherResponse = (_request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningComplete', { unitId: unit.id, attemptIds: [unit.attempts[0].id], summary: 'Complete.' }),
            call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] }; }
        waiting = true; return new Promise(resolve => { release = () => resolve({ text: 'Late response' }); });
    };
    await send(h, 'talk', { target: 'workbench', message: 'Finish and move on.' });
    await until(() => waiting); await send(h, 'cancel-chat', { target: 'workbench' }); release();
    await until(() => h.state().completions[0].rewardStatus === 'paid');
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'cancelled');
    assert.equal(h.economy.getPlayerBalance(), balance + unit.reward.amount);
    assert.notEqual(h.profile().unit.id, unit.id);
});

test('a delegation cannot claim an external replacement as its own confirmed work', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherResponse = async (request, round) => {
        if (request.tools.some(tool => tool.function.name === 'LearningRequest')) {
            if (round === 1) { return { toolCalls: [call('LearningRequest')] }; }
            throw new Error('Interrupted companion');
        }
        const document = h.repository.snapshot().document; const data = structuredClone(document.data);
        data.profiles[0].unit.id = 'external-during-handoff';
        await h.repository.save(document, data, () => true);
        return { text: 'No owned changes.' };
    };
    await h.command('talk', { target: 'companion', message: 'Review this lesson.' });
    assert.equal(h.state().conversation.turns.at(-1).retryable, false);
});
