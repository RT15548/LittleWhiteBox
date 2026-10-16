import { renderPreviewsForMessage } from '../../../../modules/draw/shared/draw-common.js';
import { mountChatMessageImages } from '../../../../modules/draw/shared/chat-message-images.js';
export function mountTauriTavernDrawPanel(element, mesid) {
    if (element.getAttribute('is_user') === 'true') return;
    return window.xiaobaixDraw?.mountMessagePanel(element, mesid);
}

// TT 2.3 does not emit message events for content remounts. Read the existing
// gallery at this content lease; never start a new scene-planning generation.
export function createTauriTavernDrawDecorator({ settings, isDrawProviderActive, onError }) {
    return ({ content, mesid, signal }) => {
        if (!settings.enabled || !isDrawProviderActive()) return;
        const release = mountChatMessageImages(content, mesid);
        void renderPreviewsForMessage(mesid, { content, signal }).catch(error => {
            if (!signal.aborted) onError(error);
        });
        return release;
    };
}
