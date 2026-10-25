// 文本框随内容自动调整高度：一行内容只占一行，内容变多再长高，超过上限后出现滚动条。
// 角色编辑区（NovelAI 页面、SD WebUI / ComfyUI 页面）共用这一份；标记方式是文本框带 data-autofit 属性。
// 隐藏中的文本框（折叠的条目 / 分区 / 未展开的 <details>）量不出高度，会被跳过，等显示出来（见 installTextareaAutofit）再补量。

export const AUTOFIT_ATTRIBUTE = 'data-autofit';
export const AUTOFIT_SELECTOR = `textarea[${AUTOFIT_ATTRIBUTE}]`;
export const AUTOFIT_MIN_LINES = 1;
export const AUTOFIT_MAX_LINES = 8;

const FALLBACK_FONT_SIZE = 12;
const FALLBACK_LINE_HEIGHT_RATIO = 1.4;

/**
 * 纯计算：由内容高度与盒模型数据得出应设置的 CSS height，以及是否超过上限（超过就要滚动条）。
 * scrollHeight 含 padding、不含边框；boxSizing 为 border-box 时 height 含边框与 padding。
 */
export function computeAutofitHeight({
    scrollHeight, lineHeight, paddingY = 0, borderY = 0, boxSizing = 'border-box',
    minLines = AUTOFIT_MIN_LINES, maxLines = AUTOFIT_MAX_LINES,
}) {
    const chrome = boxSizing === 'border-box' ? paddingY + borderY : 0;
    const content = Math.max(0, scrollHeight - paddingY);
    const min = lineHeight * Math.max(1, minLines);
    const max = lineHeight * Math.max(minLines, maxLines);
    const clamped = Math.min(Math.max(content, min), max);
    return { height: Math.ceil(clamped + chrome), overflowing: content > max + 1 };
}

function pixels(value, fallback = 0) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function readMetrics(textarea) {
    const view = textarea.ownerDocument?.defaultView;
    const style = view?.getComputedStyle?.(textarea);
    const fontSize = pixels(style?.fontSize, FALLBACK_FONT_SIZE);
    const lineHeight = pixels(style?.lineHeight, fontSize * FALLBACK_LINE_HEIGHT_RATIO); // 'normal' 解析不出数字
    return {
        lineHeight,
        paddingY: pixels(style?.paddingTop) + pixels(style?.paddingBottom),
        borderY: pixels(style?.borderTopWidth) + pixels(style?.borderBottomWidth),
        boxSizing: style?.boxSizing || 'border-box',
    };
}

/**
 * 按内容调整一个文本框。返回 false 表示它现在量不出高度（隐藏中），什么也没改；否则返回 true。
 * 同一内容、同一宽度已经量过就直接跳过（force 除外）。
 */
export function fitTextarea(textarea, { minLines = AUTOFIT_MIN_LINES, maxLines = AUTOFIT_MAX_LINES, force = false } = {}) {
    if (!textarea?.style) return false;
    const width = textarea.clientWidth;
    if (!width) {
        delete textarea.dataset.autofitKey;
        return false;
    }
    const key = `${textarea.value.length}:${width}:${minLines}:${maxLines}`;
    if (!force && textarea.dataset.autofitKey === key && textarea.style.height) return true;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    if (!scrollHeight) {
        delete textarea.dataset.autofitKey;
        return false;
    }
    const { height, overflowing } = computeAutofitHeight({ scrollHeight, ...readMetrics(textarea), minLines, maxLines });
    textarea.style.height = `${height}px`;
    textarea.style.overflowY = overflowing ? 'auto' : 'hidden';
    textarea.dataset.autofitKey = key;
    return true;
}

/** 调整 root 里全部带 data-autofit 的文本框（root 自己也算）；隐藏中的跳过。 */
export function autofitWithin(root, options) {
    if (!root) return;
    if (root.matches?.(AUTOFIT_SELECTOR)) fitTextarea(root, options);
    root.querySelectorAll?.(AUTOFIT_SELECTOR).forEach(textarea => fitTextarea(textarea, options));
}

/**
 * 给一个容器装上自动调整：输入时重量、<details> 展开 / 聚焦时补量、容器里的内容或显示状态变化（重绘、条目 / 分区 / 形态展开）后补量、
 * 容器宽度变化后重量。返回 { refit, dispose }。需要 DOM 观察器的部分在没有 MutationObserver / ResizeObserver 的环境里自动略过。
 */
export function installTextareaAutofit(root, { view = root?.ownerDocument?.defaultView, options } = {}) {
    if (!root) return { refit() {}, dispose() {} };
    const schedule = view?.requestAnimationFrame ? callback => view.requestAnimationFrame(callback) : callback => setTimeout(callback, 0);
    let pending = false;
    const refit = () => {
        pending = false;
        autofitWithin(root, options);
    };
    const queueRefit = () => {
        if (pending) return;
        pending = true;
        schedule(refit);
    };

    const onInput = (event) => {
        if (event.target?.matches?.(AUTOFIT_SELECTOR)) fitTextarea(event.target, { ...options, force: true }); // 同长度的改动（换行、替换字符）也要重量
    };
    const onFocus = (event) => {
        if (event.target?.matches?.(AUTOFIT_SELECTOR)) fitTextarea(event.target, options);
    };
    // toggle 不冒泡：捕获阶段接 <details> 展开。
    const onToggle = (event) => {
        if (event.target?.open) autofitWithin(event.target, options);
    };
    root.addEventListener('input', onInput);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('toggle', onToggle, true);

    const MutationObserverCtor = view?.MutationObserver ?? globalThis.MutationObserver;
    const ResizeObserverCtor = view?.ResizeObserver ?? globalThis.ResizeObserver;
    const mutations = MutationObserverCtor
        ? new MutationObserverCtor(queueRefit)
        : null;
    mutations?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class', 'open'] });
    let lastWidth = root.clientWidth;
    const resizes = ResizeObserverCtor
        ? new ResizeObserverCtor(() => {
            if (root.clientWidth === lastWidth) return;
            lastWidth = root.clientWidth;
            queueRefit();
        })
        : null;
    resizes?.observe(root);

    queueRefit();
    return {
        refit,
        dispose() {
            root.removeEventListener('input', onInput);
            root.removeEventListener('focusin', onFocus);
            root.removeEventListener('toggle', onToggle, true);
            mutations?.disconnect();
            resizes?.disconnect();
        },
    };
}
