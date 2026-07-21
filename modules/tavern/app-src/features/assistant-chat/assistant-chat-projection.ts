import {
    getTavernAssistantChatMessage,
    listTavernAssistantChatMessagesBefore,
    listTavernAssistantChatMessagesInRange,
    type TavernAssistantChatMessageRecord,
} from '../../../shared/session-db';

export const TAVERN_ASSISTANT_CHAT_INITIAL_UNIT_LIMIT = 5;
export const TAVERN_ASSISTANT_CHAT_OLDER_UNIT_LIMIT = 20;

export type TavernAssistantToolStatus = 'running' | 'resolved' | 'error';

export interface TavernAssistantChatMessageUnit {
    kind: 'message';
    key: string;
    anchorKey: string;
    sessionId: string;
    startOrder: number;
    endOrder: number;
    order: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: number;
    error: boolean;
    thoughtCount: number;
}

export interface TavernAssistantToolCallDetail {
    displayKey: string;
    protocolId: string;
    name: string;
    status: TavernAssistantToolStatus;
    path: string;
    elapsedMs: number;
    summary: string;
}

export interface TavernAssistantToolTurnUnit {
    kind: 'tool-turn';
    key: string;
    anchorKey: string;
    sessionId: string;
    startOrder: number;
    endOrder: number;
    roundCount: number;
    toolCount: number;
    status: TavernAssistantToolStatus;
    toolNames: string[];
    summary: string;
}

export type TavernAssistantChatUnit = TavernAssistantChatMessageUnit | TavernAssistantToolTurnUnit;

export interface TavernAssistantToolRoundDetail {
    key: string;
    order: number;
    preface: string;
    thoughts: Array<{ label?: string; text: string }>;
    calls: TavernAssistantToolCallDetail[];
}

export interface TavernAssistantToolTurnDetail {
    key: string;
    sessionId: string;
    startOrder: number;
    endOrder: number;
    rounds: TavernAssistantToolRoundDetail[];
}

export interface TavernAssistantChatUnitPage {
    items: TavernAssistantChatUnit[];
    hasMore: boolean;
    nextBeforeOrder: number | null;
    newestOrder: number | null;
}

interface ProjectedAssistantChatRows {
    units: TavernAssistantChatUnit[];
    details: Map<string, TavernAssistantToolTurnDetail>;
}

interface NormalizedToolDisplay {
    path: string;
    elapsedMs: number;
    summary: string;
    status: TavernAssistantToolStatus;
}

function compactText(value: unknown, limit = 220): string {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text) {return '';}
    return text.length > limit ? `${text.slice(0, Math.max(1, limit - 1))}…` : text;
}

function assistantMessageHasToolCalls(message: TavernAssistantChatMessageRecord | null | undefined): boolean {
    if (!message || message.role !== 'assistant') {return false;}
    if (message.error === true || ['aborted', 'error'].includes(String(message.finishReason || '').trim())) {
        return false;
    }
    return Array.isArray(message.toolCalls) && message.toolCalls.length > 0;
}

function assistantMessageRevisionKey(message: TavernAssistantChatMessageRecord): string {
    return [
        message.sessionId,
        message.order,
        message.role,
        Number(message.createdAt) || 0,
        Number(message.updatedAt) || 0,
    ].join(':');
}

function normalizeThoughts(value: unknown): Array<{ label?: string; text: string }> {
    if (!Array.isArray(value)) {return [];}
    return value
        .map((item) => {
            const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const text = String(record.text || '').trim();
            const label = String(record.label || '').trim();
            return text ? { ...(label ? { label } : {}), text } : null;
        })
        .filter((item): item is { label?: string; text: string } => !!item);
}

function normalizeToolDisplay(
    value: unknown,
    error = false,
    hasResult = true,
): NormalizedToolDisplay {
    const record = value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
    const rawStatus = String(record?.status || '').trim();
    const status: TavernAssistantToolStatus = error
        ? 'error'
        : !hasResult || rawStatus === 'running'
            ? 'running'
            : rawStatus === 'error' || rawStatus === 'failed'
                ? 'error'
                : 'resolved';
    const startedAt = Math.max(0, Number(record?.startedAt) || 0);
    const finishedAt = Math.max(0, Number(record?.finishedAt) || 0);
    const elapsedMs = Math.max(0, Number(record?.elapsedMs) || (
        startedAt && finishedAt ? finishedAt - startedAt : 0
    ));
    const summarySource = record
        ? record.summary || record.message || record.error
        : value;
    return {
        path: compactText(record?.path || record?.filePath || '', 240),
        elapsedMs,
        summary: compactText(summarySource, 360) || (
            status === 'running'
                ? '工具运行中，等待返回。'
                : status === 'error'
                    ? '工具执行失败。'
                    : '工具已返回。'
        ),
        status,
    };
}

function buildToolCallDetails(
    assistantMessage: TavernAssistantChatMessageRecord,
    toolMessages: TavernAssistantChatMessageRecord[],
): TavernAssistantToolCallDetail[] {
    const toolMessagesById = new Map<string, TavernAssistantChatMessageRecord[]>();
    toolMessages.forEach((message) => {
        const id = String(message.toolCallId || '').trim();
        if (!id) {return;}
        toolMessagesById.set(id, [...(toolMessagesById.get(id) || []), message]);
    });
    const usedToolMessages = new Set<TavernAssistantChatMessageRecord>();
    const roundRevisionKey = assistantMessageRevisionKey(assistantMessage);
    const calls = (assistantMessage.toolCalls || []).map((toolCall, index) => {
        const protocolId = String(toolCall?.id || '').trim();
        const toolMessage = (protocolId
            ? toolMessagesById.get(protocolId)?.find((candidate) => !usedToolMessages.has(candidate))
            : undefined)
            || toolMessages.find((candidate) => !usedToolMessages.has(candidate));
        if (toolMessage) {usedToolMessages.add(toolMessage);}
        const display = normalizeToolDisplay(toolMessage?.toolDisplay, toolMessage?.error === true, !!toolMessage);
        return {
            displayKey: `assistant-tool-call:${roundRevisionKey}:${index + 1}`,
            protocolId: protocolId || String(toolMessage?.toolCallId || '').trim(),
            name: compactText(toolMessage?.toolName || toolCall?.name || '工具', 120) || '工具',
            status: display.status,
            path: display.path,
            elapsedMs: display.elapsedMs,
            summary: display.summary,
        };
    });
    toolMessages.forEach((toolMessage, index) => {
        if (usedToolMessages.has(toolMessage)) {return;}
        const display = normalizeToolDisplay(toolMessage.toolDisplay, toolMessage.error === true, true);
        calls.push({
            displayKey: `assistant-tool-result:${assistantMessageRevisionKey(toolMessage)}:${index + 1}`,
            protocolId: String(toolMessage.toolCallId || '').trim(),
            name: compactText(toolMessage.toolName || '工具', 120) || '工具',
            status: display.status,
            path: display.path,
            elapsedMs: display.elapsedMs,
            summary: display.summary,
        });
    });
    return calls;
}

function buildToolTurnProjection(
    sessionId: string,
    rounds: Array<{
        assistantMessage: TavernAssistantChatMessageRecord;
        toolMessages: TavernAssistantChatMessageRecord[];
    }>,
    includeDetail = false,
): { unit: TavernAssistantToolTurnUnit; detail?: TavernAssistantToolTurnDetail } {
    const roundCalls = rounds.map(({ assistantMessage, toolMessages }) => ({
        assistantMessage,
        calls: buildToolCallDetails(assistantMessage, toolMessages),
    }));
    const calls = roundCalls.flatMap((round) => round.calls);
    const firstAssistant = rounds[0]!.assistantMessage;
    const lastRound = rounds.at(-1)!;
    const lastRecord = lastRound.toolMessages.at(-1) || lastRound.assistantMessage;
    const startOrder = firstAssistant.order;
    const endOrder = lastRecord.order;
    const firstRevisionKey = assistantMessageRevisionKey(firstAssistant);
    const lastRevisionKey = assistantMessageRevisionKey(lastRecord);
    const key = `assistant-tool-turn:${firstRevisionKey}:${lastRevisionKey}`;
    const status: TavernAssistantToolStatus = calls.some((call) => call.status === 'running')
        ? 'running'
        : calls.some((call) => call.status === 'error')
            ? 'error'
            : 'resolved';
    const toolNames = [...new Set(calls.map((call) => call.name).filter(Boolean))].slice(0, 8);
    const lastSummary = [...calls].reverse().find((call) => call.summary)?.summary || '';
    const unit: TavernAssistantToolTurnUnit = {
        kind: 'tool-turn',
        key,
        anchorKey: `tool:${firstRevisionKey}`,
        sessionId,
        startOrder,
        endOrder,
        roundCount: roundCalls.length,
        toolCount: calls.length,
        status,
        toolNames,
        summary: lastSummary || (calls.length ? `已处理 ${calls.length} 个工具。` : '工具轮已结束。'),
    };
    if (!includeDetail) {return { unit };}
    return {
        unit,
        detail: {
            key,
            sessionId,
            startOrder,
            endOrder,
            rounds: roundCalls.map(({ assistantMessage, calls }): TavernAssistantToolRoundDetail => ({
                key: `assistant-tool-round:${assistantMessageRevisionKey(assistantMessage)}`,
                order: assistantMessage.order,
                preface: String(assistantMessage.content || '').trim(),
                thoughts: normalizeThoughts(assistantMessage.thoughts),
                calls,
            })),
        },
    };
}

function projectAssistantChatRows(
    messages: TavernAssistantChatMessageRecord[],
    options: { includeDetails?: boolean } = {},
): ProjectedAssistantChatRows {
    const sorted = [...messages].sort((left, right) => left.order - right.order);
    const units: TavernAssistantChatUnit[] = [];
    const details = new Map<string, TavernAssistantToolTurnDetail>();
    for (let index = 0; index < sorted.length; index += 1) {
        const message = sorted[index];
        if (!message || !['user', 'assistant', 'tool'].includes(message.role)) {continue;}
        if (assistantMessageHasToolCalls(message)) {
            const rounds: Array<{
                assistantMessage: TavernAssistantChatMessageRecord;
                toolMessages: TavernAssistantChatMessageRecord[];
            }> = [];
            let nextIndex = index;
            while (nextIndex < sorted.length && assistantMessageHasToolCalls(sorted[nextIndex])) {
                const assistantMessage = sorted[nextIndex]!;
                const toolMessages: TavernAssistantChatMessageRecord[] = [];
                nextIndex += 1;
                while (nextIndex < sorted.length && sorted[nextIndex]?.role === 'tool') {
                    toolMessages.push(sorted[nextIndex]!);
                    nextIndex += 1;
                }
                rounds.push({ assistantMessage, toolMessages });
            }
            const projection = buildToolTurnProjection(message.sessionId, rounds, options.includeDetails === true);
            units.push(projection.unit);
            if (projection.detail) {details.set(projection.detail.key, projection.detail);}
            index = nextIndex - 1;
            continue;
        }
        if (message.role === 'tool') {continue;}
        const revisionKey = assistantMessageRevisionKey(message);
        units.push({
            kind: 'message',
            key: `assistant-message:${revisionKey}`,
            anchorKey: `msg:${revisionKey}`,
            sessionId: message.sessionId,
            startOrder: message.order,
            endOrder: message.order,
            order: message.order,
            role: message.role === 'user' ? 'user' : 'assistant',
            content: String(message.content || ''),
            createdAt: Number(message.createdAt) || 0,
            error: message.error === true,
            thoughtCount: Array.isArray(message.thoughts) ? message.thoughts.length : 0,
        });
    }
    return { units, details };
}

export function projectTavernAssistantChatUnits(
    messages: TavernAssistantChatMessageRecord[] = [],
): TavernAssistantChatUnit[] {
    return projectAssistantChatRows(messages).units;
}

export async function loadTavernAssistantChatUnitPage(
    sessionId = '',
    options: {
        beforeOrder?: number;
        limit?: number;
        rawBatchSize?: number;
    } = {},
): Promise<TavernAssistantChatUnitPage> {
    const id = String(sessionId || '').trim();
    if (!id) {return { items: [], hasMore: false, nextBeforeOrder: null, newestOrder: null };}
    const requestedLimit = Math.floor(Number(options.limit));
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? requestedLimit
        : TAVERN_ASSISTANT_CHAT_INITIAL_UNIT_LIMIT;
    const rawBatchSize = Math.max(1, Math.min(500, Math.floor(Number(options.rawBatchSize) || 32)));
    let cursor = Number.isFinite(Number(options.beforeOrder))
        ? Math.max(0, Math.floor(Number(options.beforeOrder) || 0))
        : Number.POSITIVE_INFINITY;
    let rows: TavernAssistantChatMessageRecord[] = [];
    let units: TavernAssistantChatUnit[] = [];
    let exhausted = false;

    while (!exhausted) {
        const chunk = await listTavernAssistantChatMessagesBefore(id, cursor, rawBatchSize);
        if (!chunk.length) {
            exhausted = true;
            break;
        }
        rows = [...chunk, ...rows];
        cursor = chunk[0]!.order;
        units = projectAssistantChatRows(rows).units;
        if (chunk.length < rawBatchSize) {exhausted = true;}
        if (units.length <= limit) {continue;}
        const firstVisibleUnit = units.at(-limit);
        if (!firstVisibleUnit || firstVisibleUnit.kind !== 'tool-turn') {break;}
        const precedingRow = [...rows]
            .reverse()
            .find((row) => row.order < firstVisibleUnit.startOrder);
        const hasKnownToolTurnBoundary = !!precedingRow
            && precedingRow.role !== 'tool'
            && !assistantMessageHasToolCalls(precedingRow);
        if (hasKnownToolTurnBoundary || exhausted) {break;}
    }

    const hasMore = units.length > limit;
    const items = hasMore ? units.slice(-limit) : units;
    return {
        items,
        hasMore,
        nextBeforeOrder: items[0]?.startOrder ?? null,
        newestOrder: items.at(-1)?.endOrder ?? null,
    };
}

export async function loadTavernAssistantToolTurnDetail(
    item: Pick<TavernAssistantToolTurnUnit, 'key' | 'sessionId' | 'startOrder' | 'endOrder'>,
): Promise<TavernAssistantToolTurnDetail | null> {
    const rows = await listTavernAssistantChatMessagesInRange(
        item.sessionId,
        item.startOrder,
        item.endOrder,
    );
    const projected = projectAssistantChatRows(rows, { includeDetails: true });
    return projected.details.get(item.key) || null;
}

export async function loadTavernAssistantMessageThoughts(
    sessionId = '',
    order = -1,
): Promise<Array<{ label?: string; text: string }>> {
    const message = await getTavernAssistantChatMessage(sessionId, order);
    return normalizeThoughts(message?.thoughts);
}
