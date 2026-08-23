'use strict';

const assert = require('node:assert/strict');
const { execFile } = require('node:child_process');
const { copyFile, mkdtemp, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { promisify } = require('node:util');

const bundlePath = path.resolve(__dirname, '../draw-runs/vendor/agent-core-node.cjs');
const licensesPath = path.resolve(__dirname, '../draw-runs/vendor/THIRD_PARTY_LICENSES.txt');
const projectRoot = path.resolve(__dirname, '../../..');
const buildScriptPath = path.resolve(projectRoot, 'scripts/build-agent-core-node.mjs');
const execFileAsync = promisify(execFile);

test('committed Node bundle and licenses match the current source and dependency graph', async () => {
    await execFileAsync(process.execPath, [buildScriptPath, '--check'], { cwd: projectRoot });
});

test('every bundled package includes license text, including README fallbacks', async () => {
    const licenses = await readFile(licensesPath, 'utf8');
    assert.doesNotMatch(licenses, /License file: not included/);
    const dataUriSection = licenses
        .split('='.repeat(80))
        .find(section => section.includes('data-uri-to-buffer@4.0.1'));
    assert.ok(dataUriSection);
    assert.match(dataUriSection, /License file: README\.md#License/);
    assert.match(dataUriSection, /Permission is hereby granted, free of charge/);
    assert.match(dataUriSection, /THE SOFTWARE IS PROVIDED 'AS IS'/);
});

test('standalone Node bundle creates all seven Agent adapters without installed packages', async () => {
    const tempDirectory = await mkdtemp(path.join(tmpdir(), 'lwb-agent-core-node-'));
    const isolatedBundlePath = path.join(tempDirectory, 'agent-core-node.cjs');
    try {
        await copyFile(bundlePath, isolatedBundlePath);
        const agentCore = require(isolatedBundlePath);
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
    const agentCore = require(bundlePath);
    for (const provider of [
        'sillytavern-openai-compatible',
        'sillytavern-claude',
        'sillytavern-google',
    ]) {
        assert.throws(
            () => agentCore.createAgentAdapter({ provider, model: 'test-model' }),
            /必须注入当前 Draw Run 的 Host Client/,
        );
    }
});
