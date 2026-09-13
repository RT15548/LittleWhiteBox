import type { SendDependencies } from './send.js';
import type { MessagesModifications, ModificationTarget } from './modifications.js';
import { generateMessageReply } from './generate-reply.js';

export async function regenerateMessageReply(deps: SendDependencies, modifications: MessagesModifications, target: ModificationTarget, input: {
    signal: AbortSignal; guard: () => boolean; stage: (stage: string) => void;
}) {
    const { state, ids } = modifications.authorize(target, 'regenerate');
    const old = state.messages.find(message => message.id === ids[0])!;
    const incoming = state.messages.find(message => message.id === old.replyTo)!;
    const contact = structuredClone(state.contacts.find(contact => contact.id === target.contactId)!);
    // Never feed the discarded answer back through either raw history or a summary.
    if (contact.summary && contact.summary.throughSeq >= incoming.seq) {contact.summary = null;}
    const history = state.messages.filter(message => message.contactId === target.contactId && message.seq < incoming.seq);
    const generated = await generateMessageReply(deps, { ...input, contact, history, incoming });
    if (!input.guard() || input.signal.aborted) {throw new Error('messages_cancelled');}
    input.stage('saving-reply');
    const messages = generated.replies.map((payload, index) => ({ ...old, id: deps.id(), seq: state.nextSeq + index, payload }));
    await modifications.commit(target, 'regenerate', input.guard, { messages, summary: generated.summary });
}
