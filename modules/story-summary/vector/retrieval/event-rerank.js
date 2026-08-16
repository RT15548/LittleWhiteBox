// L2 event rerank: bounded prompt-order refinement over already recalled events.

import { getRerankBatchDiagnostics, rerankChunks } from '../llm/reranker.js';
import { scoreRecallRuntimeEvents } from '../runtime/runtime.js';
import {
    extractFullTimeMarker,
    findExactTimeFloors,
    getTemporalProtectionLimit,
    matchingEventTemporalFloors,
    selectTemporalFloorWinners,
    TEMPORAL_PROTECTION_POLICY,
} from './temporal-turn-carrier.js';

const EVENT_RERANK_CANDIDATE_MAX = 60;

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

async function selectCandidates(source, { query, focusVector, chatId, chat, signal }) {
    const eligible = source.filter(item => item?.event?.id && item?.event?.summary);
    if (eligible.length <= EVENT_RERANK_CANDIDATE_MAX) {
        const candidateSet = new Set(eligible);
        return {
            candidates: eligible,
            tail: source.filter(item => !candidateSet.has(item)),
            exactTimeMarker: '',
            exactTimeFloorCount: 0,
            exactTimeCandidateCount: 0,
            exactTimeWinnerCount: 0,
            exactTimeReservedCount: 0,
            exactTimeOverflowCount: 0,
            exactTimeForcedCount: 0,
        };
    }
    if (!focusVector?.length || !chatId) return null;

    const scored = await scoreRecallRuntimeEvents(chatId, focusVector, {
        signal: signal || null,
    });
    const scoreMap = new Map((scored?.scores || []).map(item => [item.eventId, item.similarity]));
    if (!scoreMap.size) return null;

    const exactTimeMarker = extractFullTimeMarker(query) || '';
    const exactTimeFloors = findExactTimeFloors(chat, exactTimeMarker);
    const ranked = eligible
        .map((item, sourceIndex) => ({
            item,
            sourceIndex,
            score: scoreMap.get(item.event.id) ?? Number.NEGATIVE_INFINITY,
            exactTimeFloors: matchingEventTemporalFloors(item.event, exactTimeFloors),
        }))
        .sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex);
    const selected = ranked.slice(0, EVENT_RERANK_CANDIDATE_MAX);
    const selectedIds = new Set(selected.map(row => row.item.event.id));
    const exactTimeRows = ranked.filter(row => row.exactTimeFloors.length > 0);
    const exactTimeWinners = selectTemporalFloorWinners(
        exactTimeRows,
        row => row.exactTimeFloors,
    );
    const exactTimeReserveCap = Math.min(
        TEMPORAL_PROTECTION_POLICY.maxProtectedEvents,
        getTemporalProtectionLimit(
            EVENT_RERANK_CANDIDATE_MAX,
            TEMPORAL_PROTECTION_POLICY.maxCandidateShare,
        ),
    );
    const exactTimeProtected = exactTimeWinners.slice(0, exactTimeReserveCap);
    const exactTimeIds = new Set(exactTimeProtected.map(row => row.item.event.id));
    let exactTimeForcedCount = 0;

    for (const row of exactTimeProtected) {
        if (selectedIds.has(row.item.event.id)) continue;
        let replaceIndex = selected.length - 1;
        while (replaceIndex >= 0 && exactTimeIds.has(selected[replaceIndex].item.event.id)) {
            replaceIndex--;
        }
        if (replaceIndex < 0) break;
        selectedIds.delete(selected[replaceIndex].item.event.id);
        selected[replaceIndex] = row;
        selectedIds.add(row.item.event.id);
        exactTimeForcedCount++;
    }

    selected.sort((left, right) => right.score - left.score || left.sourceIndex - right.sourceIndex);
    const candidates = selected.map(row => row.item);
    const candidateSet = new Set(candidates);
    const tail = source.filter(item => !candidateSet.has(item));
    return {
        candidates,
        tail,
        exactTimeMarker,
        exactTimeFloorCount: exactTimeFloors.length,
        exactTimeCandidateCount: exactTimeRows.length,
        exactTimeWinnerCount: exactTimeWinners.length,
        exactTimeReservedCount: exactTimeProtected.length,
        exactTimeOverflowCount: Math.max(0, exactTimeWinners.length - exactTimeProtected.length),
        exactTimeForcedCount,
    };
}

/**
 * Finalize the relevance order of already recalled L2 events without changing membership.
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
        admissionMs: 0,
        rerankMs: 0,
        exactTimeMarker: '',
        exactTimeFloorCount: 0,
        exactTimeCandidateCount: 0,
        exactTimeWinnerCount: 0,
        exactTimeReservedCount: 0,
        exactTimeOverflowCount: 0,
        exactTimeForcedCount: 0,
        diagnostics: { totalBatches: 0, failedBatches: 0, failures: [] },
        scores: [],
    };
    if (!query) return { ...base, status: 'skipped-no-query' };
    if (source.length === 0) return { ...base, status: 'skipped-no-candidates' };

    const admissionStartedAt = performance.now();
    let admission;
    try {
        admission = await selectCandidates(source, {
            query,
            focusVector: options.focusVector,
            chatId: options.chatId,
            chat: options.chat,
            signal: options.signal || null,
        });
    } catch (error) {
        if (error?.name === 'AbortError') throw error;
        return {
            ...base,
            status: 'admission-failed',
            admissionMs: Math.round(performance.now() - admissionStartedAt),
        };
    }
    const admissionMs = Math.round(performance.now() - admissionStartedAt);
    if (!admission) {
        return { ...base, status: 'admission-skipped', admissionMs };
    }
    if (!admission.candidates?.length) {
        return { ...base, status: 'skipped-no-candidates', admissionMs };
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
        admissionMs,
        rerankMs,
        exactTimeMarker: admission.exactTimeMarker,
        exactTimeFloorCount: admission.exactTimeFloorCount,
        exactTimeCandidateCount: admission.exactTimeCandidateCount,
        exactTimeWinnerCount: admission.exactTimeWinnerCount,
        exactTimeReservedCount: admission.exactTimeReservedCount,
        exactTimeOverflowCount: admission.exactTimeOverflowCount,
        exactTimeForcedCount: admission.exactTimeForcedCount,
        diagnostics,
        scores: reranked
            .map(item => item?._rerankScore)
            .filter(Number.isFinite),
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
