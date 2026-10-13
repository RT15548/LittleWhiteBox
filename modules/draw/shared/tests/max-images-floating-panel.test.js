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
            export const updateSettingsPersistent=async(mutator,okText)=>{mutator(globalThis.__maxImages.settings);globalThis.__maxImages.saves++;globalThis.__maxImages.okTexts.push(okText);return true;};
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

async function settle() {
    for (let turn = 0; turn < 10; turn++) await setImmediate();
}

for (const provider of Object.keys(providerFixtures)) test(`${provider} menu has a number input that writes overrideMaxImages`, async t => {
    const api = await buildPanel(provider);
    const { document, window } = parseHTML('<html><head></head><body><div class="mes" mesid="0"></div></body></html>');
    Object.assign(globalThis, { document, window, indexedDB, BroadcastChannel: undefined });
    window.innerWidth = 800; window.innerHeight = 600;
    window.HTMLElement.prototype.getBoundingClientRect = () => ({ left: 0, top: 0, bottom: 40 });
    const preset = { id: 'p', name: 'P', maxImages: 2 };
    const harness = globalThis.__maxImages = {
        saves: 0,
        okTexts: [],
        settings: {
            showFloorButton: true, showFloatingButton: true, overrideSize: 'default',
            selectedPresetId: 'p', presets: [preset],
            selectedParamsPresetId: 'p', paramsPresets: [preset],
        },
    };
    const warnings = [];
    globalThis.toastr = { warning: m => warnings.push(m), error() {}, info() {}, success() {} };

    api.initFloatingPanel();
    const title = providerFixtures[provider].title;
    api[`ensure${title}DrawPanel`](document.querySelector('.mes'), 0, { force: true });
    t.after(() => api.destroyFloatingPanel());

    const inputs = [...document.querySelectorAll('.nd-max-images-input')];
    assert.equal(inputs.length, 2, 'floor menu and global floating menu each have one');
    assert.equal(document.querySelectorAll('.nd-max-images-select').length, 0, 'no dropdown any more');
    const resets = inputs.map(input => input.parentNode.querySelector('.nd-max-images-reset'));
    const fire = (el, type, props = {}) => {
        const event = new window.Event(type, { bubbles: true, cancelable: true });
        Object.assign(event, props);
        el.dispatchEvent(event);
    };
    const type = (input, value, eventType = 'input') => { input.value = value; fire(input, eventType); };

    for (const [index, input] of inputs.entries()) {
        const row = input.closest('.nd-row');
        assert.equal(row.querySelector('.nd-label').textContent, '数目');
        assert.equal(input.getAttribute('type'), 'number');
        assert.equal(input.getAttribute('min'), '0');
        assert.equal(input.getAttribute('max'), '20');
        assert.equal(input.getAttribute('step'), '1');
        assert.equal(input.getAttribute('placeholder'), '跟随预设');
        assert.equal(input.getAttribute('title'), '留空 = 跟随预设（当前预设：2 张）；0 = 不指定');
        assert.equal(input.value, '');
        assert.equal(resets[index].getAttribute('title'), '跟随预设');
        assert.ok(resets[index].hasAttribute('hidden'), 'reset only shows with an override');
        const card = row.parentNode;
        const rows = [...card.children];
        assert.ok(card.querySelector('.nd-size-select'), 'row sits in the same card as 尺寸');
        assert.ok(rows.indexOf(row) > rows.indexOf(card.querySelector('.nd-size-select').closest('.nd-row')), 'after 尺寸');
    }

    t.mock.timers.enable({ apis: ['setTimeout'] });

    // Typing is debounced: nothing is saved until the delay passes, then every menu reflects it.
    type(inputs[0], '5');
    t.mock.timers.tick(349);
    await settle();
    assert.equal(harness.saves, 0);
    t.mock.timers.tick(1);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 5);
    assert.equal(harness.saves, 1);
    assert.equal(harness.okTexts.at(-1), '出图数目已设为 5');
    for (const [index, input] of inputs.entries()) {
        assert.equal(input.value, '5');
        assert.ok(!resets[index].hasAttribute('hidden'));
    }

    // Spinner clicks fire input + change repeatedly: one save for the last value.
    for (const value of ['6', '7', '8']) { type(inputs[1], value); fire(inputs[1], 'change'); t.mock.timers.tick(100); }
    await settle();
    assert.equal(harness.saves, 1);
    t.mock.timers.tick(350);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 8);
    assert.equal(harness.saves, 2, 'a burst of steps saves once');
    assert.equal(inputs[0].value, '8');

    // Enter commits immediately; blur afterwards does not save again.
    type(inputs[0], '9');
    fire(inputs[0], 'keydown', { key: 'Enter' });
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 9);
    assert.equal(harness.saves, 3);
    fire(inputs[0], 'blur');
    await settle();
    assert.equal(harness.saves, 3);

    // Invalid values are rejected on commit: restored, warned, never written.
    const rejected = [['-1', 'keydown'], ['25', 'keydown'], ['-3', 'blur'], ['2.5', 'blur'], ['abc', 'blur']];
    for (const [index, [text, how]] of rejected.entries()) {
        const input = inputs[index % 2];
        const before = harness.saves;
        input.value = text;
        if (how === 'keydown') fire(input, 'keydown', { key: 'Enter' });
        else fire(input, how);
        await settle();
        assert.equal(harness.settings.overrideMaxImages, 9, text);
        assert.equal(harness.saves, before, text);
        assert.equal(input.value, '9', `${text} snaps back`);
        assert.equal(warnings.length, index + 1, text);
        assert.equal(warnings.at(-1), '出图数目需为 0–20 的整数（0 = 不指定，留空 = 跟随预设）');
    }
    // Unparsable text in a real number input reads as '' with validity.badInput.
    Object.defineProperty(inputs[0], 'validity', { value: { badInput: true }, configurable: true });
    inputs[0].value = '';
    fire(inputs[0], 'blur');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 9);
    assert.equal(warnings.length, rejected.length + 1);
    delete inputs[0].validity;
    inputs[0].value = '9';

    // Intermediate invalid text while typing is not warned about by the input debounce.
    const warned = warnings.length;
    type(inputs[0], '25');
    t.mock.timers.tick(400);
    await settle();
    assert.equal(warnings.length, warned);
    assert.equal(harness.settings.overrideMaxImages, 9);
    inputs[0].value = '9';

    // A focused input keeps what the user is typing when another menu changes the value.
    Object.defineProperty(document, 'activeElement', { get: () => inputs[0], configurable: true });
    inputs[0].value = '1';
    type(inputs[1], '12');
    t.mock.timers.tick(350);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 12);
    assert.equal(inputs[0].value, '1', 'focused input is not overwritten');
    assert.equal(inputs[1].value, '12');
    delete document.activeElement;

    // Expanding the floor menu re-reads the current value.
    harness.settings.overrideMaxImages = 7;
    document.querySelector('.nd-btn-menu').dispatchEvent(new window.Event('click', { bubbles: true }));
    assert.equal(inputs[0].value, '7');
    assert.equal(inputs[1].value, '12', 'global menu refreshes when it is expanded');

    // Clearing the input clears the override.
    type(inputs[1], '', 'change');
    t.mock.timers.tick(350);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, null);
    assert.equal(harness.okTexts.at(-1), '出图数目：跟随预设');
    for (const [index, input] of inputs.entries()) {
        assert.equal(input.value, '');
        assert.ok(resets[index].hasAttribute('hidden'));
    }

    // The reset button clears the override right away and leaves other settings alone.
    type(inputs[0], '4');
    fire(inputs[0], 'keydown', { key: 'Enter' });
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 4);
    fire(resets[1], 'click');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, null);
    assert.equal(harness.settings.overrideSize, 'default');
    for (const input of inputs) assert.equal(input.value, '');

    // 0 = override to "unspecified": a real value, distinct from empty, and it beats the preset (maxImages 2).
    type(inputs[0], '0');
    fire(inputs[0], 'keydown', { key: 'Enter' });
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 0, '0 is stored as 0');
    assert.notEqual(harness.settings.overrideMaxImages, null, '0 is not treated as empty');
    assert.equal(harness.okTexts.at(-1), '出图数目已设为 不指定');
    for (const [index, input] of inputs.entries()) {
        assert.equal(input.value, '0', 'shows "0", not empty');
        assert.ok(!resets[index].hasAttribute('hidden'), 'reset is visible with a 0 override');
    }
    // Re-reading the settings keeps showing 0.
    for (const input of inputs) input.value = '';
    api.updateAllMaxImagesInputs();
    for (const input of inputs) assert.equal(input.value, '0');
    // Same 0 committed from the other menu / blur: no extra save and never cleared.
    const savesAtZero = harness.saves;
    type(inputs[1], '0', 'change');
    t.mock.timers.tick(350);
    await settle();
    fire(inputs[0], 'blur');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 0);
    assert.equal(harness.saves, savesAtZero, 'unchanged 0 is not saved again');
    // 0 -> 3 -> 0 through the debounce path.
    type(inputs[1], '3');
    t.mock.timers.tick(350);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 3);
    type(inputs[1], '0');
    t.mock.timers.tick(350);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 0);
    // Emptying the input after a 0 override clears it (empty !== 0).
    type(inputs[0], '', 'change');
    t.mock.timers.tick(350);
    await settle();
    assert.equal(harness.settings.overrideMaxImages, null);
    assert.equal(harness.okTexts.at(-1), '出图数目：跟随预设');
    for (const [index, input] of inputs.entries()) {
        assert.equal(input.value, '');
        assert.ok(resets[index].hasAttribute('hidden'));
    }
    // The reset button clears a 0 override back to "follow preset".
    type(inputs[0], '0');
    fire(inputs[0], 'keydown', { key: 'Enter' });
    await settle();
    assert.equal(harness.settings.overrideMaxImages, 0);
    fire(resets[1], 'click');
    await settle();
    assert.equal(harness.settings.overrideMaxImages, null);
    for (const input of inputs) assert.equal(input.value, '');
});
