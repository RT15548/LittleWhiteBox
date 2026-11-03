import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Buffer } from 'node:buffer';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';

// Exercise real request deadlines and response-body consumption; replace only
// saved configuration, logging and fetch. No provider requests are made.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const apiConfig = { url: 'https://rerank.test/v1', key: 'test-key', model: 'test-model' };
const shims = {
    'config.js': `export const getVectorConfig=()=>({rerankApi:${JSON.stringify(apiConfig)}});`,
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){}};',
};
const bundled = await build({
    entryPoints: [path.join(root, 'modules/story-summary/vector/llm/reranker.js')],
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'rerank-host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, not external code.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const documents = ['First document.', 'Second document.'];

function responseFixture(t, status) {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let requestSignal;
    let body;
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        requestSignal = options.signal;
        return new Response(new ReadableStream({ start(controller) {
            body = controller;
            // fetch aborts an in-progress response body as well as the request.
            requestSignal.addEventListener('abort', () => controller.error(requestSignal.reason), { once: true });
        } }), { status });
    });
    return {
        get signal() { return requestSignal; },
        finish(text) {
            body.enqueue(new TextEncoder().encode(text));
            body.close();
        },
    };
}

function startRequest(kind, options = {}) {
    return kind === 'recall'
        ? mod.rerank('Current scene?', documents, { timeout: 15000, ...options })
        : mod.testRerankService(apiConfig);
}

for (const kind of ['recall', 'connection-test']) {
    for (const status of [200, 503]) {
        test(`${kind}: deadline covers a stalled ${status} body after headers arrive`, async t => {
            const response = responseFixture(t, status);
            const pending = startRequest(kind);
            const rejection = kind === 'connection-test'
                ? assert.rejects(pending, error => error.cause?.name === 'AbortError') : null;
            await nextTurn();
            assert.equal(response.signal.aborted, false);
            t.mock.timers.tick(15000);
            assert.equal(response.signal.aborted, true);
            if (rejection) await rejection;
            else {
                const result = await pending;
                assert.equal(result.failed, true);
                assert.equal(result.diagnostic.kind, 'timeout');
                assert.deepEqual(result.results.map(row => row.index), [0, 1]);
            }
        });

        test(`${kind}: completed ${status} body clears its deadline`, async t => {
            const response = responseFixture(t, status);
            const pending = startRequest(kind);
            const rejection = kind === 'connection-test' && status !== 200
                ? assert.rejects(pending, error => error.cause instanceof Error) : null;
            await nextTurn();
            response.finish(status === 200
                ? JSON.stringify({ results: [{ index: 1, relevance_score: 0.9 }] }) : 'service unavailable');
            if (rejection) await rejection;
            else {
                const result = await pending;
                if (kind === 'connection-test') assert.equal(result.success, true);
                else if (status === 200) {
                    assert.equal(result.failed, false);
                    assert.deepEqual(result.results, [{ index: 1, relevance_score: 0.9 }]);
                } else {
                    assert.equal(result.failed, true);
                    assert.equal(result.diagnostic.kind, 'http');
                    assert.equal(result.diagnostic.status, status);
                }
            }
            t.mock.timers.tick(60000);
            assert.equal(response.signal.aborted, false);
        });
    }
}

for (const status of [200, 503]) {
    test(`caller cancellation while reading a ${status} body rejects instead of using recall fallback`, async t => {
        const response = responseFixture(t, status);
        const controller = new AbortController();
        const reason = new Error('caller cancelled');
        const rejected = assert.rejects(startRequest('recall', { signal: controller.signal }), error => error === reason);
        await nextTurn();
        controller.abort(reason);
        await rejected;
        assert.equal(response.signal.aborted, true);
    });
}
