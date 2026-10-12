import { playTransientVoice, stopTransientVoice } from './tts-playback-runtime.js';
import { createMessageVoiceRegex, replaceMessageVoiceMarkers } from './tts-message-markup.js';

const STYLE_ID = 'xb-tts-message-voice-styles';
const errorTimers = new Map();

let activeHandle = null;
let activeBubble = null;
let isEnabled = () => false;

function createVoiceBubbleHtml(text, emotion, marker) {
    const duration = Math.max(2, Math.ceil(text.length / 4));
    return `<div class="xb-voice-bubble" data-xb-tts-message-voice="1" data-marker="${encodeURIComponent(marker)}" data-text="${encodeURIComponent(text)}" data-emotion="${encodeURIComponent(emotion)}">
        <div class="xb-voice-waves"><div class="xb-voice-bar"></div><div class="xb-voice-bar"></div><div class="xb-voice-bar"></div></div>
        <span class="xb-voice-duration">${duration}"</span>
    </div>`;
}

export function enhanceMessageVoiceHtml(value, enabled = false) {
    const html = String(value || '');
    if (!enabled) return html;
    return replaceMessageVoiceMarkers(html, createVoiceBubbleHtml);
}

export function hasMessageVoiceMarker(root) {
    return createMessageVoiceRegex().test(root?.textContent || '');
}

export function enhanceMessageVoiceTextNodes(root, enabled = true) {
    const documentTarget = root?.ownerDocument;
    if (!enabled || !documentTarget?.createTreeWalker) return false;

    const textNodes = [];
    const walker = documentTarget.createTreeWalker(root, 4);
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    let changed = false;
    textNodes.forEach((node) => {
        if (node.parentElement?.closest('code, pre, script, style, textarea, [data-xb-tts-message-voice="1"], .xb-tts-tag')) return;
        const current = node.nodeValue || '';
        const candidates = current.matchAll(createMessageVoiceRegex());
        const replacement = documentTarget.createDocumentFragment();
        let cursor = 0;
        let nodeChanged = false;
        for (const candidate of candidates) {
            const marker = candidate[0];
            const enhanced = enhanceMessageVoiceHtml(marker, true);
            if (enhanced === marker) continue;
            replacement.append(documentTarget.createTextNode(current.slice(cursor, candidate.index)));
            const template = documentTarget.createElement('template');
            // Only fixed markup generated from this exact voice marker is parsed as HTML.
            // eslint-disable-next-line no-unsanitized/property
            template.innerHTML = enhanced;
            replacement.append(template.content.cloneNode(true));
            cursor = candidate.index + marker.length;
            nodeChanged = true;
        }
        if (!nodeChanged) return;
        replacement.append(documentTarget.createTextNode(current.slice(cursor)));
        node.replaceWith(replacement);
        changed = true;
    });
    return changed;
}

function clearErrorTimers() {
    errorTimers.forEach(timer => globalThis.clearTimeout(timer));
    errorTimers.clear();
}

function decodeAttribute(value) {
    try {
        return decodeURIComponent(value || '');
    } catch {
        return null;
    }
}

function markTemporaryError(bubble) {
    globalThis.clearTimeout(errorTimers.get(bubble));
    bubble.classList.remove('loading', 'playing');
    bubble.classList.add('error');
    const timer = globalThis.setTimeout(() => {
        errorTimers.delete(bubble);
        bubble.classList.remove('error');
    }, 3000);
    errorTimers.set(bubble, timer);
}

export function stopMessageVoicePlayback() {
    const handle = activeHandle;
    activeHandle = null;
    activeBubble = null;
    if (handle) handle.stop?.();
    else stopTransientVoice();
    globalThis.document?.querySelectorAll?.('[data-xb-tts-message-voice="1"].playing, [data-xb-tts-message-voice="1"].loading').forEach((bubble) => {
        bubble.classList.remove('playing', 'loading');
    });
}

export function hydrateMessageVoiceBubbles(root, options = {}) {
    const play = options.play || playTransientVoice;
    const enabled = options.isEnabled || isEnabled;
    root?.querySelectorAll?.('[data-xb-tts-message-voice="1"]').forEach((bubble) => {
        if (bubble.dataset.bound === '1') return;
        const text = decodeAttribute(bubble.dataset.text);
        const emotion = decodeAttribute(bubble.dataset.emotion);
        if (!text || emotion === null) return;
        bubble.dataset.bound = '1';
        bubble.onclick = (event) => {
            event.stopPropagation();
            if (!enabled()) {
                markTemporaryError(bubble);
                return;
            }
            if (bubble.classList.contains('loading')) return;
            if (bubble.classList.contains('playing')) {
                stopMessageVoicePlayback();
                return;
            }

            stopMessageVoicePlayback();
            activeBubble = bubble;
            globalThis.document?.querySelectorAll?.('[data-xb-tts-message-voice="1"].error').forEach(element => element.classList.remove('error'));
            bubble.classList.add('loading');
            let handle = null;
            try {
                handle = play(text, emotion, {
                    onState(state) {
                        if (activeHandle !== handle && handle !== null) return;
                        if (state === 'loading') {
                            bubble.classList.add('loading');
                            bubble.classList.remove('playing', 'error');
                        } else if (state === 'playing') {
                            bubble.classList.remove('loading', 'error');
                            bubble.classList.add('playing');
                        } else if (state === 'ended' || state === 'stopped') {
                            bubble.classList.remove('loading', 'playing');
                            if (activeHandle === handle) activeHandle = null;
                            if (activeBubble === bubble) activeBubble = null;
                        } else if (state === 'error') {
                            markTemporaryError(bubble);
                            if (activeHandle === handle) activeHandle = null;
                            if (activeBubble === bubble) activeBubble = null;
                        }
                    },
                });
                activeHandle = handle;
            } catch {
                markTemporaryError(bubble);
                activeHandle = null;
                activeBubble = null;
            }
        };
    });
}

export function restoreMessageVoiceBubbles(root = globalThis.document) {
    const documentTarget = root?.ownerDocument || root;
    root?.querySelectorAll?.('[data-xb-tts-message-voice="1"]').forEach((bubble) => {
        const marker = decodeAttribute(bubble.dataset.marker);
        if (marker === null || !documentTarget?.createTextNode) return;
        bubble.replaceWith(documentTarget.createTextNode(marker));
    });
}

// Release only resources tied to the discarded content; another floor's voice
// and the independent TTS queue must keep playing.
export function releaseMessageVoiceBubbles(root) {
    const selector = '[data-xb-tts-message-voice="1"]';
    const bubbles = [...(root?.querySelectorAll?.(selector) || [])];
    if (root?.matches?.(selector)) bubbles.unshift(root);
    bubbles.forEach(bubble => {
        if (activeBubble === bubble) stopMessageVoicePlayback();
        globalThis.clearTimeout(errorTimers.get(bubble));
        errorTimers.delete(bubble);
        bubble.onclick = null;
        delete bubble.dataset.bound;
    });
}

function injectStyles() {
    if (globalThis.document?.getElementById(STYLE_ID)) return;
    const style = globalThis.document?.createElement('style');
    if (!style) return;
    style.id = STYLE_ID;
    style.textContent = `
.xb-voice-bubble { display:inline-flex; align-items:center; gap:6px; padding:5px 10px; background:#95ec69; border-radius:4px; cursor:pointer; user-select:none; min-width:60px; max-width:180px; margin:3px 0; transition:filter .15s; }
.xb-voice-bubble:hover { filter:brightness(.95); }
.xb-voice-bubble:active { filter:brightness(.9); }
.xb-voice-waves { display:flex; align-items:center; justify-content:flex-end; gap:2px; width:16px; height:14px; flex-shrink:0; }
.xb-voice-bar { width:2px; background:#fff; border-radius:1px; opacity:.9; }
.xb-voice-bar:nth-child(1) { height:5px; }
.xb-voice-bar:nth-child(2) { height:8px; }
.xb-voice-bar:nth-child(3) { height:11px; }
.xb-voice-bubble.playing .xb-voice-bar { animation:xb-tts-message-voice-wave 1.2s infinite ease-in-out; }
.xb-voice-bubble.playing .xb-voice-bar:nth-child(2) { animation-delay:.2s; }
.xb-voice-bubble.playing .xb-voice-bar:nth-child(3) { animation-delay:.4s; }
@keyframes xb-tts-message-voice-wave { 0%, 100% { opacity:.3; } 50% { opacity:1; } }
.xb-voice-duration { font-size:12px; color:#000; opacity:.7; margin-left:auto; }
.xb-voice-bubble.loading { opacity:.7; }
.xb-voice-bubble.loading .xb-voice-waves { animation:xb-tts-message-voice-pulse 1s infinite; }
@keyframes xb-tts-message-voice-pulse { 0%, 100% { opacity:.5; } 50% { opacity:1; } }
.xb-voice-bubble.error { background:#ffb3b3 !important; }
.mes[is_user="true"] .xb-voice-bubble { background:#fff; }
.mes[is_user="true"] .xb-voice-bar { background:#b2b2b2; }
`;
    globalThis.document.head.appendChild(style);
}

export function initMessageVoiceUi(options = {}) {
    isEnabled = options.isEnabled || (() => false);
    injectStyles();
}

export function cleanupMessageVoiceUi() {
    stopMessageVoicePlayback();
    clearErrorTimers();
    restoreMessageVoiceBubbles();
    globalThis.document?.getElementById(STYLE_ID)?.remove();
    isEnabled = () => false;
}
