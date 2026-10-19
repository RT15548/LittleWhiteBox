import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

// Acceptance: the split page must persist own/group locks without losing an open
// edit, keep inherited locks distinct, and route menu actions through its real
// DOM listeners. Execute the production entry and modules; only browser/host
// boundaries are replaced. No source-text assertions or private page hooks.
let pageBundle;
async function loadPageBundle() {
    pageBundle ||= build({
        entryPoints: [fileURLToPath(new URL('../novel-draw-page.js', import.meta.url))],
        bundle: true, write: false, format: 'iife', platform: 'browser', logLevel: 'silent',
        plugins: [{ name: 'host-boundaries', setup(builder) {
            builder.onResolve({ filter: /(?:lib\.js|installation-guide\.js)$/ }, ({ path }) => ({ path, namespace: 'host' }));
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: path.endsWith('/lib.js')
                ? 'export const DOMPurify = { sanitize: value => value };'
                : 'export const mountServerPluginGuide = () => {};',
            }));
        } }],
    });
    return (await pageBundle).outputFiles[0].text;
}

async function settle() {
    for (let turn = 0; turn < 8; turn++) await setImmediate();
}

const character = (id, extra = {}) => ({
    id, name: id, enabled: true, type: 'girl', aliases: [], appearance: `${id} appearance`,
    negativeTags: '', danbooruTag: '', outfits: [], dynamicStates: [], ...extra,
});

async function fixture(t, { characters, groups = [] }) {
    const { document, window: domWindow } = parseHTML(await readFile(new URL('../novel-draw.html', import.meta.url), 'utf8'));
    const selectPrototype = domWindow.HTMLSelectElement.prototype;
    const selectValue = Object.getOwnPropertyDescriptor(selectPrototype, 'value');
    Object.defineProperty(selectPrototype, 'value', {
        configurable: true, get: selectValue.get,
        set(value) { for (const option of this.options) option.selected = option.value === String(value); },
    });
    t.after(() => Object.defineProperty(selectPrototype, 'value', selectValue));
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'loading' });
    Object.defineProperty(document, 'referrer', { configurable: true, value: 'http://host.test/' });
    const posted = [], errors = [], timers = new Set(), handlers = new Map(), stored = new Map();
    const host = { postMessage: message => posted.push(structuredClone(message)) };
    const window = {
        parent: host, location: { origin: 'http://host.test' }, innerHeight: 800, innerWidth: 1000,
        addEventListener(type, callback) { const list = handlers.get(type) || []; list.push(callback); handlers.set(type, list); },
    };
    const context = {
        document, window, URL, Blob, structuredClone,
        console: { log() {}, warn() {}, error: (...args) => errors.push(args), debug() {} },
        localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, String(value)) },
        setTimeout: (callback, ms) => { const timer = setTimeout(callback, ms); timers.add(timer); return timer; },
        clearTimeout, requestAnimationFrame: callback => context.setTimeout(callback, 0), cancelAnimationFrame: clearTimeout,
        confirm: () => true, alert: message => errors.push([message]), prompt: () => null,
        CSS: { escape: value => String(value) }, getComputedStyle: () => ({ overflowY: 'visible' }),
    };
    t.after(() => {
        for (const callback of handlers.get('beforeunload') || []) callback();
        for (const timer of timers) clearTimeout(timer);
    });
    vm.runInNewContext(await loadPageBundle(), context, { filename: 'novel-character-page.bundle.js' });
    document.dispatchEvent(new domWindow.Event('DOMContentLoaded'));
    await settle();
    assert.ok(posted.some(message => message.type === 'FRAME_READY'));
    const send = (type, payload = {}) => {
        for (const callback of handlers.get('message') || []) callback({
            origin: 'http://host.test', source: host,
            data: { source: 'LittleWhiteBox-NovelDraw', type, ...payload },
        });
    };
    send('INIT_DATA', { settings: { characterTags: characters, characterGroups: groups }, backendCopy: {} });
    assert.deepEqual(errors, []);
    const query = selector => document.querySelector(selector);
    const click = selector => {
        const node = typeof selector === 'string' ? query(selector) : selector;
        assert.ok(node, `missing action: ${selector}`);
        node.dispatchEvent(new domWindow.Event('click', { bubbles: true }));
    };
    return { document, domWindow, query, click, send, posted, errors,
        saved: () => posted.filter(message => message.type === 'SAVE_CHARACTER_TAGS').at(-1),
        card: id => query(`.char-card[data-id="${id}"]`),
        status: id => Array.from(query(`.char-card[data-id="${id}"]`).querySelectorAll('[data-character-status]'), node => node.dataset.characterStatus),
    };
}

test('split NovelAI page distinguishes own/group locks and persists menu changes', async t => {
    const h = await fixture(t, {
        characters: [character('own', { groupId: 'g', locked: true }), character('inherited', { groupId: 'g' })],
        groups: [{ id: 'g', name: 'Group', locked: true, enabled: false }],
    });
    assert.deepEqual(h.status('own'), ['group-disabled', 'own-lock', 'appearance']);
    assert.deepEqual(h.status('inherited'), ['group-disabled', 'group-lock', 'appearance']);
    const groupMenu = '[data-group-action="menu"][data-group-id="g"]';
    h.click(groupMenu);
    assert.equal(h.query(groupMenu).getAttribute('aria-expanded'), 'true');
    h.click('[data-group-action="toggle-lock"][data-group-id="g"]');
    assert.equal(h.saved().characterGroups[0].locked, undefined);
    assert.equal(h.saved().characterGroups[0].enabled, false);
    assert.deepEqual(h.status('own'), ['group-disabled', 'own-lock', 'appearance']);
    assert.deepEqual(h.status('inherited'), ['group-disabled', 'appearance']);
    h.click('[data-action="toggle-enabled"][data-id="own"]');
    assert.equal(h.saved().characterTags.find(item => item.id === 'own').enabled, false);
    assert.deepEqual(h.status('own'), ['group-disabled', 'own-lock', 'appearance']);
    h.click('[data-action="menu"][data-id="own"]');
    const menu = h.card('own').querySelector('[role="menu"]');
    assert.equal(menu.hidden, false);
    h.click('[data-action="toggle-lock"][data-id="own"]');
    assert.equal(menu.hidden, true);
    assert.equal(h.saved().characterTags.find(item => item.id === 'own').locked, undefined);
    assert.equal(h.saved().characterTags.find(item => item.id === 'own').appearance, 'own appearance');
    assert.deepEqual(h.status('own'), ['group-disabled', 'appearance']);
    assert.deepEqual(h.errors, []);
});

test('group lock repaint and character lock save preserve unsaved editing fields', async t => {
    const h = await fixture(t, {
        characters: [character('draft', { groupId: 'g' }), character('other', { groupId: 'g' })],
        groups: [{ id: 'g', name: 'Group' }],
    });
    h.click('[data-action="edit"][data-id="draft"]');
    h.card('draft').querySelector('.char-edit-name').value = 'Unsaved name';
    h.card('draft').querySelector('.char-edit-appearance').value = 'Unsaved appearance';
    h.click('[data-group-action="menu"][data-group-id="g"]');
    h.click('[data-group-action="toggle-lock"][data-group-id="g"]');
    assert.equal(h.saved().characterGroups[0].locked, true);
    assert.equal(h.saved().characterTags.find(item => item.id === 'draft').name, 'draft');
    assert.equal(h.card('draft').querySelector('.char-edit-name').value, 'Unsaved name');
    assert.equal(h.card('draft').querySelector('.char-edit-appearance').value, 'Unsaved appearance');
    h.click('[data-action="menu"][data-id="other"]');
    h.click('[data-action="toggle-lock"][data-id="other"]');
    assert.equal(h.saved().characterTags.find(item => item.id === 'other').locked, true);
    assert.equal(h.card('draft').querySelector('.char-edit-name').value, 'Unsaved name');
    h.click('[data-action="menu"][data-id="draft"]');
    h.click('[data-action="toggle-lock"][data-id="draft"]');
    assert.equal(h.saved().characterTags.find(item => item.id === 'draft').locked, true);
    assert.equal(h.saved().characterTags.find(item => item.id === 'draft').name, 'draft');
    h.click('[data-action="save"][data-id="draft"]');
    const savedDraft = h.saved().characterTags.find(item => item.id === 'draft');
    assert.equal(savedDraft.locked, true);
    assert.equal(savedDraft.name, 'Unsaved name');
    assert.equal(savedDraft.appearance, 'Unsaved appearance');
    assert.deepEqual(h.errors, []);
});

test('card menus close on outside click and repaint; duplicate action does not copy the lock', async t => {
    const h = await fixture(t, { characters: [character('source', { locked: true })] });
    h.click('[data-action="menu"][data-id="source"]');
    assert.equal(h.card('source').querySelector('[role="menu"]').hidden, false);
    h.click(h.document.body);
    assert.equal(h.card('source').querySelector('[role="menu"]').hidden, true);
    h.click('[data-action="menu"][data-id="source"]');
    h.click('[data-action="duplicate"][data-id="source"]');
    assert.equal(h.saved().characterTags.length, 2);
    assert.equal(h.saved().characterTags.find(item => item.id === 'source').locked, true);
    assert.equal(h.saved().characterTags.find(item => item.id !== 'source').locked, undefined);
    assert.equal(h.query('[aria-haspopup="menu"][aria-expanded="true"]'), null);
    assert.deepEqual(h.errors, []);
});

test('lock protection does not disable explicit character or group deletion from menus', async t => {
    const h = await fixture(t, {
        characters: [character('own', { locked: true }), character('member', { groupId: 'g' })],
        groups: [{ id: 'g', name: 'Group', locked: true }],
    });
    h.click('[data-action="menu"][data-id="own"]');
    h.click('[data-action="delete"][data-id="own"]');
    assert.equal(h.saved().characterTags.some(item => item.id === 'own'), false);
    assert.equal(h.saved().characterTags.length, 1);
    h.click('[data-group-action="menu"][data-group-id="g"]');
    h.click('[data-group-action="delete"][data-group-id="g"]');
    assert.equal(h.saved().characterTags.length, 0);
    assert.equal(h.saved().characterGroups.length, 0);
    assert.equal(h.query('[aria-haspopup="menu"][aria-expanded="true"]'), null);
    assert.deepEqual(h.errors, []);
});
