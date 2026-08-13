/* global Buffer, process */
// H-L1-EVENT-DETAIL zero-API upper-bound screen.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { parseAdjudicationJsonl, validateAdjudication } from '../lib/adjudication.mjs';
import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';
import { selectedEventIdsFromTrace } from './prompt-packing-screen.mjs';

const DETAIL_TOP_CHUNKS_PER_FLOOR = 2;
const DETAIL_TOKEN_HEADROOM = 0;
const MIN_UPPER_BOUND_WINS = 5;

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    return sha256(await fs.readFile(filePath));
}

async function writeAtomic(filePath, content) {
    const temporary = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.writeFile(temporary, content, 'utf8');
    await fs.rename(temporary, filePath);
}

async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

function jsonl(rows) {
    return rows.length ? `${rows.map(row => JSON.stringify(row)).join('\n')}\n` : '';
}

function estimateTokens(text) {
    if (!text) return 0;
    const value = String(text);
    const chinese = (value.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(chinese + (value.length - chinese) / 4);
}

export function parseFloorRange(summary) {
    const match = String(summary || '').match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, Number(match[1]) - 1);
    const end = Math.max(start, Number(match[2] || match[1]) - 1);
    return { start, end };
}

function requiredContract(goldCase, predicate) {
    const all = goldCase?.evidence?.requiredAll || [];
    const any = goldCase?.evidence?.requiredAny || [];
    if (!all.length && !any.length) return null;
    return all.every(predicate) && (!any.length || any.some(predicate));
}

function requiredFloors(goldCase) {
    return [
        ...(goldCase?.evidence?.requiredAll || []),
        ...(goldCase?.evidence?.requiredAny || []),
    ].filter(Number.isInteger);
}

function normalizeForSurface(value) {
    return String(value || '')
        .normalize('NFKC')
        .replace(/[\s"'`“”‘’「」『』【】（）()《》<>，。！？、：；,.!?;:·~～\-_/\\|*#]+/g, '')
        .replace(/的/g, '')
        .toLowerCase();
}

function expectedValues(goldCase) {
    const answer = goldCase?.expectedAnswer || {};
    if (Array.isArray(answer.values)) return answer.values.map(String).filter(Boolean);
    if (answer.value != null) return [String(answer.value)];
    return [];
}

export function answerSurfaceInText(text, goldCase) {
    const values = expectedValues(goldCase);
    if (!values.length) return null;
    const haystack = normalizeForSurface(text);
    return values.some(value => haystack.includes(normalizeForSurface(value)));
}

function eventRanges(items) {
    return (items || [])
        .map(item => {
            const event = item?.event || item || {};
            const range = parseFloorRange(event.summary);
            return range ? { eventId: String(event.id || ''), range } : null;
        })
        .filter(item => item?.eventId);
}

function sortRecalledEvents(events) {
    return [...(events || [])]
        .filter(item => item?.event?.summary)
        .map((item, inputIndex) => ({ item, inputIndex }))
        .sort((left, right) => (
            (Number(right.item.similarity || 0) - Number(left.item.similarity || 0))
            || (left.inputIndex - right.inputIndex)
        ))
        .map(entry => entry.item);
}

function promptOrderedEvents(events, promptEventIds) {
    const byId = new Map((events || [])
        .filter(item => item?.event?.id)
        .map(item => [String(item.event.id), item]));
    return promptEventIds
        .map(id => byId.get(id))
        .filter(Boolean);
}

export function floorCoveredByRanges(floor, ranges) {
    return ranges.some(item => floor >= item.range.start && floor <= item.range.end);
}

function eventRankForFloor(floor, ranges) {
    const index = ranges.findIndex(item => floor >= item.range.start && floor <= item.range.end);
    return index < 0 ? null : index + 1;
}

function chunksByFloor(snapshot) {
    const map = new Map();
    for (const chunk of snapshot?.vector?.chunks || []) {
        const floor = Number(chunk?.floor);
        if (!Number.isInteger(floor)) continue;
        if (!map.has(floor)) map.set(floor, []);
        map.get(floor).push(chunk);
    }
    for (const chunks of map.values()) {
        chunks.sort((left, right) => Number(left.chunkIdx || 0) - Number(right.chunkIdx || 0));
    }
    return map;
}

function detailLine(chunk) {
    const speaker = String(chunk?.speaker || (chunk?.isUser ? '用户' : '角色'));
    return `  › #${Number(chunk?.floor) + 1} [${speaker}] ${String(chunk?.text || '').trim()}`;
}

function selectDetailChunks(floor, chunks, goldCase) {
    const withSurface = chunks.filter(chunk => answerSurfaceInText(chunk.text, goldCase) === true);
    const selected = withSurface.length ? withSurface : chunks;
    return selected.slice(0, DETAIL_TOP_CHUNKS_PER_FLOOR);
}

function bestStageRank(stageRows, floor) {
    if (!Array.isArray(stageRows)) return null;
    const found = stageRows.find(item => Number(item?.floor) === floor);
    return found?.rank ?? null;
}

function floorDiagnostics(trace, floor) {
    return {
        finalRank: trace?.requiredFinalRanking?.find(item => Number(item?.floor) === floor)?.rank ?? null,
        fusionRank: bestStageRank(trace?.observationBase?.stages?.fusion, floor),
        rerankRank: bestStageRank(trace?.observationBase?.stages?.rerank, floor),
        graphRank: bestStageRank(trace?.observationBase?.stages?.graph, floor),
    };
}

function summarizeNumbers(values) {
    const numeric = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!numeric.length) return { min: null, p50: null, p95: null, max: null, average: null };
    const pick = p => numeric[Math.min(numeric.length - 1, Math.floor((numeric.length - 1) * p))];
    return {
        min: numeric[0],
        p50: pick(0.50),
        p95: pick(0.95),
        max: numeric[numeric.length - 1],
        average: numeric.reduce((sum, value) => sum + value, 0) / numeric.length,
    };
}

function countBy(rows, key) {
    const counts = {};
    for (const row of rows) {
        const value = String(row[key] ?? 'unknown');
        counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
}

function semanticPassSet(validated) {
    return new Set(validated.rows.filter(row => row.semanticPass).map(row => row.caseId));
}

function promptSideFailure(row) {
    return row?.semanticPass === false
        && !['reader', 'scorer', 'fixture', 'machine-pass'].includes(row.failureOwner);
}

function candidateRow({
    goldCase,
    trace,
    prompt,
    promptInput,
    adjudicated,
    semanticPassIds,
    chunkMap,
}) {
    const recallResult = promptInput?.production?.recallResult || {};
    const promptEventIds = selectedEventIdsFromTrace(prompt);
    const allRecalledRanges = eventRanges(sortRecalledEvents(recallResult.events || []));
    const promptRanges = eventRanges(promptOrderedEvents(recallResult.events || [], promptEventIds));
    const promptFloors = new Set((trace?.promptFloors || []).filter(Number.isInteger));
    const floors = requiredFloors(goldCase);
    const floorRows = floors.map(floor => {
        const chunks = chunkMap.get(floor) || [];
        const selectedChunks = selectDetailChunks(floor, chunks, goldCase);
        const text = selectedChunks.map(chunk => chunk.text).join('\n');
        const detailTokens = selectedChunks.reduce((sum, chunk) => sum + estimateTokens(detailLine(chunk)), 0);
        return {
            floor,
            inCurrentPrompt: promptFloors.has(floor),
            inPromptEvent: floorCoveredByRanges(floor, promptRanges),
            inRecalledEvent: floorCoveredByRanges(floor, allRecalledRanges),
            promptEventRank: eventRankForFloor(floor, promptRanges),
            recalledEventRank: eventRankForFloor(floor, allRecalledRanges),
            rawL1Chunks: chunks.length,
            selectedDetailChunks: selectedChunks.length,
            rawAnswerSurface: answerSurfaceInText(text, goldCase),
            detailTokens,
            diagnostics: floorDiagnostics(trace, floor),
        };
    });
    const rawDetailContract = requiredContract(goldCase, floor => {
        const row = floorRows.find(item => item.floor === floor);
        return row?.inRecalledEvent && row.rawL1Chunks > 0;
    });
    const selectedEventContract = requiredContract(goldCase, floor => {
        const row = floorRows.find(item => item.floor === floor);
        return row?.inPromptEvent && row.rawL1Chunks > 0;
    });
    const rawAnswerSurfaceContract = requiredContract(goldCase, floor => {
        const row = floorRows.find(item => item.floor === floor);
        return row?.inRecalledEvent && row.rawAnswerSurface === true;
    });
    const currentRequiredInPrompt = requiredContract(goldCase, floor => promptFloors.has(floor));
    const detailTokens = floorRows.reduce((sum, row) => sum + row.detailTokens, 0);
    const budget = recallResult?.metrics?.budget || {};
    const budgetLimit = Number(budget.limit || 0);
    const budgetTotal = Number(budget.total || 0);
    const tokenFeasible = budgetLimit > 0
        ? budgetTotal + detailTokens + DETAIL_TOKEN_HEADROOM <= budgetLimit
        : true;
    const semanticPass = semanticPassIds.has(goldCase.id);
    const isPromptSideFailure = promptSideFailure(adjudicated);
    const upperBoundWin = !semanticPass && isPromptSideFailure && rawDetailContract === true && tokenFeasible;
    const upperBoundAnswerSurfaceWin = upperBoundWin && rawAnswerSurfaceContract === true;
    return {
        caseId: goldCase.id,
        category: goldCase.category,
        query: goldCase.query,
        semanticPass,
        failureOwner: adjudicated?.failureOwner || (semanticPass ? 'machine-pass' : 'unknown'),
        promptEvidence: adjudicated?.promptEvidence || null,
        currentRequiredInPrompt,
        selectedEventContract,
        rawDetailContract,
        rawAnswerSurfaceContract,
        upperBoundWin,
        upperBoundAnswerSurfaceWin,
        potentialPassLoss: semanticPass && !tokenFeasible,
        tokenFeasible,
        detailTokens,
        budget: {
            total: budgetTotal || null,
            limit: budgetLimit || null,
            remaining: budgetLimit > 0 ? budgetLimit - budgetTotal : null,
            afterDetail: budgetLimit > 0 ? budgetTotal + detailTokens : null,
        },
        floors: floorRows,
    };
}

function summarize(rows) {
    const failed = rows.filter(row => !row.semanticPass);
    const promptFailures = rows.filter(promptSideFailure);
    const upperWins = rows.filter(row => row.upperBoundWin);
    const passRows = rows.filter(row => row.semanticPass);
    return {
        cases: rows.length,
        semanticPass: passRows.length,
        semanticFail: failed.length,
        failureOwners: countBy(rows, 'failureOwner'),
        promptSideFailures: promptFailures.length,
        rawDetailContract: {
            allCases: rows.filter(row => row.rawDetailContract === true).length,
            promptFailures: promptFailures.filter(row => row.rawDetailContract === true).length,
        },
        selectedEventContract: {
            allCases: rows.filter(row => row.selectedEventContract === true).length,
            promptFailures: promptFailures.filter(row => row.selectedEventContract === true).length,
        },
        rawAnswerSurfaceContract: {
            allCases: rows.filter(row => row.rawAnswerSurfaceContract === true).length,
            promptFailures: promptFailures.filter(row => row.rawAnswerSurfaceContract === true).length,
        },
        upperBound: {
            wins: upperWins.length,
            answerSurfaceWins: rows.filter(row => row.upperBoundAnswerSurfaceWin).length,
            losses: rows.filter(row => row.potentialPassLoss).length,
            ids: upperWins.map(row => row.caseId),
        },
        tokens: summarizeNumbers(rows.map(row => row.detailTokens)),
        budgetFailures: rows.filter(row => !row.tokenFeasible).length,
    };
}

function renderReport(result) {
    const summary = result.summary;
    return [
        '# H-L1-EVENT-DETAIL Zero-API Screen',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        '- API：0（只读 frozen H-COMBO reader run、adjudication 和 snapshot）',
        '',
        '| Metric | Value |',
        '|---|---:|',
        `| baseline semantic pass | ${summary.semanticPass}/${summary.cases} |`,
        `| prompt-side failures | ${summary.promptSideFailures} |`,
        `| raw detail contract in prompt-side failures | ${summary.rawDetailContract.promptFailures}/${summary.promptSideFailures} |`,
        `| selected-event-only contract in prompt-side failures | ${summary.selectedEventContract.promptFailures}/${summary.promptSideFailures} |`,
        `| raw answer-surface contract in prompt-side failures | ${summary.rawAnswerSurfaceContract.promptFailures}/${summary.promptSideFailures} |`,
        `| upper-bound wins | ${summary.upperBound.wins} |`,
        `| upper-bound answer-surface wins | ${summary.upperBound.answerSurfaceWins} |`,
        `| potential pass losses | ${summary.upperBound.losses} |`,
        `| detail tokens p50/p95/max | ${summary.tokens.p50}/${summary.tokens.p95}/${summary.tokens.max} |`,
        '',
        '## Gate',
        '',
        ...Object.entries(result.gates).map(([key, passed]) => `- ${key}：${passed ? 'PASS' : 'FAIL'}`),
        '',
        '## Upper-bound Win IDs',
        '',
        ...(summary.upperBound.ids.length ? summary.upperBound.ids.map(id => `- ${id}`) : ['- 无']),
        '',
        '> 这是上界筛选，只授权或拒绝下一步隔离候选；不能替代真实 Prompt capture 和 reader 结论。',
        '',
    ].join('\n');
}

export async function runEventDetailScreen({
    studyPath,
    sourceRunDir,
    adjudicationPath,
    outputDir,
}) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    const hypothesis = loaded.study.hypotheses.find(item => item.id === 'H-L1-EVENT-DETAIL');
    if (!audit.ok
        || loaded.study.phase !== 'experiments'
        || loaded.study.active.hypothesisId !== 'H-L1-EVENT-DETAIL'
        || hypothesis?.status !== 'screening') {
        throw new Error('STUDY audit/phase/active hypothesis 不允许 H-L1-EVENT-DETAIL screen');
    }
    const capture = await loadGoldCapture(sourceRunDir);
    if (capture.manifest.status !== 'valid') throw new Error(`source run 非 valid: ${capture.manifest.status}`);
    const [snapshot, adjudicationText] = await Promise.all([
        readJson(capture.manifest.data.snapshotPath),
        fs.readFile(adjudicationPath, 'utf8'),
    ]);
    const parsed = parseAdjudicationJsonl(adjudicationText);
    if (parsed.errors.length) throw new Error(`adjudication parse failed: ${parsed.errors.join('; ')}`);
    const validated = validateAdjudication({
        cases: capture.cases,
        stageTraces: capture.stageTraces,
        rows: parsed.rows,
    });
    if (!validated.ok) throw new Error(`adjudication validate failed: ${validated.errors.join('; ')}`);
    const adjudicatedById = new Map(validated.rows.map(row => [row.caseId, row]));
    const semanticPassIds = semanticPassSet(validated);
    const chunkMap = chunksByFloor(snapshot);
    const rows = capture.cases.map((goldCase, index) => candidateRow({
        goldCase,
        trace: capture.stageTraces[index],
        prompt: capture.prompts[index],
        promptInput: capture.promptInputs[index],
        adjudicated: adjudicatedById.get(goldCase.id),
        semanticPassIds,
        chunkMap,
    }));
    const summary = summarize(rows);
    const gates = {
        baselineKnown: summary.semanticPass === 58,
        upperBoundGain: summary.upperBound.wins >= MIN_UPPER_BOUND_WINS,
        noPassLoss: summary.upperBound.losses === 0,
        budgetFeasible: summary.budgetFailures === 0,
        rawSurfaceSignal: summary.upperBound.answerSurfaceWins > 0,
    };
    const passed = Object.values(gates).every(Boolean);
    const experimentId = path.basename(outputDir);
    if (!/^H-L1-EVENT-DETAIL-screen-v\d+$/.test(experimentId)) {
        throw new Error(`H-L1-EVENT-DETAIL output 目录名必须是版本化 attempt id: ${experimentId}`);
    }
    const result = {
        schemaVersion: 1,
        experimentId,
        hypothesis: hypothesis.statement,
        arm: hypothesis.variable,
        source: {
            runId: capture.manifest.runId,
            runDir: path.resolve(sourceRunDir).replace(/\\/g, '/'),
            adjudicationPath: path.resolve(adjudicationPath).replace(/\\/g, '/'),
            snapshotPath: path.resolve(capture.manifest.data.snapshotPath).replace(/\\/g, '/'),
        },
        constants: {
            detailTopChunksPerFloor: DETAIL_TOP_CHUNKS_PER_FLOOR,
            minUpperBoundWins: MIN_UPPER_BOUND_WINS,
        },
        network: { modelApiCalls: 0, productionTransportCalls: 0 },
        gates,
        decision: {
            status: passed ? 'screen-pass' : 'reject',
            reason: passed
                ? 'raw L1 detail 上界满足增益、预算和非回归闸门；只授权建立隔离候选。'
                : 'raw L1 detail 上界未同时满足增益、预算和非回归闸门；不得改正式插件。',
        },
        summary,
        rows,
    };

    await fs.mkdir(outputDir, { recursive: false });
    const resultForJson = { ...result, rows: undefined };
    delete resultForJson.rows;
    const resultText = `${JSON.stringify(resultForJson, null, 2)}\n`;
    const rowsText = jsonl(rows);
    const reportText = `${renderReport(result)}\n`;
    const resultPath = path.join(outputDir, 'result.json');
    const rowsPath = path.join(outputDir, 'rows.jsonl');
    const reportPath = path.join(outputDir, 'report.md');
    await Promise.all([
        writeAtomic(resultPath, resultText),
        writeAtomic(rowsPath, rowsText),
        writeAtomic(reportPath, reportText),
    ]);
    const scriptPath = fileURLToPath(import.meta.url);
    const manifest = {
        schemaVersion: 1,
        experimentId,
        study: { path: path.resolve(studyPath).replace(/\\/g, '/'), sha256: loaded.hash },
        script: { path: scriptPath.replace(/\\/g, '/'), sha256: await sha256File(scriptPath) },
        result: { path: resultPath.replace(/\\/g, '/'), sha256: sha256(resultText), bytes: Buffer.byteLength(resultText) },
        rows: { path: rowsPath.replace(/\\/g, '/'), sha256: sha256(rowsText), bytes: Buffer.byteLength(rowsText) },
        report: { path: reportPath.replace(/\\/g, '/'), sha256: sha256(reportText), bytes: Buffer.byteLength(reportText) },
        inputs: {
            sourceManifest: {
                path: path.join(sourceRunDir, 'manifest.json').replace(/\\/g, '/'),
                sha256: await sha256File(path.join(sourceRunDir, 'manifest.json')),
            },
            adjudication: {
                path: path.resolve(adjudicationPath).replace(/\\/g, '/'),
                sha256: await sha256File(adjudicationPath),
            },
            snapshot: {
                path: path.resolve(capture.manifest.data.snapshotPath).replace(/\\/g, '/'),
                sha256: await sha256File(capture.manifest.data.snapshotPath),
            },
        },
    };
    const manifestText = `${JSON.stringify(manifest, null, 2)}\n`;
    const manifestPath = path.join(outputDir, 'manifest.json');
    await writeAtomic(manifestPath, manifestText);
    return { result, manifest: { ...manifest, path: manifestPath.replace(/\\/g, '/'), sha256: sha256(manifestText) } };
}

async function main() {
    const args = Object.fromEntries(process.argv.slice(2).filter(item => item.startsWith('--')).map(item => {
        const [key, ...rest] = item.slice(2).split('=');
        return [key, rest.join('=')];
    }));
    if (!args.study || !args.sourceRun || !args.adjudication || !args.output) {
        throw new Error('用法: event-detail-screen.mjs --study=<STUDY.json> --sourceRun=<h-combo-reader-run-dir> --adjudication=<h-combo-adjudication.jsonl> --output=<experiment-dir>');
    }
    const completed = await runEventDetailScreen({
        studyPath: path.resolve(args.study),
        sourceRunDir: path.resolve(args.sourceRun),
        adjudicationPath: path.resolve(args.adjudication),
        outputDir: path.resolve(args.output),
    });
    process.stdout.write(`${JSON.stringify({
        decision: completed.result.decision,
        gates: completed.result.gates,
        summary: completed.result.summary,
        manifest: completed.manifest,
    }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
