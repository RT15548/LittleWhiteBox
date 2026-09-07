import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import type { LearningDialogue } from './context.js';

export interface LearningTurn extends LearningDialogue {
    messages: Record<string, unknown>[];
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
