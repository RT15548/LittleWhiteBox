import assert from 'node:assert/strict';
import test from 'node:test';
import { acceptTaskListing, publishTask, replaceTaskBoard } from '../domains/tasks/commands/create.js';
import { assignTaskCandidate, replaceTaskCandidates } from '../domains/tasks/commands/recruitment.js';
import { completeTask } from '../domains/tasks/commands/maintenance.js';
import { createEmptyTaskDomain } from '../domains/tasks/invariants.js';
import { projectTaskRecords } from '../domains/tasks/projection.js';
import { presentTaskHistory } from '../apps/tasks/host/presentation.js';
import { taskIssuer, taskLanes } from '../apps/tasks/ui/task-display.js';

// Public display contract: accepting and commissioning are separate lanes.
// Host/domain tests do not protect where a confirmed task appears in the UI.
function environment() {
    let id = 0;
    return { now: () => 1000 + id, createId: () => `event-${++id}` };
}
function view(domain) {
    const records = projectTaskRecords(domain);
    return { active: records.filter(task => task.status === 'active'), recruiting: records.filter(task => task.status === 'recruiting') };
}
function action(record, actionId) {
    return { taskId: record.taskId, actionId, expectedTaskRevision: record.taskRevision, expectedEventId: record.eventId };
}

test('a user-published task stays in My published after assignment, then remains accessible in history', () => {
    const env = environment();
    let result = publishTask(createEmptyTaskDomain(), {
        taskId: 'mine', actionId: 'publish', playerDisplayName: '林白',
        form: { title: '找回手札', objective: '找回旧书店的蓝色手札', location: '旧书店', risk: '', reward: 50 },
    }, env);
    assert.deepEqual(taskLanes(view(result.domain)).published.map(task => task.taskId), ['mine']);
    assert.equal(taskIssuer(result.record), '林白（你）');

    result = replaceTaskCandidates(result.domain, {
        ...action(result.record, 'recruit'),
        candidates: [{ candidateId: 'ella', name: '艾拉', description: '信使', pitch: '我来找', capability: '熟悉街巷', risk: '绕路' }],
    }, env);
    result = assignTaskCandidate(result.domain, { ...action(result.record, 'assign'), candidateId: 'ella' }, env);
    const original = view(result.domain);
    const snapshot = structuredClone(original);
    const lanes = taskLanes(original);
    assert.deepEqual(lanes.received, []);
    assert.equal(lanes.published.length, 1);
    assert.equal(lanes.published[0].assignee.displayName, '艾拉');
    assert.deepEqual(original, snapshot);

    result = completeTask(result.domain, { ...action(result.record, 'finish'), resultSummary: '手札已归还' }, env);
    assert.deepEqual(taskLanes(view(result.domain)).published, []);
    assert.equal(presentTaskHistory(projectTaskRecords(result.domain)).items[0].taskId, 'mine');
});

test('terminal-issued tasks belong only to My accepted; a target NPC is not the issuer', () => {
    const env = environment();
    const domain = replaceTaskBoard(createEmptyTaskDomain(), {
        expectedBoardId: null, boardId: 'board', generatedAt: 1,
        listings: [{ listingId: 'letter', grade: 'C', tags: ['接触'], posture: '易介入', title: '钟楼的信', hook: '守卫在等一封信', objective: '把信交给钟楼守卫', location: '钟楼', timing: '任意时候', risk: '盘问', reward: 60 }],
    }).domain;
    const result = acceptTaskListing(domain, {
        taskId: 'accepted', actionId: 'accept', boardId: 'board', listingId: 'letter', playerDisplayName: '林白',
    }, env);
    const lanes = taskLanes(view(result.domain));
    assert.deepEqual(lanes.published, []);
    assert.equal(lanes.received[0].assignee.displayName, '林白');
    assert.equal(taskIssuer(lanes.received[0]), '任务终端');
});
