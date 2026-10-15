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
    runVectorGenerationTask,
    shutdownVectorWriteCoordinator,
} from '../vector/runtime/maintenance-coordinator.js';

const { EMBEDDING, CONSISTENCY, IO } = VECTOR_WRITE_SCOPES;

test('model waits leave the writer free, while resulting commits still serialize', async () => {
    const order = [];
    let releaseModel, releaseWrite, started;
    const modelGate = new Promise(resolve => { releaseModel = resolve; });
    const writeGate = new Promise(resolve => { releaseWrite = resolve; });
    const modelStarted = new Promise(resolve => { started = resolve; });
    const generation = runVectorGenerationTask({}, async session => {
        started();
        await modelGate;
        await session.commit(() => { order.push('generated-data'); });
    });
    await modelStarted;
    const local = runVectorWriteTask({ scope: IO }, async () => {
        order.push('local-start');
        await writeGate;
        order.push('local-end');
    });
    await Promise.resolve();
    assert.deepEqual(order, ['local-start']);
    releaseModel();
    await Promise.resolve();
    assert.deepEqual(order, ['local-start']);
    releaseWrite();
    await Promise.all([generation, local]);
    assert.deepEqual(order, ['local-start', 'local-end', 'generated-data']);
});

test('cancelled network results cannot refill data after a destructive write', async () => {
    let release, started, writes = 0;
    const model = new Promise(resolve => { release = resolve; });
    const ready = new Promise(resolve => { started = resolve; });
    const generation = assert.rejects(runVectorGenerationTask({}, async session => {
        started();
        await model; // A provider may deliver a late response even after abort.
        await session.commit(() => { writes++; });
    }), { name: 'AbortError' });
    await ready;
    await runVectorWriteTask({ scope: IO }, () => cancelEmbeddingWriteTasks('data replaced'));
    release();
    await generation;
    assert.equal(writes, 0);
});

test('generation reads its inputs after an earlier local replacement finishes', async () => {
    let release, requests = 0;
    const gate = new Promise(resolve => { release = resolve; });
    const replacement = runVectorWriteTask({ scope: IO }, () => gate);
    const generation = runVectorGenerationTask({}, () => { requests++; });
    await Promise.resolve();
    assert.equal(requests, 0);
    release();
    await Promise.all([replacement, generation]);
    assert.equal(requests, 1);
});

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

test('readiness stays outside the writer; stopping generation still lets source consistency finish', async () => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const completed = [];
    const ready = runVectorWriteTask({ scope: CONSISTENCY }, async () => {
        await gate;
        completed.push('source-committed');
    });
    const generation = runVectorWriteTask({ scope: EMBEDDING, operationId: 'preparing', ready }, () => completed.push('model'));
    const io = runVectorWriteTask({ scope: IO }, () => completed.push('io'));
    assert.equal(cancelVectorWriteOperation('preparing'), true);
    release();
    await Promise.all([ready, generation, io]);
    assert.deepEqual(completed, ['source-committed', 'io']);
    assert.equal(cancelVectorWriteOperation('preparing'), false);
});

test('a failed prerequisite releases its operation and never starts generation', async () => {
    let requests = 0;
    await assert.rejects(runVectorWriteTask({ scope: EMBEDDING, operationId: 'preparing',
        ready: Promise.reject(Object.assign(new Error('source save failed'), { code: 'source_failure' })) }, () => { requests++; }), { code: 'source_failure' });
    assert.equal(requests, 0);
    assert.equal(cancelVectorWriteOperation('preparing'), false);
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
