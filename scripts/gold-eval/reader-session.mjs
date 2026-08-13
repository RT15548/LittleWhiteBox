// Gold Eval - reader-only consumer for a valid production capture.

import path from 'node:path';

import { aggregateMetrics } from './lib/metrics.mjs';
import { renderGoldEvalReport, buildRunId } from './lib/report.mjs';
import { scoreCase } from './lib/scorer.mjs';
import {
    GOLD_CAPTURE_SCHEMA_VERSION,
    assertReaderSourceCapture,
    beginGoldRun,
    invalidateGoldRun,
    loadGoldCapture,
    loadGoldReaderResume,
} from './lib/run-store.mjs';
import {
    buildReplayConfigFingerprint,
    describeGoldReaderGeneration,
    describeApi,
    runGoldReader,
} from './replay-session.mjs';

function selectReaderCases(source, settings) {
    const rawLimit = settings.limit;
    const limit = rawLimit == null ? null : Number(rawLimit);
    if (limit != null && (!Number.isInteger(limit) || limit < 1)) {
        throw new Error('reader-only 的 goldEval.limit 必须是正整数');
    }
    const caseIds = Array.isArray(settings.caseIds)
        ? settings.caseIds.map(value => String(value || '').trim()).filter(Boolean)
        : [];
    if (limit != null && caseIds.length) {
        throw new Error('reader-only 不允许同时使用 goldEval.limit 与 goldEval.caseIds');
    }
    if (!caseIds.length) return limit == null ? source.cases : source.cases.slice(0, limit);
    if (new Set(caseIds).size !== caseIds.length) {
        throw new Error('reader-only 的 goldEval.caseIds 不允许重复');
    }
    const byId = new Map(source.cases.map(goldCase => [goldCase.id, goldCase]));
    return caseIds.map(caseId => {
        const goldCase = byId.get(caseId);
        if (!goldCase) throw new Error(`reader-only 找不到指定 case: ${caseId}`);
        return goldCase;
    });
}

function assertResumeCompatible({ resume, source, cases, configFingerprint, codeState, readerGeneration }) {
    if (resume.manifest.sourceCapture?.runId !== source.manifest.runId) {
        throw new Error('reader resume 与当前 source capture 不一致');
    }
    if (resume.manifest.config?.fingerprint !== configFingerprint) {
        throw new Error('reader resume 与当前配置 fingerprint 不一致');
    }
    for (const key of ['bundleHash', 'runnerHash', 'worktreeStatusHash', 'packageLockHash']) {
        if ((resume.manifest.code?.[key] || null) !== (codeState?.[key] || null)) {
            throw new Error(`reader resume 与当前执行身份不一致: ${key}`);
        }
    }
    if (resume.manifest.reader?.promptHash !== readerGeneration.promptHash) {
        throw new Error('reader resume 与当前 reader Prompt 不一致');
    }
    const resumeCaseIds = resume.cases.map(goldCase => goldCase.id);
    const currentCaseIds = cases.map(goldCase => goldCase.id);
    if (JSON.stringify(resumeCaseIds) !== JSON.stringify(currentCaseIds)) {
        throw new Error('reader resume 与当前执行 cases 不一致');
    }
}

function buildObservation({ prompt, promptInput, readerResult }) {
    const base = promptInput?.observationBase || {};
    const evidenceTrace = prompt?.evidenceTrace || { final: [], prompt: [] };
    return {
        ...base,
        stages: {
            ...(base.stages || {}),
            final: evidenceTrace.final || [],
            prompt: evidenceTrace.prompt || [],
        },
        timeline: [
            ...(base.timeline || []),
            { stage: 'final', at: null },
            { stage: 'prompt', at: null },
        ],
        promptFloors: (evidenceTrace.prompt || []).map(item => item.floor),
        promptText: prompt.promptText,
        answerText: readerResult.answerText,
        efficiency: {
            ...(base.efficiency || {}),
            externalCalls: 0,
            readerMs: readerResult.readerMs,
            readerCalls: readerResult.readerCalls,
            readerAttempts: readerResult.attempts || [],
            promptChars: prompt.promptChars,
        },
    };
}

async function evaluateReaderCase({
    goldCase,
    index,
    sourceRows,
    resume,
    config,
    runReader,
}) {
    const { prompt, promptInput } = sourceRows.get(goldCase.id);
    const reusedCapture = resume?.capturesByCaseId.get(goldCase.id)?.capture || null;
    const readerResult = reusedCapture
        ? {
            answerText: reusedCapture.readerAnswer.text,
            readerMs: reusedCapture.stageTrace?.efficiency?.readerMs ?? null,
            readerCalls: reusedCapture.stageTrace?.efficiency?.readerCalls ?? 1,
            attempts: reusedCapture.stageTrace?.efficiency?.readerAttempts || [],
            usage: reusedCapture.readerTransport?.readerUsage ?? null,
            transport: reusedCapture.readerTransport?.reader ?? null,
        }
        : await runReader({
            config,
            caseId: goldCase.id,
            promptText: prompt.promptText,
            query: goldCase.query,
        });
    const observation = buildObservation({ prompt, promptInput, readerResult });
    const scored = scoreCase({ case: goldCase, observation });
    const transportRow = {
        schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
        caseId: goldCase.id,
        production: [],
        reader: readerResult.transport,
        readerUsage: readerResult.usage,
        readerAttempts: readerResult.attempts || [],
        readerReusedFrom: reusedCapture ? resume.manifest.runId : null,
    };
    return {
        index,
        goldCase,
        prompt,
        promptInput,
        reusedCapture,
        readerResult,
        scored,
        transportRow,
        capture: {
            schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
            caseId: goldCase.id,
            sourcePromptHash: prompt.promptHash,
            readerAnswer: scored.stageTraceRow.answer,
            readerTransport: transportRow,
            stageTrace: scored.stageTraceRow,
            failure: scored.failureRow,
            reuse: reusedCapture
                ? { sourceRunId: resume.manifest.runId, sourceCaseId: goldCase.id }
                : null,
        },
    };
}

async function commitReaderEvaluation({ runStore, evaluation, stageTraces, metricRows, failures, transportTrace }) {
    const { index, goldCase, readerResult, scored, transportRow, capture, reusedCapture } = evaluation;
    await runStore.commitCase({
        index,
        caseId: goldCase.id,
        capture,
        productionExternalCalls: 0,
        readerExternalCalls: reusedCapture ? 0 : readerResult.readerCalls,
        reusedCase: !!reusedCapture,
    });
    stageTraces.push(scored.stageTraceRow);
    metricRows.push(scored.metricRow);
    if (scored.failureRow) failures.push(scored.failureRow);
    transportTrace.push(transportRow);
}

export async function runGoldReaderOnly({
    captureRunDir,
    runsRoot,
    runName = 'gold-reader-only',
    resumeRunDir = '',
    config,
    runReader = runGoldReader,
}) {
    if (!config?.goldEval?.reader?.enabled) {
        throw new Error('reader-only 需要 goldEval.reader.enabled=true');
    }
    const source = await loadGoldCapture(captureRunDir);
    assertReaderSourceCapture(source);
    const cases = selectReaderCases(source, config.goldEval);
    const sourceRows = new Map(source.cases.map((goldCase, index) => [goldCase.id, {
        prompt: source.prompts[index],
        promptInput: source.promptInputs[index],
    }]));
    const readerGeneration = describeGoldReaderGeneration(config);
    const configFingerprint = buildReplayConfigFingerprint(config);
    const resume = resumeRunDir ? await loadGoldReaderResume(resumeRunDir) : null;
    if (resume) {
        assertResumeCompatible({
            resume,
            source,
            cases,
            configFingerprint,
            codeState: config?.__codeState || {},
            readerGeneration,
        });
        for (const goldCase of cases) {
            const reused = resume.capturesByCaseId.get(goldCase.id)?.capture;
            if (reused && reused.sourcePromptHash !== sourceRows.get(goldCase.id)?.prompt?.promptHash) {
                throw new Error(`reader resume Prompt hash 不一致: case=${goldCase.id}`);
            }
        }
    }
    const runId = buildRunId(runName);
    const manifest = {
        runId,
        generatedAt: new Date().toISOString(),
        mode: 'gold-reader-only',
        sourceCapture: {
            runId: source.manifest.runId,
            runDir: source.runDir,
            mode: source.manifest.mode,
            schemaVersion: source.manifest.schemaVersion,
            casesHash: source.manifest.data?.casesHash || null,
            promptsFile: source.paths.prompts.replace(/\\/g, '/'),
        },
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
        data: { ...source.manifest.data },
        evaluatedCases: cases.length,
        sourceCases: source.cases.length,
        config: { fingerprint: configFingerprint },
        apis: { reader: describeApi(config.summaryApi) },
        reader: {
            enabled: true,
            ...readerGeneration,
        },
        resume: resume
            ? {
                sourceRunId: resume.manifest.runId,
                sourceRunDir: resume.runDir,
                availableCases: resume.capturesByCaseId.size,
            }
            : null,
        capture: {
            schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
            containsFullPrompts: true,
            containsPromptInputs: true,
            containsTransportTrace: true,
            sensitive: true,
            deletion: 'delete reader run directory; source capture remains independent',
        },
        execution: { command: config?.__command || 'unknown' },
    };
    const runStore = await beginGoldRun({
        runsRoot,
        runId,
        manifest,
        cases,
        bundlePath: config?.__codeState?.bundlePath || null,
        codeArtifacts: config?.__codeState?.codeArtifacts || [],
    });

    const stageTraces = [];
    const metricRows = [];
    const failures = [];
    const transportTrace = [];
    let activeCase = null;
    let activeIndex = -1;

    try {
        const concurrency = Math.max(1, Number(readerGeneration.concurrency) || 1);
        for (let start = 0; start < cases.length; start += concurrency) {
            const batch = cases.slice(start, start + concurrency);
            const settled = await Promise.allSettled(batch.map((goldCase, offset) => evaluateReaderCase({
                goldCase,
                index: start + offset,
                sourceRows,
                resume,
                config,
                runReader,
            })));
            const firstRejected = settled.findIndex(result => result.status === 'rejected');
            const commitCount = firstRejected < 0 ? settled.length : firstRejected;
            for (let offset = 0; offset < commitCount; offset++) {
                await commitReaderEvaluation({
                    runStore,
                    evaluation: settled[offset].value,
                    stageTraces,
                    metricRows,
                    failures,
                    transportTrace,
                });
            }
            if (firstRejected >= 0) {
                const failedCase = batch[firstRejected];
                activeCase = failedCase;
                activeIndex = start + firstRejected;
                const error = settled[firstRejected].reason;
                const batchAttempts = settled.map((result, offset) => {
                    if (result.status === 'fulfilled') {
                        return {
                            caseId: batch[offset].id,
                            status: 'success',
                            kind: null,
                            httpStatus: result.value.readerResult?.transport?.status ?? null,
                            readerExternalCalls: result.value.readerResult?.readerCalls || 0,
                        };
                    }
                    const failure = result.reason?.goldFailure || {
                        kind: Number.isInteger(result.reason?.httpStatus) ? 'http' : 'request',
                        status: Number.isInteger(result.reason?.httpStatus) ? result.reason.httpStatus : null,
                    };
                    return {
                        caseId: batch[offset].id,
                        status: 'failure',
                        kind: failure.kind || 'request',
                        httpStatus: Number.isInteger(failure.status) ? failure.status : null,
                        readerExternalCalls: Number(failure.readerExternalCalls) || 1,
                    };
                });
                const batchReaderExternalCalls = batchAttempts.reduce(
                    (total, attempt) => total + attempt.readerExternalCalls,
                    0,
                );
                error.goldFailure = {
                    ...(error?.goldFailure || {}),
                    caseId: failedCase.id,
                    readerExternalCalls: batchReaderExternalCalls,
                    batchAttempts,
                    message: String(error?.message || error),
                };
                throw error;
            }
        }

        const aggregated = aggregateMetrics(metricRows);
        const reportMarkdown = renderGoldEvalReport({
            manifest: { ...runStore.manifest, status: 'valid' },
            aggregated,
            failures,
            stageTraces,
            limitations: [
                'reader-only 只读取 source capture 的完整 Prompt + query；productionExternalCalls 必须为 0。',
                'reader 不接收 expected answer、gold evidence 或 authoring 过程。',
                'reader 是可回答性代理，不是 SillyTavern 最终角色扮演 E2E。',
            ],
        });
        await runStore.complete({
            prompts: cases.map(goldCase => sourceRows.get(goldCase.id).prompt),
            promptInputs: cases.map(goldCase => sourceRows.get(goldCase.id).promptInput),
            transportTrace,
            stageTraces,
            metrics: aggregated,
            failures,
            reportMarkdown,
        });
        return {
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
        const failedCase = activeCase && activeIndex >= 0
            ? {
                index: activeIndex,
                caseId: activeCase.id,
                capture: { schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION, caseId: activeCase.id, failure },
                readerExternalCalls: Number(failure.readerExternalCalls) || 0,
            }
            : null;
        const lifecycleErrors = await invalidateGoldRun({ runStore, failure, failedCase });
        if (lifecycleErrors.checkpointError) error.goldCheckpointError = lifecycleErrors.checkpointError;
        if (lifecycleErrors.invalidationError) error.goldInvalidationError = lifecycleErrors.invalidationError;
        error.goldRunDir = runStore.runDir;
        throw error;
    }
}

export function resolveCapturePath(rootDir, value) {
    return path.isAbsolute(value) ? value : path.resolve(rootDir, value);
}
