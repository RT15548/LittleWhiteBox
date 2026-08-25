import assert from 'node:assert/strict';
import test from 'node:test';

import {
    getDefaultNovelModelContractByGuideId,
    getEffectiveNovelModelContract,
    getEffectiveNovelModelGuide,
    getNovelPromptGuideId,
    normalizeNovelModelContractOverrides,
    normalizeNovelPromptGuideOverrides,
} from '../novel-prompts.js';

test('selects the editable guide override for the current NovelAI model family', () => {
    const preset = {
        modelGuideOverrides: {
            'v4.5': 'custom V4.5 guide',
            v5: 'custom V5 guide',
        },
    };

    assert.equal(getNovelPromptGuideId('nai-diffusion-4-5-full'), 'v4.5');
    assert.equal(getEffectiveNovelModelGuide('nai-diffusion-4-5-full', preset), 'custom V4.5 guide');
    assert.equal(getNovelPromptGuideId('nai-diffusion-5-full'), 'v5');
    assert.equal(getEffectiveNovelModelGuide('nai-diffusion-5-full', preset), 'custom V5 guide');
});

test('preserves an intentional empty guide while dropping unsupported override keys', () => {
    assert.deepEqual(normalizeNovelPromptGuideOverrides({
        'v4.5': '',
        v5: 'V5 guide',
        future: 'unsupported',
    }), {
        'v4.5': '',
        v5: 'V5 guide',
    });
});

test('selects editable model-contract overrides without mixing model families', () => {
    const preset = {
        modelContractOverrides: {
            'v4.5': 'custom grid contract',
            v5: 'custom normalized contract',
        },
    };

    assert.equal(getEffectiveNovelModelContract('nai-diffusion-4-5-full', preset), 'custom grid contract');
    assert.equal(getEffectiveNovelModelContract('nai-diffusion-5-full', preset), 'custom normalized contract');
    assert.equal(getEffectiveNovelModelContract('nai-diffusion-5-full', {
        modelContractOverrides: { v5: '' },
    }), '');
    assert.match(getDefaultNovelModelContractByGuideId('v4.5'), /A1-E5/);
    assert.match(getDefaultNovelModelContractByGuideId('v5'), /归一化坐标对象/);
    assert.deepEqual(normalizeNovelModelContractOverrides({
        'v4.5': 'grid',
        v5: 'normalized',
        future: 'unsupported',
    }), {
        'v4.5': 'grid',
        v5: 'normalized',
    });
});
