const TOKEN_ESTIMATE_BYTES_PER_TOKEN = 3.35;
const OPENAI_TOKENIZER_PROVIDERS = new Set(['openai-compatible', 'openai-responses']);
const textEncoder = new TextEncoder();

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
        TOOL_DEFINITIONS,
        MAX_CONTEXT_TOKENS,
    } = deps;

    let latestContextStatsSignature = '';
    let latestResolvedContextStatsSignature = '';
    let latestResolvedContextTokens = 0;
    let contextStatsRequestSerial = 0;

    function buildContextStatsSignature(messages = [], tools = TOOL_DEFINITIONS) {
        const providerConfig = getActiveProviderConfig();
        return JSON.stringify({
            provider: String(providerConfig?.provider || ''),
            model: String(providerConfig?.model || ''),
            messages: buildTokenCounterPayload(messages, tools),
        });
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

    function formatContextCount(tokens) {
        return `${Math.max(0, Math.round((Number(tokens) || 0) / 1000))}k`;
    }

    function buildContextMeterLabel(stats = state.contextStats) {
        return `${formatContextCount(stats.usedTokens)}/${formatContextCount(stats.budgetTokens)}`;
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

    return {
        buildContextMeterLabel,
        forceUpdateContextStats,
        updateContextStats,
    };
}
