import OpenAI from 'openai';
import {
    buildEffectiveReasoningConfig,
    buildSdkRequestInspection,
} from './request-inspection.js';
import {
    resolveTaskReasoning,
    shouldOmitTemperatureForReasoning,
} from '../reasoning-capabilities.js';
import { isReasoningOutputVisible } from '../reasoning-config.js';

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function buildReplayableResponseOutput(output) {
    const cloned = cloneJson(Array.isArray(output) ? output : []);
    if (!Array.isArray(cloned)) return [];

    cloned.forEach((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return;

        // OpenAI's streaming SDK adds parsed projections to finalResponse().
        // They are useful to SDK consumers but are not legal Responses input fields.
        if (item.type === 'function_call') {
            delete item.parsed_arguments;
        }
        if (item.type === 'message' && Array.isArray(item.content)) {
            item.content.forEach((part) => {
                if (!part || typeof part !== 'object' || Array.isArray(part)) return;
                delete part.parsed;
            });
        }
    });

    return cloned;
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

function assertResponsesResponseShape(response) {
    if (response && typeof response === 'object'
        && !Array.isArray(response)
        && !Object.prototype.hasOwnProperty.call(response, 'choices')
        && Array.isArray(response.output)) {
        return;
    }
    const error = new Error('当前端点返回的不是 Responses API，请改用 OpenAI 兼容。');
    error.name = 'OpenAIResponsesEndpointMismatchError';
    error.code = 'OPENAI_RESPONSES_ENDPOINT_MISMATCH';
    throw error;
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

        if (message.role === 'assistant'
            && Array.isArray(message?.providerPayload?.openAIResponseOutput)
            && message.providerPayload.openAIResponseOutput.length) {
            input.push(...buildReplayableResponseOutput(message.providerPayload.openAIResponseOutput));
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

        if (message.role === 'assistant'
            && Array.isArray(message?.providerPayload?.openAIResponseOutput)
            && message.providerPayload.openAIResponseOutput.length) {
            input.push(...buildReplayableResponseOutput(message.providerPayload.openAIResponseOutput));
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
            timeout: Number(config.timeoutMs) || 15 * 60 * 1000,
            maxRetries: 0,
            dangerouslyAllowBrowser: true,
        });
    }

    buildRequestBody(
        task,
        legacySystemInInput = false,
        effectiveReasoning = resolveTaskReasoning('openai-responses', this.config, task.reasoning),
    ) {
        const reasoning = effectiveReasoning;
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
        if (!shouldOmitTemperatureForReasoning(
            { ...this.config, provider: 'openai-responses' },
            reasoning,
        ) && typeof task.temperature === 'number') {
            body.temperature = task.temperature;
        }
        if (reasoning.mode === 'on' || reasoning.mode === 'off') {
            body.reasoning = {
                effort: reasoning.mode === 'off' ? 'none' : reasoning.effort,
                ...(reasoning.mode === 'on' && isReasoningOutputVisible(reasoning)
                    ? { summary: 'auto' }
                    : {}),
            };
        } else if (isReasoningOutputVisible(reasoning)) {
            body.reasoning = { summary: 'auto' };
        }
        if (reasoning.mode !== 'off' && reasoning.profileId.startsWith('openai-')) {
            body.include = ['reasoning.encrypted_content'];
        }
        return body;
    }

    inspectRequest(task, options = {}) {
        const stream = typeof task.onStreamProgress === 'function';
        const legacySystemInInput = options.legacySystemInInput === true;
        const baseUrl = String(this.config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
        const effectiveReasoning = options.effectiveReasoning
            || resolveTaskReasoning('openai-responses', this.config, task.reasoning);
        const body = options.body || this.buildRequestBody(task, legacySystemInInput, effectiveReasoning);
        return buildSdkRequestInspection({
            provider: 'openai-responses',
            model: this.config.model,
            transport: 'openai-responses',
            url: `${baseUrl}/responses`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : '',
            },
            body,
            sdk: stream ? 'client.responses.stream' : 'client.responses.create',
            effectiveConfig: buildEffectiveReasoningConfig(task, {
                reasoning: effectiveReasoning,
                effort: body.reasoning?.effort,
                controlFields: {
                    ...(body.reasoning ? { reasoning: body.reasoning } : {}),
                    ...(body.include ? { include: body.include } : {}),
                },
            }),
        });
    }

    async chat(task) {
        const effectiveReasoning = resolveTaskReasoning('openai-responses', this.config, task.reasoning);
        const requestAttempts = [];
        const buildRequestInspection = () => {
            const latest = requestAttempts.at(-1)?.inspection || {};
            return {
                ...latest,
                requestCount: requestAttempts.length,
                fallbackCount: Math.max(0, requestAttempts.length - 1),
                requests: requestAttempts.map(({ reason, inspection }, index) => ({
                    index: index + 1,
                    reason,
                    request: inspection.request,
                    effectiveConfig: inspection.effectiveConfig,
                })),
            };
        };
        const attachRequestInspection = (error) => {
            if (error && typeof error === 'object') {
                error.requestInspection = buildRequestInspection();
            }
            return error;
        };
        const parseResponse = (response) => {
            assertResponsesResponseShape(response);
            const output = response.output;
            const thoughts = isReasoningOutputVisible(effectiveReasoning) ? extractThoughts(output) : [];
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

        const recordRequest = (body, legacySystemInInput, reason) => {
            const inspection = this.inspectRequest(task, {
                body,
                legacySystemInInput,
                effectiveReasoning,
            });
            requestAttempts.push({ reason, inspection });
        };

        const createRequest = async (legacySystemInInput = false, reason = 'initial') => {
            const body = this.buildRequestBody(task, legacySystemInInput, effectiveReasoning);
            recordRequest(body, legacySystemInInput, reason);
            try {
                return await this.client.responses.create(body, {
                    signal: task.signal,
                });
            } catch (error) {
                throw attachRequestInspection(error);
            }
        };

        const createStreamRequest = async (legacySystemInInput = false, reason = 'initial') => {
            const body = this.buildRequestBody(task, legacySystemInInput, effectiveReasoning);
            recordRequest(body, legacySystemInInput, reason);
            try {
                const stream = this.client.responses.stream(body, {
                    signal: task.signal,
                });
                const textByPart = new Map();
                const reasoningByPart = new Map();
                const summaryByPart = new Map();

                const emitSnapshot = () => {
                    const thoughts = [];
                    if (isReasoningOutputVisible(effectiveReasoning)) {
                        Array.from(reasoningByPart.entries())
                            .sort(([left], [right]) => comparePartKeys(left, right))
                            .forEach(([, text]) => pushThought(thoughts, '推理文本', text));
                        Array.from(summaryByPart.entries())
                            .sort(([left], [right]) => comparePartKeys(left, right))
                            .forEach(([, text]) => pushThought(thoughts, '推理摘要', text));
                    }
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
            } catch (error) {
                throw attachRequestInspection(error);
            }
        };

        const allowCompatibilityFallback = !isOfficialOpenAIBaseUrl(this.config.baseUrl);
        const sendRequest = typeof task.onStreamProgress === 'function'
            ? createStreamRequest
            : createRequest;
        let response;
        let parsed;

        try {
            response = await sendRequest(false, 'initial');
            parsed = parseResponse(response);
        } catch (error) {
            if (!allowCompatibilityFallback || !shouldRetryWithLegacySystem(error)) {
                throw attachRequestInspection(error);
            }
            response = await sendRequest(true, 'legacy_system_error');
            try {
                parsed = parseResponse(response);
            } catch (retryError) {
                throw attachRequestInspection(retryError);
            }
        }

        if (allowCompatibilityFallback
            && requestAttempts.length < 2
            && !parsed.text
            && !parsed.toolCalls.length) {
            response = await sendRequest(true, 'empty_response');
            try {
                parsed = parseResponse(response);
            } catch (retryError) {
                throw attachRequestInspection(retryError);
            }
        }

        return {
            text: parsed.text,
            toolCalls: parsed.toolCalls,
            thoughts: parsed.thoughts,
            finishReason: response.incomplete_details?.reason || response.status || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-responses',
            providerPayload: parsed.output.length
                ? { openAIResponseOutput: buildReplayableResponseOutput(parsed.output) }
                : undefined,
            requestInspection: buildRequestInspection(),
        };
    }
}
