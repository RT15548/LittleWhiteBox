import { nextTick, ref, type Ref } from 'vue';
import type { TavernAssistantPreset } from '../../../shared/assistant-presets';
import type { TavernApplyRegex } from '../../../shared/regex';
import type { TavernActionCheckRuntimeEvent } from '../../../shared/runtime-events';
import {
    normalizeTavernSessionState,
    type TavernMessageRecord,
    type TavernSessionRecord,
} from '../../../shared/session-db';
import type { TavernSubstituteParamsItem, TavernSubstituteParamsResult } from '../../../shared/substitute-params';
import type {
    TavernChatPromptPresetBundle,
    XbTavernContext,
    XbTavernNativeWorldInfoRuntime,
} from '../../../shared/message-assembler';
import {
    runXbTavernTurn,
    type TavernRunStatusLabel,
    type TavernBuildNativeChatPromptRuntime,
    type TavernRunStreamSnapshot,
} from '../../runtime/run-once';

export interface TavernChatRunOptions {
    messageText?: string;
    rerollLatestAssistant?: boolean;
    rerollRuntimeEvents?: boolean;
}

export interface TavernChatRunState {
    currentUserMessage: Ref<string>;
    isCancellingRun: Ref<boolean>;
    isRunning: Ref<boolean>;
    runtimeActionCheckEvents: Ref<TavernActionCheckRuntimeEvent[]>;
    runtimeError: Ref<string>;
    runtimeModel: Ref<string>;
    runtimePendingUserMessage: Ref<string>;
    runtimeProvider: Ref<string>;
    runtimeStatusElapsedSeconds: Ref<number>;
    runtimeStatusLabel: Ref<TavernRunStatusLabel | ''>;
    runtimeStatusStartedAt: Ref<number>;
    runtimeText: Ref<string>;
    runtimeThoughts: Ref<Array<{ label?: string; text?: string }>>;
    runtimeAssistantMessageKey: Ref<string>;
    runtimeUserMessageVisible: Ref<boolean>;
}

export interface TavernChatRunControllerOptions {
    state: TavernChatRunState;
    activeAssistantPreset: Ref<TavernAssistantPreset>;
    activeSession: Ref<TavernSessionRecord | null | undefined>;
    agentConfig: Ref<Record<string, unknown>>;
    chatComposeTextareaRef: Ref<HTMLTextAreaElement | null>;
    diagnostics: Ref<Record<string, unknown>>;
    historyMode: Ref<'raw' | 'squash'>;
    selectedSessionCharacterError: Ref<string>;
    selectedSessionId: Ref<string>;
    applyRegex: TavernApplyRegex;
    applySubstituteParams: (items: TavernSubstituteParamsItem[]) => Promise<TavernSubstituteParamsResult>;
    buildNativeChatPrompt: TavernBuildNativeChatPromptRuntime;
    clearRuntimeDisplayRegexRequests: () => void;
    compactLoadedSessionMessageWindow: (reservedTailSlots?: number) => number;
    createSessionFromContext: () => Promise<unknown>;
    describeError: (error: unknown) => string;
    getNativeWorldInfoRuntime: (input: {
        context: XbTavernContext;
        currentUserMessage: string;
        trigger?: string;
        timedState?: unknown;
    }) => Promise<XbTavernNativeWorldInfoRuntime>;
    loadSelectedSessionMessageWindow: (options?: { sessionId?: string }) => Promise<unknown>;
    persistSelectedSessionId: (sessionId: string) => Promise<unknown>;
    prepareAssistantMessageDisplay: (message: TavernMessageRecord) => Promise<void>;
    pruneLoadedSessionMessagesFromOrder: (sessionId?: string, fromOrder?: number) => number;
    refreshManagerRecords: (sessionId?: string) => Promise<unknown>;
    refreshRuntimeChatPresetFromHost: () => Promise<TavernChatPromptPresetBundle>;
    refreshSessionRecord: (sessionId: string) => Promise<unknown>;
    preserveDetachedChatScroll: <T>(mutation: () => T) => T;
    requestUserMessageBottom: () => void;
    resetChatMessageWindowForUserTurn: (options?: { rerollLatestAssistant?: boolean }) => Promise<void>;
    resetTextareaHeight: (element: HTMLTextAreaElement | null) => void;
    resolveRuntimeContextForSession: (sessionId?: string) => Promise<XbTavernContext>;
    resolveSlashCommandMessageText: (messageText: string, options?: { rerollLatestAssistant?: boolean }) => Promise<string>;
    setSelectedSessionId: (sessionId: string) => void;
    showToast: (message: string, options?: { tone?: 'info' | 'warning' | 'danger'; durationMs?: number }) => void;
    thoughtBlocks: (messageOrThoughts: unknown) => Array<{ label?: string; text?: string }>;
    touchSessionLocally: (sessionId: string, updatedAt?: number) => void;
    updateChatScrollButtons: () => void;
    upsertLoadedSessionMessage: (message: TavernMessageRecord) => void;
    cancelDrawJobsForMessageRange: (sessionId?: string, fromOrder?: number) => void;
}

export function createTavernChatRunState(): TavernChatRunState {
    return {
        currentUserMessage: ref(''),
        isCancellingRun: ref(false),
        isRunning: ref(false),
        runtimeActionCheckEvents: ref<TavernActionCheckRuntimeEvent[]>([]),
        runtimeError: ref(''),
        runtimeModel: ref(''),
        runtimePendingUserMessage: ref(''),
        runtimeProvider: ref(''),
        runtimeStatusElapsedSeconds: ref(0),
        runtimeStatusLabel: ref<TavernRunStatusLabel | ''>(''),
        runtimeStatusStartedAt: ref(0),
        runtimeText: ref(''),
        runtimeThoughts: ref<Array<{ label?: string; text?: string }>>([]),
        runtimeAssistantMessageKey: ref(''),
        runtimeUserMessageVisible: ref(false),
    };
}

export function useTavernChatRunController(options: TavernChatRunControllerOptions) {
    const state = options.state;
    const activeRunController = ref<AbortController | null>(null);
    let runtimeStreamFrame = 0;
    let runtimeStatusTimer = 0;
    let pendingRuntimeStreamSnapshot: TavernRunStreamSnapshot | null = null;

    function clearRuntimeStatusTimer() {
        if (!runtimeStatusTimer) {return;}
        if (typeof window !== 'undefined' && typeof window.clearInterval === 'function') {
            window.clearInterval(runtimeStatusTimer);
        }
        runtimeStatusTimer = 0;
    }

    function refreshRuntimeStatusElapsedSeconds() {
        const startedAt = Number(state.runtimeStatusStartedAt.value) || 0;
        state.runtimeStatusElapsedSeconds.value = startedAt
            ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
            : 0;
    }

    function startRuntimeStatusTimer() {
        if (runtimeStatusTimer) {return;}
        if (typeof window === 'undefined' || typeof window.setInterval !== 'function') {return;}
        runtimeStatusTimer = window.setInterval(() => {
            refreshRuntimeStatusElapsedSeconds();
        }, 1000);
    }

    function setRuntimeStatusLabel(label: TavernRunStatusLabel | '') {
        if (label && state.runtimeStatusLabel.value === label && state.runtimeStatusStartedAt.value) {
            refreshRuntimeStatusElapsedSeconds();
            startRuntimeStatusTimer();
            return;
        }
        state.runtimeStatusLabel.value = label;
        if (!label) {
            clearRuntimeStatusTimer();
            state.runtimeStatusStartedAt.value = 0;
            state.runtimeStatusElapsedSeconds.value = 0;
            return;
        }
        state.runtimeStatusStartedAt.value = Date.now();
        state.runtimeStatusElapsedSeconds.value = 0;
        startRuntimeStatusTimer();
    }

    function applyRuntimeStreamSnapshot(snapshot: TavernRunStreamSnapshot) {
        if (typeof snapshot.text === 'string') {state.runtimeText.value = snapshot.text;}
        if (Array.isArray(snapshot.thoughts)) {state.runtimeThoughts.value = options.thoughtBlocks(snapshot.thoughts);}
        if (Array.isArray(snapshot.liveActionCheckEvents)) {
            state.runtimeActionCheckEvents.value = snapshot.liveActionCheckEvents.map((event) => ({ ...event }));
        }
    }

    function cancelPendingRuntimeStreamFrame() {
        if (!runtimeStreamFrame) {return;}
        if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
            window.cancelAnimationFrame(runtimeStreamFrame);
        }
        runtimeStreamFrame = 0;
    }

    function flushRuntimeStreamSnapshotNow() {
        cancelPendingRuntimeStreamFrame();
        const snapshot = pendingRuntimeStreamSnapshot;
        pendingRuntimeStreamSnapshot = null;
        if (snapshot) {
            applyRuntimeStreamSnapshot(snapshot);
        }
    }

    function scheduleRuntimeStreamSnapshot(snapshot: TavernRunStreamSnapshot) {
        const next = pendingRuntimeStreamSnapshot ? { ...pendingRuntimeStreamSnapshot } : {};
        if (typeof snapshot.text === 'string') {next.text = snapshot.text;}
        if (Array.isArray(snapshot.thoughts)) {next.thoughts = snapshot.thoughts;}
        if (Array.isArray(snapshot.liveActionCheckEvents)) {
            next.liveActionCheckEvents = snapshot.liveActionCheckEvents;
        }
        pendingRuntimeStreamSnapshot = next;
        if (runtimeStreamFrame) {return;}
        if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
            flushRuntimeStreamSnapshotNow();
            return;
        }
        runtimeStreamFrame = window.requestAnimationFrame(() => {
            runtimeStreamFrame = 0;
            flushRuntimeStreamSnapshotNow();
        });
    }

    function clearRuntimeAssistantLiveState() {
        cancelPendingRuntimeStreamFrame();
        pendingRuntimeStreamSnapshot = null;
        options.clearRuntimeDisplayRegexRequests();
        state.runtimeText.value = '';
        state.runtimeThoughts.value = [];
        state.runtimeActionCheckEvents.value = [];
        state.runtimeAssistantMessageKey.value = '';
        setRuntimeStatusLabel('');
        state.runtimeUserMessageVisible.value = false;
        state.runtimePendingUserMessage.value = '';
    }

    function resetChatRunPreviewState() {
        state.currentUserMessage.value = '';
        state.runtimeError.value = '';
        state.runtimeProvider.value = '';
        state.runtimeModel.value = '';
        setRuntimeStatusLabel('');
        clearRuntimeAssistantLiveState();
    }

    function abortActiveRun() {
        activeRunController.value?.abort();
    }

    function cancelActiveRun() {
        if (!state.isRunning.value || !activeRunController.value) {return;}
        if (!state.isCancellingRun.value) {
            flushRuntimeStreamSnapshotNow();
            state.isCancellingRun.value = true;
            state.runtimeText.value = state.runtimeText.value || '正在停止...';
        }
        activeRunController.value.abort();
    }

    function handleChatSubmit() {
        void runOnce();
    }

    async function runOnce(runOptions: TavernChatRunOptions = {}) {
        if (state.isRunning.value) {
            cancelActiveRun();
            return;
        }
        const startingSessionId = String(options.selectedSessionId.value || '').trim();
        const isRerollRun = runOptions.rerollLatestAssistant === true;
        let messageText = String(runOptions.messageText ?? state.currentUserMessage.value ?? '').trim();
        if (isRerollRun && !startingSessionId) {
            state.runtimeError.value = '当前没有可重 roll 的会话。';
            options.showToast(state.runtimeError.value, { tone: 'info', durationMs: 2200 });
            return;
        }
        if (!isRerollRun && !messageText) {
            state.runtimeError.value = '先写一句话。';
            options.showToast('先写一句话。', { tone: 'info', durationMs: 1800 });
            return;
        }
        if (options.selectedSessionCharacterError.value) {
            state.runtimeError.value = options.selectedSessionCharacterError.value;
            options.showToast(options.selectedSessionCharacterError.value, { tone: 'warning', durationMs: 7000 });
            return;
        }
        if (!isRerollRun) {
            try {
                messageText = await options.resolveSlashCommandMessageText(messageText, runOptions);
            } catch (error) {
                const errorText = options.describeError(error);
                state.runtimeError.value = errorText;
                options.showToast(`命令执行失败：${errorText}`, { tone: 'warning', durationMs: 5000 });
                return;
            }
        }
        if (!isRerollRun && !messageText) {
            return;
        }
        if (String(options.selectedSessionId.value || '').trim() !== startingSessionId) {
            options.showToast('会话已切换，本次发送已取消。', { tone: 'info', durationMs: 2600 });
            return;
        }

        const controller = new AbortController();
        let assistantMessageSaved = false;
        let rerollPreviousAssistantOrder: number | null = null;
        activeRunController.value = controller;
        try {
            state.isRunning.value = true;
            state.isCancellingRun.value = false;
            state.runtimeError.value = '';
            cancelPendingRuntimeStreamFrame();
            pendingRuntimeStreamSnapshot = null;
            options.clearRuntimeDisplayRegexRequests();
            state.runtimeAssistantMessageKey.value = '';
            state.runtimeText.value = '';
            state.runtimeThoughts.value = [];
            state.runtimeActionCheckEvents.value = [];
            state.runtimeUserMessageVisible.value = false;
            state.runtimePendingUserMessage.value = '';
            state.runtimeProvider.value = '';
            state.runtimeModel.value = '';
            setRuntimeStatusLabel('同步状态');
            await options.resetChatMessageWindowForUserTurn({ rerollLatestAssistant: isRerollRun });
            options.compactLoadedSessionMessageWindow(isRerollRun ? 1 : 2);

            const shouldShowPendingUserMessage = !isRerollRun;
            if (shouldShowPendingUserMessage) {
                state.runtimePendingUserMessage.value = messageText;
                state.currentUserMessage.value = '';
                void nextTick(() => options.resetTextareaHeight(options.chatComposeTextareaRef.value));
                options.requestUserMessageBottom();
                options.updateChatScrollButtons();
            } else {
                state.runtimeUserMessageVisible.value = true;
                options.requestUserMessageBottom();
                options.updateChatScrollButtons();
            }

            if (controller.signal.aborted) {
                const pendingUserMessage = state.runtimePendingUserMessage.value;
                clearRuntimeAssistantLiveState();
                if (isRerollRun && options.selectedSessionId.value) {
                    await options.loadSelectedSessionMessageWindow({ sessionId: options.selectedSessionId.value });
                }
                if (pendingUserMessage && !state.currentUserMessage.value.trim()) {
                    state.currentUserMessage.value = pendingUserMessage;
                    void nextTick(() => options.resetTextareaHeight(options.chatComposeTextareaRef.value));
                }
                return;
            }
            if (!options.selectedSessionId.value) {
                await options.refreshRuntimeChatPresetFromHost();
                await options.createSessionFromContext();
            }
            const runtimeContext = await options.resolveRuntimeContextForSession(options.selectedSessionId.value);
            const runtimeNativeCharacterId = String(runtimeContext.character?.nativeCharacterId || '').trim();
            const runtimeApplyRegex: TavernApplyRegex = (items) => options.applyRegex(items, { nativeCharacterId: runtimeNativeCharacterId });
            if (controller.signal.aborted) {
                clearRuntimeAssistantLiveState();
                if (isRerollRun && options.selectedSessionId.value) {
                    await options.loadSelectedSessionMessageWindow({ sessionId: options.selectedSessionId.value });
                }
                return;
            }
            const runtimePreset = await options.refreshRuntimeChatPresetFromHost();
            if (controller.signal.aborted) {
                clearRuntimeAssistantLiveState();
                if (isRerollRun && options.selectedSessionId.value) {
                    await options.loadSelectedSessionMessageWindow({ sessionId: options.selectedSessionId.value });
                }
                return;
            }
            const result = await runXbTavernTurn({
                sessionId: options.selectedSessionId.value,
                agentConfig: options.agentConfig.value,
                contextSnapshot: runtimeContext,
                chatPreset: runtimePreset,
                assistantPreset: options.activeAssistantPreset.value,
                currentUserMessage: messageText,
                runtimeState: normalizeTavernSessionState(options.activeSession.value?.state || {}),
                diagnostics: options.diagnostics.value,
                historyMode: options.historyMode.value,
                signal: controller.signal,
                rerollLatestAssistant: isRerollRun,
                rerollRuntimeEvents: runOptions.rerollRuntimeEvents,
                runManager: true,
                applyRegex: runtimeApplyRegex,
                applySubstituteParams: options.applySubstituteParams,
                getNativeWorldInfoRuntime: options.getNativeWorldInfoRuntime,
                buildNativeChatPrompt: options.buildNativeChatPrompt,
                onStreamProgress: (snapshot) => {
                    scheduleRuntimeStreamSnapshot(snapshot);
                },
                onRuntimeStatus: (snapshot) => {
                    setRuntimeStatusLabel(snapshot.label);
                },
                onUserMessageSaved: async (sessionId, message) => {
                    options.setSelectedSessionId(sessionId);
                    state.runtimeAssistantMessageKey.value = `${message.sessionId}:${Number(message.order) + 1}`;
                    options.upsertLoadedSessionMessage(message);
                    options.touchSessionLocally(sessionId, message.createdAt);
                    state.runtimeUserMessageVisible.value = true;
                    state.runtimePendingUserMessage.value = '';
                    if (!state.currentUserMessage.value) {
                        void nextTick(() => options.resetTextareaHeight(options.chatComposeTextareaRef.value));
                    }
                    options.updateChatScrollButtons();
                    await options.persistSelectedSessionId(sessionId);
                    options.updateChatScrollButtons();
                },
                onLatestAssistantRerollPrepared: async (sessionId, message, previousAssistantMessage) => {
                    options.setSelectedSessionId(sessionId);
                    rerollPreviousAssistantOrder = previousAssistantMessage.order;
                    options.pruneLoadedSessionMessagesFromOrder(sessionId, previousAssistantMessage.order);
                    state.runtimeAssistantMessageKey.value = `${message.sessionId}:${Number(message.order) + 1}`;
                    state.runtimeUserMessageVisible.value = true;
                    state.runtimePendingUserMessage.value = '';
                    options.updateChatScrollButtons();
                },
                onAssistantMessageSaved: async (sessionId, message) => {
                    assistantMessageSaved = true;
                    options.setSelectedSessionId(sessionId);
                    if (rerollPreviousAssistantOrder !== null) {
                        options.cancelDrawJobsForMessageRange(sessionId, rerollPreviousAssistantOrder);
                    }
                    flushRuntimeStreamSnapshotNow();
                    await options.prepareAssistantMessageDisplay(message);
                    options.touchSessionLocally(sessionId, message.createdAt);
                    options.preserveDetachedChatScroll(() => {
                        options.upsertLoadedSessionMessage(message);
                        clearRuntimeAssistantLiveState();
                    });
                    options.updateChatScrollButtons();
                },
                onManagerRunSaved: async (sessionId) => {
                    await options.refreshManagerRecords(sessionId);
                },
            });
            options.setSelectedSessionId(result.sessionId);
            flushRuntimeStreamSnapshotNow();
            clearRuntimeAssistantLiveState();
            state.runtimeError.value = result.error || '';
            state.runtimeProvider.value = result.provider || '';
            state.runtimeModel.value = result.model || '';
            await options.refreshSessionRecord(result.sessionId);
            options.updateChatScrollButtons();
        } catch (error) {
            console.error('[小白酒馆] turn failed', error);
            const pendingUserMessage = state.runtimePendingUserMessage.value;
            clearRuntimeAssistantLiveState();
            if (isRerollRun && options.selectedSessionId.value) {
                try {
                    await options.loadSelectedSessionMessageWindow({ sessionId: options.selectedSessionId.value });
                } catch (reloadError) {
                    console.warn('[小白酒馆] Failed to restore reroll message window', reloadError);
                }
            }
            if (pendingUserMessage && !state.currentUserMessage.value.trim()) {
                state.currentUserMessage.value = pendingUserMessage;
                void nextTick(() => options.resetTextareaHeight(options.chatComposeTextareaRef.value));
            }
            const errorText = options.describeError(error || 'run_failed');
            state.runtimeError.value = errorText;
            if (!assistantMessageSaved) {
                options.showToast(errorText, { tone: 'warning', durationMs: 6000 });
            }
        } finally {
            if (activeRunController.value === controller) {
                activeRunController.value = null;
            }
            state.isCancellingRun.value = false;
            state.isRunning.value = false;
            void nextTick(() => {
                options.updateChatScrollButtons();
            });
        }
    }

    return {
        ...state,
        abortActiveRun,
        applyRuntimeStreamSnapshot,
        cancelActiveRun,
        clearRuntimeAssistantLiveState,
        flushRuntimeStreamSnapshotNow,
        handleChatSubmit,
        resetChatRunPreviewState,
        runOnce,
        scheduleRuntimeStreamSnapshot,
    };
}
