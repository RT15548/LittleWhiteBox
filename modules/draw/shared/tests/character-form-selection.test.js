import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCharacterLibrary } from '../character-library.js';
import { assembleCharacterPrompts, removeDuplicateTags } from '../character-prompts.js';
import { findEnabledCharacterForm } from '../character-selection.js';
import { expandCharacterForms } from '../character-forms.js';
import { detectPresentCharacters } from '../present-characters.js';
import { parseSubmittedScenePlan } from '../scene-plan-contract.js';

// 智能体用 name（正式名称 / 别名）指角色、form 指形态（缺省 / 不存在 / 已停用回落第一个启用形态）；
// 展开后的 `名称（形态名）` 不能当 name 用；拼接时服装 / 动作里与固定外貌重复的 tag 去掉。

const SI = {
    id: 'c1',
    name: '司盈昃',
    aliases: ['渔行歌'],
    formName: '人形',
    type: 'boy',
    appearance: 'black hair, red eyes',
    forms: [
        { id: 'f-fish', name: '鱼形', type: 'no_humans', appearance: 'white fish, glowing scales' },
        { id: 'f-dragon', name: '龙形', type: 'no_humans', appearance: 'white chinese dragon, cyan hair, starlight particles, glowing water scales', enabled: false },
    ],
};
const PLAIN = { id: 'c2', name: 'Alice', aliases: ['Al'], type: 'girl', appearance: 'silver hair' };
const SOURCE = { sourceHash: 'h', points: [{ number: 1, offset: 0 }] };

function library(...characters) {
    return normalizeCharacterLibrary({ characters, groups: [] }).characters;
}

function parseChars(chars, present) {
    const plan = parseSubmittedScenePlan({
        toolCalls: [{ name: 'submit_scene_plan', arguments: { images: [{ insert_after: 1, scene: 'night sky', characters: chars }] } }],
    }, { presentCharacters: present, sceneSource: SOURCE });
    return plan.tasks[0].chars;
}

/** 解析 + 拼接：返回每个角色最终的 [名称, 正向提示词]。 */
function resolve(chars, known, text = known.map(c => c.name).join(' ')) {
    const present = detectPresentCharacters(text, known);
    return assembleCharacterPrompts(parseChars(chars, present), known).map(item => [item.name, item.prompt]);
}

const action = { action: 'standing' };

test('contract: name stays the official name, form is the chosen form (trimmed, optional)', () => {
    const known = library(SI);
    const present = detectPresentCharacters('渔行歌', known);
    const [withForm, withoutForm, empty] = parseChars([
        { name: '渔行歌', form: ' 鱼形 ', ...action },
        { name: '渔行歌', ...action },
        { name: '渔行歌', form: '', ...action },
    ], present);
    assert.deepEqual([withForm.form, withoutForm.form, empty.form], ['鱼形', '人形', '人形']);
    assert.deepEqual([withForm.name, withoutForm.name, empty.name], ['司盈昃', '司盈昃', '司盈昃']);
    assert.throws(() => parseChars([{ name: '渔行歌', form: 3, ...action }], present));
});

test('resolution: form picks the form; missing, unknown or disabled form falls back to the first', () => {
    const known = library({ ...SI, forms: [SI.forms[0], { ...SI.forms[1], enabled: true }] });
    const nameOf = form => resolve([{ name: '渔行歌', ...(form === undefined ? {} : { form }), ...action }], known)[0][0];
    assert.equal(nameOf('鱼形'), '司盈昃（鱼形）');
    assert.equal(nameOf('龙形'), '司盈昃（龙形）');
    assert.equal(nameOf(' 龙形 '), '司盈昃（龙形）');
    assert.equal(nameOf(undefined), '司盈昃（人形）');
    assert.equal(nameOf('鳗形'), '司盈昃（人形）');
    assert.equal(nameOf(''), '司盈昃（人形）');
    const disabled = library(SI);
    assert.equal(resolve([{ name: '渔行歌', form: '龙形', ...action }], disabled)[0][0], '司盈昃（人形）');
    assert.equal(resolve([{ name: '司盈昃', form: '鱼形', ...action }], disabled)[0][0], '司盈昃（鱼形）');
});

test('resolution: 名称（形态名） is not a name: it is an unknown character that needs its own appearance', () => {
    const known = library(SI);
    const present = detectPresentCharacters('司盈昃', known);
    assert.throws(() => parseChars([{ name: '司盈昃（鱼形）', ...action }], present));
    const [[name, prompt]] = resolve([{ name: '司盈昃（鱼形）', appear: 'grey fish', ...action }], known);
    assert.equal(name, '司盈昃（鱼形）');
    assert.equal(prompt, 'grey fish, standing');
    const expanded = expandCharacterForms(known);
    assert.equal(findEnabledCharacterForm('司盈昃（鱼形）', '鱼形', expanded), undefined);
    assert.equal(assembleCharacterPrompts([{ name: '司盈昃（鱼形）' }], known)[0].prompt, '');
});

test('resolution: single-form and unknown characters ignore form', () => {
    const known = library(PLAIN, SI);
    const [alice, nobody] = resolve([
        { name: 'Al', form: '鱼形', ...action },
        { name: '路人', form: '鱼形', type: 'boy', appear: 'short hair', ...action },
    ], known, 'Alice');
    assert.equal(alice[0], 'Alice');
    assert.ok(alice[1].startsWith('girl, silver hair'));
    assert.equal(nobody[0], '路人');
    assert.ok(!nobody[1].includes('fish'));
    // 直接拼接（不经合同层）时同样按 form 选形态
    assert.equal(assembleCharacterPrompts([{ name: '渔行歌', form: '鱼形' }], known)[0].name, '司盈昃（鱼形）');
    const expanded = expandCharacterForms(known);
    assert.equal(findEnabledCharacterForm('Al', '鱼形', expanded).name, 'Alice');
    assert.equal(findEnabledCharacterForm('路人', '鱼形', expanded), undefined);
});

test('removeDuplicateTags: exact, case / underscore, order and empty results', () => {
    const fixed = 'no_humans, white fish, Glowing_Scales';
    assert.equal(removeDuplicateTags('swimming, white fish, glowing scales, resting', fixed), 'swimming, resting');
    assert.equal(removeDuplicateTags('WHITE_FISH，no humans、 calm', fixed), 'calm');
    assert.equal(removeDuplicateTags('b, a, c', fixed), 'b, a, c');
    assert.equal(removeDuplicateTags('white fish, glowing scales', fixed), '');
    assert.equal(removeDuplicateTags('', fixed), '');
    assert.equal(removeDuplicateTags(undefined, fixed), '');
    assert.equal(removeDuplicateTags('white fish, smile', ''), 'white fish, smile');
    assert.equal(removeDuplicateTags('smile, Smile, smile', fixed), 'smile');
});

test('removeDuplicateTags: weight syntax is stripped on the fixed side only', () => {
    const fixed = '1.5::very long black hair::, (red eyes:1.2), {blue ribbon}, [pale skin], 0.8::sharp teeth, claws::';
    assert.equal(
        removeDuplicateTags('very long black hair, red eyes, blue ribbon, pale skin, sharp teeth, claws, smile', fixed),
        'smile',
    );
    // AI 一侧自己带权重 / 括号语法的 tag 是有意写法，不去掉
    assert.equal(
        removeDuplicateTags('1.5::red eyes::, (blue ribbon:1.1), {pale skin}, [claws], smile', fixed),
        '1.5::red eyes::, (blue ribbon:1.1), {pale skin}, [claws], smile',
    );
});

test('regression: bare alias with form 鱼形 uses the fish form once, without the human type or tags', () => {
    const known = library(SI);
    const [[name, prompt]] = resolve([{
        name: '渔行歌',
        form: '鱼形',
        action: 'swimming, white fish, glowing scales, resting near sunken wood',
    }], known);
    assert.equal(name, '司盈昃（鱼形）');
    assert.equal(prompt, 'no humans, white fish, glowing scales, swimming, resting near sunken wood');
    assert.equal(prompt.split('white fish, glowing scales').length - 1, 1);
    assert.ok(!/\bboy\b/.test(prompt) && !prompt.includes('black hair'));
});
