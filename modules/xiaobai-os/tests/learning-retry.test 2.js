import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

const data = request => JSON.parse(request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>'))
    .content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
const conversation = (h, target) => h.state()[target === 'companion' ? 'conversation' : 'workbenchConversation'];
const send = (h, name, input) => h.bridge.request(`learning/${name}`, { chatIdentity: h.state().chatIdentity, ...input });
async function until(check) {
    const deadline = Date.now() + 2500;
    while (!check()) { assert.ok(Date.now() < deadline, 'Expected state was not published'); await setImmediate(); }
}

for (const target of ['companion', 'workbench']) {
    test(`${target} retries the exact quoted request in place, without duplicate messages or learning writes`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const unit = h.state().unit;
        const paragraph = unit.materials[0].paragraphs[0];
        const selection = { materialId: unit.materials[0].id, paragraphId: paragraph.id, start: 0, end: 6, quote: paragraph.text.slice(0, 6) };
        const inputs = [];
        let userCount;
        h.flags.teacherResponse = request => {
            inputs.push(data(request));
            if (inputs.length === 1) { userCount = request.messages.filter(entry => entry.role === 'user').length; throw Object.assign(new Error('offline failure'), { status: 503 }); }
            assert.equal(request.messages.filter(entry => entry.role === 'user').length, userCount);
            return { text: 'A tree means one tree.' };
        };
        const writes = h.counts.userWrites;
        await h.command('talk', { target, message: 'What does this mean?', unitId: unit.id, selection });
        const failed = conversation(h, target).turns.at(-1);
        const length = conversation(h, target).turns.length;
        assert.equal(failed.status, 'failed'); assert.equal(failed.retryable, true);
        await h.command('retry-chat', { target, id: failed.id });
        assert.equal(inputs.length, 2);
        assert.deepEqual(inputs[1].selection, inputs[0].selection);
        assert.deepEqual(inputs[1].action, inputs[0].action);
        assert.equal(conversation(h, target).turns.length, length);
        const reply = conversation(h, target).turns.at(-1);
        assert.equal(reply.id, failed.id); assert.equal(reply.user, failed.user);
        assert.equal(reply.status, 'finished'); assert.equal(reply.retryable, false);
        assert.equal(h.counts.userWrites, writes);
        const calls = h.counts.provider;
        await h.command('retry-chat', { target, id: failed.id });
        assert.equal(h.counts.provider, calls);
        await h.reenter();
        assert.equal(conversation(h, target).turns.filter(turn => turn.id === failed.id).length, 1);
    });
}

test('a stopped chat can retry while late output and duplicate retry clicks cannot replace the new reply', async t => {
    let release;
    const h = await createClassroomFixture(); t.after(() => { release?.(); return h.dispose(); }); await h.openLesson();
    const gate = new Promise(resolve => { release = resolve; });
    let calls = 0;
    h.flags.teacherResponse = async () => {
        const call = ++calls;
        await gate;
        return { text: call === 1 ? 'Late cancelled reply' : 'New reply' };
    };
    await send(h, 'talk', { target: 'companion', message: 'Hello' });
    await until(() => calls === 1);
    await h.command('cancel-chat', { target: 'companion' });
    const cancelled = h.state().conversation.turns.at(-1);
    assert.equal(cancelled.retryable, true);
    await send(h, 'retry-chat', { target: 'companion', id: cancelled.id });
    await until(() => calls === 2);
    const duplicate = await send(h, 'retry-chat', { target: 'companion', id: cancelled.id });
    assert.equal(duplicate.result.rejected, 'busy');
    release(); await until(() => !h.state().chatBusy);
    assert.equal(calls, 2);
    assert.equal(h.state().conversation.turns.at(-1).teacher, 'New reply');
});

test('changing the article or language retires the old retry rather than applying its quotation to new content', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.providerFailure = true;
    await h.command('talk', { message: 'Explain this article.' });
    const failed = h.state().conversation.turns.at(-1);
    h.flags.providerFailure = false;
    await h.command('abandon');
    const calls = h.counts.provider;
    await h.command('retry-chat', { target: 'companion', id: failed.id });
    assert.equal(h.counts.provider, calls);
    await h.command('language', { language: 'de' });
    await h.command('retry-chat', { target: 'companion', id: failed.id });
    assert.equal(h.counts.provider, calls);
});

for (const target of ['companion', 'workbench']) {
    test(`${target} chat retry does not wait for or stop a workbench task`, async t => {
        let release;
        const h = await createClassroomFixture(); t.after(() => { release?.(); return h.dispose(); }); await h.openLesson();
        h.flags.providerFailure = true;
        await h.command('talk', { target, message: 'Hello' });
        const failed = conversation(h, target).turns.at(-1);
        h.flags.providerFailure = false;
        const gate = new Promise(resolve => { release = resolve; });
        let working = false;
        h.flags.teacherResponse = async request => {
            if (data(request).action.kind === 'prepare') { working = true; await gate; }
            return { text: 'Ready.' };
        };
        await send(h, 'prepare', { kind: 'lesson', message: 'Prepare a lesson.' }); await until(() => working);
        await send(h, 'retry-chat', { target, id: failed.id });
        await until(() => conversation(h, target).turns.find(turn => turn.id === failed.id)?.status === 'finished');
        assert.equal(h.state().busy, true);
        release(); await until(() => !h.state().busy);
    });
}

test('an unknown chat-save receipt keeps the reply and cannot offer or execute a model retry', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherReceiptLost = true;
    await h.command('talk', { message: 'Hello' });
    const turn = h.state().conversation.turns.at(-1);
    assert.equal(turn.status, 'finished'); assert.equal(turn.notice, 'history-save'); assert.equal(turn.retryable, false);
    const calls = h.counts.provider;
    await h.command('retry-chat', { target: 'companion', id: turn.id });
    assert.equal(h.counts.provider, calls);
    assert.equal(h.state().conversation.turns.at(-1).teacher, turn.teacher);
});

test('stopped original preparation offers retry and preserves the source without requiring web configuration', async t => {
    let release;
    const h = await createClassroomFixture(); t.after(() => { release?.(); return h.dispose(); });
    await h.command('settings', { value: {} });
    const gate = new Promise(resolve => { release = resolve; });
    let started = false;
    h.flags.teacherResponse = async () => { started = true; await gate; return { text: 'Late text' }; };
    await h.command('prepare', { kind: 'reading-writing', message: 'Start reading.' });
    await send(h, 'choose-original', {}); await until(() => started);
    await h.command('cancel-preparation');
    assert.equal(h.state().sourceChoice, 'unavailable');
    assert.equal(h.state().preparation.source, 'authored');
    release(); await setImmediate();
    const actions = [];
    h.flags.teacherResponse = request => { actions.push(data(request).action); return { text: 'No article yet.' }; };
    await h.command('retry-source');
    assert.equal(actions.length, 1); assert.equal(actions[0].source, 'authored');
    assert.equal(h.state().sourceChoice, 'unavailable');
});
