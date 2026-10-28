import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { applyFormFieldsFromCard, createFormsEditor, readFormsFromCard } from '../character-forms-dom.js';
import { normalizeCharacter } from '../character-library.js';
import { parseNamedTagLines, serializeNamedTagLines } from '../named-tag-items.js';

// Acceptance contracts (cost: an SD WebUI / ComfyUI save silently deleting or corrupting a character's forms):
// - Saving a card whose forms were never touched writes the same forms back; clearing is an explicit delete, not a leftover from the saved record.
// - Add / remove / reorder in the card editor are reflected by what the page reads on save.
// - A card read for a redraw keeps a just-added blank form; a card read for save drops it.

const SAVED = {
    id: 'c1', name: '司盈昃', type: 'boy', formName: '人形', appearance: 'a', outfits: [], dynamicStates: [],
    forms: [
        { id: 'f1', name: '龙形', type: 'no humans', appearance: 'dragon', negativeTags: 'human', danbooruTag: 'dt', outfits: [{ name: '鳞甲', tags: 'scales', enabled: false }], dynamicStates: [{ name: '喷火', tags: 'fire' }] },
        { id: 'f2', name: '幼龙', type: 'no humans', appearance: 'small dragon', negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [] },
    ],
};

// 与页面里的 createCharacterField 同一契约：dataset[options.dataKey || 'sdCharField'] 标记字段。
function makeCreateField(document) {
    return (labelText, fieldName, value, placeholder, options = {}) => {
        const field = document.createElement('div');
        field.className = 'form-group';
        const input = document.createElement(options.multiline ? 'textarea' : 'input');
        input.dataset[options.dataKey || 'sdCharField'] = fieldName;
        if (options.multiline) input.textContent = String(value || ''); else input.value = String(value || '');
        field.append(input);
        return field;
    };
}

function mountCard(saved = SAVED) {
    const { document, window } = parseHTML('<html><body><details class="sd-char-card"></details></body></html>');
    const card = document.querySelector('.sd-char-card');
    const createField = makeCreateField(document);
    card.append(createField('形态名称', 'formName', saved.formName || '', ''));
    card.append(createFormsEditor({ document, forms: saved.forms || [], createField }));
    return { document, window, card };
}

const click = (window, element) => element.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));
const blocks = card => Array.from(card.querySelectorAll('.sd-char-form'));
const fieldOf = (block, name) => block.querySelector(`[data-sd-form-field="${name}"]`);
// 与页面一致：先展开已保存的记录再覆盖，所以清空字段必须显式删除。
const readRecord = (card, saved, options) => applyFormFieldsFromCard({ ...saved }, card, options);

test('an untouched card saves the same forms back, with ids and item names intact', () => {
    const { card } = mountCard();
    const record = readRecord(card, SAVED);
    assert.equal(record.formName, '人形');
    assert.equal(record.forms.length, 2);
    assert.deepEqual(record.forms.map(form => [form.id, form.name, form.type, form.appearance, form.negativeTags, form.danbooruTag]), [
        ['f1', '龙形', 'no humans', 'dragon', 'human', 'dt'],
        ['f2', '幼龙', 'no humans', 'small dragon', '', ''],
    ]);
    assert.deepEqual(record.forms[0].dynamicStates, [{ name: '喷火', tags: 'fire' }]);
    // 文本框写法里的 “# ” 前缀表示停用：条目的启用状态跟着文本走，没有被悄悄改成启用
    assert.deepEqual(record.forms[0].outfits, [{ name: '鳞甲', tags: 'scales', enabled: false }]);
    assert.equal(normalizeCharacter(record).forms.length, 2);
});

test('editing one form field only changes that form', () => {
    const { card } = mountCard();
    fieldOf(blocks(card)[1], 'appearance').textContent = 'tiny dragon';
    fieldOf(blocks(card)[1], 'appearance').value = 'tiny dragon';
    const record = readRecord(card, SAVED);
    assert.equal(record.forms[0].appearance, 'dragon');
    assert.equal(record.forms[1].appearance, 'tiny dragon');
});

test('add / reorder / delete in the card editor are what the page reads', () => {
    const { window, card } = mountCard();
    click(window, card.querySelector('[data-sd-form-add]'));
    assert.equal(blocks(card).length, 3);
    fieldOf(blocks(card)[2], 'name').value = '蛇形';
    click(window, blocks(card)[2].querySelector('[data-sd-form-up]'));
    assert.deepEqual(blocks(card).map(block => fieldOf(block, 'name').value), ['龙形', '蛇形', '幼龙']);
    click(window, blocks(card)[0].querySelector('[data-sd-form-down]'));
    assert.deepEqual(blocks(card).map(block => fieldOf(block, 'name').value), ['蛇形', '龙形', '幼龙']);
    click(window, blocks(card)[0].querySelector('[data-sd-form-delete]'));
    assert.deepEqual(readRecord(card, SAVED).forms.map(form => form.name), ['龙形', '幼龙']);
    assert.equal(blocks(card)[0].querySelector('.sd-char-form-title').textContent, '龙形');
});

test('deleting every form (or clearing the first form name) removes the keys instead of keeping the saved ones', () => {
    const { window, card } = mountCard();
    blocks(card).forEach(block => click(window, block.querySelector('[data-sd-form-delete]')));
    card.querySelector('[data-sd-char-field="formName"]').value = '';
    const record = readRecord(card, SAVED);
    assert.equal('forms' in record, false);
    assert.equal('formName' in record, false);
});

test('a just-added blank form survives a draft read but not a save read', () => {
    const { window, card } = mountCard({ id: 'x', name: 'X' });
    assert.equal(blocks(card).length, 0);
    click(window, card.querySelector('[data-sd-form-add]'));
    assert.equal(readRecord(card, { id: 'x' }, { keepEmpty: true }).forms.length, 1);
    assert.equal('forms' in readRecord(card, { id: 'x' }, { keepEmpty: false }), false);
    fieldOf(blocks(card)[0], 'name').value = '龙形';
    assert.equal(readRecord(card, { id: 'x' }, { keepEmpty: false }).forms[0].name, '龙形');
});

test('a card without the form editor leaves the saved forms untouched', () => {
    const { document } = parseHTML('<html><body><details class="sd-char-card"></details></body></html>');
    const card = document.querySelector('.sd-char-card');
    assert.equal(readFormsFromCard(card), null);
    const record = applyFormFieldsFromCard({ ...SAVED }, card);
    assert.equal(record.forms.length, 2);
    assert.equal(record.formName, '人形');
});

test('form block fields do not collide with the card-level data-sd-char-field fields', () => {
    const { card } = mountCard();
    card.append(Object.assign(card.ownerDocument.createElement('textarea'), { value: 'top' }));
    assert.equal(card.querySelectorAll('[data-sd-char-field="appearance"]').length, 0);
    assert.equal(card.querySelectorAll('[data-sd-form-field="appearance"]').length, 2);
});

test('text-box lines round trip through the same named-tag parser the top-level fields use', () => {
    const lines = serializeNamedTagLines([{ name: '鳞甲', tags: 'scales', enabled: false }]);
    assert.equal(lines, '# 鳞甲 = scales');
    assert.deepEqual(parseNamedTagLines(lines), [{ name: '鳞甲', tags: 'scales', enabled: false }]);
});

test('SD / ComfyUI form blocks: 复制 inserts a 副本 below with the typed values and no id; 停用 shows 已停用 and saves enabled:false (and 启用 drops it again)', () => {
    const { card } = mountCard();
    const [first] = blocks(card);
    fieldOf(first, 'appearance').value = 'dragon, typed after open';
    click(window0(card), first.querySelector('[data-sd-form-copy]'));
    assert.equal(blocks(card).length, 3);
    const copy = blocks(card)[1];
    assert.equal(fieldOf(copy, 'name').value, '龙形 副本');
    assert.equal(fieldOf(copy, 'appearance').value, 'dragon, typed after open');
    assert.equal(copy.dataset.formId, '', 'no id until saved');
    assert.equal(copy.open, true);
    assert.equal(copy.dataset.enabled, 'true');
    assert.equal(copy.querySelector('.sd-char-form-state').hasAttribute('hidden'), true);

    const toggle = copy.querySelector('[data-sd-form-toggle]');
    assert.ok(toggle.classList.contains('char-enabled-control') && toggle.classList.contains('active'), 'same ticked-square button as the character cards');
    assert.equal(toggle.getAttribute('aria-pressed'), 'true');
    click(window0(card), toggle);
    assert.equal(copy.dataset.enabled, 'false');
    assert.ok(copy.classList.contains('is-disabled'));
    assert.equal(copy.querySelector('.sd-char-form-state').hasAttribute('hidden'), false);
    assert.equal(toggle.getAttribute('aria-pressed'), 'false');
    assert.equal(toggle.classList.contains('active'), false);
    assert.equal(copy.open, true, 'the toggle button inside <summary> does not fold the block');

    const record = readRecord(card, SAVED);
    assert.deepEqual(record.forms.map(form => [form.name, form.enabled]), [['龙形', undefined], ['龙形 副本', false], ['幼龙', undefined]]);
    assert.equal('enabled' in record.forms[0], false);

    click(window0(card), toggle);
    assert.equal(readRecord(card, SAVED).forms[1].enabled, undefined);

    // 第一形态的停用标记（只能在 NovelAI 页面设置）原样保留；没有额外形态后随之清掉
    assert.equal(readRecord(card, { ...SAVED, formDisabled: true }).formDisabled, true);
    blocks(card).forEach(block => click(window0(card), block.querySelector('[data-sd-form-delete]')));
    assert.equal('formDisabled' in readRecord(card, { ...SAVED, formDisabled: true }), false);
});

function window0(card) {
    return card.ownerDocument.defaultView;
}
