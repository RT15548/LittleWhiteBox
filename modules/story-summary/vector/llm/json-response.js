// L0 JSON response parsing.
// Strict JSON remains the primary contract. The repair pass only escapes
// unescaped quotes that are unambiguously inside an existing JSON string.

function stripJsonFence(text) {
    return String(text || '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

function getJsonCandidates(text) {
    const source = stripJsonFence(text);
    if (!source) return [];

    const candidates = [source];
    const start = source.indexOf('{');
    const end = source.lastIndexOf('}');
    if (start !== -1 && end > start) {
        const objectCandidate = source.slice(start, end + 1);
        if (objectCandidate !== source) candidates.push(objectCandidate);
    }
    return candidates;
}

function tryParseJson(text) {
    try {
        return { ok: true, value: JSON.parse(text) };
    } catch {
        return { ok: false, value: null };
    }
}

function isStringClosingQuote(source, quoteIndex) {
    let cursor = quoteIndex + 1;
    while (/\s/.test(source[cursor] || '')) cursor += 1;
    if (cursor >= source.length) return true;
    return [':', ',', '}', ']'].includes(source[cursor]);
}

export function repairUnescapedJsonStringQuotes(text) {
    const source = String(text || '');
    let output = '';
    let inString = false;
    let escaped = false;
    let repaired = false;

    for (let index = 0; index < source.length; index += 1) {
        const char = source[index];

        if (!inString) {
            output += char;
            if (char === '"') inString = true;
            continue;
        }

        if (escaped) {
            output += char;
            escaped = false;
            continue;
        }

        if (char === '\\') {
            output += char;
            escaped = true;
            continue;
        }

        if (char !== '"') {
            output += char;
            continue;
        }

        if (isStringClosingQuote(source, index)) {
            output += char;
            inString = false;
            continue;
        }

        output += '\\"';
        repaired = true;
    }

    return repaired ? output : null;
}

export function parseJsonResponse(text) {
    for (const candidate of getJsonCandidates(text)) {
        const strict = tryParseJson(candidate);
        if (strict.ok) return { value: strict.value, repair: null };
    }

    for (const candidate of getJsonCandidates(text)) {
        const repaired = repairUnescapedJsonStringQuotes(candidate);
        if (!repaired) continue;
        const parsed = tryParseJson(repaired);
        if (parsed.ok) return { value: parsed.value, repair: 'unescaped-string-quotes' };
    }

    return null;
}

export function parseJson(text) {
    return parseJsonResponse(text)?.value ?? null;
}
