import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import {
    TOOL_DEFINITIONS,
    TOOL_NAMES,
    formatToolResultDisplay,
} from './tooling.js';
import { createAssistantRuntime } from './runtime.js';
import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizePermissionMode,
    normalizeAssistantConfig,
    normalizePresetName,
} from '../shared/config.js';
import {
    normalizeSlashCommand,
    normalizeSlashSkillTrigger,
    shouldRequireSlashCommandApproval,
} from './slash-command-policy.js';
import { createSessionStore } from './session-store.js';
import { createAttachmentsManager } from './attachments.js';
import { renderAppChrome, renderContextHint } from './app-chrome.js';
import { buildAppMarkup as buildAssistantAppMarkup } from './app-shell.js';
import { createLocalSourcesManager } from './local-sources.js';
import { createSettingsPanel } from './settings-panel.js';
import { createChatUi } from './chat-ui.js';
import { injectAssistantStyles } from './styles.js';
import {
    HISTORY_SUMMARY_PREFIX,
    SUMMARY_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
    buildPermissionModePrompt,
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
const CONFIG_SAVE_TIMEOUT_MS = 3000;
const CONFIG_SAVE_RESULT_MS = 1800;
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
const PERMISSION_MODE_OPTIONS = [
    { value: 'default', label: '默认权限' },
    { value: 'full', label: '完全权限' },
];
const state = {
    config: null,
    configDraft: null,
    runtime: null,
    pendingApproval: null,
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
    localImportProgress: {
        active: false,
        label: '',
        detail: '',
        percent: 0,
    },
    workspaceSelectionContext: {
        filePath: '',
        viewerMode: '',
        lineStart: '',
        lineEnd: '',
        text: '',
    },
    externalEditorContext: null,
    modelOptionsByProvider: {},
    pullStateByProvider: {},
    draftAttachments: [],
    localSources: [],
    composeMenuOpen: false,
    isWorkspaceOpen: false,
    workspaceWidth: 520,
    selectedSourceId: 'all',
    selectedFilePath: '',
    selectedTreePath: '',
    fileSearchQuery: '',
    showModifiedOnly: false,
    viewerMode: 'current',
    treeExpandedKeys: [],
    sidebarCollapsed: true,
    configFormSyncPending: true,
    editingMessageIndex: -1,
    configSave: {
        status: 'idle',
        requestId: '',
        error: '',
    },
};

const pendingToolCalls = new Map();
const pendingApprovals = new Map();
let toastTimer = null;
let parsedAssistantUA = null;
let configSaveTimeout = null;
let configSaveResetTimer = null;

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
    return sessionStore?.persistSession();
}

function clearSession() {
    return sessionStore?.clearSession();
}

function restoreSession() {
    return sessionStore?.restoreSession();
}

function renderWorkspaceOnly() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const workspacePanel = root.querySelector('#xb-assistant-workspace-panel');
    if (!workspacePanel) return;
    ensureWorkspaceSelection();
    renderWorkspace(workspacePanel, { disabled: state.isBusy });
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

function buildSlashApprovalResult(command, approved) {
    if (approved) {
        return {
            command,
            ok: true,
            pipe: '',
            execution: {
                interrupt: false,
                isBreak: false,
                isAborted: false,
                isQuietlyAborted: false,
                abortReason: '',
                isError: false,
                errorMessage: '',
            },
            note: '用户已同意执行该斜杠命令。',
        };
    }
    return {
        command,
        ok: false,
        pipe: '',
        execution: {
            interrupt: false,
            isBreak: false,
            isAborted: false,
            isQuietlyAborted: false,
            abortReason: '',
            isError: false,
            errorMessage: '',
        },
        skipped: true,
        note: '用户未同意执行该斜杠命令，本次已跳过。',
    };
}

function buildJsApiApprovalResult(args = {}, approved, requestKind = 'unknown') {
    const code = String(args.code || '').trim();
    const normalizedRequestKind = ['inspect', 'read', 'effect', 'unknown'].includes(requestKind) ? requestKind : 'unknown';
    const calledApiSemantics = args && typeof args.calledApiSemantics === 'object' && args.calledApiSemantics
        ? args.calledApiSemantics
        : {};
    if (approved) {
        return {
            code,
            ok: true,
            output: '',
            requestKind: normalizedRequestKind,
            calledApiSemantics,
            execution: {
                isError: false,
                errorCode: '',
                errorMessage: '',
                isAborted: false,
                abortReason: '',
                unavailableApis: [],
                validationErrors: [],
            },
            note: '用户已同意执行该 JS API 请求。',
        };
    }
    return {
        code,
        ok: false,
        output: '',
        requestKind: normalizedRequestKind,
        calledApiSemantics,
        execution: {
            isError: false,
            errorCode: '',
            errorMessage: '',
            isAborted: false,
            abortReason: '',
            unavailableApis: [],
            validationErrors: [],
        },
        skipped: true,
        note: '用户未同意执行该 JS API 请求，本次已跳过。',
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

function setLocalImportProgress(next = {}) {
    const active = !!next.active;
    state.localImportProgress = {
        active,
        label: active ? String(next.label || '').trim() : '',
        detail: active ? String(next.detail || '').trim() : '',
        percent: active ? Math.max(0, Math.min(100, Math.round(Number(next.percent) || 0))) : 0,
    };
    render();
}

function clearConfigSaveTimers() {
    if (configSaveTimeout) {
        clearTimeout(configSaveTimeout);
        configSaveTimeout = null;
    }
    if (configSaveResetTimer) {
        clearTimeout(configSaveResetTimer);
        configSaveResetTimer = null;
    }
}

function scheduleConfigSaveReset(delay = CONFIG_SAVE_RESULT_MS) {
    if (configSaveResetTimer) {
        clearTimeout(configSaveResetTimer);
    }
    configSaveResetTimer = setTimeout(() => {
        configSaveResetTimer = null;
        state.configSave = {
            status: 'idle',
            requestId: '',
            error: '',
        };
        render();
    }, delay);
}

function beginConfigSave(requestId) {
    clearConfigSaveTimers();
    state.configSave = {
        status: 'saving',
        requestId,
        error: '',
    };
    configSaveTimeout = setTimeout(() => {
        configSaveTimeout = null;
        if (state.configSave.requestId !== requestId || state.configSave.status !== 'saving') {
            return;
        }
        state.configSave = {
            status: 'error',
            requestId,
            error: '保存超时，请重试',
        };
        render();
        scheduleConfigSaveReset();
    }, CONFIG_SAVE_TIMEOUT_MS);
    render();
}

function completeConfigSave(requestId, { ok, error = '' } = {}) {
    if (requestId && state.configSave.requestId && state.configSave.requestId !== requestId) {
        return;
    }
    if (configSaveTimeout) {
        clearTimeout(configSaveTimeout);
        configSaveTimeout = null;
    }
    state.configSave = {
        status: ok ? 'success' : 'error',
        requestId: requestId || state.configSave.requestId || '',
        error: ok ? '' : String(error || '保存失败'),
    };
    render();
    scheduleConfigSaveReset();
}

function requestConfigFormSync() {
    state.configFormSyncPending = true;
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

const localSourcesManager = createLocalSourcesManager({
    state,
    createRequestId,
    showToast,
    setImportProgress: setLocalImportProgress,
    render,
    renderWorkspaceOnly,
    persistSession,
    onWorkspaceClosed: clearWorkspaceSelectionContext,
    post,
});

const {
    appendLocalSourceFiles,
    clearLocalSources,
    applyExternalLocalSources,
    openWorkspace,
    closeWorkspace,
    toggleWorkspace,
    selectWorkspaceFile,
    setWorkspaceWidth,
    renderWorkspace,
    ensureWorkspaceSelection,
    getWorkspaceSummary,
    syncHostLocalSources,
} = localSourcesManager;

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
    if (lowered === 'local_path_required') return '这个工具只能操作 `local/` 下的会话内临时源码文件。';
    if (lowered === 'unsupported_text_file') return '目前只支持文本类源码文件。';
    if (lowered === 'local_source_not_found') return '目标源码源不存在，可能已经被移除。';
    if (lowered === 'local_file_not_found') return '目标 `local/` 文件不存在；可以先用 Write 新建。';
    if (lowered === 'local_path_not_found') return '目标 `local/` 路径不存在。';
    if (lowered === 'local_destination_exists') return '目标路径已经存在；请换一个路径，或显式允许覆盖。';
    if (lowered === 'edit_old_text_required') return 'Edit 需要提供明确的 oldText。';
    if (lowered === 'edit_not_found') return '没有在目标文件里找到要替换的 oldText。';
    if (lowered === 'edit_not_unique') return 'oldText 命中不唯一；请改得更精确，或显式要求全部替换。';
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
    beginConfigSave,
    requestConfigFormSync,
    createRequestId,
    describeError,
    getPullState,
    setPullState,
    setProviderModels,
    getProviderModels,
    getProviderLabel,
    normalizePermissionMode,
    normalizeReasoningEffort,
    normalizeAssistantConfig,
    normalizePresetName,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    defaultPresetName: DEFAULT_PRESET_NAME,
    requestTimeoutMs: REQUEST_TIMEOUT_MS,
    toolModeOptions: TOOL_MODE_OPTIONS,
    permissionModeOptions: PERMISSION_MODE_OPTIONS,
    reasoningEffortOptions: REASONING_EFFORT_OPTIONS,
});

const {
    getActiveProviderConfig,
    syncConfigToForm,
    bindSettingsPanelEvents,
} = settingsPanel;

const chatUi = createChatUi({
    state,
    toolNames: TOOL_NAMES,
    formatToolResultDisplay,
    normalizeThoughtBlocks,
    normalizeAttachments,
    renderAttachmentGallery,
    onLocalPathClick: (path) => {
        return openWorkspace(path);
    },
});

const {
    renderMessages,
    renderApprovalPanel,
    scrollChatToBottom,
    scrollChatToTop,
    updateChatScrollButtonsVisibility,
    handleAssistantChatScroll,
    copyText,
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

function getInjectedSystemPrompt() {
    const identityContent = String(state.runtime?.identityContent || '').trim();
    const skillsPromptSummary = String(state.runtime?.skillsPromptSummary || '').trim();
    const permissionPrompt = buildPermissionModePrompt(state.config?.permissionMode);
    return [SYSTEM_PROMPT, permissionPrompt, skillsPromptSummary, identityContent].filter(Boolean).join('\n\n');
}

function trimContextSnippet(text, limit = 600) {
    const normalized = String(text || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';
    if (normalized.length <= limit) return normalized;
    return `${normalized.slice(0, limit)}...`;
}

function normalizeWorkspaceSelectionContext(next = {}) {
    return {
        filePath: String(next.filePath || '').trim(),
        viewerMode: String(next.viewerMode || '').trim(),
        lineStart: String(next.lineStart || '').trim(),
        lineEnd: String(next.lineEnd || '').trim(),
        text: trimContextSnippet(next.text || '', 600),
    };
}

function clearWorkspaceSelectionContext() {
    state.workspaceSelectionContext = normalizeWorkspaceSelectionContext();
}

function normalizeExternalEditorContext(payload = null) {
    if (!payload || typeof payload !== 'object') return null;
    const filePath = String(payload.filePath || payload.path || '').trim();
    const note = String(payload.note || '').trim();
    const selectionText = trimContextSnippet(payload.selectionText || payload.selectedText || '', 600);
    const lineStart = String(payload.lineStart || payload.startLine || '').trim();
    const lineEnd = String(payload.lineEnd || payload.endLine || '').trim();
    const source = String(payload.source || 'external-editor').trim() || 'external-editor';
    if (!filePath && !note && !selectionText) return null;
    return {
        source,
        filePath,
        note,
        selectionText,
        lineStart,
        lineEnd,
    };
}

function buildWorkspaceUserContextText() {
    if (!state.isWorkspaceOpen) return '';
    const selectedFilePath = String(state.selectedFilePath || '').trim();
    const selectedTreePath = String(state.selectedTreePath || '').trim();
    const selection = normalizeWorkspaceSelectionContext(state.workspaceSelectionContext);

    if (!selectedFilePath && !selectedTreePath) return '';

    const lines = ['[IDE background]'];
    if (selectedTreePath && String(selectedTreePath).endsWith('/') && (!selectedFilePath || selectedTreePath !== selectedFilePath)) {
        lines.push(`用户当前在工作区聚焦了目录：${selectedTreePath}`);
        if (!selectedFilePath) {
            lines.push('用户当前还没有在代码区锁定具体文件。');
        } else {
            lines.push(`代码区当前显示的是：${selectedFilePath}，但树上的当前焦点仍是这个目录。`);
        }
    } else if (selectedFilePath) {
        lines.push(`用户当前打开了文件：${selectedFilePath}`);
        if (state.viewerMode) {
            lines.push(`当前查看模式：${String(state.viewerMode || '').trim()}`);
        }
    }

    if (selection.text && selection.filePath && selection.filePath === selectedFilePath) {
        if (selection.lineStart) {
            lines.push(
                selection.lineEnd && selection.lineEnd !== selection.lineStart
                    ? `用户当前选中了 ${selection.filePath} 的第 ${selection.lineStart} 到 ${selection.lineEnd} 行：`
                    : `用户当前选中了 ${selection.filePath} 的第 ${selection.lineStart} 行：`,
            );
        } else {
            lines.push(`用户当前选中了 ${selection.filePath} 中的一段内容：`);
        }
        lines.push(selection.text);
    }

    lines.push('');
    lines.push('这些信息可能与当前任务有关，也可能无关，请自然地了解即可。');

    return lines.join('\n').trim();
}

function buildExternalEditorContextText() {
    const context = normalizeExternalEditorContext(state.externalEditorContext);
    if (!context) return '';

    const lines = ['[IDE background]'];
    if (context.filePath) {
        lines.push(`用户当前打开了文件：${context.filePath}`);
    }
    if (context.lineStart) {
        lines.push(
            context.filePath
                ? (
                    context.lineEnd && context.lineEnd !== context.lineStart
                        ? `用户当前选中了 ${context.filePath} 的第 ${context.lineStart} 到 ${context.lineEnd} 行：`
                        : `用户当前选中了 ${context.filePath} 的第 ${context.lineStart} 行：`
                )
                : (
                    context.lineEnd && context.lineEnd !== context.lineStart
                        ? `用户当前选中了第 ${context.lineStart} 到 ${context.lineEnd} 行：`
                        : `用户当前选中了第 ${context.lineStart} 行：`
                ),
        );
    }
    if (context.selectionText) {
        lines.push(context.selectionText);
    }
    if (context.note) {
        lines.push(context.note);
    }
    lines.push('');
    lines.push('这些信息可能与当前任务有关，也可能无关，请自然地了解即可。');
    return lines.join('\n').trim();
}

function getEphemeralUserContextText() {
    return [
        buildExternalEditorContextText(),
        buildWorkspaceUserContextText(),
    ].filter(Boolean).join('\n\n').trim();
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
    formatToolResultDisplay,
    buildTextWithAttachmentSummary,
    buildUserContentParts,
    normalizeAttachments,
    normalizeThoughtBlocks,
    normalizeSlashCommand,
    normalizeSlashSkillTrigger,
    shouldRequireSlashCommandApproval: (command) => shouldRequireSlashCommandApproval(command, state.config?.permissionMode),
    buildSlashApprovalResult,
    buildJsApiApprovalResult,
    isAbortError,
    createAdapter,
    getActiveProviderConfig,
    getSystemPrompt: getInjectedSystemPrompt,
    getEphemeralUserContextText,
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
    state.configDraft = null;
    requestConfigFormSync();
    render();
}

function createAssistantRun() {
    return {
        id: createRequestId('run'),
        controller: new AbortController(),
        toolRequestIds: new Set(),
        userContextSnapshotText: getEphemeralUserContextText(),
        cancelNotice: '',
        lightBrakeMessage: '',
        lastLightBrakeKey: '',
        toolErrorStreakKey: '',
        toolErrorStreakCount: 0,
    };
}

async function executeAssistantRun(run) {
    state.activeRun = run;
    state.isBusy = true;
    state.currentRound = 0;
    state.progressLabel = '生成中';
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
}

function getLastNonApprovalMessage(messages = []) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        const message = messages[index];
        if (message?.approvalRequest) continue;
        return message || null;
    }
    return null;
}

function isEditableAssistantTextMessage(message) {
    return !!(
        message
        && message.role === 'assistant'
        && !message.streaming
        && !(Array.isArray(message.toolCalls) && message.toolCalls.length)
        && String(message.content || '').trim()
    );
}

function findTurnUserMessageIndex(endIndex) {
    for (let index = endIndex; index >= 0; index -= 1) {
        const message = state.messages[index];
        if (message?.approvalRequest) continue;
        if (message?.role === 'user') {
            return index;
        }
    }
    return -1;
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

function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) {
        return;
    }
    if (!root.firstChild) {
        root.replaceChildren(buildSanitizedHtmlFragment(buildAssistantAppMarkup(state)));
        bindEvents(root);
    }

    if (state.configFormSyncPending) {
        syncConfigToForm(root);
        state.configFormSyncPending = false;
    }
    updateContextStats(toProviderMessages(getActiveContextMessages()));
    ensureWorkspaceSelection();
    const chat = root.querySelector('#xb-assistant-chat');
    const approvalSlot = root.querySelector('#xb-assistant-approval-slot');
    renderMessages(chat);
    renderApprovalPanel(approvalSlot);
    if (state.autoScroll) {
        scrollChatToBottom(chat);
    }
    updateChatScrollButtonsVisibility(root);
    renderAppChrome(root, state, {
        maxImageAttachments: MAX_IMAGE_ATTACHMENTS,
        maxContextTokens: MAX_CONTEXT_TOKENS,
        buildContextMeterLabel,
        getWorkspaceSummary,
        renderAttachmentGallery,
        renderWorkspace,
        onRemoveDraftAttachment: (index) => {
            state.draftAttachments = state.draftAttachments.filter((_, itemIndex) => itemIndex !== index);
            render();
        },
        onOpenWorkspace: () => {
            openWorkspace(state.selectedFilePath);
        },
        onClearLocalSources: () => {
            clearLocalSources();
        },
    });
}

function bindEvents(root) {
    const input = root.querySelector('#xb-assistant-input');
    const imageInput = root.querySelector('#xb-assistant-image-input');
    const localFileInput = root.querySelector('#xb-assistant-local-file-input');
    const localDirectoryInput = root.querySelector('#xb-assistant-local-directory-input');
    const workspacePanel = root.querySelector('#xb-assistant-workspace-panel');
    const composeMenuRoot = root.querySelector('#xb-assistant-compose-more');
    const composeMenuToggle = root.querySelector('#xb-assistant-compose-menu-toggle');
    const closeComposeMenu = () => {
        if (!state.composeMenuOpen) return;
        state.composeMenuOpen = false;
        render();
    };
    let workspaceResizeActive = false;
    let workspaceResizeStartX = 0;
    let workspaceResizeStartWidth = 0;
    let workspaceResizeLastWidth = Number(state.workspaceWidth) || 520;
    const selectionDocument = root.ownerDocument || document;
    const refreshContextHint = () => {
        renderContextHint(root, state);
    };
    const getClosestWorkspaceRow = (node) => {
        let current = node;
        while (current) {
            if (current instanceof Element && current.classList.contains('xb-assistant-workspace-code-row')) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    };
    const updateWorkspaceSelectionContextFromDom = () => {
        const selection = selectionDocument.getSelection?.();
        if (!selection || selection.rangeCount <= 0 || selection.isCollapsed) {
            if (state.workspaceSelectionContext?.text) {
                clearWorkspaceSelectionContext();
                refreshContextHint();
            }
            return;
        }
        const selectedText = trimContextSnippet(selection.toString(), 600);
        if (!selectedText || !workspacePanel?.contains(selection.anchorNode) || !workspacePanel.contains(selection.focusNode)) {
            if (state.workspaceSelectionContext?.text) {
                clearWorkspaceSelectionContext();
                refreshContextHint();
            }
            return;
        }
        const anchorRow = getClosestWorkspaceRow(selection.anchorNode);
        const focusRow = getClosestWorkspaceRow(selection.focusNode);
        if (!anchorRow || !focusRow) {
            if (state.workspaceSelectionContext?.text) {
                clearWorkspaceSelectionContext();
                refreshContextHint();
            }
            return;
        }
        const rawStart = Number(anchorRow.dataset.lineNumber || anchorRow.dataset.lineIndex || 0);
        const rawEnd = Number(focusRow.dataset.lineNumber || focusRow.dataset.lineIndex || 0);
        const startLine = Number.isFinite(rawStart) && rawStart > 0 ? Math.min(rawStart, rawEnd || rawStart) : '';
        const endLine = Number.isFinite(rawEnd) && rawEnd > 0 ? Math.max(rawStart || rawEnd, rawEnd) : '';
        const nextSelectionContext = normalizeWorkspaceSelectionContext({
            filePath: state.selectedFilePath,
            viewerMode: state.viewerMode,
            lineStart: startLine,
            lineEnd: endLine,
            text: selectedText,
        });
        const prevSelectionContext = normalizeWorkspaceSelectionContext(state.workspaceSelectionContext);
        if (JSON.stringify(prevSelectionContext) === JSON.stringify(nextSelectionContext)) {
            return;
        }
        state.workspaceSelectionContext = nextSelectionContext;
        refreshContextHint();
    };
    const resizeComposer = () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(Math.max(input.scrollHeight, 60), 200)}px`;
    };
    const applyWorkspaceWidthPreview = (width) => {
        const normalizedWidth = Math.max(360, Math.min(960, Math.round(Number(width) || 520)));
        const mainBody = root.querySelector('.xb-assistant-main-body');
        const workspaceShell = root.querySelector('#xb-assistant-workspace');
        mainBody?.style.setProperty('--xb-assistant-workspace-width', `${normalizedWidth}px`);
        workspaceShell?.style.setProperty('--xb-assistant-workspace-width', `${normalizedWidth}px`);
        return normalizedWidth;
    };
    const stopWorkspaceResize = () => {
        if (!workspaceResizeActive) return;
        workspaceResizeActive = false;
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleWorkspaceResizeMove);
        window.removeEventListener('mouseup', stopWorkspaceResize);
        setWorkspaceWidth(workspaceResizeLastWidth, { persist: true, render: false });
    };
    const handleWorkspaceResizeMove = (event) => {
        if (!workspaceResizeActive) return;
        const delta = workspaceResizeStartX - event.clientX;
        workspaceResizeLastWidth = applyWorkspaceWidthPreview(workspaceResizeStartWidth + delta);
        setWorkspaceWidth(workspaceResizeLastWidth, { persist: false, render: false });
    };

    root.querySelector('#xb-assistant-sidebar-toggle')?.addEventListener('click', () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        persistSession();
        render();
    });

    root.querySelector('#xb-assistant-mobile-settings')?.addEventListener('click', () => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
        persistSession();
        render();
    });

    root.querySelector('#xb-assistant-mobile-close')?.addEventListener('click', () => {
        post('xb-assistant:close');
    });

    root.querySelector('#xb-assistant-open-workspace')?.addEventListener('click', () => {
        toggleWorkspace();
    });

    root.querySelector('#xb-assistant-clear-local-sources')?.addEventListener('click', () => {
        if (!state.localSources.length) return;
        clearLocalSources();
    });

    root.querySelector('#xb-assistant-workspace-backdrop')?.addEventListener('click', () => {
        closeWorkspace();
        clearWorkspaceSelectionContext();
    });

    root.querySelector('#xb-assistant-workspace-resizer')?.addEventListener('mousedown', (event) => {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        workspaceResizeActive = true;
        workspaceResizeStartX = event.clientX;
        workspaceResizeStartWidth = Number(state.workspaceWidth) || 520;
        workspaceResizeLastWidth = workspaceResizeStartWidth;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleWorkspaceResizeMove);
        window.addEventListener('mouseup', stopWorkspaceResize);
        event.preventDefault();
    });

    root.querySelector('#xb-assistant-mobile-backdrop')?.addEventListener('click', () => {
        if (state.sidebarCollapsed) return;
        state.sidebarCollapsed = true;
        persistSession();
        render();
    });

    root.querySelector('#xb-assistant-chat').addEventListener('scroll', (event) => {
        const container = event.currentTarget;
        const threshold = 48;
        state.autoScroll = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
        handleAssistantChatScroll(root);
    });

    const handleAssistantPanelClick = async (event) => {
        const approvalButton = event.target.closest('[data-approval-id][data-approval-decision]');
        if (approvalButton) {
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
            return;
        }

        const actionButton = event.target.closest('[data-message-action][data-message-index]');
        if (!actionButton) return;

        const messageIndex = Number.parseInt(actionButton.dataset.messageIndex || '', 10);
        const action = String(actionButton.dataset.messageAction || '').trim();
        if (!Number.isInteger(messageIndex) || messageIndex < 0 || !action) return;
        const message = state.messages[messageIndex];
        if (!isEditableAssistantTextMessage(message)) return;

        if (action === 'copy') {
            const copied = await copyText(String(message.content || ''));
            showToast(copied ? '已复制整条消息' : '复制失败');
            return;
        }

        if (action === 'edit') {
            if (state.isBusy) return;
            state.editingMessageIndex = messageIndex;
            render();
            const textarea = root.querySelector(`.xb-assistant-bubble[data-message-index="${messageIndex}"] .xb-assistant-message-editor`);
            textarea?.focus();
            textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
            return;
        }

        if (action === 'cancel-edit') {
            state.editingMessageIndex = -1;
            render();
            return;
        }

        if (action === 'save-edit') {
            if (state.isBusy) return;
            const textarea = root.querySelector(`.xb-assistant-bubble[data-message-index="${messageIndex}"] .xb-assistant-message-editor`);
            const nextContent = String(textarea?.value || '').trim();
            if (!nextContent) {
                showToast('消息内容不能为空');
                return;
            }
            state.messages[messageIndex] = {
                ...message,
                content: nextContent,
            };
            state.editingMessageIndex = -1;
            await persistSession();
            showToast('消息已更新');
            render();
            return;
        }

        if (action === 'delete') {
            if (state.isBusy) return;
            state.messages.splice(messageIndex, 1);
            state.editingMessageIndex = -1;
            await persistSession();
            showToast('消息已删除');
            render();
            return;
        }

        if (action === 'reroll') {
            if (state.isBusy) return;
            const turnUserIndex = findTurnUserMessageIndex(messageIndex - 1);
            if (turnUserIndex < 0) {
                showToast('这条消息前没有可重跑的用户输入');
                return;
            }
            const nextMessages = state.messages.slice(0, turnUserIndex + 1);
            const latestMessage = getLastNonApprovalMessage(nextMessages);
            if (!latestMessage || latestMessage.role !== 'user') {
                showToast('这条消息前没有可重跑的用户输入');
                return;
            }

            state.messages = nextMessages;
            state.pendingApproval = null;
            state.editingMessageIndex = -1;
            await persistSession();
            render();

            const run = createAssistantRun();
            await executeAssistantRun(run);
        }
    };

    root.querySelector('#xb-assistant-chat').addEventListener('click', handleAssistantPanelClick);
    root.querySelector('#xb-assistant-approval-slot')?.addEventListener('click', handleAssistantPanelClick);
    bindSettingsPanelEvents(root);

    root.querySelector('#xb-assistant-clear').addEventListener('click', async () => {
        if (state.isBusy) return;
        state.messages = [];
        state.draftAttachments = [];
        state.localSources = [];
        state.historySummary = '';
        state.archivedTurnCount = 0;
        state.pendingApproval = null;
        state.editingMessageIndex = -1;
        resetCompactionState();
        await clearSession();
        syncHostLocalSources();
        showToast('对话已清空');
        render();
    });

    root.querySelector('#xb-assistant-add-image').addEventListener('click', () => {
        if (state.isBusy || state.draftAttachments.length >= MAX_IMAGE_ATTACHMENTS) return;
        closeComposeMenu();
        imageInput.click();
    });

    root.querySelector('#xb-assistant-add-local-files').addEventListener('click', () => {
        if (state.isBusy) return;
        closeComposeMenu();
        localFileInput.click();
    });

    root.querySelector('#xb-assistant-add-local-directory').addEventListener('click', () => {
        if (state.isBusy || !('webkitdirectory' in localDirectoryInput)) return;
        closeComposeMenu();
        localDirectoryInput.click();
    });

    composeMenuToggle.addEventListener('click', () => {
        if (state.isBusy) return;
        state.composeMenuOpen = !state.composeMenuOpen;
        render();
    });

    root.addEventListener('click', (event) => {
        if (!state.composeMenuOpen) return;
        if (composeMenuRoot?.contains(event.target)) return;
        closeComposeMenu();
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

    localFileInput.addEventListener('change', async (event) => {
        const files = Array.from(event.currentTarget.files || []);
        if (!files.length) return;
        try {
            await appendLocalSourceFiles(files, { mode: 'files' });
        } finally {
            event.currentTarget.value = '';
        }
    });

    localDirectoryInput.addEventListener('change', async (event) => {
        const files = Array.from(event.currentTarget.files || []);
        if (!files.length) return;
        try {
            await appendLocalSourceFiles(files, { mode: 'directory' });
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

        pushMessage({ role: 'user', content: value, attachments });
        input.value = '';
        state.draftAttachments = [];
        state.composeMenuOpen = false;
        resizeComposer();
        render();

        state.editingMessageIndex = -1;
        const run = createAssistantRun();
        await executeAssistantRun(run);
    });

    input.addEventListener('input', resizeComposer);
    selectionDocument.addEventListener('selectionchange', updateWorkspaceSelectionContextFromDom);

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && state.composeMenuOpen) {
            event.preventDefault();
            closeComposeMenu();
            return;
        }
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
        completeConfigSave(data.payload?.requestId || '', { ok: true });
        showToast('配置已保存');
        return;
    }

    if (data.type === 'xb-assistant:identity-updated') {
        state.runtime = {
            ...(state.runtime || {}),
            identityContent: String(data.payload?.identityContent || '').trim(),
        };
        showToast('身份设定已更新');
        return;
    }

    if (data.type === 'xb-assistant:skills-updated') {
        state.runtime = {
            ...(state.runtime || {}),
            skillsCatalog: data.payload?.skillsCatalog || { version: 1, skills: [] },
            skillsPromptSummary: String(data.payload?.skillsPromptSummary || ''),
            skillsCatalogError: String(data.payload?.skillsCatalogError || ''),
        };
        showToast('技能目录已刷新');
        return;
    }

    if (data.type === 'xb-assistant:editor-context') {
        state.externalEditorContext = normalizeExternalEditorContext(data.payload);
        renderContextHint(document.getElementById(ROOT_ID), state);
        return;
    }

    if (data.type === 'xb-assistant:local-sources-updated') {
        void applyExternalLocalSources(data.payload?.localSources || []);
        return;
    }

    if (data.type === 'xb-assistant:config-save-error') {
        applyConfig(data.payload?.config || {});
        completeConfigSave(data.payload?.requestId || '', { ok: false, error: data.payload?.error || '网络异常' });
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

async function bootstrap() {
    await restoreSession();
    injectAssistantStyles(ROOT_ID);
    render();
    syncHostLocalSources();
    post('xb-assistant:ready');
}

bootstrap().catch((error) => {
    console.error('[Assistant] 启动失败:', error);
    injectAssistantStyles(ROOT_ID);
    render();
    syncHostLocalSources();
    post('xb-assistant:ready');
});
