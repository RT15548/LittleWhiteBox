import { renderPreviewsForMessage } from '../../../../modules/draw/shared/draw-common.js';
import { drawMessageViewport } from '../../../../modules/draw/shared/draw-message-viewport.js';
export function mountTauriTavernDrawPanel(element, mesid) {
    if (element.getAttribute('is_user') === 'true') return;
    return window.xiaobaixDraw?.mountMessagePanel(element, mesid);
}

// ChatSurface does not emit message events for content remounts. Read the existing
// gallery at this content lease; never start a new scene-planning generation.
export function createTauriTavernDrawDecorator({ settings, isDrawProviderActive, onError }) {
    return ({ content, mesid, signal }) => {
        if (!settings.enabled || !isDrawProviderActive()) return;
        const release = drawMessageViewport.mount(content, mesid);
        void renderPreviewsForMessage(mesid, { content, signal }).catch(error => {
            if (!signal.aborted) onError(error);
        });
        return release;
    };
}
