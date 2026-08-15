import { getRerankBatchDiagnostics, rerankChunks } from '../llm/reranker.js';
import { scoreRecallRuntimeL1 } from '../runtime/runtime.js';
import {
    floorsForEventDetailParents,
    formatEventDetailDocument,
    selectEventDetailAdmission,
    selectEventDetailParents,
} from './event-detail-admission.js';

function isCompleteDetailRerank(reranked, candidates) {
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

export async function rankSelectedEventDetails(selectedDirect, context) {
    const parents = selectEventDetailParents(selectedDirect, {
        limit: context?.parentLimit,
        temporalFloors: context?.temporalFloors,
    });
    const floors = floorsForEventDetailParents(parents);
    if (!context?.runtimeLease
        || !context?.chatId
        || !context?.focusQuery?.trim()
        || !context?.focusVector?.length
        || !floors.length) {
        return {
            items: [],
            status: context?.runtimeLease ? 'skipped' : 'skipped-no-runtime-lease',
            diagnostics: getRerankBatchDiagnostics([]),
            stats: { parents: parents.length, floors: floors.length, sourceCandidates: 0, candidates: 0 },
        };
    }

    const focusStartedAt = performance.now();
    const scoredByFloor = await scoreRecallRuntimeL1(context.chatId, floors, context.focusVector);
    const focusScoreMs = Math.round(performance.now() - focusStartedAt);
    const scoredChunks = floors.flatMap(floor => scoredByFloor.get(floor) || []);
    const admission = selectEventDetailAdmission(scoredChunks, {
        limit: context.childLimit,
        timeMarker: context.timeMarker,
        temporalCarrier: context.temporalCarrier,
    });
    const candidates = admission.candidates.map((chunk, sourceIndex) => ({
        chunk,
        sourceIndex,
        text: formatEventDetailDocument(chunk),
    }));
    const missingVectors = Number(scoredByFloor._stats?.missingVectors || 0);
    const baseStats = {
        parents: parents.length,
        floors: floors.length,
        sourceCandidates: admission.sourceCount,
        candidates: candidates.length,
        documentChars: candidates.reduce((sum, item) => sum + item.text.length, 0),
        temporalCandidates: admission.temporalCandidateCount,
        temporalReserved: admission.temporalReservedCount,
        temporalOverflow: admission.temporalOverflowCount,
        vectorHits: Number(scoredByFloor._stats?.vectorHits || 0),
        missingVectors,
        focusScoreMs,
        rerankMs: 0,
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
    const reranked = await rerankChunks(context.focusQuery, candidates, {
        topN: candidates.length,
        minScore: Number.NEGATIVE_INFINITY,
    });
    const rerankMs = Math.round(performance.now() - rerankStartedAt);
    const diagnostics = getRerankBatchDiagnostics(reranked);
    const complete = diagnostics.failedBatches === 0
        && isCompleteDetailRerank(reranked, candidates);
    const items = complete ? reranked.map((item, rankIndex) => ({
        id: `event-detail:${item.chunk.chunkId}`,
        chunkId: item.chunk.chunkId,
        floor: item.chunk.floor,
        chunkIdx: item.chunk.chunkIdx,
        speaker: item.chunk.speaker || '',
        isUser: item.chunk.isUser === true,
        text: String(item.chunk.text || '').trim(),
        score: Number(item._rerankScore || 0),
        focusScore: Number(item.chunk._detailFocusScore || 0),
        _detailTemporalExact: item.chunk._detailTemporalExact === true,
        _detailTemporalCarrier: item.chunk._detailTemporalCarrier === true,
        _detailTemporalMarker: item.chunk._detailTemporalMarker || null,
        rank: rankIndex + 1,
    })) : [];

    return {
        items,
        status: complete ? 'applied' : 'incomplete-rerank',
        diagnostics,
        stats: {
            ...baseStats,
            rerankMs,
        },
    };
}
