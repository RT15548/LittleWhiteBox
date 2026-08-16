function finiteNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

// A shared rank scale for heterogeneous evidence sources. Unlike percentile
// normalization, rank 2 has the same meaning whether its source list contains
// 3 or 60 items.
export function buildRankRelevance(items, getId) {
    const relevance = new Map();
    let rank = 0;
    for (const item of items || []) {
        const id = getId(item);
        if (id == null || relevance.has(id)) continue;
        rank++;
        relevance.set(id, 1 / rank);
    }
    return relevance;
}

// Mutates budget and admittedFloors so multi-phase admission shares one ledger.
export function admitDirectEvidenceItems(items, budget, options = {}) {
    if (!budget || !Number.isFinite(budget.used) || !Number.isFinite(budget.max)) {
        throw new TypeError('budget must contain finite used and max values');
    }

    const getTokenCost = typeof options.getTokenCost === 'function'
        ? options.getTokenCost
        : item => item?.tokenCost;
    const isOrdinaryEligible = typeof options.isOrdinaryEligible === 'function'
        ? options.isOrdinaryEligible
        : item => item?.ordinaryEligible !== false;
    const floorOverheadTokens = Math.max(0, finiteNumber(options.floorOverheadTokens));
    const admittedFloors = options.admittedFloors instanceof Set
        ? options.admittedFloors
        : new Set();
    const protectedBudget = options.protectedBudget || { used: 0, max: budget.max };
    if (!Number.isFinite(protectedBudget.used) || !Number.isFinite(protectedBudget.max)) {
        throw new TypeError('protectedBudget must contain finite used and max values');
    }
    const sorted = [...(items || [])].sort((left, right) => (
        finiteNumber(right?.score) - finiteNumber(left?.score)
        || finiteNumber(left?.floor) - finiteNumber(right?.floor)
    ));

    // Protection is a bounded first pass. Only the best ordinarily-ranked item
    // on each floor may enter it; anything else is reconsidered by the normal
    // relevance pass with every temporal privilege removed.
    const protectedCandidates = [];
    const protectedFloors = new Set();
    for (const item of sorted) {
        if (item?.temporal !== true || protectedFloors.has(item.floor)) continue;
        protectedFloors.add(item.floor);
        protectedCandidates.push(item);
    }

    const admitted = [];
    const admittedSources = new Set();
    const tryAdmit = (item, protectedLane) => {
        const overhead = admittedFloors.has(item.floor) ? 0 : floorOverheadTokens;
        const cost = Math.max(0, finiteNumber(getTokenCost(item))) + overhead;
        if (budget.used + cost > budget.max) return false;
        if (protectedLane && protectedBudget.used + cost > protectedBudget.max) return false;
        budget.used += cost;
        if (protectedLane) protectedBudget.used += cost;
        admittedFloors.add(item.floor);
        admittedSources.add(item);
        admitted.push(protectedLane
            ? { ...item, temporal: true, temporalProtected: true }
            : { ...item, temporal: false, temporalProtected: false });
        return true;
    };

    for (const item of protectedCandidates) tryAdmit(item, true);
    for (const item of sorted) {
        if (admittedSources.has(item) || !isOrdinaryEligible(item)) continue;
        tryAdmit(item, false);
    }
    return admitted;
}
