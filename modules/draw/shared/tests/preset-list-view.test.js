// 预设列表视图：跑在 linkedom 的真实 DOM 上，菜单与排序控制器用记录调用的假实现代替
// （它们各自有自己的测试，这里只验证本模块怎么接线）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import { createPresetListView } from '../preset-list-view.js';

const escapeHtml = str => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function setup({ presets, current = 'a', withMenu = true, withSortable = true, extra = {} } = {}) {
    const { document } = parseHTML('<!doctype html><html><body><div id="list"></div></body></html>');
    const list = document.getElementById('list');
    const data = { presets: presets || [{ id: 'a', name: '甲' }, { id: 'b', name: '乙' }, { id: 'c', name: '丙' }], current };
    const calls = { select: [], action: [], rename: [], renameResult: undefined, reorder: [], close: [], toggle: [], sortable: [] };
    const view = createPresetListView({
        document,
        getList: () => list,
        getPresets: () => data.presets,
        getCurrentId: () => data.current,
        escapeHtml,
        noun: '测试预设',
        onSelect: (id, preset) => calls.select.push([id, preset.name]),
        onAction: (action, id, preset) => calls.action.push([action, id, preset.name]),
        onRename: (id, name, preset) => { calls.rename.push([id, name, preset.name]); return calls.renameResult; },
        onReorder: ids => calls.reorder.push(ids),
        closeMenu: withMenu ? options => calls.close.push(options) : null,
        toggleMenu: withMenu ? button => calls.toggle.push(button.dataset.presetId) : null,
        createSortable: withSortable ? (options) => { calls.sortable.push(options); return { destroy() { calls.sortable.destroyed = true; } }; } : null,
        moveStep: (ids) => ids,
        autoScroll: (event, target) => calls.sortable.scrolled = [event, target],
        ...extra,
    });
    const click = node => node.dispatchEvent(new document.defaultView.Event('click', { bubbles: true }));
    const rows = () => Array.from(list.querySelectorAll('.preset-row'));
    const fire = (node, type, init = {}) => {
        const event = new document.defaultView.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, init);
        node.dispatchEvent(event);
        return event;
    };
    // 用户点进某一行的名称输入框、改字、离开
    const rename = (row, value) => {
        const input = row.querySelector('.preset-row-name');
        fire(input, 'focusin');
        input.value = value;
        fire(input, 'focusout');
        return input;
    };
    return { document, list, data, calls, view, click, rows, fire, rename };
}

test('render draws one row per preset with handle, name input and a hidden menu, marking the current one', () => {
    const { view, rows } = setup({ current: 'b' });
    view.render();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a', 'b', 'c']);
    assert.deepEqual(rows().map(row => row.classList.contains('selected')), [false, true, false]);
    assert.deepEqual(rows().map(row => row.getAttribute('aria-current')), [null, 'true', null]);
    assert.deepEqual(rows().map(row => row.querySelector('.preset-row-name').value), ['甲', '乙', '丙']);
    assert.equal(rows()[0].querySelector('.preset-row-name').classList.contains('inline-name'), true);
    const first = rows()[0];
    assert.equal(first.getAttribute('role'), 'listitem');
    assert.equal(first.querySelector('[data-preset-drag]').dataset.presetDrag, 'a');
    assert.equal(first.querySelector('.char-menu').hasAttribute('hidden'), true);
    assert.equal(first.querySelector('[data-card-menu]') !== null, true);
    const items = Array.from(first.querySelectorAll('[role="menuitem"]'));
    assert.deepEqual(items.map(item => item.dataset.presetAction), ['duplicate', 'export', 'delete'], '菜单里没有“重命名”：改名在名称输入框里');
    assert.deepEqual(items.map(item => item.dataset.presetId), ['a', 'a', 'a']);
});

test('names and ids are escaped, a nameless preset shows its id, and an empty list shows the empty note', () => {
    const { view, rows, list } = setup({ presets: [{ id: 'x"y', name: '<b>粗</b>' }, { id: 'n2' }], current: 'n2' });
    view.render();
    assert.equal(list.querySelectorAll('b').length, 0);
    assert.equal(rows()[0].querySelector('.preset-row-name').value, '<b>粗</b>');
    assert.equal(rows()[0].dataset.presetId, 'x"y');
    assert.equal(rows()[1].querySelector('.preset-row-name').value, 'n2');

    const empty = setup({ presets: [] });
    empty.view.render();
    assert.equal(empty.rows().length, 0);
});

test('clicking the row (not its name input) selects, the menu button toggles, and a menu item closes the menu first then runs the action', () => {
    const { view, rows, click, calls } = setup();
    view.render();
    calls.close.length = 0;
    click(rows()[1]);
    assert.deepEqual(calls.select, [['b', '乙']]);
    click(rows()[0].querySelector('.preset-row-name'));
    assert.equal(calls.select.length, 1, '点名称是改名，不选中');
    click(rows()[2].querySelector('[data-preset-action="menu"]'));
    assert.deepEqual(calls.toggle, ['c']);
    assert.equal(calls.select.length, 1);
    assert.deepEqual(calls.close, [], '点“…”本身不走关闭');
    click(rows()[2].querySelector('.char-menu'));
    assert.equal(calls.select.length, 1, '点菜单浮层的空白处不选中');

    click(rows()[2].querySelector('[data-preset-action="export"]'));
    assert.deepEqual(calls.close, [{ restoreFocus: true }]);
    assert.deepEqual(calls.action, [['export', 'c', '丙']]);
    click(rows()[0].querySelector('[data-preset-action="delete"]'));
    assert.deepEqual(calls.action.at(-1), ['delete', 'a', '甲']);
});

test('clicks outside any action, or on an id the data no longer has, do nothing', () => {
    const { view, rows, click, calls, data, list } = setup();
    view.render();
    click(rows()[0].querySelector('.char-drag-handle'));
    click(list);
    data.presets = data.presets.filter(preset => preset.id !== 'b'); // 数据变了但 DOM 还没重绘
    click(rows()[1]);
    click(rows()[1].querySelector('[data-preset-action="delete"]'));
    assert.deepEqual(calls.select, []);
    assert.deepEqual(calls.action, []);
});

test('rendering twice keeps a single click listener, and a redraw closes any open menu without asking to restore focus', () => {
    const { view, rows, click, calls } = setup();
    view.render();
    view.render();
    assert.deepEqual(calls.close, [undefined, undefined]);
    click(rows()[0]);
    assert.equal(calls.select.length, 1);
});

test('syncSelection moves the highlight and aria-current without replacing the row nodes', () => {
    const { view, rows, data } = setup({ current: 'a' });
    view.render();
    const before = rows();
    data.current = 'c';
    view.syncSelection();
    assert.deepEqual(rows().map(row => row.classList.contains('selected')), [false, false, true]);
    assert.deepEqual(rows().map(row => row.hasAttribute('aria-current')), [false, false, true]);
    assert.ok(rows().every((row, index) => row === before[index]), '没有重绘');
});

test('the sortable list is created once with the row/handle contract and forwards reorders and auto-scroll', () => {
    const { view, rows, calls, list, document } = setup();
    view.render();
    view.render();
    assert.equal(calls.sortable.length, 1);
    const options = calls.sortable[0];
    assert.equal(options.container, list);
    assert.equal(options.rowSelector, '.preset-row');
    assert.equal(options.handleSelector, '[data-preset-drag]');
    assert.equal(options.document, document);
    assert.equal(options.getId(rows()[1]), 'b');
    options.onReorder(['c', 'a', 'b']);
    assert.deepEqual(calls.reorder, [['c', 'a', 'b']]);
    options.autoScroll('evt');
    assert.deepEqual(calls.sortable.scrolled, ['evt', list], '自动滚动拿到的是列表容器');
});

test('without a sortable factory, or while it returns null, the list works and creation is retried later', () => {
    const none = setup({ withSortable: false });
    none.view.render();
    none.click(none.rows()[0]);
    assert.equal(none.calls.select.length, 1);

    let ready = false;
    const created = [];
    const late = setup({ withSortable: false, extra: { createSortable: (options) => { if (!ready) return null; created.push(options); return { destroy() {} }; } } });
    late.view.render();
    assert.equal(created.length, 0);
    ready = true;
    late.view.ensureSortable();
    late.view.ensureSortable();
    assert.equal(created.length, 1);
});

test('without menu hooks nothing throws', () => {
    const { view, rows, click } = setup({ withMenu: false });
    view.render();
    click(rows()[0].querySelector('[data-preset-action="menu"]'));
    click(rows()[0].querySelector('[data-preset-action="delete"]'));
});

test('custom menu items replace the default three', () => {
    const { view, rows } = setup({ extra: { menuItems: [{ action: 'edit', label: '编辑', icon: 'fa-pen' }, { action: 'remove', label: '移除', icon: 'fa-trash', danger: true }] } });
    view.render();
    const items = Array.from(rows()[0].querySelectorAll('[role="menuitem"]'));
    assert.deepEqual(items.map(item => item.dataset.presetAction), ['edit', 'remove']);
    assert.deepEqual(items.map(item => item.textContent.trim()), ['编辑', '移除']);
    assert.equal(items[1].classList.contains('danger'), true);
});

test('a missing list container is tolerated, and destroy removes the listener and the sortable', () => {
    const { view, rows, click, calls, list } = setup();
    view.render();
    view.destroy();
    assert.equal(calls.sortable.destroyed, true);
    click(rows()[0]);
    assert.equal(calls.select.length, 0);

    const detached = createPresetListView({ document: list.ownerDocument, getList: () => null, getPresets: () => [], getCurrentId: () => null, escapeHtml });
    assert.doesNotThrow(() => { detached.render(); detached.syncSelection(); detached.ensureSortable(); detached.bind(); detached.destroy(); });
});

test('required options are checked', () => {
    assert.throws(() => createPresetListView({}), TypeError);
    assert.throws(() => createPresetListView({ document: {}, getList: () => null, getPresets: () => [] }), TypeError);
});

// ───────────── 折叠 ─────────────

function withToggle(options = {}) {
    const ctx = setup({ extra: { listId: 'test', ...options.extra }, ...options.setup });
    const toggle = ctx.document.createElement('button');
    toggle.setAttribute('aria-expanded', 'true');
    ctx.document.body.appendChild(toggle);
    ctx.view.destroy();
    // 重新创建时带上折叠按钮（setup 的 extra 不能引用 document，所以这里换一个带 getToggle 的视图）
    const view = createPresetListView({
        document: ctx.document,
        getList: () => ctx.list,
        getPresets: () => ctx.data.presets,
        getCurrentId: () => ctx.data.current,
        escapeHtml,
        noun: '测试预设',
        onSelect: (id, preset) => ctx.calls.select.push([id, preset.name]),
        onAction: (action, id, preset) => ctx.calls.action.push([action, id, preset.name]),
        onReorder: ids => ctx.calls.reorder.push(ids),
        closeMenu: options => ctx.calls.close.push(options),
        toggleMenu: button => ctx.calls.toggle.push(button.dataset.presetId),
        listId: 'test',
        getToggle: () => toggle,
        ...options.view,
    });
    return { ...ctx, view, toggle };
}

function fakeStorage(document, { throwing = false } = {}) {
    const store = new Map();
    const storage = {
        getItem: key => { if (throwing) throw new Error('blocked'); return store.has(key) ? store.get(key) : null; },
        setItem: (key, value) => { if (throwing) throw new Error('blocked'); store.set(key, String(value)); },
    };
    Object.defineProperty(document.defaultView, 'localStorage', { value: storage, configurable: true });
    return store;
}

test('the toggle collapses the list to the current preset only: no drag handles, the menu and select still work', () => {
    const { view, toggle, rows, click, list, calls } = withToggle({ setup: { current: 'b' } });
    view.render();
    assert.equal(rows().length, 3);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    click(toggle);
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['b']);
    assert.equal(list.querySelectorAll('[data-preset-drag]').length, 0);
    assert.equal(list.classList.contains('preset-list-collapsed'), true);
    assert.equal(toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(toggle.classList.contains('collapsed'), true);
    click(rows()[0].querySelector('[data-preset-action="menu"]'));
    assert.deepEqual(calls.toggle, ['b']);
    click(rows()[0]);
    assert.deepEqual(calls.select, [['b', '乙']]);
    click(toggle);
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a', 'b', 'c']);
    assert.equal(list.querySelectorAll('[data-preset-drag]').length, 3);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
});

test('while collapsed a change of the current preset redraws the single row; a missing current falls back to the first', () => {
    const { view, data, rows } = withToggle({ setup: { current: 'a' } });
    view.render();
    view.setCollapsed(true);
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a']);
    data.current = 'c';
    view.syncSelection();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['c']);
    assert.equal(rows()[0].classList.contains('selected'), true);
    data.current = 'gone';
    view.render();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a']);
});

test('the collapsed state is remembered per list id in localStorage and survives a new view', () => {
    const first = withToggle();
    const store = fakeStorage(first.document);
    first.view.render();
    assert.equal(first.view.isCollapsed(), false, '默认展开');
    first.view.setCollapsed(true);
    assert.equal(store.get('xb-draw-list-collapsed:test'), '1');
    const second = createPresetListView({
        document: first.document,
        getList: () => first.list,
        getPresets: () => first.data.presets,
        getCurrentId: () => first.data.current,
        escapeHtml,
        noun: '测试预设',
        listId: 'test',
        getToggle: () => first.toggle,
    });
    second.render();
    assert.equal(second.isCollapsed(), true);
    assert.equal(first.rows().length, 1);
    const other = createPresetListView({
        document: first.document, getList: () => first.list, getPresets: () => first.data.presets, getCurrentId: () => first.data.current, escapeHtml, noun: '测试预设', listId: 'other',
    });
    assert.equal(other.isCollapsed(), false, '别的列表不受影响');
    first.view.setCollapsed(false);
    assert.equal(store.get('xb-draw-list-collapsed:test'), '0');
});

test('collapsing keeps working when the storage is unavailable or blocked', () => {
    const blocked = withToggle();
    fakeStorage(blocked.document, { throwing: true });
    blocked.view.render();
    assert.equal(blocked.view.isCollapsed(), false);
    blocked.click(blocked.toggle);
    assert.equal(blocked.view.isCollapsed(), true, '写失败也能折叠');
    assert.equal(blocked.rows().length, 1);
    const none = withToggle();
    none.view.render();
    none.click(none.toggle);
    assert.equal(none.rows().length, 1, '没有 localStorage 的环境同样可用');
});

test('a view without a toggle or list id is never collapsed and setCollapsed still works', () => {
    const { view, rows } = setup();
    view.render();
    assert.equal(view.isCollapsed(), false);
    view.setCollapsed(true);
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a']);
    view.toggle();
    assert.equal(rows().length, 3);
    view.destroy();
});
test('refresh redraws only when the shown rows (ids, names, order, collapse) differ, otherwise just moves the highlight', () => {
    const { view, rows, data, list } = setup({ current: 'a' });
    view.refresh(); // 从未画过：第一次必须画出来
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a', 'b', 'c']);
    const before = rows();
    data.current = 'b';
    view.refresh();
    assert.deepEqual(rows(), before, '只换了当前项：不重绘，行节点原样');
    assert.deepEqual(rows().map(row => row.classList.contains('selected')), [false, true, false]);

    data.presets = [data.presets[2], data.presets[0], data.presets[1]];
    view.refresh();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['c', 'a', 'b']);
    data.presets = data.presets.map(preset => (preset.id === 'a' ? { ...preset, name: '甲改' } : preset));
    view.refresh();
    assert.equal(rows()[1].querySelector('.preset-row-name').value, '甲改');
    data.presets = data.presets.slice(0, 2);
    view.refresh();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['c', 'a']);

    view.setCollapsed(true);
    data.current = 'a';
    view.refresh();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a'], '折叠时当前项换了，留下的是新的当前项');
    assert.equal(list.classList.contains('preset-list-collapsed'), true);
});

test('the sortable controller follows the list container when it is replaced by a new node', () => {
    const { document, calls, list } = setup();
    let current = list;
    const holder = list.parentNode;
    const view2 = createPresetListView({
        document, getList: () => current, getPresets: () => [{ id: 'a', name: '甲' }], getCurrentId: () => 'a', escapeHtml, noun: '测试',
        createSortable: (options) => { calls.sortable.push(options); return { destroy() { calls.sortable.destroyed = (calls.sortable.destroyed || 0) + 1; } }; },
    });
    calls.sortable.length = 0;
    view2.render();
    assert.equal(calls.sortable.length, 1);
    const replacement = document.createElement('div');
    holder.replaceChild(replacement, current);
    current = replacement;
    view2.render();
    assert.equal(calls.sortable.length, 2);
    assert.equal(calls.sortable.destroyed, 1);
    assert.equal(calls.sortable[1].container, replacement);
});

// ───────────── 就地改名 ─────────────

test('editing a name and leaving the input hands (id, new name, preset) to onRename; the row is not selected', () => {
    const { view, rows, rename, calls } = setup();
    view.render();
    const input = rename(rows()[1], '  乙改  ');
    assert.deepEqual(calls.rename, [['b', '乙改', '乙']]);
    assert.equal(input.value, '乙改');
    assert.deepEqual(calls.select, [], '改名不选中，也不触发菜单动作');
    assert.deepEqual(calls.action, []);
});

test('an unchanged or empty name, or a rejection (false), restores the old name without redrawing', () => {
    const { view, rows, rename, calls } = setup();
    view.render();
    const before = rows();
    assert.equal(rename(rows()[0], '甲').value, '甲');
    assert.equal(rename(rows()[0], '   ').value, '甲');
    assert.deepEqual(calls.rename, []);
    calls.renameResult = false;
    assert.equal(rename(rows()[2], '丙改').value, '丙', '调用方拒绝（如重名）：还原');
    assert.ok(rows().every((row, index) => row === before[index]));

    const noHandler = setup({ extra: { onRename: null } });
    noHandler.view.render();
    assert.equal(noHandler.rename(noHandler.rows()[0], '别名').value, '甲', '没有 onRename 的列表不能改名');
});

test('a Promise from onRename is followed by a check that redraws a row whose name the data did not take', async () => {
    const { view, rows, rename, calls, data } = setup();
    view.render();
    const before = rows()[0];
    let settle;
    calls.renameResult = new Promise((resolve) => { settle = resolve; });
    rename(rows()[0], '甲改');
    assert.equal(rows()[0], before, '保存期间保持输入框里的新名字');
    assert.equal(rows()[0].querySelector('.preset-row-name').value, '甲改');
    settle();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(rows()[0].querySelector('.preset-row-name').value, '甲', '数据没改成：重绘回原名');

    calls.renameResult = Promise.resolve();
    rename(rows()[1], '乙改');
    data.presets = data.presets.map(preset => (preset.id === 'b' ? { ...preset, name: '乙改' } : preset)); // 调用方落盘成功
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(rows()[1].querySelector('.preset-row-name').value, '乙改');
});

test('refresh leaves the row alone while a name input has the focus', () => {
    const { view, rows, document, data } = setup();
    view.render();
    const input = rows()[0].querySelector('.preset-row-name');
    Object.defineProperty(document, 'activeElement', { value: input, configurable: true });
    data.presets = data.presets.map(preset => (preset.id === 'a' ? { ...preset, name: '外面改了' } : preset));
    const before = rows()[0];
    view.refresh();
    assert.equal(rows()[0], before);
    Object.defineProperty(document, 'activeElement', { value: null, configurable: true });
    view.refresh();
    assert.equal(rows()[0].querySelector('.preset-row-name').value, '外面改了');
});

test('Enter or Space on the focused row selects it; keys inside the name input or the menu button do not', () => {
    const { view, rows, fire, calls } = setup();
    view.render();
    assert.equal(rows()[0].getAttribute('tabindex'), '0');
    assert.equal(fire(rows()[1], 'keydown', { key: 'Enter' }).defaultPrevented, true);
    fire(rows()[2], 'keydown', { key: ' ' });
    assert.deepEqual(calls.select, [['b', '乙'], ['c', '丙']]);
    fire(rows()[0].querySelector('.preset-row-name'), 'keydown', { key: ' ' });
    fire(rows()[0].querySelector('[data-preset-action="menu"]'), 'keydown', { key: 'Enter' });
    fire(rows()[0], 'keydown', { key: 'a' });
    assert.equal(calls.select.length, 2);
});
