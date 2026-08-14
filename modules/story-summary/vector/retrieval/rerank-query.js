// Rerank query composition is bounded here, before the transport layer.
// Short queries stay byte-for-byte identical; long queries keep the focus
// first and spend the remaining budget on the nearest context.

export const RERANK_QUERY_MAX_CHARS = 2048;

function trimToTail(text, maxChars) {
    if (text.length <= maxChars) return text;
    if (maxChars <= 0) return '';
    if (maxChars === 1) return '…';

    let tail = text.slice(-(maxChars - 1));
    // Do not leave a dangling low surrogate when the UTF-16 slice starts
    // inside an astral character.
    if (/^[\uDC00-\uDFFF]/.test(tail)) tail = tail.slice(1);
    return `…${tail}`;
}

/**
 * Compose the natural-language query sent to the cross-encoder.
 *
 * @param {string} focusText - Current user focus, including speaker prefix.
 * @param {string[]} contextTexts - Context in chronological order.
 * @param {number} maxChars - Provider-safe UTF-16 character ceiling.
 * @returns {string}
 */
export function buildBoundedRerankQuery(
    focusText,
    contextTexts,
    maxChars = RERANK_QUERY_MAX_CHARS,
) {
    const limit = Math.max(1, Math.trunc(Number(maxChars) || RERANK_QUERY_MAX_CHARS));
    const focus = String(focusText || '').trim();
    const context = (contextTexts || [])
        .map(text => String(text || '').trim())
        .filter(Boolean);
    const full = [focus, ...context].filter(Boolean).join('\n');

    if (full.length <= limit) return full;
    if (focus.length >= limit) return trimToTail(focus, limit);

    // Walk newest -> oldest so a distant oversized message cannot evict the
    // context closest to the current focus. Output remains chronological.
    let selected = [];
    for (let index = context.length - 1; index >= 0; index--) {
        const withWholeLine = [focus, context[index], ...selected].filter(Boolean).join('\n');
        if (withWholeLine.length <= limit) {
            selected = [context[index], ...selected];
            continue;
        }

        const fixedLines = [focus, ...selected].filter(Boolean);
        const separatorCount = fixedLines.length;
        const fixedChars = fixedLines.reduce((sum, line) => sum + line.length, 0);
        const available = limit - fixedChars - separatorCount;
        const fragment = trimToTail(context[index], available);
        if (fragment) selected = [fragment, ...selected];
        break;
    }

    return [focus, ...selected].filter(Boolean).join('\n');
}
