import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    applyFormModelsToCharacter,
    collectFormModels,
    createBlankFormModel,
    createEditorSectionState,
    createFormSortable,
    createNamedTagSortables,
    draftToMultiForm,
    draftToSingleForm,
    formModelsFromCharacter,
    formRef,
    isFormHeaderToggleTarget,
    parseFormRef,
    readFormFields,
    renderCharacterFormSections,
    renderFormsSection,
    syncFormList,
    syncNamedTagEditorList,
    toggleFormCard,
} from '../character-edit-form.js';
import { createSortableList } from '../sortable-list.js';

// Acceptance contracts (cost: unsaved form edits lost on redraw, the wrong form's outfits reordered, a form saved onto the wrong slot):
// - >= 2 forms render as folded cards (a newly added one expanded); fold state is UI-only and survives a draft redraw.
// - Reordering forms moves the real cards (typed text travels with them) and the first card is what becomes the character's own fields.
// - Outfit / state lists inside different forms reorder independently.
// - Going from one form to two keeps everything typed; deleting down to one form collapses to the plain layout without losing the survivor.

const splitType = type => ({ type: type === 'boy' || type === 'girl' ? type : 'custom', typeCustom: type === 'boy' || type === 'girl' ? '' : type });
const typeFields = model => `<div class="form-group"><select class="char-edit-type"><option value="boy"${model.type === 'boy' ? ' selected' : ''}>boy</option><option value="girl"${model.type === 'girl' ? ' selected' : ''}>girl</option><option value="custom"${model.type === 'custom' ? ' selected' : ''}>custom</option></select><input class="char-edit-type-custom" value="${model.typeCustom || ''}"></div>`;

const CHARACTER = {
    id: 'c1', name: '司盈昃', formName: '人形', type: 'boy', appearance: 'black hair', negativeTags: 'n1', danbooruTag: 'dt1',
    outfits: [{ name: '常服', tags: 'robe' }, { name: '礼服', tags: 'suit' }], dynamicStates: [],
    forms: [{ id: 'f2', name: '龙形', type: 'no humans', appearance: 'dragon', negativeTags: '', danbooruTag: '', outfits: [{ name: '鳞甲', tags: 'scales' }, { name: '裸', tags: 'bare' }], dynamicStates: [{ name: '喷火', tags: 'fire' }] }],
};

function mount(models, { sectionState = createEditorSectionState() } = {}) {
    const { document, window } = parseHTML('<html><body><div id="card"></div></body></html>');
    const card = document.querySelector('#card');
    const draw = (next) => {
        // eslint-disable-next-line no-unsanitized/property -- 测试夹具：只写入本模块渲染出来的标记，没有外部输入。
        card.innerHTML = renderFormsSection(next, {
            charId: 'c1',
            renderTypeFields: typeFields,
            isSectionCollapsed: (formKey, sectionKey) => sectionState.isCollapsed(formRef('c1', formKey), sectionKey),
        });
        card.querySelectorAll('.char-outfit-editor-list').forEach(list => syncNamedTagEditorList(list, 'outfit'));
        card.querySelectorAll('.char-dynstate-editor-list').forEach(list => syncNamedTagEditorList(list, 'dynstate'));
        syncFormList(card.querySelector('.char-form-list'));
    };
    draw(models);
    return { document, window, card, draw, sectionState };
}

const forms = card => Array.from(card.querySelectorAll('.char-form'));
const formNames = card => collectFormModels(card).map(model => model.name);
const press = (window, element, key) => {
    const event = new window.Event('keydown', { bubbles: true, cancelable: true });
    event.key = key;
    element.dispatchEvent(event);
    return event;
};

test('two forms render as folded cards with the name input as the header title; a new form is expanded', () => {
    const models = formModelsFromCharacter(CHARACTER, splitType);
    assert.deepEqual(models.map(model => model.key), ['main', 'f2']);
    const { card } = mount(models);
    assert.equal(forms(card).length, 2);
    for (const form of forms(card)) {
        assert.equal(form.dataset.expanded, 'false');
        assert.ok(form.classList.contains('is-folded'));
        assert.ok(form.querySelector('.char-form-body').hasAttribute('hidden'));
        assert.ok(form.querySelector('.char-form-header > input.char-form-name'));
        assert.ok(form.querySelector('.char-form-header > [data-form-drag]'));
        // 启用开关是头部的图标按钮；“…”菜单里是复制和（危险样式的）删除。
        assert.ok(form.querySelector('.char-form-header > .char-enabled-control[data-action="toggle-form-enabled"]'));
        assert.equal(form.querySelector('.char-form-header > [data-action="remove-form"]'), null);
        assert.ok(form.querySelector('.char-form-header .char-menu .danger[data-action="remove-form"]'));
        assert.deepEqual(
            Array.from(form.querySelectorAll('.char-form-header [role="menuitem"]')).map(item => item.dataset.action),
            ['duplicate-form', 'remove-form'],
        );
    }
    assert.deepEqual(formNames(card), ['人形', '龙形']);
    assert.equal(forms(card)[1].querySelector('.char-form-preview').textContent, 'dragon');

    const withBlank = mount([...models, createBlankFormModel(splitType)]);
    assert.deepEqual(forms(withBlank.card).map(form => form.dataset.expanded), ['false', 'false', 'true']);
});

test('each form body holds its own type, appearance, negative tags, outfits and states (folded forms are still collected)', () => {
    const { card } = mount(formModelsFromCharacter(CHARACTER, splitType));
    const [human, dragon] = collectFormModels(card);
    assert.deepEqual([human.type, human.appearance, human.negativeTags, human.danbooruTag], ['boy', 'black hair', 'n1', 'dt1']);
    assert.deepEqual(human.outfits.map(item => item.name), ['常服', '礼服']);
    assert.deepEqual([dragon.type, dragon.typeCustom, dragon.appearance], ['custom', 'no humans', 'dragon']);
    assert.deepEqual(dragon.outfits.map(item => item.name), ['鳞甲', '裸']);
    assert.deepEqual(dragon.dynamicStates.map(item => item.name), ['喷火']);
    for (const key of ['appearance', 'outfits', 'dynamicStates']) {
        assert.equal(card.querySelectorAll(`.char-form .char-edit-section[data-section="${key}"]`).length, 2);
    }
    assert.equal(card.querySelectorAll('.char-form .char-edit-section').length, 6); // 固定外貌（含负向）/ 服装 / 动态标签，没有独立的负向分区
    assert.equal(card.querySelectorAll('.char-form .char-edit-section[data-section="appearance"] .char-edit-neg').length, 2);
});

test('draft capture and redraw keep typed text, fold state and the hidden Danbooru tag', () => {
    const first = mount(formModelsFromCharacter(CHARACTER, splitType));
    forms(first.card)[1].querySelector('.char-edit-appearance').value = 'dragon, wings';
    forms(first.card)[0].querySelector('.char-form-name').value = '人类形态';
    forms(first.card)[1].querySelector('.char-form-danbooru').value = 'dragon_tag';
    toggleFormCard(forms(first.card)[1]);
    const draft = collectFormModels(first.card, { keepEmpty: true, withUiState: true });
    assert.deepEqual(draft.map(model => model.expanded), [false, true]);

    const second = mount(draft);
    assert.deepEqual(formNames(second.card), ['人类形态', '龙形']);
    assert.equal(collectFormModels(second.card)[1].appearance, 'dragon, wings');
    assert.equal(collectFormModels(second.card)[1].danbooruTag, 'dragon_tag');
    assert.deepEqual(forms(second.card).map(form => form.dataset.expanded), ['false', 'true']);
    // UI 状态不进入保存用的读取
    assert.equal('expanded' in collectFormModels(second.card)[0], false);
});

test('section collapse inside a form is remembered per form and does not leak to the other form', () => {
    const models = formModelsFromCharacter(CHARACTER, splitType);
    const first = mount(models);
    first.sectionState.setCollapsed(formRef('c1', 'f2'), 'outfits', true);
    first.draw(models);
    const sections = form => form.querySelector('.char-edit-section[data-section="outfits"]');
    assert.ok(!sections(forms(first.card)[0]).classList.contains('is-collapsed'));
    assert.ok(sections(forms(first.card)[1]).classList.contains('is-collapsed'));
    first.sectionState.prune(['c1']);
    assert.equal(first.sectionState.isCollapsed(formRef('c1', 'f2'), 'outfits'), true);
    first.sectionState.prune(['other']);
    assert.equal(first.sectionState.isCollapsed(formRef('c1', 'f2'), 'outfits'), false);
    assert.deepEqual(parseFormRef(formRef('c1', 'f2')), { charId: 'c1', formKey: 'f2' });
    assert.deepEqual(parseFormRef('c1'), { charId: 'c1', formKey: '' });
});

test('clicking inputs and the drag handle in the header does not toggle the fold; the empty header does', () => {
    const { card } = mount(formModelsFromCharacter(CHARACTER, splitType));
    const form = forms(card)[0];
    assert.equal(isFormHeaderToggleTarget(form.querySelector('.char-form-name')), false);
    assert.equal(isFormHeaderToggleTarget(form.querySelector('[data-form-drag]')), false);
    assert.equal(isFormHeaderToggleTarget(form.querySelector('.char-form-preview')), true);
    assert.equal(toggleFormCard(form), true);
    assert.equal(form.querySelector('.char-form-body').hasAttribute('hidden'), false);
    assert.equal(form.querySelector('.char-form-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(toggleFormCard(form), false);
});

test('keyboard reorder of form cards moves the real cards; typed text travels with them', () => {
    const { document, window, card } = mount(formModelsFromCharacter(CHARACTER, splitType));
    forms(card)[1].querySelector('.char-edit-appearance').value = 'typed after mount';
    const sortable = createFormSortable({ container: card, document });
    assert.equal(press(window, forms(card)[1].querySelector('[data-form-drag]'), 'ArrowUp').defaultPrevented, true);
    assert.deepEqual(formNames(card), ['龙形', '人形']);
    assert.equal(collectFormModels(card)[0].appearance, 'typed after mount');
    assert.deepEqual(forms(card).map(form => form.dataset.expanded), ['false', 'false']);
    // 边界处不动
    press(window, forms(card)[0].querySelector('[data-form-drag]'), 'ArrowUp');
    assert.deepEqual(formNames(card), ['龙形', '人形']);
    sortable.destroy();
});

test('pointer drag path: onReorder from the shared sortable controller reorders the form list', () => {
    const { document, card } = mount(formModelsFromCharacter(CHARACTER, splitType));
    let captured = null;
    createFormSortable({ container: card, document, createSortable: options => { captured = options; return createSortableList(options); } });
    assert.equal(captured.rowSelector, '.char-form');
    assert.equal(captured.handleSelector, '[data-form-drag]');
    captured.onReorder(['f2', 'main']);
    assert.deepEqual(formNames(card), ['龙形', '人形']);
});

test('outfit lists in different forms reorder independently (sortable is scoped to the list)', () => {
    const { document, window, card } = mount(formModelsFromCharacter(CHARACTER, splitType));
    const sortables = createNamedTagSortables({ container: card, document });
    const dragonOutfits = forms(card)[1].querySelectorAll('.char-outfit-editor-item');
    press(window, dragonOutfits[1].querySelector('[data-named-drag]'), 'ArrowUp');
    const [human, dragon] = collectFormModels(card);
    assert.deepEqual(human.outfits.map(item => item.name), ['常服', '礼服']);
    assert.deepEqual(dragon.outfits.map(item => item.name), ['裸', '鳞甲']);
    // 边界：第一形态的第一条服装不会跨列表去换位置
    press(window, forms(card)[0].querySelectorAll('.char-outfit-editor-item')[0].querySelector('[data-named-drag]'), 'ArrowUp');
    assert.deepEqual(collectFormModels(card)[0].outfits.map(item => item.name), ['常服', '礼服']);
    sortables.forEach(sortable => sortable.destroy());
});

test('single -> multi keeps every typed field as the first form; multi -> single keeps the survivor', () => {
    const draft = {
        id: 'c1', name: '司盈昃', aliases: '盈昃', formName: '', type: 'boy', typeCustom: '', appearance: 'typed', negativeTags: 'neg',
        danbooruTag: 'dt', outfits: [{ name: 'o', tags: 't' }], dynamicStates: [],
    };
    const multi = draftToMultiForm(draft, splitType);
    assert.equal(multi.multi, true);
    assert.equal(multi.forms.length, 2);
    assert.equal(multi.forms[0].appearance, 'typed');
    assert.equal(multi.forms[0].danbooruTag, 'dt');
    assert.equal(multi.forms[1].expanded, true);
    assert.equal(multi.name, '司盈昃');
    assert.equal('appearance' in multi, false);

    const survivor = { ...multi, forms: [{ ...multi.forms[1], name: '龙形', appearance: 'dragon', danbooruTag: 'dd' }] };
    const single = draftToSingleForm(survivor);
    assert.equal(single.multi, undefined);
    assert.equal(single.formName, '龙形');
    assert.equal(single.appearance, 'dragon');
    assert.equal(single.danbooruTag, 'dd');
    assert.equal(single.name, '司盈昃');
});

test('saving: first card becomes the top-level fields, the rest become forms with ids; blank extras collapse back to a plain character', () => {
    const { card } = mount(formModelsFromCharacter(CHARACTER, splitType));
    // 拖到最前：龙形成为角色自己的字段
    card.querySelector('.char-form-list').insertBefore(forms(card)[1], forms(card)[0]);
    const char = { id: 'c1', name: '司盈昃', aliases: [], enabled: true, locked: true, groupId: 'g' };
    applyFormModelsToCharacter(char, collectFormModels(card), { makeId: () => 'gen-1' });
    assert.equal(char.type, 'no humans');
    assert.equal(char.formName, '龙形');
    assert.equal(char.appearance, 'dragon');
    assert.deepEqual(char.outfits.map(item => item.name), ['鳞甲', '裸']);
    assert.equal(char.forms.length, 1);
    assert.deepEqual([char.forms[0].name, char.forms[0].id, char.forms[0].type], ['人形', 'gen-1', 'boy']);
    assert.equal(char.locked, true);
    assert.equal(char.groupId, 'g');

    const plain = applyFormModelsToCharacter({ id: 'c', forms: [{ name: 'old' }], formName: 'old' }, [
        { name: '', type: 'girl', appearance: 'a', outfits: [], dynamicStates: [] },
        { name: '', type: 'girl', appearance: '', negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [] },
    ]);
    assert.equal('forms' in plain, false);
    assert.equal('formName' in plain, false);
    assert.equal(plain.appearance, 'a');
});

test('single layout fields read through the same helper (custom type resolves to its text)', () => {
    const { document } = parseHTML('<html><body><div id="card"></div></body></html>');
    const card = document.querySelector('#card');
    // eslint-disable-next-line no-unsanitized/property -- 测试夹具：只写入本模块渲染出来的标记，没有外部输入。
    card.innerHTML = `${typeFields({ type: 'custom', typeCustom: 'mature female' })}${renderCharacterFormSections({ appearance: 'x', danbooruTag: 'd' }, { charId: 'c1' })}`;
    const fields = readFormFields(card);
    assert.deepEqual([fields.type, fields.typeCustom, fields.appearance, fields.danbooruTag], ['custom', 'mature female', 'x', 'd']);
    assert.equal(applyFormModelsToCharacter({}, [fields]).type, 'mature female');
    assert.equal(card.querySelector('.danbooru-panel').dataset.charId, 'c1');
    assert.equal(card.querySelector('[data-action="search-danbooru"]').dataset.formKey, undefined);
});
