import {
    getTauriTavernEnvironment,
    isTauriTavernChatSurfaceManaged,
} from './environment.js';
import { configureMessagePreviewRuntime } from '../../modules/message-preview.js';
import { configureVariablesPanelRuntime } from '../../modules/variables/variables-panel.js';
import { configureStoryOutlineRuntime } from '../../modules/story-outline/story-outline.js';
import { configureButtonCollapseRuntime } from '../../widgets/button-collapse.js';
import { configureTtsRuntime, mountTtsMessageContent } from '../../modules/tts/tts.js';
import { getManagedLockedControlIds } from './feature-policy.js';
import { mountMessageDecorators } from './chat-surface/decorator-lifecycle.js';
import { configureTauriTavernStorySummary } from './features/story-summary/index.js';
import { configureTauriTavernIframeRenderer, prepareTauriTavernIframeRuntimes } from './features/iframe-renderer/index.js';
import { createTauriTavernMessageDecorator } from './message-decorators.js';
import { registerTauriTavernIntegration } from './registration.js';
import { lockTauriTavernChatSurfaceSettings } from './settings-ui.js';
import { createTauriTavernDrawDecorator } from './features/draw/index.js';
import { updateMessageBlock } from '../../../../../../script.js';
import { getContext } from '../../../../../extensions.js';

let messageDecorators;

export function isTauriTavernControlLocked(id) {
    return getTauriTavernEnvironment().managed && getManagedLockedControlIds().includes(id);
}

export function syncTauriTavernMessageDecorators() {
    messageDecorators?.refresh();
}

// Settings changes are not a new chat epoch. Keep the required participant
// registered, reconcile its resident buttons and let the host replace content
// (including disposal/recreation of claimed iframe runtimes).
export function syncTauriTavernEnabledState() {
    if (!getTauriTavernEnvironment().managed) return;
    syncTauriTavernMessageDecorators();
    const chat = getContext().chat;
    for (const element of document.querySelectorAll('#chat > .mes')) {
        const mesid = Number(element.getAttribute('mesid'));
        if (chat[mesid] && !element.querySelector('.edit_textarea')) {
            updateMessageBlock(mesid, chat[mesid]);
        }
    }
}

export function configureTauriTavernRuntime() {
    const environment = getTauriTavernEnvironment();
    const ownsMessageButtons = !environment.managed;
    configureMessagePreviewRuntime({
        ownsHistoryButtons: ownsMessageButtons,
        supportsPreview: ownsMessageButtons,
    });
    configureVariablesPanelRuntime({ ownsMessageButtons });
    configureTauriTavernStorySummary(environment);
    configureTauriTavernIframeRenderer(environment);
    configureStoryOutlineRuntime({ ownsMessageButtons });
    configureButtonCollapseRuntime({ ownsMessageButtons });
    configureTtsRuntime({ ownsMessageDom: ownsMessageButtons, onUiChanged: syncTauriTavernEnabledState });
}

export function activateTauriTavernChatSurface({
    settings,
    hasActiveCustomTemplate,
    hasCustomTemplateForMessage,
    isDrawProviderActive,
}) {
    const environment = getTauriTavernEnvironment();
    if (!environment.managed) return null;

    messageDecorators = createTauriTavernMessageDecorator({ settings, hasCustomTemplateForMessage });
    const mountDrawContent = createTauriTavernDrawDecorator({
        settings, isDrawProviderActive, onError: error => registration.fault(error),
    });
    const registration = registerTauriTavernIntegration({
        environment,
        settings,
        hasActiveCustomTemplate,
        isDrawProviderActive,
        prepareContent: prepareTauriTavernIframeRuntimes,
        didMount: messageDecorators.mount,
        didCommitContent(context) {
            if (!settings.enabled) return;
            return mountMessageDecorators({
                ...context,
                createContainerCleanup: () => undefined,
                decorators: [
                    () => mountDrawContent(context),
                    () => mountTtsMessageContent(context.content),
                ],
            });
        },
    });
    return registration;
}

export {
    isTauriTavernChatSurfaceManaged,
    lockTauriTavernChatSurfaceSettings,
};
