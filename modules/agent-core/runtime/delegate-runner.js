import {
    buildProviderAssistantToolCallMessage,
    hasVisibleText,
    resolveResultToolCalls,
} from './protocol.js';

const DEFAULT_MAX_DELEGATE_ROUNDS = 16;
const RESULT_SUMMARY_LIMIT = 420;
const TRACE_SUMMARY_LIMIT = 240;
const MAX_TOOL_TRACE_ITEMS = 24;

function normalizeText(value = '', limit = 4000) {
    const text = String(value || '').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function normalizeInlineText(value = '', limit = 400) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function escapeRegExp(text = '') {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeJsonStringify(value) {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value || '');
    }
}

function normalizeDelegateArgs(args = {}) {
    return {
        task: normalizeText(args.task, 6000),
        context: normalizeText(args.context, Number.POSITIVE_INFINITY),
        deliverable: normalizeText(args.deliverable, 3000),
    };
}

function getToolName(definition = {}) {
    return String(definition?.function?.name || '').trim();
}

function isPlanToolName(name = '', toolNames = {}) {
    return [
        toolNames.PLAN_CREATE,
        toolNames.PLAN_UPDATE,
        toolNames.PLAN_LIST,
        toolNames.PLAN_GET,
    ].includes(String(name || '').trim());
}

function isDelegateBlockedToolName(name = '', toolNames = {}) {
    const normalized = String(name || '').trim();
    return !normalized || normalized === toolNames.DELEGATE_RUN || isPlanToolName(normalized, toolNames);
}

export function filterDelegateToolDefinitions(toolDefinitions = [], toolNames = {}) {
    return (Array.isArray(toolDefinitions) ? toolDefinitions : [])
        .filter((definition) => !isDelegateBlockedToolName(getToolName(definition), toolNames));
}

function stripPromptSubsection(prompt = '', heading = '') {
    const escapedHeading = escapeRegExp(heading);
    const pattern = new RegExp(`(^|\\n)## ${escapedHeading}\\n[\\s\\S]*?(?=\\n## |\\n# |$)`, 'g');
    return String(prompt || '')
        .replace(pattern, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function buildDelegateBasePrompt(basePrompt = '') {
    let prompt = normalizeText(basePrompt, 80000);
    ['Using Plans', 'Using Delegates'].forEach((heading) => {
        prompt = stripPromptSubsection(prompt, heading);
    });
    return prompt;
}

function buildDelegateSystemPrompt(basePrompt = '') {
    return [
        buildDelegateBasePrompt(basePrompt),
        [
            '# 子任务执行规则',
            ' - 只处理 [Task] 里的子任务；[Context] 和 [Expected deliverable] 是主助手显式交给你的背景和边界。',
            ' - 不默认知道主对话、[Current context]、[Current plans] 或主助手未写出的推理。',
            ' - 需要查证或改动时使用可用工具；不要和用户闲聊。',
            ' - 不创建或更新计划，也不再委派其他子任务。',
            ' - 最终回复给主助手，写清结论、依据、改动、风险和未解决点。',
            ' - 信息不足时说明缺口，不编造。',
        ].join('\n'),
    ].filter(Boolean).join('\n\n');
}

function buildDelegateUserPrompt(args = {}) {
    const sections = [
        ['[Task]', args.task],
        ['[Context]', args.context],
        ['[Expected deliverable]', args.deliverable],
    ].filter(([, text]) => text);

    return sections
        .map(([title, text]) => `${title}\n${text}`)
        .join('\n\n')
        .trim();
}

function summarizeToolArguments(args = {}) {
    if (!args || typeof args !== 'object') return '';
    const parts = [];
    ['path', 'filePath', 'fromPath', 'toPath', 'pattern', 'command', 'purpose', 'id', 'title'].forEach((key) => {
        if (typeof args[key] === 'string' && args[key].trim()) {
            parts.push(`${key}: ${normalizeInlineText(args[key], 120)}`);
        }
    });
    if (typeof args.patchText === 'string') {
        parts.push(`patchLength: ${args.patchText.length}`);
    }
    return parts.join('; ');
}

function summarizeToolResult(result = {}) {
    if (!result || typeof result !== 'object') return normalizeInlineText(result, TRACE_SUMMARY_LIMIT);
    return normalizeInlineText(
        result.summary
        || result.message
        || result.note
        || result.error
        || result.path
        || result.command
        || '',
        TRACE_SUMMARY_LIMIT,
    );
}

function buildToolTraceEntry(toolCall = {}, args = {}, result = {}) {
    const ok = !(result && typeof result === 'object' && result.ok === false);
    return {
        name: String(toolCall.name || ''),
        ok,
        args: summarizeToolArguments(args),
        error: ok ? '' : String(result?.error || 'tool_failed'),
        summary: summarizeToolResult(result),
    };
}

function emitDelegateProgress(parentRun = {}, event = {}) {
    if (typeof parentRun.onDelegateProgress !== 'function') return;
    try {
        parentRun.onDelegateProgress(event);
    } catch {
        // Progress is UI-only; never let it affect delegate execution.
    }
}

function summarizeResult(text = '') {
    return normalizeInlineText(text, RESULT_SUMMARY_LIMIT);
}

function buildUnavailableToolResult(toolName = '') {
    return {
        ok: false,
        error: 'delegate_tool_not_available',
        toolName: String(toolName || '').trim(),
        message: '该工具不在子任务工具列表中。',
    };
}

function buildRoundLimitResult(rounds = 0, toolCallCount = 0, toolTrace = []) {
    return {
        ok: false,
        status: 'round_limit',
        result: '',
        summary: '子任务达到工具轮次上限，已停止。',
        rounds,
        toolCallCount,
        toolTrace: toolTrace.slice(-MAX_TOOL_TRACE_ITEMS),
        error: 'delegate_round_limit',
    };
}

export function createDelegateRunner(deps = {}) {
    const {
        createAdapter,
        executeToolCall,
        getActiveProviderConfig,
        getDelegateProviderConfig,
        getSystemPrompt,
        resolveToolDefinitions,
        safeJsonParse,
        isAbortError,
        TOOL_NAMES,
    } = deps;
    const maxRounds = Math.max(1, Number(deps.maxRounds) || DEFAULT_MAX_DELEGATE_ROUNDS);

    async function runDelegate(args = {}, parentRun = {}) {
        const normalizedArgs = normalizeDelegateArgs(args);
        if (!normalizedArgs.task) {
            return {
                ok: false,
                status: 'failed',
                result: '',
                summary: '子任务缺少 task。',
                rounds: 0,
                toolCallCount: 0,
                toolTrace: [],
                error: 'delegate_task_required',
            };
        }

        const providerConfig = typeof getDelegateProviderConfig === 'function'
            ? getDelegateProviderConfig(parentRun)
            : getActiveProviderConfig({ role: 'delegate' });
        const adapter = createAdapter(providerConfig);
        const systemPrompt = buildDelegateSystemPrompt(getSystemPrompt());
        const tools = filterDelegateToolDefinitions(resolveToolDefinitions(), TOOL_NAMES);
        const allowedToolNames = new Set(tools.map(getToolName).filter(Boolean));
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: buildDelegateUserPrompt(normalizedArgs) },
        ];
        const toolTrace = [];
        let toolCallCount = 0;
        let rounds = 0;
        let sawToolExecution = false;
        let finalAnswerReminderSent = false;
        let pendingToolResponses = null;
        let pendingFinalAnswerReminderText = '';
        const absorbStreamProgress = () => {};
        emitDelegateProgress(parentRun, {
            type: 'started',
            summary: '审稿分身已启动。',
        });

        while (rounds < maxRounds) {
            if (parentRun?.controller?.signal?.aborted) {
                throw new Error('assistant_aborted');
            }

            rounds += 1;
            emitDelegateProgress(parentRun, {
                type: 'round_start',
                round: rounds,
                maxRounds,
                summary: `第 ${rounds} 轮思考中。`,
            });
            const requestTask = {
                systemPrompt,
                tools,
                toolChoice: 'auto',
                temperature: providerConfig.temperature,
                maxTokens: providerConfig.maxTokens,
                reasoning: providerConfig.reasoning,
                signal: parentRun?.controller?.signal,
                // 分身不直接渲染 token，但内部走流式可以避免长任务被中转当成无响应请求切断。
                onStreamProgress: absorbStreamProgress,
            };

            if (Array.isArray(pendingToolResponses) && pendingToolResponses.length && adapter?.supportsSessionToolLoop) {
                requestTask.toolResponses = pendingToolResponses;
            } else if (pendingFinalAnswerReminderText && adapter?.supportsSessionToolLoop) {
                requestTask.finalAnswerReminderText = pendingFinalAnswerReminderText;
                pendingFinalAnswerReminderText = '';
            } else {
                requestTask.messages = messages;
            }

            let result;
            try {
                result = await adapter.chat(requestTask);
            } catch (error) {
                if (typeof isAbortError === 'function' && isAbortError(error)) {
                    throw error;
                }
                return {
                    ok: false,
                    status: 'failed',
                    result: '',
                    summary: '子任务模型请求失败。',
                    rounds,
                    toolCallCount,
                    toolTrace: toolTrace.slice(-MAX_TOOL_TRACE_ITEMS),
                    error: String(error?.message || error || 'delegate_model_failed'),
                };
            }

            const toolCalls = resolveResultToolCalls(result, providerConfig, {
                fallbackPrefix: 'delegate-tool',
            });
            emitDelegateProgress(parentRun, {
                type: 'model_result',
                round: rounds,
                toolCallCount: toolCalls.length,
                textLength: String(result?.text || '').length,
                summary: toolCalls.length
                    ? `第 ${rounds} 轮返回 ${toolCalls.length} 个工具调用。`
                    : `第 ${rounds} 轮正在形成审稿结论。`,
            });
            if (toolCalls.length) {
                pendingToolResponses = null;
                sawToolExecution = true;
                toolCallCount += toolCalls.length;
                messages.push(buildProviderAssistantToolCallMessage(result, toolCalls, {
                    fallbackPrefix: 'delegate-tool',
                }));

                const toolResponses = [];
                for (const toolCall of toolCalls) {
                    if (parentRun?.controller?.signal?.aborted) {
                        throw new Error('assistant_aborted');
                    }
                    const parsedArguments = safeJsonParse(toolCall.arguments, {});
                    let toolResult;
                    if (!allowedToolNames.has(toolCall.name)) {
                        toolResult = buildUnavailableToolResult(toolCall.name);
                    } else {
                        emitDelegateProgress(parentRun, {
                            type: 'tool_start',
                            round: rounds,
                            toolName: toolCall.name,
                            args: parsedArguments,
                            argsSummary: summarizeToolArguments(parsedArguments),
                            summary: `${toolCall.name} ${summarizeToolArguments(parsedArguments) || ''}`.trim(),
                        });
                        toolResult = await executeToolCall(toolCall, parsedArguments, parentRun);
                    }
                    messages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: safeJsonStringify(toolResult),
                    });
                    const traceEntry = buildToolTraceEntry(toolCall, parsedArguments, toolResult);
                    toolTrace.push(traceEntry);
                    emitDelegateProgress(parentRun, {
                        type: 'tool_result',
                        round: rounds,
                        toolName: toolCall.name,
                        ok: traceEntry.ok,
                        argsSummary: traceEntry.args,
                        summary: traceEntry.summary || `${toolCall.name} 已返回。`,
                        error: traceEntry.error,
                    });
                    toolResponses.push({
                        id: toolCall.id,
                        name: toolCall.name,
                        response: toolResult,
                        ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerId')
                            ? { providerId: String(toolCall.providerId || '') }
                            : {}),
                    });
                }
                if (adapter?.supportsSessionToolLoop) {
                    pendingToolResponses = toolResponses;
                }
                continue;
            }

            pendingToolResponses = null;
            if (!hasVisibleText(result?.text) && sawToolExecution && !finalAnswerReminderSent) {
                finalAnswerReminderSent = true;
                const reminder = '你已经拿到了本轮全部工具结果。现在不要再调用任何工具，直接给出子任务结论。';
                if (adapter?.supportsSessionToolLoop) {
                    pendingFinalAnswerReminderText = reminder;
                } else {
                    messages.push({ role: 'system', content: reminder });
                }
                continue;
            }

            if (!hasVisibleText(result?.text)) {
                const summary = sawToolExecution
                    ? '子任务工具已执行完成，但模型没有生成结论。'
                    : '子任务没有拿到有效回复。';
                return {
                    ok: false,
                    status: 'failed',
                    result: '',
                    summary,
                    rounds,
                    toolCallCount,
                    toolTrace: toolTrace.slice(-MAX_TOOL_TRACE_ITEMS),
                    error: 'delegate_empty_result',
                };
            }

            const resultText = String(result.text).trim();
            emitDelegateProgress(parentRun, {
                type: 'completed',
                round: rounds,
                summary: '审稿分身已完成，正在交回结果。',
            });
            return {
                ok: true,
                status: 'completed',
                result: resultText,
                summary: summarizeResult(resultText),
                rounds,
                toolCallCount,
                toolTrace: toolTrace.slice(-MAX_TOOL_TRACE_ITEMS),
                error: '',
            };
        }

        return buildRoundLimitResult(rounds, toolCallCount, toolTrace);
    }

    return {
        runDelegate,
    };
}
