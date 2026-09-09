import assert from 'node:assert/strict';
import test from 'node:test';

import {
    getNovelModelCapability,
    getNovelModelCapabilitiesForUi,
    NOVEL_MODEL_IDS,
} from '../novel-model-capabilities.js';
import { getPromptChainPreview } from '../novel-prompts.js';

test('enables the V5 transport only for the two confirmed NovelAI model IDs', () => {
    for (const model of Object.values(NOVEL_MODEL_IDS)) {
        assert.deepEqual(getNovelModelCapability(model), {
            family: 'v5',
            transport: 'msgpack-stream',
            promptGuide: 'v5',
            centerMode: 'normalized',
            maxCharactersPerImage: 22,
            supportsV5Presets: true,
            supportsTransparentBackground: true,
        });
    }

    for (const model of ['nai-diffusion-4-5-full', 'nai-diffusion-5', 'NAI-DIFFUSION-5-FULL', 'custom-v5']) {
        assert.equal(getNovelModelCapability(model).family, 'legacy');
        assert.equal(getNovelModelCapability(model).transport, 'image');
        assert.equal(getNovelModelCapability(model).centerMode, 'grid');
    }
});

test('publishes the same V5 capability facts to the settings UI', () => {
    const capabilities = getNovelModelCapabilitiesForUi();
    for (const model of Object.values(NOVEL_MODEL_IDS)) {
        assert.deepEqual(capabilities[model], getNovelModelCapability(model));
    }
});

// The preview must show the model exactly the coordinate system its family uses; naming the
// grid to a V5 model would introduce a coordinate system it should never consider.
test('previews the center field description of the selected model family only', () => {
    const fieldsFor = (model) => getPromptChainPreview({}, model)
        .find(item => item.role === 'tools')
        .fields;
    const v5Center = fieldsFor(NOVEL_MODEL_IDS.V5_FULL).find(field => field.path === 'images[].characters[].center');
    const legacyCenter = fieldsFor('custom-model').find(field => field.path === 'images[].characters[].center');

    assert.match(v5Center.description, /\(0, 0\).*\(1, 1\)/);
    assert.doesNotMatch(v5Center.description, /A–E|网格/);
    assert.match(legacyCenter.description, /A–E/);
});
