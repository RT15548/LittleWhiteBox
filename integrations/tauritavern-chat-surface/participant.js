import { CHAT_SURFACE_PROTOCOL_VERSION } from './environment.js';

export const LITTLEWHITEBOX_PARTICIPANT_ID = 'littlewhitebox/message-runtime';

export function getUnsupportedManagedFeatures({
    settings,
    hasActiveCustomTemplate,
    isDrawProviderActive,
}) {
    if (!settings.enabled) return [];

    return [
        ['immersive mode', settings.immersive?.enabled],
        ['message preview/purge', settings.preview?.enabled],
        ['story-outline floor tools', settings.storyOutline?.enabled],
        ['TTS floor tools', settings.tts?.enabled],
        ['fourth-wall floor tools', settings.fourthWall?.enabled],
        ['draw provider', isDrawProviderActive()],
        ['custom template iframe', hasActiveCustomTemplate()],
    ].filter(([, enabled]) => enabled).map(([name]) => name);
}

export function registerTauriTavernChatSurfaceParticipant({
    environment,
    settings,
    hasActiveCustomTemplate,
    isDrawProviderActive,
    prepareContent,
    didMount,
}) {
    if (!environment.managed) return null;

    const unsupported = getUnsupportedManagedFeatures({
        settings,
        hasActiveCustomTemplate,
        isDrawProviderActive,
    });
    if (unsupported.length > 0) {
        throw new Error(`LittleWhiteBox bounded ChatSurface does not support: ${unsupported.join(', ')}`);
    }

    const api = environment.api;
    if (api?.protocolVersion !== CHAT_SURFACE_PROTOCOL_VERSION || typeof api.registerParticipant !== 'function') {
        throw new Error(`TauriTavern ChatSurface participant v${CHAT_SURFACE_PROTOCOL_VERSION} API is unavailable`);
    }

    return api.registerParticipant({
        id: LITTLEWHITEBOX_PARTICIPANT_ID,
        protocolVersion: CHAT_SURFACE_PROTOCOL_VERSION,
        prepareContent,
        didMount,
    });
}
