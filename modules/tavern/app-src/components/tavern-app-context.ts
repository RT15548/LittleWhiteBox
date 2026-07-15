import { inject, type ComputedRef, type InjectionKey, type Ref } from 'vue';
import type { TavernSettingsNavItem } from './TavernSettingsSidebar.vue';
import type {
    TavernAssistantPreset,
} from '../../shared/assistant-presets';
import type {
    XbTavernAuthorNote,
    TavernChatPromptPresetBundle,
} from '../../shared/message-assembler';
import type { ManagerChatDisplayItem } from '../manager-tool-display';
import type {
    TavernSessionContract,
} from '../../shared/session-contract';
import type {
    TavernActionCheckRuntimeEvent,
} from '../../shared/runtime-events';
import type {
    TavernAssistantPresetRecord,
    TavernManagerMessageRecord,
    TavernManagerRunRecord,
    TavernMemoryFileListEntry,
    TavernMemoryFileRecord,
    TavernMemoryIndexFileEntry,
    TavernMessageRecord,
    TavernSessionRecord,
    TavernStructuredStateDocumentRecord,
    TavernStructuredStatePatchRecord,
    TavernTaskRecord,
    TavernCommunicationContactRecord,
    TavernCommunicationMessageRecord,
    TavernCommunicationThreadRecord,
} from '../../shared/session-db';
import type { TavernDisplaySettings, TavernUserOption } from '../../shared/settings';
import type { TavernCharacterArchiveProgress } from '../../shared/character-archive-types';
import type { TavernMapStateDocumentItem } from '../../shared/structured-state';
import type { TavernStatusFieldDeltaMap } from '../../shared/status-state';
import type { TavernDrawContext } from '../features/draw/useTavernDrawController';
import type { TavernPhoneContactCandidate } from '../features/phone-os/useTavernPhoneController';
import type {
    TavernPhoneAppDefinition,
    TavernPhoneOsRoute,
    TavernPhonePresentationMode,
} from '../features/phone-os/phone-os-types';
export type { TavernDisplaySettings, TavernUserOption } from '../../shared/settings';

export type TavernReadable<T> = Ref<T> | ComputedRef<T>;
export type TavernCommand<TArgs extends unknown[] = [], TResult = void> = (...args: TArgs) => TResult;
export interface TavernSaveFeedback {
    status: 'idle' | 'saving' | 'success' | 'error';
    error: string;
}

export interface TavernDialogOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    defaultValue?: string;
    placeholder?: string;
    tone?: 'default' | 'danger' | 'warning';
}

export interface TavernPromptEditorRow {
    identifier: string;
    name: string;
    role: string;
    content: string;
    enabled: boolean;
    marker: boolean;
    systemPrompt: boolean;
    injectionPosition: number;
    injectionDepth: number | string;
    source: string;
    orderEntry: { [key: string]: unknown };
    prompt: { [key: string]: unknown };
    listed: boolean;
    searchCorpus?: string;
}

export interface TavernAssistantPresetItemRow {
    id: string;
    key: string;
    label: string;
    summary: string;
    content: string;
}

export interface TavernChatPresetOptionRow {
    name: string;
    label: string;
}

export interface TavernWorldbookOptionRow {
    name: string;
    globalActive?: boolean;
}

export interface TavernWorldbookPreviewEntryRow {
    uid: string;
    name: string;
    keys: string[];
    secondaryKeys: string[];
    contentPreview: string;
    enabled: boolean;
    constant: boolean;
    vectorized?: boolean;
    order: number;
    position?: number;
    role?: number;
    depth?: number | null;
    probability?: number | null;
}

export interface TavernWorldbookPreviewRow {
    name: string;
    entryCount: number;
    enabledCount: number;
    constantCount: number;
    disabledCount: number;
    keywordCount: number;
    totalChars: number;
    entries: TavernWorldbookPreviewEntryRow[];
}

export interface TavernWorldbookEntryDraft {
    worldbookName: string;
    uid: string;
    comment: string;
    key: string[];
    keysecondary: string[];
    secondary_keys: string[];
    content: string;
    disable: boolean;
    enabled: boolean;
    constant: boolean;
    vectorized: boolean;
    order: number;
    position: number;
    role: number;
    depth: number | null;
    probability: number | null;
    useProbability: boolean;
    selective: boolean;
    selectiveLogic: number;
    scanDepth: number | null;
    caseSensitive: boolean | null;
    matchWholeWords: boolean | null;
    useGroupScoring: boolean | null;
    outletName: string;
    automationId: string;
    ignoreBudget: boolean;
    excludeRecursion: boolean;
    preventRecursion: boolean;
    delayUntilRecursion: boolean | number;
    group: string;
    groupOverride: boolean;
    groupWeight: number | null;
    sticky: number | null;
    cooldown: number | null;
    delay: number | null;
    triggers: string[];
    matchPersonaDescription: boolean;
    matchCharacterDescription: boolean;
    matchCharacterPersonality: boolean;
    matchCharacterDepthPrompt: boolean;
    matchScenario: boolean;
    matchCreatorNotes: boolean;
    entryHash: string;
    revision: string;
}

export interface TavernCharacterOption {
    characterKey: string;
    nativeCharacterId?: string;
    name: string;
    avatar?: string;
    shallow?: boolean;
    description?: string;
    personality?: string;
    scenario?: string;
    firstMessage?: string;
    alternateGreetings?: string[];
    mesExample?: string;
    creatorNotes?: string;
    characterDepthPrompt?: string;
    searchCorpus?: string;
}

export interface TavernCharacterWorldbookState {
    nativeCharacterId: string;
    characterName: string;
    boundWorldbookName: string;
    boundExists: boolean;
    hasEmbeddedBook: boolean;
    embeddedBookName: string;
    worldbookOptions: string[];
}

export interface TavernCharacterContext {
    avatarAvailable: TavernCommand<[avatar?: string], boolean>;
    backupSelectedCharacterArchive: TavernCommand<[], Promise<void>>;
    batchSize: number;
    characterArchiveSyncState: Ref<TavernCharacterArchiveProgress>;
    clearCharacterArchiveSyncState: TavernCommand;
    clearSelection: TavernCommand;
    characterWorldbookBusy: Ref<boolean>;
    characterWorldbookState: Ref<TavernCharacterWorldbookState | null>;
    characters: TavernReadable<TavernCharacterOption[]>;
    enterSelected: TavernCommand<[], Promise<void>>;
    filteredCount: TavernReadable<number>;
    hiddenCount: TavernReadable<number>;
    liveCharacterKey: TavernReadable<string>;
    loadMore: TavernCommand;
    movePreview: TavernCommand<[delta: number]>;
    openCharacterWorldbook: TavernCommand<[], Promise<void>>;
    pendingCharacterSessionKey: Ref<string>;
    pendingError: Ref<string>;
    pendingPreviewCharacterKey: Ref<string>;
    refresh: TavernCommand<[], Promise<void>>;
    rememberBrokenAvatar: TavernCommand<[avatar?: string]>;
    restoreSelectedCharacterArchive: TavernCommand<[], Promise<void>>;
    searchText: Ref<string>;
    select: TavernCommand<[characterKey: string], Promise<void>>;
    selectFirstVisible: TavernCommand;
    selectGreeting: TavernCommand<[index: number]>;
    selectLastVisible: TavernCommand;
    selectedCharacter: TavernReadable<TavernCharacterOption | null>;
    selectedGreetingIndex: Ref<number>;
    shortText: TavernCommand<[value?: string, limit?: number], string>;
    syncWorldbookState: TavernCommand<[characterKey?: string], Promise<void>>;
    visibleCharacters: TavernReadable<TavernCharacterOption[]>;
}

export interface TavernSessionContext {
    branchCurrentChatSession: TavernCommand<[], Promise<void>>;
    chatMessages: TavernReadable<TavernMessageRecord[]>;
    chatMessageWindow: TavernReadable<TavernMessageWindowState>;
    createNewChatSession: TavernCommand<[], Promise<void>>;
    currentAssistantFloor: TavernReadable<number>;
    currentChatCharacterSessions: TavernReadable<TavernSessionRecord[]>;
    removeSession: TavernCommand<[sessionId: string, event?: Event], Promise<void>>;
    selectedCharacterSessions: TavernReadable<TavernSessionRecord[]>;
    selectedSessionId: Ref<string>;
    selectSession: TavernCommand<[sessionId: string], Promise<void>>;
    sessionDisplayTitle: TavernCommand<[session?: TavernSessionRecord | null], string>;
    sessionFloorLabel: TavernCommand<[session?: TavernSessionRecord | null], string>;
    sessions: Ref<TavernSessionRecord[]>;
    visibleChatMessages: TavernReadable<TavernMessageRecord[]>;
}

export interface TavernRegexScriptDraft {
    scriptName?: string;
    findRegex?: string;
    replaceString?: string;
    scriptType?: number;
    disabled?: boolean;
    placement?: number[];
    [key: string]: unknown;
}

export interface TavernRegexGroupRow {
    key: string;
    label: string;
    scriptType: number;
    scripts: TavernRegexScriptDraft[];
    allowed?: boolean;
}

export interface TavernRegexScriptRow {
    key: string;
    scriptType: number;
    groupKey: string;
    groupLabel: string;
    script: TavernRegexScriptDraft;
    isNew?: boolean;
    searchCorpus?: string;
}

export interface TavernRegexGroupDisplayRow extends TavernRegexGroupRow {
    visibleRows: TavernRegexScriptRow[];
    totalCount: number;
    filteredCount: number;
    hiddenCount: number;
}

export interface TavernMemoryDirectoryGroup {
    key: string;
    title: string;
    totalCount: number;
    hiddenCount: number;
    files: TavernMemoryIndexFileEntry[];
}

export interface TavernMessageWindowState {
    startIndex: number;
    hiddenBefore: number;
    visibleCount: number;
}

export type { TavernDrawQuickSettings } from '../features/draw/useTavernDrawController';

export interface TavernManagerCompactionOverlay {
    active?: boolean;
    resolved?: boolean;
    status?: string;
    currentTokens?: number;
    triggerTokens?: number;
    yieldTokens?: number;
}

export interface TavernManagerToolTraceItem {
    id: string;
    round: number;
    name: string;
    status: string;
    ok: boolean;
    args: string;
    path: string;
    summary: string;
    error: string;
    preface: string;
    thoughts: Array<{ label?: string; text?: string }>;
    elapsedLabel: string;
}

export interface TavernShellContext {
    activeView: Ref<string>;
    alertTavernDialog: TavernCommand<[options: TavernDialogOptions | string], Promise<void>>;
    chatFocus: Ref<string>;
    confirmTavernDialog: TavernCommand<[options: TavernDialogOptions | string], Promise<boolean>>;
    homeThemeDark: Ref<boolean>;
    openPromptInspector: TavernCommand<[tab?: 'history' | 'simulate']>;
    postToHost: TavernCommand<[type: string, payload?: object]>;
    promptTavernDialog: TavernCommand<[options: TavernDialogOptions | string], Promise<string | null>>;
    rememberBrokenAvatar: TavernCommand<[url?: string]>;
    shortText: TavernCommand<[value?: string, limit?: number], string>;
}

export interface TavernChatContext {
    actionFeedback: TavernCommand<[message: TavernMessageRecord, action: string], string>;
    cancelEditMessage: TavernCommand;
    canEditMessage: TavernCommand<[message: TavernMessageRecord], boolean>;
    canRerunMessage: TavernCommand<[message: TavernMessageRecord], boolean>;
    canSendMessage: TavernReadable<boolean>;
    currentAuthorNote: TavernReadable<XbTavernAuthorNote>;
    chatAutoScroll: Ref<boolean>;
    chatFocus: Ref<string>;
    chatLayout: Ref<string>;
    chatComposeTextareaRef: Ref<HTMLTextAreaElement | null>;
    chatScrollControlsActive: Ref<boolean>;
    chatScrollContentRef: Ref<HTMLElement | null>;
    chatScrollRef: Ref<HTMLElement | null>;
    chatSubtitle: TavernReadable<string>;
    copyMessage: TavernCommand<[message: TavernMessageRecord], Promise<void>>;
    currentUserMessage: Ref<string>;
    deleteMessageTurn: TavernCommand<[message: TavernMessageRecord], Promise<void>>;
    displayMessageContent: TavernCommand<[message: TavernMessageRecord], string>;
    displayMessageRenderProjection: TavernCommand<[message: TavernMessageRecord], { text: string; actionCheckEvents: TavernActionCheckRuntimeEvent[] }>;
    displayMessageThoughtBlocks: TavernCommand<[message: TavernMessageRecord], Array<{ label?: string; text?: string }>>;
    displayRuntimeRenderProjection: TavernCommand<[], { text: string; actionCheckEvents: TavernActionCheckRuntimeEvent[] }>;
    displayRuntimeThoughtBlocks: TavernCommand<[], Array<{ label?: string; text?: string }>>;
    displayCharacterName: TavernReadable<string>;
    displayUserName: TavernReadable<string>;
    enhanceMarkdownRoot: TavernCommand<[root: HTMLElement, options?: { live?: boolean }]>;
    formatMessageTime: TavernCommand<[value: unknown], string>;
    handleChatScroll: TavernCommand;
    handleChatSubmit: TavernCommand;
    handleChatTouchMove: TavernCommand<[event: TouchEvent]>;
    handleChatTouchStart: TavernCommand<[event: TouchEvent]>;
    handleChatWheel: TavernCommand<[event: WheelEvent]>;
    handleComposeInput: TavernCommand<[event: Event]>;
    handleComposeKeydown: TavernCommand<[event: KeyboardEvent]>;
    isEditingMessage: TavernCommand<[message: TavernMessageRecord], boolean>;
    isCancellingRun: Ref<boolean>;
    isRunning: Ref<boolean>;
    markdownSignature: TavernCommand<[text?: string], string>;
    htmlRenderEnabled: Ref<boolean>;
    messageKey: TavernCommand<[message: TavernMessageRecord], string>;
    normalizeTavernSessionState: TavernCommand<[value?: unknown], { turn?: number }>;
    renderChatMarkdown: TavernCommand<[text?: string, options?: { roleplay?: boolean; userName?: string; characterName?: string }], string>;
    rerunFromMessage: TavernCommand<[message: TavernMessageRecord], Promise<void>>;
    revealOlderChatMessages: TavernCommand<[force?: boolean], boolean>;
    roleLabel: TavernCommand<[role?: string], string>;
    runtimePendingUserMessage: Ref<string>;
    runtimeStatusElapsedSeconds: Ref<number>;
    runtimeStatusLabel: Ref<string>;
    runtimeStatusStartedAt: Ref<number>;
    runtimeAssistantMessageKey: Ref<string>;
    runtimeUserMessageVisible: Ref<boolean>;
    releaseMarkdownRootResources: TavernCommand<[root: HTMLElement]>;
    saveEditMessage: TavernCommand<[message: TavernMessageRecord, options?: { rollbackState?: boolean; content?: string }], Promise<void>>;
    jumpChatToBottom: TavernCommand<[options?: { collapseWindow?: boolean; revealHelpers?: boolean }]>;
    scrollChatToTop: TavernCommand;
    saveCurrentAuthorNote: TavernCommand<[note: XbTavernAuthorNote], Promise<void>>;
    showChatScrollBottom: Ref<boolean>;
    showChatScrollTop: Ref<boolean>;
    startEditMessage: TavernCommand<[message: TavernMessageRecord]>;
    thoughtBlocks: TavernCommand<[messageOrThoughts: unknown], Array<{ label?: string; text?: string }>>;
    thoughtSummaryLabel: TavernCommand<[messageOrThoughts: unknown, streaming?: boolean], string>;
    updateChatScrollButtons: TavernCommand;
    visibleCharacterAvatar: TavernReadable<string>;
    visibleUserAvatar: TavernReadable<string>;
}

export interface TavernMessagesContext {
    activeContact: TavernReadable<TavernCommunicationContactRecord | null>;
    activeContactId: Ref<string>;
    activeThread: TavernReadable<TavernCommunicationThreadRecord | null>;
    activeThreadId: Ref<string>;
    addContact: TavernCommand<[candidate: TavernPhoneContactCandidate], Promise<void>>;
    canSend: TavernReadable<boolean>;
    contactCandidates: TavernReadable<TavernPhoneContactCandidate[]>;
    contacts: Ref<TavernCommunicationContactRecord[]>;
    conversationSending: TavernReadable<boolean>;
    draft: Ref<string>;
    draftsByThread: Ref<Record<string, string>>;
    filteredContactIds: TavernReadable<string[]>;
    isSending: Ref<boolean>;
    markActiveThreadRead: TavernCommand<[threadId?: string], Promise<void>>;
    messages: Ref<TavernCommunicationMessageRecord[]>;
    openContact: TavernCommand<[contactId: string], Promise<boolean | undefined>>;
    prepareMessages: TavernCommand<[], Promise<void>>;
    refreshPhone: TavernCommand<[], Promise<void>>;
    retryMessage: TavernCommand<[message: TavernCommunicationMessageRecord], Promise<void>>;
    searchQuery: Ref<string>;
    sendBlockedReason: TavernReadable<string>;
    sendMessage: TavernCommand<[contentOverride?: string], Promise<void>>;
    sendingSessionId: Ref<string>;
    status: Ref<string>;
    threadPreviews: Ref<Record<string, TavernCommunicationMessageRecord | null>>;
    threadSearchText: Ref<Record<string, string>>;
    threads: Ref<TavernCommunicationThreadRecord[]>;
    unreadTotal: TavernReadable<number>;
}

export interface TavernPhoneOsContext {
    activeApp: TavernReadable<TavernPhoneAppDefinition | null>;
    activeRoute: TavernReadable<TavernPhoneOsRoute>;
    apps: TavernReadable<TavernPhoneAppDefinition[]>;
    back: TavernCommand;
    backOrClose: TavernCommand;
    closePhone: TavernCommand;
    home: TavernCommand;
    isAppRouteVisible: TavernCommand<[sessionId?: string, appId?: string, pathPrefix?: string], boolean>;
    isHome: TavernReadable<boolean>;
    isOpen: Ref<boolean>;
    launchApp: TavernCommand<[appId?: string]>;
    openPhone: TavernCommand;
    presentationMode: Ref<TavernPhonePresentationMode>;
    pushAppRoute: TavernCommand<[appId?: string, path?: string, params?: Record<string, string>]>;
    replaceAppRoute: TavernCommand<[appId?: string, path?: string, params?: Record<string, string>]>;
    routeStack: Ref<TavernPhoneOsRoute[]>;
    transitionDirection: Ref<'forward' | 'back' | 'home'>;
    viewportHeight: Ref<number>;
    viewportOffsetLeft: Ref<number>;
    viewportOffsetTop: Ref<number>;
    viewportWidth: Ref<number>;
}

export interface TavernPhoneContext {
    addContact: TavernCommand<[candidate: TavernPhoneContactCandidate], Promise<void>>;
    isConversationVisible: TavernCommand<[sessionId?: string, threadId?: string], boolean>;
    messages: TavernMessagesContext;
    openContact: TavernCommand<[contactId: string], Promise<void>>;
    openPhone: TavernCommand<[], Promise<void>>;
    os: TavernPhoneOsContext;
    showAddContact: TavernCommand;
    showMessageThreads: TavernCommand;
}

export interface TavernManagerContext {
    activeMemoryFiles: TavernReadable<TavernMemoryIndexFileEntry[]>;
    archivedManagerRuns: TavernReadable<TavernManagerRunRecord[]>;
    canEditManagerMessage: TavernCommand<[message: TavernManagerMessageRecord], boolean>;
    canRerunManagerMessage: TavernCommand<[message: TavernManagerMessageRecord], boolean>;
    canSendManagerMessage: TavernReadable<boolean>;
    copyManagerMessage: TavernCommand<[message: TavernManagerMessageRecord], Promise<void>>;
    currentManagerWorkRun: TavernReadable<TavernManagerRunRecord | null>;
    deleteManagerMessageTurn: TavernCommand<[message: TavernManagerMessageRecord], Promise<void>>;
    editingMessageDraft: Ref<string>;
    enhanceManagerMarkdown: TavernCommand;
    formatRunActivityLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    formatRunIssueLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    formatRunInputLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    formatRunMapLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    formatRunMemoryLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    formatRunModelLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    formatRunTaskLine: TavernCommand<[run: TavernManagerRunRecord], string>;
    handleManagerComposeKeydown: TavernCommand<[event: KeyboardEvent]>;
    handleEditInput: TavernCommand<[event: Event]>;
    handleManagerEditKeydown: TavernCommand<[event: KeyboardEvent, message: TavernManagerMessageRecord]>;
    handleManagerScroll: TavernCommand;
    handleManagerSubmit: TavernCommand<[], Promise<void>>;
    handleManagerTouchMove: TavernCommand<[event: TouchEvent]>;
    handleManagerTouchStart: TavernCommand<[event: TouchEvent]>;
    handleManagerWheel: TavernCommand<[event: WheelEvent]>;
    hiddenManagerRunCount: TavernReadable<number>;
    isEditingManagerMessage: TavernCommand<[message: TavernManagerMessageRecord], boolean>;
    isEditingManagerMessageDirty: TavernCommand<[message: TavernManagerMessageRecord], boolean>;
    isManagerAssistantCancelling: Ref<boolean>;
    isManagerAssistantRunning: Ref<boolean>;
    isManagerRunRetrying: TavernCommand<[run: TavernManagerRunRecord | null | undefined], boolean>;
    liveManagerChatDisplayItems: TavernReadable<ManagerChatDisplayItem[]>;
    managerActionFeedback: TavernCommand<[message: TavernManagerMessageRecord, action: string], string>;
    managerAutoScroll: Ref<boolean>;
    managerBusy: TavernReadable<boolean>;
    managerCompactionOverlay: Ref<TavernManagerCompactionOverlay | null>;
    managerComposeTextareaRef: Ref<HTMLTextAreaElement | null>;
    managerInputDraft: Ref<string>;
    managerInputStatus: Ref<string>;
    managerMessageWindow: TavernReadable<TavernMessageWindowState>;
    managerPendingUserMessage: TavernReadable<TavernManagerMessageRecord | null>;
    managerRuns: Ref<TavernManagerRunRecord[]>;
    managerRunTone: TavernCommand<[runOrStatus: TavernManagerRunRecord | string], string>;
    managerScrollControlsActive: Ref<boolean>;
    managerScrollRef: Ref<HTMLElement | null>;
    managerWorkRef: Ref<HTMLElement | null>;
    managerStatusLabel: TavernCommand<[status?: string], string>;
    managerToolStatusLabel: TavernCommand<[item: { status?: string; ok?: boolean }], string>;
    managerToolTone: TavernCommand<[item: { status?: string; ok?: boolean }], string>;
    managerToolTraceItems: TavernCommand<[value: unknown], TavernManagerToolTraceItem[]>;
    managerToolTurnPreview: TavernCommand<[item: ManagerChatDisplayItem], string>;
    managerToolTurnSummary: TavernCommand<[item: ManagerChatDisplayItem], string>;
    memoryFileDisplayName: TavernCommand<[fileOrPath?: TavernMemoryFileListEntry | TavernMemoryFileRecord | string | null], string>;
    memoryFiles: Ref<TavernMemoryIndexFileEntry[]>;
    memoryIndexStatusLine: TavernReadable<string>;
    retryManagerRun: TavernCommand<[run: TavernManagerRunRecord], Promise<void>>;
    revealOlderManagerMessages: TavernCommand<[force?: boolean], boolean>;
    rerunFromManagerMessage: TavernCommand<[message: TavernManagerMessageRecord], Promise<void>>;
    saveEditManagerMessage: TavernCommand<[message: TavernManagerMessageRecord, options?: { rerun?: boolean }], Promise<void>>;
    scrollManagerToBottom: TavernCommand<[force?: boolean, options?: { collapseWindow?: boolean; revealHelpers?: boolean }]>;
    scrollManagerToTop: TavernCommand;
    selectedMemoryFile: TavernReadable<TavernMemoryFileRecord | null>;
    showManagerScrollBottom: Ref<boolean>;
    showManagerScrollTop: Ref<boolean>;
    startEditManagerMessage: TavernCommand<[message: TavernManagerMessageRecord]>;
    toolTraceSummary: TavernCommand<[value: unknown], string>;
    updateManagerScrollButtons: TavernCommand;
    visibleManagerChatItems: TavernReadable<ManagerChatDisplayItem[]>;
}

export interface TavernMemoryContext {
    activeMemoryFiles: TavernReadable<TavernMemoryIndexFileEntry[]>;
    commitAcceptedState: TavernCommand<[sessionId?: string], Promise<void>>;
    commitUserAcceptedState: TavernCommand<[sessionId?: string, userOrder?: number], Promise<void>>;
    discardMemoryDraft: TavernCommand;
    enterMemoryEditMode: TavernCommand;
    expandMemoryFileGroup: TavernCommand<[groupKey?: string]>;
    formatMemoryFileMeta: TavernCommand<[file: TavernMemoryFileListEntry | TavernMemoryFileRecord], string>;
    markdownSignature: TavernCommand<[text?: string], string>;
    MEMORY_FILE_BATCH_SIZE: number;
    MEMORY_TURN_BATCH_SIZE: number;
    memoryDirectoryGroups: TavernReadable<TavernMemoryDirectoryGroup[]>;
    memoryEditorDirty: TavernReadable<boolean>;
    memoryEditorDocumentAvailable: TavernReadable<boolean>;
    memoryEditorDraft: Ref<string>;
    memoryEditorLoadedPath: Ref<string>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    memoryEditorReadOnly: TavernReadable<boolean>;
    memoryEditorStatus: Ref<string>;
    memoryFileDisplayName: TavernCommand<[fileOrPath?: TavernMemoryFileListEntry | TavernMemoryFileRecord | string | null], string>;
    memoryFileKindLabel: TavernCommand<[fileOrPath?: TavernMemoryFileListEntry | TavernMemoryFileRecord | string | null], string>;
    memoryFiles: Ref<TavernMemoryIndexFileEntry[]>;
    memoryFileSearchText: Ref<string>;
    memoryFileStatusLabel: TavernCommand<[status?: string], string>;
    previewMemoryDraft: TavernCommand;
    renderChatMarkdown: TavernCommand<[text?: string, options?: { roleplay?: boolean; userName?: string; characterName?: string }], string>;
    saveSelectedMemoryFile: TavernCommand<[], Promise<void>>;
    selectedMemoryFileEntry: TavernReadable<TavernMemoryIndexFileEntry | null>;
    selectedMemoryFile: TavernReadable<TavernMemoryFileRecord | null>;
    selectedMemoryFilePath: Ref<string>;
    selectMemoryFile: TavernCommand<[path?: string], Promise<boolean>>;
    stateMemoryFile: Ref<TavernMemoryFileRecord | null>;
}

export type TavernChatWorkspacePanelKey = 'map' | 'status' | 'memory' | 'event';

export interface TavernWorkspaceContext {
    activeMemoryFiles: TavernReadable<TavernMemoryIndexFileEntry[]>;
    activeMapDocId: Ref<string>;
    atlasActiveLocationKey: Ref<string>;
    atlasStateDocument: Ref<TavernStructuredStateDocumentRecord | null>;
    atlasStatePatches: Ref<TavernStructuredStatePatchRecord[]>;
    chatWorkspacePanel: Ref<TavernChatWorkspacePanelKey>;
    displayUserName: TavernReadable<string>;
    mapStateDocuments: Ref<TavernMapStateDocumentItem[]>;
    mapStateDocument: Ref<TavernStructuredStateDocumentRecord | null>;
    mapStatePatches: Ref<TavernStructuredStatePatchRecord[]>;
    materialSymbolFontReady: TavernReadable<boolean>;
    materialSymbolFontStatus: TavernReadable<'idle' | 'loading' | 'ready' | 'failed'>;
    statusFieldDeltas: Ref<TavernStatusFieldDeltaMap>;
    statusStateDocument: Ref<TavernStructuredStateDocumentRecord | null>;
    statusStatePatches: Ref<TavernStructuredStatePatchRecord[]>;
    saveSessionContract: TavernCommand<[nextContract?: Partial<TavernSessionContract>], Promise<TavernSessionRecord | null>>;
    sessionContract: TavernReadable<TavernSessionContract>;
    stateMemoryFile: Ref<TavernMemoryFileRecord | null>;
    tavernTasks: Ref<TavernTaskRecord[]>;
    visibleUserAvatar: TavernReadable<string>;
}

export interface TavernSettingsContext {
    activeAssistantPresetId: Ref<string>;
    activePromptOrderLabel: TavernReadable<string>;
    activeSettingsWorkspace: Ref<string>;
    activeView: Ref<string>;
    apiReady: TavernReadable<boolean>;
    apiReadyDetail: TavernReadable<string>;
    apiRuntimeLine: TavernReadable<string>;
    apiSettingsRootRef: Ref<HTMLElement | null>;
    applyActiveRegexScript: TavernCommand<[row: TavernRegexScriptRow | null]>;
    ASSISTANT_PRESET_BATCH_SIZE: number;
    assistantPreset: Ref<TavernAssistantPreset>;
    assistantPresetDirty: TavernReadable<boolean>;
    assistantPresetItems: TavernReadable<TavernAssistantPresetItemRow[]>;
    assistantPresets: Ref<TavernAssistantPresetRecord[]>;
    assistantPresetSearchText: Ref<string>;
    assistantPresetSaveFeedback: Ref<TavernSaveFeedback>;
    assistantPresetStatus: Ref<string>;
    assistantPresetVisibleLimit: Ref<number>;
    canEditPromptOrder: TavernReadable<boolean>;
    cancelWorldbookEntryEdit: TavernCommand;
    discardRegexChanges: TavernCommand;
    chatPresetOptions: TavernReadable<TavernChatPresetOptionRow[]>;
    chatPresetSourceSearchText: Ref<string>;
    chatPresetSourceVisibleLimit: Ref<number>;
    CHAT_PRESET_SOURCE_BATCH_SIZE: number;
    currentTavernUser: TavernReadable<TavernUserOption | null>;
    currentTavernUserId: Ref<string | null>;
    createAssistantPreset: TavernCommand<[], Promise<void>>;
    createRegexScript: TavernCommand<[group: TavernRegexGroupRow], Promise<boolean>>;
    displaySettings: Ref<TavernDisplaySettings>;
    deleteCurrentAssistantPreset: TavernCommand<[], Promise<void>>;
    deleteCurrentRegexScript: TavernCommand<[], Promise<void>>;
    deriveAssistantPreset: TavernCommand<[], Promise<void>>;
    discardAssistantPresetChanges: TavernCommand<[], Promise<void>>;
    discardPresetChanges: TavernCommand<[], Promise<void>>;
    expandRegexGroup: TavernCommand<[groupKey?: string]>;
    filteredPromptEditorRows: TavernReadable<TavernPromptEditorRow[]>;
    globalWorldbookOptions: Ref<string[]>;
    globalWorldbookSelected: Ref<string[]>;
    globalWorldbookSaving: Ref<boolean>;
    globalWorldbookStatus: Ref<string>;
    hiddenAssistantPresetCount: TavernReadable<number>;
    hiddenChatPresetOptionCount: TavernReadable<number>;
    hiddenPromptCount: TavernReadable<number>;
    hiddenWorldbookPreviewEntryCount: TavernReadable<number>;
    homeThemeDark: Ref<boolean>;
    importAssistantPreset: TavernCommand<[payload: unknown], Promise<boolean>>;
    isEditingWorldbookEntry: TavernCommand<[entry: TavernWorldbookPreviewEntryRow], boolean>;
    loadTavernUsers: TavernCommand<[], Promise<void>>;
    linesFromList: TavernCommand<[value: unknown], string>;
    listFromLines: TavernCommand<[value?: string], string[]>;
    movePromptRow: TavernCommand<[identifier: string, direction: -1 | 1]>;
    postToHost: TavernCommand<[type: string, payload?: object]>;
    preset: Ref<TavernChatPromptPresetBundle>;
    presetDirty: TavernReadable<boolean>;
    presetRows: TavernReadable<Array<{ previewId: string; previewLabel: string; previewPlacement: string; sectionIndex: number; chars: number }>>;
    presetSaveFeedback: Ref<TavernSaveFeedback>;
    presetStatus: Ref<string>;
    presetTotalChars: TavernReadable<number>;
    PROMPT_EDITOR_BATCH_SIZE: number;
    promptEditorRows: TavernReadable<TavernPromptEditorRow[]>;
    promptRoleDisplay: TavernCommand<[role?: string], string>;
    promptRowIndex: TavernCommand<[identifier: string], number>;
    promptSearchText: Ref<string>;
    promptVisibleLimit: Ref<number>;
    refreshPresets: TavernCommand<[], Promise<void>>;
    refreshRegexFromHost: TavernCommand<[], Promise<void>>;
    REGEX_GROUP_BATCH_SIZE: number;
    regexDirty: TavernReadable<boolean>;
    regexDraft: Ref<TavernRegexScriptDraft>;
    regexDraftTypeLabel: TavernCommand<[], string>;
    regexGroups: TavernReadable<TavernRegexGroupRow[]>;
    regexGroupsForDisplay: TavernReadable<TavernRegexGroupDisplayRow[]>;
    regexPlacementLabel: TavernCommand<[value: number], string>;
    regexScriptRows: TavernReadable<TavernRegexScriptRow[]>;
    regexSearchText: Ref<string>;
    regexSaveFeedback: Ref<TavernSaveFeedback>;
    regexStatus: Ref<string>;
    saveCurrentAssistantPreset: TavernCommand<[], Promise<void>>;
    saveCurrentPreset: TavernCommand<[], Promise<void>>;
    saveCurrentRegexScript: TavernCommand<[], Promise<void>>;
    saveGlobalWorldbooksToHost: TavernCommand<[selected?: string[]], Promise<void>>;
    saveWorldbookEntryDraft: TavernCommand<[], Promise<void>>;
    selectAssistantPreset: TavernCommand<[presetId: string], Promise<void>>;
    selectAssistantPresetItem: TavernCommand<[itemId: string]>;
    selectChatPresetFromHost: TavernCommand<[name?: string], Promise<void>>;
    selectedAssistantPresetItem: TavernReadable<TavernAssistantPresetItemRow | null>;
    selectedPresetSourceId: Ref<string>;
    selectedPromptIdentifier: Ref<string>;
    selectedPromptRow: TavernReadable<TavernPromptEditorRow | null>;
    selectedRegexKey: Ref<string>;
    selectedRegexRow: TavernReadable<TavernRegexScriptRow | null>;
    selectedWorldbook: TavernReadable<TavernWorldbookOptionRow | null>;
    selectedWorldbookName: Ref<string>;
    deleteRegexScript: TavernCommand<[row: TavernRegexScriptRow], Promise<void>>;
    selectRegexScript: TavernCommand<[row: TavernRegexScriptRow], Promise<boolean>>;
    selectSettingsWorkspace: TavernCommand<[workspace: string]>;
    settingsNavItems: TavernReadable<TavernSettingsNavItem[]>;
    shortText: TavernCommand<[value?: string, limit?: number], string>;
    showMoreWorldbookPreviewEntries: TavernCommand;
    stepHiddenOutsideCount: TavernCommand<[direction: -1 | 1]>;
    stepLoadBatchSize: TavernCommand<[direction: -1 | 1]>;
    startWorldbookEntryEdit: TavernCommand<[entry: TavernWorldbookPreviewEntryRow], Promise<void>>;
    switchingTavernUserId: Ref<string>;
    syncChatPresetFromHost: TavernCommand<[], Promise<void>>;
    syncGlobalWorldbooksFromHost: TavernCommand<[], Promise<void>>;
    syncWorldbooksForCurrentCharacter: TavernCommand<[], Promise<void>>;
    syncWorldbooksFromHost: TavernCommand<[options?: { keepSelection?: boolean; preferredName?: string; selectFirst?: boolean }], Promise<void>>;
    switchTavernUser: TavernCommand<[userId: string], Promise<void>>;
    tavernUsers: Ref<TavernUserOption[]>;
    toggleGlobalWorldbook: TavernCommand<[name: string, selected: boolean]>;
    togglePromptRow: TavernCommand<[identifier: string, enabled: boolean]>;
    toggleRegexPlacement: TavernCommand<[value: number, checked: boolean]>;
    updateAssistantPresetPatch: TavernCommand<[patch: Partial<TavernAssistantPreset>]>;
    updateDisplaySettingsPatch: TavernCommand<[patch: Partial<TavernDisplaySettings>]>;
    updatePromptByIdentifier: TavernCommand<[identifier: string, patch: object]>;
    updateRegexPatch: TavernCommand<[patch: Partial<TavernRegexScriptDraft>]>;
    updateSelectedAssistantPresetItem: TavernCommand<[value?: string]>;
    updateWorldbookEntryDraftPatch: TavernCommand<[patch: Partial<TavernWorldbookEntryDraft>]>;
    baseSettingsLoading: Ref<boolean>;
    baseSettingsSaving: Ref<boolean>;
    baseSettingsStatus: Ref<string>;
    visibleAssistantPresetRecords: TavernReadable<TavernAssistantPresetRecord[]>;
    visibleChatPresetOptions: TavernReadable<TavernChatPresetOptionRow[]>;
    visiblePromptEditorRows: TavernReadable<TavernPromptEditorRow[]>;
    WORLDBOOK_PREVIEW_BATCH_SIZE: number;
    worldbookEntryDirty: TavernReadable<boolean>;
    worldbookEntryDraft: Ref<TavernWorldbookEntryDraft | null>;
    worldbookEntryEditingKey: Ref<string>;
    worldbookEntrySaveFeedback: Ref<TavernSaveFeedback>;
    worldbookEntrySaving: TavernReadable<boolean>;
    worldbookEntryStatus: Ref<string>;
    worldbookOptions: TavernReadable<TavernWorldbookOptionRow[]>;
    worldbookPreview: Ref<TavernWorldbookPreviewRow | null>;
    worldbookPreviewStatus: Ref<string>;
    worldbookPreviewVisibleLimit: Ref<number>;
    worldbookStatus: Ref<string>;
}

export interface TavernAppUiContext {
    shell: TavernShellContext;
    character: TavernCharacterContext;
    session: TavernSessionContext;
    draw: TavernDrawContext;
    chat: TavernChatContext;
    phone: TavernPhoneContext;
    manager: TavernManagerContext;
    memory: TavernMemoryContext;
    workspace: TavernWorkspaceContext;
    settings: TavernSettingsContext;
}

export const TAVERN_APP_UI_CONTEXT: InjectionKey<TavernAppUiContext> = Symbol('TavernAppUiContext');

export function useTavernAppUiContext(): TavernAppUiContext {
    const context = inject(TAVERN_APP_UI_CONTEXT);
    if (!context) {
        throw new Error('tavern_app_ui_context_missing');
    }
    return context;
}

export function useTavernShellContext(): TavernShellContext {
    return useTavernAppUiContext().shell;
}

export function useTavernCharacterContext(): TavernCharacterContext {
    return useTavernAppUiContext().character;
}

export function useTavernSessionContext(): TavernSessionContext {
    return useTavernAppUiContext().session;
}

export function useTavernDrawContext(): TavernDrawContext {
    return useTavernAppUiContext().draw;
}

export function useTavernChatContext(): TavernChatContext {
    return useTavernAppUiContext().chat;
}

export function useTavernPhoneContext(): TavernPhoneContext {
    return useTavernAppUiContext().phone;
}

export function useTavernManagerContext(): TavernManagerContext {
    return useTavernAppUiContext().manager;
}

export function useTavernMemoryContext(): TavernMemoryContext {
    return useTavernAppUiContext().memory;
}

export function useTavernWorkspaceContext(): TavernWorkspaceContext {
    return useTavernAppUiContext().workspace;
}

export function useTavernSettingsContext(): TavernSettingsContext {
    return useTavernAppUiContext().settings;
}
