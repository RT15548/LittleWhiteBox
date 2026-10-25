import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { LAST_TAB_KEY_PREFIX, readLastTab, resolveInitialTab, saveLastTab } from '../last-tab.js';

// Acceptance contracts (cost: a settings page that always reopens on the first tab, or one that breaks / shows an empty page when storage is blocked or the remembered tab is gone):
// - Each backend remembers its own last tab under `xb-draw-last-tab:<provider>`; switching tabs writes it.
// - On open: an explicit request wins, else the remembered tab if it still exists, else the default.
// - Storage may be missing, throw on access, or throw on read / write: nothing breaks.

const TABS = ['test', 'api', 'characters', 'gallery'];
const memory = (initial = {}) => {
    const data = new Map(Object.entries(initial));
    return { data, getItem: key => (data.has(key) ? data.get(key) : null), setItem: (key, value) => { data.set(key, String(value)); } };
};
const throwing = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };

test('keys are per backend and follow the xb-draw-* style', () => {
    assert.equal(LAST_TAB_KEY_PREFIX, 'xb-draw-last-tab:');
    const storage = memory();
    saveLastTab('novelai', 'gallery', { storage });
    saveLastTab('sd', 'api', { storage });
    assert.deepEqual([...storage.data], [['xb-draw-last-tab:novelai', 'gallery'], ['xb-draw-last-tab:sd', 'api']]);
    assert.equal(readLastTab('novelai', TABS, { storage }), 'gallery');
    assert.equal(readLastTab('sd', TABS, { storage }), 'api');
    assert.equal(readLastTab('comfy', TABS, { storage }), null, 'another backend has nothing yet');
});

test('a remembered tab that no longer exists, or junk, reads as nothing', () => {
    for (const saved of ['', 'removed-tab', 'null', '__proto__']) {
        assert.equal(readLastTab('sd', TABS, { storage: memory({ 'xb-draw-last-tab:sd': saved }) }), null, JSON.stringify(saved));
    }
    assert.equal(readLastTab('sd', TABS, { storage: memory() }), null);
});

test('open priority: explicit request, then remembered, then default', () => {
    const storage = memory({ 'xb-draw-last-tab:sd': 'gallery' });
    const pick = extra => resolveInitialTab({ provider: 'sd', tabs: TABS, fallback: 'test', storage, ...extra });
    assert.equal(pick({}), 'gallery');
    assert.equal(pick({ requested: 'api' }), 'api', 'an explicit request beats the remembered tab');
    assert.equal(pick({ requested: 'nope' }), 'gallery', 'an unknown request is ignored');
    assert.equal(pick({ storage: memory() }), 'test', 'nothing remembered: default');
    assert.equal(pick({ storage: memory({ 'xb-draw-last-tab:sd': 'gone' }) }), 'test', 'remembered tab missing: default');
    assert.equal(resolveInitialTab({ provider: 'sd', tabs: TABS, storage: memory() }), 'test', 'default falls back to the first tab');
});

test('storage that is missing or throws never breaks anything', () => {
    for (const storage of [null, throwing]) {
        assert.doesNotThrow(() => saveLastTab('sd', 'api', { storage }));
        assert.equal(readLastTab('sd', TABS, { storage }), null);
        assert.equal(resolveInitialTab({ provider: 'sd', tabs: TABS, fallback: 'test', storage }), 'test');
        assert.equal(resolveInitialTab({ provider: 'sd', tabs: TABS, requested: 'api', storage }), 'api');
    }
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('denied'); } });
    try {
        assert.equal(resolveInitialTab({ provider: 'sd', tabs: TABS, fallback: 'test' }), 'test', 'accessing localStorage itself may throw');
        assert.doesNotThrow(() => saveLastTab('sd', 'api'));
    } finally {
        if (original) Object.defineProperty(globalThis, 'localStorage', original); else delete globalThis.localStorage;
    }
});

test('wiring: every backend saves on switch and opens through resolveInitialTab', () => {
    const read = file => readFileSync(new URL(file, import.meta.url), 'utf8');
    const novel = read('../../providers/novelai/novel-draw-page.js');
    assert.ok(novel.includes("saveLastTab('novelai', viewId)"));
    assert.ok(novel.includes("provider: 'novelai'"));
    for (const [file, provider, views] of [['../../providers/sd-webui/sd-draw.js', 'sd', 'SD_DRAW_VIEWS'], ['../../providers/comfyui/comfy-draw.js', 'comfy', 'COMFY_DRAW_VIEWS']]) {
        const source = read(file);
        assert.ok(source.includes(`saveLastTab('${provider}', normalized)`), `${file} saves on switch`);
        assert.ok(source.includes(`switchSettingsView(resolveInitialTab({ provider: '${provider}', tabs: ${views}, requested: view, fallback: 'test' }))`), `${file} opens on the resolved tab`);
        assert.ok(source.includes('export async function openSettings({ view } = {})'), `${file} accepts an explicit view`);
    }
});
