import assert from 'node:assert/strict';
import test from 'node:test';

import { NOVEL_MODEL_IDS } from '../novel-model-capabilities.js';
import {
    buildNovelV5RequestBody,
    V5_QUALITY_PRESETS,
    V5_UC_PRESETS,
} from '../novel-v5-request.js';

test('builds the confirmed V5 multipart JSON contract with shared character coordinates', () => {
    const body = buildNovelV5RequestBody({
        scene: '1girl, happy',
        characterPrompts: [{
            prompt: 'girl, silver hair',
            uc: 'hat',
            center: { x: 0.25, y: 0.75 },
        }],
        negativePrompt: 'bad',
        params: {
            model: ` ${NOVEL_MODEL_IDS.V5_FULL} `,
            width: 832,
            height: 1216,
            scale: 7,
            steps: 23,
            sampler: 'k_euler_ancestral',
            scheduler: 'karras',
            v5QualityPresetId: 'standard',
            v5UcPresetId: 'heavy',
        },
        seed: 123456,
    });

    assert.equal(body.model, NOVEL_MODEL_IDS.V5_FULL);
    assert.equal(body.input, `1girl, happy, ${V5_QUALITY_PRESETS.standard}`);
    assert.equal(body.parameters.params_version, 4);
    assert.equal(body.parameters.stream, 'msgpack');
    assert.equal(body.parameters.image_format, 'png');
    assert.equal(body.parameters.qualityPresetId, 'standard');
    assert.equal(body.parameters.ucPresetId, 'heavy');
    assert.equal(body.parameters.negative_prompt, `nsfw, ${V5_UC_PRESETS.heavy}, bad`);
    assert.deepEqual(body.parameters.characterPrompts, [{
        prompt: 'girl, silver hair',
        uc: 'hat',
        center: { x: 0.25, y: 0.75 },
        enabled: true,
    }]);
    assert.deepEqual(body.parameters.v4_prompt.caption.char_captions, [{
        char_caption: 'girl, silver hair',
        centers: [{ x: 0.25, y: 0.75 }],
    }]);
    assert.deepEqual(body.parameters.v4_negative_prompt.caption.char_captions, [{
        char_caption: 'hat',
        centers: [{ x: 0.25, y: 0.75 }],
    }]);
    assert.equal(body.parameters.v4_prompt.use_coords, true);
    assert.equal(body.parameters.v4_prompt.use_order, true);
    assert.equal(body.parameters.tag_hint_transparent_background, undefined);
    assert.equal(body.use_new_shared_trial, true);
});

test('applies V5 transparent-background and preset semantics without duplicating automatic text', () => {
    const body = buildNovelV5RequestBody({
        scene: '1girl\nText: A green handwritten greeting',
        negativePrompt: '',
        params: {
            model: NOVEL_MODEL_IDS.V5_CURATED,
            transparentBackground: true,
            v5QualityPresetId: 'light',
            v5UcPresetId: 'none',
        },
        seed: 1,
    });

    assert.equal(
        body.input,
        `1girl, transparent background, ${V5_QUALITY_PRESETS.light}\nText: A green handwritten greeting`,
    );
    assert.equal(body.parameters.tag_hint_transparent_background, true);
    assert.equal(body.parameters.negative_prompt, '');
    assert.equal(body.parameters.v4_negative_prompt.caption.base_caption, '');

    const explicit = buildNovelV5RequestBody({
        scene: '1girl, transparent background, masterpiece',
        negativePrompt: 'nsfw, bad',
        params: {
            model: NOVEL_MODEL_IDS.V5_FULL,
            transparentBackground: true,
            v5QualityPresetId: 'none',
            v5UcPresetId: 'heavy',
        },
        seed: 2,
    });
    assert.equal(explicit.input, '1girl, transparent background, masterpiece');
    assert.equal(explicit.parameters.negative_prompt.startsWith('nsfw, nsfw,'), false);
});

test('falls back invalid V5 preset IDs to official defaults', () => {
    const body = buildNovelV5RequestBody({
        scene: '',
        params: {
            model: NOVEL_MODEL_IDS.V5_FULL,
            v5QualityPresetId: 'unknown',
            v5UcPresetId: 'unknown',
        },
        seed: 3,
    });

    assert.equal(body.parameters.qualityPresetId, 'standard');
    assert.equal(body.parameters.ucPresetId, 'heavy');
    assert.equal(body.input, V5_QUALITY_PRESETS.standard);
});

test('rejects a direct or refresh request that exceeds the V5 character limit', () => {
    assert.throws(
        () => buildNovelV5RequestBody({
            scene: 'group',
            characterPrompts: Array.from({ length: 23 }, (_, index) => ({
                prompt: `character ${index + 1}`,
            })),
            params: { model: NOVEL_MODEL_IDS.V5_FULL },
            seed: 4,
        }),
        /最多支持 22 个角色提示词/,
    );
});
