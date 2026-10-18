import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { getSillyTavernChatSurface, getSillyTavernShellSnapshot } from '../../../host/sillytavern-context.js';
import type { XiaobaiOsAppRuntime } from '../../../types.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';
import type { MainGenerationRuntime } from '../../../host/main-generation-runtime.js';
import type { MapService } from '../application/service.js';
import type { MapClientState } from '../types.js';
import type { MaintenanceRunner } from '../../../capabilities/maintenance/runner.js';
import { createMapProjectionDisplay } from './projection-display.js';
import type { MountMapProjection } from '../ui/projection-surface.js';
import type * as MapProjectionModule from '../ui/projection-entry.js';
import { buildEntry } from '../../../../../core/build-assets.js';

export interface MapProjectionReplyPause {
    isPaused(message: unknown): boolean;
    subscribe(listener: () => void): () => void;
}

export function createMapProjectionRuntime(map: MapService, settings: XiaobaiOsSettingsRepository,
    maintenance: MaintenanceRunner, readState: () => MapClientState, mainGeneration: MainGenerationRuntime,
    replyPause?: MapProjectionReplyPause): XiaobaiOsAppRuntime {
    const display = createMapProjectionDisplay({
        enabled: () => {
            const current = settings.read();
            return current?.enabled === true && current.apps.map.projectToChat;
        },
        readState,
        isGenerationActive: mainGeneration.isActive,
        isReplyPaused: message => replyPause?.isPaused(message) ?? false,
        captureChat: getSillyTavernChatSurface,
        readTheme: () => getSillyTavernShellSnapshot().theme,
        loadSurface: async () => {
            const entry = await buildEntry('runtime/map-projection');
            // The projection owns its ShadowRoot styles; do not preload them into the host head.
            // eslint-disable-next-line no-unsanitized/method -- The generated manifest owns this plugin entry URL.
            const module: typeof MapProjectionModule = await import(/* @vite-ignore */ entry.file);
            const styles = await Promise.all(entry.css.map(async (href: string) => {
                const response = await fetch(href);
                if (!response.ok) { throw new Error(`Map stylesheet: ${response.status}`); }
                return response.text();
            }));
            return (container => module.mountMapProjection(container, styles)) as MountMapProjection;
        },
        subscribe({ stateChanged, messagesChanged, chatChanged, activityChanged }) {
            const events = createModuleEvents('xiaobaiOsMapProjection');
            events.on(event_types.CHAT_CHANGED, chatChanged);
            // MESSAGE_EDITED precedes the host DOM update; MESSAGE_UPDATED is its completion boundary.
            for (const event of [event_types.CHARACTER_MESSAGE_RENDERED,
                event_types.MESSAGE_DELETED, event_types.MESSAGE_UPDATED, event_types.MESSAGE_SWIPED]) {
                events.on(event, messagesChanged);
            }
            const unsubscribers = [mainGeneration.subscribe(activityChanged), map.subscribe(stateChanged), settings.subscribe(stateChanged),
                maintenance.subscribeStatus(participant => { if (participant === 'map') { stateChanged(); } })];
            if (replyPause) { unsubscribers.push(replyPause.subscribe(activityChanged)); }
            return () => { events.cleanup(); unsubscribers.forEach(unsubscribe => unsubscribe()); };
        },
    });
    return { startBackground: display.start, stopBackground: display.stop };
}
