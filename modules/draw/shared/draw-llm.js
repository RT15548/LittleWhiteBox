import { chat, eventSource, event_types, getRequestHeaders, name1, name2, substituteParams } from "../../../../../../../script.js";
import { chat_completion_sources, getChatCompletionModel, getStreamingReply, oai_settings } from "../../../../../../../scripts/openai.js";
import { replaceXbGetVarInString, replaceXbGetVarYamlInString } from "../../variables/var-commands.js";
import { resolveApiBaseUrl, getDefaultApiPrefix } from "../../../shared/common/openai-url-utils.js";
import { readSseEventsFromResponse } from "../../../shared/host-llm/chat-completions/sse.js";

const DRAW_CHAT_COMPLETIONS_STATUS_ENDPOINT = '/api/backends/chat-completions/status';
const DRAW_CHAT_COMPLETIONS_ENDPOINT = '/api/backends/chat-completions/generate';
const SUPPORTED_DRAW_PROVIDERS = new Set(['st', 'openai', 'claude', 'google', 'gemini', 'anthropic']);
let lastDrawLlmRequestSnapshot = null;

function cloneJson(value) {
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return value;
    }
}

function redactPayload(value) {
    const cloned = cloneJson(value);
    const sensitiveKey = /^(proxy_password|api_key|key|password|authorization|x-api-key|custom_include_headers|custom_include_body)$/i;
    const visit = (item) => {
        if (!item || typeof item !== 'object') return;
        if (Array.isArray(item)) {
            item.forEach(visit);
            return;
        }
        for (const [key, nested] of Object.entries(item)) {
            if (sensitiveKey.test(key) && nested) {
                item[key] = '***';
            } else {
                visit(nested);
            }
        }
    };
    visit(cloned);
    return cloned;
}

export function getLastDrawLlmRequestSnapshot() {
    return cloneJson(lastDrawLlmRequestSnapshot);
}

function normalizeText(value) {
    return String(value ?? '').replace(/\r\n/g, '\n');
}

function extractTextFromMessage(message) {
    if (typeof message?.mes === 'string') return normalizeText(message.mes);
    if (typeof message?.content === 'string') return normalizeText(message.content);
    if (Array.isArray(message?.content)) {
        return message.content
            .filter(part => part && part.type === 'text' && typeof part.text === 'string')
            .map(part => normalizeText(part.text))
            .join('\n');
    }
    return '';
}

function resolveHistoryPlaceholder(text) {
    if (typeof text !== 'string' || !text.includes('{$history')) return text;
    const chatArr = Array.isArray(chat) ? chat : [];
    if (!chatArr.length) return text;

    return text.replace(/\{\$history(\d{1,3})\}/gi, (_match, countStr) => {
        const count = Math.max(1, Math.min(200, Number(countStr) || 1));
        const start = Math.max(0, chatArr.length - count);
        const lines = [];
        for (let i = start; i < chatArr.length; i++) {
            const msg = chatArr[i];
            const speaker = msg?.is_user
                ? ((msg?.name && String(msg.name).trim()) || name1 || 'USER')
                : ((msg?.name && String(msg.name).trim()) || name2 || 'ASSISTANT');
            lines.push(`${speaker}：`);
            const content = extractTextFromMessage(msg).trim();
            if (content) lines.push(content);
            lines.push('');
        }
        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    });
}

async function expandStVariableMacros(text) {
    if (typeof window?.STscript !== 'function') return text;
    let output = String(text ?? '');
    const escapeForCmd = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    const readRootValue = async (macroRe, getCommand) => {
        const found = [];
        macroRe.lastIndex = 0;
        let match;
        while ((match = macroRe.exec(output)) !== null) {
            const path = String(match[1] || '').trim();
            if (path) found.push({ full: match[0], path });
        }
        if (!found.length) return;

        const splitRoot = (path) => {
            const index = path.indexOf('.');
            return index === -1 ? [path, ''] : [path.slice(0, index), path.slice(index + 1)];
        };
        const dig = (value, tail) => {
            if (!tail) return value;
            let current = value;
            for (const key of tail.split('.').filter(Boolean)) {
                if (current && typeof current === 'object' && key in current) current = current[key];
                else return '';
            }
            return current;
        };

        const cache = new Map();
        const roots = [...new Set(found.map(item => splitRoot(item.path)[0]))];
        await Promise.all(roots.map(async (root) => {
            try {
                const result = await window.STscript(getCommand(root));
                try {
                    cache.set(root, JSON.parse(result));
                } catch {
                    cache.set(root, result);
                }
            } catch {
                cache.set(root, '');
            }
        }));

        for (const item of found) {
            const [root, tail] = splitRoot(item.path);
            const value = dig(cache.get(root), tail);
            const replacement = typeof value === 'string' ? value : (value == null ? '' : JSON.stringify(value));
            output = output.split(item.full).join(replacement);
        }
    };

    await readRootValue(/\{\{getvar::([\s\S]*?)\}\}/gi, root => `/getvar key=${escapeForCmd(root)}`);
    await readRootValue(/\{\{getglobalvar::([\s\S]*?)\}\}/gi, root => `/getglobalvar ${escapeForCmd(root)}`);
    return output;
}

async function expandPromptText(text) {
    let output = normalizeText(text);
    try { output = replaceXbGetVarInString(output); } catch {}
    try { output = replaceXbGetVarYamlInString(output); } catch {}
    output = await expandStVariableMacros(output);
    try { output = substituteParams(output); } catch {}
    output = resolveHistoryPlaceholder(output);
    return output;
}

async function expandMessages(messages) {
    const expanded = [];
    for (const message of messages) {
        if (!message || typeof message.content !== 'string') continue;
        const content = await expandPromptText(message.content);
        expanded.push({ ...message, content });
    }
    return expanded;
}

async function emitPromptReady(messages) {
    const snapshot = cloneJson(messages);
    try {
        await eventSource?.emit?.(event_types.CHAT_COMPLETION_PROMPT_READY, { chat: snapshot, dryRun: false });
    } catch {}
    // Draw planner keeps this event for preview/compatibility, but should not let
    // third-party prompt mutators rewrite the actual request roles/messages.
    return messages;
}

function normalizeProvider(provider) {
    const value = String(provider || 'st').trim().toLowerCase();
    if (!SUPPORTED_DRAW_PROVIDERS.has(value)) return 'st';
    if (value === 'gemini') return 'google';
    if (value === 'anthropic') return 'claude';
    return value || 'st';
}

export function normalizeDrawLlmApi(llmApi = {}) {
    const provider = normalizeProvider(llmApi.provider);
    if (provider === 'st') {
        return { provider: 'st', url: '', key: '', model: '', modelCache: [] };
    }
    return {
        provider,
        url: String(llmApi.url || '').trim(),
        key: String(llmApi.key || '').trim(),
        model: String(llmApi.model || '').trim(),
        modelCache: Array.isArray(llmApi.modelCache) ? [...llmApi.modelCache] : [],
    };
}

function getCurrentStApiAndModel() {
    const source = oai_settings?.chat_completion_source || chat_completion_sources.OPENAI;
    const model = getChatCompletionModel();
    return { source, model };
}

function num(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function buildSamplingFields(source) {
    const temp = num(oai_settings?.temp_openai);
    const presence = num(oai_settings?.pres_pen_openai);
    const frequency = num(oai_settings?.freq_pen_openai);
    const topPOpenAI = num(oai_settings?.top_p_openai ?? oai_settings?.top_p);
    const topPGemini = num(oai_settings?.makersuite_top_p ?? oai_settings?.top_p);
    const topKGemini = num(oai_settings?.makersuite_top_k ?? oai_settings?.top_k);
    const maxOpenAI = num(oai_settings?.openai_max_tokens ?? oai_settings?.max_tokens);
    const maxGemini = num(oai_settings?.makersuite_max_tokens ?? oai_settings?.max_output_tokens ?? oai_settings?.openai_max_tokens ?? oai_settings?.max_tokens);
    const fields = {
        temperature: temp ?? 0.7,
        presence_penalty: presence,
        frequency_penalty: frequency,
        top_p: source === chat_completion_sources.MAKERSUITE ? topPGemini : topPOpenAI,
        max_tokens: source === chat_completion_sources.MAKERSUITE ? (maxGemini ?? maxOpenAI ?? 4000) : (maxOpenAI ?? 4000),
        include_reasoning: oai_settings?.show_thoughts ?? true,
        reasoning_effort: oai_settings?.reasoning_effort || 'medium',
    };
    if (source === chat_completion_sources.MAKERSUITE) {
        fields.top_k = topKGemini;
        fields.max_output_tokens = fields.max_tokens;
    }
    if (source === chat_completion_sources.CLAUDE) {
        fields.top_k = num(oai_settings?.top_k_openai);
        fields.claude_use_sysprompt = oai_settings?.claude_use_sysprompt ?? false;
    }
    return fields;
}

function resolveGeminiBackendBaseUrl(url) {
    return resolveApiBaseUrl(url, '').replace(/\/v\d[\w.-]*$/i, '');
}

function applyCurrentStProviderSettings(payload, source) {
    if (oai_settings?.reverse_proxy) {
        payload.reverse_proxy = oai_settings.reverse_proxy;
        payload.proxy_password = oai_settings.proxy_password;
    }

    if (source === chat_completion_sources.CUSTOM) {
        payload.custom_url = oai_settings.custom_url;
        payload.custom_include_body = oai_settings.custom_include_body;
        payload.custom_exclude_body = oai_settings.custom_exclude_body;
        payload.custom_include_headers = oai_settings.custom_include_headers;
    }

    if (source === chat_completion_sources.OPENROUTER) {
        payload.provider = oai_settings.openrouter_providers;
        payload.middleout = oai_settings.openrouter_middleout;
        payload.allow_fallbacks = oai_settings.openrouter_allow_fallbacks;
    }

    if (source === chat_completion_sources.VERTEXAI) {
        payload.vertexai_auth_mode = oai_settings.vertexai_auth_mode;
        payload.vertexai_region = oai_settings.vertexai_region;
        payload.vertexai_express_project_id = oai_settings.vertexai_express_project_id;
    }
}

function buildProviderPayload(llmApi, messages, stream) {
    const api = normalizeDrawLlmApi(llmApi);
    let source;
    let model;
    let reverseProxy = '';
    let proxyPassword = '';

    if (api.provider === 'st') {
        const current = getCurrentStApiAndModel();
        source = current.source;
        model = current.model;
    } else if (api.provider === 'openai') {
        source = chat_completion_sources.OPENAI;
        model = api.model;
        reverseProxy = api.url ? resolveApiBaseUrl(api.url, getDefaultApiPrefix('openai')) : '';
        proxyPassword = api.key;
    } else if (api.provider === 'claude') {
        source = chat_completion_sources.CLAUDE;
        model = api.model;
        reverseProxy = api.url ? resolveApiBaseUrl(api.url, getDefaultApiPrefix('claude')) : '';
        proxyPassword = api.key;
    } else {
        source = chat_completion_sources.MAKERSUITE;
        model = api.model;
        // SillyTavern's Gemini backend appends its configured API version itself.
        // Supplying /v1beta here would become /v1beta/v1beta/models/...
        reverseProxy = api.url ? resolveGeminiBackendBaseUrl(api.url) : '';
        proxyPassword = api.key;
    }

    if (!model) {
        throw new Error('未检测到当前模型，请在聊天面板选择模型或在插件设置中为分析显式指定模型。');
    }

    const payload = {
        chat_completion_source: source,
        messages,
        model,
        stream: !!stream,
        use_sysprompt: true,
        custom_prompt_post_processing: undefined,
        ...buildSamplingFields(source),
    };

    if (api.provider === 'st') applyCurrentStProviderSettings(payload, source);
    if (reverseProxy) payload.reverse_proxy = reverseProxy;
    if (proxyPassword) payload.proxy_password = proxyPassword;

    Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === '') delete payload[key];
    });

    return payload;
}

function buildProviderStatusPayload(llmApi) {
    const api = normalizeDrawLlmApi(llmApi);
    let source = '';
    let reverseProxy = '';
    let proxyPassword = '';

    if (api.provider === 'openai') {
        source = chat_completion_sources.OPENAI;
        reverseProxy = api.url ? resolveApiBaseUrl(api.url, getDefaultApiPrefix('openai')) : '';
        proxyPassword = api.key;
    } else if (api.provider === 'google') {
        source = chat_completion_sources.MAKERSUITE;
        reverseProxy = api.url ? resolveGeminiBackendBaseUrl(api.url) : '';
        proxyPassword = api.key;
    } else if (api.provider === 'claude') {
        throw new Error('Claude 渠道暂不支持从酒馆后端拉取模型列表，请手动填写模型 ID。');
    } else {
        throw new Error('当前渠道无需拉取模型列表。');
    }

    if (!proxyPassword) {
        throw new Error('请先填写 API KEY。');
    }

    const payload = {
        chat_completion_source: source,
        reverse_proxy: reverseProxy,
        proxy_password: proxyPassword,
    };

    Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === '') delete payload[key];
    });

    return payload;
}

function extractModelIds(data) {
    const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.models)
            ? data.models
            : [];
    return [...new Set(list
        .map((item) => String(item?.id || item?.name || item || '').replace(/^models\//, '').trim())
        .filter(Boolean))];
}

export async function fetchDrawLlmModels(llmApi = {}, { signal = null } = {}) {
    const payload = buildProviderStatusPayload(llmApi);
    const response = await fetch(DRAW_CHAT_COMPLETIONS_STATUS_ENDPOINT, {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify(payload),
        signal,
    });

    const rawText = await response.text();
    let data = null;
    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        throw new Error(rawText || '模型列表返回不是 JSON');
    }

    const models = extractModelIds(data);
    if (!response.ok || (data?.error && !models.length)) {
        throw new Error(data?.message || data?.error?.message || rawText || `HTTP ${response.status}`);
    }
    if (!models.length) {
        throw new Error('未获取到模型列表');
    }

    return models;
}

function convertTrailingAssistantForClaude(messages, llmApi) {
    const provider = normalizeDrawLlmApi(llmApi).provider;
    const isClaude = provider === 'claude'
        || (provider === 'st' && oai_settings?.chat_completion_source === chat_completion_sources.CLAUDE);
    if (!isClaude || !Array.isArray(messages) || !messages.length) return messages;
    const last = messages[messages.length - 1];
    if (last?.role !== 'assistant') return messages;
    const assistantText = extractTextFromMessage(last).trim();
    return [
        ...messages.slice(0, -1),
        { ...last, role: 'system', content: assistantText ? `Assistant:\n${assistantText}` : 'Assistant:' },
    ];
}

function extractMessageText(data) {
    const message = data?.choices?.[0]?.message;
    return String(
        message?.content ??
        message?.reasoning_content ??
        data?.choices?.[0]?.text ??
        data?.content?.[0]?.text ??
        data?.content ??
        data?.reasoning_content ??
        ''
    );
}

function mergeStreamText(current, incoming) {
    const next = String(incoming || '');
    const previous = String(current || '');
    if (!next) return previous;
    if (!previous) return next;
    if (next.startsWith(previous)) return next;
    return `${previous}${next}`;
}

function createTimeoutSignal(timeout, signal) {
    const controller = new AbortController();
    let timer = null;
    let timedOut = false;
    const abort = () => controller.abort();
    if (signal?.aborted) abort();
    signal?.addEventListener?.('abort', abort, { once: true });
    if (timeout > 0) {
        timer = setTimeout(() => {
            timedOut = true;
            abort();
        }, timeout);
    }
    return {
        signal: controller.signal,
        isTimedOut: () => timedOut,
        cleanup: () => {
            if (timer) clearTimeout(timer);
            signal?.removeEventListener?.('abort', abort);
        },
    };
}

export async function callDrawScenePlannerLlm({
    messages = [],
    llmApi = {},
    useStream = false,
    timeout = 120000,
    signal = null,
} = {}) {
    const expanded = await expandMessages(messages);
    const providerReady = convertTrailingAssistantForClaude(expanded, llmApi)
        .filter(message => String(message.content || '').trim());
    await emitPromptReady(providerReady);
    const prepared = providerReady
        .filter(message => String(message.content || '').trim());

    const payload = buildProviderPayload(llmApi, prepared, useStream);
    lastDrawLlmRequestSnapshot = {
        timestamp: Date.now(),
        note: '前端发送给 SillyTavern /api/backends/chat-completions/generate 的请求快照；后端再转给 Claude/Gemini/OpenAI 后的最终上游格式前端无法直接看到。',
        endpoint: DRAW_CHAT_COMPLETIONS_ENDPOINT,
        provider: normalizeDrawLlmApi(llmApi).provider,
        messages: cloneJson(prepared),
        payload: redactPayload(payload),
    };
    const abortable = createTimeoutSignal(Number(timeout) || 120000, signal);

    try {
        const response = await fetch(DRAW_CHAT_COMPLETIONS_ENDPOINT, {
            method: 'POST',
            headers: getRequestHeaders(),
            cache: 'no-cache',
            body: JSON.stringify(payload),
            signal: abortable.signal,
        });

        if (useStream) {
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(text || `HTTP ${response.status}`);
            }
            let output = '';
            const state = { reasoning: '', images: [], signature: '', toolSignatures: {} };
            await readSseEventsFromResponse(response, (event) => {
                const chunk = getStreamingReply(event, state, {
                    chatCompletionSource: payload.chat_completion_source,
                    overrideShowThoughts: true,
                });
                output = mergeStreamText(output, chunk);
            });
            return output;
        }

        const rawText = await response.text();
        let data = null;
        try {
            data = rawText ? JSON.parse(rawText) : {};
        } catch (error) {
            throw new Error(rawText || error?.message || '返回不是 JSON');
        }
        if (!response.ok || data?.error) {
            throw new Error(data?.error?.message || data?.message || rawText || `HTTP ${response.status}`);
        }
        return extractMessageText(data);
    } catch (error) {
        if (abortable.isTimedOut()) {
            throw new Error('生成超时');
        }
        throw error;
    } finally {
        abortable.cleanup();
    }
}
