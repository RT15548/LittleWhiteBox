import { getHostRequestHeaders } from '../../../shared/host-request-headers.js';
import {
    getLastUserMessageIndex,
    shouldPreserveHistoricalReasoning,
    shouldReplayFullNativeMessage,
} from '../adapters/openai-compatible-replay-policy.js';

const TOKEN_ESTIMATE_BYTES_PER_TOKEN = 3.35;
const textEncoder = new TextEncoder();

/** @typedef {{ tokens: number, source: 'tokenizer' | 'estimated' }} ConversationTokenCount */

function buildTokenCounterMessages(messages = [], tools = [], providerConfig = {}) {
    const preserveHistoricalReasoning = shouldPreserveHistoricalReasoning(providerConfig, tools);
    const nativeReplay = ['openai-compatible', 'sillytavern-openai-compatible'].includes(providerConfig.provider)
        && !(providerConfig.toolMode === 'tagged-json' && tools.length);
    const lastUserIndex = getLastUserMessageIndex(messages);
    return messages.map((message, index) => {
        const preserved = message.role === 'assistant' ? message.providerPayload?.openaiCompatibleMessage : null;
        const reasoningContent = typeof preserved?.reasoning_content === 'string'
            && (preserveHistoricalReasoning || (nativeReplay && shouldReplayFullNativeMessage(preserved, index, lastUserIndex)))
            ? preserved.reasoning_content : '';
        const reasoningField = reasoningContent ? { reasoning_content: reasoningContent } : {};
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
                ...reasoningField,
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
            ...reasoningField,
        };
    });
}

export function buildTokenCounterPayload(messages = [], tools = [], providerConfig = {}) {
    return [
        ...buildTokenCounterMessages(messages, tools, providerConfig),
        {
            role: 'system',
            content: tools.length ? `TOOLS\n${JSON.stringify(tools)}` : '',
        },
    ].filter((message) => message.content || message.reasoning_content);
}

export function estimateTokenCount(value = '') {
    return Math.ceil(textEncoder.encode(String(value || '')).length / TOKEN_ESTIMATE_BYTES_PER_TOKEN);
}

/** @param {{ messages?: Record<string, unknown>[], tools?: Record<string, unknown>[], providerConfig?: Record<string, unknown> }} [options] */
export function estimateConversationTokens({ messages = [], tools = [], providerConfig = {} } = {}) {
    return estimateTokenCount(JSON.stringify(buildTokenCounterPayload(messages, tools, providerConfig)));
}

export function getTokenizerModelHint(providerConfig = {}) {
    const model = String(providerConfig?.model || '').trim();
    if (model) return model;
    if (['anthropic', 'sillytavern-claude'].includes(providerConfig?.provider)) return 'claude';
    if (['google', 'sillytavern-google'].includes(providerConfig?.provider)) return 'gemini';
    return 'gpt-4o';
}

async function postJson(url, body, signal, requestHeaders) {
    signal?.throwIfAborted();
    const headers = await requestHeaders();
    signal?.throwIfAborted();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
        signal,
    });
    if (!response.ok) {
        throw new Error(`tokenizer_http_${response.status}`);
    }
    return await response.json();
}

/**
 * Host tokenizer count of the text/tool projection, not provider billing or image usage.
 * /count may return an unmarked estimate on failure; /encode lets us verify token IDs.
 * Counting is best-effort: unavailable Host headers or tokenization use the same
 * local estimate as previews. Callers must not cache that estimate as resolved.
 * @param {{ messages?: Record<string, unknown>[], tools?: Record<string, unknown>[] | null, providerConfig?: Record<string, unknown>, signal?: AbortSignal, requestHeaders?: () => object | Promise<object> }} [options]
 * @returns {Promise<ConversationTokenCount>}
 */
export async function resolveConversationTokens({ messages = [], tools = null, providerConfig = {}, signal, requestHeaders = getHostRequestHeaders } = {}) {
    const provider = String(providerConfig?.provider || '');
    const resolvedTools = Array.isArray(tools) ? tools : [];
    const payload = buildTokenCounterPayload(messages, resolvedTools, providerConfig);
    const flattenedText = JSON.stringify(payload);

    try {
        const endpoint = ['anthropic', 'sillytavern-claude'].includes(provider)
            ? '/api/tokenizers/claude/encode'
            : `/api/tokenizers/openai/encode?model=${encodeURIComponent(getTokenizerModelHint(providerConfig))}`;
        const data = await postJson(endpoint, { text: flattenedText }, signal, requestHeaders);
        signal?.throwIfAborted();
        if (!Number.isSafeInteger(data?.count) || data.count <= 0
            || !Array.isArray(data.ids) || data.ids.length !== data.count
            || !data.ids.every(id => Number.isSafeInteger(id) && id >= 0)) {
            throw new Error('tokenizer_invalid_response');
        }
        return { tokens: data.count, source: 'tokenizer' };
    } catch {
        signal?.throwIfAborted();
        return { tokens: estimateTokenCount(flattenedText), source: 'estimated' };
    }
}
