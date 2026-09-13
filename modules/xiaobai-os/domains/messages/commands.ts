import { messageString, parsePayload, validateMessages } from './invariants.js';
import { MESSAGE_LIMITS as LIMIT, type MessageContact, type MessagePayload, type MessagesDomainV2, type PrivateMessage } from './types.js';

export function addContact(state: MessagesDomainV2, contact: MessageContact): void {
    messageString(contact.id, 160); messageString(contact.name, LIMIT.name); messageString(contact.note, LIMIT.note, true);
    const existing = state.contacts.find(item => item.id === contact.id);
    if (existing) {
        if (existing.name !== contact.name || existing.note !== contact.note) {throw new Error('messages_action_conflict');}
        return;
    }
    if (state.contacts.some(item => item.name.normalize('NFKC').toLocaleLowerCase() === contact.name.normalize('NFKC').toLocaleLowerCase())) {
        throw new Error('messages_contact_exists');
    }
    state.contacts.push(structuredClone(contact));
    validateMessages(state);
}

export function appendMessages(state: MessagesDomainV2, input: {
    segmentId: string; contactId: string; playerName: string; replyTo: string | null;
    entries: { id: string; payload: MessagePayload }[]; createdAt: number;
}): PrivateMessage[] {
    const contact = state.contacts.find(item => item.id === input.contactId);
    if (!contact) {throw new Error('messages_contact_missing');}
    if (!input.entries.length || input.entries.length > LIMIT.replies || (!input.replyTo && input.entries.length !== 1)) {
        throw new Error('messages_invalid_batch');
    }
    const existing = input.entries.map(entry => state.messages.find(item => item.id === entry.id));
    if (existing.some(Boolean)) {
        if (!existing.every((message, index) => message && message.contactId === input.contactId
            && message.replyTo === input.replyTo && JSON.stringify(message.payload) === JSON.stringify(input.entries[index].payload))) {
            throw new Error('messages_action_conflict');
        }
        return existing as PrivateMessage[];
    }
    if (input.replyTo && state.messages.some(item => item.replyTo === input.replyTo)) {throw new Error('messages_already_replied');}
    let segment = state.segments.find(item => item.id === input.segmentId);
    if (!segment) {
        segment = { id: input.segmentId, messageIds: [], sealed: false, recovered: false, receipt: null };
        state.segments.push(segment);
    }
    if (segment.sealed) {throw new Error('messages_segment_sealed');}
    const added = input.entries.map(entry => ({
        id: entry.id, seq: state.nextSeq++, contactId: input.contactId,
        sender: input.replyTo ? 'contact' as const : 'user' as const,
        from: input.replyTo ? contact.name : input.playerName,
        to: input.replyTo ? input.playerName : contact.name,
        replyTo: input.replyTo, createdAt: input.createdAt, payload: parsePayload(entry.payload),
    }));
    state.messages.push(...added);
    segment.messageIds.push(...added.map(item => item.id));
    validateMessages(state);
    return added;
}
