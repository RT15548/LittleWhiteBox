import { messageReceipt } from './receipt.js';
import type { MessageMutation, MessagesDomainV2 } from './types.js';

/** Domain-only delta application. Authorization and durable native writes live above it. */
export function applyMessageMutation(state: MessagesDomainV2, mutation: MessageMutation): void {
    const removed = new Set(mutation.removeIds);
    const affected = state.messages.filter(message => removed.has(message.id));
    for (const segment of state.segments) {
        const first = segment.messageIds.findIndex(id => removed.has(id));
        if (first < 0) {continue;}
        const ids = segment.messageIds.filter(id => !removed.has(id));
        if (segment.id === mutation.segmentId) {ids.splice(first, 0, ...mutation.replacements.map(message => message.id));}
        segment.messageIds = ids;
        segment.receipt = null;
    }
    state.messages = state.messages.filter(message => !removed.has(message.id));
    state.messages.push(...structuredClone(mutation.replacements));
    for (const message of state.messages) {
        if (message.replyTo && removed.has(message.replyTo)) {message.replyTo = null;}
    }
    for (const contact of state.contacts) {
        if (contact.summary && affected.some(message => message.contactId === contact.id && message.seq <= contact.summary!.throughSeq)) {contact.summary = null;}
        if (mutation.kind === 'regenerate' && contact.id === mutation.contactId) {contact.summary = structuredClone(mutation.summary);}
    }
    if (mutation.kind === 'delete-contact') {state.contacts = state.contacts.filter(contact => contact.id !== mutation.contactId);}
    state.segments = state.segments.filter(segment => segment.messageIds.length);
    // The confirmed mutation replaces the entire native projection, not an append receipt.
    for (const segment of state.segments) {
        if (segment.id === mutation.segmentId) {segment.receipt = messageReceipt(state, segment, Infinity);}
    }
    state.pendingMutation = null;
}
