import assert from 'node:assert/strict';
import test from 'node:test';
import { buildChatu8PresetFile, parseChatu8PresetFile } from '../cloud-presets.js';

let seq = 0;
const generateId = () => `preset-${++seq}`;

test('chatu8 import: maps fixed prompt fields and drops preview/vibe references', () => {
    const file = {
        presets: {
            '画师A': {
                fixedPrompt: 'artist:a, year 2025',
                fixedPrompt_end: 'masterpiece, best quality',
                negativePrompt: 'lowres, bad hands',
                previewImageId: 'img-1',
            },
            '画风B': {
                fixedPrompt: '3d, cinematic',
                negativePrompt: '',
                vibe: { groupId: 'g1', selections: [{ id: 'v1', enabled: true, strength: 0.6 }] },
            },
        },
        images: { 'img-1': 'data:image/png;base64,AAAA' },
    };
    const { presets, skippedPreviews, skippedVibes } = parseChatu8PresetFile(file, generateId);
    assert.equal(presets.length, 2);
    assert.equal(presets[0].name, '画师A');
    // 后置正向（质量词位）拼在前置之后，组成完整固定正向
    assert.equal(presets[0].positivePrefix, 'artist:a, year 2025, masterpiece, best quality');
    assert.equal(presets[0].negativePrefix, 'lowres, bad hands');
    assert.equal(presets[1].positivePrefix, '3d, cinematic');
    // 预览图与 Vibe 不互通：字段置空并计数
    assert.equal(presets[0].thumbnail, '');
    assert.deepEqual(presets[1].vibe, { groupId: '', selections: [] });
    assert.equal(skippedPreviews, 1);
    assert.equal(skippedVibes, 1);
    // 互通格式不含生图参数：落默认且每条独立（不共享引用）
    assert.equal(presets[0].params.model, 'nai-diffusion-4-5-full');
    assert.notEqual(presets[0].params, presets[1].params);
    // 数量/尺寸相关保持「不指定」，由 LLM 规划
    assert.equal(presets[0].maxImages, 0);
    assert.equal(presets[0].maxCharactersPerImage, 0);
    assert.equal(presets[0].overrideSize, 'default');
    // 每条都拿到新生成的 id
    assert.ok(presets[0].id && presets[1].id && presets[0].id !== presets[1].id);
});

test('chatu8 import: rejects non-chatu8 payloads and empty preset maps', () => {
    assert.throws(() => parseChatu8PresetFile(null, generateId), /智绘姬/);
    assert.throws(() => parseChatu8PresetFile({ presets: [] }, generateId), /智绘姬/);
    assert.throws(() => parseChatu8PresetFile({ presets: {} }, generateId), /没有/);
    assert.throws(() => parseChatu8PresetFile({ presets: { A: null, B: 42 } }, generateId), /没有/);
});

test('chatu8 export: batches presets with images segment and referenced vibes', () => {
    const vibeLibrary = {
        singles: [
            { id: 'v1', name: '光影', image: 'data:image/png;base64,AAA', thumbnail: 't1', infoExtracted: 0.7, encodings: { 'v4-5full@0.70': 'enc1' } },
            { id: 'v2', name: '未被引用', image: 'data:image/png;base64,BBB', thumbnail: '', infoExtracted: 1, encodings: {} },
        ],
        groups: [{ id: 'g1', name: '氛围组', members: [{ id: 'v1', enabled: false, strength: 0.4 }] }],
    };
    const paramsPresets = [
        {
            id: 'p1', name: '预设A', positivePrefix: 'artist:a', negativePrefix: 'lowres',
            thumbnail: 'data:image/jpeg;base64,CCC',
            vibe: { groupId: 'g1', selections: [] },
        },
        {
            id: 'p2', name: '预设B', positivePrefix: '', negativePrefix: 'bad hands',
            thumbnail: '',
            vibe: { groupId: '', selections: [{ id: 'v1', enabled: true, strength: 0.6 }, { id: 'ghost', enabled: true, strength: 0.5 }] },
        },
        { id: 'p3', name: '预设C', positivePrefix: 'x', negativePrefix: '', vibe: { groupId: '', selections: [] } },
    ];
    const file = buildChatu8PresetFile(paramsPresets, vibeLibrary);

    // presets：名称作键，正/负词映射，fixedPrompt_end 恒为空串
    assert.deepEqual(Object.keys(file.presets), ['预设A', '预设B', '预设C']);
    assert.equal(file.presets['预设A'].fixedPrompt, 'artist:a');
    assert.equal(file.presets['预设A'].fixedPrompt_end, '');
    assert.equal(file.presets['预设B'].negativePrompt, 'bad hands');

    // images：仅有缩略图的预设进段，previewImageId 回指
    assert.equal(file.presets['预设A'].previewImageId, 'preset-thumb-1');
    assert.equal(file.images['preset-thumb-1'], 'data:image/jpeg;base64,CCC');
    assert.equal(file.presets['预设B'].previewImageId, undefined);

    // vibes：只收集被引用项（v2 不出现）；组引用保留组 id，散装过滤失效 id
    assert.equal(file.presets['预设A'].vibe.groupId, 'g1');
    assert.deepEqual(file.presets['预设B'].vibe.selections, [{ id: 'v1', enabled: true, strength: 0.6 }]);
    assert.equal(file.presets['预设C'].vibe, undefined);
    assert.deepEqual(file.vibes.singles.map(s => s.id), ['v1']);
    assert.deepEqual(file.vibes.groups.map(g => g.id), ['g1']);
    assert.equal(file.vibes.singles[0].encodings['v4-5full@0.70'], 'enc1');
});

test('chatu8 export: omits empty images/vibes segments', () => {
    const file = buildChatu8PresetFile([
        { id: 'p1', name: '纯词', positivePrefix: 'a', negativePrefix: '', vibe: { groupId: '', selections: [] } },
    ], { singles: [], groups: [] });
    assert.equal('images' in file, false);
    assert.equal('vibes' in file, false);
});

test('chatu8 roundtrip: exported file imports back with prompts intact', () => {
    const file = buildChatu8PresetFile([
        { id: 'p1', name: '回环', positivePrefix: 'artist:a, year 2025', negativePrefix: 'lowres', thumbnail: 'data:image/png;base64,DDD', vibe: { groupId: '', selections: [] } },
    ]);
    const { presets, skippedPreviews } = parseChatu8PresetFile(file, generateId);
    assert.equal(presets.length, 1);
    assert.equal(presets[0].name, '回环');
    assert.equal(presets[0].positivePrefix, 'artist:a, year 2025');
    assert.equal(presets[0].negativePrefix, 'lowres');
    assert.equal(skippedPreviews, 1);
});
