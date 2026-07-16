import type { XbTavernContext, XbTavernMessage } from '../../shared/message-assembler';
import type { TavernAssistantPreset } from '../../shared/assistant-presets';
import { rebuildTavernMemoryDerivedIndex } from '../../shared/memory-files';
import {
    listTavernAssistantChatMessages,
    type TavernAssistantChatMessageRecord,
} from '../../shared/session-db';
import {
    runSharedManagerToolLoop,
    type TavernManagerProtocolEvent,
    type TavernManagerStreamSnapshot,
    type XbTavernManagerOnceOptions,
    type XbTavernManagerOnceResult,
} from './manager.js';
import { buildAssistantChatMessages } from './assistant-chat-context.js';

export interface XbTavernAssistantChatInput {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    question: string;
    history?: TavernAssistantChatMessageRecord[];
    turn?: number;
    assistantPreset?: TavernAssistantPreset;
    contextSnapshot?: XbTavernContext;
    signal?: AbortSignal;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onStreamProgress?: (snapshot: TavernManagerStreamSnapshot) => void;
    onProtocolEvent?: (event: TavernManagerProtocolEvent) => void;
}

export interface XbTavernAssistantChatResult {
    ok: boolean;
    text: string;
    provider: string;
    model: string;
    changedFiles: string[];
    changedStates: string[];
    changedTasks: string[];
    protocolMessages: XbTavernMessage[];
    error?: string;
}

function assistantToolCalls(message: XbTavernMessage): Array<{ id: string; name: string }> {
    const direct = Array.isArray(message.toolCalls) ? message.toolCalls : [];
    const legacy = Array.isArray(message.tool_calls) ? message.tool_calls.map((toolCall) => ({
        id: toolCall?.id,
        name: toolCall?.function?.name,
    })) : [];
    return (direct.length ? direct : legacy).map((toolCall) => ({
        id: String(toolCall?.id || ''),
        name: String(toolCall?.name || ''),
    })).filter((toolCall) => toolCall.id || toolCall.name);
}

export function completeInterruptedAssistantProtocol(
    messages: XbTavernMessage[] = [],
    reason = 'assistant_chat_interrupted',
): XbTavernMessage[] {
    const completed: XbTavernMessage[] = [];
    for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index];
        completed.push(message);
        if (message.role !== 'assistant') {continue;}
        const toolCalls = assistantToolCalls(message);
        if (!toolCalls.length) {continue;}
        const returnedIds = new Set<string>();
        while (messages[index + 1]?.role === 'tool') {
            const toolMessage = messages[index + 1];
            completed.push(toolMessage);
            returnedIds.add(String(toolMessage.toolCallId || toolMessage.tool_call_id || ''));
            index += 1;
        }
        toolCalls.forEach((toolCall) => {
            if (toolCall.id && returnedIds.has(toolCall.id)) {return;}
            const payload = {
                ok: false,
                changed: false,
                error: reason,
                summary: '本次助手运行已中断，工具未完成或结果未知。',
            };
            completed.push({
                role: 'tool',
                content: JSON.stringify(payload),
                toolCallId: toolCall.id,
                tool_call_id: toolCall.id,
                toolName: toolCall.name,
                toolDisplay: payload.summary,
                error: true,
            });
        });
    }
    return completed;
}

export async function runXbTavernAssistantChat(input: XbTavernAssistantChatInput): Promise<XbTavernAssistantChatResult> {
    const sessionId = String(input.sessionId || '').trim();
    const question = String(input.question || '').trim();
    if (!sessionId) {throw new Error('manager_session_required');}
    if (!question) {throw new Error('manager_question_required');}

    const history = Array.isArray(input.history)
        ? input.history
        : await listTavernAssistantChatMessages(sessionId);
    const messages = await buildAssistantChatMessages({
        sessionId,
        question,
        agentConfig: input.agentConfig,
        assistantPreset: input.assistantPreset,
        contextSnapshot: input.contextSnapshot,
        history,
    });
    const observedProtocolMessages: XbTavernMessage[] = [];
    const changedFiles = new Set<string>();
    const changedStates = new Set<string>();
    const changedTasks = new Set<string>();
    const relayProtocolEvent = (event: TavernManagerProtocolEvent) => {
        if (event.type !== 'clear_stream_draft') {
            observedProtocolMessages.push(event.message);
        }
        input.onProtocolEvent?.(event);
    };

    try {
        const result = await runSharedManagerToolLoop({
            sessionId,
            agentConfig: input.agentConfig,
            caller: 'chat',
            messages,
            turn: Math.max(0, Number(input.turn) || 0),
            contextSnapshot: input.contextSnapshot,
            signal: input.signal,
            executeManagerOnce: input.executeManagerOnce,
            onStreamProgress: input.onStreamProgress,
            onProtocolEvent: relayProtocolEvent,
            onStateChanged: (changes) => {
                changes.changedFiles.forEach((path) => changedFiles.add(path));
                changes.changedStates.forEach((key) => changedStates.add(key));
                changes.changedTasks.forEach((key) => changedTasks.add(key));
            },
        });
        result.changedFiles.forEach((path) => changedFiles.add(path));
        result.changedStates.forEach((key) => changedStates.add(key));
        result.changedTasks.forEach((key) => changedTasks.add(key));
        try {
            await rebuildTavernMemoryDerivedIndex(sessionId);
        } catch (error) {
            return {
                ok: false,
                text: result.text,
                provider: result.provider,
                model: result.model,
                changedFiles: [...changedFiles],
                changedStates: [...changedStates],
                changedTasks: [...changedTasks],
                protocolMessages: result.protocolMessages.length ? result.protocolMessages : observedProtocolMessages,
                error: error instanceof Error ? error.message : String(error || 'assistant_chat_index_rebuild_failed'),
            };
        }
        return {
            ok: true,
            text: result.text,
            provider: result.provider,
            model: result.model,
            changedFiles: [...changedFiles],
            changedStates: [...changedStates],
            changedTasks: [...changedTasks],
            protocolMessages: result.protocolMessages.length ? result.protocolMessages : observedProtocolMessages,
        };
    } catch (error) {
        await rebuildTavernMemoryDerivedIndex(sessionId).catch(() => {});
        const errorText = error instanceof Error ? error.message : String(error || 'assistant_chat_failed');
        return {
            ok: false,
            text: '',
            provider: '',
            model: '',
            changedFiles: [...changedFiles],
            changedStates: [...changedStates],
            changedTasks: [...changedTasks],
            protocolMessages: completeInterruptedAssistantProtocol(observedProtocolMessages, errorText),
            error: errorText,
        };
    }
}
