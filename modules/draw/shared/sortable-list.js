// 纵向列表的拖拽排序（指针事件：鼠标与触屏通用）+ 键盘排序。
// 只认“手柄 + 行”两种元素，不关心行里是什么；排序结果以“按新顺序排好的 id 数组”交给 onReorder，
// 由调用方决定怎么落到自己的数据上（页面里是重排本地预设数组并通知宿主）。
// 拖拽过程中不改 DOM，只给行打 dragging / 落点标记；松手时才一次性回调，所以拖到一半被 Esc 取消不会留下痕迹。
// 几何计算都是纯函数（computeInsertIndex / dropMarkFor / moveIdToIndex），不依赖 DOM，可单测。
// 不得 import 酒馆内部模块；DOM 全部经传入的 document / container；自动滚动与“上移一格”由调用方注入，
// 避免本模块依赖其它共享模块。

const DRAG_THRESHOLD_PX = 3;

/**
 * 指针 Y 对应的“被拖项最终落在第几位”（0 起）。
 * 被拖项不参与定位：只拿指针和其余行的中线比较，指针越过几条中线就排在第几位，
 * 所以指针停在被拖项自己身上、没越过任何别的行的中线时，结果就是它原来的位置（原地不动）。
 * @param {number} pointerY
 * @param {Array<{top: number, bottom: number}>} rects 全部行的矩形（含被拖项），按当前顺序
 * @param {number} fromIndex 被拖项当前的位置
 * @returns {number} 取值 0 .. rects.length - 1；输入不合法时返回 fromIndex
 */
export function computeInsertIndex(pointerY, rects, fromIndex) {
    if (!Array.isArray(rects) || fromIndex < 0 || fromIndex >= rects.length || !Number.isFinite(pointerY)) return fromIndex;
    let passed = 0;
    rects.forEach((rect, index) => {
        if (index === fromIndex) return;
        if (pointerY >= (rect.top + rect.bottom) / 2) passed += 1;
    });
    return passed;
}

/**
 * 落点指示线画在哪一行的哪一侧（索引是原列表里的位置）。
 * 落到末位 = 画在“其余行”最后一行的下方；否则画在“其余行”里将排在被拖项之后的那一行的上方。
 * @param {number} count 行数
 * @param {number} fromIndex 被拖项当前位置
 * @param {number} toIndex computeInsertIndex 的结果
 * @returns {{index: number, side: 'before'|'after'}|null} 只有一行或索引非法时为 null
 */
export function dropMarkFor(count, fromIndex, toIndex) {
    if (count < 2 || fromIndex < 0 || fromIndex >= count || toIndex < 0 || toIndex >= count) return null;
    const others = [];
    for (let i = 0; i < count; i += 1) if (i !== fromIndex) others.push(i);
    if (toIndex >= others.length) return { index: others[others.length - 1], side: 'after' };
    return { index: others[toIndex], side: 'before' };
}

/**
 * 把 id 挪到新的位置 toIndex（挪完之后它所在的下标）；id 不存在或位置没变时原样返回副本。
 * @param {string[]} ids
 * @param {string} id
 * @param {number} toIndex
 * @returns {string[]}
 */
export function moveIdToIndex(ids, id, toIndex) {
    const list = [...ids];
    const from = list.indexOf(id);
    if (from < 0) return list;
    const to = Math.max(0, Math.min(list.length - 1, Math.trunc(toIndex)));
    if (to === from) return list;
    list.splice(from, 1);
    list.splice(to, 0, id);
    return list;
}

/**
 * 一组一起拖时，被拖的整组最终插在“组外的行”里第几位（0 起）：指针越过几条组外行的中线就排在第几位。
 * @param {number} pointerY
 * @param {Array<{top: number, bottom: number}>} rects 全部行的矩形，按当前顺序
 * @param {number[]} groupIndexes 组内各行的位置
 * @returns {number} 取值 0 .. 组外行数；输入不合法时返回 0
 */
export function computeGroupInsertIndex(pointerY, rects, groupIndexes) {
    if (!Array.isArray(rects) || !Array.isArray(groupIndexes) || !Number.isFinite(pointerY)) return 0;
    const inGroup = new Set(groupIndexes);
    let passed = 0;
    rects.forEach((rect, index) => {
        if (inGroup.has(index)) return;
        if (pointerY >= (rect.top + rect.bottom) / 2) passed += 1;
    });
    return passed;
}

/**
 * 落点指示线（组版本）：insertAt 是 computeGroupInsertIndex 的结果；画在“组外的行”里对应那一行的上方，落到末位则画在最后一行下方。
 * @returns {{index: number, side: 'before'|'after'}|null} 没有组外行时为 null
 */
export function dropMarkForGroup(count, groupIndexes, insertAt) {
    const inGroup = new Set(groupIndexes);
    const others = [];
    for (let i = 0; i < count; i += 1) if (!inGroup.has(i)) others.push(i);
    if (!others.length || insertAt < 0) return null;
    if (insertAt >= others.length) return { index: others[others.length - 1], side: 'after' };
    return { index: others[insertAt], side: 'before' };
}

/** 把一组 id 整体挪到“组外那些 id”的第 insertAt 位；组内保持原有先后顺序。组里没有出现在 ids 里的 id 忽略。 */
export function moveGroupToIndex(ids, groupIds, insertAt) {
    const inGroup = new Set(groupIds);
    const group = ids.filter(id => inGroup.has(id));
    if (!group.length) return [...ids];
    const rest = ids.filter(id => !inGroup.has(id));
    const at = Math.max(0, Math.min(rest.length, Math.trunc(Number(insertAt)) || 0));
    return [...rest.slice(0, at), ...group, ...rest.slice(at)];
}

/**
 * 创建一个可排序列表控制器。事件委托在 container 上，所以行被整体重绘（innerHTML）后无需重新绑定。
 * @param {object} options
 * @param {Element} options.container 列表容器（通常同时是滚动容器）
 * @param {string} options.rowSelector 行的选择器
 * @param {string} options.handleSelector 行内拖动手柄的选择器
 * @param {function(Element): string} options.getId 取一行的 id
 * @param {function(string[], {group?: string[]}=): void} options.onReorder 排序结果（完整的新 id 顺序）；顺序没变时不会调用。
 *        整组一起动时第二个参数带 { group }（组内 id，按原先后顺序）
 * @param {Document} options.document
 * @param {function(string[], string, number): string[]} [options.moveStep] (ids, id, -1|1) => 新顺序；
 *        键盘 ↑ / ↓ 用它移动一格。不传则不支持键盘排序。
 * @param {function(string): (string[]|null)} [options.getGroupIds] 拖动这一行时一起动的行（含它自己，按列表里的先后顺序）；
 *        返回 null 或只有一项时按单行处理。多选拖拽用它：整组一起落到新位置，组内相对顺序不变
 * @param {function(string[], string[], number): string[]} [options.moveGroupStep] (ids, groupIds, -1|1) => 新顺序；键盘 ↑ / ↓ 移动整组一格。
 *        不传时组里的行只能单个键盘排序
 * @param {function(PointerEvent): void} [options.autoScroll] 拖拽中每次指针移动时调用，用来在靠近边缘时滚动
 * @param {string} [options.draggingClass] 被拖行的类名
 * @param {string} [options.beforeClass] 落点在某行上方时给那一行加的类名
 * @param {string} [options.afterClass] 落点在某行下方时给那一行加的类名
 * @param {string} [options.bodyClass] 拖拽期间加在 body 上的类名（用来统一光标、禁止选中文字）
 * @returns {{destroy: function(): void, isDragging: function(): boolean, cancel: function(): void}}
 */
export function createSortableList({
    container,
    rowSelector,
    handleSelector,
    getId,
    onReorder,
    document,
    moveStep = null,
    getGroupIds = null,
    moveGroupStep = null,
    autoScroll = null,
    draggingClass = 'dragging',
    beforeClass = 'drop-before',
    afterClass = 'drop-after',
    bodyClass = 'sortable-dragging',
} = {}) {
    if (!container || !document) throw new TypeError('缺少 container / document');
    let drag = null; // { pointerId, id, startY, lastY, moved, handle, group }
    const removers = [];

    const rowsOf = () => Array.from(container.querySelectorAll(rowSelector));
    const idsOf = rows => rows.map(row => String(getId(row)));
    // 这一行是否带着一组一起动：getGroupIds 返回含自己的多项时才算。
    const groupOf = (id) => {
        const group = getGroupIds?.(id);
        return Array.isArray(group) && group.length > 1 && group.map(String).includes(id) ? group.map(String) : null;
    };

    function clearMarks() {
        for (const row of rowsOf()) row.classList.remove(draggingClass, beforeClass, afterClass);
    }

    /** 按指针当前位置实时读一遍行矩形，得出被拖项的当前下标与目标下标；被拖行已不在列表里时返回 null。 */
    function locate(pointerY) {
        const rows = rowsOf();
        const ids = idsOf(rows);
        const fromIndex = ids.indexOf(drag.id);
        if (fromIndex < 0) return null;
        const rects = rows.map(row => row.getBoundingClientRect());
        if (drag.group) {
            const groupIndexes = ids.map((id, index) => (drag.group.includes(id) ? index : -1)).filter(index => index >= 0);
            return { rows, ids, fromIndex, groupIndexes, insertAt: computeGroupInsertIndex(pointerY, rects, groupIndexes), toIndex: -1 };
        }
        return { rows, ids, fromIndex, toIndex: computeInsertIndex(pointerY, rects, fromIndex) };
    }

    function listen(target, type, handler, capture) {
        target.addEventListener(type, handler, capture);
        return () => target.removeEventListener(type, handler, capture);
    }

    function finish({ cancelled }) {
        if (!drag) return;
        const { moved, lastY } = drag;
        const found = cancelled || !moved ? null : locate(lastY);
        drag = null;
        removers.splice(0).forEach(off => off());
        document.body?.classList.remove(bodyClass);
        clearMarks();
        if (!found) return;
        if (found.groupIndexes) {
            const next = moveGroupToIndex(found.ids, found.groupIndexes.map(index => found.ids[index]), found.insertAt);
            if (next.every((id, index) => id === found.ids[index])) return;
            onReorder(next, { group: found.groupIndexes.map(index => found.ids[index]) });
            return;
        }
        if (found.toIndex === found.fromIndex) return;
        onReorder(moveIdToIndex(found.ids, found.ids[found.fromIndex], found.toIndex));
    }

    function onPointerMove(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        drag.lastY = event.clientY;
        if (Math.abs(event.clientY - drag.startY) > DRAG_THRESHOLD_PX) drag.moved = true;
        if (!drag.moved) return;
        autoScroll?.(event);
        // 自动滚动之后再量：落点要按滚动后的实时位置算。
        const found = locate(event.clientY);
        if (!found) { finish({ cancelled: true }); return; }
        for (const row of found.rows) row.classList.remove(beforeClass, afterClass);
        const mark = found.groupIndexes
            ? dropMarkForGroup(found.rows.length, found.groupIndexes, found.insertAt)
            : dropMarkFor(found.rows.length, found.fromIndex, found.toIndex);
        if (mark) found.rows[mark.index].classList.add(mark.side === 'before' ? beforeClass : afterClass);
    }

    function onPointerDown(event) {
        if (drag) return;
        if (event.button !== undefined && event.button !== 0) return;
        const handle = event.target?.closest?.(handleSelector);
        const row = handle?.closest?.(rowSelector);
        if (!handle || !row || !container.contains(row)) return;
        event.preventDefault?.();
        const id = String(getId(row));
        drag = { pointerId: event.pointerId, id, startY: event.clientY, lastY: event.clientY, moved: false, handle, group: groupOf(id) };
        try { handle.setPointerCapture?.(event.pointerId); } catch (error) {
            console.warn({ source: import.meta.url, operation: 'setPointerCapture' }, error);
        }
        document.body?.classList.add(bodyClass);
        for (const item of rowsOf()) {
            if (item === row || drag.group?.includes(String(getId(item)))) item.classList.add(draggingClass);
        }
        removers.push(
            listen(document, 'pointermove', onPointerMove),
            listen(document, 'pointerup', (e) => { if (drag && e.pointerId === drag.pointerId) { drag.lastY = Number.isFinite(e.clientY) ? e.clientY : drag.lastY; finish({ cancelled: false }); } }),
            listen(document, 'pointercancel', (e) => { if (drag && e.pointerId === drag.pointerId) finish({ cancelled: true }); }),
            // Esc：在捕获阶段拦下，只取消这次拖拽，不再传给页面里其它的 Esc 处理（例如关闭整个设置页）。
            listen(document, 'keydown', (e) => {
                if (e.key !== 'Escape') return;
                e.preventDefault?.();
                e.stopPropagation?.();
                finish({ cancelled: true });
            }, true),
        );
    }

    function onKeyDown(event) {
        if (drag || !moveStep || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')) return;
        const handle = event.target?.closest?.(handleSelector);
        const row = handle?.closest?.(rowSelector);
        if (!handle || !row || !container.contains(row)) return;
        event.preventDefault?.();
        const ids = idsOf(rowsOf());
        const id = String(getId(row));
        const group = moveGroupStep ? groupOf(id) : null;
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const next = group ? moveGroupStep(ids, group, direction) : moveStep(ids, id, direction);
        if (!Array.isArray(next) || next.length !== ids.length || next.every((item, index) => item === ids[index])) return; // 边界处不动
        onReorder(next, group ? { group } : undefined);
        // 调用方重绘后旧手柄已被换掉：把焦点还给同一行的手柄，便于连续按键；被移动的行保持在可视范围内。
        const moved = rowsOf().find(item => String(getId(item)) === id);
        moved?.querySelector(handleSelector)?.focus?.();
        moved?.scrollIntoView?.({ block: 'nearest' });
    }

    const offs = [listen(container, 'pointerdown', onPointerDown), listen(container, 'keydown', onKeyDown)];

    return {
        isDragging: () => !!drag,
        cancel: () => finish({ cancelled: true }),
        destroy() {
            finish({ cancelled: true });
            offs.splice(0).forEach(off => off());
        },
    };
}
