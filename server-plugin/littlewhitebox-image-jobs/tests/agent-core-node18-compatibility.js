'use strict';

const assert = require('node:assert/strict');
const { copyFile, mkdtemp, rm } = require('node:fs/promises');
const http = require('node:http');
const { tmpdir } = require('node:os');
const path = require('node:path');

const bundlePath = path.resolve(__dirname, '../draw-runs/vendor/agent-core-node.cjs');

function listen(server) {
    return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            server.off('error', reject);
            resolve();
        });
    });
}

function close(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
}

async function readRequestBody(request) {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}

async function main() {
    assert.equal(
        Number(process.versions.node.split('.')[0]),
        18,
        `Node 18 compatibility check ran on ${process.versions.node}`,
    );

    const requests = [];
    let requestError = null;
    const server = http.createServer(async (request, response) => {
        try {
            requests.push({
                method: request.method,
                url: request.url,
                apiKey: request.headers['x-goog-api-key'],
                body: JSON.parse(await readRequestBody(request)),
            });
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{ text: 'node18-ok' }],
                    },
                }],
                modelVersion: 'gemini-node18-test',
            }));
        } catch (error) {
            requestError = error;
            response.writeHead(500).end();
        }
    });
    const tempDirectory = await mkdtemp(path.join(tmpdir(), 'lwb-agent-core-node18-'));
    try {
        await listen(server);
        const address = server.address();
        assert.ok(address && typeof address === 'object');
        const isolatedBundlePath = path.join(tempDirectory, 'agent-core-node.cjs');
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
        const adapters = new Map(providers.map((provider) => {
            const hosted = provider.startsWith('sillytavern-');
            const adapter = agentCore.createAgentAdapter(
                {
                    provider,
                    model: provider === 'google' ? 'gemini-node18-test' : 'test-model',
                    ...(hosted ? {} : { apiKey: 'test-key' }),
                    ...(provider === 'google'
                        ? { baseUrl: `http://127.0.0.1:${address.port}` }
                        : {}),
                },
                hosted ? { hostClient } : {},
            );
            assert.equal(typeof adapter.chat, 'function', provider);
            return [provider, adapter];
        }));

        const result = await adapters.get('google').chat({
            messages: [{ role: 'user', content: 'node18 compatibility probe' }],
        });
        assert.ifError(requestError);
        assert.equal(result.text, 'node18-ok');
        assert.equal(requests.length, 1);
        assert.equal(requests[0].method, 'POST');
        assert.match(requests[0].url, /^\/v1beta\/models\/gemini-node18-test:generateContent/);
        assert.equal(requests[0].apiKey, 'test-key');
        assert.equal(requests[0].body.contents.at(-1).parts[0].text, 'node18 compatibility probe');
    } finally {
        if (server.listening) await close(server);
        await rm(tempDirectory, { recursive: true, force: true });
    }

    console.log(`Agent Core Node bundle passed on Node.js ${process.versions.node}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
