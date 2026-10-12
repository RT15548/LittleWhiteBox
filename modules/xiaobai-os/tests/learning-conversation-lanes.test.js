import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';

const requestData = request => {
    const message = request.messages.find(entry => entry.role === 'user' && entry.content.includes('<learning_request>'));
    return message && JSON.parse(message.content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
};
const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
function until(h, predicate) {
    if (predicate(h.state())) { return Promise.resolve(); }
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { unsubscribe(); reject(new Error('Expected runtime state was not published')); }, 2000);
        const unsubscribe = h.bridge.subscribe(() => { if (predicate(h.state())) { clearTimeout(timeout); unsubscribe(); resolve(); } });
    });
}
async function send(h, action, input = {}) { return h.bridge.request(`learning/${action}`, { chatIdentity: h.state().chatIdentity, target: 'companion', ...input }); }

test('a learner can chat during preparation, and stopping the conversation does not stop that work', async t => {
    let releaseWork;
    const h = await createClassroomFixture(); t.after(() => { releaseWork?.(); return h.dispose(); });
    await h.command('teacher', { teacher: { name: '林老师', note: '' } });
    await h.command('settings', { value: {} });
    const workGate = new Promise(resolve => { releaseWork = resolve; });
    let workCalls = 0;
    h.flags.teacherResponse = (async request => {
        const data = requestData(request);
        if (data?.action.kind === 'prepare') {
            if (++workCalls === 1) { await workGate; return { toolCalls: [call('LearningLessonEdit', fixtureLesson)] }; }
            return { text: 'The article is ready.' };
        }
        assert.equal(request.tools.some(tool => ['LearningLessonEdit', 'LearningAssess', 'LearningComplete', 'LearningProfileEdit'].includes(tool.function.name)), false);
        return { text: 'Of course, we can talk while that is being prepared.' };
    });
    await send(h, 'prepare', { kind: 'lesson', message: 'Prepare a short lesson.' });
    await until(h, state => state.busy);
    await send(h, 'talk', { message: 'Can we chat meanwhile?' });
    await until(h, state => !state.chatBusy && state.conversation.turns.some(turn => turn.purpose === 'talk' && turn.status === 'finished'));
    assert.equal(h.state().busy, true);
    await send(h, 'cancel-chat');
    assert.equal(h.state().busy, true);
    releaseWork();
    await until(h, state => !state.busy);
    assert.equal(h.state().unit.title, fixtureLesson.title);
    assert.equal(h.state().conversation.turns.filter(turn => turn.status === 'finished').length, 1);
});




test('an explicit chat delegation is rejected while work is running, without queuing it', async t => {
    let release;
    const h = await createClassroomFixture(); t.after(() => { release?.(); return h.dispose(); });
    await h.openLesson();
    const gate = new Promise(resolve => { release = resolve; });
    let response;
    let workCalls = 0;
    let chatCalls = 0;
    h.flags.teacherResponse = (async request => {
        if (requestData(request)?.action.kind === 'prepare') { workCalls++; await gate; return { text: 'Preparation remains unchanged.' }; }
        if (++chatCalls === 1) { return { toolCalls: [call('LearningRequest', { task: 'Set the learner target to B2.' })] }; }
        response = JSON.parse(request.messages.findLast(entry => entry.role === 'tool' && entry.toolName === 'LearningRequest').content);
        return { text: 'That operation has not run while preparation is active.' };
    });
    const before = h.profile().goal.targetLevel;
    await send(h, 'prepare', { kind: 'lesson', message: 'Prepare this lesson.' });
    await until(h, state => state.busy);
    const native = await send(h, 'settings', { value: { targetLevel: 'C1' } });
    assert.equal(native.result.rejected, 'busy');
    assert.equal(h.profile().goal.targetLevel, before);
    await send(h, 'talk', { message: 'Set my target to B2.' });
    await until(h, state => !state.chatBusy);
    assert.deepEqual(response, { ok: false, status: 'busy' });
    release(); await until(h, state => !state.busy);
    assert.equal(h.profile().goal.targetLevel, before);
    assert.equal(workCalls, 1);
});

test('a quiet companion opportunity makes one request and leaves no message, unread turn or failed reply', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherResponse = () => ({ text: '' });
    const before = h.state().conversation.turns.length;
    const calls = h.counts.provider;
    await send(h, 'companion');
    await until(h, state => !state.companionBusy);
    assert.equal(h.counts.provider, calls + 1);
    assert.equal(h.state().conversation.turns.length, before);
    assert.equal(h.state().remark, null);
    assert.equal(h.state().chatMessage, '');
    assert.deepEqual(h.failures, []);
});
