import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import {
    countTavernMessages,
    deleteTavernSession,
    getLatestTavernAssistantOrder,
    getSelectedTavernSessionId,
    listTavernSessions,
    loadTavernMessageWindow,
    setSelectedTavernSessionId,
    type TavernMessageRecord,
    type TavernSessionRecord,
} from '../../../shared/session-db';

export interface TavernSessionState {
    chatMessages: ComputedRef<TavernMessageRecord[]>;
    currentAssistantFloor: ComputedRef<number>;
    latestSessionMessage: ComputedRef<TavernMessageRecord | null>;
    loadedSessionMessageEndOrder: Ref<number | null>;
    loadedSessionMessageStartOrder: Ref<number | null>;
    loadedSessionMessages: Ref<TavernMessageRecord[]>;
    selectedSession: ComputedRef<TavernSessionRecord | null>;
    selectedSessionId: Ref<string>;
    selectedSessionLatestAssistantOrder: Ref<number>;
    selectedSessionMessageTotal: Ref<number>;
    sessionMessageCounts: Ref<Record<string, number>>;
    sessions: Ref<TavernSessionRecord[]>;
    visibleChatMessages: ComputedRef<TavernMessageRecord[]>;
}

export interface TavernSessionControllerOptions {
    activeView: Ref<'home' | 'chat' | 'settings' | 'about'>;
    chatFocus: Ref<'chat' | 'manager'>;
    chatMessageWindowLimit: Ref<number>;
    hiddenOutsideCount: Ref<number>;
    isRunning: Ref<boolean>;
    selectedCharacterPreviewKey: Ref<string>;
    selectedSessionCharacterError: Ref<string>;
    abortActiveRun: () => void;
    applySessionSnapshotContext: (session?: TavernSessionRecord | null) => void;
    cancelAndRollbackManagersForSession: (sessionId: string) => Promise<unknown>;
    cancelDrawJobsForSession: (sessionId: string) => void;
    confirmDeleteSession: (title: string) => Promise<boolean>;
    describeSessionTitle: (session?: TavernSessionRecord | null) => string;
    invalidateMemoryFileRecordLoad: () => void;
    openCharacterSettingsWorkspace: () => void;
    refreshManagerRecords: (sessionId?: string) => Promise<unknown>;
    reportStartupProgress: (percent: number, action: string) => void;
    resetChatMessageWindowState: () => void;
    resetSessionPreviewState: () => void;
    placeChatAtBottomForNewContext: () => void;
    syncCharacterWorldbookState: (characterKey?: string) => Promise<unknown> | unknown;
    syncSessionCharacterContextSafely: (options?: { sessionId?: string; force?: boolean }) => Promise<void>;
}

export function createTavernSessionState(): TavernSessionState {
    const sessions = ref<TavernSessionRecord[]>([]);
    const selectedSessionId = ref('');
    const loadedSessionMessages = ref<TavernMessageRecord[]>([]);
    const selectedSessionMessageTotal = ref(0);
    const loadedSessionMessageStartOrder = ref<number | null>(null);
    const loadedSessionMessageEndOrder = ref<number | null>(null);
    const selectedSessionLatestAssistantOrder = ref(-1);
    const sessionMessageCounts = ref<Record<string, number>>({});
    const selectedSession = computed(() => sessions.value.find((item) => item.id === selectedSessionId.value) || null);
    const chatMessages = computed(() => loadedSessionMessages.value);
    const latestSessionMessage = computed(() => latestMessageInMemory(loadedSessionMessages.value));
    const currentAssistantFloor = computed(() => selectedSessionLatestAssistantOrder.value);
    const visibleChatMessages = computed(() => loadedSessionMessages.value);

    return {
        chatMessages,
        currentAssistantFloor,
        latestSessionMessage,
        loadedSessionMessageEndOrder,
        loadedSessionMessageStartOrder,
        loadedSessionMessages,
        selectedSession,
        selectedSessionId,
        selectedSessionLatestAssistantOrder,
        selectedSessionMessageTotal,
        sessionMessageCounts,
        sessions,
        visibleChatMessages,
    };
}

function latestMessageInMemory(messages: TavernMessageRecord[]) {
    let latest: TavernMessageRecord | null = null;
    messages.forEach((message) => {
        if (!latest || message.order > latest.order) {
            latest = message;
        }
    });
    return latest;
}

function sessionUpdatedSortValue(session: TavernSessionRecord): number {
    return Number(session.updatedAt) || Number(session.createdAt) || 0;
}

export function useTavernSessionController(state: TavernSessionState, options: TavernSessionControllerOptions) {
    let selectedMessageWindowLoadSequence = 0;
    let suppressNextChatWindowLimitReloadPending = false;

    const chatMessageWindow = computed(() => {
        const total = Math.max(0, Math.floor(Number(state.selectedSessionMessageTotal.value) || 0));
        const visibleCount = state.loadedSessionMessages.value.length;
        const hiddenBefore = Math.max(0, total - visibleCount);
        return {
            startIndex: hiddenBefore,
            hiddenBefore,
            visibleCount,
            limit: options.chatMessageWindowLimit.value,
            total,
        };
    });

    watch([
        () => state.selectedSessionId.value,
        () => state.selectedSessionMessageTotal.value,
    ], ([sessionId, count]) => {
        rememberSessionMessageCount(String(sessionId || ''), Number(count) || 0);
    });

    function rememberSessionMessageCount(sessionId = '', count = 0) {
        const id = String(sessionId || '').trim();
        if (!id) {return;}
        const nextCount = Math.max(0, Math.floor(Number(count) || 0));
        if (state.sessionMessageCounts.value[id] === nextCount) {return;}
        state.sessionMessageCounts.value = {
            ...state.sessionMessageCounts.value,
            [id]: nextCount,
        };
    }

    function forgetSessionMessageCount(sessionId = '') {
        const id = String(sessionId || '').trim();
        if (!id || !(id in state.sessionMessageCounts.value)) {return;}
        const next = { ...state.sessionMessageCounts.value };
        delete next[id];
        state.sessionMessageCounts.value = next;
    }

    function sessionFloorCount(session?: TavernSessionRecord | null) {
        const id = String(session?.id || '').trim();
        if (!id) {return 0;}
        if (id === state.selectedSessionId.value) {return state.selectedSessionMessageTotal.value;}
        return Math.max(0, Number(state.sessionMessageCounts.value[id]) || 0);
    }

    function sessionFloorLabel(session?: TavernSessionRecord | null) {
        const id = String(session?.id || '').trim();
        if (id && id !== state.selectedSessionId.value && !(id in state.sessionMessageCounts.value)) {
            return '统计中';
        }
        return `第 ${sessionFloorCount(session)} 楼`;
    }

    async function refreshSessionMessageCountsForSessions(targetSessions: TavernSessionRecord[] = []) {
        const visibleIds = targetSessions
            .map((session) => String(session.id || '').trim())
            .filter(Boolean);
        const missingIds = [...new Set(visibleIds)]
            .filter((id) => id !== state.selectedSessionId.value && !(id in state.sessionMessageCounts.value));
        if (!missingIds.length) {return;}
        const entries = await Promise.all(missingIds.map(async (id) => [id, await countTavernMessages(id)] as const));
        const next = { ...state.sessionMessageCounts.value };
        entries.forEach(([id, count]) => {
            if (id === state.selectedSessionId.value || id in state.sessionMessageCounts.value) {return;}
            next[id] = Math.max(0, Math.floor(Number(count) || 0));
        });
        state.sessionMessageCounts.value = next;
    }

    function clearLoadedSessionMessageWindow() {
        state.loadedSessionMessages.value = [];
        state.selectedSessionMessageTotal.value = 0;
        state.loadedSessionMessageStartOrder.value = null;
        state.loadedSessionMessageEndOrder.value = null;
        state.selectedSessionLatestAssistantOrder.value = -1;
    }

    async function loadSelectedSessionMessageWindow(loadOptions: { reset?: boolean; sessionId?: string } = {}) {
        options.reportStartupProgress(96, 'loadSelectedSessionMessageWindow');
        const sessionId = String(loadOptions.sessionId || state.selectedSessionId.value || '').trim();
        const sequence = selectedMessageWindowLoadSequence + 1;
        selectedMessageWindowLoadSequence = sequence;
        if (!sessionId) {
            clearLoadedSessionMessageWindow();
            return;
        }
        if (loadOptions.reset) {
            options.resetChatMessageWindowState();
        }
        const limit = Math.max(1, Math.floor(Number(options.chatMessageWindowLimit.value) || options.hiddenOutsideCount.value || 1));
        const [windowResult, latestAssistantOrder] = await Promise.all([
            loadTavernMessageWindow(sessionId, limit),
            getLatestTavernAssistantOrder(sessionId),
        ]);
        if (sequence !== selectedMessageWindowLoadSequence || sessionId !== state.selectedSessionId.value) {return;}
        state.loadedSessionMessages.value = windowResult.messages;
        state.selectedSessionMessageTotal.value = windowResult.total;
        state.loadedSessionMessageStartOrder.value = windowResult.loadedStartOrder;
        state.loadedSessionMessageEndOrder.value = windowResult.loadedEndOrder;
        state.selectedSessionLatestAssistantOrder.value = latestAssistantOrder ?? -1;
        rememberSessionMessageCount(sessionId, windowResult.total);
    }

    function upsertLoadedSessionMessage(message: TavernMessageRecord) {
        const messageSessionId = String(message.sessionId || '').trim();
        if (!messageSessionId || messageSessionId !== state.selectedSessionId.value) {return;}
        const currentMessages = state.loadedSessionMessages.value;
        const existingIndex = currentMessages.findIndex((item) => item.sessionId === message.sessionId && item.order === message.order);
        if (existingIndex >= 0) {
            state.loadedSessionMessages.value = currentMessages.map((item, index) => index === existingIndex ? message : item);
        } else {
            const messageOrder = Number(message.order);
            const tailOrder = Number(currentMessages.at(-1)?.order);
            if (!currentMessages.length || !Number.isFinite(messageOrder) || !Number.isFinite(tailOrder) || messageOrder >= tailOrder) {
                state.loadedSessionMessages.value = [...currentMessages, message];
            } else {
                const insertIndex = currentMessages.findIndex((item) => Number(item.order) > messageOrder);
                state.loadedSessionMessages.value = insertIndex >= 0
                    ? [...currentMessages.slice(0, insertIndex), message, ...currentMessages.slice(insertIndex)]
                    : [...currentMessages, message];
            }
            state.selectedSessionMessageTotal.value = Math.max(
                Math.max(0, Math.floor(Number(state.selectedSessionMessageTotal.value) || 0)) + 1,
                state.loadedSessionMessages.value.length,
            );
        }
        const messageOrder = Number(message.order);
        if (Number.isFinite(messageOrder)) {
            state.loadedSessionMessageStartOrder.value = state.loadedSessionMessageStartOrder.value === null
                ? messageOrder
                : Math.min(state.loadedSessionMessageStartOrder.value, messageOrder);
            state.loadedSessionMessageEndOrder.value = state.loadedSessionMessageEndOrder.value === null
                ? messageOrder
                : Math.max(state.loadedSessionMessageEndOrder.value, messageOrder);
            if (message.role === 'assistant') {
                state.selectedSessionLatestAssistantOrder.value = Math.max(state.selectedSessionLatestAssistantOrder.value, messageOrder);
            }
        }
        rememberSessionMessageCount(messageSessionId, state.selectedSessionMessageTotal.value);
    }

    function pruneLoadedSessionMessagesFromOrder(sessionId = '', fromOrder = Number.POSITIVE_INFINITY): number {
        const targetSessionId = String(sessionId || '').trim();
        const firstRemovedOrder = Number(fromOrder);
        if (!targetSessionId || targetSessionId !== state.selectedSessionId.value || !Number.isFinite(firstRemovedOrder)) {return 0;}
        const currentMessages = state.loadedSessionMessages.value;
        const remainingMessages = currentMessages.filter((message) => (
            message.sessionId !== targetSessionId || Number(message.order) < firstRemovedOrder
        ));
        const removedCount = currentMessages.length - remainingMessages.length;
        if (removedCount <= 0) {return 0;}
        state.loadedSessionMessages.value = remainingMessages;
        state.selectedSessionMessageTotal.value = Math.max(
            remainingMessages.length,
            Math.max(0, Math.floor(Number(state.selectedSessionMessageTotal.value) || 0) - removedCount),
        );
        const remainingOrders = remainingMessages
            .map((message) => Number(message.order))
            .filter((order) => Number.isFinite(order));
        state.loadedSessionMessageStartOrder.value = remainingOrders.length ? Math.min(...remainingOrders) : null;
        state.loadedSessionMessageEndOrder.value = remainingOrders.length ? Math.max(...remainingOrders) : null;
        state.selectedSessionLatestAssistantOrder.value = remainingMessages
            .filter((message) => message.role === 'assistant' && Number.isFinite(Number(message.order)))
            .reduce((latest, message) => Math.max(latest, Number(message.order)), -1);
        rememberSessionMessageCount(targetSessionId, state.selectedSessionMessageTotal.value);
        return removedCount;
    }

    function touchSessionLocally(sessionId: string, updatedAt = Date.now()) {
        const id = String(sessionId || '').trim();
        if (!id) {return;}
        const timestamp = Number(updatedAt) || Date.now();
        let touched = false;
        const nextSessions = state.sessions.value.map((session) => {
            if (session.id !== id) {return session;}
            touched = true;
            return {
                ...session,
                updatedAt: Math.max(sessionUpdatedSortValue(session), timestamp),
            };
        });
        if (!touched) {return;}
        state.sessions.value = nextSessions.sort((left, right) => sessionUpdatedSortValue(right) - sessionUpdatedSortValue(left));
    }

    function updateSessionRecord(updated?: TavernSessionRecord | null) {
        if (!updated?.id) {return;}
        state.sessions.value = state.sessions.value.map((session) => session.id === updated.id ? updated : session);
    }

    function setSelectedSessionId(sessionId = '') {
        state.selectedSessionId.value = String(sessionId || '').trim();
    }

    async function persistSelectedSessionId(sessionId = '') {
        return await setSelectedTavernSessionId(sessionId);
    }

    async function clearSelectedSession(clearOptions: { persist?: boolean; refreshManager?: boolean; clearCharacterError?: boolean } = {}) {
        state.selectedSessionId.value = '';
        if (clearOptions.clearCharacterError !== false) {
            options.selectedSessionCharacterError.value = '';
        }
        clearLoadedSessionMessageWindow();
        if (clearOptions.persist) {
            await persistSelectedSessionId('');
        }
        if (clearOptions.refreshManager) {
            await options.refreshManagerRecords('');
        }
    }

    async function refreshSessions() {
        options.reportStartupProgress(94, 'refreshSessions');
        state.sessions.value = await listTavernSessions();
        const storedSessionId = String(await getSelectedTavernSessionId() || '').trim();
        state.selectedSessionId.value = state.sessions.value.some((session) => session.id === storedSessionId)
            ? storedSessionId
            : '';
        if (storedSessionId && !state.selectedSessionId.value) {
            await persistSelectedSessionId('');
        }
        await loadSelectedSessionMessageWindow();
        await options.refreshManagerRecords(state.selectedSessionId.value);
        if (state.selectedSessionId.value) {
            void options.syncSessionCharacterContextSafely({ sessionId: state.selectedSessionId.value });
        }
    }

    async function selectSession(sessionId: string) {
        const id = String(sessionId || '').trim();
        if (!id) {return;}
        options.resetSessionPreviewState();
        options.invalidateMemoryFileRecordLoad();
        state.selectedSessionId.value = id;
        options.selectedSessionCharacterError.value = '';
        const session = state.sessions.value.find((item) => item.id === id) || null;
        options.applySessionSnapshotContext(session);
        await persistSelectedSessionId(id);
        await loadSelectedSessionMessageWindow({ reset: true, sessionId: id });
        await options.refreshManagerRecords(id);
        void options.syncSessionCharacterContextSafely({ sessionId: id, force: true });
        options.activeView.value = 'chat';
        options.chatFocus.value = 'chat';
        options.placeChatAtBottomForNewContext();
    }

    async function removeSession(sessionId: string) {
        const id = String(sessionId || '').trim();
        if (!id) {return;}
        const session = state.sessions.value.find((item) => item.id === id);
        const deletedCharacterKey = String(session?.characterKey || '').trim();
        const isDeletingSelectedSession = id === state.selectedSessionId.value;
        const nextSameCharacterSession = deletedCharacterKey
            ? state.sessions.value
                .filter((item) => item.id !== id && String(item.characterKey || '').trim() === deletedCharacterKey)
                .slice()
                .sort((left, right) => sessionUpdatedSortValue(right) - sessionUpdatedSortValue(left))[0]
            : null;
        const title = options.describeSessionTitle(session) || '这个会话';
        if (!await options.confirmDeleteSession(title)) {return;}
        if (isDeletingSelectedSession && options.isRunning.value) {
            options.abortActiveRun();
        }
        options.cancelDrawJobsForSession(id);
        await options.cancelAndRollbackManagersForSession(id);
        const removed = await deleteTavernSession(id);
        if (!removed) {return;}
        forgetSessionMessageCount(id);
        if (!isDeletingSelectedSession) {
            await refreshSessions();
            return;
        }
        options.resetSessionPreviewState();
        if (nextSameCharacterSession?.id) {
            state.selectedSessionId.value = nextSameCharacterSession.id;
            await persistSelectedSessionId(nextSameCharacterSession.id);
            await refreshSessions();
            options.activeView.value = 'chat';
            options.chatFocus.value = 'chat';
            options.placeChatAtBottomForNewContext();
            return;
        }
        state.selectedSessionId.value = '';
        options.selectedSessionCharacterError.value = '';
        clearLoadedSessionMessageWindow();
        await persistSelectedSessionId('');
        await refreshSessions();
        if (deletedCharacterKey) {
            options.selectedCharacterPreviewKey.value = deletedCharacterKey;
            void options.syncCharacterWorldbookState(deletedCharacterKey);
            options.openCharacterSettingsWorkspace();
            return;
        }
        options.activeView.value = 'home';
    }

    function suppressNextChatWindowLimitReload() {
        suppressNextChatWindowLimitReloadPending = true;
    }

    function handleChatMessageWindowLimitChanged() {
        if (suppressNextChatWindowLimitReloadPending) {
            suppressNextChatWindowLimitReloadPending = false;
            return;
        }
        if (state.selectedSessionId.value) {
            void loadSelectedSessionMessageWindow();
        }
    }

    return {
        ...state,
        chatMessageWindow,
        clearLoadedSessionMessageWindow,
        clearSelectedSession,
        handleChatMessageWindowLimitChanged,
        loadSelectedSessionMessageWindow,
        persistSelectedSessionId,
        pruneLoadedSessionMessagesFromOrder,
        refreshSessionMessageCountsForSessions,
        refreshSessions,
        removeSession,
        selectSession,
        sessionFloorCount,
        sessionFloorLabel,
        setSelectedSessionId,
        suppressNextChatWindowLimitReload,
        touchSessionLocally,
        updateSessionRecord,
        upsertLoadedSessionMessage,
    };
}
