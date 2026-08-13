// ═══════════════════════════════════════════════════════════════════════════
// Gold Eval - 金标准指标计算（纯函数，不依赖 LittleWhiteBox 内部模块）
//
// 输入：单个用例 + 该用例的 stage trace 命中情况（由 score-utils 汇总）。
// 输出：Recall@5/10、Precision@5/10、MRR、required-all coverage、
//       forbidden evidence rate、答案判定、最早失真阶段。
//
// 排名口径：
// - 主排名 = graph 后、Prompt 预算前的最终证据列表。
// - 中间阶段排名只用于失败归因，不混入主指标。
// - rank 从 1 开始；null 表示未进入最终列表。
// ═══════════════════════════════════════════════════════════════════════════

export const STAGE_ORDER = Object.freeze([
    'extraction',
    'retrieval',   // r1-dense / lexical 任一命中即通过
    'fusion',
    'rerank',
    'graph',       // 扩散找回阶段（前面 miss 且 graph miss → 根因 graph）
    'prompt',
    'answer',
]);

/**
 * 计算 ranked 列表口径下的单题召回指标。
 * @param {object} params
 * @param {number[]} params.requiredAll 必须全部命中的楼层
 * @param {number[]} params.requiredAny 至少命中一个的楼层
 * @param {number[][]} params.requiredAnyGroups 每组至少命中一个，所有组都必须满足
 * @param {number[]} params.supporting 有帮助但非硬性的楼层
 * @param {number[]} params.forbidden 禁止作为当前答案依据的楼层
 * @param {Array<{floor:number, rank:number,unitId?:string}>} params.ranked 主排名（rank 1-based）
 * @param {number[]} [params.inPromptFloors] 进入最终 Prompt 的楼层
 */
export function computeCaseRecallMetrics({
    requiredAll = [],
    requiredAny = [],
    requiredAnyGroups = [],
    supporting = [],
    forbidden = [],
    ranked = [],
    inPromptFloors = [],
}) {
    const rankByFloor = new Map();
    for (const item of ranked || []) {
        if (!Number.isInteger(item?.floor)) continue;
        const previous = rankByFloor.get(item.floor);
        if (previous == null || item.rank < previous) rankByFloor.set(item.floor, item.rank);
    }

    const groups = [
        ...(requiredAny.length ? [requiredAny] : []),
        ...(requiredAnyGroups || []),
    ];
    const requiredSet = new Set([...requiredAll, ...groups.flat()]);
    const relevantSet = new Set([...requiredSet, ...supporting]);

    const hitAt = (floor, k) => {
        const rank = rankByFloor.get(floor);
        return rank != null && rank <= k;
    };

    // ── Recall@k：required 集合命中率 ──
    const recallAt = (k) => {
        const allHits = requiredAll.filter(f => hitAt(f, k)).length;
        const groupHits = groups.map(group => group.some(f => hitAt(f, k)));
        const allRatio = requiredAll.length === 0 ? null : allHits / requiredAll.length;
        // 单值：requiredAll 取齐 且（如有）requiredAny 命中 → 1；否则按比例
        let value;
        if (requiredAll.length === 0 && groups.length === 0) {
            value = null;
        } else {
            const parts = [];
            if (requiredAll.length > 0) parts.push(allHits / requiredAll.length);
            parts.push(...groupHits.map(hit => hit ? 1 : 0));
            value = parts.reduce((a, b) => a + b, 0) / parts.length;
        }
        return { value, allRatio, groupHits, allHits, allTotal: requiredAll.length };
    };

    // ── Precision@k：top-k 唯一检索单元中相关（required∪supporting）比例 ──
    const precisionAt = (k) => {
        const topK = (ranked || []).filter(item => item.rank <= k);
        if (!topK.length) return null;
        const units = new Map();
        for (const item of topK) {
            const unitKey = item.unitId ? `id:${item.unitId}` : `rank:${item.rank}`;
            const relevant = units.get(unitKey) || relevantSet.has(item.floor);
            units.set(unitKey, relevant);
        }
        const relevantUnits = [...units.values()].filter(Boolean).length;
        return units.size ? relevantUnits / units.size : null;
    };

    // ── MRR：第一条 required 命中的倒数排名 ──
    let firstRank = null;
    for (const floor of requiredSet) {
        const rank = rankByFloor.get(floor);
        if (rank != null && (firstRank == null || rank < firstRank)) firstRank = rank;
    }
    const mrr = firstRank == null ? 0 : 1 / firstRank;

    // ── Required-all coverage：多证据题是否取齐 ──
    const coverage = {
        applicable: requiredAll.length > 1,
        covered: requiredAll.length > 1 ? requiredAll.every(f => rankByFloor.has(f)) : null,
        ratio: requiredAll.length > 0 ? requiredAll.filter(f => rankByFloor.has(f)).length / requiredAll.length : null,
    };

    // ── Forbidden evidence：过期/错误证据是否混入 ──
    const forbiddenInTop10 = forbidden.filter(f => hitAt(f, 10));
    const promptFloorSet = new Set(inPromptFloors || []);
    const forbiddenInPrompt = forbidden.filter(f => promptFloorSet.has(f));

    return {
        recallAt5: recallAt(5).value,
        recallAt10: recallAt(10).value,
        precisionAt5: precisionAt(5),
        precisionAt10: precisionAt(10),
        mrr,
        requiredAll: {
            applicable: coverage.applicable,
            covered: coverage.covered,
            ratio: coverage.ratio,
        },
        forbidden: {
            total: forbidden.length,
            inTop10: forbiddenInTop10,
            inPrompt: forbiddenInPrompt,
        },
        ranks: {
            firstRequiredRank: firstRank,
            byFloor: Object.fromEntries([...rankByFloor.entries()].sort((a, b) => a[1] - b[1])),
        },
    };
}

/**
 * 判定最终答案（不调用 LLM；llm-judge 类型返回 pending-review）。
 * @param {object} expectedAnswer CASE_SCHEMA 的 expectedAnswer
 * @param {string|null} answerText 实际答案文本；null 表示未运行阅读阶段
 * @param {{ oldFactValues?: string[], abstainPhrases?: string[] }} [extras]
 */
export function scoreAnswer(expectedAnswer, answerText, extras = {}) {
    const type = String(expectedAnswer?.type || '');
    const base = { type, status: 'unscored', correct: null, detail: '' };

    if (answerText == null) {
        return { ...base, status: 'not-run', detail: '阅读阶段未运行' };
    }
    const text = String(answerText);
    const normalized = normalizeAnswerText(text);

    if (type === 'exact') {
        const values = (expectedAnswer.values || []).map(normalizeAnswerText);
        const hit = values.some(v => v && normalized.includes(v));
        return { ...base, status: 'scored', correct: hit, detail: hit ? 'exact value matched' : 'no expected value found' };
    }

    if (type === 'contains') {
        const subs = (expectedAnswer.substrings || []).map(normalizeAnswerText).filter(Boolean);
        const missing = subs.filter(s => !normalized.includes(s));
        const hit = subs.length > 0 && missing.length === 0;
        return { ...base, status: 'scored', correct: hit, detail: missing.length ? `missing: ${missing.join(', ')}` : 'all substrings present' };
    }

    if (type === 'regex') {
        try {
            const re = new RegExp(expectedAnswer.pattern, expectedAnswer.flags || 'i');
            const hit = re.test(text);
            return { ...base, status: 'scored', correct: hit, detail: hit ? 'regex matched' : 'regex not matched' };
        } catch (error) {
            return { ...base, status: 'error', correct: null, detail: `invalid regex: ${error?.message || error}` };
        }
    }

    if (type === 'abstain') {
        const phrases = extras.abstainPhrases?.length
            ? extras.abstainPhrases
            : DEFAULT_ABSTAIN_PHRASES;
        const lowered = normalized;
        const abstained = phrases.some(p => lowered.includes(normalizeAnswerText(p)));
        return {
            ...base,
            status: 'scored',
            correct: abstained,
            detail: abstained ? 'abstention phrase detected' : 'no abstention detected',
        };
    }

    if (type === 'llm-judge') {
        return { ...base, status: 'pending-review', detail: 'llm-judge 未实现，需人工/盲评' };
    }

    return { ...base, status: 'error', detail: `unknown answer type: ${type}` };
}

export const DEFAULT_ABSTAIN_PHRASES = Object.freeze([
    '不知道',
    '不确定',
    '没有提到',
    '未提及',
    '无法确定',
    '没有相关信息',
    '记忆中没有',
    '历史中没有',
    '没有记录',
    "i don't know",
    'not mentioned',
    'no information',
]);

export function normalizeAnswerText(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[，。！？、；：""''（）《》〈〉【】「』,.!?;:()\u005b\u005d<>"']/g, '');
}

/**
 * 检测 update 类用例的旧事实污染。
 * @param {string|null} answerText
 * @param {string[]} oldFactValues 旧状态文本（如旧位置“蓝盒”）
 */
export function detectOldFactMention(answerText, oldFactValues = []) {
    if (answerText == null || !oldFactValues.length) {
        return { applicable: oldFactValues.length > 0, mentioned: null, values: [] };
    }
    const normalized = normalizeAnswerText(answerText);
    const mentioned = oldFactValues.filter(v => v && normalized.includes(normalizeAnswerText(v)));
    return { applicable: true, mentioned: mentioned.length > 0, values: mentioned };
}

/**
 * 按协议 §6 链路归因最早失真阶段。
 * @param {object} stages { extraction, retrieval, fusion, rerank, graph, prompt } 各阶段状态
 *   状态枚举：hit | miss | not-applicable | recovered-by-graph | rescued-by-mustkeep
 * @param {object|null} answerResult scoreAnswer 的返回值
 */
export function attributeEarliestFailure(stages, answerResult) {
    const s = stages || {};

    // 最终证据已进入 Prompt 时，中间阶段的 miss 可能是后续 graph 合法恢复，
    // 不能再把成功链路误报成前序失败。
    if (s.prompt === 'hit') {
        if (answerResult?.status === 'scored' && answerResult.correct === false) return 'answer';
        return null;
    }

    // graph 后已有最终证据、但 Prompt 未包含它，根因只能是预算装配。
    if (s.graph === 'hit' || s.graph === 'recovered-by-graph') return 'prompt';

    if (s.extraction === 'miss') return 'extraction';
    if (s.retrieval === 'miss') return 'retrieval';
    if (s.fusion === 'miss') return 'fusion';
    if (s.rerank === 'miss') return 'rerank';
    if (s.graph === 'miss') return 'graph';
    if (s.prompt === 'miss') return 'prompt';
    if (answerResult && answerResult.status === 'scored' && answerResult.correct === false) return 'answer';
    return null;
}

/**
 * 汇总一组用例指标（总体 + 按 category）。
 * @param {Array<{ case: object, metrics: object, answer: object|null, earliestFailure: string|null }>} rows
 */
export function aggregateMetrics(rows) {
    const groups = new Map();
    const push = (key, row) => {
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
    };
    for (const row of rows || []) {
        push('__all__', row);
        push(row.case?.category || 'unknown', row);
    }

    const summarize = (list) => {
        const avg = (values) => {
            const nums = values.filter(v => typeof v === 'number' && Number.isFinite(v));
            return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
        };
        const recallAt5 = avg(list.map(r => r.metrics?.recallAt5));
        const recallAt10 = avg(list.map(r => r.metrics?.recallAt10));
        const precisionAt5 = avg(list.map(r => r.metrics?.precisionAt5));
        const precisionAt10 = avg(list.map(r => r.metrics?.precisionAt10));
        const mrr = avg(list.map(r => r.metrics?.mrr));

        const coverageApplicable = list.filter(r => r.metrics?.requiredAll?.applicable);
        const coverageCovered = coverageApplicable.filter(r => r.metrics?.requiredAll?.covered).length;

        const forbiddenTotal = list.reduce((sum, r) => sum + (r.metrics?.forbidden?.total || 0), 0);
        const forbiddenInTop10 = list.reduce((sum, r) => sum + (r.metrics?.forbidden?.inTop10?.length || 0), 0);
        const forbiddenInPrompt = list.reduce((sum, r) => sum + (r.metrics?.forbidden?.inPrompt?.length || 0), 0);

        const scoredAnswers = list.filter(r => r.answer?.status === 'scored');
        const correctAnswers = scoredAnswers.filter(r => r.answer?.correct === true).length;
        const promptSurfaceRows = list.filter(r => r.answerSurfaceInPrompt?.applicable);
        const promptSurfaceMatches = promptSurfaceRows.filter(r => r.answerSurfaceInPrompt?.matched === true).length;

        const failureCounts = {};
        for (const r of list) {
            if (!r.earliestFailure) continue;
            failureCounts[r.earliestFailure] = (failureCounts[r.earliestFailure] || 0) + 1;
        }

        const recallLatencies = list.map(r => r.efficiency?.recallMs).filter(v => typeof v === 'number');
        const readerLatencies = list.map(r => r.efficiency?.readerMs).filter(v => typeof v === 'number');

        return {
            cases: list.length,
            recallAt5: round4(recallAt5),
            recallAt10: round4(recallAt10),
            precisionAt5: round4(precisionAt5),
            precisionAt10: round4(precisionAt10),
            mrr: round4(mrr),
            requiredAllCoverage: coverageApplicable.length
                ? round4(coverageCovered / coverageApplicable.length)
                : null,
            forbiddenEvidenceRate: {
                top10: forbiddenTotal ? round4(forbiddenInTop10 / forbiddenTotal) : null,
                prompt: forbiddenTotal ? round4(forbiddenInPrompt / forbiddenTotal) : null,
                totalForbidden: forbiddenTotal,
            },
            answerAccuracy: scoredAnswers.length ? round4(correctAnswers / scoredAnswers.length) : null,
            answerSurfaceInPromptRate: promptSurfaceRows.length
                ? round4(promptSurfaceMatches / promptSurfaceRows.length)
                : null,
            answersScored: scoredAnswers.length,
            answersPending: list.filter(r => r.answer?.status === 'pending-review').length,
            failures: failureCounts,
            latency: {
                recallP50: percentile(recallLatencies, 0.5),
                recallP95: percentile(recallLatencies, 0.95),
                readerP50: percentile(readerLatencies, 0.5),
                readerP95: percentile(readerLatencies, 0.95),
            },
        };
    };

    const out = { overall: summarize(groups.get('__all__') || []), byCategory: {} };
    for (const [key, list] of groups.entries()) {
        if (key === '__all__') continue;
        out.byCategory[key] = summarize(list);
    }
    return out;
}

function round4(value) {
    return typeof value === 'number' && Number.isFinite(value) ? Math.round(value * 10000) / 10000 : null;
}

function percentile(values, p) {
    const nums = values.filter(v => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);
    if (!nums.length) return null;
    const idx = Math.min(nums.length - 1, Math.max(0, Math.ceil(p * nums.length) - 1));
    return nums[idx];
}
