import type { XbTavernMessage } from '../shared/message-assembler';
import type { TavernManagerMessageRecord } from '../shared/session-db';

export interface ManagerToolCallDisplayItem {
    id: string;
    name: string;
    argumentsText: string;
    resultText: string;
    ok: boolean;
    toolMessage?: TavernManagerMessageRecord;
}

export interface ManagerToolRoundDisplayItem {
    assistantMessage: TavernManagerMessageRecord;
    toolMessages: TavernManagerMessageRecord[];
    calls: ManagerToolCallDisplayItem[];
}

export interface ManagerMessageDisplayItem {
    kind: 'message';
    key: string;
    anchorKey: string;
    message: TavernManagerMessageRecord;
}

export interface ManagerToolTurnDisplayItem {
    kind: 'tool-turn';
    key: string;
    anchorKey: string;
    rounds: ManagerToolRoundDisplayItem[];
    assistantMessage: TavernManagerMessageRecord;
    toolMessages: TavernManagerMessageRecord[];
    calls: ManagerToolCallDisplayItem[];
}

export type ManagerChatDisplayItem = ManagerMessageDisplayItem | ManagerToolTurnDisplayItem;

export interface ManagerStreamToolCall {
    id?: string;
    name?: string;
    arguments?: string;
}

export interface ManagerStreamSnapshot {
    text?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    toolCalls?: unknown[];
    toolCallDraft?: boolean;
}

export interface ManagerStreamDisplayPatch {
    content: string;
    toolCalls: ManagerStreamToolCall[];
}

function normalizeManagerStreamToolCalls(toolCalls: unknown[] | null | undefined): ManagerStreamToolCall[] {
    if (!Array.isArray(toolCalls) || !toolCalls.length) { return []; }
    return toolCalls
        .map((toolCall) => {
            const record = toolCall && typeof toolCall === 'object' ? toolCall as Record<string, unknown> : {};
            const fn = record.function && typeof record.function === 'object' ? record.function as Record<string, unknown> : {};
            const id = typeof record.id === 'string'
                ? record.id
                : typeof record.tool_call_id === 'string'
                    ? record.tool_call_id
                    : undefined;
            const name = typeof record.name === 'string'
                ? record.name
                : typeof fn.name === 'string'
                    ? fn.name
                    : undefined;
            const rawArguments = record.arguments ?? fn.arguments;
            const argumentsText = typeof rawArguments === 'string'
                ? rawArguments
                : rawArguments === undefined
                    ? undefined
                    : JSON.stringify(rawArguments);
            return {
                ...(id ? { id } : {}),
                ...(name ? { name } : {}),
                ...(argumentsText ? { arguments: argumentsText } : {}),
            };
        })
        .filter((toolCall) => Boolean(toolCall.id || toolCall.name || toolCall.arguments));
}

function shortText(value = '', limit = 180) {
    const text = String(value || '').trim();
    return text.length > limit ? `${text.slice(0, limit)}...` : text;
}

function managerMessageKey(message: Pick<TavernManagerMessageRecord, 'sessionId' | 'order'>) {
    return `manager:${message.sessionId}:${message.order}`;
}

function managerMessageHasToolCalls(message: TavernManagerMessageRecord | XbTavernMessage | null | undefined): boolean {
    if (!message || typeof message !== 'object') { return false; }
    const record = message as unknown as Record<string, unknown>;
    if (record.error === true || ['aborted', 'error'].includes(String(record.finishReason || '').trim())) {
        return false;
    }
    return (Array.isArray(record.toolCalls) && record.toolCalls.length > 0)
        || (Array.isArray(record.tool_calls) && record.tool_calls.length > 0);
}

function normalizeManagerToolCalls(message: TavernManagerMessageRecord | XbTavernMessage | null | undefined) {
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
                argumentsText: shortText(argumentsText, 320),
            };
        })
        .filter((toolCall: { name: string }) => toolCall.name);
}

function parseManagerToolJson(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'string') { return {}; }
    try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
        return {};
    }
}

function summarizeManagerToolResult(message: TavernManagerMessageRecord | undefined): string {
    if (!message) { return '等待工具返回。'; }
    const display = String(message.toolDisplay || '').trim();
    if (display) { return shortText(display, 360); }
    const parsed = parseManagerToolJson(message.content);
    const summary = String(parsed.summary || parsed.message || parsed.error || '').trim();
    if (summary) { return shortText(summary, 360); }
    const path = String(parsed.path || parsed.filePath || parsed.docId || '').trim();
    const changed = parsed.changed === true ? '已变更' : parsed.changed === false ? '无变化' : '';
    const ok = parsed.ok === false ? '失败' : parsed.ok === true ? '成功' : '';
    const compact = [ok, changed, path].filter(Boolean).join(' · ');
    if (compact) { return compact; }
    return shortText(String(message.content || '').trim(), 360) || '工具已返回。';
}

function buildManagerToolRoundDisplayItem(
    assistantMessage: TavernManagerMessageRecord,
    toolMessages: TavernManagerMessageRecord[],
): ManagerToolRoundDisplayItem {
    const calls = normalizeManagerToolCalls(assistantMessage).map((toolCall: { id: string; name: string; argumentsText: string }): ManagerToolCallDisplayItem => {
        const toolMessage = toolMessages.find((message) => (
            String(message.toolCallId || (message as unknown as Record<string, unknown>).tool_call_id || '') === toolCall.id
        ));
        const parsed = parseManagerToolJson(toolMessage?.content);
        return {
            id: toolCall.id,
            name: toolMessage?.toolName || toolCall.name,
            argumentsText: toolCall.argumentsText,
            resultText: summarizeManagerToolResult(toolMessage),
            ok: parsed.ok !== false && !toolMessage?.error,
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

export function buildManagerChatDisplayItems(messages: TavernManagerMessageRecord[]): ManagerChatDisplayItem[] {
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
                const toolMessages: TavernManagerMessageRecord[] = [];
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

export function managerToolTurnSummary(item: ManagerToolTurnDisplayItem): string {
    const failed = item.calls.filter((call) => !call.ok).length;
    const pending = item.calls.filter((call) => !call.toolMessage).length;
    const roundText = item.rounds.length > 1 ? `${item.rounds.length} 轮 · ` : '';
    if (pending) { return `${roundText}工具调用 ${item.calls.length} 次 · ${pending} 个等待返回`; }
    return failed ? `${roundText}工具调用 ${item.calls.length} 次 · ${failed} 次失败` : `${roundText}工具调用 ${item.calls.length} 次 · 全部成功`;
}

export function managerToolTurnPreview(item: ManagerToolTurnDisplayItem): string {
    const names = item.calls
        .map((call) => call.name)
        .filter(Boolean)
        .slice(0, 3)
        .join('、');
    const extra = item.calls.length > 3 ? ` 等 ${item.calls.length} 个` : '';
    return names ? `${names}${extra}` : '等待工具返回';
}

export function createManagerStreamToolDraftState() {
    let toolCalls: ManagerStreamToolCall[] = [];
    let toolDraftActive = false;
    return {
        update(snapshot: ManagerStreamSnapshot = {}): ManagerStreamDisplayPatch {
            const incomingToolCalls = Array.isArray(snapshot.toolCalls) && snapshot.toolCalls.length
                ? normalizeManagerStreamToolCalls(snapshot.toolCalls)
                : null;
            const hasVisibleStreamText = typeof snapshot.text === 'string' && snapshot.text.trim().length > 0;
            if (incomingToolCalls) {
                toolCalls = incomingToolCalls;
                toolDraftActive = true;
            } else if (hasVisibleStreamText && toolDraftActive && snapshot.toolCallDraft !== true) {
                toolCalls = [];
                toolDraftActive = false;
            }
            const content = typeof snapshot.text === 'string' && snapshot.text.trim()
                ? snapshot.text
                : toolCalls.length
                    ? '正在准备工具调用...'
                    : '正在思考...';
            return {
                content,
                toolCalls,
            };
        },
        reset() {
            toolCalls = [];
            toolDraftActive = false;
        },
    };
}
