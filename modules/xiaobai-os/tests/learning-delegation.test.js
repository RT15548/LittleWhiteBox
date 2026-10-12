import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { newLearningSchedule } from '../domains/learning/schedule.js';
import { shareLearningCourse } from '../apps/learning/application/course-sharing.js';

const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
const inputOf = request => JSON.parse(request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>'))
    .content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
const receipt = (request, name) => JSON.parse(request.messages.findLast(message => message.role === 'tool' && message.toolName === name).content);
const send = (h, action, args = {}) => h.bridge.request(`learning/${action}`, { chatIdentity: h.state().chatIdentity, target: 'companion', ...args });
async function until(check) {
    const deadline = Date.now() + 4000;
    while (!check()) { assert.ok(Date.now() < deadline, 'Expected asynchronous learning state'); await setImmediate(); }
}
function gate() {
    let release;
    const promise = new Promise(resolve => { release = resolve; });
    return { promise, release };
}

test('delegation returns before work finishes, remains queryable, and later starts one turn with latest conversation and records', async t => {
    const work = gate(); const chat = gate();
    const h = await createClassroomFixture(); t.after(() => { work.release(); chat.release(); return h.dispose(); }); await h.openLesson();
    const instruction = { task: 'Update the learning goal.', context: 'We agreed to focus on B2 reading.', deliverable: 'Save B2 as the target and report the change.' };
    let accepted; let lookup; let busyPresent; let notification; let workCalls = 0;
    h.flags.teacherResponse = async (request, round) => {
        const data = inputOf(request);
        if (data.delegation) {
            workCalls++;
            assert.deepEqual(data.delegation, instruction);
            if (round === 1) { await work.promise; return { toolCalls: [call('LearningProfileEdit', { goal: { targetLevel: 'B2' } })] }; }
            return { text: 'B2 target saved.' };
        }
        if (!accepted) {
            assert.equal(data.workbench.busy, round !== 1);
            assert.equal(Object.hasOwn(data.workbench, 'notice'), round !== 1);
            if (round === 1) { return { toolCalls: [call('LearningRequest', instruction)] }; }
            accepted = receipt(request, 'LearningRequest'); return { text: 'Sent; we can keep talking.' };
        }
        if (round === 1) {
            assert.equal(data.workbench.busy, true);
            assert.equal(data.workbench.tasks[0].taskId, accepted.taskId);
            return { toolCalls: [call('LearningTaskGet', { taskId: accepted.taskId }),
                call('LearningPresent', { kind: 'exercise', id: h.profile().unit.exercises[0].id })] };
        }
        if (round === 2) {
            lookup = receipt(request, 'LearningTaskGet'); busyPresent = receipt(request, 'LearningPresent');
            await chat.promise; return { toolCalls: [call('LearningTaskGet', { taskId: accepted.taskId })] };
        }
        assert.equal(data.workbench.busy, false);
        assert.equal(Object.hasOwn(data.workbench, 'notice'), false);
        assert.equal(data.workbench.tasks[0].status, 'finished');
        return { text: 'Let us talk about your holiday instead.' };
    };
    h.flags.notificationResponse = request => { notification = request; return { text: 'Your B2 goal is saved. Back to your holiday.' }; };
    await send(h, 'talk', { message: 'We agreed on B2; please update that.' });
    await until(() => accepted && !h.state().chatBusy);
    assert.equal(accepted.status, 'accepted'); assert.equal(h.state().workbenchBusy, true); assert.equal(workCalls, 1);
    await send(h, 'talk', { message: 'Is it still running? I also want to talk about my holiday.' });
    await until(() => lookup);
    assert.equal(lookup.tasks[0].status, 'running'); assert.equal(busyPresent.status, 'busy');
    work.release(); await until(() => h.state().delegatedTasks[0].status === 'finished');
    assert.equal(h.state().delegatedTasks[0].notification, 'pending'); assert.equal(notification, undefined);
    chat.release(); await until(() => h.state().delegatedTasks[0].notification === 'delivered');
    const data = inputOf(notification);
    assert.equal(data.workbench.busy, false); assert.equal(Object.hasOwn(data.workbench, 'notice'), false);
    assert.equal(data.action.kind, 'task-result'); assert.equal(data.taskResult.taskId, accepted.taskId);
    assert.deepEqual(data.taskResult.delegation, instruction); assert.equal(data.profile.profile.goal.targetLevel, 'B2');
    assert.ok(notification.messages.some(message => message.role === 'assistant' && message.content === 'Let us talk about your holiday instead.'));
    assert.equal(h.state().conversation.turns.at(-1).user, ''); assert.equal(h.state().remark, null);
    assert.equal(h.state().conversation.turns.filter(turn => turn.purpose === 'task-result').length, 1);
    assert.equal(workCalls, 2);
    h.flags.teacherResponse = request => {
        assert.ok(request.messages.some(message => message.role === 'assistant' && message.content === 'Your B2 goal is saved. Back to your holiday.'));
        return { text: 'We remember that.' };
    };
    await h.reenter(); await h.command('talk', { message: 'What was the result?' });
    assert.equal(h.state().delegatedTasks.length, 0);
    assert.deepEqual(h.failures, []);
});

test('stopping the companion leaves its accepted task running and the result still activates it', async t => {
    const work = gate(); const chat = gate();
    const h = await createClassroomFixture(); t.after(() => { work.release(); chat.release(); return h.dispose(); }); await h.openLesson();
    let chatting = false;
    h.flags.teacherResponse = async (request, round) => {
        if (inputOf(request).delegation) { await work.promise; return { text: 'Work finished.' }; }
        if (round === 1) { return { toolCalls: [call('LearningRequest', { task: 'Review the current lesson.' })] }; }
        chatting = true; await chat.promise; return { text: 'Cancelled draft.' };
    };
    await send(h, 'talk', { message: 'Review this.' }); await until(() => chatting);
    await send(h, 'cancel-chat');
    assert.equal(h.state().workbenchBusy, true);
    work.release(); await until(() => h.state().delegatedTasks[0].notification === 'delivered');
    chat.release(); await setImmediate();
    assert.equal(h.state().conversation.turns.at(-1).purpose, 'task-result');
    assert.ok(h.state().conversation.turns.every(turn => turn.teacher !== 'Cancelled draft.'));
});

for (const ending of ['failed', 'cancelled']) {
    test(`a ${ending} notification retries only delivery, including after a later user message`, async t => {
        t.mock.method(console, 'error', () => {});
        const notice = gate();
        const h = await createClassroomFixture(); t.after(() => { notice.release(); return h.dispose(); }); await h.openLesson();
        let deliveries = 0; let workCalls = 0;
        h.flags.teacherResponse = (request, round) => {
            if (inputOf(request).delegation) { workCalls++; return { text: 'Independent work result.' }; }
            return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Review this lesson.' })] } : { text: 'Delegated.' };
        };
        h.flags.notificationResponse = async () => {
            deliveries++;
            if (ending === 'failed') { throw new Error('Notification fixture unavailable'); }
            await notice.promise; return { text: 'Late notification.' };
        };
        await send(h, 'talk', { message: 'Review this.' }); await until(() => deliveries === 1);
        if (ending === 'cancelled') { await send(h, 'cancel-chat'); }
        await until(() => h.state().delegatedTasks[0].notification === 'failed');
        const task = h.state().delegatedTasks[0];
        assert.equal(task.status, 'finished'); assert.ok(task.notificationError);
        h.flags.teacherResponse = () => ({ text: 'Continuing ordinary chat.' });
        await h.command('talk', { message: 'I will ask something else first.' });
        assert.equal(deliveries, 1);
        h.flags.notificationResponse = request => { deliveries++; assert.equal(inputOf(request).taskResult.result.text, task.result.text); return { text: 'Delivered now.' }; };
        await send(h, 'retry-notification', { id: task.taskId });
        await until(() => h.state().delegatedTasks[0].notification === 'delivered');
        assert.equal(deliveries, 2); assert.equal(workCalls, 1);
        assert.equal(h.state().conversation.turns.filter(turn => turn.purpose === 'task-result').length, 1);
        assert.equal(h.state().conversation.turns.at(-1).purpose, 'task-result');
        notice.release(); await setImmediate();
        assert.equal(h.state().delegatedTasks[0].notification, 'delivered');
        await send(h, 'retry-notification', { id: task.taskId }); await setImmediate();
        assert.equal(deliveries, 2);
    });
}

for (const applied of [true, false]) {
    test(`an uncertain notification history write is not delivered until saved (write applied: ${applied})`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        let deliveries = 0; let workCalls = 0;
        h.flags.teacherResponse = (request, round) => {
            if (inputOf(request).delegation) { workCalls++; return { text: 'Work result.' }; }
            return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Review this lesson.' })] } : { text: 'Sent.' };
        };
        h.flags.notificationResponse = () => {
            deliveries++; h.flags.teacherReceiptLost = true; h.flags.teacherWriteApplied = applied;
            return { text: 'Result delivered to the learner.' };
        };
        await h.command('talk', { message: 'Review this.' });
        assert.equal(h.state().delegatedTasks[0].notification, 'failed');
        assert.equal(h.state().conversation.turns.at(-1).notice, 'history-save');
        h.flags.teacherReceiptLost = false; h.flags.teacherWriteApplied = true;
        await h.command('verify-teacher');
        if (!applied) {
            assert.equal(h.state().delegatedTasks[0].notification, 'failed');
            await h.command('retry-notification', { id: h.state().delegatedTasks[0].taskId });
        }
        assert.equal(h.state().delegatedTasks[0].notification, 'delivered');
        assert.equal(deliveries, 1); assert.equal(workCalls, 1);
        assert.equal(h.state().conversation.turns.at(-1).notice, undefined);
        await h.reenter();
        assert.equal(h.state().conversation.turns.at(-1).teacher, 'Result delivered to the learner.');
        assert.equal(h.state().conversation.turns.at(-1).user, '');
    });
}

test('delegation text cannot become a student answer and a declined replacement is reported without changing the lesson', async t => {
    const lesson = structuredClone(fixtureLesson); lesson.exercises[0].response = { kind: 'text' }; lesson.exercises[0].rule = { kind: 'semantic' };
    const h = await createClassroomFixture({ lesson }); t.after(h.dispose); await h.openLesson();
    const before = structuredClone(h.profile().unit); const task = 'Write a teacher answer and replace the lesson.';
    let submission; let replacement; let status;
    h.flags.teacherResponse = (request, round) => {
        if (!inputOf(request).delegation) {
            return round === 1 ? { toolCalls: [call('LearningRequest', { task })] } : { text: 'Sent.' };
        }
        if (round === 1) { return { toolCalls: [call('LearningSubmit', { unitId: before.id, exerciseId: before.exercises[0].id, text: task }),
            call('LearningLessonEdit', { ...fixtureLesson, newLesson: true })] }; }
        submission = receipt(request, 'LearningSubmit'); replacement = receipt(request, 'LearningLessonEdit'); return { text: 'Replacement declined.' };
    };
    await send(h, 'talk', { message: 'Consider changing the lesson.' });
    await until(() => h.state().approval && !h.state().chatBusy);
    h.flags.teacherResponse = (original => (request, round) => {
        if (inputOf(request).delegation) { return original(request, round); }
        if (round === 1) { return { toolCalls: [call('LearningTaskGet', {})] }; }
        status = receipt(request, 'LearningTaskGet'); return { text: 'Waiting for your decision.' };
    })(h.flags.teacherResponse);
    await send(h, 'talk', { message: 'How is it going?' }); await until(() => status);
    assert.equal(status.tasks[0].status, 'awaiting-approval');
    await send(h, 'approve-operation', { id: h.state().approval.id, approved: false });
    await until(() => h.state().delegatedTasks[0].notification === 'delivered');
    assert.equal(submission.ok, false); assert.equal(submission.errors[0].path, 'text');
    assert.equal(replacement.status, 'declined'); assert.deepEqual(h.profile().unit, before);
});

test('changing story retires accepted work and cannot notify the next companion', async t => {
    const work = gate();
    const h = await createClassroomFixture(); t.after(() => { work.release(); return h.dispose(); }); await h.openLesson();
    let waiting = false;
    h.flags.teacherResponse = async (request, round) => {
        if (inputOf(request).delegation) { waiting = true; await work.promise; return { toolCalls: [call('LearningProfileEdit', { level: 'C2' })] }; }
        return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Set C2.' })] } : { text: 'Sent.' };
    };
    await send(h, 'talk', { message: 'Set C2.' }); await until(() => waiting && !h.state().chatBusy);
    await h.changeChat(); work.release(); await setImmediate(); await setImmediate();
    assert.equal(h.state().delegatedTasks.length, 0); assert.notEqual(h.profile().level, 'C2');
    assert.equal(h.state().conversation.turns.length, 0);
    assert.deepEqual(h.failures, []);
});

test('stopping delegated work reports cancellation without waiting for a late provider response', async t => {
    const work = gate();
    const h = await createClassroomFixture(); t.after(() => { work.release(); return h.dispose(); }); await h.openLesson();
    let waiting = false;
    h.flags.teacherResponse = async (request, round) => {
        if (inputOf(request).delegation) { waiting = true; await work.promise; return { toolCalls: [call('LearningProfileEdit', { level: 'C2' })] }; }
        return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Set C2.' })] } : { text: 'Sent.' };
    };
    await send(h, 'talk', { message: 'Set C2.' }); await until(() => waiting && !h.state().chatBusy);
    await send(h, 'cancel-chat', { target: 'workbench' });
    await until(() => h.state().delegatedTasks[0].notification === 'delivered');
    assert.equal(h.state().delegatedTasks[0].status, 'cancelled');
    assert.notEqual(h.profile().level, 'C2');
    work.release(); await setImmediate();
    assert.equal(h.state().delegatedTasks[0].status, 'cancelled');
    assert.notEqual(h.profile().level, 'C2');
});

test('retrying cancelled work retires the old provider attempt without overwriting the new result', async t => {
    const work = gate();
    const h = await createClassroomFixture(); t.after(() => { work.release(); return h.dispose(); }); await h.openLesson();
    let waiting = false; let retried = false;
    h.flags.teacherResponse = async (request, round) => {
        if (inputOf(request).delegation) {
            if (!retried) { waiting = true; await work.promise; return { toolCalls: [call('LearningProfileEdit', { level: 'C2' })] }; }
            return round === 1 ? { toolCalls: [call('LearningProfileEdit', { level: 'B2' })] } : { text: 'Retry completed.' };
        }
        return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Update the agreed level.' })] } : { text: 'Sent.' };
    };
    await send(h, 'talk', { message: 'Update the level.' }); await until(() => waiting && !h.state().chatBusy);
    await send(h, 'cancel-chat', { target: 'workbench' });
    await until(() => h.state().delegatedTasks[0].notification === 'delivered');
    const taskId = h.state().delegatedTasks[0].taskId;
    const turn = h.state().workbenchConversation.turns.at(-1);
    retried = true; await h.command('retry-chat', { target: 'workbench', id: turn.id });
    assert.equal(h.profile().level, 'B2');
    const completed = h.state().delegatedTasks[0];
    assert.equal(completed.taskId, taskId); assert.equal(completed.status, 'finished'); assert.equal(completed.notification, 'delivered');
    work.release(); await setImmediate(); await setImmediate();
    assert.equal(h.profile().level, 'B2'); assert.deepEqual(h.state().delegatedTasks[0], completed);
});

test('delegated story text stays private in coursework and history; publishing one version releases only its coursework', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const instruction = { task: 'Use our shared experience to title this lesson.', context: 'STORY_A_PRIVATE_FACT' };
    h.flags.teacherResponse = (request, round) => inputOf(request).delegation
        ? round === 1 ? { toolCalls: [call('LearningLessonEdit', { title: instruction.context })] } : { text: instruction.context }
        : round === 1 ? { toolCalls: [call('LearningRequest', instruction)] } : { text: 'Sent.' };
    await h.command('talk', { message: 'Use our experience.' });
    const unit = h.profile().unit;
    const scope = { kind: 'story', osId: h.store.peekCurrent().osId };
    assert.equal(unit.title, instruction.context); assert.deepEqual(unit.scope, scope);
    assert.deepEqual(h.state().workbenchConversation.turns.at(-1).scope, scope);
    const commitId = h.repository.snapshot().document.commitId;
    const input = { language: 'en', unitId: unit.id, osId: scope.osId, commitId, approved: true };
    assert.throws(() => shareLearningCourse(h.repository, { ...input, approved: false }, () => true));
    assert.throws(() => shareLearningCourse(h.repository, { ...input, commitId: 'stale-version' }, () => true));
    assert.equal((await shareLearningCourse(h.repository, input, () => true)).status, 'confirmed');
    assert.equal(h.profile().unit.scope.kind, 'public');
    await h.changeChat();
    assert.equal(h.state().unit.title, instruction.context);
    assert.ok(h.state().workbenchConversation.turns.every(turn => turn.teacher !== instruction.context));
});

test('private delegated coursework is unavailable in another story without user publication', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherResponse = (request, round) => inputOf(request).delegation
        ? round === 1 ? { toolCalls: [call('LearningLessonEdit', { title: 'Private title' })] } : { text: 'Saved.' }
        : round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Use the private story in the title.' })] } : { text: 'Sent.' };
    await h.command('talk', { message: 'Retitle this.' });
    await h.changeChat();
    assert.equal(h.state().unit, null); assert.equal(h.state().blockedUnit, true);
});

test('course publication requires current consent and confirmed storage without publishing private answers', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit;
    h.flags.teacherResponse = (request, round) => inputOf(request).delegation
        ? round === 1 ? { toolCalls: [call('LearningLessonEdit', { title: 'Private course' })] } : { text: 'Saved.' }
        : round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Use this story.' })] } : { text: 'Sent.' };
    await h.command('talk', { message: 'Use our story.' });
    const input = { language: 'en', unitId: unit.id, osId: h.store.peekCurrent().osId,
        commitId: h.repository.snapshot().document.commitId, approved: true };
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.throws(() => shareLearningCourse(h.repository, input, () => true));
    const answers = structuredClone(h.profile().unit.attempts);
    const assessments = structuredClone(h.profile().unit.assessments);
    h.flags.userFailure = true;
    assert.equal((await shareLearningCourse(h.repository, { ...input, commitId: h.repository.snapshot().document.commitId }, () => true)).status, 'unconfirmed');
    assert.equal(h.profile().unit.scope.kind, 'story');
    h.confirmUser(); await h.command('verify');
    assert.equal(h.profile().unit.scope.kind, 'public');
    assert.deepEqual(h.profile().unit.attempts, answers); assert.deepEqual(h.profile().unit.assessments, assessments);
    await h.changeChat();
    assert.ok(h.state().unit); assert.equal(h.state().unit.attempts.length, 0);
});

test('a late result can be delivered but its retired target cannot redirect follow-up work to the new lesson', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const old = h.profile().unit.id; let notified = false; let childRuns = 0;
    h.flags.teacherResponse = (request, round) => {
        const data = inputOf(request);
        if (data.delegation) {
            if (data.delegation.task === 'child') { childRuns++; }
            return { text: 'Done.' };
        }
        if (round === 1) { return { toolCalls: [call('LearningRequest', { task: 'primary' })] }; }
        return { text: 'Sent.' };
    };
    h.flags.notificationResponse = async (request, round) => {
        const result = inputOf(request).taskResult;
        if (result.delegation.task === 'primary') {
            notified = true;
            if (round === 1) {
                const document = h.repository.snapshot().document; const data = structuredClone(document.data);
                data.profiles[0].unit.id = 'external-replacement';
                await h.repository.save(document, data, () => true);
                return { toolCalls: [call('LearningRequest', { task: 'child' })] };
            }
        }
        return { text: 'Result received.' };
    };
    await h.command('talk', { unitId: old, message: 'Work on this lesson.' });
    assert.equal(notified, true); assert.equal(childRuns, 0);
    const child = h.state().delegatedTasks.find(task => task.task === 'child');
    assert.equal(child.target.unitId, old); assert.equal(child.status, 'failed'); assert.equal(child.notification, 'delivered');
    assert.equal(h.profile().unit.id, 'external-replacement');
});

test('retrying a notification preserves its accepted follow-up receipt even after the child has finished', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const work = []; const receipts = []; let retrying = false;
    h.flags.teacherResponse = (request, round) => {
        const data = inputOf(request);
        if (data.delegation) { work.push(data.delegation.task); return { text: 'Completed.' }; }
        return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'primary' })] } : { text: 'Sent.' };
    };
    h.flags.notificationResponse = (request, round) => {
        if (inputOf(request).taskResult.delegation.task !== 'primary') { return { text: 'Child done.' }; }
        if (round === 1) { return { toolCalls: [call('LearningRequest', { task: 'child' })] }; }
        receipts.push(receipt(request, 'LearningRequest'));
        if (!retrying) { throw new Error('Notification interrupted after accepting child'); }
        return { text: 'Delivered.' };
    };
    await h.command('talk', { message: 'Do this.' });
    assert.deepEqual(work, ['primary', 'child']);
    const task = h.state().delegatedTasks.find(task => task.task === 'primary');
    assert.equal(task.notification, 'failed'); retrying = true;
    await h.command('retry-notification', { id: task.taskId });
    assert.deepEqual(work, ['primary', 'child']); assert.deepEqual(receipts[0], receipts[1]);
    assert.equal(h.state().delegatedTasks.length, 2);
    assert.equal(h.state().delegatedTasks.find(entry => entry.taskId === task.taskId).notification, 'delivered');
});

for (const fromNotification of [false, true]) {
    test(`a failed delegated task resumes its full request and updates the same task (notification origin: ${fromNotification})`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const instruction = { task: 'Set the agreed B2 goal.', context: 'We agreed on B2.', deliverable: 'Save the goal.' };
        let failed = false; let recovered;
        h.flags.teacherResponse = (request, round) => {
            const data = inputOf(request);
            if (data.delegation) {
                if (data.delegation.task === 'primary') { return { text: 'Primary done.' }; }
                if (!failed) { failed = true; throw new Error('Initial work interrupted'); }
                recovered = data.delegation;
                return round === 1 ? { toolCalls: [call('LearningProfileEdit', { goal: { targetLevel: 'B2' } })] } : { text: 'Saved B2.' };
            }
            return round === 1 ? { toolCalls: [call('LearningRequest', fromNotification ? { task: 'primary' } : instruction)] } : { text: 'Sent.' };
        };
        h.flags.notificationResponse = (request, round) => fromNotification && inputOf(request).taskResult.delegation.task === 'primary' && round === 1
            ? { toolCalls: [call('LearningRequest', instruction)] } : { text: 'Result received.' };
        await h.command('talk', { message: 'Do what we agreed.' });
        const task = h.state().delegatedTasks.find(task => task.task === instruction.task);
        const turn = h.state().workbenchConversation.turns.find(turn => turn.status === 'failed');
        assert.equal(task.status, 'failed'); assert.equal(turn.retryable, true);
        await h.command('retry-chat', { target: 'workbench', id: turn.id });
        assert.deepEqual(recovered, instruction); assert.equal(h.profile().goal.targetLevel, 'B2');
        const final = h.state().delegatedTasks.find(entry => entry.taskId === task.taskId);
        assert.equal(final.status, 'finished'); assert.equal(final.notification, 'delivered');
        assert.equal(h.state().delegatedTasks.filter(entry => entry.task === instruction.task).length, 1);
        assert.equal(h.state().workbenchConversation.turns.find(entry => entry.id === turn.id).status, 'finished');
    });
}

for (const replace of [false, true]) {
    test(`result follow-up retains the review target without touching the lesson (replacement: ${replace})`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const document = h.repository.snapshot().document; const data = structuredClone(document.data);
        const profile = data.profiles[0]; const lesson = structuredClone(profile.unit);
        profile.items = [{ id: 'review-item', label: 'shade', scope: lesson.scope, skill: 'vocabulary', evidence: [], schedule: newLearningSchedule('2026-01-01T00:00:00Z') }];
        const question = { ...fixtureLesson.exercises[0], key: 'review-question', skill: 'vocabulary', materialKeys: [], itemId: 'review-item' };
        profile.review = { ...lesson, id: 'review-original', kind: 'review', materials: [],
            exercises: [{ ...lesson.exercises[0], id: 'review-question', skill: 'vocabulary', materialIds: [], itemId: 'review-item' }] };
        await h.repository.save(document, data, () => true);
        let target;
        h.flags.teacherResponse = (request, round) => {
            const d = inputOf(request);
            if (d.delegation?.task === 'primary') {
                return replace && round === 1 ? { toolCalls: [call('LearningLessonEdit', { kind: 'review', newLesson: true,
                    title: 'Next review', goal: 'Recall shade.', exercises: [question] })] } : { text: 'Primary done.' };
            }
            if (d.delegation) {
                target = d.target;
                return round === 1 ? { toolCalls: [call('LearningLessonEdit', { title: 'Revised review' })] } : { text: 'Renamed.' };
            }
            return round === 1 ? { toolCalls: [call('LearningRequest', { task: 'primary' })] } : { text: 'Sent.' };
        };
        h.flags.notificationResponse = (request, round) => inputOf(request).taskResult.delegation.task === 'primary' && round === 1
            ? { toolCalls: [call('LearningRequest', { task: 'Rename the same review group.' })] } : { text: 'Done.' };
        await send(h, 'talk', { unitId: 'review-original', exerciseId: 'review-question', message: 'Review this group and rename it.' });
        if (replace) {
            await until(() => h.state().approval);
            await send(h, 'approve-operation', { id: h.state().approval.id, approved: true });
        }
        await until(() => h.state().delegatedTasks.length === 2 && h.state().delegatedTasks.every(task => task.notification === 'delivered'));
        assert.equal(target.unitKey, 'review'); assert.equal(target.unitId, h.profile().review.id);
        assert.equal(h.profile().review.title, 'Revised review'); assert.deepEqual(h.profile().unit, lesson);
        if (replace) { assert.notEqual(target.unitId, 'review-original'); assert.equal(target.exerciseId, undefined); }
    });
}

test('a delivered result is the published reply used for narration and its original exercise note', async t => {
    const spoken = [];
    const facade = { isEnabled: () => true,
        getVoices: () => ({ defaultVoice: 'fixture', voices: [{ id: 'fixture', available: true }] }),
        createPlayer: () => ({ activate: () => true, playNow: () => true, dispose() {}, setPlaybackRate: value => value }),
        synthesize: async text => { spoken.push(text); return new Blob(['fixture']); }, openSettings() {} };
    const h = await createClassroomFixture({ getTtsFacade: () => facade }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const exerciseId = unit.exercises[0].id;
    h.flags.teacherResponse = (request, round) => inputOf(request).delegation ? { text: 'Work result.' }
        : round === 1 ? { toolCalls: [call('LearningRequest', { task: 'Explain this question.' })] } : { text: 'Sent.' };
    const result = 'The completed explanation.';
    h.flags.notificationResponse = () => ({ text: result });
    await h.command('talk', { unitId: unit.id, exerciseId, message: 'Explain this question.' });
    const reply = h.state().companionReply;
    assert.equal(reply.id, h.state().conversation.turns.at(-1).id); assert.equal(reply.text, result);
    await h.command('say-reply', { id: reply.id }); assert.deepEqual(spoken, [result]);
    await h.command('save-note', { id: reply.id, unitId: unit.id });
    assert.deepEqual(h.profile().unit.notes.map(note => [note.exerciseId, note.text]), [[exerciseId, result]]);
});
