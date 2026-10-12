'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { test } = require('node:test');
const { registerWebRoutes } = require('../web/routes.js');
const { WEB_BACKEND_ERROR_HEADER, WEB_REQUEST_BYTES } = require('../web/web-runtime.cjs');

const credential = 'server-fixture-key';
const input = { apiKey: credential, payload: { query: 'reference', numResults: 3, contents: { highlights: true } } };
function harness(options) {
    let route;
    registerWebRoutes({ post(_path, handler) { route = handler; } }, options);
    const req = Object.assign(new EventEmitter(), { complete: true, user: { profile: { handle: 'fixture' } },
        params: { operation: 'search' }, body: input });
    const res = Object.assign(new EventEmitter(), { headers: {}, writableEnded: false,
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        send(body) { this.body = body; this.writableEnded = true; return this; },
    });
    return { req, res, run: () => route(req, res, error => { throw error; }) };
}

test('web routes use the fixed Exa API, return source data and forward no Tavern credentials', async t => {
    const calls = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        calls.push(url);
        assert.deepEqual(options.headers, { 'Content-Type': 'application/json', 'x-api-key': credential });
        assert.equal(options.redirect, 'error');
        return Response.json({ requestId: 'receipt', results: [] });
    });
    for (const operation of ['search', 'contents']) {
        const h = harness();
        h.req.params.operation = operation;
        h.req.headers = { cookie: 'session-secret', 'x-csrf-token': 'csrf-secret' };
        await h.run();
        assert.equal(h.res.statusCode, 200);
        assert.equal(h.res.headers['Cache-Control'], 'no-store');
        assert.deepEqual(h.res.body, { requestId: 'receipt', results: [] });
    }
    assert.deepEqual(calls, ['https://api.exa.ai/search', 'https://api.exa.ai/contents']);
});

test('authentication, input limit, unsupported operations and arbitrary destinations fail before upstream', async t => {
    t.mock.method(globalThis, 'fetch', () => assert.fail('invalid request reached Exa'));
    const cases = [
        [h => { h.req.user = null; }, 'web_backend_access_denied', 403],
        [h => { h.req.body = { ...input, payload: { query: 'x'.repeat(WEB_REQUEST_BYTES) } }; }, 'web_backend_input_limit', 413],
        [h => { h.req.params.operation = '../search'; }, 'web_backend_invalid_request', 400],
        [h => { h.req.params.operation = 'answer'; }, 'web_backend_invalid_request', 400],
        [h => { h.req.body = { ...input, baseUrl: 'http://127.0.0.1' }; }, 'web_backend_invalid_request', 400],
        [h => { h.req.body = { ...input, apiKey: '' }; }, 'web_backend_invalid_request', 400],
    ];
    for (const [prepare, code, status] of cases) {
        const h = harness(); prepare(h); await h.run();
        assert.equal(h.res.statusCode, status);
        assert.equal(h.res.body.code, code);
        assert.equal(h.res.headers[WEB_BACKEND_ERROR_HEADER], '1');
    }
});

test('upstream failure retains its status, is redacted and is never retried', async t => {
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response(`quota: ${credential}`, { status: 429 }); });
    const h = harness(); await h.run();
    assert.equal(h.res.statusCode, 429);
    assert.equal(h.res.body.code, 'web_http_failed');
    assert.equal(h.res.body.httpStatus, 429);
    assert.equal(JSON.stringify(h.res.body).includes(credential), false);
    assert.equal(calls, 1);
});

test('client disconnect aborts the provider request and releases listeners without sending a late response', async t => {
    let upstreamSignal;
    let started;
    const ready = new Promise(resolve => { started = resolve; });
    t.mock.method(globalThis, 'fetch', (_url, { signal }) => {
        upstreamSignal = signal; started();
        return new Promise((_resolve, reject) => signal.addEventListener('abort',
            () => reject(new DOMException('Aborted', 'AbortError')), { once: true }));
    });
    const h = harness();
    const running = h.run();
    await ready;
    h.res.emit('close');
    await running;
    assert.equal(upstreamSignal.aborted, true);
    assert.equal(h.res.body, undefined);
    assert.equal(h.req.listenerCount('aborted'), 0);
    assert.equal(h.res.listenerCount('close'), 0);
});

test('completed request-body disposal is not a client disconnect', async t => {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ results: [] }));
    const h = harness(); h.req.destroyed = true;
    await h.run();
    assert.equal(h.res.statusCode, 200);
});
