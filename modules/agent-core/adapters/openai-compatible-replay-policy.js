import { resolveRuntimeReasoning } from '../reasoning-capabilities.js';

// Pure replay policy shared by request serialization and pre-request token counting.
// Keep SDK/Host dependencies out of the counter's browser-native import graph.
export function shouldPreserveHistoricalReasoning(config = {}, tools = [], reasoning = resolveRuntimeReasoning(config, config.reasoning)) {
    return config.provider === 'openai-compatible'
        && config.toolMode !== 'tagged-json'
        && Array.isArray(tools) && tools.length > 0
        && reasoning.profileId === 'deepseek-thinking' && reasoning.mode === 'on';
}

export function getLastUserMessageIndex(messages = []) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        if (messages[index]?.role === 'user') return index;
    }
    return -1;
}

export function shouldReplayFullNativeMessage(preserved, index, lastUserIndex) {
    return index > lastUserIndex && Array.isArray(preserved?.tool_calls)
        && preserved.tool_calls.some(call => String(call?.function?.name || '').trim());
}
