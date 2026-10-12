// Experiment only: alternate admission over the SAME already-recalled L2 pool.
import { EVENT_RERANK_CANDIDATE_MAX, selectEventRerankCandidates } from '../../../modules/story-summary/vector/retrieval/event-rerank-admission.js';
import { selectBoundedEventCandidates } from '../../../modules/story-summary/vector/retrieval/event-candidate-selection.js';
import { extractFullTimeMarker, findExactTimeFloors, parseEventRange } from '../../../modules/story-summary/vector/retrieval/temporal-turn-carrier.js';

const RRF_K = 60;
const vote = rank => rank == null ? 0 : 1 / (RRF_K + rank);

export function compareL2Admission(source, { lexicalEventIds, selectedFloors, ...temporalOptions }) {
    const dense = source.filter(item => item?.event?.id && item?.event?.summary)
        .sort((a, b) => Number(b.similarity || 0) - Number(a.similarity || 0));
    const ids = new Set(dense.map(item => item.event.id));
    if (ids.size !== dense.length) throw new Error('Duplicate L2 candidate identity');
    const lexical = [...new Set(lexicalEventIds)].filter(id => ids.has(id));
    const lexicalRanks = new Map(lexical.map((id, index) => [id, index + 1]));
    const floors = [...new Set(selectedFloors)];
    const rows = dense.map((item, index) => {
        const range = parseEventRange(item.event.summary);
        const best = range ? floors.findIndex(floor => floor >= range.start && floor <= range.end) : -1;
        return {
            eventId: item.event.id, denseRank: index + 1, similarity: item.similarity,
            lexicalRank: lexicalRanks.get(item.event.id) ?? null,
            bestFloor: best < 0 ? null : floors[best],
            bestFloorPosition: best < 0 ? null : best + 1,
            floorSupportEventRank: null,
        };
    });
    const supported = rows.filter(row => row.bestFloorPosition != null)
        .sort((a, b) => a.bestFloorPosition - b.bestFloorPosition);
    let rank = 0;
    for (let index = 0; index < supported.length; index++) {
        if (index === 0 || supported[index].bestFloorPosition !== supported[index - 1].bestFloorPosition) rank = index + 1;
        supported[index].floorSupportEventRank = rank;
    }
    for (const row of rows) {
        row.contributions = {
            dense: vote(row.denseRank), lexical: vote(row.lexicalRank), floor: vote(row.floorSupportEventRank),
        };
        row.fusionScore = Object.values(row.contributions).reduce((sum, score) => sum + score, 0);
    }
    const fusion = [...rows].sort((a, b) => b.fusionScore - a.fusionScore || a.denseRank - b.denseRank);
    fusion.forEach((row, index) => { row.fusionRank = index + 1; });
    const control = selectEventRerankCandidates(dense, temporalOptions);
    // No intervention for pools <=60. Temporal winners still use dense evidence.
    const temporalFloors = findExactTimeFloors(temporalOptions.chat,
        extractFullTimeMarker(temporalOptions.temporalQuery), temporalOptions.queryFloor);
    const preferred = fusion.map(row => dense[row.denseRank - 1]);
    const treatmentCandidates = dense.length <= EVENT_RERANK_CANDIDATE_MAX ? control.candidates
        : selectBoundedEventCandidates(dense, EVENT_RERANK_CANDIDATE_MAX, temporalFloors, preferred).candidates;
    // Admission changes membership, not the existing document batching order.
    treatmentCandidates.sort((a, b) => Number(b.similarity || 0) - Number(a.similarity || 0));
    const treatmentSet = new Set(treatmentCandidates);
    const treatment = { candidates: treatmentCandidates, tail: dense.filter(item => !treatmentSet.has(item)) };
    const controlIds = new Set(control.candidates.map(item => item.event.id));
    const treatmentIds = new Set(treatmentCandidates.map(item => item.event.id));
    for (const row of rows) {
        row.controlAdmitted = controlIds.has(row.eventId);
        row.treatmentAdmitted = treatmentIds.has(row.eventId);
    }
    return {
        control, treatment, rows: fusion,
        promoted: fusion.filter(row => row.treatmentAdmitted && !row.controlAdmitted),
        displaced: rows.filter(row => row.controlAdmitted && !row.treatmentAdmitted),
    };
}
