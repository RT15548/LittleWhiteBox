import assert from 'node:assert/strict';
import test from 'node:test';

import { indexedDB } from 'fake-indexeddb';

globalThis.indexedDB = indexedDB;

const {
    claimPendingImageJob,
    fencePendingImageJobLease,
    forgetPendingImageJob,
    getPendingImageJob,
    markPendingImageJobActive,
    markPendingImageJobCancelling,
    markPendingImageJobSettling,
    PendingImageJobLostError,
    PendingJobState,
    PENDING_JOB_LEASE_MS,
    recordPendingImageJob,
    renewPendingImageJobLease,
} = await import('../pending-image-jobs.js');

function newRecord(jobId) {
    return {
        jobId,
        provider: 'novelai',
        chatId: 'chat-1',
        messageId: '4',
        sourceHash: 'obsolete-hash',
        replacedSlotIds: ['old-a', 'old-a', 'old-b'],
        gallery: {},
        items: [{ index: 0, slotId: `slot-${jobId}`, imgId: `img-${jobId}`, previewMetadata: {} }],
    };
}

test('journal keeps replacement ownership but drops unused source snapshots', async () => {
    const jobId = `normalized-fields-${Date.now()}`;
    const record = await recordPendingImageJob(newRecord(jobId));
    assert.deepEqual(record.replacedSlotIds, ['old-a', 'old-b']);
    assert.equal('sourceHash' in record, false);
    await forgetPendingImageJob(jobId, record.leaseId);
});

test('claim changes ownership once and stale owners cannot mutate or delete the record', async () => {
    const jobId = `atomic-claim-${Date.now()}`;
    const original = await recordPendingImageJob(newRecord(jobId));
    await renewPendingImageJobLease(jobId, original.leaseId, { now: 0 });

    const claimTime = PENDING_JOB_LEASE_MS + 1;
    const claimed = await claimPendingImageJob(jobId, { now: claimTime });
    assert.ok(claimed);
    assert.notEqual(claimed.leaseId, original.leaseId);
    assert.equal(await claimPendingImageJob(jobId, { now: claimTime }), null);

    await assert.rejects(
        markPendingImageJobActive(jobId, original.leaseId),
        error => error instanceof PendingImageJobLostError,
    );
    assert.equal(await renewPendingImageJobLease(jobId, original.leaseId), null);
    await assert.rejects(
        forgetPendingImageJob(jobId, original.leaseId),
        error => error instanceof PendingImageJobLostError,
    );

    const current = await getPendingImageJob(jobId);
    assert.equal(current.leaseId, claimed.leaseId);
    assert.equal(current.state, PendingJobState.PREPARING);
    await forgetPendingImageJob(jobId, claimed.leaseId);
});

test('late create and cancel notifications cannot move the journal state backwards', async () => {
    const jobId = `monotonic-state-${Date.now()}`;
    const record = await recordPendingImageJob(newRecord(jobId));

    await markPendingImageJobCancelling(jobId, record.leaseId);
    await markPendingImageJobActive(jobId, record.leaseId);
    assert.equal((await getPendingImageJob(jobId)).state, PendingJobState.CANCELLING);

    await markPendingImageJobSettling(jobId, record.leaseId, { mode: 'discard' });
    await markPendingImageJobCancelling(jobId, record.leaseId);
    const settling = await getPendingImageJob(jobId);
    assert.equal(settling.state, PendingJobState.SETTLING);
    assert.equal(settling.settlement.mode, 'discard');
    await forgetPendingImageJob(jobId, record.leaseId);
});

test('fence and claim serialize ownership so only one flow can advance', async () => {
    const jobId = `atomic-fence-${Date.now()}`;
    const original = await recordPendingImageJob(newRecord(jobId));
    await renewPendingImageJobLease(jobId, original.leaseId, { now: 0 });
    const takeoverTime = PENDING_JOB_LEASE_MS + 1;

    const claimed = await claimPendingImageJob(jobId, { now: takeoverTime });
    assert.ok(claimed);
    await assert.rejects(
        fencePendingImageJobLease(jobId, original.leaseId, { now: takeoverTime }),
        error => error instanceof PendingImageJobLostError,
    );
    const current = await getPendingImageJob(jobId);
    assert.equal(current.leaseId, claimed.leaseId);
    await forgetPendingImageJob(jobId, claimed.leaseId);
});
