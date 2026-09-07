import { sha256 } from 'js-sha256';
import type { MessageSegment } from '../../../domains/messages/types.js';
import type { MessagesService } from './service.js';
import { projectionMarker, unsyncedIds, type ChatMessage, type ProjectionMarker } from './projection.js';
import { projectionText } from '../../../domains/messages/transcript.js';

export interface MessagesChatPort {
    identity(): string;
    messages(): readonly ChatMessage[];
    finalizedThrough(): number;
    publish(input: { identity: string; index: number | null; text: string; marker: ProjectionMarker; guard: () => boolean }): Promise<boolean>;
    confirm(identity: string, marker: ProjectionMarker, text: string): Promise<boolean>;
    releaseConfirmation(identity: string, marker: ProjectionMarker): void;
}

export function createMessagesTimeline(service: MessagesService, chat: MessagesChatPort, id: () => string) {
    const createdHere = new Set<string>();
    const observedClosed = new Set<string>();

    function matching(segmentId: string) {
        return chat.messages().flatMap((message, index) => projectionMarker(message)?.segmentId === segmentId ? [{ message, index }] : []);
    }

    function intact(segment: MessageSegment): boolean {
        if (segment.sealed || observedClosed.has(segment.id)) {return false;}
        const matches = matching(segment.id);
        if (!matches.length) {return !segment.receipt && createdHere.has(segment.id);}
        if (matches.length !== 1 || matches[0].index !== chat.messages().length - 1) {return false;}
        if (matches[0].index <= chat.finalizedThrough()) {return false;}
        const { message } = matches[0];
        const marker = projectionMarker(message)!;
        return message.is_user === false && message.is_system === false
            && message.mes === projectionText(service.current(), segment, marker.throughSeq)
            && (!segment.receipt || marker.throughSeq >= segment.receipt.throughSeq);
    }

    /** Called synchronously on external message events, before asynchronous persistence. */
    function observe(): string[] {
        const closed = service.current().segments.filter(segment => !segment.sealed && !intact(segment)).map(segment => segment.id);
        closed.forEach(key => observedClosed.add(key));
        return closed;
    }

    async function seal(ids: string[], guard: () => boolean): Promise<void> {
        if (!ids.length) {return;}
        await service.change(state => {for (const segment of state.segments) {if (ids.includes(segment.id)) {segment.sealed = true;}}}, guard);
    }

    async function select(guard: () => boolean): Promise<string> {
        await seal(observe(), guard);
        const open = service.current().segments.filter(segment => intact(segment)).at(-1);
        if (open) {return open.id;}
        const next = id(); createdHere.add(next); return next;
    }

    async function receipt(segmentId: string, marker: ProjectionMarker, guard: () => boolean): Promise<void> {
        const identity = chat.identity();
        await service.change(state => {
            const segment = state.segments.find(item => item.id === segmentId);
            if (segment && marker.throughSeq >= (segment.receipt?.throughSeq ?? 0)) {
                segment.receipt = { throughSeq: marker.throughSeq, digest: marker.digest };
            }
        }, guard);
        chat.releaseConfirmation(identity, marker);
    }

    async function sync(segmentId: string, guard: () => boolean): Promise<void> {
        if (!guard()) {throw new Error('messages_boundary_changed');}
        const identity = chat.identity();
        const state = service.current();
        const segment = state.segments.find(item => item.id === segmentId);
        if (!segment) {throw new Error('messages_segment_missing');}
        const matches = matching(segmentId);
        // First reconcile a committed chat write whose sidecar receipt was interrupted.
        if (matches.length === 1) {
            const { message } = matches[0];
            const marker = projectionMarker(message)!;
            const expected = projectionText(state, segment, marker.throughSeq);
            if (message.mes === expected && sha256(expected) === marker.digest
                && marker.throughSeq > (segment.receipt?.throughSeq ?? 0)
                && await chat.confirm(identity, marker, expected)) {
                if (!guard()) {throw new Error('messages_boundary_changed');}
                await receipt(segmentId, marker, guard);
            }
        }
        const current = service.current().segments.find(item => item.id === segmentId)!;
        const members = state.messages.filter(item => segment.messageIds.includes(item.id));
        const throughSeq = members.at(-1)?.seq ?? 0;
        if ((current.receipt?.throughSeq ?? 0) >= throughSeq) {
            if (current.receipt) {chat.releaseConfirmation(identity, { version: 1, segmentId, ...current.receipt });}
            return;
        }
        if (!intact(current)) {
            await seal([segmentId], guard);
            throw new Error('messages_projection_closed');
        }
        const text = projectionText(state, segment);
        const marker: ProjectionMarker = { version: 1, segmentId, throughSeq, digest: sha256(text) };
        if (!guard() || !intact(current)) {throw new Error('messages_boundary_changed');}
        const confirmed = await chat.publish({ identity, index: matches[0]?.index ?? null, text, marker, guard });
        if (!confirmed) {throw new Error('messages_projection_unconfirmed');}
        if (!guard()) {return;} // confirmed fact stays in its original chat; recover receipt next time.
        await receipt(segmentId, marker, guard);
    }

    async function recover(guard: () => boolean): Promise<void> {
        const initiallyMissing = new Set(unsyncedIds(service.current()));
        for (const segment of service.current().segments) {
            if (!segment.messageIds.some(id => initiallyMissing.has(id))) {continue;}
            try {await sync(segment.id, guard);} catch (error) {
                // Network/save failures are not proof that a prior write is absent.
                // Only a closed/ambiguous original timepoint may be explicitly re-recorded.
                if (!guard() || service.pending() || !(error instanceof Error)
                    || error.message !== 'messages_projection_closed') {throw error;}
            }
        }
        const missing = unsyncedIds(service.current());
        if (!missing.length) {return;}
        const segmentId = id(); createdHere.add(segmentId);
        await service.change(state => {
            state.segments.forEach(segment => {segment.sealed = true;});
            state.segments.push({ id: segmentId, messageIds: missing, sealed: false, recovered: true, receipt: null });
        }, guard);
        await sync(segmentId, guard);
    }

    return { select, sync, recover, observe, seal, intact, reset() {createdHere.clear(); observedClosed.clear();} };
}

export type MessagesTimeline = ReturnType<typeof createMessagesTimeline>;
