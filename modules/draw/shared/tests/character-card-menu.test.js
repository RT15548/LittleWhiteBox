// “…”下拉菜单（character-card-menu.js）：定位纯函数与开关行为。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { computeMenuPosition, createCardMenuController } from '../character-card-menu.js';

const MARKUP = `<!doctype html><html><body>
<div id="a" data-card-menu><button type="button" aria-haspopup="menu" aria-expanded="false">…</button>
  <div role="menu" hidden><button role="menuitem">一</button><button role="menuitem">二</button><button role="menuitem">三</button></div></div>
<div id="b" data-card-menu><button type="button" aria-haspopup="menu" aria-expanded="false">…</button>
  <div role="menu" hidden><button role="menuitem">甲</button></div></div>
<p id="outside">外面</p></body></html>`;

function mount() {
    const { document, window } = parseHTML(MARKUP);
    const controller = createCardMenuController({ document, getViewport: () => ({ width: 800, height: 600 }) });
    const q = selector => document.querySelector(selector);
    return {
        controller, document, window,
        buttonA: q('#a button[aria-haspopup]'), menuA: q('#a [role="menu"]'),
        buttonB: q('#b button[aria-haspopup]'), menuB: q('#b [role="menu"]'),
        fire: (target, type, init = {}) => target.dispatchEvent(new window.Event(type, { bubbles: true, ...init })),
        key: (target, key) => {
            const event = new window.Event('keydown', { bubbles: true, cancelable: true });
            event.key = key;
            target.dispatchEvent(event);
            return event;
        },
    };
}

test('computeMenuPosition aligns to the button, flips upward near the bottom and clamps to the viewport', () => {
    const menu = { width: 140, height: 120 };
    const viewport = { width: 400, height: 600 };
    const normal = computeMenuPosition({ top: 100, bottom: 134, left: 330, right: 364 }, menu, viewport);
    assert.deepEqual([normal.left, normal.top, normal.flipped], [224, 138, false]);
    const nearBottom = computeMenuPosition({ top: 540, bottom: 574, left: 330, right: 364 }, menu, viewport);
    assert.equal(nearBottom.flipped, true);
    assert.equal(nearBottom.top, 540 - 4 - 120);
    const nearLeft = computeMenuPosition({ top: 100, bottom: 134, left: 0, right: 34 }, menu, viewport);
    assert.equal(nearLeft.left, 8, '夹在左边距内');
    const tall = computeMenuPosition({ top: 100, bottom: 134, left: 330, right: 364 }, { width: 140, height: 900 }, viewport);
    assert.equal(tall.maxHeight, 584);
    assert.equal(tall.top, 8);
});

test('opening shows the menu, marks the button expanded and focuses the first item', () => {
    const t = mount();
    assert.equal(t.controller.toggle(t.buttonA), true);
    assert.equal(t.menuA.hasAttribute('hidden'), false);
    assert.equal(t.buttonA.getAttribute('aria-expanded'), 'true');
    assert.equal(t.menuA.style.position, 'fixed');
    assert.equal(t.controller.isOpen(), true);
    assert.equal(t.controller.getOpenButton(), t.buttonA);
    t.controller.toggle(t.buttonA);
    assert.equal(t.controller.isOpen(), false, '再点同一个“…”关闭');
    assert.equal(t.menuA.hasAttribute('hidden'), true);
});

test('only one menu is open at a time', () => {
    const t = mount();
    t.controller.open(t.buttonA);
    t.controller.open(t.buttonB);
    assert.equal(t.menuA.hasAttribute('hidden'), true);
    assert.equal(t.buttonA.getAttribute('aria-expanded'), 'false');
    assert.equal(t.menuB.hasAttribute('hidden'), false);
});

test('an outside click and Escape close the menu; Escape does not reach other handlers', () => {
    const t = mount();
    t.controller.open(t.buttonA);
    t.fire(t.document.getElementById('outside'), 'click');
    assert.equal(t.controller.isOpen(), false);

    t.controller.open(t.buttonA);
    let leaked = false;
    t.window.addEventListener('keydown', () => { leaked = true; });
    t.key(t.menuA.querySelector('[role="menuitem"]'), 'Escape');
    assert.equal(t.controller.isOpen(), false);
    assert.equal(leaked, false, 'Esc 在捕获阶段被拦下');
});

test('arrow keys move through the items and wrap around', () => {
    const t = mount();
    t.controller.open(t.buttonA);
    const items = Array.from(t.menuA.querySelectorAll('[role="menuitem"]'));
    const order = [];
    for (const item of items) item.focus = () => order.push(item.textContent);
    t.key(items[0], 'ArrowDown');
    t.key(items[2], 'ArrowDown');
    t.key(items[0], 'ArrowUp');
    t.key(items[1], 'End');
    t.key(items[1], 'Home');
    assert.deepEqual(order, ['二', '一', '三', '三', '一']);
});

test('destroy closes the open menu and stops listening', () => {
    const t = mount();
    t.controller.open(t.buttonA);
    t.controller.destroy();
    assert.equal(t.controller.isOpen(), false);
    t.controller.open(t.buttonA);
    t.fire(t.document.getElementById('outside'), 'click');
    assert.equal(t.menuA.hasAttribute('hidden'), false, '销毁后不再响应外部点击');
});

test('a button without a menu does not open anything', () => {
    const t = mount();
    const orphan = t.document.createElement('button');
    assert.equal(t.controller.open(orphan), false);
    assert.equal(t.controller.isOpen(), false);
});
