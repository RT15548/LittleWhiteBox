// One draw-owned theme for settings iframes, floor controls and floating controls.
// Never set the host's data-theme or its native control color-scheme.
export const THEME_STORAGE_KEY = 'xb-draw-theme';
export const THEME_ATTRIBUTE = 'data-draw-theme';
const THEME_EVENT = 'xb-draw-theme-change';
const runtimes = new WeakMap();

export function normalizeTheme(value) {
    return value === 'light' || value === 'dark' ? value : 'system';
}

function defaultStorage(document) {
    try { return document?.defaultView?.localStorage ?? null; }
    catch { return null; }
}

export function readStoredTheme(storage) {
    try { return normalizeTheme(storage?.getItem(THEME_STORAGE_KEY)); }
    catch { return 'system'; }
}

export function writeStoredTheme(storage, value) {
    try {
        const choice = normalizeTheme(value);
        if (choice === 'system') storage?.removeItem(THEME_STORAGE_KEY);
        else storage?.setItem(THEME_STORAGE_KEY, choice);
        return true;
    } catch { return false; }
}

export function applyTheme(root, value) {
    const choice = normalizeTheme(value);
    if (choice === 'system') root?.removeAttribute(THEME_ATTRIBUTE);
    else root?.setAttribute(THEME_ATTRIBUTE, choice);
    return choice;
}

// Immediate same-origin frame sync also works when localStorage is unavailable.
// Cross-origin frames are left alone; native storage events handle other tabs.
function broadcastTheme(view, value, visited = new Set()) {
    if (!view || visited.has(view)) return;
    visited.add(view);
    try {
        const document = view.document;
        document.dispatchEvent(new view.CustomEvent(THEME_EVENT, { detail: value }));
        for (const frame of document.querySelectorAll('iframe')) {
            if (frame.contentDocument) broadcastTheme(frame.contentWindow, value, visited);
        }
        if (view.parent !== view && view.parent?.document) broadcastTheme(view.parent, value, visited);
    } catch {
        // A cross-origin or closing frame is not a drawing theme owner.
        return;
    }
}

export function ensureDrawTheme({ document, storage = defaultStorage(document) } = {}) {
    if (runtimes.has(document)) return runtimes.get(document);
    const view = document.defaultView;
    const media = view?.matchMedia?.('(prefers-color-scheme: light)');
    const listeners = new Set();
    let current = readStoredTheme(storage);
    // A newly opened settings frame inherits the live host choice even if storage is blocked.
    try {
        if (view?.parent !== view) {
            const inherited = view?.parent?.document?.documentElement?.getAttribute(THEME_ATTRIBUTE);
            if (inherited === 'light' || inherited === 'dark') current = inherited;
        }
    } catch {
        // Standalone / cross-origin embedding uses its own stored choice.
        current = readStoredTheme(storage);
    }
    const effectiveTheme = () => current === 'system' ? (media?.matches ? 'light' : 'dark') : current;
    const notify = () => { for (const listener of listeners) listener(effectiveTheme()); };
    const receive = value => {
        current = applyTheme(document.documentElement, value);
        notify();
    };
    document.addEventListener(THEME_EVENT, event => receive(event.detail));
    view?.addEventListener('storage', event => {
        if ((event.key === THEME_STORAGE_KEY || event.key === null)
            && (!event.storageArea || event.storageArea === storage)) {
            receive(readStoredTheme(storage));
        }
    });
    if (media?.addEventListener) media.addEventListener('change', notify);
    else media?.addListener?.(notify);
    const runtime = {
        getTheme: () => current,
        effectiveTheme,
        setTheme(value) {
            const choice = normalizeTheme(value);
            writeStoredTheme(storage, choice);
            receive(choice);
            broadcastTheme(view, choice);
            return choice;
        },
        subscribe(listener) {
            listeners.add(listener);
            listener(effectiveTheme());
            return () => listeners.delete(listener);
        },
    };
    applyTheme(document.documentElement, current);
    runtimes.set(document, runtime);
    return runtime;
}

// Visible moon / sun, one click switches light <-> dark. The logo remains a logo.
export function mountThemeSwitch({ document, storage = defaultStorage(document), container = document?.querySelector('.app-header') } = {}) {
    if (!container) return null;
    const runtime = ensureDrawTheme({ document, storage });
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'draw-theme-toggle';
    button.setAttribute('data-role', 'theme-switch');
    const icon = document.createElement('i');
    icon.setAttribute('aria-hidden', 'true');
    button.appendChild(icon);
    const unsubscribe = runtime.subscribe(theme => {
        const dark = theme === 'dark';
        icon.className = `draw-icon fa-solid fa-${dark ? 'sun' : 'moon'}`;
        const action = `切换绘图${dark ? '浅色' : '深色'}主题`;
        button.title = `${action}（界面、楼层、悬浮按钮）`;
        button.setAttribute('aria-label', action);
    });
    const toggle = event => {
        event.stopPropagation();
        runtime.setTheme(runtime.effectiveTheme() === 'dark' ? 'light' : 'dark');
    };
    button.addEventListener('click', toggle);
    container.insertBefore(button, container.querySelector('.header-close, .nd-settings-btn'));
    return {
        element: button,
        getTheme: runtime.getTheme,
        setTheme: runtime.setTheme,
        destroy() {
            unsubscribe();
            button.removeEventListener('click', toggle);
            button.remove();
        },
    };
}
