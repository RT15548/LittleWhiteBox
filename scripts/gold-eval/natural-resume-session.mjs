// Gold Eval - resume an invalid chronological natural capture from its last
// atomically committed query boundary. The abandoned suffix is never reused.

import fs from 'node:fs/promises';
import path from 'node:path';

import { emptyNaturalPreparation, executeNaturalBoundaryCase } from './lib/natural-boundary-execution.mjs';
import {
    assertNaturalPreparationHealthy,
    mergeNaturalPreparation,
    validateRecoverableNaturalPreparation,
} from './lib/natural-preparation.mjs';
import {
    importNaturalRecoveryPoint,
    persistNaturalRecoveryPoint,
} from './lib/natural-recovery.mjs';
import { aggregateMetrics, computeCaseRecallMetrics } from './lib/metrics.mjs';
import { validateNaturalCaseV2, validateNaturalSourceBindings } from './lib/natural-cases.mjs';
import { buildRunId, renderGoldEvalReport } from './lib/report.mjs';
import {
    GOLD_CAPTURE_SCHEMA_VERSION,
    beginGoldRun,
    invalidateGoldRun,
    loadNaturalCaptureResumePrefix,
    sha256File,
    sha256Text,
} from './lib/run-store.mjs';
import { buildReplayConfigFingerprint, describeApi } from './replay-session.mjs';

const DEFAULT_TURN_INTERVAL_MIN_MS = 12000;
const DEFAULT_TURN_INTERVAL_MAX_MS = 15000;

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

function nonNegativeInteger(value, label, fallback = 0) {
    if (value == null) return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) throw new Error(`${label} 必须是非负整数`);
    return parsed;
}

function sameApi(left, right) {
    return JSON.stringify(left || null) === JSON.stringify(right || null);
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

function metricRowFromCapture(goldCase, capture) {
    const stageTrace = capture.stageTrace;
    const ranking = [...(stageTrace.ranked || [])];
    const seenRequired = new Set(ranking.map(item => `${item.floor}:${item.rank}:${item.unitId || ''}`));
    for (const item of stageTrace.requiredFinalRanking || []) {
        if (!Number.isInteger(item?.floor) || !Number.isInteger(item?.rank)) continue;
        const key = `${item.floor}:${item.rank}:${item.unitId || ''}`;
        if (!seenRequired.has(key)) ranking.push(item);
    }
    const evidence = goldCase.evidence || {};
    return {
        case: goldCase,
        metrics: computeCaseRecallMetrics({
            requiredAll: evidence.requiredAll || [],
            requiredAny: evidence.requiredAny || [],
            requiredAnyGroups: evidence.requiredAnyGroups || [],
            supporting: evidence.supporting || [],
            forbidden: evidence.forbiddenAsCurrent || [],
            ranked: ranking,
            inPromptFloors: stageTrace.promptFloors || [],
        }),
        answer: stageTrace.answer || { status: 'not-run', correct: null },
        answerSurfaceInPrompt: stageTrace.answerSurfaceInPrompt || { applicable: false, matched: null },
        oldFact: { applicable: false, mentioned: null, values: [] },
        earliestFailure: capture.failure?.earliestFailure || null,
        efficiency: stageTrace.efficiency || {},
    };
}

async function copyPrefixCapture({ runStore, prefixItem }) {
    const sourceName = path.basename(prefixItem.snapshotPath);
    const destination = path.join(runStore.paths.boundarySnapshots, sourceName);
    await fs.copyFile(prefixItem.snapshotPath, destination);
    const copiedHash = await sha256File(destination);
    if (copiedHash !== prefixItem.snapshotHash) {
        throw new Error(`natural resume copied boundary hash不匹配: ${prefixItem.goldCase.id}`);
    }
    const snapshotRef = {
        caseId: prefixItem.goldCase.id,
        path: toPosix(destination),
        sha256: copiedHash,
        queryFloor: prefixItem.goldCase.query.floor,
        historyThroughFloor: prefixItem.goldCase.historyThroughFloor,
        messageCount: prefixItem.goldCase.query.floor,
    };
    const capture = structuredClone(prefixItem.capture);
    capture.boundarySnapshot = snapshotRef;
    capture.promptInput.boundarySnapshot = snapshotRef;
    return { capture, snapshotRef };
}

export async function prepareNaturalResumePlan({ rootDir, config, sample, samplePath }) {
    const settings = config?.goldEval;
    if (!settings?.enabled) throw new Error('natural-resume 需要 goldEval.enabled=true');
    if (settings.reader?.enabled) throw new Error('natural-resume evidence-only主轨禁止同时运行reader');
    const sourceRunDir = resolveFromRoot(rootDir, settings.captureRunDir);
    const runsRoot = resolveFromRoot(rootDir, settings.runsRoot);
    if (!sourceRunDir) throw new Error('natural-resume 需要 goldEval.captureRunDir');
    if (!runsRoot) throw new Error('natural-resume 需要 goldEval.runsRoot');

    const expectedProductionSourceHash = String(settings.expectedProductionSourceHash || '').trim();
    if (!expectedProductionSourceHash) {
        throw new Error('natural-resume 需要 goldEval.expectedProductionSourceHash');
    }
    if (config?.__codeState?.productionSourceHash !== expectedProductionSourceHash) {
        throw new Error('natural-resume production source hash已变化');
    }

    const source = await loadNaturalCaptureResumePrefix(sourceRunDir);
    const sampleHash = await sha256File(samplePath);
    if (source.manifest.data?.sampleHash !== sampleHash) {
        throw new Error('natural-resume sample与来源run不一致');
    }
    const normalizedCases = source.cases.map((raw, index) => {
        const checked = validateNaturalCaseV2(raw, index + 1);
        if (!checked.ok) throw new Error(`natural-resume source case无效: ${checked.errors.join('; ')}`);
        return checked.case;
    });
    validateNaturalSourceBindings(normalizedCases, sample.messages);
    const currentApis = {
        summary: describeApi(config.summaryApi),
        l0: describeApi(config.vectorConfig?.l0Api),
        embedding: describeApi(config.vectorConfig?.embeddingApi),
        rerank: describeApi(config.vectorConfig?.rerankApi),
        reader: null,
    };
    if (!sameApi(source.manifest.apis, currentApis)) {
        throw new Error('natural-resume provider/model与来源run不一致');
    }

    const turnIntervalMinMs = positiveInteger(
        settings.turnIntervalMinMs ?? settings.caseIntervalMinMs,
        'goldEval.turnIntervalMinMs',
        DEFAULT_TURN_INTERVAL_MIN_MS,
    );
    const turnIntervalMaxMs = positiveInteger(
        settings.turnIntervalMaxMs ?? settings.caseIntervalMaxMs,
        'goldEval.turnIntervalMaxMs',
        DEFAULT_TURN_INTERVAL_MAX_MS,
    );
    if (turnIntervalMaxMs < turnIntervalMinMs) {
        throw new Error('natural-resume turn interval最大值不能小于最小值');
    }
    if (source.manifest.config?.turnPacing?.minMs !== turnIntervalMinMs
        || source.manifest.config?.turnPacing?.maxMs !== turnIntervalMaxMs) {
        throw new Error('natural-resume pacing与来源run不一致');
    }

    const resumeCase = normalizedCases[source.completedCases - 1];
    const remainingCases = normalizedCases.slice(source.completedCases);
    if (!resumeCase || !remainingCases.length) throw new Error('natural-resume没有可恢复的后缀');
    const resumePoint = source.resumePoint;
    if (!resumePoint) throw new Error('natural-resume缺少可信恢复点');
    validateRecoverableNaturalPreparation(resumePoint.preparation, {
        caseId: remainingCases[0]?.id || null,
        stage: 'natural-resume-source-recovery',
    });
    const unarchivedTerminalAttempts = nonNegativeInteger(
        settings.resumeUnarchivedTerminalAttempts,
        'goldEval.resumeUnarchivedTerminalAttempts',
    );
    const misattributedAttempts = nonNegativeInteger(
        settings.resumeMisattributedAttempts,
        'goldEval.resumeMisattributedAttempts',
    );
    const recordedAbandoned = Math.max(
        0,
        Number(source.manifest.progress?.productionTransportRequests || 0)
            - source.productionTransportRequests,
    );
    const reusedRecoveryRequests = Number(resumePoint.preparation?.externalRequests || 0);
    if (reusedRecoveryRequests > recordedAbandoned) {
        throw new Error('natural-resume recovery请求超过来源未提交请求');
    }
    const recordedAbandonedAfterRecovery = recordedAbandoned - reusedRecoveryRequests;
    if (misattributedAttempts > recordedAbandonedAfterRecovery) {
        throw new Error('natural-resume misattributed attempts超过来源废弃后缀计数');
    }
    return {
        source,
        cases: source.cases,
        normalizedCases,
        remainingCases,
        resumeFloor: resumePoint.resumeFloor,
        resumeMessageCount: resumePoint.messageCount,
        resumePoint,
        resumePreparation: structuredClone(resumePoint.preparation),
        lastCommittedCaseFloor: resumeCase.atFloor,
        recordedAbandoned,
        recordedAbandonedAfterRecovery,
        reusedRecoveryRequests,
        runsRoot,
        runName: String(settings.runName || 'natural-resume'),
        sampleHash,
        expectedProductionSourceHash,
        unarchivedTerminalAttempts,
        misattributedAttempts,
        turnIntervalMinMs,
        turnIntervalMaxMs,
    };
}

export async function runNaturalResumeCases({
    modules,
    plan,
    sample,
    samplePath,
    config,
    restoreResumeBoundary,
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
        throw new Error('natural-resume 缺少 history health/recovery adapter');
    }
    const runId = buildRunId(plan.runName);
    const manifest = {
        runId,
        generatedAt: new Date().toISOString(),
        mode: 'story-summary-replay-natural-resume',
        code: {
            commit: config?.__codeState?.commit || 'unknown',
            dirty: config?.__codeState?.dirty ?? true,
            bundleHash: config?.__codeState?.bundleHash || null,
            bundleBytes: config?.__codeState?.bundleBytes ?? null,
            runnerHash: config?.__codeState?.runnerHash || null,
            worktreeStatusHash: config?.__codeState?.worktreeStatusHash || null,
            packageLockHash: config?.__codeState?.packageLockHash || null,
            productionSourceHash: config?.__codeState?.productionSourceHash || null,
            productionSourceFiles: config?.__codeState?.productionSourceFiles ?? null,
            nodeVersion: config?.__codeState?.nodeVersion || null,
            platform: config?.__codeState?.platform || null,
            arch: config?.__codeState?.arch || null,
        },
        data: {
            samplePath: toPosix(samplePath),
            sampleHash: plan.sampleHash,
            messageCount: sample.messages.length,
            casesPath: plan.source.manifest.data?.casesPath || null,
            casesHash: plan.source.manifest.data?.casesHash || null,
            selectedCases: plan.cases.length,
        },
        sourcePrefix: {
            runId: plan.source.manifest.runId,
            runDir: plan.source.runDir,
            manifestHash: await sha256File(plan.source.paths.manifest),
            status: plan.source.manifest.status,
            invalidReason: plan.source.manifest.invalidReason,
            importedCases: plan.source.completedCases,
            importedCheckpointHashes: Object.fromEntries(
                plan.source.prefix.map(item => [item.goldCase.id, item.sourceCheckpointHash]),
            ),
            resumePoint: {
                kind: plan.resumePoint.kind,
                caseId: plan.resumePoint.goldCase?.id || null,
                resumeFloor: plan.resumeFloor,
                messageCount: plan.resumeMessageCount,
                path: plan.resumePoint.snapshotPath,
                sha256: plan.resumePoint.snapshotHash,
                reusedPreparationRequests: plan.reusedRecoveryRequests,
            },
            recordedUncommittedSuffixRequests: plan.recordedAbandoned,
            reusedOperationalRecoveryRequests: plan.reusedRecoveryRequests,
            recordedAbandonedSuffixRequests: plan.recordedAbandonedAfterRecovery,
            misattributedDuplicatedAttempts: plan.misattributedAttempts,
            unarchivedTerminalAttempts: plan.unarchivedTerminalAttempts,
            actualAbandonedSuffixAttempts: Math.max(
                0,
                plan.recordedAbandonedAfterRecovery
                    - plan.misattributedAttempts,
            ) + plan.unarchivedTerminalAttempts,
        },
        config: {
            fingerprint: buildReplayConfigFingerprint(config),
            historyPolicy: 'import committed prefix; restore latest verified boundary/recovery state; continue at resumeFloor+1',
            resumeFloor: plan.resumeFloor,
            resumeMessageCount: plan.resumeMessageCount,
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
            compositePrefix: true,
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

    const prompts = [];
    const promptInputs = [];
    const transportTrace = [];
    const stageTraces = [];
    const metricRows = [];
    const failures = [];
    const replayCases = [];
    const boundarySnapshots = [];
    const recoveryPoints = [];
    let preparation = structuredClone(plan.resumePreparation || emptyNaturalPreparation());
    let previousUserTurnStartedAt = null;
    let activeCase = plan.remainingCases[0];
    let activeIndex = plan.source.completedCases;
    let activeExecution = null;

    try {
        for (const prefixItem of plan.source.prefix) {
            const imported = await copyPrefixCapture({ runStore, prefixItem });
            await runStore.commitCase({
                index: prefixItem.index,
                caseId: prefixItem.goldCase.id,
                capture: imported.capture,
                productionExternalCalls: prefixItem.productionExternalCalls,
                productionTransportRequests: prefixItem.productionTransportRequests,
                readerExternalCalls: 0,
                reusedCase: true,
            });
            prompts.push(imported.capture.prompt);
            promptInputs.push(imported.capture.promptInput);
            transportTrace.push(imported.capture.transport);
            stageTraces.push(imported.capture.stageTrace);
            metricRows.push(metricRowFromCapture(prefixItem.goldCase, imported.capture));
            if (imported.capture.failure) failures.push(imported.capture.failure);
            replayCases.push(imported.capture.replayCase);
            boundarySnapshots.push(imported.snapshotRef);
        }

        let activeResumePoint = plan.resumePoint;
        if (plan.resumePoint.kind === 'natural-operational-recovery') {
            const importedRecovery = await importNaturalRecoveryPoint({
                runStore,
                sourcePoint: plan.resumePoint,
            });
            recoveryPoints.push(importedRecovery);
            activeResumePoint = {
                ...plan.resumePoint,
                snapshotPath: importedRecovery.path,
                snapshotHash: importedRecovery.sha256,
            };
        }
        const resumeSnapshot = JSON.parse(await fs.readFile(activeResumePoint.snapshotPath, 'utf8'));
        const resumeVisibleMessages = sample.messages.slice(0, plan.resumeMessageCount);
        await restoreResumeBoundary({
            snapshot: resumeSnapshot,
            snapshotRef: activeResumePoint,
            goldCase: activeResumePoint.goldCase || null,
            visibleMessages: resumeVisibleMessages,
        });

        const caseByFloor = new Map(plan.remainingCases.map((item, offset) => [
            item.atFloor,
            { item, index: plan.source.completedCases + offset },
        ]));
        const maxQueryFloor = Math.max(...plan.remainingCases.map(item => item.atFloor));
        const nextCaseFromFloor = floor => {
            const offset = plan.remainingCases.findIndex(item => item.atFloor >= floor);
            return offset >= 0
                ? { item: plan.remainingCases[offset], index: plan.source.completedCases + offset }
                : null;
        };

        for (let floor = plan.resumeFloor + 1; floor <= maxQueryFloor; floor++) {
            const message = sample.messages[floor];
            if (!message) throw new Error(`natural-resume 样本缺少 floor ${floor}`);
            const pending = nextCaseFromFloor(floor);
            if (pending) {
                activeCase = pending.item;
                activeIndex = pending.index;
            }

            if (message.is_user) {
                const intervalMs = deterministicInterval({
                    sampleHash: plan.sampleHash,
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
                    await writeBoundarySnapshot({ snapshotPath, goldCase: activeCase, visibleMessages });
                    const snapshotRef = {
                        caseId: activeCase.id,
                        path: toPosix(snapshotPath),
                        sha256: await sha256File(snapshotPath),
                        queryFloor: activeCase.atFloor,
                        historyThroughFloor: activeCase.historyThroughFloor,
                        messageCount: visibleMessages.length,
                    };
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
                    boundarySnapshots.push(snapshotRef);
                    preparation = emptyNaturalPreparation();
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
                `前${plan.source.completedCases}题从invalid来源run的原子checkpoint导入；只复用经hash验真的原子前缀。`,
                `从${plan.resumePoint.kind} floor ${plan.resumeFloor}恢复，只重新维护 ${plan.resumeFloor + 1}..${maxQueryFloor}。`,
                `恢复点复用${plan.reusedRecoveryRequests}次已记录准备请求；其后的来源后缀全部作废。`,
                'query floor不进入Summary、L0/L1或boundary snapshot；召回时将真实USER对象临时push进内存chat。',
                'reader=false；只判断必要记忆是否进入实际Prompt。',
                'L0 fail按生产行为留到后续AI回合重试；到真实query boundary仍未恢复才使run invalid。',
                '成功Summary后保存临时operational recovery，且只保留最近两份。',
                '任一query边界未恢复外部失败或fallback立即使本composite run invalid。',
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
        const failedCase = activeCase ? {
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
            readerExternalCalls: 0,
        } : null;
        const lifecycleErrors = await invalidateGoldRun({ runStore, failure, failedCase });
        if (lifecycleErrors.checkpointError) error.goldCheckpointError = lifecycleErrors.checkpointError;
        if (lifecycleErrors.invalidationError) error.goldInvalidationError = lifecycleErrors.invalidationError;
        error.goldRunDir = runStore.runDir;
        throw error;
    }
}
