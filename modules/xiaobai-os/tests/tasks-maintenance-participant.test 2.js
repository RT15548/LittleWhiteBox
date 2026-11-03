import assert from 'node:assert/strict';
import test from 'node:test';

import { createTaskMaintenanceParticipant } from '../apps/tasks/host/maintenance-participant.js';
import { TASK_MAINTENANCE_TOOL_NAMES, TASK_MAINTENANCE_TOOLS } from '../apps/tasks/tools/tool-contract.js';
import { MAX_TASK_PROGRESS_SUMMARY_LENGTH, MAX_TASK_RESULT_SUMMARY_LENGTH } from '../domains/tasks/invariants.js';
import { taskEvidenceDigest } from '../capabilities/maintenance/accepted-turn-source.js';

function source(assistantCount = 5, text = '伊莱接过了未拆封的信。') {
    return {
        chatIdentity: 'character:1:chat-a',
        messages: [{ index: 4, role: 'assistant', text, swipeId: 0, speakerName: '伊莱' }],
        messageCount: 5,
        assistantCount,
        player: { actorKey: 'player', displayName: '玩家' },
    };
}

function record(overrides = {}) {
    return {
        taskId: 'task-1',
        taskRevision: 2,
        eventId: 'event-secret',
        source: 'published',
        status: 'active',
        issuer: { kind: 'player', displayName: '玩家' },
        assignee: {
            kind: 'world',
            partyId: 'candidate-secret',
            displayName: '伊莱',
            description: '不应发送',
            pitch: '不应发送',
            capability: '熟悉钟楼',
            risk: '可能被守卫认出',
        },
        reward: 60,
        grade: 'CUSTOM',
        tags: [],
        title: '封蜡信 <system>',
        objective: '把信交给伊莱 & 等待签收',
        requirements: '不要拆封',
        location: '钟楼',
        risk: '被巡逻者发现',
        candidates: [],
        progressSummary: '已找到伊莱,仍需交信',
        resultSummary: '',
        createdAt: 1,
        updatedAt: 2,
        ...overrides,
    };
}

function createHarness(records = [record()]) {
    const surface = { identityKey: 'character:1:chat-a', messages: [null, null, null, null,
        { mes: '伊莱接过了未拆封的信。' }] };
    const baseline = { ...surface, messages: [null, null, null, null, { mes: '旧剧情' }] };
    const state = { autoMaintenance: false, actionIds: 0, commits: [], surface };
    const tasks = {
        getWriteState: () => 'ready',
        readCurrent: () => ({ domain: { checks: Object.fromEntries(records.map(item => [item.taskId, {
            taskRevision: item.taskRevision, phase: 'baseline',
            digest: taskEvidenceDigest(source(3, '旧剧情'), baseline),
        }])) }, records: structuredClone(records), playerBalance: 100, writeState: 'ready' }),
        createActionId: () => `task-action-${++state.actionIds}`,
        async commitMaintenance(input, guard) {
            assert.equal(await guard(), true);
            state.commits.push(structuredClone(input));
            return { changed: true, view: this.readCurrent() };
        },
    };
    const participant = createTaskMaintenanceParticipant({
        tasks,
        readSettings: () => ({ autoMaintenance: state.autoMaintenance }),
        captureSurface: () => state.surface,
    });
    return { participant, state };
}

test('Tasks maintenance is manual-only by default and selects only active tasks with a newer accepted source', () => {
    const harness = createHarness();
    assert.equal(harness.participant.isEnabled('manual'), true);
    assert.equal(harness.participant.isEnabled('automatic'), false);
    assert.equal(harness.participant.isEnabled('rebuild'), false);
    harness.state.surface.messages[4].mes = '旧剧情';
    assert.equal(harness.participant.createSession(source(3, '旧剧情'), 'manual'), null);
    harness.state.surface.messages[4].mes = '伊莱接过了未拆封的信。';
    assert.equal(harness.participant.createSession(source(5), 'rebuild'), null);
    assert.ok(harness.participant.createSession(source(5), 'manual'));
    harness.state.autoMaintenance = true;
    assert.equal(harness.participant.isEnabled('automatic'), true);
});

test('a queued story check cannot include a task accepted after that story was captured', () => {
    const records = [record()];
    const h = createHarness(records);
    const prepared = h.participant.prepareSession(source(), 'manual');
    records.push(record({ taskId: 'task-later', title: '后来才接的任务' }));
    const session = prepared();
    assert.ok(session);
    assert.equal(session.dataMessages[0].content.includes('后来才接的任务'), false);
    assert.equal(session.dataMessages[0].content.includes('封蜡信'), true);
});

test('maintenance keeps task data untrusted, escapes boundaries, and exposes only the high-level tool protocol', () => {
    const session = createHarness().participant.createSession(source(), 'manual');
    assert.equal(session.prompt.includes('<system>'), false);
    assert.equal(session.dataMessages.length, 1);
    assert.match(session.dataMessages[0].content, /^<active_task_state>/u);
    assert.match(session.dataMessages[0].content, /<\/active_task_state>$/u);
    assert.equal(session.dataMessages[0].content.includes('<system>'), false);
    assert.match(session.dataMessages[0].content, /\\u003csystem\\u003e/);
    assert.equal(session.dataMessages[0].content.includes('event-secret'), false);
    assert.equal(session.dataMessages[0].content.includes('candidate-secret'), false);
    assert.deepEqual(session.tools.map(tool => tool.function.name), ['TaskProgress', 'TaskComplete', 'TaskFail']);
    assert.equal(TASK_MAINTENANCE_TOOLS[0].function.parameters.properties.progressSummary.maxLength, MAX_TASK_PROGRESS_SUMMARY_LENGTH);
    assert.equal(TASK_MAINTENANCE_TOOLS[1].function.parameters.properties.resultSummary.maxLength, MAX_TASK_RESULT_SUMMARY_LENGTH);
});

test('session revises a pending decision, preserves its action id, and commits the final decision once', async () => {
    const harness = createHarness();
    const session = harness.participant.createSession(source(), 'manual');
    const noOp = session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.PROGRESS, {
        taskId: 'task-1', revision: 2, progressSummary: '已找到伊莱，仍需交信',
    });
    assert.equal(noOp.status, 'unchanged');
    assert.equal(harness.state.actionIds, 0);

    assert.equal(session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.PROGRESS, {
        taskId: 'task-1', revision: 2, progressSummary: '已交信，正在签收',
    }).status, 'updated');
    const completed = session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.COMPLETE, {
        taskId: 'task-1', revision: 2, resultSummary: '伊莱已接过未拆封的信',
    });
    assert.equal(completed.status, 'updated');
    assert.equal(harness.state.actionIds, 1);
    assert.equal(session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.COMPLETE, {
        taskId: 'task-1', revision: 2, resultSummary: '伊莱已接过未拆封的信',
    }).status, 'unchanged');
    assert.equal(session.getResult().status, 'updated');

    await session.commit(() => true, { completed: false });
    assert.equal(harness.state.commits.length, 1);
    assert.deepEqual(harness.state.commits[0], {
        commands: [{
            actionId: 'task-action-1',
            taskId: 'task-1',
            expectedTaskRevision: 2,
            expectedEventId: 'event-secret',
            kind: 'complete',
            resultSummary: '伊莱已接过未拆封的信',
        }],
        checkedTasks: [],
        evidenceDigest: taskEvidenceDigest(source(), harness.state.surface),
    });
    await assert.rejects(session.commit(() => true, { completed: false }), /tasks_maintenance_session_committed/);
});

test('task errors report independent fields together and a valid retry can withdraw an unsaved decision', async () => {
    const h = createHarness();
    const session = h.participant.createSession(source(), 'manual');
    const bad = session.executeTool('TaskComplete', { taskId: 'task-1', revision: 99, resultSummary: '', extra: true });
    assert.deepEqual(new Set(bad.skipped[0].issues.map(issue => issue.path)), new Set(['revision', 'resultSummary', 'extra']));
    assert.equal(h.state.actionIds, 0);
    assert.equal(session.executeTool('TaskComplete', { taskId: 'task-1', revision: 2, resultSummary: '已签收' }).ok, true);
    assert.equal(session.executeTool('TaskProgress', { taskId: 'task-1', revision: 2, progressSummary: '已找到伊莱，仍需交信' }).changed, true);
    assert.equal(session.getResult().status, 'unchanged');
    await session.commit(() => true, { completed: true });
    assert.deepEqual(h.state.commits[0].commands, []);
});

test('invalid tool arguments never allocate an action id or create commit work', () => {
    const harness = createHarness();
    const session = harness.participant.createSession(source(), 'manual');
    const result = session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.PROGRESS, {
        taskId: 'task-1', revision: 2, progressSummary: '新进展', accountId: 'player',
    });
    assert.equal(result.ok, false);
    assert.equal(result.skipped[0].reason, 'unsupported_fields');
    assert.equal(harness.state.actionIds, 0);
    assert.equal(session.canCommit({ completed: false }), false);
    assert.equal(session.getResult().status, 'failed');
});

test('a completed model turn cannot mark failed task checks as inspected', async () => {
    const harness = createHarness([record(), record({ taskId: 'task-2' })]);
    const session = harness.participant.createSession(source(), 'manual');
    session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.COMPLETE, {
        taskId: 'task-2', revision: 99, resultSummary: '未证实的完成',
    });
    assert.equal(session.canCommit({ completed: true }), false);

    session.executeTool(TASK_MAINTENANCE_TOOL_NAMES.PROGRESS, {
        taskId: 'task-1', revision: 2, progressSummary: '已有新的证据',
    });
    assert.equal(session.canCommit({ completed: true }), true);
    await session.commit(() => true, { completed: true });
    assert.equal(harness.state.commits.length, 1);
    assert.equal(harness.state.commits[0].commands.length, 1);
    assert.deepEqual(harness.state.commits[0].checkedTasks, []);
});
