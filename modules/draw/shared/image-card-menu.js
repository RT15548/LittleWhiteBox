// 聊天里失败 / 未生成图片卡的操作行：主按钮 + 次要按钮 + 一个“…”更多菜单（NovelAI / SD WebUI / ComfyUI 三个后端共用同一份标记）。
// 菜单是 character-card-menu.js 的浮层（position: fixed，不会被图上状态层的滚动区裁掉）：Esc / 点外面 / 选中菜单项 / 滚动 / 缩放都会关闭，
// 方向键、Home / End 在菜单项间移动。菜单项仍带原来的 data-action，动作由各后端原有的点击委托处理。
// 本模块不得 import 酒馆内部模块（单测直接引入）。
import { DRAW_SLOT_COPY } from './image-record.js';
import { createCardMenuController } from './character-card-menu.js';

const DOTS = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="2.5" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="13.5" cy="8" r="1.5"/></svg>';
const EDIT_TAGS = { action: 'edit-tags', label: DRAW_SLOT_COPY.editTagsAction };
const REMOVE = { action: 'remove-placeholder', label: DRAW_SLOT_COPY.remove, danger: true };

// 危险项（移除）前自动补一条分隔线。
function menuHtml(items) {
    return items.map(({ action, label, title, danger }) => `${danger ? '<div class="xb-nd-more-sep" role="separator"></div>' : ''}
            <button type="button" class="xb-nd-more-item${danger ? ' is-danger' : ''}" role="menuitem" data-action="${action}"${title ? ` title="${title}"` : ''}>${label}</button>`).join('');
}

/** “…”按钮 + 浮层菜单。items: [{ action, label, title?, danger? }] */
export function buildCardMoreMenuHtml(items) {
    return `<span class="xb-nd-more" data-card-menu>
        <button type="button" class="xb-nd-more-btn" aria-haspopup="menu" aria-expanded="false" aria-label="${DRAW_SLOT_COPY.moreActions}" title="${DRAW_SLOT_COPY.moreActions}">${DOTS}</button>
        <div class="xb-nd-more-menu" role="menu" aria-label="${DRAW_SLOT_COPY.moreActions}" hidden>${menuHtml(items)}
        </div>
    </span>`;
}

/** 失败卡的操作行：重新生成（主）、恢复上一版（有历史图时）、更多（编辑 TAG / 重画本楼失败图 / 移除）。 */
export function buildFailedActionsHtml({ historyCount = 0 } = {}) {
    return `<div class="xb-nd-failed-btns">
    <button type="button" class="xb-nd-retry-btn" data-action="retry-image">${DRAW_SLOT_COPY.regenerate}</button>
    ${historyCount > 0 ? `<button type="button" class="xb-nd-edit-btn" data-action="restore-image">${DRAW_SLOT_COPY.restoreImage}</button>` : ''}
    ${buildCardMoreMenuHtml([EDIT_TAGS,
        { action: 'retry-floor-failed', label: DRAW_SLOT_COPY.regenerateFloor, title: DRAW_SLOT_COPY.regenerateFloorHint }, REMOVE])}
</div>`;
}

/** 未生成卡的操作行：生成（主）、更多（编辑 TAG / 移除）。 */
export function buildUngeneratedActionsHtml() {
    return `<div class="xb-nd-failed-btns">
    <button type="button" class="xb-nd-retry-btn" data-action="retry-image">${DRAW_SLOT_COPY.generate}</button>
    ${buildCardMoreMenuHtml([EDIT_TAGS, REMOVE])}
</div>`;
}

const installed = new WeakSet();

/**
 * 给一个 document 装上更多菜单的点击处理（幂等）。后端的点击委托挂在 document 捕获阶段，且会截停卡片里所有 [data-action] 的点击，
 * 所以这里挂在 window 捕获阶段：先处理“…”按钮的开合，并在选中菜单项（交给后端继续处理）或点到菜单以外时收起菜单。
 */
export function installImageCardMenu(document) {
    const win = document?.defaultView;
    if (!win || installed.has(document)) return null;
    installed.add(document);
    const controller = createCardMenuController({ document });
    win.addEventListener('click', (event) => {
        const target = event.target;
        const trigger = target?.closest?.('.xb-nd-more-btn');
        if (trigger) {
            event.preventDefault();
            event.stopPropagation();
            controller.toggle(trigger);
        } else if (target?.closest?.('.xb-nd-more-item')) controller.close({ restoreFocus: true });
        else if (!target?.closest?.('[data-card-menu]')) controller.close();
    }, true);
    return controller;
}
