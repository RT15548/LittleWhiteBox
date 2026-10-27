import assert from 'node:assert/strict';
import test from 'node:test';
import {
    CHARACTER_EXPORT_VERSION,
    CHARACTER_EXPORT_VERSION_WITH_FORMS,
    duplicateCharacters,
    exportCharacters,
    normalizeCharacter,
    normalizeCharacterLibrary,
    parseCharacterImport,
    planCharacterImport,
} from '../character-library.js';
import {
    MAX_CHARACTER_FORMS,
    expandCharacterForms,
    getCharacterSearchFields,
    normalizeForms,
} from '../character-forms.js';
import { assembleCharacterPrompts } from '../character-prompts.js';
import { findEnabledCharacterForm } from '../character-selection.js';
import { detectPresentCharacters } from '../present-characters.js';
import { parseSubmittedScenePlan } from '../scene-plan-contract.js';
import { resolveAutoLearnCharacter } from '../../providers/novelai/novel-character-learning.js';

// Acceptance contracts (cost: a dragon-form picture drawn with the human form's tags, or a single-form character changing its prompt):
// - A character without `forms` is exactly what it was: same normalised bytes, same planner text, same prompts.
// - A character with extra forms is expanded one entry per form, named `名称（形态名）`, sharing aliases;
//   the bare name / an alias resolves to the first form, `名称（形态名）` to that form's own tags.
// - The exclusivity sentence is declared once per multi-form character and never for single-form ones.

const SI = {
    id: 'c1',
    name: '司盈昃',
    aliases: ['盈昃', '小司'],
    formName: '人形',
    type: 'boy',
    appearance: 'black hair, red eyes',
    negativeTags: 'extra legs',
    danbooruTag: 'si_yingze',
    outfits: [{ name: '常服', tags: 'black robe' }, { name: '泳装', tags: 'swim trunks', enabled: false }],
    dynamicStates: [{ name: '受伤', tags: 'bleeding' }],
    forms: [{
        id: 'f-dragon',
        name: '龙形',
        type: 'no humans',
        appearance: 'black dragon, red eyes, scales',
        negativeTags: 'human',
        danbooruTag: '',
        outfits: [{ name: '鳞甲', tags: 'armor scales' }],
        dynamicStates: [],
    }],
};
const PLAIN = { id: 'c2', name: 'Alice', aliases: ['Al'], type: 'girl', appearance: 'silver hair' };

test('expansion: one entry per form with the 名称（形态名） naming, shared aliases and per-form tags', () => {
    const [human, dragon] = expandCharacterForms([normalizeCharacter(SI)]);
    assert.equal(human.name, '司盈昃（人形）');
    assert.equal(dragon.name, '司盈昃（龙形）');
    assert.deepEqual(human.aliases, ['盈昃', '小司']);
    assert.deepEqual(dragon.aliases, ['盈昃', '小司']);
    assert.equal(human.type, 'boy');
    assert.equal(dragon.type, 'no humans');
    assert.equal(human.appearance, 'black hair, red eyes');
    assert.equal(dragon.appearance, 'black dragon, red eyes, scales');
    assert.equal(dragon.negativeTags, 'human');
    assert.deepEqual(dragon.outfits.map(item => item.name), ['鳞甲']);
    assert.deepEqual([human.formIndex, dragon.formIndex, human.formCount], [0, 1, 2]);
    assert.equal(human.baseName, '司盈昃');
});

test('expansion: unnamed forms fall back to the bare name / 形态N and duplicates stay distinguishable', () => {
    const names = expandCharacterForms([{ name: 'A', forms: [{ type: 'boy' }, { name: 'x' }, { name: 'x' }] }]).map(entry => entry.name);
    assert.equal(names[0], 'A');
    assert.equal(names[1], 'A（形态2）');
    assert.equal(names[2], 'A（x）');
    assert.equal(new Set(names).size, 4);
    assert.equal(names[3], 'A（x4）');
});

test('expansion: characters without forms come back as the very same object, order preserved', () => {
    const plain = normalizeCharacter(PLAIN);
    const list = [plain, normalizeCharacter(SI)];
    const out = expandCharacterForms(list);
    assert.equal(out[0], plain);
    assert.equal(out.length, 3);
    assert.deepEqual(expandCharacterForms(undefined), []);
});

test('resolution: name + form picks the form, bare name and alias hit the first form, 名称（形态） is not a name', () => {
    const known = expandCharacterForms([normalizeCharacter(SI)]);
    assert.equal(findEnabledCharacterForm('司盈昃', '龙形', known).formIndex, 1);
    assert.equal(findEnabledCharacterForm('小司', '人形', known).formIndex, 0);
    assert.equal(findEnabledCharacterForm('司盈昃', '', known).formIndex, 0);
    assert.equal(findEnabledCharacterForm('小司', undefined, known).formIndex, 0);
    assert.equal(findEnabledCharacterForm('司盈昃（龙形）', '龙形', known), undefined);

    const prompts = assembleCharacterPrompts(
        [{ name: '司盈昃', form: '龙形', action: 'flying' }, { name: '盈昃' }, { name: '司盈昃' }],
        [normalizeCharacter(SI)],
    );
    assert.equal(prompts[0].name, '司盈昃（龙形）');
    assert.equal(prompts[0].prompt, 'no humans, black dragon, red eyes, scales, flying');
    assert.equal(prompts[0].uc, 'human');
    assert.ok(prompts[1].prompt.startsWith('boy, si yingze, black hair, red eyes'));
    assert.equal(prompts[1].uc, 'extra legs');
    assert.ok(prompts[2].prompt.startsWith('boy'));
});

test('resolution: a single-form character yields the same prompt object shape as before', () => {
    const [prompt] = assembleCharacterPrompts([{ name: 'Al', action: 'waves' }], [normalizeCharacter(PLAIN)]);
    assert.deepEqual(prompt, { name: 'Alice', prompt: 'girl, silver hair, waves', uc: '', center: { x: 0.5, y: 0.5 } });
});

test('present characters: matched by name or alias only, one entry per form, disabled outfits dropped', () => {
    const library = normalizeCharacterLibrary({ characters: [SI, PLAIN, { ...SI, id: 'c3', name: '路人', aliases: [], formName: '', forms: [] }], groups: [] });
    const present = detectPresentCharacters('盈昃抬起了头。', library);
    assert.deepEqual(present.map(entry => entry.name), ['司盈昃（人形）', '司盈昃（龙形）']);
    assert.deepEqual(present[0].outfits.map(item => item.name), ['常服']);
    assert.deepEqual(present.map(entry => [entry.formIndex, entry.formCount, entry.baseName]), [[0, 2, '司盈昃'], [1, 2, '司盈昃']]);
    assert.deepEqual(detectPresentCharacters('Al is here', library).map(entry => entry.name), ['Alice']);
    const [alice] = detectPresentCharacters('Alice', library);
    assert.equal('baseName' in alice, false);
    assert.equal('formCount' in alice, false);
});

test('planner contract: name / alias resolve to the official name, form picks the form (default the first)', () => {
    const library = normalizeCharacterLibrary({ characters: [SI], groups: [] });
    const present = detectPresentCharacters('司盈昃', library);
    const plan = parseSubmittedScenePlan({
        toolCalls: [{
            name: 'submit_scene_plan',
            arguments: {
                images: [{
                    insert_after: 1,
                    scene: 'night sky',
                    characters: [{ name: '司盈昃', form: '龙形' }, { name: '司盈昃' }, { name: '小司' }],
                }],
            },
        }],
    }, { presentCharacters: present, sceneSource: { sourceHash: 'h', points: [{ number: 1, offset: 0 }] } });
    assert.deepEqual(plan.tasks[0].chars.map(char => [char.name, char.form]), [['司盈昃', '龙形'], ['司盈昃', '人形'], ['司盈昃', '人形']]);
});

test('normalize: forms and formName are kept only when present; old data stays byte-identical', () => {
    const plain = normalizeCharacter(PLAIN);
    assert.equal('forms' in plain, false);
    assert.equal('formName' in plain, false);
    assert.equal(JSON.stringify(plain), JSON.stringify(normalizeCharacter(JSON.parse(JSON.stringify(plain)))));
    const multi = normalizeCharacter(SI);
    assert.equal(multi.formName, '人形');
    assert.equal(multi.forms.length, 1);
    assert.equal(multi.forms[0].name, '龙形');
    assert.equal(multi.forms[0].id, 'f-dragon');
    assert.equal(JSON.stringify(multi), JSON.stringify(normalizeCharacter(JSON.parse(JSON.stringify(multi)))));
});

test('normalizeForms drops blank / non-object entries and caps the count', () => {
    assert.deepEqual(normalizeForms([{}, null, 'x', { type: 'girl' }]), []);
    assert.equal(normalizeForms([{ type: 'no humans' }]).length, 1);
    const many = Array.from({ length: MAX_CHARACTER_FORMS + 5 }, (_, i) => ({ name: `f${i}` }));
    assert.equal(normalizeForms(many).length, MAX_CHARACTER_FORMS - 1);
});

test('export / import round trip keeps form content and never carries enabled; old files import fine', () => {
    const library = normalizeCharacterLibrary({
        characters: [{ ...SI, forms: [{ ...SI.forms[0], outfits: [{ name: '鳞甲', tags: 'armor scales', enabled: false }] }] }, PLAIN],
        groups: [],
    });
    const exported = exportCharacters(library, { scope: 'all' });
    assert.equal(exported.version, CHARACTER_EXPORT_VERSION_WITH_FORMS);
    assert.equal(JSON.stringify(exported).includes('"enabled"'), false);
    assert.equal(exported.characters[0].forms[0].outfits[0].name, '鳞甲');

    const parsed = parseCharacterImport(JSON.parse(JSON.stringify(exported)));
    assert.equal(parsed.skipped, 0);
    const entry = parsed.entries[0];
    assert.ok(entry.fields.includes('forms') && entry.fields.includes('formName'));
    const plan = planCharacterImport({ characters: [], groups: [] }, parsed);
    assert.equal(plan.library.characters[0].forms[0].name, '龙形');
    assert.equal(plan.library.characters[0].forms[0].outfits[0].enabled, undefined);

    // 不含形态的导出文件保持旧版本号，旧版本读到新文件时会因版本号更高得到提示
    const plainExport = exportCharacters(normalizeCharacterLibrary({ characters: [PLAIN], groups: [] }), { scope: 'all' });
    assert.equal(plainExport.version, CHARACTER_EXPORT_VERSION);
    assert.equal(JSON.stringify(plainExport.characters[0]).includes('forms'), false);

    // 老文件（没有 forms 字段）可以导入，也不会清掉本机已有的形态
    const old = { type: exported.type, version: 4, characters: [{ id: 'c1', name: '司盈昃', type: 'boy', appearance: 'new look' }] };
    const oldPlan = planCharacterImport(plan.library, parseCharacterImport(old));
    const replaced = oldPlan.library.characters.find(char => char.id === 'c1');
    assert.equal(replaced.appearance, 'new look');
    assert.equal(replaced.forms.length, 1);
    assert.equal(replaced.formName, '人形');
});

test('import replace: file with an empty forms list clears the local forms; local per-form item switches survive by name', () => {
    const local = normalizeCharacterLibrary({
        characters: [{ ...SI, forms: [{ ...SI.forms[0], outfits: [{ name: '鳞甲', tags: 'old', enabled: false }] }] }],
        groups: [],
    });
    const same = parseCharacterImport({ type: 'novel-draw-characters', version: 5, characters: [{ id: 'c1', name: '司盈昃', forms: [{ id: 'f-dragon', name: '龙形', outfits: [{ name: '鳞甲', tags: 'new' }] }] }] });
    const replaced = planCharacterImport(local, same).library.characters[0];
    assert.deepEqual(replaced.forms[0].outfits, [{ name: '鳞甲', tags: 'new', enabled: false }]);

    const cleared = parseCharacterImport({ type: 'novel-draw-characters', version: 5, characters: [{ id: 'c1', name: '司盈昃', forms: [], formName: '' }] });
    const afterClear = planCharacterImport(local, cleared).library.characters[0];
    assert.equal('forms' in afterClear, false);
    assert.equal('formName' in afterClear, false);
});

test('import validation: malformed forms skip the whole character; alias / name conflicts stay per character', () => {
    const bad = parseCharacterImport({ type: 'novel-draw-characters', version: 5, characters: [
        { name: 'A', forms: 'nope' },
        { name: 'B', forms: [{ name: { x: 1 } }] },
        { name: 'C', forms: [{ name: 'ok', outfits: [{ name: 'a', tags: ['x'] }] }] },
        { name: 'D', formName: ['x'] },
        { name: 'E', forms: [{ name: 'fine' }] },
    ] });
    assert.deepEqual(bad.entries.map(entry => entry.character.name), ['E']);
    assert.equal(bad.skipped, 4);

    // 形态名不参与重名检查：只有角色的名称 / 别名会触发“同名”警告
    const library = normalizeCharacterLibrary({ characters: [SI], groups: [] });
    const noConflict = parseCharacterImport({ type: 'novel-draw-characters', version: 5, characters: [{ id: 'x', name: '龙形', forms: [{ name: '司盈昃' }] }] });
    assert.equal(planCharacterImport(library, noConflict, { mode: 'new-group', newGroupName: 'g' }).warnings.some(w => w.code === 'name-conflict'), false);
});

test('duplicate copies forms deeply with fresh ids', () => {
    const library = normalizeCharacterLibrary({ characters: [SI], groups: [] });
    let n = 0;
    const { library: next, newIds } = duplicateCharacters(library, ['c1'], { makeId: prefix => `${prefix}-${++n}` });
    const copy = next.characters.find(char => char.id === newIds[0]);
    assert.equal(copy.forms.length, 1);
    assert.equal(copy.forms[0].name, '龙形');
    assert.notEqual(copy.forms[0].id, 'f-dragon');
    copy.forms[0].outfits[0].tags = 'changed';
    assert.equal(library.characters[0].forms[0].outfits[0].tags, 'armor scales');
});

test('auto-learn: a form-qualified reply never creates a new character; only the first form updates the original', () => {
    const characters = [normalizeCharacter(SI), normalizeCharacter(PLAIN)];
    assert.equal(resolveAutoLearnCharacter({ name: '司盈昃（人形）', type: 'boy' }, characters).character, characters[0]);
    assert.equal(resolveAutoLearnCharacter({ name: '司盈昃（龙形）', type: 'x' }, characters).action, 'skip');
    assert.equal(resolveAutoLearnCharacter({ name: '盈昃', type: 'x' }, characters).character, characters[0]);
    assert.equal(resolveAutoLearnCharacter({ name: 'Nobody', type: 'girl' }, characters).action, 'create');
    const disabled = [{ ...normalizeCharacter(SI), enabled: false }];
    assert.equal(resolveAutoLearnCharacter({ name: '司盈昃（人形）', type: 'boy' }, disabled).action, 'skip');
});

test('library search text covers form names and each form appearance', () => {
    const text = getCharacterSearchFields(normalizeCharacter(SI)).filter(Boolean).join(' ');
    assert.ok(text.includes('龙形') && text.includes('black dragon') && text.includes('人形'));
});
