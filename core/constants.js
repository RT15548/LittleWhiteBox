/**
 * LittleWhiteBox 共享常量
 */

export const EXT_ID = "LittleWhiteBox";
export const EXT_NAME = "小白X";
export const EXT_FOLDER_ID = (() => {
    try {
        const url = new URL(import.meta.url);
        const match = url.pathname.match(/\/scripts\/extensions\/third-party\/([^/]+)\//);
        return match?.[1] ? decodeURIComponent(match[1]) : EXT_ID;
    } catch {
        return EXT_ID;
    }
})();
export const extensionFolderPath = `scripts/extensions/third-party/${EXT_FOLDER_ID}`;

// Read once before any legacy renderer/observer can start.
export const MANAGED_CHAT_SURFACE = (() => {
    const host = globalThis.window?.__TAURITAVERN__;
    if (!host) return false;
    const api = host.api?.chatSurface;
    if (typeof api?.isManagedOwnershipRequired !== 'function') {
        throw new Error('TauriTavern ChatSurface ownership query is unavailable');
    }
    const required = api.isManagedOwnershipRequired();
    if (typeof required !== 'boolean') {
        throw new TypeError('ChatSurface ownership query must return a boolean');
    }
    return required;
})();
