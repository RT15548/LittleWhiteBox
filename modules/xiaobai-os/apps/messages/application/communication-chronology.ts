import type { MessageSegment, PrivateMessage } from '../../../domains/messages/types.js';
import { projectionMarker, type ChatMessage } from './projection.js';

export interface CommunicationStage {
    firstSeq: number;
    throughSeq: number;
    /** One-based last ordinary story floor before these messages; zero is the beginning. */
    afterStoryFloor: number | null;
    breakBefore: { kind: 'story'; fromFloor: number; throughFloor: number } | { kind: 'unplaced' } | null;
}

/** Request-local chronology. Projection membership supplies placement, never wall-clock timestamps. */
export function projectCommunicationChronology(
    segments: readonly MessageSegment[], chat: readonly ChatMessage[],
    history: readonly PrivateMessage[], incoming: PrivateMessage,
): CommunicationStage[] {
    const locations = new Map<string, { afterStoryFloor: number; throughSeq: number } | null>();
    const nextStoryFloor = new Map<number, number>();
    let storyFloor = 0;
    for (const [index, message] of chat.entries()) {
        const marker = projectionMarker(message);
        if (marker) {
            locations.set(marker.segmentId, locations.has(marker.segmentId) ? null
                : { afterStoryFloor: storyFloor, throughSeq: marker.throughSeq });
        } else if (message.is_system !== true && typeof message.mes === 'string' && message.mes.trim()) {
            nextStoryFloor.set(storyFloor, index + 1);
            storyFloor = index + 1;
        }
    }
    // Recovery is a later re-recording, not evidence of when its old messages happened.
    const origins = new Map<string, MessageSegment>();
    for (const segment of segments) {
        for (const id of segment.messageIds) {
            if (!origins.has(id) || origins.get(id)!.recovered && !segment.recovered) {origins.set(id, segment);}
        }
    }
    const stages: CommunicationStage[] = [];
    let previousKey: string | undefined;
    for (const message of [...history, incoming]) {
        const origin = origins.get(message.id);
        const location = origin && !origin.recovered ? locations.get(origin.id) : null;
        // The reply takes place now, including an unsent preview or retry of an older input.
        const afterStoryFloor = message === incoming ? storyFloor
            : location && message.seq <= location.throughSeq ? location.afterStoryFloor : null;
        const key = afterStoryFloor === null ? `unplaced:${origin?.id ?? message.id}` : `story:${afterStoryFloor}`;
        const previous = stages.at(-1);
        if (previous && key === previousKey) {previous.throughSeq = message.seq; continue;}
        const fromFloor = previous?.afterStoryFloor === null ? undefined : nextStoryFloor.get(previous?.afterStoryFloor ?? -1);
        const breakBefore = !previous ? null
            : afterStoryFloor !== null && fromFloor !== undefined && fromFloor <= afterStoryFloor
                ? { kind: 'story' as const, fromFloor, throughFloor: afterStoryFloor }
                : { kind: 'unplaced' as const };
        stages.push({ firstSeq: message.seq, throughSeq: message.seq, afterStoryFloor, breakBefore });
        previousKey = key;
    }
    return stages;
}
