// 就地改名：标题是一个看起来像加粗文字的 <input class="inline-name">（样式见 settings-shell.css），悬停 / 聚焦才露出输入框，
// 点一下就能改；Enter 或失焦提交，Esc 还原。预设行、分组头、条目 / 形态头共用这一套，不再有“重命名”菜单项和 prompt 弹窗。
// 事件委托在 container 上，行被整体重绘后无需重新绑定。提交只在名字真的变了时发生：
// 空名字、没改、或 onCommit 返回 false（调用方拒绝了，例如重名）都把输入框还原成原名。
// 输入框不拦截任何指针事件：拖动手柄只认自己的选择器，行点击 / 折叠头点击用 INLINE_NAME_SELECTOR 把它排除即可。

export const INLINE_NAME_SELECTOR = '.inline-name';

/**
 * @param {Element} container
 * @param {object} options
 * @param {function(HTMLInputElement, string, string): (boolean|void)} options.onCommit (输入框, 新名字（已 trim）, 原名)；返回 false 表示拒绝并还原
 * @param {string} [options.selector] 改名输入框的选择器
 * @returns {function(): void} 解除绑定
 */
export function bindInlineRename(container, { onCommit, selector = INLINE_NAME_SELECTOR } = {}) {
    const inputOf = event => {
        const input = event.target?.closest?.(selector);
        return input && container.contains(input) ? input : null;
    };
    const onFocusIn = (event) => {
        const input = inputOf(event);
        if (input) input.dataset.baseline = input.value;
    };
    const onKeyDown = (event) => {
        const input = inputOf(event);
        if (!input || event.isComposing) return;
        if (event.key === 'Enter') {
            event.preventDefault();
            input.blur();
        } else if (event.key === 'Escape') {
            // 只还原这一个输入框：别让同一次 Esc 再去关面板。
            event.preventDefault();
            event.stopPropagation();
            input.value = input.dataset.baseline ?? input.value;
            input.blur();
        }
    };
    const onFocusOut = (event) => {
        const input = inputOf(event);
        if (!input) return;
        const from = input.dataset.baseline ?? input.value;
        delete input.dataset.baseline;
        const name = input.value.trim();
        input.value = from;
        if (!name || name === from) return;
        input.value = name;
        if (onCommit(input, name, from) === false) input.value = from;
    };
    container.addEventListener('focusin', onFocusIn);
    container.addEventListener('focusout', onFocusOut);
    container.addEventListener('keydown', onKeyDown);
    return () => {
        container.removeEventListener('focusin', onFocusIn);
        container.removeEventListener('focusout', onFocusOut);
        container.removeEventListener('keydown', onKeyDown);
    };
}
