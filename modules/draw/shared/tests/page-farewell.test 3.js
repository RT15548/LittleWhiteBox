import assert from 'node:assert/strict';
import test from 'node:test';

import {
    consumePageFarewell,
    PAGE_FAREWELL_MAX_AGE_MS,
    persistTrackedPageFarewells,
    readPageFarewells,
    trackPageDrawRun,
    trackPageJobLease,
    untrackPageDrawRun,
    untrackPageJobLease,
} from '../page-farewell.js';

function createStorage() {
    const values = new Map();
    return {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, String(value)),
        removeItem: key => values.delete(key),
    };
}

test('page farewells persist exact live ownership and disappear after consumption or expiry', () => {
    const storage = createStorage();
    const now = 100_000;
    const jobId = 'job-farewell-lifecycle';
    const leaseId = 'lease-farewell-lifecycle';
    const runId = 'run-farewell-lifecycle';

    assert.equal(trackPageJobLease(jobId, leaseId), true);
    assert.equal(trackPageDrawRun(runId), true);
    assert.equal(persistTrackedPageFarewells({ storage, now }), true);

    const persisted = readPageFarewells({ storage, now });
    assert.deepEqual(persisted, [
        { kind: 'job', id: jobId, leaseId, at: now },
        { kind: 'run', id: runId, at: now },
    ]);
    assert.equal(consumePageFarewell(persisted[0], { storage }), true);
    assert.deepEqual(readPageFarewells({ storage, now }), [persisted[1]]);
    assert.deepEqual(readPageFarewells({ storage, now: now + PAGE_FAREWELL_MAX_AGE_MS }), []);

    untrackPageJobLease(jobId, leaseId);
    untrackPageDrawRun(runId);
});
