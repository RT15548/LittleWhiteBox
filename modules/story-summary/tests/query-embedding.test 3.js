import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { getEventListeners } from 'node:events';
import mod from './fixtures/recall-query.mjs';

// Protect the foreground request contract: retry inside one host round,
// cancellation stays silent, and diagnostics
// classify real transport failures rather than guessing from elapsed time.
// Real request policy, transport, validation and presentation; only host config,
// diagnostics and HTTP are replaced. No provider requests or paid API calls.
const originalFetch = globalThis.fetch;
const flush = async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); };
const success = () => new Response(JSON.stringify({ data: [{ index: 0, embedding: [1, 0] }] }));
const stalled = signal => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
});
let config, requests, failures, respond;
const query = options => mod.embedRecallQuery(['fixture query'], config, {
    onFailure: failure => failures.push(failure), ...options,
}).then(vectors => ({ vectors }), error => ({ error }));

beforeEach(() => {
    config = { embeddingApi: { provider: 'custom', url: 'https://embedding.invalid/v1', key: 'fixture-key', model: 'fixture' } };
    requests = []; failures = [];
    respond = () => success();
    globalThis.fetch = (url, options) => {
        requests.push({ url, options });
        return respond(options.signal);
    };
});
after(() => { globalThis.fetch = originalFetch; });

for (const outcome of ['success', 'http', 'network', 'response', 'timeout', 'cancel', 'already-cancelled']) {
    test(`Embedding request releases its external cancellation listener on ${outcome}`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const source = new AbortController();
        if (outcome === 'already-cancelled') source.abort();
        respond = signal => {
            assert.equal(getEventListeners(source.signal, 'abort').length, 1);
            if (outcome === 'http') return new Response('{}', { status: 503 });
            if (outcome === 'network') throw new TypeError('fixture network failure');
            if (outcome === 'response') return new Response('{');
            if (outcome === 'timeout' || outcome === 'cancel') return stalled(signal);
            return success();
        };
        const pending = mod.embedVectors(['fixture'], { apiConfig: config.embeddingApi, signal: source.signal, timeout: 3000 })
            .then(value => ({ value }), error => ({ error }));
        await flush();
        if (outcome === 'timeout') t.mock.timers.tick(3000);
        if (outcome === 'cancel') source.abort();
        const result = await pending;
        assert.equal(Boolean(result.error), outcome !== 'success');
        assert.equal(getEventListeners(source.signal, 'abort').length, 0);
        assert.equal(requests.length, outcome === 'already-cancelled' ? 0 : 1);
        const settledSignal = requests[0]?.options.signal;
        const aborted = settledSignal?.aborted;
        t.mock.timers.runAll();
        source.abort();
        assert.equal(settledSignal?.aborted, aborted, 'completed requests retain no timer or external forwarding listener');
    });
}

for (const failure of ['http', 'network']) {
    test(`old browsers retain no completed request listeners across 300 ${failure} retries`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const originalAny = AbortSignal.any;
        AbortSignal.any = undefined;
        t.after(() => { AbortSignal.any = originalAny; });
        const source = new AbortController();
        respond = () => {
            if (requests.length > 300) return success();
            if (failure === 'network') throw new TypeError('fixture network failure');
            return new Response('{}', { status: 503 });
        };
        const pending = query({ signal: source.signal });
        await flush();
        for (let attempt = 1; attempt <= 300; attempt++) {
            assert.equal(requests.length, attempt);
            // Only the current retry delay may listen; completed requests own nothing.
            assert.equal(getEventListeners(source.signal, 'abort').length, 1);
            t.mock.timers.tick(1000);
            await flush();
        }
        assert.deepEqual(await pending, { vectors: [[1, 0]] });
        assert.equal(getEventListeners(source.signal, 'abort').length, 0);
    });
}

for (const type of ['normal', 'regenerate', 'continue', 'swipe', 'impersonate']) {
    test(`${type}: one joined host gate survives 40 seconds of retries then commits once`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
        t.mock.method(performance, 'now', () => Date.now());
        const context = { chatId: 'fixture', chat: [] };
        const state = { prepares: 0, commits: 0, aborts: 0, failures: 0, notices: 0, visible: false };
        respond = signal => requests.length <= 10 ? stalled(signal) : success();
        const coordinator = mod.createRecallPrefetchCoordinator({
            getContext: () => context,
            prepare: async (_type, signal, _diagnostics, withQueryEmbedding) => {
                state.prepares++;
                return mod.embedRecallQuery(['fixture query'], config, { signal, withQueryEmbedding });
            },
            createRetryNotice: () => ({
                show() { state.notices++; state.visible = true; },
                clear() { state.visible = false; },
            }),
        });
        const dispatch = new AbortController();
        const { slot } = coordinator.join({ chatId: context.chatId, type, runContext: { signal: dispatch.signal } });
        const pending = mod.runRequiredRecall({ coordinator, run: slot,
            commit: value => { state.commits++; return value; },
            abort: () => state.aborts++, onFailure: () => state.failures++,
        });
        await flush();
        for (let attempt = 1; attempt <= 10; attempt++) {
            t.mock.timers.tick(3000);
            await flush();
            assert.equal(requests.length, attempt);
            assert.equal(state.commits, 0);
            assert.equal(state.aborts, 0);
            assert.equal(slot.controller.signal.aborted, false);
            assert.equal(dispatch.signal.aborted, false);
            if (attempt >= 8) assert.equal(state.visible, true);
            t.mock.timers.tick(1000);
            await flush();
        }
        assert.deepEqual(await pending, { ok: true, value: [[1, 0]] });
        assert.deepEqual(state, { prepares: 1, commits: 1, aborts: 0, failures: 0, notices: 1, visible: false });
        assert.equal(coordinator.getCurrent(), null);
        t.mock.timers.runAll();
        await flush();
        assert.equal(requests.length, 11);
    });
}

for (const phase of ['request', 'delay']) {
    test(`initiating continuation signal cancels the joined gate during ${phase} without a global stop`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
        t.mock.method(performance, 'now', () => Date.now());
        const source = new AbortController();
        let commits = 0, aborts = 0;
        respond = signal => stalled(signal);
        const coordinator = mod.createRecallPrefetchCoordinator({
            getContext: () => ({ chatId: 'fixture', chat: [] }),
            prepare: (_type, signal, _diagnostics, withQueryEmbedding) =>
                mod.embedRecallQuery(['fixture query'], config, { signal, withQueryEmbedding }),
        });
        const { slot } = coordinator.join({ chatId: 'fixture', type: 'continue', sourceSignal: source.signal });
        const pending = mod.runRequiredRecall({ coordinator, run: slot,
            commit: () => commits++, abort: () => aborts++,
        });
        await flush();
        if (phase === 'delay') { t.mock.timers.tick(3000); await flush(); }
        source.abort();
        assert.deepEqual(await pending, { ok: false });
        assert.equal(slot.cancelReason, 'generation-signal-aborted');
        assert.equal(commits, 0);
        assert.equal(aborts, 1);
        assert.equal(requests[0].options.signal.aborted, true);
        t.mock.timers.runAll();
        await flush();
        assert.equal(requests.length, 1);
    });
}

test('successful query makes one request and preserves validated vectors', async () => {
    assert.deepEqual(await query(), { vectors: [[1, 0]] });
    assert.equal(requests.length, 1);
    assert.equal(failures.length, 0);
});

test('a query timeout keeps overlapping floor work even when that work failed before the timeout', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let finishBackground;
    const background = mod.trackVectorActivity({ chatId: 'fixture', phase: 'l0-extraction', api: config.embeddingApi, unit: 'floors' }, async activity => {
        activity.update({ total: 1, activeUnits: 1, activeFloors: [30] });
        await new Promise(resolve => { finishBackground = resolve; });
        return { failed: 1 };
    });
    let trace;
    respond = signal => requests.length === 1 ? stalled(signal) : success();
    const pending = query({ onActivity: value => { trace = value; } });
    await flush();
    finishBackground();
    await background;
    t.mock.timers.tick(3000);
    await flush();
    t.mock.timers.tick(1000);
    assert.deepEqual(await pending, { vectors: [[1, 0]] });
    assert.ok(trace.timeline.some(entry => entry.activities.some(activity => activity.activeFloors.includes(30))));
    assert.ok(trace.timeline.some(entry => entry.activities.some(activity => activity.outcome?.failed === 1)));
    assert.deepEqual(trace.timeline.at(-1).activities, []);
    const before = structuredClone(trace);
    await mod.trackVectorActivity({ phase: 'later', unit: 'floors' }, async () => {});
    assert.deepEqual(trace, before);
});

test('an unexpected failure stops without an invented diagnosis or retry', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const cause = new Error('unexpected fixture failure');
    respond = () => { throw cause; };
    const pending = query();
    await flush();
    const { error } = await pending;
    assert.equal(error.cause, cause);
    assert.equal(mod.recallFailureNotice(null, error).reason, 'unknown');
    t.mock.timers.runAll();
    await flush();
    assert.equal(requests.length, 1);
});

const permanent = [
    ...[400, 401, 403, 404, 422, 429].map(status => ({
        name: `HTTP ${status}`, reason: status === 429 ? 'rate_limit' : [401, 403].includes(status) ? 'credentials' : 'http', status,
        prepare() { respond = () => new Response('{}', { status }); }, requests: 1,
    })),
    { name: 'missing key', reason: 'configuration', requests: 0, prepare() { config.embeddingApi.key = ''; } },
    { name: 'invalid URL', reason: 'configuration_url', requests: 0, prepare() { config.embeddingApi.url = 'not a URL'; } },
    { name: 'invalid JSON', reason: 'invalid_response', requests: 1, prepare() { respond = () => new Response('{'); } },
    { name: 'wrong vector count', reason: 'invalid_response', requests: 1,
        prepare() { respond = () => new Response(JSON.stringify({ data: [] })); } },
    { name: 'empty vector', reason: 'invalid_response', requests: 1,
        prepare() { respond = () => new Response(JSON.stringify({ data: [{ index: 0, embedding: [] }] })); } },
];
for (const entry of permanent) {
    test(`${entry.name} stops immediately with its actionable diagnosis`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        entry.prepare();
        let outcome;
        query().then(value => { outcome = value; });
        await flush();
        assert.ok(outcome?.error);
        assert.equal(outcome.error.code, 'RECALL_EMBEDDING_FAILED');
        assert.equal(outcome.error.errors.length, 1);
        assert.equal(outcome.error.cause, failures[0].error);
        const notice = mod.recallFailureNotice(null, outcome.error);
        assert.equal(notice.issueCode, 'recall_embedding_failed');
        assert.equal(notice.reason, entry.reason);
        assert.equal(notice.httpStatus, entry.status ?? null);
        assert.deepEqual(notice.timeouts, []);
        t.mock.timers.runAll();
        await flush();
        assert.equal(requests.length, entry.requests);
    });
}

for (const status of [408, 500, 503, 599, null]) {
    test(`${status == null ? 'network failure' : `HTTP ${status}`} waits one second then retries in the same call`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        respond = () => {
            if (requests.length === 2) return success();
            if (status == null) throw new TypeError('fixture network failure');
            return new Response('{}', { status });
        };
        let outcome;
        const pending = query().then(value => { outcome = value; });
        await flush();
        assert.equal(outcome, undefined);
        assert.equal(requests.length, 1);
        t.mock.timers.tick(999);
        await flush();
        assert.equal(requests.length, 1);
        t.mock.timers.tick(1);
        await pending;
        assert.deepEqual(outcome, { vectors: [[1, 0]] });
        assert.equal(requests.length, 2);
        assert.equal(failures.length, 1);
    });
}

for (const phase of ['headers', 'body']) {
    test(`${phase} timeout retries with a fresh 3-second deadline after every 1-second wait`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        respond = signal => requests.length === 11 ? success()
            : phase === 'headers' ? stalled(signal) : { ok: true, json: () => stalled(signal) };
        let outcome;
        const pending = query().then(value => { outcome = value; });
        await flush();
        for (let attempt = 1; attempt <= 10; attempt++) {
            t.mock.timers.tick(2999);
            await flush();
            assert.equal(outcome, undefined);
            assert.equal(failures.length, attempt - 1);
            t.mock.timers.tick(1);
            await flush();
            assert.equal(failures.length, attempt);
            assert.equal(failures.at(-1).attempt, attempt);
            assert.equal(failures.at(-1).error.embeddingFailure.kind, 'timeout');
            assert.equal(requests.length, attempt);
            t.mock.timers.tick(999);
            await flush();
            assert.equal(requests.length, attempt);
            t.mock.timers.tick(1);
            await flush();
            assert.equal(requests.length, attempt + 1);
            assert.notEqual(requests.at(-1).options.signal, requests.at(-2).options.signal);
            assert.equal(requests.at(-1).options.signal.aborted, false);
        }
        await pending;
        assert.deepEqual(outcome, { vectors: [[1, 0]] });
    });
}

test('a later permanent failure ends retries and reports that terminal cause', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    respond = signal => requests.length === 1 ? stalled(signal) : new Response('{}', { status: 401 });
    const pending = query();
    await flush();
    t.mock.timers.tick(3000);
    await flush();
    t.mock.timers.tick(1000);
    const { error } = await pending;
    assert.equal(error.code, 'RECALL_EMBEDDING_FAILED');
    assert.equal(mod.recallFailureNotice(null, error).reason, 'credentials');
    assert.equal(error.cause, failures.at(-1).error);
    assert.equal(requests.length, 2);
    assert.equal(requests[0].options.signal.aborted, true);
    assert.equal(requests[1].options.signal.aborted, false);
    assert.notEqual(requests[0].options.signal, requests[1].options.signal);
    assert.equal(failures[0].error.embeddingFailure.kind, 'timeout');
});

for (const phase of ['before', 'request', 'delay', 'later-request']) {
    test(`cancellation during ${phase} does not retry or become an Embedding failure`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const controller = new AbortController();
        if (phase === 'before') controller.abort();
        respond = signal => stalled(signal);
        const pending = query({ signal: controller.signal });
        await flush();
        if (phase === 'delay' || phase === 'later-request') {
            t.mock.timers.tick(3000);
            await flush();
            if (phase === 'later-request') {
                t.mock.timers.tick(1000);
                await flush();
            }
        }
        controller.abort();
        const { error } = await pending;
        assert.equal(error.name, 'AbortError');
        assert.notEqual(error.code, 'RECALL_EMBEDDING_FAILED');
        assert.equal(mod.recallFailureNotice('generation-stopped', error), null);
        assert.equal(failures.length, ['delay', 'later-request'].includes(phase) ? 1 : 0);
        t.mock.timers.runAll();
        await flush();
        assert.equal(requests.length, phase === 'before' ? 0 : phase === 'later-request' ? 2 : 1);
    });
}
