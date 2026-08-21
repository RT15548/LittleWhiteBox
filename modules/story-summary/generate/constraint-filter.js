import { normalizeUserIdentityKey } from '../data/character-aliases.js';
import { isRelationFact, parseRelationTarget } from '../data/fact-predicates.js';

function normalize(value) {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

export function filterConstraintsByRelevance(facts, focusCharacters, knownCharacters, userName = '') {
    if (!facts?.length) return [];

    const focusSet = new Set((focusCharacters || []).map(normalize));
    const userKey = normalizeUserIdentityKey(userName);

    return facts.filter(fact => {
        if (fact._isState === true) return true;

        if (isRelationFact(fact)) {
            const from = normalize(fact.s);
            const target = parseRelationTarget(fact.p);
            const to = target ? normalize(target) : '';
            return focusSet.has(from) || focusSet.has(to);
        }

        const subject = normalize(fact.s);
        if (userKey && normalizeUserIdentityKey(fact.s) === userKey) return true;
        if (knownCharacters.has(subject)) return focusSet.has(subject);
        return true;
    });
}
