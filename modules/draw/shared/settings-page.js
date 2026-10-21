import './draw-usage.js';

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
