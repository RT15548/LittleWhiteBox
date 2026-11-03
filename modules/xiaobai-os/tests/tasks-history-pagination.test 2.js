import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeTaskHistoryPage } from '../apps/tasks/ui/history-pagination.js';

const task = taskId => ({ taskId });

test('a Tasks history page appends only to the state version and cursor that requested it', () => {
    const current = {
        items: [task('task-1')],
        nextCursor: 'cursor-1',
        hasMore: true,
    };
    const incoming = {
        items: [task('task-1'), task('task-2')],
        nextCursor: null,
        hasMore: false,
    };
    const boundary = { cursor: 'cursor-1', stateVersion: 4 };

    assert.deepEqual(mergeTaskHistoryPage(current, incoming, boundary, 4), {
        items: [task('task-1'), task('task-2')],
        nextCursor: null,
        hasMore: false,
    });
    assert.equal(mergeTaskHistoryPage(current, incoming, boundary, 5), null);
    assert.equal(mergeTaskHistoryPage({ ...current, nextCursor: 'cursor-2' }, incoming, boundary, 4), null);
});
