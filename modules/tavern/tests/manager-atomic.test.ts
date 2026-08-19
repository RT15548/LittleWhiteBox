import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    createTavernManagerRun,
    createTavernSession,
    getTavernManagerRun,
    getTavernStructuredStateDocument,
    listTavernManagerStateSnapshots,
    rollbackManagerRunWrites,
    tavernStateDocumentsTable,
    touchRunningTavernManagerRun,
    transitionTavernManagerRun,
} from '../shared/session-db';
import { executeTavernMemoryTool } from '../shared/memory-files';
import { executeTavernStateTool, TAVERN_STATE_TOOL_NAMES } from '../shared/structured-state';
import { executeTavernStatusTool, TAVERN_STATUS_TOOL_NAMES } from '../shared/status-state';

test('automatic manager rollback restores memory and map from one snapshot boundary', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'atomic manager rollback' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'accepted_turn',
        status: 'running',
        leaseOwnerId: 'worker-a',
        leaseExpiresAt: Date.now() + 30000,
    });

    assert.equal((await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: '# 临时维护',
    }, { managerRunId: run.id, caller: 'auto' })).ok, true);
    assert.equal((await executeTavernStateTool(session.id, TAVERN_STATE_TOOL_NAMES.PATCH, {
        docType: 'tavern.map',
        docId: 'main',
        ops: [{ op: 'add', element: { id: 'temporary-marker', at: [10, 10], cat: 'marker', rect: [20, 20] } }],
    }, { managerRunId: run.id, caller: 'auto' })).ok, true);
    assert.equal((await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: {
            meta: { activeSubject: 'user' },
            subjects: [{
                id: 'user',
                name: '用户',
                tabs: [{
                    id: 'overview',
                    label: '概览',
                    blocks: [{
                        id: 'stats',
                        title: '属性',
                        form: 'gauge',
                        fields: [{ id: 'san', name: '理智', value: 50, max: 100 }],
                    }],
                }],
            }],
        },
    }, { managerRunId: run.id, caller: 'auto' })).ok, true);

    const rolledBack = await rollbackManagerRunWrites(run.id, {
        expectedStatus: 'running',
        expectedLeaseOwnerId: 'worker-a',
        finalStatus: 'failed',
        finalError: 'test_failure',
    });
    assert.equal(rolledBack.conflicts.length, 0);
    assert.equal((await getTavernManagerRun(run.id))?.status, 'failed');
    assert.equal((await getTavernManagerRun(run.id))?.leaseOwnerId, '');
    const mapData = (await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main'))?.data as {
        elements?: Array<{ id?: string }>;
    } | undefined;
    assert.doesNotMatch(mapData?.elements?.map((item) => item.id).join(',') || '', /temporary-marker/);
    assert.equal(await getTavernStructuredStateDocument(session.id, 'tavern.status', 'main'), null);
    const snapshots = await listTavernManagerStateSnapshots(run.id);
    assert.ok(snapshots.length > 0);
    assert.ok(snapshots.every((snapshot) => snapshot.rollbackStatus === 'rolled_back'));
});

test('a stale manager owner cannot heartbeat, complete, or rollback a newer lease', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'manager owner CAS' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'accepted_turn',
        status: 'running',
        leaseOwnerId: 'worker-new',
        leaseExpiresAt: Date.now() + 30000,
    });
    const before = await getTavernManagerRun(run.id);
    const heartbeat = await touchRunningTavernManagerRun(run.id, { leaseOwnerId: 'worker-old' });
    assert.equal(heartbeat?.leaseOwnerId, 'worker-new');
    assert.equal(heartbeat?.leaseExpiresAt, before?.leaseExpiresAt);
    await assert.rejects(
        transitionTavernManagerRun(run.id, { status: 'completed' }, {
            expectedStatus: 'running',
            expectedLeaseOwnerId: 'worker-old',
            requireUnexpiredLease: true,
        }),
        /manager_lease_lost/,
    );
    await assert.rejects(
        rollbackManagerRunWrites(run.id, {
            expectedStatus: 'running',
            expectedLeaseOwnerId: 'worker-old',
            finalStatus: 'failed',
        }),
        /manager_lease_lost/,
    );
    assert.equal((await getTavernManagerRun(run.id))?.status, 'running');
});

test('an expired manager owner cannot transition or rollback its old run', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'expired manager owner' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'accepted_turn',
        status: 'running',
        leaseOwnerId: 'worker-expired',
        leaseExpiresAt: Date.now() - 1,
    });

    await assert.rejects(
        transitionTavernManagerRun(run.id, { status: 'failed' }, {
            expectedStatus: 'running',
            expectedLeaseOwnerId: 'worker-expired',
        }),
        /manager_lease_lost/,
    );
    await assert.rejects(
        rollbackManagerRunWrites(run.id, {
            expectedStatus: 'running',
            expectedLeaseOwnerId: 'worker-expired',
            finalStatus: 'failed',
        }),
        /manager_lease_lost/,
    );
    const current = await getTavernManagerRun(run.id);
    assert.equal(current?.status, 'running');
    assert.equal(current?.leaseOwnerId, 'worker-expired');
});

test('a rollback conflict keeps its state snapshot as the recovery fact', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'rollback conflict snapshot' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'accepted_turn',
        status: 'running',
        leaseOwnerId: 'worker-conflict',
        leaseExpiresAt: Date.now() + 30000,
    });
    const autoWrite = await executeTavernStateTool(session.id, TAVERN_STATE_TOOL_NAMES.PATCH, {
        docType: 'tavern.map',
        docId: 'main',
        ops: [{ op: 'add', element: { id: 'manager-marker', at: [1, 1], cat: 'marker', rect: [10, 10] } }],
    }, { managerRunId: run.id, caller: 'auto' });
    assert.equal(autoWrite.ok, true);
    const userWrite = await executeTavernStateTool(session.id, TAVERN_STATE_TOOL_NAMES.PATCH, {
        docType: 'tavern.map',
        docId: 'main',
        ops: [{ op: 'add', element: { id: 'user-marker', at: [2, 2], cat: 'marker', rect: [10, 10] } }],
    }, { caller: 'chat' });
    assert.equal(userWrite.ok, true);

    const rollback = await rollbackManagerRunWrites(run.id, {
        expectedStatus: 'running',
        expectedLeaseOwnerId: 'worker-conflict',
        finalStatus: 'failed',
        finalError: 'test_conflict',
    });
    assert.deepEqual(rollback.conflicts, ['state/tavern.map/main']);
    const snapshots = await listTavernManagerStateSnapshots(run.id);
    assert.equal(snapshots.length, 1);
    assert.equal(snapshots[0]?.rollbackStatus, 'conflict');
    assert.equal((await getTavernManagerRun(run.id))?.leaseOwnerId, '');
});

test('a terminal manager transition always releases its lease', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'terminal manager lease release' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'accepted_turn',
        status: 'running',
        leaseOwnerId: 'worker-cancel',
        leaseExpiresAt: Date.now() + 30000,
    });

    const cancelled = await transitionTavernManagerRun(run.id, {
        status: 'cancelled',
        error: 'test_cancelled',
    }, {
        expectedStatus: 'running',
        expectedLeaseOwnerId: 'worker-cancel',
    });
    assert.equal(cancelled?.status, 'cancelled');
    assert.equal(cancelled?.leaseOwnerId, '');
    assert.equal(cancelled?.leaseExpiresAt, 0);
});

test('manager atlas creation from a missing seed is fully reversible', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'atomic atlas seed rollback' });
    await tavernStateDocumentsTable.delete([session.id, 'tavern.atlas', 'main']);
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'accepted_turn',
        status: 'running',
        leaseOwnerId: 'worker-atlas',
        leaseExpiresAt: Date.now() + 30000,
    });

    const result = await executeTavernStateTool(session.id, TAVERN_STATE_TOOL_NAMES.PATCH, {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-location', key: 'office', set: { name: '办公室', scale: 'room', status: 'mentioned' } }],
    }, { managerRunId: run.id, caller: 'auto' });
    assert.equal(result.ok, true);
    assert.ok(await getTavernStructuredStateDocument(session.id, 'tavern.atlas', 'main'));

    const rollback = await rollbackManagerRunWrites(run.id, {
        expectedStatus: 'running',
        expectedLeaseOwnerId: 'worker-atlas',
        finalStatus: 'failed',
        finalError: 'test_failure',
    });
    assert.equal(rollback.conflicts.length, 0);
    assert.equal(rollback.rolledBack, 1);
    assert.equal(await getTavernStructuredStateDocument(session.id, 'tavern.atlas', 'main'), null);
});
