import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeNovelApiConfig, NOVEL_API_PRESET_OPTIONS } from '../../providers/novelai/novel-api-config.js';
import { createApiPreset, deleteApiPreset, MAX_API_PRESETS, normalizeApiPresetState } from '../api-presets.js';

// Acceptance (persistent credentials / data loss):
// - A single existing API config becomes an active preset without changing its values.
// - Repeated reads do not add presets or change identity; existing selections and names survive.
// - An unbound current config must not be replaced by another preset or truncate stored configs.
// - Deleting the final preset cannot leave credentials without a selected configuration.
const legacy = {
    apiKey: 'fixture-key', apiBaseUrl: 'https://fixture.invalid', sendMode: 'backend',
    insecureTLS: true, useImageBackendJobs: true, timeout: 120000,
    requestDelay: { min: 7000, max: 11000 }, unrelated: 'not-an-api-field',
};
const options = NOVEL_API_PRESET_OPTIONS;

test('single API config becomes a stable real preset and preserves every API field', () => {
    const before = structuredClone(legacy);
    const first = normalizeApiPresetState(legacy, options);
    assert.equal(first.apiPresets.length, 1);
    assert.equal(first.activeApiPresetId, first.apiPresets[0].id);
    assert.deepEqual(first.apiPresets[0].config, normalizeNovelApiConfig(legacy));
    assert.deepEqual(normalizeApiPresetState(legacy, options), first);
    assert.deepEqual(normalizeApiPresetState({ ...legacy, ...first }, options), first);
    assert.deepEqual(legacy, before);
});

test('valid selection and its custom name survive even with a modified effective config', () => {
    const config = normalizeNovelApiConfig(legacy);
    const state = { apiPresets: [{ id: 'custom', name: 'My API', config }], activeApiPresetId: 'custom' };
    assert.deepEqual(normalizeApiPresetState({ ...legacy, ...state, apiKey: 'edited-key' }, options), state);
});

test('an unbound config reuses an identical preset instead of duplicating it', () => {
    const preset = { id: 'custom', name: 'My API', config: normalizeNovelApiConfig(legacy) };
    const state = normalizeApiPresetState({ ...legacy, apiPresets: [preset], activeApiPresetId: 'missing' }, options);
    assert.equal(state.activeApiPresetId, preset.id);
    assert.deepEqual(state.apiPresets, [preset]);
});

test('an unbound config is preserved even when the saved list is full', () => {
    const apiPresets = Array.from({ length: MAX_API_PRESETS }, (_, i) => ({
        id: i === 0 ? 'apipreset-default' : `api-${i}`, name: `API ${i}`,
        config: normalizeNovelApiConfig({ ...legacy, apiKey: `fixture-${i}` }),
    }));
    const state = normalizeApiPresetState({ ...legacy, apiPresets }, options);
    assert.equal(state.apiPresets.length, MAX_API_PRESETS + 1);
    assert.equal(state.activeApiPresetId, state.apiPresets[0].id);
    assert.notEqual(state.activeApiPresetId, apiPresets[0].id);
    assert.deepEqual(state.apiPresets[0].config, normalizeNovelApiConfig(legacy));
    assert.deepEqual(state.apiPresets.slice(1), apiPresets);
    assert.deepEqual(normalizeApiPresetState({ ...legacy, ...state }, options), state);
    assert.throws(() => createApiPreset(state.apiPresets, 'New', legacy, options), { code: 'PRESET_LIMIT' });
});

test('the final preset cannot be deleted', () => {
    const state = normalizeApiPresetState(legacy, options);
    assert.throws(() => deleteApiPreset(state.apiPresets, state.activeApiPresetId), { code: 'LAST_PRESET' });
    assert.equal(state.apiPresets.length, 1);
});
