import assert from 'node:assert/strict';
import test from 'node:test';
import { rebaseGeneratedEvents } from '../generate/rebase-events.js';

// Acceptance: generated IDs and causal references bind to the published event
// list without changing either input. Cost: links to the wrong story event.
test('reassigns generated ids from the latest event list', () => {
    assert.deepEqual(rebaseGeneratedEvents([
        { id: 'evt-3', causedBy: ['evt-2'] },
        { id: 'evt-4', causedBy: ['evt-3'] },
    ], [{ id: 'evt-1' }, { id: 'evt-2' }, { id: 'evt-9' }], []), [
        { id: 'evt-10', causedBy: ['evt-2'] },
        { id: 'evt-11', causedBy: ['evt-10'] },
    ]);
});

test('redirects a cause from a merged-away event to its retained event', () => {
    assert.deepEqual(rebaseGeneratedEvents([
        { id: 'evt-3', causedBy: ['evt-2', 'evt-1'] },
    ], [{ id: 'evt-1' }, { id: 'evt-3' }], [{
        kind: 'merge', key: 'evt-1', changes: [
            { collection: 'events', key: 'evt-2', before: { id: 'evt-2' }, after: null, retired: false },
        ],
    }]), [{ id: 'evt-4', causedBy: ['evt-1'] }]);
});
