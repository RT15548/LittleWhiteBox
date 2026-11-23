import { currentHistorySummary, compactionPosition } from './state/compaction-history.js';
import { pluginAsset } from '../../../core/build-assets.js';
import { analyzeJavaScriptApiRequest } from '../runtime-src/jsapi-runtime.js';
import { JSAPI_CANCEL_NOTICE } from '../shared/jsapi-contract.js';
import { withAssistantJsApiManifest } from '../shared/extension-jsapi-manifest.ts';
import { createDelegateRunner } from '../../agent-core/runtime/delegate-runner.js';
import { agentErrorGuidance } from '../../agent-core/runtime/error-guidance.js';
import { runWebSearchTool, runWebFetchTool } from '../../agent-core/web/tools.js';
import { isWebTool } from './tooling.js';
import { createWebResults } from '../../agent-core/runtime/web-results.js';
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
import { settleAssistantRunFailure } from './runtime/run-failure.js';
import { callReadableWorkspaceTool } from '../shared/workspace-tool-paths.js';
import { filterSkillTools, isSkillTool, loadedSkillIds } from '../shared/skill-tools.js';
import { createResponseDelivery, DELIVERY_FINAL_STEP, isDeliveryTool, TOOL_DELIVER } from '../plugins/delivery/protocol.js';

const JSAPI_MANIFEST_URL = pluginAsset('modules/assistant/st-jsapi-manifest.json');
let jsApiManifestPromise = null;

function normalizeJsApiRequestKind(value) {
    return ['inspect', 'read', 'effect', 'unknown'].includes(value) ? value : 'unknown';
}

function shouldRequireJsApiApproval(requestKind = 'unknown', permissionMode = 'default') {
    return permissionMode !== 'full' && ['effect', 'unknown'].includes(normalizeJsApiRequestKind(requestKind));
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
            return withAssistantJsApiManifest(await response.json());
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
        HISTORY_SUMMARY_PREFIX,
        MAX_CONTEXT_TOKENS,
        SUMMARY_TRIGGER_TOKENS,
        REQUEST_TIMEOUT_MS,
        TOOL_DEFINITIONS,
        TOOL_NAMES,
    } = deps;

    const toolActivity = new WeakMap();
    function setToolActivity(call, run, phase) {
        toolActivity.set(call, { run, phase });
    }
    function getToolActivity(call) {
        const activity = toolActivity.get(call);
        if (!activity) return null;
        if (state.activeRun === activity.run && !activity.run.controller.signal.aborted) return activity.phase;
        if (activity.phase !== 'running') return 'not-executed';
        return call.name === TOOL_NAMES.GREP || isWebTool(call.name) || call.name === TOOL_NAMES.TOOL_RESULT_READ ? 'stopped' : 'unconfirmed';
    }
    function advanceToolActivity(call, run, phase) {
        if (toolActivity.has(call)) {
            setToolActivity(call, run, phase);
            render();
        }
    }

    function resolveToolDefinitions(options = {}) {
        const role = options.role === 'delegate' ? 'delegate' : 'main';
        const skillIds = loadedSkillIds(options.messages || (role === 'main' ? state.messages : []), role === 'main' ? state.archivedSkillIds : []);
        const definitions = typeof getToolDefinitions === 'function'
            ? getToolDefinitions({ ...options, role, skillIds })
            : TOOL_DEFINITIONS;
        return filterSkillTools(definitions, skillIds, { role });
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
        state.compactions = [];
        state.compactionPending = false;
        state.archivedSkillIds = [];
        state.contextStats = {
            usedTokens: 0,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive: false,
        };
    }

    function buildHistorySummarySystemMessage(summary = currentHistorySummary(state)) {
        if (!summary) return null;
        return {
            role: 'system',
            content: `${HISTORY_SUMMARY_PREFIX}\n${summary}`,
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
        compactionThreshold,
        requestInputLimit,
        updateContextStats,
    } = createContextStatsController({
        state,
        getActiveProviderConfig,
        getToolDefinitions: resolveToolDefinitions,
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
        SUMMARY_TRIGGER_TOKENS,
    });

    function appendMessage(message) {
        state.messages.push({
            ...compactionPosition(state),
            ...message,
            attachments: normalizeAttachments(message.attachments),
            thoughts: message?.role === 'assistant'
                ? filterThoughtsForCurrentTurn(message.thoughts)
                : normalizeThoughtBlocks(message.thoughts),
        });
    }

    function pushMessage(message) {
        appendMessage(message);
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
        minRenderIntervalMs: 100,
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
        flushBeforeToolCall: deps.flushPendingWorkspaceChanges,
    });

    function cancelActiveRun(notice = '本轮请求已终止。') {
        const run = state.activeRun;
        if (!run) return;
        const pendingJs = [...pendingToolCalls.values()].some(entry =>
            entry.runId === run.id && entry.toolName === TOOL_NAMES.RUN_JAVASCRIPT_API && entry.dispatched);
        run.cancelNotice = pendingJs ? `${notice} ${JSAPI_CANCEL_NOTICE}` : notice;
        state.progressLabel = '终止中';
        run.controller.abort();
        clearPendingToolCalls(run.id, new Error('tool_aborted'));
        clearPendingApprovals(run.id, new Error('tool_aborted'));
        render();
    }

    function toProviderMessages(baseMessages = state.messages, options = {}) {
        const systemPrompt = [options.delivery?.systemPrefix, resolveSystemPrompt()].filter(Boolean).join('\n\n');
        const messages = [{ role: 'system', content: systemPrompt }];
        const summaryMessage = buildHistorySummarySystemMessage(options.historySummary);
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
        if (options.delivery) messages.push({ role: 'system', content: options.delivery.instructions });
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
        getToolDefinitions: resolveToolDefinitions,
        getActiveProviderConfig,
        formatToolResultDisplay,
        buildTextWithAttachmentSummary,
        compactionThreshold,
        requestInputLimit,
        updateContextStats,
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
        const toolCall = state.messages.at(-1).toolCalls[0];
        setToolActivity(toolCall, run, 'preparing');
        state.progressLabel = '工具中';
        render();

        let toolResult;
        try {
            toolResult = await callHostTool(TOOL_NAMES.READ_SKILL, { id: matchedSkill.id }, {
                runId: run.id,
                signal: run.controller.signal,
                onDispatched: () => advanceToolActivity(toolCall, run, 'running'),
            });
        } catch (error) {
            if (isAbortError(error)) throw error;
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

    function createAssistantDelegateRunner(webResults) {
        return createDelegateRunner({
            createAdapter,
            getActiveProviderConfig,
            getDelegateProviderConfig,
            getSystemPrompt: resolveSystemPrompt,
            resolveToolDefinitions: ({ messages } = {}) => resolveToolDefinitions({ role: 'delegate', messages }),
            safeJsonParse,
            isAbortError,
            TOOL_NAMES,
            executeToolCall: async (toolCall, parsedArguments, run, context = {}) => await executeAssistantToolCall(toolCall, parsedArguments, run, {
                allowDelegate: false,
                trackToolErrors: false,
                role: 'delegate',
                messages: context.messages,
                webResults,
            }),
        });
    }

    async function runDelegateTool(args, run) {
        return await createAssistantDelegateRunner(createWebResults(createRequestId)).runDelegate(args, run);
    }

    async function executeAssistantToolCall(toolCall, parsedArguments, run, options = {}) {
        if (isDeliveryTool(toolCall.name)) {
            if (!options.delivery || !options.allowedToolNames?.has(toolCall.name)) {
                return { ok: false, error: 'response_delivery_unavailable' };
            }
            if (toolCall.name !== TOOL_DELIVER && !options.toolCallsAreNative) return { ok: false, error: 'response_delivery_requires_native_tool_call' };
            return options.delivery.execute(toolCall.name, parsedArguments);
        }
        const slashCommand = toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND
            ? normalizeSlashCommand(parsedArguments.command)
            : '';
        const isJsApiRun = toolCall.name === TOOL_NAMES.RUN_JAVASCRIPT_API;
        const trackToolErrors = options.trackToolErrors !== false;
        let jsApiAnalysis = null;
        let jsApiApproved = false;
        let toolResult = null;

        try {
            if (isSkillTool(toolCall.name)) {
                const available = options.allowedToolNames || new Set(resolveToolDefinitions(options).map(definition => definition.function.name));
                if (!available.has(toolCall.name)) {
                    return { ok: false, error: 'skill_tool_not_available', toolName: toolCall.name };
                }
            }

            if (toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND && shouldRequireSlashCommandApproval(slashCommand)) {
                state.progressLabel = '确认中';
                advanceToolActivity(toolCall, run, 'approval');
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
                    && !jsApiAnalysis.analysisError
                    && Array.isArray(jsApiAnalysis.validationErrors)
                    && jsApiAnalysis.validationErrors.length > 0
                ) && shouldRequireJsApiApproval(jsApiAnalysis?.requestKind || 'unknown', state.config?.permissionMode);

                if (jsApiNeedsApproval) {
                    state.progressLabel = '确认中';
                    advanceToolActivity(toolCall, run, 'approval');
                    const approved = await requestJsApiApproval(parsedArguments, jsApiAnalysis || {}, {
                        runId: run.id,
                        signal: run.controller.signal,
                    });
                    jsApiApproved = approved;
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
                advanceToolActivity(toolCall, run, 'approval');
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
                state.progressLabel = '工具中';
                advanceToolActivity(toolCall, run, 'preparing');
                if (toolCall.name === TOOL_NAMES.DELEGATE_RUN) {
                    if (options.allowDelegate === false) {
                        toolResult = {
                            ok: false,
                            error: 'delegate_recursion_disabled',
                            message: '子任务不能继续调用 DelegateRun。',
                        };
                    } else {
                        advanceToolActivity(toolCall, run, 'running');
                        toolResult = await runDelegateTool(parsedArguments, run);
                    }
                } else if (toolCall.name === TOOL_NAMES.TOOL_RESULT_READ) {
                    run.controller.signal.throwIfAborted();
                    toolResult = options.webResults.read(parsedArguments);
                } else if (isWebTool(toolCall.name)) {
                    const providerConfig = options.role === 'delegate'
                        ? getDelegateProviderConfig?.(run)
                        : getActiveProviderConfig();
                    advanceToolActivity(toolCall, run, 'running');
                    const executeWebTool = toolCall.name === TOOL_NAMES.WEB_SEARCH ? runWebSearchTool : runWebFetchTool;
                    toolResult = await executeWebTool(providerConfig || {}, parsedArguments, {
                        signal: run.controller.signal,
                        isAbortError,
                    });
                    run.controller.signal.throwIfAborted();
                    toolResult = options.webResults.project(toolResult);
                } else {
                    toolResult = await callReadableWorkspaceTool(toolCall.name, parsedArguments, hostArguments => callHostTool(toolCall.name, hostArguments, {
                        runId: run.id,
                        signal: run.controller.signal,
                        onDispatched: () => advanceToolActivity(toolCall, run, 'running'),
                    }));
                    if (toolCall.name === TOOL_NAMES.READ_LOGS) {
                        run.controller.signal.throwIfAborted();
                        toolResult = options.webResults.project(toolResult);
                    }
                }
            }

            if (toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND && slashCommand && toolResult?.ok !== false && shouldRequireSlashCommandApproval(slashCommand)) {
                toolResult = {
                    ...toolResult,
                    approval: buildSlashApprovalResult(slashCommand, true),
                };
            }

            if (
                jsApiApproved
                && toolResult?.ok !== false
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

    function recordDeliveryPrelude(delivery, signal) {
        signal.throwIfAborted();
        const start = state.messages.length;
        for (const { name, content } of delivery.createPrelude()) {
            const id = createRequestId('delivery');
            const toolResult = delivery.execute(name);
            appendMessage({ role: 'assistant', content, toolCalls: [{ name, id, arguments: '{}' }] });
            appendMessage(buildToolResultMessage({ toolCallId: id, toolName: name, toolResult }));
        }
        persistSession();
        return state.messages.slice(start);
    }

    function mainRequestContext(delivery, options = {}) {
        const tools = resolveToolDefinitions({ role: 'main' });
        return { ...options, delivery, requestTools: delivery ? [...tools, ...delivery.definitions] : tools };
    }

    function updateDisplayContextStats(savedSettings) {
        const run = state.activeRun;
        const options = run?.requestContext ?? mainRequestContext(createResponseDelivery(run?.deliverySettings ?? savedSettings, getActiveProviderConfig()));
        return updateContextStats(toProviderMessages(getActiveContextMessages(), options), options.requestTools);
    }

    async function runAssistantLoop(run) {
        const webResults = createWebResults(createRequestId);
        const adapter = createAdapter();
        const delivery = createResponseDelivery(run.deliverySettings, getActiveProviderConfig());
        const pinnedMessages = delivery?.createPrelude ? recordDeliveryPrelude(delivery, run.controller.signal) : [];
        let rounds = 0;
        let pendingToolResponses = null;
        let pendingFinalAnswerReminderText = '';
        let sawToolExecution = false;
        let finalAnswerReminderSent = false;
        let previousToolSignature = '';
        const providerMessageOptions = {
            userContextSnapshotText: String(run?.userContextSnapshotText || '').trim(),
            finalAnswerReminderText: '',
        };

        await maybeAutoReadSlashSkill(run);

        // The user's stop button ends a run; the loop itself sets no round cap.
        while (true) {
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
                    streamingAssistantMessage = createStreamingAssistantMessage(compactionPosition(state));
                }
                updateStreamingAssistantMessage(streamingAssistantMessage, {
                    ...(hasText ? { content: snapshot.text } : {}),
                    ...(hasThoughts ? { thoughts: snapshot.thoughts } : {}),
                });
                scheduleStreamRender();
            };

            const options = mainRequestContext(delivery, {
                ...providerMessageOptions, pinnedMessages,
                finalAnswerReminderText: pendingFinalAnswerReminderText || providerMessageOptions.finalAnswerReminderText,
            });
            run.requestContext = options;
            const { requestTools } = options;
            const allowedToolNames = new Set(requestTools.map(definition => definition.function.name));
            const toolSignature = JSON.stringify([...allowedToolNames].sort());
            let result;
            try {
                const requestTask = {
                    tools: requestTools,
                    toolChoice: 'auto',
                    temperature: providerConfig.temperature,
                    maxTokens: providerConfig.maxTokens,
                    reasoning: providerConfig.reasoning,
                    signal: run.controller.signal,
                    onStreamProgress: handleStreamProgress,
                };

                const checkpointsBeforeBudget = state.compactions;
                const budgetMessages = await ensureContextBudget(adapter, run.controller.signal, options);
                run.controller.signal.throwIfAborted();
                // Use the budgeted prompt so adapters merge it with history only once.
                requestTask.systemPrompt = budgetMessages[0].content;
                // Provider sessions retain their initial tools, so both history and tools must still match.
                const continueSession = adapter?.supportsSessionToolLoop
                    && checkpointsBeforeBudget === state.compactions
                    && previousToolSignature === toolSignature;
                if (Array.isArray(pendingToolResponses) && pendingToolResponses.length && continueSession) {
                    requestTask.toolResponses = pendingToolResponses;
                } else if (pendingFinalAnswerReminderText && continueSession) {
                    requestTask.finalAnswerReminderText = pendingFinalAnswerReminderText;
                    pendingFinalAnswerReminderText = '';
                } else {
                    requestTask.messages = budgetMessages;
                    pendingFinalAnswerReminderText = '';
                }

                console.info('[Assistant][ModelRequest] round:start', {
                    round: rounds,
                    provider: String(providerConfig?.provider || ''),
                    model: String(providerConfig?.model || ''),
                    toolMode: String(providerConfig?.toolMode || ''),
                    reasoningMode: String(providerConfig?.reasoning?.mode || 'inherit'),
                    reasoningProfileId: String(providerConfig?.reasoning?.profileId || 'unsupported'),
                    reasoningEffort: String(providerConfig?.reasoning?.effort || ''),
                    usesSessionToolLoop: !!adapter?.supportsSessionToolLoop,
                    usesToolResponses: Array.isArray(requestTask.toolResponses) && requestTask.toolResponses.length > 0,
                    toolResponseCount: Array.isArray(requestTask.toolResponses) ? requestTask.toolResponses.length : 0,
                    usesFinalAnswerReminder: !!requestTask.finalAnswerReminderText,
                    messageCount: Array.isArray(requestTask.messages) ? requestTask.messages.length : 0,
                });
                result = await adapter.chat(requestTask);
                previousToolSignature = toolSignature;
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
                    ...(agentErrorGuidance(error) ? { parser: error.cause?.message } : {}),
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
                const calls = (streamingAssistantMessage || state.messages.at(-1)).toolCalls;
                for (const call of calls) setToolActivity(call, run, 'queued');
                render();

                const toolResponses = [];
                let delivered = false;
                for (const toolCall of calls) {
                    if (run.controller.signal.aborted) {
                        throw new Error('assistant_aborted');
                    }
                    const parsedArguments = safeJsonParse(toolCall.arguments, {});
                    state.progressLabel = '工具中';
                    advanceToolActivity(toolCall, run, 'preparing');
                    // Only the adapter knows how this batch arrived; call arguments and replay payloads cannot prove provenance.
                    const toolResult = await executeAssistantToolCall(toolCall, parsedArguments, run, {
                        webResults, allowedToolNames, delivery, toolCallsAreNative: result.toolCallsAreNative === true,
                    });
                    if (toolCall.name === TOOL_DELIVER && toolResult?.ok === true) delivered = true;
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
                if (delivered) {
                    state.progressLabel = '';
                    render();
                    return;
                }
                if (adapter?.supportsSessionToolLoop) {
                    pendingToolResponses = toolResponses;
                }
                continue;
            }

            pendingToolResponses = null;
            if (!hasVisibleText(result.text) && sawToolExecution && !finalAnswerReminderSent) {
                finalAnswerReminderSent = true;
                const finalAnswerReminderText = delivery ? DELIVERY_FINAL_STEP
                    : '你已经拿到了本轮全部工具结果。现在不要再调用任何工具，直接用自然语言给出最终答复。';
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
            if (!hasVisibleText(result.text)) {
                settleAssistantRunFailure({ messages: state.messages, notice: fallbackContent, pushMessage, persistSession });
            } else if (streamingAssistantMessage) {
                finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                    content: result.text,
                    thoughts: result.thoughts,
                    providerPayload: result.providerPayload,
                });
            } else {
                pushMessage({
                    role: 'assistant',
                    content: result.text,
                    thoughts: result.thoughts,
                    providerPayload: result.providerPayload,
                });
            }
            state.progressLabel = '';
            render();
            return;
        }
    }

    return {
        getToolActivity,
        resetCompactionState,
        buildContextMeterLabel,
        compactionThreshold,
        updateDisplayContextStats,
        pushMessage,
        cancelActiveRun,
        toProviderMessages,
        getActiveContextMessages,
        runAssistantLoop,
        callHostTool,
    };
}
