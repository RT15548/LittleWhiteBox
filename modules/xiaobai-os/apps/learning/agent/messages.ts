import type { AgentMessage } from '../../../../agent-core/runtime/conversation.js';

/** Pending responses are checked once after their tools; private/obsolete text is never released. */
export type LearningMessage = AgentMessage & { contentVisibility?: 'pending-response' | 'pending-save' | 'private' };

export function learningReplyText(messages: readonly LearningMessage[]): string {
    return messages.flatMap(message => message.role === 'assistant' && !message.contentVisibility && message.content.trim()
        ? [message.content.trim()] : []).join('\n\n');
}
