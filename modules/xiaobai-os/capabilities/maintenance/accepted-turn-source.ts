import { countAssistantTurns } from './assistant-turn-count.js';

type UnknownRecord = Record<string, unknown>;

const DEFAULT_REBUILD_MESSAGE_LIMIT = 80;
const MAX_PARTICIPANT_NAME_LENGTH = 120;

export interface AcceptedTurnChatSurface {
    readonly identityKey: string;
    readonly messages: readonly unknown[];
    readonly playerName?: string;
    readonly assistantName?: string;
}

export interface NormalizedMessageSnapshot {
    readonly index: number;
    readonly role: 'user' | 'assistant';
    readonly text: string;
    readonly swipeId: number | string | null;
    readonly speakerName: string;
}

export interface AcceptedTurnPlayer {
    readonly actorKey: 'player';
    readonly displayName: string;
}

export interface AcceptedTurnSource {
    readonly chatIdentity: string;
    readonly messages: readonly NormalizedMessageSnapshot[];
    readonly messageCount: number;
    readonly assistantCount: number;
    readonly player: AcceptedTurnPlayer;
    readonly trigger?: NormalizedMessageSnapshot;
}

export type AcceptedTurnCaptureFailureReason =
    | 'chat-unavailable'
    | 'generation-active'
    | 'invalid-message-limit'
    | 'no-complete-assistant'
    | 'no-usable-messages';

export type AcceptedTurnCaptureResult =
    | { readonly ok: true; readonly source: AcceptedTurnSource }
    | { readonly ok: false; readonly reason: AcceptedTurnCaptureFailureReason };

interface NormalizedHostMessage {
    readonly index: number;
    readonly role: 'user' | 'assistant' | 'system';
    readonly text: string;
    readonly swipeId: number | string | null;
    readonly speakerName: string;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isChatSurface(value: unknown): value is AcceptedTurnChatSurface {
    if (!isRecord(value)) { return false; }
    return typeof value.identityKey === 'string' && Array.isArray(value.messages);
}

function readRole(message: UnknownRecord): NormalizedHostMessage['role'] {
    if (message.is_system === true) { return 'system'; }
    if (message.is_user === true) { return 'user'; }
    if (message.role === 'system' || message.role === 'user' || message.role === 'assistant') {
        return message.role;
    }
    return 'assistant';
}

function readText(message: UnknownRecord): string {
    for (const field of ['mes', 'content', 'text']) {
        if (typeof message[field] === 'string') { return message[field]; }
    }
    return '';
}

function readSwipeId(message: UnknownRecord): number | string | null {
    const swipeId = message.swipe_id;
    if (typeof swipeId === 'string') { return swipeId; }
    return typeof swipeId === 'number' && Number.isFinite(swipeId) ? swipeId : null;
}

function normalizeParticipantName(value: unknown, fallback: string): string {
    if (typeof value !== 'string') { return fallback; }
    const normalized = value
        .normalize('NFKC')
        .replace(/[\u0000-\u001f\u007f-\u009f]/gu, ' ')
        .replace(/\s+/gu, ' ')
        .trim();
    return Array.from(normalized).slice(0, MAX_PARTICIPANT_NAME_LENGTH).join('') || fallback;
}

function normalizeSpeakerName(
    value: unknown,
    role: NormalizedHostMessage['role'],
    surface?: AcceptedTurnChatSurface,
): string {
    const message = isRecord(value) ? value : {};
    const raw = normalizeParticipantName(message.name, '');
    if (raw) { return raw; }
    if (role === 'user') { return normalizeParticipantName(surface?.playerName, 'User'); }
    if (role === 'assistant') { return normalizeParticipantName(surface?.assistantName, 'Assistant'); }
    return 'System';
}

function normalizeMessage(
    value: unknown,
    index: number,
    surface?: AcceptedTurnChatSurface,
): NormalizedHostMessage | null {
    if (!isRecord(value)) { return null; }
    const role = readRole(value);
    return {
        index,
        role,
        text: readText(value),
        swipeId: readSwipeId(value),
        speakerName: normalizeSpeakerName(value, role, surface),
    };
}

function hasText(message: NormalizedHostMessage): boolean {
    return message.text.trim().length > 0;
}

function ordinaryMessage(
    value: unknown,
    index: number,
    surface?: AcceptedTurnChatSurface,
): NormalizedMessageSnapshot | null {
    const message = normalizeMessage(value, index, surface);
    if (!message || message.role === 'system' || !hasText(message)) { return null; }
    return Object.freeze({
        index: message.index,
        role: message.role,
        text: message.text,
        swipeId: message.swipeId,
        speakerName: message.speakerName,
    });
}

function createSource(
    surface: AcceptedTurnChatSurface,
    messages: readonly NormalizedMessageSnapshot[],
    trigger?: NormalizedMessageSnapshot,
): AcceptedTurnSource {
    const messageCount = surface.messages.length;
    return Object.freeze({
        chatIdentity: surface.identityKey,
        messages: Object.freeze([...messages]),
        messageCount,
        assistantCount: countAssistantTurns(surface.messages, messageCount),
        player: Object.freeze({
            actorKey: 'player' as const,
            displayName: normalizeParticipantName(surface.playerName, 'User'),
        }),
        ...(trigger ? { trigger } : {}),
    });
}

function success(source: AcceptedTurnSource): AcceptedTurnCaptureResult {
    return Object.freeze({ ok: true, source });
}

function failure(reason: AcceptedTurnCaptureFailureReason): AcceptedTurnCaptureResult {
    return Object.freeze({ ok: false, reason });
}

function captureTrailingTurn(surface: AcceptedTurnChatSurface): readonly NormalizedMessageSnapshot[] | null {
    const accepted: NormalizedMessageSnapshot[] = [];
    let index = surface.messages.length - 1;
    while (index >= 0) {
        const message = ordinaryMessage(surface.messages[index], index, surface);
        if (!message || message.role !== 'assistant') { break; }
        accepted.unshift(message);
        index -= 1;
    }
    if (accepted.length === 0) { return null; }
    const user = ordinaryMessage(surface.messages[index], index, surface);
    if (!user || user.role !== 'user') { return null; }
    accepted.unshift(user);
    return accepted;
}

export function captureAutomaticAcceptedTurn(
    surface: AcceptedTurnChatSurface | null,
    messageIndex: number,
): AcceptedTurnSource | null {
    if (
        !isChatSurface(surface)
        || !Number.isSafeInteger(messageIndex)
        || messageIndex < 0
        || messageIndex !== surface.messages.length - 1
    ) {
        return null;
    }
    const trigger = ordinaryMessage(surface.messages[messageIndex], messageIndex, surface);
    if (!trigger || trigger.role !== 'user') { return null; }

    const accepted: NormalizedMessageSnapshot[] = [];
    let index = messageIndex - 1;
    while (index >= 0) {
        const message = ordinaryMessage(surface.messages[index], index, surface);
        if (!message || message.role !== 'assistant') { break; }
        accepted.unshift(message);
        index -= 1;
    }
    if (accepted.length === 0) { return null; }

    const previous = ordinaryMessage(surface.messages[index], index, surface);
    if (previous?.role === 'user') {
        accepted.unshift(previous);
    } else {
        const hasPreviousUser = surface.messages.slice(0, messageIndex).some((value, previousIndex) => {
            const message = normalizeMessage(value, previousIndex, surface);
            return message?.role === 'user';
        });
        if (hasPreviousUser) { return null; }
    }
    return createSource(surface, accepted, trigger);
}

export function captureManualAcceptedTurn(
    surface: AcceptedTurnChatSurface | null,
    { generationActive }: { readonly generationActive: boolean },
): AcceptedTurnCaptureResult {
    if (generationActive) { return failure('generation-active'); }
    if (!isChatSurface(surface)) { return failure('chat-unavailable'); }
    const messages = captureTrailingTurn(surface);
    return messages ? success(createSource(surface, messages)) : failure('no-complete-assistant');
}

export function captureRebuildSource(
    surface: AcceptedTurnChatSurface | null,
    {
        generationActive,
        maxMessages = DEFAULT_REBUILD_MESSAGE_LIMIT,
    }: { readonly generationActive: boolean; readonly maxMessages?: number },
): AcceptedTurnCaptureResult {
    if (generationActive) { return failure('generation-active'); }
    if (!isChatSurface(surface)) { return failure('chat-unavailable'); }
    if (!Number.isSafeInteger(maxMessages) || maxMessages <= 0) { return failure('invalid-message-limit'); }

    const messages = surface.messages
        .map((value, index) => ordinaryMessage(value, index, surface))
        .filter((message): message is NormalizedMessageSnapshot => message !== null)
        .slice(-maxMessages);
    return messages.length > 0
        ? success(createSource(surface, messages))
        : failure('no-usable-messages');
}

function sameMessage(
    messages: readonly unknown[],
    expected: NormalizedMessageSnapshot,
    boundary: number,
    surface: AcceptedTurnChatSurface,
): boolean {
    if (!Number.isSafeInteger(expected.index) || expected.index < 0 || expected.index >= boundary) { return false; }
    const actual = ordinaryMessage(messages[expected.index], expected.index, surface);
    return !!actual
        && actual.role === expected.role
        && actual.text === expected.text
        && actual.swipeId === expected.swipeId
        && actual.speakerName === expected.speakerName;
}

export function matchesAcceptedTurnSource(
    surface: AcceptedTurnChatSurface | null,
    source: AcceptedTurnSource,
): boolean {
    if (
        !isChatSurface(surface)
        || surface.identityKey !== source.chatIdentity
        || normalizeParticipantName(surface.playerName, 'User') !== source.player.displayName
        || !Number.isSafeInteger(source.messageCount)
        || source.messageCount < 0
    ) {
        return false;
    }
    // Every job owns its captured evidence, not the future tail of the chat.
    if (surface.messages.length < source.messageCount) {
        return false;
    }
    if (
        source.trigger !== undefined
        && (source.trigger?.role !== 'user' || source.trigger.index !== source.messageCount - 1)
    ) {
        return false;
    }
    return source.messages.length > 0
        && source.messages.every(message => sameMessage(surface.messages, message, source.messageCount, surface))
        && (!source.trigger || sameMessage(surface.messages, source.trigger, source.messageCount, surface))
        && countAssistantTurns(surface.messages, source.messageCount) === source.assistantCount;
}
