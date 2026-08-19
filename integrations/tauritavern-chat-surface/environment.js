export const CHAT_SURFACE_PROTOCOL_VERSION = 1;

/**
 * Reads the TauriTavern ownership decision once for the current page.
 * Missing or older host APIs are ordinary static-renderer environments.
 */
export function inspectTauriTavernChatSurface(host = globalThis.window?.__TAURITAVERN__) {
    const api = host?.api?.chatSurface;
    if (typeof api?.isManagedOwnershipRequired !== 'function') {
        return Object.freeze({ managed: false, api: null });
    }

    const managed = api.isManagedOwnershipRequired() === true;
    return Object.freeze({ managed, api: managed ? api : null });
}

const environment = inspectTauriTavernChatSurface();

export function getTauriTavernChatSurfaceEnvironment() {
    return environment;
}

export function isTauriTavernChatSurfaceManaged() {
    return environment.managed;
}
