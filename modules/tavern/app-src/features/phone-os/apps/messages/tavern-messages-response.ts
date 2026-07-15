export interface TavernPhoneReplyPayload {
    result: 'reply' | 'silent' | 'unavailable';
    messages: string[];
    summary?: string;
}

function normalizeText(value: unknown, limit = 4000): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
}

function findBalancedJsonObjectEnd(text: string, start: number): number {
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < text.length; index += 1) {
        const character = text[index];
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (character === '\\') {
                escaped = true;
            } else if (character === '"') {
                inString = false;
            }
            continue;
        }
        if (character === '"') {
            inString = true;
        } else if (character === '{') {
            depth += 1;
        } else if (character === '}') {
            depth -= 1;
            if (depth === 0) {return index;}
            if (depth < 0) {return -1;}
        }
    }
    return -1;
}

export function extractBalancedJsonObjects(value: unknown): Record<string, unknown>[] {
    const text = String(value || '');
    const objects: Record<string, unknown>[] = [];
    for (let start = 0; start < text.length; start += 1) {
        if (text[start] !== '{') {continue;}
        const end = findBalancedJsonObjectEnd(text, start);
        if (end < 0) {continue;}
        try {
            const parsed = JSON.parse(text.slice(start, end + 1));
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                objects.push(parsed as Record<string, unknown>);
            }
        } catch {
            // Continue scanning for the next complete object.
        }
    }
    return objects;
}

function parseTavernPhoneReplyObject(parsed: Record<string, unknown>): TavernPhoneReplyPayload | null {
    if (parsed.result !== 'reply' && parsed.result !== 'silent' && parsed.result !== 'unavailable') {return null;}
    if (!Array.isArray(parsed.messages) || !parsed.messages.every((item) => typeof item === 'string')) {return null;}
    if (parsed.summary !== undefined && typeof parsed.summary !== 'string') {return null;}
    const result = parsed.result;
    if (result !== 'reply' && parsed.messages.length) {return null;}
    const messages = result === 'reply'
        ? parsed.messages.map((item) => normalizeText(item, 500)).filter(Boolean).slice(0, 3)
        : [];
    if (result === 'reply' && !messages.length) {return null;}
    const normalizedSummary = typeof parsed.summary === 'string' ? normalizeText(parsed.summary, 200) : '';
    return {
        result,
        messages,
        ...(normalizedSummary ? { summary: normalizedSummary } : {}),
    };
}

export function parseTavernPhoneReply(value: unknown): TavernPhoneReplyPayload {
    for (const parsed of extractBalancedJsonObjects(value)) {
        const payload = parseTavernPhoneReplyObject(parsed);
        if (payload) {return payload;}
    }
    throw new Error('对方没有返回符合短信协议的合法 JSON 回复。');
}
