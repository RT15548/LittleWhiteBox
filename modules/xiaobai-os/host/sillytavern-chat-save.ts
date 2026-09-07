import { getContext } from '../../../../../../extensions.js';
import { cancelDebouncedChatSave, getRequestHeaders, isChatSaving } from '../../../../../../../script.js';

interface ChatSource {
    chat: unknown[];
    chatId: string;
    chatMetadata: Record<string, unknown>;
    groupId?: string;
    characterId?: string;
    characters: Record<string, { name: string; avatar: string; date_last_chat?: number }>;
    groups: { id: string; date_last_chat?: number }[];
}

export type ChatSaveResult = { status: 'confirmed' }
    | { status: 'failed' | 'unconfirmed'; error: Error };

let queue: Promise<unknown> = Promise.resolve();

/** Native HTTP protocol, with an observable acknowledgement instead of saveChat's swallowed errors. */
export function saveSillyTavernChat(guard: () => boolean, signal?: AbortSignal): Promise<ChatSaveResult> {
    const source = getContext() as unknown as ChatSource;
    const current = () => {
        const now = getContext() as unknown as ChatSource;
        return guard() && !signal?.aborted && now.chat === source.chat && now.chatId === source.chatId
            && now.groupId === source.groupId && now.characterId === source.characterId
            && now.chatMetadata === source.chatMetadata;
    };
    const run = async (): Promise<ChatSaveResult> => {
        if (!current()) { return { status: 'failed', error: new Error('chat_changed') }; }
        if (isChatSaving) { return { status: 'failed', error: new Error('chat_save_busy') }; }
        const character = source.characters[String(source.characterId)];
        if (!source.chatId || (!source.groupId && !character?.avatar)) {
            return { status: 'failed', error: new Error('chat_unavailable') };
        }
        let request: RequestInit;
        try {
            // Serialize once and dispatch without an async gap or optional host compression dependency.
            const chat = [{ chat_metadata: source.chatMetadata, user_name: 'unused', character_name: 'unused' }, ...source.chat];
            const body = source.groupId ? { id: source.chatId, chat, force: false }
                : { ch_name: character.name, file_name: source.chatId, avatar_url: character.avatar, chat, force: false };
            request = { method: 'POST', cache: 'no-cache', headers: getRequestHeaders(), body: JSON.stringify(body) };
        } catch (cause) {
            return { status: 'failed', error: new Error('chat_save_invalid', { cause }) };
        }
        if (!current() || isChatSaving) { return { status: 'failed', error: new Error('chat_changed') }; }
        cancelDebouncedChatSave();
        const owner = source.groupId ? source.groups?.find(group => String(group.id) === String(source.groupId)) : character;
        if (owner) { owner.date_last_chat = Date.now(); }
        try {
            // Once dispatched, closing the APP must not cancel or resend the write.
            const response = await fetch(source.groupId ? '/api/chats/group/save' : '/api/chats/save', request);
            if (response.ok) {
                const acknowledgement: unknown = await response.json();
                if (acknowledgement && typeof acknowledgement === 'object' && 'ok' in acknowledgement && acknowledgement.ok === true) {
                    return { status: 'confirmed' };
                }
                return { status: 'unconfirmed', error: new Error('chat_save_ack_invalid') };
            }
            const definite = response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429;
            return { status: definite ? 'failed' : 'unconfirmed', error: new Error(`chat_save_http_${response.status}`) };
        } catch (cause) {
            return { status: 'unconfirmed', error: new Error('chat_save_unconfirmed', { cause }) };
        }
    };
    const result = queue.then(run, run);
    queue = result.catch(() => undefined);
    return result;
}
