import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../shared/session-db';
import { replaceTavernTaskBoard } from '../shared/tasks/task-board';
import {
    acceptTavernTaskListing,
    applyTavernTaskStagedAction,
    cancelTavernTask,
    commitTavernTaskStagingContext,
    completeTavernTask,
    createTavernTaskStagingContext,
    failTavernTask,
    getCurrentTavernTask,
    getTavernTaskPlayerBalance,
    progressTavernTask,
    publishTavernTask,
    selectTavernTaskCandidate,
    updateTavernTaskCandidates,
} from '../shared/tasks/task-service';
import {
    describeTavernTasksAndEconomyRestoreImpact,
    restoreTavernTasksAndEconomyToFloor,
} from '../shared/tasks/task-timeline';
import {
    generateTavernTaskRecipe,
    parseTavernTaskBoardResponse,
    parseTavernTaskCandidatesResponse,
    type TavernTaskListing,
} from '../shared/tasks/task-types';
import {
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';

function boardListings(): TavernTaskListing[] {
    const rows = [
        ['E', 10],
        ['D', 25],
        ['C', 60],
        ['B', 180],
        ['A', 400],
        ['S', 900],
    ] as const;
    return rows.map(([grade, reward], index) => ({
        id: `listing-${index + 1}`,
        grade,
        tags: [`tag-${index + 1}`],
        title: `委托 ${index + 1}`,
        issuer: {
            id: `issuer-${index + 1}`,
            name: `陌生发布者 ${index + 1}`,
            description: `发布者描述 ${index + 1}`,
        },
        hook: `异常钩子 ${index + 1}`,
        objective: `完成目标 ${index + 1}`,
        location: `地点 ${index + 1}`,
        risk: `风险 ${index + 1}`,
        reward,
    }));
}

function candidateRows() {
    return [1, 2, 3].map((index) => ({
        id: `candidate-${index}`,
        name: `候选人 ${index}`,
        description: `候选人描述 ${index}`,
        pitch: `应征理由 ${index}`,
        capability: `能力 ${index}`,
        risk: `隐患 ${index}`,
    }));
}

test('task board and candidate response protocols enforce their stable boundaries', () => {
    const response = `prefix\n${JSON.stringify({ tasks: boardListings().map(({ id: _id, issuer, ...listing }) => ({
        ...listing,
        issuer: { name: issuer.name, description: issuer.description },
    })) })}\nsuffix`;
    let id = 0;
    const listings = parseTavernTaskBoardResponse(response, {
        createId: (prefix) => `${prefix}-${++id}`,
    });
    assert.equal(listings.length, 6);
    assert.equal(new Set(listings.map((listing) => listing.id)).size, 6);

    assert.throws(() => parseTavernTaskBoardResponse(response, {
        excludedTitles: ['委托 1'],
    }), /task_response_invalid/);
    assert.throws(() => parseTavernTaskBoardResponse(response, {
        knownNames: ['陌生发布者 2'],
    }), /task_response_invalid/);
    const invalidReward = response.replace('"reward":60', '"reward":101');
    assert.throws(() => parseTavernTaskBoardResponse(invalidReward), /task_response_invalid/);
    assert.throws(() => parseTavernTaskBoardResponse(JSON.stringify({ tasks: boardListings().slice(0, 5) })), /task_response_invalid/);

    assert.deepEqual(parseTavernTaskCandidatesResponse('{"candidates":[]}'), []);
    assert.equal(parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: candidateRows() })).length, 3);
    assert.equal(parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: [
        ...candidateRows(),
        {
            id: 'candidate-4',
            name: '候选人 4',
            description: '候选人描述 4',
            pitch: '应征理由 4',
            capability: '能力 4',
            risk: '隐患 4',
        },
    ] })).length, 4);
    assert.throws(
        () => parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: candidateRows().slice(0, 2) })),
        /task_response_invalid/,
    );
    assert.throws(
        () => parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: [
            ...candidateRows(),
            ...candidateRows().slice(0, 2).map((candidate, index) => ({ ...candidate, id: `extra-${index}`, name: `额外候选 ${index}` })),
        ] })),
        /task_response_invalid/,
    );
    assert.throws(
        () => parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: candidateRows() }), { knownNames: ['候选人 1'] }),
        /task_response_invalid/,
    );
    assert.throws(() => parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: [
        ...candidateRows().slice(0, 2),
        { ...candidateRows()[2], name: ' 候选人 1 ' },
    ] })), /task_response_invalid/);
    assert.throws(() => parseTavernTaskBoardResponse(JSON.stringify({ tasks: [
        ...boardListings().slice(0, 5),
        { ...boardListings()[5], title: ` ${boardListings()[0].title} ` },
    ] })), /task_response_invalid/);

    const recipe = generateTavernTaskRecipe({ random: () => 0 });
    assert.deepEqual(recipe.map((slot) => slot.role), [
        'grounded',
        'investigation_social',
        'dangerous',
        'moral_gray',
        'strange',
        'wildcard',
    ]);
});

test('database v19 adds empty current task storage to a v18 database', async () => {
    await db.delete();
    const legacyDb = new Dexie('LittleWhiteBox_Tavern');
    const legacyRuntime = legacyDb as unknown as {
        table(name: string): { put(record: Record<string, unknown>): Promise<unknown> };
        close(): void;
    };
    legacyDb.version(18).stores({
        sessions: 'id, updatedAt',
        economyAccounts: '[sessionId+id], sessionId, kind, updatedAt',
        economyTransactions: '[sessionId+id], sessionId, &[sessionId+idempotencyKey], &[sessionId+reversalOfTransactionId], &[sessionId+ledgerOrder], [sessionId+anchorOrder+ledgerOrder], createdAt, anchorOrder, ledgerOrder',
    });
    await legacyDb.open();
    await legacyRuntime.table('sessions').put({
        id: 'v18-task-session',
        title: 'v18 session',
        createdAt: 1,
        updatedAt: 1,
    });
    await legacyRuntime.table('economyAccounts').put({
        sessionId: 'v18-task-session',
        id: TAVERN_PLAYER_ACCOUNT_ID,
        kind: 'player',
        balance: 42,
        createdAt: 1,
        updatedAt: 1,
    });
    await legacyRuntime.table('economyTransactions').put({
        sessionId: 'v18-task-session',
        id: 'v18-opening',
        idempotencyKey: 'v18-opening',
        fromAccountId: 'system:mint',
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: 42,
        kind: 'opening_grant',
        title: 'v18 opening',
        note: '',
        sourceDomain: 'economy',
        sourceId: 'v18-opening',
        anchorOrder: -1,
        ledgerOrder: 1,
        playerBalanceAfter: 42,
        createdAt: 1,
    });
    legacyRuntime.close();

    await db.open();
    const runtimeDb = db as unknown as { tables: Array<{ name: string }> };
    const names = new Set(runtimeDb.tables.map((table) => table.name));
    assert.equal(names.has('taskBoards'), true);
    assert.equal(names.has('taskVersions'), true);
    assert.equal((await (tavernTaskBoardsTable as unknown as { toArray(): Promise<unknown[]> }).toArray()).length, 0);
    assert.equal((await (tavernTaskVersionsTable as unknown as { toArray(): Promise<unknown[]> }).toArray()).length, 0);
    assert.equal((await tavernEconomyAccountsTable.get(['v18-task-session', TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 42);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('v18-task-session').count(), 1);
});

test('task board replacement is strict and CAS-protected', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task board' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'board-one',
        listings: boardListings(),
    });
    assert.equal(board.revision, 1);
    await assert.rejects(replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 2,
        generationId: 'late-board',
        listings: boardListings(),
    }), /task_board_revision_conflict/);
    await assert.rejects(replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 1,
        anchorOrder: 2,
        generationId: 'partial-board',
        listings: boardListings().slice(0, 5),
    }), /task_board_payload_invalid/);
    assert.equal((await tavernTaskBoardsTable.get(session.id))?.generationId, 'board-one');
});

test('task records preserve session identifiers longer than the display id limit', async () => {
    await db.delete();
    await db.open();
    const sessionId = 'session-' + 'x'.repeat(181);
    await createTavernSession({ id: sessionId, title: 'Long task session' });
    const board = await replaceTavernTaskBoard({
        sessionId,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'long-session-board',
        listings: boardListings(),
    });
    const accepted = await acceptTavernTaskListing({
        sessionId,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 1,
        actionId: 'long-session-accept',
        taskId: 'long-session-task',
    });
    assert.equal(board.sessionId, sessionId);
    assert.equal(accepted.sessionId, sessionId);
    assert.equal((await getCurrentTavernTask(sessionId, accepted.taskId))?.sessionId, sessionId);
});

test('accepting a listing atomically locks world money without mutating the board', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Accept task' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'accept-board',
        listings: boardListings(),
    });
    const input = {
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[2].id,
        anchorOrder: 1,
        actionId: 'accept-action',
        taskId: 'accepted-task',
        playerName: '测试玩家',
    };
    const accepted = await acceptTavernTaskListing(input);
    const replay = await acceptTavernTaskListing(input);
    assert.equal(replay.actionId, accepted.actionId);
    assert.equal(await getTavernTaskPlayerBalance(session.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, accepted.escrowAccountId]))?.balance, 60);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, 'counterparty:issuer-3']))?.balance, -60);
    assert.equal((await tavernTaskBoardsTable.get(session.id))?.listings.length, 6);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(session.id).count(), 1);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);
    await assert.rejects(acceptTavernTaskListing({ ...input, anchorOrder: 2 }), /task_action_conflict/);
    await assert.rejects(acceptTavernTaskListing({ ...input, actionId: 'second-action', taskId: 'second-task' }), /task_listing_already_accepted/);
});

test('player publishing, candidate CAS and settlement have no partial writes', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Published task' });
    await assert.rejects(publishTavernTask({
        sessionId: session.id,
        taskId: 'x'.repeat(169),
        actionId: 'publish-overlong-task-id',
        title: '无效托管标识',
        objective: '不得让任务账户标识被钱包层截断',
        location: '测试边界',
        reward: 10,
        anchorOrder: 1,
    }), /task_id_invalid/);
    await assert.rejects(publishTavernTask({
        sessionId: session.id,
        taskId: 'too-expensive',
        actionId: 'publish-too-expensive',
        title: '无法支付',
        objective: '目标',
        location: '地点',
        reward: 101,
        anchorOrder: 1,
    }), /economy_balance_insufficient/);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(session.id).count(), 0);

    const published = await publishTavernTask({
        sessionId: session.id,
        taskId: 'published-task',
        actionId: 'publish-task',
        title: '公开招募',
        objective: '完成公开目标',
        requirements: '不得惊动守卫',
        location: '旧城区',
        reward: 20,
        anchorOrder: 1,
    });
    assert.equal(published.grade, 'CUSTOM');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 80);
    const recruiting = await updateTavernTaskCandidates({
        sessionId: session.id,
        taskId: published.taskId,
        expectedRevision: published.revision,
        candidates: candidateRows(),
        anchorOrder: 1,
        actionId: 'candidate-refresh',
    });
    await assert.rejects(updateTavernTaskCandidates({
        sessionId: session.id,
        taskId: published.taskId,
        expectedRevision: published.revision,
        candidates: candidateRows(),
        anchorOrder: 1,
        actionId: 'late-candidates',
    }), /task_revision_conflict/);
    const active = await selectTavernTaskCandidate({
        sessionId: session.id,
        taskId: published.taskId,
        expectedRevision: recruiting.revision,
        candidateId: recruiting.candidates[0].id,
        anchorOrder: 2,
        actionId: 'select-candidate',
    });
    assert.deepEqual(active.candidates, []);
    assert.equal(active.assignee?.kind, 'world');
    assert.equal(active.assignee?.kind === 'world' ? active.assignee.pitch : '', recruiting.candidates[0].pitch);
    assert.equal(active.assignee?.kind === 'world' ? active.assignee.capability : '', recruiting.candidates[0].capability);
    assert.equal(active.assignee?.kind === 'world' ? active.assignee.risk : '', recruiting.candidates[0].risk);
    const completed = await completeTavernTask({
        sessionId: session.id,
        taskId: active.taskId,
        expectedRevision: active.revision,
        resultSummary: '目标已经由承接者完成。',
        anchorOrder: 3,
        actionId: 'complete-published',
    });
    assert.equal(completed.status, 'completed');
    assert.equal((await tavernEconomyAccountsTable.get([session.id, `counterparty:${active.assignee?.id}`]))?.balance, 20);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, active.escrowAccountId]))?.balance, 0);
});

test('task action replays cannot cross mutation transitions', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task action replay kinds' });
    const publishInput = {
        sessionId: session.id,
        taskId: 'replay-kind-task',
        actionId: 'publish-replay-kind-task',
        title: '验证动作重放',
        objective: '保持每种任务动作的语义独立',
        location: '测试区',
        reward: 20,
        anchorOrder: 1,
    };
    const published = await publishTavernTask(publishInput);
    const recruiting = await updateTavernTaskCandidates({
        sessionId: session.id,
        taskId: published.taskId,
        expectedRevision: published.revision,
        candidates: candidateRows(),
        anchorOrder: 1,
        actionId: 'candidate-refresh-replay-kind',
    });

    await assert.rejects(publishTavernTask({
        ...publishInput,
        actionId: 'candidate-refresh-replay-kind',
    }), /task_action_conflict/);

    const active = await selectTavernTaskCandidate({
        sessionId: session.id,
        taskId: published.taskId,
        expectedRevision: recruiting.revision,
        candidateId: recruiting.candidates[0].id,
        anchorOrder: 2,
        actionId: 'select-replay-kind',
    });
    await assert.rejects(progressTavernTask({
        sessionId: session.id,
        taskId: active.taskId,
        expectedRevision: active.revision,
        progressSummary: '旧楼层不能覆盖当前任务时间线。',
        anchorOrder: 1,
        actionId: 'regressed-task-anchor',
    }), /task_anchor_order_regression/);
    assert.equal((await getCurrentTavernTask(session.id, active.taskId))?.revision, active.revision);
    await assert.rejects(progressTavernTask({
        sessionId: session.id,
        taskId: active.taskId,
        expectedRevision: recruiting.revision,
        progressSummary: active.progressSummary,
        anchorOrder: 2,
        actionId: 'select-replay-kind',
    }), /task_action_conflict/);
});

test('task cancellation and failure return escrow to the correct issuer', async () => {
    await db.delete();
    await db.open();

    const cancelledSession = await createTavernSession({ title: 'Cancel recruiting task' });
    const recruiting = await publishTavernTask({
        sessionId: cancelledSession.id,
        taskId: 'cancel-task',
        actionId: 'publish-cancel-task',
        title: '等待撤回',
        objective: '尚未选人',
        location: '城内',
        reward: 30,
        anchorOrder: 1,
    });
    const cancelled = await cancelTavernTask({
        sessionId: cancelledSession.id,
        taskId: recruiting.taskId,
        expectedRevision: recruiting.revision,
        anchorOrder: 2,
        actionId: 'cancel-recruiting-task',
    });
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(await getTavernTaskPlayerBalance(cancelledSession.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([cancelledSession.id, recruiting.escrowAccountId]))?.balance, 0);

    const publishedSession = await createTavernSession({ title: 'Fail published task' });
    const published = await publishTavernTask({
        sessionId: publishedSession.id,
        taskId: 'failed-published-task',
        actionId: 'publish-failed-task',
        title: '可能失败',
        objective: '由陌生人处理',
        location: '北区',
        reward: 40,
        anchorOrder: 1,
    });
    const candidates = await updateTavernTaskCandidates({
        sessionId: publishedSession.id,
        taskId: published.taskId,
        expectedRevision: published.revision,
        candidates: candidateRows(),
        anchorOrder: 1,
        actionId: 'failed-task-candidates',
    });
    const assigned = await selectTavernTaskCandidate({
        sessionId: publishedSession.id,
        taskId: published.taskId,
        expectedRevision: candidates.revision,
        candidateId: candidates.candidates[0].id,
        anchorOrder: 2,
        actionId: 'failed-task-select',
    });
    const failedPublished = await failTavernTask({
        sessionId: publishedSession.id,
        taskId: assigned.taskId,
        expectedRevision: assigned.revision,
        resultSummary: '承接者确认无法完成。',
        anchorOrder: 3,
        actionId: 'fail-published-task',
    });
    assert.equal(failedPublished.status, 'failed');
    assert.equal(await getTavernTaskPlayerBalance(publishedSession.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([publishedSession.id, published.escrowAccountId]))?.balance, 0);

    const acceptedSession = await createTavernSession({ title: 'Fail accepted task' });
    const board = await replaceTavernTaskBoard({
        sessionId: acceptedSession.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'failed-accepted-board',
        listings: boardListings(),
    });
    const accepted = await acceptTavernTaskListing({
        sessionId: acceptedSession.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 1,
        actionId: 'accept-failed-task',
        taskId: 'failed-accepted-task',
    });
    const failedAccepted = await failTavernTask({
        sessionId: acceptedSession.id,
        taskId: accepted.taskId,
        expectedRevision: accepted.revision,
        resultSummary: '剧情证明任务已经失败。',
        anchorOrder: 2,
        actionId: 'fail-accepted-task',
    });
    assert.equal(failedAccepted.status, 'failed');
    assert.equal(await getTavernTaskPlayerBalance(acceptedSession.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([acceptedSession.id, 'counterparty:issuer-1']))?.balance, 0);
    assert.equal((await tavernEconomyAccountsTable.get([acceptedSession.id, accepted.escrowAccountId]))?.balance, 0);
});

test('task board, versions and escrow follow branch and delete lifecycle', async () => {
    await db.delete();
    await db.open();
    const source = await createTavernSession({ title: 'Task lifecycle' });
    const board = await replaceTavernTaskBoard({
        sessionId: source.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'lifecycle-board',
        listings: boardListings(),
    });
    const task = await publishTavernTask({
        sessionId: source.id,
        taskId: 'lifecycle-task',
        actionId: 'lifecycle-publish',
        title: '分支任务',
        objective: '跟随会话复制',
        location: '分支点',
        reward: 15,
        anchorOrder: 1,
    });
    const branch = await branchTavernSession(source.id);
    assert.ok(branch);
    assert.equal((await tavernTaskBoardsTable.get(branch.id))?.generationId, board.generationId);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(branch.id).count(), 1);
    assert.equal((await getCurrentTavernTask(branch.id, task.taskId))?.escrowAccountId, task.escrowAccountId);
    assert.equal(await getTavernTaskPlayerBalance(branch.id), 85);

    assert.equal(await deleteTavernSession(source.id), 1);
    assert.equal(await tavernTaskBoardsTable.get(source.id), undefined);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(source.id).count(), 0);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(source.id).count(), 0);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(branch.id).count(), 1);
    assert.equal(await getTavernTaskPlayerBalance(branch.id), 85);
});

test('staged maintenance writes nothing until commit and stale anchor state fails CAS', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Staged task' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'staged-board',
        listings: boardListings(),
    });
    const accepted = await acceptTavernTaskListing({
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 1,
        actionId: 'staged-accept',
        taskId: 'staged-task',
    });
    const context = await createTavernTaskStagingContext(session.id, 2);
    const projected = applyTavernTaskStagedAction(context, {
        actionId: 'manager-complete',
        taskId: accepted.taskId,
        expectedRevision: accepted.revision,
        kind: 'complete',
        anchorOrder: 2,
        resultSummary: '剧情证据确认目标完成。',
    });
    assert.equal(projected.version.status, 'completed');
    assert.equal((await getCurrentTavernTask(session.id, accepted.taskId))?.status, 'active');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 100);
    await commitTavernTaskStagingContext(context);
    assert.equal((await getCurrentTavernTask(session.id, accepted.taskId))?.status, 'completed');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 110);

    const staleContext = await createTavernTaskStagingContext(session.id, 1);
    const staleTask = staleContext.projected.get(accepted.taskId);
    assert.equal(staleTask?.revision, 1);
    applyTavernTaskStagedAction(staleContext, {
        actionId: 'stale-progress',
        taskId: accepted.taskId,
        expectedRevision: 1,
        kind: 'progress',
        anchorOrder: 1,
        progressSummary: '迟到维护尝试覆盖。',
    });
    await assert.rejects(commitTavernTaskStagingContext(staleContext), /task_revision_conflict/);
});

test('delayed staged settlement keeps its evidence floor across newer wallet activity and rollback', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Delayed staged settlement' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'delayed-settlement-board',
        listings: boardListings(),
    });
    const accepted = await acceptTavernTaskListing({
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 1,
        actionId: 'delayed-settlement-accept',
        taskId: 'delayed-settlement-task',
    });
    const context = await createTavernTaskStagingContext(session.id, 2);
    applyTavernTaskStagedAction(context, {
        actionId: 'delayed-settlement-complete',
        taskId: accepted.taskId,
        expectedRevision: accepted.revision,
        kind: 'complete',
        anchorOrder: 2,
        resultSummary: '第二楼的剧情证据确认目标完成。',
    });
    const laterSpend = await postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'delayed-settlement-later-spend',
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount: 5,
        kind: 'intel_purchase',
        title: '第三楼消费',
        sourceDomain: 'intel',
        sourceId: 'delayed-settlement-later-spend',
        anchorOrder: 3,
    });

    const committed = await commitTavernTaskStagingContext(context);
    const completedTask = await getCurrentTavernTask(session.id, accepted.taskId);
    const transactions = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray();
    const settlement = transactions.find((transaction) => (
        transaction.kind === 'task_reward'
        && transaction.sourceId === accepted.taskId
    ));
    assert.equal(committed.changed, true);
    assert.equal(completedTask?.status, 'completed');
    assert.equal(completedTask?.anchorOrder, 2);
    assert.equal(settlement?.anchorOrder, 2);
    assert.ok(Number(settlement?.ledgerOrder) > laterSpend.ledgerOrder);
    assert.equal(await getTavernTaskPlayerBalance(session.id), 105);

    await assert.rejects(postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'ordinary-write-after-delayed-settlement',
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount: 1,
        kind: 'intel_purchase',
        title: '旧楼层普通消费',
        sourceDomain: 'intel',
        sourceId: 'ordinary-write-after-delayed-settlement',
        anchorOrder: 2,
    }), /economy_anchor_order_regression/);

    await tavernSessionsTable.update(session.id, { updatedAt: 1 });
    const retry = await commitTavernTaskStagingContext(context);
    assert.equal(retry.changed, false);
    assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, 1);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), transactions.length);

    const restored = await restoreTavernTasksAndEconomyToFloor(session.id, 2);
    assert.equal(restored.tasks.changed, false);
    assert.equal(restored.economy.transactionCount, 1);
    assert.equal(await tavernEconomyTransactionsTable.get([session.id, laterSpend.id]), undefined);
    const retainedSettlement = settlement
        ? await tavernEconomyTransactionsTable.get([session.id, settlement.id])
        : undefined;
    assert.equal(retainedSettlement?.playerBalanceAfter, 110);
    assert.equal((await getCurrentTavernTask(session.id, accepted.taskId))?.status, 'completed');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 110);
});

test('task and economy rollback share one floor and restore current markers', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task rollback' });
    const firstBoard = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'rollback-board-one',
        listings: boardListings(),
    });
    const active = await acceptTavernTaskListing({
        sessionId: session.id,
        boardId: firstBoard.generationId,
        boardRevision: firstBoard.revision,
        listingId: firstBoard.listings[1].id,
        anchorOrder: 1,
        actionId: 'rollback-accept',
        taskId: 'rollback-task',
    });
    await completeTavernTask({
        sessionId: session.id,
        taskId: active.taskId,
        expectedRevision: active.revision,
        resultSummary: '第三楼完成。',
        anchorOrder: 3,
        actionId: 'rollback-complete',
    });
    await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: firstBoard.revision,
        anchorOrder: 4,
        generationId: 'rollback-board-two',
        listings: boardListings().map((listing) => ({ ...listing, id: `${listing.id}-new` })),
    });
    assert.deepEqual(await describeTavernTasksAndEconomyRestoreImpact(session.id, 2).then((impact) => ({
        tasks: impact.tasks.changed,
        economy: impact.economy.changed,
    })), { tasks: true, economy: true });
    const restored = await restoreTavernTasksAndEconomyToFloor(session.id, 2);
    assert.equal(restored.tasks.clearedBoard, true);
    assert.equal(restored.economy.transactionCount, 1);
    assert.equal(await tavernTaskBoardsTable.get(session.id), undefined);
    const current = await getCurrentTavernTask(session.id, active.taskId);
    assert.equal(current?.revision, 1);
    assert.equal(current?.status, 'active');
    assert.equal(current?.currentMarker, 'current');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, active.escrowAccountId]))?.balance, 25);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 100);
});
