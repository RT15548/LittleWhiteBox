import {
    beginDrawScenePlannerDiagnostic,
    callDrawScenePlannerAgentRuntime,
} from './draw-agent-runtime.js';
import {
    ScenePlannerError,
    createSubmitScenePlanTool,
    parseSubmittedScenePlan,
} from './scene-plan-contract.js';

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
    return prepared;
}

/**
 * The submit tool is an executor-owned protocol invariant. It is rebuilt from the
 * frozen validation constraints instead of trusting a browser-supplied schema.
 */
export function createPreparedScenePlannerTask(prepared) {
    const input = assertPreparedScenePlanner(prepared);
    const validationContext = input.planner.validationContext;
    return {
        systemPrompt: input.planner.prompt.systemPrompt,
        messages: input.planner.prompt.messages,
        tools: [createSubmitScenePlanTool({
            maxImages: validationContext.effectiveMaxImages,
            maxCharactersPerImage: validationContext.effectiveMaxCharactersPerImage,
            insertPointCount: validationContext.sceneSource.points?.length || 0,
            centerMode: validationContext.centerMode,
        })],
        toolChoice: 'required',
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
    let response;
    try {
        response = await agentCaller({
            task,
            timeout: options.timeout,
            signal: options.signal,
            diagnostic,
            ...(options.agentOptions || {}),
            ...(options.agentCore ? { agentCore: options.agentCore } : {}),
            ...(Object.hasOwn(options, 'hostClient') ? { hostClient: options.hostClient } : {}),
            ...(preparedProviderConfig ? { providerConfig: preparedProviderConfig } : {}),
            validateResult: (result, context = {}) => parseResult(
                result,
                context.providerConfig || preparedProviderConfig || {},
            ),
        });
    } catch (error) {
        logger?.error?.('novelDrawLlm', `Scene Planner 请求失败: ${error?.message || error}`, {
            code: error?.code,
        });
        if (error instanceof ScenePlannerError) throw error;
        const wrapped = new ScenePlannerError(
            `Scene Planner 请求失败：${error?.message || '未知错误'}`,
            'PROVIDER_REQUEST_FAILED',
            null,
            { cause: error },
        );
        diagnostic.fail(wrapped, { stage: 'request' });
        throw wrapped;
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
