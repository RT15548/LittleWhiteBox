import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { reserveCardLifecycle } from './lifecycle-lane.js';

// Same-card operations must retain their registration order; unrelated cards
// remain usable. Rejection/cancellation must release ownership (lost data).
test('overlapping card lanes run in order without blocking another card', async () => {
    const entered = Promise.withResolvers(), release = Promise.withResolvers(), order = [];
    const first = reserveCardLifecycle(['A', 'B']);
    const second = reserveCardLifecycle(['B']);
    const third = reserveCardLifecycle(['B', 'C']);
    const unrelated = reserveCardLifecycle(['X']);
    const running = first.run(async () => { order.push('first'); entered.resolve(); await release.promise; });
    const next = second.run(() => order.push('second'));
    const last = third.run(() => order.push('third'));
    await entered.promise;
    try {
        await unrelated.run(() => order.push('unrelated'));
        assert.deepEqual(order, ['first', 'unrelated']);
    } finally { release.resolve(); }
    await Promise.all([running, next, last]);
    assert.deepEqual(order, ['first', 'unrelated', 'second', 'third']);
});

test('failed and cancelled reservations release the next writer', async () => {
    const first = reserveCardLifecycle(['failure']);
    const cancelled = reserveCardLifecycle(['failure']);
    const next = reserveCardLifecycle(['failure']);
    cancelled.cancel();
    await assert.rejects(first.run(() => { throw new Error('upload failed'); }));
    assert.equal(await next.run(() => 'saved'), 'saved');
});
