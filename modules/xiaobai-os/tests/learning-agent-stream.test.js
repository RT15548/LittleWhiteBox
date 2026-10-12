import assert from 'node:assert/strict';
import test from 'node:test';
import OpenAI from 'openai';
import { runLearningProviderLoop } from '../apps/learning/agent/provider-loop.js';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { createLearningSourceRegistry } from '../apps/learning/materials/lesson-sources.js';
import { createLearningResearch } from '../apps/learning/materials/research.js';
import { createLearningSession } from '../apps/learning/agent/session.js';
import { learningMessageView } from '../apps/learning/application/message-view.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { requireResponseCompletion } from '../../agent-core/runtime/response-completion.js';

const call = (name, args = {}) => ({ id: name, name, arguments: JSON.stringify(args) });
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };

for (const toolMode of ['native', 'tagged-json']) {
    for (const ending of ['stop', 'eof', 'length', 'content_filter']) {
        test(`real Chat transport ${toolMode}/${ending} respects the classroom commit boundary`, async t => {
            t.mock.method(console, 'error', () => {});
            const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
            const before = structuredClone(h.profile());
            const adapter = new OpenAICompatibleAdapter({ apiKey: 'fixture', model: 'gpt-4o', toolMode });
            const partial = '这段文字只在正常结束后发布。';
            const events = [{ choices: [{ index: 0, delta: { role: 'assistant', content: partial } }] }];
            if (ending !== 'eof') { events.push({ choices: [{ index: 0, delta: {}, finish_reason: ending }] }); }
            let requests = 0;
            const transport = async () => {
                requests++;
                return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join('') + 'data: [DONE]\n\n',
                    { headers: { 'content-type': 'text/event-stream' } });
            };
            t.mock.method(globalThis, 'fetch', transport);
            adapter.client = new OpenAI({ apiKey: 'fixture', maxRetries: 0, fetch: transport });
            h.flags.teacherResponse = (request, round) => round === 1
                ? { toolCalls: [call('LearningProfileEdit', { goal: { description: '正常结束才保存' } })] }
                : adapter.chat(request);
            await h.command('profile', { message: '修改目标。' });
            const turn = h.state().workbenchConversation.turns.at(-1);
            assert.equal(requests, 1);
            assert.equal(turn.status, ending === 'stop' ? 'finished' : 'failed');
            if (ending === 'stop') {
                assert.equal(h.profile().goal.description, '正常结束才保存');
                assert.equal(turn.teacher, partial);
            } else {
                assert.deepEqual(h.profile(), { ...before, goal: { ...before.goal, description: '正常结束才保存' } });
                assert.ok(turn.message);
                assert.ok(!JSON.stringify(turn).includes(partial));
            }
        });
    }
}

for (const completeArguments of [false, true]) {
    test(`search query drafts stay private after stopping (complete JSON: ${completeArguments})`, async t => {
        const h = await createClassroomFixture({ listening: true, agentConfig: { tavilyApiKey: 'fixture' } });
        const gate = deferred(); t.after(async () => { gate.resolve(); await h.dispose(); }); await h.openLesson();
        const unit = structuredClone(h.profile().unit);
        const secret = unit.materials[0].paragraphs[0].text;
        h.flags.teacherResponse = async request => {
            assert.ok(request.tools.some(tool => tool.function.name === 'LearningSearch'));
            const search = call('LearningSearch', { query: secret, maxResults: 1 });
            request.onStreamProgress({ toolCalls: [{ ...search, arguments: completeArguments ? search.arguments : search.arguments.slice(0, -1) }], toolCallDraft: true });
            await gate.promise;
            return { toolCalls: [search] };
        };
        const waiting = nextState(h, state => state.workbenchConversation.turns.at(-1)?.messages.some(entry => entry.streaming && entry.toolCalls?.some(tool => tool.name === 'LearningSearch')));
        const running = h.command('prepare', { message: '找一点练习材料。' });
        assert.ok(!JSON.stringify((await waiting).workbenchConversation).includes(secret));
        await h.command('cancel'); gate.resolve(); await running;
        assert.ok(!JSON.stringify(h.state().workbenchConversation).includes(secret));
        assert.equal(h.profile().unit.materials[0].transcriptRevealed, false);
        h.flags.teacherResponse = (() => ({ text: '收到。' }));
        await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
        assert.equal(h.profile().unit.attempts.at(-1).help.transcript, false);
    });
}

for (const restore of [false, true]) {
    test(`confirmed exposure survives draft replacement without contaminating new text (restore: ${restore})`, async t => {
        const h = await createClassroomFixture({ listening: true }); t.after(h.dispose); await h.openLesson();
        const unit = structuredClone(h.profile().unit);
        const material = unit.materials[0];
        await h.command('reveal', { kind: 'transcripts', id: material.id });
        const update = text => call('LearningLessonEdit', { materials: [{ key: material.id, kind: 'authored', title: material.title, text }] });
        h.flags.teacherResponse = ((_request, round) => round === 1 ? { toolCalls: [
            update('A completely different listening passage.'),
            ...(restore ? [update(material.paragraphs.map(entry => entry.text).join('\n\n'))] : []),
        ] } : { text: '可以继续练习。' });
        await h.command('prepare', { message: '调整这段听力。' });
        assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
        assert.equal(h.profile().unit.materials[0].transcriptRevealed, restore);
        h.flags.teacherResponse = (() => ({ text: '收到。' }));
        await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
        assert.equal(h.profile().unit.attempts.at(-1).help.transcript, restore);
    });
}

function nextState(h, predicate) {
    return new Promise((resolve, reject) => {
        const off = h.bridge.subscribe(event => {
            if (event.type === 'learning/state' && predicate(event.payload.state)) {
                clearTimeout(timer); off(); resolve(event.payload.state);
            }
        });
        const timer = setTimeout(() => { off(); reject(new Error('Expected classroom state was not published')); }, 2000);
    });
}

// Protect the user-visible stream at the real host/iframe boundary, not just a callback's existence.
for (const mode of ['cancel', 'failure']) {
    test(`completed text survives ${mode}; unfinished text and late callbacks remain private`, async t => {
        t.mock.method(console, 'error', () => {});
        const gate = deferred();
        const h = await createClassroomFixture(); t.after(() => { gate.resolve(); return h.dispose(); }); await h.openLesson();
        let late;
        h.flags.teacherResponse = async (request, round) => {
            if (round === 1) { return { text: '已经收到你的问题。', toolCalls: [call('LearningRead', { section: 'overview' })] }; }
            late = request.onStreamProgress;
            late({ text: '尚未确认的新讲解。', thoughts: [{ label: '思考', text: '先看已有资料。' }] });
            await gate.promise;
            if (mode === 'failure') { throw Object.assign(new Error('private transport data'), { status: 503 }); }
            return { text: '旧请求晚到的结论' };
        };
        const streamed = nextState(h, state => state.conversation.turns.at(-1)?.messages.at(-1)?.hasReasoning
            && state.conversation.turns.at(-1)?.messages.some(entry => entry.content === '已经收到你的问题。'));
        const running = h.command('talk', { message: '帮我看看。' });
        await streamed;
        if (mode === 'cancel') { await h.command('cancel-chat'); }
        gate.resolve(); await running;
        const index = h.state().conversation.turns.length - 1;
        const interrupted = h.state().conversation.turns[index];
        assert.equal(interrupted.status, mode === 'cancel' ? 'cancelled' : 'failed');
        assert.ok(interrupted.messages.some(entry => entry.content === '已经收到你的问题。'));
        assert.equal(interrupted.messages.at(-1).content, '尚未确认的新讲解。');
        assert.equal(interrupted.messages.at(-1).streaming, false);
        assert.ok(interrupted.message);
        h.flags.teacherResponse = (request => {
            assert.ok(request.messages.some(message => message.content?.includes('已经收到你的问题。')));
            assert.ok(JSON.stringify(request.messages).includes('尚未确认的新讲解。'));
            return { text: '新请求的回复' };
        });
        await h.command('talk', { message: '继续。' });
        const afterNewRequest = h.state().conversation.turns[index];
        assert.equal(afterNewRequest.retryable, false);
        late({ text: '过期回调' });
        assert.deepEqual(h.state().conversation.turns[index], afterNewRequest);
        assert.equal(h.state().conversation.turns.at(-1).teacher, '新请求的回复');
    });
}

for (const session of [false, true]) {
    test(`an empty post-tool answer gets one final response opportunity (${session ? 'session' : 'replay'})`, async () => {
        let requests = 0; let executions = 0;
        const transcript = [];
        const result = await runLearningProviderLoop({ systemPrompt: 'Teacher', messages: [{ role: 'user', content: 'Hi' }],
            tools: [{ function: { name: 'Read' } }], signal: new AbortController().signal, guard: () => true,
            transcript, executeTool: () => { executions++; return { ok: true, value: 'available' }; },
            agent: { providerConfig: {}, supportsSessionToolLoop: session, run: async request => {
                requests++;
                if (requests === 1) { return { toolCalls: [call('Read')] }; }
                if (requests === 2) { return { text: '', thoughts: [{ label: '思考', text: 'The result is available.' }] }; }
                assert.equal(requests, 3);
                if (session) { assert.ok(request.finalAnswerReminderText); assert.deepEqual(request.messages, []); }
                else {
                    assert.equal(request.messages.at(-1).role, 'user'); assert.ok(request.messages.some(message => message.role === 'tool'));
                    assert.ok(!request.messages.some(message => message.role === 'assistant' && !message.content && !message.tool_calls?.length));
                }
                request.onStreamProgress({ text: 'Ready.' });
                return { text: 'Ready.', providerPayload: { final: true } };
            } },
        });
        assert.equal(result.status, 'finished'); assert.equal(executions, 1);
        assert.equal(transcript.at(-1).content, 'Ready.');
        assert.equal(transcript.at(-1).streaming, false);
        assert.ok(transcript.some(message => message.thoughts?.some(thought => thought.text === 'The result is available.')));
        assert.deepEqual(result.messages.at(-1).providerPayload, { final: true });
    });
}

for (const finishReason of ['length', 'max_tokens', 'max_output_tokens', 'MAX_TOKENS']) {
    test(`an output-limit stop (${finishReason}) preserves partial text but cannot execute its tools`, async () => {
        const transcript = [];
        const result = await runLearningProviderLoop({ systemPrompt: '', messages: [], tools: [{ function: { name: 'LearningProfileEdit' } }],
            signal: new AbortController().signal, guard: () => true, transcript, executeTool: () => assert.fail(),
            agent: { providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
                request.onStreamProgress({ text: 'Incomplete' }); requireResponseCompletion('openai', finishReason);
            } },
        });
        assert.equal(result.reason, 'learning_response_truncated'); assert.equal(transcript.at(-1).content, 'Incomplete');
    });
}

for (const ending of ['incomplete', 'failed', 'eof', 'completed']) {
test(`real Responses SDK ${ending} respects the classroom commit boundary`, async t => {
    const logs = t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const before = structuredClone(h.profile());
    const adapter = new OpenAIResponsesAdapter({ apiKey: 'test-key', baseUrl: 'https://api.openai.com/v1', model: 'gpt-5.6' });
    const base = { id: 'resp_fixture', object: 'response', created_at: 1, status: 'in_progress', model: 'fixture',
        output: [], error: null, incomplete_details: null };
    const part = { type: 'output_text', text: '回复还没写完', annotations: [], logprobs: [] };
    const events = [
        { type: 'response.created', response: base },
        { type: 'response.output_item.added', output_index: 0,
            item: { id: 'msg_fixture', type: 'message', role: 'assistant', status: 'in_progress', content: [] } },
        { type: 'response.content_part.added', output_index: 0, content_index: 0, item_id: 'msg_fixture', part: { ...part, text: '' } },
        { type: 'response.output_text.delta', output_index: 0, content_index: 0, item_id: 'msg_fixture', delta: part.text },
    ];
    if (ending !== 'completed') {
        events.push({ type: 'response.output_item.added', output_index: 1,
            item: { id: 'fc_fixture', type: 'function_call', call_id: 'late-edit', name: 'LearningProfileEdit', arguments: '', status: 'in_progress' } },
        { type: 'response.function_call_arguments.delta', output_index: 1, item_id: 'fc_fixture', delta: '{"goal":{"description":"不可执行的工具"}}' });
    }
    if (ending !== 'eof') {
        events.push({ type: `response.${ending}`, response: { ...base, status: ending,
            incomplete_details: ending === 'incomplete' ? { reason: 'max_output_tokens' } : null,
            error: ending === 'failed' ? { code: 'server_error', message: 'fixture failure' } : null,
            output: [{ id: 'msg_fixture', type: 'message', role: 'assistant', status: ending, content: [part] }] } });
    }
    const wire = events.map((event, sequence_number) => `event: ${event.type}\ndata: ${JSON.stringify({ ...event, sequence_number })}\n\n`).join('');
    let requests = 0;
    adapter.client = new OpenAI({ apiKey: 'fixture-not-real', maxRetries: 0,
        fetch: async () => { requests++; return new Response(wire, { headers: { 'content-type': 'text/event-stream' } }); } });
    h.flags.teacherResponse = (request, round) => round === 1
        ? { toolCalls: [call('LearningProfileEdit', { goal: { description: '不应保存的修改' } })] } : adapter.chat(request);
    await h.command('profile', { message: '调整目标' });
    const turn = h.state().workbenchConversation.turns.at(-1);
    assert.equal(turn.status, ending === 'completed' ? 'finished' : 'failed');
    if (ending !== 'completed') {
        assert.ok(turn.message);
        assert.equal(logs.mock.calls.at(-1).arguments[1].reason, ending === 'incomplete' ? 'learning_response_truncated' : 'provider-failed');
    }
    assert.equal(turn.messages.at(-1).content, ending === 'completed' ? '回复还没写完' : '');
    assert.equal(requests, 1, 'Termination failures must not retry');
    if (ending === 'completed') { assert.equal(h.profile().goal.description, '不应保存的修改'); }
    else {
        assert.deepEqual(h.profile(), { ...before, goal: { ...before.goal, description: '不应保存的修改' } });
        assert.ok(!turn.messages.some(entry => entry.role === 'tool' && entry.toolCallId === 'late-edit'));
    }
});
}

for (const interruption of ['abort', 'obsolete', 'failure']) {
    test(`a late tool rejection respects ${interruption} without changing a stopped transcript`, async () => {
        const started = deferred(); const release = deferred();
        const controller = new AbortController(); let current = true;
        const transcript = [];
        const running = runLearningProviderLoop({ systemPrompt: '', messages: [], tools: [{ function: { name: 'Read' } }],
            signal: controller.signal, guard: () => current, transcript,
            agent: { providerConfig: {}, supportsSessionToolLoop: false, run: async () => ({ toolCalls: [call('Read')] }) },
            executeTool: async () => { started.resolve(); await release.promise; throw new Error('late tool rejection'); },
        });
        await started.promise;
        if (interruption === 'abort') { controller.abort(); }
        if (interruption === 'obsolete') { current = false; }
        const stopped = structuredClone(transcript);
        release.resolve();
        const result = await running;
        if (interruption === 'failure') {
            assert.equal(result.reason, 'learning_tool_failed');
            assert.equal(transcript.at(-1).error, true);
            assert.ok(transcript.at(-1).content);
        } else {
            assert.equal(result.status, 'cancelled');
            // Finalization may clear streaming when only the ownership guard changed.
            assert.deepEqual(transcript, stopped.map(message => ({ ...message, streaming: false })));
        }
    });
}

for (const ending of ['finished', 'cancelled', 'failed']) {
    test(`classroom reasoning stays private during streaming and after ${ending}`, async t => {
        t.mock.method(console, 'error', () => {});
        const gate = deferred();
        const h = await createClassroomFixture({ listening: true }); t.after(() => { gate.resolve(); return h.dispose(); }); await h.openLesson();
        const before = structuredClone(h.profile());
        const secret = '正确答案是 a。' + before.unit.materials[0].paragraphs.map(p => p.text).join('\n');
        h.flags.teacherResponse = (async request => {
            request.onStreamProgress({ thoughts: [{ label: '推理', text: secret }] });
            await gate.promise;
            if (ending === 'failed') { throw new Error('transport failed'); }
            return { text: '请先听录音再作答。', thoughts: [{ label: '推理', text: secret }], providerPayload: { private: secret } };
        });
        const streamed = nextState(h, state => state.conversation.turns.at(-1)?.messages.some(entry => entry.hasReasoning));
        const running = h.command('talk', { message: '开始听力练习' });
        const assertPrivate = state => {
            const message = state.conversation.turns.at(-1).messages.find(entry => entry.hasReasoning);
            assert.equal(message.hasReasoning, true);
            assert.equal(Object.hasOwn(message, 'thoughts'), false);
            assert.equal(Object.hasOwn(message, 'providerPayload'), false);
            assert.ok(!JSON.stringify(state.conversation).includes(secret));
        };
        assertPrivate(await streamed);
        if (ending === 'cancelled') { await h.command('cancel-chat'); }
        gate.resolve(); await running;
        assertPrivate(h.state());
        assert.equal(h.state().conversation.turns.at(-1).status, ending);
        assert.deepEqual(h.profile(), before, 'Private reasoning is not learner assistance');
        h.flags.teacherResponse = null;
        await h.command('submit', { unitId: before.unit.id, exerciseId: before.unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
        assert.equal(h.profile().unit.attempts.at(-1).help.transcript, false);
        assert.equal(h.profile().unit.attempts.at(-1).help.hint, false);
    });
}

test('tool argument drafts are visible before execution and match the resulting tool message', async t => {
    const gate = deferred();
    const h = await createClassroomFixture(); t.after(() => { gate.resolve(); return h.dispose(); }); await h.openLesson();
    h.flags.teacherResponse = (async (request, round) => {
        if (round > 1) { return { text: '目标更新好了。' }; }
        request.onStreamProgress({ toolCalls: [call('LearningProfileEdit', { goal: { description: '新闻阅读' } })], toolCallDraft: true });
        await gate.promise;
        return { toolCalls: [call('LearningProfileEdit', { goal: { description: '新闻阅读' } })] };
    });
    const streamed = nextState(h, state => state.workbenchConversation.turns.at(-1)?.messages.some(entry => entry.streaming && entry.toolCalls?.length));
    const running = h.command('profile', { message: '帮我调整目标。' });
    const draft = (await streamed).workbenchConversation.turns.at(-1).messages.find(entry => entry.toolCalls?.length).toolCalls[0];
    assert.equal(draft.name, 'LearningProfileEdit');
    assert.deepEqual(JSON.parse(draft.arguments), {});
    assert.notEqual(h.profile().goal.description, '新闻阅读');
    gate.resolve(); await running;
    const tools = h.state().workbenchConversation.turns.at(-1).messages.filter(entry => entry.role === 'tool' && entry.toolName === 'LearningProfileEdit');
    assert.equal(tools.length, 1); assert.equal(tools[0].toolCallId, draft.id); assert.equal(tools[0].streaming, false);
    assert.equal(JSON.parse(tools[0].content).ok, true);
});

test('tool details retain results without revealing exercise keys or hidden listening text', async t => {
    const h = await createClassroomFixture({ listening: true }); t.after(h.dispose); await h.openLesson();
    const prepared = h.state().workbenchConversation.turns.at(-1).messages.flatMap(entry => entry.toolCalls ?? []).find(call => call.name === 'LearningLessonEdit');
    const argumentsView = JSON.parse(prepared.arguments);
    assert.equal(argumentsView.exercisesCount, 1);
    assert.equal(argumentsView.materialsCount, 1);
    h.flags.teacherResponse = ((request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningRead', { section: 'unit' })] }; }
        const result = JSON.parse(request.messages.findLast(entry => entry.role === 'tool').content);
        assert.equal(result.data.exercises[0].rule, undefined);
        assert.equal(result.data.exercises[0].solution, null);
        assert.deepEqual(result.data.materials[0].paragraphs, []);
        return { text: '资料已经读完。' };
    });
    await h.command('talk', { message: '看看当前进度。' });
    assert.equal(h.state().conversation.turns.at(-1).status, 'finished');
    assert.deepEqual(h.failures, []);
    const result = JSON.parse(h.state().conversation.turns.at(-1).messages.find(entry => entry.role === 'tool').content);
    assert.equal(result.data.exercisesCount, 1);
    assert.equal(result.data.materialsCount, 1);
    assert.equal(h.profile().unit.materials[0].transcriptRevealed, false);
});

test('source snippets and wrap-up drafts stay private while their references remain inspectable', () => {
    const secret = 'A worked answer that has not been published.';
    const search = { role: 'tool', toolName: 'LearningSearch', content: JSON.stringify({ ok: true,
        results: [{ id: 'candidate-1', title: 'Practice source', url: 'https://example.org/practice', summary: secret }] }) };
    const completion = { role: 'assistant', content: '', toolCalls: [call('LearningComplete', {
        unitId: 'unit-1', attemptIds: ['attempt-1'], summary: secret,
    })] };
    const searchView = learningMessageView(search);
    const completionView = learningMessageView(completion);
    assert.ok(!JSON.stringify(searchView).includes(secret));
    assert.ok(!JSON.stringify(completionView).includes(secret));
    assert.equal(JSON.parse(searchView.content).resultsCount, 1);
    assert.equal(JSON.parse(completionView.toolCalls[0].arguments).unitId, undefined);
    assert.ok(search.content.includes(secret)); assert.ok(completion.toolCalls[0].arguments.includes(secret));
});

for (const ending of ['confirmed', 'unconfirmed', 'cancelled']) {
    test(`help about a new listening lesson waits for that lesson's confirmed save (${ending})`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture(); const gate = deferred();
        t.after(async () => { gate.resolve(); await h.dispose(); }); await h.openLesson();
        const before = structuredClone(h.profile());
        const secret = 'Unpublished listening passage about the seaside.';
        const lesson = structuredClone(fixtureLesson);
        lesson.materials[0].text = secret; lesson.exercises[0].skill = 'listening';
        h.flags.userFailure = ending === 'unconfirmed'; h.flags.userRejected = ending === 'rejected';
        h.flags.teacherResponse = async (request, round) => {
            if (round === 1) { return { toolCalls: [call('LearningLessonEdit', lesson)] }; }
            request.onStreamProgress({ text: secret });
            await gate.promise;
            return { text: secret };
        };
        const waiting = nextState(h, state => state.workbenchConversation.turns.at(-1)?.user === '换一篇听力。'
            && state.workbenchConversation.turns.at(-1)?.messages.at(-1)?.streaming
            && state.workbenchConversation.turns.at(-1)?.messages.some(entry => entry.role === 'tool' && entry.toolName === 'LearningLessonEdit' && !entry.streaming));
        const running = h.command('replace-lesson', { unitId: before.unit.id, message: '换一篇听力。' });
        const pending = await waiting;
        assert.ok(!JSON.stringify(pending.workbenchConversation).includes(secret));
        assert.equal(h.profile().unit.id === before.unit.id, ending === 'unconfirmed');
        if (ending === 'cancelled') { await h.command('cancel'); }
        gate.resolve(); await running;
        if (ending !== 'confirmed') {
            assert.ok(!JSON.stringify(h.state().workbenchConversation).includes(secret));
            assert.equal(h.profile().unit.id === before.unit.id, ending === 'unconfirmed');
        }
        if (ending === 'unconfirmed') {
            const requests = h.counts.provider; h.flags.userFailure = false;
            await h.command('retry-save'); assert.equal(h.counts.provider, requests);
        }
        if (ending === 'confirmed' || ending === 'unconfirmed') {
            assert.equal(JSON.stringify(h.state().workbenchConversation).includes(secret), ending === 'confirmed');
            assert.equal(h.profile().unit.materials[0].transcriptRevealed, false);
            assert.deepEqual(h.profile().unit.revealed.hints, []);
        }
    });
}

for (const completeArguments of [false, true]) {
test(`assessment arguments cannot expose feedback or item labels before saving (complete JSON: ${completeArguments})`, async t => {
    const lesson = structuredClone(fixtureLesson);
    lesson.exercises[0].response = { kind: 'text' }; lesson.exercises[0].rule = { kind: 'semantic' };
    const h = await createClassroomFixture({ lesson }); const gate = deferred();
    t.after(async () => { gate.resolve(); await h.dispose(); }); await h.openLesson();
    const unit = h.profile().unit;
    h.flags.teacherResponse = (() => ({ text: '答案已收到。' }));
    const submit = () => h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'text', text: 'Trees provide shade.' } });
    await submit();
    const attempt = structuredClone(h.profile().unit.attempts[0]);
    const secret = 'The correct answer is that trees improve city life.';
    h.flags.teacherResponse = async request => {
        const assessment = call('LearningAssess', { attemptId: attempt.id, verdict: 'correct', understanding: '', expression: '',
            guidance: secret, items: [{ label: secret }] });
        request.onStreamProgress({ toolCalls: [{ ...assessment, arguments: completeArguments ? assessment.arguments : assessment.arguments.slice(0, -1) }], toolCallDraft: true });
        await gate.promise;
        return { toolCalls: [assessment] };
    };
    const waiting = nextState(h, state => state.workbenchConversation.turns.at(-1)?.messages.some(entry => entry.streaming && entry.toolCalls?.some(tool => tool.name === 'LearningAssess')));
    const running = h.command('assess', { attemptId: attempt.id, message: '批改一下。' });
    assert.ok(!JSON.stringify((await waiting).workbenchConversation).includes(secret));
    await h.command('cancel'); gate.resolve(); await running;
    assert.equal(h.profile().unit.assessments.length, 0);
    assert.ok(!JSON.stringify(h.state().workbenchConversation).includes(secret));
    h.flags.teacherResponse = (() => ({ text: '答案已收到。' }));
    await submit();
    assert.deepEqual(h.profile().unit.attempts[0], attempt);
    const help = h.profile().unit.attempts.at(-1).help;
    assert.equal(help.feedback, false); assert.equal(help.hint, false); assert.equal(help.answer, false);
    const complete = learningMessageView({ role: 'assistant', content: '', toolCalls: [call('LearningAssess', {
        attemptId: attempt.id, verdict: 'correct', guidance: secret, understanding: secret, expression: secret, items: [{ label: secret }],
    })] });
    assert.ok(!JSON.stringify(complete).includes(secret));
    assert.deepEqual(JSON.parse(complete.toolCalls[0].arguments), { itemsCount: 1 });
});
}

for (const section of ['unit', 'materials']) {
test(`reading a helped but unpublished lesson exposes only metadata (${section})`, async t => {
    const h = await createClassroomFixture(); const gate = deferred();
    t.after(async () => { gate.resolve(); await h.dispose(); }); await h.openLesson();
    const before = structuredClone(h.profile());
    const secret = 'The ferry leaves at seven in the morning.';
    const lesson = structuredClone(fixtureLesson); lesson.materials[0].text = secret; lesson.exercises[0].skill = 'listening';
    h.flags.teacherResponse = async (request, round) => {
        if (round === 1) { return { toolCalls: [call('LearningLessonEdit', lesson)] }; }
        if (round === 2) {
            return { toolCalls: [call('LearningRead', { section })] };
        }
        assert.ok(request.messages.findLast(entry => entry.role === 'tool').content.includes(secret), 'Model still reads the actual draft');
        await gate.promise; return { text: '听力准备好了。' };
    };
    const pending = nextState(h, state => state.workbenchConversation.turns.at(-1)?.messages.some(entry => entry.toolName === 'LearningRead' && entry.content));
    const run = h.command('replace-lesson', { unitId: before.unit.id, message: '准备听力材料。' });
    assert.ok(!JSON.stringify((await pending).workbenchConversation).includes(secret));
    assert.notEqual(h.profile().unit.id, before.unit.id);
    await h.command('cancel'); gate.resolve(); await run;
    assert.ok(!JSON.stringify(h.state().workbenchConversation).includes(secret));
    h.flags.teacherResponse = ((_request, round) => round === 1
        ? { toolCalls: [call('LearningLessonEdit', lesson)] } : { text: '请先听一遍。' });
    await h.command('replace-lesson', { unitId: h.profile().unit.id, message: '使用同一段原文。' });
    const unit = h.profile().unit;
    assert.equal(unit.materials[0].paragraphs[0].text, secret);
    assert.equal(unit.materials[0].transcriptRevealed, false);
    h.flags.teacherResponse = (() => ({ text: '答案已收到。' }));
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.profile().unit.attempts[0].help.transcript, false);
});
}

test('extracted article body stays model-side when that source becomes an unseen listening lesson', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const sources = createLearningSourceRegistry();
    const secret = 'Unseen article for listening practice.';
    sources.add({ id: 'source-1', url: 'https://example.org/news', title: 'News', retrievedAt: '2026-09-18T00:00:00.000Z', paragraphs: [{ id: 'p1', text: secret }] });
    const research = createLearningResearch({ tavilyApiKey: 'fixture' }, { sources, signal: new AbortController().signal });
    const extracted = await research.executeTool('LearningExtract', { sourceId: 'source-1' });
    assert.equal(extracted.results[0].paragraphs[0].text, secret);
    const projected = learningMessageView({ role: 'tool', toolName: 'LearningExtract', content: JSON.stringify(extracted) });
    assert.ok(!projected.content.includes(secret));
    assert.equal(JSON.parse(projected.content).resultsCount, 1);
    const lesson = structuredClone(fixtureLesson);
    lesson.materials = [{ key: 'text', title: 'News', kind: 'original', sourceId: 'source-1', from: 1, through: 1 }];
    lesson.exercises[0].skill = 'listening';
    const session = createLearningSession(h.repository, { language: 'en', osId: h.store.peekCurrent().osId,
        inputScope: { kind: 'story', osId: h.store.peekCurrent().osId }, action: { kind: 'prepare', replaceCurrent: true }, sources });
    assert.equal(session.executeTool('LearningLessonEdit', lesson).ok, true);
    assert.equal((await session.commit(() => true)).status, 'confirmed');
    const unit = h.profile().unit;
    assert.equal(unit.materials[0].transcriptRevealed, false);
    h.flags.teacherResponse = (() => ({ text: '答案已收到。' }));
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.profile().unit.attempts[0].help.transcript, false);
});

for (const size of ['short', 'over-speech-limit', 'over-note-limit']) {
    test(`notes and narration use the complete visible turn (${size})`, async t => {
        t.mock.method(console, 'error', () => {});
        const spoken = [];
        const facade = { isEnabled: () => true,
            getVoices: () => ({ defaultVoice: 'fixture', voices: [{ id: 'fixture', available: true }] }),
            createPlayer: () => ({ activate: () => true, playNow: () => true, dispose() {}, setPlaybackRate: value => value }),
            synthesize: async text => { spoken.push(text); return new Blob(['fixture']); }, openSettings() {} };
        const h = await createClassroomFixture({ getTtsFacade: () => facade }); t.after(h.dispose); await h.openLesson();
        const exerciseId = h.profile().unit.exercises[0].id;
        const explanation = size === 'over-speech-limit' ? '解'.repeat(1001) : size === 'over-note-limit' ? '解'.repeat(4001)
            : '“do more than” 表示“不仅仅”。这句话把重点从树木的外观转向了作用。';
        const closing = 'Now try it yourself.';
        h.flags.teacherResponse = (request, round) => {
            if (round === 1) {
                request.onStreamProgress({ text: explanation, thoughts: [{ label: 'private', text: 'Not part of the note.' }] });
                return { text: explanation, toolCalls: [call('LearningRead', { section: 'unit' })] };
            }
            return { text: closing };
        };
        await h.command('talk', { exerciseId, message: '解释一下这个表达。' });
        const full = `${explanation}\n\n${closing}`;
        assert.equal(h.state().companionReply.text, full);
        assert.equal(h.state().conversation.turns.at(-1).teacher, full);
        await h.command('say-reply');
        assert.deepEqual(spoken, [...full].length > 1000 ? [] : [full]);
        await h.command('save-note');
        assert.deepEqual((h.profile().unit.notes ?? []).map(note => note.text), [...full].length > 4000 ? [] : [full]);
    });
}
