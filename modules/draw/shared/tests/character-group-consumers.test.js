// 嵌套启用（有效启用 = 分组开 且 角色开）在各消费点的落实：出场角色检测、三个 Provider 的配方筛选、自动学习不受影响。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { compileComfyPromptForTask } from '../../providers/comfyui/compiler.js';
import { compileNovelPromptForTask } from '../../providers/novelai/compiler.js';
import { compileSdPromptForTask } from '../../providers/sd-webui/compiler.js';
import { resolveAutoLearnCharacter } from '../../providers/novelai/novel-character-learning.js';
import {
    characterLibraryFromSettings,
    normalizeCharacterLibrary,
    selectEnabledCharacters,
    setGroupEnabled,
} from '../character-library.js';
import { detectPresentCharacters } from '../present-characters.js';

const read = relative => readFileSync(new URL(relative, import.meta.url), 'utf8');

function person(id, name, extra = {}) {
    return { id, enabled: true, name, aliases: [], type: 'girl', appearance: `${name} unique-look`, negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], ...extra };
}

// 阿璃在关闭的分组里（自己开着）；小猫在开着的分组里；路人未分组；旧人在开着的分组里但自己关了。
function sampleSettings() {
    const library = normalizeCharacterLibrary({
        characters: [
            person('c1', '阿璃', { groupId: 'closed' }),
            person('c2', '小猫', { groupId: 'open' }),
            person('c3', '路人'),
            person('c4', '旧人', { groupId: 'open', enabled: false }),
        ],
        groups: [{ id: 'closed', name: '关着', enabled: false }, { id: 'open', name: '开着' }],
    });
    return { characterTags: library.characters, characterGroups: library.groups };
}

const ownStates = settings => Object.fromEntries(settings.characterTags.map(character => [character.id, character.enabled]));

// ── 出场角色检测（喂给场景规划器的角色参考）──────────────────

test('detectPresentCharacters only reports effectively enabled characters', () => {
    const settings = sampleSettings();
    const text = '阿璃、小猫、路人和旧人一起走进了房间。';
    const names = library => detectPresentCharacters(text, library).map(item => item.name);
    assert.deepEqual(names(characterLibraryFromSettings(settings)), ['小猫', '路人']);
    // 关闭的分组重新开启后，阿璃回来；旧人自己关着，始终不在
    const reopened = setGroupEnabled(characterLibraryFromSettings(settings), 'closed', true);
    assert.deepEqual(names(reopened), ['阿璃', '小猫', '路人']);
    // 分组开关不改角色自己的状态
    assert.deepEqual(ownStates(settings), { c1: true, c2: true, c3: true, c4: false });
});

test('detectPresentCharacters keeps the character-level behaviour for a plain array and ignores empty input', () => {
    const list = [person('a', '阿璃'), person('b', '小猫', { enabled: false })];
    assert.deepEqual(detectPresentCharacters('阿璃和小猫', list).map(item => item.name), ['阿璃']);
    assert.deepEqual(detectPresentCharacters('', list), []);
    assert.deepEqual(detectPresentCharacters('阿璃', []), []);
    assert.deepEqual(detectPresentCharacters('阿璃', undefined), []);
    const hit = detectPresentCharacters('Freya is here', [person('f', 'Freya', { aliases: ['小芙'], outfits: [{ name: ' 常服 ', tags: 'dress' }] })])[0];
    assert.equal(hit.outfits[0].name, '常服');
    assert.equal(hit.type, 'girl');
});

// ── 三个 Provider 的配方：关闭分组的角色不进入 knownCharacters，角色自己的 enabled 不被改 ──────

test('recipe knownCharacters drop characters of closed groups, never touch own enabled, and come back when reopened', () => {
    const settings = sampleSettings();
    const known = selectEnabledCharacters(characterLibraryFromSettings(settings));
    assert.deepEqual(known.map(character => character.id), ['c2', 'c3']);
    assert.deepEqual(ownStates(settings), { c1: true, c2: true, c3: true, c4: false }, '筛选不改动角色');

    const task = {
        scene: 'room',
        chars: [
            { name: '阿璃', type: 'girl', appear: 'llm-made look', action: 'smile', center: { x: 0.5, y: 0.5 } },
            { name: '小猫', action: 'wave', center: { x: 0.5, y: 0.5 } },
        ],
    };
    const compilers = {
        novelai: compileNovelPromptForTask,
        'sd-webui': compileSdPromptForTask,
        comfyui: compileComfyPromptForTask,
    };
    for (const [provider, compile] of Object.entries(compilers)) {
        const prompt = knownCharacters => JSON.stringify(compile(task, { positivePrefix: 'q', negativePrefix: 'n', knownCharacters }));
        const closed = prompt(known);
        assert.ok(!closed.includes('阿璃 unique-look'), `${provider}: 关闭分组里的角色没有用库里的外貌`);
        assert.ok(closed.includes('llm-made look'), `${provider}: 退回 LLM 自己写的外貌`);
        assert.ok(closed.includes('小猫 unique-look'), `${provider}: 开着的分组照常使用库里的外貌`);
        const reopened = prompt(selectEnabledCharacters(setGroupEnabled(characterLibraryFromSettings(settings), 'closed', true)));
        assert.ok(reopened.includes('阿璃 unique-look'), `${provider}: 再开启后恢复使用库里的外貌`);
    }
});

test('every provider builds its recipe from the library with groups (source wiring)', () => {
    const novel = read('../../providers/novelai/novel-draw.js');
    const sd = read('../../providers/sd-webui/sd-draw.js');
    const comfy = read('../../providers/comfyui/comfy-draw.js');

    // NovelAI：配方只用有效启用的角色；默认设置取运行时设置（带分组），不是不含分组的 Provider 设置
    assert.match(novel, /knownCharacters:\s*cloneSettingsObject\(selectEnabledCharacters\(characterLibraryFromSettings\(settings\)\)\)/);
    assert.match(novel, /export function createNovelGenerationRecipe\(\{\s*settings = getRuntimeSettings\(\),/);
    // SD / Comfy：配方函数收库（含分组），每个调用点都传 characterLibrary
    for (const [source, name] of [[sd, 'createSdGenerationRecipe'], [comfy, 'createComfyGenerationRecipe']]) {
        assert.match(source, /knownCharacters:\s*cloneSettingsObject\(selectEnabledCharacters\(characterLibrary\)\)/, name);
        assert.match(source, new RegExp(`export function ${name}\\(\\{[^}]*characterLibrary = characterLibraryFromSettings\\(getSharedDrawSettings\\(\\)\\)`), name);
        const calls = [...source.matchAll(new RegExp(`${name}\\(\\{([\\s\\S]*?)\\}\\)`, 'g'))].filter(match => !match[1].includes('characterLibrary ='));
        assert.ok(calls.length >= 3, `${name}: 找到调用点`);
        for (const call of calls) assert.match(call[1], /characterLibrary:\s*characterLibraryFromSettings\(/, `${name} 调用点必须传带分组的库`);
    }
    // 不再有“只传角色数组”的旧写法
    for (const source of [novel, sd, comfy]) {
        assert.doesNotMatch(source, /selectEnabledCharacters\((characterTags|settings\.characterTags)\)/);
        assert.doesNotMatch(source, /detectPresentCharacters\([^)]*characterTags/);
    }
    // 出场角色检测：三处都按带分组的库
    assert.equal([...novel.matchAll(/detectPresentCharacters\(sceneSource\.content, characterLibraryFromSettings\(settings\)\)/g)].length, 2);
    assert.match(sd, /detectPresentCharacters\(sceneSource\.content, characterLibraryFromSettings\(sharedDrawSettings\)\)/);
    assert.match(comfy, /detectPresentCharacters\(sceneSource\.content, characterLibraryFromSettings\(sharedDrawSettings\)\)/);
    // draw-common 与 NovelAI 共用同一个实现（不再各有一份副本）
    assert.match(read('../draw-common.js'), /from '\.\/present-characters\.js'/);
    assert.match(novel, /from "\.\.\/\.\.\/shared\/present-characters\.js"/);
    assert.doesNotMatch(novel, /function detectPresentCharacters/);
});

test('the three save channels hand over characterGroups untouched (source wiring)', () => {
    const novel = read('../../providers/novelai/novel-draw.js');
    assert.match(novel, /case 'SAVE_CHARACTER_TAGS':[\s\S]*?settings\.characterGroups = data\.characterGroups;/);
    assert.match(novel, /characterGroups: sharedSettings\.characterGroups|characterGroups: settings\.characterGroups \|\| \[\]/);
    for (const file of ['../../providers/sd-webui/sd-draw.js', '../../providers/comfyui/comfy-draw.js']) {
        const source = read(file);
        assert.match(source, /settings\.characterGroups = characterGroups;/, file);
        assert.match(source, /characterLibraryUi \? characterLibraryUi\.getGroups\(\)/, file);
    }
    const html = read('../../providers/novelai/novel-draw.html');
    assert.match(html, /type: 'SAVE_CHARACTER_TAGS', characterTags: persistedCharacters\(\), characterGroups: state\.characterGroups \|\| \[\]/);
});

// ── 自动学习：学习规则与匹配语义保持角色级，不会把“在已关闭分组里的角色”当成未知角色 ──────────

test('auto-learning matches the stored library at character level, so a character in a closed group is never re-created', () => {
    const settings = sampleSettings();
    const library = characterLibraryFromSettings(settings);
    // 自己开着、分组关闭：按已有角色处理（update），不会新建重复角色
    assert.deepEqual(resolveAutoLearnCharacter({ name: '阿璃', type: 'girl' }, library.characters), {
        action: 'update',
        character: library.characters[0],
    });
    // 自己关着（无论分组开关）：照旧 skip，不新建
    assert.equal(resolveAutoLearnCharacter({ name: '旧人', type: 'girl' }, library.characters).action, 'skip');
    const closedAndOff = normalizeCharacterLibrary({
        characters: [person('x', '影子', { groupId: 'closed', enabled: false })],
        groups: [{ id: 'closed', name: '关着', enabled: false }],
    });
    assert.equal(resolveAutoLearnCharacter({ name: '影子', type: 'girl' }, closedAndOff.characters).action, 'skip');
    // 真正的未知角色才会新建
    assert.equal(resolveAutoLearnCharacter({ name: '陌生人', type: 'girl' }, library.characters).action, 'create');
    // 而配方里的 knownCharacters 不含关闭分组的角色——自动学习不能拿它来匹配
    const known = selectEnabledCharacters(library);
    assert.equal(resolveAutoLearnCharacter({ name: '阿璃', type: 'girl' }, known).action, 'create');
});

test('autoLearnFromTasks keeps matching against settings.characterTags and does not use the effective-enable helpers', () => {
    const source = read('../../providers/novelai/novel-draw.js');
    const start = source.indexOf('function autoLearnFromTasks(');
    const end = source.indexOf('function countFields(', start);
    assert.ok(start > 0 && end > start);
    const body = source.slice(start, end);
    assert.match(body, /const knownTags = settings\.characterTags \|\| \[\];/);
    assert.match(body, /resolveAutoLearnCharacter\(char, knownTags\)/);
    assert.doesNotMatch(body, /selectEnabledCharacters|isGroupEnabled|isCharacterEffectivelyEnabled|characterLibraryFromSettings/);
    // 后台学习入口（applyNovelDrawRunAutoLearn）同样走完整的 getRuntimeSettings().characterTags，而不是配方里的 knownCharacters
    const backend = source.slice(source.indexOf('export async function applyNovelDrawRunAutoLearn'), source.indexOf('async function buildNovelScenePlannerOptions'));
    assert.match(backend, /maybeAutoLearnFromTasks\(tasks, \{\s*\.\.\.getRuntimeSettings\(\),/);
    assert.doesNotMatch(backend, /knownCharacters|selectEnabledCharacters/);
});
