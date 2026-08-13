/* global Buffer, process */
// H-PROMPT Stage 3 decision from fixed reader + structured semantic adjudication.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { parseAdjudicationJsonl, validateAdjudication } from '../lib/adjudication.mjs';
import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    return sha256(await fs.readFile(filePath));
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function writeAtomic(filePath, content) {
    const temporary = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.writeFile(temporary, content, 'utf8');
    await fs.rename(temporary, filePath);
}

async function validatedSemanticRun(runDir, adjudicationPath) {
    const capture = await loadGoldCapture(runDir);
    const parsed = parseAdjudicationJsonl(await fs.readFile(adjudicationPath, 'utf8'));
    if (parsed.errors.length) throw new Error(`adjudication parse failed: ${parsed.errors.join('; ')}`);
    const validated = validateAdjudication({
        cases: capture.cases,
        stageTraces: capture.stageTraces,
        rows: parsed.rows,
    });
    if (!validated.ok) throw new Error(`adjudication invalid: ${validated.errors.join('; ')}`);
    const semanticByCase = new Map(capture.stageTraces.map(trace => {
        const annotation = parsed.rows.find(row => row.caseId === trace.id);
        return [trace.id, trace?.answer?.correct === true || annotation?.semanticPass === true];
    }));
    return { capture, adjudication: parsed.rows, validation: validated, semanticByCase };
}

function pairedSemantic(baseline, candidate) {
    const wins = [];
    const losses = [];
    const ties = [];
    for (const [caseId, current] of baseline.entries()) {
        if (!candidate.has(caseId)) throw new Error(`candidate missing case: ${caseId}`);
        const arm = candidate.get(caseId);
        if (!current && arm) wins.push(caseId);
        else if (current && !arm) losses.push(caseId);
        else ties.push(caseId);
    }
    return { wins: wins.length, losses: losses.length, ties: ties.length, winIds: wins, lossIds: losses };
}

function combination(n, k) {
    const limit = Math.min(k, n - k);
    let value = 1;
    for (let index = 1; index <= limit; index++) value = value * (n - limit + index) / index;
    return value;
}

export function exactMcNemarP(wins, losses) {
    const discordant = wins + losses;
    if (!discordant) return 1;
    const tail = Math.min(wins, losses);
    let probability = 0;
    for (let index = 0; index <= tail; index++) probability += combination(discordant, index) / (2 ** discordant);
    return Math.min(1, probability * 2);
}

function renderReport(result) {
    const baseline = result.semantic.baseline;
    const candidate = result.semantic.candidate;
    const paired = result.semantic.paired;
    return [
        '# H-PROMPT Fixed-reader Decision',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        `- Baseline semantic：${baseline.passed}/${baseline.cases} (${(baseline.accuracy * 100).toFixed(2)}%)`,
        `- Candidate semantic：${candidate.passed}/${candidate.cases} (${(candidate.accuracy * 100).toFixed(2)}%)`,
        `- Paired：${paired.wins} win / ${paired.losses} loss / ${paired.ties} tie；exact McNemar p=${paired.exactMcNemarP}`,
        `- 唯一 loss：${paired.lossIds.join(', ') || 'none'}`,
        '- Controlled：两个世界 Prompt 逐字不变，复用既有人工语义 24/24 + 24/24。',
        '',
        '## Gate',
        '',
        ...Object.entries(result.gates).map(([key, value]) => `- ${key}：${value ? 'PASS' : 'FAIL'}`),
        '',
        '> H-PROMPT 只作为独立机制 dev-passed；尚未组合、未跑公共 full-dev、未消费 holdout、未做 browser E2E，正式插件继续冻结。',
        '',
    ].join('\n');
}

export async function runPromptReaderDecision({
    studyPath,
    candidateReaderDir,
    candidateAdjudicationPath,
    candidateAuditPath,
    outputDir,
}) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    if (!audit.ok || loaded.study.active.hypothesisId !== 'H-PROMPT') {
        throw new Error('STUDY audit/active hypothesis 不允许 H-PROMPT reader decision');
    }
    const [baseline, candidate, candidateAudit] = await Promise.all([
        validatedSemanticRun(loaded.study.evidence.readerBaseline.runDir, loaded.study.evidence.adjudication.path),
        validatedSemanticRun(candidateReaderDir, candidateAdjudicationPath),
        readJson(candidateAuditPath),
    ]);
    const paired = pairedSemantic(baseline.semanticByCase, candidate.semanticByCase);
    paired.exactMcNemarP = exactMcNemarP(paired.wins, paired.losses);
    const candidateManifest = candidate.capture.manifest;
    const controlledPairs = candidateAudit.pairs.filter(pair => pair.id !== 'real-800');
    const controlledBaselineValid = loaded.study.evidence.baselineCampaign.jobs.every(job => {
        const pair = controlledPairs.find(item => item.id === job.id);
        return pair?.summary?.changedPrompts === 0;
    });
    const controlledSemantic = loaded.study.evidence.baselineCampaign.jobs.map(job => {
        const check = audit.checks.find(item => item.label === `baselineCampaign.${job.id}.adjudication`);
        return { id: job.id, semanticPass: check?.summary?.semanticPass ?? null, cases: check?.summary?.cases ?? null };
    });
    const gates = {
        validReaderNoExternalFailure: candidateManifest.status === 'valid'
            && candidateManifest.progress?.completedCases === candidateManifest.progress?.totalCases
            && candidateManifest.progress?.productionExternalCalls === 0
            && candidateManifest.progress?.readerExternalCalls === candidateManifest.progress?.totalCases,
        candidateSemanticHigher: candidate.validation.summary.semanticPass > baseline.validation.summary.semanticPass,
        pairedWinsGreaterThanLosses: paired.wins > paired.losses,
        controlledPromptsIdentical: controlledBaselineValid,
        controlledSemantic24Each: controlledSemantic.every(item => item.semanticPass === 24 && item.cases === 24),
        candidatePatchIdentity: candidateAudit.gates?.candidateIdentity === true
            && candidateAudit.gates?.screenAlignment === true,
    };
    const passed = Object.values(gates).every(Boolean);
    const result = {
        schemaVersion: 1,
        experimentId: path.basename(outputDir),
        semantic: {
            baseline: {
                runId: baseline.capture.manifest.runId,
                cases: baseline.validation.summary.cases,
                passed: baseline.validation.summary.semanticPass,
                accuracy: baseline.validation.summary.semanticAccuracy,
                classifications: baseline.validation.summary.classifications,
            },
            candidate: {
                runId: candidate.capture.manifest.runId,
                cases: candidate.validation.summary.cases,
                passed: candidate.validation.summary.semanticPass,
                accuracy: candidate.validation.summary.semanticAccuracy,
                classifications: candidate.validation.summary.classifications,
            },
            paired,
            controlledReuse: controlledSemantic,
        },
        gates,
        decision: {
            status: passed ? 'dev-passed' : 'rejected',
            reason: passed
                ? '固定 reader 与全量人工裁决显示语义净增，controlled 输入完全相同且 48/48；H-PROMPT 独立机制通过 dev screening。'
                : '至少一个预注册 reader、paired、controlled 或候选身份闸门失败。',
        },
    };

    await fs.mkdir(outputDir, { recursive: false });
    const resultPath = path.join(outputDir, 'result.json');
    const reportPath = path.join(outputDir, 'report.md');
    const resultText = `${JSON.stringify(result, null, 2)}\n`;
    const reportText = `${renderReport(result)}\n`;
    await Promise.all([writeAtomic(resultPath, resultText), writeAtomic(reportPath, reportText)]);
    const scriptPath = fileURLToPath(import.meta.url);
    const manifest = {
        schemaVersion: 1,
        experimentId: result.experimentId,
        study: { path: path.resolve(studyPath).replace(/\\/g, '/'), sha256: loaded.hash },
        script: { path: scriptPath.replace(/\\/g, '/'), sha256: await sha256File(scriptPath) },
        candidateReader: {
            path: path.join(candidateReaderDir, 'manifest.json').replace(/\\/g, '/'),
            sha256: await sha256File(path.join(candidateReaderDir, 'manifest.json')),
        },
        candidateAdjudication: {
            path: path.resolve(candidateAdjudicationPath).replace(/\\/g, '/'),
            sha256: await sha256File(candidateAdjudicationPath),
        },
        candidateAudit: { path: path.resolve(candidateAuditPath).replace(/\\/g, '/'), sha256: await sha256File(candidateAuditPath) },
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
    const required = ['study', 'candidate-reader', 'candidate-adjudication', 'candidate-audit', 'output'];
    for (const key of required) if (!args[key]) throw new Error(`缺少 --${key}=...`);
    const completed = await runPromptReaderDecision({
        studyPath: path.resolve(args.study),
        candidateReaderDir: path.resolve(args['candidate-reader']),
        candidateAdjudicationPath: path.resolve(args['candidate-adjudication']),
        candidateAuditPath: path.resolve(args['candidate-audit']),
        outputDir: path.resolve(args.output),
    });
    process.stdout.write(`${JSON.stringify({
        decision: completed.result.decision,
        semantic: completed.result.semantic,
        gates: completed.result.gates,
        manifest: completed.manifest,
    }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
