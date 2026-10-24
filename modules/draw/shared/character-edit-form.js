// 单角色编辑卡片的表单片段：可折叠分区、服装 / 动态外貌条目（折叠 + 单条启用）的渲染、同步与读取。
// 只拼 HTML 字符串并操作传入的 DOM 节点，不依赖酒馆宿主模块；插入文档前由调用方负责 sanitize。
// 折叠状态全是界面状态：条目折叠只活在 DOM 的 data-expanded 上，经草稿（collect 的 withUiState）带过重绘；
// 分区折叠按卡片 id 记在 createEditorSectionState() 里，整个页面会话内有效；两者都不进入保存的数据。

import { createSortableList } from './sortable-list.js';
import { movePresetId } from './preset-order.js';
import {
    isNamedTagEnabled,
    isNamedTagItemExpanded,
    previewNamedTags,
} from './named-tag-items.js';

export const EDITOR_SECTION_KEYS = Object.freeze(['appearance', 'negative', 'outfits', 'dynamicStates']);

export const NAMED_TAG_EDITOR_KINDS = Object.freeze({
    outfit: {
        classPrefix: 'char-outfit',
        title: '服装',
        nameLabel: '服装名称',
        nameHint: '点击修改名称，如：常服、礼服、战斗服',
        tagsLabel: '服装 TAG',
        tagsPlaceholder: 'white shirt, black skirt, ribbon...',
        removeAction: 'remove-outfit',
    },
    dynstate: {
        classPrefix: 'char-dynstate',
        title: '状态',
        nameLabel: '状态名称',
        nameHint: '点击修改名称，如：睡觉、淋雨、害羞',
        tagsLabel: '状态 TAG',
        tagsPlaceholder: 'closed eyes, sleeping...',
        removeAction: 'remove-dynstate',
    },
});

let nextItemUid = 0; // 条目行的界面内唯一标识：拖拽排序按它认行（下标会随排序变化）
const ENABLED_COPY = Object.freeze({ on: '启用', off: '停用' });

function defaultEscapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function kindMeta(kind) {
    return NAMED_TAG_EDITOR_KINDS[kind] || NAMED_TAG_EDITOR_KINDS.outfit;
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
        /** 丢弃已经不存在的卡片的记录。 */
        prune(validIds) {
            const valid = new Set(Array.from(validIds, String));
            for (const id of Array.from(collapsedByCard.keys())) {
                if (!valid.has(id)) collapsedByCard.delete(id);
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

// ── 服装 / 动态外貌条目 ─────────────────────────────────────

/**
 * 渲染一个条目。item 可带 enabled（false 才算停用）与 expanded（草稿里的展开状态）；
 * total 是列表条目总数，决定折叠规则（见 isNamedTagItemExpanded）。
 */
export function renderNamedTagEditorItem(item = {}, index = 0, kind = 'outfit', { total = 1, escapeHtml = defaultEscapeHtml } = {}) {
    const meta = kindMeta(kind);
    const p = meta.classPrefix;
    const enabled = isNamedTagEnabled(item);
    const expanded = isNamedTagItemExpanded(item, total);
    const enabledLabel = enabled ? ENABLED_COPY.on : ENABLED_COPY.off;
    nextItemUid += 1;
    return `
    <div class="${p}-editor-item named-tag-item${enabled ? '' : ' is-disabled'}${expanded ? '' : ' is-folded'}" data-index="${index}" data-uid="nt-${nextItemUid}" data-enabled="${enabled}" data-expanded="${expanded}">
        <div class="${p}-editor-header named-tag-header" data-action="toggle-named-item">
            <span class="char-drag-handle named-tag-drag" role="button" tabindex="0" data-named-drag title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整${meta.title} ${index + 1} 的顺序">⋮⋮</span>
            <button type="button" class="named-tag-toggle" aria-expanded="${expanded}" title="展开 / 折叠" aria-label="展开 / 折叠${meta.title} ${index + 1}">
                <i class="fa-solid fa-chevron-down named-tag-chevron" aria-hidden="true"></i>
            </button>
            <input type="text" class="${p}-name named-tag-name" value="${escapeHtml(item.name || '')}" placeholder="${meta.nameLabel}" title="${meta.nameHint}" aria-label="${meta.nameLabel}">
            <span class="named-tag-preview">${escapeHtml(previewNamedTags(item.tags))}</span>
            <label class="named-tag-switch" title="停用后不会发给 AI">
                <input type="checkbox" class="named-tag-enabled named-tag-enabled-header"${enabled ? ' checked' : ''} aria-label="启用${meta.title} ${index + 1}">
                <span class="named-tag-switch-text">${enabledLabel}</span>
            </label>
            <button class="btn btn-danger btn-sm" type="button" data-action="${meta.removeAction}" data-index="${index}"><i class="fa-solid fa-trash"></i> 删除</button>
        </div>
        <div class="${p}-editor-body named-tag-body"${expanded ? '' : ' hidden'}>
            <div class="form-group">
                <label class="form-label">${meta.tagsLabel}</label>
                <textarea class="input ${p}-tags" placeholder="${meta.tagsPlaceholder}">${escapeHtml(item.tags || '')}</textarea>
            </div>
            <label class="named-tag-body-enable">
                <input type="checkbox" class="named-tag-enabled named-tag-enabled-body"${enabled ? ' checked' : ''}>
                <span>启用此${meta.title}（停用后不会发给 AI）</span>
            </label>
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
    row.dataset.expanded = String(expanded);
    row.classList.toggle('is-folded', !expanded);
    row.querySelector('.named-tag-body')?.toggleAttribute('hidden', !expanded);
    row.querySelector('.named-tag-toggle')?.setAttribute('aria-expanded', String(expanded));
    if (!expanded) refreshNamedTagItemHeader(row, kind);
}

/** 点在折叠头上的这些控件时不切换折叠：名称输入框（点一下就编辑）、启用开关、拖动手柄；删除按钮自带 data-action，不会落到折叠头上。 */
export function isNamedTagHeaderToggleTarget(target) {
    return !target?.closest?.('input, textarea, label, [data-named-drag]');
}

/** 点折叠头：返回切换后是否展开。 */
export function toggleNamedTagItem(row, kind = 'outfit') {
    const next = row?.dataset.expanded !== 'true';
    setNamedTagItemExpanded(row, next, kind);
    return next;
}

/** 同步头部与正文里的两个启用开关、停用样式和开关文案。 */
export function setNamedTagItemEnabled(row, enabled) {
    if (!row) return;
    row.dataset.enabled = String(enabled);
    row.classList.toggle('is-disabled', !enabled);
    row.querySelectorAll('.named-tag-enabled').forEach((box) => { box.checked = enabled; });
    const text = row.querySelector('.named-tag-switch-text');
    if (text) text.textContent = enabled ? ENABLED_COPY.on : ENABLED_COPY.off;
}

/** 条目行属于哪种列表（服装 / 状态）。 */
export function namedTagKindOfRow(row) {
    return row?.classList.contains('char-dynstate-editor-item') ? 'dynstate' : 'outfit';
}

/** 启用开关（头部或正文）变化后：同步另一个开关、停用样式，并更新分区标题行里的“启用数/总数”。 */
export function applyNamedTagEnabledChange(box) {
    const row = box?.closest('.named-tag-item');
    if (!row) return;
    const kind = namedTagKindOfRow(row);
    setNamedTagItemEnabled(row, box.checked);
    syncNamedTagEditorList(row.closest(`.${kindMeta(kind).classPrefix}-editor-list`), kind);
}

// 浏览器里读 checked 属性；没有实现 checked 属性的 DOM（如单测用的 linkedom）退回读 checked 特性。
export function isCheckboxChecked(box) {
    return typeof box.checked === 'boolean' ? box.checked : box.hasAttribute('checked');
}

function readRowEnabled(row) {
    const box = row.querySelector('.named-tag-enabled-header') || row.querySelector('.named-tag-enabled');
    return box ? isCheckboxChecked(box) : row.dataset.enabled !== 'false';
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
        const switchBox = row.querySelector('.named-tag-enabled-header');
        if (switchBox) switchBox.setAttribute('aria-label', `启用${meta.title} ${index + 1}`);
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
 * insertHtml(list, html) 由调用方提供，负责 sanitize 后插入（本模块不直接写 innerHTML）。
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
 * 按 uid 的新顺序重排列表里的条目行（真实移动 DOM 节点，输入框里未保存的内容、折叠与启用状态原样跟着走），
 * 然后整理序号。orderedUids 里没有的行保持相对顺序排在最后。草稿 / 保存都按 DOM 顺序读，所以顺序自然被带过重绘。
 */
export function reorderNamedTagEditorRows(list, kind, orderedUids) {
    if (!list) return;
    const rows = rowsOf(list, kind);
    const byUid = new Map(rows.map(row => [row.dataset.uid, row]));
    const ordered = [];
    for (const uid of Array.isArray(orderedUids) ? orderedUids : []) {
        const row = byUid.get(uid);
        if (row && !ordered.includes(row)) ordered.push(row);
    }
    for (const row of rows) if (!ordered.includes(row)) ordered.push(row);
    const anchor = rows.length ? rows[rows.length - 1].nextSibling : null;
    ordered.forEach(row => list.insertBefore(row, anchor));
    syncNamedTagEditorList(list, kind);
}

/**
 * 服装 / 状态条目的拖拽 + 键盘（↑ / ↓）排序：直接复用 sortable-list.js 的控制器（与参数 / 提示词预设列表同一套交互），
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
            onReorder: uids => reorderNamedTagEditorRows(container.querySelector(`.${p}-editor-list`), kind, uids),
            moveStep: movePresetId,
            autoScroll,
            bodyClass: 'char-dragging',
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
 * keepEmpty：草稿保护时保留刚点“添加服装/状态”还没填内容的空行；保存时仍然过滤掉。
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
