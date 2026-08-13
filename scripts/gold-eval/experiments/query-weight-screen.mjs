/* global Buffer, process */
// H-Q-DENSE frozen-vector screen. Uses only already-captured embedding responses.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { cosineSimilarity } from '../../../modules/story-summary/vector/runtime/scoring.js';
import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';

const ANCHOR_THRESHOLD = 0.58;
const EVENT_THRESHOLD = 0.60;
const FOCUS_MIN_WEIGHT = 0.35;

function sha256(value) {
    return createHash('sha256').update(value).digest('hex');
}

async function sha256File(filePath) {
    return sha256(await fs.readFile(filePath));
}

async function writeAtomic(filePath, content) {
    const temp = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(temp, content, 'utf8');
    await fs.rename(temp, filePath);
}

function lengthFactor(charCount) {
    if (charCount >= 50) return 1;
    if (charCount <= 0) return 0.35;
    return 0.35 + (0.65 * charCount / 50);
}

function clampFocus(weights, focusIndex) {
    if (weights[focusIndex] >= FOCUS_MIN_WEIGHT) return weights;
    const other = 1 - weights[focusIndex];
    if (other <= 0) return weights.map((_, index) => index === focusIndex ? 1 : 0);
    const scale = (1 - FOCUS_MIN_WEIGHT) / other;
    const out = weights.map((weight, index) => index === focusIndex ? FOCUS_MIN_WEIGHT : weight * scale);
    out[focusIndex] += 1 - out.reduce((sum, weight) => sum + weight, 0);
    return out;
}

function normalizeWeights(values, focusIndex) {
    const sum = values.reduce((total, value) => total + value, 0);
    const normalized = sum > 0 ? values.map(value => value / sum) : values.map(() => 1 / values.length);
    return clampFocus(normalized, focusIndex);
}

function currentR1Weights(contextCharCounts, focusChars) {
    const bases = [0.15, 0.30].slice(-contextCharCounts.length);
    const adjusted = contextCharCounts.map((count, index) => bases[index] * lengthFactor(count));
    adjusted.push(0.55 * lengthFactor(focusChars));
    return normalizeWeights(adjusted, adjusted.length - 1);
}

function currentR2Weights(contextCharCounts, focusChars, hintsChars) {
    const bases = [0.10, 0.20].slice(-contextCharCounts.length);
    const adjusted = contextCharCounts.map((count, index) => bases[index] * lengthFactor(count));
    adjusted.push(0.45 * lengthFactor(focusChars));
    const focusIndex = adjusted.length - 1;
    if (hintsChars != null) adjusted.push(0.25 * lengthFactor(hintsChars));
    return normalizeWeights(adjusted, focusIndex);
}

function weightedVector(vectors, weights) {
    if (!vectors.length || vectors.length !== weights.length) throw new Error('vector/weight length mismatch');
    const out = new Float32Array(vectors[0].length);
    for (let index = 0; index < vectors.length; index++) {
        if (vectors[index].length !== out.length) throw new Error('embedding dims mismatch');
        for (let dim = 0; dim < out.length; dim++) out[dim] += vectors[index][dim] * weights[index];
    }
    return out;
}

function responseVectors(row) {
    const data = Array.isArray(row?.responseBody?.data) ? row.responseBody.data : [];
    return data.slice().sort((a, b) => a.index - b.index).map(item => item.embedding);
}

function cleanMessage(text) {
    return String(text || '')
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\[tts:[^\]]*\]/gi, '')
        .replace(/<state>[\s\S]*?<\/state>/gi, '')
        .trim();
}

async function loadMessages(samplePath, count) {
    const text = await fs.readFile(samplePath, 'utf8');
    let rows;
    try {
        const parsed = JSON.parse(text);
        rows = Array.isArray(parsed) ? parsed : (parsed.messages || parsed.chat || []);
    } catch {
        rows = text.split(/\r?\n/).filter(Boolean).map(JSON.parse);
        if (rows[0]?.chat_metadata || rows[0]?.user_name || rows[0]?.character_name) rows = rows.slice(1);
    }
    return rows.filter(item => cleanMessage(item?.mes).length > 0).slice(0, count);
}

function parseEventRanges(events) {
    const ranges = new Map();
    for (const event of events || []) {
        const id = String(event?.id || '');
        const match = String(event?.summary || '').match(/\(#(\d+)(?:-(\d+))?\)/);
        if (!id || !match) continue;
        const start = Math.max(0, Number(match[1]) - 1);
        const end = Math.max(start, Number(match[2] || match[1]) - 1);
        if (!ranges.has(id)) ranges.set(id, []);
        ranges.get(id).push({ start, end });
    }
    return ranges;
}

function scoreState(stateVectors, query) {
    return stateVectors.map(item => ({
        id: item.atomId,
        floor: Number(item.floor),
        score: cosineSimilarity(query, item.vector),
    })).sort((a, b) => b.score - a.score);
}

function stateByFloor(scored) {
    const out = new Map();
    for (const [index, item] of scored.entries()) {
        if (!out.has(item.floor)) out.set(item.floor, { rank: index + 1, score: item.score });
    }
    return out;
}

function scoreEvents(eventVectors, eventRanges, query) {
    const scored = eventVectors.map(item => ({
        id: item.eventId,
        score: cosineSimilarity(query, item.vector),
    })).sort((a, b) => b.score - a.score);
    const byFloor = new Map();
    for (const [index, item] of scored.entries()) {
        for (const range of eventRanges.get(item.id) || []) {
            for (let floor = range.start; floor <= range.end; floor++) {
                if (!byFloor.has(floor)) byFloor.set(floor, { rank: index + 1, score: item.score, eventId: item.id });
            }
        }
    }
    return byFloor;
}

function requiredFloors(goldCase) {
    return [...new Set([
        ...(goldCase.evidence?.requiredAll || []),
        ...(goldCase.evidence?.requiredAny || []),
    ])];
}

function floorObservation(floor, state, events) {
    const l0 = state.get(floor) || null;
    const l2 = events.get(floor) || null;
    return {
        floor,
        representable: !!l0 || !!l2,
        l0,
        l2,
        admitted: (l0?.score ?? -Infinity) >= ANCHOR_THRESHOLD || (l2?.score ?? -Infinity) >= EVENT_THRESHOLD,
    };
}

function contractAdmitted(goldCase, observations) {
    const byFloor = new Map(observations.map(item => [item.floor, item]));
    const all = goldCase.evidence?.requiredAll || [];
    const any = goldCase.evidence?.requiredAny || [];
    if (!all.length && !any.length) return null;
    return all.every(floor => byFloor.get(floor)?.admitted === true)
        && (!any.length || any.some(floor => byFloor.get(floor)?.admitted === true));
}

function compareRounded(actual, recorded) {
    if (!Array.isArray(recorded) || actual.length !== recorded.length) return false;
    return actual.every((value, index) => Number(value.toFixed(3)) === Number(recorded[index]));
}

function reproductionMismatch(observedRows, recomputed) {
    const observed = new Map((observedRows || []).map(item => [Number(item.floor), Number(item.score)]));
    const candidate = new Map([...recomputed.entries()]
        .filter(([, item]) => item.score >= ANCHOR_THRESHOLD)
        .map(([floor, item]) => [floor, item.score]));
    const floors = new Set([...observed.keys(), ...candidate.keys()]);
    const differences = [];
    for (const floor of floors) {
        const left = observed.get(floor);
        const right = candidate.get(floor);
        if (left == null || right == null || Math.abs(left - right) > 1e-5) {
            differences.push({ floor, observed: left ?? null, recomputed: right ?? null });
        }
    }
    return differences;
}

function aggregateRank(observations, key) {
    const represented = observations.filter(item => item[key]);
    const admitted = represented.filter(item => item[key].score >= (key === 'l0' ? ANCHOR_THRESHOLD : EVENT_THRESHOLD));
    return {
        represented: represented.length,
        admitted: admitted.length,
        admissionRate: represented.length ? admitted.length / represented.length : null,
        recallAt5: represented.length ? represented.filter(item => item[key].rank <= 5).length / represented.length : null,
        recallAt10: represented.length ? represented.filter(item => item[key].rank <= 10).length / represented.length : null,
        mrr: represented.length ? represented.reduce((sum, item) => sum + 1 / item[key].rank, 0) / represented.length : null,
    };
}

function aggregateSource(rows) {
    const scored = rows.filter(row => row.currentAdmitted != null);
    const wins = scored.filter(row => !row.currentAdmitted && row.armAdmitted).length;
    const losses = scored.filter(row => row.currentAdmitted && !row.armAdmitted).length;
    const currentFloors = rows.flatMap(row => row.floors.map(item => item.current));
    const armFloors = rows.flatMap(row => row.floors.map(item => item.arm));
    return {
        cases: rows.length,
        scoredCases: scored.length,
        unrepresentableRequiredFloors: currentFloors.filter(item => !item.representable).length,
        admission: {
            current: scored.filter(row => row.currentAdmitted).length,
            arm: scored.filter(row => row.armAdmitted).length,
            wins,
            losses,
            ties: scored.length - wins - losses,
        },
        l0: { current: aggregateRank(currentFloors, 'l0'), arm: aggregateRank(armFloors, 'l0') },
        l2: { current: aggregateRank(currentFloors, 'l2'), arm: aggregateRank(armFloors, 'l2') },
        reproductionMismatches: rows.reduce((sum, row) => sum + row.reproductionDifferences.length, 0),
        weightMismatches: rows.filter(row => !row.weightsReproduced).length,
    };
}

async function analyzeSource({ id, captureDir, snapshotPath }) {
    const [capture, snapshot] = await Promise.all([
        loadGoldCapture(captureDir),
        fs.readFile(snapshotPath, 'utf8').then(JSON.parse),
    ]);
    const messages = await loadMessages(capture.manifest.data.samplePath, capture.manifest.data.messageCount);
    const contextCharCounts = messages.slice(-2).map(message => cleanMessage(message.mes).length);
    const stateVectors = snapshot.vector?.stateVectors || [];
    const eventVectors = snapshot.vector?.eventVectors || [];
    const eventRanges = parseEventRanges(snapshot.summary?.store?.json?.events || []);
    const rows = [];

    for (const [index, goldCase] of capture.cases.entries()) {
        const production = capture.transportTrace[index].production || [];
        const embeddingRows = production.filter(item => item.endpoint === 'embedding');
        const segmentVectors = responseVectors(embeddingRows[0]);
        if (!segmentVectors.length) throw new Error(`${id}/${goldCase.id}: 缺 R1 embedding response`);
        const focusChars = goldCase.query.length;
        const r1Weights = currentR1Weights(contextCharCounts, focusChars);
        if (segmentVectors.length !== r1Weights.length) {
            throw new Error(`${id}/${goldCase.id}: segment count ${segmentVectors.length}/${r1Weights.length}`);
        }
        const hintsVectors = embeddingRows[1] ? responseVectors(embeddingRows[1]) : [];
        const hintsVector = hintsVectors[0] || null;
        const hintsChars = hintsVector ? Number(embeddingRows[1].inputChars) : null;
        const r2Weights = currentR2Weights(contextCharCounts, focusChars, hintsChars);
        const currentVectors = hintsVector ? [...segmentVectors, hintsVector] : segmentVectors;
        const currentQuery = weightedVector(currentVectors, r2Weights);
        const focusVector = segmentVectors[segmentVectors.length - 1];
        let armQuery = new Float32Array(focusVector);
        if (hintsVector) {
            const focusWeight = r2Weights[segmentVectors.length - 1];
            const hintsWeight = r2Weights[r2Weights.length - 1];
            const kept = focusWeight + hintsWeight;
            armQuery = weightedVector([focusVector, hintsVector], [focusWeight / kept, hintsWeight / kept]);
        }

        const currentState = stateByFloor(scoreState(stateVectors, currentQuery));
        const armState = stateByFloor(scoreState(stateVectors, armQuery));
        const currentEvents = scoreEvents(eventVectors, eventRanges, currentQuery);
        const armEvents = scoreEvents(eventVectors, eventRanges, armQuery);
        const floors = requiredFloors(goldCase).map(floor => ({
            floor,
            current: floorObservation(floor, currentState, currentEvents),
            arm: floorObservation(floor, armState, armEvents),
        }));
        const promptMetrics = capture.promptInputs[index].production.recallResult.metrics?.query || {};
        rows.push({
            caseId: goldCase.id,
            category: goldCase.category,
            currentAdmitted: contractAdmitted(goldCase, floors.map(item => item.current)),
            armAdmitted: contractAdmitted(goldCase, floors.map(item => item.arm)),
            weightsReproduced: compareRounded(r1Weights, promptMetrics.segmentWeights)
                && compareRounded(r2Weights, promptMetrics.r2Weights),
            reproductionDifferences: reproductionMismatch(
                capture.promptInputs[index].observationBase?.stages?.r2Dense,
                currentState,
            ),
            floors,
        });
    }
    return {
        id,
        captureRunId: capture.manifest.runId,
        snapshotPath: path.resolve(snapshotPath).replace(/\\/g, '/'),
        rows,
        summary: aggregateSource(rows),
    };
}

function renderReport(result) {
    const lines = [
        '# H-Q-DENSE Frozen-vector Screen',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        '- API：0（只消费冻结 Embedding response 与 snapshot vectors）',
        '',
        '| Source | Cases | Admission current → arm | W/L/T | L0 R@5 current → arm | L2 R@5 current → arm | Reproduction mismatch |',
        '|---|---:|---:|---:|---:|---:|---:|',
        ...result.sources.map(source => {
            const summary = source.summary;
            return `| ${source.id} | ${summary.cases} | ${summary.admission.current} → ${summary.admission.arm} | ${summary.admission.wins}/${summary.admission.losses}/${summary.admission.ties} | ${summary.l0.current.recallAt5 ?? 'n/a'} → ${summary.l0.arm.recallAt5 ?? 'n/a'} | ${summary.l2.current.recallAt5 ?? 'n/a'} → ${summary.l2.arm.recallAt5 ?? 'n/a'} | ${summary.reproductionMismatches} |`;
        }),
        '',
        '## Gate',
        '',
        `- baseline reproduction：${result.gates.reproduction ? 'PASS' : 'FAIL'}`,
        `- real-800 wins > losses：${result.gates.realWins ? 'PASS' : 'FAIL'}`,
        `- controlled zero admission loss：${result.gates.controlledNoLoss ? 'PASS' : 'FAIL'}`,
        '',
        '> 该 screen 只判断 dense context 稀释是否值得进入隔离 live candidate，不是插件修改结论。',
        '',
    ];
    return lines.join('\n');
}

export async function runQueryWeightScreen({ studyPath, outputDir }) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    if (!audit.ok || loaded.study.phase !== 'experiments' || loaded.study.active.hypothesisId !== 'H-Q') {
        throw new Error('STUDY audit/phase/active hypothesis 不允许 H-Q-DENSE screen');
    }
    const campaign = loaded.study.evidence.baselineCampaign;
    const sources = [{
        id: 'real-800',
        captureDir: loaded.study.evidence.sourceCapture.runDir,
        snapshotPath: loaded.study.inputs.dev.snapshot.path,
    }];
    for (const job of campaign.jobs) {
        const receipt = JSON.parse(await fs.readFile(job.bootstrapReceipt.path, 'utf8'));
        sources.push({ id: job.id, captureDir: job.capture.runDir, snapshotPath: receipt.snapshotPath });
    }
    const analyzed = [];
    for (const source of sources) analyzed.push(await analyzeSource(source));
    const real = analyzed.find(source => source.id === 'real-800').summary;
    const controlled = analyzed.filter(source => source.id !== 'real-800');
    const gates = {
        reproduction: analyzed.every(source => source.summary.reproductionMismatches === 0 && source.summary.weightMismatches === 0),
        realWins: real.admission.wins > real.admission.losses,
        controlledNoLoss: controlled.every(source => source.summary.admission.losses === 0),
    };
    const passed = Object.values(gates).every(Boolean);
    const result = {
        schemaVersion: 1,
        experimentId: 'H-Q-DENSE-screen-v1',
        hypothesis: 'For explicit pending questions, zeroing dense context weights improves gold evidence admission.',
        arm: { r1: 'context=0, focus=1', r2: 'context=0, preserve focus:hints ratio' },
        network: { modelApiCalls: 0 },
        gates,
        decision: {
            status: passed ? 'screen-pass' : 'reject',
            reason: passed
                ? '预注册的 reproduction、real wins>losses、controlled zero-loss 闸门全部通过。'
                : '至少一个预注册闸门未通过；不得改权重或阈值追结果。',
        },
        sources: analyzed,
    };
    const resultText = `${JSON.stringify(result, null, 2)}\n`;
    const reportText = `${renderReport(result)}\n`;
    const resultPath = path.join(outputDir, 'result.json');
    const reportPath = path.join(outputDir, 'report.md');
    await writeAtomic(resultPath, resultText);
    await writeAtomic(reportPath, reportText);
    const scriptPath = fileURLToPath(import.meta.url);
    const manifest = {
        schemaVersion: 1,
        experimentId: result.experimentId,
        study: { path: path.resolve(studyPath).replace(/\\/g, '/'), sha256: loaded.hash },
        script: { path: scriptPath.replace(/\\/g, '/'), sha256: await sha256File(scriptPath) },
        result: { path: resultPath.replace(/\\/g, '/'), sha256: sha256(resultText), bytes: Buffer.byteLength(resultText) },
        report: { path: reportPath.replace(/\\/g, '/'), sha256: sha256(reportText), bytes: Buffer.byteLength(reportText) },
        inputs: await Promise.all(sources.map(async source => ({
            id: source.id,
            captureManifest: {
                path: path.join(source.captureDir, 'manifest.json').replace(/\\/g, '/'),
                sha256: await sha256File(path.join(source.captureDir, 'manifest.json')),
            },
            snapshot: { path: source.snapshotPath.replace(/\\/g, '/'), sha256: await sha256File(source.snapshotPath) },
        }))),
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
    if (!args.study || !args.output) throw new Error('用法: query-weight-screen.mjs --study=<STUDY.json> --output=<experiment-dir>');
    const result = await runQueryWeightScreen({ studyPath: path.resolve(args.study), outputDir: path.resolve(args.output) });
    process.stdout.write(`${JSON.stringify({ decision: result.result.decision, gates: result.result.gates, sources: result.result.sources.map(source => ({ id: source.id, summary: source.summary })), manifest: result.manifest }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
