// Gold Eval - chronological capture for schema-v2 verbatim user queries.
// The conversation is replayed once. At query floor q the plugin can see only
// floors 0..q-1 own persistent history; the real q USER object is pushed only
// into the in-memory chat during recall, exactly like the product send path.

import fs from 'node:fs/promises';
import path from 'node:path';

import { aggregateMetrics } from './lib/metrics.mjs';
import {
    parseNaturalCasesJsonl,
    selectAgedNaturalCases,
    validateNaturalSourceBindings,
} from './lib/natural-cases.mjs';
import { emptyNaturalPreparation, executeNaturalBoundaryCase } from './lib/natural-boundary-execution.mjs';
import {
    assertNaturalPreparationHealthy,
    mergeNaturalPreparation,
} from './lib/natural-preparation.mjs';
import { persistNaturalRecoveryPoint } from './lib/natural-recovery.mjs';
import { buildRunId, renderGoldEvalReport } from './lib/report.mjs';
import {
    GOLD_CAPTURE_SCHEMA_VERSION,
    beginGoldRun,
    invalidateGoldRun,
    sha256File,
    sha256Text,
} from './lib/run-store.mjs';
import {
    buildReplayConfigFingerprint,
    describeApi,
} from './replay-session.mjs';

const DEFAULT_MIN_EVIDENCE_DISTANCE_FLOORS = 20;
const DEFAULT_TURN_INTERVAL_MIN_MS = 12000;
const DEFAULT_TURN_INTERVAL_MAX_MS = 15000;

function resolveFromRoot(rootDir, maybeRelativePath) {
    if (!maybeRelativePath) return '';
    return path.isAbsolute(maybeRelativePath) ? maybeRelativePath : path.resolve(rootDir, maybeRelativePath);
}

function toPosix(input) {
    return String(input || '').replace(/\\/g, '/');
}

function validatePositiveInteger(value, label, fallback) {
    if (value == null) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${label} 必须是正整数`);
    return parsed;
}

export async function prepareNaturalCapturePlan({ rootDir, config, sample }) {
    const settings = config?.goldEval;
    if (!settings?.enabled) throw new Error('natural-capture 需要 goldEval.enabled=true');
    if (settings.reader?.enabled) throw new Error('natural-capture 的 evidence-only 主轨禁止同时运行 reader');

    const casesPath = resolveFromRoot(rootDir, settings.casesPath);
    const runsRoot = resolveFromRoot(rootDir, settings.runsRoot);
    if (!casesPath) throw new Error('natural-capture 需要 goldEval.casesPath');
    if (!runsRoot) throw new Error('natural-capture 需要 goldEval.runsRoot');

    const casesText = await fs.readFile(casesPath, 'utf8');
    const parsed = parseNaturalCasesJsonl(casesText);
    if (parsed.errors.length) throw new Error(`Natural cases 无效:\n${parsed.errors.join('\n')}`);
    validateNaturalSourceBindings(parsed.cases, sample.messages);

    const split = String(settings.split || 'dev');
    if (split === 'holdout') throw new Error('natural-capture 禁止消费 sealed holdout');
    const minEvidenceDistanceFloors = validatePositiveInteger(
        settings.minEvidenceDistanceFloors,
        'goldEval.minEvidenceDistanceFloors',
        DEFAULT_MIN_EVIDENCE_DISTANCE_FLOORS,
    );
    const requestedIds = Array.isArray(settings.caseIds) ? settings.caseIds.map(String) : [];
    const selected = selectAgedNaturalCases(parsed.cases, {
        split,
        minDistanceFloors: minEvidenceDistanceFloors,
        ids: requestedIds,
    });
    const limit = settings.limit == null ? null : validatePositiveInteger(settings.limit, 'goldEval.limit', null);
    const cases = limit == null ? selected : selected.slice(0, limit);
    if (!cases.length) throw new Error('natural-capture 没有符合长期记忆距离的 accepted cases');
    if (requestedIds.length) {
        const selectedIds = new Set(cases.map(item => item.id));
        const missing = requestedIds.filter(id => !selectedIds.has(id));
        if (missing.length) throw new Error(`指定 case 不属于当前 aged natural 范围: ${missing.join(', ')}`);
    }
    const floorSet = new Set();
    for (const item of cases) {
        if (floorSet.has(item.atFloor)) throw new Error(`同一 query floor 重复 natural case: ${item.atFloor}`);
        floorSet.add(item.atFloor);
    }

    const turnIntervalMinMs = validatePositiveInteger(
        settings.turnIntervalMinMs ?? settings.caseIntervalMinMs,
        'goldEval.turnIntervalMinMs',
        DEFAULT_TURN_INTERVAL_MIN_MS,
    );
    const turnIntervalMaxMs = validatePositiveInteger(
        settings.turnIntervalMaxMs ?? settings.caseIntervalMaxMs,
        'goldEval.turnIntervalMaxMs',
        DEFAULT_TURN_INTERVAL_MAX_MS,
    );
    if (turnIntervalMaxMs < turnIntervalMinMs) throw new Error('natural-capture turn interval 最大值不能小于最小值');

    return {
        cases,
        casesPath,
        casesHash: sha256Text(casesText),
        runsRoot,
        runName: String(settings.runName || 'natural-capture'),
        minEvidenceDistanceFloors,
        turnIntervalMinMs,
        turnIntervalMaxMs,
    };
}

function deterministicInterval({ sampleHash, floor, minMs, maxMs }) {
    if (minMs === maxMs) return minMs;
    const value = Number.parseInt(sha256Text(`${sampleHash}:${floor}`).slice(0, 8), 16);
    return minMs + (value % (maxMs - minMs + 1));
}

async function waitForStartCadence({ previousStartedAt, intervalMs, clock, wait }) {
    if (previousStartedAt == null) return;
    let remaining = intervalMs - (clock() - previousStartedAt);
    while (remaining > 0) {
        await wait(remaining);
        remaining = intervalMs - (clock() - previousStartedAt);
    }
}

async function verifyBoundarySnapshot(snapshotPath, goldCase) {
    const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
    if (snapshot?.kind !== 'natural-query-boundary') throw new Error(`boundary snapshot 类型无效: ${goldCase.id}`);
    if (snapshot?.boundary?.queryFloor !== goldCase.atFloor
        || snapshot?.boundary?.historyThroughFloor !== goldCase.historyThroughFloor) {
        throw new Error(`boundary snapshot 楼层不匹配: ${goldCase.id}`);
    }
    if (snapshot?.sample?.messageCount !== goldCase.atFloor) {
        throw new Error(`boundary snapshot 泄漏 query 或缺少历史: ${goldCase.id}`);
    }
    return {
        path: toPosix(snapshotPath),
        sha256: await sha256File(snapshotPath),
        queryFloor: goldCase.atFloor,
        historyThroughFloor: goldCase.historyThroughFloor,
        messageCount: snapshot.sample.messageCount,
    };
}

export async function runNaturalCaptureCases({
    modules,
    plan,
    sample,
    samplePath,
    config,
    setVisibleHistory,
    summarizeBeforeUser,
    maintainAfterAi,
    assertHistoryHealthy,
    writeBoundarySnapshot,
    writeRecoverySnapshot,
    executeRecallCase,
    clock = () => Date.now(),
    wait = delayMs => new Promise(resolve => setTimeout(resolve, delayMs)),
}) {
    if (typeof assertHistoryHealthy !== 'function' || typeof writeRecoverySnapshot !== 'function') {
        throw new Error('natural-capture 缺少 history health/recovery adapter');
    }
    const runId = buildRunId(plan.runName);
    const sampleHash = await sha256File(samplePath);
    const manifest = {
        runId,
        generatedAt: new Date().toISOString(),
        mode: 'story-summary-replay-natural-capture',
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
            sampleHash,
            messageCount: sample.messages.length,
            casesPath: toPosix(plan.casesPath),
            casesHash: plan.casesHash,
            selectedCases: plan.cases.length,
        },
        config: {
            fingerprint: buildReplayConfigFingerprint(config),
            historyPolicy: 'persist floors 0..q-1; push the real USER object q into in-memory chat only for recall',
            minEvidenceDistanceFloors: plan.minEvidenceDistanceFloors,
            turnPacing: {
                minMs: plan.turnIntervalMinMs,
                maxMs: plan.turnIntervalMaxMs,
                strategy: 'deterministic user-turn start cadence from sample hash and floor',
            },
        },
        apis: {
            summary: describeApi(config.summaryApi),
            l0: describeApi(config.vectorConfig?.l0Api),
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
            containsBoundarySnapshots: true,
            containsRecoveryPoints: true,
            transportMode: 'live-production',
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
    await Promise.all([
        fs.mkdir(runStore.paths.boundarySnapshots, { recursive: false }),
        fs.mkdir(runStore.paths.recovery, { recursive: false }),
    ]);

    const caseByFloor = new Map(plan.cases.map((item, index) => [item.atFloor, { item, index }]));
    const maxQueryFloor = Math.max(...plan.cases.map(item => item.atFloor));
    const prompts = [];
    const promptInputs = [];
    const transportTrace = [];
    const stageTraces = [];
    const metricRows = [];
    const failures = [];
    const replayCases = [];
    const boundarySnapshots = [];
    const recoveryPoints = [];
    let preparation = emptyNaturalPreparation();
    let previousUserTurnStartedAt = null;
    let activeCase = plan.cases[0];
    let activeIndex = 0;
    let activeExecution = null;

    const nextCaseFromFloor = floor => {
        const nextIndex = plan.cases.findIndex(item => item.atFloor >= floor);
        return nextIndex >= 0 ? { item: plan.cases[nextIndex], index: nextIndex } : null;
    };

    try {
        for (let floor = 0; floor <= maxQueryFloor; floor++) {
            const message = sample.messages[floor];
            if (!message) throw new Error(`样本缺少 floor ${floor}`);
            const pending = nextCaseFromFloor(floor);
            if (pending) {
                activeCase = pending.item;
                activeIndex = pending.index;
            }

            if (message.is_user) {
                const intervalMs = deterministicInterval({
                    sampleHash,
                    floor,
                    minMs: plan.turnIntervalMinMs,
                    maxMs: plan.turnIntervalMaxMs,
                });
                await waitForStartCadence({
                    previousStartedAt: previousUserTurnStartedAt,
                    intervalMs,
                    clock,
                    wait,
                });
                previousUserTurnStartedAt = clock();

                const visibleMessages = sample.messages.slice(0, floor);
                await setVisibleHistory(visibleMessages, floor - 1);
                const summaryStep = await summarizeBeforeUser({
                    floor,
                    historyThroughFloor: floor - 1,
                    visibleMessages,
                    nextCaseId: activeCase?.id || null,
                });
                mergeNaturalPreparation(
                    preparation,
                    summaryStep,
                    `summary-before-user:${floor}`,
                );

                const selected = caseByFloor.get(floor);
                if (selected) {
                    activeCase = selected.item;
                    activeIndex = selected.index;
                    activeExecution = null;
                    assertNaturalPreparationHealthy(preparation, {
                        caseId: activeCase.id,
                        stage: `preparation-before-query:${floor}`,
                    });
                    mergeNaturalPreparation(
                        preparation,
                        await assertHistoryHealthy({
                            floor,
                            visibleMessages,
                            nextCaseId: activeCase.id,
                        }),
                        `history-health-before-query:${floor}`,
                    );
                }

                if (summaryStep?.result?.triggered) {
                    const recoveryPoint = await persistNaturalRecoveryPoint({
                        runStore,
                        floor,
                        visibleMessages,
                        preparation,
                        writeRecoverySnapshot,
                    });
                    recoveryPoints.push(recoveryPoint);
                    if (recoveryPoints.length > 2) recoveryPoints.shift();
                }

                if (selected) {
                    const snapshotPath = path.join(
                        runStore.paths.boundarySnapshots,
                        `${String(floor).padStart(5, '0')}-${activeCase.id.replace(/[^\w-]+/g, '-')}.json`,
                    );
                    await writeBoundarySnapshot({
                        snapshotPath,
                        goldCase: activeCase,
                        visibleMessages,
                    });
                    const snapshotRef = await verifyBoundarySnapshot(snapshotPath, activeCase);
                    boundarySnapshots.push({ caseId: activeCase.id, ...snapshotRef });

                    let boundary;
                    try {
                        boundary = await executeNaturalBoundaryCase({
                            modules,
                            goldCase: activeCase,
                            visibleMessages,
                            focusMessage: message,
                            snapshotRef,
                            preparation,
                            executeRecallCase,
                        });
                    } catch (error) {
                        activeExecution = error?.naturalExecution || null;
                        throw error;
                    }
                    activeExecution = boundary.execution;
                    await runStore.commitCase({
                        index: activeIndex,
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
                    preparation = emptyNaturalPreparation();
                    // A later preparation failure belongs to the next pending case,
                    // never to the recall execution that was already committed here.
                    activeExecution = null;
                }

                if (floor < maxQueryFloor) {
                    await setVisibleHistory(sample.messages.slice(0, floor + 1), floor);
                }
            } else {
                const visibleMessages = sample.messages.slice(0, floor + 1);
                await setVisibleHistory(visibleMessages, floor);
                mergeNaturalPreparation(
                    preparation,
                    await maintainAfterAi({
                        floor,
                        visibleMessages,
                        nextCaseId: activeCase?.id || null,
                    }),
                    `maintenance-after-ai:${floor}`,
                );
            }
        }

        const aggregated = aggregateMetrics(metricRows);
        const reportMarkdown = renderGoldEvalReport({
            manifest: { ...runStore.manifest, status: 'valid' },
            aggregated,
            failures,
            stageTraces,
            limitations: [
                '主轨只使用真实用户逐字原话；query floor不进入持久历史、Summary或L0/L1，但召回时以原始USER对象临时进入内存chat。',
                `只运行与最新可接受证据相距至少 ${plan.minEvidenceDistanceFloors} 楼的 aged-memory cases。`,
                '一次按时间顺序回放整段聊天；每个查询边界保存不可变 snapshot，后续候选必须复用同一边界状态。',
                '本轨 expectedAnswer=evidence-only，只判断必要记忆是否进入实际 Prompt，不运行 reader。',
                'L0 fail按生产行为留到后续AI回合自然重试；到真实query boundary仍未恢复才作废。',
                '每次成功Summary后保存临时operational recovery；只保留最近两份，删除run目录即完整删除。',
                '同请求最终成功的retryable transient会完整记录；任何query边界未恢复失败或fallback立即作废。',
            ],
        });
        await runStore.complete({
            manifestPatch: { boundarySnapshots, recoveryPoints },
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
            boundarySnapshots,
            recoveryPoints,
        };
    } catch (error) {
        const failure = {
            ...(error?.goldFailure || {}),
            caseId: error?.goldFailure?.caseId || activeCase?.id || null,
            message: String(error?.message || error),
        };
        const failureTrace = activeExecution?.transportTrace || error?.externalTrace || [];
        const failureCalls = Number.isInteger(activeExecution?.externalCalls)
            ? activeExecution.externalCalls
            : (Number.isInteger(error?.externalCalls) ? error.externalCalls : failureTrace.length);
        const failureRequests = Number.isInteger(activeExecution?.externalRequests)
            ? activeExecution.externalRequests
            : (Number.isInteger(error?.externalRequests) ? error.externalRequests : failureTrace.length);
        const failedCase = activeCase
            ? {
                index: activeIndex,
                caseId: activeCase.id,
                capture: {
                    schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                    caseId: activeCase.id,
                    failure,
                    preparation,
                    transport: failureTrace,
                    reportCase: activeExecution?.reportCase || null,
                },
                productionExternalCalls: preparation.externalCalls + failureCalls,
                productionTransportRequests: preparation.externalRequests + failureRequests,
            }
            : null;
        const lifecycleErrors = await invalidateGoldRun({ runStore, failure, failedCase });
        if (lifecycleErrors.checkpointError) error.goldCheckpointError = lifecycleErrors.checkpointError;
        if (lifecycleErrors.invalidationError) error.goldInvalidationError = lifecycleErrors.invalidationError;
        error.goldRunDir = runStore.runDir;
        throw error;
    }
}
