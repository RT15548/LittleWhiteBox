const TOKEN_ESTIMATE_BYTES_PER_TOKEN = 3.35;
const OPENAI_TOKENIZER_PROVIDERS = new Set(['openai-compatible', 'openai-responses']);
const textEncoder = new TextEncoder();

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
        isAbortError,
        createAdapter,
        getActiveProviderConfig,
        getSystemPrompt,
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
    let latestContextStatsSignature = '';
    let latestResolvedContextStatsSignature = '';
    let latestResolvedContextTokens = 0;
    let contextStatsRequestSerial = 0;

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
        if (message?.approvalRequest) {
            return '';
        }
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

        (messages || []).filter((message) => !message?.approvalRequest).forEach((message) => {
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

    function buildTokenCounterPayload(messages = [], tools = []) {
        return [
            ...buildTokenCounterMessages(messages),
            {
                role: 'system',
                content: tools.length ? `TOOLS\n${JSON.stringify(tools)}` : '',
            },
        ].filter((message) => message.content);
    }

    function estimateTokenCount(value) {
        return Math.ceil(textEncoder.encode(String(value || '')).length / TOKEN_ESTIMATE_BYTES_PER_TOKEN);
    }

    function estimateConversationTokens({ messages = [], tools = [] } = {}) {
        return estimateTokenCount(JSON.stringify(buildTokenCounterPayload(messages, tools)));
    }

    function buildContextStatsSignature(messages = [], tools = TOOL_DEFINITIONS) {
        const providerConfig = getActiveProviderConfig();
        return JSON.stringify({
            provider: String(providerConfig?.provider || ''),
            model: String(providerConfig?.model || ''),
            messages: buildTokenCounterPayload(messages, tools),
        });
    }

    function getTokenizerModelHint(providerConfig) {
        const model = String(providerConfig?.model || '').trim();
        if (model) return model;
        if (providerConfig?.provider === 'anthropic') return 'claude';
        return 'gpt-4o';
    }

    async function postJson(url, body) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`tokenizer_http_${response.status}`);
        }
        return await response.json();
    }

    async function countOpenAIContextTokens(messages = [], model = '') {
        if (!messages.length) return 0;
        const endpoint = `/api/tokenizers/openai/count?model=${encodeURIComponent(model || 'gpt-4o')}`;
        let total = -1;
        for (const message of messages) {
            const data = await postJson(endpoint, [message]);
            const tokenCount = Number(data?.token_count);
            if (!Number.isFinite(tokenCount)) {
                throw new Error('tokenizer_invalid_response');
            }
            total += tokenCount;
        }
        return Math.max(0, total);
    }

    async function countTextTokensWithEndpoint(endpoint, text) {
        const data = await postJson(endpoint, { text });
        const tokenCount = Number(data?.count);
        if (!Number.isFinite(tokenCount)) {
            throw new Error('tokenizer_invalid_response');
        }
        return tokenCount;
    }

    async function resolveConversationTokens({ messages = [], tools = [] } = {}) {
        const providerConfig = getActiveProviderConfig();
        const provider = String(providerConfig?.provider || '');
        const payload = buildTokenCounterPayload(messages, tools);
        const flattenedText = JSON.stringify(payload);

        try {
            if (OPENAI_TOKENIZER_PROVIDERS.has(provider)) {
                return await countOpenAIContextTokens(payload, getTokenizerModelHint(providerConfig));
            }
            if (provider === 'anthropic') {
                return await countTextTokensWithEndpoint('/api/tokenizers/claude/encode', flattenedText);
            }
        } catch {
            return estimateConversationTokens({ messages, tools });
        }

        return estimateConversationTokens({ messages, tools });
    }

    async function forceUpdateContextStats(messages = [], tools = TOOL_DEFINITIONS) {
        const signature = buildContextStatsSignature(messages, tools);
        const summaryActive = !!state.historySummary;
        let usedTokens = latestResolvedContextStatsSignature === signature
            ? latestResolvedContextTokens
            : await resolveConversationTokens({ messages, tools });

        if (!Number.isFinite(usedTokens)) {
            usedTokens = estimateConversationTokens({ messages, tools });
        }

        latestResolvedContextStatsSignature = signature;
        latestResolvedContextTokens = usedTokens;
        latestContextStatsSignature = signature;
        state.contextStats = {
            usedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
        };
        return usedTokens;
    }

    function updateContextStats(messages = [], tools = TOOL_DEFINITIONS) {
        const signature = buildContextStatsSignature(messages, tools);
        const summaryActive = !!state.historySummary;
        const estimatedTokens = latestResolvedContextStatsSignature === signature
            ? latestResolvedContextTokens
            : estimateConversationTokens({ messages, tools });

        latestContextStatsSignature = signature;
        state.contextStats = {
            usedTokens: estimatedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
        };

        if (latestResolvedContextStatsSignature === signature) {
            return;
        }

        const requestSerial = ++contextStatsRequestSerial;
        resolveConversationTokens({ messages, tools }).then((usedTokens) => {
            if (requestSerial !== contextStatsRequestSerial) return;
            if (latestContextStatsSignature !== signature) return;
            if (!Number.isFinite(usedTokens)) return;
            latestResolvedContextStatsSignature = signature;
            latestResolvedContextTokens = usedTokens;
            const changed = state.contextStats.usedTokens !== usedTokens
                || state.contextStats.summaryActive !== summaryActive
                || state.contextStats.budgetTokens !== MAX_CONTEXT_TOKENS;
            state.contextStats = {
                usedTokens,
                budgetTokens: MAX_CONTEXT_TOKENS,
                summaryActive,
            };
            if (changed) {
                render();
            }
        }).catch(() => {
            // Keep estimated stats on tokenizer failure.
        });
    }

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
        render();
        return message;
    }

    function updateStreamingAssistantMessage(message, patch = {}) {
        if (!message) return;
        if (typeof patch.content === 'string') {
            message.content = patch.content;
        }
        if (patch.providerPayload && typeof patch.providerPayload === 'object') {
            message.providerPayload = patch.providerPayload;
        }
        if (Array.isArray(patch.thoughts)) {
            message.thoughts = filterThoughtsForCurrentTurn(patch.thoughts, message);
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
            if (state.pendingApproval?.id === requestId) {
                state.pendingApproval = null;
            }
            entry.cleanup?.();
            entry.reject(error);
        }
        render();
    }

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

    function toProviderMessages(baseMessages = state.messages) {
        const messages = [{ role: 'system', content: resolveSystemPrompt() }];
        const summaryMessage = buildHistorySummarySystemMessage();
        const lightBrakeMessage = buildRepeatedToolErrorSystemMessage();
        if (summaryMessage) messages.push(summaryMessage);
        if (lightBrakeMessage) messages.push(lightBrakeMessage);
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

    function pruneArchivedTurnsFromState() {
        const turns = splitMessagesIntoTurns();
        const archivedCount = Math.min(state.archivedTurnCount, turns.length);
        if (archivedCount <= 0) return false;
        state.messages = turns.slice(archivedCount).flat();
        state.archivedTurnCount = 0;
        return true;
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
        const preservedOptions = [DEFAULT_PRESERVED_TURNS, MIN_PRESERVED_TURNS];
        let contextMessages = getActiveContextMessages();
        let providerMessages = toProviderMessages(contextMessages);
        await forceUpdateContextStats(providerMessages);

        if (state.contextStats.usedTokens <= SUMMARY_TRIGGER_TOKENS) {
            return providerMessages;
        }

        for (const preservedTurns of preservedOptions) {
            const turns = splitMessagesIntoTurns();
            const desiredArchivedTurnCount = Math.max(
                state.archivedTurnCount,
                turns.length - Math.min(preservedTurns, turns.length),
            );
            if (desiredArchivedTurnCount > state.archivedTurnCount) {
                const turnsToArchive = turns.slice(state.archivedTurnCount, desiredArchivedTurnCount);
                await summarizeArchivedTurns(adapter, turnsToArchive, signal);
                state.archivedTurnCount = desiredArchivedTurnCount;
                pruneArchivedTurnsFromState();
                persistSession();
            }

            contextMessages = getActiveContextMessages();
            providerMessages = toProviderMessages(contextMessages);
            await forceUpdateContextStats(providerMessages);
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

    function requestApproval(approvalRequest, options = {}) {
        const requestId = createRequestId('approval');
        const run = state.activeRun?.id === options.runId ? state.activeRun : null;

        state.pendingApproval = {
            id: requestId,
            ...approvalRequest,
            status: 'pending',
        };
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

            const clearApprovalPanel = () => {
                if (state.pendingApproval?.id !== requestId) return;
                state.pendingApproval = null;
                render();
            };

            const finishResolve = (value) => {
                if (settled) return;
                settled = true;
                pendingApprovals.delete(requestId);
                cleanup();
                clearApprovalPanel();
                resolve(value);
            };

            const finishReject = (error) => {
                if (settled) return;
                settled = true;
                pendingApprovals.delete(requestId);
                cleanup();
                clearApprovalPanel();
                reject(error);
            };

            abortHandler = () => {
                finishReject(new Error('tool_aborted'));
            };

            if (run) {
                run.toolRequestIds.add(requestId);
            }

            pendingApprovals.set(requestId, {
                runId: options.runId,
                cleanup,
                resolve: (approved) => {
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

    function requestSlashCommandApproval(command, options = {}) {
        return requestApproval({
            kind: 'slash-command',
            command,
        }, options);
    }

    function requestSkillGenerationApproval(args = {}, options = {}) {
        return requestApproval({
            kind: 'generate-skill',
            title: String(args.title || '').trim(),
            reason: String(args.reason || '').trim(),
            sourceSummary: String(args.sourceSummary || '').trim(),
        }, options);
    }

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
                    requestTask.messages = await ensureContextBudget(adapter, run.controller.signal);
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
                    state.progressLabel = '工具中';
                    render();
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
