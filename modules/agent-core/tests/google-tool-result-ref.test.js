import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgentAdapter } from '../provider-config.js';
import { buildProviderAssistantToolCallMessage, buildProviderToolResultMessage } from '../runtime/protocol.js';

// Protocol contract: schema data containing $ref stays text, not an attachment.
// Initial history, live continuation and saved replay preserve IDs/signatures;
// ordinary results retain their serialized wire representation (broken chat).
for (const provider of ['google', 'google-vertex']) {
    for (const streaming of [false, true]) {
        test(`${provider} ${streaming ? 'stream' : 'JSON'} encodes only actual $ref keys in tool results`, async t => {
            const config = { provider, model: 'offline-model', apiKey: 'offline', baseUrl: 'https://offline.invalid', vertex: { authMode: 'relay' } };
            const part = { functionCall: { id: 'call_ref', name: 'read', args: {} }, thoughtSignature: 'original-signature' };
            const sent = [];
            t.mock.method(globalThis, 'fetch', async (input, init) => {
                const request = new Request(input, init);
                assert.equal(new URL(request.url).hostname, 'offline.invalid');
                sent.push(await request.json());
                const body = { candidates: [{ content: { role: 'model', parts: [part] }, finishReason: 'STOP' }] };
                return new Response(streaming ? `data: ${JSON.stringify(body)}\n\n` : JSON.stringify(body),
                    { headers: { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' } });
            });
            const common = streaming ? { onStreamProgress() {} } : {};
            const user = { role: 'user', content: 'Read the guide' };
            for (const response of [
                { schema: [{ $ref: '#/$defs/contract' }] },
                { $ref: '#/contract', description: 'data' },
                { text: 'Literal "$ref" text', items: [null, { value: 1 }] },
                { ok: true, result: {} },
            ]) {
                const adapter = createAgentAdapter(config);
                const first = await adapter.chat({ ...common, messages: [user] });
                const assistant = buildProviderAssistantToolCallMessage(first, first.toolCalls);
                const raw = JSON.stringify(response, null, 2);
                const result = buildProviderToolResultMessage({ toolCallId: first.toolCalls[0].id, toolName: 'read', content: raw });
                const hasRef = Object.hasOwn(response, '$ref') || Object.hasOwn(response, 'schema');
                for (const messages of [[user, assistant, result], JSON.parse(JSON.stringify([user, assistant, result]))]) {
                    await createAgentAdapter(config).chat({ ...common, messages });
                    assert.equal(JSON.stringify(sent.at(-1).contents.at(-1).parts), JSON.stringify([
                        { functionResponse: { id: 'call_ref', name: 'read', response: hasRef ? { output: raw } : response } },
                    ]));
                    assert.deepEqual(sent.at(-1).contents[1].parts, [part]);
                }
                await adapter.chat({ ...common, toolResponses: [{ ...first.toolCalls[0], response }] });
                assert.deepEqual(sent.at(-1).contents.at(-1).parts, [
                    { functionResponse: { id: 'call_ref', name: 'read', response: hasRef ? { output: JSON.stringify(response) } : response } },
                ]);
                assert.deepEqual(sent.at(-1).contents[1].parts, [part]);
            }
        });
    }
}

test('OpenAI-compatible Gemini relays receive reference-bearing results as text without changing the call', () => {
    const original = '{ "schema": [{ "$ref": "#/$defs/contract" }] }';
    const ordinary = '{ "title": "Literal $ref text" }';
    const assistant = { role: 'assistant', content: '', tool_calls: [{
        id: 'call_ref', type: 'function', function: { name: 'read', arguments: '{}' }, thought_signature: 'original-signature',
    }] };
    for (const [model, toolMode, wrap] of [
        ['gemini-3.8-flash', 'native', true],
        ['deepseek-flash', 'native', false],
        ['opaque-alias', 'native', false],
        ['gemini-3.8-flash', 'tagged-json', false],
    ]) {
        const adapter = createAgentAdapter({ provider: 'openai-compatible', model, toolMode, apiKey: 'offline', baseUrl: 'https://offline.invalid' });
        const tools = [{ type: 'function', function: { name: 'read', parameters: { type: 'object' } } }];
        for (const raw of [original, ordinary, 'plain text']) {
            const result = { role: 'tool', tool_call_id: 'call_ref', content: raw };
            const messages = [{ role: 'user', content: 'Read the guide' }, assistant, result];
            for (const history of [messages, JSON.parse(JSON.stringify(messages))]) {
                const body = adapter.buildRequestBody({ messages: history, tools, ...(model === 'deepseek-flash' ? { reasoning: { mode: 'off' } } : {}) });
                if (toolMode === 'tagged-json') {
                    assert.equal(body.messages.at(-1).content.includes(raw), true);
                } else {
                    assert.deepEqual(body.messages.at(-2).tool_calls, assistant.tool_calls);
                    assert.deepEqual(body.messages.at(-1), { ...result, content: wrap && raw === original ? JSON.stringify({ output: raw }) : raw });
                }
                assert.deepEqual(history, messages);
            }
            assert.equal(result.content, raw);
        }
    }
});
