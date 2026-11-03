import assert from 'node:assert/strict';
import test from 'node:test';

import { acceptTaskListing, publishTask, replaceTaskBoard } from '../domains/tasks/commands/create.js';
import { completeTask, progressTask } from '../domains/tasks/commands/maintenance.js';
import { assignTaskCandidate, cancelTask, replaceTaskCandidates } from '../domains/tasks/commands/recruitment.js';
import {
    TASK_CANCELLED_SUMMARY,
    createEmptyTaskDomain,
    normalizeTaskBoardListing,
    validateTaskDomain,
} from '../domains/tasks/invariants.js';
import {
    projectTaskRecord,
    projectTaskRecords,
} from '../domains/tasks/projection.js';

function environment(ids = []) {
    let sequence = 0;
    let calls = 0;
    return {
        value: {
            now: () => 1_000 + sequence,
            createId: () => {
                calls += 1;
                sequence += 1;
                return ids.shift() ?? `event-${sequence}`;
            },
        },
        calls: () => calls,
    };
}

function listing(listingId = 'listing-1', direction = '禁忌') {
    const facts = {
        禁忌: ['B', 150], 接触: ['C', 60], 夹缝: ['C', 100],
        窥秘: ['C', 80], 掠夺: ['C', 100], 怪癖: ['D', 25],
    }[direction];
    return {
        listingId,
        grade: facts[0],
        tags: [direction, '城内'],
        posture: '中介入',
        title: `${direction}委托`,
        hook: '有人通过终端留下了匿名委托。',
        objective: '把密封信送到钟楼守卫手中',
        requirements: '不得拆封',
        location: '旧城钟楼',
        timing: '任意时候',
        risk: '可能被巡逻者盘问',
        reward: facts[1],
    };
}

function candidate(candidateId = 'candidate-1', name = '艾拉') {
    return { candidateId, name, description: '熟悉旧城的佣兵', pitch: '我能避开巡逻路线',
        capability: '潜行与路线规划', risk: '不愿伤及无辜' };
}

function form(overrides = {}) {
    return { title: '护送药箱', objective: '把药箱送到南门诊所', requirements: '保持药箱直立',
        location: '南门诊所', risk: '', reward: 80, ...overrides };
}

function cas(record) {
    return { expectedTaskRevision: record.taskRevision, expectedEventId: record.eventId };
}

test('current board normalization enforces legality, order and capacities without truncation', () => {
    const normalized = normalizeTaskBoardListing({ ...listing(), title: '  Ａ\u0000 任务  ' });
    assert.equal(normalized.title, 'A 任务');
    const partial = replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null,
        boardId: 'board-1',
        listings: [listing('listing-1', '禁忌'), listing('listing-2', '窥秘')],
        generatedAt: 10,
    }).domain;
    assert.equal(partial.revision, 1);
    assert.doesNotThrow(() => validateTaskDomain(partial));
    assert.throws(() => replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null, boardId: 'board-2',
        listings: [listing('listing-2', '窥秘'), listing('listing-1', '禁忌')], generatedAt: 10,
    }), error => error.code === 'task_invalid_input');
    assert.throws(() => normalizeTaskBoardListing({ ...listing(), title: '甲'.repeat(13) }),
        error => error.code === 'task_invalid_input');
    assert.throws(() => normalizeTaskBoardListing({ ...listing(), reward: 149 }),
        error => error.code === 'task_invalid_input');
});

test('persisted board rewards remain frozen facts while new boards use the current ranges', () => {
    let domain = replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null,
        boardId: 'board-frozen-reward',
        listings: [listing('listing-frozen-reward')],
        generatedAt: 10,
    }).domain;
    domain = acceptTaskListing(domain, {
        actionId: 'accept-frozen-reward',
        taskId: 'task-frozen-reward',
        boardId: 'board-frozen-reward',
        listingId: 'listing-frozen-reward',
        playerDisplayName: '主人',
    }, environment(['event-frozen-reward']).value).domain;
    const historical = structuredClone(domain);
    historical.board.listings[0].reward = 1_000;
    historical.events[0].listing.reward = 1_000;

    assert.doesNotThrow(() => validateTaskDomain(historical));
    assert.equal(projectTaskRecord(historical, 'task-frozen-reward').reward, 1_000);
    assert.throws(() => replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null,
        boardId: 'board-current-policy',
        listings: [{ ...listing('listing-current-policy'), reward: 1_000 }],
        generatedAt: 10,
    }), error => error.code === 'task_invalid_input');
});

test('accept and publish create exact frozen facts with globally unique IDs and pure projections', () => {
    let domain = replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null, boardId: 'board-1', listings: [listing()], generatedAt: 10,
    }).domain;
    const env = environment(['board-1', 'event-accepted']);
    const accepted = acceptTaskListing(domain, {
        actionId: 'action-accept', taskId: 'task-received', boardId: 'board-1', listingId: 'listing-1',
        playerDisplayName: ' 主人 ',
    }, env.value);
    assert.equal(env.calls(), 2);
    assert.equal(accepted.domain.revision, 2);
    assert.equal(accepted.record.progressSummary, '已接取任务');
    assert.deepEqual(accepted.record.issuer, { kind: 'world', partyId: 'board:task-received',
        displayName: '任务终端托管', description: '匿名委托报酬的内部结算来源' });
    const snapshot = structuredClone(accepted.domain);
    const projected = projectTaskRecords(accepted.domain);
    projected[0].title = '被修改';
    assert.deepEqual(accepted.domain, snapshot);

    const published = publishTask(accepted.domain, {
        actionId: 'action-publish', taskId: 'task-published', form: form({ title: '  Ａ任务 ' }),
        playerDisplayName: '主人',
    }, environment(['event-published']).value);
    assert.equal(published.record.title, 'A任务');
    assert.equal(published.record.grade, 'CUSTOM');
    assert.deepEqual(published.record.tags, []);
    assert.equal(published.record.status, 'recruiting');
    assert.doesNotThrow(() => validateTaskDomain(published.domain));
});

test('action replay is semantic and precedes stale guards while different intent conflicts', () => {
    let domain = replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null, boardId: 'board-1', listings: [listing()], generatedAt: 10,
    }).domain;
    const input = { actionId: 'action-accept', taskId: 'task-1', boardId: 'board-1', listingId: 'listing-1',
        playerDisplayName: '主人' };
    const first = acceptTaskListing(domain, input, environment(['event-1']).value);
    domain = replaceTaskBoard(first.domain, {
        expectedBoardId: 'board-1', boardId: 'board-2', listings: [listing('listing-2')], generatedAt: 20,
    }).domain;
    const replayEnv = environment();
    const replay = acceptTaskListing(domain, input, replayEnv.value);
    assert.equal(replay.changed, false);
    assert.equal(replay.event.eventId, 'event-1');
    assert.equal(replayEnv.calls(), 0);
    assert.throws(() => acceptTaskListing(domain, { ...input, listingId: 'listing-2' }, replayEnv.value),
        error => error.code === 'task_action_conflict');
    assert.throws(() => acceptTaskListing(domain, { ...input, actionId: 'another-action' }, replayEnv.value),
        error => error.code === 'task_board_missing');
});

test('recruitment replaces snapshots, assigns only a current candidate and fixes cancellation text', () => {
    const env = environment(['event-publish', 'event-candidates', 'event-assign']);
    let result = publishTask(createEmptyTaskDomain(), {
        actionId: 'action-publish', taskId: 'task-1', form: form(), playerDisplayName: '主人',
    }, env.value);
    result = replaceTaskCandidates(result.domain, {
        actionId: 'action-candidates', taskId: 'task-1', ...cas(result.record),
        candidates: [candidate()],
    }, env.value);
    const candidateSnapshot = structuredClone(result.record.candidates[0]);
    result = assignTaskCandidate(result.domain, {
        actionId: 'action-assign', taskId: 'task-1', ...cas(result.record), candidateId: 'candidate-1',
    }, env.value);
    assert.equal(result.record.status, 'active');
    assert.deepEqual(result.record.candidates, []);
    assert.deepEqual(result.record.assignee, { kind: 'world', partyId: candidateSnapshot.candidateId,
        displayName: candidateSnapshot.name, description: candidateSnapshot.description,
        pitch: candidateSnapshot.pitch, capability: candidateSnapshot.capability, risk: candidateSnapshot.risk });
    assert.equal(result.record.progressSummary, '艾拉已接取任务');

    const cancelEnv = environment(['event-publish-2', 'event-cancel']);
    let cancelled = publishTask(createEmptyTaskDomain(), {
        actionId: 'publish-2', taskId: 'task-2', form: form(), playerDisplayName: '主人',
    }, cancelEnv.value);
    cancelled = cancelTask(cancelled.domain, { actionId: 'cancel-2', taskId: 'task-2', ...cas(cancelled.record),
        }, cancelEnv.value);
    assert.equal(cancelled.event.resultSummary, TASK_CANCELLED_SUMMARY);
    assert.throws(() => replaceTaskCandidates(result.domain, {
        actionId: 'bad-recruit', taskId: 'task-1', ...cas(result.record), candidates: [],
    }, env.value), error => error.code === 'task_task_not_recruiting');
});

test('maintenance CAS, no-op ID use, replacement progress and terminal guards are exact', () => {
    const env = environment(['event-publish', 'event-candidates', 'event-assign', 'event-progress', 'event-complete']);
    let result = publishTask(createEmptyTaskDomain(), {
        actionId: 'publish', taskId: 'task-1', form: form(), playerDisplayName: '主人',
    }, env.value);
    result = replaceTaskCandidates(result.domain, { actionId: 'candidates', taskId: 'task-1', ...cas(result.record),
        candidates: [candidate()] }, env.value);
    result = assignTaskCandidate(result.domain, { actionId: 'assign', taskId: 'task-1', ...cas(result.record),
        candidateId: 'candidate-1' }, env.value);
    const beforeNoopCalls = env.calls();
    const noOp = progressTask(result.domain, { actionId: 'reusable-noop', taskId: 'task-1', ...cas(result.record),
        progressSummary: '艾拉已接取任务' }, env.value);
    assert.equal(noOp.changed, false);
    assert.equal(noOp.event, null);
    assert.equal(env.calls(), beforeNoopCalls);

    result = progressTask(noOp.domain, { actionId: 'reusable-noop', taskId: 'task-1', ...cas(noOp.record),
        progressSummary: '已经取得药箱，尚未抵达诊所' }, env.value);
    assert.equal(result.record.progressSummary, '已经取得药箱,尚未抵达诊所');
    const stale = { ...cas(noOp.record), expectedEventId: 'wrong' };
    assert.throws(() => completeTask(result.domain, { actionId: 'stale', taskId: 'task-1', ...stale,
        resultSummary: '完成' }, env.value), error => error.code === 'task_revision_conflict');
    const completionInput = { actionId: 'complete', taskId: 'task-1', ...cas(result.record),
        resultSummary: '药箱已经交给诊所' };
    const completed = completeTask(result.domain, completionInput, env.value);
    assert.equal(completed.record.status, 'completed');
    assert.throws(() => progressTask(completed.domain, { actionId: 'after-terminal', taskId: 'task-1',
        ...cas(completed.record), progressSummary: '重开' }, env.value),
    error => error.code === 'task_terminal');
    assert.equal(completeTask(completed.domain, completionInput, environment().value).changed, false);
});

test('strict invariant replay rejects exact-key, revision, identity and transition corruption', () => {
    const env = environment(['event-publish', 'event-candidates', 'event-assign']);
    let result = publishTask(createEmptyTaskDomain(), { actionId: 'publish', taskId: 'task-1', form: form(),
        playerDisplayName: '主人' }, env.value);
    result = replaceTaskCandidates(result.domain, { actionId: 'candidates', taskId: 'task-1', ...cas(result.record),
        candidates: [candidate()] }, env.value);
    result = assignTaskCandidate(result.domain, { actionId: 'assign', taskId: 'task-1', ...cas(result.record),
        candidateId: 'candidate-1' }, env.value);
    for (const corrupt of [
        (domain) => { domain.extra = true; },
        (domain) => { domain.events[1].taskRevision = 3; },
        (domain) => { domain.events[2].eventId = domain.events[0].actionId; },
        (domain) => { domain.events[2].assignee.partyId = 'not-the-candidate'; },
        (domain) => { domain.revision = 1; },
    ]) {
        const domain = structuredClone(result.domain);
        corrupt(domain);
        assert.throws(() => validateTaskDomain(domain), error => error.code === 'task_invalid_domain');
    }
    assert.equal(projectTaskRecord(result.domain, 'task-1').taskRevision, 3);
});
