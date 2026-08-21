import { getRerankBatchDiagnostics, rerankChunks } from '../llm/reranker.js';
import { scoreRecallRuntimeL1 } from '../runtime/runtime.js';
import {
    floorsForDirectEvidenceParents,
    formatDirectEvidenceDocument,
    selectDirectEvidenceAdmission,
    selectDirectEvidenceParents,
} from './direct-evidence-admission.js';
import { selectTemporalFloorWinners } from './temporal-turn-carrier.js';

const DIRECT_EVIDENCE_MIN_SCORE = 0.1;

function isCompleteRerank(reranked, candidates) {
    if (reranked.length !== candidates.length) return false;
    const expected = new Set(candidates.map(candidate => candidate.chunk));
    const seen = new Set();
    for (const result of reranked) {
        if (!expected.has(result?.chunk)
            || seen.has(result.chunk)
            || !Number.isFinite(result?._rerankScore)) {
            return false;
        }
        seen.add(result.chunk);
    }
    return seen.size === expected.size;
}

/**
 * Expand selected L2 parents into Direct L1 evidence.
 * This is a detail pass over those parents, not a new current-message query:
 * dense admission reuses the final retrieval vector (three messages plus
 * optional memory hints), while reranking uses only the bounded three-message
 * text query.
 */
export async function rankSelectedDirectEvidence(selectedDirect, context) {
    const parents = selectDirectEvidenceParents(selectedDirect, {
        temporalFloors: context?.temporalFloors,
    });
    const floors = floorsForDirectEvidenceParents(parents);
    if (!context?.runtimeLease
        || !context?.chatId
        || !context?.query?.trim()
        || !context?.queryVector?.length
        || !floors.length) {
        return {
            items: [],
            status: context?.runtimeLease ? 'skipped' : 'skipped-no-runtime-lease',
            diagnostics: getRerankBatchDiagnostics([]),
            stats: { parents: parents.length, floors: floors.length, sourceCandidates: 0, candidates: 0 },
        };
    }

    const vectorStartedAt = performance.now();
    const scoredByFloor = await scoreRecallRuntimeL1(
        context.chatId,
        floors,
        context.queryVector,
        { signal: context?.signal || null },
    );
    const vectorScoreMs = Math.round(performance.now() - vectorStartedAt);
    const scoredChunks = floors.flatMap(floor => scoredByFloor.get(floor) || []);
    const admission = selectDirectEvidenceAdmission(scoredChunks, {
        timeMarker: context.timeMarker,
        temporalCarrier: context.temporalCarrier,
    });
    const candidates = admission.candidates.map((chunk, sourceIndex) => ({
        chunk,
        sourceIndex,
        text: formatDirectEvidenceDocument(chunk),
    }));
    const missingVectors = Number(scoredByFloor._stats?.missingVectors || 0);
    const baseStats = {
        parents: parents.length,
        floors: floors.length,
        sourceCandidates: admission.sourceCount,
        candidates: candidates.length,
        temporalCandidates: admission.temporalCandidateCount,
        temporalFloorWinners: admission.temporalFloorWinnerCount,
        temporalProtectionCap: admission.temporalProtectionCap,
        temporalProtectedCandidates: admission.temporalProtectedCount,
        temporalForced: admission.temporalForcedCount,
        temporalOverflow: admission.temporalOverflowCount,
        temporalSameFloorNonWinners: admission.temporalSameFloorNonWinnerCount,
        vectorHits: Number(scoredByFloor._stats?.vectorHits || 0),
        missingVectors,
        vectorScoreMs,
        rerankMs: 0,
        relevantItems: 0,
    };
    if (missingVectors > 0 || candidates.length === 0) {
        return {
            items: [],
            status: missingVectors > 0 ? 'incomplete-vectors' : 'skipped-no-candidates',
            diagnostics: getRerankBatchDiagnostics([]),
            stats: baseStats,
        };
    }

    const rerankStartedAt = performance.now();
    const reranked = await rerankChunks(context.query, candidates, {
        topN: candidates.length,
        minScore: Number.NEGATIVE_INFINITY,
        signal: context?.signal || null,
    });
    const rerankMs = Math.round(performance.now() - rerankStartedAt);
    const diagnostics = getRerankBatchDiagnostics(reranked);
    const complete = diagnostics.failedBatches === 0 && isCompleteRerank(reranked, candidates);
    const temporalWinners = complete
        ? selectTemporalFloorWinners(reranked, item => {
            const floor = item?.chunk?._directEvidenceTemporalProtectionFloor;
            return item?.chunk?._directEvidenceTemporalMatch === true && Number.isInteger(floor)
                ? [floor]
                : [];
        })
        : [];
    const temporalWinnerIds = new Set(temporalWinners.map(item => item.chunk.chunkId));
    const relevant = complete
        ? reranked.filter(item => (
            Number(item._rerankScore) >= DIRECT_EVIDENCE_MIN_SCORE
            || temporalWinnerIds.has(item.chunk.chunkId)
        ))
        : [];
    const items = relevant.map((item, rankIndex) => ({
        id: `direct-evidence:${item.chunk.chunkId}`,
        chunkId: item.chunk.chunkId,
        floor: item.chunk.floor,
        chunkIdx: item.chunk.chunkIdx,
        speaker: item.chunk.speaker || '',
        isUser: item.chunk.isUser === true,
        text: String(item.chunk.text || '').trim(),
        score: Number(item._rerankScore || 0),
        _directEvidenceTemporalExact: item.chunk._directEvidenceTemporalExact === true,
        _directEvidenceTemporalMatch: item.chunk._directEvidenceTemporalMatch === true,
        _directEvidenceTemporalCarrier: temporalWinnerIds.has(item.chunk.chunkId),
        _directEvidencePassedMinScore: Number(item._rerankScore) >= DIRECT_EVIDENCE_MIN_SCORE,
        _directEvidenceTemporalMarker: temporalWinnerIds.has(item.chunk.chunkId)
            ? item.chunk._directEvidenceTemporalMarker || context.timeMarker || null
            : null,
        rank: rankIndex + 1,
    }));

    return {
        items,
        status: complete ? 'applied' : 'incomplete-rerank',
        diagnostics,
        stats: {
            ...baseStats,
            relevantItems: items.length,
            temporalFinalProtected: temporalWinnerIds.size,
            rerankMs,
        },
    };
}
