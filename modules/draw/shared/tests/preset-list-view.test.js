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
    const calls = { select: [], action: [], reorder: [], close: [], toggle: [], sortable: [] };
    const view = createPresetListView({
        document,
        getList: () => list,
        getPresets: () => data.presets,
        getCurrentId: () => data.current,
        escapeHtml,
        noun: '测试预设',
        onSelect: (id, preset) => calls.select.push([id, preset.name]),
        onAction: (action, id, preset) => calls.action.push([action, id, preset.name]),
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
    return { document, list, data, calls, view, click, rows };
}

test('render draws one row per preset with handle, name button and a hidden menu, marking the current one', () => {
    const { view, rows } = setup({ current: 'b' });
    view.render();
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a', 'b', 'c']);
    assert.deepEqual(rows().map(row => row.classList.contains('selected')), [false, true, false]);
    assert.deepEqual(rows().map(row => row.querySelector('.preset-row-name').getAttribute('aria-current')), [null, 'true', null]);
    const first = rows()[0];
    assert.equal(first.getAttribute('role'), 'listitem');
    assert.equal(first.querySelector('[data-preset-drag]').dataset.presetDrag, 'a');
    assert.match(first.querySelector('[data-preset-drag]').getAttribute('aria-label'), /^拖动调整测试预设 甲 的顺序$/);
    assert.equal(first.querySelector('.char-menu').hasAttribute('hidden'), true);
    assert.equal(first.querySelector('[data-card-menu]') !== null, true);
    const items = Array.from(first.querySelectorAll('[role="menuitem"]'));
    assert.deepEqual(items.map(item => item.dataset.presetAction), ['rename', 'duplicate', 'export', 'delete']);
    assert.deepEqual(items.map(item => item.dataset.presetId), ['a', 'a', 'a', 'a']);
    assert.deepEqual(items.map(item => item.classList.contains('danger')), [false, false, false, true]);
});

test('names and ids are escaped, a nameless preset shows its id, and an empty list shows the empty note', () => {
    const { view, rows, list } = setup({ presets: [{ id: 'x"y', name: '<b>粗</b>' }, { id: 'n2' }], current: 'n2' });
    view.render();
    assert.equal(list.querySelectorAll('b').length, 0);
    assert.equal(rows()[0].querySelector('.preset-row-name').textContent, '<b>粗</b>');
    assert.equal(rows()[0].dataset.presetId, 'x"y');
    assert.equal(rows()[1].querySelector('.preset-row-name').textContent, 'n2');

    const empty = setup({ presets: [] });
    empty.view.render();
    assert.equal(empty.list.querySelector('.preset-list-empty').textContent, '暂无测试预设');
    assert.equal(empty.rows().length, 0);
});

test('clicking a name selects, the menu button toggles, and a menu item closes the menu first then runs the action', () => {
    const { view, rows, click, calls } = setup();
    view.render();
    calls.close.length = 0;
    click(rows()[1].querySelector('[data-preset-action="select"]'));
    assert.deepEqual(calls.select, [['b', '乙']]);
    click(rows()[2].querySelector('[data-preset-action="menu"]'));
    assert.deepEqual(calls.toggle, ['c']);
    assert.equal(calls.select.length, 1);
    assert.deepEqual(calls.close, [], '点“…”本身不走关闭');

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
    click(rows()[1].querySelector('[data-preset-action="select"]'));
    click(rows()[1].querySelector('[data-preset-action="rename"]'));
    assert.deepEqual(calls.select, []);
    assert.deepEqual(calls.action, []);
});

test('rendering twice keeps a single click listener, and a redraw closes any open menu without asking to restore focus', () => {
    const { view, rows, click, calls } = setup();
    view.render();
    view.render();
    assert.deepEqual(calls.close, [undefined, undefined]);
    click(rows()[0].querySelector('[data-preset-action="select"]'));
    assert.equal(calls.select.length, 1);
});

test('syncSelection moves the highlight and aria-current without replacing the row nodes', () => {
    const { view, rows, data } = setup({ current: 'a' });
    view.render();
    const before = rows();
    data.current = 'c';
    view.syncSelection();
    assert.deepEqual(rows().map(row => row.classList.contains('selected')), [false, false, true]);
    assert.deepEqual(rows().map(row => row.querySelector('.preset-row-name').hasAttribute('aria-current')), [false, false, true]);
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
    none.click(none.rows()[0].querySelector('[data-preset-action="select"]'));
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
    click(rows()[0].querySelector('[data-preset-action="rename"]'));
});

test('custom menu items replace the default four', () => {
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
    click(rows()[0].querySelector('[data-preset-action="select"]'));
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
    assert.match(toggle.getAttribute('aria-label'), /^展开测试预设列表$/);
    click(rows()[0].querySelector('[data-preset-action="menu"]'));
    assert.deepEqual(calls.toggle, ['b']);
    click(rows()[0].querySelector('[data-preset-action="select"]'));
    assert.deepEqual(calls.select, [['b', '乙']]);
    click(toggle);
    assert.deepEqual(rows().map(row => row.dataset.presetId), ['a', 'b', 'c']);
    assert.equal(list.querySelectorAll('[data-preset-drag]').length, 3);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
    assert.match(toggle.getAttribute('aria-label'), /^折叠测试预设列表$/);
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