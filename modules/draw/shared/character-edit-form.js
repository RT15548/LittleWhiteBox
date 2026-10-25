// 单角色编辑卡片的表单片段：可折叠分区、服装 / 动态标签条目（折叠 + 单条启用）的渲染、同步与读取。
// 只拼 HTML 字符串并操作传入的 DOM 节点，不依赖酒馆宿主模块；插入文档前由调用方负责 sanitize。
// 折叠状态全是界面状态：条目折叠只活在 DOM 的 data-expanded 上，经草稿（collect 的 withUiState）带过重绘；
// 分区折叠按卡片 id 记在 createEditorSectionState() 里，整个页面会话内有效；两者都不进入保存的数据。

import { createSortableList } from './sortable-list.js';
import { escapeHtml as defaultEscapeHtml } from './html-escape.js';
import { createCharacterActionIcon, renderCharacterActionIcon } from './character-action-icons.js';
import { movePresetId } from './preset-order.js';
import {
    isNamedTagEnabled,
    isNamedTagItemExpanded,
    makeCopyLabel,
    normalizeNamedTagList,
    previewNamedTags,
} from './named-tag-items.js';
import {
    MAX_CHARACTER_FORMS,
    getCharacterForms,
    normalizeForms,
} from './character-forms.js';
import {
    EXTRA_TAGS_COPY,
    FIXED_APPEARANCE_COPY,
    ITEM_MENU_COPY,
    NAMED_TAG_EMPTY_TEXT,
    NAMED_TAG_TAGS_LABEL,
} from './character-editor-copy.js';

// 角色 id 与形态 key 的拼接分隔符：分区折叠记录、Danbooru 搜索面板都用“角色 id#形态 key”区分同一角色的不同形态。
export const FORM_REF_SEPARATOR = '#';

export const EDITOR_SECTION_KEYS = Object.freeze(['appearance', 'outfits', 'dynamicStates']);

export const NAMED_TAG_EDITOR_KINDS = Object.freeze({
    outfit: {
        classPrefix: 'char-outfit',
        title: '服装',
        nameLabel: '服装名称',
        nameHint: '点击修改名称，如：常服、礼服、战斗服',
        tagsLabel: NAMED_TAG_TAGS_LABEL,
        tagsPlaceholder: 'white shirt, black skirt, ribbon...',
        removeAction: 'remove-outfit',
    },
    dynstate: {
        classPrefix: 'char-dynstate',
        title: EXTRA_TAGS_COPY.title,
        nameLabel: EXTRA_TAGS_COPY.nameLabel,
        nameHint: EXTRA_TAGS_COPY.nameHint,
        tagsLabel: NAMED_TAG_TAGS_LABEL,
        tagsPlaceholder: 'blush, looking away...',
        removeAction: 'remove-dynstate',
    },
});

let nextItemUid = 0; // 条目行的界面内唯一标识：拖拽排序按它认行（下标会随排序变化）
const ENABLED_HINT = '停用后不会发给 AI';

/** 重排 / 增删后刷新头部三个按钮的无障碍名称里的序号（subject 如“服装 2”）。 */
function relabelEditorActions(row, subject, enabled) {
    const toggleLabel = enabled ? ITEM_MENU_COPY.disable : ITEM_MENU_COPY.enable;
    row.querySelector('.editor-item-enabled-toggle')?.setAttribute('aria-label', `${toggleLabel} ${subject}`);
    row.querySelector('.editor-item-delete')?.setAttribute('aria-label', `${ITEM_MENU_COPY.remove} ${subject}`);
    row.querySelector('.char-menu-button')?.setAttribute('aria-label', `${ITEM_MENU_COPY.more} ${subject}`);
    row.querySelector('.char-menu')?.setAttribute('aria-label', `${ITEM_MENU_COPY.more} ${subject}`);
}

function kindMeta(kind) {
    return NAMED_TAG_EDITOR_KINDS[kind] || NAMED_TAG_EDITOR_KINDS.outfit;
}

/** 条目 / 形态行的折叠状态只改 DOM（行上的标记、折叠样式、正文可见性、箭头按钮的 aria-expanded）。 */
function setRowFolded(row, expanded, { body, toggle }) {
    row.dataset.expanded = String(expanded);
    row.classList.toggle('is-folded', !expanded);
    row.querySelector(body)?.toggleAttribute('hidden', !expanded);
    row.querySelector(toggle)?.setAttribute('aria-expanded', String(expanded));
}

/** 按 ids 的新顺序重排 list 里的 rows（真实移动 DOM 节点，输入框里未保存的内容、折叠与启用状态原样跟着走）；ids 里没有的行保持相对顺序排在最后。 */
function moveRowsToOrder(list, rows, ids, getId) {
    const byId = new Map(rows.map(row => [getId(row), row]));
    const ordered = [];
    for (const id of Array.isArray(ids) ? ids : []) {
        const row = byId.get(id);
        if (row && !ordered.includes(row)) ordered.push(row);
    }
    for (const row of rows) if (!ordered.includes(row)) ordered.push(row);
    const anchor = rows.length ? rows[rows.length - 1].nextSibling : null;
    ordered.forEach(row => list.insertBefore(row, anchor));
}

// ── 条目 / 形态头部的操作 ─────────────────────────────────────
// 头部右侧依次是：“已停用”小标签（停用时才显示）、启用开关（与角色卡外面同款的打勾方块图标按钮，.char-enabled-control）、
// “…”菜单（复制、删除；删除是危险样式的菜单项，以后要加别的操作直接往菜单里加）。
// 菜单与角色卡外面是同一套标记和样式（.char-menu*，开关与定位由 character-card-menu.js 的 getCardMenu() 负责），
// 菜单按钮的 data-action="menu" 由页面的点击委托交给菜单控制器。

/** 启用开关按钮里的图标：启用 = 打勾方块，停用 = 空方块（与角色卡同一份图形）。 */
const enabledIconName = enabled => (enabled ? 'enabled' : 'disabled');

/**
 * 头部右侧的操作区。duplicateAction / toggleAction / removeAction 是三个按钮的 data-action（条目和形态各用各的）；
 * removeAttrs 原样放在菜单里的删除项上（条目的 data-index、形态的 data-form-key）；subject 是无障碍名称里的对象（如“服装 1”）。
 */
export function renderEditorItemMenu({ subject, enabled = true, duplicateAction, toggleAction, removeAction, removeAttrs = '' }) {
    const toggleLabel = enabled ? ITEM_MENU_COPY.disable : ITEM_MENU_COPY.enable;
    const moreLabel = `${ITEM_MENU_COPY.more} ${subject}`;
    return `
            <span class="editor-item-state" title="${ENABLED_HINT}">${ITEM_MENU_COPY.disabledTag}</span>
            <button type="button" class="char-action-button char-enabled-control editor-item-enabled-toggle${enabled ? ' active' : ''}" data-action="${toggleAction}" title="${toggleLabel}" aria-label="${toggleLabel} ${subject}" aria-pressed="${enabled}">${renderCharacterActionIcon(enabledIconName(enabled))}</button>
            <span class="char-menu-wrap" data-card-menu>
                <button type="button" class="char-action-button char-menu-button" data-action="menu" title="${ITEM_MENU_COPY.more}" aria-label="${moreLabel}" aria-haspopup="menu" aria-expanded="false"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i></button>
                <div class="char-menu" role="menu" aria-label="${moreLabel}" hidden>
                    <button type="button" role="menuitem" class="char-menu-item" data-action="${duplicateAction}" title="${ITEM_MENU_COPY.duplicate}"><i class="fa-solid fa-clone" aria-hidden="true"></i><span class="char-menu-label">${ITEM_MENU_COPY.duplicate}</span></button>
                    <button type="button" role="menuitem" class="char-menu-item danger editor-item-delete" data-action="${removeAction}"${removeAttrs ? ` ${removeAttrs}` : ''} title="${ITEM_MENU_COPY.remove}" aria-label="${ITEM_MENU_COPY.remove} ${subject}"><i class="fa-solid fa-trash" aria-hidden="true"></i><span class="char-menu-label">${ITEM_MENU_COPY.remove}</span></button>
                </div>
            </span>`;
}

/** 停用 / 启用后同步启用开关按钮的图标、选中态、提示和无障碍状态（不碰别的内容）。 */
function syncEnabledToggleItem(root, enabled) {
    const button = root?.querySelector('.editor-item-enabled-toggle');
    if (!button) return;
    const label = enabled ? ITEM_MENU_COPY.disable : ITEM_MENU_COPY.enable;
    const subject = (button.getAttribute('aria-label') || '').split(' ').slice(1).join(' ');
    button.classList.toggle('active', enabled);
    button.setAttribute('title', label);
    button.setAttribute('aria-label', subject ? `${label} ${subject}` : label);
    button.setAttribute('aria-pressed', String(enabled));
    while (button.firstChild) button.removeChild(button.firstChild);
    button.appendChild(createCharacterActionIcon(button.ownerDocument, enabledIconName(enabled)));
}

// ── 可折叠分区 ──────────────────────────────────────────────

/** 各卡片的分区折叠状态（只记折叠的；默认全部展开）。cardId → Set<sectionKey>。 */
export function createEditorSectionState() {
    const collapsedByCard = new Map();
    const isKnown = key => EDITOR_SECTION_KEYS.includes(key);
    const api = {
        isCollapsed(cardId, key) {
            return collapsedByCard.get(String(cardId))?.has(key) === true;
        },
        setCollapsed(cardId, key, collapsed) {
            if (!isKnown(key)) return;
            const id = String(cardId);
            const set = collapsedByCard.get(id) || new Set();
            if (collapsed) set.add(key); else set.delete(key);
            if (set.size) collapsedByCard.set(id, set); else collapsedByCard.delete(id);
        },
        /** 切换并返回切换后是否折叠。 */
        toggle(cardId, key) {
            const next = !api.isCollapsed(cardId, key);
            api.setCollapsed(cardId, key, next);
            return next;
        },
        /** 丢弃已经不存在的卡片的记录（形态的记录 id 形如“角色 id#形态 key”，按角色 id 判断）。 */
        prune(validIds) {
            const valid = new Set(Array.from(validIds, String));
            for (const id of Array.from(collapsedByCard.keys())) {
                if (!valid.has(id.split(FORM_REF_SEPARATOR)[0])) collapsedByCard.delete(id);
            }
        },
    };
    return api;
}

/** 一个分区：标题行（折叠箭头 + 标题 + 数量 + 右侧操作）+ 正文。title 与 actionsHtml 由调用方保证已转义。 */
export function renderEditorSection({ key, title, collapsed = false, actionsHtml = '', bodyHtml = '' }) {
    return `
    <div class="form-group char-edit-section${collapsed ? ' is-collapsed' : ''}" data-section="${key}">
        <div class="char-section-head">
            <button type="button" class="char-section-toggle" data-action="toggle-section" data-section="${key}" aria-expanded="${!collapsed}" title="展开 / 折叠">
                <i class="fa-solid fa-chevron-down char-section-chevron" aria-hidden="true"></i>
                <span class="char-section-title">${title}</span>
                <span class="char-section-count"></span>
            </button>
            ${actionsHtml ? `<span class="char-section-actions">${actionsHtml}</span>` : ''}
        </div>
        <div class="char-section-body"${collapsed ? ' hidden' : ''}>${bodyHtml}</div>
    </div>`;
}

/** 只改 DOM 不重绘：避免丢失其他输入框里尚未保存的内容。 */
export function setEditorSectionCollapsed(section, collapsed) {
    if (!section) return;
    section.classList.toggle('is-collapsed', collapsed);
    section.querySelector('.char-section-body')?.toggleAttribute('hidden', collapsed);
    section.querySelector('.char-section-toggle')?.setAttribute('aria-expanded', String(!collapsed));
}

// ── 服装 / 动态标签条目 ─────────────────────────────────────

/**
 * 渲染一个条目。item 可带 enabled（false 才算停用）与 expanded（草稿里的展开状态）；
 * total 是列表条目总数，决定折叠规则（见 isNamedTagItemExpanded）。
 */
export function renderNamedTagEditorItem(item = {}, index = 0, kind = 'outfit', { total = 1, escapeHtml = defaultEscapeHtml } = {}) {
    const meta = kindMeta(kind);
    const p = meta.classPrefix;
    const enabled = isNamedTagEnabled(item);
    const expanded = isNamedTagItemExpanded(item, total);
    nextItemUid += 1;
    return `
    <div class="${p}-editor-item named-tag-item${enabled ? '' : ' is-disabled'}${expanded ? '' : ' is-folded'}" data-index="${index}" data-uid="nt-${nextItemUid}" data-enabled="${enabled}" data-expanded="${expanded}">
        <div class="${p}-editor-header named-tag-header" data-action="toggle-named-item">
            <span class="char-drag-handle named-tag-drag" role="button" tabindex="0" data-named-drag title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整${meta.title} ${index + 1} 的顺序">⋮⋮</span>
            <button type="button" class="named-tag-toggle" aria-expanded="${expanded}" title="展开 / 折叠" aria-label="展开 / 折叠${meta.title} ${index + 1}">
                <i class="fa-solid fa-chevron-down named-tag-chevron" aria-hidden="true"></i>
            </button>
            <input type="text" class="${p}-name named-tag-name inline-name" value="${escapeHtml(item.name || '')}" placeholder="${meta.nameLabel}" title="${meta.nameHint}" aria-label="${meta.nameLabel}">
            <span class="named-tag-preview">${escapeHtml(previewNamedTags(item.tags))}</span>
            ${renderEditorItemMenu({
                subject: `${meta.title} ${index + 1}`,
                enabled,
                duplicateAction: 'duplicate-named-item',
                toggleAction: 'toggle-named-enabled',
                removeAction: meta.removeAction,
                removeAttrs: `data-index="${index}"`,
            })}
        </div>
        <div class="${p}-editor-body named-tag-body"${expanded ? '' : ' hidden'}>
            <div class="form-group">
                <label class="form-label">${meta.tagsLabel}</label>
                <textarea class="input ${p}-tags" rows="1" data-autofit placeholder="${meta.tagsPlaceholder}">${escapeHtml(item.tags || '')}</textarea>
            </div>
        </div>
    </div>`;
}

/** 一组条目的 HTML；总数决定折叠规则。 */
export function renderNamedTagEditorItems(items = [], kind = 'outfit', options = {}) {
    const list = Array.isArray(items) ? items : [];
    return list.map((item, index) => renderNamedTagEditorItem(item, index, kind, { ...options, total: list.length })).join('');
}

function rowsOf(list, kind) {
    return Array.from(list.querySelectorAll(`.${kindMeta(kind).classPrefix}-editor-item`));
}

/** 按 TAG 输入框刷新折叠头里的预览（折叠时看不到输入框，所以折叠 / 重排时都要刷新）；名称输入框就在头部，本身就是实时的。 */
export function refreshNamedTagItemHeader(row, kind = 'outfit') {
    const p = kindMeta(kind).classPrefix;
    if (!row) return;
    const preview = row.querySelector('.named-tag-preview');
    if (preview) preview.textContent = previewNamedTags(row.querySelector(`.${p}-tags`)?.value);
}

export function setNamedTagItemExpanded(row, expanded, kind = 'outfit') {
    if (!row) return;
    setRowFolded(row, expanded, { body: '.named-tag-body', toggle: '.named-tag-toggle' });
    if (!expanded) refreshNamedTagItemHeader(row, kind);
}

/** 点在折叠头上的这些控件时不切换折叠：名称输入框（点一下就编辑）、拖动手柄、“…”菜单（按钮和浮层的空白处）；菜单项自带 data-action，不会落到折叠头上。 */
export function isNamedTagHeaderToggleTarget(target) {
    return !target?.closest?.('input, textarea, label, [data-named-drag], [data-card-menu]');
}

/** 点折叠头：返回切换后是否展开。 */
export function toggleNamedTagItem(row, kind = 'outfit') {
    const next = row?.dataset.expanded !== 'true';
    setNamedTagItemExpanded(row, next, kind);
    return next;
}

/** 同步启用状态：行上的标记、停用样式（含头部“已停用”标签）和菜单里“停用 / 启用”一项的文案。 */
export function setNamedTagItemEnabled(row, enabled) {
    if (!row) return;
    row.dataset.enabled = String(enabled);
    row.classList.toggle('is-disabled', !enabled);
    syncEnabledToggleItem(row, enabled);
}

/** 条目行属于哪种列表（服装 / 动态标签）。 */
export function namedTagKindOfRow(row) {
    return row?.classList.contains('char-dynstate-editor-item') ? 'dynstate' : 'outfit';
}

/** 菜单里的“停用 / 启用”：翻转这一条的启用状态，并更新分区标题行里的“启用数/总数”。返回翻转后的状态。 */
export function toggleNamedTagItemEnabled(row) {
    if (!row) return true;
    const kind = namedTagKindOfRow(row);
    const next = row.dataset.enabled === 'false';
    setNamedTagItemEnabled(row, next);
    syncNamedTagEditorList(row.closest(`.${kindMeta(kind).classPrefix}-editor-list`), kind);
    return next;
}

function readRowEnabled(row) {
    return row.dataset.enabled !== 'false';
}

/** 增删条目后整理列表：序号、空状态提示、数量标记；不足折叠门槛时把剩下的条目展开。 */
export function syncNamedTagEditorList(list, kind = 'outfit') {
    if (!list) return;
    const meta = kindMeta(kind);
    const rows = rowsOf(list, kind);
    const empty = list.querySelector(`.${meta.classPrefix}-editor-empty`);
    if (empty) empty.style.display = rows.length ? 'none' : 'block';
    rows.forEach((row, index) => {
        row.dataset.index = String(index);
        const removeBtn = row.querySelector(`[data-action="${meta.removeAction}"]`);
        if (removeBtn) removeBtn.dataset.index = String(index);
        relabelEditorActions(row, `${meta.title} ${index + 1}`, readRowEnabled(row));
        row.querySelector('[data-named-drag]')?.setAttribute('aria-label', `拖动调整${meta.title} ${index + 1} 的顺序`);
        if (rows.length < 2 && row.dataset.expanded !== 'true') setNamedTagItemExpanded(row, true, kind);
        refreshNamedTagItemHeader(row, kind);
    });
    const count = list.closest('.char-edit-section')?.querySelector('.char-section-count');
    if (count) {
        const enabledCount = rows.filter(readRowEnabled).length;
        count.textContent = !rows.length ? '' : (enabledCount === rows.length ? String(rows.length) : `${enabledCount}/${rows.length}`);
    }
}

/**
 * 在列表末尾追加一个空白条目（始终展开）并整理列表，返回新行。
 * insertHtml(target, html, position = 'beforeend') 由调用方提供，负责 sanitize 后插入（本模块不直接写 innerHTML）。
 */
export function appendNamedTagEditorItem(list, kind = 'outfit', { escapeHtml = defaultEscapeHtml, insertHtml } = {}) {
    if (!list || typeof insertHtml !== 'function') return null;
    const rows = rowsOf(list, kind);
    // total 传 1：新条目不受“≥2 条就折叠”约束，永远展开。
    insertHtml(list, renderNamedTagEditorItem({ expanded: true }, rows.length, kind, { total: 1, escapeHtml }));
    syncNamedTagEditorList(list, kind);
    return rowsOf(list, kind).pop() || null;
}

/**
 * 复制一个条目：副本紧跟在原条目下面，名称加“副本”，标签取输入框里当前的内容（含未保存的修改），展开、启用。
 * insertHtml 同 appendNamedTagEditorItem；返回新行。
 */
export function duplicateNamedTagEditorItem(row, kind = 'outfit', { escapeHtml = defaultEscapeHtml, insertHtml } = {}) {
    const p = kindMeta(kind).classPrefix;
    const list = row?.closest(`.${p}-editor-list`);
    if (!list || typeof insertHtml !== 'function') return null;
    const item = {
        name: makeCopyLabel(row.querySelector(`.${p}-name`)?.value),
        tags: row.querySelector(`.${p}-tags`)?.value?.trim() || '',
        expanded: true,
    };
    insertHtml(row, renderNamedTagEditorItem(item, 0, kind, { total: 1, escapeHtml }), 'afterend');
    const copy = row.nextElementSibling;
    syncNamedTagEditorList(list, kind);
    return copy?.classList.contains('named-tag-item') ? copy : null;
}

/**
 * 按 uid 的新顺序重排列表里的条目行（真实移动 DOM 节点，输入框里未保存的内容、折叠与启用状态原样跟着走），
 * 然后整理序号。orderedUids 里没有的行保持相对顺序排在最后。草稿 / 保存都按 DOM 顺序读，所以顺序自然被带过重绘。
 */
export function reorderNamedTagEditorRows(list, kind, orderedUids) {
    if (!list) return;
    moveRowsToOrder(list, rowsOf(list, kind), orderedUids, row => row.dataset.uid);
    syncNamedTagEditorList(list, kind);
}

/**
 * 服装 / 动态标签条目的拖拽 + 键盘（↑ / ↓）排序：直接复用 sortable-list.js 的控制器（与参数 / 提示词预设列表同一套交互），
 * 事件委托在 container 上（编辑中的卡片只有一张，所以每种列表至多一个）。折叠的条目用头部的手柄照样可拖。
 */
export function createNamedTagSortables({ container, document, autoScroll = null, createSortable = createSortableList } = {}) {
    return Object.keys(NAMED_TAG_EDITOR_KINDS).map((kind) => {
        const p = NAMED_TAG_EDITOR_KINDS[kind].classPrefix;
        return createSortable({
            container,
            rowSelector: `.${p}-editor-item`,
            handleSelector: '[data-named-drag]',
            getId: row => row.dataset.uid,
            onReorder: (uids) => {
                const first = uids.map(uid => container.querySelector(`[data-uid="${uid}"]`)).find(Boolean);
                reorderNamedTagEditorRows(first?.closest(`.${p}-editor-list`) || container.querySelector(`.${p}-editor-list`), kind, uids);
            },
            moveStep: movePresetId,
            autoScroll,
            bodyClass: 'char-dragging',
            // 每个形态有自己的服装 / 动态标签列表：只在被拖行所在的列表内排序。
            scopeSelector: `.${p}-editor-list`,
            document,
        });
    });
}

/** 删除一个条目并整理列表。 */
export function removeNamedTagEditorItem(row, kind = 'outfit') {
    const list = row?.closest(`.${kindMeta(kind).classPrefix}-editor-list`);
    row?.remove();
    syncNamedTagEditorList(list, kind);
}

/**
 * 读出列表里所有条目（折叠的也读，输入框只是被隐藏）。停用的条目带 enabled:false，启用的不带该键。
 * keepEmpty：草稿保护时保留刚点“添加服装/动态标签”还没填内容的空行；保存时仍然过滤掉。
 * withUiState：草稿用，额外带上 expanded（界面状态，不会进入保存的数据）。
 */
export function collectNamedTagEditorValues(card, kind = 'outfit', { keepEmpty = false, withUiState = false } = {}) {
    const p = kindMeta(kind).classPrefix;
    return Array.from(card.querySelectorAll(`.${p}-editor-item`)).map(row => ({
        name: row.querySelector(`.${p}-name`)?.value?.trim() || '',
        tags: row.querySelector(`.${p}-tags`)?.value?.trim() || '',
        ...(readRowEnabled(row) ? {} : { enabled: false }),
        ...(withUiState ? { expanded: row.dataset.expanded === 'true' } : {}),
    })).filter(item => keepEmpty || item.name || item.tags);
}

// ── 形态 ────────────────────────────────────────────────────
// 编辑卡片里的“形态”：角色有 ≥2 个形态时，每个形态是一张可折叠、可拖动排序的子卡片（头部 = 拖动手柄 + 折叠箭头 + 名称输入框 + 类型徽标 + 外貌预览 + “…”菜单〔复制 / 停用 / 删除〕），
// 正文是该形态自己的 类型 / 固定外貌（正向 + 负向） / 服装列表 / 动态标签（组件与单形态时完全相同）。只有一个形态时不渲染这些，卡片与以前一样。
// 数据：界面里的每个形态是一个“编辑模型” { key, id, name, type, typeCustom, appearance, negativeTags, danbooruTag, outfits, dynamicStates, enabled?, expanded? }；
// 第一张卡片写回角色顶层字段（formName 等；停用标记写 formDisabled），其余写回 forms（停用写 enabled:false）（见 character-forms.js）。key 只在界面里区分形态，不保存。

export const FORM_MAX_COUNT = MAX_CHARACTER_FORMS;
const FIRST_FORM_KEY = 'main';
let nextFormUid = 0;

export const FORM_COPY = Object.freeze({
    addAction: '添加形态',
    sectionTitle: '形态',
    nameLabel: '形态名称',
    nameHint: '点击修改名称，如：人形、兽形',
    hint: '同一角色的不同样子，独立的类型、外貌、服装与动态标签；未提及默认第一个形态',
    limit: `一个角色最多 ${MAX_CHARACTER_FORMS} 个形态`,
});

export function formRef(charId, formKey = '') {
    return formKey ? `${charId}${FORM_REF_SEPARATOR}${formKey}` : String(charId);
}

export function parseFormRef(ref) {
    const text = String(ref ?? '');
    const at = text.indexOf(FORM_REF_SEPARATOR);
    return at < 0 ? { charId: text, formKey: '' } : { charId: text.slice(0, at), formKey: text.slice(at + 1) };
}

/** 类型下拉框 + 自定义输入框的取值：选“自定义”且填了内容就取内容，否则取下拉框的值（缺省 girl）。 */
export function resolveTypeValue(type, typeCustom) {
    const selected = String(type || 'girl');
    const custom = String(typeCustom || '').trim();
    return selected === 'custom' && custom ? custom : selected;
}

function newFormKey() {
    nextFormUid += 1;
    return `new-${nextFormUid}`;
}

const defaultSplitType = type => ({ type, typeCustom: '' });

/** 新建一个空白形态的编辑模型（始终展开）。 */
export function createBlankFormModel(splitType = defaultSplitType) {
    return {
        key: newFormKey(), id: '', name: '', ...splitType('girl'),
        appearance: '', negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], enabled: true, expanded: true,
    };
}

/** 角色 → 全部形态的编辑模型（第一形态 = 顶层字段）。splitType(savedType) 返回 { type: 下拉框的值, typeCustom }。 */
export function formModelsFromCharacter(character, splitType = defaultSplitType) {
    return getCharacterForms(character).map((form, index) => ({
        key: index === 0 ? FIRST_FORM_KEY : (form.id || newFormKey()),
        id: form.id || '',
        name: form.name,
        ...splitType(form.type),
        appearance: form.appearance,
        negativeTags: form.negativeTags,
        danbooruTag: form.danbooruTag,
        outfits: normalizeNamedTagList(form.outfits),
        dynamicStates: normalizeNamedTagList(form.dynamicStates),
        enabled: form.enabled !== false,
    }));
}

const SINGLE_FORM_DRAFT_KEYS = Object.freeze(['type', 'typeCustom', 'appearance', 'negativeTags', 'danbooruTag', 'outfits', 'dynamicStates', 'formName']);

function omitKeys(source, keys) {
    const rest = { ...source };
    for (const key of keys) delete rest[key];
    return rest;
}

/** 单形态草稿 → 两个形态的多形态草稿：原有内容成为第一形态，再追加一个空白形态。 */
export function draftToMultiForm(draft, splitType) {
    const first = {
        key: FIRST_FORM_KEY, id: '', name: String(draft.formName || ''),
        type: draft.type || 'girl', typeCustom: draft.typeCustom || '',
        appearance: draft.appearance || '', negativeTags: draft.negativeTags || '', danbooruTag: draft.danbooruTag || '',
        outfits: draft.outfits || [], dynamicStates: draft.dynamicStates || [], enabled: true,
    };
    const rest = omitKeys(draft, SINGLE_FORM_DRAFT_KEYS);
    return { ...rest, multi: true, forms: [first, createBlankFormModel(splitType)] };
}

/** 多形态草稿 → 单形态草稿（删到只剩一个形态时回到普通布局）：剩下的第一个形态成为顶层字段（单形态没有可停用的形态，停用状态不带过来）。 */
export function draftToSingleForm(draft) {
    const [only] = draft.forms || [];
    const rest = omitKeys(draft, ['multi', 'forms']);
    return {
        ...rest,
        formName: only?.name || '',
        type: only?.type || 'girl', typeCustom: only?.typeCustom || '',
        appearance: only?.appearance || '', negativeTags: only?.negativeTags || '', danbooruTag: only?.danbooruTag || '',
        outfits: only?.outfits || [], dynamicStates: only?.dynamicStates || [],
    };
}

/**
 * 把编辑模型（按卡片顺序）写回角色对象：第一个是顶层字段，其余是 forms（缺 id 的补发）。
 * 没有有内容的额外形态时不写 forms；formName 为空时不留该键。就地修改并返回 character。
 */
export function applyFormModelsToCharacter(character, models, { makeId = () => `form-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` } = {}) {
    const [first, ...others] = models;
    if (first) {
        character.type = resolveTypeValue(first.type, first.typeCustom);
        character.appearance = String(first.appearance || '').trim();
        character.negativeTags = String(first.negativeTags || '').trim();
        character.danbooruTag = String(first.danbooruTag || '').trim();
        character.outfits = normalizeNamedTagList(first.outfits);
        character.dynamicStates = normalizeNamedTagList(first.dynamicStates);
        const formName = String(first.name || '').trim();
        if (formName) character.formName = formName; else delete character.formName;
        if (first.enabled === false) character.formDisabled = true; else delete character.formDisabled;
    }
    const forms = normalizeForms(others.map(model => ({
        id: model.id || makeId(),
        name: model.name,
        type: resolveTypeValue(model.type, model.typeCustom),
        appearance: String(model.appearance || '').trim(),
        negativeTags: String(model.negativeTags || '').trim(),
        danbooruTag: String(model.danbooruTag || '').trim(),
        outfits: model.outfits,
        dynamicStates: model.dynamicStates,
        ...(model.enabled === false ? { enabled: false } : {}),
    })));
    if (forms.length) character.forms = forms; else delete character.forms;
    // 第一形态的停用标记只在有额外形态时才有意义。
    if (!forms.length) delete character.formDisabled;
    return character;
}

/** 一个形态的三个可折叠分区（固定外貌〔正向 + 负向〕/ 服装 / 动态标签）；单形态布局与形态卡片共用。 */
export function renderCharacterFormSections(model, {
    charId, formKey = '', escapeHtml = defaultEscapeHtml, isSectionCollapsed = () => false, danbooruEnabled = false,
} = {}) {
    const ref = formRef(charId, formKey);
    const keyAttr = formKey ? ` data-form-key="${escapeHtml(formKey)}"` : '';
    const outfits = model.outfits || [];
    const dynamicStates = model.dynamicStates || [];
    const danbooru = String(model.danbooruTag || '');
    const appearanceSection = renderEditorSection({
        key: 'appearance',
        title: FIXED_APPEARANCE_COPY.title,
        collapsed: isSectionCollapsed('appearance'),
        actionsHtml: `<button class="btn" type="button" data-action="search-danbooru" data-id="${escapeHtml(charId)}"${keyAttr} style="padding:2px 8px;font-size:10px;${danbooruEnabled ? '' : 'opacity:0.3;'}"${danbooruEnabled ? '' : ' disabled'}><i class="fa-solid fa-magnifying-glass"></i> Danbooru</button>`,
        bodyHtml: `
                            <p class="form-hint char-section-hint">${FIXED_APPEARANCE_COPY.hint}</p>
                            <div class="form-group">
                                <label class="form-label">${FIXED_APPEARANCE_COPY.positiveLabel}</label>
                                <textarea class="input char-edit-appearance" rows="1" data-autofit placeholder="long hair, blue eyes, white dress">${escapeHtml(model.appearance || '')}</textarea>
                                <input type="hidden" class="char-form-danbooru" value="${escapeHtml(danbooru)}">
                                <div class="form-hint char-danbooru-hint" style="font-size:10px;color:var(--text-muted);margin:2px 0;"${danbooru ? '' : ' hidden'}>Danbooru: ${escapeHtml(danbooru.replace(/_/g, ' '))}</div>
                                <div class="danbooru-panel hidden" data-char-id="${escapeHtml(ref)}"></div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">${FIXED_APPEARANCE_COPY.negativeLabel}</label>
                                <textarea class="input char-edit-neg" rows="1" data-autofit placeholder="避免的特征...">${escapeHtml(model.negativeTags || '')}</textarea>
                            </div>`,
    });
    const outfitSection = renderEditorSection({
        key: 'outfits',
        title: '服装',
        collapsed: isSectionCollapsed('outfits'),
        actionsHtml: `<button class="btn btn-sm" type="button" data-action="add-outfit" data-id="${escapeHtml(charId)}"><i class="fa-solid fa-plus"></i> 添加服装</button>`,
        bodyHtml: `
                            <div class="char-outfit-editor-list">
                                <div class="char-outfit-editor-empty"${outfits.length ? ' style="display:none;"' : ''}>${NAMED_TAG_EMPTY_TEXT}</div>
                                ${renderNamedTagEditorItems(outfits, 'outfit', { escapeHtml })}
                            </div>`,
    });
    const dynamicStateSection = renderEditorSection({
        key: 'dynamicStates',
        title: EXTRA_TAGS_COPY.title,
        collapsed: isSectionCollapsed('dynamicStates'),
        actionsHtml: `<button class="btn btn-sm" type="button" data-action="add-dynstate" data-id="${escapeHtml(charId)}"><i class="fa-solid fa-plus"></i> ${EXTRA_TAGS_COPY.addAction}</button>`,
        bodyHtml: `
                            <div class="char-dynstate-editor-list">
                                <div class="char-dynstate-editor-empty"${dynamicStates.length ? ' style="display:none;"' : ''}>${NAMED_TAG_EMPTY_TEXT}</div>
                                ${renderNamedTagEditorItems(dynamicStates, 'dynstate', { escapeHtml })}
                            </div>`,
    });
    return `${appearanceSection}${outfitSection}${dynamicStateSection}`;
}

/**
 * 渲染一个形态子卡片。renderTypeFields(model) 由调用方给出类型下拉框 + 自定义输入框的 HTML（类型选项属于各页面）；
 * isSectionCollapsed(formKey, sectionKey) 给出分区折叠状态；total 决定折叠规则（≥2 个形态时，只有 expanded:true 的展开）。
 */
export function renderFormCard(model, index, { total = 2, charId, escapeHtml = defaultEscapeHtml, renderTypeFields, isSectionCollapsed, danbooruEnabled = false, typeShort = null } = {}) {
    const key = escapeHtml(model.key);
    const expanded = isNamedTagItemExpanded(model, total);
    const enabled = model.enabled !== false;
    return `
    <div class="char-form${expanded ? '' : ' is-folded'}${enabled ? '' : ' is-disabled'}" data-form-key="${key}" data-form-id="${escapeHtml(model.id || '')}" data-expanded="${expanded}" data-enabled="${enabled}">
        <div class="char-form-header" data-action="toggle-form">
            <span class="char-drag-handle named-tag-drag" role="button" tabindex="0" data-form-drag title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整形态 ${index + 1} 的顺序">⋮⋮</span>
            <button type="button" class="char-form-toggle" aria-expanded="${expanded}" title="展开 / 折叠" aria-label="展开 / 折叠形态 ${index + 1}">
                <i class="fa-solid fa-chevron-down named-tag-chevron" aria-hidden="true"></i>
            </button>
            <input type="text" class="char-form-name inline-name" value="${escapeHtml(model.name || '')}" placeholder="${FORM_COPY.nameLabel}" title="${FORM_COPY.nameHint}" aria-label="${FORM_COPY.nameLabel}">
            ${typeShort ? `<span class="char-type-badge char-form-type">${escapeHtml(typeShort(resolveTypeValue(model.type, model.typeCustom)))}</span>` : ''}
            <span class="char-form-preview">${escapeHtml(previewNamedTags(model.appearance))}</span>
            ${renderEditorItemMenu({
                subject: `${FORM_COPY.sectionTitle} ${index + 1}`,
                enabled,
                duplicateAction: 'duplicate-form',
                toggleAction: 'toggle-form-enabled',
                removeAction: 'remove-form',
                removeAttrs: `data-form-key="${key}"`,
            })}
        </div>
        <div class="char-form-body"${expanded ? '' : ' hidden'}>
            ${renderTypeFields ? renderTypeFields(model) : ''}
            ${renderCharacterFormSections(model, {
                charId, formKey: model.key, escapeHtml, danbooruEnabled,
                isSectionCollapsed: sectionKey => (isSectionCollapsed ? isSectionCollapsed(model.key, sectionKey) : false),
            })}
        </div>
    </div>`;
}

/** 形态区（标题行 + 形态卡片列表），≥2 个形态时替换单形态的字段区；“添加形态”按钮在页面的吸顶摘要行里。 */
export function renderFormsSection(models, ctx = {}) {
    return `
    <div class="form-group char-forms">
        <div class="char-section-head">
            <span class="char-section-toggle char-forms-title">${FORM_COPY.sectionTitle}<span class="char-section-count">${models.length}</span></span>
        </div>
        <div class="char-form-list">${models.map((model, index) => renderFormCard(model, index, { ...ctx, total: models.length })).join('')}</div>
    </div>`;
}

const formRowsOf = list => Array.from(list?.querySelectorAll('.char-form') || []);

/** 折叠头里的外貌预览（折叠时看不到输入框，所以折叠 / 重排时都要刷新）；名称输入框就在头部。 */
export function refreshFormHeader(form) {
    if (!form) return;
    const preview = form.querySelector('.char-form-preview');
    if (preview) preview.textContent = previewNamedTags(form.querySelector('.char-edit-appearance')?.value);
}

/** 形态头部的类型徽标随该形态的类型下拉框 / 自定义输入框实时刷新；typeShort(类型值) 给出短标签（与摘要栏同一套）。 */
export function refreshFormTypeBadge(form, typeShort) {
    const badge = form?.querySelector('.char-form-type');
    if (!badge || typeof typeShort !== 'function') return;
    const type = form.querySelector('.char-edit-type')?.value || 'girl';
    badge.textContent = typeShort(resolveTypeValue(type, form.querySelector('.char-edit-type-custom')?.value));
}

export function setFormExpanded(form, expanded) {
    if (!form) return;
    setRowFolded(form, expanded, { body: '.char-form-body', toggle: '.char-form-toggle' });
    if (!expanded) refreshFormHeader(form);
}

/** 点折叠头：返回切换后是否展开。 */
export function toggleFormCard(form) {
    const next = form?.dataset.expanded !== 'true';
    setFormExpanded(form, next);
    return next;
}

/** 点在形态头部的输入框 / 拖动手柄 / “…”菜单上是在操作它们，不切换折叠；菜单项自带 data-action。 */
export function isFormHeaderToggleTarget(target) {
    return !target?.closest?.('input, textarea, label, [data-form-drag], [data-card-menu]');
}

/** 同步形态的启用状态：行上的标记、停用样式（含头部“已停用”标签）和菜单里“停用 / 启用”一项的文案。 */
export function setFormEnabled(form, enabled) {
    if (!form) return;
    form.dataset.enabled = String(enabled);
    form.classList.toggle('is-disabled', !enabled);
    syncEnabledToggleItem(form, enabled);
}

/** 菜单里的“停用 / 启用”：只改 DOM（不重绘，其他输入框里未保存的内容不受影响）。返回翻转后的状态。 */
export function toggleFormEnabled(form) {
    if (!form) return true;
    const next = form.dataset.enabled === 'false';
    setFormEnabled(form, next);
    return next;
}

/**
 * 复制一个形态（编辑模型的纯函数）：深拷贝，副本紧跟在原形态后面，名称加“副本”，展开、启用，id 留空（保存时发新 id，不和原形态共用）。
 * 找不到 key 时原样返回。返回 { models, copyKey }。
 */
export function duplicateFormModels(models, key) {
    const list = Array.isArray(models) ? models : [];
    const index = list.findIndex(model => model.key === key);
    if (index < 0) return { models: list, copyKey: '' };
    const source = list[index];
    const copy = {
        ...JSON.parse(JSON.stringify(source)),
        key: newFormKey(),
        id: '',
        name: makeCopyLabel(source.name),
        enabled: true,
        expanded: true,
    };
    return { models: [...list.slice(0, index + 1), copy, ...list.slice(index + 1)], copyKey: copy.key };
}

/** 整理形态列表：序号标签、数量标记、折叠头预览。 */
export function syncFormList(list) {
    if (!list) return;
    const rows = formRowsOf(list);
    rows.forEach((row, index) => {
        row.querySelector('[data-form-drag]')?.setAttribute('aria-label', `拖动调整形态 ${index + 1} 的顺序`);
        row.querySelector('.char-form-toggle')?.setAttribute('aria-label', `展开 / 折叠形态 ${index + 1}`);
        relabelEditorActions(row, `${FORM_COPY.sectionTitle} ${index + 1}`, row.dataset.enabled !== 'false');
        refreshFormHeader(row);
    });
    const count = list.closest('.char-forms')?.querySelector('.char-forms-title .char-section-count');
    if (count) count.textContent = String(rows.length);
}

/** 按 key 的新顺序重排形态卡片（真实移动 DOM 节点，输入框里未保存的内容与折叠状态跟着走）。 */
export function reorderFormCards(list, orderedKeys) {
    if (!list) return;
    moveRowsToOrder(list, formRowsOf(list), orderedKeys, row => row.dataset.formKey);
    syncFormList(list);
}

/** 形态卡片的拖拽 + 键盘（↑ / ↓）排序，复用 sortable-list.js；事件委托在 container 上。 */
export function createFormSortable({ container, document, autoScroll = null, createSortable = createSortableList } = {}) {
    return createSortable({
        container,
        rowSelector: '.char-form',
        handleSelector: '[data-form-drag]',
        getId: row => row.dataset.formKey,
        onReorder: keys => reorderFormCards(container.querySelector('.char-form-list'), keys),
        moveStep: movePresetId,
        autoScroll,
        bodyClass: 'char-dragging',
        document,
    });
}

/**
 * 读出一个形态（形态卡片，或单形态布局下的整张编辑卡片）里的字段，折叠的也读。
 * 返回编辑模型的字段部分；keepEmpty / withUiState 同 collectNamedTagEditorValues。
 */
export function readFormFields(root, options = {}) {
    const value = selector => root.querySelector(selector)?.value ?? '';
    return {
        type: value('.char-edit-type') || 'girl',
        typeCustom: value('.char-edit-type-custom'),
        appearance: value('.char-edit-appearance'),
        negativeTags: value('.char-edit-neg'),
        danbooruTag: value('.char-form-danbooru'),
        outfits: collectNamedTagEditorValues(root, 'outfit', options),
        dynamicStates: collectNamedTagEditorValues(root, 'dynstate', options),
    };
}

/** 读出编辑卡片里全部形态卡片（按 DOM 顺序）；没有形态卡片（单形态布局）时返回 null。 */
export function collectFormModels(card, { keepEmpty = false, withUiState = false } = {}) {
    const list = card.querySelector('.char-form-list');
    if (!list) return null;
    return formRowsOf(list).map(form => ({
        key: form.dataset.formKey,
        id: form.dataset.formId || '',
        name: form.querySelector('.char-form-name')?.value?.trim() || '',
        ...readFormFields(form, { keepEmpty, withUiState }),
        enabled: form.dataset.enabled !== 'false',
        ...(withUiState ? { expanded: form.dataset.expanded === 'true' } : {}),
    }));
}
