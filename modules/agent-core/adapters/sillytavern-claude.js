import {
    assertHostChatCompletionsClient,
    browserHostChatCompletionsClient,
    buildHostClaudeGeneratePayload,
} from '../../../shared/host-llm/chat-completions/client.js';
import {
    buildEffectiveReasoningConfig,
    redactRequestSecrets,
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

/**
 * The host backend forwards `tool_choice` as `{ type: <string> }` straight to Anthropic, so the
 * generic AgentCore value has to be translated to Anthropic vocabulary at this adapter boundary.
 * The shared host/OpenAI helper stays untouched; other hosted providers keep receiving `required`.
 */
export function resolveHostClaudeToolChoice(toolChoice) {
    const normalized = String(toolChoice || '').trim();
    if (!normalized || normalized === 'auto') return 'auto';
    if (normalized === 'required') return 'any';
    if (normalized === 'none') return 'none';
    throw new Error(
        `酒馆托管 Claude 不支持 tool_choice：${normalized}。仅支持 auto/required/none。`,
    );
}

/**
 * Manual extended thinking is incompatible with a forced tool choice. The tool contract wins:
 * reasoning is dropped for this request only, and the decision is surfaced as a notice.
 */
export function resolveHostClaudeToolProtocol(
    config = {},
    task = {},
    reasoning = resolveTaskReasoning('sillytavern-claude', config, task.reasoning),
) {
    const hasTools = Array.isArray(task.tools) && task.tools.length > 0;
    if (!hasTools) return { toolChoice: undefined, reasoningDisabledForForcedTool: false };
    const toolChoice = resolveHostClaudeToolChoice(task.toolChoice);
    const manualThinking = reasoning.profileId === 'sillytavern-claude-manual'
        || reasoning.profileId === 'sillytavern-claude-adaptive-conditional';
    return {
        toolChoice,
        reasoningDisabledForForcedTool: toolChoice === 'any'
            && reasoning.mode === 'on'
            && manualThinking,
    };
}

export const HOST_CLAUDE_FORCED_TOOL_REASONING_NOTICE = '当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。';

function resolveEffectiveReasoning(config = {}, task = {}, protocol = {}, reasoning) {
    const requestedReasoning = reasoning
        || resolveTaskReasoning('sillytavern-claude', config, task.reasoning);
    return protocol.reasoningDisabledForForcedTool
        ? { ...requestedReasoning, mode: 'off', output: 'hide' }
        : requestedReasoning;
}

function buildEffectiveConfig(task = {}, protocol = {}, effectiveReasoning = {}) {
    return buildEffectiveReasoningConfig(task, {
        reasoning: effectiveReasoning,
        effort: effectiveReasoning.mode === 'on' ? effectiveReasoning.effort : '',
        controlFields: protocol.controlFields || {},
    });
}

function buildToolConfig(task = {}, protocol = {}) {
    return {
        toolChoice: String(protocol.toolChoice || ''),
    };
}

function parseToolInputJson(text = '') {
    try {
        return {
            ok: true,
            input: JSON.parse(String(text || '')),
        };
    } catch (error) {
        return {
            ok: false,
            input: {},
            raw: String(text || ''),
            error: error instanceof Error ? error.message : String(error || 'invalid_tool_input_json'),
        };
    }
}

function buildAnthropicToolUseBlocksFromToolCalls(toolCalls = []) {
    return (Array.isArray(toolCalls) ? toolCalls : [])
        .map((toolCall) => {
            const name = String(toolCall?.function?.name || '').trim();
            if (!name) return null;
            const parsed = parseToolInputJson(toolCall.function.arguments || '{}');
            return {
                type: 'tool_use',
                id: String(toolCall.id || name),
                name,
                input: parsed.input,
                ...(parsed.ok ? {} : {
                    invalidInputJson: parsed.raw,
                    inputParseError: parsed.error,
                }),
            };
        })
        .filter(Boolean);
}

function normalizeAnthropicContent(content = []) {
    const normalized = Array.isArray(content)
        ? cloneJson(content)
        : null;
    return Array.isArray(normalized) && normalized.length
        ? normalized
        : null;
}

function buildHostClaudeMessages(task = {}) {
    const sourceMessages = Array.isArray(task.messages) ? task.messages : [];
    const messages = [];
    sourceMessages.forEach((message) => {
        if (!message || typeof message !== 'object') return;
        const cloned = cloneJson(message) || {};
        const preservedContent = normalizeAnthropicContent(cloned?.providerPayload?.anthropicContent);
        const topLevelToolUses = buildAnthropicToolUseBlocksFromToolCalls(cloned.tool_calls);
        delete cloned.providerPayload;
        if (cloned.role === 'assistant' && preservedContent && topLevelToolUses.length) {
            delete cloned.tool_calls;
            cloned.content = preservedContent
                .filter((block) => block?.type !== 'tool_use')
                .concat(topLevelToolUses);
        } else if (cloned.role === 'assistant' && preservedContent) {
            delete cloned.tool_calls;
            cloned.content = preservedContent;
        }
        messages.push(cloned);
    });
    const systemPrompt = typeof task.systemPrompt === 'string' ? task.systemPrompt : '';
    if (systemPrompt.trim() && !(messages[0]?.role === 'system' && messages[0]?.content === systemPrompt)) {
        messages.unshift({ role: 'system', content: systemPrompt });
    }
    return messages;
}

function normalizeContentBlocks(content = []) {
    return (Array.isArray(content) ? content : [])
        .map((block) => {
            if (!block || typeof block !== 'object') return null;
            if (block.type === 'text') {
                return { type: 'text', text: String(block.text || '') };
            }
            if (block.type === 'tool_use' && block.name) {
                if (block.inputJson !== undefined) {
                    const parsed = parseToolInputJson(block.inputJson);
                    return {
                        type: 'tool_use',
                        id: String(block.id || block.name),
                        name: String(block.name),
                        input: parsed.input,
                        ...(parsed.ok ? {} : {
                            invalidInputJson: parsed.raw,
                            inputParseError: parsed.error,
                        }),
                    };
                }
                const clonedInput = cloneJson(block.input);
                if (clonedInput !== undefined) {
                    return {
                        type: 'tool_use',
                        id: String(block.id || block.name),
                        name: String(block.name),
                        input: clonedInput,
                    };
                }
                return {
                    type: 'tool_use',
                    id: String(block.id || block.name),
                    name: String(block.name),
                    input: {},
                };
            }
            if (block.type === 'thinking') {
                return {
                    type: 'thinking',
                    thinking: String(block.thinking || block.text || ''),
                    ...(typeof block.signature === 'string'
                        ? { signature: block.signature }
                        : {}),
                };
            }
            if (block.type === 'redacted_thinking') {
                return { type: 'redacted_thinking', data: String(block.data || '') };
            }
            return cloneJson(block) || null;
        })
        .filter(Boolean);
}

function buildProviderPayloadContent(blocks = []) {
    return blocks.map((block) => {
        if (!block || typeof block !== 'object') return null;
        if (block.type === 'tool_use' && block.name) {
            return {
                type: 'tool_use',
                id: block.id,
                name: block.name,
                input: cloneJson(block.input) || {},
            };
        }
        return cloneJson(block) || null;
    }).filter(Boolean);
}

function buildStreamProgressSnapshot(content = []) {
    const source = Array.isArray(content) ? content : [];
    const text = source
        .filter((block) => block?.type === 'text')
        .map((block) => block.text || '')
        .join('\n');
    const thoughts = source
        .filter((block) => block?.type === 'thinking' || block?.type === 'redacted_thinking')
        .map((block) => ({
            label: block.type === 'thinking' ? '思考块' : '已脱敏思考块',
            text: block.type === 'thinking' ? (block.thinking || '') : (block.data || ''),
        }))
        .filter((item) => item.text);
    const toolCalls = source
        .filter((block) => block?.type === 'tool_use' && block.name)
        .map((block, index) => ({
            id: block.id || `st-claude-tool-${index + 1}`,
            name: block.name,
            arguments: block.inputJson !== undefined
                ? block.inputJson
                : JSON.stringify(block.input || {}),
        }));
    return {
        text,
        thoughts,
        ...(toolCalls.length ? { toolCalls, toolCallDraft: true } : {}),
    };
}

function parseContentResult(content = [], options = {}) {
    const normalized = normalizeContentBlocks(content);
    const toolCalls = normalized
        .filter((block) => block.type === 'tool_use' && block.name)
        .map((block, index) => ({
            id: block.id || `st-claude-tool-${index + 1}`,
            name: block.name,
            arguments: block.invalidInputJson !== undefined
                ? block.invalidInputJson
                : JSON.stringify(block.input || {}),
        }));
    const text = normalized
        .filter((block) => block.type === 'text')
        .map((block) => block.text || '')
        .join('\n');
    const thoughts = options.includeReasoningOutput === false
        ? []
        : normalized
            .filter((block) => block.type === 'thinking' || block.type === 'redacted_thinking')
            .map((block) => ({
                label: block.type === 'thinking' ? '思考块' : '已脱敏思考块',
                text: block.type === 'thinking' ? (block.thinking || '') : (block.data || ''),
            }))
            .filter((item) => item.text);

    return {
        text,
        toolCalls,
        thoughts,
        finishReason: options.finishReason || 'stop',
        model: options.model || '',
        provider: 'sillytavern-claude',
        providerPayload: normalized.length ? { anthropicContent: buildProviderPayloadContent(normalized) } : undefined,
    };
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

function createClaudeStreamAccumulator(task, effectiveReasoning, config = {}) {
    const blocks = [];
    let finishReason = 'stop';
    let model = config.model || '';

    const ensureBlock = (index, initial = {}) => {
        const safeIndex = Number.isInteger(Number(index)) ? Number(index) : blocks.length;
        if (!blocks[safeIndex]) {
            blocks[safeIndex] = { ...initial };
        } else {
            blocks[safeIndex] = { ...blocks[safeIndex], ...initial };
        }
        return blocks[safeIndex];
    };

    const emit = () => {
        const result = buildStreamProgressSnapshot(blocks);
        emitStreamProgress(task, {
            text: result.text,
            thoughts: isReasoningOutputVisible(effectiveReasoning) ? result.thoughts : [],
            ...(Array.isArray(result.toolCalls) ? { toolCalls: result.toolCalls } : {}),
            ...(result.toolCallDraft ? { toolCallDraft: true } : {}),
        });
    };

    return {
        accept(event = {}) {
            if (event?.message?.model) {
                model = event.message.model;
            }
            if (event.type === 'content_block_start') {
                ensureBlock(event.index, cloneJson(event.content_block) || {});
                emit();
                return;
            }
            if (event.type === 'content_block_delta') {
                const block = ensureBlock(event.index);
                const delta = event.delta || {};
                if (delta.type === 'text_delta') {
                    block.type = block.type || 'text';
                    block.text = `${block.text || ''}${delta.text || ''}`;
                } else if (delta.type === 'input_json_delta') {
                    block.type = block.type || 'tool_use';
                    block.inputJson = `${block.inputJson || ''}${delta.partial_json || ''}`;
                } else if (delta.type === 'thinking_delta') {
                    block.type = block.type || 'thinking';
                    block.thinking = `${block.thinking || ''}${delta.thinking || ''}`;
                } else if (delta.type === 'signature_delta') {
                    block.signature = `${block.signature || ''}${delta.signature || ''}`;
                }
                emit();
                return;
            }
            if (event.type === 'message_delta') {
                finishReason = event.delta?.stop_reason || finishReason;
            }
        },
        result() {
            return parseContentResult(blocks, {
                finishReason,
                model,
                includeReasoningOutput: isReasoningOutputVisible(effectiveReasoning),
            });
        },
    };
}

export class SillyTavernClaudeAdapter {
    constructor(config, hostClient = browserHostChatCompletionsClient) {
        this.config = config;
        this.hostClient = assertHostChatCompletionsClient(hostClient);
    }

    buildMessages(task) {
        return buildHostClaudeMessages(task);
    }

    resolveToolProtocol(task, reasoning) {
        return resolveHostClaudeToolProtocol(this.config, task, reasoning);
    }

    buildPayload(
        task,
        protocol = this.resolveToolProtocol(task),
        effectiveReasoning = resolveEffectiveReasoning(this.config, task, protocol),
    ) {
        const stream = typeof task.onStreamProgress === 'function';
        const messages = this.buildMessages(task);
        const effectiveTask = {
            ...task,
            toolChoice: protocol.toolChoice,
            reasoning: effectiveReasoning,
            temperature: shouldOmitTemperatureForReasoning(
                { ...this.config, provider: 'sillytavern-claude' },
                effectiveReasoning,
            ) ? undefined : task.temperature,
        };
        const payload = buildHostClaudeGeneratePayload(this.config, effectiveTask, messages, stream);
        if (effectiveReasoning.mode === 'on') {
            payload.reasoning_effort = effectiveReasoning.effort;
            payload.include_reasoning = isReasoningOutputVisible(effectiveReasoning);
        } else if (effectiveReasoning.mode === 'off') {
            payload.reasoning_effort = 'auto';
            payload.include_reasoning = false;
        } else {
            payload.reasoning_effort = 'auto';
            payload.include_reasoning = isReasoningOutputVisible(effectiveReasoning);
        }
        return payload;
    }

    async inspectRequest(task, options = {}) {
        const requestedReasoning = resolveTaskReasoning('sillytavern-claude', this.config, task.reasoning);
        const protocol = options.protocol || this.resolveToolProtocol(task, requestedReasoning);
        const effectiveReasoning = options.effectiveReasoning
            || resolveEffectiveReasoning(this.config, task, protocol, requestedReasoning);
        const payload = options.payload || this.buildPayload(task, protocol, effectiveReasoning);
        const request = await this.hostClient.buildHostChatCompletionGenerateRequest(
            payload,
            typeof task.onStreamProgress === 'function',
        );
        return this.buildRequestInspection(request, protocol, task, effectiveReasoning);
    }

    buildRequestInspection(
        request,
        protocol = {},
        task = {},
        effectiveReasoning = resolveEffectiveReasoning(this.config, task, protocol),
    ) {
        const controlFields = {
            ...(Object.hasOwn(request?.body || {}, 'reasoning_effort')
                ? { reasoning_effort: request.body.reasoning_effort }
                : {}),
            ...(Object.hasOwn(request?.body || {}, 'include_reasoning')
                ? { include_reasoning: request.body.include_reasoning }
                : {}),
        };
        return {
            provider: 'sillytavern-claude',
            model: this.config.model,
            transport: 'sillytavern-chat-completions',
            request: redactRequestSecrets(request),
            effectiveConfig: {
                ...buildToolConfig(task, protocol),
                ...buildEffectiveConfig(task, { ...protocol, controlFields }, effectiveReasoning),
            },
            ...(protocol.reasoningDisabledForForcedTool
                ? { notices: [HOST_CLAUDE_FORCED_TOOL_REASONING_NOTICE] }
                : {}),
        };
    }

    async chat(task) {
        const requestedReasoning = resolveTaskReasoning('sillytavern-claude', this.config, task.reasoning);
        const stream = typeof task.onStreamProgress === 'function';
        const protocol = this.resolveToolProtocol(task, requestedReasoning);
        const effectiveReasoning = resolveEffectiveReasoning(
            this.config,
            task,
            protocol,
            requestedReasoning,
        );
        const payload = this.buildPayload(task, protocol, effectiveReasoning);
        let requestInspection = null;
        const onRequest = (request) => {
            requestInspection = this.buildRequestInspection(
                request,
                protocol,
                task,
                effectiveReasoning,
            );
        };

        try {
            if (stream) {
                const accumulator = createClaudeStreamAccumulator(
                    task,
                    effectiveReasoning,
                    this.config,
                );
                await this.hostClient.streamHostChatCompletion(payload, (event) => {
                    accumulator.accept(event);
                }, { signal: task.signal, onRequest });
                return {
                    ...accumulator.result(),
                    requestInspection,
                };
            }

            const response = await this.hostClient.createHostChatCompletion(
                payload,
                { signal: task.signal, onRequest },
            );
            const content = Array.isArray(response?.content)
                ? response.content
                : [{
                    type: 'text',
                    text: response?.choices?.[0]?.message?.content || '',
                }];
            return {
                ...parseContentResult(content, {
                    finishReason: response?.stop_reason || response?.choices?.[0]?.finish_reason || 'stop',
                    model: response?.model || this.config.model,
                    includeReasoningOutput: isReasoningOutputVisible(effectiveReasoning),
                }),
                requestInspection,
            };
        } catch (error) {
            if (requestInspection && error && typeof error === 'object') {
                error.requestInspection = requestInspection;
            }
            throw error;
        }
    }
}
