import { sha256 } from 'js-sha256';
import { applyMessageMutation } from '../../../domains/messages/mutation.js';
import { projectionText } from '../../../domains/messages/transcript.js';
import type { MessageMutation, MessagesDomainV2 } from '../../../domains/messages/types.js';
import { projectionMarker, type ChatMessage, type ProjectionMarker } from './projection.js';

export const floorDigest = (floor: ChatMessage) => sha256(JSON.stringify(floor));
export const prefixDigest = (floors: readonly ChatMessage[], end: number) => sha256(JSON.stringify(floors.slice(0, end)));

export function mutationResult(state: MessagesDomainV2, mutation: MessageMutation): { text: string; marker: ProjectionMarker } | null {
    const next = structuredClone(state);
    applyMessageMutation(next, mutation);
    const segment = next.segments.find(segment => segment.id === mutation.segmentId);
    if (!segment) {return null;}
    return { text: projectionText(next, segment), marker: { version: 1, segmentId: segment.id, ...segment.receipt! } };
}

export function hasMutationResult(floors: readonly ChatMessage[], mutation: MessageMutation, result: ReturnType<typeof mutationResult>): boolean {
    const matches = floors.filter(floor => projectionMarker(floor)?.segmentId === mutation.segmentId);
    if (!result) {return !matches.length && floors.length >= mutation.index && prefixDigest(floors, mutation.index) === mutation.prefixDigest;}
    return matches.length === 1 && matches[0].is_user === false && matches[0].is_system === false
        && matches[0].mes === result.text && JSON.stringify(projectionMarker(matches[0])) === JSON.stringify(result.marker);
}

export function hasMutationBase(floors: readonly ChatMessage[], mutation: MessageMutation): boolean {
    const floor = floors[mutation.index];
    return floors.length === mutation.index + 1 && projectionMarker(floor)?.segmentId === mutation.segmentId
        && floor.is_user === false && floor.is_system === false && floorDigest(floor) === mutation.baseDigest
        && prefixDigest(floors, mutation.index) === mutation.prefixDigest;
}
