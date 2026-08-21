import test from 'node:test';
import assert from 'node:assert/strict';

import {
    VECTOR_WRITE_SCOPES,
    cancelEmbeddingWriteTasks,
    cancelVectorWriteOperation,
    captureMaintenanceSnapshot,
    claimWarningCooldown,
    clearWarningCooldowns,
    clearWarningCooldownsForChat,
    getVectorWriteState,
    invalidateMaintenanceEpoch,
    isMaintenanceSnapshotCurrent,
    isVectorWriteSessionCurrent,
    resumeVectorWriteCoordinator,
    runVectorConfigTransition,
    runVectorWriteTask,
    shutdownVectorWriteCoordinator,
} from '../vector/runtime/maintenance-coordinator.js';

const { EMBEDDING, CONSISTENCY, IO } = VECTOR_WRITE_SCOPES;

/** 排到队首并挂起，直到自身 signal 被中止。 */
function blockUntilAborted(order, label, options) {
    return runVectorWriteTask(options, async (session) => {
        order.push(`${label}:start`);
        await new Promise(resolve => session.signal.addEventListener('abort', resolve, { once: true }));
        order.push(`${label}:aborted`);
    });
}

test('a write task without a declared scope is rejected', () => {
    assert.throws(
        () => runVectorWriteTask({ chatId: 'chat-a', kind: 'unscoped' }, async () => {}),
        TypeError,
    );
});

test('vector write tasks run serially and make integrity snapshots unavailable', async () => {
    const order = [];
    let releaseFirst;
    const firstGate = new Promise(resolve => {
        releaseFirst = resolve;
    });

    const first = runVectorWriteTask({ chatId: 'chat-a', kind: 'first', scope: EMBEDDING }, async () => {
        order.push('first:start');
        await firstGate;
        order.push('first:end');
    });
    const second = runVectorWriteTask({ chatId: 'chat-a', kind: 'second', scope: EMBEDDING }, async () => {
        order.push('second:start');
    });

    await Promise.resolve();
    assert.deepEqual(order, ['first:start']);
    assert.equal(captureMaintenanceSnapshot('chat-a'), null);
    assert.equal(getVectorWriteState().activeWrite?.kind, 'first');
    assert.equal(getVectorWriteState().pendingWrites, 1);

    releaseFirst();
    await Promise.all([first, second]);
    assert.deepEqual(order, ['first:start', 'first:end', 'second:start']);
});

test('maintenance snapshots become stale when a write is scheduled', async () => {
    const snapshot = captureMaintenanceSnapshot('chat-a');
    assert.ok(snapshot);

    const write = runVectorWriteTask({ chatId: 'chat-a', kind: 'mutation', scope: EMBEDDING }, async () => {});
    assert.equal(isMaintenanceSnapshotCurrent(snapshot), false);
    await write;

    const nextSnapshot = captureMaintenanceSnapshot('chat-a');
    invalidateMaintenanceEpoch();
    assert.equal(isMaintenanceSnapshotCurrent(nextSnapshot), false);
});

test('a config transition cancels embedding work but lets consistency and io work finish first', async () => {
    const order = [];
    let activeSession;
    const active = runVectorWriteTask({ chatId: 'chat-a', kind: 'active-embedding', scope: EMBEDDING }, async (session) => {
        activeSession = session;
        order.push('embedding:start');
        await new Promise(resolve => session.signal.addEventListener('abort', resolve, { once: true }));
        order.push('embedding:aborted');
    });
    const queuedEmbedding = runVectorWriteTask(
        { chatId: 'chat-a', kind: 'queued-embedding', scope: EMBEDDING },
        async () => order.push('queued-embedding:ran'),
    );
    const queuedConsistency = runVectorWriteTask(
        { chatId: 'chat-a', kind: 'queued-consistency', scope: CONSISTENCY },
        async () => order.push('consistency:ran'),
    );
    const queuedIo = runVectorWriteTask(
        { chatId: 'chat-a', kind: 'queued-io', scope: IO },
        async () => order.push('io:ran'),
    );

    await Promise.resolve();
    const transition = runVectorConfigTransition(
        { chatId: 'chat-a', reason: 'test config change' },
        async (session) => {
            assert.equal(isVectorWriteSessionCurrent(session), true);
            order.push('transition');
        },
    );

    assert.equal(activeSession.signal.aborted, true);
    assert.equal(isVectorWriteSessionCurrent(activeSession), false);
    await Promise.all([active, queuedEmbedding, queuedConsistency, queuedIo, transition]);
    assert.deepEqual(order, [
        'embedding:start',
        'embedding:aborted',
        'consistency:ran',
        'io:ran',
        'transition',
    ]);
});

test('cancelling one operation leaves every other queued task alone', async () => {
    const order = [];
    const cancelled = blockUntilAborted(order, 'op-a', {
        chatId: 'chat-a',
        kind: 'cancelled-generation',
        scope: EMBEDDING,
        operationId: 'op-a',
    });
    const survivor = runVectorWriteTask(
        { chatId: 'chat-a', kind: 'other-generation', scope: EMBEDDING, operationId: 'op-b' },
        async () => order.push('op-b:ran'),
    );

    await Promise.resolve();
    assert.equal(cancelVectorWriteOperation('op-a', 'user cancelled'), true);
    assert.equal(cancelVectorWriteOperation('op-missing'), false);

    await Promise.all([cancelled, survivor]);
    assert.deepEqual(order, ['op-a:start', 'op-a:aborted', 'op-b:ran']);
});

test('cancelling embedding work spares consistency and io tasks', async () => {
    const order = [];
    const embedding = blockUntilAborted(order, 'embedding', {
        chatId: 'chat-a',
        kind: 'active-embedding',
        scope: EMBEDDING,
    });
    const consistency = runVectorWriteTask(
        { chatId: 'chat-a', kind: 'delete-sync', scope: CONSISTENCY },
        async () => order.push('consistency:ran'),
    );
    const io = runVectorWriteTask(
        { chatId: 'chat-a', kind: 'summary-import', scope: IO },
        async () => order.push('io:ran'),
    );

    await Promise.resolve();
    cancelEmbeddingWriteTasks('chat changed');

    await Promise.all([embedding, consistency, io]);
    assert.deepEqual(order, ['embedding:start', 'embedding:aborted', 'consistency:ran', 'io:ran']);
});

test('shutdown invalidates every scope, drains the writer, and requires an explicit resume', async () => {
    const order = [];
    const active = blockUntilAborted(order, 'consistency', { kind: 'shutdown-active', scope: CONSISTENCY });
    const queuedIo = runVectorWriteTask({ kind: 'shutdown-io', scope: IO }, async () => order.push('io:ran'));
    await Promise.resolve();

    await shutdownVectorWriteCoordinator('test shutdown');
    await Promise.all([active, queuedIo]);
    assert.equal(getVectorWriteState().acceptingWrites, false);
    await runVectorWriteTask({ kind: 'rejected', scope: IO }, async () => order.push('rejected'));
    assert.deepEqual(order, ['consistency:start', 'consistency:aborted']);

    resumeVectorWriteCoordinator();
    await runVectorWriteTask({ kind: 'resumed', scope: IO }, async () => order.push('resumed'));
    assert.deepEqual(order, ['consistency:start', 'consistency:aborted', 'resumed']);
});

test('warning cooldown is isolated by chat and issue code', () => {
    clearWarningCooldowns('integrity-test');

    assert.equal(claimWarningCooldown('integrity-test', 'chat-a', 'l1_gap', 1000, 100), true);
    assert.equal(claimWarningCooldown('integrity-test', 'chat-a', 'l1_gap', 1000, 200), false);
    assert.equal(claimWarningCooldown('integrity-test', 'chat-a', 'fingerprint_mismatch', 1000, 200), true);
    assert.equal(claimWarningCooldown('integrity-test', 'chat-b', 'l1_gap', 1000, 200), true);
    assert.equal(claimWarningCooldown('integrity-test', 'chat-a', 'l1_gap', 1000, 1100), true);
});

test('chat cleanup removes only that chat warning cooldowns', () => {
    clearWarningCooldowns('cleanup-test');
    assert.equal(claimWarningCooldown('cleanup-test', 'chat-a', 'l1_gap', 1000, 100), true);
    assert.equal(claimWarningCooldown('cleanup-test', 'chat-b', 'l1_gap', 1000, 100), true);

    clearWarningCooldownsForChat('chat-a');

    assert.equal(claimWarningCooldown('cleanup-test', 'chat-a', 'l1_gap', 1000, 200), true);
    assert.equal(claimWarningCooldown('cleanup-test', 'chat-b', 'l1_gap', 1000, 200), false);
});
