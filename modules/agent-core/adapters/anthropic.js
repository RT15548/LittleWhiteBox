import Anthropic from '@anthropic-ai/sdk';
import {
    buildEffectiveReasoningConfig,
    buildSdkRequestInspection,
} from './request-inspection.js';
import {
    resolveReasoningCapability,
    resolveTaskReasoning,
    shouldOmitTemperatureForReasoning,
} from '../reasoning-capabilities.js';
import {
    isReasoningOutputVisible,
    normalizeReasoningConfig,
} from '../reasoning-config.js';

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

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
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

function normalizeAnthropicContent(message) {
    const content = message?.providerPayload?.anthropicContent;
    return Array.isArray(content) && content.length
        ? cloneJson(content) || null
        : null;
}

function buildProviderPayload(response) {
    return Array.isArray(response?.content) && response.content.length
        ? { anthropicContent: cloneJson(response.content) || [] }
        : undefined;
}

function buildToolResultBlock(message = {}) {
    return {
        type: 'tool_result',
        tool_use_id: message.tool_call_id,
        content: message.content,
    };
}

function buildToolUseBlocksFromToolCalls(toolCalls = []) {
    return (Array.isArray(toolCalls) ? toolCalls : [])
        .map((toolCall) => {
            const name = String(toolCall?.function?.name || '').trim();
            if (!name) return null;
            return {
                type: 'tool_use',
                id: toolCall.id,
                name,
                input: parseArguments(toolCall.function.arguments),
            };
        })
        .filter(Boolean);
}

export function buildAnthropicMessages(messages) {
    const filtered = [];

    for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index];
        if (message.role === 'system') continue;

        if (message.role === 'assistant') {
            const preservedContent = normalizeAnthropicContent(message);
            const topLevelToolUses = buildToolUseBlocksFromToolCalls(message.tool_calls);
            if (preservedContent && topLevelToolUses.length) {
                filtered.push({
                    role: 'assistant',
                    content: preservedContent
                        .filter((block) => block?.type !== 'tool_use')
                        .concat(topLevelToolUses),
                });
                continue;
            }
            if (preservedContent) {
                filtered.push({
                    role: 'assistant',
                    content: preservedContent,
                });
                continue;
            }
        }

        if (message.role === 'tool') {
            const toolResults = [buildToolResultBlock(message)];
            while (messages[index + 1]?.role === 'tool') {
                index += 1;
                toolResults.push(buildToolResultBlock(messages[index]));
            }
            filtered.push({
                role: 'user',
                content: toolResults,
            });
            continue;
        }

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            filtered.push({
                role: 'assistant',
                content: [
                    ...(message.content ? [{ type: 'text', text: message.content }] : []),
                    ...buildToolUseBlocksFromToolCalls(message.tool_calls),
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

function emitStreamProgress(task, payload) {
    if (typeof task.onStreamProgress !== 'function') return;
    task.onStreamProgress({
        ...(typeof payload.text === 'string' ? { text: payload.text } : {}),
        ...(Array.isArray(payload.thoughts) ? { thoughts: payload.thoughts } : {}),
        ...(Array.isArray(payload.toolCalls) ? { toolCalls: payload.toolCalls } : {}),
        ...(payload.toolCallDraft ? { toolCallDraft: true } : {}),
    });
}

export function normalizeAnthropicSdkBaseUrl(baseUrl = '') {
    return String(baseUrl || 'https://api.anthropic.com')
        .trim()
        .replace(/\/+$/, '')
        .replace(/\/v1$/i, '');
}

export function resolveAnthropicToolChoice(toolChoice = 'auto', tools = []) {
    const availableNames = new Set((Array.isArray(tools) ? tools : [])
        .map((tool) => String(tool?.function?.name || '').trim())
        .filter(Boolean));
    const normalizedChoice = String(toolChoice || 'auto').trim() || 'auto';

    if (normalizedChoice === 'auto') return { type: 'auto' };
    if (normalizedChoice === 'required') return { type: 'any' };
    if (normalizedChoice === 'none') return { type: 'none' };
    if (!availableNames.has(normalizedChoice)) {
        throw new Error(`Anthropic toolChoice 指定了不存在的工具：${normalizedChoice}`);
    }
    return { type: 'tool', name: normalizedChoice };
}

export const ANTHROPIC_FORCED_TOOL_REASONING_NOTICE = '当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。';

function resolveAnthropicRequestProtocol(config = {}, task = {}) {
    const sourceTools = Array.isArray(task.tools) ? task.tools : [];
    const toolChoice = sourceTools.length
        ? resolveAnthropicToolChoice(task.toolChoice, sourceTools)
        : undefined;
    const requestedReasoning = normalizeReasoningConfig(task.reasoning);
    const capability = resolveReasoningCapability({
        provider: 'anthropic',
        baseUrl: config.baseUrl,
        model: config.model,
    });
    const reasoningDisabledForForcedTool = requestedReasoning.mode === 'on'
        && capability.profileId === 'anthropic-manual'
        && (toolChoice?.type === 'any' || toolChoice?.type === 'tool');
    const effectiveReasoning = resolveTaskReasoning('anthropic', config, {
        ...requestedReasoning,
        ...(reasoningDisabledForForcedTool ? { mode: 'off' } : {}),
    }, {
        maxTokens: task.maxTokens,
    });
    return {
        toolChoice,
        reasoning: reasoningDisabledForForcedTool
            ? { ...requestedReasoning, profileId: capability.profileId }
            : effectiveReasoning,
        effectiveReasoning,
        reasoningDisabledForForcedTool,
    };
}

export class AnthropicAdapter {
    constructor(config) {
        this.config = config;
        this.client = new Anthropic({
            apiKey: config.apiKey,
            baseURL: normalizeAnthropicSdkBaseUrl(config.baseUrl),
            timeout: Number(config.timeoutMs) || 15 * 60 * 1000,
            maxRetries: 0,
            dangerouslyAllowBrowser: true,
        });
    }

    buildRequestBody(task) {
        const protocol = resolveAnthropicRequestProtocol(this.config, task);
        const reasoning = protocol.effectiveReasoning;
        const sourceTools = Array.isArray(task.tools) ? task.tools : [];
        const tools = sourceTools.map((tool) => ({
            name: tool.function.name,
            description: tool.function.description,
            input_schema: tool.function.parameters,
        }));
        const system = resolveSystemPrompt(task);
        const body = {
            model: this.config.model,
            system,
            messages: buildAnthropicMessages(task.messages),
            ...(tools.length ? {
                tools,
                tool_choice: protocol.toolChoice,
            } : {}),
            ...(task.maxTokens ? { max_tokens: task.maxTokens } : {}),
        };
        if (!shouldOmitTemperatureForReasoning(
            { ...this.config, provider: 'anthropic' },
            reasoning,
        ) && typeof task.temperature === 'number') {
            body.temperature = task.temperature;
        }
        if (reasoning.mode === 'off') {
            body.thinking = { type: 'disabled' };
        } else if (reasoning.mode === 'on' && reasoning.profileId === 'anthropic-adaptive') {
            body.thinking = {
                type: 'adaptive',
                display: isReasoningOutputVisible(reasoning) ? 'summarized' : 'omitted',
            };
            body.output_config = { effort: reasoning.effort };
        } else if (reasoning.mode === 'on' && reasoning.profileId === 'anthropic-manual') {
            body.thinking = {
                type: 'enabled',
                budget_tokens: reasoning.budgetTokens,
                display: isReasoningOutputVisible(reasoning) ? 'summarized' : 'omitted',
            };
        }
        return body;
    }

    inspectRequest(task, options = {}) {
        const stream = typeof task.onStreamProgress === 'function';
        const baseUrl = normalizeAnthropicSdkBaseUrl(this.config.baseUrl);
        const body = options.body || this.buildRequestBody(task);
        const protocol = resolveAnthropicRequestProtocol(this.config, task);
        const reasoning = protocol.effectiveReasoning;
        const inspection = buildSdkRequestInspection({
            provider: 'anthropic',
            model: this.config.model,
            transport: 'anthropic-sdk',
            url: `${baseUrl}/v1/messages`,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.config.apiKey || '',
            },
            body,
            sdk: stream ? 'client.messages.stream' : 'client.messages.create',
            effectiveConfig: buildEffectiveReasoningConfig(task, {
                profileId: protocol.reasoning.profileId,
                effectiveMode: reasoning.mode,
                effort: body.output_config?.effort,
                budgetTokens: body.thinking?.budget_tokens,
                controlFields: {
                    ...(body.thinking ? { thinking: body.thinking } : {}),
                    ...(body.output_config ? { output_config: body.output_config } : {}),
                },
            }),
        });
        return {
            ...inspection,
            ...(protocol.reasoningDisabledForForcedTool
                ? { notices: [ANTHROPIC_FORCED_TOOL_REASONING_NOTICE] }
                : {}),
        };
    }

    async chat(task) {
        const body = this.buildRequestBody(task);
        const requestInspection = this.inspectRequest(task, { body });
        let response;

        if (typeof task.onStreamProgress === 'function') {
            const stream = this.client.messages.stream(body, {
                signal: task.signal,
            });
            const thoughtMap = new Map();
            const toolDraftMap = new Map();
            let streamText = '';
            const buildThoughts = () => isReasoningOutputVisible(task.reasoning)
                ? Array.from(thoughtMap.entries())
                    .sort(([left], [right]) => left.localeCompare(right))
                    .map(([key, text]) => ({
                        label: key.startsWith('redacted:') ? '已脱敏思考块' : '思考块',
                        text,
                    }))
                    .filter((item) => item.text)
                : [];
            const buildToolDrafts = () => Array.from(toolDraftMap.entries())
                .sort(([left], [right]) => Number(left) - Number(right))
                .map(([, toolCall]) => ({
                    id: toolCall.id || 'anthropic-tool-draft',
                    name: toolCall.name || '工具调用',
                    arguments: toolCall.inputJson || '{}',
                    draft: true,
                }))
                .filter((item) => item.name);
            const emitToolDraftProgress = () => {
                const toolCalls = buildToolDrafts();
                if (!toolCalls.length) return;
                emitStreamProgress(task, {
                    text: streamText,
                    thoughts: buildThoughts(),
                    toolCalls,
                    toolCallDraft: true,
                });
            };

            stream.on('text', (_delta, snapshot) => {
                streamText = snapshot || '';
                emitStreamProgress(task, {
                    text: streamText,
                    thoughts: buildThoughts(),
                    ...(buildToolDrafts().length ? { toolCalls: buildToolDrafts(), toolCallDraft: true } : {}),
                });
            });
            stream.on('thinking', (_delta, snapshot) => {
                thoughtMap.set('thinking:0', snapshot || '');
                emitStreamProgress(task, {
                    thoughts: buildThoughts(),
                    ...(buildToolDrafts().length ? { text: streamText, toolCalls: buildToolDrafts(), toolCallDraft: true } : {}),
                });
            });
            stream.on('streamEvent', (event) => {
                if (event?.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
                    const initialInput = event.content_block.input && typeof event.content_block.input === 'object'
                        ? event.content_block.input
                        : {};
                    toolDraftMap.set(event.index, {
                        id: event.content_block.id || `anthropic-tool-draft-${event.index + 1}`,
                        name: event.content_block.name || '工具调用',
                        inputJson: Object.keys(initialInput).length ? JSON.stringify(initialInput) : '',
                    });
                    emitToolDraftProgress();
                    return;
                }
                if (event?.type === 'content_block_delta' && event.delta?.type === 'input_json_delta') {
                    const existing = toolDraftMap.get(event.index) || {
                        id: `anthropic-tool-draft-${event.index + 1}`,
                        name: '工具调用',
                        inputJson: '',
                    };
                    toolDraftMap.set(event.index, {
                        ...existing,
                        inputJson: `${existing.inputJson || ''}${event.delta.partial_json || ''}`,
                    });
                    emitToolDraftProgress();
                }
            });
            stream.on('contentBlock', (contentBlock) => {
                if (contentBlock?.type !== 'redacted_thinking') return;
                thoughtMap.set('redacted:0', contentBlock.data || '');
                emitStreamProgress(task, {
                    thoughts: buildThoughts(),
                    ...(buildToolDrafts().length ? { text: streamText, toolCalls: buildToolDrafts(), toolCallDraft: true } : {}),
                });
            });
            response = await stream.finalMessage();
        } else {
            response = await this.client.messages.create(body, {
                signal: task.signal,
            });
        }

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
        const thoughts = isReasoningOutputVisible(task.reasoning)
            ? (response.content || [])
                .filter((item) => item.type === 'thinking' || item.type === 'redacted_thinking')
                .map((item) => ({
                    label: item.type === 'thinking' ? '思考块' : '已脱敏思考块',
                    text: item.type === 'thinking' ? (item.thinking || '') : (item.data || ''),
                }))
                .filter((item) => item.text)
            : [];

        return {
            text,
            toolCalls,
            thoughts,
            finishReason: response.stop_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'anthropic',
            providerPayload: buildProviderPayload(response),
            requestInspection,
        };
    }
}
