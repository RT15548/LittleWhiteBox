// 绘图设置页（NovelAI / SD WebUI / ComfyUI 共用外壳）的主题开关：跟随系统（默认）/ 浅色 / 深色。
// 入口是页头最左边的 Logo 图标：点它弹出三项小菜单（当前项打勾），选择写进 localStorage（三个页面同一个键）并立即生效。
// 生效方式：<html data-theme="light|dark"> 强制其中一种，没有这个属性就是跟随系统；样式见 settings-shell.css。
// 首次绘制前的预置由 theme-boot.js 完成（避免闪一下系统主题）；本模块负责读写、切换和菜单。
// 不依赖酒馆宿主模块，DOM 与存储都可注入，便于测试。

export const THEME_STORAGE_KEY = 'xb-draw-theme';
export const THEME_ATTRIBUTE = 'data-theme';

export const THEME_CHOICES = Object.freeze([
    Object.freeze({ value: 'system', label: '跟随系统', icon: 'fa-circle-half-stroke' }),
    Object.freeze({ value: 'light', label: '浅色', icon: 'fa-sun' }),
    Object.freeze({ value: 'dark', label: '深色', icon: 'fa-moon' }),
]);

/** 任何不认识的取值都当作“跟随系统”。 */
export function normalizeTheme(value) {
    return value === 'light' || value === 'dark' ? value : 'system';
}

function choiceOf(value) {
    const choice = normalizeTheme(value);
    return THEME_CHOICES.find(item => item.value === choice);
}

/** 悬停提示 / 无障碍名称，例如“主题：跟随系统”。 */
export function describeTheme(value) {
    return `主题：${choiceOf(value).label}`;
}

function defaultStorage(document) {
    try {
        return document?.defaultView?.localStorage ?? null;
    } catch {
        return null; // 访问 localStorage 本身就可能抛错（隐私模式 / 禁用站点数据）
    }
}

/** 读保存的选择；存储不可用或没有记录都得到“跟随系统”。 */
export function readStoredTheme(storage) {
    try {
        return normalizeTheme(storage?.getItem(THEME_STORAGE_KEY));
    } catch {
        return 'system';
    }
}

/** 保存选择（“跟随系统”直接删掉记录）；存储不可用时静默放弃，只在本次页面内生效。 */
export function writeStoredTheme(storage, value) {
    const choice = normalizeTheme(value);
    try {
        if (choice === 'system') storage?.removeItem(THEME_STORAGE_KEY);
        else storage?.setItem(THEME_STORAGE_KEY, choice);
        return true;
    } catch {
        return false;
    }
}

/** 把选择落到 <html>：浅色 / 深色写属性，跟随系统去掉属性。 */
export function applyTheme(root, value) {
    const choice = normalizeTheme(value);
    if (!root) return choice;
    if (choice === 'system') root.removeAttribute(THEME_ATTRIBUTE);
    else root.setAttribute(THEME_ATTRIBUTE, choice);
    return choice;
}

function create(document, tag, { className, text, attrs } = {}, children = []) {
    const node = document.createElement(tag);
    if (className) node.setAttribute('class', className);
    if (text !== undefined) node.textContent = text;
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
    for (const child of children) node.appendChild(child);
    return node;
}

const icon = (document, name, extraClass = '') => create(document, 'i', {
    className: `fa-solid ${name}${extraClass ? ` ${extraClass}` : ''}`,
    attrs: { 'aria-hidden': 'true' },
});

/**
 * 把页头 Logo 图标变成主题开关。找不到 .header-logo 的图标时什么也不做（返回 null）。
 * @param {object} options
 * @param {Document} options.document
 * @param {Storage|null} [options.storage] 缺省取 window.localStorage（不可用时只在本次页面内生效）
 * @param {string} [options.logoSelector] Logo 图标的选择器
 */
export function mountThemeSwitch({ document, storage = defaultStorage(document), logoSelector = '.header-logo > i' } = {}) {
    const logoIcon = document?.querySelector(logoSelector);
    if (!logoIcon) return null;
    const root = document.documentElement;
    let current = applyTheme(root, readStoredTheme(storage));
    let open = false;
    const listeners = [];

    const markIcon = icon(document, choiceOf(current).icon);
    const mark = create(document, 'span', { className: 'theme-switch-mark' }, [markIcon]);
    const button = create(document, 'button', {
        className: 'theme-switch-button',
        attrs: { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'data-role': 'theme-switch' },
    });
    const menu = create(document, 'div', { className: 'theme-switch-menu', attrs: { role: 'menu', hidden: '' } });
    const items = THEME_CHOICES.map(choice => create(document, 'button', {
        className: 'theme-switch-item',
        attrs: { type: 'button', role: 'menuitemradio', 'aria-checked': 'false', 'data-theme-choice': choice.value },
    }, [
        icon(document, choice.icon),
        create(document, 'span', { className: 'theme-switch-label', text: choice.label }),
        icon(document, 'fa-check', 'theme-switch-check'),
    ]));
    for (const item of items) menu.appendChild(item);

    // 原来的 Logo 图标挪进按钮里，视觉位置不变；悬停 / 键盘聚焦 / 菜单展开时右下角冒出当前主题的小标记。
    const wrap = create(document, 'span', { className: 'theme-switch' });
    logoIcon.replaceWith(wrap);
    button.append(logoIcon, mark);
    wrap.append(button, menu);

    function refresh() {
        const text = describeTheme(current);
        button.setAttribute('title', text);
        button.setAttribute('aria-label', text);
        markIcon.setAttribute('class', `fa-solid ${choiceOf(current).icon}`);
        for (const item of items) item.setAttribute('aria-checked', String(item.getAttribute('data-theme-choice') === current));
    }

    function setOpen(next, { focus = null } = {}) {
        open = Boolean(next);
        button.setAttribute('aria-expanded', String(open));
        if (open) menu.removeAttribute('hidden');
        else menu.setAttribute('hidden', '');
        wrap.classList.toggle('open', open);
        if (focus === 'current') items.find(item => item.getAttribute('aria-checked') === 'true')?.focus?.();
        else if (focus === 'button') button.focus?.();
    }

    function setTheme(value) {
        current = applyTheme(root, value);
        writeStoredTheme(storage, current);
        refresh();
        return current;
    }

    function on(target, type, handler, capture) {
        target.addEventListener(type, handler, capture);
        listeners.push(() => target.removeEventListener(type, handler, capture));
    }

    on(button, 'click', () => setOpen(!open, { focus: open ? null : 'current' }));
    on(button, 'keydown', (event) => {
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault?.();
        setOpen(true, { focus: 'current' });
    });
    for (const item of items) {
        on(item, 'click', () => {
            setTheme(item.getAttribute('data-theme-choice'));
            setOpen(false, { focus: 'button' });
        });
    }
    // 菜单展开时：Esc 只关菜单（捕获阶段拦下，不再传给“Esc 关闭面板”）；方向键在三项间移动；Tab 走出就关。
    on(document, 'keydown', (event) => {
        if (!open) return;
        if (event.key === 'Escape') {
            event.preventDefault?.();
            event.stopPropagation?.();
            setOpen(false, { focus: 'button' });
            return;
        }
        if (event.key === 'Tab') {
            setOpen(false);
            return;
        }
        const index = items.indexOf(event.target?.closest?.('[role="menuitemradio"]'));
        const move = (to) => { event.preventDefault?.(); items[(to + items.length) % items.length]?.focus?.(); };
        if (event.key === 'ArrowDown') move(index + 1);
        else if (event.key === 'ArrowUp') move(index < 0 ? items.length - 1 : index - 1);
        else if (event.key === 'Home') move(0);
        else if (event.key === 'End') move(items.length - 1);
    }, true);
    on(document, 'pointerdown', (event) => {
        if (open && !wrap.contains(event.target)) setOpen(false);
    }, true);

    refresh();
    return {
        element: wrap,
        getTheme: () => current,
        setTheme,
        isOpen: () => open,
        closeMenu: () => setOpen(false),
        destroy() {
            for (const remove of listeners.splice(0)) remove();
        },
    };
}
