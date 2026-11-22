import {
    TOOL_DEFINITIONS,
    TOOL_NAMES,
    formatToolResultDisplay,
    getAssistantToolDefinitions,
} from './tooling.js';
import { createAssistantRuntime } from './runtime.js';
import { settleAssistantRunFailure } from './runtime/run-failure.js';
import { buildCurrentPlansContextText } from '../../agent-core/current-plans.js';
import { mergeThoughtBlocks } from '../../agent-core/runtime/protocol.js';
import { resetMessageWindow } from '../../agent-core/ui/message-windowing.js';
import {
    createAgentAdapter,
} from '../../agent-core/provider-config.js';
import { buildWorkspaceUserContextTextForState } from './context/current-context.js';
import { readableCardWorkspacePath } from '../../card-workspace/paths.js';
import { INVALID_LOOKUP_SCOPE, describeInvalidLookupScope } from '../shared/lookup-scope.js';
import { normalizeMemoryFiles } from './memory/memory-files.js';
import {
    DEFAULT_PRESET_NAME,
    normalizeJsApiPermission,
    normalizeAssistantConfig,
} from '../../agent-core/config.js';
import {
    normalizeSlashCommand,
    normalizeSlashSkillTrigger,
    shouldRequireSlashCommandApproval,
} from './slash-command-policy.js';
import { createSessionStore } from './state/session-store.js';
import { createWorkspaceStore } from './workspace/workspace-store.js';
import { closeAssistantWorkspace } from './workspace/workspace-lifecycle.js';
import { ACTIVITY_COPY } from './ui/activity-copy.js';
import { isAssistantMobileDevice, shouldAutoRevealWorkspace } from '../shared/window-layout.js';
import { isLocalSourceFileModified } from '../shared/local-workspace-kernel.js';
import { locateFile } from '../../card-workspace/files.js';
import { COPY as CARD_COPY } from '../../card-workspace/copy.js';
import { createAttachmentsManager } from './attachments.js';
import { applyWorkspaceLayout, renderAppChrome, renderContextHint, resolveWorkspaceWidth } from './ui/app-chrome.js';
import { createSettingsPopoverGroup } from './ui/settings-popover-group.js';
import { bindDeliveryPanel } from '../plugins/delivery/panel.js';
import { deliverySettingsForRun, loadDeliverySettings, saveDeliverySettings } from '../plugins/delivery/settings.js';
import { deliveredText } from '../plugins/delivery/history.js';
import { bindApiPopover } from './ui/api-entry.js';
import { bindContextMeter, renderContextMeter } from './ui/context-meter.js';
import { buildAppMarkup as buildAssistantAppMarkup } from './ui/app-shell.js';
import { createChatUi } from './ui/chat-ui.js';
import { MESSAGE_ACTION_COPY } from './ui/message-actions.js';
import { getMessageActions, getRerollUserIndex } from './state/message-actions.js';
import { rewindUserTurn } from './state/compaction-history.js';
import { createSettingsPanel } from './ui/settings-panel.js';
import { syncAgentSettingsPanelFeedback } from '../../agent-core/ui/settings-markup.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import { createLocalSourcesManager } from './workspace/local-sources.js';
import { buildWorkspaceTree } from './workspace/local-workspace-tree.js';
import { WORKSPACE_COPY } from './workspace/workspace-copy.js';
import {
    renderWorkspace as renderWorkspaceUi,
    relocateWorkspaceEditor,
} from './workspace/local-workspace-ui.js';
import { injectAssistantStyles } from './styles.js';
import {
    HISTORY_SUMMARY_PREFIX,
    SYSTEM_PROMPT,
    buildPermissionModePrompt,
} from './prompts/system-prompt.js';
import {
    WORKSPACE_KERNEL_VERSION,
    WORKSPACE_MESSAGE_TYPES,
} from '../shared/workspace-protocol.js';
import { createPlanLedger } from '../../agent-core/plan-ledger.js';
import { plansTable as assistantPlansTable } from './state/session-db.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';


const SOURCE = 'xb-assistant-app';
const ROOT_ID = 'xb-assistant-root';
const REQUEST_TIMEOUT_MS = 180000;
const MAX_CONTEXT_TOKENS = 258000;
const SUMMARY_TRIGGER_TOKENS = 228000;
const MAX_IMAGE_ATTACHMENTS = 3;
const MAX_IMAGE_FILE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const TOAST_DURATION_MS = 2600;
const TOAST_DURATION_MIN_MS = 1800;
const TOAST_DURATION_MAX_MS = 4200;
const CONFIG_SAVE_TIMEOUT_MS = 5000;
const CONFIG_SAVE_RESULT_MS = 1800;
const CONTEXT_STATS_RENDER_THROTTLE_MS = 600;
const currentPlanContextLedger = createPlanLedger({ plansTable: assistantPlansTable });
const state = {
    config: null,
    configLoadError: '',
    configDraft: null,
    configDirty: false,
    runtime: null,
    workspaceDrafts: {},
    pendingApproval: null,
    assistantSessionId: '',
    messages: [],
    compactions: [],
    compactionPending: false,
    archivedSkillIds: [],
    contextStats: {
        usedTokens: 0,
        budgetTokens: MAX_CONTEXT_TOKENS,
        summaryActive: false,
    },
    isBusy: false,
    isPreparingRun: false,
    isClearingConversation: false,
    isClosingAssistant: false,
    currentRound: 0,
    progressLabel: '',
    activeRun: null,
    autoScroll: true,
    uiMessageWindowLimit: 5,
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
    treeExpandedKeys: [],
    skillTreeExpandedKeys: [],
    // Only narrow screens use this: the sidebar becomes a closed-by-default drawer.
    sidebarCollapsed: true,
    configPage: 'main',
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
const pendingHostRequests = new Map();
const pendingApprovals = new Map();
let toastTimer = null;
let configSaveTimeout = null;
let configSaveResetTimer = null;
let suppressNextIdentityUpdatedToast = false;
let suppressNextMemoryRefreshToast = false;
const messageActionFeedbackTimers = new Map();
let contextStatsRenderTimer = null;
let lastContextStatsRenderAt = 0;
const workspaceToolBridge = {
    callHostTool: null,
};
const WORKSPACE_KERNEL_RELOAD_KEY = 'xb-assistant-workspace-kernel-reload';

function post(type, payload = {}) {
    parent.postMessage({ source: SOURCE, type, payload }, window.location.origin);
}

function createRequestId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function requestHost(type, payload = {}, options = {}) {
    const requestId = createRequestId('host');
    post(type, { ...payload, requestId });
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            pendingHostRequests.delete(requestId);
            reject(new Error('host_request_timeout'));
        }, Number(options.timeoutMs) || CONFIG_SAVE_TIMEOUT_MS);
        pendingHostRequests.set(requestId, {
            resolve: (value) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                pendingHostRequests.delete(requestId);
                resolve(value);
            },
            reject: (error) => {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                pendingHostRequests.delete(requestId);
                reject(error);
            },
        });
    });
}

function resolveHostRequest(payload = {}) {
    const entry = pendingHostRequests.get(String(payload.requestId || ''));
    if (!entry) return;
    if (payload.ok === false) {
        entry.reject(new Error(payload.error || 'host_request_failed'));
    } else {
        entry.resolve(payload);
    }
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
const workspaceStore = createWorkspaceStore({ state });

async function persistWorkspaceUiState() {
    const result = await workspaceStore.persistWorkspaceUiState();
    if (!result.ok) showToast(WORKSPACE_COPY.saveFailed(result.error));
    return result;
}

function persistSession() {
    return sessionStore?.persistSession();
}

async function saveHistoryEdit(next) {
    const { messages, compactions, archivedSkillIds } = state;
    Object.assign(state, next);
    let saved;
    try {
        saved = await persistSession();
        return saved;
    } finally {
        if (!saved?.ok) Object.assign(state, { messages, compactions, archivedSkillIds });
    }
}

function clearSession() {
    return sessionStore?.clearSession();
}

function restoreSession() {
    return sessionStore?.restoreSession();
}

async function closeAssistantAfterWorkspaceFlush() {
    return closeAssistantWorkspace({
        state, cancelRun: () => cancelActiveRun(''),
        flushEditorChanges: flushPendingWorkspaceChanges,
        flushHostWrites: () => requestHost(WORKSPACE_MESSAGE_TYPES.FLUSH),
        workspaceStore, hasPendingChanges: hasPendingWorkspaceChanges,
        close: () => post('xb-assistant:close'), render, showToast, describeError,
    });
}

function getWorkspaceContainers(root) {
    return {
        nav: root.querySelector('#xb-assistant-workspace-nav'),
        viewer: root.querySelector('#xb-assistant-workspace-panel'),
    };
}

function renderWorkspaceOnly() {
    const root = document.getElementById(ROOT_ID);
    if (!root?.querySelector('#xb-assistant-workspace-nav')) return;
    if (state.workspacePanelMode === 'memory') {
        ensureSkillSelection({ fallbackToFirst: false });
    } else {
        ensureWorkspaceSelection();
    }
    applyWorkspaceLayout(root, state);
    renderWorkspacePanel(getWorkspaceContainers(root), {
        disabled: state.isBusy || state.isClosingAssistant,
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

const isTrackedFileModified = isLocalSourceFileModified;

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
        observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "setWorkspacePanelMode" });
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
    if (options.reveal !== false) state.isWorkspaceOpen = true;
    state.workspacePanelMode = 'memory';
    state.selectedSkillFilePath = selectedFile.path;
    state.viewerMode = 'current';
    state.selectedTreePath = '';
    if (options.persist !== false) {
        observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "selectSkillFile" });
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
        observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "updateSkillFileContent" });
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
        observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "restoreSkillFile" });
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

async function editCardFiles(path = '') {
    try {
        if (!await flushPendingWorkspaceChanges()) return;
        const result = await requestHostTool(TOOL_NAMES.CARD_FILES, path ? { action: 'save', paths: [path] } : { action: 'open' });
        if (path) {
            showToast(result.ok ? (result.results.some(item => item.hasUnsavedEdits) ? CARD_COPY.savedLater : CARD_COPY.saved)
                : result.results.filter(item => !item.saved).map(item => item.error).join('\n'));
            const moved = result.results.find(item => item.saved && item.fromPath === path);
            if (moved) openWorkspacePanelTarget(moved.path);
        }
        else {
            openWorkspacePanelTarget(`${result.root}card.json`);
            if (result.warnings?.length) showToast(result.warnings.map(item => item.message).join('\n'));
        }
    } catch (error) { showToast(describeError(error)); }
}

function renderWorkspacePanel(containers, options = {}) {
    options = { ...options, showViewer: !!state.isWorkspaceOpen };
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
        renderWorkspaceUi(containers, {
            ...options,
            localSources: skillSources,
            summary,
            workspaceTree,
            selectedMatch,
            activePanelMode: 'memory',
            emptyTreeText: summary.fileCount ? WORKSPACE_COPY.emptyFilter : WORKSPACE_COPY.emptyMemory,
            workspaceState: {
                selectedSourceId: 'all',
                selectedFilePath: state.selectedSkillFilePath,
                selectedTreePath: '',
                fileSearchQuery: state.fileSearchQuery,
                showModifiedOnly: state.showModifiedOnly,
                viewerMode: state.viewerMode,
                treeExpandedKeys: state.skillTreeExpandedKeys,
            },
            isModifiedFile: isTrackedFileModified,
            onSelectPanelMode: (mode) => {
                setWorkspacePanelMode(mode);
            },
            onCloseWorkspace: () => {
                closeWorkspace();
            },
            onSearchChange: (value) => {
                state.fileSearchQuery = String(value || '');
                ensureSkillSelection();
                observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "onSearchChange" });
                renderWorkspaceOnly();
            },
            onToggleModifiedOnly: (value) => {
                state.showModifiedOnly = !!value;
                ensureSkillSelection();
                observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: 'onToggleModifiedOnly' });
                renderWorkspaceOnly();
            },
            onToggleNode: (nodeKey) => {
                const next = new Set(Array.isArray(state.skillTreeExpandedKeys) ? state.skillTreeExpandedKeys : []);
                if (next.has(nodeKey)) next.delete(nodeKey);
                else next.add(nodeKey);
                state.skillTreeExpandedKeys = Array.from(next);
                observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "onToggleNode" });
                renderWorkspaceOnly();
            },
            onSelectFile: (targetPath) => {
                selectSkillFile(targetPath);
                renderWorkspaceOnly();
            },
            onSelectNode: () => {},
            onSetViewerMode: (mode) => {
                state.viewerMode = mode;
                observeBackgroundTask(persistWorkspaceUiState(), { source: import.meta.url, operation: "onSetViewerMode" });
                renderWorkspaceOnly();
            },
            onDownloadFile: (targetPath) => {
                downloadSkillFile(targetPath);
            },
            onRestoreFile: (targetPath) => {
                restoreSkillFile(targetPath);
            },
            onUpdateFileContent: (targetPath, content) => updateSkillFileContent(targetPath, content),
            primaryFileActions: file => isTrackedFileModified(file)
                ? [{ action: 'save-file', label: WORKSPACE_COPY.save, primary: true, callback: path => observeBackgroundTask(saveSkillFile(path), { source: import.meta.url, operation: 'onSaveFile' }) }]
                : [],
        });
        return;
    }

    localSourcesManager.renderWorkspace(containers, {
        ...options,
        activePanelMode: 'workspace',
        onSelectPanelMode: mode => setWorkspacePanelMode(mode),
        createMenuItems: [{ label: CARD_COPY.openCurrent, hint: CARD_COPY.openHint,
            onSelect: () => observeBackgroundTask(editCardFiles(), { source: import.meta.url, operation: 'openCardFiles' }) }],
        primaryFileActions: file => {
            const target = locateFile(file.path);
            if (!target) return [];
            return [
                ...(target.kind === 'variables' ? [
                    { action: 'state3-check', label: CARD_COPY.checkRules, callback: path => openVariableWorkbench(path, 'rules') },
                    { action: 'state3-test', label: CARD_COPY.testRules, callback: path => openVariableWorkbench(path, 'test') },
                ] : []),
                { action: 'save-file', label: CARD_COPY.save, primary: true,
                    callback: path => observeBackgroundTask(editCardFiles(path), { source: import.meta.url, operation: 'saveCardFile' }) },
            ];
        },
    });
}

function openVariableWorkbench(path, tab) {
    observeBackgroundTask((async () => {
        if (!await flushPendingWorkspaceChanges()) return;
        post('xb-assistant:state3-workbench', { path, tab });
    })(), { source: import.meta.url, operation: 'openVariableWorkbench' });
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

function normalizeThoughtBlocks(thoughts) {
    return mergeThoughtBlocks(thoughts);
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
        settingsPanel.completePresetSave(requestId, { ok: false });
        render();
        scheduleConfigSaveReset();
    }, CONFIG_SAVE_TIMEOUT_MS);
    render();
}

function completeConfigSave(requestId, { ok, error = '' } = {}) {
    if (requestId && state.configSave.requestId && state.configSave.requestId !== requestId) {
        return;
    }
    if (!ok) settingsPanel.completePresetSave(requestId, { ok: false });
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
    persistWorkspaceUiState,
    onWorkspaceClosed: clearWorkspaceSelectionContext,
    onWorkspaceDirectoryChanged: (fromPath, toPath) => {
        relocateWorkspaceEditor(document.getElementById('xb-assistant-workspace-panel'), fromPath, toPath);
        clearWorkspaceSelectionContext();
    },
    onWorkspaceSelectionChanged: () => {
        clearWorkspaceSelectionContext();
        renderContextHint(document.getElementById(ROOT_ID), state);
    },
    post,
    callHostTool: (...args) => workspaceToolBridge.callHostTool?.(...args),
    renderWorkspaceUi,
});

const {
    normalizeLocalSources,
    summarizeLocalSources,
    appendLocalSourceFiles,
    applyExternalLocalSources,
    openWorkspace,
    closeWorkspace,
    setWorkspaceWidth,
    ensureWorkspaceSelection,
    getWorkspaceSummary,
    flushPendingWorkspaceChanges,
    hasPendingWorkspaceChanges,
    captureRunWorkspaceBaseline,
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
    if (lowered === INVALID_LOOKUP_SCOPE) return describeInvalidLookupScope();
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
    if (lowered === 'tool_result_expired') return ACTIVITY_COPY.resultExpired;
    if (lowered === 'tool_result_range_invalid') return ACTIVITY_COPY.resultRangeInvalid;
    return raw;
}

const settingsPanel = createSettingsPanel({
    state,
    render,
    showToast,
    createRequestId,
    describeError,
    saveConfig: ({ requestId, payload }) => {
        beginConfigSave(requestId);
        post('xb-assistant:save-config', { ...payload, requestId });
    },
    getRuntimeSummaryText: ({ draft, providerLabel }) => state.runtime
        ? `预设「${draft.currentPresetName || DEFAULT_PRESET_NAME}」 · ${providerLabel} · 已索引 ${state.runtime.indexedFileCount || 0} 个前端源码文件`
        : providerLabel,
});

const {
    getActiveProviderConfig,
    syncConfigToForm,
    bindSettingsPanelEvents,
} = settingsPanel;

// The sidebar row reflects saved settings, not an unsaved form draft.
function getApiSummary() {
    const presetName = state.config?.currentPresetName || DEFAULT_PRESET_NAME;
    return { presetName, model: state.config?.presets?.[presetName]?.model || '' };
}

function isJsApiPermissionEnabled() {
    return normalizeJsApiPermission(state.config?.jsApiPermission) === 'allow';
}

function getEnabledToolDefinitions(options = {}) {
    const role = options.role === 'delegate' ? 'delegate' : 'main';
    const providerConfig = getActiveProviderConfig(role === 'delegate' ? { role: 'delegate' } : {});
    return getAssistantToolDefinitions({ providerConfig, jsApiEnabled: isJsApiPermissionEnabled(), role, skillIds: options.skillIds || [] });
}

const chatUi = createChatUi({
    state,
    getToolActivity: call => runtime.getToolActivity(call),
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
    revealOlderMessages,
    updateChatScrollButtonsVisibility,
    handleAssistantChatScroll,
    copyText,
} = chatUi;

function createAdapter(providerConfig = getActiveProviderConfig()) {
    return createAgentAdapter(providerConfig);
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
    const filePath = readableCardWorkspacePath(context.filePath);

    const lines = ['[Current context]'];
    if (context.filePath) {
        lines.push(`用户当前打开了文件：${filePath}`);
    }
    if (context.lineStart) {
        lines.push(
            context.filePath
                ? (
                    context.lineEnd && context.lineEnd !== context.lineStart
                        ? `用户当前选中了 ${filePath} 的第 ${context.lineStart} 到 ${context.lineEnd} 行：`
                        : `用户当前选中了 ${filePath} 的第 ${context.lineStart} 行：`
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

async function getRunUserContextSnapshotText() {
    const currentContextText = getEphemeralUserContextText();
    let currentPlansText = '';
    try {
        currentPlansText = await buildCurrentPlansContextText({
            sessionId: state.assistantSessionId,
            ledger: currentPlanContextLedger,
        });
    } catch (error) {
        console.warn('[Assistant] 读取当前计划失败:', error);
    }
    return [
        currentContextText,
        currentPlansText,
    ].filter(Boolean).join('\n\n').trim();
}

const runtime = createAssistantRuntime({
    state,
    pendingToolCalls,
    pendingApprovals,
    persistSession,
    render: renderActivity,
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
    getDelegateProviderConfig: () => getActiveProviderConfig({ role: 'delegate' }),
    getSystemPrompt: getInjectedSystemPrompt,
    getEphemeralUserContextText,
    flushPendingWorkspaceChanges,
    SYSTEM_PROMPT,
    HISTORY_SUMMARY_PREFIX,
    MAX_CONTEXT_TOKENS,
    SUMMARY_TRIGGER_TOKENS,
    REQUEST_TIMEOUT_MS,
    TOOL_DEFINITIONS,
    TOOL_NAMES,
});

const {
    resetCompactionState,
    buildContextMeterLabel,
    compactionThreshold,
    updateDisplayContextStats,
    pushMessage,
    cancelActiveRun,
    getActiveContextMessages,
    runAssistantLoop,
    callHostTool,
} = runtime;

workspaceToolBridge.callHostTool = callHostTool;

sessionStore = createSessionStore({
    state,
    safeJsonParse,
    createRequestId,
    normalizeAttachments,
    normalizeThoughtBlocks,
    getActiveContextMessages,
});

let deliveryPanel, openApiPopover;

function applyConfig(config) {
    const nextConfig = normalizeAssistantConfig(config || {});
    state.configLoadError = '';
    state.config = nextConfig;
    state.configDraft = null;
    state.configDirty = false;
    requestConfigFormSync();
    render();
}

async function createAssistantRun() {
    const run = {
        id: createRequestId('run'),
        controller: new AbortController(),
        toolRequestIds: new Set(),
        workspaceBaseline: captureRunWorkspaceBaseline(),
        userContextSnapshotText: '',
        cancelNotice: '',
        lightBrakeMessage: '',
        lastLightBrakeKey: '',
        toolErrorStreakKey: '',
        toolErrorStreakCount: 0,
    };
    state.activeRun = run;
    try {
        run.deliverySettings = deliverySettingsForRun(showToast);
        run.userContextSnapshotText = await getRunUserContextSnapshotText();
        return run.controller.signal.aborted ? null : run;
    } catch (error) {
        if (state.activeRun === run) state.activeRun = null;
        throw error;
    } finally {
        if (run.controller.signal.aborted && state.activeRun === run) state.activeRun = null;
    }
}

async function executeAssistantRun(run) {
    if (run.controller.signal.aborted) return;
    state.activeRun = run;
    state.isBusy = true;
    state.currentRound = 0;
    state.progressLabel = '生成中';
    state.autoScroll = true;
    resetMessageWindow(state);
    render();

    try {
        await runAssistantLoop(run);
    } catch (error) {
        settleAssistantRunFailure({ messages: state.messages,
            notice: isAbortError(error) ? run.cancelNotice : error.compactionReported ? '' : describeError(error),
            pushMessage, persistSession });
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

function buildSanitizedHtmlFragment(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${String(html || '')}</body>`, 'text/html');
    const fragment = document.createDocumentFragment();
    Array.from(doc.body.childNodes).forEach((node) => {
        fragment.appendChild(document.importNode(node, true));
    });
    return fragment;
}

function renderCurrentContextMeter(root = document.getElementById(ROOT_ID)) {
    if (!root?.firstChild) return;
    renderContextMeter(root, state, { summaryTriggerTokens: compactionThreshold(), buildContextMeterLabel });
}

function runContextStatsUpdateForRender() {
    contextStatsRenderTimer = null;
    lastContextStatsRenderAt = Date.now();
    updateDisplayContextStats(deliveryPanel?.savedSettings);
    renderCurrentContextMeter();
}

function scheduleContextStatsUpdateForRender() {
    const elapsed = Date.now() - lastContextStatsRenderAt;
    if (elapsed >= CONTEXT_STATS_RENDER_THROTTLE_MS) {
        if (contextStatsRenderTimer) {
            clearTimeout(contextStatsRenderTimer);
            contextStatsRenderTimer = null;
        }
        runContextStatsUpdateForRender();
        return;
    }

    if (!contextStatsRenderTimer) {
        contextStatsRenderTimer = setTimeout(
            runContextStatsUpdateForRender,
            CONTEXT_STATS_RENDER_THROTTLE_MS - elapsed,
        );
    }
}

function renderActivity() {
    const root = document.getElementById(ROOT_ID);
    if (!root?.firstChild) return;
    renderMessages(root.querySelector('#xb-assistant-chat'));
    renderApprovalPanel(root.querySelector('#xb-assistant-approval-slot'));
    updateChatScrollButtonsVisibility(root);
    renderCurrentContextMeter(root);
}

function render() {
    const root = document.getElementById(ROOT_ID);
    if (!root) {
        return;
    }
    if (!state.config) {
        root.textContent = state.configLoadError ? ACTIVITY_COPY.configLoadFailed(state.configLoadError) : '';
        return;
    }
    if (!root.querySelector('#xb-assistant-form')) {
        root.replaceChildren(buildSanitizedHtmlFragment(buildAssistantAppMarkup(state)));
        bindEvents(root);
    }

    if (state.configFormSyncPending) {
        syncConfigToForm(root);
        state.configFormSyncPending = false;
    }
    deliveryPanel.refreshStatus();
    scheduleContextStatsUpdateForRender();
    ensureWorkspaceSelection();
    renderActivity();
    renderAppChrome(root, state, {
        maxImageAttachments: MAX_IMAGE_ATTACHMENTS,
        getWorkspaceSummary,
        renderAttachmentGallery,
        renderWorkspace: options => renderWorkspacePanel(getWorkspaceContainers(root), options),
        apiSummary: getApiSummary(),
        onRemoveDraftAttachment: (index) => {
            state.draftAttachments = state.draftAttachments.filter((_, itemIndex) => itemIndex !== index);
            render();
        },
    });
    syncAgentSettingsPanelFeedback(root, {
        configSave: state.configSave,
        inlineToastText: state.toast,
        isBusy: state.isBusy,
        canDeletePreset: (state.config?.presetNames || []).length > 1,
        configLoadError: state.configLoadError,
    });
}

function bindEvents(root) {
    bindContextMeter(root);
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
        if (state.viewerMode !== 'diff' && state.selectedFilePath) {
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
        const style = getComputedStyle(input);
        const borders = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        input.style.height = `${input.scrollHeight + borders}px`;
    };
    const applyWorkspaceWidthPreview = (width) => {
        const mainBody = root.querySelector('.xb-assistant-main-body');
        const normalizedWidth = resolveWorkspaceWidth(mainBody, width);
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

    // Desktop keeps the sidebar visible; on narrow screens it is a drawer.
    root.querySelector('#xb-assistant-sidebar-toggle')?.addEventListener('click', () => {
        if (state.isWorkspaceOpen) {
            state.sidebarCollapsed = false;
            closeWorkspace();
        } else {
            state.sidebarCollapsed = !state.sidebarCollapsed;
        }
        render();
    });

    root.querySelector('#xb-assistant-mobile-close')?.addEventListener('click', () => {
        observeBackgroundTask(closeAssistantAfterWorkspaceFlush(), { source: import.meta.url, operation: "callback" });
    });

    root.querySelector('#xb-assistant-mobile-minimize')?.addEventListener('click', () => {
        post('xb-assistant:minimize');
    });

    const bindPopover = createSettingsPopoverGroup(root);
    openApiPopover = bindApiPopover(root, bindPopover);
    deliveryPanel = bindDeliveryPanel(root, { load: loadDeliverySettings, save: saveDeliverySettings,
        getProviderConfig: getActiveProviderConfig, bindPopover, onSaved: scheduleContextStatsUpdateForRender });

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
        render();
    });

    root.querySelector('#xb-assistant-chat').addEventListener('scroll', (event) => {
        const container = event.currentTarget;
        if (revealOlderMessages(container)) {
            state.autoScroll = false;
            updateChatScrollButtonsVisibility(root);
            return;
        }
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
        if (state.isClosingAssistant || state.isClearingConversation || state.isPreparingRun || (state.isBusy && action !== 'cancel-edit')) return;
        const message = state.messages[messageIndex];
        const requiredAction = ['save-edit', 'cancel-edit'].includes(action) ? 'edit' : action;
        if (!getMessageActions(state.messages, messageIndex).includes(requiredAction)) return;
        if (requiredAction !== action && state.editingMessageIndex !== messageIndex) return;

        if (action === 'copy') {
            const copied = await copyText(deliveredText(state.messages, messageIndex) ?? String(message.content || ''));
            flashMessageActionButton(messageIndex, action, copied);
            showToast(copied ? MESSAGE_ACTION_COPY.copied : MESSAGE_ACTION_COPY.error.label);
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
            if (!nextContent && !(message.role === 'user' && message.attachments?.length)) {
                showToast(MESSAGE_ACTION_COPY.empty);
                return;
            }
            state.messages[messageIndex] = {
                ...message,
                content: nextContent,
            };
            state.editingMessageIndex = -1;
            const saved = await persistSession();
            showToast(saved.ok ? MESSAGE_ACTION_COPY.updated : MESSAGE_ACTION_COPY.saveFailed(saved.error));
            render();
            return;
        }

        if (action === 'delete') {
            if (state.isBusy) return;
            const wholeTurn = message.role === 'user';
            if (wholeTurn && messageIndex < state.messages.length - 1 && !window.confirm(MESSAGE_ACTION_COPY.deleteTurn)) return;
            state.isPreparingRun = true;
            try {
                const next = wholeTurn ? rewindUserTurn(state, messageIndex, false)
                    : { messages: state.messages.filter((_, index) => index !== messageIndex) };
                const saved = await saveHistoryEdit(next);
                state.editingMessageIndex = -1;
                showToast(saved.ok ? MESSAGE_ACTION_COPY.deleted : MESSAGE_ACTION_COPY.saveFailed(saved.error));
            } catch (error) {
                showToast(MESSAGE_ACTION_COPY.saveFailed(describeError(error)));
            } finally {
                state.isPreparingRun = false;
                render();
            }
            return;
        }

        if (action === 'reroll') {
            if (state.isBusy || state.isPreparingRun) return;
            const turnUserIndex = getRerollUserIndex(state.messages, messageIndex);
            if (turnUserIndex < 0) {
                showToast(MESSAGE_ACTION_COPY.noUserInput);
                return;
            }
            state.isPreparingRun = true;
            try {
                const run = await createAssistantRun();
                if (!run) return;
                state.pendingApproval = null;
                state.editingMessageIndex = -1;
                const saved = await saveHistoryEdit(rewindUserTurn(state, turnUserIndex, true));
                if (!saved.ok) {
                    state.activeRun = null;
                    showToast(MESSAGE_ACTION_COPY.saveFailed(saved.error));
                    render();
                    return;
                }
                render();

                state.isPreparingRun = false;
                await executeAssistantRun(run);
            } catch (error) {
                state.activeRun = null;
                showToast(MESSAGE_ACTION_COPY.saveFailed(describeError(error)));
            } finally {
                state.isPreparingRun = false;
                render();
            }
        }
    };

    root.querySelector('#xb-assistant-chat').addEventListener('click', handleAssistantPanelClick);
    root.querySelector('#xb-assistant-approval-slot')?.addEventListener('click', handleAssistantPanelClick);
    bindSettingsPanelEvents(root);
    root.querySelector('#xb-assistant-tool-mode').addEventListener('change', deliveryPanel.refreshStatus);

    root.querySelector('#xb-assistant-clear').addEventListener('click', async () => {
        if (state.isClosingAssistant || state.isBusy || state.isPreparingRun || state.isClearingConversation) return;
        state.isClearingConversation = true;
        render();
        try {
            if (!await flushPendingWorkspaceChanges()) {
                showToast(WORKSPACE_COPY.pendingBeforeClear);
                return;
            }
            const savedWorkspace = await workspaceStore.flushWorkspace();
            if (!savedWorkspace.ok) {
                showToast(WORKSPACE_COPY.saveFailed(savedWorkspace.error));
                return;
            }
            const result = await clearSession();
            if (!result.ok) {
                showToast(ACTIVITY_COPY.clearFailed(result.error));
                return;
            }
            state.draftAttachments = [];
            state.pendingApproval = null;
            state.editingMessageIndex = -1;
            resetCompactionState();
            showToast(ACTIVITY_COPY.conversationCleared);
        } catch (error) {
            showToast(ACTIVITY_COPY.clearFailed(describeError(error)));
        } finally {
            state.isClearingConversation = false;
            render();
        }
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
        if (state.isClosingAssistant || state.isPreparingRun || state.isClearingConversation) return;
        const value = input.value.trim();
        const attachments = normalizeAttachments(state.draftAttachments);
        if (!value && !attachments.length) return;

        state.isPreparingRun = true;
        try {
            const run = await createAssistantRun();
            if (!run) return;
            resetMessageWindow(state);
            pushMessage({ role: 'user', content: value, attachments });
            input.value = '';
            state.draftAttachments = [];
            state.composeMenuOpen = false;
            resizeComposer();
            render();

            state.editingMessageIndex = -1;
            state.isPreparingRun = false;
            await executeAssistantRun(run);
        } catch (error) {
            showToast(WORKSPACE_COPY.saveFailed(describeError(error)));
        } finally {
            state.isPreparingRun = false;
        }
    });

    input.addEventListener('input', resizeComposer);
    selectionDocument.addEventListener('selectionchange', updateWorkspaceSelectionContextFromDom);

    root.querySelector('#xb-assistant-form').addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && state.composeMenuOpen) {
            event.preventDefault();
            closeComposeMenu();
            composeMenuToggle.focus();
        }
    });

    input.addEventListener('keydown', (event) => {
        const sendOnEnter = !isAssistantMobileDevice();
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

// eslint-disable-next-line no-restricted-syntax -- Guarded by origin/source checks below.
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin || event.source !== parent) {
        return;
    }
    const data = event.data || {};
    if (data.type === 'xb-assistant:card-workspace') {
        observeBackgroundTask(applyExternalLocalSources(data.payload.localSources).then(() => {
            state.workspacePanelMode = 'workspace';
            const reveal = data.payload.reveal || shouldAutoRevealWorkspace();
            if (!reveal) {
                closeWorkspace();
            }
            localSourcesManager.selectWorkspaceFile(data.payload.path, { reveal });
            render();
        }),
            { source: import.meta.url, operation: 'openCardWorkspace' });
        return;
    }
    if (data.type === 'xb-assistant:prepare-close') {
        observeBackgroundTask(closeAssistantAfterWorkspaceFlush(), { source: import.meta.url, operation: "callback" });
        return;
    }
    if (data.type === 'xb-assistant:config') {
        const hostRequestHeaders = data.payload?.hostRequestHeaders && typeof data.payload.hostRequestHeaders === 'object'
            ? data.payload.hostRequestHeaders
            : {};
        setHostChatCompletionsRequestHeadersProvider(async () => {
            try {
                const result = await requestHost('xb-assistant:get-host-request-headers', {}, { timeoutMs: 5000 });
                return result?.hostRequestHeaders && typeof result.hostRequestHeaders === 'object'
                    ? result.hostRequestHeaders
                    : hostRequestHeaders;
            } catch {
                return hostRequestHeaders;
            }
        });
        state.runtime = data.payload?.runtime || null;
        if (!ensureWorkspaceKernelVersion(state.runtime)) return;
        state.skillFiles = normalizeSkillFiles(data.payload?.runtime?.skillFiles || []);
        if (state.workspacePanelMode === 'memory') {
            ensureSkillSelection();
        }
        state.configLoadError = String(data.payload?.configLoadError || '');
        if (data.payload?.config && typeof data.payload.config === 'object') {
            applyConfig(data.payload.config);
        } else {
            render();
        }
        return;
    }

    if (data.type === 'xb-assistant:compose') {
        const input = document.querySelector('#xb-assistant-input');
        const text = String(data.payload?.text || '').trim();
        if (input && text) {
            if (!input.value.trimEnd().endsWith(text)) {
                input.value = input.value.trim() ? `${input.value}\n\n${text}` : text;
            }
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
            input.scrollTop = input.scrollHeight;
        }
        return;
    }

    if (data.type === 'xb-assistant:open-settings') {
        state.sidebarCollapsed = false;
        render();
        openApiPopover?.();
        return;
    }

    if (data.type === 'xb-assistant:config-saved') {
        if (data.payload?.requestId !== state.configSave.requestId || state.configSave.status !== 'saving') return;
        if (!settingsPanel.completePresetSave(data.payload?.requestId || '', { ok: true, config: data.payload?.config })) {
            applyConfig(data.payload?.config || {});
        }
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
        if (focusSkillPath && selectSkillFile(focusSkillPath, { persist: false, reveal: shouldAutoRevealWorkspace() })) {
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
        observeBackgroundTask(applyExternalLocalSources(data.payload?.localSources || []), { source: import.meta.url, operation: "callback" });
        return;
    }

    if (data.type === WORKSPACE_MESSAGE_TYPES.DIRECTORY_CHANGED) {
        observeBackgroundTask(localSourcesManager.applyExternalDirectoryChange(data.payload), { source: import.meta.url, operation: 'workspaceDirectoryChanged' });
        return;
    }

    if (data.type === 'xb-assistant:config-save-error') {
        if (data.payload?.requestId !== state.configSave.requestId || state.configSave.status !== 'saving') return;
        completeConfigSave(data.payload?.requestId || '', { ok: false, error: data.payload?.error || '网络异常' });
        showToast(`保存失败：${data.payload?.error || '网络异常'}`);
        return;
    }

    if (data.type === 'xb-assistant:host-result') {
        resolveHostRequest(data.payload || {});
        return;
    }

    if (data.type === 'xb-assistant:tool-result') {
        const entry = pendingToolCalls.get(data.payload?.requestId || '');
        if (!entry) return;
        entry.resolve(data.payload.result, data.payload.workspaceObservations, data.payload.workspaceConflictSnapshot);
        return;
    }

    if (data.type === 'xb-assistant:tool-error') {
        const entry = pendingToolCalls.get(data.payload?.requestId || '');
        if (!entry) return;
        entry.reject(new Error(data.payload.error || 'tool_failed'));
    }
});

window.addEventListener('beforeunload', (event) => {
    if (!hasPendingWorkspaceChanges()) return;
    event.preventDefault();
    event.returnValue = '';
});

async function bootstrap() {
    await Promise.all([restoreSession(), workspaceStore.restoreWorkspace()]);
    if (!shouldAutoRevealWorkspace()) state.isWorkspaceOpen = false;
    injectAssistantStyles(ROOT_ID);
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
    document.getElementById(ROOT_ID).textContent = ACTIVITY_COPY.restoreFailed;
});
