'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');

const { createAsyncImageJobManager } = require('../image-jobs/job-manager.js');

function createItem(name, overrides = {}) {
    return {
        kind: 'image',
        request: { name },
        timeout: 1000,
        ...overrides,
    };
}

async function waitFor(predicate, message = 'condition', timeout = 2000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const result = predicate();
        if (result) return result;
        await new Promise(resolve => setTimeout(resolve, 2));
    }
    assert.fail(`Timed out waiting for ${message}`);
}

function createManager(executeItem, options = {}) {
    let sequence = 0;
    const manager = createAsyncImageJobManager({
        adapters: {
            test: {
                execute: ({ owner, item, signal }) => executeItem({ owner, payload: item.request, signal }),
            },
        },
        retentionMs: 10_000,
        ...options,
    });
    const createJob = manager.createJob.bind(manager);
    manager.createJob = (request) => createJob({
        ...request,
        requestId: request.requestId || `job-${++sequence}`,
        provider: 'test',
        context: { key: request.key, insecure: request.insecure === true },
    });
    return manager;
}

test('runs one request per owner and rotates jobs after the owning job cooldown', async (t) => {
    const starts = [];
    let active = 0;
    let maxActive = 0;
    const manager = createManager(async ({ payload }) => {
        starts.push({ name: payload.name, at: Date.now() });
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise(resolve => setTimeout(resolve, 3));
        active--;
        return { buffer: Buffer.from(payload.name), mime: 'image/png' };
    });
    t.after(() => manager.close());

    const first = manager.createJob({
        owner: 'alice', key: 'secret-a', insecure: false, delay: { min: 12, max: 12 },
        items: [createItem('A1'), createItem('A2')],
    });
    const second = manager.createJob({
        owner: 'alice', key: 'secret-b', insecure: false, delay: { min: 12, max: 12 },
        items: [createItem('B1')],
    });

    await waitFor(
        () => manager.getJob('alice', first.id)?.state === 'completed'
            && manager.getJob('alice', second.id)?.state === 'completed',
        'both jobs to complete',
    );

    assert.deepEqual(starts.map(entry => entry.name), ['A1', 'B1', 'A2']);
    assert.equal(maxActive, 1);
    assert.ok(starts[1].at - starts[0].at >= 10, 'the first cooldown must delay the next upstream request');
    assert.ok(starts[2].at - starts[1].at >= 10, 'each started request must apply its own cooldown');
});

test('requeues a job before cooldown so later submissions cannot jump ahead', async (t) => {
    const starts = [];
    const manager = createManager(async ({ payload }) => {
        starts.push(payload.name);
        return { buffer: Buffer.from(payload.name), mime: 'image/png' };
    });
    t.after(() => manager.close());

    const first = manager.createJob({
        owner: 'alice', key: 'a', insecure: false, delay: { min: 20, max: 20 },
        items: [createItem('A1'), createItem('A2')],
    });
    await waitFor(() => manager.getJob('alice', first.id)?.state === 'cooldown', 'first job cooldown');
    const later = manager.createJob({
        owner: 'alice', key: 'b', insecure: false, delay: { min: 1, max: 1 },
        items: [createItem('B1')],
    });

    await waitFor(
        () => manager.getJob('alice', first.id)?.state === 'completed'
            && manager.getJob('alice', later.id)?.state === 'completed',
        'both jobs to complete',
    );
    assert.deepEqual(starts, ['A1', 'A2', 'B1']);
});

test('reports owner cooldown to a new batch submitted after the previous job completed', async (t) => {
    const manager = createManager(
        async ({ payload }) => ({ buffer: Buffer.from(payload.name), mime: 'image/png' }),
    );
    t.after(() => manager.close());

    const first = manager.createJob({
        owner: 'alice', delay: { min: 500, max: 500 }, items: [createItem('A1')],
    });
    await waitFor(() => manager.getJob('alice', first.id)?.state === 'completed', 'first job completion');
    const second = manager.createJob({
        owner: 'alice', delay: { min: 1, max: 1 }, items: [createItem('B1')],
    });
    const waiting = manager.getJob('alice', second.id);

    assert.equal(waiting.state, 'cooldown');
    assert.ok(waiting.cooldownUntil > Date.now());
});

test('different owners have independent schedulers', async (t) => {
    const waiting = new Map();
    const starts = [];
    const manager = createManager(({ owner }) => new Promise((resolve) => {
        starts.push(owner);
        waiting.set(owner, resolve);
    }));
    t.after(() => manager.close());

    const alice = manager.createJob({
        owner: 'alice', key: 'a', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('A')],
    });
    const bob = manager.createJob({
        owner: 'bob', key: 'b', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('B')],
    });

    await waitFor(() => waiting.size === 2, 'both owners to start');
    assert.deepEqual(new Set(starts), new Set(['alice', 'bob']));
    waiting.get('alice')({ buffer: Buffer.from('a'), mime: 'image/png' });
    waiting.get('bob')({ buffer: Buffer.from('b'), mime: 'image/png' });
    await waitFor(
        () => manager.getJob('alice', alice.id)?.state === 'completed'
            && manager.getJob('bob', bob.id)?.state === 'completed',
        'owner jobs to complete',
    );
});

test('bounds concurrent upstream requests across owners', async (t) => {
    const pending = [];
    let active = 0;
    let maxActive = 0;
    const manager = createManager(() => new Promise(resolve => {
        active++;
        maxActive = Math.max(maxActive, active);
        pending.push(() => {
            active--;
            resolve({ buffer: Buffer.from('ok'), mime: 'image/png' });
        });
    }), { maxConcurrentItems: 2 });
    t.after(() => manager.close());

    for (const owner of ['alice', 'bob', 'carol']) {
        manager.createJob({
            owner,
            key: owner,
            insecure: false,
            delay: { min: 1, max: 1 },
            items: [createItem(owner)],
        });
    }

    await waitFor(() => pending.length === 2, 'concurrency slots to fill');
    assert.equal(maxActive, 2);
    pending.shift()();
    await waitFor(() => pending.length === 2, 'waiting owner to start');
    assert.equal(maxActive, 2);
    for (const resolve of pending.splice(0)) resolve();
    await waitFor(() => [...manager.jobs.values()].every(job => job.state === 'completed'), 'all owners to complete');
});

test('records one item failure and continues the rest of the job', async (t) => {
    const starts = [];
    const manager = createManager(async ({ payload }) => {
        starts.push(payload.name);
        if (payload.name === 'bad') {
            const error = new Error('upstream rejected request');
            error.status = 422;
            throw error;
        }
        return { buffer: Buffer.from(payload.name), mime: 'image/png' };
    });
    t.after(() => manager.close());

    const job = manager.createJob({
        owner: 'alice', key: 'secret', insecure: true, delay: { min: 1, max: 1 },
        items: [createItem('bad'), createItem('good')],
    });
    const completed = await waitFor(
        () => manager.getJob('alice', job.id)?.state === 'completed' && manager.getJob('alice', job.id),
        'job to continue after failure',
    );

    assert.deepEqual(starts, ['bad', 'good']);
    assert.equal(completed.failed, 1);
    assert.equal(completed.ready, 1);
    assert.equal(completed.items[0].error.status, 422);
    const stored = [...manager.jobs.values()].find(candidate => candidate.id === job.id);
    assert.equal(stored.context, null);
    assert.deepEqual(stored.items.map(item => item.request), [null, null]);
});

test('cancel aborts the active item, preserves ready results, and ACK is idempotent', async (t) => {
    let secondStarted = false;
    const manager = createManager(async ({ payload, signal }) => {
        if (payload.name === 'first') return { buffer: Buffer.from('ready'), mime: 'image/png' };
        secondStarted = true;
        await new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => {
                const error = new Error('aborted');
                error.name = 'AbortError';
                reject(error);
            }, { once: true });
        });
        return { buffer: Buffer.alloc(0), mime: 'image/png' };
    });
    t.after(() => manager.close());

    const job = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 },
        items: [createItem('first'), createItem('second'), createItem('third')],
    });
    await waitFor(() => secondStarted, 'second item to start');
    const cancelled = manager.cancelJob('alice', job.id);
    assert.equal(cancelled.state, 'running');
    await waitFor(
        () => manager.getJob('alice', job.id)?.state === 'cancelled',
        'active cancellation to settle',
    );

    const status = manager.getJob('alice', job.id);
    assert.equal(status.ready, 1);
    assert.equal(status.cancelled, 2);
    assert.deepEqual(manager.getResult('alice', job.id, 0), {
        state: 'ready', buffer: Buffer.from('ready'), mime: 'image/png',
    });
    assert.deepEqual(manager.consumeResult('alice', job.id, 0), { ok: true, consumed: true });
    assert.deepEqual(manager.consumeResult('alice', job.id, 0), { ok: true, consumed: true });
    assert.equal(manager.getResult('alice', job.id, 0).state, 'consumed');
});

test('cancel removes a queued job without running it', async (t) => {
    let finishActive;
    const starts = [];
    const manager = createManager(({ payload }) => {
        starts.push(payload.name);
        return new Promise(resolve => {
            if (payload.name === 'active') finishActive = resolve;
        });
    });
    t.after(() => manager.close());
    const active = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('active')],
    });
    const queued = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('queued')],
    });
    await waitFor(() => typeof finishActive === 'function', 'first job to start');

    assert.equal(manager.cancelJob('alice', queued.id).state, 'cancelled');
    finishActive({ buffer: Buffer.from('ok'), mime: 'image/png' });
    await waitFor(() => manager.getJob('alice', active.id)?.state === 'completed', 'first job completion');
    assert.deepEqual(starts, ['active']);
    assert.equal(manager.getJob('alice', queued.id).items[0].state, 'cancelled');
});

test('timeout fails only the active item and ownership isolates every operation', async (t) => {
    const manager = createManager(async ({ payload, signal }) => {
        if (payload.name === 'slow') {
            await new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
        }
        return { buffer: Buffer.from(payload.name), mime: 'image/png' };
    });
    t.after(() => manager.close());

    const job = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 },
        items: [createItem('slow', { timeout: 10 }), createItem('next')],
    });
    const completed = await waitFor(
        () => manager.getJob('alice', job.id)?.state === 'completed' && manager.getJob('alice', job.id),
        'timed out job to continue',
    );

    assert.equal(completed.items[0].state, 'failed');
    assert.equal(completed.items[0].error.code, 'timeout');
    assert.equal(completed.items[1].state, 'ready');
    assert.equal(manager.getJob('bob', job.id), null);
    assert.equal(manager.getResult('bob', job.id, 1), null);
    assert.equal(manager.consumeResult('bob', job.id, 1), null);
    assert.equal(manager.cancelJob('bob', job.id), null);
    assert.equal(manager.deleteJob('bob', job.id), null);
});

test('terminal jobs expire with unconsumed result bytes', async (t) => {
    const manager = createManager(
        async () => ({ buffer: Buffer.alloc(32), mime: 'image/png' }),
        { retentionMs: 20 },
    );
    t.after(() => manager.close());

    const job = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('image')],
    });
    await waitFor(() => manager.getJob('alice', job.id)?.state === 'completed', 'job completion');
    assert.equal(manager.getResult('alice', job.id, 0).buffer.length, 32);
    assert.equal(manager.storedResultBytes, 32);
    await waitFor(() => manager.getJob('alice', job.id) === null, 'terminal job expiry');
    assert.equal(manager.storedResultBytes, 0);
});

test('deduplicates request IDs before applying retained-job limits', async (t) => {
    let executions = 0;
    const manager = createManager(async () => {
        executions++;
        return { buffer: Buffer.from('ok'), mime: 'image/png' };
    }, { maxJobsPerOwner: 1 });
    t.after(() => manager.close());
    const request = {
        owner: 'alice', requestId: 'request-1', key: 'secret', insecure: false,
        delay: { min: 1, max: 1 }, items: [createItem('image')],
    };

    const first = manager.createJob(request);
    const duplicate = manager.createJob(request);
    assert.equal(duplicate.id, first.id);
    assert.throws(
        () => manager.createJob({ ...request, items: [createItem('changed')] }),
        error => error?.status === 409 && error?.code === 'request_id_conflict',
    );
    assert.throws(
        () => manager.createJob({ ...request, requestId: 'request-2' }),
        error => error?.status === 429 && error?.code === 'job_limit',
    );
    await waitFor(() => manager.getJob('alice', first.id)?.state === 'completed', 'deduplicated job completion');
    assert.equal(executions, 1);
});

test('scopes identical request IDs to their owner', async (t) => {
    const manager = createManager(async ({ owner }) => ({ buffer: Buffer.from(owner), mime: 'image/png' }));
    t.after(() => manager.close());
    const request = {
        requestId: 'shared-request',
        key: 'secret',
        insecure: false,
        delay: { min: 1, max: 1 },
        items: [createItem('image')],
    };

    const alice = manager.createJob({ ...request, owner: 'alice' });
    const bob = manager.createJob({ ...request, owner: 'bob' });
    assert.equal(alice.id, 'shared-request');
    assert.equal(bob.id, 'shared-request');
    await waitFor(
        () => manager.getJob('alice', alice.id)?.state === 'completed'
            && manager.getJob('bob', bob.id)?.state === 'completed',
        'same request ID jobs to complete',
    );
    assert.equal(manager.getJob('carol', 'shared-request'), null);
});

test('bounds queued input memory and releases it at terminal state', async (t) => {
    let finish;
    const manager = createManager(
        () => new Promise(resolve => { finish = resolve; }),
        { maxJobInputBytes: 1024, maxStoredInputBytes: 260 },
    );
    t.after(() => manager.close());
    const request = {
        owner: 'alice',
        key: 'secret',
        insecure: false,
        delay: { min: 1, max: 1 },
        items: [createItem('small')],
    };

    const job = manager.createJob(request);
    await waitFor(() => typeof finish === 'function', 'input-limited job to start');
    assert.ok(manager.storedInputBytes > 0);
    assert.throws(
        () => manager.createJob({ ...request, owner: 'bob' }),
        error => error?.status === 429 && error?.code === 'job_input_limit',
    );
    finish({ buffer: Buffer.from('ok'), mime: 'image/png' });
    await waitFor(() => manager.getJob('alice', job.id)?.state === 'completed', 'input-limited job completion');
    assert.equal(manager.storedInputBytes, 0);
});

test('truncates retained upstream error summaries', async (t) => {
    const manager = createManager(async () => {
        const error = new Error('x'.repeat(10_000));
        error.code = 'y'.repeat(1000);
        throw error;
    });
    t.after(() => manager.close());
    const job = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('bad')],
    });

    const completed = await waitFor(
        () => manager.getJob('alice', job.id)?.state === 'completed' && manager.getJob('alice', job.id),
        'failed job completion',
    );
    assert.equal(completed.items[0].error.code.length, 128);
    assert.equal(completed.items[0].error.message.length, 2048);
});

test('fails an item instead of retaining results above the global byte budget', async (t) => {
    const manager = createManager(
        async () => ({ buffer: Buffer.alloc(4), mime: 'image/png' }),
        { maxStoredResultBytes: 3 },
    );
    t.after(() => manager.close());
    const job = manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 1, max: 1 }, items: [createItem('large')],
    });

    const completed = await waitFor(
        () => manager.getJob('alice', job.id)?.state === 'completed' && manager.getJob('alice', job.id),
        'storage-limited job completion',
    );
    assert.equal(completed.items[0].state, 'failed');
    assert.equal(completed.items[0].error.code, 'result_storage_limit');
    assert.equal(manager.storedResultBytes, 0);
});

test('ACK releases retained result bytes before deleting the job', async (t) => {
    const manager = createManager(async () => ({ buffer: Buffer.alloc(4), mime: 'image/png' }));
    t.after(() => manager.close());
    const job = manager.createJob({
        owner: 'alice', delay: { min: 1, max: 1 }, items: [createItem('image')],
    });
    await waitFor(() => manager.getJob('alice', job.id)?.state === 'completed', 'job completion');

    assert.equal(manager.storedResultBytes, 4);
    assert.deepEqual(manager.consumeResult('alice', job.id, 0), { ok: true, consumed: true });
    assert.equal(manager.storedResultBytes, 0);
});

test('close cannot recreate timers or retain a late executor result', async () => {
    let finish;
    const manager = createManager(() => new Promise(resolve => { finish = resolve; }));
    manager.createJob({
        owner: 'alice', key: 'secret', insecure: false, delay: { min: 10, max: 10 }, items: [createItem('late')],
    });
    await waitFor(() => typeof finish === 'function', 'executor start');

    manager.close();
    finish({ buffer: Buffer.from('late'), mime: 'image/png' });
    await new Promise(resolve => setTimeout(resolve, 5));

    assert.equal(manager.jobs.size, 0);
    assert.equal(manager.schedulers.size, 0);
    assert.equal(manager.storedInputBytes, 0);
    assert.equal(manager.storedResultBytes, 0);
});
