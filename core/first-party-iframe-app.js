import { extensionFolderPath } from './constants.js';

export async function loadFirstPartyIframeCacheKey(buildInfoPath = '') {
    let manifestVersion = '';
    let buildHash = '';
    try {
        const response = await fetch(`${extensionFolderPath}/manifest.json`, { cache: 'no-store' });
        const manifest = await response.json();
        manifestVersion = manifest.version || '';
    } catch {
        // Cache busting is best effort.
    }
    try {
        const response = await fetch(buildInfoPath, { cache: 'no-store' });
        if (response.ok) {
            const buildInfo = await response.json();
            buildHash = [buildInfo.uiVersion || buildInfo.version || '', buildInfo.hash || buildInfo.build || '']
                .filter(Boolean)
                .join('-');
        }
    } catch {
        // Older installs may not have a build info file yet.
    }
    return [manifestVersion, buildHash].filter(Boolean).join('-');
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
