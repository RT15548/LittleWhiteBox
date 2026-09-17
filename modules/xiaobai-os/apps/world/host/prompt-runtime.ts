import { buildWorldStoryPrompt } from './story-projection.js';
import type { XiaobaiOsAppRuntime } from '../../../types.js';
import type { WorldService } from '../application/service.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';

export interface WorldPromptEventHandlers {
    generationStarted(): void;
    intercept(): void;
    requestBuilt(): void;
    generationEnded(): void;
    generationStopped(): void;
}

export function createWorldPromptRuntime(dependencies: {
    world: WorldService;
    settings: Pick<XiaobaiOsSettingsRepository, 'read' | 'subscribe'>;
    getChatIdentity(): string;
    setPrompt(value: string): void;
    subscribe(handlers: WorldPromptEventHandlers): () => void;
}): XiaobaiOsAppRuntime {
    const { world, settings, getChatIdentity, setPrompt, subscribe } = dependencies;
    let unsubscribe: (() => void) | undefined;
    let unsubscribeData: (() => void) | undefined;
    let unsubscribeSettings: (() => void) | undefined;
    const clear = () => setPrompt('');
    return {
        startBackground() {
            unsubscribe ??= subscribe({
                generationStarted: clear, requestBuilt: clear, generationEnded: clear, generationStopped: clear,
                intercept() {
                    clear();
                    try {
                        const current = world.readCurrent();
                        // Read only the confirmed snapshot; never wait for maintenance or a save.
                        if (settings.read()!.apps.world.injectToStory && current.chatIdentity && current.chatIdentity === getChatIdentity()) {
                            setPrompt(buildWorldStoryPrompt(current.world));
                        }
                    } catch (error) { console.error('[LittleWhiteBox] World background unavailable', error); }
                },
            });
            unsubscribeData ??= world.subscribe(() => {
                try {
                    const current = world.readCurrent();
                    if (!current.chatIdentity || current.chatIdentity !== getChatIdentity()) { clear(); }
                } catch { clear(); }
            });
            unsubscribeSettings ??= settings.subscribe(next => { if (!next.apps.world.injectToStory) { clear(); } });
        },
        stopBackground() {
            unsubscribe?.(); unsubscribeData?.(); unsubscribeSettings?.();
            unsubscribe = undefined; unsubscribeData = undefined; unsubscribeSettings = undefined; clear();
        },
        cancelAll: clear,
        handleChatChanged: clear,
    };
}
