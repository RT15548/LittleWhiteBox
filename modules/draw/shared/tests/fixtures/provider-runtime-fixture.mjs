import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { build } from 'esbuild';

export const providerFixtures = {
    sdwebui: { folder: 'sd-webui', name: 'sd', title: 'Sd' },
    comfyui: { folder: 'comfyui', name: 'comfy', title: 'Comfy' },
    novelai: { folder: 'novelai', name: 'novel', title: 'Novel' },
};

// Production provider, compiler, executor, queue, gallery and native tag session.
// Only host I/O, planner responses and the optional capsule shell are replaced.
// Settings are injected into this in-memory test bundle, never user storage.
export async function buildProviderFixture(provider, { platform = 'node', realHost = false } = {}) {
    const { folder, name, title } = providerFixtures[provider];
    const stubs = {
        'extensions.js': 'export const getContext=()=>globalThis.__review.ctx; export const extension_settings={};',
        'user.js': 'export const getCurrentUserHandle=()=>globalThis.__review.owner ?? "fixture";',
        'script.js': 'export const getRequestHeaders=()=>({});export const syncMesToSwipe=()=>{};export const messageFormatting=x=>globalThis.__review.format?.(x)??x;',
        'utils.js': 'export const uuidv4=()=>crypto.randomUUID();export const saveBase64AsFile=()=>{throw new Error("unexpected upload");};',
        'event-manager.js': `export const event_types=new Proxy({},{get:(_,k)=>k});
            export const createModuleEvents=()=>{const own=[];return {on(k,fn){const h=globalThis.__review;
            const a=h.events.get(k)||[];a.push(fn);h.events.set(k,a);own.push([k,fn]);},cleanup(){
            for(const [k,fn]of own)globalThis.__review.events.set(k,(globalThis.__review.events.get(k)||[]).filter(x=>x!==fn));}}};`,
        'server-storage.js': 'export const SdDrawStorage={getStrict:async()=>null,setAndSave:async()=>true};export const NovelDrawStorage=SdDrawStorage;export const ComfyDrawStorage=SdDrawStorage;',
        'constants.js': 'export const extensionFolderPath="fixture";',
        'draw-agent.js': 'export const getLastDrawAgentDiagnostic=()=>null;export const executeDrawAgent=()=>{throw new Error("unexpected model");};',
        'agent-settings-surface.js': 'export const attachDrawAgentSettingsSurface=()=>{};',
        'scene-planner.js': 'export class ScenePlannerError extends Error {} export const generateAndParseScenePlan=async()=>[{scene:"fixture",placement:{mode:"append"}}];export const prepareScenePlannerInput=()=>{};',
        [`${name}-prompts.js`]: `export const DEFAULT_PROMPT_CONFIG={};export const PROMPT_TEMPLATE_VERSION=1;
            export const SD_PLANNER_PROFILE={};export const COMFY_PLANNER_PROFILE={};
            export const getLoadedTagGuide=()=>"";export const getLoadedTagGuideById=()=>"";
            export const getEffectiveNovelModelGuide=()=>"";export const getNovelPlannerProfile=()=>({});
            export const normalizeNovelPromptGuideOverrides=x=>x;export const getPromptChainPreview=()=>{};
            export const loadPromptTemplates=async()=>true;export const loadTagGuide=async()=>true;`,
        'floating-panel.js': `export const ensure${title}DrawPanel=()=>{};export const destroy${title}DrawPanels=()=>{};
            export const initFloatingPanel=()=>{};export const refreshDrawRunUiState=()=>{};
            export const setStateForMessage=(id,state,data)=>globalThis.__review.states.push({id,state,data});`,
        'cloud-presets.js': 'export const openCloudPresetsModal=()=>{};export const downloadPresetAsFile=()=>{};export const parsePresetData=()=>{};export const destroyCloudPresets=()=>{};',
        'iframe-messaging.js': 'export const postToIframe=()=>{};export const isTrustedMessage=()=>false;',
        'after-ai-gate.js': 'export const initAfterAiGate=()=>{};export const notifyAfterAiHint=()=>{};export const registerAfterAiHandler=()=>()=>{};',
        'debug-core.js': 'export const xbLog={error:console.error,warn:console.warn,info(){}};',
        'generate-interceptor.js': 'export const GENERATE_INTERCEPTOR_ORDER={};export const registerGenerateInterceptor=()=>{};export const unregisterGenerateInterceptor=()=>{};',
    };
    if (realHost) for (const key of ['extensions.js', 'script.js', 'utils.js', 'user.js', 'event-manager.js', 'floating-panel.js']) delete stubs[key];
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
    const bundle = await build({ stdin: { resolveDir: root, contents: `
        export * from '../providers/${folder}/${name}-draw.js';
        export * from './prepared-chat-images.js';
        export * from './gallery-cache.js';
        export * from './chat-message-images.js';
        export * from './chat-message-image-markup.js';
        export * from './image-card-actions.js';
        export * from './pending-image-jobs.js';
        export * from './draw-cancellation-journal.js';
        export * from './draw-work-cancellation.js';
        export * from './image-job-recovery-runtime.js';
        export * from './backend-image-jobs.js';
        export * from './draw-common.js';` }, bundle: true, write: false, format: 'esm', platform,
        footer: { js: '//# sourceURL=production-provider-fixture.mjs' },
        plugins: [{ name: 'host-boundaries', setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path, importer }) => {
                if (importer.includes('node_modules')) return;
                const key = path.split('/').at(-1);
                if (realHost && ['script.js', 'extensions.js', 'utils.js', 'user.js'].includes(key)) return {
                    path: key === 'script.js' ? '/script.js' : `/scripts/${key}`, external: true,
                };
                return stubs[key] ? { path: key, namespace: 'fixture' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: stubs[path] }));
            builder.onLoad({ filter: new RegExp(`${name}-draw\\.js$`) }, async ({ path }) => ({
                contents: await readFile(path, 'utf8') + `\nexport function configureFixtureSettings(value){settingsCache=value;settingsLoaded=true;}
                    export { runPrepared${title}Slots };`, resolveDir: dirname(path),
            }));
        } }],
    });
    return bundle.outputFiles[0].text;
}

export function fixtureProviderSettings(provider) {
    const common = { mode: 'manual', showFloorButton: false, showFloatingButton: false,
        promptPresets: [{ id: 'fixture', topSystem: '', sceneRules: '', tagGuide: '' }], selectedPromptPresetId: 'fixture' };
    if (provider === 'novelai') return { ...common, apiKey: 'fixture', apiBaseUrl: 'https://supplier.invalid',
        sendMode: 'frontend', requestDelay: { min: 1, max: 1 }, characterTags: [],
        paramsPresets: [{ id: 'fixture', params: { model: 'nai-diffusion-4-5-full', width: 832, height: 1216,
            sampler: 'k_euler_ancestral', scheduler: 'karras', steps: 28, scale: 5, seed: 1 } }],
        selectedParamsPresetId: 'fixture', promptPrefix: '', negativePrompt: '', autoLearnCharacters: false };
    return { ...common, host: 'https://supplier.invalid', connectionMode: 'direct', requestDelay: 0,
        presets: [{ id: 'fixture', model: 'fixture', sampler_name: 'Euler', sampler: 'euler', scheduler: 'normal',
            width: 512, height: 512, steps: 20, cfg_scale: 7, cfg: 7, seed: 1 }], selectedPresetId: 'fixture', defaultParams: {} };
}

export const fixturePng = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0h0AAAAASUVORK5CYII=';

export function supplierResponse(provider, url, body = {}) {
    if (provider === 'sdwebui') return Response.json({ images: [fixturePng] });
    if (provider === 'novelai' || url.includes('/view')) return new Response(Uint8Array.from(atob(fixturePng), c => c.charCodeAt(0)),
        { headers: { 'Content-Type': 'image/png' } });
    if (url.includes('/prompt')) return Response.json({ prompt_id: 'fixture', client_id: body.client_id });
    if (url.includes('/history')) return Response.json({ fixture: { status: { completed: true, status_str: 'success' },
        outputs: { '9': { images: [{ filename: 'fixture.png', subfolder: '', type: 'output' }] } } } });
    throw new Error('Unexpected supplier endpoint: ' + url);
}
