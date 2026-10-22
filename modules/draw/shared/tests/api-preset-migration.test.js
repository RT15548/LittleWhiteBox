import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

// Acceptance: each provider must persist its existing single API configuration
// as an active preset exactly once. A failed migration must not overwrite stored
// credentials or allow the provider to continue with an unsaved configuration.
// Cost: persisted credentials loss or using the wrong API endpoint.
const host = {};
globalThis.__apiPresetMigrationTest = host;
const promptStub = 'exports.DEFAULT_PROMPT_CONFIG={topSystem:"fixture",topSystemPov:"fixture",sceneRules:"fixture"};exports.PROMPT_TEMPLATE_VERSION=1;exports.getLoadedTagGuide=()=>"";exports.normalizeNovelPromptGuideOverrides=()=>({});';
const stubs = {
    'novel-prompts.js': promptStub, 'sd-prompts.js': promptStub, 'comfy-prompts.js': promptStub,
    'extensions.js': 'exports.getContext=()=>({chat:[],characters:[]});',
    'script.js': 'exports.getRequestHeaders=()=>({});',
    'utils.js': 'exports.uuidv4=()=>"fixture-id";',
    'user.js': 'exports.getCurrentUserHandle=()=>"fixture-user";',
    'event-manager.js': 'exports.createModuleEvents=()=>({});exports.event_types={};',
    'server-storage.js': 'const s=globalThis.__apiPresetMigrationTest.storage;exports.SdDrawStorage=s;exports.ComfyDrawStorage=s;exports.NovelDrawStorage=s;',
    'gallery-cache.js': 'module.exports={};', 'scene-planner.js': 'module.exports={};',
    'worldbook-processor.js': 'module.exports={};', 'draw-agent.js': 'module.exports={};',
    'draw-common.js': 'exports.DEFAULT_MESSAGE_FILTER_RULES=[];', 'after-ai-gate.js': 'module.exports={};',
    'iframe-messaging.js': 'exports.postToIframe=()=>{};',
};
let instance = 0;

for (const [provider, file, config] of [
    ['novelai', 'novel-draw', { apiKey: 'fixture-key', apiBaseUrl: 'https://nai.invalid', sendMode: 'backend', insecureTLS: true, useImageBackendJobs: true, timeout: 120000, requestDelay: { min: 8000, max: 9000 } }],
    ['sd-webui', 'sd-draw', { host: 'https://sd.invalid', auth: 'fixture-auth', timeout: 120000, useImageBackendJobs: true }],
    ['comfyui', 'comfy-draw', { host: 'https://comfy.invalid', auth: 'fixture-auth', connectionMode: 'direct', timeout: 120000, useImageBackendJobs: true }],
]) {
    test(`${provider}: single config migration persists once and a failed save remains retryable`, async t => {
        const previous = { document: globalThis.document, window: globalThis.window, toastr: globalThis.toastr };
        const { document, window } = parseHTML('<html><body></body></html>');
        Object.assign(globalThis, { document, window, toastr: { info() {}, error() {}, success() {} } });
        t.after(() => Object.assign(globalThis, previous));
        let stored = null, writes = 0, fail = false;
        host.storage = {
            getStrict: async () => structuredClone(stored),
            setAndSave: async (_, value) => {
                writes++;
                if (fail) return false;
                stored = structuredClone(value);
                return true;
            },
        };
        const result = await build({
            stdin: { resolveDir: fileURLToPath(new URL(`../../providers/${provider}/`, import.meta.url)), contents: `export {loadSettings} from './${file}.js';` },
            bundle: true, write: false, format: 'esm', platform: 'node',
            plugins: [{ name: 'offline-api-migration', setup(builder) {
                builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                    const name = path.split('/').at(-1);
                    return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
                });
                builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
            } }],
        });
        // eslint-disable-next-line no-unsanitized/method -- Only local source and fixed offline stubs enter the module.
        const reopen = () => import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text + `\n//# sourceURL=api-migration-${provider}-${++instance}.mjs`).toString('base64')}`);
        // Start from current non-API settings so unrelated upgrades cannot mask
        // whether adding the first API preset itself triggers persistence.
        await (await reopen()).loadSettings();
        Object.assign(stored, config);
        delete stored.apiPresets;
        delete stored.activeApiPresetId;
        const original = structuredClone(stored);
        writes = 0;
        const api = await reopen();
        fail = true;
        await assert.rejects(api.loadSettings());
        assert.deepEqual(stored, original);
        fail = false;
        const migrated = await api.loadSettings();
        assert.equal(writes, 2);
        assert.equal(migrated.apiPresets.length, 1);
        const active = migrated.apiPresets.find(preset => preset.id === migrated.activeApiPresetId);
        assert.ok(active);
        for (const [key, value] of Object.entries(active.config)) assert.deepEqual(value, migrated[key], key);
        for (const [key, value] of Object.entries(config)) {
            assert.deepEqual(migrated[key], value, key);
            assert.deepEqual(active.config[key], value, key);
        }
        assert.deepEqual(stored.apiPresets, migrated.apiPresets);
        assert.equal(stored.activeApiPresetId, migrated.activeApiPresetId);
        writes = 0;
        const reloaded = await (await reopen()).loadSettings();
        assert.deepEqual(reloaded.apiPresets, migrated.apiPresets);
        assert.equal(writes, 0);
    });
}
