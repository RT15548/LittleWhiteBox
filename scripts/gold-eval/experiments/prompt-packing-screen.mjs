/* global Buffer, process */
// H-PROMPT zero-API screen. Replays only the event packing boundary from valid captures.

import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { loadGoldCapture } from '../lib/run-store.mjs';
import { auditStudy, loadStudy } from '../study/store.mjs';

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

function parseFloorRange(summary) {
    const match = String(summary || '').match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, Number(match[1]) - 1);
    const end = Math.max(start, Number(match[2] || match[1]) - 1);
    return { start, end };
}

function cleanSummary(summary) {
    return String(summary || '').replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '').trim();
}

function buildL0DisplayText(l0) {
    return String(l0?.atom?.semantic || l0?.text || '').trim() || '（未知锚点）';
}

function formatL1Line(chunk, isContext, names) {
    const speaker = chunk?.isUser
        ? String(names?.name1 || '用户')
        : String(chunk?.speaker || names?.name2 || '角色');
    const symbol = isContext ? '┌' : '›';
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

function normalizedInput(recallResult, names) {
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

export function packCurrentEvents(recallResult, names = null) {
    const normalized = normalizedInput(recallResult, names);
    const { candidates, causalById, l0Selected, l1ByFloor } = normalized;
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
    return { selected, eventTokens, relatedTokens, usedL0Ids: [...usedL0Ids] };
}

export function packTwoPassEvents(recallResult, names = null) {
    const normalized = normalizedInput(recallResult, names);
    const { candidates, causalById, l0Selected, l1ByFloor } = normalized;
    const selected = [];
    let eventTokens = 0;
    let relatedTokens = 0;

    for (const [candidateRank, candidate] of candidates.entries()) {
        if (eventTokens >= EVENT_BUDGET_MAX) break;
        const direct = candidate._recallType === 'DIRECT';
        if (!direct && relatedTokens >= RELATED_EVENT_MAX) continue;
        const text = formatEventWithEvidence(candidate, [], causalById, names);
        const tokens = estimateTokens(text);
        if (eventTokens + tokens > EVENT_BUDGET_MAX) break;
        if (!direct && relatedTokens + tokens > RELATED_EVENT_MAX) continue;
        selected.push(selectedRow(candidate, candidateRank, text, tokens));
        eventTokens += tokens;
        if (!direct) relatedTokens += tokens;
    }

    const usedL0Ids = new Set();
    for (const row of selected) {
        if (row.recallType !== 'DIRECT') continue;
        const candidate = candidates[row.candidateRank];
        const groups = collectEvidenceGroups(candidate.event, l0Selected, l1ByFloor, usedL0Ids, names);
        if (!groups.length) continue;
        const fullText = formatEventWithEvidence(candidate, groups, causalById, names);
        const fullCost = estimateTokens(fullText);
        const incremental = fullCost - row.tokens;
        if (incremental < 0) throw new Error(`negative evidence increment: ${row.eventId}`);
        if (eventTokens + incremental > EVENT_BUDGET_MAX) {
            rollbackEvidenceGroups(groups, usedL0Ids);
            continue;
        }
        row.text = fullText;
        row.tokens = fullCost;
        row.evidenceFloors = groups.map(group => group.floor);
        eventTokens += incremental;
    }
    return { selected, eventTokens, relatedTokens, usedL0Ids: [...usedL0Ids] };
}

export function selectedEventIdsFromTrace(prompt) {
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

function eventFloors(row, recallResult) {
    const candidate = (recallResult?.events || []).find(item => String(item?.event?.id || '') === row.eventId);
    if (!candidate) return [];
    const causalById = new Map((recallResult?.causalChain || [])
        .filter(item => item?.event?.id)
        .map(item => [item.event.id, item]));
    const ranges = [];
    const direct = parseFloorRange(candidate.event?.summary);
    if (direct) ranges.push(direct);
    for (const causeId of candidate.event?.causedBy || []) {
        const range = parseFloorRange(causalById.get(causeId)?.event?.summary);
        if (range) ranges.push(range);
    }
    return ranges.flatMap(range => Array.from({ length: range.end - range.start + 1 }, (_, index) => range.start + index));
}

function admittedFloors(pack, recallResult) {
    return new Set(pack.selected.flatMap(row => eventFloors(row, recallResult)));
}

export function contractAdmitted(goldCase, floors) {
    const all = goldCase?.evidence?.requiredAll || [];
    const any = goldCase?.evidence?.requiredAny || [];
    if (!all.length && !any.length) return null;
    return all.every(floor => floors.has(floor)) && (!any.length || any.some(floor => floors.has(floor)));
}

export function forbiddenAdmitted(goldCase, floors) {
    const forbidden = goldCase?.evidence?.forbiddenAsCurrent || [];
    return forbidden.length ? forbidden.some(floor => floors.has(floor)) : null;
}

function sequenceDiff(expected, actual) {
    const length = Math.max(expected.length, actual.length);
    const differences = [];
    for (let index = 0; index < length; index++) {
        if (expected[index] !== actual[index]) {
            differences.push({ rank: index + 1, expected: expected[index] || null, actual: actual[index] || null });
        }
    }
    return differences;
}

function aggregateRows(rows) {
    const scored = rows.filter(row => row.currentAdmitted != null);
    const wins = scored.filter(row => !row.currentAdmitted && row.armAdmitted).length;
    const losses = scored.filter(row => row.currentAdmitted && !row.armAdmitted).length;
    const forbidden = rows.filter(row => row.currentForbidden != null);
    return {
        cases: rows.length,
        scoredCases: scored.length,
        admission: {
            current: scored.filter(row => row.currentAdmitted).length,
            arm: scored.filter(row => row.armAdmitted).length,
            wins,
            losses,
            ties: scored.length - wins - losses,
            net: wins - losses,
        },
        forbidden: {
            eligibleCases: forbidden.length,
            current: forbidden.filter(row => row.currentForbidden).length,
            arm: forbidden.filter(row => row.armForbidden).length,
            newlyAdmitted: forbidden.filter(row => !row.currentForbidden && row.armForbidden).length,
        },
        selectedEvents: {
            currentAverage: rows.reduce((sum, row) => sum + row.current.selectedEvents, 0) / rows.length,
            armAverage: rows.reduce((sum, row) => sum + row.arm.selectedEvents, 0) / rows.length,
        },
        eventTokens: {
            currentAverage: rows.reduce((sum, row) => sum + row.current.eventTokens, 0) / rows.length,
            armAverage: rows.reduce((sum, row) => sum + row.arm.eventTokens, 0) / rows.length,
            maxCurrent: Math.max(...rows.map(row => row.current.eventTokens)),
            maxArm: Math.max(...rows.map(row => row.arm.eventTokens)),
        },
        reproductionMismatches: rows.filter(row => row.reproductionDifferences.length).length,
        budgetViolations: rows.filter(row => row.budgetViolations.length).length,
    };
}

async function loadReplayNames(samplePath) {
    const raw = await fs.readFile(samplePath, 'utf8');
    let header = null;
    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) header = parsed;
        else header = parsed[0] || null;
    } catch {
        const firstLine = raw.split(/\r?\n/, 1)[0]?.trim();
        if (firstLine) header = JSON.parse(firstLine);
    }
    return {
        name1: String(header?.user_name || header?.name1 || '用户'),
        name2: String(header?.character_name || header?.name2 || '角色'),
    };
}

async function analyzeSource({ id, captureDir }) {
    const capture = await loadGoldCapture(captureDir);
    const names = await loadReplayNames(capture.manifest.data.samplePath);
    const rows = [];
    for (const [index, goldCase] of capture.cases.entries()) {
        const recallResult = capture.promptInputs[index]?.production?.recallResult || {};
        const current = packCurrentEvents(recallResult, names);
        const arm = packTwoPassEvents(recallResult, names);
        const expectedIds = selectedEventIdsFromTrace(capture.prompts[index]);
        const actualIds = current.selected.map(row => row.eventId);
        const currentFloors = admittedFloors(current, recallResult);
        const armFloors = admittedFloors(arm, recallResult);
        const budgetViolations = [];
        for (const [name, pack] of [['current', current], ['arm', arm]]) {
            if (pack.eventTokens > EVENT_BUDGET_MAX) budgetViolations.push(`${name}.event=${pack.eventTokens}`);
            if (pack.relatedTokens > RELATED_EVENT_MAX) budgetViolations.push(`${name}.related=${pack.relatedTokens}`);
        }
        rows.push({
            caseId: goldCase.id,
            category: goldCase.category,
            currentAdmitted: contractAdmitted(goldCase, currentFloors),
            armAdmitted: contractAdmitted(goldCase, armFloors),
            currentForbidden: forbiddenAdmitted(goldCase, currentFloors),
            armForbidden: forbiddenAdmitted(goldCase, armFloors),
            reproductionDifferences: sequenceDiff(expectedIds, actualIds),
            budgetViolations,
            current: {
                selectedEvents: current.selected.length,
                eventTokens: current.eventTokens,
                relatedTokens: current.relatedTokens,
                evidenceEvents: current.selected.filter(row => row.evidenceFloors.length).length,
                selectedEventIds: actualIds,
            },
            arm: {
                selectedEvents: arm.selected.length,
                eventTokens: arm.eventTokens,
                relatedTokens: arm.relatedTokens,
                evidenceEvents: arm.selected.filter(row => row.evidenceFloors.length).length,
                selectedEventIds: arm.selected.map(row => row.eventId),
            },
        });
    }
    return { id, captureRunId: capture.manifest.runId, names, rows, summary: aggregateRows(rows) };
}

function renderReport(result) {
    return [
        '# H-PROMPT Two-pass Packing Screen',
        '',
        `- 状态：${result.decision.status}`,
        `- 结论：${result.decision.reason}`,
        '- API：0（只消费 valid capture 的冻结 Prompt 输入与 trace）',
        '',
        '| Source | Cases | Admission current → arm | W/L/T (net) | Events avg current → arm | Tokens avg current → arm | New forbidden | Reproduction mismatch |',
        '|---|---:|---:|---:|---:|---:|---:|---:|',
        ...result.sources.map(source => {
            const summary = source.summary;
            return `| ${source.id} | ${summary.cases} | ${summary.admission.current} → ${summary.admission.arm} | ${summary.admission.wins}/${summary.admission.losses}/${summary.admission.ties} (${summary.admission.net}) | ${summary.selectedEvents.currentAverage.toFixed(2)} → ${summary.selectedEvents.armAverage.toFixed(2)} | ${summary.eventTokens.currentAverage.toFixed(1)} → ${summary.eventTokens.armAverage.toFixed(1)} | ${summary.forbidden.newlyAdmitted} | ${summary.reproductionMismatches} |`;
        }),
        '',
        '## Gate',
        '',
        `- baseline reproduction：${result.gates.reproduction ? 'PASS' : 'FAIL'}`,
        `- real-800 net admission ≥ 5：${result.gates.realNetGain ? 'PASS' : 'FAIL'}`,
        `- controlled required zero loss：${result.gates.controlledNoLoss ? 'PASS' : 'FAIL'}`,
        `- controlled forbidden zero new case：${result.gates.controlledNoNewForbidden ? 'PASS' : 'FAIL'}`,
        `- budgets / zero API：${result.gates.invariants ? 'PASS' : 'FAIL'}`,
        '',
        '> Stage 1 只决定是否值得建立隔离 prompt-only candidate；楼层覆盖不能授权插件改动。',
        '',
    ].join('\n');
}

export async function runPromptPackingScreen({ studyPath, outputDir }) {
    const loaded = await loadStudy(studyPath);
    const audit = await auditStudy(loaded.study);
    if (!audit.ok || loaded.study.phase !== 'experiments' || loaded.study.active.hypothesisId !== 'H-PROMPT') {
        throw new Error('STUDY audit/phase/active hypothesis 不允许 H-PROMPT screen');
    }
    const sources = [{ id: 'real-800', captureDir: loaded.study.evidence.sourceCapture.runDir }];
    for (const job of loaded.study.evidence.baselineCampaign.jobs) {
        sources.push({ id: job.id, captureDir: job.capture.runDir });
    }
    const analyzed = [];
    for (const source of sources) analyzed.push(await analyzeSource(source));
    const real = analyzed.find(source => source.id === 'real-800').summary;
    const controlled = analyzed.filter(source => source.id !== 'real-800');
    const gates = {
        reproduction: analyzed.every(source => source.summary.reproductionMismatches === 0),
        realNetGain: real.admission.net >= 5 && real.admission.wins > real.admission.losses,
        controlledNoLoss: controlled.every(source => source.summary.admission.losses === 0),
        controlledNoNewForbidden: controlled.every(source => source.summary.forbidden.newlyAdmitted === 0),
        invariants: analyzed.every(source => source.summary.budgetViolations === 0),
    };
    const valid = gates.reproduction && gates.invariants;
    const passed = valid && Object.values(gates).every(Boolean);
    const experimentId = path.basename(outputDir);
    if (!/^H-PROMPT-screen-v\d+$/.test(experimentId)) {
        throw new Error(`H-PROMPT output 目录名必须是版本化 attempt id: ${experimentId}`);
    }
    const result = {
        schemaVersion: 1,
        experimentId,
        hypothesis: 'Two-pass event summary coverage then evidence backfill improves required event admission under the same budgets.',
        arm: 'pass 1 summary-only in frozen rank; pass 2 atomic DIRECT evidence backfill in the same rank',
        budgets: { event: EVENT_BUDGET_MAX, related: RELATED_EVENT_MAX },
        network: { modelApiCalls: 0 },
        gates,
        decision: {
            status: !valid ? 'invalid' : (passed ? 'screen-pass' : 'reject'),
            reason: !valid
                ? 'baseline reproduction 或预算不变量失败；禁止解释 arm。'
                : (passed
                    ? '全部预注册 Stage 1 闸门通过；只授权建立隔离 prompt-only candidate。'
                    : '至少一个预注册质量/非回归闸门失败；不得调参追结果。'),
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
    if (!args.study || !args.output) {
        throw new Error('用法: prompt-packing-screen.mjs --study=<STUDY.json> --output=<experiment-dir>');
    }
    const completed = await runPromptPackingScreen({
        studyPath: path.resolve(args.study),
        outputDir: path.resolve(args.output),
    });
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
