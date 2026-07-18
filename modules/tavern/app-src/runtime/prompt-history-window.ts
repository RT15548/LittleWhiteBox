import {
    listLatestTavernMessagesWithCount,
    listTavernMessagesInRangeWithCount,
    type TavernMessageRecord,
} from '../../shared/session-db';

const TAVERN_IMAGE_MARKER_REGEX = /\[tavern-image:[a-z0-9\-_]+\]/gi;
const TAVERN_INLINE_IMAGE_TOKEN_REGEX = /\[(?:img|图片)\s*:\s*[^\]]+\]/gi;

export const TAVERN_CONTEXT_WINDOW_MAX = 20;
export const TAVERN_CONTEXT_WINDOW_RETAIN = 10;
export const TAVERN_CONTEXT_WINDOW_MIN_SAFE = 5;

export function stripTavernImageMarkers(text = ''): string {
    return String(text || '')
        .replace(TAVERN_IMAGE_MARKER_REGEX, '')
        .replace(TAVERN_INLINE_IMAGE_TOKEN_REGEX, '')
        .trim();
}

function isUsableContextWindowMessage(message: TavernMessageRecord): boolean {
    return !message.error && !!stripTavernImageMarkers(message.content);
}

function hasUsableCurrentUserMessage(text = ''): boolean {
    return !!stripTavernImageMarkers(text);
}

export interface TavernContextWindowResolution {
    contextWindowStartOrder: number;
    historyMessages: TavernMessageRecord[];
    usableHistoryCount: number;
    windowHistoryCount: number;
    currentUserCount: number;
}

export function resolveTavernContextWindow(input: {
    messages?: TavernMessageRecord[];
    contextWindowStartOrder?: unknown;
    currentUserMessage?: string;
} = {}): TavernContextWindowResolution {
    const sorted = [...(input.messages || [])].sort((left, right) => left.order - right.order);
    const usableMessages = sorted.filter(isUsableContextWindowMessage);
    const currentUserCount = hasUsableCurrentUserMessage(input.currentUserMessage || '') ? 1 : 0;
    let startOrder = Math.max(0, Math.floor(Number(input.contextWindowStartOrder) || 0));

    if (!usableMessages.length || usableMessages.length < TAVERN_CONTEXT_WINDOW_MIN_SAFE) {
        startOrder = 0;
    } else if (usableMessages.length + currentUserCount <= TAVERN_CONTEXT_WINDOW_MAX) {
        startOrder = 0;
    } else if (startOrder > 0) {
        let windowUsableMessages = usableMessages.filter((message) => message.order >= startOrder);
        const exactStartExists = usableMessages.some((message) => message.order === startOrder);
        if (!exactStartExists && windowUsableMessages.length) {
            startOrder = windowUsableMessages[0].order;
            windowUsableMessages = usableMessages.filter((message) => message.order >= startOrder);
        }
        if (windowUsableMessages.length < TAVERN_CONTEXT_WINDOW_MIN_SAFE) {
            startOrder = usableMessages[Math.max(0, usableMessages.length - TAVERN_CONTEXT_WINDOW_RETAIN)]?.order || 0;
        }
    }

    let windowUsableMessages = startOrder > 0
        ? usableMessages.filter((message) => message.order >= startOrder)
        : usableMessages;
    if (windowUsableMessages.length + currentUserCount > TAVERN_CONTEXT_WINDOW_MAX) {
        const retainHistoryCount = Math.max(0, TAVERN_CONTEXT_WINDOW_RETAIN - currentUserCount);
        startOrder = retainHistoryCount > 0
            ? windowUsableMessages.slice(-retainHistoryCount)[0]?.order || 0
            : 0;
        windowUsableMessages = startOrder > 0
            ? usableMessages.filter((message) => message.order >= startOrder)
            : usableMessages;
    }

    const historyMessages = startOrder > 0
        ? sorted.filter((message) => message.order >= startOrder)
        : sorted;
    return {
        contextWindowStartOrder: startOrder,
        historyMessages,
        usableHistoryCount: usableMessages.length,
        windowHistoryCount: windowUsableMessages.length,
        currentUserCount,
    };
}

function countUsableContextWindowMessages(messages: TavernMessageRecord[]) {
    return messages.filter(isUsableContextWindowMessage).length;
}

export async function loadTavernPromptHistoryWindow(input: {
    sessionId: string;
    contextWindowStartOrder?: unknown;
    currentUserMessage?: string;
    beforeOrder?: number;
}): Promise<TavernContextWindowResolution> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {
        return resolveTavernContextWindow({
            messages: [],
            contextWindowStartOrder: input.contextWindowStartOrder,
            currentUserMessage: input.currentUserMessage,
        });
    }
    const finiteBefore = Number.isFinite(Number(input.beforeOrder));
    const beforeOrder = finiteBefore ? Math.floor(Number(input.beforeOrder) || 0) : Number.POSITIVE_INFINITY;
    if (finiteBefore && beforeOrder <= 0) {
        return resolveTavernContextWindow({
            messages: [],
            contextWindowStartOrder: input.contextWindowStartOrder,
            currentUserMessage: input.currentUserMessage,
        });
    }
    const endOrder = finiteBefore ? beforeOrder - 1 : Number.POSITIVE_INFINITY;
    const startOrder = Math.max(0, Math.floor(Number(input.contextWindowStartOrder) || 0));
    const currentUserCount = hasUsableCurrentUserMessage(input.currentUserMessage || '') ? 1 : 0;
    const targetUsable = Math.max(TAVERN_CONTEXT_WINDOW_MAX, TAVERN_CONTEXT_WINDOW_RETAIN + currentUserCount);
    const pageSize = Math.max(TAVERN_CONTEXT_WINDOW_MAX * 3, 60);

    if (startOrder > 0) {
        const range = await listTavernMessagesInRangeWithCount(sessionId, startOrder, endOrder, pageSize, 0);
        if (range.total <= pageSize) {
            const resolved = resolveTavernContextWindow({
                messages: range.messages,
                contextWindowStartOrder: startOrder,
                currentUserMessage: input.currentUserMessage,
            });
            if (resolved.contextWindowStartOrder >= startOrder) {
                return resolved;
            }
        }
    }

    const collected = new Map<number, TavernMessageRecord>();
    let offset = 0;
    let finiteRangeTotal: number | null = null;
    let finiteRangeLoadedFromEnd = 0;
    let total = 0;
    while (true) {
        let page: { messages: TavernMessageRecord[]; total: number };
        if (finiteBefore) {
            if (finiteRangeTotal === null) {
                const probe = await listTavernMessagesInRangeWithCount(sessionId, 0, endOrder, 1, 0);
                finiteRangeTotal = probe.total;
            }
            const remaining = Math.max(0, finiteRangeTotal - finiteRangeLoadedFromEnd);
            const limit = Math.min(pageSize, remaining);
            const offsetFromStart = Math.max(0, finiteRangeTotal - finiteRangeLoadedFromEnd - limit);
            page = limit > 0
                ? await listTavernMessagesInRangeWithCount(sessionId, 0, endOrder, limit, offsetFromStart)
                : { messages: [], total: finiteRangeTotal };
            finiteRangeLoadedFromEnd += page.messages.length;
        } else {
            page = await listLatestTavernMessagesWithCount(sessionId, pageSize, offset);
            offset += pageSize;
        }
        total = page.total;
        page.messages.forEach((message) => collected.set(message.order, message));
        const messages = [...collected.values()].sort((left, right) => left.order - right.order);
        if (messages.length >= total || countUsableContextWindowMessages(messages) >= targetUsable) {
            return resolveTavernContextWindow({
                messages,
                contextWindowStartOrder: startOrder,
                currentUserMessage: input.currentUserMessage,
            });
        }
        if (!page.messages.length) {
            return resolveTavernContextWindow({
                messages,
                contextWindowStartOrder: startOrder,
                currentUserMessage: input.currentUserMessage,
            });
        }
    }
}
