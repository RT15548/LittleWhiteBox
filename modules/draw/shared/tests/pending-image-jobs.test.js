import assert from 'node:assert/strict';
import test from 'node:test';

import { indexedDB } from 'fake-indexeddb';

globalThis.indexedDB = indexedDB;

const {
    activateAdoptingPendingImageJob,
    createAdoptingPendingImageJob,
    claimPendingImageJob,
    fencePendingImageJobLease,
    forgetPendingImageJob,
    getPendingImageJob,
    getPendingImageJobSlots,
    commitPendingImageJobItem,
    discardPendingImageSlot,
    markPendingImageJobActive,
    markPendingImageJobAdoptionPlacing,
    markPendingImageJobAdoptionReady,
    markPendingImageJobCancelling,
    markPendingImageJobSettling,
    markPendingImageJobOriginRunAckReady,
    PendingJobAdoptionPhase,
    PendingImageJobLostError,
    PendingJobState,
    PENDING_JOB_LEASE_MS,
    recordPendingImageJob,
    acknowledgePendingImageJobCancellations,
    resetPendingImageJobAdoptionPlacement,
    renewPendingImageJobLease,
} = await import('../pending-image-jobs.js');

function newRecord(jobId) {
    return {
        jobId,
        provider: 'novelai',
        delivery: { mode: 'slots', chatId: 'chat-1', messageId: '4' },
        sourceHash: 'obsolete-hash',
        gallery: {},
        items: [{ index: 0, slotId: `slot-${jobId}`, imgId: `img-${jobId}`, previewMetadata: {} }],
    };
}

function drawRunRecord(jobId) {
    return {
        ...newRecord(jobId),
        delivery: { mode: 'slots', chatId: 'chat-1', messageId: '4', swipeIndex: 0 },
        originRunId: `run-${jobId}`,
        sourceHash: `hash-${jobId}`,
        chatTarget: {
            kind: 'character',
            chatId: 'chat-1',
            endpoint: '/api/chats/get',
            body: { ch_name: 'Alice', file_name: 'chat-1', avatar_url: 'alice.png' },
        },
    };
}

test('a committed item releases only its slot while its batch and cancellation remain durable', async () => {
    const record = newRecord('item-receipt');
    record.items.push({ index: 1, slotId: 'receipt-sibling', imgId: 'receipt-image-b' });
    const owner = await recordPendingImageJob(record);
    await markPendingImageJobActive(owner.jobId, owner.leaseId);
    await commitPendingImageJobItem(owner.jobId, owner.leaseId, 0);
    await acknowledgePendingImageJobCancellations({ jobIds: [owner.jobId], runIds: [] });
    await discardPendingImageSlot('receipt-sibling');
    const current = await renewPendingImageJobLease(owner.jobId, owner.leaseId);
    assert.equal(current.items[0].deliveryCommitted, true);
    assert.equal(current.items[1].discarded, true);
    assert.equal(current.cancelRequested, true);
    assert.equal((await getPendingImageJobSlots()).has(record.items[0].slotId), false);
    await assert.rejects(commitPendingImageJobItem(owner.jobId, 'stale-lease', 1),
        error => error.code === 'PENDING_JOB_LEASE_LOST');
    await assert.rejects(commitPendingImageJobItem(owner.jobId, owner.leaseId, 100), RangeError);
    await forgetPendingImageJob(owner.jobId, owner.leaseId);
});

test('competing backend attempts atomically reserve one slot, then admit a reroll after delivery', async () => {
    const first = newRecord('slot-reservation-a');
    const second = newRecord('slot-reservation-b');
    second.items[0].slotId = first.items[0].slotId;
    const attempts = await Promise.allSettled([recordPendingImageJob(first), recordPendingImageJob(second)]);
    assert.equal(attempts.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(attempts.find(result => result.status === 'rejected').reason.code, 'PENDING_IMAGE_SLOT_BUSY');
    const owner = attempts.find(result => result.status === 'fulfilled').value;
    await commitPendingImageJobItem(owner.jobId, owner.leaseId, 0);
    const reroll = await recordPendingImageJob({ ...second, jobId: 'slot-reservation-reroll' });
    assert.equal((await getPendingImageJobSlots()).get(first.items[0].slotId).jobId, reroll.jobId);
    await forgetPendingImageJob(owner.jobId, owner.leaseId);
    await forgetPendingImageJob(reroll.jobId, reroll.leaseId);
});

test('adoption journal creation is atomic across competing tabs', async () => {
    const jobId = `atomic-adoption-${Date.now()}`;
    const candidate = drawRunRecord(jobId);
    const [left, right] = await Promise.all([
        createAdoptingPendingImageJob(candidate),
        createAdoptingPendingImageJob(candidate),
    ]);
    const winner = left || right;
    assert.ok(winner);
    assert.equal(Boolean(left) + Boolean(right), 1);
    assert.equal(winner.state, PendingJobState.ADOPTING);
    assert.deepEqual(winner.delivery, {
        mode: 'slots', chatId: 'chat-1', messageId: '4', swipeIndex: 0,
    });
    await forgetPendingImageJob(jobId, winner.leaseId);
});

test('Draw Run adoption cannot become active before placement and marker cleanup are confirmed', async () => {
    const jobId = `adoption-gate-${Date.now()}`;
    let record = await createAdoptingPendingImageJob(drawRunRecord(jobId));
    await assert.rejects(
        activateAdoptingPendingImageJob(jobId, record.leaseId),
        error => error instanceof PendingImageJobLostError,
    );
    record = await markPendingImageJobAdoptionReady(jobId, record.leaseId, record.delivery);
    assert.equal(record.adoptionPhase, PendingJobAdoptionPhase.READY);
    await assert.rejects(
        activateAdoptingPendingImageJob(jobId, record.leaseId),
        error => error instanceof PendingImageJobLostError,
    );
    record = await markPendingImageJobOriginRunAckReady(jobId, record.leaseId, record.originRunId);
    record = await activateAdoptingPendingImageJob(jobId, record.leaseId);
    assert.equal(record.state, PendingJobState.ACTIVE);
    assert.equal(record.originRunAckReady, true);
    assert.equal(record.leaseExpiresAt, 0, '激活与释放 adoption lease 必须原子完成');
    await forgetPendingImageJob(jobId, record.leaseId);
});

test('a definitely blocked adoption save can rewind placing to pending only under the same lease', async () => {
    const jobId = `adoption-rewind-${Date.now()}`;
    let record = await createAdoptingPendingImageJob(drawRunRecord(jobId));
    const staleLeaseId = record.leaseId;
    record = await markPendingImageJobAdoptionPlacing(jobId, record.leaseId);
    assert.equal(record.adoptionPhase, PendingJobAdoptionPhase.PLACING);

    record = await resetPendingImageJobAdoptionPlacement(jobId, record.leaseId);
    assert.equal(record.adoptionPhase, PendingJobAdoptionPhase.PENDING);
    await assert.rejects(
        resetPendingImageJobAdoptionPlacement(jobId, record.leaseId),
        error => error instanceof PendingImageJobLostError,
        'pending records cannot be rewound a second time',
    );

    record = await markPendingImageJobAdoptionPlacing(jobId, record.leaseId);
    await renewPendingImageJobLease(jobId, record.leaseId, { now: 0 });
    const claimed = await claimPendingImageJob(jobId, { now: PENDING_JOB_LEASE_MS + 1 });
    assert.ok(claimed);
    await assert.rejects(
        resetPendingImageJobAdoptionPlacement(jobId, staleLeaseId),
        error => error instanceof PendingImageJobLostError,
        'a stale tab cannot rewind the new owner state',
    );
    await forgetPendingImageJob(jobId, claimed.leaseId);
});

test('late Draw Run cancellation is persisted when adoption activates', async () => {
    const jobId = `adoption-cancel-${Date.now()}`;
    let record = await createAdoptingPendingImageJob(drawRunRecord(jobId));
    record = await markPendingImageJobAdoptionReady(jobId, record.leaseId, record.delivery);
    record = await markPendingImageJobOriginRunAckReady(jobId, record.leaseId, record.originRunId);
    record = await activateAdoptingPendingImageJob(jobId, record.leaseId, { cancelling: true });
    assert.equal(record.state, PendingJobState.CANCELLING);
    assert.equal(record.cancelRequested, true);
    await forgetPendingImageJob(jobId, record.leaseId);
});

test('a control page can persist Draw Run child cancellation without owning the adoption lease', async () => {
    const jobId = `adoption-control-cancel-${Date.now()}`;
    let record = await createAdoptingPendingImageJob(drawRunRecord(jobId));
    const adoptionLeaseId = record.leaseId;
    await acknowledgePendingImageJobCancellations({ jobIds: [jobId], runIds: [] });
    record = await getPendingImageJob(jobId);
    assert.equal(record.state, PendingJobState.ADOPTING);
    assert.equal(record.cancelRequested, true);
    assert.equal(record.leaseId, adoptionLeaseId);

    record = await markPendingImageJobAdoptionReady(jobId, adoptionLeaseId, record.delivery);
    record = await markPendingImageJobOriginRunAckReady(jobId, adoptionLeaseId, record.originRunId);
    record = await activateAdoptingPendingImageJob(jobId, adoptionLeaseId);
    assert.equal(record.state, PendingJobState.CANCELLING);
    await forgetPendingImageJob(jobId, adoptionLeaseId);
});

test('journal keeps this batch items but drops unused source snapshots', async () => {
    const jobId = `normalized-fields-${Date.now()}`;
    const record = await recordPendingImageJob(newRecord(jobId));
    assert.deepEqual(record.items.map(item => item.slotId), [`slot-${jobId}`]);
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

test('an exact page farewell atomically replaces a live lease without weakening lease ownership', async () => {
    const jobId = `farewell-claim-${Date.now()}`;
    const original = await recordPendingImageJob(newRecord(jobId));
    const now = Date.now();

    assert.equal(await claimPendingImageJob(jobId, { now }), null);
    assert.equal(await claimPendingImageJob(jobId, {
        now,
        farewell: { kind: 'job', id: 'another-job', leaseId: original.leaseId, at: now },
    }), null);
    assert.equal(await claimPendingImageJob(jobId, {
        now,
        farewell: { kind: 'job', id: jobId, leaseId: 'another-lease', at: now },
    }), null);

    const claimed = await claimPendingImageJob(jobId, {
        now,
        farewell: { kind: 'job', id: jobId, leaseId: original.leaseId, at: now },
    });
    assert.ok(claimed);
    assert.notEqual(claimed.leaseId, original.leaseId);
    assert.equal(claimed.leaseExpiresAt, now + PENDING_JOB_LEASE_MS);
    await assert.rejects(
        markPendingImageJobActive(jobId, original.leaseId),
        error => error instanceof PendingImageJobLostError,
    );
    await forgetPendingImageJob(jobId, claimed.leaseId);
});

test('late create and cancel notifications cannot move the journal state backwards', async () => {
    const jobId = `monotonic-state-${Date.now()}`;
    const record = await recordPendingImageJob(newRecord(jobId));

    await markPendingImageJobCancelling(jobId, record.leaseId);
    await markPendingImageJobActive(jobId, record.leaseId);
    assert.equal((await getPendingImageJob(jobId)).state, PendingJobState.CANCELLING);

    await markPendingImageJobSettling(jobId, record.leaseId, { mode: 'complete' });
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
