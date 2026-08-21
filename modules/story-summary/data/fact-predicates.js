export function parseRelationTarget(predicate) {
    const match = String(predicate || '').trim().match(/^对(.+)的/);
    return match?.[1]?.trim() || null;
}

export function isRelationFact(fact) {
    return !!parseRelationTarget(fact?.p);
}
