import { repairLooseToolArguments } from './loose-tool-arguments.js';

function normalizeToolCallArguments(toolCall = {}) {
    const name = String(toolCall?.name || '').trim();
    if (typeof toolCall?.arguments === 'string') {
        const raw = toolCall.arguments;
        try {
            JSON.parse(raw.trim() || '{}');
            return raw;
        } catch {
            return repairLooseToolArguments(raw, name) || raw;
        }
    }
    try {
        return JSON.stringify(toolCall?.arguments || {});
    } catch {
        return '{}';
    }
}

export function normalizeToolCalls(toolCalls = [], options = {}) {
    const fallbackPrefix = String(options.fallbackPrefix || 'agent-tool').trim() || 'agent-tool';
    const createId = typeof options.createId === 'function'
        ? options.createId
        : (index) => `${fallbackPrefix}-${Date.now()}-${index + 1}`;

    return (Array.isArray(toolCalls) ? toolCalls : [])
        .map((toolCall, index) => ({
            id: String(toolCall?.id || createId(index) || `${fallbackPrefix}-${index + 1}`),
            name: String(toolCall?.name || '').trim(),
            arguments: normalizeToolCallArguments(toolCall),
        }))
        .filter((toolCall) => toolCall.name);
}

export function normalizeThoughtBlocks(thoughts = []) {
    return (Array.isArray(thoughts) ? thoughts : [])
        .map((item) => ({
            label: String(item?.label || '思考块').trim() || '思考块',
            text: String(item?.text || '').trim(),
        }))
        .filter((item) => item.text);
}

export function getThoughtBlockKey(item = {}) {
    return `${item.label}\u0000${item.text}`;
}

export function mergeThoughtBlocks(...groups) {
    const seen = new Set();
    const merged = [];
    groups.flatMap((group) => normalizeThoughtBlocks(group)).forEach((item) => {
        const key = getThoughtBlockKey(item);
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(item);
    });
    return merged;
}

export function filterThoughtsForTurn(thoughts = [], turnMessages = [], options = {}) {
    const normalized = normalizeThoughtBlocks(thoughts);
    if (!normalized.length) return normalized;

    const currentMessage = options.currentMessage || null;
    const existingKeys = new Set();
    (Array.isArray(turnMessages) ? turnMessages : []).forEach((message) => {
        if (message === currentMessage || message?.role !== 'assistant') return;
        normalizeThoughtBlocks(message.thoughts).forEach((item) => {
            existingKeys.add(getThoughtBlockKey(item));
        });
    });
    return normalized.filter((item) => !existingKeys.has(getThoughtBlockKey(item)));
}

export function extractGoogleProviderToolCalls(providerPayload, options = {}) {
    const parts = Array.isArray(providerPayload?.googleContent?.parts)
        ? providerPayload.googleContent.parts
        : [];
    return parts
        .filter((part) => part?.functionCall?.name)
        .map((part, index) => ({
            id: String(part.functionCall.id || `${options.fallbackPrefix || 'google-tool'}-${index + 1}`),
            name: String(part.functionCall.name || ''),
            arguments: JSON.stringify(part.functionCall.args || {}),
        }))
        .filter((toolCall) => toolCall.name);
}

export function resolveResultToolCalls(result = {}, providerConfig = {}, options = {}) {
    const directToolCalls = normalizeToolCalls(result?.toolCalls, options);
    if (directToolCalls.length) return directToolCalls;

    const provider = String(result?.provider || providerConfig?.provider || '').toLowerCase();
    if (provider !== 'google') return [];
    return normalizeToolCalls(extractGoogleProviderToolCalls(result?.providerPayload, options), options);
}

export function buildProviderAssistantToolCallMessage(result = {}, toolCalls = [], options = {}) {
    const content = Object.prototype.hasOwnProperty.call(options, 'content')
        ? String(options.content || '')
        : String(result.text || '');
    return {
        role: 'assistant',
        content,
        providerPayload: result.providerPayload,
        tool_calls: normalizeToolCalls(toolCalls, options).map((toolCall) => ({
            id: toolCall.id,
            type: 'function',
            function: {
                name: toolCall.name,
                arguments: toolCall.arguments || '{}',
            },
        })),
    };
}

export function buildProviderToolResultMessage(message = {}) {
    const toolName = String(message.toolName || message.tool_name || '').trim();
    return {
        role: 'tool',
        tool_call_id: String(message.toolCallId || message.tool_call_id || ''),
        ...(toolName ? { toolName } : {}),
        content: String(message.content || ''),
    };
}

export function buildProviderMessagesFromHistory(messages = [], options = {}) {
    const includeMessage = typeof options.includeMessage === 'function'
        ? options.includeMessage
        : () => true;
    const buildUserContent = typeof options.buildUserContent === 'function'
        ? options.buildUserContent
        : (message) => message.content;
    const normalizeOptions = {
        fallbackPrefix: options.fallbackPrefix || 'history-tool',
        createId: options.createId,
    };

    return (Array.isArray(messages) ? messages : [])
        .filter((message) => message && includeMessage(message))
        .map((message) => {
            if (message.role === 'assistant' && Array.isArray(message.toolCalls) && message.toolCalls.length) {
                return buildProviderAssistantToolCallMessage({
                    text: message.content || '',
                    providerPayload: message.providerPayload,
                }, message.toolCalls, normalizeOptions);
            }

            if (message.role === 'tool') {
                return buildProviderToolResultMessage(message);
            }

            return {
                role: message.role || 'user',
                providerPayload: message.providerPayload,
                content: message.role === 'user'
                    ? buildUserContent(message)
                    : String(message.content || ''),
            };
        });
}

export function hasVisibleText(text) {
    return typeof text === 'string' && text.trim().length > 0;
}
