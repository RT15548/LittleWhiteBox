import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveConversationTokens, estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { setHostChatCompletionsRequestHeadersProvider, buildHostChatCompletionGenerateRequest } from '../../../shared/host-llm/chat-completions/client.js';

const messages = [{ role: 'system', content: '规则' }, { role: 'user', content: '请求' }];
const tools = [{ function: { name: 'Read', parameters: { type: 'object' } } }];
const encoded = count => ({ count, ids: Array(count).fill(1) });

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
