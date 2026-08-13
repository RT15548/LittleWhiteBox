// Gold Eval - 规范化评测观测与证据阶段判定（纯函数）
//
// 这里不导入生产召回，也不解释其内部对象。replay 适配层只需把一次运行
// 转成 JSON 可序列化的 observation，评分器便可独立复算。

export const OBSERVATION_STAGE_KEYS = Object.freeze([
    'r1Dense',
    'r2Dense',
    'lexical',
    'fusion',
    'rerank',
    'graph',
    'final',
    'prompt',
]);

function normalizeRanked(items = []) {
    const normalized = [];
    const seen = new Set();
    const unitRanks = new Map();
    let maxRank = 0;
    for (const [index, raw] of (items || []).entries()) {
        const floor = Number(raw?.floor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        const unitId = String(raw?.unitId || '').trim();
        const seenKey = unitId ? `${unitId}\u0000${floor}` : `floor:${floor}`;
        if (seen.has(seenKey)) continue;
        seen.add(seenKey);

        const rawRank = Number(raw?.rank);
        let rank = Number.isInteger(rawRank) && rawRank > 0 ? rawRank : null;
        if (unitId && unitRanks.has(unitId)) rank = unitRanks.get(unitId);
        if (rank == null) rank = maxRank + 1;
        if (unitId) unitRanks.set(unitId, rank);
        maxRank = Math.max(maxRank, rank);

        normalized.push({
            ...raw,
            floor,
            rank,
            score: Number.isFinite(raw?.score) ? raw.score : null,
            ...(unitId ? { unitId } : {}),
            _order: index,
        });
    }
    normalized.sort((a, b) => (a.rank - b.rank) || (a._order - b._order));

    const byFloor = new Map();
    for (const item of normalized) {
        if (!byFloor.has(item.floor)) {
            const clean = { ...item };
            delete clean._order;
            byFloor.set(item.floor, clean);
        }
    }
    return {
        byFloor: new Map([...byFloor.entries()].sort((a, b) => a[1].rank - b[1].rank)),
        ranked: normalized.map(({ _order, ...item }) => item),
    };
}

/**
 * 规范化一次评测观测。
 * @param {object} observation
 * @param {object} [observation.stages] 每阶段的 [{ floor, rank, score?, source? }]
 * @param {number[]} [observation.promptFloors] 已知进入最终 Prompt 的证据楼层
 * @param {object[]} [observation.timeline] 可选阶段时间线
 */
export function summarizeObservation(observation = {}) {
    const rawStages = observation?.stages || {};
    const stages = {};
    const stageRankings = {};
    for (const key of OBSERVATION_STAGE_KEYS) {
        const normalized = normalizeRanked(rawStages[key]);
        stages[key] = normalized.byFloor;
        stageRankings[key] = normalized.ranked;
    }

    const promptFloors = new Set(
        (observation.promptFloors || []).filter(floor => Number.isInteger(floor) && floor >= 0),
    );
    for (const floor of stages.prompt.keys()) promptFloors.add(floor);

    const timeline = (observation.timeline || [])
        .filter(item => item && typeof item === 'object')
        .map(item => ({ ...item }));

    return { stages, stageRankings, promptFloors, timeline };
}

/**
 * 计算单个证据楼层在各阶段的可观察状态。
 */
export function stageStatusForFloor(floor, { extractedFloors, summary }) {
    const { stages, promptFloors } = summary;
    const r1Dense = stages.r1Dense.has(floor) ? 'hit' : 'miss';
    const r2Dense = stages.r2Dense.has(floor) ? 'hit' : 'miss';
    const lexical = stages.lexical.has(floor) ? 'hit' : 'miss';
    const retrieval = [r1Dense, r2Dense, lexical].includes('hit') ? 'hit' : 'miss';
    const fusion = stages.fusion.has(floor) ? 'hit' : 'miss';

    let rerank = 'miss';
    const rerankItem = stages.rerank.get(floor);
    if (rerankItem?.source === 'must-keep') rerank = 'rescued-by-mustkeep';
    else if (rerankItem) rerank = 'hit';

    const inFinal = stages.final.has(floor);
    const recoveredByGraph = stages.graph.has(floor) && !rerankItem;
    const graph = inFinal
        ? (recoveredByGraph ? 'recovered-by-graph' : 'hit')
        : 'miss';

    return {
        extraction: extractedFloors.has(floor) ? 'hit' : 'miss',
        r1Dense,
        r2Dense,
        lexical,
        retrieval,
        fusion,
        rerank,
        graph,
        prompt: promptFloors.has(floor) ? 'hit' : 'miss',
    };
}

/**
 * 主召回指标只使用 graph 后、Prompt 预算前的最终证据排名。
 * 中间阶段绝不回退成主排名，避免把不同口径混成一个指标。
 */
export function buildPrimaryRanking(summary) {
    return (summary.stageRankings?.final || [...summary.stages.final.values()]).map(item => ({
        floor: item.floor,
        rank: item.rank,
        score: item.score,
        source: item.source || 'final',
        ...(item.unitId ? { unitId: item.unitId } : {}),
    }));
}

/**
 * 用冻结证据文本补充 Prompt 楼层归属。过短文本不参与自动判定。
 */
export function detectEvidenceInPrompt(promptText, evidenceTexts = [], options = {}) {
    const minLen = options.minSnippetLength ?? 12;
    const haystack = String(promptText || '').replace(/\s+/g, ' ');
    const result = new Map();

    for (const { floor, texts } of evidenceTexts || []) {
        const candidates = (texts || [])
            .map(text => String(text || '').replace(/\s+/g, ' ').trim())
            .filter(Boolean);
        const usable = candidates.filter(text => text.length >= minLen);

        let matchedSnippet = null;
        for (const text of usable) {
            const snippet = text.slice(0, 60);
            if (haystack.includes(text) || haystack.includes(snippet)) {
                matchedSnippet = snippet;
                break;
            }
        }

        result.set(floor, {
            inPrompt: matchedSnippet != null,
            matchedSnippet,
            reliable: usable.length > 0,
            candidateCount: candidates.length,
        });
    }

    return result;
}
