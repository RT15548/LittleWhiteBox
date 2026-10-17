import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeModelConfigs, parseCustomParameters } from '../config.js';
import { resolveActiveProviderConfig } from '../provider-resolution.js';
import { OpenAICompatibleAdapter } from '../adapters/openai-compatible.js';
import { SillyTavernOpenAICompatibleAdapter } from '../adapters/sillytavern-openai-compatible.js';
import { OpenAIResponsesAdapter } from '../adapters/openai-responses.js';
import { AnthropicAdapter } from '../adapters/anthropic.js';
import { GoogleAdapter } from '../adapters/google.js';
import { SillyTavernClaudeAdapter } from '../adapters/sillytavern-claude.js';
import { SillyTavernGoogleAdapter } from '../adapters/sillytavern-google.js';

test('parseCustomParameters parses valid JSON objects and ignores invalid or non-object values', () => {
    assert.deepEqual(parseCustomParameters(''), {});
    assert.deepEqual(parseCustomParameters(null), {});
    assert.deepEqual(parseCustomParameters(undefined), {});
    assert.deepEqual(parseCustomParameters('  '), {});
    assert.deepEqual(parseCustomParameters('invalid json'), {});
    assert.deepEqual(parseCustomParameters('[1, 2, 3]'), {});
    assert.deepEqual(parseCustomParameters('"string"'), {});
    assert.deepEqual(parseCustomParameters(123), {});
    assert.deepEqual(parseCustomParameters({ top_p: 0.9 }), { top_p: 0.9 });
    assert.deepEqual(
        parseCustomParameters('{"top_p": 0.8, "frequency_penalty": 0.5, "custom_field": "test"}'),
        { top_p: 0.8, frequency_penalty: 0.5, custom_field: 'test' },
    );
});

test('normalizeModelConfigs preserves customParameters as string', () => {
    const raw = {
        'openai-compatible': {
            baseUrl: 'https://example.com/v1',
            customParameters: '{"top_p": 0.7}',
        },
        google: {
            customParameters: { topK: 40 },
        },
    };
    const normalized = normalizeModelConfigs(raw);
    assert.equal(normalized['openai-compatible'].customParameters, '{"top_p": 0.7}');
    assert.equal(JSON.parse(normalized.google.customParameters).topK, 40);
    assert.equal(normalized.anthropic.customParameters, '');
});

test('resolveActiveProviderConfig exposes customParameters for main and delegate', () => {
    const config = {
        provider: 'openai-compatible',
        modelConfigs: {
            'openai-compatible': {
                baseUrl: 'https://api.example.com',
                model: 'gpt-4o',
                customParameters: '{"presence_penalty": 0.2}',
            },
        },
        delegateConfig: {
            provider: 'anthropic',
            modelConfigs: {
                anthropic: {
                    model: 'claude-3-5-sonnet',
                    customParameters: '{"top_k": 50}',
                },
            },
        },
    };

    const mainResolved = resolveActiveProviderConfig(config);
    assert.equal(mainResolved.customParameters, '{"presence_penalty": 0.2}');

    const delegateResolved = resolveActiveProviderConfig(config, { role: 'delegate' });
    assert.equal(delegateResolved.customParameters, '{"top_k": 50}');
});

test('OpenAICompatibleAdapter merges customParameters into request body', () => {
    const adapter = new OpenAICompatibleAdapter({
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        customParameters: JSON.stringify({ top_p: 0.85, frequency_penalty: 0.4 }),
    });
    const body = adapter.buildRequestBody({
        messages: [{ role: 'user', content: 'hello' }],
    });
    assert.equal(body.model, 'gpt-4o');
    assert.equal(body.top_p, 0.85);
    assert.equal(body.frequency_penalty, 0.4);
});

test('SillyTavernOpenAICompatibleAdapter merges customParameters into payload', () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        model: 'gpt-4o-mini',
        customParameters: JSON.stringify({ logit_bias: { 50256: -100 } }),
    });
    const payload = adapter.buildPayload({
        messages: [{ role: 'user', content: 'test' }],
    });
    assert.deepEqual(payload.logit_bias, { 50256: -100 });
});

test('OpenAIResponsesAdapter merges customParameters into request body', () => {
    const adapter = new OpenAIResponsesAdapter({
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o',
        customParameters: JSON.stringify({ user: 'user_123' }),
    });
    const body = adapter.buildRequestBody({
        messages: [{ role: 'user', content: 'hi' }],
    });
    assert.equal(body.user, 'user_123');
});

test('AnthropicAdapter merges customParameters into request body', () => {
    const adapter = new AnthropicAdapter({
        baseUrl: 'https://api.anthropic.com',
        model: 'claude-opus-4-6',
        customParameters: JSON.stringify({ top_k: 20 }),
    });
    const body = adapter.buildRequestBody({
        messages: [{ role: 'user', content: 'claude test' }],
    });
    assert.equal(body.model, 'claude-opus-4-6');
    assert.equal(body.top_k, 20);
});

test('GoogleAdapter merges customParameters into chat payload', () => {
    const adapter = new GoogleAdapter({
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-1.5-pro',
        customParameters: JSON.stringify({ safetySettings: [{ category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' }] }),
    });
    const payload = adapter.buildChatPayload({
        messages: [{ role: 'user', content: 'gemini test' }],
    });
    assert.deepEqual(payload.createPayload.config.safetySettings, [{ category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' }]);
});

test('SillyTavernClaudeAdapter merges customParameters into payload', () => {
    const adapter = new SillyTavernClaudeAdapter({
        model: 'claude-3-5-sonnet',
        customParameters: JSON.stringify({ custom_header_param: 'val' }),
    });
    const payload = adapter.buildPayload({
        messages: [{ role: 'user', content: 'st claude test' }],
    });
    assert.equal(payload.custom_header_param, 'val');
});

test('SillyTavernGoogleAdapter merges customParameters into payload', () => {
    const adapter = new SillyTavernGoogleAdapter({
        model: 'gemini-2.5-flash',
        customParameters: JSON.stringify({ stopSequences: ['END'] }),
    });
    const payload = adapter.buildPayload({
        messages: [{ role: 'user', content: 'st google test' }],
    });
    assert.deepEqual(payload.stopSequences, ['END']);
});
