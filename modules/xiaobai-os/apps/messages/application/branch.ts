import { sha256 } from 'js-sha256';
import { validateMessages } from '../../../domains/messages/invariants.js';
import { messageReceipt } from '../../../domains/messages/receipt.js';
import type { MessagesDomainV2 } from '../../../domains/messages/types.js';
import { projectionMarker, type ChatMessage } from './projection.js';
import { applyMessageMutation } from '../../../domains/messages/mutation.js';
import { hasMutationBase, hasMutationResult, mutationResult } from './mutation-evidence.js';

/** Copies inherit the result evidenced by their floors, never an executable parent operation. */
export function resolveCopiedMessages(source: MessagesDomainV2, childChat: readonly ChatMessage[]): MessagesDomainV2 {
    const next = structuredClone(source);
    const mutation = next.pendingMutation;
    if (mutation) {
        const result = mutationResult(next, mutation);
        const applied = hasMutationResult(childChat, mutation, result);
        if (applied) {applyMessageMutation(next, mutation);}
        const segment = next.segments.find(segment => segment.id === mutation.segmentId);
        if (segment && !hasMutationBase(childChat, mutation)
            && !(applied && result && childChat.length === mutation.index + 1)) {segment.sealed = true;}
    }
    next.pendingMutation = null;
    validateMessages(next);
    return next;
}

/** Only native evidence present in the child may carry parent communications into it. */
export function branchMessages(source: MessagesDomainV2, childChat: readonly ChatMessage[]): MessagesDomainV2 {
    validateMessages(source);
    source = resolveCopiedMessages(source, childChat);
    const segments = new Set(source.segments.map(segment => segment.id));
    let through = 0;
    for (const floor of childChat) {
        const marker = projectionMarker(floor);
        if (!marker || !segments.has(marker.segmentId) || marker.throughSeq >= source.nextSeq
            || typeof floor.mes !== 'string' || sha256(floor.mes) !== marker.digest) {continue;}
        through = Math.max(through, marker.throughSeq);
    }
    const next = structuredClone(source);
    next.messages = next.messages.filter(message => message.seq <= through);
    const ids = new Set(next.messages.map(message => message.id));
    const messages = new Map(next.messages.map(message => [message.id, message]));
    const contacts = new Set(next.messages.map(message => message.contactId));
    next.contacts = next.contacts.filter(contact => contacts.has(contact.id)).map(contact => ({
        ...contact, note: '', summary: null,
    }));
    // Parent-side edits to notes/summaries have no historical version. Rebuild
    // continuity from retained originals, never carry an unverifiable snapshot.
    next.segments = next.segments.flatMap(segment => {
        segment.messageIds = segment.messageIds.filter(id => ids.has(id));
        if (!segment.messageIds.length) {return [];}
        segment.sealed = true;
        segment.receipt = segment.receipt ? messageReceipt({ messages: segment.messageIds.map(id => messages.get(id)!) }, segment, Math.min(through, segment.receipt.throughSeq)) : null;
        return [segment];
    });
    // Never reuse sequence numbers that can still occur in inherited floor markers.
    validateMessages(next);
    return next;
}
