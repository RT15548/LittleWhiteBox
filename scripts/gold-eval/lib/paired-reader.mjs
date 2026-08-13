// Gold Eval - validated semantic reader outcomes and paired comparisons.

import fs from 'node:fs/promises';

import { parseAdjudicationJsonl, validateAdjudication } from './adjudication.mjs';
import { loadGoldCapture } from './run-store.mjs';

export async function loadValidatedSemanticRun(runDir, adjudicationPath) {
    const capture = await loadGoldCapture(runDir);
    const parsed = parseAdjudicationJsonl(await fs.readFile(adjudicationPath, 'utf8'));
    if (parsed.errors.length) throw new Error(`adjudication parse failed: ${parsed.errors.join('; ')}`);
    const validation = validateAdjudication({
        cases: capture.cases,
        stageTraces: capture.stageTraces,
        rows: parsed.rows,
    });
    if (!validation.ok) throw new Error(`adjudication invalid: ${validation.errors.join('; ')}`);
    const annotationById = new Map(parsed.rows.map(row => [row.caseId, row]));
    const semanticByCase = new Map(capture.stageTraces.map(trace => [
        trace.id,
        trace?.answer?.correct === true || annotationById.get(trace.id)?.semanticPass === true,
    ]));
    return { capture, adjudication: parsed.rows, validation, semanticByCase };
}

export function pairSemanticOutcomes(baseline, candidate) {
    const winIds = [];
    const lossIds = [];
    const tieIds = [];
    for (const [caseId, current] of baseline.entries()) {
        if (!candidate.has(caseId)) throw new Error(`candidate missing case: ${caseId}`);
        const arm = candidate.get(caseId);
        if (!current && arm) winIds.push(caseId);
        else if (current && !arm) lossIds.push(caseId);
        else tieIds.push(caseId);
    }
    for (const caseId of candidate.keys()) {
        if (!baseline.has(caseId)) throw new Error(`candidate has unknown case: ${caseId}`);
    }
    return {
        wins: winIds.length,
        losses: lossIds.length,
        ties: tieIds.length,
        winIds,
        lossIds,
        tieIds,
    };
}
