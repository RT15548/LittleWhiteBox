// novel-draw.js

// ═══════════════════════════════════════════════════════════════════════════
// 导入
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from "../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../utils.js";
import { extensionFolderPath } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { NovelDrawStorage } from "../../core/server-storage.js";
import {
    openDB, storePreview, getPreview, getPreviewsBySlot,
    getDisplayPreviewForSlot, storeFailedPlaceholder, deleteFailedRecordsForSlot,
    setSlotSelection, clearSlotSelection,
    updatePreviewSavedUrl, deletePreview, getCacheStats, clearExpiredCache, clearAllCache,
    getGallerySummary, getCharacterPreviews, openGallery, closeGallery, destroyGalleryCache
} from './gallery-cache.js';
import {
    PROVIDER_MAP,
    LLMServiceError,
    loadTagGuide,
    generateScenePlan,
    parseImagePlan,
} from './llm-service.js';
import {
    openCloudPresetsModal,
    downloadPresetAsFile,
    parsePresetData,
    destroyCloudPresets
} from './cloud-presets.js';

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const MODULE_KEY = 'novelDraw';
const SERVER_FILE_KEY = 'settings';
const HTML_PATH = `${extensionFolderPath}/modules/novel-draw/novel-draw.html`;
const NOVELAI_IMAGE_API = 'https://image.novelai.net/ai/generate-image';
const CONFIG_VERSION = 4;
const MAX_SEED = 0xFFFFFFFF;
const API_TEST_TIMEOUT = 15000;
const PLACEHOLDER_REGEX = /\[image:([a-z0-9\-_]+)\]/gi;
const INITIAL_RENDER_MESSAGE_LIMIT = 10;

const events = createModuleEvents(MODULE_KEY);

const ImageState = { PREVIEW: 'preview', SAVING: 'saving', SAVED: 'saved', REFRESHING: 'refreshing', FAILED: 'failed' };

const ErrorType = {
    NETWORK: { code: 'network', label: '网络', desc: '连接超时或网络不稳定' },
    AUTH: { code: 'auth', label: '认证', desc: 'API Key 无效或过期' },
    QUOTA: { code: 'quota', label: '额度', desc: 'Anlas 点数不足' },
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
    overrideSize: 'default',
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
let generationAbortController = null;
let messageObserver = null;

// ═══════════════════════════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════════════════════════

function ensureStyles() {
    if (document.getElementById('nd-styles')) return;
    const style = document.createElement('style');
    style.id = 'nd-styles';
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

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function createPlaceholder(slotId) { return `[image:${slotId}]`; }

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

function escapeHtml(str) { return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

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
    const mesElement = document.querySelector(`.mes[mesid="${messageId}"]`);
    if (!mesElement) return false;
    return mesElement.querySelector('textarea.edit_textarea') !== null || mesElement.classList.contains('editing');
}

// ═══════════════════════════════════════════════════════════════════════════
// 中止控制
// ═══════════════════════════════════════════════════════════════════════════

function abortGeneration() {
    if (generationAbortController) {
        generationAbortController.abort();
        generationAbortController = null;
        autoBusy = false;
        return true;
    }
    return false;
}

function isGenerating() {
    return generationAbortController !== null;
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
        case 429: return new NovelDrawError('请求频繁', ErrorType.QUOTA);
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

    if (!merged.paramsPresets?.length) {
        const id = generateSlotId();
        merged.paramsPresets = [{ ...JSON.parse(JSON.stringify(DEFAULT_PARAMS_PRESET)), id }];
        merged.selectedParamsPresetId = id;
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
        posX: char.posX ?? 0.5,
        posY: char.posY ?? 0.5,
    }));

    delete merged.llmPresets;
    delete merged.selectedLlmPresetId;

    return merged;
}

async function loadSettings() {
    if (settingsLoaded && settingsCache) return settingsCache;

    try {
        const saved = await NovelDrawStorage.get(SERVER_FILE_KEY, null);
        settingsCache = normalizeSettings(saved || {});

        if (!saved || saved.configVersion !== CONFIG_VERSION) {
            settingsCache.configVersion = CONFIG_VERSION;
            settingsCache.updatedAt = Date.now();
            NovelDrawStorage.set(SERVER_FILE_KEY, settingsCache);
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
    return settingsCache;
}

function saveSettings(s) {
    const next = normalizeSettings(s);
    next.updatedAt = Date.now();
    next.configVersion = CONFIG_VERSION;
    settingsCache = next;
    return next;
}

async function saveSettingsAndToast(s, okText = '已保存') {
    const next = saveSettings(s);

    try {
        const data = await NovelDrawStorage.load();
        data[SERVER_FILE_KEY] = next;
        NovelDrawStorage._dirtyVersion = (NovelDrawStorage._dirtyVersion || 0) + 1;

        await NovelDrawStorage.saveNow({ silent: false });
        postStatus('success', okText);
        return true;
    } catch (e) {
        postStatus('error', `保存失败：${e?.message || '网络异常'}`);
        return false;
    }
}

function getActiveParamsPreset() {
    const s = getSettings();
    return s.paramsPresets.find(p => p.id === s.selectedParamsPresetId) || s.paramsPresets[0];
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
        await new Promise(r => {
            const c = setInterval(() => {
                if (window.JSZip) { clearInterval(c); r(); }
            }, 50);
        });
        return window.JSZip;
    }
    jsZipLoaded = true;
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = () => resolve(window.JSZip);
        s.onerror = () => reject(new NovelDrawError('JSZip 加载失败', ErrorType.NETWORK));
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
                negativeTags: char.negativeTags || '',
                posX: char.posX ?? 0.5,
                posY: char.posY ?? 0.5,
            });
        }
    }
    return present;
}

function assembleCharacterPrompts(sceneChars, knownCharacters) {
    return sceneChars.map(char => {
        const known = knownCharacters.find(k =>
            k.name === char.name || k.aliases?.includes(char.name)
        );

        if (known) {

            return {
                prompt: joinTags(known.type, known.appearance, char.costume, char.action, char.interact),
                uc: known.negativeTags || '',
                center: { x: known.posX ?? 0.5, y: known.posY ?? 0.5 }
            };
        } else {

            return {
                prompt: joinTags(char.type, char.appear, char.costume, char.action, char.interact),
                uc: '',
                center: { x: 0.5, y: 0.5 }
            };
        }
    });
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
            use_coords: false,
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
                use_coords: false,
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

async function generateNovelImage({ scene, characterPrompts, negativePrompt, params, signal }) {
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
    <img src="${url}" style="max-width:100%;width:auto;height:auto;border-radius:10px;cursor:pointer;box-shadow:0 3px 15px rgba(0,0,0,0.25);${isBusy ? 'opacity:0.5;' : ''}" data-action="open-gallery" ${lazyAttr}>
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
    const successPreviews = previews.filter(p => p.status !== 'failed' && p.base64);
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

function setupEventDelegation() {
    if (window._xbNovelEventsBound) return;
    window._xbNovelEventsBound = true;

    document.addEventListener('click', async (e) => {
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
    }, { capture: true });

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
        },
        onSave: (imgId, url) => {
            const cont = document.querySelector(`.xb-nd-img[data-img-id="${imgId}"]`);
            if (cont) {
                cont.querySelector('img').src = url;
                setImageState(cont, ImageState.SAVED);
            }
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
            cont.outerHTML = failedHtml;
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

        if (currentImgId) {
            const existingPreview = await getPreview(currentImgId);
            if (existingPreview?.characterPrompts?.length) {
                characterPrompts = existingPreview.characterPrompts;
            }
            if (existingPreview?.negativePrompt) {
                negativePrompt = existingPreview.negativePrompt;
            }
        }

        if (!characterPrompts) {
            const ctx = getContext();
            const message = ctx.chat?.[messageId];
            const presentCharacters = detectPresentCharacters(String(message?.mes || ''), settings.characterTags || []);
            characterPrompts = presentCharacters.map(c => ({
                prompt: joinTags(c.type, c.appearance),
                uc: c.negativeTags || '',
                center: { x: c.posX ?? 0.5, y: c.posY ?? 0.5 }
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
        });
        await setSlotSelection(slotId, newImgId);

        container.querySelector('img').src = `data:image/png;base64,${base64}`;
        container.dataset.imgId = newImgId;
        container.dataset.positive = escapeHtml(scene);
        container.dataset.currentIndex = '0';
        setImageState(container, ImageState.PREVIEW);

        const previews = await getPreviewsBySlot(slotId);
        const successPreviews = previews.filter(p => p.status !== 'failed' && p.base64);
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
    const preview = await getPreview(imgId);
    if (!preview?.base64) { alert('图片数据丢失，请刷新'); return; }
    setImageState(container, ImageState.SAVING);
    try {
        const charName = preview.characterName || getChatCharacterName();
        const url = await saveBase64AsFile(preview.base64, charName, `novel_${imgId}`, 'png');
        await updatePreviewSavedUrl(imgId, url);
        await setSlotSelection(slotId, imgId);
        container.querySelector('img').src = url;
        setImageState(container, ImageState.SAVED);
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
        const successPreviews = previews.filter(p => p.status !== 'failed' && p.base64);

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
            showToast(`已删除（剩余 ${successPreviews.length} 张）`);
        } else {
            await clearSlotSelection(slotId);
            const failedHtml = buildFailedPlaceholderHtml({
                slotId,
                messageId,
                tags,
                positive,
                errorType: '图片已删除',
                errorMessage: '点击重试可重新生成'
            });
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
    if (!slotId) return;

    container.innerHTML = `<div style="padding:30px;text-align:center;color:rgba(255,255,255,0.6);"><div style="font-size:24px;margin-bottom:8px;">🎨</div><div>生成中...</div></div>`;

    try {
        const preset = getActiveParamsPreset();
        const settings = getSettings();
        const scene = tags ? joinTags(preset.positivePrefix, tags) : preset.positivePrefix;
        const negativePrompt = preset.negativePrefix || '';

        let characterPrompts = null;
        const failedPreviews = await getPreviewsBySlot(slotId);
        const latestFailed = failedPreviews.find(p => p.status === 'failed');
        if (latestFailed?.characterPrompts?.length) {
            characterPrompts = latestFailed.characterPrompts;
        }

        if (!characterPrompts) {
            const ctx = getContext();
            const message = ctx.chat?.[messageId];
            const presentCharacters = detectPresentCharacters(String(message?.mes || ''), settings.characterTags || []);
            characterPrompts = presentCharacters.map(c => ({
                prompt: joinTags(c.type, c.appearance),
                uc: c.negativeTags || '',
                center: { x: c.posX ?? 0.5, y: c.posY ?? 0.5 }
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
            errorMessage: errorType.desc
        });
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
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (message) message.mes = message.mes.replace(createPlaceholder(slotId), '');
    container.remove();
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

async function renderPreviewsForMessage(messageId) {
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message?.mes) return;

    const slotIds = extractSlotIds(message.mes);
    if (slotIds.size === 0) return;

    const $mesText = $(`#chat .mes[mesid="${messageId}"] .mes_text`);
    if (!$mesText.length) return;

    let html = $mesText.html();
    let replaced = false;

    for (const slotId of slotIds) {
        if (html.includes(`data-slot-id="${slotId}"`)) continue;

        const placeholder = createPlaceholder(slotId);
        const escapedPlaceholder = placeholder.replace(/[[\]]/g, '\\$&');
        if (!new RegExp(escapedPlaceholder).test(html)) continue;

        let replacementHtml;

        try {
            const displayData = await getDisplayPreviewForSlot(slotId);

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
                    currentIndex: 0
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

        html = html.replace(new RegExp(escapedPlaceholder, 'g'), replacementHtml);
        replaced = true;
    }

    if (replaced && !isMessageBeingEdited(messageId)) {
        $mesText.html(html);
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

async function generateAndInsertImages({ messageId, onStateChange }) {
    await loadSettings();
    const ctx = getContext();
    const message = ctx.chat?.[messageId];
    if (!message) throw new NovelDrawError('消息不存在', ErrorType.PARSE);

    generationAbortController = new AbortController();
    const signal = generationAbortController.signal;

    try {
        const settings = getSettings();
        const preset = getActiveParamsPreset();

        const messageText = String(message.mes || '').replace(PLACEHOLDER_REGEX, '').trim();
        if (!messageText) throw new NovelDrawError('消息内容为空', ErrorType.PARSE);

        const presentCharacters = detectPresentCharacters(messageText, settings.characterTags || []);

        onStateChange?.('llm', {});

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);

        let planRaw;
        try {
            planRaw = await generateScenePlan({
                messageText,
                presentCharacters,
                llmApi: settings.llmApi,
                useStream: settings.useStream,
                useWorldInfo: settings.useWorldInfo,
                timeout: settings.timeout || 120000
            });
        } catch (e) {
            if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);
            if (e instanceof LLMServiceError) {
                throw new NovelDrawError(`场景分析失败: ${e.message}`, ErrorType.LLM);
            }
            throw e;
        }

        if (signal.aborted) throw new NovelDrawError('已取消', ErrorType.UNKNOWN);

        const tasks = parseImagePlan(planRaw);
        if (!tasks.length) throw new NovelDrawError('未解析到图片任务', ErrorType.PARSE);

        const initialChatId = ctx.chatId;
        message.mes = message.mes.replace(PLACEHOLDER_REGEX, '');

        onStateChange?.('gen', { current: 0, total: tasks.length });

        const results = [];
        const { messageFormatting } = await import('../../../../../../script.js');
        let successCount = 0;

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
            if (!currentCtx.chat?.[messageId]) {
                console.warn('[NovelDraw] 消息已删除，中止生成');
                break;
            }

            const task = tasks[i];
            const slotId = generateSlotId();

            onStateChange?.('progress', { current: i + 1, total: tasks.length });

            let position = findAnchorPosition(message.mes, task.anchor);

            const scene = joinTags(preset.positivePrefix, task.scene);
            const characterPrompts = assembleCharacterPrompts(task.chars, settings.characterTags || []);
            const tagsForStore = task.scene;

            try {
                const base64 = await generateNovelImage({
                    scene,
                    characterPrompts,
                    negativePrompt: preset.negativePrefix || '',
                    params: preset.params || {},
                    signal
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
                    negativePrompt: preset.negativePrefix
                });
                await setSlotSelection(slotId, imgId);
                results.push({ slotId, imgId, tags: tagsForStore, success: true });
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
                });
                results.push({ slotId, tags: tagsForStore, success: false, error: errorType });
            }

            if (signal.aborted) break;

            const msgCheck = getContext().chat?.[messageId];
            if (!msgCheck) {
                console.warn('[NovelDraw] 消息已删除，跳过占位符插入');
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

            if (signal.aborted) break;

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
            onStateChange?.('success', { success: successCount, total: tasks.length, aborted: true });
            return { success: successCount, total: tasks.length, results, aborted: true };
        }

        const finalCtx = getContext();
        const shouldUpdateDom = finalCtx.chatId === initialChatId &&
            finalCtx.chat?.[messageId] &&
            !isMessageBeingEdited(messageId);

        if (shouldUpdateDom) {
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
        }

        const resultColor = successCount === tasks.length ? '#3ecf8e' : '#f0b429';
        console.log(`%c[NovelDraw] 完成: ${successCount}/${tasks.length} 张`, `color: ${resultColor}; font-weight: bold`);

        onStateChange?.('success', { success: successCount, total: tasks.length });

        if (shouldUpdateDom) {
            getContext().saveChat?.().then(() => {
                console.log('[NovelDraw] 聊天已保存');
            }).catch(e => {
                console.warn('[NovelDraw] 保存聊天失败:', e);
            });
        }

        return { success: successCount, total: tasks.length, results };

    } finally {
        generationAbortController = null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 自动模式
// ═══════════════════════════════════════════════════════════════════════════

async function autoGenerateForLastAI() {
    const s = getSettings();
    if (!isModuleEnabled() || s.mode !== 'auto' || autoBusy) return;
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
    autoBusy = true;
    try {
        const { setState, FloatState } = await import('./floating-panel.js');
        await generateAndInsertImages({
            messageId: lastIdx,
            onStateChange: (state, data) => {
                switch (state) {
                    case 'llm': setState(FloatState.LLM); break;
                    case 'gen': setState(FloatState.GEN, data); break;
                    case 'progress': setState(FloatState.GEN, data); break;
                    case 'cooldown': setState(FloatState.COOLDOWN, data); break;
                    case 'success': setState(data.success === data.total ? FloatState.SUCCESS : FloatState.PARTIAL, data); break;
                }
            }
        });
        lastMessage.extra.xb_novel_auto_done = true;
    } catch (e) {
        console.error('[NovelDraw] 自动配图失败:', e);
        const { setState, FloatState } = await import('./floating-panel.js');
        setState(FloatState.ERROR, { error: classifyError(e) });
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
            overlay.style.height = `${window.innerHeight}px`;
        }
    };
    window.addEventListener('resize', updateHeight);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateHeight);
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'nd-backdrop';
    backdrop.addEventListener('click', hideOverlay);

    const frameWrap = document.createElement('div');
    frameWrap.className = 'nd-frame-wrap';

    const iframe = document.createElement('iframe');
    iframe.id = 'xiaobaix-novel-draw-iframe';
    iframe.src = HTML_PATH;

    frameWrap.appendChild(iframe);
    overlay.appendChild(backdrop);
    overlay.appendChild(frameWrap);
    document.body.appendChild(overlay);
    window.addEventListener('message', handleFrameMessage);
}

function showOverlay() {
    if (!overlayCreated) createOverlay();
    const overlay = document.getElementById('xiaobaix-novel-draw-overlay');
    if (overlay) {
        overlay.style.height = `${window.innerHeight}px`;
        overlay.style.display = 'block';
    }
    if (frameReady) sendInitData();
}

function hideOverlay() {
    const overlay = document.getElementById('xiaobaix-novel-draw-overlay');
    if (overlay) overlay.style.display = 'none';
}

async function sendInitData() {
    const iframe = document.getElementById('xiaobaix-novel-draw-iframe');
    if (!iframe?.contentWindow) return;
    const stats = await getCacheStats();
    const settings = getSettings();
    const gallerySummary = await getGallerySummary();
    iframe.contentWindow.postMessage({
        source: 'LittleWhiteBox-NovelDraw',
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
            characterTags: settings.characterTags,
            overrideSize: settings.overrideSize,
        },
        cacheStats: stats,
        gallerySummary,
    }, '*');
}

function postStatus(state, text) {
    document.getElementById('xiaobaix-novel-draw-iframe')?.contentWindow?.postMessage({ source: 'LittleWhiteBox-NovelDraw', type: 'STATUS', state, text }, '*');
}

async function handleFrameMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'NovelDraw-Frame') return;

    switch (data.type) {
        case 'FRAME_READY':
            frameReady = true;
            sendInitData();
            break;

        case 'CLOSE':
            hideOverlay();
            break;

        case 'SAVE_MODE': {
            const s = getSettings();
            s.mode = data.mode || s.mode;
            await saveSettingsAndToast(s, '已保存');
            import('./floating-panel.js').then(m => m.updateAutoModeUI?.());
            break;
        }

        case 'SAVE_API_KEY': {
            const s = getSettings();
            s.apiKey = typeof data.apiKey === 'string' ? data.apiKey : s.apiKey;
            await saveSettingsAndToast(s, '已保存');
            break;
        }

        case 'SAVE_TIMEOUT': {
            const s = getSettings();
            if (typeof data.timeout === 'number' && data.timeout > 0) s.timeout = data.timeout;
            if (data.requestDelay?.min > 0 && data.requestDelay?.max > 0) s.requestDelay = data.requestDelay;
            await saveSettingsAndToast(s, '已保存');
            break;
        }

        case 'SAVE_CACHE_DAYS': {
            const s = getSettings();
            if (typeof data.cacheDays === 'number' && data.cacheDays >= 1 && data.cacheDays <= 30) {
                s.cacheDays = data.cacheDays;
            }
            await saveSettingsAndToast(s, '已保存');
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
            const s = getSettings();
            if (data.selectedParamsPresetId) s.selectedParamsPresetId = data.selectedParamsPresetId;
            if (Array.isArray(data.paramsPresets) && data.paramsPresets.length > 0) {
                s.paramsPresets = data.paramsPresets;
            }
            const ok = await saveSettingsAndToast(s, '已保存');
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
            const s = getSettings();
            const id = generateSlotId();
            const base = getActiveParamsPreset() || DEFAULT_PARAMS_PRESET;
            const copy = JSON.parse(JSON.stringify(base));
            copy.id = id;
            copy.name = (typeof data.name === 'string' && data.name.trim()) ? data.name.trim() : `配置-${s.paramsPresets.length + 1}`;
            s.paramsPresets.push(copy);
            s.selectedParamsPresetId = id;
            const ok = await saveSettingsAndToast(s, '已创建');
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
            const idx = s.paramsPresets.findIndex(p => p.id === s.selectedParamsPresetId);
            if (idx >= 0) s.paramsPresets.splice(idx, 1);
            s.selectedParamsPresetId = s.paramsPresets[0]?.id || null;
            const ok = await saveSettingsAndToast(s, '已删除');
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
                const s = getSettings();
                const newPreset = parsePresetData(presetData, generateSlotId);
                s.paramsPresets.push(newPreset);
                s.selectedParamsPresetId = newPreset.id;
                await saveSettingsAndToast(s, `已导入: ${newPreset.name}`);
                await notifySettingsUpdated();
                sendInitData();
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
            const s = getSettings();
            if (data.llmApi && typeof data.llmApi === 'object') {
                s.llmApi = { ...s.llmApi, ...data.llmApi };
            }
            if (typeof data.useStream === 'boolean') s.useStream = data.useStream;
            if (typeof data.useWorldInfo === 'boolean') s.useWorldInfo = data.useWorldInfo;
            const ok = await saveSettingsAndToast(s, '已保存');
            if (ok) sendInitData();
            break;
        }

        case 'FETCH_LLM_MODELS': {
            try {
                postStatus('loading', '连接中...');
                const apiCfg = data.llmApi || {};
                let baseUrl = String(apiCfg.url || '').trim().replace(/\/+$/, '');
                const apiKey = String(apiCfg.key || '').trim();
                if (!apiKey) {
                    postStatus('error', '请先填写 API KEY');
                    break;
                }

                const tryFetch = async url => {
                    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } });
                    return res.ok ? (await res.json())?.data?.map(m => m?.id).filter(Boolean) || null : null;
                };

                if (baseUrl.endsWith('/v1')) baseUrl = baseUrl.slice(0, -3);
                let models = await tryFetch(`${baseUrl}/v1/models`);
                if (!models) models = await tryFetch(`${baseUrl}/models`);
                if (!models?.length) throw new Error('未获取到模型列表');

                const s = getSettings();
                s.llmApi.provider = apiCfg.provider;
                s.llmApi.url = apiCfg.url;
                s.llmApi.key = apiCfg.key;
                s.llmApi.modelCache = [...new Set(models)];
                if (!s.llmApi.model && models.length) s.llmApi.model = models[0];

                const ok = await saveSettingsAndToast(s, `获取 ${models.length} 个模型`);
                if (ok) sendInitData();
            } catch (e) {
                postStatus('error', '连接失败：' + (e.message || '请检查配置'));
            }
            break;
        }

        case 'SAVE_CHARACTER_TAGS': {
            const s = getSettings();
            if (Array.isArray(data.characterTags)) s.characterTags = data.characterTags;
            await saveSettingsAndToast(s, '角色标签已保存');
            break;
        }

        case 'CLEAR_EXPIRED_CACHE': {
            const s = getSettings();
            const n = await clearExpiredCache(s.cacheDays || 3);
            sendInitData();
            postStatus('success', `已清理 ${n} 张`);
            break;
        }

        case 'CLEAR_ALL_CACHE':
            await clearAllCache();
            sendInitData();
            postStatus('success', '已清空');
            break;

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
                await updatePreviewSavedUrl(data.imgId, url);
                document.getElementById('xiaobaix-novel-draw-iframe')?.contentWindow?.postMessage({
                    source: 'LittleWhiteBox-NovelDraw',
                    type: 'GALLERY_IMAGE_SAVED',
                    imgId: data.imgId,
                    savedUrl: url
                }, '*');
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
                document.getElementById('xiaobaix-novel-draw-iframe')?.contentWindow?.postMessage({
                    source: 'LittleWhiteBox-NovelDraw',
                    type: 'CHARACTER_PREVIEWS_LOADED',
                    charName,
                    slots
                }, '*');
            } catch (e) {
                console.error('[NovelDraw] 加载预览失败:', e);
            }
            break;
        }

        case 'DELETE_GALLERY_IMAGE': {
            try {
                await deletePreview(data.imgId);
                document.getElementById('xiaobaix-novel-draw-iframe')?.contentWindow?.postMessage({
                    source: 'LittleWhiteBox-NovelDraw',
                    type: 'GALLERY_IMAGE_DELETED',
                    imgId: data.imgId
                }, '*');
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
                document.getElementById('xiaobaix-novel-draw-iframe')?.contentWindow?.postMessage({
                    source: 'LittleWhiteBox-NovelDraw',
                    type: 'TEST_RESULT',
                    url: `data:image/png;base64,${base64}`
                }, '*');
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

    await loadSettings();
    moduleInitialized = true;
    ensureStyles();

    await loadTagGuide();

    setupEventDelegation();
    setupGenerateInterceptor();
    openDB().then(() => { const s = getSettings(); clearExpiredCache(s.cacheDays || 3); });

    const { createFloatingPanel } = await import('./floating-panel.js');
    createFloatingPanel();

    events.on(event_types.CHARACTER_MESSAGE_RENDERED, handleMessageRendered);
    events.on(event_types.USER_MESSAGE_RENDERED, handleMessageRendered);
    events.on(event_types.CHAT_CHANGED, handleChatChanged);
    events.on(event_types.MESSAGE_EDITED, handleMessageModified);
    events.on(event_types.MESSAGE_UPDATED, handleMessageModified);
    events.on(event_types.MESSAGE_SWIPED, handleMessageModified);
    events.on(event_types.GENERATION_ENDED, async () => { try { await autoGenerateForLastAI(); } catch (e) { console.error('[NovelDraw]', e); } });

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
    hideOverlay();
    destroyGalleryCache();
    destroyCloudPresets();
    overlayCreated = false;
    frameReady = false;

    if (messageObserver) {
        messageObserver.disconnect();
        messageObserver = null;
    }

    window.removeEventListener('message', handleFrameMessage);
    document.getElementById('xiaobaix-novel-draw-overlay')?.remove();

    const { destroyFloatingPanel } = await import('./floating-panel.js');
    destroyFloatingPanel();

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
    loadSettings,
    getActiveParamsPreset,
    isModuleEnabled,
    findLastAIMessageId,
    generateAndInsertImages,
    generateNovelImage,
    classifyError,
    ErrorType,
    PROVIDER_MAP,
    abortGeneration,
    isGenerating,
};
