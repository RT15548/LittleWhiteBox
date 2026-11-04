'use strict';

const assert = require('node:assert/strict');
const { copyFile, mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');

const bundlePath = require('./runtime-fixture.js').bundlePath;

test('standalone Node bundle creates all seven Agent adapters without installed packages', async () => {
    const tempDirectory = await mkdtemp(path.join(tmpdir(), 'lwb-agent-core-node-'));
    const isolatedBundlePath = path.join(tempDirectory, 'agent-core-node.cjs');
    try {
        await copyFile(bundlePath, isolatedBundlePath);
        const agentCore = require(isolatedBundlePath).agentCore;
        const hostClient = agentCore.createHostChatCompletionsClient({
            requestHeadersProvider: () => ({ Cookie: 'session=test' }),
            fetch: async () => {
                throw new Error('Adapter construction must not send requests');
            },
        });
        const providers = [
            'openai-compatible',
            'openai-responses',
            'anthropic',
            'google',
            'sillytavern-openai-compatible',
            'sillytavern-claude',
            'sillytavern-google',
        ];

        for (const provider of providers) {
            const hosted = provider.startsWith('sillytavern-');
            const adapter = agentCore.createAgentAdapter(
                {
                    provider,
                    model: 'test-model',
                    ...(hosted ? {} : { apiKey: 'test-key' }),
                },
                hosted ? { hostClient } : {},
            );
            assert.equal(typeof adapter.chat, 'function', provider);
        }
    } finally {
        await rm(tempDirectory, { recursive: true, force: true });
    }
});

test('Node entry rejects every hosted adapter without a request-scoped Host Client', () => {
    const agentCore = require(bundlePath).agentCore;
    for (const provider of [
        'sillytavern-openai-compatible',
        'sillytavern-claude',
        'sillytavern-google',
    ]) {
        assert.throws(
            () => agentCore.createAgentAdapter({ provider, model: 'test-model' }),
        );
    }
});

test('hosted adapters translate the run-scoped preset key to proxy_password', () => {
    const agentCore = require(bundlePath).agentCore;
    const hostClient = agentCore.createHostChatCompletionsClient({
        requestHeadersProvider: () => ({ Cookie: 'session=test' }),
        fetch: async () => {
            throw new Error('Payload construction must not send requests');
        },
    });
    for (const provider of [
        'sillytavern-openai-compatible',
        'sillytavern-claude',
        'sillytavern-google',
    ]) {
        const adapter = agentCore.createAgentAdapter({
            provider,
            model: 'test-model',
            apiKey: `${provider}-proxy-password`,
            reasoning: { mode: 'off', output: 'hide' },
        }, { hostClient });
        const payload = adapter.buildPayload({
            messages: [{ role: 'user', content: 'test' }],
            maxTokens: 100,
            temperature: 0,
        });
        assert.equal(payload.proxy_password, `${provider}-proxy-password`, provider);
    }
});
