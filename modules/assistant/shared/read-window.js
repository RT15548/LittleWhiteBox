export const MAX_READ_RETURN_CHARS = 50 * 1024;
export const MAX_READ_LINE_CHARS = 2000;
const READ_LINE_TRUNCATION_SUFFIX = `... (line truncated to ${MAX_READ_LINE_CHARS} chars)`;

export function truncateReadLine(line = '') {
    const text = String(line ?? '');
    return text.length <= MAX_READ_LINE_CHARS
        ? text
        : `${text.slice(0, MAX_READ_LINE_CHARS)}${READ_LINE_TRUNCATION_SUFFIX}`;
}

export function headPreviewLines(preview) {
    const lines = preview.text === '' ? [] : preview.text.split('\n');
    // The last fragment of a cancelled stream is not a complete line. Leave it
    // for nextOffset; a single oversized line already exceeds the display cap.
    if (preview.truncated && lines.length > 1) lines.pop();
    return lines;
}

export function sliceLinesWithBudget(lines, startLine, requestedEndLine, options = {}) {
    const selected = [];
    const lastLine = Math.min(Math.max(startLine, requestedEndLine), lines.length);
    const width = String(Math.max(lines.length, startLine)).length;
    let totalChars = 0;
    let charLimited = false;

    for (let index = 0; index <= lastLine - startLine; index += 1) {
        const lineNumber = options.fromEnd ? lastLine - index : startLine + index;
        const line = truncateReadLine(lines[lineNumber - 1]);
        const formatted = options.numbered === false ? line : `${String(lineNumber).padStart(width, ' ')}\t${line}`;
        const addition = formatted.length + (selected.length ? 1 : 0);
        if (selected.length && totalChars + addition > MAX_READ_RETURN_CHARS) {
            charLimited = true;
            break;
        }
        selected.push(formatted);
        totalChars += addition;
    }

    if (options.fromEnd) selected.reverse();
    const firstLine = options.fromEnd ? lastLine - selected.length + 1 : startLine;
    return {
        content: selected.join('\n'),
        startLine: firstLine,
        endLine: lines.length ? firstLine + selected.length - 1 : 0,
        returnedLines: selected.length,
        charLimited,
    };
}
