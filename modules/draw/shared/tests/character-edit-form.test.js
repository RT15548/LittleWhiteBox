import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    EDITOR_SECTION_KEYS,
    appendNamedTagEditorItem,
    collectNamedTagEditorValues,
    createEditorSectionState,
    createNamedTagSortables,
    duplicateNamedTagEditorItem,
    isNamedTagHeaderToggleTarget,
    refreshNamedTagItemHeader,
    removeNamedTagEditorItem,
    renderEditorSection,
    renderNamedTagEditorItems,
    reorderNamedTagEditorRows,
    setEditorSectionCollapsed,
    syncNamedTagEditorList,
    toggleNamedTagItem,
    toggleNamedTagItemEnabled,
} from '../character-edit-form.js';

// Acceptance contracts (cost: lost unsaved edits, a disabled item silently saved as enabled, or a reorder that does not persist):
// - Lists with 2+ items open folded, 0-1 open expanded; a newly added item is always expanded.
// - Fold state and section collapse are UI-only: they survive a redraw (draft capture) but never reach collected data
//   unless explicitly asked for, and folded items are still collected.
// - Reordering moves the real rows (text, fold and switch state travel with them) and the collected order follows.

const OUTFITS = [
    { name: '白裙', tags: 'white dress' },
    { name: '睡衣', tags: 'pajamas', enabled: false },
    { name: '制服', tags: 'school uniform, ribbon' },
];

// eslint-disable-next-line no-unsanitized/method -- 测试夹具：只写入本模块渲染出来的标记，没有外部输入。
const insertHtml = (target, html, position = 'beforeend') => target.insertAdjacentHTML(position, html);

function mount(items, kind = 'outfit') {
    const { document, window } = parseHTML('<html><body><div id="card"></div></body></html>');
    const card = document.querySelector('#card');
    return { document, window, card, ...redraw(card, items, kind) };
}

// 与页面一致的整体重绘：用条目数据（可带草稿里的 expanded）重新渲染整个分区。
function redraw(card, items, kind = 'outfit', { collapsed = false } = {}) {
    const p = kind === 'outfit' ? 'char-outfit' : 'char-dynstate';
    // eslint-disable-next-line no-unsanitized/property -- 测试夹具：只写入本模块渲染出来的标记，没有外部输入。
    card.innerHTML = renderEditorSection({
        key: kind === 'outfit' ? 'outfits' : 'dynamicStates',
        title: '列表',
        collapsed,
        actionsHtml: '<button type="button" data-action="add">添加</button>',
        bodyHtml: `<div class="${p}-editor-list"><div class="${p}-editor-empty">空</div>${renderNamedTagEditorItems(items, kind)}</div>`,
    });
    const list = card.querySelector(`.${p}-editor-list`);
    syncNamedTagEditorList(list, kind);
    return { list };
}

const rows = (card, kind = 'outfit') => Array.from(card.querySelectorAll(kind === 'outfit' ? '.char-outfit-editor-item' : '.char-dynstate-editor-item'));
const expandedFlags = (card, kind) => rows(card, kind).map(row => row.dataset.expanded === 'true');
const bodyHidden = row => row.querySelector('.named-tag-body').hasAttribute('hidden');
const names = (card, kind = 'outfit') => collectNamedTagEditorValues(card, kind).map(item => item.name);

test('0 items: only the empty hint; 1 item: expanded like before', () => {
    const none = mount([]);
    assert.equal(rows(none.card).length, 0);
    assert.equal(none.card.querySelector('.char-outfit-editor-empty').style.display, 'block');

    const one = mount([OUTFITS[0]]);
    assert.deepEqual(expandedFlags(one.card), [true]);
    assert.equal(bodyHidden(rows(one.card)[0]), false);
    assert.equal(one.card.querySelector('.char-outfit-editor-empty').style.display, 'none');
});

test('2+ items render folded: one-line header (handle, chevron, name input, tags preview, one … menu), body hidden', () => {
    const { card } = mount(OUTFITS);
    assert.deepEqual(expandedFlags(card), [false, false, false]);
    for (const row of rows(card)) {
        assert.equal(bodyHidden(row), true);
        assert.ok(row.classList.contains('is-folded'));
        assert.equal(row.querySelector('.named-tag-toggle').getAttribute('aria-expanded'), 'false');
        assert.ok(row.querySelector('.named-tag-header [data-named-drag]'));
        assert.ok(row.querySelector('.named-tag-header input.char-outfit-name'));
        // 头部：启用开关（角色卡同款打勾方块图标按钮）直接摆出来，删除回到“…”菜单里（复制 + 危险样式的删除）。
        const header = row.querySelector('.named-tag-header');
        assert.equal(header.querySelector('.named-tag-switch'), null);
        assert.equal(header.querySelector('.btn-danger'), null);
        assert.ok(header.querySelector(':scope > .editor-item-enabled-toggle.char-enabled-control.char-action-button svg'));
        assert.equal(header.querySelector(':scope > .editor-item-delete'), null, 'no trash icon button in the header any more');
        assert.equal(header.querySelectorAll('.char-menu-button').length, 1);
        assert.deepEqual(Array.from(header.querySelectorAll('[role="menuitem"]')).map(item => item.dataset.action), ['duplicate-named-item', 'remove-outfit']);
        const del = header.querySelector('.char-menu .editor-item-delete');
        assert.ok(del.classList.contains('danger') && del.classList.contains('char-menu-item'), 'delete is a danger-styled menu item');
        assert.equal(del.querySelector('.char-menu-label').textContent, '删除');
        assert.deepEqual(
            Array.from(header.children).map(node => node.className.split(' ')[0]).slice(-3),
            ['editor-item-state', 'char-action-button', 'char-menu-wrap'],
            '已停用标签、启用开关、菜单，依次排在名称之后',
        );
    }
    const first = rows(card)[0];
    assert.equal(first.querySelector('.char-outfit-name').getAttribute('value'), '白裙');
    assert.equal(first.querySelector('.named-tag-preview').textContent, 'white dress');
});

test('the name lives only in the header input (no second name field in the body); placeholder is the field label', () => {
    for (const [kind, p, label] of [['outfit', 'char-outfit', '服装名称'], ['dynstate', 'char-dynstate', '动态标签名称']]) {
        const { card } = mount([{ name: 'a', tags: 'x' }, { name: '', tags: 'y' }], kind);
        for (const row of rows(card, kind)) {
            assert.equal(row.querySelectorAll(`.${p}-name`).length, 1);
            assert.ok(row.querySelector(`.named-tag-header .${p}-name`));
            assert.equal(row.querySelector('.named-tag-body').querySelector(`.${p}-name`), null);
            assert.equal(row.querySelector(`.${p}-name`).getAttribute('placeholder'), label);
            assert.equal(row.querySelector('.named-tag-title'), null);
        }
        // 空名称不再回退成“服装 N”：输入框为空，占位符提示
        assert.equal(collectNamedTagEditorValues(card, kind)[1].name, '');
    }
});

test('header click toggles fold except on the name input, the … menu and the drag handle', () => {
    const { card } = mount(OUTFITS);
    const row = rows(card)[0];
    assert.equal(row.querySelector('.named-tag-header').dataset.action, 'toggle-named-item');
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('.named-tag-toggle')), true);
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('.named-tag-preview')), true);
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('.named-tag-header')), true);
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('.char-outfit-name')), false);
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('.char-menu-button')), false);
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('.char-menu')), false);
    assert.equal(isNamedTagHeaderToggleTarget(row.querySelector('[data-named-drag]')), false);
    assert.equal(isNamedTagHeaderToggleTarget(null), true);
});

test('clicking the header toggles one item and leaves the others', () => {
    const { card } = mount(OUTFITS);
    const [a, b] = rows(card);
    assert.equal(toggleNamedTagItem(a, 'outfit'), true);
    assert.deepEqual(expandedFlags(card), [true, false, false]);
    assert.equal(bodyHidden(a), false);
    assert.equal(a.querySelector('.named-tag-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(toggleNamedTagItem(a, 'outfit'), false);
    assert.equal(bodyHidden(a), true);
    assert.equal(bodyHidden(b), true);
});

test('a newly added item is always expanded, even when the other items are folded', () => {
    const { card, list } = mount(OUTFITS);
    const added = appendNamedTagEditorItem(list, 'outfit', { insertHtml });
    assert.deepEqual(expandedFlags(card), [false, false, false, true]);
    assert.equal(bodyHidden(added), false);
    assert.equal(added.dataset.index, '3');

    // 0 -> 1 条与 1 -> 2 条：原来的条目保持原状（不会在用户眼皮底下被折叠），新条目展开
    const empty = mount([]);
    appendNamedTagEditorItem(empty.list, 'outfit', { insertHtml });
    assert.deepEqual(expandedFlags(empty.card), [true]);
    appendNamedTagEditorItem(empty.list, 'outfit', { insertHtml });
    assert.deepEqual(expandedFlags(empty.card), [true, true]);
});

test('folded items are still collected; disabled ones carry enabled:false; UI state only on request', () => {
    const { card } = mount(OUTFITS);
    assert.deepEqual(collectNamedTagEditorValues(card, 'outfit'), [
        { name: '白裙', tags: 'white dress' },
        { name: '睡衣', tags: 'pajamas', enabled: false },
        { name: '制服', tags: 'school uniform, ribbon' },
    ]);
    assert.deepEqual(collectNamedTagEditorValues(card, 'outfit', { withUiState: true }).map(item => item.expanded), [false, false, false]);
    assert.ok(collectNamedTagEditorValues(card, 'outfit').every(item => !('expanded' in item)));
});

test('editing a folded item\'s hidden inputs is what gets collected (save does not depend on fold state)', () => {
    const { card } = mount(OUTFITS);
    rows(card)[2].querySelector('.char-outfit-tags').value = '  edited tags  ';
    assert.equal(collectNamedTagEditorValues(card, 'outfit')[2].tags, 'edited tags');
});

test('keepEmpty keeps a freshly added blank row; save-style collection drops it', () => {
    const { card, list } = mount([OUTFITS[0], OUTFITS[2]]);
    appendNamedTagEditorItem(list, 'outfit', { insertHtml });
    assert.equal(collectNamedTagEditorValues(card, 'outfit', { keepEmpty: true }).length, 3);
    assert.equal(collectNamedTagEditorValues(card, 'outfit').length, 2);
});

test('draft capture -> redraw restores fold state, switches and unsaved text', () => {
    const first = mount(OUTFITS);
    const [a, b] = rows(first.card);
    toggleNamedTagItem(b, 'outfit'); // 用户展开了第 2 条
    a.querySelector('.char-outfit-name').value = '白裙（改）';
    toggleNamedTagItemEnabled(a); // 停用第 1 条（菜单里的“停用”）
    appendNamedTagEditorItem(first.list, 'outfit', { insertHtml });

    const draft = collectNamedTagEditorValues(first.card, 'outfit', { keepEmpty: true, withUiState: true });
    assert.deepEqual(draft.map(item => item.expanded), [false, true, false, true]);

    const second = mount(draft);
    assert.deepEqual(expandedFlags(second.card), [false, true, false, true]);
    assert.deepEqual(rows(second.card).map(bodyHidden), [true, false, true, false]);
    assert.deepEqual(collectNamedTagEditorValues(second.card, 'outfit', { keepEmpty: true }), [
        { name: '白裙（改）', tags: 'white dress', enabled: false },
        { name: '睡衣', tags: 'pajamas', enabled: false },
        { name: '制服', tags: 'school uniform, ribbon' },
        { name: '', tags: '' },
    ]);
});

test('a one-item draft is forced expanded even if it was folded when captured', () => {
    const { card } = mount([{ name: '白裙', tags: 'white dress', expanded: false }]);
    assert.deepEqual(expandedFlags(card), [true]);
});

test('removing down to one item expands the survivor; indexes and the hint are re-synced', () => {
    const { card, list } = mount(OUTFITS);
    removeNamedTagEditorItem(rows(card)[0], 'outfit');
    removeNamedTagEditorItem(rows(card)[0], 'outfit');
    assert.deepEqual(expandedFlags(card), [true]);
    assert.equal(bodyHidden(rows(card)[0]), false);
    assert.equal(rows(card)[0].dataset.index, '0');
    assert.equal(rows(card)[0].querySelector('[data-action="remove-outfit"]').dataset.index, '0');
    removeNamedTagEditorItem(rows(card)[0], 'outfit');
    assert.equal(list.querySelector('.char-outfit-editor-empty').style.display, 'block');
});

test('header preview follows the tags input (the name input is the title itself)', () => {
    const { card } = mount(OUTFITS);
    const row = rows(card)[2];
    row.querySelector('.char-outfit-tags').value = 'x'.repeat(100);
    refreshNamedTagItemHeader(row, 'outfit');
    assert.ok(row.querySelector('.named-tag-preview').textContent.endsWith('…'));
    assert.ok(row.querySelector('.named-tag-preview').textContent.length < 60);
});

test('the header enable button (ticked-square icon, like the character cards) flips the row state, its icon, pressed state, title, the 已停用 tag and the enabled/total badge', () => {
    const { card } = mount(OUTFITS);
    const count = () => card.querySelector('.char-section-count').textContent;
    const toggleOf = row => row.querySelector('.editor-item-enabled-toggle');
    const iconShapes = row => Array.from(toggleOf(row).querySelectorAll('svg > *')).map(node => node.tagName.toLowerCase());
    assert.equal(count(), '2/3');
    const [a, b] = rows(card);
    for (const row of [a, b]) {
        assert.equal(row.querySelectorAll('.editor-item-state').length, 1);
        assert.equal(row.querySelector('.named-tag-header .editor-item-state').textContent, '已停用');
        assert.equal(row.querySelector('.named-tag-body').querySelector('input[type="checkbox"]'), null);
    }
    assert.ok(b.classList.contains('is-disabled'));
    assert.deepEqual([toggleOf(a).getAttribute('title'), toggleOf(a).getAttribute('aria-pressed'), toggleOf(a).classList.contains('active')], ['停用', 'true', true]);
    assert.deepEqual([toggleOf(b).getAttribute('title'), toggleOf(b).getAttribute('aria-pressed'), toggleOf(b).classList.contains('active')], ['启用', 'false', false]);
    assert.deepEqual(iconShapes(a), ['rect', 'path'], 'enabled = ticked square');
    assert.deepEqual(iconShapes(b), ['rect'], 'disabled = empty square');

    assert.equal(toggleNamedTagItemEnabled(b), true);
    assert.ok(!b.classList.contains('is-disabled'));
    assert.equal(b.dataset.enabled, 'true');
    assert.deepEqual([toggleOf(b).getAttribute('title'), toggleOf(b).getAttribute('aria-pressed'), toggleOf(b).classList.contains('active')], ['停用', 'true', true]);
    assert.deepEqual(iconShapes(b), ['rect', 'path']);
    assert.equal(count(), '3');

    assert.equal(toggleNamedTagItemEnabled(a), false);
    assert.ok(a.classList.contains('is-disabled'));
    assert.deepEqual([toggleOf(a).getAttribute('title'), toggleOf(a).getAttribute('aria-pressed')], ['启用', 'false']);
    assert.match(toggleOf(a).getAttribute('aria-label'), /^启用 服装 1$/);
    assert.deepEqual(iconShapes(a), ['rect']);
    assert.deepEqual(collectNamedTagEditorValues(card, 'outfit').map(item => item.enabled === false), [true, false, false]);
});

test('the delete menu item keeps its index and the header buttons keep their numbering after a removal', () => {
    const { card } = mount(OUTFITS);
    const del = row => row.querySelector('.editor-item-delete');
    assert.equal(del(rows(card)[1]).dataset.action, 'remove-outfit');
    assert.equal(del(rows(card)[1]).dataset.index, '1');
    assert.equal(del(rows(card)[1]).getAttribute('aria-label'), '删除 服装 2');
    assert.equal(del(rows(card)[1]).querySelector('i').getAttribute('class'), 'fa-solid fa-trash');
    removeNamedTagEditorItem(rows(card)[0], 'outfit');
    assert.equal(del(rows(card)[0]).getAttribute('aria-label'), '删除 服装 1');
    assert.equal(rows(card)[0].querySelector('.editor-item-enabled-toggle').getAttribute('aria-label'), '启用 服装 1');
    assert.equal(rows(card)[0].querySelector('.char-menu-button').getAttribute('aria-label'), '更多操作 服装 1');
});

test('复制 inserts a copy right below the item: name + 副本, the tags as currently typed, expanded and enabled whatever the source state', () => {
    const { card, list } = mount(OUTFITS);
    const [a] = rows(card);
    a.querySelector('.char-outfit-tags').value = 'white dress, typed after open';
    const copy = duplicateNamedTagEditorItem(a, 'outfit', { insertHtml });
    assert.equal(a.nextElementSibling, copy);
    const nameOf = row => row.querySelector('.char-outfit-name').getAttribute('value');
    assert.deepEqual(rows(card).map(nameOf), ['白裙', '白裙 副本', '睡衣', '制服']);
    assert.equal(copy.dataset.expanded, 'true');
    assert.equal(copy.dataset.enabled, 'true');
    assert.ok(!copy.classList.contains('is-disabled'));
    assert.equal(copy.querySelector('.char-outfit-tags').textContent, 'white dress, typed after open');
    assert.equal(rows(card)[0].dataset.expanded, 'false', 'the source keeps its own fold state');
    assert.deepEqual(rows(card).map(row => row.dataset.index), ['0', '1', '2', '3']);
    assert.equal(card.querySelector('.char-section-count').textContent, '3/4');

    // 停用的源条目：副本仍是启用的；空名称的副本就叫“副本”
    const fromDisabled = duplicateNamedTagEditorItem(rows(card)[2], 'outfit', { insertHtml });
    assert.equal(fromDisabled.dataset.enabled, 'true');
    assert.equal(nameOf(fromDisabled), '睡衣 副本');
    const blank = mount([{ name: '', tags: 'x' }]);
    assert.equal(nameOf(duplicateNamedTagEditorItem(rows(blank.card)[0], 'outfit', { insertHtml })), '副本');
    assert.equal(duplicateNamedTagEditorItem(null, 'outfit', { insertHtml }), null);
    assert.equal(list.querySelectorAll('.named-tag-item').length, 5);
});

test('dynamic states use the same editor with their own classes', () => {
    const { card } = mount([{ name: '害羞', tags: 'blush' }, { name: '哭', tags: 'tears', enabled: false }], 'dynstate');
    assert.deepEqual(expandedFlags(card, 'dynstate'), [false, false]);
    assert.ok(card.querySelector('[data-action="remove-dynstate"]'));
    assert.deepEqual(collectNamedTagEditorValues(card, 'dynstate'), [
        { name: '害羞', tags: 'blush' },
        { name: '哭', tags: 'tears', enabled: false },
    ]);
});

test('item markup escapes user text', () => {
    const { card } = mount([{ name: '"><img src=x>', tags: '<b>&' }, { name: 'b', tags: 'c' }]);
    assert.equal(card.querySelector('img'), null);
    assert.equal(collectNamedTagEditorValues(card, 'outfit')[0].name, '"><img src=x>');
    // 没有生成 <b> 元素，文本以转义形式留在 textarea 里（linkedom 的 textarea.value 不解码实体，所以不比较 value）
    assert.equal(card.querySelector('textarea b'), null);
    assert.ok(rows(card)[0].querySelector('.char-outfit-tags').innerHTML.includes('&lt;b&gt;'));
});

// ── 拖拽 / 键盘排序 ──

test('reordering rows moves the real nodes: text, fold and switch state travel; collected order follows', () => {
    const { card, list } = mount(OUTFITS);
    const [a, b, c] = rows(card);
    toggleNamedTagItem(c, 'outfit'); // 制服 展开
    c.querySelector('.char-outfit-name').value = '制服（改）';
    reorderNamedTagEditorRows(list, 'outfit', [c.dataset.uid, a.dataset.uid, b.dataset.uid]);
    assert.deepEqual(rows(card), [c, a, b]);
    assert.deepEqual(rows(card).map(row => row.dataset.index), ['0', '1', '2']);
    assert.deepEqual(names(card), ['制服（改）', '白裙', '睡衣']);
    assert.deepEqual(expandedFlags(card), [true, false, false]);
    assert.equal(rows(card)[2].dataset.enabled, 'false');
    assert.equal(list.querySelector('.char-outfit-editor-empty').nextElementSibling, c); // 提示行仍在最前
    assert.equal(rows(card)[0].querySelector('[data-action="remove-outfit"]').dataset.index, '0');
    assert.ok(rows(card)[0].querySelector('[data-named-drag]').getAttribute('aria-label').includes('1'));

    // 未列出的 uid 与未知 uid：未列出的行相对顺序排在最后，未知的忽略
    reorderNamedTagEditorRows(list, 'outfit', ['nope', b.dataset.uid]);
    assert.deepEqual(rows(card), [b, c, a]);
});

test('the new order survives a draft capture and redraw', () => {
    const first = mount(OUTFITS);
    const [a, b, c] = rows(first.card);
    reorderNamedTagEditorRows(first.list, 'outfit', [b.dataset.uid, c.dataset.uid, a.dataset.uid]);
    toggleNamedTagItem(rows(first.card)[1], 'outfit'); // 重排后第 2 行（制服）展开
    const draft = collectNamedTagEditorValues(first.card, 'outfit', { keepEmpty: true, withUiState: true });
    assert.deepEqual(draft.map(item => item.name), ['睡衣', '制服', '白裙']);

    const second = mount(draft);
    assert.deepEqual(names(second.card), ['睡衣', '制服', '白裙']);
    assert.deepEqual(expandedFlags(second.card), [false, true, false]);
    assert.equal(rows(second.card)[0].dataset.enabled, 'false'); // 睡衣仍是停用
    // 保存按 DOM 顺序读：不带 UI 状态，数组顺序即新顺序
    assert.deepEqual(collectNamedTagEditorValues(second.card, 'outfit').map(item => item.name), ['睡衣', '制服', '白裙']);
});

test('keyboard Up / Down on a folded row\'s handle reorders through the shared sortable controller', () => {
    const { document, window, card, list } = mount(OUTFITS);
    const sortables = createNamedTagSortables({ container: card, document });
    const press = (row, key) => {
        const handle = row.querySelector('[data-named-drag]');
        const event = new window.Event('keydown', { bubbles: true, cancelable: true });
        event.key = key;
        handle.dispatchEvent(event);
        return event;
    };
    assert.equal(press(rows(card)[1], 'ArrowUp').defaultPrevented, true);
    assert.deepEqual(names(card), ['睡衣', '白裙', '制服']);
    assert.deepEqual(rows(card).map(row => row.dataset.index), ['0', '1', '2']);
    // 折叠状态不因排序改变
    assert.deepEqual(expandedFlags(card), [false, false, false]);
    // 跟着同一行继续往下：行 uid 稳定
    press(rows(card)[0], 'ArrowDown');
    press(rows(card)[1], 'ArrowDown');
    assert.deepEqual(names(card), ['白裙', '制服', '睡衣']);
    // 边界处不动
    press(rows(card)[2], 'ArrowDown');
    assert.deepEqual(names(card), ['白裙', '制服', '睡衣']);
    assert.ok(list.querySelector('.char-outfit-editor-empty'));
    sortables.forEach(sortable => sortable.destroy());
});

test('outfit and state lists reorder independently', () => {
    const { document, window, card } = mount(OUTFITS);
    // eslint-disable-next-line no-unsanitized/method -- 测试夹具：只写入本模块渲染出来的标记，没有外部输入。
    card.insertAdjacentHTML('beforeend', `<div class="char-dynstate-editor-list">${renderNamedTagEditorItems([{ name: 'S1', tags: 'a' }, { name: 'S2', tags: 'b' }], 'dynstate')}</div>`);
    const sortables = createNamedTagSortables({ container: card, document });
    const handle = card.querySelectorAll('.char-dynstate-editor-item')[1].querySelector('[data-named-drag]');
    const event = new window.Event('keydown', { bubbles: true, cancelable: true });
    event.key = 'ArrowUp';
    handle.dispatchEvent(event);
    assert.deepEqual(names(card, 'dynstate'), ['S2', 'S1']);
    assert.deepEqual(names(card), ['白裙', '睡衣', '制服']);
    sortables.forEach(sortable => sortable.destroy());
});

// ── 分区折叠 ──

test('sections default to expanded; collapse is remembered per card and survives a redraw', () => {
    const state = createEditorSectionState();
    for (const key of EDITOR_SECTION_KEYS) assert.equal(state.isCollapsed('c1', key), false);

    const { card } = mount(OUTFITS);
    const render = () => redraw(card, OUTFITS, 'outfit', { collapsed: state.isCollapsed('c1', 'outfits') });
    const section = () => card.querySelector('.char-edit-section');
    const toggleButton = () => card.querySelector('.char-section-toggle');

    // 点击标题行：记录 + 只改 DOM
    const collapsed = state.toggle('c1', 'outfits');
    setEditorSectionCollapsed(section(), collapsed);
    assert.equal(collapsed, true);
    assert.ok(section().classList.contains('is-collapsed'));
    assert.equal(card.querySelector('.char-section-body').hasAttribute('hidden'), true);
    assert.equal(toggleButton().getAttribute('aria-expanded'), 'false');

    // 整体重绘（草稿恢复 / INIT_DATA）：折叠状态来自会话记录
    render();
    assert.ok(section().classList.contains('is-collapsed'));
    assert.equal(card.querySelector('.char-section-body').hasAttribute('hidden'), true);
    // 折叠着的分区里的条目照样会被读取（保存不丢数据）
    assert.equal(collectNamedTagEditorValues(card, 'outfit').length, 3);

    // 其他卡片不受影响；再点一次展开
    assert.equal(state.isCollapsed('c2', 'outfits'), false);
    assert.equal(state.isCollapsed('c1', 'dynamicStates'), false);
    setEditorSectionCollapsed(section(), state.toggle('c1', 'outfits'));
    render();
    assert.ok(!section().classList.contains('is-collapsed'));
    assert.equal(card.querySelector('.char-section-body').hasAttribute('hidden'), false);
});

test('section state keeps only collapsed keys, ignores unknown keys and prunes removed cards', () => {
    const state = createEditorSectionState();
    state.setCollapsed('c1', 'appearance', true);
    state.setCollapsed('c1', 'bogus', true);
    state.setCollapsed('c2', 'negative', true); // 负向已并入固定外貌分区：不再是独立分区，记录被忽略
    assert.equal(state.isCollapsed('c1', 'bogus'), false);
    state.setCollapsed('c1', 'appearance', false);
    assert.equal(state.isCollapsed('c1', 'appearance'), false);
    state.prune(['c1']);
    assert.equal(state.isCollapsed('c2', 'negative'), false);
    assert.equal(state.isCollapsed('c2', 'appearance'), false);
    state.setCollapsed('c3', 'outfits', true);
    state.prune(['c3']);
    assert.equal(state.isCollapsed('c3', 'outfits'), true);
});

test('all three sections render a chevron toggle on the label row, with the action beside it', () => {
    const html = EDITOR_SECTION_KEYS.map(key => renderEditorSection({
        key, title: key, actionsHtml: key === 'outfits' ? '<button data-action="add-outfit">+</button>' : '', bodyHtml: `<i class="b-${key}"></i>`,
    })).join('');
    const { document } = parseHTML(`<html><body>${html}</body></html>`);
    assert.equal(document.querySelectorAll('.char-section-head > .char-section-toggle .char-section-chevron').length, 3);
    assert.ok(document.querySelector('.char-section-head > .char-section-actions > [data-action="add-outfit"]'));
    // 操作按钮不在折叠按钮里面：点“添加”不会误触折叠
    assert.equal(document.querySelector('.char-section-toggle [data-action="add-outfit"]'), null);
    assert.equal(document.querySelectorAll('.char-section-body[hidden]').length, 0);
});
