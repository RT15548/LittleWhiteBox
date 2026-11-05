'use strict';
const assert = require('node:assert/strict');
const http = require('node:http');
const { test } = require('node:test');
const { encodeVibe } = require('../../../modules/draw/server/providers/novelai/client.js');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { runInNewContext } = require('node:vm');
const { parse } = require('acorn');
const novelBackendTransport = require('../../../modules/draw/providers/novelai/backend-transport-contract.cjs');

function browserFunction(source, name, context) {
    const node = parse(source, { ecmaVersion: 'latest', sourceType: 'module' }).body
        .find(entry => entry.type === 'FunctionDeclaration' && entry.id.name === name);
    assert.ok(node, `Missing browser function ${name}`);
    return runInNewContext(`(${source.slice(node.start, node.end)})`, context);
}

async function listen(t, server) {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => {
        server.closeAllConnections();
        return new Promise(resolve => server.close(resolve));
    });
    return `http://127.0.0.1:${server.address().port}`;
}

// Acceptance (protocol/paid retry): backend encoding returns exact binary, forwards
// model/info, reports errors without resubmission, and does not accept a JSON error as encoding.
test('Vibe backend transports binary without treating it as an image or retrying failures', async t => {
    const calls = [];
    let mode = 'ok';
    const bytes = Buffer.from([0, 1, 255, 42]);
    const server = http.createServer((req, res) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            calls.push({ auth: req.headers.authorization, body: JSON.parse(Buffer.concat(chunks)) });
            res.setHeader('Content-Type', mode === 'ok' ? 'application/octet-stream' : 'application/json');
            if (mode === 'fail') res.statusCode = 402;
            res.end(mode === 'ok' ? bytes : '{"error":"offline failure"}');
        });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => server.close(resolve)));
    const options = { url: `http://127.0.0.1:${server.address().port}/ai/encode-vibe`,
        key: 'offline-fixture', payload: { image: 'AQID', model: 'nai-diffusion-4-5-full', information_extracted: .65 } };
    const result = await encodeVibe(options);
    assert.equal(result.encoding, bytes.toString('base64'));
    assert.deepEqual(calls[0].body, options.payload);
    assert.equal(calls[0].auth, 'Bearer offline-fixture');
    mode = 'fail';
    assert.equal((await encodeVibe(options)).status, 402);
    assert.equal(calls.length, 2);
    mode = 'bad';
    await assert.rejects(encodeVibe(options));
    assert.equal(calls.length, 3);
});

// Acceptance (deployment / paid requests): an unchanged runtime-capable host must
// run the shipped browser request through the signed extension bundle. Encoding
// errors must never trigger another paid call or change normal image generation.
test('Vibe browser requests use the existing host with the distributed runtime', async t => {
    // The optional path permits replay against an extracted, pre-PR host without
    // changing the running installation or requiring Git history in normal tests.
    const host = require(process.env.LWB_TEST_FROZEN_HOST || '../index.js');
    t.after(() => host.exit());
    const upstreamCalls = [];
    const browserCalls = [];
    const encoding = Buffer.from([0, 1, 255, 42]);
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    let mode = 'ok';
    const upstream = await listen(t, http.createServer((req, res) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            upstreamCalls.push({ url: req.url, auth: req.headers.authorization, body: JSON.parse(Buffer.concat(chunks)) });
            if (req.url === '/ai/generate-image') {
                res.writeHead(200, { 'Content-Type': 'image/png' }).end(png);
            } else if (mode === 'timeout') {
                // The request-scoped deadline must close this connection.
            } else if (mode === 'fail') {
                res.writeHead(402, { 'Content-Type': 'application/json' }).end('{"error":"offline quota failure"}');
            } else if (mode === 'json') {
                res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"error":"not an encoding"}');
            } else {
                res.writeHead(200, { 'Content-Type': 'application/octet-stream' }).end(mode === 'empty' ? Buffer.alloc(0) : encoding);
            }
        });
    }));
    const routes = new Map();
    await host.init(Object.fromEntries(['get', 'post', 'delete'].map(method => [method,
        (url, handler) => routes.set(`${method.toUpperCase()} ${url}`, handler)])));
    const backend = await listen(t, http.createServer((req, res) => {
        const respond = async () => {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            req.body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {};
            req.user = { profile: { handle: 'isolated-vibe-test' }, directories: { extensions: path.resolve(__dirname, '../../../..') } };
            res.status = code => { res.statusCode = code; return res; };
            res.send = body => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(body)); return res; };
            const handler = routes.get(`${req.method} ${req.url}`);
            if (!handler) return res.status(404).send({ ok: false, error: 'route not installed' });
            return handler(req, res);
        };
        respond().catch(error => res.destroy(error));
    }));
    const source = readFileSync(path.resolve(__dirname, '../../../modules/draw/providers/novelai/novel-draw.js'), 'utf8');
    const { resolveNovelAIEncodeVibeApi } = await import('../../../modules/draw/providers/novelai/novel-request-config.js');
    const { clampVibeInfoExtracted } = await import('../../../modules/draw/providers/novelai/vibe.js');
    const { drawingRuntimeHeaders, DRAWING_RUNTIME_ABI } = await import('../../../modules/draw/shared/drawing-runtime-client.js');
    const context = {
        URL, Uint8Array, btoa, location: { href: backend },
        NAI_BACKEND_BASE: backend, NAI_BACKEND_GENERATE_V2: `${backend}/v2/generate-image`,
        NovelDrawError: Error, ErrorType: {}, SERVER_PLUGIN_COPY: { install: '', update: '' },
        resolveNovelAIEncodeVibeApi, clampVibeInfoExtracted, drawingRuntimeHeaders, DRAWING_RUNTIME_ABI, novelBackendTransport,
        getRequestHeaders: () => ({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'isolated' }),
        checkBackendPluginStatus: async () => ({ ...await (await fetch(`${backend}/status`)).json(), ready: true }),
        fetch: (url, options) => { browserCalls.push({ url, options }); return fetch(url, options); },
    };
    for (const name of ['assertDrawingRuntimeHost', 'stripDataUrlPrefix', 'uint8ToBase64']) context[name] = browserFunction(source, name, context);
    const encode = browserFunction(source, 'encodeVibeReference', context);
    const input = { apiKey: 'offline-fixture', apiBaseUrl: upstream, imageBase64: 'data:image/png;base64,AQID',
        model: 'nai-diffusion-4-5-full', informationExtracted: .65, sendMode: 'backend', insecureTLS: false };
    assert.equal(await encode(input), encoding.toString('base64'));
    assert.equal(browserCalls[0].url, `${backend}/v2/generate-image`);
    assert.equal(upstreamCalls.length, 1);
    assert.deepEqual(upstreamCalls[0], { url: '/ai/encode-vibe', auth: 'Bearer offline-fixture',
        body: { image: 'AQID', model: input.model, information_extracted: .65 } });
    const body = JSON.parse(browserCalls[0].options.body);
    const post = async value => {
        const response = await fetch(`${backend}/v2/generate-image`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...drawingRuntimeHeaders() }, body: JSON.stringify(value),
        });
        return { status: response.status, body: await response.json() };
    };
    for (const failure of ['fail', 'json', 'empty']) {
        mode = failure;
        const before = upstreamCalls.length;
        await assert.rejects(encode(input));
        assert.equal(upstreamCalls.length, before + 1);
    }
    mode = 'timeout';
    const beforeTimeout = upstreamCalls.length;
    assert.equal((await post({ ...body, timeout: 100 })).body.code, 'timeout');
    assert.equal(upstreamCalls.length, beforeTimeout + 1);
    const invalid = await post({ ...body, operation: 'unknown-operation' });
    assert.equal(invalid.status, 400);
    assert.equal(upstreamCalls.length, beforeTimeout + 1);
    mode = 'ok';
    const image = await post({ url: `${upstream}/ai/generate-image`, key: 'offline-fixture', payload: { input: 'offline' }, timeout: 5000 });
    assert.equal(image.status, 200);
    assert.equal(image.body.base64, png.toString('base64'));
    assert.equal(image.body.encoding, undefined);
});
