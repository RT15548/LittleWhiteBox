function splitLines(content = '') {
    return String(content ?? '').replace(/\r\n?/g, '\n').split('\n');
}

function numberLines(lines = [], startLine = 1) {
    return lines.map((line, index) => `${startLine + index}: ${line}`).join('\n');
}

function positiveInteger(value, fallback) {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) && number > 0 ? number : fallback;
}

/**
 * Reads one in-memory text document with the shared Read contract used by
 * Tavern and Ebook. Callers own storage access; this only formats one result
 * window and never retains the original document.
 */
export function readTextFile(content = '', options = {}) {
    const defaultLimit = positiveInteger(options.defaultLimit, 1200);
    const maxLimit = positiveInteger(options.maxLimit, defaultLimit);
    const lines = splitLines(content);
    const tail = Math.floor(Number(options.tail) || 0);
    let startLine = positiveInteger(options.offset, 1);
    let limit = Math.min(maxLimit, positiveInteger(options.limit, defaultLimit));
    if (tail > 0) {
        limit = Math.min(maxLimit, tail);
        startLine = Math.max(1, lines.length - limit + 1);
    }
    const startIndex = Math.max(0, startLine - 1);
    const selected = lines.slice(startIndex, startIndex + limit);
    const nextOffset = startIndex + limit < lines.length ? startIndex + limit + 1 : 0;
    return {
        content: numberLines(selected, startIndex + 1),
        lineStart: startIndex + 1,
        lineEnd: startIndex + selected.length,
        totalLines: lines.length,
        truncated: nextOffset > 0,
        nextOffset,
    };
}
