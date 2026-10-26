// 角色分组滚动区高度的用户偏好：纯函数（读写映射、夹取、键盘步进）+ 一个委托式的拖拽 / 键盘 / 双击控制器。
// 偏好是本机的界面状态：存在 localStorage（与分组折叠状态同一机制、同一 lwb.draw.* 命名，三个绘图面板共用），
// 按分组 id 记录（未分组用保留键），不进入角色库数据，也不会随角色导出。
// 分组滚动区原本就有上限（样式里的 max-height: max(320px, 60vh) + overflow-y: auto），这里只是让这个上限可由用户调整：
// 值通过 CSS 变量 --lwb-group-height 交给样式；角色少、内容不足上限时本来就没有滚动条也不留空白，调整只在内容超出时看得出来。
// 窄屏（≤768px）样式取消分组内滚动，手柄随之隐藏，保存的高度不受影响。

export const GROUP_HEIGHT_STORAGE_KEY = 'lwb.draw.charGroupHeights';
export const UNGROUPED_HEIGHT_KEY = '__ungrouped__'; // 与折叠状态的未分组键一致
export const GROUP_HEIGHT_MIN = 160;
export const GROUP_HEIGHT_MAX = 2400;
export const GROUP_HEIGHT_STEP = 40;
export const GROUP_HEIGHT_STEP_LARGE = 160;
const HEIGHT_VAR = '--lwb-group-height';
const HANDLE_CLASS = 'lwb-group-resize';

/** 分组 id → 存储键（未分组的空 id 用保留键）。 */
export function groupHeightKey(groupId) {
    return groupId || UNGROUPED_HEIGHT_KEY;
}

/** 夹到 [MIN, MAX] 并取整；不是有限数返回 null。 */
export function clampGroupHeight(value) {
    if ((typeof value !== 'number' && typeof value !== 'string') || value === '') return null;
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Math.min(GROUP_HEIGHT_MAX, Math.max(GROUP_HEIGHT_MIN, Math.round(number)));
}

/** 读回的存储内容 → { key: px }：只留有限数（夹取后），丢掉其余。 */
export function normalizeGroupHeights(raw) {
    const result = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    for (const [key, value] of Object.entries(raw)) {
        const height = clampGroupHeight(value);
        if (height !== null) result[key] = height;
    }
    return result;
}

/** 设置（或用 null 清除）某个分组的高度，返回新对象。 */
export function setGroupHeight(heights, groupId, px) {
    const next = { ...normalizeGroupHeights(heights) };
    const key = groupHeightKey(groupId);
    const height = clampGroupHeight(px);
    if (height === null) delete next[key]; else next[key] = height;
    return next;
}

/** 丢掉已经不存在的分组的记录（未分组键始终保留）。 */
export function pruneGroupHeights(heights, validGroupIds) {
    const valid = new Set([UNGROUPED_HEIGHT_KEY, ...Array.from(validGroupIds || [], String)]);
    return Object.fromEntries(Object.entries(normalizeGroupHeights(heights)).filter(([key]) => valid.has(key)));
}

export function loadGroupHeights(storage) {
    try {
        return normalizeGroupHeights(JSON.parse(storage?.getItem(GROUP_HEIGHT_STORAGE_KEY) || '{}'));
    } catch {
        return {};
    }
}

/** 写回；空表直接删除该项，不在存储里留 "{}"。 */
export function saveGroupHeights(storage, heights) {
    try {
        const clean = normalizeGroupHeights(heights);
        if (Object.keys(clean).length) storage?.setItem(GROUP_HEIGHT_STORAGE_KEY, JSON.stringify(clean));
        else storage?.removeItem(GROUP_HEIGHT_STORAGE_KEY);
        return true;
    } catch (caughtError) {
        console.warn({ source: import.meta.url, operation: 'saveGroupHeights' }, caughtError);
        return false;
    }
}

/**
 * 键盘：↑ / ↓ 调整一步（Shift 为大步），Home 恢复默认。
 * @returns {number|null|undefined} 新高度；null = 恢复默认；undefined = 不是本控件的按键
 */
export function nextGroupHeightForKey(current, key, { shift = false } = {}) {
    if (key === 'Home') return null;
    if (key !== 'ArrowUp' && key !== 'ArrowDown') return undefined;
    const step = shift ? GROUP_HEIGHT_STEP_LARGE : GROUP_HEIGHT_STEP;
    return clampGroupHeight(Number(current) + (key === 'ArrowUp' ? -step : step));
}

/** 手柄元素（分组滚动区下沿）。 */
export function createGroupResizeHandle(document) {
    const handle = document.createElement('div');
    handle.className = HANDLE_CLASS;
    handle.setAttribute('role', 'separator');
    handle.setAttribute('aria-orientation', 'horizontal');
    handle.setAttribute('aria-label', '调整分组高度');
    handle.setAttribute('aria-valuemin', String(GROUP_HEIGHT_MIN));
    handle.setAttribute('aria-valuemax', String(GROUP_HEIGHT_MAX));
    handle.setAttribute('title', '拖动调整分组高度，也可聚焦后按 ↑ / ↓（Shift 大步，Home 恢复）；双击恢复默认');
    handle.setAttribute('tabindex', '0');
    return handle;
}

/**
 * 委托式控制器：事件只绑在 list 上，分组被整体重绘后调一次 apply() 即可（补手柄、把保存的高度写回样式）。
 * @param {object} options
 * @param {Element} options.list 分组列表容器
 * @param {Document} options.document
 * @param {function(): (Storage|null)} [options.getStorage] 默认 window.localStorage
 * @param {string} options.groupSelector 分组元素
 * @param {string} options.bodySelector 分组里的滚动区
 * @param {function(Element): string} [options.getGroupId] 默认读 dataset.groupId
 * @param {function(Element): number} [options.measure] 滚动区当前高度（测试可注入）
 */
export function createGroupHeightController({
    list,
    document,
    getStorage = () => document.defaultView?.localStorage ?? null,
    groupSelector,
    bodySelector,
    getGroupId = section => String(section.dataset.groupId || ''),
    measure = element => element.getBoundingClientRect().height,
} = {}) {
    if (!list || !document) throw new TypeError('缺少 list / document');
    const storage = () => { try { return getStorage(); } catch { return null; } };
    let heights = loadGroupHeights(storage());
    let drag = null;

    const keyOf = section => groupHeightKey(getGroupId(section));
    const bodyOf = section => section?.querySelector(bodySelector);

    function writeStyle(section, px) {
        const body = bodyOf(section);
        if (!body) return;
        if (px === null || px === undefined) body.style.removeProperty(HEIGHT_VAR);
        else body.style.setProperty(HEIGHT_VAR, `${px}px`);
        const handle = section.querySelector(`.${HANDLE_CLASS}`);
        handle?.setAttribute('aria-valuenow', String(Math.round(px ?? measure(body))));
    }

    function commit(section, px) {
        heights = setGroupHeight(heights, getGroupId(section), px);
        saveGroupHeights(storage(), heights);
        writeStyle(section, heights[keyOf(section)] ?? null);
    }

    /** 重绘后调用：补手柄、写回保存的高度；validGroupIds 给出时顺便清掉已删除分组的记录。 */
    function apply({ validGroupIds } = {}) {
        if (validGroupIds) {
            const pruned = pruneGroupHeights(heights, validGroupIds);
            if (Object.keys(pruned).length !== Object.keys(heights).length) {
                heights = pruned;
                saveGroupHeights(storage(), heights);
            }
        }
        list.querySelectorAll(groupSelector).forEach((section) => {
            const body = bodyOf(section);
            if (!body) return;
            if (!section.querySelector(`.${HANDLE_CLASS}`)) body.after(createGroupResizeHandle(document));
            writeStyle(section, heights[keyOf(section)] ?? null);
        });
    }

    const currentHeight = (section) => {
        const saved = heights[keyOf(section)];
        return saved ?? clampGroupHeight(measure(bodyOf(section))) ?? GROUP_HEIGHT_MIN;
    };

    function onPointerMove(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;
        drag.height = clampGroupHeight(drag.startHeight + (event.clientY - drag.startY));
        writeStyle(drag.section, drag.height);
    }

    function endDrag(event, cancelled) {
        if (!drag || (event && event.pointerId !== drag.pointerId)) return;
        const { section, handle, height, startHeight, hadSaved } = drag;
        drag = null;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerCancel);
        handle.classList.remove('dragging');
        document.body?.classList.remove('lwb-group-resizing');
        if (cancelled) { writeStyle(section, hadSaved ? startHeight : null); return; }
        commit(section, height);
    }
    const onPointerUp = event => endDrag(event, false);
    const onPointerCancel = event => endDrag(event, true);

    function onPointerDown(event) {
        if (drag || (event.button !== undefined && event.button !== 0)) return;
        const handle = event.target?.closest?.(`.${HANDLE_CLASS}`);
        const section = handle?.closest(groupSelector);
        if (!handle || !section || !list.contains(section)) return;
        event.preventDefault?.();
        const startHeight = currentHeight(section);
        drag = {
            pointerId: event.pointerId, handle, section, startY: event.clientY, startHeight,
            height: startHeight, hadSaved: heights[keyOf(section)] !== undefined,
        };
        try { handle.setPointerCapture?.(event.pointerId); } catch (caughtError) {
            console.warn({ source: import.meta.url, operation: 'setPointerCapture' }, caughtError);
        }
        handle.classList.add('dragging');
        document.body?.classList.add('lwb-group-resizing');
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerCancel);
    }

    function onKeyDown(event) {
        const handle = event.target?.closest?.(`.${HANDLE_CLASS}`);
        const section = handle?.closest(groupSelector);
        if (!handle || !section || !list.contains(section)) return;
        const next = nextGroupHeightForKey(currentHeight(section), event.key, { shift: event.shiftKey });
        if (next === undefined) return;
        event.preventDefault?.();
        commit(section, next);
    }

    function onDoubleClick(event) {
        const handle = event.target?.closest?.(`.${HANDLE_CLASS}`);
        const section = handle?.closest(groupSelector);
        if (!handle || !section || !list.contains(section)) return;
        commit(section, null);
    }

    list.addEventListener('pointerdown', onPointerDown);
    list.addEventListener('keydown', onKeyDown);
    list.addEventListener('dblclick', onDoubleClick);

    return {
        apply,
        getHeights: () => ({ ...heights }),
        destroy() {
            endDrag(null, true);
            list.removeEventListener('pointerdown', onPointerDown);
            list.removeEventListener('keydown', onKeyDown);
            list.removeEventListener('dblclick', onDoubleClick);
        },
    };
}
