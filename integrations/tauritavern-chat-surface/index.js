import {
    getTauriTavernChatSurfaceEnvironment,
    isTauriTavernChatSurfaceManaged,
} from './environment.js';
import { prepareTauriTavernIframeRuntimes } from './iframe-runtime.js';
import { createTauriTavernMessageDecorator } from './message-decorators.js';
import { registerTauriTavernChatSurfaceParticipant } from './participant.js';
import { lockTauriTavernChatSurfaceSettings } from './settings-ui.js';

export function activateTauriTavernChatSurface({
    settings,
    hasActiveCustomTemplate,
    hasCustomTemplateForMessage,
    isDrawProviderActive,
}) {
    const environment = getTauriTavernChatSurfaceEnvironment();
    if (!environment.managed) return null;

    return registerTauriTavernChatSurfaceParticipant({
        environment,
        settings,
        hasActiveCustomTemplate,
        isDrawProviderActive,
        prepareContent: prepareTauriTavernIframeRuntimes,
        didMount: createTauriTavernMessageDecorator({ settings, hasCustomTemplateForMessage }),
    });
}

export {
    isTauriTavernChatSurfaceManaged,
    lockTauriTavernChatSurfaceSettings,
};
