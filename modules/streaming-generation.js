// 删掉：getRequestHeaders, extractMessageFromData, getStreamingReply, tryParseStreamingError, getEventSourceStream

import { eventSource, event_types, chat, name1, activateSendButtons, deactivateSendButtons } from "../../../../../script.js";
import { chat_completion_sources, oai_settings, promptManager, getChatCompletionModel } from "../../../../openai.js";
import { ChatCompletionService } from "../../../../custom-request.js";
import { getContext } from "../../../../st-context.js";
import { SlashCommandParser } from "../../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../../slash-commands/SlashCommand.js";
import { ARGUMENT_TYPE, SlashCommandArgument, SlashCommandNamedArgument } from "../../../../slash-commands/SlashCommandArgument.js";
import { SECRET_KEYS, writeSecret } from "../../../../secrets.js";
import { power_user } from "../../../../power-user.js";
import { world_info } from "../../../../world-info.js";
import { xbLog, CacheRegistry } from "../core/debug-core.js";
import { getTrustedOrigin } from "../core/iframe-messaging.js";

const EVT_DONE = 'xiaobaix_streaming_completed';

const PROXY_SUPPORTED = new Set([
    chat_completion_sources.OPENAI, chat_completion_sources.CLAUDE,
    chat_completion_sources.MAKERSUITE, chat_completion_sources.COHERE,
    chat_completion_sources.DEEPSEEK,
]);

class StreamingGeneration {
    constructor() {
        this.tempreply = '';
        this.isInitialized = false;
        this.isStreaming = false;
        this.sessions = new Map();
        this.lastSessionId = null;
        this.activeCount = 0;
        this._toggleBusy = false;
        this._toggleQueue = Promise.resolve();
    }

    init() {
        if (this.isInitialized) return;
        try { localStorage.removeItem('xbgen:lastToggleSnap'); } catch {}
        this.registerCommands();
        try { xbLog.info('streamingGeneration', 'init'); } catch {}
        this.isInitialized = true;
    }

    _getSlotId(id) {
        if (!id) return 1;
        const m = String(id).match(/^xb(\d+)$/i);
        if (m && +m[1] >= 1 && +m[1] <= 10) return `xb${m[1]}`;
        const n = parseInt(id, 10);
        return (!isNaN(n) && n >= 1 && n <= 10) ? n : 1;
    }

    _ensureSession(id, prompt) {
        const slotId = this._getSlotId(id);
        if (!this.sessions.has(slotId)) {
            if (this.sessions.size >= 10) this._cleanupOldestSessions();
            this.sessions.set(slotId, {
                id: slotId, text: '', isStreaming: false, prompt: prompt || '',
                updatedAt: Date.now(), abortController: null
            });
        }
        this.lastSessionId = slotId;
        return this.sessions.get(slotId);
    }

    _cleanupOldestSessions() {
        const sorted = [...this.sessions.entries()].sort((a, b) => a[1].updatedAt - b[1].updatedAt);
        sorted.slice(0, Math.max(0, sorted.length - 9)).forEach(([sid, s]) => {
            try { s.abortController?.abort(); } catch {}
            this.sessions.delete(sid);
        });
    }

    updateTempReply(value, sessionId) {
        const text = String(value || '');
        if (sessionId !== undefined) {
            const sid = this._getSlotId(sessionId);
            const s = this.sessions.get(sid) || {
                id: sid, text: '', isStreaming: false, prompt: '',
                updatedAt: 0, abortController: null
            };
            s.text = text;
            s.updatedAt = Date.now();
            this.sessions.set(sid, s);
            this.lastSessionId = sid;
        }
        this.tempreply = text;
    }

    postToFrames(name, payload) {
        try {
            const frames = window?.frames;
            if (frames?.length) {
                const msg = { type: name, payload, from: 'xiaobaix' };
                const targetOrigin = getTrustedOrigin();
                let fail = 0;
                for (let i = 0; i < frames.length; i++) {
                    try { frames[i].postMessage(msg, targetOrigin); } catch { fail++; }
                }
                if (fail) {
                    try { xbLog.warn('streamingGeneration', `postToFrames fail=${fail} total=${frames.length} type=${name}`); } catch {}
                }
            }
        } catch {}
    }

    resolveCurrentApiAndModel(apiOptions = {}) {
        if (apiOptions.api && apiOptions.model) return apiOptions;
        const source = oai_settings?.chat_completion_source;
        const model = getChatCompletionModel();
        const map = {
            [chat_completion_sources.OPENAI]: 'openai',
            [chat_completion_sources.CLAUDE]: 'claude',
            [chat_completion_sources.MAKERSUITE]: 'gemini',
            [chat_completion_sources.COHERE]: 'cohere',
            [chat_completion_sources.DEEPSEEK]: 'deepseek',
            [chat_completion_sources.CUSTOM]: 'custom',
        };
        const api = map[source] || 'openai';
        return { api, model };
    }


        async callAPI(generateData, abortSignal, stream = true) {
            const messages = Array.isArray(generateData) ? generateData :
                (generateData?.prompt || generateData?.messages || generateData);   
            const baseOptions = (!Array.isArray(generateData) && generateData?.apiOptions) ? generateData.apiOptions : {};
            const opts = { ...baseOptions, ...this.resolveCurrentApiAndModel(baseOptions) };

            const modelLower = String(opts.model || '').toLowerCase();
            const isClaudeThinkingModel = 
                modelLower.includes('claude') && 
                modelLower.includes('thinking') && 
                !modelLower.includes('nothinking');

            if (isClaudeThinkingModel && Array.isArray(messages) && messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                if (lastMsg?.role === 'assistant') {
                    console.log('[xbgen] Claude Thinking 模型：移除 assistant prefill');
                    messages.pop();
                }
            } 

            const source = {
                openai: chat_completion_sources.OPENAI,
                claude: chat_completion_sources.CLAUDE,
                gemini: chat_completion_sources.MAKERSUITE,
                google: chat_completion_sources.MAKERSUITE,
                cohere: chat_completion_sources.COHERE,
                deepseek: chat_completion_sources.DEEPSEEK,
                custom: chat_completion_sources.CUSTOM,
            }[String(opts.api || '').toLowerCase()];            
            
            if (!source) {
                console.error('[xbgen:callAPI] 不支持的 api:', opts.api);
                try { xbLog.error('streamingGeneration', `unsupported api: ${opts.api}`, null); } catch {}
            }
            if (!source) throw new Error(`不支持的 api: ${opts.api}`);
            
            const model = String(opts.model || '').trim();
            
            if (!model) {
                try { xbLog.error('streamingGeneration', 'missing model', null); } catch {}
            }
            if (!model) throw new Error('未检测到当前模型，请在聊天面板选择模型或在插件设置中为分析显式指定模型。');
            
            try {
                try {
                    if (xbLog.isEnabled?.()) {
                        const msgCount = Array.isArray(messages) ? messages.length : null;
                        xbLog.info('streamingGeneration', `callAPI stream=${!!stream} api=${String(opts.api || '')} model=${model} messages=${msgCount ?? '-'}`);
                    }
                } catch {}
                const provider = String(opts.api || '').toLowerCase();
                const reverseProxyConfigured = String(opts.apiurl || '').trim().length > 0;
                const pwd = String(opts.apipassword || '').trim();
                if (!reverseProxyConfigured && pwd) {
                    const providerToSecretKey = {
                        openai: SECRET_KEYS.OPENAI,
                        gemini: SECRET_KEYS.MAKERSUITE,
                        google: SECRET_KEYS.MAKERSUITE,
                        cohere: SECRET_KEYS.COHERE,
                        deepseek: SECRET_KEYS.DEEPSEEK,
                        custom: SECRET_KEYS.CUSTOM,
                    };
                    const secretKey = providerToSecretKey[provider];
                    if (secretKey) {
                        await writeSecret(secretKey, pwd, 'xbgen-inline');
                    }
                }
            } catch {}
            
            const num = (v) => {
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
            };
            const isUnset = (k) => baseOptions?.[k] === '__unset__';
            const tUser = num(baseOptions?.temperature);
            const ppUser = num(baseOptions?.presence_penalty);
            const fpUser = num(baseOptions?.frequency_penalty);
            const tpUser = num(baseOptions?.top_p);
            const tkUser = num(baseOptions?.top_k);
            const mtUser = num(baseOptions?.max_tokens);
            const tUI = num(oai_settings?.temp_openai);
            const ppUI = num(oai_settings?.pres_pen_openai);
            const fpUI = num(oai_settings?.freq_pen_openai);
            const tpUI_OpenAI = num(oai_settings?.top_p_openai ?? oai_settings?.top_p);
            const mtUI_OpenAI = num(oai_settings?.openai_max_tokens ?? oai_settings?.max_tokens);
            const tpUI_Gemini = num(oai_settings?.makersuite_top_p ?? oai_settings?.top_p);
            const tkUI_Gemini = num(oai_settings?.makersuite_top_k ?? oai_settings?.top_k);
            const mtUI_Gemini = num(oai_settings?.makersuite_max_tokens ?? oai_settings?.max_output_tokens ?? oai_settings?.openai_max_tokens ?? oai_settings?.max_tokens);
            const effectiveTemperature = isUnset('temperature') ? undefined : (tUser ?? tUI);
            const effectivePresence = isUnset('presence_penalty') ? undefined : (ppUser ?? ppUI);
            const effectiveFrequency = isUnset('frequency_penalty') ? undefined : (fpUser ?? fpUI);
            const effectiveTopP = isUnset('top_p') ? undefined : (tpUser ?? (source === chat_completion_sources.MAKERSUITE ? tpUI_Gemini : tpUI_OpenAI));
            const effectiveTopK = isUnset('top_k') ? undefined : (tkUser ?? (source === chat_completion_sources.MAKERSUITE ? tkUI_Gemini : undefined));
            const effectiveMaxT = isUnset('max_tokens') ? undefined : (mtUser ?? (source === chat_completion_sources.MAKERSUITE ? (mtUI_Gemini ?? mtUI_OpenAI) : mtUI_OpenAI) ?? 4000);            
            
            const body = {
                messages, model, stream,
                chat_completion_source: source,
                temperature: effectiveTemperature,
                presence_penalty: effectivePresence,
                frequency_penalty: effectiveFrequency,
                top_p: effectiveTopP,
                max_tokens: effectiveMaxT,
                stop: Array.isArray(generateData?.stop) ? generateData.stop : undefined,
                use_makersuite_sysprompt: false,
                claude_use_sysprompt: oai_settings?.claude_use_sysprompt ?? false,
                custom_prompt_post_processing: undefined,
                // thinking 模型支持
                include_reasoning: oai_settings?.show_thoughts ?? true,
                reasoning_effort: oai_settings?.reasoning_effort || 'medium',
            };

            // Claude 专用：top_k
            if (source === chat_completion_sources.CLAUDE) {
                body.top_k = Number(oai_settings?.top_k_openai) || undefined;
            }
            
            if (source === chat_completion_sources.MAKERSUITE) {
                if (effectiveTopK !== undefined) body.top_k = effectiveTopK;
                body.max_output_tokens = effectiveMaxT;
            }
            const useNet = !!opts.enableNet;
            if (source === chat_completion_sources.MAKERSUITE && useNet) {
                body.tools = Array.isArray(body.tools) ? body.tools : [];
                if (!body.tools.some(t => t && t.google_search_retrieval)) {
                    body.tools.push({ google_search_retrieval: {} });
                }
                body.enable_web_search = true;
                body.makersuite_use_google_search = true;
            }
            let reverseProxy = String(opts.apiurl || oai_settings?.reverse_proxy || '').trim();
            let proxyPassword = String(oai_settings?.proxy_password || '').trim();
            const cmdApiUrl = String(opts.apiurl || '').trim();
            const cmdApiPwd = String(opts.apipassword || '').trim();
            if (cmdApiUrl) {
                if (cmdApiPwd) proxyPassword = cmdApiPwd;
            } else if (cmdApiPwd) {
                reverseProxy = '';
                proxyPassword = '';
            }
            if (PROXY_SUPPORTED.has(source) && reverseProxy) {
                body.reverse_proxy = reverseProxy.replace(/\/?$/, '');
                if (proxyPassword) body.proxy_password = proxyPassword;
            }
            if (source === chat_completion_sources.CUSTOM) {
                const customUrl = String(cmdApiUrl || oai_settings?.custom_url || '').trim();
                if (customUrl) {
                    body.custom_url = customUrl;
                } else {
                    throw new Error('未配置自定义后端URL，请在命令中提供 apiurl 或在设置中填写 custom_url');
                }
                if (oai_settings?.custom_include_headers) body.custom_include_headers = oai_settings.custom_include_headers;
                if (oai_settings?.custom_include_body) body.custom_include_body = oai_settings.custom_include_body;
                if (oai_settings?.custom_exclude_body) body.custom_exclude_body = oai_settings.custom_exclude_body;
            }
            
            
            if (stream) {
                const payload = ChatCompletionService.createRequestData(body);
                
                const streamFactory = await ChatCompletionService.sendRequest(payload, false, abortSignal);
                
                const generator = (typeof streamFactory === 'function') ? streamFactory() : streamFactory;

                return (async function* () {
                    let last = '';
                    try {
                        for await (const item of (generator || [])) {
                            if (abortSignal?.aborted) {
                                return;
                            }

                            let accumulated = '';
                            if (typeof item === 'string') {
                                accumulated = item;
                            } else if (item && typeof item === 'object') {
                                // 尝试多种字段
                                accumulated = (typeof item.text === 'string' ? item.text : '') ||
                                              (typeof item.content === 'string' ? item.content : '') || '';
                                
                                // thinking 相关字段
                                if (!accumulated) {
                                    const thinking = item?.delta?.thinking || item?.thinking;
                                    if (typeof thinking === 'string') {
                                        accumulated = thinking;
                                    }
                                }
                                if (!accumulated) {
                                    const rc = item?.reasoning_content || item?.reasoning;
                                    if (typeof rc === 'string') {
                                        accumulated = rc;
                                    }
                                }
                                if (!accumulated) {
                                    const rc = item?.choices?.[0]?.delta?.reasoning_content;
                                    if (typeof rc === 'string') accumulated = rc;
                                }
                            }
                            
                            if (!accumulated) {
                                continue;
                            }

                            if (accumulated.startsWith(last)) {
                                last = accumulated;
                            } else {
                                last += accumulated;
                            }
                            yield last;
                        }
                    } catch (err) {
                        console.error('[xbgen:stream] 流式错误:', err);
                        console.error('[xbgen:stream] err.name:', err?.name);
                        console.error('[xbgen:stream] err.message:', err?.message);
                        if (err?.name === 'AbortError') return;
                        try { xbLog.error('streamingGeneration', 'Stream error', err); } catch {}
                        throw err;
                    }
                })();
            } else {
                const payload = ChatCompletionService.createRequestData(body);
                const extracted = await ChatCompletionService.sendRequest(payload, false, abortSignal);

                let result = '';
                if (extracted && typeof extracted === 'object') {
                    const msg = extracted?.choices?.[0]?.message;
                    result = String(
                        msg?.content ??
                        msg?.reasoning_content ??
                        extracted?.choices?.[0]?.text ??
                        extracted?.content ??
                        extracted?.reasoning_content ??
                        ''
                    );
                } else {
                    result = String(extracted ?? '');
                }

                return result;
            }
        }


    async _emitPromptReady(chatArray) {
        try {
            if (Array.isArray(chatArray)) {
                await eventSource?.emit?.(event_types.CHAT_COMPLETION_PROMPT_READY, { chat: chatArray, dryRun: false });
            }
        } catch {}
    }

    async processGeneration(generateData, prompt, sessionId, stream = true) {
        const session = this._ensureSession(sessionId, prompt);
        const abortController = new AbortController();
        session.abortController = abortController;

        try {
            try { xbLog.info('streamingGeneration', `processGeneration start sid=${session.id} stream=${!!stream} promptLen=${String(prompt || '').length}`); } catch {}
            this.isStreaming = true;
            this.activeCount++;
            session.isStreaming = true;
            session.text = '';
            session.updatedAt = Date.now();
            this.tempreply = '';

            if (stream) {
                const generator = await this.callAPI(generateData, abortController.signal, true);
                for await (const chunk of generator) {
                    if (abortController.signal.aborted) {
                        break;
                    }
                    this.updateTempReply(chunk, session.id);
                }
            } else {
                const result = await this.callAPI(generateData, abortController.signal, false);
                this.updateTempReply(result, session.id);
            }

            const payload = { finalText: session.text, originalPrompt: prompt, sessionId: session.id };
            try { eventSource?.emit?.(EVT_DONE, payload); } catch { }
            this.postToFrames(EVT_DONE, payload);
            try { window?.postMessage?.({ type: EVT_DONE, payload, from: 'xiaobaix' }, getTrustedOrigin()); } catch { }

            try { xbLog.info('streamingGeneration', `processGeneration done sid=${session.id} outLen=${String(session.text || '').length}`); } catch {}
            return String(session.text || '');
        } catch (err) {
            if (err?.name === 'AbortError') {
                try { xbLog.warn('streamingGeneration', `processGeneration aborted sid=${session.id}`); } catch {}
                return String(session.text || '');
            }

            console.error('[StreamingGeneration] Generation error:', err);
            console.error('[StreamingGeneration] error.error =', err?.error);
            try { xbLog.error('streamingGeneration', `processGeneration error sid=${session.id}`, err); } catch {}

            let errorMessage = '生成失败';

            if (err && typeof err === 'object' && err.error && typeof err.error === 'object') {
                const detail = err.error;
                const rawMsg = String(detail.message || '').trim();
                const code = String(detail.code || '').trim().toLowerCase();

                if (
                    /input is too long/i.test(rawMsg) ||
                    /context length/i.test(rawMsg) ||
                    /maximum context length/i.test(rawMsg) ||
                    /too many tokens/i.test(rawMsg)
                ) {
                    errorMessage =
                        '输入过长：当前对话内容超过了所选模型或代理的上下文长度限制。\n' +
                        `原始信息：${rawMsg}`;
                } else if (
                    /quota/i.test(rawMsg) ||
                    /rate limit/i.test(rawMsg) ||
                    code === 'insufficient_quota'
                ) {
                    errorMessage =
                        '请求被配额或限流拒绝：当前 API 额度可能已用尽，或触发了限流。\n' +
                        `原始信息：${rawMsg || code}`;
                } else if (code === 'bad_request') {
                    errorMessage =
                        '请求被上游 API 以 Bad Request 拒绝。\n' +
                        '可能原因：参数格式不符合要求、模型名错误，或输入内容不被当前通道接受。\n\n' +
                        `原始信息：${rawMsg || code}`;
                } else {
                    errorMessage = rawMsg || code || JSON.stringify(detail);
                }
            } else if (err && typeof err === 'object' && err.message) {
                errorMessage = err.message;
            } else if (typeof err === 'string') {
                errorMessage = err;
            }

            throw new Error(errorMessage);
        } finally {
            session.isStreaming = false;
            this.activeCount = Math.max(0, this.activeCount - 1);
            this.isStreaming = this.activeCount > 0;
            try { session.abortController = null; } catch { }
        }
    }

    _normalize = (s) => String(s || '').replace(/[\r\t\u200B\u00A0]/g, '').replace(/\s+/g, ' ').replace(/^["'""'']+|["'""'']+$/g, '').trim();
    _stripNamePrefix = (s) => String(s || '').replace(/^\s*[^:]{1,32}:\s*/, '');
    _normStrip = (s) => this._normalize(this._stripNamePrefix(s));

    _parseCompositeParam(param) {
        const input = String(param || '').trim();
        if (!input) return [];

        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed)) {
                const normRole = (r) => {
                    const x = String(r || '').trim().toLowerCase();
                    if (x === 'sys' || x === 'system') return 'system';
                    if (x === 'assistant' || x === 'asst' || x === 'ai') return 'assistant';
                    if (x === 'user' || x === 'u') return 'user';
                    return '';
                };
                const result = parsed
                    .filter(m => m && typeof m === 'object')
                    .map(m => ({ role: normRole(m.role), content: String(m.content || '') }))
                    .filter(m => m.role);
                if (result.length > 0) {
                    return result;
                }
            }
        } catch {

        }

        const parts = [];
        let buf = '';
        let depth = 0;
        for (let i = 0; i < input.length; i++) {
            const ch = input[i];
            if (ch === '{') depth++;
            if (ch === '}') depth = Math.max(0, depth - 1);
            if (ch === ';' && depth === 0) {
                parts.push(buf);
                buf = '';
            } else {
                buf += ch;
            }
        }
        if (buf) parts.push(buf);

        const normRole = (r) => {
            const x = String(r || '').trim().toLowerCase();
            if (x === 'sys' || x === 'system') return 'system';
            if (x === 'assistant' || x === 'asst' || x === 'ai') return 'assistant';
            if (x === 'user' || x === 'u') return 'user';
            return '';
        };
        const extractValue = (v) => {
            let s = String(v || '').trim();
            if ((s.startsWith('{') && s.endsWith('}')) ||
                (s.startsWith('"') && s.endsWith('"')) ||
                (s.startsWith('\'') && s.endsWith('\''))) {
                s = s.slice(1, -1);
            }
            return s.trim();
        };

        const result = [];
        for (const seg of parts) {
            const idx = seg.indexOf('=');
            if (idx === -1) continue;
            const role = normRole(seg.slice(0, idx));
            if (!role) continue;
            const content = extractValue(seg.slice(idx + 1));
            if (content || content === '') result.push({ role, content });
        }
        return result;
    }

    _createIsFromChat() {
        const chatNorms = chat.map(m => this._normStrip(m?.mes)).filter(Boolean);
        const chatSet = new Set(chatNorms);
        return (content) => {
            const n = this._normStrip(content);
            if (!n || chatSet.has(n)) return !n ? false : true;
            for (const c of chatNorms) {
                const [a, b] = [n.length, c.length];
                const [minL, maxL] = [Math.min(a, b), Math.max(a, b)];
                if (minL < 20) continue;
                if (((a >= b && n.includes(c)) || (b >= a && c.includes(n))) && minL / maxL >= 0.8) return true;
            }
            return false;
        };
    }

    async _runToggleTask(task) {
        const prev = this._toggleQueue;
        let release;
        this._toggleQueue = new Promise(r => (release = r));
        await prev;
        try { return await task(); }
        finally { release(); }
    }

    async _withTemporaryPromptToggles(addonSet, fn) {
        return this._runToggleTask(async () => {
            const pm = promptManager;
            if (!pm || typeof pm.getPromptOrderForCharacter !== 'function') {
                return await fn();
            }

            // 记录原始状态
            const hadOwn = Object.prototype.hasOwnProperty.call(pm, 'getPromptOrderForCharacter');
            const original = pm.getPromptOrderForCharacter;

            const PRESET_EXCLUDES = new Set([
                'chatHistory',
                'worldInfoBefore', 'worldInfoAfter',
                'charDescription', 'charPersonality', 'scenario', 'personaDescription',
            ]);

            const wrapper = (...args) => {
                const list = original.call(pm, ...args) || [];

                const enableIds = new Set();

                if (addonSet.has('preset')) {
                    for (const e of list) {
                        if (e?.identifier && e.enabled && !PRESET_EXCLUDES.has(e.identifier)) {
                            enableIds.add(e.identifier);
                        }
                    }
                }

                if (addonSet.has('chatHistory')) enableIds.add('chatHistory');
                if (addonSet.has('worldInfo')) {
                    enableIds.add('worldInfoBefore');
                    enableIds.add('worldInfoAfter');
                }
                if (addonSet.has('charDescription')) enableIds.add('charDescription');
                if (addonSet.has('charPersonality')) enableIds.add('charPersonality');
                if (addonSet.has('scenario')) enableIds.add('scenario');
                if (addonSet.has('personaDescription')) enableIds.add('personaDescription');

                if (addonSet.has('worldInfo') && !addonSet.has('chatHistory')) {
                    enableIds.add('chatHistory');
                }

                return list.map(e => {
                    if (!e?.identifier) return e;
                    return { ...e, enabled: enableIds.has(e.identifier) };
                });
            };

            pm.getPromptOrderForCharacter = wrapper;

            try {
                return await fn();
            } finally {
                if (pm.getPromptOrderForCharacter === wrapper) {
                    if (hadOwn) {
                        pm.getPromptOrderForCharacter = original;
                    } else {

                        try {
                            delete pm.getPromptOrderForCharacter;
                        } catch {
                            pm.getPromptOrderForCharacter = original;
                        }
                    }
                }
            }
        });
    }

    async _captureWorldInfoText(prompt) {
        const addonSet = new Set(['worldInfo', 'chatHistory']);
        const context = getContext();
        let capturedData = null;
        const dataListener = (data) => {
            capturedData = (data && typeof data === 'object' && Array.isArray(data.prompt))
                ? { ...data, prompt: data.prompt.slice() }
                : (Array.isArray(data) ? data.slice() : data);
        };
        eventSource.on(event_types.GENERATE_AFTER_DATA, dataListener);
        const activatedUids = new Set();
        const wiListener = (payload) => {
            try {
                const list = Array.isArray(payload?.entries)
                    ? payload.entries
                    : (Array.isArray(payload) ? payload : (payload?.entry ? [payload.entry] : []));
                for (const it of list) {
                    const uid = it?.uid || it?.id || it?.entry?.uid || it?.entry?.id;
                    if (uid) activatedUids.add(uid);
                }
            } catch {}
        };
        eventSource.on(event_types.WORLD_INFO_ACTIVATED, wiListener);
        try {
            await this._withTemporaryPromptToggles(addonSet, async () => {
                await context.generate('normal', {
                    quiet_prompt: String(prompt || '').trim(),
                    quietToLoud: false,
                    skipWIAN: false,
                    force_name2: true,
                }, true);
            });
        } finally {
            eventSource.removeListener(event_types.GENERATE_AFTER_DATA, dataListener);
            eventSource.removeListener(event_types.WORLD_INFO_ACTIVATED, wiListener);
        }
        try {
            if (activatedUids.size > 0 && Array.isArray(world_info)) {
                const seen = new Set();
                const pieces = [];
                for (const wi of world_info) {
                    const uid = wi?.uid || wi?.id;
                    if (!uid || !activatedUids.has(uid) || seen.has(uid)) continue;
                    seen.add(uid);
                    const content = String(wi?.content || '').trim();
                    if (content) pieces.push(content);
                }
                const text = pieces.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
                if (text) return text;
            }
        } catch {}
        let src = [];
        const cd = capturedData;
        if (Array.isArray(cd)) {
            src = cd.slice();
        } else if (cd && typeof cd === 'object' && Array.isArray(cd.prompt)) {
            src = cd.prompt.slice();
        }
        const isFromChat = this._createIsFromChat();
        const pieces = [];
        for (const m of src) {
            if (!m || typeof m.content !== 'string') continue;
            if (m.role === 'system') {
                pieces.push(m.content);
            } else if ((m.role === 'user' || m.role === 'assistant') && isFromChat(m.content)) {
                continue;
            }
        }
        let text = pieces.map(s => String(s || '').trim()).filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
        text = text.replace(/\n{0,2}\s*\[Start a new Chat\]\s*\n?/ig, '\n');
        text = text.replace(/\n{3,}/g, '\n\n').trim();
        return text;
    }

    parseOpt(args, key) {
        const v = args?.[key];
        if (v === undefined) return undefined;
        const s = String(v).trim().toLowerCase();
        if (s === 'undefined' || s === 'none' || s === 'null' || s === 'off') return '__unset__';
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    }

    getActiveCharFields() {
        const ctx = getContext();
        const char = (ctx?.getCharacter?.(ctx?.characterId)) || (Array.isArray(ctx?.characters) ? ctx.characters[ctx.characterId] : null) || {};
        const data = char.data || char || {};
        const personaText =
            (typeof power_user?.persona_description === 'string' ? power_user.persona_description : '') ||
            String((ctx?.extensionSettings?.personas?.current?.description) || '').trim();
        const mesExamples =
            String(data.mes_example || data.mesExample || data.example_dialogs || '').trim();
        return {
            description: String(data.description || '').trim(),
            personality: String(data.personality || '').trim(),
            scenario: String(data.scenario || '').trim(),
            persona: String(personaText || '').trim(),
            mesExamples,
        };
    }

    _extractTextFromMessage(msg) {
        if (!msg) return '';
        if (typeof msg.mes === 'string') return msg.mes.replace(/\r\n/g, '\n');
        if (typeof msg.content === 'string') return msg.content.replace(/\r\n/g, '\n');
        if (Array.isArray(msg.content)) {
            return msg.content
                .filter(p => p && p.type === 'text' && typeof p.text === 'string')
                .map(p => p.text.replace(/\r\n/g, '\n')).join('\n');
        }
        return '';
    }

    _getLastMessagesSnapshot() {
        const ctx = getContext();
        const list = Array.isArray(ctx?.chat) ? ctx.chat : [];
        let lastMessage = '';
        let lastUserMessage = '';
        let lastCharMessage = '';
        for (let i = list.length - 1; i >= 0; i--) {
            const m = list[i];
            const text = this._extractTextFromMessage(m).trim();
            if (!lastMessage && text) lastMessage = text;
            if (!lastUserMessage && m?.is_user && text) lastUserMessage = text;
            if (!lastCharMessage && !m?.is_user && !m?.is_system && text) lastCharMessage = text;
            if (lastMessage && lastUserMessage && lastCharMessage) break;
        }
        return { lastMessage, lastUserMessage, lastCharMessage };
    }

    async expandInline(text) {
        let out = String(text ?? '');
        if (!out) return out;
        const f = this.getActiveCharFields();
        const dict = {
            '{{description}}': f.description,
            '{{personality}}': f.personality,
            '{{scenario}}': f.scenario,
            '{{persona}}': f.persona,
            '{{mesexamples}}': f.mesExamples,
        };
        for (const [k, v] of Object.entries(dict)) {
            if (!k) continue;
            const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            out = out.replace(re, v || '');
        }
        const ctx = getContext();
        out = String(out)
            .replace(/\{\{user\}\}/gi, String(ctx?.name1 || 'User'))
            .replace(/\{\{char\}\}/gi, String(ctx?.name2 || 'Assistant'))
            .replace(/\{\{newline\}\}/gi, '\n');
        out = out
            .replace(/<\s*user\s*>/gi, String(ctx?.name1 || 'User'))
            .replace(/<\s*(char|character)\s*>/gi, String(ctx?.name2 || 'Assistant'))
            .replace(/<\s*persona\s*>/gi, String(f.persona || ''));
        const snap = this._getLastMessagesSnapshot();
        const lastDict = {
            '{{lastmessage}}': snap.lastMessage,
            '{{lastusermessage}}': snap.lastUserMessage,
            '{{lastcharmessage}}': snap.lastCharMessage,
        };
        for (const [k, v] of Object.entries(lastDict)) {
            const re = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            out = out.replace(re, (m) => (v && v.length ? v : ''));
        }
        const expandVarMacros = async (s) => {
            if (typeof window?.STscript !== 'function') return s;
            let txt = String(s);
            const escapeForCmd = (v) => {
                const escaped = String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                return `"${escaped}"`;
            };
            const apply = async (macroRe, getCmdForRoot) => {
                const found = [];
                let m;
                macroRe.lastIndex = 0;
                while ((m = macroRe.exec(txt)) !== null) {
                    const full = m[0];
                    const path = m[1]?.trim();
                    if (!path) continue;
                    found.push({ full, path });
                }
                if (!found.length) return;
                const cache = new Map();
                const getRootAndTail = (p) => {
                    const idx = p.indexOf('.');
                    return idx === -1 ? [p, ''] : [p.slice(0, idx), p.slice(idx + 1)];
                };
                const dig = (val, tail) => {
                    if (!tail) return val;
                    const parts = tail.split('.').filter(Boolean);
                    let cur = val;
                    for (const key of parts) {
                        if (cur && typeof cur === 'object' && key in cur) cur = cur[key];
                        else return '';
                    }
                    return cur;
                };
                const roots = [...new Set(found.map(item => getRootAndTail(item.path)[0]))];
                await Promise.all(roots.map(async (root) => {
                    try {
                        const cmd = getCmdForRoot(root);
                        const result = await window.STscript(cmd);
                        let parsed = result;
                        try { parsed = JSON.parse(result); } catch {}
                        cache.set(root, parsed);
                    } catch {
                        cache.set(root, '');
                    }
                }));
                for (const item of found) {
                    const [root, tail] = getRootAndTail(item.path);
                    const rootVal = cache.get(root);
                    const val = tail ? dig(rootVal, tail) : rootVal;
                    const finalStr = typeof val === 'string' ? val : (val == null ? '' : JSON.stringify(val));
                    txt = txt.split(item.full).join(finalStr);
                }
            };
            await apply(
                /\{\{getvar::([\s\S]*?)\}\}/gi,
                (root) => `/getvar key=${escapeForCmd(root)}`
            );
            await apply(
                /\{\{getglobalvar::([\s\S]*?)\}\}/gi,
                (root) => `/getglobalvar ${escapeForCmd(root)}`
            );
            return txt;
        };
        out = await expandVarMacros(out);
        return out;
    }

    async xbgenrawCommand(args, prompt) {
        const hasScaffolding = Boolean(String(
            args?.top || args?.top64 ||
            args?.topsys || args?.topuser || args?.topassistant ||
            args?.bottom || args?.bottom64 ||
            args?.bottomsys || args?.bottomuser || args?.bottomassistant ||
            args?.addon || ''
        ).trim());
        if (!prompt?.trim() && !hasScaffolding) return '';
        const role = ['user', 'system', 'assistant'].includes(args?.as) ? args.as : 'user';
        const sessionId = this._getSlotId(args?.id);
        const lockArg = String(args?.lock || '').toLowerCase();
        const lock = lockArg === 'on' || lockArg === 'true' || lockArg === '1';
        const apiOptions = {
            api: args?.api, apiurl: args?.apiurl,
            apipassword: args?.apipassword, model: args?.model,
            enableNet: ['on','true','1','yes'].includes(String(args?.net ?? '').toLowerCase()),
            top_p: this.parseOpt(args, 'top_p'),
            top_k: this.parseOpt(args, 'top_k'),
            max_tokens: this.parseOpt(args, 'max_tokens'),
            temperature: this.parseOpt(args, 'temperature'),
            presence_penalty: this.parseOpt(args, 'presence_penalty'),
            frequency_penalty: this.parseOpt(args, 'frequency_penalty'),
        };
        let parsedStop;
        try {
            if (args?.stop) {
                const s = String(args.stop).trim();
                if (s) {
                    const j = JSON.parse(s);
                    parsedStop = Array.isArray(j) ? j : (typeof j === 'string' ? [j] : undefined);
                }
            }
        } catch {}
        const nonstream = String(args?.nonstream || '').toLowerCase() === 'true';
        const b64dUtf8 = (s) => {
            try {
                let str = String(s).trim().replace(/-/g, '+').replace(/_/g, '/');
                const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
                str += pad;
                const bin = atob(str);
                const u8 = Uint8Array.from(bin, c => c.charCodeAt(0));
                return new TextDecoder().decode(u8);
            } catch { return ''; }
        };
        const topComposite = args?.top64 ? b64dUtf8(args.top64) : String(args?.top || '').trim();
        const bottomComposite = args?.bottom64 ? b64dUtf8(args.bottom64) : String(args?.bottom || '').trim();
        const createMsgs = (prefix) => {
            const msgs = [];
            ['sys', 'user', 'assistant'].forEach(r => {
                const content = String(args?.[`${prefix}${r === 'sys' ? 'sys' : r}`] || '').trim();
                if (content) msgs.push({ role: r === 'sys' ? 'system' : r, content });
            });
            return msgs;
        };
        const historyPlaceholderRegex = /\{\$history(\d{1,3})\}/ig;
        const resolveHistoryPlaceholder = async (text) => {
            if (!text || typeof text !== 'string') return text;
            const ctx = getContext();
            const chatArr = Array.isArray(ctx?.chat) ? ctx.chat : [];
            if (!chatArr.length) return text;
            const extractText = (msg) => {
                if (typeof msg?.mes === 'string') return msg.mes.replace(/\r\n/g, '\n');
                if (typeof msg?.content === 'string') return msg.content.replace(/\r\n/g, '\n');
                if (Array.isArray(msg?.content)) {
                    return msg.content
                        .filter(p => p && p.type === 'text' && typeof p.text === 'string')
                        .map(p => p.text.replace(/\r\n/g, '\n')).join('\n');
                }
                return '';
            };
            const replaceFn = (match, countStr) => {
                const count = Math.max(1, Math.min(200, Number(countStr)));
                const start = Math.max(0, chatArr.length - count);
                const lines = [];
                for (let i = start; i < chatArr.length; i++) {
                    const msg = chatArr[i];
                    const isUser = !!msg?.is_user;
                    const speaker = isUser
                        ? ((msg?.name && String(msg.name).trim()) || (ctx?.name1 && String(ctx.name1).trim()) || 'USER')
                        : ((msg?.name && String(msg.name).trim()) || (ctx?.name2 && String(ctx.name2).trim()) || 'ASSISTANT');
                    lines.push(`${speaker}：`);
                    const textContent = (extractText(msg) || '').trim();
                    if (textContent) lines.push(textContent);
                    lines.push('');
                }
                return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
            };
            return text.replace(historyPlaceholderRegex, replaceFn);
        };
        const mapHistoryPlaceholders = async (messages) => {
            const out = [];
            for (const m of messages) {
                if (!m) continue;
                const content = await resolveHistoryPlaceholder(m.content);
                out.push({ ...m, content });
            }
            return out;
        };
        let topMsgs = await mapHistoryPlaceholders(
            []
                .concat(topComposite ? this._parseCompositeParam(topComposite) : [])
                .concat(createMsgs('top'))
        );
        let bottomMsgs = await mapHistoryPlaceholders(
            []
                .concat(bottomComposite ? this._parseCompositeParam(bottomComposite) : [])
                .concat(createMsgs('bottom'))
        );
        const expandSegmentInline = async (arr) => {
            for (const m of arr) {
                if (m && typeof m.content === 'string') {
                    const before = m.content;
                    const after = await this.expandInline(before);
                    m.content = after && after.length ? after : before;
                }
            }
        };

        await expandSegmentInline(topMsgs);

        await expandSegmentInline(bottomMsgs);

        if (typeof prompt === 'string' && prompt.trim()) {
            const beforeP = await resolveHistoryPlaceholder(prompt);
            const afterP = await this.expandInline(beforeP);
            prompt = afterP && afterP.length ? afterP : beforeP;
        }
        try {
            const needsWI = [...topMsgs, ...bottomMsgs].some(m => m && typeof m.content === 'string' && m.content.includes('{$worldInfo}')) || (typeof prompt === 'string' && prompt.includes('{$worldInfo}'));
            if (needsWI) {
                const wiText = await this._captureWorldInfoText(prompt || '');
                const wiTrim = String(wiText || '').trim();
                if (wiTrim) {
                    const wiRegex = /\{\$worldInfo\}/ig;
                    const applyWI = (arr) => {
                        for (const m of arr) {
                            if (m && typeof m.content === 'string') {
                                m.content = m.content.replace(wiRegex, wiTrim);
                            }
                        }
                    };
                    applyWI(topMsgs);
                    applyWI(bottomMsgs);
                    if (typeof prompt === 'string') prompt = prompt.replace(wiRegex, wiTrim);
                }
            }
        } catch {}
        const addonSetStr = String(args?.addon || '').trim();
        const shouldUsePM = addonSetStr.length > 0;
        if (!shouldUsePM) {
            const messages = []
                .concat(topMsgs.filter(m => typeof m?.content === 'string' && m.content.trim().length))
                .concat(prompt && prompt.trim().length ? [{ role, content: prompt.trim() }] : [])
                .concat(bottomMsgs.filter(m => typeof m?.content === 'string' && m.content.trim().length));
            
            const common = { messages, apiOptions, stop: parsedStop };
            if (nonstream) {
                try { if (lock) deactivateSendButtons(); } catch {}
                try {
                    await this._emitPromptReady(messages);
                    const finalText = await this.processGeneration(common, prompt || '', sessionId, false);
                    return String(finalText ?? '');
                } finally {
                    try { if (lock) activateSendButtons(); } catch {}
                }
            } else {
                try { if (lock) deactivateSendButtons(); } catch {}
                await this._emitPromptReady(messages);
                const p = this.processGeneration(common, prompt || '', sessionId, true);
                p.finally(() => { try { if (lock) activateSendButtons(); } catch {} });
                p.catch(() => {});
                return String(sessionId);
            }
        }
        const addonSet = new Set(addonSetStr.split(',').map(s => s.trim()).filter(Boolean));
        const buildAddonFinalMessages = async () => {
            const context = getContext();
            let capturedData = null;
            const dataListener = (data) => {
                capturedData = (data && typeof data === 'object' && Array.isArray(data.prompt))
                    ? { ...data, prompt: data.prompt.slice() }
                    : (Array.isArray(data) ? data.slice() : data);
            };
            eventSource.on(event_types.GENERATE_AFTER_DATA, dataListener);
            const skipWIAN = addonSet.has('worldInfo') ? false : true;
            await this._withTemporaryPromptToggles(addonSet, async () => {
                const sandboxed = addonSet.has('worldInfo') && !addonSet.has('chatHistory');
                let chatBackup = null;
                if (sandboxed) {
                    try {
                        chatBackup = chat.slice();
                        chat.length = 0;
                        chat.push({ name: name1 || 'User', is_user: true, is_system: false, mes: '[hist]', send_date: new Date().toISOString() });
                    } catch {}
                }
                try {
                    await context.generate('normal', {
                        quiet_prompt: (prompt || '').trim(), quietToLoud: false,
                        skipWIAN, force_name2: true
                    }, true);
                } finally {
                    if (sandboxed && Array.isArray(chatBackup)) {
                        chat.length = 0;
                        chat.push(...chatBackup);
                    }
                }
            });
            eventSource.removeListener(event_types.GENERATE_AFTER_DATA, dataListener);
            let src = [];
            const cd = capturedData;
            if (Array.isArray(cd)) src = cd.slice();
            else if (cd && typeof cd === 'object' && Array.isArray(cd.prompt)) src = cd.prompt.slice();
            const sandboxedAfter = addonSet.has('worldInfo') && !addonSet.has('chatHistory');
            const isFromChat = this._createIsFromChat();
            const finalPromptMessages = src.filter(m => {
                if (!sandboxedAfter) return true;
                if (!m) return false;
                if (m.role === 'system') return true;
                if ((m.role === 'user' || m.role === 'assistant') && isFromChat(m.content)) return false;
                return true;
            });
            const norm = this._normStrip;
            const position = ['history', 'after_history', 'afterhistory', 'chathistory']
                .includes(String(args?.position || '').toLowerCase()) ? 'history' : 'bottom';
            const targetIdx = finalPromptMessages.findIndex(m => m && typeof m.content === 'string' && norm(m.content) === norm(prompt || ''));
            if (targetIdx !== -1) {
                finalPromptMessages.splice(targetIdx, 1);
            }
            if (prompt?.trim()) {
                const centerMsg = { role: (args?.as || 'assistant'), content: prompt.trim() };
                if (position === 'history') {
                    let lastHistoryIndex = -1;
                    const isFromChat2 = this._createIsFromChat();
                    for (let i = 0; i < finalPromptMessages.length; i++) {
                        const m = finalPromptMessages[i];
                        if (m && (m.role === 'user' || m.role === 'assistant') && isFromChat2(m.content)) {
                            lastHistoryIndex = i;
                        }
                    }
                    if (lastHistoryIndex >= 0) finalPromptMessages.splice(lastHistoryIndex + 1, 0, centerMsg);
                    else {
                        let lastSystemIndex = -1;
                        for (let i = 0; i < finalPromptMessages.length; i++) {
                            if (finalPromptMessages[i]?.role === 'system') lastSystemIndex = i;
                        }
                        if (lastSystemIndex >= 0) finalPromptMessages.splice(lastSystemIndex + 1, 0, centerMsg);
                        else finalPromptMessages.push(centerMsg);
                    }
                } else {
                    finalPromptMessages.push(centerMsg);
                }
            }
            const mergedOnce = ([]).concat(topMsgs).concat(finalPromptMessages).concat(bottomMsgs);
            const seenKey = new Set();
            const finalMessages = [];
            for (const m of mergedOnce) {
                if (!m || !m.content || !String(m.content).trim().length) continue;
                const key = `${m.role}:${this._normStrip(m.content)}`;
                if (seenKey.has(key)) continue;
                seenKey.add(key);
                finalMessages.push(m);
            }
            return finalMessages;
        };
        if (nonstream) {
            try { if (lock) deactivateSendButtons(); } catch {}
            try {
                const finalMessages = await buildAddonFinalMessages();
                const common = { messages: finalMessages, apiOptions, stop: parsedStop };
                await this._emitPromptReady(finalMessages);
                const finalText = await this.processGeneration(common, prompt || '', sessionId, false);
                return String(finalText ?? '');
            } finally {
                try { if (lock) activateSendButtons(); } catch {}
            }
        } else {
            (async () => {
                try {
                    try { if (lock) deactivateSendButtons(); } catch {}
                    const finalMessages = await buildAddonFinalMessages();
                    const common = { messages: finalMessages, apiOptions, stop: parsedStop };
                    await this._emitPromptReady(finalMessages);
                    await this.processGeneration(common, prompt || '', sessionId, true);
                } catch {} finally {
                    try { if (lock) activateSendButtons(); } catch {}
                }
            })();
            return String(sessionId);
        }
    }

    async xbgenCommand(args, prompt) {
        if (!prompt?.trim()) return '';
        const role = ['user', 'system', 'assistant'].includes(args?.as) ? args.as : 'system';
        const sessionId = this._getSlotId(args?.id);
        const lockArg = String(args?.lock || '').toLowerCase();
        const lock = lockArg === 'on' || lockArg === 'true' || lockArg === '1';
        const nonstream = String(args?.nonstream || '').toLowerCase() === 'true';
        const buildGenDataWithOptions = async () => {
            const context = getContext();
            const tempMessage = {
                name: role === 'user' ? (name1 || 'User') : 'System',
                is_user: role === 'user',
                is_system: role === 'system',
                mes: prompt.trim(),
                send_date: new Date().toISOString(),
            };
            const originalLength = chat.length;
            chat.push(tempMessage);
            let capturedData = null;
            const dataListener = (data) => {
                if (data?.prompt && Array.isArray(data.prompt)) {
                    let messages = [...data.prompt];
                    const promptText = prompt.trim();
                    for (let i = messages.length - 1; i >= 0; i--) {
                        const m = messages[i];
                        if (m.content === promptText &&
                            ((role !== 'system' && m.role === 'system') ||
                             (role === 'system' && m.role === 'user'))) {
                            messages.splice(i, 1);
                            break;
                        }
                    }
                    capturedData = { ...data, prompt: messages };
                } else {
                    capturedData = data;
                }
            };
            eventSource.on(event_types.GENERATE_AFTER_DATA, dataListener);
            try {
                await context.generate('normal', {
                    quiet_prompt: prompt.trim(), quietToLoud: false,
                    skipWIAN: false, force_name2: true
                }, true);
            } finally {
                eventSource.removeListener(event_types.GENERATE_AFTER_DATA, dataListener);
                chat.length = originalLength;
            }
            const apiOptions = {
                api: args?.api, apiurl: args?.apiurl,
                apipassword: args?.apipassword, model: args?.model,
                enableNet: ['on','true','1','yes'].includes(String(args?.net ?? '').toLowerCase()),
                top_p: this.parseOpt(args, 'top_p'),
                top_k: this.parseOpt(args, 'top_k'),
                max_tokens: this.parseOpt(args, 'max_tokens'),
                temperature: this.parseOpt(args, 'temperature'),
                presence_penalty: this.parseOpt(args, 'presence_penalty'),
                frequency_penalty: this.parseOpt(args, 'frequency_penalty'),
            };
            const cd = capturedData;
            let finalPromptMessages = [];
            if (cd && typeof cd === 'object' && Array.isArray(cd.prompt)) {
                finalPromptMessages = cd.prompt.slice();
            } else if (Array.isArray(cd)) {
                finalPromptMessages = cd.slice();
            }
            const norm = this._normStrip;
            const promptNorm = norm(prompt);
            for (let i = finalPromptMessages.length - 1; i >= 0; i--) {
                if (norm(finalPromptMessages[i]?.content) === promptNorm) {
                    finalPromptMessages.splice(i, 1);
                }
            }
            const messageToInsert = { role, content: prompt.trim() };
            const position = ['history', 'after_history', 'afterhistory', 'chathistory']
                .includes(String(args?.position || '').toLowerCase()) ? 'history' : 'bottom';
            if (position === 'history') {
                const isFromChat = this._createIsFromChat();
                let lastHistoryIndex = -1;
                for (let i = 0; i < finalPromptMessages.length; i++) {
                    const m = finalPromptMessages[i];
                    if (m && (m.role === 'user' || m.role === 'assistant') && isFromChat(m.content)) {
                        lastHistoryIndex = i;
                    }
                }
                if (lastHistoryIndex >= 0) {
                    finalPromptMessages.splice(lastHistoryIndex + 1, 0, messageToInsert);
                } else {
                    finalPromptMessages.push(messageToInsert);
                }
            } else {
                finalPromptMessages.push(messageToInsert);
            }
            const cd2 = capturedData;
            let dataWithOptions;
            if (cd2 && typeof cd2 === 'object' && !Array.isArray(cd2)) {
                dataWithOptions = Object.assign({}, cd2, { prompt: finalPromptMessages, apiOptions });
            } else {
                dataWithOptions = { messages: finalPromptMessages, apiOptions };
            }
            return dataWithOptions;
        };
        if (nonstream) {
            try { if (lock) deactivateSendButtons(); } catch {}
            try {
                const dataWithOptions = await buildGenDataWithOptions();
                const chatMsgs = Array.isArray(dataWithOptions?.prompt) ? dataWithOptions.prompt
                    : (Array.isArray(dataWithOptions?.messages) ? dataWithOptions.messages : []);
                await this._emitPromptReady(chatMsgs);
                const finalText = await this.processGeneration(dataWithOptions, prompt, sessionId, false);
                return String(finalText ?? '');
            } finally {
                try { if (lock) activateSendButtons(); } catch {}
            }
        }
        (async () => {
            try {
                try { if (lock) deactivateSendButtons(); } catch {}
                const dataWithOptions = await buildGenDataWithOptions();
                const chatMsgs = Array.isArray(dataWithOptions?.prompt) ? dataWithOptions.prompt
                    : (Array.isArray(dataWithOptions?.messages) ? dataWithOptions.messages : []);
                await this._emitPromptReady(chatMsgs);
                const finalText = await this.processGeneration(dataWithOptions, prompt, sessionId, true);
                try { if (args && args._scope) args._scope.pipe = String(finalText ?? ''); } catch {}
            } catch {}
            finally {
                try { if (lock) activateSendButtons(); } catch {}
            }
        })();
        return String(sessionId);
    }

    registerCommands() {
        const commonArgs = [
            { name: 'id', description: '会话ID', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'api', description: '后端: openai/claude/gemini/cohere/deepseek/custom', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'net', description: '联网 on/off', typeList: [ARGUMENT_TYPE.STRING], enumList: ['on','off'] },
            { name: 'apiurl', description: '自定义后端URL', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'apipassword', description: '后端密码', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'model', description: '模型名', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'position', description: '插入位置：bottom/history', typeList: [ARGUMENT_TYPE.STRING], enumList: ['bottom', 'history'] },
            { name: 'temperature', description: '温度', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'presence_penalty', description: '存在惩罚', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'frequency_penalty', description: '频率惩罚', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'top_p', description: 'Top P', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'top_k', description: 'Top K', typeList: [ARGUMENT_TYPE.STRING] },
            { name: 'max_tokens', description: '最大回复长度', typeList: [ARGUMENT_TYPE.STRING] },
        ];
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbgen',
            callback: (args, prompt) => this.xbgenCommand(args, prompt),
            namedArgumentList: [
                { name: 'as', description: '消息角色', typeList: [ARGUMENT_TYPE.STRING], defaultValue: 'system', enumList: ['user', 'system', 'assistant'] },
                { name: 'nonstream', description: '非流式：true/false', typeList: [ARGUMENT_TYPE.STRING], enumList: ['true', 'false'] },
                { name: 'lock', description: '生成时锁定输入 on/off', typeList: [ARGUMENT_TYPE.STRING], enumList: ['on', 'off'] },
                ...commonArgs
            ].map(SlashCommandNamedArgument.fromProps),
            unnamedArgumentList: [SlashCommandArgument.fromProps({
                description: '生成提示文本', typeList: [ARGUMENT_TYPE.STRING], isRequired: true
            })],
            helpString: '使用完整上下文进行流式生成',
            returns: 'session ID'
        }));
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'xbgenraw',
            callback: (args, prompt) => this.xbgenrawCommand(args, prompt),
            namedArgumentList: [
                { name: 'as', description: '消息角色', typeList: [ARGUMENT_TYPE.STRING], defaultValue: 'user', enumList: ['user', 'system', 'assistant'] },
                { name: 'nonstream', description: '非流式：true/false', typeList: [ARGUMENT_TYPE.STRING], enumList: ['true', 'false'] },
                { name: 'lock', description: '生成时锁定输入 on/off', typeList: [ARGUMENT_TYPE.STRING], enumList: ['on', 'off'] },
                { name: 'addon', description: '附加上下文', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'topsys', description: '置顶 system', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'topuser', description: '置顶 user', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'topassistant', description: '置顶 assistant', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'bottomsys', description: '置底 system', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'bottomuser', description: '置底 user', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'bottomassistant', description: '置底 assistant', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'top', description: '复合置顶: assistant={A};user={B};sys={C}', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'bottom', description: '复合置底: assistant={C};sys={D1}', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'top64', description: '复合置顶(base64-url安全编码)', typeList: [ARGUMENT_TYPE.STRING] },
                { name: 'bottom64', description: '复合置底(base64-url安全编码)', typeList: [ARGUMENT_TYPE.STRING] },
                ...commonArgs
            ].map(SlashCommandNamedArgument.fromProps),
            unnamedArgumentList: [SlashCommandArgument.fromProps({
                description: '原始提示文本', typeList: [ARGUMENT_TYPE.STRING], isRequired: false
            })],
            helpString: '使用原始提示进行流式生成',
            returns: 'session ID'
        }));
    }

    getLastGeneration = (sessionId) => sessionId !== undefined ?
        (this.sessions.get(this._getSlotId(sessionId))?.text || '') : this.tempreply;

    getStatus = (sessionId) => {
        if (sessionId !== undefined) {
            const sid = this._getSlotId(sessionId);
            const s = this.sessions.get(sid);
            return s ? { isStreaming: !!s.isStreaming, text: s.text, sessionId: sid }
                     : { isStreaming: false, text: '', sessionId: sid };
        }
        return { isStreaming: !!this.isStreaming, text: this.tempreply };
    };

    startSession = (id, prompt) => this._ensureSession(id, prompt).id;
    getLastSessionId = () => this.lastSessionId;

    cancel(sessionId) {
        const s = this.sessions.get(this._getSlotId(sessionId));
        s?.abortController?.abort();
    }

    cleanup() {
        this.sessions.forEach(s => s.abortController?.abort());
        Object.assign(this, {
            sessions: new Map(), tempreply: '', lastSessionId: null,
            activeCount: 0, isInitialized: false, isStreaming: false
        });
    }
}

const streamingGeneration = new StreamingGeneration();

CacheRegistry.register('streamingGeneration', {
    name: '流式生成会话',
    getSize: () => streamingGeneration?.sessions?.size || 0,
    getBytes: () => {
        try {
            let bytes = String(streamingGeneration?.tempreply || '').length * 2; // UTF-16
            streamingGeneration?.sessions?.forEach?.((s) => {
                bytes += (String(s?.prompt || '').length + String(s?.text || '').length) * 2; // UTF-16
            });
            return bytes;
        } catch {
            return 0;
        }
    },
    clear: () => {
        try { streamingGeneration.cleanup(); } catch {}
    },
    getDetail: () => {
        try {
            const sessions = Array.from(streamingGeneration.sessions?.values?.() || []);
            return sessions.map(s => ({
                id: s?.id,
                isStreaming: !!s?.isStreaming,
                promptLen: String(s?.prompt || '').length,
                textLen: String(s?.text || '').length,
                updatedAt: s?.updatedAt || 0,
            }));
        } catch {
            return [];
        }
    },
});

export function initStreamingGeneration() {
    const w = window;
    if ((w)?.isXiaobaixEnabled === false) return;
    try { xbLog.info('streamingGeneration', 'initStreamingGeneration'); } catch {}
    streamingGeneration.init();
    (w)?.registerModuleCleanup?.('streamingGeneration', () => streamingGeneration.cleanup());
}

export { streamingGeneration };

if (typeof window !== 'undefined') {
    Object.assign(window, {
        xiaobaixStreamingGeneration: streamingGeneration,
        eventSource: (window)?.eventSource || eventSource
    });
}
