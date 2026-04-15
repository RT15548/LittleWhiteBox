import OpenAI from 'openai';

function buildUserOrSystemMessage(role, content) {
    return {
        type: 'message',
        role,
        content: [{ type: 'input_text', text: content }],
    };
}

function buildAssistantMessage(content) {
    return {
        type: 'message',
        role: 'assistant',
        status: 'completed',
        content: [{ type: 'output_text', text: content }],
    };
}

function buildInputMessages(task) {
    const input = [];

    for (const message of task.messages || []) {
        if (message.role === 'tool') {
            input.push({
                type: 'function_call_output',
                call_id: message.tool_call_id || 'missing_tool_call_id',
                output: message.content,
            });
            continue;
        }

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            if (message.content?.trim()) {
                input.push(buildAssistantMessage(message.content));
            }
            message.tool_calls.forEach((toolCall, index) => {
                input.push({
                    type: 'function_call',
                    call_id: toolCall.id || `function_call_${index + 1}`,
                    name: toolCall.function?.name || '',
                    arguments: toolCall.function?.arguments || '{}',
                    status: 'completed',
                });
            });
            continue;
        }

        if (message.role === 'assistant') {
            input.push(buildAssistantMessage(message.content || ''));
            continue;
        }

        input.push(buildUserOrSystemMessage(message.role, message.content || ''));
    }

    return input;
}

export class OpenAIResponsesAdapter {
    constructor(config) {
        this.config = config;
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: String(config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, ''),
            timeout: Number(config.timeoutMs) || 180000,
            maxRetries: 0,
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(task) {
        const body = {
            model: this.config.model,
            input: buildInputMessages(task),
            temperature: task.temperature,
            tools: (task.tools || []).map((tool) => ({
                type: 'function',
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters,
            })),
            ...(task.maxTokens ? { max_output_tokens: task.maxTokens } : {}),
        };

        const response = await this.client.responses.create(body, {
            signal: task.signal,
        });

        const output = Array.isArray(response.output) ? response.output : [];
        const toolCalls = output
            .filter((item) => item.type === 'function_call' && item.name)
            .map((item, index) => ({
                id: item.call_id || `response-tool-${index + 1}`,
                name: item.name || '',
                arguments: item.arguments || '{}',
            }));
        const text = response.output_text
            || output.flatMap((item) => item.content || []).map((item) => item.text || '').join('\n');

        return {
            text,
            toolCalls,
            finishReason: response.incomplete_details?.reason || response.status || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-responses',
        };
    }
}
