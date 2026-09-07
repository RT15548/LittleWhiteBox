import type { MessageContact, PrivateMessage } from '../../domains/messages/types.js';
import type { XiaobaiOsFileState } from '../../kernel/contracts.js';
import type { OutgoingMessage } from './application/image-upload.js';

/** In-flight input only; never serialized into the messages partition. */
export interface PendingOutgoingMessage {
    contactId: string; messageId: string; payload: OutgoingMessage; createdAt: number;
}
export interface MessageSendFailure { contactId: string; messageId: string; message: string }

export interface ContactView extends Omit<MessageContact, 'summary'> {
    preview: string;
    lastSeq: number;
    lastAt: number | null;
    lastMessageId: string | null;
}
export interface ThreadPage {
    contactId: string; messages: PrivateMessage[]; hasMore: boolean;
    retryMessageId: string | null;
}
export interface MessagesClientState {
    chatIdentity: string;
    contacts: ContactView[];
    knownPeople: { name: string; aliases: string[] }[];
    fileState: XiaobaiOsFileState;
    pendingSave: boolean;
    busy: { contactId: string; messageId: string; stage: string } | null;
    outgoing: PendingOutgoingMessage | null;
    sendFailure: MessageSendFailure | null;
    generationActive: boolean;
    unsynced: number;
    error: string;
    media: { image: boolean; voice: boolean };
}
