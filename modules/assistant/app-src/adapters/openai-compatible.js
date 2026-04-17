import OpenAI from 'openai';

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

function safeParseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
    }
}

function pushThought(thoughts, label, text) {
    const normalized = String(text || '').trim();
    if (!normalized) return;
    thoughts.push({
        label,
        text: normalized,
    });
}

function flattenTextContent(content) {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';
    return content
        .map((part) => {
            if (!part) return '';
            if (typeof part === 'string') return part;
            return part.text || part.content || '';
        })
        .filter(Boolean)
        .join('\n');
}

function extractThinkTaggedContent(text = '') {
    const thoughts = [];
    const cleaned = String(text || '').replace(/<think>([\s\S]*?)<\/think>/gi, (_, inner) => {
        pushThought(thoughts, '思考块', inner);
        return '';
    }).trim();
    return {
        cleaned,
        thoughts,
    };
}

function collectThoughtsFromUnknown(thoughts, value, label) {
    if (!value) return;
    if (typeof value === 'string') {
        pushThought(thoughts, label, value);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item) => collectThoughtsFromUnknown(thoughts, item, label));
        return;
    }
    if (typeof value !== 'object') return;

    if (typeof value.text === 'string') {
        pushThought(thoughts, label, value.text);
    }
    if (typeof value.content === 'string') {
        pushThought(thoughts, label, value.content);
    }
    if (typeof value.reasoning_content === 'string') {
        pushThought(thoughts, label, value.reasoning_content);
    }
    if (typeof value.thinking === 'string') {
        pushThought(thoughts, label, value.thinking);
    }

    if (Array.isArray(value.summary)) {
        value.summary.forEach((item) => {
            if (typeof item === 'string') {
                pushThought(thoughts, '推理摘要', item);
                return;
            }
            if (item && typeof item === 'object') {
                pushThought(thoughts, '推理摘要', item.text || item.content || '');
            }
        });
    }
}

function extractThoughtsFromMessage(message = {}, choice = {}) {
    const thoughts = [];

    collectThoughtsFromUnknown(thoughts, message.reasoning_content, '推理文本');
    collectThoughtsFromUnknown(thoughts, message.reasoning, '推理文本');
    collectThoughtsFromUnknown(thoughts, message.reasoning_text, '推理文本');
    collectThoughtsFromUnknown(thoughts, message.thinking, '思考块');
    collectThoughtsFromUnknown(thoughts, choice.reasoning_content, '推理文本');
    collectThoughtsFromUnknown(thoughts, choice.reasoning, '推理文本');

    if (Array.isArray(message.content)) {
        message.content.forEach((part) => {
            if (!part || typeof part !== 'object') return;
            if (part.type === 'reasoning_text') {
                pushThought(thoughts, '推理文本', part.text);
                return;
            }
            if (part.type === 'summary_text') {
                pushThought(thoughts, '推理摘要', part.text);
                return;
            }
            if (part.type === 'thinking' || part.type === 'reasoning' || part.type === 'reasoning_content') {
                pushThought(thoughts, '思考块', part.text || part.content || part.reasoning || '');
            }
        });
    }

    return thoughts;
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

function emitStreamProgress(task, payload) {
    if (typeof task.onStreamProgress !== 'function') return;
    task.onStreamProgress({
        ...(typeof payload.text === 'string' ? { text: payload.text } : {}),
        ...(Array.isArray(payload.thoughts) ? { thoughts: payload.thoughts } : {}),
    });
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
        const isTaggedMode = toolMode === 'tagged-json' && Array.isArray(task.tools) && task.tools.length > 0;
        const body = {
            model: this.config.model,
            messages: isTaggedMode ? buildTaggedMessages(task) : task.messages,
            tools: isTaggedMode ? undefined : task.tools,
            tool_choice: isTaggedMode ? undefined : (task.toolChoice || 'auto'),
            ...(task.maxTokens ? { max_tokens: task.maxTokens } : {}),
        };
        if (!task.reasoning?.enabled && typeof task.temperature === 'number') {
            body.temperature = task.temperature;
        }
        if (task.reasoning?.enabled) {
            body.reasoning_effort = task.reasoning.effort;
            body.reasoning = {
                effort: task.reasoning.effort,
                summary: 'detailed',
            };
            body.thinking = {
                type: 'enabled',
                budget_tokens: task.reasoning.effort === 'high' ? 4096 : task.reasoning.effort === 'medium' ? 2048 : 1024,
                display: 'summarized',
            };
        }
        logOutgoingRequest('[LittleWhiteBox Assistant] OpenAI-Compatible outgoing request', body);
        if (typeof task.onStreamProgress === 'function') {
            const stream = await this.client.chat.completions.create({
                ...body,
                stream: true,
            }, {
                signal: task.signal,
            });
            const snapshot = {
                content: '',
                toolCalls: [],
            };
            let lastFinishReason = 'stop';
            let lastModel = this.config.model;

            for await (const chunk of stream) {
                lastModel = chunk.model || lastModel;
                const choice = chunk.choices?.[0];
                const delta = choice?.delta || {};
                if (choice?.finish_reason) {
                    lastFinishReason = choice.finish_reason;
                }
                if (typeof delta.content === 'string') {
                    snapshot.content += delta.content;
                }
                if (Array.isArray(delta.tool_calls)) {
                    delta.tool_calls.forEach((toolCallDelta) => {
                        const index = Number(toolCallDelta.index ?? 0);
                        const current = snapshot.toolCalls[index] || {
                            id: '',
                            type: 'function',
                            function: {
                                name: '',
                                arguments: '',
                            },
                        };
                        snapshot.toolCalls[index] = {
                            ...current,
                            id: toolCallDelta.id || current.id,
                            type: toolCallDelta.type || current.type,
                            function: {
                                name: toolCallDelta.function?.name || current.function?.name || '',
                                arguments: `${current.function?.arguments || ''}${toolCallDelta.function?.arguments || ''}`,
                            },
                        };
                    });
                }

                const thinkTagged = extractThinkTaggedContent(snapshot.content);
                const standardToolCalls = snapshot.toolCalls.filter((item) => item?.function?.name);
                const cleanedText = standardToolCalls.length
                    ? thinkTagged.cleaned
                    : thinkTagged.cleaned
                        .replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, '')
                        .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '')
                        .trim();
                emitStreamProgress(task, {
                    text: cleanedText,
                    thoughts: thinkTagged.thoughts,
                });
            }
            const standardToolCalls = snapshot.toolCalls.map((item) => ({
                id: item.id || `openai-tool-${Date.now()}`,
                name: item.function?.name || '',
                arguments: item.function?.arguments || '{}',
            })).filter((item) => item.name);
            const thinkTagged = extractThinkTaggedContent(snapshot.content);
            const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);
            const toolCalls = [...standardToolCalls, ...taggedToolCalls];
            const cleanedText = standardToolCalls.length
                ? thinkTagged.cleaned
                : thinkTagged.cleaned
                    .replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, '')
                    .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '')
                    .trim();

            return {
                text: cleanedText,
                toolCalls,
                thoughts: thinkTagged.thoughts,
                finishReason: lastFinishReason,
                model: lastModel,
                provider: 'openai-compatible',
            };
        }

        const response = await this.client.chat.completions.create(body, {
            signal: task.signal,
        });

        const choice = response.choices?.[0] || {};
        const message = choice.message || {};
        const thoughts = extractThoughtsFromMessage(message, choice);
        const standardToolCalls = (message.tool_calls || []).map((item) => ({
            id: item.id || `openai-tool-${Date.now()}`,
            name: item.function?.name || '',
            arguments: item.function?.arguments || '{}',
        })).filter((item) => item.name);
        const contentText = flattenTextContent(message.content);
        const thinkTagged = extractThinkTaggedContent(contentText);
        thinkTagged.thoughts.forEach((item) => thoughts.push(item));
        const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);
        const toolCalls = [...standardToolCalls, ...taggedToolCalls];
        const cleanedText = standardToolCalls.length
            ? thinkTagged.cleaned
            : thinkTagged.cleaned
                .replace(/<<TOOL_CALL>>[\s\S]*?<<\/TOOL_CALL>>/g, '')
                .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '')
                .trim();

        return {
            text: cleanedText,
            toolCalls,
            thoughts,
            finishReason: choice.finish_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-compatible',
        };
    }
}
