import assert from 'node:assert/strict';
import test from 'node:test';
import { assembleCharacterPrompts } from '../character-prompts.js';
import { dedupeTaskTags } from '../character-field-dedupe.js';

// 同一个词只留优先级最高的一处：外貌（固定外貌 / appear）> costume > action > scene。
// 不同角色之间互不比较；带权重的词保留；costume / appear 原样不动（着装记忆读的是它们）。

const known = [{ id: 'c1', name: '角色甲', type: 'girl', appearance: 'white hair, small_white_dragon_horns' }];
const present = [{ name: '角色甲', appearance: 'white hair, small_white_dragon_horns' }];
const task = (chars, scene = '') => ({ index: 1, scene, chars });

test('action drops tags already in costume or the fixed appearance, and the assembled prompt writes each of them once', () => {
    const [deduped] = dedupeTaskTags([task([{
        name: '角色甲',
        costume: 'nude, wet body, pale greenish dragon tail with white hair',
        // 尾巴在 costume 里、角在固定外貌里：只有 dedupeTaskTags 会动 action（assembleCharacterPrompts 只管最终拼接）。
        action: 'sitting, Pale_Greenish_Dragon_Tail_With_White_Hair, Small_White_Dragon_Horns, looking at another',
    }])], { presentCharacters: present });
    assert.equal(deduped.chars[0].action, 'sitting, looking at another');
    assert.equal(deduped.chars[0].costume, 'nude, wet body, pale greenish dragon tail with white hair');
    const [{ prompt }] = assembleCharacterPrompts(deduped.chars, known);
    assert.equal(prompt.split('dragon tail').length - 1, 1, 'the tail is written once');
    assert.equal(prompt.split('horns').length - 1, 1, 'the horns are written once (fixed appearance wins)');
});

test('a registered character: tags of the fixed appearance are removed from action, the fixed appearance itself is untouched', () => {
    const [deduped] = dedupeTaskTags([task([{ name: '角色甲', costume: 'nude', action: 'White_Hair, standing, small white dragon horns' }])], { presentCharacters: present });
    assert.equal(deduped.chars[0].action, 'standing');
    assert.equal(deduped.chars[0].costume, 'nude');
    assert.deepEqual(present, [{ name: '角色甲', appearance: 'white hair, small_white_dragon_horns' }]);
});

test('multi-form character: the form picked by name + form (alias, case and spaces tolerated) supplies the fixed appearance', () => {
    const forms = [
        { name: '路（人形）', baseName: '路', formName: '人形', aliases: ['小路'], appearance: 'red hair, human ears' },
        { name: '路（兽形）', baseName: '路', formName: '兽形', aliases: ['小路'], appearance: 'blue fur, wolf ears' },
    ];
    const action = 'blue fur, red hair, human ears, wolf ears, standing';
    const actionOf = (char, presentCharacters = forms) => dedupeTaskTags([task([{ ...char, action }])], { presentCharacters })[0].chars[0].action;
    assert.equal(actionOf({ name: '路', form: '兽形' }), 'red hair, human ears, standing');
    assert.equal(actionOf({ name: '路', form: '人形' }), 'blue fur, wolf ears, standing');
    assert.equal(actionOf({ name: '小路', form: ' 兽形 ' }), 'red hair, human ears, standing', 'alias + padded form');
    assert.equal(actionOf({ name: '路' }), 'blue fur, wolf ears, standing', 'no form: the first form');
    assert.equal(actionOf({ name: '路', form: '不存在' }), 'blue fur, wolf ears, standing', 'unknown form: the first form');
    // 与最终拼接选的是同一份外貌：兽形的固定外貌在 action 里被去掉，拼接后只写一次。
    const library = [{ id: 'k', name: '路', aliases: ['小路'], type: 'girl', appearance: 'red hair, human ears', formName: '人形', forms: [{ name: '兽形', type: 'girl', appearance: 'blue fur, wolf ears' }] }];
    const char = { name: '小路', form: ' 兽形 ', action: 'blue fur, standing' };
    const [deduped] = dedupeTaskTags([task([char])], { presentCharacters: forms });
    assert.equal(deduped.chars[0].action, 'standing');
    const [{ prompt }] = assembleCharacterPrompts(deduped.chars, library);
    assert.equal(prompt.split('blue fur').length - 1, 1);
    assert.ok(!prompt.includes('red hair'), 'only the picked form is written');
});

test('unregistered character: action also drops tags already in appear', () => {
    const [deduped] = dedupeTaskTags([task([{
        name: '路人',
        appear: 'black hair, red eyes',
        costume: 'grey robe, dragon tail',
        action: 'standing, dragon tail, red eyes, looking away',
    }])]);
    assert.equal(deduped.chars[0].action, 'standing, looking away');
    assert.equal(deduped.chars[0].appear, 'black hair, red eyes');
});

test('scene drops tags that belong to a character (appear, fixed appearance, costume, action)', () => {
    const [deduped] = dedupeTaskTags([task([
        { name: '角色甲', costume: 'nude, pale greenish dragon tail with white hair', action: 'sitting, blush' },
        { name: '路人', appear: 'black hair', costume: 'grey robe', action: 'standing' },
    ], 'duo, hot spring, pale greenish dragon tail with white hair, small white dragon horns, black hair, grey robe, sitting, steam')], { presentCharacters: present });
    assert.equal(deduped.scene, 'duo, hot spring, steam');
});

test('a scene whose every tag belongs to a character is kept as it was (the plan contract needs a non-empty scene)', () => {
    const scene = 'Wet_Hair, standing, black hair';
    const [deduped] = dedupeTaskTags([task([{ name: '路人', appear: 'black hair', costume: 'wet hair', action: 'standing' }], scene)]);
    assert.equal(deduped.scene, scene);
    assert.equal(deduped.chars[0].action, 'standing');
});

test('a task without a scene does not gain a scene key', () => {
    const noScene = { index: 1, chars: [{ name: '路人', appear: 'black hair', costume: 'wet hair', action: 'standing, wet hair' }] };
    const [deduped] = dedupeTaskTags([noScene]);
    assert.equal(deduped.chars[0].action, 'standing');
    assert.equal(Object.hasOwn(deduped, 'scene'), false);
});

test('different characters may share the same tag, and scene tags only some other character has stay', () => {
    const [deduped] = dedupeTaskTags([task([
        { name: 'A', appear: 'black hair', costume: 'wet hair, smile', action: 'standing, smile' },
        { name: 'B', appear: 'red hair', costume: 'wet hair, smile', action: 'sitting, smile' },
    ], 'duo, indoors')]);
    assert.equal(deduped.chars[0].costume, 'wet hair, smile');
    assert.equal(deduped.chars[1].costume, 'wet hair, smile');
    assert.equal(deduped.chars[0].action, 'standing');
    assert.equal(deduped.chars[1].action, 'sitting');
    assert.equal(deduped.scene, 'duo, indoors');
});

test('weighted tags are kept, and tasks without duplicates are returned as they are', () => {
    const plain = task([{ name: '角色甲', costume: 'dragon tail', action: 'sitting' }], 'hot spring');
    const weighted = task([{ name: '角色甲', costume: 'dragon tail', action: '1.2::dragon tail::, sitting' }], '0.5::nsfw::, 1.2::sitting::');
    const out = dedupeTaskTags([plain, weighted]);
    assert.equal(out[0], plain);
    assert.equal(out[1].chars[0].action, '1.2::dragon tail::, sitting');
    assert.equal(out[1].scene, '0.5::nsfw::, 1.2::sitting::');
    assert.equal(dedupeTaskTags(null), null);
});
