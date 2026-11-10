// 「沿用角色着装」下面的“服装记忆”面板：默认折叠；展开后每个角色一条，样子和角色标签里的服装 / 动态标签条目一致
// （折叠时一行：箭头、名字、第几层、衣着预览、清除；点开才出现形态和衣着两个输入框）。
// 数据全部来自宿主（CONTINUITY_MEMORY），本模块只负责画和把改动交回去。
// 只有展开才加载：面板展开时才向宿主要数据，每条记录点开时才建输入框；宿主的回复按角色名原地更新，
// 正在输入的那一格不会被覆盖，也不会因为 Tab 到下一格而丢焦点。只用 textContent / value，不拼 HTML。
import { installTextareaAutofit } from './textarea-autofit.js';
import { createSortableList } from './sortable-list.js';
import { movePresetId } from './preset-order.js';
import { setEditorSectionCollapsed } from './character-edit-form.js';
import { DEFAULT_MAX_ENTRIES, DEFAULT_MAX_FLOORS, EMPTY_COSTUME_TEXT } from './character-continuity.js';

export const DEFAULT_MEMORY_LIMIT = 10;
const MAX_MEMORY_LIMIT = 999;

/**
 * 解析“显示前 N 个”输入框：留空或 0 表示全部显示；只接受非负整数（其它写法返回 null，调用方恢复原值）。
 */
export function parseMemoryLimit(raw) {
    const text = String(raw ?? '').trim();
    if (text === '') return 0;
    if (!/^\d+$/.test(text)) return null;
    return Math.min(Number(text), MAX_MEMORY_LIMIT);
}

const DEFAULT_SCAN_LIMITS = Object.freeze({ maxFloors: DEFAULT_MAX_FLOORS, maxEntries: DEFAULT_MAX_ENTRIES });
const MAX_SCAN_VALUE = 99999;

/** 解析“往回读几层 / 最多记几个角色”输入框：只接受正整数（太大的按上限算）；其它写法返回 null，调用方恢复原值。 */
export function parseScanLimit(raw) {
    const text = String(raw ?? '').trim();
    if (!/^\d+$/.test(text)) return null;
    const value = Number(text);
    return value >= 1 ? Math.min(value, MAX_SCAN_VALUE) : null;
}

/** 取排好序的前 limit 个；limit 为 0 或不小于总数时全部显示。 */
export function limitEntries(entries, limit) {
    const list = Array.isArray(entries) ? entries : [];
    const n = Number.isInteger(limit) && limit > 0 ? limit : list.length;
    return { shown: list.slice(0, n), hiddenCount: Math.max(0, list.length - n) };
}

/** 按用户拖出来的顺序排：order 里有的排前面（按 order 的先后），没有的跟在后面保持宿主给的顺序。 */
export function sortEntriesByOrder(entries, order = []) {
    const rank = new Map((Array.isArray(order) ? order : []).filter(name => typeof name === 'string').map((name, index) => [name, index]));
    return entries
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => (rank.has(a.entry.name) ? rank.get(a.entry.name) : Infinity) - (rank.has(b.entry.name) ? rank.get(b.entry.name) : Infinity) || a.index - b.index)
        .map(item => item.entry);
}

function create(document, tag, className = '', text = '') {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
}

/** 数字输入框：文本框 + 数字键盘 + 无障碍名称（三个数字框共用）。 */
function numericInput(document, label) {
    const input = create(document, 'input', 'input cm-limit-input');
    input.type = 'text';
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('aria-label', label);
    return input;
}

/**
 * @param {object} options
 * @param {Document} options.document
 * @param {Element} options.container
 * @param {function(): void} options.requestMemory 展开 / 点“刷新”时向宿主要最新记忆
 * @param {function({op: string, name?: string, form?: string, appear?: string, costume?: string}): void} options.editMemory
 * @param {function(string): boolean} [options.confirm] “恢复按图记忆”前的确认；不传就直接执行
 * @param {function(): string[]} [options.getOrder] 读取用户拖出来的角色顺序（只是显示偏好）
 * @param {function(string[]): void} [options.onOrderChange] 拖动 / 键盘排序后保存新的顺序
 * @param {function(): (number|null)} [options.getLimit] 读取“显示前 N 个”（没存过返回 null → 默认 10；0 = 全部）
 * @param {function(number): void} [options.onLimitChange] 改了 N 之后保存
 * @param {function(): {maxFloors: number, maxEntries: number}} [options.getScanLimits] 读取“往回读几层 / 最多记几个角色”（存在插件设置里）
 * @param {function({maxFloors: number, maxEntries: number}): void} [options.onScanLimitsChange] 改了之后交给宿主保存
 */
export function createContinuityMemoryPanel({
    document, container, requestMemory, editMemory, confirm = () => true, getOrder = () => [], onOrderChange = () => {},
    getLimit = () => null, onLimitChange = () => {},
    getScanLimits = () => DEFAULT_SCAN_LIMITS, onScanLimitsChange = () => {},
}) {
    const section = create(document, 'div', 'form-group char-edit-section is-collapsed cm-panel');
    const head = create(document, 'div', 'char-section-head');
    const toggle = create(document, 'button', 'char-section-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('title', '展开 / 折叠');
    const chevron = create(document, 'i', 'fa-solid fa-chevron-down char-section-chevron');
    chevron.setAttribute('aria-hidden', 'true');
    const title = create(document, 'span', 'char-section-title', '服装记忆（当前聊天）');
    const count = create(document, 'span', 'char-section-count');
    toggle.append(chevron, title, count);
    const actions = create(document, 'span', 'char-section-actions');
    const refreshButton = create(document, 'button', 'btn btn-sm', '刷新');
    refreshButton.type = 'button';
    const resetButton = create(document, 'button', 'btn btn-sm', '恢复按图记忆');
    resetButton.type = 'button';
    resetButton.setAttribute('title', '清掉所有手动修改，记忆回到由已画的图推出来的样子');
    const latestButton = create(document, 'button', 'btn btn-sm', '按最新排序');
    latestButton.type = 'button';
    latestButton.setAttribute('title', '清掉你拖出来的顺序，回到“越接近最新楼层越靠上”');
    actions.append(refreshButton, resetButton, latestButton);
    head.append(toggle, actions);

    const body = create(document, 'div', 'char-section-body');
    body.hidden = true;
    const hint = create(document, 'p', 'form-hint', '各角色最近楼层的服装记忆。\n修改相当于在最新楼层之后多一张假图占位，无任何消耗：之后新画的图会覆盖它；重画已有图的楼层不会用到。');
    hint.style.whiteSpace = 'pre-line';
    const limitRow = create(document, 'div', 'cm-limit');
    const limitBefore = create(document, 'span', '', '显示前');
    const limitInput = numericInput(document, '服装记忆最多显示几个角色，留空或 0 为全部');
    limitInput.setAttribute('title', '留空或 0 = 全部显示');
    const limitAfter = create(document, 'span', 'cm-limit-total');
    limitRow.append(limitBefore, limitInput, limitAfter);
    const more = create(document, 'div', 'form-hint cm-more');
    more.hidden = true;
    const scanRow = create(document, 'div', 'cm-limit cm-scan-limits');
    const floorsInput = numericInput(document, '服装记忆往回读最近多少层');
    const entriesInput = numericInput(document, '服装记忆最多记多少个角色');
    scanRow.append(create(document, 'span', '', '往回读最近'), floorsInput, create(document, 'span', '', '层，最多记'), entriesInput, create(document, 'span', '', '个角色'));
    const scanInfo = create(document, 'div', 'form-hint cm-scan');
    scanInfo.hidden = true;
    const empty = create(document, 'div', 'form-hint cm-empty');
    const list = create(document, 'div', 'cm-list');
    body.append(hint, limitRow, scanRow, scanInfo, empty, list, more);
    section.append(head, body);
    container.appendChild(section);
    const autofit = installTextareaAutofit(list);

    const rows = new Map();
    let lastView = null;
    let limit = DEFAULT_MEMORY_LIMIT;
    try {
        const stored = getLimit();
        limit = Number.isInteger(stored) && stored >= 0 ? stored : DEFAULT_MEMORY_LIMIT;
    } catch { limit = DEFAULT_MEMORY_LIMIT; }
    limitInput.value = limit === 0 ? '' : String(limit);
    let scanLimits = { ...DEFAULT_SCAN_LIMITS };
    function setScanLimits(next) {
        const floors = Number(next?.maxFloors);
        const entries = Number(next?.maxEntries);
        if (Number.isInteger(floors) && floors >= 1) scanLimits.maxFloors = floors;
        if (Number.isInteger(entries) && entries >= 1) scanLimits.maxEntries = entries;
        if (document.activeElement !== floorsInput) floorsInput.value = String(scanLimits.maxFloors);
        if (document.activeElement !== entriesInput) entriesInput.value = String(scanLimits.maxEntries);
    }
    try { setScanLimits(getScanLimits()); } catch { setScanLimits(DEFAULT_SCAN_LIMITS); }
    let order = [];
    try { order = Array.isArray(getOrder()) ? getOrder() : []; } catch { order = []; }

    function previewOf(entry) {
        const costume = entry.costume || EMPTY_COSTUME_TEXT;
        return entry.form ? `${entry.form}｜${costume}` : costume;
    }

    function makeRow(name) {
        const row = create(document, 'div', 'cm-entry named-tag-item is-folded');
        row.setAttribute('data-name', name);
        const header = create(document, 'div', 'named-tag-header cm-header');
        const rowToggle = create(document, 'button', 'named-tag-toggle');
        rowToggle.type = 'button';
        rowToggle.setAttribute('aria-expanded', 'false');
        rowToggle.setAttribute('title', '展开 / 折叠');
        rowToggle.setAttribute('aria-label', `展开 / 折叠 ${name} 的记忆`);
        const rowChevron = create(document, 'i', 'fa-solid fa-chevron-down named-tag-chevron');
        rowChevron.setAttribute('aria-hidden', 'true');
        rowToggle.appendChild(rowChevron);
        const label = create(document, 'span', 'cm-name', name);
        const floor = create(document, 'span', 'cm-floor');
        const preview = create(document, 'span', 'named-tag-preview');
        const edited = create(document, 'span', 'cm-edited', '已修改');
        const remove = create(document, 'button', 'btn btn-sm cm-remove', '清除');
        remove.type = 'button';
        remove.setAttribute('aria-label', `清除 ${name} 的记忆`);
        const handle = create(document, 'span', 'char-drag-handle named-tag-drag', '⋮⋮');
        handle.setAttribute('role', 'button');
        handle.setAttribute('tabindex', '0');
        handle.setAttribute('data-cm-drag', '');
        handle.setAttribute('title', '拖动调整顺序，也可聚焦后按 ↑ / ↓');
        handle.setAttribute('aria-label', `拖动调整 ${name} 的顺序`);
        header.append(handle, rowToggle, label, floor, preview, edited, remove);
        const rowBody = create(document, 'div', 'named-tag-body cm-body');
        rowBody.hidden = true;
        row.append(header, rowBody);
        return { row, rowToggle, rowBody, preview, edited, floor, form: null, costume: null, entry: { name, appear: '', form: '', costume: '' } };
    }

    // 输入框只在这一条第一次展开时才建（折叠的条目不占 DOM，也不参与量高度）。
    function buildBody(node) {
        if (node.form) return;
        const formGroup = create(document, 'div', 'form-group');
        const formLabel = create(document, 'label', 'form-label', '形态');
        node.form = create(document, 'input', 'input cm-form');
        node.form.type = 'text';
        node.form.placeholder = '多形态角色填形态名，其余留空';
        node.form.setAttribute('aria-label', `${node.entry.name} 的形态`);
        formGroup.append(formLabel, node.form);
        const costumeGroup = create(document, 'div', 'form-group');
        const costumeLabel = create(document, 'label', 'form-label', 'costume（留空＝没穿）');
        node.costume = create(document, 'textarea', 'input cm-costume');
        node.costume.rows = 1;
        node.costume.setAttribute('data-autofit', '');
        node.costume.placeholder = '衣着及穿戴状态、身体部件、非人特征、配饰（留空＝没穿）';
        node.costume.setAttribute('aria-label', `${node.entry.name} 的衣着`);
        costumeGroup.append(costumeLabel, node.costume);
        node.rowBody.append(formGroup, costumeGroup);
        fillInputs(node);
    }

    function fillInputs(node) {
        if (!node.form) return;
        // 正在输入的那一格保持原样：宿主的回复晚到不会把用户刚敲的字抹掉。
        if (document.activeElement !== node.form) node.form.value = node.entry.form || '';
        if (document.activeElement !== node.costume) node.costume.value = node.entry.costume || '';
    }

    function setRowFolded(node, folded) {
        node.row.classList.toggle('is-folded', folded);
        node.rowBody.hidden = folded;
        node.rowToggle.setAttribute('aria-expanded', String(!folded));
        if (!folded) buildBody(node);
    }

    function fill(node, entry) {
        node.entry = { name: entry.name, appear: entry.appear || '', form: entry.form || '', costume: entry.costume || '' };
        node.preview.textContent = previewOf(entry);
        // 值来自哪一层的图；手动修改过的行不属于任何一层，只显示“已修改”。
        node.floor.textContent = Number.isInteger(entry.floor) ? `（第 ${entry.floor} 层）` : '';
        node.edited.hidden = !entry.edited;
        node.row.classList.toggle('is-edited', Boolean(entry.edited));
        fillInputs(node);
    }

    function render(view = {}) {
        lastView = view;
        const entries = Array.isArray(view.entries) ? view.entries : [];
        const { shown, hiddenCount } = limitEntries(sortEntriesByOrder(entries, order), limit);
        count.textContent = !view.hasChat ? '' : (hiddenCount ? `（显示 ${shown.length}/${entries.length}）` : `（${entries.length}）`);
        limitAfter.textContent = `个，共 ${entries.length} 个`;
        more.hidden = !hiddenCount;
        const scan = view.scan;
        scanInfo.hidden = !scan;
        scanInfo.textContent = scan
            ? `读取了最近 ${scan.floors} 层里的 ${scan.slots} 个图位，用时 ${scan.ms} 毫秒${scan.truncated ? `；更早的楼层没有读（上限 ${scan.maxFloors} 层）` : ''}`
            : '';
        more.textContent = hiddenCount ? `还有 ${hiddenCount} 个没显示（把上面“显示前”后面的数字调大，或留空显示全部）` : '';
        empty.textContent = !view.hasChat
            ? '当前没有打开聊天。'
            : (entries.length ? '' : '这个聊天还没有记下任何角色的衣着；画过图以后会出现在这里。');
        empty.hidden = !empty.textContent;
        resetButton.disabled = !view.hasChat;
        const seen = new Set();
        let previous = null;
        for (const entry of shown) {
            if (!entry?.name || seen.has(entry.name)) continue;
            seen.add(entry.name);
            let node = rows.get(entry.name);
            if (!node) {
                node = makeRow(entry.name);
                rows.set(entry.name, node);
            }
            fill(node, entry);
            // 宿主给的顺序就是显示顺序；只在位置不对时才挪，避免打断输入。
            const expectedNext = previous ? previous.nextSibling : list.firstChild;
            if (node.row !== expectedNext) list.insertBefore(node.row, expectedNext);
            previous = node.row;
        }
        for (const [name, node] of [...rows]) {
            if (seen.has(name)) continue;
            node.row.remove();
            rows.delete(name);
        }
    }

    const nodeOf = (target) => {
        const row = target?.closest?.('.cm-entry');
        return row ? rows.get(row.getAttribute('data-name')) : null;
    };

    toggle.addEventListener('click', () => {
        const willOpen = section.classList.contains('is-collapsed');
        setEditorSectionCollapsed(section, !willOpen);
        if (willOpen) requestMemory();
    });
    refreshButton.addEventListener('click', () => requestMemory());
    resetButton.addEventListener('click', () => {
        if (confirm('清掉所有手动修改，记忆回到由已画的图推出来的样子？')) editMemory({ op: 'reset' });
    });
    const onScanChange = (input, key) => () => {
        const parsed = parseScanLimit(input.value);
        if (parsed === null) {
            input.value = String(scanLimits[key]);
            return;
        }
        scanLimits = { ...scanLimits, [key]: parsed };
        input.value = String(parsed);
        try { onScanLimitsChange({ ...scanLimits }); } catch (caughtError) { console.warn({ source: import.meta.url, operation: 'scanLimits' }, caughtError); }
    };
    floorsInput.addEventListener('change', onScanChange(floorsInput, 'maxFloors'));
    entriesInput.addEventListener('change', onScanChange(entriesInput, 'maxEntries'));
    limitInput.addEventListener('change', () => {
        const parsed = parseMemoryLimit(limitInput.value);
        if (parsed === null) {
            limitInput.value = limit === 0 ? '' : String(limit);
            return;
        }
        limit = parsed;
        limitInput.value = limit === 0 ? '' : String(limit);
        try { onLimitChange(limit); } catch (caughtError) { console.warn({ source: import.meta.url, operation: 'memoryLimit' }, caughtError); }
        if (lastView) render(lastView);
    });
    latestButton.addEventListener('click', () => {
        order = [];
        try { onOrderChange(order); } catch (caughtError) { console.warn({ source: import.meta.url, operation: 'memoryOrder' }, caughtError); }
        if (lastView) render(lastView);
    });
    list.addEventListener('click', (event) => {
        if (event.target?.closest?.('.cm-remove')) {
            const node = nodeOf(event.target);
            if (node) editMemory({ op: 'remove', name: node.entry.name });
            return;
        }
        // 点箭头、预览或头部空白处展开 / 折叠（和角色标签条目一致）；手柄只管拖动。
        if (event.target?.closest?.('[data-cm-drag]')) return;
        const header = event.target?.closest?.('.cm-header');
        const node = header && nodeOf(header);
        if (node) setRowFolded(node, !node.row.classList.contains('is-folded'));
    });
    list.addEventListener('change', (event) => {
        const node = nodeOf(event.target);
        if (!node?.form) return;
        editMemory({
            op: 'set',
            name: node.entry.name,
            form: node.form.value.trim(),
            appear: node.entry.appear,
            costume: node.costume.value.trim(),
        });
    });

    // 拖动 / 键盘（↑ ↓）排序，和服装、动态标签条目同一套；顺序只是显示偏好，不影响发给 AI 的内容。
    const sortable = createSortableList({
        container: list,
        rowSelector: '.cm-entry',
        handleSelector: '[data-cm-drag]',
        getId: row => row.getAttribute('data-name'),
        onReorder: (names) => {
            names.forEach(name => rows.get(name) && list.appendChild(rows.get(name).row));
            order = [...names, ...order.filter(name => !names.includes(name))];
            try { onOrderChange(order); } catch (caughtError) { console.warn({ source: import.meta.url, operation: 'memoryOrder' }, caughtError); } // 保存失败只影响下次打开的顺序
        },
        moveStep: movePresetId,
        document,
    });

    return {
        render,
        setScanLimits,
        destroy() { sortable.destroy?.(); autofit.dispose?.(); section.remove(); rows.clear(); },
    };
}
