import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, applyTheme, ensureDrawTheme, mountThemeSwitch,
    normalizeTheme, readStoredTheme, writeStoredTheme } from '../theme-switch.js';

const shared = name => new URL(`../${name}`, import.meta.url);
const pages = ['../../providers/novelai/novel-draw.html', '../../providers/sd-webui/sd-draw.html', '../../providers/comfyui/comfy-draw.html'];
function memoryStorage() {
    const data = new Map();
    return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
function page(storage = memoryStorage(), light = true) {
    const { window, document } = parseHTML('<html data-theme="host-theme"><body><header class="app-header"><div class="header-logo"><i class="fa-palette"></i></div><button class="header-close">x</button></header><div class="nd-controls"><button class="nd-settings-btn">settings</button></div></body></html>');
    const events = document.createElement('div');
    const mediaEvents = document.createElement('div');
    const media = { matches: light, addEventListener: (...args) => mediaEvents.addEventListener(...args) };
    const view = { document, localStorage: storage, CustomEvent: window.CustomEvent,
        matchMedia: () => media, addEventListener: (...args) => events.addEventListener(...args) };
    view.parent = view;
    Object.defineProperty(document, 'defaultView', { value: view });
    const control = mountThemeSwitch({ document });
    return { document, view, control, storage,
        changeSystem(value) { media.matches = value; mediaEvents.dispatchEvent(new window.Event('change')); },
        storageEvent(key, storageArea = storage) {
            events.dispatchEvent(Object.assign(new window.Event('storage'), { key, storageArea }));
        } };
}
function attachFrame(parent, child) {
    const frame = parent.document.createElement('iframe');
    Object.defineProperties(frame, { contentDocument: { value: child.document }, contentWindow: { value: child.view } });
    parent.document.body.appendChild(frame);
    child.view.parent = parent.view;
}

test('persistence retains explicit light/dark choices; absent, invalid and blocked storage are safe', () => {
    const storage = memoryStorage();
    for (const value of [undefined, null, '', 'auto', 'LIGHT', 3]) assert.equal(normalizeTheme(value), 'system');
    for (const value of ['light', 'dark']) {
        assert.equal(writeStoredTheme(storage, value), true);
        assert.equal(readStoredTheme(storage), value);
    }
    writeStoredTheme(storage, 'system');
    assert.equal(storage.getItem(THEME_STORAGE_KEY), null);
    const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
    assert.equal(readStoredTheme(blocked), 'system');
    assert.equal(writeStoredTheme(blocked, 'dark'), false);
});

test('draw theme attributes never overwrite the host theme', () => {
    const { document } = page();
    for (const value of ['dark', 'light', 'system']) {
        applyTheme(document.documentElement, value);
        assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), value === 'system' ? null : value);
        assert.equal(document.documentElement.getAttribute('data-theme'), 'host-theme');
    }
});

test('visible moon/sun beside close directly toggles theme and keeps the logo', () => {
    const { document, control, storage } = page();
    const button = control.element;
    assert.ok(document.querySelector('.header-logo > i.fa-palette'));
    assert.equal(button.nextElementSibling, document.querySelector('.header-close'));
    assert.ok(button.querySelector('.fa-moon'));
    assert.equal(button.getAttribute('aria-label'), '切换绘图深色主题');
    button.click();
    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), 'dark');
    assert.equal(storage.getItem(THEME_STORAGE_KEY), 'dark');
    assert.ok(button.querySelector('.fa-sun'));
    button.click();
    assert.equal(control.getTheme(), 'light');
    assert.ok(button.querySelector('.fa-moon'));
    assert.equal(document.querySelector('.theme-switch-menu'), null);
});

test('floor and floating controls share one live choice and detach cleanly', () => {
    const { document, control } = page();
    const other = mountThemeSwitch({ document, container: document.querySelector('.nd-controls') });
    other.element.click();
    assert.equal(control.getTheme(), 'dark');
    assert.ok(control.element.querySelector('.fa-sun'));
    assert.equal(other.element.nextElementSibling, document.querySelector('.nd-settings-btn'));
    const oldButton = other.element;
    other.destroy();
    assert.equal(oldButton.isConnected, false);
    oldButton.click();
    assert.equal(control.getTheme(), 'dark');
    control.element.click();
    assert.equal(control.getTheme(), 'light');
    assert.ok(oldButton.querySelector('.fa-sun'), 'removed controls no longer subscribe');
});

test('settings iframe and host synchronize both ways, even with unavailable storage', () => {
    const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
    const host = page(blocked);
    const settings = page(blocked);
    const sibling = page(blocked);
    attachFrame(host, settings);
    attachFrame(host, sibling);
    settings.control.element.click();
    for (const env of [host, settings, sibling]) {
        assert.equal(env.control.getTheme(), 'dark');
        assert.equal(env.document.documentElement.getAttribute('data-theme'), 'host-theme');
    }
    host.control.element.click();
    for (const env of [host, settings, sibling]) assert.equal(env.control.getTheme(), 'light');
});

test('a newly opened iframe inherits the current host choice before mounting', () => {
    const host = page();
    host.control.setTheme('dark');
    const { document } = parseHTML('<html><body></body></html>');
    Object.defineProperty(document, 'defaultView', { value: { parent: host.view, addEventListener() {} } });
    const runtime = ensureDrawTheme({ document, storage: null });
    assert.equal(runtime.getTheme(), 'dark');
    assert.equal(document.documentElement.getAttribute(THEME_ATTRIBUTE), 'dark');
});

test('system changes update the action icon, but explicit choices stay fixed; other tabs sync', () => {
    const env = page();
    env.changeSystem(false);
    assert.ok(env.control.element.querySelector('.fa-sun'));
    env.control.element.click();
    assert.equal(env.control.getTheme(), 'light');
    env.changeSystem(false);
    assert.ok(env.control.element.querySelector('.fa-moon'));
    env.storage.setItem(THEME_STORAGE_KEY, 'dark');
    env.storageEvent('unrelated');
    assert.equal(env.control.getTheme(), 'light');
    env.storageEvent(THEME_STORAGE_KEY, memoryStorage());
    assert.equal(env.control.getTheme(), 'light');
    env.storageEvent(THEME_STORAGE_KEY);
    assert.equal(env.control.getTheme(), 'dark');
    env.storage.removeItem(THEME_STORAGE_KEY);
    env.storageEvent(null);
    assert.equal(env.control.getTheme(), 'system');
});

test('theme boot uses the same draw-owned attribute and runs before all settings styles', () => {
    for (const value of ['light', 'dark', null, 'invalid']) {
        const attributes = new Map();
        vm.runInNewContext(readFileSync(shared('theme-boot.js'), 'utf8'), {
            window: { localStorage: { getItem: () => value } },
            document: { documentElement: { setAttribute: (key, val) => attributes.set(key, val) } },
        });
        assert.equal(attributes.get(THEME_ATTRIBUTE), value === 'light' || value === 'dark' ? value : undefined);
        assert.equal(attributes.has('data-theme'), false);
    }
    for (const relative of pages) {
        const source = readFileSync(new URL(relative, import.meta.url), 'utf8');
        assert.ok(source.indexOf('theme-boot.js') < source.indexOf('settings-shell.css'));
        const { document } = parseHTML(source);
        assert.ok(document.querySelector('.app-header .header-close'));
        assert.ok(document.querySelector('.header-logo > i'));
    }
    assert.match(readFileSync(shared('settings-page.js'), 'utf8'), /mountThemeSwitch\(\{ document \}\)/);
    assert.match(readFileSync(shared('draw-visuals.js'), 'utf8'), /ensureDrawTheme\(\{ document \}\)/);
    const icons = readFileSync(shared('settings-icons.css'), 'utf8');
    for (const name of ['fa-sun', 'fa-moon']) assert.match(icons, new RegExp(`\\.${name}\\b[^{}]*\\{[^}]*--draw-icon`));
});
