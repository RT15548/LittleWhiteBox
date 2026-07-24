import { analyzeJavaScriptApiRequest } from '../runtime-src/jsapi-runtime.js';
import { createDelegateRunner } from '../../agent-core/runtime/delegate-runner.js';
import { runTavilySearchTool } from '../../agent-core/tavily-search.js';
import {
    buildProviderMessagesFromHistory,
    filterThoughtsForTurn,
    hasVisibleText,
    resolveResultToolCalls,
} from '../../agent-core/runtime/protocol.js';
import { createApprovalController } from './runtime/approvals.js';
import { createContextStatsController } from './runtime/context-stats.js';
import { createHostToolRequestController } from './runtime/host-tool-requests.js';
import { createHistoryCompactionController, splitMessagesIntoTurns } from './runtime/history-compaction.js';
import { createStreamingMessageController } from './runtime/streaming-messages.js';

const JSAPI_MANIFEST_URL = new URL('../st-jsapi-manifest.json', import.meta.url);
let jsApiManifestPromise = null;

function normalizeJsApiRequestKind(value) {
    return ['inspect', 'read', 'effect', 'unknown'].includes(value) ? value : 'unknown';
}

function shouldRequireJsApiApproval(requestKind = 'unknown') {
    return ['effect', 'unknown'].includes(normalizeJsApiRequestKind(requestKind));
}

function buildJsApiAnalysisFallback(error) {
    const message = error instanceof Error ? error.message : String(error || 'jsapi_analysis_failed');
    return {
        requestKind: 'unknown',
        usedApis: [],
        calledApis: [],
        validationErrors: [`jsapi_analysis_failed:${message}`],
        analysisError: message,
    };
}

async function loadJsApiManifest() {
    if (!jsApiManifestPromise) {
        jsApiManifestPromise = fetch(JSAPI_MANIFEST_URL, {
            cache: 'no-cache',
        }).then(async (response) => {
            if (!response.ok) {
                throw new Error(`jsapi_manifest_load_failed:${response.status}`);
            }
            return await response.json();
        }).catch((error) => {
            jsApiManifestPromise = null;
            throw error;
        });
    }
    return await jsApiManifestPromise;
}

export function createAssistantRuntime(deps) {
    const {
        state,
        pendingToolCalls,
        pendingApprovals,
        persistSession,
        render,
        showToast,
        post,
        createRequestId,
        safeJsonParse,
        describeError,
        formatToolResultDisplay,
        buildTextWithAttachmentSummary,
        buildUserContentParts,
        normalizeAttachments,
        normalizeThoughtBlocks,
        normalizeSlashCommand,
        normalizeSlashSkillTrigger,
        shouldRequireSlashCommandApproval,
        buildSlashApprovalResult,
        buildJsApiApprovalResult,
        isAbortError,
        createAdapter,
        getToolDefinitions,
        isJsApiEnabled,
        getActiveProviderConfig,
        getDelegateProviderConfig,
        getSystemPrompt,
        getEphemeralUserContextText,
        SYSTEM_PROMPT,
        SUMMARY_SYSTEM_PROMPT,
        HISTORY_SUMMARY_PREFIX,
        MAX_CONTEXT_TOKENS,
        SUMMARY_TRIGGER_TOKENS,
        HISTORY_SUMMARY_MAX_TOKENS,
        DEFAULT_PRESERVED_TURNS,
        MIN_PRESERVED_TURNS,
        MAX_TOOL_ROUNDS,
        REQUEST_TIMEOUT_MS,
        TOOL_DEFINITIONS,
        TOOL_NAMES,
    } = deps;

    function resolveToolDefinitions(options = {}) {
        if (typeof getToolDefinitions === 'function') {
            return getToolDefinitions(options);
        }
        return TOOL_DEFINITIONS;
    }

    function isJsApiToolEnabled() {
        if (typeof isJsApiEnabled === 'function') {
            return !!isJsApiEnabled();
        }
        return true;
    }

    function buildJsApiPermissionDeniedResult() {
        return {
            ok: false,
            error: 'jsapi_permission_denied',
            message: '用户在设置中关闭了 RunJavaScriptApi 权限。',
        };
    }

    function resolveSystemPrompt() {
        const prompt = typeof getSystemPrompt === 'function' ? getSystemPrompt() : SYSTEM_PROMPT;
        return String(prompt || SYSTEM_PROMPT).trim() || SYSTEM_PROMPT;
    }

    function resetCompactionState() {
        state.historySummary = '';
        state.archivedTurnCount = 0;
        state.contextStats = {
            usedTokens: 0,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive: false,
        };
    }

    function buildHistorySummarySystemMessage() {
        if (!state.historySummary?.trim()) return null;
        return {
            role: 'system',
            content: `${HISTORY_SUMMARY_PREFIX}\n${state.historySummary.trim()}`,
        };
    }

    function buildRepeatedToolErrorSystemMessage() {
        const hint = state.activeRun?.lightBrakeMessage;
        if (!hint) return null;
        return {
            role: 'system',
            content: hint,
        };
    }

    function dropStreamingAssistantMessage(message) {
        if (!message) return;
        const index = state.messages.indexOf(message);
        if (index === -1) return;
        state.messages.splice(index, 1);
        persistSession();
        render();
    }

    function trimForSummary(text, limit = 1800) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        if (normalized.length <= limit) return normalized;
        return `${normalized.slice(0, limit)}…`;
    }

    function buildToolResultMessage({ toolCallId, toolName, toolResult }) {
        return {
            role: 'tool',
            toolCallId,
            toolName,
            content: JSON.stringify(toolResult, null, 2),
        };
    }

    function getCurrentTurnMessages() {
        const turns = splitMessagesIntoTurns();
        return turns.length ? turns[turns.length - 1] : [];
    }

    function filterThoughtsForCurrentTurn(thoughts = [], currentMessage = null) {
        return filterThoughtsForTurn(thoughts, getCurrentTurnMessages(), {
            currentMessage,
        });
    }
    const {
        buildContextMeterLabel,
        forceUpdateContextStats,
        updateContextStats,
    } = createContextStatsController({
        state,
        render,
        getActiveProviderConfig,
        getToolDefinitions: resolveToolDefinitions,
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
    });

    function pushMessage(message) {
        state.messages.push({
            ...message,
            attachments: normalizeAttachments(message.attachments),
            thoughts: message?.role === 'assistant'
                ? filterThoughtsForCurrentTurn(message.thoughts)
                : normalizeThoughtBlocks(message.thoughts),
        });
        persistSession();
    }

    const {
        createStreamingAssistantMessage,
        finalizeStreamingAssistantMessage,
        scheduleStreamRender,
        updateStreamingAssistantMessage,
    } = createStreamingMessageController({
        state,
        render,
        persistSession,
        createRequestId,
        filterThoughtsForCurrentTurn,
    });

    const {
        clearPendingApprovals,
        requestJsApiApproval,
        requestSkillGenerationApproval,
        requestSlashCommandApproval,
    } = createApprovalController({
        state,
        render,
        pendingApprovals,
        createRequestId,
        normalizeJsApiRequestKind,
    });

    const {
        buildToolFailureResult,
        callHostTool,
        clearPendingToolCalls,
        postHostToolCallWithoutResponse,
        recordToolErrorForLightBrake,
        resetToolErrorLightBrake,
    } = createHostToolRequestController({
        state,
        post,
        pendingToolCalls,
        createRequestId,
        REQUEST_TIMEOUT_MS,
        describeError,
        flushBeforeToolCall: deps.flushPendingWorkspaceChanges,
    });

    function cancelActiveRun(notice = '本轮请求已终止。') {
        const run = state.activeRun;
        if (!run) return;
        run.cancelNotice = notice;
        state.progressLabel = '终止中';
        clearPendingToolCalls(run.id, new Error('tool_aborted'));
        clearPendingApprovals(run.id, new Error('tool_aborted'));
        run.controller.abort();
        render();
    }

    function toProviderMessages(baseMessages = state.messages, options = {}) {
        const messages = [{ role: 'system', content: resolveSystemPrompt() }];
        const summaryMessage = buildHistorySummarySystemMessage();
        const lightBrakeMessage = buildRepeatedToolErrorSystemMessage();
        const finalAnswerReminder = String(options.finalAnswerReminderText || '').trim();
        if (summaryMessage) messages.push(summaryMessage);
        if (lightBrakeMessage) messages.push(lightBrakeMessage);
        if (finalAnswerReminder) {
            messages.push({
                role: 'system',
                content: finalAnswerReminder,
            });
        }
        const latestUserMessage = getLatestUserMessage(baseMessages);
        const ephemeralUserContextText = Object.prototype.hasOwnProperty.call(options, 'userContextSnapshotText')
            ? String(options.userContextSnapshotText || '').trim()
            : (
                typeof getEphemeralUserContextText === 'function'
                    ? String(getEphemeralUserContextText() || '').trim()
                    : ''
            );
        messages.push(...buildProviderMessagesFromHistory(baseMessages, {
            includeMessage: (message) => !message?.approvalRequest,
            buildUserContent: (message) => buildUserContentParts({
                ...message,
                contextPrefix: message === latestUserMessage ? ephemeralUserContextText : '',
            }),
        }));
        return messages;
    }

    const {
        ensureContextBudget,
        getActiveContextMessages,
    } = createHistoryCompactionController({
        state,
        render,
        persistSession,
        showToast,
        getActiveProviderConfig,
        formatToolResultDisplay,
        buildTextWithAttachmentSummary,
        trimForSummary,
        SUMMARY_SYSTEM_PROMPT,
        DEFAULT_PRESERVED_TURNS,
        MIN_PRESERVED_TURNS,
        SUMMARY_TRIGGER_TOKENS,
        HISTORY_SUMMARY_MAX_TOKENS,
        buildContextMeterLabel,
        forceUpdateContextStats,
        toProviderMessages,
    });

    function getLatestUserMessage(messages = state.messages) {
        for (let index = (messages || []).length - 1; index >= 0; index -= 1) {
            const message = messages[index];
            if (message?.approvalRequest) continue;
            if (message?.role === 'user') {
                return message;
            }
        }
        return null;
    }

    function buildEnabledSlashSkillMatches(slashTrigger) {
        const normalizedTrigger = normalizeSlashSkillTrigger(slashTrigger);
        if (!normalizedTrigger) {
            return {
                normalizedTrigger: '',
                matches: [],
            };
        }

        const skills = Array.isArray(state.runtime?.skillsCatalog?.skills)
            ? state.runtime.skillsCatalog.skills
            : [];
        const matches = skills.filter((skill) => (
            skill
            && skill.enabled !== false
            && Array.isArray(skill.slashTriggers)
            && skill.slashTriggers.includes(normalizedTrigger)
        ));

        return {
            normalizedTrigger,
            matches,
        };
    }

    async function maybeAutoReadSlashSkill(run) {
        const latestUserMessage = getLatestUserMessage();
        if (!latestUserMessage) return null;
        const rawContent = String(latestUserMessage.content || '').trim();
        if (!rawContent.startsWith('/')) return null;

        const normalizedTrigger = normalizeSlashSkillTrigger(rawContent);
        if (!normalizedTrigger) return null;

        const { matches } = buildEnabledSlashSkillMatches(normalizedTrigger);
        if (!matches.length) return null;

        if (matches.length > 1) {
            showToast(`命令 ${normalizedTrigger} 对应了多条已启用 skill，本轮已跳过自动读取。`);
            return null;
        }

        const matchedSkill = matches[0];
        const toolCallId = createRequestId('auto-read-skill');
        pushMessage({
            role: 'assistant',
            content: '',
            toolCalls: [{
                id: toolCallId,
                name: TOOL_NAMES.READ_SKILL,
                arguments: JSON.stringify({ id: matchedSkill.id }),
            }],
        });
        render();

        state.progressLabel = '工具中';
        render();

        let toolResult;
        try {
            toolResult = await callHostTool(TOOL_NAMES.READ_SKILL, { id: matchedSkill.id }, {
                runId: run.id,
                signal: run.controller.signal,
            });
        } catch (error) {
            toolResult = buildToolFailureResult(TOOL_NAMES.READ_SKILL, { id: matchedSkill.id }, error);
        }

        pushMessage(buildToolResultMessage({
            toolCallId,
            toolName: TOOL_NAMES.READ_SKILL,
            toolResult,
        }));
        render();

        if (toolResult?.ok === false) {
            showToast(`自动读取 skill 失败：${toolResult.message || toolResult.error || matchedSkill.id}`);
            return null;
        }

        return toolResult;
    }

    let delegateRunner = null;

    function getDelegateRunner() {
        if (!delegateRunner) {
            delegateRunner = createDelegateRunner({
                createAdapter,
                getActiveProviderConfig,
                getDelegateProviderConfig,
                getSystemPrompt: resolveSystemPrompt,
                resolveToolDefinitions: () => resolveToolDefinitions({ role: 'delegate' }),
                safeJsonParse,
                isAbortError,
                TOOL_NAMES,
                executeToolCall: async (toolCall, parsedArguments, run) => await executeAssistantToolCall(toolCall, parsedArguments, run, {
                    allowDelegate: false,
                    trackToolErrors: false,
                    role: 'delegate',
                }),
            });
        }
        return delegateRunner;
    }

    async function runDelegateTool(args, run) {
        return await getDelegateRunner().runDelegate(args, run);
    }

    async function executeAssistantToolCall(toolCall, parsedArguments, run, options = {}) {
        const slashCommand = toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND
            ? normalizeSlashCommand(parsedArguments.command)
            : '';
        const isJsApiRun = toolCall.name === TOOL_NAMES.RUN_JAVASCRIPT_API;
        const trackToolErrors = options.trackToolErrors !== false;
        let jsApiAnalysis = null;
        let toolResult = null;

        try {
            if (toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND && shouldRequireSlashCommandApproval(slashCommand)) {
                state.progressLabel = '确认中';
                render();
                const approved = await requestSlashCommandApproval(slashCommand, {
                    runId: run.id,
                    signal: run.controller.signal,
                });
                if (!approved) {
                    toolResult = buildSlashApprovalResult(slashCommand, false);
                }
            }

            if (isJsApiRun && !toolResult) {
                if (!isJsApiToolEnabled()) {
                    toolResult = buildJsApiPermissionDeniedResult();
                }
            }

            if (isJsApiRun && !toolResult) {
                try {
                    const manifest = await loadJsApiManifest();
                    jsApiAnalysis = analyzeJavaScriptApiRequest({
                        code: parsedArguments.code,
                        apiPaths: Array.isArray(parsedArguments.apiPaths) ? parsedArguments.apiPaths : [],
                        manifest,
                    });
                } catch (error) {
                    console.warn('[Assistant] JS API 请求预分析失败:', error);
                    jsApiAnalysis = buildJsApiAnalysisFallback(error);
                }

                const jsApiNeedsApproval = !(
                    jsApiAnalysis
                    && Array.isArray(jsApiAnalysis.validationErrors)
                    && jsApiAnalysis.validationErrors.length > 0
                ) && shouldRequireJsApiApproval(jsApiAnalysis?.requestKind || 'unknown');

                if (jsApiNeedsApproval) {
                    state.progressLabel = '确认中';
                    render();
                    const approved = await requestJsApiApproval(parsedArguments, jsApiAnalysis || {}, {
                        runId: run.id,
                        signal: run.controller.signal,
                    });
                    if (!approved) {
                        toolResult = buildJsApiApprovalResult(
                            parsedArguments,
                            false,
                            jsApiAnalysis?.requestKind || 'unknown',
                        );
                    }
                }
            }

            if (toolCall.name === TOOL_NAMES.GENERATE_SKILL && String(parsedArguments.action || '').trim() === 'propose') {
                state.progressLabel = '确认中';
                render();
                const approved = await requestSkillGenerationApproval(parsedArguments, {
                    runId: run.id,
                    signal: run.controller.signal,
                });
                if (!approved) {
                    toolResult = {
                        ok: true,
                        action: 'propose',
                        approved: false,
                        skipped: true,
                        title: String(parsedArguments.title || '').trim(),
                        note: '用户未同意生成 skill，本次已跳过。',
                    };
                }
            }

            if (!toolResult) {
                if (toolCall.name === TOOL_NAMES.DELEGATE_RUN) {
                    if (options.allowDelegate === false) {
                        toolResult = {
                            ok: false,
                            error: 'delegate_recursion_disabled',
                            message: '子任务不能继续调用 DelegateRun。',
                        };
                    } else {
                        toolResult = await runDelegateTool(parsedArguments, run);
                    }
                } else if (toolCall.name === TOOL_NAMES.WEB_SEARCH) {
                    const providerConfig = options.role === 'delegate'
                        ? getDelegateProviderConfig?.(run)
                        : getActiveProviderConfig();
                    toolResult = await runTavilySearchTool(providerConfig || {}, parsedArguments, {
                        signal: run.controller.signal,
                        isAbortError,
                    });
                } else {
                    toolResult = await callHostTool(toolCall.name, parsedArguments, {
                        runId: run.id,
                        signal: run.controller.signal,
                    });
                }
            }

            if (toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND && slashCommand && toolResult?.ok !== false && shouldRequireSlashCommandApproval(slashCommand)) {
                toolResult = {
                    ...toolResult,
                    approval: buildSlashApprovalResult(slashCommand, true),
                };
            }

            if (
                isJsApiRun
                && toolResult?.ok !== false
                && jsApiAnalysis
                && Array.isArray(jsApiAnalysis.validationErrors)
                && jsApiAnalysis.validationErrors.length === 0
                && shouldRequireJsApiApproval(jsApiAnalysis.requestKind || 'unknown')
            ) {
                toolResult = {
                    ...toolResult,
                    approval: buildJsApiApprovalResult(
                        parsedArguments,
                        true,
                        jsApiAnalysis?.requestKind || toolResult?.requestKind || 'unknown',
                    ),
                };
            }

            if (isJsApiRun && jsApiAnalysis?.analysisError) {
                toolResult = {
                    ...toolResult,
                    preflightWarning: `JS API 请求预分析失败：${jsApiAnalysis.analysisError}`,
                };
            }

            if (trackToolErrors) {
                if (toolResult?.ok === false && toolResult?.skipped !== true) {
                    const slashExecutionError = toolResult?.execution && typeof toolResult.execution === 'object'
                        ? String(toolResult.execution.errorMessage || toolResult.execution.abortReason || '').trim()
                        : '';
                    recordToolErrorForLightBrake(run, toolCall.name, slashExecutionError || toolResult.error || 'tool_failed');
                } else {
                    resetToolErrorLightBrake(run);
                }
            }
            return toolResult;
        } catch (error) {
            if (isAbortError(error)) {
                throw error;
            }
            const failure = buildToolFailureResult(toolCall.name, parsedArguments, error);
            if (trackToolErrors) {
                recordToolErrorForLightBrake(run, toolCall.name, failure.error);
            }
            return failure;
        }
    }

    async function runAssistantLoop(run) {
        const adapter = createAdapter();
        let rounds = 0;
        let pendingToolResponses = null;
        let pendingFinalAnswerReminderText = '';
        let sawToolExecution = false;
        let finalAnswerReminderSent = false;
        const providerMessageOptions = {
            userContextSnapshotText: String(run?.userContextSnapshotText || '').trim(),
            finalAnswerReminderText: '',
        };

        await maybeAutoReadSlashSkill(run);

        while (rounds < MAX_TOOL_ROUNDS) {
            if (run.controller.signal.aborted) {
                throw new Error('assistant_aborted');
            }

            rounds += 1;
            state.currentRound = rounds;
            state.progressLabel = '生成中';
            render();

            const providerConfig = getActiveProviderConfig();
            let streamingAssistantMessage = null;
            const handleStreamProgress = (snapshot = {}) => {
                const hasText = typeof snapshot.text === 'string';
                const hasThoughts = Array.isArray(snapshot.thoughts);
                if (!hasText && !hasThoughts) return;
                if (!streamingAssistantMessage) {
                    streamingAssistantMessage = createStreamingAssistantMessage();
                }
                updateStreamingAssistantMessage(streamingAssistantMessage, {
                    ...(hasText ? { content: snapshot.text } : {}),
                    ...(hasThoughts ? { thoughts: snapshot.thoughts } : {}),
                });
                scheduleStreamRender();
            };

            let result;
            try {
                const requestTask = {
                    systemPrompt: resolveSystemPrompt(),
                    tools: resolveToolDefinitions({ role: 'main' }),
                    toolChoice: 'auto',
                    temperature: providerConfig.temperature,
                    maxTokens: providerConfig.maxTokens,
                    reasoning: {
                        enabled: providerConfig.reasoningEnabled,
                        effort: providerConfig.reasoningEffort,
                    },
                    signal: run.controller.signal,
                    onStreamProgress: handleStreamProgress,
                };

                if (Array.isArray(pendingToolResponses) && pendingToolResponses.length && adapter?.supportsSessionToolLoop) {
                    requestTask.toolResponses = pendingToolResponses;
                } else if (pendingFinalAnswerReminderText && adapter?.supportsSessionToolLoop) {
                    requestTask.finalAnswerReminderText = pendingFinalAnswerReminderText;
                    pendingFinalAnswerReminderText = '';
                } else {
                    requestTask.messages = await ensureContextBudget(adapter, run.controller.signal, providerMessageOptions);
                }

                console.info('[Assistant][ModelRequest] round:start', {
                    round: rounds,
                    provider: String(providerConfig?.provider || ''),
                    model: String(providerConfig?.model || ''),
                    toolMode: String(providerConfig?.toolMode || ''),
                    reasoningEnabled: !!providerConfig?.reasoningEnabled,
                    reasoningEffort: String(providerConfig?.reasoningEffort || ''),
                    usesSessionToolLoop: !!adapter?.supportsSessionToolLoop,
                    usesToolResponses: Array.isArray(requestTask.toolResponses) && requestTask.toolResponses.length > 0,
                    toolResponseCount: Array.isArray(requestTask.toolResponses) ? requestTask.toolResponses.length : 0,
                    usesFinalAnswerReminder: !!requestTask.finalAnswerReminderText,
                    messageCount: Array.isArray(requestTask.messages) ? requestTask.messages.length : 0,
                });
                result = await adapter.chat(requestTask);
                console.info('[Assistant][ModelRequest] round:result', {
                    round: rounds,
                    provider: String(providerConfig?.provider || ''),
                    finishReason: String(result?.finishReason || ''),
                    textLength: typeof result?.text === 'string' ? result.text.length : 0,
                    toolCallCount: Array.isArray(result?.toolCalls) ? result.toolCalls.length : 0,
                    hasProviderPayload: !!(result?.providerPayload && typeof result.providerPayload === 'object'),
                    providerPayloadKeys: result?.providerPayload && typeof result.providerPayload === 'object'
                        ? Object.keys(result.providerPayload).sort()
                        : [],
                });
            } catch (error) {
                console.error('[Assistant][ModelRequest] round:error', {
                    round: rounds,
                    provider: String(providerConfig?.provider || ''),
                    model: String(providerConfig?.model || ''),
                    message: error instanceof Error ? error.message : String(error || ''),
                });
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage);
                }
                throw error;
            }

            const resolvedToolCalls = resolveResultToolCalls(result, providerConfig);

            if (resolvedToolCalls.length) {
                pendingToolResponses = null;
                sawToolExecution = true;
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                        content: result.text || '',
                        thoughts: result.thoughts,
                        toolCalls: resolvedToolCalls,
                        providerPayload: result.providerPayload,
                    });
                } else {
                    pushMessage({
                        role: 'assistant',
                        content: result.text || '',
                        toolCalls: resolvedToolCalls,
                        thoughts: result.thoughts,
                        providerPayload: result.providerPayload,
                    });
                }
                render();

                const toolResponses = [];
                for (const toolCall of resolvedToolCalls) {
                    if (run.controller.signal.aborted) {
                        throw new Error('assistant_aborted');
                    }
                    const parsedArguments = safeJsonParse(toolCall.arguments, {});
                    state.progressLabel = '工具中';
                    render();
                    const toolResult = await executeAssistantToolCall(toolCall, parsedArguments, run);
                    pushMessage(buildToolResultMessage({
                        toolCallId: toolCall.id,
                        toolName: toolCall.name,
                        toolResult,
                    }));
                    toolResponses.push({
                        id: toolCall.id,
                        name: toolCall.name,
                        response: toolResult,
                        ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerId')
                            ? { providerId: toolCall.providerId }
                            : {}),
                    });
                    render();
                }
                if (adapter?.supportsSessionToolLoop) {
                    pendingToolResponses = toolResponses;
                }
                continue;
            }

            pendingToolResponses = null;
            if (!hasVisibleText(result.text) && sawToolExecution && !finalAnswerReminderSent) {
                finalAnswerReminderSent = true;
                const finalAnswerReminderText = '你已经拿到了本轮全部工具结果。现在不要再调用任何工具，直接用自然语言给出最终答复。';
                if (adapter?.supportsSessionToolLoop) {
                    pendingFinalAnswerReminderText = finalAnswerReminderText;
                    providerMessageOptions.finalAnswerReminderText = '';
                } else {
                    providerMessageOptions.finalAnswerReminderText = finalAnswerReminderText;
                }
                dropStreamingAssistantMessage(streamingAssistantMessage);
                continue;
            }
            const fallbackContent = sawToolExecution
                ? '工具已执行完成，但模型没有生成最终答复。'
                : '没有拿到有效回复。';
            if (streamingAssistantMessage) {
                finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                    content: result.text || fallbackContent,
                    thoughts: result.thoughts,
                    providerPayload: result.providerPayload,
                });
            } else {
                pushMessage({
                    role: 'assistant',
                    content: result.text || fallbackContent,
                    thoughts: result.thoughts,
                    providerPayload: result.providerPayload,
                });
            }
            state.progressLabel = '';
            render();
            return;
        }

        pushMessage({
            role: 'assistant',
            content: `这轮工具调用已经到上限了（${MAX_TOOL_ROUNDS}/${MAX_TOOL_ROUNDS}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`,
        });
        state.progressLabel = '';
        render();
    }

    return {
        resetCompactionState,
        buildContextMeterLabel,
        updateContextStats,
        pushMessage,
        cancelActiveRun,
        toProviderMessages,
        getActiveContextMessages,
        runAssistantLoop,
        callHostTool,
        postHostToolCallWithoutResponse,
    };
}
