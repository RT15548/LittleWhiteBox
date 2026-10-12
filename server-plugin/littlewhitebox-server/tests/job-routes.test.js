'use strict';

const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { test } = require('node:test');

const { createAsyncImageJobManager } = require('../image-jobs/job-manager.js');
const { registerImageJobRoutes } = require('../image-jobs/routes.js');

function createRouter() {
    const routes = new Map();
    return {
        routes,
        get(path, handler) { routes.set(`GET ${path}`, handler); },
        post(path, handler) { routes.set(`POST ${path}`, handler); },
        delete(path, handler) { routes.set(`DELETE ${path}`, handler); },
    };
}

async function invoke(router, method, path, { body = {}, owner = 'alice', params = {} } = {}) {
    const handler = router.routes.get(`${method} ${path}`);
    assert.ok(handler, `missing route ${method} ${path}`);
    const req = new EventEmitter();
    req.body = body;
    req.params = params;
    req.user = owner === null ? undefined : { profile: { handle: owner } };
    const headers = new Map();
    const res = {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
        getHeader(name) { return headers.get(String(name).toLowerCase()); },
        send(body) { this.body = body; return this; },
    };
    await handler(req, res);
    return res;
}

async function waitFor(predicate, timeout = 2000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        const value = predicate();
        if (value) return value;
        await new Promise(resolve => setTimeout(resolve, 2));
    }
    assert.fail('Timed out waiting for job');
}

function createTestAdapter() {
    return {
        normalize(context, items, { parseTimeout }) {
            if (!context?.token) return { error: 'token is required' };
            const normalized = [];
            for (const [index, source] of items.entries()) {
                if (!source?.request?.name) return { error: `items[${index}].request.name is required` };
                const timeout = parseTimeout(source.timeout);
                if (timeout === null) return { error: `items[${index}].timeout must be a positive number` };
                normalized.push({ kind: 'image', request: { name: source.request.name }, timeout });
            }
            return { context: { token: String(context.token) }, items: normalized };
        },
        async execute({ item }) {
            return { buffer: Buffer.from(item.request.name), mime: 'image/png' };
        },
    };
}

test('generic image-job routes create, isolate, deliver, acknowledge, and delete a provider job', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter }, retentionMs: 10_000 });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });
    const body = {
        provider: 'test', requestId: 'batch-1', context: { token: 'secret' }, delay: { min: 1, max: 1 },
        items: [{ request: { name: 'image-1' }, timeout: 1000 }],
    };

    const created = await invoke(router, 'POST', '/v1/jobs', { body });
    assert.equal(created.statusCode, 202);
    const jobId = created.body.job.id;
    await waitFor(() => manager.getJob('alice', jobId)?.state === 'completed');

    const foreign = await invoke(router, 'GET', '/v1/jobs/:jobId', { owner: 'bob', params: { jobId } });
    assert.equal(foreign.statusCode, 404);
    const image = await invoke(router, 'GET', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '0' } });
    assert.equal(image.statusCode, 200);
    assert.equal(image.getHeader('content-type'), 'image/png');
    assert.deepEqual(image.body, Buffer.from('image-1'));
    assert.equal((await invoke(router, 'DELETE', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '0' } })).statusCode, 200);
    assert.equal((await invoke(router, 'DELETE', '/v1/jobs/:jobId', { params: { jobId } })).statusCode, 200);
});
test('generic routes validate provider input before creating a job', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter } });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });
    const invalid = await invoke(router, 'POST', '/v1/jobs', {
        body: { provider: 'test', requestId: 'bad', context: {}, delay: { min: 1, max: 1 }, items: [{ request: {}, timeout: 1000 }] },
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(manager.jobs.size, 0);
});

test('generic routes return a structured 400 when provider normalization throws', async (t) => {
    const adapter = {
        normalize() { throw new Error('invalid provider request'); },
        async execute() { throw new Error('unreachable'); },
    };
    const manager = createAsyncImageJobManager({ adapters: { test: adapter } });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });

    const response = await invoke(router, 'POST', '/v1/jobs', {
        body: {
            provider: 'test', requestId: 'bad-normalize', context: {}, delay: { min: 1, max: 1 },
            items: [{ request: {}, timeout: 1000 }],
        },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.code, 'invalid_request');
    assert.equal(response.body.error, 'invalid provider request');
    assert.equal(manager.jobs.size, 0);
});

test('generic routes reject unauthenticated callers on every image-job operation', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter } });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });

    const operations = [
        ['POST', '/v1/jobs'],
        ['GET', '/v1/jobs/:jobId'],
        ['GET', '/v1/jobs/:jobId/results/:index'],
        ['DELETE', '/v1/jobs/:jobId/results/:index'],
        ['POST', '/v1/jobs/:jobId/cancel'],
        ['DELETE', '/v1/jobs/:jobId'],
    ];
    for (const [method, path] of operations) {
        const response = await invoke(router, method, path, { owner: null, params: { jobId: 'x', index: '0' } });
        assert.equal(response.statusCode, 403, `${method} ${path} must require an authenticated profile`);
    }
});

test('generic routes refuse inherited Object prototype keys as providers', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter } });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });

    for (const provider of ['__proto__', 'toString', 'constructor']) {
        const response = await invoke(router, 'POST', '/v1/jobs', {
            body: {
                provider, requestId: `proto-${provider.replace(/[^a-z]/gi, '')}`, context: { token: 'secret' },
                delay: { min: 1, max: 1 }, items: [{ request: { name: 'image-1' }, timeout: 1000 }],
            },
        });
        assert.equal(response.statusCode, 400);
        assert.equal(response.body.error, 'provider is invalid');
    }
    assert.equal(manager.jobs.size, 0);
});

test('generic routes reject result indexes outside the per-job item ceiling', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter }, retentionMs: 10_000 });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });
    const created = await invoke(router, 'POST', '/v1/jobs', {
        body: {
            provider: 'test', requestId: 'bounds-1', context: { token: 'secret' }, delay: { min: 1, max: 1 },
            items: [{ request: { name: 'image-1' }, timeout: 1000 }],
        },
    });
    const jobId = created.body.job.id;

    const outOfRange = await invoke(router, 'GET', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '99999' } });
    assert.equal(outOfRange.statusCode, 400);
    assert.equal(outOfRange.body.error, 'Result index is invalid');
});

test('generic routes cancel a running job and refuse to delete it before it is terminal', async (t) => {
    let releaseItem;
    const blocked = new Promise(resolve => { releaseItem = resolve; });
    const adapter = {
        normalize: createTestAdapter().normalize,
        async execute({ signal }) {
            await Promise.race([
                blocked,
                new Promise((_, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })),
            ]);
            return { buffer: Buffer.from('late'), mime: 'image/png' };
        },
    };
    const manager = createAsyncImageJobManager({ adapters: { test: adapter }, retentionMs: 10_000 });
    t.after(() => { releaseItem(); manager.close(); });
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });

    const created = await invoke(router, 'POST', '/v1/jobs', {
        body: {
            provider: 'test', requestId: 'cancel-1', context: { token: 'secret' }, delay: { min: 1, max: 1 },
            items: [{ request: { name: 'image-1' }, timeout: 5000 }],
        },
    });
    const jobId = created.body.job.id;
    await waitFor(() => manager.getJob('alice', jobId)?.state === 'running');

    const premature = await invoke(router, 'DELETE', '/v1/jobs/:jobId', { params: { jobId } });
    assert.equal(premature.statusCode, 409);
    assert.equal(premature.body.state, 'running');
    assert.equal(premature.body.error, 'Image job is not terminal');

    const foreignCancel = await invoke(router, 'POST', '/v1/jobs/:jobId/cancel', { owner: 'bob', params: { jobId } });
    assert.equal(foreignCancel.statusCode, 404);

    const cancelled = await invoke(router, 'POST', '/v1/jobs/:jobId/cancel', { params: { jobId } });
    assert.equal(cancelled.statusCode, 200);
    await waitFor(() => manager.getJob('alice', jobId)?.state === 'cancelled');
    assert.equal((await invoke(router, 'DELETE', '/v1/jobs/:jobId', { params: { jobId } })).statusCode, 200);
});

test('generic routes report 409 for unfinished results and 410 once a result is consumed', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter }, retentionMs: 10_000 });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });
    const created = await invoke(router, 'POST', '/v1/jobs', {
        body: {
            provider: 'test', requestId: 'consume-1', context: { token: 'secret' }, delay: { min: 1, max: 1 },
            items: [{ request: { name: 'image-1' }, timeout: 1000 }, { request: { name: 'image-2' }, timeout: 1000 }],
        },
    });
    const jobId = created.body.job.id;

    const pending = await invoke(router, 'GET', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '1' } });
    assert.equal(pending.statusCode, 409);
    assert.ok(['queued', 'running'].includes(pending.body.state));

    await waitFor(() => manager.getJob('alice', jobId)?.state === 'completed');
    assert.equal((await invoke(router, 'DELETE', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '0' } })).statusCode, 200);

    const consumed = await invoke(router, 'GET', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '0' } });
    assert.equal(consumed.statusCode, 410);
    assert.equal(consumed.body.state, 'consumed');
    // ACK 必须幂等：客户端在确认响应丢失后会重发，重复确认不能报错。
    const consumedAgain = await invoke(router, 'DELETE', '/v1/jobs/:jobId/results/:index', { params: { jobId, index: '0' } });
    assert.equal(consumedAgain.statusCode, 200);
    assert.equal(consumedAgain.body.state, 'consumed');
});

test('generic routes reject a single job whose serialized input exceeds the per-job ceiling', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter }, maxJobInputBytes: 512 });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });

    const response = await invoke(router, 'POST', '/v1/jobs', {
        body: {
            provider: 'test', requestId: 'oversized-1', context: { token: 'secret' }, delay: { min: 1, max: 1 },
            items: [{ request: { name: 'x'.repeat(2048) }, timeout: 1000 }],
        },
    });

    assert.equal(response.statusCode, 413);
    assert.equal(response.body.code, 'job_input_limit');
    assert.equal(manager.jobs.size, 0);
    assert.equal(manager.storedInputBytes, 0);
});

test('the reconnect discovery route lists only the calling owner own jobs', async (t) => {
    const adapter = createTestAdapter();
    const manager = createAsyncImageJobManager({ adapters: { test: adapter }, retentionMs: 10_000 });
    t.after(() => manager.close());
    const router = createRouter();
    registerImageJobRoutes(router, { manager, adapters: { test: adapter } });
    const createFor = (owner, requestId) => invoke(router, 'POST', '/v1/jobs', {
        owner,
        body: {
            provider: 'test', requestId, context: { token: 'secret' }, delay: { min: 1, max: 1 },
            items: [{ request: { name: requestId }, timeout: 1000 }],
        },
    });

    await createFor('alice', 'alice-1');
    await createFor('alice', 'alice-2');
    await createFor('bob', 'bob-1');

    const mine = await invoke(router, 'GET', '/v1/jobs', { owner: 'alice' });
    assert.equal(mine.statusCode, 200);
    assert.deepEqual(mine.body.jobs.map(job => job.id), ['alice-1', 'alice-2']);
    assert.ok(mine.body.jobs.every(job => Array.isArray(job.items)));

    const theirs = await invoke(router, 'GET', '/v1/jobs', { owner: 'bob' });
    assert.deepEqual(theirs.body.jobs.map(job => job.id), ['bob-1']);

    const anonymous = await invoke(router, 'GET', '/v1/jobs', { owner: null });
    assert.equal(anonymous.statusCode, 403);
});
