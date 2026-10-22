import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { maintenancePersistenceHarness, acceptFixtureTask } from './maintenance-persistence-harness.js';
import { createMapMaintenanceParticipant } from '../apps/map/host/maintenance-participant.js';
import { createWorldMaintenanceParticipant } from '../apps/world/host/maintenance-participant.js';
import { createTaskMaintenanceParticipant } from '../apps/tasks/host/maintenance-participant.js';
import { captureAutomaticAcceptedTurn, captureManualAcceptedTurn } from '../capabilities/maintenance/accepted-turn-source.js';
import { createChatReferencePort, readXiaobaiOsReference } from '../storage/chat-reference.js';
import { startSaveRecovery } from '../host/save-recovery.js';
import { MAP_PARTITION } from '../apps/map/partition.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { createTasksService } from '../apps/tasks/application/service.js';

// Acceptance contracts: automatic work must not write chat; host saves must
// preserve references; explicit saves must still work. Violations lose data or
// interfere with normal chat. File recovery must not repeat task payments.
function participant(h, id) {
    if (id === 'map') { return createMapMaintenanceParticipant({ map: h.map, readSettings: () => ({ autoMaintenance: true }) }); }
    if (id === 'world') { return createWorldMaintenanceParticipant(h.world, () => ({ subscribed: true })); }
    return createTaskMaintenanceParticipant({ tasks: h.tasks, readSettings: () => ({ autoMaintenance: true }), captureSurface: h.capture });
}

async function sessionFor(h, id, mode = 'automatic') {
    let source;
    if (mode === 'automatic') {
        if (h.state.messages.at(-1).is_user) { h.state.messages.push({ mes: `reply-${h.state.messages.length}`, is_user: false }); }
        h.state.messages.push({ mes: `next-${h.state.messages.length}`, is_user: true });
        source = captureAutomaticAcceptedTurn(h.capture(), h.state.messages.length - 1);
    } else {
        if (h.state.messages.at(-1).is_user) { h.state.messages.push({ mes: 'manual evidence', is_user: false }); }
        source = captureManualAcceptedTurn(h.capture(), { generationActive: false }).source;
    }
    assert.ok(source);
    const session = await participant(h, id).createSession(source, mode);
    assert.ok(session);
    return session;
}

function edit(session, id, version = 1) {
    return session.executeTool(id === 'map' ? 'MapAtlasEdit' : 'WorldEdit', id === 'map'
        ? { locations: [{ key: 'port', name: `港口-${version}`, scale: 'region' }] } : { overview: `世界-${version}` });
}

for (const id of ['map', 'world']) {
    test(`${id}: first and subsequent automatic writes leave chat to the host and survive its save`, async t => {
        const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
        for (const version of [1, 2]) {
            const session = await sessionFor(h, id); edit(session, id, version);
            await session.commit(() => true, { completed: true });
            assert.equal(h.state.chatSaves.length, 0);
            assert.equal(h.state.writes.length, version);
            assert.equal(h.coordinator.getFileState(), 'ready');
            assert.equal(h.coordinator.hasPendingCommit(), false);
        }
        const reference = readXiaobaiOsReference(h.state.current.metadata);
        assert.ok(reference);
        assert.equal(h.state.headers.size, 0);
        h.hostSave(); await h.reload();
        // Recreate the reference owner as on a page reload, rather than relying on its pending map.
        const reloadedReferences = createChatReferencePort(h.metadata);
        assert.deepEqual(reloadedReferences.capture().reference, reference);
        const value = await h[id].refreshCurrent();
        assert.equal(id === 'map' ? value.map.atlas.locations[0].name : value.world.overview, id === 'map' ? '港口-2' : '世界-2');
        assert.equal(h.state.chatSaves.length, 0);
    });

    for (const mode of ['manual', 'rebuild']) {
        test(`${id}: ${mode} persists a reference previously deferred by automatic work`, async t => {
            const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
            const automatic = await sessionFor(h, id); edit(automatic, id);
            await automatic.commit(() => true, { completed: true });
            const manual = await sessionFor(h, id, mode); edit(manual, id, 2);
            await manual.commit(() => true, { completed: true });
            assert.equal(h.state.chatSaves.length, 1);
            assert.deepEqual(readXiaobaiOsReference(h.state.headers.get('a')), h.references.capture().reference);
        });
    }
}

for (const pending of [false, true]) {
    for (const action of ['check', 'progress', 'complete']) {
        test(`tasks: automatic ${action}, reference ${pending ? 'deferred' : 'confirmed'}, writes only the user file`, async t => {
            const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
            const record = await acceptFixtureTask(h);
            if (pending) {
                const captured = h.references.capture();
                h.state.headers.set('a', {});
                assert.equal((await h.references.install({ ...captured, reference: null }, captured.reference,
                    { chatPersistence: 'host' })).status, 'deferred');
            }
            const before = h.state.chatSaves.length;
            const writes = h.user.state.writes.length;
            const session = await sessionFor(h, 'tasks');
            if (action !== 'check') {
                session.executeTool(action === 'complete' ? 'TaskComplete' : 'TaskProgress', {
                    taskId: record.taskId, revision: record.taskRevision,
                    ...(action === 'complete' ? { resultSummary: '守卫已收信' } : { progressSummary: '已到钟楼' }),
                });
            }
            await session.commit(() => true, { completed: true });
            assert.equal(h.state.chatSaves.length, before);
            assert.equal(h.user.state.writes.length, writes + 1);
            assert.equal(h.user.transactions.getFileState(), 'ready');
            assert.equal(h.tasks.readCurrent().records[0].status, action === 'complete' ? 'completed' : 'active');
            assert.equal(h.economy.getPlayerBalance(), action === 'complete' ? 250 : 100);
            h.hostSave(); await h.reload(); await h.tasks.refreshCurrent();
            assert.equal(h.tasks.readCurrent().records[0].status, action === 'complete' ? 'completed' : 'active');
            assert.equal(h.state.chatSaves.length, before);
        });
    }
}

for (const stage of ['file-not-saved', 'file-saved', 'reference']) {
    test(`background recovery of a manual ${stage} candidate never saves chat or rewrites confirmed files`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
        const stop = startSaveRecovery(h.coordinator); t.after(stop);
        h.state.fileMode = stage === 'reference' ? 'confirmed' : stage === 'file-saved' ? 'unknown-saved' : 'unknown';
        h.state.chatMode = 'unknown';
        const session = await sessionFor(h, 'map', 'manual'); edit(session, 'map');
        await assert.rejects(session.commit(() => true, { completed: true }), { uncertain: true });
        const before = h.state.chatSaves.length;
        const writes = h.state.writes.length;
        h.state.fileMode = 'confirmed'; h.state.chatMode = 'confirmed';
        t.mock.timers.tick(2_000); await setImmediate();
        assert.equal(h.coordinator.getFileState(), 'ready');
        assert.equal(h.state.chatSaves.length, before);
        assert.equal(h.state.writes.length, writes + (stage === 'file-not-saved' ? 1 : 0));
        assert.ok(h.references.capture().reference);
        t.mock.timers.tick(60_000); await setImmediate();
        assert.equal(h.state.chatSaves.length, before);
    });
}

test('manual task maintenance confirms a deferred reference and settles the reward once', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const record = await acceptFixtureTask(h);
    const capture = h.references.capture();
    h.state.headers.set('a', {});
    await h.references.install({ ...capture, reference: null }, capture.reference, { chatPersistence: 'host' });
    const before = h.state.chatSaves.length;
    const session = await sessionFor(h, 'tasks', 'manual');
    session.executeTool('TaskComplete', { taskId: record.taskId, revision: record.taskRevision, resultSummary: '守卫已收信' });
    await session.commit(() => true, { completed: true });
    assert.equal(h.state.chatSaves.length, before + 1);
    assert.equal(h.economy.getPlayerBalance(), 250);
    assert.deepEqual(readXiaobaiOsReference(h.state.headers.get('a')), capture.reference);
});

test('task background initialization and refresh cannot save a pending reference', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    await acceptFixtureTask(h);
    const capture = h.references.capture();
    h.state.headers.set('a', {});
    await h.references.install({ ...capture, reference: null }, capture.reference, { chatPersistence: 'host' });
    const before = h.state.chatSaves.length;
    await h.user.store(TASKS_PARTITION).transact(tx => {
        const domain = tx.currentOrInitial();
        for (const receipt of Object.values(domain.checks)) { receipt.phase = 'pending'; receipt.digest = ''; }
        tx.replace(domain);
    }, { chatPersistence: 'host' });
    const tasks = createTasksService(h.user.store(TASKS_PARTITION), h.user.transactions, h.economy, { getEvidenceDigest: () => 'new-baseline' });
    t.after(tasks.dispose);
    const writes = h.user.state.writes.length;
    await tasks.ensureReady();
    assert.equal(h.user.state.writes.length, writes + 1);
    await tasks.refreshCurrent();
    assert.equal(h.state.chatSaves.length, before);
});

test('read-only recovery of an acknowledged initial file cannot dispatch a chat save', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    h.state.fileMode = 'unknown-saved';
    const session = await sessionFor(h, 'map', 'manual'); edit(session, 'map');
    await assert.rejects(session.commit(() => true, { completed: true }), { uncertain: true });
    assert.equal((await h.coordinator.retryPending({ readOnly: true })).status, 'confirmed');
    assert.equal(h.state.chatSaves.length, 0);
    assert.equal(h.state.writes.length, 1);
});

test('map pre-maintenance refresh recovers a failed file without saving chat', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    h.state.fileMode = 'failed';
    const store = h.coordinator.createScopedStore(MAP_PARTITION);
    await store.transact(tx => tx.replace(tx.currentOrInitial()), { retainFailedCandidate: true });
    assert.equal(h.coordinator.getFileState(), 'failed');
    h.state.fileMode = 'confirmed';
    await sessionFor(h, 'map');
    assert.equal(h.coordinator.getFileState(), 'ready');
    assert.equal(h.state.chatSaves.length, 0);
});

test('ordinary file-only callers do not turn an automatically published reference into a chat save', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const session = await sessionFor(h, 'map'); edit(session, 'map');
    await session.commit(() => true, { completed: true });
    const store = h.coordinator.createScopedStore(MAP_PARTITION);
    const result = await store.transact(tx => {
        const map = tx.currentOrInitial();
        map.atlas.locations[0].name = '文件更新';
        tx.replace(map);
    });
    assert.equal(result.status, 'confirmed');
    assert.equal(h.state.chatSaves.length, 0);
    assert.equal(h.state.writes.length, 2);
});

test('branch lifecycle clones its own file and publishes a reference without saving chat', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const session = await sessionFor(h, 'map'); edit(session, 'map');
    await session.commit(() => true, { completed: true }); h.hostSave();
    const parent = h.references.capture().reference;
    h.state.current = { identityKey: 'branch', binding: { ...h.state.current.binding, chatId: 'branch' }, metadata: {}, mainChatId: 'a' };
    h.coordinator.invalidateCurrent(); await h.lifecycle.refresh();
    assert.notEqual(h.references.capture().reference.osId, parent.osId);
    assert.equal(h.map.readCurrent().map.atlas.locations[0].key, 'port');
    assert.equal(h.state.chatSaves.length, 0);
});

test('a manual chat-save rejection cannot delete a file already published by automatic maintenance', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const automatic = await sessionFor(h, 'map'); edit(automatic, 'map');
    await automatic.commit(() => true, { completed: true });
    const reference = h.references.capture().reference;
    h.state.chatMode = 'rejected';
    const manual = await sessionFor(h, 'map', 'manual'); edit(manual, 'map', 2);
    await assert.rejects(manual.commit(() => true, { completed: true }));
    assert.deepEqual(h.references.capture().reference, reference);
    assert.equal(h.state.sidecars.get(reference.osId).partitions.map.atlas.locations[0].name, '港口-2');
    h.state.chatMode = 'confirmed';
    const writes = h.state.writes.length;
    assert.equal((await h.map.confirmPending()).status, 'confirmed');
    assert.equal(h.state.writes.length, writes);
    assert.deepEqual(readXiaobaiOsReference(h.state.headers.get('a')), reference);
});

test('a switched chat cannot receive a deferred maintenance reference', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const session = await sessionFor(h, 'map'); edit(session, 'map');
    h.state.current = { identityKey: 'other', binding: { ...h.state.current.binding, chatId: 'other' }, metadata: {} };
    await assert.rejects(session.commit(() => false, { completed: true }));
    assert.equal(h.state.writes.length, 0);
    assert.equal(h.state.chatSaves.length, 0);
    assert.equal(readXiaobaiOsReference(h.state.current.metadata), null);
});

// Acceptance (data loss / blocked chat): reloading before a host save must
// recover the published file, including branch copies, without another upload.
for (const kind of ['ordinary', 'inherited-branch', 'parent-linked-branch']) {
    test(`${kind}: reload before host save reuses the published reference and latest file`, async t => {
        const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
        const first = await sessionFor(h, 'map'); edit(first, 'map');
        await first.commit(() => true, { completed: true });
        if (kind !== 'ordinary') {
            h.hostSave();
            const metadata = kind === 'inherited-branch' ? structuredClone(h.state.current.metadata) : {};
            h.state.current = { identityKey: 'branch', binding: { ...h.state.current.binding, chatId: 'branch' },
                metadata, ...(kind === 'parent-linked-branch' ? { mainChatId: 'a' } : {}) };
            h.hostSave();
            h.coordinator.invalidateCurrent(); await h.lifecycle.refresh();
        }
        const latest = await sessionFor(h, 'map'); edit(latest, 'map', 2);
        await latest.commit(() => true, { completed: true });
        const reference = h.references.capture().reference;
        const writes = h.state.writes.length;
        const count = h.state.sidecars.size;
        // Discard the unsaved metadata object, as when leaving and reopening chat.
        await h.reload();
        assert.deepEqual(h.references.capture().reference, reference);
        assert.equal(h.map.readCurrent().map.atlas.locations[0].name, '港口-2');
        assert.equal(h.state.writes.length, writes);
        assert.equal(h.state.sidecars.size, count);
        assert.equal(h.state.chatSaves.length, 0);
        const next = await sessionFor(h, 'map'); edit(next, 'map', 3);
        await next.commit(() => true, { completed: true });
        assert.equal(h.state.writes.length, writes + 1);
        assert.equal(h.state.chatSaves.length, 0);
        h.state.chatMode = 'rejected';
        assert.equal((await h.map.confirmPending()).status, 'failed');
        h.state.chatMode = 'confirmed';
        assert.equal((await h.map.confirmPending()).status, 'confirmed');
        assert.equal(h.state.writes.length, writes + 1);
        await h.reload();
        assert.deepEqual(h.references.capture().reference, reference);
        assert.equal(h.map.readCurrent().map.atlas.locations[0].name, '港口-3');
    });
}

test('task settlement stays associated after reloading an unsaved reference without paying twice', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const record = await acceptFixtureTask(h);
    const captured = h.references.capture();
    h.state.headers.set('a', {});
    await h.references.install({ ...captured, reference: null }, captured.reference, { chatPersistence: 'host' });
    const session = await sessionFor(h, 'tasks');
    session.executeTool('TaskComplete', { taskId: record.taskId, revision: record.taskRevision, resultSummary: '守卫已收信' });
    await session.commit(() => true, { completed: true });
    const saves = h.state.chatSaves.length;
    const writes = h.user.state.writes.length;
    const files = h.state.writes.length;
    await h.reload(); await h.tasks.refreshCurrent();
    assert.deepEqual(h.references.capture().reference, captured.reference);
    assert.equal(h.tasks.readCurrent().records[0].status, 'completed');
    assert.equal(h.economy.getPlayerBalance(), 250);
    assert.equal(h.user.state.writes.length, writes);
    assert.equal(h.state.writes.length, files);
    assert.equal(h.state.chatSaves.length, saves);
});
