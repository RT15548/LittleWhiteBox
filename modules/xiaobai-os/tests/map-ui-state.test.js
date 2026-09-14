import assert from 'node:assert/strict';
import test from 'node:test';
import { createRenderer } from 'vue';
import { useMapState } from '../apps/map/ui/use-map-state.js';

const saved = {
    chatIdentity: 'chat:a', map: {}, writeState: 'ready', status: 'ready', message: '',
    autoMaintenance: true, maintenanceStatus: 'error', maintenanceMessage: 'previous-run-feedback',
};
const running = { ...saved, maintenanceStatus: 'maintaining', maintenanceMessage: '' };

// Mount the real view model with Vue lifecycle, without a DOM: these contracts concern feedback, not layout.
function mount(t, initialState = saved, respond = async () => ({ result: saved })) {
    let listener;
    let ui;
    const requests = [];
    const renderer = createRenderer({
        createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null,
    });
    const app = renderer.createApp({
        setup() {
            ui = useMapState({ initialState, bridge: {
                subscribe(fn) { listener = fn; return () => { listener = undefined; }; },
                request(...args) { requests.push(args); return respond(...args); },
            } });
            return () => null;
        },
    });
    app.mount({});
    t.after(() => app.unmount());
    return { ui, requests, push: state => listener?.({ type: 'map/state', payload: { state } }) };
}

test('opening and reopening Map keeps old results inspectable without notifying or starting work', t => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        const { ui, push, requests } = mount(t);
        assert.equal(ui.notice.value, '');
        assert.equal(ui.isError.value, false);
        assert.equal(ui.state.value.maintenanceMessage, saved.maintenanceMessage);
        push(saved);
        assert.equal(ui.notice.value, '');
        assert.deepEqual(requests, []);
    }
});

test('a newly completed run notifies once, and another run with the same failure can notify again', t => {
    const { ui, push } = mount(t);
    push(running);
    assert.equal(ui.busy.value, true);
    push(saved);
    assert.equal(ui.notice.value, saved.maintenanceMessage);
    assert.equal(ui.isError.value, true);
    ui.dismissNotice();
    push(saved);
    assert.equal(ui.notice.value, '');
    push(running);
    push(saved);
    assert.equal(ui.notice.value, saved.maintenanceMessage);
});

test('opening an active run observes completion but ignores other chats', t => {
    const { ui, push } = mount(t, running);
    push({ ...saved, chatIdentity: 'chat:b' });
    assert.equal(ui.busy.value, true);
    assert.equal(ui.notice.value, '');
    push(saved);
    assert.equal(ui.notice.value, saved.maintenanceMessage);
});

test('dismissal cannot hide a storage problem or enable updates, including after reopening', async t => {
    for (const status of ['unconfirmed', 'conflict', 'error']) {
        const initial = { ...saved, status, writeState: status === 'error' ? 'failed' : status, message: `storage:${status}` };
        const { ui, push, requests } = mount(t, initial);
        ui.dismissNotice();
        assert.equal(ui.notice.value, initial.message);
        assert.equal(ui.isError.value, true);
        push({ ...running, ...initial });
        await ui.update();
        assert.equal(ui.notice.value, initial.message);
        assert.deepEqual(requests, []);
        assert.equal(mount(t, initial).ui.notice.value, initial.message);
    }
});

test('manual rejection shows the current reason even without a running transition', async t => {
    const message = 'current-attempt-feedback';
    const { ui, requests } = mount(t, saved, async () => ({ result: { status: 'skipped', started: false, message, state: saved } }));
    await ui.update();
    assert.equal(ui.notice.value, message);
    assert.equal(requests.length, 1);
});

test('late admission responses cannot erase a completed run or replay a dismissed result', async t => {
    let respond;
    const { ui, push } = mount(t, saved, () => new Promise(resolve => { respond = resolve; }));
    const request = ui.update();
    push(running);
    push(saved);
    assert.equal(ui.notice.value, saved.maintenanceMessage);
    ui.dismissNotice();
    respond({ result: { started: true, status: 'started', message: '', state: running } });
    await request;
    assert.equal(ui.notice.value, '');
    assert.equal(ui.busy.value, false);
    assert.equal(ui.state.value.maintenanceStatus, 'error');
});

test('reading saved Map data gives fresh success feedback, not the old maintenance error', async t => {
    const { ui } = mount(t);
    await ui.refresh();
    assert.notEqual(ui.notice.value, saved.maintenanceMessage);
    assert.equal(ui.isError.value, false);
    assert.equal(ui.state.value.maintenanceMessage, saved.maintenanceMessage);
});
