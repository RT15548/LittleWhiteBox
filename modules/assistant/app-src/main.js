import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import { buildCorsProxyUrl } from './adapters/cors-proxy.js';
import {
    TOOL_DEFINITIONS,
    TOOL_NAMES,
    TOOL_USAGE_GUIDANCE,
    describeToolCall,
    formatToolResultDisplay,
} from './tooling.js';
import { countTokens } from 'gpt-tokenizer/model/gpt-4o';

const SOURCE = 'xb-assistant-app';
const ROOT_ID = 'xb-assistant-root';
const REQUEST_TIMEOUT_MS = 180000;
const MAX_TOOL_ROUNDS = 64;
const MAX_CONTEXT_TOKENS = 128000;
const SUMMARY_TRIGGER_TOKENS = 98000;
const DEFAULT_PRESERVED_TURNS = 2;
const MIN_PRESERVED_TURNS = 1;
const SESSION_STORAGE_KEY = 'littlewhitebox.assistant.session.v2';
const MAX_PERSISTED_MESSAGES = 60;
const MAX_PERSISTED_CONTENT_CHARS = 16000;
const MAX_IMAGE_ATTACHMENTS = 3;
const MAX_IMAGE_FILE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const TOAST_DURATION_MS = 2600;
const TOAST_DURATION_MIN_MS = 1800;
const TOAST_DURATION_MAX_MS = 4200;
const TOOL_MODE_OPTIONS = [
    { value: 'native', label: '原生 Tool Calling' },
    { value: 'tagged-json', label: 'Tagged JSON 兼容模式' },
];
const REASONING_EFFORT_OPTIONS = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
];
const PROVIDER_OPTIONS = [
    { value: 'openai-responses', label: 'OpenAI Responses' },
    { value: 'openai-compatible', label: 'OpenAI-Compatible' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
];
const DEFAULT_PRESET_NAME = '默认';
const DEFAULT_MODEL_CONFIGS = {
    'openai-responses': {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4.1-mini',
        apiKey: '',
        temperature: 0.2,
        useCorsProxy: false,
    },
    'openai-compatible': {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
        apiKey: '',
        temperature: 0.2,
        toolMode: 'native',
        useCorsProxy: false,
    },
    anthropic: {
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-sonnet-4-0',
        apiKey: '',
        temperature: 0.2,
        useCorsProxy: false,
    },
    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        model: 'gemini-2.5-pro',
        apiKey: '',
        temperature: 0.2,
        useCorsProxy: false,
    },
};
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
const PROJECT_STRUCTURE_HINT = [
    '项目结构提示：',
    '你当前运行在 SillyTavern 的 LittleWhiteBox 插件里；LittleWhiteBox 位于 public/scripts/extensions/third-party/LittleWhiteBox/。',
    '你的可读范围是已索引公开前端文件，重点包括 LittleWhiteBox 自身，以及 SillyTavern 的 public/scripts/*；不要假装自己能看到后端、数据库、账号密码或未索引文件。',
    '你用读文件工具时，路径要写成站点根相对公开路径，例如 scripts/extensions/third-party/LittleWhiteBox/index.js，而不是磁盘绝对路径。',
    '如果你需要快速建立 SillyTavern 和 LittleWhiteBox 的目录心智、模块分层和常见入口，请优先读取：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/project-structure.md 。',
    '如果用户问 STscript 或 SillyTavern 前端 API，可以优先查看这两份参考资料：scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/stscript-language-reference.md 与 scripts/extensions/third-party/LittleWhiteBox/modules/assistant/references/sillytavern-javascript-api-reference.md 。',
].join('\n');
const SYSTEM_PROMPT = [
    '你是“小白助手”，是 SillyTavern 中 LittleWhiteBox（中文一般称“小白X”）插件的内置技术支持助手，当前正在这个界面中为用户提供帮助。',
    '',
    '你的职责是：',
    '- 解答 LittleWhiteBox 和 SillyTavern 前端代码、设置、模块行为和报错问题。',
    '- 当问题涉及具体实现、文件路径、设置逻辑或错误原因时，优先使用工具查证后再回答。',
    '',
    '你的能力范围：',
    '- 默认只读代码与资料；如果需要写入，只能写固定工作记录，不允许改代码。',
    '- 可读取已索引的公开前端文件（LittleWhiteBox 和 SillyTavern public/scripts/*）。',
    '- 可读写工作记录（user/files/LittleWhiteBox_Assistant_Worklog.md），需要写入时直接调用写入工具，文件不存在就创建，用它保存长期排查结论和用户指定要你记住的事情。',
    '- 不能访问后端、数据库、未索引文件。',
    '',
    PROJECT_STRUCTURE_HINT,
    '',
    ...TOOL_USAGE_GUIDANCE,
    '',
    '回答要求：',
    '- 具体、可核对，热情主动，必要时引用文件路径。',
].join('\n');
const HISTORY_SUMMARY_PREFIX = '[历史摘要]';
const SUMMARY_SYSTEM_PROMPT = [
    '你要把一段较早的技术支持对话压缩成后续可继续接话的历史摘要。',
    '只保留真正对后续排查有帮助的信息，不要寒暄，不要复述大段源码，不要保留大段 JSON。',
    '必须覆盖这些点：当前目标/问题、已确认结论、未解决点、关键文件路径、关键设置/API/报错文本、用户明确偏好或限制。',
    '如果某项信息不存在，就不要编造。',
    '尽量紧凑清晰，适合直接作为后续上下文继续使用。',
].join('\n');

const state = {
    config: null,
    runtime: null,
    messages: [],
    historySummary: '',
    archivedTurnCount: 0,
    contextStats: {
        usedTokens: 0,
        budgetTokens: MAX_CONTEXT_TOKENS,
        summaryActive: false,
    },
    isBusy: false,
    currentRound: 0,
    progressLabel: '',
    activeRun: null,
    autoScroll: true,
    toast: '',
    modelOptionsByProvider: {},
    pullStateByProvider: {},
    draftAttachments: [],
    sidebarCollapsed: true,
};

const pendingToolCalls = new Map();
let toastTimer = null;
let lastRenderedMessageCount = 0;

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

function normalizeReasoningEffort(value) {
    return REASONING_EFFORT_OPTIONS.some((item) => item.value === value) ? value : 'medium';
}

function cloneDefaultModelConfigs() {
    return JSON.parse(JSON.stringify(DEFAULT_MODEL_CONFIGS));
}

function normalizePresetName(value) {
    const normalized = String(value || '').trim();
    return normalized || DEFAULT_PRESET_NAME;
}

function normalizeModelConfigs(modelConfigs = {}) {
    const next = cloneDefaultModelConfigs();
    Object.keys(DEFAULT_MODEL_CONFIGS).forEach((provider) => {
        next[provider] = {
            ...DEFAULT_MODEL_CONFIGS[provider],
            ...((modelConfigs && typeof modelConfigs[provider] === 'object') ? modelConfigs[provider] : {}),
        };
    });
    return next;
}

function buildDefaultPreset() {
    return {
        provider: 'openai-compatible',
        modelConfigs: cloneDefaultModelConfigs(),
    };
}

function normalizeAssistantConfig(config = {}) {
    const presetsInput = (config && typeof config.presets === 'object' && config.presets)
        ? config.presets
        : (config?.modelConfigs
            ? {
                [normalizePresetName(config.currentPresetName || config.presetDraftName || DEFAULT_PRESET_NAME)]: {
                    provider: config.provider || 'openai-compatible',
                    modelConfigs: config.modelConfigs,
                },
            }
            : {});

    const presets = {};
    Object.entries(presetsInput).forEach(([rawName, rawPreset]) => {
        if (!rawPreset || typeof rawPreset !== 'object') return;
        const name = normalizePresetName(rawName);
        presets[name] = {
            provider: typeof rawPreset.provider === 'string' && rawPreset.provider.trim()
                ? rawPreset.provider
                : 'openai-compatible',
            modelConfigs: normalizeModelConfigs(rawPreset.modelConfigs || {}),
        };
    });

    if (!Object.keys(presets).length) {
        presets[DEFAULT_PRESET_NAME] = buildDefaultPreset();
    }

    const currentPresetName = presets[normalizePresetName(config.currentPresetName)]
        ? normalizePresetName(config.currentPresetName)
        : Object.keys(presets)[0];
    const currentPreset = presets[currentPresetName] || buildDefaultPreset();

    return {
        workspaceFileName: String(config.workspaceFileName || ''),
        currentPresetName,
        presetDraftName: normalizePresetName(config.presetDraftName || currentPresetName),
        presetNames: Object.keys(presets),
        presets,
        provider: currentPreset.provider,
        modelConfigs: currentPreset.modelConfigs,
    };
}

function normalizeThoughtBlocks(thoughts) {
    if (!Array.isArray(thoughts)) return [];
    return thoughts
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const text = String(item.text || '').trim();
            if (!text) return null;
            return {
                label: String(item.label || '思考块').trim() || '思考块',
                text,
            };
        })
        .filter(Boolean);
}

function normalizeAttachments(attachments) {
    if (!Array.isArray(attachments)) return [];
    return attachments
        .map((item) => {
            if (!item || typeof item !== 'object') return null;
            if (item.kind !== 'image') return null;
            const type = String(item.type || '').trim().toLowerCase();
            const dataUrl = typeof item.dataUrl === 'string' ? item.dataUrl.trim() : '';
            const hasPayload = dataUrl.startsWith('data:image/');
            if (type && !ACCEPTED_IMAGE_MIME_TYPES.includes(type)) return null;
            return {
                kind: 'image',
                name: String(item.name || 'image').trim() || 'image',
                type: type || 'image/png',
                dataUrl: hasPayload ? dataUrl : '',
                size: Math.max(0, Number(item.size) || 0),
            };
        })
        .filter(Boolean);
}

function buildAttachmentSummary(attachments) {
    const normalized = normalizeAttachments(attachments);
    if (!normalized.length) return '';
    const names = normalized.map((item) => item.name).join('、');
    return `[附图 ${normalized.length} 张：${names}]`;
}

function buildTextWithAttachmentSummary(text, attachments) {
    const summary = buildAttachmentSummary(attachments);
    const content = String(text || '').trim();
    if (!summary) return content;
    return [content, summary].filter(Boolean).join('\n');
}

function buildUserContentParts(message = {}) {
    const attachments = normalizeAttachments(message.attachments).filter((item) => item.dataUrl);
    const parts = [];
    if (message.content?.trim()) {
        parts.push({ type: 'text', text: message.content.trim() });
    }
    attachments.forEach((attachment) => {
        parts.push({
            type: 'image_url',
            image_url: { url: attachment.dataUrl },
            mimeType: attachment.type,
            name: attachment.name,
        });
    });
    return parts.length ? parts : [{ type: 'text', text: '' }];
}

function createImageAttachmentFromFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error(`读取图片失败：${file.name || '未命名图片'}`));
        reader.onload = () => {
            resolve({
                kind: 'image',
                name: getImageAttachmentName(file),
                type: file.type || 'image/png',
                size: Number(file.size) || 0,
                dataUrl: typeof reader.result === 'string' ? reader.result : '',
            });
        };
        reader.readAsDataURL(file);
    });
}

function getImageAttachmentName(file) {
    const name = typeof file?.name === 'string' ? file.name.trim() : '';
    if (name) return name;
    const ext = getImageExtensionFromMime(file?.type);
    return `clipboard-image-${Date.now()}.${ext}`;
}

function getImageExtensionFromMime(mimeType) {
    switch (String(mimeType || '').toLowerCase()) {
        case 'image/jpeg':
            return 'jpg';
        case 'image/webp':
            return 'webp';
        case 'image/gif':
            return 'gif';
        case 'image/png':
        default:
            return 'png';
    }
}

function validateImageFiles(files) {
    const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
    const remainingSlots = Math.max(0, MAX_IMAGE_ATTACHMENTS - state.draftAttachments.length);
    if (!remainingSlots) {
        return {
            validFiles: [],
            rejectedReason: `最多只能附 ${MAX_IMAGE_ATTACHMENTS} 张图片`,
            reachedLimit: true,
            hadOverflow: false,
        };
    }

    const acceptedFiles = normalizedFiles.slice(0, remainingSlots);
    const validFiles = [];
    let rejectedReason = '';

    acceptedFiles.forEach((file) => {
        if (!ACCEPTED_IMAGE_MIME_TYPES.includes(file.type)) {
            rejectedReason = '只支持 PNG、JPG、WEBP、GIF 图片';
            return;
        }
        if ((Number(file.size) || 0) > MAX_IMAGE_FILE_BYTES) {
            rejectedReason = `单张图片不能超过 ${Math.round(MAX_IMAGE_FILE_BYTES / (1024 * 1024))}MB`;
            return;
        }
        validFiles.push(file);
    });

    return {
        validFiles,
        rejectedReason,
        reachedLimit: false,
        hadOverflow: normalizedFiles.length > remainingSlots,
    };
}

async function appendDraftImageFiles(files) {
    const normalizedFiles = Array.isArray(files) ? files.filter(Boolean) : [];
    if (!normalizedFiles.length) return false;

    const { validFiles, rejectedReason, reachedLimit, hadOverflow } = validateImageFiles(normalizedFiles);
    if (!validFiles.length) {
        showToast(rejectedReason || '没有可添加的图片');
        return reachedLimit || Boolean(rejectedReason);
    }

    try {
        const attachments = await Promise.all(validFiles.map((file) => createImageAttachmentFromFile(file)));
        state.draftAttachments = [...state.draftAttachments, ...attachments].slice(0, MAX_IMAGE_ATTACHMENTS);
        render();
        if (rejectedReason || hadOverflow) {
            showToast(rejectedReason || `最多只能附 ${MAX_IMAGE_ATTACHMENTS} 张图片`);
        }
        return true;
    } catch (error) {
        showToast(String(error?.message || '读取图片失败'));
        return true;
    }
}

function serializeMessage(message) {
    return {
        role: message.role,
        content: trimPersistedContent(message.content),
        attachments: normalizeAttachments(message.attachments).map((attachment) => ({
            kind: attachment.kind,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
        })),
        toolCallId: message.toolCallId || '',
        toolName: message.toolName || '',
        toolCalls: Array.isArray(message.toolCalls)
            ? message.toolCalls.map((toolCall) => ({
                id: toolCall.id || '',
                name: toolCall.name || '',
                arguments: trimPersistedContent(toolCall.arguments || '{}'),
            }))
            : [],
        thoughts: normalizeThoughtBlocks(message.thoughts).map((item) => ({
            label: item.label,
            text: trimPersistedContent(item.text),
        })),
    };
}

function normalizeRestoredMessage(message) {
    if (!message || typeof message !== 'object') return null;
    if (!['user', 'assistant', 'tool'].includes(message.role)) return null;
    return {
        role: message.role,
        content: String(message.content || ''),
        attachments: normalizeAttachments(message.attachments),
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
        thoughts: normalizeThoughtBlocks(message.thoughts),
    };
}

function persistSession() {
    try {
        const activeMessages = getActiveContextMessages().slice(-MAX_PERSISTED_MESSAGES);
        const summary = trimPersistedContent(state.historySummary || '');
        if (!activeMessages.length && !summary) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return;
        }
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
            messages: activeMessages.map(serializeMessage),
            historySummary: summary,
            sidebarCollapsed: state.sidebarCollapsed,
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
        state.historySummary = String(parsed.historySummary || '');
        state.archivedTurnCount = 0;
        state.sidebarCollapsed = parsed.sidebarCollapsed !== undefined ? !!parsed.sidebarCollapsed : true;
    } catch {
        state.messages = [];
        state.historySummary = '';
        state.archivedTurnCount = 0;
        state.sidebarCollapsed = true;
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

function normalizeBaseUrl(rawBaseUrl) {
    return String(rawBaseUrl || '').trim().replace(/\/+$/, '');
}

function uniqueUrls(urls = []) {
    return [...new Set(urls.filter(Boolean).map((url) => String(url).trim()).filter(Boolean))];
}

function buildOpenAICandidateUrls(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    if (normalized.endsWith('/v1')) {
        const root = normalized.slice(0, -3);
        return uniqueUrls([
            `${normalized}/models`,
            `${root}/v1/models`,
            `${root}/models`,
        ]);
    }
    return uniqueUrls([
        `${normalized}/v1/models`,
        `${normalized}/models`,
    ]);
}

function buildAnthropicCandidateUrls(baseUrl) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    if (normalized.endsWith('/v1')) {
        const root = normalized.slice(0, -3);
        return uniqueUrls([
            `${normalized}/models`,
            `${root}/v1/models`,
            `${root}/models`,
        ]);
    }
    return uniqueUrls([
        `${normalized}/v1/models`,
        `${normalized}/models`,
    ]);
}

function buildGoogleCandidateUrls(baseUrl, apiKey) {
    const normalized = normalizeBaseUrl(baseUrl);
    if (!normalized) return [];
    const root = normalized.endsWith('/v1beta') ? normalized.slice(0, -7) : normalized;
    return uniqueUrls([
        `${normalized}/models?key=${encodeURIComponent(apiKey)}`,
        `${normalized}/models`,
        `${root}/v1beta/models?key=${encodeURIComponent(apiKey)}`,
        `${root}/v1beta/models`,
        `${root}/models?key=${encodeURIComponent(apiKey)}`,
        `${root}/models`,
    ]);
}

function extractErrorSnippet(payload, rawText) {
    const candidates = [
        payload?.error?.message,
        payload?.message,
        payload?.detail,
        payload?.details,
        payload?.error,
    ];
    const found = candidates.find((item) => typeof item === 'string' && item.trim());
    if (found) return found.trim();
    return String(rawText || '').trim().slice(0, 160);
}

async function fetchJsonWithDiagnostics(url, options = {}) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    let data = null;
    let parseError = null;

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (error) {
        parseError = error;
    }

    return {
        ok: response.ok,
        status: response.status,
        url,
        data,
        rawText,
        parseError,
        errorSnippet: extractErrorSnippet(data, rawText),
    };
}

function extractOpenAIModels(data) {
    return filterModels((data?.data || []).map((item) => String(item?.id || '').trim()).filter(Boolean));
}

function extractAnthropicModels(data) {
    return filterModels((data?.data || []).map((item) => String(item?.id || '').trim()).filter(Boolean));
}

function extractGoogleModels(data) {
    return filterModels(
        ((data?.models || data?.data || []).map((item) => String(item?.id || item?.name || '')))
            .map((item) => item.split('/').pop() || '')
            .filter(Boolean),
    );
}

async function tryCandidateFetches({ urls, requestOptionsList, extractModels, providerLabel }) {
    let lastFailure = null;

    for (const url of urls) {
        for (const requestOptions of requestOptionsList) {
            const result = await fetchJsonWithDiagnostics(url, requestOptions);
            if (!result.ok) {
                lastFailure = result;
                continue;
            }
            if (result.parseError) {
                lastFailure = {
                    ...result,
                    errorSnippet: '返回的不是 JSON',
                };
                continue;
            }
            const models = extractModels(result.data);
            if (models.length) {
                return models;
            }
            lastFailure = {
                ...result,
                errorSnippet: '返回成功，但模型列表为空',
            };
        }
    }

    if (lastFailure) {
        const suffix = lastFailure.url ? ` (${lastFailure.url})` : '';
        const detail = lastFailure.errorSnippet ? `：${lastFailure.errorSnippet}` : '';
        throw new Error(`${providerLabel} 拉取模型失败：${lastFailure.status || 'unknown'}${detail}${suffix}`);
    }

    throw new Error(`${providerLabel} 拉取模型失败：未获取到模型列表。`);
}

async function pullModelsForProvider(providerConfig) {
    const provider = providerConfig.provider;
    const baseUrl = normalizeBaseUrl(providerConfig.baseUrl || '');
    const apiKey = String(providerConfig.apiKey || '').trim();
    const useCorsProxy = Boolean(providerConfig.useCorsProxy);

    if (!apiKey) {
        throw new Error('请先填写 API Key。');
    }
    if (!baseUrl) {
        throw new Error('请先填写 Base URL。');
    }

    if (provider === 'google') {
        return await tryCandidateFetches({
            urls: buildGoogleCandidateUrls(baseUrl, apiKey).map((url) => useCorsProxy ? buildCorsProxyUrl(url) : url),
            requestOptionsList: [
                {
                    headers: {
                        Accept: 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                },
                {
                    headers: {
                        Accept: 'application/json',
                    },
                },
            ],
            extractModels: extractGoogleModels,
            providerLabel: 'Google AI',
        });
    }

    if (provider === 'anthropic') {
        return await tryCandidateFetches({
            urls: buildAnthropicCandidateUrls(baseUrl).map((url) => useCorsProxy ? buildCorsProxyUrl(url) : url),
            requestOptionsList: [{
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    Accept: 'application/json',
                },
            }],
            extractModels: extractAnthropicModels,
            providerLabel: 'Anthropic',
        });
    }

    return await tryCandidateFetches({
        urls: buildOpenAICandidateUrls(baseUrl).map((url) => useCorsProxy ? buildCorsProxyUrl(url) : url),
        requestOptionsList: [{
            headers: {
                Authorization: `Bearer ${apiKey}`,
                Accept: 'application/json',
            },
        }],
        extractModels: extractOpenAIModels,
        providerLabel: provider === 'openai-responses' ? 'OpenAI Responses' : 'OpenAI-Compatible',
    });
}

function describeError(error) {
    const raw = String(error?.message || error || 'unknown_error');
    const lowered = raw.toLowerCase();

    if (error?.rawDisplay) return String(error.rawDisplay);
    if (isAbortError(error)) return '本轮请求已终止。';
    if (lowered === 'tool_timeout') return '工具调用超时了（180 秒），可以重试，或把问题收窄一点。';
    if (lowered.startsWith('workspace_write_failed:')) return '工作区写入失败，请检查酒馆文件权限或稍后重试。';
    if (lowered.startsWith('manifest_load_failed:')) return '助手索引文件清单加载失败，请刷新页面后再试。';
    if (lowered.startsWith('file_read_failed:')) return '读取源码文件失败了，请换个文件再试，或刷新页面重试。';
    if (lowered === 'file_not_indexed') return '这个文件不在当前助手索引范围里。';
    if (lowered === 'directory_path_required') return '还没有提供要查看的目录路径。';
    if (lowered === 'glob_pattern_required') return '还没有提供 glob 路径模式。';
    if (lowered === 'empty_query') return '搜索词是空的，换一个明确点的关键词就行。';
    if (lowered.includes('cors proxy is disabled')) return '酒馆的 CORS 代理还没开启。请到酒馆目录的 config.yaml 把 enableCorsProxy 改成 true，保存后重启酒馆进程或容器，不是 F5 刷新。';
    return raw;
}

function escapeHtml(text) {
    return String(text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderMarkdown(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';

    try {
        const showdownLib = globalThis.parent?.showdown || globalThis.showdown;
        const DOMPurifyLib = globalThis.parent?.DOMPurify || globalThis.DOMPurify;
        if (showdownLib?.Converter && DOMPurifyLib?.sanitize) {
            const converter = new showdownLib.Converter({
                simpleLineBreaks: true,
                strikethrough: true,
                tables: true,
                tasklists: true,
                ghCodeBlocks: true,
                simplifiedAutoLink: true,
                openLinksInNewWindow: true,
                emoji: false,
            });
            const html = converter.makeHtml(raw);
            return DOMPurifyLib.sanitize(html, {
                USE_PROFILES: { html: true },
                FORBID_TAGS: ['style', 'script'],
            });
        }
    } catch {
        // Fall back to escaped plain text below.
    }

    return escapeHtml(raw).replace(/\n/g, '<br>');
}

function buildSanitizedHtmlFragment(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
    const fragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach((node) => {
        fragment.appendChild(document.importNode(node, true));
    });
    return fragment;
}

function renderAttachmentGallery(container, attachments = [], options = {}) {
    const items = normalizeAttachments(attachments);
    container.replaceChildren();
    container.style.display = items.length ? '' : 'none';
    if (!items.length) return;

    items.forEach((attachment, index) => {
        const card = document.createElement('div');
        card.className = options.compact ? 'xb-assistant-attachment-card compact' : 'xb-assistant-attachment-card';

        if (attachment.dataUrl) {
            const image = document.createElement('img');
            image.className = 'xb-assistant-attachment-image';
            image.src = attachment.dataUrl;
            image.alt = attachment.name;
            card.appendChild(image);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'xb-assistant-attachment-placeholder';
            placeholder.textContent = '图片';
            card.appendChild(placeholder);
        }

        const meta = document.createElement('div');
        meta.className = 'xb-assistant-attachment-name';
        meta.textContent = attachment.name;
        card.appendChild(meta);

        if (typeof options.onRemove === 'function') {
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'xb-assistant-attachment-remove';
            removeButton.textContent = '×';
            removeButton.title = '移除图片';
            removeButton.addEventListener('click', () => options.onRemove(index));
            card.appendChild(removeButton);
        }

        container.appendChild(card);
    });
}

function resetCompactionState() {
    state.historySummary = '';
    state.archivedTurnCount = 0;
    state.contextStats = {
        usedTokens: 0,
        budgetTokens: MAX_CONTEXT_TOKENS,
        summaryActive: false,
    };
}

function buildHistorySummarySystemMessage() {
    if (!state.historySummary?.trim()) return null;
    return {
        role: 'system',
        content: `${HISTORY_SUMMARY_PREFIX}\n${state.historySummary.trim()}`,
    };
}

function buildRepeatedToolErrorSystemMessage() {
    const hint = state.activeRun?.lightBrakeMessage;
    if (!hint) return null;
    return {
        role: 'system',
        content: hint,
    };
}

function formatContextCount(tokens) {
    return `${Math.max(0, Math.round((Number(tokens) || 0) / 1000))}k`;
}

function buildContextMeterLabel(stats = state.contextStats) {
    return `${formatContextCount(stats.usedTokens)}/${formatContextCount(stats.budgetTokens)}`;
}

function trimForSummary(text, limit = 1800) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= limit) return normalized;
    return `${normalized.slice(0, limit)}…`;
}

function getMessageTextForSummary(message) {
    if (message.role === 'tool') {
        return trimForSummary(formatToolResultDisplay(message).summary || message.content || '', 1400);
    }
    if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
        const toolLines = message.toolCalls.map((toolCall) => `工具: ${toolCall.name} ${toolCall.arguments || '{}'}`.trim());
        return trimForSummary([message.content || '', ...toolLines].filter(Boolean).join('\n'), 1600);
    }
    return trimForSummary(buildTextWithAttachmentSummary(message.content || '', message.attachments), 1600);
}

function splitMessagesIntoTurns(messages = state.messages) {
    const turns = [];
    let currentTurn = [];

    (messages || []).forEach((message) => {
        if (message.role === 'user' && currentTurn.length) {
            turns.push(currentTurn);
            currentTurn = [message];
            return;
        }
        currentTurn.push(message);
    });

    if (currentTurn.length) {
        turns.push(currentTurn);
    }

    return turns.filter((turn) => turn.length);
}

function buildSummarySource(turns, existingSummary = '') {
    const lines = [];
    if (existingSummary?.trim()) {
        lines.push('已有历史摘要:');
        lines.push(existingSummary.trim());
        lines.push('');
    }

    turns.forEach((turn, index) => {
        lines.push(`第 ${index + 1} 段历史:`);
        turn.forEach((message) => {
            const roleLabel = message.role === 'user'
                ? '用户'
                : message.role === 'assistant'
                    ? '助手'
                    : `工具${message.toolName ? `(${message.toolName})` : ''}`;
            lines.push(`${roleLabel}: ${getMessageTextForSummary(message) || '[空]'}`);
        });
        lines.push('');
    });

    return lines.join('\n').trim();
}

function buildFallbackSummary(turns, existingSummary = '') {
    const sections = [];
    if (existingSummary?.trim()) {
        sections.push(existingSummary.trim());
    }

    turns.forEach((turn, index) => {
        const condensed = turn.map((message) => {
            const prefix = message.role === 'user'
                ? '用户'
                : message.role === 'assistant'
                    ? '助手'
                    : `工具${message.toolName ? `(${message.toolName})` : ''}`;
            return `${prefix}: ${getMessageTextForSummary(message) || '[空]'}`;
        }).join('\n');
        sections.push(`补充历史 ${index + 1}:\n${condensed}`);
    });

    return trimForSummary(sections.join('\n\n'), 6000);
}

function buildTokenCounterMessages(messages = []) {
    return messages.map((message) => {
        const contentText = Array.isArray(message.content)
            ? message.content.map((part) => {
                if (!part || typeof part !== 'object') return '';
                if (part.type === 'text') return part.text || '';
                if (part.type === 'image_url') return `[image:${part.name || part.mimeType || 'image'}]`;
                return '';
            }).filter(Boolean).join('\n')
            : (message.content || '');

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            const toolCalls = message.tool_calls.map((toolCall) => JSON.stringify({
                id: toolCall.id,
                name: toolCall.function?.name || '',
                arguments: toolCall.function?.arguments || '{}',
            })).join('\n');
            return {
                role: 'assistant',
                content: [contentText, toolCalls].filter(Boolean).join('\n'),
            };
        }

        if (message.role === 'tool') {
            return {
                role: 'tool',
                content: [message.tool_call_id || '', message.content || ''].filter(Boolean).join('\n'),
            };
        }

        return {
            role: message.role,
            content: contentText,
        };
    });
}

function countConversationTokens({ messages = [], tools = [] } = {}) {
    const payload = [
        ...buildTokenCounterMessages(messages),
        {
            role: 'system',
            content: tools.length ? `TOOLS\n${JSON.stringify(tools)}` : '',
        },
    ].filter((message) => message.content);

    try {
        return countTokens(payload);
    } catch {
        return countTokens(JSON.stringify(payload));
    }
}

function updateContextStats(messages = [], tools = TOOL_DEFINITIONS) {
    state.contextStats = {
        usedTokens: countConversationTokens({ messages, tools }),
        budgetTokens: MAX_CONTEXT_TOKENS,
        summaryActive: !!state.historySummary,
    };
}

function pushMessage(message) {
    state.messages.push({
        ...message,
        attachments: normalizeAttachments(message.attachments),
        thoughts: normalizeThoughtBlocks(message.thoughts),
    });
    state.autoScroll = true;
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
        maxTokens: null,
        timeoutMs: REQUEST_TIMEOUT_MS,
        toolMode: providerConfig.toolMode || 'native',
        useCorsProxy: Boolean(providerConfig.useCorsProxy),
        reasoningEnabled: Boolean(providerConfig.reasoningEnabled),
        reasoningEffort: normalizeReasoningEffort(providerConfig.reasoningEffort),
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

function toProviderMessages(baseMessages = state.messages) {
    const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
    const summaryMessage = buildHistorySummarySystemMessage();
    const lightBrakeMessage = buildRepeatedToolErrorSystemMessage();
    if (summaryMessage) messages.push(summaryMessage);
    if (lightBrakeMessage) messages.push(lightBrakeMessage);
    for (const message of baseMessages) {
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
            content: message.role === 'user'
                ? buildUserContentParts(message)
                : message.content,
        });
    }
    return messages;
}

function getActiveContextMessages() {
    const turns = splitMessagesIntoTurns();
    const archivedCount = Math.min(state.archivedTurnCount, turns.length);
    return turns.slice(archivedCount).flat();
}

function buildToolFailureResult(toolName, args, error) {
    const raw = String(error?.message || error || 'tool_failed');
    const [code] = raw.split(':');
    const result = {
        ok: false,
        toolName,
        path: typeof args?.path === 'string' ? args.path : '',
        error: code || 'tool_failed',
        raw,
        message: describeError(error),
    };

    return result;
}

function recordToolErrorForLightBrake(run, toolName, errorCode) {
    if (!run || !toolName || !errorCode) return;
    const nextKey = `${toolName}::${errorCode}`;
    if (run.toolErrorStreakKey === nextKey) {
        run.toolErrorStreakCount += 1;
    } else {
        run.toolErrorStreakKey = nextKey;
        run.toolErrorStreakCount = 1;
    }

    if (run.toolErrorStreakCount >= 3 && run.lastLightBrakeKey !== nextKey) {
        run.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${toolName}\` 都返回了同一个错误：\`${errorCode}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`;
        run.lastLightBrakeKey = nextKey;
    }
}

function resetToolErrorLightBrake(run) {
    if (!run) return;
    run.toolErrorStreakKey = '';
    run.toolErrorStreakCount = 0;
}

async function summarizeArchivedTurns(adapter, turnsToArchive, signal) {
    if (!turnsToArchive.length) return;

    const summarySource = buildSummarySource(turnsToArchive, state.historySummary);
    const fallbackSummary = buildFallbackSummary(turnsToArchive, state.historySummary);
    const providerConfig = getActiveProviderConfig();

    try {
        const result = await adapter.chat({
            systemPrompt: SUMMARY_SYSTEM_PROMPT,
            messages: [{ role: 'user', content: summarySource }],
            tools: [],
            toolChoice: 'none',
            temperature: Math.min(providerConfig.temperature ?? 0.2, 0.2),
            maxTokens: null,
            signal,
        });
        state.historySummary = String(result.text || '').trim() || fallbackSummary;
    } catch {
        state.historySummary = fallbackSummary;
    }
}

async function ensureContextBudget(adapter, signal) {
    const turns = splitMessagesIntoTurns();
    const preservedOptions = [DEFAULT_PRESERVED_TURNS, MIN_PRESERVED_TURNS];
    let contextMessages = getActiveContextMessages();
    let providerMessages = toProviderMessages(contextMessages);
    updateContextStats(providerMessages);

    if (state.contextStats.usedTokens <= SUMMARY_TRIGGER_TOKENS) {
        return providerMessages;
    }

    for (const preservedTurns of preservedOptions) {
        const desiredArchivedTurnCount = Math.max(
            state.archivedTurnCount,
            turns.length - Math.min(preservedTurns, turns.length),
        );
        if (desiredArchivedTurnCount > state.archivedTurnCount) {
            const turnsToArchive = turns.slice(state.archivedTurnCount, desiredArchivedTurnCount);
            await summarizeArchivedTurns(adapter, turnsToArchive, signal);
            state.archivedTurnCount = desiredArchivedTurnCount;
            persistSession();
        }

        contextMessages = getActiveContextMessages();
        providerMessages = toProviderMessages(contextMessages);
        updateContextStats(providerMessages);
        if (state.contextStats.usedTokens <= SUMMARY_TRIGGER_TOKENS) {
            showToast(`已压缩较早历史，当前上下文 ${buildContextMeterLabel()}`);
            render();
            return providerMessages;
        }
    }

    showToast(`最近对话本身已接近上限，当前上下文 ${buildContextMeterLabel()}`);
    render();
    return providerMessages;
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
        state.progressLabel = '正在请求模型…';
        render();

        const providerConfig = getActiveProviderConfig();
        const requestMessages = await ensureContextBudget(adapter, run.controller.signal);
        const result = await adapter.chat({
            systemPrompt: SYSTEM_PROMPT,
            messages: requestMessages,
            tools: TOOL_DEFINITIONS,
            toolChoice: 'auto',
            temperature: providerConfig.temperature,
            maxTokens: providerConfig.maxTokens,
            reasoning: {
                enabled: providerConfig.reasoningEnabled,
                effort: providerConfig.reasoningEffort,
            },
            signal: run.controller.signal,
        });

        if (Array.isArray(result.toolCalls) && result.toolCalls.length) {
            pushMessage({
                role: 'assistant',
                content: result.text || '',
                toolCalls: result.toolCalls,
                thoughts: result.thoughts,
            });
            render();

            for (const toolCall of result.toolCalls) {
                if (run.controller.signal.aborted) {
                    throw new Error('assistant_aborted');
                }
                const parsedArguments = safeJsonParse(toolCall.arguments, {});
                state.progressLabel = `正在${describeToolCall(toolCall.name, parsedArguments)}…`;
                render();
                let toolResult = null;
                try {
                    toolResult = await callHostTool(toolCall.name, parsedArguments, {
                        runId: run.id,
                        signal: run.controller.signal,
                    });
                    resetToolErrorLightBrake(run);
                } catch (error) {
                    if (isAbortError(error)) {
                        throw error;
                    }
                    toolResult = buildToolFailureResult(toolCall.name, parsedArguments, error);
                    recordToolErrorForLightBrake(run, toolCall.name, toolResult.error);
                }
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
            thoughts: result.thoughts,
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
    state.config = normalizeAssistantConfig(config || {});
    render();
}

function collectProviderDraft(root, provider) {
    return {
        baseUrl: root.querySelector('#xb-assistant-base-url').value.trim(),
        model: root.querySelector('#xb-assistant-model').value.trim(),
        apiKey: root.querySelector('#xb-assistant-api-key').value.trim(),
        temperature: Number(((state.config?.modelConfigs || {})[provider] || {}).temperature ?? 0.2),
        useCorsProxy: root.querySelector('#xb-assistant-use-cors-proxy')?.checked || false,
        reasoningEnabled: root.querySelector('#xb-assistant-reasoning-enabled')?.checked || false,
        reasoningEffort: normalizeReasoningEffort(root.querySelector('#xb-assistant-reasoning-effort')?.value),
        toolMode: provider === 'openai-compatible'
            ? (root.querySelector('#xb-assistant-tool-mode')?.value || 'native')
            : undefined,
    };
}

function syncPresetDraftName(root) {
    if (!state.config) return;
    state.config.presetDraftName = normalizePresetName(root.querySelector('#xb-assistant-preset-name')?.value);
}

function syncCurrentProviderDraft(root) {
    if (!state.config) return;
    syncPresetDraftName(root);
    const provider = root.querySelector('#xb-assistant-provider').value;
    const currentPresetName = normalizePresetName(state.config.currentPresetName);
    state.config = {
        ...normalizeAssistantConfig({
            ...state.config,
            currentPresetName,
            presetDraftName: state.config.presetDraftName,
            presets: {
                ...(state.config.presets || {}),
                [currentPresetName]: {
                    ...((state.config.presets || {})[currentPresetName] || buildDefaultPreset()),
                    provider,
                    modelConfigs: {
                        ...(((state.config.presets || {})[currentPresetName] || {}).modelConfigs || cloneDefaultModelConfigs()),
                        [provider]: {
                            ...((((state.config.presets || {})[currentPresetName] || {}).modelConfigs || cloneDefaultModelConfigs())[provider] || {}),
                            ...collectProviderDraft(root, provider),
                        },
                    },
                },
            },
        }),
        provider,
    };
}

function renderMessages(container) {
    // 增量渲染优化：只渲染新增或变化的消息
    const existingBubbles = Array.from(container.querySelectorAll('.xb-assistant-bubble'));

    if (!state.messages.length) {
        container.innerHTML = '';
        const empty = document.createElement('div');
        empty.className = 'xb-assistant-empty';
        empty.innerHTML = '<h2>开始提问吧</h2><p>我就是 LittleWhiteBox 里的“小白助手”。如果你问“小白助手按钮在哪”“这个助手从哪打开”，默认就是在问我自己和我的入口。</p><p>我当前能读取的源码范围是 <code>SillyTavern/public/scripts/*</code>，包括 LittleWhiteBox 插件前端和酒馆前端脚本；读文件时使用的是站点根相对路径，例如 <code>scripts/extensions/third-party/LittleWhiteBox/index.js</code>。</p><p>你可以直接问我按钮在哪、某个开关在哪、设置为什么不生效、某个前端报错是从哪条链路抛出的、插件和酒馆前端是怎么交互的。</p><p>我不会读取不在这块前端目录里的内容，例如后端实现、数据库、酒馆保存 API Key 的位置等不在当前可读范围内的东西。</p><p>如果你让我写工作记录，我现在只会通过写入工具写到酒馆官方 <code>user/files/LittleWhiteBox_Assistant_Worklog.md</code>，不会改源码。</p><p>下面的示例问题点击后会填入输入框，不会自动发送。</p>';

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

    // 移除空状态提示（如果存在）
    const emptyEl = container.querySelector('.xb-assistant-empty');
    if (emptyEl) {
        emptyEl.remove();
    }

    // 增量渲染：只添加新消息
    const existingCount = existingBubbles.length;
    const messagesToRender = state.messages.slice(existingCount);

    for (const message of messagesToRender) {
        const bubble = document.createElement('div');
        bubble.className = `xb-assistant-bubble role-${message.role}`;

        const meta = document.createElement('div');
        meta.className = 'xb-assistant-meta';
        meta.textContent = message.role === 'user'
            ? '你'
            : message.role === 'assistant'
                ? Array.isArray(message.toolCalls) && message.toolCalls.length
                    ? `小白助手 · 已发起 ${message.toolCalls.length} 个工具调用${Array.isArray(message.thoughts) && message.thoughts.length ? ` · 含 ${message.thoughts.length} 段思考` : ''}`
                    : `小白助手${Array.isArray(message.thoughts) && message.thoughts.length ? ` · 含 ${message.thoughts.length} 段思考` : ''}`
                : `工具结果${message.toolName ? ` · ${message.toolName}` : ''}`;

        if (message.role === 'tool') {
            const display = formatToolResultDisplay(message);
            const summary = document.createElement('pre');
            summary.className = 'xb-assistant-content tool-summary';
            summary.textContent = display.summary || '工具已返回结果。';
            bubble.append(meta, summary);

            if (display.details) {
                const details = document.createElement('details');
                details.className = 'xb-assistant-tool-details';
                const summaryEl = document.createElement('summary');
                summaryEl.textContent = message.toolName === TOOL_NAMES.READ ? '展开文件内容' : '展开详细结果';
                const detailPre = document.createElement('pre');
                detailPre.className = 'xb-assistant-content tool-detail';
                detailPre.textContent = display.details;
                details.append(summaryEl, detailPre);
                bubble.appendChild(details);
            }
        } else {
            const content = document.createElement('div');
            content.className = 'xb-assistant-content xb-assistant-markdown';
            content.appendChild(
                buildSanitizedHtmlFragment(
                    renderMarkdown(message.content || (message.role === 'assistant' ? '我先查一下相关代码。' : '')),
                ),
            );
            bubble.append(meta, content);

            if (Array.isArray(message.attachments) && message.attachments.length) {
                const gallery = document.createElement('div');
                gallery.className = 'xb-assistant-attachment-gallery';
                renderAttachmentGallery(gallery, message.attachments, { compact: true });
                bubble.appendChild(gallery);
            }

            if (message.role === 'assistant' && Array.isArray(message.thoughts) && message.thoughts.length) {
                const details = document.createElement('details');
                details.className = 'xb-assistant-thought-details';
                const summaryEl = document.createElement('summary');
                summaryEl.textContent = message.thoughts.length > 1
                    ? `展开思考块（${message.thoughts.length} 段）`
                    : '展开思考块';
                details.appendChild(summaryEl);

                message.thoughts.forEach((item) => {
                    const block = document.createElement('div');
                    block.className = 'xb-assistant-thought-block';

                    const label = document.createElement('div');
                    label.className = 'xb-assistant-thought-label';
                    label.textContent = item.label;

                    const pre = document.createElement('pre');
                    pre.className = 'xb-assistant-content xb-assistant-thought-content';
                    pre.textContent = item.text;

                    block.append(label, pre);
                    details.appendChild(block);
                });

                bubble.appendChild(details);
            }
        }

        container.appendChild(bubble);
    }

    if (state.autoScroll) {
        container.scrollTop = container.scrollHeight;
    }
}

function scrollChatToBottom(container) {
    if (!container) return;
    const apply = () => {
        container.scrollTop = container.scrollHeight;
    };
    apply();
    requestAnimationFrame(() => {
        apply();
        requestAnimationFrame(apply);
    });
}

function buildAppMarkup(root) {
    const markup = `
        <div class="xb-assistant-shell ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}">
            <aside class="xb-assistant-sidebar ${state.sidebarCollapsed ? 'is-collapsed' : ''}">
                <div class="xb-assistant-sidebar-header">
                    <div class="xb-assistant-badge">API配置</div>
                    <button id="xb-assistant-sidebar-toggle" type="button" class="xb-assistant-sidebar-toggle" aria-expanded="${state.sidebarCollapsed ? 'false' : 'true'}" aria-label="${state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置'}" title="${state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置'}">
                        <span class="xb-assistant-sidebar-toggle-text"></span>
                        <span class="xb-assistant-sidebar-toggle-icon"></span>
                    </button>
                </div>
                <div class="xb-assistant-sidebar-content" ${state.sidebarCollapsed ? 'hidden' : ''}>
                    <div class="xb-assistant-brand">
                    </div>
                    <section class="xb-assistant-config">
                    <label>
                        <span>已存预设</span>
                        <select id="xb-assistant-preset-select"></select>
                    </label>
                    <label>
                        <span>预设名称</span>
                        <input id="xb-assistant-preset-name" type="text" placeholder="例如：OpenAI 测试号" />
                    </label>
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
                        <span>API Key</span>
                        <div class="xb-assistant-inline-input">
                            <input id="xb-assistant-api-key" type="password" />
                            <button id="xb-assistant-toggle-key" type="button" class="secondary ghost">显示</button>
                        </div>
                    </label>
                    <label class="xb-assistant-checkbox-row">
                        <span>开启 CORS 代理</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-use-cors-proxy" type="checkbox" />
                            <span>开启</span>
                        </span>
                    </label>
                    <div class="xb-assistant-help" id="xb-assistant-cors-proxy-help">
                        如果你的代理没有返回浏览器可用的 CORS 允许头，再勾选这一项。还需要打开酒馆目录的 <code>config.yaml</code>，将 <code>enableCorsProxy</code> 改为 <code>true</code> 并保存，然后重启酒馆（重启容器或进程，不是 F5 刷新）。
                    </div>
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
                    <label class="xb-assistant-checkbox-row">
                        <span>思考模式</span>
                        <span class="xb-assistant-checkbox-control">
                            <input id="xb-assistant-reasoning-enabled" type="checkbox" />
                            <span>开启</span>
                        </span>
                    </label>
                    <label id="xb-assistant-reasoning-effort-wrap">
                        <span>思考强度</span>
                        <select id="xb-assistant-reasoning-effort"></select>
                    </label>
                    <div class="xb-assistant-actions">
                        <button id="xb-assistant-save" type="button">保存配置</button>
                        <button id="xb-assistant-delete-preset" type="button" class="secondary">删除配置</button>
                    </div>
                    <div class="xb-assistant-runtime" id="xb-assistant-runtime"></div>
                    <div class="xb-assistant-toast xb-assistant-toast-inline" id="xb-assistant-toast" aria-live="polite"></div>
                    </section>
                </div>
            </aside>
            <main class="xb-assistant-main">
                <section class="xb-assistant-toolbar">
                    <div class="xb-assistant-toolbar-cluster">
                        <div class="xb-assistant-status" id="xb-assistant-status"></div>
                        <div class="xb-assistant-context-meter" id="xb-assistant-context-meter" title="当前实际送模上下文 / 最大上下文"></div>
                        <button id="xb-assistant-clear" type="button" class="secondary ghost">清空对话</button>
                    </div>
                </section>
                <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                <form class="xb-assistant-compose" id="xb-assistant-form">
                    <div class="xb-assistant-compose-main">
                        <textarea id="xb-assistant-input" placeholder=""></textarea>
                        <input id="xb-assistant-image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden />
                        <div class="xb-assistant-attachment-gallery xb-assistant-draft-gallery" id="xb-assistant-draft-gallery" style="display:none;"></div>
                    </div>
                    <div class="xb-assistant-compose-actions">
                        <button id="xb-assistant-add-image" type="button" class="secondary ghost">发图</button>
                        <button id="xb-assistant-send" type="submit">发送</button>
                    </div>
                </form>
            </main>
        </div>
    `;
    root.replaceChildren(buildSanitizedHtmlFragment(markup));
}

function syncConfigToForm(root) {
    if (!state.config) return;
    const provider = state.config.provider || 'openai-compatible';
    const providerConfig = (state.config.modelConfigs || {})[provider] || {};
    const pulledModels = getProviderModels(provider);
    const toolModeWrap = root.querySelector('#xb-assistant-tool-mode-wrap');
    const toolModeSelect = root.querySelector('#xb-assistant-tool-mode');
    const reasoningEnabledInput = root.querySelector('#xb-assistant-reasoning-enabled');
    const reasoningEffortWrap = root.querySelector('#xb-assistant-reasoning-effort-wrap');
    const reasoningEffortSelect = root.querySelector('#xb-assistant-reasoning-effort');
    const corsProxyInput = root.querySelector('#xb-assistant-use-cors-proxy');
    const corsProxyHelp = root.querySelector('#xb-assistant-cors-proxy-help');
    const pulledSelect = root.querySelector('#xb-assistant-model-pulled');
    const presetSelect = root.querySelector('#xb-assistant-preset-select');
    const presetNameInput = root.querySelector('#xb-assistant-preset-name');

    refillSelect(
        presetSelect,
        (state.config.presetNames || []).map((name) => ({ value: name, label: name })),
    );
    presetSelect.value = state.config.currentPresetName || DEFAULT_PRESET_NAME;
    presetNameInput.value = state.config.presetDraftName || state.config.currentPresetName || DEFAULT_PRESET_NAME;
    root.querySelector('#xb-assistant-provider').value = provider;
    root.querySelector('#xb-assistant-base-url').value = providerConfig.baseUrl || '';
    root.querySelector('#xb-assistant-model').value = providerConfig.model || '';
    root.querySelector('#xb-assistant-api-key').value = providerConfig.apiKey || '';
    corsProxyInput.checked = Boolean(providerConfig.useCorsProxy);
    corsProxyHelp.style.display = corsProxyInput.checked ? '' : 'none';
    toolModeWrap.style.display = provider === 'openai-compatible' ? '' : 'none';
    refillSelect(toolModeSelect, TOOL_MODE_OPTIONS);
    toolModeSelect.value = providerConfig.toolMode || 'native';
    refillSelect(reasoningEffortSelect, REASONING_EFFORT_OPTIONS);
    reasoningEnabledInput.checked = Boolean(providerConfig.reasoningEnabled);
    reasoningEffortSelect.value = normalizeReasoningEffort(providerConfig.reasoningEffort);
    reasoningEffortWrap.style.display = reasoningEnabledInput.checked ? '' : 'none';
    refillSelect(pulledSelect, pulledModels.map((model) => ({ value: model, label: model })), '手动填写');

    const runtimeEl = root.querySelector('#xb-assistant-runtime');
    const pullState = getPullState(provider);
    runtimeEl.textContent = state.runtime
        ? `预设「${state.config.currentPresetName || DEFAULT_PRESET_NAME}」 · ${getProviderLabel(provider)} · 已索引 ${state.runtime.indexedFileCount || 0} 个前端源码文件${pullState.message ? ` · ${pullState.message}` : ''}`
        : (pullState.message || '');
}

function saveConfigFromForm(root) {
    syncCurrentProviderDraft(root);
    const nextPresetName = normalizePresetName(root.querySelector('#xb-assistant-preset-name')?.value);
    const currentPresetName = normalizePresetName(state.config?.currentPresetName || DEFAULT_PRESET_NAME);
    const existingPreset = (state.config?.presets || {})[nextPresetName];
    if (nextPresetName !== currentPresetName && existingPreset) {
        showToast(`预设「${nextPresetName}」已存在，请从下拉切换到它；如果要新建，请换个名字。`);
        render();
        return;
    }
    const currentPreset = (state.config?.presets || {})[currentPresetName] || buildDefaultPreset();
    const nextPresets = {
        ...(state.config?.presets || {}),
        [nextPresetName]: currentPreset,
    };
    state.config = normalizeAssistantConfig({
        ...state.config,
        currentPresetName: nextPresetName,
        presetDraftName: nextPresetName,
        presets: nextPresets,
    });
    post('xb-assistant:save-config', {
        workspaceFileName: state.config?.workspaceFileName || '',
        currentPresetName: state.config?.currentPresetName || DEFAULT_PRESET_NAME,
        presets: state.config?.presets || {},
    });
}

function deleteCurrentPreset(root) {
    syncCurrentProviderDraft(root);
    const presetNames = Object.keys(state.config?.presets || {});
    if (presetNames.length <= 1) {
        showToast('至少要保留一套预设');
        return;
    }

    const currentPresetName = normalizePresetName(state.config?.currentPresetName || DEFAULT_PRESET_NAME);
    const nextPresets = { ...(state.config?.presets || {}) };
    delete nextPresets[currentPresetName];
    const nextPresetName = Object.keys(nextPresets)[0] || DEFAULT_PRESET_NAME;

    state.config = normalizeAssistantConfig({
        ...state.config,
        currentPresetName: nextPresetName,
        presetDraftName: nextPresetName,
        presets: nextPresets,
    });

    post('xb-assistant:save-config', {
        workspaceFileName: state.config?.workspaceFileName || '',
        currentPresetName: state.config?.currentPresetName || DEFAULT_PRESET_NAME,
        presets: state.config?.presets || {},
    });

    render();
}

function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        :root { color-scheme: light; font-family: "Noto Sans SC", "Microsoft YaHei", sans-serif; }
        html, body { height: 100%; width: 100%; overflow: hidden; }
        body {
            margin: 0;
            background:
                radial-gradient(circle at top left, rgba(255, 223, 178, 0.72), transparent 34%),
                radial-gradient(circle at top right, rgba(154, 210, 255, 0.58), transparent 28%),
                linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%);
            color: #142033;
            overflow-x: hidden;
        }
        #${ROOT_ID} { width: 100%; height: 100%; overflow: hidden; }
        .xb-assistant-shell {
            display: grid;
            grid-template-columns: 340px minmax(0, 1fr);
            height: 100%;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            transition: grid-template-columns 0.22s ease;
        }
        .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 56px minmax(0, 1fr); }
        .xb-assistant-sidebar {
            position: relative;
            display: grid;
            grid-template-rows: auto minmax(0, 1fr);
            padding: 24px 20px;
            background: rgba(255, 255, 255, 0.82);
            border-right: 1px solid rgba(20, 32, 51, 0.08);
            backdrop-filter: blur(14px);
            overflow: hidden;
            transition: padding 0.22s ease;
        }
        .xb-assistant-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }
        .xb-assistant-sidebar.is-collapsed {
            padding: 14px 10px;
            overflow: hidden;
        }
        .xb-assistant-sidebar-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 36px;
            padding: 0 10px;
            border: none;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.88);
            color: #fff6e9;
            cursor: pointer;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.12);
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }
        .xb-assistant-sidebar-toggle:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(17, 31, 51, 0.16);
        }
        .xb-assistant-sidebar-toggle-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
        }
        .xb-assistant-sidebar-toggle-text {
            display: none;
            font-size: 13px;
            font-weight: 600;
            line-height: 1;
        }
        .xb-assistant-sidebar-content {
            display: grid;
            gap: 16px;
            margin-top: 16px;
            min-width: 0;
            min-height: 0;
            overflow: auto;
            opacity: 1;
            transition: opacity 0.18s ease;
        }
        .xb-assistant-sidebar-content[hidden] {
            display: none !important;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-content {
            opacity: 0;
            pointer-events: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-brand,
        .xb-assistant-sidebar.is-collapsed .xb-assistant-config {
            display: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-badge {
            display: none;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-header {
            justify-content: center;
        }
        .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-toggle {
            width: 36px;
            min-width: 36px;
            height: 36px;
            padding: 0;
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
        .xb-assistant-checkbox-row {
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
        }
        .xb-assistant-checkbox-control {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            color: #1b3758;
            font-size: 14px;
        }
        .xb-assistant-help {
            margin-top: -2px;
            padding: 10px 12px;
            border-radius: 14px;
            background: rgba(27, 55, 88, 0.05);
            color: #52637a;
            font-size: 12px;
            line-height: 1.65;
        }
        .xb-assistant-help code {
            padding: 0.08em 0.34em;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
        }
        .xb-assistant-checkbox-control input {
            width: 16px;
            height: 16px;
            accent-color: #1b3758;
        }
        .xb-assistant-actions,
        .xb-assistant-toolbar {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: flex-start;
        }
        .xb-assistant-actions {
            gap: 8px;
            flex-wrap: wrap;
        }
        .xb-assistant-toolbar-cluster {
            display: inline-flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
        }
        .xb-assistant-actions button,
        .xb-assistant-toolbar button,
        .xb-assistant-compose button {
            border: none;
            border-radius: 999px;
            min-height: 40px;
            padding: 0 16px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: 0.01em;
            box-shadow: 0 10px 24px rgba(27, 55, 88, 0.12);
            transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, color 0.16s ease;
        }
        .xb-assistant-actions button:hover,
        .xb-assistant-toolbar button:hover,
        .xb-assistant-compose button:hover {
            transform: translateY(-1px);
            box-shadow: 0 14px 28px rgba(27, 55, 88, 0.16);
        }
        .xb-assistant-actions button.secondary,
        .xb-assistant-toolbar button.secondary,
        .xb-assistant-compose button.secondary {
            background: rgba(255, 255, 255, 0.9);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-actions button.ghost,
        .xb-assistant-toolbar button.ghost,
        .xb-assistant-compose button.ghost,
        .xb-assistant-inline-input button.ghost {
            padding-inline: 14px;
            background: rgba(255, 255, 255, 0.74);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.1);
        }
        .xb-assistant-actions button:disabled,
        .xb-assistant-toolbar button:disabled,
        .xb-assistant-compose button:disabled {
            opacity: 0.52;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .xb-assistant-runtime {
            font-size: 12px;
            color: #5a6a81;
            min-height: 18px;
            line-height: 1.6;
        }
        .xb-assistant-main {
            display: grid;
            grid-template-rows: auto minmax(0, 1fr) auto;
            padding: 20px;
            gap: 16px;
            min-width: 0;
            max-width: 100%;
            overflow: hidden;
        }
        .xb-assistant-status {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.84);
            color: #41526a;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.06);
        }
        .xb-assistant-context-meter {
            display: inline-flex;
            align-items: center;
            min-height: 20px;
            padding: 9px 14px;
            border-radius: 999px;
            background: rgba(27, 55, 88, 0.09);
            color: #1b3758;
            font-size: 12px;
            font-weight: 600;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.08);
        }
        .xb-assistant-context-meter.summary-active {
            background: rgba(201, 107, 51, 0.12);
            color: #8d442b;
            box-shadow: inset 0 0 0 1px rgba(201, 107, 51, 0.18);
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
        .xb-assistant-chat {
            overflow: auto;
            overflow-x: hidden;
            padding: 4px;
            display: grid;
            gap: 12px;
            align-content: start;
            justify-items: start;
            grid-auto-rows: max-content;
            width: 100%;
            min-width: 0;
            max-width: 100%;
            overscroll-behavior: contain;
        }
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
            width: min(860px, 100%);
            max-width: 100%;
            box-sizing: border-box;
            border-radius: 18px;
            padding: 14px 16px;
            box-shadow: 0 12px 30px rgba(17, 31, 51, 0.07);
            align-self: start;
            overflow-wrap: anywhere;
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
        .xb-assistant-markdown {
            white-space: normal;
            line-height: 1.7;
        }
        .xb-assistant-markdown > *:first-child { margin-top: 0; }
        .xb-assistant-markdown > *:last-child { margin-bottom: 0; }
        .xb-assistant-markdown p,
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol,
        .xb-assistant-markdown pre,
        .xb-assistant-markdown blockquote,
        .xb-assistant-markdown table,
        .xb-assistant-markdown h1,
        .xb-assistant-markdown h2,
        .xb-assistant-markdown h3,
        .xb-assistant-markdown h4 {
            margin: 0 0 0.8em;
        }
        .xb-assistant-markdown code {
            padding: 0.12em 0.38em;
            border-radius: 8px;
            background: rgba(20, 32, 51, 0.08);
            font-family: "Cascadia Code", "Consolas", monospace;
            font-size: 0.95em;
        }
        .xb-assistant-markdown pre {
            overflow: auto;
            max-width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.06);
        }
        .xb-assistant-markdown pre code {
            padding: 0;
            background: transparent;
        }
        .xb-assistant-markdown blockquote {
            padding-left: 12px;
            border-left: 3px solid rgba(27, 55, 88, 0.24);
            color: #4b5a70;
        }
        .xb-assistant-markdown a {
            color: #285786;
            text-decoration: underline;
        }
        .xb-assistant-markdown ul,
        .xb-assistant-markdown ol {
            padding-left: 1.4em;
        }
        .xb-assistant-attachment-gallery {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 12px;
        }
        .xb-assistant-attachment-card {
            position: relative;
            width: 132px;
            padding: 8px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-attachment-card.compact {
            background: rgba(255, 255, 255, 0.18);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
        }
        .xb-assistant-attachment-image,
        .xb-assistant-attachment-placeholder {
            width: 100%;
            height: 90px;
            border-radius: 10px;
            object-fit: cover;
            display: block;
            background: rgba(20, 32, 51, 0.08);
        }
        .xb-assistant-attachment-placeholder {
            display: grid;
            place-items: center;
            color: #41526a;
            font-size: 13px;
        }
        .xb-assistant-attachment-name {
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.4;
            word-break: break-word;
        }
        .xb-assistant-attachment-remove {
            position: absolute;
            top: 6px;
            right: 6px;
            width: 24px;
            height: 24px;
            border: none;
            border-radius: 999px;
            background: rgba(20, 32, 51, 0.72);
            color: #fff;
            cursor: pointer;
            font: inherit;
        }
        .xb-assistant-tool-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-thought-details {
            margin-top: 10px;
            border-top: 1px dashed rgba(27, 55, 88, 0.12);
            padding-top: 10px;
        }
        .xb-assistant-tool-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-thought-details summary {
            cursor: pointer;
            color: #36567b;
            font-size: 13px;
            list-style: none;
        }
        .xb-assistant-tool-details summary::marker,
        .xb-assistant-tool-details summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-thought-details summary::marker,
        .xb-assistant-thought-details summary::-webkit-details-marker {
            display: none;
        }
        .xb-assistant-tool-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-thought-details summary::after {
            content: '（默认折叠）';
            margin-left: 6px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-tool-details[open] summary::after {
            content: '（点击收起）';
        }
        .xb-assistant-thought-details[open] summary::after {
            content: '（点击收起）';
        }
        .xb-assistant-content.tool-detail {
            margin-top: 10px;
            line-height: 1.6;
            max-height: calc(1.6em * 3 + 24px);
            overflow: hidden;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 12px;
            padding: 12px;
        }
        .xb-assistant-content.tool-summary {
            max-height: calc(1.6em * 3 + 12px);
            overflow: hidden;
        }
        .xb-assistant-tool-details[open] .xb-assistant-content.tool-detail {
            max-height: none;
            overflow: auto;
        }
        .xb-assistant-thought-block + .xb-assistant-thought-block {
            margin-top: 12px;
        }
        .xb-assistant-thought-label {
            margin-top: 10px;
            margin-bottom: 8px;
            color: #5a6a81;
            font-size: 12px;
        }
        .xb-assistant-thought-content {
            margin-top: 0;
            padding: 12px;
            border-radius: 12px;
            background: rgba(245, 247, 250, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.1);
            line-height: 1.65;
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
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
            overflow: hidden;
        }
        .xb-assistant-compose-main {
            min-width: 0;
            max-width: 100%;
        }
        .xb-assistant-compose-actions {
            display: grid;
            gap: 8px;
        }
        .xb-assistant-compose textarea { min-height: 92px; resize: vertical; max-width: 100%; overflow-x: hidden; }
        .xb-assistant-compose button.is-busy { background: #8d442b; }
        .xb-assistant-toast {
            min-height: 22px;
            color: #36567b;
            font-size: 12px;
            font-weight: 600;
            opacity: 0;
            transform: translateY(4px);
            transition: opacity 0.18s ease, transform 0.18s ease;
        }
        .xb-assistant-toast.visible {
            opacity: 1;
            transform: translateY(0);
        }
        .xb-assistant-toast-inline {
            padding: 4px 2px 0;
        }
        @keyframes xb-assistant-pulse {
            0% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0.35); }
            70% { box-shadow: 0 0 0 8px rgba(201, 107, 51, 0); }
            100% { box-shadow: 0 0 0 0 rgba(201, 107, 51, 0); }
        }
        @media (max-width: 900px) {
            .xb-assistant-shell { grid-template-columns: 1fr; grid-template-rows: auto minmax(0, 1fr); height: 100%; }
            .xb-assistant-shell.sidebar-collapsed { grid-template-columns: 1fr; }
            .xb-assistant-sidebar {
                padding: 12px 14px;
                grid-template-rows: auto minmax(0, 1fr);
                border-right: none;
                border-bottom: 1px solid rgba(20, 32, 51, 0.08);
                max-height: min(46vh, 420px);
                overflow: hidden;
            }
            .xb-assistant-sidebar.is-collapsed {
                padding: 12px 14px;
                overflow: hidden;
                max-height: none;
            }
            .xb-assistant-sidebar.is-collapsed .xb-assistant-sidebar-content {
                opacity: 0;
                pointer-events: none;
            }
            .xb-assistant-sidebar.is-collapsed .xb-assistant-brand,
            .xb-assistant-sidebar.is-collapsed .xb-assistant-config {
                display: none;
            }
            .xb-assistant-sidebar-toggle {
                min-width: 108px;
                padding: 0 12px;
                justify-content: space-between;
            }
            .xb-assistant-sidebar-content {
                padding-right: 2px;
            }
            .xb-assistant-sidebar-toggle-text {
                display: inline-flex;
                align-items: center;
            }
            .xb-assistant-main { padding: 14px; min-height: 0; height: 100%; }
            .xb-assistant-compose { grid-template-columns: 1fr; }
            .xb-assistant-compose-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .xb-assistant-toolbar,
            .xb-assistant-toolbar-cluster { align-items: stretch; }
            .xb-assistant-inline-input { grid-template-columns: 1fr; }
            .xb-assistant-status { justify-content: center; }
            .xb-assistant-chat { padding-inline: 0; min-height: 0; }
            .xb-assistant-bubble { width: 100%; }
            .xb-assistant-actions {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }
    `;
    document.head.appendChild(style);
}

function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) {
        return;
    }
    if (!root.firstChild) {
        buildAppMarkup(root);
        bindEvents(root);
    }

    syncConfigToForm(root);
    updateContextStats(toProviderMessages(getActiveContextMessages()));
    const chat = root.querySelector('#xb-assistant-chat');
    renderMessages(chat);
    const shouldForceScroll = state.messages.length !== lastRenderedMessageCount;
    lastRenderedMessageCount = state.messages.length;
    if (state.autoScroll || shouldForceScroll) {
        scrollChatToBottom(chat);
    }

    const sendButton = root.querySelector('#xb-assistant-send');
    sendButton.disabled = false;
    sendButton.classList.toggle('is-busy', state.isBusy);
    sendButton.textContent = state.isBusy ? '终止' : '发送';

    const addImageButton = root.querySelector('#xb-assistant-add-image');
    addImageButton.disabled = state.isBusy || state.draftAttachments.length >= MAX_IMAGE_ATTACHMENTS;
    addImageButton.textContent = state.draftAttachments.length
        ? `发图（${state.draftAttachments.length}/${MAX_IMAGE_ATTACHMENTS}）`
        : '发图';

    const clearButton = root.querySelector('#xb-assistant-clear');
    clearButton.disabled = state.isBusy || !state.messages.length;

    const deletePresetButton = root.querySelector('#xb-assistant-delete-preset');
    deletePresetButton.disabled = state.isBusy || (state.config?.presetNames || []).length <= 1;

    const pullButton = root.querySelector('#xb-assistant-pull-models');
    pullButton.disabled = state.isBusy;

    const status = root.querySelector('#xb-assistant-status');
    status.textContent = state.progressLabel || '就绪';
    status.classList.toggle('busy', state.isBusy);

    const contextMeter = root.querySelector('#xb-assistant-context-meter');
    contextMeter.textContent = buildContextMeterLabel();
    contextMeter.classList.toggle('summary-active', !!state.contextStats.summaryActive);
    contextMeter.title = state.contextStats.summaryActive
        ? '当前实际送模上下文 / 128k（已压缩较早历史）'
        : '当前实际送模上下文 / 128k';

    const toast = root.querySelector('#xb-assistant-toast');
    toast.textContent = state.toast || '';
    toast.classList.toggle('visible', !!state.toast);

    const shell = root.querySelector('.xb-assistant-shell');
    const sidebar = root.querySelector('.xb-assistant-sidebar');
    const sidebarToggle = root.querySelector('#xb-assistant-sidebar-toggle');
    const sidebarContent = root.querySelector('.xb-assistant-sidebar-content');
    shell?.classList.toggle('sidebar-collapsed', !!state.sidebarCollapsed);
    sidebar?.classList.toggle('is-collapsed', !!state.sidebarCollapsed);
    sidebarContent?.toggleAttribute('hidden', !!state.sidebarCollapsed);
    if (sidebarToggle) {
        const isMobile = window.matchMedia('(max-width: 900px)').matches;
        sidebarToggle.setAttribute('aria-expanded', state.sidebarCollapsed ? 'false' : 'true');
        sidebarToggle.setAttribute('aria-label', state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置');
        sidebarToggle.title = state.sidebarCollapsed ? '展开 API 配置' : '收起 API 配置';
        const text = sidebarToggle.querySelector('.xb-assistant-sidebar-toggle-text');
        const icon = sidebarToggle.querySelector('.xb-assistant-sidebar-toggle-icon');
        if (text) {
            text.textContent = isMobile
                ? (state.sidebarCollapsed ? '展开设置' : '收起设置')
                : '';
        }
        if (icon) {
            icon.textContent = isMobile
                ? (state.sidebarCollapsed ? '▾' : '▴')
                : (state.sidebarCollapsed ? '⚙' : '‹');
        }
    }

    const draftGallery = root.querySelector('#xb-assistant-draft-gallery');
    renderAttachmentGallery(draftGallery, state.draftAttachments, {
        onRemove: (index) => {
            state.draftAttachments = state.draftAttachments.filter((_, itemIndex) => itemIndex !== index);
            render();
        },
    });

    const toggleKey = root.querySelector('#xb-assistant-toggle-key');
    const apiKeyInput = root.querySelector('#xb-assistant-api-key');
    toggleKey.textContent = apiKeyInput.type === 'password' ? '显示' : '隐藏';
}

function bindEvents(root) {
    const input = root.querySelector('#xb-assistant-input');
    const imageInput = root.querySelector('#xb-assistant-image-input');
    const resizeComposer = () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(Math.max(input.scrollHeight, 92), 240)}px`;
    };

    root.querySelector('#xb-assistant-sidebar-toggle')?.addEventListener('click', () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        persistSession();
        render();
    });

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
        state.autoScroll = true;
        scrollChatToBottom(root.querySelector('#xb-assistant-chat'));
    });

    root.querySelector('#xb-assistant-provider').addEventListener('change', () => {
        syncCurrentProviderDraft(root);
        state.config = {
            ...(state.config || {}),
            provider: root.querySelector('#xb-assistant-provider').value,
        };
        render();
    });

    root.querySelector('#xb-assistant-preset-select').addEventListener('change', (event) => {
        syncCurrentProviderDraft(root);
        const nextPresetName = normalizePresetName(event.currentTarget.value);
        const nextPreset = (state.config?.presets || {})[nextPresetName] || buildDefaultPreset();
        state.config = normalizeAssistantConfig({
            ...state.config,
            currentPresetName: nextPresetName,
            presetDraftName: nextPresetName,
            provider: nextPreset.provider,
            modelConfigs: nextPreset.modelConfigs,
        });
        render();
    });

    root.querySelector('#xb-assistant-preset-name').addEventListener('input', () => {
        syncPresetDraftName(root);
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

    root.querySelector('#xb-assistant-reasoning-enabled').addEventListener('change', () => {
        syncCurrentProviderDraft(root);
        render();
    });

    root.querySelector('#xb-assistant-use-cors-proxy').addEventListener('change', () => {
        syncCurrentProviderDraft(root);
        render();
    });

    root.querySelector('#xb-assistant-reasoning-effort').addEventListener('change', () => {
        syncCurrentProviderDraft(root);
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

    root.querySelector('#xb-assistant-delete-preset').addEventListener('click', () => {
        deleteCurrentPreset(root);
    });

    root.querySelector('#xb-assistant-clear').addEventListener('click', () => {
        if (state.isBusy) return;
        state.messages = [];
        state.draftAttachments = [];
        resetCompactionState();
        persistSession();
        showToast('对话已清空');
        render();
    });

    root.querySelector('#xb-assistant-add-image').addEventListener('click', () => {
        if (state.isBusy || state.draftAttachments.length >= MAX_IMAGE_ATTACHMENTS) return;
        imageInput.click();
    });

    imageInput.addEventListener('change', async (event) => {
        const files = Array.from(event.currentTarget.files || []);
        if (!files.length) return;
        try {
            await appendDraftImageFiles(files);
        } finally {
            event.currentTarget.value = '';
        }
    });

    input.addEventListener('paste', async (event) => {
        if (state.isBusy) return;
        const items = Array.from(event.clipboardData?.items || []);
        if (!items.length) return;
        const pastedImageFiles = items
            .filter((item) => item.kind === 'file' && String(item.type || '').startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter(Boolean);
        if (!pastedImageFiles.length) return;

        event.preventDefault();
        await appendDraftImageFiles(pastedImageFiles);
    });

    root.querySelector('#xb-assistant-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        if (state.isBusy) {
            cancelActiveRun('本轮请求已终止。');
            return;
        }
        const value = input.value.trim();
        const attachments = normalizeAttachments(state.draftAttachments);
        if (!value && !attachments.length) return;

        syncCurrentProviderDraft(root);
        pushMessage({ role: 'user', content: value, attachments });
        input.value = '';
        state.draftAttachments = [];
        resizeComposer();
        render();

        const run = {
            id: createRequestId('run'),
            controller: new AbortController(),
            toolRequestIds: new Set(),
            cancelNotice: '',
            lightBrakeMessage: '',
            lastLightBrakeKey: '',
            toolErrorStreakKey: '',
            toolErrorStreakCount: 0,
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

    if (data.type === 'xb-assistant:config-save-error') {
        applyConfig(data.payload?.config || {});
        showToast(`保存失败：${data.payload?.error || '网络异常'}`);
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
