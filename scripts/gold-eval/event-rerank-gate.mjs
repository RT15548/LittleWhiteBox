// Mechanism gate for the production L2 event reranker.
// Reuses frozen recall output and per-query boundary snapshots; only the new
// event-rerank requests are live.

import fs from 'node:fs/promises';
import path from 'node:path';

import {
    loadGoldCapture,
    sha256File,
} from './lib/run-store.mjs';
import { assertSuccessfulExternalTrace } from './lib/transport-cassette.mjs';

const DEFAULT_INTERVAL_MIN_MS = 12000;
const DEFAULT_INTERVAL_MAX_MS = 15000;
const EVENT_RERANK_CANDIDATE_MAX = 60;
const RERANK_BATCH_SIZE = 20;

function resolveFromRoot(rootDir, value) {
    if (!value) return '';
    return path.isAbsolute(value) ? value : path.resolve(rootDir, value);
}

function positiveInteger(value, label, fallback) {
    if (value == null) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} 必须是正整数`);
    return parsed;
}

function deterministicInterval(sampleHash, floor, minMs, maxMs) {
    if (minMs === maxMs) return minMs;
    const seed = Number.parseInt(String(sampleHash || '').slice(0, 8), 16) ^ Number(floor || 0);
    return minMs + ((seed >>> 0) % (maxMs - minMs + 1));
}

async function waitForCadence({ previousStartedAt, intervalMs, clock, wait }) {
    if (previousStartedAt == null) return;
    let remaining = intervalMs - (clock() - previousStartedAt);
    while (remaining > 0) {
        await wait(remaining);
        remaining = intervalMs - (clock() - previousStartedAt);
    }
}

function eventIds(items = []) {
    return items.map(item => String(item?.event?.id || '')).filter(Boolean);
}

function assertSameEventMembership(before, after, caseId) {
    const left = [...eventIds(before)].sort();
    const right = [...eventIds(after)].sort();
    if (left.length !== right.length || left.some((id, index) => id !== right[index])) {
        throw new Error(`事件 Rerank 改变了候选集合: ${caseId}`);
    }
    if (new Set(right).size !== right.length) {
        throw new Error(`事件 Rerank 产生重复候选: ${caseId}`);
    }
}

function targetEventIds(sourcePrompt, goldCase) {
    const required = new Set((goldCase?.evidence?.requiredAll || []).map(Number));
    if (!required.size) throw new Error(`机制门 case 缺少 requiredAll: ${goldCase?.id || 'unknown'}`);
    const byFloor = new Map([...required].map(floor => [floor, new Set()]));
    for (const item of (sourcePrompt?.evidenceTrace?.final || [])) {
        const floor = Number(item?.floor);
        const unitId = String(item?.unitId || '');
        if (!byFloor.has(floor) || !unitId.startsWith('event:')) continue;
        byFloor.get(floor).add(unitId.slice('event:'.length));
    }
    for (const [floor, ids] of byFloor) {
        if (!ids.size) throw new Error(`requiredAll 楼层没有对应 L2 事件: case=${goldCase.id} floor=${floor}`);
    }
    return [...new Set([...byFloor.values()].flatMap(ids => [...ids]))];
}

function promptEventIds(evidenceTrace) {
    return new Set((evidenceTrace?.prompt || [])
        .map(item => String(item?.unitId || ''))
        .filter(id => id.startsWith('event:'))
        .map(id => id.slice('event:'.length)));
}

async function validateBoundarySnapshot(promptInput, goldCase) {
    const ref = promptInput?.boundarySnapshot;
    if (!ref?.path || ref.caseId !== goldCase.id) {
        throw new Error(`缺少逐题 boundary snapshot: ${goldCase.id}`);
    }
    const snapshotPath = path.resolve(String(ref.path));
    const actualHash = await sha256File(snapshotPath);
    if (actualHash !== ref.sha256) throw new Error(`boundary snapshot hash 不匹配: ${goldCase.id}`);
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    if (snapshot?.kind !== 'natural-query-boundary'
        || Number(snapshot?.boundary?.queryFloor) !== Number(goldCase.atFloor)
        || Number(snapshot?.boundary?.historyThroughFloor) !== Number(goldCase.historyThroughFloor)) {
        throw new Error(`boundary snapshot 历史边界无效: ${goldCase.id}`);
    }
    return { snapshot, snapshotPath, snapshotHash: actualHash };
}

export async function prepareEventRerankGate({ rootDir, config, samplePath }) {
    const settings = config?.goldEval || {};
    const captureRunDir = resolveFromRoot(rootDir, settings.captureRunDir);
    if (!captureRunDir) throw new Error('event-rerank-gate 需要 goldEval.captureRunDir');
    const source = await loadGoldCapture(captureRunDir);
    if (source.manifest.mode !== 'story-summary-replay-natural-recall') {
        throw new Error(`event-rerank-gate source 类型无效: ${source.manifest.mode || 'unknown'}`);
    }
    const sampleHash = await sha256File(samplePath);
    if (sampleHash !== source.manifest.data?.sampleHash) {
        throw new Error('event-rerank-gate sample 与 source capture 不一致');
    }
    const selectedIds = new Set((settings.caseIds || []).map(String).filter(Boolean));
    if (!selectedIds.size) throw new Error('event-rerank-gate 必须显式指定 goldEval.caseIds');
    const selected = [];
    for (const [index, goldCase] of source.cases.entries()) {
        if (!selectedIds.has(String(goldCase.id))) continue;
        selected.push({
            index,
            goldCase,
            sourcePrompt: source.prompts[index],
            promptInput: source.promptInputs[index],
        });
    }
    const foundIds = new Set(selected.map(item => String(item.goldCase.id)));
    const missing = [...selectedIds].filter(id => !foundIds.has(id));
    if (missing.length) throw new Error(`event-rerank-gate case 不存在: ${missing.join(', ')}`);

    const intervalMinMs = positiveInteger(
        settings.caseIntervalMinMs,
        'goldEval.caseIntervalMinMs',
        DEFAULT_INTERVAL_MIN_MS,
    );
    const intervalMaxMs = positiveInteger(
        settings.caseIntervalMaxMs,
        'goldEval.caseIntervalMaxMs',
        DEFAULT_INTERVAL_MAX_MS,
    );
    if (intervalMaxMs < intervalMinMs) {
        throw new Error('goldEval.caseIntervalMaxMs 不能小于 caseIntervalMinMs');
    }
    return { source, selected, sampleHash, intervalMinMs, intervalMaxMs };
}

export async function runEventRerankGate({
    plan,
    executeCase,
    clock = () => Date.now(),
    wait = delayMs => new Promise(resolve => setTimeout(resolve, delayMs)),
}) {
    const rows = [];
    let previousStartedAt = null;
    for (const item of plan.selected) {
        const { goldCase, promptInput, sourcePrompt } = item;
        const intervalMs = deterministicInterval(
            plan.sampleHash,
            goldCase.atFloor,
            plan.intervalMinMs,
            plan.intervalMaxMs,
        );
        await waitForCadence({ previousStartedAt, intervalMs, clock, wait });
        previousStartedAt = clock();

        const boundary = await validateBoundarySnapshot(promptInput, goldCase);
        const targets = targetEventIds(sourcePrompt, goldCase);
        const result = await executeCase({ ...item, ...boundary });
        if (result.rerank?.status !== 'applied') {
            throw new Error(`事件 Rerank 未成功应用: case=${goldCase.id} status=${result.rerank?.status || 'unknown'}`);
        }
        assertSameEventMembership(result.beforeEvents, result.afterEvents, goldCase.id);
        assertSuccessfulExternalTrace(result.transportTrace, {
            caseId: goldCase.id,
            stage: 'event-rerank',
            allowEmpty: false,
        });

        const eligibleCount = result.beforeEvents.filter(item => item?.event?.id && item?.event?.summary).length;
        const expectedBatches = Math.ceil(Math.min(eligibleCount, EVENT_RERANK_CANDIDATE_MAX) / RERANK_BATCH_SIZE);
        const requests = result.transportTrace || [];
        if (result.rerank.diagnostics?.totalBatches !== expectedBatches
            || result.rerank.diagnostics?.failedBatches !== 0
            || requests.length !== expectedBatches
            || requests.some(request => request.endpoint !== 'rerank')) {
            throw new Error(`事件 Rerank 批次契约失败: case=${goldCase.id}`);
        }

        const included = promptEventIds(result.evidenceTrace);
        const targetRows = targets.map(eventId => {
            const beforeIndex = result.beforeEvents.findIndex(item => item?.event?.id === eventId);
            const afterIndex = result.afterEvents.findIndex(item => item?.event?.id === eventId);
            const after = result.afterEvents[afterIndex];
            return {
                eventId,
                beforeRank: beforeIndex >= 0 ? beforeIndex + 1 : null,
                rerankRank: afterIndex >= 0 ? afterIndex + 1 : null,
                rerankScore: Number.isFinite(after?._eventRerankScore) ? after._eventRerankScore : null,
                inPrompt: included.has(eventId),
            };
        });
        if (targetRows.some(target => !target.inPrompt)) {
            throw new Error(`目标 L2 事件仍未进入 Prompt: case=${goldCase.id}`);
        }
        rows.push({
            caseId: goldCase.id,
            queryFloor: goldCase.atFloor,
            intervalMs,
            sourceCandidates: result.beforeEvents.length,
            rerankCandidates: result.rerank.candidateCount,
            rerankBatches: expectedBatches,
            externalCalls: requests.length,
            promptChars: result.promptText.length,
            targets: targetRows,
        });
    }
    return {
        status: 'passed',
        sourceRunId: plan.source.manifest.runId,
        cases: rows,
        totals: {
            cases: rows.length,
            externalCalls: rows.reduce((sum, row) => sum + row.externalCalls, 0),
            targets: rows.reduce((sum, row) => sum + row.targets.length, 0),
            targetsInPrompt: rows.reduce(
                (sum, row) => sum + row.targets.filter(target => target.inPrompt).length,
                0,
            ),
        },
    };
}
