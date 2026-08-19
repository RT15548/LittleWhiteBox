import { extension_settings } from '../../../../../extensions.js';
import { EXT_ID } from '../../core/constants.js';
import {
    mountLeasedIframeRuntime,
    shouldRenderCodeBlock,
} from '../../modules/iframe-renderer.js';
import { claimIframeRuntimes } from './runtime-claims.js';

export function prepareTauriTavernIframeRuntimes({ content }, claims) {
    const settings = extension_settings[EXT_ID] || {};
    claimIframeRuntimes({
        content,
        claims,
        settings,
        shouldRender: shouldRenderCodeBlock,
        mountRuntime: mountLeasedIframeRuntime,
    });
}
