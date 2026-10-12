import assert from 'node:assert/strict';
import test from 'node:test';
import { DRAW_WORK_CANCELLATION_CAPABILITY } from '../backend-image-jobs.js';

import {
    createDrawRunClient as createClient,
    DRAW_RUNS_CAPABILITY,
    DRAW_RUN_RUNTIME_CAPABILITY,
    DrawRunClientError,
    hasDrawRunsCapability,
} from '../draw-run-client.js';

const createDrawRunClient = options => createClient({ getOwner: () => 'fixture', ...options });

function jsonResponse(body, { ok = true, status = 200 } = {}) {
    return {
        ok,
        status,
        async text() { return JSON.stringify(body); },
        async json() { return body; },
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
    await assert.rejects(
        client.cancelRun('not-requested', { signal: controller.signal }),
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
    assert.equal(hasDrawRunsCapability({
        ready: true,
        capabilities: [DRAW_RUNS_CAPABILITY, DRAW_RUN_RUNTIME_CAPABILITY, DRAW_WORK_CANCELLATION_CAPABILITY],
    }), true);
    assert.equal(hasDrawRunsCapability({ ready: true, capabilities: [DRAW_RUNS_CAPABILITY] }), false);
    assert.equal(hasDrawRunsCapability({ ready: true, capabilities: [DRAW_RUNS_CAPABILITY, DRAW_RUN_RUNTIME_CAPABILITY] }), false);
    // Released 2.2.0 builds own the planning schema and cannot accept planner.tool.
    assert.equal(hasDrawRunsCapability({
        ready: true, version: '2.2.0', capabilities: [DRAW_RUNS_CAPABILITY, 'draw-run-runtime-v3'],
    }), false);
    assert.equal(hasDrawRunsCapability({ ready: true, capabilities: [DRAW_RUN_RUNTIME_CAPABILITY] }), false);
    assert.equal(hasDrawRunsCapability({ ready: true, capabilities: [] }), false);
    assert.equal(hasDrawRunsCapability({
        ready: false,
        capabilities: [DRAW_RUNS_CAPABILITY, DRAW_RUN_RUNTIME_CAPABILITY],
    }), false);
});

test('Draw Run cancel uses the same fenced set protocol as manual image jobs', async () => {
    const calls = [];
    const client = createDrawRunClient({
        fetchImpl: async (url, options) => {
            calls.push({ url, options });
            return jsonResponse({ ok: true, run: { id: 'run-test-201', state: 'cancelling' } });
        },
    });
    const run = await client.cancelRun('run-test-201');
    assert.equal(run.id, 'run-test-201');
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, '/api/plugins/littlewhitebox-server/v1/cancel');
    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].options.body), { owner: 'fixture', jobIds: [], runIds: ['run-test-201'] });
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
