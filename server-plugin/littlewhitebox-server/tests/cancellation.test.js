'use strict';

const assert = require('node:assert/strict');
const { test } = require('node:test');
const { setImmediate: turn } = require('node:timers/promises');
const { createCancellationRegistry, registerCancellationRoutes } = require('../cancellation.js');
const { createAsyncImageJobManager } = require('../image-jobs/job-manager.js');
const { createDrawRunManager } = require('../draw-runs/draw-run-manager.js');

function fixture(t, registryOptions = {}) {
    const registry = createCancellationRegistry(registryOptions);
    const starts = [], executions = [];
    const jobs = createAsyncImageJobManager({ cancellations: registry, adapters: { fixture: {
        execute({ owner, item, signal }) {
            starts.push({ owner, name: item.request.name });
            return new Promise((resolve, reject) => {
                executions.push({ resolve, signal });
                signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })), { once: true });
            });
        },
    } } });
    let plannerRelease;
    const runs = createDrawRunManager({
        cancellations: registry,
        runtime: {
            async executePreparedScenePlanner() { await new Promise(resolve => { plannerRelease = resolve; }); return []; },
            compileDrawRunImages() { return { provider: 'fixture', context: {}, delay: { min: 0, max: 0 },
                items: [{ kind: 'image', request: { name: 'child' }, timeout: 60_000 }],
                artifacts: [{ task: { placement: { insertAfter: 1 } } }] }; },
            deriveDrawRunChildJobId: id => `child-${id}`,
            deriveDrawRunItemIds: id => ({ slotId: `slot-${id}`, imgId: `img-${id}` }),
        },
        agentCore: { createAgentAdapter() {} },
        envelopeValidator: envelope => ({ envelope, inputBytes: 1 }),
        imageJobService: {
            create: (owner, body) => jobs.createJob({ owner, ...body }),
            get: (owner, id) => jobs.getJob(owner, id),
            cancel: (owner, id) => jobs.cancelJob(owner, id),
        },
        createHostClient() { assert.fail('no host session'); },
        childSweepIntervalMs: 0,
    });
    let route;
    registerCancellationRoutes({ post(_path, handler) { route = handler; } }, {
        registry, jobManager: jobs, drawRunManager: runs,
    });
    t.after(() => { runs.close(); jobs.close(); registry.close(); });
    return {
        starts, executions, jobs, runs,
        create(id, owner = 'alice', items = [id]) {
            return jobs.createJob({ owner, provider: 'fixture', requestId: id, context: {}, delay: { min: 0, max: 0 },
                items: items.map(name => ({ kind: 'image', request: { name }, timeout: 60_000 })) });
        },
        createRun(id) { return runs.create('alice', { runId: id, sourceHash: 'hash', imageProvider: 'fixture',
            planner: { validationContext: { sceneSource: { points: [{ offset: 1 }] } } },
            agent: { channel: 'direct', providerConfig: { timeoutMs: 60_000 } }, generationRecipe: {} }); },
        releasePlanner() { plannerRelease(); },
        cancel(body, owner = 'alice') {
            const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, send(body) { this.body = body; return this; } };
            route({ user: owner ? { profile: { handle: owner } } : undefined, body: { owner, ...body } }, res);
            return res;
        },
    };
}

test('atomic floor cancellation never starts the queued sibling (100 event-loop interleavings)', async t => {
    const f = fixture(t);
    for (let i = 0; i < 100; i++) {
        const a = `a-${i}`, b = `b-${i}`;
        f.create(a); f.create(b); await turn();
        assert.equal(f.cancel({ jobIds: [a, b] }).statusCode, 200);
        await turn();
        assert.equal(f.starts.some(item => item.name === b), false);
        assert.equal(f.jobs.getJob('alice', b).state, 'cancelled');
        f.jobs.deleteJob('alice', a); f.jobs.deleteJob('alice', b);
    }
    assert.equal(f.starts.length, 100);
});

test('duplicate cancellation, absent IDs and foreign IDs are owner-scoped and idempotent', async t => {
    const f = fixture(t);
    f.create('a'); f.create('b'); f.create('private', 'bob'); await turn();
    const command = { jobIds: ['a', 'b', 'b', 'missing', 'private'] };
    assert.equal(f.cancel(command).statusCode, 200);
    assert.equal(f.cancel(command).statusCode, 200);
    await turn();
    assert.equal(f.jobs.getJob('bob', 'private').state, 'running');
    assert.equal(f.executions.find((_, index) => f.starts[index].owner === 'bob').signal.aborted, false);
    assert.throws(() => f.create('missing'), error => error.code === 'request_cancelled');
    assert.doesNotThrow(() => f.create('missing', 'bob'));
});

test('ready image survives cancellation and ACK/deletion cannot reopen its request ID', async t => {
    const f = fixture(t);
    f.create('batch', 'alice', ['ready', 'running']);
    await turn();
    f.executions[0].resolve({ buffer: Buffer.from('image'), mime: 'image/png' });
    await turn();
    f.create('queued');
    f.cancel({ jobIds: ['batch', 'queued'] }); await turn();
    assert.equal(f.jobs.getResult('alice', 'batch', 0).buffer.toString(), 'image');
    assert.equal(f.jobs.consumeResult('alice', 'batch', 0).ok, true);
    assert.equal(f.jobs.deleteJob('alice', 'batch').ok, true);
    assert.throws(() => f.create('batch'), error => error.code === 'request_cancelled');
    f.create('new-reroll'); await turn();
    assert.equal(f.starts.at(-1).name, 'new-reroll');
    assert.equal(f.starts.some(item => item.name === 'queued'), false);
});

for (const phase of ['not-created', 'planning', 'dispatched']) test(`one cancellation fences Draw Run ${phase} and manual jobs together`, async t => {
    const f = fixture(t);
    f.create('running'); await turn();
    if (phase !== 'not-created') { f.createRun('plan'); await turn(); }
    if (phase === 'dispatched') { f.releasePlanner(); await turn(); assert.equal(f.runs.get('alice', 'plan').state, 'dispatched'); }
    f.create('queued');
    assert.equal(f.cancel({ jobIds: ['running', 'queued'], runIds: ['plan'] }).statusCode, 200);
    if (phase === 'planning') f.releasePlanner();
    await turn();
    assert.deepEqual(f.starts.map(item => item.name), ['running']);
    if (phase === 'not-created') assert.throws(() => f.createRun('plan'), error => error.code === 'request_cancelled');
    else {
        const run = f.runs.get('alice', 'plan');
        assert.ok(run.cancelRequestedAt !== undefined);
        assert.equal(f.runs.acknowledge('alice', 'plan').ok, true);
        assert.throws(() => f.createRun('plan'), error => error.code === 'request_cancelled');
    }
});

test('invalid or unauthenticated sets cannot partially cancel a valid job', async t => {
    const f = fixture(t);
    f.create('running'); await turn();
    for (const body of [{ jobIds: ['running', '../invalid'] }, { runIds: 'run' }, {}, { jobIds: Array(129).fill('running') }]) {
        assert.equal(f.cancel(body).statusCode, 400);
        assert.equal(f.executions[0].signal.aborted, false);
    }
    assert.equal(f.cancel({ jobIds: ['running'] }, null).statusCode, 403);
    assert.equal(f.executions[0].signal.aborted, false);
});

test('admission reserves cancellation at capacity without starting a queued sibling', async t => {
    let now = 0;
    const f = fixture(t, { now: () => now, retentionMs: 10, maxTargetsPerOwner: 3 });
    f.create('running'); f.create('queued'); await turn();
    assert.equal(f.cancel({ jobIds: ['old'] }).statusCode, 200);
    assert.throws(() => f.create('new'), error => error.code === 'cancellation_limit');
    assert.equal(f.cancel({ jobIds: ['running', 'queued'] }).statusCode, 200);
    await turn();
    assert.equal(f.executions[0].signal.aborted, true);
    assert.deepEqual(f.starts.map(item => item.name), ['running']);
    f.jobs.deleteJob('alice', 'running'); f.jobs.deleteJob('alice', 'queued');
    assert.throws(() => f.create('running'), error => error.code === 'request_cancelled');
    now = 11;
    assert.doesNotThrow(() => f.create('old'));
});

test('a long-running reservation cannot expire and a normally deleted result releases capacity', async t => {
    let now = 0;
    const f = fixture(t, { now: () => now, retentionMs: 10, maxTargetsPerOwner: 1 });
    f.create('running'); await turn(); now = 100;
    assert.equal(f.cancel({ jobIds: ['unseen'] }).statusCode, 429);
    f.executions[0].resolve({ buffer: Buffer.from('image'), mime: 'image/png' }); await turn();
    assert.equal(f.jobs.deleteJob('alice', 'running').ok, true);
    assert.doesNotThrow(() => f.create('next'));
    assert.equal(f.cancel({ jobIds: ['next'] }).statusCode, 200);
});

test('global cancellation capacity rejects new admission but cannot prevent an accepted owner from stopping', async t => {
    const f = fixture(t, { maxTargets: 2 });
    f.create('a', 'alice'); f.create('b', 'bob'); await turn();
    assert.throws(() => f.create('c', 'carol'), error => error.code === 'cancellation_limit');
    assert.equal(f.cancel({ jobIds: ['a'] }, 'alice').statusCode, 200);
    assert.equal(f.cancel({ jobIds: ['b'] }, 'bob').statusCode, 200);
});

test('planner admission reserves its child through dispatch and releases an unused child on removal', async t => {
    const f = fixture(t, { maxTargetsPerOwner: 2 });
    f.createRun('plan'); await turn();
    assert.throws(() => f.create('extra'), error => error.code === 'cancellation_limit');
    f.releasePlanner(); await turn();
    assert.equal(f.runs.get('alice', 'plan').state, 'dispatched');
    assert.deepEqual(f.starts.map(item => item.name), ['child']);
    assert.equal(f.cancel({ runIds: ['plan'] }).statusCode, 200); await turn();
    f.jobs.deleteJob('alice', 'child-plan'); f.runs.acknowledge('alice', 'plan');
    assert.doesNotThrow(() => f.create('extra'));
});

test('cancelling an undispatched planner releases the unused child reservation', async t => {
    const f = fixture(t, { maxTargetsPerOwner: 2 });
    f.createRun('plan'); await turn();
    f.cancel({ runIds: ['plan'] }); f.releasePlanner(); await turn();
    f.runs.acknowledge('alice', 'plan');
    assert.doesNotThrow(() => f.create('replacement'));
});

test('an account switch cannot acknowledge another profiles cancellation intent', async t => {
    const f = fixture(t);
    f.create('a', 'alice'); await turn();
    const rejected = f.cancel({ owner: 'alice', jobIds: ['a'] }, 'bob');
    assert.equal(rejected.statusCode, 409);
    assert.equal(rejected.body.code, 'cancellation_owner_mismatch');
    assert.equal(f.executions[0].signal.aborted, false);
    assert.equal(f.cancel({ owner: 'alice', jobIds: ['a'] }, 'alice').statusCode, 200);
    assert.equal(f.executions[0].signal.aborted, true);
});
