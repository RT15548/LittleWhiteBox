import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';
import { dropInvalidatedThinkingFromMessage } from '../../agent-core/runtime/protocol.js';
import { getMemoryChatPrompt, MEMORY_REGENERATION_PROMPT } from './prompt.js';
import { MEMORY_TOOLS, READ_MAINTENANCE_TOOL } from './tools.js';
import { REVIEW_LIMITS } from './limits.js';

export function memoryChatMaterial(task, callsRemaining) {
    return `## Current runtime material\n${JSON.stringify({ task, callsRemaining, memoryAvailable: !!task })}`;
}

export function memoryRegenerationNote({ runId, receipts = [], saved = 0, status } = {}) {
    return { role: 'system', memoryRegeneration: true,
        content: `${MEMORY_REGENERATION_PROMPT}\n${JSON.stringify({ previousAttempt: { runId, receipts, saved, status } })}` };
}

function memoryChatHistory(history) {
    return history.filter((message, index) => !message.memoryResponseRepair
        && (!message.memoryRegeneration || index === history.length - 1)).map(dropInvalidatedThinkingFromMessage);
}

export function buildMemoryChatMessages(question, history = []) {
    // The fresh task in the system prefix invalidates signatures from old turns.
    // Repair instructions last only for their turn. A regeneration instruction
    // is current only when the controller has just appended it before a question.
    return [...structuredClone(memoryChatHistory(history)), { role: 'user', content: question }];
}

/** Local preview only. Send-time measurement remains the execution authority. */
export function estimateMemoryChatContext({ question = '', history = [], task = null, config = {}, summaryStyle } = {}) {
    const prompt = getMemoryChatPrompt(summaryStyle);
    const messages = [...memoryChatHistory(history), { role: 'user', content: question }];
    const tools = [...(task ? MEMORY_TOOLS : []), READ_MAINTENANCE_TOOL];
    const material = memoryChatMaterial(task, REVIEW_LIMITS.turns);
    const count = (items, definitions = []) => estimateConversationTokens({ messages: items, tools: definitions, providerConfig: config });
    const rules = count([{ role: 'system', content: prompt }], tools);
    const past = Math.max(0, count([{ role: 'system', content: prompt }, ...messages.slice(0, -1)], tools) - rules);
    const used = count([{ role: 'system', content: `${prompt}\n\n${material}` }, ...messages], tools);
    return { used, limit: REVIEW_LIMITS.inputTokens, trigger: REVIEW_LIMITS.compactTokens, source: 'estimated',
        sections: { rules, history: past, material: Math.max(0, used - rules - past) } };
}

/**
 * One conversation owns this ephemeral cache; typing recounts only the question.
 * Preview framing can differ by a few estimated tokens; execution still measures
 * the complete provider request before sending it. No history payload is retained.
 */
export function createMemoryChatContextEstimator() {
    let previousHistory, previousTask, previousConfig, previousStyle, base;
    return ({ question = '', history = [], task = null, config = {}, summaryStyle } = {}) => {
        const taskKey = JSON.stringify(task), configKey = JSON.stringify(config);
        if (!base || previousHistory !== history || previousTask !== taskKey || previousConfig !== configKey || previousStyle !== summaryStyle) {
            base = estimateMemoryChatContext({ history, task, config, summaryStyle });
            previousHistory = history; previousTask = taskKey; previousConfig = configKey;
            previousStyle = summaryStyle;
        }
        const questionTokens = question ? Math.max(0, estimateConversationTokens({ messages: [{ role: 'user', content: question }] })
            - estimateConversationTokens()) : 0;
        return { ...base, used: base.used + questionTokens,
            sections: { ...base.sections, material: base.sections.material + questionTokens } };
    };
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
