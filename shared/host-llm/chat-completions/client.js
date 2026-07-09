import { readSseEventsFromResponse } from './sse.js';

export const HOST_CHAT_COMPLETIONS_SOURCE_OPENAI = 'openai';
export const HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE = 'claude';
export const HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE = 'makersuite';
export const HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT = '/api/backends/chat-completions/status';
export const HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT = '/api/backends/chat-completions/generate';
export const HOST_CHAT_COMPLETIONS_DEFAULT_REVERSE_PROXY = Object.freeze({
    [HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE]: 'https://api.anthropic.com/v1',
    [HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE]: 'https://generativelanguage.googleapis.com',
});

let requestHeadersProvider = null;

function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
}

function normalizeReverseProxyForSource(value, source) {
    const baseUrl = normalizeBaseUrl(value);
    if (source === HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE) {
        if (!baseUrl || /\/v\d[\w.-]*$/i.test(baseUrl)) return baseUrl;
        return `${baseUrl}/v1`;
    }
    if (source === HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE) {
        return baseUrl.replace(/\/v\d[\w.-]*$/i, '');
    }
    return baseUrl;
}

export function setHostChatCompletionsRequestHeadersProvider(provider) {
    requestHeadersProvider = typeof provider === 'function' ? provider : null;
}

async function buildHeaders() {
    const providedHeaders = await Promise.resolve(requestHeadersProvider?.() || {});
    return {
        'Content-Type': 'application/json',
        ...providedHeaders,
        Accept: 'application/json',
    };
}

function redactHeaders(headers = {}) {
    const redacted = {};
    Object.entries(headers || {}).forEach(([key, value]) => {
        redacted[key] = /authorization|csrf|token|api[-_]?key/i.test(key)
            ? '[redacted]'
            : value;
    });
    return redacted;
}

export async function buildHostChatCompletionGenerateRequest(payload = {}, stream = false) {
    const rawHeaders = await buildHeaders();
    const request = {
        url: HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT,
        method: 'POST',
        headers: redactHeaders(rawHeaders),
        body: {
            ...payload,
            stream: !!stream,
        },
    };
    Object.defineProperty(request, 'rawHeaders', {
        value: rawHeaders,
        enumerable: false,
    });
    return request;
}

function looksLikeHtmlDocument(text = '') {
    return /^\s*<!DOCTYPE\s+html/i.test(String(text || ''));
}

function isCsrfFailureText(text = '') {
    return /invalid csrf token/i.test(String(text || ''));
}

function buildCsrfRefreshMessage() {
    return '酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。';
}

function normalizeHostFailureMessage(rawText = '', fallbackMessage = '') {
    if (isCsrfFailureText(rawText) || looksLikeHtmlDocument(rawText)) {
        return buildCsrfRefreshMessage();
    }
    return String(rawText || fallbackMessage || '').trim();
}

function buildHostChatCompletionsFields(config = {}, source = HOST_CHAT_COMPLETIONS_SOURCE_OPENAI) {
    const baseUrl = normalizeReverseProxyForSource(config.baseUrl, source);
    const apiKey = String(config.apiKey || '').trim();
    const defaultReverseProxy = HOST_CHAT_COMPLETIONS_DEFAULT_REVERSE_PROXY[source] || '';
    const reverseProxy = baseUrl || (apiKey ? defaultReverseProxy : '');
    const fields = {
        chat_completion_source: source || HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
    };

    if (reverseProxy) {
        fields.reverse_proxy = reverseProxy;
    }
    if (apiKey) {
        fields.proxy_password = apiKey;
    }

    return fields;
}

function cleanPayload(body = {}) {
    Object.keys(body).forEach((key) => {
        if (body[key] === undefined || body[key] === '') {
            delete body[key];
        }
    });
    return body;
}

export function buildHostChatCompletionsStatusPayload(config = {}, source = HOST_CHAT_COMPLETIONS_SOURCE_OPENAI) {
    return buildHostChatCompletionsFields(config, source);
}

export function buildHostOpenAICompatibleStatusPayload(config = {}) {
    return buildHostChatCompletionsStatusPayload(config, HOST_CHAT_COMPLETIONS_SOURCE_OPENAI);
}

export function buildHostChatCompletionsGeneratePayload(
    config = {},
    task = {},
    messages = [],
    stream = false,
    source = HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
) {
    return cleanPayload({
        ...buildHostChatCompletionsFields(config, source),
        stream: !!stream,
        messages,
        model: config.model,
        max_tokens: task.maxTokens,
        temperature: task.reasoning?.enabled ? undefined : task.temperature,
        tools: Array.isArray(task.tools) && task.tools.length ? task.tools : undefined,
        tool_choice: Array.isArray(task.tools) && task.tools.length ? (task.toolChoice || 'auto') : undefined,
        use_sysprompt: source === HOST_CHAT_COMPLETIONS_SOURCE_OPENAI ? undefined : true,
        reasoning_effort: task.reasoning?.enabled ? task.reasoning.effort : undefined,
        include_reasoning: source === HOST_CHAT_COMPLETIONS_SOURCE_OPENAI
            ? undefined
            : (task.reasoning?.enabled ? true : undefined),
    });
}

export function buildHostOpenAICompatibleGeneratePayload(config = {}, task = {}, messages = [], stream = false) {
    return buildHostChatCompletionsGeneratePayload(
        config,
        task,
        messages,
        stream,
        HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
    );
}

export function buildHostClaudeGeneratePayload(config = {}, task = {}, messages = [], stream = false) {
    return buildHostChatCompletionsGeneratePayload(
        config,
        task,
        messages,
        stream,
        HOST_CHAT_COMPLETIONS_SOURCE_CLAUDE,
    );
}

export function buildHostGoogleGeneratePayload(config = {}, task = {}, messages = [], stream = false) {
    return buildHostChatCompletionsGeneratePayload(
        config,
        task,
        messages,
        stream,
        HOST_CHAT_COMPLETIONS_SOURCE_MAKERSUITE,
    );
}

export async function fetchHostChatCompletionsModels(
    config = {},
    source = HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
    options = {},
) {
    const response = await fetch(HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT, {
        method: 'POST',
        headers: await buildHeaders(),
        body: JSON.stringify(buildHostChatCompletionsStatusPayload(config, source)),
        signal: options.signal,
    });
    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
        throw new Error(`酒馆后端模型列表拉取失败：${normalizeHostFailureMessage(rawText, String(error?.message || error))}`);
    }

    if (!response.ok || data?.error) {
        const message = normalizeHostFailureMessage(
            data?.message || data?.error?.message || rawText,
            `HTTP ${response.status}`,
        );
        throw new Error(`酒馆后端模型列表拉取失败：${message}`);
    }

    const models = Array.isArray(data?.data)
        ? data.data.map((item) => String(item?.id || item?.name || '').trim()).filter(Boolean)
        : [];
    return [...new Set(models)];
}

export async function fetchHostOpenAICompatibleModels(config = {}, options = {}) {
    return await fetchHostChatCompletionsModels(config, HOST_CHAT_COMPLETIONS_SOURCE_OPENAI, options);
}

export async function createHostChatCompletion(payload = {}, options = {}) {
    const request = await buildHostChatCompletionGenerateRequest(payload, false);
    if (typeof options.onRequest === 'function') {
        options.onRequest(request);
    }
    const response = await fetch(request.url, {
        method: request.method,
        headers: request.rawHeaders || request.headers,
        body: JSON.stringify(request.body),
        signal: options.signal,
    });

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
        throw new Error(`酒馆后端生成失败：${normalizeHostFailureMessage(rawText, String(error?.message || error))}`);
    }

    if (!response.ok || data?.error) {
        const message = normalizeHostFailureMessage(
            data?.error?.message || data?.message || rawText,
            `HTTP ${response.status}`,
        );
        throw new Error(`酒馆后端生成失败：${message}`);
    }

    return data;
}

export async function streamHostChatCompletion(payload = {}, onEvent, options = {}) {
    const request = await buildHostChatCompletionGenerateRequest(payload, true);
    if (typeof options.onRequest === 'function') {
        options.onRequest(request);
    }
    const response = await fetch(request.url, {
        method: request.method,
        headers: request.rawHeaders || request.headers,
        body: JSON.stringify(request.body),
        signal: options.signal,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(normalizeHostFailureMessage(text, `酒馆后端流式生成失败：HTTP ${response.status}`));
    }

    await readSseEventsFromResponse(response, (event) => {
        if (event?.error) {
            const message = normalizeHostFailureMessage(
                event.error?.message || event.message || JSON.stringify(event.error),
                '酒馆后端流式生成失败',
            );
            throw new Error(message);
        }
        onEvent(event);
    });
}
