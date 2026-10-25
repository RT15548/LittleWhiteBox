// SD WebUI / ComfyUI 角色卡片里的“形态”编辑区（用 DOM API 构建，不拼 HTML 字符串）。
// 卡片顶层的 类型 / 固定外貌（正向 + 负向） / Danbooru Tag / 服装 / 动态标签 就是第一形态，这里编辑的是“额外形态”（character.forms，见 character-forms.js）。
// 每个额外形态是一个可折叠的块（<details>），含 形态名称 + 与顶层相同的字段，另有 复制 / 停用·启用 / 上移 / 下移 / 删除（停用后摘要里出现“已停用”，停用状态只属于本机）。
// 第一形态（卡片顶层字段）在这里没有停用按钮：它的 formDisabled 标记（NovelAI 页面设置）原样保留。
// 字段输入框由页面传入的 createField 构建（与顶层字段同一套），只是用 data-sd-form-field 标记，避免和顶层的 data-sd-char-field 混淆。
// 草稿安全：读卡片（readFormsFromCard）会保留空白形态，让未保存时重绘列表不丢失刚点“添加形态”的块；保存前由 normalizeForms 丢弃空白形态。
// 不得 import 酒馆宿主模块。

import { MAX_CHARACTER_FORMS, normalizeForms } from './character-forms.js';
import { makeCopyLabel, parseNamedTagLines, serializeNamedTagLines } from './named-tag-items.js';
import { EXTRA_TAGS_COPY, FIXED_APPEARANCE_COPY, ITEM_MENU_COPY } from './character-editor-copy.js';
import { createCharacterActionIcon } from './character-action-icons.js';

export const FORM_FIELD_KEY = 'sdFormField';
const FORM_FIELD_ATTR = 'data-sd-form-field';

const FIELD_SPECS = Object.freeze([
    { field: 'name', label: '形态名称', placeholder: '形态名称' },
    { field: 'type', label: '类型', placeholder: '例如 girl / boy / no humans' },
    { field: 'appearance', group: 'fixedAppearance' }, // 与 negativeTags 一起放进“固定外貌”分组（createFixedAppearanceGroup）
    { field: 'negativeTags', group: 'fixedAppearance' },
    { field: 'danbooruTag', label: 'Danbooru Tag', placeholder: '可选' },
    { field: 'outfits', label: '服装参考（每行一套，行首加 # 停用）', placeholder: '校服 = white shirt, pleated skirt', multiline: true },
    { field: 'dynamicStates', label: `${EXTRA_TAGS_COPY.title}（每行一条，行首加 # 停用）`, placeholder: '脸红 = blush, looking away', multiline: true },
]);

/**
 * “固定外貌”分组（SD WebUI / ComfyUI 卡片顶层与额外形态共用）：标题 + 一行说明 + 两个输入框（正向 appearance、负向 negativeTags）。
 * 输入框仍由页面的 createField 构建，字段名与读取方式不变；dataKey 缺省时用页面默认的 data-sd-char-field。
 */
export function createFixedAppearanceGroup({ document, createField, values = {}, dataKey } = {}) {
    const group = el(document, 'div', 'form-group sd-char-fieldgroup');
    group.append(
        el(document, 'label', 'form-label', FIXED_APPEARANCE_COPY.title),
        el(document, 'p', 'form-hint char-section-hint', FIXED_APPEARANCE_COPY.hint),
    );
    const options = { multiline: true, ...(dataKey ? { dataKey } : {}) };
    group.append(
        createField(FIXED_APPEARANCE_COPY.positiveLabel, 'appearance', values.appearance || '', '会拼进角色外观提示词', options),
        createField(FIXED_APPEARANCE_COPY.negativeLabel, 'negativeTags', values.negativeTags || '', '避免的特征 / negative 标签', options),
    );
    return group;
}

let nextBlockUid = 0;

function el(document, tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

function iconButton(document, className, icon, label, attr) {
    const button = el(document, 'button', className);
    button.type = 'button';
    button.setAttribute(attr, '');
    button.title = label;
    button.setAttribute('aria-label', label);
    const i = el(document, 'i', `fa-solid ${icon}`);
    i.setAttribute('aria-hidden', 'true');
    button.append(i);
    return button;
}

/** 停用 / 启用后同步块的标记、样式、“已停用”标签和切换按钮的图标与提示。 */
function setBlockEnabled(block, enabled) {
    block.dataset.enabled = String(enabled);
    block.classList.toggle('is-disabled', !enabled);
    const state = block.querySelector('.sd-char-form-state');
    state?.toggleAttribute('hidden', enabled);
    const toggle = block.querySelector('[data-sd-form-toggle]');
    if (!toggle) return;
    const label = `${enabled ? ITEM_MENU_COPY.disable : ITEM_MENU_COPY.enable}形态`;
    toggle.title = label;
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-pressed', String(enabled));
    toggle.classList.toggle('active', enabled);
    while (toggle.firstChild) toggle.removeChild(toggle.firstChild);
    toggle.append(createCharacterActionIcon(block.ownerDocument, enabled ? 'enabled' : 'disabled'));
}

/** 启用开关：与角色卡 / NovelAI 条目头部同款的打勾方块图标按钮（外观来自 preset-list-view.css 的 .char-action-button）。 */
function enabledToggleButton(document) {
    const button = el(document, 'button', 'char-action-button char-enabled-control');
    button.type = 'button';
    button.setAttribute('data-sd-form-toggle', '');
    return button;
}

function formTitleText(name, index) {
    return String(name || '').trim() || `形态 ${index + 1}`;
}

function formValueOf(form, field) {
    if (field === 'outfits' || field === 'dynamicStates') return serializeNamedTagLines(form[field] || []);
    if (field === 'type') return form.type || 'girl';
    return form[field] || '';
}

/** 构建一个额外形态的块。 */
export function createFormBlock({ document, form = {}, index = 0, createField, open = false }) {
    nextBlockUid += 1;
    const block = el(document, 'details', 'sd-char-form');
    block.open = open;
    block.dataset.formId = String(form.id || '');
    block.dataset.formUid = `sd-form-${nextBlockUid}`;
    block.dataset.enabled = String(form.enabled !== false);

    const summary = el(document, 'summary', 'sd-char-form-summary');
    const title = el(document, 'span', 'sd-char-form-title', formTitleText(form.name, index));
    const state = el(document, 'span', 'sd-char-form-state', ITEM_MENU_COPY.disabledTag);
    const tools = el(document, 'span', 'sd-char-form-tools');
    tools.append(
        enabledToggleButton(document),
        iconButton(document, 'btn btn-sm', 'fa-clone', `${ITEM_MENU_COPY.duplicate}形态`, 'data-sd-form-copy'),
        iconButton(document, 'btn btn-sm', 'fa-arrow-up', '上移形态', 'data-sd-form-up'),
        iconButton(document, 'btn btn-sm', 'fa-arrow-down', '下移形态', 'data-sd-form-down'),
        iconButton(document, 'btn btn-danger btn-sm', 'fa-trash', '删除形态', 'data-sd-form-delete'),
    );
    summary.append(title, state, tools);

    const body = el(document, 'div', 'sd-char-form-body');
    for (const spec of FIELD_SPECS) {
        if (spec.group) {
            if (spec.field === 'appearance') body.append(createFixedAppearanceGroup({ document, createField, values: form, dataKey: FORM_FIELD_KEY }));
            continue;
        }
        body.append(createField(spec.label, spec.field, formValueOf(form, spec.field), spec.placeholder, {
            multiline: spec.multiline === true,
            dataKey: FORM_FIELD_KEY,
        }));
    }
    block.append(summary, body);
    setBlockEnabled(block, form.enabled !== false);
    block.addEventListener('input', (event) => {
        if (event.target?.getAttribute?.(FORM_FIELD_ATTR) === 'name') {
            const blocks = Array.from(block.parentElement?.children || []);
            title.textContent = formTitleText(event.target.value, Math.max(0, blocks.indexOf(block)));
        }
    });
    return block;
}

function renumber(list) {
    Array.from(list.children).forEach((block, index) => {
        const name = block.querySelector(`[${FORM_FIELD_ATTR}="name"]`)?.value;
        const title = block.querySelector('.sd-char-form-title');
        if (title) title.textContent = formTitleText(name, index);
    });
}

/**
 * 构建形态编辑区：标题行（含“添加形态”）+ 额外形态的块列表 + 说明。点击都在容器上委托，页面不需要再接线。
 * @param {object} options
 * @param {Document} options.document
 * @param {object[]} [options.forms] 额外形态（character.forms）
 * @param {function} options.createField 页面的字段构建函数 (label, field, value, placeholder, { multiline, dataKey })
 */
export function createFormsEditor({ document, forms = [], createField }) {
    const root = el(document, 'div', 'sd-char-forms');
    const head = el(document, 'div', 'sd-char-forms-head');
    head.append(el(document, 'span', 'form-label', '额外形态（可选）'));
    const addButton = el(document, 'button', 'btn btn-sm');
    addButton.type = 'button';
    addButton.setAttribute('data-sd-form-add', '');
    const addIcon = el(document, 'i', 'fa-solid fa-plus');
    addIcon.setAttribute('aria-hidden', 'true');
    addButton.append(addIcon, el(document, 'span', '', '添加形态'));
    head.append(addButton);

    const list = el(document, 'div', 'sd-char-form-list');
    forms.forEach((form, i) => list.append(createFormBlock({ document, form, index: i + 1, createField })));
    const hint = el(document, 'p', 'form-hint',
        '同一角色的不同样子，独立的类型、外貌、服装与动态标签；未提及默认第一个形态');
    root.append(head, list, hint);

    const syncAddButton = () => {
        const full = list.children.length + 1 >= MAX_CHARACTER_FORMS;
        addButton.disabled = full;
        addButton.title = full ? `一个角色最多 ${MAX_CHARACTER_FORMS} 个形态` : '';
    };
    syncAddButton();

    root.addEventListener('click', (event) => {
        const target = event.target;
        const button = target?.closest?.('[data-sd-form-add], [data-sd-form-copy], [data-sd-form-toggle], [data-sd-form-up], [data-sd-form-down], [data-sd-form-delete]');
        if (!button || !root.contains(button)) return;
        // 按钮在 <summary> 里：阻止它顺带切换折叠。
        event.preventDefault();
        event.stopPropagation();
        if (button.hasAttribute('data-sd-form-add')) {
            if (list.children.length + 1 >= MAX_CHARACTER_FORMS) return;
            const block = createFormBlock({ document, form: {}, index: list.children.length + 1, createField, open: true });
            list.append(block);
            renumber(list);
            syncAddButton();
            block.querySelector(`[${FORM_FIELD_ATTR}="name"]`)?.focus?.();
            return;
        }
        const block = button.closest('.sd-char-form');
        if (!block) return;
        if (button.hasAttribute('data-sd-form-toggle')) {
            setBlockEnabled(block, block.dataset.enabled === 'false');
            return;
        }
        if (button.hasAttribute('data-sd-form-copy')) {
            if (list.children.length + 1 >= MAX_CHARACTER_FORMS) return;
            // 副本：当前输入框里的内容（含未保存的修改），名称加“副本”，没有 id（保存后才是独立的形态），展开、启用，紧跟在原形态后面。
            const values = { ...readFormBlock(block) };
            delete values.id;
            delete values.enabled;
            const copy = createFormBlock({
                document, form: { ...values, name: makeCopyLabel(values.name) }, index: list.children.length + 1, createField, open: true,
            });
            list.insertBefore(copy, block.nextElementSibling);
            renumber(list);
            syncAddButton();
            copy.scrollIntoView?.({ block: 'nearest' });
            copy.querySelector(`[${FORM_FIELD_ATTR}="name"]`)?.focus?.();
            return;
        }
        if (button.hasAttribute('data-sd-form-delete')) {
            block.remove();
        } else if (button.hasAttribute('data-sd-form-up')) {
            if (block.previousElementSibling) list.insertBefore(block, block.previousElementSibling);
        } else if (block.nextElementSibling) {
            list.insertBefore(block.nextElementSibling, block);
        }
        renumber(list);
        syncAddButton();
    });
    return root;
}

/**
 * 读出卡片里全部额外形态（按 DOM 顺序）。保留空白形态（草稿里刚添加的块），空白的丢弃交给 normalizeForms（保存 / 导出前）。
 * 没有形态编辑区的卡片返回 null（调用方据此保留已保存的 forms）。
 */
export function readFormsFromCard(card) {
    const list = card?.querySelector?.('.sd-char-form-list');
    if (!list) return null;
    return Array.from(list.querySelectorAll('.sd-char-form')).map(readFormBlock);
}

/** 读出一个形态块（停用时带 enabled:false，启用时不带该键）。 */
function readFormBlock(block) {
    const read = field => String(block.querySelector(`[${FORM_FIELD_ATTR}="${field}"]`)?.value || '');
    return {
        ...(block.dataset.formId ? { id: block.dataset.formId } : {}),
        name: read('name').trim(),
        type: read('type').trim() || 'girl',
        appearance: read('appearance').trim(),
        negativeTags: read('negativeTags').trim(),
        danbooruTag: read('danbooruTag').trim(),
        outfits: parseNamedTagLines(read('outfits')),
        dynamicStates: parseNamedTagLines(read('dynamicStates')),
        ...(block.dataset.enabled === 'false' ? { enabled: false } : {}),
    };
}

/**
 * 把表单读出的字段并入角色记录（页面的 readCharacterCardsFromForm 先展开已保存记录再覆盖字段，清空字段需要显式删除）：
 * formName 为空、没有额外形态时不留这两个键；表单里没有形态编辑区时原样保留记录里的 forms。
 * @param {object} record 已展开的角色记录（会被修改）
 * @param {Element} card
 * @param {{keepEmpty?: boolean}} [options] keepEmpty 时保留空白形态（草稿）；否则丢弃（保存 / 导出）
 */
export function applyFormFieldsFromCard(record, card, { keepEmpty = false } = {}) {
    const formNameInput = card.querySelector('[data-sd-char-field="formName"]');
    if (formNameInput) {
        const formName = String(formNameInput.value || '').trim();
        if (formName) record.formName = formName; else delete record.formName;
    }
    const forms = readFormsFromCard(card);
    if (forms) {
        const finalForms = keepEmpty ? forms : normalizeForms(forms);
        if (finalForms.length) record.forms = finalForms; else delete record.forms;
        // 第一形态的停用标记只在有额外形态时才有意义。
        if (!finalForms.length) delete record.formDisabled;
    }
    return record;
}
