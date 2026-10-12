import assert from 'node:assert/strict';
import test from 'node:test';
import { createBuildingClient } from '../apps/game/building/client.ts';
import { withBuildingRuntime } from '../apps/game/building/host.ts';
import { createSettingsRepository } from '../host/settings-repository.ts';
import { createRecoveryJournal } from '../apps/game/building/recovery.ts';
const state = (extra = {}) => ({ revision: 0, collection: [], active: null, inspection: null, balance: 100,
    award: 0, writeState: 'ready', pending: false, ready: true,
    soundEnabled: true, ...extra });
function harness(journal = createRecoveryJournal({ getItem: () => null, setItem() {}, removeItem() {} })) {
    let subscriber, handler = async () => ({ result: state() });
    const calls = [];
    const client = createBuildingClient({
        subscribe(fn) { subscriber = fn; return () => { subscriber = null; }; },
        request(type, payload) { calls.push({ type, payload }); return handler(type, payload); },
    }, 'chat-a', journal);
    return { client, calls, handle(fn) { handler = fn; }, push(value, chatIdentity = 'chat-a') { subscriber?.({ type: 'game/building/state', payload: { chatIdentity, state: value } }); } };
}

test('undo restores the previous room layout through the same revision-checked command path; foreign updates invalidate it', async () => {
    const h = harness(), initial = [{ kind: 'hall', x: 2, y: 0, z: 2 }];
    let current = state({ revision: 1, active: { id: 'house', state: 'building', rooms: initial } });
    h.handle(async (type, payload) => {
        if (type.endsWith('/act')) {
            const rooms = payload.command.type === 'restore' ? payload.command.rooms : [...current.active.rooms, payload.command.part];
            current = { ...current, revision: current.revision + 1, active: { ...current.active, rooms } };
        }
        return { result: current };
    });
    await h.client.read(); await h.client.act({ type: 'put', part: { kind: 'room', x: 3, y: 0, z: 2 } });
    assert.equal(h.client.canUndo.value, true);
    await h.client.undo();
    assert.deepEqual(h.client.view.value.active.rooms, initial);
    assert.equal(h.calls.at(-1).payload.revision, 2); assert.equal(h.client.canUndo.value, false);
    await h.client.act({ type: 'put', part: { kind: 'room', x: 3, y: 0, z: 2 } });
    h.push({ ...current, revision: current.revision + 1 });
    assert.equal(h.client.canUndo.value, false);
    const count = h.calls.length; await h.client.undo(); assert.equal(h.calls.length, count);
});

for (const format of [undefined, 2, 3, 4]) test(`historical intent ${format ?? 1} is retired only after storage confirmation, never replayed under new supplies`, async () => {
    let raw = JSON.stringify({ format, runId: 'old-run', request: { actionId: 'old-placement', revision: 5, command: { type: 'put', part: { kind: format ? 'room' : 'roof', x: 3, y: 1, z: 2 } } } });
    const journal = createRecoveryJournal({ getItem: () => raw, setItem: (_k, v) => { raw = v; }, removeItem: () => { raw = null; } });
    const h = harness(journal);
    h.handle(async () => ({ result: state({ revision: 5, active: { id: 'old-run' }, pending: true, writeState: 'unconfirmed' }) }));
    await h.client.read(); assert.notEqual(raw, null); assert.equal(h.client.blocked.value, true);
    h.handle(async () => ({ result: state({ revision: 5, active: { id: 'old-run' } }) }));
    await h.client.recover(); assert.equal(raw, null); assert.equal(h.client.blocked.value, false);
    assert.ok(h.client.notice.value); assert.equal(h.calls.filter(c => c.type.endsWith('/act')).length, 0);
});
test('a newer host push survives a late reply; wrong-chat pushes and disposed replies cannot replace state', async () => {
    const h = harness(); await h.client.read();
    let finish;
    h.handle(() => new Promise(resolve => { finish = resolve; }));
    const read = h.client.read();
    h.push(state({ revision: 2, balance: 150 }));
    finish({ result: state({ revision: 1 }) }); await read;
    assert.equal(h.client.view.value.revision, 2);
    assert.equal(h.client.view.value.balance, 150);
    h.push(state({ revision: 99 }), 'chat-b');
    assert.equal(h.client.view.value.revision, 2);
    const late = h.client.read(); h.client.dispose(); finish({ result: state({ revision: 3 }) }); await late;
    assert.equal(h.client.view.value.revision, 2);
});
test('uncertain admission freezes new actions and confirmation never buys a second run', async () => {
    const h = harness(); await h.client.read();
    h.handle(async () => { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); });
    await h.client.act({ type: 'start' });
    const original = h.calls.at(-1).payload;
    assert.equal(h.client.blocked.value, true);
    await h.client.act({ type: 'start' });
    assert.equal(h.calls.length, 2);
    h.handle(async () => ({ result: state({ revision: 1, balance: 50 }) }));
    await h.client.recover();
    assert.equal(h.calls.length, 3);
    assert.equal(h.client.failed.value, null);
    assert.equal(h.client.view.value.balance, 50);
    assert.ok(original.actionId);
});
test('a definitely unapplied request retries its identical identity, but business rejections do not trap the UI', async () => {
    const h = harness(); await h.client.read();
    h.handle(async () => { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); });
    await h.client.act({ type: 'start' });
    const original = h.calls.at(-1).payload;
    h.handle(async type => ({ result: state(type.endsWith('/act') ? { revision: 1, balance: 50 } : {}) }));
    await h.client.recover();
    assert.deepEqual(h.calls.at(-1).payload, original);
    h.handle(async () => { throw Object.assign(new Error('funds'), { code: 'building_funds' }); });
    await h.client.act({ type: 'start' });
    assert.equal(h.client.failed.value, null);
    assert.equal(h.client.blocked.value, false);
});

test('sound preference is an independent request and save errors cannot masquerade as a pending game move', async () => {
    const h = harness(); await h.client.read();
    h.handle(async (type, payload) => {
        assert.equal(type, 'game/building/sound');
        assert.deepEqual(payload, { chatIdentity: 'chat-a', enabled: false });
        return { result: state({ soundEnabled: false }) };
    });
    assert.equal(await h.client.setSoundEnabled(false), true);
    assert.equal(h.client.view.value.soundEnabled, false);
    h.handle(async () => { throw new Error('offline'); });
    await assert.rejects(h.client.setSoundEnabled(true), /offline/);
    assert.equal(h.client.view.value.soundEnabled, false);
    assert.equal(h.client.failed.value, null);
});

test('an ordinary read cannot forget a timed-out placement and permit a different placement at the same revision', async () => {
    const h = harness(); await h.client.read();
    h.handle(async () => { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); });
    await h.client.act({ type: 'put', part: { kind: 'room', x: 1, y: 0, z: 2 } });
    const original = h.client.failed.value;
    h.handle(async () => ({ result: state() })); await h.client.read();
    assert.deepEqual(h.client.failed.value, original); assert.equal(h.client.blocked.value, true);
    h.handle(async type => ({ result: state(type.endsWith('/act') ? { revision: 1 } : {}) }));
    await h.client.recover(); assert.deepEqual(h.calls.at(-1).payload.command, original.command);
    assert.equal(h.client.blocked.value, false);
});

test('a hard-reloaded client restores the same paid-run intent before accepting another placement', async () => {
    const values = new Map();
    const journal = createRecoveryJournal({ getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) });
    const initial = state({ revision: 1, active: { id: 'paid-run' } });
    const h = harness(journal); h.handle(async () => ({ result: initial })); await h.client.read();
    h.handle(async () => { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); });
    await h.client.act({ type: 'put', part: { kind: 'room', x: 2, y: 0, z: 2 } });
    const original = h.client.failed.value; h.client.dispose();
    assert.equal(values.size, 1);
    const reopened = harness(journal); reopened.handle(async () => ({ result: initial })); await reopened.client.read();
    assert.deepEqual(reopened.client.failed.value, original); assert.equal(reopened.client.blocked.value, true);
    reopened.handle(async type => ({ result: type.endsWith('/act') ? { ...initial, revision: 2 } : initial }));
    await reopened.client.recover();
    assert.deepEqual(reopened.calls.at(-1).payload.command, original.command);
    assert.equal(reopened.calls.at(-1).payload.actionId, original.actionId);
    assert.equal(values.size, 0); assert.equal(reopened.client.blocked.value, false);
});

test('a confirmed or replaced run retires local intent; unavailable local storage never sends the placement', async () => {
    let raw = null, fail = false;
    const journal = createRecoveryJournal({ getItem: () => raw, setItem: (_key, value) => { if (fail) { throw new Error('storage'); } raw = value; }, removeItem: () => { raw = null; } });
    const initial = state({ revision: 3, active: { id: 'current-run' } });
    journal.write({ runId: 'another-run', request: { actionId: 'old-action', revision: 3, command: { type: 'put', part: { kind: 'room', x: 0, y: 0, z: 2 } } } });
    const h = harness(journal); h.handle(async () => ({ result: initial })); await h.client.read();
    assert.equal(raw, null); assert.equal(h.client.blocked.value, false);
    fail = true; await h.client.act({ type: 'put', part: { kind: 'room', x: 3, y: 0, z: 2 } });
    assert.equal(h.calls.length, 1); assert.equal(h.client.blocked.value, true);
    fail = false; h.handle(async type => ({ result: type.endsWith('/act') ? { ...initial, revision: 4 } : initial })); await h.client.recover();
    assert.equal(h.calls.at(-1).payload.command.part.x, 3); assert.equal(raw, null);
});

test('building sound defaults on and a saved choice survives a new run and a reopened settings repository', async () => {
    const root = {};
    let saved, fail = false;
    const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings() {
        if (fail) { throw new Error('offline'); }
        saved = structuredClone(root);
    } });
    await settings.prepare();
    let run = 'first';
    const building = { view: () => ({ active: { id: run }, soundEnabled: settings.read().apps.game.buildingSoundEnabled }) };
    const runtime = withBuildingRuntime({}, building, () => 'chat-a', settings);
    const pushes = [];
    await runtime.activate({ post: (type, payload) => pushes.push({ type, payload }) });
    assert.equal(building.view().soundEnabled, true);

    const off = await runtime.handleMessage({ type: 'game/building/sound', payload: { chatIdentity: 'chat-a', enabled: false } });
    assert.equal(off.soundEnabled, false);
    assert.equal(pushes.at(-1).payload.state.soundEnabled, false);
    run = 'second';
    assert.deepEqual(building.view(), { active: { id: 'second' }, soundEnabled: false });
    const reopened = createSettingsRepository({ getExtensionSettings: () => structuredClone(saved), saveSettings() {} });
    assert.equal((await reopened.prepare()).apps.game.buildingSoundEnabled, false);

    fail = true;
    await assert.rejects(runtime.handleMessage({ type: 'game/building/sound', payload: { chatIdentity: 'chat-a', enabled: true } }), /offline/);
    assert.equal(settings.read().apps.game.buildingSoundEnabled, false);
    assert.equal(pushes.at(-1).payload.state.soundEnabled, false);
});
