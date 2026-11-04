import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { createDrawPublicApi, validateDrawInput } from '../public-api.js';
import { MediaApiError } from '../../../../shared/media-api.js';
import { buildSdImageRequest } from '../../providers/sd-webui/compiler.js';
import { buildComfyImageRequest } from '../../providers/comfyui/compiler.js';
import { joinTags } from '../character-prompts.js';
import { compileNovelImageRequest } from '../../providers/novelai/compiler.js';
import { snapshotNovelRequestConfig, isNovelImageBackendJobEnabled } from '../../providers/novelai/novel-request-config.js';
import { isNovelV5Model } from '../../providers/novelai/novel-model-capabilities.js';
import { V5_QUALITY_IDS, V5_UC_IDS } from '../../providers/novelai/novel-v5-request.js';
import { imageBlob } from '../image-collection.js';

// Contracts: the real provider adapters transmit all declared parameters, compile before queuing,
// and do not consult another provider or changed settings after admission (wrong paid request).
function adapter(file, name, context) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    const start = source.indexOf(`export const ${name} = `) + `export const ${name} = `.length;
    const end = source.indexOf('\n};', start) + 2;
    return runInNewContext(`(${source.slice(start, end)})`, { structuredClone, MediaApiError, validateDrawInput, joinTags, ...context });
}

function novelDefaults() {
    const source = readFileSync(new URL('../../providers/novelai/novel-draw.js', import.meta.url), 'utf8');
    const presetStart = source.indexOf('const DEFAULT_PARAMS_PRESET = ');
    const presetCode = source.slice(presetStart, source.indexOf('\n};', presetStart) + 3);
    const normalizeCode = source.slice(source.indexOf('function normalizeV5QualityPresetId('), source.indexOf('/** 当前生效的 API 配置'));
    return runInNewContext(`${presetCode}\n${normalizeCode}\n({DEFAULT_PARAMS_PRESET,normalizeParamsPreset})`, { V5_QUALITY_IDS, V5_UC_IDS });
}

test('NovelAI public generation uses existing model compilers, frozen fields and selected transport without retry', async () => {
    const { DEFAULT_PARAMS_PRESET, normalizeParamsPreset } = novelDefaults();
    const png = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10, 0);
    let queued; let compiled; let jobs = 0; let direct = 0;
    const api = adapter('../../providers/novelai/novel-draw.js', 'novelPublicGeneration', {
        DEFAULT_PARAMS_PRESET, normalizeParamsPreset, DEFAULT_SETTINGS: { timeout: 120000 }, V5_QUALITY_IDS, V5_UC_IDS,
        isNovelV5Model, snapshotNovelRequestConfig, isNovelImageBackendJobEnabled, imageBlob,
        randomDelay: () => 0, imageBackendJobsClient: {},
        prepareNovelImageRequest(request, config) {
            return compileNovelImageRequest(request, { ...config, defaultParams: DEFAULT_PARAMS_PRESET.params, resolveForBackend: config.sendMode === 'backend' }, request.params.seed);
        },
        novelImageRequestQueue: { enqueue(run) { queued = run; return run(); } },
        executePreparedNovelRequest: async prepared => { direct++; compiled = prepared; return btoa(String.fromCharCode(...png)); },
        runPublicImageJob: async (_client, job) => { jobs++; compiled = job.items[0].request; return [imageBlob(png)]; },
    });
    for (const [model, specific, backend] of [
        ['nai-diffusion-3', { sm: false, sm_dyn: true, decrisper: false, ucPreset: 0 }, false],
        ['nai-diffusion-4-5-full', { qualityToggle: false, autoSmea: false, variety_boost: false, cfg_rescale: 0 }, false],
        ['nai-diffusion-5-full', { v5QualityPresetId: 'none', v5UcPresetId: 'none', transparentBackground: true, cfg_rescale: 0 }, true],
    ]) {
        const result = await api.generate({ prompt: 'dynamic', positivePrefix: '', negativePrompt: '', params: { model, width: 512, height: 768, seed: 0, scale: 0, ...specific } },
            { apiKey: 'fixture', apiBaseUrl: 'https://fixture.invalid', sendMode: backend ? 'backend' : 'frontend', useImageBackendJobs: backend, overrideSize: '1024x1024',
                paramsPresets: [{ ...DEFAULT_PARAMS_PRESET, id: 'p' }], selectedParamsPresetId: 'p' }, {});
        assert.equal(result[0].type, 'image/png');
        assert.equal(compiled.payload.parameters.seed, 0); assert.equal(compiled.payload.parameters.scale, 0);
        assert.equal(compiled.payload.parameters.width, 512); assert.equal(compiled.payload.parameters.height, 768);
        assert.equal(compiled.payload.parameters.n_samples, 1);
    }
    assert.equal(direct, 2); assert.equal(jobs, 1); assert.equal(typeof queued, 'function');
});
test('SD explicit generation options reach its existing compiler unchanged', async () => {
    let execute; let sent;
    const params = { model: 'test-model', sampler_name: 'Euler', width: 768, height: 1024, steps: 24, cfg_scale: 5,
        seed: 0, batch_size: 2, n_iter: 3, restore_faces: false, tiling: true, enable_hr: true,
        hr_scale: 2, hr_upscaler: 'Latent', denoising_strength: 0, clip_skip: 2, positivePrefix: 'prefix', negativePrefix: 'negative' };
    const publicApi = adapter('../../providers/sd-webui/sd-draw.js', 'sdPublicGeneration', {
        getEffectiveParams: (_settings, overrides = {}) => ({ ...params, ...overrides }), buildSdImageRequest,
        sdImageRequestQueue: { enqueue(run) { execute = run; return Promise.resolve([]); } },
        requestSdImage: async input => { sent = input; return []; },
    });
    await publicApi.generate({ prompt: 'dynamic', params, negativePrompt: '' }, { host: 'configured' }, {});
    params.steps = 90;
    await execute();
    assert.equal(sent.payload.steps, 24); assert.equal(sent.payload.seed, 0);
    assert.equal(sent.payload.denoising_strength, 0); assert.equal(sent.payload.restore_faces, false);
    assert.equal(sent.payload.batch_size, 2); assert.equal(sent.payload.n_iter, 3);
    assert.equal(sent.payload.negative_prompt, ''); assert.equal(sent.allResults, true);
    assert.equal(sent.payload.override_settings.sd_model_checkpoint, 'test-model');
});
test('Comfy explicit zero CFG and seed survive, and unsupported custom-workflow overrides fail before queuing', async () => {
    let prepared; let queued = 0;
    const defaults = { model: 'test', sampler: 'euler', scheduler: 'normal', steps: 20, cfg: 7, width: 1024, height: 1024, positivePrefix: '', negativePrefix: '' };
    const publicApi = adapter('../../providers/comfyui/comfy-draw.js', 'comfyPublicGeneration', {
        getEffectiveParams: (_settings, overrides = {}) => ({ ...defaults, ...overrides }), buildComfyImageRequest,
        isDirectConnection: settings => settings.connectionMode === 'direct',
        comfyImageRequestQueue: { enqueue(run) { queued++; return run(); } },
        requestComfyImage: async input => { prepared = input.prepared; return []; },
    });
    await publicApi.generate({ prompt: 'dynamic', seed: 0, params: { cfg: 0 } }, { host: 'configured', connectionMode: 'direct', workflowMode: 'simple' }, {});
    assert.equal(prepared.workflow['3'].inputs.cfg, 0); assert.equal(prepared.workflow['3'].inputs.seed, 0);
    assert.throws(() => publicApi.generate({ prompt: 'x', params: { model: 'ignored' } },
        { host: 'configured', connectionMode: 'direct', workflowMode: 'custom', customWorkflow: { json: '{}' } }, {}), { code: 'unsupported_field' });
    assert.equal(queued, 1);
});

// Invalid local compilation must never send a paid request or masquerade as a provider outage (wrong retry decisions).
test('SD and NovelAI compilation failures are invalid_request, while transport failures remain provider_error', async () => {
    let queued = 0;
    const sd = adapter('../../providers/sd-webui/sd-draw.js', 'sdPublicGeneration', {
        getEffectiveParams: (_settings, overrides = {}) => ({ positivePrefix: '', negativePrefix: '', ...overrides }),
        buildSdImageRequest,
        sdImageRequestQueue: { enqueue(run) { queued++; return run(); } },
        requestSdImage: async () => { throw new Error('private upstream error'); },
    });
    sd.snapshot = () => ({ host: 'https://fixture.invalid' });
    const api = createDrawPublicApi({ isEnabled: () => true, getProvider: () => 'sd-webui', providers: { 'sd-webui': sd } });
    await assert.rejects(api.generate({ prompt: '   ' }), { code: 'invalid_request' });
    assert.equal(queued, 0);
    await assert.rejects(api.generate({ prompt: 'dynamic' }), { code: 'provider_error' });
    assert.equal(queued, 1);

    const { DEFAULT_PARAMS_PRESET, normalizeParamsPreset } = novelDefaults();
    const novel = adapter('../../providers/novelai/novel-draw.js', 'novelPublicGeneration', {
        DEFAULT_PARAMS_PRESET, normalizeParamsPreset, DEFAULT_SETTINGS: { timeout: 120000 }, V5_QUALITY_IDS, V5_UC_IDS,
        isNovelV5Model, snapshotNovelRequestConfig,
        prepareNovelImageRequest: (request, config) => compileNovelImageRequest(request, {
            ...config, defaultParams: DEFAULT_PARAMS_PRESET.params,
        }, 0),
        novelImageRequestQueue: { enqueue() { queued++; assert.fail('invalid request was queued'); } },
    });
    novel.snapshot = () => ({ apiKey: 'fixture', apiBaseUrl: 'https://fixture.invalid',
        paramsPresets: [{ ...DEFAULT_PARAMS_PRESET, id: 'p' }], selectedParamsPresetId: 'p' });
    const novelApi = createDrawPublicApi({ isEnabled: () => true, getProvider: () => 'novelai', providers: { novelai: novel } });
    for (const size of [{}, { width: 512 }]) {
        await assert.rejects(novelApi.generate({ prompt: 'dynamic', params: {
            model: 'nai-diffusion-5-full', cfg_rescale: 2, ...size,
        } }), { code: 'invalid_request' });
    }
    assert.equal(queued, 1);
});

// Never put upstream credentials on a host-authenticated proxy request (credential mix-up / failed generation).
test('Comfy public generation uses only direct or explicitly enabled server transport, without changing settings', async () => {
    const defaults = { model: 'test', sampler: 'euler', scheduler: 'normal', steps: 20, cfg: 7,
        width: 512, height: 512, positivePrefix: '', negativePrefix: '' };
    let direct = 0;
    let backend = 0;
    const comfy = adapter('../../providers/comfyui/comfy-draw.js', 'comfyPublicGeneration', {
        getEffectiveParams: () => defaults, buildComfyImageRequest,
        isDirectConnection: settings => settings.connectionMode === 'direct',
        comfyImageRequestQueue: { enqueue: run => run() },
        requestComfyImage: async () => { direct++; return []; },
        comfyBackendJobsClient: {}, COMFY_REQUEST_DELAY_MS: 1,
        runPublicImageJob: async (_client, job) => { backend++; assert.equal(job.context.auth, 'comfy:secret'); return []; },
    });
    const saved = { host: 'https://fixture.invalid', auth: 'comfy:secret', connectionMode: 'proxy', workflowMode: 'simple' };
    const before = structuredClone(saved);
    assert.throws(() => comfy.generate({ prompt: 'dynamic', seed: 0 }, saved, {}), { code: 'not_configured' });
    assert.equal(direct + backend, 0);
    await comfy.generate({ prompt: 'dynamic', seed: 0 }, { ...saved, useImageBackendJobs: true }, {});
    await comfy.generate({ prompt: 'dynamic', seed: 0 }, { ...saved, connectionMode: 'direct' }, {});
    assert.equal(backend, 1);
    assert.equal(direct, 1);
    assert.deepEqual(saved, before);
});
