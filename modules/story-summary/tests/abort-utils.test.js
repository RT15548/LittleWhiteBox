import assert from 'node:assert/strict';
import test from 'node:test';

import {
    commitIfSignalActive,
    mergeAbortSignals,
    runWithAbortDeadline,
    waitForAbortableDelay,
} from '../../../shared/common/abort-utils.js';
import { createWorkerRpc } from '../vector/runtime/rpc.js';

test('merged abort signal preserves both cancellation sources', () => {
    const outer = new AbortController();
    const requestTimeout = new AbortController();
    const merged = mergeAbortSignals(outer.signal, requestTimeout.signal);

    assert.equal(merged.aborted, false);
    requestTimeout.abort();
    assert.equal(merged.aborted, true);
});

test('deadline abort blocks a late prompt commit', async () => {
    let releaseTask;
    let finishTask;
    const taskFinished = new Promise(resolve => { finishTask = resolve; });
    const target = {};

    const run = runWithAbortDeadline(async signal => {
        await new Promise(resolve => { releaseTask = resolve; });
        commitIfSignalActive(signal, () => {
            target.prompt = 'stale';
        });
        finishTask();
    }, {
        timeoutMs: 5,
        timeoutMessage: 'test deadline',
    });

    await assert.rejects(run, error => error?.name === 'AbortError');
    releaseTask();
    await taskFinished;
    assert.deepEqual(target, {});
});

test('external cancellation interrupts the deadline runner', async () => {
    const controller = new AbortController();
    let observedSignal = null;
    const run = runWithAbortDeadline(async signal => {
        observedSignal = signal;
        await new Promise(() => {});
    }, {
        controller,
        timeoutMs: 1000,
    });

    await Promise.resolve();
    controller.abort();
    await assert.rejects(run, error => error?.name === 'AbortError');
    assert.equal(observedSignal.aborted, true);
});

test('active signal permits one synchronous prompt commit', () => {
    const controller = new AbortController();
    const target = {};

    assert.equal(commitIfSignalActive(controller.signal, () => {
        target.prompt = 'current';
    }), true);
    assert.deepEqual(target, { prompt: 'current' });
});

test('abort interrupts a pending retry delay', async () => {
    const controller = new AbortController();
    const waiting = waitForAbortableDelay(1000, controller.signal);
    controller.abort();
    await assert.rejects(waiting, error => error?.name === 'AbortError');
});

test('abort removes a pending runtime worker request and ignores its late reply', async () => {
    const worker = {
        onmessage: null,
        onerror: null,
        lastMessage: null,
        postMessage(message) {
            this.lastMessage = message;
        },
    };
    const rpc = createWorkerRpc(worker);
    const controller = new AbortController();
    const pending = rpc.call('scoreL1', {}, {
        timeoutMs: 1000,
        signal: controller.signal,
    });

    controller.abort();
    await assert.rejects(pending, error => error?.name === 'AbortError');
    worker.onmessage({ data: { id: worker.lastMessage.id, ok: true, result: 'stale' } });
});
