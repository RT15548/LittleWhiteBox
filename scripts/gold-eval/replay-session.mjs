// Gold Eval - 真实 story-summary-replay 会话编排
// 功能所有权留在 gold-eval；story-summary-replay 只提供真实执行入口与模块依赖。

import path from 'node:path';
import fs from 'node:fs/promises';

import {
    callSummaryApi,
    resolveGoogleThinkingConfig,
} from '../story-summary-replay/api-client.mjs';
import { aggregateMetrics } from './lib/metrics.mjs';
import { scoreCase } from './lib/scorer.mjs';
import {
    buildEvidenceCatalog,
    createReplayObservationCollector,
    loadGoldCasesFromText,
    selectEvidenceCatalogForCase,
} from './lib/replay-adapter.mjs';
import {
    buildRunId,
    renderGoldEvalReport,
} from './lib/report.mjs';
import {
    GOLD_CAPTURE_SCHEMA_VERSION,
    assertGoldCaptureInputs,
    assertProductionGoldCapture,
    beginGoldRun,
    invalidateGoldRun,
    loadGoldCapture,
    sha256File,
    sha256Text,
} from './lib/run-store.mjs';
import { createStrictTransportCassette } from './lib/transport-cassette.mjs';

const DEFAULT_CASE_INTERVAL_MIN_MS = 12000;
const DEFAULT_CASE_INTERVAL_MAX_MS = 15000;
export const DEFAULT_GOLD_READER_MAX_TOKENS = 30000;
export const DEFAULT_GOLD_READER_REASONING_EFFORT = 'none';
export const DEFAULT_GOLD_READER_MAX_ATTEMPTS = 3;
export const DEFAULT_GOLD_READER_RETRY_DELAY_MS = 5000;
export const DEFAULT_GOLD_READER_CONCURRENCY = 4;
export const GOLD_READER_PROMPT_VERSION = 2;
export const GOLD_READER_SYSTEM_PROMPT = [
    'role: 你是严格的记忆问答 reader。',
    'task: 协助完成记忆模块功能开发，进行记忆召回准确性测评。',
    '',
    '具体要求: 只能依据提供的“实际记忆 Prompt”回答问题，不得使用外部知识补全。',
    '答案尽量简短、直接；不要解释推理，不要复述问题。',
    '若实际记忆 Prompt 不足以确定答案，只输出“不知道”。',
].join('\n');
const GOLD_READER_USER_TEMPLATE = '<实际记忆 Prompt>\n{{promptText}}\n</实际记忆 Prompt>\n\n<问题>\n{{query}}\n</问题>';
export const GOLD_READER_PROMPT_HASH = sha256Text(JSON.stringify({
    version: GOLD_READER_PROMPT_VERSION,
    system: GOLD_READER_SYSTEM_PROMPT,
    user: GOLD_READER_USER_TEMPLATE,
}));

function resolveFromRoot(rootDir, maybeRelativePath) {
    if (!maybeRelativePath) return '';
    return path.isAbsolute(maybeRelativePath)
        ? maybeRelativePath
        : path.resolve(rootDir, maybeRelativePath);
}

function toPosixPath(inputPath) {
    return String(inputPath || '').replace(/\\/g, '/');
}

export function describeApi(api = {}) {
    let endpointHost = '';
    try {
        endpointHost = new URL(String(api.url || '')).host;
    } catch {}
    return {
        provider: String(api.provider || ''),
        endpointHost,
        model: String(api.model || ''),
    };
}

function isGoogleApi(api = {}) {
    return ['google', 'gemini'].includes(String(api.provider || '').trim().toLowerCase());
}

export function describeGoldReaderGeneration(config = {}) {
    const reader = config.goldEval?.reader || {};
    const reasoningEffort = reader.reasoningEffort ?? DEFAULT_GOLD_READER_REASONING_EFFORT;
    const maxAttempts = Number.isInteger(reader.maxAttempts) && reader.maxAttempts >= 1
        ? reader.maxAttempts
        : DEFAULT_GOLD_READER_MAX_ATTEMPTS;
    const retryDelayMs = Number.isInteger(reader.retryDelayMs) && reader.retryDelayMs >= 0
        ? reader.retryDelayMs
        : DEFAULT_GOLD_READER_RETRY_DELAY_MS;
    const concurrency = Number.isInteger(reader.concurrency) && reader.concurrency >= 1
        ? reader.concurrency
        : DEFAULT_GOLD_READER_CONCURRENCY;
    return {
        temperature: reader.temperature ?? 0,
        maxTokens: reader.maxTokens ?? DEFAULT_GOLD_READER_MAX_TOKENS,
        reasoningEffort,
        maxAttempts,
        retryDelayMs,
        concurrency,
        promptVersion: GOLD_READER_PROMPT_VERSION,
        promptHash: GOLD_READER_PROMPT_HASH,
        providerThinkingConfig: isGoogleApi(config.summaryApi)
            ? resolveGoogleThinkingConfig(reasoningEffort)
            : null,
    };
}

export function buildReplayConfigFingerprint(config = {}) {
    const readerEnabled = !!config.goldEval?.reader?.enabled;
    const readerGeneration = readerEnabled ? describeGoldReaderGeneration(config) : null;
    const fingerprintable = {
        mode: String(config.mode || 'full'),
        maxFloors: config.maxFloors ?? null,
        summaryApi: {
            ...describeApi(config.summaryApi),
            temperature: config.summaryApi?.temperature ?? null,
            topP: config.summaryApi?.top_p ?? null,
            topK: config.summaryApi?.top_k ?? null,
            useStream: config.summaryApi?.useStream ?? null,
            maxPerRun: config.summaryApi?.maxPerRun ?? null,
            maxTokens: config.summaryApi?.maxTokens ?? null,
            reasoningEffort: config.summaryApi?.reasoningEffort ?? null,
            prefillMode: config.summaryApi?.prefillMode ?? null,
        },
        wrapperHead: String(config.wrapperHead || ''),
        wrapperTail: String(config.wrapperTail || ''),
        vector: {
            enabled: !!config.vectorConfig?.enabled,
            l0Concurrency: config.vectorConfig?.l0Concurrency ?? null,
            l0Api: describeApi(config.vectorConfig?.l0Api),
            embeddingApi: describeApi(config.vectorConfig?.embeddingApi),
            rerankApi: describeApi(config.vectorConfig?.rerankApi),
        },
        goldReader: readerEnabled
            ? {
                enabled: true,
                api: describeApi(config.summaryApi),
                ...readerGeneration,
            }
            : { enabled: false },
        goldEvalLimit: config.goldEval?.limit ?? null,
        goldCaseIds: config.goldEval?.caseIds || null,
        goldCaseIntervalMinMs: config.goldEval?.caseIntervalMinMs ?? DEFAULT_CASE_INTERVAL_MIN_MS,
        goldCaseIntervalMaxMs: config.goldEval?.caseIntervalMaxMs ?? DEFAULT_CASE_INTERVAL_MAX_MS,
    };
    return sha256Text(JSON.stringify(fingerprintable));
}

export function buildGoldReaderMessages({ promptText, query }) {
    return [
        {
            role: 'system',
            content: GOLD_READER_SYSTEM_PROMPT,
        },
        {
            role: 'user',
            content: `<实际记忆 Prompt>\n${String(promptText || '')}\n</实际记忆 Prompt>\n\n<问题>\n${String(query || '')}\n</问题>`,
        },
    ];
}

function summarizeReaderResponse(payload) {
    const googleCandidates = Array.isArray(payload?.candidates) ? payload.candidates : null;
    if (googleCandidates) {
        return {
            protocol: 'google',
            candidateCount: googleCandidates.length,
            finishReasons: googleCandidates.map(candidate => candidate?.finishReason ?? null),
            promptBlockReason: payload?.promptFeedback?.blockReason ?? null,
            outputChars: googleCandidates.reduce((total, candidate) => (
                total + (Array.isArray(candidate?.content?.parts)
                    ? candidate.content.parts.reduce((sum, part) => (
                        sum + (typeof part?.text === 'string' ? part.text.length : 0)
                    ), 0)
                    : 0)
            ), 0),
        };
    }
    const choices = Array.isArray(payload?.choices) ? payload.choices : null;
    if (choices) {
        return {
            protocol: 'openai-compatible',
            candidateCount: choices.length,
            finishReasons: choices.map(choice => choice?.finish_reason ?? null),
            promptBlockReason: null,
            outputChars: choices.reduce((total, choice) => {
                const content = choice?.message?.content;
                return total + (typeof content === 'string' ? content.length : 0);
            }, 0),
        };
    }
    return null;
}

function isRetryableReaderFailure(failure) {
    if (failure?.kind === 'empty-response' || failure?.kind === 'request') return true;
    if (failure?.kind !== 'http') return false;
    const status = Number(failure.status);
    return [408, 409, 425, 429].includes(status) || (status >= 500 && status <= 599);
}

function resolveReaderRetryDelay(failure, baseDelayMs, retryIndex) {
    const retryAfter = Number(failure?.transport?.rateHeaders?.['retry-after']);
    const exponential = baseDelayMs * (2 ** retryIndex);
    if (Number.isFinite(retryAfter) && retryAfter >= 0) return Math.max(exponential, retryAfter * 1000);
    return exponential;
}

export async function runGoldReader({
    config,
    promptText,
    query,
    callApi = callSummaryApi,
    clock = () => performance.now(),
    sleep = (delayMs) => new Promise(resolve => setTimeout(resolve, delayMs)),
}) {
    const reader = config?.goldEval?.reader || {};
    if (!reader.enabled) return { answerText: null, readerMs: null, readerCalls: 0 };

    const startedAt = clock();
    const maxAttempts = Number.isInteger(reader.maxAttempts) && reader.maxAttempts >= 1
        ? reader.maxAttempts
        : DEFAULT_GOLD_READER_MAX_ATTEMPTS;
    const retryDelayMs = Number.isInteger(reader.retryDelayMs) && reader.retryDelayMs >= 0
        ? reader.retryDelayMs
        : DEFAULT_GOLD_READER_RETRY_DELAY_MS;
    const attempts = [];
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        let usage = null;
        let transport = null;
        let responseMeta = null;
        try {
            const answerText = await callApi(
                config.summaryApi,
                buildGoldReaderMessages({ promptText, query }),
                {
                    temperature: reader.temperature ?? 0,
                    max_tokens: reader.maxTokens ?? DEFAULT_GOLD_READER_MAX_TOKENS,
                    reasoning_effort: reader.reasoningEffort ?? DEFAULT_GOLD_READER_REASONING_EFFORT,
                    onResponse(payload) {
                        usage = payload?.usage || payload?.usageMetadata || payload?.meta?.tokens || null;
                        responseMeta = summarizeReaderResponse(payload);
                    },
                    onTransport(value) {
                        transport = value || null;
                    },
                },
            );
            if (!String(answerText || '').trim()) {
                const error = new Error('Gold reader 返回空答案');
                error.goldFailure = {
                    stage: 'reader',
                    kind: 'empty-response',
                    status: transport?.status ?? null,
                    transport,
                    usage,
                    responseMeta,
                    message: error.message,
                };
                throw error;
            }
            attempts.push({
                attempt,
                status: 'success',
                transport,
                usage,
                responseMeta,
            });
            return {
                answerText: String(answerText).trim(),
                readerMs: Math.max(0, Math.round(clock() - startedAt)),
                readerCalls: attempt,
                usage,
                transport,
                responseMeta,
                attempts,
            };
        } catch (error) {
            const failure = {
                ...(error?.goldFailure || {}),
                stage: 'reader',
                kind: error?.goldFailure?.kind
                    || (Number.isInteger(error?.httpStatus) ? 'http' : 'request'),
                status: error?.goldFailure?.status
                    ?? (Number.isInteger(error?.httpStatus) ? error.httpStatus : null),
                transport: error?.goldFailure?.transport ?? transport,
                usage: error?.goldFailure?.usage ?? usage,
                responseMeta: error?.goldFailure?.responseMeta ?? responseMeta,
                message: String(error?.message || error),
            };
            const retryable = isRetryableReaderFailure(failure);
            const attemptRecord = {
                attempt,
                status: 'failure',
                kind: failure.kind,
                httpStatus: failure.status,
                transport: failure.transport,
                usage: failure.usage,
                responseMeta: failure.responseMeta,
                retryable,
            };
            attempts.push(attemptRecord);
            if (!retryable || attempt >= maxAttempts) {
                error.goldFailure = {
                    ...failure,
                    attempt,
                    maxAttempts,
                    retryable,
                    readerExternalCalls: attempt,
                    attempts,
                };
                throw error;
            }
            const delayMs = resolveReaderRetryDelay(failure, retryDelayMs, attempt - 1);
            attemptRecord.retryDelayMs = delayMs;
            await sleep(delayMs);
        }
    }
    throw new Error('Gold reader 重试状态异常');
}

export function assertGoldExternalStagesHealthy(execution, caseId = 'unknown') {
    const metrics = execution?.normalizedRecall?.metrics || {};
    const failures = [...(metrics?.external?.failures || [])];
    if (!failures.length && metrics?.evidence?.rerankFailed) {
        failures.push({ stage: 'rerank', kind: 'legacy-failure-flag' });
    }
    if (!failures.length) return;
    const summary = failures.map(failure => ({
        stage: String(failure?.stage || 'unknown'),
        kind: String(failure?.kind || 'unknown'),
        status: Number.isInteger(failure?.status) ? failure.status : null,
        attempt: Number.isInteger(failure?.attempt) ? failure.attempt : null,
        batchIndex: Number.isInteger(failure?.batchIndex) ? failure.batchIndex : null,
    }));
    const error = new Error(
        `Gold Eval 已中止：case=${caseId} 存在关键外部阶段失败 ${JSON.stringify(summary)}`,
    );
    error.goldFailure = {
        stage: summary[0]?.stage || 'external',
        kind: summary[0]?.kind || 'critical-external-stage',
        status: summary[0]?.status ?? null,
        batchIndex: summary[0]?.batchIndex ?? null,
        caseId,
        message: JSON.stringify(summary),
    };
    throw error;
}

function selectGoldCases(loadedCases, rawCaseIds) {
    if (rawCaseIds == null) return loadedCases;
    if (!Array.isArray(rawCaseIds) || rawCaseIds.length === 0) {
        throw new Error('goldEval.caseIds 必须是非空数组');
    }

    const requestedCaseIds = rawCaseIds.map(value => String(value || '').trim());
    if (requestedCaseIds.some(id => !id)) {
        throw new Error('goldEval.caseIds 不能含空 id');
    }
    if (new Set(requestedCaseIds).size !== requestedCaseIds.length) {
        throw new Error('goldEval.caseIds 不能含重复 id');
    }

    const loadedById = new Map(loadedCases.map(goldCase => [goldCase.id, goldCase]));
    return requestedCaseIds.map(caseId => {
        const goldCase = loadedById.get(caseId);
        if (!goldCase) throw new Error(`goldEval.caseIds 包含未加载 case: ${caseId}`);
        return goldCase;
    });
}

function indexSourceTransportByCaseId(source) {
    const sourceCases = Array.isArray(source?.cases) ? source.cases : [];
    const transportRows = Array.isArray(source?.transportTrace) ? source.transportTrace : [];
    if (sourceCases.length !== transportRows.length) {
        throw new Error('source capture 的 cases 与 transport 行数不一致');
    }

    const byCaseId = new Map();
    for (const [index, goldCase] of sourceCases.entries()) {
        const caseId = String(goldCase?.id || '');
        const transport = transportRows[index];
        if (!caseId || byCaseId.has(caseId) || transport?.caseId !== caseId) {
            throw new Error(`source capture transport case 映射无效: index=${index} case=${caseId || 'unknown'}`);
        }
        if (!Array.isArray(transport.production)) {
            throw new Error(`source capture transport 缺少 production 数组: case=${caseId}`);
        }
        byCaseId.set(caseId, transport.production);
    }
    return byCaseId;
}

export async function prepareGoldEvalPlan({ rootDir, config, boundaryFloor }) {
    const settings = config?.goldEval;
    if (!settings?.enabled) return null;

    const casesPath = resolveFromRoot(rootDir, settings.casesPath);
    const runsRoot = resolveFromRoot(rootDir, settings.runsRoot);
    if (!casesPath) throw new Error('goldEval.enabled=true 时必须提供 casesPath');
    if (!runsRoot) throw new Error('goldEval.enabled=true 时必须提供 runsRoot');

    const casesText = await fs.readFile(casesPath, 'utf8');
    const loadedCases = loadGoldCasesFromText(casesText, {
        split: settings.split ? String(settings.split) : undefined,
        boundaryFloor,
    });
    const limit = settings.limit == null ? null : Number(settings.limit);
    if (limit != null && (!Number.isInteger(limit) || limit < 1)) {
        throw new Error('goldEval.limit 必须是正整数');
    }
    const selectedCases = selectGoldCases(loadedCases, settings.caseIds);
    const caseIntervalMinMs = settings.caseIntervalMinMs == null
        ? DEFAULT_CASE_INTERVAL_MIN_MS
        : Number(settings.caseIntervalMinMs);
    const caseIntervalMaxMs = settings.caseIntervalMaxMs == null
        ? DEFAULT_CASE_INTERVAL_MAX_MS
        : Number(settings.caseIntervalMaxMs);
    if (!Number.isInteger(caseIntervalMinMs) || caseIntervalMinMs < 1) {
        throw new Error('goldEval.caseIntervalMinMs 必须是正整数');
    }
    if (!Number.isInteger(caseIntervalMaxMs) || caseIntervalMaxMs < caseIntervalMinMs) {
        throw new Error('goldEval.caseIntervalMaxMs 必须是大于等于 caseIntervalMinMs 的正整数');
    }
    const cases = limit == null ? selectedCases : selectedCases.slice(0, limit);

    return {
        cases,
        casesPath,
        casesHash: sha256Text(casesText),
        runsRoot,
        runName: String(settings.runName || 'gold-baseline'),
        caseIntervalMinMs,
        caseIntervalMaxMs,
        captureRunDir: settings.captureRunDir
            ? resolveFromRoot(rootDir, settings.captureRunDir)
            : '',
    };
}

function caseIntervalMs({ caseId, casesHash, minMs, maxMs }) {
    if (minMs === maxMs) return minMs;
    const value = Number.parseInt(sha256Text(`${casesHash}:${caseId}`).slice(0, 8), 16);
    return minMs + (value % (maxMs - minMs + 1));
}

async function waitForCaseCadence({
    previousCaseStartedAt,
    minimumStartInterval,
    clock,
    wait,
}) {
    if (previousCaseStartedAt == null) return;

    let remaining = minimumStartInterval - (clock() - previousCaseStartedAt);
    while (remaining > 0) {
        await wait(remaining);
        remaining = minimumStartInterval - (clock() - previousCaseStartedAt);
    }
}

export async function runGoldEvalCases({
    modules,
    goldPlan,
    sample,
    samplePath,
    snapshotPath,
    config,
    executeRecallCase,
    clock = () => Date.now(),
    wait = delayMs => new Promise(resolve => setTimeout(resolve, delayMs)),
}) {
    const store = modules.getSummaryStore();
    const chatId = modules.getContext().chatId;
    const chunks = await modules.getAllChunks(chatId);
    const catalog = buildEvidenceCatalog({
        messages: sample.messages,
        stateAtoms: modules.getStateAtoms(),
        chunks,
        events: store?.json?.events || [],
        facts: store?.json?.facts || [],
    });

    const runId = buildRunId(goldPlan.runName);
    const [sampleHash, snapshotHash] = await Promise.all([
        sha256File(samplePath),
        sha256File(snapshotPath),
    ]);
    const cassetteMode = String(config?.mode || '') === 'recall-cassette';
    if (cassetteMode && !goldPlan.captureRunDir) {
        throw new Error('recall-cassette 需要 goldEval.captureRunDir');
    }
    if (cassetteMode && config?.goldEval?.reader?.enabled) {
        throw new Error('recall-cassette 是零 API 轨道；reader 请使用独立 reader-only 轨道');
    }
    const cassetteSource = cassetteMode
        ? await loadGoldCapture(goldPlan.captureRunDir)
        : null;
    if (cassetteSource) {
        assertProductionGoldCapture(cassetteSource);
        assertGoldCaptureInputs(cassetteSource, {
            sampleHash,
            snapshotHash,
            cases: goldPlan.cases,
        });
        if (!cassetteSource.manifest.capture?.containsTransportCassette) {
            throw new Error('source capture 不含完整 transport cassette；必须重新运行 production capture');
        }
    }
    const sourceTransportByCaseId = cassetteSource
        ? indexSourceTransportByCaseId(cassetteSource)
        : null;
    const manifest = {
        runId,
        generatedAt: new Date().toISOString(),
        mode: cassetteMode
            ? 'story-summary-replay-gold-recall-cassette'
            : 'story-summary-replay-gold-capture',
        ...(cassetteSource ? {
            sourceCapture: {
                runId: cassetteSource.manifest.runId,
                runDir: cassetteSource.runDir,
                schemaVersion: cassetteSource.manifest.schemaVersion,
                casesHash: cassetteSource.manifest.capture.executedCasesHash,
                sourceBundleHash: cassetteSource.manifest.code?.bundleHash || null,
            },
        } : {}),
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
            samplePath: toPosixPath(samplePath),
            sampleHash,
            messageCount: sample.messages.length,
            casesPath: toPosixPath(goldPlan.casesPath),
            casesHash: goldPlan.casesHash,
            snapshotPath: toPosixPath(snapshotPath),
            snapshotHash,
        },
        config: {
            fingerprint: buildReplayConfigFingerprint(config),
            pacing: {
                caseIntervalMinMs: goldPlan.caseIntervalMinMs ?? DEFAULT_CASE_INTERVAL_MIN_MS,
                caseIntervalMaxMs: goldPlan.caseIntervalMaxMs ?? DEFAULT_CASE_INTERVAL_MAX_MS,
                strategy: 'deterministic-jitter-from-cases-hash-and-case-id',
                scope: 'case-start cadence; production execution inside each case is unchanged',
            },
        },
        apis: {
            summary: describeApi(config.summaryApi),
            l0: describeApi(config.vectorConfig?.l0Api),
            embedding: describeApi(config.vectorConfig?.embeddingApi),
            rerank: describeApi(config.vectorConfig?.rerankApi),
            reader: config.goldEval?.reader?.enabled ? describeApi(config.summaryApi) : null,
        },
        reader: config.goldEval?.reader?.enabled
            ? {
                enabled: true,
                ...describeGoldReaderGeneration(config),
            }
            : { enabled: false },
        capture: {
            schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
            containsFullPrompts: true,
            containsPromptInputs: true,
            containsTransportTrace: true,
            containsTransportCassette: true,
            transportMode: cassetteMode ? 'strict-cassette' : 'live-production',
            sensitive: true,
            deletion: 'delete run directory',
        },
        execution: { command: config?.__command || 'unknown' },
    };
    const runStore = await beginGoldRun({
        runsRoot: goldPlan.runsRoot,
        runId,
        manifest,
        cases: goldPlan.cases,
        bundlePath: config?.__codeState?.bundlePath || null,
        codeArtifacts: config?.__codeState?.codeArtifacts || [],
    });

    const replayCases = [];
    const stageTraces = [];
    const metricRows = [];
    const failures = [];
    const prompts = [];
    const promptInputs = [];
    const transportTrace = [];
    let previousCaseStartedAt = null;
    let activeCase = null;
    let activeIndex = -1;
    let activeExecution = null;

    try {
        for (const [index, goldCase] of goldPlan.cases.entries()) {
            activeCase = goldCase;
            activeIndex = index;
            activeExecution = null;
            const minimumStartInterval = caseIntervalMs({
                caseId: goldCase.id,
                casesHash: goldPlan.casesHash,
                minMs: goldPlan.caseIntervalMinMs ?? DEFAULT_CASE_INTERVAL_MIN_MS,
                maxMs: goldPlan.caseIntervalMaxMs ?? DEFAULT_CASE_INTERVAL_MAX_MS,
            });
            if (!cassetteMode) {
                await waitForCaseCadence({ previousCaseStartedAt, minimumStartInterval, clock, wait });
            }
            previousCaseStartedAt = clock();

            const collector = createReplayObservationCollector();
            const transportCassette = cassetteSource
                ? createStrictTransportCassette(
                    sourceTransportByCaseId.get(goldCase.id),
                    { caseId: goldCase.id },
                )
                : null;
            const execution = await executeRecallCase({
                label: goldCase.id,
                pendingUserMessage: goldCase.query,
                excludeLastAi: false,
            }, collector.observe, transportCassette);
            activeExecution = execution;
            assertGoldExternalStagesHealthy(execution, goldCase.id);
            if (!cassetteMode) {
                createStrictTransportCassette(execution.transportTrace, { caseId: goldCase.id });
            }
            if (!execution.promptInput) {
                throw new Error(`Gold Eval 已中止：case=${goldCase.id} 缺少可复放的 Prompt 输入`);
            }

            const readerResult = await runGoldReader({
                config,
                promptText: execution.promptText,
                query: goldCase.query,
            });
            const productionExternalCalls = Number(execution.externalCalls);
            const productionTransportRequests = Number(
                execution.externalRequests ?? execution.transportTrace?.length,
            );
            const readerExternalCalls = Number(readerResult.readerCalls);
            if (!Number.isInteger(productionExternalCalls) || productionExternalCalls < 0
                || !Number.isInteger(productionTransportRequests) || productionTransportRequests < 0
                || !Number.isInteger(readerExternalCalls) || readerExternalCalls < 0) {
                throw new Error(`Gold Eval 已中止：case=${goldCase.id} 无法审计外部请求数`);
            }
            if (productionTransportRequests !== execution.transportTrace?.length) {
                throw new Error(`Gold Eval 已中止：case=${goldCase.id} transport 请求数不一致`);
            }
            if (!cassetteMode && productionExternalCalls !== productionTransportRequests) {
                throw new Error(`Gold Eval 已中止：case=${goldCase.id} production network 计数不一致`);
            }
            if (cassetteMode && productionExternalCalls !== 0) {
                throw new Error(`recall-cassette 禁止 production network：case=${goldCase.id} calls=${productionExternalCalls}`);
            }

            const evidenceTextsByFloor = selectEvidenceCatalogForCase(catalog, goldCase);
            const observationBase = collector.build({
                extractedFloors: catalog.extractedFloors,
                evidenceTextsByFloor,
                efficiency: {
                    recallMs: execution.recallMs,
                    externalCalls: execution.externalCalls,
                    readerMs: null,
                    readerCalls: 0,
                    promptChars: execution.promptText.length,
                },
            });
            collector.observe({ stage: 'final', ranked: execution.evidenceTrace.final });
            collector.observe({ stage: 'prompt', ranked: execution.evidenceTrace.prompt });
            const observation = collector.build({
                extractedFloors: catalog.extractedFloors,
                promptFloors: execution.evidenceTrace.prompt.map(item => item.floor),
                promptText: execution.promptText,
                evidenceTextsByFloor,
                answerText: readerResult.answerText,
                efficiency: {
                    recallMs: execution.recallMs,
                    externalCalls: execution.externalCalls,
                    readerMs: readerResult.readerMs,
                    readerCalls: readerResult.readerCalls,
                    promptChars: execution.promptText.length,
                },
            });
            const scored = scoreCase({ case: goldCase, observation });
            const promptRow = {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: goldCase.id,
                promptText: execution.promptText,
                promptHash: sha256Text(execution.promptText),
                promptChars: execution.promptText.length,
                evidenceTrace: execution.evidenceTrace,
            };
            const promptInputRow = {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: goldCase.id,
                production: execution.promptInput,
                observationBase,
            };
            const transportRow = {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: goldCase.id,
                production: execution.transportTrace || [],
                reader: readerResult.transport,
                readerUsage: readerResult.usage,
            };
            const replayCase = { ...execution.reportCase, goldCaseId: goldCase.id };
            const capture = {
                schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                caseId: goldCase.id,
                prompt: promptRow,
                promptInput: promptInputRow,
                transport: transportRow,
                stageTrace: scored.stageTraceRow,
                failure: scored.failureRow,
                replayCase,
            };
            await runStore.commitCase({
                index,
                caseId: goldCase.id,
                capture,
                productionExternalCalls,
                productionTransportRequests,
                readerExternalCalls,
            });

            prompts.push(promptRow);
            promptInputs.push(promptInputRow);
            transportTrace.push(transportRow);
            stageTraces.push(scored.stageTraceRow);
            metricRows.push(scored.metricRow);
            if (scored.failureRow) failures.push(scored.failureRow);
            replayCases.push(replayCase);
        }

        const aggregated = aggregateMetrics(metricRows);
        const reportMarkdown = renderGoldEvalReport({
            manifest: { ...runStore.manifest, status: 'valid' },
            aggregated,
            failures,
            stageTraces,
            limitations: [
                config.goldEval?.reader?.enabled
                    ? '固定 reader 只接收实际记忆 Prompt 与 case query；不接收 gold answer 或 evidence。'
                    : '本次只评分 retrieval 与 Prompt 证据链；阅读答案尚未运行。',
                cassetteMode
                    ? 'recall-cassette 执行正式召回代码，但 Embedding/Rerank 严格复放 source capture；production network=0。'
                    : 'production capture 使用 live Embedding/Rerank，并保存可验证的完整 transport cassette。',
                '所有用例 atFloor 必须等于冻结 snapshot 边界，防止未来信息泄漏。',
                '无法携带精确楼层来源的短文本不参与自动 Prompt 归因。',
                `相邻 case 起点按可复现抖动间隔 ${goldPlan.caseIntervalMinMs ?? DEFAULT_CASE_INTERVAL_MIN_MS}–${goldPlan.caseIntervalMaxMs ?? DEFAULT_CASE_INTERVAL_MAX_MS}ms 调度；题内生产并发保持不变。`,
            ],
        });
        await runStore.complete({
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
        const failedCase = activeCase && activeIndex >= 0
            ? {
                index: activeIndex,
                caseId: activeCase.id,
                capture: {
                    schemaVersion: GOLD_CAPTURE_SCHEMA_VERSION,
                    caseId: activeCase.id,
                    failure,
                    transport: activeExecution?.transportTrace || error?.externalTrace || [],
                    reportCase: activeExecution?.reportCase || null,
                },
                productionExternalCalls: Number.isInteger(activeExecution?.externalCalls)
                    ? activeExecution.externalCalls
                    : 0,
                productionTransportRequests: Number.isInteger(activeExecution?.externalRequests)
                    ? activeExecution.externalRequests
                    : (activeExecution?.transportTrace || error?.externalTrace || []).length,
            }
            : null;
        const lifecycleErrors = await invalidateGoldRun({ runStore, failure, failedCase });
        if (lifecycleErrors.checkpointError) error.goldCheckpointError = lifecycleErrors.checkpointError;
        if (lifecycleErrors.invalidationError) error.goldInvalidationError = lifecycleErrors.invalidationError;
        error.goldRunDir = runStore.runDir;
        throw error;
    }
}
