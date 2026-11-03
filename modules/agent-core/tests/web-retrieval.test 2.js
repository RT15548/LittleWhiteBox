import assert from 'node:assert/strict';
import test from 'node:test';
import { searchWeb, fetchWebContents } from '../web/retrieval.js';
import { runWebSearchTool, runWebFetchTool } from '../web/tools.js';
import { isWebConfigured, removeWebSettings } from '../web/settings.js';
import { normalizeAgentSettings } from '../config.js';
import { mergeSharedAgentSettings } from '../settings-repository.js';
import { resolveActiveProviderConfig } from '../provider-resolution.js';

const config = { webProvider: 'exa', exaApiKey: 'exa-fixture', tavilyApiKey: 'tavily-fixture' };
const urls = ['https://example.org/one', 'https://example.org/two'];

test('global web settings select exactly one provider for main and delegate, retain keys and allow clearing', () => {
    assert.equal(normalizeAgentSettings({ tavilyApiKey: 'existing' }).webProvider, 'tavily');
    let saved = mergeSharedAgentSettings({}, config);
    for (const role of ['main', 'delegate']) {
        const resolved = resolveActiveProviderConfig(saved, { role });
        assert.equal(resolved.webProvider, 'exa');
        assert.equal(resolved.exaApiKey, config.exaApiKey);
    }
    saved = mergeSharedAgentSettings(saved, { webProvider: 'tavily' });
    assert.equal(saved.exaApiKey, config.exaApiKey);
    saved = mergeSharedAgentSettings(saved, { webProvider: 'exa', exaApiKey: '' });
    assert.equal(isWebConfigured(saved), false);
    assert.equal(saved.tavilyApiKey, config.tavilyApiKey);
    const snapshot = { ...saved, model: 'fixture' };
    removeWebSettings(snapshot);
    assert.equal(snapshot.exaApiKey, undefined);
    assert.equal(snapshot.tavilyApiKey, undefined);
    assert.equal(snapshot.model, 'fixture');
});

for (const provider of ['tavily', 'exa']) {
    test(`${provider} search uses the selected API and returns excerpts under the shared contract`, async () => {
        let calls = 0;
        const result = await runWebSearchTool({ ...config, webProvider: provider }, { query: 'public reference', maxResults: 3 }, {
            fetch: async (url, options) => {
                calls++;
                const body = JSON.parse(options.body);
                // Exact shapes protect the external provider protocol, not UI wording.
                assert.equal(url, provider === 'exa' ? 'https://api.exa.ai/search' : 'https://api.tavily.com/search');
                if (provider === 'exa') {
                    assert.deepEqual(body, { query: 'public reference', numResults: 3, contents: { highlights: true } });
                    assert.equal(options.headers['x-api-key'], config.exaApiKey);
                } else {
                    assert.equal(body.api_key, config.tavilyApiKey);
                    assert.equal(body.max_results, 3);
                }
                return Response.json({ results: [{ title: 'Reference', url: urls[0], content: 'excerpt', highlights: ['excerpt'] }] });
            },
        });
        assert.equal(calls, 1);
        assert.equal(result.ok, true);
        assert.deepEqual(result.results, [{ title: 'Reference', url: urls[0], content: 'excerpt', score: 0 }]);
    });
}

test('Exa contents checks per-URL status even when the server includes text for a failed URL', async () => {
    const result = await runWebFetchTool(config, { urls }, { fetch: async (url, options) => {
        assert.equal(url, 'https://api.exa.ai/contents');
        assert.equal(options.headers['x-api-key'], config.exaApiKey);
        assert.deepEqual(JSON.parse(options.body), { urls, text: true });
        return Response.json({ results: urls.map(url => ({ url, text: 'real body' })),
            statuses: [{ id: urls[0], status: 'success' }, { id: urls[1], status: 'error' }] });
    } });
    assert.equal(result.ok, false);
    assert.deepEqual(result.results, [{ url: urls[0], title: '', text: 'real body' }]);
    assert.deepEqual(result.failedUrls, [urls[1]]);
});

test('Exa contents associates requested URLs with result URLs, not temporary document IDs', async () => {
    const requested = ['https://example.org', urls[1]];
    const result = await runWebFetchTool(config, { urls: requested }, { fetch: async () => Response.json({
        // Exa /contents defines statuses.id as the requested URL, results.id as the document ID.
        results: [{ id: 'document-two', url: urls[1], text: 'Second page' },
            { id: 'document-root', url: requested[0], text: 'Root page' }],
        statuses: [{ id: 'https://example.org/', status: 'success' }, { id: urls[1], status: 'success' }],
    }) });
    assert.equal(result.ok, true);
    assert.deepEqual(result.results.map(({ url, text }) => ({ url, text })), [
        { url: 'https://example.org/', text: 'Root page' }, { url: urls[1], text: 'Second page' },
    ]);
    assert.deepEqual(result.failures, []);
});

for (const partial of [false, true]) {
    test(`Exa ${partial ? 'partial' : 'complete'} extraction failure retains per-URL diagnostics and request ID`, async () => {
        let calls = 0;
        const result = await runWebFetchTool(config, { urls }, { fetch: async () => {
            calls++;
            return Response.json({ requestId: 'request-fixture',
                results: partial ? [{ id: 'document-one', url: urls[0], text: 'Kept body' }] : [],
                statuses: urls.map((id, index) => partial && index === 0 ? { id, status: 'success' }
                    : { id, status: 'error', error: { tag: 'CRAWL_TIMEOUT', httpStatusCode: 408 } }),
            });
        } });
        assert.equal(calls, 1);
        assert.equal(result.ok, false);
        assert.equal(result.error, 'web_extract_failed');
        assert.equal(result.provider, 'exa');
        assert.equal(result.requestId, 'request-fixture');
        assert.equal(result.results.length, partial ? 1 : 0);
        assert.deepEqual(result.failures, (partial ? [urls[1]] : urls).map(url => ({ url, code: 'CRAWL_TIMEOUT', httpStatus: 408 })));
        assert.deepEqual(result.failedUrls, result.failures.map(failure => failure.url));
    });
}

test('per-URL diagnostics are redacted for both providers without changing source URLs', async () => {
    for (const provider of ['exa', 'tavily']) {
        const key = config[`${provider}ApiKey`];
        const result = await runWebFetchTool({ ...config, webProvider: provider }, { urls: [urls[0]] }, {
            fetch: async () => Response.json(provider === 'exa'
                ? { requestId: `request-${key}`, results: [], statuses: [{ id: urls[0], status: 'error', error: { tag: `upstream-${key}`, httpStatusCode: 403 } }] }
                : { request_id: `request-${key}`, results: [], failed_results: [{ url: urls[0], error: `Forbidden: upstream credential ${key}` }] }),
        });
        assert.equal(result.error, 'web_extract_failed');
        assert.equal(result.provider, provider);
        assert.deepEqual(result.failedUrls, [urls[0]]);
        assert.equal(result.requestId, 'request-[redacted]');
        // Credential exclusion is a security contract, not a UI-copy assertion.
        assert.equal(JSON.stringify(result).includes(key), false);
        if (provider === 'tavily') assert.equal(result.failures[0].message, 'Forbidden: upstream credential [redacted]');
        else assert.equal(result.failures[0].httpStatus, 403);
    }
});

test('missing selected key does not fall back to another configured provider', async () => {
    const result = await runWebSearchTool({ ...config, exaApiKey: '' }, { query: 'test' }, {
        fetch: async () => assert.fail('no request without selected credential'),
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, 'web_search_not_configured');
    assert.equal(result.provider, 'exa');
});

test('provider failures preserve HTTP status and diagnostics without retrying or leaking the key', async () => {
    let calls = 0;
    const result = await runWebSearchTool(config, { query: 'test' }, { fetch: async () => {
        calls++;
        return new Response(JSON.stringify({ error: `reason: rate limited: ${config.exaApiKey}`, requestId: 'fixture-id' }), { status: 429 });
    } });
    assert.equal(calls, 1);
    assert.equal(result.httpStatus, 429);
    assert.equal(result.error, 'web_http_failed');
    assert.equal(result.provider, 'exa');
    // Credential exclusion is a security contract; the complete nested error remains available.
    assert.equal(JSON.stringify(result).includes(config.exaApiKey), false);
    assert.equal(result.message.includes('fixture-id'), true);
});

test('malformed responses are errors, while valid empty searches are successful', async () => {
    const malformed = await runWebSearchTool(config, { query: 'test' }, { fetch: async () => Response.json({ error: 'bad response' }) });
    assert.equal(malformed.error, 'web_invalid_response');
    const empty = await runWebSearchTool(config, { query: 'test' }, { fetch: async () => Response.json({ results: [] }) });
    assert.equal(empty.ok, true);
    assert.equal(empty.count, 0);
    await assert.rejects(fetchWebContents(config, urls, { fetch: async () => Response.json({ results: [] }) }), { code: 'web_invalid_response' });
});

test('abort propagates, timeout is distinct, and neither accepts late success or retries', async () => {
    const controller = new AbortController();
    let calls = 0;
    await assert.rejects(runWebSearchTool(config, { query: 'test' }, { signal: controller.signal, fetch: async () => {
        calls++; controller.abort(); return Response.json({ results: [] });
    } }), { name: 'AbortError' });
    await assert.rejects(searchWeb(config, { query: 'test', signal: controller.signal,
        fetch: async () => assert.fail('pre-aborted request sent') }), { name: 'AbortError' });
    assert.equal(calls, 1);
    const timeout = await runWebSearchTool(config, { query: 'test' }, { timeoutMs: 1,
        fetch: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('timeout', 'AbortError')))),
    });
    assert.equal(timeout.error, 'web_timeout');
});
