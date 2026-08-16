import {
    matchingEventTemporalFloors,
    selectTemporalFloorWinners,
    TEMPORAL_PROTECTION_POLICY,
} from '../vector/retrieval/temporal-turn-carrier.js';

export function buildTemporalEventPackingOrder(candidates, temporalFloors, options = {}) {
    const source = Array.isArray(candidates) ? candidates : [];
    const floors = [...new Set((temporalFloors || []).filter(Number.isInteger))];
    const maxProtectedEvents = Number.isInteger(options.maxProtectedEvents)
        && options.maxProtectedEvents >= 0
        ? options.maxProtectedEvents
        : TEMPORAL_PROTECTION_POLICY.maxProtectedEvents;
    const rows = source.map((item, candidateRank) => ({
        item,
        candidateRank,
        matchingFloors: matchingEventTemporalFloors(item?.event, floors),
    }));
    const winners = selectTemporalFloorWinners(rows, row => row.matchingFloors);
    const protectedRows = winners.slice(0, maxProtectedEvents);
    const protectedRanks = new Set(protectedRows.map(row => row.candidateRank));

    return {
        order: [
            ...protectedRows.map(row => ({ candidateRank: row.candidateRank, temporal: true })),
            ...rows
                .filter(row => !protectedRanks.has(row.candidateRank))
                .map(row => ({ candidateRank: row.candidateRank, temporal: false })),
        ],
        floorCount: floors.length,
        winnerCount: winners.length,
        protectedCount: protectedRows.length,
        overflowCount: Math.max(0, winners.length - protectedRows.length),
    };
}
