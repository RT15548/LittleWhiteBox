import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovingClient } from '../apps/game/moving/client.ts';
import { withMovingRuntime } from '../apps/game/moving/host.ts';
import { challengeProgress, emptyMoving } from '../apps/game/moving/domain.ts';
import { createSettingsRepository } from '../host/settings-repository.ts';
const state = (extra = {}) => ({ revision: 0, completed: [], active: null, board: null, balance: 100,
    award: 0, challenge: challengeProgress(emptyMoving()), writeState: 'ready', pending: false, ready: true,
    soundEnabled: true, ...extra });
function harness() {
    let subscriber, handler = async () => ({ result: state() });
    const calls = [];
    const client = createMovingClient({
        subscribe(fn) { subscriber = fn; return () => { subscriber = null; }; },
        request(type, payload) { calls.push({ type, payload }); return handler(type, payload); },
    }, 'chat-a');
    return { client, calls, handle(fn) { handler = fn; }, push(value, chatIdentity = 'chat-a') { subscriber?.({ type: 'game/moving/state', payload: { chatIdentity, state: value } }); } };
}
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
    await h.client.act({ type: 'challenge' });
    const original = h.calls.at(-1).payload;
    assert.equal(h.client.blocked.value, true);
    await h.client.act({ type: 'challenge' });
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
    await h.client.act({ type: 'challenge' });
    const original = h.calls.at(-1).payload;
    h.handle(async type => ({ result: state(type.endsWith('/act') ? { revision: 1, balance: 50 } : {}) }));
    await h.client.recover();
    assert.deepEqual(h.calls.at(-1).payload, original);
    h.handle(async () => { throw Object.assign(new Error('funds'), { code: 'moving_funds' }); });
    await h.client.act({ type: 'challenge' });
    assert.equal(h.client.failed.value, null);
    assert.equal(h.client.blocked.value, false);
});

test('sound preference is an independent request and save errors cannot masquerade as a pending game move', async () => {
    const h = harness(); await h.client.read();
    h.handle(async (type, payload) => {
        assert.equal(type, 'game/moving/sound');
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

test('moving sound defaults on and a saved choice survives a new run and a reopened settings repository', async () => {
    const root = {};
    let saved, fail = false;
    const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings() {
        if (fail) { throw new Error('offline'); }
        saved = structuredClone(root);
    } });
    await settings.prepare();
    let run = 'first';
    const moving = { view: () => ({ active: { id: run }, soundEnabled: settings.read().apps.game.movingSoundEnabled }) };
    const runtime = withMovingRuntime({}, moving, () => 'chat-a', settings);
    const pushes = [];
    await runtime.activate({ post: (type, payload) => pushes.push({ type, payload }) });
    assert.equal(moving.view().soundEnabled, true);

    const off = await runtime.handleMessage({ type: 'game/moving/sound', payload: { chatIdentity: 'chat-a', enabled: false } });
    assert.equal(off.soundEnabled, false);
    assert.equal(pushes.at(-1).payload.state.soundEnabled, false);
    run = 'second';
    assert.deepEqual(moving.view(), { active: { id: 'second' }, soundEnabled: false });
    const reopened = createSettingsRepository({ getExtensionSettings: () => structuredClone(saved), saveSettings() {} });
    assert.equal((await reopened.prepare()).apps.game.movingSoundEnabled, false);

    fail = true;
    await assert.rejects(runtime.handleMessage({ type: 'game/moving/sound', payload: { chatIdentity: 'chat-a', enabled: true } }), /offline/);
    assert.equal(settings.read().apps.game.movingSoundEnabled, false);
    assert.equal(pushes.at(-1).payload.state.soundEnabled, false);
});
