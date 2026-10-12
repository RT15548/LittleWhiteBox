export function createFactIdAllocator(facts = []) {
    let next = 1;
    for (const fact of facts) {
        const match = String(fact.id || '').match(/^f-(\d+)$/);
        if (match) next = Math.max(next, Number(match[1]) + 1);
    }
    return () => `f-${next++}`;
}

// Import creates a new baseline, so missing/duplicate identities can be assigned
// here without rewriting IDs referenced by an existing chat's undo history.
export function assignImportedFactIds(facts = []) {
    const allocate = createFactIdAllocator(facts);
    const used = new Set();
    return facts.map(fact => {
        let id = String(fact.id || '').trim();
        if (!id || used.has(id)) id = allocate();
        used.add(id);
        return { ...fact, id };
    });
}
