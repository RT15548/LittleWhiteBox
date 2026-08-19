// Replay-only replacement for SillyTavern's browser-to-host chat-completions
// proxy. The plugin still builds the production payload; this adapter sends
// that payload to the configured OpenAI-compatible upstream from Node.

import { readSseEventsFromResponse } from '../../../shared/host-llm/chat-completions/sse.js';

let requestHeadersProvider = null;

function cleanPayload(body) {
    for (const key of Object.keys(body)) {
        if (body[key] === undefined || body[key] === '') delete body[key];
    }
    return body;
}

function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/+$/, '');
}

export function setHostChatCompletionsRequestHeadersProvider(provider) {
    requestHeadersProvider = typeof provider === 'function' ? provider : null;
}

export function buildHostOpenAICompatibleGeneratePayload(config = {}, task = {}, messages = [], stream = false) {
    const baseUrl = normalizeBaseUrl(config.baseUrl);
    const apiKey = String(config.apiKey || '').trim();
    return cleanPayload({
        chat_completion_source: 'openai',
        reverse_proxy: baseUrl,
        proxy_password: apiKey,
        stream: !!stream,
        messages,
        model: config.model,
        max_tokens: task.maxTokens,
        temperature: task.temperature,
        tools: Array.isArray(task.tools) && task.tools.length ? task.tools : undefined,
        tool_choice: Array.isArray(task.tools) && task.tools.length ? (task.toolChoice || 'auto') : undefined,
    });
}

async function buildDirectRequest(payload, stream) {
    // Invoke the provider lazily for parity with the browser client, but do not
    // forward SillyTavern CSRF/cookie headers to an external upstream.
    await Promise.resolve(requestHeadersProvider?.() || {});
    const baseUrl = normalizeBaseUrl(payload?.reverse_proxy);
    if (!/^https?:\/\//i.test(baseUrl)) throw new Error('Replay host adapter 缺少绝对 reverse_proxy URL');
    const apiKey = String(payload?.proxy_password || '').trim();
    const body = { ...payload, stream: !!stream };
    delete body.chat_completion_source;
    delete body.reverse_proxy;
    delete body.proxy_password;
    delete body.use_sysprompt;
    delete body.include_reasoning;
    return {
        url: `${baseUrl}/chat/completions`,
        headers: {
            'Content-Type': 'application/json',
            Accept: stream ? 'text/event-stream' : 'application/json',
            ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body,
    };
}

async function fetchDirect(payload, stream, options = {}) {
    const request = await buildDirectRequest(payload, stream);
    if (typeof options.onRequest === 'function') {
        options.onRequest({
            url: request.url,
            method: 'POST',
            headers: {
                ...request.headers,
                ...(request.headers.Authorization ? { Authorization: '[redacted]' } : {}),
            },
            body: request.body,
        });
    }
    const response = await fetch(request.url, {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(request.body),
        signal: options.signal,
    });
    return response;
}

function upstreamError(status, text) {
    const preview = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 300);
    return new Error(`Replay Summary upstream HTTP ${status}${preview ? `: ${preview}` : ''}`);
}

export async function createHostChatCompletion(payload = {}, options = {}) {
    const response = await fetchDirect(payload, false, options);
    const rawText = await response.text();
    if (!response.ok) throw upstreamError(response.status, rawText);
    let data;
    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
        throw new Error(`Replay Summary upstream JSON解析失败: ${error?.message || error}`);
    }
    if (data?.error) throw upstreamError(response.status || 500, data.error?.message || JSON.stringify(data.error));
    return data;
}

export async function streamHostChatCompletion(payload = {}, onEvent, options = {}) {
    const response = await fetchDirect(payload, true, options);
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw upstreamError(response.status, text);
    }
    await readSseEventsFromResponse(response, onEvent);
}
