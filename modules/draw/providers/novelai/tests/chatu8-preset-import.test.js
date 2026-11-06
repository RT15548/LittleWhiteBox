import assert from 'node:assert/strict';
import test from 'node:test';
import { parseChatu8PresetFile } from '../cloud-presets.js';

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
