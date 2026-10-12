import assert from 'node:assert/strict';
import test from 'node:test';
import { indexedDB, IDBObjectStore } from 'fake-indexeddb';
import { drawCancellationJournal as journal } from '../draw-cancellation-journal.js';
import { cancelDrawWork, holdDrawCancellation, resumeDrawCancellations, waitForDrawCancellation } from '../draw-work-cancellation.js';
import { recordPendingImageJob, createAdoptingPendingImageJob, markPendingImageJobActive,
    getPendingImageJob, forgetPendingImageJob, PendingJobState } from '../pending-image-jobs.js';

globalThis.indexedDB = indexedDB;

// The intent and delivery journals are separate databases. Verify their actual
// transaction order and crash-safe retry, not only calls on fake journals.
for (const replay of [false, true]) test(`cancellation ACK survives delivery-journal failure (${replay ? 'replay' : 'foreground'})`, async t => {
    const suffix = replay ? 'replay' : 'foreground';
    const direct = await recordPendingImageJob({ jobId: `direct-${suffix}`, provider: 'novelai', delivery: { mode: 'gallery' },
        items: [{ index: 0, slotId: `direct-slot-${suffix}`, imgId: `direct-img-${suffix}` }] });
    await markPendingImageJobActive(direct.jobId, direct.leaseId);
    const child = await createAdoptingPendingImageJob({ jobId: `child-${suffix}`, provider: 'novelai', delivery: { mode: 'gallery' },
        originRunId: `parent-${suffix}`, sourceHash: 'source',
        chatTarget: { kind: 'group', chatId: 'chat', body: { id: 'chat' } },
        items: [{ index: 0, slotId: `child-slot-${suffix}`, imgId: `child-img-${suffix}` }] });
    t.after(async () => { for (const record of [direct, child]) await forgetPendingImageJob(record.jobId, record.leaseId); });
    const targets = { owner: 'alice', jobIds: [direct.jobId], runIds: [child.originRunId] };
    const before = await Promise.all([direct, child].map(record => getPendingImageJob(record.jobId)));
    let backendAcknowledged = false, projectionWrites = 0;
    const client = { async cancelWork() {
        assert.deepEqual(await Promise.all([direct, child].map(record => getPendingImageJob(record.jobId))), before);
        backendAcknowledged = true;
    } };
    const put = IDBObjectStore.prototype.put;
    const injected = t.mock.method(IDBObjectStore.prototype, 'put', function(value, ...args) {
        const request = put.call(this, value, ...args);
        if ([direct.jobId, child.jobId].includes(value.jobId) && value.cancelRequested && ++projectionWrites === 2) {
            assert.equal(backendAcknowledged, true);
            this.transaction.abort();
        }
        return request;
    });
    if (replay) {
        await journal.record(targets);
        const outcome = await resumeDrawCancellations(client, 'alice');
        assert.equal(outcome.failures.length, 1);
        assert.deepEqual([...outcome.blockedJobIds], targets.jobIds);
        assert.deepEqual([...outcome.blockedRunIds], targets.runIds);
    } else await assert.rejects(cancelDrawWork(targets, client));
    injected.mock.restore();
    assert.equal(projectionWrites, 2);
    assert.deepEqual(await Promise.all([direct, child].map(record => getPendingImageJob(record.jobId))), before);
    assert.equal((await journal.list()).length, 1);
    await resumeDrawCancellations(client, 'alice');
    assert.deepEqual(await journal.list(), []);
    const updated = await Promise.all([direct, child].map(record => getPendingImageJob(record.jobId)));
    assert.equal(updated[0].state, PendingJobState.CANCELLING);
    assert.equal(updated[1].state, PendingJobState.ADOPTING);
    for (let index = 0; index < updated.length; index++) {
        assert.equal(updated[index].cancelRequested, true);
        assert.equal(updated[index].leaseId, before[index].leaseId);
        assert.deepEqual(updated[index].items, before[index].items);
    }
});

test('a lost cancellation response retains the exact set for reload; retry never submits image work', async () => {
    const targets = { owner: 'alice', jobIds: ['running', 'queued'], runIds: ['planner'] };
    await assert.rejects(cancelDrawWork(targets, { cancelWork: async () => { throw new Error('response lost'); } }));
    targets.jobIds.push('new-work');
    const saved = await journal.list();
    assert.equal(saved.length, 1);
    const calls = [];
    await resumeDrawCancellations({ cancelWork: async targets => calls.push(targets) }, 'alice');
    assert.deepEqual(calls, [{ owner: 'alice', jobIds: ['running', 'queued'], runIds: ['planner'] }]);
    assert.deepEqual(await journal.list(), []);
});

test('persistence failure prevents transport and leaves a visible rejection', async () => {
    let calls = 0;
    const failure = new Error('storage blocked');
    await assert.rejects(cancelDrawWork({ owner: 'alice', jobIds: ['a'], runIds: [] }, { cancelWork: async () => calls++ }, {
        record: async () => { throw failure; },
    }), error => error === failure);
    assert.equal(calls, 0);
});

test('failed sets stay whole while unrelated cancellation entries still replay', async () => {
    const first = await journal.record({ owner: 'alice', jobIds: ['a', 'b'], runIds: ['plan'] });
    await journal.record({ owner: 'alice', jobIds: ['c'], runIds: [] });
    const calls = [];
    const outcome = await resumeDrawCancellations({ cancelWork: async targets => {
        calls.push(targets.jobIds);
        if (targets.jobIds.includes('a')) throw Object.assign(new Error('limit'), { code: 'cancellation_limit' });
    } }, 'alice');
    assert.deepEqual(calls, [['a', 'b'], ['c']]);
    assert.deepEqual([...outcome.blockedJobIds], ['a', 'b']);
    assert.deepEqual([...outcome.blockedRunIds], ['plan']);
    assert.equal(outcome.failures.length, 1);
    assert.deepEqual(await journal.list(), [first]);
    await journal.forget(first.id);
});

test('another profile cannot replay or forget an intent; returning to its owner resumes it', async () => {
    const entry = await journal.record({ owner: 'alice', jobIds: ['a'], runIds: ['plan'] });
    const calls = [];
    const client = { cancelWork: async targets => calls.push(targets) };
    const other = await resumeDrawCancellations(client, 'bob');
    assert.deepEqual(calls, []);
    assert.deepEqual(await journal.list(), [entry]);
    assert.equal(other.blockedJobIds.has('a'), true);
    assert.equal(other.blockedRunIds.has('plan'), true);
    assert.equal(other.failures.length, 0);
    await resumeDrawCancellations(client, 'alice');
    assert.deepEqual(calls, [{ owner: 'alice', jobIds: ['a'], runIds: ['plan'] }]);
    assert.deepEqual(await journal.list(), []);
});

test('both running monitors wait for the whole-set cancellation, not each others HTTP arrival', async () => {
    const a = new AbortController(), b = new AbortController();
    const gate = Promise.withResolvers(), events = [];
    const grouped = holdDrawCancellation([a.signal, b.signal], async () => { await gate.promise; events.push('group'); });
    const monitor = async signal => { await waitForDrawCancellation(signal); events.push('monitor'); };
    a.abort(); b.abort();
    const pending = Promise.all([monitor(a.signal), monitor(b.signal)]);
    await Promise.resolve();
    assert.deepEqual(events, []);
    gate.resolve(); await grouped; await pending;
    assert.deepEqual(events, ['group', 'monitor', 'monitor']);
});

test('failed grouped cancellation detaches monitors instead of allowing partial cancellation', async () => {
    const a = new AbortController(), b = new AbortController();
    const operation = holdDrawCancellation([a.signal, b.signal], async () => { throw new Error('offline'); });
    const results = await Promise.allSettled([operation, waitForDrawCancellation(a.signal), waitForDrawCancellation(b.signal)]);
    assert.ok(results.every(result => result.status === 'rejected' && result.reason.detached));
});
