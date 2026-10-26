// 绘图设置页的主题预置：在 <head> 里作为普通脚本同步执行，首次绘制之前就把已保存的“浅色 / 深色”写到 <html data-draw-theme>，页面不会先闪一下系统主题。
// 没有保存（或选了“跟随系统”）就什么都不做：没有 data-draw-theme 属性即跟随系统（见 settings-shell.css）。
// 存储键与取值必须和 theme-switch.js 保持一致（theme-switch.test.js 校验）；这里不能 import，所以单独写成一小段自包含脚本。
(function applyStoredDrawTheme() {
    try {
        var saved = window.localStorage.getItem('xb-draw-theme');
        if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-draw-theme', saved);
    } catch (error) {
        // 存储被禁用或不可访问：保持跟随系统。
        void error;
    }
})();
