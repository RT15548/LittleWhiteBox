import {
    matchingEventTemporalFloors,
    selectTemporalFloorWinners,
    TEMPORAL_PROTECTION_POLICY,
    getTemporalProtectionLimit,
} from './temporal-turn-carrier.js';

// Callers supply only candidates that already passed their relevance/ownership
// gates. Protection replaces ordinary slots; it never increases the capacity.
export function selectBoundedEventCandidates(source, capacity, temporalFloors = [], preferred = source) {
    const limit = Math.max(0, Math.floor(capacity));
    const selected = preferred.slice(0, limit);
    if (!temporalFloors.length) {
        return { candidates: selected, temporalCandidates: 0, winners: 0, reserved: 0, overflow: 0, forced: 0 };
    }
    const selectedIds = new Set(selected.map(item => item.event.id));
    const temporal = [...source]
        .sort((a, b) => Number(b.similarity || 0) - Number(a.similarity || 0))
        .map(item => ({ item, floors: matchingEventTemporalFloors(item.event, temporalFloors) }))
        .filter(row => row.floors.length);
    const winners = selectTemporalFloorWinners(temporal, row => row.floors);
    const reserved = winners.slice(0, Math.min(
        TEMPORAL_PROTECTION_POLICY.maxProtectedEvents,
        getTemporalProtectionLimit(limit, TEMPORAL_PROTECTION_POLICY.maxCandidateShare),
    ));
    const protectedIds = new Set(reserved.map(row => row.item.event.id));
    let forced = 0;
    for (const { item } of reserved) {
        if (selectedIds.has(item.event.id)) continue;
        let index = selected.length - 1;
        while (index >= 0 && protectedIds.has(selected[index].event.id)) index--;
        if (selected.length < limit) selected.push(item);
        else {
            if (index < 0) break;
            selectedIds.delete(selected[index].event.id);
            selected[index] = item;
        }
        selectedIds.add(item.event.id);
        forced++;
    }
    return {
        candidates: selected,
        temporalCandidates: temporal.length,
        winners: winners.length,
        reserved: reserved.length,
        overflow: Math.max(0, winners.length - reserved.length),
        forced,
    };
}
