// A prose projection, not an HTML sanitizer. Keep source records and tag
// contents intact; separators prevent adjacent tagged words from concatenating.
export function stripMarkupTags(text) {
    return String(text || '').replace(
        /<\/?[\p{L}_][\p{L}\p{N}_.:-]*(?:\s+[\p{L}_:][\p{L}\p{N}_.:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/gu,
        ' ',
    );
}
