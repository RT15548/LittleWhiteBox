import assert from 'node:assert/strict';
import test from 'node:test';
import { runAdministratorLoop } from '../apps/administrator/agent/provider-loop.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';
import { estimateTokenCount, estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { createAdministratorData, parseAdministratorData } from '../apps/administrator/domain/data.js';
import { administratorContext, contextUsage, summarizeAdministrator } from '../apps/administrator/agent/history.js';

const turn = (id, text) => ({ id, createdAt: 1, user: { text }, assistant: text, toolMessages: [], operations: [], status: 'finished', error: '' });
const createState = history => ({ turns: [...history, { ...turn('current', 'current request'), assistant: null, status: 'interrupted' }], summary: null });
function options(state, gateway, execute = async () => ({ status: 'read', data: 'evidence' })) {
    const tools = [{ type: 'function', function: { name: 'Read', parameters: {} } }];
    return { state, gateway, config: {}, system: 'administrator fixture', prefix: [], request: { role: 'user', content: 'current request' }, requestForCounting: { role: 'user', content: 'current request' }, imageCount: 0,
        getTools: () => tools, signal: new AbortController().signal, execute, async save() {}, onText() {}, onPhase() {}, onContext() {} };
}
test('summary inherits the user Agent API configuration without overriding generation settings', async () => {
    const config = { currentPresetName: 'user-selected' };
    let calls = 0;
    const gateway = { async openSession(received) {
        assert.equal(received, config);
        return { async run(request) {
            calls++;
            for (const setting of ['maxTokens', 'temperature', 'reasoning']) {
                assert.equal(request[setting], undefined);
            }
            return { text: 'brief' };
        } };
    } };
    await summarizeAdministrator({ gateway, config, summary: '', messages: [{ role: 'user', content: 'Retain the confirmed project decisions.' }], signal: new AbortController().signal });
    assert.equal(calls, 1);
});

test('explicit context overflow compacts full exchanges, reopens native session, and retries the model once without replaying business tools', async () => {
    const state = createState([turn('old', 'Earlier user request. '.repeat(200)), turn('recent', 'Recent facts. '.repeat(100))]);
    let sessions = 0, requests = 0, executions = 0, summaries = 0; const replayed = [];
    const gateway = { async openSession() { sessions++; return { supportsSessionToolLoop: true, providerConfig: {}, async run(request) {
        if (!request.tools.length) { summaries++; return { text: 'Old request and confirmed facts.' }; }
        requests++; replayed.push(request);
        if (requests === 1) { return { toolCalls: [{ id: 'provider-call', name: 'Read', arguments: '{}' }] }; }
        if (requests === 2) { throw Object.assign(new Error('context exhausted'), { code: 'context_length_exceeded' }); }
        return { text: 'Done.' };
    } }; } };
    assert.equal(await runAdministratorLoop(options(state, gateway, async () => { executions++; return { status: 'saved' }; })), 'Done.');
    assert.equal(executions, 1); assert.equal(summaries, 1); assert.equal(requests, 3); assert.equal(sessions, 3);
    assert.ok(replayed[1].toolResponses); assert.equal(replayed[1].messages.length, 0);
    assert.ok(replayed[2].messages.length); assert.equal(replayed[2].toolResponses, undefined);
    assert.equal(replayed[2].messages.filter(m => m.tool_calls || m.role === 'tool').length, 0);
    assert.equal(state.summary.throughId, 'current');
    assert.deepEqual(replayed[2].messages.at(-1), { role: 'user', content: 'current request' });
});
test('failed or non-shrinking compression does not drop retained history and overflow gets at most one retry', async () => {
    for (const failure of ['throws', 'grows', 'overflows-again']) {
        const original = [turn('old', 'old content '.repeat(100))], state = createState(original); let requests = 0;
        const gateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run(request) {
            if (!request.tools.length) { if (failure === 'throws') { throw new Error('summary offline'); } return { text: failure === 'grows' ? 'longer '.repeat(10000) : 'brief' }; }
            requests++; throw Object.assign(new Error('too long'), { code: 'context_length_exceeded' });
        } }; } };
        await assert.rejects(runAdministratorLoop(options(state, gateway)));
        assert.equal(requests, failure === 'overflows-again' ? 2 : 1);
        assert.deepEqual(state.turns.slice(0, -1), original);
        if (failure !== 'overflows-again') { assert.equal(state.summary, null); }
    }
});
test('reused provider call IDs in separate rounds do not alias execution checkpoints', async () => {
    const state = createState([]); let requests = 0; const keys = [];
    const gateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run() { return requests++ < 2
        ? { toolCalls: [{ id: 'same-id', name: 'Read', arguments: '{}' }] } : { text: 'finished' }; } }; } };
    await runAdministratorLoop(options(state, gateway, async (_, __, id) => { keys.push(id); return {}; }));
    assert.equal(keys.length, 2); assert.notEqual(keys[0], keys[1]);
});

test('the threshold summarizes all retained exchanges together, including recent turns and the existing summary', async () => {
    const state = createState(Array.from({ length: 9 }, (_, i) => turn(String(i), '核'.repeat(10000))));
    state.summary = { text: 'previous confirmed facts', throughId: '0', throughToolMessage: null };
    const before = structuredClone(state.turns), expected = administratorContext(state, { role: 'user', content: 'current request' }).messages.slice(1);
    let summaries = 0;
    const gateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run(request) {
        if (!request.tools.length) {
            summaries++;
            assert.ok(estimateTokenCount(request.systemPrompt) + estimateTokenCount(request.messages[0].content) < ADMINISTRATOR_POLICY.inputBudget);
            const input = JSON.parse(request.messages[0].content);
            assert.equal(input.summary, 'previous confirmed facts');
            assert.deepEqual(input.exchanges, expected);
            return { text: '已核实此前沟通，未遗留写入。' };
        }
        return { text: '完成核对。' };
    } }; } };
    await runAdministratorLoop(options(state, gateway));
    assert.equal(summaries, 1);
    assert.deepEqual(state.turns.slice(0, -1), before.slice(0, -1));
    assert.equal(administratorContext(state).messages.filter(message => message.role === 'user').length, 1);
});

test('history below the summary threshold reaches the model without premature compaction', async () => {
    const state = createState(Array.from({ length: 5 }, (_, i) => turn(String(i), '核'.repeat(10_000))));
    let summaries = 0;
    const counts = [];
    const gateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run(request) {
        if (!request.tools.length) { summaries++; return { text: 'summary' }; }
        return { text: 'done' };
    } }; } };
    await runAdministratorLoop({ ...options(state, gateway), onContext: usage => counts.push(usage) });
    assert.equal(summaries, 0);
    assert.equal(state.turns.length, 6);
    assert.ok(counts[0].used > 80_000 && counts[0].used < ADMINISTRATOR_POLICY.summaryTrigger);
    assert.equal(counts[0].limit, ADMINISTRATOR_POLICY.inputBudget);
});

test('fifteen 10000-character replies with native payloads summarize once without duplicating or deleting originals', async t => {
    const reply = '答'.repeat(10000);
    const state = createState(Array.from({ length: 15 }, (_, i) => ({ ...turn(String(i), `question ${i}`), assistant: reply,
        assistantPayload: { openaiCompatibleMessage: { role: 'assistant', content: reply } },
    })));
    const before = structuredClone(state.turns);
    let summaries = 0, replies = 0, summaryTokens = 0;
    const gateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run(request) {
        if (!request.tools.length) {
            summaries++;
            summaryTokens = estimateTokenCount(request.messages[0].content);
            const input = JSON.parse(request.messages[0].content);
            assert.deepEqual(input.exchanges, before.flatMap(item => [
                { role: 'user', content: item.user.text },
                ...(item.assistant ? [{ role: 'assistant', content: item.assistant }] : []),
            ]));
            return { text: 'All fifteen replies condensed.' };
        }
        replies++;
        return { text: 'done' };
    } }; } };
    const settings = options(state, gateway);
    const normalTokens = contextUsage(settings.system, settings.getTools(), settings.prefix,
        administratorContext(state, settings.requestForCounting), 0, {}).used;
    assert.ok(normalTokens >= ADMINISTRATOR_POLICY.summaryTrigger);
    await runAdministratorLoop(settings);
    assert.equal(summaries, 1); assert.equal(replies, 1);
    assert.equal(state.summary.throughId, '14');
    assert.deepEqual(state.turns.slice(0, -1), before.slice(0, -1));
    t.diagnostic(`normal request estimate: ${normalTokens}; summary input estimate: ${summaryTokens}`);
});

test('summary input retains readable reasoning and paired tool evidence once, excluding native replay copies and signatures', async () => {
    const content = 'checking source', reasoning = 'check the latest record before changing it';
    const tool_calls = [{ id: 'read', type: 'function', function: { name: 'Read', arguments: '{"id":"record"}' } }];
    const googleContent = { role: 'model', parts: [{ text: reasoning, thought: true, thoughtSignature: 'opaque' },
        { text: content }, { functionCall: { id: 'read', name: 'Read', args: { id: 'record' } } }] };
    for (const providerPayload of [
        { openaiCompatibleMessage: { role: 'assistant', content, reasoning_content: reasoning, tool_calls } },
        { anthropicContent: [{ type: 'thinking', thinking: reasoning, signature: 'opaque' }, { type: 'text', text: content },
            { type: 'tool_use', id: 'read', name: 'Read', input: { id: 'record' } }] },
        { googleContent, googleContents: [googleContent] },
    ]) {
        const messages = [{ role: 'user', content: 'check record' }, { role: 'assistant', content, tool_calls, providerPayload },
            { role: 'tool', tool_call_id: 'read', toolName: 'Read', content: '{"status":"read","data":{"id":"record"}}' }];
        const before = structuredClone(messages);
        const gateway = { async openSession() { return { async run(request) {
            assert.deepEqual(JSON.parse(request.messages[0].content), { summary: 'earlier facts', exchanges: [
                messages[0], { role: 'assistant', content, tool_calls, reasoning }, messages[2],
            ] });
            return { text: 'brief' };
        } }; } };
        assert.equal(await summarizeAdministrator({ gateway, config: {}, summary: 'earlier facts', messages, signal: new AbortController().signal }), 'brief');
        assert.deepEqual(messages, before);
    }
});

test('accumulated tool results trigger summarization before the next model request', async () => {
    const state = createState([turn('greeting', 'hi')]);
    const evidence = '证'.repeat(75_000);
    const counts = [], modelRequests = [], summaryInputs = [];
    let executions = 0;
    const gateway = { async openSession() { return { supportsSessionToolLoop: true, providerConfig: {}, async run(request) {
        if (!request.tools.length) {
            assert.equal(executions, 2);
            summaryInputs.push(JSON.parse(request.messages[0].content));
            return { text: 'first tool evidence condensed' };
        }
        modelRequests.push(request);
        return modelRequests.length <= 2
            ? { toolCalls: [{ id: `read-${modelRequests.length}`, name: 'Read', arguments: '{}' }] }
            : { text: 'done' };
    } }; } };
    await runAdministratorLoop({ ...options(state, gateway, async () => ({ round: ++executions, evidence })), onContext: usage => counts.push(usage) });
    assert.equal(executions, 2); assert.equal(summaryInputs.length, 1);
    const summarized = summaryInputs[0].exchanges;
    assert.deepEqual(summarized.slice(0, 3).map(message => message.content), ['hi', 'hi', 'current request']);
    const calls = summarized.filter(message => message.tool_calls), results = summarized.filter(message => message.role === 'tool');
    assert.deepEqual(calls.map(message => message.tool_calls[0].id), results.map(message => message.tool_call_id));
    assert.deepEqual(results.map(message => JSON.parse(message.content)), [{ round: 1, evidence }, { round: 2, evidence }]);
    assert.ok(counts[1].runtime > estimateTokenCount(evidence));
    assert.ok(counts[1].used < ADMINISTRATOR_POLICY.summaryTrigger);
    assert.equal(modelRequests[1].messages.length, 0);
    assert.ok(modelRequests[1].toolResponses);
    assert.equal(modelRequests[2].toolResponses, undefined);
    const retained = modelRequests[2].messages.filter(message => message.role === 'tool');
    assert.deepEqual(retained, []);
    assert.ok(counts.at(-1).used < ADMINISTRATOR_POLICY.summaryTrigger);
    const persisted = parseAdministratorData({ ...createAdministratorData(), ...structuredClone(state) });
    assert.equal(persisted.summary.throughToolMessage, 4);
    assert.equal(persisted.turns.at(-1).toolMessages.length, 4);
    assert.deepEqual(administratorContext(persisted).messages.filter(message => message.role === 'tool'), retained);
    persisted.turns.push({ ...turn('next', 'next request'), assistant: null, status: 'interrupted' });
    const nextRequests = [], nextSummaries = [];
    const nextGateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run(request) {
        if (!request.tools.length) { nextSummaries.push(JSON.parse(request.messages[0].content)); return { text: 'both tools condensed' }; }
        nextRequests.push(request);
        if (nextRequests.length === 1) { throw Object.assign(new Error('context exhausted'), { code: 'context_length_exceeded' }); }
        return { text: 'next answer' };
    } }; } };
    await runAdministratorLoop({ ...options(persisted, nextGateway, async () => assert.fail('history must not execute tools')),
        request: { role: 'user', content: 'next request' }, requestForCounting: { role: 'user', content: 'next request' } });
    assert.deepEqual(nextRequests[0].messages.filter(message => message.role === 'tool'), retained);
    assert.equal(nextSummaries[0].summary, state.summary.text);
    assert.deepEqual(nextSummaries[0].exchanges.filter(message => message.role === 'tool'), retained);
    assert.equal(persisted.summary.throughId, 'current');
    assert.equal(persisted.summary.throughToolMessage, null);
    assert.deepEqual(persisted.turns[1].toolMessages, state.turns[1].toolMessages);
    assert.deepEqual(nextRequests[1].messages.filter(message => message.role === 'tool'), []);
});

test('an oversized newest tool result is counted and blocked before another provider call', async () => {
    const state = createState([]);
    let requests = 0;
    const counts = [];
    const gateway = { async openSession() { return { supportsSessionToolLoop: false, providerConfig: {}, async run() {
        requests++; return { toolCalls: [{ id: 'large-read', name: 'Read', arguments: '{}' }] };
    } }; } };
    await assert.rejects(runAdministratorLoop({ ...options(state, gateway, async () => ({ evidence: '证'.repeat(200_000) })), onContext: usage => counts.push(usage) }));
    assert.equal(requests, 1);
    assert.ok(counts.at(-1).runtime > ADMINISTRATOR_POLICY.inputBudget);
    assert.ok(counts.at(-1).used > ADMINISTRATOR_POLICY.inputBudget);
    assert.equal(state.turns.at(-1).toolMessages.filter(message => message.role === 'tool').length, 1);
});

test('context categories equal the complete request estimate under provider reasoning replay policies', () => {
    const state = createState(Array.from({ length: 8 }, (_, i) => ({ ...turn(String(i), 'ok'), assistantPayload: {
        openaiCompatibleMessage: { role: 'assistant', content: 'ok', reasoning_content: '思'.repeat(25000) },
    } })));
    const toolGroup = [
        { role: 'assistant', content: 'checking', toolCalls: [{ id: 'read', name: 'Read', arguments: '{}' }], providerPayload: {
            openaiCompatibleMessage: { role: 'assistant', content: 'checking', reasoning_content: '析'.repeat(300),
                tool_calls: [{ id: 'read', type: 'function', function: { name: 'Read', arguments: '{}' } }] },
        } },
        { role: 'tool', toolName: 'Read', toolCallId: 'read', content: '{"ok":true}' },
    ];
    state.turns[0].toolMessages = structuredClone(toolGroup);
    state.turns.at(-1).toolMessages = structuredClone(toolGroup);
    const tools = options(state, {}).getTools(), projection = administratorContext(state);
    for (const config of [
        { provider: 'openai-compatible', model: 'deepseek-chat', toolMode: 'native', reasoning: { mode: 'on' } },
        { provider: 'openai-compatible', model: 'deepseek-chat', toolMode: 'native', reasoning: { mode: 'off' } },
        { provider: 'openai-compatible', model: 'deepseek-chat', toolMode: 'tagged-json', reasoning: { mode: 'on' } },
        { provider: 'sillytavern-openai-compatible', model: 'deepseek-chat', toolMode: 'native', reasoning: { mode: 'on' } },
    ]) {
        const usage = contextUsage('rules', tools, [], projection, 1, config);
        const full = estimateConversationTokens({ messages: [{ role: 'system', content: 'rules' }, ...projection.messages], tools, providerConfig: config });
        assert.equal(usage.used, full + ADMINISTRATOR_POLICY.imageTokens);
        assert.equal(usage.used, usage.rules + usage.tools + usage.history + usage.runtime + usage.images);
        assert.ok(usage.runtime > 0);
        if (config.provider === 'openai-compatible' && config.toolMode === 'native' && config.reasoning.mode === 'on') {
            // Serialize the real wire request without invoking a provider.
            const wire = new OpenAICompatibleAdapter(config).buildRequestBody({ systemPrompt: 'rules', messages: projection.messages, tools, reasoning: config.reasoning });
            assert.equal(wire.messages.reduce((sum, message) => sum + (message.reasoning_content?.length ?? 0), 0), 200600);
            assert.ok(usage.history > ADMINISTRATOR_POLICY.inputBudget);
        } else { assert.ok(usage.history < 2000); }
    }
});

test('historical DeepSeek reasoning triggers whole-history summarization or blocks an oversized summary', async () => {
    for (const size of [25000, 35000]) {
        const state = createState(Array.from({ length: 6 }, (_, i) => ({ ...turn(String(i), 'ok'), assistantPayload: {
            openaiCompatibleMessage: { role: 'assistant', content: 'ok', reasoning_content: '思'.repeat(size) },
        } })));
        const config = { provider: 'openai-compatible', model: 'deepseek-chat', toolMode: 'native', reasoning: { mode: 'on' } };
        let summaries = 0, requests = 0;
        const gateway = { async openSession() { return { providerConfig: config, supportsSessionToolLoop: false, async run(request) {
            if (!request.tools.length) {
                summaries++;
                const exchanges = JSON.parse(request.messages[0].content).exchanges;
                assert.deepEqual(exchanges.filter(message => message.role === 'assistant'), Array.from({ length: 6 }, () => ({ role: 'assistant', content: 'ok', reasoning: '思'.repeat(size) })));
                return { text: 'confirmed facts' };
            }
            requests++; assert.equal(request.messages.filter(message => message.providerPayload).length, 0);
            return { text: 'done' };
        } }; } };
        const run = runAdministratorLoop(options(state, gateway));
        if (size === 25000) { await run; assert.equal(summaries, 1); assert.equal(requests, 1); }
        else { await assert.rejects(run, { message: 'administrator_context_full' }); assert.equal(summaries, 0); assert.equal(requests, 0); assert.equal(state.summary, null); }
    }
});
