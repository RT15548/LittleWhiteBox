import { normalizeAliasNameKey } from '../../data/character-aliases.js';

export function normalizeEntityTerm(value) {
    return normalizeAliasNameKey(value);
}

// Both query ownership and lexical tokenization consume these same spans.
// Offsets belong ONLY to the returned normalized text, never to the source.
export function createEntityMatcher(lexicon = new Set(), displayMap = new Map(), blockedTerms = []) {
    const candidates = [];
    const terms = new Map();
    let order = 0;
    for (const raw of lexicon) {
        const term = normalizeEntityTerm(raw);
        if (!term || terms.has(term)) continue;
        const display = displayMap?.get(term) || String(raw);
        terms.set(term, display);
        candidates.push({
            term, display, blocked: false, order: order++,
            surface: normalizeEntityTerm(display) === term ? display : String(raw),
        });
    }
    for (const raw of blockedTerms || []) {
        const term = normalizeEntityTerm(raw);
        if (term) candidates.push({ term, blocked: true, order: order++ });
    }
    candidates.sort((a, b) => (
        b.term.length - a.term.length
        || Number(b.blocked) - Number(a.blocked)
        || a.order - b.order
    ));
    const candidatesByFirstCharacter = new Map();
    for (const candidate of candidates) {
        const firstCharacter = candidate.term[0];
        const bucket = candidatesByFirstCharacter.get(firstCharacter) || [];
        bucket.push(candidate);
        candidatesByFirstCharacter.set(firstCharacter, bucket);
    }

    const isAsciiWord = char => /[a-z0-9_]/i.test(char || '');
    const hasValidBoundary = (normalizedText, start, term) => {
        const before = normalizedText[start - 1] || '';
        const after = normalizedText[start + term.length] || '';
        if (isAsciiWord(term[0]) && isAsciiWord(before)) return false;
        if (isAsciiWord(term[term.length - 1]) && isAsciiWord(after)) return false;
        return true;
    };

    return {
        terms,
        blockedTerms: [...new Set(blockedTerms.map(normalizeEntityTerm).filter(Boolean))].sort(),
        match(text) {
            const normalizedText = normalizeEntityTerm(text);
            const spans = [];
            for (let index = 0; index < normalizedText.length;) {
                const bucket = candidatesByFirstCharacter.get(normalizedText[index]) || [];
                const match = bucket.find(candidate => (
                    normalizedText.startsWith(candidate.term, index)
                    && hasValidBoundary(normalizedText, index, candidate.term)
                ));
                if (!match) {
                    index++;
                    continue;
                }
                spans.push({ ...match, start: index, end: index + match.term.length });
                index += match.term.length;
            }
            return { text: normalizedText, spans };
        },
        extractEntities(text) {
            return extractEntitiesFromSpans(this.match(text).spans);
        },
    };
}

export function extractEntitiesFromText(text, lexicon, displayMap, blockedTerms = []) {
    if (!text || !lexicon?.size) return [];
    return createEntityMatcher(lexicon, displayMap, blockedTerms).extractEntities(text);
}

function extractEntitiesFromSpans(spans) {
    const hits = [];
    const seenDisplay = new Set();
    for (const match of spans) {
        if (match.blocked) continue;
        const display = match.display;
        const displayKey = normalizeEntityTerm(display);
        if (!displayKey || seenDisplay.has(displayKey)) continue;
        seenDisplay.add(displayKey);
        hits.push(display);
    }

    return hits;
}
