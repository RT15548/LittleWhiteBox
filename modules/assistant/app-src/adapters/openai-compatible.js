import OpenAI from 'openai';

function safeParseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
    }
}

function extractTaggedToolCalls(content = '') {
    const patterns = [
        /<<TOOL_CALL>>\s*([\s\S]*?)\s*<<\/TOOL_CALL>>/g,
        /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g,
    ];
    const results = [];

    patterns.forEach((pattern) => {
        const matches = [...content.matchAll(pattern)];
        matches.forEach((match, index) => {
            try {
                const parsed = JSON.parse(match[1]);
                results.push({
                    id: parsed.id || `tool-call-${index + 1}`,
                    name: String(parsed.name || ''),
                    arguments: typeof parsed.arguments === 'string'
                        ? parsed.arguments
                        : JSON.stringify(parsed.arguments || {}),
                });
            } catch {
                results.push({
                    id: `tool-call-${index + 1}`,
                    name: '',
                    arguments: '',
                });
            }
        });
    });

    return results.filter((item) => item.name);
}

function buildTaggedProtocolPrompt(task) {
    const toolDescriptions = (task.tools || []).map((tool) => [
        `- ${tool.function.name}: ${tool.function.description || ''}`.trim(),
        `  参数 JSON Schema: ${JSON.stringify(tool.function.parameters || {})}`,
    ].join('\n')).join('\n');

    return [
        task.systemPrompt || '',
        '如果你需要调用工具，不要使用原生 tool calling 字段。',
        '请严格输出如下边界标记包裹的 JSON，不要改写边界标记：',
        '<<TOOL_CALL>>{"name":"工具名","arguments":{...}}<</TOOL_CALL>>',
        '可以输出多段 <<TOOL_CALL>> ... <</TOOL_CALL>>。',
        '除非必须说明，否则不要在工具调用前后输出多余解释。',
        toolDescriptions ? `可用工具:\n${toolDescriptions}` : '',
    ].filter(Boolean).join('\n\n');
}

function buildTaggedMessages(task) {
    const toolNameById = new Map();
    const messages = [];

    for (const message of task.messages || []) {
        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            const taggedBlocks = message.tool_calls.map((toolCall, index) => {
                const toolName = toolCall.function?.name || '';
                const toolId = toolCall.id || `tool-call-${index + 1}`;
                if (toolName) {
                    toolNameById.set(toolId, toolName);
                }
                return `<<TOOL_CALL>>${JSON.stringify({
                    id: toolId,
                    name: toolName,
                    arguments: safeParseArguments(toolCall.function?.arguments || '{}'),
                })}<</TOOL_CALL>>`;
            }).join('\n');

            messages.push({
                role: 'assistant',
                content: [message.content || '', taggedBlocks].filter(Boolean).join('\n\n'),
            });
            continue;
        }

        if (message.role === 'tool') {
            messages.push({
                role: 'user',
                content: [
                    `工具 ${toolNameById.get(message.tool_call_id || '') || 'unknown_tool'} 已返回结果。`,
                    message.content || '',
                ].filter(Boolean).join('\n'),
            });
            continue;
        }

        messages.push({
            role: message.role,
            content: message.content,
        });
    }

    if (!messages.length || messages[0].role !== 'system') {
        messages.unshift({
            role: 'system',
            content: buildTaggedProtocolPrompt(task),
        });
    } else {
        messages[0] = {
            ...messages[0],
            content: buildTaggedProtocolPrompt({
                ...task,
                systemPrompt: messages[0].content || task.systemPrompt,
            }),
        };
    }

    return messages;
}

export class OpenAICompatibleAdapter {
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
        const toolMode = this.config.toolMode || 'native';
        const isTaggedMode = toolMode === 'tagged-json';
        const response = await this.client.chat.completions.create({
            model: this.config.model,
            messages: isTaggedMode ? buildTaggedMessages(task) : task.messages,
            tools: isTaggedMode ? undefined : task.tools,
            tool_choice: isTaggedMode ? undefined : (task.toolChoice || 'auto'),
            temperature: task.temperature,
            max_tokens: task.maxTokens,
        }, {
            signal: task.signal,
        });

        const choice = response.choices?.[0] || {};
        const message = choice.message || {};
        const standardToolCalls = (message.tool_calls || []).map((item) => ({
            id: item.id || `openai-tool-${Date.now()}`,
            name: item.function?.name || '',
            arguments: item.function?.arguments || '{}',
        })).filter((item) => item.name);
        const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(message.content || '');
        const toolCalls = [...standardToolCalls, ...taggedToolCalls];
        const cleanedText = standardToolCalls.length
            ? (message.content || '')
            : (message.content || '')
                .replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, '')
                .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '')
                .trim();

        return {
            text: cleanedText,
            toolCalls,
            finishReason: choice.finish_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-compatible',
        };
    }
}
