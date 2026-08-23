'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const { EventEmitter } = require('node:events');
const { PassThrough } = require('node:stream');
const { after, before, test } = require('node:test');

const { init } = require('../index.js');
const {
    generateImage,
    generateImageBuffer,
    openImageStream,
    readImageStreamBuffer,
    testConnection,
} = require('../providers/novelai/client.js');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

let server;
let origin;
let upstreamRequests = 0;
let slowRequestHooks = null;
let crossOriginTarget = '';
let lastStreamRequest = null;

async function invokeRoute(handler, body) {
    const req = new EventEmitter();
    req.aborted = false;
    req.destroyed = false;
    req.body = body;
    const res = new EventEmitter();
    res.destroyed = false;
    res.writableEnded = false;
    res.status = status => {
        res.statusCode = status;
        return res;
    };
    res.send = responseBody => {
        res.writableEnded = true;
        res.body = responseBody;
        return res;
    };
    await handler(req, res);
    return res;
}

before(async () => {
    server = http.createServer((req, res) => {
        upstreamRequests++;
        if (req.url === '/v5/ai/generate-image-stream') {
            const chunks = [];
            req.on('data', chunk => chunks.push(Buffer.from(chunk)));
            req.on('end', () => {
                lastStreamRequest = {
                    authorization: req.headers.authorization || '',
                    contentType: req.headers['content-type'] || '',
                    body: Buffer.concat(chunks).toString('utf8'),
                };
                res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
                res.write(Buffer.from([0, 0, 0, 2]));
                res.end(Buffer.from([0x81, 0xA0]));
            });
            return;
        }
        if (req.url === '/huge-error/ai/generate-image-stream') {
            const body = Buffer.alloc(1024 * 1024 + 1, 0x78);
            res.writeHead(422, {
                'Content-Length': body.length,
                'Content-Type': 'text/plain',
            });
            res.end(body);
            return;
        }
        req.resume();
        if (req.url === '/redirect/ai/generate-image') {
            res.writeHead(307, { 'Location': '/image/ai/generate-image' });
            res.end();
            return;
        }
        if (req.url === '/cross-origin/ai/generate-image') {
            res.writeHead(307, { 'Location': crossOriginTarget });
            res.end();
            return;
        }
        if (req.url === '/redirect-loop/ai/generate-image') {
            res.writeHead(307, { 'Location': '/redirect-loop/ai/generate-image' });
            res.end();
            return;
        }
        if (req.url === '/slow/ai/generate-image') {
            slowRequestHooks?.started();
            res.once('close', () => slowRequestHooks?.closed());
            return;
        }
        if (req.url === '/gzip/ai/generate-image') {
            const compressed = zlib.gzipSync(PNG);
            res.writeHead(200, {
                'Content-Encoding': 'gzip',
                'Content-Length': compressed.length,
                'Content-Type': 'image/png',
            });
            res.end(compressed);
            return;
        }
        if (req.url === '/deflate/ai/generate-image') {
            const compressed = zlib.deflateSync(PNG);
            res.writeHead(200, {
                'Content-Encoding': 'deflate',
                'Content-Length': compressed.length,
                'Content-Type': 'image/png',
            });
            res.end(compressed);
            return;
        }
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(PNG);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise(resolve => server.close(resolve));
});

test('follows bounded same-origin redirects and preserves image MIME', async () => {
    const result = await generateImage({
        url: `${origin}/redirect/ai/generate-image`,
        key: 'key',
        payload: {},
        insecure: false,
    });

    assert.equal(result.ok, true);
    assert.equal(result.mime, 'image/png');
    assert.equal(result.base64, PNG.toString('base64'));
});

test('decodes gzip responses from non-compliant upstreams', async () => {
    const result = await generateImage({
        url: `${origin}/gzip/ai/generate-image`,
        key: 'key',
        payload: {},
        insecure: false,
    });

    assert.equal(result.ok, true);
    assert.equal(result.mime, 'image/png');
    assert.equal(result.base64, PNG.toString('base64'));
});

test('decodes deflate responses from non-compliant upstreams', async () => {
    const result = await generateImage({
        url: `${origin}/deflate/ai/generate-image`,
        key: 'key',
        payload: {},
        insecure: false,
    });

    assert.equal(result.ok, true);
    assert.equal(result.mime, 'image/png');
    assert.equal(result.base64, PNG.toString('base64'));
});

test('exposes decoded legacy images as buffers for background jobs', async () => {
    const result = await generateImageBuffer({
        url: `${origin}/image/ai/generate-image`,
        key: 'key',
        payload: {},
        insecure: false,
    });

    assert.equal(result.ok, true);
    assert.equal(result.mime, 'image/png');
    assert.deepEqual(result.buffer, PNG);
});

test('sends V5 as multipart request JSON and exposes the upstream stream unchanged', async () => {
    const payload = {
        input: '1girl, happy',
        model: 'nai-diffusion-5-full',
        parameters: { params_version: 4, stream: 'msgpack' },
    };
    const result = await openImageStream({
        url: `${origin}/v5/ai/generate-image-stream`,
        key: 'v5-key',
        payload,
        insecure: false,
    });
    assert.equal(result.ok, true);
    const chunks = [];
    for await (const chunk of result.response) chunks.push(Buffer.from(chunk));

    assert.equal(lastStreamRequest.authorization, 'Bearer v5-key');
    const boundary = /boundary=([^;]+)/i.exec(lastStreamRequest.contentType)?.[1];
    assert.ok(boundary);
    assert.match(lastStreamRequest.body, /name="request"; filename="blob"/);
    assert.match(lastStreamRequest.body, /Content-Type: application\/json/);
    assert.match(lastStreamRequest.body, new RegExp(`--${boundary.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}--`));
    assert.ok(lastStreamRequest.body.includes(JSON.stringify(payload)));
    assert.deepEqual(Buffer.concat(chunks), Buffer.from([0, 0, 0, 2, 0x81, 0xA0]));
});

test('reads the complete V5 stream for background jobs without interpreting MessagePack', async () => {
    const result = await readImageStreamBuffer({
        url: `${origin}/v5/ai/generate-image-stream`,
        key: 'v5-key',
        payload: { input: 'test', model: 'nai-diffusion-5-full' },
        insecure: false,
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.buffer, Buffer.from([0, 0, 0, 2, 0x81, 0xA0]));
});

test('tests the selected V5 transport instead of falling back to the V3 JSON endpoint', async () => {
    const payload = {
        input: 'test',
        model: 'nai-diffusion-5-curated',
        parameters: { params_version: 4, stream: 'msgpack' },
    };
    const result = await testConnection({
        url: `${origin}/v5/ai/generate-image-stream`,
        key: 'v5-test-key',
        insecure: false,
        payload,
        multipart: true,
    });

    assert.equal(result.ok, true);
    assert.equal(lastStreamRequest.authorization, 'Bearer v5-test-key');
    assert.match(lastStreamRequest.contentType, /^multipart\/form-data; boundary=/);
    assert.match(lastStreamRequest.body, /"model":"nai-diffusion-5-curated"/);
    assert.match(lastStreamRequest.body, /"params_version":4/);
});

test('bounds upstream V5 error bodies to 1 MiB', async () => {
    const result = await openImageStream({
        url: `${origin}/huge-error/ai/generate-image-stream`,
        key: 'v5-key',
        payload: { model: 'nai-diffusion-5-full' },
        insecure: false,
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 422);
    // 超限的错误体不得被原样带出：摘要必须短小，并说明是读取失败而不是真实的上游文案。
    assert.ok(result.error.length < 1024);
    assert.match(result.error, /1048576/);
});

test('advertises and proxies the V5 MessagePack stream route', async () => {
    let statusHandler;
    let streamHandler;
    await init({
        get(path, routeHandler) {
            if (path === '/status') statusHandler = routeHandler;
        },
        post(path, routeHandler) {
            if (path === '/v1/generate-image-stream') streamHandler = routeHandler;
        },
        delete() {},
    });

    const statusResponse = {
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
    };
    statusHandler({}, statusResponse);
    assert.equal(statusResponse.statusCode, 200);
    assert.deepEqual(statusResponse.body.capabilities, ['v5-msgpack-stream', 'image-batch-jobs-v1']);

    const req = new EventEmitter();
    req.aborted = false;
    req.destroyed = false;
    req.body = {
        url: `${origin}/v5/ai/generate-image-stream`,
        key: 'v5-key',
        payload: { input: 'test', model: 'nai-diffusion-5-full' },
        timeout: 1000,
    };
    const res = new PassThrough();
    const output = [];
    const headers = new Map();
    res.on('data', chunk => output.push(Buffer.from(chunk)));
    res.setHeader = (name, value) => headers.set(String(name).toLowerCase(), value);
    res.getHeader = name => headers.get(String(name).toLowerCase());
    res.status = code => {
        res.statusCode = code;
        return res;
    };
    res.type = value => {
        res.setHeader('Content-Type', value);
        return res;
    };
    res.send = body => {
        res.end(body);
        return res;
    };

    await streamHandler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.getHeader('Content-Type'), 'application/octet-stream');
    assert.deepEqual(Buffer.concat(output), Buffer.from([0, 0, 0, 2, 0x81, 0xA0]));
});

test('does not forward the API key across origins', async () => {
    let authorization = null;
    const target = http.createServer((req, res) => {
        authorization = req.headers.authorization || '';
        req.resume();
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(PNG);
    });
    await new Promise(resolve => target.listen(0, '127.0.0.1', resolve));
    crossOriginTarget = `http://127.0.0.1:${target.address().port}/ai/generate-image`;

    try {
        const result = await generateImage({
            url: `${origin}/cross-origin/ai/generate-image`,
            key: 'secret-key',
            payload: {},
            insecure: false,
        });
        assert.equal(result.ok, true);
        assert.equal(authorization, '');
    } finally {
        crossOriginTarget = '';
        await new Promise(resolve => target.close(resolve));
    }
});

test('rejects redirect loops after five hops', async () => {
    await assert.rejects(
        generateImage({
            url: `${origin}/redirect-loop/ai/generate-image`,
            key: 'key',
            payload: {},
            insecure: false,
        }),
        /exceeded 5 redirects/,
    );
});

test('does not start an upstream request after the client already disconnected', async () => {
    let handler;
    await init({
        get() {},
        post(path, routeHandler) {
            if (path === '/v1/generate-image') handler = routeHandler;
        },
        delete() {},
    });

    const req = new EventEmitter();
    req.aborted = true;
    req.destroyed = true;
    req.body = { url: origin, key: 'key', payload: {} };
    const res = new EventEmitter();
    res.destroyed = true;
    res.writableEnded = false;
    res.status = () => res;
    res.send = () => res;
    const beforeCount = upstreamRequests;

    await handler(req, res);

    assert.equal(upstreamRequests, beforeCount);
});

test('keeps the v1.0.1 validation order ahead of legacy URL resolution', async () => {
    let generateHandler;
    let testHandler;
    await init({
        get() {},
        post(path, routeHandler) {
            if (path === '/v1/generate-image') generateHandler = routeHandler;
            if (path === '/v1/test') testHandler = routeHandler;
        },
        delete() {},
    });

    const missingKey = await invokeRoute(generateHandler, {
        url: 'not a url',
        payload: {},
        timeout: 1000,
    });
    assert.equal(missingKey.statusCode, 400);
    assert.equal(missingKey.body.error, 'API key is required');

    const missingPayload = await invokeRoute(generateHandler, {
        url: 'not a url',
        key: 'key',
        timeout: 1000,
    });
    assert.equal(missingPayload.statusCode, 400);
    assert.equal(missingPayload.body.error, 'payload is required');

    const invalidTimeout = await invokeRoute(generateHandler, {
        url: 'not a url',
        key: 'key',
        payload: {},
        timeout: 0,
    });
    assert.equal(invalidTimeout.statusCode, 400);
    assert.equal(invalidTimeout.body.error, 'timeout must be a positive number');

    const testMissingKey = await invokeRoute(testHandler, {
        url: 'not a url',
        timeout: 1000,
    });
    assert.equal(testMissingKey.statusCode, 400);
    assert.equal(testMissingKey.body.error, 'API key is required');
});

test('rejects unresolved backend URLs before starting an upstream request', async () => {
    let handler;
    await init({
        get() {},
        post(path, routeHandler) {
            if (path === '/v2/generate-image') handler = routeHandler;
        },
        delete() {},
    });

    const req = new EventEmitter();
    req.aborted = false;
    req.destroyed = false;
    req.body = { url: '/relative/ai/generate-image', key: 'key', payload: {}, timeout: 1000 };
    const res = new EventEmitter();
    res.destroyed = false;
    res.writableEnded = false;
    res.status = status => {
        res.statusCode = status;
        return res;
    };
    res.send = body => {
        res.writableEnded = true;
        res.body = body;
        return res;
    };
    const beforeCount = upstreamRequests;

    await handler(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.body.error, /complete HTTP\(S\) url/);
    assert.equal(upstreamRequests, beforeCount);
});

test('aborts an active upstream request', async () => {
    let markStarted;
    let markClosed;
    const started = new Promise(resolve => { markStarted = resolve; });
    const closed = new Promise(resolve => { markClosed = resolve; });
    slowRequestHooks = { started: markStarted, closed: markClosed };
    const controller = new AbortController();
    const pending = generateImage({
        url: `${origin}/slow/ai/generate-image`,
        key: 'key',
        payload: {},
        insecure: false,
        signal: controller.signal,
    });

    await started;
    controller.abort();
    await assert.rejects(pending, error => error.name === 'AbortError');
    await closed;
    slowRequestHooks = null;
});

test('enforces the request timeout inside the backend plugin', async () => {
    let handler;
    await init({
        get() {},
        post(path, routeHandler) {
            if (path === '/v1/generate-image') handler = routeHandler;
        },
        delete() {},
    });

    const req = new EventEmitter();
    req.aborted = false;
    req.destroyed = false;
    req.body = { url: `${origin}/slow`, key: 'key', payload: {}, timeout: 20 };
    const res = new EventEmitter();
    res.destroyed = false;
    res.writableEnded = false;
    res.status = status => {
        res.statusCode = status;
        return res;
    };
    res.send = body => {
        res.writableEnded = true;
        res.body = body;
        return res;
    };

    await handler(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: false, code: 'timeout', error: 'NovelAI request timed out' });
});
