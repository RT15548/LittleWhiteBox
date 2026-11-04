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
import { GOOGLE_SYNTHETIC_HISTORY_SIGNATURE } from './scene-planner-messages.js';
import { projectScenePlannerHostClaudeHistory } from './scene-planner-handoff.js';
import {
    MAX_CUSTOM_TOOL_CALLS,
    TOOL_RECORD_MAX_CHARS,
    clipText,
    toToolResponseObject,
} from './custom-tools.js';
import { logScenePlannerArgumentsRepair, logScenePlannerDiagnostic, logScenePlannerValidationFailure } from './scene-planner-debug.js';
import {
    buildProviderAssistantToolCallMessage,
    buildProviderToolResultMessage,
    resolveResultToolCalls,
} from '../../agent-core/runtime/protocol.js';

const DEFAULT_SCENE_PLANNER_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_SCENE_PLANNER_ATTEMPTS = 3;
export const SCENE_PLANNER_TOOL_CHOICE = 'auto';

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

function findBlockReason(rawError) {
    return rawError?.code === 'AGENT_RESPONSE_REFUSED' ? String(rawError.reason || 'refusal') : '';
}

// The transport error text stays out of the record (it may echo credentials); only the
// finish reason and the adapter's response summary describe an incomplete reply.
function describeIncompleteResponse(rawError) {
    if (rawError?.responseInfo === undefined && rawError?.code !== 'AGENT_RESPONSE_REFUSED') return {};
    const blockReason = findBlockReason(rawError);
    return {
        finishReason: String(rawError.reason || ''),
        ...(blockReason ? { blockReason } : {}),
        ...(rawError.responseInfo !== undefined ? { responseInfo: redactRequestSecrets(cloneJson(rawError.responseInfo)) } : {}),
    };
}

function resolveValidationToolCalls(result, providerConfig, attempt) {
    if (Array.isArray(result?.toolCalls) && result.toolCalls.length) return result.toolCalls;
    return resolveResultToolCalls(result, providerConfig, {
        fallbackPrefix: `scene-planner-attempt-${attempt}`,
        createId: (index) => `scene-planner-attempt-${attempt}-${index + 1}`,
    });
}

function resolveAttemptToolCalls(result, providerConfig, attempt) {
    return resolveResultToolCalls(result, providerConfig, {
        fallbackPrefix: `scene-planner-attempt-${attempt}`,
        createId: (index) => `scene-planner-attempt-${attempt}-${index + 1}`,
    });
}

// 把模型这一轮的工具调用连同“每个调用的结果”接回对话。respond(toolCall) → { content, response }：
// content 是 tool 消息的文本，response 给要求对象形式的 Session 适配器（Google）。
function buildToolResultTurn({ result, toolCalls, attempt, respond }) {
    return {
        messages: [
            buildProviderAssistantToolCallMessage(result, toolCalls, {
                fallbackPrefix: `scene-planner-attempt-${attempt}`,
            }),
            ...toolCalls.map((toolCall) => buildProviderToolResultMessage({
                toolCallId: toolCall.id,
                toolName: toolCall.name,
                content: respond(toolCall).content,
            })),
        ],
        toolResponses: toolCalls.map((toolCall) => ({
            id: toolCall.id,
            name: toolCall.name,
            response: respond(toolCall).response,
            ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerId')
                ? { providerId: String(toolCall.providerId || '') }
                : {}),
        })),
        finalAnswerReminderText: '',
    };
}

// customNames：与 submit_scene_plan 同一批返回的自定义工具调用没有执行，回一条说明，别让它们收到纠错文本。
function buildCorrectionTurn({ result, providerConfig, error, attempt, sessionLoop, customNames = new Set() }) {
    const toolCalls = resolveAttemptToolCalls(result, providerConfig, attempt);
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
    const skipped = { skipped: true, note: '与 submit_scene_plan 同一批调用，没有执行。' };
    return buildToolResultTurn({
        result,
        toolCalls,
        attempt,
        respond: (toolCall) => (customNames.has(toolCall.name)
            ? { content: JSON.stringify(skipped), response: skipped }
            : { content, response: feedback }),
    });
}

// 调用过自定义工具、最后却没有提交规划（比如“所有输出放进某个工具”的说明让模型把规划也写进了工具参数）：
// 报错和给模型的纠错都明确说“只调用了自定义工具”，而不是笼统的“没有解析到 Tool Call”。
function explainMissingSubmit(error, customCallsUsed) {
    if (!(customCallsUsed > 0) || error?.code !== 'TOOL_CALL_MISSING') return error;
    return new ScenePlannerError(
        '模型只调用了自定义工具，没有提交 submit_scene_plan。请在需要时先调用自定义工具，最后必须调用 submit_scene_plan 提交场景规划。',
        'TOOL_CALL_MISSING',
        error.details,
        { cause: error },
    );
}

function parseToolArguments(raw) {
    if (raw && typeof raw === 'object') return { args: raw };
    const text = String(raw ?? '').trim();
    if (!text) return { args: {} };
    try {
        return { args: JSON.parse(text) };
    } catch (error) {
        return { error: `参数不是合法的 JSON：${error?.message || '无法解析'}` };
    }
}

function clipRecordValue(value) {
    const text = typeof value === 'string' ? value : JSON.stringify(value);
    if (text === undefined) return undefined;
    return text.length > TOOL_RECORD_MAX_CHARS ? clipText(text, TOOL_RECORD_MAX_CHARS) : value;
}

// 执行模型这一轮的自定义工具调用。工具自己抛错不算规划失败：错误文本作为工具结果回给模型；
// 取消 / 总超时则向上抛。返回 { outputs: Map<调用 id, 文本>, records }。
async function runCustomToolCalls({ host, calls, attempt, signal }) {
    const outputs = new Map();
    const records = [];
    for (const call of calls) {
        const startedAt = Date.now();
        const parsed = parseToolArguments(call.arguments);
        let text;
        let failure = parsed.error || '';
        if (!failure) {
            try {
                text = await host.invoke(call.name, parsed.args, { signal });
            } catch (error) {
                if (signal?.aborted) throw error;
                failure = String(error?.message || error || '工具执行失败');
            }
        }
        const content = failure ? JSON.stringify({ error: failure }) : String(text ?? '');
        outputs.set(call.id, content);
        records.push({
            attempt,
            name: call.name,
            arguments: clipRecordValue(parsed.args ?? call.arguments),
            ...(failure ? { error: failure } : { result: clipRecordValue(content) }),
            durationMs: Math.max(0, Date.now() - startedAt),
        });
    }
    return { outputs, records };
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
        toolChoice: SCENE_PLANNER_TOOL_CHOICE,
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

// 工具表 = submit_scene_plan + 与 customTools 一一对应的自定义工具（没有宿主就不允许有自定义工具）。
export function assertDrawScenePlannerTask(task, diagnostic, { customTools = [] } = {}) {
    const names = (Array.isArray(task?.tools) ? task.tools : []).map(tool => tool?.function?.name);
    if (names.length === customTools.length + 1
        && names[0] === SUBMIT_SCENE_PLAN_TOOL_NAME
        && customTools.every((tool, index) => tool?.name === names[index + 1])) {
        return;
    }
    const error = new ScenePlannerError(
        customTools.length
            ? 'Scene Planner 的工具表必须是 submit_scene_plan 加上已启用的自定义工具。'
            : 'Scene Planner 必须且只能注册 submit_scene_plan。',
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
        return new ScenePlannerError(error.message, error.code, {
            offset: error.offset,
            ...(error.extraFields ? { extraFields: error.extraFields } : {}),
        }, { cause: error });
    }
    const blockReason = findBlockReason(error);
    if (blockReason) {
        const finish = error.reason && error.reason !== blockReason ? `（finish: ${error.reason}）` : '';
        return new ScenePlannerError(`供应商拦截了内容：${blockReason}${finish}`, 'PROVIDER_REQUEST_FAILED', null, { cause: error });
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

// 自定义工具只有在同时给了定义和宿主时才生效；后台 Draw Run 不会给宿主，也就永远不会执行用户代码。
export function resolveRunCustomTools(options = {}, diagnostic = null) {
    const definitions = Array.isArray(options.customTools) ? options.customTools : [];
    if (!definitions.length) return [];
    if (typeof options.customToolHost?.invoke !== 'function') {
        const error = new ScenePlannerError(
            '请求结构里有启用的“附带工具”，需要在浏览器里运行；后台任务不会执行自定义代码。',
            'CUSTOM_TOOL_HOST_MISSING',
        );
        diagnostic?.fail(error, { stage: 'config' });
        throw error;
    }
    return definitions;
}

/**
 * Environment-neutral Scene Planner execution. Runtime owners must inject the resolved provider
 * configuration and Agent Core implementation; this module never reads browser settings.
 */
export async function callDrawScenePlannerAgentRuntime(options = {}) {
    const task = options.task || {};
    const diagnostic = options.diagnostic
        || beginDrawScenePlannerDiagnostic({}, options.onDiagnosticUpdate);
    const customTools = resolveRunCustomTools(options, diagnostic);
    assertDrawScenePlannerTask(task, diagnostic, { customTools });
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

    const sourceMessages = Array.isArray(task.messages) ? task.messages : [];
    const messages = providerConfig.provider === 'sillytavern-claude'
        ? projectScenePlannerHostClaudeHistory(sourceMessages)
        : [...sourceMessages];
    const abortScope = createAbortScope(options.timeout, options.signal);
    const baseAgentTask = {
        ...task,
        toolChoice: SCENE_PLANNER_TOOL_CHOICE,
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.maxTokens,
        reasoning: providerConfig.reasoning,
        captureRawAssistantMessage: true,
        signal: abortScope.signal,
    };
    delete baseAgentTask.onStreamProgress;
    delete baseAgentTask.onToolProtocolFallback;

    // Google's OpenAI endpoint uses a different signature field for artificial history.
    // Keep this projection out of the stored prompt and out of other providers' requests.
    if (providerConfig.toolMode !== 'tagged-json'
        && ['openai-compatible', 'sillytavern-openai-compatible'].includes(providerConfig.provider)
        && /gemini/i.test(String(providerConfig.model || ''))) {
        messages.forEach((message, index) => {
            const synthetic = message.providerPayload?.googleContent?.parts?.some(part => (
                part.functionCall && part.thoughtSignature === GOOGLE_SYNTHETIC_HISTORY_SIGNATURE
            ));
            if (!synthetic) return;
            messages[index] = {
                ...message,
                tool_calls: message.tool_calls.map(call => ({
                    ...call,
                    extra_content: { google: { thought_signature: GOOGLE_SYNTHETIC_HISTORY_SIGNATURE } },
                })),
            };
        });
    }
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
    // 自定义工具：模型只调了工具、没提交规划的那一轮不占纠错次数（toolRounds 把循环上限顺延），总调用次数另设上限。
    const customHost = options.customToolHost;
    const customByName = new Map(customTools.map(tool => [tool.name, tool]));
    const customRecords = [];
    let customCallsUsed = 0;
    let toolRounds = 0;
    if (customTools.length) diagnostic.update({ toolsCount: 1 + customTools.length, customToolCalls: [], customToolCallCount: 0 });
    try {
        for (let attempt = 1; attempt <= MAX_SCENE_PLANNER_ATTEMPTS + toolRounds; attempt += 1) {
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
                    ...(failedAttempt.blockReason ? { blockReason: failedAttempt.blockReason } : {}),
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
            let validationResult = validationToolCalls === result?.toolCalls
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

            // 自定义工具调用：只调了工具 → 执行后把结果接回对话，让模型继续；和 submit_scene_plan 同批 → 不执行，只校验提交。
            const customCalls = customByName.size
                ? validationToolCalls.filter(toolCall => customByName.has(toolCall?.name))
                : [];
            const customNamesInReply = new Set(customCalls.map(toolCall => toolCall.name));
            if (customCalls.length) {
                const toolOnly = !validationToolCalls.some(toolCall => !customByName.has(toolCall?.name));
                if (toolOnly && customCallsUsed + customCalls.length > MAX_CUSTOM_TOOL_CALLS) {
                    const limitError = new ScenePlannerError(
                        `模型只调用了自定义工具（${Array.from(customNamesInReply).join('、')}），没有提交 submit_scene_plan，调用次数已超过上限（${MAX_CUSTOM_TOOL_CALLS} 次），已停止。`,
                        'CUSTOM_TOOL_LIMIT_EXCEEDED',
                    );
                    diagnostic.fail(limitError, { stage: 'request', terminationReason: 'custom_tool_limit' });
                    throw limitError;
                }
                if (toolOnly) {
                    customCallsUsed += customCalls.length;
                    const resolvedCalls = resolveAttemptToolCalls(result, providerConfig, attempt)
                        .filter(toolCall => customByName.has(toolCall?.name));
                    let ran;
                    try {
                        ran = await runCustomToolCalls({ host: customHost, calls: resolvedCalls, attempt, signal: abortScope.signal });
                    } catch (rawError) {
                        const error = mapProviderError(rawError, abortScope, options.signal);
                        diagnostic.fail(error, {
                            stage: 'request',
                            terminationReason: error.code === 'REQUEST_TIMEOUT' ? 'timeout' : error.code === 'REQUEST_ABORTED' ? 'abort' : 'provider_error',
                        });
                        throw error;
                    }
                    for (const record of ran.records) {
                        if (!customByName.get(record.name)?.stealth) customRecords.push(record);
                    }
                    diagnostic.update({ customToolCalls: customRecords, customToolCallCount: customCallsUsed });
                    const turn = buildToolResultTurn({
                        result,
                        toolCalls: resolvedCalls,
                        attempt,
                        respond: (toolCall) => {
                            const content = ran.outputs.get(toolCall.id) ?? '';
                            return { content, response: toToolResponseObject(content) };
                        },
                    });
                    messages.push(...turn.messages);
                    pendingToolResponses = turn.toolResponses;
                    pendingFinalAnswerReminderText = '';
                    toolRounds += 1;
                    continue;
                }
                validationResult = { ...validationResult, toolCalls: validationToolCalls.filter(toolCall => !customByName.has(toolCall?.name)) };
            }

            if (typeof options.validateResult !== 'function') {
                return { result: validationResult, providerConfig, diagnostic };
            }

            try {
                const parsed = await options.validateResult(validationResult, { providerConfig, attempt });
                const argumentRepair = parsed?.argumentRepair ? {
                    ...parsed.argumentRepair,
                    attempt,
                    originalArguments: validationResult.toolCalls[0]?.arguments,
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
            } catch (validationError) {
                const error = explainMissingSubmit(validationError, customCallsUsed);
                if (!isScenePlannerCorrectionError(error)) {
                    diagnostic.fail(error, { stage: 'parse', terminationReason: 'validation_error' });
                    throw error;
                }

                const signature = getScenePlannerCorrectionSignature(error);
                const repeated = signature === previousCorrectionSignature;
                const failureRecord = buildValidationFailureRecord({
                    result,
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
                if (repeated || attempt - toolRounds >= MAX_SCENE_PLANNER_ATTEMPTS) {
                    diagnostic.fail(error, {
                        stage: 'parse',
                        terminationReason: repeated ? 'repeated_error' : 'max_attempts',
                    });
                    throw error;
                }

                const correction = buildCorrectionTurn({
                    // 校验只看提交工具，协议回放仍须为本轮所有调用逐一回复。
                    result,
                    providerConfig,
                    error,
                    attempt,
                    sessionLoop: adapter?.supportsSessionToolLoop === true,
                    customNames: customNamesInReply,
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
