const DRAW_USAGE = '使用消息上的绘图按钮生成配图，也可在正文中使用 [img:tags]。';

for (const root of document.querySelectorAll('[data-draw-usage]')) {
    root.textContent = DRAW_USAGE;
}
