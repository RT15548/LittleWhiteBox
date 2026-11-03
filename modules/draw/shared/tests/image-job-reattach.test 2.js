import assert from 'node:assert/strict';
import test from 'node:test';

import { planImageJobReattach, ReattachAction } from '../image-job-reattach.js';
import { PAGE_FAREWELL_PREPARING_GRACE_MS } from '../page-farewell.js';
import { PendingJobState, PENDING_JOB_LEASE_MS } from '../pending-image-jobs.js';

const NOW = 1_000_000;

// 默认租约已过期：绝大多数用例关心的都是「原持有者已经没了」之后该怎么办。
function record(overrides = {}) {
    return {
        jobId: 'job-1',
        provider: 'novelai',
        leaseId: 'lease-dead',
        delivery: { mode: 'slots', chatId: 'chat-1', messageId: '4' },
        sourceHash: 'hash-1',
        state: PendingJobState.ACTIVE,
        leaseExpiresAt: NOW - 1,
        createdAt: NOW - 1000,
        gallery: {},
        items: [{ index: 0, slotId: 'slot-a', imgId: 'img-a', previewMetadata: {} }],
        ...overrides,
    };
}

function actionsFor(input) {
    return planImageJobReattach({ now: NOW, ...input }).plan.map(entry => entry.action);
}

test('a journal entry whose backend job is still alive is reattached', () => {
    const { plan } = planImageJobReattach({
        now: NOW,
        records: [record()],
        backendJobs: [{ id: 'job-1', state: 'running', items: [] }],
    });
    assert.deepEqual(plan.map(entry => entry.action), [ReattachAction.ATTACH]);
    assert.equal(plan[0].job.id, 'job-1');
});

// 「journal 已写、POST 未发时刷新」：后端查不到任务，但提交上下文可能还在重试。
// 租约未过期必须原地等待；过期后任务未提交成功，槽位转「任务未提交」失败卡而非清除——
// 用户没有取消，删掉他眼前的占位符等于把失败藏起来。
test('a preparing entry waits while its lease holds and fails visibly once it expires', () => {
    const preparing = record({
        state: PendingJobState.PREPARING,
        leaseExpiresAt: NOW + PENDING_JOB_LEASE_MS,
    });
    assert.deepEqual(actionsFor({ records: [preparing], backendJobs: [] }), [ReattachAction.WAIT]);

    const expired = record({ state: PendingJobState.PREPARING });
    assert.deepEqual(actionsFor({ records: [expired], backendJobs: [] }), [ReattachAction.FAIL]);
});

// 「POST 已到后端、响应未返回时刷新」：记录还停在 preparing，但后端其实已经建好任务。
// 必须按 jobId 认回来接回，而不是重新提交——重新提交会因为 requestId 幂等而拿回同一个
// 任务，但那条路径依赖后端去重，接回才是这里唯一正确的语义。
test('a preparing entry is reattached when the backend already holds the job', () => {
    const preparing = record({ state: PendingJobState.PREPARING });
    assert.deepEqual(
        actionsFor({ records: [preparing], backendJobs: [{ id: 'job-1', state: 'queued', items: [] }] }),
        [ReattachAction.ATTACH],
    );
});

test('a page farewell bypasses only its exact lease and keeps a short preparing grace', () => {
    const preparing = record({
        state: PendingJobState.PREPARING,
        leaseId: 'lease-live',
        leaseExpiresAt: NOW + PENDING_JOB_LEASE_MS,
    });
    const recentFarewell = {
        kind: 'job',
        id: preparing.jobId,
        leaseId: preparing.leaseId,
        at: NOW - PAGE_FAREWELL_PREPARING_GRACE_MS + 1,
    };
    const waiting = planImageJobReattach({
        now: NOW,
        records: [preparing],
        backendJobs: [],
        farewells: [recentFarewell],
    }).plan[0];
    assert.equal(waiting.action, ReattachAction.WAIT);
    assert.equal(waiting.retryAt, recentFarewell.at + PAGE_FAREWELL_PREPARING_GRACE_MS);

    assert.deepEqual(actionsFor({
        records: [preparing],
        backendJobs: [],
        farewells: [{ ...recentFarewell, at: NOW - PAGE_FAREWELL_PREPARING_GRACE_MS }],
    }), [ReattachAction.FAIL]);
    assert.deepEqual(actionsFor({
        records: [preparing],
        backendJobs: [{ id: preparing.jobId, state: 'queued', items: [] }],
        farewells: [recentFarewell],
    }), [ReattachAction.ATTACH]);
    assert.deepEqual(actionsFor({
        records: [{ ...preparing, state: PendingJobState.ACTIVE }],
        backendJobs: [],
        farewells: [recentFarewell],
    }), [ReattachAction.FAIL]);
    assert.deepEqual(actionsFor({
        records: [preparing],
        backendJobs: [{ id: preparing.jobId, state: 'queued', items: [] }],
        farewells: [{ ...recentFarewell, leaseId: 'lease-other' }],
    }), [ReattachAction.WAIT]);
});

// 租约是所有权凭证，优先于一切状态判断：另一个流程正在推进的记录一律不许碰，
// 否则两个流程会同时交付同一批图、同时改同一段正文。
test('any entry whose lease is still held is left alone regardless of state or backend job', () => {
    const alive = { leaseExpiresAt: NOW + 1 };
    for (const state of Object.values(PendingJobState).filter(value => value !== PendingJobState.ADOPTING)) {
        assert.deepEqual(
            actionsFor({
                records: [record({ state, ...alive })],
                backendJobs: [{ id: 'job-1', state: 'running', items: [] }],
            }),
            [ReattachAction.WAIT],
            `${state} 记录的租约仍然有效时不得被接管`,
        );
        assert.deepEqual(
            actionsFor({ records: [record({ state, ...alive })], backendJobs: [] }),
            [ReattachAction.WAIT],
            `${state} 记录的租约仍然有效时不得被作废`,
        );
    }
});

// active 任务被后端 TTL 回收：用户没有取消，槽位保留并转「后台任务已失效」失败卡。
// 只有用户显式取消（CANCELLING 且任务已消失）才允许删除槽位。
test('a vanished job fails visibly unless the user explicitly cancelled it', () => {
    assert.deepEqual(actionsFor({ records: [record()], backendJobs: [] }), [ReattachAction.FAIL]);
    assert.deepEqual(
        actionsFor({ records: [record({ state: PendingJobState.CANCELLING })], backendJobs: [] }),
        [ReattachAction.DISCARD],
    );
});

test('a cancelling entry retries the cancel only while the job still exists', () => {
    const cancelling = record({ state: PendingJobState.CANCELLING });
    assert.deepEqual(
        actionsFor({ records: [cancelling], backendJobs: [{ id: 'job-1', state: 'running', items: [] }] }),
        [ReattachAction.CANCEL],
    );
    assert.deepEqual(actionsFor({ records: [cancelling], backendJobs: [] }), [ReattachAction.DISCARD]);
});

test('a settling entry finishes its cleanup whether or not the backend job survives', () => {
    const settling = record({ state: PendingJobState.SETTLING });
    assert.deepEqual(
        actionsFor({ records: [settling], backendJobs: [{ id: 'job-1', state: 'completed', items: [] }] }),
        [ReattachAction.SETTLE],
    );
    assert.deepEqual(actionsFor({ records: [settling], backendJobs: [] }), [ReattachAction.SETTLE]);
});

test('an adopting child is claimed by Draw Run recovery but not by the image-job recovery layer', () => {
    const adopting = record({
        state: PendingJobState.ADOPTING,
        originRunId: 'run-1',
        adoptionPhase: 'pending',
    });
    const backendJob = { id: 'job-1', state: 'running', items: [] };
    const { plan, unclaimed } = planImageJobReattach({
        now: NOW,
        records: [adopting],
        backendJobs: [backendJob],
    });
    assert.deepEqual(plan, []);
    assert.deepEqual(unclaimed, []);
});

test('backend jobs without a local journal entry are reported but never touched', () => {
    const { plan, unclaimed } = planImageJobReattach({
        now: NOW,
        records: [record()],
        backendJobs: [
            { id: 'job-1', state: 'running', items: [] },
            { id: 'job-from-another-device', state: 'running', items: [] },
        ],
    });
    assert.deepEqual(plan.map(entry => entry.action), [ReattachAction.ATTACH]);
    assert.deepEqual(unclaimed.map(job => job.id), ['job-from-another-device']);
});
