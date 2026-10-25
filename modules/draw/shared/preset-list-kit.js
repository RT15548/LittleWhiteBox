// 预设列表的统一接线：preset-list-view.js 只管“画列表 + 把点击翻译成动作”，拖拽排序、“…”菜单、键盘移动、
// 拖拽时的边缘滚动都靠注入。这里把这些件一次接好，各设置页（参数 / 提示词预设、API 配置预设、场景 Agent 预设）
// 只需要给出数据来源和动作处理，不必各自再接一遍。
// 每个 kit 自己持有一个菜单控制器（第一次打开菜单时才创建，它会在 document 上挂监听），也可以经 shareMenu 复用页面已有的那个；
// 页面销毁时调用 destroy()。

import { createCardMenuController } from './character-card-menu.js';
import { autoScrollForPointer } from './character-list-scroll.js';
import { movePresetId } from './preset-order.js';
import { createPresetListView } from './preset-list-view.js';
import { createSortableList } from './sortable-list.js';
import { escapeHtml as defaultEscapeHtml } from './html-escape.js';

/** 拖拽中靠近列表上 / 下缘时先滚列表自己，滚到头再带动外层 / 整页。 */
export function autoScrollPresetList(event, list) {
    const doc = list.ownerDocument;
    const win = doc?.defaultView;
    if (!doc || !win) return;
    autoScrollForPointer({
        start: doc.elementFromPoint?.(event.clientX, event.clientY) || list,
        pointerY: event.clientY,
        getStyle: element => win.getComputedStyle(element),
        getRect: element => element.getBoundingClientRect(),
        viewport: { top: 0, bottom: win.innerHeight },
        pageScroller: doc.scrollingElement || doc.documentElement,
    });
}

/**
 * @param {object} [options]
 * @param {function(*): string} [options.escapeHtml]
 * @param {{get: function(Document): object, peek: function(): (object|null)}} [options.shareMenu]
 *        复用页面已有的菜单控制器：get 在需要时创建并返回，peek 只查看（没有则返回 null）
 * @returns {{createPresetListView: function(object): object, autoScroll: function(Event, Element): void, destroy: function(): void}}
 */
export function createPresetListKit({ escapeHtml = defaultEscapeHtml, shareMenu = null } = {}) {
    let ownMenu = null;
    const menu = shareMenu || {
        get(document) {
            ownMenu ||= createCardMenuController({ document });
            return ownMenu;
        },
        peek: () => ownMenu,
    };
    return {
        /** 参数与 preset-list-view.js 的 createPresetListView 相同；escapeHtml、菜单、排序、键盘移动和边缘滚动已接好。 */
        createPresetListView(options = {}) {
            return createPresetListView({
                escapeHtml,
                closeMenu: closeOptions => menu.peek()?.close(closeOptions),
                toggleMenu: button => menu.get(options.document)?.toggle(button),
                createSortable: createSortableList,
                moveStep: movePresetId,
                autoScroll: autoScrollPresetList,
                ...options,
            });
        },
        /** 拖拽中靠近边缘时滚动（列表之外的排序控制器也可以用，参数是 (指针事件, 列表容器)）。 */
        autoScroll: autoScrollPresetList,
        destroy() {
            ownMenu?.destroy();
            ownMenu = null;
        },
    };
}
