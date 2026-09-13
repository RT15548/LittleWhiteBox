import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveConversationTokens, estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { SillyTavernOpenAICompatibleAdapter } from '../../agent-core/adapters/sillytavern-openai-compatible.js';
import { setHostChatCompletionsRequestHeadersProvider, buildHostChatCompletionGenerateRequest } from '../../../shared/host-llm/chat-completions/client.js';

const messages = [{ role: 'system', content: '规则' }, { role: 'user', content: '请求' }];
const tools = [{ function: { name: 'Read', parameters: { type: 'object' } } }];
const encoded = count => ({ count, ids: Array(count).fill(1) });

test('tokenizer and fallback count only reasoning replayed by the native adapter, including earlier text-only replies', async t => {
    const calls = [{ id: 'call', type: 'function', function: { name: 'Read', arguments: '{}' } }];
    const assistant = (content, reasoning, toolCalls) => ({ role: 'assistant', content,
        ...(toolCalls ? { tool_calls: toolCalls } : {}),
        thoughts: [{ text: 'display-only-thought' }],
        providerPayload: { openaiCompatibleMessage: { role: 'assistant', content,
            reasoning_content: reasoning, ...(toolCalls ? { tool_calls: toolCalls } : {}),
        } },
    });
    const history = [
        { role: 'user', content: 'old' },
        assistant('', 'old tool reasoning', calls),
        { role: 'tool', tool_call_id: 'call', content: '{}' },
        assistant('', 'old text reasoning '.repeat(1000)),
        { role: 'user', content: 'next' },
        assistant('', 'current tool reasoning', calls),
        { role: 'tool', tool_call_id: 'call', content: '{}' },
        assistant('answer', 'current text reasoning'),
    ];
    const original = structuredClone(history);
    let counted;
    t.mock.method(globalThis, 'fetch', async (_url, request) => {
        counted = JSON.parse(JSON.parse(request.body).text);
        return Response.json(encoded(4321));
    });
    for (const provider of ['openai-compatible', 'sillytavern-openai-compatible']) {
        for (const model of ['deepseek-chat', 'gpt-5.6']) {
            for (const mode of ['on', 'off', 'inherit']) {
                for (const toolMode of ['native', 'tagged-json']) {
                    for (const requestTools of [tools, []]) {
                        const config = { provider, model, toolMode, apiKey: 'test', reasoning: { mode } };
                        const task = { messages: history, tools: requestTools, reasoning: config.reasoning };
                        const body = provider === 'openai-compatible'
                            ? new OpenAICompatibleAdapter(config).buildRequestBody(task)
                            : new SillyTavernOpenAICompatibleAdapter(config).buildPayload(task, toolMode === 'tagged-json' && requestTools.length > 0);
                        const input = { messages: history, tools: requestTools, providerConfig: config };
                        assert.deepEqual(await resolveConversationTokens({ ...input, requestHeaders: () => ({}) }), { tokens: 4321, source: 'tokenizer' });
                        assert.deepEqual(counted.map(m => m.reasoning_content).filter(Boolean),
                            body.messages.map(m => m.reasoning_content).filter(Boolean), JSON.stringify(config));
                        assert.ok(!JSON.stringify(counted).includes('display-only-thought'));
                        const fallback = await resolveConversationTokens({ ...input, requestHeaders: () => { throw new Error('headers unavailable'); } });
                        assert.deepEqual(fallback, { tokens: estimateConversationTokens(input), source: 'estimated' });
                        assert.equal(fallback.tokens, Math.ceil(new TextEncoder().encode(JSON.stringify(counted)).length / 3.35));
                    }
                }
            }
        }
    }
    assert.deepEqual(history, original);
});

test('generation and counting read current Host authentication; count includes text and tools, never API credentials', async t => {
    let csrf = 'first';
    setHostChatCompletionsRequestHeadersProvider(() => ({ 'X-CSRF-Token': csrf }));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(options.headers['X-CSRF-Token'], csrf);
        assert.equal(options.headers.Authorization, undefined);
        assert.ok(!options.body.includes('private-api-key'));
        requests.push({ url, body: JSON.parse(options.body) });
        return Response.json(encoded(321));
    });
    for (const provider of ['openai-compatible', 'openai-responses', 'sillytavern-openai-compatible', 'anthropic', 'sillytavern-claude', 'google', 'sillytavern-google']) {
        const count = await resolveConversationTokens({ messages, tools, providerConfig: { provider, apiKey: 'private-api-key' } });
        assert.deepEqual(count, { tokens: 321, source: 'tokenizer' });
        const request = requests.at(-1);
        assert.match(request.url, provider.includes('claude') || provider === 'anthropic' ? /claude\/encode$/ : /openai\/encode\?model=/);
        if (provider.includes('google')) assert.match(request.url, /model=gemini$/);
        assert.deepEqual(JSON.parse(request.body.text), [...messages, { role: 'system', content: `TOOLS\n${JSON.stringify(tools)}` }]);
        csrf += '-renewed';
    }
    const generation = await buildHostChatCompletionGenerateRequest({ model: 'test' });
    assert.equal(generation.rawHeaders['X-CSRF-Token'], csrf);
});

test('403 and malformed HTTP-200 counts return a marked estimate without blocking generation', async t => {
    let response;
    t.mock.method(globalThis, 'fetch', async () => response);
    const input = { messages, requestHeaders: () => ({}) };
    for (const data of [null, { count: 0, ids: [] }, { count: 100, ids: [] }, { token_count: 123 },
        { count: '1', ids: [1] }, { count: -1, ids: [] }, { count: 1, ids: [-1] }, { count: 1, ids: [1.5] }]) {
        response = data === null ? new Response('Forbidden', { status: 403 }) : Response.json(data);
        assert.deepEqual(await resolveConversationTokens(input), { tokens: estimateConversationTokens(input), source: 'estimated' });
    }
    response = Response.json(encoded(194088));
    assert.ok(estimateConversationTokens(input) < 128000);
    assert.deepEqual(await resolveConversationTokens(input), { tokens: 194088, source: 'tokenizer' });
});

test('unregistered headers, bridge failure and network failure do not make counting mandatory', async t => {
    setHostChatCompletionsRequestHeadersProvider(null);
    const fallback = { tokens: estimateConversationTokens({ messages }), source: 'estimated' };
    assert.deepEqual(await resolveConversationTokens({ messages }), fallback);
    assert.deepEqual(await resolveConversationTokens({ messages, requestHeaders: async () => {throw new Error('bridge timeout');} }), fallback);
    t.mock.method(globalThis, 'fetch', async () => {throw new TypeError('Failed to fetch');});
    assert.deepEqual(await resolveConversationTokens({ messages, requestHeaders: () => ({}) }), fallback);
});

test('cancellation after authentication or a late tokenizer response never returns a count', async t => {
    const controller = new AbortController();
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => { calls++; controller.abort(); return Response.json(encoded(10)); });
    await assert.rejects(resolveConversationTokens({ messages, signal: controller.signal, requestHeaders: () => ({}) }), { name: 'AbortError' });
    assert.equal(calls, 1);
    await assert.rejects(resolveConversationTokens({ messages, signal: controller.signal, requestHeaders: () => ({}) }), { name: 'AbortError' });
    assert.equal(calls, 1);
});
