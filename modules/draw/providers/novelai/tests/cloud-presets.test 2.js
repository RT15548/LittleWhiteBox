import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { exportPreset, parsePresetData } from '../cloud-presets.js';

test('converts the frozen released V1 parameter preset at the import boundary', async () => {
    const fixture = JSON.parse(await readFile(
        new URL('./fixtures/novel-params-preset-v1.json', import.meta.url),
        'utf8',
    ));
    const { preset, warnings } = parsePresetData(fixture, () => 'imported-id');

    assert.equal(preset.id, 'imported-id');
    assert.equal(preset.maxImages, 0);
    assert.equal(preset.maxCharactersPerImage, 0);
    assert.equal(preset.params.v5QualityPresetId, 'none');
    assert.equal(preset.params.v5UcPresetId, 'humanFocus');
    assert.equal(preset.params.transparentBackground, false);
    assert.deepEqual(warnings, []);
});

test('round-trips all current V2 parameter preset fields', () => {
    const originalPrompt = globalThis.prompt;
    globalThis.prompt = () => '';
    try {
        const source = {
            id: 'source-id',
            name: 'V5 自定义',
            positivePrefix: 'depthness',
            negativePrefix: 'bad',
            maxImages: 4,
            maxCharactersPerImage: 12,
            params: {
                model: 'nai-diffusion-5-curated',
                sampler: 'k_euler_ancestral',
                scheduler: 'karras',
                steps: 23,
                scale: 7,
                width: 832,
                height: 1216,
                seed: 123,
                qualityToggle: false,
                autoSmea: false,
                ucPreset: 3,
                cfg_rescale: 0.25,
                v5QualityPresetId: 'light',
                v5UcPresetId: 'furryFocus',
                transparentBackground: true,
                variety_boost: false,
                sm: false,
                sm_dyn: false,
                decrisper: false,
            },
        };

        const exported = exportPreset(source);
        const { preset, warnings } = parsePresetData(exported, () => 'round-trip-id');

        assert.equal(exported.version, 2);
        assert.deepEqual(preset, { ...source, id: 'round-trip-id' });
        assert.deepEqual(warnings, []);
    } finally {
        globalThis.prompt = originalPrompt;
    }
});

test('rejects missing and unknown parameter preset versions', () => {
    const base = { type: 'novel-draw-preset', preset: { params: {} } };
    assert.throws(() => parsePresetData(base, () => 'id'), /版本.*缺失/);
    assert.throws(() => parsePresetData({ ...base, version: 3 }, () => 'id'), /版本.*3/);
});
