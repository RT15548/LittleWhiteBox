import type { MessageContact, PrivateMessage } from '../../domains/messages/types.js';
import type { XiaobaiOsFileState } from '../../kernel/contracts.js';
import type { OutgoingMessage } from './application/image-upload.js';
import type { MessagePermission } from './application/modifications.js';

export interface MessagesSettings { imagePrompt: boolean; voicePrompt: boolean }

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
    deleteReason: string;
}
export interface ThreadPage {
    contactId: string; messages: PrivateMessage[]; hasMore: boolean;
    retryMessageId: string | null;
    revision: string;
    permissions: Record<string, MessagePermission>;
    hasNewer: boolean;
}
export interface MessagesClientState {
    chatIdentity: string;
    settings: MessagesSettings;
    contacts: ContactView[];
    knownPeople: { name: string; aliases: string[] }[];
    fileState: XiaobaiOsFileState;
    pendingSave: boolean;
    pendingModification: boolean;
    revision: string;
    boundary: number;
    busy: { contactId: string; messageId: string; stage: string } | null;
    outgoing: PendingOutgoingMessage | null;
    sendFailure: MessageSendFailure | null;
    generationActive: boolean;
    unsynced: number;
    error: string;
    media: { image: boolean; voice: boolean };
}
