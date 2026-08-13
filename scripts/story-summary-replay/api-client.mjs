import { GoogleGenAI } from '@google/genai';

import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../shared/common/openai-url-utils.js';

function normalizeProvider(provider) {
    const value = String(provider || 'custom').trim().toLowerCase();
    if (['anthropic', 'claude'].includes(value)) return 'anthropic';
    if (['google', 'gemini'].includes(value)) return 'google';
    if (['openai', 'custom', 'deepseek', 'cohere'].includes(value)) return 'openai';
    return value;
}

function applyGenerationParams(body, args) {
    const numericFields = [
        ['temperature', 'temperature'],
        ['top_p', 'top_p'],
        ['top_k', 'top_k'],
        ['presence_penalty', 'presence_penalty'],
        ['frequency_penalty', 'frequency_penalty'],
    ];

    for (const [argKey, bodyKey] of numericFields) {
        const raw = args?.[argKey];
        if (raw == null || raw === '') continue;
        const value = Number(raw);
        if (!Number.isFinite(value)) continue;
        body[bodyKey] = value;
    }
}

function extractOpenAiText(payload) {
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    return content
        .map((part) => {
            if (typeof part === 'string') return part;
            if (part?.type === 'text' && typeof part?.text === 'string') return part.text;
            return '';
        })
        .join('');
}

function safeRateHeaders(headers) {
    const out = {};
    try {
        for (const [key, value] of headers.entries()) {
            if (/^(?:x-)?ratelimit|^x-ratelimit|^retry-after$/i.test(key)) out[key.toLowerCase()] = value;
        }
    } catch {}
    return out;
}

function notifyTransport(args, value) {
    if (typeof args?.onTransport !== 'function') return;
    try {
        args.onTransport(value);
    } catch {}
}

async function callOpenAiCompatible(apiConfig, messages, args) {
    const baseUrl = resolveApiBaseUrl(
        String(apiConfig.url || ''),
        getDefaultApiPrefix(apiConfig.provider || 'custom'),
    );
    const body = {
        model: String(apiConfig.model || '').trim(),
        messages,
        stream: false,
    };
    applyGenerationParams(body, args);
    const maxTokens = Number(args?.max_tokens);
    if (Number.isInteger(maxTokens) && maxTokens > 0) body.max_tokens = maxTokens;
    const reasoningEffort = String(args?.reasoning_effort || '').trim();
    if (reasoningEffort) body.reasoning_effort = reasoningEffort;

    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiConfig.key || ''}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const baseTransport = {
        status: response.status,
        elapsedMs: Math.max(0, Date.now() - startedAt),
        rateHeaders: safeRateHeaders(response.headers),
    };
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        notifyTransport(args, { ...baseTransport, usage: null });
        const error = new Error(`Summary API ${response.status}: ${errorText.slice(0, 300)}`);
        error.httpStatus = response.status;
        error.rateHeaders = baseTransport.rateHeaders;
        throw error;
    }
    const data = await response.json();
    notifyTransport(args, { ...baseTransport, usage: data?.usage || data?.meta?.tokens || null });
    if (typeof args?.onResponse === 'function') {
        try {
            args.onResponse(data);
        } catch {}
    }
    return String(extractOpenAiText(data) || '').trim();
}

function splitAnthropicMessages(messages) {
    const systemLines = [];
    const chatMessages = [];
    for (const message of messages) {
        if (message.role === 'system') {
            systemLines.push(message.content);
        } else {
            chatMessages.push({
                role: message.role === 'assistant' ? 'assistant' : 'user',
                content: [{ type: 'text', text: message.content }],
            });
        }
    }
    return { system: systemLines.join('\n\n').trim(), messages: chatMessages };
}

function extractAnthropicText(payload) {
    if (!Array.isArray(payload?.content)) return '';
    return payload.content
        .map(part => part?.type === 'text' ? String(part?.text || '') : '')
        .join('');
}

async function callAnthropic(apiConfig, messages, args) {
    const { system, messages: anthropicMessages } = splitAnthropicMessages(messages);
    const baseUrl = String(apiConfig.url || 'https://api.anthropic.com').replace(/\/+$/, '');
    const body = {
        model: String(apiConfig.model || '').trim(),
        max_tokens: Math.max(32000, Number(args?.max_tokens) || 32000),
        messages: anthropicMessages,
    };
    if (system) body.system = system;
    applyGenerationParams(body, args);

    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
            'x-api-key': apiConfig.key || '',
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });
    const baseTransport = {
        status: response.status,
        elapsedMs: Math.max(0, Date.now() - startedAt),
        rateHeaders: safeRateHeaders(response.headers),
    };
    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        notifyTransport(args, { ...baseTransport, usage: null });
        const error = new Error(`Anthropic API ${response.status}: ${errorText.slice(0, 300)}`);
        error.httpStatus = response.status;
        error.rateHeaders = baseTransport.rateHeaders;
        throw error;
    }
    const payload = await response.json();
    notifyTransport(args, { ...baseTransport, usage: payload?.usage || null });
    if (typeof args?.onResponse === 'function') {
        try { args.onResponse(payload); } catch {}
    }
    return String(extractAnthropicText(payload) || '').trim();
}

function toGoogleContents(messages) {
    const systemLines = [];
    const contents = [];
    for (const message of messages) {
        if (message.role === 'system') {
            systemLines.push(message.content);
        } else {
            contents.push({
                role: message.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: message.content }],
            });
        }
    }
    return { contents, systemInstruction: systemLines.join('\n\n').trim() };
}

function extractGoogleText(response) {
    if (typeof response?.text === 'string' && response.text.trim()) return response.text.trim();
    if (typeof response?.text === 'function') {
        const text = response.text();
        if (typeof text === 'string' && text.trim()) return text.trim();
    }
    return (response?.candidates?.[0]?.content?.parts || [])
        .map(part => String(part?.text || ''))
        .join('')
        .trim();
}

export function resolveGoogleThinkingConfig(reasoningEffort) {
    const effort = String(reasoningEffort || '').trim().toLowerCase();
    if (!effort) return null;
    // Gemini-compatible gateways do not consistently accept thinkingBudget=0.
    // `none` means the caller has no thinking override; omit thinkingConfig so
    // the request remains valid across Google-compatible endpoints.
    if (['none', 'off', 'disabled'].includes(effort)) return null;
    if (['minimal', 'low', 'medium', 'high'].includes(effort)) {
        return { thinkingLevel: effort.toUpperCase() };
    }
    throw new Error(`Google reasoning_effort 不支持: ${reasoningEffort}`);
}

async function callGoogle(apiConfig, messages, args) {
    const { contents, systemInstruction } = toGoogleContents(messages);
    const baseUrl = String(apiConfig.url || '').trim();
    const provider = String(apiConfig.provider || 'google').toLowerCase();
    const ai = new GoogleGenAI({
        apiKey: apiConfig.key || undefined,
        vertexai: provider.includes('vertex') || /vertex/i.test(baseUrl),
        httpOptions: baseUrl ? { baseUrl, apiVersion: '' } : undefined,
    });
    const config = {};
    if (systemInstruction) config.systemInstruction = systemInstruction;
    applyGenerationParams(config, args);
    const maxTokens = Number(args?.max_tokens);
    if (Number.isInteger(maxTokens) && maxTokens > 0) config.maxOutputTokens = maxTokens;
    const thinkingConfig = resolveGoogleThinkingConfig(args?.reasoning_effort);
    if (thinkingConfig) config.thinkingConfig = thinkingConfig;
    const response = await ai.models.generateContent({
        model: String(apiConfig.model || '').trim(),
        contents,
        config,
    });
    notifyTransport(args, {
        status: null,
        elapsedMs: null,
        rateHeaders: {},
        usage: response?.usageMetadata || null,
    });
    if (typeof args?.onResponse === 'function') {
        try { args.onResponse(response); } catch {}
    }
    return extractGoogleText(response);
}

export async function callSummaryApi(apiConfig, messages, args = {}) {
    const provider = normalizeProvider(apiConfig?.provider);
    if (provider === 'anthropic') return await callAnthropic(apiConfig, messages, args);
    if (provider === 'google') return await callGoogle(apiConfig, messages, args);
    if (provider === 'st') {
        throw new Error('Replay runner does not support provider "st"; please provide a direct summary API config.');
    }
    return await callOpenAiCompatible(apiConfig, messages, args);
}
