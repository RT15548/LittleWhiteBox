import { buildTokenCounterPayload, estimateTokenCount, estimateConversationTokens } from '../../../agent-core/runtime/context-tokens.js';

const textEncoder = new TextEncoder();
const CONTEXT_DEBUG_PREVIEW_CHARS = 140;
const CONTEXT_DEBUG_TOP_ENTRY_COUNT = 6;

function normalizeDebugPreview(value, limit = CONTEXT_DEBUG_PREVIEW_CHARS) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function summarizeContextPayload(messages = [], tools = [], providerConfig = {}) {
    const payload = buildTokenCounterPayload(messages, tools, providerConfig);
    const entries = payload.map((message, index) => {
        const content = String(message.content || '');
        const countedText = content + (message.reasoning_content || '');
        const bytes = textEncoder.encode(countedText).length;
        const isTools = tools.length > 0 && index === payload.length - 1;
        return {
            index: isTools ? -1 : index,
            kind: isTools ? 'tools' : 'message',
            role: String(message.role || ''),
            bytes,
            estimatedTokens: estimateTokenCount(countedText),
            containsLocalPath: content.includes('local/'),
            preview: normalizeDebugPreview(content),
        };
    });

    const serializedPayload = JSON.stringify(payload);
    const payloadBytes = textEncoder.encode(serializedPayload).length;
    const totalMessageBytes = entries
        .filter((entry) => entry.kind === 'message')
        .reduce((sum, entry) => sum + entry.bytes, 0);
    const toolEntry = entries.find((entry) => entry.kind === 'tools') || null;

    return {
        payloadBytes,
        payloadEstimatedTokens: estimateTokenCount(serializedPayload),
        totalMessageBytes,
        toolBytes: toolEntry?.bytes || 0,
        toolEstimatedTokens: toolEntry?.estimatedTokens || 0,
        messageCount: messages.length,
        entries,
        topEntries: [...entries]
            .sort((left, right) => right.bytes - left.bytes)
            .slice(0, CONTEXT_DEBUG_TOP_ENTRY_COUNT),
    };
}

function isContextStatsDebugEnabled() {
    try {
        return localStorage.getItem('xiaobaix_assistant_context_stats_debug') === '1';
    } catch {
        return false;
    }
}

function logContextStats(reason, {
    providerConfig,
    messages,
    tools,
    usedTokens,
    summaryActive,
} = {}) {
    if (!isContextStatsDebugEnabled()) return;
    const payloadSummary = summarizeContextPayload(messages, tools, providerConfig);
    console.info('[Assistant][ContextStats]', {
        reason,
        source: 'estimated',
        provider: String(providerConfig?.provider || ''),
        model: String(providerConfig?.model || ''),
        usedTokens,
        summaryActive: !!summaryActive,
        messageCount: payloadSummary.messageCount,
        toolCount: Array.isArray(tools) ? tools.length : 0,
        payloadBytes: payloadSummary.payloadBytes,
        payloadEstimatedTokens: payloadSummary.payloadEstimatedTokens,
        messageBytes: payloadSummary.totalMessageBytes,
        toolBytes: payloadSummary.toolBytes,
        toolEstimatedTokens: payloadSummary.toolEstimatedTokens,
    });
    console.info('[Assistant][ContextStats][TopEntries]', payloadSummary.topEntries);
}

export function createContextStatsController(deps) {
    const {
        state,
        getActiveProviderConfig,
        getToolDefinitions,
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
    } = deps;

    function resolveToolDefinitions(tools = null) {
        if (Array.isArray(tools)) return tools;
        if (typeof getToolDefinitions === 'function') {
            return getToolDefinitions();
        }
        return TOOL_DEFINITIONS;
    }

    function formatContextCount(tokens) {
        return `${Math.max(0, Math.round((Number(tokens) || 0) / 1000))}k`;
    }

    function buildContextMeterLabel(stats = state.contextStats) {
        return `${formatContextCount(stats.usedTokens)}/${formatContextCount(stats.budgetTokens)}`;
    }

    function updateContextStats(messages = [], tools = null) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        const summaryActive = !!state.historySummary;
        const estimatedTokens = estimateConversationTokens({ messages, tools: resolvedTools, providerConfig });

        state.contextStats = {
            usedTokens: estimatedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
            source: 'estimated',
        };
        logContextStats('updateContextStats', {
            providerConfig,
            messages,
            tools: resolvedTools,
            usedTokens: estimatedTokens,
            summaryActive,
        });
        return estimatedTokens;
    }

    return {
        buildContextMeterLabel,
        updateContextStats,
    };
}
