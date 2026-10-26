import assert from 'node:assert/strict';
import test from 'node:test';

import { compile, compileNovelImageRequest } from '../compiler.js';
import { parseSubmittedScenePlan } from '../../../shared/scene-plan-contract.js';
import { prepareImageInput } from '../../../shared/prepared-image-input.js';

// Acceptance (paid request correctness): each planned orientation reaches its
// own request; a fixed size or the preset dimensions remain authoritative
// unless automatic orientation is explicitly selected.

function buildRecipe(overrides = {}) {
    return {
        apiBaseUrl: 'https://example.com',
        apiKey: 'test-key',
        timeout: 30000,
        requestDelay: { min: 0, max: 0 },
        autoLearnEnabled: false,
        autoLearnMode: 'new_only',
        overrideSize: 'default',
        resolveForBackend: false,
        params: {
            model: 'nai-diffusion-3',
            sampler: 'k_euler',
            scheduler: 'native',
            steps: 28,
            scale: 5,
            width: 832,
            height: 1216,
            seed: 1,
        },
        ...overrides,
    };
}

function compileSize({ recipeOverrides = {}, requestOverrides = {} } = {}) {
    const prepared = compileNovelImageRequest(
        { scene: 'test', characterPrompts: [], ...requestOverrides },
        buildRecipe(recipeOverrides),
        1234,
    );
    return {
        width: prepared.payload.parameters.width,
        height: prepared.payload.parameters.height,
    };
}

test('automatic sizing without planned orientation retains the preset dimensions', () => {
    assert.deepEqual(
        compileSize({ recipeOverrides: { overrideSize: 'auto' }, requestOverrides: { params: { ...buildRecipe().params, width: 1024, height: 1024 } } }),
        { width: 1024, height: 1024 },
    );
});

test('overrideSize=auto portrait 映射竖幅', () => {
    assert.deepEqual(
        compileSize({
            recipeOverrides: { overrideSize: 'auto' },
            requestOverrides: { orientation: 'portrait' },
        }),
        { width: 832, height: 1216 },
    );
});

test('overrideSize=auto landscape 映射横幅 1216x832', () => {
    assert.deepEqual(
        compileSize({
            recipeOverrides: { overrideSize: 'auto' },
            requestOverrides: { orientation: 'landscape' },
        }),
        { width: 1216, height: 832 },
    );
});

test('an unsupported orientation does not invent a new size', () => {
    for (const orientation of ['square', 'toString', '__proto__']) assert.deepEqual(
        compileSize({
            recipeOverrides: { overrideSize: 'auto' },
            requestOverrides: { orientation, params: { ...buildRecipe().params, width: 1024, height: 1024 } },
        }),
        { width: 1024, height: 1024 },
    );
});

test('显式具体尺寸不受 orientation 影响', () => {
    assert.deepEqual(
        compileSize({
            recipeOverrides: { overrideSize: '1024x1024' },
            requestOverrides: { orientation: 'landscape' },
        }),
        { width: 1024, height: 1024 },
    );
});

test('a mixed scene plan preserves each orientation in its paid request', () => {
    const scenePlan = parseSubmittedScenePlan({ toolCalls: [{
        name: 'submit_scene_plan',
        arguments: { images: ['portrait', 'landscape'].map((orientation, i) => ({
            index: i + 1, insert_after: 1, scene: 'outdoors', orientation, characters: [], title: '雨停后的街道',
        })) },
    }] }, { sceneSource: { sourceHash: 'fixture', points: [{ number: 1, offset: 10 }] } });
    const batch = compile(scenePlan, buildRecipe({ overrideSize: 'auto', seeds: [123, 456] }));
    assert.deepEqual(batch.items.map(item => [item.request.payload.parameters.width, item.request.payload.parameters.height]), [
        [832, 1216], [1216, 832],
    ]);
    const prepared = prepareImageInput('novelai', scenePlan, buildRecipe({ overrideSize: 'auto', seeds: [123, 456] }));
    assert.deepEqual(prepared.metadata.map(item => item.orientation), ['portrait', 'landscape']);
    assert.deepEqual(prepared.metadata.map(item => item.title), ['雨停后的街道', '雨停后的街道']);
});

test('following the preset does not override its dimensions with orientation', () => {
    assert.deepEqual(compileSize({
        requestOverrides: { orientation: 'landscape', params: { ...buildRecipe().params, width: 1024, height: 1024 } },
    }), { width: 1024, height: 1024 });
});
