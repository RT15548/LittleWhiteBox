import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { createHostChatCompletionsClient } from '../../../shared/host-llm/chat-completions/client.js';

const tool = { type: 'function', function: { name: 'Read', description: 'Read a fixture.', parameters: { type: 'object', properties: {} } } };
const sse = events => new Response(events.map(event => `${event.type ? `event: ${event.type}\n` : ''}data: ${JSON.stringify(event)}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } });

function fixture(protocol, ending, tools) {
    if (protocol === 'openai') {
        const message = { role: 'assistant', content: 'Complete text', ...(ending === 'refusal' ? { refusal: 'Refused' } : {}),
            ...(tools ? { tool_calls: [{ index: 0, id: 'call_read', type: 'function', function: { name: 'Read', arguments: '{}' } }] } : {}) };
        const reason = ending === 'normal' || ending === 'refusal' ? tools ? 'tool_calls' : 'stop' : ending === 'limit' ? 'length' : ending === 'blocked' ? 'content_filter' : undefined;
        return { json: { choices: [{ message, finish_reason: reason }] }, events: [
            { choices: [{ index: 0, delta: message }] },
            ...(reason ? [{ choices: [{ index: 0, delta: {}, finish_reason: reason }] }] : []),
        ] };
    }
    if (protocol === 'anthropic') {
        const content = [{ type: 'text', text: 'Complete text' }, ...(tools ? [{ type: 'tool_use', id: 'call_read', name: 'Read', input: {} }] : [])];
        const reason = ending === 'normal' || ending === 'missing-stop-event' ? tools ? 'tool_use' : 'end_turn' : ending === 'limit' ? 'max_tokens' : ending === 'blocked' ? 'refusal' : null;
        const message = { id: 'msg_fixture', type: 'message', role: 'assistant', model: 'claude-sonnet-4-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 5, output_tokens: 0 } };
        return { json: { ...message, content, stop_reason: reason }, events: [
            { type: 'message_start', message },
            ...content.flatMap((content_block, index) => [{ type: 'content_block_start', index, content_block }, { type: 'content_block_stop', index }]),
            ...(reason ? [{ type: 'message_delta', delta: { stop_reason: reason, stop_sequence: null }, usage: { output_tokens: 8 } },
                ...(ending === 'missing-stop-event' ? [] : [{ type: 'message_stop' }])] : []),
        ] };
    }
    const content = { role: 'model', parts: [{ text: 'Complete text' }, ...(tools ? [{ functionCall: { name: 'Read', args: {} } }] : [])] };
    const reason = ending === 'normal' ? 'STOP' : ending === 'limit' ? 'MAX_TOKENS' : ending === 'blocked' ? 'SAFETY' : undefined;
    const json = { candidates: [{ index: 0, content, finishReason: reason }] };
    return { json, events: [json, { usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 8 } }] };
}

// Real SDK/HTTP aggregation, including the factory's hosted routes. No mocked finalMessage/finalResponse.
for (const [provider, protocol, toolMode = 'native'] of [
    ['openai-compatible', 'openai'], ['anthropic', 'anthropic'], ['google', 'google'],
    ['openai-compatible', 'openai', 'tagged-json'],
    ['sillytavern-openai-compatible', 'openai'], ['sillytavern-claude', 'anthropic'], ['sillytavern-google', 'google'],
]) {
    for (const stream of [false, true]) {
        test(`${provider}/${toolMode} ${stream ? 'stream' : 'complete-result'} requires actual completion`, async t => {
            for (const ending of ['normal', 'eof', 'limit', 'blocked', ...(protocol === 'openai' ? ['refusal'] : []),
                ...(protocol === 'anthropic' && (stream || provider.startsWith('sillytavern')) ? ['missing-stop-event'] : [])]) {
                for (const tools of [false, true]) {
                    const data = fixture(protocol, ending, tools);
                    if (toolMode === 'tagged-json' && tools) {
                        const message = data.json.choices[0].message;
                        delete message.tool_calls;
                        message.content += '\n<tool_call>{"name":"Read","arguments":{}}</tool_call>';
                    }
                    let requests = 0;
                    const transport = async (_url, init) => {
                        requests++;
                        const body = JSON.parse(init.body);
                        const streaming = body.stream || String(_url).includes('streamGenerateContent');
                        return streaming ? sse(data.events) : Response.json(data.json);
                    };
                    t.mock.method(globalThis, 'fetch', transport);
                    const hostClient = createHostChatCompletionsClient({ requestHeadersProvider: () => ({}), fetch: transport });
                    const adapter = createAgentAdapter({ provider, apiKey: 'fixture', model: protocol === 'anthropic' ? 'claude-sonnet-4-5' : protocol === 'google' ? 'gemini-2.5-flash' : 'gpt-4o',
                        baseUrl: 'https://fixture.invalid', timeoutMs: 2000, toolMode }, { hostClient });
                    const run = () => adapter.chat({ messages: [{ role: 'user', content: 'Fixture' }], tools: tools ? [tool] : [],
                        ...(stream ? { onStreamProgress() {} } : {}) });
                    if (ending === 'normal') {
                        const result = await run(); assert.equal(result.text, 'Complete text'); assert.equal(result.toolCalls.length, tools ? 1 : 0);
                    } else { await assert.rejects(run); }
                    assert.equal(requests, 1, 'A non-normal response must not be retried');
                    t.mock.restoreAll();
                }
            }
        });
    }
}
