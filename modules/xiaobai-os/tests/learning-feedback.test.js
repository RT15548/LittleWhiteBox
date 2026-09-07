import assert from 'node:assert/strict';
import test from 'node:test';
import { createLearningTeaching } from '../apps/learning/application/teaching.js';
import { runLearningProviderLoop } from '../apps/learning/agent/provider-loop.js';
import { reportLearningFailure } from '../apps/learning/application/feedback.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

// Failures are injected at context/provider/storage boundaries; real profile tools still validate and save.
const privateText = 'PRIVATE_PROMPT_AND_API_KEY';
const classroom = { language: 'en', osId: 'story', chatIdentity: 'chat', teacher: { name: 'Teacher', note: '' } };
const context = { teacherDetails: privateText, snapshot: { player: {}, characters: [], storyEvents: '', recentMessages: [], worldInfo: {} } };
const profile = { explanationLanguage: 'zh-CN', selfAssessment: '初学', goal: { description: '读懂新闻' } };
const call = (name, args = {}) => ({ id: name, name, arguments: JSON.stringify(args) });
const fault = () => Object.assign(new TypeError(privateText), { status: 400, response: privateText, headers: { authorization: privateText } });

async function setup(mode) {
    let file = null; let requests = 0; let writes = 0;
    const progress = [];
    const repository = createLearningRepository({ read: async () => file, replace: async (_name, value) => { writes++; file = value; } }, {
        createId: () => { if (mode === 'save') { throw fault(); } return 'saved-1'; },
    });
    await repository.read();
    const teaching = createLearningTeaching({ repository, current: () => classroom, onProgress: value => progress.push(value),
        capture: async () => { if (mode === 'context') { throw fault(); } return context; },
        gateway: {
            loadConfig: async () => { if (mode === 'config') { throw fault(); } return {}; },
            openSession: async () => {
                if (mode === 'session') { throw fault(); }
                return { providerConfig: {}, supportsSessionToolLoop: false, run: async () => {
                    requests++;
                    if (mode === 'provider') { throw fault(); }
                    if (mode === 'protocol') { return null; }
                    if (mode === 'unknown') { return { toolCalls: [call('NotProvided')] }; }
                    if (mode === 'limit') { return { toolCalls: Array.from({ length: 17 }, () => call('LearningRead')) }; }
                    if (mode === 'cancel') { teaching.cancel(); throw fault(); }
                    if (requests === 1) { return { toolCalls: [call('LearningProfileEdit', mode === 'invalid' || mode === 'corrected' ? {} : profile)] }; }
                    if (mode === 'corrected' && requests === 2) { return { toolCalls: [call('LearningProfileEdit', profile)] }; }
                    return { text: '已记住你的目标。' };
                } };
            },
        },
    });
    return { teaching, progress, repository, counts: () => ({ requests, writes }) };
}

test('profile failures identify their stage, log one bounded diagnostic and never publish incomplete goals', async t => {
    for (const [mode, reason, stage, tool] of [
        ['context', 'learning_context_failed', 'context'], ['config', 'learning_config_failed', 'config'],
        ['session', 'learning_session_failed', 'session'], ['provider', 'provider-request', 'provider'],
        ['protocol', 'learning_protocol_failed', 'provider'], ['unknown', 'learning_stalled', 'tools', 'NotProvided'],
        ['limit', 'learning_stalled', 'tools', 'LearningRead'], ['invalid', 'learning_unresolved_proposals', 'tools'],
        ['save', 'learning_save_failed', 'save'],
    ]) {
        await t.test(mode, async sub => {
            const logs = sub.mock.method(console, 'error', () => {});
            const h = await setup(mode);
            const result = await h.teaching.run({ action: { kind: 'profile' }, message: privateText });
            assert.equal(result.status, 'failed'); assert.equal(result.reason, reason);
            assert.ok(result.message.includes(reason));
            assert.equal(logs.mock.calls.length, 1);
            const diagnostic = logs.mock.calls[0].arguments[1];
            assert.equal(diagnostic.action, 'profile'); assert.equal(diagnostic.stage, stage);
            if (tool) { assert.equal(diagnostic.tool, tool); assert.equal(diagnostic.round, 3); }
            if (mode === 'provider') { assert.equal(diagnostic.httpStatus, 400); }
            if (mode === 'invalid') {
                assert.ok(diagnostic.issues.some(issue => issue.path === 'profile.explanationLanguage' && issue.rule.includes('non-empty')));
            }
            assert.ok(!JSON.stringify([result, logs.mock.calls.map(call => call.arguments)]).includes(privateText));
            assert.equal(h.repository.snapshot().document, null); assert.equal(h.counts().writes, 0);
            if (['context', 'config', 'session'].includes(mode)) { assert.equal(h.counts().requests, 0); }
        });
    }
});

test('tool execution failures keep tool, round and safe source locations without logging raw arguments or errors', async t => {
    const logs = t.mock.method(console, 'error', () => {});
    const cause = fault();
    cause.stack = `TypeError: ${privateText}\n    at run (https://user:password@example.com/private/teaching.ts:42:7?key=${privateText})`;
    const outcome = await runLearningProviderLoop({ systemPrompt: privateText, messages: [], tools: [{ function: { name: 'LearningRead' } }],
        signal: new AbortController().signal, guard: () => true,
        agent: { providerConfig: {}, supportsSessionToolLoop: false, run: async () => ({ toolCalls: [call('LearningRead', { privateText })] }) },
        executeTool: () => { throw cause; },
    });
    assert.equal(outcome.reason, 'learning_tool_failed');
    const message = reportLearningFailure('profile', outcome.reason, outcome.details);
    const diagnostic = logs.mock.calls[0].arguments[1];
    assert.equal(diagnostic.stage, 'tools'); assert.equal(diagnostic.tool, 'LearningRead'); assert.equal(diagnostic.round, 1);
    assert.equal(diagnostic.errorName, 'TypeError'); assert.deepEqual(diagnostic.locations, ['teaching.ts:42:7']);
    const output = JSON.stringify([message, logs.mock.calls[0].arguments]);
    for (const secret of [privateText, 'password', 'example.com', 'authorization']) { assert.ok(!output.includes(secret)); }
});

test('corrected proposals and cancellation do not emit terminal failure logs or retain stale progress', async t => {
    const logs = t.mock.method(console, 'error', () => {});
    const h = await setup('corrected');
    assert.equal((await h.teaching.run({ action: { kind: 'profile' }, message: '开始' })).status, 'finished');
    assert.equal(h.repository.snapshot().document.data.profiles[0].goal.description, profile.goal.description);
    assert.deepEqual(h.progress.map(value => value.stage), ['context', 'config', 'session', 'provider', 'tools', 'provider', 'tools', 'provider', 'save']);
    const cancelled = await setup('cancel');
    assert.equal((await cancelled.teaching.run({ action: { kind: 'profile' }, message: '开始' })).status, 'cancelled');
    assert.equal(cancelled.counts().writes, 0); assert.equal(logs.mock.calls.length, 0);
});

test('classroom publishes real progress, exposes the error code and allows explicit retry with no automatic requests', async t => {
    const logs = t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.command('teacher', { teacher: { name: 'Teacher', note: '' } });
    const states = [];
    const unsubscribe = h.bridge.subscribe(event => { if (event.type === 'learning/state') { states.push(event.payload.state); } });
    t.after(unsubscribe);
    h.flags.providerFailure = true;
    const failed = await h.command('profile', { message: '高中基础，希望读懂新闻。' });
    assert.equal(failed.busy, false); assert.equal(failed.profile, null);
    assert.ok(failed.message.includes('provider-auth')); assert.equal(logs.mock.calls.length, 1);
    assert.ok(states.some(state => state.busy && state.message.includes('读取教学背景')));
    assert.ok(states.some(state => state.busy && state.message.includes('等待老师回复')));
    assert.equal(h.counts.provider, 1);
    h.flags.providerFailure = false;
    const retried = await h.command('profile', { message: '高中基础，希望读懂新闻。' });
    assert.ok(retried.profile); assert.equal(retried.busy, false); assert.equal(retried.message, '');
    assert.equal(logs.mock.calls.length, 1); assert.deepEqual(h.failures, []);
});

// Browser contract: LAN HTTP exposes getRandomValues but not randomUUID.
// Use production ID creation through the full classroom, including confirmed file saves.
test('LAN HTTP can save a profile, prepare, answer, keep a note and finish a lesson', async t => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues } });
    t.after(() => Object.defineProperty(globalThis, 'crypto', original));
    const h = await createClassroomFixture(); t.after(h.dispose);
    const opened = await h.openLesson();
    assert.equal(opened.storage, 'ready');
    assert.ok(opened.profile); assert.ok(opened.unit);
    const unit = h.profile().unit;
    await h.command('explain', { exerciseId: unit.exercises[0].id, message: '请解释这段话。' });
    await h.command('save-note');
    assert.equal(h.profile().unit.notes.length, 1);
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.profile().unit.attempts.length, 1);
    const completed = await h.command('complete');
    assert.equal(completed.storage, 'ready');
    assert.equal(h.profile().completions.length, 1);
    assert.deepEqual(h.failures, []);
    const saved = h.repository.snapshot().document;
    await h.reenter();
    assert.deepEqual(h.repository.snapshot().document, saved);
});
