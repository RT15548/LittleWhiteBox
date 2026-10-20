import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { dropInvalidatedThinkingFromMessage } from '../../agent-core/runtime/protocol.js';
import { MEMORY_CHAT_PROMPT, MEMORY_REGENERATION_PROMPT } from './prompt.js';
import { MEMORY_TOOLS, READ_MAINTENANCE_TOOL } from './tools.js';
import { REVIEW_LIMITS } from './limits.js';

export function memoryChatMaterial(task, callsRemaining) {
    return `## Current runtime material\n${JSON.stringify({ task, callsRemaining, memoryAvailable: !!task })}`;
}

export function memoryRegenerationNote({ runId, receipts = [], saved = 0, status } = {}) {
    return { role: 'system', memoryRegeneration: true,
        content: `${MEMORY_REGENERATION_PROMPT}\n${JSON.stringify({ previousAttempt: { runId, receipts, saved, status } })}` };
}

export function buildMemoryChatMessages(question, history = []) {
    // The fresh task in the system prefix invalidates signatures from old turns.
    // Repair instructions last only for their turn. A regeneration instruction
    // is current only when the controller has just appended it before a question.
    const previous = structuredClone(history).filter((message, index) => !message.memoryResponseRepair
        && (!message.memoryRegeneration || index === history.length - 1));
    return [...previous.map(dropInvalidatedThinkingFromMessage), { role: 'user', content: question }];
}

/** Local preview only. Send-time measurement remains the execution authority. */
export function estimateMemoryChatContext({ question = '', history = [], task = null, config = {} } = {}) {
    const messages = buildMemoryChatMessages(question, history);
    const tools = [...(task ? MEMORY_TOOLS : []), READ_MAINTENANCE_TOOL];
    const material = memoryChatMaterial(task, REVIEW_LIMITS.turns);
    const count = (items, definitions = []) => estimateConversationTokens({ messages: items, tools: definitions, providerConfig: config });
    const rules = count([{ role: 'system', content: MEMORY_CHAT_PROMPT }], tools);
    const past = Math.max(0, count([{ role: 'system', content: MEMORY_CHAT_PROMPT }, ...messages.slice(0, -1)], tools) - rules);
    const used = count([{ role: 'system', content: `${MEMORY_CHAT_PROMPT}\n\n${material}` }, ...messages], tools);
    return { used, limit: REVIEW_LIMITS.inputTokens, trigger: REVIEW_LIMITS.compactTokens, source: 'estimated',
        sections: { rules, history: past, material: Math.max(0, used - rules - past) } };
}

/** Complete protocol groups after cancellation/failure without executing their remaining calls. */
export function settleMemoryToolMessages(messages, toolCalls, responses, error, activeId) {
    for (const tool of toolCalls) {
        if (responses.some(response => response.id === tool.id)) continue;
        const active = tool.id === activeId;
        const response = { status: active ? error.uncertain ? 'unconfirmed' : 'error' : 'not_executed',
            code: active ? error.code || 'agent_failed' : 'run_stopped',
            message: active ? error.message : 'The run stopped before this tool was executed.' };
        const item = { id: tool.id, name: tool.name, arguments: tool.arguments, response,
            ...(Object.hasOwn(tool, 'providerId') ? { providerId: tool.providerId } : {}) };
        responses.push(item);
        messages.push({ role: 'tool', tool_call_id: tool.id, toolName: tool.name, content: JSON.stringify(response) });
    }
}
