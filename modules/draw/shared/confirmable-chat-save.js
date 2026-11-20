import { getChatIdentity } from './chat-identity.js';

// Frozen chat identity for released journal/cancellation records. These fields
// locate the original chat for recovery and explicit bulk removal readback.
export function createConfirmableChatTarget(ctx) {
    const chatId = String(ctx?.chatId || '');
    if (!chatId) throw new TypeError('Current chat has no persistent identity');
    if (ctx.groupId !== undefined && ctx.groupId !== null && String(ctx.groupId)) {
        return Object.freeze({ kind: 'group', chatId, identity: getChatIdentity(ctx),
            endpoint: '/api/chats/group/get', body: Object.freeze({ id: chatId }) });
    }
    const character = ctx.characters?.[ctx.characterId];
    if (!character?.avatar) throw new TypeError('Current character chat has no persistent identity');
    return Object.freeze({ kind: 'character', chatId, identity: getChatIdentity(ctx),
        endpoint: '/api/chats/get', body: Object.freeze({
            ch_name: String(character.name || ''), file_name: chatId, avatar_url: String(character.avatar),
        }) });
}

export async function readSavedChatRows(target, headers) {
    const response = await fetch(target.endpoint, { method: 'POST', headers, body: JSON.stringify(target.body) });
    if (!response.ok) throw new Error(`Chat read failed (HTTP ${response.status})`);
    return response.json();
}

export async function readSavedChatBranch(target, headers, messageId, swipe) {
    return savedChatBranch(await readSavedChatRows(target, headers), messageId, swipe);
}

export function savedChatBranch(rows, messageId, swipe) {
    const saved = Array.isArray(rows) && rows[messageId + (rows[0] && 'chat_metadata' in rows[0] ? 1 : 0)];
    if (!saved) return null;
    return (saved.swipe_id ?? 0) === swipe ? saved
        : { mes: saved.swipes?.[swipe], extra: saved.swipe_info?.[swipe]?.extra };
}

// Only in-page mutations of the same chat are serialized. There is no network
// I/O, Web Lock or persistent lock in this queue.
const mutations = new Map();
export async function withConfirmableChatMutation(ctx, task) {
    const identity = getChatIdentity(ctx);
    if (!identity) throw new TypeError('chat mutation requires a persistent chat id');
    const previous = mutations.get(identity) || Promise.resolve();
    const current = previous.then(task, task);
    mutations.set(identity, current);
    try { return await current; }
    finally { if (mutations.get(identity) === current) mutations.delete(identity); }
}
