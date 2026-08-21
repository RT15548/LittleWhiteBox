import { normalizeAliasNameKey } from '../../data/character-aliases.js';

export function normalizeEntityTerm(value) {
    return normalizeAliasNameKey(value);
}

export function extractEntitiesFromText(text, lexicon, displayMap, blockedTerms = []) {
    if (!text || !lexicon?.size) return [];

    const normalizedText = normalizeEntityTerm(text);
    const candidates = [];
    let order = 0;
    for (const raw of lexicon) {
        const term = normalizeEntityTerm(raw);
        if (term) candidates.push({ term, blocked: false, order: order++ });
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
    const hasValidBoundary = (start, term) => {
        const before = normalizedText[start - 1] || '';
        const after = normalizedText[start + term.length] || '';
        if (isAsciiWord(term[0]) && isAsciiWord(before)) return false;
        if (isAsciiWord(term[term.length - 1]) && isAsciiWord(after)) return false;
        return true;
    };

    const hits = [];
    const seenDisplay = new Set();
    for (let index = 0; index < normalizedText.length;) {
        const bucket = candidatesByFirstCharacter.get(normalizedText[index]) || [];
        const match = bucket.find(candidate => (
            normalizedText.startsWith(candidate.term, index)
            && hasValidBoundary(index, candidate.term)
        ));
        if (!match) {
            index++;
            continue;
        }
        index += match.term.length;
        if (match.blocked) continue;

        const display = displayMap?.get(match.term) || match.term;
        const displayKey = normalizeEntityTerm(display);
        if (!displayKey || seenDisplay.has(displayKey)) continue;
        seenDisplay.add(displayKey);
        hits.push(display);
    }

    return hits;
}
