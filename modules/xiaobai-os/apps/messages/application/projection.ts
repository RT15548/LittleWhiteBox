import type { MessagesDomainV2 } from '../../../domains/messages/types.js';

export const PRIVATE_MESSAGE_MARKER = 'xiaobai_private_messages';
export interface ProjectionMarker { version: 1; segmentId: string; throughSeq: number; digest: string }
export interface ChatMessage {
    mes?: string; name?: string; is_user?: boolean; is_system?: boolean;
    extra?: Record<string, unknown>;
    [key: string]: unknown;
}

export function projectionMarker(message: ChatMessage | undefined): ProjectionMarker | null {
    const value = message?.extra?.[PRIVATE_MESSAGE_MARKER];
    if (!value || typeof value !== 'object') {return null;}
    const marker = value as ProjectionMarker;
    return marker.version === 1 && typeof marker.segmentId === 'string' && !!marker.segmentId
        && Number.isSafeInteger(marker.throughSeq) && marker.throughSeq > 0
        && typeof marker.digest === 'string' && /^[a-f0-9]{64}$/u.test(marker.digest) ? marker : null;
}

export function unsyncedIds(state: MessagesDomainV2): string[] {
    const synced = new Set<string>();
    const messages = new Map(state.messages.map(message => [message.id, message]));
    for (const segment of state.segments) {
        for (const id of segment.messageIds) {
            const message = messages.get(id);
            if (message && message.seq <= (segment.receipt?.throughSeq ?? 0)) {synced.add(id);}
        }
    }
    return state.messages.filter(item => !synced.has(item.id)).map(item => item.id);
}
