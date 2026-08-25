import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createImageBackendJobMonitorRegistry,
    createImageBackendJobsClient,
    fetchImageBackendJobsStatus,
    hasImageBackendJobsCapability,
    IMAGE_BATCH_JOBS_CAPABILITY,
    reportImageBackendJobState,
} from '../backend-image-jobs.js';

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

// runJob 在终态且没有保留结果时会删除整个 job，所有跑到终态的 mock 都要认这一步。
function isJobCleanupDelete(url, options) {
    return url.endsWith('/v1/jobs/job-1') && options.method === 'DELETE';
}

function jobStatus(state, items, overrides = {}) {
    return {
        ok: true,
        job: {
            id: 'job-1',
            state,
            total: items.length,
            ready: items.filter(item => item.state === 'ready').length,
            failed: items.filter(item => item.state === 'failed').length,
            cancelled: items.filter(item => item.state === 'cancelled').length,
            queueAhead: 0,
            cooldownUntil: null,
            items,
            ...overrides,
        },
    };
}

test('recognizes the batch jobs capability without guessing from version', () => {
    assert.equal(hasImageBackendJobsCapability({
        ready: true,
        version: '99.0.0',
        capabilities: [IMAGE_BATCH_JOBS_CAPABILITY],
    }), true);
    assert.equal(hasImageBackendJobsCapability({ ready: true, version: '1.3.0', capabilities: [] }), false);
    assert.equal(hasImageBackendJobsCapability({ ready: false, capabilities: [IMAGE_BATCH_JOBS_CAPABILITY] }), false);
});

test('reports backend delivery, reconnecting, and cancellation as distinct observable states', () => {
    const states = [];
    reportImageBackendJobState((state, data) => states.push({ state, data }), 'status', {
        job: jobStatus('completed', [{ index: 0, state: 'ready' }]).job,
    });
    reportImageBackendJobState((state, data) => states.push({ state, data }), 'reconnecting');
    reportImageBackendJobState((state, data) => states.push({ state, data }), 'status', {
        abortRequested: true,
    });
    assert.deepEqual(states, [
        { state: 'delivering', data: { total: 1 } },
        { state: 'reconnecting', data: {} },
        { state: 'cancelling', data: { abortRequested: true } },
    ]);
});

test('one create request delivers and acknowledges every ready item', async () => {
    let creates = 0;
    let statusReads = 0;
    const resultReads = [];
    const acknowledgements = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            creates++;
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 2, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1') && (!options.method || options.method === 'GET')) {
            statusReads++;
            if (statusReads === 1) {
                return jsonResponse(jobStatus('running', [
                    { index: 0, state: 'running', transport: 'legacy-image' },
                    { index: 1, state: 'queued', transport: 'msgpack-stream' },
                ]));
            }
            return jsonResponse(jobStatus('completed', [
                { index: 0, state: 'ready', transport: 'legacy-image' },
                { index: 1, state: 'ready', transport: 'msgpack-stream' },
            ]));
        }
        const resultMatch = /\/results\/(\d+)$/.exec(url);
        if (resultMatch && options.method === 'DELETE') {
            acknowledgements.push(Number(resultMatch[1]));
            return jsonResponse({ ok: true, state: 'consumed' });
        }
        if (resultMatch) {
            const index = Number(resultMatch[1]);
            resultReads.push(index);
            return new Response(Uint8Array.from([index + 1]), {
                status: 200,
                headers: { 'Content-Type': index === 0 ? 'image/png' : 'application/vnd.littlewhitebox.novelai-msgpack' },
            });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const received = [];
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}, {}] }, {
        onItemReady: async ({ index, response }) => {
            received.push({ index, bytes: [...new Uint8Array(await response.arrayBuffer())] });
        },
    });

    assert.equal(creates, 1);
    assert.deepEqual(resultReads, [0, 1]);
    assert.deepEqual(acknowledgements, [0, 1]);
    assert.deepEqual(received, [{ index: 0, bytes: [1] }, { index: 1, bytes: [2] }]);
    assert.equal(outcome.job.state, 'completed');
});

test('awaits asynchronous state observers before advancing the job lifecycle', async () => {
    const order = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 0, createdAt: 1 } }, 202);
        }
        if (url.endsWith('/v1/jobs/job-1') && (!options.method || options.method === 'GET')) {
            order.push('status-read');
            return jsonResponse(jobStatus('completed', []));
        }
        if (isJobCleanupDelete(url, options)) {
            order.push('delete');
            return jsonResponse({ ok: true });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    await client.runJob({ items: [] }, {
        async onStateChange(state) {
            order.push(`${state}:start`);
            await new Promise(resolve => setTimeout(resolve, 5));
            order.push(`${state}:end`);
        },
    });

    assert.deepEqual(order, [
        'created:start',
        'created:end',
        'status-read',
        'status:start',
        'status:end',
        'delete',
    ]);
});

test('visibilitychange wakes a throttled poll immediately', async () => {
    const documentRef = new EventTarget();
    documentRef.visibilityState = 'hidden';
    let statusReads = 0;
    let firstStatusRead;
    const firstStatus = new Promise(resolve => { firstStatusRead = resolve; });
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            if (statusReads === 1) {
                firstStatusRead();
                return jsonResponse(jobStatus('running', [{ index: 0, state: 'running', transport: 'legacy-image' }]));
            }
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'failed', transport: 'legacy-image' }]));
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, documentRef, pollInterval: 10_000 });
    const pending = client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] });

    await firstStatus;
    documentRef.visibilityState = 'visible';
    documentRef.dispatchEvent(new Event('visibilitychange'));
    const outcome = await Promise.race([
        pending,
        new Promise((_, reject) => setTimeout(() => reject(new Error('visibility poll did not wake')), 200)),
    ]);

    assert.equal(statusReads, 2);
    assert.equal(outcome.job.state, 'completed');
});

test('retries transient polling and ACK failures without delivering an image twice', async () => {
    let statusReads = 0;
    let resultReads = 0;
    let ackAttempts = 0;
    let deliveries = 0;
    const states = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            if (statusReads === 1) throw new TypeError('network offline');
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
        }
        if (url.endsWith('/results/0') && options.method === 'DELETE') {
            ackAttempts++;
            if (ackAttempts === 1) throw new TypeError('ack connection lost');
            return jsonResponse({ ok: true, state: 'consumed' });
        }
        if (url.endsWith('/results/0')) {
            resultReads++;
            return new Response(Uint8Array.from([1]), { status: 200, headers: { 'Content-Type': 'image/png' } });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onStateChange: state => states.push(state),
        onItemReady: async ({ response }) => {
            await response.arrayBuffer();
            deliveries++;
        },
    });

    assert.ok(states.filter(state => state === 'reconnecting').length >= 2);
    assert.equal(resultReads, 1);
    assert.equal(deliveries, 1);
    assert.equal(ackAttempts, 2);
});

test('recovers an idempotent create when the first response is lost', async () => {
    const requestIds = [];
    let creates = 0;
    const states = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            creates++;
            requestIds.push(JSON.parse(options.body).requestId);
            if (creates === 1) throw new TypeError('response lost');
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'failed', transport: 'legacy-image' }]));
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({
        fetchImpl,
        pollInterval: 1,
        createRequestId: () => 'request-1',
    });

    await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onStateChange: state => states.push(state),
    });

    assert.equal(creates, 2);
    assert.deepEqual(requestIds, ['request-1', 'request-1']);
    assert.ok(states.includes('reconnecting'));
});

test('cancels by request ID when abort follows a lost create response', async () => {
    const controller = new AbortController();
    let creates = 0;
    let cancelRequests = 0;
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            creates++;
            throw new TypeError('response lost');
        }
        if (url.endsWith('/v1/jobs/request-abort/cancel')) {
            cancelRequests++;
            return jsonResponse(jobStatus('cancelled', [
                { index: 0, state: 'cancelled', transport: 'legacy-image' },
            ], { id: 'request-abort' }));
        }
        if (url.endsWith('/v1/jobs/request-abort')) {
            return jsonResponse(jobStatus('cancelled', [
                { index: 0, state: 'cancelled', transport: 'legacy-image' },
            ], { id: 'request-abort' }));
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({
        fetchImpl,
        pollInterval: 1,
        createRequestId: () => 'request-abort',
    });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        signal: controller.signal,
        onStateChange: state => {
            if (state === 'reconnecting') controller.abort();
        },
    });

    assert.equal(creates, 1);
    assert.equal(cancelRequests, 1);
    assert.equal(outcome.abortRequested, true);
    assert.equal(outcome.job.state, 'cancelled');
});

test('keeps an uncertain create recoverable when cancel-by-request-id initially returns 404', async () => {
    const controller = new AbortController();
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        createRequestId: () => 'request-race',
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs') && options.method === 'POST') throw new TypeError('response lost');
            if (url.endsWith('/v1/jobs/request-race/cancel')) {
                return jsonResponse({ ok: false, error: 'not found' }, 404);
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    await assert.rejects(client.runJob({ items: [{}] }, {
        cancelSignal: controller.signal,
        onStateChange(state) {
            if (state === 'reconnecting') controller.abort();
        },
    }), error => error?.detached === true && error?.jobId === 'request-race');
});

test('keeps an uncertain create recoverable when cancellation is rejected', async () => {
    const controller = new AbortController();
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        createRequestId: () => 'request-rejected-cancel',
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs') && options.method === 'POST') throw new TypeError('response lost');
            if (url.endsWith('/v1/jobs/request-rejected-cancel/cancel')) {
                return jsonResponse({ ok: false, error: 'cancel rejected' }, 400);
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    await assert.rejects(client.runJob({ items: [{}] }, {
        cancelSignal: controller.signal,
        onStateChange(state) {
            if (state === 'reconnecting') controller.abort();
        },
    }), error => error?.detached === true && error?.jobId === 'request-rejected-cancel');
});

test('treats consumed as success when an ACK response was lost', async () => {
    let statusReads = 0;
    let deliveries = 0;
    let settled = 0;
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            return jsonResponse(jobStatus('completed', [{
                index: 0,
                state: statusReads === 1 ? 'ready' : 'consumed',
                transport: 'legacy-image',
            }]));
        }
        if (url.endsWith('/results/0') && options.method === 'DELETE') {
            throw new TypeError('ACK response lost after consumption');
        }
        if (url.endsWith('/results/0')) {
            return new Response(Uint8Array.from([1]), { status: 200, headers: { 'Content-Type': 'image/png' } });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemReady: async ({ response }) => {
            await response.arrayBuffer();
            deliveries++;
        },
        onItemSettled: async () => { settled++; },
    });

    assert.equal(outcome.job.items[0].state, 'consumed');
    assert.equal(deliveries, 1);
    assert.equal(settled, 0);
});

test('acknowledges a discarded decode result after its failure is persisted', async () => {
    let acknowledgements = 0;
    let settled = 0;
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (url.endsWith('/v1/jobs/job-1') && options.method === 'DELETE') {
            return jsonResponse({ ok: true });
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'msgpack-stream' }]));
        }
        if (url.endsWith('/results/0') && options.method === 'DELETE') {
            acknowledgements++;
            return jsonResponse({ ok: true, state: 'consumed' });
        }
        if (url.endsWith('/results/0')) {
            return new Response(Uint8Array.from([1]), { status: 200 });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });
    const decodeError = new Error('invalid stream');
    decodeError.discardBackendResult = true;

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemReady: async () => { throw decodeError; },
        onItemSettled: async ({ error }) => {
            assert.equal(error, decodeError);
            settled++;
        },
    });

    assert.equal(acknowledgements, 1);
    assert.equal(settled, 1);
    assert.equal(outcome.deliveryErrors.size, 0, '已持久化失败卡的解码错误不再属于未交付结果');
});

test('settles a discarded result when the ACK succeeded but its response was lost', async () => {
    let statusReads = 0;
    let deliveries = 0;
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            return jsonResponse(jobStatus('completed', [{
                index: 0,
                state: statusReads === 1 ? 'ready' : 'consumed',
                transport: 'msgpack-stream',
            }]));
        }
        if (url.endsWith('/results/0') && options.method === 'DELETE') {
            throw new TypeError('ACK response lost after consumption');
        }
        if (url.endsWith('/results/0')) {
            return new Response(Uint8Array.from([1]), { status: 200 });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });
    const decodeError = new Error('invalid stream');
    decodeError.discardBackendResult = true;

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemReady: async () => {
            deliveries++;
            throw decodeError;
        },
        onItemSettled: async () => {},
    });

    assert.equal(statusReads, 2);
    assert.equal(deliveries, 1);
    assert.equal(outcome.job.items[0].state, 'consumed');
    assert.equal(outcome.deliveryErrors.size, 0);
});

test('does not retry retained-job quota errors', async () => {
    let attempts = 0;
    const client = createImageBackendJobsClient({
        fetchImpl: async () => {
            attempts++;
            return jsonResponse({ ok: false, error: 'Too many retained image jobs', code: 'job_limit' }, 429);
        },
        pollInterval: 1,
    });

    await assert.rejects(
        client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }),
        error => error?.code === 'job_limit' && error?.status === 429 && error?.retriable === false,
    );
    assert.equal(attempts, 1);
});

test('bounds consecutive connection retries and preserves the original cause', async () => {
    let attempts = 0;
    const original = new TypeError('network offline');
    const client = createImageBackendJobsClient({
        fetchImpl: async () => {
            attempts++;
            throw original;
        },
        pollInterval: 1,
        maxConsecutiveRetries: 2,
    });

    await assert.rejects(
        client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }),
        error => error?.code === 'backend_job_retry_exhausted'
            && error?.cause?.code === 'backend_job_unreachable'
            && error.cause.cause === original,
    );
    assert.equal(attempts, 3);
});

test('does not misclassify request construction errors as network failures', async () => {
    const constructionError = new TypeError('invalid headers');
    let attempts = 0;
    const client = createImageBackendJobsClient({
        fetchImpl: async () => { attempts++; return jsonResponse({ ok: true }); },
        getHeaders: () => { throw constructionError; },
    });

    await assert.rejects(
        client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }),
        error => error === constructionError,
    );
    assert.equal(attempts, 0);
});

test('finishes monitoring when persistence of a backend failure also fails', async () => {
    const persistenceError = new Error('database unavailable');
    const client = createImageBackendJobsClient({
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs') && options.method === 'POST') {
                return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
            }
            if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
            if (url.endsWith('/v1/jobs/job-1')) {
                return jsonResponse(jobStatus('completed', [{ index: 0, state: 'failed', error: { message: 'upstream failed' } }]));
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemSettled: async () => { throw persistenceError; },
    });

    assert.equal(outcome.job.state, 'completed');
    assert.equal(outcome.deliveryErrors.get(0), persistenceError);
});

test('keeps a detached job alive when the local connection dies instead of cancelling it', async () => {
    const destructive = [];
    const states = [];
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs/job-1/cancel') || isJobCleanupDelete(url, options)) {
                destructive.push(`${options.method || 'GET'} ${url}`);
                return jsonResponse({ ok: true });
            }
            if (url.endsWith('/v1/jobs/job-1')) throw new TypeError('network down');
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    await assert.rejects(
        client.attachJob('job-1', { onStateChange: state => states.push(state) }),
        error => error?.code === 'backend_job_retry_exhausted'
            && error?.jobId === 'job-1'
            && error?.detached === true,
    );
    // 后端任务仍在跑，取消或删除会毁掉唯一一份结果，必须留给重连接回或 TTL 回收。
    assert.deepEqual(destructive, []);
    assert.ok(states.includes('detached'));
});

test('keeps cancellation intent recoverable when the backend never confirms cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    let cancelRequests = 0;
    let deleteRequests = 0;
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs/job-1/cancel')) {
                cancelRequests++;
                return jsonResponse(jobStatus('running', [{ index: 0, state: 'running' }]));
            }
            if (isJobCleanupDelete(url, options)) {
                deleteRequests++;
                return jsonResponse({ ok: true });
            }
            if (url.endsWith('/v1/jobs/job-1')) return jsonResponse({ ok: false, error: 'invalid status' }, 400);
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    await assert.rejects(
        client.attachJob('job-1', { signal: controller.signal }),
        error => error?.status === 400 && error?.jobId === 'job-1' && error?.detached === true,
    );
    assert.equal(cancelRequests, 1);
    assert.equal(deleteRequests, 0);
});


test('capability probing exits immediately when its signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    let requests = 0;

    await assert.rejects(
        fetchImageBackendJobsStatus({
            signal: controller.signal,
            fetchImpl: async () => { requests++; return jsonResponse({ ok: true }); },
        }),
        error => error?.name === 'AbortError',
    );
    assert.equal(requests, 0);
});

test('detach stops local monitoring without cancelling or deleting the backend job', async () => {
    const controller = new AbortController();
    const destructive = [];
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/cancel') || isJobCleanupDelete(url, options)) {
                destructive.push(`${options.method || 'GET'} ${url}`);
                return jsonResponse({ ok: true });
            }
            if (url.endsWith('/v1/jobs/job-1')) {
                return jsonResponse(jobStatus('running', [{ index: 0, state: 'running' }]));
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    await assert.rejects(client.attachJob('job-1', {
        detachSignal: controller.signal,
        onStateChange(state) {
            if (state === 'status') controller.abort();
        },
    }), error => error?.detached === true && error?.code === 'backend_job_detached');

    assert.deepEqual(destructive, []);
});

test('provider monitor registry detaches every active scope and disposes completed scopes', () => {
    const registry = createImageBackendJobMonitorRegistry();
    const first = registry.createScope();
    const second = registry.createScope();
    first.dispose();

    registry.detachAll();

    assert.equal(first.signal.aborted, false);
    assert.equal(second.signal.aborted, true);
});

test('provider monitor registry rejects stale operations after cleanup and reactivation', () => {
    const registry = createImageBackendJobMonitorRegistry();
    const oldGeneration = registry.captureGeneration();
    registry.deactivate();
    registry.activate();

    const stale = registry.createScope(null, oldGeneration);
    const current = registry.createScope(null, registry.captureGeneration());

    assert.equal(stale.signal.aborted, true);
    assert.equal(current.signal.aborted, false);
    current.dispose();
});

test('provider teardown detach wins over a simultaneous caller cancellation', async () => {
    const registry = createImageBackendJobMonitorRegistry();
    const scope = registry.createScope();
    const cancel = new AbortController();
    let requests = 0;
    registry.deactivate();
    cancel.abort();
    const client = createImageBackendJobsClient({
        fetchImpl: async () => {
            requests++;
            throw new Error('no request expected');
        },
    });

    await assert.rejects(client.attachJob('job-1', {
        cancelSignal: cancel.signal,
        detachSignal: scope.signal,
    }), error => error?.detached === true && error?.code === 'backend_job_detached');
    assert.equal(requests, 0);
});

test('a deferred delivery preserves the result without ACK or job deletion', async () => {
    const requests = [];
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            requests.push(`${options.method || 'GET'} ${url}`);
            if (url.endsWith('/v1/jobs/job-1')) {
                return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
            }
            if (url.endsWith('/results/0')) return new Response(Uint8Array.from([1]), { status: 200 });
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });
    const unavailable = new Error('chat unavailable');
    unavailable.preserveBackendResult = true;

    const outcome = await client.attachJob('job-1', {
        onItemReady: async () => { throw unavailable; },
    });

    assert.deepEqual([...outcome.preserved], [0]);
    assert.equal(outcome.deliveryErrors.get(0), unavailable);
    assert.equal(requests.some(request => request.startsWith('DELETE ')), false);
});

test('irreversible requests are fenced and a failed submit fence sends no POST', async () => {
    let requests = 0;
    const client = createImageBackendJobsClient({
        fetchImpl: async () => {
            requests++;
            throw new Error('request must not be sent');
        },
    });
    const lost = new Error('lease lost');

    await assert.rejects(client.runJob({ items: [{}] }, {
        requestId: 'fenced-request',
        beforeIrreversible: async () => { throw lost; },
    }), error => error === lost);
    assert.equal(requests, 0);
});

test('retries a status request that exceeds the client request timeout', async () => {
    let statusReads = 0;
    const states = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            if (statusReads === 1) {
                return new Promise((resolve, reject) => {
                    options.signal.addEventListener('abort', () => reject(new Error('request timed out')), { once: true });
                });
            }
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'failed', transport: 'legacy-image' }]));
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1, requestTimeout: 5 });

    await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onStateChange: state => states.push(state),
    });

    assert.equal(statusReads, 2);
    assert.ok(states.includes('reconnecting'));
});

test('AbortSignal cancels the backend job but still collects ready results', async () => {
    const controller = new AbortController();
    let cancelRequests = 0;
    let deliveries = 0;
    const settled = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 2, createdAt: 1 } }, 202);
        }
        if (url.endsWith('/cancel')) {
            cancelRequests++;
            return jsonResponse(jobStatus('cancelled', [
                { index: 0, state: 'ready', transport: 'legacy-image' },
                { index: 1, state: 'cancelled', transport: 'legacy-image' },
            ]));
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            return jsonResponse(jobStatus('cancelled', [
                { index: 0, state: 'ready', transport: 'legacy-image' },
                { index: 1, state: 'cancelled', transport: 'legacy-image' },
            ]));
        }
        if (url.endsWith('/results/0') && options.method === 'DELETE') {
            return jsonResponse({ ok: true, state: 'consumed' });
        }
        if (url.endsWith('/results/0')) {
            return new Response(Uint8Array.from([1]), { status: 200, headers: { 'Content-Type': 'image/png' } });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}, {}] }, {
        signal: controller.signal,
        onStateChange: (state) => {
            if (state === 'created') controller.abort();
        },
        onItemReady: async ({ response }) => {
            await response.arrayBuffer();
            deliveries++;
        },
        onItemSettled: async item => settled.push(item),
    });

    assert.equal(cancelRequests, 1);
    assert.equal(deliveries, 1);
    assert.equal(settled.some(item => item.index === 1 && item.state === 'cancelled'), true);
    assert.equal(outcome.abortRequested, true);
});

test('treats an interrupted status body as a retriable connection failure', async () => {
    let statusReads = 0;
    const states = [];
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            if (statusReads === 1) {
                // 响应头已到、正文中断：这在浏览器里表现为 response.json() reject。
                return new Response(new ReadableStream({
                    start(controller) { controller.error(new Error('network reset while reading body')); },
                }), { status: 200, headers: { 'Content-Type': 'application/json' } });
            }
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'failed', transport: 'legacy-image' }]));
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onStateChange: state => states.push(state),
    });

    assert.equal(statusReads, 2);
    assert.ok(states.includes('reconnecting'));
    assert.equal(outcome.job.state, 'completed');
});

test('keeps a run successful when acknowledging an already delivered image fails permanently', async () => {
    let ackAttempts = 0;
    let deliveries = 0;
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
        }
        if (url.endsWith('/results/0') && options.method === 'DELETE') {
            ackAttempts++;
            return jsonResponse({ ok: false, error: 'job not found' }, 404);
        }
        if (url.endsWith('/results/0')) {
            return new Response(Uint8Array.from([7]), { status: 200, headers: { 'Content-Type': 'image/png' } });
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemReady: async ({ response }) => { await response.arrayBuffer(); deliveries++; },
    });

    assert.equal(deliveries, 1);
    assert.equal(ackAttempts, 1);
    assert.equal(outcome.job.state, 'completed');
    assert.equal(outcome.deliveryErrors.size, 0);
});

test('skips a result the backend reports as ready but no longer serves', async () => {
    let statusReads = 0;
    let resultReads = 0;
    let deliveries = 0;
    const fetchImpl = async (url, options = {}) => {
        if (url.endsWith('/v1/jobs') && options.method === 'POST') {
            return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
        }
        if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
        if (url.endsWith('/v1/jobs/job-1')) {
            statusReads++;
            return jsonResponse(jobStatus(statusReads === 1 ? 'running' : 'completed', [
                { index: 0, state: statusReads === 1 ? 'ready' : 'consumed', transport: 'legacy-image' },
            ]));
        }
        if (url.endsWith('/results/0') && (!options.method || options.method === 'GET')) {
            resultReads++;
            return jsonResponse({ ok: false, state: 'consumed', error: 'Image result was already consumed' }, 410);
        }
        throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
    };
    const client = createImageBackendJobsClient({ fetchImpl, pollInterval: 1 });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemReady: async () => { deliveries++; },
    });

    assert.equal(resultReads, 1);
    assert.equal(deliveries, 0);
    assert.equal(outcome.job.state, 'completed');
});

test('does not launch a second cleanup flow when cancellation remains unconfirmed', async () => {
    const controller = new AbortController();
    controller.abort();
    let deleteRequests = 0;
    let cancelRequests = 0;
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        maxConsecutiveRetries: 2,
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs/job-1/cancel')) {
                cancelRequests++;
                return jsonResponse(jobStatus('running', [{ index: 0, state: 'running' }]));
            }
            if (isJobCleanupDelete(url, options)) {
                deleteRequests++;
                return jsonResponse({ ok: true });
            }
            if (url.endsWith('/v1/jobs/job-1')) {
                // 任务始终停在 running：取消请求成功，但后端从未落到终态。
                return jsonResponse(jobStatus('running', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
            }
            if (url.endsWith('/results/0')) {
                return jsonResponse({ ok: false, error: 'permanently broken' }, 400);
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    await assert.rejects(
        client.attachJob('job-1', { signal: controller.signal }),
        error => error?.status === 400 && error?.jobId === 'job-1' && error?.detached === true,
    );

    assert.equal(cancelRequests, 1);
    assert.equal(deleteRequests, 0);
});

test('reports the root delivery failure even when persisting that failure also fails', async () => {
    const decodeError = new Error('无法解码后端图片结果');
    const persistenceError = new Error('database unavailable');
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            if (url.endsWith('/v1/jobs') && options.method === 'POST') {
                return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
            }
            if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
            if (url.endsWith('/v1/jobs/job-1')) {
                return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
            }
            if (url.endsWith('/results/0') && options.method === 'DELETE') {
                return jsonResponse({ ok: true, state: 'consumed' });
            }
            if (url.endsWith('/results/0')) {
                return new Response(Uint8Array.from([1]), { status: 200, headers: { 'Content-Type': 'image/png' } });
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    const originalError = console.error;
    console.error = () => {};
    let outcome;
    try {
        outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
            onItemReady: async () => { throw decodeError; },
            onItemSettled: async () => { throw persistenceError; },
        });
    } finally {
        console.error = originalError;
    }

    // 根因是解码失败，落库失败不得把它覆盖掉。
    assert.equal(outcome.deliveryErrors.get(0), persistenceError);
});

// 后端结果是已付费生成的唯一副本。调用方没能把它落库时，ACK 和 deleteJob 都会释放它，
// 因此两者都必须让路给 TTL —— 否则用户只剩下一个失败占位符。
test('keeps the backend job when the caller could not persist a delivered image', async () => {
    const persistenceError = new Error('indexeddb write failed');
    const requests = [];
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            requests.push(`${options.method || 'GET'} ${url.replace(/^.*\/v1\/jobs/, '')}`);
            if (url.endsWith('/v1/jobs') && options.method === 'POST') {
                return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
            }
            if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
            if (url.endsWith('/v1/jobs/job-1')) {
                return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
            }
            // ACK 与 deleteJob 都放行，靠下面的请求断言证明客户端根本没有发出它们。
            if (url.endsWith('/results/0') && options.method === 'DELETE') {
                return jsonResponse({ ok: true, state: 'consumed' });
            }
            if (url.endsWith('/results/0')) {
                return new Response(Uint8Array.from([1]), { status: 200, headers: { 'Content-Type': 'image/png' } });
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnings.push(args.map(String).join(' '));
    let outcome;
    try {
        outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
            onItemReady: async () => { throw persistenceError; },
            onItemSettled: async () => {},
        });
    } finally {
        console.warn = originalWarn;
    }

    assert.deepEqual([...outcome.preserved], [0]);
    assert.equal(outcome.deliveryErrors.get(0), persistenceError);
    assert.equal(requests.some(entry => entry === 'DELETE /job-1/results/0'), false);
    assert.equal(requests.some(entry => entry === 'DELETE /job-1'), false);
    assert.ok(warnings.some(entry => entry.includes('job-1') && entry.includes('未能落库')));
});

test('deletes the backend job once every delivered image is persisted', async () => {
    const requests = [];
    const client = createImageBackendJobsClient({
        pollInterval: 1,
        fetchImpl: async (url, options = {}) => {
            requests.push(`${options.method || 'GET'} ${url.replace(/^.*\/v1\/jobs/, '')}`);
            if (url.endsWith('/v1/jobs') && options.method === 'POST') {
                return jsonResponse({ ok: true, job: { id: 'job-1', state: 'queued', total: 1, createdAt: 1 } }, 202);
            }
            if (isJobCleanupDelete(url, options)) return jsonResponse({ ok: true });
            if (url.endsWith('/v1/jobs/job-1')) {
                return jsonResponse(jobStatus('completed', [{ index: 0, state: 'ready', transport: 'legacy-image' }]));
            }
            if (url.endsWith('/results/0') && options.method === 'DELETE') {
                return jsonResponse({ ok: true, state: 'consumed' });
            }
            if (url.endsWith('/results/0')) {
                return new Response(Uint8Array.from([1]), { status: 200, headers: { 'Content-Type': 'image/png' } });
            }
            throw new Error(`Unexpected request ${options.method || 'GET'} ${url}`);
        },
    });

    const outcome = await client.runJob({ key: 'key', delay: { min: 1, max: 1 }, items: [{}] }, {
        onItemReady: async () => {},
    });

    assert.equal(outcome.preserved.size, 0);
    assert.equal(requests.filter(entry => entry === 'DELETE /job-1').length, 1);
});
