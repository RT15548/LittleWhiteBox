import {
    extractFullTimeMarker,
    findExactTimeFloors,
} from './temporal-turn-carrier.js';
import { selectBoundedEventCandidates } from './event-candidate-selection.js';

export const EVENT_RERANK_CANDIDATE_MAX = 60;

function emptyTemporalStats(candidates, tail) {
    return {
        candidates,
        tail,
        exactTimeMarker: '',
        exactTimeFloorCount: 0,
        exactTimeCandidateCount: 0,
        exactTimeWinnerCount: 0,
        exactTimeReservedCount: 0,
        exactTimeOverflowCount: 0,
        exactTimeForcedCount: 0,
    };
}

/**
 * Bound already-recalled L2 events for cross-encoder reranking.
 * `item.similarity` is the authoritative score produced by the current
 * recall run; this stage must not score the full event store again.
 */
export function selectEventRerankCandidates(source, options = {}) {
    const input = Array.isArray(source) ? source : [];
    const eligible = input.filter(item => item?.event?.id && item?.event?.summary);
    if (eligible.length <= EVENT_RERANK_CANDIDATE_MAX) {
        const candidateSet = new Set(eligible);
        return emptyTemporalStats(
            eligible,
            input.filter(item => !candidateSet.has(item)),
        );
    }

    const exactTimeMarker = extractFullTimeMarker(options.temporalQuery) || '';
    const exactTimeFloors = findExactTimeFloors(options.chat, exactTimeMarker, options.queryFloor);
    const ranked = [...eligible].sort((left, right) => (
        Number(right.similarity || 0) - Number(left.similarity || 0)
    ));
    const selection = selectBoundedEventCandidates(ranked, EVENT_RERANK_CANDIDATE_MAX, exactTimeFloors);
    const candidates = selection.candidates.sort((left, right) => (
        Number(right.similarity || 0) - Number(left.similarity || 0)
    ));
    const candidateSet = new Set(candidates);
    return {
        candidates,
        tail: input.filter(item => !candidateSet.has(item)),
        exactTimeMarker,
        exactTimeFloorCount: exactTimeFloors.length,
        exactTimeCandidateCount: selection.temporalCandidates,
        exactTimeWinnerCount: selection.winners,
        exactTimeReservedCount: selection.reserved,
        exactTimeOverflowCount: selection.overflow,
        exactTimeForcedCount: selection.forced,
    };
}
