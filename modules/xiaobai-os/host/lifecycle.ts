import {
    createXiaobaiOsFrameBridge,
    type XiaobaiOsFrameBridgeOptions,
    type XiaobaiOsHostFrameBridge,
    type XiaobaiOsHostFrameMessage,
} from './frame-bridge.js';
import type { XiaobaiOsAppDescriptor, XiaobaiOsAppRuntimeRouter } from '../types.js';
import type { CapturedChatBinding } from '../kernel/contracts.js';
import type { AppStatus } from '../kernel/execution-scope.js';
import { xiaobaiOsLaunchers } from '../shell/app-launchers.js';
import { createQuickLauncher } from './quick-launcher.js';
import { normalizeAppOrder, orderApps } from '../shell/app-order.js';

const BUTTON_ID = 'xiaobaix-os-button';
const STYLE_ID = 'xiaobaix-os-host-styles';
const OVERLAY_ID = 'xiaobaix-os-overlay';
const IFRAME_ID = 'xiaobaix-os-iframe';

type UnknownRecord = Record<string, unknown>;

export interface XiaobaiOsLifecycleSnapshot {
    theme?: 'light' | 'dark';
}

type XiaobaiOsWindow = Window & {
    MutationObserver?: typeof MutationObserver;
};

export interface XiaobaiOsLifecycleOptions {
    documentTarget?: Document;
    windowTarget?: XiaobaiOsWindow;
    stylesheetHref?: string;
    frameSrc?: string;
    subscribeChatChanged?: (handler: () => void) => () => void;
    subscribeAppDescriptorsChanged?: (handler: () => void) => () => void;
    subscribeAppStatusChanged?: (handler: (appId: string, status: AppStatus) => void) => () => void;
    getInitSnapshot?: () => XiaobaiOsLifecycleSnapshot | null;
    getAppDescriptors?: () => readonly XiaobaiOsAppDescriptor[];
    getAppOrder?: () => readonly string[];
    saveAppOrder?: (order: readonly string[]) => Promise<void>;
    subscribeAppOrderChanged?: (handler: () => void) => () => void;
    getAppStatuses?: () => Readonly<Record<string, AppStatus>>;
    captureChatBinding?: () => CapturedChatBinding | null;
    onChatRequired?: () => void;
    isChatBindingCurrent?: (captured: CapturedChatBinding) => boolean | Promise<boolean>;
    createActivationToken?: () => string;
    appRuntime?: Partial<XiaobaiOsAppRuntimeRouter>;
    bridgeFactory?: (options: XiaobaiOsFrameBridgeOptions) => XiaobaiOsHostFrameBridge;
    onError?: (error: unknown) => void;
}

export interface XiaobaiOsLifecycle {
    init: () => boolean;
    open: (appId?: string) => boolean;
    closeWindow: (reason?: string) => Promise<void>;
    cleanup: () => Promise<void>;
    isInitialized: () => boolean;
    isOpen: () => boolean;
}

interface ActiveApp {
    appId: string;
    activationToken: string;
    binding: CapturedChatBinding;
    generation: number;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** Bento launcher mark: one primary window tile plus two stacked widget tiles. */
const LAUNCHER_ICON_TILES: readonly Readonly<Record<string, string>>[] = [
    { x: '2.5', y: '2.5', width: '11', height: '19', rx: '3.5' },
    { x: '15.5', y: '2.5', width: '6', height: '8.5', rx: '2.5', opacity: '.6' },
    { x: '15.5', y: '13', width: '6', height: '8.5', rx: '2.5', opacity: '.85' },
];

function createLauncherIcon(documentTarget: Document): SVGSVGElement {
    const icon = documentTarget.createElementNS(SVG_NAMESPACE, 'svg');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'currentColor');
    icon.setAttribute('aria-hidden', 'true');
    icon.setAttribute('focusable', 'false');
    for (const tile of LAUNCHER_ICON_TILES) {
        const rect = documentTarget.createElementNS(SVG_NAMESPACE, 'rect');
        for (const [name, value] of Object.entries(tile)) {
            rect.setAttribute(name, value);
        }
        icon.append(rect);
    }
    return icon;
}

function createLauncherButton(documentTarget: Document): HTMLButtonElement {
    const button = documentTarget.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'xiaobaix-os-button interactable';
    button.title = '小白 OS';
    button.setAttribute('aria-label', '小白 OS');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', OVERLAY_ID);
    button.append(createLauncherIcon(documentTarget));
    return button;
}

function insertLauncher(documentTarget: Document, button: HTMLElement): void {
    const sendButton = documentTarget.getElementById('send_but');
    if (!sendButton) {
        throw new Error('xiaobai_os_send_button_unavailable');
    }
    const previewButton = documentTarget.getElementById('message_preview_btn');
    (previewButton || sendButton).before(button);
}

/**
 * Creates an isolated Xiaobai OS host lifecycle.
 *
 */
export function createXiaobaiOsLifecycle({
    documentTarget = document,
    windowTarget = window as XiaobaiOsWindow,
    stylesheetHref,
    frameSrc,
    subscribeChatChanged = () => () => {},
    subscribeAppDescriptorsChanged = () => () => {},
    subscribeAppStatusChanged = () => () => {},
    getInitSnapshot = () => ({}),
    getAppDescriptors = () => [],
    getAppOrder = () => [],
    saveAppOrder,
    subscribeAppOrderChanged = () => () => {},
    getAppStatuses = () => ({}),
    captureChatBinding = () => null,
    onChatRequired = () => undefined,
    isChatBindingCurrent = () => true,
    createActivationToken = () => globalThis.crypto?.randomUUID?.()
        ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`,
    appRuntime = {},
    bridgeFactory = createXiaobaiOsFrameBridge,
    onError = (error) => console.error('[LittleWhiteBox] 小白 OS 运行失败', error),
}: XiaobaiOsLifecycleOptions = {}): XiaobaiOsLifecycle {
    if (!stylesheetHref || !frameSrc) {
        throw new TypeError('xiaobai OS lifecycle requires stylesheetHref and frameSrc');
    }
    const resolvedStylesheetHref = stylesheetHref;
    const resolvedFrameSrc = frameSrc;

    let initialized = false;
    let launcher: HTMLElement | null = null;
    let shortcuts: ReturnType<typeof createQuickLauncher> | null = null;
    let initialAppId: string | null = null;
    let overlay: HTMLDivElement | null = null;
    let iframe: HTMLIFrameElement | null = null;
    let bridge: XiaobaiOsHostFrameBridge | null = null;
    let unsubscribeChatChanged: (() => void) | null = null;
    let unsubscribeAppDescriptorsChanged: (() => void) | null = null;
    let unsubscribeAppStatusChanged: (() => void) | null = null;
    let unsubscribeAppOrderChanged: (() => void) | null = null;
    let themeObserver: MutationObserver | null = null;
    let activeApp: ActiveApp | null = null;
    let pendingApp: ActiveApp | null = null;
    let windowOpenPromise: Promise<void> | null = null;
    let generation = 0;
    let appActivationGeneration = 0;
    const pendingOperations = new Set<Promise<unknown>>();

    function sameBinding(left: CapturedChatBinding, right: CapturedChatBinding | null): boolean {
        return !!right
            && left.identityKey === right.identityKey
            && left.binding.kind === right.binding.kind
            && left.binding.ownerLocator === right.binding.ownerLocator
            && left.binding.chatId === right.binding.chatId
            && (!left.reference || left.reference.osId === right.reference?.osId);
    }

    function isLocallyCurrent(app: ActiveApp): boolean {
        const current = captureChatBinding();
        if (app.generation !== appActivationGeneration || !sameBinding(app.binding, current)) { return false; }
        if (!app.binding.reference && current?.reference) { app.binding = current; }
        return true;
    }

    function track(operation: void | Promise<void>): Promise<void> {
        const promise = Promise.resolve(operation).catch(onError);
        pendingOperations.add(promise);
        void promise.finally(() => pendingOperations.delete(promise));
        return promise;
    }

    function invoke(operation: () => void | Promise<void>): Promise<void> {
        try {
            return track(operation());
        } catch (error) {
            onError(error);
            return Promise.resolve();
        }
    }

    function appDescriptorsWithStatus(): readonly (XiaobaiOsAppDescriptor & { status: AppStatus })[] {
        const statuses = getAppStatuses();
        return getAppDescriptors().map(descriptor => ({
            ...descriptor,
            status: statuses[descriptor.id] ?? { state: 'loading', phase: 'install' },
        }));
    }

    function addStylesheet(): HTMLLinkElement {
        let stylesheet = documentTarget.getElementById(STYLE_ID) as HTMLLinkElement | null;
        if (stylesheet) {
            return stylesheet;
        }
        stylesheet = documentTarget.createElement('link');
        stylesheet.id = STYLE_ID;
        stylesheet.rel = 'stylesheet';
        stylesheet.href = resolvedStylesheetHref;
        documentTarget.head.append(stylesheet);
        return stylesheet;
    }

    async function deactivateActiveApp(reason: string): Promise<void> {
        appActivationGeneration += 1;
        pendingApp = null;
        if (!activeApp) {
            try {
                await appRuntime.cancelForeground?.(reason);
            } catch (error) {
                onError(error);
            }
            return;
        }
        const { appId } = activeApp;
        activeApp = null;
        try {
            await appRuntime.deactivate?.(appId, reason);
        } catch (error) {
            onError(error);
        }
    }

    function handleAppDescriptorsChanged(): void {
        const apps = getAppDescriptors();
        shortcuts?.refresh();
        const availableIds = new Set(apps.map(app => app.id));
        if (
            (activeApp && !availableIds.has(activeApp.appId))
            || (pendingApp && !availableIds.has(pendingApp.appId))
        ) {
            void invoke(() => deactivateActiveApp('app-disabled'));
        }
        if (bridge?.isReady()) {
            bridge.post('os/apps-changed', { apps: appDescriptorsWithStatus() });
        }
    }

    function handleAppStatusChanged(appId: string, status: AppStatus): void {
        if (status.state === 'failed' && activeApp?.appId === appId) {
            void invoke(() => deactivateActiveApp('app-failed'));
        }
        if (bridge?.isReady()) { bridge.post('os/app-state', { appId, status }); }
    }

    function handleAppOrderChanged(): void {
        shortcuts?.refresh();
        if (bridge?.isReady()) { bridge.post('os/app-order-changed', { appOrder: getAppOrder() }); }
    }

    async function closeWindow(reason = 'closed'): Promise<void> {
        shortcuts?.hide(false);
        initialAppId = null;
        generation += 1;
        const deactivation = deactivateActiveApp(reason);
        bridge?.dispose();
        bridge = null;
        windowOpenPromise = null;
        stopThemeObserver();
        overlay?.remove();
        overlay = null;
        iframe = null;
        if (reason === 'closed' || reason === 'frame-close') { launcher?.focus({ preventScroll: true }); }
        await Promise.allSettled([
            deactivation,
            Promise.resolve().then(() => appRuntime.handleWindowClosed?.(reason)),
        ]);
    }

    function handleThemeChanged(): void {
        shortcuts?.updateTheme();
        if (!bridge?.isReady()) {
            return;
        }
        const snapshot = getInitSnapshot();
        bridge.post('os/theme-changed', { theme: snapshot?.theme || 'light' });
    }

    function startThemeObserver(): void {
        if (themeObserver || typeof windowTarget.MutationObserver !== 'function') {
            return;
        }
        themeObserver = new windowTarget.MutationObserver(handleThemeChanged);
        const options = { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] };
        if (documentTarget.documentElement) {
            themeObserver.observe(documentTarget.documentElement, options);
        }
        if (documentTarget.body) {
            themeObserver.observe(documentTarget.body, options);
        }
    }

    function stopThemeObserver(): void {
        themeObserver?.disconnect();
        themeObserver = null;
    }

    async function handleFrameReady(frameBridge: XiaobaiOsHostFrameBridge, openGeneration: number): Promise<void> {
        try {
            await windowOpenPromise;
        } catch (error) {
            if (openGeneration === generation && frameBridge === bridge) {
                frameBridge.post('os/error', { message: error instanceof Error ? error.message : String(error) });
            }
            // The tracked window-open operation owns error reporting. This waiter
            // only keeps a failed refresh from publishing a stale init snapshot.
            return;
        }
        try {
            const snapshot = await getInitSnapshot();
            if (openGeneration !== generation || frameBridge !== bridge) {
                return;
            }
            frameBridge.post('os/init', {
                ...snapshot,
                apps: appDescriptorsWithStatus(),
                initialAppId,
                appOrder: getAppOrder(),
            });
            initialAppId = null;
        } catch (error) {
            if (openGeneration === generation && frameBridge === bridge) {
                frameBridge.post('os/error', { message: error instanceof Error ? error.message : String(error) });
            }
            onError(error);
        }
    }

    async function handleFrameMessage(
        message: XiaobaiOsHostFrameMessage,
        frameBridge: XiaobaiOsHostFrameBridge,
        openGeneration: number,
    ): Promise<void> {
        if (openGeneration !== generation || frameBridge !== bridge) {
            return;
        }
        const { type, requestId = '', payload = {} } = message;
        if (type === 'os/set-app-order') {
            const order = isRecord(payload) ? payload.appOrder : undefined;
            if (!saveAppOrder || !Array.isArray(order) || normalizeAppOrder(order).length !== order.length) {
                frameBridge.post('os/app-order-result', { ok: false, error: 'invalid_app_order' }, requestId);
                return;
            }
            try {
                await saveAppOrder(order);
                if (openGeneration !== generation || frameBridge !== bridge) { return; }
                frameBridge.post('os/app-order-result', { ok: true, appOrder: getAppOrder() }, requestId);
            } catch (error) {
                if (openGeneration !== generation || frameBridge !== bridge) { return; }
                frameBridge.post('os/app-order-result', {
                    ok: false, error: 'app_order_save_failed', message: '顺序未能保存，请重试。',
                }, requestId);
                onError(error);
            }
            return;
        }
        if (type === 'os/close') {
            await closeWindow('frame-close');
            return;
        }
        if (type === 'app/deactivate') {
            if (
                activeApp
                && (message.appId !== activeApp.appId || message.activationToken !== activeApp.activationToken)
            ) {
                frameBridge.post('app/deactivated', { ok: false, error: 'app_inactive' }, requestId);
                return;
            }
            await deactivateActiveApp('route-left');
            frameBridge.post('app/deactivated', { ok: true }, requestId);
            return;
        }
        if (type === 'os/app-ui-failure') {
            const current = activeApp;
            if (
                current
                && message.appId === current.appId
                && message.activationToken === current.activationToken
            ) {
                onError(Object.assign(new Error(`APP ${current.appId} UI failed`), {
                    appId: current.appId,
                    phase: isRecord(payload) ? payload.phase : 'ui-render',
                }));
            }
            return;
        }
        if (type === 'app/retry') {
            const appId = String(isRecord(payload) ? payload.appId || '' : '');
            if (!getAppDescriptors().some(app => app.id === appId) || !appRuntime.retry) {
                frameBridge.post('app/retry-result', { ok: false, error: 'app_unavailable' }, requestId);
                return;
            }
            try {
                await appRuntime.retry(appId);
                frameBridge.post('app/retry-result', { ok: true, appId }, requestId);
            } catch (error) {
                frameBridge.post('app/retry-result', {
                    ok: false,
                    error: isRecord(error) && typeof error.code === 'string' ? error.code : 'app_retry_failed',
                    message: error instanceof Error ? error.message : String(error),
                }, requestId);
            }
            return;
        }
        if (type === 'app/activate') {
            const appId = String(isRecord(payload) ? payload.appId || '' : '');
            const descriptor = getAppDescriptors().find((app) => app.id === appId);
            if (!descriptor) {
                frameBridge.post('app/activation-result', { ok: false, error: 'app_unavailable' }, requestId);
                return;
            }
            const deactivation = deactivateActiveApp('app-switch');
            const activationGeneration = ++appActivationGeneration;
            await deactivation;
            if (activationGeneration !== appActivationGeneration) {
                frameBridge.post('app/activation-result', { ok: false, error: 'activation_cancelled' }, requestId);
                return;
            }
            const binding = captureChatBinding();
            if (!binding) {
                frameBridge.post('app/activation-result', { ok: false, error: 'chat_unavailable' }, requestId);
                return;
            }
            const candidate: ActiveApp = {
                appId,
                activationToken: createActivationToken(),
                binding,
                generation: activationGeneration,
            };
            pendingApp = candidate;
            try {
                const state = await appRuntime.activate?.(appId, {
                    activationToken: candidate.activationToken,
                    isCurrent: () => isLocallyCurrent(candidate)
                        && (pendingApp === candidate || activeApp === candidate),
                    post: (messageType: string, messagePayload: unknown = {}, responseId = '') =>
                        isLocallyCurrent(candidate) && (pendingApp === candidate || activeApp === candidate)
                            ? frameBridge.post(messageType, messagePayload, responseId, candidate)
                            : false,
                });
                const currentStatus = getAppStatuses()[appId];
                if (currentStatus?.state === 'failed') {
                    throw Object.assign(new Error(currentStatus.failure.message), currentStatus.failure);
                }
                if (
                    openGeneration !== generation ||
                    frameBridge !== bridge ||
                    pendingApp !== candidate ||
                    !isLocallyCurrent(candidate) ||
                    !await isChatBindingCurrent(candidate.binding)
                ) {
                    if (
                        openGeneration === generation &&
                        frameBridge === bridge &&
                        appActivationGeneration === activationGeneration + 1
                    ) {
                        void invoke(() => appRuntime.cancelForeground?.('activation-cancelled'));
                    }
                    frameBridge.post(
                        'app/activation-result',
                        { ok: false, error: 'activation_cancelled' },
                        requestId,
                    );
                    return;
                }
                pendingApp = null;
                activeApp = candidate;
                frameBridge.post('app/activation-result', {
                    ok: true,
                    appId,
                    activationToken: candidate.activationToken,
                    state: state ?? null,
                }, requestId);
            } catch (error) {
                if (pendingApp === candidate) {pendingApp = null;}
                const cancelled = openGeneration !== generation
                    || frameBridge !== bridge
                    || !isLocallyCurrent(candidate);
                const requiresAppRetry = getAppStatuses()[appId]?.state === 'failed';
                if (!cancelled) { onError(error); }
                frameBridge.post(
                    'app/activation-result',
                    {
                        ok: false,
                        error: cancelled
                            ? 'activation_cancelled'
                            : isRecord(error) && typeof error.code === 'string'
                            ? error.code
                            : 'app_activation_failed',
                        ...(!cancelled ? {
                            message: error instanceof Error ? error.message : String(error),
                            phase: isRecord(error) && typeof error.phase === 'string' ? error.phase : 'activate',
                            retryable: !isRecord(error) || error.retryable !== false,
                            ...(requiresAppRetry ? { requiresAppRetry: true } : {}),
                        } : {}),
                    },
                    requestId,
                );
            }
            return;
        }
        const current = activeApp;
        if (
            !current
            || message.appId !== current.appId
            || message.activationToken !== current.activationToken
            || !type.startsWith(`${current.appId}/`)
            || !isLocallyCurrent(current)
            || !await isChatBindingCurrent(current.binding)
        ) {
            if (requestId) { frameBridge.post('app/result', { ok: false, error: 'app_inactive' }, requestId); }
            return;
        }
        const messageAppId = current.appId;
        const messageActivationGeneration = current.generation;
        const isMessageActivationCurrent = () =>
            activeApp === current
            && appActivationGeneration === messageActivationGeneration
            && isLocallyCurrent(current);
        try {
            const result = await appRuntime.handleMessage?.(messageAppId, { type, requestId, payload });
            if (requestId && openGeneration === generation && frameBridge === bridge) {
                if (!isMessageActivationCurrent() || !await isChatBindingCurrent(current.binding)) {
                    frameBridge.post(`${messageAppId}/result`, { ok: false, error: 'app_inactive' }, requestId, current);
                } else if (result !== undefined) {
                    frameBridge.post(`${messageAppId}/result`, { ok: true, result }, requestId, current);
                }
            }
        } catch (error) {
            onError(error);
            if (requestId && openGeneration === generation && frameBridge === bridge) {
                frameBridge.post(
                    `${messageAppId}/result`,
                    {
                        ok: false,
                        error: isMessageActivationCurrent()
                            ? isRecord(error) && typeof error.code === 'string'
                                ? error.code
                                : 'app_request_failed'
                            : 'app_inactive',
                        ...(isMessageActivationCurrent() ? {
                            message: error instanceof Error ? error.message : String(error),
                        } : {}),
                    },
                    requestId,
                    current,
                );
            }
        }
    }

    function canOpen(): boolean {
        if (!initialized) {
            return false;
        }
        if (!captureChatBinding()) {
            onChatRequired();
            return false;
        }
        return true;
    }

    function open(appId?: string): boolean {
        if (!canOpen()) { return false; }
        if (appId && !getAppDescriptors().some(app => app.id === appId)) { return false; }
        shortcuts?.hide(false);
        initialAppId = appId || null;
        if (overlay?.isConnected) {
            if (bridge?.isReady()) {
                bridge.post('os/navigate', { appId: initialAppId });
                initialAppId = null;
            }
            iframe?.focus();
            return true;
        }
        generation += 1;
        const openGeneration = generation;
        overlay = documentTarget.createElement('div');
        overlay.id = OVERLAY_ID;
        overlay.className = 'xiaobaix-os-overlay';
        iframe = documentTarget.createElement('iframe');
        iframe.id = IFRAME_ID;
        iframe.className = 'xiaobaix-os-frame';
        iframe.src = resolvedFrameSrc;
        iframe.title = '小白 OS';
        iframe.setAttribute('allow', 'clipboard-read; clipboard-write');
        overlay.append(iframe);
        documentTarget.body.append(overlay);
        bridge = bridgeFactory({
            iframe,
            windowTarget,
            onReady: (frameBridge) => handleFrameReady(frameBridge, openGeneration),
            onMessage: (message, frameBridge) => handleFrameMessage(message, frameBridge, openGeneration),
        });
        windowOpenPromise = Promise.resolve().then(async () => {
            await appRuntime.handleWindowOpened?.();
        });
        void track(windowOpenPromise);
        startThemeObserver();
        return true;
    }

    function handleChatChanged(): void {
        shortcuts?.hide(false);
        void invoke(async () => {
            await appRuntime.cancelAll?.('chat-changed');
            await closeWindow('chat-changed');
            await appRuntime.handleChatChanged?.();
        });
    }

    function handlePageHide(event: PageTransitionEvent): void {
        if (event.persisted) {
            return;
        }
        void cleanup();
    }

    function init(): boolean {
        if (initialized) {
            return true;
        }
        addStylesheet();
        launcher = documentTarget.getElementById(BUTTON_ID);
        if (!launcher) {
            launcher = createLauncherButton(documentTarget);
            insertLauncher(documentTarget, launcher);
        }
        shortcuts = createQuickLauncher({
            anchor: launcher,
            documentTarget,
            windowTarget,
            getApps: () => {
                const ids = new Set(getAppDescriptors().map(app => app.id));
                return orderApps(xiaobaiOsLaunchers, getAppOrder()).filter(app => ids.has(app.id));
            },
            getTheme: () => getInitSnapshot()?.theme === 'dark' ? 'dark' : 'light',
            canOpen,
            launch: open,
            onVisibilityChange: visible => {
                if (visible) { startThemeObserver(); }
                else if (!overlay) { stopThemeObserver(); }
            },
        });
        unsubscribeChatChanged = subscribeChatChanged(handleChatChanged);
        unsubscribeAppDescriptorsChanged = subscribeAppDescriptorsChanged(handleAppDescriptorsChanged);
        unsubscribeAppStatusChanged = subscribeAppStatusChanged(handleAppStatusChanged);
        unsubscribeAppOrderChanged = subscribeAppOrderChanged(handleAppOrderChanged);
        windowTarget.addEventListener('pagehide', handlePageHide);
        void invoke(() => appRuntime.startBackground?.());
        initialized = true;
        return true;
    }

    async function cleanup(): Promise<void> {
        if (!initialized && !launcher && !overlay && !documentTarget.getElementById(STYLE_ID)) {
            return;
        }
        generation += 1;
        const cancellation = Promise.resolve().then(() => appRuntime.cancelAll?.('cleanup'));
        const closing = closeWindow('cleanup');
        stopThemeObserver();
        const stopping = Promise.resolve().then(() => appRuntime.stopBackground?.());
        unsubscribeChatChanged?.();
        unsubscribeChatChanged = null;
        unsubscribeAppDescriptorsChanged?.();
        unsubscribeAppDescriptorsChanged = null;
        unsubscribeAppStatusChanged?.();
        unsubscribeAppStatusChanged = null;
        unsubscribeAppOrderChanged?.();
        unsubscribeAppOrderChanged = null;
        windowTarget.removeEventListener('pagehide', handlePageHide);
        shortcuts?.destroy();
        shortcuts = null;
        launcher?.remove();
        launcher = null;
        documentTarget.getElementById(STYLE_ID)?.remove();
        initialized = false;
        await Promise.allSettled([cancellation, closing, stopping, ...pendingOperations]);
    }

    return Object.freeze({
        init,
        open,
        closeWindow,
        cleanup,
        isInitialized: () => initialized,
        isOpen: () => !!overlay?.isConnected,
    });
}
