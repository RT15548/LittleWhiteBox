import { ref, type Ref } from 'vue';
import type { XbTavernMessage } from '../../../shared/message-assembler';
import {
    appendTavernAssistantChatMessages,
    type TavernAppendAssistantChatMessageInput,
    type TavernAssistantChatMessageRecord,
} from '../../../shared/session-db';
import type {
    TavernManagerProtocolEvent,
    TavernManagerStreamSnapshot,
} from '../../runtime/manager';

export interface TavernAssistantChatLiveDraft {
    sessionId: string;
    content: string;
    thoughts: Array<{ label?: string; text?: string }>;
    revision: number;
}

export interface TavernAssistantChatLiveToolCall {
    id: string;
    name: string;
    status: 'running' | 'resolved' | 'error';
    summary: string;
}

export interface TavernAssistantChatLiveToolRound {
    sessionId: string;
    key: string;
    preface: string;
    calls: TavernAssistantChatLiveToolCall[];
}

export interface TavernAssistantChatProtocolResultPatch {
    provider: string;
    model: string;
    finishReason: string;
    error: boolean;
}

export interface TavernAssistantChatLiveControllerOptions {
    appendMessages?: (
        sessionId: string,
        messages: TavernAppendAssistantChatMessageInput[],
    ) => Promise<TavernAssistantChatMessageRecord[]>;
    normalizeThoughts: (value: unknown) => Array<{ label?: string; text?: string }>;
    onMessagesPersisted?: (sessionId: string, messages: TavernAssistantChatMessageRecord[]) => void;
    minFlushIntervalMs?: number;
}

export interface TavernAssistantChatLiveRun {
    sessionId: string;
    onProtocolEvent: (event: TavernManagerProtocolEvent) => void;
    onStreamProgress: (snapshot: TavernManagerStreamSnapshot) => void;
    persistResult: (
        messages: XbTavernMessage[],
        fallbackText: string,
        patch: TavernAssistantChatProtocolResultPatch,
    ) => Promise<TavernAssistantChatMessageRecord[]>;
    flushStreamNow: () => void;
    waitForProtocolPersistence: () => Promise<void>;
    clear: () => void;
}

interface PendingProtocolRound {
    key: string;
    messages: XbTavernMessage[];
    expectedToolResults: number;
}

function normalizeProtocolToolCalls(message: XbTavernMessage): Array<{ id?: string; name?: string; arguments?: string }> {
    if (Array.isArray(message.toolCalls) && message.toolCalls.length) {
        return message.toolCalls.map((toolCall) => ({
            id: typeof toolCall?.id === 'string' ? toolCall.id : '',
            name: typeof toolCall?.name === 'string' ? toolCall.name : '',
            arguments: typeof toolCall?.arguments === 'string' ? toolCall.arguments : '{}',
        }));
    }
    if (!Array.isArray(message.tool_calls)) {return [];}
    return message.tool_calls.map((toolCall) => ({
        id: typeof toolCall?.id === 'string' ? toolCall.id : '',
        name: typeof toolCall?.function?.name === 'string' ? toolCall.function.name : '',
        arguments: typeof toolCall?.function?.arguments === 'string' ? toolCall.function.arguments : '{}',
    }));
}

function buildProtocolMessageInput(
    message: XbTavernMessage,
    patch: TavernAssistantChatProtocolResultPatch & {
        contentFallback?: string;
        finalAssistant?: boolean;
    },
): TavernAppendAssistantChatMessageInput {
    const hasToolCalls = (Array.isArray(message.toolCalls) && message.toolCalls.length)
        || (Array.isArray(message.tool_calls) && message.tool_calls.length);
    const isFinalAssistant = message.role === 'assistant' && !hasToolCalls && patch.finalAssistant === true;
    return {
        role: message.role,
        content: isFinalAssistant
            ? (String(message.content || '').trim() || String(patch.contentFallback || ''))
            : String(message.content || ''),
        name: message.name,
        thoughts: message.thoughts,
        providerPayload: message.providerPayload,
        toolCalls: message.role === 'assistant' ? normalizeProtocolToolCalls(message) : undefined,
        toolCallId: message.toolCallId || message.tool_call_id,
        toolName: message.toolName,
        toolDisplay: message.toolDisplay,
        provider: message.role === 'assistant' ? patch.provider : undefined,
        model: message.role === 'assistant' ? patch.model : undefined,
        finishReason: isFinalAssistant ? patch.finishReason : undefined,
        error: message.role === 'tool' ? message.error === true : isFinalAssistant ? patch.error : false,
    };
}

function buildFinalProtocolInputs(
    messages: XbTavernMessage[],
    fallbackText: string,
    patch: TavernAssistantChatProtocolResultPatch,
    skip = 0,
): TavernAppendAssistantChatMessageInput[] {
    const protocolMessages = (Array.isArray(messages) ? messages : []).filter((message) => (
        message && ['assistant', 'tool'].includes(message.role)
    )).slice(Math.max(0, Number(skip) || 0));
    const finalMessages: XbTavernMessage[] = protocolMessages.length
        ? protocolMessages
        : [{ role: 'assistant', content: fallbackText }];
    const finalAssistantIndex = [...finalMessages]
        .map((message, index) => ({ message, index }))
        .reverse()
        .find(({ message }) => {
            const hasToolCalls = (Array.isArray(message.toolCalls) && message.toolCalls.length)
                || (Array.isArray(message.tool_calls) && message.tool_calls.length);
            return message.role === 'assistant' && !hasToolCalls;
        })?.index ?? -1;
    if (finalAssistantIndex < 0) {
        finalMessages.push({ role: 'assistant', content: fallbackText });
    } else if (!String(finalMessages[finalAssistantIndex]?.content || '').trim()) {
        finalMessages[finalAssistantIndex] = {
            ...finalMessages[finalAssistantIndex],
            content: fallbackText,
        };
    }
    return finalMessages.map((message, index) => {
        const hasToolCalls = (Array.isArray(message.toolCalls) && message.toolCalls.length)
            || (Array.isArray(message.tool_calls) && message.tool_calls.length);
        const isFinalAssistant = message.role === 'assistant' && !hasToolCalls && index === finalMessages.length - 1;
        return buildProtocolMessageInput(message, {
            ...patch,
            contentFallback: isFinalAssistant ? fallbackText : '',
            finalAssistant: isFinalAssistant,
        });
    });
}

function requestFrame(callback: () => void): number {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
        callback();
        return 0;
    }
    return window.requestAnimationFrame(callback);
}

function cancelFrame(frame: number) {
    if (!frame || typeof window === 'undefined' || typeof window.cancelAnimationFrame !== 'function') {return;}
    window.cancelAnimationFrame(frame);
}

export function useTavernAssistantChatLiveController(options: TavernAssistantChatLiveControllerOptions) {
    const assistantDraft = ref<TavernAssistantChatLiveDraft | null>(null);
    const toolRound = ref<TavernAssistantChatLiveToolRound | null>(null);
    const appendMessages = options.appendMessages || appendTavernAssistantChatMessages;
    const minFlushIntervalMs = options.minFlushIntervalMs === undefined
        ? 80
        : Math.max(0, Number(options.minFlushIntervalMs) || 0);
    let runSerial = 0;
    let activeRunId = '';
    let activeRunSessionId = '';
    let activeRunCancelStream: (() => void) | null = null;

    function notifyMessagesPersisted(sessionId: string, messages: TavernAssistantChatMessageRecord[]) {
        try {
            options.onMessagesPersisted?.(sessionId, messages);
        } catch (error) {
            console.warn('[小白酒馆] 助手消息已保存，但实时界面同步失败', error);
        }
    }

    function clearVisibleState(runId = '', sessionId = '') {
        if (runId && activeRunId !== runId) {return;}
        const targetsActiveRun = !sessionId || activeRunSessionId === sessionId;
        if (targetsActiveRun && activeRunCancelStream) {
            activeRunCancelStream();
            activeRunCancelStream = null;
        }
        if (!sessionId || assistantDraft.value?.sessionId === sessionId) {
            assistantDraft.value = null;
        }
        if (!sessionId || toolRound.value?.sessionId === sessionId) {
            toolRound.value = null;
        }
        if (targetsActiveRun && (!runId || activeRunId === runId)) {
            activeRunId = '';
            activeRunSessionId = '';
        }
    }

    function startRun(sessionId: string): TavernAssistantChatLiveRun {
        const id = String(sessionId || '').trim();
        if (!id) {throw new Error('assistant_chat_session_required');}
        const runId = `assistant-chat:${id}:${Date.now()}:${runSerial + 1}`;
        runSerial += 1;
        activeRunCancelStream?.();
        activeRunId = runId;
        activeRunSessionId = id;
        assistantDraft.value = {
            sessionId: id,
            content: '正在思考...',
            thoughts: [],
            revision: 1,
        };
        toolRound.value = null;

        let streamFlushTimer: number | null = null;
        let streamFlushFrame = 0;
        let pendingStreamPatch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughts'>> | null = null;
        let lastStreamFlushAt = 0;
        let protocolPersistQueue = Promise.resolve();
        let protocolPersistFailed = false;
        let persistedProtocolMessages = 0;
        let pendingProtocolRound: PendingProtocolRound | null = null;
        let roundSerial = 0;

        function isActive() {
            return activeRunId === runId;
        }

        function cancelStreamFlush() {
            if (streamFlushTimer !== null && typeof window !== 'undefined') {
                window.clearTimeout(streamFlushTimer);
            }
            streamFlushTimer = null;
            cancelFrame(streamFlushFrame);
            streamFlushFrame = 0;
            pendingStreamPatch = null;
        }
        activeRunCancelStream = cancelStreamFlush;

        function commitStreamPatch(patch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughts'>>) {
            if (!isActive()) {return;}
            const previous = assistantDraft.value?.sessionId === id
                ? assistantDraft.value
                : { sessionId: id, content: '正在思考...', thoughts: [], revision: 0 };
            assistantDraft.value = {
                ...previous,
                ...(typeof patch.content === 'string' ? { content: patch.content } : {}),
                ...(Array.isArray(patch.thoughts) ? { thoughts: patch.thoughts } : {}),
                revision: previous.revision + 1,
            };
        }

        function flushStreamNow() {
            if (streamFlushTimer !== null && typeof window !== 'undefined') {
                window.clearTimeout(streamFlushTimer);
            }
            streamFlushTimer = null;
            cancelFrame(streamFlushFrame);
            streamFlushFrame = 0;
            const patch = pendingStreamPatch;
            pendingStreamPatch = null;
            if (!patch) {return;}
            lastStreamFlushAt = Date.now();
            commitStreamPatch(patch);
        }

        function scheduleStreamPatch(patch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughts'>>) {
            pendingStreamPatch = { ...(pendingStreamPatch || {}), ...patch };
            if (streamFlushTimer !== null || streamFlushFrame) {return;}
            const delay = Math.max(0, minFlushIntervalMs - (Date.now() - lastStreamFlushAt));
            const scheduleFrame = () => {
                streamFlushTimer = null;
                streamFlushFrame = requestFrame(() => {
                    streamFlushFrame = 0;
                    flushStreamNow();
                });
            };
            if (delay && typeof window !== 'undefined') {
                streamFlushTimer = window.setTimeout(scheduleFrame, delay);
                return;
            }
            scheduleFrame();
        }

        function onStreamProgress(snapshot: TavernManagerStreamSnapshot) {
            const patch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughts'>> = {};
            const currentContent = typeof pendingStreamPatch?.content === 'string'
                ? pendingStreamPatch.content
                : assistantDraft.value?.content || '';
            if (typeof snapshot.text === 'string') {
                patch.content = snapshot.text.trim()
                    ? snapshot.text
                    : Array.isArray(snapshot.toolCalls) && snapshot.toolCalls.length
                        ? '正在准备工具调用...'
                        : '正在思考...';
            } else if (
                Array.isArray(snapshot.toolCalls)
                && snapshot.toolCalls.length
                && (!currentContent || currentContent === '正在思考...')
            ) {
                patch.content = '正在准备工具调用...';
            }
            if (Array.isArray(snapshot.thoughts)) {
                patch.thoughts = options.normalizeThoughts(snapshot.thoughts);
            }
            if (!Object.keys(patch).length) {return;}
            scheduleStreamPatch(patch);
        }

        function updateLiveToolResult(event: Extract<TavernManagerProtocolEvent, { type: 'tool_result' }>) {
            const liveRound = toolRound.value;
            if (!isActive() || !pendingProtocolRound || !liveRound || liveRound.key !== pendingProtocolRound.key) {return;}
            const toolCallId = String(event.message.toolCallId || event.message.tool_call_id || '');
            toolRound.value = {
                ...liveRound,
                calls: liveRound.calls.map((call) => call.id !== toolCallId ? call : {
                    ...call,
                    status: event.message.error ? 'error' : 'resolved',
                    summary: String(event.message.toolDisplay || (event.message.error ? '工具执行失败。' : '工具已返回。')).trim(),
                }),
            };
        }

        function queueCompletedRound(round: PendingProtocolRound) {
            const completedMessages = [...round.messages];
            protocolPersistQueue = protocolPersistQueue.then(async () => {
                if (protocolPersistFailed) {return;}
                try {
                    const inputs = completedMessages.map((message) => buildProtocolMessageInput(message, {
                        provider: '',
                        model: '',
                        finishReason: '',
                        error: false,
                    }));
                    const persisted = await appendMessages(id, inputs);
                    persistedProtocolMessages += inputs.length;
                    notifyMessagesPersisted(id, persisted);
                    if (isActive() && toolRound.value?.key === round.key) {
                        toolRound.value = null;
                    }
                } catch (error) {
                    protocolPersistFailed = true;
                    console.warn('[小白酒馆] 助手工具轮次实时保存失败', error);
                }
            });
        }

        function onProtocolEvent(event: TavernManagerProtocolEvent) {
            if (event.type === 'clear_stream_draft') {
                cancelStreamFlush();
                if (isActive() && assistantDraft.value?.sessionId === id) {
                    assistantDraft.value = null;
                }
                return;
            }
            if (event.type === 'final_assistant') {
                cancelStreamFlush();
                commitStreamPatch({
                    content: String(event.message.content || '').trim() || '没有返回内容。',
                    thoughts: Array.isArray(event.message.thoughts) ? options.normalizeThoughts(event.message.thoughts) : [],
                });
                return;
            }
            if (event.type === 'assistant_tool_round') {
                roundSerial += 1;
                const key = `${runId}:tool-round:${roundSerial}`;
                const calls = normalizeProtocolToolCalls(event.message).map((call, index) => ({
                    id: String(call.id || `tool-${index + 1}`),
                    name: String(call.name || '工具'),
                    status: 'running' as const,
                    summary: '等待返回。',
                }));
                pendingProtocolRound = {
                    key,
                    messages: [event.message],
                    expectedToolResults: calls.length,
                };
                if (isActive()) {
                    toolRound.value = {
                        sessionId: id,
                        key,
                        preface: String(event.message.content || '').trim(),
                        calls,
                    };
                }
                return;
            }
            if (!pendingProtocolRound) {return;}
            updateLiveToolResult(event);
            pendingProtocolRound.messages.push(event.message);
            const actualToolResults = pendingProtocolRound.messages.filter((message) => message.role === 'tool').length;
            if (!pendingProtocolRound.expectedToolResults || actualToolResults < pendingProtocolRound.expectedToolResults) {return;}
            const completedRound = pendingProtocolRound;
            pendingProtocolRound = null;
            queueCompletedRound(completedRound);
        }

        async function waitForProtocolPersistence() {
            await protocolPersistQueue;
        }

        async function persistResult(
            messages: XbTavernMessage[],
            fallbackText: string,
            patch: TavernAssistantChatProtocolResultPatch,
        ) {
            await waitForProtocolPersistence();
            const inputs = buildFinalProtocolInputs(messages, fallbackText, patch, persistedProtocolMessages);
            const persisted = await appendMessages(id, inputs);
            notifyMessagesPersisted(id, persisted);
            return persisted;
        }

        function clear() {
            cancelStreamFlush();
            clearVisibleState(runId, id);
        }

        return {
            sessionId: id,
            onProtocolEvent,
            onStreamProgress,
            persistResult,
            flushStreamNow,
            waitForProtocolPersistence,
            clear,
        };
    }

    function clearSession(sessionId = '') {
        clearVisibleState('', String(sessionId || '').trim());
    }

    function cleanup() {
        clearVisibleState();
    }

    return {
        assistantDraft: assistantDraft as Ref<TavernAssistantChatLiveDraft | null>,
        toolRound: toolRound as Ref<TavernAssistantChatLiveToolRound | null>,
        startRun,
        clearSession,
        cleanup,
    };
}
