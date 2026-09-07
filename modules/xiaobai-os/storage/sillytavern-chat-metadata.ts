import { getContext } from '../../../../../../extensions.js';
import { getRequestHeaders } from '../../../../../../../script.js';
import { saveSillyTavernChat } from '../host/sillytavern-chat-save.js';
import type { XiaobaiOsChatBindingV1 } from '../kernel/contracts.js';
import {
    readChatMetadataHeader,
    type ChatMetadata,
    type ChatMetadataAdapter,
    type ChatMetadataCapture,
} from './chat-reference.js';

const DEFAULT_TIMEOUT_MS = 0;

type UnknownRecord = Record<string, unknown>;

interface SillyTavernContext {
    chatId?: unknown;
    groupId?: unknown;
    characterId?: unknown;
    characters?: Record<string, { avatar?: unknown; name?: unknown }>;
    chatMetadata?: unknown;
}

interface SillyTavernChatMetadataAdapterOptions {
    fetch?: typeof globalThis.fetch;
    timeoutMs?: number;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function context(): SillyTavernContext {
    return getContext() as unknown as SillyTavernContext;
}

function currentCharacter(source: SillyTavernContext): { avatar: string; name: string } | null {
    const id = source.characterId === null || source.characterId === undefined ? '' : String(source.characterId);
    const character = source.characters?.[id];
    const avatar = typeof character?.avatar === 'string' ? character.avatar : '';
    return avatar ? { avatar, name: String(character?.name || '') } : null;
}

function captureBinding(source: SillyTavernContext): XiaobaiOsChatBindingV1 | null {
    const chatId = typeof source.chatId === 'string' ? source.chatId : '';
    if (!chatId) { return null; }
    const groupId = source.groupId === null || source.groupId === undefined ? '' : String(source.groupId);
    if (groupId) { return { kind: 'group', ownerLocator: groupId, chatId }; }
    const character = currentCharacter(source);
    return character ? { kind: 'character', ownerLocator: character.avatar, chatId } : null;
}

function captureCurrent(): ChatMetadataCapture | null {
    const source = context();
    const binding = captureBinding(source);
    if (!binding || !isRecord(source.chatMetadata)) { return null; }
    const mainChat = source.chatMetadata.main_chat;
    return {
        identityKey: `${binding.kind}:${binding.ownerLocator}:${binding.chatId}`,
        binding,
        metadata: source.chatMetadata,
        ...(typeof mainChat === 'string' && mainChat ? { mainChatId: mainChat } : {}),
    };
}

function createSaveError(code: string, message: string, uncertain: boolean, cause?: unknown): Error {
    return Object.assign(new Error(message, { cause }), { code, uncertain });
}

function matchingCharacter(source: SillyTavernContext, avatar: string): { avatar: string; name: string } | null {
    for (const character of Object.values(source.characters ?? {})) {
        if (character?.avatar === avatar) {
            return { avatar, name: String(character.name || '') };
        }
    }
    return null;
}

export function createSillyTavernChatMetadataAdapter(
    options: SillyTavernChatMetadataAdapterOptions = {},
): ChatMetadataAdapter {
    const request = options.fetch ?? globalThis.fetch.bind(globalThis);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    async function save(captured: ChatMetadataCapture, signal?: AbortSignal): Promise<void> {
        const current = captureCurrent();
        if (
            !current
            || current.identityKey !== captured.identityKey
            || current.metadata !== captured.metadata
        ) {
            throw createSaveError('CHAT_CHANGED', '保存引用前聊天已经切换', false);
        }
        if (signal?.aborted) { throw createSaveError('SAVE_ABORTED', '引用保存已取消', false, signal.reason); }
        const result = await saveSillyTavernChat(() => {
            const now = captureCurrent();
            return now?.identityKey === captured.identityKey && now.metadata === captured.metadata;
        }, signal);
        if (result.status !== 'confirmed') {
            throw createSaveError('SAVE_UNCONFIRMED', '聊天元数据未能确认保存', result.status === 'unconfirmed', result.error);
        }
    }

    async function read(binding: XiaobaiOsChatBindingV1, signal?: AbortSignal): Promise<ChatMetadata | null> {
        const source = context();
        let endpoint: string;
        let body: UnknownRecord;
        if (binding.kind === 'group') {
            endpoint = '/api/chats/group/get';
            body = { id: binding.chatId };
        } else {
            const character = matchingCharacter(source, binding.ownerLocator);
            if (!character) { return null; }
            endpoint = '/api/chats/get';
            body = {
                ch_name: character.name,
                file_name: binding.chatId,
                avatar_url: character.avatar,
            };
        }
        const controller = new AbortController();
        const forwardAbort = () => controller.abort(signal?.reason);
        signal?.addEventListener('abort', forwardAbort, { once: true });
        if (signal?.aborted) { controller.abort(signal.reason); }
        const timer = timeoutMs > 0 ? globalThis.setTimeout(() => controller.abort(), timeoutMs) : undefined;
        try {
            const response = await request(endpoint, {
                method: 'POST',
                headers: getRequestHeaders(),
                body: JSON.stringify(body),
                cache: 'no-store',
                signal: controller.signal,
            });
            if (response.status === 404) { return null; }
            if (!response.ok) { throw new Error(`chat_header_read_http_${response.status}`); }
            const chat: unknown = await response.json();
            return readChatMetadataHeader(chat);
        } finally {
            if (timer !== undefined) { globalThis.clearTimeout(timer); }
            signal?.removeEventListener('abort', forwardAbort);
        }
    }

    return Object.freeze({ capture: captureCurrent, save, read });
}
