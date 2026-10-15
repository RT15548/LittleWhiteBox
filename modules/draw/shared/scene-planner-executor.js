import {
    beginDrawScenePlannerDiagnostic,
    callDrawScenePlannerAgentRuntime,
} from './draw-agent-runtime.js';
import {
    ScenePlannerError,
    assertSubmitScenePlanTool,
    parseSubmittedScenePlan,
} from './scene-plan-contract.js';
import {
    computePlannerRetryDelay,
    isRetryablePlannerError,
    normalizePlannerRetry,
    sleepWithAbort,
} from './planner-retry.js';
import { logScenePlannerDiagnostic } from './scene-planner-debug.js';

// 最终失败时告诉用户“已经自动重试过几次”：消息末尾追加一句，details.retryCount 供程序读取。
// 只在确实重试过（N>0）时才加；不改错误码，也不影响是否重试的判定（判定发生在这之前）。
function annotateRetryCount(error, retryCount) {
    if (!(retryCount > 0) || !error || typeof error !== 'object') return error;
    const suffix = `（已自动重试 ${retryCount} 次）`;
    try {
        if (typeof error.message === 'string' && !error.message.endsWith(suffix)) error.message += suffix;
        const details = error.details;
        if (details == null || (typeof details === 'object' && !Array.isArray(details))) {
            error.details = { ...(details || {}), retryCount };
        }
    } catch {
        // 冻结的错误对象不允许改写：保持原样，诊断里仍有 retryCount。
    }
    return error;
}

function assertPreparedScenePlanner(prepared) {
    const prompt = prepared?.planner?.prompt;
    const validationContext = prepared?.planner?.validationContext;
    if (!prepared
        || prepared.version !== 1
        || !prompt
        || typeof prompt.systemPrompt !== 'string'
        || !Array.isArray(prompt.messages)
        || !validationContext?.sceneSource) {
        throw new ScenePlannerError('Scene Planner 预处理结果无效。', 'PREPARED_INPUT_INVALID');
    }
    assertSubmitScenePlanTool(prepared.planner.tool);
    return prepared;
}

/**
 * The browser supplies the model-facing tool. Execution validates images against
 * its own contract and frozen limits, independently of the supplied JSON schema.
 */
export function createPreparedScenePlannerTask(prepared) {
    const input = assertPreparedScenePlanner(prepared);
    return {
        systemPrompt: input.planner.prompt.systemPrompt,
        messages: input.planner.prompt.messages,
        tools: [input.planner.tool],
        toolChoice: 'required',
    };
}

// 每一轮 Agent 调用都从第 1 次尝试重新计数，并用自己的 attempts / validationFailures / corrections 整体覆盖诊断里的同名字段，
// 重试后前几轮的失败记录就丢了。这里包一层：已失败（并将重试）的轮次记录保留在前，
// 后续轮次的尝试号顺延（保证整份诊断里 attempt 唯一，后台 Draw Run 的日志去重签名含 attempt，号码相撞会被当成已记录），
// 并用 retry 标注它属于第几次重试。第一轮记录原样不动。
// 顺延量统一取“之前各轮已记录的 attempts 条数”，三个字段（以及 argumentRepair.attempt）用同一个偏移，彼此对得上。
function createAttemptPreservingDiagnostic(diagnostic) {
    const HISTORY_FIELDS = ['attempts', 'validationFailures', 'corrections'];
    let history = { attempts: [], validationFailures: [], corrections: [] };
    let visible = { attempts: [], validationFailures: [], corrections: [] };
    let callIndex = 0;
    // 重试请求进行期间一直显示“重试 n/m”：运行时每次 update 都会把 progress 写回 analysis / correction，
    // 这里在重试轮次里把它盖回重试进度，直到该轮成功或最终失败（succeed / fail 不带 progress，不受影响）。
    let retryProgress = null;
    // 运行时持有的当前轮原数组：它会在写进诊断之后继续改条目（例如校验失败后才把 feedbackSent 置 true）。
    // 重试轮里条目是拷贝，所以每次转发 / 开始下一轮前都要按原数组重新生成，否则拷贝会停在旧状态。
    let sources = {};
    const shift = (item, offset) => (callIndex === 0 ? item : {
        ...item,
        ...(Number.isInteger(item?.attempt) ? { attempt: item.attempt + offset } : {}),
        retry: callIndex,
    });
    const refreshVisible = () => {
        const offset = history.attempts.length;
        for (const field of HISTORY_FIELDS) {
            if (sources[field]) visible[field] = [...history[field], ...sources[field].map(item => shift(item, offset))];
        }
    };
    const withHistory = (patch) => {
        if (!patch || typeof patch !== 'object') return patch;
        const offset = history.attempts.length;
        const merged = { ...patch };
        for (const field of HISTORY_FIELDS) {
            if (Array.isArray(patch[field])) sources[field] = patch[field];
        }
        refreshVisible();
        for (const field of Object.keys(sources)) merged[field] = visible[field];
        // correctionCount 是当前这一轮的条数；合并后的 corrections 要用合并后的条数。
        if (Array.isArray(patch.corrections) && Number.isInteger(patch.correctionCount)) {
            merged.correctionCount = history.corrections.length + patch.correctionCount;
        }
        if (callIndex > 0 && Number.isInteger(patch.argumentRepair?.attempt)) {
            merged.argumentRepair = { ...patch.argumentRepair, attempt: patch.argumentRepair.attempt + offset };
        }
        return merged;
    };
    return {
        diagnostic: {
            ...diagnostic,
            update: (patch) => {
                const merged = withHistory(patch);
                return diagnostic.update(retryProgress && merged && typeof merged === 'object'
                    ? { ...merged, progress: retryProgress }
                    : merged);
            },
            succeed: patch => diagnostic.succeed(withHistory(patch)),
            fail: (error, patch) => diagnostic.fail(error, withHistory(patch)),
        },
        beginRetry(progress = null) {
            retryProgress = progress;
            refreshVisible();
            sources = {};
            history = { attempts: visible.attempts, validationFailures: visible.validationFailures, corrections: visible.corrections };
            callIndex += 1;
        },
    };
}

export async function executePreparedScenePlanner(prepared, options = {}) {
    const input = assertPreparedScenePlanner(prepared);
    const diagnostic = options.diagnostic
        || beginDrawScenePlannerDiagnostic({}, options.onDiagnosticUpdate);
    const task = createPreparedScenePlannerTask(input);
    const validationContext = input.planner.validationContext;
    const preparedProviderConfig = input.agent?.providerConfig || null;
    const logger = options.logger;
    const agentCaller = options.agentCaller || callDrawScenePlannerAgentRuntime;
    const parseResult = (result, providerConfig = {}) => {
        try {
            return parseSubmittedScenePlan(result, {
                sceneSource: validationContext.sceneSource,
                presentCharacters: input.planner.presentCharacters,
                maxImages: validationContext.effectiveMaxImages,
                maxPlanImages: validationContext.maxPlanImages,
                maxCharactersPerImage: validationContext.effectiveMaxCharactersPerImage,
                centerMode: validationContext.centerMode,
                presetName: providerConfig.currentPresetName,
                provider: providerConfig.provider,
                model: providerConfig.model,
            });
        } catch (error) {
            throw error instanceof ScenePlannerError
                ? error
                : new ScenePlannerError(
                    `场景计划校验失败：${error?.message || '未知错误'}`,
                    'TOOL_ARGUMENTS_SCHEMA_INVALID',
                    null,
                    { cause: error },
                );
        }
    };
    // 重试设置随 prepared.planner.retry 冻结提交，浏览器与后台 Draw Run 行为一致；缺省表示不重试。
    const retry = input.planner.retry ? normalizePlannerRetry(input.planner.retry) : { maxRetries: 0, baseDelayMs: 0 };
    const sleep = options.sleep || sleepWithAbort;
    const attemptTracker = createAttemptPreservingDiagnostic(diagnostic);
    let retryNumber = 0;
    let response;
    for (;;) {
        try {
            response = await agentCaller({
                task,
                timeout: options.timeout,
                signal: options.signal,
                diagnostic: attemptTracker.diagnostic,
                ...(options.agentOptions || {}),
                ...(options.agentCore ? { agentCore: options.agentCore } : {}),
                ...(Object.hasOwn(options, 'hostClient') ? { hostClient: options.hostClient } : {}),
                ...(preparedProviderConfig ? { providerConfig: preparedProviderConfig } : {}),
                validateResult: (result, context = {}) => parseResult(
                    result,
                    context.providerConfig || preparedProviderConfig || {},
                ),
            });
            break;
        } catch (error) {
            const canRetry = retryNumber < retry.maxRetries
                && !options.signal?.aborted
                && isRetryablePlannerError(error);
            if (canRetry) {
                retryNumber += 1;
                const failedAttempt = diagnostic.snapshot?.()?.attemptCount;
                attemptTracker.beginRetry({ phase: 'retry', current: retryNumber, total: retry.maxRetries });
                const delayMs = computePlannerRetryDelay(retryNumber, retry, options.random);
                (logger?.warn || logger?.info)?.call(logger, 'novelDrawLlm',
                    `Scene Planner 请求失败，${delayMs}ms 后进行第 ${retryNumber}/${retry.maxRetries} 次重试: ${error?.message || error}`,
                    { code: error?.code });
                // xbLog 默认不写 console，F12 看不到；和 scene-planner-debug 一样直接输出一行（console.log，不走被监控的 warn/error）。
                logScenePlannerDiagnostic(`请求失败，第 ${retryNumber}/${retry.maxRetries} 次重试将在 ${delayMs}ms 后开始`, {
                    requestId: diagnostic.id,
                    ...(Number.isInteger(failedAttempt) && failedAttempt > 0 ? { attempt: failedAttempt } : {}),
                    retry: retryNumber,
                    maxRetries: retry.maxRetries,
                    delayMs,
                    errorCode: String(error?.code || ''),
                });
                // 运行时在失败时已把诊断记为 error；等待期间改回 running，避免界面误报失败。
                diagnostic.update({
                    status: 'running',
                    stage: 'retry',
                    errorCode: '',
                    errorMessage: '',
                    terminationReason: '',
                    progress: { phase: 'retry', current: retryNumber, total: retry.maxRetries, delayMs },
                    retryCount: retryNumber,
                });
                try {
                    await sleep(delayMs, options.signal);
                    continue;
                } catch {
                    const aborted = new ScenePlannerError('场景规划已取消。', 'REQUEST_ABORTED', null, { cause: error });
                    diagnostic.fail(aborted, { stage: 'request', terminationReason: 'abort' });
                    throw aborted;
                }
            }
            logger?.error?.('novelDrawLlm', `Scene Planner 请求失败: ${error?.message || error}`, {
                code: error?.code,
                ...(retryNumber ? { retries: retryNumber } : {}),
            });
            if (error instanceof ScenePlannerError) {
                if (retryNumber) {
                    // 最终失败的错误带上已重试次数；诊断在运行时失败那一刻已按旧消息记过一次，这里用新消息重记，
                    // 这样胶囊详情 / 失败提示 / 诊断快照里都能看到。运行时没来得及记失败时（等待期间被改回 running）同时补上 stage。
                    annotateRetryCount(error, retryNumber);
                    const recorded = diagnostic.snapshot?.().status === 'error';
                    diagnostic.fail(error, recorded ? { retryCount: retryNumber } : { stage: 'request', retryCount: retryNumber });
                }
                throw error;
            }
            const wrapped = annotateRetryCount(new ScenePlannerError(
                `Scene Planner 请求失败：${error?.message || '未知错误'}`,
                'PROVIDER_REQUEST_FAILED',
                null,
                { cause: error },
            ), retryNumber);
            diagnostic.fail(wrapped, { stage: 'request', ...(retryNumber ? { retryCount: retryNumber } : {}) });
            throw wrapped;
        }
    }

    let parsed;
    try {
        parsed = response.parsed || parseResult(
            response.result,
            response.providerConfig || preparedProviderConfig || {},
        );
    } catch (error) {
        diagnostic.fail(error, { stage: 'parse' });
        throw error;
    }

    diagnostic.succeed({ stage: 'parse', imageTaskCount: parsed.tasks.length });
    logger?.info?.('novelDrawLlm', `submit_scene_plan 已接收 ${parsed.tasks.length} 个图片任务`, {
        provider: response.providerConfig?.provider,
        model: response.providerConfig?.model,
    });
    return parsed.tasks;
}
