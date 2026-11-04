import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { setImmediate as nextTurn } from 'node:timers/promises';
import test from 'node:test';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';

// Exercise the real planner recovery boundary, marker persistence and journal;
// only the host and DOM projection are substituted. A blocked group's parent
// must not be adopted/ACKed while unrelated terminal runs can still settle.
const host = { ctx: null };
globalThis.__drawRunRecoveryTest = host;
globalThis.indexedDB = indexedDB;
globalThis.window = new EventTarget();
const stubs = {
    'extensions.js': 'export const getContext=()=>globalThis.__drawRunRecoveryTest.ctx;',
    'script.js': 'export const syncMesToSwipe=()=>true; export const getRequestHeaders=()=>({}); export const saveChatDebounced=()=>{void globalThis.__drawRunRecoveryTest.ctx.saveChat();};',
    'utils.js': 'export const uuidv4=()=>"recovery-fixture";',
    'user.js': 'export const getCurrentUserHandle=()=>"alice";',
    'draw-common.js': 'export const isMessageBeingEdited=()=>false;export const syncRenderedMessageFromState=async()=>{};',
};
const bundle = await build({
    stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
        export * from './draw-run-recovery-runtime.js';
        export * from './draw-run-markers.js';
        export * from './pending-image-jobs.js';
        export * from './floor-image-job.js';
        export * from './draw-run-controls.js';
        export * from './draw-work-cancellation.js';
        export * from './draw-cancellation-journal.js';
        export * from './draw-run-activity.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'draw-run-host-boundaries', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Only the locally built test module is evaluated, never external input.
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text
    + '\n//# sourceURL=draw-run-recovery-test.mjs').toString('base64')}`);

test('unconfirmed groups protect parent markers and adoption records without blocking other run settlement', async t => {
    const blocked = 'run-blocked-marker', adopting = 'run-blocked-adoption', ready = 'run-unrelated-terminal';
    const messages = [blocked, ready].map(runId => ({ mes: runId, extra: { xbDrawRuns: {
        [runId]: api.createDrawRunMarker({ provider: 'sd-webui', sourceHash: 'source', targetHash: 'target' }),
    } } }));
    let persisted = structuredClone(messages);
    host.ctx = { chatId: 'isolation', groupId: 'fixture-group', chat: messages, getRequestHeaders: () => ({}),
        async saveChat() { persisted = structuredClone(this.chat); } };
    t.mock.method(globalThis, 'fetch', async () => Response.json(persisted));
    const record = await api.createAdoptingPendingImageJob({ jobId: 'blocked-child', provider: 'sd-webui',
        originRunId: adopting, sourceHash: 'source',
        chatTarget: { kind: 'group', chatId: 'isolation', body: { id: 'isolation' } },
        delivery: { mode: 'slots', chatId: 'isolation', messageId: '0', swipeIndex: 0 },
        items: [{ index: 0, slotId: 'unadopted-slot', imgId: 'unadopted-img' }] });
    await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
    const before = await api.getPendingImageJob(record.jobId);
    t.after(() => api.forgetPendingImageJob(record.jobId, record.leaseId));
    const acknowledgements = [], cancellations = [], adopted = [];
    const runs = [blocked, adopting, ready].map(id => ({ id, state: 'cancelled', provider: 'sd-webui' }));
    await api.runDrawRunRecoveryPass({ ctx: host.ctx, records: [before],
        excludedRunIds: new Set([blocked, adopting]), scheduleRecovery() {},
        onAdoptionReady: record => adopted.push(record),
        client: { listRuns: async () => runs, cancelRun: async id => cancellations.push(id),
            acknowledgeRun: async id => acknowledgements.push(id) },
    });
    assert.deepEqual(acknowledgements, [ready]);
    assert.deepEqual(cancellations, []);
    assert.deepEqual(adopted, []);
    assert.ok(api.findDrawRunMarker(messages, blocked));
    assert.ok(api.findDrawRunMarker(persisted, blocked));
    assert.equal(api.findDrawRunMarker(messages, ready), null);
    assert.equal(api.findDrawRunMarker(persisted, ready), null);
    assert.deepEqual(await api.getPendingImageJob(record.jobId), before);
});

for (const state of ['missing', 'cancelling']) test(`acknowledged ${state} planning releases the real floor UI without waiting for a timeout`, async t => {
    const runId = `cancel-${state}`;
    const message = { mes: 'offline scene', extra: { xbDrawRuns: {
        [runId]: api.createDrawRunMarker({ provider: 'sd-webui', sourceHash: 'source', targetHash: 'target' }),
    } } };
    let persisted = structuredClone([message]);
    host.ctx = { chatId: `chat-${state}`, groupId: 'fixture-group', chat: [message], getRequestHeaders: () => ({}),
        async saveChat() { persisted = structuredClone(this.chat); } };
    t.mock.method(globalThis, 'fetch', async () => Response.json(persisted));
    const jobs = new Map(), projections = [];
    const job = api.acquireFloorImageJob(jobs, host.ctx, 0, () => ({
        controller: new AbortController(), backendCancel: new AbortController(),
    }));
    const update = api.observeFloorImageJob(job, { getCurrentContext: () => host.ctx,
        onStateChange: state => projections.push(state) });
    update('submitting', { runId });
    const imageClient = { cancelWork: async () => {} };
    await api.cancelFloorDrawWork(0, { jobs: [job], imageJobClient: imageClient, recordsLoader: async () => [] });
    assert.ok(api.findDrawRunMarker(persisted, runId));
    assert.equal((await api.drawCancellationJournal.list()).length, 1, 'ACK stays recoverable until marker cleanup');
    const cancellation = await api.resumeDrawCancellations(imageClient, 'alice');
    const run = { id: runId, provider: 'sd-webui', state, cancelRequestedAt: 1 };
    await api.runDrawRunRecoveryPass({ ctx: host.ctx, records: [],
        acknowledgedRunIds: cancellation.acknowledgedRunIds,
        onCancellationSettled: id => api.settleDrawRunCancellations('alice', [id]),
        scheduleRecovery() {}, client: {
            listRuns: async () => state === 'missing' ? [] : [run],
            cancelRun: async () => assert.fail('the cancellation is already acknowledged'),
            acknowledgeRun: async () => assert.fail('an unwinding Planner is not terminal'),
        },
    });
    assert.equal(api.findDrawRunMarker(host.ctx.chat, runId), null);
    assert.equal(api.findDrawRunMarker(persisted, runId), null);
    assert.equal(job.released, true);
    assert.equal(jobs.size, 0);
    assert.equal(projections.at(-1), 'idle');
    assert.equal(run.state, state, 'UI completion must not depend on Planner settlement');
    assert.deepEqual(await api.drawCancellationJournal.list(), []);
});

async function expectNoCancellationIntent() {
    for (let attempt = 0; attempt < 30; attempt++) {
        if ((await api.drawCancellationJournal.list()).length === 0) return;
        await nextTurn();
    }
    assert.deepEqual(await api.drawCancellationJournal.list(), []);
}

for (const ackFirst of [false, true]) test(`unsubmitted cancellation consumes its intent when ${ackFirst ? 'ACK' : 'local completion'} arrives first`, async () => {
    const runId = `never-posted-${ackFirst}`;
    host.ctx = { chatId: runId, groupId: 'fixture-group', chat: [{ mes: 'no persisted marker remains' }], saveChat() {} };
    const jobs = new Map();
    const job = api.acquireFloorImageJob(jobs, host.ctx, 0, () => ({
        controller: new AbortController(), backendCancel: new AbortController(),
    }));
    const update = api.observeFloorImageJob(job, { getCurrentContext: () => host.ctx });
    update('submitting', { runId });
    const started = Promise.withResolvers(), ack = Promise.withResolvers();
    const cancellation = api.cancelFloorDrawWork(0, { jobs: [job], recordsLoader: async () => [],
        imageJobClient: { async cancelWork() { started.resolve(); await ack.promise; } } });
    await started.promise;
    const finish = () => api.failFloorImageJob(job, Object.assign(new Error('offline cancellation fixture'), {
        code: 'DRAW_RUN_CANCELLED', uncertain: false,
    }));
    if (ackFirst) {
        ack.resolve(); await cancellation;
        assert.equal((await api.drawCancellationJournal.list()).length, 1);
        finish();
    } else {
        finish();
        assert.equal((await api.drawCancellationJournal.list()).length, 1, 'local completion cannot substitute for backend ACK');
        ack.resolve(); await cancellation;
    }
    await expectNoCancellationIntent();
    assert.equal(job.released, true);
});

test('cancellation of an already adopted child consumes its intent on completed without a live submitting job', async () => {
    const runId = 'completed-adopted-child';
    host.ctx = { chatId: runId, groupId: 'fixture-group', chat: [{ mes: 'already adopted' }], saveChat() {} };
    const child = { jobId: 'completed-child', originRunId: runId, provider: 'sd-webui', state: 'active',
        chatTarget: { chatId: runId }, delivery: { mode: 'gallery' }, gallery: { messageId: 0, swipeIndex: 0 } };
    await api.cancelFloorDrawWork(0, { jobs: [], recordsLoader: async () => [child], imageJobClient: { cancelWork: async () => {} } });
    assert.equal((await api.drawCancellationJournal.list()).length, 1);
    api.publishDrawRunActivity({ runId, chatId: runId, messageId: 0, swipeIndex: 0, phase: 'completed', success: 1, total: 1 });
    await expectNoCancellationIntent();
});

// Acceptance contracts (offline, real journal + recovery):
// - Marker cleanup followed by one failed intent deletion must retry to completion, including after reload.
//   Cost: invisible durable intent leaks and repeated backend cancellation requests.
// - Failed cancellation ACK or another account cannot retire the cancellation intent.
// - Successful cancellation retires independently of chat I/O without deleting delivery items.
//   Cost: losing cancellation ownership or a paid image.
for (const reload of [false, true]) test(`retirement retries after marker removal${reload ? ' across a fresh runtime and chat switch' : ''}`, async t => {
    const runId = `retire-after-clear-${reload}`;
    const message = { mes: 'offline scene', extra: { xbDrawRuns: {
        [runId]: api.createDrawRunMarker({ provider: 'sd-webui', sourceHash: 'source', targetHash: 'target' }),
    } } };
    let persisted = structuredClone([message]);
    const originalChatId = `original-${reload}`;
    host.ctx = { chatId: originalChatId, groupId: 'fixture-group', chat: [message], getRequestHeaders: () => ({}),
        async saveChat() { persisted = structuredClone(this.chat); } };
    const chatTarget = { kind: 'group', chatId: originalChatId, endpoint: '/api/chats/group/get', body: { id: originalChatId } };
    t.mock.method(console, 'warn', () => {});
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        assert.equal(url, chatTarget.endpoint);
        assert.deepEqual(JSON.parse(options.body), chatTarget.body, 'read only the original chat, even after switching');
        return Response.json(persisted);
    });
    let failures = 0, cancelRequests = 0;
    const journal = { ...api.drawCancellationJournal, async forgetRuns(...args) {
        if (failures++ === 0) throw new Error('one-off IndexedDB retirement failure');
        return api.drawCancellationJournal.forgetRuns(...args);
    } };
    const imageClient = { async cancelWork() { cancelRequests++; } };
    await api.cancelDrawWork({ owner: 'alice', jobIds: [], runIds: [runId], chatTarget }, imageClient, journal);
    const client = { listRuns: async () => [{ id: runId, state: 'cancelling', cancelRequestedAt: 1 }],
        cancelRun: async () => assert.fail('cancellation already ACKed'),
        acknowledgeRun: async () => assert.fail('Planner is not terminal') };
    const retries = [];
    const recover = async (runtime, intentJournal) => {
        const cancellation = await runtime.resumeDrawCancellations(imageClient, 'alice', intentJournal);
        await runtime.runDrawRunRecoveryPass({ ctx: host.ctx, records: [], client,
            acknowledgedRunIds: cancellation.acknowledgedRunIds, acknowledgedEntries: cancellation.acknowledgedEntries,
            onCancellationSettled: id => runtime.settleDrawRunCancellations('alice', [id], intentJournal),
            scheduleRecovery: delay => retries.push(delay) });
    };
    await recover(api, journal);
    assert.equal(api.findDrawRunMarker(persisted, runId), null);
    assert.equal((await api.drawCancellationJournal.list()).length, 1);
    assert.equal(retries.length, 1);
    // A fresh module has no process-local ACK map or event listeners from the old page.
    // eslint-disable-next-line no-unsanitized/method -- Only the locally built fixture bundle is evaluated.
    const nextApi = reload ? await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + '\n// retirement reload').toString('base64')}`) : api;
    if (reload) host.ctx = { chatId: 'another-chat', groupId: 'fixture-group', chat: [{ mes: 'untouched' }],
        getRequestHeaders: () => ({}), saveChat: () => assert.fail('recovery must not save another chat') };
    const nextJournal = reload ? nextApi.drawCancellationJournal : journal;
    await recover(nextApi, nextJournal);
    assert.deepEqual(await nextApi.drawCancellationJournal.list(), []);
    const settledRequests = cancelRequests;
    await recover(nextApi, nextJournal);
    assert.equal(cancelRequests, settledRequests, 'settled intents never replay again');
    if (reload) assert.deepEqual(host.ctx.chat, [{ mes: 'untouched' }]);
});

test('cancellation ACK retires its intent without chat readback or deleting paid child ownership', async t => {
    const runId = 'retirement-proof';
    const marker = { mes: 'original', extra: { xbDrawRuns: {
        [runId]: api.createDrawRunMarker({ provider: 'sd-webui', sourceHash: 'source', targetHash: 'target' }),
    } } };
    const chatTarget = { kind: 'group', chatId: 'original', endpoint: '/api/chats/group/get', body: { id: 'original' } };
    host.ctx = { chatId: 'different-chat', chat: [], getRequestHeaders: () => ({}) };
    t.mock.method(console, 'warn', () => {});
    let ackFails = true;
    t.mock.method(globalThis, 'fetch', async () => assert.fail('cancellation never reads the chat'));
    const imageClient = { async cancelWork() { if (ackFails) throw new Error('ACK lost'); } };
    await assert.rejects(api.cancelDrawWork({ owner: 'alice', jobIds: [], runIds: [runId], chatTarget }, imageClient));
    const child = await api.createAdoptingPendingImageJob({ jobId: 'paid-child-retirement', provider: 'sd-webui',
        originRunId: runId, sourceHash: 'source', chatTarget,
        delivery: { mode: 'slots', chatId: 'original', messageId: '0', swipeIndex: 0 },
        items: [{ index: 0, imgId: 'paid-image', slotId: 'paid-slot' }] });
    t.after(() => api.forgetPendingImageJob(child.jobId, child.leaseId));
    const before = await api.getPendingImageJob(child.jobId);
    const retries = [];
    const recover = async (owner = 'alice') => {
        const cancellation = await api.resumeDrawCancellations(imageClient, owner);
        await api.runDrawRunRecoveryPass({ ctx: host.ctx, records: [before],
            excludedRunIds: cancellation.blockedRunIds, acknowledgedRunIds: cancellation.acknowledgedRunIds,
            acknowledgedEntries: cancellation.acknowledgedEntries,
            onCancellationSettled: id => api.settleDrawRunCancellations(owner, [id]),
            scheduleRecovery: delay => retries.push(delay), client: { listRuns: async () => [],
                cancelRun: async () => assert.fail('no individual cancellation'), acknowledgeRun: async () => assert.fail('no child ACK') } });
    };
    t.after(async () => { for (const entry of await api.drawCancellationJournal.list()) await api.drawCancellationJournal.forget(entry.id); });
    await recover();
    assert.equal((await api.drawCancellationJournal.list()).length, 1);
    ackFails = false;
    await recover('bob');
    assert.equal((await api.drawCancellationJournal.list()).length, 1);
    await recover();
    assert.deepEqual(await api.drawCancellationJournal.list(), []);
    assert.deepEqual(await api.getPendingImageJob(child.jobId), { ...before, cancelRequested: true });
    assert.ok(api.findDrawRunMarker([marker], runId), 'retirement does not require changing another chat');
});
