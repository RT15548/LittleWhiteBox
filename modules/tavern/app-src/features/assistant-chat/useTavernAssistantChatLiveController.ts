import { shallowRef, type ShallowRef } from 'vue';
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
    thoughtCount: number;
    revision: number;
}

export interface TavernAssistantChatLiveToolSummary {
    displayKey: string;
    protocolId: string;
    name: string;
    status: 'running' | 'resolved' | 'error';
    path: string;
    elapsedMs: number;
    summary: string;
}

export interface TavernAssistantChatLiveToolRound {
    sessionId: string;
    key: string;
    preface: string;
    calls: TavernAssistantChatLiveToolSummary[];
}

export const TAVERN_ASSISTANT_CHAT_LIVE_TOOL_LIMIT = 8;

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
    clear: () => void;
}

interface PendingProtocolRound {
    key: string;
    expectedToolResults: number;
    actualToolResults: number;
    tools: PendingProtocolTool[];
}

interface PendingProtocolTool {
    displayKey: string;
    protocolId: string;
    name: string;
    path: string;
    startedAt: number;
    resolved: boolean;
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
): TavernAppendAssistantChatMessageInput[] {
    const protocolMessages = (Array.isArray(messages) ? messages : []).filter((message) => (
        message && ['assistant', 'tool'].includes(message.role)
    ));
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

function compactText(value: unknown, limit: number): string {
    const text = typeof value === 'string' || typeof value === 'number'
        ? String(value).replace(/\s+/g, ' ').trim()
        : '';
    if (!text) {return '';}
    return text.length > limit ? `${text.slice(0, Math.max(1, limit - 1))}…` : text;
}

function thoughtCount(value: unknown): number {
    return Array.isArray(value) ? value.length : 0;
}

function parseSmallJsonRecord(value: unknown): Record<string, unknown> | null {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    if (typeof value !== 'string' || !value.trim() || value.length > 16_384) {return null;}
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as Record<string, unknown>
            : null;
    } catch {
        return null;
    }
}

function extractJsonStringField(value: string, keys: string[]): string {
    const prefix = value.slice(0, 16_384);
    for (const key of keys) {
        const match = prefix.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'i'));
        if (!match?.[1]) {continue;}
        try {
            return String(JSON.parse(`"${match[1]}"`));
        } catch {
            return match[1];
        }
    }
    return '';
}

function extractToolPath(value: unknown): string {
    const record = parseSmallJsonRecord(value);
    const directPath = compactText(
        record?.path
        || record?.filePath
        || record?.targetPath
        || record?.sourcePath
        || record?.docPath,
        240,
    );
    if (directPath) {return directPath;}
    if (record) {
        const docType = compactText(record.docType, 80);
        const docId = compactText(record.docId, 140);
        if (docType || docId) {return [docType, docId].filter(Boolean).join('/');}
        const taskId = compactText(record.taskId, 220);
        if (taskId) {return taskId;}
    }
    if (typeof value !== 'string') {return '';}
    return compactText(extractJsonStringField(value, [
        'path',
        'filePath',
        'targetPath',
        'sourcePath',
        'docPath',
        'taskId',
    ]), 240);
}

function normalizeToolDisplay(value: unknown): {
    path: string;
    elapsedMs: number;
    summary: string;
    status: 'running' | 'resolved' | 'error' | '';
} {
    const record = parseSmallJsonRecord(value);
    const rawStatus = compactText(record?.status, 32).toLowerCase();
    const startedAt = Math.max(0, Number(record?.startedAt) || 0);
    const finishedAt = Math.max(0, Number(record?.finishedAt) || 0);
    const elapsedMs = Math.max(0, Number(record?.elapsedMs) || (
        startedAt && finishedAt ? finishedAt - startedAt : 0
    ));
    return {
        path: extractToolPath(record),
        elapsedMs,
        summary: compactText(
            record?.summary || record?.message || record?.error || (typeof value === 'string' ? value : ''),
            360,
        ),
        status: rawStatus === 'running'
            ? 'running'
            : rawStatus === 'error' || rawStatus === 'failed'
                ? 'error'
                : rawStatus === 'resolved' || rawStatus === 'completed'
                    ? 'resolved'
                    : '',
    };
}

function projectToolResult(
    message: XbTavernMessage,
    pendingTool: PendingProtocolTool,
): TavernAssistantChatLiveToolSummary {
    const display = normalizeToolDisplay(message.toolDisplay);
    const resultRecord = parseSmallJsonRecord(message.content);
    const resultError = compactText(resultRecord?.error, 360);
    const resultSummary = compactText(resultRecord?.summary, 360);
    const status = message.error === true || display.status === 'error' || resultRecord?.ok === false
        ? 'error'
        : 'resolved';
    return {
        displayKey: pendingTool.displayKey,
        protocolId: pendingTool.protocolId,
        name: compactText(message.toolName, 120) || pendingTool.name,
        status,
        path: display.path || extractToolPath(resultRecord) || pendingTool.path,
        elapsedMs: display.elapsedMs || Math.max(0, Date.now() - pendingTool.startedAt),
        summary: display.summary
            || resultSummary
            || resultError
            || (status === 'error' ? '工具执行失败。' : '工具已返回。'),
    };
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
    const assistantDraft = shallowRef<TavernAssistantChatLiveDraft | null>(null);
    const toolRound = shallowRef<TavernAssistantChatLiveToolRound | null>(null);
    const appendMessages = options.appendMessages || appendTavernAssistantChatMessages;
    const minFlushIntervalMs = options.minFlushIntervalMs === undefined
        ? 80
        : Math.max(0, Number(options.minFlushIntervalMs) || 0);
    let runSerial = 0;
    let activeRunId = '';
    let activeRunSessionId = '';
    let activeRunCancelStream: (() => void) | null = null;

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
            thoughtCount: 0,
            revision: 1,
        };
        toolRound.value = null;

        let streamFlushTimer: number | null = null;
        let streamFlushFrame = 0;
        let pendingStreamPatch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughtCount'>> | null = null;
        let lastStreamFlushAt = 0;
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

        function commitStreamPatch(patch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughtCount'>>) {
            if (!isActive()) {return;}
            const previous = assistantDraft.value?.sessionId === id
                ? assistantDraft.value
                : { sessionId: id, content: '正在思考...', thoughtCount: 0, revision: 0 };
            assistantDraft.value = {
                ...previous,
                ...(typeof patch.content === 'string' ? { content: patch.content } : {}),
                ...(typeof patch.thoughtCount === 'number' ? { thoughtCount: patch.thoughtCount } : {}),
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

        function scheduleStreamPatch(patch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughtCount'>>) {
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
            const patch: Partial<Pick<TavernAssistantChatLiveDraft, 'content' | 'thoughtCount'>> = {};
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
                patch.thoughtCount = thoughtCount(snapshot.thoughts);
            }
            if (!Object.keys(patch).length) {return;}
            scheduleStreamPatch(patch);
        }

        function updateLiveToolResult(event: Extract<TavernManagerProtocolEvent, { type: 'tool_result' }>) {
            const liveRound = toolRound.value;
            if (!isActive() || !pendingProtocolRound || !liveRound || liveRound.key !== pendingProtocolRound.key) {return;}
            const toolCallId = String(event.message.toolCallId || event.message.tool_call_id || '');
            const unresolvedTools = pendingProtocolRound.tools.filter((tool) => !tool.resolved);
            const pendingTool = (toolCallId
                ? unresolvedTools.find((tool) => tool.protocolId === toolCallId)
                : unresolvedTools[0])
                || (unresolvedTools.length === 1 ? unresolvedTools[0] : null);
            if (!pendingTool) {return;}
            const summary = projectToolResult(event.message, pendingTool);
            toolRound.value = {
                ...liveRound,
                calls: liveRound.calls.map((call) => call.displayKey !== pendingTool.displayKey ? call : {
                    ...call,
                    ...summary,
                }),
            };
            pendingTool.resolved = true;
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
                if (isActive()) {toolRound.value = null;}
                commitStreamPatch({
                    content: String(event.message.content || '').trim() || '没有返回内容。',
                    thoughtCount: thoughtCount(event.message.thoughts),
                });
                return;
            }
            if (event.type === 'assistant_tool_round') {
                roundSerial += 1;
                const key = `${runId}:tool-round:${roundSerial}`;
                const calls = normalizeProtocolToolCalls(event.message).map((call, index) => ({
                    displayKey: `${key}:call:${index + 1}`,
                    protocolId: String(call.id || ''),
                    name: compactText(call.name, 120) || '工具',
                    status: 'running' as const,
                    path: extractToolPath(call.arguments),
                    elapsedMs: 0,
                    summary: '等待返回。',
                }));
                pendingProtocolRound = {
                    key,
                    expectedToolResults: calls.length,
                    actualToolResults: 0,
                    tools: calls.map((call) => ({
                        displayKey: call.displayKey,
                        protocolId: call.protocolId,
                        name: call.name,
                        path: call.path,
                        startedAt: Date.now(),
                        resolved: false,
                    })),
                };
                if (isActive()) {
                    const previousCalls = toolRound.value?.sessionId === id
                        ? toolRound.value.calls
                        : [];
                    toolRound.value = {
                        sessionId: id,
                        key,
                        preface: compactText(event.message.content, 600),
                        calls: [...previousCalls, ...calls].slice(-TAVERN_ASSISTANT_CHAT_LIVE_TOOL_LIMIT),
                    };
                }
                return;
            }
            if (!pendingProtocolRound) {return;}
            updateLiveToolResult(event);
            pendingProtocolRound.actualToolResults += 1;
            if (
                !pendingProtocolRound.expectedToolResults
                || pendingProtocolRound.actualToolResults < pendingProtocolRound.expectedToolResults
            ) {return;}
            pendingProtocolRound = null;
        }

        async function persistResult(
            messages: XbTavernMessage[],
            fallbackText: string,
            patch: TavernAssistantChatProtocolResultPatch,
        ) {
            const inputs = buildFinalProtocolInputs(messages, fallbackText, patch);
            const persisted = await appendMessages(id, inputs);
            return persisted;
        }

        function clear() {
            cancelStreamFlush();
            pendingProtocolRound = null;
            clearVisibleState(runId, id);
        }

        return {
            sessionId: id,
            onProtocolEvent,
            onStreamProgress,
            persistResult,
            flushStreamNow,
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
        assistantDraft: assistantDraft as ShallowRef<TavernAssistantChatLiveDraft | null>,
        toolRound: toolRound as ShallowRef<TavernAssistantChatLiveToolRound | null>,
        startRun,
        clearSession,
        cleanup,
    };
}
