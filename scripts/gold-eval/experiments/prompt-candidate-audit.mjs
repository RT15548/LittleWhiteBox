/* global Buffer, process */
// H-PROMPT Stage 2 audit: pair source captures with isolated prompt-only candidates.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { parseAdjudicationJsonl } from '../lib/adjudication.mjs';
import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';

const execFileAsync = promisify(execFile);
const EVENT_SOURCES = new Set(['direct-event', 'related-event', 'causal-event']);

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    return sha256(await fs.readFile(filePath));
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

async function readJsonl(filePath) {
    return String(await fs.readFile(filePath, 'utf8'))
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map(JSON.parse);
}

async function writeAtomic(filePath, content) {
    const temporary = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.writeFile(temporary, content, 'utf8');
    await fs.rename(temporary, filePath);
}

function selectedEventIds(prompt) {
    const ids = [];
    const seen = new Set();
    for (const item of prompt?.evidenceTrace?.prompt || []) {
        if (!EVENT_SOURCES.has(item?.source)) continue;
        const unitId = String(item?.unitId || '');
        if (!unitId.startsWith('event:') || seen.has(unitId)) continue;
        seen.add(unitId);
        ids.push(unitId.slice('event:'.length));
    }
    return ids;
}

function unitCounts(prompt) {
    const bySource = {};
    const seen = new Set();
    for (const item of prompt?.evidenceTrace?.prompt || []) {
        const key = `${item?.source || 'unknown'}\0${item?.unitId || `${item?.floor}`}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const source = String(item?.source || 'unknown');
        bySource[source] = (bySource[source] || 0) + 1;
    }
    return bySource;
}

function equalSequence(left, right) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function average(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function pairedCounts(rows, currentKey, armKey) {
    const eligible = rows.filter(row => row[currentKey] != null && row[armKey] != null);
    const wins = eligible.filter(row => !row[currentKey] && row[armKey]).length;
    const losses = eligible.filter(row => row[currentKey] && !row[armKey]).length;
    return { eligible: eligible.length, wins, losses, ties: eligible.length - wins - losses, net: wins - losses };
}

function sumSources(rows, side) {
    const result = {};
    for (const row of rows) {
        for (const [source, count] of Object.entries(row[side].unitCounts)) {
            result[source] = (result[source] || 0) + count;
        }
    }
    return result;
}

export function comparePromptPair({ id, source, candidate, expectedArmByCase = new Map(), semanticPassIds = new Set() }) {
    if (source.cases.length !== candidate.cases.length) throw new Error(`${id}: case count mismatch`);
    const rows = [];
    for (let index = 0; index < source.cases.length; index++) {
        const goldCase = source.cases[index];
        if (candidate.cases[index]?.id !== goldCase.id) throw new Error(`${id}: case order mismatch at ${index}`);
        const currentTrace = source.stageTraces[index];
        const armTrace = candidate.stageTraces[index];
        const currentPrompt = source.prompts[index];
        const armPrompt = candidate.prompts[index];
        if (armPrompt.sourcePromptHash !== currentPrompt.promptHash) {
            throw new Error(`${id}/${goldCase.id}: sourcePromptHash mismatch`);
        }
        const expectedIds = expectedArmByCase.get(goldCase.id) || null;
        const actualIds = selectedEventIds(armPrompt);
        rows.push({
            caseId: goldCase.id,
            category: goldCase.category,
            baselineSemanticPass: semanticPassIds.has(goldCase.id),
            currentPromptHit: currentTrace?.stages?.prompt === 'hit',
            armPromptHit: armTrace?.stages?.prompt === 'hit',
            currentAnswerSurface: currentTrace?.answerSurfaceInPrompt?.applicable
                ? currentTrace.answerSurfaceInPrompt.matched === true
                : null,
            armAnswerSurface: armTrace?.answerSurfaceInPrompt?.applicable
                ? armTrace.answerSurfaceInPrompt.matched === true
                : null,
            screenAlignment: expectedIds == null ? null : equalSequence(expectedIds, actualIds),
            current: {
                promptHash: currentPrompt.promptHash,
                promptChars: currentPrompt.promptChars,
                eventIds: selectedEventIds(currentPrompt),
                unitCounts: unitCounts(currentPrompt),
            },
            arm: {
                promptHash: armPrompt.promptHash,
                promptChars: armPrompt.promptChars,
                eventIds: actualIds,
                unitCounts: unitCounts(armPrompt),
            },
        });
    }
    const prompt = pairedCounts(rows, 'currentPromptHit', 'armPromptHit');
    const answerSurface = pairedCounts(rows, 'currentAnswerSurface', 'armAnswerSurface');
    const semanticPassRows = rows.filter(row => row.baselineSemanticPass);
    return {
        id,
        rows,
        summary: {
            cases: rows.length,
            changedPrompts: rows.filter(row => row.current.promptHash !== row.arm.promptHash).length,
            prompt,
            answerSurface,
            baselineSemanticPass: {
                cases: semanticPassRows.length,
                promptLosses: semanticPassRows.filter(row => row.currentPromptHit && !row.armPromptHit).length,
                answerSurfaceLosses: semanticPassRows.filter(row => row.currentAnswerSurface && !row.armAnswerSurface).length,
            },
            screenAlignmentMismatches: rows.filter(row => row.screenAlignment === false).length,
            promptChars: {
                currentAverage: average(rows.map(row => row.current.promptChars)),
                armAverage: average(rows.map(row => row.arm.promptChars)),
                maxArm: Math.max(...rows.map(row => row.arm.promptChars)),
            },
            unitCounts: { current: sumSources(rows, 'current'), arm: sumSources(rows, 'arm') },
        },
    };
}

async function semanticPassIds(readerRunDir, adjudicationPath) {
    const [traces, parsed] = await Promise.all([
        readJsonl(path.join(readerRunDir, 'stage-trace.jsonl')),
        fs.readFile(adjudicationPath, 'utf8').then(parseAdjudicationJsonl),
    ]);
    if (parsed.errors.length) throw new Error(`adjudication parse failed: ${parsed.errors.join('; ')}`);
    const ids = new Set(traces.filter(trace => trace?.answer?.correct === true).map(trace => trace.id));
    for (const row of parsed.rows) if (row.semanticPass) ids.add(row.caseId);
    return ids;
}

async function candidateIdentity(worktreePath) {
    const file = 'modules/story-summary/generate/prompt.js';
    const [{ stdout: head }, { stdout: names }, { stdout: patch }, candidateHash] = await Promise.all([
        execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: worktreePath }),
        execFileAsync('git', ['diff', '--name-only'], { cwd: worktreePath }),
        execFileAsync('git', ['diff', '--', file], { cwd: worktreePath, maxBuffer: 10 * 1024 * 1024 }),
        sha256File(path.join(worktreePath, file)),
    ]);
    const trackedChanges = names.split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    return {
        worktreePath: path.resolve(worktreePath).replace(/\\/g, '/'),
        baseCommit: head.trim(),
        trackedChanges,
        patch,
        patchSha256: sha256(patch),
        candidatePromptSha256: candidateHash,
        valid: trackedChanges.length === 1 && trackedChanges[0] === file && patch.trim().length > 0,
    };
}

function renderReport(result) {
    return [
        '# H-PROMPT Isolated Prompt-only Candidate Audit',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        `- Candidate patch SHA-256：\`${result.candidate.patchSha256}\``,
        '- Production external calls：0',
        '',
        '| Source | Cases | Changed | Prompt W/L/T | Surface W/L/T | Screen mismatch | Prompt chars avg current → arm |',
        '|---|---:|---:|---:|---:|---:|---:|',
        ...result.pairs.map(pair => {
            const summary = pair.summary;
            return `| ${pair.id} | ${summary.cases} | ${summary.changedPrompts} | ${summary.prompt.wins}/${summary.prompt.losses}/${summary.prompt.ties} | ${summary.answerSurface.wins}/${summary.answerSurface.losses}/${summary.answerSurface.ties} | ${summary.screenAlignmentMismatches} | ${summary.promptChars.currentAverage.toFixed(1)} → ${summary.promptChars.armAverage.toFixed(1)} |`;
        }),
        '',
        '## Gate',
        '',
        ...Object.entries(result.gates).map(([key, passed]) => `- ${key}：${passed ? 'PASS' : 'FAIL'}`),
        '',
        '> 该审计通过只授权固定 reader；最终仍以逐题语义答案和 controlled 24/24 为准。',
        '',
    ].join('\n');
}

export async function runPromptCandidateAudit({
    studyPath,
    screenPath,
    worktreePath,
    outputDir,
    realCandidateDir,
    controlledCandidates,
}) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    if (!audit.ok || loaded.study.active.hypothesisId !== 'H-PROMPT') {
        throw new Error('STUDY audit/active hypothesis 不允许 H-PROMPT candidate audit');
    }
    const screen = await readJson(screenPath);
    if (screen.decision?.status !== 'screen-pass') throw new Error('H-PROMPT screen 未通过');
    const screenBySource = new Map(screen.sources.map(source => [source.id, source]));
    const expectedMap = id => new Map((screenBySource.get(id)?.rows || []).map(row => [row.caseId, row.arm.selectedEventIds]));
    const semanticIds = await semanticPassIds(
        loaded.study.evidence.readerBaseline.runDir,
        loaded.study.evidence.adjudication.path,
    );
    const sourceSpecs = [{
        id: 'real-800',
        sourceDir: loaded.study.evidence.sourceCapture.runDir,
        candidateDir: realCandidateDir,
        semanticIds,
    }];
    for (const job of loaded.study.evidence.baselineCampaign.jobs) {
        sourceSpecs.push({
            id: job.id,
            sourceDir: job.capture.runDir,
            candidateDir: controlledCandidates[job.id],
            semanticIds: new Set(),
        });
    }

    const pairs = [];
    const runManifests = [];
    for (const spec of sourceSpecs) {
        if (!spec.candidateDir) throw new Error(`missing candidate run: ${spec.id}`);
        const [source, candidate, sourceMetrics, candidateMetrics] = await Promise.all([
            loadGoldCapture(spec.sourceDir),
            loadGoldCapture(spec.candidateDir),
            readJson(path.join(spec.sourceDir, 'metrics.json')),
            readJson(path.join(spec.candidateDir, 'metrics.json')),
        ]);
        const pair = comparePromptPair({
            id: spec.id,
            source,
            candidate,
            expectedArmByCase: expectedMap(spec.id),
            semanticPassIds: spec.semanticIds,
        });
        pair.sourceRunId = source.manifest.runId;
        pair.candidateRunId = candidate.manifest.runId;
        pair.transport = {
            status: candidate.manifest.status,
            productionExternalCalls: candidate.manifest.progress?.productionExternalCalls ?? null,
            productionTransportRequests: candidate.manifest.progress?.productionTransportRequests ?? null,
            readerExternalCalls: candidate.manifest.progress?.readerExternalCalls ?? null,
        };
        pair.forbiddenPrompt = {
            current: sourceMetrics.overall?.forbiddenEvidenceRate?.prompt ?? null,
            arm: candidateMetrics.overall?.forbiddenEvidenceRate?.prompt ?? null,
        };
        pairs.push(pair);
        runManifests.push({
            id: spec.id,
            source: path.join(spec.sourceDir, 'manifest.json'),
            candidate: path.join(spec.candidateDir, 'manifest.json'),
        });
    }

    const identity = await candidateIdentity(worktreePath);
    const real = pairs.find(pair => pair.id === 'real-800').summary;
    const controlled = pairs.filter(pair => pair.id !== 'real-800');
    const gates = {
        candidateIdentity: identity.valid,
        validZeroExternalRuns: pairs.every(pair => pair.transport.status === 'valid'
            && pair.transport.productionExternalCalls === 0
            && pair.transport.productionTransportRequests === 0
            && pair.transport.readerExternalCalls === 0),
        screenAlignment: pairs.every(pair => pair.summary.screenAlignmentMismatches === 0),
        realPromptNetGain: real.prompt.wins > real.prompt.losses,
        realAnswerSurfaceNetGain: real.answerSurface.wins > real.answerSurface.losses,
        realNoSurfaceLoss: real.answerSurface.losses === 0,
        baselineSemanticPassNoLoss: real.baselineSemanticPass.promptLosses === 0
            && real.baselineSemanticPass.answerSurfaceLosses === 0,
        controlledExactPromptNonRegression: controlled.every(pair => pair.summary.changedPrompts === 0),
        controlledForbiddenNonRegression: controlled.every(pair => pair.forbiddenPrompt.current === pair.forbiddenPrompt.arm),
    };
    const passed = Object.values(gates).every(Boolean);
    const result = {
        schemaVersion: 1,
        experimentId: path.basename(outputDir),
        screenExperimentId: screen.experimentId,
        candidate: { ...identity, patch: undefined },
        gates,
        decision: {
            status: passed ? 'prompt-only-pass' : 'reject',
            reason: passed
                ? '完整 Prompt 与 screen 对齐，real Prompt/surface 净增且零 loss，controlled Prompt 完全不变；只授权固定 reader。'
                : '至少一个完整 Prompt、surface、identity 或 controlled 非回归闸门失败；禁止调用 reader。',
        },
        pairs,
    };

    await fs.mkdir(outputDir, { recursive: false });
    const patchPath = path.join(outputDir, 'candidate.patch');
    const resultPath = path.join(outputDir, 'result.json');
    const reportPath = path.join(outputDir, 'report.md');
    const resultText = `${JSON.stringify(result, null, 2)}\n`;
    const reportText = `${renderReport(result)}\n`;
    await Promise.all([
        writeAtomic(patchPath, identity.patch),
        writeAtomic(resultPath, resultText),
        writeAtomic(reportPath, reportText),
    ]);
    const scriptPath = fileURLToPath(import.meta.url);
    const manifest = {
        schemaVersion: 1,
        experimentId: result.experimentId,
        study: { path: path.resolve(studyPath).replace(/\\/g, '/'), sha256: loaded.hash },
        screen: { path: path.resolve(screenPath).replace(/\\/g, '/'), sha256: await sha256File(screenPath) },
        script: { path: scriptPath.replace(/\\/g, '/'), sha256: await sha256File(scriptPath) },
        candidatePatch: { path: patchPath.replace(/\\/g, '/'), sha256: identity.patchSha256 },
        result: { path: resultPath.replace(/\\/g, '/'), sha256: sha256(resultText), bytes: Buffer.byteLength(resultText) },
        report: { path: reportPath.replace(/\\/g, '/'), sha256: sha256(reportText), bytes: Buffer.byteLength(reportText) },
        runs: await Promise.all(runManifests.map(async item => ({
            id: item.id,
            source: { path: item.source.replace(/\\/g, '/'), sha256: await sha256File(item.source) },
            candidate: { path: item.candidate.replace(/\\/g, '/'), sha256: await sha256File(item.candidate) },
        }))),
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
    const required = ['study', 'screen', 'worktree', 'output', 'real-candidate', 'fantasy-candidate', 'modern-candidate'];
    for (const key of required) if (!args[key]) throw new Error(`缺少 --${key}=...`);
    const completed = await runPromptCandidateAudit({
        studyPath: path.resolve(args.study),
        screenPath: path.resolve(args.screen),
        worktreePath: path.resolve(args.worktree),
        outputDir: path.resolve(args.output),
        realCandidateDir: path.resolve(args['real-candidate']),
        controlledCandidates: {
            'controlled-fantasy': path.resolve(args['fantasy-candidate']),
            'controlled-modern': path.resolve(args['modern-candidate']),
        },
    });
    process.stdout.write(`${JSON.stringify({
        decision: completed.result.decision,
        gates: completed.result.gates,
        pairs: completed.result.pairs.map(pair => ({ id: pair.id, summary: pair.summary })),
        manifest: completed.manifest,
    }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
