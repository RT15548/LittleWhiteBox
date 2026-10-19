import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { createServer } from 'node:http';
import { normalizeAgentConfig, normalizeModelConfigs } from '../config.js';
import { resolveActiveProviderConfig } from '../provider-resolution.js';
import { createAgentAdapter } from '../provider-config.js';
import { buildSamplingParameters } from '../sampling.js';

// Acceptance contracts (cost: wrong protocol, changed generation, lost settings):
// - Disabled parameters retain their values but are absent from requests.
// - Each route transmits only its supported sampling fields, never arbitrary overrides.
// - Main/delegate and named presets retain independent sampling settings on persistence.
const sampling = {
    topP: { enabled: true, value: 0.83 }, topK: { enabled: true, value: 37 },
    frequencyPenalty: { enabled: true, value: 0.2 }, presencePenalty: { enabled: true, value: -0.3 },
    repetitionPenalty: { enabled: true, value: 1.1 },
    model: { enabled: true, value: 'unexpected' }, stream: { enabled: true, value: false },
};
const expected = {
    'openai-compatible': { top_p: 0.83, top_k: 37, frequency_penalty: 0.2, presence_penalty: -0.3, repetition_penalty: 1.1 },
    'openai-responses': { top_p: 0.83 },
    anthropic: { top_p: 0.83, top_k: 37 },
    google: { topP: 0.83, topK: 37, frequencyPenalty: 0.2, presencePenalty: -0.3 },
    'sillytavern-openai-compatible': { top_p: 0.83, top_k: 37, frequency_penalty: 0.2, presence_penalty: -0.3 },
    'sillytavern-claude': { top_p: 0.83, top_k: 37 },
    'sillytavern-google': { top_p: 0.83, top_k: 37 },
};
const claudeCases = [
    ...[0, 0.9, 0.9499, 1.01].map(topP => ({ model: 'claude-opus-4-6', mode: 'on', topP, fields: {} })),
    { model: 'claude-opus-4-6', mode: 'on', topP: 0.95, fields: { top_p: 0.95 } },
    { model: 'claude-sonnet-4-6', mode: 'on', topP: 1, fields: { top_p: 1 } },
    ...['off', 'inherit'].map(mode => ({ model: 'claude-opus-4-6', mode, topP: 0.9, fields: { top_p: 0.9, top_k: 40 } })),
    { model: 'claude-3-5-sonnet-20241022', mode: 'inherit', topP: 0.9, fields: { top_p: 0.9, top_k: 40 } },
    ...['on', 'off', 'inherit'].map(mode => ({ model: 'claude-opus-4-7', mode, topP: 1, fields: {} })),
    // Documented fixed-sampling models, including default-thinking requests.
    ...['claude-opus-4-8', 'claude-opus-5', 'claude-opus-5-5', 'claude-sonnet-5', 'claude-sonnet-5-5',
        'claude-haiku-5-5', 'claude-fable-5', 'claude-fable-5-1', 'claude-mythos-5', 'claude-mythos-5-1',
        'claude-mythos-preview', 'anthropic/claude-opus-4.8', 'claude-opus-4-7-20260416']
        .map(model => ({ model, mode: 'inherit', topP: 0.9, fields: {} })),
    // No speculative fixed-sampling rules for unknown models or versions.
    ...['fixture', 'claude-opus-4-70', 'claude-opus-5-6', 'claude-opus-6']
        .map(model => ({ model, mode: 'inherit', topP: 0.9, fields: { top_p: 0.9, top_k: 40 } })),
    ...['deepseek-chat', 'kimi-k3', 'custom-alias']
        .map(model => ({ model, mode: 'on', topP: 0.9, fields: { top_p: 0.9, top_k: 40 } })),
];

// Real outgoing SDK / host payloads, not just the sampling helper: effective
// thinking controls the wire projection but never edits the saved preferences.
for (const provider of ['anthropic', 'sillytavern-claude']) {
    test(`${provider} applies model/thinking sampling restrictions without changing presets`, async t => {
        t.mock.method(console, 'info', () => {});
        for (const { model, mode, topP, fields } of claudeCases) await t.test(`${model}/${mode}/${topP}`, async () => {
            let body;
            const config = { provider, model, baseUrl: 'https://fixture.invalid', apiKey: 'offline-fixture',
                sampling: { topP: { enabled: true, value: topP }, topK: { enabled: true, value: 40 } } };
            const original = structuredClone(config);
            const hostClient = {
                buildHostChatCompletionGenerateRequest: async payload => ({ body: payload }),
                createHostChatCompletion: async payload => { body = payload; return response; },
                streamHostChatCompletion: async (payload, accept) => {
                    body = payload;
                    accept({ type: 'message_start', message: response });
                },
            };
            const adapter = createAgentAdapter(config, { hostClient });
            if (provider === 'anthropic') adapter.client = adapter.client.withOptions({ fetch: async (_url, init) => {
                body = JSON.parse(init.body);
                return Response.json(response);
            } });
            await adapter.chat({ messages, reasoning: { mode }, maxTokens: 1024, temperature: 0.2 });
            assert.equal(body.temperature, undefined);
            assert.equal(body.top_p, fields.top_p);
            assert.equal(body.top_k, fields.top_k);
            if (provider === 'anthropic' && mode === 'on') assert.equal(body.thinking.type, 'adaptive');
            assert.deepEqual(config, original);
        });
    });
}

const messages = [{ role: 'user', content: 'offline fixture' }];
const response = { id: 'fixture', object: 'response', status: 'completed', output: [],
    choices: [{ message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }],
    type: 'message', role: 'assistant', content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn',
    usage: { input_tokens: 1, output_tokens: 1 },
    candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] }, finishReason: 'STOP' }],
};

test('Claude model restrictions do not change other provider protocols', () => {
    for (const provider of Object.keys(expected).filter(value => !['anthropic', 'sillytavern-claude'].includes(value))) {
        assert.deepEqual(buildSamplingParameters(provider, sampling, {
            model: 'claude-opus-4-7', reasoning: { mode: 'on' },
        }), expected[provider]);
    }
});

test('disabled values survive normalization and all routes omit them', () => {
    const disabled = Object.fromEntries(Object.entries(sampling).map(([key, entry]) => [key, { ...entry, enabled: false }]));
    const config = normalizeModelConfigs({ google: { sampling: disabled } }).google;
    assert.deepEqual(config.sampling.topP, { enabled: false, value: 0.83 });
    for (const provider of Object.keys(expected)) assert.deepEqual(buildSamplingParameters(provider, config.sampling), {});
});

test('main, delegate and presets persist independent sampling', () => {
    const configs = value => ({ 'openai-compatible': { sampling: { topP: { enabled: true, value } } } });
    const raw = { currentPresetName: 'Main',
        delegateConfig: { provider: 'openai-compatible', modelConfigs: configs(0.61) },
        presets: { Main: { provider: 'openai-compatible', modelConfigs: configs(0.83) }, A: { provider: 'openai-compatible', modelConfigs: configs(0.42) } },
    };
    const config = normalizeAgentConfig(JSON.parse(JSON.stringify(raw)));
    assert.equal(resolveActiveProviderConfig(config).sampling.topP.value, 0.83);
    assert.equal(resolveActiveProviderConfig(config, { role: 'delegate' }).sampling.topP.value, 0.61);
    assert.equal(config.presets.A.modelConfigs['openai-compatible'].sampling.topP.value, 0.42);
    config.modelConfigs['openai-compatible'].sampling.topP.value = 0.7;
    assert.equal(config.delegateConfig.modelConfigs['openai-compatible'].sampling.topP.value, 0.61);
    assert.equal(config.presets.A.modelConfigs['openai-compatible'].sampling.topP.value, 0.42);
});

test('actual SDK and host-client requests use route-specific sampling', async t => {
    for (const [provider, fields] of Object.entries(expected)) await t.test(provider, async t => {
        let body;
        let baseUrl;
        const hostClient = {
            buildHostChatCompletionGenerateRequest: async payload => ({ body: payload }),
            createHostChatCompletion: async payload => { body = payload; return response; },
            streamHostChatCompletion: async (payload, accept) => {
                body = payload;
                accept(provider === 'sillytavern-claude' ? { type: 'message_start', message: response } : response);
            },
        };
        if (!provider.startsWith('sillytavern-')) {
            const server = createServer((req, res) => {
                const receive = async () => {
                    const chunks = [];
                    for await (const chunk of req) chunks.push(chunk);
                    body = JSON.parse(Buffer.concat(chunks).toString());
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(provider === 'openai-responses' ? { id: 'fixture', object: 'response', status: 'completed', output: [] } : response));
                };
                receive().catch(error => res.destroy(error));
            });
            await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
            t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
            baseUrl = `http://127.0.0.1:${server.address().port}`;
        }
        const adapter = createAgentAdapter({ provider, model: 'fixture', baseUrl, apiKey: 'offline-fixture', sampling }, { hostClient });
        await adapter.chat({ messages });
        const actual = provider === 'google' ? body.generationConfig : body;
        for (const [key, value] of Object.entries(fields)) assert.equal(actual[key], value, key);
        const allFields = new Set(Object.values(expected).flatMap(Object.keys));
        for (const key of allFields) if (!(key in fields)) assert.equal(actual[key], undefined, key);
        if (provider !== 'google') assert.equal(body.model, 'fixture');
        assert.deepEqual(buildSamplingParameters(provider, sampling), fields);
    });
});
