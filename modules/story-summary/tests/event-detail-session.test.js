import assert from 'node:assert/strict';
import test from 'node:test';

import {
    releaseEventDetailRuntimeLease,
    transferEventDetailRuntimeLease,
} from '../vector/retrieval/event-detail-session.js';

test('standalone recall keeps ownership of its runtime lease', () => {
    const context = {};
    const lease = { leaseId: 'lease-1' };

    assert.equal(transferEventDetailRuntimeLease(context, lease, false), lease);
    assert.equal(context.runtimeLease, undefined);
});

test('prompt recall transfers one lease and releases it exactly once', async () => {
    const context = {};
    const lease = { leaseId: 'lease-1' };
    const released = [];

    assert.equal(transferEventDetailRuntimeLease(context, lease, true), null);
    assert.equal(context.runtimeLease, lease);
    assert.equal(await releaseEventDetailRuntimeLease(context, async item => released.push(item)), true);
    assert.equal(await releaseEventDetailRuntimeLease(context, async item => released.push(item)), false);
    assert.deepEqual(released, [lease]);
});

test('a failed release clears ownership before propagating', async () => {
    const context = { runtimeLease: { leaseId: 'lease-1' } };

    await assert.rejects(
        releaseEventDetailRuntimeLease(context, async () => {
            throw new Error('release failed');
        }),
        /release failed/,
    );
    assert.equal(context.runtimeLease, null);
    assert.equal(await releaseEventDetailRuntimeLease(context, async () => {}), false);
});
