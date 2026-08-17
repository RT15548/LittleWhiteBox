import {
    buildHostChatCompletionGenerateRequest,
    buildHostClaudeGeneratePayload,
    createHostChatCompletion,
    streamHostChatCompletion,
} from '../../../shared/host-llm/chat-completions/client.js';
import { redactRequestSecrets } from './request-inspection.js';

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

/** Models where SillyTavern may enable Anthropic manual (budgeted) extended thinking. */
const CLAUDE_THINKING_MODEL_PATTERN = /^claude-(3-7|opus-4|sonnet-4|haiku-4-5|opus-4-5|opus-4-6|sonnet-4-6|opus-4-7)/;
/**
 * Only these models are guaranteed adaptive thinking, which does support forced tool use.
 * Claude 4.6 depends on the host's `claude.enableAdaptiveThinking` config, which the client
 * cannot observe, so it is treated conservatively as manual thinking.
 */
const CLAUDE_CONFIRMED_ADAPTIVE_THINKING_PATTERN = /^claude-opus-4-7/;

/**
 * Manual extended thinking is incompatible with a forced tool choice. The tool contract wins:
 * reasoning is dropped for this request only, and the decision is surfaced as a notice.
 */
export function resolveHostClaudeToolProtocol(config = {}, task = {}) {
    const hasTools = Array.isArray(task.tools) && task.tools.length > 0;
    if (!hasTools) return { toolChoice: undefined, reasoningDisabledForForcedTool: false };
    const toolChoice = resolveHostClaudeToolChoice(task.toolChoice);
    const model = String(config.model || '').trim();
    const manualThinking = CLAUDE_THINKING_MODEL_PATTERN.test(model)
        && !CLAUDE_CONFIRMED_ADAPTIVE_THINKING_PATTERN.test(model);
    return {
        toolChoice,
        reasoningDisabledForForcedTool: toolChoice === 'any'
            && task.reasoning?.enabled === true
            && manualThinking,
    };
}

export const HOST_CLAUDE_FORCED_TOOL_REASONING_NOTICE = '当前模型使用手动 thinking，与强制 Tool 调用冲突；本次请求已因强制 Tool 关闭 Reasoning。';

function buildEffectiveConfig(task = {}, protocol = {}) {
    const reasoningEnabled = task.reasoning?.enabled === true
        && protocol.reasoningDisabledForForcedTool !== true;
    return {
        toolChoice: String(protocol.toolChoice || ''),
        reasoningEnabled,
        reasoningEffort: reasoningEnabled ? String(task.reasoning?.effort || '') : '',
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
                return { type: 'thinking', thinking: String(block.thinking || block.text || '') };
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
    const thoughts = normalized
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

function createClaudeStreamAccumulator(task, config = {}) {
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
            thoughts: result.thoughts,
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
            return parseContentResult(blocks, { finishReason, model });
        },
    };
}

export class SillyTavernClaudeAdapter {
    constructor(config) {
        this.config = config;
    }

    buildMessages(task) {
        return buildHostClaudeMessages(task);
    }

    resolveToolProtocol(task) {
        return resolveHostClaudeToolProtocol(this.config, task);
    }

    buildPayload(task, protocol = this.resolveToolProtocol(task)) {
        const stream = typeof task.onStreamProgress === 'function';
        const messages = this.buildMessages(task);
        const effectiveTask = {
            ...task,
            toolChoice: protocol.toolChoice,
            ...(protocol.reasoningDisabledForForcedTool
                ? { reasoning: { ...(task.reasoning || {}), enabled: false } }
                : {}),
        };
        return buildHostClaudeGeneratePayload(this.config, effectiveTask, messages, stream);
    }

    async inspectRequest(task, options = {}) {
        const protocol = this.resolveToolProtocol(task);
        const payload = options.payload || this.buildPayload(task, protocol);
        const request = await buildHostChatCompletionGenerateRequest(
            payload,
            typeof task.onStreamProgress === 'function',
        );
        return this.buildRequestInspection(request, protocol, task);
    }

    buildRequestInspection(request, protocol = {}, task = {}) {
        return {
            provider: 'sillytavern-claude',
            model: this.config.model,
            transport: 'sillytavern-chat-completions',
            request: redactRequestSecrets(request),
            effectiveConfig: buildEffectiveConfig(task, protocol),
            ...(protocol.reasoningDisabledForForcedTool
                ? { notices: [HOST_CLAUDE_FORCED_TOOL_REASONING_NOTICE] }
                : {}),
        };
    }

    async chat(task) {
        const stream = typeof task.onStreamProgress === 'function';
        const protocol = this.resolveToolProtocol(task);
        const payload = this.buildPayload(task, protocol);
        let requestInspection = null;
        const onRequest = (request) => {
            requestInspection = this.buildRequestInspection(request, protocol, task);
        };

        try {
            if (stream) {
                const accumulator = createClaudeStreamAccumulator(task, this.config);
                await streamHostChatCompletion(payload, (event) => {
                    accumulator.accept(event);
                }, { signal: task.signal, onRequest });
                return {
                    ...accumulator.result(),
                    requestInspection,
                };
            }

            const response = await createHostChatCompletion(payload, { signal: task.signal, onRequest });
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
