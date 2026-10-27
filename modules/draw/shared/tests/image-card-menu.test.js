// 聊天里失败 / 未生成图片卡的“…”更多菜单（image-card-menu.js）：标记与开合行为。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { buildCardMoreMenuHtml, buildFailedActionsHtml, buildUngeneratedActionsHtml, installImageCardMenu } from '../image-card-menu.js';

const actions = card => [...card.querySelectorAll('[data-action]')].map(el => el.dataset.action);

function mount() {
    const { document, window } = parseHTML(`<!doctype html><html><body>
<div id="a" class="xb-nd-img">${buildFailedActionsHtml({ historyCount: 0 })}</div>
<div id="b" class="xb-nd-img">${buildUngeneratedActionsHtml()}</div>
<p id="outside">外面</p></body></html>`);
    const controller = installImageCardMenu(document);
    // 后端的点击委托会截停卡片内所有 [data-action] 的点击。浏览器里 window 捕获先于 document 捕获；
    // linkedom 的派发顺序相反，所以这里把它挂在 window 捕获上、并排在菜单的监听之后，复现浏览器里的先后。
    const seen = [];
    window.addEventListener('click', (event) => {
        const action = event.target.closest?.('.xb-nd-img [data-action]')?.dataset.action;
        if (!action) return;
        seen.push(action);
        event.stopImmediatePropagation();
    }, true);
    const q = selector => document.querySelector(selector);
    // linkedom 不维护 activeElement：把每个元素的 focus() 记成“当前焦点”，断言用 focused() === 元素（不要对 DOM 节点用 assert.equal，失败时会把整棵树打印到内存溢出）。
    let focusedEl = null;
    for (const el of document.querySelectorAll('button')) el.focus = () => { focusedEl = el; };
    return {
        document, window, controller, seen, q, focused: () => focusedEl,
        triggerA: q('#a .xb-nd-more-btn'), menuA: q('#a [role="menu"]'),
        triggerB: q('#b .xb-nd-more-btn'), menuB: q('#b [role="menu"]'),
        click: target => target.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true })),
        key: (target, key) => {
            const event = new window.Event('keydown', { bubbles: true, cancelable: true });
            event.key = key;
            target.dispatchEvent(event);
        },
    };
}

test('failed card: regenerate stays the primary button, the rest hide behind one aria-labelled menu button', () => {
    const { document } = parseHTML(`<div class="xb-nd-img">${buildFailedActionsHtml()}</div>`);
    const row = document.querySelector('.xb-nd-failed-btns');
    const direct = [...row.children];
    assert.equal(direct[0].dataset.action, 'retry-image');
    assert.equal(direct[0].textContent.trim(), '重新生成');
    assert.equal(direct.length, 2, '无历史图时：重新生成 + 更多');
    const trigger = row.querySelector('.xb-nd-more-btn');
    assert.equal(trigger.getAttribute('aria-haspopup'), 'menu');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(trigger.getAttribute('aria-label'), '更多操作');
    assert.equal(trigger.querySelector('svg').getAttribute('aria-hidden'), 'true');
    assert.equal(row.querySelector('details, summary'), null, '不再是 <details> 展开');
    const menu = row.querySelector('[role="menu"]');
    assert.equal(menu.hasAttribute('hidden'), true);
    assert.deepEqual([...menu.querySelectorAll('[role="menuitem"]')].map(el => el.textContent.trim()), ['编辑 TAG', '重画本楼失败图', '移除']);
    assert.deepEqual(actions(menu), ['edit-tags', 'retry-floor-failed', 'remove-placeholder']);
    const remove = menu.querySelector('[data-action="remove-placeholder"]');
    assert.ok(remove.classList.contains('is-danger'));
    assert.equal(remove.previousElementSibling.getAttribute('role'), 'separator', '移除前有分隔线');
    assert.match(menu.querySelector('[data-action="retry-floor-failed"]').getAttribute('title'), /已成功的不受影响/);
});

test('failed card with earlier images adds a restore button next to the primary one', () => {
    const { document } = parseHTML(`<div>${buildFailedActionsHtml({ historyCount: 2 })}</div>`);
    const direct = [...document.querySelector('.xb-nd-failed-btns').children];
    assert.deepEqual(direct.map(el => el.dataset.action), ['retry-image', 'restore-image', undefined]);
});

test('ungenerated card uses the same pattern: generate + menu (edit TAG, remove)', () => {
    const { document } = parseHTML(`<div>${buildUngeneratedActionsHtml()}</div>`);
    const row = document.querySelector('.xb-nd-failed-btns');
    assert.equal(row.children[0].dataset.action, 'retry-image');
    assert.equal(row.children[0].textContent.trim(), '生成');
    assert.deepEqual(actions(row.querySelector('[role="menu"]')), ['edit-tags', 'remove-placeholder']);
});

test('buildCardMoreMenuHtml marks the wrap for the shared card-menu controller', () => {
    const { document } = parseHTML(`<div>${buildCardMoreMenuHtml([{ action: 'x', label: 'X' }])}</div>`);
    assert.ok(document.querySelector('.xb-nd-more[data-card-menu] button[aria-haspopup="menu"] ~ [role="menu"][hidden]'));
});

test('the menu button toggles the menu before the backend delegate sees the click', () => {
    const t = mount();
    t.click(t.triggerA);
    assert.equal(t.menuA.hasAttribute('hidden'), false);
    assert.equal(t.triggerA.getAttribute('aria-expanded'), 'true');
    assert.equal(t.menuA.style.position, 'fixed');
    assert.deepEqual(t.seen, [], '后端委托没有收到这次点击');
    t.click(t.triggerA);
    assert.equal(t.menuA.hasAttribute('hidden'), true);
    assert.equal(t.triggerA.getAttribute('aria-expanded'), 'false');
});

test('choosing an item closes the menu, returns focus to the button and still reaches the backend action', () => {
    const t = mount();
    t.click(t.triggerA);
    t.click(t.menuA.querySelector('[data-action="edit-tags"]'));
    assert.deepEqual(t.seen, ['edit-tags']);
    assert.equal(t.menuA.hasAttribute('hidden'), true);
    assert.equal(t.triggerA.getAttribute('aria-expanded'), 'false');
    assert.ok(t.focused() === t.triggerA);
});

test('Escape and an outside click close the menu; another card button click closes it too', () => {
    const t = mount();
    t.click(t.triggerA);
    t.key(t.menuA.querySelector('[role="menuitem"]'), 'Escape');
    assert.equal(t.menuA.hasAttribute('hidden'), true);
    assert.ok(t.focused() === t.triggerA, 'Esc 后焦点回到“…”');

    t.click(t.triggerA);
    t.click(t.q('#outside'));
    assert.equal(t.menuA.hasAttribute('hidden'), true);

    t.click(t.triggerA);
    t.click(t.q('#a [data-action="retry-image"]'));
    assert.equal(t.menuA.hasAttribute('hidden'), true, '被后端截停的卡片内点击也收起菜单');
    assert.deepEqual(t.seen, ['retry-image']);
});

test('arrow keys move through the items and only one card menu is open at a time', () => {
    const t = mount();
    t.click(t.triggerA);
    const [first, second] = t.menuA.querySelectorAll('[role="menuitem"]');
    assert.ok(t.focused() === first, '打开后焦点在第一项');
    t.key(first, 'ArrowDown');
    assert.ok(t.focused() === second);
    t.click(t.triggerB);
    assert.equal(t.menuA.hasAttribute('hidden'), true);
    assert.equal(t.menuB.hasAttribute('hidden'), false);
});

test('installImageCardMenu is idempotent per document', () => {
    const t = mount();
    assert.equal(installImageCardMenu(t.document), null);
    t.click(t.triggerA);
    t.click(t.triggerA);
    assert.equal(t.menuA.hasAttribute('hidden'), true, '只装过一次：连点两下 = 开再关');
});

// Action routing must survive the portal; otherwise edit/remove can silently
// fail or act on the wrong image. Removing a card must revoke its open actions.
test('portal actions retain their source card and detached cards lose their menu', async () => {
    const t = mount();
    t.click(t.triggerA);
    assert.ok(t.menuA.parentNode === t.document.body);
    t.click(t.menuA.querySelector('[data-action="edit-tags"]'));
    assert.ok(t.menuA.closest('.xb-nd-img') === t.q('#a'));
    assert.deepEqual(t.seen, ['edit-tags']);
    t.click(t.triggerA);
    t.q('#a').remove();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(t.controller.isOpen(), false);
    assert.equal(t.document.body.contains(t.menuA), false);
});
