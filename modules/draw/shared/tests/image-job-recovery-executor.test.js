import assert from 'node:assert/strict';
import test from 'node:test';

import { executeImageJobReattachEntry } from '../image-job-recovery-executor.js';
import { planImageJobReattach } from '../image-job-reattach.js';
import { PendingImageJobLostError, PendingJobState } from '../pending-image-jobs.js';
import { submitRecoverableImageJob } from '../recoverable-image-jobs.js';
import { isSceneSlotAlive } from '../scene-placement.js';

function createJournal() {
    const store = new Map();
    let leaseCounter = 0;
    const journal = {
        store,
        async record(record) {
            const entry = {
                ...record,
                leaseId: `lease-${++leaseCounter}`,
                state: PendingJobState.PREPARING,
                leaseExpiresAt: Date.now() + 1000,
                settlement: null,
            };
            store.set(entry.jobId, entry);
            return entry;
        },
        async claim(jobId) {
            const entry = store.get(jobId);
            if (!entry || entry.leaseExpiresAt > Date.now()) return null;
            const claimed = {
                ...entry,
                leaseId: `lease-${++leaseCounter}`,
                leaseExpiresAt: Date.now() + 1000,
            };
            store.set(jobId, claimed);
            return claimed;
        },
        async get(jobId) {
            return store.get(jobId) || null;
        },
        async fenceLease(jobId, leaseId) {
            const entry = store.get(jobId);
            if (!entry || entry.leaseId !== leaseId) throw new PendingImageJobLostError(jobId, '所有权已变化');
            return entry;
        },
        async renewLease(jobId, leaseId) {
            return journal.fenceLease(jobId, leaseId).catch(() => null);
        },
        async markActive(jobId, leaseId) {
            const entry = await journal.fenceLease(jobId, leaseId);
            entry.state = PendingJobState.ACTIVE;
            return entry;
        },
        async markCancelling(jobId, leaseId) {
            const entry = await journal.fenceLease(jobId, leaseId);
            entry.state = PendingJobState.CANCELLING;
            return entry;
        },
        async markSettling(jobId, leaseId, settlement) {
            const entry = await journal.fenceLease(jobId, leaseId);
            entry.state = PendingJobState.SETTLING;
            entry.settlement = settlement;
            return entry;
        },
        async releaseLease(jobId, leaseId) {
            const entry = await journal.fenceLease(jobId, leaseId);
            entry.leaseExpiresAt = 0;
            return entry;
        },
        async forget(jobId, leaseId) {
            await journal.fenceLease(jobId, leaseId);
            store.delete(jobId);
        },
    };
    return journal;
}

function plan() {
    return {
        delivery: { mode: 'slots', chatId: 'chat-1', messageId: '7' },
        sourceHash: 'hash-1',
        gallery: {},
        items: [{
            index: 0,
            slotId: 'slot-a',
            imgId: 'img-a',
            previewMetadata: { tags: 'scene', positive: 'scene' },
        }],
    };
}

test('a new frontend instance reattaches a submitted job and ACK follows image plus selection persistence', async () => {
    const journal = createJournal();
    let message = 'story';
    const firstClient = {
        async runJob(_request, options) {
            await options.onStateChange('created', { job: { id: options.requestId } });
            const error = new Error('the first frontend was destroyed');
            error.detached = true;
            throw error;
        },
    };

    await assert.rejects(submitRecoverableImageJob({
        client: firstClient,
        journal,
        provider: 'novelai',
        request: { items: [{}] },
        plan: plan(),
        commitPlacements() {
            if (message !== 'story') return false;
            message = 'story\n[image:slot-a]';
            return true;
        },
    }), error => error.detached === true);

    const abandoned = [...journal.store.values()][0];
    assert.equal(abandoned.leaseExpiresAt, 0, '旧页面停止推进后，新页面应能立即接管');
    const recoveryPlan = planImageJobReattach({
        records: [abandoned],
        backendJobs: [{ id: abandoned.jobId, state: 'completed', items: [{ index: 0, state: 'ready' }] }],
    }).plan[0];

    const order = [];
    const gallery = new Map();
    const selections = new Map();
    const secondClient = {
        async attachJob(_jobId, options) {
            await options.onStateChange('status', { job: { items: [{ index: 0, state: 'ready' }] } });
            await options.onItemReady({ index: 0, response: { bytes: 'image-data' }, kind: 'image' });
            order.push('ack');
            return {
                job: { state: 'completed', items: [{ index: 0, state: 'consumed' }] },
                preserved: new Set(),
                deliveryErrors: new Map(),
            };
        },
    };
    const delivery = {
        onStateChange(_record, state, data) {
            const itemState = data?.job?.items?.[0]?.state;
            order.push(`state:${state}${itemState ? `:${itemState}` : ''}`);
        },
        async deliver(_record, item, payload) {
            order.push('store-image');
            gallery.set(item.imgId, payload.response.bytes);
            await Promise.resolve();
            order.push('store-selection');
            selections.set(item.slotId, item.imgId);
        },
        async failItem() {
            throw new Error('the recovered item should not fail');
        },
        async settle(_record, settlement) {
            order.push(`settle:${settlement.mode}`);
        },
        async afterForget(_record, settlement, details) {
            assert.equal(journal.store.size, 0, '最终渲染只能发生在 journal 删除之后');
            assert.equal(settlement.mode, 'complete');
            assert.equal(details.result?.job?.state, 'completed');
            order.push('final-render');
        },
        describeError() {
            return null;
        },
    };

    await executeImageJobReattachEntry({ entry: recoveryPlan, client: secondClient, delivery, journal });

    assert.equal(message, 'story\n[image:slot-a]');
    assert.equal(gallery.get('img-a'), 'image-data');
    assert.equal(selections.get('slot-a'), 'img-a');
    assert.deepEqual(order, [
        'state:status:ready',
        'store-image',
        'store-selection',
        'ack',
        'settle:complete',
        'final-render',
    ]);
    assert.equal(journal.store.size, 0, '全部交付和结算完成后才删除恢复记录');
});

test('a persisted settling mode is replayed after another frontend crash', async () => {
    const journal = createJournal();
    const created = await journal.record({ ...plan(), jobId: 'job-settling', provider: 'novelai' });
    created.state = PendingJobState.SETTLING;
    created.settlement = { mode: 'discard', errorType: {} };
    created.leaseExpiresAt = 0;
    const entry = planImageJobReattach({ records: [created], backendJobs: [] }).plan[0];
    const modes = [];

    await executeImageJobReattachEntry({
        entry,
        client: {},
        journal,
        delivery: {
            settle(_record, settlement) { modes.push(settlement.mode); },
        },
    });

    assert.deepEqual(modes, ['discard']);
    assert.equal(journal.store.size, 0);
});

test('settlement uses the mode committed by the journal transaction', async () => {
    const journal = createJournal();
    const created = await journal.record({ ...plan(), jobId: 'job-settlement-race', provider: 'novelai' });
    created.state = PendingJobState.ACTIVE;
    created.leaseExpiresAt = 0;
    const entry = planImageJobReattach({ records: [created], backendJobs: [] }).plan[0];
    const originalMarkSettling = journal.markSettling;
    journal.markSettling = (jobId, leaseId) => originalMarkSettling(
        jobId,
        leaseId,
        { mode: 'discard' },
    );
    const modes = [];

    await executeImageJobReattachEntry({
        entry,
        client: {},
        journal,
        delivery: {
            settle(_record, settlement) { modes.push(settlement.mode); },
            describeMissingJob() { return { label: 'missing' }; },
        },
    });

    assert.deepEqual(modes, ['discard']);
});

test('a cancellation persisted while attachment is running settles unfinished slots as discard', async () => {
    const journal = createJournal();
    const created = await journal.record({ ...plan(), jobId: 'job-late-cancel', provider: 'novelai' });
    created.state = PendingJobState.ACTIVE;
    created.leaseExpiresAt = 0;
    const entry = planImageJobReattach({
        records: [created],
        backendJobs: [{ id: created.jobId, state: 'running', items: [] }],
    }).plan[0];
    const settlements = [];

    await executeImageJobReattachEntry({
        entry,
        journal,
        client: {
            async attachJob() {
                const live = journal.store.get(created.jobId);
                live.state = PendingJobState.CANCELLING;
                live.cancelRequested = true;
                return { job: { state: 'cancelled', items: [] }, preserved: new Set(), deliveryErrors: new Map() };
            },
        },
        delivery: {
            settle(_record, settlement) { settlements.push(settlement.mode); },
            describeError() { return null; },
        },
    });

    assert.deepEqual(settlements, ['discard']);
    assert.equal(journal.store.size, 0);
});

test('a Draw Run ACK gate must open before a settling image journal can be forgotten', async () => {
    const journal = createJournal();
    const created = await journal.record({ ...plan(), jobId: 'job-ack-gate', provider: 'novelai' });
    created.state = PendingJobState.SETTLING;
    created.settlement = { mode: 'complete', errorType: {} };
    created.leaseExpiresAt = 0;
    let gateOpen = false;
    const delivery = {
        settle() {},
        beforeForget() {
            if (!gateOpen) throw new Error('marker is still persisted');
        },
    };

    const firstEntry = planImageJobReattach({ records: [created], backendJobs: [] }).plan[0];
    await assert.rejects(
        executeImageJobReattachEntry({ entry: firstEntry, client: {}, delivery, journal }),
        /marker is still persisted/,
    );
    assert.equal(journal.store.get(created.jobId).state, PendingJobState.SETTLING);

    journal.store.get(created.jobId).leaseExpiresAt = 0;
    gateOpen = true;
    const retryEntry = planImageJobReattach({
        records: [journal.store.get(created.jobId)],
        backendJobs: [],
    }).plan[0];
    await executeImageJobReattachEntry({ entry: retryEntry, client: {}, delivery, journal });
    assert.equal(journal.store.has(created.jobId), false);
});

test('reattachment acknowledges but never restores a slot the user deleted', async () => {
    const journal = createJournal();
    const record = await journal.record({ ...plan(), jobId: 'job-deleted-slot', provider: 'sd-webui' });
    record.state = PendingJobState.ACTIVE;
    record.leaseExpiresAt = 0;
    const entry = planImageJobReattach({
        records: [record],
        backendJobs: [{ id: record.jobId, state: 'completed', items: [{ index: 0, state: 'ready' }] }],
    }).plan[0];
    let message = 'story';
    let stored = false;
    let acknowledged = false;

    await executeImageJobReattachEntry({
        entry,
        journal,
        client: {
            async attachJob(_jobId, options) {
                await options.onItemReady({ index: 0, response: {}, kind: 'image' });
                acknowledged = true;
                return { job: { state: 'completed', items: [] }, preserved: new Set(), deliveryErrors: new Map() };
            },
        },
        delivery: {
            deliver(_record, item) {
                if (isSceneSlotAlive(message, item.slotId)) stored = true;
            },
            failItem() {},
            settle() {},
            describeError() { return null; },
        },
    });

    assert.equal(stored, false);
    assert.equal(acknowledged, true, '已删除槽位的后端结果应被确认丢弃，不能永久占用后端存储');
    assert.equal(message, 'story', '恢复流程不得重建用户删除的占位符');
});
