import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { createLearningService } from '../apps/learning/application/service.js';

const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
const data = request => JSON.parse(request.messages.findLast(entry => entry.role === 'user' && entry.content.includes('<learning_request>'))
    .content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
const article = () => call('LearningArticle', { title: fixtureLesson.title, goal: fixtureLesson.goal,
    tier: 'short', kind: 'authored', text: fixtureLesson.materials[0].text });
const notes = () => call('LearningReadingNotes', { explanations: ['p2', 'p1'].map(paragraphId => ({
    paragraphId, explanation: '留意作者如何展开观点。', terms: [] })) });
async function until(check) {
    const deadline = Date.now() + 3000;
    while (!check()) { assert.ok(Date.now() < deadline, 'Expected preparation state'); await setImmediate(); }
}
const send = (h, name, input = {}) => h.bridge.request(`learning/${name}`, { chatIdentity: h.state().chatIdentity, ...input });
async function setup(t, options) {
    const h = await createClassroomFixture(options); t.after(h.dispose);
    await h.command('settings', { value: { level: 'B1', targetLevel: 'B2' } });
    return h;
}

test('missing research configuration offers a choice before any model request; chatting remains available', async t => {
    const h = await setup(t);
    await h.command('prepare', { kind: 'reading-writing', message: '开始读写。' });
    assert.equal(h.counts.provider, 0); assert.equal(h.state().sourceChoice, 'unconfigured');
    await h.command('talk', { target: 'workbench', message: '你好。' });
    assert.ok(h.counts.provider > 0); assert.equal(h.profile().unit, null);
    await h.command('dismiss-source'); assert.equal(h.state().sourceChoice, null);
});

test('one preparation task carries the original request through article, notes and essay; saved content is usable before the reply', async t => {
    const h = await setup(t, { agentConfig: { tavilyApiKey: 'fixture-no-network' } });
    const message = '写公园主题，用英文讲解，作文只要一百词。';
    let release; const gate = new Promise(resolve => { release = resolve; }); t.after(() => release());
    let rounds = 0;
    h.flags.teacherResponse = async (request, round) => {
        assert.equal(data(request).action.kind, 'prepare');
        assert.ok(request.messages.some(entry => entry.content.includes(message)));
        rounds++;
        if (round === 1) { return { toolCalls: [article()] }; }
        if (round === 2) { await gate; return { toolCalls: [notes()] }; }
        if (round === 3) { return { toolCalls: [call('LearningEssayTask', { prompt: 'Explain your view in 100 words.' })] }; }
        return { text: '准备好了。' };
    };
    await send(h, 'prepare', { kind: 'reading-writing', message });
    await until(() => h.state().unit && rounds === 2);
    const unit = h.profile().unit;
    assert.equal(unit.exercises.length, 2);
    const service = createLearningService(h.repository);
    await service.prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: unit.exercises[0].id,
        answer: { kind: 'text', text: 'Trees give shade.' }, scope: unit.scope, osId: unit.originOsId,
        replays: 0, slowPlayback: false }).save(() => true);
    release(); await until(() => !h.state().preparation?.running);
    assert.equal(h.profile().unit.id, unit.id);
    assert.equal(h.profile().unit.attempts.length, 1);
    assert.equal(h.profile().unit.explanations.length, 2);
    assert.equal(h.state().unit.preparation.ready, true);
    assert.equal(h.requests.length, 4);
});

test('a later preparation failure preserves article and notes; continuing fills missing work without replacing them', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await setup(t, { agentConfig: { tavilyApiKey: 'fixture-no-network' } });
    h.flags.teacherResponse = (_request, round) => {
        if (round === 1) { return { toolCalls: [article(), notes()] }; }
        throw Object.assign(new Error('fixture'), { status: 503 });
    };
    await h.command('prepare', { kind: 'reading-writing', message: '请准备读写。' });
    const before = structuredClone(h.profile().unit);
    assert.equal(before.explanations.length, 2);
    h.flags.teacherResponse = (_request, round) => round === 1
        ? { toolCalls: [call('LearningEssayTask', { prompt: 'Give your own view.' })] } : { text: '题目补好了。' };
    await h.command('resume-preparation', { unitId: before.id });
    assert.equal(h.profile().unit.id, before.id);
    assert.deepEqual(h.profile().unit.materials, before.materials);
    assert.deepEqual(h.profile().unit.explanations, before.explanations);
    assert.equal(h.state().unit.preparation.ready, true);
});

test('stopping after article publication retains the article but rejects late tool work', async t => {
    const h = await setup(t, { agentConfig: { tavilyApiKey: 'fixture-no-network' } });
    let release; const gate = new Promise(resolve => { release = resolve; }); t.after(() => release());
    let waiting = false;
    h.flags.teacherResponse = async (_request, round) => {
        if (round === 1) { return { toolCalls: [article()] }; }
        waiting = true; await gate; return { toolCalls: [notes()] };
    };
    await send(h, 'prepare', { kind: 'reading-writing', message: '准备。' });
    await until(() => waiting);
    const before = structuredClone(h.profile().unit);
    await send(h, 'cancel-preparation'); release(); await setImmediate();
    assert.deepEqual(h.profile().unit, before);
    assert.equal(h.state().preparation.running, false);
});
