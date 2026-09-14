import assert from 'node:assert/strict';
import test from 'node:test';

import { createMapController } from '../apps/map/host/controller.js';

function createHarness() {
    const initialStatus = { state: 'idle', mode: null, message: '', reason: '', lastRunAt: null };
    const host = {
        identity: { key: 'character:1:chat-a' },
        posts: [],
        dataListener: null,
        settingsListener: null,
        statusListener: null,
        autoMaintenance: false,
        writeState: 'ready',
        status: initialStatus,
        statuses: new Map([['character:1:chat-a', initialStatus]]),
        calls: [],
        mapData: null,
    };
    const map = {
        readCurrent: () => ({ map: host.mapData, writeState: host.writeState }),
        refreshCurrent: async () => ({ map: host.mapData, writeState: host.writeState }),
        getWriteState: () => host.writeState,
        confirmPending: async () => ({ status: 'confirmed' }),
        adoptServerState: async () => {host.writeState = 'ready'; return { status: 'adopted' };},
    };
    const settings = {
        read: () => ({ apps: { map: { autoMaintenance: host.autoMaintenance } } }),
        async setMapAutoMaintenance(enabled) {
            host.autoMaintenance = enabled;
            host.settingsListener?.(settings.read());
            return settings.read();
        },
        subscribe(listener) {
            host.settingsListener = listener;
            return () => {host.settingsListener = null;};
        },
    };
    const maintenance = {
        startManual() {
            host.calls.push(['manual']);
            host.status = { state: 'running', mode: 'manual', message: '', reason: '', lastRunAt: null };
            host.statuses.set(host.identity.key, host.status);
            host.statusListener?.('map', host.identity.key, host.status);
            return { status: 'started', mode: 'manual', completion: new Promise(() => {}) };
        },
        startRebuild() {
            host.calls.push(['rebuild']);
            host.status = { state: 'running', mode: 'rebuild', message: '', reason: '', lastRunAt: null };
            host.statuses.set(host.identity.key, host.status);
            host.statusListener?.('map', host.identity.key, host.status);
            return { status: 'started', mode: 'rebuild', completion: new Promise(() => {}) };
        },
        cancelRequested(_participantId, reason) {host.calls.push(['cancel', reason]);},
        invalidateAutomatic(_participantId, reason) {host.calls.push(['invalidate-automatic', reason]);},
        getStatus: (_participantId, chatIdentity) => host.statuses.get(chatIdentity)
            ?? { state: 'idle', mode: null, message: '', reason: '', lastRunAt: null },
        subscribeStatus(listener) {
            host.statusListener = listener;
            return () => {host.statusListener = null;};
        },
    };
    const controller = createMapController({
        map,
        settings,
        maintenance,
        getChatIdentity: () => host.identity,
        subscribeData(listener) {
            host.dataListener = listener;
            return () => {host.dataListener = null;};
        },
    });
    controller.startBackground();
    return { controller, host, maintenance };
}

function activation(host) {
    return {
        post(type, payload) {
            host.posts.push({ type, payload });
            return true;
        },
    };
}

test('Map activation is read-only and maintenance requests return after Host admission', async () => {
    const { controller, host } = createHarness();
    const state = await controller.activate(activation(host));

    assert.equal(state.status, 'ready');
    assert.equal(state.map, null);
    assert.equal(host.calls.some(call => call[0] === 'manual' || call[0] === 'rebuild'), false);

    const payload = { chatIdentity: host.identity.key };
    assert.equal((await controller.handleMessage({ type: 'map/refresh', payload })).status, 'ready');
    assert.equal((await controller.handleMessage({
        type: 'map/set-auto-maintenance',
        payload: { ...payload, enabled: true },
    })).autoMaintenance, true);
    assert.equal((await controller.handleMessage({ type: 'map/confirm-save', payload })).confirmation, 'confirmed');
    const manual = await controller.handleMessage({ type: 'map/maintain-once', payload });
    host.status = { state: 'idle', mode: 'manual', message: 'unchanged', reason: '', lastRunAt: 1 };
    const rebuild = await controller.handleMessage({ type: 'map/rebuild', payload });
    assert.equal(manual.started, true);
    assert.equal(manual.state.maintenanceStatus, 'maintaining');
    assert.equal(rebuild.started, true);
    assert.equal(rebuild.state.maintenanceStatus, 'rebuilding');
    assert.deepEqual(host.calls, [['manual'], ['rebuild']]);
});

test('Map subscriptions publish only while their activation still owns the current chat', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));

    host.dataListener();
    assert.equal(host.posts.length, 1);

    host.status = { state: 'running', mode: 'rebuild', message: '', reason: '', lastRunAt: null };
    host.statuses.set('character:1:chat-a', host.status);
    host.statusListener('map', 'character:1:chat-a', host.status);
    assert.equal(host.posts.at(-1).type, 'map/state');
    assert.equal(host.posts.at(-1).payload.state.maintenanceStatus, 'rebuilding');

    host.identity = { key: 'character:1:chat-b' };
    host.dataListener({ identityKey: 'character:1:chat-a', writeState: 'ready' });
    assert.equal(host.posts.length, 2);

    const next = await controller.activate(activation(host));
    assert.equal(next.maintenanceStatus, 'idle');
    host.statusListener('map', 'character:1:chat-a', host.status);
    assert.equal(host.posts.length, 2);
});

test('leaving Map detaches the page without cancelling Host-owned maintenance', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    await controller.handleMessage({
        type: 'map/maintain-once', payload: { chatIdentity: host.identity.key },
    });
    controller.deactivate('route-left');

    assert.deepEqual(host.calls, [['manual']]);
    await assert.rejects(
        controller.handleMessage({
            type: 'map/refresh',
            payload: { chatIdentity: 'character:1:chat-a' },
        }),
    );

    controller.handleChatChanged();
    assert.deepEqual(host.calls.slice(-2), [
        ['cancel', 'chat-changed'],
        ['invalidate-automatic', 'chat-changed'],
    ]);
});

test('write-gated maintenance is delegated to the runner and conflict recovery adopts server data', async () => {
    const { controller, host } = createHarness();
    host.writeState = 'unconfirmed';
    await controller.activate(activation(host));
    const payload = { chatIdentity: host.identity.key };

    assert.equal((await controller.handleMessage({ type: 'map/maintain-once', payload })).started, true);
    host.writeState = 'conflict';
    const adoption = await controller.handleMessage({ type: 'map/adopt-server-state', payload });
    assert.equal(adoption.adoption, 'adopted');
    assert.equal(adoption.state.status, 'ready');
});

test('maintenance completion is projected from Host status without exposing internal reasons', async () => {
    const { controller, host } = createHarness();
    host.status = {
        state: 'error', mode: 'manual', message: 'failed', reason: 'provider_secret_stack_and_key', lastRunAt: null,
    };
    host.statuses.set('character:1:chat-a', host.status);
    const result = await controller.activate(activation(host));
    assert.equal(result.maintenanceStatus, 'error');
    assert.doesNotMatch(JSON.stringify(result), /provider_secret_stack_and_key/);
});

test('Map preserves failed maintenance across read-only reopen and refresh without restarting work', async () => {
    const { controller, host } = createHarness();
    for (const reason of [
        'agent-not-configured', 'provider-failed', 'empty-provider-response',
        'tool-errors-unresolved', 'round-limit', 'save-failed', 'save-unconfirmed',
    ]) {
        host.statuses.set(host.identity.key, { state: 'error', mode: 'manual', message: 'failed', reason, lastRunAt: null });
        const first = controller.activate(activation(host));
        controller.deactivate();
        const reopened = controller.activate(activation(host));
        const refreshed = await controller.handleMessage({ type: 'map/refresh', payload: { chatIdentity: host.identity.key } });
        assert.equal(first.maintenanceStatus, 'error');
        assert.deepEqual(reopened, first);
        assert.deepEqual(refreshed, first);
    }
    assert.deepEqual(host.calls, []);
});

test('Map manual admission reports this attempt even if capture failed before a status could be stored', async () => {
    const { controller, host, maintenance } = createHarness();
    host.statuses.set(host.identity.key, { state: 'error', mode: 'manual', message: 'failed', reason: 'agent-not-configured', lastRunAt: null });
    maintenance.startManual = () => ({ status: 'skipped', mode: 'manual', reason: 'capture-failed' });
    controller.activate(activation(host));
    const result = await controller.handleMessage({ type: 'map/maintain-once', payload: { chatIdentity: host.identity.key } });
    assert.equal(result.started, false);
    assert.equal(result.status, 'skipped');
    assert.equal(result.state.maintenanceStatus, 'error');
    assert.notEqual(result.message, result.state.maintenanceMessage);
});
