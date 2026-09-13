import type { PrivateMessage } from '../../../domains/messages/types.js';

export const CONTEXT_LIMIT = 158_000;
export const SUMMARY_TRIGGER = 128_000;
/** Visual input varies by model/resolution; reserve rather than count it as zero. */
export const IMAGE_TOKEN_RESERVE = 6_000;

/** Archive a prefix, retaining at least ten bubbles and the last five answered turns. */
export function archivePrefix(history: PrivateMessage[]): PrivateMessage[] {
    const starts: number[] = [];
    const answered: number[] = [];
    let start = -1; let hasReply = false;
    for (let index = 0; index < history.length; index++) {
        if (history[index].sender === 'user') {
            if (start >= 0 && hasReply) {answered.push(start);}
            starts.push(index); start = index; hasReply = false;
        } else if (start >= 0) {hasReply = true;}
    }
    if (start >= 0 && hasReply) {answered.push(start);}
    let end = Math.max(0, history.length - 10);
    if (answered.length) {end = Math.min(end, answered[Math.max(0, answered.length - 5)]);}
    if (start >= 0 && !hasReply) {end = Math.min(end, start);}
    // Do not cut into the turn whose replies fall inside the retained window.
    const turn = starts.filter(index => index <= end).at(-1);
    if (turn !== undefined) {end = turn;}
    return history.slice(0, end);
}
