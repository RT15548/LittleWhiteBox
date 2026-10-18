import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { createAgentAdapter } from '../provider-config.js';
import { readResponseCompletion } from '../runtime/response-completion.js';
import { resolveResultToolCalls, buildProviderAssistantToolCallMessage } from '../runtime/protocol.js';
import { callDrawScenePlannerAgentRuntime } from '../../draw/shared/draw-agent-runtime.js';
import { parseSubmittedScenePlan } from '../../draw/shared/scene-plan-contract.js';

// Acceptance contracts (cost: lost paid output, duplicate billing, unintended writes):
// - Every provider/host transport returns received text, complete tools and replay data
//   even when its completion marker is missing or reports an output limit.
// - A valid draw plan is accepted once, without issuing a replacement model request.
// - Cut-off native arguments cannot be repaired into executable writes.
// - Explicit refusal and genuine provider errors still fail the request.
const text = '<dialogue>我点点头。\n「Here is the "+" sign。」</dialogue>';
const parameters = { images: [{ insert_after: 1, scene: 'warm city street', characters: [] }] };
const args = JSON.stringify(parameters);
const tools = [{ type: 'function', function: { name: 'submit_scene_plan', parameters: { type: 'object' } } }];
const messages = [{ role: 'user', content: 'offline fixture' }];
const providers = ['openai-compatible', 'openai-responses', 'anthropic', 'google',
    'sillytavern-openai-compatible', 'sillytavern-claude', 'sillytavern-google'];

function fixture(provider, ending) {
    const protocol = provider.replace('sillytavern-', '').replace('claude', 'anthropic');
    const reason = ending === 'missing' ? undefined : ending === 'limit'
        ? { 'openai-compatible': 'length', 'openai-responses': 'max_output_tokens', anthropic: 'max_tokens', google: 'MAX_TOKENS' }[protocol]
        : { 'openai-compatible': 'tool_calls', 'openai-responses': 'completed', anthropic: 'tool_use', google: 'STOP' }[protocol];
    const call = { id: 'call-1', type: 'function', function: { name: 'submit_scene_plan', arguments: args } };
    if (protocol === 'openai-compatible') {
        return { json: { choices: [{ message: { role: 'assistant', content: text, tool_calls: [call] }, finish_reason: reason }] }, events: [
            { choices: [{ delta: { role: 'assistant', content: text, tool_calls: [{ ...call, index: 0 }] } }] },
            ...(reason ? [{ choices: [{ delta: {}, finish_reason: reason }] }] : []),
        ] };
    }
    if (protocol === 'anthropic') {
        const content = [{ type: 'text', text }, { type: 'tool_use', id: 'call-1', name: 'submit_scene_plan', input: parameters }];
        const json = { id: 'msg-1', type: 'message', role: 'assistant', model: 'fixture', content, stop_reason: reason,
            stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } };
        return { json, events: [
            { type: 'message_start', message: { ...json, content: [], stop_reason: null } },
            { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
            { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } },
            { type: 'content_block_stop', index: 0 },
            { type: 'content_block_start', index: 1, content_block: { ...content[1], input: {} } },
            { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: args } },
            { type: 'content_block_stop', index: 1 },
            ...(reason ? [{ type: 'message_delta', delta: { stop_reason: reason }, usage: { output_tokens: 1 } }, { type: 'message_stop' }] : []),
        ] };
    }
    if (protocol === 'google') {
        const json = { candidates: [{ content: { role: 'model', parts: [{ text }, { functionCall: { name: 'submit_scene_plan', args: parameters } }] }, finishReason: reason }] };
        return { json, events: [json] };
    }
    const output = [{ type: 'message', id: 'msg-1', role: 'assistant', status: 'completed',
        content: [{ type: 'output_text', text, annotations: [] }] },
    { type: 'function_call', id: 'fc-1', call_id: 'call-1', name: 'submit_scene_plan', arguments: args, status: 'completed' }];
    const json = { id: 'resp-1', object: 'response', model: 'fixture', output,
        status: ending === 'normal' ? 'completed' : ending === 'limit' ? 'incomplete' : undefined,
        ...(ending === 'limit' ? { incomplete_details: { reason } } : {}) };
    return { json, events: [
        { type: 'response.created', response: { ...json, output: [], status: 'in_progress' } },
        ...output.flatMap((item, output_index) => [
            { type: 'response.output_item.added', output_index, item },
            { type: 'response.output_item.done', output_index, item },
        ]),
        ...(ending === 'missing' ? [] : [{ type: `response.${json.status}`, response: json }]),
    ] };
}

async function localProvider(t, wire, streaming) {
    let requests = 0;
    const server = createServer((request, response) => { const respond = async () => {
        for await (const chunk of request) { void chunk; }
        requests++;
        response.writeHead(200, { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' });
        response.end(streaming ? wire.events.map((event, sequence_number) =>
            `${event.type ? `event: ${event.type}\n` : ''}data: ${JSON.stringify({ ...event, sequence_number })}\n\n`).join('')
            : JSON.stringify(wire.json));
    }; respond().catch(error => response.destroy(error)); });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
    return { baseUrl: `http://127.0.0.1:${server.address().port}`, requests: () => requests };
}

function hostClient(wire) {
    let requests = 0;
    return {
        buildHostChatCompletionGenerateRequest: async body => ({ body }),
        createHostChatCompletion: async () => { requests++; return wire.json; },
        streamHostChatCompletion: async (_body, accept) => { requests++; for (const event of wire.events) { accept(event); } },
        requests: () => requests,
    };
}

test('all shared adapters preserve complete content independently of completion markers', async t => {
    for (const provider of providers) {
        for (const streaming of [false, true]) {
            for (const ending of ['normal', 'limit', 'missing']) {
                await t.test(`${provider}/${streaming ? 'SSE' : 'JSON'}/${ending}`, async t => {
                    const wire = fixture(provider, ending);
                    const service = provider.startsWith('sillytavern-') ? hostClient(wire) : await localProvider(t, wire, streaming);
                    const config = { provider, apiKey: 'offline-fixture', baseUrl: service.baseUrl, model: 'fixture', toolMode: 'native', timeoutMs: 3000 };
                    const adapter = createAgentAdapter(config, provider.startsWith('sillytavern-') ? { hostClient: service } : {});
                    const result = await adapter.chat({ messages, tools, ...(streaming ? { onStreamProgress() {} } : {}) });
                    assert.equal(result.text, text);
                    assert.equal(result.completion, ending === 'normal' ? 'complete' : 'incomplete');
                    assert.equal(result.truncated, ending === 'limit');
                    const calls = resolveResultToolCalls(result, config);
                    assert.equal(calls.length, 1);
                    assert.deepEqual(JSON.parse(calls[0].arguments), parameters);
                    const replay = buildProviderAssistantToolCallMessage(result, calls);
                    assert.equal(replay.content, text);
                    assert.deepEqual(JSON.parse(replay.tool_calls[0].function.arguments), parameters);
                    assert.ok(replay.providerPayload);
                    assert.equal(service.requests(), 1, 'Complete paid content must not cause a replacement request');
                });
            }
        }
    }
});

test('draw accepts a complete plan after length or missing completion, once', async t => {
    for (const ending of ['limit', 'missing']) {
        await t.test(ending, async t => {
            const service = await localProvider(t, fixture('openai-compatible', ending), false);
            const providerConfig = { provider: 'openai-compatible', apiKey: 'offline-fixture', model: 'fixture', baseUrl: service.baseUrl };
            const { parsed } = await callDrawScenePlannerAgentRuntime({ task: { messages, tools }, providerConfig,
                agentCore: { createAgentAdapter }, validateResult: result => parseSubmittedScenePlan(result, { sceneSource: { points: [{ number: 1, offset: 20 }] } }) });
            assert.equal(parsed.tasks[0].scene, parameters.images[0].scene);
            assert.equal(parsed.tasks[0].placement.offset, 20);
            assert.equal(service.requests(), 1);
        });
    }
});

test('cut-off native arguments never enter loose repair or execution after abnormal completion', () => {
    const result = { ...readResponseCompletion('openai', 'length'), text,
        toolCalls: [{ id: 'cut-off-write', name: 'Write', arguments: '{"filePath":"notes.md","content":"not finished' }] };
    assert.throws(() => resolveResultToolCalls(result), { code: 'AGENT_TOOL_ARGUMENTS_INVALID', toolCallId: 'cut-off-write' });
    assert.equal(result.text, text);
    assert.equal(result.toolCalls[0].arguments.endsWith('not finished'), true);
});

test('Anthropic streaming preserves raw cut-off arguments instead of executing SDK partial-JSON projections', async t => {
    const wire = fixture('anthropic', 'limit');
    const partial = '{"images":[{"insert_after":1';
    wire.events.find(event => event.delta?.type === 'input_json_delta').delta.partial_json = partial;
    const service = await localProvider(t, wire, true);
    const adapter = createAgentAdapter({ provider: 'anthropic', apiKey: 'offline-fixture', model: 'fixture', baseUrl: service.baseUrl });
    const result = await adapter.chat({ messages, tools, onStreamProgress() {} });
    assert.equal(result.text, text);
    assert.equal(result.toolCalls[0].arguments, partial);
    assert.throws(() => resolveResultToolCalls(result), { code: 'AGENT_TOOL_ARGUMENTS_INVALID' });
    assert.equal(service.requests(), 1);
});

test('Anthropic provider errors after output are not mistaken for a missing completion marker', async t => {
    const wire = fixture('anthropic', 'normal');
    wire.events.splice(-2, 2, { type: 'error', error: { type: 'overloaded_error', message: 'offline provider failure' } });
    const service = await localProvider(t, wire, true);
    const adapter = createAgentAdapter({ provider: 'anthropic', apiKey: 'offline-fixture', model: 'fixture', baseUrl: service.baseUrl });
    await assert.rejects(adapter.chat({ messages, tools, onStreamProgress() {} }));
    assert.equal(service.requests(), 1);
});

test('explicit refusal remains a failure rather than authorizing a tool call', () => {
    for (const [protocol, reason, refused] of [['openai', 'content_filter'], ['openai', 'stop', true],
        ['anthropic', 'refusal'], ['google', 'SAFETY'], ['responses', 'content_filter']]) {
        assert.throws(() => readResponseCompletion(protocol, reason, refused), { code: 'AGENT_RESPONSE_REFUSED' });
    }
});
