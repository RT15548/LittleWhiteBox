import { appendMessages } from '../../../domains/messages/commands.js';
import type { MessagePayload, PrivateMessage } from '../../../domains/messages/types.js';
import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import type { MessagesService } from './service.js';
import type { MessagesTimeline } from './timeline.js';
import type { MessagesContext } from '../host/context-adapter.js';
import { unsyncedIds } from './projection.js';
import { compileReplies, compileSummary } from '../prompt/reply-compiler.js';
import { buildReplyPrompt } from '../prompt/reply-prompt.js';
import { buildSummaryPrompt, summaryBatch } from '../prompt/thread-summary.js';
import { uploadedImageReference, type OutgoingMessage } from './image-upload.js';
import type { MessageImages } from '../host/image-attachments.js';

export interface SendDependencies {
    service: MessagesService; timeline: MessagesTimeline; context: MessagesContext;
    agent: Pick<XiaobaiOsAgentGateway, 'loadConfig' | 'openSession'>;
    images: MessageImages;
    playerName(): string; id(): string;
}

export class MessageSendError extends Error {
    constructor(readonly stage: string, cause: unknown) {
        super(cause instanceof Error ? cause.message : 'messages_send_failed', { cause });
    }
}

/** Owns ordering, not lifetime: the host supplies the captured chat/run guard. */
export async function sendPrivateMessage(deps: SendDependencies, input: {
    contactId: string; messageId: string; payload?: OutgoingMessage;
    guard: () => boolean; signal: AbortSignal; stage: (stage: string) => void;
}): Promise<void> {
    const { service, timeline, agent, context } = deps;
    const assertCurrent = () => {if (!input.guard() || input.signal.aborted) {throw new Error('messages_cancelled');}};
    assertCurrent();
    await service.refresh();
    assertCurrent();
    let payload: MessagePayload | undefined = input.payload?.type === 'image'
        ? { type: 'image', description: input.payload.description, attachment: uploadedImageReference(input.payload.upload) }
        : input.payload;
    if (!service.current().contacts.some(contact => contact.id === input.contactId)) {throw new Error('messages_contact_missing');}
    const segmentId = await timeline.select(input.guard);
    let incoming = service.current().messages.find(message => message.id === input.messageId);
    if (incoming) {
        if (incoming.contactId !== input.contactId || incoming.sender !== 'user'
            || payload && JSON.stringify(incoming.payload) !== JSON.stringify(payload)) {throw new Error('messages_action_conflict');}
    } else {
        if (!payload) {throw new Error('messages_input_missing');}
        if (input.payload?.type === 'image') {
            input.stage('uploading');
            const attachment = await deps.images.save(input.payload.upload, input.signal);
            assertCurrent();
            payload = { type: 'image', description: input.payload.description, attachment };
        }
        input.stage('saving');
        await service.change(state => appendMessages(state, { segmentId, contactId: input.contactId,
            playerName: deps.playerName(), replyTo: null, entries: [{ id: input.messageId, payload: payload! }], createdAt: Date.now() }), input.guard);
        incoming = service.current().messages.find(message => message.id === input.messageId)!;
    }
    assertCurrent();
    let phase = 'replying';
    const stage = (value: string) => {phase = value; input.stage(value);};
    async function reply() {
        if (service.current().messages.some(message => message.replyTo === incoming!.id)) {return;}
        const thread = service.current().messages.filter(message => message.contactId === input.contactId);
        if (thread.at(-1)?.id !== incoming!.id) {throw new Error('messages_thread_changed');}
        stage('replying');
        assertCurrent();
        const config = await agent.loadConfig();
        assertCurrent();
        const session = await agent.openSession(config);
        assertCurrent();
        if (!String(session.providerConfig.model ?? '').trim()) {throw new Error('messages_agent_not_configured');}
        let contact = service.current().contacts.find(person => person.id === input.contactId)!;
        const history = thread.filter(message => message.id !== incoming!.id);
        async function loadImages(messages: PrivateMessage[]) {
            const images = new Map<string, string>();
            for (const message of messages) {
                if (message.payload.type === 'image' && message.payload.attachment) {
                    images.set(message.id, await deps.images.load(message.payload.attachment, input.signal));
                    assertCurrent();
                }
            }
            return images;
        }
        let batch = summaryBatch(contact, history);
        while (batch.length) {
            stage('summarizing');
            const images = await loadImages(batch);
            const response = await session.run({ ...buildSummaryPrompt(contact, batch, images), tools: [], signal: input.signal });
            assertCurrent();
            const text = compileSummary(response);
            const throughSeq = batch.at(-1)!.seq;
            const previous = contact.summary?.throughSeq ?? 0;
            await service.change(state => {
                const target = state.contacts.find(person => person.id === input.contactId);
                if (!target || (target.summary?.throughSeq ?? 0) !== previous) {throw new Error('messages_thread_changed');}
                target.summary = { throughSeq, text };
            }, input.guard);
            assertCurrent();
            contact = service.current().contacts.find(person => person.id === input.contactId)!;
            batch = summaryBatch(contact, history);
        }
        stage('replying');
        const background = await context.capture(contact, history, incoming!);
        assertCurrent();
        const recent = history.filter(message => message.seq > (contact.summary?.throughSeq ?? 0));
        const images = await loadImages([...recent, incoming!]);
        const prompt = buildReplyPrompt({ contact, context: background, incoming: incoming!, history: recent, images });
        const response = await session.run({ ...prompt, tools: [], signal: input.signal });
        assertCurrent();
        const replies = compileReplies(response);
        const entries = replies.map(payload => ({ id: deps.id(), payload }));
        // The guard is also checked by the transaction coordinator immediately before replace.
        stage('saving-reply');
        await service.change(state => {
            const currentThread = state.messages.filter(message => message.contactId === input.contactId);
            const currentContact = state.contacts.find(person => person.id === input.contactId);
            if (JSON.stringify(currentThread) !== JSON.stringify(thread)
                || currentContact?.name !== contact.name || currentContact?.note !== contact.note) {throw new Error('messages_thread_changed');}
            appendMessages(state, { segmentId, contactId: input.contactId, playerName: incoming!.from,
                replyTo: incoming!.id, entries, createdAt: Date.now() });
        }, input.guard);
    }

    let failure: MessageSendError | undefined;
    try {await reply();} catch (cause) {failure = new MessageSendError(phase, cause);}
    // Native history is a projection, never a prerequisite for the NPC reply.
    // Even a failed reply may mirror the confirmed outgoing message. An uncertain
    // sidecar or a changed timeline must be resolved before any further writes.
    if (input.guard() && !input.signal.aborted && !service.pending() && service.fileState() === 'ready') {
        const state = service.current();
        const members = new Set(state.messages.filter(message => message.id === incoming!.id || message.replyTo === incoming!.id).map(message => message.id));
        const missing = new Set(unsyncedIds(state));
        const segments = state.segments.filter(segment => segment.messageIds.some(id => members.has(id) && missing.has(id)));
        if (segments.length) {
            stage('syncing');
            try {for (const segment of segments) {await timeline.sync(segment.id, input.guard);}}
            catch (cause) {failure ??= new MessageSendError('syncing', cause);}
        }
    }
    if (failure) {throw failure;}
}
