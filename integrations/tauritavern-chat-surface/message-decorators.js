import { mountHistoryButton } from '../../modules/message-preview.js';
import { mountStorySummaryButton } from '../../modules/story-summary/story-summary.js';
import { mountVariablesButton } from '../../modules/variables/variables-panel.js';
import { createButtonCollapseCleanup } from '../../widgets/button-collapse.js';

export function createTauriTavernMessageDecorator({ settings, hasCustomTemplateForMessage }) {
    return function decorateTauriTavernMessage({ element, mesid }) {
        if (!settings.enabled) return;
        if (hasCustomTemplateForMessage(mesid)) {
            throw new Error('LittleWhiteBox bounded ChatSurface does not support custom template iframes');
        }

        const releases = [createButtonCollapseCleanup(element)];
        const release = () => {
            let firstError;
            for (let index = releases.length - 1; index >= 0; index -= 1) {
                try { releases[index]?.(); } catch (error) { firstError ??= error; }
            }
            releases.length = 0;
            if (firstError !== undefined) throw firstError;
        };

        try {
            releases.push(mountHistoryButton(element, mesid));
            releases.push(mountVariablesButton(element, mesid));
            releases.push(mountStorySummaryButton(element, mesid));
        } catch (error) {
            try { release(); } catch (cleanupError) {
                const failure = new Error('LittleWhiteBox managed decorator mount and cleanup failed');
                failure.cause = error;
                failure.cleanupError = cleanupError;
                throw failure;
            }
            throw error;
        }
        return release;
    };
}
