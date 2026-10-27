import assert from 'node:assert/strict';
import test from 'node:test';
import {
    duplicateCharacters,
    exportCharacters,
    normalizeCharacter,
    normalizeCharacterLibrary,
    parseCharacterImport,
    planCharacterImport,
} from '../character-library.js';
import {
    FORM_EXCLUSIVE_NOTE,
    expandCharacterForms,
    formatFormTypeSummary,
    getCharacterForms,
    getEnabledCharacterForms,
    normalizeForms,
} from '../character-forms.js';
import { applyFormModelsToCharacter, draftToSingleForm, duplicateFormModels, formModelsFromCharacter } from '../character-edit-form.js';
import { assembleCharacterPrompts } from '../character-prompts.js';
import { detectPresentCharacters } from '../present-characters.js';
import { buildCharacterInfoForLLM } from '../scene-planner.js';
import { resolveAutoLearnCharacter } from '../../providers/novelai/novel-character-learning.js';

// Acceptance contracts (cost: a form the user switched off still drawn, or a character with every form off crashing the planner):
// - A disabled form is excluded from expansion / what the agent sees / the type summary; the other forms keep their names.
// - If the first form is off, the next enabled form answers the bare name and is the "未提及默认第一个" form.
// - All forms off = the character is simply not sent (no crash).
// - Form on/off is local-only: never exported, ignored on import, kept on replace; enabled forms stay byte-identical to before.

const BASE = {
    id: 'c1', name: '司盈昃', aliases: ['小司'], formName: '人形', type: 'boy', appearance: 'black hair',
    forms: [
        { id: 'f2', name: '龙形', type: 'no humans', appearance: 'black dragon', outfits: [{ name: '鳞甲', tags: 'scales' }] },
        { id: 'f3', name: '兽形', type: 'other', appearance: 'black wolf' },
    ],
};
const withState = (patch, formsPatch = []) => normalizeCharacter({
    ...BASE,
    ...patch,
    forms: BASE.forms.map((form, i) => ({ ...form, ...(formsPatch[i] || {}) })),
});

test('normalize: enabled / formDisabled are kept only when off, and formDisabled only while there are extra forms', () => {
    const plain = normalizeCharacter(BASE);
    assert.equal(JSON.stringify(plain.forms).includes('enabled'), false);
    assert.equal('formDisabled' in plain, false);
    assert.equal('enabled' in plain.forms[0], false);

    const off = withState({ formDisabled: true }, [{ enabled: false }, { enabled: true }]);
    assert.equal(off.formDisabled, true);
    assert.deepEqual(off.forms.map(form => form.enabled), [false, undefined]);
    assert.equal(JSON.stringify(off), JSON.stringify(normalizeCharacter(JSON.parse(JSON.stringify(off)))));

    assert.equal('formDisabled' in normalizeCharacter({ name: 'A', formDisabled: true }), false, 'no extra form, nothing to disable');
    assert.equal('formDisabled' in normalizeCharacter({ name: 'A', formDisabled: 'yes', forms: [{ name: 'x' }] }), false, 'only boolean true counts');
    assert.deepEqual(normalizeForms([{ name: 'x', enabled: false }, { name: 'y', enabled: 0 }]).map(form => form.enabled), [false, undefined]);
});

test('expansion: a disabled extra form is skipped, the others keep their names and the count only covers enabled forms', () => {
    const [human, wolf, ...rest] = expandCharacterForms([withState({}, [{ enabled: false }])]);
    assert.equal(rest.length, 0);
    assert.deepEqual([human.name, wolf.name], ['司盈昃（人形）', '司盈昃（兽形）']);
    assert.deepEqual([human.formIndex, wolf.formIndex, human.formCount], [0, 1, 2]);
    assert.deepEqual(getCharacterForms(withState({}, [{ enabled: false }])).map(form => form.enabled), [true, false, true]);
    assert.deepEqual(getEnabledCharacterForms(withState({}, [{ enabled: false }])).map(form => form.index), [0, 2]);
});

test('expansion: with the first form off, the next enabled form answers the bare name and carries 未提及默认第一个', () => {
    const character = withState({ formDisabled: true });
    const entries = expandCharacterForms([character]);
    assert.deepEqual(entries.map(entry => entry.name), ['司盈昃（龙形）', '司盈昃（兽形）']);
    assert.deepEqual(entries.map(entry => [entry.formIndex, entry.formCount]), [[0, 2], [1, 2]]);

    const prompts = assembleCharacterPrompts([{ name: '司盈昃' }, { name: '小司' }, { name: '司盈昃', form: '人形' }], [character]);
    assert.ok(prompts[0].prompt.includes('black dragon'), 'bare name -> first enabled form');
    assert.ok(prompts[1].prompt.includes('black dragon'), 'alias -> first enabled form');
    assert.ok(!prompts[2].prompt.includes('black hair'), 'a disabled form falls back to the first enabled one');

    const present = detectPresentCharacters('小司抬起头。', normalizeCharacterLibrary({ characters: [character], groups: [] }));
    assert.deepEqual(present.map(entry => entry.name), ['司盈昃（龙形）', '司盈昃（兽形）']);
    const text = buildCharacterInfoForLLM(present);
    assert.equal(text.split(FORM_EXCLUSIVE_NOTE).length - 1, 1);
    assert.ok(text.indexOf(FORM_EXCLUSIVE_NOTE) < text.indexOf('形态 龙形'));
    assert.ok(!/司盈昃（(人形|龙形|兽形)）/.test(text), 'the list never shows 名称（形态名） as a name');
});

test('expansion: one enabled form left still resolves the bare name and drops the exclusivity sentence', () => {
    const character = withState({ formDisabled: true }, [{ enabled: false }]);
    const entries = expandCharacterForms([character]);
    assert.deepEqual(entries.map(entry => [entry.name, entry.formIndex, entry.formCount]), [['司盈昃（兽形）', 0, 1]]);
    const present = detectPresentCharacters('司盈昃', normalizeCharacterLibrary({ characters: [character], groups: [] }));
    assert.ok(!buildCharacterInfoForLLM(present).includes(FORM_EXCLUSIVE_NOTE));
    assert.ok(assembleCharacterPrompts([{ name: '司盈昃' }], [character])[0].prompt.includes('black wolf'));
});

test('every form off: the character is not sent anywhere and nothing throws', () => {
    const character = withState({ formDisabled: true }, [{ enabled: false }, { enabled: false }]);
    assert.deepEqual(expandCharacterForms([character]), []);
    assert.deepEqual(detectPresentCharacters('司盈昃', normalizeCharacterLibrary({ characters: [character], groups: [] })), []);
    assert.equal(buildCharacterInfoForLLM(detectPresentCharacters('司盈昃', normalizeCharacterLibrary({ characters: [character], groups: [] }))), buildCharacterInfoForLLM([]));
    const [prompt] = assembleCharacterPrompts([{ name: '司盈昃', action: 'waves' }], [character]);
    assert.equal(prompt.prompt, 'waves', 'treated like an unknown character: only what the scene itself says');
    assert.equal(formatFormTypeSummary(character), '');
    // 单形态角色没有可停用的形态：返回的仍是同一个对象
    const plain = normalizeCharacter({ name: 'A', type: 'girl' });
    assert.equal(expandCharacterForms([plain])[0], plain);
});

test('export never carries form on/off; import ignores it, keeps the local value on replace and defaults new characters to on', () => {
    const local = normalizeCharacterLibrary({ characters: [withState({ formDisabled: true }, [{ enabled: false }])], groups: [] });
    const exported = exportCharacters(local, { scope: 'all' });
    const json = JSON.stringify(exported);
    assert.equal(json.includes('formDisabled'), false);
    assert.equal(json.includes('"enabled"'), false);
    assert.equal(exported.characters[0].forms.length, 2, 'the forms themselves are still exported');

    // 文件里手写的 enabled / formDisabled 一律不认
    const hostile = JSON.parse(JSON.stringify(exported));
    hostile.characters[0].formDisabled = true;
    hostile.characters[0].forms[1].enabled = false;
    const fresh = planCharacterImport({ characters: [], groups: [] }, parseCharacterImport(hostile)).library.characters[0];
    assert.equal('formDisabled' in fresh, false);
    assert.deepEqual(fresh.forms.map(form => form.enabled), [undefined, undefined]);

    // 替换本机同一角色：按 id 对上的形态保留本机的停用状态，第一形态的标记原样保留
    const replaced = planCharacterImport(local, parseCharacterImport(JSON.parse(json))).library.characters[0];
    assert.equal(replaced.formDisabled, true);
    assert.deepEqual(replaced.forms.map(form => [form.id, form.enabled]), [['f2', false], ['f3', undefined]]);

    // 文件里不再有形态：替换后没有可停用的形态了，标记随之清掉
    const noForms = parseCharacterImport({ type: 'novel-draw-characters', version: 5, characters: [{ id: 'c1', name: '司盈昃', forms: [], formName: '' }] });
    const cleared = planCharacterImport(local, noForms).library.characters[0];
    assert.equal('forms' in cleared, false);
    assert.equal('formDisabled' in cleared, false);

    // 文件里换了形态顺序：id 优先于位置
    const reordered = JSON.parse(json);
    reordered.characters[0].forms.reverse();
    const afterReorder = planCharacterImport(local, parseCharacterImport(reordered)).library.characters[0];
    assert.deepEqual(afterReorder.forms.map(form => [form.id, form.enabled]), [['f3', undefined], ['f2', false]]);
});

test('duplicating a character copies each form switch along with the form (deep copy, fresh ids)', () => {
    const library = normalizeCharacterLibrary({ characters: [withState({ formDisabled: true }, [{ enabled: false }])], groups: [] });
    let n = 0;
    const { library: next, newIds } = duplicateCharacters(library, ['c1'], { makeId: prefix => `${prefix}-${++n}` });
    const copy = next.characters.find(char => char.id === newIds[0]);
    assert.equal(copy.formDisabled, true);
    assert.deepEqual(copy.forms.map(form => form.enabled), [false, undefined]);
    assert.notEqual(copy.forms[0].id, 'f2');
    copy.forms[0].enabled = true;
    assert.equal(library.characters[0].forms[0].enabled, false);
});

test('auto-learn: a disabled form is still that character\'s form, so its name never creates a new character', () => {
    const characters = [withState({ formDisabled: true })];
    assert.equal(resolveAutoLearnCharacter({ name: '司盈昃（人形）', type: 'boy' }, characters).character, characters[0], 'the original first form is still the one learning writes to');
    assert.equal(resolveAutoLearnCharacter({ name: '司盈昃（龙形）', type: 'x' }, characters).action, 'skip');
    assert.equal(resolveAutoLearnCharacter({ name: '司盈昃（兽形）', type: 'x' }, [withState({}, [{}, { enabled: false }])]).action, 'skip');
});

test('edit models: the switches round-trip through the form models, copies are deep and enabled, single layout drops the first-form flag', () => {
    const character = withState({ formDisabled: true }, [{ enabled: false }]);
    const models = formModelsFromCharacter(character);
    assert.deepEqual(models.map(model => model.enabled), [false, false, true]);

    const saved = applyFormModelsToCharacter({ ...character }, models, { makeId: () => 'new' });
    assert.equal(saved.formDisabled, true);
    assert.deepEqual(saved.forms.map(form => form.enabled), [false, undefined]);
    assert.equal(JSON.stringify(saved.forms).includes('"enabled":true'), false);

    const on = applyFormModelsToCharacter({ ...character }, models.map(model => ({ ...model, enabled: true })), { makeId: () => 'new' });
    assert.equal('formDisabled' in on, false);
    assert.equal(JSON.stringify(on.forms).includes('enabled'), false);

    // 额外形态全被丢弃（空白）时没有可停用的形态，第一形态的标记也不留
    const onlyBlank = applyFormModelsToCharacter({ ...character }, [{ ...models[0], enabled: false }, { key: 'x', name: '', type: 'girl', typeCustom: '', outfits: [], dynamicStates: [], enabled: true }]);
    assert.equal('forms' in onlyBlank, false);
    assert.equal('formDisabled' in onlyBlank, false);

    const { models: withCopy, copyKey } = duplicateFormModels(models, 'f2');
    assert.deepEqual(withCopy.map(model => model.name), ['人形', '龙形', '龙形 副本', '兽形']);
    const copy = withCopy[2];
    assert.equal(copy.key, copyKey);
    assert.notEqual(copy.key, 'f2');
    assert.equal(copy.id, '', 'a fresh id is issued when saved');
    assert.equal(copy.enabled, true);
    assert.equal(copy.expanded, true);
    assert.equal(copy.appearance, 'black dragon');
    copy.outfits[0].tags = 'changed';
    assert.equal(models[1].outfits[0].tags, 'scales');
    assert.equal(duplicateFormModels(models, 'nope').copyKey, '');

    const single = draftToSingleForm({ id: 'c1', multi: true, forms: [{ ...models[1], enabled: false }] });
    assert.equal('enabled' in single, false);
});
