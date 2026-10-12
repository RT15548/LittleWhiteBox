import assert from 'node:assert/strict';
import test from 'node:test';
import { runWebSearchTool, runWebFetchTool } from '../web/tools.js';
import { setHostRequestHeadersProvider } from '../../../shared/host-request-headers.js';
import { SERVER_PLUGIN_BASE } from '../../../shared/server-plugin/identity.js';
import { EXA_BACKEND_PATH, WEB_BACKEND_ERROR_HEADER } from '../web/backend-contract.js';

const config = { webProvider: 'exa', exaApiKey: 'test-key' };
function browser(t, host = false) {
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const previousHost = Object.getOwnPropertyDescriptor(globalThis, 'SillyTavern');
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
    const getHeaders = () => ({ 'X-CSRF-Token': 'csrf-fixture' });
    if (host) Object.defineProperty(globalThis, 'SillyTavern', { configurable: true,
        value: { getContext: () => ({ getRequestHeaders: getHeaders }) } });
    else setHostRequestHeadersProvider(getHeaders);
    t.after(() => {
        if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
        else delete globalThis.window;
        if (previousHost) Object.defineProperty(globalThis, 'SillyTavern', previousHost);
        else delete globalThis.SillyTavern;
        setHostRequestHeadersProvider(null);
    });
}

for (const host of [true, false]) {
    test(`Exa ${host ? 'host app' : 'assistant iframe'} uses only the authenticated same-origin backend`, async t => {
        browser(t, host);
        const requests = [];
        const fetch = async (url, options) => {
            requests.push(url);
            assert.equal(options.headers['X-CSRF-Token'], 'csrf-fixture');
            assert.equal(options.headers['x-api-key'], undefined);
            assert.equal(options.credentials, 'same-origin');
            assert.equal(options.redirect, 'error');
            const body = JSON.parse(options.body);
            assert.equal(body.apiKey, config.exaApiKey);
            const source = 'https://example.com/';
            if (url.endsWith('/search')) {
                assert.equal(body.payload.query, 'reference');
                return Response.json({ results: [{ url: source, title: 'Reference', highlights: ['excerpt'] }] });
            }
            assert.deepEqual(body.payload.urls, [source]);
            return Response.json({ results: [{ url: source, text: 'page body' }], statuses: [{ id: source, status: 'success' }] });
        };
        assert.equal((await runWebSearchTool(config, { query: 'reference' }, { fetch })).ok, true);
        assert.equal((await runWebFetchTool(config, { urls: ['https://example.com'] }, { fetch })).ok, true);
        assert.deepEqual(requests, ['search', 'contents'].map(operation => `${SERVER_PLUGIN_BASE}${EXA_BACKEND_PATH}/${operation}`));
    });
}

test('missing backend, expired login and provider errors remain distinct; none retries or falls back', async t => {
    browser(t);
    for (const [status, expected] of [[404, 'web_backend_unavailable'], [403, 'web_backend_access_denied']]) {
        let calls = 0;
        const result = await runWebSearchTool(config, { query: 'reference' }, {
            fetch: async () => { calls++; return new Response('', { status }); },
        });
        assert.equal(result.error, expected);
        assert.equal(calls, 1);
    }
    for (const status of [401, 404, 429]) {
        let calls = 0;
        const result = await runWebSearchTool(config, { query: 'reference' }, { fetch: async () => {
            calls++;
            return Response.json({ code: 'web_http_failed', httpStatus: status, detail: `denied ${config.exaApiKey}` },
                { status, headers: { [WEB_BACKEND_ERROR_HEADER]: '1' } });
        } });
        assert.equal(result.error, 'web_http_failed');
        assert.equal(result.httpStatus, status);
        assert.equal(calls, 1);
        // Security contract: diagnostics cannot expose the credential.
        assert.equal(JSON.stringify(result).includes(config.exaApiKey), false);
    }
});

test('Tavily and explicitly configured Exa relays keep their direct transport', async t => {
    browser(t);
    for (const [settings, target] of [
        [{ webProvider: 'tavily', tavilyApiKey: 'test-key' }, 'https://api.tavily.com/search'],
        [{ ...config, exaBaseUrl: 'https://relay.example/exa' }, 'https://relay.example/exa/search'],
    ]) {
        const result = await runWebSearchTool(settings, { query: 'reference' }, { fetch: async (url, options) => {
            assert.equal(url, target);
            assert.equal(options.headers['X-CSRF-Token'], undefined);
            return Response.json({ results: [] });
        } });
        assert.equal(result.ok, true);
    }
});

test('browser cancellation aborts the sole backend request', async t => {
    browser(t);
    const controller = new AbortController();
    let calls = 0;
    await assert.rejects(runWebSearchTool(config, { query: 'reference' }, {
        signal: controller.signal,
        fetch: async (_url, { signal }) => {
            calls++;
            controller.abort();
            assert.equal(signal.aborted, true);
            throw new DOMException('Aborted', 'AbortError');
        },
    }), { name: 'AbortError' });
    assert.equal(calls, 1);
});
