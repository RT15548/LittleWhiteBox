import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    appendNamedTagEditorItem,
    collectNamedTagEditorValues,
    createNamedTagSortables,
    duplicateNamedTagEditorItem,
    removeNamedTagEditorItem,
    renderEditorSection,
    renderNamedTagEditorItems,
    reorderNamedTagEditorRows,
    syncNamedTagEditorList,
    toggleNamedTagItem,
    toggleNamedTagItemEnabled,
} from '../character-edit-form.js';

// Acceptance contracts (cost: lost unsaved edits, a disabled item silently saved as enabled, or a reorder that does not persist):
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
