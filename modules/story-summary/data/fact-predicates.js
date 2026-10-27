export const RELATION_TRENDS = Object.freeze(['破裂', '厌恶', '反感', '陌生', '投缘', '亲密', '交融']);
export const FACTS_LIMIT_PER_SUBJECT = 10;

export const factKey = fact => `${fact.s}::${fact.p}`;

export function parseRelationTarget(predicate) {
    const match = String(predicate || '').trim().match(/^对(.+)的/);
    return match?.[1]?.trim() || null;
}

export function isRelationFact(fact) {
    return !!parseRelationTarget(fact?.p);
}
