import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

const { createPlanLedger } = await import('../../agent-core/plan-ledger.js');
const { default: db, plansTable } = await import('../shared/session-db.js');

async function resetDb() {
    await db.delete();
    await db.open();
}

function createDeterministicLedger() {
    let idCounter = 0;
    let time = 1000;
    return createPlanLedger({
        createId: () => {
            idCounter += 1;
            return `plan-${idCounter}`;
        },
        now: () => {
            time += 1;
            return time;
        },
        plansTable,
    });
}

test('PlanLedger creates and lists plans only for the current session', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const first = await ledger.createPlan('session-a', {
        title: '检查设置页',
    });
    assert.equal(first.ok, true);
    assert.equal(first.plan.id, 'plan-1');
    assert.equal(first.plan.status, 'pending');
    assert.equal(first.plan.priority, 'normal');
    assert.equal(first.plan.owner, 'assistant');

    await ledger.createPlan('session-b', {
        title: '另一个会话的计划',
        priority: 'high',
    });

    const list = await ledger.listPlans('session-a');
    assert.equal(list.ok, true);
    assert.equal(list.count, 1);
    assert.equal(list.plans[0].id, 'plan-1');
});

test('PlanLedger blocks in_progress until dependencies are completed', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const blocker = await ledger.createPlan('session-a', {
        title: '先完成的步骤',
    });
    const blocked = await ledger.createPlan('session-a', {
        title: '等待依赖的步骤',
        blockedBy: [blocker.plan.id],
    });
    assert.equal(blocked.ok, true);
    assert.equal(blocked.plan.status, 'blocked');
    assert.equal(blocked.blockers.length, 1);

    const rejected = await ledger.updatePlan('session-a', {
        id: blocked.plan.id,
        status: 'in_progress',
    });
    assert.equal(rejected.ok, false);
    assert.equal(rejected.error, 'plan_blocked');
    assert.equal(rejected.blockers[0].id, blocker.plan.id);

    const completedBlocker = await ledger.updatePlan('session-a', {
        id: blocker.plan.id,
        status: 'completed',
        result: 'done',
    });
    assert.equal(completedBlocker.ok, true);
    assert.equal(completedBlocker.plan.completedAt > 0, true);

    const started = await ledger.updatePlan('session-a', {
        id: blocked.plan.id,
        status: 'in_progress',
        note: '依赖完成后开始',
    });
    assert.equal(started.ok, true);
    assert.equal(started.plan.status, 'in_progress');
    assert.deepEqual(started.plan.notes, ['依赖完成后开始']);

    const done = await ledger.updatePlan('session-a', {
        id: blocked.plan.id,
        status: 'completed',
    });
    assert.equal(done.plan.completedAt > 0, true);

    const reopened = await ledger.updatePlan('session-a', {
        id: blocked.plan.id,
        status: 'pending',
    });
    assert.equal(reopened.plan.completedAt, 0);
});

test('PlanLedger accepts single string blockedBy from loose tool callers', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const blocker = await ledger.createPlan('session-a', {
        title: '前置步骤',
    });
    const blocked = await ledger.createPlan('session-a', {
        title: '后续步骤',
        blockedBy: blocker.plan.id,
    });

    assert.equal(blocked.ok, true);
    assert.equal(blocked.plan.status, 'blocked');
    assert.deepEqual(blocked.plan.blockedBy, [blocker.plan.id]);
    assert.equal(blocked.blockers[0].id, blocker.plan.id);
});

test('PlanLedger rejects missing blockedBy ids before writing', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const missingCreate = await ledger.createPlan('session-a', {
        title: '依赖不存在的计划',
        blockedBy: ['plan-missing'],
    });
    assert.equal(missingCreate.ok, false);
    assert.equal(missingCreate.error, 'plan_blocked_by_not_found');
    assert.deepEqual(missingCreate.missing, ['plan-missing']);

    const emptyList = await ledger.listPlans('session-a');
    assert.equal(emptyList.count, 0);

    const created = await ledger.createPlan('session-a', {
        title: '原计划',
    });
    const missingUpdate = await ledger.updatePlan('session-a', {
        id: created.plan.id,
        blockedBy: ['plan-stale'],
    });
    assert.equal(missingUpdate.ok, false);
    assert.equal(missingUpdate.error, 'plan_blocked_by_not_found');
    assert.deepEqual(missingUpdate.missing, ['plan-stale']);

    const unchanged = await ledger.getPlan('session-a', {
        id: created.plan.id,
    });
    assert.deepEqual(unchanged.plan.blockedBy, []);
    assert.equal(unchanged.plan.status, 'pending');
});

test('PlanLedger rejects transitive blockedBy cycles before writing', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const first = await ledger.createPlan('session-a', {
        title: '第一步',
    });
    const second = await ledger.createPlan('session-a', {
        title: '第二步',
        blockedBy: [first.plan.id],
    });
    const third = await ledger.createPlan('session-a', {
        title: '第三步',
        blockedBy: [second.plan.id],
    });

    const cycle = await ledger.updatePlan('session-a', {
        id: first.plan.id,
        blockedBy: [third.plan.id],
    });
    assert.equal(cycle.ok, false);
    assert.equal(cycle.error, 'plan_blocked_by_cycle');
    assert.equal(cycle.id, first.plan.id);
    assert.deepEqual(cycle.blockedBy, [third.plan.id]);

    const unchanged = await ledger.getPlan('session-a', {
        id: first.plan.id,
    });
    assert.deepEqual(unchanged.plan.blockedBy, []);
    assert.equal(unchanged.plan.status, 'pending');
});

test('PlanLedger does not keep in_progress when unfinished blockers are added', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const blocker = await ledger.createPlan('session-a', {
        title: '未完成依赖',
    });
    const active = await ledger.createPlan('session-a', {
        title: '正在执行项',
    });
    await ledger.updatePlan('session-a', {
        id: active.plan.id,
        status: 'in_progress',
    });

    const reblocked = await ledger.updatePlan('session-a', {
        id: active.plan.id,
        blockedBy: [blocker.plan.id],
    });
    assert.equal(reblocked.ok, true);
    assert.equal(reblocked.plan.status, 'blocked');
    assert.equal(reblocked.blockers[0].id, blocker.plan.id);

    const rejectedStart = await ledger.updatePlan('session-a', {
        id: active.plan.id,
        status: 'in_progress',
    });
    assert.equal(rejectedStart.ok, false);
    assert.equal(rejectedStart.error, 'plan_blocked');
    assert.equal(rejectedStart.blockers[0].id, blocker.plan.id);
});

test('PlanLedger rejects invalid status and priority instead of pretending success', async () => {
    await resetDb();
    const ledger = createDeterministicLedger();

    const created = await ledger.createPlan('session-a', {
        title: '检查非法参数',
    });
    const invalidStatus = await ledger.updatePlan('session-a', {
        id: created.plan.id,
        status: 'done',
    });
    assert.equal(invalidStatus.ok, false);
    assert.equal(invalidStatus.error, 'plan_status_invalid');

    const stillPending = await ledger.getPlan('session-a', {
        id: created.plan.id,
    });
    assert.equal(stillPending.plan.status, 'pending');

    const invalidCreatePriority = await ledger.createPlan('session-a', {
        title: '错误优先级',
        priority: 'soon',
    });
    assert.equal(invalidCreatePriority.ok, false);
    assert.equal(invalidCreatePriority.error, 'plan_priority_invalid');

    const invalidListStatus = await ledger.listPlans('session-a', {
        status: 'done',
    });
    assert.equal(invalidListStatus.ok, false);
    assert.equal(invalidListStatus.error, 'plan_status_invalid');
});
