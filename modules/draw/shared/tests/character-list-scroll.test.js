import test from 'node:test';
import assert from 'node:assert/strict';

import {
    EDGE_SCROLL_STEP_PX,
    EDGE_SCROLL_ZONE_PX,
    autoScrollForPointer,
    canScrollInDirection,
    containerEdgeDirection,
    edgeScrollDirection,
} from '../character-list-scroll.js';

// 用普通对象搭一条“分组滚动区 → 外层滚动容器 → 整页”的祖先链，不依赖 DOM 布局。
function scroller({ parent = null, scrollTop = 0, scrollHeight = 2000, clientHeight = 400, overflowY = 'auto', top = 0, bottom = clientHeight, withScrollBy = false } = {}) {
    const node = { parentElement: parent, scrollTop, scrollHeight, clientHeight, overflowY, rect: { top, bottom }, calls: [] };
    if (withScrollBy) node.scrollBy = (x, y) => { node.calls.push([x, y]); node.scrollTop += y; };
    return node;
}

function run(start, pointerY, extra = {}) {
    return autoScrollForPointer({
        start,
        pointerY,
        getStyle: node => ({ overflowY: node.overflowY }),
        getRect: node => node.rect, // 每次调用都读取节点“当前”的矩形
        viewport: { top: 0, bottom: 800 },
        pageScroller: extra.pageScroller ?? null,
        ...extra,
    });
}

test('edgeScrollDirection: 靠近上缘 -1，靠近下缘 1，中间 0；默认感应区约 40px', () => {
    assert.equal(EDGE_SCROLL_ZONE_PX, 40);
    const bounds = { top: 100, bottom: 500 };
    assert.equal(edgeScrollDirection(120, bounds), -1);
    assert.equal(edgeScrollDirection(139, bounds), -1);
    assert.equal(edgeScrollDirection(140, bounds), 0);
    assert.equal(edgeScrollDirection(300, bounds), 0);
    assert.equal(edgeScrollDirection(460, bounds), 0);
    assert.equal(edgeScrollDirection(461, bounds), 1);
    assert.equal(edgeScrollDirection(490, bounds), 1);
    assert.equal(edgeScrollDirection(Number.NaN, bounds), 0);
    assert.equal(edgeScrollDirection(10, null), 0);
});

test('canScrollInDirection: 到顶不能再上滚，到底不能再下滚，内容不超出时都不能滚', () => {
    assert.equal(canScrollInDirection({ scrollTop: 0, scrollHeight: 1000, clientHeight: 400 }, -1), false);
    assert.equal(canScrollInDirection({ scrollTop: 0, scrollHeight: 1000, clientHeight: 400 }, 1), true);
    assert.equal(canScrollInDirection({ scrollTop: 300, scrollHeight: 1000, clientHeight: 400 }, -1), true);
    assert.equal(canScrollInDirection({ scrollTop: 600, scrollHeight: 1000, clientHeight: 400 }, 1), false);
    assert.equal(canScrollInDirection({ scrollTop: 0, scrollHeight: 300, clientHeight: 400 }, 1), false);
    assert.equal(canScrollInDirection(null, 1), false);
});

test('指针靠近分组滚动区下缘 / 上缘：滚动的是这个分组，而不是整页', () => {
    const page = scroller({ overflowY: 'visible', scrollHeight: 5000, clientHeight: 800, top: 0, bottom: 800 });
    const body = scroller({ parent: page, scrollTop: 100, top: 200, bottom: 600 });
    const card = { parentElement: body, overflowY: 'visible' };

    const down = run(card, 590, { pageScroller: page });
    assert.equal(down.scroller, body);
    assert.equal(body.scrollTop, 100 + EDGE_SCROLL_STEP_PX);
    assert.equal(page.scrollTop, 0, '整页没有被带动');

    const up = run(card, 210, { pageScroller: page });
    assert.equal(up.scroller, body);
    assert.equal(body.scrollTop, 100);
    assert.equal(page.scrollTop, 0);
});

test('指针不在分组滚动区的边缘：该分组不滚动', () => {
    const body = scroller({ scrollTop: 100, top: 200, bottom: 600 });
    const card = { parentElement: body };
    assert.equal(run(card, 400), null);
    assert.equal(body.scrollTop, 100);
});

test('分组滚动区已经滚到头：继续往外带动外层滚动容器 / 整页', () => {
    const page = scroller({ overflowY: 'visible', scrollHeight: 5000, clientHeight: 800, top: 0, bottom: 800 });
    const body = scroller({ parent: page, scrollTop: 1600, scrollHeight: 2000, clientHeight: 400, top: 400, bottom: 800 });
    const card = { parentElement: body };
    // 指针在分组下缘，同时也在视口下缘：分组已到底 → 轮到整页
    const result = run(card, 795, { pageScroller: page });
    assert.equal(result.scroller, page);
    assert.equal(body.scrollTop, 1600);
    assert.equal(page.scrollTop, EDGE_SCROLL_STEP_PX);

    // 反方向：分组在顶部，指针在上缘 → 整页上滚
    body.scrollTop = 0;
    page.scrollTop = 300;
    body.rect = { top: 0, bottom: 400 };
    const upward = run(card, 5, { pageScroller: page });
    assert.equal(upward.scroller, page);
    assert.equal(page.scrollTop, 300 - EDGE_SCROLL_STEP_PX);
});

test('不是真正滚动容器的祖先（overflow 为 visible，或内容没超出）会被跳过', () => {
    const page = scroller({ overflowY: 'visible', scrollHeight: 5000, clientHeight: 800, top: 0, bottom: 800 });
    const shortBody = scroller({ parent: page, overflowY: 'auto', scrollHeight: 300, clientHeight: 400, top: 700, bottom: 800 });
    const plain = scroller({ parent: shortBody, overflowY: 'visible', top: 700, bottom: 800 });
    const card = { parentElement: plain };
    const result = run(card, 790, { pageScroller: page });
    assert.equal(result.scroller, page, '短分组不滚动、visible 容器不滚动，直接带动整页');
    assert.equal(shortBody.scrollTop, 0);
    assert.equal(plain.scrollTop, 0);
});

test('页面里最近的可滚动祖先是外层容器（不是 document）时，它被正确选中', () => {
    const appMain = scroller({ overflowY: 'auto', scrollTop: 500, scrollHeight: 9000, clientHeight: 700, top: 60, bottom: 760 });
    const list = { parentElement: appMain, overflowY: 'visible' };
    const result = run(list, 750, { pageScroller: { scrollTop: 0, scrollHeight: 800, clientHeight: 800 } });
    assert.equal(result.scroller, appMain);
    assert.equal(appMain.scrollTop, 500 + EDGE_SCROLL_STEP_PX);
});

test('没有任何可滚动祖先：退回整页，仅在视口上 / 下缘内滚动', () => {
    const pageScroller = scroller({ overflowY: 'visible', scrollHeight: 5000, clientHeight: 800, scrollTop: 400 });
    const card = { parentElement: null };
    assert.equal(run(card, 400, { pageScroller }), null);
    assert.equal(run(card, 20, { pageScroller }).delta, -EDGE_SCROLL_STEP_PX);
    assert.equal(pageScroller.scrollTop, 400 - EDGE_SCROLL_STEP_PX);
    assert.equal(run(card, 790, { pageScroller }).delta, EDGE_SCROLL_STEP_PX);
    assert.equal(pageScroller.scrollTop, 400);
    assert.equal(run(card, 790, {}), null, '没有 pageScroller 时什么也不做');
});

test('矩形实时读取：同一个指针位置，容器移动后的结果不同；有 scrollBy 时优先用 scrollBy', () => {
    const body = scroller({ scrollTop: 100, top: 100, bottom: 500, withScrollBy: true });
    const card = { parentElement: body };
    assert.equal(run(card, 300), null, '指针在中间');
    body.rect = { top: 100, bottom: 330 }; // 容器收缩后，同一个指针位置变成靠近下缘
    const result = run(card, 300);
    assert.equal(result.scroller, body);
    assert.deepEqual(body.calls, [[0, EDGE_SCROLL_STEP_PX]]);
});

test('containerEdgeDirection: 只认落在视口内的容器边缘', () => {
    const viewport = { top: 0, bottom: 800 };
    assert.equal(containerEdgeDirection(10, { top: 5, bottom: 400 }, viewport), -1, '上缘在视口内');
    assert.equal(containerEdgeDirection(10, { top: -20, bottom: 400 }, viewport), 0, '上缘高出视口：不算上感应边缘');
    assert.equal(containerEdgeDirection(790, { top: 400, bottom: 830 }, viewport), 0, '下缘低于视口：不算下感应边缘');
    assert.equal(containerEdgeDirection(790, { top: 400, bottom: 800 }, viewport), 1, '下缘恰在视口边上：算');
    assert.equal(containerEdgeDirection(10, { top: -20, bottom: 400 }, null), -1, '没给视口就不裁剪');
    // 小容器两条边缘都在感应区时：上缘不可用就退到下缘
    assert.equal(containerEdgeDirection(30, { top: -20, bottom: 60 }, viewport), 1);
    assert.equal(containerEdgeDirection(Number.NaN, { top: 0, bottom: 400 }, viewport), 0);
});

test('分组滚动区的上缘高出视口（如 top=-20），指针在视口顶端附近：直接带动整页，不必先把组内滚到 0', () => {
    const page = scroller({ overflowY: 'visible', scrollHeight: 5000, clientHeight: 800, top: 0, bottom: 800, scrollTop: 300 });
    const body = scroller({ parent: page, scrollTop: 100, top: -20, bottom: 380 });
    const card = { parentElement: body };
    const result = run(card, 10, { pageScroller: page });
    assert.equal(result.scroller, page);
    assert.equal(result.delta, -EDGE_SCROLL_STEP_PX);
    assert.equal(body.scrollTop, 100, '组内位置不动');
    assert.equal(page.scrollTop, 300 - EDGE_SCROLL_STEP_PX);

    // 对称：下缘低于视口，指针在视口底端附近
    const lower = scroller({ parent: page, scrollTop: 100, top: 420, bottom: 830 });
    const lowerResult = run({ parentElement: lower }, 790, { pageScroller: page });
    assert.equal(lowerResult.scroller, page);
    assert.equal(lower.scrollTop, 100);

    // 边缘落在视口内的容器照常优先：上缘 top=5 在视口内
    body.rect = { top: 5, bottom: 380 };
    assert.equal(run(card, 10, { pageScroller: page }).scroller, body);
});

test('skipContainer：被跳过的容器不参与组内滚动，直接轮到外层 / 整页', () => {
    const page = scroller({ overflowY: 'visible', scrollHeight: 5000, clientHeight: 800, top: 0, bottom: 800 });
    const body = scroller({ parent: page, scrollTop: 100, top: 200, bottom: 600 });
    body.isGroupBody = true;
    const card = { parentElement: body };
    assert.equal(run(card, 590, { pageScroller: page }).scroller, body, '默认会滚组内');
    const skipped = run(card, 790, { pageScroller: page, skipContainer: node => node.isGroupBody === true });
    assert.equal(skipped.scroller, page);
    body.scrollTop = 100;
    assert.equal(run(card, 590, { pageScroller: page, skipContainer: node => node.isGroupBody === true }), null, '指针只在组缘、不在视口缘：什么也不滚');
    assert.equal(body.scrollTop, 100);
});

test('整页滚动元素本身及其上层不参与祖先链：pageScroller 一旦出现就直接按视口处理整页', () => {
    // 例如 quirks 模式下 scrollingElement 是 body，而 html 也设了 overflow-y:auto：html 不应再被当成“外层容器”去滚。
    const outer = scroller({ overflowY: 'auto', scrollTop: 50, scrollHeight: 5000, clientHeight: 800, top: 0, bottom: 800 });
    const page = scroller({ parent: outer, overflowY: 'auto', scrollTop: 300, scrollHeight: 5000, clientHeight: 800, top: -300, bottom: 4700 });
    const card = { parentElement: page };
    const result = run(card, 790, { pageScroller: page });
    assert.equal(result.scroller, page);
    assert.equal(result.delta, EDGE_SCROLL_STEP_PX);
    assert.equal(outer.scrollTop, 50, 'pageScroller 之上的容器不会被带动');
    assert.equal(page.scrollTop, 300 + EDGE_SCROLL_STEP_PX);
});
