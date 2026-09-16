function cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        nA += a[i] * a[i];
        nB += b[i] * b[i];
    }
    return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}

/** L2 MMR in input tie order; all diversity state belongs to this selection. */
export function selectDiverseEvents(candidates, capacity, lambda) {
    const selected = [];
    const selectedIds = new Set();
    const maxSimilarity = new Float64Array(candidates.length);

    while (selected.length < capacity && candidates.length) {
        const last = selected[selected.length - 1];
        let best = null;
        let bestScore = -Infinity;
        for (let i = 0; i < candidates.length; i++) {
            const candidate = candidates[i];
            if (selectedIds.has(candidate._id)) continue;
            // The previous maximum already covers every earlier selection.
            // Compare only the newest event; never recompute an earlier pair.
            if (last && candidate.vector?.length) {
                const similarity = cosineSimilarity(candidate.vector, last.vector);
                if (similarity > maxSimilarity[i]) maxSimilarity[i] = similarity;
            }
            const score = lambda * candidate.similarity - (1 - lambda) * maxSimilarity[i];
            if (score > bestScore) { best = candidate; bestScore = score; }
        }
        if (!best) break;
        selected.push(best);
        selectedIds.add(best._id);
    }
    return selected;
}
