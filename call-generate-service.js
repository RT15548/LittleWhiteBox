import { oai_settings, chat_completion_sources, getChatCompletionModel, promptManager } from "../../../openai.js";
import { ChatCompletionService } from "../../../custom-request.js";
import { eventSource, event_types } from "../../../../script.js";
import { getContext } from "../../../st-context.js";

const SOURCE_TAG = 'xiaobaix-host';

class CallGenerateService {
    constructor() {
        /** @type {Map<string, { id: string, abortController: AbortController, accumulated: string, startedAt: number }>} */
        this.sessions = new Map();
        this._toggleBusy = false;
        this._lastToggleSnapshot = null;
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
            if (resolved.chat_completion_source === chat_completion_sources.CUSTOM) {
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

    // ===== ST Prompt 干跑捕获与组件切换 =====

    _computeEnableIds(includeConfig) {
        const ids = new Set();
        if (!includeConfig || typeof includeConfig !== 'object') return ids;
        const c = includeConfig;
        if (c.chatHistory?.enabled) ids.add('chatHistory');
        if (c.worldInfo?.enabled || c.worldInfo?.beforeHistory || c.worldInfo?.afterHistory) {
            if (c.worldInfo?.beforeHistory !== false) ids.add('worldInfoBefore');
            if (c.worldInfo?.afterHistory !== false) ids.add('worldInfoAfter');
        }
        if (c.character?.description) ids.add('charDescription');
        if (c.character?.personality) ids.add('charPersonality');
        if (c.character?.scenario) ids.add('scenario');
        if (c.persona?.description) ids.add('personaDescription');
        return ids;
    }

    async _withTemporaryPromptToggles(includeConfig, fn) {
        // 如果没有 promptManager，直接执行
        if (!promptManager || typeof promptManager.getPromptOrderForCharacter !== 'function') {
            return await fn();
        }
        // 防止并发切换
        while (this._toggleBusy) await new Promise(r => setTimeout(r, 10));
        this._toggleBusy = true;
        let snapshot = [];
        try {
            const pm = promptManager;
            const activeChar = pm?.activeCharacter ?? null;
            const order = pm?.getPromptOrderForCharacter(activeChar) ?? [];
            snapshot = order.map(e => ({ identifier: e.identifier, enabled: !!e.enabled }));
            this._lastToggleSnapshot = snapshot.map(s => ({ ...s }));
            const enableIds = this._computeEnableIds(includeConfig);
            // 全部禁用后按需启用
            order.forEach(e => { e.enabled = false; });
            order.forEach(e => { if (enableIds.has(e.identifier)) e.enabled = true; });
            return await fn();
        } finally {
            try {
                const pm = promptManager;
                const activeChar = pm?.activeCharacter ?? null;
                const order = pm?.getPromptOrderForCharacter(activeChar) ?? [];
                const mapSnap = new Map((this._lastToggleSnapshot || snapshot).map(s => [s.identifier, s.enabled]));
                order.forEach(e => { if (mapSnap.has(e.identifier)) e.enabled = mapSnap.get(e.identifier); });
            } catch {}
            this._toggleBusy = false;
            this._lastToggleSnapshot = null;
        }
    }

    async _capturePromptMessages({ includeConfig = null, quietText = '', skipWIAN = false }) {
        const ctx = getContext();
        let capturedData = null;
        const listener = (data) => {
            if (data && typeof data === 'object' && Array.isArray(data.prompt)) {
                capturedData = { ...data, prompt: data.prompt.slice() };
            } else if (Array.isArray(data)) {
                capturedData = data.slice();
            }
        };
        eventSource.on(event_types.GENERATE_AFTER_DATA, listener);
        try {
            const run = async () => {
                await ctx.generate('normal', { quiet_prompt: String(quietText || ''), quietToLoud: false, skipWIAN, force_name2: true }, true);
            };
            if (includeConfig) {
                await this._withTemporaryPromptToggles(includeConfig, run);
            } else {
                await run();
            }
        } finally {
            eventSource.removeListener(event_types.GENERATE_AFTER_DATA, listener);
        }
        if (!capturedData) return [];
        if (capturedData && typeof capturedData === 'object' && Array.isArray(capturedData.prompt)) return capturedData.prompt.slice();
        if (Array.isArray(capturedData)) return capturedData.slice();
        return [];
    }

    _mergeMessages(baseMessages, extraMessages) {
        const out = [];
        const seen = new Set();
        const norm = (s) => String(s || '').replace(/[\r\t\u200B\u00A0]/g, '').replace(/\s+/g, ' ').replace(/^[("']+|[("']+$/g, '').trim();
        const push = (m) => {
            if (!m || !m.content) return;
            const key = `${m.role}:${norm(m.content)}`;
            if (seen.has(key)) return;
            seen.add(key);
            out.push({ role: m.role, content: m.content });
        };
        baseMessages.forEach(push);
        (extraMessages || []).forEach(push);
        return out;
    }

    _splitMessagesForHistoryOps(messages) {
        // history: user/assistant; systemOther: 其余
        const history = [];
        const systemOther = [];
        for (const m of messages) {
            if (!m || typeof m.content !== 'string') continue;
            if (m.role === 'user' || m.role === 'assistant') history.push(m);
            else systemOther.push(m);
        }
        return { history, systemOther };
    }

    _applyRolesFilter(list, rolesCfg) {
        if (!rolesCfg || (!rolesCfg.include && !rolesCfg.exclude)) return list;
        const inc = Array.isArray(rolesCfg.include) && rolesCfg.include.length ? new Set(rolesCfg.include) : null;
        const exc = Array.isArray(rolesCfg.exclude) && rolesCfg.exclude.length ? new Set(rolesCfg.exclude) : null;
        return list.filter(m => {
            const r = m.role;
            if (inc && !inc.has(r)) return false;
            if (exc && exc.has(r)) return false;
            return true;
        });
    }

    _applyContentFilter(list, filterCfg) {
        if (!filterCfg) return list;
        const { contains, regex, fromUserNames, beforeTs, afterTs } = filterCfg;
        let out = list.slice();
        if (contains) {
            const needles = Array.isArray(contains) ? contains : [contains];
            out = out.filter(m => needles.some(k => String(m.content).includes(String(k))));
        }
        if (regex) {
            try {
                const re = new RegExp(regex);
                out = out.filter(m => re.test(String(m.content)));
            } catch {}
        }
        if (fromUserNames && fromUserNames.length) {
            // 仅当 messages 中附带 name 时生效；否则忽略
            out = out.filter(m => !m.name || fromUserNames.includes(m.name));
        }
        // 时间戳过滤需要原始数据支持，这里忽略（占位）
        return out;
    }

    _applyAnchorWindow(list, anchorCfg) {
        if (!anchorCfg || !list.length) return list;
        const { anchor = 'lastUser', before = 0, after = 0 } = anchorCfg;
        // 找到锚点索引
        let idx = -1;
        if (anchor === 'lastUser') {
            for (let i = list.length - 1; i >= 0; i--) if (list[i].role === 'user') { idx = i; break; }
        } else if (anchor === 'lastAssistant') {
            for (let i = list.length - 1; i >= 0; i--) if (list[i].role === 'assistant') { idx = i; break; }
        } else if (anchor === 'lastSystem') {
            for (let i = list.length - 1; i >= 0; i--) if (list[i].role === 'system') { idx = i; break; }
        }
        if (idx === -1) return list;
        const start = Math.max(0, idx - Number(before || 0));
        const end = Math.min(list.length - 1, idx + Number(after || 0));
        return list.slice(start, end + 1);
    }

    _applyIndicesRange(list, selector) {
        const idxBase = selector?.indexBase === 'all' ? 'all' : 'history';
        let result = list.slice();
        // indices 优先
        if (Array.isArray(selector?.indices?.values) && selector.indices.values.length) {
            const vals = selector.indices.values;
            const picked = [];
            const n = list.length;
            for (const v0 of vals) {
                let v = Number(v0);
                if (Number.isNaN(v)) continue;
                if (v < 0) v = n + v; // 负索引
                if (v >= 0 && v < n) picked.push(list[v]);
            }
            result = picked;
            return result;
        }
        if (selector?.range && (selector.range.start !== undefined || selector.range.end !== undefined)) {
            let { start = 0, end = list.length - 1 } = selector.range;
            const n = list.length;
            start = Number(start); end = Number(end);
            if (Number.isNaN(start)) start = 0;
            if (Number.isNaN(end)) end = n - 1;
            if (start < 0) start = n + start;
            if (end < 0) end = n + end;
            start = Math.max(0, start); end = Math.min(n - 1, end);
            if (start > end) return [];
            return list.slice(start, end + 1);
        }
        if (selector?.last !== undefined && selector.last !== null) {
            const k = Math.max(0, Number(selector.last) || 0);
            if (k === 0) return [];
            const n = list.length;
            return list.slice(Math.max(0, n - k));
        }
        return result;
    }

    _applyTakeEvery(list, step) {
        const s = Math.max(1, Number(step) || 1);
        if (s === 1) return list;
        const out = [];
        for (let i = 0; i < list.length; i += s) out.push(list[i]);
        return out;
    }

    _applyLimit(list, limitCfg) {
        if (!limitCfg) return list;
        // 仅实现 count，tokenBudget 预留
        const count = Number(limitCfg.count || 0);
        if (count > 0 && list.length > count) {
            const how = limitCfg.truncateStrategy || 'last';
            if (how === 'first') return list.slice(0, count);
            if (how === 'middle') {
                const left = Math.floor(count / 2);
                const right = count - left;
                return list.slice(0, left).concat(list.slice(-right));
            }
            if (how === 'even') {
                const step = Math.ceil(list.length / count);
                const out = [];
                for (let i = 0; i < list.length && out.length < count; i += step) out.push(list[i]);
                return out;
            }
            // default: 'last' → 取末尾
            return list.slice(-count);
        }
        return list;
    }

    applyChatHistorySelector(messages, selector) {
        if (!selector || !Array.isArray(messages) || !messages.length) return messages;
        const { history, systemOther } = this._splitMessagesForHistoryOps(messages);
        let list = history;
        // roles/filter/anchor → indices/range/last → takeEvery → limit
        list = this._applyRolesFilter(list, selector.roles);
        list = this._applyContentFilter(list, selector.filter);
        list = this._applyAnchorWindow(list, selector.anchorWindow);
        list = this._applyIndicesRange(list, selector);
        list = this._applyTakeEvery(list, selector.takeEvery);
        list = this._applyLimit(list, selector.limit || (selector.last ? { count: Number(selector.last) } : null));
        // 合并非历史部分
        return systemOther.concat(list);
    }

    // ===== 模式处理 =====

    async handlePure(options, requestId, sourceWindow) {
        const sessionId = this.normalizeSessionId(options?.session?.id || 'xb1');
        const session = this.ensureSession(sessionId);
        const streamingEnabled = options?.streaming?.enabled !== false; // 默认开
        const apiCfg = this.resolveApiConfig(options?.api || {});
        const payload = this.buildChatPayload(options.messages, apiCfg, streamingEnabled);

        try {
            const shouldExport = !!(options?.debug?.enabled || options?.debug?.exportPrompt);
            const already = options?.debug?._exported === true;
            if (shouldExport && !already) {
                this.postToTarget(sourceWindow, 'generatePromptPreview', { id: requestId, messages: (options?.messages || []).map(m => ({ role: m.role, content: m.content })) });
            }

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

    async handleHybridExplicit(options, requestId, sourceWindow) {
        const includeConfig = options?.includeComponents || null;
        const userMessages = Array.isArray(options?.messages) ? options.messages : [];
        const skipWIAN = includeConfig?.worldInfo ? false : true;
        const quietText = userMessages.find(m => m?.role === 'user')?.content || '';
        const captured = await this._capturePromptMessages({ includeConfig, quietText, skipWIAN });
        // chatHistory 高级选择器
        const selector = includeConfig?.chatHistory?.selector || (includeConfig?.chatHistory?.messageCount != null ? { last: includeConfig.chatHistory.messageCount } : null);
        const selected = selector ? this.applyChatHistorySelector(captured, selector) : captured;
        const finalMessages = this._mergeMessages(selected, userMessages);
        // Debug: 导出提示词预览
        const shouldExport = !!(options?.debug?.enabled || options?.debug?.exportPrompt);
        if (shouldExport) this.postToTarget(sourceWindow, 'generatePromptPreview', { id: requestId, messages: finalMessages.map(m => ({ role: m.role, content: m.content })) });
        // 复用 pure 路径发送
        const next = { ...options, mode: 'pure', messages: finalMessages, debug: { ...(options?.debug||{}), _exported: true } };
        return await this.handlePure(next, requestId, sourceWindow);
    }

    async handleHybridInherit(options, requestId, sourceWindow) {
        const includeConfig = options?.includeComponents || null; // 允许 inherit 也传 chatHistory.selector
        const userMessages = Array.isArray(options?.messages) ? options.messages : [];
        const quietText = userMessages.find(m => m?.role === 'user')?.content || '';
        const captured = await this._capturePromptMessages({ includeConfig: null, quietText, skipWIAN: false });
        const selector = includeConfig?.chatHistory?.selector || (includeConfig?.chatHistory?.messageCount != null ? { last: includeConfig.chatHistory.messageCount } : null);
        const selected = selector ? this.applyChatHistorySelector(captured, selector) : captured;
        const finalMessages = this._mergeMessages(selected, userMessages);
        const shouldExport = !!(options?.debug?.enabled || options?.debug?.exportPrompt);
        if (shouldExport) this.postToTarget(sourceWindow, 'generatePromptPreview', { id: requestId, messages: finalMessages.map(m => ({ role: m.role, content: m.content })) });
        const next = { ...options, mode: 'pure', messages: finalMessages, debug: { ...(options?.debug||{}), _exported: true } };
        return await this.handlePure(next, requestId, sourceWindow);
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
        if (mode === 'hybrid-explicit') {
            return await this.handleHybridExplicit(options, requestId, sourceWindow);
        }
        if (mode === 'hybrid-inherit') {
            return await this.handleHybridInherit(options, requestId, sourceWindow);
        }
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
