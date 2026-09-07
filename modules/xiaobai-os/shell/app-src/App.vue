<script setup lang="ts">
import { computed, markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, type Component } from 'vue';
import { xiaobaiOsApps, type XiaobaiOsAppDefinition } from '../app-catalog.js';
import XiaobaiOsDevice from './components/XiaobaiOsDevice.vue';
import { createFrameBridge, HostRequestError, type FrameMessage } from './frame-bridge.js';
import { mergeVisibleAppOrder, orderApps } from '../app-order.js';

interface AppStatus {
    state: 'loading' | 'ready' | 'failed';
    phase?: string;
    failure?: {
        code: string;
        message: string;
        phase: string;
        retryable: boolean;
    };
}

interface HostAppDescriptor {
    id: string;
    status?: AppStatus;
}

interface InitPayload {
    theme?: 'light' | 'dark';
    initialAppId?: string | null;
    appOrder?: string[];
    apps?: HostAppDescriptor[];
    chat?: {
        characterAvatar?: string;
    } | null;
}

interface PendingAppOpening {
    appId: string;
    latestState?: unknown;
}

const bridge = createFrameBridge();
const root = ref<HTMLElement | null>(null);
const device = ref<InstanceType<typeof XiaobaiOsDevice> | null>(null);
const initialized = ref(false);
const theme = ref<'light' | 'dark'>('light');
const availableIds = ref<Set<string>>(new Set());
const appOrder = ref<string[]>([]);
const characterAvatar = ref('');
const activeApp = ref<XiaobaiOsAppDefinition | null>(null);
const activeComponent = shallowRef<Component | null>(null);
const activeState = ref<unknown>(null);
const appLoading = ref(false);
const appFailure = ref<{
    phase: string;
    message: string;
    retryable: boolean;
    requiresAppRetry?: boolean;
} | null>(null);
const appRenderKey = ref(0);
const errorMessage = ref('');
let previousFocus: HTMLElement | null = null;
let unsubscribe = () => {};
let navigationGeneration = 0;
let pendingAppOpening: PendingAppOpening | null = null;

const availableApps = computed(() => orderApps(xiaobaiOsApps, appOrder.value).filter(app => availableIds.value.has(app.id)));

async function saveAppOrder(visibleOrder: readonly string[] | null): Promise<void> {
    const nextOrder = visibleOrder === null ? [] : mergeVisibleAppOrder(appOrder.value, visibleOrder);
    const result = await bridge.request('os/set-app-order', { appOrder: nextOrder }) as { appOrder: string[] };
    appOrder.value = result.appOrder;
}

function applyAvailableApps(apps: readonly HostAppDescriptor[]): void {
    const nextIds = new Set(apps.map(app => String(app.id)));
    const activeRemoved = activeApp.value && !nextIds.has(activeApp.value.id);
    const pendingRemoved = pendingAppOpening && !nextIds.has(pendingAppOpening.appId);
    availableIds.value = nextIds;
    if (!activeRemoved && !pendingRemoved) {return;}
    navigationGeneration += 1;
    pendingAppOpening = null;
    activeApp.value = null;
    activeComponent.value = null;
    activeState.value = null;
    appLoading.value = false;
    appFailure.value = null;
    bridge.clearAppSession();
}

function applyInit(payload: InitPayload): void {
    navigationGeneration += 1;
    pendingAppOpening = null;
    theme.value = payload.theme === 'dark' ? 'dark' : 'light';
    appOrder.value = payload.appOrder ?? [];
    applyAvailableApps(payload.apps || []);
    characterAvatar.value = String(payload.chat?.characterAvatar || '');
    activeApp.value = null;
    activeComponent.value = null;
    activeState.value = null;
    appLoading.value = false;
    appFailure.value = null;
    bridge.clearAppSession();
    initialized.value = true;
    if (payload.initialAppId) { navigate(payload.initialAppId); }
}

function navigate(appId: string | null): void {
    if (!appId) { goHome(); return; }
    const app = availableApps.value.find(item => item.id === appId);
    if (app && activeApp.value?.id !== app.id) { void openApp(app); }
}

function handleHostMessage(message: FrameMessage): void {
    if (message.type === 'os/app-order-changed') {
        appOrder.value = (message.payload as { appOrder: string[] }).appOrder;
    }
    if (message.type === 'os/init') {
        applyInit((message.payload || {}) as InitPayload);
    }
    if (message.type === 'os/navigate' && initialized.value) {
        const payload = message.payload as { appId?: string | null } | undefined;
        if (payload?.appId === null || typeof payload?.appId === 'string') { navigate(payload.appId); }
    }
    if (message.type === 'os/theme-changed') {
        const payload = message.payload as { theme?: string };
        theme.value = payload?.theme === 'dark' ? 'dark' : 'light';
    }
    if (message.type === 'os/apps-changed') {
        const payload = message.payload as { apps?: HostAppDescriptor[] } | undefined;
        applyAvailableApps(payload?.apps || []);
    }
    if (message.type === 'os/app-state') {
        const payload = message.payload as { appId?: string; status?: AppStatus } | undefined;
        const status = payload?.status;
        if (payload?.appId === activeApp.value?.id && status?.state === 'failed') {
            appLoading.value = false;
            appFailure.value = {
                phase: status.failure?.phase || 'host',
                message: status.failure?.message || 'Host APP 运行失败',
                retryable: status.failure?.retryable !== false,
                requiresAppRetry: true,
            };
            bridge.clearAppSession();
        }
    }
    if (message.type === 'os/error') {
        errorMessage.value = String((message.payload as { message?: string })?.message || '小白 OS 初始化失败');
    }
    const state = (message.payload as { state?: unknown } | undefined)?.state;
    if (pendingAppOpening && message.appId === pendingAppOpening.appId
        && message.type === `${pendingAppOpening.appId}/state`) {
        pendingAppOpening.latestState = state;
    }
    const session = bridge.getAppSession();
    if (activeApp.value && session?.appId === activeApp.value.id
        && message.appId === session.appId && message.activationToken === session.activationToken
        && message.type === `${activeApp.value.id}/state`) {
        activeState.value = state;
    }
}

async function openApp(app: XiaobaiOsAppDefinition): Promise<void> {
    const generation = ++navigationGeneration;
    appRenderKey.value += 1;
    const opening: PendingAppOpening = { appId: app.id };
    pendingAppOpening = opening;
    activeApp.value = app;
    activeComponent.value = null;
    activeState.value = null;
    appLoading.value = true;
    appFailure.value = null;
    bridge.clearAppSession();
    errorMessage.value = '';
    const host = bridge.request('app/activate', { appId: app.id }) as Promise<{
        appId?: string;
        activationToken?: string;
        state?: unknown;
    }>;
    const ui = app.load();
    const [hostResult, uiResult] = await Promise.allSettled([host, ui]);
    try {
        if (generation !== navigationGeneration) { return; }
        if (hostResult.status === 'fulfilled') {
            if (hostResult.value.appId !== app.id || !hostResult.value.activationToken) {
                throw new Error('app_activation_mismatch');
            }
            bridge.setAppSession({ appId: app.id, activationToken: hostResult.value.activationToken });
            activeState.value = opening.latestState ?? hostResult.value.state ?? null;
        } else {
            const error = hostResult.reason;
            appFailure.value = {
                phase: error instanceof HostRequestError ? error.phase : 'host',
                message: error instanceof Error ? error.message : String(error),
                retryable: !(error instanceof HostRequestError) || error.retryable,
                requiresAppRetry: error instanceof HostRequestError && error.requiresAppRetry,
            };
        }
        if (uiResult.status === 'fulfilled') {
            activeComponent.value = markRaw(uiResult.value);
        } else if (!appFailure.value) {
            appFailure.value = {
                phase: 'ui-load',
                message: uiResult.reason instanceof Error ? uiResult.reason.message : 'APP 界面加载失败',
                retryable: true,
            };
        }
        appLoading.value = false;
    } catch (error) {
        appLoading.value = false;
        appFailure.value = {
            phase: 'host',
            message: error instanceof Error ? error.message : String(error),
            retryable: true,
        };
        bridge.clearAppSession();
    } finally {
        if (pendingAppOpening === opening) {pendingAppOpening = null;}
    }
}

async function retryApp(): Promise<void> {
    const app = activeApp.value;
    const failure = appFailure.value;
    if (!app || !failure) { return; }
    if (failure.phase === 'ui-render') {
        appFailure.value = null;
        appRenderKey.value += 1;
        return;
    }
    if (failure.phase === 'ui-load' && bridge.getAppSession()?.appId === app.id) {
        appLoading.value = true;
        appFailure.value = null;
        app.resetLoader();
        try {
            activeComponent.value = markRaw(await app.load());
        } catch (error) {
            appFailure.value = {
                phase: 'ui-load',
                message: error instanceof Error ? error.message : 'APP 界面加载失败',
                retryable: true,
            };
        } finally {
            appLoading.value = false;
        }
        return;
    }
    if ((failure.phase === 'activate' || failure.phase === 'host') && !failure.requiresAppRetry) {
        await openApp(app);
        return;
    }
    appLoading.value = true;
    appFailure.value = null;
    try {
        await bridge.request('app/retry', { appId: app.id });
        await openApp(app);
    } catch (error) {
        appLoading.value = false;
        appFailure.value = {
            phase: 'host',
            message: error instanceof Error ? error.message : String(error),
            retryable: true,
        };
    }
}

function handleRenderFailure(error: unknown): void {
    const app = activeApp.value;
    if (!app) { return; }
    appFailure.value = {
        phase: 'ui-render',
        message: error instanceof Error ? error.message : 'APP 界面渲染失败',
        retryable: true,
    };
    bridge.post('os/app-ui-failure', { appId: app.id, phase: 'ui-render' });
}

function handleFrameError(event: ErrorEvent): void {
    if (!activeApp.value || appLoading.value || appFailure.value) { return; }
    event.preventDefault();
    handleRenderFailure(event.error ?? new Error(event.message || 'APP 界面运行失败'));
}

function handleUnhandledRejection(event: PromiseRejectionEvent): void {
    if (!activeApp.value || appLoading.value || appFailure.value) { return; }
    event.preventDefault();
    handleRenderFailure(event.reason);
}

function reloadFrame(): void {
    window.location.reload();
}

function goHome(): void {
    if (!activeApp.value) { device.value?.finishHomeEditing(); return; }
    navigationGeneration += 1;
    pendingAppOpening = null;
    bridge.post('app/deactivate', { appId: activeApp.value?.id || '' });
    bridge.clearAppSession();
    activeApp.value = null;
    activeComponent.value = null;
    activeState.value = null;
    appLoading.value = false;
    appFailure.value = null;
}

function goBack(): void {
    if (!device.value?.back()) { goHome(); }
}

function close(): void {
    navigationGeneration += 1;
    pendingAppOpening = null;
    bridge.post('os/close');
    bridge.clearAppSession();
}

function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
        event.preventDefault();
        if (activeApp.value) {
            goBack();
        } else if (!device.value?.back()) {
            close();
        }
        return;
    }
    if (event.key !== 'Tab' || !root.value) {
        return;
    }
    const focusable = Array.from(root.value.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])'))
        .filter(element => !element.closest('[inert]') && element.getClientRects().length > 0);
    if (focusable.length === 0) {
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}

onMounted(async () => {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    unsubscribe = bridge.subscribe(handleHostMessage);
    bridge.start();
    window.addEventListener('error', handleFrameError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    await nextTick();
    root.value?.focus();
});

onBeforeUnmount(() => {
    navigationGeneration += 1;
    pendingAppOpening = null;
    window.removeEventListener('error', handleFrameError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    unsubscribe();
    bridge.dispose();
    previousFocus?.focus();
});
</script>

<template>
    <main
        ref="root"
        class="xiaobai-os-shell"
        :class="`theme-${theme}`"
        role="dialog"
        aria-modal="true"
        aria-label="小白 OS"
        tabindex="-1"
        @keydown="handleKeydown"
        @click.self="close"
    >
        <div v-if="errorMessage" class="xiaobai-os-error" role="alert">{{ errorMessage }}</div>
        <div v-if="!initialized" class="xiaobai-os-loading" role="status">正在启动小白 OS</div>
        <XiaobaiOsDevice
            v-else
            ref="device"
            :apps="availableApps"
            :active-app="activeApp"
            :active-component="activeComponent"
            :active-state="activeState"
            :app-failure="appFailure"
            :app-loading="appLoading"
            :app-render-key="appRenderKey"
            :bridge="bridge"
            :character-avatar="characterAvatar"
            :save-app-order="saveAppOrder"
            @open-app="openApp"
            @back="goBack"
            @home="goHome"
            @close="close"
            @render-failed="handleRenderFailure"
            @retry="retryApp"
            @reload="reloadFrame"
        />
    </main>
</template>
