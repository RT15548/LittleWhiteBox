// Chat filenames are scoped to a character/group, not globally unique. Keep
// identity derivation independent of save/readback capabilities.
export function getChatIdentity(ctx) {
    if (ctx?.chatId === undefined || ctx.chatId === null || ctx.chatId === '') return null;
    const group = ctx.groupId !== undefined && ctx.groupId !== null && ctx.groupId !== '';
    const owner = group ? ctx.groupId : ctx.characters?.[ctx.characterId]?.avatar;
    if (owner === undefined || owner === null || owner === '') return null;
    return JSON.stringify([group ? 'group' : 'character', String(owner), String(ctx.chatId)]);
}
