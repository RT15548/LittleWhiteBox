import Anthropic from '@anthropic-ai/sdk';

function logOutgoingRequest(label, payload) {
    try {
        console.groupCollapsed(label);
        console.log(JSON.parse(JSON.stringify(payload)));
        console.groupEnd();
    } catch {
        console.log(label, payload);
    }
}

function parseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
    }
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
            content: [{ type: 'text', text: message.content || '' }],
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
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(task) {
        const tools = (task.tools || []).map((tool) => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters,
        }));
        const body = {
            model: this.config.model,
            system: task.systemPrompt,
            messages: buildAnthropicMessages(task.messages),
            tools,
            temperature: task.temperature,
            ...(task.maxTokens ? { max_tokens: task.maxTokens } : {}),
        };
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

        return {
            text,
            toolCalls,
            finishReason: response.stop_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'anthropic',
        };
    }
}
