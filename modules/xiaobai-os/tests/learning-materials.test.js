import assert from 'node:assert/strict';
import test from 'node:test';
import { extractLearningSources } from '../apps/learning/materials/web-extract.js';

const config = { tavilyApiKey: 'fixture-key', tavilyBaseUrl: 'https://tavily.example.com/' };
const urls = ['https://www.bbc.com/article', 'https://example.com/article'];

test('Extract uses shared configuration and preserves real text, with partial failures distinguished', async () => {
    const result = await extractLearningSources(config, urls, { fetch: async (url, options) => {
        assert.equal(url, 'https://tavily.example.com/extract');
        assert.equal(options.headers.Authorization, 'Bearer fixture-key');
        assert.deepEqual(JSON.parse(options.body), { urls, extract_depth: 'basic', format: 'text', include_images: false });
        return Response.json({ results: [{ url: urls[0], raw_content: 'A real paragraph.\n\n第二段。' }],
            failed_results: [{ url: urls[1], error: 'private upstream error' }] });
    } });
    assert.deepEqual(result, { results: [{ url: urls[0], text: 'A real paragraph.\n\n第二段。' }], failedUrls: [urls[1]] });
});

test('Extract does not turn a search snippet, missing content or unrelated response URL into an article', async () => {
    const result = await extractLearningSources(config, urls, { fetch: async () => Response.json({ results: [
        { url: urls[0], content: 'Search snippet only' },
        { url: urls[1], raw_content: ' ' },
        { url: 'https://other.example.com/', raw_content: 'Not requested' },
    ] }) });
    assert.deepEqual(result, { results: [], failedUrls: urls });
});

test('Extract rejects missing key, unsafe URLs and oversized results without exposing upstream responses', async () => {
    await assert.rejects(extractLearningSources({}, urls), { code: 'learning_search_not_configured' });
    for (const url of ['http://localhost/a', 'http://127.0.0.1/a', 'http://[::1]/a', 'file:///secret', 'https://user:pass@example.com']) {
        await assert.rejects(extractLearningSources(config, [url]), { code: 'learning_source_url_invalid' });
    }
    await assert.rejects(extractLearningSources(config, urls, { fetch: async () => new Response('credential=private', { status: 401 }) }),
        { code: 'learning_extract_http_failed', httpStatus: 401 });
    await assert.rejects(extractLearningSources(config, urls, { fetch: async () => new Response('x'.repeat(2 * 1024 * 1024 + 1)) }),
        { code: 'learning_source_too_large' });
});

test('Extract cancellation never retries and blocks late success', async () => {
    const controller = new AbortController();
    let calls = 0;
    await assert.rejects(extractLearningSources(config, urls, { signal: controller.signal, fetch: async () => {
        calls++;
        controller.abort();
        return Response.json({ results: [{ url: urls[0], raw_content: 'Late content' }] });
    } }), { code: 'learning_extract_cancelled' });
    assert.equal(calls, 1);
    await assert.rejects(extractLearningSources(config, urls, { signal: controller.signal,
        fetch: async () => assert.fail('pre-aborted requests must not send') }), { code: 'learning_extract_cancelled' });
});
