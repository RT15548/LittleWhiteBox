import assert from 'node:assert/strict';
import test from 'node:test';
import { indexedDB } from 'fake-indexeddb';
import { drawCancellationJournal as journal } from '../draw-cancellation-journal.js';
import { cancelDrawWork, resumeDrawCancellations, settleDrawRunCancellations } from '../draw-work-cancellation.js';
import { createAdoptingPendingImageJob, forgetPendingImageJob, getPendingImageJob } from '../pending-image-jobs.js';

globalThis.indexedDB = indexedDB;
const client = { cancelWork: async () => {} };

test('acknowledged runs remain durable across chat switches until each marker or delivery is reconciled', async () => {
    await cancelDrawWork({ owner: 'alice', jobIds: ['manual'], runIds: ['chat-a', 'chat-b'] }, client);
    assert.equal((await journal.list()).length, 1);
    const replay = await resumeDrawCancellations(client, 'alice');
    assert.deepEqual([...replay.acknowledgedRunIds], ['chat-a', 'chat-b']);
    await settleDrawRunCancellations('alice', ['chat-a']);
    const remaining = await journal.list();
    assert.deepEqual(remaining.map(entry => ({ owner: entry.owner, jobIds: entry.jobIds, runIds: entry.runIds })),
        [{ owner: 'alice', jobIds: ['manual'], runIds: ['chat-b'] }]);
    await settleDrawRunCancellations('bob', ['chat-b']);
    assert.deepEqual(await journal.list(), remaining);
    await settleDrawRunCancellations('alice', ['chat-b']);
    assert.deepEqual(await journal.list(), []);
});

test('a lost ACK never becomes confirmed cancellation, and a later replay retains the run until cleanup', async () => {
    const targets = { owner: 'alice', jobIds: [], runIds: ['lost-ack'] };
    await assert.rejects(cancelDrawWork(targets, { cancelWork: async () => { throw new Error('offline'); } }));
    await settleDrawRunCancellations('alice', targets.runIds);
    assert.equal((await journal.list()).length, 1);
    const other = await resumeDrawCancellations(client, 'bob');
    assert.equal(other.acknowledgedRunIds.size, 0);
    assert.equal(other.blockedRunIds.has('lost-ack'), true);
    const replay = await resumeDrawCancellations(client, 'alice');
    assert.equal(replay.acknowledgedRunIds.has('lost-ack'), true);
    await settleDrawRunCancellations('alice', targets.runIds);
    assert.deepEqual(await journal.list(), []);
});

test('a child adopted after cancellation inherits the ACK without losing its delivery items', async () => {
    const runId = 'late-adopted-parent';
    await cancelDrawWork({ owner: 'alice', jobIds: [], runIds: [runId] }, client);
    const record = await createAdoptingPendingImageJob({ jobId: 'late-child', provider: 'sd-webui',
        originRunId: runId, sourceHash: 'source', delivery: { mode: 'gallery' },
        chatTarget: { kind: 'group', chatId: 'chat', body: { id: 'chat' } },
        items: [{ index: 0, slotId: 'slot-late-child', imgId: 'img-late-child' }] });
    await settleDrawRunCancellations('alice', [runId]);
    const current = await getPendingImageJob(record.jobId);
    assert.equal(current.cancelRequested, true);
    assert.equal(current.state, record.state);
    assert.deepEqual(current.items, record.items);
    assert.deepEqual(await journal.list(), []);
    await forgetPendingImageJob(record.jobId, record.leaseId);
});

test('reconciling one acknowledged intent cannot forget an overlapping unacknowledged cancellation group', async t => {
    const owner = 'overlapping-owner', runIds = ['overlapping-run'];
    t.after(async () => {
        for (const entry of await journal.list()) if (entry.owner === owner) await journal.forget(entry.id);
    });
    await cancelDrawWork({ owner, jobIds: [], runIds }, client);
    await assert.rejects(cancelDrawWork({ owner, jobIds: ['new-unconfirmed-job'], runIds }, {
        cancelWork: async () => { throw new Error('second cancellation response lost'); },
    }));
    const unconfirmed = (await journal.list()).find(entry => entry.jobIds.includes('new-unconfirmed-job'));
    await settleDrawRunCancellations(owner, runIds);
    assert.deepEqual(await journal.list(), [unconfirmed]);
    const replay = await resumeDrawCancellations(client, owner);
    assert.equal(replay.acknowledgedRunIds.has(runIds[0]), true);
    await settleDrawRunCancellations(owner, runIds);
    assert.deepEqual(await journal.list(), []);
});
