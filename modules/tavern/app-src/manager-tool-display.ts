import type { XbTavernMessage } from '../shared/message-assembler';
import type { TavernAssistantChatMessageRecord } from '../shared/session-db';

export interface ManagerToolCallDisplayItem {
    id: string;
    name: string;
    argumentsText: string;
    resultText: string;
    ok: boolean;
    toolMessage?: TavernAssistantChatMessageRecord;
}

export interface ManagerToolRoundDisplayItem {
    assistantMessage: TavernAssistantChatMessageRecord;
    toolMessages: TavernAssistantChatMessageRecord[];
    calls: ManagerToolCallDisplayItem[];
}

export interface ManagerMessageDisplayItem {
    kind: 'message';
    key: string;
    anchorKey: string;
    message: TavernAssistantChatMessageRecord;
}

export interface ManagerToolTurnDisplayItem {
    kind: 'tool-turn';
    key: string;
    anchorKey: string;
    rounds: ManagerToolRoundDisplayItem[];
    assistantMessage: TavernAssistantChatMessageRecord;
    toolMessages: TavernAssistantChatMessageRecord[];
    calls: ManagerToolCallDisplayItem[];
}

export type ManagerChatDisplayItem = ManagerMessageDisplayItem | ManagerToolTurnDisplayItem;

function shortText(value = '', limit = 180) {
    const text = String(value || '').trim();
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function managerMessageKey(message: Pick<TavernAssistantChatMessageRecord, 'sessionId' | 'order'>) {
    return `manager:${message.sessionId}:${message.order}`;
}

function managerMessageHasToolCalls(message: TavernAssistantChatMessageRecord | XbTavernMessage | null | undefined): boolean {
    if (!message || typeof message !== 'object') { return false; }
    const record = message as unknown as Record<string, unknown>;
    if (record.error === true || ['aborted', 'error'].includes(String(record.finishReason || '').trim())) {
        return false;
    }
    return (Array.isArray(record.toolCalls) && record.toolCalls.length > 0)
        || (Array.isArray(record.tool_calls) && record.tool_calls.length > 0);
}

function normalizeManagerToolCalls(message: TavernAssistantChatMessageRecord | XbTavernMessage | null | undefined) {
    const record = message && typeof message === 'object' ? message as unknown as Record<string, unknown> : {};
    const source = Array.isArray(record.toolCalls) && record.toolCalls.length
        ? record.toolCalls
        : Array.isArray(record.tool_calls) ? record.tool_calls : [];
    return source
        .map((toolCall: unknown, index: number) => {
            const toolCallRecord = toolCall && typeof toolCall === 'object' ? toolCall as Record<string, unknown> : {};
            const fn = toolCallRecord.function && typeof toolCallRecord.function === 'object' ? toolCallRecord.function as Record<string, unknown> : {};
            const id = String(toolCallRecord.id || toolCallRecord.tool_call_id || `tool-call-${index + 1}`);
            const name = String(toolCallRecord.name || fn.name || '').trim() || '工具';
            const rawArguments = toolCallRecord.arguments ?? fn.arguments ?? {};
            const argumentsText = typeof rawArguments === 'string'
                ? rawArguments
                : JSON.stringify(rawArguments || {});
            return {
                id,
                name,
                argumentsText,
            };
        })
        .filter((toolCall: { name: string }) => toolCall.name);
}

function summarizeManagerToolResult(message: TavernAssistantChatMessageRecord | undefined): string {
    if (!message) { return '等待工具返回。'; }
    const display = String(message.toolDisplay || '').trim();
    if (display) { return shortText(display, 360); }
    return message.error ? '工具执行失败。' : '工具已返回。';
}

function buildManagerToolRoundDisplayItem(
    assistantMessage: TavernAssistantChatMessageRecord,
    toolMessages: TavernAssistantChatMessageRecord[],
): ManagerToolRoundDisplayItem {
    const calls = normalizeManagerToolCalls(assistantMessage).map((toolCall: { id: string; name: string; argumentsText: string }): ManagerToolCallDisplayItem => {
        const toolMessage = toolMessages.find((message) => (
            String(message.toolCallId || (message as unknown as Record<string, unknown>).tool_call_id || '') === toolCall.id
        ));
        return {
            id: toolCall.id,
            name: toolMessage?.toolName || toolCall.name,
            argumentsText: toolCall.argumentsText,
            resultText: summarizeManagerToolResult(toolMessage),
            ok: !toolMessage?.error,
            toolMessage,
        };
    });
    return {
        assistantMessage,
        toolMessages,
        calls,
    };
}

function buildManagerToolTurnDisplayItem(rounds: ManagerToolRoundDisplayItem[]): ManagerToolTurnDisplayItem {
    const firstRound = rounds[0];
    const lastRound = rounds[rounds.length - 1] || firstRound;
    return {
        kind: 'tool-turn',
        key: `tool-turn:${firstRound.assistantMessage.sessionId}:${firstRound.assistantMessage.order}:${lastRound.assistantMessage.order}`,
        anchorKey: `tool:${firstRound.assistantMessage.sessionId}:${firstRound.assistantMessage.order}`,
        rounds,
        assistantMessage: firstRound.assistantMessage,
        toolMessages: rounds.flatMap((round) => round.toolMessages),
        calls: rounds.flatMap((round) => round.calls),
    };
}

export function buildManagerChatDisplayItems(messages: TavernAssistantChatMessageRecord[]): ManagerChatDisplayItem[] {
    const sorted = [...messages].sort((left, right) => left.order - right.order);
    const items: ManagerChatDisplayItem[] = [];
    for (let index = 0; index < sorted.length; index += 1) {
        const message = sorted[index];
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) { continue; }
        if (message.role === 'assistant' && managerMessageHasToolCalls(message)) {
            const rounds: ManagerToolRoundDisplayItem[] = [];
            let nextIndex = index;
            while (
                nextIndex < sorted.length
                && sorted[nextIndex]?.role === 'assistant'
                && managerMessageHasToolCalls(sorted[nextIndex])
            ) {
                const assistantMessage = sorted[nextIndex];
                const toolMessages: TavernAssistantChatMessageRecord[] = [];
                nextIndex += 1;
                while (nextIndex < sorted.length && sorted[nextIndex]?.role === 'tool') {
                    toolMessages.push(sorted[nextIndex]);
                    nextIndex += 1;
                }
                rounds.push(buildManagerToolRoundDisplayItem(assistantMessage, toolMessages));
            }
            items.push(buildManagerToolTurnDisplayItem(rounds));
            index = nextIndex - 1;
            continue;
        }
        if (message.role === 'tool') { continue; }
        items.push({
            kind: 'message',
            key: managerMessageKey(message),
            anchorKey: `msg:${message.sessionId}:${message.order}`,
            message,
        });
    }
    return items;
}
