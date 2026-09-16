import type { MessageContact, PrivateMessage } from '../../../domains/messages/types.js';
import type { SendDependencies } from './send.js';
import { compileReplies, compileSummary } from '../prompt/reply-compiler.js';
import { buildReplyPrompt } from '../prompt/reply-prompt.js';
import { buildSummaryPrompt } from '../prompt/thread-summary.js';
import { countContext, meteringImages } from './context-budget.js';
import { archivePrefix, CONTEXT_LIMIT, SUMMARY_TRIGGER } from './context-policy.js';

/** Generation only. Caller owns summary persistence and reply commit. */
export async function generateMessageReply(deps: SendDependencies, input: {
    contact: MessageContact; history: PrivateMessage[]; incoming: PrivateMessage;
    signal: AbortSignal; guard: () => boolean; stage: (stage: string) => void;
    saveSummary?: (summary: NonNullable<MessageContact['summary']>, previous: number) => Promise<void>;
}) {
    const assertCurrent = () => {if (!input.guard() || input.signal.aborted) {throw new Error('messages_cancelled');}};
    assertCurrent(); input.stage('replying');
    const config = await deps.agent.loadConfig(); assertCurrent();
    const session = await deps.agent.openSession(config); assertCurrent();
    if (!String(session.providerConfig.model ?? '').trim()) {throw new Error('messages_agent_not_configured');}
    const contact = structuredClone(input.contact);
    async function loadImages(messages: PrivateMessage[]) {
        const images = new Map<string, string>();
        for (const message of messages) {
            if (message.payload.type === 'image' && message.payload.attachment) {
                images.set(message.id, await deps.images.load(message.payload.attachment, input.signal)); assertCurrent();
            }
        }
        return images;
    }
    const background = await deps.context.capture(contact, input.history, input.incoming); assertCurrent();
    const settings = deps.getSettings();
    const pending = () => input.history.filter(message => message.seq > (contact.summary?.throughSeq ?? 0));
    const meter = () => buildReplyPrompt({ contact, context: background, incoming: input.incoming,
        history: pending(), images: meteringImages([...pending(), input.incoming]), settings });
    const count = async (prompt: ReturnType<typeof buildReplyPrompt>) => {
        const tokens = await countContext(prompt, session.providerConfig, input.signal, deps.countTokens); assertCurrent(); return tokens;
    };
    let used = await count(meter());
    let archive = used >= SUMMARY_TRIGGER ? archivePrefix(pending()) : [];
    while (archive.length) {
        input.stage('summarizing');
        let batch = archive;
        while (await count(buildSummaryPrompt(contact, batch, background.chronology, meteringImages(batch))) > SUMMARY_TRIGGER) {
            if (batch.length === 1) {throw new Error('messages_context_capacity');}
            batch = batch.slice(0, Math.ceil(batch.length / 2));
        }
        const images = await loadImages(batch);
        const response = await session.run({ ...buildSummaryPrompt(contact, batch, background.chronology, images), tools: [], signal: input.signal }); assertCurrent();
        const summary = { throughSeq: batch.at(-1)!.seq, text: compileSummary(response) };
        const previous = contact.summary;
        contact.summary = summary;
        const nextUsed = await count(meter());
        if (nextUsed >= used) {throw new Error('messages_summary_not_reduced');}
        await input.saveSummary?.(summary, previous?.throughSeq ?? 0); assertCurrent();
        used = nextUsed; archive = archive.slice(batch.length);
    }
    if (used > CONTEXT_LIMIT) {throw new Error('messages_context_capacity');}
    input.stage('replying');
    const recent = pending();
    const images = await loadImages([...recent, input.incoming]);
    const prompt = buildReplyPrompt({ contact, context: background, incoming: input.incoming, history: recent, images, settings });
    const response = await session.run({ ...prompt, tools: [], signal: input.signal }); assertCurrent();
    return { replies: compileReplies(response), summary: contact.summary };
}
