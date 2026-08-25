import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parseNovelPromptPresetImport } from '../novel-prompt-import.js';

const TYPE = 'novel-draw-prompt-template';

async function loadReleasedV1Guide() {
    const text = await readFile(
        new URL('./fixtures/novel-settings-upstream-v7.json', import.meta.url),
        'utf8',
    );
    return JSON.parse(text).promptPresets[0].tagGuideContent;
}

function v1(tagGuideContent) {
    return {
        _type: TYPE,
        _version: 1,
        topSystem: 'system',
        sceneRules: 'rules',
        tagGuideContent,
    };
}

test('imports a released V1 default without pinning the bundled V4.5 guide', async () => {
    const result = parseNovelPromptPresetImport(v1(await loadReleasedV1Guide()), {
        fallbackName: 'legacy preset',
    });

    assert.equal(result.name, 'legacy preset');
    assert.deepEqual(result.modelGuideOverrides, {});
});

test('converts edited and intentionally empty V1 guides into V4.5 overrides', () => {
    assert.deepEqual(
        parseNovelPromptPresetImport(v1('custom guide')).modelGuideOverrides,
        { 'v4.5': 'custom guide' },
    );
    assert.deepEqual(
        parseNovelPromptPresetImport(v1('')).modelGuideOverrides,
        { 'v4.5': '' },
    );
});

test('round-trips the current V2 optional model guide overrides', () => {
    const result = parseNovelPromptPresetImport({
        _type: TYPE,
        _version: 2,
        name: '  current preset  ',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: {
            'v4.5': '',
            v5: 'custom V5 guide',
        },
    });

    assert.deepEqual(result, {
        name: 'current preset',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: {
            'v4.5': '',
            v5: 'custom V5 guide',
        },
        modelContractOverrides: {},
    });
});

test('round-trips V3 model-contract overrides', () => {
    const result = parseNovelPromptPresetImport({
        _type: TYPE,
        _version: 3,
        name: 'advanced preset',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: { v5: 'custom V5 guide' },
        modelContractOverrides: {
            'v4.5': 'custom grid contract',
            v5: '',
        },
    });

    assert.deepEqual(result.modelContractOverrides, {
        'v4.5': 'custom grid contract',
        v5: '',
    });
});

test('rejects unknown formats instead of leaking old fields into runtime data', () => {
    assert.throws(
        () => parseNovelPromptPresetImport({ ...v1('guide'), _version: 4 }),
        /不支持的提示词模板版本/,
    );
    assert.throws(
        () => parseNovelPromptPresetImport({ ...v1('guide'), _type: 'sd-prompt-template' }),
        /不是有效的提示词模板文件/,
    );
    assert.throws(
        () => parseNovelPromptPresetImport({
            _type: TYPE,
            _version: 2,
            topSystem: 'system',
            sceneRules: 'rules',
            modelGuideOverrides: { future: 'unsupported' },
        }),
        /无效的模型指南覆盖/,
    );
    assert.throws(
        () => parseNovelPromptPresetImport({
            _type: TYPE,
            _version: 2,
            topSystem: 'system',
            sceneRules: 'rules',
            modelGuideOverrides: { v5: 5 },
        }),
        /无效的模型指南覆盖/,
    );
    assert.throws(
        () => parseNovelPromptPresetImport({
            _type: TYPE,
            _version: 3,
            topSystem: 'system',
            sceneRules: 'rules',
            modelContractOverrides: { future: 'unsupported' },
        }),
        /无效的模型契约覆盖/,
    );
    assert.throws(
        () => parseNovelPromptPresetImport({
            _type: TYPE,
            _version: 3,
            topSystem: 'system',
            sceneRules: 'rules',
            modelGuideOverrides: [],
        }),
        /V3 提示词模板的 modelGuideOverrides 格式无效/,
    );
});
