const TOKEN_ESTIMATE_BYTES_PER_TOKEN = 3.35;
const OPENAI_TOKENIZER_PROVIDERS = new Set(['openai-compatible', 'openai-responses', 'sillytavern-openai-compatible']);
const textEncoder = new TextEncoder();
const CONTEXT_DEBUG_PREVIEW_CHARS = 140;
const CONTEXT_DEBUG_TOP_ENTRY_COUNT = 6;

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

function normalizeDebugPreview(value, limit = CONTEXT_DEBUG_PREVIEW_CHARS) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function summarizeContextPayload(messages = [], tools = []) {
    const counterMessages = buildTokenCounterMessages(messages);
    const entries = counterMessages.map((message, index) => {
        const content = String(message.content || '');
        const bytes = textEncoder.encode(content).length;
        return {
            index,
            kind: 'message',
            role: String(message.role || ''),
            bytes,
            estimatedTokens: estimateTokenCount(content),
            containsLocalPath: content.includes('local/'),
            preview: normalizeDebugPreview(content),
        };
    });

    if (tools.length) {
        const toolContent = `TOOLS\n${JSON.stringify(tools)}`;
        const toolBytes = textEncoder.encode(toolContent).length;
        entries.push({
            index: -1,
            kind: 'tools',
            role: 'system',
            bytes: toolBytes,
            estimatedTokens: estimateTokenCount(toolContent),
            containsLocalPath: toolContent.includes('local/'),
            preview: normalizeDebugPreview(toolContent),
        });
    }

    const payload = buildTokenCounterPayload(messages, tools);
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
        messageCount: counterMessages.length,
        entries,
        topEntries: [...entries]
            .sort((left, right) => right.bytes - left.bytes)
            .slice(0, CONTEXT_DEBUG_TOP_ENTRY_COUNT),
    };
}

function logContextStats(reason, {
    providerConfig,
    messages,
    tools,
    usedTokens,
    summaryActive,
    cacheHit = false,
    source = 'estimated',
} = {}) {
    const payloadSummary = summarizeContextPayload(messages, tools);
    console.info('[Assistant][ContextStats]', {
        reason,
        source,
        cacheHit,
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

export function createContextStatsController(deps) {
    const {
        state,
        render,
        getActiveProviderConfig,
        getToolDefinitions,
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
    } = deps;

    let latestContextStatsSignature = '';
    let latestResolvedContextStatsSignature = '';
    let latestResolvedContextTokens = 0;
    let contextStatsRequestSerial = 0;

    function resolveToolDefinitions(tools = null) {
        if (Array.isArray(tools)) return tools;
        if (typeof getToolDefinitions === 'function') {
            return getToolDefinitions();
        }
        return TOOL_DEFINITIONS;
    }

    function buildContextStatsSignature(messages = [], tools = null) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        return JSON.stringify({
            provider: String(providerConfig?.provider || ''),
            model: String(providerConfig?.model || ''),
            messages: buildTokenCounterPayload(messages, resolvedTools),
        });
    }

    async function resolveConversationTokens({ messages = [], tools = null } = {}) {
        const providerConfig = getActiveProviderConfig();
        const provider = String(providerConfig?.provider || '');
        const resolvedTools = resolveToolDefinitions(tools);
        const payload = buildTokenCounterPayload(messages, resolvedTools);
        const flattenedText = JSON.stringify(payload);

        try {
            if (OPENAI_TOKENIZER_PROVIDERS.has(provider)) {
                return await countOpenAIContextTokens(payload, getTokenizerModelHint(providerConfig));
            }
            if (provider === 'anthropic') {
                return await countTextTokensWithEndpoint('/api/tokenizers/claude/encode', flattenedText);
            }
        } catch {
            return estimateConversationTokens({ messages, tools: resolvedTools });
        }

        return estimateConversationTokens({ messages, tools: resolvedTools });
    }

    async function forceUpdateContextStats(messages = [], tools = null) {
        const providerConfig = getActiveProviderConfig();
        const resolvedTools = resolveToolDefinitions(tools);
        const signature = buildContextStatsSignature(messages, resolvedTools);
        const summaryActive = !!state.historySummary;
        const cacheHit = latestResolvedContextStatsSignature === signature;
        let usedTokens = cacheHit
            ? latestResolvedContextTokens
            : await resolveConversationTokens({ messages, tools: resolvedTools });

        if (!Number.isFinite(usedTokens)) {
            usedTokens = estimateConversationTokens({ messages, tools: resolvedTools });
        }

        latestResolvedContextStatsSignature = signature;
        latestResolvedContextTokens = usedTokens;
        latestContextStatsSignature = signature;
        state.contextStats = {
            usedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
        };
        logContextStats('forceUpdateContextStats', {
            providerConfig,
            messages,
            tools: resolvedTools,
            usedTokens,
            summaryActive,
            cacheHit,
            source: cacheHit ? 'resolved-cache' : 'resolved',
        });
        return usedTokens;
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
        const signature = buildContextStatsSignature(messages, resolvedTools);
        const summaryActive = !!state.historySummary;
        const cacheHit = latestResolvedContextStatsSignature === signature;
        const estimatedTokens = cacheHit
            ? latestResolvedContextTokens
            : estimateConversationTokens({ messages, tools: resolvedTools });

        latestContextStatsSignature = signature;
        state.contextStats = {
            usedTokens: estimatedTokens,
            budgetTokens: MAX_CONTEXT_TOKENS,
            summaryActive,
        };
        logContextStats('updateContextStats', {
            providerConfig,
            messages,
            tools: resolvedTools,
            usedTokens: estimatedTokens,
            summaryActive,
            cacheHit,
            source: cacheHit ? 'resolved-cache' : 'estimated',
        });

        if (latestResolvedContextStatsSignature === signature) {
            return;
        }

        const requestSerial = ++contextStatsRequestSerial;
        resolveConversationTokens({ messages, tools: resolvedTools }).then((usedTokens) => {
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
            logContextStats('updateContextStats:resolved', {
                providerConfig,
                messages,
                tools: resolvedTools,
                usedTokens,
                summaryActive,
                cacheHit: false,
                source: 'resolved',
            });
            if (changed) {
                render();
            }
        }).catch(() => {
            // Keep estimated stats on tokenizer failure.
        });
    }

    return {
        buildContextMeterLabel,
        forceUpdateContextStats,
        updateContextStats,
    };
}
