import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Keep the production module, controller and message cleanup. Replace native I/O and inactive UI workers.
const compiled = await build({
    stdin: { contents: `export { createProductionDiceModule } from '../apps/dice/production-module.ts'; export { host } from 'dice-cleanup-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'dice-cleanup-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^dice-cleanup-host$|\/(?:script|sillytavern-port|sillytavern-chat-save|generation-adapter|message-display)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const host = { source: null, save: null, settled: Promise.resolve(), busy: false, cancelled: false };
            export const isGenerating = () => host.busy;
            export const isChatSaving = false;
            export const captureDiceChat = () => host.source;
            export const ensureDiceDisplayRule = async () => {};
            export const saveSillyTavernChat = guard => host.save(guard);
            export const createDiceGenerationAdapter = () => ({ cancel() { host.cancelled = true; }, settled: () => host.settled });
            export const createDiceMessageDisplay = () => ({ refresh() {} });
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Fixed repository code and test I/O fixture only.
const { createProductionDiceModule, host } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('cleanup disables first, waits for pending writes, preserves narrative/foreign fields and removes the partition only after same-chat confirmation', async () => {
    for (const mode of ['confirmed', 'unconfirmed', 'switched', 'busy']) {
        const message = { mes: 'Narrative', extra: { xiaobaiOsDice: { checks: [] }, other: 'retained' },
            swipes: ['Old', 'Narrative'], swipe_info: [{ extra: { xiaobaiOsDice: {}, reasoning: 'old' } }, { extra: { xiaobaiOsDice: {} } }] };
        host.source = { key: 'chat-a', chat: [message] }; host.busy = mode === 'busy'; host.cancelled = false;
        let release;
        host.settled = new Promise(resolve => { release = resolve; });
        let enabled = true;
        let writes = 0;
        let removed = false;
        const module = createProductionDiceModule();
        await module.install({ partition: {
            peekCurrent: () => ({ identityKey: 'chat-a', value: { actionChecksEnabled: enabled } }),
            async transact(command) { command({ currentOrInitial: () => ({ actionChecksEnabled: enabled }), replace: value => { enabled = value.actionChecksEnabled; } }); return { status: 'confirmed' }; },
        }, files: { getFileState: () => 'ready', hasPendingCommit: () => false }, execution: { addCleanup() {} } });
        host.save = async guard => {
            writes++;
            assert.equal(guard(), true);
            assert.equal(enabled, false);
            assert.equal(host.cancelled, true);
            assert.equal(message.extra.xiaobaiOsDice, undefined);
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
        assert.deepEqual(message.swipes, ['Old', 'Narrative']);
        assert.equal(message.extra.other, 'retained');
        assert.equal(message.swipe_info[0].extra.reasoning, 'old');
        if (mode !== 'busy') { assert.ok(message.swipe_info.every(info => !Object.hasOwn(info.extra, 'xiaobaiOsDice'))); }
    }
});
