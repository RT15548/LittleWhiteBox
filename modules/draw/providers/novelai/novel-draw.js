// novel-draw.js

// ═══════════════════════════════════════════════════════════════════════════
// 导入
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../../../utils.js";
import { getRequestHeaders, syncMesToSwipe } from "../../../../../../../../script.js";
import { extensionFolderPath } from "../../../../core/constants.js";
import { createModuleEvents, event_types } from "../../../../core/event-manager.js";
import { NovelDrawStorage } from "../../../../core/server-storage.js";
import { initAfterAiGate, notifyAfterAiHint, registerAfterAiHandler } from "../../../../core/after-ai-gate.js";
import {
    openDB, storePreview, getPreview, getPreviewsBySlot,
    getDisplayPreviewForSlot, storeFailedPlaceholder, deleteFailedRecordsForSlot,
    setSlotSelection, clearSlotSelection,
    updatePreviewSavedUrl, deletePreview, getCacheStats, clearExpiredCache, clearAllCache,
    getGallerySummary, getCharacterPreviews, openGallery, closeGallery, destroyGalleryCache,
    getPreviewDisplayUrl, getBase64ImagePayload, preloadPreviewDisplayUrl, warmSlotPreviewNeighbors
} from '../../shared/gallery-cache.js';
import {
    ScenePlannerError,
    generateAndParseScenePlan,
    prepareScenePlannerInput,
} from '../../shared/scene-planner.js';
import { classifyScenePlannerErrorForUi } from '../../shared/scene-planner-error-ui.js';
import {
    loadSharedDrawSettings,
    getSharedDrawSettings,
    updateSharedDrawSettingsPersistent,
    normalizeSharedCacheDays,
    mergeNovelDrawProviderSettingsIntoStorageRoot,
} from '../../shared/draw-settings.js';
import { getLastDrawAgentDiagnostic } from '../../shared/draw-agent.js';
import { attachDrawAgentSettingsSurface } from '../../shared/agent-settings-surface.js';
import { createSerialImageRequestQueue } from '../../shared/serial-image-request-queue.js';
import { isCharacterEnabled } from '../../shared/character-selection.js';
import {
    buildKnownCharacterPrompt,
    joinTags,
} from '../../shared/character-prompts.js';
import { resolveAutoLearnCharacter } from './novel-character-learning.js';
import {
    NovelImageResponseError,
    extractImageFromResponse,
    formatImageBase64,
    readImageResponse,
} from './novel-image-response.js';
import {
    buildNovelAIConnectionProbe,
    isNovelImageBackendJobEnabled,
    resolveNovelImageTransport,
    resolveNovelAIBackendImageApi,
    snapshotNovelRequestConfig,
} from './novel-request-config.js';
import {
    loadTagGuide,
    loadPromptTemplates,
    DEFAULT_PROMPT_CONFIG,
    PROMPT_TEMPLATE_VERSION,
    getDefaultNovelModelContractByGuideId,
    getEffectiveNovelModelGuide,
    getEffectiveNovelModelContract,
    getLoadedTagGuideById,
    normalizeNovelModelContractOverrides,
    normalizeNovelPromptGuideOverrides,
} from './novel-prompts.js';
import { parseNovelPromptPresetImport } from './novel-prompt-import.js';
import {
    getNovelModelCapability,
    getNovelModelCapabilitiesForUi,
    isNovelV5Model,
    NOVEL_PROMPT_GUIDES,
} from './novel-model-capabilities.js';
import {
    NovelV5RequestError,
    V5_QUALITY_IDS,
    V5_UC_IDS,
} from './novel-v5-request.js';
import {
    compile as compileNovelScenePlan,
    compileNovelImageRequest,
} from './compiler.js';
import {
    readNovelV5ErrorText,
    readNovelV5FinalImage,
    NovelV5StreamError,
} from './novel-v5-stream.js';
import {
    createImageBackendJobMonitorRegistry,
    createImageBackendJobsClient,
    hasImageBackendJobsCapability,
    ImageBackendJobsError,
    reportImageBackendJobState,
} from '../../shared/backend-image-jobs.js';
import {
    classifyImageJobDeliveryTarget,
    commitImageJobDeliverySlotRemoval,
    ImageJobDeliveryTargetState,
    requireImageJobDeliveryTarget,
} from '../../shared/image-job-delivery-target.js';
import { submitRecoverableImageJob } from '../../shared/recoverable-image-jobs.js';
import {
    isDrawRunCancelledError,
    isDrawRunPendingError,
    submitProviderDrawRun,
} from '../../shared/draw-run-production.js';
import {
    cancelPendingDrawRuns,
    hasPendingDrawRun,
} from '../../shared/draw-run-controls.js';
import { migrateLegacyNovelPromptSettings } from './novel-prompt-migration.js';
import { WorldbookProcessor } from '../../shared/worldbook-processor.js';
import {
    openCloudPresetsModal,
    downloadPresetAsFile,
    parsePresetData,
    destroyCloudPresets
} from './cloud-presets.js';
import { postToIframe, isTrustedMessage } from "../../../../core/iframe-messaging.js";
import {
    loadLocalDanbooruDB, unloadLocalDanbooruDB,
    searchLocalDanbooru, isDanbooruDBLoaded,
} from '../../shared/danbooru-local-db.js';
import {
    clearDrawSavedEntry,
    syncDrawSavedFromPreview,
    syncDrawSavedAfterDeletion,
    startSharedDrawPreviewRuntime,
    stopSharedDrawPreviewRuntime,
    renderAllDrawPreviews,
    renderPreviewsForMessage as renderSharedPreviewsForMessage,
    buildPendingImageHtml,
    buildDrawSlotSelector,
    toScenePlannerProgress,
    isAnyMessageBeingEdited,
    isMessageBeingEdited,
    DEFAULT_MESSAGE_FILTER_RULES,
} from '../../shared/draw-common.js';
import { createSceneSource, normalizeMessageSceneSourceText } from '../../shared/scene-source.js';
import { createDrawImageSlotRegex, stripDrawImageSlots } from '../../shared/image-marker-syntax.js';
import {
    commitRecoverableScenePlacements,
    commitSceneSlotDelivery,
    commitSceneSlotReplacement,
    getSceneSlotIds,
    ScenePlacementError,
    assertSceneSourceUnchanged,
    commitSettledScenePlacements,
    insertScenePlacementsPreservingSlots,
    removeSceneSlotPlaceholders,
    setActiveMessageText,
} from '../../shared/scene-placement.js';
// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_KEY = 'novelDraw';
const DRAW_RUN_PROVIDER = 'novelai';
const SERVER_FILE_KEY = 'settings';
const HTML_PATH = `${extensionFolderPath}/modules/draw/providers/novelai/novel-draw.html`;
// 后端发送模式走 SillyTavern server plugin 转发（需安装 plugins/littlewhitebox-image-jobs 并开启 enableServerPlugins），
// 用于绕过浏览器 CORS / 自签证书限制。历史插件 littlewhitebox-nai 是独立 ID，这里不探测、不回退。
const NAI_BACKEND_BASE = '/api/plugins/littlewhitebox-image-jobs';
const NAI_BACKEND_GENERATE = `${NAI_BACKEND_BASE}/v1/generate-image`;
const NAI_BACKEND_GENERATE_V2 = `${NAI_BACKEND_BASE}/v2/generate-image`;
const NAI_BACKEND_GENERATE_STREAM = `${NAI_BACKEND_BASE}/v1/generate-image-stream`;
const NAI_BACKEND_TEST = `${NAI_BACKEND_BASE}/v1/test`;
const NAI_BACKEND_TEST_V2 = `${NAI_BACKEND_BASE}/v2/test`;
const NAI_BACKEND_STATUS = `${NAI_BACKEND_BASE}/status`;
const NAI_BACKEND_MIN_VERSION = '1.0.1';
const NAI_BACKEND_V5_MIN_VERSION = '1.2.0';
const NAI_BACKEND_STATUS_TIMEOUT = 5000;
const NAI_BACKEND_STATUS_ATTEMPTS = 2;
const NAI_BACKEND_STATUS_RETRY_DELAY_MS = 1000;
const CONFIG_VERSION = 8;

function isVersionAtLeast(version, minimum) {
    const parse = value => String(value || '').split('.').map(part => Number.parseInt(part, 10) || 0);
    const current = parse(version);
    const required = parse(minimum);
    for (let index = 0; index < Math.max(current.length, required.length); index++) {
        if ((current[index] || 0) !== (required[index] || 0)) {
            return (current[index] || 0) > (required[index] || 0);
        }
    }
    return true;
}

async function fetchBackendPluginStatus(signal) {
    if (signal?.aborted) {
        const error = new Error('The operation was aborted');
        error.name = 'AbortError';
        throw error;
    }
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    const timeoutId = setTimeout(() => controller.abort(), NAI_BACKEND_STATUS_TIMEOUT);
    signal?.addEventListener('abort', forwardAbort, { once: true });
    try {
        const res = await fetch(NAI_BACKEND_STATUS, {
            method: 'GET',
            headers: getRequestHeaders(),
            signal: controller.signal,
        });
        if (res.status === 404) return { ready: false, reason: 'not_installed' };
        if (!res.ok) return { ready: false, reason: `http_${res.status}` };
        const data = await res.json().catch(() => null);
        if (data && data.ok === true) {
            const version = String(data.version || '');
            if (!isVersionAtLeast(version, NAI_BACKEND_MIN_VERSION)) {
                return { ready: false, version, reason: 'outdated', minimumVersion: NAI_BACKEND_MIN_VERSION };
            }
            return {
                ready: true,
                version,
                capabilities: Array.isArray(data.capabilities) ? data.capabilities.map(String) : [],
            };
        }
        return { ready: false, reason: 'bad_response' };
    } catch (e) {
        if (signal?.aborted) throw e;
        return { ready: false, reason: 'unreachable' };
    } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', forwardAbort);
    }
}

// 探测后端 server plugin 是否已安装并就绪。短暂故障重试，调用方取消则立即退出。
function waitBeforeStatusRetry(signal, duration) {
    return new Promise((resolve) => {
        const finish = () => {
            clearTimeout(timer);
            signal?.removeEventListener('abort', finish);
            resolve();
        };
        const timer = setTimeout(finish, duration);
        signal?.addEventListener('abort', finish, { once: true });
        if (signal?.aborted) finish();
    });
}

async function checkBackendPluginStatus({ signal } = {}) {
    let status;
    for (let attempt = 0; attempt < NAI_BACKEND_STATUS_ATTEMPTS; attempt++) {
        if (attempt > 0) await waitBeforeStatusRetry(signal, NAI_BACKEND_STATUS_RETRY_DELAY_MS);
        status = await fetchBackendPluginStatus(signal);
        const transient = status.reason === 'unreachable' || /^http_5\d\d$/.test(status.reason);
        if (!transient) return status;
    }
    return status;
}

async function assertV5BackendCapability(signal) {
    const status = await checkBackendPluginStatus({ signal });
    if (!status.ready) {
        const reason = status.reason === 'not_installed'
            ? '未安装'
            : status.reason === 'outdated'
                ? `版本过旧（当前 v${status.version || '未知'}）`
                : '未就绪';
        throw new NovelDrawError(
            `NovelAI V5 后端插件${reason}，请安装当前 littlewhitebox-image-jobs（兼容后端最低 v${NAI_BACKEND_V5_MIN_VERSION}）`,
            ErrorType.NETWORK,
        );
    }
    if (!isVersionAtLeast(status.version, NAI_BACKEND_V5_MIN_VERSION)
        || !status.capabilities?.includes('v5-msgpack-stream')) {
        throw new NovelDrawError(
            `当前后端插件不支持 NovelAI V5 流协议，请安装当前 littlewhitebox-image-jobs（兼容后端最低 v${NAI_BACKEND_V5_MIN_VERSION}）`,
            ErrorType.NETWORK,
        );
    }
    return status;
}

const MAX_SEED = 0xFFFFFFFF;
const PLACEHOLDER_REGEX = createDrawImageSlotRegex();

const events = createModuleEvents(MODULE_KEY);

const ImageState = { PREVIEW: 'preview', SAVING: 'saving', SAVED: 'saved', REFRESHING: 'refreshing', FAILED: 'failed' };

const ErrorType = {
    INPUT: { code: 'input', label: '正文输入', desc: '正文没有可用的配图内容' },
    NETWORK: { code: 'network', label: '网络', desc: '连接超时或网络不稳定' },
    AUTH: { code: 'auth', label: '认证', desc: 'API Key 无效或过期' },
    QUOTA: { code: 'quota', label: '额度', desc: 'Anlas 点数不足' },
    BUSY: { code: 'busy', label: '繁忙', desc: '当前并发繁忙，请稍后重试' },
    PARSE: { code: 'parse', label: '解析失败', desc: 'LLM 输出未解析为图片任务' },
    LLM: { code: 'llm', label: 'LLM失败', desc: '场景分析失败' },
    LLM_EMPTY: { code: 'llm_empty', label: '空回', desc: 'LLM 未返回内容' },
    TIMEOUT: { code: 'timeout', label: '超时', desc: '请求超时' },
    AGENT_CONFIG: { code: 'agent_config', label: 'Agent 配置', desc: '共享 Agent 主预设不可用' },
    PROMPT_EXPANSION: { code: 'prompt_expansion', label: 'Prompt 展开', desc: 'Prompt 宏展开失败，请检查提示词中的变量宏' },
    TOOL_PROTOCOL: { code: 'tool_protocol', label: 'Tool 协议', desc: '模型没有按要求调用场景规划 Tool' },
    SCENE_SCHEMA: { code: 'scene_schema', label: '计划校验', desc: '模型提交的场景计划不符合契约' },
    PROVIDER: { code: 'provider', label: 'Provider', desc: '模型 Provider 请求失败' },
    REQUEST_CONFIG: { code: 'request_config', label: '生图参数', desc: 'NovelAI 请求参数无效' },
    SCENE_PLACEMENT: { code: 'scene_placement', label: '插图位置', desc: '正文位置已变化，未写入图片' },
    ABORTED: { code: 'aborted', label: '已取消', desc: '请求已取消' },
    UNKNOWN: { code: 'unknown', label: '错误', desc: '未知错误' },
    CACHE_LOST: { code: 'cache_lost', label: '缓存丢失', desc: '图片缓存已过期' },
};

const DEFAULT_PARAMS_PRESET = {
    id: '', name: '默认 (V4.5 Full)',
    positivePrefix: 'best quality, amazing quality, very aesthetic, absurdres,',
    negativePrefix: 'lowres, bad anatomy, bad hands, missing fingers, extra digits, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
    maxImages: 2,
    maxCharactersPerImage: 0,
    params: {
        model: 'nai-diffusion-4-5-full', sampler: 'k_euler_ancestral', scheduler: 'karras',
        steps: 28, scale: 6, width: 1216, height: 832, seed: -1,
        qualityToggle: true, autoSmea: false, ucPreset: 0, cfg_rescale: 0,
        variety_boost: false, sm: false, sm_dyn: false, decrisper: false,
    },
};

const DEFAULT_PARAMS_PRESET_2 = {
    id: '', name: '3D 风格 (V4.5 Full)',
    positivePrefix: '3::3D::artist :ningen_mame,:meion, artist:nixeu, year 2025, artist:cc_lin, artist:kuroida, artist:mame_(hyeon5117), artist:nihnfinite8, artist:laevan, 4k, 10::best quality, absurdres, very aesthetic, detailed, masterpiece::,',
    negativePrefix: 'easynegative, bad, bad anatomy, bad composition, bad feet, bad hands, blurry, cropped, deformed, digit, error, extra digit, extra limb, extra missing fingers, fewer digits, imperfect eyes, inaccurate eyes, inaccurate limb, jpeg artifacts, low quality, lowres, negative_hand, missing limbs, normal quality, painting by bad-artist, signature, skewed eyes, text, ugly, ugly body, unnatural body, unnatural face, username, watermark, worst quality, missing fingers',
    maxImages: 2,
    maxCharactersPerImage: 0,
    params: {
        model: 'nai-diffusion-4-5-full', sampler: 'k_euler_ancestral', scheduler: 'karras',
        steps: 28, scale: 6, width: 1216, height: 832, seed: -1,
        qualityToggle: true, autoSmea: false, ucPreset: 0, cfg_rescale: 0,
        variety_boost: false, sm: false, sm_dyn: false, decrisper: false,
    },
};

const DEFAULT_SETTINGS = {
    configVersion: CONFIG_VERSION,
    updatedAt: 0,
    mode: 'manual',
    apiKey: '',
    apiBaseUrl: '',
    sendMode: 'frontend',
    useImageBackendJobs: false,
    insecureTLS: false,
    selectedParamsPresetId: null,
    paramsPresets: [],
    requestDelay: { min: 15000, max: 30000 },
    timeout: 60000,
    useWorldInfo: false,    
    characterTags: [],
    autoLearnCharacters: false,
    autoLearnMode: 'new_only',
    overrideSize: 'default',
    showFloorButton: true,
    showFloatingButton: false,
    advancedMode: true,
    promptPresets: [],
    selectedPromptPresetId: null,
    worldbooks: { enabled: false, uploadedBooks: [], keywordFilterMode: 'auto' },
    danbooruLocalDB: false,
    messageFilterRules: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let autoBusy = false;
let overlayCreated = false;
let frameReady = false;
let jsZipLoaded = false;
let messagePackDecoderPromise = null;
let moduleInitialized = false;
let moduleLifecycleGeneration = 0;
let touchState = null;
let settingsCache = null;
let settingsLoaded = false;
let generationJobs = new Map();
const generationJobSignals = new WeakMap();
const backendJobMonitors = createImageBackendJobMonitorRegistry({ active: false });
const novelImageRequestQueue = createSerialImageRequestQueue({
    createAbortError: () => new NovelDrawError('已取消', ErrorType.ABORTED),
    getCooldownMs: () => getNovelImageRequestDelay(),
});
const imageBackendJobsClient = createImageBackendJobsClient({ getHeaders: getRequestHeaders });
let ensureNovelDrawPanelRef = null;
let overlayResizeHandler = null;
let afterAiGateDispose = null;
let agentSettingsSurface = null;

// ═══════════════════════════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════════════════════════

function ensureStyles() {
    if (document.getElementById('xiaobaix-novel-draw-style')) return;
    const style = document.createElement('style');
    style.id = 'xiaobaix-novel-draw-style';
    style.textContent = `
.xb-nd-img{margin:0.8em 0;text-align:center;position:relative;display:block;width:100%;border-radius:14px;padding:4px}
.xb-nd-img[data-state="preview"]{border:1px dashed rgba(255,152,0,0.35)}
.xb-nd-img[data-state="failed"]{border:1px dashed rgba(248,113,113,0.5);background:rgba(248,113,113,0.05);padding:20px}
.xb-nd-img[data-state="pending"]{border:1px dashed rgba(212,165,116,0.4);background:rgba(212,165,116,0.06);padding:18px;color:inherit}
.xb-nd-img.busy img{opacity:0.5}
.xb-nd-img-wrap{position:relative;overflow:hidden;border-radius:10px;touch-action:pan-y pinch-zoom}
.xb-nd-img img{width:auto;height:auto;max-width:100%;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);display:block;user-select:none;-webkit-user-drag:none;transition:transform 0.25s ease,opacity 0.2s ease}
.xb-nd-img img.sliding-left{animation:ndSlideOutLeft 0.25s ease forwards;will-change:transform,opacity}
.xb-nd-img img.sliding-right{animation:ndSlideOutRight 0.25s ease forwards;will-change:transform,opacity}
.xb-nd-img img.sliding-in-left{animation:ndSlideInLeft 0.25s ease forwards;will-change:transform,opacity}
.xb-nd-img img.sliding-in-right{animation:ndSlideInRight 0.25s ease forwards;will-change:transform,opacity}
@keyframes ndSlideOutLeft{from{transform:translateX(0);opacity:1}to{transform:translateX(-30%);opacity:0}}
@keyframes ndSlideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(30%);opacity:0}}
@keyframes ndSlideInLeft{from{transform:translateX(30%);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes ndSlideInRight{from{transform:translateX(-30%);opacity:0}to{transform:translateX(0);opacity:1}}
.xb-nd-nav-pill{position:absolute;bottom:10px;left:10px;display:inline-flex;align-items:center;gap:2px;background:rgba(0,0,0,0.75);border-radius:20px;padding:4px 6px;font-size:12px;color:rgba(255,255,255,0.9);font-weight:500;user-select:none;z-index:5;opacity:0.85;transition:opacity 0.2s}
.xb-nd-nav-pill:hover{opacity:1}
.xb-nd-nav-arrow{width:24px;height:24px;border:none;background:transparent;color:rgba(255,255,255,0.8);cursor:pointer;display:flex;align-items:center;justify-content:center;border-radius:50%;font-size:14px;transition:background 0.15s,color 0.15s;padding:0}
.xb-nd-nav-arrow:hover{background:rgba(255,255,255,0.15);color:#fff}
.xb-nd-nav-arrow:disabled{opacity:0.3;cursor:not-allowed}
.xb-nd-nav-text{min-width:36px;text-align:center;font-variant-numeric:tabular-nums;padding:0 2px}
@media(hover:none),(pointer:coarse){.xb-nd-nav-pill{opacity:0.9;padding:5px 8px}}
.xb-nd-menu-wrap{position:absolute;top:8px;right:8px;z-index:10}
.xb-nd-menu-wrap.busy{pointer-events:none;opacity:0.3}
.xb-nd-menu-trigger{width:32px;height:32px;border-radius:50%;border:none;background:rgba(0,0,0,0.75);color:rgba(255,255,255,0.85);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.15s;opacity:0.85}
.xb-nd-menu-trigger:hover{background:rgba(0,0,0,0.85);opacity:1}
.xb-nd-menu-wrap.open .xb-nd-menu-trigger{background:rgba(0,0,0,0.9);opacity:1}
.xb-nd-dropdown{position:absolute;top:calc(100% + 4px);right:0;background:rgba(20,20,24,0.98);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:4px;display:none;flex-direction:column;gap:2px;opacity:0;visibility:hidden;transform:translateY(-4px) scale(0.96);transform-origin:top right;transition:all 0.15s ease;box-shadow:0 8px 24px rgba(0,0,0,0.4);pointer-events:none}
.xb-nd-menu-wrap.open .xb-nd-dropdown{display:flex;opacity:1;visibility:visible;transform:translateY(0) scale(1);pointer-events:auto}
.xb-nd-dropdown button{width:32px;height:32px;border:none;background:transparent;color:rgba(255,255,255,0.85);cursor:pointer;font-size:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.15s;padding:0;margin:0}
.xb-nd-dropdown button:hover{background:rgba(255,255,255,0.15)}
.xb-nd-dropdown button[data-action="delete-image"]{color:rgba(248,113,113,0.9)}
.xb-nd-dropdown button[data-action="delete-image"]:hover{background:rgba(248,113,113,0.2)}
.xb-nd-indicator{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.85);padding:8px 16px;border-radius:8px;color:#fff;font-size:12px;z-index:10}
.xb-nd-edit{animation:nd-slide-up 0.2s ease-out}
.xb-nd-edit-input{width:100%;min-height:60px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;padding:8px;resize:vertical;font-family:monospace}
.xb-nd-failed-icon{color:rgba(248,113,113,0.9);font-size:24px;margin-bottom:8px}
.xb-nd-failed-title{color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:4px}
.xb-nd-failed-desc{color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:12px}
.xb-nd-failed-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.xb-nd-failed-btns button{padding:8px 16px;border-radius:8px;font-size:12px;cursor:pointer;transition:all 0.15s}
.xb-nd-retry-btn{border:1px solid rgba(212,165,116,0.5);background:rgba(212,165,116,0.2);color:#fff}
.xb-nd-retry-btn:hover{background:rgba(212,165,116,0.35)}
.xb-nd-edit-btn{border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:#fff}
.xb-nd-edit-btn:hover{background:rgba(255,255,255,0.2)}
.xb-nd-remove-btn{border:1px solid rgba(248,113,113,0.3);background:transparent;color:rgba(248,113,113,0.8)}
.xb-nd-remove-btn:hover{background:rgba(248,113,113,0.1)}
@keyframes nd-slide-up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeInOut{0%{opacity:0;transform:translateX(-50%) translateY(-10px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}85%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-10px)}}
#xiaobaix-novel-draw-overlay .nd-backdrop{position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7)}
#xiaobaix-novel-draw-overlay .nd-frame-wrap{position:absolute;z-index:1}
#xiaobaix-novel-draw-iframe{width:100%;height:100%;border:none;background:#0d1117}
@media(min-width:769px){#xiaobaix-novel-draw-overlay .nd-frame-wrap{top:12px;left:12px;right:12px;bottom:12px}#xiaobaix-novel-draw-iframe{border-radius:12px}}
@media(max-width:768px){#xiaobaix-novel-draw-overlay .nd-frame-wrap{top:0;left:0;right:0;bottom:0}#xiaobaix-novel-draw-iframe{border-radius:0}}
.xb-nd-edit-content{max-height:250px;overflow-y:auto;margin-bottom:8px}
.xb-nd-edit-content::-webkit-scrollbar{width:4px}
.xb-nd-edit-content::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.2);border-radius:2px}
.xb-nd-edit-group{margin-bottom:8px}
.xb-nd-edit-group:last-child{margin-bottom:0}
.xb-nd-edit-label{font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:4px;display:flex;align-items:center;gap:4px}
.xb-nd-edit-label .char-icon{font-size:8px;opacity:0.6}
.xb-nd-edit-input{width:100%;min-height:50px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;color:#fff;font-size:11px;padding:8px;resize:vertical;font-family:monospace;line-height:1.4}
.xb-nd-edit-input:focus{border-color:rgba(212,165,116,0.5);outline:none}
.xb-nd-edit-input.scene{border-color:rgba(212,165,116,0.3)}
.xb-nd-edit-input.char{border-color:rgba(147,197,253,0.3)}
`;
    document.head.appendChild(style);
}

function syncOverlayHeight() {
    const overlay = document.getElementById('xiaobaix-novel-draw-overlay');
    if (!overlay) return;
    overlay.style.height = `${window.innerHeight}px`;
    syncOverlayFrameLayout();
}

function syncOverlayFrameLayout() {
    const frameWrap = document.querySelector('#xiaobaix-novel-draw-overlay .nd-frame-wrap');
    if (!frameWrap) return;
    const inset = window.matchMedia?.('(max-width: 768px)')?.matches ? 0 : 12;
    frameWrap.style.top = `${inset}px`;
    frameWrap.style.left = `${inset}px`;
    frameWrap.style.right = `${inset}px`;
    frameWrap.style.bottom = `${inset}px`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function createPlaceholder(slotId) { return `[image:${slotId}]`; }

async function persistChatSilently() {
    const ctx = getContext();
    if (!ctx?.saveChat) return;
    await Promise.resolve(ctx.saveChat());
}

async function clearNovelDrawSavedEntry(messageId, slotId) {
    return clearDrawSavedEntry(messageId, slotId);
}

async function syncNovelDrawSavedFromPreview(messageId, preview, overrides = {}) {
    return syncDrawSavedFromPreview(messageId, preview, overrides);
}

async function syncNovelDrawSavedAfterDeletion(messageId, slotId, deletedImgId, remainingPreviews = []) {
    return syncDrawSavedAfterDeletion(messageId, slotId, deletedImgId, remainingPreviews);
}

function extractSlotIds(mes) {
    const ids = new Set();
    if (!mes) return ids;
    let match;
    const regex = new RegExp(PLACEHOLDER_REGEX.source, 'gi');
    while ((match = regex.exec(mes)) !== null) ids.add(match[1]);
    return ids;
}

function isModuleEnabled() { return moduleInitialized; }

function generateSlotId() { return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

function generateImgId() { return `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

function escapeHtml(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

function escapeRegexChars(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function getChatCharacterName() {
    const ctx = getContext();
    if (ctx.groupId) return String(ctx.groups?.[ctx.groupId]?.id ?? 'group');
    return String(ctx.characters?.[ctx.characterId]?.name || 'character');
}

function findLastAIMessageId() {
    const ctx = getContext();
    const chat = ctx.chat || [];
    let id = chat.length - 1;
    while (id >= 0 && chat[id]?.is_user) id--;
    return id;
}

function randomDelay(min, max) {
    const configuredMin = Number(min);
    const configuredMax = Number(max);
    const safeMin = Number.isFinite(configuredMin) && configuredMin > 0
        ? configuredMin
        : DEFAULT_SETTINGS.requestDelay.min;
    const safeMax = Number.isFinite(configuredMax) && configuredMax > 0
        ? configuredMax
        : DEFAULT_SETTINGS.requestDelay.max;
    const lower = Math.min(safeMin, safeMax);
    const upper = Math.max(safeMin, safeMax);
    return lower + Math.random() * (upper - lower);
}

function getNovelImageRequestDelay() {
    const requestDelay = getSettings().requestDelay;
    return randomDelay(requestDelay?.min, requestDelay?.max);
}

function showToast(message, type = 'success', duration = 2500) {
    const colors = { success: 'rgba(62,207,142,0.95)', error: 'rgba(248,113,113,0.95)', info: 'rgba(212,165,116,0.95)' };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${colors[type] || colors.info};color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:99999;animation:fadeInOut ${duration / 1000}s ease-in-out;max-width:80vw;text-align:center;word-break:break-all`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function getMesTextElement(messageId) {
    if (!Number.isFinite(messageId)) return null;
    return document.querySelector(`#chat .mes[mesid="${messageId}"] .mes_text`);
}

function createNodeFromHtml(html) {
    const template = document.createElement('template');
    // Template-only UI markup built locally.
    // eslint-disable-next-line no-unsanitized/property
    template.innerHTML = String(html || '').trim();
    return template.content.firstElementChild || null;
}

function getTrimmedText(value) {
    return String(value || '').replace(/\u200B/g, '').trim();
}

function findTopLevelFlowContainer(root, node) {
    let current = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current.parentElement && current.parentElement !== root) {
        current = current.parentElement;
    }
    return current && current.parentElement === root ? current : null;
}

function removeIfEmptyFlowContainer(container) {
    if (!(container instanceof HTMLElement)) return;
    if (!['P', 'DIV', 'BLOCKQUOTE', 'LI'].includes(container.tagName)) return;
    if (container.querySelector('img, video, audio, canvas, iframe, .xb-nd-img')) return;
    if (getTrimmedText(container.textContent).length > 0) return;
    container.remove();
}

function replacePlaceholdersInDomBatch(root, replacements) {
    if (!root || !Array.isArray(replacements) || replacements.length === 0) return new Set();

    const resolvedSlotIds = new Set();
    for (const item of replacements) {
        if (!item?.slotId || !item?.html) continue;
        const existing = root.querySelector(buildDrawSlotSelector(item.slotId));
        if (existing?.dataset?.state !== 'pending') continue;
        const replacement = createNodeFromHtml(item.html);
        if (!replacement) continue;
        existing.replaceWith(replacement);
        resolvedSlotIds.add(item.slotId);
    }
    const pending = replacements.filter(item =>
        item?.slotId &&
        item?.html &&
        !resolvedSlotIds.has(item.slotId) &&
        !root.querySelector(buildDrawSlotSelector(item.slotId))
    );
    if (pending.length === 0) return resolvedSlotIds;

    const placeholderMap = new Map(pending.map(item => [createPlaceholder(item.slotId), item]));
    const placeholderRegex = new RegExp(
        Array.from(placeholderMap.keys()).map(escapeRegexChars).join('|'),
        'g'
    );
    const nodePlans = new Map();
    const groupedByContainer = new Map();
    const orderedContainers = [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            return node.parentElement?.closest('.xb-nd-img')
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        }
    });

    let textNode;
    while ((textNode = walker.nextNode())) {
        const value = textNode.nodeValue || '';
        placeholderRegex.lastIndex = 0;
        let match;
        while ((match = placeholderRegex.exec(value))) {
            const placeholder = match[0];
            const patch = placeholderMap.get(placeholder);
            if (!patch || resolvedSlotIds.has(patch.slotId)) continue;

            const container = findTopLevelFlowContainer(root, textNode) || root;
            if (!groupedByContainer.has(container)) {
                groupedByContainer.set(container, []);
                orderedContainers.push(container);
            }
            groupedByContainer.get(container).push(patch);

            if (!nodePlans.has(textNode)) {
                nodePlans.set(textNode, { text: value, removals: [] });
            }
            nodePlans.get(textNode).removals.push({ start: match.index, end: match.index + placeholder.length });
            resolvedSlotIds.add(patch.slotId);
        }
    }

    nodePlans.forEach((plan, node) => {
        let nextText = plan.text;
        plan.removals
            .sort((a, b) => b.start - a.start)
            .forEach(removal => {
                nextText = nextText.slice(0, removal.start) + nextText.slice(removal.end);
            });

        if (nextText) node.nodeValue = nextText;
        else node.remove();
    });

    orderedContainers.forEach(container => {
        const patches = groupedByContainer.get(container) || [];
        let ref = container;
        patches.forEach(patch => {
            const node = createNodeFromHtml(patch.html);
            if (!node) return;

            if (container === root) {
                root.appendChild(node);
                ref = node;
                return;
            }

            ref.insertAdjacentElement('afterend', node);
            ref = node;
        });

        if (container !== root) removeIfEmptyFlowContainer(container);
    });

    return resolvedSlotIds;
}

function insertPreviewBatchIntoRenderedMessage({ messageId, patches }) {
    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl || !Array.isArray(patches) || patches.length === 0) return false;

    const insertedSlotIds = replacePlaceholdersInDomBatch(mesTextEl, patches);
    let inserted = insertedSlotIds.size > 0;

    patches.forEach(patch => {
        if (!patch?.slotId || !patch?.html || insertedSlotIds.has(patch.slotId)) return;
        if (mesTextEl.querySelector(buildDrawSlotSelector(patch.slotId))) {
            inserted = true;
        }
    });

    return inserted;
}

function insertPreviewIntoRenderedMessage({ messageId, slotId, html }) {
    return insertPreviewBatchIntoRenderedMessage({
        messageId,
        patches: [{ slotId, html }],
    });

}

// ═══════════════════════════════════════════════════════════════════════════
// 中止控制
// ═══════════════════════════════════════════════════════════════════════════

// 中止分两种，绝不能混为一谈：
// - reason 'user'：用户亲手停的（停止键、Escape、面板取消）。只有这一种才允许把取消
//   传导到后端，删掉一个已经付过钱的任务。
// - 其它 reason：模块卸载、聊天切换这类生命周期中止。前端必须停手，但后端任务要留着，
//   靠恢复记录在下次打开时接回——否则「重载一次扩展」就等于烧掉一批图。
function cancelPendingDrawRun(messageId) {
    // Draw Run 归属于当前 swipe。用户在任务期间切换图片 Provider 后，
    // 新 Provider 的按钮仍要能取消这一个既有任务。
    if (!hasPendingDrawRun(messageId)) return false;
    void cancelPendingDrawRuns(messageId).catch((error) => {
        console.error('[NovelDraw] 后台 Draw Run 取消失败:', error);
        toastr.error(error?.message || '后台画图取消失败，请稍后重试', '小白X画图');
    });
    return true;
}

function abortGeneration(messageId = null, { reason = 'user' } = {}) {
    if (messageId !== null && messageId !== undefined) {
        const job = generationJobs.get(String(messageId));
        let aborted = false;
        if (job) {
            job.abortReason ||= reason;
            if (reason === 'user') job.backendCancel.abort();
            job.controller.abort();
            aborted = true;
        }
        if (reason === 'user' && cancelPendingDrawRun(messageId)) aborted = true;
        return aborted;
    }

    let aborted = false;
    generationJobs.forEach((job) => {
        job.abortReason ||= reason;
        if (reason === 'user') job.backendCancel.abort();
        job.controller.abort();
        aborted = true;
    });
    return aborted;
}

function isGenerating(messageId = null) {
    if (messageId !== null && messageId !== undefined) {
        const job = generationJobs.get(String(messageId));
        return Boolean(job && job.chatId === String(getContext()?.chatId || ''));
    }
    return autoBusy || generationJobs.size > 0;
}

export function getGenerationPhase(messageId) {
    const job = generationJobs.get(String(messageId));
    if (!job || job.chatId !== String(getContext()?.chatId || '')) return null;
    return job.phase;
}

function hasGenerationJob(messageId) {
    return isGenerating(messageId);
}

function createGenerationJob(messageId) {
    const key = String(messageId);
    if (generationJobs.has(key)) {
        throw new NovelDrawError('该楼层已有任务进行中', ErrorType.UNKNOWN);
    }

    const job = {
        key,
        chatId: String(getContext()?.chatId || ''),
        phase: 'starting',
        messageId,
        controller: new AbortController(),
        backendCancel: new AbortController(),
        abortReason: null,
        createdAt: Date.now(),
    };
    generationJobs.set(key, job);
    generationJobSignals.set(job.controller.signal, job);
    return job;
}

function releaseGenerationJob(job) {
    if (job && generationJobs.get(job.key) === job) {
        generationJobs.delete(job.key);
    }
}

function enqueueImageRequest(run, options = {}) {
    return novelImageRequestQueue.enqueue(run, options);
}

// ═══════════════════════════════════════════════════════════════════════════
// 错误处理
// ═══════════════════════════════════════════════════════════════════════════

class NovelDrawError extends Error {
    constructor(message, errorType = ErrorType.UNKNOWN) {
        super(message);
        this.name = 'NovelDrawError';
        this.errorType = errorType;
    }
}

function classifyLlmError(e) {
    return classifyScenePlannerErrorForUi(e, ErrorType);
}

function classifyError(e) {
    if (e instanceof ScenePlannerError) return classifyLlmError(e);
    if (e instanceof ScenePlacementError) {
        return { ...ErrorType.SCENE_PLACEMENT, desc: e.message || ErrorType.SCENE_PLACEMENT.desc };
    }
    if (e instanceof NovelDrawError && e.errorType) {
        return { ...e.errorType, desc: e.message || e.errorType.desc };
    }
    const msg = (e?.message || '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) return ErrorType.NETWORK;
    if (msg.includes('401') || msg.includes('key') || msg.includes('auth')) return ErrorType.AUTH;
    if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('请求频繁') || msg.includes('busy')) return ErrorType.BUSY;
    if (msg.includes('402') || msg.includes('anlas') || msg.includes('quota')) return ErrorType.QUOTA;
    if (msg.includes('timeout') || msg.includes('abort')) return ErrorType.TIMEOUT;
    if (msg.includes('输出为空') || msg.includes('empty_output') || msg.includes('未返回内容')) return ErrorType.LLM_EMPTY;
    if (msg.includes('parse') || msg.includes('json')) return ErrorType.PARSE;
    if (msg.includes('无法解析') || msg.includes('未解析到图片任务')) return ErrorType.PARSE;
    if (msg.includes('llm') || msg.includes('xbgenraw')) return ErrorType.LLM;
    return { ...ErrorType.UNKNOWN, desc: e?.message || '未知错误' };
}

function parseApiError(status, text, fallbackType = ErrorType.UNKNOWN) {
    switch (status) {
        case 401: return new NovelDrawError('API Key 无效', ErrorType.AUTH);
        case 402: return new NovelDrawError('Anlas 不足', ErrorType.QUOTA);
        case 408:
        case 504: return new NovelDrawError('请求超时', ErrorType.TIMEOUT);
        case 429: return new NovelDrawError('当前并发繁忙，请稍后重试', ErrorType.BUSY);
        case 500:
        case 502:
        case 503: return new NovelDrawError('服务不可用', ErrorType.NETWORK);
        default: return new NovelDrawError(`失败: ${text || status}`, fallbackType);
    }
}

function handleFetchError(e) {
    if (e.name === 'AbortError') return new NovelDrawError('超时', ErrorType.TIMEOUT);
    if (e instanceof NovelV5RequestError) return new NovelDrawError(e.message, ErrorType.REQUEST_CONFIG);
    if (e instanceof NovelImageResponseError) return new NovelDrawError(e.message, ErrorType.PARSE);
    if (e instanceof NovelV5StreamError) {
        const type = e.code === 'V5_PROVIDER_ERROR'
            ? ErrorType.PROVIDER
            : e.code === 'V5_STREAM_READ_FAILED'
                ? ErrorType.NETWORK
                : ErrorType.PARSE;
        return new NovelDrawError(e.message, type);
    }
    if (e.message?.includes('Failed to fetch')) return new NovelDrawError('网络错误', ErrorType.NETWORK);
    if (e instanceof NovelDrawError) return e;
    return new NovelDrawError(e.message || '未知错误', ErrorType.UNKNOWN);
}

// ═══════════════════════════════════════════════════════════════════════════
// 设置管理
// ═══════════════════════════════════════════════════════════════════════════

function normalizeV5QualityPresetId(value, qualityToggle) {
    const id = String(value || '');
    if (V5_QUALITY_IDS.includes(id)) return id;
    return qualityToggle === false ? 'none' : 'standard';
}

function normalizeV5UcPresetId(value, legacyPreset) {
    const id = String(value || '');
    if (V5_UC_IDS.includes(id)) return id;
    return ({ 0: 'heavy', 1: 'light', 2: 'humanFocus', 3: 'none' })[Number(legacyPreset)] || 'heavy';
}

function normalizeParamsPreset(preset, index) {
    const source = preset && typeof preset === 'object' && !Array.isArray(preset) ? preset : {};
    const params = source.params && typeof source.params === 'object' && !Array.isArray(source.params)
        ? source.params
        : {};
    const qualityToggle = params.qualityToggle !== false;
    const ucPreset = [0, 1, 2, 3].includes(Number(params.ucPreset)) ? Number(params.ucPreset) : 0;
    const rawSeed = params.seed;
    const seed = rawSeed == null || String(rawSeed).trim() === '' ? -1 : Number(rawSeed);
    return {
        id: String(source.id || `params-${Date.now()}-${index}`),
        name: String(source.name || `配置-${index + 1}`),
        positivePrefix: String(source.positivePrefix || ''),
        negativePrefix: String(source.negativePrefix || ''),
        maxImages: source.maxImages == null
            ? 2
            : Math.max(0, Number(source.maxImages) || 0),
        maxCharactersPerImage: Math.max(0, Number(source.maxCharactersPerImage) || 0),
        params: {
            model: String(params.model || DEFAULT_PARAMS_PRESET.params.model).trim(),
            sampler: String(params.sampler || DEFAULT_PARAMS_PRESET.params.sampler),
            scheduler: String(params.scheduler || DEFAULT_PARAMS_PRESET.params.scheduler),
            steps: Number(params.steps) > 0 ? Number(params.steps) : DEFAULT_PARAMS_PRESET.params.steps,
            scale: Number.isFinite(Number(params.scale)) ? Number(params.scale) : DEFAULT_PARAMS_PRESET.params.scale,
            width: Number(params.width) > 0 ? Number(params.width) : DEFAULT_PARAMS_PRESET.params.width,
            height: Number(params.height) > 0 ? Number(params.height) : DEFAULT_PARAMS_PRESET.params.height,
            seed: Number.isFinite(seed) ? seed : -1,
            qualityToggle,
            autoSmea: params.autoSmea === true,
            ucPreset,
            cfg_rescale: Number.isFinite(Number(params.cfg_rescale)) ? Number(params.cfg_rescale) : 0,
            v5QualityPresetId: normalizeV5QualityPresetId(params.v5QualityPresetId, qualityToggle),
            v5UcPresetId: normalizeV5UcPresetId(params.v5UcPresetId, ucPreset),
            transparentBackground: params.transparentBackground === true,
            variety_boost: params.variety_boost === true,
            sm: params.sm === true,
            sm_dyn: params.sm_dyn === true,
            decrisper: params.decrisper === true,
        },
    };
}

function normalizeSettings(saved = {}) {
    const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    const rawWorldbooks = source.worldbooks && typeof source.worldbooks === 'object'
        && !Array.isArray(source.worldbooks)
        ? source.worldbooks
        : {};
    const rawDelay = source.requestDelay && typeof source.requestDelay === 'object'
        ? source.requestDelay
        : {};
    const merged = {
        configVersion: Number(source.configVersion) || 0,
        updatedAt: Number(source.updatedAt) || 0,
        mode: source.mode === 'auto' ? 'auto' : 'manual',
        apiKey: String(source.apiKey || ''),
        apiBaseUrl: String(source.apiBaseUrl || '').trim(),
        sendMode: source.sendMode === 'backend' ? 'backend' : 'frontend',
        useImageBackendJobs: source.useImageBackendJobs === true,
        insecureTLS: source.insecureTLS === true,
        selectedParamsPresetId: source.selectedParamsPresetId == null
            ? null
            : String(source.selectedParamsPresetId),
        paramsPresets: Array.isArray(source.paramsPresets)
            ? source.paramsPresets.map(normalizeParamsPreset)
            : [],
        requestDelay: {
            min: Number(rawDelay.min) > 0 ? Number(rawDelay.min) : DEFAULT_SETTINGS.requestDelay.min,
            max: Number(rawDelay.max) > 0 ? Number(rawDelay.max) : DEFAULT_SETTINGS.requestDelay.max,
        },
        timeout: Number(source.timeout) > 0 ? Number(source.timeout) : DEFAULT_SETTINGS.timeout,
        cacheDays: normalizeSharedCacheDays(source.cacheDays),
        useWorldInfo: source.useWorldInfo === true,
        characterTags: Array.isArray(source.characterTags) ? source.characterTags : [],
        autoLearnCharacters: source.autoLearnCharacters === true,
        autoLearnMode: source.autoLearnMode,
        overrideSize: String(source.overrideSize || 'default'),
        showFloorButton: source.showFloorButton !== false,
        showFloatingButton: source.showFloatingButton === true,
        advancedMode: true,
        promptPresets: Array.isArray(source.promptPresets)
            ? source.promptPresets.filter((preset) => preset && typeof preset === 'object')
            : [],
        selectedPromptPresetId: source.selectedPromptPresetId == null
            ? null
            : String(source.selectedPromptPresetId),
        _promptTemplateVersion: Number(source._promptTemplateVersion) || 0,
        worldbooks: {
            enabled: rawWorldbooks.enabled === true,
            uploadedBooks: Array.isArray(rawWorldbooks.uploadedBooks) ? rawWorldbooks.uploadedBooks : [],
            keywordFilterMode: rawWorldbooks.keywordFilterMode === 'all_active' ? 'all_active' : 'auto',
        },
        danbooruLocalDB: source.danbooruLocalDB === true,
        messageFilterRules: Array.isArray(source.messageFilterRules) ? source.messageFilterRules : [],
    };

    if (!merged.paramsPresets?.length) {
        const id1 = generateSlotId();
        const id2 = generateSlotId();
        merged.paramsPresets = [
            normalizeParamsPreset({ ...cloneSettingsObject(DEFAULT_PARAMS_PRESET), id: id1 }, 0),
            normalizeParamsPreset({ ...cloneSettingsObject(DEFAULT_PARAMS_PRESET_2), id: id2 }, 1),
        ];
        merged.selectedParamsPresetId = id1;
    }
    if (!merged.selectedParamsPresetId) merged.selectedParamsPresetId = merged.paramsPresets[0]?.id;
    if (!Number.isFinite(Number(merged.updatedAt))) merged.updatedAt = 0;

    merged.characterTags = (merged.characterTags || []).map(char => ({
        id: char.id || generateSlotId(),
        enabled: char.enabled !== false,
        name: char.name || '',
        aliases: char.aliases || [],
        type: char.type || 'girl',
        appearance: char.appearance || char.tags || '',
        negativeTags: char.negativeTags || '',
        danbooruTag: char.danbooruTag || '',
        outfits: normalizeNamedTagList(char.outfits || char.costumes || char.clothes || []),
        dynamicStates: normalizeNamedTagList(char.dynamicStates || []),
    }));

    merged.autoLearnCharacters = !!merged.autoLearnCharacters;
    merged.danbooruLocalDB = !!merged.danbooruLocalDB;
    merged.autoLearnMode = ['new_only', 'auto_update'].includes(merged.autoLearnMode)
        ? merged.autoLearnMode : 'new_only';

    // 提示词预设存储实际值，不使用 null-means-default。
    if (!merged.promptPresets.length) {
        const id1 = generateSlotId();
        const id2 = generateSlotId();
        merged.promptPresets = [
            { id: id1, name: '默认-完整规则',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
              sceneRules: DEFAULT_PROMPT_CONFIG.sceneRules },
            { id: id2, name: '默认-第一人称完整规则',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystemPov,
              sceneRules: DEFAULT_PROMPT_CONFIG.sceneRules },
        ];
        merged.selectedPromptPresetId = id1;
    }
    merged._promptTemplateVersion = PROMPT_TEMPLATE_VERSION;
    merged.promptPresets = merged.promptPresets.map((preset, index) => {
        const isPov = preset.name === '默认-第一人称完整规则';
        return {
            id: String(preset.id || `prompt-${Date.now()}-${index}`),
            name: String(preset.name || `提示词预设 ${index + 1}`),
            topSystem: typeof preset.topSystem === 'string'
                ? preset.topSystem
                : (isPov ? DEFAULT_PROMPT_CONFIG.topSystemPov : DEFAULT_PROMPT_CONFIG.topSystem),
            sceneRules: typeof preset.sceneRules === 'string'
                ? preset.sceneRules
                : DEFAULT_PROMPT_CONFIG.sceneRules,
            modelGuideOverrides: normalizeNovelPromptGuideOverrides(preset.modelGuideOverrides),
            modelContractOverrides: normalizeNovelModelContractOverrides(preset.modelContractOverrides),
        };
    });
    if (!merged.selectedPromptPresetId
        || !merged.promptPresets.some(preset => preset.id === merged.selectedPromptPresetId)) {
        merged.selectedPromptPresetId = merged.promptPresets[0]?.id || null;
    }
    // ── 消息过滤规则规范化 ──
    if (!Array.isArray(merged.messageFilterRules)) merged.messageFilterRules = [];
    merged.messageFilterRules = merged.messageFilterRules
        .filter(r => r && typeof r === 'object')
        .map(r => ({ start: String(r.start || ''), end: String(r.end || '') }));

    return merged;
}

async function loadSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await NovelDrawStorage.getStrict(SERVER_FILE_KEY, null);
        console.log('[NovelDraw] loadSettings from server: autoLearn=%s, advMode=%s',
            saved?.autoLearnCharacters, saved?.advancedMode);
        const promptUpgrade = migrateLegacyNovelPromptSettings(saved || {}, DEFAULT_PROMPT_CONFIG, PROMPT_TEMPLATE_VERSION);
        settingsCache = normalizeSettings(promptUpgrade.settings);

        if (!saved
            || saved.configVersion !== CONFIG_VERSION
            || Number(saved._promptTemplateVersion) !== PROMPT_TEMPLATE_VERSION
            || promptUpgrade.migrated) {
            settingsCache.configVersion = CONFIG_VERSION;
            settingsCache.updatedAt = Date.now();
            const storageValue = mergeNovelDrawProviderSettingsIntoStorageRoot(saved, settingsCache);
            const savedMigration = await NovelDrawStorage.setAndSave(SERVER_FILE_KEY, storageValue, { silent: true });
            if (!savedMigration) throw new Error('默认设置保存失败');
        }
        settingsLoaded = true;
        if (promptUpgrade.upstreamPresetCount > 0) {
            const customNotice = promptUpgrade.customPresetCount > 0
                ? `；其中 ${promptUpgrade.customPresetCount} 个自定义预设的旧规则已保留，请在提示词设置中检查`
                : '';
            showToast(`已升级 ${promptUpgrade.upstreamPresetCount} 个旧版 NovelAI 提示词预设${customNotice}`, 'info', 7000);
        }
        return settingsCache;
    } catch (e) {
        console.error('[NovelDraw] 加载设置失败:', e);
        settingsCache = null;
        settingsLoaded = false;
        showToast('无法读取 NovelAI 配置，已禁止保存，请稍后重试', 'error', 5000);
        throw e;
    }
}

function getSettings() {
    if (!settingsCache) {
        console.warn('[NovelDraw] 设置未加载，使用默认值');
        settingsCache = normalizeSettings({});
    }
    // 防御性检查：确保提示词预设始终存在
    if (!settingsCache.promptPresets?.length) {
        console.warn('[NovelDraw] promptPresets 为空，重新创建');
        const id1 = generateSlotId();
        const id2 = generateSlotId();
        settingsCache.promptPresets = [
            { id: id1, name: '默认-完整规则',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
              sceneRules: DEFAULT_PROMPT_CONFIG.sceneRules },
            { id: id2, name: '默认-第一人称完整规则',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystemPov,
              sceneRules: DEFAULT_PROMPT_CONFIG.sceneRules },
        ];
        settingsCache.selectedPromptPresetId = id1;
    }
    return settingsCache;
}

/**
 * NovelAI Provider 设置与共享画图设置共用同一存储根对象，但运行时所有共享字段
 * 必须从 draw-settings 的单一缓存读取，避免其他 Provider 保存后仍使用旧副本。
 */
function getRuntimeSettings() {
    const providerSettings = getSettings();
    const sharedSettings = getSharedDrawSettings();
    return {
        ...providerSettings,
        timeout: sharedSettings.timeout,
        cacheDays: sharedSettings.cacheDays,
        useWorldInfo: sharedSettings.useWorldInfo,
        characterTags: sharedSettings.characterTags,
        worldbooks: sharedSettings.worldbooks,
        danbooruLocalDB: sharedSettings.danbooruLocalDB,
        messageFilterRules: sharedSettings.messageFilterRules,
    };
}

function getGenerationSnapshot() {
    const settings = getSettings();
    const overrideSize = String(settings.overrideSize || 'default');
    return {
        fingerprint: {
            version: 1,
            overrideSize,
        },
        execution: Object.freeze({ overrideSize }),
    };
}

function cloneSettingsObject(obj) {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}

function saveSettings(s) {
    const next = normalizeSettings(s);
    next.updatedAt = Date.now();
    next.configVersion = CONFIG_VERSION;
    settingsCache = next;
    return next;
}

let settingsUpdateQueue = Promise.resolve();

async function persistSettingsNow(s, okText = '已保存', { notify = true, silent = false, target = '' } = {}) {
    if (!settingsLoaded) {
        console.error('[NovelDraw] 设置尚未成功加载，拒绝保存');
        if (notify) postStatus('error', '配置尚未成功加载，已禁止保存', target);
        return false;
    }
    const next = normalizeSettings(s);
    next.updatedAt = Date.now();
    next.configVersion = CONFIG_VERSION;
    const previous = settingsCache ? cloneSettingsObject(settingsCache) : null;

    console.log(
        '[NovelDraw] persistSettings:',
        okText,
        'autoLearn=%s advMode=%s mode=%s preset=%s size=%s',
        next.autoLearnCharacters,
        next.advancedMode,
        next.mode,
        next.selectedParamsPresetId,
        next.overrideSize,
    );

    try {
        // 先切到最新内存态，避免“刚保存立刻生成”仍读到旧 key / 旧参数。
        settingsCache = next;
        const ok = await NovelDrawStorage.updateAndSave((storageRoot) => {
            const latest = storageRoot[SERVER_FILE_KEY];
            storageRoot[SERVER_FILE_KEY] = mergeNovelDrawProviderSettingsIntoStorageRoot(latest, next);
        }, { silent });
        if (ok !== false) {
            if (notify) {
                postStatus('success', okText, target);
            }
            console.log('[NovelDraw] persistSettings: SUCCESS');
            return true;
        }

        if (notify) {
            postStatus('error', '保存失败', target);
        }
        settingsCache = previous;
        console.warn('[NovelDraw] persistSettings: FAILED without throw');
        return false;
    } catch (e) {
        console.error('[NovelDraw] persistSettings: FAILED', e);
        settingsCache = previous;
        if (notify) {
            postStatus('error', `保存失败：${e?.message || '网络异常'}`, target);
        }
        return false;
    }
}

function persistSettings(s, okText = '已保存', options = {}) {
    const update = () => persistSettingsNow(s, okText, options);
    const result = settingsUpdateQueue.then(update, update);
    settingsUpdateQueue = result.catch(() => {});
    return result;
}

async function runSettingsPersistentUpdate(mutator, okText, options) {
    if (!settingsLoaded) {
        console.error('[NovelDraw] 设置尚未成功加载，拒绝保存');
        if (options.notify !== false) postStatus('error', '配置尚未成功加载，已禁止保存', options.target || '');
        return false;
    }
    const { notify = true, silent = false, target = '' } = options;
    const previous = settingsCache ? cloneSettingsObject(settingsCache) : null;
    try {
        const ok = await NovelDrawStorage.updateAndSave(async (storageRoot) => {
            const latest = storageRoot[SERVER_FILE_KEY];
            const base = normalizeSettings(latest || getSettings());
            const draft = cloneSettingsObject(base);
            if (typeof mutator === 'function') {
                await mutator(draft);
            }
            const next = normalizeSettings(draft);
            next.updatedAt = Date.now();
            next.configVersion = CONFIG_VERSION;
            settingsCache = next;
            storageRoot[SERVER_FILE_KEY] = mergeNovelDrawProviderSettingsIntoStorageRoot(latest, next);
        }, { silent });
        if (ok !== false) {
            if (notify) postStatus('success', okText, target);
            return true;
        }
        settingsCache = previous;
        if (notify) postStatus('error', '保存失败', target);
        return false;
    } catch (error) {
        settingsCache = previous;
        console.error('[NovelDraw] 更新设置失败:', error);
        if (notify) postStatus('error', `保存失败：${error?.message || '配置写入失败'}`, target);
        return false;
    }
}

function updateSettingsPersistent(mutator, okText = '已保存', options = {}) {
    const update = () => runSettingsPersistentUpdate(mutator, okText, options);
    const result = settingsUpdateQueue.then(update, update);
    settingsUpdateQueue = result.catch(() => {});
    return result;
}

async function updateSharedSettingsPersistent(mutator, okText = '已保存', options = {}) {
    const { notify = true, silent = false, target = '' } = options;
    const ok = await updateSharedDrawSettingsPersistent(mutator, okText, {
        notify: false,
        silent,
    });
    if (notify) {
        postStatus(ok ? 'success' : 'error', ok ? okText : '保存失败', target);
    }
    return ok;
}

async function saveSettingsAndToast(s, okText = '已保存') {
    return persistSettings(s, okText);
}

function getActiveParamsPreset() {
    const s = getSettings();
    return s.paramsPresets.find(p => p.id === s.selectedParamsPresetId) || s.paramsPresets[0];
}

function getActivePromptPreset(s = getSettings()) {
    return s.promptPresets.find(p => p.id === s.selectedPromptPresetId) || s.promptPresets[0] || null;
}

function compactPromptGuideOverrides(value) {
    const overrides = normalizeNovelPromptGuideOverrides(value);
    for (const [guideId, content] of Object.entries(overrides)) {
        if (content === getLoadedTagGuideById(guideId)) delete overrides[guideId];
    }
    return overrides;
}

function compactPromptContractOverrides(value) {
    const overrides = normalizeNovelModelContractOverrides(value);
    for (const [guideId, content] of Object.entries(overrides)) {
        if (content === getDefaultNovelModelContractByGuideId(guideId)) delete overrides[guideId];
    }
    return overrides;
}

const NOVEL_QUICK_SIZE_OPTIONS = [
    { value: 'default', label: '跟随预设' },
    { value: '832x1216', label: '832 x 1216 竖图' },
    { value: '1216x832', label: '1216 x 832 横图' },
    { value: '1024x1024', label: '1024 x 1024 方图' },
    { value: '768x1280', label: '768 x 1280 大竖' },
    { value: '1280x768', label: '1280 x 768 大横' },
];

function getQuickSettings() {
    const settings = getSettings();
    const presets = (settings.paramsPresets || []).map((preset) => ({
        value: String(preset.id || ''),
        label: String(preset.name || '未命名'),
    })).filter((preset) => preset.value);
    return {
        provider: 'novelai',
        providerLabel: 'NovelAI',
        available: moduleInitialized,
        auto: settings.mode === 'auto',
        presets,
        selectedPresetId: String(settings.selectedParamsPresetId || presets[0]?.value || ''),
        sizeOptions: NOVEL_QUICK_SIZE_OPTIONS,
        selectedSize: String(settings.overrideSize || 'default'),
    };
}

async function updateQuickSettings(patch = {}) {
    const ok = await updateSettingsPersistent((settings) => {
        if (Object.prototype.hasOwnProperty.call(patch, 'selectedPresetId')) {
            settings.selectedParamsPresetId = String(patch.selectedPresetId || '');
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'selectedSize')) {
            settings.overrideSize = String(patch.selectedSize || 'default');
        }
        if (Object.prototype.hasOwnProperty.call(patch, 'auto')) {
            settings.mode = patch.auto === true ? 'auto' : 'manual';
        }
    }, '快捷设置已保存', { notify: false, silent: false });
    if (!ok) {
        throw new Error('quick_settings_save_failed');
    }
    await notifySettingsUpdated();
    return getQuickSettings();
}

async function notifySettingsUpdated() {
    try {
        const { refreshPresetSelect, updateAllSizeSelects, updateAutoModeUI } = await import('./floating-panel.js');
        refreshPresetSelect?.();
        updateAllSizeSelects?.();
        updateAutoModeUI?.();
    } catch {}

    if (overlayCreated && frameReady) {
        try { await sendInitData(); } catch {}
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// JSZip
// ═══════════════════════════════════════════════════════════════════════════

async function loadMessagePackDecoder() {
    if (!messagePackDecoderPromise) {
        messagePackDecoderPromise = import('../../../../libs/msgpack.mjs')
            .then(module => {
                if (typeof module.decode !== 'function') {
                    throw new TypeError('MessagePack vendor 未导出 decode');
                }
                return module.decode;
            })
            .catch(error => {
                messagePackDecoderPromise = null;
                throw error;
            });
    }
    return messagePackDecoderPromise;
}

async function loadMessagePackDecoderForResponse(response, controller) {
    try {
        return await loadMessagePackDecoder();
    } catch (error) {
        await response.body?.cancel?.().catch(() => {});
        controller.abort();
        throw error;
    }
}

async function ensureJSZip() {
    if (window.JSZip) return window.JSZip;
    if (jsZipLoaded) {
        // 另一个调用者已发起加载 — 等待完成，但加超时防止无限挂起
        await new Promise((resolve, reject) => {
            let waited = 0;
            const c = setInterval(() => {
                if (window.JSZip) { clearInterval(c); resolve(); return; }
                waited += 50;
                if (waited > 15000) { clearInterval(c); reject(new NovelDrawError('JSZip 加载超时', ErrorType.NETWORK)); }
            }, 50);
        });
        return window.JSZip;
    }
    jsZipLoaded = true;
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = () => resolve(window.JSZip);
        s.onerror = () => { jsZipLoaded = false; reject(new NovelDrawError('JSZip 加载失败', ErrorType.NETWORK)); };
        document.head.appendChild(s);
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 角色检测与标签组装
// ═══════════════════════════════════════════════════════════════════════════

function normalizeNamedTagList(list = []) {
    return (Array.isArray(list) ? list : [])
        .map(item => ({
            name: String(item?.name || '').trim(),
            tags: String(item?.tags || '').trim(),
        }))
        .filter(item => item.name || item.tags);
}

function detectPresentCharacters(messageText, characterTags) {
    if (!messageText || !characterTags?.length) return [];
    const text = messageText.toLowerCase();
    const present = [];

    for (const char of characterTags) {
        if (!isCharacterEnabled(char) || !char.name) continue;
        const names = [char.name, ...(char.aliases || [])].filter(Boolean);
        const isPresent = names.some(name => {
            const lowerName = name.toLowerCase();
            return text.includes(lowerName) || new RegExp(`\\b${escapeRegexChars(lowerName)}\\b`, 'i').test(text);
        });

        if (isPresent) {
            present.push({
                name: char.name,
                aliases: char.aliases || [],
                type: char.type || 'girl',
                appearance: char.appearance || '',
                danbooruTag: char.danbooruTag || '',
                negativeTags: char.negativeTags || '',
                outfits: normalizeNamedTagList(char.outfits),
                dynamicStates: normalizeNamedTagList(char.dynamicStates),
            });
        }
    }
    return present;
}

// ── 角色自动学习 ─────────────────────────────────────────────

/** 通用/匿名角色名过滤：预编译为单一正则，避免每次调用迭代 30+ 个 pattern */
const GENERIC_NAME_REGEX = new RegExp([
    // 中文通用/匿名
    '(?:^未知)', '(?:^路人)', '(?:^路边)', '(?:^陌生)', '(?:^无名)', '(?:^某[个位])',
    '(?:^女[人性孩][A-Za-z0-9]?$)', '(?:^男[人性孩][A-Za-z0-9]?$)',
    '(?:^少[女男年][A-Za-z0-9]?$)', '(?:^大[叔妈姐哥][A-Za-z0-9]?$)',
    '(?:^老[人头大妇][A-Za-z0-9]?$)',
    '(?:^[女男人]$)',
    '(?:^角色[0-9A-Za-z]*$)', '(?:^人物[0-9A-Za-z]*$)',
    '(?:^配角)', '(?:^(?:NPC|mob))',
    '(?:^[男女][0-9]+$)',
    // 中文关系/职业称呼
    '(?:^[哥姐弟妹]$)',
    '(?:^(?:哥哥|姐姐|弟弟|妹妹|老师|学长|学姐|前辈|老板|店员|医生|护士|主人|奴隶|仆人)$)',
    // 日语称呼
    '(?:^(?:お[兄姉]ちゃん|先輩|先生|マスター|お嬢様|ご主人様)$)',
    // 英文通用
    '(?:^(?:faceless|unnamed|unknown|random|stranger|passerby|bystander))',
    '(?:^(?:girl|boy|woman|man|person|male|female)\\s*[A-Za-z0-9]?$)',
    // 英文关系/职业称呼
    '(?:^(?:teacher|master|boss|doctor|nurse|brother|sister|senpai|sensei)$)',
].join('|'), 'i');

function isGenericCharName(name) {
    if (!name || name.trim().length <= 1) return true;
    return GENERIC_NAME_REGEX.test(name.trim());
}

function autoLearnFromTasks(tasks, settings) {
    const result = { newChars: [], updatedChars: [] };
    if (!tasks?.length) return result;

    // 收集所有有 type 或 appear 的角色（LLM 认定的未知角色）
    const charMap = new Map();
    for (const task of tasks) {
        for (const char of (task.chars || [])) {
            if (!char.name || (!char.type && !char.appear)) continue;
            if (isGenericCharName(char.name)) continue; // 跳过通用/匿名名字
            // 自动剔除 faceless 相关 tag，保留其余外貌（用户可手动添加 faceless）
            if (char.appear) char.appear = char.appear.replace(/\b\S*faceless\S*\b/gi, '').replace(/,\s*,/g, ',').replace(/^\s*,|,\s*$/g, '').trim();
            const key = char.name.toLowerCase();
            const existing = charMap.get(key);
            if (!existing || countFields(char) > countFields(existing)) {
                charMap.set(key, char);
            }
        }
    }

    if (!charMap.size) return result;

    const knownTags = settings.characterTags || [];
    const mode = settings.autoLearnMode || 'new_only';

    for (const [, char] of charMap) {
        const match = resolveAutoLearnCharacter(char.name, knownTags);
        if (match.action === 'skip') continue;
        const found = match.character;

        if (match.action === 'create') {
            const newChar = {
                id: generateSlotId(),
                enabled: true,
                name: char.name,
                aliases: [],
                type: char.type || 'girl',
                appearance: char.appear || '',
                negativeTags: '',
                danbooruTag: char.danbooru || '',
                outfits: [],
                dynamicStates: [],
            };
            // 本地 DB 自动匹配 danbooruTag
            if (isDanbooruDBLoaded() && !newChar.danbooruTag) {
                const matches = searchLocalDanbooru(char.name, 1);
                if (matches.length) newChar.danbooruTag = matches[0].name;
            }
            knownTags.push(newChar);
            result.newChars.push(char.name);
        } else if (mode === 'auto_update') {
            let updated = false;
            if (!found.appearance && char.appear) {
                found.appearance = char.appear;
                updated = true;
            }
            // 仅在外貌仍为空时更新 type（已有外貌说明角色已配置，不应覆盖 type）
            if (!found.appearance && char.type && found.type !== char.type) {
                found.type = char.type;
                updated = true;
            }
            if (!found.danbooruTag && char.danbooru) {
                found.danbooruTag = char.danbooru;
                updated = true;
            }
            // 本地 DB 自动匹配 danbooruTag（auto_update 模式）
            if (!found.danbooruTag && isDanbooruDBLoaded()) {
                const matches = searchLocalDanbooru(found.name, 1);
                if (matches.length) { found.danbooruTag = matches[0].name; updated = true; }
            }
            if (updated) result.updatedChars.push(found.name);
        }
    }

    settings.characterTags = knownTags;
    return result;
}

function countFields(char) {
    return ['type', 'appear', 'costume', 'action', 'interact', 'danbooru']
        .filter(f => char[f]).length;
}

// ═══════════════════════════════════════════════════════════════════════════
// Danbooru 工具函数
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// NovelAI API
// ═══════════════════════════════════════════════════════════════════════════

// 后端发送：前端负责解析完整端点，ST server plugin 只代发并返回 base64。
async function generateViaBackend({ url, legacyBaseUrl, apiKey, insecure, payload, signal, timeout }) {
    let res;
    try {
        const request = endpoint => fetch(endpoint, {
            method: 'POST',
            headers: getRequestHeaders(),
            signal,
            body: JSON.stringify({
                url: endpoint === NAI_BACKEND_GENERATE ? legacyBaseUrl : url,
                key: apiKey,
                insecure: !!insecure,
                payload,
                timeout,
            }),
        });
        res = await request(NAI_BACKEND_GENERATE_V2);
        // Compatibility with the upstream-released v1.0.1 server plugin.
        // Remove this fallback when that public backend API is retired.
        if (res.status === 404) {
            await res.body?.cancel?.().catch(() => {});
            res = await request(NAI_BACKEND_GENERATE);
        }
    } catch (e) {
        if (e?.name === 'AbortError') throw e;
        throw new NovelDrawError('后端代发失败（未安装 littlewhitebox-image-jobs 插件或 SillyTavern 未开启 server plugins）', ErrorType.NETWORK);
    }
    if (res.status === 404) {
        throw new NovelDrawError('后端端点不存在：请安装 plugins/littlewhitebox-image-jobs 并在 config.yaml 开启 enableServerPlugins 后重启酒馆', ErrorType.NETWORK);
    }
    if (!res.ok) {
        throw parseApiError(res.status, await res.text().catch(() => ''));
    }
    const data = await res.json().catch(() => null);
    if (!data || typeof data !== 'object' || data.ok !== true) {
        const status = data?.status;
        const msg = data?.error || '后端生图失败';
        if (status) throw parseApiError(status, msg);
        if (data?.code === 'timeout') throw new NovelDrawError('请求超时', ErrorType.TIMEOUT);
        throw new NovelDrawError(msg, ErrorType.UNKNOWN);
    }
    if (typeof data.base64 !== 'string' || data.base64.length === 0) {
        throw new NovelDrawError('后端返回的图片格式无效', ErrorType.PARSE);
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(data.mime)) {
        throw new NovelDrawError('后端返回的图片类型无效', ErrorType.PARSE);
    }
    return formatImageBase64(data.base64, data.mime);
}

async function generateV5ViaBackend({ url, apiKey, insecure, payload, signal, timeout }) {
    let response;
    try {
        response = await fetch(NAI_BACKEND_GENERATE_STREAM, {
            method: 'POST',
            headers: getRequestHeaders(),
            signal,
            body: JSON.stringify({ url, key: apiKey, insecure: !!insecure, payload, timeout }),
        });
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        throw new NovelDrawError('V5 后端代发失败，请检查 littlewhitebox-image-jobs 插件', ErrorType.NETWORK);
    }
    if (response.status === 404) {
        throw new NovelDrawError(
            `V5 后端端点不存在：请安装当前 littlewhitebox-image-jobs（兼容后端最低 v${NAI_BACKEND_V5_MIN_VERSION}）`,
            ErrorType.NETWORK,
        );
    }
    if (!response.ok) {
        throw parseApiError(response.status, await readNovelV5ErrorText(response), ErrorType.PROVIDER);
    }
    return response;
}

function imageBytesToBase64(bytes) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return formatImageBase64(btoa(binary), 'image/png');
}

async function testApiConnection(apiKey, baseUrl, opts = {}) {
    if (!apiKey) throw new NovelDrawError('请填写 API Key', ErrorType.AUTH);
    const settings = getRuntimeSettings();
    const sendMode = opts.sendMode || settings.sendMode || 'frontend';
    const insecure = opts.insecure ?? settings.insecureTLS === true;
    const resolvedBase = baseUrl ?? settings.apiBaseUrl;
    const timeout = (opts.timeout > 0)
        ? opts.timeout
        : (settings.timeout > 0 ? settings.timeout : DEFAULT_SETTINGS.timeout);
    const model = String(
        opts.model || getActiveParamsPreset()?.params?.model || DEFAULT_PARAMS_PRESET.params.model,
    ).trim();
    let probe;
    let apiUrl;
    try {
        probe = buildNovelAIConnectionProbe(resolvedBase, model);
        apiUrl = sendMode === 'backend'
            ? resolveNovelAIBackendImageApi(resolvedBase, probe.transport, globalThis.location?.href)
            : probe.url;
    } catch (error) {
        throw handleFetchError(error);
    }
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeout);

    try {
        // 后端发送模式：前端提供最终端点与探针报文，server plugin 只负责传输。
        if (sendMode === 'backend') {
            if (probe.multipart) {
                await assertV5BackendCapability(controller.signal);
            }
            const request = endpoint => fetch(endpoint, {
                method: 'POST',
                headers: getRequestHeaders(),
                signal: controller.signal,
                body: JSON.stringify({
                    url: endpoint === NAI_BACKEND_TEST ? (resolvedBase || '') : apiUrl,
                    key: apiKey,
                    insecure: !!insecure,
                    timeout,
                    payload: probe.payload,
                    multipart: probe.multipart,
                }),
            });
            let res = await request(NAI_BACKEND_TEST_V2);
            // V5 never falls back to the test-line v1.1 protocol. Legacy models retain
            // the released v1.0.1 connection probe until that backend API is retired.
            if (!probe.multipart && res.status === 404) {
                await res.body?.cancel?.().catch(() => {});
                res = await request(NAI_BACKEND_TEST);
            }
            if (res.status === 404) throw new NovelDrawError('后端端点不存在：请安装 plugins/littlewhitebox-image-jobs 并开启 enableServerPlugins 后重启酒馆', ErrorType.NETWORK);
            const data = await res.json().catch(() => null);
            if (data?.ok === true) return { success: true };
            if (data?.status === 401) throw new NovelDrawError('API Key 无效', ErrorType.AUTH);
            if (data?.code === 'timeout') throw new NovelDrawError('请求超时', ErrorType.TIMEOUT);
            throw new NovelDrawError(data?.error || `返回: ${res.status}`, ErrorType.NETWORK);
        }

        // 前端直连模式。
        const body = probe.multipart ? new FormData() : JSON.stringify(probe.payload);
        if (probe.multipart) {
            body.append('request', new Blob([JSON.stringify(probe.payload)], { type: 'application/json' }), 'blob');
        }
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...(!probe.multipart ? { 'Content-Type': 'application/json' } : {}),
            },
            body,
            signal: controller.signal,
        });
        if (res.status === 401) throw new NovelDrawError('API Key 无效', ErrorType.AUTH);
        if (res.status === 400 || res.status === 402 || res.ok) {
            await res.body?.cancel?.().catch(() => {});
            return { success: true };
        }
        throw new NovelDrawError(`返回: ${res.status}`, ErrorType.NETWORK);
    } catch (error) {
        throw handleFetchError(error);
    } finally {
        clearTimeout(tid);
    }
}

function createNovelRequestSeed(params = {}) {
    const model = String(params.model ?? DEFAULT_PARAMS_PRESET.params.model).trim();
    const rawSeed = params.seed;
    if (isNovelV5Model(model)) {
        if (rawSeed !== undefined && Number(rawSeed) !== -1) return rawSeed;
    } else if (Number(rawSeed) >= 0) {
        return rawSeed;
    }
    return Math.floor(Math.random() * (MAX_SEED + 1));
}

export function createNovelGenerationRecipe({
    settings = getSettings(),
    preset = getActiveParamsPreset(),
    itemCount = 0,
    resolveForBackend,
} = {}) {
    if (typeof resolveForBackend !== 'boolean') {
        throw new TypeError('NovelAI generationRecipe 必须明确指定请求由浏览器还是后端发送');
    }
    const params = { ...DEFAULT_PARAMS_PRESET.params, ...(preset?.params || {}) };
    return {
        apiBaseUrl: String(settings.apiBaseUrl || '').trim(),
        apiKey: String(settings.apiKey || '').trim(),
        insecureTLS: settings.insecureTLS === true,
        timeout: Number(settings.timeout) || DEFAULT_SETTINGS.timeout,
        requestDelay: {
            min: Number(settings.requestDelay?.min) || DEFAULT_SETTINGS.requestDelay.min,
            max: Number(settings.requestDelay?.max) || DEFAULT_SETTINGS.requestDelay.max,
        },
        overrideSize: String(settings.overrideSize || 'default'),
        baseHref: globalThis.location?.href,
        resolveForBackend: resolveForBackend === true,
        params: cloneSettingsObject(params),
        positivePrefix: preset?.positivePrefix || '',
        negativePrefix: preset?.negativePrefix || '',
        knownCharacters: cloneSettingsObject(settings.characterTags || []),
        autoLearnEnabled: settings.autoLearnCharacters === true,
        autoLearnMode: ['new_only', 'auto_update'].includes(settings.autoLearnMode)
            ? settings.autoLearnMode
            : 'new_only',
        seeds: Array.from(
            { length: Math.max(0, Math.floor(Number(itemCount) || 0)) },
            () => createNovelRequestSeed(params),
        ),
    };
}

function prepareNovelImageRequest(
    request,
    requestConfig,
    seed = createNovelRequestSeed(request.params),
    resolveForBackend = requestConfig.sendMode === 'backend',
) {
    try {
        return compileNovelImageRequest(request, {
            apiBaseUrl: requestConfig.apiBaseUrl,
            overrideSize: requestConfig.overrideSize,
            defaultParams: DEFAULT_PARAMS_PRESET.params,
            resolveForBackend,
            baseHref: globalThis.location?.href,
        }, seed);
    } catch (error) {
        throw handleFetchError(error);
    }
}

async function executePreparedNovelRequest(prepared, requestConfig, signal) {
    const controller = new AbortController();
    const forwardAbort = () => controller.abort();
    signal?.addEventListener('abort', forwardAbort, { once: true });
    if (signal?.aborted) forwardAbort();
    const timeoutId = setTimeout(() => controller.abort(), requestConfig.timeout);
    const startedAt = Date.now();

    try {
        if (signal?.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
        if (requestConfig.sendMode === 'backend') {
            if (prepared.isV5) {
                await assertV5BackendCapability(controller.signal);
                const response = await generateV5ViaBackend({
                    url: prepared.apiUrl,
                    apiKey: requestConfig.apiKey,
                    insecure: requestConfig.insecureTLS,
                    payload: prepared.payload,
                    signal: controller.signal,
                    timeout: requestConfig.timeout,
                });
                const decodeMessagePack = await loadMessagePackDecoderForResponse(response, controller);
                const image = await readNovelV5FinalImage(response, {
                    decode: decodeMessagePack,
                    signal: controller.signal,
                });
                console.log(`[NovelDraw] V5 完成(后端) ${Date.now() - startedAt}ms`);
                return imageBytesToBase64(image);
            }
            const base64 = await generateViaBackend({
                url: prepared.apiUrl,
                legacyBaseUrl: prepared.legacyBaseUrl,
                apiKey: requestConfig.apiKey,
                insecure: requestConfig.insecureTLS,
                payload: prepared.payload,
                signal: controller.signal,
                timeout: requestConfig.timeout,
            });
            console.log(`[NovelDraw] 完成(后端) ${Date.now() - startedAt}ms`);
            return base64;
        }

        const body = prepared.isV5 ? new FormData() : JSON.stringify(prepared.payload);
        if (prepared.isV5) {
            body.append('request', new Blob([JSON.stringify(prepared.payload)], { type: 'application/json' }), 'blob');
        }
        const response = await fetch(prepared.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${requestConfig.apiKey}`,
                ...(!prepared.isV5 ? { 'Content-Type': 'application/json' } : {}),
            },
            signal: controller.signal,
            body,
        });
        if (!response.ok) {
            const errorText = prepared.isV5
                ? await readNovelV5ErrorText(response)
                : await response.text().catch(() => '');
            throw parseApiError(response.status, errorText, prepared.isV5 ? ErrorType.PROVIDER : ErrorType.UNKNOWN);
        }
        if (prepared.isV5) {
            const decodeMessagePack = await loadMessagePackDecoderForResponse(response, controller);
            const image = await readNovelV5FinalImage(response, {
                decode: decodeMessagePack,
                signal: controller.signal,
            });
            console.log(`[NovelDraw] V5 完成 ${Date.now() - startedAt}ms`);
            return imageBytesToBase64(image);
        }
        const responseData = await readImageResponse(response, controller.signal);
        const base64 = await extractImageFromResponse(responseData, ensureJSZip, controller.signal);
        console.log(`[NovelDraw] 完成 ${Date.now() - startedAt}ms`);
        return base64;
    } catch (error) {
        if (signal?.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
        throw handleFetchError(error);
    } finally {
        clearTimeout(timeoutId);
        signal?.removeEventListener('abort', forwardAbort);
    }
}

export async function decodeNovelBackendJobResult({ response, kind: transport }) {
    try {
        if (transport === 'msgpack-stream') {
            const decodeMessagePack = await loadMessagePackDecoder();
            const image = await readNovelV5FinalImage(response, { decode: decodeMessagePack });
            return imageBytesToBase64(image);
        }
        const responseData = await readImageResponse(response);
        return await extractImageFromResponse(responseData, ensureJSZip);
    } catch (error) {
        if (error instanceof NovelV5StreamError && error.code === 'V5_STREAM_READ_FAILED') {
            throw new ImageBackendJobsError(error.message, { code: error.code, retriable: true, cause: error });
        }
        if (error instanceof TypeError || error?.name === 'AbortError') {
            throw new ImageBackendJobsError('后端图片结果读取中断', {
                code: 'backend_result_interrupted',
                retriable: true,
                cause: error,
            });
        }
        throw error;
    }
}

function backendItemError(item) {
    // alreadyDelivered 的项是成功事实（早先已交付并 ACK 过），必须从画廊恢复而不是报错。
    if (item.alreadyDelivered === true) return null;
    if (item.state === 'cancelled') return new NovelDrawError('已取消', ErrorType.ABORTED);
    if (item.error?.code === 'timeout') return new NovelDrawError('请求超时', ErrorType.TIMEOUT);
    if (Number.isInteger(item.error?.status)) {
        return parseApiError(item.error.status, item.error.message || '');
    }
    return new NovelDrawError(item.error?.message || '后端生图失败', ErrorType.UNKNOWN);
}

async function runNovelImageBatch({
    requests,
    compiledBatch,
    generationConfig,
    signal,
    backendCancelSignal,
    recoverable,
    monitorGeneration,
    queueBatch,
    onStateChange,
    onItemReady,
    onItemSettled,
}) {
    if (!Array.isArray(requests) || requests.length === 0) return { mode: 'empty', outcomes: [] };
    const settings = getRuntimeSettings();
    const requestConfig = snapshotNovelRequestConfig(settings, generationConfig, DEFAULT_SETTINGS.timeout);
    const transportMode = recoverable ? resolveNovelImageTransport(requestConfig) : requestConfig.sendMode;
    if (!requestConfig.apiKey) throw new NovelDrawError('请先配置 API Key', ErrorType.AUTH);
    if (signal?.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
    const prepared = compiledBatch
        ? compiledBatch.items.map(item => ({
            apiUrl: item.request.url,
            legacyBaseUrl: requestConfig.apiBaseUrl,
            payload: item.request.payload,
            transport: item.request.transport,
            isV5: item.request.transport === 'msgpack-stream',
        }))
        : requests.map(request => (
            prepareNovelImageRequest(
                request,
                requestConfig,
                request.seed,
                transportMode !== 'frontend',
            )
        ));
    const outcomes = new Array(prepared.length);
    const signalOwner = generationJobSignals.get(signal);
    const effectiveCancelSignal = backendCancelSignal || signalOwner?.backendCancel.signal || signal;
    const detachScope = transportMode === 'backend-job'
        ? backendJobMonitors.createScope(
            effectiveCancelSignal === signal ? null : signal,
            monitorGeneration ?? backendJobMonitors.captureGeneration(),
        )
        : null;

    if (transportMode !== 'frontend') {
        let backendStatus;
        try {
            backendStatus = await checkBackendPluginStatus({ signal });
        } catch (error) {
            detachScope?.dispose();
            if (signal?.aborted || error?.name === 'AbortError') {
                throw new NovelDrawError('已取消', ErrorType.ABORTED);
            }
            throw handleFetchError(error);
        }
        if (!backendStatus.ready) {
            detachScope?.dispose();
            throw new NovelDrawError('NovelAI 后端插件状态探测失败，请检查插件安装和网络连接', ErrorType.NETWORK);
        }
        if (transportMode === 'backend-job') {
            if (!hasImageBackendJobsCapability(backendStatus)) {
                detachScope.dispose();
                throw new NovelDrawError(
                    '小白X后台批量任务不可用。请安装并启动当前 littlewhitebox-image-jobs，或关闭此选项后继续使用逐张后端发送。',
                    ErrorType.NETWORK,
                );
            }
            const backendRequest = compiledBatch
                ? {
                    provider: compiledBatch.provider,
                    context: compiledBatch.context,
                    delay: compiledBatch.delay,
                    items: compiledBatch.items,
                }
                : {
                    provider: 'novelai',
                    context: {
                        key: requestConfig.apiKey,
                        insecure: requestConfig.insecureTLS,
                    },
                    delay: {
                        min: Number(settings.requestDelay?.min) || DEFAULT_SETTINGS.requestDelay.min,
                        max: Number(settings.requestDelay?.max) || DEFAULT_SETTINGS.requestDelay.max,
                    },
                    items: prepared.map(item => ({
                        request: {
                            transport: item.transport,
                            url: item.apiUrl,
                            payload: item.payload,
                        },
                        timeout: requestConfig.timeout,
                    })),
                };
            const backendHandlers = {
                // 只有用户亲手取消才允许传导到后端；前端的其它停手理由都不能删掉
                // 一个已经在跑、已经付过钱的任务。没提供就退回本地信号（画廊等一次性调用）。
                cancelSignal: effectiveCancelSignal,
                detachSignal: detachScope.signal,
                onStateChange: (state, data) => reportImageBackendJobState(onStateChange, state, data),
                onItemReady: async ({ index, kind, response }) => {
                    let base64;
                    try {
                        base64 = await decodeNovelBackendJobResult({ response, kind });
                    } catch (error) {
                        const decodeError = error instanceof Error ? error : new Error(String(error));
                        decodeError.discardBackendResult = true;
                        throw decodeError;
                    }
                    await onItemReady?.({ index, base64 });
                    outcomes[index] = { state: 'ready', base64 };
                },
                onItemSettled: async (item) => {
                    // 早先已交付并 ACK 过的项是成功事实，绝不能触发失败 UI；
                    // 它由恢复流程按记录的 imgId 从画廊还原。
                    if (item.alreadyDelivered === true) {
                        outcomes[item.index] = { state: 'consumed' };
                        return;
                    }
                    const error = item.source === 'frontend' ? item.error : backendItemError(item);
                    outcomes[item.index] = { state: item.state, error };
                    await onItemSettled?.({ ...item, error });
                },
            };
            let runResult;
            try {
                // 提供了恢复计划就走可恢复提交：先落交付日志、再 CAS 持久化占位符、
                // 复核租约、最后才 POST。缺了这套顺序，刷新回来就再也认不回这批图。
                runResult = await submitRecoverableImageJob({
                    client: imageBackendJobsClient,
                    provider: 'novelai',
                    request: backendRequest,
                    plan: recoverable.plan,
                    commitPlacements: recoverable.commitPlacements,
                    settlePlacements: recoverable.settlePlacements,
                    resolveSettlement: recoverable.resolveSettlement,
                    afterForget: recoverable.afterForget,
                    ...backendHandlers,
                });
            } catch (error) {
                if (error?.detached === true || error?.code === 'PENDING_JOB_LEASE_LOST') throw error;
                if (signal?.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
                if (error instanceof ImageBackendJobsError) {
                    const normalized = new NovelDrawError(
                        error.message,
                        error.status === 429 ? ErrorType.BUSY : ErrorType.NETWORK,
                    );
                    normalized.cause = error;
                    normalized.status = error.status;
                    normalized.code = error.code;
                    normalized.detached = error.detached === true;
                    throw normalized;
                }
                throw handleFetchError(error);
            } finally {
                detachScope.dispose();
            }
            return { mode: 'backend-job', outcomes, job: runResult.job, aborted: runResult.abortRequested };
        }

        const message = '当前使用逐张后端发送（后台批量任务未开启）';
        onStateChange?.('backend_legacy', { message });
    }

    for (let index = 0; index < prepared.length; index++) {
        if (signal?.aborted) {
            for (let pending = index; pending < prepared.length; pending++) {
                const error = new NovelDrawError('已取消', ErrorType.ABORTED);
                outcomes[pending] = { state: 'cancelled', error };
                await onItemSettled?.({ index: pending, state: 'cancelled', error, source: 'frontend' });
            }
            break;
        }
        try {
            const base64 = await enqueueImageRequest(
                () => executePreparedNovelRequest(prepared[index], requestConfig, signal),
                {
                    signal,
                    batchKey: queueBatch,
                    onQueued: data => onStateChange?.('queued', { current: index + 1, total: prepared.length, ...data }),
                    onStart: () => onStateChange?.('progress', { current: index + 1, total: prepared.length }),
                    onCooldown: data => {
                        if (index + 1 >= prepared.length) return;
                        onStateChange?.('cooldown', {
                            duration: data.duration,
                            cooldownUntil: Date.now() + data.duration,
                            nextIndex: index + 2,
                            total: prepared.length,
                        });
                    },
                },
            );
            await onItemReady?.({ index, base64 });
            outcomes[index] = { state: 'ready', base64 };
        } catch (error) {
            const normalized = signal?.aborted
                ? new NovelDrawError('已取消', ErrorType.ABORTED)
                : handleFetchError(error);
            const state = signal?.aborted ? 'cancelled' : 'failed';
            outcomes[index] = { state, error: normalized };
            await onItemSettled?.({ index, state, error: normalized, source: 'frontend' });
        }
    }
    return { mode: requestConfig.sendMode, outcomes, aborted: signal?.aborted === true };
}

async function generateNovelImage({ scene, characterPrompts, negativePrompt, params, generationConfig, signal, queueBatch, onQueueStateChange }) {
    let image = null;
    let failure = null;
    const monitorGeneration = backendJobMonitors.captureGeneration();
    await runNovelImageBatch({
        requests: [{ scene, characterPrompts, negativePrompt, params }],
        generationConfig,
        signal,
        monitorGeneration,
        queueBatch,
        onStateChange: (state, data) => {
            if (state === 'progress') onQueueStateChange?.('start', data);
            else onQueueStateChange?.(state, data);
        },
        onItemReady: ({ base64 }) => { image = base64; },
        onItemSettled: ({ error }) => { failure = error; },
    });
    if (image) return image;
    throw failure || new NovelDrawError('NovelAI 未返回图片', ErrorType.UNKNOWN);
}

// ═══════════════════════════════════════════════════════════════════════════
// 图片渲染
// ═══════════════════════════════════════════════════════════════════════════

function buildImageHtml({ slotId, imgId, url, tags, positive, messageId, state = ImageState.PREVIEW, historyCount = 1, currentIndex = 0 }) {
    const escapedTags = escapeHtml(tags);
    const escapedPositive = escapeHtml(positive);
    const isPreview = state === ImageState.PREVIEW;
    const isBusy = state === ImageState.SAVING || state === ImageState.REFRESHING;

    let indicator = '';
    if (state === ImageState.SAVING) indicator = '<div class="xb-nd-indicator">💾 保存中...</div>';
    else if (state === ImageState.REFRESHING) indicator = '<div class="xb-nd-indicator">🔄 生成中...</div>';

    const border = isPreview ? 'border:1px dashed rgba(255,152,0,0.35);' : '';
    const lazyAttr = url.startsWith('data:') ? '' : 'loading="lazy"';
    const displayVersion = historyCount - currentIndex;

    const navPill = `<div class="xb-nd-nav-pill" data-total="${historyCount}" data-current="${currentIndex}">
        <button class="xb-nd-nav-arrow" data-action="nav-prev" title="上一版本" ${currentIndex >= historyCount - 1 ? 'disabled' : ''}>‹</button>
        <span class="xb-nd-nav-text">${displayVersion} / ${historyCount}</span>
        <button class="xb-nd-nav-arrow" data-action="nav-next" title="${currentIndex === 0 ? '重新生成' : '下一版本'}">›</button>
    </div>`;
    const menuBusy = isBusy ? ' busy' : '';
    const menuHtml = `<div class="xb-nd-menu-wrap${menuBusy}">
        <button class="xb-nd-menu-trigger" data-action="toggle-menu" title="操作">⋮</button>
        <div class="xb-nd-dropdown">
            ${isPreview ? '<button data-action="save-image" title="保存到服务器">⬇</button>' : ''}
            <button data-action="refresh-image" title="重新生成">⟳</button>
            <button data-action="edit-tags" title="编辑TAG">✐️</button>
            <button data-action="delete-image" title="删除">✕</button>
        </div>
    </div>`;

    return `<div class="xb-nd-img ${isBusy ? 'busy' : ''}" data-slot-id="${slotId}" data-img-id="${imgId}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="${state}" data-current-index="${currentIndex}" data-history-count="${historyCount}" style="margin:0.8em auto;position:relative;display:block;width:fit-content;max-width:100%;${border}border-radius:14px;padding:4px;">
${indicator}
<div class="xb-nd-img-wrap" data-total="${historyCount}">
    <img src="${escapeHtml(url)}" style="max-width:100%;width:auto;height:auto;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);${isBusy ? 'opacity:0.5;' : ''}" data-action="open-gallery" ${lazyAttr}>
    ${navPill}
</div>
${menuHtml}
<div class="xb-nd-edit" style="display:none;position:absolute;bottom:8px;left:8px;right:8px;background:rgba(0,0,0,0.9);border-radius:10px;padding:10px;text-align:left;z-index:15;">
    <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px;">编辑 TAG（场景描述）</div>
    <textarea class="xb-nd-edit-input">${escapedTags}</textarea>
    <div style="display:flex;gap:6px;margin-top:8px;">
        <button data-action="save-tags" style="flex:1;padding:6px 12px;background:rgba(212,165,116,0.3);border:1px solid rgba(212,165,116,0.5);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">保存 TAG</button>
        <button data-action="cancel-edit" style="padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">取消</button>
    </div>
</div>
</div>`;
}

function buildFailedPlaceholderHtml({ slotId, messageId, tags, positive, errorType, errorMessage }) {
    const escapedTags = escapeHtml(tags);
    const escapedPositive = escapeHtml(positive);
    return `<div class="xb-nd-img" data-slot-id="${slotId}" data-tags="${escapedTags}" data-positive="${escapedPositive}" data-mesid="${messageId}" data-state="failed" style="margin:0.8em 0;text-align:center;position:relative;display:block;width:100%;border:1px dashed rgba(248,113,113,0.5);border-radius:14px;padding:20px;background:rgba(248,113,113,0.05);">
<div class="xb-nd-failed-icon">⚠️</div>
<div class="xb-nd-failed-title">${escapeHtml(errorType || '生成失败')}</div>
<div class="xb-nd-failed-desc">${escapeHtml(errorMessage || '点击重试')}</div>
<div class="xb-nd-failed-btns">
    <button class="xb-nd-retry-btn" data-action="retry-image">⟳ 重新生成</button>
    <button class="xb-nd-edit-btn" data-action="edit-tags">✐ 编辑TAG</button>
    <button class="xb-nd-remove-btn" data-action="remove-placeholder">✕ 移除</button>
</div>
<div class="xb-nd-edit" style="display:none;margin-top:12px;text-align:left;">
    <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:6px;">编辑 TAG（场景描述）</div>
    <textarea class="xb-nd-edit-input">${escapedTags}</textarea>
    <div style="display:flex;gap:6px;margin-top:8px;">
        <button data-action="save-tags-retry" style="flex:1;padding:6px 12px;background:rgba(212,165,116,0.3);border:1px solid rgba(212,165,116,0.5);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">保存并重试</button>
        <button data-action="cancel-edit" style="padding:6px 12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:6px;color:#fff;font-size:12px;cursor:pointer;">取消</button>
    </div>
</div>
</div>`;
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
            dropdown.insertAdjacentHTML('afterbegin', `<button data-action="save-image" title="保存到服务器">💾</button>`);
        } else if (state !== ImageState.PREVIEW && saveItem) {
            saveItem.remove();
        }
    }

    container.querySelector('.xb-nd-indicator')?.remove();
    if (state === ImageState.SAVING) container.insertAdjacentHTML('afterbegin', '<div class="xb-nd-indicator">💾 保存中...</div>');
    else if (state === ImageState.REFRESHING) container.insertAdjacentHTML('afterbegin', '<div class="xb-nd-indicator">🔄 生成中...</div>');
}

// ═══════════════════════════════════════════════════════════════════════════
// 图片导航
// ═══════════════════════════════════════════════════════════════════════════

async function navigateToImage(container, targetIndex) {
    const slotId = container.dataset.slotId;
    const historyCount = parseInt(container.dataset.historyCount) || 1;
    const currentIndex = parseInt(container.dataset.currentIndex) || 0;

    if (targetIndex < 0 || targetIndex >= historyCount || targetIndex === currentIndex) return;

    const previews = await getPreviewsBySlot(slotId);
    const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
    if (targetIndex >= successPreviews.length) return;

    const targetPreview = successPreviews[targetIndex];
    if (!targetPreview) return;

    const imgEl = container.querySelector('.xb-nd-img-wrap > img');
    if (!imgEl) return;

    const direction = targetIndex > currentIndex ? 'left' : 'right';
    imgEl.classList.add(`sliding-${direction}`);
    setTimeout(() => {
        void preloadPreviewDisplayUrl(targetPreview).catch(() => false);
    }, 0);

    await new Promise(r => setTimeout(r, 200));

    const newUrl = getPreviewDisplayUrl(targetPreview);
    imgEl.src = newUrl;
    container.dataset.imgId = targetPreview.imgId;
    container.dataset.tags = escapeHtml(targetPreview.tags || '');
    container.dataset.positive = escapeHtml(targetPreview.positive || '');
    container.dataset.currentIndex = targetIndex;

    setImageState(container, targetPreview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
    updateNavControls(container, targetIndex, historyCount);
    void warmSlotPreviewNeighbors(slotId, targetIndex).catch(() => {});
    await setSlotSelection(slotId, targetPreview.imgId);
    if (targetPreview.savedUrl) {
        const messageId = parseInt(container.dataset.mesid);
        void syncNovelDrawSavedFromPreview(messageId, targetPreview, { slotId }).catch(() => {});
    } else {
        const messageId = parseInt(container.dataset.mesid);
        void clearNovelDrawSavedEntry(messageId, slotId).catch(() => {});
    }

    imgEl.classList.remove(`sliding-${direction}`);
    imgEl.classList.add(`sliding-in-${direction === 'left' ? 'left' : 'right'}`);

    await new Promise(r => setTimeout(r, 250));
    imgEl.classList.remove('sliding-in-left', 'sliding-in-right');
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

// ═══════════════════════════════════════════════════════════════════════════
// 触摸滑动
// ═══════════════════════════════════════════════════════════════════════════

function handleTouchStart(e) {
    const wrap = e.target.closest('.xb-nd-img-wrap');
    if (!wrap) return;
    const total = parseInt(wrap.dataset.total) || 1;
    if (total <= 1) return;
    const touch = e.touches[0];
    touchState = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        wrap,
        container: wrap.closest('.xb-nd-img'),
        moved: false
    };
}

function handleTouchMove(e) {
    if (!touchState) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchState.startX;
    const dy = touch.clientY - touchState.startY;
    if (!touchState.moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        touchState.moved = true;
        e.preventDefault();
    }
    if (touchState.moved) e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchState || !touchState.moved) { touchState = null; return; }
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchState.startX;
    const dt = Date.now() - touchState.startTime;
    const { container } = touchState;
    const currentIndex = parseInt(container.dataset.currentIndex) || 0;
    const historyCount = parseInt(container.dataset.historyCount) || 1;
    const isSwipe = Math.abs(dx) > 50 || (Math.abs(dx) > 30 && dt < 300);
    if (isSwipe) {
        if (dx < 0 && currentIndex < historyCount - 1) navigateToImage(container, currentIndex + 1);
        else if (dx > 0 && currentIndex > 0) navigateToImage(container, currentIndex - 1);
    }
    touchState = null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 事件委托与图片操作
// ═══════════════════════════════════════════════════════════════════════════

async function handleDelegatedClick(e) {
    const container = e.target.closest('.xb-nd-img');
    if (!container) {
        if (document.querySelector('.xb-nd-menu-wrap.open')) {
            const clickedMenuWrap = e.target.closest('.xb-nd-menu-wrap');
            if (!clickedMenuWrap) {
                document.querySelectorAll('.xb-nd-menu-wrap.open').forEach(w => w.classList.remove('open'));
            }
        }
        return;
    }

    const actionEl = e.target.closest('[data-action]');
    const action = actionEl?.dataset?.action;
    if (!action) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    switch (action) {
        case 'toggle-menu': {
            const wrap = container.querySelector('.xb-nd-menu-wrap');
            if (!wrap) break;
            document.querySelectorAll('.xb-nd-menu-wrap.open').forEach(w => {
                if (w !== wrap) w.classList.remove('open');
            });
            wrap.classList.toggle('open');
            break;
        }
        case 'open-gallery':
            await handleImageClick(container);
            break;
        case 'refresh-image':
            container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
            await refreshSingleImage(container);
            break;
        case 'save-image':
            container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
            await saveSingleImage(container);
            break;
        case 'edit-tags':
            container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
            toggleEditPanel(container, true);
            break;
        case 'save-tags':
            await saveEditedTags(container);
            break;
        case 'cancel-edit':
            toggleEditPanel(container, false);
            break;
        case 'retry-image':
            await retryFailedImage(container);
            break;
        case 'save-tags-retry':
            await saveTagsAndRetry(container);
            break;
        case 'remove-placeholder':
            await removePlaceholder(container);
            break;
        case 'delete-image':
            container.querySelector('.xb-nd-menu-wrap')?.classList.remove('open');
            await deleteCurrentImage(container);
            break;
        case 'nav-prev': {
            const i = parseInt(container.dataset.currentIndex) || 0;
            const t = parseInt(container.dataset.historyCount) || 1;
            if (i < t - 1) await navigateToImage(container, i + 1);
            break;
        }
        case 'nav-next': {
            const i = parseInt(container.dataset.currentIndex) || 0;
            if (i > 0) await navigateToImage(container, i - 1);
            else await refreshSingleImage(container);
            break;
        }
    }
}

function setupEventDelegation() {
    if (window._xbNovelEventsBound) return;
    window._xbNovelEventsBound = true;

    document.addEventListener('click', handleDelegatedClick, { capture: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
}

async function handleImageClick(container) {
    const slotId = container.dataset.slotId;
    const messageId = parseInt(container.dataset.mesid);
    await openGallery(slotId, messageId, {
        onUse: (sid, msgId, selected, historyCount) => {
            const cont = document.querySelector(`.xb-nd-img[data-slot-id="${sid}"]`);
            if (cont) {
                cont.querySelector('img').src = getPreviewDisplayUrl(selected);
                cont.dataset.imgId = selected.imgId;
                cont.dataset.tags = escapeHtml(selected.tags || '');
                cont.dataset.positive = escapeHtml(selected.positive || '');
                setImageState(cont, selected.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
                updateNavControls(cont, 0, historyCount);
                cont.dataset.currentIndex = '0';
                cont.dataset.historyCount = String(historyCount);
            }
            if (selected?.savedUrl) {
                void syncNovelDrawSavedFromPreview(msgId, selected, { slotId: sid }).catch(() => {});
            } else {
                void clearNovelDrawSavedEntry(msgId, sid).catch(() => {});
            }
        },
        onSave: (imgId, url) => {
            const cont = document.querySelector(`.xb-nd-img[data-img-id="${imgId}"]`);
            if (cont) {
                cont.querySelector('img').src = url;
                setImageState(cont, ImageState.SAVED);
            }
            void getPreview(imgId)
                .then(preview => preview && syncNovelDrawSavedFromPreview(messageId, preview, { savedUrl: url }))
                .catch(e => {
                    console.warn('[NovelDraw] 保存后的楼层持久化失败:', e);
                });
        },
        onDelete: async (sid, deletedImgId, remainingPreviews) => {
            const cont = document.querySelector(`.xb-nd-img[data-slot-id="${sid}"]`);
            if (cont && cont.dataset.imgId === deletedImgId && remainingPreviews.length > 0) {
                const latest = remainingPreviews[0];
                cont.querySelector('img').src = getPreviewDisplayUrl(latest);
                cont.dataset.imgId = latest.imgId;
                setImageState(cont, latest.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
            }
            if (cont) {
                cont.dataset.historyCount = String(remainingPreviews.length);
                updateNavControls(cont, 0, remainingPreviews.length);
            }
            void syncNovelDrawSavedAfterDeletion(messageId, sid, deletedImgId, remainingPreviews).catch(() => {});
        },
        onBecameEmpty: (sid, msgId, lastImageInfo) => {
            const cont = document.querySelector(`.xb-nd-img[data-slot-id="${sid}"]`);
            if (!cont) return;
            const failedHtml = buildFailedPlaceholderHtml({
                slotId: sid,
                messageId: msgId,
                tags: lastImageInfo.tags || '',
                positive: lastImageInfo.positive || '',
                errorType: '图片已删除',
                errorMessage: '点击重试可重新生成'
            });
            // Template-only UI markup built locally.
            // eslint-disable-next-line no-unsanitized/property
            cont.outerHTML = failedHtml;
            void clearNovelDrawSavedEntry(msgId, sid).catch(() => {});
        },
    });
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
        const imgId = container.dataset.imgId;
        const currentTags = container.dataset.tags || '';

        let preview = null;
        if (imgId) {
            try { preview = await getPreview(imgId); } catch {}
        }

        if (origLabel) origLabel.style.display = 'none';
        if (origTextarea) origTextarea.style.display = 'none';

        let scrollWrap = editPanel.querySelector('.xb-nd-edit-scroll');
        if (!scrollWrap) {
            scrollWrap = document.createElement('div');
            scrollWrap.className = 'xb-nd-edit-scroll';
            editPanel.insertBefore(scrollWrap, editPanel.firstChild);
        }

        let html = `
            <div class="xb-nd-edit-group">
                <div class="xb-nd-edit-group-label">🎬 场景</div>
                <textarea class="xb-nd-edit-input" data-type="scene">${escapeHtml(currentTags)}</textarea>
            </div>`;

        if (preview?.characterPrompts?.length > 0) {
            preview.characterPrompts.forEach((char, i) => {
                const name = char.name || `角色 ${i + 1}`;
                html += `
                <div class="xb-nd-edit-group">
                    <div class="xb-nd-edit-group-label">👤 ${escapeHtml(name)}</div>
                    <textarea class="xb-nd-edit-input" data-type="char" data-index="${i}">${escapeHtml(char.prompt || '')}</textarea>
                </div>`;
            });
        }

        // Escaped data used in template.
        // eslint-disable-next-line no-unsanitized/property
        scrollWrap.innerHTML = html;
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
    const slotId = container.dataset.slotId;
    const messageId = parseInt(container.dataset.mesid);
    const editPanel = container.querySelector('.xb-nd-edit');

    if (!editPanel) return;

    const sceneInput = editPanel.querySelector('textarea[data-type="scene"]');
    if (!sceneInput) return;

    const newSceneTags = sceneInput.value.trim();
    if (!newSceneTags) {
        alert('场景 TAG 不能为空');
        return;
    }

    let originalPreview = null;
    try {
        originalPreview = await getPreview(imgId);
    } catch (e) {
        console.error('[NovelDraw] 获取原始预览失败:', e);
    }

    const charInputs = editPanel.querySelectorAll('textarea[data-type="char"]');
    let newCharPrompts = null;

    if (charInputs.length > 0 && originalPreview?.characterPrompts?.length > 0) {
        newCharPrompts = [];
        charInputs.forEach(input => {
            const index = parseInt(input.dataset.index);
            const newPrompt = input.value.trim();

            if (originalPreview.characterPrompts[index]) {
                newCharPrompts.push({
                    ...originalPreview.characterPrompts[index],
                    prompt: newPrompt
                });
            }
        });
    }

    container.dataset.tags = newSceneTags;

    if (originalPreview) {
        const preset = getActiveParamsPreset();
        const newPositive = joinTags(preset?.positivePrefix, newSceneTags);

        await storePreview({
            imgId,
            slotId: originalPreview.slotId || slotId,
            messageId,
            base64: originalPreview.base64,
            tags: newSceneTags,
            positive: newPositive,
            savedUrl: originalPreview.savedUrl,
            characterPrompts: newCharPrompts || originalPreview.characterPrompts,
            negativePrompt: originalPreview.negativePrompt,
        });

        if (originalPreview.savedUrl) {
            await syncNovelDrawSavedFromPreview(messageId, { ...originalPreview, tags: newSceneTags, positive: newPositive }, { slotId: originalPreview.slotId || slotId });
        }

        container.dataset.positive = escapeHtml(newPositive);
    }

    toggleEditPanel(container, false);

    const charCount = newCharPrompts?.length || 0;
    const msg = charCount > 0
        ? `TAG 已保存 (场景 + ${charCount} 个角色)`
        : 'TAG 已保存';
    showToast(msg);
}

async function refreshSingleImage(container) {
    const tags = container.dataset.tags;
    const currentState = container.dataset.state;
    const slotId = container.dataset.slotId;
    const messageId = parseInt(container.dataset.mesid);
    const currentImgId = container.dataset.imgId;
    const sourceContext = getContext();
    const galleryMeta = {
        chatId: String(sourceContext.chatId || sourceContext.characterId || 'unknown'),
        characterName: getChatCharacterName(),
    };
    const sourceMessage = sourceContext.chat?.[messageId];
    let job = null;

    if (!tags || currentState === ImageState.SAVING || currentState === ImageState.REFRESHING || !slotId) return;

    toggleEditPanel(container, false);
    setImageState(container, ImageState.REFRESHING);

    try {
        job = createGenerationJob(`slot:${slotId}`);
        const preset = getActiveParamsPreset();
        const settings = getRuntimeSettings();

        let characterPrompts = null;
        let negativePrompt = preset.negativePrefix || '';

        if (currentImgId) {
            const existingPreview = await getPreview(currentImgId);
            if (existingPreview?.chatId) galleryMeta.chatId = existingPreview.chatId;
            if (existingPreview?.characterName) galleryMeta.characterName = existingPreview.characterName;
            if (existingPreview?.characterPrompts?.length) {
                characterPrompts = existingPreview.characterPrompts;
            }
            if (existingPreview?.negativePrompt) {
                negativePrompt = existingPreview.negativePrompt;
            }
        }

        if (!characterPrompts) {
            const message = sourceContext.chat?.[messageId];
            const presentCharacters = detectPresentCharacters(String(message?.mes || ''), settings.characterTags || []);
            characterPrompts = presentCharacters.map(c => ({
                prompt: buildKnownCharacterPrompt(c),
                uc: c.negativeTags || '',
                center: { x: 0.5, y: 0.5 }
            }));
        }

        const scene = joinTags(preset.positivePrefix, tags);

        const base64 = await generateNovelImage({
            scene,
            characterPrompts,
            negativePrompt,
            params: preset.params || {},
            signal: job.controller.signal,
        });

        const newImgId = generateImgId();
        await storePreview({
            ...galleryMeta,
            imgId: newImgId,
            slotId,
            messageId,
            base64,
            tags,
            positive: scene,
            characterPrompts,
            negativePrompt,
        });
        await setSlotSelection(slotId, newImgId);
        const currentContext = getContext();
        const stillAttached = currentContext.chatId === sourceContext.chatId
            && currentContext.chat?.[messageId] === sourceMessage;
        if (!stillAttached) {
            showToast('聊天已切换，新图片已保留在画廊中', 'info', 5000);
            return;
        }
        await clearNovelDrawSavedEntry(messageId, slotId).catch(() => {});

        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
        const activeContainer = getMesTextElement(messageId)?.querySelector(buildDrawSlotSelector(slotId));
        if (activeContainer) {
            activeContainer.querySelector('img').src = getPreviewDisplayUrl({ imgId: newImgId, base64 });
            activeContainer.dataset.imgId = newImgId;
            activeContainer.dataset.positive = escapeHtml(scene);
            activeContainer.dataset.currentIndex = '0';
            activeContainer.dataset.historyCount = String(successPreviews.length);
            setImageState(activeContainer, ImageState.PREVIEW);
            updateNavControls(activeContainer, 0, successPreviews.length);
        }

        showToast(`图片已刷新（共 ${successPreviews.length} 个版本）`);
    } catch (e) {
        console.error('[NovelDraw] 刷新失败:', e);
        const currentContext = getContext();
        const stillAttached = currentContext.chatId === sourceContext.chatId
            && currentContext.chat?.[messageId] === sourceMessage;
        if (stillAttached) {
            alert('刷新失败: ' + e.message);
            const activeContainer = getMesTextElement(messageId)?.querySelector(buildDrawSlotSelector(slotId));
            if (activeContainer) setImageState(activeContainer, ImageState.PREVIEW);
        }
    } finally {
        releaseGenerationJob(job);
    }
}

async function saveSingleImage(container) {
    const imgId = container.dataset.imgId;
    const slotId = container.dataset.slotId;
    const currentState = container.dataset.state;
    if (currentState !== ImageState.PREVIEW) return;
    const messageId = parseInt(container.dataset.mesid);
    const preview = await getPreview(imgId);
    if (!preview?.base64) { alert('图片数据丢失，请刷新'); return; }
    setImageState(container, ImageState.SAVING);
    try {
        const charName = preview.characterName || getChatCharacterName();
        const image = getBase64ImagePayload(preview.base64);
        const url = await saveBase64AsFile(image.base64, charName, `novel_${imgId}`, image.format);
        preview.savedUrl = url;
        await updatePreviewSavedUrl(imgId, url);
        await setSlotSelection(slotId, imgId);
        await syncNovelDrawSavedFromPreview(messageId, preview, { slotId, savedUrl: url });
        container.querySelector('img').src = url;
        setImageState(container, ImageState.SAVED);
        container.dataset.imgId = preview.imgId;
        showToast(`已保存到: ${url}`, 'success', 5000);
    } catch (e) {
        console.error('[NovelDraw] 保存失败:', e);
        alert('保存失败: ' + e.message);
        setImageState(container, ImageState.PREVIEW);
    }
}

async function deleteCurrentImage(container) {
    const imgId = container.dataset.imgId;
    const slotId = container.dataset.slotId;
    const messageId = parseInt(container.dataset.mesid);
    const tags = container.dataset.tags || '';
    const positive = container.dataset.positive || '';

    if (!confirm('确定删除这张图片吗？')) return;

    try {
        await deletePreview(imgId);
        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));

        if (successPreviews.length > 0) {
            const latest = successPreviews[0];
            await setSlotSelection(slotId, latest.imgId);
            container.querySelector('img').src = getPreviewDisplayUrl(latest);
            container.dataset.imgId = latest.imgId;
            container.dataset.tags = escapeHtml(latest.tags || '');
            container.dataset.positive = escapeHtml(latest.positive || '');
            container.dataset.currentIndex = '0';
            container.dataset.historyCount = String(successPreviews.length);
            setImageState(container, latest.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
            updateNavControls(container, 0, successPreviews.length);
            await syncNovelDrawSavedAfterDeletion(messageId, slotId, imgId, successPreviews);
            showToast(`已删除（剩余 ${successPreviews.length} 张）`);
        } else {
            await clearSlotSelection(slotId);
            await clearNovelDrawSavedEntry(messageId, slotId);
            const failedHtml = buildFailedPlaceholderHtml({
                slotId,
                messageId,
                tags,
                positive,
                errorType: '图片已删除',
                errorMessage: '点击重试可重新生成'
            });
            // Template-only UI markup built locally.
            // eslint-disable-next-line no-unsanitized/property
            container.outerHTML = failedHtml;
            showToast('图片已删除，占位符已保留');
        }
    } catch (e) {
        console.error('[NovelDraw] 删除失败:', e);
        showToast('删除失败: ' + e.message, 'error');
    }
}

async function retryFailedImage(container) {
    const slotId = container.dataset.slotId;
    const messageId = parseInt(container.dataset.mesid);
    const tags = container.dataset.tags;
    let latestFailed = null;
    const sourceContext = getContext();
    const sourceMessage = sourceContext.chat?.[messageId];
    const galleryMeta = {
        chatId: String(sourceContext.chatId || sourceContext.characterId || 'unknown'),
        characterName: getChatCharacterName(),
    };
    let job = null;
    if (!slotId) return;

    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    container.innerHTML = `<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.6);"><div style="font-size:24px;margin-bottom:8px;">🎨</div><div>生成中...</div></div>`;

    try {
        job = createGenerationJob(`slot:${slotId}`);
        const preset = getActiveParamsPreset();
        const settings = getRuntimeSettings();
        const scene = tags ? joinTags(preset.positivePrefix, tags) : preset.positivePrefix;
        const negativePrompt = preset.negativePrefix || '';

        let characterPrompts = null;
        const failedPreviews = await getPreviewsBySlot(slotId);
        latestFailed = failedPreviews.find(p => p.status === 'failed');
        if (latestFailed?.chatId) galleryMeta.chatId = latestFailed.chatId;
        if (latestFailed?.characterName) galleryMeta.characterName = latestFailed.characterName;
        if (latestFailed?.characterPrompts?.length) {
            characterPrompts = latestFailed.characterPrompts;
        }

        if (!characterPrompts) {
            const message = sourceContext.chat?.[messageId];
            const presentCharacters = detectPresentCharacters(String(message?.mes || ''), settings.characterTags || []);
            characterPrompts = presentCharacters.map(c => ({
                prompt: buildKnownCharacterPrompt(c),
                uc: c.negativeTags || '',
                center: { x: 0.5, y: 0.5 }
            }));
        }

        const base64 = await generateNovelImage({
            scene,
            characterPrompts,
            negativePrompt,
            params: preset.params || {},
            signal: job.controller.signal,
        });

        const newImgId = generateImgId();
        await storePreview({
            ...galleryMeta,
            imgId: newImgId,
            slotId,
            messageId,
            base64,
            tags: tags || '',
            positive: scene,
            characterPrompts,
            negativePrompt,
        });
        await deleteFailedRecordsForSlot(slotId);
        await setSlotSelection(slotId, newImgId);

        const currentContext = getContext();
        const stillAttached = currentContext.chatId === sourceContext.chatId
            && currentContext.chat?.[messageId] === sourceMessage;
        if (!stillAttached) {
            showToast('聊天已切换，新图片已保留在画廊中', 'info', 5000);
            return;
        }

        const imgHtml = buildImageHtml({
            slotId,
            imgId: newImgId,
            url: getPreviewDisplayUrl({ imgId: newImgId, base64 }),
            tags: tags || '',
            positive: scene,
            messageId,
            state: ImageState.PREVIEW,
            historyCount: 1,
            currentIndex: 0
        });
        const activeContainer = getMesTextElement(messageId)?.querySelector(buildDrawSlotSelector(slotId));
        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        if (activeContainer) activeContainer.outerHTML = imgHtml;
        showToast('图片生成成功！');
    } catch (e) {
        console.error('[NovelDraw] 重试失败:', e);
        const errorType = classifyError(e);
        await storeFailedPlaceholder({
            ...galleryMeta,
            slotId,
            messageId,
            tags: tags || '',
            positive: container.dataset.positive || '',
            errorType: errorType.code,
            errorMessage: errorType.desc
        });
        const currentContext = getContext();
        const stillAttached = currentContext.chatId === sourceContext.chatId
            && currentContext.chat?.[messageId] === sourceMessage;
        if (!stillAttached) return;
        const activeContainer = getMesTextElement(messageId)?.querySelector(buildDrawSlotSelector(slotId));
        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        if (activeContainer) activeContainer.outerHTML = buildFailedPlaceholderHtml({
            slotId,
            messageId,
            tags: tags || '',
            positive: container.dataset.positive || '',
            errorType: errorType.label,
            errorMessage: errorType.desc
        });
        showToast(`重试失败: ${errorType.desc}`, 'error');
    } finally {
        releaseGenerationJob(job);
    }
}

async function saveTagsAndRetry(container) {
    const textarea = container.querySelector('.xb-nd-edit-input');
    if (!textarea) return;
    const newTags = textarea.value.trim();
    if (!newTags) { alert('TAG 不能为空'); return; }
    container.dataset.tags = newTags;
    const preset = getActiveParamsPreset();
    container.dataset.positive = escapeHtml(joinTags(preset?.positivePrefix, newTags));
    toggleEditPanel(container, false);
    await retryFailedImage(container);
}

async function removePlaceholder(container) {
    const slotId = container.dataset.slotId;
    const messageId = parseInt(container.dataset.mesid);
    if (!confirm('确定移除此占位符？')) return;
    await deleteFailedRecordsForSlot(slotId);
    await clearSlotSelection(slotId);
    await clearNovelDrawSavedEntry(messageId, slotId);
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (message) message.mes = removeSceneSlotPlaceholders(message.mes, [slotId]);
    container.remove();
    await persistChatSilently();
    showToast('占位符已移除');
}

function notifyNovelDrawAfterAi(data, source) {
    const context = getContext();
    const chatId = String(context?.chatId || '');
    const chat = context?.chat || [];
    if (!chatId || !chat.length) return;

    const messageId = source === 'generation_ended'
        ? (chat.length - 1)
        : (typeof data === 'number' ? data : data?.messageId ?? data?.mesId);
    if (!Number.isFinite(messageId) || messageId < 0) return;

    const message = chat[messageId];
    if (!message || message.is_user) return;

    notifyAfterAiHint({
        chatId,
        messageId,
        source,
        kind: MODULE_KEY,
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 多图生成
// ═══════════════════════════════════════════════════════════════════════════

function buildTextSourceGalleryMeta(options = {}) {
    const source = String(options.source || '').trim();
    if (source === 'ebook') {
        const bookId = String(options.bookId || '').trim();
        const bookTitle = String(options.bookTitle || options.title || '未命名书稿').trim() || '未命名书稿';
        const chapterPath = String(options.chapterPath || '').trim();
        const chapterTitle = String(options.chapterTitle || options.title || chapterPath || '章节').trim() || '章节';
        return {
            source,
            bookId,
            bookTitle,
            chapterPath,
            chapterTitle,
            chatId: bookId ? `ebook:${bookId}` : 'ebook',
            characterName: `电纸书 / ${bookTitle}`,
            messageId: `ebook:${bookId || 'unknown'}:${chapterPath || chapterTitle}`,
        };
    }
    if (source === 'tavern') {
        const sessionId = String(options.sessionId || '').trim();
        const messageOrder = Number.isFinite(Number(options.messageOrder))
            ? Math.max(0, Math.floor(Number(options.messageOrder)))
            : null;
        const role = String(options.role || options.title || 'assistant').trim() || 'assistant';
        return {
            source,
            chatId: sessionId || 'tavern',
            characterName: String(options.characterName || '小白酒馆').trim() || '小白酒馆',
            messageId: sessionId
                ? `tavern:${sessionId}:${messageOrder ?? role}`
                : `tavern:${messageOrder ?? role}`,
        };
    }
    const context = getContext();
    return {
        chatId: String(options.chatId || context.chatId || context.characterId || 'unknown'),
        characterName: String(options.characterName || getChatCharacterName()),
    };
}

async function maybeAutoLearnFromTasks(tasks = [], settings = {}) {
    if (!settings.autoLearnCharacters) return;
    try {
        const tagsCopy = JSON.parse(JSON.stringify(settings.characterTags || []));
        const settingsCopy = { ...settings, characterTags: tagsCopy };
        const learnResult = autoLearnFromTasks(tasks, settingsCopy);
        if (learnResult.newChars.length || learnResult.updatedChars.length) {
            const parts = [];
            if (learnResult.newChars.length) parts.push(`新角色: ${learnResult.newChars.join(', ')}`);
            if (learnResult.updatedChars.length) parts.push(`更新: ${learnResult.updatedChars.join(', ')}`);
            const msg = `已学习 ${parts.join(' | ')}`;
            const ok = await updateSharedSettingsPersistent((draft) => {
                draft.characterTags = tagsCopy;
            }, msg);
            if (ok && overlayCreated && frameReady) sendInitData();
        }
    } catch (e) {
        console.warn('[NovelDraw] 自动学习角色失败:', e);
    }
}

// 后台 Planner 的角色事实随 handoff 进入短生命周期 journal。接管转 active 前
// 在浏览器侧复用原有学习逻辑；该逻辑只新增角色/补空字段，重复执行保持幂等。
export async function applyNovelDrawRunAutoLearn(record = {}) {
    const metadata = (Array.isArray(record.items) ? record.items : [])
        .map(item => item.previewMetadata?.providerMetadata)
        .find(value => Array.isArray(value?.autoLearnCharacters)
            && value.autoLearnCharacters.length > 0);
    if (!metadata) return;
    const tasks = (Array.isArray(record.items) ? record.items : []).map(item => ({
        chars: JSON.parse(JSON.stringify(
            Array.isArray(item.previewMetadata?.providerMetadata?.autoLearnCharacters)
                ? item.previewMetadata.providerMetadata.autoLearnCharacters
                : [],
        )),
    })).filter(task => task.chars.length > 0);
    if (tasks.length === 0) return;
    try {
        await loadSettings();
        await loadSharedDrawSettings();
        await maybeAutoLearnFromTasks(tasks, {
            ...getRuntimeSettings(),
            autoLearnCharacters: true,
            autoLearnMode: metadata.autoLearnMode,
        });
    } catch (error) {
        // 自动学习是已有的 best-effort 辅助行为，不能阻断已付费图片的接管。
        console.warn('[NovelDraw] 后台规划角色自动学习失败:', error);
    }
}

function notifySceneImageLimitAdjusted(adjustment) {
    if (adjustment?.message) toastr.info(adjustment.message, '小白X画图');
}

function notifyDetachedGeneration(successCount) {
    const count = Math.max(0, Number(successCount) || 0);
    if (count > 0) {
        toastr.info(`聊天或楼层已经变化，已生成 ${count} 张图片但未写入原楼层；可在画图设置的图片管理中查看。`, '小白X画图');
    }
}

async function buildNovelScenePlannerOptions({
    sceneSource,
    presentCharacters,
    settings,
    preset,
    signal,
    useWorldbook = true,
    onStateChange,
}) {
    let worldbookEntries = null;
    const customPrompts = getActivePromptPreset(settings) || DEFAULT_PROMPT_CONFIG;
    const model = preset.params?.model || DEFAULT_PARAMS_PRESET.params.model;
    const capability = getNovelModelCapability(model);
    if (useWorldbook && settings.worldbooks?.enabled && settings.worldbooks.uploadedBooks?.length) {
        const processor = new WorldbookProcessor();
        const charNames = presentCharacters.map(c => c.name).join(' ');
        const allEntries = settings.worldbooks.uploadedBooks.flatMap(b => b.entries || []);
        worldbookEntries = processor.processFromEntries({
            entries: allEntries,
            contextText: `${sceneSource.content} ${charNames}`,
            keywordFilterMode: settings.worldbooks.keywordFilterMode || 'auto',
        });
    }

    return {
        sceneSource,
        presentCharacters,
        useWorldInfo: useWorldbook && settings.useWorldInfo,
        customPrompts,
        promptDefaults: DEFAULT_PROMPT_CONFIG,
        worldbookEntries,
        maxImages: preset.maxImages || 0,
        maxCharactersPerImage: preset.maxCharactersPerImage || 0,
        absoluteMaxCharactersPerImage: capability.maxCharactersPerImage,
        modelGuide: getEffectiveNovelModelGuide(model, customPrompts),
        modelContract: getEffectiveNovelModelContract(model, customPrompts),
        centerMode: capability.centerMode,
        onImageLimitAdjusted: notifySceneImageLimitAdjusted,
        onDiagnosticUpdate: diagnostic => onStateChange?.('llm', toScenePlannerProgress(diagnostic)),
        signal,
    };
}

async function buildTextSourceTasks(options) {
    return generateAndParseScenePlan(await buildNovelScenePlannerOptions(options));
}

async function generateImagesFromText(options = {}) {
    const monitorGeneration = backendJobMonitors.captureGeneration();
    const text = String(options.text || '');
    if (!text.trim()) throw new NovelDrawError('正文内容为空，无法配图', ErrorType.PARSE);
    const galleryMeta = buildTextSourceGalleryMeta(options);
    const messageId = String(options.messageId || galleryMeta.messageId || `text:${Date.now()}`);
    const job = createGenerationJob(messageId);
    const forwardExternalAbort = () => {
        job.abortReason ||= 'user';
        job.backendCancel.abort();
        job.controller.abort();
    };
    options.signal?.addEventListener('abort', forwardExternalAbort, { once: true });
    if (options.signal?.aborted) forwardExternalAbort();

    try {
        await loadSettings();
        await loadSharedDrawSettings();
        ensureStyles();
        await openDB();

        const signal = job.controller.signal;
        const settings = cloneSettingsObject(getRuntimeSettings());
        const preset = cloneSettingsObject(getActiveParamsPreset());
        if (!preset) throw new NovelDrawError('无可用的 NovelAI 参数预设', ErrorType.PARSE);

        const filterRules = settings.messageFilterRules?.length
            ? settings.messageFilterRules
            : DEFAULT_MESSAGE_FILTER_RULES;
        const sceneSource = createSceneSource(text, { filterRules });
        if (!sceneSource.content) throw new NovelDrawError('正文内容为空（可能被过滤规则清空）', ErrorType.PARSE);

        const presentCharacters = detectPresentCharacters(sceneSource.content, settings.characterTags || []);
        job.phase = 'llm';
        options.onStateChange?.('llm', toScenePlannerProgress());
        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);

        let tasks = [];
        try {
            tasks = await buildTextSourceTasks({
                sceneSource,
                presentCharacters,
                settings,
                preset,
                signal,
                useWorldbook: !!options.useWorldbook,
                onStateChange: options.onStateChange,
            });
        } catch (e) {
            console.error('[NovelDraw] 文本配图场景分析失败:', e);
            if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
            throw e;
        }

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
        await maybeAutoLearnFromTasks(tasks, settings);

        const images = new Array(tasks.length);
        let successCount = 0;
        job.phase = 'gen';
        options.onStateChange?.('gen', { current: 0, total: tasks.length });

        const compiledBatch = compileNovelScenePlan(
            tasks,
            createNovelGenerationRecipe({
                settings,
                preset,
                itemCount: tasks.length,
                resolveForBackend: settings.sendMode === 'backend',
            }),
        );
        const batchItems = compiledBatch.artifacts.map(({ task, promptData }) => {
            const { scene, characterPrompts, negativePrompt } = promptData;
            return {
                task,
                slotId: generateSlotId(),
                scene,
                characterPrompts,
                tagsForStore: task.scene || '',
                negativePrompt,
                request: {
                    scene,
                    characterPrompts,
                    negativePrompt,
                    params: preset.params || {},
                },
            };
        });
        const batchResult = await runNovelImageBatch({
            requests: batchItems.map(item => item.request),
            compiledBatch,
            signal,
            monitorGeneration,
            queueBatch: job,
            onStateChange: options.onStateChange,
            onItemReady: async ({ index, base64 }) => {
                const item = batchItems[index];
                const imgId = generateImgId();
                await storePreview({
                    ...galleryMeta,
                    imgId,
                    slotId: item.slotId,
                    messageId,
                    base64,
                    tags: item.tagsForStore,
                    positive: item.scene,
                    characterPrompts: item.characterPrompts,
                    negativePrompt: item.negativePrompt,
                });
                await setSlotSelection(item.slotId, imgId);
                successCount++;
                images[index] = {
                    slotId: item.slotId,
                    imgId,
                    placement: item.task.placement,
                    tags: item.tagsForStore,
                    positive: item.scene,
                    negativePrompt: item.negativePrompt,
                    displayUrl: getPreviewDisplayUrl({ imgId, base64 }),
                    success: true,
                };
            },
            onItemSettled: async ({ index, state, error }) => {
                if (state === 'cancelled') return;
                const item = batchItems[index];
                console.error(`[NovelDraw] 文本配图 ${index + 1} 失败:`, error);
                const errorType = classifyError(error);
                await storeFailedPlaceholder({
                    ...galleryMeta,
                    slotId: item.slotId,
                    messageId,
                    tags: item.tagsForStore,
                    positive: item.scene,
                    errorType: errorType.code,
                    errorMessage: errorType.desc,
                    characterPrompts: item.characterPrompts,
                    negativePrompt: item.negativePrompt,
                });
                images[index] = {
                    slotId: item.slotId,
                    placement: item.task.placement,
                    tags: item.tagsForStore,
                    positive: item.scene,
                    negativePrompt: item.negativePrompt,
                    success: false,
                    error: errorType,
                };
            },
        });

        const aborted = signal.aborted || batchResult.aborted === true;
        options.onStateChange?.('success', { success: successCount, total: tasks.length, aborted });
        return {
            ok: true,
            source: options.source || 'text',
            success: successCount,
            total: tasks.length,
            images: images.filter(Boolean),
            sourceHash: sceneSource.sourceHash,
            aborted,
        };
    } finally {
        options.signal?.removeEventListener('abort', forwardExternalAbort);
        releaseGenerationJob(job);
    }
}

async function generateAndInsertImages({
    messageId,
    onStateChange,
    skipLock = false,
    automatic = false,
}) {
    const monitorGeneration = backendJobMonitors.captureGeneration();
    if (skipLock) {
        // 兼容旧调用：当前改为 message 级去重 + 图片请求队列，不再使用全局生成锁
    }

    const job = createGenerationJob(messageId);
    let placementLifecycle = null;

    try {
        await loadSettings();
        await loadSharedDrawSettings();
        const ctx = getContext();
        const message = ctx.chat?.[messageId];
        if (!message) throw new NovelDrawError('消息不存在', ErrorType.PARSE);

        const signal = job.controller.signal;
        const settings = cloneSettingsObject(getRuntimeSettings());
        const preset = cloneSettingsObject(getActiveParamsPreset());

        const filterRules = settings.messageFilterRules?.length
            ? settings.messageFilterRules
            : DEFAULT_MESSAGE_FILTER_RULES;
        const sceneSource = createSceneSource(
            normalizeMessageSceneSourceText(message.mes),
            { filterRules },
        );
        if (!sceneSource.content) throw new NovelDrawError('消息内容为空（可能被过滤规则清空）', ErrorType.PARSE);

        const presentCharacters = detectPresentCharacters(sceneSource.content, settings.characterTags || []);

        if (isNovelImageBackendJobEnabled(settings)) {
            job.phase = 'submitting';
            return await submitProviderDrawRun({
                ctx,
                message,
                messageId,
                provider: DRAW_RUN_PROVIDER,
                signal,
                preparePlanner: async ({ maxPlanImages }) => {
                    job.phase = 'llm';
                    return prepareScenePlannerInput({
                        ...await buildNovelScenePlannerOptions({
                            sceneSource,
                            presentCharacters,
                            settings,
                            preset,
                            signal,
                            onStateChange,
                        }),
                        maxPlanImages,
                    });
                },
                createGenerationRecipe: prepared => createNovelGenerationRecipe({
                    settings,
                    preset,
                    itemCount: prepared.planner.validationContext.maxPlanImages,
                    resolveForBackend: true,
                }),
                automatic,
                getCurrentContext: getContext,
                syncActiveSwipe: syncMesToSwipe,
                isMessageBeingEdited,
                onStateChange,
            });
        }

        job.phase = 'llm';
        onStateChange?.('llm', toScenePlannerProgress());

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);

        let tasks = [];
        try {
            tasks = await generateAndParseScenePlan(await buildNovelScenePlannerOptions({
                sceneSource,
                presentCharacters,
                settings,
                preset,
                signal,
                onStateChange,
            }));
        } catch (e) {
            console.error('[NovelDraw] 场景分析原始错误:', e);
            console.error('[NovelDraw] 错误详情:', { message: e?.message, code: e?.code, name: e?.name, stack: e?.stack });
            if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);
            throw e;
        }

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.ABORTED);

        await maybeAutoLearnFromTasks(tasks, settings);

        const initialChatId = ctx.chatId;
        const galleryMeta = {
            chatId: String(ctx.chatId || ctx.characterId || 'unknown'),
            characterName: getChatCharacterName(),
        };
        if (isMessageBeingEdited(messageId)) {
            throw new ScenePlacementError('该楼层正在编辑，请保存或取消编辑后再配图。', 'SCENE_MESSAGE_EDITING');
        }
        const originalMes = message.mes;
        const replacedSlotIds = getSceneSlotIds(originalMes);
        const slotIds = tasks.map(() => generateSlotId());
        const results = new Array(tasks.length);
        let successCount = 0;
        const strippedNow = normalizeMessageSceneSourceText(message.mes);
        assertSceneSourceUnchanged(strippedNow, sceneSource.sourceHash);
        const plannedMes = insertScenePlacementsPreservingSlots(originalMes, tasks.map((task, index) => ({
            placement: task.placement,
            content: createPlaceholder(slotIds[index]),
        })), { block: true });

        placementLifecycle = {
            message,
            originalMes,
            slotIds,
            results,
            getSuccessCount: () => successCount,
            initialChatId,
            plannedMes,
            syncRenderedMessage: null,
            settled: false,
            // 占位符是否已经提前持久化进正文。只有后台链路会置位：它必须在 POST 之前
            // 把槽位落盘，否则刷新回来图有了却无处安放。本地链路一直到最后才写正文。
            committedEarly: false,
        };

        // 前端停手 ≠ 取消后端任务。job.controller 一旦 abort，本地循环、DOM 更新全部停下；
        // 但只有用户亲手取消才允许把取消传导到后端，因为那一步会连带删掉已经生成好的结果。
        // 聊天切换、正文变化、扩展卸载都只是「这个页面不再照看它了」，任务要继续跑。
        const { messageFormatting } = await import('../../../../../../../../script.js');
        const syncRenderedMessage = async (sourceText = plannedMes) => {
            if (isMessageBeingEdited(messageId)) return;
            const formatted = messageFormatting(sourceText, message.name, message.is_system, message.is_user, messageId);
            $(`[mesid="${messageId}"] .mes_text`).html(formatted);
        };
        const renderPendingSlots = () => {
            const settledSlotIds = new Set(results.filter(Boolean).map((item) => item.slotId));
            slotIds.forEach((slotId, index) => {
                if (settledSlotIds.has(slotId)) return;
                insertPreviewIntoRenderedMessage({
                    messageId,
                    slotId,
                    html: buildPendingImageHtml({
                        slotId,
                        messageId,
                        index: index + 1,
                        total: slotIds.length,
                    }),
                });
            });
        };
        const recoverRenderedSlots = async () => {
            await syncRenderedMessage();
            renderPendingSlots();
            await renderSharedPreviewsForMessage(messageId);
        };
        placementLifecycle.syncRenderedMessage = syncRenderedMessage;
        if (message.mes !== originalMes) {
            throw new ScenePlacementError('正文在准备插图位置时发生变化，未写入图片。', 'SCENE_SOURCE_CHANGED');
        }
        await syncRenderedMessage();
        renderPendingSlots();

        job.phase = 'gen';
        onStateChange?.('gen', { current: 0, total: tasks.length });

        let requiresFinalDomSync = false;
        let terminationReason = '';
        const checkPlacementContext = () => {
            if (terminationReason) return false;
            if (!moduleInitialized) {
                terminationReason = 'detached';
                job.controller.abort();
                return false;
            }
            const currentCtx = getContext();
            if (currentCtx.chatId !== initialChatId) {
                console.warn('[NovelDraw] 聊天已切换，中止生成');
                terminationReason = 'detached';
                job.controller.abort();
                return false;
            }
            const currentMsg = currentCtx.chat?.[messageId];
            if (!placementLifecycle.committedEarly && (!currentMsg || currentMsg !== message)) {
                console.warn('[NovelDraw] 消息已删除或被替换，中止生成');
                terminationReason = 'detached';
                job.controller.abort();
                return false;
            }
            // 正文变化在两条链路上的后果完全不同，所以判断也必须不同。
            //
            // 本地链路的占位符还没落盘，最终要拿 originalMes 当基准一次性写进去，正文一变
            // 这个基准就失效了，只能停手。
            //
            // 后台链路的占位符早已落盘：正文里那些槽位是真实存在的，图回来就有地方放。
            // 此时用户改正文只说明「分析结果和新正文对不上」，不代表他不要这些图；为此
            // 中止一批已经付过钱的任务是在替他做主。每张图交付前会单独确认自己的槽位还在，
            // 用户删掉的槽位自然不会被交付，这比整批停手精确得多。
            if (isMessageBeingEdited(messageId)) {
                if (!placementLifecycle.committedEarly) {
                    console.warn('[NovelDraw] 楼层正在编辑，中止生成');
                    terminationReason = 'source_changed';
                    job.controller.abort();
                }
                return false;
            }
            if (!placementLifecycle.committedEarly && message.mes !== originalMes) {
                console.warn('[NovelDraw] 正文已变化，中止生成');
                terminationReason = 'source_changed';
                job.controller.abort();
                return false;
            }
            return true;
        };
        const renderSettledSlot = async (slotId, createHtml) => {
            if (!checkPlacementContext()) return;
            const target = placementLifecycle.committedEarly
                ? resolveDeliveryTarget(slotId)
                : { messageId, isActiveSwipe: true };
            if (!target?.isActiveSwipe) return;
            const html = typeof createHtml === 'function' ? createHtml(target.messageId) : createHtml;
            try {
                const inserted = insertPreviewIntoRenderedMessage({ messageId: target.messageId, slotId, html });
                if (!inserted) {
                    requiresFinalDomSync = true;
                    if (!placementLifecycle.committedEarly) await recoverRenderedSlots();
                }
            } catch (error) {
                requiresFinalDomSync = true;
                console.warn('[NovelDraw] 增量渲染失败, 继续生成:', error);
            }
        };
        const compiledBatch = compileNovelScenePlan(
            tasks,
            createNovelGenerationRecipe({
                settings,
                preset,
                itemCount: tasks.length,
                resolveForBackend: resolveNovelImageTransport(settings) !== 'frontend',
            }),
        );
        const batchItems = compiledBatch.artifacts.map(({ task, promptData }, index) => {
            const { scene, characterPrompts, negativePrompt } = promptData;
            return {
                task,
                slotId: slotIds[index],
                // imgId 必须在提交之前就分配好：接回时按同一个 imgId 落库，重复交付天然幂等，
                // 不会因为「已经落过一次」而在画廊里留下两张同样的图。
                imgId: generateImgId(),
                scene,
                characterPrompts,
                tagsForStore: task.scene,
                negativePrompt,
                request: {
                    scene,
                    characterPrompts,
                    negativePrompt,
                    params: preset.params || {},
                },
            };
        });

        // 后台链路的恢复记录：只记「槽位事实」，不记密钥、不记排版。
        // 排版是当前正文的属性，刷新后必须重新观察，把它冻在记录里只会覆盖用户后来的编辑。
        const recoverablePlan = {
            delivery: {
                mode: 'slots',
                chatId: String(initialChatId || ''),
                messageId: String(messageId),
            },
            replacedSlotIds,
            gallery: { ...galleryMeta, messageId: String(messageId) },
            items: batchItems.map((item, index) => ({
                index,
                slotId: item.slotId,
                imgId: item.imgId,
                previewMetadata: {
                    tags: item.tagsForStore,
                    positive: item.scene,
                    characterPrompts: item.characterPrompts,
                    negativePrompt: item.negativePrompt,
                },
            })),
        };

        // 后台链路提交前的唯一一次正文写入。
        //
        // 读取、比对、赋值三步之间不得出现 await：一旦中间让出执行权，用户的编辑就会插在
        // 「比对通过」和「写入」之间，被我们连带覆盖掉。所以严格 CAS 必须发生在真正持久化
        // 的这一刻，而不是写之前某个更早的检查点。
        const commitPlannedPlacements = async () => {
            const committed = await commitRecoverableScenePlacements({
                getCurrentChatId: () => getContext().chatId,
                getCurrentMessage: id => getContext().chat?.[id],
                expectedChatId: initialChatId,
                messageId,
                message,
                originalText: originalMes,
                plannedText: plannedMes,
                slotIds,
                isEditing: isMessageBeingEdited,
                persist: persistChatSilently,
                syncAfterRollback: async (sourceText) => {
                    await syncRenderedMessage(sourceText);
                    await renderSharedPreviewsForMessage(messageId);
                },
            });
            if (committed) placementLifecycle.committedEarly = true;
            return committed;
        };

        const resolveDeliveryTarget = (slotId) => {
            const currentCtx = getContext();
            return requireImageJobDeliveryTarget({
                currentChatId: currentCtx.chatId,
                targetChatId: initialChatId,
                chat: currentCtx.chat,
                slotId,
            });
        };
        const renderBatchPreviews = async ({ final = false } = {}) => {
            const currentCtx = getContext();
            if (String(currentCtx.chatId || '') !== String(initialChatId || '')) return;
            const messageIds = new Set();
            for (const slotId of slotIds) {
                const target = classifyImageJobDeliveryTarget({
                    currentChatId: currentCtx.chatId,
                    targetChatId: initialChatId,
                    chat: currentCtx.chat,
                    slotId,
                });
                if (target.state === ImageJobDeliveryTargetState.ALIVE && target.isActiveSwipe) {
                    messageIds.add(target.messageId);
                }
            }
            if (messageIds.size === 0) {
                const currentMessageId = currentCtx.chat?.indexOf(message) ?? -1;
                if (currentMessageId >= 0) messageIds.add(currentMessageId);
            }
            await Promise.all([...messageIds].map(currentMessageId => renderSharedPreviewsForMessage(
                currentMessageId,
                final ? { refreshSlotIds: [...new Set([...slotIds, ...replacedSlotIds])] } : undefined,
            )));
        };
        const renderRemovedTargets = async (targets, removedSlotIds) => {
            const messageIds = new Set((Array.isArray(targets) ? targets : [])
                .filter(target => target?.isActiveSwipe)
                .map(target => target.messageId));
            await Promise.all([...messageIds].map(targetMessageId => renderSharedPreviewsForMessage(
                targetMessageId,
                { refreshSlotIds: removedSlotIds },
            )));
        };

        const recordSlotFailure = async (index, error, guard = async () => {}) => {
            const item = batchItems[index];
            if (!item || results[index]) return null;
            console.error(`[NovelDraw] 图${index + 1} 失败:`, error?.message || error);
            const errorType = classifyError(error);
            const failedImgId = `failed-${item.imgId}`;
            const committed = await commitSceneSlotDelivery({
                committedEarly: placementLifecycle.committedEarly,
                resolveTarget: () => resolveDeliveryTarget(item.slotId),
                guard,
                persist: target => storeFailedPlaceholder({
                    ...galleryMeta,
                    imgId: failedImgId,
                    slotId: item.slotId,
                    messageId: target?.messageId ?? messageId,
                    tags: item.tagsForStore,
                    positive: item.scene,
                    errorType: errorType.code,
                    errorMessage: errorType.desc,
                    characterPrompts: item.characterPrompts,
                    negativePrompt: item.negativePrompt,
                }),
                rollbackPersisted: () => deletePreview(failedImgId),
                select: () => setSlotSelection(item.slotId, failedImgId),
                rollbackSelection: () => clearSlotSelection(item.slotId),
            });
            if (!committed) return null;
            results[index] = { slotId: item.slotId, tags: item.tagsForStore, success: false, error: errorType };
            return errorType;
        };

        // 后台链路的结算。只有一种情况允许删除槽位：用户亲手取消。
        //
        // 失败的槽位要留下可重试的失败卡，还在后台跑的槽位要留着等接回。把它们一起删掉
        // 才是最糟的选择——用户既看不到失败原因，也再也接不回那些已经付过钱的图。
        const settleBackendPlacements = async ({ error, guard = async () => {} } = {}) => {
            const unfinished = slotIds.filter((slotId, index) => !results[index]);
            if (job.abortReason === 'user') {
                let removedTargets = [];
                if (unfinished.length > 0) {
                    removedTargets = await commitImageJobDeliverySlotRemoval({
                        slotIds: unfinished,
                        resolveTarget: resolveDeliveryTarget,
                        isEditing: isMessageBeingEdited,
                        isAnyEditing: isAnyMessageBeingEdited,
                        guard,
                        persist: persistChatSilently,
                    });
                }
                await renderRemovedTargets(removedTargets, unfinished).catch(() => {});
                await renderBatchPreviews().catch(() => {});
                return;
            }

            if (error) {
                // 整批失败（比如后端连接断了）：单项 settled 通知根本没来过，
                // 这里补齐每个槽位的失败记录，槽位一律保留。
                for (const index of slotIds.keys()) {
                    if (results[index]) continue;
                    const errorType = await recordSlotFailure(index, error, guard);
                    if (!errorType) continue;
                    const item = batchItems[index];
                    await renderSettledSlot(item.slotId, targetMessageId => buildFailedPlaceholderHtml({
                        slotId: item.slotId,
                        messageId: targetMessageId,
                        tags: item.tagsForStore,
                        positive: item.scene,
                        errorType: errorType.label,
                        errorMessage: errorType.desc,
                    }));
                }
            }
            if (replacedSlotIds.length > 0) {
                const removedTargets = await commitImageJobDeliverySlotRemoval({
                    slotIds: replacedSlotIds,
                    resolveTarget: resolveDeliveryTarget,
                    isEditing: isMessageBeingEdited,
                    isAnyEditing: isAnyMessageBeingEdited,
                    guard,
                    persist: persistChatSilently,
                });
                await renderRemovedTargets(removedTargets, replacedSlotIds).catch(() => {});
            }
        };
        const resolveBackendSettlement = ({ error } = {}) => {
            if (job.abortReason === 'user') return { mode: 'discard' };
            if (!error) return { mode: 'complete' };
            const errorType = classifyError(error);
            return { mode: 'fail', errorType };
        };

        const batchResult = await runNovelImageBatch({
            requests: batchItems.map(item => item.request),
            compiledBatch,
            signal,
            backendCancelSignal: job.backendCancel.signal,
            monitorGeneration,
            recoverable: {
                plan: recoverablePlan,
                commitPlacements: commitPlannedPlacements,
                settlePlacements: settleBackendPlacements,
                resolveSettlement: resolveBackendSettlement,
                afterForget: () => renderBatchPreviews({ final: true }),
            },
            queueBatch: job,
            onStateChange: (state, data) => {
                checkPlacementContext();
                onStateChange?.(state, data);
            },
            onItemReady: async ({ index, base64, guard = async () => {} }) => {
                const item = batchItems[index];
                const imgId = item.imgId;
                // 落库与选中先做完，再谈渲染：这两步是这张图唯一的持久事实，
                // 而后端只有在它们都落定之后才会收到 ACK 并丢掉结果。
                const committed = await commitSceneSlotDelivery({
                    committedEarly: placementLifecycle.committedEarly,
                    resolveTarget: () => resolveDeliveryTarget(item.slotId),
                    guard,
                    persist: target => storePreview({
                        ...galleryMeta,
                        imgId,
                        slotId: item.slotId,
                        messageId: target?.messageId ?? messageId,
                        base64,
                        tags: item.tagsForStore,
                        positive: item.scene,
                        characterPrompts: item.characterPrompts,
                        negativePrompt: item.negativePrompt,
                    }),
                    rollbackPersisted: () => deletePreview(imgId),
                    select: () => setSlotSelection(item.slotId, imgId),
                    rollbackSelection: () => clearSlotSelection(item.slotId),
                });
                if (!committed) return;
                results[index] = { slotId: item.slotId, imgId, tags: item.tagsForStore, success: true };
                successCount++;
                await renderSettledSlot(item.slotId, targetMessageId => buildImageHtml({
                    slotId: item.slotId,
                    imgId,
                    url: getPreviewDisplayUrl({ imgId, base64 }),
                    tags: item.tagsForStore,
                    positive: item.scene,
                    messageId: targetMessageId,
                    state: ImageState.PREVIEW,
                    historyCount: 1,
                    currentIndex: 0,
                }));
            },
            onItemSettled: async ({ index, state, error, guard = async () => {} }) => {
                if (state === 'cancelled') return;
                // 失败记录是持久事实，不能被渲染守卫挡掉：聊天切走了、楼层正在编辑，
                // 都不改变「这张图失败了」，用户回来时必须看到失败卡而不是一个空占位符。
                const errorType = await recordSlotFailure(index, error, guard);
                if (!errorType) return;
                const item = batchItems[index];
                await renderSettledSlot(item.slotId, targetMessageId => buildFailedPlaceholderHtml({
                    slotId: item.slotId,
                    messageId: targetMessageId,
                    tags: item.tagsForStore,
                    positive: item.scene,
                    errorType: errorType.label,
                    errorMessage: errorType.desc,
                }));
            },
        });
        if (batchResult.aborted && !terminationReason) {
            terminationReason = job.abortReason === 'user' ? 'aborted' : 'detached';
        }

        if (signal.aborted || terminationReason) {
            const abortCtx = getContext();
            const abortMsgValid = abortCtx.chatId === initialChatId && abortCtx.chat?.[messageId] === message;
            const canCommit = !placementLifecycle.committedEarly
                && abortMsgValid
                && message.mes === originalMes
                && !isMessageBeingEdited(messageId);
            const canSync = abortMsgValid
                && !isMessageBeingEdited(messageId)
                && (placementLifecycle.committedEarly || canCommit);
            if (canCommit) {
                setActiveMessageText(message, commitSettledScenePlacements(plannedMes, {
                    allSlotIds: slotIds,
                    settledSlotIds: results.filter(Boolean).map(item => item.slotId),
                }));
            }

            if (canSync) {
                try {
                    await syncRenderedMessage(message.mes);
                    await renderSharedPreviewsForMessage(messageId);
                } catch (e) {
                    console.warn('[NovelDraw] abort DOM 同步失败:', e);
                }
            }
            if (canCommit) {
                persistChatSilently().catch(() => {});
            }

            placementLifecycle.settled = true;
            if (terminationReason === 'source_changed') {
                throw new ScenePlacementError(
                    '正文在配图期间发生变化或正在编辑；已生成图片保留在画廊中，未写入楼层。',
                    'SCENE_SOURCE_CHANGED',
                );
            }
            const aborted = terminationReason === 'aborted' || (signal.aborted && !terminationReason);
            if (!aborted) notifyDetachedGeneration(successCount);
            onStateChange?.('success', { success: successCount, total: tasks.length, aborted, detached: !aborted });
            return {
                success: successCount,
                total: tasks.length,
                results: results.filter(Boolean),
                aborted,
                terminationReason: aborted ? 'aborted' : 'detached',
            };
        }

        if (placementLifecycle.committedEarly) {
            placementLifecycle.settled = true;
            onStateChange?.('success', { success: successCount, total: tasks.length });
            return { success: successCount, total: tasks.length, results: results.filter(Boolean) };
        }

        const finalCtx = getContext();
        const messageAttached = finalCtx.chatId === initialChatId && finalCtx.chat?.[messageId] === message;
        if (!messageAttached) {
            placementLifecycle.settled = true;
            notifyDetachedGeneration(successCount);
            onStateChange?.('success', { success: successCount, total: tasks.length, detached: true });
            return { success: successCount, total: tasks.length, results: results.filter(Boolean), aborted: false, terminationReason: 'detached' };
        }
        const shouldUpdateDom = !isMessageBeingEdited(messageId)
            && (placementLifecycle.committedEarly || message.mes === originalMes);
        if (!placementLifecycle.committedEarly && !shouldUpdateDom) {
            placementLifecycle.settled = true;
            throw new ScenePlacementError(
                '正文在配图期间发生变化或正在编辑；已生成图片保留在画廊中，未写入楼层。',
                'SCENE_SOURCE_CHANGED',
            );
        }
        if (!placementLifecycle.committedEarly) {
            try {
                await commitSceneSlotReplacement({
                    message,
                    stagedText: plannedMes,
                    replacedSlotIds,
                    persist: persistChatSilently,
                });
                if (replacedSlotIds.length > 0) requiresFinalDomSync = true;
            } catch (error) {
                requiresFinalDomSync = true;
                console.warn('[NovelDraw] 替换旧图片槽位的保存未确认，已保留旧槽位:', error);
            }
        }

        if (shouldUpdateDom && requiresFinalDomSync) {
            try {
                const formatted = messageFormatting(
                    message.mes,
                    message.name,
                    message.is_system,
                    message.is_user,
                    messageId
                );
                $('[mesid="' + messageId + '"] .mes_text').html(formatted);
                await renderSharedPreviewsForMessage(messageId);
                const { processMessageById } = await import('../../../iframe-renderer.js');
                processMessageById(messageId, true);
            } catch (error) {
                console.warn('[NovelDraw] 最终 DOM 同步失败:', error);
            }
        } else if (shouldUpdateDom) {
            console.log('[NovelDraw] 已跳过最终 full rerender，仅后台保存正文与局部 DOM patch');
        }

        const resultColor = successCount === tasks.length ? '#3ecf8e' : '#f0b429';
        console.log(`%c[NovelDraw] 完成: ${successCount}/${tasks.length} 张`, `color: ${resultColor}; font-weight: bold`);

        onStateChange?.('success', { success: successCount, total: tasks.length });

        placementLifecycle.settled = true;
        return { success: successCount, total: tasks.length, results: results.filter(Boolean) };

    } finally {
        if (placementLifecycle && !placementLifecycle.settled) {
            const {
                message,
                originalMes,
                slotIds,
                results,
                initialChatId,
                plannedMes,
                syncRenderedMessage,
                committedEarly,
            } = placementLifecycle;
            const currentCtx = getContext();
            const canCommit = !committedEarly
                && currentCtx.chatId === initialChatId
                && currentCtx.chat?.[messageId] === message
                && message.mes === originalMes
                && !isMessageBeingEdited(messageId);
            if (canCommit) {
                setActiveMessageText(message, commitSettledScenePlacements(plannedMes, {
                    allSlotIds: slotIds,
                    settledSlotIds: results.filter(Boolean).map(item => item.slotId),
                }));
                if (syncRenderedMessage) await syncRenderedMessage(message.mes).catch(() => {});
                await renderSharedPreviewsForMessage(messageId).catch(() => {});
                await persistChatSilently().catch(() => {});
            }
        }
        releaseGenerationJob(job);
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 自动模式
// ═══════════════════════════════════════════════════════════════════════════

async function autoGenerateForLastAI() {
    const s = getSettings();
    if (!isModuleEnabled() || s.mode !== 'auto') return;

    const ctx = getContext();
    const chat = ctx.chat || [];
    const lastIdx = chat.length - 1;
    if (lastIdx < 0) return;
    
    const lastMessage = chat[lastIdx];
    if (!lastMessage || lastMessage.is_user) return;
    
    const content = stripDrawImageSlots(lastMessage.mes).trim();
    if (content.length < 50) return;
    
    if (lastMessage.extra?.xb_novel_auto_done) return;

    if (autoBusy || hasGenerationJob(lastIdx)) {
        console.log('[NovelDraw] 自动模式：当前楼层已有任务进行中，跳过');
        return;
    }
    
    autoBusy = true;
    
    try {
        const { setStateForMessage, setFloatingState, FloatState, ensureNovelDrawPanel } = await import('./floating-panel.js');
        const floatingOn = s.showFloatingButton === true;
        const floorOn = s.showFloorButton !== false;
        const useFloatingOnly = floatingOn && floorOn;

        const updateState = (state, data = {}) => {
            if (useFloatingOnly || (floatingOn && !floorOn)) {
                setFloatingState?.(state, data);
            } else if (floorOn) {
                setStateForMessage(lastIdx, state, data);
            }
        };
        
        if (floorOn && !useFloatingOnly) {
            const messageEl = document.querySelector(`.mes[mesid="${lastIdx}"]`);
            if (messageEl) {
                ensureNovelDrawPanel(messageEl, lastIdx, { force: true });
            }
        }
        
        const result = await generateAndInsertImages({
            messageId: lastIdx,
            skipLock: true,
            automatic: true,
            onStateChange: (state, data) => {
                switch (state) {
                    case 'submitting':
                        updateState(FloatState.SUBMITTING, data);
                        break;
                    case 'accepted':
                        updateState(FloatState.ACCEPTED, data);
                        break;
                    case 'uncertain':
                        updateState(FloatState.UNCERTAIN, data);
                        break;
                    case 'queued':
                        updateState(FloatState.QUEUED, data);
                        break;
                    case 'llm': 
                        updateState(FloatState.LLM); 
                        break;
                    case 'gen': 
                    case 'progress': 
                        updateState(FloatState.GEN, data); 
                        break;
                    case 'cooldown': 
                        updateState(FloatState.COOLDOWN, data); 
                        break;
                    case 'reconnecting':
                        updateState(FloatState.RECONNECTING, data);
                        break;
                    case 'cancelling':
                        updateState(FloatState.CANCELLING, data);
                        break;
                    case 'backend_legacy':
                        updateState(FloatState.BACKEND_LEGACY, data);
                        break;
                    case 'success': 
                        updateState(
                            (data.aborted && data.success === 0) ? FloatState.IDLE
                                : (data.success < data.total) ? FloatState.PARTIAL
                                    : FloatState.SUCCESS,
                            data
                        );
                        break;
                }
            }
        });
        
        // 后台流程由 automatic marker 在成功 handoff 时原子转成 auto_done；
        // 浏览器流程仍沿用原有完成标记。
        if (!['accepted', 'uncertain'].includes(result?.status)) {
            lastMessage.extra ||= {};
            lastMessage.extra.xb_novel_auto_done = true;
        }
        
    } catch (e) {
        console.error('[NovelDraw] 自动配图失败:', e);
        try {
            const { setStateForMessage, setFloatingState, FloatState } = await import('./floating-panel.js');
            const floatingOn = s.showFloatingButton === true;
            const floorOn = s.showFloorButton !== false;
            const useFloatingOnly = floatingOn && floorOn;

            if (e?.uncertain === true) {
                if (useFloatingOnly || (floatingOn && !floorOn)) {
                    setFloatingState?.(FloatState.UNCERTAIN);
                } else if (floorOn) {
                    setStateForMessage(lastIdx, FloatState.UNCERTAIN);
                }
                return;
            }
            if (isDrawRunPendingError(e)) {
                toastr?.info?.(e.message);
                return;
            }
            if (isDrawRunCancelledError(e)) {
                if (useFloatingOnly || (floatingOn && !floorOn)) {
                    setFloatingState?.(FloatState.IDLE);
                } else if (floorOn) {
                    setStateForMessage(lastIdx, FloatState.IDLE);
                }
                return;
            }

            if (useFloatingOnly || (floatingOn && !floorOn)) {
                setFloatingState?.(FloatState.ERROR, { error: classifyError(e) });
            } else if (floorOn) {
                setStateForMessage(lastIdx, FloatState.ERROR, { error: classifyError(e) });
            }
        } catch {}
    } finally {
        autoBusy = false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// Overlay 设置面板
// ═══════════════════════════════════════════════════════════════════════════

function createOverlay() {
    if (overlayCreated) return;
    overlayCreated = true;
    ensureStyles();

    const overlay = document.createElement('div');
    overlay.id = 'xiaobaix-novel-draw-overlay';

    overlay.style.cssText = `position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:${window.innerHeight}px!important;z-index:100002!important;display:none;overflow:hidden!important;`;

    const updateHeight = () => {
        if (overlay.style.display !== 'none') {
            syncOverlayHeight();
        }
    };
    overlayResizeHandler = updateHeight;
    window.addEventListener('resize', updateHeight);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateHeight);
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'nd-backdrop';
    backdrop.addEventListener('click', hideOverlay);

    const frameWrap = document.createElement('div');
    frameWrap.className = 'nd-frame-wrap';
    frameWrap.style.cssText = 'position:absolute;z-index:1;top:12px;left:12px;right:12px;bottom:12px;';

    const iframe = document.createElement('iframe');
    iframe.id = 'xiaobaix-novel-draw-iframe';
    iframe.src = `${HTML_PATH}?v=${Date.now()}`;
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#0d1117;display:block;';

    frameWrap.appendChild(iframe);
    overlay.appendChild(backdrop);
    overlay.appendChild(frameWrap);
    document.body.appendChild(overlay);
    syncOverlayFrameLayout();
    // Guarded by isTrustedMessage (origin + source).
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleFrameMessage);
}

function showOverlay() {
    if (!overlayCreated) createOverlay();
    const overlay = document.getElementById('xiaobaix-novel-draw-overlay');
    if (overlay) {
        overlay.style.display = 'block';
        syncOverlayHeight();
    }
    console.log('[NovelDraw] showOverlay: frameReady=%s', frameReady);
    if (frameReady) sendInitData();
}

function hideOverlay() {
    agentSettingsSurface?.destroy();
    agentSettingsSurface = null;
    const overlay = document.getElementById('xiaobaix-novel-draw-overlay');
    if (overlay) overlay.remove();
    overlayCreated = false;
    frameReady = false;

    if (overlayResizeHandler) {
        window.removeEventListener('resize', overlayResizeHandler);
        window.visualViewport?.removeEventListener('resize', overlayResizeHandler);
        overlayResizeHandler = null;
    }

    window.removeEventListener('message', handleFrameMessage);
}

async function sendInitData() {
    console.log('[NovelDraw] sendInitData called');
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (!iframe?.contentWindow) { console.warn('[NovelDraw] sendInitData: no iframe'); return; }
    // Send the usable settings first; cache/gallery IndexedDB work can be slow for upgraded installs.
    const settings = getRuntimeSettings();
    console.log('[NovelDraw] sendInitData: autoLearn=%s, advancedMode=%s, promptPresets=%d',
        settings.autoLearnCharacters, settings.advancedMode, settings.promptPresets?.length);
    const buildPayload = (stats = { count: 0, sizeMB: 0 }, gallerySummary = {}) => ({
        type: 'INIT_DATA',
        settings: {
            enabled: moduleInitialized,
            mode: settings.mode,
            apiKey: settings.apiKey,
            apiBaseUrl: settings.apiBaseUrl || '',
            sendMode: settings.sendMode || 'frontend',
            useImageBackendJobs: settings.useImageBackendJobs === true,
            insecureTLS: settings.insecureTLS === true,
            timeout: settings.timeout,
            requestDelay: settings.requestDelay,
            cacheDays: getSharedDrawSettings().cacheDays,
            selectedParamsPresetId: settings.selectedParamsPresetId,
            paramsPresets: settings.paramsPresets,
            useWorldInfo: settings.useWorldInfo,
            characterTags: settings.characterTags,
            autoLearnCharacters: !!settings.autoLearnCharacters,
            autoLearnMode: settings.autoLearnMode || 'new_only',
            danbooruLocalDB: !!settings.danbooruLocalDB,
            overrideSize: settings.overrideSize,
            showFloorButton: settings.showFloorButton !== false,
            showFloatingButton: settings.showFloatingButton === true,
            advancedMode: !!settings.advancedMode,
            promptPresets: settings.promptPresets || [],
            selectedPromptPresetId: settings.selectedPromptPresetId || null,
            modelGuideDefaults: Object.fromEntries(
                Object.values(NOVEL_PROMPT_GUIDES)
                    .map(guideId => [guideId, getLoadedTagGuideById(guideId)]),
            ),
            modelContractDefaults: Object.fromEntries(
                Object.values(NOVEL_PROMPT_GUIDES)
                    .map(guideId => [guideId, getDefaultNovelModelContractByGuideId(guideId)]),
            ),
            modelCapabilities: getNovelModelCapabilitiesForUi(),
            worldbooks: settings.worldbooks || DEFAULT_SETTINGS.worldbooks,
            messageFilterRules: settings.messageFilterRules || [],
        },
        defaultPrompts: { ...DEFAULT_PROMPT_CONFIG },
        cacheStats: stats,
        gallerySummary,
    });
    postToIframe(iframe, buildPayload(), 'LittleWhiteBox-NovelDraw');

    let stats = { count: 0, sizeMB: 0 };
    let gallerySummary = {};
    try { stats = await getCacheStats(); } catch (e) { console.warn('[NovelDraw] getCacheStats failed:', e); }
    try { gallerySummary = await getGallerySummary(); } catch (e) { console.warn('[NovelDraw] getGallerySummary failed:', e); }
    const currentIframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (currentIframe?.contentWindow === iframe.contentWindow) {
        postToIframe(currentIframe, {
            type: 'CACHE_DATA',
            cacheStats: stats,
            gallerySummary,
        }, 'LittleWhiteBox-NovelDraw');
    }
}

function postStatus(state, text, target = '') {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (iframe) postToIframe(iframe, { type: 'STATUS', state, text, target }, 'LittleWhiteBox-NovelDraw');
}

function getAgentSettingsSurfaceRoot() {
    return document.getElementById('xiaobaix-novel-draw-iframe')
        ?.contentDocument
        ?.getElementById('nd-agent-settings-surface') || null;
}

function ensureAgentSettingsSurface() {
    agentSettingsSurface = attachDrawAgentSettingsSurface({
        surface: agentSettingsSurface,
        getRoot: getAgentSettingsSurfaceRoot,
        showToast: (message) => toastr.info(String(message || ''), 'Agent API'),
        source: 'draw-novelai',
        logPrefix: 'NovelDraw',
    });
    return agentSettingsSurface;
}

async function handleFrameMessage(event) {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (!isTrustedMessage(event, iframe, 'NovelDraw-Frame')) return;
    const data = event.data;
    console.log('[NovelDraw] handleFrameMessage:', data.type);

    switch (data.type) {
        case 'FRAME_READY':
            frameReady = true;
            sendInitData();
            ensureAgentSettingsSurface();
            // 若本地 Danbooru DB 已启用，预加载（失败只警告，不修改用户设置）
            if (getSharedDrawSettings().danbooruLocalDB) {
                const datUrl = `${extensionFolderPath}/modules/draw/shared/data/danbooru-chars.dat`;
                loadLocalDanbooruDB(datUrl).catch(e => {
                    console.warn('[NovelDraw] Eager load of local Danbooru DB failed:', e);
                });
            }
            break;

        case 'CLOSE':
            hideOverlay();
            break;

        case 'SAVE_MODE': {
            await updateSettingsPersistent((settings) => {
                settings.mode = data.mode || settings.mode;
            }, '已保存');
            import('./floating-panel.js').then(m => m.updateAutoModeUI?.());
            break;
        }

        case 'SAVE_BUTTON_MODE': {
            const ok = await updateSettingsPersistent((settings) => {
                if (typeof data.showFloorButton === 'boolean') settings.showFloorButton = data.showFloorButton;
                if (typeof data.showFloatingButton === 'boolean') settings.showFloatingButton = data.showFloatingButton;
            }, '已保存');
            if (ok) {
                const s = getSettings();
                try {
                    const fp = await import('./floating-panel.js');
                    fp.updateButtonVisibility?.(s.showFloorButton !== false, s.showFloatingButton === true);
                } catch {}
                if (s.showFloorButton !== false && typeof ensureNovelDrawPanelRef === 'function') {
                    const context = getContext();
                    const chat = context.chat || [];
                    chat.forEach((message, messageId) => {
                        if (!message || message.is_user) return;
                        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
                        if (!messageEl) return;
                        ensureNovelDrawPanelRef?.(messageEl, messageId);
                    });
                }
                sendInitData();
            }
            break;
        }

        case 'SAVE_API_KEY': {
            await updateSettingsPersistent((settings) => {
                settings.apiKey = typeof data.apiKey === 'string' ? data.apiKey : settings.apiKey;
            }, '已保存', { target: 'api' });
            break;
        }

        case 'SAVE_API_CONFIG': {
            const nextTimeout = typeof data.timeout === 'number' && data.timeout > 0
                ? data.timeout
                : null;
            const providerOk = await updateSettingsPersistent((settings) => {
                if (typeof data.apiKey === 'string') {
                    settings.apiKey = data.apiKey.trim();
                }
                if (typeof data.apiBaseUrl === 'string') {
                    settings.apiBaseUrl = data.apiBaseUrl.trim();
                }
                if (data.sendMode === 'frontend' || data.sendMode === 'backend') {
                    settings.sendMode = data.sendMode;
                }
                if (typeof data.useImageBackendJobs === 'boolean') {
                    settings.useImageBackendJobs = data.useImageBackendJobs;
                }
                if (typeof data.insecureTLS === 'boolean') {
                    settings.insecureTLS = data.insecureTLS;
                }
                if (data.requestDelay?.min > 0 && data.requestDelay?.max > 0) {
                    settings.requestDelay = data.requestDelay;
                }
            }, '已保存', { notify: false, silent: false });
            const sharedOk = nextTimeout == null || await updateSharedSettingsPersistent((settings) => {
                settings.timeout = nextTimeout;
            }, '已保存', { notify: false, silent: false });
            postStatus(providerOk && sharedOk ? 'success' : 'error', providerOk && sharedOk ? '已保存' : '保存失败', 'api');
            break;
        }

        case 'SAVE_TIMEOUT': {
            const nextTimeout = typeof data.timeout === 'number' && data.timeout > 0
                ? data.timeout
                : null;
            const providerOk = await updateSettingsPersistent((settings) => {
                if (data.requestDelay?.min > 0 && data.requestDelay?.max > 0) settings.requestDelay = data.requestDelay;
            }, '已保存', { notify: false, silent: false });
            const sharedOk = nextTimeout == null || await updateSharedSettingsPersistent((settings) => {
                settings.timeout = nextTimeout;
            }, '已保存', { notify: false, silent: false });
            postStatus(providerOk && sharedOk ? 'success' : 'error', providerOk && sharedOk ? '已保存' : '保存失败', 'api');
            break;
        }

        case 'SAVE_CACHE_DAYS': {
            const nextDays = normalizeSharedCacheDays(data.cacheDays, getSharedDrawSettings().cacheDays);
            const ok = await updateSharedDrawSettingsPersistent((settings) => {
                settings.cacheDays = nextDays;
            }, '已保存', { notify: false, silent: false });
            postStatus(ok ? 'success' : 'error', ok ? '已保存' : '保存失败', 'gallery');
            if (ok) sendInitData();
            break;
        }

        case 'TEST_API': {
            try {
                postStatus('loading', '测试中...', 'api');
                await testApiConnection(data.apiKey, data.apiBaseUrl, {
                    sendMode: data.sendMode,
                    insecure: data.insecureTLS,
                    timeout: data.timeout,
                    model: data.model,
                });
                postStatus('success', '连接成功', 'api');
            } catch (e) {
                postStatus('error', e?.message, 'api');
            }
            break;
        }

        case 'CHECK_BACKEND_PLUGIN': {
            const status = await checkBackendPluginStatus();
            const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
            if (iframe) postToIframe(iframe, { type: 'BACKEND_PLUGIN_STATUS', status }, 'LittleWhiteBox-NovelDraw');
            break;
        }


        case 'SAVE_PARAMS_PRESET': {
            const ok = await updateSettingsPersistent((settings) => {
                if (data.selectedParamsPresetId) settings.selectedParamsPresetId = data.selectedParamsPresetId;
                if (Array.isArray(data.paramsPresets) && data.paramsPresets.length > 0) {
                    settings.paramsPresets = data.paramsPresets;
                }
            }, '已保存', { target: 'params' });
            if (ok) {
                sendInitData();
                try {
                    const { refreshPresetSelect } = await import('./floating-panel.js');
                    refreshPresetSelect?.();
                } catch {}
            }
            break;
        }

        case 'ADD_PARAMS_PRESET': {
            const id = generateSlotId();
            const base = getActiveParamsPreset() || DEFAULT_PARAMS_PRESET;
            const ok = await updateSettingsPersistent((settings) => {
                const copy = cloneSettingsObject(base);
                copy.id = id;
                copy.name = (typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : `配置-${settings.paramsPresets.length + 1}`;
                settings.paramsPresets.push(copy);
                settings.selectedParamsPresetId = id;
            }, '已创建', { target: 'params' });
            if (ok) {
                sendInitData();
                try {
                    const { refreshPresetSelect } = await import('./floating-panel.js');
                    refreshPresetSelect?.();
                } catch {}
            }
            break;
        }

        case 'DEL_PARAMS_PRESET': {
            const s = getSettings();
            if (s.paramsPresets.length <= 1) {
                postStatus('error', '至少保留一个预设', 'params');
                break;
            }
            const ok = await updateSettingsPersistent((settings) => {
                const idx = settings.paramsPresets.findIndex(p => p.id === settings.selectedParamsPresetId);
                if (idx >= 0) settings.paramsPresets.splice(idx, 1);
                settings.selectedParamsPresetId = settings.paramsPresets[0]?.id || null;
            }, '已删除', { target: 'params' });
            if (ok) {
                sendInitData();
                try {
                    const { refreshPresetSelect } = await import('./floating-panel.js');
                    refreshPresetSelect?.();
                } catch {}
            }
            break;
        }

        // ═══════════════════════════════════════════════════════════════
        // 新增：云端预设
        // ═══════════════════════════════════════════════════════════════
        case 'OPEN_CLOUD_PRESETS': {
            openCloudPresetsModal(async (presetData) => {
                const { preset: newPreset, warnings: importWarnings } = parsePresetData(presetData, generateSlotId);
                const ok = await updateSettingsPersistent((settings) => {
                    settings.paramsPresets.push(newPreset);
                    settings.selectedParamsPresetId = newPreset.id;
                }, `已导入: ${newPreset.name}`, { target: 'params' });
                if (ok) {
                    await notifySettingsUpdated();
                    sendInitData();
                    if (importWarnings.length) showToast(importWarnings.join('；'), 'info', 5000);
                }
            });
            break;
        }
        case 'EXPORT_CURRENT_PRESET': {
            const s = getSettings();
            const presetId = data.presetId || s.selectedParamsPresetId;
            const preset = s.paramsPresets.find(p => p.id === presetId);
            if (!preset) {
                postStatus('error', '没有可导出的预设', 'params');
                break;
            }
            downloadPresetAsFile(preset);
            postStatus('success', '已导出', 'params');
            break;
        }

        // ═══════════════════════════════════════════════════════════════

        case 'RESET_CUSTOM_PROMPT': {
            const key = data.key;
            const ALLOWED_PROMPT_KEYS = ['topSystem', 'sceneRules'];
            const guideId = String(data.guideId || '');
            const presetId = String(data.selectedPromptPresetId || '');
            const isGuideReset = key === 'modelGuide'
                && Object.values(NOVEL_PROMPT_GUIDES).includes(guideId);
            const isContractReset = key === 'modelContract'
                && Object.values(NOVEL_PROMPT_GUIDES).includes(guideId);
            if (isGuideReset || isContractReset || (key && ALLOWED_PROMPT_KEYS.includes(key))) {
                let presetFound = false;
                const ok = await updateSettingsPersistent((settings) => {
                    const targetPresetId = presetId || settings.selectedPromptPresetId;
                    const active = settings.promptPresets.find(p => p.id === targetPresetId);
                    if (!active) return;
                    presetFound = true;
                    if (isGuideReset) {
                        const overrides = normalizeNovelPromptGuideOverrides(active.modelGuideOverrides);
                        delete overrides[guideId];
                        active.modelGuideOverrides = overrides;
                        return;
                    }
                    if (isContractReset) {
                        const overrides = normalizeNovelModelContractOverrides(active.modelContractOverrides);
                        delete overrides[guideId];
                        active.modelContractOverrides = overrides;
                        return;
                    }
                    const isPov = active?.name === '默认-第一人称完整规则';
                    const resetDefaults = {
                        topSystem: isPov ? DEFAULT_PROMPT_CONFIG.topSystemPov : DEFAULT_PROMPT_CONFIG.topSystem,
                        sceneRules: DEFAULT_PROMPT_CONFIG.sceneRules,
                    };
                    const defaultVal = resetDefaults[key];
                    active[key] = defaultVal;
                }, '已恢复默认', { target: 'prompts', notify: false });
                const reset = ok && presetFound;
                postStatus(
                    reset ? 'success' : 'error',
                    reset ? '已恢复默认' : ok ? '目标提示词预设已不存在' : '保存失败',
                    'prompts',
                );
                postToIframe(iframe, {
                    type: 'PROMPT_RESET_RESULT',
                    key,
                    guideId,
                    presetId,
                    draftRevision: data.draftRevision,
                    ok: reset,
                }, 'LittleWhiteBox-NovelDraw');
            }
            sendInitData();
            break;
        }

        // ═══════════════════════════════════════════════════════════════
        // 提示词预设管理
        // ═══════════════════════════════════════════════════════════════

        case 'SELECT_PROMPT_PRESET': {
            if (data.id) {
                // 仅持久化，不回传 INIT_DATA — iframe 已在 change handler 中完成 UI 更新
                // 避免 sendInitData 的异步延迟导致下拉框 innerHTML 全量重建引起状态闪烁
                let presetFound = false;
                const ok = await updateSettingsPersistent((settings) => {
                    if (!settings.promptPresets.some(p => p.id === data.id)) return;
                    presetFound = true;
                    settings.selectedPromptPresetId = data.id;
                }, '已切换预设', { target: 'prompt-preset', notify: false });
                const selected = ok && presetFound;
                postStatus(
                    selected ? 'success' : 'error',
                    selected ? '已切换预设' : ok ? '目标提示词预设已不存在' : '保存失败',
                    'prompt-preset',
                );
                if (!selected) {
                    sendInitData();
                }
            }
            break;
        }

        case 'ADD_PROMPT_PRESET': {
            const id = generateSlotId();
            const sourcePresetId = String(data.sourcePresetId || getSettings().selectedPromptPresetId || '');
            let sourceFound = false;
            const ok = await updateSettingsPersistent((settings) => {
                const current = settings.promptPresets.find(p => p.id === sourcePresetId);
                if (!current) return;
                sourceFound = true;
                const newPreset = {
                    id,
                    name: (typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : `提示词-${settings.promptPresets.length + 1}`,
                    topSystem: current?.topSystem ?? DEFAULT_PROMPT_CONFIG.topSystem,
                    sceneRules: current?.sceneRules ?? DEFAULT_PROMPT_CONFIG.sceneRules,
                    modelGuideOverrides: normalizeNovelPromptGuideOverrides(current?.modelGuideOverrides),
                    modelContractOverrides: normalizeNovelModelContractOverrides(current?.modelContractOverrides),
                };
                settings.promptPresets.push(newPreset);
                settings.selectedPromptPresetId = id;
            }, '已创建', { target: 'prompt-preset', notify: false });
            postStatus(
                ok && sourceFound ? 'success' : 'error',
                ok && sourceFound ? '已创建' : ok ? '源提示词预设已不存在' : '保存失败',
                'prompt-preset',
            );
            if (ok && sourceFound) sendInitData();
            break;
        }

        case 'IMPORT_PROMPT_PRESET': {
            let imported;
            try {
                imported = parseNovelPromptPresetImport(data.payload, {
                    fallbackName: data.fallbackName,
                });
            } catch (error) {
                postStatus('error', `导入失败：${error?.message || '模板格式无效'}`, 'prompt-preset');
                break;
            }
            const id = generateSlotId();
            const ok = await updateSettingsPersistent((settings) => {
                settings.promptPresets.push({
                    id,
                    ...imported,
                    modelGuideOverrides: compactPromptGuideOverrides(imported.modelGuideOverrides),
                    modelContractOverrides: compactPromptContractOverrides(imported.modelContractOverrides),
                });
                settings.selectedPromptPresetId = id;
            }, '已导入为新预设', { target: 'prompt-preset' });
            if (ok) sendInitData();
            break;
        }

        case 'DEL_PROMPT_PRESET': {
            const s = getSettings();
            const presetId = String(data.id || s.selectedPromptPresetId || '');
            let deleteResult = 'missing';
            const ok = await updateSettingsPersistent((settings) => {
                if (settings.promptPresets.length <= 1) {
                    deleteResult = 'last';
                    return;
                }
                const idx = settings.promptPresets.findIndex(p => p.id === presetId);
                if (idx < 0) return;
                settings.promptPresets.splice(idx, 1);
                settings.selectedPromptPresetId = settings.promptPresets[0]?.id || null;
                deleteResult = 'deleted';
            }, '已删除', { target: 'prompt-preset', notify: false });
            if (!ok) {
                postStatus('error', '保存失败', 'prompt-preset');
            } else if (deleteResult === 'last') {
                postStatus('error', '至少保留一个预设', 'prompt-preset');
            } else if (deleteResult === 'missing') {
                postStatus('error', '要删除的预设已不存在', 'prompt-preset');
            } else {
                postStatus('success', '已删除', 'prompt-preset');
            }
            if (ok) sendInitData();
            break;
        }

        case 'RENAME_PROMPT_PRESET': {
            const presetId = String(data.id || getSettings().selectedPromptPresetId || '');
            const active = getSettings().promptPresets.find(p => p.id === presetId);
            if (active && typeof data.name === 'string' && data.name.trim()) {
                let presetFound = false;
                const ok = await updateSettingsPersistent((settings) => {
                    const preset = settings.promptPresets.find(p => p.id === presetId);
                    if (!preset) return;
                    presetFound = true;
                    preset.name = data.name.trim();
                }, '已重命名', { target: 'prompt-preset', notify: false });
                postStatus(
                    ok && presetFound ? 'success' : 'error',
                    ok && presetFound ? '已重命名' : ok ? '目标提示词预设已不存在' : '保存失败',
                    'prompt-preset',
                );
                sendInitData();
            }
            break;
        }

        case 'SAVE_PROMPT_PRESET': {
            const presetId = String(data.selectedPromptPresetId || getSettings().selectedPromptPresetId || '');
            let saved = false;
            if (data.promptDraft && typeof data.promptDraft === 'object') {
                const statusTarget = data.statusTarget === 'prompt-preset' ? 'prompt-preset' : 'prompts';
                let presetFound = false;
                const ok = await updateSettingsPersistent((settings) => {
                    const current = settings.promptPresets.find(p => p.id === presetId);
                    if (!current) return;
                    presetFound = true;
                    settings.selectedPromptPresetId = presetId;
                    const cp = data.promptDraft;
                    if ('topSystem' in cp) current.topSystem = cp.topSystem;
                    if ('sceneRules' in cp) current.sceneRules = cp.sceneRules;
                    if ('modelGuideOverrides' in cp) {
                        current.modelGuideOverrides = compactPromptGuideOverrides(cp.modelGuideOverrides);
                    }
                    if ('modelContractOverrides' in cp) {
                        current.modelContractOverrides = compactPromptContractOverrides(cp.modelContractOverrides);
                    }
                }, '提示词预设已保存', { target: statusTarget, notify: false });
                saved = ok && presetFound;
                postStatus(
                    saved ? 'success' : 'error',
                    saved ? '提示词预设已保存' : ok ? '目标提示词预设已不存在' : '保存失败',
                    statusTarget,
                );
            }
            if (data.resetAll === true) {
                postToIframe(iframe, {
                    type: 'PROMPT_RESET_ALL_RESULT',
                    presetId,
                    draftRevision: data.draftRevision,
                    ok: saved,
                }, 'LittleWhiteBox-NovelDraw');
            }
            sendInitData();
            break;
        }

        case 'SAVE_WORLDBOOK_CONFIG': {
            const ok = await updateSharedSettingsPersistent((settings) => {
                if (typeof data.useWorldInfo === 'boolean') {
                    settings.useWorldInfo = data.useWorldInfo;
                }
                if (data.worldbooks && typeof data.worldbooks === 'object') {
                    const allowed = ['enabled', 'uploadedBooks', 'keywordFilterMode'];
                    const clean = Object.fromEntries(allowed.filter(k => k in data.worldbooks).map(k => [k, data.worldbooks[k]]));
                    settings.worldbooks = { ...settings.worldbooks, ...clean };
                    if (!Array.isArray(settings.worldbooks.uploadedBooks)) settings.worldbooks.uploadedBooks = [];
                }
            }, '世界书配置已保存', { notify: false });
            postStatus(ok ? 'success' : 'error', ok ? '世界书配置已保存' : '世界书配置保存失败', 'worldbook');
            sendInitData();
            break;
        }

        case 'ENSURE_AGENT_SETTINGS': {
            ensureAgentSettingsSurface();
            break;
        }

        case 'SAVE_CHARACTER_TAGS': {
            const ok = await updateSharedSettingsPersistent((settings) => {
                if (Array.isArray(data.characterTags)) settings.characterTags = data.characterTags;
            }, '角色标签已保存');
            if (!ok) await sendInitData();
            break;
        }

        case 'SAVE_AUTO_LEARN': {
            console.log('[NovelDraw] SAVE_AUTO_LEARN received:', data.autoLearnCharacters, data.autoLearnMode);
            const nextAutoLearnCharacters = !!data.autoLearnCharacters;
            await updateSettingsPersistent((settings) => {
                settings.autoLearnCharacters = nextAutoLearnCharacters;
                settings.autoLearnMode = ['new_only', 'auto_update'].includes(data.autoLearnMode)
                    ? data.autoLearnMode : 'new_only';
            }, nextAutoLearnCharacters ? '自动学习已开启' : '自动学习已关闭');
            sendInitData();
            break;
        }

        case 'SAVE_DANBOORU_LOCAL_DB': {
            const enabled = !!data.enabled;
            if (enabled) {
                try {
                    const datUrl = `${extensionFolderPath}/modules/draw/shared/data/danbooru-chars.dat`;
                    const db = await loadLocalDanbooruDB(datUrl);
                    if (!db) break; // 被并发 OFF toggle 取消
                    const ok = await updateSharedSettingsPersistent((settings) => {
                        settings.danbooruLocalDB = true;
                    }, `Danbooru 本地库已加载 (${db.length} 条)`);
                    if (!ok) {
                        unloadLocalDanbooruDB();
                    }
                } catch (e) {
                    unloadLocalDanbooruDB();
                    await updateSharedSettingsPersistent((settings) => {
                        settings.danbooruLocalDB = false;
                    }, 'Danbooru 本地库加载失败');
                    console.warn('[NovelDraw] Failed to load local Danbooru DB:', e);
                }
            } else {
                unloadLocalDanbooruDB();
                await updateSharedSettingsPersistent((settings) => {
                    settings.danbooruLocalDB = false;
                }, 'Danbooru 本地库已关闭');
            }
            sendInitData();
            break;
        }

        case 'DANBOORU_LOCAL_SEARCH': {
            const results = searchLocalDanbooru(data.query || '', 10);
            const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
            if (iframe) postToIframe(iframe, {
                type: 'DANBOORU_LOCAL_SEARCH_RESULTS',
                query: data.query,
                charId: data.charId,
                results,
            }, 'LittleWhiteBox-NovelDraw');
            break;
        }

        case 'DANBOORU_SEARCH_CHARACTER':
        case 'DANBOORU_FETCH_TAGS':
            // 在线 CORS 代理搜索已移除，角色搜索统一使用本地 DB (DANBOORU_LOCAL_SEARCH)
            break;

        case 'SAVE_MESSAGE_FILTER_RULES': {
            await updateSharedSettingsPersistent((settings) => {
                settings.messageFilterRules = Array.isArray(data.rules) ? data.rules : [];
            }, '过滤规则已保存', { target: 'filter' });
            break;
        }

        case 'SYNC_SUMMARY_FILTER_RULES': {
            const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
            if (!iframe) break;
            let summaryRules = [];
            try {
                const raw = localStorage.getItem('summary_panel_config');
                if (raw) {
                    const cfg = JSON.parse(raw);
                    summaryRules = cfg?.textFilterRules || cfg?.vector?.textFilterRules || [];
                }
            } catch { /* ignore */ }
            postToIframe(iframe, {
                type: 'SYNC_SUMMARY_FILTER_RESULT',
                rules: Array.isArray(summaryRules) ? summaryRules : [],
            }, 'LittleWhiteBox-NovelDraw');
            break;
        }

        case 'CLEAR_EXPIRED_CACHE': {
            const n = await clearExpiredCache(getSharedDrawSettings().cacheDays);
            sendInitData();
            postStatus('success', `已清理/瘦身 ${n} 条`, 'gallery');
            break;
        }

        case 'CLEAR_ALL_CACHE':
            await clearAllCache();
            sendInitData();
            postStatus('success', '已清空', 'gallery');
            break;

        case 'GET_PROMPT_CHAIN': {
            const { getPromptChainPreview } = await import('./novel-prompts.js');
            const currentPrompts = getActivePromptPreset() || {};
            const model = String(data.model || getActiveParamsPreset()?.params?.model || '');
            const promptDraft = data.promptDraft && typeof data.promptDraft === 'object'
                ? {
                    ...currentPrompts,
                    topSystem: String(data.promptDraft.topSystem ?? currentPrompts.topSystem ?? ''),
                    sceneRules: String(data.promptDraft.sceneRules ?? currentPrompts.sceneRules ?? ''),
                    modelGuideOverrides: normalizeNovelPromptGuideOverrides(
                        data.promptDraft.modelGuideOverrides ?? currentPrompts.modelGuideOverrides,
                    ),
                    modelContractOverrides: normalizeNovelModelContractOverrides(
                        data.promptDraft.modelContractOverrides ?? currentPrompts.modelContractOverrides,
                    ),
                }
                : currentPrompts;
            const chain = getPromptChainPreview(promptDraft, model);
            const modelContractContent = getEffectiveNovelModelContract(model, promptDraft);
            if (iframe?.isConnected) postToIframe(iframe, {
                type: 'PROMPT_CHAIN_DATA',
                requestId: data.requestId,
                chain,
                modelContractContent,
            }, 'LittleWhiteBox-NovelDraw');
            break;
        }

        case 'GET_LAST_LLM_REQUEST': {
            if (iframe) {
                postToIframe(iframe, {
                    type: 'LAST_LLM_REQUEST_DATA',
                    snapshot: getLastDrawAgentDiagnostic(),
                }, 'LittleWhiteBox-NovelDraw');
            }
            break;
        }

        case 'REFRESH_CACHE_STATS':
            sendInitData();
            break;

        case 'USE_GALLERY_IMAGE':
            sendInitData();
            postStatus('success', '已选择', 'gallery');
            break;

        case 'SAVE_GALLERY_IMAGE': {
            try {
                const preview = await getPreview(data.imgId);
                if (!preview?.base64) {
                    postStatus('error', '图片数据不存在');
                    break;
                }
                const charName = preview.characterName || getChatCharacterName();
                const image = getBase64ImagePayload(preview.base64);
                const url = await saveBase64AsFile(image.base64, charName, `novel_${data.imgId}`, image.format);
                preview.savedUrl = url;
                await updatePreviewSavedUrl(data.imgId, url);
                if (Number.isFinite(preview.messageId)) await syncNovelDrawSavedFromPreview(preview.messageId, preview, { savedUrl: url });
                {
                    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
                    if (iframe) postToIframe(iframe, { type: 'GALLERY_IMAGE_SAVED', imgId: data.imgId, savedUrl: url }, 'LittleWhiteBox-NovelDraw');
                }
                sendInitData();
                showToast(`已保存: ${url}`, 'success', 5000);
            } catch (e) {
                console.error('[NovelDraw] 保存失败:', e);
                postStatus('error', '保存失败: ' + e.message);
            }
            break;
        }

        case 'LOAD_CHARACTER_PREVIEWS': {
            try {
                const charName = data.charName;
                if (!charName) break;
                const slots = await getCharacterPreviews(charName);
                {
                    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
                    if (iframe) postToIframe(iframe, { type: 'CHARACTER_PREVIEWS_LOADED', charName, slots }, 'LittleWhiteBox-NovelDraw');
                }
            } catch (e) {
                console.error('[NovelDraw] 加载预览失败:', e);
            }
            break;
        }

        case 'DELETE_GALLERY_IMAGE': {
            try {
                await deletePreview(data.imgId);
                {
                    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
                    if (iframe) postToIframe(iframe, { type: 'GALLERY_IMAGE_DELETED', imgId: data.imgId }, 'LittleWhiteBox-NovelDraw');
                }
                sendInitData();
                showToast('已删除');
            } catch (e) {
                console.error('[NovelDraw] 删除失败:', e);
                postStatus('error', '删除失败: ' + e.message);
            }
            break;
        }

        case 'GENERATE_IMAGES': {
            try {
                const messageId = typeof data.messageId === 'number' ? data.messageId : findLastAIMessageId();
                if (messageId < 0) {
                    postStatus('error', '无AI消息');
                    break;
                }
                const result = await generateAndInsertImages({
                    messageId,
                    onStateChange: (state, d) => {
                        if (state === 'submitting') postStatus('loading', '正在提交后台任务...');
                        if (state === 'accepted') postStatus('loading', '后台已接管，可关闭页面');
                        if (state === 'uncertain') postStatus('loading', '后台任务确认中...');
                        if (state === 'progress') postStatus('loading', `${d.current}/${d.total}`);
                        if (state === 'queued') postStatus('loading', d.ahead > 0 ? `排队中·前方 ${d.ahead}` : '排队中');
                        if (state === 'cooldown') postStatus('loading', `冷却中 ${Math.max(0, (Number(d.cooldownUntil) - Date.now()) / 1000).toFixed(1)}s`);
                        if (state === 'reconnecting') postStatus('loading', '后端重连中...');
                        if (state === 'cancelling') postStatus('loading', '取消中...');
                        if (state === 'backend_legacy') postStatus('loading', '后端兼容模式');
                    }
                });
                if (result?.status === 'accepted') {
                    postStatus('success', '后台已接管，可关闭页面');
                } else if (result?.status === 'uncertain') {
                    postStatus('loading', '后台任务确认中，请勿重复提交');
                } else {
                    postStatus('success', `完成! ${result.success} 张`);
                }
            } catch (e) {
                postStatus('error', e?.message);
            }
            break;
        }

        case 'TEST_SINGLE': {
            try {
                postStatus('loading', '生成中...');
                const t0 = Date.now();
                const preset = getActiveParamsPreset();
                const tags = (typeof data.tags === 'string' && data.tags.trim()) ? data.tags.trim() : '1girl, smile';
                const scene = joinTags(preset?.positivePrefix, tags);
                const base64 = await generateNovelImage({ scene, characterPrompts: [], negativePrompt: preset?.negativePrefix || '', params: preset?.params || {} });
                {
                    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
                    if (iframe) postToIframe(iframe, { type: 'TEST_RESULT', url: getPreviewDisplayUrl({ base64 }) }, 'LittleWhiteBox-NovelDraw');
                }
                postStatus('success', `完成 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
            } catch (e) {
                postStatus('error', e?.message);
            }
            break;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 初始化与清理
// ═══════════════════════════════════════════════════════════════════════════

export async function openNovelDrawSettings() {
    try {
        await loadSettings();
        await loadSharedDrawSettings();
    } catch {
        return false;
    }
    showOverlay();
    return true;
}

export async function initNovelDraw() {
    if (window?.isXiaobaixEnabled === false) return;
    if (moduleInitialized) return true;
    const initGeneration = ++moduleLifecycleGeneration;

    const [templatesOk, guidesOk] = await Promise.all([
        loadPromptTemplates(),
        loadTagGuide(),
    ]);
    if (initGeneration !== moduleLifecycleGeneration || window?.isXiaobaixEnabled === false) return false;
    if (!templatesOk || !guidesOk) {
        showToast('NovelAI 提示词资源加载失败，已停止初始化', 'error', 5000);
        return false;
    }
    let sharedDrawSettings;
    try {
        await loadSettings();
        sharedDrawSettings = await loadSharedDrawSettings();
    } catch {
        return false;
    }
    const [floatingPanel] = await Promise.all([
        import('./floating-panel.js'),
        openDB().then(() => clearExpiredCache(sharedDrawSettings.cacheDays)).catch(() => {}),
    ]);
    if (initGeneration !== moduleLifecycleGeneration || window?.isXiaobaixEnabled === false) return false;

    moduleInitialized = true;
    backendJobMonitors.activate();
    initAfterAiGate();
    afterAiGateDispose?.();
    afterAiGateDispose = registerAfterAiHandler(MODULE_KEY, ({ chatId, messageId }) => {
        if (String(getContext()?.chatId || '') !== String(chatId || '')) return;
        void renderSharedPreviewsForMessage(messageId);
    });
    ensureStyles();

    setupEventDelegation();
    startSharedDrawPreviewRuntime();

    // ════════════════════════════════════════════════════════════════════
    // 动态导入 floating-panel（避免循环依赖）
    // ════════════════════════════════════════════════════════════════════

    ensureNovelDrawPanelRef = floatingPanel.ensureNovelDrawPanel;
    floatingPanel.initFloatingPanel?.();

    // 为现有消息创建画图面板
    const renderExistingPanels = () => {
        const context = getContext();
        const chat = context.chat || [];
        
        chat.forEach((message, messageId) => {
            if (!message || message.is_user) return;
            
            const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
            if (!messageEl) return;
            
            ensureNovelDrawPanelRef?.(messageEl, messageId);
        });
    };

    // ════════════════════════════════════════════════════════════════════
    // 事件监听
    // ════════════════════════════════════════════════════════════════════

    // AI 消息渲染时创建画图按钮
    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
        if (messageId === undefined) return;
        
        const messageEl = document.querySelector(`.mes[mesid="${messageId}"]`);
        if (!messageEl) return;
        
        const context = getContext();
        const message = context.chat?.[messageId];
        if (message?.is_user) return;
        
        ensureNovelDrawPanelRef?.(messageEl, messageId);
    });

    events.on(event_types.CHARACTER_MESSAGE_RENDERED, (data) => {
        notifyNovelDrawAfterAi(data, 'character_message_rendered');
    });
    events.on(event_types.GENERATION_ENDED, async () => {
        notifyNovelDrawAfterAi(null, 'generation_ended');
        try {
            await autoGenerateForLastAI();
        } catch (e) {
            console.error('[NovelDraw]', e);
        }
    });

    // ST 停止键 / Escape → 同时中止 novel-draw 生成
    events.on(event_types.GENERATION_STOPPED, () => {
        console.log('[NovelDraw] ST 停止信号，中止图片生成');
        abortGeneration();
    });

    // 聊天切换时重新创建面板
    events.on(event_types.CHAT_CHANGED, () => {
        floatingPanel.refreshDrawRunUiState?.();
        setTimeout(renderExistingPanels, 200);
    });

    // ════════════════════════════════════════════════════════════════════
    // 初始渲染
    // ════════════════════════════════════════════════════════════════════

    renderExistingPanels();

    // ════════════════════════════════════════════════════════════════════
    // 全局 API
    // ════════════════════════════════════════════════════════════════════

    window.xiaobaixNovelDraw = {
        getSettings,
        getGenerationSnapshot,
        saveSettings,
        getQuickSettings,
        updateQuickSettings,
        generateNovelImage,
        generateImagesFromText,
        generateAndInsertImages,
        refreshSingleImage,
        saveSingleImage,
        testApiConnection,
        openSettings: openNovelDrawSettings,
        createPlaceholder,
        extractSlotIds,
        PLACEHOLDER_REGEX,
        renderAllPreviews: renderAllDrawPreviews,
        renderPreviewsForMessage: renderSharedPreviewsForMessage,
        getCacheStats,
        clearExpiredCache,
        clearAllCache,
        detectPresentCharacters,
        getPreviewsBySlot,
        getDisplayPreviewForSlot,
        openGallery,
        closeGallery,
        isEnabled: () => moduleInitialized,
        loadSettings,
    };

    window.registerModuleCleanup?.(MODULE_KEY, cleanupNovelDraw);
    console.log('[NovelDraw] 模块已初始化');
    return true;
}

export async function cleanupNovelDraw() {
    const cleanupGeneration = ++moduleLifecycleGeneration;
    moduleInitialized = false;
    settingsCache = null;
    settingsLoaded = false;
    events.cleanup();
    stopSharedDrawPreviewRuntime();
    afterAiGateDispose?.();
    afterAiGateDispose = null;
    hideOverlay();
    destroyGalleryCache();
    destroyCloudPresets();
    overlayCreated = false;
    frameReady = false;

    backendJobMonitors.deactivate();
    abortGeneration(null, { reason: 'teardown' });
    generationJobs = new Map();
    novelImageRequestQueue.clear();

    window.removeEventListener('message', handleFrameMessage);
    // 移除事件委托监听器（防止累积泄漏）
    document.removeEventListener('click', handleDelegatedClick, { capture: true });
    document.removeEventListener('touchstart', handleTouchStart, { passive: true });
    document.removeEventListener('touchmove', handleTouchMove, { passive: false });
    document.removeEventListener('touchend', handleTouchEnd, { passive: true });
    // 移除 overlay resize 监听器
    if (overlayResizeHandler) {
        window.removeEventListener('resize', overlayResizeHandler);
        window.visualViewport?.removeEventListener('resize', overlayResizeHandler);
        overlayResizeHandler = null;
    }
    document.getElementById('xiaobaix-novel-draw-overlay')?.remove();
    delete window.xiaobaixNovelDraw;
    delete window._xbNovelEventsBound;

    // 动态导入并清理
    try {
        const { destroyFloatingPanel } = await import('./floating-panel.js');
        if (cleanupGeneration === moduleLifecycleGeneration) destroyFloatingPanel();
    } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════════════════

export {
    getSettings,
    saveSettings,
    saveSettingsAndToast,
    persistSettings,
    updateSettingsPersistent,
    getQuickSettings,
    updateQuickSettings,
    loadSettings,
    getActiveParamsPreset,
    getActivePromptPreset,
    isModuleEnabled,
    findLastAIMessageId,
    generateImagesFromText,
    generateAndInsertImages,
    generateNovelImage,
    createPlaceholder,
    renderSharedPreviewsForMessage as renderPreviewsForMessage,
    buildImageHtml,
    insertPreviewIntoRenderedMessage,
    detectPresentCharacters,
    joinTags,
    ensureStyles as ensureNovelDrawStyles,
    classifyError,
    ErrorType,
    abortGeneration,
    isGenerating,
};
