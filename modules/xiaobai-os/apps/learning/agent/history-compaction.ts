import { estimateConversationTokens } from '../../../../agent-core/runtime/context-tokens.js';
import type { XiaobaiOsAgentSession } from '../../../capabilities/agent/gateway.js';
import { safePromptJson } from '../../../capabilities/maintenance/prompt-safety.js';
import { isLearningContextOverflow, learningHistoryMessage, type LearningTurn } from './history.js';
import { LEARNING_HISTORY_PROMPT } from './history-prompt.js';

// Same proactive trigger as ebook, not a claimed provider capacity or a request rejection limit.
export const LEARNING_SUMMARY_TRIGGER_TOKENS = 158_000;
const SUMMARY_MAX_TOKENS = 10_000; // Same summary allowance as Assistant, bounded by the active API setting.
export const LEARNING_PRESERVED_TURNS = 2;

/** Independent model sessions; no tool execution, storage mutation or partial publication. */
export async function summariseLearningHistory(options: {
    summary: string; turns: readonly LearningTurn[]; signal: AbortSignal;
    guard: () => boolean;
    openSession: () => Promise<XiaobaiOsAgentSession>;
}): Promise<string | null> {
    let summary = options.summary;
    let offset = 0;
    let size = options.turns.length;
    function assertCurrent() {
        options.signal.throwIfAborted();
        if (!options.guard()) { throw new DOMException('Classroom changed', 'AbortError'); }
    }
    while (offset < options.turns.length) {
        assertCurrent();
        const turns = options.turns.slice(offset, offset + size);
        const source = { summary, exchanges: turns.map(turn => turn.messages.map(message => ({
            role: message.role, content: message.content,
            ...(message.tool_calls ? { tool_calls: message.tool_calls } : {}),
            ...(message.tool_call_id ? { tool_call_id: message.tool_call_id } : {}),
        }))) };
        try {
            const agent = await options.openSession();
            assertCurrent();
            const maxTokens = Number(agent.providerConfig.maxTokens);
            const result = await agent.run({ systemPrompt: LEARNING_HISTORY_PROMPT,
                messages: [{ role: 'user', content: safePromptJson(source) }], tools: [], temperature: 0.2,
                maxTokens: Number.isFinite(maxTokens) && maxTokens > 0 ? Math.min(maxTokens, SUMMARY_MAX_TOKENS) : SUMMARY_MAX_TOKENS,
                reasoning: { mode: 'inherit', output: 'hide' }, signal: options.signal });
            assertCurrent();
            const text = typeof result.text === 'string' ? result.text.trim() : '';
            // Provider refusals/filtered or incomplete output cannot replace the original exchanges either.
            const finish = String(result.finishReason ?? 'stop').toLowerCase();
            if (result.refused === true || !text || !['stop', 'end_turn', 'stop_sequence', 'completed'].includes(finish)) {
                throw new Error('learning_summary_incomplete');
            }
            summary = text;
            offset += turns.length;
        } catch (error) {
            // A provider may have a smaller window than the proactive threshold. Split whole exchanges only.
            if (!options.signal.aborted && isLearningContextOverflow(error) && turns.length > 1) {
                size = Math.ceil(turns.length / 2);
                continue;
            }
            throw error;
        }
    }
    const before = [...(options.summary ? [learningHistoryMessage(options.summary)] : []), ...options.turns.flatMap(turn => turn.messages)];
    if (estimateConversationTokens({ messages: [learningHistoryMessage(summary)] }) >= estimateConversationTokens({ messages: before })) {
        return null;
    }
    return summary;
}
