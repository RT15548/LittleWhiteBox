import { createFactIdAllocator } from './fact-identity.js';
import { factKey } from './fact-predicates.js';

export function mergeEditedFactsWithTimestamps(existingFacts, editedFacts, floorHint = 0) {
    const currentFacts = Array.isArray(existingFacts) ? existingFacts : [];
    const incomingFacts = Array.isArray(editedFacts) ? editedFacts : [];
    const oldMap = new Map(currentFacts.map(f => [factKey({
        s: String(f?.s || '').trim(), p: String(f?.p || '').trim(),
    }), f]));
    const allocate = createFactIdAllocator(currentFacts);
    const merged = [];

    for (const fact of incomingFacts) {
        const s = String(fact?.s || '').trim();
        const p = String(fact?.p || '').trim();
        const o = String(fact?.o || '').trim();
        if (!s || !p || !o) continue;

        const oldFact = oldMap.get(factKey({ s, p }));
        const out = {
            id: oldFact?.id || allocate(),
            s, p, o,
            since: oldFact?.since ?? fact?.since ?? floorHint,
            _addedAt: oldFact?._addedAt ?? fact?._addedAt ?? floorHint,
        };
        if (oldFact?._isState != null) out._isState = oldFact._isState;
        const trend = fact?.trend ?? oldFact?.trend;
        if (trend != null && String(trend).trim()) out.trend = String(trend).trim();
        merged.push(out);
    }
    return merged;
}
