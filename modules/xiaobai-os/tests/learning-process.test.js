import assert from 'node:assert/strict';
import test from 'node:test';
import { learningMessageView } from '../apps/learning/application/message-view.js';
import { learningProcessRounds } from '../apps/learning/ui/learning-process.js';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

const call = (id, name, args) => ({ id, name, arguments: JSON.stringify(args) });
test('research failures expose only an allowed category and HTTP status, never provider diagnostics', () => {
    for (const status of [401, 404, 429, 503]) {
        const view = learningMessageView({ role: 'tool', toolName: 'LearningExtract', content: JSON.stringify({ ok: false,
            error: 'learning_extract_http_failed', httpStatus: status, message: 'private proxy diagnostics', api_key: 'secret' }) });
        assert.deepEqual(JSON.parse(view.content), { error: 'learning_extract_http_failed', httpStatus: status, ok: false });
    }
    const view = learningMessageView({ role: 'tool', content: JSON.stringify({ ok: false, error: 'private credential in error', httpStatus: 401 }) });
    assert.deepEqual(JSON.parse(view.content), { ok: false });
});
test('the process retains completed and failed steps while another round is preparing, and after cancellation', () => {
    const secret = 'unpublished answer and private source text';
    const issue = { path: 'exercises.0.paragraphId', message: 'exercises.0.paragraphId: Select a paragraph in the article' };
    const messages = [
        { role: 'assistant', content: '', toolCalls: [call('read', 'LearningRead', { section: 'overview' })] },
        { role: 'tool', toolCallId: 'read', toolName: 'LearningRead', content: JSON.stringify({ section: 'overview', data: { goal: secret } }) },
        { role: 'assistant', content: '', toolCalls: [call('edit', 'LearningLessonEdit', { materials: [{ text: secret }], exercises: [{ prompt: secret }] })] },
        { role: 'tool', toolCallId: 'edit', toolName: 'LearningLessonEdit', content: JSON.stringify({ ok: false, errors: [issue] }) },
        { role: 'assistant', content: secret, contentVisibility: 'pending-response', streaming: true, toolCalls: [call('retry', 'LearningLessonEdit', { title: secret })] },
    ].map(learningMessageView);
    assert.ok(!JSON.stringify(messages).includes(secret));
    const turn = { status: 'running', messages };
    const rounds = learningProcessRounds(turn);
    assert.deepEqual(rounds.map(round => round.tools.map(tool => tool.status)), [['done'], ['failed'], ['preparing']]);
    assert.equal(rounds[0].tools[0].input.section, 'overview');
    assert.deepEqual(rounds[1].tools[0].result.errors, [issue]);
    assert.equal(rounds[2].text, '');
    assert.equal(rounds[2].receivedChars, secret.length);
    assert.deepEqual(learningProcessRounds({ ...turn, status: 'cancelled' }).flatMap(round => round.tools.map(tool => tool.status)), ['done', 'failed', 'not-run']);
    const started = [...messages, learningMessageView({ role: 'tool', toolCallId: 'retry', toolName: 'LearningLessonEdit', content: '', streaming: true })];
    assert.equal(learningProcessRounds({ status: 'cancelled', messages: started }).at(-1).tools[0].status, 'cancelled');
});

test('live rounds reach the view even when their general progress label has not changed', async t => {
    const h = await createClassroomFixture();
    t.after(h.dispose);
    await h.openLesson();
    const published = [];
    const off = h.bridge.subscribe(event => {
        if (event.type !== 'learning/state') { return; }
        const turn = event.payload.state.conversation.turns.at(-1);
        if (turn?.purpose === 'talk' && turn.progress?.stage === 'provider') { published.push(turn.progress.round); }
    });
    t.after(off);
    h.flags.teacherResponse = async (_request, round) => round < 3
        ? { toolCalls: [call(`read-${round}`, 'LearningRead', { section: round === 1 ? 'overview' : 'items' })] }
        : { text: '已查看你的学习情况。' };
    await h.command('talk', { message: '看看我最近的学习情况。' });
    assert.deepEqual([...new Set(published)], [1, 2, 3]);
    const turn = h.state().conversation.turns.at(-1);
    assert.equal(turn.status, 'finished');
    assert.deepEqual(learningProcessRounds(turn).flatMap(round => round.tools.map(tool => tool.status)), ['done', 'done']);
});
