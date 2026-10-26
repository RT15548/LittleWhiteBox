// 角色编辑区自动保存的“读表单 / 写回角色 / 状态栏 / 点哪里算展开收起”。
// 什么时候存由 auto-save.js 管；这里只回答“表单现在是什么、合不合法、与上次落盘是否一样”，以及状态栏怎么画。
// 读写的都是编辑卡片的 DOM（不重绘、不动焦点），所以输入过程中可以随时读。

import { escapeHtml as defaultEscapeHtml } from './html-escape.js';
import { applyFormModelsToCharacter, collectFormModels, readFormFields } from './character-edit-form.js';

export const CHARACTER_EDITOR_COPY = Object.freeze({
    nameRequired: '请输入角色名称',
});

/**
 * 读出编辑卡片：{ key, value }（合法）或 { error, value }（没有名称）。
 * key 是内容指纹：只含会存盘的内容（折叠 / 展开这类界面状态不算），与上次落盘相同就不重复保存。
 */
export function readCharacterEditor(card) {
    const text = selector => card.querySelector(selector)?.value ?? '';
    const name = text('.char-edit-name').trim();
    const aliases = text('.char-edit-aliases').split(/[,，]/).map(item => item.trim()).filter(Boolean);
    // 多形态：每张形态卡片一个模型；单形态：整张卡片读成一个（形态名在隐藏输入框里）。
    const models = collectFormModels(card) || [{ ...readFormFields(card), name: text('.char-edit-form-name') }];
    const value = { name, aliases, models };
    const key = JSON.stringify({ name, aliases, models: models.map((model) => { const rest = { ...model }; delete rest.key; return rest; }) });
    return name ? { key, value } : { error: CHARACTER_EDITOR_COPY.nameRequired, value };
}

/** 新建后什么都没填：收起 / 切走时直接丢掉，不算“有未保存的内容”。 */
export function isBlankCharacterEditor(card) {
    const { value } = readCharacterEditor(card);
    return !value.name && !value.aliases.length && value.models.every(model => !model.name && !model.appearance
        && !model.negativeTags && !model.danbooruTag && !model.outfits?.length && !model.dynamicStates?.length);
}

/** 把读出的内容写回角色对象（原地）。 */
export function applyCharacterEdit(char, { name, aliases, models }) {
    char.name = name;
    char.aliases = aliases;
    return applyFormModelsToCharacter(char, models);
}

/** 点在摘要行上的这些控件时不展开 / 收起：按钮（启用、更多、菜单项）、输入框、勾选框、拖动手柄、“…”菜单。 */
export function isCharacterRowToggleTarget(target) {
    const summary = target?.closest?.('.char-card-summary');
    return !!summary && !target.closest('button, a, input, select, textarea, label, [data-drag-char], [data-card-menu], [role="menu"]');
}

/** 吸顶栏里的保存状态（已保存 / 保存中… / 未保存：原因）；state 同 auto-save.js 的 onStatus。 */
export function renderCharacterSaveStatus(state = 'saved', text = '已保存', escapeHtml = defaultEscapeHtml) {
    return `<span class="char-save-status" role="status" aria-live="polite" data-state="${escapeHtml(state)}">${escapeHtml(text)}</span>`;
}

export function setCharacterSaveStatus(card, state, text) {
    const node = card?.querySelector?.('.char-save-status');
    if (!node) return;
    node.dataset.state = state;
    node.textContent = text;
}
