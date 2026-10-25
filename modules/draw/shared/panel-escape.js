// Esc 关闭绘图设置面板（NovelAI / SD WebUI / ComfyUI 共用）。面板是酒馆页面上的一个全屏浮层，里面是 iframe；页头的 ✕ 按钮关闭它。
// 规则（宁可不关，也不丢草稿、不抢别人的 Esc）：
// - 页面里任何菜单 / 弹出层 / 对话框 / 拖拽正在进行，Esc 只交给它们，不关面板；
// - 有改过、而且还没保存下来的角色编辑卡时，Esc 先保存再关闭：页面通过 onEditsFlush 登记“立刻保存”，保存成功才关；
//   保存失败（名称为空、宿主保存失败）或没人登记就留在原处，状态栏写明原因；保存期间再按 Esc 不会重复触发。已经保存的编辑（自动保存完成 / 点过保存）不算；
// - 其余情况 Esc 等同点 ✕。
// 两个入口：iframe 内部（焦点在设置页里）用 installPanelEscape；焦点在酒馆宿主页面时用 installHostPanelEscape，
// 只做宿主侧的检查（面板可见、没有酒馆自己的弹窗、面板在最上层），然后把这次 Esc 转发进 iframe，交给同一套判断，保证两条路径规则一致。
// 纯判断与 DOM / 事件接线分开；DOM 通过参数注入，便于测试。

// 页面内“Esc 应先交给它”的层。只写有状态的选择器（关闭时元素不存在或带 hidden / 无 visible 类）。
export const ESCAPE_LAYER_SELECTORS = Object.freeze([
    '.char-menu:not([hidden])', // 角色卡 / 预设行的“…”菜单
    '.theme-switch-menu:not([hidden])', // 主题菜单
    '.gallery-modal.visible', // NovelAI 画廊大图
    '[data-role="dialog"]', // 角色库导入 / 导出等对话框
    'dialog[open]',
    '.danbooru-panel:not(.hidden)', // 角色名本地搜索面板
    '.lwb-gp-saveform', '.lwb-gp-confirm', // 分组预设的保存表单与确认条
]);

// 拖拽进行中的标记（排序拖拽、请求结构拖拽、分组高度拖拽）。
export const ESCAPE_DRAG_SELECTORS = Object.freeze([
    'body.sortable-dragging',
    'body.lwb-ple-dragging',
    'body.lwb-group-resizing',
]);

// 角色编辑卡：NovelAI 的 .char-card.editing，SD / ComfyUI 的展开卡片。键用来识别“同一张卡”。
export const EDIT_ROOT_SELECTOR = '.char-card.editing, .sd-char-card[open]';

// 酒馆自己的弹窗 / 下拉：这些开着时 Esc 属于它们。
export const HOST_POPUP_SELECTORS = Object.freeze([
    'dialog[open]',
    '.popup[open]',
    '.select2-container--open',
    '.ui-dialog',
]);

/**
 * 纯判断：这次 Esc 要不要关闭面板。
 * @param {object} input
 * @param {string} input.key
 * @param {boolean} [input.repeat] 按住不放产生的重复事件（菜单被第一下关掉后，重复事件不能顺手关面板）
 * @param {boolean} [input.isComposing] 输入法组字中
 * @param {boolean} [input.defaultPrevented] 前面的处理者已经消费了这次 Esc
 * @param {boolean} [input.layerOpen] 事件开始时有菜单 / 弹出层 / 对话框开着
 * @param {boolean} [input.dragging] 拖拽进行中
 * @param {boolean} [input.unsavedEdit] 有改过但还没保存的编辑卡
 */
export function shouldClosePanelOnEscape(input = {}) {
    if (input.key !== 'Escape') return false;
    if (input.repeat || input.isComposing || input.defaultPrevented) return false;
    if (input.altKey || input.ctrlKey || input.metaKey || input.shiftKey) return false;
    if (input.layerOpen || input.dragging || input.unsavedEdit) return false;
    return true;
}

const matchesAny = (document, selectors) => selectors.some(selector => Boolean(document.querySelector(selector)));

/** 页面里有没有菜单 / 弹出层 / 对话框开着。 */
export function hasOpenLayer(document, selectors = ESCAPE_LAYER_SELECTORS) {
    return matchesAny(document, selectors);
}

/** 页面里有没有拖拽正在进行。 */
export function isDragging(document, selectors = ESCAPE_DRAG_SELECTORS) {
    return matchesAny(document, selectors);
}

function editKey(root, index) {
    return root.getAttribute('data-id') || root.getAttribute('data-character-id') || root.id || `#${index}`;
}

// 页面把编辑存下来之后发这个事件（NovelAI 自动保存到“已保存”时、SD / ComfyUI 保存设置成功后），守卫据此清掉“未保存”的标记。
export const EDITS_SAVED_EVENT = 'xb-draw-edits-saved';

/** 告诉守卫：到目前为止的编辑都已保存。document 是设置页自己的文档（可以为空）。 */
export function reportEditsSaved(document) {
    const View = document?.defaultView;
    if (View?.CustomEvent) document.dispatchEvent(new View.CustomEvent(EDITS_SAVED_EVENT));
}

// Esc 时守卫发这个事件要求“立刻保存”；页面用 onEditsFlush 登记保存函数（NovelAI：自动保存的 flush；SD / ComfyUI：保存设置）。
export const EDITS_FLUSH_EVENT = 'xb-draw-flush-edits';

/** 页面登记“立刻保存”：flush() 返回（Promise 的）true 或 { ok: true } 才表示已保存。返回取消登记。 */
export function onEditsFlush(document, flush) {
    const handler = (event) => { event.detail?.tasks?.push(new Promise(resolve => resolve(flush()))); };
    document.addEventListener(EDITS_FLUSH_EVENT, handler);
    return () => document.removeEventListener(EDITS_FLUSH_EVENT, handler);
}

/** 要求页面立刻保存并等结果：所有登记的保存都成功才是 true；没人登记、有失败 / 抛错都是 false。 */
export async function requestEditsFlush(document) {
    const View = document?.defaultView;
    if (!View?.CustomEvent) return false;
    const tasks = [];
    document.dispatchEvent(new View.CustomEvent(EDITS_FLUSH_EVENT, { detail: { tasks } }));
    if (!tasks.length) return false;
    const results = await Promise.allSettled(tasks);
    return results.every(item => item.status === 'fulfilled' && (item.value === true || item.value?.ok === true));
}

/**
 * 记录“哪些编辑卡里有还没保存的改动”：编辑卡里发生过 input / change 就记一笔（按卡的 id），
 * 收到 EDITS_SAVED_EVENT（已保存）就全部清掉；卡片关掉（保存 / 取消 / 重绘成非编辑态）之后，在下一次事件或查询时也会自动清掉。
 * 只记“碰过”会在自动保存之后一直挡着 Esc，所以“已保存”必须能清掉标记。
 */
export function createEditGuard({ document, rootSelector = EDIT_ROOT_SELECTOR } = {}) {
    const dirty = new Set();
    const listeners = [];

    const openKeys = () => new Map(Array.from(document.querySelectorAll(rootSelector), (root, index) => [editKey(root, index), root]));
    const prune = () => {
        const open = openKeys();
        for (const key of [...dirty]) if (!open.has(key)) dirty.delete(key);
        return open;
    };
    const mark = (event) => {
        const open = prune();
        const root = event.target?.closest?.(rootSelector);
        if (!root) return;
        for (const [key, node] of open) if (node === root) dirty.add(key);
    };
    for (const type of ['input', 'change']) {
        document.addEventListener(type, mark, true);
        listeners.push(() => document.removeEventListener(type, mark, true));
    }
    const onSaved = () => dirty.clear();
    document.addEventListener(EDITS_SAVED_EVENT, onSaved);
    listeners.push(() => document.removeEventListener(EDITS_SAVED_EVENT, onSaved));
    // 点击（保存 / 取消 / 打开别的卡）之前先对一遍账，避免“关了又开”的同一张卡带着旧标记。
    const settle = () => { prune(); };
    document.addEventListener('click', settle, true);
    listeners.push(() => document.removeEventListener('click', settle, true));

    return {
        hasUnsavedEdit() {
            prune();
            return dirty.size > 0;
        },
        /** 立刻保存当前的编辑，Promise<boolean>：是否已全部保存（见 requestEditsFlush）。 */
        flush: () => requestEditsFlush(document),
        destroy() {
            for (const remove of listeners.splice(0)) remove();
            dirty.clear();
        },
    };
}

/**
 * iframe 内（设置页自己的文档）的 Esc 监听。
 * 捕获阶段先记下“事件开始时”的状态（那时菜单 / 对话框还没来得及自己关掉），冒泡阶段到 window 时再决定：
 * 被菜单 / 对话框 / 拖拽截走（stopPropagation）或已 preventDefault 的 Esc 到不了这里或会被判为已消费。
 * @param {object} options
 * @param {Document} options.document
 * @param {function} options.close 关闭面板（与点 ✕ 相同）
 * @param {function} [options.hasUnsavedEdit]
 * @param {function(): Promise<boolean>} [options.flush] 有未保存编辑时先保存；成功才关，没提供就保持“不关”
 * @param {string[]} [options.layerSelectors] 视为“开着的层”的选择器
 * @param {string[]} [options.dragSelectors] 视为“拖拽进行中”的选择器
 * @returns {function} 取消监听
 */
export function installPanelEscape({ document, close, hasUnsavedEdit = () => false, flush = null, layerSelectors = ESCAPE_LAYER_SELECTORS, dragSelectors = ESCAPE_DRAG_SELECTORS } = {}) {
    const win = document.defaultView;
    if (!win || typeof close !== 'function') return () => {};
    let snapshot = null;
    let saving = false; // 保存期间再按 Esc 不重复触发，也不会关两次
    const onCapture = (event) => {
        if (event.key !== 'Escape') return;
        snapshot = {
            layerOpen: hasOpenLayer(document, layerSelectors),
            dragging: isDragging(document, dragSelectors),
            unsavedEdit: Boolean(hasUnsavedEdit()),
        };
    };
    const saveThenClose = async () => {
        saving = true;
        let saved = false;
        try { saved = (await flush()) === true; } catch { saved = false; }
        saving = false;
        if (saved) close();
    };
    const onBubble = (event) => {
        if (event.key !== 'Escape') return;
        const state = snapshot || { layerOpen: hasOpenLayer(document, layerSelectors), dragging: isDragging(document, dragSelectors), unsavedEdit: Boolean(hasUnsavedEdit()) };
        snapshot = null;
        const isComposing = Boolean(event.isComposing) || event.keyCode === 229;
        const input = { ...state, key: event.key, repeat: event.repeat, isComposing, defaultPrevented: event.defaultPrevented, altKey: event.altKey, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey };
        if (!shouldClosePanelOnEscape({ ...input, unsavedEdit: false })) return;
        if (saving) { event.preventDefault?.(); return; }
        if (!state.unsavedEdit) {
            event.preventDefault?.();
            close();
            return;
        }
        if (!flush) return;
        event.preventDefault?.();
        saveThenClose().catch(error => console.warn('[panel-escape] 关闭面板失败', error));
    };
    win.addEventListener('keydown', onCapture, true);
    win.addEventListener('keydown', onBubble, false);
    return () => {
        win.removeEventListener('keydown', onCapture, true);
        win.removeEventListener('keydown', onBubble, false);
    };
}

/** 酒馆宿主页面里有没有它自己的弹窗 / 下拉开着。 */
export function isHostPopupOpen(hostDocument, selectors = HOST_POPUP_SELECTORS) {
    return matchesAny(hostDocument, selectors);
}

function overlayVisible(overlay) {
    return Boolean(overlay?.isConnected) && overlay.style?.display !== 'none';
}

/** 面板浮层是否在最上层：取浮层中心点上的元素，必须落在浮层内（别的更高的浮层盖着时不抢 Esc）。拿不到命中结果时按“在最上层”处理。 */
export function isOverlayTopmost(hostDocument, overlay) {
    if (typeof hostDocument.elementFromPoint !== 'function') return true;
    const view = hostDocument.defaultView;
    const top = hostDocument.elementFromPoint(Math.round((view?.innerWidth || 0) / 2), Math.round((view?.innerHeight || 0) / 2));
    return !top || overlay.contains(top);
}

function forwardEscapeIntoFrame(frameDocument) {
    const view = frameDocument.defaultView;
    const Keyboard = view?.KeyboardEvent;
    const target = frameDocument.activeElement || frameDocument.body;
    if (!Keyboard || !target) return false;
    target.dispatchEvent(new Keyboard('keydown', { key: 'Escape', code: 'Escape', bubbles: true, cancelable: true }));
    return true;
}

/**
 * 酒馆宿主页面里的 Esc 监听（焦点不在 iframe 里时）：面板可见、没有酒馆弹窗、面板在最上层才处理，
 * 处理方式是把 Esc 转发进 iframe，由 installPanelEscape 那一套决定是否真的关闭。随面板创建时注册、关闭时取消。
 * @param {object} options
 * @param {Window} options.hostWindow
 * @param {function} options.getOverlay 返回面板浮层元素（或 null）
 * @param {function} options.getFrame 返回 iframe 元素（或 null）
 * @param {function} [options.forward] 测试用：自定义转发
 * @returns {function} 取消监听
 */
export function installHostPanelEscape({ hostWindow, getOverlay, getFrame, forward = forwardEscapeIntoFrame } = {}) {
    const hostDocument = hostWindow?.document;
    if (!hostDocument) return () => {};
    const onKeydown = (event) => {
        if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.isComposing) return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        const overlay = getOverlay?.();
        if (!overlayVisible(overlay)) return;
        if (isHostPopupOpen(hostDocument)) return;
        if (!isOverlayTopmost(hostDocument, overlay)) return;
        const frameDocument = getFrame?.()?.contentDocument;
        if (!frameDocument) return;
        event.preventDefault?.();
        event.stopPropagation?.();
        forward(frameDocument);
    };
    hostWindow.addEventListener('keydown', onKeydown, true);
    return () => hostWindow.removeEventListener('keydown', onKeydown, true);
}
