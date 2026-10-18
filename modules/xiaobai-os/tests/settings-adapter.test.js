import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { EXT_ID } from '../../../core/constants.js';

const result = await build({
    stdin: { contents: `export { createSillyTavernSettingsAdapter } from '../host/sillytavern-context.ts'; export { createSettingsRepository } from '../host/settings-repository.ts'; export { host } from 'settings-test-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'official-settings-contract', setup(builder) {
        builder.onResolve({ filter: /(?:^settings-test-host$|\/(?:script|extensions)\.js$)/ }, () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            export const extension_settings = {};
            export const getContext = () => ({});
            export const host = { saves: 0, saved: '', error: null };
            export async function saveSettings() {
                host.saves++;
                if (host.error) throw host.error;
                host.saved = JSON.stringify({ extension_settings });
            }
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Executes only the repository adapter bundled with this local host-contract fixture.
const { createSillyTavernSettingsAdapter, createSettingsRepository, host } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

// Contract: a completed host write must not be reversed by an unrelated read or missed ready event (silent settings divergence).
test('OS settings save uses the native boundary without waiting for ready replay or server readback', async t => {
    const savedFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = savedFetch; });
    let reads = 0;
    globalThis.fetch = async () => {
        reads++;
        throw new Error('readback unavailable');
    };
    const adapter = createSillyTavernSettingsAdapter();
    const savesBefore = host.saves;
    const pending = adapter.saveSettings();
    assert.equal(host.saves, savesBefore + 1);
    assert.equal(reads, 0);
    await pending;
    const repository = createSettingsRepository(adapter);
    await repository.prepare();
    await repository.setEnabled(false);
    const persisted = JSON.parse(host.saved).extension_settings[EXT_ID].xiaobaiOs;
    assert.equal(repository.read().enabled, false);
    assert.deepEqual(repository.read(), persisted);
    assert.equal(reads, 0);
});

// Contract: a host-reported save failure stays a failure; later settings writes must remain usable (silent data loss).
test('OS adapter propagates host rejection and the repository recovers its write queue', async t => {
    t.mock.method(console, 'debug', () => {});
    const adapter = createSillyTavernSettingsAdapter();
    const repository = createSettingsRepository(adapter);
    const before = await repository.prepare();
    host.error = new Error('host save failed');
    t.after(() => { host.error = null; });
    await assert.rejects(repository.setEnabled(!before.enabled), host.error);
    assert.deepEqual(repository.read(), before);
    host.error = null;
    await repository.setEnabled(!before.enabled);
    assert.equal(repository.read().enabled, !before.enabled);
});
