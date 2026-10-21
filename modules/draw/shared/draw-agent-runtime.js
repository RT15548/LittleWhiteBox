import {
    SUBMIT_SCENE_PLAN_TOOL_NAME,
    ScenePlannerError,
    ScenePlannerErrorCategory,
    createScenePlannerCorrectionResult,
    getScenePlannerCorrectionSignature,
    getScenePlannerErrorCategory,
    isScenePlannerCorrectionError,
} from './scene-plan-contract.js';
import { redactRequestSecrets } from '../../agent-core/adapters/request-inspection.js';
import { logScenePlannerArgumentsRepair, logScenePlannerDiagnostic, logScenePlannerValidationFailure } from './scene-planner-debug.js';
import {
    buildProviderAssistantToolCallMessage,
    buildProviderToolResultMessage,
    resolveResultToolCalls,
} from '../../agent-core/runtime/protocol.js';

const DEFAULT_SCENE_PLANNER_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_SCENE_PLANNER_ATTEMPTS = 3;

// 每次场景规划（含它的重试）一条记录，只放在页面内存里：最近 10 条，较早的失败再多留到共 5 条，
// 这样成功的记录多了也不会把失败的挤掉。
export const DIAGNOSTIC_HISTORY_RECENT = 10;
export const DIAGNOSTIC_HISTORY_FAILURES = 5;
// 单次模型返回的序列化上限；超出时截断并标记 modelOutputTruncated。
export const DIAGNOSTIC_MODEL_OUTPUT_MAX_CHARS = 100000;

let lastDrawAgentDiagnostic = null;
let diagnosticHistory = [];
let diagnosticSequence = 0;
let activeDiagnosticId = 0;

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

export function normalizeScenePlannerTimeout(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0
        ? Math.floor(number)
        : DEFAULT_SCENE_PLANNER_TIMEOUT_MS;
}

function buildInspectionDiagnosticPatch(inspection) {
    const notices = Array.isArray(inspection?.notices)
        ? inspection.notices.map((notice) => String(notice || '').trim()).filter(Boolean)
        : [];
    const effectiveConfig = inspection?.effectiveConfig;
    const patch = {
        request: cloneJson(inspection),
        notices,
    };
    if (effectiveConfig?.reasoningRequestedMode) {
        patch.reasoningRequestedMode = String(effectiveConfig.reasoningRequestedMode);
        patch.reasoningRequestedOutput = String(effectiveConfig.reasoningRequestedOutput || 'hide');
        patch.reasoningProfileId = String(effectiveConfig.reasoningProfileId || 'unsupported');
        patch.reasoningEffectiveMode = String(effectiveConfig.reasoningEffectiveMode || 'inherit');
        patch.reasoningEffort = String(effectiveConfig.reasoningEffort || '');
        patch.reasoningBudgetTokens = effectiveConfig.reasoningBudgetTokens !== null
            && effectiveConfig.reasoningBudgetTokens !== undefined
            && Number.isFinite(Number(effectiveConfig.reasoningBudgetTokens))
            ? Number(effectiveConfig.reasoningBudgetTokens)
            : null;
        patch.reasoningControlFields = cloneJson(effectiveConfig.reasoningControlFields || {});
        patch.reasoningOutputVisible = effectiveConfig.reasoningOutputVisible === true;
    }
    if (effectiveConfig?.toolChoice !== undefined) {
        patch.toolChoice = String(effectiveConfig.toolChoice || '');
    }
    return patch;
}

// The transport error text stays out of the record (it may echo credentials); only the
// finish reason and the adapter's response summary describe an incomplete reply.
function describeIncompleteResponse(rawError) {
    if (rawError?.responseInfo === undefined) return {};
    const partialText = String(rawError.partialResponse?.text || '');
    return {
        finishReason: String(rawError.reason || ''),
        ...(rawError.responseInfo !== undefined ? { responseInfo: redactRequestSecrets(cloneJson(rawError.responseInfo)) } : {}),
        ...(partialText ? { partialTextLength: partialText.length, partialTextHead: partialText.slice(0, 300) } : {}),
    };
}

function resolveValidationToolCalls(result, providerConfig, attempt) {
    if (Array.isArray(result?.toolCalls) && result.toolCalls.length) return result.toolCalls;
    return resolveResultToolCalls(result, providerConfig, {
        fallbackPrefix: `scene-planner-attempt-${attempt}`,
        createId: (index) => `scene-planner-attempt-${attempt}-${index + 1}`,
    });
}

function buildCorrectionTurn({ result, providerConfig, error, attempt, sessionLoop }) {
    const toolCalls = resolveResultToolCalls(result, providerConfig, {
        fallbackPrefix: `scene-planner-attempt-${attempt}`,
        createId: (index) => `scene-planner-attempt-${attempt}-${index + 1}`,
    });
    const feedback = createScenePlannerCorrectionResult(error);
    const content = JSON.stringify(feedback);
    if (!toolCalls.length) {
        const reminderText = `场景规划协议纠错：${content}`;
        return {
            messages: sessionLoop
                ? []
                : [
                    {
                        role: 'assistant',
                        content: String(result?.text || ''),
                        providerPayload: result?.providerPayload,
                    },
                    { role: 'user', content: reminderText },
                ],
            toolResponses: [],
            finalAnswerReminderText: sessionLoop ? reminderText : '',
        };
    }
    return {
        messages: [
            buildProviderAssistantToolCallMessage(result, toolCalls, {
                fallbackPrefix: `scene-planner-attempt-${attempt}`,
            }),
            ...toolCalls.map((toolCall) => buildProviderToolResultMessage({
                toolCallId: toolCall.id,
                toolName: toolCall.name,
                content,
            })),
        ],
        toolResponses: toolCalls.map((toolCall) => ({
            id: toolCall.id,
            name: toolCall.name,
            response: feedback,
            ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerId')
                ? { providerId: String(toolCall.providerId || '') }
                : {}),
        })),
        finalAnswerReminderText: '',
    };
}

// limit 只用于要长期留在历史里的成功返回；校验失败那份要完整的 JSON（调试日志会解析它），不截断。
function captureDiagnosticModelOutput(result, { limit = Infinity } = {}) {
    const toolCalls = (Array.isArray(result?.toolCalls) ? result.toolCalls : []).map((toolCall) => ({
        name: String(toolCall?.name || ''),
        arguments: (() => {
            try {
                return cloneJson(toolCall?.arguments) ?? String(toolCall?.arguments ?? '');
            } catch {
                return String(toolCall?.arguments ?? '');
            }
        })(),
    }));
    let serialized;
    try {
        serialized = JSON.stringify({
            toolCalls,
            text: String(result?.text || ''),
            finishReason: String(result?.finishReason || ''),
            model: String(result?.model || ''),
            provider: String(result?.provider || ''),
            refused: result?.refused === true,
            thoughts: cloneJson(result?.thoughts),
            providerPayload: redactRequestSecrets(cloneJson(result?.providerPayload)),
            rawAssistantMessage: redactRequestSecrets(cloneJson(result?.rawAssistantMessage)),
            usage: cloneJson(result?.usage),
        });
    } catch (error) {
        serialized = JSON.stringify({
            captureError: String(error?.message || 'model output could not be serialized'),
            text: String(result?.text || ''),
        });
    }
    const truncated = serialized.length > limit;
    return {
        modelOutput: truncated ? serialized.slice(0, limit) : serialized,
        modelOutputTruncated: truncated,
    };
}

/** 历史记录的取舍：最近 recent 条全留，再往前的只补失败记录，直到失败总数达到 failures。records 按新到旧排列。 */
export function selectDiagnosticHistory(records, { recent = DIAGNOSTIC_HISTORY_RECENT, failures = DIAGNOSTIC_HISTORY_FAILURES } = {}) {
    const list = Array.isArray(records) ? records : [];
    const kept = list.slice(0, recent);
    let failureCount = kept.filter(record => record?.status === 'error').length;
    for (const record of list.slice(recent)) {
        if (failureCount >= failures) break;
        if (record?.status !== 'error') continue;
        kept.push(record);
        failureCount += 1;
    }
    return kept;
}

function recordDiagnosticHistory(snapshot) {
    const index = diagnosticHistory.findIndex(item => item.id === snapshot.id);
    if (index >= 0) diagnosticHistory[index] = snapshot;
    else diagnosticHistory.unshift(snapshot);
    diagnosticHistory = selectDiagnosticHistory(diagnosticHistory);
}

function buildValidationFailureRecord({ result, error, attempt, startedAt, durationMs, feedbackSent = false }) {
    return {
        attempt,
        startedAt,
        durationMs,
        errorCode: String(error?.code || ''),
        errorMessage: String(error?.message || ''),
        errorPath: String(error?.details?.path || ''),
        errorRule: String(error?.details?.rule || ''),
        received: cloneJson(error?.details?.received),
        expected: cloneJson(error?.details?.expected),
        toolCallCount: Array.isArray(result?.toolCalls) ? result.toolCalls.length : 0,
        toolNames: (Array.isArray(result?.toolCalls) ? result.toolCalls : [])
            .map((toolCall) => String(toolCall?.name || '')),
        feedbackSent,
        ...captureDiagnosticModelOutput(result),
    };
}

function createAbortScope(timeout, upstreamSignal) {
    const controller = new AbortController();
    let timedOut = false;
    const abortFromUpstream = () => controller.abort();
    if (upstreamSignal?.aborted) abortFromUpstream();
    upstreamSignal?.addEventListener?.('abort', abortFromUpstream, { once: true });
    const timer = setTimeout(() => {
        if (controller.signal.aborted) return;
        timedOut = true;
        controller.abort();
    }, normalizeScenePlannerTimeout(timeout));
    return {
        signal: controller.signal,
        isTimedOut: () => timedOut,
        cleanup() {
            clearTimeout(timer);
            upstreamSignal?.removeEventListener?.('abort', abortFromUpstream);
        },
    };
}

/**
 * A request-scoped diagnostic handle is created before prompt or configuration work so all
 * failures stay observable. The request id keeps an older request from replacing a newer one.
 */
export function beginDrawScenePlannerDiagnostic(initial = {}, onDiagnosticUpdate = null) {
    diagnosticSequence += 1;
    const id = diagnosticSequence;
    activeDiagnosticId = id;
    const record = {
        id,
        timestamp: Date.now(),
        durationMs: 0,
        stage: 'prompt',
        status: 'running',
        presetName: '',
        provider: '',
        model: '',
        toolMode: '',
        reasoningRequestedMode: 'inherit',
        reasoningRequestedOutput: 'hide',
        reasoningProfileId: 'unsupported',
        reasoningEffectiveMode: 'inherit',
        reasoningEffort: '',
        reasoningBudgetTokens: null,
        reasoningControlFields: {},
        reasoningOutputVisible: false,
        toolChoice: 'required',
        toolsCount: 1,
        attemptCount: 0,
        progress: {
            phase: 'analysis',
            current: 1,
            total: MAX_SCENE_PLANNER_ATTEMPTS,
        },
        correctionCount: 0,
        corrections: [],
        validationFailures: [],
        attempts: [],
        terminationReason: '',
        notices: [],
        ...initial,
    };

    const publish = () => {
        const snapshot = redactRequestSecrets({
            ...record,
            durationMs: Math.max(0, Date.now() - record.timestamp),
        });
        if (id === activeDiagnosticId) {
            lastDrawAgentDiagnostic = snapshot;
        }
        recordDiagnosticHistory(snapshot);
        try {
            onDiagnosticUpdate?.(cloneJson(snapshot));
        } catch (error) {
            console.warn('[Draw Scene Planner] 诊断进度回调失败:', error);
        }
    };
    publish();

    return {
        id,
        update(patch = {}) {
            Object.assign(record, patch);
            publish();
        },
        applyProviderConfig(providerConfig = {}) {
            Object.assign(record, {
                presetName: String(providerConfig.currentPresetName || ''),
                provider: String(providerConfig.provider || ''),
                model: String(providerConfig.model || ''),
                toolMode: String(providerConfig.toolMode || 'native'),
                reasoningRequestedMode: String(providerConfig.reasoning?.mode || 'inherit'),
                reasoningRequestedOutput: String(providerConfig.reasoning?.output || 'hide'),
                reasoningProfileId: String(providerConfig.reasoning?.profileId || 'unsupported'),
                reasoningEffectiveMode: String(providerConfig.reasoning?.mode || 'inherit'),
                reasoningEffort: String(providerConfig.reasoning?.effort || ''),
                reasoningBudgetTokens: providerConfig.reasoning?.budgetTokens !== undefined
                    && Number.isFinite(Number(providerConfig.reasoning.budgetTokens))
                    ? Number(providerConfig.reasoning.budgetTokens)
                    : null,
                reasoningControlFields: {},
                reasoningOutputVisible: providerConfig.reasoning?.mode !== 'off'
                    && providerConfig.reasoning?.output === 'show',
                notices: [],
            });
            publish();
        },
        succeed(patch = {}) {
            Object.assign(record, { status: 'success' }, patch);
            publish();
        },
        fail(error, patch = {}) {
            Object.assign(record, {
                status: 'error',
                errorCode: String(error?.code || 'SCENE_PLANNER_ERROR'),
                errorMessage: String(error?.message || '场景规划失败'),
            }, patch);
            publish();
        },
        snapshot() {
            return cloneJson(record);
        },
    };
}

export function assertDrawScenePlannerTask(task, diagnostic) {
    if (Array.isArray(task?.tools)
        && task.tools.length === 1
        && task.tools[0]?.function?.name === SUBMIT_SCENE_PLAN_TOOL_NAME) {
        return;
    }
    const error = new ScenePlannerError(
        'Scene Planner 必须且只能注册 submit_scene_plan。',
        'TOOL_CONTRACT_INVALID',
    );
    diagnostic?.fail(error, { stage: 'config' });
    throw error;
}

/**
 * Classification order is fixed: a typed domain error wins, then user cancellation, the Draw
 * timeout flag, then protocol parsing, an explicit provider timeout, and a generic provider error.
 */
function mapProviderError(error, abortScope, upstreamSignal) {
    if (error instanceof ScenePlannerError) return error;
    if (upstreamSignal?.aborted) {
        return new ScenePlannerError('场景规划已取消。', 'REQUEST_ABORTED', null, { cause: error });
    }
    if (abortScope.isTimedOut()) {
        return new ScenePlannerError('场景规划请求超时。', 'REQUEST_TIMEOUT', null, { cause: error });
    }
    if (error?.name === 'AbortError' || error?.code === 'ABORT_ERR') {
        return new ScenePlannerError('场景规划已取消。', 'REQUEST_ABORTED', null, { cause: error });
    }
    if (error?.code === 'DSML_TOOL_CALL_INVALID' || error?.code === 'TAGGED_TOOL_CALL_INVALID') {
        return new ScenePlannerError(error.message, error.code, { offset: error.offset }, { cause: error });
    }
    const timeoutText = `${error?.name || ''} ${error?.code || ''} ${error?.message || ''}`;
    if (/(?:time[ -]?out|timedout|etimedout)/i.test(timeoutText)) {
        return new ScenePlannerError('场景规划请求超时。', 'REQUEST_TIMEOUT', null, { cause: error });
    }
    return new ScenePlannerError(
        `Provider 请求失败：${error?.message || '未知错误'}`,
        'PROVIDER_REQUEST_FAILED',
        null,
        { cause: error },
    );
}

/**
 * Environment-neutral Scene Planner execution. Runtime owners must inject the resolved provider
 * configuration and Agent Core implementation; this module never reads browser settings.
 */
export async function callDrawScenePlannerAgentRuntime(options = {}) {
    const task = options.task || {};
    const diagnostic = options.diagnostic
        || beginDrawScenePlannerDiagnostic({}, options.onDiagnosticUpdate);
    assertDrawScenePlannerTask(task, diagnostic);
    if (options.diagnosticConfigStarted !== true) {
        diagnostic.update({ stage: 'config' });
    }

    const providerConfig = options.providerConfig;
    const agentCore = options.agentCore;
    if (!providerConfig || typeof providerConfig !== 'object'
        || !agentCore || typeof agentCore.createAgentAdapter !== 'function') {
        const error = new ScenePlannerError(
            'Scene Planner 执行器缺少已解析的 Provider 配置或 Agent Core。',
            'AGENT_CONTEXT_REQUIRED',
        );
        diagnostic.fail(error, { stage: 'config' });
        throw error;
    }
    diagnostic.applyProviderConfig(providerConfig);

    let adapter;
    try {
        adapter = agentCore.createAgentAdapter(providerConfig, {
            ...(Object.hasOwn(options, 'hostClient') ? { hostClient: options.hostClient } : {}),
        });
    } catch (rawError) {
        const error = new ScenePlannerError(
            rawError?.message || '共享 Agent Adapter 创建失败。',
            'AGENT_PRESET_INVALID',
            null,
            { cause: rawError },
        );
        diagnostic.fail(error, { stage: 'config' });
        throw error;
    }

    const abortScope = createAbortScope(options.timeout, options.signal);
    const baseAgentTask = {
        ...task,
        toolChoice: 'required',
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.maxTokens,
        reasoning: providerConfig.reasoning,
        captureRawAssistantMessage: true,
        signal: abortScope.signal,
    };
    delete baseAgentTask.onStreamProgress;
    delete baseAgentTask.onToolProtocolFallback;

    const messages = Array.isArray(task.messages) ? [...task.messages] : [];
    const corrections = [];
    const validationFailures = [];
    const attempts = [];
    const logContext = {
        requestId: diagnostic.id,
        presetName: String(providerConfig.currentPresetName || ''),
        provider: String(providerConfig.provider || ''),
        model: String(providerConfig.model || ''),
        toolMode: String(providerConfig.toolMode || ''),
    };
    let pendingToolResponses = null;
    let pendingFinalAnswerReminderText = '';
    let previousCorrectionSignature = '';
    try {
        for (let attempt = 1; attempt <= MAX_SCENE_PLANNER_ATTEMPTS; attempt += 1) {
            const agentTask = { ...baseAgentTask };
            if (pendingToolResponses?.length && adapter?.supportsSessionToolLoop) {
                delete agentTask.messages;
                agentTask.toolResponses = pendingToolResponses;
            } else if (pendingFinalAnswerReminderText && adapter?.supportsSessionToolLoop) {
                delete agentTask.messages;
                agentTask.finalAnswerReminderText = pendingFinalAnswerReminderText;
                pendingFinalAnswerReminderText = '';
            } else {
                agentTask.messages = messages;
                delete agentTask.toolResponses;
            }

            diagnostic.update({
                stage: attempt === 1 ? 'request' : 'correction',
                attemptCount: attempt,
                progress: {
                    phase: attempt === 1 ? 'analysis' : 'correction',
                    current: attempt,
                    total: MAX_SCENE_PLANNER_ATTEMPTS,
                },
                correctionCount: corrections.length,
                corrections,
            });

            const startedAt = Date.now();
            logScenePlannerDiagnostic('开始请求', { ...logContext, attempt, startedAt });
            let result;
            try {
                result = await adapter.chat(agentTask);
            } catch (rawError) {
                const error = mapProviderError(rawError, abortScope, options.signal);
                const protocolFailure = getScenePlannerErrorCategory(error) === ScenePlannerErrorCategory.TOOL_PROTOCOL;
                const inspection = cloneJson(rawError?.requestInspection);
                const rawAssistantMessage = redactRequestSecrets(cloneJson(rawError?.rawAssistantMessage));
                const failedAttempt = {
                    attempt,
                    startedAt,
                    durationMs: Math.max(0, Date.now() - startedAt),
                    errorCode: error.code,
                    // Transport error text may echo credentials; its retained copy is owned by the backend redactor.
                    ...(protocolFailure ? { errorMessage: error.message } : {}),
                    // A response that ended abnormally: keep what the provider actually said.
                    ...describeIncompleteResponse(rawError),
                    ...(Number.isInteger(error.details?.offset) ? { errorOffset: error.details.offset } : {}),
                    ...(rawAssistantMessage !== undefined ? { rawAssistantMessage } : {}),
                };
                attempts.push(failedAttempt);
                logScenePlannerDiagnostic('请求失败', { ...logContext, ...failedAttempt, errorMessage: error.message });
                diagnostic.fail(error, {
                    stage: protocolFailure ? 'parse' : 'request',
                    attempts,
                    terminationReason: protocolFailure
                        ? 'tool_protocol_error'
                        : error.code === 'REQUEST_TIMEOUT'
                            ? 'timeout'
                            : error.code === 'REQUEST_ABORTED'
                                ? 'abort'
                                : 'provider_error',
                    ...buildInspectionDiagnosticPatch(inspection),
                });
                throw error;
            }

            const validationToolCalls = resolveValidationToolCalls(result, providerConfig, attempt);
            const validationResult = validationToolCalls === result?.toolCalls
                ? result
                : { ...result, toolCalls: validationToolCalls };
            const inspection = cloneJson(result?.requestInspection);
            const attemptRecord = {
                attempt,
                startedAt,
                durationMs: Math.max(0, Date.now() - startedAt),
                toolCallCount: validationToolCalls.length,
                toolNames: validationToolCalls.map((toolCall) => String(toolCall?.name || '')).filter(Boolean),
                finishReason: String(result?.finishReason || ''),
                completion: result?.completion,
                truncated: result?.truncated,
                ...(result?.responseInfo !== undefined ? { responseInfo: redactRequestSecrets(cloneJson(result.responseInfo)) } : {}),
                // 成功的返回也留下来（界面的“返回”一节要看）；校验失败时同一份会进 validationFailures，那时从这里去掉避免重复。
                ...captureDiagnosticModelOutput(result, { limit: DIAGNOSTIC_MODEL_OUTPUT_MAX_CHARS }),
            };
            attempts.push(attemptRecord);
            logScenePlannerDiagnostic('请求完成', { ...logContext, ...attemptRecord });
            diagnostic.update({
                stage: 'request',
                ...buildInspectionDiagnosticPatch(inspection),
                attemptCount: attempt,
                toolCallCount: validationToolCalls.length,
                toolNames: validationToolCalls
                    .map((toolCall) => String(toolCall?.name || ''))
                    .filter(Boolean),
                finishReason: String(result?.finishReason || ''),
                attempts,
            });

            if (typeof options.validateResult !== 'function') {
                return { result: validationResult, providerConfig, diagnostic };
            }

            try {
                const parsed = await options.validateResult(validationResult, { providerConfig, attempt });
                const argumentRepair = parsed?.argumentRepair ? {
                    ...parsed.argumentRepair,
                    attempt,
                    originalArguments: validationToolCalls[0]?.arguments,
                } : null;
                if (argumentRepair) {
                    logScenePlannerArgumentsRepair(argumentRepair, logContext);
                }
                diagnostic.update({
                    stage: 'parse',
                    correctionCount: corrections.length,
                    corrections,
                    validationFailures,
                    terminationReason: 'success',
                    ...(argumentRepair ? { argumentRepair } : {}),
                });
                return { result: validationResult, providerConfig, diagnostic, parsed };
            } catch (error) {
                if (!isScenePlannerCorrectionError(error)) {
                    diagnostic.fail(error, { stage: 'parse', terminationReason: 'validation_error' });
                    throw error;
                }

                const signature = getScenePlannerCorrectionSignature(error);
                const repeated = signature === previousCorrectionSignature;
                const failureRecord = buildValidationFailureRecord({
                    result: validationResult,
                    error,
                    attempt,
                    startedAt,
                    durationMs: attemptRecord.durationMs,
                });
                validationFailures.push(failureRecord);
                delete attemptRecord.modelOutput;
                delete attemptRecord.modelOutputTruncated;
                logScenePlannerValidationFailure(failureRecord, logContext);
                diagnostic.update({
                    stage: 'correction',
                    correctionCount: corrections.length,
                    corrections,
                    validationFailures,
                    lastValidationErrorCode: String(error.code || ''),
                });
                if (repeated || attempt >= MAX_SCENE_PLANNER_ATTEMPTS) {
                    diagnostic.fail(error, {
                        stage: 'parse',
                        terminationReason: repeated ? 'repeated_error' : 'max_attempts',
                    });
                    throw error;
                }

                const correction = buildCorrectionTurn({
                    result: validationResult,
                    providerConfig,
                    error,
                    attempt,
                    sessionLoop: adapter?.supportsSessionToolLoop === true,
                });
                messages.push(...correction.messages);
                pendingToolResponses = correction.toolResponses;
                pendingFinalAnswerReminderText = correction.finalAnswerReminderText;
                failureRecord.feedbackSent = true;
                corrections.push({ ...failureRecord });
                previousCorrectionSignature = signature;
            }
        }
    } finally {
        abortScope.cleanup();
    }
}

export function getLastDrawAgentDiagnostic() {
    return cloneJson(lastDrawAgentDiagnostic);
}

/** 最近的场景规划记录，新到旧；每条是和 getLastDrawAgentDiagnostic 同样结构的诊断快照。 */
export function getDrawAgentDiagnosticHistory() {
    return cloneJson(diagnosticHistory) || [];
}

export function resetDrawAgentRuntimeForTests() {
    lastDrawAgentDiagnostic = null;
    diagnosticHistory = [];
    diagnosticSequence = 0;
    activeDiagnosticId = 0;
}
