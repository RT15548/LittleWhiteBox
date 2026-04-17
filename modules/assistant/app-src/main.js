import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import {
    TOOL_DEFINITIONS,
    TOOL_NAMES,
    describeToolCall,
    formatToolResultDisplay,
} from './tooling.js';
import { createAssistantRuntime } from './runtime.js';
import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizeAssistantConfig,
    normalizePresetName,
} from '../shared/config.js';
import {
    normalizeSlashCommand,
    shouldRequireSlashCommandApproval,
} from './slash-command-policy.js';
import { createSessionStore } from './session-store.js';
import { createAttachmentsManager } from './attachments.js';
import { createSettingsPanel } from './settings-panel.js';
import { createChatUi } from './chat-ui.js';
import {
    EXAMPLE_PROMPTS,
    HISTORY_SUMMARY_PREFIX,
    SUMMARY_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
} from './prompts/system-prompt.js';

const SOURCE = 'xb-assistant-app';
const ROOT_ID = 'xb-assistant-root';
const REQUEST_TIMEOUT_MS = 180000;
const MAX_TOOL_ROUNDS = 64;
const MAX_CONTEXT_TOKENS = 128000;
const SUMMARY_TRIGGER_TOKENS = 98000;
const DEFAULT_PRESERVED_TURNS = 2;
const MIN_PRESERVED_TURNS = 1;
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
const pendingApprovals = new Map();
let toastTimer = null;
let parsedAssistantUA = null;

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

let sessionStore = null;

function persistSession() {
    sessionStore?.persistSession();
}

function restoreSession() {
    sessionStore?.restoreSession();
}

function getAssistantParsedUA() {
    if (parsedAssistantUA !== null) return parsedAssistantUA;
    try {
        parsedAssistantUA = globalThis.Bowser?.parse?.(navigator.userAgent) || {};
    } catch {
        parsedAssistantUA = {};
    }
    return parsedAssistantUA;
}

function isAssistantMobile() {
    const mobileTypes = ['mobile', 'tablet'];
    if (mobileTypes.includes(getAssistantParsedUA()?.platform?.type)) {
        return true;
    }
    return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 900px)').matches;
}

function findMessageByApprovalId(requestId) {
    return state.messages.find((message) => message?.approvalRequest?.id === requestId) || null;
}

function setApprovalStatus(requestId, status) {
    const target = findMessageByApprovalId(requestId);
    if (!target?.approvalRequest) return;
    target.approvalRequest.status = status;
    persistSession();
}

function buildSlashApprovalResult(command, approved) {
    if (approved) {
        return {
            ok: true,
            command,
            note: '用户已同意执行该斜杠命令。',
        };
    }
    return {
        ok: false,
        command,
        skipped: true,
        error: 'user_declined',
        note: '用户未同意执行该斜杠命令，本次已跳过。',
    };
}

function normalizeReasoningEffort(value) {
    return REASONING_EFFORT_OPTIONS.some((item) => item.value === value) ? value : 'medium';
}

function normalizeThoughtBlocks(thoughts) {
    if (!Array.isArray(thoughts)) return [];
    const seen = new Set();
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
        .filter(Boolean)
        .filter((item) => {
            const key = `${item.label}\u0000${item.text}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
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

const attachmentsManager = createAttachmentsManager({
    state,
    showToast,
    render,
    acceptedImageMimeTypes: ACCEPTED_IMAGE_MIME_TYPES,
    maxImageAttachments: MAX_IMAGE_ATTACHMENTS,
    maxImageFileBytes: MAX_IMAGE_FILE_BYTES,
});

const {
    normalizeAttachments,
    buildTextWithAttachmentSummary,
    buildUserContentParts,
    appendDraftImageFiles,
    renderAttachmentGallery,
} = attachmentsManager;

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
    return raw;
}

const settingsPanel = createSettingsPanel({
    state,
    post,
    render,
    showToast,
    describeError,
    getPullState,
    setPullState,
    setProviderModels,
    getProviderModels,
    getProviderLabel,
    normalizeReasoningEffort,
    normalizeAssistantConfig,
    normalizePresetName,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    defaultPresetName: DEFAULT_PRESET_NAME,
    requestTimeoutMs: REQUEST_TIMEOUT_MS,
    toolModeOptions: TOOL_MODE_OPTIONS,
    reasoningEffortOptions: REASONING_EFFORT_OPTIONS,
});

const {
    getActiveProviderConfig,
    syncCurrentProviderDraft,
    syncConfigToForm,
    bindSettingsPanelEvents,
} = settingsPanel;

const chatUi = createChatUi({
    state,
    examplePrompts: EXAMPLE_PROMPTS,
    toolNames: TOOL_NAMES,
    formatToolResultDisplay,
    normalizeThoughtBlocks,
    normalizeAttachments,
    renderAttachmentGallery,
});

const {
    renderMessages,
    scrollChatToBottom,
    scrollChatToTop,
    updateChatScrollButtonsVisibility,
    handleAssistantChatScroll,
} = chatUi;

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

const runtime = createAssistantRuntime({
    state,
    pendingToolCalls,
    pendingApprovals,
    persistSession,
    render,
    showToast,
    post,
    createRequestId,
    safeJsonParse,
    describeError,
    describeToolCall,
    formatToolResultDisplay,
    buildTextWithAttachmentSummary,
    buildUserContentParts,
    normalizeAttachments,
    normalizeThoughtBlocks,
    normalizeSlashCommand,
    shouldRequireSlashCommandApproval,
    setApprovalStatus,
    buildSlashApprovalResult,
    isAbortError,
    createAdapter,
    getActiveProviderConfig,
    SYSTEM_PROMPT,
    SUMMARY_SYSTEM_PROMPT,
    HISTORY_SUMMARY_PREFIX,
    MAX_CONTEXT_TOKENS,
    SUMMARY_TRIGGER_TOKENS,
    DEFAULT_PRESERVED_TURNS,
    MIN_PRESERVED_TURNS,
    MAX_TOOL_ROUNDS,
    REQUEST_TIMEOUT_MS,
    TOOL_DEFINITIONS,
    TOOL_NAMES,
});

const {
    resetCompactionState,
    buildContextMeterLabel,
    updateContextStats,
    pushMessage,
    cancelActiveRun,
    toProviderMessages,
    getActiveContextMessages,
    runAssistantLoop,
} = runtime;

sessionStore = createSessionStore({
    state,
    safeJsonParse,
    createRequestId,
    normalizeAttachments,
    normalizeThoughtBlocks,
    getActiveContextMessages,
});

function applyConfig(config) {
    state.config = normalizeAssistantConfig(config || {});
    render();
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
                <section class="xb-assistant-chat-wrap">
                    <section class="xb-assistant-chat" id="xb-assistant-chat"></section>
                    <div class="xb-assistant-scroll-helpers" id="xb-assistant-scroll-helpers">
                        <button id="xb-assistant-scroll-top" type="button" class="xb-assistant-scroll-btn" title="回到顶部" aria-label="回到顶部">▲</button>
                        <button id="xb-assistant-scroll-bottom" type="button" class="xb-assistant-scroll-btn" title="回到底部" aria-label="回到底部">▼</button>
                    </div>
                </section>
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
        .xb-assistant-chat-wrap {
            position: relative;
            min-height: 0;
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
        .xb-assistant-scroll-helpers {
            position: absolute;
            top: 12%;
            right: 10px;
            bottom: 12%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        .xb-assistant-scroll-helpers.active {
            opacity: 1;
        }
        .xb-assistant-scroll-btn {
            width: 32px;
            height: 32px;
            border: 1px solid rgba(27, 55, 88, 0.14);
            border-radius: 999px;
            background: rgba(244, 248, 252, 0.92);
            color: #1b3758;
            cursor: pointer;
            pointer-events: none;
            opacity: 0;
            transform: scale(0.8) translateX(8px);
            transition: all 0.2s ease;
            box-shadow: 0 10px 24px rgba(17, 31, 51, 0.08);
            font: inherit;
            font-size: 12px;
            font-weight: 700;
        }
        .xb-assistant-scroll-btn.visible {
            opacity: 1;
            pointer-events: auto;
            transform: scale(1) translateX(0);
        }
        .xb-assistant-scroll-btn:hover {
            background: rgba(255, 255, 255, 0.98);
            transform: scale(1.08) translateX(0);
        }
        .xb-assistant-scroll-btn:active {
            transform: scale(0.96) translateX(0);
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
            overflow: visible;
            max-width: 100%;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(20, 32, 51, 0.06);
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-all;
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
        .xb-assistant-approval {
            margin-top: 12px;
            padding: 14px;
            border-radius: 14px;
            background: rgba(244, 248, 252, 0.96);
            border: 1px solid rgba(27, 55, 88, 0.12);
        }
        .xb-assistant-approval-title {
            margin-bottom: 8px;
            color: #1b3758;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
        }
        .xb-assistant-approval-command {
            margin-top: 0;
            margin-bottom: 8px;
            padding: 12px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid rgba(27, 55, 88, 0.1);
        }
        .xb-assistant-approval-note {
            color: #4b5a70;
            font-size: 13px;
            line-height: 1.6;
        }
        .xb-assistant-approval-actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
            flex-wrap: wrap;
        }
        .xb-assistant-approval-button {
            border: none;
            border-radius: 999px;
            min-height: 36px;
            padding: 0 14px;
            background: #1b3758;
            color: #fff;
            cursor: pointer;
            font: inherit;
            font-size: 13px;
            font-weight: 600;
        }
        .xb-assistant-approval-button.secondary {
            background: rgba(255, 255, 255, 0.92);
            color: #1b3758;
            box-shadow: inset 0 0 0 1px rgba(27, 55, 88, 0.12);
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
                padding: 8px 14px;
                justify-content: space-between;
                background: linear-gradient(135deg, rgba(27, 55, 88, 0.92), rgba(40, 87, 134, 0.92));
                font-size: 14px;
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
            .xb-assistant-scroll-btn {
                width: 28px;
                height: 28px;
                font-size: 11px;
            }
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
    if (state.autoScroll) {
        scrollChatToBottom(chat);
    }
    updateChatScrollButtonsVisibility(root);

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
                ? (state.sidebarCollapsed ? '▼' : '▲')
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
        handleAssistantChatScroll(root);
    });

    root.querySelector('#xb-assistant-chat').addEventListener('click', (event) => {
        const chip = event.target.closest('.xb-assistant-example-chip');
        if (chip) {
            input.value = chip.dataset.prompt || '';
            resizeComposer();
            input.focus();
            state.autoScroll = true;
            scrollChatToBottom(root.querySelector('#xb-assistant-chat'));
            return;
        }

        const approvalButton = event.target.closest('[data-approval-id][data-approval-decision]');
        if (!approvalButton) return;
        const approvalId = approvalButton.dataset.approvalId || '';
        const decision = approvalButton.dataset.approvalDecision || '';
        const entry = pendingApprovals.get(approvalId);
        if (!entry) return;
        if (decision === 'approve') {
            entry.resolve(true);
        } else {
            entry.resolve(false);
        }
        render();
    });
    bindSettingsPanelEvents(root);

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

    root.querySelector('#xb-assistant-scroll-top').addEventListener('click', () => {
        state.autoScroll = false;
        scrollChatToTop(root.querySelector('#xb-assistant-chat'));
    });

    root.querySelector('#xb-assistant-scroll-bottom').addEventListener('click', () => {
        state.autoScroll = true;
        scrollChatToBottom(root.querySelector('#xb-assistant-chat'));
        updateChatScrollButtonsVisibility(root);
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

    input.addEventListener('keydown', (event) => {
        const sendOnEnter = !isAssistantMobile();
        if (!event.isComposing && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === 'Enter' && sendOnEnter) {
            event.preventDefault();
            const form = root.querySelector('#xb-assistant-form');
            if (typeof form?.requestSubmit === 'function') {
                form.requestSubmit();
                return;
            }
            form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    });

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
