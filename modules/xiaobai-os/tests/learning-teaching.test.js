import assert from 'node:assert/strict';
import test from 'node:test';
import { createLearningTeaching } from '../apps/learning/application/teaching.js';
import { createLearningService } from '../apps/learning/application/service.js';
import { createLearningPractice } from '../apps/learning/application/practice.js';
import { createLearningSession } from '../apps/learning/agent/session.js';
import { buildLearningContext } from '../apps/learning/agent/context.js';
import { createLearningBackground } from '../apps/learning/agent/background.js';
import { createLearningContextAdapter } from '../apps/learning/host/context-adapter.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import { createLearningSourceRegistry } from '../apps/learning/materials/lesson-sources.js';
import { createLearningResearch } from '../apps/learning/materials/research.js';
import { runLearningProviderLoop } from '../apps/learning/agent/provider-loop.js';
import { safePromptJson } from '../capabilities/maintenance/prompt-safety.js';

const prices = { short: 17, regular: 29, deep: 41 }; // Protocol fixture, not a pricing decision.
const action = { kind: 'prepare', replaceCurrent: false, prices };
const classroom = { language: 'en', osId: 'story-a', chatIdentity: 'chat-a', teacher: { name: '林老师', note: '说话温和' } };
const context = { teacherDetails: '你们一起走过溪谷。', snapshot: {
    player: { displayName: '玩家', persona: '' }, characters: [], storyEvents: '共同记忆：溪谷漫步', recentMessages: [],
    worldInfo: { before: '溪谷世界观', after: '', depth: [] },
} };
const config = { tavilyApiKey: 'fixture-key', tavilyBaseUrl: 'https://tavily.example.com' };
const call = (name, args, id = name) => ({ id, name, arguments: JSON.stringify(args) });
const lesson = (materials = [{ key: 'article', title: '短文', kind: 'authored', text: 'Trees cool streets.' }]) => ({
    title: '概括一篇短文', goal: '用一句话概括主要观点', tier: 'short', materials,
    exercises: [{ key: 'q', skill: 'writing', materialKeys: ['article'], prompt: 'Summarise the main point.', response: { kind: 'text' }, rule: { kind: 'semantic' } }],
});
function results(request) {
    return request.toolResponses ?? request.messages.filter(message => message.role === 'tool').map(message => ({ name: message.toolName, response: JSON.parse(message.content) }));
}
async function harness(handler, { session = false, search = false } = {}) {
    let file = null;
    let id = 0;
    let failWrite = false;
    let held = null;
    let current = structuredClone(classroom);
    let captures = 0;
    const requests = [];
    const files = { read: async () => structuredClone(file), replace: async (_name, value) => {
        if (failWrite) { held = value; throw new Error('private write response'); }
        file = structuredClone(value);
    } };
    const createId = () => `id-${++id}`;
    const now = () => '2026-09-06T09:00:00.000Z';
    const repository = createLearningRepository(files, { createId });
    await repository.read();
    const profile = createLearningSession(repository, { language: 'en', osId: 'story-a', inputScope: { kind: 'public' }, action: { kind: 'profile' }, createId, now });
    assert.equal(profile.executeTool('LearningProfileEdit', { explanationLanguage: 'zh-CN', selfAssessment: '初学', goal: { description: '阅读和表达' } }).ok, true);
    await profile.commit(() => true);
    const teaching = createLearningTeaching({ repository, createId, now, current: () => current,
        capture: async () => { captures++; return structuredClone(context); }, gateway: {
            loadConfig: async () => search ? config : {}, openSession: async () => ({ providerConfig: {}, supportsSessionToolLoop: session,
                run: async request => { requests.push(structuredClone({ ...request, signal: undefined })); return handler(request, requests.length); } }),
        } });
    const read = () => repository.snapshot().document.data.profiles[0];
    return { repository, teaching, requests, read, now, createId, captures: () => captures,
        current: () => current, setCurrent: value => { current = value; },
        interruptSave: () => { failWrite = true; }, confirmSave: () => { file = held; failWrite = false; },
        reopen: () => createLearningRepository(files).read() };
}

for (const session of [false, true]) {
    test(`one character teacher searches, extracts and saves the actual article (${session ? 'session' : 'ordinary'} continuation)`, async t => {
        const http = [];
        t.mock.method(globalThis, 'fetch', async (url, options) => {
            http.push({ url, body: JSON.parse(options.body) });
            return Response.json(url.endsWith('/search') ? { results: [{ title: 'Urban trees', url: 'https://www.bbc.com/trees', content: 'A search summary, not the article.' }] }
                : { results: [{ url: 'https://www.bbc.com/trees', raw_content: 'Trees cool streets.\n\nThey provide shade.' }] });
        });
        const h = await harness((request, round) => {
            if (round === 1) {
                const data = request.messages.map(message => message.content).join('\n');
                assert.ok(data.includes('林老师') && data.includes('你们一起走过溪谷'));
                assert.ok(request.tools.some(tool => tool.function.name === 'LearningSearch'));
                return { toolCalls: [call('LearningSearch', { query: 'BBC urban trees beginner reading', maxResults: 2 })] };
            }
            if (round === 2) {
                const found = results(request).find(result => result.name === 'LearningSearch').response;
                assert.equal(found.ok, true);
                return { toolCalls: [call('LearningExtract', { candidateIds: [found.results[0].id] })] };
            }
            if (round === 3) {
                const source = results(request).find(result => result.name === 'LearningExtract').response.results[0];
                assert.equal(source.paragraphs[0].text, 'Trees cool streets.');
                return { toolCalls: [call('LearningLessonEdit', lesson([{ key: 'article', title: '节选', kind: 'original', sourceId: source.sourceId, from: 1, through: 1 }]))] };
            }
            assert.equal(results(request).find(result => result.name === 'LearningLessonEdit').response.ok, true);
            return { text: '来练习抓住文章的主要观点。' };
        }, { session, search: true });
        assert.equal(h.requests.length, 0);
        const result = await h.teaching.run({ action, message: '找篇适合我的 BBC 短文。' });
        assert.equal(result.status, 'finished', JSON.stringify(result));
        assert.deepEqual(result.appliedTools, ['LearningLessonEdit']);
        assert.deepEqual(http.map(request => request.url), ['https://tavily.example.com/search', 'https://tavily.example.com/extract']);
        assert.equal(http[0].body.query, 'BBC urban trees beginner reading');
        assert.equal(h.captures(), 1);
        assert.equal(h.read().unit.materials[0].paragraphs[0].text, 'Trees cool streets.');
        assert.equal(h.read().unit.materials[0].provenance.kind, 'original');
        assert.equal((await h.reopen()).document.data.profiles[0].unit.id, h.read().unit.id);
        if (session) { assert.deepEqual(h.requests[1].messages, []); }
        else { assert.ok(h.requests[1].messages.some(message => message.role === 'assistant' && message.tool_calls)); }
    });
}

for (const outcome of ['confirmed', 'unconfirmed', 'failed', 'cancelled']) {
    test(`teacher presentation is published only after confirmed teaching (${outcome})`, async () => {
        let step = 0;
        const h = await harness(request => {
            if (++step === 1) { return { toolCalls: [call('LearningLessonEdit', lesson())] }; }
            if (step === 2) {
                const id = results(request).find(entry => entry.name === 'LearningLessonEdit').response.ids.at(-1);
                return { toolCalls: [call('LearningPresent', { kind: 'exercise', id })] };
            }
            if (outcome === 'failed') { throw Object.assign(new Error('fixture'), { status: 401 }); }
            if (outcome === 'cancelled') { h.teaching.cancel(); }
            assert.equal(h.teaching.conversation().turns.length, 0);
            assert.equal(h.read().unit, null);
            return { text: '试试用自己的话表达。' };
        });
        if (outcome === 'unconfirmed') { h.interruptSave(); }
        const result = await h.teaching.run({ action: { kind: 'talk' }, message: '开始学习。' });
        assert.equal(result.status, outcome === 'confirmed' ? 'finished' : outcome);
        const turns = h.teaching.conversation().turns;
        if (outcome === 'confirmed') {
            assert.equal(turns.at(-1).presentation.id, h.read().unit.exercises[0].id);
            assert.equal(turns.at(-1).presentation.unitId, h.read().unit.id);
        } else {
            assert.equal(turns.length, 0);
            assert.equal(h.read().unit, null);
            if (outcome === 'unconfirmed') {
                h.confirmSave(); await h.repository.verify();
                assert.ok(h.read().unit);
                const calls = h.requests.length;
                assert.equal(h.teaching.recoverConfirmed().result.text, '试试用自己的话表达。');
                assert.equal(h.teaching.conversation().turns.at(-1).presentation.id, h.read().unit.exercises[0].id);
                assert.equal(h.teaching.recoverConfirmed(), null);
                assert.equal(h.requests.length, calls);
            }
        }
    });
}

test('a conversational answer and feedback publish together; provider failure leaves the previous lesson intact', async () => {
    let phase = 'prepare'; let step = 0; let original;
    const h = await harness(request => {
        if (phase === 'prepare') { return ++step === 1 ? { toolCalls: [call('LearningLessonEdit', lesson())] } : { text: 'Summarise the main point.' }; }
        if (++step === 1) { return { toolCalls: [call('LearningAnswer', { exerciseId: h.read().unit.exercises[0].id })] }; }
        if (phase === 'failed') { throw Object.assign(new Error('fixture'), { status: 401 }); }
        if (phase === 'missing') { return { text: '答对了。' }; }
        if (step === 2) {
            const id = results(request).find(entry => entry.name === 'LearningAnswer').response.ids[0];
            return { toolCalls: [call('LearningAssess', { attemptId: id, verdict: 'partial', understanding: '意思清楚', expression: '动词需要调整', guidance: '试试 trees cool…' })] };
        }
        return { text: '意思清楚，接着调整这个动词。' };
    });
    await h.teaching.run({ action, message: '开始' }); original = structuredClone(h.read().unit);
    const input = { action: { kind: 'talk' }, message: 'Trees makes streets cool.' };
    phase = 'failed'; step = 0;
    assert.equal((await h.teaching.run(input)).status, 'failed');
    assert.deepEqual(h.read().unit, original);
    phase = 'missing'; step = 0;
    assert.equal((await h.teaching.run(input)).reason, 'learning_assessment_missing');
    assert.deepEqual(h.read().unit, original);
    phase = 'success'; step = 0;
    assert.equal((await h.teaching.run(input)).status, 'finished');
    assert.equal(h.read().unit.attempts.length, 1);
    assert.equal(h.read().unit.attempts[0].answer.text, input.message);
    assert.equal(h.teaching.conversation().turns.at(-1).user, input.message);
});

test('real submitted answer survives failed assessment and is evaluated under the same ID on retry', async () => {
    let phase = 'prepare';
    let step = 0;
    let attemptId;
    const h = await harness(request => {
        if (phase === 'prepare') { return ++step === 1 ? { toolCalls: [call('LearningLessonEdit', lesson())] } : { text: '开始练习。' }; }
        if (phase === 'fail') { throw Object.assign(new Error('private API response'), { status: 401 }); }
        if (++step === 1) {
            assert.ok(request.messages.some(message => message.content.includes('Trees keep the street cool.')));
            return { toolCalls: [call('LearningAssess', { attemptId, verdict: 'correct', understanding: '抓住了要点', expression: '表达自然', guidance: '再试着补充一个依据', items: [{ label: '概括要点' }] }),
                call('LearningComplete', { unitId: h.read().unit.id, attemptIds: [attemptId], summary: '练习了概括要点' })] };
        }
        return { text: '这次练习就到这里。' };
    });
    await h.teaching.run({ action, message: '开始' });
    const unit = h.read().unit;
    const submission = createLearningService(h.repository, h).prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: unit.exercises[0].id,
        answer: { kind: 'text', text: 'Trees keep the street cool.' }, scope: { kind: 'story', osId: 'story-a' }, osId: 'story-a', replays: 0, slowPlayback: false });
    attemptId = submission.attemptId;
    await submission.save(() => true);
    phase = 'fail';
    const input = { action: { kind: 'assess', attemptId, review: false }, message: '请看我的答案。' };
    const failed = await h.teaching.run(input);
    assert.equal(failed.reason, 'provider-auth');
    assert.ok(!JSON.stringify(failed).includes('private API response'));
    assert.equal(h.read().unit.attempts[0].id, attemptId);
    assert.equal(h.read().unit.assessments.length, 0);
    phase = 'assess'; step = 0;
    assert.equal((await h.teaching.run(input)).status, 'finished');
    assert.equal(h.read().unit.attempts.length, 1);
    assert.equal(h.read().unit.assessments[0].attemptId, attemptId);
    assert.equal(h.read().completions[0].reward.amount, 17);
});

test('unknown save outcome publishes no teacher reply and recovery only reads the pending upload', async () => {
    const h = await harness((_request, step) => step === 1 ? { toolCalls: [call('LearningLessonEdit', lesson())] } : { text: '新课程。' });
    h.interruptSave();
    assert.deepEqual(await h.teaching.run({ action, message: '开始' }), { status: 'unconfirmed' });
    assert.equal(h.read().unit, null);
    const calls = h.requests.length;
    assert.equal((await h.teaching.run({ action, message: '重试' })).status, 'unconfirmed');
    assert.equal(h.requests.length, calls);
    h.confirmSave();
    assert.equal((await h.repository.verify()).status, 'confirmed');
    assert.ok(h.read().unit);
    assert.equal(h.requests.length, calls);
});

test('cancel, changed classroom and late provider replies cannot publish staged lessons', async () => {
    for (const change of ['cancel', 'teacher', 'chat', 'language']) {
        const h = await harness((_request, step) => {
            if (step === 1) { return { toolCalls: [call('LearningLessonEdit', lesson())] }; }
            if (change === 'cancel') { h.teaching.cancel(); }
            else { h.setCurrent({ ...classroom, ...(change === 'teacher' ? { teacher: { name: '新老师', note: '' } }
                : change === 'chat' ? { chatIdentity: 'chat-b', osId: 'story-b' } : { language: 'ja' }) }); }
            return { text: '晚到的新课程' };
        });
        assert.equal((await h.teaching.run({ action, message: '开始' })).status, 'cancelled');
        assert.equal(h.read().unit, null);
    }
});

test('empty replies, repeated no-progress calls and unresolved tools do not publish drafts', async () => {
    for (const mode of ['empty', 'limit', 'invalid']) {
        const h = await harness((_request, step) => {
            if (step === 1) { return { toolCalls: [call('LearningLessonEdit', lesson())] }; }
            if (mode === 'limit') { return { toolCalls: [call('LearningRead', {})] }; }
            if (mode === 'invalid' && step === 2) { return { toolCalls: [call('LearningLessonEdit', { tier: 'invalid' })] }; }
            return { text: mode === 'empty' ? '' : '完成' };
        });
        const result = await h.teaching.run({ action, message: '开始' });
        assert.equal(result.status, 'failed');
        assert.equal(h.read().unit, null);
        if (mode === 'limit') { assert.equal(result.reason, 'learning_stalled'); }
    }
});

test('article paging is cached, bounded, keeps real text and consumes no extra requests', async t => {
    // Real browser boundary: search/source identities cannot require a secure HTTP origin.
    const originalCrypto = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
    const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto);
    Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues } });
    t.after(() => Object.defineProperty(globalThis, 'crypto', originalCrypto));
    let calls = 0;
    const paragraph = 'A<&树'.repeat(1200);
    t.mock.method(globalThis, 'fetch', async url => {
        calls++;
        return Response.json(url.endsWith('/search') ? { results: [{ title: 'Article', url: 'https://example.com/article', content: 'Summary' }] }
            : { results: [{ url: 'https://example.com/article', raw_content: `${paragraph}\n\nLast paragraph.` }] });
    });
    const sources = createLearningSourceRegistry();
    const research = createLearningResearch(config, { sources, signal: new AbortController().signal });
    assert.equal((await research.executeTool('LearningExtract', { candidateIds: ['https://localhost/'] })).ok, false);
    assert.equal(calls, 0);
    const search = await research.executeTool('LearningSearch', { query: 'model-selected teaching query' });
    const id = search.results[0].id;
    let offset = 0;
    let sourceId;
    let text = '';
    do {
        const result = await research.executeTool('LearningExtract', { candidateIds: [id], offset });
        assert.equal(result.ok, true, JSON.stringify(result));
        const page = result.results[0];
        sourceId = page.sourceId;
        assert.ok([...safePromptJson(page)].length < 5000);
        text += page.paragraphs.filter(part => part.paragraph === 1).map(part => part.text).join('');
        assert.notEqual(page.nextOffset, offset);
        offset = page.nextOffset;
    } while (offset !== null);
    assert.equal(text, paragraph);
    assert.equal(sources.get(sourceId).paragraphs[0].text, paragraph);
    assert.equal(calls, 2);
    sources.add({ id: 'long-metadata', url: `https://example.com/?${'&'.repeat(1600)}`, title: 'Escaped source',
        retrievedAt: '2026-09-06T09:00:00.000Z', paragraphs: [{ id: 'p1', text: '<'.repeat(600) }] });
    const first = (await research.executeTool('LearningExtract', { sourceId: 'long-metadata' })).results[0];
    assert.ok(first.paragraphs.length > 0);
    const last = (await research.executeTool('LearningExtract', { sourceId: 'long-metadata', offset: first.nextOffset })).results[0];
    assert.equal([...first.paragraphs, ...last.paragraphs].map(part => part.text).join(''), '<'.repeat(600));
    assert.equal(last.nextOffset, null);
    assert.equal(calls, 2);
    const second = createLearningResearch(config, { sources: createLearningSourceRegistry(), signal: new AbortController().signal });
    assert.equal((await second.executeTool('LearningExtract', { candidateIds: [id] })).ok, false);
});

test('cross-card teaching drops prior conversation and private lesson, but keeps the user goal', async () => {
    let phase = 'lesson';
    let step = 0;
    const h = await harness(request => {
        if (phase === 'lesson') { return ++step === 1 ? { toolCalls: [call('LearningLessonEdit', lesson())] } : { text: 'PRIVATE_CLASSROOM_REPLY' }; }
        const data = request.messages.map(message => message.content).join('\n');
        assert.ok(!data.includes('PRIVATE_CLASSROOM_REPLY'));
        assert.ok(!data.includes('Trees cool streets.'));
        assert.ok(data.includes('阅读和表达'));
        return { text: '在这里可以开始新的练习。' };
    });
    await h.teaching.run({ action, message: '开始' });
    phase = 'explain';
    h.setCurrent({ ...classroom, osId: 'story-b', chatIdentity: 'chat-b' });
    assert.equal((await h.teaching.run({ action: { kind: 'explain' }, message: '我的目标是什么？' })).status, 'finished');
    assert.equal(h.read().unit.scope.osId, 'story-a');
});

test('current focus is complete and every background character remains accessible through the indexed reader', async () => {
    const h = await harness((_request, step) => step === 1 ? { toolCalls: [call('LearningLessonEdit', lesson())] } : { text: '开始' });
    await h.teaching.run({ action, message: '开始' });
    const data = h.repository.snapshot().document.data;
    const { messages } = buildLearningContext({ data, ...classroom, context, action: { kind: 'explain' }, message: '请解释', exerciseId: h.read().unit.exercises[0].id });
    assert.ok(messages[0].content.includes('Summarise the main point.'));
    const long = '<&树'.repeat(20000);
    const source = createLearningBackground({ ...context, snapshot: { ...context.snapshot, storyEvents: long } });
    let recovered = ''; let offset = 0;
    do {
        const page = source.execute({ section: 'storyEvents', offset });
        assert.equal(page.ok, true); recovered += page.text; offset = page.nextOffset;
    } while (offset !== null);
    assert.equal(recovered, long);
});

test('host teacher lookup uses known person identity and rejects chat changes during capture', async () => {
    let identity = 'chat-a';
    const adapter = createLearningContextAdapter({ currentChatIdentity: () => identity,
        capture: async () => ({ chatIdentity: 'chat-a', contextSnapshot: context.snapshot }) },
    () => [{ name: '小林', aliases: ['林老师'], text: '正确人物' }, { name: '大富翁', aliases: [], text: '不是老师' }]);
    assert.equal((await adapter.capture('林老师', 'chat-a')).teacherDetails, '正确人物');
    identity = 'chat-b';
    await assert.rejects(adapter.capture('林老师', 'chat-a'));
});

test('Google continuation preserves thought payload and provider tool identity', async () => {
    let round = 0;
    const content = { parts: [{ text: 'thought', thoughtSignature: 'signature' }, { functionCall: { name: 'Read', args: {} } }] };
    const result = await runLearningProviderLoop({ systemPrompt: 'test', messages: [], tools: [{ function: { name: 'Read' } }],
        signal: new AbortController().signal, guard: () => true, executeTool: () => ({ ok: true }),
        agent: { providerConfig: { provider: 'google' }, supportsSessionToolLoop: false, run: async request => {
            if (++round === 1) { return { providerPayload: { googleContent: content } }; }
            assert.deepEqual(request.messages[0].providerPayload.googleContent, content);
            assert.equal(request.messages[0].tool_calls[0].providerToolCallId, '');
            return { text: 'done' };
        } } });
    assert.equal(result.status, 'finished');
});

test('fixed-key submissions save before the teacher continues; continuation can present the next exercise and wrap up once', async () => {
    let phase = 'prepare';
    let step = 0;
    const choices = { ...lesson(), materials: [], exercises: ['a', 'b'].map(key => ({ key, skill: 'vocabulary', materialKeys: [],
        prompt: 'Which word means 树?', response: { kind: 'choice', multiple: false, options: [{ id: 'tree', text: 'tree' }, { id: 'river', text: 'river' }] },
        rule: { kind: 'exact', answer: { kind: 'choice', ids: ['tree'] }, explanation: 'tree 是树。' } })) };
    const h = await harness(() => {
        if (phase === 'prepare') { return ++step === 1 ? { toolCalls: [call('LearningLessonEdit', choices)] } : { text: '试试这两个词。' }; }
        const unit = h.read().unit;
        if (phase === 'continue') {
            assert.equal(unit.attempts.length, 1);
            assert.equal(unit.assessments[0].verdict, 'correct');
            return ++step === 1 ? { toolCalls: [call('LearningPresent', { kind: 'exercise', id: unit.exercises[1].id })] } : { text: '答对了，继续下一题。' };
        }
        if (phase === 'review') { return { text: '我们再巩固一下。' }; }
        assert.equal(unit.attempts.length, 2);
        assert.equal(unit.assessments.length, 2);
        return ++step === 1 ? { toolCalls: [call('LearningComplete', { unitId: unit.id, attemptIds: unit.attempts.map(attempt => attempt.id), summary: '练习了词义识别' })] }
            : { text: '这次就到这里。' };
    });
    await h.teaching.run({ action, message: '开始' });
    const practice = createLearningPractice({ repository: h.repository, teaching: h.teaching, current: h.current, createId: h.createId, now: h.now });
    const unit = h.read().unit;
    const submit = id => practice.submit({ unitId: unit.id, exerciseId: id, answer: { kind: 'choice', ids: ['tree'] }, replays: 0, slowPlayback: false });
    const count = h.requests.length;
    phase = 'continue'; step = 0;
    assert.equal((await submit(unit.exercises[0].id)).teaching.status, 'finished');
    assert.equal(h.requests.length, count + 2);
    assert.equal(h.teaching.conversation().turns.at(-1).presentation.id, unit.exercises[1].id);
    phase = 'wrapup'; step = 0;
    assert.equal((await submit(unit.exercises[1].id)).teaching.status, 'finished');
    assert.equal(h.read().completions.length, 1);
    const finishedCalls = h.requests.length;
    phase = 'review';
    assert.equal((await submit(unit.exercises[1].id)).teaching.status, 'finished');
    assert.equal(h.requests.length, finishedCalls + 1);
    assert.equal(h.read().completions.length, 1);
});

test('a displayed explanation records assistance before later practice, without rewriting earlier attempts', async () => {
    let step = 0;
    const h = await harness(() => ++step === 1 ? { toolCalls: [call('LearningLessonEdit', lesson())] } : { text: 'Think about what trees do to the temperature.' });
    await h.teaching.run({ action, message: '开始' });
    const unit = h.read().unit;
    const input = { language: 'en', osId: 'story-a', unitId: unit.id, exerciseId: unit.exercises[0].id,
        answer: { kind: 'text', text: 'Trees help.' }, scope: { kind: 'story', osId: 'story-a' }, replays: 0, slowPlayback: false };
    const service = createLearningService(h.repository, h);
    await service.prepareAttempt(input).save(() => true);
    assert.equal((await h.teaching.run({ action: { kind: 'explain' }, exerciseId: input.exerciseId, message: '给一点提示。' })).status, 'finished');
    await service.prepareAttempt(input).save(() => true);
    assert.equal(h.read().unit.attempts[0].help.hint, false);
    assert.equal(h.read().unit.attempts[1].help.hint, true);
});

test('research failures do not leak transport errors, impose a two-query quota or silently retry', async t => {
    let count = 0;
    const controller = new AbortController();
    t.mock.method(globalThis, 'fetch', async () => { count++; return new Response('private gateway response', { status: 401 }); });
    const research = createLearningResearch(config, { sources: createLearningSourceRegistry(), signal: controller.signal });
    const failed = await research.executeTool('LearningSearch', { query: 'public article' });
    assert.deepEqual(failed, { ok: false, error: 'learning_search_failed' });
    assert.equal(count, 1);
    await research.executeTool('LearningSearch', { query: 'another article' });
    assert.equal((await research.executeTool('LearningSearch', { query: 'third' })).ok, false);
    assert.equal(count, 3);
    controller.abort();
    await assert.rejects(research.executeTool('LearningSearch', { query: 'cancelled' }), { code: 'learning_research_cancelled' });
    assert.equal(count, 3);
});

test('a substantive tool turn can exceed 32000 serialized characters and eight rounds, then continue with the same teacher', async () => {
    let phase = 'prepare';
    let round = 0;
    const article = 'A<&树'.repeat(1400);
    const h = await harness(request => {
        round++;
        if (phase === 'prepare') {
            if (round === 1) { return { toolCalls: [call('LearningLessonEdit', lesson([{ key: 'article', title: 'Long valid material', kind: 'authored', text: article }]))] }; }
            if (round <= 10) { return { toolCalls: [call('LearningRead', { section: 'materials', offset: round - 2, limit: 1 })] }; }
            assert.ok([...safePromptJson(request.messages)].length > 32000);
            return { text: '我们下一步练习因果表达。' };
        }
        if (round === 1) {
            assert.ok(request.messages.some(message => message.role === 'assistant' && message.content === '我们下一步练习因果表达。'));
            assert.ok(request.messages.some(message => message.role === 'tool'));
            assert.ok(request.tools.some(tool => tool.function.name === 'LearningLessonEdit'));
            return { toolCalls: [call('LearningLessonEdit', { exercises: [{ key: 'easier', skill: 'writing', materialKeys: [],
                prompt: 'Write one sentence with because.', response: { kind: 'text' }, rule: { kind: 'semantic' } }] })] };
        }
        return { text: '加了一小步，先试试这一句。' };
    });
    assert.equal((await h.teaching.run({ action, message: '准备一课，读完需要的材料。' })).status, 'finished');
    assert.equal(h.requests.length, 11);
    const previous = structuredClone(h.read().unit);
    // Stopping is not forgetting. No new model request is made to retain history.
    h.teaching.cancel();
    assert.equal(h.teaching.conversation().turns.length, 1);
    phase = 'talk'; round = 0;
    assert.equal((await h.teaching.run({ action: { kind: 'talk' }, message: '有点难，给我一个简单的铺垫。' })).status, 'finished');
    assert.equal(h.read().unit.id, previous.id);
    assert.deepEqual(h.read().unit.materials, previous.materials);
    assert.equal(h.read().unit.exercises.length, 2);
    assert.equal(h.teaching.conversation().turns.length, 2);
    h.teaching.reset();
    assert.equal(h.teaching.conversation().turns.length, 0);
    assert.deepEqual(h.read().unit.materials, previous.materials);
});

test('extracted source identities and complete long paragraphs survive into a follow-up teaching turn', async t => {
    let network = 0;
    const longParagraph = 'Long reference text. '.repeat(1300);
    t.mock.method(globalThis, 'fetch', async url => {
        network++;
        return Response.json(url.endsWith('/search') ? { results: [{ title: 'Article', url: 'https://example.com/article', content: 'Summary' }] }
            : { results: [{ url: 'https://example.com/article', raw_content: `${longParagraph}\n\nTrees cool streets.` }] });
    });
    let sourceId; let step = 0; let phase = 'research';
    const h = await harness(request => {
        step++;
        const last = name => results(request).filter(result => result.name === name).at(-1)?.response;
        if (phase === 'research') {
            if (step === 1) { return { toolCalls: [call('LearningSearch', { query: 'urban trees article' })] }; }
            if (step === 2) { return { toolCalls: [call('LearningExtract', { candidateIds: [last('LearningSearch').results[0].id] })] }; }
            sourceId = last('LearningExtract').results[0].sourceId;
            assert.equal(last('LearningExtract').results[0].paragraphCount, 2);
            return { text: '这篇可以，我们挑一个短段落练习。' };
        }
        if (step === 1) { return { toolCalls: [call('LearningRead', { section: 'sources' })] }; }
        if (step === 2) {
            assert.equal(last('LearningRead').data[0].id, sourceId);
            return { toolCalls: [call('LearningExtract', { sourceId, offset: Math.ceil(longParagraph.length / 500) })] };
        }
        if (step === 3) {
            assert.equal(last('LearningExtract').results[0].paragraphs[0].text, 'Trees cool streets.');
            return { toolCalls: [call('LearningLessonEdit', lesson([{ key: 'article', title: 'Excerpt', kind: 'original', sourceId, from: 2, through: 2 }]))] };
        }
        return { text: '用这一段开始。' };
    }, { search: true });
    assert.equal((await h.teaching.run({ action: { kind: 'talk' }, message: '先找一篇文章看看。' })).status, 'finished');
    phase = 'lesson'; step = 0;
    assert.equal((await h.teaching.run({ action: { kind: 'talk' }, message: '就用刚才那篇的短段落出题。' })).status, 'finished');
    assert.equal(network, 2);
    assert.equal(h.read().unit.materials[0].paragraphs[0].text, 'Trees cool streets.');
});

for (const session of [false, true]) {
    test(`provider overflow summarises complete old turns and never re-executes current tools (${session ? 'session' : 'replay'})`, async () => {
        let requests = 0; let executed = 0; let reopened = 0;
        const history = ['old-a', 'old-b'].map(text => ({ user: text, teacher: text,
            messages: [{ role: 'user', content: text }, { role: 'assistant', content: text.repeat(200) }] }));
        const agent = () => ({ providerConfig: {}, supportsSessionToolLoop: session, run: async request => {
            if (!request.tools.length) { return { text: 'Earlier discussion of old-a.' }; }
            requests++;
            if (requests === 1) { return { toolCalls: [call('Write', { value: 'current' }, 'unique-current')] }; }
            if (requests === 2) { throw Object.assign(new Error('maximum context length exceeded'), { status: 400, code: 'context_length_exceeded' }); }
            assert.equal(request.toolResponses, undefined);
            assert.ok(!request.messages.some(message => message.content === 'old-a'));
            assert.ok(request.messages.some(message => message.content === 'old-b'));
            assert.ok(request.messages.some(message => message.tool_calls?.[0].id === 'unique-current'));
            assert.ok(request.messages.some(message => message.role === 'tool' && JSON.parse(message.content).saved === 'current'));
            return { text: 'done' };
        } });
        const result = await runLearningProviderLoop({ agent: agent(), reopen: async () => { reopened++; return agent(); },
            history, systemPrompt: 'test', messages: [{ role: 'user', content: 'new-turn' }], tools: [{ function: { name: 'Write' } }],
            signal: new AbortController().signal, guard: () => true,
            executeTool: () => { executed++; return { saved: 'current' }; } });
        assert.equal(result.status, 'finished');
        assert.equal(result.removedTurns, 1);
        assert.equal(executed, 1);
        assert.equal(reopened, 2, 'one isolated summary session and one resumed teacher session');
    });
}

test('an ordinary invalid-request response does not erase history or automatically retry', async () => {
    let calls = 0;
    const result = await runLearningProviderLoop({ systemPrompt: 'test', messages: [], tools: [],
        history: [{ user: 'hello', teacher: 'hello', messages: [{ role: 'user', content: 'hello' }] }],
        signal: new AbortController().signal, guard: () => true, executeTool: () => null,
        reopen: () => { throw new Error('must not reopen'); },
        agent: { providerConfig: {}, supportsSessionToolLoop: false, run: async () => {
            calls++; throw Object.assign(new Error('Unsupported request parameter'), { status: 400 });
        } } });
    assert.equal(result.reason, 'provider-request');
    assert.equal(calls, 1);
});
