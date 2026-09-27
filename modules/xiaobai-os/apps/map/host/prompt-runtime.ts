import { buildMapPromptBlock } from '../../../domains/map/projection.js';
import type { MapDomainV1 } from '../../../domains/map/types.js';
import type { XiaobaiOsAppRuntime } from '../../../types.js';

export interface MapPromptEventHandlers {
    readonly generationStarted: () => void;
    readonly intercept: () => void;
    readonly requestBuilt: () => void;
    readonly generationEnded: () => void;
    readonly generationStopped: () => void;
}

export interface MapPromptRuntimeDependencies {
    readonly readCurrentMap: () => MapDomainV1 | null;
    readonly setPrompt: (value: string) => void;
    readonly subscribe: (handlers: MapPromptEventHandlers) => () => void;
    readonly onError?: (error: unknown) => void;
}

export type MapPromptRuntime = Pick<
    XiaobaiOsAppRuntime,
    'startBackground' | 'stopBackground' | 'handleChatChanged' | 'cancelAll'
>;

export function createMapPromptRuntime({
    readCurrentMap,
    setPrompt,
    subscribe,
    onError = error => console.error('[LittleWhiteBox] Map prompt runtime failed', error),
}: MapPromptRuntimeDependencies): MapPromptRuntime {
    let unsubscribe: (() => void) | null = null;

    function clearPrompt(): void {
        setPrompt('');
    }

    function intercept(): void {
        clearPrompt();
        try {
            const map = readCurrentMap();
            if (!map) {return;}
            const prompt = buildMapPromptBlock(map);
            if (prompt) {setPrompt(prompt);}
        } catch (error) {
            clearPrompt();
            onError(error);
        }
    }

    function startBackground(): void {
        if (!unsubscribe) {
            unsubscribe = subscribe({
                generationStarted: clearPrompt,
                intercept,
                requestBuilt: clearPrompt,
                generationEnded: clearPrompt,
                generationStopped: clearPrompt,
            });
        }
    }

    function stopBackground(): void {
        unsubscribe?.();
        unsubscribe = null;
        clearPrompt();
    }

    return Object.freeze({
        startBackground,
        stopBackground,
        handleChatChanged: clearPrompt,
        cancelAll: clearPrompt,
    });
}
