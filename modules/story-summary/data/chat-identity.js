// Runtime ownership, not a new storage key: single-chat filenames are only
// unique within a character directory. Keep existing on-disk formats unchanged.
export function getChatIdentity(context) {
    if (!context?.chatId) return null;
    return JSON.stringify(context.groupId != null
        ? ['group', context.groupId, context.chatId]
        : ['character', context.characters?.[context.characterId]?.avatar ?? context.characterId, context.chatId]);
}
