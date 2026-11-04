import test from 'node:test';
import assert from 'node:assert/strict';
import { AnthropicAdapter } from '../../../agent-core/adapters/anthropic.js';
import { OpenAIResponsesAdapter } from '../../../agent-core/adapters/openai-responses.js';
import { GoogleAdapter } from '../../../agent-core/adapters/google.js';
import { SillyTavernClaudeAdapter } from '../../../agent-core/adapters/sillytavern-claude.js';
import { SillyTavernGoogleAdapter } from '../../../agent-core/adapters/sillytavern-google.js';
import { OpenAICompatibleAdapter } from '../../../agent-core/adapters/openai-compatible.js';
import { buildScenePlannerTask, prepareScenePlannerInput } from '../scene-planner.js';
import { executePreparedScenePlanner } from '../scene-planner-executor.js';
import { callDrawScenePlannerAgentRuntime } from '../draw-agent-runtime.js';
import { GOOGLE_SYNTHETIC_HISTORY_SIGNATURE } from '../scene-planner-messages.js';
import { addBlock, createCustomBlock, createDefaultLayout } from '../scene-planner-layout.js';
import { ScenePlannerError } from '../scene-plan-contract.js';

// Completed setup exchanges must survive provider conversion without losing documents or
// turning the three historical reads/approval into three additional model requests.
const WORLD = 'The library is called "星灯馆". Its sign contains \\ and $&.';
const NARRATIVE = 'Aster opens the "blue" door.';
const APPEARANCE = 'silver hair, green eyes';
const GUIDE = 'Fixture guide: retain "quoted tags", \\ and a second line.\n绘图指南资料。';
const RULES = 'Fixture scene rule: lantern reflections.';
const PARAMETERS = { images: [{ index: 1, insert_after: 1, title: '灯下', orientation: 'portrait', scene: 'rainy library', characters: [] }] };
const SUBMIT = { id: 'submitted', name: 'submit_scene_plan', arguments: JSON.stringify(PARAMETERS) };

async function buildTask(options = {}) {
    return buildScenePlannerTask({
        messageText: NARRATIVE,
        worldbookEntries: WORLD,
        presentCharacters: [{ name: 'Aster', type: 'girl', appearance: APPEARANCE }],
        maxImages: 1,
        promptDefaults: { topSystem: 'Image planning.', tagGuideContent: GUIDE, sceneRules: RULES },
        expansionOptions: { runtime: { substituteParams: text => text } },
        ...options,
    });
}

function expectedHistory(task) {
    const calls = task.messages.flatMap(message => message.tool_calls || []).map(call => ({
        id: call.id, name: call.function.name, arguments: JSON.parse(call.function.arguments),
    }));
    const results = task.messages.filter(message => message.role === 'tool').map(message => ({
        id: message.tool_call_id, result: JSON.parse(message.content),
    }));
    assert.deepEqual(calls.map(call => call.name), ['read_scene_materials', 'read_drawing_guide', 'request_draw_approval']);
    assert.equal(results.length, 3);
    for (const value of [WORLD, NARRATIVE, APPEARANCE]) assert.ok(results[0].result.content.includes(value));
    for (const value of [GUIDE, RULES]) assert.ok(results[1].result.content.includes(value));
    assert.equal(results[2].result.approved, true);
    return { calls, results };
}

function assertHistory(actual, expected) {
    assert.deepEqual(actual.calls, expected.calls);
    assert.deepEqual(actual.results, expected.results);
}

function forbidNetwork(t) {
    t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected network access in provider history test'); });
}

test('Anthropic receives all three completed exchanges and submits with one SDK request', async t => {
    forbidNetwork(t);
    t.mock.method(console, 'info', () => {});
    const task = await buildTask();
    const expected = expectedHistory(task);
    const adapter = new AnthropicAdapter({ provider: 'anthropic', model: 'claude-sonnet-4-5', apiKey: 'offline-fixture' });
    const requests = [];
    t.mock.method(adapter.client.messages, 'create', async body => {
        requests.push(structuredClone(body));
        return { id: 'msg-fixture', model: 'claude-sonnet-4-5', stop_reason: 'tool_use', content: [
            { type: 'tool_use', id: SUBMIT.id, name: SUBMIT.name, input: PARAMETERS },
        ] };
    });
    const result = await adapter.chat(task);
    assert.equal(requests.length, 1);
    const body = requests[0];
    const blocks = body.messages.flatMap(message => message.content);
    assertHistory({
        calls: blocks.filter(block => block.type === 'tool_use').map(block => ({ id: block.id, name: block.name, arguments: block.input })),
        results: blocks.filter(block => block.type === 'tool_result').map(block => ({ id: block.tool_use_id, result: JSON.parse(block.content) })),
    }, expected);
    assert.deepEqual(body.tools.map(tool => tool.name), [SUBMIT.name]);
    assert.deepEqual(body.tool_choice, { type: 'auto' });
    assert.deepEqual(result.toolCalls, [SUBMIT]);
});

test('Responses receives paired function calls and complete outputs in one SDK request', async t => {
    forbidNetwork(t);
    const task = await buildTask();
    const expected = expectedHistory(task);
    const adapter = new OpenAIResponsesAdapter({ provider: 'openai-responses', model: 'gpt-4.1', apiKey: 'offline-fixture' });
    const requests = [];
    t.mock.method(adapter.client.responses, 'create', async body => {
        requests.push(structuredClone(body));
        return { id: 'resp-fixture', status: 'completed', output: [
            { type: 'function_call', call_id: SUBMIT.id, name: SUBMIT.name, arguments: SUBMIT.arguments, status: 'completed' },
        ] };
    });
    const result = await adapter.chat(task);
    assert.equal(requests.length, 1);
    const body = requests[0];
    assertHistory({
        calls: body.input.filter(item => item.type === 'function_call').map(item => ({ id: item.call_id, name: item.name, arguments: JSON.parse(item.arguments) })),
        results: body.input.filter(item => item.type === 'function_call_output').map(item => ({ id: item.call_id, result: JSON.parse(item.output) })),
    }, expected);
    assert.deepEqual(body.tools.map(tool => tool.name), [SUBMIT.name]);
    assert.equal(body.tool_choice, 'auto');
    assert.deepEqual(result.toolCalls, [SUBMIT]);
    assert.equal(result.requestInspection.requestCount, 1);
});

test('Google Gemini 3 receives signed synthetic history and sends only the approved turn once', async t => {
    forbidNetwork(t);
    const task = await buildTask();
    const expected = expectedHistory(task);
    const adapter = new GoogleAdapter({ provider: 'google', model: 'gemini-3-flash-preview', apiKey: 'offline-fixture' });
    const creates = [];
    const sends = [];
    t.mock.method(adapter.client.chats, 'create', payload => {
        creates.push(structuredClone(payload));
        return {
            getHistory: () => payload.history,
            sendMessage: async request => {
                // Gemini 3 validates every manually supplied function-call part in this turn.
                const historicalCalls = payload.history.flatMap(message => message.parts).filter(part => part.functionCall);
                assert.equal(historicalCalls.length, 3);
                for (const part of historicalCalls) assert.equal(part.thoughtSignature, GOOGLE_SYNTHETIC_HISTORY_SIGNATURE);
                sends.push(structuredClone(request));
                return { candidates: [{ finishReason: 'STOP', content: { role: 'model', parts: [
                    { functionCall: { id: SUBMIT.id, name: SUBMIT.name, args: PARAMETERS } },
                ] } }] };
            },
        };
    });
    const result = await adapter.chat(task);
    assert.equal(creates.length, 1);
    assert.equal(sends.length, 1);
    const parts = [...creates[0].history.flatMap(message => message.parts), ...sends[0].message];
    const calls = parts.filter(part => part.functionCall).map(({ functionCall: call }) => ({ id: call.id, name: call.name, arguments: call.args }));
    const responses = parts.filter(part => part.functionResponse).map(part => part.functionResponse);
    assertHistory({ calls, results: responses.map(response => ({ id: response.id, result: response.response })) }, expected);
    assert.deepEqual(responses.map(response => response.name), expected.calls.map(call => call.name));
    assert.deepEqual(sends[0].message.map(part => part.functionResponse.id), [expected.calls[2].id]);
    assert.equal(sends[0].message[0].functionResponse.response.approved, true);
    assert.deepEqual(creates[0].config.tools.flatMap(tool => tool.functionDeclarations.map(declaration => declaration.name)), [SUBMIT.name]);
    assert.equal(creates[0].config.toolConfig.functionCallingConfig.mode, 'AUTO');
    assert.equal(result.toolCalls.length, 1);
    assert.equal(result.toolCalls[0].name, SUBMIT.name);
    assert.deepEqual(JSON.parse(result.toolCalls[0].arguments), PARAMETERS);
});

for (const [model, toolMode, signed] of [
    ['gemini-3-flash-preview', 'native', true],
    ['gpt-4.1', 'native', false],
    ['deepseek-chat', 'native', false],
    ['gemini-3-flash-preview', 'tagged-json', false],
]) {
    test(`OpenAI-compatible ${model}/${toolMode} isolates Google's signature projection`, async t => {
        forbidNetwork(t);
        t.mock.method(console, 'log', () => {});
        const task = await buildTask();
        const original = structuredClone(task);
        const expected = expectedHistory(task);
        const config = { provider: 'openai-compatible', model, toolMode, apiKey: 'offline-fixture' };
        const adapter = new OpenAICompatibleAdapter(config);
        const requests = [];
        t.mock.method(adapter.client.chat.completions, 'create', async body => {
            requests.push(structuredClone(body));
            return { choices: [{ finish_reason: 'tool_calls', message: {
                role: 'assistant', content: '',
                tool_calls: [{ id: SUBMIT.id, type: 'function', function: { name: SUBMIT.name, arguments: SUBMIT.arguments } }],
            } }] };
        });
        const result = await callDrawScenePlannerAgentRuntime({
            task, providerConfig: config, agentCore: { createAgentAdapter: () => adapter },
        });
        assert.equal(requests.length, 1);
        const body = requests[0];
        if (toolMode === 'native') {
            const calls = body.messages.flatMap(message => message.tool_calls || []);
            assert.equal(calls.length, 3);
            for (const call of calls) {
                if (signed) assert.deepEqual(call.extra_content, { google: { thought_signature: GOOGLE_SYNTHETIC_HISTORY_SIGNATURE } });
                else assert.equal(Object.hasOwn(call, 'extra_content'), false);
            }
            assertHistory({
                calls: calls.map(call => ({ id: call.id, name: call.function.name, arguments: JSON.parse(call.function.arguments) })),
                results: body.messages.filter(message => message.role === 'tool').map(message => ({ id: message.tool_call_id, result: JSON.parse(message.content) })),
            }, expected);
        } else {
            assert.equal(body.messages.some(message => message.tool_calls), false);
            assert.equal(JSON.stringify(body).includes(GOOGLE_SYNTHETIC_HISTORY_SIGNATURE), false);
        }
        assert.deepEqual(task, original);
        assert.equal(result.result.toolCalls[0].name, SUBMIT.name);
    });
}

test('hosted Google keeps the canonical three exchanges in its host conversion input', async t => {
    forbidNetwork(t);
    const task = await buildTask();
    const expected = expectedHistory(task);
    const adapter = new SillyTavernGoogleAdapter({ provider: 'sillytavern-google', model: 'gemini-2.5-flash' });
    const body = adapter.buildPayload(task);
    const replayCalls = body.messages.flatMap(message => message.tool_calls
        || (Array.isArray(message.content) ? message.content.flatMap(part => part.tool_calls || []) : []));
    assert.deepEqual(body.messages.filter(message => message.role === 'tool'), task.messages.filter(message => message.role === 'tool'));
    assert.equal(replayCalls.length, 3);
    for (const call of replayCalls) assert.equal(call.signature, GOOGLE_SYNTHETIC_HISTORY_SIGNATURE);
    assertHistory({
        calls: replayCalls.map(call => ({ id: call.id, name: call.function.name, arguments: JSON.parse(call.function.arguments) })),
        results: body.messages.filter(message => message.role === 'tool').map(message => ({ id: message.tool_call_id, result: JSON.parse(message.content) })),
    }, expected);
    assert.deepEqual(body.tools.map(tool => tool.function.name), [SUBMIT.name]);
    assert.equal(body.tool_choice, 'auto');
});

function hostedClaude(config, replies = [[{ type: 'tool_use', id: SUBMIT.id, name: SUBMIT.name, input: PARAMETERS }]]) {
    const requests = [];
    const hostClient = {
        buildHostChatCompletionGenerateRequest: async body => ({ body }),
        createHostChatCompletion: async () => { throw new Error('Unexpected non-stream request'); },
        streamHostChatCompletion: async (body, onEvent, { onRequest }) => {
            const blocks = replies[requests.length];
            assert.ok(blocks, 'No extra model requests are allowed');
            requests.push(structuredClone(body));
            onRequest({ body });
            blocks.forEach((content_block, index) => onEvent({ type: 'content_block_start', index, content_block }));
            onEvent({ type: 'message_delta', delta: { stop_reason: blocks.some(block => block.type === 'tool_use') ? 'tool_use' : 'end_turn' } });
        },
    };
    const adapter = new SillyTavernClaudeAdapter(config, hostClient);
    return { requests, agentCore: { createAgentAdapter: () => adapter } };
}

function assistantText(messages) {
    return messages.filter(message => message.role === 'assistant').flatMap(message => (
        Array.isArray(message.content)
            ? message.content.filter(block => block.type === 'text').map(block => block.text)
            : [message.content]
    ));
}

for (const mode of ['on', 'off', 'inherit']) {
    test(`hosted Claude preserves text and opens a plain approval turn without changing reasoning ${mode}`, async t => {
        forbidNetwork(t);
        t.mock.method(console, 'log', () => {});
        let layout = createDefaultLayout();
        for (const [index, role] of ['system', 'user', 'assistant'].entries()) {
            layout = addBlock(layout, createCustomBlock({ role, content: `custom ${role}: "引号" \\ $&\nnext` }, [], () => (index + 1) / 10));
        }
        layout = addBlock(layout, createCustomBlock({ role: 'assistant', content: 'disabled fixture', enabled: false }, [], () => 0.4));
        const task = await buildTask({ customPrompts: { layout } });
        const original = structuredClone(task);
        const expected = expectedHistory(task);
        const config = { provider: 'sillytavern-claude', model: 'claude-sonnet-4-6', maxTokens: 8000, reasoning: { mode, effort: 'high', output: 'show' } };
        const originalConfig = structuredClone(config);
        const { requests, agentCore } = hostedClaude(config);
        const result = await callDrawScenePlannerAgentRuntime({ task, providerConfig: config, agentCore });
        assert.equal(requests.length, 1);
        const body = requests[0];
        // The host overwrites content if top-level tool_calls are present: native content
        // blocks (not a string plus tool_calls) are the externally required boundary here.
        assert.ok(body.messages.every(message => !Object.hasOwn(message, 'tool_calls')));
        const blocks = body.messages.flatMap(message => Array.isArray(message.content) ? message.content : []);
        assertHistory({
            calls: blocks.filter(block => block.type === 'tool_use').map(block => ({ id: block.id, name: block.name, arguments: block.input })),
            results: body.messages.filter(message => message.role === 'tool').map(message => ({ id: message.tool_call_id, result: JSON.parse(message.content) })),
        }, { calls: expected.calls.slice(0, 2), results: expected.results.slice(0, 2) });
        assert.deepEqual(assistantText(body.messages), assistantText(task.messages));
        assert.deepEqual(body.messages.at(-2), { role: 'assistant', content: task.messages.at(-2).content });
        assert.deepEqual(body.messages.at(-1), { role: 'user', content: expected.results[2].result.content });
        assert.deepEqual(body.messages.filter(message => message.role === 'user').slice(0, -1), task.messages.filter(message => message.role === 'user'));
        assert.equal(body.messages.some(message => message.content === 'disabled fixture'), false);
        assert.equal(body.tool_choice, 'auto');
        assert.deepEqual(body.tools.map(tool => tool.function.name), [SUBMIT.name]);
        assert.equal(body.max_tokens, config.maxTokens);
        assert.equal(body.reasoning_effort, mode === 'on' ? 'high' : 'auto');
        assert.equal(result.diagnostic.snapshot().reasoningEffectiveMode, mode);
        assert.equal(result.result.toolCalls[0].name, SUBMIT.name);
        assert.deepEqual(task, original);
        assert.deepEqual(config, originalConfig);
    });
}

for (const continuation of ['custom tool', 'correction']) {
    test(`hosted Claude preserves live thinking and paired results during ${continuation}`, async t => {
        forbidNetwork(t);
        t.mock.method(console, 'log', () => {});
        t.mock.method(console, 'warn', () => {});
        const task = await buildTask();
        const custom = { name: 'note', parameters: { type: 'object', properties: {} } };
        if (continuation === 'custom tool') task.tools.push({ type: 'function', function: custom });
        const original = structuredClone(task);
        const config = { provider: 'sillytavern-claude', model: 'claude-sonnet-4-6', reasoning: { mode: 'on', effort: 'high', output: 'show' } };
        const thinking = { type: 'thinking', thinking: 'Offline fixture reasoning', signature: 'offline-signature-fixture' };
        const firstCall = { type: 'tool_use', id: 'live-call', name: continuation === 'custom tool' ? custom.name : SUBMIT.name,
            input: continuation === 'custom tool' ? {} : { images: [] } };
        const { requests, agentCore } = hostedClaude(config, [
            [thinking, firstCall],
            [{ type: 'tool_use', id: SUBMIT.id, name: SUBMIT.name, input: PARAMETERS }],
        ]);
        const invoked = [];
        await callDrawScenePlannerAgentRuntime({
            task, providerConfig: config, agentCore,
            ...(continuation === 'custom tool' ? {
                customTools: [custom],
                customToolHost: { invoke: async (name, args) => { invoked.push({ name, args }); return '{"ok":true}'; } },
            } : {
                validateResult: (_result, { attempt }) => {
                    if (attempt === 1) throw new ScenePlannerError('Empty fixture plan', 'NO_IMAGE_TASKS');
                    return PARAMETERS;
                },
            }),
        });
        assert.equal(requests.length, 2);
        assert.deepEqual(requests[1].messages.slice(0, requests[0].messages.length), requests[0].messages);
        const liveAssistant = requests[1].messages.at(-2);
        assert.equal(liveAssistant.role, 'assistant');
        assert.deepEqual(liveAssistant.content, [thinking, firstCall]);
        const liveResult = requests[1].messages.at(-1);
        assert.equal(liveResult.role, 'tool');
        assert.equal(liveResult.tool_call_id, firstCall.id);
        assert.equal(JSON.parse(liveResult.content).ok, continuation === 'custom tool');
        assert.deepEqual(invoked, continuation === 'custom tool' ? [{ name: custom.name, args: {} }] : []);
        assert.ok(requests.every(body => body.reasoning_effort === 'high' && body.tool_choice === 'auto'));
        assert.deepEqual(task, original);
    });
}

test('hosted Claude keeps plain approval when an outer protocol retry appends another user message', async t => {
    forbidNetwork(t);
    t.mock.method(console, 'log', () => {});
    t.mock.method(console, 'warn', () => {});
    const config = { provider: 'sillytavern-claude', model: 'claude-sonnet-4-6', maxTokens: 8000, reasoning: { mode: 'on', effort: 'high', output: 'show' } };
    const prepared = await prepareScenePlannerInput({
        messageText: NARRATIVE, maxImages: 1,
        agentOptions: { providerConfig: config },
        plannerRetry: { maxRetries: 1, baseDelayMs: 1 },
        expansionOptions: { runtime: { substituteParams: text => text } },
    });
    const original = structuredClone(prepared);
    const textOnly = [{ type: 'text', text: 'Offline fixture without a submission' }];
    const { requests, agentCore } = hostedClaude(config, [textOnly, textOnly,
        [{ type: 'tool_use', id: SUBMIT.id, name: SUBMIT.name, input: PARAMETERS }],
    ]);
    let retries = 0;
    const images = await executePreparedScenePlanner(prepared, { agentCore, sleep: async () => { retries += 1; } });
    assert.equal(images.length, 1);
    assert.equal(retries, 1);
    assert.equal(requests.length, 3);
    const retry = requests[2];
    assert.equal(retry.messages.length, requests[0].messages.length + 1);
    assert.deepEqual(retry.messages.slice(0, -1), requests[0].messages);
    assert.equal(retry.messages.at(-1).role, 'user');
    assert.equal(typeof retry.messages.at(-1).content, 'string');
    assert.equal(retry.messages.at(-3).role, 'assistant');
    assert.equal(typeof retry.messages.at(-3).content, 'string');
    assert.ok(retry.messages.every(message => !Object.hasOwn(message, 'tool_calls')));
    const calls = retry.messages.flatMap(message => Array.isArray(message.content)
        ? message.content.filter(block => block.type === 'tool_use') : []);
    assert.equal(calls.length, 2);
    assert.deepEqual(retry.messages.filter(message => message.role === 'tool').map(message => message.tool_call_id), calls.map(call => call.id));
    assert.equal(retry.reasoning_effort, 'high');
    assert.deepEqual(prepared, original);
});

test('Claude projection leaves other providers on their canonical three-exchange history', async t => {
    forbidNetwork(t);
    t.mock.method(console, 'log', () => {});
    const task = await buildTask();
    const original = structuredClone(task);
    for (const provider of ['anthropic', 'google', 'openai-responses', 'openai-compatible', 'sillytavern-openai-compatible', 'sillytavern-google']) {
        const requests = [];
        await callDrawScenePlannerAgentRuntime({
            task, providerConfig: { provider, model: 'offline-model' },
            agentCore: { createAgentAdapter: () => ({ chat: async input => {
                requests.push(structuredClone(input.messages));
                return { toolCalls: [SUBMIT] };
            } }) },
        });
        assert.equal(requests.length, 1, provider);
        assert.deepEqual(requests[0], original.messages, provider);
        assert.deepEqual(task, original, provider);
    }
});
