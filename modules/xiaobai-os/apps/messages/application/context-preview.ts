import type { MessageContact, PrivateMessage } from '../../../domains/messages/types.js';
import { buildReplyPrompt } from '../prompt/reply-prompt.js';
import type { SendDependencies } from './send.js';
import { estimateContext, meteringImages } from './context-budget.js';

/** Read-only preview. No provider session, image downloads or persisted counters. */
export async function previewMessageContext(deps: Pick<SendDependencies, 'context' | 'getSettings' | 'playerName'>,
    contact: MessageContact, history: PrivateMessage[]) {
    const incoming: PrivateMessage = { id: 'preview', seq: (history.at(-1)?.seq ?? 0) + 1, contactId: contact.id,
        from: deps.playerName(), to: contact.name, sender: 'user', createdAt: 0, replyTo: null, payload: { type: 'text', text: '' } };
    const context = await deps.context.capture(contact, history, incoming);
    const recent = history.filter(message => message.seq > (contact.summary?.throughSeq ?? 0));
    const prompt = buildReplyPrompt({ contact, context, history: recent, incoming, images: meteringImages(recent), settings: deps.getSettings() });
    return estimateContext(prompt, contact, recent, context);
}
