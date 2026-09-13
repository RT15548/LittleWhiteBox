import { MESSAGE_LIMITS as LIMIT, type MessagePayload, type MessagesDomainV2 } from './types.js';
import { messageReceipt } from './receipt.js';
import { parseImageAttachment } from './image-attachment.js';
import { applyMessageMutation } from './mutation.js';

export function record(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function messageString(value: unknown, max: number, allowEmpty = false): string {
    if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || value.length > max
        || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) {
        throw new Error('messages_invalid_text');
    }
    return value;
}

export function parsePayload(value: unknown): MessagePayload {
    if (!record(value)) {throw new Error('messages_invalid_payload');}
    const allowed = value.type === 'text' ? ['type', 'text']
        : value.type === 'image' ? ['type', 'description', 'generationPrompt', 'attachment']
            : value.type === 'voice' ? ['type', 'transcript', 'emotion'] : [];
    if (Object.keys(value).some(key => !allowed.includes(key))) {throw new Error('messages_invalid_payload');}
    if (value.type === 'text') {return { type: 'text', text: messageString(value.text, LIMIT.body) };}
    if (value.type === 'image') {
        if (value.attachment !== undefined) {
            if (value.generationPrompt !== undefined) {throw new Error('messages_invalid_image');}
            return { type: 'image', description: messageString(value.description, LIMIT.body, true), attachment: parseImageAttachment(value.attachment) };
        }
        return { type: 'image', description: messageString(value.description, LIMIT.body),
            ...(value.generationPrompt === undefined ? {} : { generationPrompt: messageString(value.generationPrompt, LIMIT.body) }) };
    }
    if (value.type === 'voice') {
        return { type: 'voice', transcript: messageString(value.transcript, LIMIT.body),
            ...(value.emotion === undefined ? {} : { emotion: messageString(value.emotion, 120) }) };
    }
    throw new Error('messages_invalid_payload');
}

function integer(value: unknown, min = 0): asserts value is number {
    if (!Number.isSafeInteger(value) || Number(value) < min) {throw new Error('messages_invalid_integer');}
}

/** Validate at the storage boundary; no migrations or runtime cleanup of old models. */
export function validateMessages(value: unknown): asserts value is MessagesDomainV2 {
    if (!record(value) || value.version !== 2 || !Array.isArray(value.contacts)
        || !Array.isArray(value.messages) || !Array.isArray(value.segments)) {throw new Error('messages_invalid_domain');}
    integer(value.nextSeq, 1);
    if (value.contacts.length > LIMIT.contacts || value.messages.length > LIMIT.messages
        || value.segments.length > LIMIT.segments || JSON.stringify(value).length > LIMIT.serialized) {
        throw new Error('messages_capacity');
    }
    const contacts = new Set<string>();
    for (const item of value.contacts) {
        if (!record(item)) {throw new Error('messages_invalid_contact');}
        const id = messageString(item.id, 160);
        if (contacts.has(id)) {throw new Error('messages_duplicate_id');}
        contacts.add(id);
        messageString(item.name, LIMIT.name); messageString(item.note, LIMIT.note, true); integer(item.createdAt);
        if (item.createdAt > 8_640_000_000_000_000) {throw new Error('messages_invalid_date');}
        if (item.summary !== null) {
            if (!record(item.summary)) {throw new Error('messages_invalid_summary');}
            integer(item.summary.throughSeq, 1); messageString(item.summary.text, LIMIT.summary);
        }
    }
    const messages = new Map<string, MessagesDomainV2['messages'][number]>();
    let previousSeq = 0;
    for (const item of value.messages) {
        if (!record(item)) {throw new Error('messages_invalid_message');}
        const id = messageString(item.id, 160);
        integer(item.seq, previousSeq + 1); previousSeq = item.seq;
        if (messages.has(id) || !contacts.has(String(item.contactId)) || item.seq >= value.nextSeq) {throw new Error('messages_invalid_reference');}
        integer(item.createdAt); messageString(item.from, LIMIT.name); messageString(item.to, LIMIT.name);
        if (item.createdAt > 8_640_000_000_000_000) {throw new Error('messages_invalid_date');}
        parsePayload(item.payload);
        if (item.sender === 'user') {
            if (item.replyTo !== null) {throw new Error('messages_invalid_reply');}
        } else if (item.sender === 'contact') {
            // Deleting an uploaded image preserves replies, without a dangling reference.
            if (item.replyTo !== null) {
                const input = typeof item.replyTo === 'string' ? messages.get(item.replyTo) : undefined;
                if (!input || input.sender !== 'user' || input.contactId !== item.contactId) {throw new Error('messages_invalid_reply');}
            }
        } else {throw new Error('messages_invalid_sender');}
        messages.set(id, item as unknown as MessagesDomainV2['messages'][number]);
    }
    const segments = new Set<string>();
    for (const item of value.segments) {
        if (!record(item) || !Array.isArray(item.messageIds) || !item.messageIds.length
            || typeof item.sealed !== 'boolean' || typeof item.recovered !== 'boolean') {throw new Error('messages_invalid_segment');}
        const id = messageString(item.id, 160);
        if (segments.has(id)) {throw new Error('messages_duplicate_segment');}
        segments.add(id);
        const members = new Set<string>();
        for (const key of item.messageIds) {
            const message = messages.get(key);
            if (!message || members.has(key)) {throw new Error('messages_invalid_segment_member');}
            members.add(key);
        }
        if (item.receipt !== null) {
            if (!record(item.receipt) || typeof item.receipt.digest !== 'string'
                || !/^[a-f0-9]{64}$/u.test(item.receipt.digest)) {throw new Error('messages_invalid_receipt');}
            integer(item.receipt.throughSeq, 1);
            if (item.receipt.throughSeq >= value.nextSeq) {throw new Error('messages_invalid_receipt');}
        }
    }
    for (const contact of value.contacts) {
        if (contact.summary && !value.messages.some(m => m.contactId === contact.id && m.seq === contact.summary.throughSeq)) {
            throw new Error('messages_invalid_summary_range');
        }
    }
    // Validate after all shapes/dates/members, before publishing any loaded data.
    const state = value as unknown as MessagesDomainV2;
    for (const segment of state.segments) {
        if (!segment.receipt) {continue;}
        const members = segment.messageIds.map(id => messages.get(id)!);
        const expected = messageReceipt({ messages: members }, segment, segment.receipt.throughSeq);
        if (!expected || expected.throughSeq !== segment.receipt.throughSeq || expected.digest !== segment.receipt.digest) {
            throw new Error('messages_invalid_receipt');
        }
    }
    if (value.pendingMutation !== null) {
        const mutation = value.pendingMutation;
        if (!record(mutation) || !['delete', 'delete-contact', 'regenerate'].includes(String(mutation.kind))
            || !Array.isArray(mutation.removeIds) || !mutation.removeIds.length
            || new Set(mutation.removeIds).size !== mutation.removeIds.length
            || !Array.isArray(mutation.replacements) || mutation.replacements.length > LIMIT.replies
            || typeof mutation.baseDigest !== 'string' || !/^[a-f0-9]{64}$/u.test(mutation.baseDigest)
            || typeof mutation.prefixDigest !== 'string' || !/^[a-f0-9]{64}$/u.test(mutation.prefixDigest)) {throw new Error('messages_invalid_mutation');}
        messageString(mutation.id, 160); integer(mutation.index);
        const removeIds = mutation.removeIds;
        const segment = state.segments.find(segment => segment.id === mutation.segmentId);
        const removed = mutation.removeIds.map(id => messages.get(id));
        if (!segment || removed.some(message => !message || message.contactId !== mutation.contactId)
            || segment.receipt?.throughSeq !== segment.messageIds.reduce((max, id) => Math.max(max, messages.get(id)!.seq), 0)
            || mutation.removeIds.some(id => !segment.messageIds.includes(id)
                || state.segments.some(other => other !== segment && other.messageIds.includes(id)))) {throw new Error('messages_invalid_mutation_target');}
        if (mutation.kind !== 'regenerate' && (mutation.replacements.length || mutation.summary !== null)) {throw new Error('messages_invalid_mutation');}
        if (mutation.kind === 'delete' && removed.length !== 1) {throw new Error('messages_invalid_mutation');}
        if (mutation.kind === 'delete-contact' && state.messages.some(message => message.contactId === mutation.contactId && !removeIds.includes(message.id))) {throw new Error('messages_invalid_mutation');}
        if (mutation.kind === 'regenerate') {
            const last = state.messages.filter(message => message.contactId === mutation.contactId).at(-1);
            const inputId = removed[0]!.replyTo;
            if (!mutation.replacements.length || !inputId || !last || !mutation.removeIds.includes(last.id)
                || removed.some(message => message!.sender !== 'contact' || message!.replyTo !== inputId)
                || state.messages.some(message => message.replyTo === inputId && !removeIds.includes(message.id))) {throw new Error('messages_invalid_mutation');}
            if (mutation.replacements.some(message => !record(message) || messages.has(String(message.id))
                || Number(message.seq) <= previousSeq || message.contactId !== mutation.contactId
                || message.sender !== 'contact' || message.replyTo !== inputId)) {throw new Error('messages_invalid_mutation_reply');}
        }
        const candidate = structuredClone(state);
        applyMessageMutation(candidate, state.pendingMutation!);
        validateMessages(candidate);
    }
}
