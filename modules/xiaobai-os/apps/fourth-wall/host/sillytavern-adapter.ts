import { getContext } from '../../../../../../../../extensions.js';
import {
    default_avatar,
    default_user_avatar,
} from '../../../../../../../../../script.js';
import { getSillyTavernChatIdentity } from '../../../host/sillytavern-context.js';
import type {
    FourthWallCapturedCommentary,
    FourthWallChatSnapshot,
    FourthWallCommentaryKind,
} from '../types.js';

type UnknownRecord = Record<string, unknown>;

interface SillyTavernMessage {
    name?: unknown;
    is_user?: boolean;
    mes?: unknown;
}

interface SillyTavernContext {
    characterId?: unknown;
    characters?: Record<string, { avatar?: unknown }>;
    user_avatar?: unknown;
    persona?: { avatar?: unknown };
    name1?: unknown;
    name2?: unknown;
    chat?: SillyTavernMessage[];
}

export interface CommentaryEventInput {
    kind?: string;
    chatId?: unknown;
    messageId?: unknown;
    data?: unknown;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getSillyTavernContext(): SillyTavernContext {
    return getContext() as unknown as SillyTavernContext;
}

function resolveAssetUrl(path: unknown, prefix = ''): string {
    const value = String(path || '');
    if (!value) {return '';}
    if (/^(?:data:|blob:|https?:|\/)/i.test(value)) {return value;}
    const normalized = value.includes('/') || !prefix ? value : `${prefix}/${value}`;
    return `/${normalized
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')}`;
}

function resolveCharacterAvatar(context: SillyTavernContext): string {
    const characterId =
        context.characterId === null || context.characterId === undefined ? '' : String(context.characterId);
    const avatar = typeof context.characters?.[characterId]?.avatar === 'string'
        ? context.characters[characterId].avatar
        : '';
    if (!avatar) {return '';}
    if (/^(?:data:|blob:|https?:|\/)/i.test(avatar)) {return avatar;}
    return `/characters/${avatar
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')}`;
}

function resolveUserAvatar(context: SillyTavernContext): string {
    return resolveAssetUrl(context.user_avatar || context.persona?.avatar || default_user_avatar || '', 'User Avatars');
}

function normalizeMessageIndex(event: unknown, context: SillyTavernContext): number {
    const direct = isRecord(event) ? (event.messageId ?? event.id ?? event.index) : event;
    const parsed = Number(direct);
    if (Number.isInteger(parsed) && parsed >= 0) {return parsed;}
    return context.chat?.length ? context.chat.length - 1 : -1;
}

export function getSillyTavernChatSnapshot(maxLayers = 20): FourthWallChatSnapshot | null {
    const context = getSillyTavernContext();
    const identity = getSillyTavernChatIdentity();
    if (!identity) {return null;}
    return {
        chatIdentity: identity.key,
        userName: String(context.name1 || 'User'),
        characterName: String(context.name2 || 'Assistant'),
        userAvatar: resolveUserAvatar(context),
        characterAvatar: resolveCharacterAvatar(context) || resolveAssetUrl(default_avatar, 'characters'),
        messages: (context.chat || []).slice(-maxLayers).map((message, index) => ({
            index: Math.max(0, (context.chat?.length || 0) - maxLayers) + index,
            name: String(message.name || (message.is_user ? context.name1 : context.name2) || ''),
            isUser: message.is_user === true,
            text: String(message.mes || ''),
        })),
    };
}

export function captureSillyTavernCommentaryEvent(
    event: CommentaryEventInput = {},
): FourthWallCapturedCommentary | null {
    const context = getSillyTavernContext();
    const identity = getSillyTavernChatIdentity();
    if (!identity) {return null;}
    if (event.chatId && String(event.chatId) !== identity.chatId) {return null;}
    const messageIndex = normalizeMessageIndex(event.data ?? event.messageId, context);
    const message = context.chat?.[messageIndex];
    if (!message || !String(message.mes || '').trim()) {return null;}
    let kind = String(event.kind || '') as FourthWallCommentaryKind | 'edited';
    if (kind === 'edited') {kind = message.is_user ? 'edit_own' : 'edit_ai';}
    if (kind !== 'ai_message' && kind !== 'edit_own' && kind !== 'edit_ai') {return null;}
    if (kind === 'ai_message' && message.is_user) {return null;}
    return {
        chatIdentity: identity.key,
        messageIndex,
        text: String(message.mes),
        kind,
        chatSnapshot: getSillyTavernChatSnapshot() as FourthWallChatSnapshot,
    };
}

export function getSillyTavernAfterAiHint(
    data: unknown,
    source: string,
): { chatId: string; messageId: number } | null {
    const context = getSillyTavernContext();
    const identity = getSillyTavernChatIdentity();
    if (!identity || !context.chat?.length) {return null;}
    const direct =
        source === 'generation_ended'
            ? context.chat.length - 1
            : isRecord(data)
              ? (data.messageId ?? data.id ?? data.index)
              : data;
    const messageId = Number(direct);
    if (!Number.isInteger(messageId) || messageId < 0 || context.chat[messageId]?.is_user) {return null;}
    return { chatId: identity.chatId, messageId };
}
