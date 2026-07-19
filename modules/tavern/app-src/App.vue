<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch } from 'vue';
import {
    getMessageWindow,
    normalizeHiddenOutsideCount,
    normalizeMessageLoadBatchSize,
    TAVERN_CHAT_MESSAGE_WINDOW_MAX,
} from './message-window';
import { normalizeTavernDisplaySettings, type TavernDisplaySettings } from '../shared/settings';
import { TAVERN_INLINE_IMAGE_PROGRESS_EVENT, useTavernMarkdownTools } from './components/chat/useTavernMarkdownTools';
import { useTavernScrollPane } from './components/chat/useTavernScrollPane';
import { buildTavernMessageDisplayDepths } from './components/chat/chat-timeline';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import {
    normalizeXbTavernAuthorNote,
    type XbTavernAuthorNote,
    type XbTavernCharacter,
    type XbTavernContext,
    type XbTavernNativeWorldInfoRuntime,
    type TavernChatPromptPresetBundle,
} from '../shared/message-assembler';
import { buildXbTavernBrain } from '../shared/brain';
import {
    getTavernMemoryIndex,
    getTavernMemoryFile,
    rebuildTavernMemoryDerivedIndex,
} from '../shared/memory-files';
import {
    appendTavernMessage,
    appendTavernAssistantChatMessage,
    branchTavernSession,
    createTavernSession,
    clearTavernAssistantChatMessages,
    deleteTavernAssistantChatMessages,
    getLatestTavernAssistantOrder,
    getLatestTavernUserMessageAtOrBefore,
    getTavernMessage,
    getTavernSession,
    listTavernAssistantChatMessages,
    listTavernManagerRuns,
    listTavernMessageOrdersFrom,
    normalizeTavernSessionState,
    replaceTavernAssistantChatMessages,
    truncateTavernMessagesAndReplaceSessionState,
    updateTavernSessionState,
    updateTavernAssistantChatMessage,
    updateTavernMessage,
    updateTavernSessionSnapshot,
    type TavernAssistantChatMessageRecord,
    type TavernManagerRunRecord,
    type TavernMemoryFileListEntry,
    type TavernMemoryIndexFileEntry,
    type TavernMemoryFileRecord,
    type TavernMemoryIndexRecord,
    type TavernMessageRecord,
    type TavernStructuredStateDocumentRecord,
    type TavernStructuredStatePatchRecord,
    type TavernSessionRecord,
} from '../shared/session-db';
import { getTavernAtlasStateForSession, getTavernMapStateForSession, type TavernMapStateDocumentItem } from '../shared/structured-state';
import { getTavernStatusStateForSession, type TavernStatusFieldDeltaMap } from '../shared/status-state';
import {
    resolveTavernAcceptedStateSnapshotDomains,
    saveAcceptedStateSnapshot,
} from '../shared/accepted-state';
import {
    exportTavernCharacterArchive,
    restoreTavernCharacterArchiveFromRecords,
} from '../shared/character-archive-db';
import {
    parseTavernCharacterArchiveJsonlBatches,
    sha256Hex,
    TavernCharacterArchiveWriter,
    ungzipTavernArchiveBytes,
} from '../shared/character-archive-jsonl';
import {
    buildTavernCharacterArchiveCharacterHash,
    buildTavernCharacterArchivePartFilename,
    downloadTavernCharacterArchiveFile,
    downloadTavernCharacterArchiveManifest,
    uploadTavernCharacterArchiveFile,
    uploadTavernCharacterArchiveManifest,
} from '../shared/character-archive-server-storage';
import {
    CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION,
    createEmptyTavernCharacterArchiveCounts,
    type TavernCharacterArchiveManifest,
    type TavernCharacterArchiveProgress,
    type TavernCharacterArchiveRecord,
} from '../shared/character-archive-types';
import { resetTavernWorldbookCache } from '../shared/worldbook-cache-reset';
import {
    normalizeTavernSessionContract,
    type TavernSessionContract,
} from '../shared/session-contract';
import {
    extractActionCheckRegexMarkers,
    getActionCheckEvents,
    injectActionCheckRegexMarkers,
    type TavernActionCheckRuntimeEvent,
} from '../shared/runtime-events';
import type { TavernApplyRegexItem, TavernApplyRegexResult } from '../shared/regex';
import type { TavernSubstituteParamsItem, TavernSubstituteParamsOptions, TavernSubstituteParamsResult } from '../shared/substitute-params';
import {
    buildContextHistory,
    resumeQueuedAcceptedTurnManagers,
    simulateXbTavernRequest,
    type TavernBuildNativeChatPromptRuntime,
} from './runtime/run-once';
import { resolveTavernHistoryBoundaryState } from './runtime/history-boundary-state';
import {
    buildManagerChatDisplayItems,
    type ManagerChatDisplayItem,
    type ManagerMessageDisplayItem,
} from './manager-tool-display';
import {
    cancelAndRollbackXbTavernManagersForMessageRange,
    runXbTavernManagerAfterTurn,
} from './runtime/manager';
import { runXbTavernAssistantChat } from './runtime/assistant-chat-runner';
import { ensureTavernAssistantChatBudget } from './runtime/assistant-chat-context';
import {
    cancelAcceptedRollbackManagersBeforeMessage,
    describeAcceptedStateRollbackImpact,
    rollbackImpactLines,
    restoreAcceptedStateBeforeMessage,
} from './features/accepted-rollback/accepted-rollback';
import {
    useTavernRuntimeDisplayProjection,
    type TavernRuntimeDisplayRegexRequest,
    type TavernRuntimeThoughtProjectionInput,
} from './features/chat-render/useTavernRuntimeDisplayProjection';
import { createTavernChatRunState, useTavernChatRunController } from './features/chat-run/useTavernChatRunController';
import {
    useTavernAssistantChatLiveController,
    type TavernAssistantChatLiveRun,
} from './features/assistant-chat/useTavernAssistantChatLiveController';
import { useTavernDrawController } from './features/draw/useTavernDrawController';
import { useTavernPhoneController } from './features/phone-os/useTavernPhoneController';
import { useTavernHostBridge, type TavernHostMessageData } from './features/host-bridge/useTavernHostBridge';
import { useMaterialSymbolFont } from './features/material-symbol-font';
import { createTavernSessionState, useTavernSessionController } from './features/session/useTavernSessionController';
import TavernAboutPage from './components/TavernAboutPage.vue';
import TavernHomePage from './components/TavernHomePage.vue';
import TavernChatPage from './components/chat/TavernChatPage.vue';
import { useTavernManagerDisplay } from './components/chat/useTavernManagerDisplay';
import { useTavernMemoryWorkspace } from './components/chat/useTavernMemoryWorkspace';
import TavernRequestLogModal from './components/TavernRequestLogModal.vue';
import TavernSettingsPage from './components/settings/TavernSettingsPage.vue';
import {
    readInitialSettingsWorkspace,
    useTavernSettingsController,
    type TavernSettingsWorkspaceKey,
} from './components/settings/useTavernSettingsController';
import {
    TAVERN_APP_UI_CONTEXT,
    type TavernAppUiContext,
    type TavernCharacterContext,
    type TavernCharacterOption,
    type TavernCharacterWorldbookState,
    type TavernChatContext,
    type TavernDialogOptions,
    type TavernManagerContext,
    type TavernPhoneContext,
    type TavernMemoryContext,
    type TavernSessionContext,
    type TavernChatWorkspacePanelKey,
    type TavernShellContext,
    type TavernWorkspaceContext,
} from './components/tavern-app-context';

interface TavernDiagnostics {
    ok?: boolean;
    message?: string;
    worldbookErrors?: Array<{ name: string; error: string }>;
}

interface RequestAuditSnapshot {
    rawMessagesJson?: string;
    rawRequestJson?: string;
    requestKind?: string;
    capturedAt?: number;
    messageCount?: number;
    messageChars?: number;
    presetName?: string;
    provider?: string;
    providerLabel?: string;
    model?: string;
    toolMode?: string;
}

interface TavernCharacterWorldbookActionResult {
    action?: string;
    name?: string;
    worldbookOptions?: unknown;
    state?: TavernCharacterWorldbookState;
}

interface TavernDialogState {
    kind: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    placeholder: string;
    inputValue: string;
    tone: 'default' | 'danger' | 'warning';
    resolve: (value: boolean | string | null) => void;
}

const CHARACTER_ARCHIVE_BATCH_SIZE = 48;
const MANAGER_RUN_VISIBLE_LIMIT = 12;
const MEMORY_TURN_INITIAL_LIMIT = 36;
const MEMORY_TURN_BATCH_SIZE = 48;
const MEMORY_FILE_BATCH_SIZE = 24;
const DISPLAY_REGEX_CACHE_LIMIT = 480;
const RUNTIME_DISPLAY_REGEX_THROTTLE_MS = 200;

const context = ref<XbTavernContext>({});
const diagnostics = ref<TavernDiagnostics>({});
const agentConfig = ref<Record<string, unknown>>({});
const tavernDisplaySettings = ref<TavernDisplaySettings>(normalizeTavernDisplaySettings({}));
const htmlRenderEnabled = ref(true);
const hiddenOutsideCount = computed(() => normalizeHiddenOutsideCount(tavernDisplaySettings.value.hiddenOutsideCount));
const loadBatchSize = computed(() => normalizeMessageLoadBatchSize(tavernDisplaySettings.value.loadBatchSize));
const hostRequestHeaders = ref<Record<string, unknown>>({});
const materialSymbolFont = useMaterialSymbolFont();
const materialSymbolFontReady = materialSymbolFont.ready;
const materialSymbolFontStatus = materialSymbolFont.status;
const hostMainFontSizePx = ref('15px');
const hostProseLineHeightPx = ref('23px');
const availableCharacters = ref<TavernCharacterOption[]>([]);
const selectedCharacterPreviewKey = ref('');
const selectedCharacterGreetingIndex = ref(0);
const pendingCharacterPreviewKey = ref('');
const pendingCharacterSessionKey = ref('');
const characterWorldbookState = ref<TavernCharacterWorldbookState | null>(null);
const characterWorldbookBusy = ref(false);
const characterWorldbookStatus = ref('');
const characterWorldbookSelectionOpen = ref(false);
const characterWorldbookSelectionOptions = ref<string[]>([]);
function createIdleCharacterArchiveSyncState(): TavernCharacterArchiveProgress {
    return {
        busy: false,
        mode: '',
        phase: '',
        percent: 0,
        partIndex: 0,
        partCount: 0,
        loadedBytes: 0,
        totalBytes: 0,
        message: '',
        error: '',
    };
}
const characterArchiveSyncState = ref<TavernCharacterArchiveProgress>(createIdleCharacterArchiveSyncState());
const pendingCharacterGreetingIndex = ref(0);
const pendingCharacterError = ref('');
const selectedSessionCharacterError = ref('');
const statusText = ref('等待读取角色与会话');
const historyMode = ref<'raw' | 'squash'>('raw');
const chatRunState = createTavernChatRunState();
const {
    currentUserMessage,
    isCancellingRun,
    isRunning,
    runtimeActionCheckEvents,
    runtimeError,
    runtimeModel,
    runtimePendingUserMessage,
    runtimeProvider,
    runtimeStatusElapsedSeconds,
    runtimeStatusLabel,
    runtimeStatusStartedAt,
    runtimeText,
    runtimeThoughts,
    runtimeAssistantMessageKey,
    runtimeUserMessageVisible,
} = chatRunState;
const tavernToast = ref<{
    id: number;
    message: string;
    tone: 'info' | 'warning' | 'danger';
} | null>(null);
const sessionState = createTavernSessionState();
const {
    chatMessages,
    currentAssistantFloor,
    loadedSessionMessageEndOrder,
    loadedSessionMessageStartOrder,
    loadedSessionMessages,
    selectedSession,
    selectedSessionId,
    selectedSessionLatestAssistantOrder,
    selectedSessionMessageTotal,
    selectedSessionMessageWindowOffsetFromEnd,
    sessionMessageCounts,
    sessions,
    visibleChatMessages,
} = sessionState;
const managerRuns = ref<TavernManagerRunRecord[]>([]);
const memoryFiles = ref<TavernMemoryIndexFileEntry[]>([]);
const memoryIndex = ref<TavernMemoryIndexRecord | null>(null);
const selectedMemoryFilePath = ref('');
const selectedMemoryFileRecord = ref<TavernMemoryFileRecord | null>(null);
const stateMemoryFile = ref<TavernMemoryFileRecord | null>(null);
const memoryEditorDraft = ref('');
const memoryEditorLoadedPath = ref('');
const memoryEditorBaseContent = ref('');
const memoryEditorMode = ref<'preview' | 'edit'>('preview');
const memoryEditorStatus = ref('');
const chatWorkspacePanel = ref<TavernChatWorkspacePanelKey>('map');
const mapStateDocuments = ref<TavernMapStateDocumentItem[]>([]);
const activeMapDocId = ref('main');
const mapStateDocument = ref<TavernStructuredStateDocumentRecord | null>(null);
const mapStatePatches = ref<TavernStructuredStatePatchRecord[]>([]);
const atlasStateDocument = ref<TavernStructuredStateDocumentRecord | null>(null);
const atlasStatePatches = ref<TavernStructuredStatePatchRecord[]>([]);
const atlasActiveLocationKey = ref('');
const statusStateDocument = ref<TavernStructuredStateDocumentRecord | null>(null);
const statusStatePatches = ref<TavernStructuredStatePatchRecord[]>([]);
const statusFieldDeltas = ref<TavernStatusFieldDeltaMap>({});
const managerActionStatus = ref('');
const retryingManagerRunId = ref('');
const managerInputDraft = ref('');
const managerInputStatus = ref('');
const managerChatMessages = ref<TavernAssistantChatMessageRecord[]>([]);
const managerPendingUserMessage = ref<TavernAssistantChatMessageRecord | null>(null);
const isManagerAssistantRunning = ref(false);
const isManagerAssistantCancelling = ref(false);
const managerAssistantLiveController = useTavernAssistantChatLiveController({
    normalizeThoughts: thoughtBlocks,
    onMessagesPersisted: (sessionId, messages) => {
        if (selectedSessionId.value !== sessionId || !messages.length) {return;}
        managerChatMessages.value = [...managerChatMessages.value, ...messages]
            .sort((left, right) => left.order - right.order);
    },
});
const managerLiveProtocolState = managerAssistantLiveController.assistantDraft;
const managerLiveToolRound = managerAssistantLiveController.toolRound;
const managerCompactionOverlay = ref<{
    id: string;
    active: boolean;
    resolved: boolean;
    currentTokens: number;
    fixedTokens: number;
    historyTokens: number;
    yieldTokens: number;
    triggerTokens: number;
    status: string;
    visibleSince: number;
} | null>(null);
const characterSearchText = ref('');
const characterVisibleLimit = ref(CHARACTER_ARCHIVE_BATCH_SIZE);
const memoryFileSearchText = ref('');
const memoryFileGroupVisibleLimits = ref<Record<string, number>>({});
const brokenAvatarUrls = ref<Record<string, true>>({});
type AppView = 'home' | 'chat' | 'settings' | 'about';
type ChatFocus = 'chat' | 'manager';
type ChatLayout = 'chat' | 'balanced' | 'editor';
const TAVERN_THEME_STORAGE_KEY = 'LittleWhiteBox_Tavern_theme';
function readInitialView(): AppView {
    const hash = String(window.location.hash || '').replace(/^#\/?/, '');
    const [view] = hash.split('/');
    if (view === 'chat' || view === 'settings' || view === 'about') {
        return view;
    }
    return 'home';
}
function readInitialTavernThemeDark(): boolean {
    try {
        const value = globalThis.localStorage?.getItem(TAVERN_THEME_STORAGE_KEY);
        if (value === 'dark') {return true;}
        if (value === 'light') {return false;}
    } catch {
        // Use the light default below when storage is unavailable.
    }
    return false;
}
interface DisplayRegexTextRequest {
    key: string;
    text: string;
    placement: TavernApplyRegexItem['placement'];
    options: TavernApplyRegexItem['options'];
    actionCheckEvents?: TavernActionCheckRuntimeEvent[];
    actionCheckBoundaries?: Array<{ originalOffset: number; marker: string }>;
}
interface DisplayRegexProjection {
    text: string;
    actionCheckEvents: TavernActionCheckRuntimeEvent[];
}
function normalizedSearchText(value = '') {
    return String(value || '').trim().toLocaleLowerCase();
}

function normalizeHostPx(value: unknown, fallback: string): string {
    const parsed = Number.parseFloat(String(value || ''));
    return Number.isFinite(parsed) && parsed > 0
        ? `${Math.round(parsed * 100) / 100}px`
        : fallback;
}

function deriveHostProseLineHeightPx(fontSizePx = hostMainFontSizePx.value): string {
    const parsed = Number.parseFloat(String(fontSizePx || ''));
    return Number.isFinite(parsed) && parsed > 0
        ? `${Math.round((parsed + 8) * 100) / 100}px`
        : '23px';
}

function includesSearch(text: string, query: string) {
    if (!query) {return true;}
    return normalizedSearchText(text).includes(query);
}

function buildSearchCorpus(parts: unknown[], perPartLimit = 1600) {
    return parts
        .map((part) => String(part ?? '').slice(0, perPartLimit))
        .filter(Boolean)
        .join('\n');
}

function normalizeTextList(value: unknown): string[] {
    return Array.isArray(value)
        ? value.map((item) => String(item || '').trim()).filter(Boolean)
        : [];
}

const currentAuthorNote = computed<XbTavernAuthorNote>(() => normalizeXbTavernAuthorNote(selectedSession.value?.contextSnapshot?.authorNote));
const sessionRuntimeState = computed(() => normalizeTavernSessionState(selectedSession.value?.state || {}));
const sessionContract = computed<TavernSessionContract>(() => normalizeTavernSessionContract(sessionRuntimeState.value.contract));
const canResumeSelectedSession = computed(() => !!(
    selectedSession.value
    && String(selectedSession.value.characterKey || '').trim()
));
const activeView = ref<AppView>(readInitialView());
const activeSettingsWorkspace = ref<TavernSettingsWorkspaceKey>(readInitialSettingsWorkspace());
const homeThemeDark = ref(readInitialTavernThemeDark());
const chatFocus = ref<ChatFocus>('chat');
const chatLayout = ref<ChatLayout>('balanced');
const chatComposeTextareaRef = ref<HTMLTextAreaElement | null>(null);
const managerComposeTextareaRef = ref<HTMLTextAreaElement | null>(null);
const managerWorkRef = ref<HTMLElement | null>(null);
const chatScrollPane = useTavernScrollPane({
    totalItems: () => selectedSessionMessageTotal.value,
    defaultLimit: hiddenOutsideCount,
    loadBatchSize,
    maxWindowLimit: TAVERN_CHAT_MESSAGE_WINDOW_MAX,
    windowOffsetFromEnd: selectedSessionMessageWindowOffsetFromEnd,
    isWindowPinned: () => isRoleplayMessageEditing(),
});
const managerScrollPane = useTavernScrollPane({
    totalItems: () => managerChatDisplayItems.value.length,
    defaultLimit: hiddenOutsideCount,
    loadBatchSize,
});
const chatScrollRef = chatScrollPane.scrollRef;
const chatScrollContentRef = chatScrollPane.contentRef;
const managerScrollRef = managerScrollPane.scrollRef;
const chatAutoScroll = chatScrollPane.autoScroll;
const managerAutoScroll = managerScrollPane.autoScroll;
const showChatScrollTop = chatScrollPane.showScrollTop;
const showChatScrollBottom = chatScrollPane.showScrollBottom;
const chatScrollControlsActive = chatScrollPane.scrollControlsActive;
const showManagerScrollTop = managerScrollPane.showScrollTop;
const showManagerScrollBottom = managerScrollPane.showScrollBottom;
const managerScrollControlsActive = managerScrollPane.scrollControlsActive;
const chatMessageWindowLimit = chatScrollPane.messageWindowLimit;
const managerMessageWindowLimit = managerScrollPane.messageWindowLimit;
const editingMessageKey = ref('');
const editingManagerMessageKey = ref('');
const editingMessageDraft = ref('');
const showPromptInspector = ref(false);
const promptInspectorTab = ref<'history' | 'simulate'>('history');
const simulateRequestInput = ref('');
const simulateRequestJson = ref('');
const simulateRequestStatus = ref('');
const simulateRequestError = ref('');
const messageActionFeedback = ref<Record<string, 'success' | 'error'>>({});
const displayRegexCache = ref<Record<string, string>>({});
const managerAssistantController = ref<AbortController | null>(null);
const tavernDialog = ref<TavernDialogState | null>(null);
const tavernDialogInputRef = ref<HTMLInputElement | null>(null);
const tavernDialogPanelRef = ref<HTMLElement | null>(null);
const tavernDialogCancelRef = ref<HTMLButtonElement | null>(null);
const tavernDialogPrimaryRef = ref<HTMLButtonElement | null>(null);
const tavernDialogAttention = ref(false);
const rootTypographyStyle = computed<Record<string, string>>(() => ({
    '--xb-host-main-font-size': hostMainFontSizePx.value,
    '--xb-host-prose-line-height': hostProseLineHeightPx.value,
}));
let tavernDialogReturnFocus: HTMLElement | null = null;

function normalizeTavernDialogOptions(
    options: TavernDialogOptions | string,
    kind: TavernDialogState['kind'],
): Omit<TavernDialogState, 'kind' | 'resolve'> {
    const source = typeof options === 'string' ? { message: options } : (options || {});
    const title = String(source.title || (kind === 'alert' ? '提示' : kind === 'prompt' ? '输入' : '确认操作')).trim();
    return {
        title,
        message: String(source.message || '').trim(),
        confirmText: String(source.confirmText || (kind === 'alert' ? '知道了' : '确认')).trim(),
        cancelText: String(source.cancelText || '取消').trim(),
        placeholder: String(source.placeholder || '').trim(),
        inputValue: String(source.defaultValue || ''),
        tone: source.tone === 'danger' || source.tone === 'warning' ? source.tone : 'default',
    };
}

function rememberTavernDialogReturnFocus() {
    if (tavernDialog.value) {return;}
    const active = document.activeElement;
    tavernDialogReturnFocus = active instanceof HTMLElement ? active : null;
}

function restoreTavernDialogReturnFocus() {
    const target = tavernDialogReturnFocus;
    tavernDialogReturnFocus = null;
    if (!target?.isConnected) {return;}
    void nextTick(() => {
        try {
            target.focus({ preventScroll: true });
        } catch {
            target.focus();
        }
    });
}

function focusTavernDialogElement(element: HTMLElement | null | undefined) {
    if (!element) {return;}
    try {
        element.focus({ preventScroll: true });
    } catch {
        element.focus();
    }
}

function focusInitialTavernDialogControl() {
    const dialog = tavernDialog.value;
    if (!dialog) {return;}
    if (dialog.kind === 'prompt') {
        focusTavernDialogElement(tavernDialogInputRef.value);
        tavernDialogInputRef.value?.select();
        return;
    }
    if (dialog.kind === 'alert') {
        focusTavernDialogElement(tavernDialogPrimaryRef.value);
        return;
    }
    focusTavernDialogElement(tavernDialogCancelRef.value || tavernDialogPrimaryRef.value || tavernDialogPanelRef.value);
}

function openTavernDialog(
    kind: TavernDialogState['kind'],
    options: TavernDialogOptions | string,
): Promise<boolean | string | null> {
    rememberTavernDialogReturnFocus();
    tavernDialog.value?.resolve(kind === 'prompt' ? null : false);
    return new Promise((resolve) => {
        tavernDialog.value = {
            kind,
            ...normalizeTavernDialogOptions(options, kind),
            resolve,
        };
        void nextTick(focusInitialTavernDialogControl);
    });
}

async function confirmTavernDialog(options: TavernDialogOptions | string): Promise<boolean> {
    return await openTavernDialog('confirm', options) === true;
}

async function alertTavernDialog(options: TavernDialogOptions | string): Promise<void> {
    await openTavernDialog('alert', options);
}

async function promptTavernDialog(options: TavernDialogOptions | string): Promise<string | null> {
    const result = await openTavernDialog('prompt', options);
    return typeof result === 'string' ? result : null;
}

function closeTavernDialog(value?: boolean | string | null) {
    const dialog = tavernDialog.value;
    if (!dialog) {return;}
    tavernDialog.value = null;
    tavernDialogAttention.value = false;
    if (typeof value !== 'undefined') {
        dialog.resolve(value);
        restoreTavernDialogReturnFocus();
        return;
    }
    dialog.resolve(dialog.kind === 'prompt' ? null : false);
    restoreTavernDialogReturnFocus();
}

function confirmOpenTavernDialog() {
    const dialog = tavernDialog.value;
    if (!dialog) {return;}
    closeTavernDialog(dialog.kind === 'prompt' ? dialog.inputValue : true);
}

const tavernDialogPrimaryText = computed(() => tavernDialog.value?.confirmText || '确认');

function canCloseTavernDialogFromBackdrop(dialog: TavernDialogState | null) {
    if (!dialog) {return false;}
    return dialog.kind === 'alert' || (dialog.kind === 'confirm' && dialog.tone === 'default');
}

function pulseTavernDialogAttention() {
    tavernDialogAttention.value = false;
    void nextTick(() => {
        tavernDialogAttention.value = true;
        window.setTimeout(() => {
            tavernDialogAttention.value = false;
        }, 260);
    });
}

function handleTavernDialogBackdropClick() {
    if (canCloseTavernDialogFromBackdrop(tavernDialog.value)) {
        closeTavernDialog();
        return;
    }
    pulseTavernDialogAttention();
    focusInitialTavernDialogControl();
}

function getTavernDialogFocusableElements() {
    const panel = tavernDialogPanelRef.value;
    if (!panel) {return [];}
    return Array.from(panel.querySelectorAll<HTMLElement>([
        'button:not(:disabled)',
        'input:not(:disabled)',
        'textarea:not(:disabled)',
        'select:not(:disabled)',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
    ].join(','))).filter((element) => element.offsetParent !== null || element === document.activeElement);
}

function handleTavernDialogTab(event: KeyboardEvent) {
    const focusable = getTavernDialogFocusableElements();
    if (!focusable.length) {
        event.preventDefault();
        focusTavernDialogElement(tavernDialogPanelRef.value);
        return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
        if (active === first || !focusable.includes(active as HTMLElement)) {
            event.preventDefault();
            focusTavernDialogElement(last);
        }
        return;
    }
    if (active === last || !focusable.includes(active as HTMLElement)) {
        event.preventDefault();
        focusTavernDialogElement(first);
    }
}

const hostBridge = useTavernHostBridge({
    onHostRequestResolved: (type) => {
        if (['xb-tavern:list-regex-scripts', 'xb-tavern:save-regex-script', 'xb-tavern:delete-regex-script'].includes(type)) {
            clearDisplayRegexCache();
        }
    },
});
const {
    createHostRequestId,
    postToHost,
    reportStartupProgress,
    requestHost,
} = hostBridge;

function isKeyboardViewportTarget(target: EventTarget | null): target is HTMLElement {
    if (!(target instanceof HTMLElement)) {return false;}
    if (target.isContentEditable) {return true;}
    const tagName = target.tagName.toLowerCase();
    if (tagName === 'textarea') {return true;}
    if (tagName !== 'input') {return false;}
    const type = String((target as HTMLInputElement).type || 'text').toLowerCase();
    return !['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit'].includes(type);
}

function handleKeyboardViewportFocus(event: FocusEvent) {
    if (!isKeyboardViewportTarget(event.target)) {return;}
    postToHost('xb-tavern:viewport-settle', { reason: event.type });
}

function preserveChatViewportDuringMutation<T>(mutation: () => T): T {
    return chatScrollPane.preserveViewportDuringMutation(mutation);
}

const {
    clearMarkdownCache,
    disposeMarkdownTools,
    enhanceChatMarkdown,
    enhanceManagerMarkdown,
    enhanceMarkdownRoot,
    markdownSignature,
    releaseMarkdownRootResources,
    renderChatMarkdown,
    stripTavernImageMarkers,
} = useTavernMarkdownTools({
    chatScrollRef,
    managerScrollRef,
    managerWorkRef,
    htmlRenderEnabled,
    htmlThemeDark: homeThemeDark,
    alertDialog: alertTavernDialog,
    confirmDialog: confirmTavernDialog,
    requestHost,
    showToast: showTavernToast,
    preserveChatScroll: preserveChatViewportDuringMutation,
    getHtmlFrameAvatarUrls: () => ({
        user: String(effectiveContext.value.user?.avatar || ''),
        char: String(effectiveContext.value.character?.avatar || ''),
    }),
});
const characterOptionCache = new Map<string, { signature: string; option: TavernCharacterOption }>();
const memoryFileSearchCorpusCache = new WeakMap<TavernMemoryIndexFileEntry, string>();
let characterPreviewRequestSequence = 0;
let characterWorldbookRequestSequence = 0;
let simulateRequestSequence = 0;
let managerCompactionOverlayHideTimer: number | null = null;
const managerMessageFeedbackTimers = new Map<string, number>();
let tavernToastTimer: number | null = null;
let managerRecordsPollTimer: number | null = null;
let managerRecordsPollRunning = false;
let assistantChatRefreshSerial = 0;
let managerRecordsRefreshSerial = 0;
let sessionContextSyncSequence = 0;
let initialConfigApplied = false;
let postReadyStartupStarted = false;
const inFlightDisplayRegexRequests = new Map<string, Promise<void>>();
let displayRegexCacheGeneration = 0;
const effectiveContext = computed<XbTavernContext>(() => ({
    ...context.value,
    history: selectedSessionId.value
        ? buildContextHistory(loadedSessionMessages.value)
        : context.value.history,
}));
const currentNativeCharacterId = computed(() => {
    const characterKey = String(selectedSession.value?.characterKey || effectiveContext.value.character?.characterKey || '').trim();
    const byKey = characterKey ? resolveCurrentNativeCharacterId(characterKey, { optional: true }) : '';
    return byKey
        || String(selectedSession.value?.contextSnapshot?.character?.nativeCharacterId || '').trim()
        || String(effectiveContext.value.character?.nativeCharacterId || '').trim();
});
const regexNativeCharacterId = computed(() => {
    const previewKey = activeView.value === 'settings' && activeSettingsWorkspace.value === 'regex'
        ? String(selectedCharacterPreviewKey.value || '').trim()
        : '';
    const previewNativeCharacterId = previewKey ? resolveCurrentNativeCharacterId(previewKey, { optional: true }) : '';
    return previewNativeCharacterId || currentNativeCharacterId.value;
});
const {
    activeAssistantPreset,
    applyHostChatPreset,
    handleApiConfigSaved,
    loadTavernUsers,
    openSettingsWorkspace,
    openWorldbookWorkspace,
    refreshPresets,
    refreshRegexFromHost,
    refreshRuntimeChatPresetFromHost,
    renderApiSettingsPanel,
    runtimeChatPreset,
    selectSettingsWorkspace,
    settingsContext,
    syncApiSettingsConfigFromAgentConfig,
    syncChatPresetFromHost,
    syncWorldbooksFromHost,
} = useTavernSettingsController({
    activeView,
    activeSettingsWorkspace,
    agentConfig,
    tavernDisplaySettings,
    effectiveContext,
    currentNativeCharacterId,
    regexNativeCharacterId,
    homeThemeDark,
    isRunning,
    confirmDialog: confirmTavernDialog,
    describeError,
    postToHost,
    requestHost,
    shortText,
});
const effectiveCharacter = computed(() => effectiveContext.value.character || {});
const characterName = computed(() => displayableTavernName(effectiveCharacter.value.name || '', '未选择角色'));
const characterAvatar = computed(() => {
    const primaryAvatar = String(effectiveCharacter.value.avatar || '').trim();
    const characterKey = String(effectiveCharacter.value.characterKey || '').trim();
    const characterNameValue = String(effectiveCharacter.value.name || '').trim();
    const matchedCharacter = availableCharacters.value.find((character) => String(character.characterKey || '').trim() === characterKey)
        || availableCharacters.value.find((character) => String(character.name || '').trim() === characterNameValue);
    const fallbackAvatar = String(matchedCharacter?.avatar || '').trim();
    const candidates = [primaryAvatar, fallbackAvatar].filter((avatar, index, list) => avatar && list.indexOf(avatar) === index);
    return candidates.find((avatar) => !brokenAvatarUrls.value[avatar]) || candidates[0] || '';
});
const visibleCharacterAvatar = computed(() => {
    const url = characterAvatar.value;
    return url && !brokenAvatarUrls.value[url] ? url : '';
});
const effectiveUser = computed(() => effectiveContext.value.user || {});
const userName = computed(() => displayableTavernName(effectiveUser.value.name || '', 'User'));
const userAvatar = computed(() => String(effectiveUser.value.avatar || '').trim());
const visibleUserAvatar = computed(() => {
    const url = userAvatar.value;
    return url && !brokenAvatarUrls.value[url] ? url : '';
});
const drawContext = useTavernDrawController({
    selectedSessionId,
    loadedSessionMessages,
    selectedSession,
    effectiveCharacterName: computed(() => String(effectiveCharacter.value.name || '')),
    isEditingMessage,
    messageKey,
    roleLabel,
    createHostRequestId,
    requestHost,
    getTavernMessage,
    updateTavernMessage,
    loadSelectedSessionMessageWindow,
    flashMessageAction,
    showToast: showTavernToast,
    describeError,
    markdownSignature,
    stripTavernImageMarkers,
    enhanceChatMarkdown,
    nextTick,
});
const sessionController = useTavernSessionController(sessionState, {
    activeView,
    chatFocus,
    chatMessageWindowLimit,
    hiddenOutsideCount,
    isRunning,
    selectedCharacterPreviewKey,
    selectedSessionCharacterError,
    applySessionSnapshotContext,
    cancelAndRollbackManagersForSession: (sessionId) => cancelAndRollbackXbTavernManagersForMessageRange(sessionId, 0),
    cancelDrawJobsForSession: drawContext.cancelJobsForSession,
    confirmDeleteSession: (title) => confirmTavernDialog({
        title: '删除会话',
        message: `删除「${title}」？`,
        confirmText: '删除',
        tone: 'danger',
    }),
    describeSessionTitle: sessionDisplayTitle,
    invalidateMemoryFileRecordLoad: () => invalidateMemoryFileRecordLoad(),
    openCharacterSettingsWorkspace: () => {
        openSettingsWorkspace('characters');
    },
    refreshManagerRecords: async (sessionId) => {
        await Promise.all([
            refreshManagerRecords(sessionId),
            refreshAssistantChat(sessionId),
        ]);
    },
    reportStartupProgress,
    resetChatMessageWindowState: () => resetChatMessageWindowState(),
    resetSessionPreviewState,
    placeChatAtBottomForNewContext: () => placeChatAtBottomForNewContext(),
    syncCharacterWorldbookState,
    syncSessionCharacterContextSafely,
    abortActiveRun: () => chatRunController.abortActiveRun(),
});
const chatMessageWindow = sessionController.chatMessageWindow;
const liveCharacter = computed(() => context.value.character || {});
const liveCharacterKey = computed(() => String(liveCharacter.value.characterKey || '').trim());
function findCharacterByKey(characterKey = ''): TavernCharacterOption | null {
    const key = String(characterKey || '').trim();
    if (!key) {return null;}
    return characterCards.value.find((character) => character.characterKey === key) || null;
}

function resolveCurrentNativeCharacterId(characterKey = '', options: { optional?: boolean } = {}): string {
    const key = String(characterKey || '').trim();
    if (!key) {
        if (options.optional) {return '';}
        throw new Error('缺少角色身份。');
    }
    const nativeCharacterId = String(findCharacterByKey(key)?.nativeCharacterId || '').trim();
    if (nativeCharacterId) {return nativeCharacterId;}
    if (options.optional) {return '';}
    throw new Error('角色卡已不存在或文件名变化，请重新选择角色。');
}

function avatarAvailable(url = '') {
    const key = String(url || '').trim();
    return !!key && !brokenAvatarUrls.value[key];
}

function rememberBrokenAvatar(url = '') {
    const key = String(url || '').trim();
    if (!key || brokenAvatarUrls.value[key]) {return;}
    brokenAvatarUrls.value = {
        ...brokenAvatarUrls.value,
        [key]: true,
    };
}

function normalizeCharacterOption(character: Record<string, unknown>, idFallback = ''): TavernCharacterOption | null {
    const characterKey = String(character.characterKey || idFallback || '').trim();
    if (!characterKey) {return null;}
    const nativeCharacterId = String(character.nativeCharacterId || '').trim();
    const name = String(character.name || '').trim() || `角色 ${characterKey}`;
    const avatar = String(character.avatar || '').trim();
    const shallow = character.shallow === true;
    const description = String(character.description || '').trim();
    const personality = String(character.personality || '').trim();
    const scenario = String(character.scenario || '').trim();
    const firstMessage = String(character.firstMessage || character.first_mes || '').trim();
    const alternateGreetings = normalizeTextList(character.alternateGreetings || character.alternate_greetings);
    const mesExample = String(character.mesExample || character.mes_example || '').trim();
    const creatorNotes = String(character.creatorNotes || character.creator_notes || '').trim();
    const characterDepthPrompt = String(character.characterDepthPrompt || character.character_depth_prompt || '').trim();
    const signature = JSON.stringify([characterKey, nativeCharacterId, name, avatar, shallow, description, personality, scenario, firstMessage, alternateGreetings, mesExample, creatorNotes, characterDepthPrompt]);
    const cached = characterOptionCache.get(characterKey);
    if (cached?.signature === signature) {return cached.option;}
    const option: TavernCharacterOption = {
        characterKey,
        nativeCharacterId,
        name,
        avatar,
        shallow,
        description,
        personality,
        scenario,
        firstMessage,
        alternateGreetings,
        mesExample,
        creatorNotes,
        characterDepthPrompt,
    };
    option.searchCorpus = normalizedSearchText(buildSearchCorpus([
        option.characterKey,
        option.name,
        option.description,
        option.personality,
        option.scenario,
        option.firstMessage,
        ...(option.alternateGreetings || []),
        option.mesExample,
        option.creatorNotes,
        option.characterDepthPrompt,
    ], 900));
    characterOptionCache.set(characterKey, { signature, option });
    return option;
}
const characterCards = computed<TavernCharacterOption[]>(() => {
    const byId = new Map<string, TavernCharacterOption>();
    availableCharacters.value.forEach((character) => {
        const option = normalizeCharacterOption(character as unknown as Record<string, unknown>);
        if (option) {byId.set(option.characterKey, option);}
    });
    const currentKey = String(liveCharacter.value.characterKey || '').trim();
    if (currentKey && liveCharacter.value.name && !byId.has(currentKey)) {
        const option = normalizeCharacterOption(liveCharacter.value as Record<string, unknown>, currentKey);
        if (option) {byId.set(currentKey, option);}
    }
    return [...byId.values()].sort((left, right) => {
        return left.name.localeCompare(right.name, 'zh-Hans-CN');
    });
});
const filteredCharacterCards = computed<TavernCharacterOption[]>(() => {
    const query = normalizedSearchText(characterSearchText.value);
    if (!query) {return characterCards.value;}
    return characterCards.value.filter((character) => String(character.searchCorpus || '').includes(query));
});
const visibleCharacterCards = computed(() => {
    const visible = filteredCharacterCards.value.slice(0, characterVisibleLimit.value);
    const selectedKey = String(selectedCharacterPreviewKey.value || '').trim();
    if (!selectedKey || visible.some((character) => character.characterKey === selectedKey)) {return visible;}
    const selected = characterCards.value.find((character) => character.characterKey === selectedKey);
    return selected ? [selected, ...visible] : visible;
});
const selectedCharacterPreview = computed(() => {
    const previewKey = String(selectedCharacterPreviewKey.value || '').trim();
    if (previewKey) {
        const selected = characterCards.value.find((character) => character.characterKey === previewKey);
        if (selected) {return selected;}
    }
    return null;
});
const selectedCharacterSessions = computed<TavernSessionRecord[]>(() => {
    const characterKey = String(selectedCharacterPreview.value?.characterKey || '').trim();
    if (!characterKey) {return [];}
    return sessions.value
        .filter((session) => String(session.characterKey || '').trim() === characterKey)
        .slice()
        .sort((left, right) => (
            (Number(right.updatedAt) || Number(right.createdAt) || 0)
            - (Number(left.updatedAt) || Number(left.createdAt) || 0)
        ));
});
const currentChatCharacterSessions = computed<TavernSessionRecord[]>(() => {
    const characterKey = String(
        selectedSession.value?.characterKey
        || effectiveContext.value.character?.characterKey
        || '',
    ).trim();
    if (!characterKey) {return [];}
    return sessions.value
        .filter((session) => String(session.characterKey || '').trim() === characterKey)
        .slice()
        .sort((left, right) => (
            (Number(right.updatedAt) || Number(right.createdAt) || 0)
            - (Number(left.updatedAt) || Number(left.createdAt) || 0)
        ));
});
const selectedCharacterGreetingOptions = computed(() => {
    const character = selectedCharacterPreview.value;
    if (!character) {return [];}
    return [
        String(character.firstMessage || '').trim(),
        ...(character.alternateGreetings || []),
    ].filter(Boolean);
});
const hiddenCharacterCount = computed(() => Math.max(
    0,
    filteredCharacterCards.value.length - Math.min(filteredCharacterCards.value.length, characterVisibleLimit.value),
));
function cleanTavernDisplayName(value = '') {
    return String(value || '')
        .replace(/\s*[·-]\s*小白酒馆\s*$/g, '')
        .replace(/\s*[·-]\s*会话\s*$/g, '')
        .replace(/^小白酒馆会话$/g, '')
        .replace(/\s*·\s*第\s*\d+\s*轮\s*·\s*\d+\s*条可用消息\s*$/g, '')
        .trim();
}

function isSystemDisplayName(value = '') {
    return /^(sillytavern\s+system|system)\b/i.test(String(value || '').trim());
}

function displayableTavernName(value = '', fallback = '') {
    const cleaned = cleanTavernDisplayName(value);
    return cleaned && !isSystemDisplayName(cleaned) ? cleaned : fallback;
}

function sessionDisplayTitle(session?: TavernSessionRecord | null) {
    if (!session) {return '';}
    const character = displayableTavernName(session.characterName || '');
    if (character) {return character;}
    const title = displayableTavernName(session.title || '');
    if (title) {return title;}
    return '';
}

const selectedSessionTitle = computed(() => (
    sessionDisplayTitle(selectedSession.value)
    || displayableTavernName(effectiveCharacter.value.name || '')
    || '未选择角色'
));
const displayCharacterName = computed(() => (
    selectedSessionId.value
        ? selectedSessionTitle.value
        : (displayableTavernName(characterName.value) || '未选择角色')
));
const lastRequestSnapshot = computed(() => selectedSession.value?.state?.lastRequestSnapshot as RequestAuditSnapshot | undefined);
const lastRequestRawJson = computed(() => String(lastRequestSnapshot.value?.rawRequestJson || lastRequestSnapshot.value?.rawMessagesJson || ''));
const {
    archivedManagerRuns,
    currentManagerWorkRun,
    formatRunActivityLine,
    formatRunIssueLine,
    formatRunInputLine,
    formatRunMapLine,
    formatRunMemoryLine,
    formatRunModelLine,
    hiddenManagerRunCount,
    isManagerRunActive,
    managerBusy,
    managerRunTone,
    managerStatusClock,
    managerStatusLabel,
    managerToolStatusLabel,
    managerToolTone,
    managerToolTraceItems,
    toolTraceSummary,
} = useTavernManagerDisplay({
    managerRuns,
    visibleRunLimit: MANAGER_RUN_VISIBLE_LIMIT,
});

const phoneContext = useTavernPhoneController({
    selectedSessionId,
    effectiveContext,
    memoryFiles,
    agentConfig,
    chatRunning: isRunning,
    chatCancelling: isCancellingRun,
    memoryEditorMode,
    characterArchiveBusy: computed(() => characterArchiveSyncState.value.busy),
    requestHost,
    addHostMessageHandler: hostBridge.addMessageHandler,
}) satisfies TavernPhoneContext;

function isPhoneSendingForSession(sessionId = selectedSessionId.value): boolean {
    const id = String(sessionId || '').trim();
    return !!id && phoneContext.messages.isSending.value && phoneContext.messages.sendingSessionId.value === id;
}

function warnPhoneWorkInProgress(message = '手机消息正在等待回复，请稍后再试。'): void {
    showTavernToast(message, { tone: 'warning', durationMs: 2600 });
}

function sessionFloorCount(session?: TavernSessionRecord | null) {
    return sessionController.sessionFloorCount(session);
}

function sessionFloorLabel(session?: TavernSessionRecord | null) {
    return sessionController.sessionFloorLabel(session);
}

async function refreshSessionMessageCountsForSessions(targetSessions: TavernSessionRecord[] = []) {
    await sessionController.refreshSessionMessageCountsForSessions(targetSessions);
}

const activeMemoryFiles = computed(() => memoryFiles.value.filter((file) => file.status !== 'stale'));
const selectedMemoryFileEntry = computed(() => (
    memoryFiles.value.find((file) => file.path === selectedMemoryFilePath.value)
    || memoryFiles.value[0]
    || null
));
const selectedMemoryFile = computed(() => (
    selectedMemoryFileRecord.value?.sessionId === selectedSessionId.value
    && selectedMemoryFileRecord.value?.path === selectedMemoryFileEntry.value?.path
        ? selectedMemoryFileRecord.value
        : null
));
function memoryFileDisplayName(fileOrPath: TavernMemoryFileListEntry | TavernMemoryFileRecord | string | null | undefined) {
    const path = typeof fileOrPath === 'string' ? fileOrPath : String(fileOrPath?.path || '');
    if (path === 'memory/state.md') {return '会话记忆';}
    if (path.startsWith('memory/characters/') && path.endsWith('.md')) {
        return path.replace(/^memory\/characters\//, '').replace(/\.md$/i, '') || '人物记忆';
    }
    return path.replace(/^memory\//, '').replace(/\.md$/i, '') || '记忆档案';
}

function memoryFileKindLabel(fileOrPath: TavernMemoryFileListEntry | TavernMemoryFileRecord | string | null | undefined) {
    const path = typeof fileOrPath === 'string' ? fileOrPath : String(fileOrPath?.path || '');
    if (path === 'memory/state.md') {return '当前有效记忆状态';}
    if (path.startsWith('memory/characters/') && path.endsWith('.md')) {return '人物长期记忆';}
    return '记忆档案';
}

function memoryFileSortWeight(path = '') {
    if (path === 'memory/state.md') {return 0;}
    if (path.startsWith('memory/characters/')) {return 10;}
    return 30;
}

function memoryFileSearchCorpus(file: TavernMemoryIndexFileEntry) {
    const cached = memoryFileSearchCorpusCache.get(file);
    if (cached) {return cached;}
    const corpus = normalizedSearchText([
        file.path,
        memoryFileDisplayName(file),
        memoryFileKindLabel(file),
        file.status,
        file.searchText || file.preview || '',
    ].filter(Boolean).join('\n'));
    memoryFileSearchCorpusCache.set(file, corpus);
    return corpus;
}

function memoryFileVisibleLimitForGroup(groupKey = '') {
    const fallback = groupKey === 'turns' ? MEMORY_TURN_INITIAL_LIMIT : MEMORY_FILE_BATCH_SIZE;
    const value = Number(memoryFileGroupVisibleLimits.value[groupKey]);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
}

function expandMemoryFileGroup(groupKey = '') {
    const current = memoryFileVisibleLimitForGroup(groupKey);
    memoryFileGroupVisibleLimits.value = {
        ...memoryFileGroupVisibleLimits.value,
        [groupKey]: current + (groupKey === 'turns' ? MEMORY_TURN_BATCH_SIZE : MEMORY_FILE_BATCH_SIZE),
    };
}

const memoryDirectoryGroups = computed(() => {
    const sortedFiles = [...memoryFiles.value]
        .sort((left, right) => (
            memoryFileSortWeight(left.path) - memoryFileSortWeight(right.path)
            || String(left.path || '').localeCompare(String(right.path || ''))
        ));
    const query = normalizedSearchText(memoryFileSearchText.value);
    const selectedPath = String(selectedMemoryFilePath.value || '').trim();
    const filtered = query
        ? sortedFiles.filter((file) => memoryFileSearchCorpus(file).includes(query))
        : sortedFiles;
    if (!filtered.length && query) {return [];}
    const limit = memoryFileVisibleLimitForGroup('all');
    const files = filtered.slice(0, limit);
    if (selectedPath && !files.some((file) => file.path === selectedPath)) {
        const selected = filtered.find((file) => file.path === selectedPath);
        if (selected) {files.unshift(selected);}
    }
    return [{
        key: 'all',
        title: '',
        files,
        totalCount: sortedFiles.length,
        filteredCount: filtered.length,
        hiddenCount: Math.max(0, filtered.length - files.length),
    }];
});
const memoryEditorDocumentAvailable = computed(() => !!selectedMemoryFileEntry.value || !!memoryEditorLoadedPath.value);
const memoryEditorReadOnly = computed(() => (
    isRunning.value
    || managerBusy.value
    || isManagerAssistantRunning.value
    || isPhoneSendingForSession()
));
const memoryEditorDirty = computed(() => (
    !!memoryEditorLoadedPath.value
    && memoryEditorDraft.value !== memoryEditorBaseContent.value
));
const memoryIndexStatusLine = computed(() => {
    const index = memoryIndex.value;
    if (!index) {return '还没有可检索记忆';}
    if (index.status === 'ready') {return '记忆可检索';}
    if (index.status === 'failed') {return `记忆整理失败：${index.error || 'memory_index_failed'}`;}
    return '记忆正在整理';
});
const visibleChatMarkdownSignature = computed(() => visibleChatMessages.value
    .map((message) => `${message.sessionId}:${message.order}:${message.error ? 1 : 0}:${markdownSignature(message.content)}`)
    .join('|'));
const messageDisplayDepthByKey = computed(() => {
    return buildTavernMessageDisplayDepths({
        messages: loadedSessionMessages.value,
        sessionId: selectedSessionId.value,
        liveAssistantKey: runtimeAssistantMessageKey.value,
        messageKey,
        isDisplayMessage: isNormalRoleplayDisplayMessage,
    });
});
const runtimeThoughtsSignature = computed(() => runtimeThoughts.value
    .map((thought, index) => `${index}:${markdownSignature(String(thought.label || ''))}:${markdownSignature(String(thought.text || ''))}`)
    .join('|'));
const runtimeActionCheckSignature = computed(() => runtimeActionCheckEvents.value
    .map((event, index) => [
        index,
        event.toolCallId || '',
        event.character || '',
        event.stat,
        event.action,
        event.roll,
        event.difficulty,
        event.difficultyLabel || '',
        event.mode || '',
        event.threshold ?? '',
        event.statValue ?? '',
        event.statMax ?? '',
        event.outcome || '',
        event.insertAfterChars,
        event.success ? 1 : 0,
    ].join(':'))
    .join('|'));
const managerChatDisplayItems = computed(() => buildManagerChatDisplayItems(managerChatMessages.value));
const assistantChatHistoryTokens = computed(() => Math.ceil(
    new TextEncoder().encode(JSON.stringify(managerChatMessages.value)).length / 3.35,
));
const assistantChatContextLabel = computed(() => `${Math.round(assistantChatHistoryTokens.value / 1000)}k / 158k`);
const canClearAssistantChat = computed(() => managerChatMessages.value.length > 0 && !isManagerAssistantRunning.value);
const liveManagerAssistantDraft = computed(() => {
    const liveState = managerLiveProtocolState.value;
    return liveState?.sessionId === selectedSessionId.value ? liveState : null;
});
const visibleManagerLiveToolRound = computed(() => (
    managerLiveToolRound.value?.sessionId === selectedSessionId.value ? managerLiveToolRound.value : null
));
const visibleManagerPendingUserMessage = computed(() => {
    const pending = managerPendingUserMessage.value;
    if (!pending || pending.sessionId !== selectedSessionId.value) {return null;}
    return pending;
});
const managerMessageWindow = computed(() => getMessageWindow({
    uiMessageWindowLimit: managerMessageWindowLimit.value,
}, managerChatDisplayItems.value.length, { defaultLimit: hiddenOutsideCount.value }));
const visibleManagerChatItems = computed<ManagerChatDisplayItem[]>(() => managerChatDisplayItems.value.slice(managerMessageWindow.value.startIndex));
const visibleManagerChatMessages = computed(() => visibleManagerChatItems.value
    .filter((item): item is ManagerMessageDisplayItem => item.kind === 'message')
    .map((item) => item.message));
const visibleManagerMarkdownSignature = computed(() => visibleManagerChatItems.value
    .map((item) => item.kind === 'message'
        ? `${item.message.sessionId}:${item.message.order}:${markdownSignature(item.message.content)}`
        : `${item.key}:${markdownSignature(item.assistantMessage.content)}:${item.calls.map((call) => `${call.id}:${markdownSignature(call.resultText)}`).join(',')}`)
    .concat(htmlRenderEnabled.value ? 'html-render:on' : 'html-render:off')
    .concat(homeThemeDark.value ? 'theme:dark' : 'theme:light')
    .join('|'));
const liveManagerMarkdownSignature = computed(() => {
    const draft = liveManagerAssistantDraft.value;
    return draft
        ? `${draft.sessionId}:${draft.revision}`
        : '';
});
const managerPendingUserMarkdownSignature = computed(() => {
    const pending = visibleManagerPendingUserMessage.value;
    if (!pending) {return '';}
    return `${pending.sessionId}:${pending.createdAt}:${markdownSignature(pending.content)}`;
});
const managerWorkMarkdownSignature = computed(() => managerRuns.value
    .flatMap((run) => {
        const trace = Array.isArray(run.toolTrace) ? run.toolTrace : [];
        return trace.map((item, index) => {
            const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            return [
                run.id,
                index,
                record.id || '',
                markdownSignature(String(record.preface || '')),
            ].join(':');
        });
    })
    .concat(htmlRenderEnabled.value ? 'html-render:on' : 'html-render:off')
    .concat(homeThemeDark.value ? 'theme:dark' : 'theme:light')
    .join('|'));
const chatSubtitle = computed(() => {
    if (isPhoneSendingForSession()) {return '手机消息正在等待回复，完成后可继续剧情。';}
    if (!selectedSessionId.value) {return '写一句话后会自动创建独立会话。';}
    return sessionFloorLabel(selectedSession.value);
});
const canSendMessage = computed(() => !isCancellingRun.value && (
    isRunning.value
    || (!isRoleplayMessageEditing() && !isPhoneSendingForSession() && !selectedSessionCharacterError.value && !!currentUserMessage.value.trim())
));
const canSendManagerMessage = computed(() => !isManagerAssistantCancelling.value && (
    isManagerAssistantRunning.value
    || (!isPhoneSendingForSession() && !!selectedSessionId.value && !!managerInputDraft.value.trim())
));

watch(characterSearchText, () => {
    characterVisibleLimit.value = CHARACTER_ARCHIVE_BATCH_SIZE;
});

watch(filteredCharacterCards, (cards) => {
    if (!cards.length) {
        selectedCharacterPreviewKey.value = '';
        return;
    }
    const current = String(selectedCharacterPreviewKey.value || '').trim();
    if (current && cards.some((character) => character.characterKey === current)) {return;}
    selectedCharacterPreviewKey.value = '';
}, { immediate: true });

watch(selectedCharacterPreviewKey, () => {
    selectedCharacterGreetingIndex.value = 0;
    characterWorldbookState.value = null;
    characterWorldbookStatus.value = '';
    characterWorldbookSelectionOpen.value = false;
    characterWorldbookSelectionOptions.value = [];
});

watch([activeView, activeSettingsWorkspace], ([view, workspace], [previousView, previousWorkspace]) => {
    if (
        view === 'settings'
        && workspace === 'characters'
        && (previousView !== view || previousWorkspace !== workspace)
    ) {
        pendingCharacterError.value = '';
        void refreshCharacterList();
    }
});

watch(selectedCharacterGreetingOptions, (options) => {
    if (!options.length) {
        selectedCharacterGreetingIndex.value = 0;
        return;
    }
    const lastIndex = options.length - 1;
    if (selectedCharacterGreetingIndex.value > lastIndex) {
        selectedCharacterGreetingIndex.value = lastIndex;
    }
});

watch(memoryFileSearchText, () => {
    memoryFileGroupVisibleLimits.value = {};
});

watch(() => selectedCharacterSessions.value.map((session) => session.id).join('|'), () => {
    void refreshSessionMessageCountsForSessions(selectedCharacterSessions.value);
}, { immediate: true });

watch(() => currentChatCharacterSessions.value.map((session) => session.id).join('|'), () => {
    void refreshSessionMessageCountsForSessions(currentChatCharacterSessions.value);
}, { immediate: true });

function describeError(error: unknown) {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

function showTavernToast(
    message = '',
    options: { tone?: 'info' | 'warning' | 'danger'; durationMs?: number } = {},
) {
    const text = String(message || '').trim();
    if (!text) {return;}
    if (tavernToastTimer) {
        window.clearTimeout(tavernToastTimer);
        tavernToastTimer = null;
    }
    tavernToast.value = {
        id: Date.now(),
        message: text,
        tone: options.tone || 'info',
    };
    tavernToastTimer = window.setTimeout(() => {
        tavernToastTimer = null;
        tavernToast.value = null;
    }, Math.max(1200, options.durationMs ?? 3600));
}

async function applyTavernRegex(items: TavernApplyRegexItem[], options: { nativeCharacterId?: string } = {}): Promise<TavernApplyRegexResult> {
    if (!items.length) {
        return { items: [], changedCount: 0 };
    }
    const hasExplicitNativeCharacterId = Object.prototype.hasOwnProperty.call(options, 'nativeCharacterId');
    const nativeCharacterId = String(hasExplicitNativeCharacterId ? options.nativeCharacterId || '' : currentNativeCharacterId.value || '').trim();
    const response = await requestHost('xb-tavern:apply-regex', {
        payload: {
            nativeCharacterId,
            items,
        },
    });
    const result = (response.result || response) as Partial<TavernApplyRegexResult>;
    return {
        items: Array.isArray(result.items) ? result.items : [],
        changedCount: Number(result.changedCount) || 0,
    };
}

function applyTavernRegexForNativeCharacter(nativeCharacterId = '') {
    const resolvedNativeCharacterId = String(nativeCharacterId || '').trim();
    return (items: TavernApplyRegexItem[]) => applyTavernRegex(items, { nativeCharacterId: resolvedNativeCharacterId });
}

function clearRuntimeDisplayRegexRequests() {
    runtimeDisplayProjectionController.clear();
}

function clearDisplayRegexCache() {
    displayRegexCacheGeneration += 1;
    inFlightDisplayRegexRequests.clear();
    clearRuntimeDisplayRegexRequests();
    displayRegexCache.value = {};
}

function rememberDisplayRegexText(key: string, text: string) {
    const next = { ...displayRegexCache.value, [key]: text };
    const keys = Object.keys(next);
    if (keys.length > DISPLAY_REGEX_CACHE_LIMIT) {
        keys.slice(0, keys.length - DISPLAY_REGEX_CACHE_LIMIT).forEach((staleKey) => {
            delete next[staleKey];
        });
    }
    displayRegexCache.value = next;
    if (activeView.value === 'chat' && chatFocus.value === 'chat') {
        void nextTick(() => {
            enhanceChatMarkdown();
            updateChatScrollButtons();
        });
    }
}

function toDisplayRegexProjection(text: string, input: Pick<DisplayRegexTextRequest, 'actionCheckEvents' | 'actionCheckBoundaries'>): DisplayRegexProjection {
    const normalized = extractActionCheckRegexMarkers(
        text,
        input.actionCheckEvents || [],
        input.actionCheckBoundaries || [],
    );
    return {
        text: normalized.text,
        actionCheckEvents: normalized.events,
    };
}

const runtimeDisplayProjectionController = useTavernRuntimeDisplayProjection({
    throttleMs: RUNTIME_DISPLAY_REGEX_THROTTLE_MS,
    resolveText: async (input) => {
        const result = await applyTavernRegex([{
            id: input.key,
            text: input.text,
            placement: input.placement,
            options: input.options,
        }]);
        const item = result.items.find((candidate) => candidate.id === input.key) || result.items[0];
        return item?.text ?? input.text;
    },
    projectText: toDisplayRegexProjection,
    onError: (error) => {
        console.warn('[小白酒馆] 生成中显示正则应用失败', error);
    },
});
const runtimeDisplayRenderProjection = runtimeDisplayProjectionController.messageProjection;
const runtimeDisplayThoughtBlocks = runtimeDisplayProjectionController.thoughtBlocks;

function messageRegexPlacement(message: TavernMessageRecord): TavernApplyRegexItem['placement'] | null {
    if (message.role === 'user') {return 'userInput';}
    if (message.role === 'assistant') {return 'aiOutput';}
    return null;
}

function isNormalRoleplayDisplayMessage(message: TavernMessageRecord): boolean {
    return ['user', 'assistant'].includes(message.role)
        && !message.error
        && !!String(message.content || '').trim();
}

function messageDisplayDepth(message: TavernMessageRecord): number {
    const depth = Number(messageDisplayDepthByKey.value[messageKey(message)]);
    return Number.isFinite(depth) && depth >= 0 ? depth : 0;
}

function messageCharacterOverride(message: TavernMessageRecord): string {
    return String(message.name || roleLabel(message.role) || '').trim();
}

function displayRegexCacheKey(
    kind: 'message' | 'reasoning',
    message: TavernMessageRecord,
    input: {
        placement: TavernApplyRegexItem['placement'];
        text: string;
        depth: number;
        index?: number;
        label?: string;
        characterOverride?: string;
        actionCheckSignature?: string;
    },
) {
    return [
        kind,
        message.sessionId,
        String(currentNativeCharacterId.value || ''),
        String(message.order),
        message.role,
        String(message.name || ''),
        String(input.index ?? ''),
        input.placement,
        String(input.depth),
        input.characterOverride || '',
        input.actionCheckSignature || '',
        markdownSignature(String(input.label || '')),
        markdownSignature(input.text),
    ].join('\u0001');
}

function runtimeDisplayRegexCacheKey(
    kind: 'message' | 'reasoning',
    input: {
        placement: TavernApplyRegexItem['placement'];
        text: string;
        depth: number;
        index?: number;
        label?: string;
        characterOverride?: string;
        actionCheckSignature?: string;
    },
) {
    const latestOrder = selectedSessionLatestAssistantOrder.value;
    return [
        'runtime',
        kind,
        selectedSessionId.value,
        String(currentNativeCharacterId.value || ''),
        String(latestOrder),
        'assistant',
        String(input.index ?? ''),
        input.placement,
        String(input.depth),
        input.characterOverride || '',
        input.actionCheckSignature || '',
        markdownSignature(String(input.label || '')),
        markdownSignature(input.text),
    ].join('\u0001');
}

function actionCheckEventsCacheSignature(events: TavernActionCheckRuntimeEvent[] = []): string {
    return getActionCheckEvents(events)
        .map((event, index) => [
            index,
            event.toolCallId || '',
            event.createdAt || '',
            event.character || '',
            event.stat,
            event.action,
            event.roll,
            event.difficulty,
            event.difficultyLabel || '',
            event.mode || '',
            event.threshold ?? '',
            event.statValue ?? '',
            event.statMax ?? '',
            event.outcome || '',
            event.insertAfterChars,
            event.success ? 1 : 0,
            event.summary || '',
            event.stakes || '',
        ].join(':'))
        .join('|');
}

function resolveDisplayRegexText(input: DisplayRegexTextRequest): Promise<void> {
    const existing = inFlightDisplayRegexRequests.get(input.key);
    if (existing) {return existing;}
    const generation = displayRegexCacheGeneration;
    const request = (async () => {
        try {
            const result = await applyTavernRegex([{
                id: input.key,
                text: input.text,
                placement: input.placement,
                options: input.options,
            }]);
            if (generation !== displayRegexCacheGeneration) {return;}
            const item = result.items.find((candidate) => candidate.id === input.key) || result.items[0];
            rememberDisplayRegexText(input.key, item?.text ?? input.text);
        } catch (error) {
            console.warn('[小白酒馆] 显示正则应用失败', error);
            if (generation === displayRegexCacheGeneration) {
                rememberDisplayRegexText(input.key, input.text);
            }
        }
    })().finally(() => {
        if (inFlightDisplayRegexRequests.get(input.key) === request) {
            inFlightDisplayRegexRequests.delete(input.key);
        }
    });
    inFlightDisplayRegexRequests.set(input.key, request);
    return request;
}

interface MessageDisplayProjectionSource {
    fallback: DisplayRegexProjection;
    request: DisplayRegexTextRequest | null;
}

interface MessageThoughtDisplaySource {
    thought: { label?: string; text?: string };
    request: DisplayRegexTextRequest;
}

function messageDisplayProjectionSource(message: TavernMessageRecord): MessageDisplayProjectionSource {
    const text = String(message.content || '');
    if (!text) {
        return { fallback: { text: '', actionCheckEvents: [] }, request: null };
    }
    const actionCheckEvents = message.role === 'assistant' ? getActionCheckEvents(message.runtimeEvents) : [];
    if (!isNormalRoleplayDisplayMessage(message)) {
        return { fallback: { text, actionCheckEvents }, request: null };
    }
    const placement = messageRegexPlacement(message);
    if (!placement) {
        return { fallback: { text, actionCheckEvents }, request: null };
    }
    const markerPayload = actionCheckEvents.length
        ? injectActionCheckRegexMarkers(text, actionCheckEvents)
        : { text, boundaries: [] };
    const depth = messageDisplayDepth(message);
    const characterOverride = messageCharacterOverride(message);
    const key = displayRegexCacheKey('message', message, {
        placement,
        text: markerPayload.text,
        depth,
        characterOverride,
        actionCheckSignature: actionCheckEventsCacheSignature(actionCheckEvents),
    });
    const request: DisplayRegexTextRequest = {
        key,
        text: markerPayload.text,
        placement,
        options: {
            isMarkdown: true,
            depth,
            characterOverride,
        },
        actionCheckEvents,
        actionCheckBoundaries: markerPayload.boundaries,
    };
    return {
        fallback: toDisplayRegexProjection(markerPayload.text, request),
        request,
    };
}

function displayMessageRenderProjection(message: TavernMessageRecord): DisplayRegexProjection {
    const source = messageDisplayProjectionSource(message);
    const request = source.request;
    if (!request) {return source.fallback;}
    const cached = displayRegexCache.value[request.key];
    if (cached !== undefined) {
        return toDisplayRegexProjection(cached, request);
    }
    void resolveDisplayRegexText(request);
    return source.fallback;
}

function displayMessageContent(message: TavernMessageRecord): string {
    return displayMessageRenderProjection(message).text;
}

function messageThoughtDisplaySources(message: TavernMessageRecord): MessageThoughtDisplaySource[] {
    const depth = messageDisplayDepth(message);
    return thoughtBlocks(message).flatMap((thought, index) => {
        const text = String(thought.text || '');
        if (!text) {return [];}
        const key = displayRegexCacheKey('reasoning', message, {
            placement: 'reasoning',
            text,
            depth,
            index,
            label: thought.label,
        });
        return [{
            thought,
            request: {
                key,
                text,
                placement: 'reasoning',
                options: {
                    isMarkdown: true,
                    depth,
                },
            },
        }];
    });
}

function displayMessageThoughtBlocks(message: TavernMessageRecord): Array<{ label?: string; text?: string }> {
    return messageThoughtDisplaySources(message).map(({ thought, request }) => {
        const cached = displayRegexCache.value[request.key];
        if (cached !== undefined) {
            return { ...thought, text: cached };
        }
        void resolveDisplayRegexText(request);
        return thought;
    }).filter((thought) => String(thought.text || '').trim());
}

async function prepareAssistantMessageDisplay(message: TavernMessageRecord) {
    const messageRequest = messageDisplayProjectionSource(message).request;
    const thoughtRequests = messageThoughtDisplaySources(message).map((source) => source.request);
    const requests = [messageRequest, ...thoughtRequests].filter((request): request is DisplayRegexTextRequest => !!request);
    await Promise.all(requests.map((request) => (
        displayRegexCache.value[request.key] !== undefined
            ? Promise.resolve()
            : resolveDisplayRegexText(request)
    )));
}

function runtimeMessageDisplayRequest(): {
    request: TavernRuntimeDisplayRegexRequest | null;
    fallback: DisplayRegexProjection;
} {
    const text = String(runtimeText.value || '');
    const actionCheckEvents = getActionCheckEvents(runtimeActionCheckEvents.value);
    const fallback = { text: '', actionCheckEvents };
    if (!text) {return { request: null, fallback };}
    const markerPayload = injectActionCheckRegexMarkers(text, actionCheckEvents);
    const depth = 0;
    const characterOverride = String(roleLabel('assistant') || '').trim();
    const key = runtimeDisplayRegexCacheKey('message', {
        placement: 'aiOutput',
        text: markerPayload.text,
        depth,
        characterOverride,
        actionCheckSignature: actionCheckEventsCacheSignature(actionCheckEvents),
    });
    return {
        fallback,
        request: {
            key,
            text: markerPayload.text,
            placement: 'aiOutput',
            options: {
                isMarkdown: true,
                depth,
                characterOverride,
            },
            actionCheckEvents,
            actionCheckBoundaries: markerPayload.boundaries,
        },
    };
}

function runtimeThoughtDisplayRequests(): TavernRuntimeThoughtProjectionInput[] {
    const depth = 0;
    return thoughtBlocks(runtimeThoughts.value).map<TavernRuntimeThoughtProjectionInput>((thought, index) => {
        const text = String(thought.text || '');
        const slot = `runtime:reasoning:${index}`;
        if (!text) {
            return {
                slot,
                label: thought.label,
                fallbackText: text,
                request: null,
            };
        }
        const key = runtimeDisplayRegexCacheKey('reasoning', {
            placement: 'reasoning',
            text,
            depth,
            index,
            label: thought.label,
        });
        return {
            slot,
            label: thought.label,
            request: {
                key,
                text,
                placement: 'reasoning',
                options: {
                    isMarkdown: true,
                    depth,
                },
            },
        };
    });
}

function syncRuntimeDisplayProjectionRequests() {
    if (!isRunning.value || activeView.value !== 'chat' || chatFocus.value !== 'chat') {return;}
    const message = runtimeMessageDisplayRequest();
    runtimeDisplayProjectionController.setMessageInput(message.request, message.fallback);
    runtimeDisplayProjectionController.setThoughtInputs(runtimeThoughtDisplayRequests());
}

function displayRuntimeRenderProjection(): DisplayRegexProjection {
    return runtimeDisplayRenderProjection.value;
}

function displayRuntimeThoughtBlocks(): Array<{ label?: string; text?: string }> {
    return runtimeDisplayThoughtBlocks.value;
}

async function applyTavernSubstituteParams(items: TavernSubstituteParamsItem[]): Promise<TavernSubstituteParamsResult> {
    if (!items.length) {
        return { items: [], changedCount: 0 };
    }
    const response = await requestHost('xb-tavern:substitute-params', {
        payload: { items },
    });
    const result = (response.result || response) as Partial<TavernSubstituteParamsResult>;
    return {
        items: Array.isArray(result.items) ? result.items : [],
        changedCount: Number(result.changedCount) || 0,
    };
}

async function getNativeWorldbookRuntime(input: {
    context: XbTavernContext;
    currentUserMessage: string;
    trigger?: string;
    timedState?: unknown;
}): Promise<XbTavernNativeWorldInfoRuntime> {
    const response = await requestHost('xb-tavern:get-worldbook-runtime', {
        payload: {
            context: input.context,
            currentUserMessage: input.currentUserMessage,
            trigger: input.trigger,
            timedState: input.timedState,
        },
    });
    return (response.result || response) as XbTavernNativeWorldInfoRuntime;
}

const buildNativeChatPrompt: TavernBuildNativeChatPromptRuntime = async (input) => {
    const response = await requestHost('xb-tavern:build-native-chat-prompt', {
        payload: input,
    }, { signal: input.signal });
    return (response.result || response) as Awaited<ReturnType<TavernBuildNativeChatPromptRuntime>>;
};

async function getHostContext(input: {
    nativeCharacterId?: string;
    includeHistory?: boolean;
    includeWorldbooks?: boolean;
} = {}, options: { signal?: AbortSignal } = {}): Promise<Record<string, unknown>> {
    const response = await requestHost('xb-tavern:get-context', {
        payload: {
            nativeCharacterId: input.nativeCharacterId,
            includeHistory: input.includeHistory,
            includeWorldbooks: input.includeWorldbooks,
        },
    }, options);
    return (response.result || response) as Record<string, unknown>;
}

function currentContextCharacterKey() {
    return String(context.value.character?.characterKey || '').trim();
}

function sessionCharacterKey(session?: TavernSessionRecord | null): string {
    return String(session?.characterKey || session?.contextSnapshot?.character?.characterKey || '').trim();
}

function canApplyHostContext(nextContext: XbTavernContext = {}): boolean {
    const selectedKey = sessionCharacterKey(selectedSession.value);
    if (!String(selectedSessionId.value || '').trim() || !selectedKey) {return true;}
    return String(nextContext.character?.characterKey || '').trim() === selectedKey;
}

function assertContextMatchesCharacterKey(nextContext: XbTavernContext = {}, characterKey = ''): void {
    const expectedKey = String(characterKey || '').trim();
    if (!expectedKey) {return;}
    const actualKey = String(nextContext.character?.characterKey || '').trim();
    if (actualKey !== expectedKey) {
        throw new Error('刷新到的角色卡与当前会话不一致，请重新选择角色。');
    }
}

function currentContextCharacterReady() {
    return !!displayableTavernName(context.value.character?.name || '') && !!currentContextCharacterKey();
}

function hasAuthorNoteSnapshot(value: unknown): boolean {
    return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value as Record<string, unknown>).length > 0;
}

function preserveSessionAuthorNote(nextContext: XbTavernContext = {}, session?: TavernSessionRecord | null): XbTavernContext {
    const authorNote = session?.contextSnapshot?.authorNote;
    if (!hasAuthorNoteSnapshot(authorNote)) {return nextContext;}
    return {
        ...nextContext,
        authorNote: { ...(authorNote as Record<string, unknown>) },
    };
}

function applySessionSnapshotContext(session?: TavernSessionRecord | null): void {
    if (!session) {return;}
    context.value = preserveSessionAuthorNote(session.contextSnapshot || {}, session);
}

function clearSelectedSessionCharacterError(sessionId = selectedSessionId.value): void {
    if (String(sessionId || '').trim() !== String(selectedSessionId.value || '').trim()) {return;}
    selectedSessionCharacterError.value = '';
}

function setSelectedSessionCharacterError(error: unknown, sessionId = selectedSessionId.value): void {
    if (String(sessionId || '').trim() !== String(selectedSessionId.value || '').trim()) {return;}
    const errorText = describeError(error);
    selectedSessionCharacterError.value = errorText;
}

function buildSessionContextSnapshotBase(session: TavernSessionRecord): XbTavernContext {
    const snapshot = session.contextSnapshot || {};
    const snapshotCharacter = snapshot.character && typeof snapshot.character === 'object' && !Array.isArray(snapshot.character)
        ? snapshot.character
        : {};
    const characterKey = String(snapshotCharacter.characterKey || session.characterKey || '').trim();
    const name = String(snapshotCharacter.name || session.characterName || '').trim();
    if (!characterKey && !name) {return snapshot;}
    return {
        ...snapshot,
        character: {
            ...snapshotCharacter,
            characterKey,
            name,
        },
    };
}

async function saveCurrentAuthorNote(note: XbTavernAuthorNote): Promise<void> {
    const sessionId = String(selectedSessionId.value || '').trim();
    const session = selectedSession.value;
    if (!sessionId || !session) {
        throw new Error('当前没有可保存的会话。');
    }
    const normalized = normalizeXbTavernAuthorNote(note);
    const contextBase = buildSessionContextSnapshotBase(session);
    const nextContext: XbTavernContext = {
        ...contextBase,
        authorNote: normalized,
    };
    const updatedSession = await updateTavernSessionSnapshot(sessionId, {
        contextSnapshot: nextContext,
        characterKey: String(session.characterKey || nextContext.character?.characterKey || ''),
        characterName: String(nextContext.character?.name || session.characterName || ''),
    });
    if (updatedSession) {
        sessionController.updateSessionRecord(updatedSession);
    }
    if (selectedSessionId.value !== sessionId) {return;}
    context.value = nextContext;
}

async function syncSessionCharacterContext(options: { sessionId?: string; force?: boolean } = {}): Promise<XbTavernContext> {
    const targetSessionId = String(options.sessionId || selectedSessionId.value || '').trim();
    const session = sessions.value.find((item) => item.id === targetSessionId) || (targetSessionId === selectedSessionId.value ? selectedSession.value : null);
    if (!session) {return context.value;}
    const targetCharacterKey = String(session.characterKey || '').trim();
    if (!targetCharacterKey) {return context.value;}
    const alreadyHasTargetContext = currentContextCharacterReady() && currentContextCharacterKey() === targetCharacterKey;
    if (targetSessionId === String(selectedSessionId.value || '').trim()) {
        applySessionSnapshotContext(session);
    }
    const nativeCharacterId = resolveCurrentNativeCharacterId(targetCharacterKey);
    clearSelectedSessionCharacterError(targetSessionId);
    if (!options.force && alreadyHasTargetContext) {
        return context.value;
    }
    const syncSequence = ++sessionContextSyncSequence;
    const payload = await getHostContext({
        nativeCharacterId,
        includeHistory: false,
    });
    if (syncSequence !== sessionContextSyncSequence) {
        return context.value;
    }
    if (targetSessionId !== String(selectedSessionId.value || '').trim()) {
        return context.value;
    }
    const nextContext = preserveSessionAuthorNote(payload.context as XbTavernContext || context.value, session);
    assertContextMatchesCharacterKey(nextContext, targetCharacterKey);
    applyHostPayload({
        ...payload,
        context: nextContext,
    });
    const updatedSession = await updateTavernSessionSnapshot(targetSessionId, {
        contextSnapshot: nextContext,
        characterKey: String(nextContext.character?.characterKey || session.characterKey || ''),
        characterName: String(nextContext.character?.name || session.characterName || ''),
    });
    if (updatedSession) {
        sessionController.updateSessionRecord(updatedSession);
    }
    return nextContext;
}

async function syncSessionCharacterContextSafely(options: { sessionId?: string; force?: boolean } = {}): Promise<void> {
    const targetSessionId = String(options.sessionId || selectedSessionId.value || '').trim();
    try {
        await syncSessionCharacterContext(options);
    } catch (error) {
        setSelectedSessionCharacterError(error, targetSessionId);
    }
}

async function resolveRuntimeContextForSession(sessionId = selectedSessionId.value): Promise<XbTavernContext> {
    const targetSessionId = String(sessionId || '').trim();
    if (!targetSessionId) {return context.value;}
    try {
        return await syncSessionCharacterContext({ sessionId: targetSessionId, force: true });
    } catch (error) {
        setSelectedSessionCharacterError(error, targetSessionId);
        throw error;
    }
}

function installHostRequestHeadersProvider(payload: Record<string, unknown> = {}) {
    const fallbackHeaders = payload.hostRequestHeaders && typeof payload.hostRequestHeaders === 'object'
        ? payload.hostRequestHeaders as Record<string, unknown>
        : hostRequestHeaders.value;
    hostRequestHeaders.value = fallbackHeaders || {};
    setHostChatCompletionsRequestHeadersProvider(async () => {
        try {
            const result = await requestHost('xb-tavern:get-host-request-headers');
            return result.hostRequestHeaders && typeof result.hostRequestHeaders === 'object'
                ? result.hostRequestHeaders as Record<string, unknown>
                : hostRequestHeaders.value;
        } catch {
            return hostRequestHeaders.value;
        }
    });
}

function applyHostPayload(payload: Record<string, unknown>) {
    installHostRequestHeadersProvider(payload);
    if ('context' in payload) {
        const nextContext = payload.context as XbTavernContext || {};
        if (canApplyHostContext(nextContext)) {
            context.value = nextContext;
        }
    }
    if ('diagnostics' in payload) {
        diagnostics.value = payload.diagnostics as TavernDiagnostics || {};
    }
    const nextHostMainFontSizePx = 'hostMainFontSizePx' in payload
        ? normalizeHostPx(payload.hostMainFontSizePx, hostMainFontSizePx.value)
        : hostMainFontSizePx.value;
    hostMainFontSizePx.value = nextHostMainFontSizePx;
    hostProseLineHeightPx.value = 'hostProseLineHeightPx' in payload
        ? normalizeHostPx(payload.hostProseLineHeightPx, deriveHostProseLineHeightPx(nextHostMainFontSizePx))
        : deriveHostProseLineHeightPx(nextHostMainFontSizePx);
    if ('agentConfig' in payload) {
        agentConfig.value = payload.agentConfig as Record<string, unknown> || agentConfig.value;
        syncApiSettingsConfigFromAgentConfig();
    }
    if ('tavernDisplaySettings' in payload) {
        tavernDisplaySettings.value = normalizeTavernDisplaySettings(payload.tavernDisplaySettings);
    }
    if ('htmlRenderEnabled' in payload) {
        htmlRenderEnabled.value = payload.htmlRenderEnabled !== false;
    }
    if ('extensionBasePath' in payload) {
        void materialSymbolFont.load(payload.extensionBasePath);
    }
    applyHostChatPreset(payload);
    availableCharacters.value = payload.availableCharacters as TavernCharacterOption[] || availableCharacters.value;
    statusText.value = diagnostics.value.message || '';
    void finishPendingCharacterSession().catch((error) => {
        pendingCharacterError.value = error instanceof Error ? error.message : String(error || 'create_session_failed');
        clearPendingCharacterSession();
    });
    void nextTick(renderApiSettingsPanel);
}

function startPostReadyStartupTasksAfterInitialConfig() {
    if (!initialConfigApplied || postReadyStartupStarted) {return;}
    postReadyStartupStarted = true;
    void runPostReadyStartupTasks();
}

function applyCharacterListPayload(payload: Record<string, unknown>) {
    const characters = payload.availableCharacters;
    if (Array.isArray(characters)) {
        availableCharacters.value = characters as TavernCharacterOption[];
    }
}

function hasCharacterPreviewDetails(character: TavernCharacterOption | null | undefined) {
    return !!character && !!(
        character.description
        || character.personality
        || character.scenario
        || character.firstMessage
        || character.mesExample
        || character.creatorNotes
        || character.characterDepthPrompt
        || character.alternateGreetings?.length
    );
}

function hostMessagePayload(data: TavernHostMessageData): Record<string, unknown> {
    return data.payload && typeof data.payload === 'object' ? data.payload : {};
}

function handleInlineImageProgressHostMessage(data: TavernHostMessageData) {
    if (data.type === TAVERN_INLINE_IMAGE_PROGRESS_EVENT) {
        window.dispatchEvent(new CustomEvent(TAVERN_INLINE_IMAGE_PROGRESS_EVENT, {
            detail: hostMessagePayload(data),
        }));
        return true;
    }
    return false;
}

function handleConfigHostMessage(data: TavernHostMessageData) {
    if (data.type === 'xb-tavern:config') {
        reportStartupProgress(88, 'applyHostPayload');
        applyHostPayload(hostMessagePayload(data));
        initialConfigApplied = true;
        startPostReadyStartupTasksAfterInitialConfig();
        return true;
    }
    if (data.type === 'xb-tavern:context') {
        applyHostPayload(hostMessagePayload(data));
        return true;
    }
    if (data.type === 'xb-tavern:config-saved') {
        handleApiConfigSaved(hostMessagePayload(data));
        return true;
    }
    return false;
}

hostBridge.addMessageHandler((data) => drawContext.handleHostMessage(data));
hostBridge.addMessageHandler(handleInlineImageProgressHostMessage);
hostBridge.addMessageHandler(handleConfigHostMessage);

function clearCharacterSelection() {
    pendingCharacterError.value = '';
    selectedCharacterPreviewKey.value = '';
}

function openCharacterSelect() {
    clearCharacterSelection();
    openSettingsWorkspace('characters');
}

async function refreshCharacterList() {
    statusText.value = '正在读取角色列表';
    pendingCharacterError.value = '';
    try {
        const payload = await getHostContext({ includeHistory: false, includeWorldbooks: false });
        applyCharacterListPayload(payload);
        statusText.value = diagnostics.value.message || '';
    } catch (error) {
        pendingCharacterError.value = describeError(error);
    }
}

async function selectCharacterForPreview(characterKey: string) {
    const targetKey = String(characterKey || '').trim();
    if (!targetKey || pendingCharacterSessionKey.value) {return;}
    selectedCharacterPreviewKey.value = targetKey;
    const current = findCharacterByKey(targetKey);
    if (current && current.shallow !== true && hasCharacterPreviewDetails(current)) {return;}
    const sequence = ++characterPreviewRequestSequence;
    pendingCharacterPreviewKey.value = targetKey;
    pendingCharacterError.value = '';
    try {
        const nativeCharacterId = resolveCurrentNativeCharacterId(targetKey);
        const payload = await getHostContext({ nativeCharacterId, includeHistory: false, includeWorldbooks: false });
        if (sequence !== characterPreviewRequestSequence || selectedCharacterPreviewKey.value !== targetKey) {return;}
        applyCharacterListPayload(payload);
    } catch (error) {
        if (sequence !== characterPreviewRequestSequence || selectedCharacterPreviewKey.value !== targetKey) {return;}
        pendingCharacterError.value = error instanceof Error ? error.message : String(error || 'character_preview_failed');
    } finally {
        if (sequence === characterPreviewRequestSequence && pendingCharacterPreviewKey.value === targetKey) {
            pendingCharacterPreviewKey.value = '';
        }
    }
}

async function syncCharacterWorldbookState(characterKey = selectedCharacterPreviewKey.value) {
    const targetKey = String(characterKey || '').trim();
    if (!targetKey) {
        characterWorldbookState.value = null;
        characterWorldbookSelectionOpen.value = false;
        characterWorldbookSelectionOptions.value = [];
        return;
    }
    const sequence = ++characterWorldbookRequestSequence;
    try {
        const nativeCharacterId = resolveCurrentNativeCharacterId(targetKey);
        const result = await requestHost('xb-tavern:get-character-worldbook-state', {
            payload: { nativeCharacterId },
        });
        if (sequence !== characterWorldbookRequestSequence || String(selectedCharacterPreviewKey.value || '').trim() !== targetKey) {return;}
        characterWorldbookState.value = (result.result || result) as unknown as TavernCharacterWorldbookState;
        characterWorldbookStatus.value = '';
    } catch (error) {
        if (sequence !== characterWorldbookRequestSequence || String(selectedCharacterPreviewKey.value || '').trim() !== targetKey) {return;}
        characterWorldbookStatus.value = describeError(error);
    }
}

async function openSelectedCharacterWorldbook() {
    const targetKey = String(selectedCharacterPreviewKey.value || '').trim();
    if (!targetKey || characterWorldbookBusy.value) {return;}
    characterWorldbookBusy.value = true;
    characterWorldbookStatus.value = '';
    try {
        const nativeCharacterId = resolveCurrentNativeCharacterId(targetKey);
        let result = await requestHost('xb-tavern:activate-character-worldbook', {
            payload: { nativeCharacterId },
        });
        let payload = (result.result || result) as TavernCharacterWorldbookActionResult;
        if (payload.action === 'needs_import_confirmation') {
            const name = String(payload.name || '').trim();
            const state = payload.state as TavernCharacterWorldbookState | undefined;
            if (state) {characterWorldbookState.value = state;}
            const shouldOverwrite = name && await confirmTavernDialog({
                title: '覆盖世界书',
                message: `世界书「${name}」已存在，导入角色内嵌世界书会覆盖它。继续？`,
                confirmText: '继续覆盖',
                tone: 'warning',
            });
            if (!shouldOverwrite) {
                return;
            }
            result = await requestHost('xb-tavern:activate-character-worldbook', {
                payload: { nativeCharacterId, confirmed: true },
            });
            payload = (result.result || result) as TavernCharacterWorldbookActionResult;
        }
        const action = String(payload.action || '');
        if (action === 'selected' || action === 'imported') {
            const state = payload.state as TavernCharacterWorldbookState | undefined;
            if (state) {characterWorldbookState.value = state;}
            if (action === 'imported') {
                postToHost('xb-tavern:refresh-context', { nativeCharacterId, includeHistory: false });
            }
            openWorldbookWorkspace(String(payload.name || ''));
            return;
        }
        if (action === 'needs_selection') {
            characterWorldbookSelectionOptions.value = normalizeTextList(payload.worldbookOptions);
            characterWorldbookSelectionOpen.value = true;
            const state = payload.state as TavernCharacterWorldbookState | undefined;
            if (state) {characterWorldbookState.value = state;}
            return;
        }
        await syncCharacterWorldbookState(targetKey);
    } catch (error) {
        characterWorldbookStatus.value = describeError(error);
    } finally {
        characterWorldbookBusy.value = false;
    }
}

function closeCharacterWorldbookSelection() {
    characterWorldbookSelectionOpen.value = false;
}

async function bindSelectedCharacterWorldbook(name: string) {
    const targetKey = String(selectedCharacterPreviewKey.value || '').trim();
    const targetName = String(name || '').trim();
    if (!targetKey || !targetName || characterWorldbookBusy.value) {return;}
    characterWorldbookBusy.value = true;
    characterWorldbookStatus.value = '';
    try {
        const nativeCharacterId = resolveCurrentNativeCharacterId(targetKey);
        const result = await requestHost('xb-tavern:bind-character-worldbook', {
            payload: { nativeCharacterId, name: targetName },
        });
        characterWorldbookState.value = (result.result || result) as unknown as TavernCharacterWorldbookState;
        characterWorldbookSelectionOpen.value = false;
        postToHost('xb-tavern:refresh-context', { nativeCharacterId, includeHistory: false });
        openWorldbookWorkspace(targetName);
    } catch (error) {
        characterWorldbookStatus.value = describeError(error);
    } finally {
        characterWorldbookBusy.value = false;
    }
}

function createCharacterArchiveId(): string {
    return `archive-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function updateCharacterArchiveSyncState(patch: Partial<TavernCharacterArchiveProgress>) {
    const current = characterArchiveSyncState.value;
    const nextPercent = 'percent' in patch
        ? Math.max(Number(current.percent) || 0, Math.max(0, Math.min(100, Number(patch.percent) || 0)))
        : current.percent;
    characterArchiveSyncState.value = {
        ...current,
        ...patch,
        percent: nextPercent,
    };
}

function startCharacterArchiveSync(mode: 'backup' | 'restore') {
    characterArchiveSyncState.value = {
        ...createIdleCharacterArchiveSyncState(),
        busy: true,
        mode,
        phase: mode === 'backup' ? '扫描角色档案' : '读取备份清单',
        message: mode === 'backup' ? '正在扫描当前角色卡的本地会话档案。' : '正在读取酒馆服务器备份清单。',
    };
}

function clearCharacterArchiveSyncState() {
    if (characterArchiveSyncState.value.busy) {return;}
    characterArchiveSyncState.value = createIdleCharacterArchiveSyncState();
}

function isMissingCharacterArchiveBackupError(error: unknown): boolean {
    const message = describeError(error);
    return message === 'archive_manifest_missing'
        || /^archive_download_failed_http_404\b/.test(message);
}

function describeCharacterArchiveSyncError(error: unknown): string {
    const message = describeError(error);
    if (message === 'archive_manifest_missing' || /^archive_download_failed_http_404\b/.test(message)) {
        return '这张角色卡还没有酒馆服务器备份。请先备份后再恢复。';
    }
    if (message === 'archive_manifest_invalid') {
        return '酒馆服务器上的备份清单不是有效 JSON，无法恢复。';
    }
    if (message === 'archive_manifest_mismatch' || message === 'archive_character_mismatch') {
        return '酒馆服务器上的备份清单不属于当前角色卡，已停止恢复。';
    }
    return message;
}

function failCharacterArchiveSync(error: unknown) {
    const missingBackup = isMissingCharacterArchiveBackupError(error);
    const current = characterArchiveSyncState.value;
    characterArchiveSyncState.value = {
        ...current,
        busy: false,
        phase: missingBackup ? '未找到备份' : '失败',
        percent: missingBackup ? 0 : current.percent,
        partIndex: missingBackup ? 0 : current.partIndex,
        partCount: missingBackup ? 0 : current.partCount,
        loadedBytes: missingBackup ? 0 : current.loadedBytes,
        totalBytes: missingBackup ? 0 : current.totalBytes,
        error: describeCharacterArchiveSyncError(error),
        message: missingBackup ? '当前角色卡暂无服务器备份。' : '操作失败。',
    };
}

async function getTavernArchiveRequestHeaders(): Promise<Record<string, unknown>> {
    try {
        const result = await requestHost('xb-tavern:get-host-request-headers');
        return result.hostRequestHeaders && typeof result.hostRequestHeaders === 'object'
            ? result.hostRequestHeaders as Record<string, unknown>
            : hostRequestHeaders.value;
    } catch {
        return hostRequestHeaders.value;
    }
}

function summarizeArchiveCounts(counts = createEmptyTavernCharacterArchiveCounts()): string {
    return [
        `${counts.sessions} 个会话`,
        `${counts.messages} 条消息`,
        `${counts.memoryFiles} 份记忆`,
        `${counts.stateDocuments} 份地图/图鉴`,
        `${Number(counts.communications) || 0} 条通讯数据`,
        `${Number(counts.economy) || 0} 条经济数据`,
    ].join('，');
}

async function backupSelectedCharacterArchive() {
    if (characterArchiveSyncState.value.busy) {return;}
    if (managerBusy.value || isManagerAssistantRunning.value) {
        showTavernToast('档案正在维护，完成后再备份角色档案。', { tone: 'warning', durationMs: 3000 });
        return;
    }
    if (phoneContext.messages.isSending.value) {
        warnPhoneWorkInProgress('手机消息正在等待回复，稍后再备份角色档案。');
        return;
    }
    const character = selectedCharacterPreview.value;
    const characterKey = String(character?.characterKey || '').trim();
    if (!character || !characterKey) {return;}
    startCharacterArchiveSync('backup');
    try {
        const archiveId = createCharacterArchiveId();
        const characterHash = await buildTavernCharacterArchiveCharacterHash(characterKey);
        updateCharacterArchiveSyncState({
            phase: '扫描角色档案',
            percent: 5,
            message: `正在扫描「${character.name}」的本地档案。`,
        });
        let uploadedBytes = 0;
        const estimateUploadPercent = (partIndex: number, partLoadedBytes = 0, partTotalBytes = 1): number => {
            const currentPartProgress = Math.max(0, Math.min(1, partLoadedBytes / Math.max(partTotalBytes, 1)));
            const optimisticPartCount = Math.max(partIndex + 1, 2);
            return 55 + Math.min(39, Math.round((((partIndex - 1) + currentPartProgress) / optimisticPartCount) * 39));
        };
        const writer = new TavernCharacterArchiveWriter({
            archiveId,
            filenameForPart: (index) => buildTavernCharacterArchivePartFilename(characterHash, archiveId, index),
            uploadPart: async (part) => {
                updateCharacterArchiveSyncState({
                    phase: '上传分卷',
                    partIndex: part.index,
                    loadedBytes: uploadedBytes,
                    totalBytes: uploadedBytes + part.bytes.length,
                    message: `正在上传分卷 ${part.index}。`,
                    percent: estimateUploadPercent(part.index, 0, part.bytes.length),
                });
                await uploadTavernCharacterArchiveFile(part.filename, part.bytes, {
                    headersProvider: getTavernArchiveRequestHeaders,
                    onProgress: (progress) => {
                        updateCharacterArchiveSyncState({
                            phase: '上传分卷',
                            partIndex: part.index,
                            loadedBytes: uploadedBytes + progress.loadedBytes,
                            totalBytes: uploadedBytes + (progress.totalBytes || part.bytes.length),
                            percent: estimateUploadPercent(part.index, progress.loadedBytes, progress.totalBytes || part.bytes.length),
                            message: `正在上传分卷 ${part.index}。`,
                        });
                    },
                });
                uploadedBytes += part.bytes.length;
            },
            onPartFlushed: (part) => {
                updateCharacterArchiveSyncState({
                    partIndex: part.index,
                    partCount: part.index,
                    loadedBytes: uploadedBytes,
                    totalBytes: uploadedBytes,
                    message: `分卷 ${part.index} 已上传。`,
                });
            },
        });
        const summary = await exportTavernCharacterArchive({
            archiveId,
            character: {
                characterKey,
                name: String(character.name || ''),
                avatar: String(character.avatar || ''),
                nativeCharacterId: String(character.nativeCharacterId || ''),
            },
            writer,
            onProgress: (progress) => {
                const sessionRatio = progress.sessionCount
                    ? progress.sessionIndex / Math.max(progress.sessionCount, 1)
                    : 1;
                updateCharacterArchiveSyncState({
                    phase: progress.phase === 'scan' ? '扫描角色档案' : '导出并分卷',
                    percent: progress.phase === 'scan' ? 10 : 10 + Math.round(sessionRatio * 45),
                    message: progress.table
                        ? `正在导出 ${progress.table}。`
                        : '正在扫描当前角色卡会话。',
                });
            },
        });
        const writerResult = await writer.close();
        const manifest: TavernCharacterArchiveManifest = {
            version: CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION,
            archiveId,
            complete: true,
            exportedAt: summary.exportedAt,
            character: summary.character,
            counts: summary.counts,
            parts: writerResult.parts,
        };
        updateCharacterArchiveSyncState({
            phase: '写入备份清单',
            percent: 96,
            partCount: manifest.parts.length,
            loadedBytes: uploadedBytes,
            totalBytes: uploadedBytes,
            message: '正在写入备份清单。',
        });
        await uploadTavernCharacterArchiveManifest(manifest, characterHash, {
            headersProvider: getTavernArchiveRequestHeaders,
        });
        updateCharacterArchiveSyncState({
            busy: false,
            phase: '完成',
            percent: 100,
            message: `已备份：${summarizeArchiveCounts(summary.counts)}。`,
            error: '',
            result: {
                counts: summary.counts,
                exportedAt: summary.exportedAt,
                size: manifest.parts.reduce((total, part) => total + part.compressedBytes, 0),
            },
        });
    } catch (error) {
        failCharacterArchiveSync(error);
    }
}

async function restoreSelectedCharacterArchive() {
    if (characterArchiveSyncState.value.busy) {return;}
    if (managerBusy.value || isManagerAssistantRunning.value) {
        showTavernToast('档案正在维护，完成后再恢复角色档案。', { tone: 'warning', durationMs: 3000 });
        return;
    }
    if (phoneContext.messages.isSending.value) {
        warnPhoneWorkInProgress('手机消息正在等待回复，稍后再恢复角色档案。');
        return;
    }
    const character = selectedCharacterPreview.value;
    const characterKey = String(character?.characterKey || '').trim();
    if (!character || !characterKey) {return;}
    startCharacterArchiveSync('restore');
    try {
        const characterHash = await buildTavernCharacterArchiveCharacterHash(characterKey);
        const manifest = await downloadTavernCharacterArchiveManifest(characterHash, {
            headersProvider: getTavernArchiveRequestHeaders,
            onProgress: (progress) => {
                updateCharacterArchiveSyncState({
                    phase: '读取备份清单',
                    percent: 10,
                    loadedBytes: progress.loadedBytes,
                    totalBytes: progress.totalBytes,
                    message: '正在读取备份清单。',
                });
            },
        });
        if (
            manifest.complete !== true
            || manifest.version !== CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION
            || String(manifest.character?.characterKey || '').trim() !== characterKey
        ) {
            throw new Error('archive_manifest_mismatch');
        }
        const confirmed = await confirmTavernDialog({
            title: '确认恢复会话档案',
            message: `将从酒馆服务器恢复「${character.name}」的会话档案，并覆盖当前本地档案。其他角色不会受影响。`,
            confirmText: '覆盖恢复',
            cancelText: '取消',
            tone: 'warning',
        });
        if (!confirmed) {
            characterArchiveSyncState.value = {
                ...createIdleCharacterArchiveSyncState(),
                mode: 'restore',
                message: '已取消恢复，本地档案未修改。',
            };
            return;
        }
        const totalCompressedBytes = manifest.parts.reduce((total, part) => total + part.compressedBytes, 0);
        let downloadedBytes = 0;
        let verifiedParts = 0;
        async function* readRestoreRecordBatches(): AsyncIterable<TavernCharacterArchiveRecord[]> {
            for (const part of manifest.parts) {
                updateCharacterArchiveSyncState({
                    phase: '下载分卷',
                    partIndex: part.index,
                    partCount: manifest.parts.length,
                    loadedBytes: downloadedBytes,
                    totalBytes: totalCompressedBytes,
                    percent: 10,
                    message: `正在下载分卷 ${part.index} / ${manifest.parts.length}。`,
                });
                const compressed = await downloadTavernCharacterArchiveFile(part.filename, {
                    headersProvider: getTavernArchiveRequestHeaders,
                    onProgress: (progress) => {
                        updateCharacterArchiveSyncState({
                            phase: '下载分卷',
                            partIndex: part.index,
                            partCount: manifest.parts.length,
                            loadedBytes: downloadedBytes + progress.loadedBytes,
                            totalBytes: totalCompressedBytes || progress.totalBytes,
                            percent: 10 + Math.round(((downloadedBytes + progress.loadedBytes) / Math.max(totalCompressedBytes || progress.totalBytes || 1, 1)) * 35),
                            message: `正在下载分卷 ${part.index} / ${manifest.parts.length}。`,
                        });
                    },
                });
                downloadedBytes += compressed.length;
                updateCharacterArchiveSyncState({
                    phase: '解压校验',
                    percent: 45 + Math.round((verifiedParts / Math.max(manifest.parts.length, 1)) * 20),
                    loadedBytes: downloadedBytes,
                    totalBytes: totalCompressedBytes,
                    message: `正在校验分卷 ${part.index}。`,
                });
                const digest = await sha256Hex(compressed);
                if (digest !== part.sha256) {
                    throw new Error(`archive_part_sha256_mismatch:${part.filename}`);
                }
                const raw = await ungzipTavernArchiveBytes(compressed);
                verifiedParts += 1;
                updateCharacterArchiveSyncState({
                    phase: '写入临时恢复区',
                    percent: 65,
                    message: `正在写入临时恢复区：分卷 ${part.index}。`,
                });
                for (const batch of parseTavernCharacterArchiveJsonlBatches(raw, 500)) {
                    yield batch;
                }
            }
        }
        const restoreSummary = await restoreTavernCharacterArchiveFromRecords({
            manifest,
            characterKey,
            recordBatches: readRestoreRecordBatches(),
            onProgress: (progress) => {
                updateCharacterArchiveSyncState({
                    phase: progress.phase === 'promote' ? '切换为正式档案' : '写入临时恢复区',
                    percent: progress.phase === 'promote' ? 95 : 65 + Math.min(20, Math.round((progress.rowCount / Math.max(1, manifest.parts.reduce((total, part) => total + part.rowCount, 0))) * 20)),
                    message: progress.phase === 'promote'
                        ? '正在切换为正式档案。'
                        : `正在写入 ${progress.table || '档案'}。`,
                });
            },
        });
        updateCharacterArchiveSyncState({
            phase: '刷新界面',
            percent: 98,
            message: '正在刷新角色卡会话列表。',
        });
        await refreshSessions();
        updateCharacterArchiveSyncState({
            busy: false,
            phase: '完成',
            percent: 100,
            message: `已恢复：${summarizeArchiveCounts(restoreSummary.counts)}。`,
            error: '',
            result: {
                counts: restoreSummary.counts,
                exportedAt: manifest.exportedAt,
                size: totalCompressedBytes,
            },
        });
    } catch (error) {
        failCharacterArchiveSync(error);
    }
}

function selectCharacterGreeting(index: number) {
    const options = selectedCharacterGreetingOptions.value;
    if (!options.length) {
        selectedCharacterGreetingIndex.value = 0;
        return;
    }
    selectedCharacterGreetingIndex.value = Math.max(0, Math.min(options.length - 1, Number(index) || 0));
}

function moveCharacterPreview(delta: number) {
    const cards = visibleCharacterCards.value;
    if (!cards.length || pendingCharacterSessionKey.value) {return;}
    const currentKey = String(selectedCharacterPreview.value?.characterKey || selectedCharacterPreviewKey.value || '').trim();
    if (!currentKey) {
        selectedCharacterPreviewKey.value = cards[delta < 0 ? cards.length - 1 : 0]?.characterKey || '';
        return;
    }
    const currentIndex = Math.max(0, cards.findIndex((character) => character.characterKey === currentKey));
    const nextIndex = Math.min(cards.length - 1, Math.max(0, currentIndex + delta));
    selectedCharacterPreviewKey.value = cards[nextIndex]?.characterKey || '';
}

function selectFirstVisibleCharacter() {
    selectedCharacterPreviewKey.value = visibleCharacterCards.value[0]?.characterKey || '';
}

function selectLastVisibleCharacter() {
    selectedCharacterPreviewKey.value = visibleCharacterCards.value.at(-1)?.characterKey || '';
}

function loadMoreCharacters() {
    characterVisibleLimit.value += CHARACTER_ARCHIVE_BATCH_SIZE;
}

async function enterSelectedCharacter() {
    const targetKey = String(selectedCharacterPreview.value?.characterKey || selectedCharacterPreviewKey.value || '').trim();
    if (!targetKey || pendingCharacterSessionKey.value) {return;}
    await selectCharacterAndCreateSession(targetKey);
}

function clearLoadedSessionMessageWindow() {
    sessionController.clearLoadedSessionMessageWindow();
}

async function loadSelectedSessionMessageWindow(options: { reset?: boolean; sessionId?: string } = {}) {
    await sessionController.loadSelectedSessionMessageWindow(options);
}

function upsertLoadedSessionMessage(message: TavernMessageRecord) {
    sessionController.upsertLoadedSessionMessage(message);
}

function pruneLoadedSessionMessagesFromOrder(sessionId = '', fromOrder = Number.POSITIVE_INFINITY): number {
    return sessionController.pruneLoadedSessionMessagesFromOrder(sessionId, fromOrder);
}

function compactLoadedSessionMessageWindow(reservedTailSlots = 0): number {
    return sessionController.compactLoadedSessionMessageWindow(reservedTailSlots);
}

function touchSessionLocally(sessionId: string, updatedAt = Date.now()) {
    sessionController.touchSessionLocally(sessionId, updatedAt);
}

async function refreshSessions() {
    await sessionController.refreshSessions();
}

async function refreshSessionRecord(sessionId = '') {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const session = await getTavernSession(id);
    if (session) {
        sessionController.updateSessionRecord(session);
    }
    return session;
}

async function saveSessionContract(nextContract: Partial<TavernSessionContract> = {}) {
    const sessionId = String(selectedSessionId.value || '').trim();
    if (!sessionId) {return null;}
    const updated = await updateTavernSessionState(sessionId, {
        contract: normalizeTavernSessionContract({
            ...sessionContract.value,
            ...nextContract,
        }),
    });
    if (!updated) {return null;}
    sessionController.updateSessionRecord(updated);
    return updated;
}

async function refreshAssistantChat(sessionId = selectedSessionId.value) {
    const id = String(sessionId || '').trim();
    if (!id) {
        if (!selectedSessionId.value) {managerChatMessages.value = [];}
        return;
    }
    if (id !== selectedSessionId.value) {return;}
    const requestSerial = ++assistantChatRefreshSerial;
    const messages = await listTavernAssistantChatMessages(id);
    if (requestSerial !== assistantChatRefreshSerial || id !== selectedSessionId.value) {return;}
    managerChatMessages.value = messages;
}

async function refreshManagerRecords(sessionId = selectedSessionId.value) {
    reportStartupProgress(95, 'refreshManagerRecords');
    const requestSerial = ++managerRecordsRefreshSerial;
    const id = String(sessionId || '').trim();
    if (!id) {
        managerRuns.value = [];
        memoryFiles.value = [];
        memoryIndex.value = null;
        invalidateMemoryFileRecordLoad();
        stateMemoryFile.value = null;
        mapStateDocuments.value = [];
        activeMapDocId.value = 'main';
        mapStateDocument.value = null;
        mapStatePatches.value = [];
        atlasStateDocument.value = null;
        atlasStatePatches.value = [];
        atlasActiveLocationKey.value = '';
        statusStateDocument.value = null;
        statusStatePatches.value = [];
        statusFieldDeltas.value = {};
        selectedMemoryFilePath.value = '';
        return;
    }
    const [runs, rawIndex, mapState, atlasState, statusState, nextStateFile] = await Promise.all([
        listTavernManagerRuns(id, { limit: 18 }),
        getTavernMemoryIndex(id),
        getTavernMapStateForSession(id),
        getTavernAtlasStateForSession(id),
        getTavernStatusStateForSession(id),
        getTavernMemoryFile(id, 'memory/state.md'),
    ]);
    const index = rawIndex && rawIndex.status === 'ready' && Array.isArray(rawIndex.files)
        ? rawIndex
        : await rebuildTavernMemoryDerivedIndex(id);
    if (requestSerial !== managerRecordsRefreshSerial || id !== selectedSessionId.value) {return;}
    managerRuns.value = runs;
    memoryFiles.value = Array.isArray(index.files) ? index.files.map((file) => ({
        path: String(file.path || ''),
        status: file.status === 'stale' ? 'stale' : 'active',
        createdAt: Number(file.createdAt) || Number(file.updatedAt) || 0,
        updatedAt: Number(file.updatedAt) || 0,
        source: String(file.source || ''),
        staleFromOrder: Number.isFinite(Number(file.staleFromOrder)) ? Number(file.staleFromOrder) : undefined,
        contentLength: Math.max(0, Number(file.contentLength) || 0),
        title: String(file.title || ''),
        preview: String(file.preview || ''),
        searchText: String(file.searchText || ''),
    })) : [];
    memoryIndex.value = index;
    stateMemoryFile.value = nextStateFile;
    mapStateDocuments.value = mapState.documents;
    activeMapDocId.value = mapState.activeDocId;
    mapStateDocument.value = mapState.activeDocument;
    mapStatePatches.value = mapState.activePatches;
    atlasStateDocument.value = atlasState.document;
    atlasStatePatches.value = atlasState.patches;
    atlasActiveLocationKey.value = atlasState.activeLocationKey;
    statusStateDocument.value = statusState.document;
    statusStatePatches.value = statusState.patches;
    statusFieldDeltas.value = statusState.fieldDeltas;
    resumeQueuedAcceptedTurnManagers({
        sessionId: id,
        agentConfig: agentConfig.value,
        assistantPreset: activeAssistantPreset.value,
        sessionContract: sessionContract.value,
        onManagerRunSaved: async (sessionId) => {
            if (sessionId === selectedSessionId.value) {
                await refreshManagerRecords(sessionId);
            }
        },
    });
    if (!memoryFiles.value.some((file) => file.path === selectedMemoryFilePath.value)) {
        if (memoryEditorDirty.value && selectedMemoryFilePath.value) {
            memoryEditorStatus.value = '当前档案已变化，草稿仍保留';
            return;
        }
        selectedMemoryFilePath.value = memoryFiles.value[0]?.path || '';
    }
}

async function pollLiveManagerRecords() {
    managerStatusClock.value = Date.now();
    if (managerRecordsPollRunning) {return;}
    if (!selectedSessionId.value) {return;}
    const hasLiveManagerRun = managerRuns.value.some((run) => isManagerRunActive(run));
    if (!hasLiveManagerRun && !isRunning.value && !isManagerAssistantRunning.value) {return;}
    managerRecordsPollRunning = true;
    try {
        await refreshManagerRecords(selectedSessionId.value);
    } finally {
        managerRecordsPollRunning = false;
    }
}

function resetSessionPreviewState() {
    simulateRequestSequence += 1;
    chatRunController.resetChatRunPreviewState();
    simulateRequestInput.value = '';
    simulateRequestJson.value = '';
    simulateRequestStatus.value = '';
    simulateRequestError.value = '';
    showPromptInspector.value = false;
    promptInspectorTab.value = 'history';
    clearManagerCompactionOverlayHideTimer();
    managerCompactionOverlay.value = null;
    resetChatMessageWindowState();
    resetManagerMessageWindowState();
    clearMarkdownCache();
}

function resetChatMessageWindowState() {
    chatScrollPane.resetWindowState(true);
}
const resetManagerMessageWindowState = managerScrollPane.resetWindowState;
const revealOlderChatMessages = chatScrollPane.revealOlderMessages;
const revealNewerChatMessages = chatScrollPane.revealNewerMessages;
const revealOlderManagerMessages = managerScrollPane.revealOlderMessages;

async function resetChatMessageWindowForUserTurn(options: { rerollLatestAssistant?: boolean } = {}) {
    const defaultLimit = normalizeHiddenOutsideCount(hiddenOutsideCount.value);
    const windowChanged = chatMessageWindowLimit.value !== defaultLimit
        || selectedSessionMessageWindowOffsetFromEnd.value !== 0;
    if (windowChanged) {
        sessionController.suppressNextChatWindowLimitReload();
    }
    resetChatMessageWindowState();
    if (windowChanged && options.rerollLatestAssistant !== true && selectedSessionId.value) {
        await loadSelectedSessionMessageWindow({ sessionId: selectedSessionId.value });
    }
}

function getCharacterGreetingOptions(character: XbTavernCharacter = {}) {
    return [
        String(character.firstMessage || character.first_mes || '').trim(),
        ...normalizeTextList(character.alternateGreetings || character.alternate_greetings),
    ].filter(Boolean);
}

async function appendFirstMessageIfPresent(sessionId: string, snapshotContext: XbTavernContext, greetingIndex = 0) {
    const greetingOptions = getCharacterGreetingOptions(snapshotContext.character || {});
    const normalizedIndex = Math.max(0, Math.min(greetingOptions.length - 1, Number(greetingIndex) || 0));
    const firstMessage = String(greetingOptions[normalizedIndex] || '').trim();
    if (!firstMessage) {return;}
    await appendTavernMessage(sessionId, {
        role: 'assistant',
        name: String(snapshotContext.character?.name || ''),
        content: firstMessage,
        contextSnapshot: snapshotContext,
        chatPresetId: String(runtimeChatPreset.value.id || ''),
        chatPresetName: String(runtimeChatPreset.value.name || ''),
        presetId: String(runtimeChatPreset.value.id || ''),
        presetName: String(runtimeChatPreset.value.name || ''),
    });
}

async function createSessionFromContext(options: { includeFirstMessage?: boolean; contextSnapshot?: XbTavernContext; greetingIndex?: number } = {}) {
    const snapshotContext = options.contextSnapshot || context.value;
    const snapshotBrain = buildXbTavernBrain({
        context: snapshotContext,
        chatPreset: runtimeChatPreset.value,
        currentUserMessage: '',
        historyMode: historyMode.value,
        turn: 0,
        entryStates: {},
        diagnostics: diagnostics.value,
    });
    const session = await createTavernSession({
        title: String(snapshotContext.character?.name || '未选择角色'),
        characterKey: String(snapshotContext.character?.characterKey || ''),
        characterName: String(snapshotContext.character?.name || '未选择角色'),
        contextSnapshot: snapshotContext,
        buildSnapshot: snapshotBrain.buildSnapshot,
        chatPresetId: String(runtimeChatPreset.value.id || ''),
        chatPresetName: String(runtimeChatPreset.value.name || ''),
        presetId: String(runtimeChatPreset.value.id || ''),
        presetName: String(runtimeChatPreset.value.name || ''),
        state: {
            turn: 0,
            worldEntryStates: {},
            nativeWorldInfoTimedState: { sticky: {}, cooldown: {} },
        },
    });
    if (options.includeFirstMessage !== false) {
        await appendFirstMessageIfPresent(session.id, snapshotContext, options.greetingIndex);
    }
    sessionController.setSelectedSessionId(session.id);
    await refreshSessions();
    return session;
}

async function createSessionAndOpenChat(options: { contextSnapshot?: XbTavernContext; greetingIndex?: number } = {}) {
    await createSessionFromContext(options);
    activeView.value = 'chat';
    chatFocus.value = 'chat';
    placeChatAtBottomForNewContext();
}

async function createNewChatSession() {
    if (isRunning.value || isCancellingRun.value) {return;}
    const snapshotContext = selectedSessionId.value
        ? await resolveRuntimeContextForSession(selectedSessionId.value)
        : context.value;
    resetSessionPreviewState();
    await createSessionAndOpenChat({ contextSnapshot: snapshotContext });
}

function getChatSessionBranchBlockedReason(): string {
    if (!selectedSessionId.value) {return '当前没有会话。';}
    if (isRunning.value || isCancellingRun.value) {return '正在生成回复，稍后再开启对话分支。';}
    if (isPhoneSendingForSession()) {return '手机消息正在等待回复，稍后再开启对话分支。';}
    if (managerBusy.value || isManagerAssistantRunning.value || isManagerAssistantCancelling.value || retryingManagerRunId.value) {
        return '助手/管理器正在维护档案，稍后再开启对话分支。';
    }
    return '';
}

async function branchCurrentChatSession() {
    const blockedBeforeConfirm = getChatSessionBranchBlockedReason();
    if (blockedBeforeConfirm) {
        showTavernToast(blockedBeforeConfirm, { tone: 'warning', durationMs: 2600 });
        return;
    }
    const sourceSessionId = String(selectedSessionId.value || '').trim();
    const confirmed = await confirmTavernDialog({
        title: '开启对话分支',
        message: '会复制当前会话档案，生成一份独立分支。当前聊天不会切换，你可以稍后在会话档案中打开它。',
        cancelText: '取消',
        confirmText: '开启分支',
    });
    if (!confirmed) {return;}
    const blockedAfterConfirm = getChatSessionBranchBlockedReason();
    if (blockedAfterConfirm || selectedSessionId.value !== sourceSessionId) {
        showTavernToast(blockedAfterConfirm || '当前会话已切换，未开启对话分支。', { tone: 'warning', durationMs: 2600 });
        return;
    }
    try {
        const branch = await branchTavernSession(sourceSessionId);
        if (!branch) {throw new Error('branch_session_missing');}
        await refreshSessions();
        showTavernToast('已创建对话分支', { tone: 'info', durationMs: 2200 });
    } catch (error) {
        await alertTavernDialog({
            title: '开启对话分支失败',
            message: describeError(error),
            confirmText: '知道了',
            tone: 'warning',
        });
    }
}

async function handleHomePrimaryAction() {
    if (canResumeSelectedSession.value) {
        openChatView();
        return;
    }
    openCharacterSelect();
}

function clearPendingCharacterSession() {
    pendingCharacterSessionKey.value = '';
    pendingCharacterGreetingIndex.value = 0;
}

async function finishPendingCharacterSession() {
    const targetKey = pendingCharacterSessionKey.value;
    if (!targetKey) {return;}
    const currentKey = String(context.value.character?.characterKey || '').trim();
    if (currentKey !== targetKey) {return;}
    if (!displayableTavernName(context.value.character?.name || '')) {
        clearPendingCharacterSession();
        pendingCharacterError.value = '没有读到这张角色卡。';
        return;
    }
    const greetingIndex = pendingCharacterGreetingIndex.value;
    clearPendingCharacterSession();
    pendingCharacterError.value = '';
    resetSessionPreviewState();
    await createSessionAndOpenChat({ greetingIndex });
}

async function selectCharacterAndCreateSession(characterKey: string) {
    if (isRunning.value || isCancellingRun.value) {
        showTavernToast('角色正在回复，完成或停止后再切换会话', { tone: 'info', durationMs: 2600 });
        return;
    }
    const targetKey = String(characterKey || '').trim();
    if (!targetKey || pendingCharacterSessionKey.value) {return;}
    const wasPreviewed = targetKey === String(selectedCharacterPreviewKey.value || '').trim();
    const greetingIndex = wasPreviewed ? selectedCharacterGreetingIndex.value : 0;
    selectedCharacterPreviewKey.value = targetKey;
    selectedCharacterGreetingIndex.value = greetingIndex;
    await sessionController.clearSelectedSession({ persist: true, refreshManager: true });
    resetSessionPreviewState();
    pendingCharacterError.value = '';
    statusText.value = '正在读取角色卡';
    pendingCharacterSessionKey.value = targetKey;
    pendingCharacterGreetingIndex.value = greetingIndex;
    try {
        const nativeCharacterId = resolveCurrentNativeCharacterId(targetKey);
        postToHost('xb-tavern:refresh-context', { nativeCharacterId, includeHistory: false });
    } catch (error) {
        pendingCharacterError.value = describeError(error);
        clearPendingCharacterSession();
    }
}

async function selectSession(sessionId: string) {
    if (isRunning.value || isCancellingRun.value) {
        showTavernToast('角色正在回复，完成或停止后再切换会话', { tone: 'info', durationMs: 2600 });
        return;
    }
    editingMessageKey.value = '';
    await sessionController.selectSession(sessionId);
}

async function removeSession(sessionId: string, event?: Event) {
    event?.stopPropagation();
    if (isPhoneSendingForSession(sessionId)) {
        warnPhoneWorkInProgress('这个会话还有手机消息在等待回复，稍后再删除。');
        return;
    }
    await sessionController.removeSession(sessionId);
}

function openChatView() {
    activeView.value = 'chat';
    chatFocus.value = 'chat';
    placeChatAtBottomForNewContext();
}

function openPromptInspector(tab: 'history' | 'simulate' = 'history') {
    promptInspectorTab.value = tab;
    showPromptInspector.value = true;
}

function closePromptInspector() {
    showPromptInspector.value = false;
}

async function simulateApiRequest() {
    const messageText = simulateRequestInput.value.trim();
    simulateRequestError.value = '';
    simulateRequestStatus.value = '';
    simulateRequestJson.value = '';
    if (!messageText) {
        simulateRequestError.value = '先写一句话。';
        return;
    }
    const requestSequence = simulateRequestSequence + 1;
    simulateRequestSequence = requestSequence;
    const requestSessionId = selectedSessionId.value;
    simulateRequestStatus.value = '模拟中';
    try {
        const runtimeContext = await resolveRuntimeContextForSession(requestSessionId);
        const runtimeApplyRegex = applyTavernRegexForNativeCharacter(runtimeContext.character?.nativeCharacterId);
        const runtimePreset = await refreshRuntimeChatPresetFromHost();
        const result = await simulateXbTavernRequest({
            sessionId: requestSessionId,
            agentConfig: agentConfig.value,
            contextSnapshot: runtimeContext,
            chatPreset: runtimePreset,
            currentUserMessage: messageText,
            runtimeState: normalizeTavernSessionState(selectedSession.value?.state || {}),
            diagnostics: diagnostics.value,
            historyMode: historyMode.value,
            applyRegex: runtimeApplyRegex,
            applySubstituteParams: applyTavernSubstituteParams,
            getNativeWorldInfoRuntime: getNativeWorldbookRuntime,
            buildNativeChatPrompt,
        });
        if (requestSequence !== simulateRequestSequence || requestSessionId !== selectedSessionId.value) {return;}
        simulateRequestJson.value = result.requestSnapshot.rawRequestJson || result.requestSnapshot.rawMessagesJson || '';
        simulateRequestStatus.value = `模拟完成 · ${result.requestSnapshot.providerLabel || result.provider} / ${result.model || '未选择模型'}`;
    } catch (error) {
        if (requestSequence !== simulateRequestSequence || requestSessionId !== selectedSessionId.value) {return;}
        console.error('[小白酒馆] simulate request failed', error);
        simulateRequestStatus.value = '';
        simulateRequestError.value = error instanceof Error ? error.message : String(error || 'simulate_failed');
    }
}

function shortText(value = '', limit = 180) {
    const text = String(value || '').trim();
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

async function commitAcceptedState(sessionId = selectedSessionId.value) {
    const id = String(sessionId || '').trim();
    if (!id) {return;}
    await saveAcceptedStateSnapshot(id);
}

async function commitUserAcceptedState(sessionId = selectedSessionId.value, userOrder?: number) {
    const id = String(sessionId || '').trim();
    if (!id) {return;}
    const explicitOrder = Number(userOrder);
    const latestUserOrder = Number.isFinite(explicitOrder)
        ? Math.floor(explicitOrder)
        : (await getLatestTavernUserMessageAtOrBefore(id, Number.POSITIVE_INFINITY))?.order;
    await saveAcceptedStateSnapshot(id, latestUserOrder ?? -1);
}

async function commitCurrentAcceptedStateChanges(sessionId: string, changes: {
    changedFiles?: string[];
    changedStates?: string[];
}) {
    const id = String(sessionId || '').trim();
    if (!id) {return;}
    const domains = resolveTavernAcceptedStateSnapshotDomains(changes);
    if (!domains.length) {return;}
    await saveAcceptedStateSnapshot(id, undefined, { domains });
}

const {
    discardMemoryDraft,
    enterMemoryEditMode,
    formatMemoryFileMeta,
    invalidateMemoryFileRecordLoad,
    loadMemoryFileIntoEditor,
    loadSelectedMemoryFileRecord,
    memoryFileStatusLabel,
    previewMemoryDraft,
    saveSelectedMemoryFile,
    selectMemoryFile,
} = useTavernMemoryWorkspace({
    memoryEditorBaseContent,
    memoryEditorDocumentAvailable,
    memoryEditorDraft,
    memoryEditorDirty,
    memoryEditorLoadedPath,
    memoryEditorMode,
    memoryEditorReadOnly,
    memoryEditorStatus,
    selectedMemoryFileEntry,
    selectedMemoryFilePath,
    selectedMemoryFileRecord,
    selectedSessionId,
    commitUserAcceptedState,
    confirmDialog: confirmTavernDialog,
    refreshRecords: refreshManagerRecords,
});

watch(memoryEditorReadOnly, (readOnly) => {
    if (!readOnly || memoryEditorMode.value !== 'edit') {return;}
    const wasDirty = memoryEditorDirty.value;
    discardMemoryDraft();
    if (wasDirty) {
        showTavernToast('记忆正在维护，未保存修改已放弃', {
            tone: 'warning',
            durationMs: 4000,
        });
    }
}, { immediate: true });

async function retryManagerRun(run: TavernManagerRunRecord) {
    const runId = String(run.id || '');
    if (!runId || !selectedSessionId.value || managerBusy.value || retryingManagerRunId.value) {return;}
    retryingManagerRunId.value = runId;
    managerActionStatus.value = '记忆正在重试。';
    try {
        const [userMessage, assistantMessage] = await Promise.all([
            getTavernMessage(selectedSessionId.value, run.userOrder),
            getTavernMessage(selectedSessionId.value, run.assistantOrder),
        ]);
        const validUserMessage = userMessage?.role === 'user' ? userMessage : null;
        const validAssistantMessage = assistantMessage?.role === 'assistant' && !assistantMessage.error ? assistantMessage : null;
        if (!validUserMessage || !validAssistantMessage) {
            managerActionStatus.value = '原文楼层不存在，无法重试。';
            await refreshManagerRecords(selectedSessionId.value);
            return;
        }
        const result = await runXbTavernManagerAfterTurn({
            sessionId: selectedSessionId.value,
            agentConfig: agentConfig.value,
            userMessage: validUserMessage,
            assistantMessage: validAssistantMessage,
            turn: run.turn,
            assistantPreset: activeAssistantPreset.value,
            sessionContract: sessionContract.value,
        });
        managerActionStatus.value = result.ok ? '' : `失败：${result.error || 'manager_retry_failed'}`;
    } catch (error) {
        managerActionStatus.value = error instanceof Error ? error.message : String(error || 'manager_retry_failed');
    } finally {
        try {
            await refreshManagerRecords(selectedSessionId.value);
        } finally {
            retryingManagerRunId.value = '';
        }
    }
}

function isManagerRunRetrying(run: TavernManagerRunRecord | null | undefined) {
    return !!run && !!retryingManagerRunId.value && String(run.id || '') === retryingManagerRunId.value;
}

function roleLabel(role = '') {
    if (role === 'assistant') {
        return displayableTavernName(selectedSession.value?.characterName || effectiveCharacter.value.name || '', '角色');
    }
    if (role === 'user') {
        return displayableTavernName(userName.value || '', 'User');
    }
    const labels: Record<string, string> = {
        system: '规则',
        tool: '工具结果',
    };
    return labels[role] || role || '未知';
}

function thoughtBlocks(messageOrThoughts: TavernMessageRecord | Array<{ label?: string; text?: string }> | null | undefined) {
    const source = Array.isArray(messageOrThoughts)
        ? messageOrThoughts
        : Array.isArray(messageOrThoughts?.thoughts) ? messageOrThoughts.thoughts : [];
    return source
        .map((thought, index) => ({
            label: String(thought?.label || `思考 ${index + 1}`).trim() || `思考 ${index + 1}`,
            text: String(thought?.text || '').trim(),
        }))
        .filter((thought) => thought.text);
}

function thoughtSummaryLabel(messageOrThoughts: TavernMessageRecord | Array<{ label?: string; text?: string }> | null | undefined, streaming = false) {
    const thoughts = thoughtBlocks(messageOrThoughts);
    if (!thoughts.length) {return '';}
    const prefix = streaming ? '正在思考' : '展开思考块';
    return thoughts.length > 1 ? `${prefix}（${thoughts.length} 段）` : prefix;
}

function formatMessageTime(value: unknown) {
    const timestamp = Number(value) || 0;
    if (!timestamp) {return '';}
    try {
        return new Intl.DateTimeFormat('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(timestamp));
    } catch {
        return '';
    }
}

function messageKey(message: TavernMessageRecord) {
    return `${message.sessionId}:${message.order}`;
}

function managerMessageKey(message: TavernAssistantChatMessageRecord) {
    return `manager:${message.sessionId}:${message.order}`;
}

function canEditMessage(message: TavernMessageRecord) {
    return !isRunning.value && !isPhoneSendingForSession(message.sessionId) && !message.error && ['user', 'assistant'].includes(message.role);
}

function canEditManagerMessage(message: TavernAssistantChatMessageRecord) {
    return !isManagerAssistantRunning.value
        && !isPhoneSendingForSession(message.sessionId)
        && !message.error
        && ['user', 'assistant'].includes(message.role);
}

function canRerunLatestAssistant() {
    if (isRunning.value || isRoleplayMessageEditing() || !selectedSessionId.value) {return false;}
    return !isPhoneSendingForSession(selectedSessionId.value);
}

function findManagerTurnUserMessage(
    message: TavernAssistantChatMessageRecord,
    sortedMessages = [...managerChatMessages.value].sort((left, right) => left.order - right.order),
): TavernAssistantChatMessageRecord | null {
    const clickedIndex = sortedMessages.findIndex((item) => (
        item.sessionId === message.sessionId && item.order === message.order
    ));
    if (clickedIndex < 0) {return null;}
    for (let index = clickedIndex; index >= 0; index -= 1) {
        const candidate = sortedMessages[index];
        if (candidate.sessionId !== message.sessionId) {continue;}
        if (candidate.role === 'user') {return candidate;}
    }
    return null;
}

function canRerunManagerMessage(message: TavernAssistantChatMessageRecord) {
    if (isManagerAssistantRunning.value || isPhoneSendingForSession(message.sessionId)) {return false;}
    if (!['user', 'assistant'].includes(message.role)) {return false;}
    const sorted = [...managerChatMessages.value].sort((left, right) => left.order - right.order);
    return !!findManagerTurnUserMessage(message, sorted);
}

function isEditingMessage(message: TavernMessageRecord) {
    return editingMessageKey.value === messageKey(message);
}

function isRoleplayMessageEditing() {
    return !!editingMessageKey.value;
}

function isEditingManagerMessage(message: TavernAssistantChatMessageRecord) {
    return editingManagerMessageKey.value === managerMessageKey(message);
}

function isEditingManagerMessageDirty(message: TavernAssistantChatMessageRecord) {
    return isEditingManagerMessage(message) && editingMessageDraft.value.trim() !== String(message.content || '').trim();
}

function flashMessageAction(message: TavernMessageRecord, action: string, ok: boolean) {
    const key = `${messageKey(message)}:${action}`;
    messageActionFeedback.value = {
        ...messageActionFeedback.value,
        [key]: ok ? 'success' : 'error',
    };
    window.setTimeout(() => {
        const next = { ...messageActionFeedback.value };
        delete next[key];
        messageActionFeedback.value = next;
    }, 1100);
}

function flashManagerMessageAction(message: TavernAssistantChatMessageRecord, action: string, ok: boolean) {
    const key = `${managerMessageKey(message)}:${action}`;
    const previousTimer = managerMessageFeedbackTimers.get(key);
    if (previousTimer) {
        window.clearTimeout(previousTimer);
    }
    messageActionFeedback.value = {
        ...messageActionFeedback.value,
        [key]: ok ? 'success' : 'error',
    };
    const timer = window.setTimeout(() => {
        managerMessageFeedbackTimers.delete(key);
        const next = { ...messageActionFeedback.value };
        delete next[key];
        messageActionFeedback.value = next;
    }, 1100);
    managerMessageFeedbackTimers.set(key, timer);
}

function clearManagerMessageFeedback(sessionId = '') {
    const prefix = sessionId ? `manager:${sessionId}:` : 'manager:';
    managerMessageFeedbackTimers.forEach((timer, key) => {
        if (!key.startsWith(prefix)) {return;}
        window.clearTimeout(timer);
        managerMessageFeedbackTimers.delete(key);
    });
    messageActionFeedback.value = Object.fromEntries(
        Object.entries(messageActionFeedback.value)
            .filter(([key]) => !key.startsWith(prefix)),
    );
}

function actionFeedback(message: TavernMessageRecord, action: string) {
    return messageActionFeedback.value[`${messageKey(message)}:${action}`] || '';
}

function managerActionFeedback(message: TavernAssistantChatMessageRecord, action: string) {
    return messageActionFeedback.value[`${managerMessageKey(message)}:${action}`] || '';
}

async function copyTextWithFallback(text = '') {
    const normalized = String(text || '');
    if (!normalized) {return false;}
    try {
        const textarea = document.createElement('textarea');
        try {
            textarea.value = normalized;
            textarea.setAttribute('readonly', 'readonly');
            textarea.style.position = 'fixed';
            textarea.style.left = '0';
            textarea.style.top = '0';
            textarea.style.width = '2em';
            textarea.style.height = '2em';
            textarea.style.padding = '0';
            textarea.style.border = '0';
            textarea.style.outline = '0';
            textarea.style.boxShadow = 'none';
            textarea.style.background = 'transparent';
            textarea.style.opacity = '0';
            textarea.style.pointerEvents = 'none';
            textarea.style.fontSize = '16px';
            document.body.appendChild(textarea);
            try {
                textarea.focus({ preventScroll: true });
            } catch {
                textarea.focus();
            }
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);
            const copied = document.execCommand('copy');
            if (copied) {return true;}
        } finally {
            textarea.remove();
        }
    } catch {
        // Fall through to the async clipboard path.
    }
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(normalized);
            return true;
        }
    } catch {
        // Fall through to false.
    }
    return false;
}

async function copyMessage(message: TavernMessageRecord) {
    const ok = await copyTextWithFallback(message.content || '');
    flashMessageAction(message, 'copy', ok);
}

async function copyManagerMessage(message: TavernAssistantChatMessageRecord) {
    const ok = await copyTextWithFallback(message.content || '');
    flashManagerMessageAction(message, 'copy', ok);
}

function startEditMessage(message: TavernMessageRecord) {
    if (!canEditMessage(message)) {return;}
    editingManagerMessageKey.value = '';
    editingMessageKey.value = messageKey(message);
}

function startEditManagerMessage(message: TavernAssistantChatMessageRecord) {
    if (!canEditManagerMessage(message)) {return;}
    editingMessageKey.value = '';
    editingManagerMessageKey.value = managerMessageKey(message);
    editingMessageDraft.value = message.content || '';
    void nextTick(() => {
        const textarea = managerScrollRef.value?.querySelector<HTMLTextAreaElement>(`[data-manager-message-editor="${managerMessageKey(message)}"]`);
        if (!textarea) {return;}
        autoSizeTextarea(textarea);
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
}

function cancelEditMessage() {
    if (editingManagerMessageKey.value) {
        editingManagerMessageKey.value = '';
    } else {
        editingMessageKey.value = '';
    }
    editingMessageDraft.value = '';
    void nextTick(() => {
        enhanceChatMarkdown();
        enhanceManagerMarkdown();
    });
}

function autoSizeTextarea(
    textarea: HTMLTextAreaElement | null,
    options: { minHeight?: number; maxHeight?: number } = {},
) {
    if (!textarea) {return;}
    const minHeight = Number(options.minHeight ?? 144);
    const maxHeight = Number(options.maxHeight ?? 420);
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)}px`;
}

function resetTextareaHeight(textarea: HTMLTextAreaElement | null) {
    if (!textarea) {return;}
    textarea.style.height = '';
}

function handleManagerEditKeydown(event: KeyboardEvent, message: TavernAssistantChatMessageRecord) {
    if (event.key === 'Escape') {
        event.preventDefault();
        cancelEditMessage();
        return;
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        void saveEditManagerMessage(message);
    }
}

function handleEditInput(event: Event) {
    autoSizeTextarea(event.target as HTMLTextAreaElement);
}

function handleComposeInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const isManagerCompose = !!textarea.closest('.manager-compose');
    autoSizeTextarea(textarea, isManagerCompose
        ? { minHeight: 48, maxHeight: 180 }
        : { minHeight: 36, maxHeight: 76 });
}

async function saveEditMessage(message: TavernMessageRecord, options: { rollbackState?: boolean; content?: string } = {}) {
    if (!canEditMessage(message)) {return;}
    const draft = 'content' in options
        ? String(options.content || '')
        : String(message.content || '');
    const content = draft.trim();
    const shouldRollbackState = options.rollbackState === true;
    if (!content) {
        flashMessageAction(message, 'edit', false);
        return;
    }
    if (content === String(message.content || '').trim()) {
        if (editingMessageKey.value === messageKey(message)) {
            editingMessageKey.value = '';
        }
        return;
    }
    if (shouldRollbackState) {
        const impact = await describeAcceptedStateRollbackImpact(message.sessionId, message.order);
        if (impact.willRollbackState || impact.willCancelWork) {
            const ok = await confirmTavernDialog({
                title: '保存楼层编辑',
                message: [
                    '保存后将按这楼重新整理后续状态。',
                    ...rollbackImpactLines(impact),
                ].join('\n\n'),
                confirmText: '回滚保存',
                tone: 'warning',
            });
            if (!ok) {return;}
        }
    }
    const substitutedContent = await substituteEditedMessageContent(message, content);
    const regexedContent = await applyEditRegexToMessageContent(message, substitutedContent);
    drawContext.cancelJob(messageKey(message));
    const updated = await updateTavernMessage(message.sessionId, message.order, {
        content: regexedContent,
    }, {
        incrementTimelineRevision: true,
    });
    if (!updated) {
        flashMessageAction(message, 'edit', false);
        return;
    }
    if (shouldRollbackState) {
        await cancelAcceptedRollbackManagersBeforeMessage(message.sessionId, message.order);
        await restoreAcceptedStateBeforeMessage(message.sessionId, message.order);
    }
    if (selectedSessionId.value === message.sessionId) {
        await loadSelectedSessionMessageWindow({ sessionId: message.sessionId });
        if (shouldRollbackState) {
            await refreshManagerRecords(message.sessionId);
        }
    }
    if (editingMessageKey.value === messageKey(message)) {
        editingMessageKey.value = '';
    }
    flashMessageAction(updated, 'edit', true);
}

async function saveEditManagerMessage(message: TavernAssistantChatMessageRecord, options: { rerun?: boolean } = {}) {
    if (!canEditManagerMessage(message)) {return;}
    const content = editingMessageDraft.value.trim();
    if (!content) {
        flashManagerMessageAction(message, 'edit', false);
        return;
    }
    if (!options.rerun && !isEditingManagerMessageDirty(message)) {
        cancelEditMessage();
        return;
    }
    if (options.rerun && message.role !== 'user') {
        cancelEditMessage();
        await rerunFromManagerMessage(message);
        return;
    }
    if (options.rerun) {
        const reran = await rerunFromManagerMessage(message, { question: content });
        flashManagerMessageAction(message, 'edit', reran);
        if (reran) {cancelEditMessage();}
        return;
    }
    const updated = await updateTavernAssistantChatMessage(message.sessionId, message.order, {
        content,
        clearProtocolPayload: message.role === 'assistant',
    });
    if (updated && selectedSessionId.value === message.sessionId) {
        managerChatMessages.value = await listTavernAssistantChatMessages(message.sessionId);
    }
    cancelEditMessage();
    flashManagerMessageAction(updated || message, 'edit', !!updated);
}

async function findDeleteOrders(message: TavernMessageRecord) {
    const orders = await listTavernMessageOrdersFrom(message.sessionId, message.order);
    return orders.length ? orders : [message.order];
}

async function deleteMessageTurn(message: TavernMessageRecord) {
    if (isRunning.value) {return;}
    if (isPhoneSendingForSession(message.sessionId)) {
        warnPhoneWorkInProgress('手机消息正在等待回复，稍后再删除剧情楼层。');
        return;
    }
    const ordersToDelete = await findDeleteOrders(message);
    const floor = Math.max(1, Number(message.order) + 1);
    const fromOrder = Math.min(...ordersToDelete);
    const impact = await describeAcceptedStateRollbackImpact(message.sessionId, fromOrder);
    const confirmLines = [
        ordersToDelete.length > 1
            ? `从第 ${floor} 楼开始删除后续剧情？将移除 ${ordersToDelete.length} 楼。`
            : `删除第 ${floor} 楼？`,
        ...rollbackImpactLines(impact),
    ];
    if (!await confirmTavernDialog({
        title: '删除剧情楼层',
        message: confirmLines.filter(Boolean).join('\n\n'),
        confirmText: '删除',
        tone: 'danger',
    })) {return;}
    let boundaryState: Awaited<ReturnType<typeof resolveTavernHistoryBoundaryState>>;
    try {
        const session = await getTavernSession(message.sessionId);
        if (!session) {throw new Error('session_missing');}
        boundaryState = await resolveTavernHistoryBoundaryState({
            sessionId: message.sessionId,
            boundaryOrder: fromOrder,
            currentState: session.state,
        });
    } catch (error) {
        console.error('[小白酒馆] 删除边界状态解析失败', error);
        showTavernToast('无法读取删除边界，剧情楼层未删除。', {
            tone: 'warning',
            durationMs: 7000,
        });
        flashMessageAction(message, 'delete', false);
        return;
    }
    drawContext.cancelJobsForMessageRange(message.sessionId, fromOrder);
    await cancelAcceptedRollbackManagersBeforeMessage(message.sessionId, fromOrder);
    const mutation = await truncateTavernMessagesAndReplaceSessionState(message.sessionId, fromOrder, boundaryState);
    if (!mutation.session) {throw new Error('session_missing');}
    const deleted = mutation.deleted;
    if (deleted > 0) {
        await restoreAcceptedStateBeforeMessage(message.sessionId, fromOrder);
    }
    if (selectedSessionId.value === message.sessionId) {
        resetChatMessageWindowState();
        await loadSelectedSessionMessageWindow({ sessionId: message.sessionId });
        await refreshManagerRecords(message.sessionId);
        if (deleted > 0) {await refreshSessionRecord(message.sessionId);}
    }
    if (editingMessageKey.value.startsWith(`${message.sessionId}:`)) {
        cancelEditMessage();
    }
    flashMessageAction(message, 'delete', deleted > 0);
}

async function rerollLatestAssistant() {
    if (!canRerunLatestAssistant()) {return;}
    await runOnce({ rerollLatestAssistant: true });
}

function findManagerDeleteOrders(message: TavernAssistantChatMessageRecord) {
    const sorted = [...managerChatMessages.value].sort((left, right) => left.order - right.order);
    const startIndex = sorted.findIndex((item) => item.order === message.order);
    if (startIndex < 0) {return [message.order];}
    if (message.role !== 'user') {
        let turnStartIndex = startIndex;
        for (let index = startIndex; index >= 0; index -= 1) {
            if (sorted[index]?.role === 'user') {
                turnStartIndex = index;
                break;
            }
        }
        const orders: number[] = [];
        for (let index = turnStartIndex + 1; index < sorted.length; index += 1) {
            const item = sorted[index];
            if (item.role === 'user') {break;}
            orders.push(item.order);
        }
        return orders.length ? orders : [message.order];
    }
    const orders: number[] = [];
    for (let index = startIndex; index < sorted.length; index += 1) {
        const item = sorted[index];
        if (index > startIndex && item.role === 'user') {break;}
        orders.push(item.order);
    }
    return orders;
}

async function deleteManagerMessageTurn(message: TavernAssistantChatMessageRecord) {
    if (isManagerAssistantRunning.value) {return;}
    const ordersToDelete = findManagerDeleteOrders(message);
    const confirmText = message.role === 'user'
        ? `删除这轮助手对话？将移除 ${ordersToDelete.length} 条记录。`
        : '删除这条助手回复？';
    if (!await confirmTavernDialog({
        title: '删除助手记录',
        message: confirmText,
        confirmText: '删除',
        tone: 'danger',
    })) {return;}
    const deleted = await deleteTavernAssistantChatMessages(message.sessionId, ordersToDelete);
    if (selectedSessionId.value === message.sessionId) {
        managerChatMessages.value = await listTavernAssistantChatMessages(message.sessionId);
    }
    if (editingManagerMessageKey.value.startsWith(`manager:${message.sessionId}:`)) {
        cancelEditMessage();
    }
    flashManagerMessageAction(message, 'delete', deleted > 0);
}

async function rerunFromManagerMessage(
    message: TavernAssistantChatMessageRecord,
    options: { question?: string } = {},
): Promise<boolean> {
    if (!canRerunManagerMessage(message)) {
        flashManagerMessageAction(message, 'rerun', false);
        return false;
    }
    const sorted = [...managerChatMessages.value].sort((left, right) => left.order - right.order);
    const userMessage = findManagerTurnUserMessage(message, sorted);
    if (!userMessage || selectedSessionId.value !== userMessage.sessionId) {
        flashManagerMessageAction(message, 'rerun', false);
        return false;
    }
    const managerSessionId = userMessage.sessionId;
    const ordersToDelete = sorted
        .filter((item) => item.order >= userMessage.order)
        .map((item) => item.order);
    if (ordersToDelete.length > 2) {
        const ok = await confirmTavernDialog({
            title: '重新询问助手',
            message: `从这里重新询问助手会移除后面的 ${ordersToDelete.length} 条记录。继续？`,
            confirmText: '继续',
            tone: 'warning',
        });
        if (!ok) {return false;}
    }
    if (selectedSessionId.value !== managerSessionId) {
        flashManagerMessageAction(message, 'rerun', false);
        return false;
    }
    const historyBeforeTurn = sorted.filter((item) => item.order < userMessage.order);
    const reran = await sendManagerQuestion(managerSessionId, String(options.question || userMessage.content), {
        historyBeforeTurn,
        replaceOrders: ordersToDelete,
    });
    flashManagerMessageAction(message, 'rerun', reran);
    return reran;
}

const updateChatScrollButtons = chatScrollPane.updateScrollButtons;
const updateManagerScrollButtons = managerScrollPane.updateScrollButtons;
const placeChatAtBottomForNewContext = chatScrollPane.placeAtBottomForNewContext;
const jumpChatToBottom = chatScrollPane.jumpToBottom;
const scrollChatToTop = chatScrollPane.scrollToTop;
const scrollManagerToBottom = managerScrollPane.scrollToBottom;
const scrollManagerToTop = managerScrollPane.scrollToTop;
const handleChatScroll = chatScrollPane.handleScroll;
const handleManagerScroll = managerScrollPane.handleScroll;
const handleChatWheel = chatScrollPane.handleWheel;
const handleManagerWheel = managerScrollPane.handleWheel;
const handleChatTouchStart = chatScrollPane.handleTouchStart;
const handleManagerTouchStart = managerScrollPane.handleTouchStart;
const handleChatTouchMove = chatScrollPane.handleTouchMove;
const handleManagerTouchMove = managerScrollPane.handleTouchMove;

function handleComposeKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') {return;}
    if (event.isComposing || event.shiftKey || event.altKey) {return;}
    if (isRunning.value || isPhoneSendingForSession()) {return;}
    const shouldSend = event.ctrlKey || event.metaKey || window.innerWidth >= 760;
    if (!shouldSend) {return;}
    event.preventDefault();
    void runOnce();
}

function handleManagerComposeKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') {return;}
    if (event.isComposing || event.shiftKey || event.altKey) {return;}
    const shouldSend = event.ctrlKey || event.metaKey || window.innerWidth >= 760;
    if (!shouldSend) {return;}
    event.preventDefault();
    void handleManagerSubmit();
}

function clearManagerCompactionOverlayHideTimer() {
    if (managerCompactionOverlayHideTimer) {
        window.clearTimeout(managerCompactionOverlayHideTimer);
        managerCompactionOverlayHideTimer = null;
    }
}

function updateManagerCompactionOverlay(patch: Partial<NonNullable<typeof managerCompactionOverlay.value>>) {
    const previous = managerCompactionOverlay.value || null;
    const nextId = String(patch.id || previous?.id || `manager-compaction-${Date.now()}`);
    const visibleSince = Number(patch.visibleSince)
        || (previous?.id === nextId ? Number(previous.visibleSince) : 0)
        || Date.now();
    managerCompactionOverlay.value = {
        id: nextId,
        active: true,
        resolved: false,
        currentTokens: 0,
        fixedTokens: 0,
        historyTokens: 0,
        yieldTokens: 0,
        triggerTokens: 0,
        status: '正在释放较早助手对话...',
        ...previous,
        ...patch,
        visibleSince,
    };
}

function scheduleManagerCompactionOverlayHide(delayMs = 3000) {
    const overlayId = managerCompactionOverlay.value?.id || '';
    const visibleSince = Number(managerCompactionOverlay.value?.visibleSince) || Date.now();
    const elapsedMs = Math.max(0, Date.now() - visibleSince);
    const waitMs = Math.max(0, delayMs - elapsedMs);
    clearManagerCompactionOverlayHideTimer();
    managerCompactionOverlayHideTimer = window.setTimeout(() => {
        managerCompactionOverlayHideTimer = null;
        if (!overlayId || managerCompactionOverlay.value?.id !== overlayId) {return;}
        managerCompactionOverlay.value = null;
    }, waitMs);
}

function setManagerPendingUserMessage(sessionId: string, content: string) {
    const id = String(sessionId || '').trim();
    const text = String(content || '').trim();
    if (!id || !text) {
        managerPendingUserMessage.value = null;
        return;
    }
    const now = Date.now();
    managerPendingUserMessage.value = {
        sessionId: id,
        order: Number.MAX_SAFE_INTEGER,
        role: 'user',
        content: text,
        createdAt: now,
        updatedAt: now,
    };
}

function clearManagerPendingUserMessage(sessionId = '') {
    const id = String(sessionId || '').trim();
    if (!id || managerPendingUserMessage.value?.sessionId === id) {
        managerPendingUserMessage.value = null;
    }
}

function shouldRunTavernSlashCommand(text: string, options: { rerollLatestAssistant?: boolean } = {}) {
    return options.rerollLatestAssistant !== true && text.trim().startsWith('/');
}

function isTavernWorldbookCacheResetCommand(text: string): boolean {
    return /^\/xbwireset(?:\s|$)/i.test(String(text || '').trim());
}

async function runManualTavernWorldbookCacheReset(): Promise<void> {
    const sessionId = String(selectedSessionId.value || '').trim();
    if (!sessionId) {
        throw new Error('当前没有可清理的会话。');
    }
    const result = await resetTavernWorldbookCache({
        sessionId,
        mode: 'manual',
    });
    const cleanedSession = await getTavernSession(sessionId);
    if (cleanedSession) {
        sessionController.updateSessionRecord(cleanedSession);
        applySessionSnapshotContext(cleanedSession);
    }
    await loadSelectedSessionMessageWindow({ reset: true, sessionId });
    let syncError: unknown = null;
    if (result.sessions) {
        try {
            await syncSessionCharacterContext({ sessionId, force: true });
        } catch (error) {
            syncError = error;
            setSelectedSessionCharacterError(error, sessionId);
        }
    }
    currentUserMessage.value = '';
    await nextTick(() => resetTextareaHeight(chatComposeTextareaRef.value));
    showTavernToast(
        !result.sessions
            ? '未找到当前会话，未清理任何内容。'
            : syncError
                ? `已清理当前会话的世界书运行缓存；重新读取 ST 当前状态失败：${describeError(syncError)}`
                : '已清理当前会话的世界书运行缓存，并重新读取 ST 当前状态。',
        { tone: syncError ? 'warning' : 'info', durationMs: syncError ? 4200 : 2600 },
    );
}

function normalizeSlashPipeForMessage(value: unknown): string {
    if (value === undefined || value === null) {return '';}
    if (typeof value === 'string') {return value.trim();}
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

async function resolveSlashCommandMessageText(messageText: string, options: { rerollLatestAssistant?: boolean } = {}): Promise<string> {
    if (!shouldRunTavernSlashCommand(messageText, options)) {
        return messageText;
    }
    if (isTavernWorldbookCacheResetCommand(messageText)) {
        await runManualTavernWorldbookCacheReset();
        return '';
    }
    const response = await requestHost('xb-tavern:run-slash-command', {
        payload: { command: messageText },
    });
    const result = (response.result || response) as Record<string, unknown>;
    const execution = result.execution && typeof result.execution === 'object'
        ? result.execution as Record<string, unknown>
        : {};
    if (result.ok === false || execution.isError === true || execution.isAborted === true) {
        throw new Error(String(result.error || execution.errorMessage || execution.abortReason || 'slash_command_failed'));
    }
    const pipe = normalizeSlashPipeForMessage(result.pipe);
    if (!pipe) {
        currentUserMessage.value = '';
        void nextTick(() => resetTextareaHeight(chatComposeTextareaRef.value));
        showTavernToast('命令已执行，没有输出。', { tone: 'info', durationMs: 2200 });
        return '';
    }
    return pipe;
}

function buildUiSubstituteParamsOptions(contextSnapshot: XbTavernContext = {}): TavernSubstituteParamsOptions {
    const options: TavernSubstituteParamsOptions = {};
    const userName = String(contextSnapshot.user?.name || '').trim();
    const characterName = String(contextSnapshot.character?.name || '').trim();
    if (userName) {options.name1Override = userName;}
    if (characterName) {options.name2Override = characterName;}
    return options;
}

async function substituteEditedMessageContent(message: TavernMessageRecord, content: string): Promise<string> {
    const session = sessions.value.find((item) => item.id === message.sessionId)
        || (selectedSessionId.value === message.sessionId ? selectedSession.value : null);
    const contextSnapshot = (session?.contextSnapshot || context.value || {}) as XbTavernContext;
    const result = await applyTavernSubstituteParams([{
        id: `edit:${message.sessionId}:${message.order}`,
        text: content,
        options: buildUiSubstituteParamsOptions(contextSnapshot),
    }]);
    return result.items[0]?.text ?? content;
}

async function applyEditRegexToMessageContent(message: TavernMessageRecord, content: string): Promise<string> {
    const placement = messageRegexPlacement(message);
    if (!placement) {return content;}
    const result = await applyTavernRegex([{
        id: `edit:${message.sessionId}:${message.order}`,
        text: content,
        placement,
        options: {
            isEdit: true,
            characterOverride: messageCharacterOverride(message),
        },
    }]);
    return result.items[0]?.text ?? content;
}

const chatRunController = useTavernChatRunController({
    state: chatRunState,
    activeAssistantPreset,
    activeSession: selectedSession,
    agentConfig,
    chatComposeTextareaRef,
    diagnostics,
    historyMode,
    selectedSessionCharacterError,
    selectedSessionId,
    applyRegex: applyTavernRegex,
    applySubstituteParams: applyTavernSubstituteParams,
    buildNativeChatPrompt,
    clearRuntimeDisplayRegexRequests,
    compactLoadedSessionMessageWindow,
    createSessionFromContext,
    describeError,
    getNativeWorldInfoRuntime: getNativeWorldbookRuntime,
    loadSelectedSessionMessageWindow,
    persistSelectedSessionId: sessionController.persistSelectedSessionId,
    prepareAssistantMessageDisplay,
    pruneLoadedSessionMessagesFromOrder,
    refreshManagerRecords,
    refreshRuntimeChatPresetFromHost,
    refreshSessionRecord,
    preserveDetachedChatScroll: preserveChatViewportDuringMutation,
    resetChatMessageWindowForUserTurn,
    resetTextareaHeight,
    resolveRuntimeContextForSession,
    resolveSlashCommandMessageText,
    setSelectedSessionId: sessionController.setSelectedSessionId,
    requestUserMessageBottom: chatScrollPane.requestUserMessageBottom,
    showToast: showTavernToast,
    thoughtBlocks,
    touchSessionLocally,
    updateChatScrollButtons,
    upsertLoadedSessionMessage,
    cancelDrawJobsForMessageRange: drawContext.cancelJobsForMessageRange,
});

function cancelActiveRun() {
    chatRunController.cancelActiveRun();
}

function handleChatSubmit() {
    if (!isRunning.value && isRoleplayMessageEditing()) {
        showTavernToast('先保存或取消当前楼层编辑', { tone: 'info', durationMs: 2200 });
        return;
    }
    if (!isRunning.value && isPhoneSendingForSession()) {
        warnPhoneWorkInProgress();
        return;
    }
    chatRunController.handleChatSubmit();
}

async function runOnce(options: Parameters<typeof chatRunController.runOnce>[0] = {}) {
    if (!isRunning.value && isRoleplayMessageEditing()) {
        showTavernToast('先保存或取消当前楼层编辑', { tone: 'info', durationMs: 2200 });
        return;
    }
    if (!isRunning.value && isPhoneSendingForSession()) {
        warnPhoneWorkInProgress();
        return;
    }
    await chatRunController.runOnce(options);
}

function clearRuntimeAssistantLiveState() {
    chatRunController.clearRuntimeAssistantLiveState();
}

function clearManagerLiveProtocolState(sessionId = '') {
    managerAssistantLiveController.clearSession(sessionId);
}

async function sendManagerQuestion(
    managerSessionId: string,
    text: string,
    options: {
        historyBeforeTurn?: TavernAssistantChatMessageRecord[];
        replaceOrders?: number[];
    } = {},
): Promise<boolean> {
    const question = String(text || '').trim();
    if (!managerSessionId || !question) {return false;}
    const managerSession = sessions.value.find((session) => session.id === managerSessionId)
        || (selectedSessionId.value === managerSessionId ? selectedSession.value : null);
    const managerTurn = Number(normalizeTavernSessionState(managerSession?.state || {}).turn || 0);
    const managerContextSnapshot = managerSession
        ? buildSessionContextSnapshotBase(managerSession)
        : {};
    const controller = new AbortController();
    managerAssistantController.value = controller;
    isManagerAssistantRunning.value = true;
    isManagerAssistantCancelling.value = false;
    managerInputStatus.value = '运行中';
    managerAutoScroll.value = true;
    resetManagerMessageWindowState();
    let sourceUserOrder = -1;
    let acceptedFloorAtStart = -1;
    let userMessageAppended = false;
    let changesCommitted = false;
    let observedChangedFiles: string[] = [];
    let observedChangedStates: string[] = [];
    let liveRun: TavernAssistantChatLiveRun | null = null;
    try {
        const [latestUserMessage, latestAssistantOrder] = await Promise.all([
            getLatestTavernUserMessageAtOrBefore(managerSessionId, Number.POSITIVE_INFINITY),
            getLatestTavernAssistantOrder(managerSessionId),
        ]);
        sourceUserOrder = latestUserMessage?.order ?? -1;
        acceptedFloorAtStart = latestAssistantOrder ?? -1;
        const historyBeforeTurn = Array.isArray(options.historyBeforeTurn)
            ? [...options.historyBeforeTurn].sort((left, right) => left.order - right.order)
            : await listTavernAssistantChatMessages(managerSessionId);
        const replaceOrders = [...new Set((options.replaceOrders || [])
            .map((order) => Number(order))
            .filter((order) => Number.isInteger(order) && order >= 0))];
        let userMessage: TavernAssistantChatMessageRecord | null = null;
        if (!replaceOrders.length) {
            userMessage = await appendTavernAssistantChatMessage(managerSessionId, {
                role: 'user',
                content: question,
            });
            userMessageAppended = true;
            clearManagerPendingUserMessage(managerSessionId);
            if (selectedSessionId.value === managerSessionId) {
                managerChatMessages.value = [...managerChatMessages.value, userMessage]
                    .sort((left, right) => left.order - right.order);
            }
        }
        const budget = await ensureTavernAssistantChatBudget({
            sessionId: managerSessionId,
            agentConfig: agentConfig.value,
            assistantPreset: activeAssistantPreset.value,
            contextSnapshot: managerContextSnapshot,
            question,
            history: historyBeforeTurn,
            signal: controller.signal,
            onCompactionStart: (snapshot) => {
                updateManagerCompactionOverlay({
                    id: `manager-compaction-${Date.now()}`,
                    active: true,
                    resolved: false,
                    currentTokens: snapshot.currentTokens,
                    fixedTokens: snapshot.fixedTokens || 0,
                    historyTokens: snapshot.historyTokens || 0,
                    yieldTokens: snapshot.yieldTokens || 0,
                    triggerTokens: snapshot.triggerTokens,
                    status: snapshot.status,
                });
            },
            onCompactionProgress: (snapshot) => {
                updateManagerCompactionOverlay({
                    currentTokens: snapshot.currentTokens,
                    fixedTokens: snapshot.fixedTokens || 0,
                    historyTokens: snapshot.historyTokens || 0,
                    yieldTokens: snapshot.yieldTokens || snapshot.currentTokens,
                    triggerTokens: snapshot.triggerTokens,
                    status: snapshot.status,
                });
            },
            onCompactionComplete: (snapshot) => {
                updateManagerCompactionOverlay({
                    resolved: true,
                    currentTokens: snapshot.currentTokens,
                    fixedTokens: snapshot.fixedTokens || 0,
                    historyTokens: snapshot.historyTokens || 0,
                    yieldTokens: snapshot.yieldTokens || snapshot.currentTokens,
                    triggerTokens: snapshot.triggerTokens,
                    status: snapshot.status,
                });
                scheduleManagerCompactionOverlayHide();
            },
            onCompactionUnable: (snapshot) => {
                updateManagerCompactionOverlay({
                    resolved: true,
                    currentTokens: snapshot.currentTokens,
                    fixedTokens: snapshot.fixedTokens || 0,
                    historyTokens: snapshot.historyTokens || 0,
                    yieldTokens: snapshot.yieldTokens || snapshot.currentTokens,
                    triggerTokens: snapshot.triggerTokens,
                    status: snapshot.status,
                });
                scheduleManagerCompactionOverlayHide();
            },
        });
        if (!budget.canProceed) {
            throw new Error('助手上下文超过 188k，当前请求没有发送。');
        }
        const compactedOrders = budget.removedOrders || [];
        if (replaceOrders.length) {
            const [replacementUserMessage] = await replaceTavernAssistantChatMessages(
                managerSessionId,
                [...new Set([...replaceOrders, ...compactedOrders])],
                [{ role: 'user', content: question }],
            );
            if (!replacementUserMessage) {throw new Error('assistant_chat_replace_failed');}
            userMessage = replacementUserMessage;
            userMessageAppended = true;
            clearManagerPendingUserMessage(managerSessionId);
        } else if (compactedOrders.length) {
            await deleteTavernAssistantChatMessages(managerSessionId, compactedOrders);
        }
        if (!userMessage) {throw new Error('assistant_chat_user_message_missing');}
        if (selectedSessionId.value === managerSessionId) {
            managerChatMessages.value = [...budget.history, userMessage]
                .sort((left, right) => left.order - right.order);
        }
        liveRun = managerAssistantLiveController.startRun(managerSessionId);
        const result = await runXbTavernAssistantChat({
            sessionId: managerSessionId,
            agentConfig: agentConfig.value,
            assistantPreset: activeAssistantPreset.value,
            contextSnapshot: managerContextSnapshot,
            question,
            history: budget.history,
            preparedMessages: budget.messages,
            turn: managerTurn,
            userOrder: sourceUserOrder,
            assistantOrder: acceptedFloorAtStart,
            signal: controller.signal,
            beforeWriteGuard: async () => {
                const currentAcceptedFloor = await getLatestTavernAssistantOrder(managerSessionId) ?? -1;
                if (currentAcceptedFloor !== acceptedFloorAtStart) {
                    throw new Error('assistant_timeline_advanced');
                }
            },
            onProtocolEvent: liveRun.onProtocolEvent,
            onStreamProgress: liveRun.onStreamProgress,
        });
        observedChangedFiles = [...(result.changedFiles || [])];
        observedChangedStates = [...(result.changedStates || [])];
        if (observedChangedFiles.length || observedChangedStates.length) {
            await commitCurrentAcceptedStateChanges(managerSessionId, {
                changedFiles: observedChangedFiles,
                changedStates: observedChangedStates,
            });
            changesCommitted = true;
        }
        const finalText = String(result.text || '').trim()
            || (controller.signal.aborted ? '已停止。' : result.error || '没有返回内容。');
        await liveRun.persistResult(result.protocolMessages, finalText, {
            provider: result.provider,
            model: result.model,
            finishReason: result.ok ? 'stop' : controller.signal.aborted ? 'aborted' : 'error',
            error: result.ok ? false : true,
        });
        await Promise.all([
            refreshAssistantChat(managerSessionId),
            refreshManagerRecords(managerSessionId),
        ]);
        liveRun.clear();
        managerInputStatus.value = '';
        return true;
    } catch (error) {
        clearManagerPendingUserMessage(managerSessionId);
        if (!changesCommitted && (observedChangedFiles.length || observedChangedStates.length)) {
            try {
                await commitCurrentAcceptedStateChanges(managerSessionId, {
                    changedFiles: observedChangedFiles,
                    changedStates: observedChangedStates,
                });
                changesCommitted = true;
            } catch (commitError) {
                console.error('[小白酒馆] 助手状态已改变，但保存接受状态快照失败', commitError);
            }
        }
        if (!userMessageAppended && !options.replaceOrders?.length && selectedSessionId.value === managerSessionId && !managerInputDraft.value.trim()) {
            managerInputDraft.value = question;
            void nextTick(() => resetTextareaHeight(managerComposeTextareaRef.value));
        }
        if (!userMessageAppended) {
            managerInputStatus.value = controller.signal.aborted ? '' : '失败';
            return false;
        }
        if (controller.signal.aborted) {
            await appendTavernAssistantChatMessage(managerSessionId, {
                role: 'assistant',
                content: '已停止。',
                finishReason: 'aborted',
            });
            await refreshAssistantChat(managerSessionId);
            managerInputStatus.value = '';
        } else {
            const errorText = error instanceof Error ? error.message : String(error || 'assistant_failed');
            await appendTavernAssistantChatMessage(managerSessionId, {
                role: 'assistant',
                content: errorText,
                error: true,
                finishReason: 'error',
            });
            await refreshAssistantChat(managerSessionId);
            managerInputStatus.value = '失败';
        }
        liveRun?.clear();
        return true;
    } finally {
        if (managerAssistantController.value === controller) {
            managerAssistantController.value = null;
        }
        isManagerAssistantCancelling.value = false;
        isManagerAssistantRunning.value = false;
    }
}

async function handleManagerSubmit() {
    if (isManagerAssistantRunning.value) {
        if (!isManagerAssistantCancelling.value) {
            isManagerAssistantCancelling.value = true;
            managerInputStatus.value = '正在停止...';
        }
        managerAssistantController.value?.abort();
        return;
    }
    if (isPhoneSendingForSession()) {
        warnPhoneWorkInProgress('手机消息正在等待回复，稍后再联系助手。');
        return;
    }
    const text = managerInputDraft.value.trim();
    if (!text || !selectedSessionId.value) {return;}
    const managerSessionId = selectedSessionId.value;
    managerInputDraft.value = '';
    void nextTick(() => resetTextareaHeight(managerComposeTextareaRef.value));
    setManagerPendingUserMessage(managerSessionId, text);
    isManagerAssistantRunning.value = true;
    isManagerAssistantCancelling.value = false;
    managerInputStatus.value = '准备中';
    await sendManagerQuestion(managerSessionId, text);
}

async function clearAssistantChatHistory() {
    const sessionId = String(selectedSessionId.value || '').trim();
    if (!sessionId || isManagerAssistantRunning.value || !managerChatMessages.value.length) {return;}
    const confirmed = await confirmTavernDialog({
        title: '清空助手对话',
        message: '清空当前会话里的全部助手聊天记录？已经写入的记忆、地图、状态和任务不会撤销。',
        confirmText: '清空对话',
        tone: 'danger',
    });
    if (!confirmed || selectedSessionId.value !== sessionId) {return;}

    await clearTavernAssistantChatMessages(sessionId);
    if (selectedSessionId.value !== sessionId) {return;}
    clearManagerCompactionOverlayHideTimer();
    managerCompactionOverlay.value = null;
    clearManagerLiveProtocolState(sessionId);
    clearManagerPendingUserMessage(sessionId);
    managerChatMessages.value = [];
    managerInputStatus.value = '';
    managerAutoScroll.value = true;
    resetManagerMessageWindowState();
    if (editingManagerMessageKey.value.startsWith(`manager:${sessionId}:`)) {
        cancelEditMessage();
    }
    clearManagerMessageFeedback(sessionId);
    showTavernToast('助手对话已清空');
    void nextTick(() => scrollManagerToBottom(true));
}

watch([
    () => visibleChatMessages.value.length,
    () => chatMessageWindow.value.startIndex,
    () => visibleChatMarkdownSignature.value,
    () => runtimePendingUserMessage.value,
    () => htmlRenderEnabled.value,
    () => homeThemeDark.value,
    () => activeView.value,
    () => chatFocus.value,
], () => {
    if (activeView.value === 'chat' && chatFocus.value === 'chat') {
        void nextTick(() => {
            enhanceChatMarkdown();
            updateChatScrollButtons();
        });
    }
});

watch([
    () => runtimeText.value,
    () => runtimeThoughtsSignature.value,
    () => runtimeActionCheckSignature.value,
    () => isRunning.value,
    () => activeView.value,
    () => chatFocus.value,
    () => selectedSessionId.value,
    () => currentNativeCharacterId.value,
    () => selectedSessionLatestAssistantOrder.value,
    () => roleLabel('assistant'),
], () => {
    syncRuntimeDisplayProjectionRequests();
}, { immediate: true });

watch([
    runtimeDisplayRenderProjection,
    runtimeDisplayThoughtBlocks,
], () => {
    if (activeView.value !== 'chat' || chatFocus.value !== 'chat') {return;}
    void nextTick(() => {
        updateChatScrollButtons();
    });
});

watch([
    () => visibleManagerChatMessages.value.length,
    () => managerMessageWindow.value.startIndex,
    () => visibleManagerMarkdownSignature.value,
    () => managerPendingUserMarkdownSignature.value,
    () => managerWorkMarkdownSignature.value,
    () => isManagerAssistantRunning.value,
    () => homeThemeDark.value,
    () => activeView.value,
    () => chatFocus.value,
], () => {
    if (activeView.value === 'chat' && chatFocus.value === 'manager') {
        scrollManagerToBottom();
        void nextTick(() => {
            enhanceManagerMarkdown();
            updateManagerScrollButtons();
        });
    }
});

watch(() => liveManagerMarkdownSignature.value, () => {
    if (activeView.value !== 'chat' || chatFocus.value !== 'manager') {return;}
    scrollManagerToBottom();
    void nextTick(() => updateManagerScrollButtons());
});

watch([
    () => chatMessageWindowLimit.value,
    () => selectedSessionMessageWindowOffsetFromEnd.value,
], () => {
    sessionController.handleChatMessageWindowStateChanged();
});

watch(() => selectedSessionId.value, (nextSessionId, previousSessionId) => {
    if (previousSessionId && previousSessionId !== nextSessionId) {
        if (editingMessageKey.value.startsWith(`${previousSessionId}:`)) {
            editingMessageKey.value = '';
        }
        managerAssistantController.value?.abort();
        clearManagerCompactionOverlayHideTimer();
        managerCompactionOverlay.value = null;
        clearManagerLiveProtocolState(previousSessionId);
        clearManagerPendingUserMessage(previousSessionId);
        clearManagerMessageFeedback(previousSessionId);
        if (editingManagerMessageKey.value.startsWith(`manager:${previousSessionId}:`)) {
            cancelEditMessage();
        }
        managerInputStatus.value = '';
    }
    resetChatMessageWindowState();
    resetManagerMessageWindowState();
    chatAutoScroll.value = true;
    managerAutoScroll.value = true;
    memoryFileSearchText.value = '';
    memoryFileGroupVisibleLimits.value = {};
    void nextTick(() => {
        placeChatAtBottomForNewContext();
        scrollManagerToBottom(true);
    });
});

watch([
    () => String(selectedSessionId.value || '').trim(),
    () => String(selectedMemoryFileEntry.value?.path || '').trim(),
    () => Number(selectedMemoryFileEntry.value?.updatedAt) || 0,
    () => Number(selectedMemoryFileEntry.value?.contentLength) || 0,
], async ([sessionId, nextPath]) => {
    if (!nextPath) {
        if (memoryEditorDirty.value) {
            memoryEditorStatus.value = '当前档案已变化，草稿仍保留';
            return;
        }
        invalidateMemoryFileRecordLoad();
        loadMemoryFileIntoEditor(null);
        return;
    }
    if (memoryEditorLoadedPath.value === nextPath && (memoryEditorMode.value === 'edit' || memoryEditorDirty.value)) {
        if (selectedMemoryFileRecord.value?.sessionId !== selectedSessionId.value) {
            selectedMemoryFileRecord.value = null;
        }
        if (memoryEditorDirty.value) {
            memoryEditorStatus.value = '档案已刷新，当前草稿仍保留';
        }
        return;
    }
    const loaded = await loadSelectedMemoryFileRecord(nextPath);
    if (String(selectedSessionId.value || '').trim() !== sessionId) {return;}
    if (String(selectedMemoryFilePath.value || '') !== nextPath) {return;}
    loadMemoryFileIntoEditor(loaded);
}, { immediate: true });

watch(homeThemeDark, (isDark) => {
    try {
        globalThis.localStorage?.setItem(TAVERN_THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
        // Theme persistence is best-effort only.
    }
});

const shellContext = {
    activeView,
    alertTavernDialog,
    chatFocus,
    confirmTavernDialog,
    homeThemeDark,
    openPromptInspector,
    postToHost,
    promptTavernDialog,
    rememberBrokenAvatar,
    shortText,
} satisfies TavernShellContext;

const sessionContext = {
    branchCurrentChatSession,
    chatMessages,
    chatMessageWindow,
    createNewChatSession,
    currentAssistantFloor,
    currentChatCharacterSessions,
    removeSession,
    selectedCharacterSessions,
    selectedSessionId,
    selectSession,
    sessionDisplayTitle,
    sessionFloorLabel,
    sessions,
    visibleChatMessages,
} satisfies TavernSessionContext;

const characterContext = {
    avatarAvailable,
    backupSelectedCharacterArchive,
    batchSize: CHARACTER_ARCHIVE_BATCH_SIZE,
    characterArchiveSyncState,
    clearCharacterArchiveSyncState,
    clearSelection: clearCharacterSelection,
    characterWorldbookBusy,
    characterWorldbookState,
    characters: characterCards,
    enterSelected: enterSelectedCharacter,
    filteredCount: computed(() => filteredCharacterCards.value.length),
    hiddenCount: hiddenCharacterCount,
    liveCharacterKey,
    loadMore: loadMoreCharacters,
    movePreview: moveCharacterPreview,
    openCharacterWorldbook: openSelectedCharacterWorldbook,
    pendingCharacterSessionKey,
    pendingError: pendingCharacterError,
    pendingPreviewCharacterKey: pendingCharacterPreviewKey,
    refresh: refreshCharacterList,
    rememberBrokenAvatar,
    restoreSelectedCharacterArchive,
    searchText: characterSearchText,
    select: selectCharacterForPreview,
    selectFirstVisible: selectFirstVisibleCharacter,
    selectGreeting: selectCharacterGreeting,
    selectLastVisible: selectLastVisibleCharacter,
    selectedCharacter: selectedCharacterPreview,
    selectedGreetingIndex: selectedCharacterGreetingIndex,
    shortText,
    syncWorldbookState: syncCharacterWorldbookState,
    visibleCharacters: visibleCharacterCards,
} satisfies TavernCharacterContext;

const chatContext = {
    actionFeedback,
    cancelEditMessage,
    canEditMessage,
    canRerunLatestAssistant,
    canSendMessage,
    currentAuthorNote,
    chatAutoScroll,
    chatFocus,
    chatLayout,
    chatComposeTextareaRef,
    chatScrollControlsActive,
    chatScrollContentRef,
    chatScrollRef,
    chatSubtitle,
    copyMessage,
    currentUserMessage,
    deleteMessageTurn,
    displayMessageContent,
    displayMessageRenderProjection,
    displayMessageThoughtBlocks,
    displayRuntimeRenderProjection,
    displayRuntimeThoughtBlocks,
    displayCharacterName,
    displayUserName: userName,
    enhanceMarkdownRoot,
    formatMessageTime,
    handleChatScroll,
    handleChatSubmit,
    handleChatTouchMove,
    handleChatTouchStart,
    handleChatWheel,
    handleComposeInput,
    handleComposeKeydown,
    isEditingMessage,
    isCancellingRun,
    isRunning,
    markdownSignature,
    htmlRenderEnabled,
    messageKey,
    normalizeTavernSessionState,
    renderChatMarkdown,
    rerollLatestAssistant,
    revealOlderChatMessages,
    revealNewerChatMessages,
    releaseMarkdownRootResources,
    roleLabel,
    runtimeStatusElapsedSeconds,
    runtimeStatusLabel,
    runtimeStatusStartedAt,
    runtimeUserMessageVisible,
    runtimeAssistantMessageKey,
    runtimePendingUserMessage,
    saveEditMessage,
    jumpChatToBottom,
    scrollChatToTop,
    saveCurrentAuthorNote,
    showChatScrollBottom,
    showChatScrollTop,
    startEditMessage,
    thoughtBlocks,
    thoughtSummaryLabel,
    updateChatScrollButtons,
    visibleCharacterAvatar,
    visibleUserAvatar,
} satisfies TavernChatContext;

const managerContext = {
    activeMemoryFiles,
    assistantChatContextLabel,
    archivedManagerRuns,
    canEditManagerMessage,
    canClearAssistantChat,
    clearAssistantChatHistory,
    canRerunManagerMessage,
    canSendManagerMessage,
    copyManagerMessage,
    currentManagerWorkRun,
    deleteManagerMessageTurn,
    editingMessageDraft,
    enhanceManagerMarkdown,
    formatRunActivityLine,
    formatRunIssueLine,
    formatRunInputLine,
    formatRunMapLine,
    formatRunMemoryLine,
    formatRunModelLine,
    handleEditInput,
    handleManagerComposeKeydown,
    handleManagerEditKeydown,
    handleManagerScroll,
    handleManagerSubmit,
    handleManagerTouchMove,
    handleManagerTouchStart,
    handleManagerWheel,
    hiddenManagerRunCount,
    isEditingManagerMessage,
    isEditingManagerMessageDirty,
    isManagerRunRetrying,
    isManagerAssistantCancelling,
    isManagerAssistantRunning,
    liveManagerAssistantDraft,
    liveManagerToolRound: visibleManagerLiveToolRound,
    managerActionFeedback,
    managerAutoScroll,
    managerBusy,
    managerCompactionOverlay,
    managerComposeTextareaRef,
    managerInputDraft,
    managerInputStatus,
    managerMessageWindow,
    managerPendingUserMessage: visibleManagerPendingUserMessage,
    managerRuns,
    managerRunTone,
    managerScrollControlsActive,
    managerScrollRef,
    managerWorkRef,
    managerStatusLabel,
    managerToolStatusLabel,
    managerToolTone,
    managerToolTraceItems,
    memoryFileDisplayName,
    memoryFiles,
    memoryIndexStatusLine,
    retryManagerRun,
    revealOlderManagerMessages,
    rerunFromManagerMessage: async (message) => {
        await rerunFromManagerMessage(message);
    },
    saveEditManagerMessage,
    scrollManagerToBottom,
    scrollManagerToTop,
    selectedMemoryFile,
    showManagerScrollBottom,
    showManagerScrollTop,
    startEditManagerMessage,
    toolTraceSummary,
    updateManagerScrollButtons,
    visibleManagerChatItems,
} satisfies TavernManagerContext;

const memoryContext = {
    activeMemoryFiles,
    commitAcceptedState,
    commitUserAcceptedState,
    discardMemoryDraft,
    enterMemoryEditMode,
    expandMemoryFileGroup,
    formatMemoryFileMeta,
    markdownSignature,
    MEMORY_FILE_BATCH_SIZE,
    MEMORY_TURN_BATCH_SIZE,
    memoryDirectoryGroups,
    memoryEditorDirty,
    memoryEditorDocumentAvailable,
    memoryEditorDraft,
    memoryEditorLoadedPath,
    memoryEditorMode,
    memoryEditorReadOnly,
    memoryEditorStatus,
    memoryFileDisplayName,
    memoryFileKindLabel,
    memoryFiles,
    memoryFileSearchText,
    memoryFileStatusLabel,
    previewMemoryDraft,
    renderChatMarkdown,
    saveSelectedMemoryFile,
    selectedMemoryFileEntry,
    selectedMemoryFile,
    selectedMemoryFilePath,
    selectMemoryFile,
    stateMemoryFile,
} satisfies TavernMemoryContext;

const workspaceContext = {
    activeMemoryFiles,
    activeMapDocId,
    atlasActiveLocationKey,
    atlasStateDocument,
    atlasStatePatches,
    chatWorkspacePanel,
    displayUserName: userName,
    mapStateDocuments,
    mapStateDocument,
    mapStatePatches,
    materialSymbolFontReady,
    materialSymbolFontStatus,
    statusFieldDeltas,
    statusStateDocument,
    statusStatePatches,
    saveSessionContract,
    sessionContract,
    stateMemoryFile,
    visibleUserAvatar,
} satisfies TavernWorkspaceContext;

const appUiContext = {
    shell: shellContext,
    character: characterContext,
    session: sessionContext,
    draw: drawContext,
    chat: chatContext,
    phone: phoneContext,
    manager: managerContext,
    memory: memoryContext,
    workspace: workspaceContext,
    settings: settingsContext,
} satisfies TavernAppUiContext;

provide(TAVERN_APP_UI_CONTEXT, appUiContext);

async function runPostReadyStartupTasks() {
    reportStartupProgress(91, 'worldbookCacheReset');
    try {
        await resetTavernWorldbookCache({ mode: 'migration' });
    } catch (error) {
        console.warn('[LittleWhiteBox/tavern] Failed to reset stale worldbook cache', error);
        statusText.value = describeError(error);
    }
    reportStartupProgress(92, 'refreshPresets');
    const startupResults = await Promise.allSettled([
        refreshPresets(),
        refreshSessions(),
    ]);
    const firstError = startupResults.find((result) => result.status === 'rejected');
    if (firstError?.status === 'rejected') {
        statusText.value = describeError(firstError.reason);
    }
    syncApiSettingsConfigFromAgentConfig();
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'api') {
        await nextTick(renderApiSettingsPanel);
    }
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'chatPreset') {
        void syncChatPresetFromHost();
    }
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'worldbooks') {
        void syncWorldbooksFromHost();
    }
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'regex') {
        void refreshRegexFromHost();
    }
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'base') {
        void loadTavernUsers();
    }
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'characters') {
        void refreshCharacterList();
    }
    if (selectedSessionId.value) {
        void syncSessionCharacterContextSafely({ sessionId: selectedSessionId.value, force: true });
    }
    if (activeView.value === 'chat' && chatFocus.value === 'chat') {
        placeChatAtBottomForNewContext();
    }
    reportStartupProgress(100, 'enterTavern');
}

onMounted(async () => {
    hostBridge.mount();
    document.addEventListener('focusin', handleKeyboardViewportFocus, true);
    document.addEventListener('focusout', handleKeyboardViewportFocus, true);
    managerRecordsPollTimer = window.setInterval(() => {
        void pollLiveManagerRecords();
    }, 2000);
    if (activeView.value === 'settings' && activeSettingsWorkspace.value === 'api') {
        void nextTick(renderApiSettingsPanel);
    }
    syncApiSettingsConfigFromAgentConfig();
    await nextTick();
    hostBridge.postToHost('xb-tavern:frame-ready');
    void drawContext.refreshTavernDrawStatus();
});

onUnmounted(() => {
    document.removeEventListener('focusin', handleKeyboardViewportFocus, true);
    document.removeEventListener('focusout', handleKeyboardViewportFocus, true);
    hostBridge.dispose(new Error('tavern_unmounted'));
    disposeMarkdownTools();
    clearRuntimeAssistantLiveState();
    drawContext.clearCooldownTimer();
    setHostChatCompletionsRequestHeadersProvider(null);
    chatRunController.abortActiveRun();
    managerAssistantController.value?.abort();
    managerAssistantController.value = null;
    clearManagerLiveProtocolState();
    clearManagerPendingUserMessage();
    clearManagerMessageFeedback();
    managerCompactionOverlay.value = null;
    isManagerAssistantRunning.value = false;
    isManagerAssistantCancelling.value = false;
    drawContext.abortAllJobs();
    chatScrollPane.cleanup();
    managerScrollPane.cleanup();
    if (tavernToastTimer) {
        window.clearTimeout(tavernToastTimer);
        tavernToastTimer = null;
    }
    if (managerRecordsPollTimer) {
        window.clearInterval(managerRecordsPollTimer);
        managerRecordsPollTimer = null;
    }
    clearDisplayRegexCache();
    clearManagerCompactionOverlayHideTimer();
    clearPendingCharacterSession();
});
</script>

<template>
  <main
    class="xb-tavern xb-os-shell"
    :class="{ 'is-home-view': activeView === 'home' || activeView === 'about', 'theme-dark': homeThemeDark, 'theme-light': !homeThemeDark }"
    :data-chat-font-size="tavernDisplaySettings.chatFontSize"
    :style="rootTypographyStyle"
  >
    <section class="xb-os-stage">
      <TavernHomePage
        v-if="activeView === 'home'"
        :dark="homeThemeDark"
        :has-session="canResumeSelectedSession"
        :subtitle="chatSubtitle"
        :character-count="characterCards.length"
        @toggle-theme="homeThemeDark = !homeThemeDark"
        @exit="postToHost('xb-tavern:close')"
        @enter="handleHomePrimaryAction"
        @open-characters="openCharacterSelect"
        @open-settings="openSettingsWorkspace"
        @open-about="activeView = 'about'"
      />

      <TavernAboutPage
        v-if="activeView === 'about'"
        :dark="homeThemeDark"
        @toggle-theme="homeThemeDark = !homeThemeDark"
        @back="activeView = 'home'"
      />

      <TavernChatPage
        v-if="activeView === 'chat'"
      />

      <TavernSettingsPage
        v-if="activeView === 'settings'"
      />
    </section>

    <div
      v-if="tavernToast"
      :key="tavernToast.id"
      class="tavern-toast"
      :class="`tone-${tavernToast.tone}`"
      role="status"
      aria-live="polite"
    >
      {{ tavernToast.message }}
    </div>

    <TavernRequestLogModal
      v-if="showPromptInspector"
      v-model:tab="promptInspectorTab"
      v-model:simulate-input="simulateRequestInput"
      :last-request-raw-json="lastRequestRawJson"
      :last-request-snapshot="lastRequestSnapshot"
      :simulate-status="simulateRequestStatus"
      :simulate-error="simulateRequestError"
      :simulate-json="simulateRequestJson"
      @close="closePromptInspector"
      @simulate="simulateApiRequest"
    />

    <div
      v-if="characterWorldbookSelectionOpen"
      class="character-worldbook-picker-overlay"
      @click.self="closeCharacterWorldbookSelection"
    >
      <section class="character-worldbook-picker">
        <header>
          <strong>选择角色世界书</strong>
          <button
            type="button"
            class="worldbook-picker-close"
            aria-label="关闭"
            @click="closeCharacterWorldbookSelection"
          />
        </header>
        <div
          v-if="characterWorldbookStatus"
          class="worldbook-picker-status"
        >
          {{ characterWorldbookStatus }}
        </div>
        <div class="worldbook-picker-list">
          <button
            v-for="name in characterWorldbookSelectionOptions"
            :key="name"
            type="button"
            :disabled="characterWorldbookBusy"
            @click="bindSelectedCharacterWorldbook(name)"
          >
            {{ name }}
          </button>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <div
        v-if="tavernDialog"
        class="tavern-dialog-overlay"
        :class="homeThemeDark ? 'theme-dark' : 'theme-light'"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tavern-dialog-title"
        @click.self="handleTavernDialogBackdropClick"
        @keydown.esc="closeTavernDialog()"
        @keydown.tab="handleTavernDialogTab"
      >
        <form
          ref="tavernDialogPanelRef"
          class="tavern-dialog"
          :class="[`tone-${tavernDialog.tone}`, { 'is-attention': tavernDialogAttention }]"
          tabindex="-1"
          @submit.prevent="confirmOpenTavernDialog"
        >
          <header class="tavern-dialog-head">
            <div>
              <strong id="tavern-dialog-title">{{ tavernDialog.title }}</strong>
            </div>
            <button
              type="button"
              class="tavern-dialog-close"
              aria-label="关闭"
              @click="closeTavernDialog()"
            />
          </header>
          <div class="tavern-dialog-body">
            <p v-if="tavernDialog.message">
              {{ tavernDialog.message }}
            </p>
            <label
              v-if="tavernDialog.kind === 'prompt'"
              class="tavern-dialog-field"
            >
              <input
                ref="tavernDialogInputRef"
                v-model="tavernDialog.inputValue"
                type="text"
                :placeholder="tavernDialog.placeholder"
              >
            </label>
          </div>
          <footer class="tavern-dialog-actions">
            <button
              v-if="tavernDialog.kind !== 'alert'"
              ref="tavernDialogCancelRef"
              type="button"
              class="tavern-dialog-button secondary"
              @click="closeTavernDialog()"
            >
              {{ tavernDialog.cancelText }}
            </button>
            <button
              ref="tavernDialogPrimaryRef"
              type="submit"
              class="tavern-dialog-button primary"
            >
              {{ tavernDialogPrimaryText }}
            </button>
          </footer>
        </form>
      </div>
    </Teleport>
  </main>
</template>
