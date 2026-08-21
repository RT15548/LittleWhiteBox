import assert from 'node:assert/strict';
import test from 'node:test';

import {
    getNovelModelCapability,
    getNovelModelCapabilitiesForUi,
    getNovelScenePlannerContract,
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

test('describes each model family center contract', () => {
    assert.match(getNovelScenePlannerContract(NOVEL_MODEL_IDS.V5_FULL), /归一化坐标对象/);
    assert.match(getNovelScenePlannerContract(NOVEL_MODEL_IDS.V5_FULL), /不要输出 A1-E5/);
    assert.match(getNovelScenePlannerContract(NOVEL_MODEL_IDS.V5_FULL), /每个实际可见角色.*独立/);
    assert.match(getNovelScenePlannerContract(NOVEL_MODEL_IDS.V5_FULL), /不得.*合并多个角色/);
    assert.match(getNovelScenePlannerContract('custom-model'), /A1-E5/);
});

test('publishes the same V5 capability facts to the settings UI', () => {
    const capabilities = getNovelModelCapabilitiesForUi();
    for (const model of Object.values(NOVEL_MODEL_IDS)) {
        assert.deepEqual(capabilities[model], getNovelModelCapability(model));
    }
});

test('shows the automatically injected model contract in the prompt-chain preview', () => {
    const chain = getPromptChainPreview({}, NOVEL_MODEL_IDS.V5_FULL);
    const modelContract = chain
        .flatMap(item => item.sections || [])
        .find(section => section.key === 'modelContract');

    assert.match(modelContract?.content || '', /归一化坐标对象/);
    assert.match(modelContract?.content || '', /每个实际可见角色.*独立/);
});
