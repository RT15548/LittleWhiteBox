import { oai_settings, chat_completion_sources, getChatCompletionModel, promptManager } from "../../../openai.js";
import { ChatCompletionService } from "../../../custom-request.js";
import { eventSource, event_types } from "../../../../script.js";
import { getContext } from "../../../st-context.js";

const SOURCE_TAG = 'xiaobaix-host';

const POSITIONS = Object.freeze({ BEFORE_PROMPT: 'BEFORE_PROMPT', IN_PROMPT: 'IN_PROMPT', IN_CHAT: 'IN_CHAT', AFTER_COMPONENT: 'AFTER_COMPONENT' });
const KNOWN_KEYS = Object.freeze(new Set([
    'main', 'chatHistory', 'worldInfo', 'worldInfoBefore', 'worldInfoAfter',
    'charDescription', 'charPersonality', 'scenario', 'personaDescription',
    'dialogueExamples', 'authorsNote', 'vectorsMemory', 'vectorsDataBank',
    'smartContext', 'jailbreak', 'nsfw', 'summary', 'bias', 'impersonate', 'quietPrompt',
]));

class CallGenerateService {
    constructor() {
        /** @type {Map<string, { id: string, abortController: AbortController, accumulated: string, startedAt: number }>} */
        this.sessions = new Map();
        this._toggleBusy = false;
        this._lastToggleSnapshot = null;
        this._toggleQueue = Promise.resolve();
    }

    // ===== 通用错误处理 =====
    normalizeError(err, fallbackCode = 'API_ERROR', details = null) {
        try {
            if (!err) return { code: fallbackCode, message: 'Unknown error', details };
            if (typeof err === 'string') return { code: fallbackCode, message: err, details };
            const msg = err?.message || String(err);
            // Map known cases
            if (msg === 'INVALID_OPTIONS') return { code: 'INVALID_OPTIONS', message: 'Invalid options', details };
            if (msg === 'MISSING_MESSAGES') return { code: 'MISSING_MESSAGES', message: 'Missing messages', details };
            if (msg === 'INVALID_COMPONENT_REF') return { code: 'INVALID_COMPONENT_REF', message: 'Invalid component reference', details };
            if (msg === 'AMBIGUOUS_COMPONENT_NAME') return { code: 'AMBIGUOUS_COMPONENT_NAME', message: 'Ambiguous component name', details };
            if (msg === 'Unsupported provider') return { code: 'PROVIDER_UNSUPPORTED', message: msg, details };
            if (err?.name === 'AbortError') return { code: 'CANCELLED', message: 'Request cancelled', details };
            return { code: fallbackCode, message: msg, details };
        } catch {
            return { code: fallbackCode, message: 'Error serialization failed', details };
        }
    }

    sendError(sourceWindow, requestId, streamingEnabled, err, fallbackCode = 'API_ERROR', details = null) {
        const e = this.normalizeError(err, fallbackCode, details);
        const type = streamingEnabled ? 'generateStreamError' : 'generateError';
        try { sourceWindow?.postMessage({ source: SOURCE_TAG, type, id: requestId, error: e }, '*'); } catch {}
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
     * 选项校验（宽松）。
     * 支持仅 injections 或仅 userInput 构建场景。
     * @param {Object} options
     * @throws {Error} INVALID_OPTIONS 当 options 非对象
     */
    validateOptions(options) {
        if (!options || typeof options !== 'object') throw new Error('INVALID_OPTIONS');
        // 允许仅凭 injections 或 userInput 构建
        const hasComponents = options.components && Array.isArray(options.components.list);
        const hasInjections = Array.isArray(options.injections) && options.injections.length > 0;
        const hasUserInput = typeof options.userInput === 'string' && options.userInput.length >= 0;
        if (!hasComponents && !hasInjections && !hasUserInput) {
            // 仍允许空配置，但会构建空 + userInput
            return;
        }
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

        // 显式 baseURL 覆写
        const baseURL = overrides?.baseURL || api?.baseURL;
        if (baseURL) {
            if (resolved.chat_completion_source === chat_completion_sources.CUSTOM) {
                resolved.custom_url = String(baseURL);
            } else {
                resolved.reverse_proxy = String(baseURL).replace(/\/?$/, '');
            }
        }

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

    async _withTemporaryPromptToggles(includeConfig, fn) { return await this._withPromptToggle({ includeConfig }, fn); }

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

    /** 使用 identifier 集合进行临时启停捕获 */
    async _withPromptEnabledSet(enableSet, fn) { return await this._withPromptToggle({ enableSet }, fn); }

    /** 统一启停切换：支持 includeConfig（标识集）或 enableSet（组件键集合） */
    async _withPromptToggle({ includeConfig = null, enableSet = null } = {}, fn) {
        if (!promptManager || typeof promptManager.getPromptOrderForCharacter !== 'function') {
            return await fn();
        }
        // 使用队列保证串行执行，避免忙等
        const runExclusive = async () => {
            this._toggleBusy = true;
            let snapshot = [];
            try {
                const pm = promptManager;
                const activeChar = pm?.activeCharacter ?? null;
                const order = pm?.getPromptOrderForCharacter(activeChar) ?? [];
                snapshot = order.map(e => ({ identifier: e.identifier, enabled: !!e.enabled }));
                this._lastToggleSnapshot = snapshot.map(s => ({ ...s }));

                if (includeConfig) {
                    const enableIds = this._computeEnableIds(includeConfig);
                    order.forEach(e => { e.enabled = enableIds.has(e.identifier); });
                } else if (enableSet) {
                    const allow = enableSet instanceof Set ? enableSet : new Set(enableSet);
                    order.forEach(e => {
                        let ok = false;
                        for (const k of allow) { if (this._identifierMatchesKey(e.identifier, k)) { ok = true; break; } }
                        e.enabled = ok;
                    });
                }

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
        };
        this._toggleQueue = this._toggleQueue.then(runExclusive, runExclusive);
        return await this._toggleQueue;
    }

    async _captureWithEnabledSet(enableSet, quietText = '', skipWIAN = false) {
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
            await this._withPromptToggle({ enableSet }, async () => {
                await ctx.generate('normal', { quiet_prompt: String(quietText || ''), quietToLoud: false, skipWIAN, force_name2: true }, true);
            });
        } finally {
            eventSource.removeListener(event_types.GENERATE_AFTER_DATA, listener);
        }
        if (!capturedData) return [];
        if (capturedData && typeof capturedData === 'object' && Array.isArray(capturedData.prompt)) return capturedData.prompt.slice();
        if (Array.isArray(capturedData)) return capturedData.slice();
        return [];
    }

    // ===== 工具函数：组件与消息辅助 =====

    /**
     * 获取消息的 component key（用于匹配与排序）。
     * chatHistory-* 归并为 chatHistory；dialogueExamples x-y 归并为 dialogueExamples。
     * @param {string} identifier
     * @returns {string}
     */
    _getComponentKeyFromIdentifier(identifier) {
        const id = String(identifier || '');
        if (id.startsWith('chatHistory')) return 'chatHistory';
        if (id.startsWith('dialogueExamples')) return 'dialogueExamples';
        return id;
    }

    /**
     * 判断具体 identifier 是否匹配某组件 key（处理聚合键）。
     * @param {string} identifier
     * @param {string} key
     * @returns {boolean}
     */
    _identifierMatchesKey(identifier, key) {
        const id = String(identifier || '');
        const k = String(key || '');
        if (!k || !id) return false;
        if (k === 'dialogueExamples') return id.startsWith('dialogueExamples');
        if (k === 'worldInfo') return id === 'worldInfoBefore' || id === 'worldInfoAfter';
        if (k === 'chatHistory') return id === 'chatHistory' || id.startsWith('chatHistory');
        return id === k;
    }

    /** 将组件键映射到创建锚点与角色，并生成稳定 identifier */
    _mapCreateAnchorForKey(key) {
        const k = String(key || '');
        const sys = { position: POSITIONS.IN_PROMPT, role: 'system' };
        const asst = { position: POSITIONS.IN_PROMPT, role: 'assistant' };
        if (k === 'bias') return { ...asst, identifier: 'bias' };
        if (k === 'worldInfo' || k === 'worldInfoBefore') return { ...sys, identifier: 'worldInfoBefore' };
        if (k === 'worldInfoAfter') return { ...sys, identifier: 'worldInfoAfter' };
        if (k === 'charDescription') return { ...sys, identifier: 'charDescription' };
        if (k === 'charPersonality') return { ...sys, identifier: 'charPersonality' };
        if (k === 'scenario') return { ...sys, identifier: 'scenario' };
        if (k === 'personaDescription') return { ...sys, identifier: 'personaDescription' };
        if (k === 'quietPrompt') return { ...sys, identifier: 'quietPrompt' };
        if (k === 'impersonate') return { ...sys, identifier: 'impersonate' };
        if (k === 'authorsNote') return { ...sys, identifier: 'authorsNote' };
        if (k === 'vectorsMemory') return { ...sys, identifier: 'vectorsMemory' };
        if (k === 'vectorsDataBank') return { ...sys, identifier: 'vectorsDataBank' };
        if (k === 'smartContext') return { ...sys, identifier: 'smartContext' };
        if (k === 'summary') return { ...sys, identifier: 'summary' };
        if (k === 'dialogueExamples') return { ...sys, identifier: 'dialogueExamples 0-0' };
        // 默认走 system+IN_PROMPT，并使用 key 作为 identifier
        return { ...sys, identifier: k };
    }

    /**
     * 将 name 解析为唯一 identifier。
     * 规则：
     * 1) 先快速命中已知原生键（直接返回同名 identifier）
     * 2) 扫描 PromptManager 的“订单列表”和“集合”，按 name/label/title 精确匹配（大小写不敏感），唯一命中返回其 identifier
     * 3) 失败时做一步 sanitize 对比（将非单词字符转为下划线）
     * 4) 多命中抛出 AMBIGUOUS_COMPONENT_NAME，零命中返回 null
     */
    _resolveNameToIdentifier(rawName) {
        try {
            const nm = String(rawName || '').trim();
            if (!nm) return null;

            // 1) 原生与常见聚合键的快速命中（支持用户用 name 指代这些键）
            if (KNOWN_KEYS.has(nm)) return nm;

            const eq = (a, b) => String(a || '').trim() === String(b || '').trim();
            const sanitize = (s) => String(s || '').replace(/\W/g, '_');

            const matches = new Set();

            // 缓存命中
            try {
                const nameCache = this._getNameCache();
                if (nameCache.has(nm)) return nameCache.get(nm);
            } catch {}

            // 2) 扫描 PromptManager 的订单（显示用）
            try {
                if (promptManager && typeof promptManager.getPromptOrderForCharacter === 'function') {
                    const pm = promptManager;
                    const activeChar = pm?.activeCharacter ?? null;
                    const order = pm.getPromptOrderForCharacter(activeChar) || [];
                    for (const e of order) {
                        const id = e?.identifier;
                        if (!id) continue;
                        const candidates = [e?.name, e?.label, e?.title, id].filter(Boolean);
                        if (candidates.some(x => eq(x, nm))) {
                            matches.add(id);
                            continue;
                        }
                    }
                }
            } catch {}

            // 3) 扫描 Prompt 集合（运行期合并后的集合）
            try {
                if (promptManager && typeof promptManager.getPromptCollection === 'function') {
                    const pc = promptManager.getPromptCollection();
                    const coll = pc?.collection || [];
                    for (const p of coll) {
                        const id = p?.identifier;
                        if (!id) continue;
                        const candidates = [p?.name, p?.label, p?.title, id].filter(Boolean);
                        if (candidates.some(x => eq(x, nm))) {
                            matches.add(id);
                            continue;
                        }
                    }
                }
            } catch {}

            // 4) 失败时尝试 sanitize 名称与 identifier 的弱匹配
            if (matches.size === 0) {
                const nmSan = sanitize(nm);
                try {
                    if (promptManager && typeof promptManager.getPromptCollection === 'function') {
                        const pc = promptManager.getPromptCollection();
                        const coll = pc?.collection || [];
                        for (const p of coll) {
                            const id = p?.identifier;
                            if (!id) continue;
                            if (sanitize(id) === nmSan) {
                                matches.add(id);
                            }
                        }
                    }
                } catch {}
            }

            if (matches.size === 1) {
                const id = Array.from(matches)[0];
                try { this._getNameCache().set(nm, id); } catch {}
                return id;
            }
            if (matches.size > 1) {
                const err = new Error('AMBIGUOUS_COMPONENT_NAME');
                err.details = { name: nm, candidates: Array.from(matches) };
                throw err;
            }
            return null;
        } catch (e) {
            // 透传歧义错误，其它情况视为未命中
            if (String(e?.message) === 'AMBIGUOUS_COMPONENT_NAME') throw e;
            return null;
        }
    }

    /**
     * 解析组件引用 token：
     * - 'ALL' → 特殊标记
     * - 'id:identifier' → 直接返回 identifier
     * - 'name:xxx' → 通过名称解析为 identifier（大小写敏感）
     * - 'xxx' → 先按 name 精确匹配，未命中回退为 identifier
     * @param {string} token
     * @returns {string|null}
     */
    _parseComponentRefToken(token) {
        if (!token) return null;
        if (typeof token !== 'string') return null;
        const raw = token.trim();
        if (!raw) return null;
        if (raw.toLowerCase() === 'all') return 'ALL';
        if (raw.startsWith('id:')) return raw.slice(3).trim();
        if (raw.startsWith('name:')) {
            const nm = raw.slice(5).trim();
            const id = this._resolveNameToIdentifier(nm);
            if (id) return id;
            const err = new Error('INVALID_COMPONENT_REF');
            err.details = { ref: token };
            throw err;
        }
        // 默认按 name 精确匹配；未命中则回退当作 identifier 使用
        try {
            const byName = this._resolveNameToIdentifier(raw);
            if (byName) return byName;
        } catch (e) {
            if (String(e?.message) === 'AMBIGUOUS_COMPONENT_NAME') throw e;
        }
        return raw;
    }

    // ===== 轻量缓存：按 activeCharacter 维度缓存 name→identifier 与 footprint =====
    _getActiveCharacterIdSafe() {
        try {
            return promptManager?.activeCharacter ?? 'default';
        } catch { return 'default'; }
    }

    _getNameCache() {
        if (!this._nameCache) this._nameCache = new Map();
        const key = this._getActiveCharacterIdSafe();
        if (!this._nameCache.has(key)) this._nameCache.set(key, new Map());
        return this._nameCache.get(key);
    }

    _getFootprintCache() {
        if (!this._footprintCache) this._footprintCache = new Map();
        const key = this._getActiveCharacterIdSafe();
        if (!this._footprintCache.has(key)) this._footprintCache.set(key, new Map());
        return this._footprintCache.get(key);
    }

    /**
     * 解析统一 list：返回三元组
     * - references: 组件引用序列
     * - inlineInjections: 内联注入项（含原始索引）
     * - listOverrides: 行内覆写（以组件引用为键）
     * @param {Array<any>} list
     * @returns {{references:string[], inlineInjections:Array<{index:number,item:any}>, listOverrides:Object}}
     */
    _parseUnifiedList(list) {
        const references = [];
        const inlineInjections = [];
        const listOverrides = {};
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (typeof item === 'string') {
                references.push(item);
                continue;
            }
            if (item && typeof item === 'object' && item.role && item.content) {
                inlineInjections.push({ index: i, item });
                continue;
            }
            if (item && typeof item === 'object') {
                const keys = Object.keys(item);
                for (const k of keys) {
                    // k 是组件引用，如 'id:charDescription' / 'scenario' / 'chatHistory' / 'main'
                    references.push(k);
                    const cfg = item[k];
                    if (cfg && typeof cfg === 'object') {
                        listOverrides[k] = Object.assign({}, listOverrides[k] || {}, cfg);
                    }
                }
            }
        }
        return { references, inlineInjections, listOverrides };
    }

    /**
     * 基于原始 list 计算内联注入的邻接规则，映射到 position/depth。
     * 默认：紧跟前一组件（AFTER_COMPONENT）；首项+attach=prev → BEFORE_PROMPT；邻接 chatHistory → IN_CHAT。
     * @param {Array<any>} rawList
     * @param {Array<{index:number,item:any}>} inlineInjections
     * @returns {Array<{role:string,content:string,position:string,depth?:number,_afterRef?:string}>}
     */
    _mapInlineInjectionsUnified(rawList, inlineInjections) {
        const result = [];
        const getRefAt = (idx, dir) => {
            let j = idx + (dir < 0 ? -1 : 1);
            while (j >= 0 && j < rawList.length) {
                const it = rawList[j];
                if (typeof it === 'string') {
                    const token = this._parseComponentRefToken(it);
                    if (token && token !== 'ALL') return token;
                } else if (it && typeof it === 'object') {
                    if (it.role && it.content) {
                        // inline injection, skip
                    } else {
                        const ks = Object.keys(it);
                        if (ks.length) {
                            const tk = this._parseComponentRefToken(ks[0]);
                            if (tk) return tk;
                        }
                    }
                }
                j += (dir < 0 ? -1 : 1);
            }
            return null;
        };
        for (const { index, item } of inlineInjections) {
            const prevRef = getRefAt(index, -1);
            const nextRef = getRefAt(index, +1);
            const attach = item.attach === 'prev' || item.attach === 'next' ? item.attach : 'auto';
            // 显式 position 优先
            if (item.position && typeof item.position === 'string') {
                result.push({ role: item.role, content: item.content, position: item.position, depth: item.depth || 0 });
                continue;
            }
            // 有前邻组件 → 默认插到该组件之后（满足示例：位于 charDescription 之后、main 之前）
            if (prevRef) {
                result.push({ role: item.role, content: item.content, position: POSITIONS.AFTER_COMPONENT, _afterRef: prevRef });
                continue;
            }
            if (index === 0 && attach === 'prev') {
                result.push({ role: item.role, content: item.content, position: POSITIONS.BEFORE_PROMPT });
                continue;
            }
            if (prevRef === 'chatHistory' || nextRef === 'chatHistory') {
                result.push({ role: item.role, content: item.content, position: POSITIONS.IN_CHAT, depth: 0, _attach: attach === 'prev' ? 'before' : 'after' });
                continue;
            }
            result.push({ role: item.role, content: item.content, position: POSITIONS.IN_PROMPT });
        }
        return result;
    }

    /**
     * 根据组件集合过滤消息（当 list 不含 ALL）。
     * @param {Array<any>} messages
     * @param {Set<string>} wantedKeys
     * @returns {Array<any>}
     */
    _filterMessagesByComponents(messages, wantedKeys) {
        if (!wantedKeys || !wantedKeys.size) return [];
        return messages.filter(m => wantedKeys.has(this._getComponentKeyFromIdentifier(m?.identifier)));
    }

    /** 稳定重排：对目标子集按给定顺序排序，其他保持相对不变 */
    _stableReorderSubset(messages, orderedKeys) {
        if (!Array.isArray(messages) || !orderedKeys || !orderedKeys.length) return messages;
        const orderIndex = new Map();
        orderedKeys.forEach((k, i) => orderIndex.set(k, i));
        // 提取目标子集的元素与其原索引
        const targetIndices = [];
        const targetMessages = [];
        messages.forEach((m, idx) => {
            const key = this._getComponentKeyFromIdentifier(m?.identifier);
            if (orderIndex.has(key)) {
                targetIndices.push(idx);
                targetMessages.push({ m, ord: orderIndex.get(key) });
            }
        });
        if (!targetIndices.length) return messages;
        // 对目标子集按 ord 稳定排序
        targetMessages.sort((a, b) => a.ord - b.ord);
        // 将排序后的目标消息放回原有“子集槽位”，非目标元素完全不动
        const out = messages.slice();
        for (let i = 0; i < targetIndices.length; i++) {
            out[targetIndices[i]] = targetMessages[i].m;
        }
        return out;
    }

    // ===== 缺失 identifier 的兜底标注 =====
    _normalizeText(s) {
        return String(s || '').replace(/[\r\t\u200B\u00A0]/g, '').replace(/\s+/g, ' ').replace(/^[("']+|[("']+$/g, '').trim();
    }

    _stripNamePrefix(s) {
        return String(s || '').replace(/^\s*[^:]{1,32}:\s*/, '');
    }

    _normStrip(s) { return this._normalizeText(this._stripNamePrefix(s)); }

    _createIsFromChat() {
        try {
            const ctx = getContext();
            const chatArr = Array.isArray(ctx?.chat) ? ctx.chat : [];
            const chatNorms = chatArr.map(m => this._normStrip(m?.mes)).filter(Boolean);
            const chatSet = new Set(chatNorms);
            return (content) => {
                const n = this._normStrip(content);
                if (!n) return false;
                if (chatSet.has(n)) return true;
                for (const c of chatNorms) {
                    const a = n.length, b = c.length;
                    const minL = Math.min(a, b), maxL = Math.max(a, b);
                    if (minL < 20) continue;
                    if (((a >= b && n.includes(c)) || (b >= a && c.includes(n))) && minL / maxL >= 0.8) return true;
                }
                return false;
            };
        } catch {
            return () => false;
        }
    }

    async _annotateIdentifiersIfMissing(messages, targetKeys) {
        const arr = Array.isArray(messages) ? messages.map(m => ({ ...m })) : [];
        if (!arr.length) return arr;
        const hasIdentifier = arr.some(m => typeof m?.identifier === 'string' && m.identifier);
        // 标注 chatHistory：依据 role + 来源判断
        const isFromChat = this._createIsFromChat();
        for (const m of arr) {
            if (!m?.identifier && (m?.role === 'user' || m?.role === 'assistant') && isFromChat(m.content)) {
                m.identifier = 'chatHistory-annotated';
            }
        }
        // 即使部分已有 identifier，也继续尝试为缺失者做 footprint 标注
        // 若仍缺失，按目标 keys 单独捕获来反向标注
        const keys = Array.from(new Set((Array.isArray(targetKeys) ? targetKeys : []).filter(Boolean)));
        if (!keys.length) return arr;
        const footprint = new Map(); // key -> Set of norm strings
        for (const key of keys) {
            try {
                if (key === 'chatHistory') continue; // 已在上面标注
                // footprint 缓存命中
                const fpCache = this._getFootprintCache();
                if (fpCache.has(key)) {
                    footprint.set(key, fpCache.get(key));
                } else {
                    const capture = await this._captureWithEnabledSet(new Set([key]), '', false);
                    const normSet = new Set(capture.map(x => `[${x.role}] ${this._normStrip(x.content)}`));
                    footprint.set(key, normSet);
                    try { fpCache.set(key, normSet); } catch {}
                }
            } catch {}
        }
        for (const m of arr) {
            if (m?.identifier) continue;
            const sig = `[${m?.role}] ${this._normStrip(m?.content)}`;
            for (const [key, set] of footprint.entries()) {
                if (set.has(sig)) { m.identifier = key; break; }
            }
        }
        return arr;
    }

    /** 覆写：通用组件 disable/replace（文本级），不影响采样参数 */
    _applyGeneralOverrides(messages, overridesByComponent) {
        if (!overridesByComponent) return messages;
        let out = messages.slice();
        for (const ref in overridesByComponent) {
            if (!Object.prototype.hasOwnProperty.call(overridesByComponent, ref)) continue;
            const cfg = overridesByComponent[ref];
            if (!cfg || typeof cfg !== 'object') continue;
            const key = this._parseComponentRefToken(ref);
            if (!key) continue;
            if (key === 'chatHistory') continue; // 历史专属逻辑另行处理
            const disable = !!cfg.disable;
            const replace = typeof cfg.replace === 'string' ? cfg.replace : null;
            if (disable) {
                out = out.filter(m => this._getComponentKeyFromIdentifier(m?.identifier) !== key);
                continue;
            }
            if (replace != null) {
                out = out.map(m => this._getComponentKeyFromIdentifier(m?.identifier) === key ? { ...m, content: replace } : m);
            }
        }
        return out;
    }

    /** 仅对 chatHistory 应用 selector/replaceAll/replace */
    _applyChatHistoryOverride(messages, historyCfg) {
        if (!historyCfg) return messages;
        const all = messages.slice();
        const indexes = [];
        for (let i = 0; i < all.length; i++) {
            const m = all[i];
            if (this._getComponentKeyFromIdentifier(m?.identifier) === 'chatHistory') indexes.push(i);
        }
        if (indexes.length === 0) return messages;
        if (historyCfg.disable) {
            // 直接移除全部历史
            return all.filter((m, idx) => !indexes.includes(idx));
        }
        const history = indexes.map(i => all[i]);

        // selector 过滤
        let selected = history.slice();
        if (historyCfg.selector) {
            // 在历史子集上应用 selector
            selected = this.applyChatHistorySelector(history, historyCfg.selector);
        }

        // 替换逻辑
        let replaced = selected.slice();
        if (historyCfg.replaceAll && Array.isArray(historyCfg.with)) {
            replaced = (historyCfg.with || []).map((w, idx) => ({ role: w.role, content: w.content, identifier: `chatHistory-replaceAll-${idx}` }));
        }
        if (Array.isArray(historyCfg.replace)) {
            // 在 replaced 上按顺序执行多段替换
            for (const step of historyCfg.replace) {
                const withArr = Array.isArray(step?.with) ? step.with : [];
                const newMsgs = withArr.map((w, idx) => ({ role: w.role, content: w.content, identifier: `chatHistory-replace-${Date.now()}-${idx}` }));
                let indices = [];
                if (step?.indices?.values && Array.isArray(step.indices.values) && step.indices.values.length) {
                    const n = replaced.length;
                    indices = step.indices.values.map(v0 => {
                        let v = Number(v0);
                        if (Number.isNaN(v)) return -1;
                        if (v < 0) v = n + v;
                        return (v >= 0 && v < n) ? v : -1;
                    }).filter(v => v >= 0);
                } else if (step?.range && (step.range.start !== undefined || step.range.end !== undefined)) {
                    let { start = 0, end = replaced.length - 1 } = step.range;
                    const n = replaced.length;
                    start = Number(start); end = Number(end);
                    if (Number.isNaN(start)) start = 0;
                    if (Number.isNaN(end)) end = n - 1;
                    if (start < 0) start = n + start;
                    if (end < 0) end = n + end;
                    start = Math.max(0, start); end = Math.min(n - 1, end);
                    if (start <= end) indices = Array.from({ length: end - start + 1 }, (_, k) => start + k);
                } else if (step?.last != null) {
                    const k = Math.max(0, Number(step.last) || 0);
                    const n = replaced.length;
                    indices = k > 0 ? Array.from({ length: Math.min(k, n) }, (_, j) => n - k + j) : [];
                }
                if (indices.length) {
                    // 按出现顺序处理：先删除这些索引，再按同位置插入（采用最小索引处插入）
                    const set = new Set(indices);
                    const kept = replaced.filter((_, idx) => !set.has(idx));
                    const insertAt = Math.min(...indices);
                    replaced = kept.slice(0, insertAt).concat(newMsgs).concat(kept.slice(insertAt));
                }
            }
        }

        // 将 replaced 合并回全量：找到历史的第一个索引，替换整个历史窗口
        const first = Math.min(...indexes);
        const last = Math.max(...indexes);
        const before = all.slice(0, first);
        const after = all.slice(last + 1);
        return before.concat(replaced).concat(after);
    }

    /** 将高级 injections 应用到 messages */
    _applyAdvancedInjections(messages, injections = []) {
        if (!Array.isArray(injections) || injections.length === 0) return messages;
        const out = messages.slice();
        // 计算 chatHistory 边界
        const historyIdx = [];
        for (let i = 0; i < out.length; i++) if (this._getComponentKeyFromIdentifier(out[i]?.identifier) === 'chatHistory') historyIdx.push(i);
        const hasHistory = historyIdx.length > 0;
        const historyStart = hasHistory ? Math.min(...historyIdx) : -1;
        const historyEnd = hasHistory ? Math.max(...historyIdx) : -1;
        for (const inj of injections) {
            const role = inj?.role; const content = inj?.content;
            if (!role || typeof content !== 'string') continue;
            const forcedId = inj && typeof inj.identifier === 'string' && inj.identifier.trim() ? String(inj.identifier).trim() : null;
            const msg = { role, content, identifier: forcedId || `injection-${inj.position || POSITIONS.IN_PROMPT}-${Date.now()}-${Math.random().toString(36).slice(2)}` };
            if (inj.position === POSITIONS.BEFORE_PROMPT) {
                out.splice(0, 0, msg);
                continue;
            }
            if (inj.position === POSITIONS.AFTER_COMPONENT) {
                const ref = inj._afterRef || null;
                let inserted = false;
                if (ref) {
                    for (let i = out.length - 1; i >= 0; i--) {
                        const id = out[i]?.identifier;
                        if (this._identifierMatchesKey(id, ref) || this._getComponentKeyFromIdentifier(id) === ref) {
                            out.splice(i + 1, 0, msg);
                            inserted = true; break;
                        }
                    }
                }
                if (!inserted) {
                    // 回退同 IN_PROMPT
                    if (hasHistory) {
                        const depth = Math.max(0, Number(inj.depth) || 0);
                        const insertPos = Math.max(0, historyStart - depth);
                        out.splice(insertPos, 0, msg);
                    } else {
                        out.splice(0, 0, msg);
                    }
                }
                continue;
            }
            if (inj.position === POSITIONS.IN_CHAT && hasHistory) {
                // depth=0 → 历史末尾后；depth>0 → 进入历史内部；
                const depth = Math.max(0, Number(inj.depth) || 0);
                if (inj._attach === 'before') {
                    const insertPos = Math.max(historyStart - depth, 0);
                    out.splice(insertPos, 0, msg);
                } else {
                    const insertPos = Math.min(out.length, historyEnd + 1 - depth);
                    out.splice(Math.max(historyStart, insertPos), 0, msg);
                }
                continue;
            }
            // IN_PROMPT 或无历史：在 chatHistory 之前插入，否则置顶后
            if (hasHistory) {
                const depth = Math.max(0, Number(inj.depth) || 0);
                const insertPos = Math.max(0, historyStart - depth);
                out.splice(insertPos, 0, msg);
            } else {
                out.splice(0, 0, msg);
            }
        }
        return out;
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

    // ===== 发送实现（构建后的统一发送） =====

    async _sendMessages(messages, options, requestId, sourceWindow) {
        const sessionId = this.normalizeSessionId(options?.session?.id || 'xb1');
        const session = this.ensureSession(sessionId);
        const streamingEnabled = options?.streaming?.enabled !== false; // 默认开
        const apiCfg = this.resolveApiConfig(options?.api || {});
        const payload = this.buildChatPayload(messages, apiCfg, streamingEnabled);

        try {
            const shouldExport = !!(options?.debug?.enabled || options?.debug?.exportPrompt);
            const already = options?.debug?._exported === true;
            if (shouldExport && !already) {
                this.postToTarget(sourceWindow, 'generatePromptPreview', { id: requestId, messages: (messages || []).map(m => ({ role: m.role, content: m.content })) });
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
            this.sendError(sourceWindow, requestId, streamingEnabled, err);
            return null;
        }
    }

    // ===== 主流程 =====
    async handleRequestInternal(options, requestId, sourceWindow) {
        // 1) 校验
        this.validateOptions(options);

        // 2) 解析组件列表与内联注入
        const list = Array.isArray(options?.components?.list) ? options.components.list.slice() : undefined;
        let baseStrategy = 'EMPTY'; // EMPTY | ALL | SUBSET
        let orderedRefs = [];
        let inlineMapped = [];
        let listLevelOverrides = {};
        const unorderedKeys = new Set();
        if (list && list.length) {
            const { references, inlineInjections, listOverrides } = this._parseUnifiedList(list);
            listLevelOverrides = listOverrides || {};
            const parsedRefs = references.map(t => this._parseComponentRefToken(t));
            const containsAll = parsedRefs.includes('ALL');
            if (containsAll) {
                baseStrategy = 'ALL';
                // ALL 仅作为开关标识，子集重排目标为去除 ALL 后的引用列表
                orderedRefs = parsedRefs.filter(x => x && x !== 'ALL');
            } else {
                baseStrategy = 'SUBSET';
                orderedRefs = parsedRefs.filter(Boolean);
            }
            inlineMapped = this._mapInlineInjectionsUnified(list, inlineInjections);
            // 放宽：ALL 可出现在任意位置，作为“启用全部”的标志

            // 解析 order=false：不参与重排
            for (const rawKey in listLevelOverrides) {
                if (!Object.prototype.hasOwnProperty.call(listLevelOverrides, rawKey)) continue;
                const k = this._parseComponentRefToken(rawKey);
                if (!k) continue;
                if (listLevelOverrides[rawKey] && listLevelOverrides[rawKey].order === false) unorderedKeys.add(k);
            }
        }

        // 3) 干跑捕获（基座）
        let captured = [];
        if (baseStrategy === 'EMPTY') {
            captured = [];
        } else {
            // 不将 userInput 作为 quietText 干跑，以免把其注入到历史里
            if (baseStrategy === 'ALL') {
                // 路径B：ALL 时先全开启用集合再干跑，保证真实组件尽量出现
                // 读取 promptManager 订单并构造 allow 集合
                let allow = new Set();
                try {
                    if (promptManager && typeof promptManager.getPromptOrderForCharacter === 'function') {
                        const pm = promptManager;
                        const activeChar = pm?.activeCharacter ?? null;
                        const order = pm?.getPromptOrderForCharacter(activeChar) ?? [];
                        allow = new Set(order.map(e => e.identifier));
                    }
                } catch {}
                const run = async () => await this._capturePromptMessages({ includeConfig: null, quietText: '', skipWIAN: false });
                captured = await this._withPromptEnabledSet(allow, run);
            } else {
                captured = await this._capturePromptMessages({ includeConfig: null, quietText: '', skipWIAN: false });
            }
        }

        // 4) 依据策略计算启用集合与顺序
        const annotateKeys = baseStrategy === 'SUBSET' ? orderedRefs : (baseStrategy === 'ALL' ? orderedRefs : []);
        let working = await this._annotateIdentifiersIfMissing(captured.slice(), annotateKeys);
        working = this._applyOrderingStrategy(working, baseStrategy, orderedRefs, unorderedKeys);

        // 5) 覆写与创建
        working = this._applyInlineOverrides(working, listLevelOverrides);

        // 6) 注入（内联 + 高级）
        working = this._applyAllInjections(working, inlineMapped, options?.injections);

        // 7) 用户输入追加
        working = this._appendUserInput(working, options?.userInput);

        // 8) 调试导出
        this._exportDebugData({ sourceWindow, requestId, working, baseStrategy, orderedRefs, inlineMapped, listLevelOverrides, debug: options?.debug });

        // 9) 发送
        return await this._sendMessages(working, { ...options, debug: { ...(options?.debug || {}), _exported: true } }, requestId, sourceWindow);
    }

    _applyOrderingStrategy(messages, baseStrategy, orderedRefs, unorderedKeys) {
        let out = messages.slice();
        if (baseStrategy === 'SUBSET') {
            const want = new Set(orderedRefs);
            out = this._filterMessagesByComponents(out, want);
        } else if (baseStrategy === 'ALL' && orderedRefs.length) {
            const targets = orderedRefs.filter(k => !unorderedKeys.has(k));
            if (targets.length) out = this._stableReorderSubset(out, targets);
        }
        return out;
    }

    _applyInlineOverrides(messages, byComp) {
        let out = messages.slice();
        if (!byComp) return out;
        out = this._applyGeneralOverrides(out, byComp);
        const ensureInjections = [];
        for (const ref in byComp) {
            if (!Object.prototype.hasOwnProperty.call(byComp, ref)) continue;
            const key = this._parseComponentRefToken(ref);
            if (!key || key === 'chatHistory') continue;
            const cfg = byComp[ref];
            if (!cfg || typeof cfg.replace !== 'string') continue;
            const exists = out.some(m => this._identifierMatchesKey(m?.identifier, key) || this._getComponentKeyFromIdentifier(m?.identifier) === key);
            if (exists) continue;
            const map = this._mapCreateAnchorForKey(key);
            ensureInjections.push({ position: map.position, role: map.role, content: cfg.replace, identifier: map.identifier });
        }
        if (ensureInjections.length) {
            out = this._applyAdvancedInjections(out, ensureInjections);
        }
        if (byComp['id:chatHistory'] || byComp['chatHistory']) {
            const cfg = byComp['id:chatHistory'] || byComp['chatHistory'];
            out = this._applyChatHistoryOverride(out, cfg);
        }
        return out;
    }

    _applyAllInjections(messages, inlineMapped, advancedInjections) {
        let out = messages.slice();
        if (inlineMapped && inlineMapped.length) {
            out = this._applyAdvancedInjections(out, inlineMapped);
        }
        if (Array.isArray(advancedInjections) && advancedInjections.length) {
            out = this._applyAdvancedInjections(out, advancedInjections);
        }
        return out;
    }

    _appendUserInput(messages, userInput) {
        const out = messages.slice();
        if (typeof userInput === 'string' && userInput.length >= 0) {
            out.push({ role: 'user', content: String(userInput || ''), identifier: 'userInput' });
        }
        return out;
    }

    _exportDebugData({ sourceWindow, requestId, working, baseStrategy, orderedRefs, inlineMapped, listLevelOverrides, debug }) {
        const exportPrompt = !!(debug?.enabled || debug?.exportPrompt);
        if (exportPrompt) this.postToTarget(sourceWindow, 'generatePromptPreview', { id: requestId, messages: working.map(m => ({ role: m.role, content: m.content })) });
        if (debug?.exportBlueprint) {
            try {
                const bp = {
                    id: requestId,
                    components: { strategy: baseStrategy, order: orderedRefs },
                    injections: (debug?.injections || []).concat(inlineMapped || []),
                    overrides: listLevelOverrides || null,
                };
                this.postToTarget(sourceWindow, 'blueprint', bp);
            } catch {}
        }
    }

    /**
     * 入口：处理 generateRequest（统一入口）
     */
    async handleGenerateRequest(options, requestId, sourceWindow) {
        let streamingEnabled = false;
        try {
            streamingEnabled = options?.streaming?.enabled !== false;
            return await this.handleRequestInternal(options, requestId, sourceWindow);
        } catch (err) {
            this.sendError(sourceWindow, requestId, streamingEnabled, err, 'BAD_REQUEST');
            return null;
        }
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
