import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers';

import {
    createEconomyCapabilityRegistrations,
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
} from '../capabilities/economy/index.js';
import { AGENT_CAPABILITY } from '../capabilities/agent/index.js';
import { MAINTENANCE_CAPABILITY } from '../capabilities/maintenance/index.js';
import { MAP_CONTEXT_CAPABILITY } from '../apps/map/context-capability.js';
import { WORLD_CONTEXT_CAPABILITY } from '../apps/world/context-capability.js';
import { createTaskIdFactory } from '../apps/tasks/application/ids.js';
import { createTasksService } from '../apps/tasks/application/service.js';
import { createTaskController } from '../apps/tasks/host/controller.js';
import { createTaskCompletionRuntime } from '../apps/tasks/host/completion-runtime.js';
import { createTaskMaintenanceParticipant } from '../apps/tasks/host/maintenance-participant.js';
import { buildTaskPromptBlock } from '../apps/tasks/host/prompt-runtime.js';
import { createTasksModule } from '../apps/tasks/module.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { ensureEconomy, projectBalances } from '../domains/economy/ledger.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';

const allowCommit = () => true;
const binding = { kind: 'character', ownerLocator: 'tasks.png', chatId: 'chat-a' };

function listing() {
    return {
        grade: 'B',
        tags: ['禁忌', '旧城'],
        posture: '中介入',
        title: '封蜡信',
        hook: '匿名委托人留下了一封不能拆开的信。',
        objective: '把封蜡信交给钟楼守卫',
        requirements: '不得拆封',
        location: '旧城钟楼',
        timing: '任意时候',
        risk: '可能被巡逻者盘问',
        reward: 150,
    };
}

function publishedForm(reward = 80) {
    return {
        title: '护送药箱',
        objective: '把药箱送到南门诊所',
        requirements: '保持药箱直立',
        location: '南门诊所',
        risk: '道路可能封锁',
        reward,
    };
}

function candidate() {
    return {
        name: '艾拉',
        description: '熟悉旧城路线的佣兵',
        pitch: '我能避开巡逻路线。',
        capability: '潜行与路线规划',
        risk: '不愿伤及无辜',
    };
}

async function createHarness() {
    let opaqueId = 0;
    let kernelId = 0;
    let clock = 1_000;
    const initialLedger = ensureEconomy(undefined, { now: () => ++clock, createId: () => 'tx-opening' });
    const state = {
        writes: [],
        replaceImpl: null,
        capture: {
            identityKey: 'character:tasks.png:chat-a',
            binding,
            reference: { formatVersion: 1, osId: 'tasks-os' },
        },
        persisted: {
            formatVersion: 1,
            osId: 'tasks-os',
            binding,
            revision: 0,
            commitId: 'commit-0',
            partitions: {
                economy: initialLedger,
                unrelated: { owner: 'another-app', value: 7 },
            },
        },
    };
    const storage = {
        read: async () => structuredClone(state.persisted),
        async replace(input) {
            state.writes.push(structuredClone(input));
            if (state.replaceImpl) { return await state.replaceImpl(input); }
            state.persisted = structuredClone(input.candidate);
            return { status: 'confirmed' };
        },
        delete: async () => 'deleted',
    };
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const partitions = new XiaobaiOsPartitionRegistry();
    for (const registration of capabilities.partitions()) { partitions.register(registration); }
    partitions.register(TASKS_PARTITION);
    const coordinator = createTransactionCoordinator({
        storage,
        partitions,
        capabilityBinder: capabilities,
        chatReferences: {
            capture: () => structuredClone(state.capture),
            isCurrent: captured => captured.identityKey === state.capture.identityKey,
            install: async () => ({ status: 'confirmed' }),
        },
        createId: () => `commit-${++kernelId}`,
    });
    await capabilities.install({
        createStore: (registration, allowedCapabilities) =>
            coordinator.createScopedStore(registration, { allowedCapabilities }),
        files: coordinator,
    });
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    const store = coordinator.createScopedStore(TASKS_PARTITION, {
        allowedCapabilities: [ECONOMY_TRANSACTION_CAPABILITY],
    });
    const tasks = createTasksService(store, coordinator, economy, {
        now: () => ++clock,
        ids: createTaskIdFactory({ randomUuid: () => `opaque-${++opaqueId}`, now: () => clock }),
        getPlayerDisplayName: () => '主人',
        getObservedAssistantCount: () => 3,
    });
    await tasks.refreshCurrent();
    return { capabilities, coordinator, economy, state, store, tasks };
}

function ledgerOf(harness) {
    return harness.state.persisted.partitions.economy;
}

async function publishAndAssign(harness, prefix, form = publishedForm()) {
    const published = await harness.tasks.publish({ actionId: `${prefix}-publish`, form }, allowCommit);
    const replaced = await harness.tasks.replaceCandidates({
        actionId: `${prefix}-candidates`,
        taskId: published.record.taskId,
        expectedTaskRevision: published.record.taskRevision,
        expectedEventId: published.record.eventId,
        candidates: [candidate()],
        observedAssistantCount: 3,
    }, allowCommit);
    return await harness.tasks.assignCandidate({
        actionId: `${prefix}-assign`,
        taskId: replaced.record.taskId,
        expectedTaskRevision: replaced.record.taskRevision,
        expectedEventId: replaced.record.eventId,
        candidateId: replaced.record.candidates[0].candidateId,
    }, allowCommit);
}

function maintenanceCommand(kind, actionId, record, summary) {
    return {
        kind,
        actionId,
        taskId: record.taskId,
        expectedTaskRevision: record.taskRevision,
        expectedEventId: record.eventId,
        ...(kind === 'progress' ? { progressSummary: summary } : { resultSummary: summary }),
    };
}

async function acceptTask(harness, prefix = 'received') {
    const board = await harness.tasks.replaceBoard({ expectedBoardId: null, listings: [listing()], generatedAt: 10 }, allowCommit);
    return harness.tasks.acceptListing({
        actionId: `${prefix}-accept`, boardId: board.view.domain.board.boardId,
        listingId: board.view.domain.board.listings[0].listingId,
    }, allowCommit);
}

function cancellation(record, actionId = 'cancel-task') {
    return { actionId, taskId: record.taskId, expectedTaskRevision: record.taskRevision, expectedEventId: record.eventId };
}

test('current task storage accepts reordered assignee fields while rejecting changed assignment facts', async () => {
    const h = await createHarness();
    const assigned = await publishAndAssign(h, 'field-order');
    const disk = h.state.persisted;
    const event = disk.partitions.tasks.events.find(entry => entry.kind === 'assigned');
    event.assignee = Object.fromEntries(Object.entries(event.assignee).reverse());
    const originalDisk = structuredClone(disk);
    const writes = h.state.writes.length;
    await h.coordinator.refresh();
    const reordered = await h.tasks.refreshCurrent();
    assert.equal(reordered.writeState, 'ready');
    assert.deepEqual(reordered.records[0].assignee, assigned.record.assignee);
    assert.deepEqual(h.state.persisted, originalDisk, 'reading must not rewrite a valid current file');
    assert.equal(h.state.writes.length, writes);

    for (const field of ['partyId', 'displayName', 'description', 'pitch', 'capability', 'risk']) {
        const changed = structuredClone(disk);
        changed.partitions.tasks.events.find(entry => entry.kind === 'assigned').assignee[field] += '-changed';
        h.state.persisted = changed;
        await h.coordinator.refresh();
        await assert.rejects(h.tasks.refreshCurrent(), /task_invalid_domain|partition/i,
            `${field} is a frozen assignment fact`);
    }
    h.state.persisted = disk;
    await h.coordinator.refresh();
    const recovered = await h.tasks.refreshCurrent();
    assert.deepEqual(recovered.records[0].assignee, assigned.record.assignee);
});

test('cancelling either active task line closes escrow once and removes story/maintenance participation', async t => {
    for (const source of ['received', 'published']) {
        await t.test(source, async () => {
            const h = await createHarness();
            const active = source === 'received' ? await acceptTask(h) : await publishAndAssign(h, 'published');
            const participant = createTaskMaintenanceParticipant({ tasks: h.tasks, readSettings: () => ({ autoMaintenance: true }) });
            const turn = { assistantCount: 4 };
            const pending = participant.createSession(turn, 'automatic');
            assert.equal(pending.executeTool('TaskComplete', {
                taskId: active.record.taskId, revision: active.record.taskRevision, resultSummary: '已送达',
            }).status, 'updated');
            assert.ok(buildTaskPromptBlock(h.tasks.readCurrent().records));

            const command = cancellation(active.record);
            const cancelled = await h.tasks.cancel(command, allowCommit);
            assert.equal(cancelled.record.status, 'cancelled');
            assert.equal(cancelled.view.playerBalance, 100);
            assert.equal(projectBalances(ledgerOf(h))[`escrow:task:${active.record.taskId}`], 0);
            assert.equal(buildTaskPromptBlock(cancelled.view.records), '');
            assert.equal(participant.createSession(turn, 'automatic'), null);
            const saved = structuredClone(h.state.persisted);
            const replay = await h.tasks.cancel(command, allowCommit);
            assert.equal(replay.changed, false);
            assert.deepEqual(h.state.persisted, saved);
            await assert.rejects(pending.commit(allowCommit), /task_terminal/);
            await assert.rejects(h.tasks.cancel(cancellation(cancelled.record, 'cancel-again'), allowCommit), /task_terminal/);
            assert.deepEqual(h.state.persisted, saved);
            assert.equal((await h.tasks.refreshCurrent()).records[0].status, 'cancelled');
        });
    }
});

test('cancellation respects CAS and save confirmation before refunding or removing the task', async () => {
    const h = await createHarness();
    const active = await publishAndAssign(h, 'save');
    const progressed = await h.tasks.commitMaintenance({
        commands: [maintenanceCommand('progress', 'progress', active.record, '途中遇到封路')], observedAssistantCount: 4,
    }, allowCommit);
    await assert.rejects(h.tasks.cancel(cancellation(active.record), allowCommit), /task_revision_conflict/);
    const command = cancellation(progressed.record);
    const saved = structuredClone(h.state.persisted);
    h.state.replaceImpl = async () => ({ status: 'failed', error: { code: 'disk_failed', message: 'disk failed', retryable: true } });
    await assert.rejects(h.tasks.cancel(command, allowCommit), error => error.code === 'disk_failed');
    assert.deepEqual(h.state.persisted, saved);
    h.state.replaceImpl = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
    await assert.rejects(h.tasks.cancel(command, allowCommit), error => error.uncertain === true);
    assert.equal(h.tasks.readCurrent().records[0].status, 'active');
    assert.ok(buildTaskPromptBlock(h.tasks.readCurrent().records));
    assert.equal(h.economy.getPlayerBalance(), 20);
    h.state.replaceImpl = null;
    assert.equal((await h.tasks.confirmPending()).status, 'confirmed');
    assert.equal(h.tasks.readCurrent().records[0].status, 'cancelled');
    assert.equal(buildTaskPromptBlock(h.tasks.readCurrent().records), '');
    assert.equal(h.economy.getPlayerBalance(), 100);
});

test('both task lines notify after settlement without UI activation, but history and rereads stay silent', async t => {
    const h = await createHarness();
    const notices = [];
    const runtime = createTaskCompletionRuntime({ store: h.store, notify: notice => notices.push(notice) });
    t.after(() => runtime.stopBackground());
    runtime.startBackground();
    runtime.startBackground();
    const received = await acceptTask(h);
    const published = await publishAndAssign(h, 'notice');
    assert.equal(notices.length, 0);
    await h.tasks.commitMaintenance({ commands: [
        maintenanceCommand('complete', 'complete-received', received.record, '已送达'),
        maintenanceCommand('complete', 'complete-published', published.record, '已送达'),
    ], observedAssistantCount: 4 }, allowCommit);
    assert.equal(notices.length, 2);
    assert.match(notices[0].title, /接取/);
    assert.match(notices[0].message, /封蜡信.*150 小白币已到账/);
    assert.match(notices[1].title, /发布/);
    assert.match(notices[1].message, /护送药箱.*艾拉.*80 小白币已支付给执行者/);
    assert.equal(h.economy.getPlayerBalance(), 170);
    await h.tasks.refreshCurrent();
    runtime.handleChatChanged();
    await h.tasks.refreshCurrent();
    runtime.stopBackground();
    runtime.startBackground();
    await h.tasks.refreshCurrent();
    assert.equal(notices.length, 2);
});

test('completion save failures and uncertain results stay silent until recovery confirms the same settlement', async t => {
    const h = await createHarness();
    const notices = [];
    const runtime = createTaskCompletionRuntime({ store: h.store, notify: notice => notices.push(notice) });
    runtime.startBackground();
    t.after(() => runtime.stopBackground());
    const received = await acceptTask(h);
    const input = { commands: [maintenanceCommand('complete', 'recover-completion', received.record, '已送达')], observedAssistantCount: 4 };
    h.state.replaceImpl = async () => ({ status: 'failed', error: { code: 'disk_failed', message: 'disk failed', retryable: true } });
    await assert.rejects(h.tasks.commitMaintenance(input, allowCommit), error => error.code === 'disk_failed');
    assert.equal(notices.length, 0);
    h.state.replaceImpl = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
    await assert.rejects(h.tasks.commitMaintenance(input, allowCommit), error => error.uncertain === true);
    assert.equal(notices.length, 0);
    assert.equal(h.economy.getPlayerBalance(), 100);
    h.state.replaceImpl = null;
    assert.equal((await h.tasks.confirmPending()).status, 'confirmed');
    assert.equal(notices.length, 1);
    assert.equal(h.economy.getPlayerBalance(), 250);
    await h.tasks.refreshCurrent();
    assert.equal(notices.length, 1);
});

test('late completion from another chat is not announced, and returning only establishes the current baseline', async t => {
    const h = await createHarness();
    const notices = [];
    const runtime = createTaskCompletionRuntime({ store: h.store, notify: notice => notices.push(notice) });
    runtime.startBackground();
    t.after(() => runtime.stopBackground());
    const received = await acceptTask(h);
    const original = structuredClone(h.state.capture);
    h.state.replaceImpl = async input => {
        h.state.capture = { identityKey: 'character:tasks.png:chat-b', binding: { ...binding, chatId: 'chat-b' }, reference: null };
        runtime.handleChatChanged();
        h.state.persisted = structuredClone(input.candidate);
        return { status: 'confirmed' };
    };
    await h.tasks.commitMaintenance({ commands: [maintenanceCommand('complete', 'late-completion', received.record, '已送达')], observedAssistantCount: 4 }, allowCommit);
    assert.equal(notices.length, 0);
    h.state.capture = original;
    h.state.replaceImpl = null;
    runtime.handleChatChanged();
    await h.tasks.refreshCurrent();
    assert.equal(notices.length, 0);
    const next = await publishAndAssign(h, 'after-return');
    await h.tasks.commitMaintenance({ commands: [maintenanceCommand('complete', 'next-completion', next.record, '已送达')], observedAssistantCount: 5 }, allowCommit);
    assert.equal(notices.length, 1);
});

test('a notification failure cannot roll back settlement or retrigger it on reread', async t => {
    const h = await createHarness();
    let notifications = 0;
    t.mock.method(console, 'warn', () => {});
    const runtime = createTaskCompletionRuntime({ store: h.store, notify: () => { notifications++; throw new Error('toast unavailable'); } });
    runtime.startBackground();
    t.after(() => runtime.stopBackground());
    const received = await acceptTask(h);
    await h.tasks.commitMaintenance({ commands: [maintenanceCommand('complete', 'toast-failure', received.record, '已送达')], observedAssistantCount: 4 }, allowCommit);
    assert.equal(h.economy.getPlayerBalance(), 250);
    await h.tasks.refreshCurrent();
    assert.equal(notifications, 1);
});

test('Tasks module owns a strict partition and declares its runtime capabilities', async () => {
    assert.equal(TASKS_PARTITION.parse({ schemaVersion: 1, revision: 0, board: null, events: [] }).ok, true);
    assert.equal(TASKS_PARTITION.parse({ schemaVersion: 1, revision: 0, board: null, events: [], extra: true }).ok, false);

    const module = createTasksModule({
        getPlayerDisplayName: () => '主人',
        getObservedAssistantCount: () => 3,
        install: async () => ({}),
    });
    assert.deepEqual(module.capabilities.map(capability => capability.id), [
        ECONOMY_READ_CAPABILITY.id,
        ECONOMY_TRANSACTION_CAPABILITY.id,
        AGENT_CAPABILITY.id,
        MAINTENANCE_CAPABILITY.id,
        MAP_CONTEXT_CAPABILITY.id,
        WORLD_CONTEXT_CAPABILITY.id,
    ]);
    const removed = [];
    await module.clearData({ removePartition: async key => { removed.push(key); } });
    assert.deepEqual(removed, ['tasks']);
});

test('Tasks module injects the current player name and Assistant count into its service', async () => {
    const harness = await createHarness();
    let installed = null;
    let opaqueId = 0;
    let stopCount = 0;
    const runtime = { stopBackground: () => {stopCount += 1;} };
    const module = createTasksModule({
        getPlayerDisplayName: () => '模块主人',
        getObservedAssistantCount: () => 17,
        service: {
            now: () => 2_000,
            ids: createTaskIdFactory({ randomUuid: () => `module-${++opaqueId}`, now: () => 2_000 }),
        },
        async install(context) {
            installed = context;
            return runtime;
        },
    });
    const capabilityInstances = new Map([
        [ECONOMY_READ_CAPABILITY.id, harness.economy],
        [AGENT_CAPABILITY.id, {}],
        [MAINTENANCE_CAPABILITY.id, {}],
    ]);

    const result = await module.install({
        ownerId: 'tasks',
        partition: harness.store,
        files: harness.coordinator,
        execution: {},
        useCapability: token => capabilityInstances.get(token.id),
    });
    const published = await installed.tasks.publish({
        actionId: 'module-publish',
        form: publishedForm(),
    }, allowCommit);

    assert.equal(published.record.issuer.displayName, '模块主人');
    assert.equal(published.record.lastObservedAssistantCount, 17);
    await module.dispose(result);
    assert.equal(stopCount, 1);
});

test('publishing changes Tasks and Economy in one replace and replay is idempotent', async () => {
    const harness = await createHarness();
    const input = { actionId: 'publish-once', form: publishedForm() };
    const first = await harness.tasks.publish(input, allowCommit);

    assert.equal(harness.state.writes.length, 1);
    assert.equal(harness.state.writes[0].candidate.partitions.unrelated.value, 7);
    assert.equal(first.view.playerBalance, 20);
    const transactions = ledgerOf(harness).transactions;
    assert.equal(transactions.length, 2);
    assert.equal(transactions[1].sourceDomain, 'tasks');
    assert.equal(transactions[1].fromAccountId, 'player');
    assert.equal(transactions[1].toAccountId, `escrow:task:${first.record.taskId}`);

    const replay = await harness.tasks.publish(input, allowCommit);
    assert.equal(replay.changed, false);
    assert.equal(replay.record.taskId, first.record.taskId);
    assert.equal(harness.state.writes.length, 1);
    assert.equal(ledgerOf(harness).transactions.length, 2);
});

test('subscribers never observe one half of an atomic Tasks and Economy commit', async () => {
    const harness = await createHarness();
    const observed = [];
    const unsubscribe = harness.tasks.subscribe(() => observed.push(harness.tasks.readCurrent()));

    await harness.tasks.publish({ actionId: 'observed-publish', form: publishedForm() }, allowCommit);
    await Promise.resolve();
    unsubscribe();

    assert.ok(observed.length > 0);
    for (const view of observed) {
        const committed = view.records.length === 1;
        assert.equal(view.playerBalance, committed ? 20 : 100);
    }
});

test('received and published tasks retain settlement, refund, recruitment and batch maintenance flows', async t => {
    await t.test('received completion pays the player from the frozen board counterparty', async () => {
        const harness = await createHarness();
        const board = await harness.tasks.replaceBoard({
            expectedBoardId: null,
            listings: [listing()],
            generatedAt: 10,
        }, allowCommit);
        const accepted = await harness.tasks.acceptListing({
            actionId: 'received-accept',
            boardId: board.view.domain.board.boardId,
            listingId: board.view.domain.board.listings[0].listingId,
        }, allowCommit);
        const balances = projectBalances(ledgerOf(harness));
        assert.equal(balances[`escrow:task:${accepted.record.taskId}`], 150);
        assert.equal(balances[`counterparty:task:board:${accepted.record.taskId}`], -150);

        const completed = await harness.tasks.commitMaintenance({
            commands: [maintenanceCommand('complete', 'received-complete', accepted.record, '封蜡信已经送达')],
            observedAssistantCount: 4,
        }, allowCommit);
        assert.equal(completed.record.status, 'completed');
        assert.equal(projectBalances(ledgerOf(harness)).player, 250);
    });

    await t.test('published cancellation refunds and assigned completion pays only the candidate', async () => {
        const cancelledHarness = await createHarness();
        const published = await cancelledHarness.tasks.publish({
            actionId: 'cancel-publish', form: publishedForm(),
        }, allowCommit);
        const cancelled = await cancelledHarness.tasks.cancel({
            actionId: 'cancel-task',
            taskId: published.record.taskId,
            expectedTaskRevision: published.record.taskRevision,
            expectedEventId: published.record.eventId,
        }, allowCommit);
        assert.equal(cancelled.record.status, 'cancelled');
        assert.equal(cancelled.view.playerBalance, 100);

        const completedHarness = await createHarness();
        const assigned = await publishAndAssign(completedHarness, 'assigned');
        const candidateId = assigned.record.assignee.partyId;
        const completed = await completedHarness.tasks.commitMaintenance({
            commands: [maintenanceCommand('complete', 'assigned-complete', assigned.record, '药箱已经送达')],
            observedAssistantCount: 5,
        }, allowCommit);
        const balances = projectBalances(ledgerOf(completedHarness));
        assert.equal(completed.record.status, 'completed');
        assert.equal(balances[`escrow:task:${assigned.record.taskId}`], 0);
        assert.equal(balances[`counterparty:task:${candidateId}`], 80);
        assert.equal(balances.player, 20);
    });
});

test('commit guards and failed replaces publish neither prepared Tasks nor Economy state', async () => {
    const guarded = await createHarness();
    let guardCalls = 0;
    await assert.rejects(guarded.tasks.publish({
        actionId: 'guarded',
        form: publishedForm(20),
    }, () => ++guardCalls === 1), /tasks_commit_guard_failed/);
    assert.equal(guardCalls, 2);
    assert.equal(guarded.state.writes.length, 0);
    assert.equal(guarded.tasks.readCurrent().domain, null);
    assert.equal(guarded.economy.getPlayerBalance(), 100);

    const failed = await createHarness();
    const before = structuredClone(failed.state.persisted);
    failed.state.replaceImpl = async () => ({
        status: 'failed',
        error: { code: 'disk_failed', message: 'disk failed', retryable: true },
    });
    await assert.rejects(
        failed.tasks.publish({ actionId: 'save-failed', form: publishedForm() }, allowCommit),
        error => error.code === 'disk_failed',
    );
    assert.deepEqual(failed.state.persisted, before);
    assert.equal(failed.tasks.readCurrent().domain, null);
    assert.equal(failed.economy.getPlayerBalance(), 100);
});

test('unconfirmed writes stay hidden and file-control retry reuses one candidate without duplicate funding', async () => {
    const harness = await createHarness();
    let firstAttempt = true;
    harness.state.replaceImpl = async input => {
        if (firstAttempt) {
            firstAttempt = false;
            return { status: 'unconfirmed', observed: structuredClone(harness.state.persisted) };
        }
        harness.state.persisted = structuredClone(input.candidate);
        return { status: 'confirmed' };
    };

    await assert.rejects(
        harness.tasks.publish({ actionId: 'retry-publish', form: publishedForm() }, allowCommit),
        error => error.uncertain === true,
    );
    assert.equal(harness.tasks.readCurrent().domain, null);
    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(harness.tasks.getWriteState(), 'unconfirmed');

    const recovery = await harness.tasks.confirmPending();
    assert.equal(recovery.status, 'confirmed');
    assert.equal(harness.state.writes.length, 2);
    assert.deepEqual(harness.state.writes[1].candidate, harness.state.writes[0].candidate);
    assert.equal(harness.tasks.readCurrent().records.length, 1);
    assert.equal(harness.economy.getPlayerBalance(), 20);
    assert.equal(ledgerOf(harness).transactions.filter(transaction => transaction.sourceDomain === 'tasks').length, 1);
});

test('Tasks keeps recovery available after failed verification and retires only the recovered save notice', async t => {
    for (const recovery of ['confirm', 'adopt-server', 'external-confirm']) {
        await t.test(recovery, async sub => {
            const h = await createHarness();
            let generations = 0;
            const controller = createTaskController({
                tasks: h.tasks, economy: h.economy,
                generation: {
                    async refreshBoard() {
                        generations++;
                        await h.tasks.replaceBoard({ expectedBoardId: null, listings: [listing()], generatedAt: 1000 }, allowCommit);
                        return { kind: 'board', status: 'updated', changed: true };
                    },
                    cancelAll() {},
                },
                settings: { read: () => null, subscribe: () => () => {} },
                maintenance: { getStatus: () => ({ state: 'idle', message: '', reason: '', mode: null, lastRunAt: null }), subscribeStatus: () => () => {} },
                getChatIdentity: () => h.state.capture.identityKey, isMainGenerationActive: () => false,
                subscribeGeneration: () => () => {}, report() {},
            });
            controller.startBackground();
            sub.after(() => { controller.stopBackground(); h.tasks.dispose(); });
            const activate = () => controller.activate({ post: () => true });
            const request = type => controller.handleMessage({ type: `tasks/${type}`, payload: { chatIdentity: h.state.capture.identityKey } });
            activate();
            h.state.replaceImpl = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
            await request('refresh');
            await new Promise(resolve => setImmediate(resolve));
            const initial = await request('activate');
            assert.equal(initial.status, 'unconfirmed');
            assert.equal(initial.board, null);
            assert.match(initial.generation.message, /先核实保存/);

            h.state.replaceImpl = async () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
            const failed = await request('save/confirm');
            assert.equal(failed.confirmation, 'failed');
            assert.equal(failed.state.writeState, 'failed');
            assert.equal(failed.state.status, 'unconfirmed');
            assert.equal(h.tasks.readCurrent().pendingSave, true);
            assert.match(failed.state.message, /再次核实/);
            await assert.rejects(request('refresh'), /tasks_write_blocked/);
            controller.deactivate();
            assert.equal(activate().status, 'unconfirmed');

            h.state.replaceImpl = null;
            if (recovery === 'adopt-server') {
                h.state.persisted.revision++;
                h.state.persisted.commitId = 'another-writer';
                assert.equal((await request('save/confirm')).state.status, 'conflict');
            }
            let recovered;
            if (recovery === 'external-confirm') {
                controller.deactivate();
                await h.tasks.confirmPending();
                recovered = activate();
            } else { recovered = (await request(`save/${recovery}`)).state; }
            assert.equal(recovered.status, 'ready');
            assert.equal(h.tasks.readCurrent().pendingSave, false);
            assert.equal(recovered.generation.message, '');
            assert.equal(Boolean(recovered.board), recovery !== 'adopt-server');
            assert.equal(generations, 1);
            if (recovery !== 'adopt-server') {
                assert.deepEqual(h.state.writes[0].candidate, h.state.writes.at(-1).candidate);
            }
        });
    }
});

test('a corrupt Tasks partition is isolated from Economy reads and notification startup', async t => {
    const harness = await createHarness();
    harness.state.persisted.partitions.tasks = {
        schemaVersion: 1,
        revision: 0,
        board: null,
        events: [],
        forged: true,
    };
    await harness.coordinator.refresh();

    await assert.rejects(harness.tasks.refreshCurrent(), /task_invalid_domain|non-canonical|partition/i);
    t.mock.method(console, 'warn', () => {});
    const notices = [];
    const runtime = createTaskCompletionRuntime({ store: harness.store, notify: notice => notices.push(notice) });
    assert.doesNotThrow(() => runtime.startBackground());
    assert.doesNotThrow(() => runtime.handleChatChanged());
    runtime.stopBackground();
    assert.deepEqual(notices, []);
    await harness.economy.refresh();
    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(harness.economy.getTransactionCount(), 1);
});

test('refresh rejects a structurally valid Tasks partition whose owned Economy legs are missing', async () => {
    const harness = await createHarness();
    await harness.tasks.publish({ actionId: 'missing-leg', form: publishedForm() }, allowCommit);
    harness.state.persisted.partitions.economy.transactions.pop();
    await harness.coordinator.refresh();

    await assert.rejects(harness.tasks.refreshCurrent(), error => error.code === 'task_invalid_domain');
    await harness.economy.refresh();
    assert.equal(harness.economy.getPlayerBalance(), 100);
});

test('fallback task IDs are monotonic and retry occupied collisions', () => {
    const occupied = new Set(['task-10-1']);
    const factory = createTaskIdFactory({ randomUuid: null, now: () => 10 });
    assert.equal(factory.create('task', occupied), 'task-10-2');
    assert.equal(factory.create('action', occupied), 'task-action-10-3');
});
