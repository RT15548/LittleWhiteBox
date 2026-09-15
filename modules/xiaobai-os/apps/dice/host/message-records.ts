import { DICE_MESSAGE_KEY, parseDiceRecords } from '../domain/check-records.js';
import { stripCheckMarkers } from '../domain/check-marker.js';
import type { DiceCandidate } from '../application/action-check-session.js';
export type { DiceCandidate } from '../application/action-check-session.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';

export interface DiceHostMessage {
    mes: string;
    name?: string;
    is_user?: boolean;
    is_system?: boolean;
    extra?: Record<string, unknown>;
    swipe_id?: number;
    swipes?: string[];
    swipe_info?: { extra?: Record<string, unknown>; [key: string]: unknown }[];
    [key: string]: unknown;
}

export interface DiceChat {
    key: string;
    chat: DiceHostMessage[];
    chatId: string;
    groupId?: string;
    characterId: number;
    characterName: string;
    avatar: string;
}

export interface DiceTarget {
    source: DiceChat;
    message: DiceHostMessage;
    index: number;
    swipe: number;
    body: string;
    records: unknown;
    generatedFrom: number;
}

export function readDiceRecords(message: DiceHostMessage): unknown {
    return message.extra?.[DICE_MESSAGE_KEY];
}

export function captureDiceTarget(source: DiceChat, index: number, generatedFrom: number): DiceTarget | null {
    const message = source.chat[index];
    if (!message || message.is_user || message.is_system || typeof message.mes !== 'string') { return null; }
    return { source, message, index, swipe: message.swipe_id ?? 0, body: message.mes,
        records: structuredClone(readDiceRecords(message)), generatedFrom };
}

export function isDiceTargetCurrent(source: DiceChat | null, target: DiceTarget, body = target.body): boolean {
    return !!source && source.key === target.source.key && source.chat === target.source.chat
        && source.chat.length === target.index + 1 && source.chat[target.index] === target.message
        && (target.message.swipe_id ?? 0) === target.swipe && target.message.mes === body;
}

function writeRecords(message: { extra?: Record<string, unknown> }, records: unknown): void {
    if (records === undefined) {
        if (message.extra) { delete message.extra[DICE_MESSAGE_KEY]; }
    } else {
        message.extra ??= {};
        message.extra[DICE_MESSAGE_KEY] = structuredClone(records);
    }
}

/** Only the active candidate is touched; unrelated extra and all other swipes keep their identity. */
export function stageDiceCandidate(target: DiceTarget, candidate: DiceCandidate): () => void {
    const message = target.message;
    const swipeInfo = message.swipe_info?.[target.swipe];
    const previousSwipeBody = message.swipes?.[target.swipe];
    const previousSwipeRecords = structuredClone(swipeInfo?.extra?.[DICE_MESSAGE_KEY]);
    message.mes = candidate.body;
    writeRecords(message, candidate.records);
    if (message.swipes) { message.swipes[target.swipe] = candidate.body; }
    if (swipeInfo) { writeRecords(swipeInfo, candidate.records); }
    return () => {
        // Never restore a whole-chat snapshot or overwrite concurrent edits/other extension fields.
        if ((message.swipe_id ?? 0) === target.swipe && jsonValuesEqual(readDiceRecords(message), candidate.records)) {
            writeRecords(message, target.records);
            if (message.mes === candidate.body) { message.mes = target.body; }
        }
        if (swipeInfo && jsonValuesEqual(swipeInfo.extra?.[DICE_MESSAGE_KEY], candidate.records)) {
            writeRecords(swipeInfo, previousSwipeRecords);
        }
        if (message.swipes?.[target.swipe] === candidate.body && previousSwipeBody !== undefined) {
            message.swipes[target.swipe] = previousSwipeBody;
        }
    };
}

export function candidateMatchesDisk(value: unknown, target: DiceTarget, candidate: { body: string; records: unknown }): boolean {
    if (!value || typeof value !== 'object') { return false; }
    const message = value as DiceHostMessage;
    if (message.is_user || message.is_system || message.mes !== candidate.body
        || (message.swipe_id ?? 0) !== target.swipe || message.name !== target.message.name
        || !jsonValuesEqual(readDiceRecords(message), candidate.records)) { return false; }
    if (target.message.swipes && message.swipes?.[target.swipe] !== candidate.body) { return false; }
    if (target.message.swipe_info?.[target.swipe]
        && !jsonValuesEqual(message.swipe_info?.[target.swipe]?.extra?.[DICE_MESSAGE_KEY], candidate.records)) { return false; }
    return true;
}

/** Called only for a newly generated swipe, after the host has copied the previous extra. */
export function clearNewDiceSwipe(message: DiceHostMessage): void {
    writeRecords(message, undefined);
    const info = message.swipe_info?.[message.swipe_id ?? 0];
    if (info) { writeRecords(info, undefined); }
}

export function clearDiceMessageData(messages: DiceHostMessage[]): Set<DiceHostMessage> {
    const changed = new Set<DiceHostMessage>();
    const ownedIds = (value: unknown) => {
        try { return new Set(parseDiceRecords(value).checks.map(record => record.id)); }
        catch { return new Set<string>(); }
    };
    const clearDisplay = (extra: Record<string, unknown> | undefined, ids: ReadonlySet<string>): boolean => {
        if (typeof extra?.display_text !== 'string') { return false; }
        const text = stripCheckMarkers(extra.display_text, ids);
        if (text === extra.display_text) { return false; }
        extra.display_text = text;
        return true;
    };
    for (const message of messages) {
        const currentIds = ownedIds(readDiceRecords(message));
        const body = stripCheckMarkers(message.mes, currentIds);
        if (body !== message.mes) { message.mes = body; changed.add(message); }
        if (clearDisplay(message.extra, currentIds)) { changed.add(message); }
        if (message.swipes) {
            message.swipes = message.swipes.map((text, index) => stripCheckMarkers(text,
                index === (message.swipe_id ?? 0) ? currentIds : ownedIds(message.swipe_info?.[index]?.extra?.[DICE_MESSAGE_KEY])));
        }
        writeRecords(message, undefined);
        for (const [index, info] of (message.swipe_info ?? []).entries()) {
            if (!info) { continue; }
            clearDisplay(info.extra, index === (message.swipe_id ?? 0) ? currentIds : ownedIds(info.extra?.[DICE_MESSAGE_KEY]));
            writeRecords(info, undefined);
        }
    }
    return changed;
}
