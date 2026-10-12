import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import type { LearningDialogue } from './context.js';
import { learningReplyText } from './messages.js';

export type LearningTurn = LearningDialogue;

/** A retry resumes the same request; this is execution evidence, not another learner message. */
export function learningRetryMessage(turn: LearningTurn) {
    const calls = turn.messages.flatMap((message, index) => message.role === 'assistant' && !message.error && !message.streaming
        ? (message.toolCalls ?? []).map(call => {
            const following = turn.messages.slice(index + 1);
            const nextResponse = following.findIndex(entry => entry.role === 'assistant');
            const result = (nextResponse < 0 ? following : following.slice(0, nextResponse))
                .find(entry => entry.role === 'tool' && entry.toolCallId === call.id);
            return { name: call.name, arguments: call.arguments, result: result?.content ?? null, interrupted: !result || !!result.error || !!result.streaming };
        }) : []);
    return { role: 'system', content: `This is a retry of the same learner message. Previous tool calls and their observed results are reference data; confirmed writes remain saved. Continue the unfinished work.\n<learning_retry>\n${safePromptJson({ status: turn.status, calls })}\n</learning_retry>` };
}

export function learningTurnMessages(turn: LearningTurn): Record<string, unknown>[] {
    if (turn.status !== 'finished') { return learningInterruptedMessages(turn); }
    const text = learningReplyText(turn.messages);
    // Completed classroom exchanges are not a continuation of their private tool protocol.
    // Current saved records supply the facts; the active loop retains its own exact wire messages.
    return [...(turn.user ? [{ role: 'user', content: turn.user }] : []), ...(text ? [{ role: 'assistant', content: text }] : [])];
}

/** An interrupted draft is not a saved tool result. Retain the visible exchange without replaying uncommitted writes. */
export function learningInterruptedMessages(turn: LearningDialogue): Record<string, unknown>[] {
    const text = learningReplyText(turn.messages);
    return [...(turn.user ? [{ role: 'user', content: turn.user }] : []), ...(text ? [{ role: 'assistant', content: text }] : []),
        { role: 'system', content: `Classroom operation status (reference data): ${safePromptJson({
            status: turn.status, message: turn.message, learningChanges: 'Each confirmed tool edit is saved independently. Earlier successful edits survive interruption. Read current records before continuing unfinished work.',
        })}` }];
}

/** Known external provider errors, not a guessed context window or a catch-all for HTTP 400. */
export function isLearningContextOverflow(error: unknown): boolean {
    if (!error || typeof error !== 'object') { return false; }
    const value = error as { status?: number; code?: string; message?: string; error?: { code?: string } };
    if ([value.code, value.error?.code].includes('context_length_exceeded')) { return true; }
    return [400, 413, 422].includes(value.status ?? 0) && typeof value.message === 'string'
        && /maximum context length|context (?:window|length).*(?:exceed|too (?:long|large))|prompt is too long|input token count.*exceeds/i.test(value.message);
}

export function learningHistoryMessage(summary: string) {
    return { role: 'system', content: `Your earlier exchanges, summarised as reference data.\n<conversation_memory>\n${safePromptJson({ summary })}\n</conversation_memory>` };
}
