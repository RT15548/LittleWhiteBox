import assert from 'node:assert/strict';
import test from 'node:test';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { buildLearningContext } from '../apps/learning/agent/context.js';
import { buildLearningSystemPrompt } from '../apps/learning/agent/prompt.js';
import { runLearningProviderLoop } from '../apps/learning/agent/provider-loop.js';
import { summariseLearningHistory, LEARNING_SUMMARY_TRIGGER_TOKENS } from '../apps/learning/agent/history-compaction.js';
import { readLearning } from '../apps/learning/agent/data-projection.js';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

const readRequest = message => JSON.parse(message.content.split('<learning_request>\n').at(-1).split('\n</learning_request>')[0]);
const overflow = () => Object.assign(new Error('maximum context length exceeded'), { status: 400, code: 'context_length_exceeded' });
const turn = (name, content = name.repeat(300)) => ({ user: name, teacher: content,
    messages: [{ role: 'user', content: name }, { role: 'assistant', content }] });
const bigHistory = () => [turn('earlier', 'Detailed classroom exchange. '.repeat(LEARNING_SUMMARY_TRIGGER_TOKENS / 5)), turn('recent-a'), turn('recent-b')];

test('identity/core settings form a stable prefix, while one latest user message carries fresh learning and story data', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const data = h.repository.snapshot().document.data;
    const context = { teacherDetails: '共同经历'.repeat(1500), snapshot: {
        characters: [{ characterKey: 'card-1', displayName: '故事卡', description: '老师的完整背景'.repeat(1000), personality: '严谨但温和', scenario: '城市' }],
        player: { displayName: '学生', persona: '当前故事人物' }, storyEvents: '已经约好下次去海边', recentMessages: [],
        worldInfo: { before: '世界设定'.repeat(2000), after: '', depth: [] },
    } };
    const input = { data, context, language: 'en', osId: h.profile().unit.originOsId, teacher: { name: '林老师', note: '' },
        action: { kind: 'talk' }, message: '哈喽，今天想练写作。', asOf: '2026-09-07T10:00:00Z' };
    const first = buildLearningContext(input);
    assert.deepEqual(first.prefix.map(message => message.role), ['system']);
    assert.deepEqual(first.messages.map(message => message.role), ['user']);
    assert.ok(buildLearningSystemPrompt('林老师').includes('【林老师】'));
    assert.notEqual(buildLearningSystemPrompt('林老师'), buildLearningSystemPrompt('小王'));
    const reference = JSON.parse(first.prefix[0].content.split('<teacher_reference>\n')[1].split('\n</teacher_reference>')[0]);
    assert.equal(reference.characters[0].description, context.snapshot.characters[0].description);
    assert.ok(first.messages[0].content.startsWith(`[学生本轮发言]\n${input.message}`));
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

test('proactive summarisation precedes the teacher request and leaves subsequent tool exchanges append-only', async () => {
    const history = bigHistory(); const original = structuredClone(history);
    const events = []; const published = []; const requests = [];
    const summary = 'The learner prefers concrete grammar examples; next practise cause and effect.';
    let writes = 0;
    const teacher = { providerConfig: {}, supportsSessionToolLoop: false, run: async request => {
        events.push('teacher'); requests.push(structuredClone({ ...request, signal: undefined }));
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
                    if (['MAX_TOKENS', 'content_filter', 'incomplete'].includes(mode)) { return { text: 'partial summary', finishReason: mode }; }
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
    for (const request of requests) { assert.deepEqual(request.messages.slice(0, 6), history.flatMap(entry => entry.messages)); }
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
            assert.deepEqual(resumed.messages.slice(1, 3), history[2].messages);
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

test('a smaller provider window splits summary input by complete exchanges and carries the earlier summary forward', async () => {
    const sources = [];
    const history = ['a', 'b', 'c', 'd'].map(name => turn(name, name.repeat(2000)));
    const summary = await summariseLearningHistory({ turns: history, summary: 'Initial agreement.', guard: () => true,
        signal: new AbortController().signal, openSession: async () => ({ providerConfig: { maxTokens: 5000 }, supportsSessionToolLoop: false,
            run: async request => {
                assert.equal(request.maxTokens, 5000);
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
    h.flags.teacherResponse = request => {
        if (!request.tools.length) { summaries++; return { text: 'CLASSROOM_MEMORY: learner wants concrete examples.' }; }
        requests.push(structuredClone({ ...request, signal: undefined }));
        return { text: largeReplies-- > 0 ? 'A detailed teaching discussion. '.repeat(8000) : '继续举例。' };
    };
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
