import { estimateConversationTokens, estimateTokenCount } from '../../../../../agent-core/runtime/context-tokens.js';
import type { Campaign } from '../campaign/types.js';
import type { Participant } from '../content/participants.js';
import type { NarrativeCanon } from './canon.js';
import { buildConversationPrompt } from './prompt.js';
import { MEMORY_POLICY } from './memory.js';

export function conversationUsage(campaign: Campaign, person: Participant, draft: string, canon: NarrativeCanon) {
    const prompt = buildConversationPrompt(campaign, person, draft, canon);
    const messages = [{ role: 'system', content: prompt.systemPrompt }, ...prompt.messages];
    const used = estimateConversationTokens({ messages });
    const system = estimateTokenCount(prompt.systemPrompt), memory = estimateTokenCount(campaign.memories[person]?.text ?? '');
    const history = estimateTokenCount(JSON.stringify(prompt.messages.slice(1, -1)));
    return { used, system, memory, history, situation: Math.max(0, used - system - memory - history),
        limit: MEMORY_POLICY.waitAt, trigger: MEMORY_POLICY.trigger };
}
