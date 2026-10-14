/**
 * Buffers a streamed head/tail preview. Retains whole line prefixes, including
 * one extra character so the caller's line formatter can report truncation.
 * A truncated head always contains a newline proving a continuation exists;
 * its last fragment is left for the caller's next page.
 */
export async function readTextPreview(response, { lineLimit, extraLines, charLimit, lineChars, tail, assertCurrent }) {
    const header = response.headers.get('content-length');
    const size = header === null ? null : Number(header);
    const reportedSize = size !== null && Number.isFinite(size) && size >= 0 ? size : null;
    assertCurrent();
    const reader = response.body?.getReader();
    if (!reader) {
        const text = await response.text();
        assertCurrent();
        return { text, truncated: false, sizeBytes: reportedSize ?? new TextEncoder().encode(text).length,
            hasMoreBefore: text.split('\n').length > lineLimit };
    }
    const decoder = new TextDecoder(), lines = [''];
    const lineBudget = lineLimit + extraLines;
    let bufferedChars = 0, decodedChars = 0, newlines = 0, streamedBytes = 0, truncated = false;
    function append(chunk) {
        let start = 0;
        while (start < chunk.length) {
            const newline = chunk.indexOf('\n', start);
            const end = newline < 0 ? chunk.length : newline;
            const last = lines.length - 1;
            const prefix = chunk.slice(start, Math.min(end, start + lineChars + 1 - lines[last].length));
            lines[last] += prefix;
            bufferedChars += prefix.length;
            decodedChars += end - start;
            if (newline >= 0) {
                lines.push('');
                newlines++;
                bufferedChars++;
                decodedChars++;
            }
            if (tail) {
                while (lines.length > 1 && (lines.length > lineBudget || bufferedChars > charLimit)) {
                    bufferedChars -= lines.shift().length + 1;
                    truncated = true;
                }
            } else if (newlines > 0 && (newlines >= lineBudget || decodedChars >= charLimit)) {
                // With no newline yet, keep scanning (not buffering) the long
                // first line until a next line or EOF is actually established.
                truncated = true;
                return true;
            }
            start = end + 1;
        }
        return false;
    }
    try {
        while (true) {
            assertCurrent();
            const { value, done } = await reader.read();
            assertCurrent();
            if (done) { append(decoder.decode()); break; }
            streamedBytes += value.byteLength;
            if (append(decoder.decode(value, { stream: true }))) {
                await reader.cancel();
                assertCurrent();
                break;
            }
        }
    } finally { reader.releaseLock(); }
    return { text: lines.join('\n'), truncated, hasMoreBefore: newlines >= lineLimit,
        sizeBytes: reportedSize ?? (truncated && !tail ? null : streamedBytes) };
}
