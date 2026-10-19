import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { setImmediate as nextTurn } from 'node:timers/promises';
import test from 'node:test';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { MAX_IMAGES_INPUT_CLASS, MAX_IMAGES_INPUT_DEBOUNCE_MS } from '../max-images-input.js';

// Run the real DOM control into each real Provider's settings queue. Only host,
// rendering and storage I/O are substituted; no queue is reimplemented here.
const host = {};
globalThis.__maxImagesProviderTest = host;
const promptStub = 'exports.DEFAULT_PROMPT_CONFIG={topSystem:"fixture",topSystemPov:"fixture",sceneRules:"fixture"};exports.PROMPT_TEMPLATE_VERSION=1;exports.getLoadedTagGuide=()=>"";exports.normalizeNovelPromptGuideOverrides=()=>({});';
const stubs = {
    'novel-prompts.js': promptStub,
    'sd-prompts.js': promptStub,
    'comfy-prompts.js': promptStub,
    'extensions.js': 'exports.getContext=()=>({chat:[],characters:[]});',
    'script.js': 'exports.getRequestHeaders=()=>({});',
    'utils.js': 'exports.uuidv4=()=>"fixture-id";',
    'user.js': 'exports.getCurrentUserHandle=()=>"fixture-user";',
    'event-manager.js': 'exports.createModuleEvents=()=>({});exports.event_types={};',
    'server-storage.js': 'const storage=globalThis.__maxImagesProviderTest.storage;exports.SdDrawStorage=storage;exports.ComfyDrawStorage=storage;exports.NovelDrawStorage=storage;',
    'gallery-cache.js': 'module.exports={};',
    'scene-planner.js': 'module.exports={};',
    'worldbook-processor.js': 'module.exports={};',
    'draw-agent.js': 'module.exports={};',
    'draw-common.js': 'exports.DEFAULT_MESSAGE_FILTER_RULES=[];',
    'after-ai-gate.js': 'module.exports={};',
    'iframe-messaging.js': 'exports.postToIframe=()=>{};',
    'message-toolbar.js': 'exports.registerToToolbar=(_,panel)=>{document.body.append(panel);return true;};exports.removeFromToolbar=(_,panel)=>panel.remove();',
    'draw-run-controls.js': 'exports.captureDrawCancellationTarget=()=>null;exports.getPendingDrawWorkState=async()=>null;',
};

for (const [provider, file, panel] of [['novelai', 'novel-draw', 'Novel'], ['sd-webui', 'sd-draw', 'Sd'], ['comfyui', 'comfy-draw', 'Comfy']]) {
    test(`${provider}: actual control submissions reach storage as 5, 8, 10 during a slow save`, async t => {
        const { document, window } = parseHTML('<html><body></body></html>');
        const previous = { document: globalThis.document, window: globalThis.window, toastr: globalThis.toastr };
        Object.assign(globalThis, { document, window, toastr: { success() {}, error() {}, info() {} } });
        let api;
        t.after(() => {
            try { api?.destroyFloatingPanel(); }
            finally { Object.assign(globalThis, previous); }
        });
        const firstStarted = Promise.withResolvers(), firstRelease = Promise.withResolvers(), allSaved = Promise.withResolvers();
        let recording = false;
        const saves = [];
        const root = {};
        const persist = async (key, value) => {
            if (recording) {
                saves.push(value.overrideMaxImages);
                if (saves.length === 1) { firstStarted.resolve(); await firstRelease.promise; }
            }
            root[key] = structuredClone(value);
            if (saves.length === 3) allSaved.resolve();
            return true;
        };
        host.storage = {
            getStrict: async (key, fallback) => root[key] ?? fallback,
            setAndSave: persist,
            async updateAndSave(mutator) {
                const draft = structuredClone(root);
                await mutator(draft);
                return persist('settings', draft.settings);
            },
        };
        const bundle = await build({
            stdin: { resolveDir: fileURLToPath(new URL(`../../providers/${provider}/`, import.meta.url)),
                contents: `export { loadSettings, getSettings, updateSettingsPersistent } from './${file}.js';
                    export { ensure${panel}DrawPanel as mountPanel, destroyFloatingPanel } from './floating-panel.js';` },
            bundle: true, write: false, format: 'esm', platform: 'node',
            plugins: [{ name: 'offline-settings-boundaries', setup(builder) {
                builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                    const name = path.split('/').at(-1);
                    return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
                });
                builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
            } }],
        });
        // eslint-disable-next-line no-unsanitized/method -- Only local source and fixed offline test stubs enter the module.
        api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + `\n//# sourceURL=max-images-${provider}-test.mjs`).toString('base64')}`);
        await api.loadSettings();
        await api.updateSettingsPersistent(settings => { settings.overrideMaxImages = 2; }, '', { notify: false });
        recording = true;
        const inputs = Array.from({ length: 2 }, (_, index) => {
            const mounted = api.mountPanel(document.createElement('div'), index, { force: true });
            return mounted.root.querySelector(`.${MAX_IMAGES_INPUT_CLASS}`);
        });
        t.after(() => firstRelease.resolve());
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const submit = (index, value) => {
            inputs[index].value = String(value);
            inputs[index].dispatchEvent(new window.Event('input'));
            t.mock.timers.tick(MAX_IMAGES_INPUT_DEBOUNCE_MS);
        };
        submit(0, 5);
        await firstStarted.promise;
        submit(0, 8);
        submit(1, 10);
        inputs[0].dispatchEvent(new window.Event('blur'));
        firstRelease.resolve();
        await allSaved.promise;
        await nextTurn();
        assert.deepEqual(saves, [5, 8, 10]);
        assert.equal(api.getSettings().overrideMaxImages, 10);
        assert.equal(root[provider === 'novelai' ? 'settings' : 'config'].overrideMaxImages, 10);
        assert.deepEqual(inputs.map(input => input.value), ['10', '10']);
    });
}
