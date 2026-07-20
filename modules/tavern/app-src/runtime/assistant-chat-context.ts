import { resolveActiveProviderConfig } from '../../../agent-core/provider-config.js';
import * as contextTokens from '../../../agent-core/runtime/context-tokens.js';
import type { XbTavernContext, XbTavernMessage } from '../../shared/message-assembler';
import type { TavernAssistantPreset } from '../../shared/assistant-presets';
import {
    ensureTavernMemoryDefaults,
    getTavernManagerToolDefinitions,
    listTavernMemoryFiles,
} from '../../shared/memory-files';
import {
    listTavernAssistantChatMessages,
    type TavernAssistantChatMessageRecord,
} from '../../shared/session-db';
import {
    buildManagerSystemPrompt,
    buildResidentMemoryBlock,
    isManagerWebSearchEnabled,
} from './manager.js';
import {
    buildTavernAssistantTaskContextMessage,
    loadTavernTaskPromptState,
} from './task-context.js';

const TAVERN_ASSISTANT_CHAT_TIMEOUT_MS = 5 * 60 * 1000;
const resolveConversationTokens = (contextTokens as unknown as {
    resolveConversationTokens: (input: {
        messages?: XbTavernMessage[];
        tools?: unknown[] | null;
        providerConfig?: Record<string, unknown>;
    }) => Promise<number>;
}).resolveConversationTokens;

export interface XbTavernAssistantChatCompactionSnapshot {
    currentTokens: number;
    fixedTokens?: number;
    historyTokens?: number;
    yieldTokens?: number;
    triggerTokens: number;
    status: string;
    preservedTurns?: number;
}

export interface EnsureTavernAssistantChatBudgetInput {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    assistantPreset?: TavernAssistantPreset;
    contextSnapshot?: XbTavernContext;
    question: string;
    history?: TavernAssistantChatMessageRecord[];
    signal?: AbortSignal;
    onCompactionStart?: (snapshot: XbTavernAssistantChatCompactionSnapshot) => void;
    onCompactionProgress?: (snapshot: XbTavernAssistantChatCompactionSnapshot) => void;
    onCompactionComplete?: (snapshot: XbTavernAssistantChatCompactionSnapshot) => void;
    onCompactionUnable?: (snapshot: XbTavernAssistantChatCompactionSnapshot) => void;
}

export const TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS = 188000;
export const TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS = 158000;
export const TAVERN_ASSISTANT_CHAT_DEFAULT_PRESERVED_TURNS = 2;
export const TAVERN_ASSISTANT_CHAT_MIN_PRESERVED_TURNS = 1;

function buildAssistantChatUserPrompt(input: {
    question: string;
    memoryFiles: Array<{ path: string; status: string; updatedAt: number; content: string }>;
}): string {
    return [
        buildResidentMemoryBlock(input.memoryFiles),
        '',
        '[Current manager-chat question]',
        input.question,
    ].join('\n');
}

function normalizeReplayAssistantToolCalls(toolCalls: Array<{ id?: string; name?: string; arguments?: string }> = []): Array<{ id?: string; name?: string; arguments?: string }> {
    const seen = new Set<string>();
    return (Array.isArray(toolCalls) ? toolCalls : [])
        .map((toolCall) => ({
            id: String(toolCall?.id || ''),
            name: String(toolCall?.name || '').trim(),
            arguments: String(toolCall?.arguments || '{}'),
        }))
        .filter((toolCall) => {
            if (!toolCall.name) {return false;}
            const key = `${toolCall.id}\u0000${toolCall.name}\u0000${toolCall.arguments}`;
            if (seen.has(key)) {return false;}
            seen.add(key);
            return true;
        });
}

export async function buildAssistantChatMessages(input: {
    sessionId: string;
    question: string;
    agentConfig?: Record<string, unknown>;
    assistantPreset?: TavernAssistantPreset;
    contextSnapshot?: XbTavernContext;
    history?: TavernAssistantChatMessageRecord[];
}): Promise<XbTavernMessage[]> {
    await ensureTavernMemoryDefaults(input.sessionId);
    const [memoryFiles, history, tasks] = await Promise.all([
        listTavernMemoryFiles(input.sessionId, { includeStale: true }),
        Array.isArray(input.history) ? input.history : listTavernAssistantChatMessages(input.sessionId),
        loadTavernTaskPromptState(input.sessionId),
    ]);
    const taskContextMessage = buildTavernAssistantTaskContextMessage(tasks);
    const messages: XbTavernMessage[] = [{
        role: 'system',
        content: buildManagerSystemPrompt(input.assistantPreset, {
            workMode: 'manual-chat',
            includeWebSearch: isManagerWebSearchEnabled(input.agentConfig || {}),
            includeTasks: !!taskContextMessage,
            playerName: String(input.contextSnapshot?.user?.name || '').trim(),
        }),
    }, ...(taskContextMessage ? [taskContextMessage] : [])];
    history.forEach((message) => {
        const canReplayToolCalls = message.role === 'assistant'
            && message.error !== true
            && !['aborted', 'error'].includes(String(message.finishReason || '').trim());
        const toolCalls = canReplayToolCalls && Array.isArray(message.toolCalls)
            ? normalizeReplayAssistantToolCalls(message.toolCalls)
            : [];
        messages.push({
            role: message.role,
            content: String(message.content || ''),
            ...(message.name ? { name: message.name } : {}),
            ...(Array.isArray(message.thoughts) ? { thoughts: message.thoughts } : {}),
            ...('providerPayload' in message ? { providerPayload: message.providerPayload } : {}),
            ...(toolCalls.length ? {
                toolCalls,
                tool_calls: toolCalls.map((toolCall) => ({
                    id: toolCall.id || '',
                    type: 'function',
                    function: {
                        name: toolCall.name || '',
                        arguments: toolCall.arguments || '{}',
                    },
                })),
            } : {}),
            ...(message.role === 'tool' ? {
                tool_call_id: message.toolCallId || '',
                toolName: message.toolName || '',
                toolDisplay: message.toolDisplay,
            } : {}),
        });
    });
    messages.push({
        role: 'user',
        content: buildAssistantChatUserPrompt({
            question: input.question,
            memoryFiles,
        }),
    });
    return messages;
}

export function splitTavernAssistantChatMessagesIntoTurns(messages: TavernAssistantChatMessageRecord[] = []): TavernAssistantChatMessageRecord[][] {
    const turns: TavernAssistantChatMessageRecord[][] = [];
    let currentTurn: TavernAssistantChatMessageRecord[] = [];
    (messages || []).forEach((message) => {
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) {return;}
        if (message.role === 'user' && currentTurn.length) {
            turns.push(currentTurn);
            currentTurn = [message];
            return;
        }
        currentTurn.push(message);
    });
    if (currentTurn.length) {
        turns.push(currentTurn);
    }
    return turns.filter((turn) => turn.length);
}

function throwIfAssistantChatAborted(signal?: AbortSignal) {
    if (!signal?.aborted) {return;}
    const error = new Error('assistant_chat_compaction_aborted');
    error.name = 'AbortError';
    throw error;
}

async function estimateAssistantChatContext(input: {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    assistantPreset?: TavernAssistantPreset;
    contextSnapshot?: XbTavernContext;
    question: string;
    history?: TavernAssistantChatMessageRecord[];
}): Promise<{ messages: XbTavernMessage[]; tokens: number }> {
    const providerConfig = resolveActiveProviderConfig(input.agentConfig || {}, {
        role: 'delegate',
        timeoutMs: TAVERN_ASSISTANT_CHAT_TIMEOUT_MS,
    });
    const messages = await buildAssistantChatMessages(input);
    const tokens = await resolveConversationTokens({
        messages,
        tools: getTavernManagerToolDefinitions({
            webSearchEnabled: isManagerWebSearchEnabled(input.agentConfig),
        }),
        providerConfig,
    });
    return { messages, tokens };
}

export async function ensureTavernAssistantChatBudget(input: EnsureTavernAssistantChatBudgetInput): Promise<{
    compacted: boolean;
    canProceed: boolean;
    currentTokens: number;
    history: TavernAssistantChatMessageRecord[];
    messages: XbTavernMessage[];
    removedOrders: number[];
    preservedTurns?: number;
}> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {
        return { compacted: false, canProceed: false, currentTokens: 0, history: [], messages: [], removedOrders: [] };
    }
    throwIfAssistantChatAborted(input.signal);
    const history = Array.isArray(input.history)
        ? [...input.history].sort((left, right) => left.order - right.order)
        : await listTavernAssistantChatMessages(sessionId);
    const initialContext = await estimateAssistantChatContext({
        sessionId,
        agentConfig: input.agentConfig,
        assistantPreset: input.assistantPreset,
        contextSnapshot: input.contextSnapshot,
        question: input.question,
        history,
    });
    let currentTokens = initialContext.tokens;
    if (currentTokens <= TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS) {
        return { compacted: false, canProceed: true, currentTokens, history, messages: initialContext.messages, removedOrders: [] };
    }
    const fixedContext = await estimateAssistantChatContext({
        sessionId,
        agentConfig: input.agentConfig,
        assistantPreset: input.assistantPreset,
        contextSnapshot: input.contextSnapshot,
        question: input.question,
        history: [],
    });
    const fixedTokens = fixedContext.tokens;
    const historyTokens = Math.max(0, currentTokens - fixedTokens);
    input.onCompactionStart?.({
        currentTokens,
        fixedTokens,
        historyTokens,
        triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
        status: '正在释放较早助手对话，只保留最近聊天上下文...',
    });
    const turns = splitTavernAssistantChatMessagesIntoTurns(history);
    const preservedCandidates = [...new Set([
        Math.min(TAVERN_ASSISTANT_CHAT_DEFAULT_PRESERVED_TURNS, turns.length),
        Math.min(TAVERN_ASSISTANT_CHAT_MIN_PRESERVED_TURNS, turns.length),
        0,
    ])];
    let hardLimitFallback = currentTokens <= TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS
        ? { history, messages: initialContext.messages, currentTokens, preservedTurns: turns.length }
        : null;

    for (const preservedTurns of preservedCandidates) {
        throwIfAssistantChatAborted(input.signal);
        const candidateHistory = preservedTurns > 0 ? turns.slice(-preservedTurns).flat() : [];
        input.onCompactionProgress?.({
            currentTokens,
            fixedTokens,
            historyTokens: Math.max(0, currentTokens - fixedTokens),
            triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
            preservedTurns,
            status: preservedTurns > 0
                ? `正在验证只保留最近 ${preservedTurns} 轮助手对话是否可用...`
                : '正在验证仅保留本轮固定上下文是否可用...',
        });
        const candidateContext = await estimateAssistantChatContext({
            sessionId,
            agentConfig: input.agentConfig,
            assistantPreset: input.assistantPreset,
            contextSnapshot: input.contextSnapshot,
            question: input.question,
            history: candidateHistory,
        });
        const nextTokens = candidateContext.tokens;
        const status = nextTokens <= TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS
            ? (preservedTurns > 0
                ? `已确认只保留最近 ${preservedTurns} 轮助手对话。`
                : '已确认清除较早助手对话后可继续。')
            : `候选上下文仍高于自动目标（${nextTokens} / ${TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS}）。`;
        input.onCompactionProgress?.({
            currentTokens: nextTokens,
            fixedTokens,
            historyTokens: Math.max(0, nextTokens - fixedTokens),
            yieldTokens: nextTokens,
            triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
            preservedTurns,
            status,
        });
        if (nextTokens <= TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS) {
            const keptOrders = new Set(candidateHistory.map((message) => message.order));
            const removedOrders = history.filter((message) => !keptOrders.has(message.order)).map((message) => message.order);
            input.onCompactionComplete?.({
                currentTokens: nextTokens,
                fixedTokens,
                historyTokens: Math.max(0, nextTokens - fixedTokens),
                yieldTokens: nextTokens,
                triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
                preservedTurns,
                status,
            });
            return {
                compacted: removedOrders.length > 0,
                canProceed: true,
                currentTokens: nextTokens,
                history: candidateHistory,
                messages: candidateContext.messages,
                removedOrders,
                preservedTurns,
            };
        }
        if (!hardLimitFallback && nextTokens <= TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS) {
            hardLimitFallback = {
                history: candidateHistory,
                messages: candidateContext.messages,
                currentTokens: nextTokens,
                preservedTurns,
            };
        }
    }

    if (hardLimitFallback) {
        const keptOrders = new Set(hardLimitFallback.history.map((message) => message.order));
        const removedOrders = history.filter((message) => !keptOrders.has(message.order)).map((message) => message.order);
        const status = removedOrders.length
            ? `已收缩到最大上下文上限内（${hardLimitFallback.currentTokens} / ${TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS}）。`
            : `当前上下文高于自动目标，但仍在最大上限内（${hardLimitFallback.currentTokens} / ${TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS}），保留原历史。`;
        if (removedOrders.length) {
            input.onCompactionComplete?.({
                currentTokens: hardLimitFallback.currentTokens,
                fixedTokens,
                historyTokens: Math.max(0, hardLimitFallback.currentTokens - fixedTokens),
                yieldTokens: hardLimitFallback.currentTokens,
                triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
                preservedTurns: hardLimitFallback.preservedTurns,
                status,
            });
        } else {
            input.onCompactionUnable?.({
                currentTokens: hardLimitFallback.currentTokens,
                fixedTokens,
                historyTokens: Math.max(0, hardLimitFallback.currentTokens - fixedTokens),
                yieldTokens: hardLimitFallback.currentTokens,
                triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
                status,
            });
        }
        return {
            compacted: removedOrders.length > 0,
            canProceed: true,
            currentTokens: hardLimitFallback.currentTokens,
            history: hardLimitFallback.history,
            messages: hardLimitFallback.messages,
            removedOrders,
            preservedTurns: hardLimitFallback.preservedTurns,
        };
    }

    input.onCompactionUnable?.({
        currentTokens,
        fixedTokens,
        historyTokens: Math.max(0, currentTokens - fixedTokens),
        triggerTokens: TAVERN_ASSISTANT_CHAT_SUMMARY_TRIGGER_TOKENS,
        status: `即使清空较早助手对话仍超过最大上下文（${TAVERN_ASSISTANT_CHAT_MAX_CONTEXT_TOKENS}），未删除任何历史。`,
    });
    return { compacted: false, canProceed: false, currentTokens, history, messages: initialContext.messages, removedOrders: [] };
}
