import type { TavernMessageRecord } from '../../../shared/session-db';

export interface TavernPersistedChatTimelineItem {
    kind: 'persisted';
    key: string;
    message: TavernMessageRecord;
}

export interface TavernPendingUserChatTimelineItem {
    kind: 'pending-user';
    key: 'pending:user';
}

export interface TavernAssistantChatTimelineItem {
    kind: 'assistant';
    key: string;
    message: TavernMessageRecord | null;
    streaming: boolean;
}

export type TavernChatTimelineItem =
    | TavernPersistedChatTimelineItem
    | TavernPendingUserChatTimelineItem
    | TavernAssistantChatTimelineItem;

export interface BuildTavernChatTimelineOptions {
    messages: readonly TavernMessageRecord[];
    messageKey: (message: TavernMessageRecord) => string;
    pendingUserVisible: boolean;
    liveAssistantVisible: boolean;
    liveAssistantKey: string;
}

export interface BuildTavernMessageDisplayDepthsOptions {
    messages: readonly TavernMessageRecord[];
    sessionId: string;
    liveAssistantKey: string;
    messageKey: (message: TavernMessageRecord) => string;
    isDisplayMessage: (message: TavernMessageRecord) => boolean;
}

function timelineOrderFromKey(key: string, sessionId: string): number | null {
    const prefix = `${sessionId}:`;
    if (!sessionId || !key.startsWith(prefix)) {return null;}
    const order = Number(key.slice(prefix.length));
    return Number.isInteger(order) && order >= 0 ? order : null;
}

export function buildTavernChatTimeline(options: BuildTavernChatTimelineOptions): TavernChatTimelineItem[] {
    const liveAssistantKey = String(options.liveAssistantKey || '').trim();
    const hasLiveAssistant = options.liveAssistantVisible && !!liveAssistantKey;
    let liveAssistantAlreadyPersisted = false;

    const items = options.messages.map<TavernChatTimelineItem>((message) => {
        const key = options.messageKey(message);
        if (message.role !== 'assistant') {
            return { kind: 'persisted', key, message };
        }
        const streaming = hasLiveAssistant && key === liveAssistantKey;
        liveAssistantAlreadyPersisted ||= streaming;
        return { kind: 'assistant', key, message, streaming };
    });

    if (options.pendingUserVisible) {
        items.push({ kind: 'pending-user', key: 'pending:user' });
    }
    if (hasLiveAssistant && !liveAssistantAlreadyPersisted) {
        items.push({
            kind: 'assistant',
            key: liveAssistantKey,
            message: null,
            streaming: true,
        });
    }
    return items;
}

export function buildTavernMessageDisplayDepths(options: BuildTavernMessageDisplayDepthsOptions): Record<string, number> {
    const sessionId = String(options.sessionId || '').trim();
    const messages = options.messages.filter((message) => message.sessionId === sessionId);
    const latestPersistedOrder = messages.reduce((latest, message) => {
        const order = Number(message.order);
        return Number.isInteger(order) && order >= 0 ? Math.max(latest, order) : latest;
    }, -1);
    const liveAssistantOrder = timelineOrderFromKey(String(options.liveAssistantKey || '').trim(), sessionId) ?? -1;
    const latestLogicalOrder = Math.max(latestPersistedOrder, liveAssistantOrder);

    return messages.reduce<Record<string, number>>((depths, message) => {
        if (!options.isDisplayMessage(message)) {return depths;}
        const order = Number(message.order);
        depths[options.messageKey(message)] = Number.isInteger(order)
            ? Math.max(0, latestLogicalOrder - order)
            : 0;
        return depths;
    }, {});
}
