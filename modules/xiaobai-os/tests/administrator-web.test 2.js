import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled } from './administrator-harness.js';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';
import { WEB_RESPONSE_BYTES } from '../../agent-core/web/transport.js';

const config = { webProvider: 'exa', exaApiKey: 'fixture-exa' };
const url = 'https://example.org/reference';
const call = (name, args) => ({ toolCalls: [{ id: name, name, arguments: JSON.stringify(args) }] });

test('administrator runs search, reads the page and receives results on the next model turn', async t => {
    const h = await administratorHarness();
    h.gateway.loadConfig = async () => config;
    const requests = [];
    t.mock.method(globalThis, 'fetch', async (endpoint, options) => {
        requests.push({ endpoint, body: JSON.parse(options.body) });
        return Response.json(endpoint.endsWith('/search')
            ? { results: [{ title: 'Reference', url, highlights: ['excerpt'] }] }
            : { results: [{ url, text: 'Actual reference body.' }], statuses: [{ id: url, status: 'success' }] });
    });
    let round = 0;
    h.state.generate = async request => {
        round++;
        assert.equal(request.tools.some(tool => tool.function.name === 'web_search'), true);
        assert.equal(request.tools.some(tool => tool.function.name === 'web_fetch'), true);
        if (round === 1) return call('web_search', { query: 'reference' });
        const result = JSON.parse(request.messages.findLast(message => message.role === 'tool').content);
        assert.equal(result.status, 'read');
        if (round === 2) {
            assert.equal(result.data.results[0].url, url);
            return call('web_fetch', { urls: [url] });
        }
        assert.equal(result.data.results[0].text, 'Actual reference body.');
        return { text: 'reference checked' };
    };
    await h.request('send', { text: 'Check a public reference.' }); await settled(h.runtime);
    assert.equal(round, 3);
    assert.deepEqual(requests.map(item => item.endpoint), ['https://api.exa.ai/search', 'https://api.exa.ai/contents']);
    const turn = h.conversation.read().turns.at(-1);
    assert.equal(turn.status, 'finished');
    assert.deepEqual(turn.operations.map(item => item.status), ['read', 'read']);
    // Credentials must not enter persisted conversation or request evidence.
    assert.equal(JSON.stringify(turn).includes(config.exaApiKey), false);
});

test('administrator pages long web results, exposes failures and rejects cancelled reads', async t => {
    const h = await administratorHarness(), controller = new AbortController(), operations = [];
    const reader = createAdministratorChatReader(h.capture, () => controller.signal);
    const executor = await createAdministratorToolExecutor({ registry: h.registry, reader, readEnvironment: h.readEnvironment,
        operations, webConfig: config, signal: controller.signal, guard: reader.isCurrent, onChange() {},
        async saveReceipts() { assert.fail('web reads cannot save business records'); } });
    const body = 'Article body. '.repeat(1500);
    t.mock.method(globalThis, 'fetch', async () => Response.json({ results: [{ url, text: body }], statuses: [{ id: url, status: 'success' }] }));
    const first = await executor.execute('web_fetch', { urls: [url] }, 'long', 0);
    assert.equal(first.status, 'read');
    assert.ok(first.data.reference);
    let text = first.data.text, offset = first.data.nextOffset;
    while (offset !== null) {
        const page = await executor.execute('ToolResultRead', { reference: first.data.reference, offset }, `page-${offset}`, 0);
        text += page.data.text; offset = page.data.nextOffset;
    }
    assert.equal(JSON.parse(text).data.results[0].text, body);
    t.mock.method(globalThis, 'fetch', async () => new Response('quota exceeded', { status: 429 }));
    const failure = await executor.execute('web_search', { query: 'query' }, 'error', 0);
    assert.equal(failure.status, 'failed');
    assert.equal(failure.code, 'web_http_failed');
    assert.equal(failure.data.httpStatus, 429);
    assert.equal(operations.at(-1).status, 'failed');
    controller.abort();
    await assert.rejects(executor.execute('web_search', { query: 'query' }, 'cancel', 0), { name: 'AbortError' });
});

for (const provider of ['exa', 'tavily']) {
    test(`administrator retains and pages oversized ${provider} evidence without another network request`, async t => {
        const h = await administratorHarness(), operations = [], controller = new AbortController();
        const reader = createAdministratorChatReader(h.capture, () => controller.signal);
        const executor = await createAdministratorToolExecutor({ registry: h.registry, reader, readEnvironment: h.readEnvironment,
            operations, webConfig: { webProvider: provider, [`${provider}ApiKey`]: 'fixture-key' }, signal: controller.signal,
            guard: reader.isCurrent, onChange() {}, async saveReceipts() { assert.fail('read-only'); } });
        // Cover both raw text beyond the ordinary cache budget and prompt escaping that expands a smaller response.
        const body = provider === 'exa' ? 'Article body. '.repeat(85000) : '<>&{}🙂'.repeat(40000);
        let requests = 0;
        t.mock.method(globalThis, 'fetch', async () => {
            requests++;
            const payload = provider === 'exa'
                ? { results: [{ id: 'document-fixture', url, text: body }], statuses: [{ id: url, status: 'success' }] }
                : { results: [{ url, raw_content: body }], failed_results: [] };
            assert.ok(new TextEncoder().encode(JSON.stringify(payload)).length <= WEB_RESPONSE_BYTES);
            return Response.json(payload);
        });
        const first = await executor.execute('web_fetch', { urls: [url] }, 'long', 0);
        assert.equal(first.ok, true);
        assert.equal(first.status, 'read');
        assert.ok(first.data.reference);
        assert.ok(first.data.totalChars > ADMINISTRATOR_POLICY.evidenceChars);
        let text = first.data.text, offset = first.data.nextOffset, last;
        while (offset !== null) {
            last = await executor.execute('ToolResultRead', { reference: first.data.reference, offset }, `page-${offset}`, 0);
            assert.equal(last.status, 'read');
            text += last.data.text; offset = last.data.nextOffset;
        }
        assert.equal(JSON.parse(text).data.results[0].text, body);
        assert.equal(executor.evidence(last.receipt.id).text, last.data.text);
        assert.equal(requests, 1);
        // A new oversized read replaces the old source and its continuation aliases, keeping the run cache bounded.
        const next = await executor.execute('web_fetch', { urls: [url] }, 'replacement', 0);
        assert.ok(next.data.reference);
        assert.throws(() => executor.evidence(first.data.reference));
        assert.throws(() => executor.evidence(last.receipt.id));
        assert.equal(requests, 2);
        t.mock.method(globalThis, 'fetch', async () => new Response('x'.repeat(WEB_RESPONSE_BYTES + 1)));
        const tooLarge = await executor.execute('web_fetch', { urls: [url] }, 'over-transport-limit', 0);
        assert.equal(tooLarge.ok, false);
        assert.equal(tooLarge.status, 'failed');
        assert.equal(tooLarge.code, 'web_response_too_large');
    });
}

test('administrator exposes Exa partial and total extraction diagnostics in model data and operation receipts', async t => {
    const h = await administratorHarness(), operations = [];
    const reader = createAdministratorChatReader(h.capture, () => new AbortController().signal);
    const executor = await createAdministratorToolExecutor({ registry: h.registry, reader, readEnvironment: h.readEnvironment,
        operations, webConfig: config, guard: reader.isCurrent, onChange() {}, async saveReceipts() { assert.fail('read-only'); } });
    const missing = 'https://example.org/missing';
    for (const partial of [false, true]) {
        t.mock.method(globalThis, 'fetch', async () => Response.json({ requestId: 'request-fixture',
            results: partial ? [{ id: 'document', url, text: 'Kept body' }] : [],
            statuses: [{ id: missing, status: 'error', error: { tag: 'CRAWL_TIMEOUT', httpStatusCode: 408 } },
                ...(partial ? [{ id: url, status: 'success' }] : [])],
        }));
        const result = await executor.execute('web_fetch', { urls: partial ? [url, missing] : [missing] }, `failure-${partial}`, 0);
        assert.equal(result.ok, false);
        assert.equal(result.status, partial ? 'partial' : 'failed');
        assert.equal(result.code, 'web_extract_failed');
        assert.equal(result.data.requestId, 'request-fixture');
        assert.deepEqual(result.data.failures, [{ url: missing, code: 'CRAWL_TIMEOUT', httpStatus: 408 }]);
        assert.equal(result.data.results.length, partial ? 1 : 0);
        // The user sees the same diagnosis as the model; no separate generic failure hides it.
        assert.equal(operations.at(-1).summary, result.data.message.slice(0, 350));
    }
});
