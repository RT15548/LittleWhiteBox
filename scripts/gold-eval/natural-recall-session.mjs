// Gold Eval - replay schema-v2 natural queries against immutable boundary
// snapshots from one valid chronological natural capture. This path never
// rebuilds history and never calls Summary or L0 extraction.

import fs from 'node:fs/promises';
import path from 'node:path';

import { emptyNaturalPreparation, executeNaturalBoundaryCase } from './lib/natural-boundary-execution.mjs';
import { aggregateMetrics } from './lib/metrics.mjs';
import { validateNaturalCaseV2, validateNaturalSourceBindings } from './lib/natural-cases.mjs';
import { buildRunId, renderGoldEvalReport } from './lib/report.mjs';
import {
    GOLD_CAPTURE_SCHEMA_VERSION,
    beginGoldRun,
    invalidateGoldRun,
    loadGoldCapture,
    sha256File,
} from './lib/run-store.mjs';
import { buildReplayConfigFingerprint, describeApi } from './replay-session.mjs';
import { createStrictTransportCassette } from './lib/transport-cassette.mjs';

const DEFAULT_CASE_INTERVAL_MIN_MS = 12000;
const DEFAULT_CASE_INTERVAL_MAX_MS = 15000;

function resolveFromRoot(rootDir, maybeRelativePath) {
    if (!maybeRelativePath) return '';
    return path.isAbsolute(maybeRelativePath) ? maybeRelativePath : path.resolve(rootDir, maybeRelativePath);
}

function toPosix(input) {
    return String(input || '').replace(/\\/g, '/');
}

function positiveInteger(value, label, fallback) {
    if (value == null) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} 必须是正整数`);
    return parsed;
}

function isInside(parent, child) {
    const relative = path.relative(path.resolve(parent), path.resolve(child));
    return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

function deterministicInterval({ sampleHash, floor, minMs, maxMs }) {
    if (minMs === maxMs) return minMs;
    const prefix = String(sampleHash || '').slice(0, 8);
    const seed = Number.parseInt(prefix, 16) ^ Number(floor || 0);
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

async function validateBoundaryReference(source, goldCase, rawRef) {
    if (!rawRef || rawRef.caseId !== goldCase.id) {
        throw new Error(`source capture 缺少 boundary snapshot: ${goldCase.id}`);
    }
    const snapshotPath = path.resolve(String(rawRef.path || ''));
    if (!isInside(source.paths.boundarySnapshots, snapshotPath)) {
        throw new Error(`boundary snapshot 越出 source run: ${goldCase.id}`);
    }
    const actualHash = await sha256File(snapshotPath);
    if (actualHash !== rawRef.sha256) throw new Error(`boundary snapshot hash 不匹配: ${goldCase.id}`);
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    if (snapshot?.kind !== 'natural-query-boundary'
        || snapshot?.boundary?.queryFloor !== goldCase.atFloor
        || snapshot?.boundary?.historyThroughFloor !== goldCase.historyThroughFloor
        || snapshot?.sample?.messageCount !== goldCase.atFloor) {
        throw new Error(`boundary snapshot 历史边界无效: ${goldCase.id}`);
    }
    return {
        caseId: goldCase.id,
        path: toPosix(snapshotPath),
        sha256: actualHash,
        queryFloor: goldCase.atFloor,
        historyThroughFloor: goldCase.historyThroughFloor,
        messageCount: snapshot.sample.messageCount,
    };
}

export async function prepareNaturalRecallPlan({ rootDir, config, sample, samplePath }) {
    const settings = config?.goldEval;
    if (!settings?.enabled) throw new Error('natural-recall 需要 goldEval.enabled=true');
    if (settings.reader?.enabled) throw new Error('natural-recall evidence-only 主轨禁止同时运行 reader');
    const captureRunDir = resolveFromRoot(rootDir, settings.captureRunDir);
    const runsRoot = resolveFromRoot(rootDir, settings.runsRoot);
    if (!captureRunDir) throw new Error('natural-recall 需要 goldEval.captureRunDir');
    if (!runsRoot) throw new Error('natural-recall 需要 goldEval.runsRoot');

    const source = await loadGoldCapture(captureRunDir);
    if (!['story-summary-replay-natural-capture', 'story-summary-replay-natural-resume'].includes(source.manifest.mode)) {
        throw new Error(`natural-recall source 类型无效: ${source.manifest.mode || 'unknown'}`);
    }
    if (!source.manifest.capture?.containsBoundarySnapshots
        || !Array.isArray(source.manifest.boundarySnapshots)) {
        throw new Error('natural-recall source 缺少 boundary snapshots');
    }
    if (!source.manifest.capture?.containsTransportCassette
        || source.manifest.capture?.transportMode !== 'live-production') {
        throw new Error('natural-recall source 必须是可复放的 product-aligned Natural capture');
    }
    const sampleHash = await sha256File(samplePath);
    if (source.manifest.data?.sampleHash !== sampleHash) {
        throw new Error('natural-recall sample 与 source capture 不一致');
    }

    const normalizedCases = source.cases.map((raw, index) => {
        const checked = validateNaturalCaseV2(raw, index + 1);
        if (!checked.ok) throw new Error(`source natural case 无效: ${checked.errors.join('; ')}`);
        return checked.case;
    });
    validateNaturalSourceBindings(normalizedCases, sample.messages);
    const refsByCase = new Map(source.manifest.boundarySnapshots.map(item => [item.caseId, item]));
    if (refsByCase.size !== normalizedCases.length) {
        throw new Error('natural-recall boundary snapshot 数量与case不一致');
    }
    const boundarySnapshots = [];
    for (const goldCase of normalizedCases) {
        boundarySnapshots.push(await validateBoundaryReference(source, goldCase, refsByCase.get(goldCase.id)));
    }
    for (const [index, goldCase] of normalizedCases.entries()) {
        createStrictTransportCassette(source.transportTrace[index]?.production, { caseId: goldCase.id });
    }

    const caseIntervalMinMs = positiveInteger(
        settings.caseIntervalMinMs ?? settings.turnIntervalMinMs,
        'goldEval.caseIntervalMinMs',
        DEFAULT_CASE_INTERVAL_MIN_MS,
    );
    const caseIntervalMaxMs = positiveInteger(
        settings.caseIntervalMaxMs ?? settings.turnIntervalMaxMs,
        'goldEval.caseIntervalMaxMs',
        DEFAULT_CASE_INTERVAL_MAX_MS,
    );
    if (caseIntervalMaxMs < caseIntervalMinMs) {
        throw new Error('natural-recall case interval 最大值不能小于最小值');
    }

    return {
        source,
        cases: source.cases,
        normalizedCases,
        boundarySnapshots,
        runsRoot,
        runName: String(settings.runName || 'natural-recall'),
        sampleHash,
        caseIntervalMinMs,
        caseIntervalMaxMs,
    };
}

export async function runNaturalRecallCases({
    modules,
    plan,
    sample,
    samplePath,
    config,
    restoreBoundarySnapshot,
    executeRecallCase,
    clock = () => Date.now(),
    wait = delayMs => new Promise(resolve => setTimeout(resolve, delayMs)),
}) {
    const runId = buildRunId(plan.runName);
    const manifest = {
        runId,
        generatedAt: new Date().toISOString(),
        mode: 'story-summary-replay-natural-recall',
        code: {
            commit: config?.__codeState?.commit || 'unknown',
            dirty: config?.__codeState?.dirty ?? true,
            bundleHash: config?.__codeState?.bundleHash || null,
            bundleBytes: config?.__codeState?.bundleBytes ?? null,
            runnerHash: config?.__codeState?.runnerHash || null,
            worktreeStatusHash: config?.__codeState?.worktreeStatusHash || null,
            packageLockHash: config?.__codeState?.packageLockHash || null,
            nodeVersion: config?.__codeState?.nodeVersion || null,
            platform: config?.__codeState?.platform || null,
            arch: config?.__codeState?.arch || null,
        },
        data: {
            samplePath: toPosix(samplePath),
            sampleHash: plan.sampleHash,
            messageCount: sample.messages.length,
            selectedCases: plan.cases.length,
        },
        sourceCapture: {
            runId: plan.source.manifest.runId,
            runDir: plan.source.runDir,
            manifestHash: await sha256File(plan.source.paths.manifest),
            boundarySnapshotsHash: plan.source.manifest.artifactHashes?.boundarySnapshots || null,
        },
        config: {
            fingerprint: buildReplayConfigFingerprint(config),
            historyPolicy: 'restore source boundary q at floors 0..q-1; push the real USER object q into in-memory chat only for recall',
            casePacing: {
                minMs: plan.caseIntervalMinMs,
                maxMs: plan.caseIntervalMaxMs,
                strategy: 'deterministic query start cadence',
            },
        },
        apis: {
            summary: null,
            l0: null,
            embedding: describeApi(config.vectorConfig?.embeddingApi),
            rerank: describeApi(config.vectorConfig?.rerankApi),
            reader: null,
        },
        reader: { enabled: false },
        capture: {
            schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
            containsFullPrompts: true,
            containsPromptInputs: true,
            containsTransportTrace: true,
            containsTransportCassette: true,
            containsBoundarySnapshots: false,
            consumesBoundarySnapshots: true,
            transportMode: 'paired-core-cassette-live-enrichment',
            sensitive: true,
            deletion: 'delete run directory',
        },
        execution: { command: config?.__command || 'unknown' },
    };
    const runStore = await beginGoldRun({
        runsRoot: plan.runsRoot,
        runId,
        manifest,
        cases: plan.cases,
        bundlePath: config?.__codeState?.bundlePath || null,
        codeArtifacts: config?.__codeState?.codeArtifacts || [],
    });

    const prompts = [];
    const promptInputs = [];
    const transportTrace = [];
    const stageTraces = [];
    const metricRows = [];
    const failures = [];
    const replayCases = [];
    let previousStartedAt = null;
    let activeIndex = 0;
    let activeCase = plan.normalizedCases[0] || null;
    let activeExecution = null;

    try {
        for (let index = 0; index < plan.normalizedCases.length; index++) {
            activeIndex = index;
            activeCase = plan.normalizedCases[index];
            activeExecution = null;
            const intervalMs = deterministicInterval({
                sampleHash: plan.sampleHash,
                floor: activeCase.atFloor,
                minMs: plan.caseIntervalMinMs,
                maxMs: plan.caseIntervalMaxMs,
            });
            await waitForCadence({ previousStartedAt, intervalMs, clock, wait });
            previousStartedAt = clock();

            const visibleMessages = sample.messages.slice(0, activeCase.atFloor);
            const snapshotRef = plan.boundarySnapshots[index];
            const snapshot = JSON.parse(await fs.readFile(snapshotRef.path, 'utf8'));
            await restoreBoundarySnapshot({ snapshot, snapshotRef, goldCase: activeCase, visibleMessages });
            const transportCassette = createStrictTransportCassette(
                plan.source.transportTrace[index]?.production,
                { caseId: activeCase.id },
            );
            const expectedCorePrompt = plan.source.prompts[index];

            let boundary;
            try {
                boundary = await executeNaturalBoundaryCase({
                    modules,
                    goldCase: activeCase,
                    visibleMessages,
                    focusMessage: sample.messages[activeCase.atFloor],
                    snapshotRef,
                    preparation: emptyNaturalPreparation(),
                    executeRecallCase,
                    transportCassette,
                    expectedCorePrompt,
                });
            } catch (error) {
                activeExecution = error?.naturalExecution || null;
                throw error;
            }
            activeExecution = boundary.execution;
            await runStore.commitCase({
                index,
                caseId: activeCase.id,
                capture: boundary.capture,
                productionExternalCalls: boundary.productionExternalCalls,
                productionTransportRequests: boundary.productionTransportRequests,
                readerExternalCalls: 0,
            });
            prompts.push(boundary.promptRow);
            promptInputs.push(boundary.promptInputRow);
            transportTrace.push(boundary.transportRow);
            stageTraces.push(boundary.scored.stageTraceRow);
            metricRows.push(boundary.scored.metricRow);
            if (boundary.scored.failureRow) failures.push(boundary.scored.failureRow);
            replayCases.push(boundary.replayCase);
        }

        const aggregated = aggregateMetrics(metricRows);
        const reportMarkdown = renderGoldEvalReport({
            manifest: { ...runStore.manifest, status: 'valid' },
            aggregated,
            failures,
            stageTraces,
            limitations: [
                '每题只恢复同一valid natural-capture冻结的boundary snapshot；不重建历史。',
                'Summary、L0与历史Embedding调用为零；core recall 严格复放 source cassette，只有 enrichment 使用真实网络。',
                '每题 candidate core Prompt 必须与 source baseline Prompt 逐字一致，否则整轮立即作废。',
                'query floor不进入Summary、L0/L1或boundary snapshot；召回时将真实USER对象临时push进内存chat。',
                '只允许同请求、有限次数且最终成功的retryable transient；未恢复Embedding/Rerank失败或fallback立即作废。',
            ],
        });
        await runStore.complete({
            manifestPatch: { consumedBoundarySnapshots: plan.boundarySnapshots },
            prompts,
            promptInputs,
            transportTrace,
            stageTraces,
            metrics: aggregated,
            failures,
            reportMarkdown,
        });
        return {
            replayCases,
            aggregated,
            artifacts: runStore.artifacts(),
            manifest: runStore.manifest,
        };
    } catch (error) {
        const failure = {
            ...(error?.goldFailure || {}),
            caseId: error?.goldFailure?.caseId || activeCase?.id || null,
            message: String(error?.message || error),
        };
        const failedCase = activeCase ? {
            index: activeIndex,
            caseId: activeCase.id,
            capture: {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: activeCase.id,
                failure,
                transport: activeExecution?.transportTrace || error?.externalTrace || [],
                reportCase: activeExecution?.reportCase || null,
            },
            productionExternalCalls: Number.isInteger(activeExecution?.externalCalls) ? activeExecution.externalCalls : 0,
            productionTransportRequests: Number.isInteger(activeExecution?.externalRequests)
                ? activeExecution.externalRequests
                : (activeExecution?.transportTrace || error?.externalTrace || []).length,
        } : null;
        const lifecycleErrors = await invalidateGoldRun({ runStore, failure, failedCase });
        if (lifecycleErrors.checkpointError) error.goldCheckpointError = lifecycleErrors.checkpointError;
        if (lifecycleErrors.invalidationError) error.goldInvalidationError = lifecycleErrors.invalidationError;
        error.goldRunDir = runStore.runDir;
        throw error;
    }
}
