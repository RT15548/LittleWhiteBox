import OpenAI from 'openai';
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

function buildUserOrSystemMessage(role, content) {
    return {
        type: 'message',
        role,
        content: buildInputContent(content),
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

        input.push(buildUserOrSystemMessage(message.role, message.content || ''));
    }

    return input;
}

function buildInputMessagesWithSystem(task) {
    const input = [];

    for (const message of task.messages || []) {
        if (message.role === 'system') {
            input.push(buildUserOrSystemMessage('system', message.content || ''));
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

        input.push(buildUserOrSystemMessage(message.role, message.content || ''));
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

export class OpenAIResponsesAdapter {
    constructor(config) {
        this.config = config;
        this.client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: String(config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, ''),
            timeout: Number(config.timeoutMs) || 180000,
            maxRetries: 0,
            fetch: createCorsProxyFetch(Boolean(config.useCorsProxy)),
            dangerouslyAllowBrowser: true,
        });
    }

    async chat(task) {
        const parseResponse = (response) => {
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

        const createRequest = async (legacySystemInInput = false) => {
            const body = {
                model: this.config.model,
                instructions: legacySystemInInput ? undefined : (resolveInstructions(task) || undefined),
                input: legacySystemInInput ? buildInputMessagesWithSystem(task) : buildInputMessages(task),
                temperature: task.temperature,
                tools: (task.tools || []).map((tool) => ({
                    type: 'function',
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters,
                })),
                ...(task.maxTokens ? { max_output_tokens: task.maxTokens } : {}),
            };
            if (task.reasoning?.enabled) {
                body.reasoning = {
                    effort: task.reasoning.effort,
                    summary: 'detailed',
                };
            }
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

        const allowCompatibilityFallback = !isOfficialOpenAIBaseUrl(this.config.baseUrl);
        let response;
        let parsed;

        try {
            response = await createRequest(false);
            parsed = parseResponse(response);
            if (allowCompatibilityFallback && !parsed.text && !parsed.toolCalls.length) {
                response = await createRequest(true);
                parsed = parseResponse(response);
            }
        } catch (error) {
            if (!allowCompatibilityFallback || !shouldRetryWithLegacySystem(error)) {
                throw error;
            }
            response = await createRequest(true);
            parsed = parseResponse(response);
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
