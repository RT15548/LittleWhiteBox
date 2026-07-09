import { getRequestHeaders } from '../../../../../../script.js';
import { extensionFolderPath } from '../../core/constants.js';
import { isTrustedMessage, postToIframe } from '../../core/iframe-messaging.js';
import { buildEbookFrameConfig, saveEbookAgentConfig } from './host/assistant-config.js';
import { buildImportMaterial } from './host/import-materials.js';
import {
    exportPortablePreviewsForSlots,
    getDisplayPreviewForSlot,
    importPortablePreviews,
} from '../draw/shared/gallery-cache.js';
import { synthesizeAndPlay } from '../fourth-wall/fw-voice-runtime.js';

const SOURCE_HOST = 'xb-ebook-host';
const SOURCE_APP = 'xb-ebook-app';
const OVERLAY_ID = 'xiaobaix-ebook-overlay';
const IFRAME_ID = 'xiaobaix-ebook-iframe';
const HTML_PATH = `${extensionFolderPath}/modules/ebook/ebook.html`;
const BUILD_INFO_PATH = `${extensionFolderPath}/modules/ebook/dist/ebook-build.json`;

let ebookCacheKey = '';
let initialConfigPromise = null;

async function loadEbookCacheKey() {
    if (ebookCacheKey) return ebookCacheKey;
    let manifestVersion = '';
    let buildHash = '';
    try {
        const response = await fetch(`${extensionFolderPath}/manifest.json`, { cache: 'no-store' });
        const manifest = await response.json();
        manifestVersion = manifest.version || '';
    } catch {
        // Version is only used for cache busting; ignore load failures.
    }
    try {
        const response = await fetch(BUILD_INFO_PATH, { cache: 'no-store' });
        if (response.ok) {
            const buildInfo = await response.json();
            buildHash = buildInfo.hash || buildInfo.build || '';
        }
    } catch {
        // Older installs may not have a build info file yet.
    }
    ebookCacheKey = [manifestVersion, buildHash].filter(Boolean).join('-');
    return ebookCacheKey;
}

let frameReady = false;
let pendingMessages = [];
let messageHandlerInstalled = false;
let pendingOpenSettings = false;
let overlayResizeHandler = null;
const pendingDrawRequests = new Map();
let activeTtsPlayback = null;

function getIframe() {
    return document.getElementById(IFRAME_ID);
}

function isEbookMobileDevice() {
    const mobileTypes = ['mobile', 'tablet'];
    try {
        const platformType = globalThis.Bowser?.parse?.(navigator.userAgent)?.platform?.type;
        if (mobileTypes.includes(platformType)) {
            return true;
        }
    } catch {
        // Fall back to pointer/screen heuristics below.
    }
    return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 900px)').matches;
}

function getEbookMobileTopOffset() {
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue('--topBarBlockSize').trim();
    const parsedValue = Number.parseFloat(rawValue);
    return Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
}

function getEbookMobileViewportHeight() {
    return Math.max(240, window.innerHeight - getEbookMobileTopOffset());
}

function applyEbookOverlayViewport(overlay = document.getElementById(OVERLAY_ID)) {
    if (!overlay) return;
    if (!isEbookMobileDevice()) {
        overlay.style.top = '0';
        overlay.style.height = '100vh';
        overlay.classList.remove('is-mobile');
        return;
    }
    const topOffset = getEbookMobileTopOffset();
    const viewportHeight = getEbookMobileViewportHeight();
    overlay.style.top = `${topOffset}px`;
    overlay.style.height = `${viewportHeight}px`;
    overlay.classList.add('is-mobile');
}

function installOverlayResizeHandler(overlay) {
    if (overlayResizeHandler) return;
    overlayResizeHandler = () => applyEbookOverlayViewport(overlay);
    window.addEventListener('resize', overlayResizeHandler);
    window.visualViewport?.addEventListener('resize', overlayResizeHandler);
}

function removeOverlayResizeHandler() {
    if (!overlayResizeHandler) return;
    window.removeEventListener('resize', overlayResizeHandler);
    window.visualViewport?.removeEventListener('resize', overlayResizeHandler);
    overlayResizeHandler = null;
}

function postToFrame(type, payload = {}) {
    const iframe = getIframe();
    if (!iframe?.contentWindow) return false;
    const message = { type, payload };
    if (!frameReady) {
        pendingMessages.push(message);
        return false;
    }
    return postToIframe(iframe, message, SOURCE_HOST);
}

function flushPendingMessages() {
    if (!frameReady) return;
    const iframe = getIframe();
    if (!iframe?.contentWindow) return;
    pendingMessages.forEach((message) => postToIframe(iframe, message, SOURCE_HOST));
    pendingMessages = [];
}

function prepareInitialConfig() {
    const promise = buildEbookFrameConfig();
    initialConfigPromise = promise;
    void promise.catch(() => {
        if (initialConfigPromise === promise) {
            initialConfigPromise = null;
        }
    });
}

async function sendInitialConfigToFrame() {
    const promise = initialConfigPromise || buildEbookFrameConfig();
    initialConfigPromise = null;
    postToFrame('xb-ebook:config', await promise);
}

async function sendConfigToFrame() {
    postToFrame('xb-ebook:config', await buildEbookFrameConfig());
}

function revealEbookSettings() {
    if (!frameReady) return false;
    postToFrame('xb-ebook:open-settings', {});
    pendingOpenSettings = false;
    return true;
}

async function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: auto;
        width: 100vw;
        height: 100vh;
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-sizing: border-box;
        background: #fff9ed;
    `;

    const shell = document.createElement('div');
    shell.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 0;
        border-radius: 0;
        overflow: hidden;
        box-shadow: none;
        border: none;
        background: #fff9ed;
    `;

    const version = await loadEbookCacheKey();
    const iframe = document.createElement('iframe');
    iframe.id = IFRAME_ID;
    iframe.src = version ? `${HTML_PATH}?v=${encodeURIComponent(version)}` : HTML_PATH;
    iframe.style.cssText = `
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
    `;

    shell.appendChild(iframe);
    overlay.appendChild(shell);
    document.body.appendChild(overlay);
    applyEbookOverlayViewport(overlay);
    installOverlayResizeHandler(overlay);
    return overlay;
}

async function openEbook() {
    pendingOpenSettings = false;
    if (document.getElementById(OVERLAY_ID)) return;
    frameReady = false;
    pendingMessages = [];
    prepareInitialConfig();
    installMessageHandler();
    await createOverlay();
}

function openEbookSettings() {
    pendingOpenSettings = true;
    if (!document.getElementById(OVERLAY_ID)) {
        frameReady = false;
        pendingMessages = [];
        prepareInitialConfig();
        installMessageHandler();
        void createOverlay();
    }
    if (frameReady) {
        revealEbookSettings();
    }
}

function closeEbook() {
    pendingDrawRequests.forEach((controller) => controller.abort());
    pendingDrawRequests.clear();
    stopEbookTtsPlayback();
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    removeOverlayResizeHandler();
    frameReady = false;
    pendingMessages = [];
    initialConfigPromise = null;
    pendingOpenSettings = false;
}

function postTtsState(playbackId = '', state = '', info = {}) {
    if (!playbackId || !state) return;
    postToFrame('xb-ebook:tts-state', {
        playbackId,
        state,
        info: info || {},
        message: info?.message || '',
    });
}

function stopEbookTtsPlayback(playbackId = '') {
    const active = activeTtsPlayback;
    if (!active) return false;
    if (playbackId && active.playbackId !== playbackId) return false;
    try {
        active.stop?.();
    } catch {}
    postTtsState(active.playbackId, 'stopped');
    activeTtsPlayback = null;
    return true;
}

function replyHostResult(requestId = '', payload = {}) {
    postToFrame('xb-ebook:host-result', {
        requestId,
        ...payload,
    });
}

function handleHostRequestHeaders(payload = {}) {
    replyHostResult(String(payload.requestId || ''), {
        ok: true,
        hostRequestHeaders: getRequestHeaders?.() || {},
    });
}

async function handleImportMaterial(payload = {}) {
    const requestId = String(payload.requestId || '');
    try {
        const material = await buildImportMaterial(payload.kind);
        replyHostResult(requestId, {
            ok: true,
            ...material,
        });
    } catch (error) {
        replyHostResult(requestId, {
            ok: false,
            error: error?.message || String(error || 'import_failed'),
        });
    }
}

async function handleSaveConfig(payload = {}) {
    const requestId = String(payload.requestId || '');
    const result = await saveEbookAgentConfig(payload, { silent: false });
    if (result.ok) {
        window.xiaobaixAssistant?.refreshConfig?.();
        replyHostResult(requestId, {
            ok: true,
            config: result.config,
        });
        return;
    }
    replyHostResult(requestId, {
        ok: false,
        error: result.error || 'save_config_failed',
        config: result.config,
    });
}

function getDrawStatus() {
    const facade = window.xiaobaixDraw;
    const status = typeof facade?.getStatus === 'function'
        ? facade.getStatus()
        : {
            provider: typeof facade?.getProvider === 'function' ? facade.getProvider() : 'disabled',
            enabled: !!facade?.isEnabled?.(),
            ready: !!facade?.generateImagesFromText,
        };
    return {
        provider: status?.provider || 'disabled',
        enabled: !!status?.enabled,
        ready: !!status?.ready,
    };
}

async function handleDrawStatus(payload = {}) {
    const requestId = String(payload.requestId || '');
    replyHostResult(requestId, {
        ok: true,
        ...getDrawStatus(),
    });
}

function getTtsStatus() {
    const facade = window.xiaobaixTts;
    const enabled = typeof facade?.isEnabled === 'function'
        ? !!facade.isEnabled()
        : !!facade;
    return {
        enabled,
        ready: enabled && typeof facade?.synthesize === 'function',
        playing: !!activeTtsPlayback,
    };
}

async function handleTtsStatus(payload = {}) {
    const requestId = String(payload.requestId || '');
    replyHostResult(requestId, {
        ok: true,
        ...getTtsStatus(),
    });
}

async function handleTtsPlay(payload = {}) {
    const requestId = String(payload.requestId || '');
    const playbackId = String(payload.playbackId || requestId || '').trim();
    const text = String(payload.text || '').trim();
    try {
        if (!playbackId) throw new Error('playback_id_required');
        if (!text) throw new Error('tts_text_required');
        if (!getTtsStatus().ready) {
            throw new Error('TTS 语音模块未启用');
        }
        stopEbookTtsPlayback();
        activeTtsPlayback = {
            playbackId,
            stop: null,
        };
        const handle = synthesizeAndPlay(text, '', {
            requestId: playbackId,
            onState: (state, info = {}) => {
                if (activeTtsPlayback?.playbackId !== playbackId && !['ended', 'error', 'stopped'].includes(state)) {
                    return;
                }
                postTtsState(playbackId, state, info || {});
                if (['ended', 'error', 'stopped'].includes(state) && activeTtsPlayback?.playbackId === playbackId) {
                    activeTtsPlayback = null;
                }
            },
        });
        activeTtsPlayback.stop = handle?.stop;
        replyHostResult(requestId, {
            ok: true,
            playbackId,
            ...getTtsStatus(),
        });
    } catch (error) {
        replyHostResult(requestId, {
            ok: false,
            error: error?.message || String(error || 'tts_failed'),
            ...getTtsStatus(),
        });
    }
}

async function handleTtsStop(payload = {}) {
    const requestId = String(payload.requestId || '');
    const playbackId = String(payload.playbackId || '').trim();
    stopEbookTtsPlayback(playbackId);
    replyHostResult(requestId, {
        ok: true,
        ...getTtsStatus(),
    });
}

async function handleDrawGenerate(payload = {}) {
    const requestId = String(payload.requestId || '');
    const controller = new AbortController();
    if (requestId) pendingDrawRequests.set(requestId, controller);
    try {
        const facade = window.xiaobaixDraw;
        if (typeof facade?.generateImagesFromText !== 'function') {
            throw new Error('画图模块未初始化');
        }
        const result = await facade.generateImagesFromText({
            ...payload,
            signal: controller.signal,
            onStateChange: (state, data) => {
                postToFrame('xb-ebook:draw-progress', {
                    requestId,
                    state,
                    data: data || {},
                });
            },
        });
        replyHostResult(requestId, {
            ok: true,
            ...result,
        });
    } catch (error) {
        replyHostResult(requestId, {
            ok: false,
            error: error?.message || String(error || 'draw_failed'),
        });
    } finally {
        if (requestId) pendingDrawRequests.delete(requestId);
    }
}

function handleCancelRequest(payload = {}) {
    const requestId = String(payload.requestId || '');
    if (!requestId) return;
    pendingDrawRequests.get(requestId)?.abort();
}

function previewToTransferableUrl(preview = {}) {
    const savedUrl = String(preview?.savedUrl || '').trim();
    if (savedUrl) return savedUrl;
    const base64 = String(preview?.base64 || '').trim();
    if (!base64) return '';
    if (/^data:[^;]+;base64,/i.test(base64)) return base64;
    return `data:image/png;base64,${base64}`;
}

async function handleDrawImage(payload = {}) {
    const requestId = String(payload.requestId || '');
    const slotId = String(payload.slotId || '').trim();
    try {
        if (!slotId) throw new Error('slot_id_required');
        const result = await getDisplayPreviewForSlot(slotId);
        const preview = result.preview || {};
        replyHostResult(requestId, {
            ok: true,
            slotId,
            hasData: !!result.hasData,
            isFailed: !!result.isFailed,
            historyCount: result.historyCount || 0,
            url: result.hasData ? previewToTransferableUrl(preview) : '',
            tags: preview.tags || result.failedInfo?.tags || '',
            positive: preview.positive || result.failedInfo?.positive || '',
            errorType: result.failedInfo?.errorType || '',
            errorMessage: result.failedInfo?.errorMessage || '',
        });
    } catch (error) {
        replyHostResult(requestId, {
            ok: false,
            error: error?.message || String(error || 'image_lookup_failed'),
        });
    }
}

async function handleExportImages(payload = {}) {
    const requestId = String(payload.requestId || '');
    try {
        const images = await exportPortablePreviewsForSlots(payload.slotIds || []);
        replyHostResult(requestId, {
            ok: true,
            images,
        });
    } catch (error) {
        replyHostResult(requestId, {
            ok: false,
            error: error?.message || String(error || 'image_export_failed'),
        });
    }
}

async function handleImportImages(payload = {}) {
    const requestId = String(payload.requestId || '');
    try {
        const result = await importPortablePreviews(payload.images?.previews || [], payload.images?.selections || [], {
            bookId: payload.bookId,
            bookTitle: payload.bookTitle,
        });
        replyHostResult(requestId, {
            ok: true,
            ...result,
        });
    } catch (error) {
        replyHostResult(requestId, {
            ok: false,
            error: error?.message || String(error || 'image_import_failed'),
        });
    }
}

function handleFrameMessage(event) {
    const iframe = getIframe();
    if (!isTrustedMessage(event, iframe, SOURCE_APP)) return;
    const data = event.data || {};
    const payload = data.payload || {};
    switch (data.type) {
        case 'xb-ebook:frame-ready':
            frameReady = true;
            void sendInitialConfigToFrame().catch((error) => {
                console.warn('[LittleWhiteBox][Ebook] failed to send initial config', error);
            }).finally(() => {
                flushPendingMessages();
                if (pendingOpenSettings) {
                    revealEbookSettings();
                }
            });
            break;
        case 'xb-ebook:close':
            closeEbook();
            break;
        case 'xb-ebook:import-material':
            void handleImportMaterial(payload);
            break;
        case 'xb-ebook:save-config':
            void handleSaveConfig(payload);
            break;
        case 'xb-ebook:get-host-request-headers':
            handleHostRequestHeaders(payload);
            break;
        case 'xb-ebook:draw-status':
            void handleDrawStatus(payload);
            break;
        case 'xb-ebook:tts-status':
            void handleTtsStatus(payload);
            break;
        case 'xb-ebook:tts-play':
            void handleTtsPlay(payload);
            break;
        case 'xb-ebook:tts-stop':
            void handleTtsStop(payload);
            break;
        case 'xb-ebook:draw-generate':
            void handleDrawGenerate(payload);
            break;
        case 'xb-ebook:cancel-request':
            handleCancelRequest(payload);
            break;
        case 'xb-ebook:draw-image':
            void handleDrawImage(payload);
            break;
        case 'xb-ebook:export-images':
            void handleExportImages(payload);
            break;
        case 'xb-ebook:import-images':
            void handleImportImages(payload);
            break;
        default:
            break;
    }
}

function installMessageHandler() {
    if (messageHandlerInstalled) return;
    // Guarded by isTrustedMessage in handleFrameMessage.
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleFrameMessage);
    messageHandlerInstalled = true;
}

export async function initEbook() {
    installMessageHandler();
    window.xiaobaixEbook = {
        open: openEbook,
        openSettings: openEbookSettings,
        refreshConfig: () => void sendConfigToFrame(),
        close: closeEbook,
    };
}

export function cleanupEbook() {
    closeEbook();
}

export { openEbook, closeEbook };
