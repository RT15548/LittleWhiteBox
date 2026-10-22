import test from 'node:test';
import assert from 'node:assert/strict';
import { pullModelsForProvider } from '../model-list.js';
import { createAgentAdapter } from '../provider-config.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';

// Contracts: discovery must not change generation protocol, disclose another
// credential, or retry a rejected identity. Failed discovery must stay failed.
test('hosted Claude discovers relay models through OpenAI without changing generation', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({ 'X-CSRF-Token': 'fixture' }));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const apiKey of ['', 'fixture-key']) {
        for (const failure of [404, 405, 501, 'cors']) {
            await t.test(`${failure}/${apiKey ? 'key' : 'no-key'}`, async t => {
                const requests = [];
                t.mock.method(globalThis, 'fetch', async (url, options) => {
                    requests.push({ url, options, body: options?.body ? JSON.parse(options.body) : null });
                    if (String(url).startsWith('https://relay.test/')) {
                        if (failure === 'cors') throw new TypeError('Failed to fetch');
                        return Response.json({ error: { message: 'unsupported model list' } }, { status: failure });
                    }
                    if (url === '/api/backends/chat-completions/status') return Response.json({ data: [{ id: 'relay-claude' }] });
                    const events = [
                        { type: 'content_block_start', index: 0, content_block: { type: 'text', text: 'OK' } },
                        { type: 'message_delta', delta: { stop_reason: 'end_turn' } },
                    ];
                    return new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(''), {
                        headers: { 'Content-Type': 'text/event-stream' },
                    });
                });
                const config = { provider: 'sillytavern-claude', baseUrl: 'https://relay.test/custom/v3', apiKey, model: 'relay-claude' };
                const before = structuredClone(config);
                assert.deepEqual(await pullModelsForProvider(config), ['relay-claude']);
                const listing = requests.at(-1);
                assert.equal(listing.url, '/api/backends/chat-completions/status');
                assert.equal(listing.body.chat_completion_source, 'openai');
                assert.equal(listing.body.reverse_proxy, config.baseUrl);
                assert.equal(listing.body.proxy_password, apiKey || undefined);
                assert.equal(new Headers(listing.options.headers).get('x-csrf-token'), 'fixture');
                const reply = await createAgentAdapter(config).chat({ messages: [{ role: 'user', content: 'fixture' }] });
                assert.equal(reply.text, 'OK');
                assert.equal(requests.at(-1).body.chat_completion_source, 'claude');
                assert.equal(requests.at(-1).body.proxy_password, apiKey || undefined);
                assert.deepEqual(config, before);
            });
        }
    }
});

test('hosted Claude discovery preserves resolved prefixes and adds v1 only for unresolved bare addresses', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const [baseUrl, baseUrlResolved, expected] of [
        ['https://relay.test', false, 'https://relay.test/v1'],
        ['https://relay.test/gateway', true, 'https://relay.test/gateway'],
        ['https://relay.test/custom/v3', false, 'https://relay.test/custom/v3'],
    ]) {
        await t.test(baseUrl, async t => {
            const requests = [];
            t.mock.method(globalThis, 'fetch', async (url, options) => {
                requests.push({ url, body: options?.body ? JSON.parse(options.body) : null });
                return url === '/api/backends/chat-completions/status'
                    ? Response.json({ data: [{ id: 'relay-claude' }] })
                    : Response.json({}, { status: 404 });
            });
            assert.deepEqual(await pullModelsForProvider({ provider: 'sillytavern-claude', baseUrl, apiKey: '' }, { baseUrlResolved }), ['relay-claude']);
            assert.equal(requests.at(-1).body.reverse_proxy, expected);
        });
    }
});

test('hosted Claude never retries authentication, server failures or cancellation through discovery fallback', async t => {
    for (const status of [401, 403, 500]) {
        await t.test(String(status), async t => {
            const requests = [];
            t.mock.method(globalThis, 'fetch', async url => {
                requests.push(url);
                return Response.json({ error: { message: 'rejected' } }, { status });
            });
            await assert.rejects(pullModelsForProvider({ provider: 'sillytavern-claude', baseUrl: 'https://relay.test/v1', apiKey: '' }));
            assert.equal(requests.length, 1);
        });
    }
    const controller = new AbortController();
    const requests = [];
    t.mock.method(globalThis, 'fetch', async url => {
        requests.push(url); controller.abort(); throw new TypeError('Failed to fetch');
    });
    await assert.rejects(pullModelsForProvider({ provider: 'sillytavern-claude', baseUrl: 'https://relay.test/v1', apiKey: '' }, { signal: controller.signal }));
    assert.equal(requests.length, 1);
});

test('unsupported OpenAI model listing remains a failure instead of returning a built-in catalog', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    const requests = [];
    t.mock.method(globalThis, 'fetch', async url => {
        requests.push(url);
        return Response.json({ error: { message: 'unsupported' } }, { status: 404 });
    });
    await assert.rejects(pullModelsForProvider({ provider: 'sillytavern-claude', baseUrl: 'https://relay.test/v1', apiKey: '' }));
    assert.deepEqual(requests, ['https://relay.test/v1/models', '/api/backends/chat-completions/status']);
});
