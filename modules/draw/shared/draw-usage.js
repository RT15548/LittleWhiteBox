const DRAW_USAGE = '消息楼层按钮的 🎨 为对应消息生成配图。也可直接在楼层正文中使用 [img:tags]。';

for (const root of document.querySelectorAll('[data-draw-usage]')) {
    root.textContent = DRAW_USAGE;
}
