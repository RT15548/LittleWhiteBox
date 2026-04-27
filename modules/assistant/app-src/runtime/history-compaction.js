export function splitMessagesIntoTurns(messages = []) {
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

export function createHistoryCompactionController(deps) {
    const {
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
    } = deps;

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

    function getActiveContextMessages() {
        const turns = splitMessagesIntoTurns(state.messages);
        const archivedCount = Math.min(state.archivedTurnCount, turns.length);
        return turns.slice(archivedCount).flat();
    }

    function pruneArchivedTurnsFromState() {
        const turns = splitMessagesIntoTurns(state.messages);
        const archivedCount = Math.min(state.archivedTurnCount, turns.length);
        if (archivedCount <= 0) return false;
        state.messages = turns.slice(archivedCount).flat();
        state.archivedTurnCount = 0;
        return true;
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

    async function ensureContextBudget(adapter, signal, options = {}) {
        const preservedOptions = [DEFAULT_PRESERVED_TURNS, MIN_PRESERVED_TURNS];
        let contextMessages = getActiveContextMessages();
        let providerMessages = toProviderMessages(contextMessages, options);
        await forceUpdateContextStats(providerMessages);

        if (state.contextStats.usedTokens <= SUMMARY_TRIGGER_TOKENS) {
            return providerMessages;
        }

        for (const preservedTurns of preservedOptions) {
            const turns = splitMessagesIntoTurns(state.messages);
            const desiredArchivedTurnCount = Math.max(
                state.archivedTurnCount,
                turns.length - Math.min(preservedTurns, turns.length),
            );
            if (desiredArchivedTurnCount > state.archivedTurnCount) {
                const turnsToArchive = turns.slice(state.archivedTurnCount, desiredArchivedTurnCount);
                const previousProgressLabel = state.progressLabel;
                state.progressLabel = '总结中';
                render();
                try {
                    await summarizeArchivedTurns(adapter, turnsToArchive, signal);
                } finally {
                    state.progressLabel = previousProgressLabel || '生成中';
                    render();
                }
                state.archivedTurnCount = desiredArchivedTurnCount;
                pruneArchivedTurnsFromState();
                persistSession();
            }

            contextMessages = getActiveContextMessages();
            providerMessages = toProviderMessages(contextMessages, options);
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

    return {
        ensureContextBudget,
        getActiveContextMessages,
        pruneArchivedTurnsFromState,
    };
}
