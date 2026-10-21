// 列表拖拽排序控制器：纯函数（落点计算、指示线位置、移动 id）直接测；控制器跑在 linkedom 的真实 DOM 上，
// 用手写的矩形代替布局（linkedom 没有布局），指针事件按页面里 dragCharacter 的做法发成带字段的普通 Event。
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

import {
    computeGroupInsertIndex,
    computeInsertIndex,
    createSortableList,
    dropMarkFor,
    dropMarkForGroup,
    moveGroupToIndex,
    moveIdToIndex,
} from '../sortable-list.js';
import { movePresetId } from '../preset-order.js';

// ── 纯函数 ──────────────────────────────────────────────

const rects = [{ top: 0, bottom: 100 }, { top: 100, bottom: 200 }, { top: 200, bottom: 300 }];

test('computeInsertIndex counts how many other rows the pointer has passed the midline of', () => {
    assert.equal(computeInsertIndex(50, rects, 0), 0, 'on its own row: stays');
    assert.equal(computeInsertIndex(120, rects, 0), 0, 'not past the next row midline (150)');
    assert.equal(computeInsertIndex(160, rects, 0), 1);
    assert.equal(computeInsertIndex(290, rects, 0), 2);
    assert.equal(computeInsertIndex(-50, rects, 2), 0);
    assert.equal(computeInsertIndex(120, rects, 2), 1);
    assert.equal(computeInsertIndex(260, rects, 2), 2, 'on its own row: stays');
    assert.equal(computeInsertIndex(150, rects, 1), 1, 'exactly on another midline counts as passed, but the own row never counts');
});

test('computeInsertIndex falls back to the current index on bad input', () => {
    assert.equal(computeInsertIndex(Number.NaN, rects, 1), 1);
    assert.equal(computeInsertIndex(50, rects, -1), -1);
    assert.equal(computeInsertIndex(50, rects, 5), 5);
    assert.equal(computeInsertIndex(50, null, 0), 0);
});

test('dropMarkFor draws the line before the row that will follow the dragged one, or after the last other row', () => {
    assert.deepEqual(dropMarkFor(3, 0, 0), { index: 1, side: 'before' });
    assert.deepEqual(dropMarkFor(3, 0, 1), { index: 2, side: 'before' });
    assert.deepEqual(dropMarkFor(3, 0, 2), { index: 2, side: 'after' });
    assert.deepEqual(dropMarkFor(3, 2, 0), { index: 0, side: 'before' });
    assert.deepEqual(dropMarkFor(3, 2, 2), { index: 1, side: 'after' });
    assert.equal(dropMarkFor(1, 0, 0), null);
    assert.equal(dropMarkFor(3, 3, 0), null);
    assert.equal(dropMarkFor(3, 0, 3), null);
});

test('moveIdToIndex puts the id at the given final position without touching its input', () => {
    const ids = ['a', 'b', 'c', 'd'];
    assert.deepEqual(moveIdToIndex(ids, 'a', 2), ['b', 'c', 'a', 'd']);
    assert.deepEqual(moveIdToIndex(ids, 'd', 0), ['d', 'a', 'b', 'c']);
    assert.deepEqual(moveIdToIndex(ids, 'b', 1), ids, 'same place');
    assert.deepEqual(moveIdToIndex(ids, 'zzz', 0), ids, 'unknown id');
    assert.deepEqual(moveIdToIndex(ids, 'a', 99), ['b', 'c', 'd', 'a'], 'clamped');
    assert.deepEqual(ids, ['a', 'b', 'c', 'd']);
});

// ── 控制器 ──────────────────────────────────────────────

function setup(t, { moveStep, autoScroll, keepKeyboard = true, getGroupIds, moveGroupStep, ids = ['a', 'b', 'c'] } = {}) {
    const { document } = parseHTML('<!doctype html><html><body><ul id="list"></ul></body></html>');
    const container = document.getElementById('list');
    let order = [...ids];
    const reorders = [];
    const metas = [];
    const focus = { id: null }; // linkedom 的 focus() 是空操作、没有 activeElement：记下最后一次被聚焦的手柄
    const render = () => {
        // eslint-disable-next-line no-unsanitized/property -- 测试里的固定标记，id 都是字面量
        container.innerHTML = order.map(id => `<li class="row" data-id="${id}"><span class="handle" tabindex="0" data-handle="${id}">⋮⋮</span><span class="name">${id}</span></li>`).join('');
        for (const handle of container.querySelectorAll('.handle')) handle.focus = () => { focus.id = handle.dataset.handle; };
        let top = 0;
        for (const row of container.querySelectorAll('.row')) {
            const rect = { top, bottom: top + 100, left: 0, right: 300, width: 300, height: 100 };
            row.getBoundingClientRect = () => rect;
            top += 100;
        }
    };
    render();
    const controller = createSortableList({
        container, document,
        rowSelector: '.row',
        handleSelector: '.handle',
        getId: row => row.dataset.id,
        onReorder: (next, meta) => { reorders.push(next); metas.push(meta); order = [...next]; render(); },
        getGroupIds,
        moveGroupStep,
        moveStep: keepKeyboard ? (moveStep || movePresetId) : null,
        autoScroll,
    });
    t.after(() => controller.destroy());
    const Event = document.defaultView.Event;
    const fire = (target, type, props = {}) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, { button: 0, pointerId: 1, clientX: 20, ...props });
        target.dispatchEvent(event);
        return event;
    };
    const handle = id => container.querySelector(`.handle[data-handle="${id}"]`);
    const row = id => container.querySelector(`.row[data-id="${id}"]`);
    const rowOrder = () => Array.from(container.querySelectorAll('.row')).map(item => item.dataset.id);
    return { document, container, controller, reorders, metas, focus, fire, handle, row, rowOrder, render };
}

test('dragging a handle shows the drop line, and releasing it sends the complete new id order once', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    assert.equal(s.row('a').classList.contains('dragging'), true);
    assert.equal(s.document.body.classList.contains('sortable-dragging'), true);
    assert.equal(s.controller.isDragging(), true);

    s.fire(s.document, 'pointermove', { clientY: 160 }); // 越过 b 的中线 150
    assert.equal(s.row('c').classList.contains('drop-before'), true, '线画在将排在 a 之后的 c 上方');
    assert.equal(s.row('b').classList.contains('drop-before'), false);
    s.fire(s.document, 'pointermove', { clientY: 290 }); // 越过全部
    assert.equal(s.row('c').classList.contains('drop-after'), true);
    assert.equal(s.row('c').classList.contains('drop-before'), false, '换了落点，旧标记清掉');
    assert.deepEqual(s.reorders, [], '拖动过程中不回调');
    assert.deepEqual(s.rowOrder(), ['a', 'b', 'c'], '拖动过程中不改 DOM');

    s.fire(s.document, 'pointerup', { clientY: 290 });
    assert.deepEqual(s.reorders, [['b', 'c', 'a']]);
    assert.deepEqual(s.rowOrder(), ['b', 'c', 'a']);
    assert.equal(s.container.querySelectorAll('.dragging, .drop-before, .drop-after').length, 0);
    assert.equal(s.document.body.classList.contains('sortable-dragging'), false);
    assert.equal(s.controller.isDragging(), false);
});

test('dragging upwards works too', (t) => {
    const s = setup(t);
    s.fire(s.handle('c'), 'pointerdown', { clientY: 250 });
    s.fire(s.document, 'pointermove', { clientY: 20 });
    assert.equal(s.row('a').classList.contains('drop-before'), true);
    s.fire(s.document, 'pointerup', { clientY: 20 });
    assert.deepEqual(s.reorders, [['c', 'a', 'b']]);
});

test('dropping where it started sends nothing, even after moving the pointer around', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.fire(s.document, 'pointermove', { clientY: 290 });
    s.fire(s.document, 'pointermove', { clientY: 60 }); // 回到自己身上
    s.fire(s.document, 'pointerup', { clientY: 60 });
    assert.deepEqual(s.reorders, []);
    assert.equal(s.container.querySelectorAll('.dragging, .drop-before, .drop-after').length, 0);
});

test('a press without real movement is not a drag', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.fire(s.document, 'pointermove', { clientY: 12 });
    assert.equal(s.container.querySelectorAll('.drop-before, .drop-after').length, 0, '没越过阈值不画落点线');
    s.fire(s.document, 'pointerup', { clientY: 290 });
    assert.deepEqual(s.reorders, []);
});

test('Esc cancels the drag: no callback, marks removed, and the key press is consumed', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.fire(s.document, 'pointermove', { clientY: 290 });
    const esc = s.fire(s.document.body, 'keydown', { key: 'Escape' }); // 真实按键的目标是焦点元素 / body，会先经过 document 的捕获阶段
    assert.equal(esc.defaultPrevented, true, '被消费（linkedom 不实现捕获阶段，无法在这里验证它先于页面其它 Esc 处理）');
    assert.equal(s.container.querySelectorAll('.dragging, .drop-before, .drop-after').length, 0);
    assert.equal(s.document.body.classList.contains('sortable-dragging'), false);
    s.fire(s.document, 'pointerup', { clientY: 290 });
    assert.deepEqual(s.reorders, [], '取消之后松手也不排序');

    // 没在拖拽时 Esc 不被拦截
    const idle = s.fire(s.document.body, 'keydown', { key: 'Escape' });
    assert.equal(idle.defaultPrevented, false);
});

test('pointercancel cancels the drag too', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.fire(s.document, 'pointermove', { clientY: 290 });
    s.fire(s.document, 'pointercancel', {});
    assert.deepEqual(s.reorders, []);
    assert.equal(s.controller.isDragging(), false);
});

test('only the primary button on a handle starts a drag, and other pointers are ignored mid-drag', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10, button: 2 });
    assert.equal(s.controller.isDragging(), false, '右键不拖');
    s.fire(s.container.querySelector('.name'), 'pointerdown', { clientY: 10 });
    assert.equal(s.controller.isDragging(), false, '不在手柄上不拖');

    s.fire(s.handle('a'), 'pointerdown', { clientY: 10, pointerId: 1 });
    s.fire(s.document, 'pointermove', { clientY: 290, pointerId: 2 });
    s.fire(s.document, 'pointerup', { clientY: 290, pointerId: 2 });
    assert.equal(s.controller.isDragging(), true, '别的指针不影响这次拖拽');
    assert.deepEqual(s.reorders, []);
    s.fire(s.document, 'pointermove', { clientY: 290, pointerId: 1 });
    s.fire(s.document, 'pointerup', { clientY: 290, pointerId: 1 });
    assert.deepEqual(s.reorders, [['b', 'c', 'a']]);
});

test('auto-scroll is asked on every move once the drag is real, before the drop is measured', (t) => {
    const calls = [];
    const s = setup(t, { autoScroll: event => calls.push(event.clientY) });
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.fire(s.document, 'pointermove', { clientY: 11 });
    assert.deepEqual(calls, [], '还没越过阈值');
    s.fire(s.document, 'pointermove', { clientY: 100 });
    s.fire(s.document, 'pointermove', { clientY: 290 });
    assert.deepEqual(calls, [100, 290]);
});

test('if the dragged row disappears mid-drag (list redrawn), the drag is cancelled instead of throwing', (t) => {
    const s = setup(t);
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.container.innerHTML = '<li class="row" data-id="b"><span class="handle">⋮⋮</span></li>';
    s.fire(s.document, 'pointermove', { clientY: 290 });
    assert.equal(s.controller.isDragging(), false);
    assert.deepEqual(s.reorders, []);
});

test('keyboard: ArrowDown / ArrowUp on a handle moves the row one step and focus stays on the same handle', (t) => {
    const s = setup(t);
    const down = s.fire(s.handle('a'), 'keydown', { key: 'ArrowDown' });
    assert.equal(down.defaultPrevented, true);
    assert.deepEqual(s.reorders, [['b', 'a', 'c']]);
    assert.equal(s.focus.id, 'a', '重绘后焦点回到同一个手柄');

    s.fire(s.handle('a'), 'keydown', { key: 'ArrowDown' });
    assert.deepEqual(s.reorders.at(-1), ['b', 'c', 'a']);
    s.fire(s.handle('a'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(s.reorders.at(-1), ['b', 'a', 'c']);
    assert.equal(s.reorders.length, 3);
});

test('keyboard at the edges is a no-op: nothing is sent and the order is untouched', (t) => {
    const s = setup(t);
    const up = s.fire(s.handle('a'), 'keydown', { key: 'ArrowUp' });
    assert.equal(up.defaultPrevented, true, '不让页面跟着滚动');
    s.fire(s.handle('c'), 'keydown', { key: 'ArrowDown' });
    assert.deepEqual(s.reorders, []);
    assert.deepEqual(s.rowOrder(), ['a', 'b', 'c']);
});

test('keyboard ignores other keys, targets outside a handle, and does nothing without moveStep', (t) => {
    const s = setup(t);
    const other = s.fire(s.handle('b'), 'keydown', { key: 'a' });
    assert.equal(other.defaultPrevented, false);
    const outside = s.fire(s.container.querySelector('.name'), 'keydown', { key: 'ArrowDown' });
    assert.equal(outside.defaultPrevented, false);
    assert.deepEqual(s.reorders, []);

    const plain = setup(t, { keepKeyboard: false });
    const event = plain.fire(plain.handle('a'), 'keydown', { key: 'ArrowDown' });
    assert.equal(event.defaultPrevented, false);
    assert.deepEqual(plain.reorders, []);
});

test('the controller keeps working after the rows are redrawn, and destroy() stops it', (t) => {
    const s = setup(t);
    s.render(); // 整体重绘：委托在容器上，不需要重新绑定
    s.fire(s.handle('b'), 'pointerdown', { clientY: 150 });
    s.fire(s.document, 'pointermove', { clientY: 10 });
    s.fire(s.document, 'pointerup', { clientY: 10 });
    assert.deepEqual(s.reorders, [['b', 'a', 'c']]);

    s.controller.destroy();
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    assert.equal(s.controller.isDragging(), false);
    s.fire(s.handle('a'), 'keydown', { key: 'ArrowDown' });
    assert.equal(s.reorders.length, 1);
});

test('createSortableList requires a container and a document', () => {
    assert.throws(() => createSortableList({}), TypeError);
});

// ── 多选：整组一起动 ──────────────────────────────────────

test('computeGroupInsertIndex counts the midlines of rows outside the group only', () => {
    const five = [0, 1, 2, 3, 4].map(i => ({ top: i * 100, bottom: i * 100 + 100 }));
    assert.equal(computeGroupInsertIndex(0, five, [1, 2]), 0);
    assert.equal(computeGroupInsertIndex(160, five, [1, 2]), 1, 'passed row 0 (midline 50) only; rows 1 and 2 are in the group');
    assert.equal(computeGroupInsertIndex(260, five, [1, 2]), 1, 'row 3 midline is 350');
    assert.equal(computeGroupInsertIndex(360, five, [1, 2]), 2);
    assert.equal(computeGroupInsertIndex(999, five, [1, 2]), 3, 'after every outside row');
    assert.equal(computeGroupInsertIndex(Number.NaN, five, [1]), 0);
    assert.equal(computeGroupInsertIndex(10, null, [1]), 0);
});

test('dropMarkForGroup draws the line among the rows outside the group', () => {
    assert.deepEqual(dropMarkForGroup(5, [1, 2], 0), { index: 0, side: 'before' });
    assert.deepEqual(dropMarkForGroup(5, [1, 2], 1), { index: 3, side: 'before' });
    assert.deepEqual(dropMarkForGroup(5, [1, 2], 3), { index: 4, side: 'after' });
    assert.equal(dropMarkForGroup(2, [0, 1], 0), null, 'nothing outside the group');
});

test('moveGroupToIndex moves the group as one block and keeps its internal order', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    assert.deepEqual(moveGroupToIndex(ids, ['b', 'c'], 0), ['b', 'c', 'a', 'd', 'e']);
    assert.deepEqual(moveGroupToIndex(ids, ['b', 'c'], 3), ['a', 'd', 'e', 'b', 'c']);
    assert.deepEqual(moveGroupToIndex(ids, ['d', 'b'], 1), ['a', 'b', 'd', 'c', 'e'], 'group keeps the order it has in the list, and gathers');
    assert.deepEqual(moveGroupToIndex(ids, ['x'], 2), ids, 'unknown ids change nothing');
    assert.deepEqual(moveGroupToIndex(ids, ['b'], 99), ['a', 'c', 'd', 'e', 'b'], 'clamped');
    assert.deepEqual(moveGroupToIndex(ids, ['b'], 1), moveIdToIndex(ids, 'b', 1), 'a group of one equals a single move');
});

test('dragging one row of a selected group moves the whole group and reports it', (t) => {
    const s = setup(t, { ids: ['a', 'b', 'c', 'd'], getGroupIds: id => (['a', 'b'].includes(id) ? ['a', 'b'] : null) });
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    assert.equal(s.row('b').classList.contains('dragging'), true, 'the other selected row is marked too');
    s.fire(s.document, 'pointermove', { clientY: 390 }); // below every row
    assert.equal(s.row('d').classList.contains('drop-after'), true);
    s.fire(s.document, 'pointerup', { clientY: 390 });
    assert.deepEqual(s.reorders, [['c', 'd', 'a', 'b']]);
    assert.deepEqual(s.metas, [{ group: ['a', 'b'] }]);
    assert.equal(s.container.querySelectorAll('.dragging, .drop-before, .drop-after').length, 0);
});

test('dragging a group and dropping it where it started sends nothing', (t) => {
    const s = setup(t, { ids: ['a', 'b', 'c'], getGroupIds: () => ['a', 'b'] });
    s.fire(s.handle('b'), 'pointerdown', { clientY: 110 });
    s.fire(s.document, 'pointermove', { clientY: 290 });
    s.fire(s.document, 'pointermove', { clientY: 120 });
    s.fire(s.document, 'pointerup', { clientY: 120 });
    assert.deepEqual(s.reorders, []);
});

test('a row outside the group, or a group of one, still moves alone', (t) => {
    const s = setup(t, { getGroupIds: id => (id === 'a' ? ['a'] : ['a', 'b']) });
    s.fire(s.handle('a'), 'pointerdown', { clientY: 10 });
    s.fire(s.document, 'pointermove', { clientY: 290 });
    s.fire(s.document, 'pointerup', { clientY: 290 });
    assert.deepEqual(s.reorders, [['b', 'c', 'a']]);
    assert.equal(s.metas[0], undefined, 'no group metadata for a single move');
    const outside = setup(t, { getGroupIds: () => ['a', 'b'] });
    outside.fire(outside.handle('c'), 'pointerdown', { clientY: 250 });
    outside.fire(outside.document, 'pointermove', { clientY: 10 });
    outside.fire(outside.document, 'pointerup', { clientY: 10 });
    assert.deepEqual(outside.reorders, [['c', 'a', 'b']], 'a group id list that does not contain the row is ignored');
});

test('keyboard on a grouped row moves the whole group through moveGroupStep', (t) => {
    const calls = [];
    const s = setup(t, {
        ids: ['a', 'b', 'c', 'd'],
        getGroupIds: id => (['b', 'c'].includes(id) ? ['b', 'c'] : null),
        moveGroupStep: (ids, group, direction) => { calls.push([group, direction]); return ['b', 'c', 'a', 'd']; },
    });
    s.fire(s.handle('c'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(calls, [[['b', 'c'], -1]]);
    assert.deepEqual(s.reorders, [['b', 'c', 'a', 'd']]);
    assert.deepEqual(s.metas, [{ group: ['b', 'c'] }]);
    s.fire(s.handle('d'), 'keydown', { key: 'ArrowUp' });
    assert.deepEqual(s.reorders.at(-1), ['b', 'c', 'd', 'a'], 'rows outside the group still use moveStep');
});
