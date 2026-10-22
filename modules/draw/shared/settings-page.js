import './draw-usage.js';

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
