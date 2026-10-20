// 提示词"消息布局"编辑器（后端无关的共享 UI 组件；NovelAI 先用，SD WebUI / ComfyUI 之后接入）。
// 受控组件：布局数据由宿主页面持有（草稿 / 已保存版本经 getLayout / getSavedLayout 取），
// 用户操作时用 scene-planner-layout.js 的纯操作算出新布局，交给 onChange(newLayout)，由页面决定怎么存草稿。
// 组件自己不碰存储、不发消息、不依赖页面全局；DOM、confirm、滚动、跳转到"去编辑"的目标全部经参数注入。
// 只用 createElement / textContent / 属性赋值，不拼 HTML 字符串，用户文本不会被当成标记解析。
// 样式见 ./prompt-layout-editor.css（class 前缀 lwb-ple-，不依赖页面样式）。
//
// 重绘规则（输入法与焦点）：input / change 只改数据和原地更新文字，绝不重建 DOM；
// 只有结构变化（添加 / 删除 / 移动 / 恢复默认 / 展开收起）才重建列表，且重建前后会还原焦点与选区。

import {
    CUSTOM_BLOCK_ROLES,
    addBlock,
    createCustomBlock,
    createDefaultLayout,
    describeBlock,
    isDefaultLayout,
    layoutFingerprint,
    layoutForStorage,
    normalizeLayout,
    removeBlock,
    reorderBlocks,
    updateBlock,
} from './scene-planner-layout.js';
import { createSortableList, moveIdToIndex } from './sortable-list.js';

// 页面是普通脚本、拿不到 scene-planner-layout.js，经本模块转手（指纹 / 默认判断 / 存储形态都以契约模块为准）。
export { createDefaultLayout, isDefaultLayout, layoutFingerprint, layoutForStorage, normalizeLayout };

const PREVIEW_LENGTH = 40;
const EMPTY_TITLE = '（空消息）';
const ROW_SELECTOR = '.lwb-ple-row';
const HANDLE_SELECTOR = '[data-ple-drag]';

/** 标题里的内容预览：取第一个非空行，压成单行并截断。 */
export function previewText(content, limit = PREVIEW_LENGTH) {
    const firstLine = String(content ?? '').split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';
    const chars = Array.from(firstLine);
    return chars.length > limit ? `${chars.slice(0, limit).join('')}…` : firstLine;
}

/**
 * 排序后哪一项被移动了：新旧顺序里各自拿掉某一项后其余相同的那一项。
 * 拖拽 / 键盘排序的回调只给完整的新顺序，播报"谁移到了第几位"要靠它反推。
 */
export function findMovedId(oldIds, newIds) {
    const at = oldIds.findIndex((id, index) => id !== newIds[index]);
    if (at < 0) return null;
    const same = (a, b) => a.length === b.length && a.every((id, index) => id === b[index]);
    for (const candidate of [oldIds[at], newIds[at]]) {
        if (same(oldIds.filter(id => id !== candidate), newIds.filter(id => id !== candidate))) return candidate;
    }
    return null;
}

function create(document, tag, { className, text, attrs } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.setAttribute('class', className);
    if (text !== undefined) node.textContent = String(text);
    for (const [key, value] of Object.entries(attrs || {})) {
        if (value === undefined || value === null || value === false) continue;
        node.setAttribute(key, value === true ? '' : String(value));
    }
    for (const child of children) if (child) node.appendChild(child);
    return node;
}

function clearNode(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
}

function setHidden(node, hidden) {
    if (hidden) node.setAttribute('hidden', '');
    else node.removeAttribute('hidden');
}

function blocksOf(layout) {
    return Array.isArray(layout?.blocks) ? layout.blocks : normalizeLayout(layout).layout.blocks;
}

/**
 * @param {object} options
 * @param {Document} options.document
 * @param {Element} options.container 编辑器画在这里面（卡片的内容区）；组件只改它的内容
 * @param {function(): object} [options.getLayout] 当前生效的布局（草稿优先）。不传则组件自己持有布局，经 setLayout 设置
 * @param {function(): (object|null)} [options.getSavedLayout] 已保存的布局，用来判断"未保存"徽标；缺省时拿 setLayout 最近一次设置的值比
 * @param {function(object): void} options.onChange 每次用户修改后的新布局（已规范化）。输入框打字也会调，但不会因此重绘
 * @param {function(string): ({summary?: string, label?: string, action?: ('edit'|'view'|null)}|null)} [options.describeBuiltin]
 *        内置块的一行摘要；action 决定按钮是"去编辑"、"查看"还是不显示；label 可覆盖契约里的显示名
 * @param {function(string): void} [options.onEditBuiltin] 点内置块的按钮（去编辑 / 查看）
 * @param {function(string): boolean} [options.confirm] 危险操作前的确认；缺省一律视为确认
 * @param {function(string): void} [options.announce] 额外的播报通道（组件自带一条 aria-live 状态行，这里是可选的镜像）
 * @param {function(PointerEvent, Element): void} [options.autoScroll] 拖拽中靠近边缘时滚动（第二个参数是列表容器）
 * @param {function(): string} [options.getDisabledReason] 返回非空字符串 = 编辑器停用并显示这段说明（例如宿主版本太旧）
 * @param {function(): number} [options.random] 自定义块 id 的随机源，默认 Math.random
 * @returns {{render: function(object=): void, setLayout: function(object): void, refreshSummaries: function(): void, refreshStatus: function(): void, getLayout: function(): object, destroy: function(): void}}
 */
export function createPromptLayoutEditor({
    document,
    container,
    getLayout = null,
    getSavedLayout = null,
    onChange,
    describeBuiltin = null,
    onEditBuiltin = null,
    confirm = null,
    announce = null,
    autoScroll = null,
    getDisabledReason = null,
    random = Math.random,
} = {}) {
    if (!document || !container || typeof onChange !== 'function') throw new TypeError('缺少 document / container / onChange');

    // 自持模式：没给 getLayout 时，布局存在组件里。
    let ownLayout = createDefaultLayout();
    let ownSaved = ownLayout;
    const readLayout = () => (getLayout ? getLayout() : ownLayout);
    const readSaved = () => (getSavedLayout ? getSavedLayout() : ownSaved);

    const expanded = new Set(); // 展开的自定义块 id；只存在于本页面，不进布局数据
    let pendingFocus = null; // 重建后要聚焦的 { id, field }
    let lastSignature = null;
    let sortable = null;
    let mounted = false;
    const listeners = [];

    // ── 外壳：只建一次，列表在里面重建，状态行（aria-live）因此不会被换掉 ──
    const root = create(document, 'div', { className: 'lwb-ple', attrs: { 'data-ple': '' } });
    const titleNode = create(document, 'span', { className: 'lwb-ple-title', text: '消息布局' });
    const dirtyBadge = create(document, 'span', { className: 'lwb-ple-dirty', text: '未保存', attrs: { hidden: true, 'data-ple-dirty': '' } });
    const addButton = create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-primary', text: '添加消息', attrs: { type: 'button', 'data-ple-add': '', title: '在末尾添加一条自定义消息' } });
    const resetButton = create(document, 'button', { className: 'lwb-ple-btn', text: '恢复默认结构', attrs: { type: 'button', 'data-ple-reset': '', title: '恢复内置块的默认顺序并移除自定义消息（只改草稿，保存后才生效）' } });
    const hint = create(document, 'p', {
        className: 'lwb-ple-hint',
        text: '带锁的内置块内容固定、只能调整顺序，内容在各自的编辑处修改；自定义消息可以随意添加、编辑和排序。拖动左侧手柄，或聚焦手柄后按 ↑ / ↓ 调整顺序。',
    });
    const notice = create(document, 'p', { className: 'lwb-ple-notice', attrs: { hidden: true, role: 'alert', 'data-ple-notice': '' } });
    const list = create(document, 'div', { className: 'lwb-ple-list', attrs: { role: 'list', 'aria-label': '消息布局' } });
    const status = create(document, 'div', { className: 'lwb-ple-status', attrs: { role: 'status', 'aria-live': 'polite', 'data-ple-status': '' } });
    root.appendChild(create(document, 'div', { className: 'lwb-ple-head' }, [
        create(document, 'div', { className: 'lwb-ple-headline' }, [titleNode, dirtyBadge]),
        create(document, 'div', { className: 'lwb-ple-actions' }, [addButton, resetButton]),
    ]));
    root.appendChild(hint);
    root.appendChild(notice);
    root.appendChild(list);
    root.appendChild(status);

    function say(text) {
        status.textContent = text;
        announce?.(text);
    }

    function listen(target, type, handler) {
        target.addEventListener(type, handler);
        listeners.push(() => target.removeEventListener(type, handler));
    }

    const disabledReason = () => String(getDisabledReason?.() || '');

    function builtinInfo(id) {
        const described = describeBuiltin?.(id) || {};
        return {
            summary: String(described.summary ?? ''),
            label: described.label ? String(described.label) : '',
            action: described.action === null ? null : (described.action === 'view' ? 'view' : 'edit'),
        };
    }

    // ── 行 ──

    function roleBadge(role) {
        return create(document, 'span', { className: `lwb-ple-role ${role}`, text: role, attrs: { 'data-ple-role': '' } });
    }

    function customTitle(block) {
        const name = String(block.name || '').trim();
        return name || previewText(block.content) || EMPTY_TITLE;
    }

    function buildHandle(block, label) {
        return create(document, 'span', {
            className: 'lwb-ple-handle',
            text: '⋮⋮',
            attrs: {
                role: 'button',
                tabindex: '0',
                'data-ple-drag': block.id,
                'data-ple-field': 'handle',
                title: '拖动调整顺序，也可聚焦后按 ↑ / ↓',
                'aria-label': `拖动调整 ${label} 的顺序`,
            },
        });
    }

    function buildBuiltinRow(block) {
        const meta = describeBlock(block);
        const info = builtinInfo(block.id);
        const label = info.label || meta.label;
        const row = create(document, 'div', {
            className: 'lwb-ple-row lwb-ple-builtin',
            attrs: { role: 'listitem', 'data-block-id': block.id, 'data-builtin': 'true' },
        });
        const line = create(document, 'div', { className: 'lwb-ple-line' }, [
            buildHandle(block, label),
            create(document, 'span', { className: 'lwb-ple-lock', attrs: { title: '内置块：内容固定，只能移动，不能删除', role: 'img', 'aria-label': '内置块' } }, [
                create(document, 'i', { className: 'fa-solid fa-lock', attrs: { 'aria-hidden': 'true' } }),
            ]),
            roleBadge(meta.role),
            create(document, 'span', { className: 'lwb-ple-label', text: label }),
            create(document, 'span', { className: 'lwb-ple-summary', text: info.summary, attrs: { 'data-ple-summary': '' } }),
        ]);
        if (info.action) {
            const verb = info.action === 'view' ? '查看' : '去编辑';
            line.appendChild(create(document, 'button', {
                className: 'lwb-ple-btn lwb-ple-btn-small',
                text: verb,
                attrs: { type: 'button', 'data-ple-field': 'edit', 'aria-label': `${verb}：${label}` },
            }));
        }
        row.appendChild(line);
        return row;
    }

    function buildCustomBody(block) {
        const roleSelect = create(document, 'select', { className: 'lwb-ple-select', attrs: { 'data-ple-field': 'role' } });
        for (const role of CUSTOM_BLOCK_ROLES) {
            const option = create(document, 'option', { text: role, attrs: { value: role } });
            if (role === block.role) option.setAttribute('selected', '');
            roleSelect.appendChild(option);
        }
        const nameInput = create(document, 'input', {
            className: 'lwb-ple-input',
            attrs: { type: 'text', 'data-ple-field': 'name', placeholder: '名称（可选，仅用于区分，会作为消息的 name 发送）', autocomplete: 'off' },
        });
        nameInput.value = block.name || '';
        const textarea = create(document, 'textarea', {
            className: 'lwb-ple-textarea',
            attrs: { rows: '6', 'data-ple-field': 'content', placeholder: '消息内容' },
        });
        textarea.value = block.content || '';
        return create(document, 'div', { className: 'lwb-ple-body' }, [
            create(document, 'div', { className: 'lwb-ple-fields' }, [
                create(document, 'label', { className: 'lwb-ple-field' }, [create(document, 'span', { text: '角色' }), roleSelect]),
                create(document, 'label', { className: 'lwb-ple-field lwb-ple-field-grow' }, [create(document, 'span', { text: '名称' }), nameInput]),
            ]),
            create(document, 'label', { className: 'lwb-ple-field' }, [create(document, 'span', { text: '内容' }), textarea]),
            create(document, 'div', { className: 'lwb-ple-body-actions' }, [
                create(document, 'button', { className: 'lwb-ple-btn lwb-ple-btn-danger', text: '删除此消息', attrs: { type: 'button', 'data-ple-field': 'delete' } }),
            ]),
        ]);
    }

    function buildCustomRow(block) {
        const open = expanded.has(block.id);
        const title = customTitle(block);
        const row = create(document, 'div', {
            className: `lwb-ple-row lwb-ple-custom${open ? ' expanded' : ''}${block.enabled ? '' : ' off'}`,
            attrs: { role: 'listitem', 'data-block-id': block.id, 'data-builtin': 'false' },
        });
        const toggle = create(document, 'input', {
            attrs: { type: 'checkbox', 'data-ple-field': 'toggle', 'aria-label': `启用 ${title}`, title: '关闭后这条消息不会发送，但内容保留' },
        });
        toggle.checked = block.enabled;
        if (block.enabled) toggle.setAttribute('checked', '');
        const main = create(document, 'button', {
            className: 'lwb-ple-main',
            attrs: { type: 'button', 'data-ple-field': 'main', 'aria-expanded': open ? 'true' : 'false', title: open ? '收起' : '展开编辑' },
        }, [
            create(document, 'span', { className: `lwb-ple-label${String(block.name || '').trim() ? '' : ' muted'}`, text: title, attrs: { 'data-ple-title': '' } }),
            create(document, 'span', { className: 'lwb-ple-count', text: `${block.content.length} 字`, attrs: { 'data-ple-count': '' } }),
            create(document, 'span', { className: 'lwb-ple-chevron', text: open ? '▾' : '▸', attrs: { 'aria-hidden': 'true' } }),
        ]);
        row.appendChild(create(document, 'div', { className: 'lwb-ple-line' }, [
            buildHandle(block, title),
            roleBadge(block.role),
            create(document, 'label', { className: 'lwb-ple-toggle' }, [toggle]),
            main,
        ]));
        if (open) row.appendChild(buildCustomBody(block));
        return row;
    }

    // 输入时只改这一行的文字，不重建（保住输入法组字和焦点）。
    function patchCustomRow(row, block) {
        const title = customTitle(block);
        const hasName = Boolean(String(block.name || '').trim());
        const titleNode = row.querySelector('[data-ple-title]');
        if (titleNode) {
            titleNode.textContent = title;
            titleNode.setAttribute('class', `lwb-ple-label${hasName ? '' : ' muted'}`);
        }
        const count = row.querySelector('[data-ple-count]');
        if (count) count.textContent = `${block.content.length} 字`;
        const badge = row.querySelector('[data-ple-role]');
        if (badge) {
            badge.setAttribute('class', `lwb-ple-role ${block.role}`);
            badge.textContent = block.role;
        }
        row.classList.toggle('off', !block.enabled);
        row.querySelector('[data-ple-field="toggle"]')?.setAttribute('aria-label', `启用 ${title}`);
        row.querySelector('[data-ple-drag]')?.setAttribute('aria-label', `拖动调整 ${title} 的顺序`);
    }

    // ── 焦点保持 ──

    function captureFocus() {
        const active = document.activeElement;
        if (!active || !list.contains(active)) return null;
        const row = active.closest?.(ROW_SELECTOR);
        const field = active.getAttribute?.('data-ple-field');
        if (!row || !field) return null;
        return { id: row.getAttribute('data-block-id'), field, start: active.selectionStart, end: active.selectionEnd };
    }

    function restoreFocus(target) {
        if (!target) return;
        const row = Array.from(list.querySelectorAll(ROW_SELECTOR)).find(item => item.getAttribute('data-block-id') === target.id);
        const node = row && Array.from(row.querySelectorAll('[data-ple-field]')).find(item => item.getAttribute('data-ple-field') === target.field);
        if (!node) return;
        node.focus?.();
        if (typeof target.start === 'number' && typeof node.setSelectionRange === 'function') {
            try { node.setSelectionRange(target.start, target.end ?? target.start); } catch { /* 个别输入类型不支持选区 */ }
        }
    }

    // ── 重建与刷新 ──

    function rebuildList() {
        const layout = readLayout();
        const blocks = blocksOf(layout);
        const focusTarget = pendingFocus || captureFocus();
        pendingFocus = null;
        const known = new Set(blocks.map(block => block.id));
        for (const id of Array.from(expanded)) if (!known.has(id)) expanded.delete(id);
        clearNode(list);
        const reason = disabledReason();
        if (!reason) {
            for (const block of blocks) {
                list.appendChild(describeBlock(block).builtin ? buildBuiltinRow(block) : buildCustomRow(block));
            }
        }
        lastSignature = signatureOf(layout, reason);
        refreshStatus();
        restoreFocus(focusTarget);
    }

    function signatureOf(layout, reason) {
        return `${reason}|${layoutFingerprint(layout)}|${Array.from(expanded).sort().join(',')}`;
    }

    /** 未保存徽标、按钮可用性、停用说明——不动列表。 */
    function refreshStatus(layoutOverride) {
        const layout = layoutOverride || readLayout();
        const reason = disabledReason();
        const saved = readSaved();
        const dirty = !reason && saved != null && layoutFingerprint(layout) !== layoutFingerprint(saved);
        setHidden(dirtyBadge, !dirty);
        notice.textContent = reason;
        setHidden(notice, !reason);
        setHidden(hint, Boolean(reason));
        addButton.disabled = Boolean(reason);
        resetButton.disabled = Boolean(reason) || isDefaultLayout(layout);
        for (const button of [addButton, resetButton]) {
            if (button.disabled) button.setAttribute('disabled', ''); else button.removeAttribute('disabled');
        }
    }

    /** 内置块的摘要随文本框内容变化：原地改字，不重建。 */
    function refreshSummaries() {
        for (const row of list.querySelectorAll(ROW_SELECTOR)) {
            if (row.getAttribute('data-builtin') !== 'true') continue;
            const node = row.querySelector('[data-ple-summary]');
            if (node) node.textContent = builtinInfo(row.getAttribute('data-block-id')).summary;
        }
    }

    function ensureSortable() {
        if (sortable) return;
        sortable = createSortableList({
            container: list,
            rowSelector: ROW_SELECTOR,
            handleSelector: HANDLE_SELECTOR,
            getId: row => row.getAttribute('data-block-id'),
            onReorder: handleReorder,
            moveStep: (ids, id, direction) => {
                const from = ids.indexOf(id);
                return from < 0 ? ids : moveIdToIndex(ids, id, from + (direction < 0 ? -1 : 1));
            },
            autoScroll: autoScroll ? event => autoScroll(event, list) : null,
            document,
            draggingClass: 'dragging',
            beforeClass: 'drop-before',
            afterClass: 'drop-after',
            bodyClass: 'lwb-ple-dragging',
        });
    }

    /**
     * 画出（或在没有变化时只刷新状态）。
     * 内容没变（INIT_DATA 之类无关推送）时不重建，输入框的焦点与输入法状态不受影响。
     * @param {{force?: boolean, collapse?: boolean}} [options] force=无论如何重建；collapse=先收起所有展开项（切换预设时用）
     */
    function render({ force = false, collapse = false } = {}) {
        if (!mounted) {
            container.appendChild(root);
            mounted = true;
            ensureSortable();
        }
        if (collapse) expanded.clear();
        const layout = readLayout();
        if (!force && !collapse && lastSignature === signatureOf(layout, disabledReason())) {
            refreshStatus(layout);
            refreshSummaries();
            return;
        }
        rebuildList();
    }

    // ── 用户操作 ──

    function commit(next, { rebuild = true } = {}) {
        if (!getLayout) ownLayout = next;
        onChange(next);
        if (rebuild) {
            rebuildList();
        } else {
            // 原地更新的路径也要同步签名：否则之后一次无关的 render() 会误以为布局变了而白白重建、打断输入。
            lastSignature = signatureOf(readLayout(), disabledReason());
            refreshStatus(readLayout());
        }
    }

    function labelOf(block) {
        const meta = describeBlock(block);
        return meta.builtin ? (builtinInfo(block.id).label || meta.label) : customTitle(block);
    }

    function handleAdd() {
        if (disabledReason()) return;
        const layout = readLayout();
        const ids = blocksOf(layout).map(block => block.id);
        const block = createCustomBlock({ role: 'user' }, ids, random);
        expanded.add(block.id);
        pendingFocus = { id: block.id, field: 'content' };
        commit(addBlock(layout, block));
        const row = Array.from(list.querySelectorAll(ROW_SELECTOR)).find(item => item.getAttribute('data-block-id') === block.id);
        row?.scrollIntoView?.({ block: 'nearest' });
        say(`已在末尾添加一条自定义消息，共 ${list.querySelectorAll(ROW_SELECTOR).length} 项`);
    }

    function handleReset() {
        if (disabledReason()) return;
        const layout = readLayout();
        const customCount = blocksOf(layout).filter(block => !describeBlock(block).builtin).length;
        if (customCount > 0 && confirm
            && !confirm(`恢复默认结构会移除全部 ${customCount} 条自定义消息，并把内置块恢复到默认顺序。\n只改当前草稿，点击保存后才会生效。确定吗？`)) return;
        expanded.clear();
        commit(createDefaultLayout());
        addButton.focus?.();
        say(customCount > 0 ? `已恢复默认结构，移除了 ${customCount} 条自定义消息` : '已恢复默认结构');
    }

    function handleDelete(id) {
        const layout = readLayout();
        const blocks = blocksOf(layout);
        const index = blocks.findIndex(block => block.id === id);
        const block = blocks[index];
        if (!block || describeBlock(block).builtin) return;
        if (String(block.content || '').trim() && confirm
            && !confirm(`确定删除“${customTitle(block)}”吗？其中的内容会一并丢失。`)) return;
        const name = customTitle(block);
        expanded.delete(id);
        // 删完后焦点落到原位置的下一项（没有就上一项）的手柄，键盘用户不至于丢到页面顶部。
        const neighbor = blocks[index + 1] || blocks[index - 1];
        pendingFocus = neighbor ? { id: neighbor.id, field: 'handle' } : null;
        commit(removeBlock(layout, id));
        say(`已删除“${name}”`);
    }

    function handleReorder(orderedIds) {
        const oldIds = blocksOf(readLayout()).map(block => block.id);
        const movedId = findMovedId(oldIds, orderedIds);
        const next = reorderBlocks(readLayout(), orderedIds);
        commit(next);
        if (movedId) {
            const blocks = blocksOf(next);
            const block = blocks.find(item => item.id === movedId);
            const position = blocks.findIndex(item => item.id === movedId) + 1;
            say(`“${block ? labelOf(block) : movedId}”已移到第 ${position} 位，共 ${orderedIds.length} 位`);
        }
    }

    function handlePatch(id, patch, row) {
        const next = updateBlock(readLayout(), id, patch);
        commit(next, { rebuild: false });
        const block = blocksOf(next).find(item => item.id === id);
        if (block && row) patchCustomRow(row, block);
    }

    function toggleExpanded(id) {
        if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
        pendingFocus = { id, field: 'main' };
        rebuildList();
    }

    function fieldOf(event) {
        const node = event.target?.closest?.('[data-ple-field]');
        const row = node?.closest?.(ROW_SELECTOR);
        if (!node || !row || !list.contains(row)) return null;
        return { node, row, field: node.getAttribute('data-ple-field'), id: row.getAttribute('data-block-id') };
    }

    listen(list, 'click', (event) => {
        const hit = fieldOf(event);
        if (!hit) return;
        if (hit.field === 'main') toggleExpanded(hit.id);
        else if (hit.field === 'edit') onEditBuiltin?.(hit.id);
        else if (hit.field === 'delete') handleDelete(hit.id);
    });
    listen(list, 'input', (event) => {
        const hit = fieldOf(event);
        if (!hit) return;
        if (hit.field === 'name') handlePatch(hit.id, { name: hit.node.value }, hit.row);
        else if (hit.field === 'content') handlePatch(hit.id, { content: hit.node.value }, hit.row);
    });
    listen(list, 'change', (event) => {
        const hit = fieldOf(event);
        if (!hit) return;
        if (hit.field === 'toggle') handlePatch(hit.id, { enabled: Boolean(hit.node.checked) }, hit.row);
        else if (hit.field === 'role') handlePatch(hit.id, { role: hit.node.value }, hit.row);
    });
    listen(addButton, 'click', handleAdd);
    listen(resetButton, 'click', handleReset);

    return {
        render,
        /** 自持模式：设置布局（同时当作"已保存"的基准）并重绘。 */
        setLayout(layout) {
            ownLayout = normalizeLayout(layout).layout;
            ownSaved = ownLayout;
            render({ force: true });
        },
        refreshSummaries,
        refreshStatus: () => refreshStatus(),
        getLayout: () => readLayout(),
        destroy() {
            sortable?.destroy?.();
            sortable = null;
            listeners.splice(0).forEach(off => off());
            if (root.parentNode) root.parentNode.removeChild(root);
            mounted = false;
            lastSignature = null;
        },
    };
}
