import Anthropic from '@anthropic-ai/sdk';
import { createCorsProxyFetch } from './cors-proxy.js';

function logOutgoingRequest(label, payload) {
    const targetConsole = globalThis.top?.console || console;
    try {
        targetConsole.groupCollapsed(label);
        targetConsole.log(JSON.parse(JSON.stringify(payload)));
        targetConsole.groupEnd();
    } catch {
        targetConsole.log(label, payload);
    }
}

function parseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
    }
}

function parseDataUrl(dataUrl = '') {
    const match = String(dataUrl || '').match(/^data:([^;,]+);base64,(.+)$/);
    if (!match) {
        return { mediaType: '', data: '' };
    }
    return {
        mediaType: match[1],
        data: match[2],
    };
}

function buildMessageContent(content) {
    if (typeof content === 'string') {
        return [{ type: 'text', text: content }];
    }
    if (!Array.isArray(content)) {
        return [{ type: 'text', text: '' }];
    }
    const parts = content.map((part) => {
        if (!part || typeof part !== 'object') return null;
        if (part.type === 'text') {
            return { type: 'text', text: part.text || '' };
        }
        if (part.type === 'image_url' && part.image_url?.url) {
            const parsed = parseDataUrl(part.image_url.url);
            if (!parsed.mediaType || !parsed.data) return null;
            return {
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: parsed.mediaType,
                    data: parsed.data,
                },
            };
        }
        return null;
    }).filter(Boolean);
    return parts.length ? parts : [{ type: 'text', text: '' }];
}

function mapThinkingBudget(effort) {
    switch (effort) {
        case 'high':
            return 4096;
        case 'medium':
            return 2048;
        case 'low':
        default:
            return 1024;
    }
}

function resolveSystemPrompt(task) {
    const parts = [
        String(task.systemPrompt || '').trim(),
        ...((task.messages || [])
            .filter((message) => message.role === 'system')
            .map((message) => String(message.content || '').trim())),
    ].filter(Boolean);

    if (!parts.length) return '';
    return [...new Set(parts)].join('\n\n');
}

function buildAnthropicMessages(messages) {
    const filtered = [];
    const toolNameById = new Map();

    messages.forEach((message) => {
        (message.tool_calls || []).forEach((toolCall) => {
            if (toolCall.id && toolCall.function?.name) {
                toolNameById.set(toolCall.id, toolCall.function.name);
            }
        });
    });

    for (const message of messages) {
        if (message.role === 'system') continue;

        if (message.role === 'tool') {
            filtered.push({
                role: 'user',
                content: [{
                    type: 'tool_result',
                    tool_use_id: message.tool_call_id,
                    name: toolNameById.get(message.tool_call_id || '') || undefined,
                    content: message.content,
                }],
            });
            continue;
        }

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            filtered.push({
                role: 'assistant',
                content: [
                    ...(message.content ? [{ type: 'text', text: message.content }] : []),
                    ...message.tool_calls.map((toolCall) => ({
                        type: 'tool_use',
                        id: toolCall.id,
                        name: toolCall.function.name,
                        input: parseArguments(toolCall.function.arguments),
                    })),
                ],
            });
            continue;
        }

        filtered.push({
            role: message.role,
            content: buildMessageContent(message.content),
        });
    }

    return filtered;
}

export class AnthropicAdapter {
    constructor(config) {
        this.config = config;
        this.client = new Anthropic({
            apiKey: config.apiKey,
            baseURL: String(config.baseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, ''),
            timeout: Number(config.timeoutMs) || 180000,
            maxRetries: 0,
            fetch: createCorsProxyFetch(Boolean(config.useCorsProxy)),
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(task) {
        const tools = (task.tools || []).map((tool) => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters,
        }));
        const system = resolveSystemPrompt(task);
        const body = {
            model: this.config.model,
            system,
            messages: buildAnthropicMessages(task.messages),
            tools,
            temperature: task.temperature,
            ...(task.maxTokens ? { max_tokens: task.maxTokens } : {}),
        };
        if (task.reasoning?.enabled) {
            body.thinking = {
                type: 'enabled',
                budget_tokens: mapThinkingBudget(task.reasoning.effort),
                display: 'summarized',
            };
        }
        logOutgoingRequest('[LittleWhiteBox Assistant] Anthropic outgoing request', body);

        const response = await this.client.messages.create(body, {
            signal: task.signal,
        });

        const toolCalls = (response.content || [])
            .filter((item) => item.type === 'tool_use' && item.name)
            .map((item, index) => ({
                id: item.id || `anthropic-tool-${index + 1}`,
                name: item.name,
                arguments: JSON.stringify(item.input || {}),
            }));

        const text = (response.content || [])
            .filter((item) => item.type === 'text')
            .map((item) => item.text || '')
            .join('\n');
        const thoughts = (response.content || [])
            .filter((item) => item.type === 'thinking' || item.type === 'redacted_thinking')
            .map((item) => ({
                label: item.type === 'thinking' ? '思考块' : '已脱敏思考块',
                text: item.type === 'thinking' ? (item.thinking || '') : (item.data || ''),
            }))
            .filter((item) => item.text);

        return {
            text,
            toolCalls,
            thoughts,
            finishReason: response.stop_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'anthropic',
        };
    }
}
