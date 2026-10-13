import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';
import { parseHTML } from 'linkedom';
import { providerFixtures } from './fixtures/provider-runtime-fixture.mjs';

// Production floating panel DOM/events; only host and provider boundaries are replaced.
// Settings live in an in-memory object, so nothing touches user storage.
async function buildPanel(provider) {
    const { folder, name } = providerFixtures[provider];
    const stubs = {
        'extensions.js': 'export const getContext=()=>({chatId:"max-images",chat:[{mes:"hi",swipe_id:0}]});',
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
    return import('data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64'));
}

function change(select, value) {
    // linkedom's select.value is read-only; choose the option the way a user pick would.
    for (const option of select.querySelectorAll('option')) {
        if (option.value === value) option.setAttribute('selected', '');
        else option.removeAttribute('selected');
    }
    select.dispatchEvent(new select.ownerDocument.defaultView.Event('change', { bubbles: true }));
}

async function settle() {
    for (let turn = 0; turn < 10; turn++) await setImmediate();
}

const labels = (select) => [...select.querySelectorAll('option')].map(o => o.textContent);

for (const provider of Object.keys(providerFixtures)) test(`${provider} menu has a max-images row that writes overrideMaxImages`, async t => {
    const api = await buildPanel(provider);
    const { document, window } = parseHTML('<html><head></head><body><div class="mes" mesid="0"></div></body></html>');
    Object.assign(globalThis, { document, window, indexedDB, BroadcastChannel: undefined });
    window.innerWidth = 800; window.innerHeight = 600;
    window.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, bottom: 40 });
    const harness = globalThis.__maxImages = {
        saves: 0,
        settings: { showFloorButton: true, showFloatingButton: true, overrideSize: 'default', selectedPresetId: 'p', presets: [{ id: 'p', name: 'P' }] },
    };
    const warnings = [];
    globalThis.toastr = { warning: m => warnings.push(m), error() {}, info() {} };
    const prompts = [];
    let promptAnswer = null;
    window.prompt = (message, fallback) => { prompts.push({ message, fallback }); return promptAnswer; };

    api.initFloatingPanel();
    const title = providerFixtures[provider].title;
    api[`ensure${title}DrawPanel`](document.querySelector('.mes'), 0, { force: true });
    t.after(() => api.destroyFloatingPanel());

    const selects = [...document.querySelectorAll('.nd-max-images-select')];
    assert.equal(selects.length, 2, 'floor menu and global floating menu each have one');
    for (const select of selects) {
        const row = select.closest('.nd-row');
        assert.equal(row.querySelector('.nd-label').textContent, '数目');
        assert.ok(row.parentNode.querySelector('.nd-size-select'), 'row sits in the same card as 尺寸');
        assert.deepEqual(labels(select), ['跟随预设', '3', '5', '7', '自定义…']);
        assert.equal(select.value, 'default');
    }

    // Quick value: stored, and every mounted menu reflects it.
    change(selects[0], '5');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 5);
    for (const select of selects) assert.equal(select.value, '5');

    // Custom: prompt, store, show the custom value everywhere.
    promptAnswer = '4';
    change(selects[1], 'custom');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 4);
    assert.equal(prompts.length, 1);
    for (const select of selects) {
        assert.deepEqual(labels(select), ['跟随预设', '3', '5', '7', '自定义（4）', '自定义…']);
        assert.equal(select.value, '4');
    }

    // Cancel and invalid input keep the old value; invalid warns.
    promptAnswer = null;
    change(selects[0], 'custom');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 4);
    assert.equal(selects[0].value, '4', 'select snaps back to the stored value');
    assert.deepEqual(warnings, []);
    promptAnswer = '99';
    change(selects[0], 'custom');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 4);
    assert.equal(warnings.length, 1);

    // Follow preset clears the override and nothing else in settings changes.
    change(selects[0], 'default');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, null);
    assert.equal(harness.settings.overrideSize, 'default');
    for (const select of selects) assert.equal(select.value, 'default');
});
