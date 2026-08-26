// Gold Eval - prompt-only paired consumer for a valid synthetic probe capture.

import { aggregateMetrics } from './lib/metrics.mjs';
import { renderGoldEvalReport, buildRunId } from './lib/report.mjs';
import { scoreCase } from './lib/scorer.mjs';
import {
    GOLD_CAPTURE_SCHEMA_VERSION,
    assertGoldCaptureInputs,
    assertSyntheticProbeCapture,
    beginGoldRun,
    invalidateGoldRun,
    loadGoldCapture,
    sha256File,
    sha256Text,
} from './lib/run-store.mjs';
import { buildReplayConfigFingerprint } from './replay-session.mjs';

function buildObservation({ prompt, promptInput }) {
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
        answerText: null,
        efficiency: {
            ...(base.efficiency || {}),
            externalCalls: 0,
            readerMs: null,
            readerCalls: 0,
            promptChars: prompt.promptChars,
        },
    };
}

export async function runGoldPromptOnly({
    captureRunDir,
    runsRoot,
    runName = 'gold-prompt-only',
    config,
    buildPrompt,
    samplePath,
    snapshotPath,
}) {
    if (!samplePath || !snapshotPath) {
        throw new Error('prompt-only 需要当前 samplePath 与 snapshotPath 做来源校验');
    }
    const source = await loadGoldCapture(captureRunDir);
    assertSyntheticProbeCapture(source);
    const [sampleHash, snapshotHash] = await Promise.all([
        sha256File(samplePath),
        sha256File(snapshotPath),
    ]);
    assertGoldCaptureInputs(source, { sampleHash, snapshotHash });
    const runId = buildRunId(runName);
    const manifest = {
        runId,
        generatedAt: new Date().toISOString(),
        mode: 'gold-prompt-only-paired',
        sourceCapture: {
            runId: source.manifest.runId,
            runDir: source.runDir,
            schemaVersion: source.manifest.schemaVersion,
            casesHash: source.manifest.data?.casesHash || null,
            sourceBundleHash: source.manifest.code?.bundleHash || null,
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
        config: { fingerprint: buildReplayConfigFingerprint(config) },
        apis: { production: null, reader: null },
        reader: { enabled: false },
        capture: {
            schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
            containsFullPrompts: true,
            containsPromptInputs: true,
            containsTransportTrace: true,
            sensitive: true,
            deletion: 'delete prompt-only run directory; source capture remains independent',
        },
        execution: { command: config?.__command || 'unknown' },
    };
    const runStore = await beginGoldRun({
        runsRoot,
        runId,
        manifest,
        cases: source.cases,
        bundlePath: config?.__codeState?.bundlePath || null,
        codeArtifacts: config?.__codeState?.codeArtifacts || [],
    });

    const prompts = [];
    const stageTraces = [];
    const metricRows = [];
    const failures = [];
    const transportTrace = [];
    let activeCase = null;
    let activeIndex = -1;

    try {
        for (const [index, goldCase] of source.cases.entries()) {
            activeCase = goldCase;
            activeIndex = index;
            const promptInput = source.promptInputs[index];
            const built = await buildPrompt(promptInput.production, goldCase);
            const externalCalls = Number(built?.externalCalls ?? 0);
            if (externalCalls !== 0) {
                throw new Error(`prompt-only 禁止外部调用：case=${goldCase.id} calls=${externalCalls}`);
            }
            const promptText = String(built?.promptText || '');
            const promptRow = {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: goldCase.id,
                promptText,
                promptHash: sha256Text(promptText),
                promptChars: promptText.length,
                evidenceTrace: built?.evidenceTrace || { final: [], prompt: [] },
                sourcePromptHash: source.prompts[index].promptHash,
                changed: sha256Text(promptText) !== source.prompts[index].promptHash,
            };
            const observation = buildObservation({ prompt: promptRow, promptInput });
            const scored = scoreCase({ case: goldCase, observation });
            const transportRow = {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: goldCase.id,
                production: [],
                reader: null,
                readerUsage: null,
            };
            await runStore.commitCase({
                index,
                caseId: goldCase.id,
                capture: {
                    schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                    caseId: goldCase.id,
                    prompt: promptRow,
                    sourcePromptHash: source.prompts[index].promptHash,
                    stageTrace: scored.stageTraceRow,
                    failure: scored.failureRow,
                },
            });
            prompts.push(promptRow);
            stageTraces.push(scored.stageTraceRow);
            metricRows.push(scored.metricRow);
            if (scored.failureRow) failures.push(scored.failureRow);
            transportTrace.push(transportRow);
        }

        const aggregated = aggregateMetrics(metricRows);
        const changedPrompts = prompts.filter(item => item.changed).length;
        const reportMarkdown = renderGoldEvalReport({
            manifest: { ...runStore.manifest, status: 'valid' },
            aggregated,
            failures,
            stageTraces,
            limitations: [
                'prompt-only 复用 source capture 的同一份 normalized recall；productionExternalCalls=0。',
                `Prompt 文本变化 ${changedPrompts}/${prompts.length} 题。`,
                '本轨道只允许比较 Prompt 装配；Query、Embedding、Rerank 或召回候选变化必须建立新的同轨 source capture。',
            ],
        });
        await runStore.complete({
            manifestPatch: { paired: { changedPrompts, totalPrompts: prompts.length } },
            prompts,
            promptInputs: source.promptInputs,
            transportTrace,
            stageTraces,
            metrics: aggregated,
            failures,
            reportMarkdown,
        });
        return {
            aggregated,
            changedPrompts,
            artifacts: runStore.artifacts(),
            manifest: runStore.manifest,
        };
    } catch (error) {
        const failure = {
            stage: 'prompt-only',
            kind: 'build',
            caseId: activeCase?.id || null,
            message: String(error?.message || error),
        };
        const failedCase = activeCase && activeIndex >= 0
            ? {
                index: activeIndex,
                caseId: activeCase.id,
                capture: { schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION, caseId: activeCase.id, failure },
            }
            : null;
        const lifecycleErrors = await invalidateGoldRun({ runStore, failure, failedCase });
        if (lifecycleErrors.checkpointError) error.goldCheckpointError = lifecycleErrors.checkpointError;
        if (lifecycleErrors.invalidationError) error.goldInvalidationError = lifecycleErrors.invalidationError;
        error.goldRunDir = runStore.runDir;
        throw error;
    }
}
