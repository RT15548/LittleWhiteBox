import assert from 'node:assert/strict';
import test from 'node:test';
import { learningMemory } from './fixtures/learning-memory.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { buildLearningContext } from '../apps/learning/agent/context.js';
import { buildLearningSystemPrompt } from '../apps/learning/agent/prompt.js';
import { runLearningProviderLoop } from '../apps/learning/agent/provider-loop.js';
import { summariseLearningHistory, LEARNING_SUMMARY_TRIGGER_TOKENS } from '../apps/learning/agent/history-compaction.js';
import { readLearning } from '../apps/learning/agent/data-projection.js';
import { createClassroomFixture } from './fixtures/learning-classroom.js';
import { createLearningTeaching } from '../apps/learning/application/teaching.js';

const readRequest = message => JSON.parse(message.content.split('<learning_request>\n').at(-1).split('\n</learning_request>')[0]);
const overflow = () => Object.assign(new Error('maximum context length exceeded'), { status: 400, code: 'context_length_exceeded' });
const turn = (name, content = name.repeat(300)) => ({ user: name, teacher: content, status: 'finished', message: '',
    messages: [{ role: 'user', content: name }, { role: 'assistant', content }] });
const bigHistory = () => [turn('earlier', 'Detailed classroom exchange. '.repeat(LEARNING_SUMMARY_TRIGGER_TOKENS / 5)), turn('recent-a'), turn('recent-b')];

test('coursework proceeds before history confirmation and later saves both stored and locally compacted history', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const port = learningMemory();
    const scope = { kind: 'story', osId: h.profile().unit.originOsId };
    const original = { summary: 'Stored summary.', archivedCount: 6, summaryReferences: ['old-unit'], summaryScope: scope,
        exchanges: [{ id: 'stored-turn', user: 'stored-question', reply: 'Stored reply.', replyTo: null, summarized: false, references: ['old-unit'], scope }] };
    await port.save(original, () => true);
    let ready = false; let calls = 0; let compacted = false;
    const teaching = createLearningTeaching({ actor: 'workbench', repository: h.repository, memory: () => port, historyReady: () => ready,
        current: () => ({ language: 'en', osId: scope.osId, chatIdentity: 'deferred-history', teacher: null }),
        capture: async () => assert.fail('Native coursework does not capture a companion'),
        gateway: { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: {}, supportsSessionToolLoop: false,
            run: async request => {
                if (!request.tools.length) { compacted = true; return { text: 'New-course summary.' }; }
                calls++;
                if (calls === 4) { throw overflow(); }
                return { text: 'Native coursework reply. '.repeat(100) };
            },
        }) },
    });
    t.after(teaching.reset);
    for (let index = 0; index < 4; index++) {
        const result = await teaching.run({ action: { kind: 'prepare' }, message: `new-${index}` });
        assert.equal(result.status, 'finished'); assert.equal(result.historySaved, false);
    }
    assert.equal(compacted, true);
    assert.deepEqual(await port.read(), original);
    const local = teaching.conversation();
    assert.ok(local.removedTurns > 0);
    const localIds = local.turns.map(turn => turn.id);
    ready = true;
    await teaching.hydrate(); await teaching.hydrate();
    assert.equal(teaching.conversation().removedTurns, original.archivedCount + local.removedTurns);
    assert.deepEqual(teaching.conversation().turns.map(turn => turn.id), ['stored-turn', ...localIds]);
    assert.equal((await teaching.run({ action: { kind: 'talk' }, message: 'continue' })).historySaved, true);
    const saved = await port.read();
    assert.equal(saved.summary, [original.summary, 'New-course summary.'].join('\n\n'));
    assert.deepEqual(saved.summaryScope, scope);
    assert.ok(saved.summaryReferences.includes('old-unit'));
    assert.deepEqual(saved.exchanges.slice(0, -1).map(exchange => exchange.id), ['stored-turn', ...localIds]);
});

test('concurrent work and chat compaction preserve both live turns and adopt the shared prefix only once', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const held = [];
    const overflowed = new Set();
    let mode = 'seed';
    let summariesReady;
    const ready = new Promise(resolve => { summariesReady = resolve; });
    const teaching = createLearningTeaching({ actor: 'workbench', memory: (() => { const port = learningMemory(); return () => port; })(), historyReady: () => true, repository: h.repository,
        current: () => ({ language: 'en', osId: h.profile().unit.originOsId, chatIdentity: 'concurrent-fixture', teacher: { name: 'Lin', note: '' } }),
        capture: async () => ({ teacherDetails: '', snapshot: { characters: [], player: { displayName: 'Learner', persona: '' },
            storyEvents: '', recentMessages: [], worldInfo: { before: '', after: '', depth: [] } } }),
        gateway: { loadConfig: async () => ({}), openSession: async () => ({ providerConfig: {}, supportsSessionToolLoop: false,
            run: (async request => {
                if (!request.tools.length) {
                    const source = JSON.parse(request.messages[0].content);
                    if (mode === 'probe') { assert.equal(source.summary, 'Adopted memory.'); return { text: 'Updated memory.' }; }
                    return new Promise(resolve => { held.push({ source, resolve }); if (held.length === 2) { summariesReady(); } });
                }
                const input = readRequest(request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>')));
                const key = `${mode}:${input.action.kind}`;
                if (mode !== 'seed' && !overflowed.has(key)) { overflowed.add(key); throw overflow(); }
                return { text: 'A complete published response. '.repeat(30) };
            }),
        }) },
    });
    t.after(() => { for (const entry of held) { entry.resolve({ text: 'Stopped test.' }); } teaching.reset(); });
    for (let index = 0; index < 3; index++) {
        assert.equal((await teaching.run({ action: { kind: 'talk' }, message: `seed-${index}` })).status, 'finished');
    }
    mode = 'concurrent';
    const work = teaching.run({ action: { kind: 'prepare' }, message: 'work' });
    const chat = teaching.run({ action: { kind: 'talk' }, message: 'chat' });
    await ready;
    assert.deepEqual(held[0].source, held[1].source);
    assert.equal(held[0].source.exchanges.length, 1);
    held[1].resolve({ text: 'Adopted memory.' });
    // Wait for the winning run's published finish before releasing the stale summary.
    assert.equal((await Promise.race([work, chat])).status, 'finished');
    held[0].resolve({ text: 'Stale memory.' });
    assert.deepEqual((await Promise.all([work, chat])).map(result => result.status), ['finished', 'finished']);
    const history = teaching.conversation();
    assert.equal(history.removedTurns, 1);
    assert.deepEqual(history.turns.map(entry => entry.user), ['seed-1', 'seed-2', 'work', 'chat']);
    assert.ok(history.turns.every(entry => entry.status === 'finished'));
    mode = 'probe';
    assert.equal((await teaching.run({ action: { kind: 'talk' }, message: 'probe' })).status, 'finished');
});

test('summary input contains published exchanges, never discarded teaching or private tool results', async () => {
    const history = turn('question', 'Published answer.');
    history.messages.push({ role: 'assistant', content: 'Discarded answer.', contentVisibility: 'private' },
        { role: 'tool', toolName: 'LearningRead', toolCallId: 'read', content: 'Private source.' });
    const summary = await summariseLearningHistory({ summary: '', turns: [history], signal: new AbortController().signal,
        guard: () => true, openSession: async () => ({ providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
            const source = JSON.parse(request.messages[0].content);
            assert.deepEqual(source.exchanges, [[{ role: 'user', content: 'question' }, { role: 'assistant', content: 'Published answer.' }]]);
            return { text: 'Safe summary.' };
        } }) });
    assert.equal(summary, 'Safe summary.');
});

test('finished exchanges omit private protocol payloads and measure only the published history', async () => {
    const history = [turn('old', 'answer'), turn('recent-a', 'recent answer a')];
    history[0].messages.splice(1, 0, { role: 'assistant', content: 'unpublished teaching text', contentVisibility: 'private',
        toolCalls: [{ id: 'old-read', name: 'Read', arguments: '{}' }],
        providerPayload: { openaiCompatibleMessage: { role: 'assistant', content: 'unpublished teaching text',
            reasoning_content: '思'.repeat(192000) } } }, { role: 'tool', content: 'private tool result', toolName: 'Read', toolCallId: 'old-read' });
    const original = structuredClone(history);
    const result = await runLearningProviderLoop({ systemPrompt: '', messages: [{ role: 'user', content: 'continue' }],
        tools: [], history, signal: new AbortController().signal, guard: () => true, executeTool: () => assert.fail(),
        reopen: () => assert.fail('Unsent private payloads must not trigger compaction'),
        agent: { providerConfig: { provider: 'openai-compatible', model: 'deepseek-chat' }, supportsSessionToolLoop: false,
            run: async request => {
                assert.deepEqual(request.messages, [
                    { role: 'user', content: 'old' }, { role: 'assistant', content: 'answer' },
                    { role: 'user', content: 'recent-a' }, { role: 'assistant', content: 'recent answer a' },
                    { role: 'user', content: 'continue' },
                ]);
                return { text: 'Continue with this question.' };
            } },
    });
    assert.equal(result.status, 'finished');
    assert.deepEqual(history, original);
});

test('learning rejects an expanding summary when old tool reasoning is not replayed across the current user boundary', async () => {
    const config = { provider: 'openai-compatible', model: 'deepseek-chat', apiKey: 'test-only', reasoning: { mode: 'off' } };
    const calls = [{ id: 'old-read', type: 'function', function: { name: 'Read', arguments: '{}' } }];
    const history = [{ user: 'old', teacher: 'answer', messages: [
        { role: 'user', content: 'old' },
        { role: 'assistant', content: '', toolCalls: [{ id: 'old-read', name: 'Read', arguments: '{}' }], providerPayload: { openaiCompatibleMessage: {
            role: 'assistant', content: '', tool_calls: calls, reasoning_content: '思'.repeat(192000),
        } } },
        { role: 'tool', toolCallId: 'old-read', toolName: 'Read', content: '{}' },
    ] }];
    const events = []; let published = 0;
    const result = await runLearningProviderLoop({ history, systemPrompt: 'teacher', messages: [{ role: 'user', content: 'continue' }],
        tools: [{ type: 'function', function: { name: 'Read', parameters: {} } }],
        signal: new AbortController().signal, guard: () => true, executeTool: () => assert.fail('no tools expected'),
        onCompact: () => { published++; },
        agent: { providerConfig: config, supportsSessionToolLoop: false, run: async () => { events.push('teacher'); throw overflow(); } },
        reopen: async () => ({ providerConfig: config, supportsSessionToolLoop: false, run: async () => {
            events.push('summary'); return { text: 'An unnecessarily long summary. '.repeat(200) };
        } }),
    });
    assert.equal(result.status, 'failed'); assert.equal(result.reason, 'learning_context_full');
    assert.deepEqual(events, ['teacher', 'summary']); assert.equal(published, 0);
});

test('identity/core settings form a stable prefix, while one latest user message carries fresh learning and story data', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const data = h.repository.snapshot().document.data;
    const context = { teacherDetails: '共同经历'.repeat(1500), snapshot: {
        characters: [{ characterKey: 'card-1', displayName: '故事卡', description: '老师的完整背景'.repeat(1000), personality: '严谨但温和', scenario: '城市' }],
        player: { displayName: '学生', persona: '当前故事人物' }, storyEvents: '已经约好下次去海边', recentMessages: [],
        worldInfo: { before: '世界设定'.repeat(2000), after: '', depth: [] },
    } };
    const input = { actor: 'companion', data, context, language: 'en', osId: h.profile().unit.originOsId, teacher: { name: '林老师', note: '' },
        action: { kind: 'talk' }, message: '哈喽，今天想练写作。', asOf: '2026-09-07T10:00:00Z' };
    const first = buildLearningContext(input);
    assert.deepEqual(first.prefix.map(message => message.role), ['system']);
    assert.deepEqual(first.messages.map(message => message.role), ['user']);
    assert.notEqual(buildLearningSystemPrompt('companion', '林老师', input.action), buildLearningSystemPrompt('companion', '小王', input.action));
    assert.notEqual(buildLearningSystemPrompt('companion', '林老师', input.action), buildLearningSystemPrompt('companion', '林老师', { kind: 'companion' }));
    const reference = JSON.parse(first.prefix[0].content.split('<teacher_reference>\n')[1].split('\n</teacher_reference>')[0]);
    assert.equal(reference.characters[0].description, context.snapshot.characters[0].description);
    assert.ok(first.messages[0].content.split('</learning_request>')[1].endsWith(input.message));
    const request = readRequest(first.messages[0]);
    assert.equal(request.message, undefined, 'the learner speaks directly, rather than through a nested JSON field');
    assert.equal(request.background.teacher.text, context.teacherDetails);
    assert.equal(request.background.storyEvents.text, context.snapshot.storyEvents);
    assert.ok(request.background.worldInfo.nextOffset > 0);
    assert.deepEqual(request.profile, readLearning(data, 'en', input.osId, {}, input.asOf).data);
    const changed = structuredClone(input);
    changed.asOf = '2026-09-08T10:00:00Z'; changed.message = '今天换个话题。';
    changed.data.profiles[0].selfAssessment = '今天更有信心'; changed.context.teacherDetails = '新的人物近况';
    changed.context.snapshot.storyEvents = '已经从海边回来';
    const second = buildLearningContext(changed);
    assert.deepEqual(second.prefix, first.prefix);
    assert.notDeepEqual(second.messages, first.messages);
    assert.ok(!first.turn.content.includes('<learning_request>'), 'old turns do not accumulate obsolete asset snapshots');
    changed.context.snapshot.characters[0].personality = '更新的核心设定';
    assert.notDeepEqual(buildLearningContext(changed).prefix, first.prefix);
});

for (const session of [false, true]) {
    test(`live request data replaces stale state without altering the stable prefix or repeating tools (session: ${session})`, async () => {
        const states = [false, true, true, false, false];
        let round = 0; let executions = 0; let providerMessages = [];
        const requests = []; const transcript = [];
        const history = [turn('earlier', 'An earlier exchange.')];
        const prefix = [{ role: 'system', content: 'Character reference.' }];
        const result = await runLearningProviderLoop({
            systemPrompt: 'Companion identity.', prefix, history, summaryPrompt: 'Summarise conversation.',
            messages: () => [{ role: 'user', content: JSON.stringify({ busy: states[round] }) }],
            tools: [{ function: { name: 'Read' } }], signal: new AbortController().signal, guard: () => true, transcript,
            executeTool: () => { executions++; round++; return { ok: true }; },
            agent: { providerConfig: {}, supportsSessionToolLoop: session, run: async request => {
                requests.push(request);
                const continuing = session && (round === 2 || round === 4);
                assert.equal(request.toolResponses !== undefined, continuing);
                if (continuing) { assert.deepEqual(request.messages, []); assert.equal(request.toolResponses.length, 1); }
                else {
                    providerMessages = request.messages;
                    assert.deepEqual(providerMessages.slice(0, 1), prefix);
                    assert.deepEqual(providerMessages.slice(1, 3), history[0].messages);
                    assert.equal(providerMessages.filter(message => message.role === 'tool').length, round);
                }
                assert.equal(JSON.parse(providerMessages[3].content).busy, states[round]);
                return round === 4 ? { text: 'Let us keep talking.' }
                    : { toolCalls: [{ id: `read-${round}`, name: 'Read', arguments: '{}' }] };
            } },
        });
        assert.equal(result.status, 'finished'); assert.equal(executions, 4); assert.equal(requests.length, 5);
        assert.equal(new Set(requests.map(request => request.systemPrompt)).size, 1);
        assert.equal(transcript.filter(message => message.role === 'user').length, 0);
    });
}

test('proactive summarisation precedes the teacher request and leaves subsequent tool exchanges append-only', async () => {
    const history = bigHistory(); const original = structuredClone(history);
    const events = []; const published = []; const requests = [];
    const summary = 'The learner prefers concrete grammar examples; next practise cause and effect.';
    let writes = 0;
    const teacher = { providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
        events.push('teacher'); requests.push(structuredClone({ ...request, signal: undefined, onStreamProgress: undefined }));
        return requests.length === 1 ? { toolCalls: [{ id: 'write-1', name: 'Write', arguments: '{}' }] } : { text: '继续。' };
    } };
    const result = await runLearningProviderLoop({ agent: teacher, history, historySummary: 'Previous agreement.',
        systemPrompt: 'Identity and teaching rules.', prefix: [{ role: 'system', content: 'Core reference.' }],
        messages: [{ role: 'user', content: 'Today: practise cause and effect.' }], tools: [{ function: { name: 'Write' } }],
        signal: new AbortController().signal, guard: () => true,
        onCompact: (count, text) => published.push({ count, text }),
        reopen: async () => ({ ...teacher, run: async request => {
            if (request.tools.length) { return teacher.run(request); }
            events.push('summary');
            const source = JSON.parse(request.messages[0].content);
            assert.equal(source.summary, 'Previous agreement.'); assert.equal(source.exchanges.length, 1);
            assert.equal(source.exchanges[0][0].content, 'earlier');
            assert.ok(!source.exchanges.flat().some(message => message.content === 'recent-a'));
            return { text: summary };
        } }),
        executeTool: () => { writes++; return { ok: true }; },
    });
    assert.equal(result.status, 'finished'); assert.equal(result.removedTurns, 1);
    assert.deepEqual(events, ['summary', 'teacher', 'teacher']);
    assert.deepEqual(published, [{ count: 1, text: summary }]); assert.equal(writes, 1);
    assert.deepEqual(history, original, 'the owner adopts a successful summary explicitly');
    assert.equal(requests[0].messages[0].content, 'Core reference.');
    assert.equal(requests[0].messages[1].role, 'system');
    assert.ok(requests[0].messages[1].content.includes(summary));
    assert.deepEqual(requests[1].messages.slice(0, requests[0].messages.length), requests[0].messages);
});

test('failed, incomplete, non-shrinking and late summaries never replace the old conversation', async t => {
    for (const mode of ['failed', 'MAX_TOKENS', 'content_filter', 'incomplete', 'larger', 'cancelled', 'changed']) {
        await t.test(mode, async () => {
            const controller = new AbortController(); let current = true; let published = 0; let teacherCalls = 0;
            const history = bigHistory();
            const result = await runLearningProviderLoop({ history, systemPrompt: 'teacher', messages: [], tools: [],
                signal: controller.signal, guard: () => current, executeTool: () => assert.fail('summary cannot execute teaching tools'),
                onCompact: () => { published++; },
                agent: { providerConfig: {}, supportsSessionToolLoop: false, run: async () => { teacherCalls++; return { text: 'teacher' }; } },
                reopen: async () => ({ providerConfig: {}, supportsSessionToolLoop: false, run: async () => {
                    if (mode === 'failed') { throw new Error('network'); }
                    if (['MAX_TOKENS', 'content_filter', 'incomplete'].includes(mode)) {
                        throw Object.assign(new Error('Model response did not complete normally.'), {
                            code: mode === 'MAX_TOKENS' ? 'AGENT_RESPONSE_TRUNCATED' : 'AGENT_RESPONSE_INCOMPLETE', reason: mode,
                        });
                    }
                    if (mode === 'larger') { return { text: history[0].teacher.repeat(2) }; }
                    if (mode === 'cancelled') { controller.abort(); }
                    if (mode === 'changed') { current = false; }
                    return { text: 'Late summary.' };
                } }),
            });
            assert.equal(result.status, mode === 'cancelled' || mode === 'changed' ? 'cancelled' : mode === 'larger' ? 'finished' : 'failed');
            if (result.status === 'failed') { assert.equal(result.reason, 'learning_summary_failed'); }
            assert.equal(published, 0); assert.equal(teacherCalls, mode === 'larger' ? 1 : 0); assert.equal(history.length, 3);
        });
    }
});

test('Responses summary refusals preserve classroom history for retry, without treating quoted refusal text as a refusal', async t => {
    const refusal = 'I cannot summarize this conversation.';
    const summary = `The learner asked about the sentence "${refusal}"; next explain modal verbs.`;
    for (const mode of ['refusal', 'mixed', 'ordinary summary']) {
        await t.test(mode, async () => {
            const history = bigHistory(); const original = structuredClone(history);
            let historySummary = 'Previously agreed to practise modal verbs.';
            let reject = mode !== 'ordinary summary'; let teacherCalls = 0;
            const sources = []; const published = [];
            const config = { provider: 'openai-responses', apiKey: 'test-only-not-used', model: 'gpt-4.1', maxTokens: 10000 };
            const run = () => runLearningProviderLoop({ history, historySummary,
                systemPrompt: 'teacher', messages: [{ role: 'user', content: 'Continue the lesson.' }], tools: [],
                signal: new AbortController().signal, guard: () => true,
                executeTool: () => assert.fail('summary cannot execute teaching tools'),
                agent: { providerConfig: config, supportsSessionToolLoop: false, run: async () => { teacherCalls++; return { text: '继续。' }; } },
                onCompact: (count, text) => { published.push({ count, text }); history.splice(0, count); historySummary = text; },
                reopen: async () => {
                    const adapter = new OpenAIResponsesAdapter(config);
                    // Exercise the real response parser; replace only the network boundary.
                    adapter.client.responses.create = async body => {
                        sources.push(JSON.parse(body.input[0].content[0].text));
                        const content = reject ? [{ type: 'refusal', refusal }] : [{ type: 'output_text', text: summary }];
                        if (reject && mode === 'mixed') { content.unshift({ type: 'output_text', text: 'A partial summary.' }); }
                        return { status: 'completed',
                            ...(reject && mode === 'mixed' ? { output_text: 'A partial summary.' } : {}),
                            output: [{ id: 'msg_summary', type: 'message', role: 'assistant', status: 'completed', content }] };
                    };
                    return { providerConfig: config, supportsSessionToolLoop: false, run: request => adapter.chat(request) };
                },
            });
            const result = await run();
            if (reject) {
                assert.equal(result.status, 'failed'); assert.equal(result.reason, 'learning_summary_failed');
                assert.deepEqual(history, original); assert.deepEqual(published, []);
                assert.equal(historySummary, 'Previously agreed to practise modal verbs.');
                assert.equal(teacherCalls, 0); assert.equal(sources.length, 1);
                reject = false;
                const retried = await run();
                assert.equal(retried.status, 'finished'); assert.equal(retried.removedTurns, 1);
                assert.deepEqual(sources[1], sources[0], 'retry still has the original summary and exchanges');
            } else {
                assert.equal(result.status, 'finished'); assert.equal(result.removedTurns, 1);
            }
            assert.deepEqual(published, [{ count: 1, text: summary }]);
            assert.deepEqual(history, original.slice(1)); assert.equal(teacherCalls, 1);
        });
    }
});

test('a non-shrinking summary is not retried for unchanged history during later tool rounds', async () => {
    const history = bigHistory(); const sizes = []; const requests = []; let published = 0;
    const result = await runLearningProviderLoop({ history, systemPrompt: 'teacher', messages: [{ role: 'user', content: '继续' }],
        tools: [{ function: { name: 'Read' } }], signal: new AbortController().signal, guard: () => true,
        executeTool: () => ({ ok: true }), onCompact: () => { published++; },
        agent: { providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
            requests.push(request);
            return requests.length < 3 ? { toolCalls: [{ id: `read-${requests.length}`, name: 'Read', arguments: '{}' }] } : { text: '读好了。' };
        } },
        reopen: async () => ({ providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
            sizes.push(JSON.parse(request.messages[0].content).exchanges.length);
            return { text: history[0].teacher.repeat(2) };
        } }),
    });
    assert.equal(result.status, 'finished'); assert.equal(published, 0);
    assert.deepEqual(sizes, [1, 2, 3], 'try wider whole-exchange windows once, not once per tool round');
    assert.equal(requests.length, 3);
    for (const request of requests) { assert.deepEqual(JSON.parse(JSON.stringify(request.messages.slice(0, 6))), history.flatMap(entry => entry.messages).map(entry => ({ ...entry, content: entry.content.trim() }))); }
});

test('summary can include more old exchanges when the oldest alone cannot shrink', async t => {
    for (const proactive of [true, false]) {
        await t.test(proactive ? 'proactive' : 'provider overflow', async () => {
            const history = [turn('hello', 'hi'), turn('long', 'Important discussion. '.repeat(proactive ? 50_000 : 100)), turn('recent')];
            const sizes = []; const published = []; let teacherCalls = 0; let resumed;
            const teacher = { providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
                teacherCalls++;
                if (!proactive && teacherCalls === 1) { throw overflow(); }
                resumed = request; return { text: '继续。' };
            } };
            const result = await runLearningProviderLoop({ history, systemPrompt: 'teacher', tools: [{ function: { name: 'Read' } }],
                messages: [{ role: 'user', content: '继续' }], signal: new AbortController().signal, guard: () => true,
                agent: teacher, executeTool: () => assert.fail('no tools requested'),
                onCompact: count => published.push(count), reopen: async () => ({ ...teacher, run: async request => {
                    if (request.tools.length) { return teacher.run(request); }
                    sizes.push(JSON.parse(request.messages[0].content).exchanges.length);
                    return { text: 'The student needs another example contrasting the present perfect with the simple past.' };
                } }),
            });
            assert.equal(result.status, 'finished'); assert.equal(result.removedTurns, 2);
            assert.deepEqual(sizes, [1, 2]); assert.deepEqual(published, [2]);
            assert.deepEqual(JSON.parse(JSON.stringify(resumed.messages.slice(1, 3))), history[2].messages);
        });
    }
});

test('proactive compaction during a session tool exchange replays results once and honours cancellation while reopening', async t => {
    for (const cancel of [false, true]) {
        await t.test(cancel ? 'cancelled reopen' : 'continued exchange', async () => {
            const controller = new AbortController(); let opened = 0; let writes = 0; let resumed = 0;
            const article = 'Article. '.repeat(30_000);
            const result = await runLearningProviderLoop({
                history: [turn('earlier', 'Before. '.repeat(40_000)), turn('recent-a'), turn('recent-b')],
                systemPrompt: 'teacher', messages: [{ role: 'user', content: '继续读文章' }], tools: [{ function: { name: 'Read' } }],
                signal: controller.signal, guard: () => true, executeTool: () => { writes++; return { article }; },
                agent: { providerConfig: {}, supportsSessionToolLoop: true, run: async () => ({ toolCalls: [{ id: 'read-current', name: 'Read', arguments: '{}' }] }) },
                reopen: async () => {
                    opened++;
                    if (opened === 2 && cancel) { controller.abort(); }
                    return { providerConfig: {}, supportsSessionToolLoop: true, run: async request => {
                        if (!request.tools.length) { return { text: 'We agreed to compare the two arguments in the article.' }; }
                        resumed++;
                        assert.equal(request.toolResponses, undefined, 'the new session receives the complete current exchange');
                        const results = request.messages.filter(message => message.role === 'tool');
                        assert.equal(results.length, 1); assert.equal(results[0].tool_call_id, 'read-current');
                        assert.equal(JSON.parse(results[0].content).article, article);
                        return { text: '我们来看看这篇文章。' };
                    } };
                },
            });
            assert.equal(result.status, cancel ? 'cancelled' : 'finished');
            assert.equal(opened, 2); assert.equal(writes, 1); assert.equal(resumed, cancel ? 0 : 1);
        });
    }
});

test('learning summaries leave both small and large output budgets to the Agent API', async () => {
    for (const maxTokens of [5000, 32000]) {
        let calls = 0;
        const summary = await summariseLearningHistory({ turns: [turn('earlier')], summary: '', guard: () => true,
            signal: new AbortController().signal,
            openSession: async () => ({ providerConfig: { maxTokens }, async run(request) {
                calls++;
                assert.equal(request.maxTokens, undefined);
                return { text: 'remembered facts' };
            } }) });
        assert.equal(calls, 1);
        assert.equal(summary, 'remembered facts');
    }
});

test('a smaller provider window splits summary input by complete exchanges and carries the earlier summary forward', async () => {
    const sources = [];
    const history = ['a', 'b', 'c', 'd'].map(name => turn(name, name.repeat(2000)));
    const summary = await summariseLearningHistory({ turns: history, summary: 'Initial agreement.', guard: () => true,
        signal: new AbortController().signal, openSession: async () => ({ providerConfig: { maxTokens: 5000 }, supportsSessionToolLoop: false,
            run: async request => {
                assert.equal(request.maxTokens, undefined);
                const source = JSON.parse(request.messages[0].content); sources.push(source);
                if (source.exchanges.length > 2) { throw overflow(); }
                return { text: `${source.summary} ${source.exchanges.map(exchange => exchange[0].content).join(',')}` };
            } }),
    });
    assert.equal(sources.length, 3); assert.equal(sources[1].exchanges.length, 2);
    assert.equal(sources[2].summary, 'Initial agreement. a,b');
    assert.equal(summary, 'Initial agreement. a,b c,d');
});

test('classroom summary survives APP reentry, but never becomes an asset or survives explicit clear or a chat switch', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const saved = h.repository.snapshot().document;
    const requests = []; let summaries = 0; let largeReplies = 3;
    h.flags.teacherResponse = (request => {
        if (!request.tools.length) { summaries++; return { text: 'CLASSROOM_MEMORY: learner wants concrete examples.' }; }
        requests.push(structuredClone({ ...request, signal: undefined, onStreamProgress: undefined }));
        return { text: largeReplies-- > 0 ? 'A detailed teaching discussion. '.repeat(8000) : '继续举例。' };
    });
    for (let i = 0; i < 4; i++) { await h.command('talk', { message: `交流 ${i}` }); }
    assert.ok(summaries > 0); assert.ok(h.state().conversation.removedTurns > 0);
    const calls = h.counts.provider; await h.reenter(); assert.equal(h.counts.provider, calls);
    await h.command('talk', { message: '继续之前的例子。' });
    assert.ok(requests.at(-1).messages.some(message => message.content.includes('CLASSROOM_MEMORY')));
    assert.deepEqual(h.repository.snapshot().document, saved);
    await h.command('forget-conversation'); await h.command('talk', { message: '从新的问题开始。' });
    assert.ok(!requests.at(-1).messages.some(message => message.content.includes('CLASSROOM_MEMORY')));
    assert.deepEqual(h.repository.snapshot().document, saved);
    await h.changeChat(); await h.command('teacher', { teacher: { name: '另一位老师', note: '' } });
    await h.command('talk', { message: '我想继续学语言。' });
    assert.ok(!requests.at(-1).messages.some(message => message.content.includes('CLASSROOM_MEMORY')));
    assert.deepEqual(h.repository.snapshot().document, saved);
});
