import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createPreset } from '../model.js';
import { generateText, listTextModels, testTextConnection, resolveConnection, connectionError } from '../runtime.js';
import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { createHostChatCompletionsClient, setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';

const messages = [{ role: 'system', content: 'fixture' }, { role: 'user', content: 'input {nested}; text' }];
const event = data => `${data.type ? `event: ${data.type}\n` : ''}data: ${JSON.stringify(data)}\n\n`;
function responseFor(provider, stream) {
    const anthropic = { id: 'm', type: 'message', role: 'assistant', model: 'fixture', content: [{ type: 'text', text: 'OK' }],
        stop_reason: 'end_turn', stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } };
    const google = { candidates: [{ content: { role: 'model', parts: [{ text: 'OK' }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1, candidatesTokenCount: 1 } };
    const item = { type: 'message', id: 'm', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'OK', annotations: [] }] };
    const responses = { id: 'r', object: 'response', model: 'fixture', status: 'completed', output: [item] };
    const openai = { id: 'c', model: 'fixture', choices: [{ index: 0, message: { role: 'assistant', content: 'OK' }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1 } };
    if (!stream) return JSON.stringify({ anthropic, google, 'openai-responses': responses, 'openai-compatible': openai }[provider]);
    if (provider === 'google') return event(google);
    if (provider === 'anthropic') return [
        { type: 'message_start', message: { ...anthropic, content: [], stop_reason: null } },
        { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } },
        { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'OK' } },
        { type: 'content_block_stop', index: 0 },
        { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 1 } },
        { type: 'message_stop' },
    ].map(event).join('');
    if (provider === 'openai-responses') return [
        { type: 'response.created', response: { ...responses, output: [], status: 'in_progress' } },
        { type: 'response.output_item.added', output_index: 0, item },
        { type: 'response.output_text.delta', output_index: 0, content_index: 0, delta: 'OK' },
        { type: 'response.output_item.done', output_index: 0, item },
        { type: 'response.completed', response: responses },
    ].map(event).join('');
    return event({ choices: [{ index: 0, delta: { role: 'assistant', content: 'OK' }, finish_reason: null }] })
        + event({ choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] }) + 'data: [DONE]\n\n';
}

async function service(t, provider, { status = 200, hang = false } = {}) {
    const requests = [];
    const server = createServer((req, res) => {
        const respond = async () => {
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const body = raw ? JSON.parse(raw) : null;
            requests.push({ url: req.url, headers: req.headers, body });
            if (hang) return;
            if (status !== 200) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: { message: 'denied' } })); return; }
            if (req.method === 'GET') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ data: [{ id: 'fixture' }], models: [{ name: 'models/fixture' }] })); return; }
            const stream = !!body.stream || req.url.includes('streamGenerateContent');
            res.setHeader('Content-Type', stream ? 'text/event-stream' : 'application/json');
            res.end(responseFor(provider, stream));
        };
        respond().catch(error => res.destroy(error));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
    return { url: `http://127.0.0.1:${server.address().port}`, requests };
}

test('real SDK requests use the selected protocol, one resolved version prefix and only explicit parameters', async t => {
    for (const provider of ['openai-compatible', 'openai-responses', 'anthropic', 'google']) {
        for (const apiKey of ['', 'fixture-key']) {
            for (const stream of [false, true]) {
                await t.test(`${provider}/${apiKey ? 'key' : 'no-key'}/${stream}`, async t => {
                    const wire = await service(t, provider);
                    const preset = createPreset('p', 'P', { provider, baseUrl: `${wire.url}/custom/v3`, apiKey, model: 'fixture', stream });
                    assert.deepEqual(await listTextModels(preset), ['fixture']);
                    const deltas = [];
                    assert.equal((await generateText(preset, { messages, onDelta: (delta, full) => deltas.push([delta, full]) })).text, 'OK');
                    assert.equal(wire.requests.length, 2);
                    for (const request of wire.requests) {
                        assert.equal(new URL(request.url, wire.url).pathname.startsWith('/custom/v3/'), true, request.url);
                        assert.equal(request.url.includes('/v3/v1'), false, request.url);
                        assert.equal(request.headers.authorization, provider.startsWith('openai-') && apiKey ? `Bearer ${apiKey}` : undefined);
                        assert.equal(request.headers['x-api-key'], provider === 'anthropic' && apiKey ? apiKey : undefined);
                        if (provider === 'google') assert.equal(request.headers['x-goog-api-key'], apiKey);
                    }
                    const body = wire.requests[1].body;
                    const parameters = provider === 'google' ? body.generationConfig || {} : body;
                    for (const key of ['temperature', 'max_tokens', 'max_output_tokens', 'maxOutputTokens', 'top_p', 'topP']) assert.equal(parameters[key], undefined);
                    assert.equal(body.tools, undefined);
                    assert.equal(deltas.at(-1)?.[1], 'OK');
                    assert.deepEqual(preset.sampling, {});
                });
            }
        }
    }
});

// Credential/protocol contract: Text API's saved listing preference must affect
// only discovery; generation must retain Google's authentication and protocol.
test('Google Text API uses Bearer for discovery without changing generation auth', async t => {
    for (const [base, listPrefix, generatePrefix] of [
        ['', '/v1', '/v1beta'], ['/v1', '/v1', '/v1'], ['/v1beta', '/v1beta', '/v1beta'],
    ]) {
        await t.test(base || 'bare', async t => {
            const wire = await service(t, 'google');
            const preset = createPreset('p', 'P', { provider: 'google', baseUrl: wire.url + base,
                apiKey: 'fixture-key', model: 'fixture', stream: false, modelListAuth: 'bearer' });
            assert.deepEqual(await listTextModels(preset), ['fixture']);
            assert.equal(wire.requests[0].url, listPrefix + '/models');
            assert.equal(wire.requests[0].headers.authorization, 'Bearer fixture-key');
            assert.equal(wire.requests[0].headers['x-goog-api-key'], undefined);
            assert.equal((await generateText(preset, { messages })).text, 'OK');
            assert.equal(wire.requests.length, 2);
            assert.equal(new URL(wire.requests[1].url, wire.url).pathname, generatePrefix + '/models/fixture:generateContent');
            assert.equal(wire.requests[1].headers.authorization, undefined);
            assert.equal(wire.requests[1].headers['x-goog-api-key'], 'fixture-key');
        });
    }
});

test('Text API resolves discovery independently from generation and honors explicit prefixes', async t => {
    setHostChatCompletionsRequestHeadersProvider(() => ({}));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const provider of ['google', 'sillytavern-google']) {
        for (const [base, prefixMode, customPrefix, listPrefix, generatePrefix] of [
            ['', 'auto', '', '/v1', '/v1beta'],
            ['/v1', 'auto', '', '/v1', '/v1'],
            ['/v1beta', 'auto', '', '/v1beta', '/v1beta'],
            ['/v3', 'auto', '', '/v3', '/v3'],
            ['/gateway', 'custom', '/api', '/gateway/api', '/gateway/api'],
            ['/gateway', 'custom', '', '/gateway', '/gateway'],
        ]) {
            await t.test(`${provider}/${base}/${prefixMode}/${customPrefix}`, async t => {
                const requests = [];
                t.mock.method(globalThis, 'fetch', async (url, options) => {
                    const body = options?.body ? JSON.parse(options.body) : null;
                    requests.push(body ? `${body.reverse_proxy}/models` : String(url));
                    return Response.json({ models: [{ name: 'models/vendor/gemini-test' }] });
                });
                const preset = createPreset('p', 'P', { provider, baseUrl: 'https://relay.test' + base,
                    prefixMode, customPrefix, apiKey: 'fixture', modelListAuth: 'bearer' });
                const before = structuredClone(preset);
                assert.deepEqual(await listTextModels(preset), ['vendor/gemini-test']);
                assert.deepEqual(requests, ['https://relay.test' + listPrefix + '/models']);
                assert.equal(resolveConnection(preset).baseUrl, 'https://relay.test' + generatePrefix);
                assert.deepEqual(preset, before);
            });
        }
    }
});

test('bare, explicit and custom prefixes are resolved once; explicit zero temperature is sent', async t => {
    const wire = await service(t, 'openai-compatible');
    for (const [base, prefixMode, customPrefix, expected] of [
        ['', 'auto', '', '/v1'], ['/v1', 'auto', '', '/v1'], ['/v3', 'auto', '', '/v3'],
        ['/v1beta', 'auto', '', '/v1beta'], ['/gateway', 'custom', '/api', '/gateway/api'], ['/gateway/api', 'custom', '/api', '/gateway/api'],
    ]) {
        const preset = createPreset('p', 'P', { provider: 'openai-compatible', baseUrl: wire.url + base, prefixMode, customPrefix, model: 'fixture', stream: false,
            temperature: 0, maxTokens: 32, sampling: { topP: { enabled: true, value: 0.7 } } });
        assert.equal(resolveConnection(preset).baseUrl, wire.url + expected);
        await generateText(preset, { messages });
        const request = wire.requests.at(-1);
        assert.equal(request.url, expected + '/chat/completions');
        assert.equal(request.body.temperature, 0); assert.equal(request.body.max_tokens, 32); assert.equal(request.body.top_p, 0.7);
    }
});

test('tests generate exactly once, authentication errors do not retry or switch identity', async t => {
    const wire = await service(t, 'openai-compatible');
    const preset = createPreset('p', 'P', { provider: 'openai-compatible', baseUrl: wire.url, model: 'fixture', stream: false });
    assert.deepEqual(await testTextConnection(preset), { ok: true });
    assert.equal(wire.requests.length, 1); assert.ok(wire.requests[0].body.messages);
    const denied = await service(t, 'openai-compatible', { status: 401 });
    await assert.rejects(testTextConnection({ ...preset, baseUrl: denied.url }));
    assert.equal(denied.requests.length, 1);
    assert.equal(denied.requests[0].headers.authorization, undefined);
});

test('abort and deadline stop an in-flight request without retries', async t => {
    for (const kind of ['abort', 'deadline']) {
        const wire = await service(t, 'openai-compatible', { hang: true });
        const preset = createPreset('p', 'P', { provider: 'openai-compatible', baseUrl: wire.url, model: 'fixture', stream: true });
        const controller = new AbortController();
        const timer = kind === 'abort' ? setTimeout(() => controller.abort(), 100) : null;
        await assert.rejects(generateText(preset, { messages, signal: controller.signal, timeoutMs: kind === 'deadline' ? 100 : 2000 }));
        clearTimeout(timer);
        assert.ok(wire.requests.length <= 1);
    }
});

test('requests retain their starting snapshot while presets change', async () => {
    const preset = createPreset('p', 'P', { provider: 'openai-compatible', baseUrl: 'https://fixture.test', model: 'first', stream: false });
    let captured, release;
    const waiting = new Promise(resolve => { release = resolve; });
    const task = generateText(preset, { messages }, { createAdapter: config => ({ async chat() { captured = config; await waiting; return { text: 'OK' }; } }) });
    preset.model = 'second'; preset.apiKey = 'changed';
    release(); await task;
    assert.equal(captured.model, 'first'); assert.equal(captured.apiKey, '');
});

test('model listing respects cancellation and never uses host credentials for an empty independent address', async t => {
    const wire = await service(t, 'openai-compatible', { hang: true });
    const preset = createPreset('p', 'P', { provider: 'openai-compatible', baseUrl: wire.url, model: 'fixture' });
    await assert.rejects(listTextModels(preset, { timeoutMs: 50 }));
    await assert.rejects(listTextModels({ ...preset, baseUrl: '' }));
    assert.ok(wire.requests.length <= 1);
});

test('connection failures redact both raw and URL-encoded preset credentials without retaining the SDK cause', () => {
    const apiKey = 'private+/key';
    const original = new Error(`denied ${apiKey} ${encodeURIComponent(apiKey)}`);
    original.cause = { key: apiKey };
    const safe = connectionError(original, { apiKey });
    assert.equal(safe.message.includes(apiKey), false);
    assert.equal(safe.message.includes(encodeURIComponent(apiKey)), false);
    assert.equal(safe.cause, undefined);
});

test('SillyTavern routes retain source and explicit empty credentials without borrowing host identity', async t => {
    for (const [provider, source, native] of [['sillytavern-openai-compatible', 'openai', 'openai-compatible'], ['sillytavern-claude', 'claude', 'anthropic'], ['sillytavern-google', 'makersuite', 'google']]) {
        const wire = await service(t, native);
        const hostClient = createHostChatCompletionsClient({ requestHeadersProvider: () => ({ 'X-CSRF-Token': 'fixture' }), fetch: (url, options) => fetch(wire.url + url, options) });
        const preset = createPreset('p', 'P', { provider, baseUrl: 'https://selected.test', apiKey: '', model: 'fixture', stream: false });
        assert.equal((await generateText(preset, { messages }, { createAdapter: config => createAgentAdapter(config, { hostClient }) })).text, 'OK');
        const payload = wire.requests[0].body;
        assert.equal(payload.chat_completion_source, source);
        assert.ok(payload.reverse_proxy.startsWith('https://selected.test'));
        assert.equal(payload.proxy_password, undefined);
        assert.equal(payload.temperature, undefined); assert.equal(payload.max_tokens, undefined);
    }
});
