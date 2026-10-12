import type { XiaobaiOsAppRuntime } from '../types.js';

interface MainGenerationEvent {
    type: string;
    dryRun: boolean;
}

interface MainGenerationHandlers {
    started: (event: MainGenerationEvent) => void;
    hostStateChanged: () => void;
    groupStarted: (event: MainGenerationEvent) => void;
    groupFinished: () => void;
}

interface MainGenerationRuntimeDependencies {
    readHostGenerating: () => boolean;
    subscribe: (handlers: MainGenerationHandlers) => () => void;
}

export interface MainGenerationRuntime extends Pick<
    XiaobaiOsAppRuntime,
    'startBackground' | 'stopBackground' | 'handleChatChanged' | 'cancelAll'
> {
    isActive: () => boolean;
    subscribe: (listener: (active: boolean) => void) => () => void;
}

function isMainGeneration(type: string): boolean {
    return !type || type === 'normal' || type === 'regenerate' || type === 'swipe' || type === 'continue';
}

export function createMainGenerationRuntime({
    readHostGenerating,
    subscribe,
}: MainGenerationRuntimeDependencies): MainGenerationRuntime {
    const listeners = new Set<(active: boolean) => void>();
    let currentRequestIsMain: boolean | null = null;
    let groupMainGeneration = false;
    let publishedActive = false;
    let unsubscribe: (() => void) | null = null;

    function currentActive(): boolean {
        // On late startup the request type is unknown, not idle. Wait for the
        // existing host activity to finish; observed quiet/dry-run calls remain excluded.
        return groupMainGeneration || (currentRequestIsMain !== false && readHostGenerating());
    }

    function publishCurrent(): void {
        const next = currentActive();
        if (publishedActive === next) {return;}
        publishedActive = next;
        for (const listener of listeners) {listener(next);}
    }

    function started(event: MainGenerationEvent): void {
        currentRequestIsMain = !event.dryRun && isMainGeneration(event.type);
        // GENERATION_STARTED precedes slash-command and backend preflight. Do not
        // publish the caller's provisional is_send_press flag as a real generation.
        if (!groupMainGeneration && publishedActive) {
            publishedActive = false;
            for (const listener of listeners) {listener(false);}
        }
    }

    function groupStarted(event: MainGenerationEvent): void {
        groupMainGeneration = !event.dryRun && isMainGeneration(event.type);
        publishCurrent();
    }

    function groupFinished(): void {
        groupMainGeneration = false;
        publishCurrent();
    }

    function reset(): void {
        currentRequestIsMain = false;
        groupMainGeneration = false;
        publishCurrent();
    }

    function startBackground(): void {
        if (!unsubscribe) {
            currentRequestIsMain = null;
            unsubscribe = subscribe({ started, hostStateChanged: publishCurrent, groupStarted, groupFinished });
            publishCurrent();
        }
    }

    function stopBackground(): void {
        unsubscribe?.();
        unsubscribe = null;
        reset();
        listeners.clear();
    }

    return Object.freeze({
        startBackground,
        stopBackground,
        handleChatChanged: reset,
        cancelAll: reset,
        isActive: currentActive,
        subscribe(listener: (next: boolean) => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    });
}
