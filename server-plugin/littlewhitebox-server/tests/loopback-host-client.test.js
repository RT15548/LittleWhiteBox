'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const { test } = require('node:test');

const agentCore = require('../draw-runs/vendor/agent-core-node.cjs');
const {
    captureLoopbackRequestContext,
    createLoopbackFetch,
    createPerRunHostClient,
} = require('../draw-runs/loopback-host-client.js');

async function listen(server) {
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    return server.address().port;
}

function close(server) {
    return new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}

test('per-run Host Client targets the same SillyTavern socket with captured credentials', async (t) => {
    let observed;
    const server = http.createServer((request, response) => {
        let body = '';
        request.on('data', chunk => { body += chunk; });
        request.on('end', () => {
            observed = { url: request.url, headers: request.headers, body: JSON.parse(body) };
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }));
        });
    });
    const port = await listen(server);
    t.after(() => close(server));
    const session = createPerRunHostClient({
        headers: {
            host: 'tavern.example.test',
            cookie: 'session=alice-secret',
            'x-csrf-token': 'csrf-alice-secret',
            authorization: `Basic ${Buffer.from('alice:secret').toString('base64')}`,
        },
        socket: {
            encrypted: false,
            server: { address: () => ({ address: '127.0.0.1', family: 'IPv4', port }) },
        },
    }, agentCore);
    t.after(() => session.dispose());

    const result = await session.client.createHostChatCompletion({ model: 'test', messages: [] });
    assert.equal(result.choices[0].message.content, 'ok');
    assert.equal(observed.url, '/api/backends/chat-completions/generate');
    assert.equal(observed.headers.host, 'tavern.example.test');
    assert.equal(observed.headers.cookie, 'session=alice-secret');
    assert.equal(observed.headers['x-csrf-token'], 'csrf-alice-secret');
    assert.match(observed.headers.authorization, /^Basic /);
});

test('per-run Host Client cannot become a general loopback URL proxy', async (t) => {
    const server = http.createServer((_request, response) => response.end('{}'));
    const port = await listen(server);
    t.after(() => close(server));
    const request = {
        headers: {},
        socket: {
            encrypted: false,
            server: { address: () => ({ address: '127.0.0.1', family: 'IPv4', port }) },
        },
    };
    const transport = createLoopbackFetch(captureLoopbackRequestContext(request));
    t.after(() => transport.dispose());

    await assert.rejects(
        transport.fetch('/api/secrets', { method: 'GET' }),
        /拒绝访问非酒馆 Chat Completion 端点/,
    );
    await assert.rejects(
        transport.fetch('/api/backends/chat-completions/generate', { signal: AbortSignal.abort() }),
        error => error?.name === 'AbortError',
    );
});

test('Host Client construction failure clears captured request credentials', () => {
    let capturedHeadersProvider;
    const request = {
        headers: {
            cookie: 'session=private',
            'x-csrf-token': 'csrf-private',
        },
        socket: {
            encrypted: false,
            server: { address: () => ({ address: '127.0.0.1', family: 'IPv4', port: 8000 }) },
        },
    };

    assert.throws(() => createPerRunHostClient(request, {
        createHostChatCompletionsClient(options) {
            capturedHeadersProvider = options.requestHeadersProvider;
            assert.equal(capturedHeadersProvider().Cookie, 'session=private');
            throw new Error('factory failed');
        },
    }), /factory failed/);
    assert.deepEqual(capturedHeadersProvider(), {});
});
