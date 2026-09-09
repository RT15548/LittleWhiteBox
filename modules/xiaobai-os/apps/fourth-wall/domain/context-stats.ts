import { estimateConversationTokens, estimateTokenCount } from '../../../../agent-core/runtime/context-tokens.js';
import { buildFourthWallAgentRequest, counterMessages } from './agent-request.js';
import { CONTEXT_LIMIT, SUMMARY_TRIGGER, getArchiveEnd } from './context-policy.js';
import { formatMainChat, formatMetaHistory } from './prompt.js';
import type { FourthWallBuiltPrompt, FourthWallContextStats, FourthWallPromptInput, FourthWallSession } from '../types.js';

export function estimateFourthWallContext(
    prompt: FourthWallBuiltPrompt, input: FourthWallPromptInput, session: FourthWallSession,
): FourthWallContextStats {
    const request = buildFourthWallAgentRequest(prompt, input.settings.disableAssistantPrefill);
    const usedTokens = estimateConversationTokens({ messages: counterMessages(request) });
    const mainTokens = estimateTokenCount(formatMainChat(input.chatSnapshot, input.settings.maxChatLayers));
    const memoryTokens = estimateTokenCount(input.memory || '');
    const historyTokens = estimateTokenCount(formatMetaHistory(input.history));
    return {
        usedTokens, limit: CONTEXT_LIMIT, trigger: SUMMARY_TRIGGER,
        mainTokens, memoryTokens, historyTokens,
        promptTokens: Math.max(0, usedTokens - mainTokens - memoryTokens - historyTokens),
        canSummarize: getArchiveEnd(session) > session.archivedCount,
    };
}
