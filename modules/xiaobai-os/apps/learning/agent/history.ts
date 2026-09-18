import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import type { LearningDialogue } from './context.js';
import { learningReplyText } from './messages.js';

export type LearningTurn = LearningDialogue;

export function learningTurnMessages(turn: LearningTurn): Record<string, unknown>[] {
    if (turn.status !== 'finished') { return learningInterruptedMessages(turn); }
    const text = learningReplyText(turn.messages);
    // Completed classroom exchanges are not a continuation of their private tool protocol.
    // Current saved records supply the facts; the active loop retains its own exact wire messages.
    return [{ role: 'user', content: turn.user }, ...(text ? [{ role: 'assistant', content: text }] : [])];
}

/** An interrupted draft is not a saved tool result. Retain the visible exchange without replaying uncommitted writes. */
export function learningInterruptedMessages(turn: LearningDialogue): Record<string, unknown>[] {
    const text = learningReplyText(turn.messages);
    return [{ role: 'user', content: turn.user }, ...(text ? [{ role: 'assistant', content: text }] : []),
        { role: 'system', content: `Classroom operation status (reference data): ${safePromptJson({
            status: turn.status, message: turn.message, learningChanges: 'Draft changes are not confirmed saved. Use current learning records for saved facts, including any help already recorded.',
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
    return { role: 'system', content: `Earlier classroom exchanges, summarised as reference data.\n<classroom_history>\n${safePromptJson({ summary })}\n</classroom_history>` };
}
