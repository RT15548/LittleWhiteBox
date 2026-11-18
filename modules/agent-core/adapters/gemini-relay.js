import { resolveModelFamily } from '../reasoning-capabilities.js';
import { projectGeminiRelayTools } from './gemini-tool-schema.js';
import { encodeGeminiToolResultText } from './gemini-tool-result.js';

// Both native OpenAI-compatible transports cross the same Gemini relay boundary.
// Tagged JSON and other model families retain their caller-owned payloads.
export function prepareGeminiRelayRequest(model, tools, messages, tagged = false) {
    if (tagged || resolveModelFamily(model) !== 'gemini') return { tools, messages };
    return {
        tools: tools ? projectGeminiRelayTools(tools) : tools,
        messages: messages.map(message => message.role === 'tool'
            ? { ...message, content: encodeGeminiToolResultText(message.content) } : message),
    };
}
