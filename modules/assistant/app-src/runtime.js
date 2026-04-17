import { countTokens } from 'gpt-tokenizer/model/gpt-4o';

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
        describeToolCall,
        formatToolResultDisplay,
        buildTextWithAttachmentSummary,
        buildUserContentParts,
        normalizeAttachments,
        normalizeThoughtBlocks,
        normalizeSlashCommand,
        shouldRequireSlashCommandApproval,
        setApprovalStatus,
        buildSlashApprovalResult,
        isAbortError,
        createAdapter,
        getActiveProviderConfig,
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
    let streamRenderScheduled = false;
    let lastStreamPersistAt = 0;

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

    function formatContextCount(tokens) {
        return `${Math.max(0, Math.round((Number(tokens) || 0) / 1000))}k`;
    }

    function buildContextMeterLabel(stats = state.contextStats) {
        return `${formatContextCount(stats.usedTokens)}/${formatContextCount(stats.budgetTokens)}`;
    }

    function trimForSummary(text, limit = 1800) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        if (normalized.length <= limit) return normalized;
        return `${normalized.slice(0, limit)}…`;
    }

    function getMessageTextForSummary(message) {
        if (message.role === 'tool') {
            return trimForSummary(formatToolResultDisplay(message).summary || message.content || '', 1400);
        }
        if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
            const toolLines = message.toolCalls.map((toolCall) => `工具: ${toolCall.name} ${toolCall.arguments || '{}'}`.trim());
            return trimForSummary([message.content || '', ...toolLines].filter(Boolean).join('\n'), 1600);
        }
        return trimForSummary(buildTextWithAttachmentSummary(message.content || '', message.attachments), 1600);
    }

    function splitMessagesIntoTurns(messages = state.messages) {
        const turns = [];
        let currentTurn = [];

        (messages || []).forEach((message) => {
            if (message.role === 'user' && currentTurn.length) {
                turns.push(currentTurn);
                currentTurn = [message];
                return;
            }
            currentTurn.push(message);
        });

        if (currentTurn.length) {
            turns.push(currentTurn);
        }

        return turns.filter((turn) => turn.length);
    }

    function buildSummarySource(turns, existingSummary = '') {
        const lines = [];
        if (existingSummary?.trim()) {
            lines.push('已有历史摘要:');
            lines.push(existingSummary.trim());
            lines.push('');
        }

        turns.forEach((turn, index) => {
            lines.push(`第 ${index + 1} 段历史:`);
            turn.forEach((message) => {
                const roleLabel = message.role === 'user'
                    ? '用户'
                    : message.role === 'assistant'
                        ? '助手'
                        : `工具${message.toolName ? `(${message.toolName})` : ''}`;
                lines.push(`${roleLabel}: ${getMessageTextForSummary(message) || '[空]'}`);
            });
            lines.push('');
        });

        return lines.join('\n').trim();
    }

    function buildFallbackSummary(turns, existingSummary = '') {
        const sections = [];
        if (existingSummary?.trim()) {
            sections.push(existingSummary.trim());
        }

        turns.forEach((turn, index) => {
            const condensed = turn.map((message) => {
                const prefix = message.role === 'user'
                    ? '用户'
                    : message.role === 'assistant'
                        ? '助手'
                        : `工具${message.toolName ? `(${message.toolName})` : ''}`;
                return `${prefix}: ${getMessageTextForSummary(message) || '[空]'}`;
            }).join('\n');
            sections.push(`补充历史 ${index + 1}:\n${condensed}`);
        });

        return trimForSummary(sections.join('\n\n'), 6000);
    }

    function buildTokenCounterMessages(messages = []) {
        return messages.map((message) => {
            const contentText = Array.isArray(message.content)
                ? message.content.map((part) => {
                    if (!part || typeof part !== 'object') return '';
                    if (part.type === 'text') return part.text || '';
                    if (part.type === 'image_url') return `[image:${part.name || part.mimeType || 'image'}]`;
                    return '';
                }).filter(Boolean).join('\n')
                : (message.content || '');

            if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
                const toolCalls = message.tool_calls.map((toolCall) => JSON.stringify({
                    id: toolCall.id,
                    name: toolCall.function?.name || '',
                    arguments: toolCall.function?.arguments || '{}',
                })).join('\n');
                return {
                    role: 'assistant',
                    content: [contentText, toolCalls].filter(Boolean).join('\n'),
                };
            }

            if (message.role === 'tool') {
                return {
                    role: 'tool',
                    content: [message.tool_call_id || '', message.content || ''].filter(Boolean).join('\n'),
                };
            }

            return {
                role: message.role,
                content: contentText,
            };
        });
    }

    function countConversationTokens({ messages = [], tools = [] } = {}) {
        const payload = [
            ...buildTokenCounterMessages(messages),
            {
                role: 'system',
                content: tools.length ? `TOOLS\n${JSON.stringify(tools)}` : '',
            },
        ].filter((message) => message.content);

        try {
            return countTokens(payload);
        } catch {
            return countTokens(JSON.stringify(payload));
        }
    }

    function updateContextStats(messages = [], tools = TOOL_DEFINITIONS) {
        state.contextStats = {
            usedTokens: countConversationTokens({ messages, tools }),
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive: !!state.historySummary,
        };
    }

    function pushMessage(message) {
        state.messages.push({
            ...message,
            attachments: normalizeAttachments(message.attachments),
            thoughts: normalizeThoughtBlocks(message.thoughts),
        });
        state.autoScroll = true;
        persistSession();
    }

    function normalizeToolCalls(toolCalls) {
        if (!Array.isArray(toolCalls)) return [];
        return toolCalls
            .filter((toolCall) => toolCall && typeof toolCall === 'object' && toolCall.name)
            .map((toolCall, index) => ({
                id: String(toolCall.id || createRequestId(`tool-${index + 1}`)),
                name: String(toolCall.name || ''),
                arguments: typeof toolCall.arguments === 'string'
                    ? toolCall.arguments
                    : JSON.stringify(toolCall.arguments || {}),
            }));
    }

    function scheduleStreamRender({ persist = false } = {}) {
        state.autoScroll = true;
        const now = Date.now();
        if (persist || now - lastStreamPersistAt >= 1500) {
            persistSession();
            lastStreamPersistAt = now;
        }
        if (streamRenderScheduled) return;
        streamRenderScheduled = true;
        const flush = () => {
            streamRenderScheduled = false;
            render();
        };
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(flush);
            return;
        }
        setTimeout(flush, 16);
    }

    function createStreamingAssistantMessage() {
        const message = {
            role: 'assistant',
            content: '',
            thoughts: [],
            streaming: true,
        };
        state.messages.push(message);
        state.autoScroll = true;
        render();
        return message;
    }

    function updateStreamingAssistantMessage(message, patch = {}) {
        if (!message) return;
        if (typeof patch.content === 'string') {
            message.content = patch.content;
        }
        if (Array.isArray(patch.thoughts)) {
            message.thoughts = normalizeThoughtBlocks(patch.thoughts);
        }
        if (Array.isArray(patch.toolCalls)) {
            message.toolCalls = normalizeToolCalls(patch.toolCalls);
        }
        if (typeof patch.streaming === 'boolean') {
            message.streaming = patch.streaming;
        }
    }

    function finalizeStreamingAssistantMessage(message, patch = {}) {
        if (!message) return;
        updateStreamingAssistantMessage(message, {
            ...patch,
            streaming: false,
        });
        scheduleStreamRender({ persist: true });
    }

    function clearPendingToolCalls(runId, error) {
        for (const [requestId, entry] of pendingToolCalls.entries()) {
            if (entry.runId !== runId) continue;
            pendingToolCalls.delete(requestId);
            entry.cleanup?.();
            entry.reject(error);
        }
    }

    function clearPendingApprovals(runId, error) {
        for (const [requestId, entry] of pendingApprovals.entries()) {
            if (entry.runId !== runId) continue;
            pendingApprovals.delete(requestId);
            setApprovalStatus(requestId, 'cancelled');
            entry.cleanup?.();
            entry.reject(error);
        }
    }

    function cancelActiveRun(notice = '本轮请求已终止。') {
        const run = state.activeRun;
        if (!run) return;
        run.cancelNotice = notice;
        state.progressLabel = '正在终止…';
        clearPendingToolCalls(run.id, new Error('tool_aborted'));
        clearPendingApprovals(run.id, new Error('tool_aborted'));
        run.controller.abort();
        render();
    }

    function toProviderMessages(baseMessages = state.messages) {
        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        const summaryMessage = buildHistorySummarySystemMessage();
        const lightBrakeMessage = buildRepeatedToolErrorSystemMessage();
        if (summaryMessage) messages.push(summaryMessage);
        if (lightBrakeMessage) messages.push(lightBrakeMessage);
        for (const message of baseMessages) {
            if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
                messages.push({
                    role: 'assistant',
                    content: message.content || '',
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
                content: message.role === 'user'
                    ? buildUserContentParts(message)
                    : message.content,
            });
        }
        return messages;
    }

    function getActiveContextMessages() {
        const turns = splitMessagesIntoTurns();
        const archivedCount = Math.min(state.archivedTurnCount, turns.length);
        return turns.slice(archivedCount).flat();
    }

    function buildToolFailureResult(toolName, args, error) {
        const raw = String(error?.message || error || 'tool_failed');
        const [code] = raw.split(':');
        const result = {
            ok: false,
            toolName,
            path: typeof args?.path === 'string' ? args.path : '',
            error: code || 'tool_failed',
            raw,
            message: describeError(error),
        };

        return result;
    }

    function recordToolErrorForLightBrake(run, toolName, errorCode) {
        if (!run || !toolName || !errorCode) return;
        const nextKey = `${toolName}::${errorCode}`;
        if (run.toolErrorStreakKey === nextKey) {
            run.toolErrorStreakCount += 1;
        } else {
            run.toolErrorStreakKey = nextKey;
            run.toolErrorStreakCount = 1;
        }

        if (run.toolErrorStreakCount >= 3 && run.lastLightBrakeKey !== nextKey) {
            run.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${toolName}\` 都返回了同一个错误：\`${errorCode}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`;
            run.lastLightBrakeKey = nextKey;
        }
    }

    function resetToolErrorLightBrake(run) {
        if (!run) return;
        run.toolErrorStreakKey = '';
        run.toolErrorStreakCount = 0;
    }

    async function summarizeArchivedTurns(adapter, turnsToArchive, signal) {
        if (!turnsToArchive.length) return;

        const summarySource = buildSummarySource(turnsToArchive, state.historySummary);
        const fallbackSummary = buildFallbackSummary(turnsToArchive, state.historySummary);
        const providerConfig = getActiveProviderConfig();

        try {
            const result = await adapter.chat({
                systemPrompt: SUMMARY_SYSTEM_PROMPT,
                messages: [{ role: 'user', content: summarySource }],
                tools: [],
                toolChoice: 'none',
                temperature: Math.min(providerConfig.temperature ?? 0.2, 0.2),
                maxTokens: null,
                signal,
            });
            state.historySummary = String(result.text || '').trim() || fallbackSummary;
        } catch {
            state.historySummary = fallbackSummary;
        }
    }

    async function ensureContextBudget(adapter, signal) {
        const turns = splitMessagesIntoTurns();
        const preservedOptions = [DEFAULT_PRESERVED_TURNS, MIN_PRESERVED_TURNS];
        let contextMessages = getActiveContextMessages();
        let providerMessages = toProviderMessages(contextMessages);
        updateContextStats(providerMessages);

        if (state.contextStats.usedTokens <= SUMMARY_TRIGGER_TOKENS) {
            return providerMessages;
        }

        for (const preservedTurns of preservedOptions) {
            const desiredArchivedTurnCount = Math.max(
                state.archivedTurnCount,
                turns.length - Math.min(preservedTurns, turns.length),
            );
            if (desiredArchivedTurnCount > state.archivedTurnCount) {
                const turnsToArchive = turns.slice(state.archivedTurnCount, desiredArchivedTurnCount);
                await summarizeArchivedTurns(adapter, turnsToArchive, signal);
                state.archivedTurnCount = desiredArchivedTurnCount;
                persistSession();
            }

            contextMessages = getActiveContextMessages();
            providerMessages = toProviderMessages(contextMessages);
            updateContextStats(providerMessages);
            if (state.contextStats.usedTokens <= SUMMARY_TRIGGER_TOKENS) {
                showToast(`已压缩较早历史，当前上下文 ${buildContextMeterLabel()}`);
                render();
                return providerMessages;
            }
        }

        showToast(`最近对话本身已接近上限，当前上下文 ${buildContextMeterLabel()}`);
        render();
        return providerMessages;
    }

    function callHostTool(name, args, options = {}) {
        const requestId = createRequestId('tool');
        const run = state.activeRun;
        if (run && run.id === options.runId) {
            run.toolRequestIds.add(requestId);
        }
        return new Promise((resolve, reject) => {
            let settled = false;
            let timer = null;
            let abortHandler = null;

            const cleanup = () => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (options.signal && abortHandler) {
                    options.signal.removeEventListener('abort', abortHandler);
                }
                const activeRun = state.activeRun;
                if (activeRun && activeRun.id === options.runId) {
                    activeRun.toolRequestIds.delete(requestId);
                }
            };

            const finishReject = (error) => {
                if (settled) return;
                settled = true;
                pendingToolCalls.delete(requestId);
                cleanup();
                reject(error);
            };

            const finishResolve = (value) => {
                if (settled) return;
                settled = true;
                pendingToolCalls.delete(requestId);
                cleanup();
                resolve(value);
            };

            abortHandler = () => {
                post('xb-assistant:tool-abort', { requestId });
                finishReject(new Error('tool_aborted'));
            };

            timer = setTimeout(() => {
                post('xb-assistant:tool-abort', { requestId });
                finishReject(new Error('tool_timeout'));
            }, REQUEST_TIMEOUT_MS);

            pendingToolCalls.set(requestId, {
                runId: options.runId,
                cleanup,
                resolve: finishResolve,
                reject: finishReject,
            });

            if (options.signal) {
                if (options.signal.aborted) {
                    abortHandler();
                    return;
                }
                options.signal.addEventListener('abort', abortHandler, { once: true });
            }

            post('xb-assistant:tool-call', {
                requestId,
                name,
                arguments: args,
            });
        });
    }

    function requestSlashCommandApproval(command, options = {}) {
        const requestId = createRequestId('approval');
        const run = state.activeRun?.id === options.runId ? state.activeRun : null;

        pushMessage({
            role: 'assistant',
            content: '这条斜杠命令会直接作用于你当前打开的真实酒馆实例。请确认是否继续执行。',
            approvalRequest: {
                id: requestId,
                kind: 'slash-command',
                command,
                status: 'pending',
            },
        });
        render();

        return new Promise((resolve, reject) => {
            let settled = false;
            let abortHandler = null;

            const cleanup = () => {
                if (run) {
                    run.toolRequestIds.delete(requestId);
                }
                if (options.signal && abortHandler) {
                    options.signal.removeEventListener('abort', abortHandler);
                }
            };

            const finishResolve = (value) => {
                if (settled) return;
                settled = true;
                pendingApprovals.delete(requestId);
                cleanup();
                resolve(value);
            };

            const finishReject = (error) => {
                if (settled) return;
                settled = true;
                pendingApprovals.delete(requestId);
                cleanup();
                reject(error);
            };

            abortHandler = () => {
                setApprovalStatus(requestId, 'cancelled');
                finishReject(new Error('tool_aborted'));
            };

            if (run) {
                run.toolRequestIds.add(requestId);
            }

            pendingApprovals.set(requestId, {
                runId: options.runId,
                cleanup,
                resolve: (approved) => {
                    setApprovalStatus(requestId, approved ? 'approved' : 'declined');
                    finishResolve(approved);
                },
                reject: finishReject,
            });

            if (options.signal) {
                if (options.signal.aborted) {
                    abortHandler();
                    return;
                }
                options.signal.addEventListener('abort', abortHandler, { once: true });
            }
        });
    }

    async function runAssistantLoop(run) {
        const adapter = createAdapter();
        let rounds = 0;

        while (rounds < MAX_TOOL_ROUNDS) {
            if (run.controller.signal.aborted) {
                throw new Error('assistant_aborted');
            }

            rounds += 1;
            state.currentRound = rounds;
            state.progressLabel = '正在请求模型…';
            render();

            const providerConfig = getActiveProviderConfig();
            const requestMessages = await ensureContextBudget(adapter, run.controller.signal);
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
                result = await adapter.chat({
                    systemPrompt: SYSTEM_PROMPT,
                    messages: requestMessages,
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
                });
            } catch (error) {
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage);
                }
                throw error;
            }

            if (Array.isArray(result.toolCalls) && result.toolCalls.length) {
                if (streamingAssistantMessage) {
                    finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                        content: result.text || '',
                        thoughts: result.thoughts,
                        toolCalls: result.toolCalls,
                    });
                } else {
                    pushMessage({
                        role: 'assistant',
                        content: result.text || '',
                        toolCalls: result.toolCalls,
                        thoughts: result.thoughts,
                    });
                }
                render();

                for (const toolCall of result.toolCalls) {
                    if (run.controller.signal.aborted) {
                        throw new Error('assistant_aborted');
                    }
                    const parsedArguments = safeJsonParse(toolCall.arguments, {});
                    const slashCommand = toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND
                        ? normalizeSlashCommand(parsedArguments.command)
                        : '';
                    state.progressLabel = `正在${describeToolCall(toolCall.name, parsedArguments)}…`;
                    render();
                    let toolResult = null;
                    try {
                        if (toolCall.name === TOOL_NAMES.RUN_SLASH_COMMAND && shouldRequireSlashCommandApproval(slashCommand)) {
                            state.progressLabel = '等待你确认斜杠命令…';
                            render();
                            const approved = await requestSlashCommandApproval(slashCommand, {
                                runId: run.id,
                                signal: run.controller.signal,
                            });
                            if (!approved) {
                                toolResult = buildSlashApprovalResult(slashCommand, false);
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

                        if (toolResult?.ok === false && toolResult.error !== 'user_declined') {
                            recordToolErrorForLightBrake(run, toolCall.name, toolResult.error || 'tool_failed');
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
                    render();
                }
                continue;
            }

            if (streamingAssistantMessage) {
                finalizeStreamingAssistantMessage(streamingAssistantMessage, {
                    content: result.text || '没有拿到有效回复。',
                    thoughts: result.thoughts,
                });
            } else {
                pushMessage({
                    role: 'assistant',
                    content: result.text || '没有拿到有效回复。',
                    thoughts: result.thoughts,
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
