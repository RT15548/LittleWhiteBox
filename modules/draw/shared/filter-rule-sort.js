// 消息过滤规则列表的拖动排序：NovelAI / SD / ComfyUI 三个绘图页共用。
// 手柄样式、拖动与键盘（↑ / ↓）交互都复用现有的 sortable-list.js 与 preset-order.js，这里只负责认行、换行顺序。
// 规则的先后有意义（单端规则按列表顺序执行），所以顺序要和界面一致。

import { createSortableList } from './sortable-list.js';
import { movePresetId } from './preset-order.js';

const ROW_SELECTOR = '.filter-rule-row';
const HANDLE_SELECTOR = '[data-filter-drag]';
let nextRuleUid = 0;

function ruleRowId(row) {
    if (!row.dataset.ruleUid) {
        nextRuleUid += 1;
        row.dataset.ruleUid = String(nextRuleUid);
    }
    return row.dataset.ruleUid;
}

/** 规则行最前面的拖动手柄（⋮⋮，与其它列表同款）。 */
export function createFilterRuleHandle(document) {
    const handle = document.createElement('span');
    handle.className = 'char-drag-handle filter-rule-drag';
    handle.setAttribute('role', 'button');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('data-filter-drag', '');
    handle.setAttribute('title', '拖动调整顺序，也可聚焦后按 ↑ / ↓');
    handle.setAttribute('aria-label', '拖动调整规则顺序');
    handle.textContent = '⋮⋮';
    return handle;
}

/** 让 container 里的规则行可拖动 / 键盘排序；行被重绘后不用重新绑定（事件委托在 container 上）。 */
export function createFilterRuleSortable({ container, document, autoScroll = null, createSortable = createSortableList } = {}) {
    return createSortable({
        container,
        rowSelector: ROW_SELECTOR,
        handleSelector: HANDLE_SELECTOR,
        getId: ruleRowId,
        onReorder: (ids) => {
            const rows = new Map(Array.from(container.querySelectorAll(ROW_SELECTOR), row => [ruleRowId(row), row]));
            for (const id of ids) {
                const row = rows.get(id);
                if (row) container.appendChild(row);
            }
        },
        moveStep: movePresetId,
        autoScroll,
        document,
    });
}
