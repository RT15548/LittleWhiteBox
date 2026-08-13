// Gold Eval - structured human adjudication for machine-negative reader answers.

export const ADJUDICATION_CLASSIFICATIONS = Object.freeze([
    'prompt-insufficient',
    'scorer-false-negative',
    'model-error',
    'fixture-defect',
]);

export const ADJUDICATION_SCHEMA_VERSION = 2;

export const PROMPT_EVIDENCE_ASSESSMENTS = Object.freeze([
    'sufficient',
    'missing',
    'distorted',
]);

function classificationFor({ promptEvidence, semanticPass, fixtureDefect }) {
    if (fixtureDefect) return 'fixture-defect';
    if (promptEvidence !== 'sufficient') return 'prompt-insufficient';
    return semanticPass ? 'scorer-false-negative' : 'model-error';
}

function parseLegacyRow(raw, index, errors) {
    const classification = String(raw?.classification || '').trim();
    if (!ADJUDICATION_CLASSIFICATIONS.includes(classification)) {
        errors.push(`第 ${index + 1} 行 classification 无效: ${classification}`);
    }
    return {
        schemaVersion: 1,
        classification,
        promptEvidence: classification === 'prompt-insufficient' ? 'missing' : 'sufficient',
        fixtureDefect: classification === 'fixture-defect',
        semanticPass: raw?.semanticPass === true,
    };
}

function parseCurrentRow(raw, index, errors) {
    const promptEvidence = String(raw?.promptEvidence || '').trim();
    const semanticPass = raw?.semanticPass === true;
    const fixtureDefect = raw?.fixtureDefect === true;
    if (!PROMPT_EVIDENCE_ASSESSMENTS.includes(promptEvidence)) {
        errors.push(`第 ${index + 1} 行 promptEvidence 无效: ${promptEvidence}`);
    }
    if (!fixtureDefect && promptEvidence !== 'sufficient' && semanticPass) {
        errors.push(`第 ${index + 1} 行 Prompt 证据不足或失真时不得 semanticPass=true`);
    }
    return {
        schemaVersion: ADJUDICATION_SCHEMA_VERSION,
        promptEvidence,
        fixtureDefect,
        semanticPass,
        classification: classificationFor({ promptEvidence, semanticPass, fixtureDefect }),
    };
}

export function parseAdjudicationJsonl(text) {
    const rows = [];
    const errors = [];
    const ids = new Set();
    String(text || '').split(/\r?\n/).forEach((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        let raw;
        try {
            raw = JSON.parse(trimmed);
        } catch (error) {
            errors.push(`第 ${index + 1} 行 JSON 无效: ${error?.message || error}`);
            return;
        }
        const caseId = String(raw?.caseId || '').trim();
        const schemaVersion = raw?.schemaVersion == null ? 1 : Number(raw.schemaVersion);
        const note = String(raw?.note || '').trim();
        if (!caseId) errors.push(`第 ${index + 1} 行缺少 caseId`);
        if (![1, ADJUDICATION_SCHEMA_VERSION].includes(schemaVersion)) {
            errors.push(`第 ${index + 1} 行 schemaVersion 不受支持: ${raw?.schemaVersion}`);
        }
        if (schemaVersion === ADJUDICATION_SCHEMA_VERSION && !note) {
            errors.push(`第 ${index + 1} 行 v2 裁决缺少 note`);
        }
        if (ids.has(caseId)) errors.push(`caseId 重复: ${caseId}`);
        ids.add(caseId);
        const parsed = schemaVersion === ADJUDICATION_SCHEMA_VERSION
            ? parseCurrentRow(raw, index, errors)
            : parseLegacyRow(raw, index, errors);
        rows.push({
            caseId,
            ...parsed,
            note,
        });
    });
    return { rows, errors };
}

function requiredFloors(goldCase) {
    return [
        ...(goldCase?.evidence?.requiredAll || []),
        ...(goldCase?.evidence?.requiredAny || []),
    ].filter(Number.isInteger);
}

function allRequiredInPrompt(goldCase, stageTrace) {
    const promptFloors = new Set((stageTrace?.promptFloors || []).filter(Number.isInteger));
    const requiredAll = goldCase?.evidence?.requiredAll || [];
    const requiredAny = goldCase?.evidence?.requiredAny || [];
    const allCovered = requiredAll.every(floor => promptFloors.has(floor));
    const anyCovered = requiredAny.length === 0 || requiredAny.some(floor => promptFloors.has(floor));
    return requiredFloors(goldCase).length > 0 && allCovered && anyCovered;
}

function answerEvidenceInPrompt(goldCase, stageTrace) {
    return allRequiredInPrompt(goldCase, stageTrace)
        || stageTrace?.answerSurfaceInPrompt?.matched === true;
}

function firstMissStage(stageTrace) {
    const stages = ['extraction', 'retrieval', 'fusion', 'rerank', 'graph', 'prompt'];
    return stages.find(stage => stageTrace?.stages?.[stage] === 'miss') || 'prompt';
}

function failureOwner({ annotation, goldCase, stageTrace, machinePass }) {
    if (machinePass) return 'machine-pass';
    if (annotation?.fixtureDefect) return 'fixture';
    if (annotation?.promptEvidence === 'distorted') return 'summary-fidelity';
    if (annotation?.promptEvidence === 'missing') {
        return allRequiredInPrompt(goldCase, stageTrace)
            ? 'summary-fidelity'
            : firstMissStage(stageTrace);
    }
    return annotation?.semanticPass ? 'scorer' : 'reader';
}

export function validateAdjudication({ cases, stageTraces, rows }) {
    const errors = [];
    const caseById = new Map((cases || []).map(item => [item.id, item]));
    const traceById = new Map((stageTraces || []).map(item => [item.id, item]));
    const rowById = new Map((rows || []).map(item => [item.caseId, item]));
    const machineNegatives = (stageTraces || []).filter(item => item?.answer?.correct === false);
    const negativeIds = new Set(machineNegatives.map(item => item.id));

    for (const row of rows || []) {
        if (!caseById.has(row.caseId)) errors.push(`裁决引用未知 case: ${row.caseId}`);
        if (!negativeIds.has(row.caseId)) errors.push(`裁决只能覆盖 machine correct=false: ${row.caseId}`);
    }
    for (const trace of machineNegatives) {
        if (!rowById.has(trace.id)) errors.push(`缺少机器错题裁决: ${trace.id}`);
    }

    for (const row of rows || []) {
        const goldCase = caseById.get(row.caseId);
        const trace = traceById.get(row.caseId);
        if (!goldCase || !trace) continue;
        const rowSchemaVersion = row.schemaVersion ?? 1;
        const evidenceSignalPresent = answerEvidenceInPrompt(goldCase, trace);
        const expectedClassification = classificationFor(row);
        if (rowSchemaVersion === ADJUDICATION_SCHEMA_VERSION
            && row.classification !== expectedClassification) {
            errors.push(`v2 classification 未由语义裁决状态正确推导: ${row.caseId}`);
        }
        if (rowSchemaVersion === 1 && row.classification === 'prompt-insufficient' && evidenceSignalPresent) {
            errors.push(`prompt-insufficient 但 required evidence 已在 Prompt: ${row.caseId}`);
        }
        if (rowSchemaVersion === 1
            && ['scorer-false-negative', 'model-error'].includes(row.classification)
            && !evidenceSignalPresent) {
            errors.push(`${row.classification} 但 required evidence 不完整: ${row.caseId}`);
        }
        if (row.classification === 'scorer-false-negative' && !row.semanticPass) {
            errors.push(`scorer-false-negative 必须 semanticPass=true: ${row.caseId}`);
        }
        if (['prompt-insufficient', 'model-error'].includes(row.classification) && row.semanticPass) {
            errors.push(`${row.classification} 不得 semanticPass=true: ${row.caseId}`);
        }
    }

    const summaryRows = (stageTraces || []).map(trace => {
        const goldCase = caseById.get(trace.id);
        const annotation = rowById.get(trace.id) || null;
        const machinePass = trace?.answer?.correct === true;
        const evidenceSignalPresent = answerEvidenceInPrompt(goldCase, trace);
        const promptEvidence = annotation?.schemaVersion === ADJUDICATION_SCHEMA_VERSION
            ? annotation.promptEvidence
            : (evidenceSignalPresent ? 'sufficient' : 'missing');
        return {
            caseId: trace.id,
            evidencePresent: promptEvidence === 'sufficient',
            evidenceSignalPresent,
            evidenceSignalConflict: annotation?.schemaVersion === ADJUDICATION_SCHEMA_VERSION
                && promptEvidence !== 'sufficient'
                && evidenceSignalPresent,
            promptEvidence,
            machinePass,
            semanticPass: machinePass || annotation?.semanticPass === true,
            classification: annotation?.classification || (machinePass ? 'machine-pass' : null),
            failureOwner: failureOwner({ annotation, goldCase, stageTrace: trace, machinePass }),
        };
    });
    const evidencePresentRows = summaryRows.filter(item => item.evidencePresent);
    const counts = {};
    const promptEvidenceCounts = {};
    const failureOwners = {};
    for (const item of summaryRows) counts[item.classification] = (counts[item.classification] || 0) + 1;
    for (const item of summaryRows) {
        promptEvidenceCounts[item.promptEvidence] = (promptEvidenceCounts[item.promptEvidence] || 0) + 1;
        failureOwners[item.failureOwner] = (failureOwners[item.failureOwner] || 0) + 1;
    }
    return {
        ok: errors.length === 0,
        errors,
        summary: {
            cases: summaryRows.length,
            machinePass: summaryRows.filter(item => item.machinePass).length,
            annotatedMachineNegatives: rows.length,
            semanticPass: summaryRows.filter(item => item.semanticPass).length,
            semanticAccuracy: summaryRows.length
                ? summaryRows.filter(item => item.semanticPass).length / summaryRows.length
                : null,
            evidencePresent: evidencePresentRows.length,
            evidencePresentSemanticPass: evidencePresentRows.filter(item => item.semanticPass).length,
            evidencePresentSemanticAccuracy: evidencePresentRows.length
                ? evidencePresentRows.filter(item => item.semanticPass).length / evidencePresentRows.length
                : null,
            evidenceSignalConflicts: summaryRows.filter(item => item.evidenceSignalConflict).length,
            promptEvidence: promptEvidenceCounts,
            classifications: counts,
            failureOwners,
        },
        rows: summaryRows,
    };
}
