import { resetMessageWindow } from '../../../agent-core/ui/message-windowing.js';
import { currentHistorySummary } from '../state/compaction-history.js';
import { selectCompactionRange } from './compaction-range.js';
import { buildSummaryRequest, readSubmittedSummary } from './summary-request.js';
import { ACTIVITY_COPY } from '../ui/activity-copy.js';
import { loadedSkillIds } from '../../shared/skill-tools.js';
import { dropInvalidatedThinkingFromMessage } from '../../../agent-core/runtime/protocol.js';
import { estimateTokenCount, estimateConversationTokens, estimateMessageTokenCosts } from '../../../agent-core/runtime/context-tokens.js';

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
        getToolDefinitions = () => [],
        getActiveProviderConfig,
        formatToolResultDisplay,
        buildTextWithAttachmentSummary,
        compactionThreshold,
        requestInputLimit,
        updateContextStats,
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

    function messageLabel(message) {
        return message.role === 'user'
            ? '用户'
            : message.role === 'assistant'
                ? '助手'
                : `工具${message.toolName ? `(${message.toolName})` : ''}`;
    }

    // Archived history can exceed one request (a long tool run may hold whole
    // written files). It is read in consecutive pieces of at most half the
    // request capacity, leaving the rest for the running summary it is folded into.
    function buildSummaryChunks(turns) {
        const limit = Math.max(1, Math.floor(requestInputLimit() / 2));
        // A character is at most four UTF-8 bytes, so this slice fits the token limit.
        const pieceChars = Math.max(1, Math.floor(limit * 3.35 / 4));
        const pieces = turns.flatMap((turn, index) => [
            `第 ${index + 1} 段历史:`,
            ...turn.map(message => `${messageLabel(message)}: ${getMessageTextForSummary(message) || '[空]'}`),
            '',
        ]).flatMap(line => (line.length <= pieceChars ? [line]
            : Array.from({ length: Math.ceil(line.length / pieceChars) }, (_, index) => line.slice(index * pieceChars, (index + 1) * pieceChars))));
        const chunks = [];
        let size = Infinity;
        for (const piece of pieces) {
            const tokens = estimateTokenCount(piece) + 1;
            if (size + tokens > limit) { chunks.push([]); size = 0; }
            chunks.at(-1).push(piece);
            size += tokens;
        }
        return chunks;
    }

    function buildSummarySource(lines, existingSummary = '') {
        return [
            ...(existingSummary?.trim()
                ? ['已有历史摘要（当前记忆底稿，除非新增历史明确纠正，否则需要合并保留）:', existingSummary.trim(), '']
                : []),
            ...lines,
        ].join('\n').trim();
    }

    function getActiveContextMessages() {
        return state.messages.filter(message => !message.approvalRequest);
    }

    async function summarizeMessages(adapter, messages, summary, signal) {
        const providerConfig = getActiveProviderConfig();

        try {
            for (const lines of buildSummaryChunks(splitMessagesIntoTurns(messages))) {
                const request = buildSummaryRequest(buildSummarySource(lines, summary), providerConfig, signal);
                const inputTokens = estimateConversationTokens({ messages: [{ role: 'system', content: request.systemPrompt }, ...request.messages],
                    tools: request.tools, providerConfig });
                if (inputTokens > requestInputLimit()) throw new Error(ACTIVITY_COPY.summaryOverBudget(inputTokens, requestInputLimit()));
                const result = await adapter.chat(request);
                signal?.throwIfAborted();
                summary = readSubmittedSummary(result);
            }
            return summary;
        } catch (error) {
            if (signal?.aborted || error?.name === 'AbortError') throw error;
            throw Object.assign(new Error(ACTIVITY_COPY.summaryFailed(error.message), { cause: error }), { code: 'assistant_summary_failed' });
        }
    }

    // One adapter per run. Do not buy a rejected summary of the same prefix again.
    const skippedThrough = new WeakMap();

    async function ensureContextBudget(adapter, signal, options = {}) {
        signal?.throwIfAborted();
        const context = getActiveContextMessages();
        const original = toProviderMessages(context, options);
        const tools = options.requestTools ?? getToolDefinitions();
        updateContextStats(original, tools);
        const before = state.contextStats.usedTokens;
        if (before <= compactionThreshold()) return original;

        const limit = requestInputLimit();
        const checkLimit = used => {
            if (used > limit) throw Object.assign(new Error(ACTIVITY_COPY.contextFull(used, limit)), { code: 'assistant_context_over_budget' });
        };
        const providerConfig = getActiveProviderConfig();
        const count = messages => estimateConversationTokens({ messages, tools, providerConfig });
        const pinned = context.findLast(message => message.role === 'user');
        const pinnedMessages = options.pinnedMessages ?? [];
        const fixed = count(toProviderMessages([...(pinned ? [pinned] : []), ...pinnedMessages], { ...options, historySummary: '' }));
        checkLimit(fixed);
        const costs = estimateMessageTokenCosts(original, tools, providerConfig);
        const tailCapacity = Math.max(0, limit - fixed - (providerConfig.maxTokens || 0));
        const { archived, retained, priorCount } = selectCompactionRange(context, costs.slice(costs.length - context.length), limit, tailCapacity, pinnedMessages);
        if (!archived.length || skippedThrough.get(adapter) === archived.at(-1)) {
            checkLimit(before);
            return original;
        }

        const previousPhase = state.progressLabel;
        const previous = { messages: state.messages, compactions: state.compactions, archivedSkillIds: state.archivedSkillIds, contextStats: state.contextStats };
        state.compactionPending = true;
        state.progressLabel = ACTIVITY_COPY.compacting;
        render();
        try {
            // Fold up to the user's boundary first. A reroll can then keep just the
            // older memory, without storing raw tool output or resummarizing it.
            const prior = archived.slice(0, priorCount);
            const priorSummary = await summarizeMessages(adapter, prior, currentHistorySummary(state), signal);
            const hasCurrent = priorCount < archived.length;
            const summary = hasCurrent ? await summarizeMessages(adapter, archived.slice(priorCount), priorSummary, signal) : priorSummary;
            signal?.throwIfAborted();
            const messages = retained.map(dropInvalidatedThinkingFromMessage);
            const next = toProviderMessages(messages, { ...options, historySummary: summary });
            const after = count(next);
            let record;
            if (after >= before) {
                checkLimit(before);
                record = { skipped: true };
            } else {
                checkLimit(after);
                record = { before, summary, after };
                if (hasCurrent) record.turnStart = {
                    archivedSkillIds: loadedSkillIds(prior, previous.archivedSkillIds),
                    ...(prior.length ? { summary: priorSummary } : {}),
                };
                state.messages = messages;
                state.archivedSkillIds = loadedSkillIds(archived, previous.archivedSkillIds);
            }
            state.compactions = [...(previous.compactions || []), record];
            if (!record.skipped) updateContextStats(next, tools);
            state.compactionPending = false;
            const saved = await persistSession();
            if (saved?.ok === false) throw new Error(ACTIVITY_COPY.compactionSaveFailed(saved.error));
            if (record.skipped) {
                skippedThrough.set(adapter, archived.at(-1));
                return original;
            }
            skippedThrough.delete(adapter);
            resetMessageWindow(state);
            return next;
        } catch (error) {
            Object.assign(state, previous);
            if (signal?.aborted || error?.name === 'AbortError') throw error;
            // The outer run failure handler persists the same terminal state, without an extra chat reply.
            state.compactions = [...(previous.compactions || []), { error: error.message }];
            throw Object.assign(error, { compactionReported: true });
        } finally {
            state.compactionPending = false;
            state.progressLabel = previousPhase;
            render();
        }
    }

    return { ensureContextBudget, getActiveContextMessages };
}
