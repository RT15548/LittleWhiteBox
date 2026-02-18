// ════════════════════════════════════════════
// Fourth Wall Module - Main Controller
// ════════════════════════════════════════════════════════════════════════════
import { extension_settings, getContext, saveMetadataDebounced } from "../../../../../extensions.js";
import { saveSettingsDebounced, chat_metadata, default_user_avatar, default_avatar } from "../../../../../../script.js";
import { EXT_ID, extensionFolderPath } from "../../core/constants.js";
import { createModuleEvents, event_types } from "../../core/event-manager.js";
import { xbLog } from "../../core/debug-core.js";

import { handleCheckCache, handleGenerate, clearExpiredCache } from "./fw-image.js";
import { synthesizeAndPlay, stopCurrent as stopCurrentVoice } from "./fw-voice-runtime.js";
import {
    buildPrompt,
    buildCommentaryPrompt,
    DEFAULT_TOPUSER,
    DEFAULT_CONFIRM,
    DEFAULT_BOTTOM,
    DEFAULT_META_PROTOCOL
} from "./fw-prompt.js";
import { initMessageEnhancer, cleanupMessageEnhancer } from "./fw-message-enhancer.js";
import { postToIframe, isTrustedMessage, getTrustedOrigin } from "../../core/iframe-messaging.js";

// ════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════════════════════

const events = createModuleEvents('fourthWall');
const iframePath = `${extensionFolderPath}/modules/fourth-wall/fourth-wall.html`;
const STREAM_SESSION_ID = 'xb9';
const COMMENTARY_COOLDOWN = 180000;
const IFRAME_PING_TIMEOUT = 800;

// ════════════════════════════════════════════════════════════════════════════
// State
// ════════════════════════════════════════════════════════════════════════════

let overlayCreated = false;
let frameReady = false;
let pendingFrameMessages = [];
let isStreaming = false;
let streamTimerId = null;
let floatBtnResizeHandler = null;
let suppressFloatBtnClickUntil = 0;
let currentLoadedChatId = null;
let lastCommentaryTime = 0;
let commentaryBubbleEl = null;
let commentaryBubbleTimer = null;
let currentVoiceRequestId = null;

let visibilityHandler = null;
let pendingPingId = null;

// ════════════════════════════════════════════════════════════════════════════
// Settings
// ════════════════════════════════════════════════════════════════════════════

function getSettings() {
    extension_settings[EXT_ID] ||= {};
    const s = extension_settings[EXT_ID];

    s.fourthWall ||= { enabled: true };
    s.fourthWallImage ||= { enablePrompt: false };
    s.fourthWallVoice ||= { enabled: false };
    s.fourthWallCommentary ||= { enabled: false, probability: 30 };
    s.fourthWallPromptTemplates ||= {};

    const t = s.fourthWallPromptTemplates;
    if (t.topuser === undefined) t.topuser = DEFAULT_TOPUSER;
    if (t.confirm === undefined) t.confirm = DEFAULT_CONFIRM;
    if (t.bottom === undefined) t.bottom = DEFAULT_BOTTOM;
    if (t.metaProtocol === undefined) t.metaProtocol = DEFAULT_META_PROTOCOL;

    return s;
}

// ════════════════════════════════════════════════════════════════════════════
// Utilities
// ════════════════════════════════════════════════════════════════════════════

function b64UrlEncode(str) {
    const utf8 = new TextEncoder().encode(String(str));
    let bin = '';
    utf8.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function extractMsg(text) {
    const src = String(text || '');
    const re = /<msg\b[^>]*>([\s\S]*?)<\/msg>/gi;
    const parts = [];
    let m;
    while ((m = re.exec(src)) !== null) {
        const inner = String(m[1] || '').trim();
        if (inner) parts.push(inner);
    }
    return parts.join('\n').trim();
}

function extractMsgPartial(text) {
    const src = String(text || '');
    const openIdx = src.toLowerCase().lastIndexOf('<msg');
    if (openIdx < 0) return '';
    const gt = src.indexOf('>', openIdx);
    if (gt < 0) return '';
    let out = src.slice(gt + 1);
    const closeIdx = out.toLowerCase().indexOf('</msg>');
    if (closeIdx >= 0) out = out.slice(0, closeIdx);
    return out.trim();
}

function extractThinking(text) {
    const src = String(text || '');
    const msgStart = src.toLowerCase().indexOf('<msg');
    if (msgStart <= 0) return '';
    return src.slice(0, msgStart).trim();
}

function extractThinkingPartial(text) {
    const src = String(text || '');
    const msgStart = src.toLowerCase().indexOf('<msg');
    if (msgStart < 0) return src.trim();
    if (msgStart === 0) return '';
    return src.slice(0, msgStart).trim();
}

function getCurrentChatIdSafe() {
    try { return getContext().chatId || null; } catch { return null; }
}

function getAvatarUrls() {
    const origin = typeof location !== 'undefined' && location.origin ? location.origin : '';
    const toAbsUrl = (relOrUrl) => {
        if (!relOrUrl) return '';
        const s = String(relOrUrl);
        if (/^(data:|blob:|https?:)/i.test(s)) return s;
        if (s.startsWith('User Avatars/')) return `${origin}/${s}`;
        const encoded = s.split('/').map(seg => encodeURIComponent(seg)).join('/');
        return `${origin}/${encoded.replace(/^\/+/, '')}`;
    };
    const pickSrc = (selectors) => {
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el) {
                const highRes = el.getAttribute('data-izoomify-url');
                if (highRes) return highRes;
                if (el.src) return el.src;
            }
        }
        return '';
    };
    let user = pickSrc(['#user_avatar_block img', '#avatar_user img', '.user_avatar img', 'img#avatar_user', '.st-user-avatar img']) || (typeof default_user_avatar !== 'undefined' ? default_user_avatar : '');
    const m = String(user).match(/\/thumbnail\?type=persona&file=([^&]+)/i);
    if (m) user = `User Avatars/${decodeURIComponent(m[1])}`;
    const ctx = getContext?.() || {};
    const chId = ctx.characterId ?? ctx.this_chid;
    const ch = Array.isArray(ctx.characters) ? ctx.characters[chId] : null;
    let char = ch?.avatar || (typeof default_avatar !== 'undefined' ? default_avatar : '');
    if (char && !/^(data:|blob:|https?:)/i.test(char)) {
        char = String(char).includes('/') ? char.replace(/^\/+/, '') : `characters/${char}`;
    }
    return { user: toAbsUrl(user), char: toAbsUrl(char) };
}

// ════════════════════════════════════════════════════════════════════════════
// Storage
// ════════════════════════════════════════════════════════════════════════════

function getFWStore(chatId = getCurrentChatIdSafe()) {
    if (!chatId) return null;
    chat_metadata[chatId] ||= {};
    chat_metadata[chatId].extensions ||= {};
    chat_metadata[chatId].extensions[EXT_ID] ||= {};
    chat_metadata[chatId].extensions[EXT_ID].fw ||= {};

    const fw = chat_metadata[chatId].extensions[EXT_ID].fw;
    fw.settings ||= { maxChatLayers: 9999, maxMetaTurns: 9999, stream: true };

    if (!fw.sessions) {
        const oldHistory = Array.isArray(fw.history) ? fw.history.slice() : [];
        fw.sessions = [{ id: 'default', name: 'Default', createdAt: Date.now(), history: oldHistory }];
        fw.activeSessionId = 'default';
        if (Object.prototype.hasOwnProperty.call(fw, 'history')) delete fw.history;
    }

    if (!fw.activeSessionId || !fw.sessions.find(s => s.id === fw.activeSessionId)) {
        fw.activeSessionId = fw.sessions[0]?.id || null;
    }
    return fw;
}

function getActiveSession(chatId = getCurrentChatIdSafe()) {
    const store = getFWStore(chatId);
    if (!store) return null;
    return store.sessions.find(s => s.id === store.activeSessionId) || store.sessions[0];
}

function saveFWStore() {
    saveMetadataDebounced?.();
}

// ════════════════════════════════════════════════════════════════════════════
// iframe Communication
// ════════════════════════════════════════════════════════════════════════════

function postToFrame(payload) {
    const iframe = document.getElementById('xiaobaix-fourth-wall-iframe');
    if (!iframe?.contentWindow || !frameReady) {
        pendingFrameMessages.push(payload);
        return;
    }
    postToIframe(iframe, payload, 'LittleWhiteBox');
}

function flushPendingMessages() {
    if (!frameReady) return;
    const iframe = document.getElementById('xiaobaix-fourth-wall-iframe');
    if (!iframe?.contentWindow) return;
    pendingFrameMessages.forEach(p => postToIframe(iframe, p, 'LittleWhiteBox'));
    pendingFrameMessages = [];
}

function sendInitData() {
    const store = getFWStore();
    const settings = getSettings();
    const session = getActiveSession();
    const avatars = getAvatarUrls();

    postToFrame({
        type: 'INIT_DATA',
        settings: store?.settings || {},
        sessions: store?.sessions || [],
        activeSessionId: store?.activeSessionId,
        history: session?.history || [],
        imgSettings: settings.fourthWallImage || {},
        voiceSettings: settings.fourthWallVoice || {},
        commentarySettings: settings.fourthWallCommentary || {},
        promptTemplates: settings.fourthWallPromptTemplates || {},
        avatars
    });
}

// ════════════════════════════════════════════════════════════════════════════
// iframe Health Check & Recovery
// ════════════════════════════════════════════════════════════════════════════

function handleVisibilityChange() {
    if (document.visibilityState !== 'visible') return;
    const overlay = document.getElementById('xiaobaix-fourth-wall-overlay');
    if (!overlay || overlay.style.display === 'none') return;
    checkIframeHealth();
}

function checkIframeHealth() {
    const iframe = document.getElementById('xiaobaix-fourth-wall-iframe');
    if (!iframe) return;

    const pingId = 'ping_' + Date.now();
    pendingPingId = pingId;

    try {
        const win = iframe.contentWindow;
        if (!win) {
            recoverIframe('contentWindow missing');
            return;
        }
        win.postMessage({ source: 'LittleWhiteBox', type: 'PING', pingId }, getTrustedOrigin());
    } catch (e) {
        recoverIframe('Cannot access iframe: ' + e.message);
        return;
    }

    setTimeout(() => {
        if (pendingPingId === pingId) {
            recoverIframe('PING timeout');
        }
    }, IFRAME_PING_TIMEOUT);
}

function handlePongResponse(pingId) {
    if (pendingPingId === pingId) {
        pendingPingId = null;
    }
}

function recoverIframe(reason) {
    const iframe = document.getElementById('xiaobaix-fourth-wall-iframe');
    if (!iframe) return;

    try { xbLog.warn('fourthWall', `iframe recovery: ${reason}`); } catch { }

    frameReady = false;
    pendingFrameMessages = [];
    pendingPingId = null;

    if (isStreaming) {
        cancelGeneration();
    }

    iframe.src = iframePath;
}

// ════════════════════════════════════════════════════════════════════════════
// Voice Handling
// ════════════════════════════════════════════════════════════════════════════

function handlePlayVoice(data) {
    const { text, emotion, voiceRequestId } = data;

    if (!text?.trim()) {
        postToFrame({ type: 'VOICE_STATE', voiceRequestId, state: 'error', message: 'Voice text is empty' });
        return;
    }

    // Notify old request as stopped
    if (currentVoiceRequestId && currentVoiceRequestId !== voiceRequestId) {
        postToFrame({ type: 'VOICE_STATE', voiceRequestId: currentVoiceRequestId, state: 'stopped' });
    }

    currentVoiceRequestId = voiceRequestId;

    synthesizeAndPlay(text, emotion, {
        requestId: voiceRequestId,
        onState(state, info) {
            if (currentVoiceRequestId !== voiceRequestId) return;
            postToFrame({
                type: 'VOICE_STATE',
                voiceRequestId,
                state,
                duration: info?.duration,
                message: info?.message,
            });
        },
    });
}

function handleStopVoice(data) {
    const targetId = data?.voiceRequestId || currentVoiceRequestId;
    stopCurrentVoice();
    if (targetId) {
        postToFrame({ type: 'VOICE_STATE', voiceRequestId: targetId, state: 'stopped' });
    }
    currentVoiceRequestId = null;
}

function stopVoiceAndNotify() {
    if (currentVoiceRequestId) {
        postToFrame({ type: 'VOICE_STATE', voiceRequestId: currentVoiceRequestId, state: 'stopped' });
    }
    stopCurrentVoice();
    currentVoiceRequestId = null;
}

// ════════════════════════════════════════════════════════════════════════════
// Frame Message Handler
// ════════════════════════════════════════════════════════════════════════════

function handleFrameMessage(event) {
    const iframe = document.getElementById('xiaobaix-fourth-wall-iframe');
    if (!isTrustedMessage(event, iframe, 'LittleWhiteBox-FourthWall')) return;
    const data = event.data;

    const store = getFWStore();
    const settings = getSettings();

    switch (data.type) {
        case 'FRAME_READY':
            frameReady = true;
            flushPendingMessages();
            sendInitData();
            break;

        case 'PONG':
            handlePongResponse(data.pingId);
            break;

        case 'TOGGLE_FULLSCREEN':
            toggleFullscreen();
            break;

        case 'SEND_MESSAGE':
            handleSendMessage(data);
            break;

        case 'REGENERATE':
            handleRegenerate(data);
            break;

        case 'CANCEL_GENERATION':
            cancelGeneration();
            break;

        case 'SAVE_SETTINGS':
            if (store) {
                Object.assign(store.settings, data.settings);
                saveFWStore();
            }
            break;

        case 'SAVE_IMG_SETTINGS':
            Object.assign(settings.fourthWallImage, data.imgSettings);
            saveSettingsDebounced();
            break;

        case 'SAVE_VOICE_SETTINGS':
            settings.fourthWallVoice.enabled = !!data.voiceSettings?.enabled;
            saveSettingsDebounced();
            break;

        case 'SAVE_COMMENTARY_SETTINGS':
            Object.assign(settings.fourthWallCommentary, data.commentarySettings);
            saveSettingsDebounced();
            break;

        case 'SAVE_PROMPT_TEMPLATES':
            settings.fourthWallPromptTemplates = data.templates;
            saveSettingsDebounced();
            break;

        case 'RESTORE_DEFAULT_PROMPT_TEMPLATES':
            extension_settings[EXT_ID].fourthWallPromptTemplates = {};
            getSettings();
            saveSettingsDebounced();
            sendInitData();
            break;

        case 'SAVE_HISTORY': {
            const session = getActiveSession();
            if (session) {
                session.history = data.history;
                saveFWStore();
            }
            break;
        }

        case 'RESET_HISTORY': {
            const session = getActiveSession();
            if (session) {
                session.history = [];
                saveFWStore();
            }
            break;
        }

        case 'SWITCH_SESSION':
            if (store) {
                store.activeSessionId = data.sessionId;
                saveFWStore();
                sendInitData();
            }
            break;

        case 'ADD_SESSION':
            if (store) {
                const newId = 'sess_' + Date.now();
                store.sessions.push({ id: newId, name: data.name, createdAt: Date.now(), history: [] });
                store.activeSessionId = newId;
                saveFWStore();
                sendInitData();
            }
            break;

        case 'RENAME_SESSION':
            if (store) {
                const sess = store.sessions.find(s => s.id === data.sessionId);
                if (sess) { sess.name = data.name; saveFWStore(); sendInitData(); }
            }
            break;

        case 'DELETE_SESSION':
            if (store && store.sessions.length > 1) {
                store.sessions = store.sessions.filter(s => s.id !== data.sessionId);
                store.activeSessionId = store.sessions[0].id;
                saveFWStore();
                sendInitData();
            }
            break;

        case 'CLOSE_OVERLAY':
            hideOverlay();
            break;

        case 'CHECK_IMAGE_CACHE':
            handleCheckCache(data, postToFrame);
            break;

        case 'GENERATE_IMAGE':
            handleGenerate(data, postToFrame);
            break;

        case 'PLAY_VOICE':
            handlePlayVoice(data);
            break;

        case 'STOP_VOICE':
            handleStopVoice(data);
            break;
    }
}

// ════════════════════════════════════════════════════════════════════════════
// Generation
// ════════════════════════════════════════════════════════════════════════════

async function startGeneration(data) {
    const { msg1, msg2, msg3, msg4 } = await buildPrompt({
        userInput: data.userInput,
        history: data.history,
        settings: data.settings,
        imgSettings: data.imgSettings,
        voiceSettings: data.voiceSettings,
        promptTemplates: getSettings().fourthWallPromptTemplates
    });

    const gen = window.xiaobaixStreamingGeneration;
    if (!gen?.xbgenrawCommand) throw new Error('xbgenraw module unavailable');

    const topMessages = [
        { role: 'user', content: msg1 },
        { role: 'assistant', content: msg2 },
        { role: 'user', content: msg3 },
    ];

    await gen.xbgenrawCommand({
        id: STREAM_SESSION_ID,
        top64: b64UrlEncode(JSON.stringify(topMessages)),
        bottomassistant: msg4,
        nonstream: data.settings.stream ? 'false' : 'true',
        as: 'user',
    }, '');

    if (data.settings.stream) {
        startStreamingPoll();
    } else {
        startNonstreamAwait();
    }
}

async function handleSendMessage(data) {
    if (isStreaming) return;
    isStreaming = true;

    const session = getActiveSession();
    if (session) {
        session.history = data.history;
        saveFWStore();
    }

    try {
        await startGeneration(data);
    } catch {
        stopStreamingPoll();
        isStreaming = false;
        postToFrame({ type: 'GENERATION_CANCELLED' });
    }
}

async function handleRegenerate(data) {
    if (isStreaming) return;
    isStreaming = true;

    const session = getActiveSession();
    if (session) {
        session.history = data.history;
        saveFWStore();
    }

    try {
        await startGeneration(data);
    } catch {
        stopStreamingPoll();
        isStreaming = false;
        postToFrame({ type: 'GENERATION_CANCELLED' });
    }
}

function startStreamingPoll() {
    stopStreamingPoll();
    streamTimerId = setInterval(() => {
        const gen = window.xiaobaixStreamingGeneration;
        if (!gen?.getLastGeneration) return;

        const raw = gen.getLastGeneration(STREAM_SESSION_ID) || '...';
        const thinking = extractThinkingPartial(raw);
        const msg = extractMsg(raw) || extractMsgPartial(raw);
        postToFrame({ type: 'STREAM_UPDATE', text: msg || '...', thinking: thinking || undefined });

        const st = gen.getStatus?.(STREAM_SESSION_ID);
        if (st && st.isStreaming === false) finalizeGeneration();
    }, 80);
}

function startNonstreamAwait() {
    stopStreamingPoll();
    streamTimerId = setInterval(() => {
        const gen = window.xiaobaixStreamingGeneration;
        const st = gen?.getStatus?.(STREAM_SESSION_ID);
        if (st && st.isStreaming === false) finalizeGeneration();
    }, 120);
}

function stopStreamingPoll() {
    if (streamTimerId) {
        clearInterval(streamTimerId);
        streamTimerId = null;
    }
}

function finalizeGeneration() {
    stopStreamingPoll();
    const gen = window.xiaobaixStreamingGeneration;
    const rawText = gen?.getLastGeneration?.(STREAM_SESSION_ID) || '(no response)';
    const finalText = extractMsg(rawText) || '(no response)';
    const thinkingText = extractThinking(rawText);

    isStreaming = false;

    const session = getActiveSession();
    if (session) {
        session.history.push({ role: 'ai', content: finalText, thinking: thinkingText || undefined, ts: Date.now() });
        saveFWStore();
    }

    postToFrame({ type: 'STREAM_COMPLETE', finalText, thinking: thinkingText });
}

function cancelGeneration() {
    const gen = window.xiaobaixStreamingGeneration;
    stopStreamingPoll();
    isStreaming = false;
    try { gen?.cancel?.(STREAM_SESSION_ID); } catch { }
    postToFrame({ type: 'GENERATION_CANCELLED' });
}

// ════════════════════════════════════════════════════════════════════════════
// Commentary
// ════════════════════════════════════════════════════════════════════════════

function shouldTriggerCommentary() {
    const settings = getSettings();
    if (!settings.fourthWallCommentary?.enabled) return false;
    if (Date.now() - lastCommentaryTime < COMMENTARY_COOLDOWN) return false;
    const prob = settings.fourthWallCommentary.probability || 30;
    if (Math.random() * 100 > prob) return false;
    return true;
}

function getMessageTextFromEventArg(arg) {
    if (!arg) return '';
    if (typeof arg === 'string') return arg;
    if (typeof arg === 'object') {
        if (typeof arg.mes === 'string') return arg.mes;
        if (typeof arg.message === 'string') return arg.message;
        const messageId = arg.messageId ?? arg.id ?? arg.index;
        if (Number.isFinite(messageId)) {
            try { return getContext?.()?.chat?.[messageId]?.mes || ''; } catch { return ''; }
        }
        return '';
    }
    if (typeof arg === 'number') {
        try { return getContext?.()?.chat?.[arg]?.mes || ''; } catch { return ''; }
    }
    return '';
}

async function generateCommentary(targetText, type) {
    const store = getFWStore();
    const session = getActiveSession();
    const settings = getSettings();
    if (!store || !session) return null;

    const built = await buildCommentaryPrompt({
        targetText,
        type,
        history: session.history || [],
        settings: store.settings || {},
        imgSettings: settings.fourthWallImage || {},
        voiceSettings: settings.fourthWallVoice || {}
    });

    if (!built) return null;
    const { msg1, msg2, msg3, msg4 } = built;

    const gen = window.xiaobaixStreamingGeneration;
    if (!gen?.xbgenrawCommand) return null;

    const topMessages = [
        { role: 'user', content: msg1 },
        { role: 'assistant', content: msg2 },
        { role: 'user', content: msg3 },
    ];

    try {
        const result = await gen.xbgenrawCommand({
            id: 'xb8',
            top64: b64UrlEncode(JSON.stringify(topMessages)),
            bottomassistant: msg4,
            nonstream: 'true',
            as: 'user',
        }, '');
        return extractMsg(result) || null;
    } catch {
        return null;
    }
}

async function handleAIMessageForCommentary(data) {
    if ($('#xiaobaix-fourth-wall-overlay').is(':visible')) return;
    if (!shouldTriggerCommentary()) return;
    const ctx = getContext?.() || {};
    const messageId = typeof data === 'object' ? data.messageId : data;
    const msgObj = Number.isFinite(messageId) ? ctx?.chat?.[messageId] : null;
    if (msgObj?.is_user) return;
    const messageText = getMessageTextFromEventArg(data);
    if (!String(messageText).trim()) return;
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    const commentary = await generateCommentary(messageText, 'ai_message');
    if (!commentary) return;
    const session = getActiveSession();
    if (session) {
        session.history.push({ role: 'ai', content: `(glanced at the last line) ${commentary}`, ts: Date.now(), type: 'commentary' });
        saveFWStore();
    }
    showCommentaryBubble(commentary);
}

async function handleEditForCommentary(data) {
    if ($('#xiaobaix-fourth-wall-overlay').is(':visible')) return;
    if (!shouldTriggerCommentary()) return;

    const ctx = getContext?.() || {};
    const messageId = typeof data === 'object' ? (data.messageId ?? data.id ?? data.index) : data;
    const msgObj = Number.isFinite(messageId) ? ctx?.chat?.[messageId] : null;
    const messageText = getMessageTextFromEventArg(data);
    if (!String(messageText).trim()) return;

    await new Promise(r => setTimeout(r, 500 + Math.random() * 500));

    const editType = msgObj?.is_user ? 'edit_own' : 'edit_ai';
    const commentary = await generateCommentary(messageText, editType);
    if (!commentary) return;

    const session = getActiveSession();
    if (session) {
        const prefix = editType === 'edit_ai' ? '(noticed you edited my line) ' : '(caught you sneaking edits) ';
        session.history.push({ role: 'ai', content: `${prefix}${commentary}`, ts: Date.now(), type: 'commentary' });
        saveFWStore();
    }
    showCommentaryBubble(commentary);
}

function getFloatBtnPosition() {
    const btn = document.getElementById('xiaobaix-fw-float-btn');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(`${EXT_ID}:fourthWallFloatBtnPos`) || '{}') || {}; } catch { }
    return { top: rect.top, left: rect.left, width: rect.width, height: rect.height, side: stored.side || 'right' };
}

function showCommentaryBubble(text) {
    hideCommentaryBubble();
    const pos = getFloatBtnPosition();
    if (!pos) return;
    const bubble = document.createElement('div');
    bubble.className = 'fw-commentary-bubble';
    bubble.textContent = text;
    bubble.onclick = hideCommentaryBubble;
    Object.assign(bubble.style, {
        position: 'fixed', zIndex: '10000', maxWidth: '200px', padding: '8px 12px',
        background: 'rgba(255,255,255,0.95)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        fontSize: '13px', color: '#333', cursor: 'pointer', opacity: '0', transform: 'scale(0.8)', transition: 'opacity 0.3s, transform 0.3s'
    });
    document.body.appendChild(bubble);
    commentaryBubbleEl = bubble;
    const margin = 8;
    const bubbleW = bubble.offsetWidth || 0;
    const bubbleH = bubble.offsetHeight || 0;
    const maxTop = Math.max(margin, window.innerHeight - bubbleH - margin);
    const top = Math.min(Math.max(pos.top, margin), maxTop);
    bubble.style.top = `${top}px`;
    if (pos.side === 'right') {
        const maxRight = Math.max(margin, window.innerWidth - bubbleW - margin);
        const right = Math.min(Math.max(window.innerWidth - pos.left + 8, margin), maxRight);
        bubble.style.right = `${right}px`;
        bubble.style.left = '';
        bubble.style.borderBottomRightRadius = '4px';
    } else {
        const maxLeft = Math.max(margin, window.innerWidth - bubbleW - margin);
        const left = Math.min(Math.max(pos.left + pos.width + 8, margin), maxLeft);
        bubble.style.left = `${left}px`;
        bubble.style.right = '';
        bubble.style.borderBottomLeftRadius = '4px';
    }
    requestAnimationFrame(() => { bubble.style.opacity = '1'; bubble.style.transform = 'scale(1)'; });
    const len = (text || '').length;
    const duration = Math.min(2000 + Math.ceil(len / 5) * 1000, 8000);
    commentaryBubbleTimer = setTimeout(hideCommentaryBubble, duration);
    lastCommentaryTime = Date.now();
}

function hideCommentaryBubble() {
    if (commentaryBubbleTimer) { clearTimeout(commentaryBubbleTimer); commentaryBubbleTimer = null; }
    if (commentaryBubbleEl) {
        commentaryBubbleEl.style.opacity = '0';
        commentaryBubbleEl.style.transform = 'scale(0.8)';
        setTimeout(() => { commentaryBubbleEl?.remove(); commentaryBubbleEl = null; }, 300);
    }
}

function initCommentary() {
    events.on(event_types.MESSAGE_RECEIVED, handleAIMessageForCommentary);
    events.on(event_types.MESSAGE_EDITED, handleEditForCommentary);
}

function cleanupCommentary() {
    events.off(event_types.MESSAGE_RECEIVED, handleAIMessageForCommentary);
    events.off(event_types.MESSAGE_EDITED, handleEditForCommentary);
    hideCommentaryBubble();
    lastCommentaryTime = 0;
}

// ════════════════════════════════════════════
// Overlay
// ════════════════════════════════════════════════════════════════════════════

function createOverlay() {
    if (overlayCreated) return;
    overlayCreated = true;

    const isMobile = window.innerWidth <= 768;
    const frameInset = isMobile ? '0px' : '12px';
    const iframeRadius = isMobile ? '0px' : '12px';
    const framePadding = isMobile ? 'padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left) !important;' : '';

    const $overlay = $(`
        <div id="xiaobaix-fourth-wall-overlay" style="position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;z-index:99999!important;display:none;overflow:hidden!important;background:#000!important;">
            <div class="fw-backdrop" style="position:absolute!important;inset:0!important;background:rgba(0,0,0,.55)!important;backdrop-filter:blur(4px)!important;"></div>
            <div class="fw-frame-wrap" style="position:absolute!important;inset:${frameInset}!important;z-index:1!important;${framePadding}">
                <iframe id="xiaobaix-fourth-wall-iframe" class="xiaobaix-iframe" src="${iframePath}" style="width:100%!important;height:100%!important;border:none!important;border-radius:${iframeRadius}!important;box-shadow:0 0 30px rgba(0,0,0,.4)!important;background:#1a1a2e!important;"></iframe>
            </div>
        </div>
    `);

    $overlay.on('click', '.fw-backdrop', hideOverlay);
    document.body.appendChild($overlay[0]);
    // Guarded by isTrustedMessage (origin + source).
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleFrameMessage);

    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            postToFrame({ type: 'FULLSCREEN_STATE', isFullscreen: false });
        } else {
            postToFrame({ type: 'FULLSCREEN_STATE', isFullscreen: true });
        }
    });
}

function showOverlay() {
    if (!overlayCreated) createOverlay();
    const overlay = document.getElementById('xiaobaix-fourth-wall-overlay');
    overlay.style.display = 'block';

    const newChatId = getCurrentChatIdSafe();
    if (newChatId !== currentLoadedChatId) {
        currentLoadedChatId = newChatId;
        pendingFrameMessages = [];
    }

    sendInitData();
    postToFrame({ type: 'FULLSCREEN_STATE', isFullscreen: !!document.fullscreenElement });

    if (!visibilityHandler) {
        visibilityHandler = handleVisibilityChange;
        document.addEventListener('visibilitychange', visibilityHandler);
    }
}

function hideOverlay() {
    $('#xiaobaix-fourth-wall-overlay').hide();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
    stopVoiceAndNotify();

    if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
    }
    pendingPingId = null;
}

function toggleFullscreen() {
    const overlay = document.getElementById('xiaobaix-fourth-wall-overlay');
    if (!overlay) return;

    if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
            postToFrame({ type: 'FULLSCREEN_STATE', isFullscreen: false });
        }).catch(() => { });
    } else if (overlay.requestFullscreen) {
        overlay.requestFullscreen().then(() => {
            postToFrame({ type: 'FULLSCREEN_STATE', isFullscreen: true });
        }).catch(() => { });
    }
}

// ════════════════════════════════════════════════════════════════════════════
// Floating Button
// ════════════════════════════════════════════════════════════════════════════

function createFloatingButton() {
    if (document.getElementById('xiaobaix-fw-float-btn')) return;

    const POS_KEY = `${EXT_ID}:fourthWallFloatBtnPos`;
    const size = window.innerWidth <= 768 ? 32 : 40;
    const margin = 8;

    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
    const readPos = () => { try { return JSON.parse(localStorage.getItem(POS_KEY) || 'null'); } catch { return null; } };
    const writePos = (pos) => { try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { } };
    const calcDockLeft = (side, w) => (side === 'left' ? -Math.round(w / 2) : (window.innerWidth - Math.round(w / 2)));
    const applyDocked = (side, topRatio) => {
        const btn = document.getElementById('xiaobaix-fw-float-btn');
        if (!btn) return;
        const w = btn.offsetWidth || size;
        const h = btn.offsetHeight || size;
        const left = calcDockLeft(side, w);
        const top = clamp(Math.round((Number.isFinite(topRatio) ? topRatio : 0.5) * window.innerHeight), margin, Math.max(margin, window.innerHeight - h - margin));
        btn.style.left = `${left}px`;
        btn.style.top = `${top}px`;
    };

    const $btn = $(`
        <button id="xiaobaix-fw-float-btn" title="Fourth Wall" style="position:fixed!important;left:0px!important;top:0px!important;z-index:9999!important;width:${size}px!important;height:${size}px!important;border-radius:50%!important;border:none!important;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)!important;color:#fff!important;font-size:${Math.round(size * 0.45)}px!important;cursor:pointer!important;box-shadow:0 4px 15px rgba(102,126,234,0.4)!important;display:flex!important;align-items:center!important;justify-content:center!important;transition:left 0.2s,top 0.2s,transform 0.2s,box-shadow 0.2s!important;touch-action:none!important;user-select:none!important;">
            <i class="fa-solid fa-comments"></i>
        </button>
    `);

    $btn.on('click', () => {
        if (Date.now() < suppressFloatBtnClickUntil) return;
        if (!getSettings().fourthWall?.enabled) return;
        showOverlay();
    });

    $btn.on('mouseenter', function () { $(this).css({ 'transform': 'scale(1.08)', 'box-shadow': '0 6px 20px rgba(102, 126, 234, 0.5)' }); });
    $btn.on('mouseleave', function () { $(this).css({ 'transform': 'none', 'box-shadow': '0 4px 15px rgba(102, 126, 234, 0.4)' }); });

    document.body.appendChild($btn[0]);

    const initial = readPos();
    applyDocked(initial?.side || 'right', Number.isFinite(initial?.topRatio) ? initial.topRatio : 0.5);

    let dragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0, pointerId = null;

    const onPointerDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        const btn = e.currentTarget;
        pointerId = e.pointerId;
        try { btn.setPointerCapture(pointerId); } catch { }
        const rect = btn.getBoundingClientRect();
        startX = e.clientX; startY = e.clientY; startLeft = rect.left; startTop = rect.top;
        dragging = false;
        btn.style.transition = 'none';
    };

    const onPointerMove = (e) => {
        if (pointerId === null || e.pointerId !== pointerId) return;
        const btn = e.currentTarget;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) dragging = true;
        if (!dragging) return;
        const w = btn.offsetWidth || size;
        const h = btn.offsetHeight || size;
        const left = clamp(Math.round(startLeft + dx), -Math.round(w / 2), window.innerWidth - Math.round(w / 2));
        const top = clamp(Math.round(startTop + dy), margin, Math.max(margin, window.innerHeight - h - margin));
        btn.style.left = `${left}px`;
        btn.style.top = `${top}px`;
        e.preventDefault();
    };

    const onPointerUp = (e) => {
        if (pointerId === null || e.pointerId !== pointerId) return;
        const btn = e.currentTarget;
        try { btn.releasePointerCapture(pointerId); } catch { }
        pointerId = null;
        btn.style.transition = '';
        const rect = btn.getBoundingClientRect();
        const w = btn.offsetWidth || size;
        const h = btn.offsetHeight || size;
        if (dragging) {
            const centerX = rect.left + w / 2;
            const side = centerX < window.innerWidth / 2 ? 'left' : 'right';
            const top = clamp(Math.round(rect.top), margin, Math.max(margin, window.innerHeight - h - margin));
            const topRatio = window.innerHeight ? (top / window.innerHeight) : 0.5;
            applyDocked(side, topRatio);
            writePos({ side, topRatio });
            suppressFloatBtnClickUntil = Date.now() + 350;
            e.preventDefault();
        }
        dragging = false;
    };

    $btn[0].addEventListener('pointerdown', onPointerDown, { passive: false });
    $btn[0].addEventListener('pointermove', onPointerMove, { passive: false });
    $btn[0].addEventListener('pointerup', onPointerUp, { passive: false });
    $btn[0].addEventListener('pointercancel', onPointerUp, { passive: false });

    floatBtnResizeHandler = () => {
        const pos = readPos();
        applyDocked(pos?.side || 'right', Number.isFinite(pos?.topRatio) ? pos.topRatio : 0.5);
    };
    window.addEventListener('resize', floatBtnResizeHandler);
}

function removeFloatingButton() {
    $('#xiaobaix-fw-float-btn').remove();
    if (floatBtnResizeHandler) {
        window.removeEventListener('resize', floatBtnResizeHandler);
        floatBtnResizeHandler = null;
    }
}

// ════════════════════════════════════════════
// Init & Cleanup
// ════════════════════════════════════════════

function initFourthWall() {
    try { xbLog.info('fourthWall', 'initFourthWall'); } catch { }
    const settings = getSettings();
    if (!settings.fourthWall?.enabled) return;

    createFloatingButton();
    initCommentary();
    clearExpiredCache();
    initMessageEnhancer();

    events.on(event_types.CHAT_CHANGED, () => {
        cancelGeneration();
        currentLoadedChatId = null;
        pendingFrameMessages = [];
        if ($('#xiaobaix-fourth-wall-overlay').is(':visible')) hideOverlay();
    });
}

function fourthWallCleanup() {
    try { xbLog.info('fourthWall', 'fourthWallCleanup'); } catch { }
    events.cleanup();
    cleanupCommentary();
    removeFloatingButton();
    hideOverlay();
    cancelGeneration();
    cleanupMessageEnhancer();
    stopCurrentVoice();
    currentVoiceRequestId = null;
    frameReady = false;
    pendingFrameMessages = [];
    overlayCreated = false;
    currentLoadedChatId = null;
    pendingPingId = null;

    if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
    }

    $('#xiaobaix-fourth-wall-overlay').remove();
    window.removeEventListener('message', handleFrameMessage);
}

export { initFourthWall, fourthWallCleanup, showOverlay as showFourthWallPopup };

if (typeof window !== 'undefined') {
    window.fourthWallCleanup = fourthWallCleanup;
    window.showFourthWallPopup = showOverlay;

    document.addEventListener('xiaobaixEnabledChanged', e => {
        if (e?.detail?.enabled === false) {
            try { fourthWallCleanup(); } catch { }
        }
    });
}
