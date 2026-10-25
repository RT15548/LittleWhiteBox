import assert from 'node:assert/strict';
import test from 'node:test';

import { compileNovelImageRequest } from '../compiler.js';

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

test('overrideSize=auto 缺省方向回落竖幅 832x1216', () => {
    assert.deepEqual(
        compileSize({ recipeOverrides: { overrideSize: 'auto' } }),
        { width: 832, height: 1216 },
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

test('协议外方向值按竖幅兜底', () => {
    assert.deepEqual(
        compileSize({
            recipeOverrides: { overrideSize: 'auto' },
            requestOverrides: { orientation: 'square' },
        }),
        { width: 832, height: 1216 },
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
