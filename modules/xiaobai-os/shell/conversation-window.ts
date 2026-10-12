/** Mounted chat messages, not stored history or model context. Each speaker counts once. */
export const CONVERSATION_WINDOW = Object.freeze({ recent: 10, maximum: 30 });

export interface ConversationRange { start: number; end: number }
/** A live tail is independent of scroll-following; only an older page has a fixed end. */
export interface ConversationSelection { start: number; end: number | null }

export function conversationRange(selected: ConversationSelection | null | undefined, count: number): ConversationRange {
    const end = Math.min(selected?.end ?? count, count);
    return { start: Math.max(0, end - CONVERSATION_WINDOW.maximum, Math.min(selected?.start ?? end - CONVERSATION_WINDOW.recent, end - 1)), end };
}
