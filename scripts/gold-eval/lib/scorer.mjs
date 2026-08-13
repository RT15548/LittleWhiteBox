// Gold Eval - 单题评分装配器（纯函数）
//
// 唯一输入边界：冻结 gold case + JSON 可序列化 observation。
// 生产 replay 如何获得各阶段排名属于适配层，不进入评分器。

import {
    computeCaseRecallMetrics,
    scoreAnswer,
    detectOldFactMention,
    attributeEarliestFailure,
} from './metrics.mjs';
import {
    summarizeObservation,
    stageStatusForFloor,
    buildPrimaryRanking,
    detectEvidenceInPrompt,
} from './score-utils.mjs';

function valuesForFloor(source, floor) {
    if (source instanceof Map) return source.get(floor) || [];
    return source?.[floor] || source?.[String(floor)] || [];
}

function summarizeRankingUnits(ranked) {
    const units = new Map();
    for (const item of ranked || []) {
        const key = item.unitId ? `id:${item.unitId}` : `rank:${item.rank}`;
        if (!units.has(key)) units.set(key, new Set());
        units.get(key).add(item.floor);
    }
    const floorCounts = [...units.values()].map(floors => floors.size);
    return {
        rows: (ranked || []).length,
        units: units.size,
        multiFloorUnits: floorCounts.filter(count => count > 1).length,
        maxFloorsPerUnit: floorCounts.length ? Math.max(...floorCounts) : 0,
    };
}

function detectAnswerSurfaceInPrompt(expectedAnswer, promptText) {
    const supported = new Set(['exact', 'contains', 'regex']);
    if (!supported.has(String(expectedAnswer?.type || ''))) {
        return { applicable: false, matched: null };
    }
    const result = scoreAnswer(expectedAnswer, promptText);
    return {
        applicable: result.status === 'scored',
        matched: result.status === 'scored' ? result.correct : null,
    };
}

/**
 * @param {object} params
 * @param {object} params.case validateCase 规范化后的金标准用例
 * @param {object} params.observation 一次运行的标准化可观察结果
 */
export function scoreCase({ case: goldCase, observation = {} }) {
    const evidence = goldCase.evidence || {};
    const summary = summarizeObservation(observation);
    const extractedFloors = new Set(
        (observation.extractedFloors || []).filter(floor => Number.isInteger(floor) && floor >= 0),
    );
    const promptText = String(observation.promptText || '');
    const evidenceTextsByFloor = observation.evidenceTextsByFloor || {};

    const allEvidenceFloors = [...new Set([
        ...(evidence.requiredAll || []),
        ...(evidence.requiredAny || []),
        ...(evidence.requiredAnyGroups || []).flat(),
        ...(evidence.supporting || []),
        ...(evidence.forbiddenAsCurrent || []),
    ])].sort((a, b) => a - b);

    if (promptText) {
        const detected = detectEvidenceInPrompt(
            promptText,
            allEvidenceFloors.map(floor => ({
                floor,
                texts: valuesForFloor(evidenceTextsByFloor, floor),
            })),
        );
        for (const floor of allEvidenceFloors) {
            if (detected.get(floor)?.inPrompt) summary.promptFloors.add(floor);
        }
    }

    const stageByFloor = {};
    for (const floor of allEvidenceFloors) {
        stageByFloor[floor] = stageStatusForFloor(floor, { extractedFloors, summary });
    }

    const ranked = buildPrimaryRanking(summary);
    const metrics = computeCaseRecallMetrics({
        requiredAll: evidence.requiredAll || [],
        requiredAny: evidence.requiredAny || [],
        requiredAnyGroups: evidence.requiredAnyGroups || [],
        supporting: evidence.supporting || [],
        forbidden: evidence.forbiddenAsCurrent || [],
        ranked,
        inPromptFloors: [...summary.promptFloors],
    });

    const answerText = observation.answerText ?? null;
    const answer = scoreAnswer(goldCase.expectedAnswer, answerText, {
        abstainPhrases: observation.abstainPhrases,
    });
    const answerSurfaceInPrompt = detectAnswerSurfaceInPrompt(goldCase.expectedAnswer, promptText);
    const oldFact = goldCase.category === 'update'
        ? detectOldFactMention(answerText, goldCase.expectedAnswer?.oldFactValues || [])
        : { applicable: false, mentioned: null, values: [] };

    const requiredAll = evidence.requiredAll || [];
    const requiredAny = evidence.requiredAny || [];
    const requiredAnyGroups = evidence.requiredAnyGroups || [];
    const requiredFloors = [...new Set([...requiredAll, ...requiredAny, ...requiredAnyGroups.flat()])];
    const aggregatedStages = aggregateRequiredStages(requiredAll, requiredAny, requiredAnyGroups, stageByFloor);
    const earliestFailure = attributeEarliestFailure(
        aggregatedStages,
        answerText == null ? null : answer,
    );
    const efficiency = observation.efficiency || {};

    const stageTraceRow = {
        id: goldCase.id,
        category: goldCase.category,
        split: goldCase.split,
        atFloor: goldCase.atFloor,
        query: typeof goldCase.query === 'string' ? goldCase.query : goldCase.query?.text,
        stages: aggregatedStages,
        stageByFloor,
        ranked: ranked.filter(item => item.rank <= 60),
        requiredFinalRanking: requiredFloors
            .map(floor => ranked.find(item => item.floor === floor)
                || { floor, rank: null, unitId: null, score: null, source: null }),
        rankingDiagnostics: summarizeRankingUnits(ranked),
        promptFloors: [...summary.promptFloors].sort((a, b) => a - b),
        answer: {
            text: answerText,
            ...answer,
        },
        answerSurfaceInPrompt,
        timeline: summary.timeline,
        efficiency: {
            recallMs: efficiency.recallMs ?? null,
            externalCalls: efficiency.externalCalls ?? null,
            readerMs: efficiency.readerMs ?? null,
            readerCalls: efficiency.readerCalls ?? null,
            externalMs: efficiency.externalMs ?? null,
            promptChars: efficiency.promptChars ?? promptText.length,
            promptTokens: efficiency.promptTokens ?? null,
        },
    };

    const metricRow = {
        case: goldCase,
        metrics,
        answer,
        answerSurfaceInPrompt,
        oldFact,
        earliestFailure,
        efficiency: stageTraceRow.efficiency,
    };
    const failureRow = earliestFailure
        ? {
            id: goldCase.id,
            category: goldCase.category,
            earliestFailure,
            queryPreview: String(typeof goldCase.query === 'string' ? goldCase.query : goldCase.query?.text || '').slice(0, 80),
            requiredFloors,
            stages: aggregatedStages,
        }
        : null;

    return { stageTraceRow, metricRow, failureRow };
}

function aggregateRequiredStages(requiredAll, requiredAny, requiredAnyGroups, stageByFloor) {
    const groups = [
        ...(requiredAny.length ? [requiredAny] : []),
        ...(requiredAnyGroups || []),
    ];
    const requiredFloors = [...new Set([...requiredAll, ...groups.flat()])];
    if (!requiredFloors.length) {
        return {
            extraction: 'not-applicable',
            retrieval: 'not-applicable',
            fusion: 'not-applicable',
            rerank: 'not-applicable',
            graph: 'not-applicable',
            prompt: 'not-applicable',
        };
    }

    const passes = (floor, key, accepted) => accepted.includes(stageByFloor[floor]?.[key]);
    const groupPasses = (key, accepted) => {
        const allPass = requiredAll.every(floor => passes(floor, key, accepted));
        const groupsPass = groups.every(group => group.some(floor => passes(floor, key, accepted)));
        return allPass && groupsPass;
    };

    const status = (key, accepted = ['hit']) => groupPasses(key, accepted) ? 'hit' : 'miss';
    const rerank = status('rerank', ['hit', 'rescued-by-mustkeep']);
    const graph = status('graph', ['hit', 'recovered-by-graph']);

    return {
        extraction: status('extraction'),
        retrieval: status('retrieval'),
        fusion: status('fusion'),
        rerank: rerank === 'hit'
            && requiredFloors.some(floor => stageByFloor[floor]?.rerank === 'rescued-by-mustkeep')
            ? 'rescued-by-mustkeep'
            : rerank,
        graph: graph === 'hit'
            && requiredFloors.some(floor => stageByFloor[floor]?.graph === 'recovered-by-graph')
            ? 'recovered-by-graph'
            : graph,
        prompt: status('prompt'),
    };
}
