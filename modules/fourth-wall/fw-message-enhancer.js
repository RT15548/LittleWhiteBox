// ════════════════════════════════════════════════════════════════════════════
// 消息楼层增强器
// ════════════════════════════════════════════════════════════════════════════

import { extension_settings } from "../../../../../extensions.js";
import { EXT_ID } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { xbLog } from "../../core/debug-core.js";

import { generateImage, clearQueue } from "./fw-image.js";
import { 
    synthesizeSpeech, 
    loadVoices,
    VALID_EMOTIONS, 
    DEFAULT_VOICE, 
    DEFAULT_SPEED 
} from "./fw-voice.js";

// ════════════════════════════════════════════════════════════════════════════
// 状态
// ════════════════════════════════════════════════════════════════════════════

const events = createModuleEvents('messageEnhancer');
const CSS_INJECTED_KEY = 'xb-me-css-injected';

let currentAudio = null;
let imageObserver = null;
let novelDrawObserver = null;

// ════════════════════════════════════════════════════════════════════════════
// 初始化与清理
// ════════════════════════════════════════════════════════════════════════════

export async function initMessageEnhancer() {
    const settings = extension_settings[EXT_ID];
    if (!settings?.fourthWall?.enabled) return;
    
    xbLog.info('messageEnhancer', '初始化消息增强器');
    
    injectStyles();
    await loadVoices();
    initImageObserver();
    initNovelDrawObserver();
    
    events.on(event_types.CHAT_CHANGED, () => {
        clearQueue();
        setTimeout(processAllMessages, 150);
    });
    
    events.on(event_types.MESSAGE_RECEIVED, handleMessageChange);
    events.on(event_types.USER_MESSAGE_RENDERED, handleMessageChange);
    events.on(event_types.MESSAGE_EDITED, handleMessageChange);
    events.on(event_types.MESSAGE_UPDATED, handleMessageChange);
    events.on(event_types.MESSAGE_SWIPED, handleMessageChange);
    
    events.on(event_types.GENERATION_STOPPED, () => setTimeout(processAllMessages, 150));
    events.on(event_types.GENERATION_ENDED, () => setTimeout(processAllMessages, 150));
    
    processAllMessages();
}

export function cleanupMessageEnhancer() {
    xbLog.info('messageEnhancer', '清理消息增强器');
    
    events.cleanup();
    clearQueue();
    
    if (imageObserver) {
        imageObserver.disconnect();
        imageObserver = null;
    }
    
    if (novelDrawObserver) {
        novelDrawObserver.disconnect();
        novelDrawObserver = null;
    }
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

// ════════════════════════════════════════════════════════════════════════════
// NovelDraw 兼容
// ════════════════════════════════════════════════════════════════════════════

function initNovelDrawObserver() {
    if (novelDrawObserver) return;
    
    const chat = document.getElementById('chat');
    if (!chat) {
        setTimeout(initNovelDrawObserver, 500);
        return;
    }
    
    let debounceTimer = null;
    const pendingTexts = new Set();
    
    novelDrawObserver = new MutationObserver((mutations) => {
        const settings = extension_settings[EXT_ID];
        if (!settings?.fourthWall?.enabled) return;
        
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                
                const hasNdImg = node.classList?.contains('xb-nd-img') || node.querySelector?.('.xb-nd-img');
                if (!hasNdImg) continue;
                
                const mesText = node.closest('.mes_text');
                if (mesText && hasUnrenderedVoice(mesText)) {
                    pendingTexts.add(mesText);
                }
            }
        }
        
        if (pendingTexts.size > 0 && !debounceTimer) {
            debounceTimer = setTimeout(() => {
                pendingTexts.forEach(mesText => {
                    if (document.contains(mesText)) enhanceMessageContent(mesText);
                });
                pendingTexts.clear();
                debounceTimer = null;
            }, 50);
        }
    });
    
    novelDrawObserver.observe(chat, { childList: true, subtree: true });
}

function hasUnrenderedVoice(mesText) {
    if (!mesText) return false;
    return /\[(?:voice|语音)\s*:[^\]]+\]|\[[^\]]*\bvoice\s*=/i.test(mesText.innerHTML);
}

// ════════════════════════════════════════════════════════════════════════════
// 事件处理
// ════════════════════════════════════════════════════════════════════════════

function handleMessageChange(data) {
    setTimeout(() => {
        const messageId = typeof data === 'object' 
            ? (data.messageId ?? data.id ?? data.index ?? data.mesId) 
            : data;
        
        if (Number.isFinite(messageId)) {
            const mesText = document.querySelector(`#chat .mes[mesid="${messageId}"] .mes_text`);
            if (mesText) enhanceMessageContent(mesText);
        } else {
            processAllMessages();
        }
    }, 100);
}

function processAllMessages() {
    const settings = extension_settings[EXT_ID];
    if (!settings?.fourthWall?.enabled) return;
    document.querySelectorAll('#chat .mes .mes_text').forEach(enhanceMessageContent);
}

// ════════════════════════════════════════════════════════════════════════════
// 图片观察器
// ════════════════════════════════════════════════════════════════════════════

function initImageObserver() {
    if (imageObserver) return;
    
    imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const slot = entry.target;
            if (slot.dataset.loaded === '1' || slot.dataset.loading === '1') return;
            const tags = decodeURIComponent(slot.dataset.tags || '');
            if (!tags) return;
            slot.dataset.loading = '1';
            loadImage(slot, tags);
        });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
}

// ════════════════════════════════════════════════════════════════════════════
// 样式注入
// ════════════════════════════════════════════════════════════════════════════

function injectStyles() {
    if (document.getElementById(CSS_INJECTED_KEY)) return;
    
    const style = document.createElement('style');
    style.id = CSS_INJECTED_KEY;
    style.textContent = `
.xb-voice-bubble {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: #95ec69;
    border-radius: 4px;
    cursor: pointer;
    user-select: none;
    min-width: 60px;
    max-width: 180px;
    margin: 3px 0;
    transition: filter 0.15s;
}
.xb-voice-bubble:hover { filter: brightness(0.95); }
.xb-voice-bubble:active { filter: brightness(0.9); }
.xb-voice-waves {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    width: 16px;
    height: 14px;
    flex-shrink: 0;
}
.xb-voice-bar {
    width: 2px;
    background: #fff;
    border-radius: 1px;
    opacity: 0.9;
}
.xb-voice-bar:nth-child(1) { height: 5px; }
.xb-voice-bar:nth-child(2) { height: 8px; }
.xb-voice-bar:nth-child(3) { height: 11px; }
.xb-voice-bubble.playing .xb-voice-bar { animation: xb-wechat-wave 1.2s infinite ease-in-out; }
.xb-voice-bubble.playing .xb-voice-bar:nth-child(1) { animation-delay: 0s; }
.xb-voice-bubble.playing .xb-voice-bar:nth-child(2) { animation-delay: 0.2s; }
.xb-voice-bubble.playing .xb-voice-bar:nth-child(3) { animation-delay: 0.4s; }
@keyframes xb-wechat-wave { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
.xb-voice-duration { font-size: 12px; color: #000; opacity: 0.7; margin-left: auto; }
.xb-voice-bubble.loading { opacity: 0.7; }
.xb-voice-bubble.loading .xb-voice-waves { animation: xb-voice-pulse 1s infinite; }
@keyframes xb-voice-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.xb-voice-bubble.error { background: #ffb3b3 !important; }
.mes[is_user="true"] .xb-voice-bubble { background: #fff; }
.mes[is_user="true"] .xb-voice-bar { background: #b2b2b2; }
.xb-img-slot { margin: 8px 0; min-height: 60px; position: relative; display: inline-block; }
.xb-img-slot img.xb-generated-img { max-width: min(400px, 80%); max-height: 60vh; border-radius: 4px; display: block; cursor: pointer; transition: opacity 0.2s; }
.xb-img-slot img.xb-generated-img:hover { opacity: 0.9; }
.xb-img-placeholder { display: inline-flex; align-items: center; gap: 6px; padding: 12px 16px; background: rgba(0,0,0,0.04); border: 1px dashed rgba(0,0,0,0.15); border-radius: 4px; color: #999; font-size: 12px; }
.xb-img-placeholder i { font-size: 16px; opacity: 0.5; }
.xb-img-loading { display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(76,154,255,0.08); border: 1px solid rgba(76,154,255,0.2); border-radius: 4px; color: #666; font-size: 12px; }
.xb-img-loading i { animation: fa-spin 1s infinite linear; }
.xb-img-loading i.fa-clock { animation: none; }
.xb-img-error { display: inline-flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 16px; background: rgba(255,100,100,0.08); border: 1px dashed rgba(255,100,100,0.3); border-radius: 4px; color: #e57373; font-size: 12px; }
.xb-img-retry { padding: 4px 10px; background: rgba(255,100,100,0.1); border: 1px solid rgba(255,100,100,0.3); border-radius: 3px; color: #e57373; font-size: 11px; cursor: pointer; }
.xb-img-retry:hover { background: rgba(255,100,100,0.2); }
.xb-img-badge { position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); color: #ffd700; font-size: 10px; padding: 2px 5px; border-radius: 3px; }
`;
    document.head.appendChild(style);
}

// ════════════════════════════════════════════════════════════════════════════
// 内容增强
// ════════════════════════════════════════════════════════════════════════════

function enhanceMessageContent(container) {
    if (!container) return;
    
    // Rewrites already-rendered message HTML; no new HTML source is introduced here.
    // eslint-disable-next-line no-unsanitized/property
    const html = container.innerHTML;
    let enhanced = html;
    let hasChanges = false;
    
    enhanced = enhanced.replace(/\[(?:img|图片)\s*:\s*([^\]]+)\]/gi, (match, inner) => {
        const tags = parseImageToken(inner);
        if (!tags) return match;
        hasChanges = true;
        return `<div class="xb-img-slot" data-tags="${encodeURIComponent(tags)}"></div>`;
    });
    
    enhanced = enhanced.replace(/\[[^\]]*\bvoice\s*=[^\]]+\]/gi, (match) => {
        const parsed = parseSpeakerVoiceToken(match);
        if (!parsed || !parsed.text) return match;
        hasChanges = true;
        return createVoiceBubbleHTML(parsed.text, parsed.emotion, parsed.speaker, true);
    });

    enhanced = enhanced.replace(/\[(?:voice|语音)\s*:([^:]*):([^\]]+)\]/gi, (match, emotionRaw, voiceText) => {
        const txt = voiceText.trim();
        if (!txt) return match;
        hasChanges = true;
        return createVoiceBubbleHTML(txt, (emotionRaw || '').trim().toLowerCase());
    });
    
    enhanced = enhanced.replace(/\[(?:voice|语音)\s*:\s*([^\]:]+)\]/gi, (match, voiceText) => {
        const txt = voiceText.trim();
        if (!txt) return match;
        hasChanges = true;
        return createVoiceBubbleHTML(txt, '');
    });
    
    if (hasChanges) {
        // Replaces existing message HTML with enhanced tokens only.
        // eslint-disable-next-line no-unsanitized/property
        container.innerHTML = enhanced;
    }
    
    hydrateImageSlots(container);
    hydrateVoiceSlots(container);
}

function parseImageToken(rawCSV) {
    let txt = String(rawCSV || '').trim();
    txt = txt.replace(/^(nsfw|sketchy)\s*:\s*/i, 'nsfw, ');
    return txt.split(',').map(s => s.trim()).filter(Boolean).join(', ');
}

function createVoiceBubbleHTML(text, emotion, speaker = '', useTts = false) {
    const duration = Math.max(2, Math.ceil(text.length / 4));
    const speakerAttr = speaker ? ` data-speaker="${encodeURIComponent(speaker)}"` : '';
    const ttsAttr = useTts ? ' data-tts="1"' : '';
    return `<div class="xb-voice-bubble" data-text="${encodeURIComponent(text)}" data-emotion="${emotion || ''}"${speakerAttr}${ttsAttr}>
        <div class="xb-voice-waves"><div class="xb-voice-bar"></div><div class="xb-voice-bar"></div><div class="xb-voice-bar"></div></div>
        <span class="xb-voice-duration">${duration}"</span>
    </div>`;
}

function escapeHtml(text) {
    return String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ════════════════════════════════════════════════════════════════════════════
// 图片处理
// ════════════════════════════════════════════════════════════════════════════

function hydrateImageSlots(container) {
    container.querySelectorAll('.xb-img-slot').forEach(slot => {
        if (slot.dataset.observed === '1') return;
        slot.dataset.observed = '1';
        
        if (!slot.dataset.loaded && !slot.dataset.loading && !slot.querySelector('img')) {
            // Template-only UI markup.
            // eslint-disable-next-line no-unsanitized/property
            slot.innerHTML = `<div class="xb-img-placeholder"><i class="fa-regular fa-image"></i><span>滚动加载</span></div>`;
        }
        
        imageObserver?.observe(slot);
    });
}

async function loadImage(slot, tags) {
    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    slot.innerHTML = `<div class="xb-img-loading"><i class="fa-solid fa-spinner"></i> 检查缓存...</div>`;
    
    try {
        const base64 = await generateImage(tags, (status, position, delay) => {
            switch (status) {
                case 'queued':
                    // Template-only UI markup.
                    // eslint-disable-next-line no-unsanitized/property
                    slot.innerHTML = `<div class="xb-img-loading"><i class="fa-solid fa-clock"></i> 排队中 #${position}</div>`;
                    break;
                case 'generating':
                    // Template-only UI markup.
                    // eslint-disable-next-line no-unsanitized/property
                    slot.innerHTML = `<div class="xb-img-loading"><i class="fa-solid fa-palette"></i> 生成中${position > 0 ? ` (${position} 排队)` : ''}...</div>`;
                    break;
                case 'waiting':
                    // Template-only UI markup.
                    // eslint-disable-next-line no-unsanitized/property
                    slot.innerHTML = `<div class="xb-img-loading"><i class="fa-solid fa-clock"></i> 排队中 #${position} (${delay}s)</div>`;
                    break;
            }
        });
        
        if (base64) renderImage(slot, base64, false);
        
    } catch (err) {
        slot.dataset.loaded = '1';
        slot.dataset.loading = '';
        
        if (err.message === '队列已清空') {
            // Template-only UI markup.
            // eslint-disable-next-line no-unsanitized/property
            slot.innerHTML = `<div class="xb-img-placeholder"><i class="fa-regular fa-image"></i><span>滚动加载</span></div>`;
            slot.dataset.loading = '';
            slot.dataset.observed = '';
            return;
        }
        
        // Template-only UI markup with escaped error text.
        // eslint-disable-next-line no-unsanitized/property
        slot.innerHTML = `<div class="xb-img-error"><i class="fa-solid fa-exclamation-triangle"></i><div>${escapeHtml(err?.message || '失败')}</div><button class="xb-img-retry" data-tags="${encodeURIComponent(tags)}">重试</button></div>`;
        bindRetryButton(slot);
    }
}

function renderImage(slot, base64, fromCache) {
    slot.dataset.loaded = '1';
    slot.dataset.loading = '';
    
    const img = document.createElement('img');
    img.src = `data:image/png;base64,${base64}`;
    img.className = 'xb-generated-img';
    img.onclick = () => window.open(img.src, '_blank');
    
    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    slot.innerHTML = '';
    slot.appendChild(img);
    
    if (fromCache) {
        const badge = document.createElement('span');
        badge.className = 'xb-img-badge';
        // Template-only UI markup.
        // eslint-disable-next-line no-unsanitized/property
        badge.innerHTML = '<i class="fa-solid fa-bolt"></i>';
        slot.appendChild(badge);
    }
}

function bindRetryButton(slot) {
    const btn = slot.querySelector('.xb-img-retry');
    if (!btn) return;
    btn.onclick = async (e) => {
        e.stopPropagation();
        const tags = decodeURIComponent(btn.dataset.tags || '');
        if (!tags) return;
        slot.dataset.loaded = '';
        slot.dataset.loading = '1';
        await loadImage(slot, tags);
    };
}

// ════════════════════════════════════════════════════════════════════════════
// 语音处理
// ════════════════════════════════════════════════════════════════════════════

function hydrateVoiceSlots(container) {
    container.querySelectorAll('.xb-voice-bubble').forEach(bubble => {
        if (bubble.dataset.bound === '1') return;
        bubble.dataset.bound = '1';
        
        const text = decodeURIComponent(bubble.dataset.text || '');
        const emotion = bubble.dataset.emotion || '';
        const speaker = bubble.dataset.speaker ? decodeURIComponent(bubble.dataset.speaker) : '';
        const useTts = bubble.dataset.tts === '1';
        if (!text) return;
        
        bubble.onclick = async (e) => {
            e.stopPropagation();
            if (bubble.classList.contains('loading')) return;
            
            if (bubble.classList.contains('playing') && currentAudio) {
                currentAudio.pause();
                currentAudio = null;
                bubble.classList.remove('playing');
                return;
            }
            
            if (currentAudio) {
                currentAudio.pause();
                currentAudio = null;
            }
            document.querySelectorAll('.xb-voice-bubble.playing').forEach(el => el.classList.remove('playing'));

            const ttsApi = (/** @type {Record<string, any>} */ (window))?.['xiaobaixTts'];
            if (useTts && ttsApi?.speak) {
                bubble.classList.add('loading');
                bubble.classList.remove('error', 'playing');
                try {
                    await ttsApi.speak(text, {
                        speaker: speaker || undefined,
                        emotion: emotion || undefined,
                    });
                    bubble.classList.remove('loading');
                } catch (err) {
                    bubble.classList.remove('loading');
                    bubble.classList.add('error');
                    setTimeout(() => bubble.classList.remove('error'), 3000);
                }
                return;
            }
            
            await playVoice(text, emotion, bubble);
        };
    });
}

function parseSpeakerVoiceToken(raw) {
    if (!raw) return null;
    const inner = String(raw).trim().replace(/^\[/, '').replace(/\]$/, '');
    if (!/\bvoice\s*=/.test(inner)) return null;
    const parts = inner.split(';').map(s => s.trim()).filter(Boolean);
    const result = { text: '', speaker: '', emotion: '' };
    for (const part of parts) {
        const idx = part.indexOf('=');
        if (idx === -1) continue;
        const key = part.slice(0, idx).trim().toLowerCase();
        const val = part.slice(idx + 1).trim();
        if (key === 'voice') result.text = val;
        if (key === 'speaker') result.speaker = val;
        if (key === 'emotion') result.emotion = val.toLowerCase();
    }
    return result;
}

async function playVoice(text, emotion, bubbleEl) {
    bubbleEl.classList.add('loading');
    bubbleEl.classList.remove('error');
    
    try {
        const settings = extension_settings[EXT_ID]?.fourthWallVoice || {};
        const audioBase64 = await synthesizeSpeech(text, {
            voiceKey: settings.voice || DEFAULT_VOICE,
            speed: settings.speed || DEFAULT_SPEED,
            emotion: VALID_EMOTIONS.includes(emotion) ? emotion : null
        });
        
        bubbleEl.classList.remove('loading');
        bubbleEl.classList.add('playing');
        
        currentAudio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        currentAudio.onended = () => { bubbleEl.classList.remove('playing'); currentAudio = null; };
        currentAudio.onerror = () => { bubbleEl.classList.remove('playing'); bubbleEl.classList.add('error'); currentAudio = null; };
        await currentAudio.play();
        
    } catch (err) {
        console.error('[MessageEnhancer] TTS 错误:', err);
        bubbleEl.classList.remove('loading', 'playing');
        bubbleEl.classList.add('error');
        setTimeout(() => bubbleEl.classList.remove('error'), 3000);
    }
}
