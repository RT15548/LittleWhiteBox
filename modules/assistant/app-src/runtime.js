import { analyzeJavaScriptApiRequest } from '../runtime-src/jsapi-runtime.js';
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
        getActiveProviderConfig,
        getSystemPrompt,
        getEphemeralUserContextText,
        SYSTEM_PROMPT,
        SUMMARY_SYSTEM_PROMPT,
        HISTORY_SUMMARY_PREFIX,
        MAX_CONTEXT_TOKENS,
        SUMMARY_TRIGGER_TOKENS,
        DEFAULT_PRESERVED_TURNS,
        MIN_PRESERVED_TURNS,
        MAX_TOOL_ROUNDS,
        REQUEST_TIMEOUT_MS,
        TOOL_DEFINITIONS,
        TOOL_NAMES,
    } = deps;
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

    function trimForSummary(text, limit = 1800) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        if (normalized.length <= limit) return normalized;
        return `${normalized.slice(0, limit)}…`;
    }

    function clearHistoricalThoughts() {
        let changed = false;
        state.messages = state.messages.map((message) => {
            if (message?.role !== 'assistant') {
                return message;
            }
            const hasThoughts = Array.isArray(message.thoughts) && message.thoughts.length;
            const hasProviderPayload = !!message.providerPayload;
            if (!hasThoughts && !hasProviderPayload) return message;
            changed = true;
            return {
                ...message,
                thoughts: [],
                providerPayload: undefined,
            };
        });
        return changed;
    }

    function getCurrentTurnMessages() {
        const turns = splitMessagesIntoTurns();
        return turns.length ? turns[turns.length - 1] : [];
    }

    function filterThoughtsForCurrentTurn(thoughts = [], currentMessage = null) {
        const normalized = normalizeThoughtBlocks(thoughts);
        if (!normalized.length) return normalized;
        const existingKeys = new Set();
        getCurrentTurnMessages().forEach((message) => {
            if (message === currentMessage || message?.role !== 'assistant') return;
            normalizeThoughtBlocks(message.thoughts).forEach((item) => {
                existingKeys.add(`${item.label}\u0000${item.text}`);
            });
        });
        return normalized.filter((item) => !existingKeys.has(`${item.label}\u0000${item.text}`));
    }
    const {
        buildContextMeterLabel,
        forceUpdateContextStats,
        updateContextStats,
    } = createContextStatsController({
        state,
        render,
        getActiveProviderConfig,
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
    });

    function pushMessage(message) {
        if (message?.role === 'user') {
            clearHistoricalThoughts();
        }
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
        recordToolErrorForLightBrake,
        resetToolErrorLightBrake,
    } = createHostToolRequestController({
        state,
        post,
        pendingToolCalls,
        createRequestId,
        REQUEST_TIMEOUT_MS,
        describeError,
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
        if (summaryMessage) messages.push(summaryMessage);
        if (lightBrakeMessage) messages.push(lightBrakeMessage);
        const latestUserMessage = getLatestUserMessage(baseMessages);
        const ephemeralUserContextText = Object.prototype.hasOwnProperty.call(options, 'userContextSnapshotText')
            ? String(options.userContextSnapshotText || '').trim()
            : (
                typeof getEphemeralUserContextText === 'function'
                    ? String(getEphemeralUserContextText() || '').trim()
                    : ''
            );
        for (const message of baseMessages) {
            if (message?.approvalRequest) {
                continue;
            }
            if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
                messages.push({
                    role: 'assistant',
                    content: message.content || '',
                    providerPayload: message.providerPayload,
                    tool_calls: message.toolCalls.map((toolCall) => ({
                        id: toolCall.id,
                        type: 'function',
                        function: {
                            name: toolCall.name,
                            arguments: toolCall.arguments,
                        },
                    })),
                });
                continue;
            }

            if (message.role === 'tool') {
                messages.push({
                    role: 'tool',
                    tool_call_id: message.toolCallId,
                    content: message.content,
                });
                continue;
            }

            messages.push({
                role: message.role,
                providerPayload: message.providerPayload,
                content: message.role === 'user'
                    ? buildUserContentParts({
                        ...message,
                        contextPrefix: message === latestUserMessage ? ephemeralUserContextText : '',
                    })
                    : message.content,
            });
        }
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

        pushMessage({
            role: 'tool',
            toolCallId,
            toolName: TOOL_NAMES.READ_SKILL,
            content: JSON.stringify(toolResult, null, 2),
        });
        render();

        if (toolResult?.ok === false) {
            showToast(`自动读取 skill 失败：${toolResult.message || toolResult.error || matchedSkill.id}`);
            return null;
        }

        return toolResult;
    }

    async function runAssistantLoop(run) {
        const adapter = createAdapter();
        let rounds = 0;
        let pendingToolResponses = null;
        const providerMessageOptions = {
            userContextSnapshotText: String(run?.userContextSnapshotText || '').trim(),
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
                    tools: TOOL_DEFINITIONS,
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
                } else {
                    requestTask.messages = await ensureContextBudget(adapter, run.controller.signal, providerMessageOptions);
                }

                result = await adapter.chat(requestTask);
            } catch (error) {
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage);
                }
                throw error;
            }

            if (Array.isArray(result.toolCalls) && result.toolCalls.length) {
                pendingToolResponses = null;
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                        content: result.text || '',
                        thoughts: result.thoughts,
                        toolCalls: result.toolCalls,
                        providerPayload: result.providerPayload,
                    });
                } else {
                    pushMessage({
                        role: 'assistant',
                        content: result.text || '',
                        toolCalls: result.toolCalls,
                        thoughts: result.thoughts,
                        providerPayload: result.providerPayload,
                    });
                }
                render();

                const toolResponses = [];
                for (const toolCall of result.toolCalls) {
                    if (run.controller.signal.aborted) {
                        throw new Error('assistant_aborted');
                    }
                    const parsedArguments = safeJsonParse(toolCall.arguments, {});
                    const slashCommand = toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND
                        ? normalizeSlashCommand(parsedArguments.command)
                        : '';
                    const isJsApiRun = toolCall.name === TOOL_NAMES.RUN_JAVASCRIPT_API;
                    let jsApiAnalysis = null;
                    let toolResult = null;
                    state.progressLabel = '工具中';
                    render();
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
                            toolResult = await callHostTool(toolCall.name, parsedArguments, {
                                runId: run.id,
                                signal: run.controller.signal,
                            });
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

                        if (toolResult?.ok === false && toolResult?.skipped !== true) {
                            const slashExecutionError = toolResult?.execution && typeof toolResult.execution === 'object'
                                ? String(toolResult.execution.errorMessage || toolResult.execution.abortReason || '').trim()
                                : '';
                            recordToolErrorForLightBrake(run, toolCall.name, slashExecutionError || toolResult.error || 'tool_failed');
                        } else {
                            resetToolErrorLightBrake(run);
                        }
                    } catch (error) {
                        if (isAbortError(error)) {
                            throw error;
                        }
                        toolResult = buildToolFailureResult(toolCall.name, parsedArguments, error);
                        recordToolErrorForLightBrake(run, toolCall.name, toolResult.error);
                    }
                    pushMessage({
                        role: 'tool',
                        toolCallId: toolCall.id,
                        toolName: toolCall.name,
                        content: JSON.stringify(toolResult, null, 2),
                    });
                    toolResponses.push({
                        id: toolCall.id,
                        name: toolCall.name,
                        response: toolResult,
                    });
                    render();
                }
                if (adapter?.supportsSessionToolLoop) {
                    pendingToolResponses = toolResponses;
                }
                continue;
            }

            pendingToolResponses = null;
            if (streamingAssistantMessage) {
                finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                    content: result.text || '没有拿到有效回复。',
                    thoughts: result.thoughts,
                    providerPayload: result.providerPayload,
                });
            } else {
                pushMessage({
                    role: 'assistant',
                    content: result.text || '没有拿到有效回复。',
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
    };
}
