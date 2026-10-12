import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createKernelComposition } from '../host/kernel-composition.ts';
import { createSettingsRepository } from '../host/settings-repository.ts';
import { createEconomyCapabilityRegistrations, ECONOMY_PARTITION } from '../capabilities/economy/index.ts';
import { DICE_PARTITION } from '../apps/dice/partition.ts';
import { userEconomyHarness } from './user-economy-harness.js';
import { upgradeDiceUserFile } from '../apps/dice/upgrade/partition-v1.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { createResultOverride } from '../apps/dice/domain/result-override.ts';
import { rerollCheck } from '../apps/dice/domain/reroll.ts';
import { headlessPromptInjection } from './helpers/prompt-injection.js';
import { PROMPT_INJECTION_CAPABILITY } from '../capabilities/prompt-injection/index.ts';

// Keep the production module, controller and message cleanup. Replace native I/O and inactive UI workers.
const compiled = await build({
    stdin: { contents: `export { createProductionDiceModule } from '../apps/dice/production-module.ts'; export { host } from 'dice-cleanup-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    footer: { js: '//# sourceURL=dice-lifecycle-fixture.js' },
    plugins: [{ name: 'dice-cleanup-host', setup(builder) {
        builder.onResolve({ filter: /\/prompt-registration\.js$/ }, () => ({ path: new URL('../apps/dice/prompt-registration.ts', import.meta.url).href, external: true }));
        builder.onResolve({ filter: /(?:^|\/)partition\.js$/ }, args => args.importer.replaceAll('\\', '/').includes('/dice/') ? ({ path: new URL('../apps/dice/partition.ts', import.meta.url).href, external: true }) : undefined);
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^dice-cleanup-host$|\/(?:script|extensions|group-chats|sillytavern-port|sillytavern-chat-save|generation-adapter|message-display|encounter-runtime|encounter-display)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export let is_send_press = false;
            export const is_group_generating = false;
            export const host = { source: null, save: null, editing: -1,
                get busy() { return is_send_press; }, set busy(value) { is_send_press = value; },
                get saving() { return isChatSaving; }, set saving(value) { isChatSaving = value; }, cancelled: false };
            export let isChatSaving = false;
            export const captureDiceChat = () => host.source;
            export const getContext = () => host.source;
            export const getRequestHeaders = () => ({});
            export const ensureDiceDisplayRule = async () => {};
            export const isDiceMessageBeingEdited = index => host.editing === index;
            export const updateMessageBlock = () => {};
            export const saveSillyTavernChat = guard => host.save(guard);
            export const saveChatConditional = async () => {};
            export const createDiceGenerationAdapter = (_enabled, frequency, changed) => {
                host.frequency = frequency;
                return { start() { host.actionStarted = true; }, stop() { host.actionStarted = false; changed(); }, isBusy: () => host.busy, isReplyPaused: message => _enabled() && message === host.pausedMessage, cancel() { host.cancelled = true; changed(); } };
            };
            export const createEncounterRuntime = () => ({ start() { host.encounterStarted = true; }, stop() { host.encounterStarted = false; }, cancel() {} });
            export const createEncounterDisplay = () => ({ start() {}, stop() {}, refresh() {} });
            export const createDiceMessageDisplay = (_runtime, enabled) => {
                const refresh = () => { host.displayEnabled = enabled(); };
                return { start: refresh, stop() {}, refresh };
            };
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Fixed repository code and test I/O fixture only.
const { createProductionDiceModule, host } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

// Exercise the real module registry and global settings: a native welcome
// screen has no binding, which is normal and must not fail the Dice runtime.
for (const startsWithChat of [false, true]) {
    test(`Dice survives ${startsWithChat ? 'leaving a chat' : 'startup before any chat opens'} and keeps global preferences`, async t => {
        let capture = null;
        let writes = 0;
        host.source = null;
        const root = {};
        const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings() {} });
        await settings.prepare();
        await settings.setDiceFeature('actionChecksEnabled', true);
        await settings.setDiceFeature('encountersEnabled', true);
        let userDocument = null;
        const dice = createProductionDiceModule(settings, async () => ({world:false,summary:false}), () => false,
            () => upgradeDiceUserFile(kernel.userTransactions));
        const pausedMessage = { mes: 'Paused reply' };
        host.pausedMessage = pausedMessage;
        assert.equal(dice.replyPause.isPaused(pausedMessage), false, 'an uninstalled Dice module has no display hold');
        const kernel = createKernelComposition({
            modules: [dice], capabilities: [...createEconomyCapabilityRegistrations(), headlessPromptInjection()],
            user: { storage: { read: async () => userDocument, replace: async (_name, value) => { userDocument = value; } },
                initialPartitions: async () => ({ economy: ECONOMY_PARTITION.createInitial(), dice: DICE_PARTITION.createInitial() }), resolveStory: async () => capture },
            storage: {
                async read() { throw new Error('The binding lifecycle already loaded this file'); },
                async replace() { writes++; throw new Error('Lifecycle must not write preferences'); },
            },
            chatReferences: {
                capture: () => capture,
                isCurrent: requested => requested === capture,
            },
        });
        t.after(() => kernel.dispose());
        async function selectChat(chatId, enabled) {
            const binding = { kind: 'character', ownerLocator: 'mira.png', chatId };
            capture = { identityKey: `character:mira.png:${chatId}`, binding, reference: { formatVersion: 1, osId: chatId } };
            host.source = { key: capture.identityKey, chat: [] };
            kernel.transactions.invalidateCurrent();
            // Same boundary used by production's chat binding lifecycle.
            await kernel.transactions.installResolvedEnvelope({
                formatVersion: 1, osId: chatId, binding, revision: 1, commitId: `commit_${chatId}`,
                partitions: { dice: { schemaVersion: 1, actionChecksEnabled: enabled, encountersEnabled: false } },
            });
        }
        if (startsWithChat) { await selectChat('chat-a', true); }
        await kernel.install();
        await kernel.apps.startBackground();
        assert.equal(kernel.apps.status('dice').state, 'ready');
        assert.equal(host.frequency(), 'standard');
        await settings.setDiceActionCheckFrequency('active');
        assert.equal(host.frequency(), 'active', 'production generation reads current global frequency without reinstalling');

        if (!startsWithChat) { await selectChat('chat-a', true); }
        await kernel.apps.handleChatChanged();
        assert.equal(host.displayEnabled, true, 'The display uses global preferences without reopening Dice');
        assert.equal(dice.replyPause.isPaused(pausedMessage), true);
        assert.equal(dice.replyPause.isPaused({ mes: 'Another reply' }), false, 'the port forwards the caller-selected message');
        await settings.setDiceFeature('actionChecksEnabled', false);
        assert.equal(dice.replyPause.isPaused(pausedMessage), false, 'global opt-out releases the display hold');
        await settings.setDiceFeature('actionChecksEnabled', true);
        assert.equal(kernel.apps.status('dice').state, 'ready');
        let state = await kernel.apps.activate('dice', { isCurrent: () => true, post() {} });
        assert.equal(state.actionChecksEnabled, true);

        capture = null; host.source = null;
        kernel.transactions.invalidateCurrent();
        await kernel.apps.handleChatChanged();
        assert.equal(kernel.apps.status('dice').state, 'ready');
        assert.equal(dice.replyPause.isPaused(pausedMessage), false, 'no current chat leaves no hold');

        await selectChat('chat-b', false);
        await kernel.apps.handleChatChanged();
        state = await kernel.apps.activate('dice', { isCurrent: () => true, post() {} });
        assert.equal(state.chatIdentity, 'character:mira.png:chat-b');
        assert.equal(state.actionChecksEnabled, true, 'Old chat-local preferences cannot override the global switch');
        assert.equal(state.encountersEnabled, true);
        assert.equal(state.actionCheckFrequency, 'active');
        assert.equal(writes, 0);
        await kernel.dispose();
        assert.equal(dice.replyPause.isPaused(pausedMessage), false, 'removing Dice unregisters its display state');
    });
}

test('chat cleanup disables Dice and saves its message cleanup without deleting the paid global sheet', async () => {
    for (const mode of ['confirmed', 'unconfirmed', 'switched', 'busy']) {
        const userMessage = { is_user: true, mes: 'User prose', extra: { foreign: 1, xiaobaiOsDice: { schemaVersion: 1, encounter: { outcome: 'medium' } } } };
        const message = { mes: 'Narrative', extra: { xiaobaiOsDice: { checks: [] }, other: 'retained' },
            swipes: ['Old', 'Narrative'], swipe_info: [{ extra: { xiaobaiOsDice: {}, reasoning: 'old' } }, { extra: { xiaobaiOsDice: {} } }] };
        host.source = { key: 'chat-a', chat: [userMessage, message] }; host.busy = mode === 'busy'; host.cancelled = false;
        const root = {};
        let persist = () => {};
        const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings: () => persist() });
        await settings.prepare();
        await settings.setDiceFeature('actionChecksEnabled', true);
        await settings.setDiceFeature('encountersEnabled', true);
        let writes = 0;
        let removed = false;
        persist = () => {
            assert.ok(message.extra.xiaobaiOsDice, 'message data remains while disabling preferences');
            assert.ok(userMessage.extra.xiaobaiOsDice);
            assert.equal(writes, 0);
        };
        const saving = Promise.withResolvers();
        const confirmation = Promise.withResolvers();
        const wallet = await userEconomyHarness();
        const module = createProductionDiceModule(settings, async () => ({world:false,summary:false}), () => false,
            () => upgradeDiceUserFile(wallet.transactions));
        const prompts = headlessPromptInjection().install();
        await module.install({ execution: { addCleanup() {} }, partition: wallet.store(DICE_PARTITION), files: wallet.transactions,
            useCapability: token => token.id === PROMPT_INJECTION_CAPABILITY.id ? prompts : wallet.economy });
        host.save = async guard => {
            saving.resolve();
            writes++;
            assert.equal(guard(), true);
            assert.equal(settings.read().apps.dice.actionChecksEnabled, false);
            assert.equal(settings.read().apps.dice.encountersEnabled, false);
            assert.equal(host.cancelled, true);
            assert.equal(message.extra.xiaobaiOsDice, undefined);
            assert.equal(userMessage.extra.xiaobaiOsDice, undefined);
            return confirmation.promise;
        };
        const operation = module.clearData({ async removePartition(key) {
            removed = true; assert.fail(`Chat cleanup must not remove user partition ${key}`);
        } });
        const result = operation.then(() => null, error => error);
        if (mode !== 'busy') {
            await saving.promise;
            assert.equal(writes, 1);
            assert.equal(removed, false, 'partition removal must wait for the cleanup save acknowledgement');
            if (mode === 'switched') { host.source = { key: 'chat-b', chat: [] }; }
            confirmation.resolve({ status: mode === 'unconfirmed' ? 'unconfirmed' : 'confirmed' });
        }
        const error = await result;
        assert.equal(writes, mode === 'busy' ? 0 : 1);
        assert.equal(removed, false);
        assert.equal(Boolean(error), mode !== 'confirmed');
        assert.equal(message.mes, 'Narrative');
        assert.equal(userMessage.mes, 'User prose');
        assert.equal(userMessage.extra.foreign, 1);
        assert.deepEqual(message.swipes, ['Old', 'Narrative']);
        assert.equal(message.extra.other, 'retained');
        assert.equal(message.swipe_info[0].extra.reasoning, 'old');
        if (mode === 'busy') {
            assert.equal(host.cancelled, false);
            assert.equal(settings.read().apps.dice.actionChecksEnabled, true);
            assert.equal(settings.read().apps.dice.encountersEnabled, true);
            assert.ok(message.extra.xiaobaiOsDice);
            assert.ok(userMessage.extra.xiaobaiOsDice);
            assert.ok(message.swipe_info.every(info => Object.hasOwn(info.extra, 'xiaobaiOsDice')));
        } else { assert.ok(message.swipe_info.every(info => !Object.hasOwn(info.extra, 'xiaobaiOsDice'))); }
    }
});

async function cleanupFixture(t) {
    const wallet = await userEconomyHarness(); await wallet.economy.refresh();
    const check = prepareActionCheck({
        body: '<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>',
        generatedFrom: 0, id: 'cleanup-check', random: () => .3,
    });
    const override = createResultOverride(rerollCheck(check.records.checks[0], () => .8), 'rerolled');
    const data = { sheet: { opaque: 'paid sheet' }, resultOverrides: { 'cleanup-check': override, unrelated: override } };
    await wallet.store(DICE_PARTITION).transact(tx => tx.replace(data));
    const message = { mes: check.body, extra: { xiaobaiOsDice: check.records, other: 'retained' } };
    host.source = { key: 'cleanup', chat: [message] };
    host.busy = false; host.saving = false; host.editing = -1;
    const root = {};
    const settings = createSettingsRepository({ getExtensionSettings: () => root, saveSettings() {} });
    await settings.prepare();
    const module = createProductionDiceModule(settings, async () => ({ world: false, summary: false }), () => false,
        () => upgradeDiceUserFile(wallet.transactions));
    const prompts = headlessPromptInjection().install();
    await module.install({ execution: { addCleanup(cleanup) { t.after(cleanup); } }, partition: wallet.store(DICE_PARTITION),
        files: wallet.transactions, useCapability: token => token.id === PROMPT_INJECTION_CAPABILITY.id ? prompts : wallet.economy });
    const savedChats = [];
    host.save = async guard => {
        assert.equal(guard(), true);
        assert.equal(wallet.document().partitions.dice.resultOverrides['cleanup-check'], undefined);
        savedChats.push(structuredClone(host.source.chat));
        return { status: 'confirmed' };
    };
    return { wallet, module, message, savedChats, data };
}

for (const mode of ['rejected', 'unknown', 'stored-ack-lost']) {
    test(`${mode}: cleanup failure retains chat identifiers and ordinary retry removes only their overrides`, async t => {
        const { wallet, module, message, savedChats, data } = await cleanupFixture(t);
        const before = structuredClone(message);
        const economy = structuredClone(wallet.document().partitions.economy);
        const read = wallet.storage.read, replace = wallet.storage.replace;
        wallet.state.mode = mode;
        wallet.storage.replace = async (...args) => {
            if (mode !== 'rejected') { wallet.storage.read = async () => { throw new TypeError('offline'); }; }
            return replace(...args);
        };
        await assert.rejects(module.clearData(), { code: 'dice_result_save_failed' });
        assert.deepEqual(message, before);
        assert.equal(savedChats.length, 0);
        assert.equal(wallet.transactions.hasPendingCommit(), false);
        wallet.storage.read = read; wallet.storage.replace = replace; wallet.state.mode = 'confirmed';
        await module.clearData();
        assert.equal(savedChats.length, 1);
        assert.equal(message.extra.xiaobaiOsDice, undefined);
        assert.equal(message.extra.other, before.extra.other);
        assert.deepEqual(wallet.document().partitions.dice, { sheet: data.sheet, resultOverrides: { unrelated: data.resultOverrides.unrelated } });
        assert.deepEqual(wallet.document().partitions.economy, economy);
    });
}

for (const change of ['chat', 'generation', 'editor', 'checks']) {
    test(`cleanup revalidates ${change} after awaiting the independent result deletion`, async t => {
        const { wallet, module, message, savedChats } = await cleanupFixture(t);
        const before = structuredClone(message);
        const started = Promise.withResolvers(), finish = Promise.withResolvers();
        const replace = wallet.storage.replace;
        wallet.storage.replace = async (...args) => { started.resolve(); await finish.promise; return replace(...args); };
        const operation = module.clearData();
        await started.promise;
        if (change === 'chat') { host.source = { key: 'other', chat: [{ mes: 'Other chat' }] }; }
        if (change === 'generation') { host.busy = true; }
        if (change === 'editor') { host.editing = 0; }
        if (change === 'checks') {
            const next = structuredClone(message);
            next.extra.xiaobaiOsDice.checks[0].id = 'new-check';
            host.source.chat.push(next);
        }
        finish.resolve();
        await assert.rejects(operation);
        assert.deepEqual(message, before);
        assert.equal(savedChats.length, 0);
        assert.equal(wallet.transactions.hasPendingCommit(), false);
        host.busy = false; host.editing = -1;
    });
}
