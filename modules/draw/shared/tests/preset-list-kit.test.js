import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createPresetListKit } from '../preset-list-kit.js';

// The kit wires the shared list view to the real sortable controller, ordering step, menu and escaping, so a page only
// supplies data and handlers; a page that already owns a menu controller can share it.
function mount(kitOptions) {
    const { document, window } = parseHTML('<html><body><div id="list"></div></body></html>');
    const data = { presets: [{ id: 'a', name: '甲' }, { id: 'b', name: '<乙>' }, { id: 'c', name: '丙' }] };
    const reorders = [];
    const kit = createPresetListKit(kitOptions);
    const view = kit.createPresetListView({
        document,
        getList: () => document.getElementById('list'),
        getPresets: () => data.presets,
        getCurrentId: () => 'a',
        noun: '测试预设',
        onSelect() {},
        onAction() {},
        onReorder: ids => reorders.push(ids),
    });
    view.render();
    return { document, window, kit, view, reorders, data };
}

test('rows are escaped by default and keyboard Up / Down on a handle reports the full new order', t => {
    const { document, window, kit, reorders } = mount();
    t.after(() => kit.destroy());
    assert.equal(document.querySelectorAll('.preset-row').length, 3);
    assert.equal(document.querySelectorAll('.preset-row-name')[1].value, '<乙>');
    const press = (id, key) => {
        const event = new window.Event('keydown', { bubbles: true, cancelable: true });
        event.key = key;
        document.querySelector(`.preset-row[data-preset-id="${id}"] [data-preset-drag]`).dispatchEvent(event);
    };
    press('a', 'ArrowDown');
    press('c', 'ArrowUp');
    press('a', 'ArrowUp'); // 已在最前
    assert.deepEqual(reorders, [['b', 'a', 'c'], ['a', 'c', 'b']]);
});

test('a page-owned menu controller is shared: toggling uses it, and a redraw closes it without creating one', () => {
    const calls = [];
    const shared = { toggle: button => calls.push(['toggle', button.dataset.presetId]), close: options => calls.push(['close', options]) };
    let created = 0;
    const { document, window, view } = mount({ shareMenu: { get: () => { created += 1; return shared; }, peek: () => (created ? shared : null) } });
    view.render();
    assert.equal(created, 0, '没打开过菜单就不创建控制器');
    assert.deepEqual(calls, []);
    document.querySelector('[data-preset-action="menu"][data-preset-id="b"]').dispatchEvent(new window.Event('click', { bubbles: true }));
    assert.equal(created, 1);
    assert.deepEqual(calls, [['toggle', 'b']]);
    view.render();
    assert.deepEqual(calls.at(-1), ['close', undefined]);
});
