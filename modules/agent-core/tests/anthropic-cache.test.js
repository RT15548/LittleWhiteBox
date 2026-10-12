import assert from 'node:assert/strict';
import test from 'node:test';
import { AnthropicAdapter } from '../adapters/anthropic.js';

const config = { apiKey: 'fixture-key', baseUrl: 'https://fixture.invalid', model: 'claude-opus-4-6' };
const tool = { type: 'function', function: {
    name: 'Read', description: 'Fixture tool.', parameters: { type: 'object', properties: {} },
} };
const cacheControl = { type: 'ephemeral' };

test('native Claude marks stable prefixes and advances the conversation breakpoint without changing input history', () => {
    const adapter = new AnthropicAdapter(config);
    const task = {
        systemPrompt: 'Stable system.',
        tools: [tool],
        messages: [{ role: 'user', content: 'First turn.' }],
    };
    const original = structuredClone(task);
    const first = adapter.buildRequestBody(task);
    assert.deepEqual(first.system, [{ type: 'text', text: task.systemPrompt, cache_control: cacheControl }]);
    assert.deepEqual(first.tools[0], {
        name: tool.function.name, description: tool.function.description,
        input_schema: tool.function.parameters, cache_control: cacheControl,
    });
    assert.deepEqual(first.messages[0].content, [{ type: 'text', text: task.messages[0].content, cache_control: cacheControl }]);
    assert.deepEqual(task, original);

    const signedThinking = { type: 'thinking', thinking: 'Fixture reasoning.', signature: 'fixture-signature' };
    const nextTask = { ...task, messages: [...task.messages,
        { role: 'assistant', providerPayload: { anthropicContent: [signedThinking,
            { type: 'tool_use', id: 'call_1', name: 'Read', input: {} },
        ] } },
        { role: 'tool', tool_call_id: 'call_1', content: '{"ok":true}' },
    ] };
    const nextOriginal = structuredClone(nextTask);
    const next = adapter.buildRequestBody(nextTask);
    assert.deepEqual(next.tools, first.tools);
    assert.deepEqual(next.system, first.system);
    assert.equal(Object.hasOwn(next.messages[0].content[0], 'cache_control'), false);
    assert.deepEqual(next.messages[1].content[0], signedThinking);
    assert.deepEqual(next.messages[2].content, [{
        type: 'tool_result', tool_use_id: 'call_1', content: '{"ok":true}', cache_control: cacheControl,
    }]);
    assert.deepEqual(nextTask, nextOriginal);
    assert.deepEqual(adapter.inspectRequest(nextTask).request.body, next);
});

test('native Claude skips non-cacheable thinking and empty text without manufacturing system or tools', () => {
    const adapter = new AnthropicAdapter(config);
    const thinking = { type: 'redacted_thinking', data: 'fixture-data' };
    const body = adapter.buildRequestBody({ messages: [
        { role: 'user', content: [{ type: 'image_url', image_url: { url: 'data:image/png;base64,AA==' } }] },
        { role: 'assistant', providerPayload: { anthropicContent: [thinking, { type: 'text', text: '' }] } },
    ] });
    assert.equal(Object.hasOwn(body, 'system'), false);
    assert.equal(Object.hasOwn(body, 'tools'), false);
    assert.deepEqual(body.messages[0].content[0].cache_control, cacheControl);
    assert.deepEqual(body.messages[1].content, [thinking, { type: 'text', text: '' }]);
    const empty = adapter.buildRequestBody({ messages: [{ role: 'user', content: '' }] });
    assert.equal(Object.hasOwn(empty.messages[0].content[0], 'cache_control'), false);
});

test('Anthropic-compatible non-Claude models and unknown aliases keep their existing request contract', () => {
    for (const model of ['deepseek-chat', 'custom-alias']) {
        const body = new AnthropicAdapter({ ...config, model }).buildRequestBody({
            systemPrompt: 'Fixture system.', tools: [tool], messages: [{ role: 'user', content: 'Fixture input.' }],
        });
        assert.equal(body.system, 'Fixture system.');
        assert.equal(Object.hasOwn(body.tools[0], 'cache_control'), false);
        assert.equal(Object.hasOwn(body.messages[0].content[0], 'cache_control'), false);
    }
});

// These are synthetic provider receipts: they verify JSON/SSE protocol transport,
// not a real cache hit or any claim about upstream billing.
for (const stream of [false, true]) {
    for (const [kind, cacheUsage] of [
        ['write', { cache_creation_input_tokens: 4096, cache_read_input_tokens: 0,
            cache_creation: { ephemeral_5m_input_tokens: 4096, ephemeral_1h_input_tokens: 0 } }],
        ['read', { cache_creation_input_tokens: 0, cache_read_input_tokens: 4096 }],
        ['zero', { cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }],
        ['absent', {}],
    ]) {
        test(`native Claude preserves ${kind} usage through actual SDK ${stream ? 'SSE' : 'JSON'} handling`, async t => {
            const usage = { input_tokens: 17, output_tokens: 2, ...cacheUsage };
            const content = [{ type: 'text', text: 'OK' }];
            const message = { id: 'msg_fixture', type: 'message', role: 'assistant', model: config.model,
                content, stop_reason: 'end_turn', stop_sequence: null, usage };
            const requests = [];
            const transport = async (url, init) => {
                assert.equal(String(url), `${config.baseUrl}/v1/messages`);
                requests.push(JSON.parse(init.body));
                if (!stream) return Response.json(message);
                const events = [
                    { type: 'message_start', message: { ...message, content: [], stop_reason: null,
                        usage: { ...usage, output_tokens: 0 } } },
                    { type: 'content_block_start', index: 0, content_block: content[0] },
                    { type: 'content_block_stop', index: 0 },
                    { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: usage.output_tokens } },
                    { type: 'message_stop' },
                ];
                return new Response(events.map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join(''),
                    { headers: { 'content-type': 'text/event-stream' } });
            };
            const logs = t.mock.method(console, 'info', () => {});
            const adapter = new AnthropicAdapter(config);
            adapter.client = adapter.client.withOptions({ fetch: transport });
            const result = await adapter.chat({
                systemPrompt: 'Fixture system.', tools: [tool],
                messages: [{ role: 'user', content: 'Fixture input.' }], maxTokens: 16,
                ...(stream ? { onStreamProgress() {} } : {}),
            });
            assert.equal(requests.length, 1);
            for (const block of [requests[0].system[0], requests[0].tools[0], requests[0].messages[0].content[0]]) {
                assert.deepEqual(block.cache_control, cacheControl);
            }
            assert.deepEqual(result.usage, usage);
            assert.equal(result.text, 'OK');
            assert.equal(logs.mock.calls.length, 1);
            assert.deepEqual(logs.mock.calls[0].arguments[1], { messageId: message.id, model: config.model, usage });
        });
    }
}
