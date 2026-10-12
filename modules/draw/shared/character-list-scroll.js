// 角色列表的拖拽自动滚动（NovelAI 与 SD / ComfyUI 共用）。
// 展开的分组自带内部滚动区（见各面板样式里的 max-height + overflow-y: auto），所以拖拽排序时指针靠近
// “某个分组滚动区”的上 / 下边缘，要先滚动这个分组；它已经滚到头（或指针不在它的边缘）才轮到更外层的滚动容器，
// 最后退回整页。所有几何信息都在调用时实时读取，不缓存旧坐标；样式与矩形读取方式可注入，便于单测。

export const EDGE_SCROLL_ZONE_PX = 40;
export const EDGE_SCROLL_STEP_PX = 14;

/** 指针 Y 相对一个纵向区域的边缘位置：靠近上缘 → -1，靠近下缘 → 1，否则 0。 */
export function edgeScrollDirection(pointerY, bounds, zone = EDGE_SCROLL_ZONE_PX) {
    if (!bounds || !Number.isFinite(pointerY)) return 0;
    if (pointerY < bounds.top + zone) return -1;
    if (pointerY > bounds.bottom - zone) return 1;
    return 0;
}

/**
 * 指针相对一个滚动容器的感应方向，只认落在视口内的容器边缘：
 * 容器上缘高出视口（top < viewport.top）就不算上感应边缘，下缘低于视口同理。
 * 否则指针在视口顶端附近时，会因为容器那条看不见的上缘“就在附近”而先滚容器，整页迟迟不动。
 * 没给 viewport 时不裁剪。
 */
export function containerEdgeDirection(pointerY, bounds, viewport, zone = EDGE_SCROLL_ZONE_PX) {
    if (!bounds || !Number.isFinite(pointerY)) return 0;
    const topVisible = !viewport || bounds.top >= viewport.top;
    const bottomVisible = !viewport || bounds.bottom <= viewport.bottom;
    if (topVisible && pointerY < bounds.top + zone) return -1;
    if (bottomVisible && pointerY > bounds.bottom - zone) return 1;
    return 0;
}

/** 该滚动容器朝 direction（-1 上 / 1 下）还有没有可滚动的余量。 */
export function canScrollInDirection(element, direction) {
    const top = Number(element?.scrollTop) || 0;
    const range = (Number(element?.scrollHeight) || 0) - (Number(element?.clientHeight) || 0);
    if (range <= 0) return false;
    return direction < 0 ? top > 0 : top < range - 1;
}

function isScrollContainer(element, getStyle) {
    const overflow = getStyle?.(element)?.overflowY;
    if (overflow !== 'auto' && overflow !== 'scroll') return false;
    return (Number(element.scrollHeight) || 0) > (Number(element.clientHeight) || 0);
}

function scrollElementBy(element, delta) {
    if (typeof element.scrollBy === 'function') element.scrollBy(0, delta);
    else element.scrollTop = (Number(element.scrollTop) || 0) + delta;
}

/**
 * 拖拽中根据指针位置自动滚动。从指针下的元素开始，沿祖先链依次尝试每个“真正可滚动”的容器：
 * 指针落在它上 / 下边缘的感应区内（边缘必须在视口内，见 containerEdgeDirection）、且它朝该方向还能滚，
 * 就滚它一步并结束；否则继续试外层。
 * 祖先链都不处理时，退回整页（pageScroller，视口范围由 viewport 给出）。
 * @param {object} options
 * @param {Element|null} options.start 指针下的元素（elementFromPoint 的结果）；拿不到时传列表容器
 * @param {number} options.pointerY
 * @param {function} options.getStyle (element) => CSSStyleDeclaration（只读 overflowY）
 * @param {function} options.getRect (element) => { top, bottom }，每次调用都实时读取
 * @param {{top: number, bottom: number}} options.viewport 整页的可视范围
 * @param {Element|null} [options.pageScroller] 整页滚动元素（通常是 document.scrollingElement）
 * @param {function} [options.skipContainer] (element) => boolean，返回 true 的容器不参与组内滚动
 *        （例如拖动“分组”时落点不依赖组内容，没必要去滚分组内部）
 * @param {number} [options.zone]
 * @param {number} [options.step]
 * @returns {{scroller: Element, delta: number}|null} 实际滚动了哪个容器；没有滚动返回 null
 */
export function autoScrollForPointer({
    start,
    pointerY,
    getStyle,
    getRect,
    viewport,
    pageScroller = null,
    skipContainer = null,
    zone = EDGE_SCROLL_ZONE_PX,
    step = EDGE_SCROLL_STEP_PX,
} = {}) {
    for (let node = start; node; node = node.parentElement) {
        if (node === pageScroller) break;
        if (!isScrollContainer(node, getStyle)) continue;
        if (skipContainer?.(node)) continue;
        const direction = containerEdgeDirection(pointerY, getRect(node), viewport, zone);
        if (!direction || !canScrollInDirection(node, direction)) continue;
        scrollElementBy(node, direction * step);
        return { scroller: node, delta: direction * step };
    }
    if (!pageScroller) return null;
    const direction = edgeScrollDirection(pointerY, viewport, zone);
    if (!direction) return null;
    scrollElementBy(pageScroller, direction * step);
    return { scroller: pageScroller, delta: direction * step };
}
