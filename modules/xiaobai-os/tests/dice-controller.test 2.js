import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createDiceController } from '../apps/dice/host/controller.ts';
import { createSettingsRepository } from '../host/settings-repository.ts';
import { parseCoc7Sheet } from '../apps/dice/domain/coc7-sheet.ts';
import { generateCoc7Sheet } from '../apps/dice/domain/coc7-creation.ts';
import { userEconomyHarness } from './user-economy-harness.js';
import { DICE_PARTITION } from '../apps/dice/partition.ts';
import { BANK_PARTITION } from '../apps/bank/partition.ts';
import { ECONOMY_PARTITION } from '../capabilities/economy/index.ts';
import { createDiceSheetService } from '../apps/dice/application/sheet-service.ts';

async function harness(ensureDisplay = async () => {}, root = {}) {
    let persist = () => {};
    const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings: () => persist() });
    await settings.prepare();
    const wallet = await userEconomyHarness({ initialPartitions: async () => ({ economy: ECONOMY_PARTITION.createInitial(), dice: { ...DICE_PARTITION.createInitial(), sheet: settings.readLegacyDiceSheet() } }) });
    const sheets = createDiceSheetService(wallet.store(DICE_PARTITION), wallet.transactions);
    await sheets.refresh();
    await settings.finishDiceSheetMigration();
    let identity = 'chat-a';
    const cancelled = [];
    const pushes = [];
    const controller = createDiceController(settings, () => identity, ensureDisplay, feature => cancelled.push(feature), sheets);
    controller.startBackground();
    const activate = () => controller.activate({ isCurrent: () => true, post: (_type, payload) => pushes.push(payload.state) });
    await activate();
    return { root, settings, controller, cancelled, activate, pushes, wallet, sheets,
        rule: rule => controller.handleMessage({ type: 'dice/set-rule', payload: { chatIdentity: identity, rule } }),
        sheet: sheet => controller.handleMessage({ type: 'dice/set-coc7-sheet', payload: { chatIdentity: identity, sheet } }),
        save: action => { persist = action; },
        switchChat: key => { identity = key; },
        toggle: (feature, enabled) => controller.handleMessage({ type: 'dice/set-feature', payload: { chatIdentity: identity, feature, enabled } }),
        frequency: frequency => controller.handleMessage({ type: 'dice/set-frequency', payload: { chatIdentity: identity, frequency } }),
    };
}

test('Dice follows global file state through another app save and recovery', async t => {
    const h = await harness();
    t.after(() => h.controller.stopBackground());
    const bank = h.wallet.store(BANK_PARTITION);
    assert.equal((await bank.transact(tx => tx.replace(tx.currentOrInitial()))).status, 'confirmed');
    assert.equal(h.pushes.at(-1).sheetStorage, 'ready');
    assert.ok(h.pushes.some(state => state.sheetStorage === 'saving'));
    h.wallet.state.mode = 'unknown';
    assert.equal((await bank.transact(tx => tx.replace(tx.currentOrInitial()))).status, 'unconfirmed');
    assert.equal(h.pushes.at(-1).sheetStorage, 'unconfirmed');
    h.wallet.state.mode = 'confirmed';
    assert.equal((await h.wallet.transactions.retryPending()).status, 'confirmed');
    assert.equal(h.pushes.at(-1).sheetStorage, 'ready');
});

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
    assert.deepEqual((await reopened.prepare()).apps.dice, { actionChecksEnabled: true, actionCheckFrequency: 'standard', actionCheckRule: 'd20', encountersEnabled: false });
    h.switchChat('chat-a');
    state = await h.activate();
    assert.equal(state.actionChecksEnabled, true);
    assert.equal(state.encountersEnabled, false);
});

test('rule changes persist only after confirmation and leave the active reply snapshot alone', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await harness();
    assert.equal((await h.activate()).actionCheckRule, 'd20');
    await h.rule('d20');
    assert.equal(h.settings.read().apps.dice.actionCheckRule, 'd20');
    h.save(() => false);
    await assert.rejects(h.rule('coc7'));
    assert.deepEqual(h.cancelled, []);
    const saving = Promise.withResolvers();
    const entered = Promise.withResolvers();
    h.save(() => { entered.resolve(); return saving.promise; });
    const operation = h.rule('coc7');
    await entered.promise;
    assert.equal(h.settings.read().apps.dice.actionCheckRule, 'd20');
    saving.resolve();
    assert.equal((await operation).actionCheckRule, 'coc7');
    assert.deepEqual(h.cancelled, []);
    const reopened = createSettingsRepository({ getExtensionSettings: () => structuredClone(h.root), saveSettings() {} });
    assert.equal((await reopened.prepare()).apps.dice.actionCheckRule, 'coc7');
    await assert.rejects(h.rule('unknown'));
    assert.throws(() => h.settings.setDiceActionCheckRule('unknown'));
});

test('action-check frequency defaults to standard and survives toggles, chats and settings reload', async () => {
    const h = await harness();
    assert.equal((await h.activate()).actionCheckFrequency, 'standard');
    await h.toggle('actionChecksEnabled', true);
    for (const frequency of ['standard', 'active']) {
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
        { actionChecksEnabled: true, actionCheckFrequency: 'active', actionCheckRule: 'd20', encountersEnabled: false });
    await h.controller.disable();
    assert.equal(h.settings.read().apps.dice.actionCheckFrequency, 'active', 'disabling Dice preserves the chosen frequency');
});

test('invalid or failed frequency saves preserve the confirmed choice and do not cancel generation', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await harness();
    await h.toggle('actionChecksEnabled', true);
    for (const frequency of ['light', 'unknown', true, null, undefined]) {
        await assert.rejects(h.frequency(frequency));
        assert.throws(() => h.settings.setDiceActionCheckFrequency(frequency));
    }
    h.save(() => false);
    await assert.rejects(h.frequency('active'), /设置未能保存/);
    assert.equal(h.settings.read().apps.dice.actionCheckFrequency, 'standard');
    assert.equal(h.root.xiaobaiOs.apps.dice.actionCheckFrequency, 'standard');
    assert.deepEqual(h.cancelled, []);
    h.save(() => {});
    assert.equal((await h.frequency('active')).actionCheckFrequency, 'active');
});

test('upstream light preferences become standard once at load, with rollback on failed persistence', async () => {
    const h = await harness();
    // Dice-owned object produced by the upstream 32a314b8 settings normalizer before removing light.
    h.root.xiaobaiOs.apps.dice = JSON.parse(readFileSync(new URL('./fixtures/dice-settings-32a314b8.json', import.meta.url), 'utf8'));
    const original = structuredClone(h.root);
    let saves = 0;
    let saved = false;
    const adapter = { getExtensionSettings: () => h.root, saveSettings() { saves++; return saved; } };
    const reopened = createSettingsRepository(adapter);
    await assert.rejects(reopened.prepare());
    assert.deepEqual(h.root, original, 'failed upgrades preserve the complete installed settings');
    saved = true;
    const upgraded = await reopened.prepare();
    const expected = { ...original.xiaobaiOs.apps.dice, actionCheckFrequency: 'standard', actionCheckRule: 'd20' };
    assert.deepEqual(upgraded.apps.dice, expected);
    assert.deepEqual(h.root, { ...original, xiaobaiOs: { ...original.xiaobaiOs,
        apps: { ...original.xiaobaiOs.apps, dice: expected } } });
    assert.equal(saves, 2);
    assert.deepEqual((await createSettingsRepository(adapter).prepare()).apps.dice, expected);
    assert.equal(saves, 2, 'current settings do not require another conversion or save');
});

test('one committed sheet survives chats and reload; failed saves and clear preserve the prior facts', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await harness();
    const original = generateCoc7Sheet(() => 0.5);
    await h.sheet(original);
    h.switchChat('another-card');
    assert.deepEqual((await h.activate()).coc7Sheet, { kind: 'ready', sheet: original });
    await h.rule('coc7'); await h.rule('d20');
    const changed = parseCoc7Sheet({ ...original, attributes: { body: 80, mind: 50, will: 20, appearance: 50 } });
    h.wallet.state.mode = 'rejected';
    await assert.rejects(h.sheet(changed));
    await assert.rejects(h.sheet(null));
    assert.deepEqual(h.sheets.read(), original);
    assert.deepEqual(h.wallet.document().partitions.dice.sheet, original);
    h.wallet.state.mode = 'confirmed';
    await h.sheet(changed);
    assert.deepEqual(h.cancelled, []);
    const reopened = await userEconomyHarness({ files: h.wallet.state.files });
    assert.deepEqual((await reopened.store(DICE_PARTITION).read()).value.sheet, changed);
    await assert.rejects(h.sheet({ ...changed, luck: '50' }));
    await assert.rejects(h.sheet({ ...changed, attributes: Object.fromEntries(Object.keys(changed.attributes).map(id => [id, 80])) }));
    assert.deepEqual(h.sheets.read(), changed);
    await h.sheet(null);
    assert.equal(h.sheets.read(), null);
    assert.equal(h.wallet.economy.getPlayerBalance(), 0);
});

// Recovery is a settings/controller contract: a broken sheet must not block OS initialization or repair.
test('damaged sheets stay intact across OS initialization and unrelated writes, with explicit recoverable clear or replacement', async t => {
    t.mock.method(console, 'error', () => {});
    const complete = generateCoc7Sheet(() => 0.5);
    const missing = structuredClone(complete);
    delete missing.attributes.body;
    for (const damaged of [missing, { ...complete, luck: '50' }]) {
        for (const replacement of [null, complete]) {
            const h = await harness(undefined, { xiaobaiOs: { enabled: true, apps: { dice: { coc7Sheet: damaged } } } });
            assert.deepEqual((await h.activate()).coc7Sheet, { kind: 'invalid' });
            assert.deepEqual(h.wallet.document().partitions.dice.sheet, damaged);
            await h.settings.setEnabled(false);
            await h.settings.setMapAutoMaintenance(true);
            await h.rule('d20');
            await h.toggle('encountersEnabled', true);
            assert.deepEqual(h.wallet.document().partitions.dice.sheet, damaged, 'unrelated saves preserve the original raw data');
            h.wallet.state.mode = 'rejected';
            await assert.rejects(h.sheet(replacement));
            assert.deepEqual(h.sheets.read(), damaged);
            assert.deepEqual(h.wallet.document().partitions.dice.sheet, damaged);
            assert.deepEqual((await h.activate()).coc7Sheet, { kind: 'invalid' });
            h.wallet.state.mode = 'confirmed';
            const repaired = await h.sheet(replacement);
            assert.deepEqual(repaired.coc7Sheet, replacement === null ? { kind: 'empty' } : { kind: 'ready', sheet: complete });
            const reopened = await userEconomyHarness({ files: h.wallet.state.files });
            assert.deepEqual((await reopened.store(DICE_PARTITION).read()).value.sheet, replacement);
            h.controller.stopBackground();
        }
    }
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
