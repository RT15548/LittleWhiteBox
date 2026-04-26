import { readSseEventsFromResponse } from './sse.js';

export const HOST_CHAT_COMPLETIONS_SOURCE_OPENAI = 'openai';
export const HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT = '/api/backends/chat-completions/status';
export const HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT = '/api/backends/chat-completions/generate';

let requestHeadersProvider = null;

function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
}

export function setHostChatCompletionsRequestHeadersProvider(provider) {
    requestHeadersProvider = typeof provider === 'function' ? provider : null;
}

function buildHeaders() {
    const providedHeaders = requestHeadersProvider?.() || {};
    return {
        'Content-Type': 'application/json',
        ...providedHeaders,
        Accept: 'application/json',
    };
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

function buildOpenAICompatibleHostFields(config = {}) {
    const baseUrl = normalizeBaseUrl(config.baseUrl);
    const apiKey = String(config.apiKey || '').trim();
    const fields = {
        chat_completion_source: HOST_CHAT_COMPLETIONS_SOURCE_OPENAI,
    };

    if (baseUrl) {
        fields.reverse_proxy = baseUrl;
    }
    if (apiKey) {
        fields.proxy_password = apiKey;
    }

    return fields;
}

export function buildHostOpenAICompatibleStatusPayload(config = {}) {
    return buildOpenAICompatibleHostFields(config);
}

export function buildHostOpenAICompatibleGeneratePayload(config = {}, task = {}, messages = [], stream = false) {
    const body = {
        ...buildOpenAICompatibleHostFields(config),
        stream: !!stream,
        messages,
        model: config.model,
        max_tokens: task.maxTokens,
        temperature: task.reasoning?.enabled ? undefined : task.temperature,
        tools: Array.isArray(task.tools) && task.tools.length ? task.tools : undefined,
        tool_choice: Array.isArray(task.tools) && task.tools.length ? (task.toolChoice || 'auto') : undefined,
    };

    if (task.reasoning?.enabled) {
        body.reasoning_effort = task.reasoning.effort;
    }

    Object.keys(body).forEach((key) => {
        if (body[key] === undefined || body[key] === '') {
            delete body[key];
        }
    });

    return body;
}

export async function fetchHostOpenAICompatibleModels(config = {}, options = {}) {
    const response = await fetch(HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify(buildHostOpenAICompatibleStatusPayload(config)),
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

export async function createHostChatCompletion(payload = {}, options = {}) {
    const response = await fetch(HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
            ...payload,
            stream: false,
        }),
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
    const response = await fetch(HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
            ...payload,
            stream: true,
        }),
        signal: options.signal,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(normalizeHostFailureMessage(text, `酒馆后端流式生成失败：HTTP ${response.status}`));
    }

    await readSseEventsFromResponse(response, onEvent);
}
