import { getRequestHeaders } from '../../../../../../script.js';
import { extension_settings } from '../../../../../extensions.js';
import { extensionFolderPath } from '../../core/constants.js';
import { createFirstPartyIframeOverlay, loadFirstPartyIframeCacheKey } from '../../core/first-party-iframe-app.js';
import { isTrustedMessage, postToIframe } from '../../core/iframe-messaging.js';
import { replaceXbGetVarInString } from '../variables/var-commands.js';
import { buildTavernFrameConfig, saveTavernAgentConfig } from './host/agent-config.js';
import {
    getTavernChatPresetBundle,
    listTavernChatPresetBundles,
    saveTavernChatPresetBundle,
    selectTavernChatPresetBundle,
} from './host/chat-presets.js';
import {
    applyTavernRegex,
    deleteTavernRegexScript,
    listTavernRegexScripts,
    saveTavernRegexScript,
} from './host/regex.js';
import { applyTavernSubstituteParams } from './host/substitute-params.js';
import { runTavernSlashCommand } from './host/slash-commands.js';
import { buildTavernContext } from './host/sillytavern-context.js';
import { saveTavernDisplaySettings } from './host/display-settings.js';
import { buildTavernNativeChatPrompt, cancelTavernNativeChatPrompt } from './host/native-prompt.js';
import { listTavernUsers, switchTavernUser } from './host/users.js';
import {
    activateTavernCharacterWorldbook,
    bindTavernCharacterWorldbook,
    getTavernCharacterWorldbookState,
    getTavernGlobalWorldbooks,
    getTavernWorldbookEntry,
    getTavernWorldbookPreview,
    getTavernWorldbookRuntime,
    listTavernWorldbookSources,
    saveTavernWorldbookEntry,
    setTavernGlobalWorldbooks,
} from './host/worldbooks.js';

interface PendingFrameMessage {
    type: string;
    payload: Record<string, unknown>;
}

interface TavernStartupProgressPayload {
    percent: number;
    action: string;
}

interface TavernFacade {
    open: () => Promise<void>;
    close: () => void;
    refreshContext: (options?: Record<string, unknown>) => Promise<void>;
    refreshDrawStatus: () => void;
    refreshRenderSettings: () => void;
}

interface DrawProviderSettingsFacade {
    openSettings?: () => void | Promise<void>;
    getQuickSettings?: () => Record<string, unknown> | Promise<Record<string, unknown>>;
    updateQuickSettings?: (patch: Record<string, unknown>) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

declare global {
    interface Window {
        xiaobaixTavern?: TavernFacade;
        xiaobaixDraw?: {
            getStatus?: () => Record<string, unknown>;
            getProvider?: () => string;
            isEnabled?: () => boolean;
            buildPromptData?: (input: Record<string, unknown>) => Record<string, unknown>;
            generateImage?: (input: Record<string, unknown>) => Promise<string | Record<string, unknown>>;
            generateImagesFromText?: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
        };
        xiaobaixNovelDraw?: DrawProviderSettingsFacade;
        xiaobaixSdDraw?: DrawProviderSettingsFacade;
        xiaobaixComfyDraw?: DrawProviderSettingsFacade;
    }
}

const SOURCE_HOST = 'xb-tavern-host';
const SOURCE_APP = 'xb-tavern-app';
const LITTLE_WHITE_BOX_EXT_ID = 'LittleWhiteBox';
const OVERLAY_ID = 'xiaobaix-tavern-overlay';
const IFRAME_ID = 'xiaobaix-tavern-iframe';
const HTML_PATH = `${extensionFolderPath}/modules/tavern/tavern.html`;
const BUILD_INFO_PATH = `${extensionFolderPath}/modules/tavern/dist/tavern-build.json`;
const TAVERN_DRAW_DELETED_ERROR_TYPE = 'deleted';
const TAVERN_DRAW_DELETED_ERROR_MESSAGE = '图片已删除，点击重试可重新生成';

let tavernCacheKey = '';
let frameReady = false;
let frameBootReady = false;
let pendingMessages: PendingFrameMessage[] = [];
let initialConfigPromise: Promise<Record<string, unknown>> | null = null;
let messageHandlerInstalled = false;
let overlayResizeHandler: EventListener | null = null;
let overlayResizeFrame = 0;
let overlayKeyboardSettleHandler: EventListener | null = null;
let overlayKeyboardSettleTimers: number[] = [];
let cachedTavernMobileTopOffset: number | null = null;
const pendingDrawRequests = new Map<string, AbortController>();
let latestStartupProgress: TavernStartupProgressPayload = { percent: 5, action: 'createOverlay' };

async function getDrawGalleryCacheModule(): Promise<{
    clearSlotSelection: (slotId: string) => Promise<void>;
    getDisplayPreviewForSlot: (slotId: string) => Promise<Record<string, unknown>>;
    getPreview: (imgId: string) => Promise<Record<string, unknown> | undefined>;
    getPreviewsBySlot: (slotId: string) => Promise<Array<Record<string, unknown>>>;
    setSlotSelection: (slotId: string, imgId: string) => Promise<void>;
    deleteFailedRecordsForSlot: (slotId: string) => Promise<void>;
    storeFailedPlaceholder: (preview: Record<string, unknown>) => Promise<void>;
    storePreview: (preview: Record<string, unknown>) => Promise<void>;
    deletePreview: (imgId: string) => Promise<void>;
    savePreviewImage: (imgId: string, filePrefix?: string) => Promise<string>;
}> {
    return await import('../draw/shared/gallery-cache.js') as unknown as {
        clearSlotSelection: (slotId: string) => Promise<void>;
        getDisplayPreviewForSlot: (slotId: string) => Promise<Record<string, unknown>>;
        getPreview: (imgId: string) => Promise<Record<string, unknown> | undefined>;
        getPreviewsBySlot: (slotId: string) => Promise<Array<Record<string, unknown>>>;
        setSlotSelection: (slotId: string, imgId: string) => Promise<void>;
        deleteFailedRecordsForSlot: (slotId: string) => Promise<void>;
        storeFailedPlaceholder: (preview: Record<string, unknown>) => Promise<void>;
        storePreview: (preview: Record<string, unknown>) => Promise<void>;
        deletePreview: (imgId: string) => Promise<void>;
        savePreviewImage: (imgId: string, filePrefix?: string) => Promise<string>;
    };
}

async function getDrawCommonModule(): Promise<{
    clearDrawSavedEntry: (messageId: number, slotId: string) => Promise<boolean>;
    syncDrawSavedAfterDeletion: (
        messageId: number,
        slotId: string,
        deletedImgId: string,
        remainingPreviews?: Array<Record<string, unknown>>,
    ) => Promise<boolean>;
    syncDrawSavedFromPreview: (
        messageId: number,
        preview: Record<string, unknown>,
        overrides?: Record<string, unknown>,
    ) => Promise<boolean>;
}> {
    return await import('../draw/shared/draw-common.js') as unknown as {
        clearDrawSavedEntry: (messageId: number, slotId: string) => Promise<boolean>;
        syncDrawSavedAfterDeletion: (
            messageId: number,
            slotId: string,
            deletedImgId: string,
            remainingPreviews?: Array<Record<string, unknown>>,
        ) => Promise<boolean>;
        syncDrawSavedFromPreview: (
            messageId: number,
            preview: Record<string, unknown>,
            overrides?: Record<string, unknown>,
        ) => Promise<boolean>;
    };
}

async function getFourthWallImageModule(): Promise<{
    generateImage: (tags: string, onProgress?: (status: string, position?: number, delay?: number) => void) => Promise<string>;
}> {
    return await import('../fourth-wall/fw-image.js') as unknown as {
        generateImage: (tags: string, onProgress?: (status: string, position?: number, delay?: number) => void) => Promise<string>;
    };
}

function cloneFramePayload<T>(value: T): T {
    const seen = new WeakSet<object>();
    try {
        return JSON.parse(JSON.stringify(value, (_key, item) => {
            if (typeof item === 'bigint') {return String(item);}
            if (typeof item === 'function' || typeof item === 'symbol') {return undefined;}
            if (!item || typeof item !== 'object') {return item;}
            if (seen.has(item)) {return undefined;}
            seen.add(item);
            return item;
        })) as T;
    } catch {
        return {} as T;
    }
}

async function loadTavernCacheKey(): Promise<string> {
    if (tavernCacheKey) {return tavernCacheKey;}
    tavernCacheKey = await loadFirstPartyIframeCacheKey(BUILD_INFO_PATH);
    return tavernCacheKey;
}

function getIframe(): HTMLIFrameElement | null {
    const iframe = document.getElementById(IFRAME_ID);
    return iframe instanceof HTMLIFrameElement ? iframe : null;
}

function isTavernMobileDevice(): boolean {
    const mobileTypes = ['mobile', 'tablet'];
    try {
        const bowser = globalThis as typeof globalThis & {
            Bowser?: { parse?: (userAgent: string) => { platform?: { type?: string } } };
        };
        const platformType = bowser.Bowser?.parse?.(navigator.userAgent)?.platform?.type;
        if (mobileTypes.includes(platformType)) {
            return true;
        }
    } catch {
        // Fall back to pointer/screen heuristics below.
    }
    return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 900px)').matches;
}

function getTavernMobileTopOffset(forceRefresh = false): number {
    if (!forceRefresh && cachedTavernMobileTopOffset !== null) {
        return cachedTavernMobileTopOffset;
    }
    const rawValue = getComputedStyle(document.documentElement).getPropertyValue('--topBarBlockSize').trim();
    const parsedValue = Number.parseFloat(rawValue);
    cachedTavernMobileTopOffset = Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
    return cachedTavernMobileTopOffset;
}

function getTavernMobileViewportHeight(topOffset = getTavernMobileTopOffset()): number {
    const layoutHeight = Math.max(
        0,
        Number(window.innerHeight) || document.documentElement.clientHeight || 0,
    );
    const visualHeight = Number(window.visualViewport?.height);
    const hasVisualHeight = Number.isFinite(visualHeight) && visualHeight > 0;
    const keyboardLooksOpen = hasVisualHeight && visualHeight + 80 < layoutHeight;
    const viewportHeight = hasVisualHeight
        ? keyboardLooksOpen
            ? visualHeight
            : Math.max(layoutHeight, visualHeight)
        : layoutHeight;
    return Math.max(240, Math.round(viewportHeight - topOffset));
}

function applyTavernOverlayViewport(overlay = document.getElementById(OVERLAY_ID)): void {
    if (!(overlay instanceof HTMLElement)) {return;}
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.width = '100vw';
    if (!isTavernMobileDevice()) {
        overlay.style.top = '0';
        overlay.style.height = '100vh';
        overlay.style.padding = '0';
        overlay.classList.remove('is-mobile');
        return;
    }
    const topOffset = getTavernMobileTopOffset();
    const viewportHeight = getTavernMobileViewportHeight(topOffset);
    overlay.style.top = `${topOffset}px`;
    overlay.style.height = `${viewportHeight}px`;
    overlay.style.padding = 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)';
    overlay.classList.add('is-mobile');
}

function scheduleTavernOverlayViewport(overlay: HTMLElement, forceTopOffsetRefresh = false): void {
    if (forceTopOffsetRefresh) {
        cachedTavernMobileTopOffset = null;
    }
    if (overlayResizeFrame) {return;}
    overlayResizeFrame = window.requestAnimationFrame(() => {
        overlayResizeFrame = 0;
        applyTavernOverlayViewport(overlay);
    });
}

function clearOverlayKeyboardSettleTimers(): void {
    overlayKeyboardSettleTimers.forEach((timer) => window.clearTimeout(timer));
    overlayKeyboardSettleTimers = [];
}

function scheduleTavernOverlayViewportSettle(overlay: HTMLElement, forceTopOffsetRefresh = false): void {
    clearOverlayKeyboardSettleTimers();
    scheduleTavernOverlayViewport(overlay, forceTopOffsetRefresh);
    [40, 120, 260, 520, 900, 1400].forEach((delay) => {
        overlayKeyboardSettleTimers.push(window.setTimeout(() => {
            scheduleTavernOverlayViewport(overlay, true);
        }, delay));
    });
}

function installOverlayResizeHandler(overlay: HTMLElement): void {
    if (overlayResizeHandler) {return;}
    overlayResizeHandler = () => scheduleTavernOverlayViewport(overlay, true);
    overlayKeyboardSettleHandler = () => scheduleTavernOverlayViewportSettle(overlay, true);
    window.addEventListener('resize', overlayResizeHandler);
    window.addEventListener('orientationchange', overlayResizeHandler);
    window.visualViewport?.addEventListener('resize', overlayResizeHandler);
    window.visualViewport?.addEventListener('scroll', overlayResizeHandler);
    window.addEventListener('focusin', overlayKeyboardSettleHandler, true);
    window.addEventListener('focusout', overlayKeyboardSettleHandler, true);
}

function removeOverlayResizeHandler(): void {
    if (!overlayResizeHandler) {return;}
    window.removeEventListener('resize', overlayResizeHandler);
    window.removeEventListener('orientationchange', overlayResizeHandler);
    window.visualViewport?.removeEventListener('resize', overlayResizeHandler);
    window.visualViewport?.removeEventListener('scroll', overlayResizeHandler);
    if (overlayKeyboardSettleHandler) {
        window.removeEventListener('focusin', overlayKeyboardSettleHandler, true);
        window.removeEventListener('focusout', overlayKeyboardSettleHandler, true);
    }
    overlayResizeHandler = null;
    overlayKeyboardSettleHandler = null;
    clearOverlayKeyboardSettleTimers();
    if (overlayResizeFrame) {
        window.cancelAnimationFrame(overlayResizeFrame);
        overlayResizeFrame = 0;
    }
}

function postToFrame(type: string, payload: Record<string, unknown> = {}): boolean {
    const iframe = getIframe();
    if (!iframe?.contentWindow) {return false;}
    const message = cloneFramePayload({ type, payload });
    if (!frameReady) {
        pendingMessages.push(message);
        return false;
    }
    return postToIframe(iframe, message, SOURCE_HOST);
}

function normalizeStartupProgress(payload: Partial<TavernStartupProgressPayload> = {}): TavernStartupProgressPayload {
    const percent = Number(payload.percent);
    const nextPercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, Math.round(percent))) : latestStartupProgress.percent;
    return {
        percent: Math.max(latestStartupProgress.percent, nextPercent),
        action: String(payload.action || latestStartupProgress.action || 'startup'),
    };
}

function postStartupProgress(payload: Partial<TavernStartupProgressPayload> = {}): boolean {
    latestStartupProgress = normalizeStartupProgress(payload);
    const iframe = getIframe();
    if (!iframe?.contentWindow || !frameBootReady) {return false;}
    return postToIframe(iframe, {
        type: 'xb-tavern:startup-progress',
        payload: latestStartupProgress as unknown as Record<string, unknown>,
    }, SOURCE_HOST);
}

function flushPendingMessages(): void {
    if (!frameReady) {return;}
    const iframe = getIframe();
    if (!iframe?.contentWindow) {return;}
    pendingMessages.forEach((message) => postToIframe(iframe, message, SOURCE_HOST));
    pendingMessages = [];
}

async function buildFrameConfigPayload(options: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const contextPayload = await buildTavernContext({
        ...options,
        onStartupProgress: postStartupProgress,
    });
    postStartupProgress({ percent: 60, action: 'buildTavernFrameConfig' });
    return await buildTavernFrameConfig(contextPayload as unknown as Record<string, unknown>, {
        onStartupProgress: postStartupProgress,
    });
}

function prepareInitialConfig(): void {
    const promise = buildFrameConfigPayload();
    initialConfigPromise = promise;
    void promise.catch(() => {
        if (initialConfigPromise === promise) {
            initialConfigPromise = null;
        }
    });
}

async function sendInitialConfigToFrame(): Promise<void> {
    const promise = initialConfigPromise || buildFrameConfigPayload();
    initialConfigPromise = null;
    const configPayload = await promise;
    postStartupProgress({ percent: 84, action: 'sendInitialConfigToFrame' });
    postToFrame('xb-tavern:config', configPayload);
}

async function sendConfigToFrame(options: Record<string, unknown> = {}): Promise<void> {
    postToFrame('xb-tavern:config', await buildFrameConfigPayload(options));
}

async function refreshContext(options: Record<string, unknown> = {}): Promise<void> {
    postToFrame('xb-tavern:context', await buildTavernContext(options) as unknown as Record<string, unknown>);
}

function isHtmlRenderEnabled(): boolean {
    return (extension_settings?.[LITTLE_WHITE_BOX_EXT_ID] as Record<string, unknown> | undefined)?.renderEnabled !== false;
}

function replaceTavernHtmlRenderVariables(payload: Record<string, unknown> = {}): Record<string, unknown> {
    const html = String(payload.html || '');
    const settings = (extension_settings?.[LITTLE_WHITE_BOX_EXT_ID] as Record<string, unknown> | undefined) || {};
    const variablesCore = settings.variablesCore && typeof settings.variablesCore === 'object'
        ? settings.variablesCore as Record<string, unknown>
        : {};
    if (variablesCore.enabled !== true || typeof replaceXbGetVarInString !== 'function') {
        return { html, changed: false, enabled: variablesCore.enabled === true };
    }
    try {
        const nextHtml = replaceXbGetVarInString(html);
        return {
            html: nextHtml,
            changed: nextHtml !== html,
            enabled: true,
        };
    } catch (error) {
        console.warn('[LittleWhiteBox Tavern] xbgetvar macro replacement failed:', error);
        return { html, changed: false, enabled: true };
    }
}

function refreshRenderSettings(): void {
    postToFrame('xb-tavern:context', {
        htmlRenderEnabled: isHtmlRenderEnabled(),
    });
}

async function saveConfigFromFrame(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const configPatch = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : {};
    const result = await saveTavernAgentConfig(configPatch, { silent: false });
    postToFrame('xb-tavern:config-saved', {
        requestId,
        ok: result.ok,
        config: result.config,
        error: result.error || '',
    });
    if (result.ok) {
        await sendConfigToFrame();
    }
}

function replyHostResult(requestId = '', payload: Record<string, unknown> = {}): void {
    postToFrame('xb-tavern:host-result', {
        requestId,
        ...payload,
    });
}

function hostErrorPayload(error: unknown, fallback = 'host_request_failed'): Record<string, unknown> {
    if (error instanceof Error) {
        return {
            ok: false,
            error: error.message || fallback,
            errorName: error.name || 'Error',
            errorStack: error.stack || '',
        };
    }
    return {
        ok: false,
        error: String(error || fallback),
        errorName: '',
        errorStack: '',
    };
}

function handleHostRequestHeaders(payload: Record<string, unknown> = {}): void {
    replyHostResult(String(payload.requestId || ''), {
        ok: true,
        hostRequestHeaders: getRequestHeaders?.() || {},
    });
}

function getDrawStatus(): Record<string, unknown> {
    const facade = window.xiaobaixDraw;
    const status = typeof facade?.getStatus === 'function'
        ? facade.getStatus()
        : {
            provider: typeof facade?.getProvider === 'function' ? facade.getProvider() : 'disabled',
            enabled: !!facade?.isEnabled?.(),
            ready: !!facade?.generateImagesFromText,
        };
    return {
        provider: String(status?.provider || 'disabled'),
        enabled: !!status?.enabled,
        ready: !!status?.ready,
    };
}

function handleDrawStatus(payload: Record<string, unknown> = {}): void {
    replyHostResult(String(payload.requestId || ''), {
        ok: true,
        ...getDrawStatus(),
    });
}

function refreshDrawStatus(): void {
    postToFrame('xb-tavern:draw-status-changed', getDrawStatus());
}

function getDrawProviderSettingsFacade(provider = ''): DrawProviderSettingsFacade | undefined {
    const key = String(provider || '').trim().toLowerCase();
    if (key === 'novelai' || key === 'novel') {
        return window.xiaobaixNovelDraw;
    }
    if (key === 'sdwebui' || key === 'sd-webui' || key === 'sd' || key === 'stable-diffusion') {
        return window.xiaobaixSdDraw;
    }
    if (key === 'comfyui' || key === 'comfy') {
        return window.xiaobaixComfyDraw;
    }
    return undefined;
}

async function handleDrawOpenSettings(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        const status = getDrawStatus();
        const provider = String(status.provider || 'disabled');
        const settingsFacade = getDrawProviderSettingsFacade(provider);
        if (typeof settingsFacade?.openSettings !== 'function') {
            throw new Error('画图设置不可用');
        }
        await settingsFacade.openSettings();
        replyHostResult(requestId, {
            ok: true,
            provider,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'draw_settings_failed'));
    }
}

async function handleDrawQuickSettings(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        const status = getDrawStatus();
        const provider = String(status.provider || 'disabled');
        const settingsFacade = getDrawProviderSettingsFacade(provider);
        const quickSettings = typeof settingsFacade?.getQuickSettings === 'function'
            ? await settingsFacade.getQuickSettings()
            : {
                provider,
                available: false,
                presets: [],
                sizeOptions: [],
            };
        replyHostResult(requestId, {
            ok: true,
            result: {
                provider,
                ...(quickSettings || {}),
            },
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'draw_quick_settings_failed'));
    }
}

async function handleDrawUpdateQuickSettings(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const patch = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : {};
    try {
        const status = getDrawStatus();
        const provider = String(status.provider || 'disabled');
        const settingsFacade = getDrawProviderSettingsFacade(provider);
        if (typeof settingsFacade?.updateQuickSettings !== 'function') {
            throw new Error('画图快捷设置不可用');
        }
        const quickSettings = await settingsFacade.updateQuickSettings(patch);
        replyHostResult(requestId, {
            ok: true,
            result: {
                provider,
                ...(quickSettings || {}),
            },
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'draw_quick_settings_save_failed'));
    }
}

async function handleDrawGenerate(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const controller = new AbortController();
    if (requestId) {
        pendingDrawRequests.set(requestId, controller);
    }
    try {
        const facade = window.xiaobaixDraw;
        if (typeof facade?.generateImagesFromText !== 'function') {
            throw new Error('画图模块未初始化');
        }
        const drawPayload = payload.payload && typeof payload.payload === 'object'
            ? payload.payload as Record<string, unknown>
            : {};
        const result = await facade.generateImagesFromText({
            ...drawPayload,
            signal: controller.signal,
            onStateChange: (state: string, data: Record<string, unknown> = {}) => {
                postToFrame('xb-tavern:draw-progress', {
                    requestId,
                    state,
                    data,
                });
            },
        });
        replyHostResult(requestId, {
            ok: true,
            result,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'draw_failed'));
    } finally {
        if (requestId) {
            pendingDrawRequests.delete(requestId);
        }
    }
}

async function handleInlineImageGenerate(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const tags = String(source.tags || '').trim();
    try {
        if (!tags) {throw new Error('无效的图片标签');}
        const status = getDrawStatus();
        if (!status.enabled || !status.ready) {
            throw new Error('请开启小白X画图模块');
        }
        const { generateImage } = await getFourthWallImageModule();
        const base64 = await generateImage(tags, (state, position, delay) => {
            postToFrame('xb-tavern:inline-image-progress', {
                requestId,
                tags,
                status: state,
                position,
                delay: delay ? Math.round(delay / 1000) : undefined,
            });
        });
        replyHostResult(requestId, {
            ok: true,
            result: { base64 },
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'inline_image_failed'));
    }
}

function previewToTransferableUrl(preview: Record<string, unknown> = {}): string {
    const savedUrl = String(preview.savedUrl || '').trim();
    if (savedUrl) {return savedUrl;}
    const base64 = String(preview.base64 || '').trim();
    if (!base64) {return '';}
    if (/^data:[^;]+;base64,/i.test(base64)) {return base64;}
    return `data:image/png;base64,${base64}`;
}

function toSuccessDrawPreviews(previews: Array<Record<string, unknown>> = []): Array<Record<string, unknown>> {
    return previews.filter((preview) => preview.status !== 'failed' && (preview.base64 || preview.savedUrl));
}

function generateDrawImageId(): string {
    return `tavern-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function getDrawPreviewCharacterPrompts(preview: Record<string, unknown> = {}): Array<Record<string, unknown>> {
    return Array.isArray(preview.characterPrompts)
        ? preview.characterPrompts.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
        : [];
}

function getDrawPreviewMessageId(preview: Record<string, unknown> = {}): number {
    if (String(preview.source || '').trim() === 'tavern') {
        return -1;
    }
    const value = preview.messageId;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
        return value;
    }
    if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
        return Number(value.trim());
    }
    return -1;
}

function getDrawPreviewStorageMessageId(preview: Record<string, unknown> = {}, slotId = ''): unknown {
    if ('messageId' in preview && preview.messageId !== undefined && preview.messageId !== null && String(preview.messageId).trim()) {
        return preview.messageId;
    }
    return `tavern:${String(slotId || '').trim() || 'image'}`;
}

function getDrawPromptNegativeInput(
    facade: NonNullable<Window['xiaobaixDraw']>,
    preview: Record<string, unknown> = {},
): string {
    return facade.getProvider?.() === 'novelai' ? String(preview.negativePrompt || '') : '';
}

function buildDeletedDrawPlaceholder(
    slotId: string,
    preview: Record<string, unknown> = {},
    fallback: Record<string, unknown> = {},
): Record<string, unknown> {
    const source = preview && typeof preview === 'object' && Object.keys(preview).length
        ? preview
        : fallback;
    return {
        slotId,
        messageId: getDrawPreviewStorageMessageId(source, slotId),
        source: String(source.source || 'tavern'),
        chatId: String(source.chatId || ''),
        characterName: String(source.characterName || ''),
        bookId: String(source.bookId || ''),
        bookTitle: String(source.bookTitle || ''),
        chapterPath: String(source.chapterPath || ''),
        chapterTitle: String(source.chapterTitle || ''),
        tags: String(source.tags || ''),
        positive: String(source.positive || ''),
        errorType: TAVERN_DRAW_DELETED_ERROR_TYPE,
        errorMessage: TAVERN_DRAW_DELETED_ERROR_MESSAGE,
        characterPrompts: cloneFramePayload(getDrawPreviewCharacterPrompts(source)),
        negativePrompt: String(source.negativePrompt || ''),
        anchor: String(source.anchor || ''),
    };
}

function buildRefreshFailedDrawPlaceholder(
    slotId: string,
    preview: Record<string, unknown> = {},
    failedInfo: Record<string, unknown> = {},
    error: unknown,
): Record<string, unknown> {
    // Prefer the freshly-fetched preview (a failed slot's display preview is the latest failed
    // record, which carries the attempted tags); fall back to failedInfo for early failures.
    const source = preview && typeof preview === 'object' && Object.keys(preview).length
        ? preview
        : failedInfo;
    const errorMessage = error instanceof Error && error.message
        ? error.message
        : String((error as string | undefined) || '生成失败');
    return {
        slotId,
        messageId: getDrawPreviewStorageMessageId(source, slotId),
        source: String(source.source || 'tavern'),
        chatId: String(source.chatId || ''),
        characterName: String(source.characterName || ''),
        bookId: String(source.bookId || ''),
        bookTitle: String(source.bookTitle || ''),
        chapterPath: String(source.chapterPath || ''),
        chapterTitle: String(source.chapterTitle || ''),
        tags: String(source.tags || ''),
        positive: String(source.positive || source.tags || ''),
        errorType: '生成失败',
        errorMessage,
        characterPrompts: cloneFramePayload(getDrawPreviewCharacterPrompts(source)),
        negativePrompt: String(source.negativePrompt || ''),
        anchor: String(source.anchor || ''),
    };
}

function transferDrawPreview(preview: Record<string, unknown> = {}, index = 0, total = 1): Record<string, unknown> {
    return {
        imgId: String(preview.imgId || ''),
        url: previewToTransferableUrl(preview),
        tags: String(preview.tags || ''),
        positive: String(preview.positive || ''),
        negativePrompt: String(preview.negativePrompt || ''),
        characterPrompts: cloneFramePayload(getDrawPreviewCharacterPrompts(preview)),
        saved: !!preview.savedUrl,
        timestamp: Number(preview.timestamp) || 0,
        currentIndex: index,
        displayVersion: total - index,
    };
}

function extractGeneratedImageBase64(result: string | Record<string, unknown>): string {
    if (typeof result === 'string') {return result;}
    const source = result?.base64 || result?.image || result?.data || result?.url || '';
    return String(source || '').trim();
}

async function buildDrawImageResult(slotId: string): Promise<Record<string, unknown>> {
    const { getDisplayPreviewForSlot, getPreviewsBySlot } = await getDrawGalleryCacheModule();
    const result = await getDisplayPreviewForSlot(slotId);
    const preview = result.preview as Record<string, unknown> || {};
    const failedInfo = result.failedInfo as Record<string, unknown> || {};
    const successPreviews = toSuccessDrawPreviews(await getPreviewsBySlot(slotId));
    const imgId = String(preview.imgId || '').trim();
    const currentIndex = imgId ? successPreviews.findIndex((item) => String(item.imgId || '') === imgId) : -1;
    return {
        slotId,
        imgId,
        hasData: !!result.hasData,
        isFailed: !!result.isFailed,
        historyCount: Number(result.historyCount) || successPreviews.length || 0,
        currentIndex: currentIndex >= 0 ? currentIndex : 0,
        url: result.hasData ? previewToTransferableUrl(preview) : '',
        tags: preview.tags || failedInfo.tags || '',
        positive: preview.positive || failedInfo.positive || '',
        negativePrompt: preview.negativePrompt || failedInfo.negativePrompt || '',
        characterPrompts: cloneFramePayload(getDrawPreviewCharacterPrompts(preview).length
            ? getDrawPreviewCharacterPrompts(preview)
            : getDrawPreviewCharacterPrompts(failedInfo)),
        saved: !!preview.savedUrl,
        messageId: getDrawPreviewStorageMessageId(preview, slotId),
        errorType: failedInfo.errorType || '',
        errorMessage: failedInfo.errorMessage || '',
    };
}

async function buildDrawImageGalleryResult(slotId: string): Promise<Record<string, unknown>> {
    const previews = toSuccessDrawPreviews(await (await getDrawGalleryCacheModule()).getPreviewsBySlot(slotId));
    const current = await buildDrawImageResult(slotId);
    const currentImgId = String(current.imgId || '');
    const currentIndex = Math.max(0, previews.findIndex((preview) => String(preview.imgId || '') === currentImgId));
    return {
        slotId,
        currentIndex,
        previews: previews.map((preview, index) => transferDrawPreview(preview, index, previews.length)),
    };
}

async function handleDrawImage(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        replyHostResult(requestId, {
            ok: true,
            result: await buildDrawImageResult(slotId),
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'image_lookup_failed'));
    }
}

async function handleDrawImageSelect(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        const { getPreviewsBySlot, setSlotSelection } = await getDrawGalleryCacheModule();
        const successPreviews = toSuccessDrawPreviews(await getPreviewsBySlot(slotId));
        if (!successPreviews.length) {throw new Error('image_history_empty');}
        const nextIndex = Math.max(0, Math.min(successPreviews.length - 1, Math.floor(Number(source.index) || 0)));
        const selected = successPreviews[nextIndex];
        const imgId = String(selected?.imgId || '').trim();
        if (!imgId) {throw new Error('image_preview_missing');}
        await setSlotSelection(slotId, imgId);
        replyHostResult(requestId, {
            ok: true,
            result: await buildDrawImageResult(slotId),
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'image_select_failed'));
    }
}

async function handleDrawImageGallery(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        replyHostResult(requestId, { ok: true, result: await buildDrawImageGalleryResult(slotId) });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'image_gallery_failed'));
    }
}

async function handleDrawImageSave(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        const current = await buildDrawImageResult(slotId);
        const imgId = String(source.imgId || current.imgId || '').trim();
        if (!imgId) {throw new Error('image_preview_missing');}
        const { getPreview, savePreviewImage } = await getDrawGalleryCacheModule();
        const url = await savePreviewImage(imgId, 'tavern');
        const preview = await getPreview(imgId);
        const messageId = getDrawPreviewMessageId(preview || current);
        if (preview && messageId >= 0) {
            const { syncDrawSavedFromPreview } = await getDrawCommonModule();
            await syncDrawSavedFromPreview(messageId, preview, { slotId, savedUrl: url }).catch(() => false);
        }
        replyHostResult(requestId, { ok: true, result: await buildDrawImageResult(slotId) });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'image_save_failed'));
    }
}

async function handleDrawImageDelete(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        const current = await buildDrawImageResult(slotId);
        const imgId = String(source.imgId || current.imgId || '').trim();
        if (!imgId) {throw new Error('image_preview_missing');}
        const {
            clearSlotSelection,
            deletePreview,
            getPreview,
            getPreviewsBySlot,
            setSlotSelection,
            storeFailedPlaceholder,
        } = await getDrawGalleryCacheModule();
        const deletedPreview = await getPreview(imgId);
        await deletePreview(imgId);
        const remaining = toSuccessDrawPreviews(await getPreviewsBySlot(slotId));
        const deletedCurrentImage = imgId === String(current.imgId || '').trim();
        const nextImgId = deletedCurrentImage ? String(remaining[0]?.imgId || '').trim() : '';
        if (deletedCurrentImage && nextImgId) {
            await setSlotSelection(slotId, nextImgId);
        } else if (deletedCurrentImage && !nextImgId) {
            await clearSlotSelection(slotId);
            await storeFailedPlaceholder(buildDeletedDrawPlaceholder(slotId, deletedPreview || {}, current));
        }
        const messageId = getDrawPreviewMessageId(deletedPreview || current);
        if (messageId >= 0) {
            const { clearDrawSavedEntry, syncDrawSavedAfterDeletion } = await getDrawCommonModule();
            if (remaining.length > 0) {
                await syncDrawSavedAfterDeletion(messageId, slotId, imgId, remaining).catch(() => false);
            } else {
                await clearDrawSavedEntry(messageId, slotId).catch(() => false);
            }
        }
        replyHostResult(requestId, { ok: true, result: await buildDrawImageResult(slotId) });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'image_delete_failed'));
    }
}

async function handleDrawImageRefresh(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    let refreshFailureContext: { wasFailed: boolean; preview: Record<string, unknown>; failedInfo: Record<string, unknown> } | null = null;
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        const { getDisplayPreviewForSlot, storePreview, setSlotSelection, deleteFailedRecordsForSlot } = await getDrawGalleryCacheModule();
        const current = await getDisplayPreviewForSlot(slotId);
        const preview = current.preview as Record<string, unknown> || {};
        const failedInfo = current.failedInfo as Record<string, unknown> || {};
        refreshFailureContext = {
            wasFailed: current.isFailed === true || current.hasData !== true,
            preview,
            failedInfo,
        };
        const facade = window.xiaobaixDraw;
        if (typeof facade?.generateImage !== 'function') {throw new Error('画图模块未初始化');}
        const tags = String(source.tags || preview.tags || '').trim();
        const characterPrompts = getDrawPreviewCharacterPrompts(preview);
        const negativePrompt = getDrawPromptNegativeInput(facade, preview);
        if (!tags) {throw new Error('image_prompt_missing');}
        const promptData = typeof facade.buildPromptData === 'function'
            ? facade.buildPromptData({ prompt: tags, tags, negativePrompt, characterPrompts })
            : { positive: tags, negativePrompt };
        const generated = await facade.generateImage({
            prompt: tags,
            tags,
            negativePrompt,
            characterPrompts,
        });
        const base64 = extractGeneratedImageBase64(generated);
        if (!base64) {throw new Error('image_data_missing');}
        const imgId = generateDrawImageId();
        await storePreview({
            imgId,
            slotId,
            messageId: getDrawPreviewStorageMessageId(preview, slotId),
            base64,
            tags,
            positive: String(promptData.positive || tags),
            characterPrompts,
            negativePrompt: String(promptData.negativePrompt || negativePrompt || ''),
            anchor: preview.anchor || '',
            source: 'tavern',
        });
        await setSlotSelection(slotId, imgId);
        if (refreshFailureContext.wasFailed) {
            await deleteFailedRecordsForSlot(slotId);
        }
        const messageId = getDrawPreviewMessageId(preview);
        if (messageId >= 0) {
            const { clearDrawSavedEntry } = await getDrawCommonModule();
            await clearDrawSavedEntry(messageId, slotId).catch(() => false);
        }
        replyHostResult(requestId, { ok: true, result: await buildDrawImageResult(slotId) });
    } catch (error) {
        // Only failed-card retries replace the visible card with a fresh failed placeholder.
        // Successful images keep their old preview and report the refresh error normally.
        if (slotId && refreshFailureContext?.wasFailed) {
            try {
                const { storeFailedPlaceholder } = await getDrawGalleryCacheModule();
                const { preview, failedInfo } = refreshFailureContext;
                if (String(preview.tags || failedInfo.tags || '').trim()) {
                    await storeFailedPlaceholder(
                        buildRefreshFailedDrawPlaceholder(slotId, preview, failedInfo, error),
                    );
                    replyHostResult(requestId, { ok: true, result: await buildDrawImageResult(slotId) });
                    return;
                }
            } catch {
                // Fall through to the generic error reply if persistence itself fails.
            }
        }
        replyHostResult(requestId, hostErrorPayload(error, 'image_refresh_failed'));
    }
}

async function handleDrawImageEdit(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    const source = payload.payload && typeof payload.payload === 'object'
        ? payload.payload as Record<string, unknown>
        : payload;
    const slotId = String(source.slotId || '').trim();
    const tags = String(source.tags || '').trim();
    try {
        if (!slotId) {throw new Error('slot_id_required');}
        if (!tags) {throw new Error('image_tags_required');}
        const facade = window.xiaobaixDraw;
        const { getPreview, storePreview } = await getDrawGalleryCacheModule();
        const current = await buildDrawImageResult(slotId);
        const imgId = String(current.imgId || '').trim();
        if (!imgId) {throw new Error('image_preview_missing');}
        const preview = await getPreview(imgId);
        if (!preview) {throw new Error('image_preview_missing');}
        const submittedCharacterPrompts = Array.isArray(source.characterPrompts)
            ? getDrawPreviewCharacterPrompts(source as Record<string, unknown>)
            : null;
        const characterPrompts = submittedCharacterPrompts || getDrawPreviewCharacterPrompts(preview);
        const promptData = typeof facade?.buildPromptData === 'function'
            ? facade.buildPromptData({
                prompt: tags,
                tags,
                negativePrompt: getDrawPromptNegativeInput(facade, preview),
                characterPrompts,
            })
            : { positive: tags, negativePrompt: String(preview.negativePrompt || '') };
        await storePreview({
            ...preview,
            tags,
            positive: String(promptData.positive || tags),
            characterPrompts,
            negativePrompt: String(promptData.negativePrompt || preview.negativePrompt || ''),
            savedUrl: preview.savedUrl || null,
            base64: preview.base64 || null,
        });
        const messageId = getDrawPreviewMessageId(preview);
        if (preview.savedUrl && messageId >= 0) {
            const { syncDrawSavedFromPreview } = await getDrawCommonModule();
            await syncDrawSavedFromPreview(messageId, preview, {
                slotId: preview.slotId || slotId,
                tags,
                positive: String(promptData.positive || tags),
            }).catch(() => false);
        }
        replyHostResult(requestId, { ok: true, result: await buildDrawImageResult(slotId) });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'image_edit_failed'));
    }
}

function handleCancelRequest(payload: Record<string, unknown> = {}): void {
    const requestId = String(payload.requestId || '').trim();
    if (!requestId) {return;}
    pendingDrawRequests.get(requestId)?.abort();
    cancelTavernNativeChatPrompt(requestId);
}

async function handleChatPresetRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:list-chat-presets') {
            result = listTavernChatPresetBundles();
        } else if (type === 'xb-tavern:get-chat-preset') {
            result = getTavernChatPresetBundle();
        } else if (type === 'xb-tavern:save-chat-preset') {
            result = await saveTavernChatPresetBundle(payload.payload);
        } else if (type === 'xb-tavern:select-chat-preset') {
            result = await selectTavernChatPresetBundle(payload.payload);
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
        if (type !== 'xb-tavern:list-chat-presets') {
            await sendConfigToFrame();
        }
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'chat_preset_failed'));
    }
}

async function handleContextRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:get-context') {
            result = await buildTavernContext(payload.payload as Record<string, unknown> || {});
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'context_request_failed'));
    }
}

async function handleWorldbookRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:list-worldbook-sources') {
            result = await listTavernWorldbookSources(payload.payload);
        } else if (type === 'xb-tavern:get-worldbook-preview') {
            result = await getTavernWorldbookPreview(payload.payload);
        } else if (type === 'xb-tavern:get-worldbook-entry') {
            result = await getTavernWorldbookEntry(payload.payload);
        } else if (type === 'xb-tavern:save-worldbook-entry') {
            result = await saveTavernWorldbookEntry(payload.payload);
        } else if (type === 'xb-tavern:get-character-worldbook-state') {
            result = await getTavernCharacterWorldbookState(payload.payload);
        } else if (type === 'xb-tavern:activate-character-worldbook') {
            result = await activateTavernCharacterWorldbook(payload.payload);
        } else if (type === 'xb-tavern:bind-character-worldbook') {
            result = await bindTavernCharacterWorldbook(payload.payload);
        } else if (type === 'xb-tavern:get-global-worldbooks') {
            result = await getTavernGlobalWorldbooks();
        } else if (type === 'xb-tavern:set-global-worldbooks') {
            result = await setTavernGlobalWorldbooks(payload.payload);
        } else if (type === 'xb-tavern:get-worldbook-runtime') {
            result = await getTavernWorldbookRuntime(payload.payload);
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'worldbook_failed'));
    }
}

async function handleNativePromptRequest(payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        const nativePayload = payload.payload && typeof payload.payload === 'object' && !Array.isArray(payload.payload)
            ? payload.payload as Record<string, unknown>
            : {};
        const result = await buildTavernNativeChatPrompt({
            ...nativePayload,
            requestId,
        });
        replyHostResult(requestId, {
            ok: true,
            result: result as unknown as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'native_prompt_failed'));
    }
}

async function handleRegexRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:list-regex-scripts') {
            result = await listTavernRegexScripts(payload.payload);
        } else if (type === 'xb-tavern:save-regex-script') {
            result = await saveTavernRegexScript(payload.payload);
        } else if (type === 'xb-tavern:delete-regex-script') {
            result = await deleteTavernRegexScript(payload.payload);
        } else if (type === 'xb-tavern:apply-regex') {
            result = await applyTavernRegex(payload.payload);
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'regex_failed'));
    }
}

async function handleSubstituteParamsRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:substitute-params') {
            result = applyTavernSubstituteParams(payload.payload);
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'substitute_params_failed'));
    }
}

async function handleHtmlRenderRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:replace-html-render-vars') {
            result = replaceTavernHtmlRenderVariables(payload.payload as Record<string, unknown> || {});
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'html_render_failed'));
    }
}

async function handleSlashCommandRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:run-slash-command') {
            result = await runTavernSlashCommand(payload.payload);
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'slash_command_failed'));
    }
}

async function handleUserRequest(type: string, payload: Record<string, unknown> = {}): Promise<void> {
    const requestId = String(payload.requestId || '');
    try {
        let result: unknown;
        if (type === 'xb-tavern:list-users') {
            result = await listTavernUsers();
        } else if (type === 'xb-tavern:switch-user') {
            result = await switchTavernUser(payload.payload as Record<string, unknown> || {});
        } else if (type === 'xb-tavern:save-display-settings') {
            const patch = payload.payload && typeof payload.payload === 'object'
                ? payload.payload as Record<string, unknown>
                : {};
            const saveResult = await saveTavernDisplaySettings(patch, { silent: false });
            if (!saveResult.ok) {
                throw new Error(saveResult.error || 'display_settings_save_failed');
            }
            result = {
                displaySettings: saveResult.displaySettings,
            };
            await sendConfigToFrame();
        }
        replyHostResult(requestId, {
            ok: true,
            result: result as Record<string, unknown>,
        });
    } catch (error) {
        replyHostResult(requestId, hostErrorPayload(error, 'user_request_failed'));
    }
}

async function createOverlay(): Promise<HTMLElement> {
    postStartupProgress({ percent: 5, action: 'createOverlay' });
    postStartupProgress({ percent: 15, action: 'loadTavernCacheKey' });
    const overlay = await createFirstPartyIframeOverlay({
        overlayId: OVERLAY_ID,
        iframeId: IFRAME_ID,
        htmlPath: HTML_PATH,
        version: await loadTavernCacheKey(),
        overlayCss: `
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            top: 0;
            bottom: auto !important;
            width: 100vw !important;
            height: 100vh;
            height: 100dvh;
            z-index: 100001 !important;
            display: flex !important;
            align-items: stretch !important;
            justify-content: stretch !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            background: #171512 !important;
            overscroll-behavior: none;
            touch-action: manipulation;
        `,
        iframeCss: `
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            min-width: 0 !important;
            min-height: 0 !important;
            border: none !important;
            background: transparent !important;
        `,
    });
    applyTavernOverlayViewport(overlay);
    installOverlayResizeHandler(overlay);
    return overlay;
}

async function openTavern(): Promise<void> {
    const existingOverlay = document.getElementById(OVERLAY_ID);
    if (existingOverlay) {
        applyTavernOverlayViewport(existingOverlay);
        return;
    }
    frameReady = false;
    frameBootReady = false;
    pendingMessages = [];
    latestStartupProgress = { percent: 5, action: 'createOverlay' };
    installMessageHandler();
    await createOverlay();
    prepareInitialConfig();
}

function closeTavern(): void {
    removeOverlayResizeHandler();
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {overlay.remove();}
    frameReady = false;
    frameBootReady = false;
    pendingMessages = [];
    initialConfigPromise = null;
}

function handleFrameMessage(event: MessageEvent): void {
    const iframe = getIframe();
    if (!isTrustedMessage(event, iframe, SOURCE_APP)) {return;}
    const data = event.data || {};
    switch (data.type) {
        case 'xb-tavern:boot-ready':
            frameBootReady = true;
            postStartupProgress({ percent: 15, action: 'loadTavernResources' });
            break;
        case 'xb-tavern:frame-ready':
            frameReady = true;
            postStartupProgress({ percent: Math.max(latestStartupProgress.percent, 20), action: 'frameReady' });
            void sendInitialConfigToFrame().catch((error) => {
                console.warn('[LittleWhiteBox][Tavern] failed to send initial config', error);
            }).finally(flushPendingMessages);
            break;
        case 'xb-tavern:startup-progress':
            postStartupProgress(data.payload || {});
            break;
        case 'xb-tavern:viewport-settle': {
            const overlay = document.getElementById(OVERLAY_ID);
            if (overlay instanceof HTMLElement) {
                scheduleTavernOverlayViewportSettle(overlay, true);
            }
            break;
        }
        case 'xb-tavern:close':
            closeTavern();
            break;
        case 'xb-tavern:refresh-context':
            void refreshContext(data.payload || {});
            break;
        case 'xb-tavern:save-config':
            void saveConfigFromFrame(data.payload || {});
            break;
        case 'xb-tavern:get-host-request-headers':
            handleHostRequestHeaders(data.payload || {});
            break;
        case 'xb-tavern:draw-status':
            handleDrawStatus(data.payload || {});
            break;
        case 'xb-tavern:draw-open-settings':
            void handleDrawOpenSettings(data.payload || {});
            break;
        case 'xb-tavern:draw-quick-settings':
            void handleDrawQuickSettings(data.payload || {});
            break;
        case 'xb-tavern:draw-update-quick-settings':
            void handleDrawUpdateQuickSettings(data.payload || {});
            break;
        case 'xb-tavern:draw-generate':
            void handleDrawGenerate(data.payload || {});
            break;
        case 'xb-tavern:inline-image-generate':
            void handleInlineImageGenerate(data.payload || {});
            break;
        case 'xb-tavern:draw-image':
            void handleDrawImage(data.payload || {});
            break;
        case 'xb-tavern:draw-image-select':
            void handleDrawImageSelect(data.payload || {});
            break;
        case 'xb-tavern:draw-image-gallery':
            void handleDrawImageGallery(data.payload || {});
            break;
        case 'xb-tavern:draw-image-save':
            void handleDrawImageSave(data.payload || {});
            break;
        case 'xb-tavern:draw-image-delete':
            void handleDrawImageDelete(data.payload || {});
            break;
        case 'xb-tavern:draw-image-refresh':
            void handleDrawImageRefresh(data.payload || {});
            break;
        case 'xb-tavern:draw-image-edit':
            void handleDrawImageEdit(data.payload || {});
            break;
        case 'xb-tavern:cancel-request':
            handleCancelRequest(data.payload || {});
            break;
        case 'xb-tavern:get-context':
            void handleContextRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:list-chat-presets':
        case 'xb-tavern:get-chat-preset':
        case 'xb-tavern:save-chat-preset':
        case 'xb-tavern:select-chat-preset':
            void handleChatPresetRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:list-worldbook-sources':
        case 'xb-tavern:get-worldbook-preview':
        case 'xb-tavern:get-worldbook-entry':
        case 'xb-tavern:save-worldbook-entry':
        case 'xb-tavern:get-character-worldbook-state':
        case 'xb-tavern:activate-character-worldbook':
        case 'xb-tavern:bind-character-worldbook':
        case 'xb-tavern:get-global-worldbooks':
        case 'xb-tavern:set-global-worldbooks':
        case 'xb-tavern:get-worldbook-runtime':
            void handleWorldbookRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:build-native-chat-prompt':
            void handleNativePromptRequest(data.payload || {});
            break;
        case 'xb-tavern:list-regex-scripts':
        case 'xb-tavern:save-regex-script':
        case 'xb-tavern:delete-regex-script':
        case 'xb-tavern:apply-regex':
            void handleRegexRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:substitute-params':
            void handleSubstituteParamsRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:replace-html-render-vars':
            void handleHtmlRenderRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:run-slash-command':
            void handleSlashCommandRequest(data.type, data.payload || {});
            break;
        case 'xb-tavern:list-users':
        case 'xb-tavern:switch-user':
        case 'xb-tavern:save-display-settings':
            void handleUserRequest(data.type, data.payload || {});
            break;
        default:
            break;
    }
}

function installMessageHandler(): void {
    if (messageHandlerInstalled) {return;}
    // Guarded by isTrustedMessage in handleFrameMessage.
    // eslint-disable-next-line no-restricted-syntax
    window.addEventListener('message', handleFrameMessage);
    messageHandlerInstalled = true;
}

export async function initTavern(): Promise<void> {
    installMessageHandler();
    window.xiaobaixTavern = {
        open: openTavern,
        close: closeTavern,
        refreshContext,
        refreshDrawStatus,
        refreshRenderSettings,
    };
}

export function cleanupTavern(): void {
    closeTavern();
}

export { openTavern, closeTavern };
