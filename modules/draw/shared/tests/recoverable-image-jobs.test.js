import assert from 'node:assert/strict';
import test from 'node:test';

import {
    isPendingJobLeaseLost,
    PlacementNotCommittedError,
    reattachRecoverableImageJob,
    submitRecoverableImageJob,
} from '../recoverable-image-jobs.js';
import { PendingImageJobLostError, PendingJobState } from '../pending-image-jobs.js';

// 假交付日志：只保留状态机与所有权，不碰 IndexedDB。
// 被测对象是「什么必须发生在什么之前」，存储实现不在证明范围内。
function createFakeJournal() {
    const store = new Map();
    const calls = [];
    let leaseCounter = 0;
    const journal = {
        calls,
        store,
        async record(record) {
            calls.push(`record:${record.jobId}`);
            const entry = {
                ...record,
                leaseId: `lease-${++leaseCounter}`,
                state: PendingJobState.PREPARING,
            };
            store.set(record.jobId, entry);
            return entry;
        },
        async fenceLease(jobId, leaseId) {
            calls.push(`fenceLease:${jobId}`);
            const entry = store.get(jobId);
            if (!entry) throw new PendingImageJobLostError(jobId, '记录已被清理');
            if (entry.leaseId !== leaseId) throw new PendingImageJobLostError(jobId, '记录已被其他页面接管');
            return entry;
        },
        async renewLease(jobId, leaseId) {
            const entry = store.get(jobId);
            return entry && entry.leaseId === leaseId ? entry : null;
        },
        async markActive(jobId, leaseId) {
            calls.push(`markActive:${jobId}`);
            return journal.fenceLease(jobId, leaseId).then((entry) => {
                entry.state = PendingJobState.ACTIVE;
                return entry;
            });
        },
        async markCancelling(jobId, leaseId) {
            return journal.fenceLease(jobId, leaseId).then((entry) => {
                entry.state = PendingJobState.CANCELLING;
                return entry;
            });
        },
        async markSettling(jobId, leaseId) {
            calls.push(`markSettling:${jobId}`);
            return journal.fenceLease(jobId, leaseId).then((entry) => {
                entry.state = PendingJobState.SETTLING;
                return entry;
            });
        },
        async forget(jobId, leaseId) {
            calls.push(`forget:${jobId}`);
            await journal.fenceLease(jobId, leaseId);
            store.delete(jobId);
            return true;
        },
    };
    return journal;
}

function createFakeClient({ onRun } = {}) {
    const submissions = [];
    return {
        submissions,
        async runJob(request, options) {
            submissions.push({ request, requestId: options.requestId });
            await onRun?.(options);
            await options.onStateChange?.('created', { job: { id: options.requestId } });
            return { job: { id: options.requestId, state: 'completed', items: [] }, preserved: new Set() };
        },
        async attachJob() {
            throw new Error('本用例不应接回任务');
        },
    };
}

function basePlan() {
    return {
        chatId: 'chat-1',
        messageId: '7',
        replacedSlotIds: ['old-slot'],
        gallery: { characterName: 'A' },
        items: [{ index: 0, slotId: 'slot-a', imgId: 'img-a', previewMetadata: {} }],
    };
}

// 主人指定的关键边界：页面冻结超过租约时长，另一个页面已经把 preparing 记录清理掉了。
// 旧页面解冻后原地继续执行，绝不允许再向后端提交——那会凭一个没人认领的 requestId
// 造出孤儿任务，而它对应的槽位早已从正文里删除。
test('a frozen flow whose journal entry was cleaned up never reaches the backend', async () => {
    const journal = createFakeJournal();
    const client = createFakeClient();
    let jobId = null;

    await assert.rejects(
        submitRecoverableImageJob({
            client,
            journal,
            provider: 'novelai',
            request: { items: [] },
            plan: basePlan(),
            // 持久化期间页面冻结了很久：等它回来时，接管方已经判定租约过期并清掉了记录。
            commitPlacements: ({ jobId: id }) => {
                jobId = id;
                journal.store.delete(id);
                return true;
            },
        }),
        (error) => isPendingJobLeaseLost(error),
    );

    assert.deepEqual(client.submissions, [], '记录已被清理时不得向后端提交');
    assert.deepEqual(journal.calls, [
        `record:${jobId}`,
        `fenceLease:${jobId}`,
        `fenceLease:${jobId}`,
    ]);
});

// 同一个窗口的另一种结局：记录还在，但已经被别的页面接管（leaseId 已换发）。
// 旧页面同样必须停手，收尾归新持有者，它连清槽和删记录都不该做。
test('a frozen flow whose journal entry was taken over neither submits nor cleans up', async () => {
    const journal = createFakeJournal();
    const client = createFakeClient();
    let settleCalls = 0;

    await assert.rejects(
        submitRecoverableImageJob({
            client,
            journal,
            provider: 'novelai',
            request: { items: [] },
            plan: basePlan(),
            settlePlacements: () => { settleCalls++; },
            commitPlacements: ({ jobId }) => {
                journal.store.get(jobId).leaseId = 'lease-from-another-page';
                return true;
            },
        }),
        (error) => isPendingJobLeaseLost(error),
    );

    assert.deepEqual(client.submissions, [], '记录已易主时不得向后端提交');
    assert.equal(settleCalls, 0, '收尾归新持有者，旧流程不得清槽');
    assert.equal(journal.store.size, 1, '旧流程不得删除已经易主的记录');
});

// 顺序契约：日志必须先落盘，之后才允许持久化占位符，POST 必须最后发生。
// 反过来任意一步提前，都会产生一类无法自愈的坏状态。
test('the journal entry is written before placements are persisted and both precede the submit', async () => {
    const journal = createFakeJournal();
    const order = [];
    const client = createFakeClient({ onRun: () => { order.push('submit'); } });

    const result = await submitRecoverableImageJob({
        client,
        journal,
        provider: 'novelai',
        request: { items: [] },
        plan: basePlan(),
        commitPlacements: ({ jobId }) => {
            order.push('commit');
            assert.equal(journal.store.get(jobId).state, PendingJobState.PREPARING);
            return true;
        },
    });

    assert.deepEqual(order, ['commit', 'submit']);
    assert.equal(journal.calls[0], `record:${result.jobId}`);
    assert.ok(journal.calls.indexOf('fenceLease:' + result.jobId) < journal.calls.indexOf('markActive:' + result.jobId));
});

// 严格 CAS 失败（用户在这期间改了正文）：占位符没进正文，日志必须一起作废，
// 而且绝不能提交后端——否则出来的图没有任何槽位可以安放。
test('a failed placement commit discards the journal entry without submitting', async () => {
    const journal = createFakeJournal();
    const client = createFakeClient();

    await assert.rejects(
        submitRecoverableImageJob({
            client,
            journal,
            provider: 'novelai',
            request: { items: [] },
            plan: basePlan(),
            commitPlacements: () => false,
        }),
        (error) => error instanceof PlacementNotCommittedError,
    );

    assert.deepEqual(client.submissions, []);
    assert.equal(journal.store.size, 0, 'CAS 失败后不得留下无对应槽位的记录');
});

test('an uncertain placement save keeps the journal and never submits', async () => {
    const journal = createFakeJournal();
    const client = createFakeClient();
    const saveError = new Error('save failed');

    await assert.rejects(
        submitRecoverableImageJob({
            client,
            journal,
            provider: 'novelai',
            request: { items: [] },
            plan: basePlan(),
            commitPlacements: async () => { throw saveError; },
        }),
        error => error === saveError,
    );

    assert.deepEqual(client.submissions, []);
    assert.equal(journal.store.size, 1, '保存结果不确定时必须保留 journal 供刷新后核对 slot');
    assert.equal([...journal.store.values()][0].state, PendingJobState.PREPARING);
});

// POST 确认（'created'）之后才允许转 active：在那之前后端查不到 jobId 是正常的，
// 把它当成「任务已消失」就会误清一批正在创建的槽位。
test('the entry becomes active only after the backend confirms the job', async () => {
    const journal = createFakeJournal();
    const seenStates = [];
    const client = createFakeClient({
        onRun: () => {
            const entry = [...journal.store.values()][0];
            seenStates.push(entry.state);
        },
    });

    await submitRecoverableImageJob({
        client,
        journal,
        provider: 'novelai',
        request: { items: [] },
        plan: basePlan(),
        commitPlacements: () => true,
    });

    assert.deepEqual(seenStates, [PendingJobState.PREPARING], '提交送达前记录必须还是 preparing');
});

// 收尾顺序：先 settling 再清槽再删记录。清槽中途崩溃时，settling 是下一次恢复
// 能把清理做完的唯一依据；反过来先删记录，正文里会永久留下失效占位卡。
test('settlement marks the entry before clearing slots and forgets it only afterwards', async () => {
    const journal = createFakeJournal();
    const client = createFakeClient();
    const order = [];

    const result = await submitRecoverableImageJob({
        client,
        journal,
        provider: 'novelai',
        request: { items: [] },
        plan: basePlan(),
        commitPlacements: () => true,
        settlePlacements: ({ jobId }) => {
            order.push('settle');
            assert.equal(journal.store.get(jobId).state, PendingJobState.SETTLING);
        },
    });

    assert.deepEqual(order, ['settle']);
    assert.ok(
        journal.calls.indexOf(`markSettling:${result.jobId}`) < journal.calls.indexOf(`forget:${result.jobId}`),
        '记录必须先进入 settling，删除只能发生在清槽之后',
    );
    assert.equal(journal.store.size, 0);
});

// 任务还活在后端（detached）时收尾必须整体跳过：日志和槽位都要留着，
// 图还会出来，交给下一次 reconcile 接回。
test('a detached run keeps its journal entry and slots for the next reconcile', async () => {
    const journal = createFakeJournal();
    let settleCalls = 0;
    const client = {
        submissions: [],
        async runJob(request, options) {
            await options.onStateChange?.('created', { job: { id: options.requestId } });
            const error = new Error('连接断了');
            error.detached = true;
            throw error;
        },
    };

    await assert.rejects(
        submitRecoverableImageJob({
            client,
            journal,
            provider: 'novelai',
            request: { items: [] },
            plan: basePlan(),
            commitPlacements: () => true,
            settlePlacements: () => { settleCalls++; },
        }),
        (error) => error.detached === true,
    );

    assert.equal(settleCalls, 0, 'detached 任务不得清槽');
    assert.equal(journal.store.size, 1, 'detached 任务必须保留恢复记录');
    assert.equal([...journal.store.values()][0].state, PendingJobState.ACTIVE);
});

test('an unconfirmed cancellation remains CANCELLING for the next reconcile', async () => {
    const journal = createFakeJournal();
    const controller = new AbortController();
    const client = {
        async runJob(_request, options) {
            await options.onStateChange?.('created', { job: { id: options.requestId } });
            controller.abort();
            await new Promise(resolve => setTimeout(resolve, 0));
            const error = new Error('cancel response lost');
            error.detached = true;
            throw error;
        },
    };

    await assert.rejects(submitRecoverableImageJob({
        client,
        journal,
        provider: 'novelai',
        request: { items: [] },
        plan: basePlan(),
        commitPlacements: () => true,
        cancelSignal: controller.signal,
    }), error => error.detached === true);

    assert.equal([...journal.store.values()][0].state, PendingJobState.CANCELLING);
});

test('a result retained after persistence failure keeps the journal for a later attachment', async () => {
    const journal = createFakeJournal();
    const client = createFakeClient({
        onRun: () => {},
    });
    client.runJob = async (request, options) => {
        await options.onStateChange?.('created', { job: { id: options.requestId } });
        return {
            job: { id: options.requestId, state: 'completed', items: [] },
            preserved: new Set([0]),
        };
    };

    await assert.rejects(
        submitRecoverableImageJob({
            client,
            journal,
            provider: 'novelai',
            request: { items: [] },
            plan: basePlan(),
            commitPlacements: () => true,
        }),
        error => error.detached === true && error.code === 'backend_results_preserved',
    );

    const record = [...journal.store.values()][0];
    assert.equal(record.state, PendingJobState.ACTIVE);

    client.attachJob = async () => ({
        job: { id: record.jobId, state: 'completed', items: [] },
        preserved: new Set([0]),
    });
    await assert.rejects(
        reattachRecoverableImageJob({ client, journal, record }),
        error => error.detached === true && error.code === 'backend_results_preserved',
    );
    assert.equal(journal.store.size, 1, '接回仍未落库时必须继续保留恢复记录');
});
