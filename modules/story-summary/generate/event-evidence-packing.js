import { admitDirectEvidenceItems } from './direct-evidence-packing.js';
import { packCausalEvidence } from './causal-evidence-packing.js';

export const L0_PROTECTED_TOKENS = 1000;

/** One shared ledger: causal/L0 reservations are actual admitted text, not idle quotas. */
export function packEventEvidence({ l0Items, l1Items, fallbackItems = [], causalOwners, causesById,
    budget, estimateTokens, getTokenCost, floorOverheadTokens, protectedBudget }) {
    // Causal rules stay direct-only, globally <=1000 and per owner <=400 for
    // the 4000 pool. Reserving before raw admission prevents starvation.
    const causal = packCausalEvidence(causalOwners, causesById, budget, estimateTokens);
    const options = { getTokenCost, floorOverheadTokens, protectedBudget, admittedGroups: new Set() };
    const l0Budget = { used: budget.used, max: Math.min(budget.max, budget.used + L0_PROTECTED_TOKENS) };
    const l0Start = budget.used;
    const l0 = admitDirectEvidenceItems(l0Items, l0Budget, options);
    budget.used = l0Budget.used;
    const firstIds = new Set(l0.map(item => item.id));
    const l1 = admitDirectEvidenceItems(l1Items, budget, options);
    const parentFloors = new Set(l0.map(item => item.floor));
    const fallback = admitDirectEvidenceItems(
        fallbackItems.filter(item => parentFloors.has(item.floor)), budget, options,
    );
    // No reserved space is wasted: unused L1 capacity can hold more L0.
    const extraL0 = admitDirectEvidenceItems(l0Items.filter(item => !firstIds.has(item.id)), budget, options);
    const extraFloors = new Set(extraL0.map(item => item.floor));
    const extraFallback = admitDirectEvidenceItems(fallbackItems.filter(item => (
        !parentFloors.has(item.floor) && extraFloors.has(item.floor)
    )), budget, options);
    return { items: [...l0, ...l1, ...fallback, ...extraL0, ...extraFallback], causal,
        l0ProtectedTokens: l0Budget.used - l0Start };
}
