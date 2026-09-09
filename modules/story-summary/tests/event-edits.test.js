import assert from 'node:assert/strict';
import test from 'node:test';

import { projectEditedSummaryEvents } from '../data/events.js';

test('deleting a cause before reusing its ID does not attach the old causal reference to the new event', () => {
    const original = [
        { id: 'evt-1', title: 'Retained cause', memoryRole: '具体经历', causedBy: [], _addedAt: 9 },
        { id: 'evt-2', title: 'A', memoryRole: '状态变化', causedBy: ['evt-1', 'evt-3'], _addedAt: 19 },
        { id: 'evt-3', title: 'B', memoryRole: '约定承诺', causedBy: [], _addedAt: 19 },
    ];
    const snapshot = structuredClone(original);

    const saved = projectEditedSummaryEvents(original.filter(event => event.id !== 'evt-3'));
    assert.deepEqual(saved[1], { ...original[1], causedBy: ['evt-1'] });
    assert.deepEqual(original, snapshot, 'saving must not mutate the previous collection');

    const reopened = structuredClone(saved);
    const added = { id: 'evt-3', title: 'C', memoryRole: '具体经历', causedBy: [] };

    const resaved = projectEditedSummaryEvents([...reopened, added]);
    const eventIndex = new Map(resaved.map(event => [event.id, event]));
    assert.deepEqual(eventIndex.get('evt-2').causedBy.map(id => eventIndex.get(id).title), ['Retained cause']);
    assert.deepEqual(projectEditedSummaryEvents(resaved), resaved);
    assert.deepEqual(projectEditedSummaryEvents([]), []);
});
