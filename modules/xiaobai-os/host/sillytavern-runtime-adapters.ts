import {
    extension_prompt_roles,
    extension_prompt_types,
    setExtensionPrompt,
} from '../../../../../../../script.js';
import {
    GENERATE_INTERCEPTOR_ORDER,
    registerGenerateInterceptor,
    unregisterGenerateInterceptor,
} from '../../../shared/common/generate-interceptor.js';
import { createModuleEvents, event_types } from '../../../core/event-manager.js';
import type { ShopPromptEventHandlers } from '../apps/shop/host/prompt-runtime.js';
import type { MapPromptEventHandlers } from '../apps/map/host/prompt-runtime.js';
import type { TaskPromptEventHandlers } from '../apps/tasks/host/prompt-runtime.js';
import type { WorldPromptEventHandlers } from '../apps/world/host/prompt-runtime.js';
import { createMainGenerationRuntime, type MainGenerationRuntime } from './main-generation-runtime.js';

type SimplePromptHandlers = MapPromptEventHandlers | TaskPromptEventHandlers | WorldPromptEventHandlers;

export function setSillyTavernPrompt(key: string, value: string, depth = 1): void {
    setExtensionPrompt(
        key,
        value,
        Number(extension_prompt_types.IN_CHAT) || 1,
        depth,
        false,
        Number(extension_prompt_roles.SYSTEM) || 0,
    );
}

export function subscribeShopPromptEvents(handlers: ShopPromptEventHandlers): () => void {
    const key = 'xiaobai_os_shop_effects';
    const events = createModuleEvents('xiaobaiOsShopPrompt');
    events.on(event_types.GENERATION_STARTED, (type: unknown, _options: unknown, dryRun: unknown) => {
        if (!dryRun) { handlers.generationStarted({ type: String(type || ''), dryRun: false }); }
    });
    registerGenerateInterceptor(key, (
        _chat: unknown,
        _contextSize: unknown,
        _abort: unknown,
        type: unknown,
    ) => handlers.intercept({ type: String(type || '') }), GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_SHOP);
    events.on(event_types.GENERATE_AFTER_DATA, (_data: unknown, dryRun: unknown) => { if (!dryRun) { handlers.requestBuilt(); } });
    events.on(event_types.GENERATION_ENDED, handlers.generationEnded);
    events.on(event_types.GENERATION_STOPPED, handlers.generationStopped);
    events.on(event_types.MESSAGE_RECEIVED, handlers.messageReceived);
    return () => {
        unregisterGenerateInterceptor(key);
        events.cleanup();
    };
}

function subscribeSimplePromptEvents(
    moduleId: string,
    key: string,
    order: number,
    handlers: SimplePromptHandlers,
): () => void {
    const events = createModuleEvents(moduleId);
    events.on(event_types.GENERATION_STARTED, (_type: unknown, _options: unknown, value: unknown) => {
        // Native dry runs skip interceptors and never own the pending real request's prompt.
        if (!value) { handlers.generationStarted(); }
    });
    registerGenerateInterceptor(key, (
        _chat: unknown,
        _contextSize: unknown,
        _abort: unknown,
        type: unknown,
    ) => {
        const generationType = String(type || '');
        if (!['', 'normal', 'regenerate', 'swipe', 'continue'].includes(generationType)) {
            handlers.generationStopped();
            return;
        }
        handlers.intercept();
    }, order);
    events.on(event_types.GENERATE_AFTER_DATA, (_data: unknown, dryRun: unknown) => { if (!dryRun) { handlers.requestBuilt(); } });
    events.on(event_types.GENERATION_ENDED, handlers.generationEnded);
    events.on(event_types.GENERATION_STOPPED, handlers.generationStopped);
    return () => {
        unregisterGenerateInterceptor(key);
        events.cleanup();
    };
}

export const subscribeMapPromptEvents = (handlers: MapPromptEventHandlers): (() => void) =>
    subscribeSimplePromptEvents(
        'xiaobaiOsMapPrompt',
        'xiaobai_os_map_context',
        GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_MAP,
        handlers,
    );

export const subscribeTaskPromptEvents = (handlers: TaskPromptEventHandlers): (() => void) =>
    subscribeSimplePromptEvents(
        'xiaobaiOsTasksPrompt',
        'xiaobai_os_tasks_context',
        GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_TASKS,
        handlers,
    );

export const subscribeWorldPromptEvents = (handlers: WorldPromptEventHandlers): (() => void) =>
    subscribeSimplePromptEvents(
        'xiaobaiOsWorldPrompt',
        'xiaobai_os_world_context',
        GENERATE_INTERCEPTOR_ORDER.XIAOBAI_OS_WORLD,
        handlers,
    );

export function createSillyTavernMainGenerationRuntime(): MainGenerationRuntime {
    return createMainGenerationRuntime({
        readHostGenerating: () => document.body.dataset.generating === 'true',
        subscribe(handlers) {
            const events = createModuleEvents('xiaobaiOsMainGeneration');
            events.on(event_types.GENERATION_STARTED, (type: unknown, _options: unknown, dryRun: unknown) => {
                handlers.started({ type: String(type || ''), dryRun: Boolean(dryRun) });
            });
            events.on(event_types.GENERATION_ENDED, handlers.hostStateChanged);
            events.on(event_types.GENERATION_STOPPED, handlers.hostStateChanged);
            events.on(event_types.GROUP_WRAPPER_STARTED, (event: unknown) => {
                const type = event && typeof event === 'object' && 'type' in event
                    ? String((event as { type?: unknown }).type || '')
                    : '';
                handlers.groupStarted({ type, dryRun: false });
            });
            events.on(event_types.GROUP_WRAPPER_FINISHED, handlers.groupFinished);
            const observer = new MutationObserver(handlers.hostStateChanged);
            observer.observe(document.body, { attributes: true, attributeFilter: ['data-generating'] });
            return () => {
                observer.disconnect();
                events.cleanup();
            };
        },
    });
}

export function subscribeMaintenanceMessages(listener: (messageIndex: number) => void): () => void {
    const events = createModuleEvents('xiaobaiOsMaintenance');
    events.on(event_types.MESSAGE_SENT, (messageIndex: unknown) => listener(Number(messageIndex)));
    return () => events.cleanup();
}

export function subscribeXiaobaiOsChatChanged(listener: () => void): () => void {
    const events = createModuleEvents('xiaobaiOsLifecycle');
    events.on(event_types.CHAT_CHANGED, listener);
    return () => events.cleanup();
}

export function createChatBindingEventAdapter() {
    const events = createModuleEvents('xiaobaiOsChatBinding');
    return {
        source: {
            on: events.on,
            removeListener: events.off,
        },
        names: {
            chatChanged: event_types.CHAT_CHANGED,
            chatRenamed: event_types.CHAT_RENAMED,
            chatDeleted: event_types.CHAT_DELETED,
            groupChatDeleted: event_types.GROUP_CHAT_DELETED,
            characterRenamed: event_types.CHARACTER_RENAMED,
        },
        dispose: events.cleanup,
    };
}
