import type { FourthWallSession } from '../types.js';

export const MAIN_CHAT_DEFAULT = 20;
export const CONTEXT_LIMIT = 158_000;
export const SUMMARY_TRIGGER = 128_000;
export const SUMMARY_OUTPUT_LIMIT = 10_000;
export const HISTORY_PAGE_SIZE = 20;
export const HISTORY_WINDOW_LIMIT = 60;

/** Exclusive boundary: archive only a prefix, never part of a retained conversation. */
export function getArchiveEnd(session: FourthWallSession): number {
    const history = session.history;
    const completedStarts: number[] = [];
    let userStart = -1;
    let answered = false;
    for (let index = session.archivedCount; index < history.length; index++) {
        const message = history[index];
        if (message.role === 'user') {
            if (userStart >= 0 && answered) { completedStarts.push(userStart); }
            userStart = index;
            answered = false;
        } else if (userStart >= 0 && message.type !== 'commentary') {
            answered = true;
        }
    }
    if (userStart >= 0 && answered) { completedStarts.push(userStart); }
    const pending = userStart >= 0 && !answered ? userStart : history.length;
    let boundary = Math.max(session.archivedCount, pending - 10);
    if (completedStarts.length) {
        boundary = Math.min(boundary, completedStarts[Math.max(0, completedStarts.length - 5)]);
    }
    return Math.max(session.archivedCount, boundary);
}
