import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    appendTavernMessage,
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    getLatestTavernMessage,
    deleteTavernMessages,
    updateTavernMessage,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../shared/session-db';
import { replaceTavernTaskBoard as replaceTavernTaskBoardRaw } from '../shared/tasks/task-board';
import {
    acceptTavernTaskListing as acceptTavernTaskListingRaw,
    applyTavernTaskStagedAction,
    buildTavernTaskCounterpartyAccountId,
    cancelTavernTask as cancelTavernTaskRaw,
    commitTavernTaskStagingContext,
    completeTavernTask as completeTavernTaskRaw,
    createTavernTaskStagingContext,
    failTavernTask as failTavernTaskRaw,
    getCurrentTavernTask,
    getTavernTaskPlayerBalance,
    loadTavernTaskAnchorSnapshot,
    progressTavernTask as progressTavernTaskRaw,
    publishTavernTask as publishTavernTaskRaw,
    selectTavernTaskCandidate as selectTavernTaskCandidateRaw,
    updateTavernTaskCandidates as updateTavernTaskCandidatesRaw,
} from '../shared/tasks/task-service';
import { captureTavernTaskPhoneBoundary } from '../shared/tasks/task-phone-boundary';
import {
    describeTavernAcceptedEconomicRestoreImpact,
    restoreTavernAcceptedEconomicStateToFloor,
} from '../shared/accepted-economic-state';
import {
    TAVERN_TASK_PROGRESS_SUMMARY_MAX_LENGTH,
    parseTavernTaskBoardResponse,
    parseTavernTaskCandidatesResponse,
    type TavernTaskExpectedPhoneBoundary,
    type TavernTaskListing,
    type TavernTaskVersionRecord,
} from '../shared/tasks/task-types';
import {
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import {
    buildTavernTaskBoardRequestMessages,
    buildTavernTaskCandidatesRequestMessages,
} from '../app-src/features/phone-os/apps/tasks/tavern-task-prompts';
import {
    assertTavernTaskGenerationFinished,
    tavernTaskRequestErrorText,
} from '../app-src/features/phone-os/apps/tasks/tavern-task-response';
import {
    buildTavernTaskPromptLayers,
    type TavernTaskPromptLayers,
} from '../app-src/features/phone-os/apps/tasks/tavern-task-context';
import type { TavernGetNativeWorldInfoRuntime } from '../app-src/runtime/run-once';

type TestPhoneBoundaryInput<T extends { boundary: TavernTaskExpectedPhoneBoundary }> = Omit<T, 'boundary'> & {
    anchorOrder?: number;
    boundary?: TavernTaskExpectedPhoneBoundary;
};

async function phoneBoundaryForTest(input: {
    sessionId: string;
    anchorOrder?: number;
    boundary?: TavernTaskExpectedPhoneBoundary;
}): Promise<TavernTaskExpectedPhoneBoundary> {
    if (Object.prototype.hasOwnProperty.call(input, 'boundary')) {return input.boundary ?? null;}
    const desiredAnchor = Math.max(0, Math.floor(Number(input.anchorOrder) || 0));
    let latest = await getLatestTavernMessage(input.sessionId);
    while (Number(latest?.order ?? -1) + 1 < desiredAnchor) {
        const nextOrder = Number(latest?.order ?? -1) + 1;
        latest = await appendTavernMessage(input.sessionId, {
            role: nextOrder % 2 === 0 ? 'user' : 'assistant',
            content: `任务测试剧情 ${nextOrder}`,
        });
    }
    if (Number(latest?.order ?? -1) + 1 !== desiredAnchor) {
        throw new Error(`test_phone_boundary_regression:${desiredAnchor}`);
    }
    return await captureTavernTaskPhoneBoundary(input.sessionId);
}

type OptionalEpochBoardInput = Omit<
    TestPhoneBoundaryInput<Parameters<typeof replaceTavernTaskBoardRaw>[0]>,
    'expectedEpoch'
> & {
    expectedEpoch?: number;
};

async function replaceTavernTaskBoard(input: OptionalEpochBoardInput) {
    const session = await tavernSessionsTable.get(input.sessionId);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = input;
    return await replaceTavernTaskBoardRaw({
        ...rest,
        boundary: await phoneBoundaryForTest(input),
        expectedEpoch: input.expectedEpoch ?? Math.max(1, Number(session?.taskBoardEpoch) || 1),
    });
}

type OptionalBoardEpochAcceptInput = Omit<
    TestPhoneBoundaryInput<Parameters<typeof acceptTavernTaskListingRaw>[0]>,
    'boardEpoch'
> & {
    boardEpoch?: number;
};

async function acceptTavernTaskListing(input: OptionalBoardEpochAcceptInput) {
    const board = await tavernTaskBoardsTable.get(input.sessionId);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = input;
    return await acceptTavernTaskListingRaw({
        ...rest,
        boundary: await phoneBoundaryForTest(input),
        boardEpoch: input.boardEpoch ?? Number(board?.epoch),
    });
}

type OptionalVersionId<T extends { expectedVersionId: string }> = Omit<T, 'expectedVersionId'> & {
    expectedVersionId?: string;
};

async function withCurrentVersionId<T extends { sessionId: string; taskId: string; expectedVersionId?: string }>(input: T) {
    const current = await getCurrentTavernTask(input.sessionId, input.taskId);
    return { ...input, expectedVersionId: input.expectedVersionId ?? current?.versionId ?? '' };
}

async function updateTavernTaskCandidates(
    input: TestPhoneBoundaryInput<OptionalVersionId<Parameters<typeof updateTavernTaskCandidatesRaw>[0]>>,
) {
    const withVersion = await withCurrentVersionId(input);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = withVersion;
    return await updateTavernTaskCandidatesRaw({ ...rest, boundary: await phoneBoundaryForTest(input) });
}

async function selectTavernTaskCandidate(
    input: TestPhoneBoundaryInput<OptionalVersionId<Parameters<typeof selectTavernTaskCandidateRaw>[0]>>,
) {
    const withVersion = await withCurrentVersionId(input);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = withVersion;
    return await selectTavernTaskCandidateRaw({ ...rest, boundary: await phoneBoundaryForTest(input) });
}

async function cancelTavernTask(
    input: TestPhoneBoundaryInput<OptionalVersionId<Parameters<typeof cancelTavernTaskRaw>[0]>>,
) {
    const withVersion = await withCurrentVersionId(input);
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = withVersion;
    return await cancelTavernTaskRaw({ ...rest, boundary: await phoneBoundaryForTest(input) });
}

async function publishTavernTask(
    input: TestPhoneBoundaryInput<Parameters<typeof publishTavernTaskRaw>[0]>,
) {
    const { anchorOrder: _anchorOrder, boundary: _boundary, ...rest } = input;
    return await publishTavernTaskRaw({ ...rest, boundary: await phoneBoundaryForTest(input) });
}

async function progressTavernTask(input: OptionalVersionId<Parameters<typeof progressTavernTaskRaw>[0]>) {
    return await progressTavernTaskRaw(await withCurrentVersionId(input));
}

async function completeTavernTask(input: OptionalVersionId<Parameters<typeof completeTavernTaskRaw>[0]>) {
    return await completeTavernTaskRaw(await withCurrentVersionId(input));
}

async function failTavernTask(input: OptionalVersionId<Parameters<typeof failTavernTaskRaw>[0]>) {
    return await failTavernTaskRaw(await withCurrentVersionId(input));
}

function boardListings(): TavernTaskListing[] {
    const rows = [
        ['禁忌', 'B', 150, '易介入', '现在就行'],
        ['接触', 'C', 60, '易介入', '任意时候'],
        ['夹缝', 'C', 100, '易介入', '现在就行'],
        ['窥秘', 'C', 80, '中介入', '任意时候'],
        ['掠夺', 'C', 100, '中介入', '特定时机：下课后'],
        ['怪癖', 'D', 25, '深介入', '特定时机：入夜后'],
    ] as const;
    return rows.map(([direction, grade, reward, posture, timing], index) => ({
        id: `listing-${index + 1}`,
        grade,
        tags: [direction, `tag-${index + 1}`],
        posture,
        title: `委托 ${index + 1}`,
        hook: `异常钩子 ${index + 1}`,
        objective: `完成目标 ${index + 1}`,
        location: `地点 ${index + 1}`,
        timing,
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

function recruitingTaskForPrompt(): TavernTaskVersionRecord {
    return {
        sessionId: 'prompt-session',
        taskId: 'prompt-task',
        revision: 1,
        versionId: 'prompt-task:1',
        currentMarker: 'current',
        actionId: 'prompt-action',
        status: 'recruiting',
        issuer: { kind: 'player', id: 'player', name: 'TASK_USER' },
        reward: 80,
        escrowAccountId: 'escrow:prompt-task',
        title: '寻找一位危险品看管人',
        objective: '把封存物安全送到指定地点',
        location: '旧城区',
        risk: '封存物可能在途中苏醒',
        grade: 'C',
        tags: ['接触'],
        progressSummary: '',
        resultSummary: '',
        candidates: [],
        anchorOrder: 2,
        createdAt: 1,
        updatedAt: 1,
    };
}

test('task requests use the new direction recipe only for board generation', () => {
    const layers: TavernTaskPromptLayers = {
        context: {
            character: { name: 'TASK_CHARACTER', description: 'TASK_DESCRIPTION' },
            user: { name: 'TASK_USER', persona: 'TASK_PERSONA' },
        },
        activatedWorldEntries: [],
        stateMemory: '',
        status: '',
        map: '',
        knownNames: ['TASK_CHARACTER', 'TASK_USER'],
    };
    const boardRequest = buildTavernTaskBoardRequestMessages({
        layers,
    }).map((message) => message.content).join('\n');
    assert.doesNotMatch(boardRequest, /现存任务|排除标题|排除已列出的标题/);
    const candidateRequest = buildTavernTaskCandidatesRequestMessages({
        layers,
        task: recruitingTaskForPrompt(),
    }).map((message) => message.content).join('\n');

    [
        ['禁忌', '150~350'],
        ['接触', '40~80'],
        ['夹缝', '100~200'],
        ['窥秘', '60~120'],
        ['掠夺', '80~150'],
        ['怪癖', '15~40'],
    ].forEach(([label, reward]) => {
        assert.equal(boardRequest.includes(`### ${label}`), true);
        assert.equal(boardRequest.includes(`${label}｜报酬 ${reward}`), true);
    });
    ['standoff', 'dirty', 'escort', 'investigate', 'compete', 'absurd'].forEach((legacyKey) => {
        assert.equal(boardRequest.includes(legacyKey), false);
    });
    assert.equal(boardRequest.includes('玩家必须亲自打字完成转时、换地点、认识人物和建立氛围'), true);
    assert.equal(boardRequest.includes('易介入 3 条、中介入 2 条、深介入 1 条'), true);
    assert.equal(boardRequest.includes('posture 只能是易介入、中介入、深介入'), true);
    assert.equal(boardRequest.includes('易介入禁止特定时机'), true);
    assert.equal(boardRequest.includes('第 1 层'), false);
    assert.equal(boardRequest.includes('第1层'), false);
    assert.equal(boardRequest.includes('tags 的第一项必须严格对应本条方向'), true);
    assert.equal(boardRequest.includes('tasks 必须是数组'), true);
    assert.equal(boardRequest.includes('tags 必须是含 1~4 项的字符串数组'), true);
    assert.equal(boardRequest.includes('reward 必须是正整数 JSON 数字，不得写成字符串'), true);
    assert.equal(boardRequest.includes('"issuer"'), false);

    assert.equal(candidateRequest.includes('## 第一步：读懂委托'), true);
    assert.equal(candidateRequest.includes('低报酬、高风险或条件苛刻的任务可以无人应征'), true);
    assert.equal(candidateRequest.includes('## 第三步：六个方向逐条构思'), false);
    assert.equal(candidateRequest.includes('### 禁忌'), false);
    assert.equal(candidateRequest.includes('candidates 必须是数组'), true);
    assert.equal(candidateRequest.includes('name、description、pitch、capability、risk 必须全部是字符串'), true);
    assert.equal(candidateRequest.includes('不可用作候选人'), false);
});

test('task generation scans through the latest AI and preserves character and native worldbook grounding', async () => {
    await db.delete();
    await db.open();
    const contextSnapshot = {
        character: {
            name: 'TASK_CHARACTER',
            description: 'TASK_DESCRIPTION',
            personality: 'TASK_PERSONALITY',
            scenario: 'TASK_SCENARIO',
        },
        user: { name: 'TASK_USER', persona: 'TASK_PERSONA' },
    };
    const session = await createTavernSession({
        title: 'Task worldbook boundary',
        contextSnapshot,
    });
    await appendTavernMessage(session.id, { role: 'user', content: 'TASK_STORY_USER' });
    await appendTavernMessage(session.id, { role: 'assistant', content: 'TASK_STORY_LATEST_AI' });
    let nativeWorldbookInput: Parameters<TavernGetNativeWorldInfoRuntime>[0] | null = null;
    const layers = await buildTavernTaskPromptLayers({
        sessionId: session.id,
        contextSnapshot,
        anchorOrder: 2,
        getNativeWorldInfoRuntime: async (input) => {
            nativeWorldbookInput = input;
            return {
                worldInfoBefore: 'TASK_WORLD_BEFORE',
                worldInfoAfter: 'TASK_WORLD_AFTER',
                worldInfoExamples: [
                    { position: 'before', content: 'TASK_WORLD_EXAMPLE_TOP' },
                    { position: 'after', content: 'TASK_WORLD_EXAMPLE_BOTTOM' },
                ],
                anBefore: ['TASK_WORLD_AUTHOR_TOP'],
                anAfter: ['TASK_WORLD_AUTHOR_BOTTOM'],
                worldInfoDepth: [{ depth: 3, role: 0, entries: ['TASK_WORLD_DEPTH'] }],
                outlets: { 'quest-terminal': ['TASK_WORLD_OUTLET'] },
            };
        },
    });
    const request = JSON.stringify(buildTavernTaskBoardRequestMessages({
        layers,
    }));
    const worldMarkers = [
        'TASK_WORLD_BEFORE',
        'TASK_WORLD_AFTER',
        'TASK_WORLD_EXAMPLE_TOP',
        'TASK_WORLD_AUTHOR_TOP',
        'TASK_WORLD_EXAMPLE_BOTTOM',
        'TASK_WORLD_AUTHOR_BOTTOM',
        'TASK_WORLD_DEPTH',
        'TASK_WORLD_OUTLET',
    ];

    [
        'TASK_CHARACTER',
        'TASK_DESCRIPTION',
        'TASK_PERSONALITY',
        'TASK_SCENARIO',
        'TASK_USER',
        'TASK_PERSONA',
        ...worldMarkers,
    ].forEach((marker) => assert.equal(request.includes(marker), true));
    assert.equal(nativeWorldbookInput?.currentUserMessage, '');
    assert.equal(JSON.stringify(nativeWorldbookInput?.context.history).includes('TASK_STORY_USER'), true);
    assert.equal(JSON.stringify(nativeWorldbookInput?.context.history).includes('TASK_STORY_LATEST_AI'), true);
});

test('task response parsing keeps valid paid output without inventing a publisher', () => {
    const response = `prefix\n${JSON.stringify({ tasks: boardListings().map(({ id: _id, ...listing }, index) => ({
        ...listing,
        ...(index === 1 ? { issuer: { name: '模型擅自生成的发布者', description: '不应进入委托。' } } : {}),
    })) })}\nsuffix`;
    let id = 0;
    const listings = parseTavernTaskBoardResponse(response, {
        createId: (prefix) => `${prefix}-${++id}`,
    });
    assert.equal(listings.length, 6);
    assert.equal(new Set(listings.map((listing) => listing.id)).size, 6);
    assert.equal(listings.some((listing) => 'issuer' in listing), false);
    const shuffled = parseTavernTaskBoardResponse(JSON.stringify({
        tasks: [...boardListings().slice(3), ...boardListings().slice(0, 3)],
    }), { warn: () => undefined });
    assert.deepEqual(shuffled.map((listing) => listing.tags[0]), ['禁忌', '接触', '夹缝', '窥秘', '掠夺', '怪癖']);

    const warnings: string[] = [];
    const invalidReward = response.replace('"reward":60', '"reward":101');
    assert.equal(parseTavernTaskBoardResponse(invalidReward, { warn: (warning) => warnings.push(warning) }).length, 5);
    assert.equal(warnings.some((warning) => warning.startsWith('task_board_listing_dropped:index=2:')), true);
    assert.equal(warnings.some((warning) => warning.startsWith('task_board_posture_quota_mismatch:')), true);
    const stringReward = response.replace('"reward":60', '"reward":"60"');
    assert.equal(parseTavernTaskBoardResponse(stringReward, { warn: () => undefined }).length, 5);
    assert.equal(parseTavernTaskBoardResponse(JSON.stringify({
        tasks: boardListings().map((listing, index) => index === 0
            ? { ...listing, objective: 123 }
            : listing),
    }), { warn: () => undefined }).length, 5);
    assert.equal(parseTavernTaskBoardResponse(JSON.stringify({
        tasks: boardListings().map((listing, index) => index === 0
            ? { ...listing, timing: '特定时机：三天后' }
            : listing),
    }), { warn: () => undefined }).length, 5);
    assert.equal(parseTavernTaskBoardResponse(JSON.stringify({
        tasks: boardListings().map((listing, index) => index === 0
            ? { ...listing, title: '超过十二个字的任务标题必须被单独丢弃' }
            : listing),
    }), { warn: () => undefined }).length, 5);
    assert.equal(parseTavernTaskBoardResponse(JSON.stringify({ tasks: boardListings().slice(0, 5) }), { warn: () => undefined }).length, 5);

    const withTrailingComma = `${JSON.stringify({ tasks: boardListings().slice(0, 1) }).slice(0, -1)},}`;
    assert.equal(parseTavernTaskBoardResponse(withTrailingComma).length, 1);
    assert.throws(() => parseTavernTaskBoardResponse('{"tasks":['), /task_response_json_invalid/);
    assert.throws(() => parseTavernTaskBoardResponse('{"tasks":"not-an-array"}'), /task_response_shape_invalid:tasks_must_be_array/);
    assert.throws(() => parseTavernTaskBoardResponse('{"tasks":[{"title":"字段不足"}]}'), /task_response_items_invalid:tasks/);

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
    assert.equal(parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: candidateRows().slice(0, 2) })).length, 2);
    assert.equal(
        parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: [
            ...candidateRows(),
            ...candidateRows().slice(0, 2).map((candidate, index) => ({ ...candidate, id: `extra-${index}`, name: `额外候选 ${index}` })),
        ] })).length,
        5,
    );
    const duplicateCandidate = parseTavernTaskCandidatesResponse(JSON.stringify({ candidates: [
        ...candidateRows().slice(0, 2),
        { ...candidateRows()[2], name: ' 候选人 1 ' },
    ] }));
    assert.equal(duplicateCandidate.length, 2);
    assert.equal(duplicateCandidate.some((candidate) => candidate.name === '候选人 1'), true);

    // Titles are display text, not identity: a repeated title is kept, not silently dropped.
    const duplicateListing = parseTavernTaskBoardResponse(JSON.stringify({ tasks: [
        ...boardListings().slice(0, 5),
        { ...boardListings()[5], title: ` ${boardListings()[0].title} ` },
    ] }));
    assert.equal(duplicateListing.length, 6);
    assert.equal(new Set(duplicateListing.map((listing) => listing.id)).size, 6);

    assert.throws(() => assertTavernTaskGenerationFinished('MAX_TOKENS'), /task_response_truncated:MAX_TOKENS/);
    assert.doesNotThrow(() => assertTavernTaskGenerationFinished('STOP'));
    assert.equal(tavernTaskRequestErrorText(new Error('task_response_json_invalid')), '终端返回内容不是合法 JSON。');
    assert.equal(
        tavernTaskRequestErrorText(new Error('task_response_shape_invalid:tasks_must_be_array')),
        '终端返回的 JSON 结构不正确：tasks 或 candidates 必须是数组。',
    );

});

test('database upgrade creates current task storage and clears pre-v20 economy data', async () => {
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
    assert.equal((await tavernSessionsTable.get('v18-task-session'))?.taskBoardEpoch, 1);
    assert.equal(await tavernEconomyAccountsTable.get(['v18-task-session', TAVERN_PLAYER_ACCOUNT_ID]), undefined);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('v18-task-session').count(), 0);
    assert.equal(await getTavernTaskPlayerBalance('v18-task-session'), 100);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('v18-task-session').count(), 1);
});

test('database v20 hard-cuts v19 task and economy data at the upgrade boundary', async () => {
    await db.delete();
    const legacyDb = new Dexie('LittleWhiteBox_Tavern');
    const legacyRuntime = legacyDb as unknown as {
        table(name: string): { put(record: Record<string, unknown>): Promise<unknown> };
        close(): void;
    };
    legacyDb.version(19).stores({
        sessions: 'id, updatedAt',
        taskBoards: 'sessionId, generationId, revision, anchorOrder, generatedAt',
        taskVersions: '[sessionId+taskId+revision], sessionId, taskId, revision, &[sessionId+actionId], &[sessionId+taskId+currentMarker], [sessionId+currentMarker], [sessionId+status+currentMarker], [sessionId+anchorOrder], [sessionId+sourceBoardId+sourceListingId], updatedAt',
    });
    await legacyDb.open();
    await legacyRuntime.table('sessions').put({
        id: 'v19-task-session',
        title: 'v19 session',
        createdAt: 1,
        updatedAt: 1,
    });
    await legacyRuntime.table('taskBoards').put({
        sessionId: 'v19-task-session',
        generationId: 'v19-board',
        revision: 1,
        anchorOrder: 0,
        listings: boardListings(),
        generatedAt: 1,
    });
    await legacyRuntime.table('taskVersions').put({
        sessionId: 'v19-task-session',
        taskId: 'v19-task',
        revision: 1,
        currentMarker: 'current',
        actionId: 'v19-action',
        status: 'active',
        title: '旧任务',
        objective: '验证一次性升级边界',
        issuer: { id: 'issuer', kind: 'npc', name: '委托人' },
        assignee: { id: 'player', kind: 'player', name: '玩家' },
        candidates: [],
        reward: 10,
        escrowAccountId: 'escrow:task:v19-task',
        anchorOrder: 0,
        createdAt: 1,
        updatedAt: 1,
    });
    legacyRuntime.close();

    await db.open();
    const migratedSession = await tavernSessionsTable.get('v19-task-session');
    const migratedBoard = await tavernTaskBoardsTable.get('v19-task-session');
    const migratedVersion = await tavernTaskVersionsTable.get(['v19-task-session', 'v19-task', 1]);
    assert.equal(migratedSession?.taskBoardEpoch, 1);
    assert.equal(migratedBoard, undefined);
    assert.equal(migratedVersion, undefined);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals('v19-task-session').count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('v19-task-session').count(), 0);
    assert.equal(await getTavernTaskPlayerBalance('v19-task-session'), 100);
});

test('task board replacement accepts partial generated output and remains CAS-protected', async () => {
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
    const partial = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 1,
        anchorOrder: 2,
        generationId: 'partial-board',
        listings: boardListings().slice(0, 5),
    });
    assert.equal(partial.listings.length, 5);
    assert.equal((await tavernTaskBoardsTable.get(session.id))?.generationId, 'partial-board');
});

test('task board persists distinct listings when display titles repeat', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task board duplicate display titles' });
    const generated = boardListings().map(({ id: _id, ...listing }) => listing);
    generated[5] = { ...generated[5], title: ` ${generated[0].title} ` };
    const listings = parseTavernTaskBoardResponse(JSON.stringify({ tasks: generated }));

    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'same-title-board',
        listings,
    });

    assert.equal(board.listings.length, 6);
    assert.equal(board.listings.filter((listing) => listing.title === generated[0].title).length, 2);
    assert.equal(new Set(board.listings.map((listing) => listing.id)).size, 6);
});

test('task board epoch rejects a stale refresh after rollback recreates the same revision', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task board ABA' });
    const first = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 2,
        generationId: 'board-before-rollback',
        listings: boardListings(),
    });
    const staleBoundary = await captureTavernTaskPhoneBoundary(session.id);
    await restoreTavernAcceptedEconomicStateToFloor(session.id, 1);
    const epochAfterRollback = Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch);
    const replacement = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        expectedEpoch: epochAfterRollback,
        anchorOrder: 2,
        generationId: 'board-after-rollback',
        listings: boardListings().map((listing) => ({ ...listing, title: `${listing.title} 新` })),
    });
    assert.equal(replacement.revision, first.revision);
    assert.notEqual(replacement.epoch, first.epoch);

    await assert.rejects(replaceTavernTaskBoardRaw({
        sessionId: session.id,
        expectedRevision: first.revision,
        expectedEpoch: first.epoch,
        boundary: staleBoundary,
        generationId: 'late-old-refresh',
        listings: boardListings(),
    }), /task_board_epoch_conflict/);
    assert.equal((await tavernTaskBoardsTable.get(session.id))?.generationId, replacement.generationId);
});

test('an empty task board rollback still advances its epoch and rejects a stale rev0 refresh', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Empty task board rollback' });
    const staleBoundary = await captureTavernTaskPhoneBoundary(session.id);
    const epochBeforeRollback = Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch);

    const restored = await restoreTavernAcceptedEconomicStateToFloor(session.id, 0);
    assert.equal(restored.tasks.clearedBoard, false);
    const epochAfterRollback = Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch);
    assert.equal(epochAfterRollback, epochBeforeRollback + 1);

    await assert.rejects(replaceTavernTaskBoardRaw({
        sessionId: session.id,
        expectedRevision: 0,
        expectedEpoch: epochBeforeRollback,
        boundary: staleBoundary,
        generationId: 'stale-empty-board-refresh',
        listings: boardListings(),
    }), /task_board_epoch_conflict/);
    assert.equal(await tavernTaskBoardsTable.get(session.id), undefined);
});

test('a stale board refresh is rejected when the latest message keeps its floor but changes identity', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Board message identity ABA' });
    const original = await appendTavernMessage(session.id, { role: 'user', content: '原始剧情边界' });
    const staleBoundary = await captureTavernTaskPhoneBoundary(session.id);
    await deleteTavernMessages(session.id, [original.order]);
    const replacement = await appendTavernMessage(session.id, { role: 'user', content: '替换后的剧情边界' });
    assert.equal(replacement.order, original.order);
    assert.equal(replacement.timelineRevision, original.timelineRevision);
    assert.notEqual(replacement.messageId, original.messageId);

    await assert.rejects(replaceTavernTaskBoardRaw({
        sessionId: session.id,
        expectedRevision: 0,
        expectedEpoch: 1,
        boundary: staleBoundary,
        generationId: 'stale-message-identity-board',
        listings: boardListings(),
    }), /task_timeline_conflict/);
    assert.equal(await tavernTaskBoardsTable.get(session.id), undefined);
});

test('a stale publish after the latest message revision changes leaves task and wallet facts untouched', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Publish message revision CAS' });
    assert.equal(await getTavernTaskPlayerBalance(session.id), 100);
    const source = await appendTavernMessage(session.id, { role: 'user', content: '发布前剧情' });
    const staleBoundary = await captureTavernTaskPhoneBoundary(session.id);
    const revised = await updateTavernMessage(
        session.id,
        source.order,
        { content: '发布前剧情（修订）' },
        { incrementTimelineRevision: true },
    );
    assert.equal(revised?.messageId, source.messageId);
    assert.equal(revised?.timelineRevision, source.timelineRevision + 1);
    const versionCountBefore = await tavernTaskVersionsTable.where('sessionId').equals(session.id).count();
    const transactionCountBefore = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    const balanceBefore = await getTavernTaskPlayerBalance(session.id);

    await assert.rejects(publishTavernTask({
        sessionId: session.id,
        taskId: 'stale-publish-task',
        actionId: 'stale-publish-after-message-revision',
        title: '迟到发布',
        objective: '不能越过剧情修订冻结钱包。',
        location: '测试区',
        reward: 20,
        boundary: staleBoundary,
    }), /task_timeline_conflict/);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(session.id).count(), versionCountBefore);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), transactionCountBefore);
    assert.equal(await getTavernTaskPlayerBalance(session.id), balanceBefore);
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
    assert.equal(accepted.progressSummary, '已接取任务');
    assert.equal(accepted.posture, '易介入');
    assert.equal(accepted.timing, '现在就行');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, accepted.escrowAccountId]))?.balance, 100);
    assert.equal((await tavernEconomyAccountsTable.get([
        session.id,
        buildTavernTaskCounterpartyAccountId(accepted.issuer.id),
    ]))?.balance, -100);
    assert.equal((await tavernTaskBoardsTable.get(session.id))?.listings.length, 6);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(session.id).count(), 1);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);
    const laterBoundary = await phoneBoundaryForTest({ sessionId: session.id, anchorOrder: 2 });
    await assert.rejects(acceptTavernTaskListing({ ...input, boundary: laterBoundary }), /task_action_conflict/);
    await assert.rejects(acceptTavernTaskListing({
        ...input,
        boundary: laterBoundary,
        actionId: 'second-action',
        taskId: 'second-task',
    }), /task_listing_already_accepted/);
});

test('task progress stores a bounded objective state instead of an unbounded turn recap', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Bounded task progress' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 1,
        generationId: 'bounded-progress-board',
        listings: boardListings(),
    });
    const accepted = await acceptTavernTaskListing({
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 1,
        actionId: 'bounded-progress-accept',
        taskId: 'bounded-progress-task',
    });
    const verboseSummary = '已确认一条目标事实🙂'.repeat(30);
    const progress = await progressTavernTask({
        sessionId: session.id,
        taskId: accepted.taskId,
        expectedRevision: accepted.revision,
        progressSummary: verboseSummary,
        anchorOrder: 2,
        actionId: 'bounded-progress-update',
    });
    assert.equal([...progress.progressSummary].length, TAVERN_TASK_PROGRESS_SUMMARY_MAX_LENGTH);
    assert.equal(
        progress.progressSummary,
        [...verboseSummary].slice(0, TAVERN_TASK_PROGRESS_SUMMARY_MAX_LENGTH).join(''),
    );
});

test('accepting before the board boundary fails without creating task or wallet facts', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task board anchor guard' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 2,
        generationId: 'future-board',
        listings: boardListings(),
    });
    const transactionCount = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    await deleteTavernMessages(session.id, [1]);
    const earlierBoundary = await captureTavernTaskPhoneBoundary(session.id);
    await assert.rejects(acceptTavernTaskListingRaw({
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        boardEpoch: board.epoch,
        listingId: board.listings[0].id,
        boundary: earlierBoundary,
        actionId: 'accept-before-board',
        taskId: 'task-before-board',
    }), /task_anchor_order_regression/);
    assert.equal(await tavernTaskVersionsTable.where('sessionId').equals(session.id).count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), transactionCount);
});

test('phone boundary hides a task from the previous assistant floor and reveals it at the next floor', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task phone boundary' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 2,
        generationId: 'phone-boundary-board',
        listings: boardListings(),
    });
    const task = await acceptTavernTaskListing({
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 2,
        actionId: 'phone-boundary-accept',
        taskId: 'phone-boundary-task',
    });
    const previousFloor = await loadTavernTaskAnchorSnapshot(session.id, { anchorOrder: 1 });
    const nextFloor = await loadTavernTaskAnchorSnapshot(session.id, { anchorOrder: 2 });
    assert.equal(previousFloor.tasks.some((row) => row.taskId === task.taskId), false);
    assert.equal(nextFloor.tasks.some((row) => row.taskId === task.taskId), true);
});

test('task version id rejects a stale mutation after rollback rebuilds the same revision', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Task revision ABA' });
    const board = await replaceTavernTaskBoard({
        sessionId: session.id,
        expectedRevision: 0,
        anchorOrder: 0,
        generationId: 'task-revision-aba-board',
        listings: boardListings(),
    });
    const accepted = await acceptTavernTaskListing({
        sessionId: session.id,
        boardId: board.generationId,
        boardRevision: board.revision,
        listingId: board.listings[0].id,
        anchorOrder: 0,
        actionId: 'accept-revision-aba',
        taskId: 'task-revision-aba',
    });
    const oldRevisionTwo = await progressTavernTask({
        sessionId: session.id,
        taskId: accepted.taskId,
        expectedRevision: accepted.revision,
        progressSummary: '旧时间线的第二版',
        anchorOrder: 1,
        actionId: 'old-revision-two',
    });
    await restoreTavernAcceptedEconomicStateToFloor(session.id, 0);
    const restored = await getCurrentTavernTask(session.id, accepted.taskId);
    const rebuiltRevisionTwo = await progressTavernTaskRaw({
        sessionId: session.id,
        taskId: accepted.taskId,
        expectedRevision: restored?.revision || 0,
        expectedVersionId: restored?.versionId || '',
        progressSummary: '新时间线的第二版',
        anchorOrder: 1,
        actionId: 'rebuilt-revision-two',
    });
    assert.equal(rebuiltRevisionTwo.revision, oldRevisionTwo.revision);
    assert.notEqual(rebuiltRevisionTwo.versionId, oldRevisionTwo.versionId);

    await assert.rejects(progressTavernTaskRaw({
        sessionId: session.id,
        taskId: accepted.taskId,
        expectedRevision: oldRevisionTwo.revision,
        expectedVersionId: oldRevisionTwo.versionId,
        progressSummary: '迟到的旧响应',
        anchorOrder: 2,
        actionId: 'late-old-revision-two',
    }), /task_version_conflict/);
    assert.equal((await getCurrentTavernTask(session.id, accepted.taskId))?.versionId, rebuiltRevisionTwo.versionId);
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
        candidates: candidateRows().slice(0, 2),
        anchorOrder: 1,
        actionId: 'candidate-refresh',
    });
    assert.equal(recruiting.candidates.length, 2);
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

test('task cancellation and failure return escrow to the correct funding source', async () => {
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
    assert.equal((await tavernEconomyAccountsTable.get([
        acceptedSession.id,
        buildTavernTaskCounterpartyAccountId(accepted.issuer.id),
    ]))?.balance, 0);
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
    assert.equal(await getTavernTaskPlayerBalance(session.id), 250);

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
    assert.equal(await getTavernTaskPlayerBalance(session.id), 245);

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

    const boardEpochBeforeRestore = Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch);
    const restored = await restoreTavernAcceptedEconomicStateToFloor(session.id, 2);
    assert.equal(restored.tasks.changed, true);
    assert.ok(Number((await tavernSessionsTable.get(session.id))?.taskBoardEpoch) > boardEpochBeforeRestore);
    assert.equal(restored.economy.transactionCount, 1);
    assert.equal(await tavernEconomyTransactionsTable.get([session.id, laterSpend.id]), undefined);
    const retainedSettlement = settlement
        ? await tavernEconomyTransactionsTable.get([session.id, settlement.id])
        : undefined;
    assert.equal(retainedSettlement?.playerBalanceAfter, 250);
    assert.equal((await getCurrentTavernTask(session.id, accepted.taskId))?.status, 'completed');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 250);
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
    assert.deepEqual(await describeTavernAcceptedEconomicRestoreImpact(session.id, 2).then((impact) => ({
        tasks: impact.tasks.changed,
        economy: impact.economy.changed,
    })), { tasks: true, economy: true });
    const restored = await restoreTavernAcceptedEconomicStateToFloor(session.id, 2);
    assert.equal(restored.tasks.clearedBoard, true);
    assert.equal(restored.economy.transactionCount, 1);
    assert.equal(await tavernTaskBoardsTable.get(session.id), undefined);
    const current = await getCurrentTavernTask(session.id, active.taskId);
    assert.equal(current?.revision, 1);
    assert.equal(current?.status, 'active');
    assert.equal(current?.currentMarker, 'current');
    assert.equal(await getTavernTaskPlayerBalance(session.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, active.escrowAccountId]))?.balance, 60);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_PLAYER_ACCOUNT_ID]))?.balance, 100);
});
