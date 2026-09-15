import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createKernelComposition } from '../host/kernel-composition.ts';

// Keep the production module, controller and message cleanup. Replace native I/O and inactive UI workers.
const compiled = await build({
    stdin: { contents: `export { createProductionDiceModule } from '../apps/dice/production-module.ts'; export { host } from 'dice-cleanup-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    footer: { js: '//# sourceURL=dice-lifecycle-fixture.js' },
    plugins: [{ name: 'dice-cleanup-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^dice-cleanup-host$|\/(?:script|sillytavern-port|sillytavern-chat-save|generation-adapter|message-display|encounter-runtime|encounter-display)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const host = { source: null, save: null, settled: Promise.resolve(), busy: false, cancelled: false };
            export const isGenerating = () => host.busy;
            export const isChatSaving = false;
            export const captureDiceChat = () => host.source;
            export const ensureDiceDisplayRule = async () => {};
            export const isDiceMessageBeingEdited = () => false;
            export const updateMessageBlock = () => {};
            export const saveSillyTavernChat = guard => host.save(guard);
            export const createDiceGenerationAdapter = () => ({ start() {}, stop() {}, cancel() { host.cancelled = true; }, settled: () => host.settled });
            export const createEncounterRuntime = () => ({ start() {}, stop() {}, cancel() {} });
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

// Exercise the real module registry and chat-scoped store: a native welcome
// screen has no binding, which is normal and must not fail the Dice runtime.
for (const startsWithChat of [false, true]) {
    test(`Dice survives ${startsWithChat ? 'leaving a chat' : 'startup before any chat opens'} and uses the next chat's preference`, async t => {
        let capture = null;
        let writes = 0;
        host.source = null;
        host.settled = Promise.resolve();
        const kernel = createKernelComposition({
            modules: [createProductionDiceModule(async () => ({world:false,summary:false}), () => false)], capabilities: [],
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

        if (!startsWithChat) { await selectChat('chat-a', true); }
        assert.equal(host.displayEnabled, true, 'Late-loaded preferences reach the display without reopening Dice');
        await kernel.apps.handleChatChanged();
        assert.equal(kernel.apps.status('dice').state, 'ready');
        let state = await kernel.apps.activate('dice', { isCurrent: () => true, post() {} });
        assert.equal(state.actionChecksEnabled, true);

        capture = null; host.source = null;
        kernel.transactions.invalidateCurrent();
        await kernel.apps.handleChatChanged();
        assert.equal(kernel.apps.status('dice').state, 'ready');

        await selectChat('chat-b', false);
        await kernel.apps.handleChatChanged();
        state = await kernel.apps.activate('dice', { isCurrent: () => true, post() {} });
        assert.equal(state.chatIdentity, 'character:mira.png:chat-b');
        assert.equal(state.actionChecksEnabled, false);
        assert.equal(writes, 0);
    });
}

test('cleanup disables first, waits for pending writes, preserves narrative/foreign fields and removes the partition only after same-chat confirmation', async () => {
    for (const mode of ['confirmed', 'unconfirmed', 'switched', 'busy']) {
        const userMessage = { is_user: true, mes: 'User prose', extra: { foreign: 1, xiaobaiOsDice: { schemaVersion: 1, encounter: { outcome: 'medium' } } } };
        const message = { mes: 'Narrative', extra: { xiaobaiOsDice: { checks: [] }, other: 'retained' },
            swipes: ['Old', 'Narrative'], swipe_info: [{ extra: { xiaobaiOsDice: {}, reasoning: 'old' } }, { extra: { xiaobaiOsDice: {} } }] };
        host.source = { key: 'chat-a', chat: [userMessage, message] }; host.busy = mode === 'busy'; host.cancelled = false;
        let release;
        host.settled = new Promise(resolve => { release = resolve; });
        let preferences = { schemaVersion: 1, actionChecksEnabled: true, encountersEnabled: true };
        let writes = 0;
        let removed = false;
        const module = createProductionDiceModule(async () => ({world:false,summary:false}), () => false);
        await module.install({ partition: {
            subscribe: () => () => {},
            peekCurrent: () => ({ identityKey: 'chat-a', value: preferences }),
            async transact(command) { command({ currentOrInitial: () => preferences, replace: value => { preferences = value; } }); return { status: 'confirmed' }; },
        }, files: { getFileState: () => 'ready', hasPendingCommit: () => false }, execution: { addCleanup() {} } });
        host.save = async guard => {
            writes++;
            assert.equal(guard(), true);
            assert.equal(preferences.actionChecksEnabled, false);
            assert.equal(preferences.encountersEnabled, false);
            assert.equal(host.cancelled, true);
            assert.equal(message.extra.xiaobaiOsDice, undefined);
            assert.equal(userMessage.extra.xiaobaiOsDice, undefined);
            if (mode === 'switched') { host.source = { key: 'chat-b', chat: [] }; }
            return { status: mode === 'unconfirmed' ? 'unconfirmed' : 'confirmed' };
        };
        const operation = module.clearData({ async removePartition(key) {
            assert.equal(key, 'dice'); assert.equal(writes, 1); assert.equal(host.source.key, 'chat-a'); removed = true;
        } });
        const result = operation.then(() => null, error => error);
        await Promise.resolve(); await Promise.resolve();
        assert.equal(writes, 0);
        assert.ok(message.extra.xiaobaiOsDice);
        release();
        const error = await result;
        assert.equal(removed, mode === 'confirmed');
        assert.equal(Boolean(error), mode !== 'confirmed');
        assert.equal(message.mes, 'Narrative');
        assert.equal(userMessage.mes, 'User prose');
        assert.equal(userMessage.extra.foreign, 1);
        assert.deepEqual(message.swipes, ['Old', 'Narrative']);
        assert.equal(message.extra.other, 'retained');
        assert.equal(message.swipe_info[0].extra.reasoning, 'old');
        if (mode !== 'busy') { assert.ok(message.swipe_info.every(info => !Object.hasOwn(info.extra, 'xiaobaiOsDice'))); }
    }
});
