export const RECENT_CHAT_TURNS = Object.freeze({ preferred: 2, minimum: 1 });

/**
 * Whole-turn archive boundaries, preferred first. Pass only prior turns;
 * the current request and its tool continuation are owned by the caller.
 * Interrupted exchanges do not count as answered turns.
 * @template T
 * @param {ReadonlyArray<T>} turns
 * @param {(turn: T) => boolean} isAnswered
 * @returns {number[]}
 */
export function recentTurnArchiveCounts(turns, isAnswered) {
    const starts = [];
    for (let index = turns.length - 1; index >= 0 && starts.length < RECENT_CHAT_TURNS.preferred; index--) {
        if (isAnswered(turns[index])) starts.push(index);
    }
    return [...new Set([RECENT_CHAT_TURNS.preferred, RECENT_CHAT_TURNS.minimum]
        .map(keep => starts[keep - 1] ?? 0))];
}

/** @param {ReadonlyArray<{ role?: string, content?: unknown, error?: boolean, streaming?: boolean, toolCalls?: unknown[], tool_calls?: unknown[] }>} messages */
export function hasChatAnswer(messages) {
    return messages.some(message => message.role === 'assistant' && !message.error && !message.streaming
        && !message.toolCalls?.length && !message.tool_calls?.length
        && typeof message.content === 'string' && !!message.content.trim());
}
