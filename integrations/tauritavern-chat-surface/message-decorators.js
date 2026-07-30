import { mountHistoryButton } from '../../modules/message-preview.js';
import { mountStorySummaryButton } from '../../modules/story-summary/story-summary.js';
import { mountVariablesButton } from '../../modules/variables/variables-panel.js';
import { createButtonCollapseCleanup } from '../../widgets/button-collapse.js';
import { mountMessageDecorators } from './decorator-lifecycle.js';

export function createTauriTavernMessageDecorator({ settings, hasCustomTemplateForMessage }) {
    return function decorateTauriTavernMessage({ element, mesid }) {
        if (!settings.enabled) return;
        if (hasCustomTemplateForMessage(mesid)) {
            throw new Error('LittleWhiteBox bounded ChatSurface does not support custom template iframes');
        }

        return mountMessageDecorators({
            element,
            mesid,
            createContainerCleanup: createButtonCollapseCleanup,
            decorators: [mountHistoryButton, mountVariablesButton, mountStorySummaryButton],
        });
    };
}
