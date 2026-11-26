import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import * as agentCore from '../browser-entry.js';
import { createPublicAgentApi } from '../public-api.js';
import { createHostChatCompletionsClient } from '../../../shared/host-llm/chat-completions/client.js';

// Public callers own history and execution. A replay failure can lose signed output,
// misassociate parallel tool results, or issue an unintended extra model request.
// These fixtures are inert; all seven adapters send only to a loopback HTTP server.
const providers = ['openai-compatible', 'openai-responses', 'anthropic', 'google',
    'sillytavern-openai-compatible', 'sillytavern-claude', 'sillytavern-google'];
const tools = [{ type: 'function', function: { name: 'fixture_lookup', parameters: {
    type: 'object', properties: { slot: { type: 'integer' } }, required: ['slot'], additionalProperties: false,
} } }];
const system = { role: 'system', content: 'offline system fixture' };
const user = { role: 'user', content: 'offline fixture' };
const values = [[{ data: false }, { data: '' }], [{ data: { zero: 0, empty: [], nullable: null } }]];
const clone = value => JSON.parse(JSON.stringify(value));
const isHost = provider => provider.startsWith('sillytavern-');
const protocolOf = provider => provider.replace('sillytavern-', '').replace('claude', 'anthropic');

function fixture(provider, round) {
    const protocol = protocolOf(provider);
    const text = round === 2 ? 'fixture final' : `fixture round ${round + 1}`;
    const calls = round === 2 ? [] : Array.from({ length: round === 0 ? 2 : 1 }, (_, index) => ({
        id: `call-${round}-${index}`, name: 'fixture_lookup', arguments: JSON.stringify({ slot: round * 2 + index }),
    }));
    if (protocol === 'openai-compatible') {
        const message = { role: 'assistant', content: text, ...(calls.length ? {
            reasoning_content: `fixture reasoning ${round}`,
            tool_calls: calls.map(call => ({ id: call.id, type: 'function',
                function: { name: call.name, arguments: call.arguments },
                extra_content: { google: { thought_signature: `fixture-signature-${call.id}` } },
            })),
        } : {}) };
        const reason = calls.length ? 'tool_calls' : 'stop';
        return { text, calls, native: message, reason,
            json: { id: `chat-${round}`, model: 'fixture-model', choices: [{ message, finish_reason: reason }] },
            events: [{ choices: [{ delta: { ...message, ...(calls.length ? {
                tool_calls: message.tool_calls.map((call, index) => ({ ...call, index })),
            } : {}) } }] }, { choices: [{ delta: {}, finish_reason: reason }] }],
        };
    }
    if (protocol === 'anthropic') {
        const content = [
            ...(calls.length ? [{ type: 'thinking', thinking: `fixture reasoning ${round}`, signature: `fixture-signature-${round}` },
                { type: 'redacted_thinking', data: `fixture-opaque-${round}` }] : []),
            { type: 'text', text },
            ...calls.map(call => ({ type: 'tool_use', id: call.id, name: call.name, input: JSON.parse(call.arguments) })),
        ];
        const reason = calls.length ? 'tool_use' : 'end_turn';
        const json = { id: `msg-${round}`, type: 'message', role: 'assistant', model: 'fixture-model', content,
            stop_reason: reason, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } };
        const events = [{ type: 'message_start', message: { ...json, content: [], stop_reason: null } }];
        content.forEach((block, index) => {
            const initial = block.type === 'text' ? { ...block, text: '' }
                : block.type === 'thinking' ? { ...block, thinking: '', signature: '' }
                    : block.type === 'tool_use' ? { ...block, input: {} } : block;
            events.push({ type: 'content_block_start', index, content_block: initial });
            if (block.type === 'text') events.push({ type: 'content_block_delta', index, delta: { type: 'text_delta', text: block.text } });
            if (block.type === 'thinking') events.push(
                { type: 'content_block_delta', index, delta: { type: 'thinking_delta', thinking: block.thinking } },
                { type: 'content_block_delta', index, delta: { type: 'signature_delta', signature: block.signature } });
            if (block.type === 'tool_use') events.push({ type: 'content_block_delta', index,
                delta: { type: 'input_json_delta', partial_json: JSON.stringify(block.input) } });
            events.push({ type: 'content_block_stop', index });
        });
        events.push({ type: 'message_delta', delta: { stop_reason: reason }, usage: { output_tokens: 1 } }, { type: 'message_stop' });
        return { text, calls, native: content, reason, json, events };
    }
    if (protocol === 'google') {
        const content = { role: 'model', parts: [{ text }, ...calls.map(call => ({
            thoughtSignature: `Zml4dHVyZS0${round}`,
            functionCall: { ...(isHost(provider) ? { id: call.id } : {}), name: call.name, args: JSON.parse(call.arguments) },
        }))] };
        const json = { candidates: [{ content, finishReason: 'STOP' }] };
        return { text, calls, native: content, reason: 'STOP', json, events: [json] };
    }
    const output = [
        ...(calls.length ? [{ type: 'reasoning', id: `rs-${round}`, summary: [], encrypted_content: `fixture-opaque-${round}` }] : []),
        { type: 'message', id: `msg-${round}`, role: 'assistant', status: 'completed',
            content: [{ type: 'output_text', text, annotations: [] }] },
        ...calls.map(call => ({ type: 'function_call', id: `fc-${call.id}`, call_id: call.id,
            name: call.name, arguments: call.arguments, status: 'completed' })),
    ];
    const json = { id: `resp-${round}`, object: 'response', model: 'fixture-model', output, status: 'completed' };
    return { text, calls, native: output, reason: 'completed', json, events: [
        { type: 'response.created', response: { ...json, output: [], status: 'in_progress' } },
        ...output.flatMap((item, output_index) => [
            { type: 'response.output_item.added', output_index, item: item.type === 'message' ? { ...item, content: [] }
                : item.type === 'function_call' ? { ...item, arguments: '' } : item },
            ...(item.type === 'message' ? [
                { type: 'response.content_part.added', output_index, item_id: item.id, content_index: 0,
                    part: { ...item.content[0], text: '' } },
                { type: 'response.output_text.delta', output_index, item_id: item.id, content_index: 0, delta: text },
                { type: 'response.output_text.done', output_index, item_id: item.id, content_index: 0, text },
                { type: 'response.content_part.done', output_index, item_id: item.id, content_index: 0, part: item.content[0] },
            ] : item.type === 'function_call' ? [
                { type: 'response.function_call_arguments.delta', output_index, item_id: item.id, delta: item.arguments },
                { type: 'response.function_call_arguments.done', output_index, item_id: item.id, arguments: item.arguments },
            ] : []),
            { type: 'response.output_item.done', output_index, item },
        ]),
        { type: 'response.completed', response: json },
    ] };
}

async function localProvider(t, wires) {
    const requests = [];
    const server = createServer((request, response) => {
        const respond = async () => {
            let raw = '';
            for await (const chunk of request) raw += chunk;
            const body = JSON.parse(raw);
            const wire = wires[requests.length];
            requests.push({ method: request.method, url: request.url, body });
            if (!wire) { response.writeHead(500); response.end(); return; }
            const streaming = body.stream === true || request.url.includes(':streamGenerateContent');
            response.writeHead(200, { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' });
            response.end(streaming ? wire.events.map((event, sequence_number) =>
                `${event.type ? `event: ${event.type}\n` : ''}data: ${JSON.stringify({ ...event, sequence_number })}\n\n`).join('')
                : JSON.stringify(wire.json));
        };
        respond().catch(error => response.destroy(error));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
    return { baseUrl: `http://127.0.0.1:${server.address().port}`, requests };
}

function expectedHistory(provider, wires, round) {
    const protocol = protocolOf(provider);
    const hosted = isHost(provider);
    const history = protocol === 'openai-responses'
        ? [{ type: 'message', role: 'user', content: [{ type: 'input_text', text: user.content }] }]
        : protocol === 'google' && !hosted
            ? [{ role: 'user', parts: [{ text: user.content }] }]
            : protocol === 'anthropic' && !hosted
                ? [{ role: 'user', content: [{ type: 'text', text: user.content }] }]
                : [system, user];
    for (let previous = 0; previous < round; previous++) {
        const wire = wires[previous];
        if (protocol === 'openai-responses') {
            history.push(...wire.native, ...wire.calls.map((call, index) => ({ type: 'function_call_output',
                call_id: call.id, output: JSON.stringify(values[previous][index]) })));
        } else if (protocol === 'google' && !hosted) {
            history.push(wire.native, { role: 'user', parts: wire.calls.map((call, index) => ({
                functionResponse: { name: call.name, response: values[previous][index] },
            })) });
        } else {
            const assistant = protocol === 'google' ? { role: 'assistant', content: [
                { type: 'text', text: wire.text }, { type: 'tool_calls', tool_calls: wire.calls.map((call, index) => ({
                    id: call.id, type: 'function', function: { name: call.name, arguments: call.arguments },
                    signature: wire.native.parts[index + 1].thoughtSignature,
                })) },
            ] } : protocol === 'anthropic' ? { role: 'assistant', content: wire.native } : wire.native;
            history.push(assistant);
            if (protocol === 'anthropic' && !hosted) {
                history.push({ role: 'user', content: wire.calls.map((call, index) => ({ type: 'tool_result',
                    tool_use_id: call.id, content: JSON.stringify(values[previous][index]) })) });
            } else {
                history.push(...wire.calls.map((call, index) => ({ role: 'tool', tool_call_id: call.id,
                    content: JSON.stringify(values[previous][index]), ...(protocol === 'openai-compatible' ? {} : { toolName: call.name }) })));
            }
        }
    }
    return clone(history);
}

function assertRequest(provider, streaming, request, wires, round) {
    const { body } = request;
    const protocol = protocolOf(provider);
    const hosted = isHost(provider);
    assert.equal(request.method, 'POST');
    if (hosted) {
        assert.equal(request.url, '/api/backends/chat-completions/generate');
        assert.equal(body.chat_completion_source, { 'openai-compatible': 'openai', anthropic: 'claude', google: 'makersuite' }[protocol]);
        assert.equal(body.stream, streaming || protocol !== 'openai-compatible');
    } else if (protocol === 'google') {
        assert.equal(request.url, `/v1beta/models/fixture-model:${streaming ? 'streamGenerateContent?alt=sse' : 'generateContent'}`);
    } else {
        assert.equal(request.url, { 'openai-compatible': '/chat/completions', 'openai-responses': '/responses', anthropic: '/v1/messages' }[protocol]);
        assert.equal(body.stream === true, streaming);
    }
    if (protocol === 'openai-responses') assert.equal(body.instructions, system.content);
    else if (protocol === 'anthropic' && !hosted) assert.equal(body.system, system.content);
    else if (protocol === 'google' && !hosted) assert.deepEqual(body.systemInstruction.parts, [{ text: system.content }]);
    assert.deepEqual(body[protocol === 'openai-responses' ? 'input' : protocol === 'google' && !hosted ? 'contents' : 'messages'],
        expectedHistory(provider, wires, round));
    const parameters = protocol === 'google' && !hosted ? body.generationConfig : body;
    // Responses and Claude currently omit temperature for all supported reasoning modes.
    if (['openai-responses', 'anthropic'].includes(protocol)) assert.equal(Object.hasOwn(parameters, 'temperature'), false);
    else assert.equal(parameters.temperature, 0.37);
    assert.equal(parameters[protocol === 'google' && !hosted ? 'maxOutputTokens' : protocol === 'openai-responses' ? 'max_output_tokens' : 'max_tokens'], 177);
    assert.equal(parameters[protocol === 'google' && !hosted ? 'topP' : 'top_p'], 0.83);
    if (!(protocol === 'google' && !hosted)) assert.equal(body.model, 'fixture-model');
    const expectedTools = protocol === 'google' && hosted
        ? [{ type: 'function', function: { name: tools[0].function.name, parametersJsonSchema: tools[0].function.parameters } }]
        : hosted || protocol === 'openai-compatible' ? tools
        : protocol === 'openai-responses' ? [{ type: 'function', name: tools[0].function.name, parameters: tools[0].function.parameters, strict: false }]
            : protocol === 'anthropic' ? [{ name: tools[0].function.name, input_schema: tools[0].function.parameters }]
                : [{ functionDeclarations: [{ name: tools[0].function.name, parametersJsonSchema: tools[0].function.parameters }] }];
    assert.deepEqual(body.tools, expectedTools);
}

function assertReply(provider, result, wire) {
    assert.equal(result.text, wire.text);
    assert.equal(result.completion, 'complete');
    assert.equal(result.finishReason, wire.reason);
    assert.equal(result.truncated, false);
    assert.equal(result.provider, provider);
    assert.equal(result.model, 'fixture-model');
    assert.equal(result.reply.role, 'assistant');
    assert.equal(result.reply.content, wire.text);
    assert.deepEqual(result.reply, clone(result.reply));
    assert.equal(result.toolCalls.length, wire.calls.length);
    assert.deepEqual(result.toolCalls.map(call => ({ name: call.name, arguments: JSON.parse(call.arguments) })),
        wire.calls.map(call => ({ name: call.name, arguments: JSON.parse(call.arguments) })));
    const protocol = protocolOf(provider);
    const payload = result.reply.providerPayload;
    assert.deepEqual(protocol === 'openai-compatible' ? payload.openaiCompatibleMessage
        : protocol === 'openai-responses' ? payload.openAIResponseOutput
            : protocol === 'anthropic' ? payload.anthropicContent : payload.googleContent, wire.native);
    assert.deepEqual(result.reply.tool_calls.map(call => ({ id: call.id, name: call.function.name, arguments: call.function.arguments })),
        result.toolCalls.map(call => ({ id: call.id, name: call.name, arguments: call.arguments })));
    if (provider === 'google') {
        assert.equal(new Set(result.toolCalls.map(call => call.id)).size, wire.calls.length);
        for (const call of result.toolCalls) assert.equal(call.providerId, '');
        for (const call of result.reply.tool_calls) assert.equal(call.providerToolCallId, '');
        for (const part of payload.googleContent.parts.filter(part => part.functionCall)) {
            assert.equal(Object.hasOwn(part.functionCall, 'id'), false);
        }
    } else assert.deepEqual(result.toolCalls.map(call => call.id), wire.calls.map(call => call.id));
}

test('public main sessions replay caller-owned JSON history through every provider without executing tools', async t => {
    for (const provider of providers) {
        for (const streaming of [false, true]) await t.test(`${provider}/${streaming ? 'streaming' : 'buffered'}`, async t => {
            const wires = [0, 1, 2].map(round => fixture(provider, round));
            const service = await localProvider(t, wires);
            const hostClient = createHostChatCompletionsClient({ requestHeadersProvider: () => ({}),
                fetch: (url, options) => fetch(new URL(url, service.baseUrl), options) });
            const settings = agentCore.normalizeAgentSettings({ currentPresetName: 'fixture-main', presets: {
                'fixture-main': { provider, model: 'fixture-model', apiKey: 'offline-fixture',
                    baseUrl: service.baseUrl, toolMode: 'native', maxTokens: 177, temperature: 0.37,
                    sampling: { topP: { enabled: true, value: 0.83 } } },
            } });
            let settingsReads = 0;
            const { api } = createPublicAgentApi({ isEnabled: () => true,
                loadSettings: async () => { settingsReads++; return settings; },
                loadCore: async () => ({ ...agentCore, createAgentAdapter: config =>
                    agentCore.createAgentAdapter(config, isHost(provider) ? { hostClient } : {}) }),
            });
            const session = await api.openSession({ api: 'main' });
            t.after(() => session.dispose());
            // An open session owns a provider-config snapshot, not a mutable settings reference.
            Object.assign(settings.presets['fixture-main'], { model: 'changed-fixture', temperature: 1.2, maxTokens: 1 });
            const messages = clone([system, user]);
            const progress = [];
            for (let round = 0; round < 3; round++) {
                const before = clone(messages);
                const result = await session.chat({ messages, tools, toolChoice: 'auto',
                    ...(streaming ? { onStreamProgress: draft => progress.push(draft) } : {}) });
                assert.deepEqual(messages, before, 'chat must not mutate caller-owned history');
                assertReply(provider, result, wires[round]);
                assert.equal(service.requests.length, round + 1, 'one chat must issue exactly one model request');
                assertRequest(provider, streaming, service.requests[round], wires, round);
                messages.push(clone(result.reply));
                result.toolCalls.forEach((call, index) => {
                    const toolMessage = session.toolResult(clone(call), clone(values[round][index]));
                    assert.deepEqual(toolMessage, { role: 'tool', tool_call_id: call.id, toolName: call.name,
                        content: JSON.stringify(values[round][index]) });
                    messages.push(clone(toolMessage));
                });
                assert.equal(service.requests.length, round + 1, 'toolResult must only build a message');
            }
            assert.equal(settingsReads, 1);
            if (streaming) {
                assert.ok(progress.length > 0);
                assert.ok(progress.some(draft => draft.text === wires[2].text));
                assert.ok(progress.every(draft => draft.toolCallDraft === true));
            } else assert.equal(progress.length, 0);
            session.dispose();
            assert.equal(service.requests.length, 3);
        });
    }
});
