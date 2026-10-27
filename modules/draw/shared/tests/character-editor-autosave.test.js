// 角色编辑区自动保存的“读表单”：合法性、内容指纹（界面状态不算）、空白草稿、写回角色、点哪里算展开收起。
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { renderCharacterFormSections } from '../character-edit-form.js';
import {
    applyCharacterEdit, isBlankCharacterEditor, isCharacterRowToggleTarget, readCharacterEditor,
    renderCharacterSaveStatus,
} from '../character-editor-autosave.js';

function cardOf({ name = '阿璃', aliases = '', appearance = 'silver hair', outfits = [{ name: '白裙', tags: 'white dress' }] } = {}) {
    const single = { type: 'girl', typeCustom: '', appearance, negativeTags: '', danbooruTag: '', outfits, dynamicStates: [], formName: '' };
    const { document } = parseHTML(`<div class="char-card editing" data-id="c1">
        <div class="char-card-summary"><span class="char-name">x</span><button class="char-action-button">b</button><input type="checkbox" class="char-select"><span data-drag-char="c1">⋮⋮</span>${renderCharacterSaveStatus()}</div>
        <div class="char-edit-form"><input class="char-edit-name" value="${name}"><input class="char-edit-aliases" value="${aliases}"><input type="hidden" class="char-edit-form-name" value="">
        ${renderCharacterFormSections(single, { charId: 'c1', escapeHtml: v => String(v), isSectionCollapsed: () => false })}</div></div>`);
    return document.querySelector('.char-card');
}

test('合法：key 只含会存盘的内容，折叠 / 展开这类界面状态不改变 key', () => {
    const card = cardOf();
    const first = readCharacterEditor(card);
    assert.equal(first.error, undefined);
    assert.equal(first.value.name, '阿璃');
    assert.equal(first.value.models[0].outfits[0].tags, 'white dress');
    card.querySelector('.named-tag-item')?.setAttribute('data-expanded', 'false');
    assert.equal(readCharacterEditor(card).key, first.key);
    card.querySelector('.char-edit-appearance').value = 'silver hair, blush';
    assert.notEqual(readCharacterEditor(card).key, first.key);
});

test('名称为空：给出原因而不是 key；别名按中英文逗号拆开', () => {
    const card = cardOf({ name: '  ', aliases: '小璃, 阿离，璃璃' });
    const read = readCharacterEditor(card);
    assert.equal(read.error, '请输入角色名称');
    assert.equal(read.key, undefined);
    assert.deepEqual(read.value.aliases, ['小璃', '阿离', '璃璃']);
});

test('空白草稿：什么都没填才算；填了任何一项就不是', () => {
    const blank = cardOf({ name: '', appearance: '', outfits: [] });
    assert.equal(isBlankCharacterEditor(blank), true);
    blank.querySelector('.char-edit-appearance').value = 'x';
    assert.equal(isBlankCharacterEditor(blank), false);
    assert.equal(isBlankCharacterEditor(cardOf({ name: '', appearance: '', outfits: [], aliases: '甲' })), false);
});

test('写回角色：名称、别名和形态字段都原地更新', () => {
    const char = { id: 'c1', name: '旧', enabled: true };
    const card = cardOf({ aliases: '甲, 乙' });
    applyCharacterEdit(char, readCharacterEditor(card).value);
    assert.equal(char.name, '阿璃');
    assert.deepEqual(char.aliases, ['甲', '乙']);
    assert.equal(char.appearance, 'silver hair');
    assert.equal(char.outfits[0].name, '白裙');
    assert.equal(char.enabled, true);
});

test('点摘要行的空白与文字算展开 / 收起；按钮、勾选框、拖动手柄、输入框不算', () => {
    const card = cardOf();
    assert.equal(isCharacterRowToggleTarget(card.querySelector('.char-card-summary')), true);
    assert.equal(isCharacterRowToggleTarget(card.querySelector('.char-name')), true);
    assert.equal(isCharacterRowToggleTarget(card.querySelector('.char-save-status')), true);
    assert.equal(isCharacterRowToggleTarget(card.querySelector('.char-action-button')), false);
    assert.equal(isCharacterRowToggleTarget(card.querySelector('.char-select')), false);
    assert.equal(isCharacterRowToggleTarget(card.querySelector('[data-drag-char]')), false);
    assert.equal(isCharacterRowToggleTarget(card.querySelector('.char-edit-name')), false, '表单正文不在摘要行里');
});
