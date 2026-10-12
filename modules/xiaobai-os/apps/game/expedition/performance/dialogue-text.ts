export type DialogueSegment = { text: string; spoken: boolean };

// Presentation only: keep every character, including delimiters and unmatched quotes.
export function segmentDialogue(text: string): DialogueSegment[] {
    const segments: DialogueSegment[] = [];
    let start = 0;
    for (const match of text.matchAll(/「[^」]*」|『[^』]*』|“[^”]*”|"[^"]*"/g)) {
        if (match.index > start) { segments.push({ text: text.slice(start, match.index), spoken: false }); }
        segments.push({ text: match[0], spoken: true });
        start = match.index + match[0].length;
    }
    if (start < text.length) { segments.push({ text: text.slice(start), spoken: false }); }
    return segments;
}
