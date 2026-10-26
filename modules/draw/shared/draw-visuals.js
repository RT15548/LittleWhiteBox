import { extensionFolderPath } from '../../../core/constants.js';
import { ensureDrawTheme } from './theme-switch.js';

// Settings and chat controls load the same draw-owned palette and SVG catalog.
export function ensureDrawVisuals() {
    ensureDrawTheme({ document });
    for (const file of ['draw-theme', 'settings-icons']) {
        const id = `xb-${file}`;
        if (document.getElementById(id)) continue;
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `/${encodeURI(extensionFolderPath)}/modules/draw/shared/${file}.css`;
        document.head.appendChild(link);
    }
}

// Names are internal SVG catalog keys, never user-provided markup.
export function drawIconHtml(name) {
    return `<i class="draw-icon fa-solid fa-${name}" aria-hidden="true"></i>`;
}

export function createDrawIcon(name, className = '') {
    const icon = document.createElement('i');
    icon.className = `draw-icon fa-solid fa-${name} ${className}`;
    icon.setAttribute('aria-hidden', 'true');
    return icon;
}
