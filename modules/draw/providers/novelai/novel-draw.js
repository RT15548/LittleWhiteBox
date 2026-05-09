// novel-draw.js

// ═══════════════════════════════════════════════════════════════════════════
// 导入
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../../../utils.js";
import { extensionFolderPath } from "../../../../core/constants.js";
import { createModuleEvents, event_types } from "../../../../core/event-manager.js";
import { NovelDrawStorage } from "../../../../core/server-storage.js";
import { initAfterAiGate, notifyAfterAiHint, registerAfterAiHandler } from "../../../../core/after-ai-gate.js";
import {
    openDB, storePreview, getPreview, getPreviewsBySlot,
    getDisplayPreviewForSlot, storeFailedPlaceholder, deleteFailedRecordsForSlot,
    setSlotSelection, clearSlotSelection,
    updatePreviewSavedUrl, deletePreview, getCacheStats, clearExpiredCache, clearAllCache,
    getGallerySummary, getCharacterPreviews, openGallery, closeGallery, destroyGalleryCache
} from '../../shared/gallery-cache.js';
import {
    PROVIDER_MAP,
    LLMServiceError,
    generateScenePlan,
    parseImagePlan,
} from '../../shared/scene-planner.js';
import {
    loadTagGuide,
    loadPromptTemplates,
    DEFAULT_PROMPT_CONFIG,
    PROMPT_TEMPLATE_VERSION,
    LEGACY_USER_JSON_FORMAT,
    getLoadedTagGuide,
} from './novel-prompts.js';
import { WorldbookProcessor } from '../../shared/worldbook-processor.js';
import {
    openCloudPresetsModal,
    downloadPresetAsFile,
    parsePresetData,
    destroyCloudPresets
} from './cloud-presets.js';
import { postToIframe, isTrustedMessage } from "../../../../core/iframe-messaging.js";
import { getDefaultApiPrefix, getModelListCandidateUrls } from "../../../../shared/common/openai-url-utils.js";
import {
    loadLocalDanbooruDB, unloadLocalDanbooruDB,
    searchLocalDanbooru, isDanbooruDBLoaded,
} from '../../shared/danbooru-local-db.js';

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_KEY = 'novelDraw';
const SERVER_FILE_KEY = 'settings';
const HTML_PATH = `${extensionFolderPath}/modules/draw/providers/novelai/novel-draw.html`;
const NOVELAI_IMAGE_API = 'https://image.novelai.net/ai/generate-image';
const CONFIG_VERSION = 5;
const MAX_SEED = 0xFFFFFFFF;
const API_TEST_TIMEOUT = 15000;
const PLACEHOLDER_REGEX = /\[image:([a-z0-9\-_]+)\]/gi;
const INITIAL_RENDER_MESSAGE_LIMIT = 1;

// ── 消息文本过滤 ──────────────────────────────────────────────────
const DEFAULT_MESSAGE_FILTER_RULES = [
    { start: '<think>',    end: '</think>' },
    { start: '<thinking>', end: '</thinking>' },
    { start: '<system>',   end: '</system>' },
    { start: '<meta>',     end: '</meta>' },
    { start: '<options>',  end: '</options>' },
    { start: '<WorldState>', end: '</WorldState>' },
    { start: '<state>',    end: '</state>' },
    { start: '<UpdateVariable>', end: '</UpdateVariable>' },
    { start: '<—',         end: '—>' },
    { start: '',           end: '</think>' },   // 孤立闭合标签：从开头到 </think>
];

function applyMessageFilterRules(text, rules) {
    if (!Array.isArray(rules) || !rules.length) return text;
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let result = String(text);
    for (const { start, end } of rules) {
        const s = (start || '').trim(), e = (end || '').trim();
        if (!s && !e) continue;
        if (s && e) {
            result = result.replace(new RegExp(esc(s) + '[\\s\\S]*?' + esc(e), 'gi'), '');
        } else if (s) {
            const idx = result.toLowerCase().indexOf(s.toLowerCase());
            if (idx >= 0) result = result.slice(0, idx);
        } else {
            const idx = result.toLowerCase().indexOf(e.toLowerCase());
            if (idx >= 0) result = result.slice(idx + e.length);
        }
    }
    return result.trim();
}

const events = createModuleEvents(MODULE_KEY);

const ImageState = { PREVIEW: 'preview', SAVING: 'saving', SAVED: 'saved', REFRESHING: 'refreshing', FAILED: 'failed' };

const ErrorType = {
    NETWORK: { code: 'network', label: '网络', desc: '连接超时或网络不稳定' },
    AUTH: { code: 'auth', label: '认证', desc: 'API Key 无效或过期' },
    QUOTA: { code: 'quota', label: '额度', desc: 'Anlas 点数不足' },
    BUSY: { code: 'busy', label: '繁忙', desc: '当前并发繁忙，请稍后重试' },
    PARSE: { code: 'parse', label: '解析', desc: '返回格式无法解析' },
    LLM: { code: 'llm', label: 'LLM', desc: '场景分析失败' },
    TIMEOUT: { code: 'timeout', label: '超时', desc: '请求超时' },
    UNKNOWN: { code: 'unknown', label: '错误', desc: '未知错误' },
    CACHE_LOST: { code: 'cache_lost', label: '缓存丢失', desc: '图片缓存已过期' },
};

const DEFAULT_PARAMS_PRESET = {
    id: '', name: '默认 (V4.5 Full)',
    positivePrefix: 'best quality, amazing quality, very aesthetic, absurdres,',
    negativePrefix: 'lowres, bad anatomy, bad hands, missing fingers, extra digits, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry',
    maxImages: 0,
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
    maxImages: 0,
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
    cacheDays: 3,
    selectedParamsPresetId: null,
    paramsPresets: [],
    requestDelay: { min: 15000, max: 30000 },
    timeout: 60000,
    llmApi: { provider: 'st', url: '', key: '', model: '', modelCache: [] },
    useStream: false,
    useWorldInfo: false,    
    characterTags: [],
    autoLearnCharacters: false,
    autoLearnMode: 'new_only',
    overrideSize: 'default',
    showFloorButton: true,
    showFloatingButton: false,
    advancedMode: false,
    customPrompts: { topSystem: null, tagGuideContent: null, userJsonFormat: null },
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
let moduleInitialized = false;
let touchState = null;
let settingsCache = null;
let settingsLoaded = false;
let generationJobs = new Map();
let imageRequestQueue = [];
let activeImageRequest = null;
let imageRequestSeq = 0;
let messageObserver = null;
let ensureNovelDrawPanelRef = null;
let overlayResizeHandler = null;
let afterAiGateDispose = null;

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
.xb-nd-img.busy img{opacity:0.5}
.xb-nd-img-wrap{position:relative;overflow:hidden;border-radius:10px;touch-action:pan-y pinch-zoom}
.xb-nd-img img{width:auto;height:auto;max-width:100%;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);display:block;user-select:none;-webkit-user-drag:none;transition:transform 0.25s ease,opacity 0.2s ease;will-change:transform,opacity}
.xb-nd-img img.sliding-left{animation:ndSlideOutLeft 0.25s ease forwards}
.xb-nd-img img.sliding-right{animation:ndSlideOutRight 0.25s ease forwards}
.xb-nd-img img.sliding-in-left{animation:ndSlideInLeft 0.25s ease forwards}
.xb-nd-img img.sliding-in-right{animation:ndSlideInRight 0.25s ease forwards}
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

function getNovelDrawSavedMap(message) {
    const savedMap = message?.extra?.novelDrawSaved;
    return savedMap && typeof savedMap === 'object' ? savedMap : null;
}

function getNovelDrawSavedEntry(message, slotId) {
    if (!slotId) return null;
    return getNovelDrawSavedMap(message)?.[slotId] || null;
}

function normalizeNovelDrawSavedEntry(slotId, data = {}) {
    if (!slotId || !data?.savedUrl) return null;
    return {
        slotId,
        imgId: data.imgId || '',
        savedUrl: data.savedUrl,
        tags: data.tags || '',
        positive: data.positive || '',
        anchor: data.anchor || '',
        updatedAt: Date.now(),
    };
}

async function persistChatSilently() {
    const ctx = getContext();
    if (!ctx?.saveChat) return;
    await Promise.resolve(ctx.saveChat());
}

async function setNovelDrawSavedEntry(messageId, slotId, data) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    const entry = normalizeNovelDrawSavedEntry(slotId, data);
    if (!message || !entry) return false;

    message.extra ||= {};
    message.extra.novelDrawSaved ||= {};

    const previous = message.extra.novelDrawSaved[slotId];
    const unchanged = previous &&
        previous.imgId === entry.imgId &&
        previous.savedUrl === entry.savedUrl &&
        previous.tags === entry.tags &&
        previous.positive === entry.positive &&
        previous.anchor === entry.anchor;
    if (unchanged) return true;

    message.extra.novelDrawSaved[slotId] = entry;
    await persistChatSilently();
    return true;
}

async function clearNovelDrawSavedEntry(messageId, slotId) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    const savedMap = getNovelDrawSavedMap(message);
    if (!message || !savedMap?.[slotId]) return false;

    delete savedMap[slotId];
    if (Object.keys(savedMap).length === 0 && message.extra) {
        delete message.extra.novelDrawSaved;
    }

    await persistChatSilently();
    return true;
}

async function syncNovelDrawSavedFromPreview(messageId, preview, overrides = {}) {
    const slotId = overrides.slotId || preview?.slotId;
    if (!slotId) return false;

    return setNovelDrawSavedEntry(messageId, slotId, {
        imgId: overrides.imgId || preview?.imgId,
        savedUrl: overrides.savedUrl || preview?.savedUrl,
        tags: overrides.tags ?? preview?.tags ?? '',
        positive: overrides.positive ?? preview?.positive ?? '',
        anchor: overrides.anchor ?? preview?.anchor ?? '',
    });
}

async function syncNovelDrawSavedAfterDeletion(messageId, slotId, deletedImgId, remainingPreviews = []) {
    const message = getContext().chat?.[messageId];
    const currentSaved = getNovelDrawSavedEntry(message, slotId);
    if (!currentSaved) return false;
    if (deletedImgId && currentSaved.imgId && currentSaved.imgId !== deletedImgId) return false;

    const replacement = remainingPreviews.find(item => item?.savedUrl);
    if (replacement) return syncNovelDrawSavedFromPreview(messageId, replacement, { slotId });
    return clearNovelDrawSavedEntry(messageId, slotId);
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

function joinTags(...parts) {
    return parts
        .filter(Boolean)
        .map(p => String(p).trim().replace(/[，、]/g, ',').replace(/^,+|,+$/g, ''))
        .filter(p => p.length > 0)
        .join(', ');
}

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
    const safeMin = (min > 0) ? min : DEFAULT_SETTINGS.requestDelay.min;
    const safeMax = (max > 0) ? max : DEFAULT_SETTINGS.requestDelay.max;
    return safeMin + Math.random() * (safeMax - safeMin);
}

function showToast(message, type = 'success', duration = 2500) {
    const colors = { success: 'rgba(62,207,142,0.95)', error: 'rgba(248,113,113,0.95)', info: 'rgba(212,165,116,0.95)' };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${colors[type] || colors.info};color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:99999;animation:fadeInOut ${duration / 1000}s ease-in-out;max-width:80vw;text-align:center;word-break:break-all`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

function isMessageBeingEdited(messageId) {
    if (!Number.isFinite(messageId)) return false;
    const mesElement = document.querySelector(`.mes[mesid="${messageId}"]`);
    if (!mesElement) return false;
    return mesElement.querySelector('textarea.edit_textarea') !== null || mesElement.classList.contains('editing');
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

function insertAfterFlowContainer(target, node) {
    if (!target?.parentElement || !node) return false;
    let ref = target;
    while (ref.nextElementSibling?.classList?.contains('xb-nd-img')) {
        ref = ref.nextElementSibling;
    }
    ref.insertAdjacentElement('afterend', node);
    return true;
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

    const pending = replacements.filter(item =>
        item?.slotId &&
        item?.html &&
        !root.querySelector(`.xb-nd-img[data-slot-id="${item.slotId}"]`)
    );
    if (pending.length === 0) return new Set();

    const placeholderMap = new Map(pending.map(item => [createPlaceholder(item.slotId), item]));
    const placeholderRegex = new RegExp(
        Array.from(placeholderMap.keys()).map(escapeRegexChars).join('|'),
        'g'
    );
    const resolvedSlotIds = new Set();
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

function collectRenderedTextSegments(root) {
    const segments = [];
    let text = '';

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node;
                if (el.classList?.contains('xb-nd-img')) return NodeFilter.FILTER_REJECT;
                if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                if (el.tagName === 'BR') return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
            return node.parentElement?.closest('.xb-nd-img')
                ? NodeFilter.FILTER_REJECT
                : NodeFilter.FILTER_ACCEPT;
        }
    });

    let node;
    while ((node = walker.nextNode())) {
        const chunk = node.nodeType === Node.TEXT_NODE ? node.nodeValue : '\n';
        if (!chunk) continue;
        const start = text.length;
        text += chunk;
        segments.push({ node, start, end: text.length, text: chunk });
    }

    return { text, segments };
}

function insertPreviewByAnchor(root, slotId, anchor, html) {
    if (!root || !slotId || !anchor) return false;
    if (root.querySelector(`.xb-nd-img[data-slot-id="${slotId}"]`)) return true;

    const { text, segments } = collectRenderedTextSegments(root);
    if (!text || !segments.length) return false;

    let position = findAnchorPosition(text, anchor);
    if (position < 0) return false;
    position = findNearestSentenceEnd(text, position);

    const segment = segments.find(item => item.end >= position) || segments[segments.length - 1];
    const replacementNode = createNodeFromHtml(html);
    if (!segment || !replacementNode) return false;

    const topLevelContainer = findTopLevelFlowContainer(root, segment.node);
    if (topLevelContainer) {
        return insertAfterFlowContainer(topLevelContainer, replacementNode);
    }

    root.appendChild(replacementNode);
    return true;
}

function insertPreviewBatchIntoRenderedMessage({ messageId, patches }) {
    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl || !Array.isArray(patches) || patches.length === 0) return false;

    const insertedSlotIds = replacePlaceholdersInDomBatch(mesTextEl, patches);
    let inserted = insertedSlotIds.size > 0;

    patches.forEach(patch => {
        if (!patch?.slotId || !patch?.html || insertedSlotIds.has(patch.slotId)) return;
        if (mesTextEl.querySelector(`.xb-nd-img[data-slot-id="${patch.slotId}"]`)) {
            inserted = true;
            return;
        }

        if (insertPreviewByAnchor(mesTextEl, patch.slotId, patch.anchor || '', patch.html)) {
            inserted = true;
        }
    });

    return inserted;
}

function insertPreviewIntoRenderedMessage({ messageId, slotId, html, anchor = '' }) {
    return insertPreviewBatchIntoRenderedMessage({
        messageId,
        patches: [{ slotId, html, anchor }],
    });

}

// ═══════════════════════════════════════════════════════════════════════════
// 中止控制
// ═══════════════════════════════════════════════════════════════════════════

function abortGeneration(messageId = null) {
    if (messageId !== null && messageId !== undefined) {
        const job = generationJobs.get(String(messageId));
        if (!job) return false;
        job.controller.abort();
        return true;
    }

    let aborted = false;
    generationJobs.forEach((job) => {
        job.controller.abort();
        aborted = true;
    });
    return aborted;
}

function isGenerating() {
    return autoBusy || generationJobs.size > 0;
}

function hasGenerationJob(messageId) {
    return generationJobs.has(String(messageId));
}

function createGenerationJob(messageId) {
    const key = String(messageId);
    if (generationJobs.has(key)) {
        throw new NovelDrawError('该楼层已有任务进行中', ErrorType.UNKNOWN);
    }

    const job = {
        key,
        messageId,
        controller: new AbortController(),
        createdAt: Date.now(),
    };
    generationJobs.set(key, job);
    return job;
}

function releaseGenerationJob(job) {
    if (job && generationJobs.get(job.key) === job) {
        generationJobs.delete(job.key);
    }
}

function notifyQueuedImageRequests() {
    imageRequestQueue.forEach((item, index) => {
        const ahead = (activeImageRequest ? 1 : 0) + index;
        if (ahead > 0) {
            item.onQueued?.({ ahead, position: ahead + 1 });
        }
    });
}

function pumpImageRequestQueue() {
    if (activeImageRequest || imageRequestQueue.length === 0) return;

    const item = imageRequestQueue.shift();
    activeImageRequest = item;
    notifyQueuedImageRequests();

    Promise.resolve()
        .then(async () => {
            if (item.signal?.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);
            item.onStart?.();
            return await item.run();
        })
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
            if (activeImageRequest === item) {
                activeImageRequest = null;
            }
            notifyQueuedImageRequests();
            pumpImageRequestQueue();
        });
}

function enqueueImageRequest(run, { signal, onQueued, onStart } = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new NovelDrawError('已取消', ErrorType.UNKNOWN));
            return;
        }

        const item = { id: ++imageRequestSeq, run, signal, onQueued, onStart, resolve, reject };

        signal?.addEventListener('abort', () => {
            if (activeImageRequest === item) return;
            const idx = imageRequestQueue.indexOf(item);
            if (idx >= 0) {
                imageRequestQueue.splice(idx, 1);
                notifyQueuedImageRequests();
                reject(new NovelDrawError('已取消', ErrorType.UNKNOWN));
            }
        }, { once: true });

        imageRequestQueue.push(item);
        notifyQueuedImageRequests();
        pumpImageRequestQueue();
    });
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

function classifyError(e) {
    if (e instanceof LLMServiceError) return ErrorType.LLM;
    if (e instanceof NovelDrawError && e.errorType) return e.errorType;
    const msg = (e?.message || '').toLowerCase();
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) return ErrorType.NETWORK;
    if (msg.includes('401') || msg.includes('key') || msg.includes('auth')) return ErrorType.AUTH;
    if (msg.includes('429') || msg.includes('too many requests') || msg.includes('rate limit') || msg.includes('请求频繁') || msg.includes('busy')) return ErrorType.BUSY;
    if (msg.includes('402') || msg.includes('anlas') || msg.includes('quota')) return ErrorType.QUOTA;
    if (msg.includes('timeout') || msg.includes('abort')) return ErrorType.TIMEOUT;
    if (msg.includes('parse') || msg.includes('json')) return ErrorType.PARSE;
    if (msg.includes('llm') || msg.includes('xbgenraw')) return ErrorType.LLM;
    return { ...ErrorType.UNKNOWN, desc: e?.message || '未知错误' };
}

function parseApiError(status, text) {
    switch (status) {
        case 401: return new NovelDrawError('API Key 无效', ErrorType.AUTH);
        case 402: return new NovelDrawError('Anlas 不足', ErrorType.QUOTA);
        case 429: return new NovelDrawError('当前并发繁忙，请稍后重试', ErrorType.BUSY);
        case 500:
        case 502:
        case 503: return new NovelDrawError('服务不可用', ErrorType.NETWORK);
        default: return new NovelDrawError(`失败: ${text || status}`, ErrorType.UNKNOWN);
    }
}

function handleFetchError(e) {
    if (e.name === 'AbortError') return new NovelDrawError('超时', ErrorType.TIMEOUT);
    if (e.message?.includes('Failed to fetch')) return new NovelDrawError('网络错误', ErrorType.NETWORK);
    if (e instanceof NovelDrawError) return e;
    return new NovelDrawError(e.message || '未知错误', ErrorType.UNKNOWN);
}

// ═══════════════════════════════════════════════════════════════════════════
// 设置管理
// ═══════════════════════════════════════════════════════════════════════════

function normalizeSettings(saved) {
    const merged = { ...DEFAULT_SETTINGS, ...(saved || {}) };
    merged.llmApi = { ...DEFAULT_SETTINGS.llmApi, ...(saved?.llmApi || {}) };
    merged.customPrompts = { ...DEFAULT_SETTINGS.customPrompts, ...(saved?.customPrompts || {}) };
    merged.worldbooks = { ...DEFAULT_SETTINGS.worldbooks, ...(saved?.worldbooks || {}) };
    if (!Array.isArray(merged.worldbooks.uploadedBooks)) merged.worldbooks.uploadedBooks = [];
    delete merged.worldbooks.selectedBooks; // 迁移：旧格式不兼容，清除

    if (!merged.paramsPresets?.length) {
        const id1 = generateSlotId();
        const id2 = generateSlotId();
        merged.paramsPresets = [
            { ...JSON.parse(JSON.stringify(DEFAULT_PARAMS_PRESET)), id: id1 },
            { ...JSON.parse(JSON.stringify(DEFAULT_PARAMS_PRESET_2)), id: id2 },
        ];
        merged.selectedParamsPresetId = id1;
    }
    // 确保每个 paramsPreset 都有 maxImages / maxCharactersPerImage
    for (const p of merged.paramsPresets) {
        if (typeof p.maxImages !== 'number') p.maxImages = 0;
        if (typeof p.maxCharactersPerImage !== 'number') p.maxCharactersPerImage = 0;
    }
    if (!merged.selectedParamsPresetId) merged.selectedParamsPresetId = merged.paramsPresets[0]?.id;
    if (!Number.isFinite(Number(merged.updatedAt))) merged.updatedAt = 0;

    merged.characterTags = (merged.characterTags || []).map(char => ({
        id: char.id || generateSlotId(),
        name: char.name || '',
        aliases: char.aliases || [],
        type: char.type || 'girl',
        appearance: char.appearance || char.tags || '',
        negativeTags: char.negativeTags || '',
        danbooruTag: char.danbooruTag || '',
        outfits: normalizeCharacterOutfits(char.outfits || char.costumes || char.clothes || []),
    }));

    merged.autoLearnCharacters = !!merged.autoLearnCharacters;
    merged.danbooruLocalDB = !!merged.danbooruLocalDB;
    merged.autoLearnMode = ['new_only', 'auto_update'].includes(merged.autoLearnMode)
        ? merged.autoLearnMode : 'new_only';

    delete merged.llmPresets;
    delete merged.selectedLlmPresetId;

    // ── 提示词预设迁移 ──
    // 与参数预设一致：存储实际值，不使用 null-means-default
    if (!Array.isArray(merged.promptPresets)) merged.promptPresets = [];
    if (!merged.promptPresets.length) {
        const id1 = generateSlotId();
        const id2 = generateSlotId();
        const id3 = generateSlotId();
        const cp = merged.customPrompts || {};
        merged.promptPresets = [
            { id: id1, name: '默认-模型要求高',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
              tagGuideContent: null,
              userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat },
            { id: id2, name: '默认-第一人称视角',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystemPov,
              tagGuideContent: null,
              userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat },
            { id: id3, name: '默认-模型要求低',
              topSystem: cp.topSystem || DEFAULT_PROMPT_CONFIG.topSystem,
              tagGuideContent: cp.tagGuideContent || null,
              userJsonFormat: cp.userJsonFormat || LEGACY_USER_JSON_FORMAT },
        ];
        merged.selectedPromptPresetId = id1;
    }
    // 迁移旧版预设名称
    const presetNameMigration = { '默认1': '默认-模型要求高', '默认2': '默认-模型要求低' };
    for (const p of merged.promptPresets) {
        if (presetNameMigration[p.name]) p.name = presetNameMigration[p.name];
    }
    // 默认预设内容跟随代码更新：当模板版本号变化时，自动更新未被用户手动编辑的默认预设
    const defaultPresetNames = ['默认-模型要求高', '默认-第一人称视角', '默认-模型要求低'];
    const storedVersion = merged._promptTemplateVersion || 0;
    if (storedVersion < PROMPT_TEMPLATE_VERSION) {
        // v3: 注入新的第一人称视角预设（如果不存在）
        if (!merged.promptPresets.some(p => p.name === '默认-第一人称视角')) {
            const insertIdx = merged.promptPresets.findIndex(p => p.name === '默认-模型要求低');
            const povPreset = {
                id: generateSlotId(), name: '默认-第一人称视角',
                topSystem: DEFAULT_PROMPT_CONFIG.topSystemPov,
                tagGuideContent: null,
                userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat,
            };
            if (insertIdx >= 0) merged.promptPresets.splice(insertIdx, 0, povPreset);
            else merged.promptPresets.push(povPreset);
            console.log('[NovelDraw] 已注入新预设 "默认-第一人称视角"');
        }
        for (const p of merged.promptPresets) {
            if (defaultPresetNames.includes(p.name)) {
                if (p.name === '默认-第一人称视角') {
                    p.topSystem = DEFAULT_PROMPT_CONFIG.topSystemPov;
                } else {
                    p.topSystem = DEFAULT_PROMPT_CONFIG.topSystem;
                }
                p.userJsonFormat = p.name === '默认-模型要求低' ? LEGACY_USER_JSON_FORMAT : DEFAULT_PROMPT_CONFIG.userJsonFormat;
                p.tagGuideContent = null;
                console.log(`[NovelDraw] 默认预设 "${p.name}" 已随版本更新 (v${storedVersion} → v${PROMPT_TEMPLATE_VERSION})`);
            }
        }
        merged._promptTemplateVersion = PROMPT_TEMPLATE_VERSION;
    }
    // 迁移：将旧版 null 字段替换为具体默认值（tagGuideContent 需文件加载后处理）
    for (const p of merged.promptPresets) {
        if (p.topSystem == null) p.topSystem = DEFAULT_PROMPT_CONFIG.topSystem;
        if (p.userJsonFormat == null) p.userJsonFormat = DEFAULT_PROMPT_CONFIG.userJsonFormat;
    }
    if (!merged.selectedPromptPresetId) merged.selectedPromptPresetId = merged.promptPresets[0]?.id;

    // ── 消息过滤规则规范化 ──
    if (!Array.isArray(merged.messageFilterRules)) merged.messageFilterRules = [];
    merged.messageFilterRules = merged.messageFilterRules
        .filter(r => r && typeof r === 'object')
        .map(r => ({ start: String(r.start || ''), end: String(r.end || '') }));

    return merged;
}

/** tagGuideContent 依赖文件异步加载，normalizeSettings 时不可用；在 loadTagGuide 后调一次 */
function migrateNullTagGuide() {
    const guide = getLoadedTagGuide();
    if (!guide) return;
    const s = getSettings();
    let migrated = false;
    for (const p of s.promptPresets) {
        if (p.tagGuideContent == null) {
            p.tagGuideContent = guide;
            migrated = true;
        }
    }
    if (migrated) {
        console.log('[NovelDraw] migrated null tagGuideContent → concrete default');
        saveSettings(s);
    }
}

async function loadSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await NovelDrawStorage.get(SERVER_FILE_KEY, null);
        console.log('[NovelDraw] loadSettings from server: autoLearn=%s, advMode=%s',
            saved?.autoLearnCharacters, saved?.advancedMode);
        settingsCache = normalizeSettings(saved || {});

        if (!saved || saved.configVersion !== CONFIG_VERSION) {
            settingsCache.configVersion = CONFIG_VERSION;
            settingsCache.updatedAt = Date.now();
            await NovelDrawStorage.setAndSave(SERVER_FILE_KEY, settingsCache, { silent: true });
        }
    } catch (e) {
        console.error('[NovelDraw] 加载设置失败:', e);
        settingsCache = normalizeSettings({});
    }

    settingsLoaded = true;
    return settingsCache;
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
        const id3 = generateSlotId();
        settingsCache.promptPresets = [
            { id: id1, name: '默认-模型要求高',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
              tagGuideContent: getLoadedTagGuide() || '',
              userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat },
            { id: id2, name: '默认-第一人称视角',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystemPov,
              tagGuideContent: getLoadedTagGuide() || '',
              userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat },
            { id: id3, name: '默认-模型要求低',
              topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
              tagGuideContent: getLoadedTagGuide() || '',
              userJsonFormat: LEGACY_USER_JSON_FORMAT },
        ];
        settingsCache.selectedPromptPresetId = id1;
    }
    return settingsCache;
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

async function persistSettings(s, okText = '已保存', { notify = true, silent = false } = {}) {
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
        const ok = await NovelDrawStorage.setAndSave(SERVER_FILE_KEY, next, { silent });
        if (ok !== false) {
            if (notify) {
                postStatus('success', okText);
            }
            console.log('[NovelDraw] persistSettings: SUCCESS');
            return true;
        }

        if (notify) {
            postStatus('error', '保存失败');
        }
        settingsCache = previous;
        console.warn('[NovelDraw] persistSettings: FAILED without throw');
        return false;
    } catch (e) {
        console.error('[NovelDraw] persistSettings: FAILED', e);
        settingsCache = previous;
        if (notify) {
            postStatus('error', `保存失败：${e?.message || '网络异常'}`);
        }
        return false;
    }
}

async function updateSettingsPersistent(mutator, okText = '已保存', options = {}) {
    const draft = cloneSettingsObject(getSettings());
    if (typeof mutator === 'function') {
        await mutator(draft);
    }
    return persistSettings(draft, okText, options);
}

async function saveSettingsAndToast(s, okText = '已保存') {
    return persistSettings(s, okText);
}

function getActiveParamsPreset() {
    const s = getSettings();
    return s.paramsPresets.find(p => p.id === s.selectedParamsPresetId) || s.paramsPresets[0];
}

function getActivePromptPreset() {
    const s = getSettings();
    return s.promptPresets.find(p => p.id === s.selectedPromptPresetId) || s.promptPresets[0] || null;
}

async function notifySettingsUpdated() {
    try {
        const { refreshPresetSelect, updateAutoModeUI } = await import('./floating-panel.js');
        refreshPresetSelect?.();
        updateAutoModeUI?.();
    } catch {}

    if (overlayCreated && frameReady) {
        try { await sendInitData(); } catch {}
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// JSZip
// ═══════════════════════════════════════════════════════════════════════════

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

async function extractImageFromZip(zipData) {
    const JSZip = await ensureJSZip();
    const zip = await JSZip.loadAsync(zipData);
    const file = Object.values(zip.files).find(f => f.name.endsWith('.png') || f.name.endsWith('.webp'));
    if (!file) throw new NovelDrawError('ZIP 无图片', ErrorType.PARSE);
    return await file.async('base64');
}

// ═══════════════════════════════════════════════════════════════════════════
// 角色检测与标签组装
// ═══════════════════════════════════════════════════════════════════════════

function normalizeCharacterOutfits(outfits = []) {
    return (Array.isArray(outfits) ? outfits : [])
        .map(outfit => ({
            name: String(outfit?.name || '').trim(),
            tags: String(outfit?.tags || '').trim(),
        }))
        .filter(outfit => outfit.name || outfit.tags);
}

function buildKnownCharacterBasePrompt(character = {}) {
    const naiTag = character.danbooruTag ? danbooruToNai(character.danbooruTag) : '';
    return joinTags(naiTag, character.type, character.appearance);
}

function detectPresentCharacters(messageText, characterTags) {
    if (!messageText || !characterTags?.length) return [];
    const text = messageText.toLowerCase();
    const present = [];

    for (const char of characterTags) {
        if (!char.name) continue;
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
                outfits: normalizeCharacterOutfits(char.outfits),
            });
        }
    }
    return present;
}

function assembleCharacterPrompts(sceneChars, knownCharacters) {
    return sceneChars.map(char => {
        const charLower = char.name.toLowerCase();
        const known = knownCharacters.find(k =>
            k.name.toLowerCase() === charLower
            || (k.aliases || []).some(a => a.toLowerCase() === charLower)
        );

        if (known) {
            const defaultCenter = { x: 0.5, y: 0.5 };
            return {
                prompt: joinTags(buildKnownCharacterBasePrompt(known), char.costume, char.action, char.interact),
                uc: joinTags(known.negativeTags, char.uc),
                center: gridToCoord(char.center) || defaultCenter
            };
        } else {
            const naiTag = char.danbooru ? danbooruToNai(char.danbooru) : '';
            return {
                prompt: joinTags(naiTag, char.type, char.appear, char.costume, char.action, char.interact),
                uc: char.uc || '',
                center: gridToCoord(char.center) || { x: 0.5, y: 0.5 }
            };
        }
    });
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
        const found = knownTags.find(k =>
            k.name.toLowerCase() === char.name.toLowerCase()
            || (k.aliases || []).some(a => a.toLowerCase() === char.name.toLowerCase())
        );

        if (!found) {
            const newChar = {
                id: generateSlotId(),
                name: char.name,
                aliases: [],
                type: char.type || 'girl',
                appearance: char.appear || '',
                negativeTags: '',
                danbooruTag: char.danbooru || '',
                outfits: [],
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

// ── 5x5 网格坐标 → NAI 浮点映射 ──────────────────────────────────
const GRID_COL = { A: 0.1, B: 0.3, C: 0.5, D: 0.7, E: 0.9 };
const GRID_ROW = { 1: 0.1, 2: 0.3, 3: 0.5, 4: 0.7, 5: 0.9 };

function gridToCoord(grid) {
    if (!grid || typeof grid !== 'string') return null;
    const m = grid.trim().toUpperCase().match(/^([A-E])([1-5])$/);
    if (!m) {
        console.warn(`[NovelDraw] 无效坐标 "${grid}"，使用默认中心位置`);
        return null;
    }
    return { x: GRID_COL[m[1]], y: GRID_ROW[m[2]] };
}

function countFields(char) {
    return ['type', 'appear', 'costume', 'action', 'interact', 'danbooru']
        .filter(f => char[f]).length;
}

// ═══════════════════════════════════════════════════════════════════════════
// Danbooru 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function danbooruToNai(tag) {
    return tag.replace(/_/g, ' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// NovelAI API
// ═══════════════════════════════════════════════════════════════════════════

async function testApiConnection(apiKey) {
    if (!apiKey) throw new NovelDrawError('请填写 API Key', ErrorType.AUTH);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), API_TEST_TIMEOUT);
    try {
        const res = await fetch(NOVELAI_IMAGE_API, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: 'test', model: 'nai-diffusion-3', action: 'generate', parameters: { width: 64, height: 64, steps: 1 } }),
            signal: controller.signal,
        });
        clearTimeout(tid);
        if (res.status === 401) throw new NovelDrawError('API Key 无效', ErrorType.AUTH);
        if (res.status === 400 || res.status === 402 || res.ok) return { success: true };
        throw new NovelDrawError(`返回: ${res.status}`, ErrorType.NETWORK);
    } catch (e) {
        clearTimeout(tid);
        throw handleFetchError(e);
    }
}

function buildNovelAIRequestBody({ scene, characterPrompts, negativePrompt, params }) {
    const dp = DEFAULT_PARAMS_PRESET.params;
    const width = params?.width ?? dp.width;
    const height = params?.height ?? dp.height;
    const seed = (params?.seed >= 0) ? params.seed : Math.floor(Math.random() * (MAX_SEED + 1));
    const modelName = params?.model ?? dp.model;
    const isV3 = modelName.includes('nai-diffusion-3') || modelName.includes('furry-3');
    const isV45 = modelName.includes('nai-diffusion-4-5');

    if (isV3) {
        const allCharPrompts = characterPrompts.map(cp => cp.prompt).filter(Boolean).join(', ');
        const fullPrompt = scene ? `${scene}, ${allCharPrompts}` : allCharPrompts;
        const allNegative = [negativePrompt, ...characterPrompts.map(cp => cp.uc)].filter(Boolean).join(', ');

        return {
            action: 'generate',
            input: String(fullPrompt || ''),
            model: modelName,
            parameters: {
                width, height,
                scale: params?.scale ?? dp.scale,
                seed,
                sampler: params?.sampler ?? dp.sampler,
                noise_schedule: params?.scheduler ?? dp.scheduler,
                steps: params?.steps ?? dp.steps,
                n_samples: 1,
                negative_prompt: String(allNegative || ''),
                ucPreset: params?.ucPreset ?? dp.ucPreset,
                sm: params?.sm ?? dp.sm,
                sm_dyn: params?.sm_dyn ?? dp.sm_dyn,
                dynamic_thresholding: params?.decrisper ?? dp.decrisper,
            },
        };
    }

    let skipCfgAboveSigma = null;
    if (isV45 && params?.variety_boost) {
        skipCfgAboveSigma = Math.pow((width * height) / 1011712, 0.5) * 58;
    }

    const charCaptions = characterPrompts.map(cp => ({
        char_caption: cp.prompt || '',
        centers: [cp.center || { x: 0.5, y: 0.5 }]
    }));

    const negativeCharCaptions = characterPrompts.map(cp => ({
        char_caption: cp.uc || '',
        centers: [cp.center || { x: 0.5, y: 0.5 }]
    }));

    return {
        action: 'generate',
        input: String(scene || ''),
        model: modelName,
        parameters: {
            params_version: 3,
            width, height,
            scale: params?.scale ?? dp.scale,
            seed,
            sampler: params?.sampler ?? dp.sampler,
            noise_schedule: params?.scheduler ?? dp.scheduler,
            steps: params?.steps ?? dp.steps,
            n_samples: 1,
            ucPreset: params?.ucPreset ?? dp.ucPreset,
            qualityToggle: params?.qualityToggle ?? dp.qualityToggle,
            autoSmea: params?.autoSmea ?? dp.autoSmea,
            cfg_rescale: params?.cfg_rescale ?? dp.cfg_rescale,
            dynamic_thresholding: false,
            controlnet_strength: 1,
            legacy: false,
            add_original_image: true,
            legacy_v3_extend: false,
            use_coords: characterPrompts.some(cp => cp.center && (cp.center.x !== 0.5 || cp.center.y !== 0.5)),
            legacy_uc: false,
            normalize_reference_strength_multiple: true,
            inpaintImg2ImgStrength: 1,
            deliberate_euler_ancestral_bug: false,
            prefer_brownian: true,
            image_format: 'png',
            skip_cfg_above_sigma: skipCfgAboveSigma,
            characterPrompts: characterPrompts.map(cp => ({
                prompt: cp.prompt || '',
                uc: cp.uc || '',
                center: cp.center || { x: 0.5, y: 0.5 },
                enabled: true
            })),
            v4_prompt: {
                caption: {
                    base_caption: String(scene || ''),
                    char_captions: charCaptions
                },
                use_coords: characterPrompts.some(cp => cp.center && (cp.center.x !== 0.5 || cp.center.y !== 0.5)),
                use_order: true
            },
            v4_negative_prompt: {
                caption: {
                    base_caption: String(negativePrompt || ''),
                    char_captions: negativeCharCaptions
                },
                legacy_uc: false
            },
            negative_prompt: String(negativePrompt || ''),
        },
    };
}

async function generateNovelImage({ scene, characterPrompts, negativePrompt, params, signal, onQueueStateChange }) {
    return await enqueueImageRequest(async () => {
        const settings = getSettings();
        if (!settings.apiKey) throw new NovelDrawError('请先配置 API Key', ErrorType.AUTH);

        const finalParams = { ...params };

        if (settings.overrideSize && settings.overrideSize !== 'default') {
            const { SIZE_OPTIONS } = await import('./floating-panel.js');
            const sizeOpt = SIZE_OPTIONS.find(o => o.value === settings.overrideSize);
            if (sizeOpt && sizeOpt.width && sizeOpt.height) {
                finalParams.width = sizeOpt.width;
                finalParams.height = sizeOpt.height;
            }
        }

        const controller = new AbortController();
        const timeout = (settings.timeout > 0) ? settings.timeout : DEFAULT_SETTINGS.timeout;
        const tid = setTimeout(() => controller.abort(), timeout);

        if (signal) {
            signal.addEventListener('abort', () => controller.abort(), { once: true });
        }

        const t0 = Date.now();

        try {
            if (signal?.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);

            const res = await fetch(NOVELAI_IMAGE_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` },
                signal: controller.signal,
                body: JSON.stringify(buildNovelAIRequestBody({
                    scene,
                    characterPrompts,
                    negativePrompt,
                    params: finalParams
                })),
            });
            if (!res.ok) throw parseApiError(res.status, await res.text().catch(() => ''));
            const buffer = await res.arrayBuffer();
            const base64 = await extractImageFromZip(buffer);
            console.log(`[NovelDraw] 完成 ${Date.now() - t0}ms`);
            return base64;
        } catch (e) {
            if (signal?.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);
            throw handleFetchError(e);
        } finally {
            clearTimeout(tid);
        }
    }, {
        signal,
        onQueued: (data) => onQueueStateChange?.('queued', data),
        onStart: () => onQueueStateChange?.('start'),
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 锚点定位
// ═══════════════════════════════════════════════════════════════════════════

function findAnchorPosition(mes, anchor) {
    if (!anchor || !mes) return -1;
    const a = anchor.trim();
    let idx = mes.indexOf(a);
    if (idx !== -1) return idx + a.length;
    if (a.length > 8) {
        const short = a.slice(-10);
        idx = mes.indexOf(short);
        if (idx !== -1) return idx + short.length;
    }
    const norm = s => s.replace(/[\s，。！？、""''：；…\-\n\r]/g, '');
    const normMes = norm(mes);
    const normA = norm(a);
    if (normA.length >= 4) {
        const key = normA.slice(-6);
        const normIdx = normMes.indexOf(key);
        if (normIdx !== -1) {
            let origIdx = 0, nIdx = 0;
            while (origIdx < mes.length && nIdx < normIdx + key.length) {
                if (norm(mes[origIdx]) === normMes[nIdx]) nIdx++;
                origIdx++;
            }
            return origIdx;
        }
    }
    return -1;
}

function findNearestSentenceEnd(mes, startPos) {
    if (startPos < 0 || !mes) return startPos;
    if (startPos >= mes.length) return mes.length;

    const maxLookAhead = 80;
    const endLimit = Math.min(mes.length, startPos + maxLookAhead);
    const basicEnders = new Set(['\u3002', '\uFF01', '\uFF1F', '!', '?', '\u2026']);
    const closingMarks = new Set(['\u201D', '\u201C', '\u2019', '\u2018', '\u300D', '\u300F', '\u3011', '\uFF09', ')', '"', "'", '*', '~', '\uFF5E', ']']);

    const eatClosingMarks = (pos) => {
        while (pos < mes.length && closingMarks.has(mes[pos])) pos++;
        return pos;
    };

    if (startPos > 0 && basicEnders.has(mes[startPos - 1])) {
        return eatClosingMarks(startPos);
    }

    for (let i = 0; i < maxLookAhead && startPos + i < endLimit; i++) {
        const pos = startPos + i;
        const char = mes[pos];
        if (char === '\n') return pos + 1;
        if (basicEnders.has(char)) return eatClosingMarks(pos + 1);
        if (char === '.' && mes.slice(pos, pos + 3) === '...') return eatClosingMarks(pos + 3);
    }

    return startPos;
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
    <button class="xb-nd-retry-btn" data-action="retry-image">🔄 重新生成</button>
    <button class="xb-nd-edit-btn" data-action="edit-tags">✏️ 编辑TAG</button>
    <button class="xb-nd-remove-btn" data-action="remove-placeholder">🗑️ 移除</button>
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

    await new Promise(r => setTimeout(r, 200));

    const newUrl = targetPreview.savedUrl || `data:image/png;base64,${targetPreview.base64}`;
    imgEl.src = newUrl;
    container.dataset.imgId = targetPreview.imgId;
    container.dataset.tags = escapeHtml(targetPreview.tags || '');
    container.dataset.positive = escapeHtml(targetPreview.positive || '');
    container.dataset.currentIndex = targetIndex;

    setImageState(container, targetPreview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW);
    updateNavControls(container, targetIndex, historyCount);
    await setSlotSelection(slotId, targetPreview.imgId);
    if (targetPreview.savedUrl) {
        const messageId = parseInt(container.dataset.mesid);
        void syncNovelDrawSavedFromPreview(messageId, targetPreview, { slotId }).catch(() => {});
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
                cont.querySelector('img').src = selected.savedUrl || `data:image/png;base64,${selected.base64}`;
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
                cont.querySelector('img').src = latest.savedUrl || `data:image/png;base64,${latest.base64}`;
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
            anchor: originalPreview.anchor || '',
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

    if (!tags || currentState === ImageState.SAVING || currentState === ImageState.REFRESHING || !slotId) return;

    toggleEditPanel(container, false);
    setImageState(container, ImageState.REFRESHING);

    try {
        const preset = getActiveParamsPreset();
        const settings = getSettings();

        let characterPrompts = null;
        let negativePrompt = preset.negativePrefix || '';
        let anchor = '';

        if (currentImgId) {
            const existingPreview = await getPreview(currentImgId);
            if (existingPreview?.characterPrompts?.length) {
                characterPrompts = existingPreview.characterPrompts;
            }
            if (existingPreview?.negativePrompt) {
                negativePrompt = existingPreview.negativePrompt;
            }
            anchor = existingPreview?.anchor || '';
        }

        if (!characterPrompts) {
            const ctx = getContext();
            const message = ctx.chat?.[messageId];
            const presentCharacters = detectPresentCharacters(String(message?.mes || ''), settings.characterTags || []);
            characterPrompts = presentCharacters.map(c => ({
                prompt: buildKnownCharacterBasePrompt(c),
                uc: c.negativeTags || '',
                center: { x: 0.5, y: 0.5 }
            }));
        }

        const scene = joinTags(preset.positivePrefix, tags);

        const base64 = await generateNovelImage({
            scene,
            characterPrompts,
            negativePrompt,
            params: preset.params || {}
        });

        const newImgId = generateImgId();
        await storePreview({
            imgId: newImgId,
            slotId,
            messageId,
            base64,
            tags,
            positive: scene,
            characterPrompts,
            negativePrompt,
            anchor,
        });
        await setSlotSelection(slotId, newImgId);

        container.querySelector('img').src = `data:image/png;base64,${base64}`;
        container.dataset.imgId = newImgId;
        container.dataset.positive = escapeHtml(scene);
        container.dataset.currentIndex = '0';
        setImageState(container, ImageState.PREVIEW);

        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
        container.dataset.historyCount = String(successPreviews.length);
        updateNavControls(container, 0, successPreviews.length);

        showToast(`图片已刷新（共 ${successPreviews.length} 个版本）`);
    } catch (e) {
        console.error('[NovelDraw] 刷新失败:', e);
        alert('刷新失败: ' + e.message);
        setImageState(container, ImageState.PREVIEW);
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
        const url = await saveBase64AsFile(preview.base64, charName, `novel_${imgId}`, 'png');
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
            container.querySelector('img').src = latest.savedUrl || `data:image/png;base64,${latest.base64}`;
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
    if (!slotId) return;

    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    container.innerHTML = `<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.6);"><div style="font-size:24px;margin-bottom:8px;">🎨</div><div>生成中...</div></div>`;

    try {
        const preset = getActiveParamsPreset();
        const settings = getSettings();
        const scene = tags ? joinTags(preset.positivePrefix, tags) : preset.positivePrefix;
        const negativePrompt = preset.negativePrefix || '';

        let characterPrompts = null;
        const failedPreviews = await getPreviewsBySlot(slotId);
        latestFailed = failedPreviews.find(p => p.status === 'failed');
        if (latestFailed?.characterPrompts?.length) {
            characterPrompts = latestFailed.characterPrompts;
        }

        if (!characterPrompts) {
            const ctx = getContext();
            const message = ctx.chat?.[messageId];
            const presentCharacters = detectPresentCharacters(String(message?.mes || ''), settings.characterTags || []);
            characterPrompts = presentCharacters.map(c => ({
                prompt: buildKnownCharacterBasePrompt(c),
                uc: c.negativeTags || '',
                center: { x: 0.5, y: 0.5 }
            }));
        }

        const base64 = await generateNovelImage({
            scene,
            characterPrompts,
            negativePrompt,
            params: preset.params || {}
        });

        const newImgId = generateImgId();
        await storePreview({
            imgId: newImgId,
            slotId,
            messageId,
            base64,
            tags: tags || '',
            positive: scene,
            characterPrompts,
            negativePrompt,
            anchor: latestFailed?.anchor || '',
        });
        await deleteFailedRecordsForSlot(slotId);
        await setSlotSelection(slotId, newImgId);

        const imgHtml = buildImageHtml({
            slotId,
            imgId: newImgId,
            url: `data:image/png;base64,${base64}`,
            tags: tags || '',
            positive: scene,
            messageId,
            state: ImageState.PREVIEW,
            historyCount: 1,
            currentIndex: 0
        });
        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        container.outerHTML = imgHtml;
        showToast('图片生成成功！');
    } catch (e) {
        console.error('[NovelDraw] 重试失败:', e);
        const errorType = classifyError(e);
        await storeFailedPlaceholder({
            slotId,
            messageId,
            tags: tags || '',
            positive: container.dataset.positive || '',
            errorType: errorType.code,
            anchor: latestFailed?.anchor || '',
            errorMessage: errorType.desc
        });
        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        container.outerHTML = buildFailedPlaceholderHtml({
            slotId,
            messageId,
            tags: tags || '',
            positive: container.dataset.positive || '',
            errorType: errorType.label,
            errorMessage: errorType.desc
        });
        showToast(`重试失败: ${errorType.desc}`, 'error');
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
    if (message) message.mes = message.mes.replace(createPlaceholder(slotId), '');
    container.remove();
    await persistChatSilently();
    showToast('占位符已移除');
}

// ═══════════════════════════════════════════════════════════════════════════
// 消息级懒加载
// ═══════════════════════════════════════════════════════════════════════════

function initMessageObserver() {
    if (messageObserver) return;
    messageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const mesEl = entry.target;
            messageObserver.unobserve(mesEl);
            const messageId = parseInt(mesEl.getAttribute('mesid'), 10);
            if (!Number.isNaN(messageId)) {
                renderPreviewsForMessage(messageId);
            }
        });
    }, { rootMargin: '600px 0px', threshold: 0.01 });
}

function observeMessageForLazyRender(messageId) {
    const mesEl = document.querySelector(`.mes[mesid="${messageId}"]`);
    if (!mesEl || mesEl.dataset.ndLazyObserved === '1') return;
    initMessageObserver();
    mesEl.dataset.ndLazyObserved = '1';
    messageObserver.observe(mesEl);
}

// ═══════════════════════════════════════════════════════════════════════════
// 预览渲染
// ═══════════════════════════════════════════════════════════════════════════

async function resolveRenderPreviewForSlot(message, messageId, slotId) {
    const savedEntry = getNovelDrawSavedEntry(message, slotId);
    if (savedEntry?.savedUrl) {
        const previews = await getPreviewsBySlot(slotId).catch(() => []);
        const successPreviews = previews.filter(p => p.status !== 'failed' && (p.base64 || p.savedUrl));
        const selectedIndex = successPreviews.findIndex(p => p.imgId === savedEntry.imgId);
        const matchedPreview = selectedIndex >= 0 ? successPreviews[selectedIndex] : null;

        return {
            preview: {
                ...matchedPreview,
                slotId,
                imgId: savedEntry.imgId || matchedPreview?.imgId || `saved-${slotId}`,
                savedUrl: savedEntry.savedUrl,
                tags: savedEntry.tags ?? matchedPreview?.tags ?? '',
                positive: savedEntry.positive ?? matchedPreview?.positive ?? '',
                anchor: savedEntry.anchor ?? matchedPreview?.anchor ?? '',
                messageId,
            },
            historyCount: selectedIndex >= 0 ? successPreviews.length : 1,
            currentIndex: selectedIndex >= 0 ? selectedIndex : 0,
            hasData: true,
            isFailed: false,
            source: 'message-extra',
        };
    }

    const displayData = await getDisplayPreviewForSlot(slotId);
    return { ...displayData, currentIndex: 0, source: 'gallery-cache' };
}

async function renderPreviewsForMessage(messageId) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message?.mes) return;

    const slotIds = extractSlotIds(message.mes);
    if (slotIds.size === 0) return;

    const mesTextEl = getMesTextElement(messageId);
    if (!mesTextEl) return;

    const replacements = [];

    for (const slotId of slotIds) {
        if (mesTextEl.querySelector(`.xb-nd-img[data-slot-id="${slotId}"]`)) continue;

        let replacementHtml;
        let anchor = '';

        try {
            const displayData = await resolveRenderPreviewForSlot(message, messageId, slotId);
            anchor = displayData.preview?.anchor || '';

            if (displayData.isFailed) {
                replacementHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId,
                    tags: displayData.failedInfo?.tags || '',
                    positive: displayData.failedInfo?.positive || '',
                    errorType: displayData.failedInfo?.errorType || ErrorType.CACHE_LOST.label,
                    errorMessage: displayData.failedInfo?.errorMessage || ErrorType.CACHE_LOST.desc
                });
            } else if (displayData.hasData && displayData.preview) {
                const url = displayData.preview.savedUrl || `data:image/png;base64,${displayData.preview.base64}`;
                replacementHtml = buildImageHtml({
                    slotId,
                    imgId: displayData.preview.imgId,
                    url,
                    tags: displayData.preview.tags || '',
                    positive: displayData.preview.positive || '',
                    messageId,
                    state: displayData.preview.savedUrl ? ImageState.SAVED : ImageState.PREVIEW,
                    historyCount: displayData.historyCount,
                    currentIndex: displayData.currentIndex ?? 0
                });
            } else {
                replacementHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId,
                    tags: '',
                    positive: '',
                    errorType: ErrorType.CACHE_LOST.label,
                    errorMessage: ErrorType.CACHE_LOST.desc
                });
            }
        } catch (e) {
            console.error(`[NovelDraw] 渲染 ${slotId} 失败:`, e);
            replacementHtml = buildFailedPlaceholderHtml({
                slotId,
                messageId,
                tags: '',
                positive: '',
                errorType: ErrorType.UNKNOWN.label,
                errorMessage: e?.message || '未知错误'
            });
        }

        replacements.push({ slotId, html: replacementHtml, anchor });
    }

    if (replacements.length === 0) return;

    const insertedSlotIds = replacePlaceholdersInDomBatch(mesTextEl, replacements);
    const pendingFallback = replacements.filter(item => !insertedSlotIds.has(item.slotId));
    if (pendingFallback.length === 0) return;

    let html = mesTextEl.innerHTML;
    let fallbackReplaced = false;

    for (const item of pendingFallback) {
        const placeholder = createPlaceholder(item.slotId);
        const escapedPlaceholder = placeholder.replace(/[[\]]/g, '\\$&');
        if (!new RegExp(escapedPlaceholder).test(html)) continue;

        html = html.replace(new RegExp(escapedPlaceholder, 'g'), item.html);
        fallbackReplaced = true;
    }

    let anchorInserted = false;
    if (!fallbackReplaced) {
        pendingFallback.forEach(item => {
            if (insertPreviewByAnchor(mesTextEl, item.slotId, item.anchor || '', item.html)) {
                anchorInserted = true;
            }
        });
    }

    if (fallbackReplaced && !anchorInserted && !isMessageBeingEdited(messageId)) {
        // Template-only UI markup built locally.
        // eslint-disable-next-line no-unsanitized/property
        mesTextEl.innerHTML = html;
    }
}

async function renderAllPreviews() {
    const ctx = getContext();
    const chat = ctx.chat || [];
    let rendered = 0;

    for (let i = chat.length - 1; i >= 0; i--) {
        if (extractSlotIds(chat[i]?.mes).size === 0) continue;
        if (rendered < INITIAL_RENDER_MESSAGE_LIMIT) {
            await renderPreviewsForMessage(i);
            rendered++;
        } else {
            observeMessageForLazyRender(i);
        }
    }
}

async function handleMessageRendered(data) {
    const messageId = typeof data === 'number' ? data : data?.messageId ?? data?.mesId;
    if (messageId !== undefined) await renderPreviewsForMessage(messageId);
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

async function handleChatChanged() {
    await new Promise(r => setTimeout(r, 50));
    await renderAllPreviews();
}

async function handleMessageModified(data) {
    const raw = typeof data === 'object' ? (data?.messageId ?? data?.mesId) : data;
    const messageId = parseInt(raw, 10);
    if (isNaN(messageId)) return;
    await new Promise(r => setTimeout(r, 100));
    await renderPreviewsForMessage(messageId);
}

// ═══════════════════════════════════════════════════════════════════════════
// 多图生成
// ═══════════════════════════════════════════════════════════════════════════

async function generateAndInsertImages({ messageId, onStateChange, skipLock = false }) {
    if (skipLock) {
        // 兼容旧调用：当前改为 message 级去重 + 图片请求队列，不再使用全局生成锁
    }

    const job = createGenerationJob(messageId);

    try {
        await loadSettings();
        const ctx = getContext();
        const message = ctx.chat?.[messageId];
        if (!message) throw new NovelDrawError('消息不存在', ErrorType.PARSE);

        const signal = job.controller.signal;
        const settings = getSettings();
        const preset = getActiveParamsPreset();

        const rawText = String(message.mes || '').replace(PLACEHOLDER_REGEX, '').trim();
        const filterRules = settings.messageFilterRules?.length
            ? settings.messageFilterRules
            : DEFAULT_MESSAGE_FILTER_RULES;
        const messageText = applyMessageFilterRules(rawText, filterRules);
        if (!messageText) throw new NovelDrawError('消息内容为空（可能被过滤规则清空）', ErrorType.PARSE);

        const presentCharacters = detectPresentCharacters(messageText, settings.characterTags || []);

        onStateChange?.('llm', {});

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);

        let planRaw;
        try {
            // 高级模式：世界书处理 + 自定义提示词
            let worldbookEntries = null;
            let customPrompts = getActivePromptPreset() || DEFAULT_PROMPT_CONFIG;
            if (settings.advancedMode) {
                if (settings.worldbooks?.enabled && settings.worldbooks.uploadedBooks?.length) {
                    const processor = new WorldbookProcessor();
                    const charNames = presentCharacters.map(c => c.name).join(' ');
                    const allEntries = settings.worldbooks.uploadedBooks.flatMap(b => b.entries || []);
                    worldbookEntries = processor.processFromEntries({
                        entries: allEntries,
                        contextText: messageText + ' ' + charNames,
                        keywordFilterMode: settings.worldbooks.keywordFilterMode || 'auto',
                    });
                }
            }

            planRaw = await generateScenePlan({
                messageText,
                presentCharacters,
                llmApi: settings.llmApi,
                useStream: settings.useStream,
                useWorldInfo: (settings.advancedMode && settings.worldbooks?.enabled) ? false : settings.useWorldInfo,
                customPrompts,
                worldbookEntries,
                timeout: settings.timeout || 120000,
                maxImages: preset.maxImages || 0,
                maxCharactersPerImage: preset.maxCharactersPerImage || 0,
                disablePrefill: !!settings.disablePrefill,
            });
        } catch (e) {
            if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);
            if (e instanceof LLMServiceError) {
                throw new NovelDrawError(`场景分析失败: ${e.message}`, ErrorType.LLM);
            }
            throw e;
        }

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);

        let tasks = parseImagePlan(planRaw);
        if (!tasks.length) throw new NovelDrawError('未解析到图片任务', ErrorType.PARSE);

        // 硬上限：截断图片数量和每张图角色数量
        const maxImg = preset.maxImages || 0;
        const maxChar = preset.maxCharactersPerImage || 0;
        if (maxImg > 0 && tasks.length > maxImg) {
            console.log(`[NovelDraw] 硬上限截断: ${tasks.length} → ${maxImg} 张图`);
            tasks = tasks.slice(0, maxImg);
        }
        if (maxChar > 0) {
            for (const task of tasks) {
                if (task.chars && task.chars.length > maxChar) {
                    task.chars = task.chars.slice(0, maxChar);
                }
            }
        }

        // 自动学习未知角色
        if (settings.autoLearnCharacters) {
            try {
                // 先在副本上操作，保存成功后才写回内存状态
                const tagsCopy = JSON.parse(JSON.stringify(settings.characterTags || []));
                const settingsCopy = { ...settings, characterTags: tagsCopy };
                const learnResult = autoLearnFromTasks(tasks, settingsCopy);
                if (learnResult.newChars.length || learnResult.updatedChars.length) {
                    const parts = [];
                    if (learnResult.newChars.length) parts.push(`新角色: ${learnResult.newChars.join(', ')}`);
                    if (learnResult.updatedChars.length) parts.push(`更新: ${learnResult.updatedChars.join(', ')}`);
                    const msg = `已学习 ${parts.join(' | ')}`;
                    persistSettings(settingsCopy, msg)
                        .then((ok) => { if (ok && overlayCreated && frameReady) sendInitData(); })
                        .catch(e => {
                            console.warn('[NovelDraw] 自动学习保存失败:', e);
                        });
                }
            } catch (e) {
                console.warn('[NovelDraw] 自动学习角色失败:', e);
            }
        }

        const initialChatId = ctx.chatId;
        const originalMes = message.mes; // 修改前备份，abort 时可回滚
        message.mes = message.mes.replace(PLACEHOLDER_REGEX, '');

        onStateChange?.('gen', { current: 0, total: tasks.length });

        const results = [];
        const { messageFormatting } = await import('../../../../../../../../script.js');
        let successCount = 0;
        let requiresFinalDomSync = false;

        for (let i = 0; i < tasks.length; i++) {
            if (signal.aborted) {
                console.log('[NovelDraw] 用户中止，停止生成');
                break;
            }

            const currentCtx = getContext();
            if (currentCtx.chatId !== initialChatId) {
                console.warn('[NovelDraw] 聊天已切换，中止生成');
                break;
            }
            const currentMsg = currentCtx.chat?.[messageId];
            if (!currentMsg || currentMsg !== message) {
                console.warn('[NovelDraw] 消息已删除或被替换，中止生成');
                break;
            }

            const task = tasks[i];
            const slotId = generateSlotId();

            onStateChange?.('progress', { current: i + 1, total: tasks.length });

            let position = findAnchorPosition(message.mes, task.anchor);

            const scene = joinTags(preset.positivePrefix, task.scene);
            const characterPrompts = assembleCharacterPrompts(task.chars, settings.characterTags || []);
            const tagsForStore = task.scene;
            let incrementalHtml = '';

            try {
                const base64 = await generateNovelImage({
                    scene,
                    characterPrompts,
                    negativePrompt: preset.negativePrefix || '',
                    params: preset.params || {},
                    signal,
                    onQueueStateChange: (queueState, queueData) => {
                        if (queueState === 'queued') {
                            onStateChange?.('queued', { current: i + 1, total: tasks.length, ...queueData });
                        }
                        if (queueState === 'start') {
                            onStateChange?.('progress', { current: i + 1, total: tasks.length });
                        }
                    }
                });
                const imgId = generateImgId();
                await storePreview({
                    imgId,
                    slotId,
                    messageId,
                    base64,
                    tags: tagsForStore,
                    positive: scene,
                    characterPrompts,
                    negativePrompt: preset.negativePrefix,
                    anchor: task.anchor,
                });
                await setSlotSelection(slotId, imgId);
                results.push({ slotId, imgId, tags: tagsForStore, success: true });
                incrementalHtml = buildImageHtml({
                    slotId,
                    imgId,
                    url: `data:image/png;base64,${base64}`,
                    tags: tagsForStore,
                    positive: scene,
                    messageId,
                    state: ImageState.PREVIEW,
                    historyCount: 1,
                    currentIndex: 0,
                });
                successCount++;
            } catch (e) {
                if (signal.aborted) {
                    console.log('[NovelDraw] 图片生成被中止');
                    break;
                }
                console.error(`[NovelDraw] 图${i + 1} 失败:`, e.message);
                const errorType = classifyError(e);
                await storeFailedPlaceholder({
                    slotId,
                    messageId,
                    tags: tagsForStore,
                    positive: scene,
                    errorType: errorType.code,
                    errorMessage: errorType.desc,
                    characterPrompts,
                    negativePrompt: preset.negativePrefix,
                    anchor: task.anchor,
                });
                results.push({ slotId, tags: tagsForStore, success: false, error: errorType });
                incrementalHtml = buildFailedPlaceholderHtml({
                    slotId,
                    messageId,
                    tags: tagsForStore,
                    positive: scene,
                    errorType: errorType.label,
                    errorMessage: errorType.desc
                });
            }

            if (signal.aborted) break;

            const msgCheck = getContext().chat?.[messageId];
            if (!msgCheck || msgCheck !== message) {
                console.warn('[NovelDraw] 消息已删除或被替换（swipe/重新生成），停止生图');
                break;
            }

            const placeholder = createPlaceholder(slotId);

            if (position >= 0) {
                position = findNearestSentenceEnd(message.mes, position);
                const before = message.mes.slice(0, position);
                const after = message.mes.slice(position);
                let insertText = placeholder;
                if (before.length > 0 && !before.endsWith('\n')) insertText = '\n' + insertText;
                if (after.length > 0 && !after.startsWith('\n')) insertText = insertText + '\n';
                message.mes = before + insertText + after;
            } else {
                const needNewline = message.mes.length > 0 && !message.mes.endsWith('\n');
                message.mes += (needNewline ? '\n' : '') + placeholder;
            }


            // ── 增量渲染：每张图完成后立即显示 ──
            try {
                const incCtx = getContext();
                const incMsg = incCtx.chat?.[messageId];
                if (incCtx.chatId === initialChatId && incMsg === message && !isMessageBeingEdited(messageId)) {
                    const inserted = insertPreviewIntoRenderedMessage({
                        messageId,
                        slotId,
                        html: incrementalHtml,
                        anchor: task.anchor,
                    });

                    if (!inserted) {
                        requiresFinalDomSync = true;
                        const formatted = messageFormatting(message.mes, message.name, message.is_system, message.is_user, messageId);
                        $(`[mesid="${messageId}"] .mes_text`).html(formatted);
                        await renderPreviewsForMessage(messageId);
                    }
                }
            } catch (e) {
                requiresFinalDomSync = true;
                console.warn('[NovelDraw] 增量渲染失败, 继续生成:', e);
            }

            if (i < tasks.length - 1) {
                const delay = randomDelay(settings.requestDelay?.min, settings.requestDelay?.max);
                onStateChange?.('cooldown', { duration: delay, nextIndex: i + 2, total: tasks.length });

                await new Promise(r => {
                    const tid = setTimeout(r, delay);
                    signal.addEventListener('abort', () => { clearTimeout(tid); r(); }, { once: true });
                });
            }
        }

        if (signal.aborted) {
            // ── abort 清理：恢复内容 / 同步 DOM / 保存 ──
            const abortCtx = getContext();
            const abortMsgValid = abortCtx.chatId === initialChatId && abortCtx.chat?.[messageId] === message;

            if (successCount === 0) {
                // 没有任何成功的图 → 完全回滚到原始内容
                message.mes = originalMes;
            }

            if (abortMsgValid && !isMessageBeingEdited(messageId)) {
                try {
                    if (successCount === 0 || requiresFinalDomSync) {
                        const formatted = messageFormatting(message.mes, message.name, message.is_system, message.is_user, messageId);
                        $(`[mesid="${messageId}"] .mes_text`).html(formatted);
                        await renderPreviewsForMessage(messageId);
                    }
                } catch (e) {
                    console.warn('[NovelDraw] abort DOM 同步失败:', e);
                }
                persistChatSilently().catch(() => {});
            }

            onStateChange?.('success', { success: successCount, total: tasks.length, aborted: true });
            return { success: successCount, total: tasks.length, results, aborted: true };
        }

        const finalCtx = getContext();
        const shouldUpdateDom = finalCtx.chatId === initialChatId &&
            finalCtx.chat?.[messageId] === message &&
            !isMessageBeingEdited(messageId);

        if (shouldUpdateDom && requiresFinalDomSync) {
            const formatted = messageFormatting(
                message.mes,
                message.name,
                message.is_system,
                message.is_user,
                messageId
            );
            $('[mesid="' + messageId + '"] .mes_text').html(formatted);

            await renderPreviewsForMessage(messageId);

            try {
                const { processMessageById } = await import('../iframe-renderer.js');
                processMessageById(messageId, true);
            } catch {}
        } else if (shouldUpdateDom) {
            console.log('[NovelDraw] 已跳过最终 full rerender，仅后台保存正文与局部 DOM patch');
        }

        const resultColor = successCount === tasks.length ? '#3ecf8e' : '#f0b429';
        console.log(`%c[NovelDraw] 完成: ${successCount}/${tasks.length} 张`, `color: ${resultColor}; font-weight: bold`);

        onStateChange?.('success', { success: successCount, total: tasks.length });

        if (shouldUpdateDom) {
            persistChatSilently().then(() => {
                console.log('[NovelDraw] 聊天已保存');
            }).catch(e => {
                console.warn('[NovelDraw] 保存聊天失败:', e);
            });
        }

        return { success: successCount, total: tasks.length, results };

    } finally {
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
    
    const content = String(lastMessage.mes || '').replace(PLACEHOLDER_REGEX, '').trim();
    if (content.length < 50) return;
    
    lastMessage.extra ||= {};
    if (lastMessage.extra.xb_novel_auto_done) return;

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
        
        await generateAndInsertImages({
            messageId: lastIdx,
            skipLock: true,
            onStateChange: (state, data) => {
                switch (state) {
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
        
        lastMessage.extra.xb_novel_auto_done = true;
        
    } catch (e) {
        console.error('[NovelDraw] 自动配图失败:', e);
        try {
            const { setStateForMessage, setFloatingState, FloatState } = await import('./floating-panel.js');
            const floatingOn = s.showFloatingButton === true;
            const floorOn = s.showFloorButton !== false;
            const useFloatingOnly = floatingOn && floorOn;

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
// 生成拦截器
// ═══════════════════════════════════════════════════════════════════════════

function setupGenerateInterceptor() {
    if (!window.xiaobaixGenerateInterceptor) {
        window.xiaobaixGenerateInterceptor = function (chat) {
            for (const msg of chat) {
                if (msg.mes) {
                    msg.mes = msg.mes.replace(PLACEHOLDER_REGEX, '');
                    msg.mes = msg.mes.replace(/<div[^>]*class="xb-nd-img"[^>]*>[\s\S]*?<\/div>/gi, '');
                }
            }
        };
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

    overlay.style.cssText = `position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:${window.innerHeight}px!important;z-index:99999!important;display:none;overflow:hidden!important;`;

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
    // 先读 settings，再做 IndexedDB 异步操作，避免 await 期间 settings 被其他 handler 修改导致发送旧值
    const settings = getSettings();
    let stats = { count: 0, sizeMB: 0 };
    let gallerySummary = {};
    try { stats = await getCacheStats(); } catch (e) { console.warn('[NovelDraw] getCacheStats failed:', e); }
    try { gallerySummary = await getGallerySummary(); } catch (e) { console.warn('[NovelDraw] getGallerySummary failed:', e); }
    console.log('[NovelDraw] sendInitData: autoLearn=%s, advancedMode=%s, promptPresets=%d',
        settings.autoLearnCharacters, settings.advancedMode, settings.promptPresets?.length);
    postToIframe(iframe, {
        type: 'INIT_DATA',
        settings: {
            enabled: moduleInitialized,
            mode: settings.mode,
            apiKey: settings.apiKey,
            timeout: settings.timeout,
            requestDelay: settings.requestDelay,
            cacheDays: settings.cacheDays,
            selectedParamsPresetId: settings.selectedParamsPresetId,
            paramsPresets: settings.paramsPresets,
            llmApi: settings.llmApi,
            useStream: settings.useStream,
            useWorldInfo: settings.useWorldInfo,
            disablePrefill: !!settings.disablePrefill,
            characterTags: settings.characterTags,
            autoLearnCharacters: !!settings.autoLearnCharacters,
            autoLearnMode: settings.autoLearnMode || 'new_only',
            danbooruLocalDB: !!settings.danbooruLocalDB,
            overrideSize: settings.overrideSize,
            showFloorButton: settings.showFloorButton !== false,
            showFloatingButton: settings.showFloatingButton === true,
            advancedMode: !!settings.advancedMode,
            customPrompts: settings.customPrompts || DEFAULT_SETTINGS.customPrompts,
            // 安全网：确保 tagGuideContent 在发送时已解析为具体值
            promptPresets: (settings.promptPresets || []).map(p =>
                p.tagGuideContent != null ? p : { ...p, tagGuideContent: getLoadedTagGuide() || '' }
            ),
            selectedPromptPresetId: settings.selectedPromptPresetId || null,
            worldbooks: settings.worldbooks || DEFAULT_SETTINGS.worldbooks,
            messageFilterRules: settings.messageFilterRules || [],
        },
        defaultPrompts: {
            topSystem: DEFAULT_PROMPT_CONFIG.topSystem,
            topSystemPov: DEFAULT_PROMPT_CONFIG.topSystemPov,
            tagGuideContent: getLoadedTagGuide(),
            userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat,
        },
        cacheStats: stats,
        gallerySummary,
    }, 'LittleWhiteBox-NovelDraw');
}

function postStatus(state, text) {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (iframe) postToIframe(iframe, { type: 'STATUS', state, text }, 'LittleWhiteBox-NovelDraw');
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
            // 若本地 Danbooru DB 已启用，预加载（失败只警告，不修改用户设置）
            if (getSettings().danbooruLocalDB) {
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
            }, '已保存');
            break;
        }

        case 'SAVE_API_CONFIG': {
            await updateSettingsPersistent((settings) => {
                if (typeof data.apiKey === 'string') {
                    settings.apiKey = data.apiKey.trim();
                }
                if (typeof data.timeout === 'number' && data.timeout > 0) {
                    settings.timeout = data.timeout;
                }
                if (data.requestDelay?.min > 0 && data.requestDelay?.max > 0) {
                    settings.requestDelay = data.requestDelay;
                }
            }, '已保存');
            break;
        }

        case 'SAVE_TIMEOUT': {
            await updateSettingsPersistent((settings) => {
                if (typeof data.timeout === 'number' && data.timeout > 0) settings.timeout = data.timeout;
                if (data.requestDelay?.min > 0 && data.requestDelay?.max > 0) settings.requestDelay = data.requestDelay;
            }, '已保存');
            break;
        }

        case 'SAVE_CACHE_DAYS': {
            await updateSettingsPersistent((settings) => {
                if (typeof data.cacheDays === 'number' && data.cacheDays >= 1 && data.cacheDays <= 30) {
                    settings.cacheDays = data.cacheDays;
                }
            }, '已保存');
            break;
        }

        case 'TEST_API': {
            try {
                postStatus('loading', '测试中...');
                await testApiConnection(data.apiKey);
                postStatus('success', '连接成功');
            } catch (e) {
                postStatus('error', e?.message);
            }
            break;
        }

        case 'SAVE_PARAMS_PRESET': {
            const ok = await updateSettingsPersistent((settings) => {
                if (data.selectedParamsPresetId) settings.selectedParamsPresetId = data.selectedParamsPresetId;
                if (Array.isArray(data.paramsPresets) && data.paramsPresets.length > 0) {
                    settings.paramsPresets = data.paramsPresets;
                }
            }, '已保存');
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
            }, '已创建');
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
                postStatus('error', '至少保留一个预设');
                break;
            }
            const ok = await updateSettingsPersistent((settings) => {
                const idx = settings.paramsPresets.findIndex(p => p.id === settings.selectedParamsPresetId);
                if (idx >= 0) settings.paramsPresets.splice(idx, 1);
                settings.selectedParamsPresetId = settings.paramsPresets[0]?.id || null;
            }, '已删除');
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
                const newPreset = parsePresetData(presetData, generateSlotId);
                const ok = await updateSettingsPersistent((settings) => {
                    settings.paramsPresets.push(newPreset);
                    settings.selectedParamsPresetId = newPreset.id;
                }, `已导入: ${newPreset.name}`);
                if (ok) {
                    await notifySettingsUpdated();
                    sendInitData();
                }
            });
            break;
        }
        case 'EXPORT_CURRENT_PRESET': {
            const s = getSettings();
            const presetId = data.presetId || s.selectedParamsPresetId;
            const preset = s.paramsPresets.find(p => p.id === presetId);
            if (!preset) {
                postStatus('error', '没有可导出的预设');
                break;
            }
            downloadPresetAsFile(preset);
            postStatus('success', '已导出');
            break;
        }

        // ═══════════════════════════════════════════════════════════════

        case 'SAVE_LLM_API': {
            const ok = await updateSettingsPersistent((settings) => {
                if (data.llmApi && typeof data.llmApi === 'object') {
                    const allowed = ['provider', 'url', 'key', 'model', 'modelCache'];
                    const clean = Object.fromEntries(allowed.filter(k => k in data.llmApi).map(k => [k, data.llmApi[k]]));
                    settings.llmApi = { ...settings.llmApi, ...clean };
                }
                if (typeof data.useStream === 'boolean') settings.useStream = data.useStream;
                if (typeof data.useWorldInfo === 'boolean') settings.useWorldInfo = data.useWorldInfo;
                if (typeof data.disablePrefill === 'boolean') settings.disablePrefill = data.disablePrefill;
            }, '已保存');
            if (ok) sendInitData();
            break;
        }

        // ═══════════════════════════════════════════════════════════════
        // 高级模式
        // ═══════════════════════════════════════════════════════════════

        case 'SAVE_ADVANCED_MODE': {
            // 仅持久化，不回传 INIT_DATA — iframe 已在本地完成 UI 切换
            const nextAdvancedMode = !!data.advancedMode;
            const ok = await updateSettingsPersistent((settings) => {
                settings.advancedMode = nextAdvancedMode;
            }, nextAdvancedMode ? '高级模式已开启' : '高级模式已关闭');
            if (!ok) {
                sendInitData();
            }
            break;
        }

        case 'RESET_CUSTOM_PROMPT': {
            const key = data.key;
            const ALLOWED_PROMPT_KEYS = ['topSystem', 'tagGuideContent', 'userJsonFormat'];
            if (key && ALLOWED_PROMPT_KEYS.includes(key)) {
                await updateSettingsPersistent((settings) => {
                    const presetId = data.selectedPromptPresetId || settings.selectedPromptPresetId;
                    const active = settings.promptPresets.find(p => p.id === presetId);
                    const isPov = active?.name === '默认-第一人称视角';
                    const resetDefaults = {
                        topSystem: isPov ? DEFAULT_PROMPT_CONFIG.topSystemPov : DEFAULT_PROMPT_CONFIG.topSystem,
                        tagGuideContent: getLoadedTagGuide() || '',
                        userJsonFormat: DEFAULT_PROMPT_CONFIG.userJsonFormat,
                    };
                    const defaultVal = resetDefaults[key];
                    if (settings.customPrompts) settings.customPrompts[key] = defaultVal;
                    if (active) active[key] = defaultVal;
                }, '已恢复默认');
            }
            sendInitData();
            break;
        }

        // ═══════════════════════════════════════════════════════════════
        // 提示词预设管理
        // ═══════════════════════════════════════════════════════════════

        case 'SELECT_PROMPT_PRESET': {
            if (data.id && getSettings().promptPresets.some(p => p.id === data.id)) {
                // 仅持久化，不回传 INIT_DATA — iframe 已在 change handler 中完成 UI 更新
                // 避免 sendInitData 的异步延迟导致下拉框 innerHTML 全量重建引起状态闪烁
                const ok = await updateSettingsPersistent((settings) => {
                    settings.selectedPromptPresetId = data.id;
                    const active = settings.promptPresets.find(p => p.id === data.id);
                    if (active) {
                        settings.customPrompts = {
                            topSystem: active.topSystem,
                            tagGuideContent: active.tagGuideContent,
                            userJsonFormat: active.userJsonFormat,
                        };
                    }
                }, '已切换预设');
                if (!ok) {
                    sendInitData();
                }
            }
            break;
        }

        case 'ADD_PROMPT_PRESET': {
            const id = generateSlotId();
            const current = getActivePromptPreset();
            const ok = await updateSettingsPersistent((settings) => {
                const newPreset = {
                    id,
                    name: (typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : `提示词-${settings.promptPresets.length + 1}`,
                    topSystem: current?.topSystem ?? DEFAULT_PROMPT_CONFIG.topSystem,
                    tagGuideContent: current?.tagGuideContent ?? getLoadedTagGuide() ?? '',
                    userJsonFormat: current?.userJsonFormat ?? DEFAULT_PROMPT_CONFIG.userJsonFormat,
                };
                settings.promptPresets.push(newPreset);
                settings.selectedPromptPresetId = id;
                settings.customPrompts = { topSystem: newPreset.topSystem, tagGuideContent: newPreset.tagGuideContent, userJsonFormat: newPreset.userJsonFormat };
            }, '已创建');
            if (ok) sendInitData();
            break;
        }

        case 'DEL_PROMPT_PRESET': {
            const s = getSettings();
            if (s.promptPresets.length <= 1) {
                postStatus('error', '至少保留一个预设');
                break;
            }
            const ok = await updateSettingsPersistent((settings) => {
                const idx = settings.promptPresets.findIndex(p => p.id === settings.selectedPromptPresetId);
                if (idx >= 0) settings.promptPresets.splice(idx, 1);
                settings.selectedPromptPresetId = settings.promptPresets[0]?.id || null;
                const active = settings.promptPresets.find(p => p.id === settings.selectedPromptPresetId);
                if (active) {
                    settings.customPrompts = { topSystem: active.topSystem, tagGuideContent: active.tagGuideContent, userJsonFormat: active.userJsonFormat };
                }
            }, '已删除');
            if (ok) sendInitData();
            break;
        }

        case 'RENAME_PROMPT_PRESET': {
            const active = getSettings().promptPresets.find(p => p.id === getSettings().selectedPromptPresetId);
            if (active && typeof data.name === 'string' && data.name.trim()) {
                await updateSettingsPersistent((settings) => {
                    const preset = settings.promptPresets.find(p => p.id === settings.selectedPromptPresetId);
                    if (preset) preset.name = data.name.trim();
                }, '已重命名');
                sendInitData();
            }
            break;
        }

        case 'SAVE_PROMPT_PRESET': {
            const active = getSettings().promptPresets.find(p => p.id === (data.selectedPromptPresetId || getSettings().selectedPromptPresetId));
            if (active && data.customPrompts && typeof data.customPrompts === 'object') {
                await updateSettingsPersistent((settings) => {
                    if (data.selectedPromptPresetId && settings.promptPresets.some(p => p.id === data.selectedPromptPresetId)) {
                        settings.selectedPromptPresetId = data.selectedPromptPresetId;
                    }
                    const current = settings.promptPresets.find(p => p.id === settings.selectedPromptPresetId);
                    if (!current) return;
                    const cp = data.customPrompts;
                    if ('topSystem' in cp) current.topSystem = cp.topSystem;
                    if ('tagGuideContent' in cp) current.tagGuideContent = cp.tagGuideContent;
                    if ('userJsonFormat' in cp) current.userJsonFormat = cp.userJsonFormat;
                    settings.customPrompts = { topSystem: current.topSystem, tagGuideContent: current.tagGuideContent, userJsonFormat: current.userJsonFormat };
                }, '提示词预设已保存');
            }
            sendInitData();
            break;
        }

        case 'SAVE_WORLDBOOK_CONFIG': {
            await updateSettingsPersistent((settings) => {
                if (data.worldbooks && typeof data.worldbooks === 'object') {
                    const allowed = ['enabled', 'uploadedBooks', 'keywordFilterMode'];
                    const clean = Object.fromEntries(allowed.filter(k => k in data.worldbooks).map(k => [k, data.worldbooks[k]]));
                    settings.worldbooks = { ...settings.worldbooks, ...clean };
                    if (!Array.isArray(settings.worldbooks.uploadedBooks)) settings.worldbooks.uploadedBooks = [];
                }
            }, '世界书配置已保存');
            sendInitData();
            break;
        }

        case 'FETCH_LLM_MODELS': {
            try {
                postStatus('loading', '连接中...');
                const apiCfg = data.llmApi || {};
                const apiKey = String(apiCfg.key || '').trim();
                if (!apiKey) {
                    postStatus('error', '请先填写 API KEY');
                    break;
                }

                const tryFetch = async url => {
                    try {
                        const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } });
                        if (!res.ok) return null;
                        return (await res.json())?.data?.map(m => m?.id).filter(Boolean) || null;
                    } catch {
                        return null;
                    }
                };

                let models = null;
                for (const url of getModelListCandidateUrls(apiCfg.url, getDefaultApiPrefix(apiCfg.provider))) {
                    models = await tryFetch(url);
                    if (models?.length) break;
                }
                if (!models?.length) throw new Error('未获取到模型列表');

                const ok = await updateSettingsPersistent((settings) => {
                    settings.llmApi.provider = apiCfg.provider;
                    settings.llmApi.url = apiCfg.url;
                    settings.llmApi.key = apiCfg.key;
                    settings.llmApi.modelCache = [...new Set(models)];
                    if (!settings.llmApi.model && models.length) settings.llmApi.model = models[0];
                }, `获取 ${models.length} 个模型`);
                if (ok) sendInitData();
            } catch (e) {
                postStatus('error', '连接失败：' + (e.message || '请检查配置'));
            }
            break;
        }

        case 'SAVE_CHARACTER_TAGS': {
            await updateSettingsPersistent((settings) => {
                if (Array.isArray(data.characterTags)) settings.characterTags = data.characterTags;
            }, '角色标签已保存');
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
                    const ok = await updateSettingsPersistent((settings) => {
                        settings.danbooruLocalDB = true;
                    }, `Danbooru 本地库已加载 (${db.length} 条)`);
                    if (!ok) {
                        unloadLocalDanbooruDB();
                    }
                } catch (e) {
                    unloadLocalDanbooruDB();
                    await updateSettingsPersistent((settings) => {
                        settings.danbooruLocalDB = false;
                    }, 'Danbooru 本地库加载失败');
                    console.warn('[NovelDraw] Failed to load local Danbooru DB:', e);
                }
            } else {
                unloadLocalDanbooruDB();
                await updateSettingsPersistent((settings) => {
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
            await updateSettingsPersistent((settings) => {
                settings.messageFilterRules = Array.isArray(data.rules) ? data.rules : [];
            }, '过滤规则已保存');
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
            const s = getSettings();
            const n = await clearExpiredCache(s.cacheDays || 3);
            sendInitData();
            postStatus('success', `已清理/瘦身 ${n} 条`);
            break;
        }

        case 'CLEAR_ALL_CACHE':
            await clearAllCache();
            sendInitData();
            postStatus('success', '已清空');
            break;

        case 'GET_PROMPT_CHAIN': {
            const { getPromptChainPreview } = await import('./novel-prompts.js');
            const chain = getPromptChainPreview(getSettings().customPrompts);
            const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
            if (iframe) postToIframe(iframe, { type: 'PROMPT_CHAIN_DATA', chain }, 'LittleWhiteBox-NovelDraw');
            break;
        }

        case 'REFRESH_CACHE_STATS':
            sendInitData();
            break;

        case 'USE_GALLERY_IMAGE':
            sendInitData();
            postStatus('success', '已选择');
            break;

        case 'SAVE_GALLERY_IMAGE': {
            try {
                const preview = await getPreview(data.imgId);
                if (!preview?.base64) {
                    postStatus('error', '图片数据不存在');
                    break;
                }
                const charName = preview.characterName || getChatCharacterName();
                const url = await saveBase64AsFile(preview.base64, charName, `novel_${data.imgId}`, 'png');
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
                        if (state === 'progress') postStatus('loading', `${d.current}/${d.total}`);
                        if (state === 'queued') postStatus('loading', d.ahead > 0 ? `排队中·前方 ${d.ahead}` : '排队中');
                    }
                });
                postStatus('success', `完成! ${result.success} 张`);
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
                    if (iframe) postToIframe(iframe, { type: 'TEST_RESULT', url: `data:image/png;base64,${base64}` }, 'LittleWhiteBox-NovelDraw');
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
    await loadSettings();
    showOverlay();
}

export async function initNovelDraw() {
    if (window?.isXiaobaixEnabled === false) return;

    await loadPromptTemplates();
    await loadSettings();
    moduleInitialized = true;
    initAfterAiGate();
    afterAiGateDispose?.();
    afterAiGateDispose = registerAfterAiHandler(MODULE_KEY, ({ chatId, messageId }) => {
        if (String(getContext()?.chatId || '') !== String(chatId || '')) return;
        void renderPreviewsForMessage(messageId);
    });
    ensureStyles();

    await loadTagGuide();

    // tagGuideContent 依赖文件加载，在此处完成 null → 具体值的迁移
    migrateNullTagGuide();

    setupEventDelegation();
    setupGenerateInterceptor();
    openDB().then(() => { 
        const s = getSettings(); 
        clearExpiredCache(s.cacheDays || 3); 
    });

    // ════════════════════════════════════════════════════════════════════
    // 动态导入 floating-panel（避免循环依赖）
    // ════════════════════════════════════════════════════════════════════
    
    const { ensureNovelDrawPanel: ensureNovelDrawPanelFn, initFloatingPanel } = await import('./floating-panel.js');
    ensureNovelDrawPanelRef = ensureNovelDrawPanelFn;
    initFloatingPanel?.();

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
    events.on(event_types.USER_MESSAGE_RENDERED, handleMessageRendered);
    events.on(event_types.CHAT_CHANGED, handleChatChanged);
    events.on(event_types.MESSAGE_EDITED, handleMessageModified);
    events.on(event_types.MESSAGE_UPDATED, handleMessageModified);
    events.on(event_types.MESSAGE_SWIPED, handleMessageModified);
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
        if (isGenerating()) {
            console.log('[NovelDraw] ST 停止信号，中止图片生成');
            abortGeneration();
        }
    });

    // 聊天切换时重新创建面板
    events.on(event_types.CHAT_CHANGED, () => {
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
        saveSettings,
        generateNovelImage,
        generateAndInsertImages,
        refreshSingleImage,
        saveSingleImage,
        testApiConnection,
        openSettings: openNovelDrawSettings,
        createPlaceholder,
        extractSlotIds,
        PLACEHOLDER_REGEX,
        renderAllPreviews,
        renderPreviewsForMessage,
        getCacheStats,
        clearExpiredCache,
        clearAllCache,
        detectPresentCharacters,
        assembleCharacterPrompts,
        getPreviewsBySlot,
        getDisplayPreviewForSlot,
        openGallery,
        closeGallery,
        isEnabled: () => moduleInitialized,
        loadSettings,
    };

    window.registerModuleCleanup?.(MODULE_KEY, cleanupNovelDraw);
    console.log('[NovelDraw] 模块已初始化');
}

export async function cleanupNovelDraw() {
    moduleInitialized = false;
    settingsCache = null;
    settingsLoaded = false;
    events.cleanup();
    afterAiGateDispose?.();
    afterAiGateDispose = null;
    hideOverlay();
    destroyGalleryCache();
    destroyCloudPresets();
    overlayCreated = false;
    frameReady = false;

    abortGeneration();
    generationJobs.clear();
    imageRequestQueue = [];
    activeImageRequest = null;

    if (messageObserver) {
        messageObserver.disconnect();
        messageObserver = null;
    }

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

    // 动态导入并清理
    try {
        const { destroyFloatingPanel } = await import('./floating-panel.js');
        destroyFloatingPanel();
    } catch {}

    delete window.xiaobaixNovelDraw;
    delete window._xbNovelEventsBound;
    delete window.xiaobaixGenerateInterceptor;
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
    loadSettings,
    getActiveParamsPreset,
    getActivePromptPreset,
    isModuleEnabled,
    findLastAIMessageId,
    generateAndInsertImages,
    generateNovelImage,
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
    ensureStyles as ensureNovelDrawStyles,
    classifyError,
    ErrorType,
    PROVIDER_MAP,
    abortGeneration,
    isGenerating,
};
