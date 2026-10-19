import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { build } from 'esbuild';
import { IDBFactory } from 'fake-indexeddb';
import { parseHTML } from 'linkedom';

// Provider integration contract: both menus persist the same override without
// editing the parameter preset, and removing a menu cancels its unsubmitted edit.
// Only host / provider persistence boundaries are substituted, not menu behavior.
const providers = [
    { folder: 'novelai', name: 'novel', title: 'Novel' },
    { folder: 'sd-webui', name: 'sd', title: 'Sd' },
    { folder: 'comfyui', name: 'comfy', title: 'Comfy' },
];
async function buildPanel({ folder, name }) {
    const stubs = {
        'extensions.js': 'export const getContext=()=>globalThis.__maxImages.ctx;',
        'script.js': 'export const getRequestHeaders=()=>({});',
        'user.js': 'export const getCurrentUserHandle=()=>"fixture";',
        [`${name}-draw.js`]: `export const openNovelDrawSettings=()=>{};export const openSettings=()=>{};
            export const generateAndInsertImages=()=>{throw new Error("Unexpected image submission");};
            export const getSettings=()=>globalThis.__maxImages.settings;
            export const updateSettingsPersistent=async(mutator)=>{mutator(globalThis.__maxImages.settings);globalThis.__maxImages.saves++;return true;};
            export const findLastAIMessageId=()=>0;
            export const getGenerationState=()=>null;export const abortGeneration=()=>{};`,
        'message-toolbar.js': `export const registerToToolbar=(_id,node)=>{document.querySelector('.mes').append(node);return true;};
            export const removeFromToolbar=(_id,node)=>node.remove();`,
        'draw-common.js': 'export const formatScenePlannerProgress=()=>"";',
        'draw-run-production.js': 'export const isDrawRunPendingError=()=>false;',
    };
    const bundle = await build({ stdin: { resolveDir: fileURLToPath(new URL('..', import.meta.url)), contents: `
        export * from '../providers/${folder}/floating-panel.js';` }, bundle: true, write: false, format: 'esm', platform: 'node',
        plugins: [{ name: 'host', setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const key = path.split('/').at(-1);
                return stubs[key] ? { path: key, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Fixed local production bundle, no external code.
    return import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text + `\n//# sourceURL=max-images-${name}.mjs`).toString('base64'));
}
async function settle() {
    for (let turn = 0; turn < 10; turn++) await setImmediate();
}

for (const provider of providers) test(`${provider.folder}: floor and global menus share an override without changing the preset`, async t => {
    const api = await buildPanel(provider);
    const { document, window } = parseHTML('<html><head></head><body><div class="mes" mesid="0"></div></body></html>');
    const storage = new Map();
    Object.assign(globalThis, { document, window, indexedDB: new IDBFactory(), BroadcastChannel: undefined,
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) },
    });
    window.innerWidth = 800; window.innerHeight = 600;
    window.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, bottom: 40 });
    const preset = { id: 'p', name: 'P', maxImages: 2 };
    const harness = globalThis.__maxImages = {
        ctx: { chatId: 'max-images', chat: [{ mes: 'hi', swipe_id: 0 }] },
        saves: 0,
        settings: { showFloorButton: true, showFloatingButton: true, overrideSize: 'default',
            selectedPresetId: 'p', presets: [preset], selectedParamsPresetId: 'p', paramsPresets: [preset] },
    };
    globalThis.toastr = { warning() {}, error() {}, info() {}, success() {} };
    api.initFloatingPanel();
    api[`ensure${provider.title}DrawPanel`](document.querySelector('.mes'), 0, { force: true });
    t.after(() => api.destroyFloatingPanel());
    const inputs = [...document.querySelectorAll('.nd-max-images-input')];
    assert.equal(inputs.length, 2);
    const fire = (el, type, props = {}) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, props); el.dispatchEvent(event);
    };
    const type = (input, value) => { input.value = value; fire(input, 'input'); };
    t.mock.timers.enable({ apis: ['setTimeout'] });
    for (const value of ['4', '5', '6']) { type(inputs[0], value); t.mock.timers.tick(100); }
    assert.equal(harness.saves, 0);
    t.mock.timers.tick(350); await settle();
    assert.equal(harness.saves, 1);
    assert.equal(harness.settings.overrideMaxImages, 6);
    for (const input of inputs) assert.equal(input.value, '6');

    type(inputs[1], '0'); fire(inputs[1], 'keydown', { key: 'Enter' }); await settle();
    fire(inputs[1], 'blur'); await settle();
    assert.equal(harness.saves, 2);
    assert.equal(harness.settings.overrideMaxImages, 0);
    for (const input of inputs) assert.equal(input.value, '0');

    fire(inputs[0].parentNode.querySelector('.nd-max-images-reset'), 'click'); await settle();
    assert.equal(harness.settings.overrideMaxImages, null);
    for (const input of inputs) assert.equal(input.value, '');
    assert.equal(preset.maxImages, 2);
    assert.equal(harness.settings.overrideSize, 'default');

    const saves = harness.saves;
    type(inputs[0], '7'); type(inputs[1], '9');
    api.destroyFloatingPanel();
    t.mock.timers.tick(350); await settle();
    assert.equal(harness.saves, saves);
});
