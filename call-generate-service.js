import { oai_settings, chat_completion_sources, getChatCompletionModel } from "../../../openai.js";
import { ChatCompletionService } from "../../../custom-request.js";

const SOURCE_TAG = 'xiaobaix-host';

class CallGenerateService {
    constructor() {
        /** @type {Map<string, { id: string, abortController: AbortController, accumulated: string, startedAt: number }>} */
        this.sessions = new Map();
    }

    /**
     * @param {string|undefined} rawId
     * @returns {string}
     */
    normalizeSessionId(rawId) {
        if (!rawId) return 'xb1';
        const m = String(rawId).match(/^xb(\d{1,2})$/i);
        if (m) {
            const n = Math.max(1, Math.min(10, Number(m[1]) || 1));
            return `xb${n}`;
        }
        const n = Math.max(1, Math.min(10, parseInt(String(rawId), 10) || 1));
        return `xb${n}`;
    }

    /**
     * @param {string} sessionId
     */
    ensureSession(sessionId) {
        const id = this.normalizeSessionId(sessionId);
        if (!this.sessions.has(id)) {
            this.sessions.set(id, {
                id,
                abortController: new AbortController(),
                accumulated: '',
                startedAt: Date.now(),
            });
        }
        return this.sessions.get(id);
    }

    /**
     * @param {any} options
     */
    validateOptions(options) {
        if (!options || typeof options !== 'object') throw new Error('Invalid options');
        const mode = String(options.mode || '').toLowerCase();
        if (!['pure', 'hybrid-explicit', 'hybrid-inherit'].includes(mode)) {
            throw new Error('INVALID_MODE');
        }
        if (mode === 'pure') {
            if (!Array.isArray(options.messages) || options.messages.length === 0) {
                throw new Error('MISSING_MESSAGES');
            }
        }
        return { mode };
    }

    /**
     * @param {string} provider
     */
    mapProviderToSource(provider) {
        const p = String(provider || '').toLowerCase();
        const map = {
            openai: chat_completion_sources.OPENAI,
            claude: chat_completion_sources.CLAUDE,
            gemini: chat_completion_sources.MAKERSUITE,
            google: chat_completion_sources.MAKERSUITE,
            vertexai: chat_completion_sources.VERTEXAI,
            cohere: chat_completion_sources.COHERE,
            deepseek: chat_completion_sources.DEEPSEEK,
            xai: chat_completion_sources.XAI,
            groq: chat_completion_sources.GROQ,
            openrouter: chat_completion_sources.OPENROUTER,
            custom: chat_completion_sources.CUSTOM,
        };
        return map[p] || null;
    }

    /**
     * 解析 API 与模型的继承/覆写，并注入代理/自定义地址
     * @param {any} api
     */
    resolveApiConfig(api) {
        const inherit = api?.inherit !== false;
        let source = oai_settings?.chat_completion_source;
        let model = getChatCompletionModel ? getChatCompletionModel() : undefined;
        let overrides = api?.overrides || {};

        if (!inherit) {
            if (api?.provider) source = this.mapProviderToSource(api.provider);
            if (api?.model) model = api.model;
        } else {
            if (overrides?.provider) source = this.mapProviderToSource(overrides.provider);
            if (overrides?.model) model = overrides.model;
        }

        if (!source) throw new Error(`Unsupported provider`);
        if (!model) throw new Error('Model not specified');

        const temperature = inherit ? Number(oai_settings?.temp_openai ?? '') : undefined;
        const max_tokens = inherit ? (Number(oai_settings?.openai_max_tokens ?? 0) || 1024) : undefined;
        const top_p = inherit ? Number(oai_settings?.top_p_openai ?? '') : undefined;
        const frequency_penalty = inherit ? Number(oai_settings?.freq_pen_openai ?? '') : undefined;
        const presence_penalty = inherit ? Number(oai_settings?.pres_pen_openai ?? '') : undefined;

        const resolved = {
            chat_completion_source: source,
            model,
            temperature,
            max_tokens,
            top_p,
            frequency_penalty,
            presence_penalty,
            // 代理/自定义地址占位
            reverse_proxy: undefined,
            proxy_password: undefined,
            custom_url: undefined,
            custom_include_body: undefined,
            custom_exclude_body: undefined,
            custom_include_headers: undefined,
        };

        // 继承代理/自定义配置
        if (inherit) {
            // 支持反向代理的源（对齐 openai.js 的 PROXY 支持列表）
            const proxySupported = new Set([
                chat_completion_sources.CLAUDE,
                chat_completion_sources.OPENAI,
                chat_completion_sources.MISTRALAI,
                chat_completion_sources.MAKERSUITE,
                chat_completion_sources.VERTEXAI,
                chat_completion_sources.DEEPSEEK,
                chat_completion_sources.XAI,
            ]);
            if (proxySupported.has(source) && oai_settings?.reverse_proxy) {
                resolved.reverse_proxy = String(oai_settings.reverse_proxy).replace(/\/?$/, '');
                if (oai_settings?.proxy_password) resolved.proxy_password = String(oai_settings.proxy_password);
            }
            if (source === chat_completion_sources.CUSTOM) {
                if (oai_settings?.custom_url) resolved.custom_url = String(oai_settings.custom_url);
                if (oai_settings?.custom_include_body) resolved.custom_include_body = oai_settings.custom_include_body;
                if (oai_settings?.custom_exclude_body) resolved.custom_exclude_body = oai_settings.custom_exclude_body;
                if (oai_settings?.custom_include_headers) resolved.custom_include_headers = oai_settings.custom_include_headers;
            }
        }

        // 显式 baseURL 覆写：CUSTOM 走 custom_url；其他源走 reverse_proxy
        const baseURL = overrides?.baseURL || api?.baseURL;
        if (baseURL) {
            if (source === chat_completion_sources.CUSTOM) {
                resolved.custom_url = String(baseURL);
            } else {
                resolved.reverse_proxy = String(baseURL).replace(/\/?$/, '');
            }
        }

        // 细节覆写
        const ovw = inherit ? (api?.overrides || {}) : api || {};
        ['temperature', 'maxTokens', 'topP', 'topK', 'frequencyPenalty', 'presencePenalty', 'repetitionPenalty', 'stop', 'responseFormat', 'seed']
            .forEach((k) => {
                const keyMap = {
                    maxTokens: 'max_tokens',
                    topP: 'top_p',
                    topK: 'top_k',
                    frequencyPenalty: 'frequency_penalty',
                    presencePenalty: 'presence_penalty',
                    repetitionPenalty: 'repetition_penalty',
                    responseFormat: 'response_format',
                };
                const targetKey = keyMap[k] || k;
                if (ovw[k] !== undefined) resolved[targetKey] = ovw[k];
            });

        return resolved;
    }

    /**
     * @param {any[]} messages
     * @param {any} apiCfg
     * @param {boolean} stream
     */
    buildChatPayload(messages, apiCfg, stream) {
        const payload = {
            stream: !!stream,
            messages,
            model: apiCfg.model,
            chat_completion_source: apiCfg.chat_completion_source,
            max_tokens: apiCfg.max_tokens,
            temperature: apiCfg.temperature,
            top_p: apiCfg.top_p,
            top_k: apiCfg.top_k,
            frequency_penalty: apiCfg.frequency_penalty,
            presence_penalty: apiCfg.presence_penalty,
            repetition_penalty: apiCfg.repetition_penalty,
            stop: Array.isArray(apiCfg.stop) ? apiCfg.stop : undefined,
            response_format: apiCfg.response_format,
            seed: apiCfg.seed,
            // 代理/自定义地址透传
            reverse_proxy: apiCfg.reverse_proxy,
            proxy_password: apiCfg.proxy_password,
            custom_url: apiCfg.custom_url,
            custom_include_body: apiCfg.custom_include_body,
            custom_exclude_body: apiCfg.custom_exclude_body,
            custom_include_headers: apiCfg.custom_include_headers,
        };
        return ChatCompletionService.createRequestData(payload);
    }

    /**
     * @param {Window} target
     * @param {string} type
     * @param {object} body
     */
    postToTarget(target, type, body) {
        try {
            target?.postMessage({ source: SOURCE_TAG, type, ...body }, '*');
        } catch (e) {}
    }

    /**
     * 处理 pure 模式
     */
    async handlePure(options, requestId, sourceWindow) {
        const sessionId = this.normalizeSessionId(options?.session?.id || 'xb1');
        const session = this.ensureSession(sessionId);
        const streamingEnabled = options?.streaming?.enabled !== false; // 默认开
        const apiCfg = this.resolveApiConfig(options?.api || {});
        const payload = this.buildChatPayload(options.messages, apiCfg, streamingEnabled);

        try {
            if (streamingEnabled) {
                this.postToTarget(sourceWindow, 'generateStreamStart', { id: requestId, sessionId });
                const streamFn = await ChatCompletionService.sendRequest(payload, false, session.abortController.signal);
                let last = '';
                for await (const { text } of streamFn()) {
                    const chunk = text.slice(last.length);
                    last = text;
                    session.accumulated = text;
                    this.postToTarget(sourceWindow, 'generateStreamChunk', { id: requestId, chunk, accumulated: text, metadata: {} });
                }
                const result = {
                    success: true,
                    result: session.accumulated,
                    sessionId,
                    metadata: { duration: Date.now() - session.startedAt, model: apiCfg.model, finishReason: 'stop' },
                };
                this.postToTarget(sourceWindow, 'generateStreamComplete', { id: requestId, result });
                return result;
            } else {
                const extracted = await ChatCompletionService.sendRequest(payload, true, session.abortController.signal);
                const result = {
                    success: true,
                    result: String(extracted?.content || ''),
                    sessionId,
                    metadata: { duration: Date.now() - session.startedAt, model: apiCfg.model, finishReason: 'stop' },
                };
                this.postToTarget(sourceWindow, 'generateResult', { id: requestId, result });
                return result;
            }
        } catch (err) {
            const errorText = err?.message || String(err);
            this.postToTarget(sourceWindow, streamingEnabled ? 'generateStreamError' : 'generateError', { id: requestId, error: errorText });
            throw err;
        }
    }

    /**
     * 入口：处理 generateRequest
     * @param {any} options
     * @param {string} requestId
     * @param {Window} sourceWindow
     */
    async handleGenerateRequest(options, requestId, sourceWindow) {
        const { mode } = this.validateOptions(options);
        if (mode === 'pure') {
            return await this.handlePure(options, requestId, sourceWindow);
        }
        // 预留：hybrid-explicit / hybrid-inherit 将在后续任务中实现
        throw new Error('UNSUPPORTED_MODE');
    }

    /** 取消会话 */
    cancel(sessionId) {
        const s = this.sessions.get(this.normalizeSessionId(sessionId));
        try { s?.abortController?.abort(); } catch {}
    }

    /** 清理所有会话 */
    cleanup() {
        this.sessions.forEach(s => { try { s.abortController?.abort(); } catch {} });
        this.sessions.clear();
    }
}

const callGenerateService = new CallGenerateService();

export async function handleGenerateRequest(options, requestId, sourceWindow) {
    return await callGenerateService.handleGenerateRequest(options, requestId, sourceWindow);
}

if (typeof window !== 'undefined') {
    Object.assign(window, { xiaobaixCallGenerateService: callGenerateService });
}
