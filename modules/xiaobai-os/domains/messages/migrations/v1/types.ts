import type { MessageImageAttachment } from './image-attachment.js';

export type MessagePayload =
    | { type: 'text'; text: string }
    | { type: 'image'; description: string; generationPrompt?: string; attachment?: MessageImageAttachment }
    | { type: 'voice'; transcript: string; emotion?: string };

export interface MessageContact {
    id: string;
    name: string;
    note: string;
    createdAt: number;
    summary: { throughSeq: number; text: string } | null;
}

export interface PrivateMessage {
    id: string;
    seq: number;
    contactId: string;
    sender: 'user' | 'contact';
    from: string;
    to: string;
    createdAt: number;
    /** Null for outgoing messages, or when the triggering image was deleted. */
    replyTo: string | null;
    payload: MessagePayload;
}

export interface MessageSegment {
    id: string;
    messageIds: string[];
    sealed: boolean;
    recovered: boolean;
    receipt: { throughSeq: number; digest: string } | null;
}

export interface MessagesDomainV1 {
    version: 1;
    nextSeq: number;
    contacts: MessageContact[];
    messages: PrivateMessage[];
    segments: MessageSegment[];
}

export const MESSAGE_LIMITS = Object.freeze({
    name: 120, note: 600, body: 4000, replies: 16, contacts: 300,
    messages: 30000, segments: 10000, summary: 6000, serialized: 12_000_000,
});

export function emptyMessages(): MessagesDomainV1 {
    return { version: 1, nextSeq: 1, contacts: [], messages: [], segments: [] };
}

export function payloadText(payload: MessagePayload): string {
    if (payload.type === 'image' && payload.attachment) {
        return [payload.description, `［附图：${payload.attachment.name}］`].filter(Boolean).join('\n');
    }
    return payload.type === 'text' ? payload.text : payload.type === 'image' ? payload.description : payload.transcript;
}
