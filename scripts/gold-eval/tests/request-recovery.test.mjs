import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestRecovery } from '../../story-summary-replay/request-recovery.mjs';
import { withPreparedRequestBudget } from '../../story-summary-replay/prepared-config.mjs';
import { assertSuccessfulExternalTrace, withExternalCallTrace } from '../lib/transport-cassette.mjs';

const policy = { maxAttempts: 3, baseDelayMs: 1, maxDelayMs: 60000 };
const endpoint = 'https://fixture.invalid/v1/embeddings';
const request = id => ({ method: 'POST', body: JSON.stringify({ model: 'fixture', input: [id] }) });

test('429 retries only the failed request, honors Retry-After and retains every attempt', async t => {
    const previous = globalThis.fetch;
    t.after(() => { globalThis.fetch = previous; });
    const counts = new Map();
    let now = 0;
    const waits = [];
    globalThis.fetch = async (_, init) => {
        const id = JSON.parse(init.body).input[0];
        counts.set(id, (counts.get(id) || 0) + 1);
        return Response.json({ data: [] }, id === 'retry' && counts.get(id) === 1
            ? { status: 429, headers: { 'Retry-After': '2' } } : {});
    };
    globalThis.fetch.recoverTransientRequest = createRequestRecovery(policy, {
        clock: () => now, wait: async ms => { waits.push(ms); now += ms; },
    });
    const observed = await withExternalCallTrace(() => Promise.all([
        fetch(endpoint, request('success')), fetch(endpoint, request('retry')),
    ]));
    assert.equal(counts.get('success'), 1);
    assert.equal(counts.get('retry'), 2);
    assert.deepEqual(waits, [2000]);
    assert.equal(observed.calls, 3);
    assert.equal(observed.trace.at(-1).retryWaitMs, 2000);
    assert.equal(assertSuccessfulExternalTrace(observed.trace, { allowRecoveredTransient: true }).recovered.length, 1);
});

test('persistent limits stop at three attempts even when an upper layer invokes the same request again', async t => {
    const previous = globalThis.fetch;
    t.after(() => { globalThis.fetch = previous; });
    let dispatched = 0;
    let now = 0;
    globalThis.fetch = async () => { dispatched++; return new Response('', { status: 429 }); };
    globalThis.fetch.recoverTransientRequest = createRequestRecovery(policy, {
        clock: () => now, wait: async ms => { now += ms; },
    });
    const first = await withExternalCallTrace(() => fetch(endpoint, request('retry')));
    assert.equal(first.value.status, 429);
    assert.equal(first.calls, 3);
    await assert.rejects(() => withExternalCallTrace(() => fetch(endpoint, request('retry'))),
        error => error.goldFailure.kind === 'retry-exhausted' && error.externalCalls === 0);
    assert.equal(dispatched, 3);
});

test('permanent errors and cancellation do not repeatedly dispatch requests', async t => {
    const previous = globalThis.fetch;
    t.after(() => { globalThis.fetch = previous; });
    let dispatched = 0;
    globalThis.fetch = async () => { dispatched++; return new Response('', { status: 401 }); };
    globalThis.fetch.recoverTransientRequest = createRequestRecovery(policy);
    await withExternalCallTrace(() => fetch(endpoint, request('auth')));
    await assert.rejects(() => withExternalCallTrace(() => fetch(endpoint, request('auth'))), /retry-exhausted/);
    assert.equal(dispatched, 1);

    const controller = new AbortController();
    globalThis.fetch = async () => { dispatched++; return new Response('', { status: 429 }); };
    globalThis.fetch.recoverTransientRequest = createRequestRecovery(policy, {
        wait: async (_, signal) => { controller.abort(); signal.throwIfAborted(); },
    });
    await assert.rejects(() => withExternalCallTrace(() => fetch(endpoint, { ...request('abort'), signal: controller.signal })),
        error => error.name === 'AbortError');
    assert.equal(dispatched, 2);
});

test('request-level retries cannot exceed the invocation request budget', async t => {
    const previous = globalThis.fetch;
    t.after(() => { globalThis.fetch = previous; });
    let dispatched = 0;
    globalThis.fetch = async () => { dispatched++; return new Response('', { status: 503 }); };
    const api = { url: 'https://fixture.invalid/v1' };
    const config = { summaryApi: api, vectorConfig: { l0Api: api, embeddingApi: api, rerankApi: api },
        prepared: { maxRequests: 2 }, requestRecovery: { ...policy, maxDelayMs: 2 } };
    await assert.rejects(() => withPreparedRequestBudget(config,
        () => withExternalCallTrace(() => fetch(endpoint, request('budget')))),
    error => error.goldFailure.kind === 'request-budget' && error.externalCalls === 2);
    assert.equal(dispatched, 2);
});
