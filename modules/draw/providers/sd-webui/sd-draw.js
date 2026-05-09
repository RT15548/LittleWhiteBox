// sd-draw.js

import { getContext } from "../../../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../../../utils.js";
import { getRequestHeaders } from "../../../../../../../../script.js";
import { extensionFolderPath } from "../../../../core/constants.js";
import { createModuleEvents, event_types } from "../../../../core/event-manager.js";
import { SdDrawStorage } from "../../../../core/server-storage.js";
import { getDefaultApiPrefix, getModelListCandidateUrls } from "../../../../shared/common/openai-url-utils.js";
import {
    storePreview,
    storeFailedPlaceholder,
    setSlotSelection,
    clearSlotSelection,
    openDB,
    openGallery,
    getPreviewsBySlot,
    getGallerySummary,
    getCharacterPreviews,
    deletePreview,
    deleteFailedRecordsForSlot,
    updatePreviewSavedUrl,
} from "../../shared/gallery-cache.js";
import {
    generateScenePlan,
    parseImagePlan,
    LLMServiceError,
} from "../../shared/scene-planner.js";
import { WorldbookProcessor } from "../../shared/worldbook-processor.js";
import {
    loadSharedDrawSettings,
    getSharedDrawSettings,
    updateSharedDrawSettingsPersistent,
} from "../../shared/draw-settings.js";
import {
    findLastAIMessageId,
    createPlaceholder,
    renderPreviewsForMessage,
    buildImageHtml,
    insertPreviewIntoRenderedMessage,
    findAnchorPosition,
    findNearestSentenceEnd,
    detectPresentCharacters,
    assembleCharacterPrompts,
    applyMessageFilterRules,
    DEFAULT_MESSAGE_FILTER_RULES,
    joinTags,
    ensureDrawImageStyles,
    classifyError,
    ErrorType,
} from "../../shared/draw-common.js";
import {
    loadLocalDanbooruDB,
    unloadLocalDanbooruDB,
    searchLocalDanbooru,
    isDanbooruDBLoaded,
} from "../../shared/danbooru-local-db.js";
import {
    SD_SCENE_PROMPTS,
    loadPromptTemplates,
    loadTagGuide,
} from "./sd-prompts.js";

const MODULE_KEY = 'sdDraw';
const HTML_PATH = `${extensionFolderPath}/modules/draw/providers/sd-webui/sd-draw.html`;
const DANBOORU_DATA_PATH = `${extensionFolderPath}/modules/draw/shared/data/danbooru-chars.dat`;
const SERVER_FILE_KEY = 'config';

const DEFAULT_SD_DRAW_SETTINGS = {
    host: '',
    auth: '',
    timeout: 120000,
    transport: 'st-proxy',
    mode: 'manual',
    overrideSize: 'default',
    showFloorButton: true,
    showFloatingButton: true,
    selectedPresetId: 'default',
    presets: [],
    defaultParams: {
        steps: 28,
        cfg_scale: 7,
        sampler_name: 'Euler a',
        width: 832,
        height: 1216,
        seed: -1,
        batch_size: 1,
        n_iter: 1,
        restore_faces: false,
        tiling: false,
        enable_hr: false,
        hr_scale: 1.5,
        hr_upscaler: 'Latent',
        denoising_strength: 0.45,
        clip_skip: 1,
    },
    selectedModel: '',
    positivePrefix: '',
    negativePrefix: '',
};

let moduleInitialized = false;
let settingsCache = null;
let settingsLoaded = false;
let overlayElement = null;
let overlayFrame = null;
let frameReadyPromise = null;
let pendingController = null;
let resizeHandler = null;
let eventsBound = false;
let ensureSdDrawPanelRef = null;
let destroySdDrawPanelsRef = null;
let imageDelegationBound = false;
let autoBusy = false;
const events = createModuleEvents(MODULE_KEY);
const generationJobs = new Map();
const SD_DRAW_VIEWS = ['test', 'api', 'params', 'llm', 'characters', 'gallery'];
const ImageState = { PREVIEW: 'preview', SAVING: 'saving', SAVED: 'saved', REFRESHING: 'refreshing', FAILED: 'failed' };
const FIXED_SD_REQUEST_DELAY_MS = 1000;
let activeSdImageRequest = null;
let sdImageRequestQueue = [];
let sdImageRequestSeq = 0;
const SD_SIZE_PRESETS = [
    { value: '832x1216', width: 832, height: 1216 },
    { value: '1216x832', width: 1216, height: 832 },
    { value: '1024x1024', width: 1024, height: 1024 },
    { value: '768x1280', width: 768, height: 1280 },
    { value: '1280x768', width: 1280, height: 768 },
];
const providerDefaults = {
    st: { url: '', needKey: false, canFetch: false, needManualModel: false },
    openai: { url: 'https://api.openai.com', needKey: true, canFetch: true, needManualModel: false },
    google: { url: 'https://generativelanguage.googleapis.com', needKey: true, canFetch: false, needManualModel: true },
    claude: { url: 'https://api.anthropic.com', needKey: true, canFetch: false, needManualModel: true },
};

const saveBtnStates = new WeakMap();

function createDefaultPreset() {
    return {
        id: 'default',
        name: '默认',
        model: '',
        sampler_name: 'Euler a',
        width: 832,
        height: 1216,
        steps: 28,
        cfg_scale: 7,
        seed: -1,
        batch_size: 1,
        n_iter: 1,
        restore_faces: false,
        tiling: false,
        enable_hr: false,
        hr_scale: 1.5,
        hr_upscaler: 'Latent',
        denoising_strength: 0.45,
        clip_skip: 1,
        positivePrefix: '',
        negativePrefix: '',
        maxImages: 0,
        maxCharactersPerImage: 0,
    };
}

function cloneSettingsObject(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

function normalizeSettings(raw = {}) {
    const presets = normalizePresets(raw.presets, raw);
    const selectedPresetId = presets.some(p => p.id === raw.selectedPresetId)
        ? raw.selectedPresetId
        : presets[0]?.id || 'default';
    return {
        ...DEFAULT_SD_DRAW_SETTINGS,
        ...raw,
        transport: 'st-proxy',
        mode: raw.mode === 'auto' ? 'auto' : 'manual',
        overrideSize: String(raw.overrideSize || 'default'),
        showFloorButton: raw.showFloorButton !== false,
        showFloatingButton: raw.showFloatingButton !== false,
        timeout: normalizeNumber(raw.timeout, DEFAULT_SD_DRAW_SETTINGS.timeout, 10000, 600000),
        selectedPresetId,
        presets,
        defaultParams: {
            ...DEFAULT_SD_DRAW_SETTINGS.defaultParams,
            ...(raw.defaultParams || {}),
            steps: normalizeNumber(raw.defaultParams?.steps, DEFAULT_SD_DRAW_SETTINGS.defaultParams.steps, 1, 150),
            cfg_scale: normalizeNumber(raw.defaultParams?.cfg_scale, DEFAULT_SD_DRAW_SETTINGS.defaultParams.cfg_scale, 1, 30),
            width: normalizeNumber(raw.defaultParams?.width, DEFAULT_SD_DRAW_SETTINGS.defaultParams.width, 64, 2048),
            height: normalizeNumber(raw.defaultParams?.height, DEFAULT_SD_DRAW_SETTINGS.defaultParams.height, 64, 2048),
            seed: Number.isFinite(Number(raw.defaultParams?.seed)) ? Number(raw.defaultParams.seed) : -1,
            sampler_name: String(raw.defaultParams?.sampler_name || DEFAULT_SD_DRAW_SETTINGS.defaultParams.sampler_name),
            batch_size: normalizeNumber(raw.defaultParams?.batch_size, DEFAULT_SD_DRAW_SETTINGS.defaultParams.batch_size, 1, 16),
            n_iter: normalizeNumber(raw.defaultParams?.n_iter, DEFAULT_SD_DRAW_SETTINGS.defaultParams.n_iter, 1, 16),
            restore_faces: raw.defaultParams?.restore_faces === true,
            tiling: raw.defaultParams?.tiling === true,
            enable_hr: raw.defaultParams?.enable_hr === true,
            hr_scale: normalizeNumber(raw.defaultParams?.hr_scale, DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_scale, 1, 4),
            hr_upscaler: String(raw.defaultParams?.hr_upscaler || DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_upscaler),
            denoising_strength: normalizeNumber(raw.defaultParams?.denoising_strength, DEFAULT_SD_DRAW_SETTINGS.defaultParams.denoising_strength, 0, 1),
            clip_skip: normalizeNumber(raw.defaultParams?.clip_skip, DEFAULT_SD_DRAW_SETTINGS.defaultParams.clip_skip, 1, 12),
        },
    };
}

function normalizeNumber(value, fallback, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function normalizePresets(rawPresets, rawSettings = {}) {
    const source = Array.isArray(rawPresets) && rawPresets.length ? rawPresets : [{
        ...createDefaultPreset(),
        model: rawSettings.selectedModel || '',
        sampler_name: rawSettings.defaultParams?.sampler_name || DEFAULT_SD_DRAW_SETTINGS.defaultParams.sampler_name,
        width: rawSettings.defaultParams?.width ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.width,
        height: rawSettings.defaultParams?.height ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.height,
        steps: normalizeNumber(rawSettings.defaultParams?.steps, DEFAULT_SD_DRAW_SETTINGS.defaultParams.steps, 1, 150),
        cfg_scale: normalizeNumber(rawSettings.defaultParams?.cfg_scale, DEFAULT_SD_DRAW_SETTINGS.defaultParams.cfg_scale, 1, 30),
        seed: Number.isFinite(Number(rawSettings.defaultParams?.seed)) ? Number(rawSettings.defaultParams.seed) : -1,
        batch_size: normalizeNumber(rawSettings.defaultParams?.batch_size, DEFAULT_SD_DRAW_SETTINGS.defaultParams.batch_size, 1, 16),
        n_iter: normalizeNumber(rawSettings.defaultParams?.n_iter, DEFAULT_SD_DRAW_SETTINGS.defaultParams.n_iter, 1, 16),
        restore_faces: rawSettings.defaultParams?.restore_faces === true,
        tiling: rawSettings.defaultParams?.tiling === true,
        enable_hr: rawSettings.defaultParams?.enable_hr === true,
        hr_scale: normalizeNumber(rawSettings.defaultParams?.hr_scale, DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_scale, 1, 4),
        hr_upscaler: String(rawSettings.defaultParams?.hr_upscaler || DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_upscaler),
        denoising_strength: normalizeNumber(rawSettings.defaultParams?.denoising_strength, DEFAULT_SD_DRAW_SETTINGS.defaultParams.denoising_strength, 0, 1),
        clip_skip: normalizeNumber(rawSettings.defaultParams?.clip_skip, DEFAULT_SD_DRAW_SETTINGS.defaultParams.clip_skip, 1, 12),
        positivePrefix: rawSettings.positivePrefix || '',
        negativePrefix: rawSettings.negativePrefix || '',
    }];

    return source.map((preset, index) => ({
        ...createDefaultPreset(),
        ...preset,
        id: String(preset.id || `preset-${Date.now()}-${index}`),
        name: String(preset.name || `预设 ${index + 1}`),
        model: String(preset.model ?? preset.selectedModel ?? ''),
        sampler_name: String(preset.sampler_name ?? preset.sampler ?? ''),
        width: normalizeNumber(preset.width, DEFAULT_SD_DRAW_SETTINGS.defaultParams.width, 64, 2048),
        height: normalizeNumber(preset.height, DEFAULT_SD_DRAW_SETTINGS.defaultParams.height, 64, 2048),
        steps: normalizeNumber(preset.steps, DEFAULT_SD_DRAW_SETTINGS.defaultParams.steps, 1, 150),
        cfg_scale: normalizeNumber(preset.cfg_scale, DEFAULT_SD_DRAW_SETTINGS.defaultParams.cfg_scale, 1, 30),
        seed: Number.isFinite(Number(preset.seed)) ? Number(preset.seed) : -1,
        batch_size: normalizeNumber(preset.batch_size, DEFAULT_SD_DRAW_SETTINGS.defaultParams.batch_size, 1, 16),
        n_iter: normalizeNumber(preset.n_iter, DEFAULT_SD_DRAW_SETTINGS.defaultParams.n_iter, 1, 16),
        restore_faces: preset.restore_faces === true,
        tiling: preset.tiling === true,
        enable_hr: preset.enable_hr === true,
        hr_scale: normalizeNumber(preset.hr_scale, DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_scale, 1, 4),
        hr_upscaler: String(preset.hr_upscaler || DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_upscaler),
        denoising_strength: normalizeNumber(preset.denoising_strength, DEFAULT_SD_DRAW_SETTINGS.defaultParams.denoising_strength, 0, 1),
        clip_skip: normalizeNumber(preset.clip_skip, DEFAULT_SD_DRAW_SETTINGS.defaultParams.clip_skip, 1, 12),
        positivePrefix: String(preset.positivePrefix ?? ''),
        negativePrefix: String(preset.negativePrefix ?? ''),
        maxImages: normalizeNumber(preset.maxImages, 0, 0, 999),
        maxCharactersPerImage: normalizeNumber(preset.maxCharactersPerImage, 0, 0, 999),
    }));
}

export async function loadSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await SdDrawStorage.get(SERVER_FILE_KEY, null);
        if (saved && typeof saved === 'object') {
            settingsCache = normalizeSettings(saved);
        } else {
            settingsCache = normalizeSettings({});
            await SdDrawStorage.setAndSave(SERVER_FILE_KEY, settingsCache, { silent: true });
        }
    } catch (error) {
        console.error('[SdDraw] 加载设置失败:', error);
        settingsCache = normalizeSettings({});
    }

    settingsLoaded = true;
    return settingsCache;
}

export function getSettings() {
    if (!settingsCache) {
        console.warn('[SdDraw] 设置未加载，使用默认值');
        settingsCache = normalizeSettings({});
    }
    return settingsCache;
}

async function persistSettings(nextSettings, okText = '已保存', { notify = true, silent = false } = {}) {
    const next = normalizeSettings(nextSettings);
    const previous = settingsCache ? cloneSettingsObject(settingsCache) : null;
    try {
        settingsCache = next;
        const ok = await SdDrawStorage.setAndSave(SERVER_FILE_KEY, next, { silent });
        if (ok !== false) {
            if (notify) {
                toastr.success(okText, 'SD WebUI');
            }
            return true;
        }
        if (notify) {
            toastr.error('保存失败', 'SD WebUI');
        }
        settingsCache = previous;
        return false;
    } catch (error) {
        settingsCache = previous;
        if (notify) {
            toastr.error(error?.message || '保存失败', 'SD WebUI');
        }
        return false;
    }
}

export async function updateSettingsPersistent(mutator, okText = '已保存', options = {}) {
    const draft = cloneSettingsObject(getSettings());
    if (typeof mutator === 'function') {
        await mutator(draft);
    }
    return await persistSettings(draft, okText, options);
}

function getActivePreset(settings = getSettings()) {
    return settings.presets.find(p => p.id === settings.selectedPresetId) || settings.presets[0] || createDefaultPreset();
}

export function getEffectiveParams(settings = getSettings(), overrides = {}) {
    const preset = getActivePreset(settings);
    const overrideSize = String(overrides.overrideSize ?? settings.overrideSize ?? 'default');
    let sizeOverride = null;
    if (overrideSize && overrideSize !== 'default') {
        const match = overrideSize.match(/^(\d+)x(\d+)$/i);
        if (match) {
            sizeOverride = {
                width: normalizeNumber(match[1], preset.width ?? settings.defaultParams?.width ?? 512, 64, 2048),
                height: normalizeNumber(match[2], preset.height ?? settings.defaultParams?.height ?? 512, 64, 2048),
            };
        }
    }
    return {
        model: overrides.model ?? preset.model ?? settings.selectedModel ?? '',
        sampler_name: overrides.sampler_name ?? preset.sampler_name ?? settings.defaultParams?.sampler_name ?? '',
        width: overrides.width ?? sizeOverride?.width ?? preset.width ?? settings.defaultParams?.width,
        height: overrides.height ?? sizeOverride?.height ?? preset.height ?? settings.defaultParams?.height,
        steps: overrides.steps ?? preset.steps ?? settings.defaultParams?.steps,
        cfg_scale: overrides.cfg_scale ?? preset.cfg_scale ?? settings.defaultParams?.cfg_scale,
        seed: overrides.seed ?? preset.seed ?? settings.defaultParams?.seed,
        batch_size: overrides.batch_size ?? preset.batch_size ?? settings.defaultParams?.batch_size,
        n_iter: overrides.n_iter ?? preset.n_iter ?? settings.defaultParams?.n_iter,
        restore_faces: overrides.restore_faces ?? preset.restore_faces ?? settings.defaultParams?.restore_faces,
        tiling: overrides.tiling ?? preset.tiling ?? settings.defaultParams?.tiling,
        enable_hr: overrides.enable_hr ?? preset.enable_hr ?? settings.defaultParams?.enable_hr,
        hr_scale: overrides.hr_scale ?? preset.hr_scale ?? settings.defaultParams?.hr_scale,
        hr_upscaler: overrides.hr_upscaler ?? preset.hr_upscaler ?? settings.defaultParams?.hr_upscaler,
        denoising_strength: overrides.denoising_strength ?? preset.denoising_strength ?? settings.defaultParams?.denoising_strength,
        clip_skip: overrides.clip_skip ?? preset.clip_skip ?? settings.defaultParams?.clip_skip,
        positivePrefix: overrides.positivePrefix ?? preset.positivePrefix ?? settings.positivePrefix ?? '',
        negativePrefix: overrides.negativePrefix ?? preset.negativePrefix ?? settings.negativePrefix ?? '',
    };
}

function buildSdProxyBody(extra = {}) {
    const settings = getSettings();
    if (!settings.host) {
        throw new Error('请先填写 SD WebUI 地址');
    }
    return {
        url: settings.host,
        auth: settings.auth || '',
        ...extra,
    };
}

function waitWithAbort(signal, durationMs) {
    return new Promise((resolve) => {
        if (!durationMs || durationMs <= 0) {
            resolve();
            return;
        }

        const timer = setTimeout(resolve, durationMs);
        if (!signal) return;

        signal.addEventListener('abort', () => {
            clearTimeout(timer);
            resolve();
        }, { once: true });
    });
}

function notifyQueuedSdImageRequests() {
    sdImageRequestQueue.forEach((item, index) => {
        const ahead = (activeSdImageRequest ? 1 : 0) + index;
        if (ahead > 0) {
            item.onQueued?.({ ahead, position: ahead + 1 });
        }
    });
}

function pumpSdImageRequestQueue() {
    if (activeSdImageRequest || sdImageRequestQueue.length === 0) return;

    const item = sdImageRequestQueue.shift();
    activeSdImageRequest = item;
    notifyQueuedSdImageRequests();

    void (async () => {
        let result;
        let error = null;
        try {
            if (item.signal?.aborted) throw new Error('已取消');
            item.onStart?.();
            result = await item.run();
        } catch (caught) {
            error = caught;
        } finally {
            if (item.cooldownMs > 0) {
                item.onCooldown?.({ duration: item.cooldownMs });
                await waitWithAbort(item.signal, item.cooldownMs);
            }
            if (error) item.reject(error);
            else item.resolve(result);
            if (activeSdImageRequest === item) {
                activeSdImageRequest = null;
            }
            notifyQueuedSdImageRequests();
            pumpSdImageRequestQueue();
        }
    })();
}

function enqueueSdImageRequest(run, {
    signal,
    onQueued,
    onStart,
    onCooldown,
    cooldownMs = FIXED_SD_REQUEST_DELAY_MS,
} = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new Error('已取消'));
            return;
        }

        const item = {
            id: ++sdImageRequestSeq,
            run,
            signal,
            onQueued,
            onStart,
            onCooldown,
            cooldownMs,
            resolve,
            reject,
        };

        signal?.addEventListener('abort', () => {
            if (activeSdImageRequest === item) return;
            const idx = sdImageRequestQueue.indexOf(item);
            if (idx >= 0) {
                sdImageRequestQueue.splice(idx, 1);
                notifyQueuedSdImageRequests();
                reject(new Error('已取消'));
            }
        }, { once: true });

        sdImageRequestQueue.push(item);
        notifyQueuedSdImageRequests();
        pumpSdImageRequestQueue();
    });
}

async function fetchSdProxy(path, body = {}, { signal } = {}) {
    const response = await fetch(`/api/sd/${path}`, {
        method: 'POST',
        headers: getRequestHeaders(),
        body: JSON.stringify(buildSdProxyBody(body)),
        signal,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw classifySdError(text || response.statusText || `HTTP ${response.status}`);
    }

    return response;
}

export async function fetchSdModels({ signal } = {}) {
    const response = await fetchSdProxy('models', {}, { signal });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function fetchSdSamplers({ signal } = {}) {
    const response = await fetchSdProxy('samplers', {}, { signal });
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function generateSdImage({ prompt, negativePrompt = '', params = {}, signal } = {}) {
    const settings = getSettings();
    const effective = getEffectiveParams(settings, params);
    const body = {
        prompt: String(prompt || '').trim(),
        negative_prompt: String(negativePrompt || '').trim(),
    };

    if (Number.isFinite(Number(effective.width))) body.width = normalizeNumber(effective.width, 512, 64, 2048);
    if (Number.isFinite(Number(effective.height))) body.height = normalizeNumber(effective.height, 512, 64, 2048);
    if (Number.isFinite(Number(effective.steps))) body.steps = normalizeNumber(effective.steps, 20, 1, 150);
    if (Number.isFinite(Number(effective.cfg_scale))) body.cfg_scale = normalizeNumber(effective.cfg_scale, 7, 1, 30);
    if (effective.sampler_name) body.sampler_name = String(effective.sampler_name);
    if (Number.isFinite(Number(effective.seed))) body.seed = Number(effective.seed);
    if (Number.isFinite(Number(effective.batch_size))) body.batch_size = normalizeNumber(effective.batch_size, 1, 1, 16);
    if (Number.isFinite(Number(effective.n_iter))) body.n_iter = normalizeNumber(effective.n_iter, 1, 1, 16);
    body.restore_faces = effective.restore_faces === true;
    body.tiling = effective.tiling === true;
    body.enable_hr = effective.enable_hr === true;
    if (body.enable_hr) {
        if (Number.isFinite(Number(effective.hr_scale))) body.hr_scale = normalizeNumber(effective.hr_scale, 1.5, 1, 4);
        if (effective.hr_upscaler) body.hr_upscaler = String(effective.hr_upscaler);
        if (Number.isFinite(Number(effective.denoising_strength))) {
            body.denoising_strength = normalizeNumber(effective.denoising_strength, 0.45, 0, 1);
        }
    }

    const model = params.selectedModel ?? effective.model;
    const overrideSettings = {};
    if (model) {
        overrideSettings.sd_model_checkpoint = model;
    }
    if (Number.isFinite(Number(effective.clip_skip))) {
        overrideSettings.CLIP_stop_at_last_layers = normalizeNumber(effective.clip_skip, 1, 1, 12);
    }
    if (Object.keys(overrideSettings).length) {
        body.override_settings = overrideSettings;
    }

    if (!body.prompt) {
        throw new Error('Prompt 不能为空');
    }

    const response = await fetchSdProxy('generate', body, { signal });
    const data = await response.json();
    const firstImage = Array.isArray(data?.images) ? data.images[0] : null;
    if (!firstImage) {
        throw new Error('SD WebUI 没有返回图片');
    }
    return String(firstImage).replace(/^data:image\/\w+;base64,/, '');
}

async function generateSdImageQueued({
    prompt,
    negativePrompt = '',
    params = {},
    signal,
    onQueueStateChange,
    cooldownMs = FIXED_SD_REQUEST_DELAY_MS,
} = {}) {
    return enqueueSdImageRequest(
        () => generateSdImage({ prompt, negativePrompt, params, signal }),
        {
            signal,
            cooldownMs,
            onQueued: (data) => onQueueStateChange?.('queued', data),
            onStart: () => onQueueStateChange?.('start'),
            onCooldown: (data) => onQueueStateChange?.('cooldown', data),
        },
    );
}

function classifySdError(message) {
    const text = String(message || '');
    const lower = text.toLowerCase();
    if (lower.includes('outofmemory') || lower.includes('cuda out of memory') || lower.includes('cuda') && lower.includes('memory')) {
        return new Error('显存不足');
    }
    if (lower.includes('timeout') || lower.includes('abort')) return new Error('生成超时');
    if (lower.includes('401') || lower.includes('auth') || lower.includes('unauthorized')) return new Error('SD WebUI 认证失败');
    if (lower.includes('model') && (lower.includes('not loaded') || lower.includes('not found'))) return new Error('请先加载模型');
    if (lower.includes('failed to fetch') || lower.includes('econnrefused') || lower.includes('connect')) return new Error('无法连接 SD WebUI');
    return new Error(text || 'SD WebUI 请求失败');
}

function ensureStyles() {
    if (document.getElementById('xiaobaix-sd-draw-style')) return;
    const style = document.createElement('style');
    style.id = 'xiaobaix-sd-draw-style';
    // Keep overlay sizing in createOverlay()/syncOverlayHeight only.
    // Re-adding height:100vh on the overlay style broke the mobile bottom nav on SD settings.
    style.textContent = `
#xiaobaix-sd-draw-overlay .sd-draw-backdrop{position:absolute;top:0;left:0;width:100%;height:100%;background:#0d1117}
#xiaobaix-sd-draw-overlay .sd-draw-frame-wrap{position:absolute;z-index:1}
#xiaobaix-sd-draw-iframe{width:100%;height:100%;border:none;background:#0d1117}
@media(min-width:769px){#xiaobaix-sd-draw-overlay .sd-draw-frame-wrap{top:12px;left:12px;right:12px;bottom:12px}#xiaobaix-sd-draw-iframe{border-radius:12px}}
@media(max-width:768px){#xiaobaix-sd-draw-overlay .sd-draw-frame-wrap{top:0;left:0;right:0;bottom:0}#xiaobaix-sd-draw-iframe{border-radius:0}}
`;
    document.head.appendChild(style);
}

async function createOverlay() {
    if (overlayElement && frameReadyPromise) {
        await frameReadyPromise;
        return overlayElement;
    }
    ensureStyles();

    overlayElement = document.createElement('div');
    overlayElement.id = 'xiaobaix-sd-draw-overlay';
    overlayElement.style.cssText = `position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:${window.innerHeight}px!important;z-index:99999!important;display:none;overflow:hidden!important;`;
    const backdrop = document.createElement('div');
    backdrop.className = 'sd-draw-backdrop';
    backdrop.addEventListener('click', hideSettings);
    const frameWrap = document.createElement('div');
    frameWrap.className = 'sd-draw-frame-wrap';
    overlayFrame = document.createElement('iframe');
    overlayFrame.id = 'xiaobaix-sd-draw-iframe';
    overlayFrame.src = `${HTML_PATH}?v=${Date.now()}`;
    frameWrap.appendChild(overlayFrame);
    overlayElement.append(backdrop, frameWrap);
    document.body.appendChild(overlayElement);

    resizeHandler = () => {
        if (overlayElement?.style.display !== 'none') {
            syncOverlayHeight();
        }
    };
    window.addEventListener('resize', resizeHandler);
    window.visualViewport?.addEventListener('resize', resizeHandler);

    frameReadyPromise = new Promise((resolve, reject) => {
        overlayFrame?.addEventListener('load', () => {
            eventsBound = false;
            bindOverlayEvents();
            fillForm(getSettings());
            resolve(overlayElement);
        }, { once: true });
        overlayFrame?.addEventListener('error', () => {
            reject(new Error('SD 设置页加载失败'));
        }, { once: true });
    });

    await frameReadyPromise;
    return overlayElement;
}

function syncOverlayHeight() {
    if (!overlayElement) return;
    overlayElement.style.height = `${window.innerHeight}px`;
}

function getSettingsDocument() {
    return overlayFrame?.contentDocument || document.getElementById('xiaobaix-sd-draw-iframe')?.contentDocument || null;
}

function getSettingsElement(id) {
    return getSettingsDocument()?.getElementById(id) || null;
}

function querySettings(selector) {
    return getSettingsDocument()?.querySelector(selector) || null;
}

function querySettingsAll(selector) {
    return Array.from(getSettingsDocument()?.querySelectorAll(selector) || []);
}

function bindOverlayEvents() {
    if (!overlayElement || eventsBound || !getSettingsDocument()) return;
    eventsBound = true;
    querySettings('#sd-draw-close')?.addEventListener('click', hideSettings);
    querySettingsAll('[data-sd-view]').forEach((button) => {
        button.addEventListener('click', () => switchSettingsView(button.dataset.sdView || 'test'));
    });
    querySettings('#sd-gallery-refresh')?.addEventListener('click', async () => {
        await renderGalleryManagement();
    });
    querySettingsAll('[data-sd-mode]').forEach((button) => {
        button.addEventListener('click', async () => {
            const nextMode = button.dataset.sdMode === 'auto' ? 'auto' : 'manual';
            const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
                settings.mode = nextMode;
            }, '模式已保存', { silent: false }));
            if (!ok) return;
            fillForm(getSettings());
            try {
                const fp = await import('./floating-panel.js');
                fp.updateAutoModeUI?.();
            } catch {}
        });
    });
    querySettings('#sd-show-floor')?.addEventListener('change', async (event) => {
        const checked = event.target.checked === true;
        const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
            settings.showFloorButton = checked;
        }, '楼层按钮设置已保存', { silent: false }));
        if (!ok) return;
        const settings = getSettings();
        fillForm(settings);
        try {
            const fp = await import('./floating-panel.js');
            fp.updateButtonVisibility?.(settings.showFloorButton !== false, settings.showFloatingButton !== false);
        } catch {}
    });
    querySettings('#sd-show-floating')?.addEventListener('change', async (event) => {
        const checked = event.target.checked === true;
        const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
            settings.showFloatingButton = checked;
        }, '悬浮按钮设置已保存', { silent: false }));
        if (!ok) return;
        const settings = getSettings();
        fillForm(settings);
        try {
            const fp = await import('./floating-panel.js');
            fp.updateButtonVisibility?.(settings.showFloorButton !== false, settings.showFloatingButton !== false);
        } catch {}
    });
    querySettings('#sd-draw-save')?.addEventListener('click', async (event) => {
        const ok = await saveAllSettings({ notify: true, triggerButton: event.currentTarget, statusElementId: 'sd-draw-api-status' });
        if (ok) fillForm(getSettings());
    });
    querySettings('#sd-draw-test')?.addEventListener('click', async () => {
        await saveAllSettings({ notify: false });
        await testConnection();
    });
    querySettings('#sd-draw-refresh-options')?.addEventListener('click', async () => {
        await saveAllSettings({ notify: false });
        await refreshSdOptions({ notify: true });
    });
    querySettings('#sd-draw-test-generate')?.addEventListener('click', async () => {
        await saveAllSettings({ notify: false });
        await testGenerateFromSettingsPanel();
    });
    querySettings('#sd-draw-size-preset')?.addEventListener('change', () => {
        applySizePresetSelection();
    });
    querySettings('#sd-draw-hires-enabled')?.addEventListener('change', () => {
        updateHiresOptionsVisibility();
    });
    querySettings('#sd-draw-preset-select')?.addEventListener('change', async () => {
        const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
            settings.selectedPresetId = getValue('sd-draw-preset-select');
        }, '预设已切换', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#sd-draw-preset-add')?.addEventListener('click', async () => {
        const preset = {
            ...readPresetFromForm(),
            id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: prompt('输入预设名称：', '新预设') || '新预设',
        };
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.presets = [...draft.presets, preset];
            draft.selectedPresetId = preset.id;
        }, '已创建预设', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#sd-draw-preset-rename')?.addEventListener('click', async () => {
        const settings = getSettings();
        const preset = getActivePreset(settings);
        const name = prompt('输入新名称：', preset.name || '预设');
        if (!name) return;
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.presets = draft.presets.map((item) => item.id === preset.id ? { ...item, name } : item);
        }, '预设已重命名', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#sd-draw-preset-delete')?.addEventListener('click', async () => {
        const settings = getSettings();
        if (settings.presets.length <= 1) {
            toastr.warning('至少保留一个预设');
            return;
        }
        const preset = getActivePreset(settings);
        if (!confirm(`删除预设「${preset.name}」？`)) return;
        const presets = settings.presets.filter(item => item.id !== preset.id);
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.presets = presets;
            draft.selectedPresetId = presets[0]?.id || 'default';
        }, '预设已删除', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#sd-draw-preset-save')?.addEventListener('click', async (event) => {
        const settings = getSettings();
        const preset = getActivePreset(settings);
        const nextPreset = { ...readPresetFromForm(), id: preset.id, name: preset.name };
        const ok = await runSaveButtonTask(event.currentTarget, () => updateSettingsPersistent((draft) => {
            const form = readForm();
            Object.assign(draft, form);
            draft.presets = draft.presets.map((item) => item.id === preset.id ? nextPreset : item);
            draft.selectedPresetId = preset.id;
        }, '预设已保存', { notify: false, silent: false }), {
            statusElementId: 'sd-draw-params-status',
            pendingText: '正在保存预设...',
            successText: '预设已保存到小白X配置文件',
            errorText: '预设保存失败，请重试',
        });
        if (ok) fillForm(getSettings());
    });
    querySettings('#sd-shared-char-add')?.addEventListener('click', () => {
        addCharacterTagDraft();
    });
    querySettings('#sd-shared-char-clear')?.addEventListener('click', () => {
        clearCharacterTagsDraft();
    });
    querySettings('#sd-shared-char-export')?.addEventListener('click', () => {
        exportSharedCharacterTags();
    });
    querySettings('#sd-shared-char-import')?.addEventListener('change', async (event) => {
        await importSharedCharacterTags(event.target);
    });
    querySettings('#sd-danbooru-local')?.addEventListener('change', async (event) => {
        await setSdDanbooruLocalEnabled(event.target.checked === true);
    });
    querySettings('#sd-shared-llm-provider')?.addEventListener('change', () => {
        handleSharedLlmProviderChange();
    });
    querySettings('#sd-shared-llm-fetch')?.addEventListener('click', async () => {
        await fetchSharedLlmModels();
    });
    querySettings('#sd-filter-add')?.addEventListener('click', () => {
        renderFilterRuleRow({ start: '', end: '' });
    });
    querySettings('#sd-filter-reset')?.addEventListener('click', () => {
        renderFilterRules(DEFAULT_MESSAGE_FILTER_RULES);
    });
    querySettings('#sd-filter-save')?.addEventListener('click', async (event) => {
        await runSaveButtonTask(event.currentTarget, () => saveSharedDrawSettings({ notify: false }), {
            statusElementId: 'sd-shared-status',
            pendingText: '正在保存过滤规则...',
            successText: '过滤规则已保存',
            errorText: '过滤规则保存失败，请重试',
        });
    });
    querySettingsAll('[data-sd-save-shared]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            await saveAllSettings({ notify: true, triggerButton: event.currentTarget, statusElementId: 'sd-shared-status' });
        });
    });
    querySettings('#sd-shared-character-list')?.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('[data-sd-char-delete]');
        if (deleteButton) {
            deleteCharacterTagDraft(deleteButton.dataset.sdCharDelete);
            return;
        }
        const danbooruButton = event.target.closest('[data-sd-char-danbooru]');
        if (danbooruButton) {
            showSdDanbooruPanel(danbooruButton.dataset.sdCharDanbooru);
        }
    });
}

function fillForm(settings) {
    const preset = getActivePreset(settings);
    fillPresetSelect(settings);
    const showFloor = getSettingsElement('sd-show-floor');
    const showFloating = getSettingsElement('sd-show-floating');
    if (showFloor) showFloor.checked = settings.showFloorButton !== false;
    if (showFloating) showFloating.checked = settings.showFloatingButton !== false;
    querySettingsAll('[data-sd-mode]').forEach((button) => {
        button.classList.toggle('active', button.dataset.sdMode === (settings.mode === 'auto' ? 'auto' : 'manual'));
    });
    setValue('sd-draw-host', settings.host);
    setValue('sd-draw-auth', settings.auth);
    setValue('sd-draw-timeout', settings.timeout);
    setValue('sd-draw-steps', preset.steps ?? '');
    setValue('sd-draw-cfg', preset.cfg_scale ?? '');
    setValue('sd-draw-seed', Number.isFinite(Number(preset.seed)) ? preset.seed : -1);
    setValue('sd-draw-batch-size', preset.batch_size ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.batch_size);
    setValue('sd-draw-batch-count', preset.n_iter ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.n_iter);
    setValue('sd-draw-clip-skip', preset.clip_skip ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.clip_skip);
    setChecked('sd-draw-restore-faces', preset.restore_faces === true);
    setChecked('sd-draw-tiling', preset.tiling === true);
    setChecked('sd-draw-hires-enabled', preset.enable_hr === true);
    setValue('sd-draw-hr-scale', preset.hr_scale ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_scale);
    setValue('sd-draw-hr-upscaler', preset.hr_upscaler || DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_upscaler);
    setValue('sd-draw-denoising', preset.denoising_strength ?? DEFAULT_SD_DRAW_SETTINGS.defaultParams.denoising_strength);
    setValue('sd-draw-width', preset.width);
    setValue('sd-draw-height', preset.height);
    updateSizePresetSelection();
    updateHiresOptionsVisibility();
    setValue('sd-draw-positive-prefix', preset.positivePrefix);
    setValue('sd-draw-negative-prefix', preset.negativePrefix);
    setValue('sd-draw-max-images', preset.maxImages || 0);
    setValue('sd-draw-max-chars', preset.maxCharactersPerImage || 0);
    setSelectValue('sd-draw-model', preset.model || '');
    setSelectValue('sd-draw-sampler', preset.sampler_name || '');
    fillSharedDrawForm();
    refreshSettingsSummary();
}

function readForm() {
    const current = getSettings();
    const preset = readPresetFromForm();
    return {
        ...current,
        host: getValue('sd-draw-host').trim(),
        auth: getValue('sd-draw-auth').trim(),
        timeout: normalizeNumber(getValue('sd-draw-timeout'), current.timeout, 10000, 600000),
        defaultParams: {
            ...(current.defaultParams || {}),
            steps: preset.steps,
            cfg_scale: preset.cfg_scale,
            width: preset.width,
            height: preset.height,
            seed: preset.seed,
            sampler_name: preset.sampler_name,
            batch_size: preset.batch_size,
            n_iter: preset.n_iter,
            restore_faces: preset.restore_faces,
            tiling: preset.tiling,
            enable_hr: preset.enable_hr,
            hr_scale: preset.hr_scale,
            hr_upscaler: preset.hr_upscaler,
            denoising_strength: preset.denoising_strength,
            clip_skip: preset.clip_skip,
        },
        selectedModel: preset.model,
        positivePrefix: preset.positivePrefix,
        negativePrefix: preset.negativePrefix,
        presets: current.presets.map(item => item.id === current.selectedPresetId ? { ...preset, id: item.id, name: item.name } : item),
    };
}

function readPresetFromForm() {
    const settings = getSettings();
    const current = getActivePreset(settings);
    const sizePreset = getValue('sd-draw-size-preset');
    let width = normalizeNumber(getValue('sd-draw-width'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.width, 64, 2048);
    let height = normalizeNumber(getValue('sd-draw-height'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.height, 64, 2048);
    if (sizePreset && sizePreset !== 'custom') {
        const matched = SD_SIZE_PRESETS.find((item) => item.value === sizePreset);
        if (matched) {
            width = matched.width;
            height = matched.height;
        }
    }
    return {
        ...current,
        model: getValue('sd-draw-model').trim(),
        sampler_name: getValue('sd-draw-sampler').trim(),
        width,
        height,
        steps: normalizeNumber(getValue('sd-draw-steps'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.steps, 1, 150),
        cfg_scale: normalizeNumber(getValue('sd-draw-cfg'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.cfg_scale, 1, 30),
        seed: getValue('sd-draw-seed') === '' ? -1 : Number(getValue('sd-draw-seed')),
        batch_size: normalizeNumber(getValue('sd-draw-batch-size'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.batch_size, 1, 16),
        n_iter: normalizeNumber(getValue('sd-draw-batch-count'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.n_iter, 1, 16),
        restore_faces: getChecked('sd-draw-restore-faces'),
        tiling: getChecked('sd-draw-tiling'),
        enable_hr: getChecked('sd-draw-hires-enabled'),
        hr_scale: normalizeNumber(getValue('sd-draw-hr-scale'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_scale, 1, 4),
        hr_upscaler: getValue('sd-draw-hr-upscaler').trim() || DEFAULT_SD_DRAW_SETTINGS.defaultParams.hr_upscaler,
        denoising_strength: normalizeNumber(getValue('sd-draw-denoising'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.denoising_strength, 0, 1),
        clip_skip: normalizeNumber(getValue('sd-draw-clip-skip'), DEFAULT_SD_DRAW_SETTINGS.defaultParams.clip_skip, 1, 12),
        positivePrefix: getValue('sd-draw-positive-prefix'),
        negativePrefix: getValue('sd-draw-negative-prefix'),
        maxImages: normalizeNumber(getValue('sd-draw-max-images'), 0, 0, 999),
        maxCharactersPerImage: normalizeNumber(getValue('sd-draw-max-chars'), 0, 0, 999),
    };
}

function updateSizePresetSelection() {
    const width = getValue('sd-draw-width');
    const height = getValue('sd-draw-height');
    const value = `${width}x${height}`;
    const select = getSettingsElement('sd-draw-size-preset');
    const customRow = getSettingsElement('sd-draw-custom-size');
    if (!select || !customRow) return;
    const matched = SD_SIZE_PRESETS.find((item) => item.value === value);
    select.value = matched ? matched.value : 'custom';
    customRow.classList.toggle('hidden', select.value !== 'custom');
}

function applySizePresetSelection() {
    const value = getValue('sd-draw-size-preset');
    const customRow = getSettingsElement('sd-draw-custom-size');
    if (!customRow) return;
    if (value === 'custom') {
        customRow.classList.remove('hidden');
        return;
    }
    const matched = SD_SIZE_PRESETS.find((item) => item.value === value);
    if (matched) {
        setValue('sd-draw-width', matched.width);
        setValue('sd-draw-height', matched.height);
    }
    customRow.classList.add('hidden');
}

function updateHiresOptionsVisibility() {
    const row = getSettingsElement('sd-draw-hires-options');
    if (!row) return;
    row.classList.toggle('hidden', !getChecked('sd-draw-hires-enabled'));
}

function fillPresetSelect(settings = getSettings()) {
    const select = getSettingsElement('sd-draw-preset-select');
    if (!select) return;
    select.textContent = '';
    settings.presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name || preset.id;
        select.appendChild(option);
    });
    select.value = settings.selectedPresetId;
}

function switchSettingsView(viewName = 'test') {
    const normalized = SD_DRAW_VIEWS.includes(viewName) ? viewName : 'test';
    querySettingsAll('[data-sd-view]').forEach((button) => {
        button.classList.toggle('active', button.dataset.sdView === normalized);
    });
    querySettingsAll('[data-sd-view-panel]').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.sdViewPanel === normalized);
    });
    if (normalized === 'gallery') {
        void renderGalleryManagement();
    }
}

function formatBytes(bytes = 0) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function renderGalleryManagement() {
    const container = getSettingsElement('sd-gallery-container');
    const empty = getSettingsElement('sd-gallery-empty');
    const countEl = getSettingsElement('sd-gallery-count');
    const sizeEl = getSettingsElement('sd-gallery-size');
    if (!container || !empty || !countEl || !sizeEl) return;

    container.textContent = '加载中...';
    empty.style.display = 'none';

    let summary = {};
    try {
        summary = await getGallerySummary();
    } catch (error) {
        console.warn('[SdDraw] getGallerySummary failed:', error);
    }

    const chars = Object.keys(summary);
    const totalCount = chars.reduce((sum, charName) => sum + (summary[charName]?.count || 0), 0);
    const totalSize = chars.reduce((sum, charName) => sum + (summary[charName]?.totalSize || 0), 0);
    countEl.textContent = String(totalCount);
    sizeEl.textContent = formatBytes(totalSize);

    if (!chars.length) {
        container.textContent = '';
        empty.style.display = 'block';
        return;
    }

    chars.sort((a, b) => (summary[b].latestTimestamp || 0) - (summary[a].latestTimestamp || 0));
    container.replaceChildren();

    for (const charName of chars) {
        const charSummary = summary[charName];
        const slots = await getCharacterPreviews(charName).catch(() => ({}));
        const slotIds = Object.keys(slots).sort((a, b) => ((slots[b]?.[0]?.timestamp || 0) - (slots[a]?.[0]?.timestamp || 0)));

        const card = document.createElement('div');
        card.className = 'gallery-char-card';

        const head = document.createElement('div');
        head.className = 'gallery-char-head';
        const title = document.createElement('div');
        title.className = 'gallery-char-name';
        title.textContent = charName;
        const meta = document.createElement('div');
        meta.className = 'gallery-char-meta';
        meta.textContent = `${charSummary.count || 0} 张 · ${slotIds.length} 组 · ${formatBytes(charSummary.totalSize || 0)}`;
        head.append(title, meta);

        const grid = document.createElement('div');
        grid.className = 'gallery-slots';

        slotIds.slice(0, 8).forEach((slotId, index) => {
            const latest = slots[slotId]?.[0];
            if (!latest) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'gallery-slot-btn';
            button.addEventListener('click', async () => {
                await openGallery(slotId, Number(latest.messageId || 0), buildSharedGalleryCallbacks(slotId, Number(latest.messageId || 0)));
            });

            const img = document.createElement('img');
            img.className = 'gallery-slot-thumb';
            img.src = latest.savedUrl || `data:image/png;base64,${latest.base64}`;
            img.alt = '';

            const label = document.createElement('div');
            label.className = 'gallery-slot-title';
            label.textContent = `图组 ${index + 1}`;

            const sub = document.createElement('div');
            sub.className = 'gallery-slot-sub';
            sub.textContent = `${slots[slotId]?.length || 1} 个版本`;

            button.append(img, label, sub);
            grid.appendChild(button);
        });

        card.append(head, grid);
        container.appendChild(card);
    }
}

function getSharedCharacterTagsFromForm() {
    const existingById = new Map((getSharedDrawSettings().characterTags || [])
        .map((item) => [String(item.id || ''), item])
        .filter(([id]) => id));

    return querySettingsAll('.sd-char-card').map((card, index) => ({
        ...(existingById.get(String(card.dataset.characterId || '')) || {}),
        id: card.dataset.characterId || `sd-char-${Date.now()}-${index}`,
        name: String(card.querySelector('[data-sd-char-field="name"]')?.value || '').trim(),
        aliases: String(card.querySelector('[data-sd-char-field="aliases"]')?.value || '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean),
        type: String(card.querySelector('[data-sd-char-field="type"]')?.value || 'girl').trim() || 'girl',
        appearance: String(card.querySelector('[data-sd-char-field="appearance"]')?.value || '').trim(),
        negativeTags: String(card.querySelector('[data-sd-char-field="negativeTags"]')?.value || '').trim(),
        danbooruTag: String(card.querySelector('[data-sd-char-field="danbooruTag"]')?.value || '').trim(),
        outfits: parseCharacterOutfits(card.querySelector('[data-sd-char-field="outfits"]')?.value || ''),
    })).filter((item) => item.name || item.appearance || item.danbooruTag || item.negativeTags || item.aliases.length || item.outfits?.length);
}

function renderCharacterTagList(tags = []) {
    const list = querySettings('#sd-shared-character-list');
    if (!list) return;
    list.textContent = '';
    if (!tags.length) {
        const empty = document.createElement('div');
        empty.className = 'char-empty sd-char-empty';
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-user-plus';
        const title = document.createElement('strong');
        title.textContent = '暂无角色配置';
        const desc = document.createElement('p');
        desc.textContent = '点击左侧“添加角色”，开始建立你的共享角色标签库';
        empty.append(icon, title, desc);
        list.appendChild(empty);
        return;
    }

    tags.forEach((tag, index) => {
        const card = document.createElement('div');
        card.className = 'sd-char-card';
        card.dataset.characterId = String(tag.id || `sd-char-${index + 1}`);

        const top = document.createElement('div');
        top.className = 'sd-char-card-header';
        const title = document.createElement('div');
        title.className = 'sd-char-card-title';
        const titleIcon = document.createElement('i');
        titleIcon.className = 'fa-solid fa-user';
        const titleText = document.createElement('span');
        titleText.textContent = `角色 ${index + 1}`;
        title.append(titleIcon, titleText);
        const delButton = document.createElement('button');
        delButton.className = 'btn btn-danger btn-sm';
        delButton.type = 'button';
        delButton.dataset.sdCharDelete = card.dataset.characterId;
        const delIcon = document.createElement('i');
        delIcon.className = 'fa-solid fa-trash';
        const delText = document.createElement('span');
        delText.textContent = '删除';
        delButton.append(delIcon, delText);
        const danbooruButton = document.createElement('button');
        danbooruButton.className = 'btn btn-sm';
        danbooruButton.type = 'button';
        danbooruButton.dataset.sdCharDanbooru = card.dataset.characterId;
        if (!isDanbooruDBLoaded()) {
            danbooruButton.disabled = true;
            danbooruButton.style.opacity = '0.35';
        }
        const danbooruIcon = document.createElement('i');
        danbooruIcon.className = 'fa-solid fa-magnifying-glass';
        const danbooruText = document.createElement('span');
        danbooruText.textContent = 'Danbooru';
        danbooruButton.append(danbooruIcon, danbooruText);

        const actions = document.createElement('div');
        actions.className = 'btn-group';
        actions.append(danbooruButton, delButton);
        top.append(title, actions);

        const grid = document.createElement('div');
        grid.className = 'form-row';
        grid.append(
            createCharacterField('角色名', 'name', tag.name || '', '例如 芙蕾雅'),
            createCharacterField('类型', 'type', tag.type || 'girl', '例如 girl / boy'),
        );

        card.append(
            top,
            grid,
            createCharacterField('别名（逗号分隔）', 'aliases', (tag.aliases || []).join(', '), '例如 小芙, Freya'),
            createCharacterField('外观标签', 'appearance', tag.appearance || '', '会拼进角色外观提示词', { multiline: true }),
            createCharacterField('负向标签', 'negativeTags', tag.negativeTags || '', '角色专属 negative / uc 标签', { multiline: true }),
            createCharacterField('Danbooru Tag', 'danbooruTag', tag.danbooruTag || '', '可选，用于兼容原有角色提示逻辑'),
            createCharacterField('服装参考（每行一套）', 'outfits', serializeCharacterOutfits(tag.outfits || []), '校服 = white shirt, pleated skirt', { multiline: true }),
        );
        const panel = document.createElement('div');
        panel.className = 'danbooru-panel hidden';
        panel.dataset.charId = card.dataset.characterId;
        card.appendChild(panel);
        list.appendChild(card);
    });
}

function createCharacterField(labelText, fieldName, value, placeholder, options = {}) {
    const field = document.createElement('div');
    field.className = 'form-group';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = labelText;
    field.appendChild(label);

    const input = document.createElement(options.multiline ? 'textarea' : 'input');
    input.className = 'input';
    input.dataset.sdCharField = fieldName;
    input.placeholder = placeholder;
    if (options.multiline) {
        input.rows = 3;
        input.textContent = String(value || '');
    } else {
        input.type = 'text';
        input.value = String(value || '');
    }
    field.appendChild(input);
    return field;
}

function serializeCharacterOutfits(outfits = []) {
    return (Array.isArray(outfits) ? outfits : [])
        .map((outfit) => {
            const name = String(outfit?.name || '').trim();
            const tags = String(outfit?.tags || '').trim();
            if (!name && !tags) return '';
            return name ? `${name} = ${tags}` : tags;
        })
        .filter(Boolean)
        .join('\n');
}

function parseCharacterOutfits(value = '') {
    return String(value || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const matched = line.split('=');
            if (matched.length >= 2) {
                return {
                    name: matched.shift().trim(),
                    tags: matched.join('=').trim(),
                };
            }
            return {
                name: '',
                tags: line,
            };
        })
        .filter((outfit) => outfit.name || outfit.tags);
}

function updateSharedLlmProviderUI() {
    const provider = getValue('sd-shared-llm-provider') || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    const sharedDrawSettings = getSharedDrawSettings();
    const isSt = provider === 'st';
    const modelCache = Array.isArray(sharedDrawSettings.llmApi?.modelCache) ? sharedDrawSettings.llmApi.modelCache : [];
    const hasCache = modelCache.length > 0;

    querySettings('#sd-shared-llm-url-row')?.classList.toggle('hidden', isSt);
    querySettings('#sd-shared-llm-key-row')?.classList.toggle('hidden', isSt);
    querySettings('#sd-shared-llm-model-manual-row')?.classList.toggle('hidden', isSt || !providerConfig.needManualModel);
    querySettings('#sd-shared-llm-model-select-row')?.classList.toggle('hidden', isSt || providerConfig.needManualModel || !hasCache);
    querySettings('#sd-shared-llm-connect-row')?.classList.toggle('hidden', isSt || !providerConfig.canFetch);
}

function getCurrentSharedLlmModel() {
    const provider = getValue('sd-shared-llm-provider') || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    if (providerConfig.needManualModel) return getValue('sd-shared-llm-model-manual').trim();
    if (providerConfig.canFetch) return getValue('sd-shared-llm-model-select').trim();
    return '';
}

function handleSharedLlmProviderChange() {
    const provider = getValue('sd-shared-llm-provider') || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    const sharedDrawSettings = getSharedDrawSettings();
    const nextUrl = sharedDrawSettings.llmApi?.provider === provider
        ? (sharedDrawSettings.llmApi?.url || providerConfig.url || '')
        : (providerConfig.url || '');

    setValue('sd-shared-llm-url', nextUrl);
    if (!providerConfig.canFetch) {
        sharedDrawSettings.llmApi = {
            ...(sharedDrawSettings.llmApi || {}),
            modelCache: [],
        };
    }
    fillSharedLlmModelFields();
    updateSharedLlmProviderUI();
}

function fillSharedLlmModelFields() {
    const sharedDrawSettings = getSharedDrawSettings();
    const llmApi = sharedDrawSettings.llmApi || {};
    const provider = getValue('sd-shared-llm-provider') || llmApi.provider || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    const modelCache = Array.isArray(llmApi.modelCache) ? llmApi.modelCache : [];
    populateSelect(
        'sd-shared-llm-model-select',
        modelCache.map((item) => ({ value: item, label: item })),
        { value: llmApi.model || '', emptyLabel: '请先拉取模型列表' },
    );
    if (providerConfig.needManualModel) {
        setValue('sd-shared-llm-model-manual', llmApi.model || '');
    } else if (providerConfig.canFetch) {
        setSelectValue('sd-shared-llm-model-select', llmApi.model || '');
    }
}

async function fetchSharedLlmModels() {
    const provider = getValue('sd-shared-llm-provider').trim() || 'st';
    const url = getValue('sd-shared-llm-url').trim();
    const key = getValue('sd-shared-llm-key').trim();
    const button = getSettingsElement('sd-shared-llm-fetch');

    if (provider !== 'openai') {
        updateStatusText('sd-shared-status', 'error', '当前渠道无需拉取模型列表');
        return false;
    }

    if (!key) {
        updateStatusText('sd-shared-status', 'error', '请先填写 LLM API Key');
        return false;
    }

    const tryFetch = async (requestUrl) => {
        try {
            const response = await fetch(requestUrl, {
                headers: {
                    Authorization: `Bearer ${key}`,
                    Accept: 'application/json',
                },
            });
            if (!response.ok) return null;
            return (await response.json())?.data?.map((item) => item?.id).filter(Boolean) || null;
        } catch {
            return null;
        }
    };

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 连接中...';
    }
    updateStatusText('sd-shared-status', '', '正在连接并拉取模型列表...');

    try {
        let models = null;
        for (const requestUrl of getModelListCandidateUrls(url, getDefaultApiPrefix(provider))) {
            models = await tryFetch(requestUrl);
            if (models?.length) break;
        }
        if (!models?.length) throw new Error('未获取到模型列表');

        await updateSharedDrawSettingsPersistent((settings) => {
            settings.llmApi = {
                ...(settings.llmApi || {}),
                provider,
                url,
                key,
                modelCache: [...new Set(models)],
                model: getCurrentSharedLlmModel() || settings.llmApi?.model || models[0] || '',
            };
        }, `已获取 ${models.length} 个模型`, { notify: false, silent: false });

        fillSharedLlmModelFields();
        updateSharedLlmProviderUI();
        updateStatusText('sd-shared-status', 'success', `已获取 ${models.length} 个模型`);
        return true;
    } catch (error) {
        updateStatusText('sd-shared-status', 'error', `连接失败：${error?.message || '请检查配置'}`);
        return false;
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-plug"></i> 连接 / 拉取模型列表';
        }
    }
}

function renderFilterRuleRow(rule = { start: '', end: '' }) {
    const list = getSettingsElement('sd-filter-rules-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'filter-rule-row';

    const start = document.createElement('input');
    start.type = 'text';
    start.placeholder = '起始标记';
    start.value = String(rule.start || '');
    start.dataset.sdFilterField = 'start';

    const arrow = document.createElement('span');
    arrow.className = 'rule-arrow';
    arrow.textContent = '→';

    const end = document.createElement('input');
    end.type = 'text';
    end.placeholder = '结束标记';
    end.value = String(rule.end || '');
    end.dataset.sdFilterField = 'end';

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-del-rule';
    del.textContent = '×';
    del.addEventListener('click', () => row.remove());

    row.append(start, arrow, end, del);
    list.appendChild(row);
}

function renderFilterRules(rules = []) {
    const list = getSettingsElement('sd-filter-rules-list');
    if (!list) return;
    list.textContent = '';
    const normalized = Array.isArray(rules) && rules.length ? rules : DEFAULT_MESSAGE_FILTER_RULES;
    normalized.forEach((rule) => renderFilterRuleRow(rule));
}

function collectFilterRules() {
    return querySettingsAll('#sd-filter-rules-list .filter-rule-row')
        .map((row) => ({
            start: String(row.querySelector('[data-sd-filter-field="start"]')?.value || '').trim(),
            end: String(row.querySelector('[data-sd-filter-field="end"]')?.value || '').trim(),
        }))
        .filter((rule) => rule.start || rule.end);
}

function parseDanbooruCharName(tagName) {
    const match = String(tagName || '').match(/^(.+?)_\((.+)\)$/);
    if (match) {
        return {
            charName: match[1].replace(/_/g, ' '),
            series: match[2].replace(/_/g, ' '),
        };
    }
    return {
        charName: String(tagName || '').replace(/_/g, ' '),
        series: '',
    };
}

async function setSdDanbooruLocalEnabled(enabled) {
    const checkbox = getSettingsElement('sd-danbooru-local');
    const status = getSettingsElement('sd-danbooru-local-status');
    if (status) status.textContent = enabled ? '加载中...' : '未加载';
    if (checkbox) checkbox.disabled = true;

    try {
        if (enabled) {
            const db = await loadLocalDanbooruDB(DANBOORU_DATA_PATH);
            if (!db) return false;
            await updateSharedDrawSettingsPersistent((settings) => {
                settings.danbooruLocalDB = true;
            }, `Danbooru 本地库已加载 (${db.length} 条)`, { notify: false, silent: false });
            if (status) status.textContent = `已加载 ${db.length} 条`;
        } else {
            unloadLocalDanbooruDB();
            await updateSharedDrawSettingsPersistent((settings) => {
                settings.danbooruLocalDB = false;
            }, 'Danbooru 本地库已关闭', { notify: false, silent: false });
            if (status) status.textContent = '未加载';
        }
        if (checkbox) checkbox.checked = enabled;
        renderCharacterTagList(getSharedCharacterTagsFromForm());
        refreshSettingsSummary();
        return true;
    } catch (error) {
        console.warn('[SdDraw] Danbooru 本地库切换失败:', error);
        unloadLocalDanbooruDB();
        await updateSharedDrawSettingsPersistent((settings) => {
            settings.danbooruLocalDB = false;
        }, 'Danbooru 本地库加载失败', { notify: false, silent: false }).catch(() => {});
        if (checkbox) checkbox.checked = false;
        if (status) status.textContent = '加载失败';
        toastr.error('Danbooru 本地库加载失败');
        renderCharacterTagList(getSharedCharacterTagsFromForm());
        refreshSettingsSummary();
        return false;
    } finally {
        if (checkbox) checkbox.disabled = false;
    }
}

async function ensureSdDanbooruLoadedForForm(sharedDrawSettings = getSharedDrawSettings()) {
    const checkbox = getSettingsElement('sd-danbooru-local');
    const status = getSettingsElement('sd-danbooru-local-status');
    const enabled = sharedDrawSettings.danbooruLocalDB === true;
    if (checkbox) checkbox.checked = enabled;
    if (!enabled) {
        if (status) status.textContent = '未加载';
        return;
    }
    if (isDanbooruDBLoaded()) {
        if (status) status.textContent = '已加载';
        return;
    }
    if (status) status.textContent = '加载中...';
    try {
        const db = await loadLocalDanbooruDB(DANBOORU_DATA_PATH);
        if (status) status.textContent = db ? `已加载 ${db.length} 条` : '未加载';
        renderCharacterTagList(getSharedCharacterTagsFromForm());
    } catch (error) {
        console.warn('[SdDraw] 预加载 Danbooru 本地库失败:', error);
        if (status) status.textContent = '加载失败';
    }
}

function showSdDanbooruPanel(characterId = '') {
    if (!isDanbooruDBLoaded()) {
        toastr.warning('请先启用 Danbooru 本地资源库');
        return;
    }
    const panel = querySettings(`.danbooru-panel[data-char-id="${CSS.escape(characterId)}"]`);
    const card = querySettings(`.sd-char-card[data-character-id="${CSS.escape(characterId)}"]`);
    if (!panel || !card) return;

    const currentTag = card.querySelector('[data-sd-char-field="danbooruTag"]')?.value || '';
    const currentName = card.querySelector('[data-sd-char-field="name"]')?.value || '';
    const defaultQuery = currentTag || currentName || '';

    panel.classList.remove('hidden');
    const doc = panel.ownerDocument || document;
    const row = doc.createElement('div');
    row.className = 'danbooru-search-row';

    const input = doc.createElement('input');
    input.type = 'text';
    input.className = 'input danbooru-query';
    input.value = defaultQuery;
    input.placeholder = '角色名搜索（本地库）';

    const searchButton = doc.createElement('button');
    searchButton.className = 'btn btn-primary danbooru-search-btn';
    searchButton.type = 'button';
    const searchIcon = doc.createElement('i');
    searchIcon.className = 'fa-solid fa-magnifying-glass';
    const searchText = doc.createElement('span');
    searchText.textContent = '本地搜索';
    searchButton.append(searchIcon, searchText);

    const closeButton = doc.createElement('button');
    closeButton.className = 'btn danbooru-close-btn';
    closeButton.type = 'button';
    const closeIcon = doc.createElement('i');
    closeIcon.className = 'fa-solid fa-xmark';
    closeButton.appendChild(closeIcon);

    const results = doc.createElement('div');
    results.className = 'danbooru-results';
    row.append(input, searchButton, closeButton);
    panel.replaceChildren(row, results);

    const runSearch = () => {
        const query = input.value.trim();
        if (!query) return;
        const loading = doc.createElement('div');
        loading.className = 'danbooru-status';
        const spinner = doc.createElement('i');
        spinner.className = 'fa-solid fa-spinner fa-spin';
        const loadingText = doc.createTextNode(' 本地搜索中...');
        loading.append(spinner, loadingText);
        results.replaceChildren(loading);
        renderSdDanbooruResults(searchLocalDanbooru(query, 10), characterId, results);
    };

    searchButton.addEventListener('click', runSearch);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') runSearch();
    });
    closeButton.addEventListener('click', () => {
        panel.classList.add('hidden');
        panel.replaceChildren();
    });

    if (defaultQuery) runSearch();
}

function renderSdDanbooruResults(results = [], characterId = '', container = null) {
    const target = container || querySettings(`.danbooru-panel[data-char-id="${CSS.escape(characterId)}"] .danbooru-results`);
    const card = querySettings(`.sd-char-card[data-character-id="${CSS.escape(characterId)}"]`);
    if (!target || !card) return;

    if (!results.length) {
        const status = (target.ownerDocument || document).createElement('div');
        status.className = 'danbooru-status';
        status.textContent = '本地库未找到匹配角色';
        target.replaceChildren(status);
        return;
    }

    const doc = target.ownerDocument || document;
    const list = doc.createElement('div');
    list.className = 'danbooru-char-list';

    results.forEach((result) => {
        const parsed = parseDanbooruCharName(result.name);
        const tagPreview = (result.tags || []).slice(0, 6).map((tag) => tag.replace(/_/g, ' ')).join(', ');
        const item = doc.createElement('button');
        item.className = 'danbooru-char-item local-fix';
        item.type = 'button';
        item.dataset.tag = result.name;
        item.dataset.tags = JSON.stringify(result.tags || []);

        const info = doc.createElement('span');
        info.className = 'danbooru-char-info';
        const name = doc.createElement('span');
        name.className = 'danbooru-char-name';
        name.textContent = parsed.charName;
        info.appendChild(name);
        if (parsed.series) {
            const series = doc.createElement('span');
            series.className = 'danbooru-char-series';
            series.textContent = parsed.series;
            info.appendChild(series);
        }
        if (tagPreview) {
            const preview = doc.createElement('span');
            preview.className = 'danbooru-tag-preview';
            preview.textContent = tagPreview;
            info.appendChild(preview);
        }
        item.appendChild(info);
        item.addEventListener('click', () => {
            let appearanceTags = [];
            try { appearanceTags = JSON.parse(item.dataset.tags || '[]'); } catch {}
            const tagInput = card.querySelector('[data-sd-char-field="danbooruTag"]');
            const appearanceInput = card.querySelector('[data-sd-char-field="appearance"]');
            if (tagInput) tagInput.value = item.dataset.tag || '';
            if (appearanceInput && appearanceTags.length) {
                appearanceInput.value = appearanceTags.map((tag) => tag.replace(/_/g, ' ')).join(', ');
            }
            const panel = querySettings(`.danbooru-panel[data-char-id="${CSS.escape(characterId)}"]`);
            if (panel) {
                panel.classList.add('hidden');
                panel.replaceChildren();
            }
            refreshSettingsSummary();
            toastr.success('已填入 Danbooru 标签，请保存角色');
        });
        list.appendChild(item);
    });
    target.replaceChildren(list);
}

function fillSharedDrawForm() {
    const sharedDrawSettings = getSharedDrawSettings();
    setSelectValue('sd-shared-llm-provider', sharedDrawSettings.llmApi?.provider || 'st');
    setValue('sd-shared-llm-url', sharedDrawSettings.llmApi?.url || '');
    setValue('sd-shared-llm-key', sharedDrawSettings.llmApi?.key || '');
    setChecked('sd-shared-use-stream', sharedDrawSettings.useStream === true);
    setChecked('sd-shared-use-worldinfo', sharedDrawSettings.useWorldInfo === true);
    setChecked('sd-shared-disable-prefill', sharedDrawSettings.disablePrefill === true);
    fillSharedLlmModelFields();
    updateSharedLlmProviderUI();
    renderFilterRules(sharedDrawSettings.messageFilterRules || []);
    renderCharacterTagList(sharedDrawSettings.characterTags || []);
    void ensureSdDanbooruLoadedForForm(sharedDrawSettings);
}

async function saveSharedDrawSettings({ notify = false } = {}) {
    const llmApi = {
        provider: getValue('sd-shared-llm-provider').trim() || 'st',
        url: getValue('sd-shared-llm-url').trim(),
        key: getValue('sd-shared-llm-key').trim(),
        model: getCurrentSharedLlmModel(),
    };
    const characterTags = getSharedCharacterTagsFromForm();
    return await updateSharedDrawSettingsPersistent((settings) => {
        settings.llmApi = {
            ...(settings.llmApi || {}),
            ...llmApi,
        };
        settings.useStream = getChecked('sd-shared-use-stream');
        settings.useWorldInfo = getChecked('sd-shared-use-worldinfo');
        settings.disablePrefill = getChecked('sd-shared-disable-prefill');
        settings.messageFilterRules = collectFilterRules();
        settings.characterTags = characterTags;
    }, '共享规划设置已保存', { notify, silent: false });
}

async function saveAllSettings({ notify = false, triggerButton = null, statusElementId = '' } = {}) {
    const saveTask = async () => {
        const [sdOk, sharedOk] = await Promise.all([
            persistSettings(readForm(), 'SD WebUI 设置已保存', { notify: false, silent: false }),
            saveSharedDrawSettings({ notify: false }),
        ]);
        return sdOk && sharedOk;
    };

    const runPostSaveHooks = async () => {
        try {
            const fp = await import('./floating-panel.js');
            const settings = getSettings();
            fp.updateButtonVisibility?.(settings.showFloorButton !== false, settings.showFloatingButton !== false);
            fp.updateAutoModeUI?.();
        } catch {}
    };

    if (triggerButton) {
        const ok = await runSaveButtonTask(triggerButton, saveTask, {
            statusElementId,
            pendingText: '正在保存...',
            successText: '已保存到小白X服务端配置',
            errorText: '保存失败，请重试',
            notify,
        });
        if (ok) await runPostSaveHooks();
        return ok;
    }

    let ok = false;
    try {
        ok = await saveTask();
    } catch (error) {
        console.warn('[SdDraw] 保存操作失败:', error);
        ok = false;
    }

    if (ok) {
        await runPostSaveHooks();
    }
    if (statusElementId) {
        updateStatusText(
            statusElementId,
            ok ? 'success' : 'error',
            ok ? '已保存到小白X服务端配置' : '保存失败，请重试',
        );
    }

    if (ok && notify) {
        toastr.success('SD WebUI 与共享规划设置已保存');
    } else if (!ok && notify) {
        toastr.error('SD WebUI 或共享规划设置保存失败');
    }
    refreshSettingsSummary();
    return ok;
}

function addCharacterTagDraft() {
    const current = getSharedCharacterTagsFromForm();
    current.push({
        id: `sd-char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: '',
        aliases: [],
        type: 'girl',
        appearance: '',
        negativeTags: '',
        danbooruTag: '',
        outfits: [],
    });
    renderCharacterTagList(current);
    refreshSettingsSummary();
}

function clearCharacterTagsDraft() {
    const current = getSharedCharacterTagsFromForm();
    if (!current.length) {
        toastr.warning('没有角色可清除');
        return;
    }
    if (!confirm(`确定清空全部 ${current.length} 个角色？此操作不可撤销。`)) return;
    renderCharacterTagList([]);
    refreshSettingsSummary();
}

function exportSharedCharacterTags() {
    const current = getSharedCharacterTagsFromForm();
    if (!current.length) {
        toastr.warning('没有可导出的角色');
        return;
    }
    const data = {
        type: 'novel-draw-characters',
        version: 3,
        characters: current,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'character-tags.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function importSharedCharacterTags(input) {
    const file = input?.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.type !== 'novel-draw-characters' || !Array.isArray(data.characters)) {
            throw new Error('无效文件');
        }
        const merged = [...getSharedCharacterTagsFromForm()];
        for (const char of data.characters) {
            if (!char?.name) continue;
            const existingIndex = merged.findIndex((item) => item.name === char.name);
            const nextChar = {
                id: char.id || `sd-char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: char.name || '',
                aliases: Array.isArray(char.aliases) ? char.aliases : [],
                type: char.type || 'girl',
                appearance: char.appearance || char.tags || '',
                negativeTags: char.negativeTags || '',
                danbooruTag: char.danbooruTag || '',
                outfits: Array.isArray(char.outfits) ? char.outfits : [],
            };
            if (existingIndex >= 0) {
                merged[existingIndex] = { ...merged[existingIndex], ...nextChar, id: merged[existingIndex].id };
            } else {
                merged.push(nextChar);
            }
        }
        renderCharacterTagList(merged);
        refreshSettingsSummary();
        toastr.success(`已导入 ${data.characters.length} 个角色，请记得保存`);
    } catch (error) {
        toastr.error(`导入失败：${error?.message || '文件格式错误'}`);
    } finally {
        if (input) input.value = '';
    }
}

function deleteCharacterTagDraft(characterId = '') {
    const current = getSharedCharacterTagsFromForm().filter((item) => String(item.id || '') !== String(characterId || ''));
    renderCharacterTagList(current);
    refreshSettingsSummary();
}

function refreshSettingsSummary() {
    const settings = getSettings();
    const activePreset = getActivePreset(settings);
    const llmProvider = getValue('sd-shared-llm-provider').trim() || getSharedDrawSettings().llmApi?.provider || 'st';
    const draftCharacterCards = querySettingsAll('.sd-char-card').length;
    const characterCount = draftCharacterCards > 0
        ? draftCharacterCards
        : (querySettings('#sd-shared-character-list .sd-char-empty')
            ? 0
            : (getSharedDrawSettings().characterTags?.length || 0));
    const presetEl = querySettings('#sd-draw-summary-preset');
    const charEl = querySettings('#sd-draw-summary-characters');
    const charSideEl = querySettings('#sd-draw-summary-characters-side');
    const charResultEl = querySettings('#sd-draw-character-result-count');
    const llmEl = querySettings('#sd-draw-summary-llm');
    if (presetEl) presetEl.textContent = activePreset?.name || '默认';
    if (charEl) charEl.textContent = String(characterCount);
    if (charSideEl) charSideEl.textContent = String(characterCount);
    if (charResultEl) charResultEl.textContent = `${characterCount} / ${characterCount}`;
    if (llmEl) llmEl.textContent = llmProvider === 'st' ? 'ST' : llmProvider;
}


function setValue(id, value) {
    const el = getSettingsElement(id);
    if (el) el.value = value ?? '';
}

function getValue(id) {
    return getSettingsElement(id)?.value ?? '';
}

function setChecked(id, checked) {
    const el = getSettingsElement(id);
    if (el) el.checked = checked === true;
}

function getChecked(id) {
    return getSettingsElement(id)?.checked === true;
}

function setSelectValue(id, value) {
    const el = getSettingsElement(id);
    if (!el) return;
    const normalized = String(value ?? '');
    if (normalized && !Array.from(el.options).some(opt => opt.value === normalized)) {
        const option = document.createElement('option');
        option.value = normalized;
        option.textContent = normalized;
        el.appendChild(option);
    }
    el.value = normalized;
}

function populateSelect(id, options, { value, emptyLabel = '' } = {}) {
    const select = getSettingsElement(id);
    if (!select) return;
    const current = value ?? select.value;
    select.textContent = '';
    if (emptyLabel) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = emptyLabel;
        select.appendChild(empty);
    }
    for (const item of options) {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
    }
    setSelectValue(id, current);
}

function normalizeSdModelOptions(models = []) {
    return (Array.isArray(models) ? models : []).map((model) => {
        if (typeof model === 'string') {
            return { value: model, label: model };
        }
        return {
            value: String(model?.value || model?.title || model?.model_name || model?.name || ''),
            label: String(model?.text || model?.label || model?.title || model?.model_name || model?.name || ''),
        };
    }).filter((item) => item.value);
}

function normalizeSdSamplerOptions(samplers = []) {
    return (Array.isArray(samplers) ? samplers : []).map((sampler) => {
        if (typeof sampler === 'string') {
            return { value: sampler, label: sampler };
        }
        return {
            value: String(sampler?.value || sampler?.name || sampler?.label || sampler?.text || ''),
            label: String(sampler?.label || sampler?.text || sampler?.name || sampler?.value || ''),
        };
    }).filter((item) => item.value);
}

async function refreshSdOptions({ notify = false } = {}) {
    try {
        const [models, samplers] = await Promise.all([
            fetchSdModels(),
            fetchSdSamplers(),
        ]);
        const settings = getSettings();
        const activePreset = getActivePreset(settings);
        populateSelect('sd-draw-model', normalizeSdModelOptions(models), {
            value: activePreset.model || settings.selectedModel || '',
            emptyLabel: '不切换后端已加载模型',
        });
        populateSelect('sd-draw-sampler', normalizeSdSamplerOptions(samplers), {
            value: activePreset.sampler_name || settings.defaultParams?.sampler_name || '',
            emptyLabel: '不切换后端采样器',
        });
        if (notify) toastr.success('SD 模型和采样器已刷新');
        return true;
    } catch (error) {
        if (notify) toastr.error(error?.message || '刷新失败', 'SD WebUI');
        return false;
    }
}

export async function openSettings() {
    await loadSettings();
    await loadSharedDrawSettings();
    const overlay = await createOverlay();
    fillForm(getSettings());
    switchSettingsView('test');
    syncOverlayHeight();
    overlay.style.display = 'block';
    void refreshSdOptions();
}

function hideSettings() {
    abortPendingRequest();

    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        window.visualViewport?.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }

    overlayElement?.remove();
    overlayElement = null;
    overlayFrame = null;
    frameReadyPromise = null;
    eventsBound = false;
}

function abortPendingRequest() {
    try { pendingController?.abort(); } catch {}
    pendingController = null;
}

async function testConnection() {
    const settings = getSettings();
    if (!settings.host) {
        toastr.warning('请先填写 SD WebUI 地址');
        return false;
    }

    abortPendingRequest();
    pendingController = new AbortController();
    const timeoutId = setTimeout(() => pendingController?.abort(), settings.timeout);

    try {
        const response = await fetch('/api/sd/ping', {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({ url: settings.host, auth: settings.auth }),
            signal: pendingController.signal,
        });

        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(text || response.statusText || `HTTP ${response.status}`);
        }

        toastr.success('SD WebUI 连接成功');
        return true;
    } catch (error) {
        const message = error?.name === 'AbortError'
            ? '连接超时，请检查地址是否能被酒馆服务器访问'
            : (error?.message || '无法连接 SD WebUI');
        toastr.error(message, 'SD WebUI 连接失败');
        return false;
    } finally {
        clearTimeout(timeoutId);
        pendingController = null;
    }
}

function composePrompt(prefix, prompt) {
    return joinTags(prefix || '', prompt || '');
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function updateStatusText(elementId, state, text) {
    const el = getSettingsElement(elementId);
    if (!el) return;
    el.textContent = text || '';
    el.className = `status-text${state ? ` ${state}` : ''}`;
}

async function withSaveTimeout(promise) {
    try {
        return await promise;
    } catch (error) {
        console.warn('[SdDraw] 保存操作失败:', error);
        return false;
    }
}

async function runSaveButtonTask(button, task, {
    statusElementId = '',
    pendingText = '正在保存...',
    successText = '已保存',
    errorText = '保存失败，请重试',
    notify = false,
} = {}) {
    if (statusElementId) updateStatusText(statusElementId, '', pendingText);
    setSavingState(button);
    let ok = false;
    try {
        ok = await Promise.resolve().then(task);
    } catch (error) {
        console.warn('[SdDraw] 保存操作失败:', error);
        ok = false;
    }
    handleSaveResult(ok, button);
    if (statusElementId) updateStatusText(statusElementId, ok ? 'success' : 'error', ok ? successText : errorText);
    if (notify) {
        if (ok) toastr.success(successText, 'SD WebUI');
        else toastr.error(errorText, 'SD WebUI');
    }
    refreshSettingsSummary();
    return ok;
}

function setSavingState(button) {
    if (!button) return;
    saveBtnStates.set(button, true);
    const icon = button.querySelector('i');
    if (icon) {
        button._origIcon = icon.className;
        icon.className = 'fa-solid fa-spinner fa-spin';
    }
    button.classList.add('saving');
    button.disabled = true;
}

function handleSaveResult(success, button, fallbackIcon = 'fa-solid fa-floppy-disk') {
    if (!button) return;
    saveBtnStates.delete(button);
    button.classList.remove('saving');
    button.disabled = false;
    const icon = button.querySelector('i');
    if (!icon) return;

    if (success) {
        icon.className = 'fa-solid fa-check';
        button.classList.add('save-success');
        setTimeout(() => {
            button.classList.remove('save-success');
            icon.className = button._origIcon || fallbackIcon;
        }, 1400);
        return;
    }

    icon.className = 'fa-solid fa-xmark';
    button.classList.add('save-failed');
    setTimeout(() => {
        button.classList.remove('save-failed');
        icon.className = button._origIcon || fallbackIcon;
    }, 1800);
}

function generateSlotId() {
    return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function generateImgId() {
    return `sd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createGenerationJob(messageId) {
    const key = String(messageId);
    if (generationJobs.has(key)) {
        throw new Error('该楼层已有任务进行中');
    }
    const job = { controller: new AbortController(), messageId };
    generationJobs.set(key, job);
    return job;
}

export function abortGeneration(messageId = null) {
    if (messageId !== null && messageId !== undefined) {
        const job = generationJobs.get(String(messageId));
        if (!job) return false;
        job.controller.abort();
        generationJobs.delete(String(messageId));
        return true;
    }
    let aborted = false;
    for (const job of generationJobs.values()) {
        job.controller.abort();
        aborted = true;
    }
    generationJobs.clear();
    abortPendingRequest();
    return aborted;
}

export function isGenerating(messageId = null) {
    if (messageId !== null && messageId !== undefined) return generationJobs.has(String(messageId));
    return generationJobs.size > 0;
}

async function autoGenerateForLastAI() {
    const settings = getSettings();
    if (!moduleInitialized || settings.mode !== 'auto') return;

    const ctx = getContext();
    const chat = ctx.chat || [];
    const lastIdx = chat.length - 1;
    if (lastIdx < 0) return;

    const lastMessage = chat[lastIdx];
    if (!lastMessage || lastMessage.is_user) return;

    const content = String(lastMessage.mes || '').replace(/\[image:[a-z0-9\-_]+\]/gi, '').trim();
    if (content.length < 50) return;

    lastMessage.extra ||= {};
    if (lastMessage.extra.xb_sd_auto_done) return;
    if (autoBusy || isGenerating(lastIdx)) return;

    autoBusy = true;

    try {
        const fp = await import('./floating-panel.js');
        const floatingOn = settings.showFloatingButton !== false;
        const floorOn = settings.showFloorButton !== false;
        const useFloatingOnly = floatingOn && floorOn;

        const updateState = (state, data = {}) => {
            if (useFloatingOnly || (floatingOn && !floorOn)) {
                fp.setFloatingState?.(state, data);
            } else if (floorOn) {
                fp.setStateForMessage?.(lastIdx, state, data);
            }
        };

        if (floorOn && !useFloatingOnly) {
            const messageEl = document.querySelector(`.mes[mesid="${lastIdx}"]`);
            if (messageEl) {
                fp.ensureSdDrawPanel?.(messageEl, lastIdx, { force: true });
            }
        }

        await generateAndInsertImages({
            messageId: lastIdx,
            onStateChange: (state, data) => {
                switch (state) {
                    case 'queued': updateState(fp.FloatState?.QUEUED, data); break;
                    case 'llm': updateState(fp.FloatState?.LLM); break;
                    case 'gen':
                    case 'progress': updateState(fp.FloatState?.GEN, data); break;
                    case 'cooldown': updateState(fp.FloatState?.COOLDOWN, data); break;
                    case 'success':
                        updateState(
                            (data.aborted && data.success === 0) ? fp.FloatState?.IDLE
                                : (data.success < data.total) ? fp.FloatState?.PARTIAL
                                    : fp.FloatState?.SUCCESS,
                            data,
                        );
                        break;
                }
            },
        });

        lastMessage.extra.xb_sd_auto_done = true;
    } catch (error) {
        console.error('[SdDraw] 自动配图失败:', error);
        try {
            const fp = await import('./floating-panel.js');
            const classified = classifyError(error);
            const floatingOn = settings.showFloatingButton !== false;
            const floorOn = settings.showFloorButton !== false;
            const useFloatingOnly = floatingOn && floorOn;
            if (useFloatingOnly || (floatingOn && !floorOn)) {
                fp.setFloatingState?.(fp.FloatState?.ERROR, { error: classified });
            } else if (floorOn) {
                fp.setStateForMessage?.(lastIdx, fp.FloatState?.ERROR, { error: classified });
            }
        } catch {}
    } finally {
        autoBusy = false;
    }
}

async function buildTasksFromMessage({ message, messageId, signal, promptOverride = '', negativePromptOverride = '' }) {
    if (promptOverride.trim()) {
        return [{
            scene: promptOverride.trim(),
            chars: [],
            anchor: '',
        }];
    }

    await loadSharedDrawSettings();

    const sharedDrawSettings = getSharedDrawSettings();
    const rawText = String(message.mes || '').replace(/\[image:[a-z0-9\-_]+\]/gi, '').trim();
    const filterRules = sharedDrawSettings.messageFilterRules?.length
        ? sharedDrawSettings.messageFilterRules
        : DEFAULT_MESSAGE_FILTER_RULES;
    const messageText = applyMessageFilterRules(rawText, filterRules);
    if (!messageText) throw new Error('消息内容为空（可能被过滤规则清空）');

    const presentCharacters = detectPresentCharacters(messageText, sharedDrawSettings.characterTags || []);
    let worldbookEntries = null;

    if (sharedDrawSettings.advancedMode) {
        if (sharedDrawSettings.worldbooks?.enabled && sharedDrawSettings.worldbooks.uploadedBooks?.length) {
            const processor = new WorldbookProcessor();
            const charNames = presentCharacters.map(c => c.name).join(' ');
            const allEntries = sharedDrawSettings.worldbooks.uploadedBooks.flatMap(b => b.entries || []);
            worldbookEntries = processor.processFromEntries({
                entries: allEntries,
                contextText: `${messageText} ${charNames}`,
                keywordFilterMode: sharedDrawSettings.worldbooks.keywordFilterMode || 'auto',
            });
        }
    }

    let planRaw;
    try {
        const preset = getActivePreset(getSettings());
        planRaw = await generateScenePlan({
            messageText,
            presentCharacters,
            llmApi: sharedDrawSettings.llmApi,
            useStream: sharedDrawSettings.useStream,
            useWorldInfo: (sharedDrawSettings.advancedMode && sharedDrawSettings.worldbooks?.enabled) ? false : sharedDrawSettings.useWorldInfo,
            customPrompts: SD_SCENE_PROMPTS,
            promptDefaults: SD_SCENE_PROMPTS,
            worldbookEntries,
            timeout: sharedDrawSettings.timeout || 120000,
            maxImages: preset.maxImages || 0,
            maxCharactersPerImage: preset.maxCharactersPerImage || 0,
            disablePrefill: !!sharedDrawSettings.disablePrefill,
            signal,
        });
    } catch (error) {
        if (signal.aborted) throw new Error('已取消');
        if (error instanceof LLMServiceError) {
            throw new Error(`场景分析失败: ${error.message}`);
        }
        throw error;
    }

    let tasks = parseImagePlan(planRaw);
    if (!tasks.length) throw new Error('未解析到图片任务');

    const preset = getActivePreset(getSettings());
    const maxImg = preset.maxImages || 0;
    const maxChar = preset.maxCharactersPerImage || 0;
    if (maxImg > 0 && tasks.length > maxImg) tasks = tasks.slice(0, maxImg);
    if (maxChar > 0) {
        tasks = tasks.map(task => ({
            ...task,
            chars: Array.isArray(task.chars) ? task.chars.slice(0, maxChar) : [],
        }));
    }

    console.log('[SdDraw] LLM plan ready for message %s: %d task(s)', messageId, tasks.length);
    return tasks;
}

function buildPromptForTask(task, sharedDrawSettings, sdSettings, promptOverride = '', negativePromptOverride = '') {
    if (promptOverride.trim()) {
        return {
            positive: composePrompt(sdSettings.positivePrefix, promptOverride),
            negative: composePrompt(sdSettings.negativePrefix, negativePromptOverride),
            characterPrompts: [],
        };
    }

    const characterPrompts = assembleCharacterPrompts(task.chars || [], sharedDrawSettings.characterTags || [], {
        preserveDanbooruCanonical: true,
    });
    const charPositive = characterPrompts.map(item => item.prompt).filter(Boolean).join(', ');
    const charNegative = characterPrompts.map(item => item.uc).filter(Boolean).join(', ');
    return {
        positive: joinTags(sdSettings.positivePrefix, task.scene, charPositive),
        negative: joinTags(sdSettings.negativePrefix, negativePromptOverride, charNegative),
        characterPrompts,
    };
}

async function persistChatSilently() {
    const ctx = getContext();
    if (ctx?.saveChat) await Promise.resolve(ctx.saveChat());
}

function setImageState(container, state) {
    container.dataset.state = state;
    const imgEl = container.querySelector('img');
    const menuWrap = container.querySelector('.xb-nd-menu-wrap');
    const isBusy = state === ImageState.SAVING || state === ImageState.REFRESHING;
    if (imgEl) imgEl.style.opacity = isBusy ? '0.5' : '';
    if (menuWrap) {
        menuWrap.style.pointerEvents = isBusy ? 'none' : '';
        menuWrap.style.opacity = isBusy ? '0.3' : '';
    }
    container.style.border = state === ImageState.PREVIEW ? '1px dashed rgba(255,152,0,0.35)' : 'none';
    const dropdown = container.querySelector('.xb-nd-dropdown');
    if (dropdown) {
        const saveItem = dropdown.querySelector('[data-action="save-image"]');
        if (state === ImageState.PREVIEW && !saveItem) {
            dropdown.insertAdjacentHTML('afterbegin', '<button data-action="save-image" title="保存到服务器">💾</button>');
        } else if (state !== ImageState.PREVIEW && saveItem) {
            saveItem.remove();
        }
    }
    container.querySelector('.xb-nd-indicator')?.remove();
    if (state === ImageState.SAVING) container.insertAdjacentHTML('afterbegin', '<div class="xb-nd-indicator">💾 保存中...</div>');
    else if (state === ImageState.REFRESHING) container.insertAdjacentHTML('afterbegin', '<div class="xb-nd-indicator">🔄 生成中...</div>');
}

function updateNavControls(container, currentIndex, total) {
    const pill = container.querySelector('.xb-nd-nav-pill');
    if (pill) {
        pill.dataset.current = currentIndex;
        pill.dataset.total = total;
        const text = pill.querySelector('.xb-nd-nav-text');
        if (text) text.textContent = `${total - currentIndex} / ${total}`;
        const prevBtn = pill.querySelector('[data-action="nav-prev"]');
        const nextBtn = pill.querySelector('[data-action="nav-next"]');
        if (prevBtn) prevBtn.disabled = currentIndex >= total - 1;
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.title = currentIndex === 0 ? '重新生成' : '下一版本';
        }
    }
    const wrap = container.querySelector('.xb-nd-img-wrap');
    if (wrap) wrap.dataset.total = total;
}

function syncContainerToPreview(container, preview, historyCount = 1, currentIndex = 0) {
    const imgEl = container.querySelector('.xb-nd-img-wrap > img');
    if (!imgEl || !preview) return;
    imgEl.src = preview.savedUrl || `data:image/png;base64,${preview.base64}`;
    container.dataset.imgId = preview.imgId;
    container.dataset.tags = String(preview.tags || '');
    container.dataset.positive = String(preview.positive || '');
    container.dataset.currentIndex = String(currentIndex);
    container.dataset.historyCount = String(historyCount);
    setImageState(container, preview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
    updateNavControls(container, currentIndex, historyCount);
}

async function navigateToImage(container, targetIndex) {
    const slotId = container.dataset.slotId;
    const historyCount = parseInt(container.dataset.historyCount) || 1;
    const currentIndex = parseInt(container.dataset.currentIndex) || 0;
    if (targetIndex < 0 || targetIndex >= historyCount || targetIndex === currentIndex) return;
    const previews = await getPreviewsBySlot(slotId);
    const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
    if (targetIndex >= successPreviews.length) return;
    const targetPreview = successPreviews[targetIndex];
    const imgEl = container.querySelector('.xb-nd-img-wrap > img');
    if (!imgEl || !targetPreview) return;
    const direction = targetIndex > currentIndex ? 'left' : 'right';
    imgEl.classList.add(`sliding-${direction}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    syncContainerToPreview(container, targetPreview, historyCount, targetIndex);
    await setSlotSelection(slotId, targetPreview.imgId);
    imgEl.classList.remove(`sliding-${direction}`);
    imgEl.classList.add(`sliding-in-${direction === 'left' ? 'left' : 'right'}`);
    await new Promise(resolve => setTimeout(resolve, 250));
    imgEl.classList.remove('sliding-in-left', 'sliding-in-right');
}

function buildSharedGalleryCallbacks(slotId, messageId) {
    return {
        onUse: (sid, msgId, selected, historyCount) => {
            const cont = document.querySelector(`.xb-nd-img[data-slot-id="${sid}"]`);
            if (cont) {
                syncContainerToPreview(cont, selected, historyCount, 0);
            }
        },
        onSave: async (imgId, url) => {
            const cont = document.querySelector(`.xb-nd-img[data-img-id="${imgId}"]`);
            if (cont) {
                const img = cont.querySelector('img');
                if (img) img.src = url;
                setImageState(cont, ImageState.SAVED);
            }
        },
        onDelete: async (sid, deletedImgId, remainingPreviews) => {
            const cont = document.querySelector(`.xb-nd-img[data-slot-id="${sid}"]`);
            if (cont && cont.dataset.imgId === deletedImgId && remainingPreviews.length > 0) {
                syncContainerToPreview(cont, remainingPreviews[0], remainingPreviews.length, 0);
            }
        },
        onBecameEmpty: async (sid, msgId, lastImageInfo = {}) => {
            const cont = document.querySelector(`.xb-nd-img[data-slot-id="${sid}"]`);
            if (cont) {
                // Template-only UI markup built locally.
                // eslint-disable-next-line no-unsanitized/property
                cont.outerHTML = buildFailedPlaceholderHtml({
                    slotId: sid,
                    messageId: msgId,
                    tags: lastImageInfo.tags || '',
                    positive: lastImageInfo.positive || '',
                    errorType: '图片已删除',
                    errorMessage: '点击重试可重新生成',
                });
            }
            await storeFailedPlaceholder({
                slotId: sid,
                messageId: msgId,
                tags: lastImageInfo.tags || '',
                positive: lastImageInfo.positive || '',
                errorType: 'deleted',
                errorMessage: '图片已删除，点击重试可重新生成',
            }).catch(() => {});
            if (getSettingsElement('sd-gallery-container')) {
                await renderGalleryManagement();
            }
        },
    };
}

function buildFailedPlaceholderHtml({ slotId, messageId, tags, positive, errorType, errorMessage }) {
    const escapedTags = escapeHtml(tags || '');
    const escapedPositive = escapeHtml(positive || '');
    return `<div class="xb-nd-img" data-slot-id="${slotId}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="failed" style="margin:0.8em 0;text-align:center;position:relative;display:block;width:100%;border:1px dashed rgba(248,113,113,0.5);border-radius:14px;padding:20px;background:rgba(248,113,113,0.05);">
<div class="xb-nd-failed-icon">⚠️</div>
<div class="xb-nd-failed-title">${escapeHtml(errorType || '生成失败')}</div>
<div class="xb-nd-failed-desc">${escapeHtml(errorMessage || '点击重试')}</div>
<div class="xb-nd-failed-btns">
    <button class="xb-nd-retry-btn" data-action="retry-image">🔄 重新生成</button>
    <button class="xb-nd-edit-btn" data-action="edit-tags">✏️ 编辑TAG</button>
    <button class="xb-nd-remove-btn" data-action="remove-placeholder">🗑️ 移除</button>
</div>
<div class="xb-nd-edit" style="display:none;margin-top:12px;text-align:left;">
    <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px;">编辑 TAG（场景描述）</div>
    <textarea class="xb-nd-edit-input">${escapeHtml(tags || '')}</textarea>
    <div style="display:flex;gap:6px;margin-top:8px;">
        <button data-action="save-tags-retry" style="flex:1;padding:6px 12px;background:rgba(212,165,116,0.3);border:1px solid rgba(212,165,116,0.5);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">保存并重试</button>
        <button data-action="cancel-edit" style="padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">取消</button>
    </div>
</div>
</div>`;
}

async function handleImageDelegatedClick(event) {
    const container = event.target?.closest?.('.xb-nd-img');
    if (!container) {
        document.querySelectorAll('.xb-nd-menu-wrap.open').forEach(w => w.classList.remove('open'));
        return;
    }

    const action = event.target?.closest?.('[data-action]')?.dataset?.action;
    if (!action) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if (action === 'toggle-menu') {
        const wrap = container.querySelector('.xb-nd-menu-wrap');
        document.querySelectorAll('.xb-nd-menu-wrap.open').forEach(w => {
            if (w !== wrap) w.classList.remove('open');
        });
        wrap?.classList.toggle('open');
        return;
    }

    if (action === 'open-gallery') {
        await openGallery(
            container.dataset.slotId,
            Number(container.dataset.mesid),
            buildSharedGalleryCallbacks(container.dataset.slotId, Number(container.dataset.mesid)),
        );
        return;
    }

    if (action === 'refresh-image' || action === 'nav-next') {
        container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
        const currentIndex = parseInt(container.dataset.currentIndex) || 0;
        if (action === 'nav-next' && currentIndex > 0) {
            await navigateToImage(container, currentIndex - 1);
        } else {
            await refreshSingleImage(container);
        }
        return;
    }

    if (action === 'nav-prev') {
        const currentIndex = parseInt(container.dataset.currentIndex) || 0;
        const historyCount = parseInt(container.dataset.historyCount) || 1;
        if (currentIndex < historyCount - 1) {
            await navigateToImage(container, currentIndex + 1);
        }
        return;
    }

    if (action === 'delete-image') {
        container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
        await deleteCurrentImage(container);
        return;
    }

    if (action === 'retry-image') {
        await retryFailedImage(container);
        return;
    }

    if (action === 'edit-tags') {
        container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
        toggleEditPanel(container, true);
        return;
    }

    if (action === 'cancel-edit') {
        toggleEditPanel(container, false);
        return;
    }

    if (action === 'save-tags') {
        await saveEditedTags(container);
        return;
    }

    if (action === 'save-tags-retry') {
        await saveTagsAndRetry(container);
        return;
    }

    if (action === 'save-image') {
        container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
        await saveCurrentImage(container);
        return;
    }

    if (action === 'remove-placeholder') {
        await removePlaceholder(container);
    }
}

function toggleEditPanel(container, show) {
    const edit = container.querySelector('.xb-nd-edit');
    if (edit) edit.style.display = show ? 'block' : 'none';
}

async function saveEditedTags(container) {
    const input = container.querySelector('.xb-nd-edit-input');
    if (!input) return;
    container.dataset.tags = input.value || '';
    toggleEditPanel(container, false);
    toastr.success('TAG 已更新，重绘时会使用新内容');
}

async function refreshSingleImage(container) {
    const slotId = container.dataset.slotId;
    const messageId = Number(container.dataset.mesid);
    const prompt = container.dataset.positive || container.dataset.tags || '';
    if (!slotId || !prompt) return;

    try {
        container.classList.add('busy');
        setImageState(container, ImageState.REFRESHING);
        const settings = getSettings();
        const params = getEffectiveParams(settings);
        const base64 = await generateSdImageQueued({
            prompt,
            negativePrompt: params.negativePrefix || '',
            params,
        });
        const imgId = generateImgId();
        await storePreview({
            imgId,
            slotId,
            messageId,
            base64,
            tags: container.dataset.tags || prompt,
            positive: prompt,
            negativePrompt: params.negativePrefix || '',
            anchor: '',
        });
        await setSlotSelection(slotId, imgId);
        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
        const html = buildImageHtml({
            slotId,
            imgId,
            url: `data:image/png;base64,${base64}`,
            tags: container.dataset.tags || prompt,
            positive: prompt,
            messageId,
            historyCount: Math.max(1, successPreviews.length),
            currentIndex: 0,
        });
        const node = createNodeFromHtml(html);
        if (node) container.replaceWith(node);
        toastr.success('已重绘');
    } catch (error) {
        setImageState(container, ImageState.PREVIEW);
        toastr.error(error?.message || '重绘失败', 'SD WebUI');
    } finally {
        container.classList.remove('busy');
    }
}

async function retryFailedImage(container) {
    const slotId = container.dataset.slotId;
    const messageId = Number(container.dataset.mesid);
    const tags = String(container.dataset.tags || '').trim();
    if (!slotId) return;

    // Template-only UI markup built locally.
    // eslint-disable-next-line no-unsanitized/property
    container.innerHTML = '<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.6);"><div style="font-size:24px;margin-bottom:8px;">🎨</div><div>生成中...</div></div>';

    let latestFailed = null;
    try {
        const settings = getSettings();
        const params = getEffectiveParams(settings);
        const failedPreviews = await getPreviewsBySlot(slotId);
        latestFailed = failedPreviews.find(p => p.status === 'failed') || null;
        const charPositive = (latestFailed?.characterPrompts || []).map(item => item?.prompt).filter(Boolean).join(', ');
        const positive = joinTags(params.positivePrefix || '', tags, charPositive);
        const negative = latestFailed?.negativePrompt || params.negativePrefix || '';

        const base64 = await generateSdImageQueued({
            prompt: positive,
            negativePrompt: negative,
            params,
        });

        const imgId = generateImgId();
        await storePreview({
            imgId,
            slotId,
            messageId,
            base64,
            tags,
            positive,
            characterPrompts: latestFailed?.characterPrompts || [],
            negativePrompt: negative,
            anchor: latestFailed?.anchor || '',
        });
        await deleteFailedRecordsForSlot(slotId);
        await setSlotSelection(slotId, imgId);

        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        container.outerHTML = buildImageHtml({
            slotId,
            imgId,
            url: `data:image/png;base64,${base64}`,
            tags,
            positive,
            messageId,
            state: ImageState.PREVIEW,
            historyCount: 1,
            currentIndex: 0,
        });
        toastr.success('图片生成成功');
    } catch (error) {
        const classified = classifyError(error) || ErrorType.UNKNOWN;
        await storeFailedPlaceholder({
            slotId,
            messageId,
            tags,
            positive: String(container.dataset.positive || ''),
            errorType: classified.code,
            errorMessage: classified.desc,
            characterPrompts: latestFailed?.characterPrompts || [],
            negativePrompt: latestFailed?.negativePrompt || '',
            anchor: latestFailed?.anchor || '',
        }).catch(() => {});

        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        container.outerHTML = buildFailedPlaceholderHtml({
            slotId,
            messageId,
            tags,
            positive: String(container.dataset.positive || ''),
            errorType: classified.label,
            errorMessage: classified.desc,
        });
        toastr.error(classified.desc || '重试失败', 'SD WebUI');
    }
}

async function saveTagsAndRetry(container) {
    const input = container.querySelector('.xb-nd-edit-input');
    if (!input) return;
    const nextTags = input.value.trim();
    if (!nextTags) {
        alert('TAG 不能为空');
        return;
    }
    container.dataset.tags = nextTags;
    toggleEditPanel(container, false);
    await retryFailedImage(container);
}

async function removePlaceholder(container) {
    const slotId = container.dataset.slotId;
    const messageId = Number(container.dataset.mesid);
    if (!slotId) return;
    if (!confirm('确定移除此占位符？')) return;

    await deleteFailedRecordsForSlot(slotId).catch(() => {});
    await clearSlotSelection(slotId).catch(() => {});
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (message?.mes) {
        message.mes = String(message.mes || '').replace(createPlaceholder(slotId), '').replace(/\n{3,}/g, '\n\n');
        await persistChatSilently().catch(() => {});
    }
    container.remove();
    toastr.success('占位符已移除');
}

async function deleteCurrentImage(container) {
    const slotId = container.dataset.slotId;
    const imgId = container.dataset.imgId;
    const messageId = Number(container.dataset.mesid);
    if (!slotId) return;

    if (imgId) {
        try { await deletePreview(imgId); } catch {}
    }
    const previews = await getPreviewsBySlot(slotId).catch(() => []);
    if (!previews.some(item => item.status !== 'failed' && (item.base64 || item.savedUrl))) {
        await clearSlotSelection(slotId).catch(() => {});
        const ctx = getContext();
        const message = ctx.chat?.[messageId];
        if (message?.mes) {
            message.mes = message.mes.replace(createPlaceholder(slotId), '').replace(/\n{3,}/g, '\n\n');
            await persistChatSilently().catch(() => {});
        }
    }
    container.remove();
}

async function saveCurrentImage(container) {
    const imgId = container.dataset.imgId;
    const slotId = container.dataset.slotId;
    if (!imgId || !slotId) return;

    try {
        const previews = await getPreviewsBySlot(slotId);
        const preview = previews.find(item => item.imgId === imgId) || previews[0];
        if (!preview?.base64 && !preview?.savedUrl) throw new Error('图片缓存不存在');
        if (preview.savedUrl) {
            toastr.info('这张图已经保存到服务器');
            return;
        }

        const ctx = getContext();
        const charName = ctx.groupId
            ? String(ctx.groups?.[ctx.groupId]?.id ?? 'group')
            : String(ctx.characters?.[ctx.characterId]?.name || 'character');
        const url = await saveBase64AsFile(preview.base64, charName, `sd_${imgId}`, 'png');
        await updatePreviewSavedUrl(imgId, url);
        const img = container.querySelector('img');
        if (img) img.src = url;
        container.dataset.state = 'saved';
        toastr.success('图片已保存到服务器');
    } catch (error) {
        toastr.error(error?.message || '保存失败');
    }
}

function createNodeFromHtml(html) {
    const template = document.createElement('template');
    // Local image HTML generated by buildImageHtml.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild || null;
}

function setupImageDelegation() {
    if (imageDelegationBound) return;
    imageDelegationBound = true;
    document.addEventListener('click', handleImageDelegatedClick, { capture: true });
}

function cleanupImageDelegation() {
    if (!imageDelegationBound) return;
    document.removeEventListener('click', handleImageDelegatedClick, { capture: true });
    imageDelegationBound = false;
}

export async function generateAndInsertImages({
    messageId,
    promptOverride = '',
    negativePromptOverride = '',
    paramsOverride = {},
    onStateChange,
} = {}) {
    const resolvedMessageId = Number.isFinite(Number(messageId)) ? Number(messageId) : findLastAIMessageId();
    if (resolvedMessageId < 0) throw new Error('未找到可出图的 AI 消息');

    const job = createGenerationJob(resolvedMessageId);
    const signal = job.controller.signal;

    try {
        ensureDrawImageStyles();
        await openDB();
        const ctx = getContext();
        const initialChatId = ctx.chatId;
        const message = ctx.chat?.[resolvedMessageId];
        if (!message || message.is_user) throw new Error('消息不存在或不是 AI 消息');

        onStateChange?.('llm', {});
        const tasks = await buildTasksFromMessage({
            message,
            messageId: resolvedMessageId,
            signal,
            promptOverride,
            negativePromptOverride,
        });
        if (signal.aborted) throw new Error('已取消');

        const sdSettings = getSettings();
        const sharedDrawSettings = getSharedDrawSettings();
        const originalMes = message.mes;
        message.mes = String(message.mes || '').replace(/\[image:[a-z0-9\-_]+\]/gi, '');

        onStateChange?.('gen', { current: 0, total: tasks.length });
        const { messageFormatting } = await import('../../../../../../../../script.js');
        const results = [];
        let successCount = 0;
        let requiresFinalDomSync = false;

        for (let i = 0; i < tasks.length; i++) {
            if (signal.aborted) break;
            const currentCtx = getContext();
            if (currentCtx.chatId !== initialChatId || currentCtx.chat?.[resolvedMessageId] !== message) break;

            const task = tasks[i];
            const slotId = generateSlotId();
            const imgId = generateImgId();
            const params = getEffectiveParams(sdSettings, paramsOverride);
            const promptData = buildPromptForTask(task, sharedDrawSettings, {
                positivePrefix: params.positivePrefix,
                negativePrefix: params.negativePrefix,
            }, promptOverride, negativePromptOverride);
            let position = findAnchorPosition(message.mes, task.anchor);

            onStateChange?.('progress', { current: i + 1, total: tasks.length });

            let incrementalHtml = '';
            try {
                const base64 = await generateSdImageQueued({
                    prompt: promptData.positive,
                    negativePrompt: promptData.negative,
                    params,
                    signal,
                    onQueueStateChange: (queueState, queueData) => {
                        if (queueState === 'queued') {
                            onStateChange?.('queued', { current: i + 1, total: tasks.length, ...queueData });
                        }
                        if (queueState === 'start') {
                            onStateChange?.('progress', { current: i + 1, total: tasks.length });
                        }
                        if (queueState === 'cooldown' && i < tasks.length - 1) {
                            onStateChange?.('cooldown', {
                                duration: queueData.duration,
                                nextIndex: i + 2,
                                total: tasks.length,
                            });
                        }
                    },
                    cooldownMs: i < tasks.length - 1 ? FIXED_SD_REQUEST_DELAY_MS : 0,
                });
                await storePreview({
                    imgId,
                    slotId,
                    messageId: resolvedMessageId,
                    base64,
                    tags: task.scene || promptOverride,
                    positive: promptData.positive,
                    characterPrompts: promptData.characterPrompts,
                    negativePrompt: promptData.negative,
                    anchor: task.anchor || '',
                });
                await setSlotSelection(slotId, imgId);
                successCount++;
                results.push({ slotId, imgId, success: true });
                incrementalHtml = buildImageHtml({
                    slotId,
                    imgId,
                    url: `data:image/png;base64,${base64}`,
                    tags: task.scene || promptOverride,
                    positive: promptData.positive,
                    messageId: resolvedMessageId,
                    state: ImageState.PREVIEW,
                    historyCount: 1,
                    currentIndex: 0,
                });
            } catch (error) {
                if (signal.aborted) break;
                const errorType = classifyError(error) || ErrorType.UNKNOWN;
                await storeFailedPlaceholder({
                    slotId,
                    messageId: resolvedMessageId,
                    tags: task.scene || promptOverride,
                    positive: promptData.positive,
                    errorType: errorType.code,
                    errorMessage: errorType.desc,
                    characterPrompts: promptData.characterPrompts,
                    negativePrompt: promptData.negative,
                    anchor: task.anchor || '',
                });
                results.push({ slotId, success: false, error: errorType });
                incrementalHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId: resolvedMessageId,
                    tags: task.scene || promptOverride,
                    positive: promptData.positive,
                    errorType: errorType.label,
                    errorMessage: errorType.desc,
                });
            }

            if (signal.aborted) break;

            const placeholder = createPlaceholder(slotId);
            if (position >= 0) {
                position = findNearestSentenceEnd(message.mes, position);
                const before = message.mes.slice(0, position);
                const after = message.mes.slice(position);
                let insertText = placeholder;
                if (before.length > 0 && !before.endsWith('\n')) insertText = `\n${insertText}`;
                if (after.length > 0 && !after.startsWith('\n')) insertText = `${insertText}\n`;
                message.mes = before + insertText + after;
            } else {
                const needNewline = message.mes.length > 0 && !message.mes.endsWith('\n');
                message.mes += `${needNewline ? '\n' : ''}${placeholder}`;
            }

            const inserted = insertPreviewIntoRenderedMessage({
                messageId: resolvedMessageId,
                slotId,
                html: incrementalHtml,
                anchor: task.anchor || '',
            });
            if (!inserted) {
                requiresFinalDomSync = true;
                const formatted = messageFormatting(message.mes, message.name, message.is_system, message.is_user, resolvedMessageId);
                $(`[mesid="${resolvedMessageId}"] .mes_text`).html(formatted);
                await renderPreviewsForMessage(resolvedMessageId);
            }
        }

        if (signal.aborted) {
            if (successCount === 0) message.mes = originalMes;
            onStateChange?.('success', { success: successCount, total: tasks.length, aborted: true });
            return { success: successCount, total: tasks.length, results, aborted: true };
        }

        const finalCtx = getContext();
        const shouldUpdateDom = finalCtx.chatId === initialChatId && finalCtx.chat?.[resolvedMessageId] === message;
        if (shouldUpdateDom && requiresFinalDomSync) {
            const formatted = messageFormatting(message.mes, message.name, message.is_system, message.is_user, resolvedMessageId);
            $(`[mesid="${resolvedMessageId}"] .mes_text`).html(formatted);
            await renderPreviewsForMessage(resolvedMessageId);
        }
        if (shouldUpdateDom) {
            await persistChatSilently().catch(() => {});
        }

        onStateChange?.('success', { success: successCount, total: tasks.length });
        return { success: successCount, total: tasks.length, results };
    } finally {
        generationJobs.delete(String(resolvedMessageId));
    }
}

async function testGenerateFromSettingsPanel() {
    const prompt = getValue('sd-draw-test-prompt').trim();
    if (!prompt) {
        toastr.warning('请先填写测试生成 Prompt');
        return false;
    }

    const resultEl = getSettingsElement('sd-draw-test-result');
    if (resultEl) resultEl.textContent = '生成中...';

    abortPendingRequest();
    pendingController = new AbortController();

    try {
        const settings = getSettings();
        const effective = getEffectiveParams(settings);
        const base64 = await generateSdImageQueued({
            prompt: composePrompt(effective.positivePrefix, prompt),
            negativePrompt: composePrompt(effective.negativePrefix, getValue('sd-draw-test-negative')),
            params: effective,
            signal: pendingController.signal,
            onQueueStateChange: (state, data) => {
                if (!resultEl) return;
                if (state === 'queued') {
                    resultEl.textContent = data?.ahead > 0 ? `排队中，前方 ${data.ahead} 个任务...` : '排队中...';
                } else if (state === 'start') {
                    resultEl.textContent = '生成中...';
                }
            },
        });
        if (resultEl) {
            resultEl.replaceChildren();
            const img = document.createElement('img');
            img.src = `data:image/png;base64,${base64}`;
            resultEl.appendChild(img);
        }
        toastr.success('测试生成成功');
        return true;
    } catch (error) {
        if (resultEl) resultEl.textContent = '';
        toastr.error(error?.message || '生成失败', 'SD WebUI');
        return false;
    } finally {
        pendingController = null;
    }
}

export async function initSdDraw() {
    if (moduleInitialized) return;
    moduleInitialized = true;
    await loadPromptTemplates();
    await loadTagGuide();
    await loadSettings();
    ensureDrawImageStyles();
    setupImageDelegation();
    await openDB().catch(() => {});

    const floatingPanel = await import('./floating-panel.js');
    ensureSdDrawPanelRef = floatingPanel.ensureSdDrawPanel;
    destroySdDrawPanelsRef = floatingPanel.destroySdDrawPanels;
    floatingPanel.initFloatingPanel?.();

    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
        if (messageId === undefined) return;
        const ctx = getContext();
        const message = ctx.chat?.[messageId];
        if (!message || message.is_user) return;
        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
        if (messageEl) ensureSdDrawPanelRef?.(messageEl, Number(messageId));
        void renderPreviewsForMessage(Number(messageId));
    });

    events.on(event_types.CHAT_CHANGED, () => {
        setTimeout(() => {
            const ctx = getContext();
            ctx.chat?.forEach?.((message, messageId) => {
                if (!message || message.is_user) return;
                const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
                if (messageEl) ensureSdDrawPanelRef?.(messageEl, messageId);
                void renderPreviewsForMessage(messageId);
            });
        }, 150);
    });

    events.on(event_types.MESSAGE_EDITED, (data) => {
        const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
        if (Number.isFinite(Number(messageId))) void renderPreviewsForMessage(Number(messageId));
    });
    events.on(event_types.MESSAGE_UPDATED, (data) => {
        const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
        if (Number.isFinite(Number(messageId))) void renderPreviewsForMessage(Number(messageId));
    });
    events.on(event_types.MESSAGE_SWIPED, (data) => {
        const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
        if (Number.isFinite(Number(messageId))) void renderPreviewsForMessage(Number(messageId));
    });
    events.on(event_types.GENERATION_ENDED, async () => {
        try {
            await autoGenerateForLastAI();
        } catch (error) {
            console.error('[SdDraw]', error);
        }
    });
    events.on(event_types.GENERATION_STOPPED, () => {
        abortGeneration();
    });

    setTimeout(() => {
        const ctx = getContext();
        ctx.chat?.forEach?.((message, messageId) => {
            if (!message || message.is_user) return;
            const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
            if (messageEl) ensureSdDrawPanelRef?.(messageEl, messageId);
            void renderPreviewsForMessage(messageId);
        });
    }, 300);

    window.xiaobaixSdDraw = {
        openSettings,
        getSettings,
        testConnection,
        fetchSdModels,
        fetchSdSamplers,
        generateSdImage,
        generateAndInsertImages,
        getEffectiveParams,
        abortGeneration,
        isEnabled: () => moduleInitialized,
    };

    window.registerModuleCleanup?.(MODULE_KEY, cleanupSdDraw);
    console.log('[SdDraw] 模块已初始化');
}

export function cleanupSdDraw() {
    if (!moduleInitialized && !overlayElement) return;
    moduleInitialized = false;
    events.cleanup();
    cleanupImageDelegation();
    abortPendingRequest();
    abortGeneration();
    hideSettings();
    destroySdDrawPanelsRef?.();
    ensureSdDrawPanelRef = null;
    destroySdDrawPanelsRef = null;
    autoBusy = false;

    if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler);
        window.visualViewport?.removeEventListener('resize', resizeHandler);
        resizeHandler = null;
    }

    overlayElement?.remove();
    overlayElement = null;
    overlayFrame = null;
    frameReadyPromise = null;
    eventsBound = false;
    delete window.xiaobaixSdDraw;
    console.log('[SdDraw] 模块已清理');
}

export { classifyError, findLastAIMessageId };
