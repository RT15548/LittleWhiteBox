export const STORY_SUMMARY_CHAT_ENABLED_KEY = "storySummaryEnabled";

export function getChatStorySummaryEnabled(chatMetadata, extensionId) {
    if (!chatMetadata || typeof chatMetadata !== "object") return true;
    const extensionMetadata = chatMetadata.extensions?.[extensionId];
    return extensionMetadata?.[STORY_SUMMARY_CHAT_ENABLED_KEY] !== false;
}

export function setChatStorySummaryEnabled(chatMetadata, extensionId, enabled) {
    if (!chatMetadata || typeof chatMetadata !== "object") {
        throw new TypeError("chatMetadata must be an object");
    }
    chatMetadata.extensions ||= {};
    chatMetadata.extensions[extensionId] ||= {};
    chatMetadata.extensions[extensionId][STORY_SUMMARY_CHAT_ENABLED_KEY] = Boolean(enabled);
    return chatMetadata.extensions[extensionId][STORY_SUMMARY_CHAT_ENABLED_KEY];
}

export function resolveStorySummaryEnabled(globalEnabled, chatEnabled) {
    return Boolean(globalEnabled) && chatEnabled !== false;
}
