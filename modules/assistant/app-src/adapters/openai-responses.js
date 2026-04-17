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

function buildUserOrSystemMessage(role, content) {
    return {
        type: 'message',
        role,
        content: buildInputContent(content),
    };
}

function buildAssistantMessage(content) {
    return {
        role: 'assistant',
        content: typeof content === 'string' ? content : '',
    };
}

function buildInputContent(content) {
    if (typeof content === 'string') {
        return [{ type: 'input_text', text: content }];
    }
    if (!Array.isArray(content)) {
        return [{ type: 'input_text', text: '' }];
    }
    const parts = content.map((part) => {
        if (!part || typeof part !== 'object') return null;
        if (part.type === 'image_url' && part.image_url?.url) {
            return {
                type: 'input_image',
                image_url: part.image_url.url,
            };
        }
        if (part.type === 'text') {
            return {
                type: 'input_text',
                text: part.text || '',
            };
        }
        return null;
    }).filter(Boolean);
    return parts.length ? parts : [{ type: 'input_text', text: '' }];
}

function pushThought(thoughts, label, text) {
    const normalized = String(text || '').trim();
    if (!normalized) return;
    thoughts.push({
        label,
        text: normalized,
    });
}

function collectReasoningParts(thoughts, parts = [], labelMap = {}) {
    (parts || []).forEach((part) => {
        if (!part || typeof part !== 'object') return;
        if (part.type === 'reasoning_text') {
            pushThought(thoughts, labelMap.reasoning || '推理文本', part.text);
            return;
        }
        if (part.type === 'summary_text') {
            pushThought(thoughts, labelMap.summary || '推理摘要', part.text);
        }
    });
}

function extractThoughts(output = []) {
    const thoughts = [];

    (output || []).forEach((item) => {
        if (!item || typeof item !== 'object') return;
        if (item.type !== 'reasoning') return;

        collectReasoningParts(thoughts, item.content, {
            reasoning: '推理文本',
            summary: '推理摘要',
        });
        collectReasoningParts(thoughts, item.summary, {
            reasoning: '推理文本',
            summary: '推理摘要',
        });
    });

    return thoughts;
}

function resolveInstructions(task) {
    const parts = [
        String(task.systemPrompt || '').trim(),
        ...((task.messages || [])
            .filter((message) => message.role === 'system')
            .map((message) => String(message.content || '').trim())),
    ].filter(Boolean);

    if (!parts.length) return '';
    return [...new Set(parts)].join('\n\n');
}

function extractResponseText(response) {
    const legacyChoiceContent = response?.choices?.[0]?.message?.content;
    if (typeof legacyChoiceContent === 'string' && legacyChoiceContent.trim()) {
        return legacyChoiceContent.trim();
    }

    if (typeof response?.output_text === 'string' && response.output_text.trim()) {
        return response.output_text.trim();
    }

    const chunks = [];
    (Array.isArray(response?.output) ? response.output : []).forEach((item) => {
        if (!item || typeof item !== 'object') return;
        if (item.type === 'message' && Array.isArray(item.content)) {
            item.content.forEach((part) => {
                if (!part || typeof part !== 'object') return;
                if (part.type === 'output_text' && typeof part.text === 'string' && part.text.trim()) {
                    chunks.push(part.text.trim());
                    return;
                }
                if (part.type === 'refusal' && typeof part.refusal === 'string' && part.refusal.trim()) {
                    chunks.push(part.refusal.trim());
                }
            });
            return;
        }

        if (typeof item.text === 'string' && item.text.trim()) {
            chunks.push(item.text.trim());
        }
    });

    return chunks.join('\n').trim();
}

function detectProxyEndpointError(response) {
    const choice = response?.choices?.[0];
    const content = choice?.message?.content;
    const finishReason = String(choice?.finish_reason || '');
    if (typeof content !== 'string' || !content.trim()) return null;

    const normalized = content.toLowerCase();
    if (!normalized.includes('proxy error')) return null;
    if (!normalized.includes('/responses') && !finishReason.toLowerCase().includes('proxy error')) return null;

    return content.trim();
}

function buildInputMessages(task) {
    const input = [];

    for (const message of task.messages || []) {
        if (message.role === 'system') {
            continue;
        }

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

        input.push(message.role === 'user'
            ? buildUserOrSystemMessage(message.role, message.content || '')
            : {
                role: message.role,
                content: typeof message.content === 'string' ? message.content : '',
            });
    }

    return input;
}

function buildInputMessagesWithSystem(task) {
    const input = [];

    for (const message of task.messages || []) {
        if (message.role === 'system') {
            input.push({
                role: 'system',
                content: typeof message.content === 'string' ? message.content : '',
            });
            continue;
        }

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

        input.push(message.role === 'user'
            ? buildUserOrSystemMessage(message.role, message.content || '')
            : {
                role: message.role,
                content: typeof message.content === 'string' ? message.content : '',
            });
    }

    return input;
}

function isOfficialOpenAIBaseUrl(baseUrl) {
    try {
        const url = new URL(String(baseUrl || 'https://api.openai.com/v1'));
        return url.hostname === 'api.openai.com';
    } catch {
        return false;
    }
}

function shouldRetryWithLegacySystem(error) {
    const text = String(error?.message || error || '').toLowerCase();
    return text.includes('instructions')
        || text.includes('unsupported')
        || text.includes('unknown parameter')
        || text.includes('invalid input');
}

function emitStreamProgress(task, payload) {
    if (typeof task.onStreamProgress !== 'function') return;
    task.onStreamProgress({
        ...(typeof payload.text === 'string' ? { text: payload.text } : {}),
        ...(Array.isArray(payload.thoughts) ? { thoughts: payload.thoughts } : {}),
    });
}

function comparePartKeys(left, right) {
    const [leftA = '0', leftB = '0'] = String(left || '').split(':');
    const [rightA = '0', rightB = '0'] = String(right || '').split(':');
    return Number(leftA) - Number(rightA) || Number(leftB) - Number(rightB);
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
        const parseResponse = (response) => {
            const proxyError = detectProxyEndpointError(response);
            if (proxyError) {
                const error = new Error(proxyError);
                error.name = 'ProxyEndpointError';
                error.rawDisplay = proxyError;
                throw error;
            }

            const output = Array.isArray(response.output) ? response.output : [];
            const thoughts = extractThoughts(output);
            const toolCalls = output
                .filter((item) => item.type === 'function_call' && item.name)
                .map((item, index) => ({
                    id: item.call_id || `response-tool-${index + 1}`,
                    name: item.name || '',
                    arguments: item.arguments || '{}',
                }));
            const text = extractResponseText(response);
            return { output, thoughts, toolCalls, text };
        };

        const createRequestBody = (legacySystemInInput = false) => {
            const body = {
                model: this.config.model,
                instructions: legacySystemInInput ? undefined : (resolveInstructions(task) || undefined),
                input: legacySystemInInput ? buildInputMessagesWithSystem(task) : buildInputMessages(task),
                ...(Array.isArray(task.tools) && task.tools.length
                    ? {
                        tools: task.tools.map((tool) => ({
                            type: 'function',
                            name: tool.function.name,
                            description: tool.function.description,
                            parameters: tool.function.parameters,
                        })),
                        tool_choice: task.toolChoice || 'auto',
                    }
                    : {}),
                ...(task.maxTokens ? { max_output_tokens: task.maxTokens } : {}),
            };
            if (!task.reasoning?.enabled && typeof task.temperature === 'number') {
                body.temperature = task.temperature;
            }
            if (task.reasoning?.enabled) {
                body.reasoning = {
                    effort: task.reasoning.effort,
                    summary: 'detailed',
                };
            }
            return body;
        };

        const createRequest = async (legacySystemInInput = false) => {
            const body = createRequestBody(legacySystemInInput);
            logOutgoingRequest(
                legacySystemInInput
                    ? '[LittleWhiteBox Assistant] OpenAI Responses outgoing request (legacy system-in-input fallback)'
                    : '[LittleWhiteBox Assistant] OpenAI Responses outgoing request',
                body,
            );
            return await this.client.responses.create(body, {
                signal: task.signal,
            });
        };

        const createStreamRequest = async (legacySystemInInput = false) => {
            const body = createRequestBody(legacySystemInInput);
            logOutgoingRequest(
                legacySystemInInput
                    ? '[LittleWhiteBox Assistant] OpenAI Responses outgoing stream request (legacy system-in-input fallback)'
                    : '[LittleWhiteBox Assistant] OpenAI Responses outgoing stream request',
                body,
            );
            const stream = this.client.responses.stream(body, {
                signal: task.signal,
            });
            const textByPart = new Map();
            const reasoningByPart = new Map();
            const summaryByPart = new Map();

            const emitSnapshot = () => {
                const thoughts = [];
                Array.from(reasoningByPart.entries())
                    .sort(([left], [right]) => comparePartKeys(left, right))
                    .forEach(([, text]) => pushThought(thoughts, '推理文本', text));
                Array.from(summaryByPart.entries())
                    .sort(([left], [right]) => comparePartKeys(left, right))
                    .forEach(([, text]) => pushThought(thoughts, '推理摘要', text));
                emitStreamProgress(task, {
                    text: Array.from(textByPart.entries())
                        .sort(([left], [right]) => comparePartKeys(left, right))
                        .map(([, text]) => text)
                        .join('\n')
                        .trim(),
                    thoughts,
                });
            };

            stream.on('response.output_text.delta', (event) => {
                const key = `${event.output_index}:${event.content_index}`;
                textByPart.set(key, `${textByPart.get(key) || ''}${event.delta}`);
                emitSnapshot();
            });
            stream.on('response.reasoning_text.delta', (event) => {
                const key = `${event.output_index}:${event.content_index}`;
                reasoningByPart.set(key, `${reasoningByPart.get(key) || ''}${event.delta}`);
                emitSnapshot();
            });
            stream.on('response.reasoning_summary_text.delta', (event) => {
                const key = `${event.output_index}:${event.summary_index}`;
                summaryByPart.set(key, `${summaryByPart.get(key) || ''}${event.delta}`);
                emitSnapshot();
            });

            return await stream.finalResponse();
        };

        const allowCompatibilityFallback = !isOfficialOpenAIBaseUrl(this.config.baseUrl);
        let response;
        let parsed;

        try {
            response = typeof task.onStreamProgress === 'function'
                ? await createStreamRequest(false)
                : await createRequest(false);
            parsed = parseResponse(response);
            if (!parsed.text && !parsed.toolCalls.length) {
                logOutgoingRequest('[LittleWhiteBox Assistant] OpenAI Responses raw empty response', response);
            }
            if (allowCompatibilityFallback && !parsed.text && !parsed.toolCalls.length) {
                response = typeof task.onStreamProgress === 'function'
                    ? await createStreamRequest(true)
                    : await createRequest(true);
                parsed = parseResponse(response);
                if (!parsed.text && !parsed.toolCalls.length) {
                    logOutgoingRequest('[LittleWhiteBox Assistant] OpenAI Responses raw empty response after legacy fallback', response);
                }
            }
        } catch (error) {
            if (!allowCompatibilityFallback || !shouldRetryWithLegacySystem(error)) {
                throw error;
            }
            response = typeof task.onStreamProgress === 'function'
                ? await createStreamRequest(true)
                : await createRequest(true);
            parsed = parseResponse(response);
            if (!parsed.text && !parsed.toolCalls.length) {
                logOutgoingRequest('[LittleWhiteBox Assistant] OpenAI Responses raw empty response after legacy fallback', response);
            }
        }

        return {
            text: parsed.text,
            toolCalls: parsed.toolCalls,
            thoughts: parsed.thoughts,
            finishReason: response.incomplete_details?.reason || response.status || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-responses',
        };
    }
}
