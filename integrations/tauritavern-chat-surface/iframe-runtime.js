import { extension_settings } from '../../../../../extensions.js';
import { EXT_ID } from '../../core/constants.js';
import {
    mountLeasedIframeRuntime,
    shouldRenderCodeBlock,
} from '../../modules/iframe-renderer.js';

export function prepareTauriTavernIframeRuntimes({ content }, claims) {
    const settings = extension_settings[EXT_ID] || {};
    if (!settings.enabled || settings.renderEnabled === false) return;

    for (const code of content.querySelectorAll('pre > code')) {
        if (shouldRenderCodeBlock(code)) {
            claims.claim(code.parentElement, mountLeasedIframeRuntime);
        }
    }
}
