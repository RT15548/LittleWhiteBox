import assert from 'node:assert/strict';
import test from 'node:test';
import { createRenderer } from 'vue';
import { useMapState } from '../apps/map/ui/use-map-state.js';
import { useWorldState } from '../apps/world/ui/use-world-state.js';
import { maintenanceState } from '../apps/map/host/maintenance-state.js';
import { worldStatusMessage } from '../apps/world/host/status.js';
import { taskMaintenanceMessage } from '../apps/tasks/feedback.js';

function mount(useState, initialState, request = async () => ({})) {
    let client, listener;
    const renderer = createRenderer({
        createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null,
    });
    const app = renderer.createApp({ setup() {
        client = useState({ initialState, bridge: { request, subscribe(fn) { listener = fn; return () => {}; } } });
        return () => null;
    } });
    app.mount({});
    return { client, push: (type, state) => listener({ type, payload: { state } }), stop: () => app.unmount() };
}

// Acceptance: pending acknowledgement must not alarm the user or enable a second
// paid generation; confirmation must unlock actions, while actual failures stay visible.
test('map pending saves stay quiet and cannot trigger a second generation', async t => {
    let requests = 0;
    const state = { chatIdentity: 'chat', map: {}, status: 'unconfirmed', writeState: 'unconfirmed', message: '', maintenanceStatus: 'idle' };
    const h = mount(useMapState, state, async () => { requests++; }); t.after(h.stop);
    assert.equal(h.client.notice.value, '');
    assert.equal(h.client.isError.value, false);
    assert.ok(h.client.disabledReason.value);
    await h.client.update();
    assert.equal(requests, 0);
    h.push('map/state', { ...state, status: 'ready', writeState: 'ready' });
    assert.equal(h.client.disabledReason.value, '');
    h.push('map/state', { ...state, status: 'error', writeState: 'failed', message: 'failure' });
    assert.equal(h.client.notice.value, 'failure');
    assert.equal(h.client.isError.value, true);
});

test('news pending saves are quiet but a confirmed failure remains actionable', t => {
    const state = { chatIdentity: 'chat', writeState: 'unconfirmed', maintenance: 'idle', message: '' };
    const h = mount(useWorldState, state); t.after(h.stop);
    assert.equal(h.client.notice.value, '');
    assert.equal(h.client.error.value, false);
    assert.equal(h.client.writable.value, false);
    h.push('world/state', { ...state, writeState: 'failed', message: 'failure' });
    assert.equal(h.client.notice.value, 'failure');
    assert.equal(h.client.error.value, true);
});

test('uncertain maintenance outcomes are not rendered as failed updates', () => {
    const status = { state: 'error', message: 'failed', reason: 'save-unconfirmed' };
    assert.deepEqual(maintenanceState(status), { maintenanceStatus: 'idle', maintenanceMessage: '' });
    assert.equal(worldStatusMessage('unconfirmed', status), '');
    assert.equal(taskMaintenanceMessage(status, false), '');
    assert.equal(maintenanceState({ ...status, reason: 'save-failed' }).maintenanceStatus, 'error');
    assert.ok(worldStatusMessage('failed', { ...status, reason: 'save-failed' }, true));
    assert.ok(taskMaintenanceMessage({ ...status, reason: 'save-failed' }, false));
});
