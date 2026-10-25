// 记住设置页上次打开的页签（NovelAI / SD WebUI / ComfyUI 共用）：存在 localStorage，每个后端一个键 `xb-draw-last-tab:<后端>`，
// 命名与 theme-switch.js 的 `xb-draw-theme` 同一风格。存储不可用（隐私模式 / 被禁用）时读写都静默失败，页面照常用默认页签。
// 打开时的优先级：打开方明确指定的页签 > 上次记住的（必须仍然存在）> 默认页签。

export const LAST_TAB_KEY_PREFIX = 'xb-draw-last-tab:';

const keyOf = provider => `${LAST_TAB_KEY_PREFIX}${provider}`;

function resolveStorage(storage) {
    if (storage !== undefined) return storage;
    try {
        return globalThis.localStorage ?? null;
    } catch {
        return null; // 访问 localStorage 本身就可能抛错
    }
}

/** 切换页签时记一笔；存储满了或被禁用时这次不记（返回 false），不影响使用。 */
export function saveLastTab(provider, tab, { storage } = {}) {
    try {
        resolveStorage(storage)?.setItem(keyOf(provider), String(tab));
        return true;
    } catch {
        return false;
    }
}

/** 读出记住的页签；没有、读不了、或已经不在 tabs 里时返回 null。 */
export function readLastTab(provider, tabs, { storage } = {}) {
    try {
        const saved = resolveStorage(storage)?.getItem(keyOf(provider));
        return tabs.includes(saved) ? saved : null;
    } catch {
        return null;
    }
}

/**
 * 打开设置页时该显示哪个页签。
 * @param {object} options
 * @param {string} options.provider 'novelai' | 'sd' | 'comfy'
 * @param {string[]} options.tabs 当前存在的页签 id
 * @param {string} [options.requested] 打开方明确指定的页签（有效就一定用它）
 * @param {string} [options.fallback] 默认页签，缺省取 tabs[0]
 * @param {Storage|null} [options.storage]
 */
export function resolveInitialTab({ provider, tabs, requested, fallback = tabs[0], storage } = {}) {
    if (tabs.includes(requested)) return requested;
    return readLastTab(provider, tabs, { storage }) ?? fallback;
}
