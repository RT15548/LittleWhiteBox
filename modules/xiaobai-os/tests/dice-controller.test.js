import assert from 'node:assert/strict';
import test from 'node:test';
import { createDiceController } from '../apps/dice/host/controller.ts';
import { createSettingsRepository } from '../host/settings-repository.ts';

async function harness(ensureDisplay = async () => {}) {
    const root = {};
    let persist = () => {};
    const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings: () => persist() });
    await settings.prepare();
    let identity = 'chat-a';
    const cancelled = [];
    const controller = createDiceController(settings, () => identity, ensureDisplay, feature => cancelled.push(feature));
    controller.startBackground();
    const activate = () => controller.activate({ isCurrent: () => true, post() {} });
    await activate();
    return { root, settings, controller, cancelled, activate,
        save: action => { persist = action; },
        switchChat: key => { identity = key; },
        toggle: (feature, enabled) => controller.handleMessage({ type: 'dice/set-feature', payload: { chatIdentity: identity, feature, enabled } }),
        frequency: frequency => controller.handleMessage({ type: 'dice/set-frequency', payload: { chatIdentity: identity, frequency } }),
    };
}

test('both Dice switches persist across chats and repository reload, independently of each other', async () => {
    let displayChecks = 0;
    const h = await harness(async () => { displayChecks++; });
    await h.toggle('actionChecksEnabled', true);
    await h.toggle('encountersEnabled', true);
    h.switchChat('chat-b');
    let state = await h.activate();
    assert.equal(state.actionChecksEnabled, true);
    assert.equal(state.encountersEnabled, true);
    await h.toggle('encountersEnabled', false);
    assert.equal(displayChecks, 1, 'encounter preferences do not prepare the action regex');
    assert.deepEqual(h.cancelled, ['encountersEnabled']);
    const reopened = createSettingsRepository({ getExtensionSettings: () => structuredClone(h.root), saveSettings() {} });
    assert.deepEqual((await reopened.prepare()).apps.dice, { actionChecksEnabled: true, actionCheckFrequency: 'standard', encountersEnabled: false });
    h.switchChat('chat-a');
    state = await h.activate();
    assert.equal(state.actionChecksEnabled, true);
    assert.equal(state.encountersEnabled, false);
});

test('action-check frequency defaults to standard and survives toggles, chats and settings reload', async () => {
    const h = await harness();
    assert.equal((await h.activate()).actionCheckFrequency, 'standard');
    await h.toggle('actionChecksEnabled', true);
    for (const frequency of ['light', 'standard', 'active']) {
        assert.equal((await h.frequency(frequency)).actionCheckFrequency, frequency);
    }
    assert.deepEqual(h.cancelled, [], 'changing frequency does not cancel checks');
    await h.toggle('actionChecksEnabled', false);
    assert.equal((await h.activate()).actionCheckFrequency, 'active');
    await h.toggle('actionChecksEnabled', true);
    h.switchChat('chat-b');
    assert.equal((await h.activate()).actionCheckFrequency, 'active');
    const reloadedRoot = structuredClone(h.root);
    const reopened = createSettingsRepository({ getExtensionSettings: () => reloadedRoot, saveSettings() {} });
    assert.deepEqual((await reopened.prepare()).apps.dice,
        { actionChecksEnabled: true, actionCheckFrequency: 'active', encountersEnabled: false });
    await h.controller.disable();
    assert.equal(h.settings.read().apps.dice.actionCheckFrequency, 'active', 'disabling Dice preserves the chosen frequency');
});

test('invalid or failed frequency saves preserve the confirmed choice and do not cancel generation', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await harness();
    await h.toggle('actionChecksEnabled', true);
    await h.frequency('light');
    for (const frequency of ['unknown', true, null, undefined]) {
        await assert.rejects(h.frequency(frequency), /检定频率无效/);
    }
    assert.throws(() => h.settings.setDiceActionCheckFrequency('unknown'), /invalid Dice action-check frequency/);
    h.save(() => false);
    await assert.rejects(h.frequency('active'), /设置未能保存/);
    assert.equal(h.settings.read().apps.dice.actionCheckFrequency, 'light');
    assert.equal(h.root.xiaobaiOs.apps.dice.actionCheckFrequency, 'light');
    assert.deepEqual(h.cancelled, []);
    h.save(() => {});
    assert.equal((await h.frequency('active')).actionCheckFrequency, 'active');
});

test('frequency only becomes effective after saving, even when its page closes during the save', async () => {
    const h = await harness();
    const saving = Promise.withResolvers();
    const entered = Promise.withResolvers();
    h.save(() => { entered.resolve(); return saving.promise; });
    const operation = h.frequency('active');
    await entered.promise;
    assert.equal(h.settings.read().apps.dice.actionCheckFrequency, 'standard');
    h.controller.deactivate();
    saving.resolve();
    await assert.rejects(operation, /聊天或页面已切换/);
    h.switchChat('chat-b');
    assert.equal((await h.activate()).actionCheckFrequency, 'active');
    assert.deepEqual(h.cancelled, []);
});

test('leaving the page during display-rule preflight does not enable action checks', async () => {
    let release;
    const h = await harness(() => new Promise(resolve => { release = resolve; }));
    const operation = h.toggle('actionChecksEnabled', true);
    h.switchChat('chat-b');
    release();
    await assert.rejects(operation, /聊天或页面已切换/);
    assert.equal(h.settings.read().apps.dice.actionChecksEnabled, false);
});

test('confirmed global settings still take effect when a chat switches during saving', async () => {
    const h = await harness();
    await h.toggle('actionChecksEnabled', true);
    let release;
    let entered;
    const saving = new Promise(resolve => { entered = resolve; });
    h.save(() => { entered(); return new Promise(resolve => { release = resolve; }); });
    const operation = h.toggle('actionChecksEnabled', false);
    await saving;
    assert.equal(h.settings.read().apps.dice.actionChecksEnabled, true, 'unconfirmed settings do not affect generation');
    h.switchChat('chat-b');
    release();
    await assert.rejects(operation, /聊天或页面已切换/);
    assert.equal((await h.activate()).actionChecksEnabled, false);
    assert.deepEqual(h.cancelled, ['actionChecksEnabled']);
});

test('failed saves retain confirmed preferences and can be retried without cancelling generation', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await harness();
    await h.toggle('encountersEnabled', true);
    h.save(() => false);
    await assert.rejects(h.toggle('encountersEnabled', false), /设置未能保存/);
    assert.equal(h.settings.read().apps.dice.encountersEnabled, true);
    assert.equal(h.root.xiaobaiOs.apps.dice.encountersEnabled, true);
    assert.deepEqual(h.cancelled, []);
    h.save(() => {});
    await h.toggle('encountersEnabled', false);
    assert.equal(h.settings.read().apps.dice.encountersEnabled, false);
    assert.deepEqual(h.cancelled, ['encountersEnabled']);
});
