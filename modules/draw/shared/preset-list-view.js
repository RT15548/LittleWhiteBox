// 预设列表视图（NovelAI 设置页的“参数预设”“提示词预设”共用，之后的请求布局等预设列表也用它）。
// 每个预设一行：拖动手柄 + 名称（就地改名输入框，见 inline-rename.js）+ “…”菜单（复制 / 导出 / 删除）；点行里名称之外的地方（或聚焦行后按 Enter / 空格）= 选中。
// 本模块只管“画列表 + 把点击翻译成动作”：预设数据、选中项、动作的具体处理都由调用方经回调提供，
// 因此每个列表可以有自己的数据来源和消息协议；样式类名与 data 属性固定（.preset-row / .preset-row-name /
// .char-drag-handle / .char-menu*），和角色卡共用同一套 CSS。
// 菜单开关、拖拽排序分别由 character-card-menu.js 与 sortable-list.js 负责，这里经注入的函数调用它们，
// 这两个模块晚于页面脚本加载，所以都用“调用时才取”的函数而不是直接引用。
// 可折叠：调用方给出 listId 和折叠按钮（getToggle），折叠后列表只显示当前使用的那一个预设（没有拖动手柄，
// “…”菜单照常可用）；折叠状态按 listId 记在 localStorage（xb-draw-list-collapsed:<listId>），存储不可用时只在本次页面内生效。
// 只 import 同目录的 inline-rename.js；DOM 与转义函数全部由调用方注入。

import { bindInlineRename, INLINE_NAME_SELECTOR } from './inline-rename.js';

const COLLAPSE_KEY_PREFIX = 'xb-draw-list-collapsed:';

/** 读折叠偏好（存储不可用或没有记录时回到 defaultCollapsed）；请求结构编辑器共用这套约定。 */
export function readCollapsed(document, listId, defaultCollapsed) {
    if (!listId) return defaultCollapsed;
    try {
        const saved = document.defaultView?.localStorage?.getItem(COLLAPSE_KEY_PREFIX + listId);
        return saved === null || saved === undefined ? defaultCollapsed : saved === '1';
    } catch (error) {
        console.warn({ source: import.meta.url, operation: 'readCollapsed' }, error);
        return defaultCollapsed;
    }
}

/** 写折叠偏好；存储不可用时静默放弃（只在本次页面内生效）。 */
export function writeCollapsed(document, listId, collapsed) {
    if (!listId) return;
    try {
        document.defaultView?.localStorage?.setItem(COLLAPSE_KEY_PREFIX + listId, collapsed ? '1' : '0');
    } catch (error) {
        console.warn({ source: import.meta.url, operation: 'writeCollapsed' }, error);
    }
}

const DEFAULT_MENU_ITEMS = [
    { action: 'duplicate', label: '复制', icon: 'fa-clone' },
    { action: 'export', label: '导出', icon: 'fa-share-from-square' },
    { action: 'delete', label: '删除', icon: 'fa-trash', danger: true },
];

/**
 * @param {object} options
 * @param {Document} options.document
 * @param {function(): Element|null} options.getList 列表容器（同时是滚动容器）；容器本身不会被替换，只重写它的内容
 * @param {function(): Array<{id: string, name?: string}>} options.getPresets 按显示顺序的预设
 * @param {function(): (string|null)} options.getCurrentId 当前真正显示的预设 id（选中项缺失时调用方自己回退）
 * @param {function(*): string} options.escapeHtml 名称 / id 写进标记前的转义
 * @param {string} options.noun 列表对象的名字（如“参数预设”），用于空状态和手柄的无障碍标签
 * @param {function(string, object): void} options.onSelect 点选一行（含已选中的那一行：由调用方决定是否忽略）
 * @param {function(string, string, object): void} options.onAction (action, id, preset) 菜单项被点
 * @param {function(string, string, object): (Promise|void)} [options.onRename] (id, 新名字, preset) 名称输入框提交（已 trim、非空、确实改了）；
 *        返回 false = 拒绝，输入框还原成原名；返回 Promise 时落定后会核对一遍，名称与数据不一致的行重绘还原
 * @param {function(string[]): void} options.onReorder 拖拽 / 键盘排序的结果（完整的新 id 顺序）；本模块不改数据
 * @param {Array<{action: string, label: string, icon: string, danger?: boolean}>} [options.menuItems]
 * @param {function(object=): void} [options.closeMenu] 关闭已打开的菜单；不得为此去创建菜单控制器
 * @param {function(Element): void} [options.toggleMenu] 开 / 关某个“…”按钮的菜单
 * @param {function(object): (object|null)} [options.createSortable] 用给定选项创建排序控制器；排序模块未就绪时返回 null
 * @param {function(string[], string, number): string[]} [options.moveStep] 键盘 ↑ / ↓ 移动一格
 * @param {function(Event, Element): void} [options.autoScroll] 拖拽中靠近边缘时滚动（第二个参数是列表容器）
 * @param {string} [options.listId] 折叠状态的存储名（如 'novel-params'）；缺省则不记忆
 * @param {function(): (Element|null)} [options.getToggle] 折叠 / 展开按钮；点击切换，状态同步到 aria-expanded 和 .collapsed
 * @param {boolean} [options.defaultCollapsed] 尚无折叠偏好时的初始状态
 * @returns {{render: function(): void, syncSelection: function(): void, refresh: function(): void, ensureSortable: function(): void, bind: function(): void, destroy: function(): void, isCollapsed: function(): boolean, setCollapsed: function(boolean): void, toggle: function(): void}}
 */
export function createPresetListView({
    document,
    getList,
    getPresets,
    getCurrentId,
    escapeHtml,
    noun,
    onSelect,
    onAction,
    onRename = null,
    onReorder,
    menuItems = DEFAULT_MENU_ITEMS,
    closeMenu = null,
    toggleMenu = null,
    createSortable = null,
    moveStep = null,
    autoScroll = null,
    listId = '',
    getToggle = null,
    defaultCollapsed = false,
} = {}) {
    if (!document || typeof getList !== 'function' || typeof getPresets !== 'function' || typeof escapeHtml !== 'function') {
        throw new TypeError('缺少 document / getList / getPresets / escapeHtml');
    }
    let sortable = null;
    let sortableList = null; // 排序控制器挂着的容器
    let bound = null; // 已挂上点击委托的容器
    let boundToggle = null;
    let unbindRename = null;
    let collapsed = null; // 首次用到时才读存储

    function isCollapsed() {
        if (collapsed === null) collapsed = readCollapsed(document, listId, defaultCollapsed);
        return collapsed;
    }

    function rowMarkup(preset, current, withHandle) {
        const pid = escapeHtml(preset.id);
        const pname = escapeHtml(preset.name || preset.id);
        const selected = preset.id === current;
        const items = menuItems.map(item => `
                    <button type="button" role="menuitem" class="char-menu-item${item.danger ? ' danger' : ''}" data-preset-action="${escapeHtml(item.action)}" data-preset-id="${pid}" title="${escapeHtml(item.label)}"><i class="fa-solid ${escapeHtml(item.icon)}" aria-hidden="true"></i><span class="char-menu-label">${escapeHtml(item.label)}</span></button>`).join('');
        return `
        <div class="preset-row${selected ? ' selected' : ''}" role="listitem" tabindex="0" data-preset-id="${pid}"${selected ? ' aria-current="true"' : ''}>
            ${withHandle ? `<span class="char-drag-handle" role="button" tabindex="0" data-preset-drag="${pid}" title="拖动调整顺序，也可聚焦后按 ↑ / ↓" aria-label="拖动调整${escapeHtml(noun)} ${pname} 的顺序">⋮⋮</span>` : ''}
            <input type="text" class="preset-row-name inline-name" value="${pname}" placeholder="${escapeHtml(noun)}名称" title="点一下改名（Enter 确认，Esc 还原）" aria-label="${escapeHtml(noun)}名称" autocomplete="off">
            <span class="char-menu-wrap" data-card-menu>
                <button type="button" class="char-action-button char-menu-button" data-preset-action="menu" data-preset-id="${pid}" title="更多操作" aria-label="更多操作 ${pname}" aria-haspopup="menu" aria-expanded="false"><i class="fa-solid fa-ellipsis" aria-hidden="true"></i></button>
                <div class="char-menu" role="menu" aria-label="更多操作 ${pname}" hidden>${items}
                </div>
            </span>
        </div>`;
    }

    // 行里除名称输入框、拖动手柄、菜单浮层之外的地方点一下 = 选中；带 data-preset-action 的按钮（“…”与菜单项）各走各的。
    function handleClick(event) {
        const list = getList();
        const target = event.target;
        const button = target?.closest?.('[data-preset-action]');
        const row = target?.closest?.('.preset-row');
        if (!list || !row || !list.contains(row)) return;
        if (!button && target.closest(`${INLINE_NAME_SELECTOR}, [data-preset-drag], .char-menu`)) return;
        // 选中菜单项：先关菜单（焦点回到“…”按钮），再走与点选一致的处理。
        if (button?.closest('[role="menu"]')) closeMenu?.({ restoreFocus: true });
        const action = button ? button.dataset.presetAction : 'select';
        const id = row.dataset.presetId ?? '';
        if (action === 'menu') {
            toggleMenu?.(button);
            return;
        }
        const preset = getPresets().find(item => item.id === id);
        if (!preset) return;
        if (action === 'select') onSelect?.(id, preset);
        else onAction?.(action, id, preset);
    }

    // 键盘：焦点在行本身时 Enter / 空格 = 选中（名称输入框里的按键归它自己）。
    function handleKeydown(event) {
        if ((event.key !== 'Enter' && event.key !== ' ') || !event.target?.classList?.contains('preset-row')) return;
        event.preventDefault();
        handleClick(event);
    }

    function handleRename(input, name) {
        const id = input.closest('.preset-row')?.dataset.presetId ?? '';
        const preset = getPresets().find(item => item.id === id);
        const result = preset && onRename ? onRename(id, name, preset) : false;
        if (result === false) return false;
        // 返回 Promise 时，落定（成功或失败）后核对一遍：名称与数据不一致的行还原，一致的只刷新高亮；其余由调用方在数据变化后自己 refresh。
        if (typeof result?.then === 'function') result.then(refresh, refresh);
        return undefined;
    }

    function bind() {
        const list = getList();
        if (!list || bound === list) return;
        destroyBindings();
        list.addEventListener('click', handleClick);
        list.addEventListener('keydown', handleKeydown);
        unbindRename = bindInlineRename(list, { onCommit: handleRename });
        bound = list;
    }

    function destroyBindings() {
        bound?.removeEventListener('click', handleClick);
        bound?.removeEventListener('keydown', handleKeydown);
        unbindRename?.();
        unbindRename = null;
        bound = null;
    }

    function ensureSortable() {
        const list = getList();
        if (!list || !createSortable) return;
        if (sortable && sortableList === list) return;
        sortable?.destroy?.(); // 容器被换成了新节点（页面整块重绘）：旧控制器还挂在旧节点上
        sortable = null;
        sortableList = list;
        sortable = createSortable({
            container: list,
            rowSelector: '.preset-row',
            handleSelector: '[data-preset-drag]',
            getId: row => row.dataset.presetId,
            onReorder: ids => onReorder?.(ids),
            moveStep,
            autoScroll: autoScroll ? event => autoScroll(event, list) : null,
            document,
        }) || null;
    }

    function handleToggle() {
        setCollapsed(!isCollapsed());
    }

    function syncToggle() {
        const toggle = getToggle?.();
        if (!toggle) return;
        const folded = isCollapsed();
        toggle.classList.toggle('collapsed', folded);
        toggle.setAttribute('aria-expanded', String(!folded));
        toggle.setAttribute('aria-label', `${folded ? '展开' : '折叠'}${noun}列表`);
        if (boundToggle !== toggle) {
            boundToggle?.removeEventListener('click', handleToggle);
            toggle.addEventListener('click', handleToggle);
            boundToggle = toggle;
        }
    }

    // 折叠时只显示当前使用的预设（当前项缺失时退到第一个），不画拖动手柄。
    function visiblePresets(presets, current, folded) {
        return folded ? presets.filter(preset => preset.id === current).concat(presets).slice(0, 1) : presets;
    }

    function render() {
        const list = getList();
        if (!list) return;
        closeMenu?.(); // 整体重绘会换掉所有行，已打开的菜单随之失效
        const presets = getPresets();
        const current = getCurrentId();
        const folded = isCollapsed();
        list.classList.toggle('preset-list-collapsed', folded);
        const shown = visiblePresets(presets, current, folded);
        // eslint-disable-next-line no-unsanitized/property -- 名称与 id 都经注入的 escapeHtml 转义，其余是固定标记
        list.innerHTML = shown.length
            ? shown.map(preset => rowMarkup(preset, current, !folded)).join('')
            : `<div class="preset-list-empty">暂无${escapeHtml(noun)}</div>`;
        syncToggle();
        bind();
        ensureSortable();
    }

    function setCollapsed(value) {
        collapsed = Boolean(value);
        writeCollapsed(document, listId, collapsed);
        render();
    }

    // 只改高亮，不重绘：被点的按钮留在原处，键盘焦点不丢。折叠时列表里只有当前项，换了当前项就要重绘。
    function syncSelection() {
        const list = getList();
        if (!list) return;
        if (isCollapsed()) {
            render();
            return;
        }
        const current = getCurrentId();
        list.querySelectorAll('.preset-row').forEach((row) => {
            const selected = row.dataset.presetId === current;
            row.classList.toggle('selected', selected);
            if (selected) row.setAttribute('aria-current', 'true'); else row.removeAttribute('aria-current');
        });
    }

    // 数据可能在外面变了（保存回执、重命名、增删、排序）：显示的行（id、名称、顺序）与现在不一致就重绘，
    // 一致则只刷新高亮，不动 DOM，焦点不丢。
    function refresh() {
        const list = getList();
        if (!list) return;
        const active = list.ownerDocument?.activeElement;
        if (active && list.contains(active) && active.matches?.(INLINE_NAME_SELECTOR)) return; // 正在改名：不重绘，免得丢掉输入
        const folded = isCollapsed();
        const shown = visiblePresets(getPresets(), getCurrentId(), folded);
        const rows = Array.from(list.querySelectorAll('.preset-row'));
        const same = bound === list
            && list.classList.contains('preset-list-collapsed') === folded
            && rows.length === shown.length
            && rows.every((row, index) => row.dataset.presetId === String(shown[index].id)
                && row.querySelector('.preset-row-name')?.value === String(shown[index].name || shown[index].id));
        if (same) syncSelection();
        else render();
    }

    function destroy() {
        destroyBindings();
        boundToggle?.removeEventListener('click', handleToggle);
        boundToggle = null;
        sortable?.destroy?.();
        sortable = null;
        sortableList = null;
    }

    return {
        render,
        syncSelection,
        refresh,
        ensureSortable,
        bind,
        destroy,
        isCollapsed,
        setCollapsed,
        toggle: handleToggle,
    };
}
