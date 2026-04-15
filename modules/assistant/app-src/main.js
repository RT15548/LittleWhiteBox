import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';

const SOURCE = 'xb-assistant-app';
const ROOT_ID = 'xb-assistant-root';
const REQUEST_TIMEOUT_MS = 180000;
const MAX_TOOL_ROUNDS = 10;
const SESSION_STORAGE_KEY = 'littlewhitebox.assistant.session.v1';
const MAX_PERSISTED_MESSAGES = 60;
const MAX_PERSISTED_CONTENT_CHARS = 16000;
const TOAST_DURATION_MS = 2600;
const TOAST_DURATION_MIN_MS = 1800;
const TOAST_DURATION_MAX_MS = 4200;
const TOOL_MODE_OPTIONS = [
    { value: 'native', label: '原生 Tool Calling' },
    { value: 'tagged-json', label: 'Tagged JSON 兼容模式' },
];
const PROVIDER_OPTIONS = [
    { value: 'openai-responses', label: 'OpenAI Responses' },
    { value: 'openai-compatible', label: 'OpenAI-Compatible' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
];
const EXAMPLE_PROMPTS = [
    '为什么某个设置勾上后刷新又没了？',
    '向量生成时报 429 是哪一层限流？',
    '这个功能的代码入口在哪个文件？',
    '帮我查一下某个报错是从哪条链路抛出来的。',
];
const MODEL_FILTERS = {
    chat: {
        include: [],
        exclude: [
            'embedding', 'embed', 'rerank', 'reranker', 'tts', 'speech', 'audio',
            'whisper', 'transcription', 'stt', 'image', 'sdxl', 'flux', 'moderation',
        ],
    },
};
const SYSTEM_PROMPT = [
    '你是“小白助手”，是 LittleWhiteBox 内置的技术支持助手。',
    '你的主要任务是帮助用户理解 LittleWhiteBox 与 SillyTavern 前端公开代码、设置项、模块行为和常见报错。',
    '当问题涉及具体实现、文件路径、设置逻辑或错误原因时，优先使用工具查证后再回答。',
    '默认只读代码与资料；如果需要写入，只能写工作记录，不允许改代码。',
    '回答尽量具体、可核对、说人话，必要时引用文件路径。',
].join('\n');

const TOOL_DEFINITIONS = [
    {
        type: 'function',
        function: {
            name: 'list_files',
            description: '按文件名、路径名或来源列出候选文件。',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: '用于过滤文件路径的关键词。' },
                    limit: { type: 'number', description: '最多返回多少个文件。' },
                },
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'read_file',
            description: '读取某个已索引公开文本文件的完整内容。',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: '文件公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js。' },
                },
                required: ['path'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'search_files',
            description: '在可读源码文件中搜索关键词。',
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: '要搜索的关键词。' },
                    limit: { type: 'number', description: '最多返回多少条命中。' },
                },
                required: ['query'],
                additionalProperties: false,
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'write_workspace_note',
            description: '将排查结果或工作记录写入助手工作区文档。',
            parameters: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: '工作区文件名。' },
                    content: { type: 'string', description: '完整文档内容。' },
                },
                required: ['name', 'content'],
                additionalProperties: false,
            },
        },
    },
];

const state = {
    config: null,
    runtime: null,
    messages: [],
    isBusy: false,
    currentRound: 0,
    progressLabel: '',
    activeRun: null,
    autoScroll: true,
    toast: '',
    modelOptionsByProvider: {},
    pullStateByProvider: {},
};

const pendingToolCalls = new Map();
let toastTimer = null;

function post(type, payload = {}) {
    parent.postMessage({ source: SOURCE, type, payload }, window.location.origin);
}

function createRequestId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function safeJsonParse(text, fallback = {}) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return fallback;
    }
}

function trimPersistedContent(content) {
    const text = String(content || '');
    if (text.length <= MAX_PERSISTED_CONTENT_CHARS) return text;
    return `${text.slice(0, MAX_PERSISTED_CONTENT_CHARS)}\n\n[内容过长，已截断保存]`;
}

function serializeMessage(message) {
    return {
        role: message.role,
        content: trimPersistedContent(message.content),
        toolCallId: message.toolCallId || '',
        toolName: message.toolName || '',
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls.map((toolCall) => ({
                id: toolCall.id || '',
                name: toolCall.name || '',
                arguments: trimPersistedContent(toolCall.arguments || '{}'),
            }))
            : [],
    };
}

function normalizeRestoredMessage(message) {
    if (!message || typeof message !== 'object') return null;
    if (!['user', 'assistant', 'tool'].includes(message.role)) return null;
    return {
        role: message.role,
        content: String(message.content || ''),
        toolCallId: message.toolCallId ? String(message.toolCallId) : undefined,
        toolName: message.toolName ? String(message.toolName) : undefined,
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls
                .filter((toolCall) => toolCall && typeof toolCall === 'object' && toolCall.name)
                .map((toolCall) => ({
                    id: String(toolCall.id || createRequestId('tool')),
                    name: String(toolCall.name || ''),
                    arguments: String(toolCall.arguments || '{}'),
                }))
            : undefined,
    };
}

function persistSession() {
    try {
        if (!state.messages.length) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            messages: state.messages.slice(-MAX_PERSISTED_MESSAGES).map(serializeMessage),
        }));
    } catch {
        // Ignore localStorage failures.
    }
}

function restoreSession() {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        const parsed = safeJsonParse(raw, {});
        state.messages = Array.isArray(parsed.messages)
            ? parsed.messages.map(normalizeRestoredMessage).filter(Boolean)
            : [];
    } catch {
        state.messages = [];
    }
}

function showToast(text) {
    state.toast = String(text || '').trim();
    if (toastTimer) {
        clearTimeout(toastTimer);
    }
    if (!state.toast) {
        render();
        return;
    }
    const duration = Math.max(
        TOAST_DURATION_MIN_MS,
        Math.min(TOAST_DURATION_MAX_MS, TOAST_DURATION_MS + state.toast.length * 18),
    );
    toastTimer = setTimeout(() => {
        toastTimer = null;
        state.toast = '';
        render();
    }, duration);
    render();
}

function isAbortError(error) {
    const message = String(error?.message || error || '').toLowerCase();
    return error?.name === 'AbortError'
        || message === 'assistant_aborted'
        || message === 'tool_aborted'
        || message.includes('aborted');
}

function getProviderLabel(provider) {
    return PROVIDER_OPTIONS.find((item) => item.value === provider)?.label || provider;
}

function getPullState(provider) {
    return state.pullStateByProvider[provider] || { status: 'idle', message: '' };
}

function setPullState(provider, nextState) {
    state.pullStateByProvider = {
        ...state.pullStateByProvider,
        [provider]: nextState,
    };
}

function setProviderModels(provider, models) {
    state.modelOptionsByProvider = {
        ...state.modelOptionsByProvider,
        [provider]: Array.isArray(models) ? models : [],
    };
}

function getProviderModels(provider) {
    return Array.isArray(state.modelOptionsByProvider[provider]) ? state.modelOptionsByProvider[provider] : [];
}

function refillSelect(select, options, placeholderLabel = '') {
    select.replaceChildren();
    if (placeholderLabel) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderLabel;
        select.appendChild(placeholder);
    }
    options.forEach((option) => {
        const item = document.createElement('option');
        item.value = option.value;
        item.textContent = option.label;
        select.appendChild(item);
    });
}

function filterModels(models = []) {
    const normalized = [...new Set(models.filter(Boolean).map((model) => String(model).trim()).filter(Boolean))];
    const rule = MODEL_FILTERS.chat;
    const filtered = normalized.filter((modelId) => {
        const lower = modelId.toLowerCase();
        return !rule.exclude.some((keyword) => lower.includes(keyword));
    });
    return filtered.length ? filtered : normalized;
}

async function pullModelsForProvider(providerConfig) {
    const provider = providerConfig.provider;
    let baseUrl = String(providerConfig.baseUrl || '').trim();
    const apiKey = String(providerConfig.apiKey || '').trim();

    if (!apiKey) {
        throw new Error('请先填写 API Key。');
    }
    if (!baseUrl) {
        throw new Error('请先填写 Base URL。');
    }

    if (provider === 'google') {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/models?key=${encodeURIComponent(apiKey)}`, {
            headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`Google AI 拉取模型失败：${response.status}`);
        }
        const data = await response.json();
        return filterModels((data.models || [])
            .map((item) => String(item?.id || item?.name || '').split('/').pop() || '')
            .filter(Boolean));
    }

    if (provider === 'anthropic') {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/models`, {
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                Accept: 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Anthropic 拉取模型失败：${response.status}`);
        }
        const data = await response.json();
        return filterModels((data.data || []).map((item) => String(item?.id || '')).filter(Boolean));
    }

    if (baseUrl.endsWith('/v1')) {
        baseUrl = baseUrl.slice(0, -3);
    }

    const tryFetch = async (url) => {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
            },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return (data.data || []).map((item) => String(item?.id || '')).filter(Boolean);
    };

    let models = await tryFetch(`${baseUrl.replace(/\/$/, '')}/v1/models`);
    if (!models) {
        models = await tryFetch(`${baseUrl.replace(/\/$/, '')}/models`);
    }
    if (!models?.length) {
        throw new Error('未获取到模型列表。');
    }
    return filterModels(models);
}

function describeError(error) {
    const raw = String(error?.message || error || 'unknown_error');
    const lowered = raw.toLowerCase();

    if (isAbortError(error)) return '本轮请求已终止。';
    if (lowered === 'tool_timeout') return '工具调用超时了（180 秒），可以重试，或把问题收窄一点。';
    if (lowered.startsWith('workspace_write_failed:')) return '工作区写入失败，请检查酒馆文件权限或稍后重试。';
    if (lowered.startsWith('manifest_load_failed:')) return '助手索引文件清单加载失败，请刷新页面后再试。';
    if (lowered.startsWith('file_read_failed:')) return '读取源码文件失败了，请换个文件再试，或刷新页面重试。';
    if (lowered === 'file_not_indexed') return '这个文件不在当前助手索引范围里。';
    if (lowered === 'empty_query') return '搜索词是空的，换一个明确点的关键词就行。';
    if (lowered.includes('401') || lowered.includes('authentication')) return '认证失败了，请检查当前 Provider 的 API Key。';
    if (lowered.includes('403') || lowered.includes('permission')) return '请求被拒绝了，请检查 API Key 权限、模型权限或站点限制。';
    if (lowered.includes('429') || lowered.includes('rate limit')) return '请求太频繁了，接口触发了限流，请稍后再试。';
    if (lowered.includes('timeout') || lowered.includes('timed out')) return '请求超时了，请稍后再试。';
    if (lowered.includes('failed to fetch') || lowered.includes('network')) return '网络请求失败了，请检查 Base URL、代理或跨域设置。';
    return `请求失败：${raw}`;
}

function describeToolCall(name, args = {}) {
    switch (name) {
        case 'list_files':
            return `列出文件${args.query ? `（${args.query}）` : ''}`;
        case 'read_file':
            return `读取文件 ${args.path || ''}`.trim();
        case 'search_files':
            return `搜索关键词 ${args.query || ''}`.trim();
        case 'write_workspace_note':
            return `写入工作记录 ${args.name || ''}`.trim();
        default:
            return `调用工具 ${name}`;
    }
}

function formatToolResultDisplay(message) {
    const parsed = safeJsonParse(message.content, null);
    if (!parsed || typeof parsed !== 'object') {
        return {
            summary: message.content || '',
            details: '',
        };
    }

    if (message.toolName === 'list_files') {
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        const lines = [
            `找到 ${parsed.total || 0} 个候选文件，当前展示 ${items.length} 个。`,
        ];
        if (parsed.truncated) {
            lines.push('结果已截断，可以把关键词再收窄一点。');
        }
        if (items.length) {
            lines.push('');
            items.forEach((item) => {
                lines.push(`- ${item.publicPath}${item.source ? ` [${item.source}]` : ''}`);
            });
        }
        return {
            summary: lines.join('\n'),
            details: '',
        };
    }

    if (message.toolName === 'search_files') {
        const items = Array.isArray(parsed.items) ? parsed.items : [];
        const lines = [
            `关键词“${parsed.query || ''}”命中 ${parsed.total || 0} 个文件。`,
        ];
        if (parsed.truncated) {
            lines.push(`已达到返回上限；本次扫描 ${parsed.scannedFiles || 0}/${parsed.indexedFiles || 0} 个文件。`);
        }
        if (items.length) {
            lines.push('');
            items.forEach((item) => {
                lines.push(`- ${item.path}`);
            });
        }
        return {
            summary: lines.join('\n'),
            details: '',
        };
    }

    if (message.toolName === 'read_file') {
        return {
            summary: [
                `已读取文件：${parsed.path || ''}`,
                parsed.source ? `来源：${parsed.source}` : '',
                '文件内容已提供给助手分析，本轮不直接展开原文。',
            ].filter(Boolean).join('\n'),
            details: '',
        };
    }

    if (message.toolName === 'write_workspace_note') {
        return {
            summary: `工作记录已写入 ${parsed.name || ''}`.trim(),
            details: '',
        };
    }

    return {
        summary: JSON.stringify(parsed, null, 2),
        details: '',
    };
}

function pushMessage(message) {
    state.messages.push(message);
    persistSession();
}

function clearPendingToolCalls(runId, error) {
    for (const [requestId, entry] of pendingToolCalls.entries()) {
        if (entry.runId !== runId) continue;
        pendingToolCalls.delete(requestId);
        entry.cleanup?.();
        entry.reject(error);
    }
}

function cancelActiveRun(notice = '本轮请求已终止。') {
    const run = state.activeRun;
    if (!run) return;
    run.cancelNotice = notice;
    state.progressLabel = '正在终止…';
    clearPendingToolCalls(run.id, new Error('tool_aborted'));
    run.controller.abort();
    render();
}

function getActiveProviderConfig() {
    const config = state.config || {};
    const provider = config.provider || 'openai-compatible';
    const providerConfig = (config.modelConfigs || {})[provider] || {};
    return {
        provider,
        baseUrl: providerConfig.baseUrl || '',
        model: providerConfig.model || '',
        apiKey: providerConfig.apiKey || '',
        temperature: Number(providerConfig.temperature ?? 0.2),
        maxTokens: Number(providerConfig.maxTokens ?? 1600),
        timeoutMs: REQUEST_TIMEOUT_MS,
        toolMode: providerConfig.toolMode || 'native',
    };
}

function createAdapter() {
    const providerConfig = getActiveProviderConfig();
    if (!providerConfig.apiKey) {
        throw new Error('请先在小白助手里填写当前提供商的 API Key。');
    }

    switch (providerConfig.provider) {
        case 'openai-responses':
            return new OpenAIResponsesAdapter(providerConfig);
        case 'anthropic':
            return new AnthropicAdapter(providerConfig);
        case 'google':
            return new GoogleAdapter(providerConfig);
        case 'openai-compatible':
        default:
            return new OpenAICompatibleAdapter(providerConfig);
    }
}

function toProviderMessages() {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    for (const message of state.messages) {
        if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
            messages.push({
                role: 'assistant',
                content: message.content || '',
                tool_calls: message.toolCalls.map((toolCall) => ({
                    id: toolCall.id,
                    type: 'function',
                    function: {
                        name: toolCall.name,
                        arguments: toolCall.arguments,
                    },
                })),
            });
            continue;
        }

        if (message.role === 'tool') {
            messages.push({
                role: 'tool',
                tool_call_id: message.toolCallId,
                content: message.content,
            });
            continue;
        }

        messages.push({
            role: message.role,
            content: message.content,
        });
    }
    return messages;
}

function callHostTool(name, args, options = {}) {
    const requestId = createRequestId('tool');
    const run = state.activeRun;
    if (run && run.id === options.runId) {
        run.toolRequestIds.add(requestId);
    }
    return new Promise((resolve, reject) => {
        let settled = false;
        let timer = null;

        const cleanup = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            if (options.signal && abortHandler) {
                options.signal.removeEventListener('abort', abortHandler);
            }
            const activeRun = state.activeRun;
            if (activeRun && activeRun.id === options.runId) {
                activeRun.toolRequestIds.delete(requestId);
            }
        };

        const finishReject = (error) => {
            if (settled) return;
            settled = true;
            pendingToolCalls.delete(requestId);
            cleanup();
            reject(error);
        };

        const finishResolve = (value) => {
            if (settled) return;
            settled = true;
            pendingToolCalls.delete(requestId);
            cleanup();
            resolve(value);
        };

        const abortHandler = () => {
            post('xb-assistant:tool-abort', { requestId });
            finishReject(new Error('tool_aborted'));
        };

        timer = setTimeout(() => {
            post('xb-assistant:tool-abort', { requestId });
            finishReject(new Error('tool_timeout'));
        }, REQUEST_TIMEOUT_MS);

        pendingToolCalls.set(requestId, {
            runId: options.runId,
            cleanup,
            resolve: finishResolve,
            reject: finishReject,
        });

        if (options.signal) {
            if (options.signal.aborted) {
                abortHandler();
                return;
            }
            options.signal.addEventListener('abort', abortHandler, { once: true });
        }

        post('xb-assistant:tool-call', {
            requestId,
            name,
            arguments: args,
        });
    });
}

async function runAssistantLoop(run) {
    const adapter = createAdapter();
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
        if (run.controller.signal.aborted) {
            throw new Error('assistant_aborted');
        }

        rounds += 1;
        state.currentRound = rounds;
        state.progressLabel = `第 ${rounds}/${MAX_TOOL_ROUNDS} 轮：正在请求模型…`;
        render();

        const providerConfig = getActiveProviderConfig();
        const result = await adapter.chat({
            systemPrompt: SYSTEM_PROMPT,
            messages: toProviderMessages(),
            tools: TOOL_DEFINITIONS,
            toolChoice: 'auto',
            temperature: providerConfig.temperature,
            maxTokens: providerConfig.maxTokens,
            signal: run.controller.signal,
        });

        if (Array.isArray(result.toolCalls) && result.toolCalls.length) {
            pushMessage({
                role: 'assistant',
                content: result.text || '',
                toolCalls: result.toolCalls,
            });
            render();

            for (const toolCall of result.toolCalls) {
                if (run.controller.signal.aborted) {
                    throw new Error('assistant_aborted');
                }
                const parsedArguments = safeJsonParse(toolCall.arguments, {});
                state.progressLabel = `第 ${rounds}/${MAX_TOOL_ROUNDS} 轮：正在${describeToolCall(toolCall.name, parsedArguments)}…`;
                render();
                const toolResult = await callHostTool(toolCall.name, parsedArguments, {
                    runId: run.id,
                    signal: run.controller.signal,
                });
                pushMessage({
                    role: 'tool',
                    toolCallId: toolCall.id,
                    toolName: toolCall.name,
                    content: JSON.stringify(toolResult, null, 2),
                });
                render();
            }
            continue;
        }

        pushMessage({
            role: 'assistant',
            content: result.text || '没有拿到有效回复。',
        });
        state.progressLabel = '';
        render();
        return;
    }

    pushMessage({
        role: 'assistant',
        content: `这轮工具调用已经到上限了（${MAX_TOOL_ROUNDS}/${MAX_TOOL_ROUNDS}）。你可以把问题再收窄一点，比如直接给我模块名、设置项名或报错文本。`,
    });
    state.progressLabel = '';
    render();
}

function applyConfig(config) {
    state.config = config;
    render();
}

function collectProviderDraft(root, provider) {
    return {
        baseUrl: root.querySelector('#xb-assistant-base-url').value.trim(),
        model: root.querySelector('#xb-assistant-model').value.trim(),
        apiKey: root.querySelector('#xb-assistant-api-key').value.trim(),
        temperature: Number(((state.config?.modelConfigs || {})[provider] || {}).temperature ?? 0.2),
        maxTokens: Number(((state.config?.modelConfigs || {})[provider] || {}).maxTokens ?? 1600),
        toolMode: provider === 'openai-compatible'
            ? (root.querySelector('#xb-assistant-tool-mode')?.value || 'native')
            : undefined,
    };
}

function syncCurrentProviderDraft(root) {
    if (!state.config) return;
    const provider = root.querySelector('#xb-assistant-provider').value;
    state.config = {
        ...state.config,
        provider,
        workspaceFileName: root.querySelector('#xb-assistant-workspace').value.trim(),
        modelConfigs: {
            ...(state.config.modelConfigs || {}),
            [provider]: {
                ...((state.config.modelConfigs || {})[provider] || {}),
                ...collectProviderDraft(root, provider),
            },
        },
    };
}

function renderMessages(container) {
    container.innerHTML = '';

    if (!state.messages.length) {
        const empty = document.createElement('div');
        empty.className = 'xb-assistant-empty';
        empty.innerHTML = '<h2>开始提问吧</h2><p>你可以直接问我：某个设置为什么不生效、某个报错代表什么、某个功能从哪条代码链路走。</p><p>我会优先自己查 LittleWhiteBox 和 SillyTavern 的前端代码，再给你结论。</p><p>下面的示例问题点击后会填入输入框，不会自动发送。</p>';

        const examples = document.createElement('div');
        examples.className = 'xb-assistant-examples';
        EXAMPLE_PROMPTS.forEach((prompt) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'xb-assistant-example-chip';
            button.dataset.prompt = prompt;
            button.textContent = prompt;
            examples.appendChild(button);
        });
        empty.appendChild(examples);
        container.appendChild(empty);
        return;
    }

    for (const message of state.messages) {
        const bubble = document.createElement('div');
        bubble.className = `xb-assistant-bubble role-${message.role}`;

        const meta = document.createElement('div');
        meta.className = 'xb-assistant-meta';
        meta.textContent = message.role === 'user'
            ? '你'
            : message.role === 'assistant'
                ? Array.isArray(message.toolCalls) && message.toolCalls.length
                    ? `小白助手 · 已发起 ${message.toolCalls.length} 个工具调用`
                    : '小白助手'
                : `工具结果${message.toolName ? ` · ${message.toolName}` : ''}`;

        if (message.role === 'tool') {
            const display = formatToolResultDisplay(message);
            const summary = document.createElement('pre');
            summary.className = 'xb-assistant-content';
            summary.textContent = display.summary || '工具已返回结果。';
            bubble.append(meta, summary);

            if (display.details) {
                const details = document.createElement('details');
                details.className = 'xb-assistant-tool-details';
                const summaryEl = document.createElement('summary');
                summaryEl.textContent = message.toolName === 'read_file' ? '查看文件内容' : '查看详细结果';
                const detailPre = document.createElement('pre');
                detailPre.className = 'xb-assistant-content tool-detail';
                detailPre.textContent = display.details;
                details.append(summaryEl, detailPre);
                bubble.appendChild(details);
            }
        } else {
            const content = document.createElement('pre');
            content.className = 'xb-assistant-content';
            content.textContent = message.content || (message.role === 'assistant' ? '我先查一下相关代码。' : '');
            bubble.append(meta, content);
        }

        container.appendChild(bubble);
    }

    if (state.autoScroll) {
        container.scrollTop = container.scrollHeight;
    }
}

function buildAppMarkup(root) {
    root.innerHTML = `
        <div class="xb-assistant-shell">
            <aside class="xb-assistant-sidebar">
                <div class="xb-assistant-brand">
                    <div class="xb-assistant-badge">小白助手</div>
                    <h1>技术支持 Agent</h1>
                    <p>查代码、看设置、做排查记录。</p>
                </div>
                <section class="xb-assistant-config">
                    <label>
                        <span>Provider</span>
                        <select id="xb-assistant-provider">
                            <option value="openai-responses">OpenAI Responses</option>
                            <option value="openai-compatible">OpenAI-compatible</option>
                            <option value="anthropic">Anthropic</option>
                            <option value="google">Google AI</option>
                        </select>
                    </label>
                    <label>
                        <span>Base URL</span>
                        <input id="xb-assistant-base-url" type="text" />
                    </label>
                    <label>
                        <span>Model</span>
                        <input id="xb-assistant-model" type="text" />
                    </label>
                    <div class="xb-assistant-inline-input xb-assistant-model-row">
                        <label class="xb-assistant-grow">
                            <span>已拉取模型</span>
                            <select id="xb-assistant-model-pulled">
                                <option value="">手动填写</option>
                            </select>
                        </label>
                        <button id="xb-assistant-pull-models" type="button" class="secondary">拉取模型</button>
                    </div>
                    <label id="xb-assistant-tool-mode-wrap">
                        <span>Tool 调用格式</span>
                        <select id="xb-assistant-tool-mode"></select>
                    </label>
                    <label>
                        <span>API Key</span>
                        <div class="xb-assistant-inline-input">
                            <input id="xb-assistant-api-key" type="password" />
                            <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                        </div>
                    </label>
                    <label>
                        <span>Workspace 文件</span>
                        <input id="xb-assistant-workspace" type="text" />
                    </label>
                    <div class="xb-assistant-actions">
                        <button id="xb-assistant-save" type="button">保存配置</button>
                        <button id="xb-assistant-close" type="button" class="secondary">关闭</button>
                    </div>
                    <div class="xb-assistant-runtime" id="xb-assistant-runtime"></div>
                </section>
            </aside>
            <main class="xb-assistant-main">
                <section class="xb-assistant-toolbar">
                    <div class="xb-assistant-status" id="xb-assistant-status"></div>
                    <button id="xb-assistant-clear" type="button" class="secondary">清空对话</button>
                </section>
                <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                <form class="xb-assistant-compose" id="xb-assistant-form">
                    <textarea id="xb-assistant-input" placeholder="问我：某个设置为什么不生效、某个报错代表什么、某个功能从哪条代码链路走……"></textarea>
                    <button id="xb-assistant-send" type="submit">发送</button>
                </form>
                <div class="xb-assistant-toast" id="xb-assistant-toast" aria-live="polite"></div>
            </main>
        </div>
    `;
}

function syncConfigToForm(root) {
    if (!state.config) return;
    const provider = state.config.provider || 'openai-compatible';
    const providerConfig = (state.config.modelConfigs || {})[provider] || {};
    const pulledModels = getProviderModels(provider);
    const toolModeWrap = root.querySelector('#xb-assistant-tool-mode-wrap');
    const toolModeSelect = root.querySelector('#xb-assistant-tool-mode');
    const pulledSelect = root.querySelector('#xb-assistant-model-pulled');

    root.querySelector('#xb-assistant-provider').value = provider;
    root.querySelector('#xb-assistant-base-url').value = providerConfig.baseUrl || '';
    root.querySelector('#xb-assistant-model').value = providerConfig.model || '';
    root.querySelector('#xb-assistant-api-key').value = providerConfig.apiKey || '';
    root.querySelector('#xb-assistant-workspace').value = state.config.workspaceFileName || '';
    toolModeWrap.style.display = provider === 'openai-compatible' ? '' : 'none';
    refillSelect(toolModeSelect, TOOL_MODE_OPTIONS);
    toolModeSelect.value = providerConfig.toolMode || 'native';
    refillSelect(pulledSelect, pulledModels.map((model) => ({ value: model, label: model })), '手动填写');

    const runtimeEl = root.querySelector('#xb-assistant-runtime');
    const pullState = getPullState(provider);
    runtimeEl.textContent = state.runtime
        ? `${getProviderLabel(provider)} · 已索引 ${state.runtime.indexedFileCount || 0} 个前端源码文件${pullState.message ? ` · ${pullState.message}` : ''}`
        : (pullState.message || '');
}

function saveConfigFromForm(root) {
    syncCurrentProviderDraft(root);
    const provider = state.config?.provider || 'openai-compatible';
    post('xb-assistant:save-config', {
        provider,
        workspaceFileName: root.querySelector('#xb-assistant-workspace').value.trim(),
        modelConfigs: state.config?.modelConfigs || {},
    });
}

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :root { color-scheme: light; font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif; }
        body {
            margin: 0;
            background:
                radial-gradient(circle at top left, rgba(255, 223, 178, 0.72), transparent 34%),
                radial-gradient(circle at top right, rgba(154, 210, 255, 0.58), transparent 28%),
                linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%);
            color: #142033;
        }
        .xb-assistant-shell { display: grid; grid-template-columns: 340px minmax(0, 1fr); height: 100vh; }
        .xb-assistant-sidebar {
            padding: 24px 20px;
            background: rgba(255, 255, 255, 0.76);
            border-right: 1px solid rgba(20, 32, 51, 0.08);
            backdrop-filter: blur(14px);
            overflow: auto;
        }
        .xb-assistant-brand h1 { margin: 12px 0 8px; font-size: 30px; }
        .xb-assistant-brand p { margin: 0 0 18px; color: #4b5a70; line-height: 1.55; }
        .xb-assistant-badge {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 999px;
            background: #142033;
            color: #fff6e9;
            font-size: 13px;
            letter-spacing: 0.08em;
        }
        .xb-assistant-config { display: grid; gap: 12px; }
        .xb-assistant-config label { display: grid; gap: 6px; font-size: 13px; color: #41526a; }
        .xb-assistant-config input,
        .xb-assistant-config select,
        .xb-assistant-compose textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 14px;
            padding: 12px 14px;
            font: inherit;
            background: rgba(255, 255, 255, 0.9);
        }
        .xb-assistant-inline-input {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 8px;
            align-items: center;
        }
        .xb-assistant-grow { min-width: 0; }
        .xb-assistant-model-row { align-items: end; }
        .xb-assistant-actions,
        .xb-assistant-toolbar {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: space-between;
        }
        .xb-assistant-actions button,
        .xb-assistant-toolbar button,
        .xb-assistant-compose button {
            border: none;
            border-radius: 14px;
            padding: 12px 16px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-actions button.secondary,
        .xb-assistant-toolbar button.secondary {
            background: #dbe3ee;
            color: #1b3758;
        }
        .xb-assistant-actions button.ghost,
        .xb-assistant-toolbar button.ghost,
        .xb-assistant-inline-input button.ghost {
            padding-inline: 14px;
            background: rgba(219, 227, 238, 0.82);
            color: #1b3758;
        }
        .xb-assistant-runtime { font-size: 12px; color: #5a6a81; min-height: 18px; }
        .xb-assistant-main {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto auto;
            padding: 20px;
            gap: 16px;
            min-width: 0;
        }
        .xb-assistant-status {
            min-height: 20px;
            padding: 8px 12px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.78);
            color: #41526a;
            font-size: 13px;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.06);
        }
        .xb-assistant-status.busy::before {
            content: '';
            display: inline-block;
            width: 8px;
            height: 8px;
            margin-right: 8px;
            border-radius: 999px;
            background: #c96b33;
            box-shadow: 0 0 0 rgba(201, 107, 51, 0.35);
            animation: xb-assistant-pulse 1.2s ease infinite;
            vertical-align: middle;
        }
        .xb-assistant-chat { overflow: auto; padding: 4px; display: grid; gap: 12px; }
        .xb-assistant-empty {
            align-self: center;
            justify-self: center;
            max-width: 720px;
            padding: 24px 28px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.82);
            box-shadow: 0 18px 48px rgba(17, 31, 51, 0.08);
        }
        .xb-assistant-empty h2 { margin: 0 0 10px; font-size: 24px; }
        .xb-assistant-empty p { margin: 0; color: #4b5a70; line-height: 1.7; }
        .xb-assistant-empty p + p { margin-top: 8px; }
        .xb-assistant-examples {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 16px;
        }
        .xb-assistant-example-chip {
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 999px;
            padding: 10px 14px;
            background: rgba(244, 248, 252, 0.96);
            color: #1b3758;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-bubble {
            max-width: min(860px, 100%);
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 12px 30px rgba(17, 31, 51, 0.07);
        }
        .xb-assistant-bubble.role-user {
            justify-self: end;
            background: linear-gradient(135deg, #1b3758 0%, #285786 100%);
            color: white;
        }
        .xb-assistant-bubble.role-assistant { background: rgba(255, 255, 255, 0.9); }
        .xb-assistant-bubble.role-tool {
            background: rgba(244, 248, 252, 0.95);
            border: 1px dashed rgba(27, 55, 88, 0.18);
        }
        .xb-assistant-meta { margin-bottom: 6px; font-size: 12px; opacity: 0.78; }
        .xb-assistant-content { margin: 0; white-space: pre-wrap; word-break: break-word; font: inherit; }
        .xb-assistant-tool-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-tool-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
        }
        .xb-assistant-content.tool-detail {
            margin-top: 10px;
            max-height: 360px;
            overflow: auto;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 12px;
            padding: 12px;
        }
        .xb-assistant-compose {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            gap: 12px;
            align-items: end;
            background: rgba(255, 255, 255, 0.78);
            border-radius: 22px;
            padding: 14px;
            box-shadow: 0 16px 40px rgba(17, 31, 51, 0.08);
        }
        .xb-assistant-compose textarea { min-height: 92px; resize: vertical; }
        .xb-assistant-compose button.is-busy { background: #8d442b; }
        .xb-assistant-toast {
            min-height: 24px;
            color: #1b3758;
            font-size: 13px;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .xb-assistant-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        @keyframes xb-assistant-pulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0.35); }
            70% { box-shadow: 0 0 0 8px rgba(201, 107, 51, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0); }
        }
        @media (max-width: 900px) {
            .xb-assistant-shell { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); }
            .xb-assistant-sidebar { border-right: none; border-bottom: 1px solid rgba(20, 32, 51, 0.08); }
            .xb-assistant-main { padding: 14px; }
            .xb-assistant-compose { grid-template-columns: 1fr; }
            .xb-assistant-toolbar { flex-direction: column; align-items: stretch; }
            .xb-assistant-inline-input { grid-template-columns: 1fr; }
        }
    `;
    document.head.appendChild(style);
}

function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    if (!root.firstChild) {
        buildAppMarkup(root);
        bindEvents(root);
    }

    syncConfigToForm(root);
    const chat = root.querySelector('#xb-assistant-chat');
    renderMessages(chat);

    const sendButton = root.querySelector('#xb-assistant-send');
    sendButton.disabled = false;
    sendButton.classList.toggle('is-busy', state.isBusy);
    sendButton.textContent = state.isBusy
        ? `终止 (${Math.max(1, state.currentRound)}/${MAX_TOOL_ROUNDS})`
        : '发送';

    const clearButton = root.querySelector('#xb-assistant-clear');
    clearButton.disabled = state.isBusy || !state.messages.length;

    const pullButton = root.querySelector('#xb-assistant-pull-models');
    pullButton.disabled = state.isBusy;

    const status = root.querySelector('#xb-assistant-status');
    status.textContent = state.progressLabel || '就绪';
    status.classList.toggle('busy', state.isBusy);

    const toast = root.querySelector('#xb-assistant-toast');
    toast.textContent = state.toast || '';
    toast.classList.toggle('visible', !!state.toast);

    const toggleKey = root.querySelector('#xb-assistant-toggle-key');
    const apiKeyInput = root.querySelector('#xb-assistant-api-key');
    toggleKey.textContent = apiKeyInput.type === 'password' ? '显示' : '隐藏';
}

function bindEvents(root) {
    const input = root.querySelector('#xb-assistant-input');
    const resizeComposer = () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(Math.max(input.scrollHeight, 92), 240)}px`;
    };

    root.querySelector('#xb-assistant-chat').addEventListener('scroll', (event) => {
        const container = event.currentTarget;
        const threshold = 48;
        state.autoScroll = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
    });

    root.querySelector('#xb-assistant-chat').addEventListener('click', (event) => {
        const chip = event.target.closest('.xb-assistant-example-chip');
        if (!chip) return;
        input.value = chip.dataset.prompt || '';
        resizeComposer();
        input.focus();
    });

    root.querySelector('#xb-assistant-provider').addEventListener('change', () => {
        syncCurrentProviderDraft(root);
        state.config = {
            ...(state.config || {}),
            provider: root.querySelector('#xb-assistant-provider').value,
        };
        render();
    });

    root.querySelector('#xb-assistant-model-pulled').addEventListener('change', (event) => {
        const value = event.currentTarget.value;
        if (!value) return;
        root.querySelector('#xb-assistant-model').value = value;
    });

    root.querySelector('#xb-assistant-toggle-key').addEventListener('click', () => {
        const keyInput = root.querySelector('#xb-assistant-api-key');
        keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
        render();
    });

    root.querySelector('#xb-assistant-pull-models').addEventListener('click', async () => {
        syncCurrentProviderDraft(root);
        const providerConfig = getActiveProviderConfig();
        setPullState(providerConfig.provider, { status: 'loading', message: '正在拉取模型列表…' });
        render();
        try {
            const models = await pullModelsForProvider(providerConfig);
            setProviderModels(providerConfig.provider, models);
            setPullState(providerConfig.provider, {
                status: 'success',
                message: `已拉取 ${models.length} 个模型`,
            });
        } catch (error) {
            setProviderModels(providerConfig.provider, []);
            setPullState(providerConfig.provider, {
                status: 'error',
                message: describeError(error),
            });
        }
        render();
    });

    root.querySelector('#xb-assistant-save').addEventListener('click', () => {
        saveConfigFromForm(root);
    });

    root.querySelector('#xb-assistant-clear').addEventListener('click', () => {
        if (state.isBusy) return;
        state.messages = [];
        persistSession();
        showToast('对话已清空');
        render();
    });

    root.querySelector('#xb-assistant-close').addEventListener('click', () => {
        if (state.isBusy) {
            cancelActiveRun('');
        }
        post('xb-assistant:close');
    });

    root.querySelector('#xb-assistant-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        if (state.isBusy) {
            cancelActiveRun('本轮请求已终止。');
            return;
        }
        const value = input.value.trim();
        if (!value) return;

        syncCurrentProviderDraft(root);
        pushMessage({ role: 'user', content: value });
        input.value = '';
        resizeComposer();

        const run = {
            id: createRequestId('run'),
            controller: new AbortController(),
            toolRequestIds: new Set(),
            cancelNotice: '',
        };

        state.activeRun = run;
        state.isBusy = true;
        state.currentRound = 0;
        state.progressLabel = '正在请求模型…';
        state.autoScroll = true;
        render();

        try {
            await runAssistantLoop(run);
        } catch (error) {
            if (isAbortError(error)) {
                if (run.cancelNotice) {
                    pushMessage({
                        role: 'assistant',
                        content: run.cancelNotice,
                    });
                }
            } else {
                pushMessage({
                    role: 'assistant',
                    content: describeError(error),
                });
            }
        } finally {
            if (state.activeRun?.id === run.id) {
                state.activeRun = null;
            }
            state.isBusy = false;
            state.currentRound = 0;
            state.progressLabel = '';
            render();
        }
    });

    input.addEventListener('input', resizeComposer);
    resizeComposer();
}

// Guarded by origin/source checks below.
// eslint-disable-next-line no-restricted-syntax
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== parent) {
        return;
    }
    const data = event.data || {};
    if (data.type === 'xb-assistant:config') {
        state.runtime = data.payload?.runtime || null;
        applyConfig(data.payload?.config || {});
        return;
    }

    if (data.type === 'xb-assistant:config-saved') {
        applyConfig(data.payload?.config || {});
        showToast('配置已保存');
        return;
    }

    if (data.type === 'xb-assistant:tool-result') {
        const entry = pendingToolCalls.get(data.payload?.requestId || '');
        if (!entry) return;
        entry.resolve(data.payload.result);
        return;
    }

    if (data.type === 'xb-assistant:tool-error') {
        const entry = pendingToolCalls.get(data.payload?.requestId || '');
        if (!entry) return;
        entry.reject(new Error(data.payload.error || 'tool_failed'));
    }
});

restoreSession();
injectStyles();
render();
post('xb-assistant:ready');
