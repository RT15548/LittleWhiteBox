import { parseEncounterRecords, type EncounterOutcome } from '../domain/encounter.js';
import { readDiceRecords, type DiceChat, type DiceHostMessage } from './message-records.js';

export interface EncounterTarget {
    source: DiceChat;
    message: DiceHostMessage;
    index: number;
    body: string;
    records: unknown;
}
export const isEncounterUser = (message: DiceHostMessage) => message.is_user === true && !message.is_system;

export function captureEncounterTarget(source: DiceChat, index: number): EncounterTarget | null {
    const message = source.chat[index];
    return message && isEncounterUser(message) && typeof message.mes === 'string'
        ? { source, message, index, body: message.mes, records: readDiceRecords(message) } : null;
}

export function isEncounterTargetCurrent(source: DiceChat | null, target: EncounterTarget): boolean {
    return !!source && source.key === target.source.key && source.chat === target.source.chat
        && source.chat[target.index] === target.message && isEncounterUser(target.message) && target.message.mes === target.body;
}

/** Only the first RP reply to this user turn owns the encounter, including its swipes/continuations. */
export function encounterReplyTarget(source: DiceChat, type: string, isAuxiliaryMessage: (message: DiceHostMessage) => boolean): EncounterTarget | null {
    let index = source.chat.length - 1;
    while (index >= 0 && !isEncounterUser(source.chat[index])) { index--; }
    if (index < 0) { return null; }
    const replies = source.chat.slice(index + 1).filter(message => !message.is_user && !message.is_system && !isAuxiliaryMessage(message));
    const follows = type === 'continue' || type === 'swipe';
    if (follows ? replies.length !== 1 || replies[0] !== source.chat.at(-1) : replies.length !== 0) { return null; }
    return captureEncounterTarget(source, index);
}

export function recentEncounterOutcomes(target: EncounterTarget): (EncounterOutcome | undefined)[] {
    return target.source.chat.slice(0, target.index).filter(isEncounterUser).slice(-2).map(message => {
        const value = readDiceRecords(message);
        return value === undefined ? undefined : parseEncounterRecords(value).encounter.outcome;
    });
}
