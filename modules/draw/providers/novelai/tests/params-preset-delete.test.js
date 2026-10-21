import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

// Acceptance (persisted settings / paid generation): deleting another preset
// keeps the active parameters; deleting the active preset selects its neighbor;
// a failed save leaves both the presets and the active parameters unchanged.
const host = {};
globalThis.__paramsPresetDeleteTest = host;
const stubs = {
    'novel-prompts.js': 'exports.DEFAULT_PROMPT_CONFIG={topSystem:"fixture",topSystemPov:"fixture",sceneRules:"fixture"};exports.PROMPT_TEMPLATE_VERSION=1;exports.normalizeNovelPromptGuideOverrides=()=>({});',
    'extensions.js': 'exports.getContext=()=>({chat:[],characters:[]});',
    'script.js': 'exports.getRequestHeaders=()=>({});',
    'utils.js': 'exports.uuidv4=()=>"fixture-id";',
    'user.js': 'exports.getCurrentUserHandle=()=>"fixture-user";',
    'event-manager.js': 'exports.createModuleEvents=()=>({});exports.event_types={};',
    'server-storage.js': 'exports.NovelDrawStorage=globalThis.__paramsPresetDeleteTest.storage;',
    'gallery-cache.js': 'module.exports={};',
    'scene-planner.js': 'module.exports={};',
    'worldbook-processor.js': 'module.exports={};',
    'draw-agent.js': 'module.exports={};',
    'draw-common.js': 'exports.DEFAULT_MESSAGE_FILTER_RULES=[];',
    'after-ai-gate.js': 'module.exports={};',
    'iframe-messaging.js': 'exports.isTrustedMessage=()=>true;exports.postToIframe=(_,message)=>globalThis.__paramsPresetDeleteTest.messages.push(message);',
    'floating-panel.js': 'exports.refreshPresetSelect=()=>{};',
};
const providerPath = fileURLToPath(new URL('../novel-draw.js', import.meta.url));
const bundle = await build({
    entryPoints: [providerPath], bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'offline-settings-boundaries', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
        // Expose the actual message handler in this test bundle only. Its delete
        // logic, normalization, settings queue and generation selector stay real.
        builder.onLoad({ filter: /[\\/]novel-draw\.js$/ }, async ({ path }) => ({
            contents: `${await readFile(path, 'utf8')}\nexport { handleFrameMessage };`, loader: 'js',
        }));
    } }],
});

async function fixture(t, selected, fails = false) {
    const { document, window } = parseHTML('<html><body><iframe id="xiaobaix-novel-draw-iframe"></iframe></body></html>');
    const previous = { document: globalThis.document, window: globalThis.window };
    Object.assign(globalThis, { document, window });
    t.after(() => Object.assign(globalThis, previous));
    let stored = {};
    let failSave = false;
    host.messages = [];
    host.storage = {
        getStrict: async (key, fallback) => stored[key] ?? fallback,
        setAndSave: async (key, value) => { stored[key] = structuredClone(value); return true; },
        async updateAndSave(mutator) {
            const draft = structuredClone(stored);
            await mutator(draft);
            if (failSave) return false;
            stored = draft;
            return true;
        },
    };
    // eslint-disable-next-line no-unsanitized/method -- Only local source and fixed offline stubs enter this module.
    const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + `\n//# sourceURL=params-delete-${selected}-${fails}.mjs`).toString('base64')}`);
    await api.loadSettings();
    await api.updateSettingsPersistent(settings => {
        const base = settings.paramsPresets[0];
        settings.paramsPresets = ['A', 'B', 'C'].map((id, index) => ({ ...base, id, name: id, params: { ...base.params, steps: 20 + index } }));
        settings.selectedParamsPresetId = selected;
    }, '', { notify: false });
    failSave = fails;
    return { api, stored: () => stored.settings };
}

for (const [selected, deleted, expected] of [['A', 'B', 'A'], ['B', 'B', 'C'], ['C', 'C', 'B']]) {
    test(`deleting ${deleted} while ${selected} is active leaves ${expected} active`, async t => {
        const h = await fixture(t, selected);
        await h.api.handleFrameMessage({ data: { type: 'DEL_PARAMS_PRESET', presetId: deleted } });
        assert.deepEqual(h.stored().paramsPresets.map(preset => preset.id), ['A', 'B', 'C'].filter(id => id !== deleted));
        assert.equal(h.stored().selectedParamsPresetId, expected);
        assert.equal(h.api.getActiveParamsPreset().id, expected);
        assert.equal(h.api.getActiveParamsPreset().params.steps, 20 + ['A', 'B', 'C'].indexOf(expected));
    });
}

test('failed deletion preserves stored presets and active generation parameters', async t => {
    const h = await fixture(t, 'A', true);
    const before = structuredClone(h.stored());
    await h.api.handleFrameMessage({ data: { type: 'DEL_PARAMS_PRESET', presetId: 'B' } });
    assert.deepEqual(h.stored(), before);
    assert.deepEqual(h.api.getSettings().paramsPresets, before.paramsPresets);
    assert.equal(h.api.getActiveParamsPreset().id, 'A');
    assert.equal(host.messages.at(-1).state, 'error');
});
