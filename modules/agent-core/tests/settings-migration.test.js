import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { upgradeAgentSettings } from '../settings-migration.js';
import { loadSharedAgentSettings, saveSharedAgentSettings } from '../settings-repository.js';
import { resolveActiveProviderConfig } from '../provider-resolution.js';
import { AGENT_SETTINGS_CONFIG_VERSION } from '../config.js';
import { applyPresetAction, createPreset, TEXT_API_VERSION } from '../../text-api/model.js';

// Acceptance (lost configuration / wrong credentials): an actual v1 record,
// with credentials/addresses/model names redacted, retains its selected fields;
// reading or failed saving never modifies the source, and reload uses the current
// format. Old discovery defaults switch to Bearer without changing generation.
const frozen = JSON.parse(await readFile(new URL('./fixtures/agent-settings-v1.json', import.meta.url), 'utf8'));
for (const provider of Object.keys(frozen.presets['captured-preset'].modelConfigs)) {
    test(`v1 ${provider}: preserve the selected record, empty values and independent delegate through save/reload`, async () => {
        let disk = structuredClone(frozen);
        disk.presets['captured-preset'].provider = provider;
        disk.presets.other = { ...structuredClone(disk.presets['captured-preset']), provider: 'anthropic' };
        disk.delegatePresetName = 'other';
        disk.delegateConfig = { provider: 'google', modelConfigs: { google: {
            baseUrl: 'https://delegate.invalid', apiKey: '', model: 'delegate-model', temperature: 0, sendTemperature: false,
        } } };
        const original = structuredClone(disk);
        let fail = true;
        const storage = { getStrict: async () => structuredClone(disk), setAndSave: async (_key, value) => {
            if (fail) return false;
            disk = JSON.parse(JSON.stringify(value)); return true;
        } };
        const loaded = await loadSharedAgentSettings({ storage });
        const active = original.presets['captured-preset'].modelConfigs[provider];
        for (const [key, value] of Object.entries(active)) {
            assert.deepEqual(loaded.presets['captured-preset'][key], key === 'modelListAuth' ? 'bearer' : value);
        }
        assert.equal(loaded.delegateConfig.modelListAuth, 'bearer');
        assert.equal(loaded.delegateConfig.model, 'delegate-model');
        assert.equal(loaded.delegateConfig.apiKey, '');
        assert.equal(loaded.presets.other.apiKey, 'fixture-anthropic');
        assert.equal(JSON.stringify(loaded).includes('modelConfigs'), false);
        assert.deepEqual(disk, original);
        loaded.presets['captured-preset'].provider = 'anthropic';
        loaded.presets['captured-preset'].apiKey = 'edited-preset-key';
        assert.equal((await saveSharedAgentSettings(loaded, { storage })).ok, false);
        assert.deepEqual(disk, original);
        fail = false;
        assert.equal((await saveSharedAgentSettings(loaded, { storage })).ok, true);
        const restored = await loadSharedAgentSettings({ storage });
        assert.deepEqual(restored.presets, loaded.presets);
        assert.equal(restored.configVersion, AGENT_SETTINGS_CONFIG_VERSION);
        assert.equal(resolveActiveProviderConfig(restored).apiKey, 'edited-preset-key');
        assert.equal(resolveActiveProviderConfig(restored).model, active.model);
        assert.equal(upgradeAgentSettings(disk), disk);
    });
}

test('pre-version top-level provider settings convert only at the read boundary', async () => {
    const legacy = { provider: 'sillytavern-claude', modelConfigs: { 'sillytavern-claude': { apiKey: '', model: '' } } };
    const loaded = await loadSharedAgentSettings({ storage: { get: async () => legacy } });
    assert.equal(loaded.presets['默认'].baseUrl, '');
    assert.equal(loaded.presets['默认'].model, '');
    assert.equal(loaded.presets['默认'].apiKey, '');
    assert.equal(loaded.presets['默认'].provider, 'sillytavern-claude');
    assert.ok(legacy.modelConfigs);
});

test('Text API saving another channel retains every field including inactive Vertex options', () => {
    const preset = createPreset('a', 'A', { provider: 'google-vertex', baseUrl: 'https://relay.invalid', apiKey: 'fixture', model: 'alias',
        modelListAuth: 'x-goog-api-key', vertex: { authMode: 'relay', serviceAccountJson: 'fixture-json', streamFunctionCallArguments: false } });
    const state = { version: TEXT_API_VERSION, presets: [preset], bindings: { summary: 'a', planner: 'a', outline: 'a' } };
    const changed = applyPresetAction(state, 'summary', { type: 'save', id: 'a', preset: { ...preset, provider: 'anthropic' } });
    assert.deepEqual(changed.presets[0], { ...preset, provider: 'anthropic' });
});

// Acceptance (401 / lost settings): every stored preset and the independent
// delegate upgrade once; saving/reloading a later native choice must retain it.
test('v2 presets upgrade discovery once while preserving fields and later manual selections', async () => {
    let disk = { configVersion: 2, currentPresetName: 'claude', delegatePresetName: 'google', delegateConfigured: true,
        presets: {
            claude: { provider: 'anthropic', baseUrl: 'https://relay.invalid/v1', apiKey: 'claude-key', model: 'alias', modelListAuth: 'x-api-key' },
            google: { provider: 'sillytavern-google', baseUrl: 'https://relay.invalid/v3', apiKey: 'google-key', model: 'alias-2', modelListAuth: 'x-goog-api-key' },
        },
        delegateConfig: { provider: 'google', baseUrl: 'https://delegate.invalid', apiKey: 'delegate-key', model: 'alias-3', modelListAuth: 'x-goog-api-key' } };
    const original = structuredClone(disk);
    const storage = { getStrict: async () => structuredClone(disk), setAndSave: async (_key, value) => { disk = structuredClone(value); return true; } };
    const loaded = await loadSharedAgentSettings({ storage });
    for (const [name, preset] of Object.entries(original.presets)) {
        for (const [key, value] of Object.entries(preset)) assert.equal(loaded.presets[name][key], key === 'modelListAuth' ? 'bearer' : value);
    }
    assert.equal(loaded.delegateConfig.modelListAuth, 'bearer');
    assert.equal(loaded.delegateConfig.apiKey, 'delegate-key');
    assert.deepEqual(disk, original);
    assert.equal((await saveSharedAgentSettings(loaded, { storage })).ok, true);
    assert.deepEqual((await loadSharedAgentSettings({ storage })).presets, loaded.presets);
    loaded.presets.claude.modelListAuth = 'x-api-key';
    loaded.presets.google.modelListAuth = loaded.delegateConfig.modelListAuth = 'x-goog-api-key';
    assert.equal((await saveSharedAgentSettings(loaded, { storage })).ok, true);
    const restored = await loadSharedAgentSettings({ storage });
    assert.deepEqual(restored.presets, loaded.presets);
    assert.deepEqual(restored.delegateConfig, loaded.delegateConfig);
});
