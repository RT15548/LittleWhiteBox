const TOKEN_ESTIMATE_BYTES_PER_TOKEN = 3.35;
const OPENAI_TOKENIZER_PROVIDERS = new Set(['openai-compatible', 'openai-responses', 'sillytavern-openai-compatible']);
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

export function estimateTokenCount(value = '') {
    return Math.ceil(textEncoder.encode(String(value || '')).length / TOKEN_ESTIMATE_BYTES_PER_TOKEN);
}

export function estimateConversationTokens({ messages = [], tools = [] } = {}) {
    return estimateTokenCount(JSON.stringify(buildTokenCounterPayload(messages, tools)));
}

export function getTokenizerModelHint(providerConfig = {}) {
    const model = String(providerConfig?.model || '').trim();
    if (model) return model;
    if (providerConfig?.provider === 'anthropic') return 'claude';
    return 'gpt-4o';
}

async function postJson(url, body, signal) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal,
    });
    if (!response.ok) {
        throw new Error(`tokenizer_http_${response.status}`);
    }
    return await response.json();
}

async function countOpenAIContextTokens(messages = [], model = '', signal) {
    if (!messages.length) return 0;
    const endpoint = `/api/tokenizers/openai/count?model=${encodeURIComponent(model || 'gpt-4o')}`;
    const data = await postJson(endpoint, messages, signal);
    const tokenCount = Number(data?.token_count);
    if (!Number.isFinite(tokenCount)) {
        throw new Error('tokenizer_invalid_response');
    }
    return tokenCount;
}

async function countTextTokensWithEndpoint(endpoint, text, signal) {
    const data = await postJson(endpoint, { text }, signal);
    const tokenCount = Number(data?.count);
    if (!Number.isFinite(tokenCount)) {
        throw new Error('tokenizer_invalid_response');
    }
    return tokenCount;
}

export async function resolveConversationTokens({ messages = [], tools = null, providerConfig = {}, signal } = {}) {
    const provider = String(providerConfig?.provider || '');
    const resolvedTools = Array.isArray(tools) ? tools : [];
    const payload = buildTokenCounterPayload(messages, resolvedTools);
    const flattenedText = JSON.stringify(payload);

    try {
        if (OPENAI_TOKENIZER_PROVIDERS.has(provider)) {
            return await countOpenAIContextTokens(payload, getTokenizerModelHint(providerConfig), signal);
        }
        if (provider === 'anthropic') {
            return await countTextTokensWithEndpoint('/api/tokenizers/claude/encode', flattenedText, signal);
        }
    } catch (error) {
        if (signal?.aborted || error?.name === 'AbortError') {
            throw error;
        }
        return estimateConversationTokens({ messages, tools: resolvedTools });
    }

    return estimateConversationTokens({ messages, tools: resolvedTools });
}
