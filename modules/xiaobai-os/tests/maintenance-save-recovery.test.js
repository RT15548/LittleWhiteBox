import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { startSaveRecovery } from '../host/save-recovery.js';
import { maintenancePersistenceHarness, acceptFixtureTask } from './maintenance-persistence-harness.js';
import { createMaintenanceRunner } from '../capabilities/maintenance/runner.js';
import { createMaintenanceRegistry } from '../capabilities/maintenance/registry.js';
import { createMapMaintenanceParticipant } from '../apps/map/host/maintenance-participant.js';
import { createTaskMaintenanceParticipant } from '../apps/tasks/host/maintenance-participant.js';
import { createWorldMaintenanceParticipant } from '../apps/world/host/maintenance-participant.js';

async function prepare(id) {
    const h = await maintenancePersistenceHarness();
    let tool;
    if (id === 'tasks') {
        const record = await acceptFixtureTask(h);
        tool = { name: 'TaskComplete', arguments: JSON.stringify({ taskId: record.taskId, revision: record.taskRevision, resultSummary: '守卫已收信' }) };
    } else if (id === 'map') {
        tool = { name: 'MapAtlasEdit', arguments: JSON.stringify({ locations: [{ key: 'port', name: '港口', scale: 'region' }] }) };
    } else { tool = { name: 'WorldEdit', arguments: '{"overview":"updated"}' }; }
    const participant = id === 'map' ? createMapMaintenanceParticipant({ map: h.map, readSettings: () => ({ autoMaintenance: true }) })
        : id === 'tasks' ? createTaskMaintenanceParticipant({ tasks: h.tasks, readSettings: () => ({ autoMaintenance: true }), captureSurface: h.capture })
            : createWorldMaintenanceParticipant(h.world, () => ({ subscribed: true }));
    let step = 0;
    const runner = createMaintenanceRunner({
        registry: createMaintenanceRegistry([participant]), captureSurface: h.capture, isGenerationActive: () => false,
        writeGate: { getState: h.coordinator.getFileState, subscribe: listener => h.coordinator.subscribeFileState(() => listener(h.coordinator.getFileState())) },
        gateway: {
            async loadConfig() { return { currentPresetName: 'test', presets: { test: { provider: 'sillytavern-openai-compatible', modelConfigs: { 'sillytavern-openai-compatible': { model: 'test' } } } } }; },
            async openSession() { return { providerConfig: {}, supportsSessionToolLoop: false, async run() { return step++ === 0 ? { toolCalls: [{ id: 'edit', ...tool }] } : { text: 'done' }; } }; },
        },
    });
    return { h, runner, modelCalls: () => step };
}

for (const id of ['map', 'tasks', 'world']) {
    test(`${id} automatically recovers a save without generating again`, async t => {
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const { h, runner, modelCalls } = await prepare(id);
        t.after(async () => { runner.stopBackground(); await h.dispose(); });
        const files = h.filesFor(id);
        const stop = startSaveRecovery(files); t.after(stop);
        h.setFileMode(id, 'unknown');
        await runner.startManual(id).completion;
        const calls = modelCalls();
        const writes = h.writesFor(id).length;
        const chatSaves = h.state.chatSaves.length;
        h.setFileMode(id, 'confirmed');
        t.mock.timers.tick(2_000);
        await setImmediate();
        assert.equal(files.getFileState(), 'ready');
        assert.equal(h.writesFor(id).length, writes + 1);
        assert.equal(h.state.chatSaves.length, chatSaves);
        assert.equal(modelCalls(), calls);
        if (id === 'tasks') { assert.equal(h.economy.getPlayerBalance(), 250); }
    });
    for (const invalidation of ['none', 'source', 'cancel']) {
        test(`${id} maintenance pending save keeps repeatable constraints: ${invalidation}`, async t => {
            const { h, runner } = await prepare(id);
            t.after(() => h.dispose());
            h.setFileMode(id, 'unknown');
            const start = runner.startManual(id);
            assert.equal(start.status, 'started');
            const outcome = await start.completion;
            assert.equal(outcome.reason, 'save-unconfirmed');
            const writes = h.writesFor(id).length;
            if (invalidation === 'source') { h.state.messages[59].swipe_id++; }
            if (invalidation === 'cancel') { runner.cancelRequested(id, 'stopped'); }
            h.setFileMode(id, 'confirmed');
            const result = await h[id].confirmPending().catch(error => ({ status: 'failed', error }));
            if (invalidation !== 'none') {
                assert.equal(result.status, 'failed'); assert.equal(h.writesFor(id).length, writes);
                await h.filesFor(id).adoptServerState();
            } else {
                assert.equal(result.status, 'confirmed'); assert.equal(h.writesFor(id).length, writes + 1);
                assert.equal((await h[id].confirmPending()).status, 'none');
                if (id === 'tasks') { assert.equal(h.economy.getPlayerBalance(), 250); assert.equal(h.tasks.readCurrent().records[0].status, 'completed'); }
                if (id === 'map') { assert.equal(h.map.readCurrent().map.atlas.locations[0].key, 'port'); }
                if (id === 'world') { assert.equal(h.world.readCurrent().world.overview, 'updated'); }
            }
            runner.stopBackground();
        });
    }
}
