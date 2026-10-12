import { createModuleEvents, event_types } from '../../../../../core/event-manager.js';
import { extensionFolderPath } from '../../../../../core/constants.js';
import { getSillyTavernChatSurface, getSillyTavernShellSnapshot } from '../../../host/sillytavern-context.js';
import type { XiaobaiOsAppRuntime } from '../../../types.js';
import type { XiaobaiOsSettingsRepository } from '../../../host/settings-repository.js';
import type { MainGenerationRuntime } from '../../../host/main-generation-runtime.js';
import type { MapService } from '../application/service.js';
import type { MapClientState } from '../types.js';
import type { MaintenanceRunner } from '../../../capabilities/maintenance/runner.js';
import { createMapProjectionDisplay } from './projection-display.js';
import type { MountMapProjection } from '../ui/projection-surface.js';

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
            const url = `/${extensionFolderPath}/modules/xiaobai-os/dist/xiaobai-os-map-projection.js`;
            // Fixed packaged extension asset; no model/user-controlled module path.
            // eslint-disable-next-line no-unsanitized/method
            const module = await import(/* @vite-ignore */ url) as { mountMapProjection: MountMapProjection };
            return module.mountMapProjection;
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
