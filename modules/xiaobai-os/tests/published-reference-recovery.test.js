import assert from 'node:assert/strict';
import test from 'node:test';
import { maintenancePersistenceHarness, acceptFixtureTask } from './maintenance-persistence-harness.js';
import { createMapMaintenanceParticipant } from '../apps/map/host/maintenance-participant.js';
import { captureAutomaticAcceptedTurn } from '../capabilities/maintenance/accepted-turn-source.js';
import { createEmptyMapDomain } from '../domains/map/state.js';

// Acceptance contracts (data loss): a failed chat save cannot revoke a published
// file, including while another file write is in flight or another chat is open.
// Explicit confirmation must still report errors and never replay file writes.
function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

async function automaticMap(h, name = 'port') {
    if (h.state.messages.at(-1).is_user) { h.state.messages.push({ mes: 'reply', is_user: false }); }
    h.state.messages.push({ mes: 'next', is_user: true });
    const source = captureAutomaticAcceptedTurn(h.capture(), h.state.messages.length - 1);
    const session = await createMapMaintenanceParticipant({ map: h.map, readSettings: () => ({ autoMaintenance: true }) })
        .createSession(source, 'automatic');
    session.executeTool('MapAtlasEdit', { locations: [{ key: 'port', name, scale: 'region' }] });
    return session.commit(() => true, { completed: true });
}

for (const outcome of ['confirmed', 'rejected', 'unknown']) {
    for (const fileInFlight of [false, true]) {
        test(`a late ${outcome} manual reference save preserves automatic data, file in flight: ${fileInFlight}`, async t => {
            const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
            const saveStarted = deferred(); const saveResponse = deferred();
            const save = h.metadata.save;
            h.metadata.save = async capture => {
                saveStarted.resolve();
                await saveResponse.promise;
                await save(capture);
            };
            const manual = acceptFixtureTask(h).then(value => ({ value }), error => ({ error }));
            await saveStarted.promise;
            const original = h.state.current;
            const reference = h.references.capture().reference;
            const fileStarted = deferred(); const fileResponse = deferred();
            const replace = h.storage.replace;
            if (fileInFlight) {
                h.storage.replace = async input => {
                    const result = await replace(input);
                    fileStarted.resolve();
                    await fileResponse.promise;
                    return result;
                };
            }
            const automatic = automaticMap(h);
            if (fileInFlight) { await fileStarted.promise; } else { await automatic; }
            if (outcome === 'confirmed') { saveResponse.resolve(); fileResponse.resolve(); }
            else { saveResponse.reject(Object.assign(new Error(outcome), { uncertain: outcome === 'unknown' })); }
            const manualResult = await manual;
            if (outcome === 'confirmed') { assert.ok(manualResult.value); }
            else { assert.ok(manualResult.error); }
            fileResponse.resolve(); await automatic;
            h.storage.replace = replace;
            assert.deepEqual(h.references.capture().reference, reference);
            assert.equal(h.state.sidecars.get(reference.osId).partitions.map.atlas.locations[0].name, 'port');
            assert.equal(h.coordinator.getFileState(), 'ready');
            h.metadata.save = save;
            const saves = h.state.chatSaves.length;
            await automaticMap(h, 'updated');
            assert.equal(h.state.chatSaves.length, saves);
            h.hostSave(); await h.reload();
            assert.equal(h.state.current.identityKey, original.identityKey);
            assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'updated');
        });
    }
}

for (const mode of ['rejected', 'unknown']) {
    test(`a ${mode} manual map reference save leaves usable files and explicit confirmation retries chat only`, async t => {
        const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
        h.state.chatMode = mode;
        const candidate = createEmptyMapDomain();
        candidate.atlas.locations = [{ key: 'port', name: 'manual', scale: 'region', status: 'mentioned' }];
        await assert.rejects(h.map.replaceCurrent(candidate, { expectedRevision: 0 }));
        const reference = h.references.capture().reference;
        assert.ok(reference);
        assert.equal(h.coordinator.getFileState(), 'ready');
        assert.equal(h.coordinator.hasPendingCommit(), false);
        assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'manual');
        const writes = h.state.writes.length;
        assert.equal((await h.map.confirmPending()).status, mode === 'rejected' ? 'failed' : 'unconfirmed');
        assert.equal(h.coordinator.getFileState(), 'ready');
        h.state.chatMode = 'confirmed';
        assert.equal((await h.map.confirmPending()).status, 'confirmed');
        assert.equal((await h.map.confirmPending()).status, 'none');
        assert.equal(h.state.writes.length, writes);
        await automaticMap(h, 'next');
        h.hostSave(); await h.reload();
        assert.deepEqual(h.references.capture().reference, reference);
        assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'next');
    });
}

test('a late manual failure after switching chat preserves the original published file', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const started = deferred(); const response = deferred();
    h.metadata.save = async () => { started.resolve(); await response.promise; };
    const manual = acceptFixtureTask(h).catch(error => error);
    await started.promise;
    const original = h.state.current;
    const reference = h.references.capture().reference;
    await automaticMap(h);
    h.state.current = { identityKey: 'other', binding: { ...original.binding, chatId: 'other' }, metadata: {} };
    response.reject(Object.assign(new Error('rejected'), { uncertain: false }));
    assert.ok(await manual instanceof Error);
    assert.deepEqual(h.state.current.metadata, {});
    assert.ok(h.state.sidecars.has(reference.osId));
    h.state.current = original;
    h.hostSave(); await h.reload();
    assert.deepEqual(h.references.capture().reference, reference);
    assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'port');
});

test('a file whose reference was never published can still be cleaned after a chat switch', async t => {
    const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
    const replace = h.storage.replace;
    h.storage.replace = async input => {
        const result = await replace(input);
        h.state.current = { identityKey: 'other', binding: { ...h.state.current.binding, chatId: 'other' }, metadata: {} };
        return result;
    };
    await assert.rejects(automaticMap(h));
    assert.equal(h.state.sidecars.size, 0);
    assert.deepEqual(h.state.current.metadata, {});
    assert.equal(h.state.chatSaves.length, 0);
});

for (const entry of ['service', 'document']) {
    test(`an unchanged explicit ${entry} save confirms only the published reference`, async t => {
        const h = await maintenancePersistenceHarness(); t.after(() => h.dispose());
        await automaticMap(h);
        const writes = h.state.writes.length;
        const save = async () => {
            if (entry === 'service') {
                const value = h.map.readCurrent().map;
                return h.map.replaceCurrent(value, { expectedRevision: value.revision });
            }
            const { snapshot } = await h.map.document.read();
            return h.map.document.replace(snapshot, snapshot.value, () => true);
        };
        h.state.chatMode = 'rejected';
        if (entry === 'service') { await assert.rejects(save()); }
        else { assert.equal((await save()).status, 'failed'); }
        assert.equal(h.state.chatSaves.length, 1);
        assert.equal(h.coordinator.getFileState(), 'ready');
        assert.equal((await h.map.confirmPending(() => false)).status, 'failed');
        assert.equal(h.state.chatSaves.length, 1);
        h.state.chatMode = 'confirmed';
        await save();
        assert.equal(h.state.chatSaves.length, 2);
        assert.equal(h.state.writes.length, writes);
        assert.equal((await h.map.confirmPending()).status, 'none');
    });
}
