import test from 'node:test';
import assert from 'node:assert/strict';
import { pullModelsForProvider } from '../model-list.js';
import { createAgentAdapter } from '../provider-config.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import { normalizeModelConfigs } from '../config.js';
import { resolveActiveProviderConfig } from '../provider-resolution.js';

// Google discovery contracts (credential disclosure/protocol failure): selected
// auth survives saved config; Bearer never duplicates the key in the URL or Google
// headers; hosted discovery preserves the endpoint/key and generation protocol;
// rejected credentials are not retried with a different identity.
// Endpoint/ID contracts (protocol failure): Bearer discovery defaults to /v1
// like Claude, explicit paths remain exact, both external list formats work,
// and only Google's resource-name prefix is removed, never an opaque model ID.
test('Google Bearer discovery matches Claude endpoints and preserves explicit paths', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const provider of ['google', 'sillytavern-google', 'anthropic', 'sillytavern-claude']) {
        for (const [baseUrl, baseUrlResolved, expected] of [
            ['https://relay.test', false, 'https://relay.test/v1/models'],
            ['https://relay.test/v1/', false, 'https://relay.test/v1/models'],
            ['https://relay.test/v1beta', false, 'https://relay.test/v1beta/models'],
            ['https://relay.test/custom/v3', false, 'https://relay.test/custom/v3/models'],
            ['https://relay.test/gateway', true, 'https://relay.test/gateway/models'],
        ]) {
            await t.test(`${provider}/${baseUrl}`, async t => {
                const requests = [];
                t.mock.method(globalThis, 'fetch', async (url, options) => {
                    const body = options?.body ? JSON.parse(options.body) : null;
                    const endpoint = body ? `${body.reverse_proxy}/models` : String(url);
                    requests.push(endpoint);
                    return endpoint === expected
                        ? Response.json({ data: [{ id: 'vendor/gemini-test' }] })
                        : Response.json({ error: { message: 'missing endpoint' } }, { status: 404 });
                });
                const config = { provider, baseUrl, modelListAuth: 'bearer', apiKey: 'fixture' };
                const before = structuredClone(config);
                assert.deepEqual(await pullModelsForProvider(config, { baseUrlResolved }), ['vendor/gemini-test']);
                assert.deepEqual(requests, [expected]);
                assert.deepEqual(config, before);
            });
        }
    }
});

test('Google direct and hosted Bearer discovery accept both list formats without truncating IDs', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const provider of ['google', 'sillytavern-google']) {
        for (const [format, payload, expected] of [
            ['openai', { data: [{ id: 'vendor/gemini-test' }, { id: 'models/vendor/gemini-test' }] }, ['vendor/gemini-test', 'models/vendor/gemini-test']],
            ['google', { models: [{ name: 'models/gemini-test' }, { name: 'models/vendor/gemini-test' }, { id: 'vendor/opaque-id', name: 'models/ignored' }] }, ['gemini-test', 'vendor/gemini-test', 'vendor/opaque-id']],
        ]) {
            await t.test(`${provider}/${format}`, async t => {
                t.mock.method(globalThis, 'fetch', async () => Response.json(payload));
                assert.deepEqual(await pullModelsForProvider({ provider, baseUrl: 'https://relay.test/v1beta', apiKey: 'fixture', modelListAuth: 'bearer' }), expected);
            });
        }
    }
});

test('Google native discovery keeps its native endpoint, authentication and resource names', async t => {
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        requests.push({ url, headers: new Headers(options.headers) });
        return Response.json({ models: [{ name: 'models/vendor/gemini-test' }] });
    });
    assert.deepEqual(await pullModelsForProvider({ provider: 'google', baseUrl: 'https://native.test', apiKey: 'fixture' }), ['vendor/gemini-test']);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'https://native.test/v1beta/models?key=fixture');
    assert.equal(requests[0].headers.get('authorization'), null);
    assert.equal(requests[0].headers.get('x-goog-api-key'), 'fixture');
});

test('hosted Google Bearer discovery stops on failures or cancellation without changing credentials', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const failure of [401, 403, 500, 'abort']) {
        await t.test(String(failure), async t => {
            const requests = [];
            const controller = new AbortController();
            t.mock.method(globalThis, 'fetch', async (url, options) => {
                requests.push({ url, signal: options.signal, body: JSON.parse(options.body) });
                if (failure === 'abort') {
                    controller.abort();
                    throw controller.signal.reason;
                }
                return Response.json({ error: { message: 'denied' } }, { status: failure });
            });
            await assert.rejects(pullModelsForProvider({ provider: 'sillytavern-google', baseUrl: 'https://relay.test', apiKey: 'fixture', modelListAuth: 'bearer' }, { signal: controller.signal }));
            assert.equal(requests.length, 1);
            assert.equal(requests[0].body.reverse_proxy, 'https://relay.test/v1');
            assert.equal(requests[0].body.proxy_password, 'fixture');
            assert.equal(requests[0].body.chat_completion_source, 'openai');
            assert.equal(requests[0].signal, controller.signal);
        });
    }
});

test('Google model-list auth survives Agent settings and resolved provider config', () => {
    for (const provider of ['google', 'sillytavern-google']) {
        for (const modelListAuth of [undefined, 'x-goog-api-key', 'bearer']) {
            const modelConfigs = normalizeModelConfigs({ [provider]: { modelListAuth } });
            const config = resolveActiveProviderConfig({ provider, modelConfigs });
            assert.equal(config.modelListAuth, modelListAuth === 'bearer' ? 'bearer' : 'x-goog-api-key');
        }
    }
});

test('Google direct model discovery sends only the selected auth and stops on rejection', async t => {
    for (const modelListAuth of [undefined, 'x-goog-api-key', 'bearer']) {
        for (const apiKey of ['', ' private+/key ']) {
            for (const status of [200, 401, 403]) {
                await t.test(`${modelListAuth}/${Boolean(apiKey)}/${status}`, async t => {
                    const requests = [];
                    const controller = new AbortController();
                    t.mock.method(globalThis, 'fetch', async (url, options) => {
                        requests.push({ url: new URL(url), headers: new Headers(options.headers), signal: options.signal });
                        return Response.json(status === 200 ? { data: [{ id: 'gemini-test' }] } : { error: { message: 'denied' } }, { status });
                    });
                    const config = { provider: 'google', baseUrl: 'https://relay.test/v1', apiKey, modelListAuth };
                    if (status === 200) assert.deepEqual(await pullModelsForProvider(config, { signal: controller.signal }), ['gemini-test']);
                    else await assert.rejects(pullModelsForProvider(config), error => error.status === status && !error.message.includes('private'));
                    assert.equal(requests.length, 1);
                    const request = requests[0];
                    const key = apiKey.trim();
                    const bearer = modelListAuth === 'bearer';
                    assert.equal(request.url.pathname, '/v1/models');
                    assert.equal(request.url.searchParams.get('key'), !bearer && key ? key : null);
                    assert.equal(request.headers.get('authorization'), bearer && key ? `Bearer ${key}` : null);
                    assert.equal(request.headers.get('x-goog-api-key'), bearer ? null : key);
                    assert.equal(request.headers.get('x-api-key'), null);
                    if (status === 200) assert.equal(request.signal, controller.signal);
                });
            }
        }
    }
});

test('hosted Google uses selected model-list channel but keeps Google generation', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({ 'X-CSRF-Token': 'fixture' }));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const modelListAuth of ['x-goog-api-key', 'bearer']) {
        await t.test(modelListAuth, async t => {
            const requests = [];
            t.mock.method(globalThis, 'fetch', async (url, options) => {
                requests.push({ url, body: JSON.parse(options.body) });
                return url.endsWith('/status') ? Response.json({ data: [{ id: 'gemini-test' }] })
                    : new Response(`data: ${JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'OK' }] }, finishReason: 'STOP' }] })}\n\n`, {
                        headers: { 'Content-Type': 'text/event-stream' },
                    });
            });
            const config = { provider: 'sillytavern-google', baseUrl: 'https://relay.test/v1', apiKey: 'fixture-key', modelListAuth, model: 'gemini-test' };
            const before = structuredClone(config);
            assert.deepEqual(await pullModelsForProvider(config), ['gemini-test']);
            assert.equal(requests[0].url, '/api/backends/chat-completions/status');
            assert.equal(requests[0].body.chat_completion_source, modelListAuth === 'bearer' ? 'openai' : 'makersuite');
            assert.equal(requests[0].body.reverse_proxy, modelListAuth === 'bearer' ? config.baseUrl : 'https://relay.test');
            assert.equal(requests[0].body.proxy_password, config.apiKey);
            assert.equal((await createAgentAdapter(config).chat({ messages: [{ role: 'user', content: 'fixture' }] })).text, 'OK');
            assert.equal(requests.at(-1).body.chat_completion_source, 'makersuite');
            assert.deepEqual(config, before);
        });
    }
});

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
