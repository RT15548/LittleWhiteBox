import assert from 'node:assert/strict';
import test from 'node:test';

import {
    getEffectiveNovelModelGuide,
    getNovelPromptGuideId,
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
