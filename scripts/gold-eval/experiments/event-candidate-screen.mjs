/* global Buffer, process */
// H-EVENT zero-API screen: apply the existing MMR cap only after all event sources merge.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';

const EVENT_SELECT_MAX = 50;
const EVENT_MMR_LAMBDA = 0.72;
const EVENT_BUDGET_MAX = 5000;
const RELATED_EVENT_MAX = 500;
const L0_JOINED_MAX_LENGTH = 120;
const EVENT_TRACE_SOURCES = new Set(['direct-event', 'related-event', 'causal-event']);

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

function estimateTokens(text) {
    if (!text) return 0;
    const value = String(text);
    const chinese = (value.match(/[\u4e00-\u9fff]/g) || []).length;
    return Math.ceil(chinese + (value.length - chinese) / 4);
}

function cleanSummary(summary) {
    return String(summary || '').replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '').trim();
}

function buildL0DisplayText(l0) {
    return String(l0?.atom?.semantic || l0?.text || '').trim() || '（未知锚点）';
}

function formatL1Line(chunk, isUser, names) {
    const speaker = chunk?.isUser
        ? String(names?.name1 || '用户')
        : String(chunk?.speaker || names?.name2 || '角色');
    const symbol = isUser ? '┌' : '›';
    return `    ${symbol} #${Number(chunk?.floor) + 1} [${speaker}] ${String(chunk?.text || '').trim()}`;
}

function buildEvidenceGroup(floor, atoms, l1ByFloor, names) {
    const pair = l1ByFloor.get(floor);
    const userL1 = pair?.userTop1 || null;
    const aiL1 = pair?.aiTop1 || null;
    let totalTokens = atoms.reduce((sum, atom) => sum + estimateTokens(buildL0DisplayText(atom)), 0) + 10;
    if (userL1) totalTokens += estimateTokens(formatL1Line(userL1, true, names));
    if (aiL1) totalTokens += estimateTokens(formatL1Line(aiL1, false, names));
    return { floor, l0Atoms: atoms, userL1, aiL1, totalTokens };
}

function formatEvidenceGroup(group, names) {
    const displayTexts = group.l0Atoms.map(buildL0DisplayText);
    const joined = displayTexts.join('；');
    const lines = [];
    if (joined.length <= L0_JOINED_MAX_LENGTH) {
        lines.push(`  › #${group.floor + 1} [📌] ${joined}`);
    } else {
        lines.push(`  › #${group.floor + 1} [📌] ${displayTexts[0]}`);
        for (const text of displayTexts.slice(1)) lines.push(`  │      ${text}`);
    }
    if (group.userL1) lines.push(formatL1Line(group.userL1, true, names));
    if (group.aiL1) lines.push(formatL1Line(group.aiL1, false, names));
    return lines;
}

function collectEvidenceGroups(event, l0Selected, l1ByFloor, usedL0Ids, names) {
    const range = parseFloorRange(event?.summary);
    if (!range) return [];
    const byFloor = new Map();
    for (const l0 of l0Selected) {
        if (usedL0Ids.has(l0.id) || l0.floor < range.start || l0.floor > range.end) continue;
        if (!byFloor.has(l0.floor)) byFloor.set(l0.floor, []);
        byFloor.get(l0.floor).push(l0);
        usedL0Ids.add(l0.id);
    }
    return [...byFloor.entries()]
        .map(([floor, atoms]) => buildEvidenceGroup(floor, atoms, l1ByFloor, names))
        .sort((left, right) => left.floor - right.floor);
}

function rollbackEvidenceGroups(groups, usedL0Ids) {
    for (const group of groups) {
        for (const atom of group.l0Atoms) usedL0Ids.delete(atom.id);
    }
}

function formatCausalEventLine(item) {
    const event = item?.event || {};
    const depth = Math.max(1, Math.min(9, item?._causalDepth || 1));
    const indent = `  │${'  '.repeat(depth - 1)}`;
    const prefix = `${indent}├─ 前因`;
    const time = event.timeLabel ? `【${event.timeLabel}】` : '';
    const people = (event.participants || []).join(' / ');
    const range = parseFloorRange(event.summary);
    const floorHint = range
        ? `(#${range.start + 1}${range.end === range.start ? '' : `-${range.end + 1}`})`
        : '';
    return [
        `${prefix}${time}${people ? ` ${people}` : ''}`,
        `${indent}  ${`${cleanSummary(event.summary)}${floorHint ? ` ${floorHint}` : ''}`.trim()}`,
    ].join('\n');
}

function formatEventWithEvidence(item, groups, causalById, names) {
    const event = item?.event || item || {};
    const time = event.timeLabel || '';
    const title = String(event.title || '').trim();
    const people = (event.participants || []).join(' / ').trim();
    const displayTitle = title || people || event.id || '事件';
    const lines = [time ? `0.【${time}】${displayTitle}` : `0. ${displayTitle}`];
    if (people && displayTitle !== people) lines.push(`  ${people}`);
    lines.push(`  ${cleanSummary(event.summary)}`);
    for (const causeId of event.causedBy || []) {
        const cause = causalById.get(causeId);
        if (cause) lines.push(formatCausalEventLine(cause));
    }
    for (const group of groups) lines.push(...formatEvidenceGroup(group, names));
    return lines.join('\n');
}

function normalizePackingInput(recallResult, names) {
    const l1ByFloor = new Map((recallResult?.l1ByFloorEntries || []).map(([floor, value]) => [Number(floor), value]));
    const causalById = new Map((recallResult?.causalChain || [])
        .filter(item => item?.event?.id)
        .map(item => [item.event.id, item]));
    const candidates = (recallResult?.events || [])
        .filter(item => item?.event?.summary)
        .map((item, index) => ({ item, inputIndex: index }))
        .sort((left, right) => ((right.item.similarity || 0) - (left.item.similarity || 0)) || (left.inputIndex - right.inputIndex))
        .map(entry => entry.item);
    return {
        candidates,
        causalById,
        l0Selected: recallResult?.l0Selected || [],
        l1ByFloor,
        names,
    };
}

function selectedRow(candidate, candidateRank, text, tokens, groups = []) {
    return {
        eventId: String(candidate?.event?.id || ''),
        recallType: String(candidate?._recallType || 'RELATED'),
        candidateRank,
        text,
        tokens,
        evidenceFloors: groups.map(group => group.floor),
    };
}

function packCurrentEvents(recallResult, names = null) {
    const { candidates, causalById, l0Selected, l1ByFloor } = normalizePackingInput(recallResult, names);
    const usedL0Ids = new Set();
    const selected = [];
    let eventTokens = 0;
    let relatedTokens = 0;
    let allowEventEvidence = true;

    for (const [candidateRank, candidate] of candidates.entries()) {
        if (eventTokens >= EVENT_BUDGET_MAX) break;
        const direct = candidate._recallType === 'DIRECT';
        if (!direct && relatedTokens >= RELATED_EVENT_MAX) continue;
        const useEvidence = direct && allowEventEvidence;
        const groups = useEvidence
            ? collectEvidenceGroups(candidate.event, l0Selected, l1ByFloor, usedL0Ids, names)
            : [];
        const fullText = formatEventWithEvidence(candidate, groups, causalById, names);
        const fullCost = estimateTokens(fullText);
        const fullFits = eventTokens + fullCost <= EVENT_BUDGET_MAX
            && (direct || relatedTokens + fullCost <= RELATED_EVENT_MAX);
        if (!fullFits) {
            const summaryText = formatEventWithEvidence(candidate, [], causalById, names);
            const summaryCost = estimateTokens(summaryText);
            const summaryFitsEvent = eventTokens + summaryCost <= EVENT_BUDGET_MAX;
            const summaryFitsRelated = direct || relatedTokens + summaryCost <= RELATED_EVENT_MAX;
            rollbackEvidenceGroups(groups, usedL0Ids);
            if (!summaryFitsEvent) break;
            if (!summaryFitsRelated) continue;
            if (useEvidence && groups.length) allowEventEvidence = false;
            selected.push(selectedRow(candidate, candidateRank, summaryText, summaryCost));
            eventTokens += summaryCost;
            if (!direct) relatedTokens += summaryCost;
            continue;
        }
        selected.push(selectedRow(candidate, candidateRank, fullText, fullCost, groups));
        eventTokens += fullCost;
        if (!direct) relatedTokens += fullCost;
    }
    return { selected, eventTokens, relatedTokens };
}

function selectedEventIdsFromTrace(prompt) {
    const ids = [];
    const seen = new Set();
    for (const item of prompt?.evidenceTrace?.prompt || []) {
        if (!EVENT_TRACE_SOURCES.has(item?.source)) continue;
        const unitId = String(item?.unitId || '');
        if (!unitId.startsWith('event:') || seen.has(unitId)) continue;
        seen.add(unitId);
        ids.push(unitId.slice('event:'.length));
    }
    return ids;
}

function contractAdmitted(goldCase, floors) {
    const all = goldCase?.evidence?.requiredAll || [];
    const any = goldCase?.evidence?.requiredAny || [];
    if (!all.length && !any.length) return null;
    return all.every(floor => floors.has(floor)) && (!any.length || any.some(floor => floors.has(floor)));
}

function forbiddenAdmitted(goldCase, floors) {
    const forbidden = goldCase?.evidence?.forbiddenAsCurrent || [];
    return forbidden.length ? forbidden.some(floor => floors.has(floor)) : null;
}

function cosineSimilarity(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || left.length === 0) return 0;
    let dot = 0;
    let leftNorm = 0;
    let rightNorm = 0;
    for (let index = 0; index < left.length; index++) {
        const a = Number(left[index]);
        const b = Number(right[index]);
        if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
        dot += a * b;
        leftNorm += a * a;
        rightNorm += b * b;
    }
    return leftNorm > 0 && rightNorm > 0 ? dot / Math.sqrt(leftNorm * rightNorm) : 0;
}

// Mirrors recall.js: strict > means the existing insertion order resolves an exact tie.
export function mmrSelect(candidates, vectorById, { limit = EVENT_SELECT_MAX, lambda = EVENT_MMR_LAMBDA } = {}) {
    const selected = [];
    const selectedIds = new Set();
    while (selected.length < limit && candidates.length) {
        let best = null;
        let bestScore = -Infinity;
        for (const candidate of candidates) {
            const eventId = String(candidate?.event?.id || '');
            if (!eventId || selectedIds.has(eventId)) continue;
            const vector = vectorById.get(eventId);
            let diversity = 0;
            for (const prior of selected) {
                diversity = Math.max(diversity, cosineSimilarity(vector, vectorById.get(String(prior.event.id))));
            }
            const score = lambda * Number(candidate.similarity || 0) - (1 - lambda) * diversity;
            if (score > bestScore) {
                best = candidate;
                bestScore = score;
            }
        }
        if (!best) break;
        selected.push(best);
        selectedIds.add(String(best.event.id));
    }
    return selected;
}

export function selectFinalEventCandidates(events, vectorById) {
    const unique = [];
    const seen = new Set();
    const missingVectorIds = [];
    const malformedEventIndexes = [];
    for (const [index, item] of (events || []).entries()) {
        const eventId = String(item?.event?.id || '');
        if (!eventId) {
            malformedEventIndexes.push(index);
            continue;
        }
        if (seen.has(eventId)) continue;
        seen.add(eventId);
        if (!vectorById.has(eventId)) missingVectorIds.push(eventId);
        unique.push(item);
    }
    if (missingVectorIds.length || malformedEventIndexes.length) {
        return { ok: false, events: [], inputEvents: unique.length, missingVectorIds, malformedEventIndexes };
    }
    return {
        ok: true,
        events: mmrSelect(unique, vectorById),
        inputEvents: unique.length,
        missingVectorIds: [],
        malformedEventIndexes: [],
    };
}

function parseFloorRange(summary) {
    const match = String(summary || '').match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, Number(match[1]) - 1);
    const end = Math.max(start, Number(match[2] || match[1]) - 1);
    return { start, end };
}

function eventFloors(eventId, recallResult) {
    const selected = (recallResult?.events || []).find(item => String(item?.event?.id || '') === eventId);
    if (!selected?.event) return [];
    const causalById = new Map((recallResult?.causalChain || [])
        .filter(item => item?.event?.id)
        .map(item => [item.event.id, item]));
    const ranges = [parseFloorRange(selected.event.summary)];
    for (const causeId of selected.event.causedBy || []) {
        ranges.push(parseFloorRange(causalById.get(causeId)?.event?.summary));
    }
    return ranges.filter(Boolean).flatMap(range => Array.from({ length: range.end - range.start + 1 }, (_, index) => range.start + index));
}

function admittedFloors(pack, recallResult) {
    return new Set((pack.selected || []).flatMap(row => eventFloors(row.eventId, recallResult)));
}

function sequenceDiff(expected, actual) {
    const differences = [];
    const length = Math.max(expected.length, actual.length);
    for (let index = 0; index < length; index++) {
        if (expected[index] !== actual[index]) differences.push({ rank: index + 1, expected: expected[index] || null, actual: actual[index] || null });
    }
    return differences;
}

async function loadReplayNames(samplePath) {
    const raw = await fs.readFile(samplePath, 'utf8');
    let header = null;
    try {
        const parsed = JSON.parse(raw);
        header = Array.isArray(parsed) ? (parsed[0] || null) : parsed;
    } catch {
        const firstLine = raw.split(/\r?\n/, 1)[0]?.trim();
        if (firstLine) header = JSON.parse(firstLine);
    }
    return { name1: String(header?.user_name || header?.name1 || '用户'), name2: String(header?.character_name || header?.name2 || '角色') };
}

async function loadEventVectorMap(snapshotPath) {
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    const records = snapshot?.vector?.eventVectors;
    if (!Array.isArray(records)) throw new Error(`snapshot 缺少 eventVectors: ${snapshotPath}`);
    const vectors = new Map();
    for (const record of records) {
        const eventId = String(record?.eventId || '');
        if (!eventId || !Array.isArray(record?.vector) || !record.vector.length) continue;
        if (vectors.has(eventId)) throw new Error(`snapshot event vector 重复: ${eventId}`);
        vectors.set(eventId, record.vector);
    }
    return vectors;
}

function budgetViolations(pack) {
    const violations = [];
    if (pack.eventTokens > EVENT_BUDGET_MAX) violations.push(`event=${pack.eventTokens}`);
    if (pack.relatedTokens > RELATED_EVENT_MAX) violations.push(`related=${pack.relatedTokens}`);
    return violations;
}

function pairedAdmission(rows) {
    const eligible = rows.filter(row => row.currentAdmitted != null && row.armAdmitted != null);
    const wins = eligible.filter(row => !row.currentAdmitted && row.armAdmitted).length;
    const losses = eligible.filter(row => row.currentAdmitted && !row.armAdmitted).length;
    return {
        eligible: eligible.length,
        current: eligible.filter(row => row.currentAdmitted).length,
        arm: eligible.filter(row => row.armAdmitted).length,
        wins,
        losses,
        ties: eligible.length - wins - losses,
        net: wins - losses,
    };
}

function average(rows, key) {
    return rows.length ? rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length : 0;
}

function summarize(rows) {
    const forbidden = rows.filter(row => row.currentForbidden != null && row.armForbidden != null);
    return {
        cases: rows.length,
        admission: pairedAdmission(rows),
        forbidden: {
            eligibleCases: forbidden.length,
            newlyAdmitted: forbidden.filter(row => !row.currentForbidden && row.armForbidden).length,
        },
        sourceEvents: { average: average(rows, 'sourceEventCount'), max: Math.max(...rows.map(row => row.sourceEventCount)) },
        finalEvents: { average: average(rows, 'armEventCount'), max: Math.max(...rows.map(row => row.armEventCount)) },
        promptEvents: { currentAverage: average(rows, 'currentPromptEvents'), armAverage: average(rows, 'armPromptEvents') },
        reproductionMismatches: rows.filter(row => row.reproductionDifferences.length).length,
        missingVectorCases: rows.filter(row => row.missingVectorIds.length || row.malformedEventIndexes.length).length,
        capViolations: rows.filter(row => row.armEventCount > EVENT_SELECT_MAX || row.armDuplicateEventIds).length,
        budgetViolations: rows.filter(row => row.budgetViolations.length).length,
    };
}

async function analyzeSource({ id, captureDir }) {
    const capture = await loadGoldCapture(captureDir);
    const names = await loadReplayNames(capture.manifest.data.samplePath);
    const snapshotPath = capture.manifest.data.snapshotPath;
    const vectorById = await loadEventVectorMap(snapshotPath);
    const rows = [];
    for (const [index, goldCase] of capture.cases.entries()) {
        const recallResult = capture.promptInputs[index]?.production?.recallResult || {};
        const current = packCurrentEvents(recallResult, names);
        const selected = selectFinalEventCandidates(recallResult.events || [], vectorById);
        const armRecallResult = { ...recallResult, events: selected.events };
        const arm = selected.ok ? packCurrentEvents(armRecallResult, names) : { selected: [], eventTokens: 0, relatedTokens: 0 };
        const currentFloors = admittedFloors(current, recallResult);
        const armFloors = selected.ok ? admittedFloors(arm, armRecallResult) : new Set();
        const expectedIds = selectedEventIdsFromTrace(capture.prompts[index]);
        const currentIds = current.selected.map(row => row.eventId);
        rows.push({
            caseId: goldCase.id,
            category: goldCase.category,
            currentAdmitted: contractAdmitted(goldCase, currentFloors),
            armAdmitted: selected.ok ? contractAdmitted(goldCase, armFloors) : null,
            currentForbidden: forbiddenAdmitted(goldCase, currentFloors),
            armForbidden: selected.ok ? forbiddenAdmitted(goldCase, armFloors) : null,
            reproductionDifferences: sequenceDiff(expectedIds, currentIds),
            sourceEventCount: (recallResult.events || []).length,
            armEventCount: selected.events.length,
            armDuplicateEventIds: new Set(selected.events.map(item => String(item.event.id))).size !== selected.events.length,
            currentPromptEvents: current.selected.length,
            armPromptEvents: arm.selected.length,
            missingVectorIds: selected.missingVectorIds,
            malformedEventIndexes: selected.malformedEventIndexes,
            budgetViolations: [...budgetViolations(current), ...budgetViolations(arm)],
            current: { selectedEventIds: currentIds },
            arm: { selectedEventIds: arm.selected.map(row => row.eventId) },
        });
    }
    return { id, captureRunId: capture.manifest.runId, snapshotPath, snapshotVectorCount: vectorById.size, rows, summary: summarize(rows) };
}

function renderReport(result) {
    return [
        '# H-EVENT Final MMR Cap Screen',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        '- API：0（只消费 valid capture、冻结 snapshot event vector 与评测纯函数）',
        '',
        '| Source | Cases | Admission current → arm | W/L/T (net) | Final events avg / max | Prompt events avg current → arm | New forbidden | Reproduction mismatch |',
        '|---|---:|---:|---:|---:|---:|---:|---:|',
        ...result.sources.map(source => {
            const summary = source.summary;
            return `| ${source.id} | ${summary.cases} | ${summary.admission.current} → ${summary.admission.arm} | ${summary.admission.wins}/${summary.admission.losses}/${summary.admission.ties} (${summary.admission.net}) | ${summary.finalEvents.average.toFixed(2)} / ${summary.finalEvents.max} | ${summary.promptEvents.currentAverage.toFixed(2)} → ${summary.promptEvents.armAverage.toFixed(2)} | ${summary.forbidden.newlyAdmitted} | ${summary.reproductionMismatches} |`;
        }),
        '',
        '## Gate',
        '',
        ...Object.entries(result.gates).map(([key, passed]) => `- ${key}：${passed ? 'PASS' : 'FAIL'}`),
        '',
        '> Stage 1 只判断最终事件边界是否值得进入隔离 recall-cassette candidate；不能代替完整 Prompt 或 reader 结论。',
        '',
    ].join('\n');
}

export async function runEventCandidateScreen({ studyPath, outputDir }) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    const hypothesis = loaded.study.hypotheses.find(item => item.id === 'H-EVENT');
    if (!audit.ok || loaded.study.phase !== 'experiments' || loaded.study.active.hypothesisId !== 'H-EVENT' || hypothesis?.status !== 'preregistered') {
        throw new Error('STUDY audit/phase/active hypothesis 不允许 H-EVENT screen');
    }
    const sources = [{ id: 'real-800', captureDir: loaded.study.evidence.sourceCapture.runDir }];
    for (const job of loaded.study.evidence.baselineCampaign.jobs) sources.push({ id: job.id, captureDir: job.capture.runDir });
    const analyzed = [];
    for (const source of sources) analyzed.push(await analyzeSource(source));
    const real = analyzed.find(source => source.id === 'real-800').summary;
    const controlled = analyzed.filter(source => source.id !== 'real-800').map(source => source.summary);
    const gates = {
        baselineReproduction: analyzed.every(source => source.summary.reproductionMismatches === 0),
        finalCapAndUnique: analyzed.every(source => source.summary.capViolations === 0),
        vectorCoverage: analyzed.every(source => source.summary.missingVectorCases === 0),
        budgetsAndZeroApi: analyzed.every(source => source.summary.budgetViolations === 0),
        realNetAdmissionGain: real.admission.wins > real.admission.losses && real.admission.net >= 5,
        controlledRequiredNoLoss: controlled.every(source => source.admission.losses === 0),
        controlledNoNewForbidden: controlled.every(source => source.forbidden.newlyAdmitted === 0),
    };
    const valid = gates.baselineReproduction && gates.finalCapAndUnique && gates.vectorCoverage && gates.budgetsAndZeroApi;
    const passed = valid && Object.values(gates).every(Boolean);
    const experimentId = path.basename(outputDir);
    if (!/^H-EVENT-screen-v\d+$/.test(experimentId)) throw new Error(`H-EVENT output 目录名必须是版本化 attempt id: ${experimentId}`);
    const result = {
        schemaVersion: 1,
        experimentId,
        hypothesis: 'Reapplying the existing MMR=50 boundary after all current event sources merge improves event-to-Prompt required admission without controlled regressions.',
        arm: 'current eventHits after lexical and L0-linked merge, deduplicated by event id, then existing MMR(lambda=0.72) selects at most 50',
        frozen: { query: true, embedding: true, thresholds: true, rerank: true, prompt: true, reader: true },
        network: { modelApiCalls: 0, productionTransportCalls: 0 },
        gates,
        decision: {
            status: !valid ? 'invalid' : (passed ? 'screen-pass' : 'reject'),
            reason: !valid
                ? 'baseline reproduction、vector、cap 或预算不变量失败；禁止解释 arm。'
                : (passed ? '全部预注册 Stage 1 闸门通过；只授权建立隔离 recall-cassette candidate。' : '至少一个预注册质量/非回归闸门失败；不得调参或换边界追结果。'),
        },
        sources: analyzed,
    };
    await fs.mkdir(outputDir, { recursive: false });
    const resultText = `${JSON.stringify(result, null, 2)}\n`;
    const reportText = `${renderReport(result)}\n`;
    const resultPath = path.join(outputDir, 'result.json');
    const reportPath = path.join(outputDir, 'report.md');
    await writeAtomic(resultPath, resultText);
    await writeAtomic(reportPath, reportText);
    const scriptPath = fileURLToPath(import.meta.url);
    const manifest = {
        schemaVersion: 1,
        experimentId,
        study: { path: path.resolve(studyPath).replace(/\\/g, '/'), sha256: loaded.hash },
        script: { path: scriptPath.replace(/\\/g, '/'), sha256: await sha256File(scriptPath) },
        result: { path: resultPath.replace(/\\/g, '/'), sha256: sha256(resultText), bytes: Buffer.byteLength(resultText) },
        report: { path: reportPath.replace(/\\/g, '/'), sha256: sha256(reportText), bytes: Buffer.byteLength(reportText) },
        inputs: await Promise.all(analyzed.map(async source => ({
            id: source.id,
            captureManifest: {
                path: path.join(sources.find(item => item.id === source.id).captureDir, 'manifest.json').replace(/\\/g, '/'),
                sha256: await sha256File(path.join(sources.find(item => item.id === source.id).captureDir, 'manifest.json')),
            },
            snapshot: { path: path.resolve(source.snapshotPath).replace(/\\/g, '/'), sha256: await sha256File(source.snapshotPath) },
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
    if (!args.study || !args.output) throw new Error('用法: event-candidate-screen.mjs --study=<STUDY.json> --output=<experiment-dir>');
    const completed = await runEventCandidateScreen({ studyPath: path.resolve(args.study), outputDir: path.resolve(args.output) });
    process.stdout.write(`${JSON.stringify({
        decision: completed.result.decision,
        gates: completed.result.gates,
        sources: completed.result.sources.map(source => ({ id: source.id, summary: source.summary })),
        manifest: completed.manifest,
    }, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
    main().catch(error => {
        process.stderr.write(`${error?.stack || error}\n`);
        process.exitCode = 1;
    });
}
