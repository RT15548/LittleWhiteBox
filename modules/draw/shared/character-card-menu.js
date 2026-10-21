// 角色卡“更多操作”下拉菜单（NovelAI / SD WebUI / ComfyUI 三个面板共用）。
// 菜单是一个 position: fixed 的浮层，位置由“…”按钮的矩形算出，因此不会被带 overflow 的分组滚动区裁掉；
// 靠近底部 / 右侧时向上翻转并夹在视口内。同一时间只开一个；点外面、按 Esc、选中菜单项、列表重绘、滚动或缩放都会关闭。
// 本模块只管开关与定位，菜单项的动作仍由各页面原有的点击委托处理。
//
// 约定的标记（类名由各页面自己决定，这里只认属性）：
//   [data-card-menu]                      外层容器，包含按钮与菜单
//   button[aria-haspopup="menu"]          “…”按钮（本模块维护 aria-expanded）
//   [role="menu"][hidden]                 菜单；其中的 [role="menuitem"] 是可聚焦的 button
// 不得 import 酒馆内部模块；DOM 全部经传入的 document。

const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 4;

/**
 * 菜单位置（纯函数，可单测）：默认贴在按钮下方、右边缘与按钮右边缘对齐；
 * 下方放不下而上方放得下时翻到按钮上方；最后把菜单夹在视口内。
 * @param {{top: number, bottom: number, left: number, right: number}} anchor 按钮矩形
 * @param {{width: number, height: number}} menu 菜单尺寸
 * @param {{width: number, height: number}} viewport 视口尺寸
 * @returns {{left: number, top: number, flipped: boolean, maxHeight: number}}
 */
export function computeMenuPosition(anchor, menu, viewport, { margin = VIEWPORT_MARGIN, gap = ANCHOR_GAP } = {}) {
    const maxHeight = Math.max(0, viewport.height - margin * 2);
    const height = Math.min(menu.height, maxHeight);
    const left = Math.max(margin, Math.min(anchor.right - menu.width, viewport.width - margin - menu.width));
    let top = anchor.bottom + gap;
    let flipped = false;
    if (top + height > viewport.height - margin && anchor.top - gap - height >= margin) {
        top = anchor.top - gap - height;
        flipped = true;
    }
    top = Math.max(margin, Math.min(top, viewport.height - margin - height));
    return { left, top, flipped, maxHeight };
}

/**
 * @param {object} options
 * @param {Document} options.document
 * @param {function} [options.getViewport] () => { width, height }，默认取 document 的视口（测试用）
 */
export function createCardMenuController({ document, getViewport } = {}) {
    if (!document) throw new TypeError('缺少 document');
    const win = document.defaultView || null;
    const viewport = getViewport || (() => ({
        width: document.documentElement?.clientWidth || win?.innerWidth || 0,
        height: win?.innerHeight || document.documentElement?.clientHeight || 0,
    }));
    let current = null; // { button, menu, wrap }
    const listeners = [];

    const wrapOf = node => node?.closest?.('[data-card-menu]') || null;
    const itemsOf = menu => Array.from(menu.querySelectorAll('[role="menuitem"]')).filter(item => !item.disabled);

    function close({ restoreFocus = false } = {}) {
        if (!current) return false;
        const { button, menu } = current;
        current = null;
        menu.setAttribute('hidden', '');
        menu.style.cssText = '';
        button.setAttribute('aria-expanded', 'false');
        if (restoreFocus) button.focus?.();
        return true;
    }

    function place({ button, menu }) {
        // 先以固定定位取消隐藏再量尺寸；量完立即定位，同一帧内不会闪烁。
        menu.style.position = 'fixed';
        menu.style.left = '0px';
        menu.style.top = '0px';
        menu.removeAttribute('hidden');
        const rect = menu.getBoundingClientRect?.() || { width: 0, height: 0 };
        const anchor = button.getBoundingClientRect?.() || { top: 0, bottom: 0, left: 0, right: 0 };
        const pos = computeMenuPosition(anchor, { width: rect.width || 0, height: rect.height || 0 }, viewport());
        menu.style.left = `${Math.round(pos.left)}px`;
        menu.style.top = `${Math.round(pos.top)}px`;
        if (pos.maxHeight > 0) menu.style.maxHeight = `${Math.round(pos.maxHeight)}px`;
        menu.dataset.placement = pos.flipped ? 'top' : 'bottom';
    }

    function open(button) {
        const wrap = wrapOf(button);
        const menu = wrap?.querySelector('[role="menu"]');
        if (!menu) return false;
        if (current?.menu !== menu) close();
        current = { button, menu, wrap };
        button.setAttribute('aria-expanded', 'true');
        place(current);
        itemsOf(menu)[0]?.focus?.({ preventScroll: true });
        return true;
    }

    function toggle(button) {
        if (current && current.button === button) { close({ restoreFocus: true }); return false; }
        return open(button);
    }

    function on(target, type, handler, capture) {
        target.addEventListener(type, handler, capture);
        listeners.push(() => target.removeEventListener(type, handler, capture));
    }

    // 点击菜单以外的任何地方（包括别的卡片的“…”：它自己的处理已先换成新菜单，这里看到的是新菜单的容器）
    on(document, 'click', (event) => {
        if (current && !current.wrap.contains(event.target)) close();
    });
    // Esc：在捕获阶段拦下，只关菜单并把焦点还给“…”按钮，不再传给页面里其它的 Esc 处理。
    on(document, 'keydown', (event) => {
        if (!current) return;
        if (event.key === 'Escape') {
            event.preventDefault?.();
            event.stopPropagation?.();
            close({ restoreFocus: true });
            return;
        }
        if (!current.menu.contains(event.target)) return;
        const items = itemsOf(current.menu);
        const index = items.indexOf(event.target.closest?.('[role="menuitem"]'));
        const move = (to) => { event.preventDefault?.(); items[(to + items.length) % items.length]?.focus?.(); };
        if (event.key === 'ArrowDown') move(index + 1);
        else if (event.key === 'ArrowUp') move(index < 0 ? items.length - 1 : index - 1);
        else if (event.key === 'Home') move(0);
        else if (event.key === 'End') move(items.length - 1);
    }, true);
    // Tab 走出菜单容器时关闭（焦点已经在别处，不再抢回来）。
    on(document, 'focusin', (event) => {
        if (current && !current.wrap.contains(event.target)) close();
    });
    // 浮层不跟随滚动 / 缩放：直接关闭（菜单自己的滚动除外）。
    on(document, 'scroll', (event) => {
        if (current && !current.menu.contains(event.target)) close();
    }, true);
    if (win) on(win, 'resize', () => close());

    return {
        open,
        toggle,
        close,
        isOpen: () => !!current,
        getOpenButton: () => current?.button || null,
        destroy() {
            close();
            listeners.splice(0).forEach(off => off());
        },
    };
}
