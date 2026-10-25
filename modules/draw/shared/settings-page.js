import './draw-usage.js';
import { createEditGuard, installPanelEscape } from './panel-escape.js';
import { mountThemeSwitch } from './theme-switch.js';

const PLANNER_RETRY_HINT = '场景分析失败时自动重试，填 0 关闭。不重试出图。重试会增加 API 消耗。';
document.querySelectorAll('[data-planner-retry-hint]').forEach(element => {
    element.textContent = PLANNER_RETRY_HINT;
});

document.addEventListener('click', event => {
    if (event.target.closest('.nav-item, .mobile-nav-item')) window.scrollTo(0, 0);
});

// 原生键盘操作复用各后端已有的导航点击入口，不另存当前页面。
document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target.closest('.nav-item, .mobile-nav-item');
    if (!target) return;
    event.preventDefault();
    target.click();
});

// 页头最左边的 Logo 图标就是主题开关（跟随系统 / 浅色 / 深色），三个后端页面共用。
mountThemeSwitch({ document });

// Esc 等同点页头 ✕ 关闭面板；菜单 / 对话框 / 拖拽开着、或有改过未保存的角色编辑卡时先保存再关（规则见 panel-escape.js）。
const editGuard = createEditGuard({ document });
installPanelEscape({
    document,
    close: () => document.querySelector('.header-close')?.click(),
    hasUnsavedEdit: () => editGuard.hasUnsavedEdit(),
    flush: () => editGuard.flush(),
});
