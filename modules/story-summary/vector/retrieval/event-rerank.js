// L2 event rerank: bounded prompt-order refinement over already recalled events.

import { getRerankBatchDiagnostics, rerankChunks } from '../llm/reranker.js';
import { selectEventRerankCandidates } from './event-rerank-admission.js';

function buildEventDocument(event) {
    return [
        event?.title ? `标题：${event.title}` : '',
        event?.timeLabel ? `时间：${event.timeLabel}` : '',
        event?.participants?.length ? `人物：${event.participants.join('、')}` : '',
        event?.summary ? `事件：${event.summary}` : '',
    ].filter(Boolean).join('\n');
}

function isCompleteRerank(reranked, candidates) {
    if (reranked.length !== candidates.length) return false;
    const expected = new Set(candidates.map(candidate => candidate.item));
    const seen = new Set();
    for (const result of reranked) {
        if (!expected.has(result?.item)
            || seen.has(result.item)
            || !Number.isFinite(result?._rerankScore)) {
            return false;
        }
        seen.add(result.item);
    }
    return seen.size === expected.size;
}

/**
 * Finalize the relevance order of already recalled L2 events without changing membership.
 * `query` is the bounded three-message query used by the floor reranker.
 * `temporalQuery` remains the current USER text because it only drives the
 * existing exact-time protection rule, not semantic relevance.
 * Any incomplete external result returns the original order as one atomic fallback.
 */
export async function rerankRecalledEvents(eventHits, options = {}) {
    const source = Array.isArray(eventHits) ? eventHits : [];
    const query = String(options.query || '').trim();
    const base = {
        events: source,
        status: 'skipped',
        sourceCount: source.length,
        candidateCount: 0,
        tailCount: 0,
        rerankMs: 0,
        exactTimeMarker: '',
        exactTimeFloorCount: 0,
        exactTimeCandidateCount: 0,
        exactTimeWinnerCount: 0,
        exactTimeReservedCount: 0,
        exactTimeOverflowCount: 0,
        exactTimeForcedCount: 0,
        diagnostics: { totalBatches: 0, failedBatches: 0, failures: [] },
    };
    if (!query) return { ...base, status: 'skipped-no-query' };
    if (source.length === 0) return { ...base, status: 'skipped-no-candidates' };

    const admission = selectEventRerankCandidates(source, {
        temporalQuery: options.temporalQuery,
        chat: options.chat,
    });
    if (!admission.candidates?.length) {
        return { ...base, status: 'skipped-no-candidates' };
    }

    const candidates = admission.candidates.map(item => ({
        item,
        text: buildEventDocument(item.event),
    }));
    const rerankStartedAt = performance.now();
    const reranked = await rerankChunks(query, candidates, {
        topN: candidates.length,
        minScore: Number.NEGATIVE_INFINITY,
        signal: options.signal || null,
    });
    const rerankMs = Math.round(performance.now() - rerankStartedAt);
    const diagnostics = getRerankBatchDiagnostics(reranked);
    const shared = {
        ...base,
        candidateCount: candidates.length,
        tailCount: admission.tail.length,
        rerankMs,
        exactTimeMarker: admission.exactTimeMarker,
        exactTimeFloorCount: admission.exactTimeFloorCount,
        exactTimeCandidateCount: admission.exactTimeCandidateCount,
        exactTimeWinnerCount: admission.exactTimeWinnerCount,
        exactTimeReservedCount: admission.exactTimeReservedCount,
        exactTimeOverflowCount: admission.exactTimeOverflowCount,
        exactTimeForcedCount: admission.exactTimeForcedCount,
        diagnostics,
    };

    if (diagnostics.failedBatches > 0 || !isCompleteRerank(reranked, candidates)) {
        return { ...shared, status: 'rerank-failed' };
    }

    const ranked = reranked.map(item => ({
        ...item.item,
        _eventRerankScore: item._rerankScore,
    }));
    return {
        ...shared,
        events: [...ranked, ...admission.tail],
        status: 'applied',
    };
}
