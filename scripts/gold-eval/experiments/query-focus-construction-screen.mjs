/* global Buffer, process */
// H-Q-FOCUS zero-API construction contract. It audits a replay-only observer;
// it never selects the candidate arm or evaluates retrieval quality.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { assertProductionGoldCapture, loadGoldCapture, sha256File } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';

const OBSERVATION_MODE = 'story-summary-replay-gold-recall-cassette';

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function writeAtomic(filePath, content) {
    const temporary = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.writeFile(temporary, content, 'utf8');
    await fs.rename(temporary, filePath);
}

function normalizedTerm(value) {
    return String(value || '').trim().toLocaleLowerCase();
}

function stringList(value, label, violations) {
    if (!Array.isArray(value)) {
        violations.push(`${label}-not-array`);
        return [];
    }
    const list = value.map(item => String(item || '').trim());
    if (list.some(item => !item)) violations.push(`${label}-blank`);
    return list;
}

function termSet(values) {
    return new Set(values.map(normalizedTerm).filter(Boolean));
}

function sameSequence(left, right) {
    return left.length === right.length && left.every((item, index) => item === right[index]);
}

function readArm(value, label, violations) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        violations.push(`${label}-missing`);
        return { focusTerms: [], focusCharacters: [], lexicalTerms: [] };
    }
    return {
        focusTerms: stringList(value.focusTerms, `${label}-focus-terms`, violations),
        focusCharacters: stringList(value.focusCharacters, `${label}-focus-characters`, violations),
        lexicalTerms: stringList(value.lexicalTerms, `${label}-lexical-terms`, violations),
    };
}

/**
 * Resolve the pre-registered H-Q-FOCUS arm from a replay-only observer value.
 * This intentionally reports only structural contract data: no source text or
 * private terms are copied to the result artifact.
 */
export function assessQueryFocusOwnership(value) {
    const violations = [];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return {
            valid: false,
            usesFocusOnlyCandidate: false,
            baseline: { focusTerms: [], focusCharacters: [], lexicalTerms: [] },
            focusOnly: { focusTerms: [], focusCharacters: [], lexicalTerms: [] },
            candidate: { focusTerms: [], focusCharacters: [], lexicalTerms: [] },
            violations: ['ownership-missing'],
        };
    }

    const baseline = readArm(value.baseline, 'baseline', violations);
    const focusOnly = readArm(value.focusOnly, 'focus-only', violations);
    if (typeof value.usesFocusOnlyCandidate !== 'boolean') violations.push('candidate-condition-not-boolean');
    const usesFocusOnlyCandidate = value.usesFocusOnlyCandidate === true;
    const candidate = usesFocusOnlyCandidate ? focusOnly : baseline;

    const baselineEntities = termSet(baseline.focusTerms);
    const focusEntities = termSet(focusOnly.focusTerms);
    const contextOnlyEntities = new Set([...baselineEntities].filter(term => !focusEntities.has(term)));
    const candidateEntities = termSet(candidate.focusTerms);
    const candidateLexicalTerms = termSet(candidate.lexicalTerms);
    const candidateCharacters = termSet(candidate.focusCharacters);

    if (usesFocusOnlyCandidate) {
        if (!focusOnly.focusCharacters.length) violations.push('focus-only-without-trusted-character');
        if ([...focusEntities].some(term => !baselineEntities.has(term))) violations.push('focus-entity-not-in-baseline-combined-text');
        if ([...candidateCharacters].some(term => !focusEntities.has(term))) violations.push('focus-character-not-in-focus-terms');
        if ([...candidateEntities].some(term => contextOnlyEntities.has(term))) violations.push('candidate-focus-contains-context-only-entity');
        if ([...candidateLexicalTerms].some(term => contextOnlyEntities.has(term))) violations.push('candidate-lexical-contains-context-only-entity');
    } else if (!sameSequence(candidate.focusTerms, baseline.focusTerms)
        || !sameSequence(candidate.focusCharacters, baseline.focusCharacters)
        || !sameSequence(candidate.lexicalTerms, baseline.lexicalTerms)) {
        violations.push('fallback-not-identical-to-baseline');
    }

    return {
        valid: violations.length === 0,
        usesFocusOnlyCandidate,
        baseline,
        focusOnly,
        candidate,
        violations,
    };
}

function assertObserverProvenance(source, observer) {
    const violations = [];
    if (observer.manifest.mode !== OBSERVATION_MODE) violations.push('observer-mode');
    if (observer.manifest.capture?.transportMode !== 'strict-cassette') violations.push('observer-transport-mode');
    if (observer.manifest.sourceCapture?.runId !== source.manifest.runId) violations.push('source-run-id');
    if (observer.manifest.sourceCapture?.casesHash !== source.manifest.capture?.executedCasesHash) violations.push('source-cases-hash');
    if (observer.manifest.progress?.completedCases !== source.cases.length) violations.push('observer-case-count');
    if (observer.manifest.progress?.productionExternalCalls !== 0) violations.push('production-network-not-zero');
    if (observer.manifest.progress?.readerExternalCalls !== 0) violations.push('reader-network-not-zero');
    if (observer.manifest.progress?.productionTransportRequests !== source.manifest.progress?.productionTransportRequests) {
        violations.push('cassette-request-count');
    }
    if (observer.manifest.data?.sampleHash !== source.manifest.data?.sampleHash) violations.push('sample-hash');
    if (observer.manifest.data?.snapshotHash !== source.manifest.data?.snapshotHash) violations.push('snapshot-hash');

    let promptMismatches = 0;
    for (let index = 0; index < source.cases.length; index++) {
        const sourceCase = source.cases[index];
        const observedCase = observer.cases[index];
        const sourcePrompt = source.prompts[index];
        const observedPrompt = observer.prompts[index];
        if (observedCase?.id !== sourceCase?.id || observedPrompt?.caseId !== sourceCase?.id
            || observedPrompt?.promptHash !== sourcePrompt?.promptHash) {
            promptMismatches++;
        }
    }
    if (promptMismatches) violations.push('prompt-identity');
    return { valid: violations.length === 0, violations, promptMismatches };
}

function summarizeRows(rows) {
    const focusOnly = rows.filter(row => row.ownership.usesFocusOnlyCandidate);
    const fallback = rows.filter(row => !row.ownership.usesFocusOnlyCandidate);
    const violationCounts = {};
    for (const row of rows) {
        for (const violation of row.ownership.violations) {
            violationCounts[violation] = (violationCounts[violation] || 0) + 1;
        }
    }
    return {
        cases: rows.length,
        focusOnlyCases: focusOnly.length,
        fallbackCases: fallback.length,
        invalidOwnershipCases: rows.filter(row => !row.ownership.valid).length,
        violationCounts,
    };
}

async function analyzeSource({ id, sourceDir, observerDir }) {
    const [source, observer] = await Promise.all([loadGoldCapture(sourceDir), loadGoldCapture(observerDir)]);
    assertProductionGoldCapture(source);
    const provenance = assertObserverProvenance(source, observer);
    const rows = observer.cases.map((goldCase, index) => ({
        caseId: goldCase.id,
        ownership: assessQueryFocusOwnership(observer.promptInputs[index]?.observationBase?.diagnosticValues?.queryFocusOwnership),
    }));
    return {
        id,
        source: {
            runId: source.manifest.runId,
            runDir: source.runDir,
            promptHash: source.manifest.artifactHashes.prompts,
            transportRequests: source.manifest.progress.productionTransportRequests,
        },
        observer: {
            runId: observer.manifest.runId,
            runDir: observer.runDir,
            promptHash: observer.manifest.artifactHashes.prompts,
            transportRequests: observer.manifest.progress.productionTransportRequests,
        },
        provenance,
        summary: summarizeRows(rows),
    };
}

function renderReport(result) {
    return [
        '# H-Q-FOCUS Construction Contract',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        '- API：0。此步骤只审计 strict-cassette observer，未执行候选查询、Embedding、Rerank 或 reader。',
        '',
        '| Source | Cases | Focus-only | Combined fallback | Prompt identity mismatch | Ownership violations |',
        '|---|---:|---:|---:|---:|---:|',
        ...result.sources.map(source => `| ${source.id} | ${source.summary.cases} | ${source.summary.focusOnlyCases} | ${source.summary.fallbackCases} | ${source.provenance.promptMismatches} | ${source.summary.invalidOwnershipCases} |`),
        '',
        '## Gate',
        '',
        ...Object.entries(result.gates).map(([key, passed]) => `- ${key}：${passed ? 'PASS' : 'FAIL'}`),
        '',
        '> 通过仅证明 H-Q-FOCUS 的变量边界与回退边界可被真实插件回放构造；不代表召回或回答质量提升。',
        '',
    ].join('\n');
}

function campaignCapture(study, id) {
    const job = study.evidence?.baselineCampaign?.jobs?.find(item => item.id === id);
    if (!job?.capture?.runDir) throw new Error(`STUDY 缺少 ${id} baseline capture`);
    return job.capture.runDir;
}

export async function runQueryFocusConstructionScreen({
    studyPath,
    outputDir,
    realObservationDir,
    fantasyObservationDir,
    modernObservationDir,
}) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    const hypothesis = loaded.study.hypotheses.find(item => item.id === 'H-Q-FOCUS');
    if (!audit.ok || loaded.study.phase !== 'experiments' || loaded.study.active?.hypothesisId !== 'H-Q-FOCUS'
        || hypothesis?.status !== 'preregistered') {
        throw new Error('STUDY audit/phase/active hypothesis 不允许 H-Q-FOCUS construction screen');
    }
    if (!realObservationDir || !fantasyObservationDir || !modernObservationDir) {
        throw new Error('H-Q-FOCUS construction screen 需要 real/fantasy/modern 三份 observer run');
    }
    const sources = await Promise.all([
        analyzeSource({
            id: 'real-800',
            sourceDir: loaded.study.evidence.sourceCapture.runDir,
            observerDir: realObservationDir,
        }),
        analyzeSource({
            id: 'controlled-fantasy',
            sourceDir: campaignCapture(loaded.study, 'controlled-fantasy'),
            observerDir: fantasyObservationDir,
        }),
        analyzeSource({
            id: 'controlled-modern',
            sourceDir: campaignCapture(loaded.study, 'controlled-modern'),
            observerDir: modernObservationDir,
        }),
    ]);
    const gates = {
        baselineIdentity: sources.every(source => source.provenance.valid),
        completeOwnershipDiagnostics: sources.every(source => source.summary.cases > 0 && source.summary.invalidOwnershipCases === 0),
        zeroApi: sources.every(source => source.observer.transportRequests === source.source.transportRequests),
        realCandidateCoverage: sources.find(source => source.id === 'real-800').summary.focusOnlyCases > 0,
        controlledFallbackContract: sources.filter(source => source.id !== 'real-800')
            .every(source => source.summary.invalidOwnershipCases === 0),
    };
    const valid = gates.baselineIdentity && gates.completeOwnershipDiagnostics && gates.zeroApi;
    const passed = valid && Object.values(gates).every(Boolean);
    const experimentId = path.basename(outputDir);
    if (!/^H-Q-FOCUS-construction-v\d+$/.test(experimentId)) {
        throw new Error(`H-Q-FOCUS output 目录名必须是版本化 attempt id: ${experimentId}`);
    }
    const result = {
        schemaVersion: 1,
        experimentId,
        hypothesis: 'When the pending focus text contains a trusted character, focusTerms, focusCharacters, and initial lexicalTerms come only from that focus text; otherwise they exactly fall back to current combined text.',
        arm: 'query focus ownership only; query segments, weights, rerank query, hints, thresholds, fusion, rerank, prompt, and reader remain frozen',
        network: { modelApiCalls: 0, productionTransportCalls: 0 },
        gates,
        decision: {
            status: !valid ? 'invalid' : (passed ? 'screen-pass' : 'reject'),
            reason: !valid
                ? 'baseline identity、observer provenance 或 construction contract 失败；不得建立 candidate。'
                : (passed
                    ? '三个冻结世界均复现基线 Prompt，focus-only 与 fallback 变量边界通过；只授权建立 isolated live query candidate。'
                    : '预注册覆盖门槛未满足；不得调整 fallback、术语数或其他查询参数追结果。'),
        },
        sources,
    };

    await fs.mkdir(outputDir, { recursive: false });
    const resultText = `${JSON.stringify(result, null, 2)}\n`;
    const reportText = `${renderReport(result)}\n`;
    const resultPath = path.join(outputDir, 'result.json');
    const reportPath = path.join(outputDir, 'report.md');
    await writeAtomic(resultPath, resultText);
    await writeAtomic(reportPath, reportText);
    const scriptPath = fileURLToPath(import.meta.url);
    const inputDirs = [
        ['real-800', loaded.study.evidence.sourceCapture.runDir, realObservationDir],
        ['controlled-fantasy', campaignCapture(loaded.study, 'controlled-fantasy'), fantasyObservationDir],
        ['controlled-modern', campaignCapture(loaded.study, 'controlled-modern'), modernObservationDir],
    ];
    const manifest = {
        schemaVersion: 1,
        experimentId,
        study: { path: path.resolve(studyPath).replace(/\\/g, '/'), sha256: loaded.hash },
        script: { path: scriptPath.replace(/\\/g, '/'), sha256: await sha256File(scriptPath) },
        inputs: await Promise.all(inputDirs.map(async ([id, sourceDir, observerDir]) => ({
            id,
            sourceManifest: {
                path: path.join(sourceDir, 'manifest.json').replace(/\\/g, '/'),
                sha256: await sha256File(path.join(sourceDir, 'manifest.json')),
            },
            observerManifest: {
                path: path.join(observerDir, 'manifest.json').replace(/\\/g, '/'),
                sha256: await sha256File(path.join(observerDir, 'manifest.json')),
            },
            observerPromptInputs: {
                path: path.join(observerDir, 'prompt-inputs.jsonl').replace(/\\/g, '/'),
                sha256: await sha256File(path.join(observerDir, 'prompt-inputs.jsonl')),
            },
        }))),
        result: { path: resultPath.replace(/\\/g, '/'), sha256: sha256(resultText), bytes: Buffer.byteLength(resultText) },
        report: { path: reportPath.replace(/\\/g, '/'), sha256: sha256(reportText), bytes: Buffer.byteLength(reportText) },
    };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestPath = path.join(outputDir, 'manifest.json');
    await writeAtomic(manifestPath, manifestText);
    return { result, manifest: { ...manifest, path: manifestPath.replace(/\\/g, '/'), sha256: sha256(manifestText) } };
}

function parseArgs(argv) {
    return Object.fromEntries(argv.filter(item => item.startsWith('--')).map(item => {
        const [key, ...rest] = item.slice(2).split('=');
        return [key, rest.join('=')];
    }));
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.study || !args.output || !args['real-observation'] || !args['fantasy-observation'] || !args['modern-observation']) {
        throw new Error('用法: query-focus-construction-screen.mjs --study=<STUDY.json> --output=<experiment-dir> --real-observation=<run> --fantasy-observation=<run> --modern-observation=<run>');
    }
    const completed = await runQueryFocusConstructionScreen({
        studyPath: path.resolve(args.study),
        outputDir: path.resolve(args.output),
        realObservationDir: path.resolve(args['real-observation']),
        fantasyObservationDir: path.resolve(args['fantasy-observation']),
        modernObservationDir: path.resolve(args['modern-observation']),
    });
    process.stdout.write(`${JSON.stringify({
        decision: completed.result.decision,
        gates: completed.result.gates,
        sources: completed.result.sources.map(source => ({ id: source.id, summary: source.summary, provenance: source.provenance })),
        manifest: completed.manifest,
    }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
