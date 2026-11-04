import assert from 'node:assert/strict';
import test from 'node:test';
import { collectPresetVibeExport, parsePresetVibeFragment, exportPreset, parsePresetData } from '../cloud-presets.js';
import { normalizeVibeEncodings, vibeEncodingKey, getVibeModelKey } from '../vibe.js';
import { buildNovelAIRequestBody } from '../compiler.js';

// Acceptance (paid encoding loss / wrong image request): model+info encoding
// survives save/share/import; generation and export use current choices, not group defaults.
const item = { id: 'one', name: 'reference', image: 'data:image/png;base64,AQID',
    infoExtracted: 0.65, encodings: { 'v4-5full@0.65': 'paid-encoding' } };
test('encoding keys retain independent model and information values', () => {
    const encodings = { ...item.encodings, 'v4full@1.00': 'other', 'v4-5full@0.30': 'third' };
    assert.deepEqual(normalizeVibeEncodings(encodings), encodings);
    assert.equal(vibeEncodingKey(getVibeModelKey('nai-diffusion-4-5-full'), .65), 'v4-5full@0.65');
    assert.equal(getVibeModelKey('nai-diffusion-5'), null);
});
test('preset share preserves actual disabled/strength selection rather than source group', () => {
    const preset = { id: 'p', name: 'preset', params: {}, vibe: { groupId: 'g',
        selections: [{ id: 'one', enabled: false, strength: .2 }] } };
    const library = { singles: [item], groups: [{ id: 'g', members: [{ id: 'one', enabled: true, strength: 1 }] }] };
    const fragment = collectPresetVibeExport(preset, library);
    assert.equal(fragment.references[0].enabled, false);
    assert.equal(fragment.references[0].strength, .2);
    let n = 0;
    const imported = parsePresetData(exportPreset(preset, library, { interactive: false }), () => 'p2', () => 'v' + ++n);
    assert.deepEqual(imported.vibeImports[0].encodings, item.encodings);
    assert.equal(imported.preset.vibe.selections[0].enabled, false);
    assert.deepEqual(parsePresetVibeFragment({ group: { members: [] } }, () => 'id').vibe.selections, []);
});
test('V4 compiler sends reference and strength together, unselected references are omitted', () => {
    const args = { scene: 'offline', negativePrompt: '', seed: 1, params: { model: 'nai-diffusion-4-5-full', width: 832, height: 1216 },
        vibeReferences: [{ encoding: 'paid-encoding', strength: .3 }] };
    const result = buildNovelAIRequestBody(args);
    assert.equal(result.parameters.reference_image_multiple_cached[0].data, 'paid-encoding');
    assert.deepEqual(result.parameters.reference_strength_multiple, [.3]);
    assert.equal(buildNovelAIRequestBody({ ...args, vibeReferences: [] }).parameters.reference_image_multiple_cached, undefined);
});
