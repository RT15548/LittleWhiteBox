import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parseHTML } from 'linkedom';
import {
    THEME_CHOICES, THEME_STORAGE_KEY, applyTheme, describeTheme, mountThemeSwitch, normalizeTheme, readStoredTheme, writeStoredTheme,
} from '../theme-switch.js';

// Acceptance contracts (cost: a chosen theme not sticking across the three draw pages, a flash of the wrong theme on open, the logo losing its place in the header):
// - 跟随系统 (default) / 浅色 / 深色 are stored under one localStorage key shared by the NovelAI, SD WebUI and ComfyUI pages; 跟随系统 stores nothing.
// - Light / dark land on <html data-theme>; system removes the attribute. Blocked storage never throws and the choice still applies for this page.
// - The header logo icon is the control: same place, tooltip / aria-label 主题：<当前>, a three-item radio menu with a check on the current one; Esc / outside click close only the menu.
// - theme-boot.js applies the saved choice before first paint and uses the same key and values.

const shared = name => new URL(`../${name}`, import.meta.url);
const pages = ['../../providers/novelai/novel-draw.html', '../../providers/sd-webui/sd-draw.html', '../../providers/comfyui/comfy-draw.html'];

function memoryStorage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        getItem: key => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => { data.set(key, String(value)); },
        removeItem: key => { data.delete(key); },
        data,
    };
}

function mount(storage = memoryStorage()) {
    const { window, document } = parseHTML('<html><body><header class="app-header"><div class="header-logo"><i class="fa-solid fa-palette"></i><span>Novel Draw</span></div></header></body></html>');
    const control = mountThemeSwitch({ document, storage });
    const fire = (target, type, extra = {}) => {
        const event = Object.assign(new window.Event(type, { bubbles: true, cancelable: true }), extra);
        target.dispatchEvent(event);
        return event;
    };
    return { window, document, storage, control, fire, root: document.documentElement };
}

test('choices, normalisation and persistence: system stores nothing, light / dark store their name, junk and blocked storage fall back to system', () => {
    assert.deepEqual(THEME_CHOICES.map(choice => choice.value), ['system', 'light', 'dark']);
    assert.deepEqual(THEME_CHOICES.map(choice => choice.label), ['跟随系统', '浅色', '深色']);
    assert.equal(normalizeTheme('light'), 'light');
    assert.equal(normalizeTheme('dark'), 'dark');
    for (const junk of [undefined, null, '', 'auto', 'LIGHT', 3]) assert.equal(normalizeTheme(junk), 'system');
    assert.equal(describeTheme('system'), '主题：跟随系统');
    assert.equal(describeTheme('light'), '主题：浅色');
    assert.equal(describeTheme('dark'), '主题：深色');

    const storage = memoryStorage();
    assert.equal(readStoredTheme(storage), 'system');
    assert.equal(writeStoredTheme(storage, 'light'), true);
    assert.equal(storage.data.get(THEME_STORAGE_KEY), 'light');
    assert.equal(readStoredTheme(storage), 'light');
    writeStoredTheme(storage, 'dark');
    assert.equal(readStoredTheme(storage), 'dark');
    writeStoredTheme(storage, 'system');
    assert.equal(storage.data.has(THEME_STORAGE_KEY), false);
    storage.setItem(THEME_STORAGE_KEY, 'neon');
    assert.equal(readStoredTheme(storage), 'system');

    const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    assert.equal(readStoredTheme(blocked), 'system');
    assert.equal(writeStoredTheme(blocked, 'dark'), false);
    assert.equal(readStoredTheme(null), 'system');
    assert.equal(writeStoredTheme(null, 'dark'), true, 'no storage at all is not an error');
});

test('applyTheme writes data-theme for light / dark and removes it for system', () => {
    const { document } = parseHTML('<html><body></body></html>');
    const root = document.documentElement;
    assert.equal(applyTheme(root, 'dark'), 'dark');
    assert.equal(root.getAttribute('data-theme'), 'dark');
    applyTheme(root, 'light');
    assert.equal(root.getAttribute('data-theme'), 'light');
    applyTheme(root, 'system');
    assert.equal(root.hasAttribute('data-theme'), false);
    applyTheme(root, 'nonsense');
    assert.equal(root.hasAttribute('data-theme'), false);
    assert.equal(applyTheme(null, 'dark'), 'dark', 'no root is harmless');
});

test('mounting applies the saved choice and turns the logo icon into the control without moving it', () => {
    const { document, root, control } = mount(memoryStorage({ [THEME_STORAGE_KEY]: 'dark' }));
    assert.equal(root.getAttribute('data-theme'), 'dark');
    const logo = document.querySelector('.header-logo');
    assert.equal(logo.firstElementChild, control.element, 'still the first thing in the header logo');
    assert.equal(logo.children.length, 2);
    assert.equal(logo.lastElementChild.textContent, 'Novel Draw');
    const button = control.element.querySelector('button.theme-switch-button');
    assert.ok(button.querySelector('i.fa-palette'), 'the original logo icon is inside the button');
    assert.equal(button.getAttribute('title'), '主题：深色');
    assert.equal(button.getAttribute('aria-label'), '主题：深色');
    assert.equal(button.getAttribute('aria-haspopup'), 'menu');
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.ok(control.element.querySelector('.theme-switch-menu').hasAttribute('hidden'));
    assert.ok(button.querySelector('.theme-switch-mark i.fa-moon'), 'the hover mark shows the current mode');
    assert.equal(mountThemeSwitch({ document: mount().document, logoSelector: '.nope' }), null);
});

test('the menu offers 跟随系统 / 浅色 / 深色 with a check on the current one, and picking applies, stores and closes', () => {
    const { control, fire, root, storage } = mount();
    const button = control.element.querySelector('.theme-switch-button');
    const items = () => Array.from(control.element.querySelectorAll('[role="menuitemradio"]'));
    assert.equal(button.getAttribute('title'), '主题：跟随系统');
    assert.equal(root.hasAttribute('data-theme'), false);

    fire(button, 'click');
    assert.equal(control.isOpen(), true);
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.deepEqual(items().map(item => item.querySelector('.theme-switch-label').textContent), ['跟随系统', '浅色', '深色']);
    assert.deepEqual(items().map(item => item.getAttribute('aria-checked')), ['true', 'false', 'false']);

    fire(items()[1], 'click');
    assert.equal(control.isOpen(), false);
    assert.equal(root.getAttribute('data-theme'), 'light');
    assert.equal(storage.data.get(THEME_STORAGE_KEY), 'light');
    assert.equal(button.getAttribute('title'), '主题：浅色');
    assert.equal(button.getAttribute('aria-label'), '主题：浅色');
    assert.ok(button.querySelector('.theme-switch-mark i.fa-sun'));
    fire(button, 'click');
    assert.deepEqual(items().map(item => item.getAttribute('aria-checked')), ['false', 'true', 'false']);

    fire(items()[2], 'click');
    assert.equal(root.getAttribute('data-theme'), 'dark');
    assert.equal(storage.data.get(THEME_STORAGE_KEY), 'dark');
    fire(button, 'click');
    fire(items()[0], 'click');
    assert.equal(root.hasAttribute('data-theme'), false);
    assert.equal(storage.data.has(THEME_STORAGE_KEY), false, '跟随系统 clears the stored choice');
    assert.equal(button.getAttribute('title'), '主题：跟随系统');
});

test('Esc closes only the menu (and is swallowed so the panel stays), outside clicks and Tab close it', () => {
    const { control, fire, window, document } = mount();
    const button = control.element.querySelector('.theme-switch-button');
    const seenByPanel = [];
    window.addEventListener('keydown', event => { if (event.key === 'Escape') seenByPanel.push(event.key); });

    fire(button, 'click');
    const esc = fire(document.body, 'keydown', { key: 'Escape' });
    assert.equal(control.isOpen(), false);
    assert.equal(esc.defaultPrevented, true);
    assert.deepEqual(seenByPanel, [], 'the panel-level Esc handler never sees it');

    fire(button, 'click');
    assert.equal(control.isOpen(), true);
    fire(document.body, 'pointerdown');
    assert.equal(control.isOpen(), false);
    fire(button, 'click');
    fire(button, 'pointerdown');
    assert.equal(control.isOpen(), true, 'pressing the control itself is not "outside"');
    fire(document.body, 'keydown', { key: 'Tab' });
    assert.equal(control.isOpen(), false);

    // 菜单收起时 Esc 不被拦截（交给面板的 Esc 处理）
    fire(document.body, 'keydown', { key: 'Escape' });
    assert.deepEqual(seenByPanel, ['Escape']);

    fire(button, 'click');
    assert.equal(control.isOpen(), true);
    control.destroy();
    const after = fire(document.body, 'keydown', { key: 'Escape' });
    assert.equal(control.isOpen(), true, 'destroy() removes the menu key handling');
    assert.equal(after.defaultPrevented, false);
});

test('blocked storage: the choice still applies for this page without throwing', () => {
    const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
    const { control, root } = mount(blocked);
    assert.equal(root.hasAttribute('data-theme'), false);
    control.setTheme('dark');
    assert.equal(root.getAttribute('data-theme'), 'dark');
    assert.equal(control.getTheme(), 'dark');
});

function runBoot(saved, { throws = false } = {}) {
    const attributes = new Map();
    const context = {
        window: { localStorage: { getItem(key) { if (throws) throw new Error('blocked'); return key === THEME_STORAGE_KEY ? saved : null; } } },
        document: { documentElement: { setAttribute: (name, value) => attributes.set(name, value) } },
    };
    vm.runInNewContext(readFileSync(shared('theme-boot.js'), 'utf8'), context);
    return attributes;
}

test('theme-boot.js applies a saved light / dark choice before paint, with the same key as the switch; system, junk and blocked storage change nothing', () => {
    const source = readFileSync(shared('theme-boot.js'), 'utf8');
    assert.ok(source.includes(`'${THEME_STORAGE_KEY}'`), 'same storage key');
    assert.equal(runBoot('light').get('data-theme'), 'light');
    assert.equal(runBoot('dark').get('data-theme'), 'dark');
    for (const saved of [null, 'system', 'neon', '']) assert.equal(runBoot(saved).size, 0, String(saved));
    assert.equal(runBoot('dark', { throws: true }).size, 0);
});

test('all three pages load theme-boot.js synchronously before their stylesheets and have a header logo icon for the switch to take over', () => {
    for (const relative of pages) {
        const html = readFileSync(new URL(relative, import.meta.url), 'utf8');
        const head = html.slice(0, html.indexOf('</head>'));
        const boot = head.indexOf('<script src="../../shared/theme-boot.js"></script>');
        assert.ok(boot > 0, `${relative} loads the boot script`);
        assert.ok(boot < head.indexOf('settings-shell.css'), `${relative}: before the stylesheet`);
        assert.match(html, /<div class="header-logo"><i class="fa-solid [a-z-]+"><\/i><span>/, `${relative}: the logo icon is the first child of the header logo`);
    }
});

test('the shared page entry mounts the switch, and the sun / moon / half / check icons exist in the local icon sheet', () => {
    const entry = readFileSync(shared('settings-page.js'), 'utf8');
    assert.match(entry, /from '\.\/theme-switch\.js'/);
    assert.match(entry, /mountThemeSwitch\(\{ document \}\)/);
    const icons = readFileSync(shared('settings-icons.css'), 'utf8');
    for (const name of ['fa-sun', 'fa-moon', 'fa-circle-half-stroke', 'fa-check']) {
        assert.match(icons, new RegExp(`\\.${name}\\b[^{]*\\{[^}]*--draw-icon`), `${name} is defined`);
    }
});
