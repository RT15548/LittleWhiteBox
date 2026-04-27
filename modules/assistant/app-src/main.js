import { OpenAICompatibleAdapter } from './adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from './adapters/openai-responses.js';
import { AnthropicAdapter } from './adapters/anthropic.js';
import { GoogleAdapter } from './adapters/google.js';
import { SillyTavernOpenAICompatibleAdapter } from './adapters/sillytavern-openai-compatible.js';
import {
    TOOL_DEFINITIONS,
    TOOL_NAMES,
    formatToolResultDisplay,
} from './tooling.js';
import { createAssistantRuntime } from './runtime.js';
import { buildWorkspaceUserContextTextForState } from './context/ide-context.js';
import { normalizeMemoryFiles } from './memory/memory-files.js';
import {
    DEFAULT_PRESET_NAME,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    normalizeJsApiPermission,
    normalizePermissionMode,
    normalizeAssistantConfig,
    normalizePresetName,
} from '../shared/config.js';
import {
    normalizeSlashCommand,
    normalizeSlashSkillTrigger,
    shouldRequireSlashCommandApproval,
} from './slash-command-policy.js';
import { createSessionStore } from './state/session-store.js';
import { createAttachmentsManager } from './attachments.js';
import { renderAppChrome, renderContextHint } from './ui/app-chrome.js';
import { buildAppMarkup as buildAssistantAppMarkup } from './ui/app-shell.js';
import { createChatUi } from './ui/chat-ui.js';
import { createSettingsPanel } from './ui/settings-panel.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import { createLocalSourcesManager } from './workspace/local-sources.js';
import { buildWorkspaceTree } from './workspace/local-workspace-tree.js';
import { renderWorkspace as renderWorkspaceUi } from './workspace/local-workspace-ui.js';
import { injectAssistantStyles } from './styles.js';
import {
    HISTORY_SUMMARY_PREFIX,
    SUMMARY_SYSTEM_PROMPT,
    SYSTEM_PROMPT,
    buildPermissionModePrompt,
} from './prompts/system-prompt.js';
import {
    WORKSPACE_KERNEL_VERSION,
    WORKSPACE_MESSAGE_TYPES,
} from '../shared/workspace-protocol.js';

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
    { value: 'sillytavern-openai-compatible', label: 'SillyTavern OpenAI-Compatible' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google AI' },
];
const PERMISSION_MODE_OPTIONS = [
    { value: 'default', label: '默认权限' },
    { value: 'full', label: '完全权限' },
];
const JS_API_PERMISSION_OPTIONS = [
    { value: 'deny', label: '禁止' },
    { value: 'allow', label: '允许' },
];
const state = {
    config: null,
    configDraft: null,
    runtime: null,
    workspaceDrafts: {},
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
    workspacePanelMode: 'workspace',
    selectedSourceId: 'all',
    selectedFilePath: '',
    selectedTreePath: '',
    skillFiles: [],
    selectedSkillFilePath: '',
    fileSearchQuery: '',
    showModifiedOnly: false,
    viewerMode: 'current',
    mobileWorkspacePane: 'tree',
    treeExpandedKeys: [],
    skillTreeExpandedKeys: [],
    sidebarCollapsed: true,
    configFormSyncPending: true,
    editingMessageIndex: -1,
    messageActionFeedback: {},
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
let suppressNextIdentityUpdatedToast = false;
let suppressNextMemoryRefreshToast = false;
const messageActionFeedbackTimers = new Map();
const workspaceToolBridge = {
    callHostTool: null,
    postHostToolCallWithoutResponse: null,
};
const WORKSPACE_KERNEL_RELOAD_KEY = 'xb-assistant-workspace-kernel-reload';

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

function getWorkspaceRuntimeMeta(runtime = state.runtime) {
    const workspace = runtime?.workspace && typeof runtime.workspace === 'object'
        ? runtime.workspace
        : {};
    return {
        version: Number.isFinite(Number(workspace.version)) ? Number(workspace.version) : 0,
        kernelVersion: String(workspace.kernelVersion || '').trim(),
    };
}

function reloadForWorkspaceKernelVersion(expectedVersion = '') {
    const normalizedExpected = String(expectedVersion || '').trim();
    if (!normalizedExpected) return;
    const nextAttempt = Number(sessionStorage.getItem(WORKSPACE_KERNEL_RELOAD_KEY) || '0') + 1;
    sessionStorage.setItem(WORKSPACE_KERNEL_RELOAD_KEY, String(nextAttempt));
    if (nextAttempt > 2) {
        showToast('工作区内核版本缓存不一致，请清除缓存后重试');
        return;
    }
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('kernel', normalizedExpected);
    nextUrl.searchParams.set('kernelReload', String(nextAttempt));
    window.location.replace(nextUrl.toString());
}

function ensureWorkspaceKernelVersion(runtime = state.runtime) {
    const workspace = runtime?.workspace && typeof runtime.workspace === 'object'
        ? runtime.workspace
        : null;
    if (!workspace) return true;
    const expectedVersion = String(workspace.kernelVersion || '').trim();
    if (!expectedVersion || expectedVersion === WORKSPACE_KERNEL_VERSION) {
        sessionStorage.removeItem(WORKSPACE_KERNEL_RELOAD_KEY);
        return true;
    }
    reloadForWorkspaceKernelVersion(expectedVersion);
    return false;
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

async function closeAssistantAfterWorkspaceFlush() {
    const ok = await flushPendingWorkspaceChanges();
    if (!ok) {
        showToast('工作区还有未保存修改，已取消关闭。');
        return false;
    }
    post('xb-assistant:close');
    return true;
}

function renderWorkspaceOnly() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    const workspacePanel = root.querySelector('#xb-assistant-workspace-panel');
    if (!workspacePanel) return;
    if (state.workspacePanelMode === 'memory') {
        ensureSkillSelection({ fallbackToFirst: false });
    } else {
        ensureWorkspaceSelection();
    }
    renderWorkspacePanel(workspacePanel, {
        disabled: state.isBusy,
        onEditorSelectionChange: handleWorkspaceEditorSelectionChange,
    });
    renderContextHint(root, state);
}

function normalizeSkillFiles(skillFiles = []) {
    return normalizeMemoryFiles(skillFiles);
}

function hasOriginalSnapshot(file) {
    return !!file && typeof file.originalContent === 'string';
}

function isTrackedFileModified(file) {
    if (!file) return false;
    if (file.originalContent === null) {
        return true;
    }
    if (typeof file.originalContent === 'string') {
        return String(file.content || '') !== file.originalContent;
    }
    return false;
}

function buildSkillPanelSources(skillFiles = state.skillFiles) {
    return [{
        sourceId: 'assistant-memory',
        label: '记忆区',
        rootPath: 'memory/',
        importedAt: Date.now(),
        directories: ['skills', 'notes'],
        files: normalizeSkillFiles(skillFiles),
    }];
}

function summarizeSkillFiles(skillFiles = state.skillFiles) {
    const normalized = normalizeSkillFiles(skillFiles);
    const modifiedFileCount = normalized.filter((file) => isTrackedFileModified(file)).length;
    return {
        sourceCount: normalized.length ? 1 : 0,
        fileCount: normalized.length,
        modifiedFileCount,
    };
}

function findTrackedFileByPath(sources = [], targetPath = '') {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    if (!normalizedPath) return null;
    for (const source of Array.isArray(sources) ? sources : []) {
        for (const file of Array.isArray(source.files) ? source.files : []) {
            if (String(file.path || '').trim() === normalizedPath) {
                return { source, file };
            }
        }
    }
    return null;
}

function ensureSkillSelection(options = {}) {
    const normalizedSkillFiles = normalizeSkillFiles(state.skillFiles);
    const shouldFallbackToFirst = options.fallbackToFirst !== false;
    state.skillFiles = normalizedSkillFiles;
    const selectedPath = String(state.selectedSkillFilePath || '').trim();
    if (selectedPath && normalizedSkillFiles.some((file) => file.path === selectedPath)) {
        return;
    }
    if (shouldFallbackToFirst) {
        state.selectedSkillFilePath = normalizedSkillFiles[0]?.path || '';
        return;
    }
    state.selectedSkillFilePath = '';
    state.viewerMode = 'current';
    state.mobileWorkspacePane = 'tree';
}

function setWorkspacePanelMode(mode = 'workspace', options = {}) {
    const normalizedMode = mode === 'memory' || mode === 'skills' ? 'memory' : 'workspace';
    if (state.workspacePanelMode === normalizedMode && options.render === false) {
        return;
    }
    state.workspacePanelMode = normalizedMode;
    if (normalizedMode === 'workspace') {
        ensureWorkspaceSelection();
    } else {
        ensureSkillSelection();
    }
    if (options.persist !== false) {
        persistSession();
    }
    if (options.render !== false) {
        renderWorkspaceOnly();
        renderContextHint(document.getElementById(ROOT_ID), state);
    }
}

function selectSkillFile(targetPath = '', options = {}) {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    if (!normalizedPath) return false;
    const normalizedSkillFiles = normalizeSkillFiles(state.skillFiles);
    const selectedFile = normalizedSkillFiles.find((file) => file.path === normalizedPath);
    if (!selectedFile) {
        return false;
    }
    state.skillFiles = normalizedSkillFiles;
    state.isWorkspaceOpen = true;
    state.workspacePanelMode = 'memory';
    state.selectedSkillFilePath = selectedFile.path;
    state.viewerMode = 'current';
    state.selectedTreePath = '';
    state.mobileWorkspacePane = 'viewer';
    if (options.persist !== false) {
        persistSession();
    }
    return true;
}

function updateSkillFileContent(targetPath, content) {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    let changed = false;
    state.skillFiles = normalizeSkillFiles(state.skillFiles).map((file) => {
        if (file.path !== normalizedPath) return file;
        changed = true;
        return {
            ...file,
            content: String(content || ''),
        };
    });
    if (changed) {
        persistSession();
    }
    return changed;
}

function restoreSkillFile(targetPath = '') {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    let changed = false;
    state.skillFiles = normalizeSkillFiles(state.skillFiles).map((file) => {
        if (file.path !== normalizedPath) return file;
        if (!hasOriginalSnapshot(file)) return file;
        changed = true;
        return {
            ...file,
            content: String(file.originalContent || ''),
        };
    });
    if (changed) {
        persistSession();
        renderWorkspaceOnly();
    }
    return changed;
}

function downloadTextFile(content, filename) {
    const blob = new Blob([String(content || '')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename || 'file.txt';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadSkillFile(targetPath = '') {
    const file = normalizeSkillFiles(state.skillFiles).find((item) => item.path === String(targetPath || '').trim());
    if (!file) return false;
    downloadTextFile(file.content || '', file.filename || file.name || 'memory.md');
    return true;
}

function requestHostTool(name, args) {
    const requestId = createRequestId('tool');
    return new Promise((resolve, reject) => {
        let settled = false;
        let timer = null;

        const cleanup = () => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
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

        timer = setTimeout(() => {
            post('xb-assistant:tool-abort', { requestId });
            finishReject(new Error('tool_timeout'));
        }, REQUEST_TIMEOUT_MS);

        pendingToolCalls.set(requestId, {
            cleanup,
            resolve: finishResolve,
            reject: finishReject,
        });

        post('xb-assistant:tool-call', {
            requestId,
            name,
            arguments: args,
        });
    });
}

async function saveSkillFile(targetPath = '') {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    const file = normalizeSkillFiles(state.skillFiles).find((item) => item.path === normalizedPath);
    if (!file) return false;
    try {
        suppressNextMemoryRefreshToast = true;
        suppressNextIdentityUpdatedToast = file.noteKind === 'identity';
        const result = await requestHostTool(TOOL_NAMES.SAVE_SKILL_FILE, {
            path: file.path,
            filename: file.filename,
            memorySection: file.memorySection,
            noteKind: file.noteKind,
            content: file.content,
        });
        if (!result?.ok) {
            showToast(result?.message || result?.error || '记忆文件保存失败');
            return false;
        }
        showToast(`记忆文件已保存：${result.title || result.id || file.filename}`);
        return true;
    } catch (error) {
        showToast(describeError(error));
        return false;
    } finally {
        suppressNextMemoryRefreshToast = false;
        suppressNextIdentityUpdatedToast = false;
    }
}

function getWorkspacePanelModes() {
    return [
        { key: 'workspace', label: '工作区' },
        { key: 'memory', label: '记忆区' },
    ];
}

function renderWorkspacePanel(container, options = {}) {
    if (state.workspacePanelMode === 'memory') {
        ensureSkillSelection({ fallbackToFirst: false });
        const normalizedSkills = normalizeSkillFiles(state.skillFiles);
        const skillSources = buildSkillPanelSources(normalizedSkills);
        const summary = summarizeSkillFiles(normalizedSkills);
        const rawWorkspaceTree = buildWorkspaceTree(skillSources, {
            selectedSourceId: 'all',
            searchQuery: state.fileSearchQuery,
            modifiedOnly: state.showModifiedOnly,
            isModifiedFile: isTrackedFileModified,
        });
        const workspaceTree = rawWorkspaceTree.nodes.length === 1
            && rawWorkspaceTree.nodes[0]?.type === 'dir'
            && rawWorkspaceTree.nodes[0]?.path === 'memory/'
            ? {
                ...rawWorkspaceTree,
                nodes: rawWorkspaceTree.nodes[0].children || [],
            }
            : rawWorkspaceTree;
        const selectedMatch = findTrackedFileByPath(skillSources, state.selectedSkillFilePath);
        renderWorkspaceUi(container, {
            ...options,
            localSources: skillSources,
            summary,
            workspaceTree,
            selectedMatch,
            panelModes: getWorkspacePanelModes(),
            activePanelMode: 'memory',
            navTitle: '记忆区',
            hideNavActions: true,
            hideTreeActions: true,
            emptyTreeText: summary.fileCount ? '当前筛选下没有记忆文件' : '还没有记忆文件',
            emptyViewerTitle: '还没有选中记忆文件',
            emptyViewerDescription: '从左侧记忆树里点一个文件，我会在这里显示并允许编辑正文。',
            viewerMetaLabel: '记忆区',
            workspaceState: {
                selectedSourceId: 'all',
                selectedFilePath: state.selectedSkillFilePath,
                selectedTreePath: '',
                fileSearchQuery: state.fileSearchQuery,
                showModifiedOnly: state.showModifiedOnly,
                viewerMode: state.viewerMode,
                mobileWorkspacePane: state.mobileWorkspacePane,
                treeExpandedKeys: state.skillTreeExpandedKeys,
            },
            isModifiedFile: isTrackedFileModified,
            hasOriginalSnapshot,
            onSelectPanelMode: (mode) => {
                setWorkspacePanelMode(mode);
            },
            onCloseWorkspace: () => {
                closeWorkspace();
            },
            onSearchChange: (value) => {
                state.fileSearchQuery = String(value || '');
                ensureSkillSelection();
                persistSession();
                renderWorkspaceOnly();
            },
            onToggleModifiedOnly: (value) => {
                state.showModifiedOnly = !!value;
                ensureSkillSelection();
                persistSession();
                renderWorkspaceOnly();
            },
            onToggleNode: (nodeKey) => {
                const next = new Set(Array.isArray(state.skillTreeExpandedKeys) ? state.skillTreeExpandedKeys : []);
                if (next.has(nodeKey)) next.delete(nodeKey);
                else next.add(nodeKey);
                state.skillTreeExpandedKeys = Array.from(next);
                persistSession();
                renderWorkspaceOnly();
            },
            onSelectFile: (targetPath) => {
                selectSkillFile(targetPath);
                renderWorkspaceOnly();
            },
            onSelectNode: () => {},
            onSetViewerMode: (mode) => {
                state.viewerMode = mode;
                persistSession();
                renderWorkspaceOnly();
            },
            onShowTree: () => {
                setMobileWorkspacePane('tree', { render: true });
            },
            onDownloadFile: (targetPath) => {
                downloadSkillFile(targetPath);
            },
            onRestoreFile: (targetPath) => {
                restoreSkillFile(targetPath);
            },
            onUpdateFileContent: (targetPath, content) => updateSkillFileContent(targetPath, content),
            onSaveFile: (targetPath) => {
                void saveSkillFile(targetPath);
            },
            canSaveFile: (file) => isTrackedFileModified(file),
            showDownloadButton: true,
            showRestoreButton: true,
            showRenameButton: false,
            showDeleteButton: false,
            showSaveButton: true,
        });
        return;
    }

    ensureWorkspaceSelection();
    const normalizedSources = normalizeLocalSources(state.localSources);
    const summary = summarizeLocalSources(normalizedSources);
    const workspaceTree = buildWorkspaceTree(normalizedSources, {
        selectedSourceId: 'all',
        searchQuery: state.fileSearchQuery,
        modifiedOnly: state.showModifiedOnly,
        isModifiedFile: isTrackedFileModified,
    });
    const selectedMatch = findTrackedFileByPath(normalizedSources, state.selectedFilePath);
    renderWorkspaceUi(container, {
        ...options,
        localSources: normalizedSources,
        summary,
        workspaceTree,
        selectedMatch,
        panelModes: getWorkspacePanelModes(),
        activePanelMode: 'workspace',
        navTitle: '文件工作区',
        workspaceState: {
            selectedSourceId: 'all',
            selectedFilePath: state.selectedFilePath,
            selectedTreePath: state.selectedTreePath,
            fileSearchQuery: state.fileSearchQuery,
            showModifiedOnly: state.showModifiedOnly,
            viewerMode: state.viewerMode,
            mobileWorkspacePane: state.mobileWorkspacePane,
            treeExpandedKeys: state.treeExpandedKeys,
        },
        isModifiedFile: isTrackedFileModified,
        hasOriginalSnapshot,
        onSelectPanelMode: (mode) => {
            setWorkspacePanelMode(mode);
        },
        onDownloadAll: () => {
            downloadAllLocalSources();
        },
        onClearAll: () => {
            void clearLocalSources();
        },
        onCloseWorkspace: () => {
            closeWorkspace();
        },
        onSearchChange: (value) => {
            state.fileSearchQuery = String(value || '');
            ensureWorkspaceSelection();
            persistSession();
            renderWorkspaceOnly();
        },
        onToggleModifiedOnly: (value) => {
            state.showModifiedOnly = !!value;
            ensureWorkspaceSelection();
            persistSession();
            renderWorkspaceOnly();
        },
        onToggleNode: (nodeKey) => {
            const next = new Set(Array.isArray(state.treeExpandedKeys) ? state.treeExpandedKeys : []);
            if (next.has(nodeKey)) next.delete(nodeKey);
            else next.add(nodeKey);
            state.treeExpandedKeys = Array.from(next);
            persistSession();
            renderWorkspaceOnly();
        },
        onSelectFile: (targetPath) => {
            selectWorkspaceFile(targetPath, {
                preserveSourceFilter: true,
                preserveSearch: true,
                preserveModifiedOnly: true,
            });
            renderWorkspaceOnly();
        },
        onSelectNode: (targetPath) => {
            selectWorkspaceNode(targetPath);
        },
        onSetViewerMode: (mode) => {
            state.viewerMode = mode;
            ensureWorkspaceSelection();
            persistSession();
            renderWorkspaceOnly();
        },
        onShowTree: () => {
            setMobileWorkspacePane('tree', { render: true });
        },
        onDownloadFile: (targetPath) => {
            downloadLocalFile(targetPath);
        },
        onRestoreFile: (targetPath) => {
            void restoreLocalFile(targetPath);
        },
        onUpdateFileContent: (targetPath, content, nextOptions = {}) => updateLocalFileContent(targetPath, content, nextOptions),
        onCreateFile: (targetPath) => {
            void createLocalFileAt(targetPath);
        },
        onCreateDirectory: (targetPath) => {
            void createLocalDirectoryAt(targetPath);
        },
        onRenamePath: (targetPath) => {
            void renameLocalPath(targetPath);
        },
        onDeletePath: (targetPath) => {
            void deleteLocalPath(targetPath);
        },
        showDownloadButton: true,
        showRestoreButton: true,
        showRenameButton: true,
        showDeleteButton: true,
        showSaveButton: false,
    });
}

function openWorkspacePanelTarget(targetPath = '') {
    const normalizedPath = String(targetPath || '').trim().replace(/\\/g, '/');
    if (!normalizedPath) {
        openWorkspace(state.selectedFilePath);
        return true;
    }
    if (normalizedPath.startsWith('memory/') || normalizedPath.startsWith('skills/')) {
        const opened = selectSkillFile(normalizedPath);
        if (!opened) {
            showToast(`没有找到 ${normalizedPath}`);
            return false;
        }
        render();
        return true;
    }
    return openWorkspace(normalizedPath);
}

function toggleWorkspacePanel() {
    if (state.isWorkspaceOpen) {
        closeWorkspace();
        return;
    }
    if (state.workspacePanelMode === 'memory') {
        ensureSkillSelection();
        if (state.selectedSkillFilePath) {
            selectSkillFile(state.selectedSkillFilePath, { persist: false });
            render();
            return;
        }
    }
    openWorkspace(state.selectedFilePath);
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
    onWorkspaceSelectionChanged: () => {
        clearWorkspaceSelectionContext();
        renderContextHint(document.getElementById(ROOT_ID), state);
    },
    post,
    callHostTool: (...args) => workspaceToolBridge.callHostTool?.(...args),
    postHostToolCallWithoutResponse: (...args) => workspaceToolBridge.postHostToolCallWithoutResponse?.(...args),
    renderWorkspaceUi,
});

const {
    normalizeLocalSources,
    summarizeLocalSources,
    appendLocalSourceFiles,
    clearLocalSources,
    applyExternalLocalSources,
    openWorkspace,
    closeWorkspace,
    setWorkspaceWidth,
    ensureWorkspaceSelection,
    getWorkspaceSummary,
    flushPendingWorkspaceChanges,
    postPendingWorkspaceWritesForUnload,
    selectWorkspaceFile,
    selectWorkspaceNode,
    setMobileWorkspacePane,
    updateLocalFileContent,
    downloadLocalFile,
    downloadAllLocalSources,
    restoreLocalFile,
    createLocalFileAt,
    createLocalDirectoryAt,
    renameLocalPath,
    deleteLocalPath,
} = localSourcesManager;

function describeError(error) {
    const raw = String(error?.message || error || 'unknown_error');
    const lowered = raw.toLowerCase();
    const validationErrors = Array.isArray(error?.validation?.errors) ? error.validation.errors : [];

    if (error?.rawDisplay) return String(error.rawDisplay);
    if (isAbortError(error)) return '本轮请求已终止。';
    if (lowered === 'tool_timeout') return '工具调用超时了（180 秒），可以重试，或把问题收窄一点。';
    if (lowered.startsWith('workspace_write_failed:')) return '工作区写入失败，请检查酒馆文件权限或稍后重试。';
    if (lowered.startsWith('manifest_load_failed:')) return '助手索引文件清单加载失败，请刷新页面后再试。';
    if (lowered.startsWith('file_read_failed:')) return '读取工作区文件失败了，请换个文件再试，或刷新页面重试。';
    if (lowered === 'file_not_indexed') return '这个文件不在当前助手索引范围里。';
    if (lowered === 'local_path_required') return '这个工具只能操作 `local/` 下的会话内临时工作区文件。';
    if (lowered === 'workspace_scope_local_required') return '要读取或搜索 `local/` 工作区，请显式传 `scope: "local"`。';
    if (lowered === 'workspace_scope_local_only') return '当前已切到 `local` 工作区作用域，因此这里只能读取或搜索 `local/` 路径。';
    if (lowered === 'invalid_lookup_scope') return '`scope` 只支持 `project` 或 `local`。';
    if (lowered === 'unsupported_text_file') return '目前只支持文本类工作区文件。';
    if (lowered === 'local_source_not_found') return '源 `local/` 路径不存在，无法完成这次移动。';
    if (lowered === 'local_file_not_found') return '目标 `local/` 文件不存在；可以先用 Write 新建。';
    if (lowered === 'directory_not_found') return '目标目录不存在。';
    if (lowered === 'local_path_not_found') return '目标 `local/` 路径不存在。';
    if (lowered === 'local_parent_path_blocked') return '目标父路径已是文件，不能在文件下面创建或移动子项。';
    if (lowered === 'local_source_equals_destination') return '源路径和目标路径相同，这次移动没有实际变化。';
    if (lowered === 'local_destination_exists') return '目标路径已经存在；请换一个路径，或显式允许覆盖。';
    if (lowered === 'workspace_invariant_failed') {
        const fileDirectoryConflict = validationErrors.find((entry) => String(entry || '').startsWith('file_directory_conflict:'));
        if (fileDirectoryConflict) {
            return '路径与现有文件/目录结构冲突：某个父路径已经是文件，不能再作为目录使用。';
        }
        return '工作区路径结构冲突，无法完成这次操作。';
    }
    if (lowered.startsWith('apply_patch_parse_error:')) return 'apply_patch 补丁格式无效。';
    if (lowered.startsWith('apply_patch_apply_error:')) return 'apply_patch 无法在目标文件中定位补丁上下文。';
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
    normalizeJsApiPermission,
    normalizePermissionMode,
    normalizeReasoningEffort,
    normalizeAssistantConfig,
    normalizePresetName,
    buildDefaultPreset,
    cloneDefaultModelConfigs,
    defaultPresetName: DEFAULT_PRESET_NAME,
    requestTimeoutMs: REQUEST_TIMEOUT_MS,
    toolModeOptions: TOOL_MODE_OPTIONS,
    jsApiPermissionOptions: JS_API_PERMISSION_OPTIONS,
    permissionModeOptions: PERMISSION_MODE_OPTIONS,
    reasoningEffortOptions: REASONING_EFFORT_OPTIONS,
});

const {
    getActiveProviderConfig,
    syncConfigToForm,
    bindSettingsPanelEvents,
} = settingsPanel;

function isJsApiPermissionEnabled() {
    return normalizeJsApiPermission(state.config?.jsApiPermission) === 'allow';
}

function getEnabledToolDefinitions() {
    if (isJsApiPermissionEnabled()) {
        return TOOL_DEFINITIONS;
    }
    return TOOL_DEFINITIONS.filter((tool) => tool?.function?.name !== TOOL_NAMES.RUN_JAVASCRIPT_API);
}

const chatUi = createChatUi({
    state,
    toolNames: TOOL_NAMES,
    formatToolResultDisplay,
    normalizeThoughtBlocks,
    normalizeAttachments,
    renderAttachmentGallery,
    onLocalPathClick: (path) => {
        return openWorkspacePanelTarget(path);
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
    if (!providerConfig.apiKey && providerConfig.provider !== 'sillytavern-openai-compatible') {
        throw new Error('请先在小白助手里填写当前提供商的 API Key。');
    }

    switch (providerConfig.provider) {
        case 'sillytavern-openai-compatible':
            return new SillyTavernOpenAICompatibleAdapter(providerConfig);
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
    const permissionPrompt = buildPermissionModePrompt(state.config?.permissionMode, state.config?.jsApiPermission);
    const sections = [SYSTEM_PROMPT];
    if (permissionPrompt) {
        sections.push(permissionPrompt);
    }
    if (skillsPromptSummary) {
        sections.push([
            '# Injected Skills Summary',
            skillsPromptSummary,
        ].join('\n'));
    }
    if (identityContent) {
        sections.push([
            '# Injected Identity Memory',
            identityContent,
        ].join('\n'));
    }
    return sections.filter(Boolean).join('\n\n');
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

function resolveTextareaSelectionLines(value = '', selectionStart = 0, selectionEnd = 0) {
    const text = String(value || '');
    const start = Math.max(0, Math.min(text.length, Number(selectionStart) || 0));
    const end = Math.max(0, Math.min(text.length, Number(selectionEnd) || 0));
    const lower = Math.min(start, end);
    const upper = Math.max(start, end);
    const lineStart = text.slice(0, lower).split('\n').length;
    const lineEnd = text.slice(0, upper).split('\n').length;
    return {
        lineStart: String(lineStart || ''),
        lineEnd: String(lineEnd || ''),
    };
}

function handleWorkspaceEditorSelectionChange(payload = {}) {
    const filePath = String(payload.filePath || '').trim();
    const root = document.getElementById(ROOT_ID);
    const activeFilePath = state.workspacePanelMode === 'memory'
        ? String(state.selectedSkillFilePath || '').trim()
        : String(state.selectedFilePath || '').trim();
    if (!filePath || filePath !== activeFilePath) return;
    const selectionStart = Math.max(0, Number(payload.selectionStart) || 0);
    const selectionEnd = Math.max(0, Number(payload.selectionEnd) || 0);
    const lineStart = String(payload.lineStart || '').trim();
    const lineEnd = String(payload.lineEnd || '').trim();
    const isCollapsed = 'collapsed' in payload ? !!payload.collapsed : selectionStart === selectionEnd;
    const userInteracted = !!payload.userInteracted;
    if (isCollapsed) {
        if (userInteracted && lineStart) {
            const nextSelectionContext = normalizeWorkspaceSelectionContext({
                filePath,
                viewerMode: 'current',
                lineStart,
                lineEnd: lineEnd || lineStart,
                text: '',
            });
            const prevSelectionContext = normalizeWorkspaceSelectionContext(state.workspaceSelectionContext);
            if (JSON.stringify(prevSelectionContext) !== JSON.stringify(nextSelectionContext)) {
                state.workspaceSelectionContext = nextSelectionContext;
                renderContextHint(root, state);
            }
            return;
        }
        if (state.workspaceSelectionContext?.text) {
            clearWorkspaceSelectionContext();
            renderContextHint(root, state);
            return;
        }
        return;
    }
    const value = String(payload.value || '');
    const lower = Math.min(selectionStart, selectionEnd);
    const upper = Math.max(selectionStart, selectionEnd);
    const selectedText = trimContextSnippet(value.slice(lower, upper), 600);
    if (!selectedText) {
        if (state.workspaceSelectionContext?.text) {
            clearWorkspaceSelectionContext();
            renderContextHint(root, state);
        }
        return;
    }
    const lines = resolveTextareaSelectionLines(value, selectionStart, selectionEnd);
    const nextSelectionContext = normalizeWorkspaceSelectionContext({
        filePath,
        viewerMode: 'current',
        lineStart: lines.lineStart,
        lineEnd: lines.lineEnd,
        text: selectedText,
    });
    const prevSelectionContext = normalizeWorkspaceSelectionContext(state.workspaceSelectionContext);
    if (JSON.stringify(prevSelectionContext) === JSON.stringify(nextSelectionContext)) {
        return;
    }
    state.workspaceSelectionContext = nextSelectionContext;
    renderContextHint(root, state);
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
    return buildWorkspaceUserContextTextForState(state);
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
    getToolDefinitions: getEnabledToolDefinitions,
    isJsApiEnabled: isJsApiPermissionEnabled,
    getActiveProviderConfig,
    getSystemPrompt: getInjectedSystemPrompt,
    getEphemeralUserContextText,
    flushPendingWorkspaceChanges,
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
    callHostTool,
    postHostToolCallWithoutResponse,
} = runtime;

workspaceToolBridge.callHostTool = callHostTool;
workspaceToolBridge.postHostToolCallWithoutResponse = postHostToolCallWithoutResponse;

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
        renderWorkspace: renderWorkspacePanel,
        onRemoveDraftAttachment: (index) => {
            state.draftAttachments = state.draftAttachments.filter((_, itemIndex) => itemIndex !== index);
            render();
        },
        onOpenWorkspace: () => {
            toggleWorkspacePanel();
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
    const isSelectionInsideWorkspace = (selection) => !!(
        selection
        && workspacePanel
        && workspacePanel.contains(selection.anchorNode)
        && workspacePanel.contains(selection.focusNode)
    );
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
        if (state.viewerMode === 'current' && state.selectedFilePath) {
            return;
        }
        const selection = selectionDocument.getSelection?.();
        if (!selection || selection.rangeCount <= 0) {
            return;
        }
        const selectionInsideWorkspace = isSelectionInsideWorkspace(selection);
        if (selection.isCollapsed) {
            if (selectionInsideWorkspace && state.workspaceSelectionContext?.text) {
                clearWorkspaceSelectionContext();
                refreshContextHint();
            }
            return;
        }
        if (!selectionInsideWorkspace) {
            return;
        }
        const selectedText = trimContextSnippet(selection.toString(), 600);
        if (!selectedText) {
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
    const resolveWorkspaceWidth = (width) => {
        const minWorkspaceWidth = 360;
        const minConversationWidth = 120;
        const layoutGap = 16;
        const requestedWidth = Math.round(Number(width) || 520);
        const mainBody = root.querySelector('.xb-assistant-main-body');
        if (!mainBody) {
            return Math.max(minWorkspaceWidth, Math.min(960, requestedWidth));
        }
        const maxWorkspaceWidth = Math.max(
            minWorkspaceWidth,
            Math.round(mainBody.clientWidth - minConversationWidth - layoutGap),
        );
        return Math.max(minWorkspaceWidth, Math.min(maxWorkspaceWidth, requestedWidth));
    };
    const applyWorkspaceWidthPreview = (width) => {
        const normalizedWidth = resolveWorkspaceWidth(width);
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
        void closeAssistantAfterWorkspaceFlush();
    });

    root.querySelector('#xb-assistant-open-workspace')?.addEventListener('click', () => {
        toggleWorkspacePanel();
    });

    root.querySelector('#xb-assistant-workspace-backdrop')?.addEventListener('click', () => {
        closeWorkspace();
        clearWorkspaceSelectionContext();
    });

    root.querySelector('#xb-assistant-workspace-resizer')?.addEventListener('mousedown', (event) => {
        if (window.matchMedia('(max-width: 900px)').matches) return;
        workspaceResizeActive = true;
        workspaceResizeStartX = event.clientX;
        const workspaceShell = root.querySelector('#xb-assistant-workspace');
        const currentWidth = Math.round(workspaceShell?.getBoundingClientRect?.().width || 0);
        workspaceResizeStartWidth = currentWidth || Number(state.workspaceWidth) || 520;
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

    const flashMessageActionButton = (messageIndex, action, copied) => {
        if (!Number.isInteger(messageIndex) || messageIndex < 0 || !action) return;
        const feedbackKey = `${action}:${messageIndex}`;
        if (messageActionFeedbackTimers.has(feedbackKey)) {
            clearTimeout(messageActionFeedbackTimers.get(feedbackKey));
            messageActionFeedbackTimers.delete(feedbackKey);
        }
        state.messageActionFeedback = {
            ...(state.messageActionFeedback || {}),
            [feedbackKey]: copied ? 'success' : 'error',
        };
        render();
        const timer = window.setTimeout(() => {
            messageActionFeedbackTimers.delete(feedbackKey);
            if (!state.messageActionFeedback || !Object.prototype.hasOwnProperty.call(state.messageActionFeedback, feedbackKey)) {
                return;
            }
            const nextFeedback = { ...(state.messageActionFeedback || {}) };
            delete nextFeedback[feedbackKey];
            state.messageActionFeedback = nextFeedback;
            render();
        }, 1200);
        messageActionFeedbackTimers.set(feedbackKey, timer);
    };

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
            flashMessageActionButton(messageIndex, action, copied);
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
        state.historySummary = '';
        state.archivedTurnCount = 0;
        state.pendingApproval = null;
        state.editingMessageIndex = -1;
        resetCompactionState();
        await clearSession();
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
    if (data.type === 'xb-assistant:prepare-close') {
        void closeAssistantAfterWorkspaceFlush();
        return;
    }
    if (data.type === 'xb-assistant:config') {
        const hostRequestHeaders = data.payload?.hostRequestHeaders && typeof data.payload.hostRequestHeaders === 'object'
            ? data.payload.hostRequestHeaders
            : {};
        setHostChatCompletionsRequestHeadersProvider(() => hostRequestHeaders);
        state.runtime = data.payload?.runtime || null;
        if (!ensureWorkspaceKernelVersion(state.runtime)) return;
        state.skillFiles = normalizeSkillFiles(data.payload?.runtime?.skillFiles || []);
        if (state.workspacePanelMode === 'memory') {
            ensureSkillSelection();
        }
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
        if (suppressNextIdentityUpdatedToast) {
            suppressNextIdentityUpdatedToast = false;
        } else {
            showToast('身份设定已更新');
        }
        return;
    }

    if (data.type === 'xb-assistant:skills-updated') {
        state.skillFiles = normalizeSkillFiles(data.payload?.skillFiles || []);
        state.runtime = {
            ...(state.runtime || {}),
            skillsCatalog: data.payload?.skillsCatalog || { version: 1, skills: [] },
            skillsPromptSummary: String(data.payload?.skillsPromptSummary || ''),
            skillsCatalogError: String(data.payload?.skillsCatalogError || ''),
            skillFiles: state.skillFiles,
        };
        const focusSkillPath = String(data.payload?.focusSkillPath || '').trim();
        if (focusSkillPath && selectSkillFile(focusSkillPath, { persist: false })) {
            render();
        } else {
            ensureSkillSelection({ fallbackToFirst: false });
            renderWorkspaceOnly();
        }
        if (suppressNextMemoryRefreshToast) {
            suppressNextMemoryRefreshToast = false;
        } else {
            showToast('记忆目录已刷新');
        }
        return;
    }

    if (data.type === 'xb-assistant:editor-context') {
        state.externalEditorContext = normalizeExternalEditorContext(data.payload);
        renderContextHint(document.getElementById(ROOT_ID), state);
        return;
    }

    if (data.type === WORKSPACE_MESSAGE_TYPES.UPDATED) {
        console.info('[Assistant][HostBridge] local-sources-updated:received', summarizeLocalSources(data.payload?.localSources || []));
        state.runtime = {
            ...(state.runtime || {}),
            workspace: {
                ...getWorkspaceRuntimeMeta(),
                version: Number.isFinite(Number(data.payload?.workspaceVersion))
                    ? Number(data.payload.workspaceVersion)
                    : getWorkspaceRuntimeMeta().version,
                kernelVersion: String(data.payload?.kernelVersion || getWorkspaceRuntimeMeta().kernelVersion || WORKSPACE_KERNEL_VERSION),
            },
        };
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

window.addEventListener('beforeunload', () => {
    postPendingWorkspaceWritesForUnload();
    void flushPendingWorkspaceChanges();
});

async function bootstrap() {
    await restoreSession();
    injectAssistantStyles(ROOT_ID);
    render();
    post(WORKSPACE_MESSAGE_TYPES.HYDRATE, {
        localSources: normalizeLocalSources(state.localSources),
        kernelVersion: WORKSPACE_KERNEL_VERSION,
    });
    post('xb-assistant:ready', {
        kernelVersion: WORKSPACE_KERNEL_VERSION,
    });
}

bootstrap().catch((error) => {
    console.error('[Assistant] 启动失败:', error);
    injectAssistantStyles(ROOT_ID);
    render();
    post(WORKSPACE_MESSAGE_TYPES.HYDRATE, {
        localSources: normalizeLocalSources(state.localSources),
        kernelVersion: WORKSPACE_KERNEL_VERSION,
    });
    post('xb-assistant:ready', {
        kernelVersion: WORKSPACE_KERNEL_VERSION,
    });
});
