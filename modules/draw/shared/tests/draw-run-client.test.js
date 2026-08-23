import assert from 'node:assert/strict';
import test from 'node:test';

import { createDrawRunClient, DrawRunClientError } from '../draw-run-client.js';

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
