import { estimateConversationTokens, estimateTokenCount, type resolveConversationTokens } from '../../../../agent-core/runtime/context-tokens.js';
import { escapePromptData } from '../../../host/prompt-context/format.js';
import type { MessageContact, PrivateMessage } from '../../../domains/messages/types.js';
import { buildReplyBackground, type buildReplyPrompt } from '../prompt/reply-prompt.js';
import { threadLine } from '../prompt/communication-history.js';
import { CONTEXT_LIMIT, IMAGE_TOKEN_RESERVE, SUMMARY_TRIGGER } from './context-policy.js';

type Prompt = ReturnType<typeof buildReplyPrompt>;
export type ContextTokenCounter = typeof resolveConversationTokens;
export interface MessagesContextStats {
    usedTokens: number; limit: number; trigger: number;
    backgroundTokens: number; summaryTokens: number; historyTokens: number; promptTokens: number; imageTokens: number;
}

/** These URLs are used only for metering; token counters discard their contents. */
export function meteringImages(messages: PrivateMessage[]): Map<string, string> {
    return new Map(messages.flatMap(message => message.payload.type === 'image' && message.payload.attachment
        ? [[message.id, message.payload.attachment.path] as const] : []));
}
function conversation(prompt: Prompt) {return [{ role: 'system', content: prompt.systemPrompt }, ...prompt.messages];}
function imageReserve(prompt: Prompt): number {
    return prompt.messages.reduce((sum, message) => sum + (Array.isArray(message.content)
        ? message.content.filter(part => part.type === 'image_url').length * IMAGE_TOKEN_RESERVE : 0), 0);
}
export async function countContext(prompt: Prompt, providerConfig: Record<string, unknown>, signal: AbortSignal, countTokens: ContextTokenCounter): Promise<number> {
    const measurement = await countTokens({ messages: conversation(prompt), providerConfig, signal });
    return measurement.tokens + imageReserve(prompt);
}
export function estimateContext(prompt: Prompt, contact: MessageContact, history: PrivateMessage[], context: Parameters<typeof buildReplyBackground>[0]): MessagesContextStats {
    const usedTokens = estimateConversationTokens({ messages: conversation(prompt) }) + imageReserve(prompt);
    const backgroundTokens = estimateConversationTokens({ messages: Object.values(buildReplyBackground(context)) });
    const summaryTokens = estimateTokenCount(escapePromptData(contact.summary?.text ?? ''));
    const historyTokens = estimateTokenCount(history.map(threadLine).join('\n'));
    const imageTokens = imageReserve(prompt);
    return { usedTokens, limit: CONTEXT_LIMIT, trigger: SUMMARY_TRIGGER, backgroundTokens, summaryTokens, historyTokens, imageTokens,
        promptTokens: Math.max(0, usedTokens - backgroundTokens - summaryTokens - historyTokens - imageTokens) };
}
