import type { MessageContact, MessagePayload, PrivateMessage } from '../../domains/messages/types.js';
import type { XiaobaiOsFileState } from '../../kernel/contracts.js';
import type { OutgoingMessage } from './application/image-upload.js';
import type { MessagePermission } from './application/modifications.js';

export interface MessagesSettings { imagePrompt: boolean; voicePrompt: boolean; syncNoticeEnabled: boolean }

/** In-flight input only; never serialized into the messages partition. */
export interface PendingOutgoingMessage {
    contactId: string; messageId: string; payload: OutgoingMessage; createdAt: number;
}
export interface MessageSendFailure { contactId: string; messageId: string; message: string }
/** Live reply stream for display only; never stored, summarized or projected. */
export interface MessageReplyPreview { characterState: string; characterStateDone: boolean; replies: MessagePayload[] }

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
    recoveryBlocked: boolean;
    operationPending: boolean;
    pendingModification: boolean;
    revision: string;
    boundary: number;
    busy: { contactId: string; messageId: string; stage: string; preview: MessageReplyPreview | null } | null;
    outgoing: PendingOutgoingMessage | null;
    sendFailure: MessageSendFailure | null;
    generationActive: boolean;
    syncNotice: { messageIds: string[]; error: string };
    error: string;
    media: { image: boolean; voice: boolean };
}
