// ============ 导入 ============

import { event_types } from "../../../../../../script.js";
import { extension_settings, getContext } from "../../../../../extensions.js";
import { EXT_ID, extensionFolderPath } from "../../core/constants.js";
import { createModuleEvents } from "../../core/event-manager.js";
import { TtsStorage } from "../../core/server-storage.js";
import { extractSpeakText, parseTtsSegments, DEFAULT_SKIP_TAGS, normalizeEmotion, splitTtsSegmentsForFree } from "./tts-text.js";
import { TtsPlayer } from "./tts-player.js";
import { synthesizeV3, FREE_DEFAULT_VOICE } from "./tts-api.js";
import { 
    ensureTtsPanel, 
    updateTtsPanel, 
    removeAllTtsPanels, 
    initTtsPanelStyles, 
    setPanelConfigHandlers,
    clearPanelConfigHandlers,
    updateAutoSpeakAll,
    updateSpeedAll,
    updateVoiceAll,
    initFloatingPanel,
    destroyFloatingPanel,
    resetFloatingState,
    updateButtonVisibility,
} from "./tts-panel.js";
import { getCacheEntry, setCacheEntry, getCacheStats, clearExpiredCache, clearAllCache, pruneCache } from './tts-cache.js';
import { speakMessageFree, clearAllFreeQueues, clearFreeQueueForMessage } from './tts-free-provider.js';
import { 
    speakMessageAuth, 
    speakSegmentAuth, 
    inferResourceIdBySpeaker, 
    buildV3Headers, 
    speedToV3SpeechRate 
} from './tts-auth-provider.js';
import { postToIframe, isTrustedIframeEvent } from "../../core/iframe-messaging.js";

// ============ 常量 ============

const MODULE_ID = 'tts';
const OVERLAY_ID = 'xiaobaix-tts-overlay';
const HTML_PATH = `${extensionFolderPath}/modules/tts/tts-overlay.html`;
const TTS_DIRECTIVE_REGEX = /\[tts:([^\]]*)\]/gi;

const FREE_VOICE_KEYS = new Set([
    'female_1', 'female_2', 'female_3', 'female_4', 'female_5', 'female_6', 'female_7',
    'male_1', 'male_2', 'male_3', 'male_4'
]);

// ============ NovelDraw 兼容 ============

let ndImageObserver = null;
let ndRenderPending = new Set();
let ndRenderTimer = null;

function scheduleNdRerender(mesText) {
    ndRenderPending.add(mesText);
    if (ndRenderTimer) return;
    
    ndRenderTimer = setTimeout(() => {
        ndRenderTimer = null;
        const pending = Array.from(ndRenderPending);
        ndRenderPending.clear();
        
        if (!isModuleEnabled()) return;
        
        for (const el of pending) {
            if (!el.isConnected) continue;
            TTS_DIRECTIVE_REGEX.lastIndex = 0;
            // Tests existing message HTML only.
            // eslint-disable-next-line no-unsanitized/property
            if (TTS_DIRECTIVE_REGEX.test(el.innerHTML)) {
                enhanceTtsDirectives(el);
            }
        }
    }, 50);
}

function setupNovelDrawObserver() {
    if (ndImageObserver) return;
    
    const chatEl = document.getElementById('chat');
    if (!chatEl) return;
    
    ndImageObserver = new MutationObserver((mutations) => {
        if (!isModuleEnabled()) return;
        
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                
                const isNdImg = node.classList?.contains('xb-nd-img');
                const hasNdImg = isNdImg || node.querySelector?.('.xb-nd-img');
                if (!hasNdImg) continue;
                
                const mesText = node.closest('.mes_text');
                if (mesText) {
                    scheduleNdRerender(mesText);
                }
            }
        }
    });
    
    ndImageObserver.observe(chatEl, { childList: true, subtree: true });
}

function cleanupNovelDrawObserver() {
    ndImageObserver?.disconnect();
    ndImageObserver = null;
    if (ndRenderTimer) {
        clearTimeout(ndRenderTimer);
        ndRenderTimer = null;
    }
    ndRenderPending.clear();
}

// ============ 状态 ============

let player = null;
let moduleInitialized = false;
let overlay = null;
let config = null;
const messageStateMap = new Map();
const cacheCounters = { hits: 0, misses: 0 };

const events = createModuleEvents(MODULE_ID);

// ============ 指令块懒加载 ============

let directiveObserver = null;
const processedDirectives = new WeakSet();

function setupDirectiveObserver() {
    if (directiveObserver) return;
    
    directiveObserver = new IntersectionObserver((entries) => {
        if (!isModuleEnabled()) return;
        
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            
            const mesText = entry.target;
            if (processedDirectives.has(mesText)) {
                directiveObserver.unobserve(mesText);
                continue;
            }
            
            TTS_DIRECTIVE_REGEX.lastIndex = 0;
            // Tests existing message HTML only.
            // eslint-disable-next-line no-unsanitized/property
            if (TTS_DIRECTIVE_REGEX.test(mesText.innerHTML)) {
                enhanceTtsDirectives(mesText);
            }
            processedDirectives.add(mesText);
            directiveObserver.unobserve(mesText);
        }
    }, { rootMargin: '300px' });
}

function observeDirective(mesText) {
    if (!mesText || processedDirectives.has(mesText)) return;
    
    setupDirectiveObserver();
    
    // 已在视口附近，立即处理
    const rect = mesText.getBoundingClientRect();
    if (rect.top < window.innerHeight + 300 && rect.bottom > -300) {
        TTS_DIRECTIVE_REGEX.lastIndex = 0;
        // Tests existing message HTML only.
        // eslint-disable-next-line no-unsanitized/property
        if (TTS_DIRECTIVE_REGEX.test(mesText.innerHTML)) {
            enhanceTtsDirectives(mesText);
        }
        processedDirectives.add(mesText);
        return;
    }
    
    // 不在视口，加入观察队列
    directiveObserver.observe(mesText);
}

function cleanupDirectiveObserver() {
    directiveObserver?.disconnect();
    directiveObserver = null;
}

// ============ 模块状态检查 ============

function isModuleEnabled() {
    if (!moduleInitialized) return false;
    try {
        const settings = extension_settings[EXT_ID];
        if (!settings?.enabled) return false;
        if (!settings?.tts?.enabled) return false;
        return true;
    } catch {
        return false;
    }
}

// ============ 工具函数 ============

function hashString(input) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
}

function generateBatchId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeSpeed(value) {
    const num = Number.isFinite(value) ? value : 1.0;
    if (num >= 0.5 && num <= 2.0) return num;
    return Math.min(2.0, Math.max(0.5, 1 + num / 100));
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ============ 音色来源判断 ============

function getVoiceSource(value) {
    if (!value) return 'free';
    if (FREE_VOICE_KEYS.has(value)) return 'free';
    return 'auth';
}

function isAuthConfigured() {
    return !!(config?.volc?.appId && config?.volc?.accessKey);
}

function resolveSpeakerWithSource(speakerName, mySpeakers, defaultSpeaker) {
    const list = Array.isArray(mySpeakers) ? mySpeakers : [];
    
    // ★ 调试日志
    if (speakerName) {
        console.log('[TTS Debug] resolveSpeaker:', {
            查找的名称: speakerName,
            mySpeakers: list.map(s => ({ name: s.name, value: s.value, source: s.source })),
            默认音色: defaultSpeaker
        });
    }
    
    if (!speakerName) {
        const defaultItem = list.find(s => s.value === defaultSpeaker);
        return {
            value: defaultSpeaker,
            source: defaultItem?.source || getVoiceSource(defaultSpeaker),
            resourceId: defaultItem?.resourceId || null
        };
    }
    
    const byName = list.find(s => s.name === speakerName);
    console.log('[TTS Debug] byName 查找结果:', byName); // ★ 调试
    
    if (byName?.value) {
        return {
            value: byName.value,
            source: byName.source || getVoiceSource(byName.value),
            resourceId: byName.resourceId || null
        };
    }
    
    const byValue = list.find(s => s.value === speakerName);
    console.log('[TTS Debug] byValue 查找结果:', byValue); // ★ 调试
    
    if (byValue?.value) {
        return {
            value: byValue.value,
            source: byValue.source || getVoiceSource(byValue.value),
            resourceId: byValue.resourceId || null
        };
    }
    
    if (FREE_VOICE_KEYS.has(speakerName)) {
        return { value: speakerName, source: 'free', resourceId: null };
    }
    
    // ★ 回退到默认，这是问题发生的地方
    console.warn('[TTS Debug] 未找到匹配音色，回退到默认:', defaultSpeaker);
    
    const defaultItem = list.find(s => s.value === defaultSpeaker);
    return {
        value: defaultSpeaker,
        source: defaultItem?.source || getVoiceSource(defaultSpeaker),
        resourceId: defaultItem?.resourceId || null
    };
}

// ============ 缓存管理 ============

function buildCacheKey(params) {
    const payload = {
        providerMode: params.providerMode || 'auth',
        text: params.text || '',
        speaker: params.speaker || '',
        resourceId: params.resourceId || '',
        format: params.format || 'mp3',
        sampleRate: params.sampleRate || 24000,
        speechRate: params.speechRate || 0,
        loudnessRate: params.loudnessRate || 0,
        emotion: params.emotion || '',
        emotionScale: params.emotionScale || 0,
        explicitLanguage: params.explicitLanguage || '',
        disableMarkdownFilter: params.disableMarkdownFilter !== false,
        disableEmojiFilter: params.disableEmojiFilter === true,
        enableLanguageDetector: params.enableLanguageDetector === true,
        model: params.model || '',
        maxLengthToFilterParenthesis: params.maxLengthToFilterParenthesis ?? null,
        postProcessPitch: params.postProcessPitch ?? 0,
        contextTexts: Array.isArray(params.contextTexts) ? params.contextTexts : [],
        freeSpeed: params.freeSpeed ?? null,
    };
    return `tts:${hashString(JSON.stringify(payload))}`;
}

async function getCacheStatsSafe() {
    try {
        const stats = await getCacheStats();
        return { ...stats, hits: cacheCounters.hits, misses: cacheCounters.misses };
    } catch {
        return { count: 0, sizeMB: '0', totalBytes: 0, hits: cacheCounters.hits, misses: cacheCounters.misses };
    }
}

async function tryLoadLocalCache(params) {
    if (!config.volc.localCacheEnabled) return null;
    const key = buildCacheKey(params);
    try {
        const entry = await getCacheEntry(key);
        if (entry?.blob) {
            const cutoff = Date.now() - (config.volc.cacheDays || 7) * 24 * 60 * 60 * 1000;
            if (entry.createdAt && entry.createdAt < cutoff) {
                await clearExpiredCache(config.volc.cacheDays || 7);
                cacheCounters.misses += 1;
                return null;
            }
            cacheCounters.hits += 1;
            return { key, entry };
        }
        cacheCounters.misses += 1;
        return null;
    } catch {
        cacheCounters.misses += 1;
        return null;
    }
}

async function storeLocalCache(key, blob, meta) {
    if (!config.volc.localCacheEnabled) return;
    try {
        await setCacheEntry(key, blob, meta);
        await pruneCache({
            maxEntries: config.volc.cacheMaxEntries,
            maxBytes: config.volc.cacheMaxMB * 1024 * 1024,
        });
    } catch {}
}

// ============ 消息状态管理 ============

function ensureMessageState(messageId) {
    if (!messageStateMap.has(messageId)) {
        messageStateMap.set(messageId, {
            messageId,
            status: 'idle',
            text: '',
            textLength: 0,
            cached: false,
            usage: null,
            duration: 0,
            progress: 0,
            error: '',
            audioBlob: null,
            cacheKey: '',
            updatedAt: 0,
            currentSegment: 0,
            totalSegments: 0,
        });
    }
    return messageStateMap.get(messageId);
}

function getMessageElement(messageId) {
    return document.querySelector(`.mes[mesid="${messageId}"]`);
}

function getMessageData(messageId) {
    const context = getContext();
    return (context.chat || [])[messageId] || null;
}

function getSpeakTextFromMessage(message) {
    if (!message || typeof message.mes !== 'string') return '';
    return extractSpeakText(message.mes, {
        skipRanges: config.skipRanges,
        readRanges: config.readRanges,
        readRangesEnabled: config.readRangesEnabled,
    });
}

// ============ 队列管理 ============

function clearMessageFromQueue(messageId) {
    clearFreeQueueForMessage(messageId);
    if (!player) return;
    const prefix = `msg-${messageId}-`;
    player.queue = player.queue.filter(item => !item.id?.startsWith(prefix));
    if (player.currentItem?.messageId === messageId) {
        player._stopCurrent(true);
        player.currentItem = null;
        player.isPlaying = false;
        player._playNext();
    }
}

// ============ 状态保护更新器 ============

function createProtectedStateUpdater(messageId) {
    return (updates) => {
        const st = ensureMessageState(messageId);
        
        // 如果播放器正在播放/暂停，保护这个状态不被队列状态覆盖
        const isPlayerActive = st.status === 'playing' || st.status === 'paused';
        const isQueueStatus = updates.status === 'sending' || 
                              updates.status === 'queued' || 
                              updates.status === 'cached';
        
        if (isPlayerActive && isQueueStatus) {
            // 只更新进度相关字段，不覆盖播放状态
            const rest = { ...updates };
            delete rest.status;
            Object.assign(st, rest);
        } else {
            Object.assign(st, updates);
        }
        
        updateTtsPanel(messageId, st);
    };
}

// ============ 混合模式辅助 ============

function expandMixedSegments(resolvedSegments) {
    const expanded = [];
    
    for (const seg of resolvedSegments) {
        if (seg.resolvedSource === 'free' && seg.text && seg.text.length > 200) {
            const splitSegs = splitTtsSegmentsForFree([{
                text: seg.text,
                emotion: seg.emotion || '',
                context: seg.context || '',
                speaker: seg.speaker || '',
            }]);
            
            for (const splitSeg of splitSegs) {
                expanded.push({
                    ...splitSeg,
                    resolvedSpeaker: seg.resolvedSpeaker,
                    resolvedSource: 'free',
                });
            }
        } else {
            expanded.push(seg);
        }
    }
    
    return expanded;
}

async function speakSingleFreeSegment(messageId, segment, segmentIndex, batchId) {
    const state = ensureMessageState(messageId);
    
    state.status = 'sending';
    state.currentSegment = segmentIndex + 1;
    state.text = segment.text;
    state.textLength = segment.text.length;
    state.updatedAt = Date.now();
    updateTtsPanel(messageId, state);

    const freeSpeed = normalizeSpeed(config?.volc?.speechRate);
    const voiceKey = segment.resolvedSpeaker || FREE_DEFAULT_VOICE;
    const emotion = normalizeEmotion(segment.emotion);

    const cacheParams = {
        providerMode: 'free',
        text: segment.text,
        speaker: voiceKey,
        freeSpeed,
        emotion: emotion || '',
    };

    const cacheHit = await tryLoadLocalCache(cacheParams);
    if (cacheHit?.entry?.blob) {
        state.cached = true;
        state.status = 'cached';
        updateTtsPanel(messageId, state);
        player.enqueue({
            id: `msg-${messageId}-batch-${batchId}-seg-${segmentIndex}`,
            messageId,
            segmentIndex,
            batchId,
            audioBlob: cacheHit.entry.blob,
            text: segment.text,
        });
        return;
    }

    try {
        const { synthesizeFreeV1 } = await import('./tts-api.js');
        const { audioBase64 } = await synthesizeFreeV1({
            text: segment.text,
            voiceKey,
            speed: freeSpeed,
            emotion: emotion || null,
        });

        const byteString = atob(audioBase64);
        const bytes = new Uint8Array(byteString.length);
        for (let j = 0; j < byteString.length; j++) {
            bytes[j] = byteString.charCodeAt(j);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });

        const cacheKey = buildCacheKey(cacheParams);
        storeLocalCache(cacheKey, audioBlob, {
            text: segment.text.slice(0, 200),
            textLength: segment.text.length,
            speaker: voiceKey,
            resourceId: 'free',
        }).catch(() => {});

        state.status = 'queued';
        updateTtsPanel(messageId, state);

        player.enqueue({
            id: `msg-${messageId}-batch-${batchId}-seg-${segmentIndex}`,
            messageId,
            segmentIndex,
            batchId,
            audioBlob,
            text: segment.text,
        });
    } catch (err) {
        state.status = 'error';
        state.error = err?.message || '合成失败';
        updateTtsPanel(messageId, state);
    }
}

// ============ 主播放入口 ============

async function handleMessagePlayClick(messageId) {
    if (!isModuleEnabled()) return;
    
    const state = ensureMessageState(messageId);
    
    if (state.status === 'sending' || state.status === 'queued') {
        clearMessageFromQueue(messageId);
        state.status = 'idle';
        state.currentSegment = 0;
        state.totalSegments = 0;
        updateTtsPanel(messageId, state);
        return;
    }
    
    if (player?.currentItem?.messageId === messageId && player?.currentAudio) {
        if (player.currentAudio.paused) {
            player.currentAudio.play().catch(() => {});
        } else {
            player.currentAudio.pause();
        }
        return;
    }
    await speakMessage(messageId, { mode: 'manual' });
}

async function speakMessage(messageId, { mode = 'manual' } = {}) {
    if (!isModuleEnabled()) return;
    
    const message = getMessageData(messageId);
    if (!message || message.is_user) return;

    const messageEl = getMessageElement(messageId);
    if (!messageEl) return;

    ensureTtsPanel(messageEl, messageId, handleMessagePlayClick);

    const speakText = getSpeakTextFromMessage(message);
    if (!speakText.trim()) {
        const state = ensureMessageState(messageId);
        state.status = 'idle';
        state.text = '';
        state.currentSegment = 0;
        state.totalSegments = 0;
        updateTtsPanel(messageId, state);
        return;
    }

    const mySpeakers = config.volc?.mySpeakers || [];
    const defaultSpeaker = config.volc.defaultSpeaker || FREE_DEFAULT_VOICE;
    const defaultResolved = resolveSpeakerWithSource('', mySpeakers, defaultSpeaker);

    let segments = parseTtsSegments(speakText);
    if (!segments.length) {
        const state = ensureMessageState(messageId);
        state.status = 'idle';
        state.currentSegment = 0;
        state.totalSegments = 0;
        updateTtsPanel(messageId, state);
        return;
    }

    const resolvedSegments = segments.map(seg => {
        const resolved = seg.speaker 
            ? resolveSpeakerWithSource(seg.speaker, mySpeakers, defaultSpeaker)
            : defaultResolved;
        return { 
            ...seg, 
            resolvedSpeaker: resolved.value, 
            resolvedSource: resolved.source,
            resolvedResourceId: resolved.resourceId
        };
    });

    const needsAuth = resolvedSegments.some(s => s.resolvedSource === 'auth');
    if (needsAuth && !isAuthConfigured()) {
        toastr?.warning?.('部分音色需要配置鉴权 API，将仅播放免费音色');
        const freeOnly = resolvedSegments.filter(s => s.resolvedSource === 'free');
        if (!freeOnly.length) {
            const state = ensureMessageState(messageId);
            state.status = 'error';
            state.error = '所有音色均需要鉴权';
            updateTtsPanel(messageId, state);
            return;
        }
        resolvedSegments.length = 0;
        resolvedSegments.push(...freeOnly);
    }

    const batchId = generateBatchId();
    if (mode === 'manual') clearMessageFromQueue(messageId);

    const hasFree = resolvedSegments.some(s => s.resolvedSource === 'free');
    const hasAuth = resolvedSegments.some(s => s.resolvedSource === 'auth');
    const isMixed = hasFree && hasAuth;

    const state = ensureMessageState(messageId);

    if (isMixed) {
        const expandedSegments = expandMixedSegments(resolvedSegments);
        
        state.totalSegments = expandedSegments.length;
        state.currentSegment = 0;
        state.status = 'sending';
        updateTtsPanel(messageId, state);
        
        const ctx = {
            config,
            player,
            tryLoadLocalCache,
            storeLocalCache,
            buildCacheKey,
            updateState: (updates) => {
                Object.assign(state, updates);
                updateTtsPanel(messageId, state);
            },
        };
        
        for (let i = 0; i < expandedSegments.length; i++) {
            if (!isModuleEnabled()) return;
            
            const seg = expandedSegments[i];
            state.currentSegment = i + 1;
            updateTtsPanel(messageId, state);
            
            if (seg.resolvedSource === 'free') {
                await speakSingleFreeSegment(messageId, seg, i, batchId);
            } else {
                await speakSegmentAuth(messageId, seg, i, batchId, { 
                    isFirst: i === 0, 
                    ...ctx 
                });
            }
        }
        return;
    }

    state.totalSegments = resolvedSegments.length;
    state.currentSegment = 0;
    state.status = 'sending';
    updateTtsPanel(messageId, state);

    if (hasFree) {
        await speakMessageFree({
            messageId,
            segments: resolvedSegments,
            defaultSpeaker,
            mySpeakers,
            player,
            config,
            tryLoadLocalCache,
            storeLocalCache,
            buildCacheKey,
            updateState: createProtectedStateUpdater(messageId),
            clearMessageFromQueue,
            mode,
        });
        return;
    }

    if (hasAuth) {
        await speakMessageAuth({
            messageId,
            segments: resolvedSegments,
            batchId,
            config,
            player,
            tryLoadLocalCache,
            storeLocalCache,
            buildCacheKey,
            updateState: (updates) => {
                const st = ensureMessageState(messageId);
                Object.assign(st, updates);
                updateTtsPanel(messageId, st);
            },
            isModuleEnabled,
        });
    }
}

// ============ 指令块增强 ============

function parseDirectiveParams(raw) {
    const result = { speaker: '', emotion: '', context: '' };
    if (!raw) return result;
    
    const parts = String(raw).split(';').map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
        const idx = part.indexOf('=');
        if (idx === -1) continue;
        const key = part.slice(0, idx).trim().toLowerCase();
        let val = part.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || 
            (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        if (key === 'speaker') result.speaker = val;
        if (key === 'emotion') result.emotion = val;
        if (key === 'context') result.context = val;
    }
    return result;
}

function buildTtsTagHtml(parsed, rawParams) {
    const parts = [];
    if (parsed.speaker) parts.push(parsed.speaker);
    if (parsed.emotion) parts.push(parsed.emotion);
    if (parsed.context) {
        const ctx = parsed.context.length > 10 
            ? parsed.context.slice(0, 10) + '…' 
            : parsed.context;
        parts.push(`"${ctx}"`);
    }
    
    const hasParams = parts.length > 0;
    const title = rawParams ? escapeHtml(rawParams.replace(/;/g, '; ')) : '';
    
    let html = `<span class="xb-tts-tag" data-has-params="${hasParams}"${title ? ` title="${title}"` : ''}>`;
    html += `<span class="xb-tts-tag-icon">♪</span>`;
    
    if (hasParams) {
        const textParts = parts.map(p => `<span>${escapeHtml(p)}</span>`);
        html += textParts.join('<span class="xb-tts-tag-dot"> · </span>');
    }
    
    html += `</span>`;
    return html;
}

function enhanceTtsDirectives(container) {
    if (!container) return;
    
    // Rewrites already-rendered message HTML; no new HTML source is introduced here.
    // eslint-disable-next-line no-unsanitized/property
    const html = container.innerHTML;
    TTS_DIRECTIVE_REGEX.lastIndex = 0;
    if (!TTS_DIRECTIVE_REGEX.test(html)) return;
    
    TTS_DIRECTIVE_REGEX.lastIndex = 0;
    const enhanced = html.replace(TTS_DIRECTIVE_REGEX, (match, params) => {
        const parsed = parseDirectiveParams(params);
        return buildTtsTagHtml(parsed, params);
    });
    
    if (enhanced !== html) {
        // Replaces existing message HTML with enhanced tokens only.
        // eslint-disable-next-line no-unsanitized/property
        container.innerHTML = enhanced;
    }
}

function enhanceAllTtsDirectives() {
    if (!isModuleEnabled()) return;
    document.querySelectorAll('#chat .mes .mes_text').forEach(mesText => {
        observeDirective(mesText);
    });
}


function handleDirectiveEnhance(data) {
    if (!isModuleEnabled()) return;
    setTimeout(() => {
        if (!isModuleEnabled()) return;
        const messageId = typeof data === 'object' 
            ? (data.messageId ?? data.id ?? data.index ?? data.mesId) 
            : data;
        if (!Number.isFinite(messageId)) {
            enhanceAllTtsDirectives();
            return;
        }
        const mesText = document.querySelector(`#chat .mes[mesid="${messageId}"] .mes_text`);
        if (mesText) {
            processedDirectives.delete(mesText);
            observeDirective(mesText);
        }
    }, 100);
}

function onGenerationEnd() {
    if (!isModuleEnabled()) return;
    setTimeout(enhanceAllTtsDirectives, 150);
}

// ============ 消息渲染处理 ============

function renderExistingMessageUIs() {
    if (!isModuleEnabled()) return;
    
    const context = getContext();
    const chat = context.chat || [];
    chat.forEach((message, messageId) => {
        if (!message || message.is_user) return;
        const messageEl = getMessageElement(messageId);
        if (!messageEl) return;
        
        ensureTtsPanel(messageEl, messageId, handleMessagePlayClick);
        
        const mesText = messageEl.querySelector('.mes_text');
        if (mesText) observeDirective(mesText);
        
        const state = ensureMessageState(messageId);
        state.text = '';
        state.textLength = 0;
        updateTtsPanel(messageId, state);
    });
}

async function onCharacterMessageRendered(data) {
    if (!isModuleEnabled()) return;
    
    try {
        const context = getContext();
        const chat = context.chat;
        const messageId = data.messageId ?? (chat.length - 1);
        const message = chat[messageId];

        if (!message || message.is_user) return;

        const messageEl = getMessageElement(messageId);
        if (!messageEl) return;

        ensureTtsPanel(messageEl, messageId, handleMessagePlayClick);
        
        const mesText = messageEl.querySelector('.mes_text');
        if (mesText) {
            enhanceTtsDirectives(mesText);
            processedDirectives.add(mesText);
        }
        
        updateTtsPanel(messageId, ensureMessageState(messageId));

        if (!config?.autoSpeak) return;
        if (!isModuleEnabled()) return;
        await speakMessage(messageId, { mode: 'auto' });
    } catch {}
}

function onChatChanged() {
    clearAllFreeQueues();
    if (player) player.clear();
    messageStateMap.clear();
    removeAllTtsPanels();
    resetFloatingState();
    
    setTimeout(() => {
        renderExistingMessageUIs();
    }, 100);
}

// ============ 配置管理 ============

async function loadConfig() {
    config = await TtsStorage.load();
    config.volc = config.volc || {};
    
    if (Array.isArray(config.volc.mySpeakers)) {
        config.volc.mySpeakers = config.volc.mySpeakers.map(s => ({
            ...s,
            source: s.source || getVoiceSource(s.value)
        }));
    }
    
    config.volc.disableMarkdownFilter = config.volc.disableMarkdownFilter !== false;
    config.volc.disableEmojiFilter = config.volc.disableEmojiFilter === true;
    config.volc.enableLanguageDetector = config.volc.enableLanguageDetector === true;
    config.volc.explicitLanguage = typeof config.volc.explicitLanguage === 'string' ? config.volc.explicitLanguage : '';
    config.volc.speechRate = normalizeSpeed(Number.isFinite(config.volc.speechRate) ? config.volc.speechRate : 1.0);
    config.volc.maxLengthToFilterParenthesis = Number.isFinite(config.volc.maxLengthToFilterParenthesis) ? config.volc.maxLengthToFilterParenthesis : 100;
    config.volc.postProcessPitch = Number.isFinite(config.volc.postProcessPitch) ? config.volc.postProcessPitch : 0;
    config.volc.emotionScale = Math.min(5, Math.max(1, Number.isFinite(config.volc.emotionScale) ? config.volc.emotionScale : 5));
    config.volc.serverCacheEnabled = config.volc.serverCacheEnabled === true;
    config.volc.localCacheEnabled = true;
    config.volc.cacheDays = Math.max(1, Number.isFinite(config.volc.cacheDays) ? config.volc.cacheDays : 7);
    config.volc.cacheMaxEntries = Math.max(10, Number.isFinite(config.volc.cacheMaxEntries) ? config.volc.cacheMaxEntries : 200);
    config.volc.cacheMaxMB = Math.max(10, Number.isFinite(config.volc.cacheMaxMB) ? config.volc.cacheMaxMB : 200);
    config.volc.usageReturn = config.volc.usageReturn === true;
    config.autoSpeak = config.autoSpeak !== false;
    config.skipTags = config.skipTags || [...DEFAULT_SKIP_TAGS];
    config.skipCodeBlocks = config.skipCodeBlocks !== false;
    config.skipRanges = Array.isArray(config.skipRanges) ? config.skipRanges : [];
    config.readRanges = Array.isArray(config.readRanges) ? config.readRanges : [];
    config.readRangesEnabled = config.readRangesEnabled === true;
    config.showFloorButton = config.showFloorButton !== false;
    config.showFloatingButton = config.showFloatingButton === true;

    return config;
}

async function saveConfig(updates) {
    Object.assign(config, updates);
    await TtsStorage.set('volc', config.volc);
    await TtsStorage.set('autoSpeak', config.autoSpeak);
    await TtsStorage.set('skipRanges', config.skipRanges || []);
    await TtsStorage.set('readRanges', config.readRanges || []);
    await TtsStorage.set('readRangesEnabled', config.readRangesEnabled === true);
    await TtsStorage.set('skipTags', config.skipTags);
    await TtsStorage.set('skipCodeBlocks', config.skipCodeBlocks);
    await TtsStorage.set('showFloorButton', config.showFloorButton);
    await TtsStorage.set('showFloatingButton', config.showFloatingButton);

    try {
        return await TtsStorage.saveNow({ silent: false });
    } catch {
        return false;
    }
}

// ============ 设置面板 ============

function openSettings() {
    if (document.getElementById(OVERLAY_ID)) return;

    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    
    // 使用动态高度而非100vh
    const updateOverlayHeight = () => {
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.height = `${window.innerHeight}px`;
        }
    };
    
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: ${window.innerHeight}px;
        background: rgba(0,0,0,0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = HTML_PATH;
    iframe.style.cssText = `
        width: min(1300px, 96vw); 
        height: min(1050px, 94vh);
        max-height: calc(100% - 24px);
        border: none;
        border-radius: 12px;
        background: #1a1a1a;
    `;

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    
    // 监听视口变化
    window.addEventListener('resize', updateOverlayHeight);
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateOverlayHeight);
    }
    
    // 存储清理函数
    overlay._cleanup = () => {
        window.removeEventListener('resize', updateOverlayHeight);
        if (window.visualViewport) {
            window.visualViewport.removeEventListener('resize', updateOverlayHeight);
        }
    };
    
    // Guarded by isTrustedIframeEvent (origin + source).
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleIframeMessage);
}

function closeSettings() {
    window.removeEventListener('message', handleIframeMessage);
    const overlayEl = document.getElementById(OVERLAY_ID);
    if (overlayEl) {
        overlayEl._cleanup?.();
        overlayEl.remove();
    }
    overlay = null;
}

async function handleIframeMessage(ev) {
    const iframe = overlay?.querySelector('iframe');
    if (!isTrustedIframeEvent(ev, iframe)) return;
    if (!ev.data?.type?.startsWith('xb-tts:')) return;

    const { type, payload } = ev.data;

    switch (type) {
        case 'xb-tts:ready': {
            const cacheStats = await getCacheStatsSafe();
            postToIframe(iframe, { type: 'xb-tts:config', payload: { ...config, cacheStats } });
            break;
        }
        case 'xb-tts:close':
            closeSettings();
            break;
        case 'xb-tts:save-config': {
            const ok = await saveConfig(payload);
            if (ok) {
                const cacheStats = await getCacheStatsSafe();
                postToIframe(iframe, { type: 'xb-tts:config-saved', payload: { ...config, cacheStats } });
                updateAutoSpeakAll();
                updateSpeedAll();
                updateVoiceAll();
            } else {
                postToIframe(iframe, { type: 'xb-tts:config-save-error', payload: { message: '保存失败' } });
            }
            break;
        }
        case 'xb-tts:save-button-mode': {
            const { showFloorButton, showFloatingButton } = payload;
            config.showFloorButton = showFloorButton;
            config.showFloatingButton = showFloatingButton;
            const ok = await saveConfig({ showFloorButton, showFloatingButton });
            if (ok) {
                updateButtonVisibility(showFloorButton, showFloatingButton);
                if (showFloorButton) {
                    renderExistingMessageUIs();
                }
                postToIframe(iframe, { type: 'xb-tts:button-mode-saved' });
            }
            break;
        }
        case 'xb-tts:toast':
            if (payload.type === 'error') toastr.error(payload.message);
            else if (payload.type === 'success') toastr.success(payload.message);
            else toastr.info(payload.message);
            break;
        case 'xb-tts:test-speak':
            await handleTestSpeak(payload, iframe);
            break;
        case 'xb-tts:clear-queue':
            player.clear();
            break;
        case 'xb-tts:cache-refresh': {
            const stats = await getCacheStatsSafe();
            postToIframe(iframe, { type: 'xb-tts:cache-stats', payload: stats });
            break;
        }
        case 'xb-tts:cache-clear-expired': {
            const removed = await clearExpiredCache(config.volc.cacheDays || 7);
            const stats = await getCacheStatsSafe();
            postToIframe(iframe, { type: 'xb-tts:cache-stats', payload: stats });
            postToIframe(iframe, { type: 'xb-tts:toast', payload: { type: 'success', message: `已清理 ${removed} 条` } });
            break;
        }
        case 'xb-tts:cache-clear-all': {
            await clearAllCache();
            const stats = await getCacheStatsSafe();
            postToIframe(iframe, { type: 'xb-tts:cache-stats', payload: stats });
            postToIframe(iframe, { type: 'xb-tts:toast', payload: { type: 'success', message: '已清空全部' } });
            break;
        }
    }
}

async function handleTestSpeak(payload, iframe) {
    try {
        const { text, speaker, source, resourceId } = payload;
        const testText = text || '你好，这是一段测试语音。';
        
        if (source === 'free') {
            const { synthesizeFreeV1 } = await import('./tts-api.js');
            const { audioBase64 } = await synthesizeFreeV1({
                text: testText,
                voiceKey: speaker || FREE_DEFAULT_VOICE,
                speed: normalizeSpeed(config.volc?.speechRate),
            });
            
            const byteString = atob(audioBase64);
            const bytes = new Uint8Array(byteString.length);
            for (let j = 0; j < byteString.length; j++) bytes[j] = byteString.charCodeAt(j);
            const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
            
            player.enqueue({ id: 'test-' + Date.now(), audioBlob });
            postToIframe(iframe, { type: 'xb-tts:test-done' });
        } else {
            if (!isAuthConfigured()) {
                postToIframe(iframe, { 
                    type: 'xb-tts:test-error', 
                    payload: '请先配置 AppID 和 Access Token' 
                });
                return;
            }
            
            const rid = resourceId || inferResourceIdBySpeaker(speaker);
            const result = await synthesizeV3({
                appId: config.volc.appId,
                accessKey: config.volc.accessKey,
                resourceId: rid,
                speaker: speaker || config.volc.defaultSpeaker,
                text: testText,
                speechRate: speedToV3SpeechRate(config.volc.speechRate),
                emotionScale: config.volc.emotionScale,
            }, buildV3Headers(rid, config));
            
            player.enqueue({ id: 'test-' + Date.now(), audioBlob: result.audioBlob });
            postToIframe(iframe, { type: 'xb-tts:test-done' });
        }
    } catch (err) {
        postToIframe(iframe, { 
            type: 'xb-tts:test-error', 
            payload: err.message 
        });
    }
}

// ============ 初始化与清理 ============

export async function initTts() {
    if (moduleInitialized) return;

    await loadConfig();
    player = new TtsPlayer();
    initTtsPanelStyles();
    moduleInitialized = true;

    setPanelConfigHandlers({
        getConfig: () => config,
        saveConfig: saveConfig,
        openSettings: openSettings,
        clearQueue: (messageId) => {
            clearMessageFromQueue(messageId);
            clearFreeQueueForMessage(messageId);
            
            const state = ensureMessageState(messageId);
            state.status = 'idle';
            state.currentSegment = 0;
            state.totalSegments = 0;
            state.error = '';
            updateTtsPanel(messageId, state);
        },
        getLastAIMessageId: () => {
            const context = getContext();
            const chat = context.chat || [];
            for (let i = chat.length - 1; i >= 0; i--) {
                if (chat[i] && !chat[i].is_user) return i;
            }
            return -1;
        },
        speakMessage: (messageId) => handleMessagePlayClick(messageId),
    });

    initFloatingPanel();

    player.onStateChange = (state, item, info) => {
        if (!isModuleEnabled()) return;
        const messageId = item?.messageId;
        if (typeof messageId !== 'number' || messageId < 0) return;
        const msgState = ensureMessageState(messageId);

        switch (state) {
            case 'metadata':
                msgState.duration = info?.duration || msgState.duration || 0;
                break;
                
            case 'progress':
                msgState.progress = info?.currentTime || 0;
                msgState.duration = info?.duration || msgState.duration || 0;
                break;
                
            case 'playing':
                msgState.status = 'playing';
                if (typeof item?.segmentIndex === 'number') {
                    msgState.currentSegment = item.segmentIndex + 1;
                }
                break;
                
            case 'paused':
                msgState.status = 'paused';
                break;
                
            case 'ended': {
                // 检查是否是最后一个段落
                const segIdx = typeof item?.segmentIndex === 'number' ? item.segmentIndex : -1;
                const total = msgState.totalSegments || 1;
                
                // 判断是否为最后一个段落
                // segIdx 是 0-based，total 是总数
                // 如果 segIdx >= total - 1，说明是最后一个
                const isLastSegment = total <= 1 || segIdx >= total - 1;
                
                if (isLastSegment) {
                    // 真正播放完成
                    msgState.status = 'ended';
                    msgState.progress = msgState.duration;
                } else {
                    // 还有后续段落
                    // 检查队列中是否有该消息的待播放项
                    const prefix = `msg-${messageId}-`;
                    const hasQueued = player.queue.some(q => q.id?.startsWith(prefix));
                    
                    if (hasQueued) {
                        // 后续段落已在队列中，等待播放
                        msgState.status = 'queued';
                    } else {
                        // 后续段落还在请求中
                        msgState.status = 'sending';
                    }
                }
                break;
            }
            
            case 'blocked':
                msgState.status = 'blocked';
                break;
                
            case 'error':
                msgState.status = 'error';
                break;
                
            case 'enqueued':
                // 只在非播放/暂停状态时更新
                if (msgState.status !== 'playing' && msgState.status !== 'paused') {
                    msgState.status = 'queued';
                }
                break;
                
            case 'idle':
            case 'cleared':
                // 播放器空闲，但可能还有段落在请求
                // 不主动改变状态，让请求完成后的逻辑处理
                break;
        }
        updateTtsPanel(messageId, msgState);
    };

    events.on(event_types.CHARACTER_MESSAGE_RENDERED, onCharacterMessageRendered);
    events.on(event_types.CHAT_CHANGED, onChatChanged);
    events.on(event_types.MESSAGE_EDITED, handleDirectiveEnhance);
    events.on(event_types.MESSAGE_UPDATED, handleDirectiveEnhance);
    events.on(event_types.MESSAGE_SWIPED, handleDirectiveEnhance);
    events.on(event_types.GENERATION_STOPPED, onGenerationEnd);
    events.on(event_types.GENERATION_ENDED, onGenerationEnd);

    renderExistingMessageUIs();
    setupNovelDrawObserver();

    window.registerModuleCleanup?.('tts', cleanupTts);

    window.xiaobaixTts = {
        openSettings,
        closeSettings,
        player,
        synthesize: synthesizeForExternal,
        speak: async (text, options = {}) => {
            if (!isModuleEnabled()) return;
            
            const mySpeakers = config.volc?.mySpeakers || [];
            const resolved = options.speaker 
                ? resolveSpeakerWithSource(options.speaker, mySpeakers, config.volc.defaultSpeaker)
                : { value: config.volc.defaultSpeaker, source: getVoiceSource(config.volc.defaultSpeaker) };
            
            if (resolved.source === 'free') {
                const { synthesizeFreeV1 } = await import('./tts-api.js');
                const { audioBase64 } = await synthesizeFreeV1({
                    text,
                    voiceKey: resolved.value,
                    speed: normalizeSpeed(config.volc?.speechRate),
                    emotion: options.emotion || null,
                });
                
                const byteString = atob(audioBase64);
                const bytes = new Uint8Array(byteString.length);
                for (let j = 0; j < byteString.length; j++) bytes[j] = byteString.charCodeAt(j);
                const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
                
                player.enqueue({ id: 'manual-' + Date.now(), audioBlob, text });
            } else {
                if (!isAuthConfigured()) {
                    toastr?.error?.('请先配置鉴权 API');
                    return;
                }
                
                const resourceId = options.resourceId || resolved.resourceId || inferResourceIdBySpeaker(resolved.value);
                const result = await synthesizeV3({
                    appId: config.volc.appId,
                    accessKey: config.volc.accessKey,
                    resourceId,
                    speaker: resolved.value,
                    text,
                    speechRate: speedToV3SpeechRate(config.volc.speechRate),
                    ...options,
                }, buildV3Headers(resourceId, config));
                
                player.enqueue({ id: 'manual-' + Date.now(), audioBlob: result.audioBlob, text });
            }
        },
    };
}

// ============ External synthesis API (no enqueue) ============

async function synthesizeForExternal(text, options = {}) {
    if (!isModuleEnabled()) {
        throw new Error('TTS 模块未启用');
    }

    const trimmed = String(text || '').trim();
    if (!trimmed) {
        throw new Error('合成文本为空');
    }

    const { emotion, speaker, signal } = options;

    const mySpeakers = config.volc?.mySpeakers || [];
    const defaultSpeaker = config.volc?.defaultSpeaker || FREE_DEFAULT_VOICE;
    const resolved = speaker
        ? resolveSpeakerWithSource(speaker, mySpeakers, defaultSpeaker)
        : resolveSpeakerWithSource('', mySpeakers, defaultSpeaker);

    const normalizedEmotion = emotion ? normalizeEmotion(emotion) : '';

    if (resolved.source === 'free') {
        return await synthesizeFreeBlob(trimmed, resolved.value, normalizedEmotion, signal);
    }

    if (!isAuthConfigured()) {
        throw new Error('鉴权音色需要配置 API');
    }

    return await synthesizeAuthBlob(trimmed, resolved, normalizedEmotion, signal);
}

async function synthesizeFreeBlob(text, voiceKey, emotion, signal) {
    const freeSpeed = normalizeSpeed(config?.volc?.speechRate);

    const cacheParams = {
        providerMode: 'free',
        text,
        speaker: voiceKey,
        freeSpeed,
        emotion: emotion || '',
    };

    const cacheHit = await tryLoadLocalCache(cacheParams);
    if (cacheHit?.entry?.blob) return cacheHit.entry.blob;

    const { synthesizeFreeV1 } = await import('./tts-api.js');
    const { audioBase64 } = await synthesizeFreeV1({ text, voiceKey, speed: freeSpeed, emotion: emotion || null }, { signal });

    const byteString = atob(audioBase64);
    const bytes = new Uint8Array(byteString.length);
    for (let j = 0; j < byteString.length; j++) bytes[j] = byteString.charCodeAt(j);
    const blob = new Blob([bytes], { type: 'audio/mpeg' });

    const cacheKey = buildCacheKey(cacheParams);
    storeLocalCache(cacheKey, blob, { text: text.slice(0, 200), textLength: text.length, speaker: voiceKey, resourceId: 'free' }).catch(() => {});

    return blob;
}

async function synthesizeAuthBlob(text, resolved, emotion, signal) {
    const resourceId = resolved.resourceId || inferResourceIdBySpeaker(resolved.value);
    const params = {
        providerMode: 'auth',
        appId: config.volc.appId,
        accessKey: config.volc.accessKey,
        resourceId,
        speaker: resolved.value,
        text,
        format: 'mp3',
        sampleRate: 24000,
        speechRate: speedToV3SpeechRate(config.volc.speechRate),
        loudnessRate: 0,
        emotionScale: config.volc.emotionScale,
        explicitLanguage: config.volc.explicitLanguage,
        disableMarkdownFilter: config.volc.disableMarkdownFilter,
        disableEmojiFilter: config.volc.disableEmojiFilter,
        enableLanguageDetector: config.volc.enableLanguageDetector,
        maxLengthToFilterParenthesis: config.volc.maxLengthToFilterParenthesis,
        postProcessPitch: config.volc.postProcessPitch,
        signal,
    };

    if (emotion) { params.emotion = emotion; }
    if (resourceId === 'seed-tts-1.0' && config.volc.useTts11 !== false) { params.model = 'seed-tts-1.1'; }
    if (config.volc.serverCacheEnabled) { params.cacheConfig = { text_type: 1, use_cache: true }; }

    const cacheHit = await tryLoadLocalCache(params);
    if (cacheHit?.entry?.blob) return cacheHit.entry.blob;

    const headers = buildV3Headers(resourceId, config);
    const result = await synthesizeV3(params, headers);

    const cacheKey = buildCacheKey(params);
    storeLocalCache(cacheKey, result.audioBlob, { text: text.slice(0, 200), textLength: text.length, speaker: resolved.value, resourceId, usage: result.usage || null }).catch(() => {});

    return result.audioBlob;
}

export function cleanupTts() {
    moduleInitialized = false;
    
    events.cleanup();
    clearAllFreeQueues();
    cleanupNovelDrawObserver();
    cleanupDirectiveObserver();
    if (player) {
        player.clear();
        player.onStateChange = null;
        player = null;
    }

    closeSettings();
    removeAllTtsPanels();
    destroyFloatingPanel();

    clearPanelConfigHandlers();

    messageStateMap.clear();
    cacheCounters.hits = 0;
    cacheCounters.misses = 0;
    delete window.xiaobaixTts;
}
