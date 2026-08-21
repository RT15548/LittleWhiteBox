import assert from 'node:assert/strict';
import test from 'node:test';

import { createSessionLeaseRegistry } from '../vector/runtime/session-lease-registry.js';

function createFakeScheduler() {
    let nextId = 1;
    const scheduled = new Map();
    return {
        schedule(callback, delay) {
            const id = nextId++;
            scheduled.set(id, { callback, delay });
            return id;
        },
        cancel(id) {
            scheduled.delete(id);
        },
        run(id) {
            const task = scheduled.get(id);
            scheduled.delete(id);
            task?.callback();
        },
        entries() {
            return [...scheduled.entries()];
        },
    };
}

test('an expired lease releases the final session for its chat', () => {
    const scheduler = createFakeScheduler();
    const expired = [];
    const registry = createSessionLeaseRegistry({
        ttlMs: 120000,
        now: () => 1000,
        schedule: scheduler.schedule,
        cancel: scheduler.cancel,
        onExpire: item => expired.push(item),
    });

    const lease = registry.add('chat-1', 'lease-1');
    const [[timerId, task]] = scheduler.entries();

    assert.equal(lease.expiresAt, 121000);
    assert.equal(task.delay, 120000);
    assert.equal(registry.count('chat-1'), 1);

    scheduler.run(timerId);

    assert.equal(registry.hasChat('chat-1'), false);
    assert.deepEqual(expired.map(item => ({
        chatId: item.chatId,
        leaseId: item.leaseId,
        activeSessions: item.activeSessions,
    })), [{ chatId: 'chat-1', leaseId: 'lease-1', activeSessions: 0 }]);
});

test('explicit release cancels expiration and preserves sibling leases', () => {
    const scheduler = createFakeScheduler();
    const expired = [];
    const registry = createSessionLeaseRegistry({
        ttlMs: 120000,
        schedule: scheduler.schedule,
        cancel: scheduler.cancel,
        onExpire: item => expired.push(item),
    });

    registry.add('chat-1', 'lease-1');
    registry.add('chat-1', 'lease-2');
    const released = registry.release('chat-1', 'lease-1');
    const [[timerId]] = scheduler.entries();

    assert.equal(released.activeSessions, 1);
    assert.equal(registry.hasLease('chat-1', 'lease-2'), true);

    scheduler.run(timerId);

    assert.equal(registry.hasChat('chat-1'), false);
    assert.equal(expired.length, 1);
    assert.equal(expired[0].leaseId, 'lease-2');
});

test('clearing the registry cancels all pending lease timers', () => {
    const scheduler = createFakeScheduler();
    const registry = createSessionLeaseRegistry({
        schedule: scheduler.schedule,
        cancel: scheduler.cancel,
    });

    registry.add('chat-1', 'lease-1');
    registry.add('chat-2', 'lease-2');
    registry.clear();

    assert.deepEqual(scheduler.entries(), []);
    assert.equal(registry.hasChat('chat-1'), false);
    assert.equal(registry.hasChat('chat-2'), false);
});
