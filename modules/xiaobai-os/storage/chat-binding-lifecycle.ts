import type { ChatBindingManager } from './chat-binding.js';
import type { XiaobaiOsSidecarV1 } from '../kernel/contracts.js';

type EventListener = (...args: unknown[]) => void;

export interface ChatBindingEventSource {
    on(event: string, listener: EventListener): void;
    removeListener(event: string, listener: EventListener): void;
}

export interface ChatBindingEventNames {
    chatChanged: string;
    chatRenamed: string;
    chatDeleted: string;
    groupChatDeleted: string;
    characterRenamed: string;
}

export interface ChatBindingLifecycleOptions {
    manager: ChatBindingManager;
    installResolvedSidecar: (envelope: XiaobaiOsSidecarV1 | null) => Promise<void>;
    invalidateSidecar?: () => void;
    events: ChatBindingEventSource;
    eventNames: ChatBindingEventNames;
    onError?: (error: unknown) => void;
}

export interface ChatBindingLifecycle {
    start(): void;
    stop(): Promise<void>;
    refresh(): Promise<void>;
    ready(): Promise<void>;
}

export function createChatBindingLifecycle(options: ChatBindingLifecycleOptions): ChatBindingLifecycle {
    const {
        manager,
        installResolvedSidecar,
        invalidateSidecar = () => undefined,
        events,
        eventNames,
        onError = error => console.error('[LittleWhiteBox] 小白 OS 聊天生命周期刷新失败', error),
    } = options;
    let active = false;
    let generation = 0;
    let requestGeneration = 0;
    let refreshRequested = false;
    let refreshPromise: Promise<void> | null = null;

    function refresh(): Promise<void> {
        if (!active) { return Promise.resolve(); }
        refreshRequested = true;
        requestGeneration += 1;
        if (!refreshPromise) {
            const refreshGeneration = generation;
            refreshPromise = Promise.resolve().then(async () => {
                while (active && generation === refreshGeneration && refreshRequested) {
                    refreshRequested = false;
                    const requestedAt = requestGeneration;
                    const result = await manager.resolveCurrent();
                    if (!active || generation !== refreshGeneration) { return; }
                    if (requestedAt !== requestGeneration) { continue; }
                    if (result.status === 'ready') { await installResolvedSidecar(result.envelope); }
                    else if (result.status === 'empty') { await installResolvedSidecar(null); }
                    else { invalidateSidecar(); }
                }
            }).catch(error => {
                invalidateSidecar();
                onError(error);
            }).finally(() => {
                refreshPromise = null;
                if (active && refreshRequested) { void refresh(); }
            });
        }
        return refreshPromise;
    }

    const handleRefresh: EventListener = () => { invalidateSidecar(); void refresh(); };
    const handleChatDeleted: EventListener = (chatId) => {
        void manager.handleChatDeleted(String(chatId || '')).catch(onError);
    };
    const handleCharacterRenamed: EventListener = (oldOwnerLocator, newOwnerLocator) => {
        void manager.handleCharacterRenamed(String(oldOwnerLocator || ''), String(newOwnerLocator || ''))
            .then(() => { invalidateSidecar(); return refresh(); })
            .catch(onError);
    };

    function start(): void {
        if (active) { return; }
        active = true;
        generation += 1;
        events.on(eventNames.chatChanged, handleRefresh);
        events.on(eventNames.chatRenamed, handleRefresh);
        events.on(eventNames.chatDeleted, handleChatDeleted);
        events.on(eventNames.groupChatDeleted, handleChatDeleted);
        events.on(eventNames.characterRenamed, handleCharacterRenamed);
        void refresh();
    }

    async function stop(): Promise<void> {
        if (!active) {
            if (refreshPromise) { await refreshPromise; }
            return;
        }
        active = false;
        generation += 1;
        refreshRequested = false;
        events.removeListener(eventNames.chatChanged, handleRefresh);
        events.removeListener(eventNames.chatRenamed, handleRefresh);
        events.removeListener(eventNames.chatDeleted, handleChatDeleted);
        events.removeListener(eventNames.groupChatDeleted, handleChatDeleted);
        events.removeListener(eventNames.characterRenamed, handleCharacterRenamed);
        if (refreshPromise) { await refreshPromise; }
    }

    return Object.freeze({ start, stop, refresh, ready: () => refreshPromise ?? Promise.resolve() });
}
