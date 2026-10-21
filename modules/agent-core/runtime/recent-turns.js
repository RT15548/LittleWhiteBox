const PREFERRED_RECENT_CHAT_TURNS = 2;

/**
 * Whole-turn archive boundaries, preferred first. Pass only prior turns;
 * the current request and its tool continuation are owned by the caller.
 * Recent answers are a preference, not a floor: all prior turns may become
 * summary material, including interrupted exchanges after the latest answer.
 * @template T
 * @param {ReadonlyArray<T>} turns
 * @param {(turn: T) => boolean} isAnswered
 * @returns {number[]}
 */
export function recentTurnArchiveCounts(turns, isAnswered) {
    const starts = [];
    for (let index = turns.length - 1; index >= 0 && starts.length < PREFERRED_RECENT_CHAT_TURNS; index--) {
        if (isAnswered(turns[index])) starts.push(index);
    }
    const boundaries = [];
    for (let keep = PREFERRED_RECENT_CHAT_TURNS; keep > 0; keep--) boundaries.push(starts[keep - 1] ?? 0);
    return [...new Set([...boundaries, turns.length])];
}

/** @param {ReadonlyArray<{ role?: string, content?: unknown, error?: boolean, streaming?: boolean, toolCalls?: unknown[], tool_calls?: unknown[] }>} messages */
export function hasChatAnswer(messages) {
    return messages.some(message => message.role === 'assistant' && !message.error && !message.streaming
        && !message.toolCalls?.length && !message.tool_calls?.length
        && typeof message.content === 'string' && !!message.content.trim());
}
