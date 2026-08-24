import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createDrawRunClient,
    DRAW_RUNS_CAPABILITY,
    DrawRunClientError,
    hasDrawRunsCapability,
} from '../draw-run-client.js';

function jsonResponse(body, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        async text() { return JSON.stringify(body); },
    };
}

test('Draw Run list rejects malformed success responses instead of hiding them as an empty list', async () => {
    const client = createDrawRunClient({
        fetchImpl: async () => jsonResponse({ ok: true }),
    });
    await assert.rejects(
        client.listRuns(),
        error => error instanceof DrawRunClientError && error.code === 'draw_run_invalid_response',
    );
});

test('Draw Run response body interruption stays visible and retriable', async () => {
    const client = createDrawRunClient({
        fetchImpl: async () => ({
            ok: true,
            status: 200,
            async text() { throw new Error('socket closed'); },
        }),
    });
    await assert.rejects(
        client.listRuns(),
        error => error instanceof DrawRunClientError
            && error.code === 'draw_run_body_interrupted'
            && error.retriable === true,
    );
});

test('an already aborted Draw Run request never reaches fetch', async () => {
    let calls = 0;
    const client = createDrawRunClient({
        fetchImpl: async () => {
            calls += 1;
            return jsonResponse({ ok: true, runs: [] });
        },
    });
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
        client.listRuns({ signal: controller.signal }),
        error => error instanceof DrawRunClientError && error.code === 'draw_run_aborted',
    );
    assert.equal(calls, 0);
});

test('Draw Run ACK requires the protocol success envelope while keeping 404 idempotent', async () => {
    const malformed = createDrawRunClient({
        fetchImpl: async () => jsonResponse({}),
    });
    await assert.rejects(
        malformed.acknowledgeRun('run-1'),
        error => error instanceof DrawRunClientError && error.code === 'draw_run_invalid_response',
    );

    const missing = createDrawRunClient({
        fetchImpl: async () => jsonResponse(
            { ok: false, code: 'draw_run_not_found', error: 'missing' },
            { ok: false, status: 404 },
        ),
    });
    assert.equal(await missing.acknowledgeRun('run-1'), true);
});

test('Draw Run capability requires a ready backend that explicitly advertises the contract', () => {
    assert.equal(hasDrawRunsCapability({ ready: true, capabilities: [DRAW_RUNS_CAPABILITY] }), true);
    assert.equal(hasDrawRunsCapability({ ready: true, capabilities: [] }), false);
    assert.equal(hasDrawRunsCapability({ ready: false, capabilities: [DRAW_RUNS_CAPABILITY] }), false);
});

test('Draw Run cancel posts to the run-scoped endpoint and validates the returned run', async () => {
    const calls = [];
    const client = createDrawRunClient({
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return jsonResponse({ ok: true, run: { id: 'run-test-201', state: 'cancelling' } });
        },
    });
    const run = await client.cancelRun('run-test-201');
    assert.equal(run.id, 'run-test-201');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/plugins/littlewhitebox-image-jobs/v1/draw-runs/run-test-201/cancel');
    assert.equal(calls[0].options.method, 'POST');
});

test('Draw Run get and cancel reject a response for another run id', async () => {
    const client = createDrawRunClient({
        fetchImpl: async () => jsonResponse({ ok: true, run: { id: 'run-other' } }),
    });
    await assert.rejects(
        client.getRun('run-expected'),
        error => error instanceof DrawRunClientError && error.code === 'draw_run_invalid_response',
    );
    await assert.rejects(
        client.cancelRun('run-expected'),
        error => error instanceof DrawRunClientError && error.code === 'draw_run_invalid_response',
    );
});
