import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { parseNovelPromptPresetImport, promptTemplateExportVersion } from '../novel-prompt-import.js';
import {
    addBlock,
    createCustomBlock,
    createDefaultLayout,
    moveBlock,
} from '../../../shared/scene-planner-layout.js';

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
    });
});

test('ignores the retired V3 model-contract overrides instead of carrying them into runtime data', () => {
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

    assert.deepEqual(result, {
        name: 'advanced preset',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: { v5: 'custom V5 guide' },
    });
});

test('rejects unknown formats instead of leaking old fields into runtime data', () => {
    assert.throws(
        () => parseNovelPromptPresetImport({ ...v1('guide'), _version: 5 }),
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
            modelGuideOverrides: [],
        }),
        /V3 提示词模板的 modelGuideOverrides 格式无效/,
    );
});

// ── V4：消息布局 ────────────────────────────────────────

function v4(extra = {}) {
    return {
        _type: TYPE,
        _version: 4,
        name: 'layout preset',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: { v5: 'custom V5 guide' },
        ...extra,
    };
}

function customLayout() {
    const block = createCustomBlock({ role: 'system', name: '补充', content: '额外要求', enabled: true }, [], () => 0.25);
    return moveBlock(addBlock(createDefaultLayout(), block), 'opening', 1);
}

test('imports a V4 template with a custom layout and returns it in storage shape', () => {
    const layout = customLayout();
    const result = parseNovelPromptPresetImport(v4({ layout }));
    assert.deepEqual(result, {
        name: 'layout preset',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: { v5: 'custom V5 guide' },
        layout,
    });
    assert.notEqual(result.layout, layout, '返回的是规范化后的新副本');
});

test('a V4 template without layout, or with a default one, returns no layout key at all (strictly like V3)', () => {
    const expected = {
        name: 'layout preset',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: { v5: 'custom V5 guide' },
    };
    assert.deepEqual(parseNovelPromptPresetImport(v4()), expected);
    assert.deepEqual(parseNovelPromptPresetImport(v4({ layout: null })), expected);
    assert.deepEqual(parseNovelPromptPresetImport(v4({ layout: createDefaultLayout() })), expected);
    assert.equal('layout' in parseNovelPromptPresetImport(v4({ layout: createDefaultLayout() })), false);
    assert.equal('layoutNotes' in parseNovelPromptPresetImport(v4()), false);
});

test('files older than V4 ignore a layout field instead of importing it', () => {
    for (const version of [2, 3]) {
        const result = parseNovelPromptPresetImport({ ...v4({ layout: customLayout() }), _version: version });
        assert.equal('layout' in result, false, `V${version}`);
        assert.equal('layoutNotes' in result, false, `V${version}`);
    }
    const legacy = parseNovelPromptPresetImport({ ...v1('guide'), layout: customLayout() });
    assert.equal('layout' in legacy, false);
});

test('a V4 layout that needs repair is repaired and the repairs are reported', () => {
    const result = parseNovelPromptPresetImport(v4({
        layout: {
            version: 1,
            blocks: [
                { id: 'content' },
                { id: 'content' },
                { id: 'msg-keep', role: 'user', name: ' 保留 ', content: 'x', enabled: true },
                'junk',
            ],
        },
    }));
    assert.deepEqual(result.layout.blocks.map(block => block.id).filter(id => id === 'msg-keep' || id === 'content'), ['content', 'msg-keep']);
    assert.equal(result.layout.blocks.length, 9, '缺失的内置块被补回');
    assert.ok(Array.isArray(result.layoutNotes) && result.layoutNotes.length >= 2);
    assert.match(result.layoutNotes.join('|'), /重复的内置块/);
    assert.match(result.layoutNotes.join('|'), /补回了缺失的内置块/);
});

test('a V4 layout of the wrong type is an error, not silently the default', () => {
    for (const layout of ['oops', 7, true, [], [{ id: 'opening' }]]) {
        assert.throws(() => parseNovelPromptPresetImport(v4({ layout })), /V4 提示词模板的 layout 格式无效/, JSON.stringify(layout));
    }
});

test('export version: default or missing layouts stay V3 so older releases can import, custom layouts are V4 so they refuse explicitly', () => {
    assert.equal(promptTemplateExportVersion(undefined), 3);
    assert.equal(promptTemplateExportVersion(null), 3);
    assert.equal(promptTemplateExportVersion(createDefaultLayout()), 3);
    assert.equal(promptTemplateExportVersion({ version: 1, blocks: [] }), 3, '缺失内置块补回后就是默认');
    assert.equal(promptTemplateExportVersion(customLayout()), 4);
    assert.equal(promptTemplateExportVersion(moveBlock(createDefaultLayout(), 'opening', 1)), 4, '只调顺序也算自定义');
});

test('export then import round-trips a custom layout, and an old-release importer refuses the V4 file', () => {
    const layout = customLayout();
    const exported = JSON.parse(JSON.stringify({
        _type: TYPE,
        _version: promptTemplateExportVersion(layout),
        name: 'round trip',
        topSystem: 'system',
        sceneRules: 'rules',
        modelGuideOverrides: {},
        layout,
    }));
    const imported = parseNovelPromptPresetImport(exported);
    assert.deepEqual(imported.layout, layout);
    // 旧版本的白名单是 1..3：V4 文件必然落到“不支持的版本”这条明确的错误上。
    assert.equal([1, 2, 3].includes(exported._version), false);
});
