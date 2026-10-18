import { readBuildManifest } from './build-assets.js';

export async function loadFirstPartyIframeCacheKey() {
    return (await readBuildManifest()).buildId;
}

export async function createFirstPartyIframeOverlay(options = {}) {
    const overlayId = String(options.overlayId || '').trim();
    const iframeId = String(options.iframeId || '').trim();
    const htmlPath = String(options.htmlPath || '').trim();
    if (!overlayId || !iframeId || !htmlPath) throw new Error('iframe_app_options_required');

    const overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.style.cssText = options.overlayCss || `
        position: fixed;
        inset: 0;
        z-index: 100001;
        display: flex;
        align-items: stretch;
        justify-content: stretch;
        background: #171512;
    `;

    const version = String(options.version || '').trim();
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.src = version ? `${htmlPath}?v=${encodeURIComponent(version)}` : htmlPath;
    iframe.style.cssText = options.iframeCss || `
        display: block;
        width: 100%;
        height: 100%;
        border: none;
        background: transparent;
    `;

    overlay.appendChild(iframe);
    document.body.appendChild(overlay);
    return overlay;
}
