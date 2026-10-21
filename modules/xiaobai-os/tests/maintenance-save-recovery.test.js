import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { startSaveRecovery } from '../host/save-recovery.js';
import { administratorHarness } from './administrator-harness.js';
import { createMaintenanceRunner } from '../capabilities/maintenance/runner.js';
import { createMaintenanceRegistry } from '../capabilities/maintenance/registry.js';
import { createMapMaintenanceParticipant } from '../apps/map/host/maintenance-participant.js';
import { createTaskMaintenanceParticipant } from '../apps/tasks/host/maintenance-participant.js';
import { createWorldMaintenanceParticipant } from '../apps/world/host/maintenance-participant.js';

async function prepare(id) {
    const h = await administratorHarness();
    let tool;
    if (id === 'tasks') {
        const board = await h.tasks.replaceBoard({ expectedBoardId: null, generatedAt: 10, listings: [{ grade: 'B', tags: ['禁忌'], posture: '中介入', title: '送信', hook: '把信送给守卫', objective: '守卫收到信', requirements: '', location: '钟楼', timing: '任意时候', risk: '盘查', reward: 150 }] }, () => true);
        const { record } = await h.tasks.acceptListing({ actionId: 'accept', boardId: board.view.domain.board.boardId, listingId: board.view.domain.board.listings[0].listingId }, () => true);
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
        t.after(() => runner.stopBackground());
        const stop = startSaveRecovery(h.coordinator); t.after(stop);
        h.state.replace = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
        await runner.startManual(id).completion;
        const calls = modelCalls();
        const writes = h.state.writes.length;
        h.state.replace = null;
        t.mock.timers.tick(2_000);
        await setImmediate();
        assert.equal(h.coordinator.getFileState(), 'ready');
        assert.equal(h.state.writes.length, writes + 1);
        assert.equal(modelCalls(), calls);
        if (id === 'tasks') { assert.equal(h.economy.getPlayerBalance(), 250); }
    });
    for (const invalidation of ['none', 'source', 'cancel']) {
        test(`${id} maintenance pending save keeps repeatable constraints: ${invalidation}`, async () => {
            const { h, runner } = await prepare(id);
            h.state.replace = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
            const start = runner.startManual(id);
            assert.equal(start.status, 'started');
            const outcome = await start.completion;
            assert.equal(outcome.reason, 'save-unconfirmed');
            const writes = h.state.writes.length;
            if (invalidation === 'source') { h.state.messages[59].swipe_id++; }
            if (invalidation === 'cancel') { runner.cancelRequested(id, 'stopped'); }
            h.state.replace = null;
            const result = await h[id].confirmPending().catch(error => ({ status: 'failed', error }));
            if (invalidation !== 'none') {
                assert.equal(result.status, 'failed'); assert.equal(h.state.writes.length, writes);
                await h.coordinator.adoptServerState();
            } else {
                assert.equal(result.status, 'confirmed'); assert.equal(h.state.writes.length, writes + 1);
                assert.equal((await h[id].confirmPending()).status, 'none');
                if (id === 'tasks') { assert.equal(h.economy.getPlayerBalance(), 250); assert.equal(h.tasks.readCurrent().records[0].status, 'completed'); }
                if (id === 'map') { assert.equal(h.map.readCurrent().map.atlas.locations[0].key, 'port'); }
                if (id === 'world') { assert.equal(h.world.readCurrent().world.overview, 'updated'); }
            }
            runner.stopBackground();
        });
    }
}
