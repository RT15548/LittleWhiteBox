// comfy-draw.js

import { getContext } from "../../../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../../../utils.js";
import { getRequestHeaders } from "../../../../../../../../script.js";
import { extensionFolderPath } from "../../../../core/constants.js";
import { createModuleEvents, event_types } from "../../../../core/event-manager.js";
import { ComfyDrawStorage } from "../../../../core/server-storage.js";
import {
    storePreview,
    storeFailedPlaceholder,
    setSlotSelection,
    clearSlotSelection,
    openDB,
    openGallery,
    getPreviewsBySlot,
    getPreview,
    getGallerySummary,
    getCharacterPreviews,
    deletePreview,
    deleteFailedRecordsForSlot,
    updatePreviewSavedUrl,
    getPreviewDisplayUrl,
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
import { fetchDrawLlmModels, getLastDrawLlmRequestSnapshot } from "../../shared/draw-llm.js";
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
    COMFY_SCENE_PROMPTS,
    DEFAULT_PROMPT_CONFIG,
    LEGACY_USER_JSON_FORMAT,
    PROMPT_TEMPLATE_VERSION,
    getLoadedTagGuide,
    getPromptChainPreview,
    loadPromptTemplates,
    loadTagGuide,
} from "./comfy-prompts.js";

const MODULE_KEY = 'comfyDraw';
const HTML_PATH = `${extensionFolderPath}/modules/draw/providers/comfyui/comfy-draw.html`;
const DANBOORU_DATA_PATH = `${extensionFolderPath}/modules/draw/shared/data/danbooru-chars.dat`;
const SERVER_FILE_KEY = 'config';

// 简单模式只使用 ComfyUI 最基础的“整包模型文生图”链路。
// SillyTavern 原生 Comfy 后端从 history.outputs[*].images/gifs 取图，因此末端必须有 SaveImage。
// 节点 ID 固定：3=KSampler, 4=模型加载, 5=画布, 6=正向提示词, 7=负向提示词, 8=解码, 9=保存输出
const BUILTIN_WORKFLOW_TEMPLATE = {
    "3": {
        "inputs": {
            "seed": 0,
            "steps": 20,
            "cfg": 7,
            "sampler_name": "euler",
            "scheduler": "normal",
            "denoise": 1,
            "model": ["4", 0],
            "positive": ["6", 0],
            "negative": ["7", 0],
            "latent_image": ["5", 0]
        },
        "class_type": "KSampler"
    },
    "4": {
        "inputs": { "ckpt_name": "" },
        "class_type": "CheckpointLoaderSimple"
    },
    "5": {
        "inputs": { "width": 1024, "height": 1024, "batch_size": 1 },
        "class_type": "EmptyLatentImage"
    },
    "6": {
        "inputs": { "text": "", "clip": ["4", 1] },
        "class_type": "CLIPTextEncode"
    },
    "7": {
        "inputs": { "text": "", "clip": ["4", 1] },
        "class_type": "CLIPTextEncode"
    },
    "8": {
        "inputs": { "samples": ["3", 0], "vae": ["4", 2] },
        "class_type": "VAEDecode"
    },
    "9": {
        "inputs": {
            "filename_prefix": "LittleWhiteBox_Comfy",
            "images": ["8", 0]
        },
        "class_type": "SaveImage"
    }
};
const DEFAULT_COMFY_DRAW_SETTINGS = {
    host: '',
    connectionMode: 'proxy',
    auth: '',
    timeout: 120000,
    mode: 'manual',
    overrideSize: 'default',
    showFloorButton: true,
    showFloatingButton: true,
    selectedPresetId: 'default',
    builtinWorkflowId: 'official-core-checkpoint',
    presets: [],

    // 简单模式参数
    selectedModel: '',
    sampler: 'euler',
    scheduler: 'normal',
    steps: 20,
    cfg: 7,

    // 工作流模式：'simple' | 'custom'
    workflowMode: 'simple',
    selectedWorkflowPresetId: 'workflow-default',
    workflowPresets: [],

    // 自定义工作流（保留）
    customWorkflow: {
        json: '',
        nodePositive: '',
        nodeNegative: '',
        nodeWidth: '',
        nodeHeight: '',
        nodeSeed: '',
        nodeSaveImage: '',
    },

    // 缓存
    modelCache: [],
    samplerCache: [],
    schedulerCache: [],
    advancedMode: true,
    customPrompts: { topSystem: null, tagGuideContent: null, userJsonFormat: null },
    promptPresets: [],
    selectedPromptPresetId: null,
    _promptTemplateVersion: 0,
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
let ensureComfyDrawPanelRef = null;
let destroyComfyDrawPanelsRef = null;
let imageDelegationBound = false;
let messageObserver = null;
let autoBusy = false;
const events = createModuleEvents(MODULE_KEY);
const generationJobs = new Map();
const COMFY_DRAW_VIEWS = ['test', 'api', 'workflow', 'params', 'llm', 'prompts', 'worldbook', 'characters', 'gallery'];
const ImageState = { PREVIEW: 'preview', SAVING: 'saving', SAVED: 'saved', REFRESHING: 'refreshing', FAILED: 'failed' };
const INITIAL_RENDER_MESSAGE_LIMIT = 1;
const FIXED_COMFY_REQUEST_DELAY_MS = 1000;
let activeComfyImageRequest = null;
let comfyImageRequestQueue = [];
let comfyImageRequestSeq = 0;
const COMFY_SIZE_PRESETS = [
    { value: '832x1216', width: 832, height: 1216 },
    { value: '1216x832', width: 1216, height: 832 },
    { value: '1024x1024', width: 1024, height: 1024 },
    { value: '768x1280', width: 768, height: 1280 },
    { value: '1280x768', width: 1280, height: 768 },
];
const BUILTIN_WORKFLOWS = [
    {
        id: 'official-core-checkpoint',
        name: '基础出图',
        family: 'simple',
        summary: '最稳的入门方案：选一个模型文件，直接文生图。',
        description: '适合第一次跑通 ComfyUI。小白X 会把提示词、尺寸、采样参数填进内置工作流，并只返回预览图。',
        recommended: {
            width: 512,
            height: 512,
            steps: 20,
            cfg: 8,
            sampler: 'euler',
            scheduler: 'normal',
        },
        notes: '如果你不确定选什么，就先用这个。',
    },
    {
        id: 'checkpoint-sdxl',
        name: '高清出图',
        family: 'simple',
        summary: '同一套稳定流程，但默认使用 1024 尺寸。',
        description: '适合已经确认模型能正常出图后再使用。画面更大，也更吃显存。',
        recommended: {
            width: 1024,
            height: 1024,
            steps: 20,
            cfg: 7,
            sampler: 'euler',
            scheduler: 'normal',
        },
        notes: '如果报显存不足，切回基础出图或降低尺寸。',
    },
];
const providerDefaults = {
    st: { url: '', needKey: false, canFetch: false, needManualModel: false },
    openai: { url: 'https://api.openai.com', needKey: true, canFetch: true, needManualModel: false },
    google: { url: 'https://generativelanguage.googleapis.com', needKey: true, canFetch: true, needManualModel: false },
    claude: { url: 'https://api.anthropic.com', needKey: true, canFetch: false, needManualModel: true },
};

const saveBtnStates = new WeakMap();

function createDefaultPreset() {
    return {
        id: 'default',
        name: '默认',
        width: 1024,
        height: 1024,
        positivePrefix: '',
        negativePrefix: '',
        // 新增
        model: '',
        sampler: 'euler',
        scheduler: 'normal',
        steps: 20,
        cfg: 7,
        maxImages: 0,
        maxCharactersPerImage: 0,
    };
}

function createDefaultWorkflowPreset() {
    return {
        id: 'workflow-default',
        name: '默认工作流',
        json: '',
        nodePositive: '',
        nodeNegative: '',
        nodeWidth: '',
        nodeHeight: '',
        nodeSeed: '',
        nodeSaveImage: '',
    };
}

function normalizeWorkflowPresets(rawPresets, rawCustomWorkflow = {}) {
    const fallbackPreset = {
        ...createDefaultWorkflowPreset(),
        json: String(rawCustomWorkflow?.json || ''),
        nodePositive: String(rawCustomWorkflow?.nodePositive || ''),
        nodeNegative: String(rawCustomWorkflow?.nodeNegative || ''),
        nodeWidth: String(rawCustomWorkflow?.nodeWidth || ''),
        nodeHeight: String(rawCustomWorkflow?.nodeHeight || ''),
        nodeSeed: String(rawCustomWorkflow?.nodeSeed || ''),
        nodeSaveImage: String(rawCustomWorkflow?.nodeSaveImage || ''),
    };
    const source = Array.isArray(rawPresets) && rawPresets.length ? rawPresets : [fallbackPreset];
    return source.map((preset, index) => ({
        ...createDefaultWorkflowPreset(),
        ...preset,
        id: String(preset?.id || `workflow-${Date.now()}-${index}`),
        name: String(preset?.name || `工作流 ${index + 1}`),
        json: String(preset?.json || ''),
        nodePositive: String(preset?.nodePositive || ''),
        nodeNegative: String(preset?.nodeNegative || ''),
        nodeWidth: String(preset?.nodeWidth || ''),
        nodeHeight: String(preset?.nodeHeight || ''),
        nodeSeed: String(preset?.nodeSeed || ''),
        nodeSaveImage: String(preset?.nodeSaveImage || ''),
    }));
}

function getPromptPresetDefaults(name) {
    const guide = getLoadedTagGuide() || '';
    if (name === '默认-第一人称视角') {
        return {
            topSystem: DEFAULT_PROMPT_CONFIG.topSystemPov || DEFAULT_PROMPT_CONFIG.topSystem,
            tagGuideContent: guide,
            userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat,
        };
    }
    if (name === '默认-模型要求低') {
        return {
            topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
            tagGuideContent: guide,
            userJsonFormat: LEGACY_USER_JSON_FORMAT || DEFAULT_PROMPT_CONFIG.userJsonFormat,
        };
    }
    return {
        topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
        tagGuideContent: guide,
        userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat,
    };
}

function createPromptPreset(name, id = `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`) {
    return { id, name, ...getPromptPresetDefaults(name) };
}

function createDefaultPromptPresets() {
    return [
        createPromptPreset('默认-模型要求高'),
        createPromptPreset('默认-第一人称视角'),
        createPromptPreset('默认-模型要求低'),
    ];
}

function hasPromptOverrideValue(customPrompts = {}) {
    return ['topSystem', 'tagGuideContent', 'userJsonFormat']
        .some((key) => typeof customPrompts?.[key] === 'string' && customPrompts[key].trim());
}

function createPresetFromCustomPrompts(customPrompts = {}) {
    const defaults = getPromptPresetDefaults('默认-模型要求高');
    return {
        id: `prompt-legacy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: '自定义-旧配置迁移',
        topSystem: typeof customPrompts.topSystem === 'string' && customPrompts.topSystem.trim()
            ? customPrompts.topSystem
            : defaults.topSystem,
        tagGuideContent: typeof customPrompts.tagGuideContent === 'string' && customPrompts.tagGuideContent.trim()
            ? customPrompts.tagGuideContent
            : defaults.tagGuideContent,
        userJsonFormat: typeof customPrompts.userJsonFormat === 'string' && customPrompts.userJsonFormat.trim()
            ? customPrompts.userJsonFormat
            : defaults.userJsonFormat,
    };
}

function cloneSettingsObject(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

function normalizeNumber(value, fallback, min, max) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
}

function normalizePresets(rawPresets, rawSettings = {}) {
    const source = Array.isArray(rawPresets) && rawPresets.length ? rawPresets : [{
        ...createDefaultPreset(),
        width: rawSettings.defaultParams?.width ?? 1024,
        height: rawSettings.defaultParams?.height ?? 1024,
        positivePrefix: rawSettings.positivePrefix || '',
        negativePrefix: rawSettings.negativePrefix || '',
    }];

    return source.map((preset, index) => ({
        ...createDefaultPreset(),
        ...preset,
        id: String(preset.id || `preset-${Date.now()}-${index}`),
        name: String(preset.name || `预设 ${index + 1}`),
        width: normalizeNumber(preset.width, 1024, 64, 2048),
        height: normalizeNumber(preset.height, 1024, 64, 2048),
        positivePrefix: String(preset.positivePrefix ?? ''),
        negativePrefix: String(preset.negativePrefix ?? ''),
        model: String(preset.model ?? ''),
        sampler: String(preset.sampler || 'euler'),
        scheduler: String(preset.scheduler || 'normal'),
        steps: normalizeNumber(preset.steps, 20, 1, 150),
        cfg: normalizeNumber(preset.cfg, 7, 1, 30),
        maxImages: normalizeNumber(preset.maxImages, 0, 0, 999),
        maxCharactersPerImage: normalizeNumber(preset.maxCharactersPerImage, 0, 0, 999),
    }));
}

function normalizeSettings(raw = {}) {
    const presets = normalizePresets(raw.presets, raw);
    const workflowPresets = normalizeWorkflowPresets(raw.workflowPresets, raw.customWorkflow);
    const selectedPresetId = presets.some(p => p.id === raw.selectedPresetId)
        ? raw.selectedPresetId
        : presets[0]?.id || 'default';
    const selectedWorkflowPresetId = workflowPresets.some((p) => p.id === raw.selectedWorkflowPresetId)
        ? raw.selectedWorkflowPresetId
        : workflowPresets[0]?.id || 'workflow-default';
    const builtinWorkflowId = BUILTIN_WORKFLOWS.some((item) => item.id === raw.builtinWorkflowId)
        ? raw.builtinWorkflowId
        : DEFAULT_COMFY_DRAW_SETTINGS.builtinWorkflowId;
    const activeWorkflowPreset = workflowPresets.find((item) => item.id === selectedWorkflowPresetId) || workflowPresets[0] || createDefaultWorkflowPreset();
    const merged = {
        ...DEFAULT_COMFY_DRAW_SETTINGS,
        ...raw,
        mode: raw.mode === 'auto' ? 'auto' : 'manual',
        overrideSize: String(raw.overrideSize || 'default'),
        showFloorButton: raw.showFloorButton !== false,
        showFloatingButton: raw.showFloatingButton !== false,
        connectionMode: raw.connectionMode === 'direct' ? 'direct' : 'proxy',
        auth: String(raw.auth ?? ''),
        timeout: normalizeNumber(raw.timeout, DEFAULT_COMFY_DRAW_SETTINGS.timeout, 10000, 600000),
        selectedPresetId,
        selectedWorkflowPresetId,
        builtinWorkflowId,
        presets,
        workflowPresets,
        // 简单模式参数
        selectedModel: String(raw.selectedModel ?? ''),
        sampler: String(raw.sampler || 'euler'),
        scheduler: String(raw.scheduler || 'normal'),
        steps: normalizeNumber(raw.steps, 20, 1, 150),
        cfg: normalizeNumber(raw.cfg, 7, 1, 30),
        // 工作流模式：兼容旧的 'builtin' 转为 'simple'
        workflowMode: raw.workflowMode === 'custom' ? 'custom' : 'simple',
        customWorkflow: {
            json: String(activeWorkflowPreset?.json || ''),
            nodePositive: String(activeWorkflowPreset?.nodePositive || ''),
            nodeNegative: String(activeWorkflowPreset?.nodeNegative || ''),
            nodeWidth: String(activeWorkflowPreset?.nodeWidth || ''),
            nodeHeight: String(activeWorkflowPreset?.nodeHeight || ''),
            nodeSeed: String(activeWorkflowPreset?.nodeSeed || ''),
            nodeSaveImage: String(activeWorkflowPreset?.nodeSaveImage || ''),
        },
        // 缓存
        modelCache: Array.isArray(raw.modelCache) ? raw.modelCache : [],
        samplerCache: Array.isArray(raw.samplerCache) ? raw.samplerCache : [],
        schedulerCache: Array.isArray(raw.schedulerCache) ? raw.schedulerCache : [],
    };

    merged.advancedMode = true;
    merged.customPrompts = { ...DEFAULT_COMFY_DRAW_SETTINGS.customPrompts, ...(raw.customPrompts || {}) };
    if (!Array.isArray(merged.promptPresets)) merged.promptPresets = [];

    if (!merged.promptPresets.length) {
        merged.promptPresets = createDefaultPromptPresets();
        if (hasPromptOverrideValue(merged.customPrompts)) {
            const legacyPreset = createPresetFromCustomPrompts(merged.customPrompts);
            merged.promptPresets.push(legacyPreset);
            merged.selectedPromptPresetId = legacyPreset.id;
        } else {
            merged.selectedPromptPresetId = merged.promptPresets[0]?.id || null;
        }
    }

    const legacyNames = { '默认1': '默认-模型要求高', '默认2': '默认-模型要求低' };
    merged.promptPresets.forEach((preset, index) => {
        if (legacyNames[preset.name]) preset.name = legacyNames[preset.name];
        preset.id = String(preset.id || `prompt-${Date.now()}-${index}`);
    });

    const defaultPresetNames = ['默认-模型要求高', '默认-第一人称视角', '默认-模型要求低'];
    const storedVersion = Number(merged._promptTemplateVersion) || 0;
    if (!merged.promptPresets.some((preset) => preset.name === '默认-第一人称视角')) {
        const insertIndex = merged.promptPresets.findIndex((preset) => preset.name === '默认-模型要求低');
        const povPreset = createPromptPreset('默认-第一人称视角');
        if (insertIndex >= 0) merged.promptPresets.splice(insertIndex, 0, povPreset);
        else merged.promptPresets.push(povPreset);
    }
    if (storedVersion < PROMPT_TEMPLATE_VERSION) {
        merged.promptPresets = merged.promptPresets.map((preset) => {
            if (!defaultPresetNames.includes(preset.name)) return preset;
            return {
                ...preset,
                ...getPromptPresetDefaults(preset.name),
            };
        });
        merged._promptTemplateVersion = PROMPT_TEMPLATE_VERSION;
    }

    merged.promptPresets = merged.promptPresets.map((preset) => {
        const defaults = getPromptPresetDefaults(preset.name);
        return {
            ...preset,
            topSystem: preset.topSystem ?? defaults.topSystem,
            tagGuideContent: preset.tagGuideContent ?? defaults.tagGuideContent,
            userJsonFormat: preset.userJsonFormat ?? defaults.userJsonFormat,
        };
    });

    if (!merged.selectedPromptPresetId || !merged.promptPresets.some((preset) => preset.id === merged.selectedPromptPresetId)) {
        merged.selectedPromptPresetId = merged.promptPresets[0]?.id || null;
    }
    if (!merged.customPrompts.topSystem || !merged.customPrompts.userJsonFormat || merged.customPrompts.tagGuideContent == null) {
        const activePromptPreset = merged.promptPresets.find((preset) => preset.id === merged.selectedPromptPresetId) || merged.promptPresets[0] || createPromptPreset('默认-模型要求高');
        merged.customPrompts = {
            topSystem: activePromptPreset.topSystem,
            tagGuideContent: activePromptPreset.tagGuideContent,
            userJsonFormat: activePromptPreset.userJsonFormat,
        };
    }

    return merged;
}

export async function loadSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await ComfyDrawStorage.get(SERVER_FILE_KEY, null);
        if (saved && typeof saved === 'object') {
            settingsCache = normalizeSettings(saved);
        } else {
            settingsCache = normalizeSettings({});
            await ComfyDrawStorage.setAndSave(SERVER_FILE_KEY, settingsCache, { silent: true });
        }
    } catch (error) {
        console.error('[ComfyDraw] 加载设置失败:', error);
        settingsCache = normalizeSettings({});
    }

    settingsLoaded = true;
    return settingsCache;
}

export function getSettings() {
    if (!settingsCache) {
        console.warn('[ComfyDraw] 设置未加载，使用默认值');
        settingsCache = normalizeSettings({});
    }
    if (!settingsCache.promptPresets?.length) {
        settingsCache = normalizeSettings(settingsCache);
    }
    return settingsCache;
}

async function persistSettings(nextSettings, okText = '已保存', { notify = true, silent = false } = {}) {
    const next = normalizeSettings(nextSettings);
    const previous = settingsCache ? cloneSettingsObject(settingsCache) : null;
    try {
        settingsCache = next;
        const ok = await ComfyDrawStorage.setAndSave(SERVER_FILE_KEY, next, { silent });
        if (ok !== false) {
            if (notify) {
                toastr.success(okText, 'ComfyUI');
            }
            return true;
        }
        if (notify) {
            toastr.error('保存失败', 'ComfyUI');
        }
        settingsCache = previous;
        return false;
    } catch (error) {
        settingsCache = previous;
        if (notify) {
            toastr.error(error?.message || '保存失败', 'ComfyUI');
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

function getActiveWorkflowPreset(settings = getSettings()) {
    return settings.workflowPresets?.find((p) => p.id === settings.selectedWorkflowPresetId)
        || settings.workflowPresets?.[0]
        || createDefaultWorkflowPreset();
}

function buildWorkflowNodeMapFromForm() {
    return {
        positive: getValue('comfy-node-positive').trim(),
        negative: getValue('comfy-node-negative').trim(),
        width: getValue('comfy-node-width').trim(),
        height: getValue('comfy-node-height').trim(),
        seed: getValue('comfy-node-seed').trim(),
        saveImage: getValue('comfy-node-save-image').trim(),
    };
}

function validateWorkflowPresetDraftOrThrow({ json, nodeMap }) {
    if (!nodeMap.positive || !nodeMap.saveImage) {
        throw new Error('请至少填写正向提示词节点和 SaveImage 节点。');
    }
    const workflow = parseComfyApiWorkflowJson(json);
    validateComfyWorkflowNodeMap(workflow, nodeMap);
}

function getActivePromptPreset(settings = getSettings()) {
    return settings.promptPresets.find((preset) => preset.id === settings.selectedPromptPresetId)
        || settings.promptPresets[0]
        || createPromptPreset('默认-模型要求高');
}

function getEffectiveParams(settings = getSettings(), overrides = {}) {
    const preset = getActivePreset(settings);
    const overrideSize = String(overrides.overrideSize ?? settings.overrideSize ?? 'default');
    let sizeOverride = null;
    if (overrideSize && overrideSize !== 'default') {
        const match = overrideSize.match(/^(\d+)x(\d+)$/i);
        if (match) {
            sizeOverride = {
                width: normalizeNumber(match[1], preset.width ?? 1024, 64, 2048),
                height: normalizeNumber(match[2], preset.height ?? 1024, 64, 2048),
            };
        }
    }
    return {
        width: overrides.width ?? sizeOverride?.width ?? preset.width,
        height: overrides.height ?? sizeOverride?.height ?? preset.height,
        positivePrefix: overrides.positivePrefix ?? preset.positivePrefix ?? '',
        negativePrefix: overrides.negativePrefix ?? preset.negativePrefix ?? '',
        // 新增
        model: overrides.model ?? preset.model ?? settings.selectedModel ?? '',
        sampler: overrides.sampler ?? preset.sampler ?? settings.sampler ?? 'euler',
        scheduler: overrides.scheduler ?? preset.scheduler ?? settings.scheduler ?? 'normal',
        steps: overrides.steps ?? preset.steps ?? settings.steps ?? 20,
        cfg: overrides.cfg ?? preset.cfg ?? settings.cfg ?? 7,
    };
}

function getBuiltinWorkflowDefinition(id) {
    return BUILTIN_WORKFLOWS.find((item) => item.id === id) || BUILTIN_WORKFLOWS[0];
}

function createBuiltinWorkflowPreview({ model, width, height, steps, cfg, sampler, scheduler }) {
    const workflow = JSON.parse(JSON.stringify(BUILTIN_WORKFLOW_TEMPLATE));
    workflow["4"].inputs.ckpt_name = String(model || "<selected-model>");
    workflow["3"].inputs.seed = "<random-seed>";
    workflow["3"].inputs.steps = steps;
    workflow["3"].inputs.cfg = cfg;
    workflow["3"].inputs.sampler_name = sampler;
    workflow["3"].inputs.scheduler = scheduler;
    workflow["5"].inputs.width = width;
    workflow["5"].inputs.height = height;
    workflow["6"].inputs.text = "<positive-prompt>";
    workflow["7"].inputs.text = "<negative-prompt>";
    return JSON.stringify(workflow, null, 2);
}

function getBuiltinWorkflowPreviewParams(settings = getSettings()) {
    const activePreset = getActivePreset(settings);
    const selectedBuiltinId = getValue('comfy-builtin-workflow') || settings.builtinWorkflowId || DEFAULT_COMFY_DRAW_SETTINGS.builtinWorkflowId;
    const workflow = getBuiltinWorkflowDefinition(selectedBuiltinId);
    const fallback = workflow.recommended || {};
    const sizePreset = getValue('comfy-draw-size-preset');

    let width = normalizeNumber(getValue('comfy-draw-width'), activePreset?.width ?? fallback.width ?? 1024, 64, 2048);
    let height = normalizeNumber(getValue('comfy-draw-height'), activePreset?.height ?? fallback.height ?? 1024, 64, 2048);
    if (sizePreset && sizePreset !== 'custom') {
        const matched = COMFY_SIZE_PRESETS.find((item) => item.value === sizePreset);
        if (matched) {
            width = matched.width;
            height = matched.height;
        }
    }

    return {
        model: getValue('comfy-draw-model') || activePreset?.model || settings.selectedModel || '<selected-model>',
        sampler: getValue('comfy-draw-sampler') || activePreset?.sampler || settings.sampler || fallback.sampler || 'euler',
        scheduler: getValue('comfy-draw-scheduler') || activePreset?.scheduler || settings.scheduler || fallback.scheduler || 'normal',
        steps: normalizeNumber(getValue('comfy-draw-steps'), activePreset?.steps ?? settings.steps ?? fallback.steps ?? 20, 1, 150),
        cfg: normalizeNumber(getValue('comfy-draw-cfg'), activePreset?.cfg ?? settings.cfg ?? fallback.cfg ?? 7, 1, 30),
        width,
        height,
    };
}

function createComfyRequestSignal(signal, timeoutMs) {
    const controller = new AbortController();
    let timeoutId = null;
    const abort = () => controller.abort();

    if (signal?.aborted) {
        controller.abort();
    } else if (signal) {
        signal.addEventListener('abort', abort, { once: true });
    }

    if (Number.isFinite(Number(timeoutMs)) && Number(timeoutMs) > 0) {
        timeoutId = setTimeout(() => controller.abort(), Number(timeoutMs));
    }

    return {
        signal: controller.signal,
        cleanup() {
            if (timeoutId) clearTimeout(timeoutId);
            if (signal) signal.removeEventListener('abort', abort);
        },
    };
}

function createComfyDeadlineSignal(signal, timeoutMs) {
    return createComfyRequestSignal(signal, timeoutMs);
}

function getComfyAuthHeaders(settings = getSettings()) {
    const auth = String(settings.auth || '').trim();
    if (!auth) return {};
    return { Authorization: `Basic ${btoa(auth)}` };
}

function isDirectConnection(settings = getSettings()) {
    return settings.connectionMode === 'direct';
}

function createComfyUrl(path, query = {}, settings = getSettings()) {
    const base = String(settings.host || '').trim();
    if (!base) throw new Error('请先填写 ComfyUI 地址');
    const url = new URL(path, base.endsWith('/') ? base : `${base}/`);
    Object.entries(query || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    });
    return url;
}

async function readBlobAsBase64(blob) {
    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || '').split(',')[1] || '');
        reader.onerror = () => reject(reader.error || new Error('图片读取失败'));
        reader.readAsDataURL(blob);
    });
}

async function requestComfyTransport(path, body = {}, { signal, timeoutMs } = {}) {
    const settings = getSettings();
    if (!settings.host) throw new Error('请先填写 ComfyUI 地址');
    if (isDirectConnection(settings) && path === 'ping') {
        await testComfyDirectConnection({ signal, timeoutMs });
        return { ok: true, json: async () => ({}) };
    }
    if (isDirectConnection(settings) && path === 'generate') {
        const workflow = JSON.parse(body?.prompt || '{}')?.prompt;
        const data = await fetchComfyDirectImageFromWorkflow(workflow, {
            signal,
            timeoutMs,
            preferredSaveImageNodeId: body?.preferredSaveImageNodeId,
        });
        return { ok: true, json: async () => ({ data }) };
    }
    const proxySignal = createComfyRequestSignal(signal, timeoutMs ?? settings.timeout ?? 120000);
    try {
        const response = await fetch(`/api/sd/comfy/${path}`, {
            method: 'POST',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                url: settings.host,
                ...body,
            }),
            signal: proxySignal.signal,
        });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            if (path === 'generate') {
                throw new Error(buildComfyProxyGenerateError(text || `HTTP ${response.status}`, response.status));
            }
            throw new Error(text || `HTTP ${response.status}`);
        }
        return response;
    } catch (error) {
        if (path === 'generate' && isComfyProxyGenerateFailure(error)) {
            throw new Error(buildComfyProxyGenerateError(error?.message || 'ComfyUI 生成失败', error?.status));
        }
        if (error?.name === 'AbortError') throw new Error(signal?.aborted ? '已取消' : '生成超时');
        throw error;
    } finally {
        proxySignal.cleanup();
    }
}

async function fetchComfyDirectJson(path, { signal, timeoutMs, method = 'GET', body } = {}) {
    const settings = getSettings();
    const directSignal = createComfyRequestSignal(signal, timeoutMs ?? settings.timeout ?? 120000);
    try {
        const response = await fetch(createComfyUrl(path, {}, settings), {
            method,
            headers: {
                ...getComfyAuthHeaders(settings),
                ...(body ? { 'Content-Type': 'application/json' } : {}),
            },
            body,
            signal: directSignal.signal,
        });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(text || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        if (error?.name === 'AbortError') throw new Error(signal?.aborted ? '已取消' : '生成超时');
        throw error;
    } finally {
        directSignal.cleanup();
    }
}

async function fetchComfyDirectBlob(path, query = {}, { signal, timeoutMs } = {}) {
    const settings = getSettings();
    const directSignal = createComfyRequestSignal(signal, timeoutMs ?? settings.timeout ?? 120000);
    try {
        const response = await fetch(createComfyUrl(path, query, settings), {
            headers: getComfyAuthHeaders(settings),
            signal: directSignal.signal,
        });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            throw new Error(text || `HTTP ${response.status}`);
        }
        return await response.blob();
    } catch (error) {
        if (error?.name === 'AbortError') throw new Error(signal?.aborted ? '已取消' : '生成超时');
        throw error;
    } finally {
        directSignal.cleanup();
    }
}

function normalizeComfyModelList(data = {}) {
    return (data.CheckpointLoaderSimple?.input?.required?.ckpt_name?.[0] || []).filter(Boolean);
}

async function fetchComfyDirectModels({ signal, timeoutMs } = {}) {
    const data = await fetchComfyDirectJson('/object_info', { signal, timeoutMs });
    return normalizeComfyModelList(data);
}

async function fetchComfyDirectSamplers({ signal, timeoutMs } = {}) {
    const data = await fetchComfyDirectJson('/object_info', { signal, timeoutMs });
    return {
        samplers: data.KSampler?.input?.required?.sampler_name?.[0] || [],
        schedulers: data.KSampler?.input?.required?.scheduler?.[0] || [],
    };
}

async function testComfyDirectConnection({ signal, timeoutMs } = {}) {
    await fetchComfyDirectJson('/system_stats', { signal, timeoutMs });
}

function isComfyProxyGenerateFailure(error) {
    const msg = String(error?.message || error || '').toLowerCase();
    return msg.includes('did not return any recognizable outputs')
        || msg.includes('未返回图片数据')
        || msg.includes('execution_cached')
        || msg.includes('cached-empty');
}

function buildComfyProxyGenerateError(message, status = null) {
    const raw = String(message || '').trim();
    const prefix = status ? `ComfyUI 取图失败（HTTP ${status}）` : 'ComfyUI 取图失败';
    if (/did not return any recognizable outputs|未返回图片数据|execution_cached|cached-empty/i.test(raw)) {
        return `${prefix}：ComfyUI 可能已经出图，但这次没有把图片返回到酒馆。请先检查 ComfyUI 输出目录；如果反复出现，可以换另一种连接方式对照。`;
    }
    return `${prefix}：${raw || '后端返回失败'}`;
}

async function fetchComfyDirectImageFromWorkflow(workflow, { signal, timeoutMs, preferredSaveImageNodeId } = {}) {
    const deadline = createComfyDeadlineSignal(signal, timeoutMs);
    try {
        const data = await fetchComfyDirectJson('/prompt', {
            method: 'POST',
            body: JSON.stringify({ prompt: workflow }),
            signal: deadline.signal,
            timeoutMs,
        });
        const promptId = data?.prompt_id;
        if (!promptId) throw new Error('ComfyUI 未返回任务 ID');

        let item = null;
        let cachedEmptySince = 0;
        while (!deadline.signal.aborted) {
            const history = await fetchComfyDirectJson('/history', { signal: deadline.signal, timeoutMs });
            item = history?.[promptId];
            if (!item) {
                await waitWithAbort(deadline.signal, 100);
                continue;
            }

            if (item.status?.status_str === 'error') break;

            const imgInfo = resolveComfyDirectOutputImage(item, workflow, preferredSaveImageNodeId);
            if (imgInfo) break;

            if (item.status?.status_str === 'success') {
                cachedEmptySince ||= Date.now();
                if (Date.now() - cachedEmptySince > 15000) {
                    throw new Error('ComfyUI 可能已经出图，但这次没有把图片返回到酒馆。请先检查 ComfyUI 输出目录；如果反复出现，可以换另一种连接方式对照。');
                }
            }

            await waitWithAbort(deadline.signal, 100);
        }
        if (deadline.signal.aborted) throw new Error(signal?.aborted ? '已取消' : '生成超时');
        if (!item) throw new Error('ComfyUI 未返回生成结果');

        if (item.status?.status_str === 'error') {
            const errorMessages = item.status?.messages
                ?.filter(it => it[0] === 'execution_error')
                .map(it => it[1])
                .map(it => `${it.node_type} [${it.node_id}] ${it.exception_type}: ${it.exception_message}`)
                .join('\n') || '';
            throw new Error(`ComfyUI 生成失败${errorMessages ? `\n\n${errorMessages}` : ''}`);
        }

        const imgInfo = resolveComfyDirectOutputImage(item, workflow, preferredSaveImageNodeId);
        if (!imgInfo) {
            const suffix = item?.status?.status_str === 'success'
                ? '请先检查 ComfyUI 输出目录；如果反复出现，可以换另一种连接方式对照。'
                : '请稍后重试，或检查 ComfyUI 是否正常出图。';
            throw new Error(`ComfyUI 未返回图片数据。${suffix}`);
        }

        const blob = await fetchComfyDirectBlob('/view', {
            filename: imgInfo.filename,
            subfolder: imgInfo.subfolder,
            type: imgInfo.type,
        }, { signal: deadline.signal, timeoutMs });
        return await readBlobAsBase64(blob);
    } finally {
        deadline.cleanup();
    }
}

async function fetchComfyModels({ signal, timeoutMs } = {}) {
    if (isDirectConnection()) {
        return await fetchComfyDirectModels({ signal, timeoutMs });
    }
    const res = await requestComfyTransport('models', {}, { signal, timeoutMs });
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data
        .filter(item => {
            const label = String(item?.text ?? item?.value ?? item ?? '');
            const value = String(item?.value ?? item ?? '');
            return !/^(UNet|GGUF):/i.test(label) && !/^(UNet|GGUF):/i.test(value);
        })
        .map(item => typeof item === 'string' ? item : item?.value)
        .filter(Boolean);
}

async function fetchComfySamplers({ signal, timeoutMs } = {}) {
    if (isDirectConnection()) {
        return await fetchComfyDirectSamplers({ signal, timeoutMs });
    }
    const [samplersRes, schedulersRes] = await Promise.all([
        requestComfyTransport('samplers', {}, { signal, timeoutMs }),
        requestComfyTransport('schedulers', {}, { signal, timeoutMs }),
    ]);
    const samplers = await samplersRes.json();
    const schedulers = await schedulersRes.json();
    return {
        samplers: Array.isArray(samplers) ? samplers : [],
        schedulers: Array.isArray(schedulers) ? schedulers : [],
    };
}

// 构建简单模式工作流
function buildSimpleWorkflow({ model, sampler, scheduler, steps, cfg, width, height, positive, negative }) {
    const wf = JSON.parse(JSON.stringify(BUILTIN_WORKFLOW_TEMPLATE));
    wf["4"].inputs.ckpt_name = model;
    wf["3"].inputs.sampler_name = sampler;
    wf["3"].inputs.scheduler = scheduler;
    wf["3"].inputs.steps = steps;
    wf["3"].inputs.cfg = cfg;
    wf["3"].inputs.seed = Math.floor(Math.random() * 2 ** 32);
    wf["5"].inputs.width = width;
    wf["5"].inputs.height = height;
    wf["6"].inputs.text = positive;
    wf["7"].inputs.text = negative;
    return wf;
}

function parseComfyApiWorkflowJson(text) {
    let workflow;
    try {
        workflow = JSON.parse(String(text || '').replace(/^\uFEFF/, ''));
    } catch (error) {
        throw new Error(`JSON 格式错误：${error.message}`);
    }
    if (!workflow || Array.isArray(workflow) || typeof workflow !== 'object') {
        throw new Error('工作流格式错误：请导入 API Format workflow JSON。');
    }

    const hasApiNode = Object.values(workflow).some((node) => (
        node
        && typeof node === 'object'
        && !Array.isArray(node)
        && typeof node.class_type === 'string'
        && node.inputs
        && typeof node.inputs === 'object'
        && !Array.isArray(node.inputs)
    ));
    if (!hasApiNode) {
        throw new Error('工作流格式错误：需要 API Format workflow JSON，请在 ComfyUI 使用 Save (API Format) 导出。');
    }

    return workflow;
}

function requireComfyNode(workflow, nodeId, label) {
    const id = String(nodeId || '').trim();
    if (!id) return null;
    const node = workflow?.[id];
    if (!node || typeof node !== 'object' || !node.inputs || typeof node.inputs !== 'object') {
        throw new Error(`${label}不存在：${id}`);
    }
    return node;
}

function validateComfyTextNode(workflow, nodeId, label, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error(`请填写${label}`);
        return;
    }
    const node = requireComfyNode(workflow, id, label);
    if (!('text' in node.inputs)) {
        throw new Error(`${label}需要填 CLIP Text Encode 这类带 text 输入的节点：${id}`);
    }
}

function validateComfyInputNode(workflow, nodeId, label, inputName, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error(`请填写${label}`);
        return;
    }
    const node = requireComfyNode(workflow, id, label);
    if (!(inputName in node.inputs)) {
        throw new Error(`${label}节点没有 ${inputName} 输入：${id}`);
    }
}

function validateComfySeedNode(workflow, nodeId, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error('请填写Seed 节点');
        return;
    }
    const node = requireComfyNode(workflow, id, 'Seed 节点');
    if (!('seed' in node.inputs) && !('noise_seed' in node.inputs)) {
        throw new Error(`Seed 节点需要带 seed 或 noise_seed 输入：${id}`);
    }
}

function validateComfySaveImageNode(workflow, nodeId, { required = false } = {}) {
    const id = String(nodeId || '').trim();
    if (!id) {
        if (required) throw new Error('请填写SaveImage 节点');
        return;
    }
    const node = requireComfyNode(workflow, id, 'SaveImage 节点');
    if (normalizeComfyClassType(node.class_type) !== 'saveimage') {
        throw new Error(`SaveImage 节点 ID 需要指向 SaveImage 节点：${id}`);
    }
}

function validateComfyWorkflowNodeMap(workflow, nodeMap) {
    validateComfyTextNode(workflow, nodeMap.positive, '正向提示词节点', { required: true });
    validateComfyTextNode(workflow, nodeMap.negative, '负向提示词节点');
    validateComfyInputNode(workflow, nodeMap.width, '宽度节点', 'width');
    validateComfyInputNode(workflow, nodeMap.height, '高度节点', 'height');
    validateComfySeedNode(workflow, nodeMap.seed);
    validateComfySaveImageNode(workflow, nodeMap.saveImage, { required: true });
}

function isComfyLink(value) {
    return Array.isArray(value) && value.length >= 2 && value[0] !== undefined && value[1] !== undefined;
}

function normalizeComfyClassType(value) {
    return String(value || '').replace(/\s+/g, '').toLowerCase();
}

function getComfyNodeTitle(node) {
    return String(node?._meta?.title || node?.title || '').trim().toLowerCase();
}

function getComfyOutputTitleScore(title) {
    if (/final|最终/i.test(title)) return 50;
    if (/output|result|输出|结果/i.test(title)) return 40;
    if (/save|保存/i.test(title)) return 35;
    return 0;
}

function extractComfyOutputAssets(output) {
    if (!output || typeof output !== 'object') return [];
    return [
        ...(Array.isArray(output.images) ? output.images : []),
        ...(Array.isArray(output.gifs) ? output.gifs : []),
    ];
}

function getReferencedComfyNodeIds(workflow) {
    const refs = new Set();
    Object.values(workflow || {}).forEach((node) => {
        const inputs = node?.inputs || {};
        Object.values(inputs).forEach((value) => {
            if (isComfyLink(value)) {
                refs.add(String(value[0]));
            }
        });
    });
    return refs;
}

function pruneComfyOutputNodes(workflow, preferredSaveImageNodeId = '') {
    const preferredId = String(preferredSaveImageNodeId || '').trim();
    const hasSaveImage = getPreferredComfySaveImageNodeIds(workflow).length > 0;
    if (!preferredId && !hasSaveImage) return workflow;

    const refs = getReferencedComfyNodeIds(workflow);
    Object.entries(workflow || {}).forEach(([id, node]) => {
        if (refs.has(String(id))) return;
        const type = normalizeComfyClassType(node?.class_type);
        const isOutputNode = type === 'previewimage' || type === 'saveimage';
        if (!isOutputNode) return;

        if (preferredId) {
            if (String(id) !== preferredId) delete workflow[id];
            return;
        }
        if (type === 'previewimage') delete workflow[id];
    });
    return workflow;
}

function pickComfyOutputAssetByNodeIds(item, nodeIds = []) {
    const outputs = item?.outputs || {};
    for (const nodeId of nodeIds) {
        const assets = extractComfyOutputAssets(outputs[String(nodeId)]);
        if (assets.length) return assets[0];
    }
    return null;
}

function getPreferredComfySaveImageNodeIds(workflow) {
    return Object.entries(workflow || {})
        .filter(([, node]) => normalizeComfyClassType(node?.class_type) === 'saveimage')
        .map(([id, node]) => ({
            id: String(id),
            score: getComfyOutputTitleScore(getComfyNodeTitle(node)),
        }))
        .sort((a, b) => b.score - a.score || Number(b.id) - Number(a.id))
        .map((item) => item.id);
}

function resolveComfyDirectOutputImage(item, workflow, preferredSaveImageNodeId = '') {
    const preferredNodeId = String(preferredSaveImageNodeId || '').trim();
    if (preferredNodeId) {
        const preferredAsset = pickComfyOutputAssetByNodeIds(item, [preferredNodeId]);
        if (preferredAsset) return preferredAsset;
    }

    const saveImageAsset = pickComfyOutputAssetByNodeIds(item, getPreferredComfySaveImageNodeIds(workflow));
    return saveImageAsset || null;
}

function injectPromptIntoWorkflow(workflow, positive, negative, width, height, nodeMap) {
    const wf = JSON.parse(JSON.stringify(workflow));
    validateComfyWorkflowNodeMap(wf, nodeMap);
    if (nodeMap.positive && wf[nodeMap.positive]) {
        wf[nodeMap.positive].inputs.text = positive;
    }
    if (nodeMap.negative && wf[nodeMap.negative]) {
        wf[nodeMap.negative].inputs.text = negative;
    }
    if (nodeMap.width && width && wf[nodeMap.width]) {
        const widthNode = wf[nodeMap.width].inputs;
        if ('width' in widthNode) widthNode.width = width;
    }
    if (nodeMap.height && height && wf[nodeMap.height]) {
        const heightNode = wf[nodeMap.height].inputs;
        if ('height' in heightNode) heightNode.height = height;
    }
    if (nodeMap.seed && wf[nodeMap.seed]) {
        const seedNode = wf[nodeMap.seed].inputs;
        if ('seed' in seedNode) {
            seedNode.seed = Math.floor(Math.random() * 2 ** 32);
        } else if ('noise_seed' in seedNode) {
            seedNode.noise_seed = Math.floor(Math.random() * 2 ** 32);
        }
    }
    pruneComfyOutputNodes(wf, nodeMap.saveImage);
    return wf;
}

export async function generateComfyImage({ prompt, negativePrompt = '', params = {}, signal } = {}) {
    const settings = getSettings();
    const effective = getEffectiveParams(settings, params);

    const positive = String(prompt || '').trim();
    const negative = String(negativePrompt || '').trim();

    if (!positive) throw new Error('Prompt 不能为空');

    const width = normalizeNumber(effective.width, 1024, 64, 2048);
    const height = normalizeNumber(effective.height, 1024, 64, 2048);

    let injected;

    if (settings.workflowMode === 'custom' && settings.customWorkflow?.json) {
        // 自定义工作流模式
        const workflow = parseComfyApiWorkflowJson(settings.customWorkflow.json);
        const nodeMap = {
            positive: settings.customWorkflow.nodePositive || '',
            negative: settings.customWorkflow.nodeNegative || '',
            width: settings.customWorkflow.nodeWidth || '',
            height: settings.customWorkflow.nodeHeight || '',
            seed: settings.customWorkflow.nodeSeed || '',
            saveImage: settings.customWorkflow.nodeSaveImage || '',
        };
        injected = injectPromptIntoWorkflow(workflow, positive, negative, width, height, nodeMap);
    } else {
        // 简单模式：使用内置模板 + 用户选择的模型和参数
        const model = effective.model;
        if (!model) {
            throw new Error('请先在「模型配置」中选择模型');
        }
        injected = buildSimpleWorkflow({
            model,
            sampler: effective.sampler || 'euler',
            scheduler: effective.scheduler || 'normal',
            steps: effective.steps || 20,
            cfg: effective.cfg || 7,
            width,
            height,
            positive,
            negative,
        });
    }

    const requestBody = {
        prompt: JSON.stringify({ prompt: injected }),
    };
    if (isDirectConnection(settings) && settings.workflowMode === 'custom') {
        requestBody.preferredSaveImageNodeId = String(settings.customWorkflow?.nodeSaveImage || '').trim();
    }

    const response = await requestComfyTransport('generate', requestBody, {
        signal,
        timeoutMs: settings.timeout || 120000,
    });
    const data = await response.json();
    if (!data?.data) throw new Error('ComfyUI 未返回图片数据');
    return String(data.data || '');
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

function notifyQueuedComfyImageRequests() {
    comfyImageRequestQueue.forEach((item, index) => {
        const ahead = (activeComfyImageRequest ? 1 : 0) + index;
        if (ahead > 0) {
            item.onQueued?.({ ahead, position: ahead + 1 });
        }
    });
}

function pumpComfyImageRequestQueue() {
    if (activeComfyImageRequest || comfyImageRequestQueue.length === 0) return;

    const item = comfyImageRequestQueue.shift();
    activeComfyImageRequest = item;
    notifyQueuedComfyImageRequests();

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
            if (activeComfyImageRequest === item) {
                activeComfyImageRequest = null;
            }
            notifyQueuedComfyImageRequests();
            pumpComfyImageRequestQueue();
        }
    })();
}

function enqueueComfyRequest(run, {
    signal,
    onQueued,
    onStart,
    onCooldown,
    cooldownMs = FIXED_COMFY_REQUEST_DELAY_MS,
} = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new Error('已取消'));
            return;
        }

        const item = {
            id: ++comfyImageRequestSeq,
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
            if (activeComfyImageRequest === item) return;
            const idx = comfyImageRequestQueue.indexOf(item);
            if (idx >= 0) {
                comfyImageRequestQueue.splice(idx, 1);
                notifyQueuedComfyImageRequests();
                reject(new Error('已取消'));
            }
        }, { once: true });

        comfyImageRequestQueue.push(item);
        notifyQueuedComfyImageRequests();
        pumpComfyImageRequestQueue();
    });
}

async function generateComfyImageQueued({
    prompt,
    negativePrompt = '',
    params = {},
    signal,
    onQueueStateChange,
    cooldownMs = FIXED_COMFY_REQUEST_DELAY_MS,
} = {}) {
    return enqueueComfyRequest(
        () => generateComfyImage({ prompt, negativePrompt, params, signal }),
        {
            signal,
            cooldownMs,
            onQueued: (data) => onQueueStateChange?.('queued', data),
            onStart: () => onQueueStateChange?.('start'),
            onCooldown: (data) => onQueueStateChange?.('cooldown', data),
        },
    );
}

function ensureStyles() {
    if (document.getElementById('xiaobaix-comfy-draw-style')) return;
    const style = document.createElement('style');
    style.id = 'xiaobaix-comfy-draw-style';
    style.textContent = `
#xiaobaix-comfy-draw-overlay .comfy-draw-backdrop{position:absolute;top:0;left:0;width:100%;height:100%;background:#0d1117}
#xiaobaix-comfy-draw-overlay .comfy-draw-frame-wrap{position:absolute;z-index:1}
#xiaobaix-comfy-draw-iframe{width:100%;height:100%;border:none;background:#0d1117}
@media(min-width:769px){#xiaobaix-comfy-draw-overlay .comfy-draw-frame-wrap{top:12px;left:12px;right:12px;bottom:12px}#xiaobaix-comfy-draw-iframe{border-radius:12px}}
@media(max-width:768px){#xiaobaix-comfy-draw-overlay .comfy-draw-frame-wrap{top:0;left:0;right:0;bottom:0}#xiaobaix-comfy-draw-iframe{border-radius:0}}
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
    overlayElement.id = 'xiaobaix-comfy-draw-overlay';
    overlayElement.style.cssText = `position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:${window.innerHeight}px!important;z-index:99999!important;display:none;overflow:hidden!important;`;
    const backdrop = document.createElement('div');
    backdrop.className = 'comfy-draw-backdrop';
    backdrop.addEventListener('click', hideSettings);
    const frameWrap = document.createElement('div');
    frameWrap.className = 'comfy-draw-frame-wrap';
    overlayFrame = document.createElement('iframe');
    overlayFrame.id = 'xiaobaix-comfy-draw-iframe';
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
            reject(new Error('ComfyUI 设置页加载失败'));
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
    return overlayFrame?.contentDocument || document.getElementById('xiaobaix-comfy-draw-iframe')?.contentDocument || null;
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
    querySettings('#comfy-draw-close')?.addEventListener('click', hideSettings);
    getSettingsDocument()?.addEventListener('click', (event) => {
        const button = event.target?.closest?.('[data-comfy-view]');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        switchSettingsView(button.dataset.comfyView || 'test');
    });
    querySettings('#comfy-gallery-refresh')?.addEventListener('click', async () => {
        await renderGalleryManagement();
    });
    querySettingsAll('[data-comfy-mode]').forEach((button) => {
        button.addEventListener('click', async () => {
            const nextMode = button.dataset.comfyMode === 'auto' ? 'auto' : 'manual';
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
    querySettings('#comfy-show-floor')?.addEventListener('change', async (event) => {
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
    querySettings('#comfy-show-floating')?.addEventListener('change', async (event) => {
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
    querySettings('#comfy-draw-save')?.addEventListener('click', async (event) => {
        const ok = await saveAllSettings({ notify: true, triggerButton: event.currentTarget, statusElementId: 'comfy-draw-api-status' });
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-connection-mode')?.addEventListener('change', () => {
        updateConnectionModeUI(getValue('comfy-connection-mode'));
    });
    querySettings('#comfy-draw-test')?.addEventListener('click', async () => {
        await saveAllSettings({ notify: false });
        await testConnection();
    });
    querySettings('#comfy-draw-test-generate')?.addEventListener('click', async () => {
        await saveAllSettings({ notify: false });
        await testGenerateFromSettingsPanel();
    });
    querySettings('#comfy-draw-size-preset')?.addEventListener('change', () => {
        applySizePresetSelection();
    });
    [
        'comfy-draw-model',
        'comfy-draw-sampler',
        'comfy-draw-scheduler',
        'comfy-draw-steps',
        'comfy-draw-cfg',
        'comfy-draw-width',
        'comfy-draw-height',
    ].forEach((id) => {
        const eventName = id === 'comfy-draw-width' || id === 'comfy-draw-height' || id === 'comfy-draw-steps' || id === 'comfy-draw-cfg'
            ? 'input'
            : 'change';
        querySettings(`#${id}`)?.addEventListener(eventName, () => {
            refreshBuiltinWorkflowPanel(getSettings());
        });
    });
    querySettings('#comfy-draw-preset-select')?.addEventListener('change', async () => {
        const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
            settings.selectedPresetId = getValue('comfy-draw-preset-select');
        }, '预设已切换', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-draw-preset-add')?.addEventListener('click', async () => {
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
    querySettings('#comfy-draw-preset-rename')?.addEventListener('click', async () => {
        const settings = getSettings();
        const preset = getActivePreset(settings);
        const name = prompt('输入新名称：', preset.name || '预设');
        if (!name) return;
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.presets = draft.presets.map((item) => item.id === preset.id ? { ...item, name } : item);
        }, '预设已重命名', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-draw-preset-delete')?.addEventListener('click', async () => {
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
    querySettings('#comfy-draw-preset-save')?.addEventListener('click', async (event) => {
        const settings = getSettings();
        const preset = getActivePreset(settings);
        const nextPreset = { ...readPresetFromForm(), id: preset.id, name: preset.name };
        const ok = await runSaveButtonTask(event.currentTarget, () => updateSettingsPersistent((draft) => {
            const form = readForm();
            Object.assign(draft, form);
            draft.presets = draft.presets.map((item) => item.id === preset.id ? nextPreset : item);
            draft.selectedPresetId = preset.id;
        }, '预设已保存', { notify: false, silent: false }), {
            statusElementId: 'comfy-draw-params-status',
            pendingText: '正在保存预设...',
            successText: '预设已保存到小白X配置文件',
            errorText: '预设保存失败，请重试',
        });
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-workflow-preset-select')?.addEventListener('change', async () => {
        const selectedWorkflowPresetId = getValue('comfy-workflow-preset-select');
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.selectedWorkflowPresetId = selectedWorkflowPresetId;
            const preset = draft.workflowPresets.find((item) => item.id === selectedWorkflowPresetId) || draft.workflowPresets[0] || createDefaultWorkflowPreset();
            draft.customWorkflow = {
                json: preset.json,
                nodePositive: preset.nodePositive,
                nodeNegative: preset.nodeNegative,
                nodeWidth: preset.nodeWidth,
                nodeHeight: preset.nodeHeight,
                nodeSeed: preset.nodeSeed,
                nodeSaveImage: preset.nodeSaveImage,
            };
        }, '工作流预设已切换', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-workflow-preset-add')?.addEventListener('click', async () => {
        const preset = {
            ...createDefaultWorkflowPreset(),
            id: `workflow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: prompt('输入工作流预设名称：', '新工作流') || '新工作流',
        };
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.workflowPresets = [...(draft.workflowPresets || []), preset];
            draft.selectedWorkflowPresetId = preset.id;
            draft.customWorkflow = {
                json: preset.json,
                nodePositive: preset.nodePositive,
                nodeNegative: preset.nodeNegative,
                nodeWidth: preset.nodeWidth,
                nodeHeight: preset.nodeHeight,
                nodeSeed: preset.nodeSeed,
                nodeSaveImage: preset.nodeSaveImage,
            };
        }, '已创建工作流预设', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-workflow-preset-rename')?.addEventListener('click', async () => {
        const settings = getSettings();
        const preset = getActiveWorkflowPreset(settings);
        const name = prompt('输入新名称：', preset.name || '工作流');
        if (!name) return;
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.workflowPresets = draft.workflowPresets.map((item) => item.id === preset.id ? { ...item, name } : item);
        }, '工作流预设已重命名', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-workflow-preset-delete')?.addEventListener('click', async () => {
        const settings = getSettings();
        if ((settings.workflowPresets || []).length <= 1) {
            toastr.warning('至少保留一个工作流预设');
            return;
        }
        const preset = getActiveWorkflowPreset(settings);
        if (!confirm(`删除工作流预设「${preset.name}」？`)) return;
        const workflowPresets = settings.workflowPresets.filter((item) => item.id !== preset.id);
        const nextPreset = workflowPresets[0] || createDefaultWorkflowPreset();
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.workflowPresets = workflowPresets;
            draft.selectedWorkflowPresetId = nextPreset.id;
            draft.customWorkflow = {
                json: nextPreset.json,
                nodePositive: nextPreset.nodePositive,
                nodeNegative: nextPreset.nodeNegative,
                nodeWidth: nextPreset.nodeWidth,
                nodeHeight: nextPreset.nodeHeight,
                nodeSeed: nextPreset.nodeSeed,
                nodeSaveImage: nextPreset.nodeSaveImage,
            };
        }, '工作流预设已删除', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    // 拉取模型按钮
    querySettings('#comfy-draw-refresh-models')?.addEventListener('click', async (event) => {
        const button = event.currentTarget;
        if (button) {
            button.disabled = true;
            const doc = getSettingsDocument() || document;
            const icon = doc.createElement('i');
            if (icon) icon.className = 'fa-solid fa-spinner fa-spin';
            button.replaceChildren(icon, doc.createTextNode(' 拉取中...'));
        }
        try {
            const saved = await saveAllSettings({ notify: false });
            if (!saved) {
                updateStatusText('comfy-draw-workflow-status', 'error', '保存当前连接配置失败，请重试');
                return;
            }
            await refreshComfyOptions({ notify: true });
        } finally {
            if (button) {
                button.disabled = false;
                const doc = getSettingsDocument() || document;
                const icon = doc.createElement('i');
                if (icon) icon.className = 'fa-solid fa-rotate';
                button.replaceChildren(icon, doc.createTextNode(' 拉取模型'));
            }
        }
    });
    querySettings('#comfy-builtin-workflow')?.addEventListener('change', async () => {
        const builtinWorkflowId = getValue('comfy-builtin-workflow') || DEFAULT_COMFY_DRAW_SETTINGS.builtinWorkflowId;
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.builtinWorkflowId = builtinWorkflowId;
        }, '内置工作流已保存', { notify: false, silent: false }));
        if (ok) refreshBuiltinWorkflowPanel(getSettings());
    });
    querySettings('#comfy-builtin-workflow-apply')?.addEventListener('click', async (event) => {
        const button = event.currentTarget;
        const workflow = getBuiltinWorkflowDefinition(getValue('comfy-builtin-workflow') || getSettings().builtinWorkflowId);
        const recommended = workflow.recommended || {};
        setSavingState(button);
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.builtinWorkflowId = workflow.id;
            draft.sampler = recommended.sampler || draft.sampler;
            draft.scheduler = recommended.scheduler || draft.scheduler;
            draft.steps = normalizeNumber(recommended.steps, draft.steps, 1, 150);
            draft.cfg = normalizeNumber(recommended.cfg, draft.cfg, 1, 30);
            const preset = draft.presets.find((item) => item.id === draft.selectedPresetId);
            if (preset) {
                preset.width = normalizeNumber(recommended.width, preset.width, 64, 2048);
                preset.height = normalizeNumber(recommended.height, preset.height, 64, 2048);
                preset.sampler = recommended.sampler || preset.sampler;
                preset.scheduler = recommended.scheduler || preset.scheduler;
                preset.steps = normalizeNumber(recommended.steps, preset.steps, 1, 150);
                preset.cfg = normalizeNumber(recommended.cfg, preset.cfg, 1, 30);
            }
        }, '已应用内置工作流推荐参数', { notify: false, silent: false }));
        handleSaveResult(ok, button, 'fa-solid fa-wand-magic-sparkles');
        if (!ok) toastr.error('应用失败，请重试', 'ComfyUI');
        if (ok) fillForm(getSettings());
    });
    // 高级参数面板展开/折叠（简单模式内）
    querySettings('#comfy-toggle-advanced-params')?.addEventListener('click', () => {
        const section = getSettingsElement('comfy-advanced-params-section');
        const btn = getSettingsElement('comfy-toggle-advanced-params');
        if (!section || !btn) return;
        const isHidden = section.classList.contains('hidden');
        section.classList.toggle('hidden', !isHidden);
        const icon = document.createElement('i');
        icon.className = isHidden ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down';
        btn.replaceChildren(icon, document.createTextNode(isHidden ? ' 收起' : ' 展开'));
    });
    // 工作流模式切换（顶部二选一）
    querySettings('#comfy-workflow-mode-simple')?.addEventListener('click', async () => {
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.workflowMode = 'simple';
        }, '已切换到简单模式', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-workflow-mode-custom')?.addEventListener('click', async () => {
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.workflowMode = 'custom';
        }, '已切换到自定义模式', { silent: false }));
        if (ok) fillForm(getSettings());
    });
    // 自定义工作流：JSON 文件导入
    querySettings('#comfy-workflow-import')?.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            parseComfyApiWorkflowJson(text);
            setValue('comfy-workflow-json', text);
            toastr.success('工作流已导入，请配置节点映射后保存', 'ComfyUI');
        } catch (e) {
            toastr.error(e.message || '工作流格式错误：需要 API Format workflow JSON', 'ComfyUI');
        }
        event.target.value = ''; // 重置以允许重复导入同一文件
    });
    // 自定义工作流：清空
    querySettings('#comfy-workflow-clear')?.addEventListener('click', () => {
        setValue('comfy-workflow-json', '');
        toastr.info('已清空工作流内容', 'ComfyUI');
    });
    const saveComfyWorkflowField = async (label, mutator, statusElementId = 'comfy-draw-workflow-status') => {
        updateStatusText(statusElementId, '', `${label}保存中...`);
        const ok = await withSaveTimeout(updateSettingsPersistent(mutator, `${label}已保存`, { notify: false, silent: false }));
        const successText = `${label}已保存`;
        updateStatusText(
            statusElementId,
            ok ? 'success' : 'error',
            ok ? successText : `${label}保存失败，请重试`,
        );
        if (ok) {
            setTimeout(() => {
                const el = getSettingsElement(statusElementId);
                if (el?.textContent === successText) updateStatusText(statusElementId, '', '');
            }, 1800);
        }
        if (ok) fillForm(getSettings());
        return ok;
    };

    // 模型/采样器/调度器/steps/cfg 变更后即时保存
    querySettings('#comfy-draw-model')?.addEventListener('change', async () => {
        const model = getValue('comfy-draw-model');
        await saveComfyWorkflowField('模型', (draft) => {
            draft.selectedModel = model;
            const preset = draft.presets.find(p => p.id === draft.selectedPresetId);
            if (preset) preset.model = model;
        }, 'comfy-draw-model-status');
    });
    querySettings('#comfy-draw-sampler')?.addEventListener('change', async () => {
        const sampler = getValue('comfy-draw-sampler');
        await saveComfyWorkflowField('采样器', (draft) => {
            draft.sampler = sampler;
            const preset = draft.presets.find(p => p.id === draft.selectedPresetId);
            if (preset) preset.sampler = sampler;
        });
    });
    querySettings('#comfy-draw-scheduler')?.addEventListener('change', async () => {
        const scheduler = getValue('comfy-draw-scheduler');
        await saveComfyWorkflowField('调度器', (draft) => {
            draft.scheduler = scheduler;
            const preset = draft.presets.find(p => p.id === draft.selectedPresetId);
            if (preset) preset.scheduler = scheduler;
        });
    });
    querySettings('#comfy-draw-steps')?.addEventListener('change', async () => {
        const steps = normalizeNumber(getValue('comfy-draw-steps'), 20, 1, 150);
        await saveComfyWorkflowField('Steps', (draft) => {
            draft.steps = steps;
            const preset = draft.presets.find(p => p.id === draft.selectedPresetId);
            if (preset) preset.steps = steps;
        });
    });
    querySettings('#comfy-draw-cfg')?.addEventListener('change', async () => {
        const cfg = normalizeNumber(getValue('comfy-draw-cfg'), 7, 1, 30);
        await saveComfyWorkflowField('CFG', (draft) => {
            draft.cfg = cfg;
            const preset = draft.presets.find(p => p.id === draft.selectedPresetId);
            if (preset) preset.cfg = cfg;
        });
    });
    querySettings('#comfy-workflow-preset-save')?.addEventListener('click', async (event) => {
        const settings = getSettings();
        const activePreset = getActiveWorkflowPreset(settings);
        const nodeMap = buildWorkflowNodeMapFromForm();
        const ok = await runSaveButtonTask(event.currentTarget, () => updateSettingsPersistent((draft) => {
            const json = getValue('comfy-workflow-json');
            validateWorkflowPresetDraftOrThrow({ json, nodeMap });
            const nextPreset = {
                ...activePreset,
                json,
                nodePositive: nodeMap.positive,
                nodeNegative: nodeMap.negative,
                nodeWidth: nodeMap.width,
                nodeHeight: nodeMap.height,
                nodeSeed: nodeMap.seed,
                nodeSaveImage: nodeMap.saveImage,
            };
            draft.workflowPresets = draft.workflowPresets.map((item) => item.id === activePreset.id ? nextPreset : item);
            draft.selectedWorkflowPresetId = activePreset.id;
            draft.workflowMode = 'custom';
            draft.customWorkflow = {
                json: nextPreset.json,
                nodePositive: nextPreset.nodePositive,
                nodeNegative: nextPreset.nodeNegative,
                nodeWidth: nextPreset.nodeWidth,
                nodeHeight: nextPreset.nodeHeight,
                nodeSeed: nextPreset.nodeSeed,
                nodeSaveImage: nextPreset.nodeSaveImage,
            };
        }, '工作流预设已保存', { notify: false, silent: false }), {
            statusElementId: 'comfy-workflow-preset-status',
            pendingText: '正在保存工作流预设...',
            successText: '工作流预设已保存',
            errorText: '保存失败，请重试',
        });
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-shared-char-add')?.addEventListener('click', () => {
        addCharacterTagDraft();
    });
    querySettings('#comfy-shared-char-clear')?.addEventListener('click', () => {
        clearCharacterTagsDraft();
    });
    querySettings('#comfy-shared-char-export')?.addEventListener('click', () => {
        exportSharedCharacterTags();
    });
    querySettings('#comfy-shared-char-import')?.addEventListener('change', async (event) => {
        await importSharedCharacterTags(event.target);
    });
    querySettings('#comfy-danbooru-local')?.addEventListener('change', async (event) => {
        await setComfyDanbooruLocalEnabled(event.target.checked === true);
    });
    querySettings('#comfy-shared-llm-provider')?.addEventListener('change', () => {
        handleSharedLlmProviderChange();
    });
    querySettings('#comfy-shared-llm-fetch')?.addEventListener('click', async () => {
        await fetchSharedLlmModels();
    });
    querySettings('#comfy-llm-request-refresh')?.addEventListener('click', () => {
        renderLastLlmRequestPreview();
    });
    querySettings('#comfy-prompt-preset-select')?.addEventListener('change', async () => {
        const selectedId = getValue('comfy-prompt-preset-select');
        const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
            settings.selectedPromptPresetId = selectedId;
            const active = settings.promptPresets.find((preset) => preset.id === selectedId) || settings.promptPresets[0];
            if (active) {
                settings.customPrompts = {
                    topSystem: active.topSystem,
                    tagGuideContent: active.tagGuideContent,
                    userJsonFormat: active.userJsonFormat,
                };
            }
        }, '提示词预设已切换', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-prompt-preset-add')?.addEventListener('click', async () => {
        const current = readPromptPresetFromForm();
        const preset = {
            ...current,
            id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: prompt('输入提示词预设名称：', `提示词-${(getSettings().promptPresets || []).length + 1}`) || `提示词-${(getSettings().promptPresets || []).length + 1}`,
        };
        const ok = await withSaveTimeout(updateSettingsPersistent((settings) => {
            settings.promptPresets = [...settings.promptPresets, preset];
            settings.selectedPromptPresetId = preset.id;
            settings.customPrompts = {
                topSystem: preset.topSystem,
                tagGuideContent: preset.tagGuideContent,
                userJsonFormat: preset.userJsonFormat,
            };
        }, '已创建提示词预设', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-prompt-preset-rename')?.addEventListener('click', async () => {
        const settings = getSettings();
        const preset = getActivePromptPreset(settings);
        const name = prompt('输入新名称：', preset.name || '提示词预设');
        if (!name) return;
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.promptPresets = draft.promptPresets.map((item) => item.id === preset.id ? { ...item, name } : item);
        }, '提示词预设已重命名', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-prompt-preset-delete')?.addEventListener('click', async () => {
        const settings = getSettings();
        if ((settings.promptPresets || []).length <= 1) {
            toastr.warning('至少保留一个提示词预设');
            return;
        }
        const preset = getActivePromptPreset(settings);
        if (!confirm(`删除提示词预设「${preset.name}」？`)) return;
        const nextPresets = settings.promptPresets.filter((item) => item.id !== preset.id);
        const ok = await withSaveTimeout(updateSettingsPersistent((draft) => {
            draft.promptPresets = nextPresets;
            draft.selectedPromptPresetId = nextPresets[0]?.id || null;
            const active = nextPresets[0];
            if (active) {
                draft.customPrompts = {
                    topSystem: active.topSystem,
                    tagGuideContent: active.tagGuideContent,
                    userJsonFormat: active.userJsonFormat,
                };
            }
        }, '提示词预设已删除', { notify: false, silent: false }));
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-prompt-preset-save')?.addEventListener('click', async (event) => {
        const settings = getSettings();
        const preset = getActivePromptPreset(settings);
        const nextPreset = { ...readPromptPresetFromForm(preset), id: preset.id, name: preset.name };
        const ok = await runSaveButtonTask(event.currentTarget, () => updateSettingsPersistent((draft) => {
            draft.promptPresets = draft.promptPresets.map((item) => item.id === preset.id ? nextPreset : item);
            draft.selectedPromptPresetId = preset.id;
            draft.customPrompts = {
                topSystem: nextPreset.topSystem,
                tagGuideContent: nextPreset.tagGuideContent,
                userJsonFormat: nextPreset.userJsonFormat,
            };
        }, '提示词预设已保存', { notify: false, silent: false }), {
            statusElementId: 'comfy-prompt-preset-status',
            pendingText: '正在保存提示词预设...',
            successText: '提示词预设已保存',
            errorText: '提示词预设保存失败，请重试',
        });
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-prompts-save')?.addEventListener('click', async (event) => {
        const settings = getSettings();
        const preset = getActivePromptPreset(settings);
        const nextPreset = { ...readPromptPresetFromForm(preset), id: preset.id, name: preset.name };
        const ok = await runSaveButtonTask(event.currentTarget, () => updateSettingsPersistent((draft) => {
            draft.promptPresets = draft.promptPresets.map((item) => item.id === preset.id ? nextPreset : item);
            draft.selectedPromptPresetId = preset.id;
            draft.customPrompts = {
                topSystem: nextPreset.topSystem,
                tagGuideContent: nextPreset.tagGuideContent,
                userJsonFormat: nextPreset.userJsonFormat,
            };
        }, '提示词预设已保存', { notify: false, silent: false }), {
            statusElementId: 'comfy-prompts-status',
            pendingText: '正在保存提示词模板...',
            successText: '提示词模板已保存到当前预设',
            errorText: '提示词模板保存失败，请重试',
        });
        if (ok) fillForm(getSettings());
    });
    querySettings('#comfy-prompt-reset-system')?.addEventListener('click', () => {
        const defaults = getPromptPresetDefaults(getActivePromptPreset(getSettings()).name);
        setValue('comfy-prompt-system', defaults.topSystem);
        renderPromptChainPreview();
    });
    querySettings('#comfy-prompt-reset-guide')?.addEventListener('click', () => {
        const defaults = getPromptPresetDefaults(getActivePromptPreset(getSettings()).name);
        setValue('comfy-prompt-guide', defaults.tagGuideContent);
        renderPromptChainPreview();
    });
    querySettings('#comfy-prompt-reset-format')?.addEventListener('click', () => {
        const defaults = getPromptPresetDefaults(getActivePromptPreset(getSettings()).name);
        setValue('comfy-prompt-format', defaults.userJsonFormat);
        renderPromptChainPreview();
    });
    querySettings('#comfy-prompts-reset-all')?.addEventListener('click', () => {
        if (!confirm('确认恢复当前提示词模板为默认值？')) return;
        const defaults = getPromptPresetDefaults(getActivePromptPreset(getSettings()).name);
        setValue('comfy-prompt-system', defaults.topSystem);
        setValue('comfy-prompt-guide', defaults.tagGuideContent);
        setValue('comfy-prompt-format', defaults.userJsonFormat);
        renderPromptChainPreview();
    });
    querySettings('#comfy-prompts-export')?.addEventListener('click', () => {
        const payload = {
            _type: 'comfy-draw-prompt-template',
            _version: 1,
            topSystem: getValue('comfy-prompt-system'),
            tagGuideContent: getValue('comfy-prompt-guide'),
            userJsonFormat: getValue('comfy-prompt-format'),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comfy-draw-prompts.json';
        link.click();
        URL.revokeObjectURL(url);
    });
    querySettings('#comfy-prompts-import')?.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const text = await file.text();
            const payload = JSON.parse(text);
            if (typeof payload.topSystem !== 'string' || typeof payload.tagGuideContent !== 'string' || typeof payload.userJsonFormat !== 'string') {
                throw new Error('不是有效的提示词模板文件');
            }
            setValue('comfy-prompt-system', payload.topSystem);
            setValue('comfy-prompt-guide', payload.tagGuideContent);
            setValue('comfy-prompt-format', payload.userJsonFormat);
            renderPromptChainPreview();
            toastr.success('导入成功，请点击保存以生效', 'ComfyUI');
        } catch (error) {
            toastr.error(error?.message || '导入失败', 'ComfyUI');
        } finally {
            event.target.value = '';
        }
    });
    querySettings('#comfy-chain-toggle')?.addEventListener('click', () => {
        const container = getSettingsElement('comfy-prompt-chain');
        const icon = querySettings('#comfy-chain-toggle .chain-toggle-icon');
        if (!container) return;
        const isOpen = container.classList.toggle('open');
        if (icon) icon.textContent = isOpen ? '▼ 收起' : '▶ 展开';
        if (isOpen) renderPromptChainPreview();
    });
    ['comfy-prompt-system', 'comfy-prompt-guide', 'comfy-prompt-format'].forEach((id) => {
        querySettings(`#${id}`)?.addEventListener('input', () => {
            if (getSettingsElement('comfy-prompt-chain')?.classList.contains('open')) {
                renderPromptChainPreview();
            }
        });
    });
    querySettings('#comfy-filter-add')?.addEventListener('click', () => {
        renderFilterRuleRow({ start: '', end: '' });
    });
    querySettings('#comfy-filter-reset')?.addEventListener('click', () => {
        renderFilterRules(DEFAULT_MESSAGE_FILTER_RULES);
    });
    querySettings('#comfy-filter-save')?.addEventListener('click', async (event) => {
        await runSaveButtonTask(event.currentTarget, () => saveSharedDrawSettings({ notify: false }), {
            statusElementId: 'comfy-filter-status',
            pendingText: '正在保存过滤规则...',
            successText: '过滤规则已保存',
            errorText: '过滤规则保存失败，请重试',
        });
    });
    bindWorldbookUploadEvents();
    querySettingsAll('[data-comfy-save-shared]').forEach((button) => {
        button.addEventListener('click', async (event) => {
            const statusElementId = event.currentTarget.dataset.comfyStatus || 'comfy-shared-status';
            await saveAllSettings({ notify: true, triggerButton: event.currentTarget, statusElementId });
        });
    });
    querySettings('#comfy-shared-character-list')?.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('[data-sd-char-delete]');
        if (deleteButton) {
            deleteCharacterTagDraft(deleteButton.dataset.sdCharDelete);
            return;
        }
        const danbooruButton = event.target.closest('[data-sd-char-danbooru]');
        if (danbooruButton) {
            showComfyDanbooruPanel(danbooruButton.dataset.sdCharDanbooru);
        }
    });
}

function fillForm(settings) {
    const preset = getActivePreset(settings);
    fillPresetSelect(settings);
    fillWorkflowPresetSelect(settings);
    fillPromptPresetSelect(settings);
    const showFloor = getSettingsElement('comfy-show-floor');
    const showFloating = getSettingsElement('comfy-show-floating');
    if (showFloor) showFloor.checked = settings.showFloorButton !== false;
    if (showFloating) showFloating.checked = settings.showFloatingButton !== false;
    getSettingsDocument()?.body?.classList.add('advanced-mode');
    querySettingsAll('[data-comfy-mode]').forEach((button) => {
        button.classList.toggle('active', button.dataset.comfyMode === (settings.mode === 'auto' ? 'auto' : 'manual'));
    });
    setValue('comfy-connection-mode', settings.connectionMode || 'proxy');
    setValue('comfy-draw-auth', settings.auth || '');
    updateConnectionModeUI(settings.connectionMode || 'proxy');
    setValue('comfy-draw-host', settings.host);
    setValue('comfy-draw-timeout', settings.timeout);
    setValue('comfy-draw-width', preset.width);
    setValue('comfy-draw-height', preset.height);
    updateSizePresetSelection();
    setValue('comfy-draw-positive-prefix', preset.positivePrefix);
    setValue('comfy-draw-negative-prefix', preset.negativePrefix);
    setValue('comfy-draw-max-images', preset.maxImages || 0);
    setValue('comfy-draw-max-chars', preset.maxCharactersPerImage || 0);

    // 模型配置页面
    populateModelSelect(settings.modelCache || []);
    if (Array.isArray(settings.samplerCache) && settings.samplerCache.length) {
        populateSelect(
            'comfy-draw-sampler',
            settings.samplerCache.map((item) => ({ value: item, label: item })),
            { value: preset.sampler || settings.sampler || 'euler' },
        );
    }
    if (Array.isArray(settings.schedulerCache) && settings.schedulerCache.length) {
        populateSelect(
            'comfy-draw-scheduler',
            settings.schedulerCache.map((item) => ({ value: item, label: item })),
            { value: preset.scheduler || settings.scheduler || 'normal' },
        );
    }
    setSelectValue('comfy-draw-model', preset.model || settings.selectedModel || '');
    setSelectValue('comfy-draw-sampler', preset.sampler || settings.sampler || 'euler');
    setSelectValue('comfy-draw-scheduler', preset.scheduler || settings.scheduler || 'normal');
    setValue('comfy-draw-steps', preset.steps ?? settings.steps ?? 20);
    setValue('comfy-draw-cfg', preset.cfg ?? settings.cfg ?? 7);

    // 工作流模式
    const isSimple = settings.workflowMode !== 'custom';
    const simpleBtn = getSettingsElement('comfy-workflow-mode-simple');
    const customBtn = getSettingsElement('comfy-workflow-mode-custom');
    const simpleSection = getSettingsElement('comfy-simple-mode-section');
    const customSection = getSettingsElement('comfy-custom-mode-section');
    if (simpleBtn) simpleBtn.classList.toggle('active', isSimple);
    if (customBtn) customBtn.classList.toggle('active', !isSimple);
    if (simpleSection) simpleSection.classList.toggle('hidden', !isSimple);
    if (customSection) customSection.classList.toggle('hidden', isSimple);

    // 自定义工作流字段（保留原逻辑）
    setValue('comfy-workflow-json', settings.customWorkflow?.json || '');
    setValue('comfy-node-positive', settings.customWorkflow?.nodePositive || '');
    setValue('comfy-node-negative', settings.customWorkflow?.nodeNegative || '');
    setValue('comfy-node-width', settings.customWorkflow?.nodeWidth || '');
    setValue('comfy-node-height', settings.customWorkflow?.nodeHeight || '');
    setValue('comfy-node-seed', settings.customWorkflow?.nodeSeed || '');
    setValue('comfy-node-save-image', settings.customWorkflow?.nodeSaveImage || '');

    refreshBuiltinWorkflowPanel(settings);
    applyPromptPresetToForm(settings);
    fillSharedDrawForm();
    refreshSettingsSummary();
}

function readForm() {
    const current = getSettings();
    const preset = readPresetFromForm();
    return {
        ...current,
        host: getValue('comfy-draw-host').trim(),
        connectionMode: getValue('comfy-connection-mode') === 'direct' ? 'direct' : 'proxy',
        auth: getValue('comfy-draw-auth').trim(),
        timeout: normalizeNumber(getValue('comfy-draw-timeout'), current.timeout, 10000, 600000),
        builtinWorkflowId: getValue('comfy-builtin-workflow') || current.builtinWorkflowId || DEFAULT_COMFY_DRAW_SETTINGS.builtinWorkflowId,
        presets: current.presets.map(item => item.id === current.selectedPresetId ? { ...preset, id: item.id, name: item.name } : item),
    };
}

function readPresetFromForm() {
    const settings = getSettings();
    const current = getActivePreset(settings);
    const sizePreset = getValue('comfy-draw-size-preset');
    let width = normalizeNumber(getValue('comfy-draw-width'), 1024, 64, 2048);
    let height = normalizeNumber(getValue('comfy-draw-height'), 1024, 64, 2048);
    if (sizePreset && sizePreset !== 'custom') {
        const matched = COMFY_SIZE_PRESETS.find((item) => item.value === sizePreset);
        if (matched) {
            width = matched.width;
            height = matched.height;
        }
    }
    return {
        ...current,
        width,
        height,
        positivePrefix: getValue('comfy-draw-positive-prefix'),
        negativePrefix: getValue('comfy-draw-negative-prefix'),
        // 新增
        model: getValue('comfy-draw-model'),
        sampler: getValue('comfy-draw-sampler'),
        scheduler: getValue('comfy-draw-scheduler'),
        steps: normalizeNumber(getValue('comfy-draw-steps'), 20, 1, 150),
        cfg: normalizeNumber(getValue('comfy-draw-cfg'), 7, 1, 30),
        maxImages: normalizeNumber(getValue('comfy-draw-max-images'), 0, 0, 999),
        maxCharactersPerImage: normalizeNumber(getValue('comfy-draw-max-chars'), 0, 0, 999),
    };
}

function updateSizePresetSelection() {
    const width = getValue('comfy-draw-width');
    const height = getValue('comfy-draw-height');
    const value = `${width}x${height}`;
    const select = getSettingsElement('comfy-draw-size-preset');
    const customRow = getSettingsElement('comfy-draw-custom-size');
    if (!select || !customRow) return;
    const matched = COMFY_SIZE_PRESETS.find((item) => item.value === value);
    select.value = matched ? matched.value : 'custom';
    customRow.classList.toggle('hidden', select.value !== 'custom');
}

function applySizePresetSelection() {
    const value = getValue('comfy-draw-size-preset');
    const customRow = getSettingsElement('comfy-draw-custom-size');
    if (!customRow) return;
    if (value === 'custom') {
        customRow.classList.remove('hidden');
        refreshBuiltinWorkflowPanel(getSettings());
        return;
    }
    const matched = COMFY_SIZE_PRESETS.find((item) => item.value === value);
    if (matched) {
        setValue('comfy-draw-width', matched.width);
        setValue('comfy-draw-height', matched.height);
    }
    customRow.classList.add('hidden');
    refreshBuiltinWorkflowPanel(getSettings());
}

function fillPresetSelect(settings = getSettings()) {
    const select = getSettingsElement('comfy-draw-preset-select');
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

function fillWorkflowPresetSelect(settings = getSettings()) {
    const select = getSettingsElement('comfy-workflow-preset-select');
    if (!select) return;
    select.textContent = '';
    (settings.workflowPresets || []).forEach((preset) => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name || preset.id;
        select.appendChild(option);
    });
    select.value = settings.selectedWorkflowPresetId || settings.workflowPresets?.[0]?.id || '';
}

function fillPromptPresetSelect(settings = getSettings()) {
    const select = getSettingsElement('comfy-prompt-preset-select');
    if (!select) return;
    select.textContent = '';
    (settings.promptPresets || []).forEach((preset) => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name || preset.id;
        select.appendChild(option);
    });
    select.value = settings.selectedPromptPresetId || settings.promptPresets?.[0]?.id || '';
}

function applyPromptPresetToForm(settings = getSettings()) {
    const promptPreset = getActivePromptPreset(settings);
    setValue('comfy-prompt-system', promptPreset.topSystem || '');
    setValue('comfy-prompt-guide', promptPreset.tagGuideContent || '');
    setValue('comfy-prompt-format', promptPreset.userJsonFormat || '');
    renderPromptChainPreview(settings);
}

function readPromptPresetFromForm(basePreset = getActivePromptPreset(getSettings())) {
    return {
        ...basePreset,
        topSystem: getValue('comfy-prompt-system'),
        tagGuideContent: getValue('comfy-prompt-guide'),
        userJsonFormat: getValue('comfy-prompt-format'),
    };
}

function updateConnectionModeUI(mode = getSettings().connectionMode) {
    const isDirect = mode === 'direct';
    const authRow = getSettingsElement('comfy-auth-row');
    const connectionHint = getSettingsElement('comfy-connection-hint');
    const connectionModeNote = getSettingsElement('comfy-connection-mode-note');
    const hostHint = getSettingsElement('comfy-host-hint');
    const status = getSettingsElement('comfy-draw-api-status');
    const workflowStatus = getSettingsElement('comfy-draw-workflow-status');
    const statusText = isDirect
        ? '当前使用浏览器直连 ComfyUI。'
        : '当前使用酒馆后端代理连接 ComfyUI。';
    authRow?.classList.toggle('hidden', !isDirect);
    if (connectionHint) {
        connectionHint.textContent = isDirect
            ? '浏览器直连会从当前浏览器访问 ComfyUI；需要登录时可在这里填写认证信息。'
            : '酒馆代理会通过 SillyTavern 转发请求；这里不填写 ComfyUI 认证信息。';
    }
    if (connectionModeNote) {
        connectionModeNote.textContent = isDirect
            ? '如果直连偶发连接失败，可以先换酒馆代理对照。'
            : '如果代理偶发拿不到图，可以先检查 ComfyUI 输出目录，或换浏览器直连对照。';
    }
    if (hostHint) {
        hostHint.textContent = isDirect
            ? '填写当前浏览器能访问到的 ComfyUI 地址。'
            : '填写酒馆服务器能访问到的 ComfyUI 地址。';
    }
    if (status) {
        status.textContent = statusText;
        status.className = 'status-text';
    }
    if (workflowStatus) {
        workflowStatus.textContent = statusText;
        workflowStatus.className = 'status-text';
    }
}

// 填充模型下拉框
function populateModelSelect(models = []) {
    const select = getSettingsElement('comfy-draw-model');
    if (!select) return;
    const currentValue = select.value;
    const modelList = Array.isArray(models) ? models.filter(Boolean) : [];
    select.textContent = '';
    if (!modelList.length) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = '未找到可直接出图的模型';
        select.appendChild(opt);
    } else {
        modelList.forEach(model => {
            const opt = document.createElement('option');
            opt.value = model;
            opt.textContent = model;
            select.appendChild(opt);
        });
    }
    if (currentValue && modelList.includes(currentValue)) {
        select.value = currentValue;
    }
}

function populateBuiltinWorkflowSelect(selectedId) {
    const select = getSettingsElement('comfy-builtin-workflow');
    if (!select) return;
    select.textContent = '';
    BUILTIN_WORKFLOWS.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
    select.value = BUILTIN_WORKFLOWS.some((item) => item.id === selectedId)
        ? selectedId
        : BUILTIN_WORKFLOWS[0].id;
}

function refreshBuiltinWorkflowPanel(settings = getSettings()) {
    const workflow = getBuiltinWorkflowDefinition(settings.builtinWorkflowId);
    populateBuiltinWorkflowSelect(workflow.id);
    const summaryEl = getSettingsElement('comfy-builtin-workflow-summary');
    const descEl = getSettingsElement('comfy-builtin-workflow-desc');
    const notesEl = getSettingsElement('comfy-builtin-workflow-notes');
    if (summaryEl) summaryEl.textContent = workflow.summary;
    if (descEl) descEl.textContent = workflow.description;
    if (notesEl) notesEl.textContent = workflow.notes || '';
    setValue('comfy-builtin-workflow-preview', createBuiltinWorkflowPreview(getBuiltinWorkflowPreviewParams(settings)));
}

// 刷新 ComfyUI 模型和采样器列表
async function refreshComfyOptions({ notify = true, timeoutMs = getSettings().timeout || 120000 } = {}) {
    if (notify) updateStatusText('comfy-draw-workflow-status', '', '正在获取模型列表...');
    try {
        const models = await fetchComfyModels({ timeoutMs });

        await updateSettingsPersistent((draft) => {
            draft.modelCache = models || [];
        }, '模型列表已更新', { notify, silent: !notify });

        populateModelSelect(models || []);

        const count = models?.length || 0;
        if (notify) {
            updateComfyOptionStatus(
                count ? 'success' : 'error',
                count
                    ? `已获取 ${count} 个可直接出图的模型；采样器/调度器后台刷新中`
                    : '没有找到“只选一个模型文件就能画”的模型；如果你的模型需要多个文件，请导入自定义工作流',
            );
        }
        void refreshComfySamplerOptions({ notify: false, timeoutMs: Math.max(timeoutMs, 30000) });
        return true;
    } catch (error) {
        console.error('[ComfyDraw] refreshComfyOptions failed:', error);
        if (notify) updateComfyOptionStatus('error', error?.message || '获取失败');
        return false;
    }
}

async function refreshComfySamplerOptions({ notify = true, timeoutMs = Math.max(getSettings().timeout || 120000, 30000) } = {}) {
    try {
        const samplerInfo = await fetchComfySamplers({ timeoutMs });
        await updateSettingsPersistent((draft) => {
            draft.samplerCache = samplerInfo?.samplers || [];
            draft.schedulerCache = samplerInfo?.schedulers || [];
        }, '采样器列表已更新', { notify: false, silent: true });

        populateSelect(
            'comfy-draw-sampler',
            (samplerInfo?.samplers || []).map((item) => ({ value: item, label: item })),
            { value: getValue('comfy-draw-sampler') || getActivePreset(getSettings()).sampler || getSettings().sampler || 'euler' },
        );
        populateSelect(
            'comfy-draw-scheduler',
            (samplerInfo?.schedulers || []).map((item) => ({ value: item, label: item })),
            { value: getValue('comfy-draw-scheduler') || getActivePreset(getSettings()).scheduler || getSettings().scheduler || 'normal' },
        );
        if (notify) updateComfyOptionStatus('success', '采样器/调度器已刷新');
    } catch (error) {
        console.warn('[ComfyDraw] refreshComfySamplerOptions failed:', error);
        if (notify) updateComfyOptionStatus('error', `模型已更新，采样器/调度器刷新失败：${error?.message || '请检查配置'}`);
    }
}

function switchSettingsView(viewName = 'test') {
    const requested = COMFY_DRAW_VIEWS.includes(viewName) ? viewName : 'test';
    const normalized = requested;
    querySettingsAll('[data-comfy-view]').forEach((button) => {
        button.classList.toggle('active', button.dataset.comfyView === normalized);
    });
    querySettingsAll('[data-comfy-view-panel]').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.comfyViewPanel === normalized);
    });
    if (normalized === 'gallery') {
        void renderGalleryManagement();
    }
    if (normalized === 'llm') {
        renderLastLlmRequestPreview();
    }
    if (normalized === 'prompts') {
        renderPromptChainPreview();
    }
}

function formatBytes(bytes = 0) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function renderGalleryManagement() {
    const container = getSettingsElement('comfy-gallery-container');
    const empty = getSettingsElement('comfy-gallery-empty');
    const countEl = getSettingsElement('comfy-gallery-count');
    const sizeEl = getSettingsElement('comfy-gallery-size');
    if (!container || !empty || !countEl || !sizeEl) return;

    container.textContent = '加载中...';
    empty.style.display = 'none';

    let summary = {};
    try {
        summary = await getGallerySummary();
    } catch (error) {
        console.warn('[ComfyDraw] getGallerySummary failed:', error);
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
            img.src = getPreviewDisplayUrl(latest);
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
        id: card.dataset.characterId || `comfy-char-${Date.now()}-${index}`,
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
    const list = querySettings('#comfy-shared-character-list');
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
        desc.textContent = '点击左侧"添加角色"，开始建立你的共享角色标签库';
        empty.append(icon, title, desc);
        list.appendChild(empty);
        return;
    }

    tags.forEach((tag, index) => {
        const card = document.createElement('div');
        card.className = 'sd-char-card';
        card.dataset.characterId = String(tag.id || `comfy-char-${index + 1}`);

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
                return { name: matched.shift().trim(), tags: matched.join('=').trim() };
            }
            return { name: '', tags: line };
        })
        .filter((outfit) => outfit.name || outfit.tags);
}

function updateSharedLlmProviderUI() {
    const provider = getValue('comfy-shared-llm-provider') || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    const sharedDrawSettings = getSharedDrawSettings();
    const isSt = provider === 'st';
    const modelCache = Array.isArray(sharedDrawSettings.llmApi?.modelCache) ? sharedDrawSettings.llmApi.modelCache : [];
    const hasCache = modelCache.length > 0;

    querySettings('#comfy-shared-llm-url-row')?.classList.toggle('hidden', isSt);
    querySettings('#comfy-shared-llm-key-row')?.classList.toggle('hidden', isSt);
    querySettings('#comfy-shared-llm-model-manual-row')?.classList.toggle('hidden', isSt || !providerConfig.needManualModel);
    querySettings('#comfy-shared-llm-model-select-row')?.classList.toggle('hidden', isSt || providerConfig.needManualModel || !hasCache);
    querySettings('#comfy-shared-llm-connect-row')?.classList.toggle('hidden', isSt || !providerConfig.canFetch);
}

function getCurrentSharedLlmModel() {
    const provider = getValue('comfy-shared-llm-provider') || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    if (providerConfig.needManualModel) return getValue('comfy-shared-llm-model-manual').trim();
    if (providerConfig.canFetch) return getValue('comfy-shared-llm-model-select').trim();
    return '';
}

function handleSharedLlmProviderChange() {
    const provider = getValue('comfy-shared-llm-provider') || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    const sharedDrawSettings = getSharedDrawSettings();
    const nextUrl = sharedDrawSettings.llmApi?.provider === provider
        ? (sharedDrawSettings.llmApi?.url || providerConfig.url || '')
        : (providerConfig.url || '');

    setValue('comfy-shared-llm-url', nextUrl);
    if (!providerConfig.canFetch) {
        sharedDrawSettings.llmApi = { ...(sharedDrawSettings.llmApi || {}), modelCache: [] };
    }
    fillSharedLlmModelFields();
    updateSharedLlmProviderUI();
}

function fillSharedLlmModelFields() {
    const sharedDrawSettings = getSharedDrawSettings();
    const llmApi = sharedDrawSettings.llmApi || {};
    const provider = getValue('comfy-shared-llm-provider') || llmApi.provider || 'st';
    const providerConfig = providerDefaults[provider] || providerDefaults.st;
    const modelCache = Array.isArray(llmApi.modelCache) ? llmApi.modelCache : [];
    populateSelect(
        'comfy-shared-llm-model-select',
        modelCache.map((item) => ({ value: item, label: item })),
        { value: llmApi.model || '', emptyLabel: '请先拉取模型列表' },
    );
    if (providerConfig.needManualModel) {
        setValue('comfy-shared-llm-model-manual', llmApi.model || '');
    } else if (providerConfig.canFetch) {
        setSelectValue('comfy-shared-llm-model-select', llmApi.model || '');
    }
}

async function fetchSharedLlmModels() {
    const provider = getValue('comfy-shared-llm-provider').trim() || 'st';
    const url = getValue('comfy-shared-llm-url').trim();
    const key = getValue('comfy-shared-llm-key').trim();
    const button = getSettingsElement('comfy-shared-llm-fetch');

    if (provider === 'st') {
        updateStatusText('comfy-shared-llm-fetch-status', 'error', '当前渠道无需拉取模型列表');
        return false;
    }

    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 连接中...';
    }
    updateStatusText('comfy-shared-llm-fetch-status', '', '正在连接并拉取模型列表...');

    try {
        const models = await fetchDrawLlmModels({ provider, url, key });

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
        updateStatusText('comfy-shared-llm-fetch-status', 'success', `已获取 ${models.length} 个模型`);
        return true;
    } catch (error) {
        updateStatusText('comfy-shared-llm-fetch-status', 'error', `连接失败：${error?.message || '请检查配置'}`);
        return false;
    } finally {
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fa-solid fa-plug"></i> 连接 / 拉取模型列表';
        }
    }
}

function renderFilterRuleRow(rule = { start: '', end: '' }) {
    const list = getSettingsElement('comfy-filter-rules-list');
    if (!list) return;
    const row = document.createElement('div');
    row.className = 'filter-rule-row';
    const start = document.createElement('input');
    start.type = 'text';
    start.placeholder = '起始标记';
    start.value = String(rule.start || '');
    start.dataset.comfyFilterField = 'start';
    const arrow = document.createElement('span');
    arrow.className = 'rule-arrow';
    arrow.textContent = '→';
    const end = document.createElement('input');
    end.type = 'text';
    end.placeholder = '结束标记';
    end.value = String(rule.end || '');
    end.dataset.comfyFilterField = 'end';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn-del-rule';
    del.textContent = '×';
    del.addEventListener('click', () => row.remove());
    row.append(start, arrow, end, del);
    list.appendChild(row);
}

function renderFilterRules(rules = []) {
    const list = getSettingsElement('comfy-filter-rules-list');
    if (!list) return;
    list.textContent = '';
    const normalized = Array.isArray(rules) && rules.length ? rules : DEFAULT_MESSAGE_FILTER_RULES;
    normalized.forEach((rule) => renderFilterRuleRow(rule));
}

function collectFilterRules() {
    return querySettingsAll('#comfy-filter-rules-list .filter-rule-row')
        .map((row) => ({
            start: String(row.querySelector('[data-comfy-filter-field="start"]')?.value || '').trim(),
            end: String(row.querySelector('[data-comfy-filter-field="end"]')?.value || '').trim(),
        }))
        .filter((rule) => rule.start || rule.end);
}

function parseWorldbookJson(jsonText, fileName) {
    const data = JSON.parse(jsonText);
    if (!data.entries || typeof data.entries !== 'object') {
        throw new Error('不是有效的世界书文件（缺少 entries 字段）');
    }
    const entries = [];
    for (const [uid, entry] of Object.entries(data.entries)) {
        if (!entry || typeof entry !== 'object') continue;
        const content = String(entry.content || '').trim();
        if (!content) continue;
        entries.push({
            uid: Number(uid),
            comment: String(entry.comment || ''),
            key: Array.isArray(entry.key) ? entry.key : (entry.key ? [entry.key] : []),
            keysecondary: Array.isArray(entry.keysecondary) ? entry.keysecondary : [],
            constant: entry.constant === true,
            disable: entry.disable === true,
            content,
            order: entry.order ?? 100,
        });
    }
    if (!entries.length) {
        throw new Error('世界书中无有效条目（所有条目缺少 content）');
    }
    return { name: fileName, uploadedAt: Date.now(), entries };
}

async function handleWorldbookFiles(files) {
    const sharedDrawSettings = getSharedDrawSettings();
    const worldbooks = sharedDrawSettings.worldbooks || {};
    const uploaded = Array.isArray(worldbooks.uploadedBooks) ? [...worldbooks.uploadedBooks] : [];
    const errors = [];
    let added = 0;

    for (const file of Array.from(files || [])) {
        if (!file.name.toLowerCase().endsWith('.json')) {
            errors.push(`${file.name}: 不是 .json 文件`);
            continue;
        }
        try {
            const book = parseWorldbookJson(await file.text(), file.name);
            const existingIndex = uploaded.findIndex((item) => item.name === book.name);
            if (existingIndex >= 0) uploaded[existingIndex] = book;
            else uploaded.push(book);
            added++;
        } catch (error) {
            errors.push(`${file.name}: ${error?.message || '解析失败'}`);
        }
    }

    sharedDrawSettings.worldbooks = { ...worldbooks, uploadedBooks: uploaded };
    renderUploadedBooks(uploaded);
    if (added > 0) {
        updateStatusText('comfy-shared-status', 'success', `已读取 ${added} 个世界书，请点击保存配置`);
        updateStatusText('comfy-worldbook-status', 'success', `已读取 ${added} 个世界书，请点击保存配置`);
    }
    if (errors.length) {
        const container = getSettingsElement('comfy-wb-entries');
        if (container) {
            const message = container.ownerDocument.createElement('p');
            message.className = 'form-hint';
            message.style.color = 'var(--danger)';
            message.textContent = errors.join('\n');
            container.replaceChildren(message);
        }
    }
}

function renderUploadedBooks(books = []) {
    const container = getSettingsElement('comfy-wb-uploaded-list');
    if (!container) return;
    const normalized = Array.isArray(books) ? books : [];
    if (!normalized.length) {
        const empty = container.ownerDocument.createElement('p');
        empty.className = 'form-hint';
        empty.textContent = '尚未上传世界书';
        container.replaceChildren(empty);
        const entries = getSettingsElement('comfy-wb-entries');
        if (entries) {
            const hint = entries.ownerDocument.createElement('p');
            hint.className = 'form-hint';
            hint.textContent = '请先上传世界书';
            entries.replaceChildren(hint);
        }
        return;
    }
    const doc = container.ownerDocument;
    const items = normalized.map((book, index) => {
        const entries = Array.isArray(book.entries) ? book.entries : [];
        const activeCount = entries.filter((entry) => !entry.disable).length;
        const item = doc.createElement('div');
        item.className = 'wb-book-item';
        item.dataset.index = String(index);
        const name = doc.createElement('span');
        name.className = 'wb-book-name';
        name.textContent = book.name || `世界书 ${index + 1}`;
        const count = doc.createElement('span');
        count.className = 'wb-book-count';
        count.textContent = `${activeCount}/${entries.length} 条目`;
        const del = doc.createElement('button');
        del.className = 'wb-book-delete';
        del.dataset.index = String(index);
        del.type = 'button';
        del.title = '移除';
        const icon = doc.createElement('i');
        icon.className = 'fa-solid fa-xmark';
        del.append(icon);
        item.append(name, count, del);
        return item;
    });
    container.replaceChildren(...items);

    container.querySelectorAll('.wb-book-item').forEach((item) => {
        item.addEventListener('click', (event) => {
            if (event.target.closest('.wb-book-delete')) return;
            const book = normalized[Number(item.dataset.index)];
            if (book) renderWorldbookEntries(book);
        });
    });
    container.querySelectorAll('.wb-book-delete').forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const sharedDrawSettings = getSharedDrawSettings();
            const worldbooks = sharedDrawSettings.worldbooks || {};
            const nextBooks = Array.isArray(worldbooks.uploadedBooks) ? [...worldbooks.uploadedBooks] : [];
            nextBooks.splice(Number(button.dataset.index), 1);
            sharedDrawSettings.worldbooks = { ...worldbooks, uploadedBooks: nextBooks };
            renderUploadedBooks(nextBooks);
            updateStatusText('comfy-shared-status', '', '已移除，请点击保存配置');
            updateStatusText('comfy-worldbook-status', '', '已移除，请点击保存配置');
        });
    });
}

function renderWorldbookEntries(book) {
    const container = getSettingsElement('comfy-wb-entries');
    if (!container) return;
    const entries = Array.isArray(book.entries) ? book.entries : [];
    if (!entries.length) {
        const empty = container.ownerDocument.createElement('p');
        empty.className = 'form-hint';
        empty.textContent = `${book.name || '世界书'}: 无条目`;
        container.replaceChildren(empty);
        return;
    }
    const doc = container.ownerDocument;
    const title = doc.createElement('p');
    title.className = 'form-hint';
    title.style.marginBottom = '8px';
    title.textContent = `${book.name || '世界书'} (${entries.length} 条)`;
    const entryItems = entries.map((entry) => {
            const state = entry.disable ? 'disabled' : (entry.constant ? 'constant' : 'normal');
            const label = entry.disable ? '已禁用' : (entry.constant ? '常驻' : '关键词触发');
            const keys = (entry.key || []).filter(Boolean).join(', ');
            const item = doc.createElement('div');
            item.className = 'wb-entry-item';
            const lamp = doc.createElement('div');
            lamp.className = `wb-lamp ${state}`;
            lamp.title = label;
            const info = doc.createElement('div');
            info.className = 'wb-entry-info';
            const entryTitle = doc.createElement('div');
            entryTitle.className = 'wb-entry-title';
            entryTitle.textContent = entry.comment || '(未命名)';
            info.append(entryTitle);
            if (keys) {
                const keyLine = doc.createElement('div');
                keyLine.className = 'wb-entry-keys';
                keyLine.textContent = `关键词: ${keys}`;
                info.append(keyLine);
            }
            const preview = doc.createElement('div');
            preview.className = 'wb-entry-preview';
            preview.textContent = String(entry.content || '').slice(0, 200);
            info.append(preview);
            item.append(lamp, info);
            return item;
        });
    container.replaceChildren(title, ...entryItems);
}

function bindWorldbookUploadEvents() {
    const dropzone = getSettingsElement('comfy-wb-dropzone');
    const fileInput = getSettingsElement('comfy-wb-file-input');
    if (!dropzone || !fileInput) return;
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropzone.classList.remove('dragover');
        if (event.dataTransfer?.files?.length) void handleWorldbookFiles(event.dataTransfer.files);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files?.length) void handleWorldbookFiles(fileInput.files);
        fileInput.value = '';
    });
}

function parseDanbooruCharName(tagName) {
    const match = String(tagName || '').match(/^(.+?)_\((.+)\)$/);
    if (match) {
        return { charName: match[1].replace(/_/g, ' '), series: match[2].replace(/_/g, ' ') };
    }
    return { charName: String(tagName || '').replace(/_/g, ' '), series: '' };
}

async function setComfyDanbooruLocalEnabled(enabled) {
    const checkbox = getSettingsElement('comfy-danbooru-local');
    const status = getSettingsElement('comfy-danbooru-local-status');
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
        console.warn('[ComfyDraw] Danbooru 本地库切换失败:', error);
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

async function ensureComfyDanbooruLoadedForForm(sharedDrawSettings = getSharedDrawSettings()) {
    const checkbox = getSettingsElement('comfy-danbooru-local');
    const status = getSettingsElement('comfy-danbooru-local-status');
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
        console.warn('[ComfyDraw] 预加载 Danbooru 本地库失败:', error);
        if (status) status.textContent = '加载失败';
    }
}

function showComfyDanbooruPanel(characterId = '') {
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
        renderComfyDanbooruResults(searchLocalDanbooru(query, 10), characterId, results);
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

function renderComfyDanbooruResults(results = [], characterId = '', container = null) {
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
            const p = querySettings(`.danbooru-panel[data-char-id="${CSS.escape(characterId)}"]`);
            if (p) { p.classList.add('hidden'); p.replaceChildren(); }
            refreshSettingsSummary();
            toastr.success('已填入 Danbooru 标签，请保存角色');
        });
        list.appendChild(item);
    });
    target.replaceChildren(list);
}

function fillSharedDrawForm() {
    const sharedDrawSettings = getSharedDrawSettings();
    setSelectValue('comfy-shared-llm-provider', sharedDrawSettings.llmApi?.provider || 'st');
    setValue('comfy-shared-llm-url', sharedDrawSettings.llmApi?.url || '');
    setValue('comfy-shared-llm-key', sharedDrawSettings.llmApi?.key || '');
    setChecked('comfy-shared-use-stream', sharedDrawSettings.useStream === true);
    setChecked('comfy-shared-use-worldinfo', sharedDrawSettings.useWorldInfo === true);
    setChecked('comfy-shared-disable-prefill', sharedDrawSettings.disablePrefill === true);
    setChecked('comfy-wb-enabled', sharedDrawSettings.worldbooks?.enabled === true);
    setSelectValue('comfy-wb-filter-mode', sharedDrawSettings.worldbooks?.keywordFilterMode || 'auto');
    renderUploadedBooks(sharedDrawSettings.worldbooks?.uploadedBooks || []);
    fillSharedLlmModelFields();
    updateSharedLlmProviderUI();
    renderFilterRules(sharedDrawSettings.messageFilterRules || []);
    renderCharacterTagList(sharedDrawSettings.characterTags || []);
    renderLastLlmRequestPreview();
    void ensureComfyDanbooruLoadedForForm(sharedDrawSettings);
}

async function saveSharedDrawSettings({ notify = false } = {}) {
    const llmApi = {
        provider: getValue('comfy-shared-llm-provider').trim() || 'st',
        url: getValue('comfy-shared-llm-url').trim(),
        key: getValue('comfy-shared-llm-key').trim(),
        model: getCurrentSharedLlmModel(),
    };
    const characterTags = getSharedCharacterTagsFromForm();
    return await updateSharedDrawSettingsPersistent((settings) => {
        settings.llmApi = { ...(settings.llmApi || {}), ...llmApi };
        settings.useStream = getChecked('comfy-shared-use-stream');
        settings.useWorldInfo = getChecked('comfy-shared-use-worldinfo');
        settings.disablePrefill = getChecked('comfy-shared-disable-prefill');
        settings.messageFilterRules = collectFilterRules();
        settings.characterTags = characterTags;
        settings.worldbooks = {
            ...(settings.worldbooks || {}),
            enabled: getChecked('comfy-wb-enabled'),
            uploadedBooks: getSharedDrawSettings().worldbooks?.uploadedBooks || [],
            keywordFilterMode: getValue('comfy-wb-filter-mode') || 'auto',
        };
    }, '共享规划设置已保存', { notify, silent: false });
}

async function saveAllSettings({ notify = false, triggerButton = null, statusElementId = '' } = {}) {
    const saveTask = async () => {
        const [comfyOk, sharedOk] = await Promise.all([
            persistSettings(readForm(), 'ComfyUI 设置已保存', { notify: false, silent: false }),
            saveSharedDrawSettings({ notify: false }),
        ]);
        return comfyOk && sharedOk;
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
        console.warn('[ComfyDraw] 保存操作失败:', error);
        ok = false;
    }

    if (ok) await runPostSaveHooks();
    if (statusElementId) {
        updateStatusText(
            statusElementId,
            ok ? 'success' : 'error',
            ok ? '已保存到小白X服务端配置' : '保存失败，请重试',
        );
    }

    if (ok && notify) {
        toastr.success('ComfyUI 与共享规划设置已保存');
    } else if (!ok && notify) {
        toastr.error('ComfyUI 或共享规划设置保存失败');
    }
    refreshSettingsSummary();
    return ok;
}

function addCharacterTagDraft() {
    const current = getSharedCharacterTagsFromForm();
    current.push({
        id: `comfy-char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: '', aliases: [], type: 'girl', appearance: '', negativeTags: '', danbooruTag: '', outfits: [],
    });
    renderCharacterTagList(current);
    refreshSettingsSummary();
}

function clearCharacterTagsDraft() {
    const current = getSharedCharacterTagsFromForm();
    if (!current.length) { toastr.warning('没有角色可清除'); return; }
    if (!confirm(`确定清空全部 ${current.length} 个角色？此操作不可撤销。`)) return;
    renderCharacterTagList([]);
    refreshSettingsSummary();
}

function exportSharedCharacterTags() {
    const current = getSharedCharacterTagsFromForm();
    if (!current.length) { toastr.warning('没有可导出的角色'); return; }
    const data = { type: 'novel-draw-characters', version: 3, characters: current };
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
                id: char.id || `comfy-char-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: char.name || '', aliases: Array.isArray(char.aliases) ? char.aliases : [],
                type: char.type || 'girl', appearance: char.appearance || char.tags || '',
                negativeTags: char.negativeTags || '', danbooruTag: char.danbooruTag || '',
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
    const draftCharacterCards = querySettingsAll('.sd-char-card').length;
    const characterCount = draftCharacterCards > 0
        ? draftCharacterCards
        : (querySettings('#comfy-shared-character-list .sd-char-empty')
            ? 0
            : (getSharedDrawSettings().characterTags?.length || 0));
    const presetEl = querySettings('#comfy-draw-summary-preset');
    const charSideEl = querySettings('#comfy-draw-summary-characters-side');
    const charResultEl = querySettings('#comfy-draw-character-result-count');
    if (presetEl) presetEl.textContent = activePreset?.name || '默认';
    if (charSideEl) charSideEl.textContent = String(characterCount);
    if (charResultEl) charResultEl.textContent = `${characterCount} / ${characterCount}`;
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

export async function openSettings() {
    await loadSettings();
    await loadSharedDrawSettings();
    const overlay = await createOverlay();
    fillForm(getSettings());
    switchSettingsView('test');
    syncOverlayHeight();
    overlay.style.display = 'block';
}

export function hideSettings() {
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
        toastr.warning('请先填写 ComfyUI 地址');
        return false;
    }

    abortPendingRequest();
    pendingController = new AbortController();

    try {
        await requestComfyTransport('ping', {}, {
            signal: pendingController.signal,
            timeoutMs: settings.timeout || 120000,
        });
        toastr.success('ComfyUI 连接成功');
        updateStatusText('comfy-draw-api-status', 'success', '连接成功');
        return true;
    } catch (error) {
        const message = error?.name === 'AbortError' || error?.message === '生成超时'
            ? '连接超时，请检查地址是否可访问'
            : (error?.message || '无法连接 ComfyUI');
        toastr.error(message, 'ComfyUI 连接失败');
        return false;
    } finally {
        pendingController = null;
    }
}

function composePrompt(prefix, promptText) {
    return joinTags(prefix || '', promptText || '');
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

function updateComfyOptionStatus(state, text) {
    updateStatusText('comfy-draw-api-status', state, text);
    updateStatusText('comfy-draw-workflow-status', state, text);
}

function renderLastLlmRequestPreview() {
    const preview = getSettingsElement('comfy-llm-request-preview');
    if (!preview) return;
    const snapshot = getLastDrawLlmRequestSnapshot();
    preview.textContent = snapshot
        ? JSON.stringify(snapshot, null, 2)
        : '暂无请求记录，请先触发一次画图分析。';
}

function renderPromptChainPreview(settings = getSettings()) {
    const container = getSettingsElement('comfy-prompt-chain');
    if (!container) return;

    const promptPreset = getActivePromptPreset(settings);
    const systemInput = getSettingsElement('comfy-prompt-system');
    const guideInput = getSettingsElement('comfy-prompt-guide');
    const formatInput = getSettingsElement('comfy-prompt-format');
    const formPromptPreset = {
        ...promptPreset,
        topSystem: systemInput ? systemInput.value : (promptPreset?.topSystem || ''),
        tagGuideContent: guideInput ? guideInput.value : (promptPreset?.tagGuideContent || ''),
        userJsonFormat: formatInput ? formatInput.value : (promptPreset?.userJsonFormat || ''),
    };
    const promptConfig = {
        ...COMFY_SCENE_PROMPTS,
        ...formPromptPreset,
        tagGuideContent: formPromptPreset.tagGuideContent || getLoadedTagGuide() || '',
    };
    const chain = getPromptChainPreview(promptConfig);
    const editableMap = {
        topSystem: 'comfy-prompt-system',
        tagGuideContent: 'comfy-prompt-guide',
        userJsonFormat: 'comfy-prompt-format',
    };

    container.replaceChildren();

    chain.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'chain-item';
        row.dataset.key = item.key;
        row.dataset.editableId = editableMap[item.key] || '';

        const role = document.createElement('span');
        role.className = `chain-role ${item.role}`;
        role.textContent = item.role;

        const summary = document.createElement('div');
        summary.className = 'chain-summary';

        const summaryText = document.createElement('div');
        summaryText.className = 'chain-summary-text';
        summaryText.textContent = `${index + 1}. ${item.summary || ''}`;
        if (item.label) {
            const label = document.createElement('span');
            label.className = 'chain-editable';
            label.textContent = ` [${item.label}]`;
            summaryText.appendChild(label);
        }
        if (item.editable) {
            const edit = document.createElement('span');
            edit.className = 'chain-editable';
            edit.title = '可在上方编辑';
            edit.textContent = ' ✏️';
            summaryText.appendChild(edit);
        }
        summary.appendChild(summaryText);

        if (Array.isArray(item.variables) && item.variables.length) {
            const vars = document.createElement('div');
            vars.className = 'chain-variables';
            item.variables.forEach((value) => {
                const span = document.createElement('span');
                span.textContent = `📎 ${value}`;
                vars.appendChild(span);
            });
            summary.appendChild(vars);
        }

        const preview = document.createElement('div');
        preview.className = 'chain-content-preview';
        summary.appendChild(preview);

        row.append(role, summary);
        row.addEventListener('click', () => {
            const editableId = row.dataset.editableId;
            if (editableId) {
                const target = getSettingsElement(editableId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.focus();
                    return;
                }
            }
            row.classList.toggle('expanded');
            let content = promptConfig[row.dataset.key] || '(内置模板，不可编辑)';
            if (row.dataset.key === 'assistantDoc') {
                content = String(content).replace('{$tagGuide}', promptConfig.tagGuideContent || '');
            }
            preview.textContent = content.length > 1200 ? `${content.slice(0, 1200)}\n...(已截断)` : content;
        });
        container.appendChild(row);
    });
}

async function withSaveTimeout(promise) {
    try {
        return await promise;
    } catch (error) {
        console.warn('[ComfyDraw] 保存操作失败:', error);
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
        console.warn('[ComfyDraw] 保存操作失败:', error);
        ok = false;
    }
    handleSaveResult(ok, button);
    if (statusElementId) updateStatusText(statusElementId, ok ? 'success' : 'error', ok ? successText : errorText);
    if (notify) {
        if (ok) toastr.success(successText, 'ComfyUI');
        else toastr.error(errorText, 'ComfyUI');
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
    return `comfy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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
    if (lastMessage.extra.xb_comfy_auto_done) return;
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
                fp.ensureComfyDrawPanel?.(messageEl, lastIdx, { force: true });
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

        lastMessage.extra.xb_comfy_auto_done = true;
    } catch (error) {
        console.error('[ComfyDraw] 自动配图失败:', error);
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
        return [{ scene: promptOverride.trim(), chars: [], characterPrompts: [], anchor: '' }];
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

    let planRaw;
    try {
        const preset = getActivePreset(getSettings());
        const promptPreset = getActivePromptPreset(getSettings()) || DEFAULT_PROMPT_CONFIG;
        planRaw = await generateScenePlan({
            messageText,
            presentCharacters,
            llmApi: sharedDrawSettings.llmApi,
            useStream: sharedDrawSettings.useStream,
            useWorldInfo: sharedDrawSettings.useWorldInfo,
            customPrompts: promptPreset,
            promptDefaults: DEFAULT_PROMPT_CONFIG,
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

    console.log('[ComfyDraw] LLM plan ready for message %s: %d task(s)', messageId, tasks.length);
    return tasks;
}

function buildPromptForTask(task, sharedDrawSettings, comfySettings, promptOverride = '', negativePromptOverride = '') {
    const characterPrompts = Array.isArray(task?.characterPrompts)
        ? task.characterPrompts.filter(Boolean)
        : assembleCharacterPrompts(task.chars || [], sharedDrawSettings.characterTags || [], {
            preserveDanbooruCanonical: true,
        });

    if (promptOverride.trim()) {
        return {
            positive: composePrompt(comfySettings.positivePrefix, promptOverride),
            negative: composePrompt(comfySettings.negativePrefix, negativePromptOverride),
            characterPrompts,
        };
    }

    const charPositive = characterPrompts.map(item => item.prompt).filter(Boolean).join(', ');
    const charNegative = characterPrompts.map(item => item.uc).filter(Boolean).join(', ');
    return {
        positive: joinTags(comfySettings.positivePrefix, task.scene, charPositive),
        negative: joinTags(comfySettings.negativePrefix, negativePromptOverride, charNegative),
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
    imgEl.src = getPreviewDisplayUrl(preview);
    container.dataset.imgId = preview.imgId;
    container.dataset.tags = String(preview.tags || '');
    container.dataset.positive = String(preview.positive || '');
    container.dataset.currentIndex = String(currentIndex);
    container.dataset.historyCount = String(historyCount);
    setImageState(container, preview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
    updateNavControls(container, currentIndex, historyCount);
}

async function getPreviewByImageId(container) {
    const imgId = container?.dataset?.imgId || '';
    if (!imgId) return null;
    try {
        return await getPreview(imgId);
    } catch {
        return null;
    }
}

function buildEditedPromptData(sceneTags, characterPrompts = [], params = getEffectiveParams(getSettings())) {
    const charPositive = (Array.isArray(characterPrompts) ? characterPrompts : [])
        .map(item => item?.prompt)
        .filter(Boolean)
        .join(', ');
    const charNegative = (Array.isArray(characterPrompts) ? characterPrompts : [])
        .map(item => item?.uc)
        .filter(Boolean)
        .join(', ');
    return {
        positive: joinTags(params.positivePrefix || '', sceneTags, charPositive),
        negative: joinTags(params.negativePrefix || '', charNegative),
    };
}

function appendEditGroup(container, { label, value, type, index = null }) {
    const group = document.createElement('div');
    group.className = 'xb-nd-edit-group';

    const labelEl = document.createElement('div');
    labelEl.className = 'xb-nd-edit-group-label';
    labelEl.textContent = label;
    group.appendChild(labelEl);

    const textarea = document.createElement('textarea');
    textarea.className = 'xb-nd-edit-input';
    textarea.dataset.type = type;
    if (index !== null) textarea.dataset.index = String(index);
    textarea.value = value || '';
    group.appendChild(textarea);

    container.appendChild(group);
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
            if (cont) syncContainerToPreview(cont, selected, historyCount, 0);
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
                // eslint-disable-next-line no-unsanitized/property
                cont.outerHTML = buildFailedPlaceholderHtml({
                    slotId: sid, messageId: msgId,
                    tags: lastImageInfo.tags || '', positive: lastImageInfo.positive || '',
                    errorType: '图片已删除', errorMessage: '点击重试可重新生成',
                });
            }
            await storeFailedPlaceholder({
                slotId: sid, messageId: msgId,
                tags: lastImageInfo.tags || '', positive: lastImageInfo.positive || '',
                errorType: 'deleted', errorMessage: '图片已删除，点击重试可重新生成',
            }).catch(() => {});
            if (getSettingsElement('comfy-gallery-container')) {
                await renderGalleryManagement();
            }
        },
    };
}

function messageHasImagePlaceholders(message) {
    return /\[image\s*:\s*[a-z0-9\-_]+\]/i.test(String(message?.mes || ''));
}

function initMessageObserver() {
    if (messageObserver) return;
    messageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const mesEl = entry.target;
            messageObserver.unobserve(mesEl);
            mesEl.removeAttribute('data-xb-comfy-lazy-observed');
            const messageId = Number(mesEl.getAttribute('mesid'));
            if (Number.isFinite(messageId)) void renderPreviewsForMessage(messageId);
        });
    }, { rootMargin: '600px 0px', threshold: 0.01 });
}

function observeMessageForLazyRender(messageId) {
    const mesEl = document.querySelector(`.mes[mesid="${messageId}"]`);
    if (!mesEl || mesEl.dataset.xbComfyLazyObserved === '1') return;
    initMessageObserver();
    mesEl.dataset.xbComfyLazyObserved = '1';
    messageObserver.observe(mesEl);
}

function isMessageNearViewport(mesEl) {
    if (!mesEl) return false;
    const root = document.getElementById('chat');
    const rootRect = root?.getBoundingClientRect?.() || { top: 0, bottom: window.innerHeight || 0 };
    const rect = mesEl.getBoundingClientRect();
    return rect.bottom >= rootRect.top - 600 && rect.top <= rootRect.bottom + 600;
}

function renderPreviewNowOrObserve(messageId) {
    const mesEl = document.querySelector(`.mes[mesid="${messageId}"]`);
    if (isMessageNearViewport(mesEl)) {
        void renderPreviewsForMessage(messageId);
    } else {
        observeMessageForLazyRender(messageId);
    }
}

function cleanupMessageObserver() {
    messageObserver?.disconnect();
    messageObserver = null;
    document.querySelectorAll('[data-xb-comfy-lazy-observed="1"]').forEach(el => {
        el.removeAttribute('data-xb-comfy-lazy-observed');
    });
}

function refreshPanelsAndPreviewsLazily() {
    const ctx = getContext();
    const chat = ctx.chat || [];
    let rendered = 0;

    for (let messageId = chat.length - 1; messageId >= 0; messageId--) {
        const message = chat[messageId];
        if (!message || message.is_user) continue;
        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
        if (messageEl) ensureComfyDrawPanelRef?.(messageEl, messageId);
        if (!messageHasImagePlaceholders(message)) continue;
        if (rendered < INITIAL_RENDER_MESSAGE_LIMIT) {
            void renderPreviewsForMessage(messageId);
            rendered++;
        } else {
            observeMessageForLazyRender(messageId);
        }
    }
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

    if (action === 'retry-image') { await retryFailedImage(container); return; }
    if (action === 'edit-tags') { container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open'); toggleEditPanel(container, true); return; }
    if (action === 'cancel-edit') { toggleEditPanel(container, false); return; }
    if (action === 'save-tags') { await saveEditedTags(container); return; }
    if (action === 'save-tags-retry') { await saveTagsAndRetry(container); return; }
    if (action === 'save-image') { container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open'); await saveCurrentImage(container); return; }
    if (action === 'remove-placeholder') { await removePlaceholder(container); }
}

async function toggleEditPanel(container, show) {
    const editPanel = container.querySelector('.xb-nd-edit');
    const btnsPanel = container.querySelector('.xb-nd-btns') || container.querySelector('.xb-nd-failed-btns');

    if (!editPanel) return;

    const origLabel = Array.from(editPanel.children).find(el =>
        el.tagName === 'DIV' && el.textContent.includes('编辑 TAG')
    );
    const origTextarea = Array.from(editPanel.children).find(el =>
        el.tagName === 'TEXTAREA' && !el.dataset.type
    );

    if (show) {
        const currentTags = container.dataset.tags || '';
        const preview = await getPreviewByImageId(container);

        if (origLabel) origLabel.style.display = 'none';
        if (origTextarea) origTextarea.style.display = 'none';

        let scrollWrap = editPanel.querySelector('.xb-nd-edit-scroll');
        if (!scrollWrap) {
            scrollWrap = document.createElement('div');
            scrollWrap.className = 'xb-nd-edit-scroll';
            editPanel.insertBefore(scrollWrap, editPanel.firstChild);
        }

        scrollWrap.replaceChildren();
        appendEditGroup(scrollWrap, { label: '场景', value: currentTags, type: 'scene' });

        if (preview?.characterPrompts?.length > 0) {
            preview.characterPrompts.forEach((char, i) => {
                const name = char.name || `角色 ${i + 1}`;
                appendEditGroup(scrollWrap, { label: name, value: char.prompt || '', type: 'char', index: i });
            });
        }

        editPanel.style.display = 'block';

        if (btnsPanel) {
            btnsPanel.style.opacity = '0.3';
            btnsPanel.style.pointerEvents = 'none';
        }

        scrollWrap.querySelector('[data-type="scene"]')?.focus();

    } else {
        const scrollWrap = editPanel.querySelector('.xb-nd-edit-scroll');
        if (scrollWrap) scrollWrap.remove();

        if (origLabel) origLabel.style.display = '';
        if (origTextarea) {
            origTextarea.style.display = '';
            origTextarea.value = container.dataset.tags || '';
        }

        editPanel.style.display = 'none';
        if (btnsPanel) {
            btnsPanel.style.opacity = '';
            btnsPanel.style.pointerEvents = '';
        }
    }
}

async function saveEditedTags(container) {
    const imgId = container.dataset.imgId;
    const editPanel = container.querySelector('.xb-nd-edit');

    if (!editPanel) return;

    const sceneInput = editPanel.querySelector('textarea[data-type="scene"]');
    if (!sceneInput) return;

    const newSceneTags = sceneInput.value.trim();
    if (!newSceneTags) {
        toastr.warning('场景 TAG 不能为空');
        return;
    }

    const originalPreview = await getPreviewByImageId(container);

    const charInputs = editPanel.querySelectorAll('textarea[data-type="char"]');
    let newCharPrompts = null;

    if (charInputs.length > 0 && originalPreview?.characterPrompts?.length > 0) {
        newCharPrompts = [];
        charInputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            if (originalPreview.characterPrompts[index]) {
                newCharPrompts.push({ ...originalPreview.characterPrompts[index], prompt: input.value.trim() });
            }
        });
    }

    const promptData = buildEditedPromptData(newSceneTags, newCharPrompts || originalPreview?.characterPrompts || []);
    container.dataset.tags = newSceneTags;
    container.dataset.positive = promptData.positive || newSceneTags;

    if (imgId && originalPreview) {
        try {
            await storePreview({
                ...originalPreview,
                characterPrompts: newCharPrompts || originalPreview.characterPrompts,
                tags: newSceneTags,
                positive: promptData.positive || newSceneTags,
                negativePrompt: promptData.negative || originalPreview.negativePrompt || '',
            });
        } catch (e) {
            console.error('[Comfy-Draw] 保存角色编辑失败:', e);
        }
    }

    toggleEditPanel(container, false);
    const charCount = newCharPrompts?.length || 0;
    toastr.success(`TAG 已保存 (场景${charCount > 0 ? ` + ${charCount} 个角色` : ''})`);
}

async function refreshSingleImage(container) {
    const slotId = container.dataset.slotId;
    const messageId = Number(container.dataset.mesid);
    const preview = await getPreviewByImageId(container);
    const sceneTags = container.dataset.tags || preview?.tags || '';
    const promptData = buildEditedPromptData(sceneTags, preview?.characterPrompts || []);
    const prompt = promptData.positive || container.dataset.positive || sceneTags;
    if (!slotId || !prompt) return;

    try {
        container.classList.add('busy');
        setImageState(container, ImageState.REFRESHING);
        const settings = getSettings();
        const params = getEffectiveParams(settings);
        const base64 = await generateComfyImageQueued({
            prompt,
            negativePrompt: promptData.negative || preview?.negativePrompt || params.negativePrefix || '',
            params,
        });
        const imgId = generateImgId();
        await storePreview({
            imgId, slotId, messageId, base64,
            tags: container.dataset.tags || prompt, positive: prompt,
            characterPrompts: preview?.characterPrompts || [],
            negativePrompt: promptData.negative || preview?.negativePrompt || params.negativePrefix || '', anchor: '',
        });
        await setSlotSelection(slotId, imgId);
        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
        const html = buildImageHtml({
            slotId, imgId, url: getPreviewDisplayUrl({ imgId, base64 }),
            tags: container.dataset.tags || prompt, positive: prompt,
            messageId, historyCount: Math.max(1, successPreviews.length), currentIndex: 0,
        });
        const node = createNodeFromHtml(html);
        if (node) container.replaceWith(node);
        toastr.success('已重绘');
    } catch (error) {
        setImageState(container, ImageState.PREVIEW);
        toastr.error(error?.message || '重绘失败', 'ComfyUI');
    } finally {
        container.classList.remove('busy');
    }
}

async function retryFailedImage(container) {
    const slotId = container.dataset.slotId;
    const messageId = Number(container.dataset.mesid);
    const tags = String(container.dataset.tags || '').trim();
    if (!slotId) return;

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

        const base64 = await generateComfyImageQueued({ prompt: positive, negativePrompt: negative, params });
        const imgId = generateImgId();
        await storePreview({
            imgId, slotId, messageId, base64, tags, positive,
            characterPrompts: latestFailed?.characterPrompts || [],
            negativePrompt: negative, anchor: latestFailed?.anchor || '',
        });
        await deleteFailedRecordsForSlot(slotId);
        await setSlotSelection(slotId, imgId);

        // eslint-disable-next-line no-unsanitized/property
        container.outerHTML = buildImageHtml({
            slotId, imgId, url: getPreviewDisplayUrl({ imgId, base64 }),
            tags, positive, messageId, state: ImageState.PREVIEW, historyCount: 1, currentIndex: 0,
        });
        toastr.success('图片生成成功');
    } catch (error) {
        const classified = classifyError(error) || ErrorType.UNKNOWN;
        await storeFailedPlaceholder({
            slotId, messageId, tags,
            positive: String(container.dataset.positive || ''),
            errorType: classified.code, errorMessage: classified.desc,
            characterPrompts: latestFailed?.characterPrompts || [],
            negativePrompt: latestFailed?.negativePrompt || '',
            anchor: latestFailed?.anchor || '',
        }).catch(() => {});

        // eslint-disable-next-line no-unsanitized/property
        container.outerHTML = buildFailedPlaceholderHtml({
            slotId, messageId, tags,
            positive: String(container.dataset.positive || ''),
            errorType: classified.label, errorMessage: classified.desc,
        });
        toastr.error(classified.desc || '重试失败', 'ComfyUI');
    }
}

async function saveTagsAndRetry(container) {
    const input = container.querySelector('.xb-nd-edit-input');
    if (!input) return;
    const nextTags = input.value.trim();
    if (!nextTags) { alert('TAG 不能为空'); return; }
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
    if (imgId) { try { await deletePreview(imgId); } catch {} }
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
        if (preview.savedUrl) { toastr.info('这张图已经保存到服务器'); return; }
        const ctx = getContext();
        const charName = ctx.groupId
            ? String(ctx.groups?.[ctx.groupId]?.id ?? 'group')
            : String(ctx.characters?.[ctx.characterId]?.name || 'character');
        const url = await saveBase64AsFile(preview.base64, charName, `comfy_${imgId}`, 'png');
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
            message, messageId: resolvedMessageId, signal, promptOverride, negativePromptOverride,
        });
        if (signal.aborted) throw new Error('已取消');

        const comfySettings = getSettings();
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
            const params = getEffectiveParams(comfySettings, paramsOverride);
            const promptData = buildPromptForTask(task, sharedDrawSettings, {
                positivePrefix: params.positivePrefix,
                negativePrefix: params.negativePrefix,
            }, promptOverride, negativePromptOverride);
            let position = findAnchorPosition(message.mes, task.anchor);

            onStateChange?.('progress', { current: i + 1, total: tasks.length });

            let incrementalHtml = '';
            try {
                const base64 = await generateComfyImageQueued({
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
                            onStateChange?.('cooldown', { duration: queueData.duration, nextIndex: i + 2, total: tasks.length });
                        }
                    },
                    cooldownMs: i < tasks.length - 1 ? FIXED_COMFY_REQUEST_DELAY_MS : 0,
                });
                await storePreview({
                    imgId, slotId, messageId: resolvedMessageId, base64,
                    tags: task.scene || promptOverride, positive: promptData.positive,
                    characterPrompts: promptData.characterPrompts,
                    negativePrompt: promptData.negative, anchor: task.anchor || '',
                });
                await setSlotSelection(slotId, imgId);
                successCount++;
                results.push({ slotId, imgId, success: true });
                incrementalHtml = buildImageHtml({
                    slotId, imgId, url: getPreviewDisplayUrl({ imgId, base64 }),
                    tags: task.scene || promptOverride, positive: promptData.positive,
                    messageId: resolvedMessageId, state: ImageState.PREVIEW, historyCount: 1, currentIndex: 0,
                });
            } catch (error) {
                if (signal.aborted) break;
                const errorType = classifyError(error) || ErrorType.UNKNOWN;
                await storeFailedPlaceholder({
                    slotId, messageId: resolvedMessageId,
                    tags: task.scene || promptOverride, positive: promptData.positive,
                    errorType: errorType.code, errorMessage: errorType.desc,
                    characterPrompts: promptData.characterPrompts,
                    negativePrompt: promptData.negative, anchor: task.anchor || '',
                });
                results.push({ slotId, success: false, error: errorType });
                incrementalHtml = buildFailedPlaceholderHtml({
                    slotId, messageId: resolvedMessageId,
                    tags: task.scene || promptOverride, positive: promptData.positive,
                    errorType: errorType.label, errorMessage: errorType.desc,
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
                messageId: resolvedMessageId, slotId, html: incrementalHtml, anchor: task.anchor || '',
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
    const prompt = getValue('comfy-draw-test-prompt').trim();
    if (!prompt) {
        toastr.warning('请先填写测试生成 Prompt');
        return false;
    }

    const resultEl = getSettingsElement('comfy-draw-test-result');
    if (resultEl) resultEl.textContent = '生成中...';

    abortPendingRequest();
    pendingController = new AbortController();

    try {
        const settings = getSettings();
        const effective = getEffectiveParams(settings);
        const base64 = await generateComfyImageQueued({
            prompt: composePrompt(effective.positivePrefix, prompt),
            negativePrompt: composePrompt(effective.negativePrefix, getValue('comfy-draw-test-negative')),
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
        toastr.error(error?.message || '生成失败', 'ComfyUI');
        return false;
    } finally {
        pendingController = null;
    }
}

export async function initComfyDraw() {
    if (moduleInitialized) return;
    moduleInitialized = true;
    await loadPromptTemplates();
    await loadTagGuide();
    await loadSettings();
    ensureDrawImageStyles();
    setupImageDelegation();
    await openDB().catch(() => {});

    const floatingPanel = await import('./floating-panel.js');
    ensureComfyDrawPanelRef = floatingPanel.ensureComfyDrawPanel;
    destroyComfyDrawPanelsRef = floatingPanel.destroyComfyDrawPanels;
    floatingPanel.initFloatingPanel?.();

    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
        if (messageId === undefined) return;
        const ctx = getContext();
        const message = ctx.chat?.[messageId];
        if (!message || message.is_user) return;
        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
        if (messageEl) ensureComfyDrawPanelRef?.(messageEl, Number(messageId));
        if (messageHasImagePlaceholders(message)) renderPreviewNowOrObserve(Number(messageId));
    });

    events.on(event_types.CHAT_CHANGED, () => {
        setTimeout(() => {
            cleanupMessageObserver();
            refreshPanelsAndPreviewsLazily();
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
            console.error('[ComfyDraw]', error);
        }
    });
    events.on(event_types.GENERATION_STOPPED, () => {
        abortGeneration();
    });

    setTimeout(() => {
        refreshPanelsAndPreviewsLazily();
    }, 300);

    window.xiaobaixComfyDraw = {
        openSettings,
        getSettings,
        testConnection,
        generateComfyImage,
        generateAndInsertImages,
        getEffectiveParams,
        abortGeneration,
        isEnabled: () => moduleInitialized,
    };

    window.registerModuleCleanup?.(MODULE_KEY, cleanupComfyDraw);
    console.log('[ComfyDraw] 模块已初始化');
}

export function cleanupComfyDraw() {
    if (!moduleInitialized && !overlayElement) return;
    moduleInitialized = false;
    events.cleanup();
    cleanupImageDelegation();
    cleanupMessageObserver();
    abortPendingRequest();
    abortGeneration();
    hideSettings();
    destroyComfyDrawPanelsRef?.();
    ensureComfyDrawPanelRef = null;
    destroyComfyDrawPanelsRef = null;
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
    delete window.xiaobaixComfyDraw;
    console.log('[ComfyDraw] 模块已清理');
}

export { classifyError, findLastAIMessageId, fetchComfyModels, fetchComfySamplers };
