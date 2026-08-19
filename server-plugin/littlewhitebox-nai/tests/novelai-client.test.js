'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const zlib = require('node:zlib');
const { EventEmitter } = require('node:events');
const { after, before, test } = require('node:test');

const { init } = require('../index.js');
const { generateImage } = require('../novelai-client.js');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');

let server;
let origin;
let upstreamRequests = 0;
let slowRequestHooks = null;
let crossOriginTarget = '';

before(async () => {
    server = http.createServer((req, res) => {
        upstreamRequests++;
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
        baseUrl: `${origin}/redirect`,
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
        baseUrl: `${origin}/gzip`,
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
        baseUrl: `${origin}/deflate`,
        key: 'key',
        payload: {},
        insecure: false,
    });

    assert.equal(result.ok, true);
    assert.equal(result.mime, 'image/png');
    assert.equal(result.base64, PNG.toString('base64'));
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
            baseUrl: `${origin}/cross-origin`,
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
            baseUrl: `${origin}/redirect-loop`,
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

test('aborts an active upstream request', async () => {
    let markStarted;
    let markClosed;
    const started = new Promise(resolve => { markStarted = resolve; });
    const closed = new Promise(resolve => { markClosed = resolve; });
    slowRequestHooks = { started: markStarted, closed: markClosed };
    const controller = new AbortController();
    const pending = generateImage({
        baseUrl: `${origin}/slow`,
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
