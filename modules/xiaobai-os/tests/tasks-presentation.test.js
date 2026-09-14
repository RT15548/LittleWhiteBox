import assert from 'node:assert/strict';
import test from 'node:test';

import {
    presentTaskDetail,
    presentTaskHistory,
    presentTasksState,
} from '../apps/tasks/host/presentation.js';

function record(taskId, status, updatedAt, overrides = {}) {
    return {
        taskId,
        taskRevision: 1,
        eventId: `event-${taskId}`,
        source: 'accepted',
        status,
        issuer: { kind: 'world', partyId: `issuer-${taskId}`, displayName: 'Terminal' },
        assignee: { kind: 'player', displayName: 'Player' },
        reward: 10,
        grade: 'C',
        tags: [],
        title: taskId,
        objective: 'Objective',
        requirements: '',
        location: 'Gate',
        timing: '',
        risk: 'Low',
        candidates: [],
        progressSummary: '',
        resultSummary: status === 'completed' ? 'Done' : '',
        createdAt: 1,
        updatedAt,
        lastObservedAssistantCount: 0,
        ...overrides,
    };
}

test('state projection marks accepted board entries and sorts visible task groups', () => {
    const accepted = record('accepted', 'active', 4, { sourceBoardId: 'board-1', sourceListingId: 'listing-1' });
    const view = {
        domain: {
            board: {
                boardId: 'board-1',
                generatedAt: 1,
                listings: [{ listingId: 'listing-1', title: 'Taken' }, { listingId: 'listing-2', title: 'Open' }],
            },
            events: [],
        },
        records: [record('older', 'active', 2), accepted, record('recruiting', 'recruiting', 3)],
        playerBalance: 90,
        writeState: 'ready',
    };
    const state = presentTasksState({
        chatIdentity: 'character:1:chat-a',
        serviceView: view,
        settings: { autoMaintenance: false },
        economyReady: true,
        generationActive: false,
        generation: { state: 'idle', kind: null, taskId: null, message: '' },
        maintenanceStatus: { state: 'idle', mode: 'manual', message: 'skipped', reason: 'no-work', lastRunAt: null },
    });

    assert.deepEqual(state.board.listings.map(item => item.accepted), [true, false]);
    assert.deepEqual(state.active.map(item => item.taskId), ['accepted', 'older']);
    assert.deepEqual(state.recruiting.map(item => item.taskId), ['recruiting']);
});

test('history uses stable cursors and rejects stale or malformed boundaries', () => {
    const records = [record('first', 'completed', 3), record('second', 'failed', 2), record('active', 'active', 4)];
    const first = presentTaskHistory(records, null, 1);
    const second = presentTaskHistory(records, first.nextCursor, 1);

    assert.deepEqual(first.items.map(item => item.taskId), ['first']);
    assert.equal(first.hasMore, true);
    assert.deepEqual(second.items.map(item => item.taskId), ['second']);
    assert.equal(second.hasMore, false);
    assert.throws(() => presentTaskHistory(records, 'bad'), /tasks_history_cursor_invalid/);
    assert.throws(() => presentTaskHistory(records, '1:missing'), /tasks_history_cursor_invalid/);
});

test('detail timeline exposes ordered public summaries without mutating service data', () => {
    const task = record('task-1', 'active', 2);
    const event = {
        eventId: 'event-1',
        actionId: 'action-1',
        taskId: 'task-1',
        taskRevision: 1,
        kind: 'progressed',
        progressSummary: 'Reached the gate',
        createdAt: 2,
    };
    const view = { domain: { events: [event] }, records: [task], playerBalance: 0, writeState: 'ready' };
    const detail = presentTaskDetail(view, 'task-1');

    assert.deepEqual(detail.timeline, [{
        eventId: 'event-1',
        kind: 'progressed',
        taskRevision: 1,
        createdAt: 2,
        summary: 'Reached the gate',
    }]);
    detail.task.title = 'Changed';
    assert.equal(task.title, 'task-1');
});
