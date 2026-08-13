// Gold Eval - paired, conversation-level comparison for evidence-only natural
// captures. Case counts never determine a conversation's weight.

function assertMode(capture, expected, label) {
    const actual = capture?.manifest?.mode;
    if (actual !== expected) throw new Error(`${label} mode无效: ${actual || 'unknown'}`);
    if (capture?.manifest?.status !== 'valid') throw new Error(`${label}不是valid run`);
}

function promptPass(trace) {
    return trace?.stages?.prompt === 'hit';
}

function rate(value, total) {
    return total ? value / total : null;
}

function round6(value) {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.round(value * 1e6) / 1e6
        : null;
}

function boundaryMap(rows, label) {
    const out = new Map();
    for (const row of rows || []) {
        const caseId = String(row?.caseId || '');
        if (!caseId || out.has(caseId) || !/^[a-f0-9]{64}$/.test(String(row?.sha256 || ''))) {
            throw new Error(`${label} boundary snapshot身份无效`);
        }
        out.set(caseId, row.sha256);
    }
    return out;
}

export function compareNaturalPair({ baseline, candidate, corpusId }) {
    assertMode(baseline, 'story-summary-replay-natural-capture', 'baseline');
    assertMode(candidate, 'story-summary-replay-natural-recall', 'candidate');
    if (candidate.manifest.sourceCapture?.runId !== baseline.manifest.runId) {
        throw new Error('candidate没有消费指定baseline capture');
    }
    const id = String(corpusId || baseline.cases?.[0]?.corpusId || '').trim();
    if (!id) throw new Error('natural comparison缺少corpusId');
    if (baseline.cases.length !== candidate.cases.length || baseline.cases.length === 0) {
        throw new Error('baseline/candidate case数量不一致或为空');
    }

    const baselineBoundaries = boundaryMap(baseline.manifest.boundarySnapshots, 'baseline');
    const candidateBoundaries = boundaryMap(candidate.manifest.consumedBoundarySnapshots, 'candidate');
    if (baselineBoundaries.size !== baseline.cases.length || candidateBoundaries.size !== candidate.cases.length) {
        throw new Error('baseline/candidate boundary snapshot数量不完整');
    }

    const cases = [];
    let baselinePass = 0;
    let candidatePass = 0;
    let wins = 0;
    let losses = 0;
    let ties = 0;
    for (let index = 0; index < baseline.cases.length; index++) {
        const baselineCase = baseline.cases[index];
        const candidateCase = candidate.cases[index];
        const caseId = String(baselineCase?.id || '');
        if (!caseId || candidateCase?.id !== caseId
            || baseline.stageTraces[index]?.id !== caseId
            || candidate.stageTraces[index]?.id !== caseId) {
            throw new Error(`baseline/candidate case身份或顺序不一致: index=${index}`);
        }
        if (baselineCase.corpusId !== id || candidateCase.corpusId !== id) {
            throw new Error(`case corpusId与比较单元不一致: ${caseId}`);
        }
        if (baselineBoundaries.get(caseId) !== candidateBoundaries.get(caseId)) {
            throw new Error(`candidate没有消费同一boundary snapshot: ${caseId}`);
        }
        const before = promptPass(baseline.stageTraces[index]);
        const after = promptPass(candidate.stageTraces[index]);
        if (before) baselinePass += 1;
        if (after) candidatePass += 1;
        let outcome = 'tie';
        if (!before && after) {
            outcome = 'win';
            wins += 1;
        } else if (before && !after) {
            outcome = 'loss';
            losses += 1;
        } else {
            ties += 1;
        }
        cases.push({ caseId, baselinePass: before, candidatePass: after, outcome });
    }

    const total = cases.length;
    const baselineRate = rate(baselinePass, total);
    const candidateRate = rate(candidatePass, total);
    const delta = candidateRate - baselineRate;
    const baselineFull = baselinePass === total;
    return {
        corpusId: id,
        baselineRunId: baseline.manifest.runId,
        candidateRunId: candidate.manifest.runId,
        cases: total,
        baseline: { pass: baselinePass, rate: round6(baselineRate) },
        candidate: { pass: candidatePass, rate: round6(candidateRate) },
        paired: { wins, losses, ties },
        delta: round6(delta),
        baselineFull,
        strictImprovement: !baselineFull && delta > 0,
        nonRegression: delta >= 0,
        casesDetail: cases,
    };
}

function lcg(seed) {
    let state = seed >>> 0;
    return () => {
        state = (Math.imul(1664525, state) + 1013904223) >>> 0;
        return state / 0x100000000;
    };
}

function percentile(values, p) {
    const sorted = [...values].sort((a, b) => a - b);
    if (!sorted.length) return null;
    const index = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))));
    return sorted[index];
}

export function aggregateNaturalConversationMacro(comparisons, {
    bootstrapIterations = 10000,
    bootstrapSeed = 0x4c5742,
} = {}) {
    const rows = [...(comparisons || [])];
    if (!rows.length) throw new Error('conversation macro至少需要一份聊天');
    if (new Set(rows.map(row => row.corpusId)).size !== rows.length) {
        throw new Error('conversation macro不允许重复corpusId');
    }
    if (!Number.isInteger(bootstrapIterations) || bootstrapIterations < 1) {
        throw new Error('bootstrapIterations必须是正整数');
    }

    const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    const baselineMacro = mean(rows.map(row => row.baseline.rate));
    const candidateMacro = mean(rows.map(row => row.candidate.rate));
    const delta = candidateMacro - baselineMacro;
    const random = lcg(bootstrapSeed);
    const bootstrappedDeltas = [];
    for (let iteration = 0; iteration < bootstrapIterations; iteration++) {
        const sampled = [];
        for (let index = 0; index < rows.length; index++) {
            sampled.push(rows[Math.floor(random() * rows.length)].delta);
        }
        bootstrappedDeltas.push(mean(sampled));
    }

    const allEligibleImproved = rows.every(row => row.baselineFull
        ? row.nonRegression
        : row.strictImprovement);
    return {
        conversations: rows.length,
        weighting: 'each corpusId has equal weight',
        baselineMacro: round6(baselineMacro),
        candidateMacro: round6(candidateMacro),
        delta: round6(delta),
        paired: {
            wins: rows.reduce((sum, row) => sum + row.paired.wins, 0),
            losses: rows.reduce((sum, row) => sum + row.paired.losses, 0),
            ties: rows.reduce((sum, row) => sum + row.paired.ties, 0),
        },
        bootstrap95: {
            unit: 'conversation',
            seed: bootstrapSeed,
            iterations: bootstrapIterations,
            low: round6(percentile(bootstrappedDeltas, 0.025)),
            high: round6(percentile(bootstrappedDeltas, 0.975)),
        },
        allEligibleImproved,
        macroPositive: delta > 0,
        passed: allEligibleImproved && delta > 0,
        byCorpus: rows.map(row => ({
            corpusId: row.corpusId,
            baseline: row.baseline,
            candidate: row.candidate,
            delta: row.delta,
            paired: row.paired,
            strictImprovement: row.strictImprovement,
            nonRegression: row.nonRegression,
        })),
    };
}
