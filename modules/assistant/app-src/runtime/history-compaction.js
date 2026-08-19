import { resetMessageWindow } from '../../../agent-core/ui/message-windowing.js';

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
        HISTORY_SUMMARY_MAX_TOKENS,
        buildContextMeterLabel,
        forceUpdateContextStats,
        toProviderMessages,
    } = deps;

    function normalizeSummarySourceText(text) {
        return String(text || '').replace(/\r\n/g, '\n').trim();
    }

    function getMessageTextForSummary(message) {
        if (message?.approvalRequest) {
            return '';
        }
        if (message.role === 'tool') {
            const display = formatToolResultDisplay(message);
            const lines = [
                display?.summary ? `工具摘要:\n${display.summary}` : '',
                display?.details ? `工具输出详情:\n${display.details}` : '',
                !display?.summary && !display?.details ? `工具原始结果:\n${message.content || ''}` : '',
            ].filter(Boolean);
            return normalizeSummarySourceText(lines.join('\n\n'));
        }
        if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
            const toolLines = message.toolCalls.map((toolCall) => `工具: ${toolCall.name} ${toolCall.arguments || '{}'}`.trim());
            return normalizeSummarySourceText([message.content || '', ...toolLines].filter(Boolean).join('\n'));
        }
        return normalizeSummarySourceText(buildTextWithAttachmentSummary(message.content || '', message.attachments));
    }

    function buildSummarySource(turns, existingSummary = '') {
        const lines = [];
        if (existingSummary?.trim()) {
            lines.push('已有历史摘要（当前记忆底稿，除非新增历史明确纠正，否则需要合并保留）:');
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

    function resolveHistorySummaryMaxTokens(providerConfig = {}) {
        const configuredMaxTokens = Number(providerConfig?.maxTokens);
        if (Number.isFinite(configuredMaxTokens) && configuredMaxTokens > 0) {
            return Math.min(Math.floor(configuredMaxTokens), HISTORY_SUMMARY_MAX_TOKENS);
        }
        return HISTORY_SUMMARY_MAX_TOKENS;
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
        resetMessageWindow(state);
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
                maxTokens: resolveHistorySummaryMaxTokens(providerConfig),
                reasoning: { mode: 'inherit', output: 'hide' },
                signal,
            });
            state.historySummary = String(result.text || '').trim() || fallbackSummary;
        } catch (error) {
            if (signal?.aborted || error?.name === 'AbortError') throw error;
            state.historySummary = fallbackSummary;
            showToast('历史摘要生成失败，已使用本地降级摘要。');
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
