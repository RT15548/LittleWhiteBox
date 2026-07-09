import OpenAI from 'openai';
import { buildSdkRequestInspection } from './request-inspection.js';
import {
    extractLooseField,
    findLooseKeyMatch,
    repairLooseToolArguments,
} from '../runtime/loose-tool-arguments.js';

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

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function stringifyToolArguments(value) {
    if (typeof value === 'string') return value;
    if (value === undefined || value === null) return '{}';
    try {
        return JSON.stringify(value);
    } catch {
        return '{}';
    }
}

function normalizeTaggedToolArguments(argumentsValue, toolName = '') {
    if (argumentsValue && typeof argumentsValue === 'object' && !Array.isArray(argumentsValue)) {
        return JSON.stringify(argumentsValue);
    }
    const text = typeof argumentsValue === 'string' ? argumentsValue : stringifyToolArguments(argumentsValue);
    return repairLooseToolArguments(text, toolName) || JSON.stringify(safeParseArguments(text));
}

function extractLooseArgumentsTextFromToolPayload(payloadText = '') {
    const source = String(payloadText || '');
    const match = findLooseKeyMatch(source, 'arguments');
    if (!match) return '';
    let start = match.end;
    while (/\s/.test(source[start] || '')) start += 1;
    const first = source[start] || '';
    if (first === '{') {
        return source.slice(start).replace(/\}\s*$/, '').trimEnd();
    }
    if (first === '"') {
        return source.slice(start + 1).replace(/"\s*\}\s*$/, '').trimEnd();
    }
    return source.slice(start).replace(/\}\s*$/, '').trimEnd();
}

function parseLooseTaggedToolPayload(payloadText = '', index = 0) {
    const source = String(payloadText || '').trim();
    const name = extractLooseField(source, 'name', ['id', 'arguments'])
        || extractLooseField(source, 'toolName', ['id', 'arguments'])
        || '';
    const id = extractLooseField(source, 'id', ['name', 'toolName', 'arguments']) || `tool-call-${index + 1}`;
    const argumentsText = extractLooseArgumentsTextFromToolPayload(source);
    if (!name || !argumentsText) return null;
    return {
        id,
        name,
        arguments: normalizeTaggedToolArguments(argumentsText, name),
    };
}

function normalizeToolCallForReplay(toolCall, index = 0, fallbackPrefix = 'openai-tool') {
    if (!isPlainObject(toolCall)) return null;
    const toolFunction = isPlainObject(toolCall.function) ? toolCall.function : null;
    const name = String(toolFunction?.name || '').trim();
    if (!name) return null;

    const normalized = cloneJson(toolCall) || {};
    delete normalized.index;
    normalized.id = String(normalized.id || `${fallbackPrefix}-${index + 1}`);
    normalized.type = 'function';
    normalized.function = {
        ...(cloneJson(toolFunction) || {}),
        name,
        arguments: stringifyToolArguments(toolFunction.arguments),
    };
    return normalized;
}

function normalizeToolCallsForReplay(toolCalls = [], fallbackPrefix = 'openai-tool') {
    return (Array.isArray(toolCalls) ? toolCalls : [])
        .map((toolCall, index) => normalizeToolCallForReplay(toolCall, index, fallbackPrefix))
        .filter(Boolean);
}

function sanitizeOpenAICompatibleMessage(message) {
    if (!isPlainObject(message)) return null;
    const cloned = cloneJson(message) || {};
    if (typeof cloned.content === 'string' && /<tool_call\b/i.test(cloned.content)) {
        cloned.content = stripTaggedToolCallsForDisplay(extractThinkTaggedContent(cloned.content).cleaned);
    }
    if (Array.isArray(cloned.tool_calls)) {
        const normalizedToolCalls = normalizeToolCallsForReplay(cloned.tool_calls);
        if (normalizedToolCalls.length) {
            cloned.tool_calls = normalizedToolCalls;
        } else {
            delete cloned.tool_calls;
        }
    }
    return cloned;
}

export function buildToolCallResultsFromOpenAI(toolCalls = [], fallbackPrefix = 'openai-tool') {
    return normalizeToolCallsForReplay(toolCalls, fallbackPrefix).map((item, index) => ({
        id: item.id || `${fallbackPrefix}-${Date.now()}-${index + 1}`,
        name: item.function.name,
        arguments: item.function.arguments,
    }));
}

export function flattenTextContent(content) {
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

export function extractThinkTaggedContent(text = '') {
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

export function stripTaggedToolCallsForDisplay(text = '') {
    const source = String(text || '');
    const firstToolTag = source.search(/<tool_call\b/i);
    if (firstToolTag < 0) return source.trim();
    return source.slice(0, firstToolTag).trim();
}

export function buildTaggedToolCallDraft(text = '') {
    const source = String(text || '');
    if (!/<tool_call\b/i.test(source)) return [];
    const nameMatch = source.match(/["']?name["']?\s*:\s*["']([^"']+)/i);
    return [{
        id: 'tagged-json-draft',
        name: nameMatch?.[1] || '工具调用',
        arguments: '{}',
        draft: true,
    }];
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

export function extractThoughtsFromMessage(message = {}, choice = {}) {
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

export function extractTaggedToolCalls(content = '') {
    const patterns = [
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
                    arguments: normalizeTaggedToolArguments(parsed.arguments, parsed.name),
                });
            } catch {
                const repaired = parseLooseTaggedToolPayload(match[1], index);
                if (repaired) results.push(repaired);
            }
        });
    });

    return results.filter((item) => item.name);
}

function normalizeOpenAICompatibleMessage(message) {
    const preserved = message?.providerPayload?.openaiCompatibleMessage;
    if (!preserved || typeof preserved !== 'object' || Array.isArray(preserved)) {
        return null;
    }
    return sanitizeOpenAICompatibleMessage(preserved);
}

function getLastUserMessageIndex(messages = []) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        if (messages[index]?.role === 'user') {
            return index;
        }
    }
    return -1;
}

function hasReplayableToolCalls(message) {
    if (normalizeToolCallsForReplay(message?.tool_calls).length > 0) {
        return true;
    }
    const preserved = normalizeOpenAICompatibleMessage(message);
    return Array.isArray(preserved?.tool_calls) && preserved.tool_calls.length > 0;
}

function getReplayableToolCalls(message = {}) {
    const topLevelToolCalls = normalizeToolCallsForReplay(message?.tool_calls);
    if (topLevelToolCalls.length) return topLevelToolCalls;
    const preserved = normalizeOpenAICompatibleMessage(message);
    const preservedToolCalls = normalizeToolCallsForReplay(preserved?.tool_calls);
    if (preservedToolCalls.length) return preservedToolCalls;
    return [];
}

function hasValidToolCalls(message = {}) {
    return normalizeToolCallsForReplay(message?.tool_calls).length > 0;
}

function shouldPreserveAssistantReplayMessage(message, index, lastUserIndex) {
    if (message?.role !== 'assistant') return false;
    if (index <= lastUserIndex) return false;
    return hasReplayableToolCalls(message);
}

function shouldForceDeepSeekReasoningContent(model = '') {
    return /deepseek/i.test(String(model || ''));
}

export function isClaudeLikeModel(model = '') {
    return /claude/i.test(String(model || ''));
}

export function normalizeFinalClaudeLikeMessageRole(messages = [], model = '') {
    if (!isClaudeLikeModel(model)) return messages;
    let finalRoleIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        if (typeof messages[index]?.role === 'string') {
            finalRoleIndex = index;
            break;
        }
    }
    const finalRole = messages[finalRoleIndex]?.role;
    if (finalRoleIndex < 0 || finalRole === 'user') return messages;
    if (finalRole !== 'system' && finalRole !== 'assistant') return messages;
    return messages.map((message, index) => (
        index === finalRoleIndex
            ? { ...message, role: 'user' }
            : message
    ));
}

function ensureReasoningContentForToolCalls(message, model = '') {
    if (!isPlainObject(message)) return message;
    if (!shouldForceDeepSeekReasoningContent(model)) return message;
    if (!Array.isArray(message.tool_calls) || !message.tool_calls.length) return message;
    if (Object.prototype.hasOwnProperty.call(message, 'reasoning_content')) {
        return message;
    }
    return {
        ...message,
        reasoning_content: '',
    };
}

const APPENDABLE_STRING_FIELDS = new Set([
    'content',
    'refusal',
    'arguments',
    'reasoning_content',
    'reasoning_text',
    'thinking',
    'text',
]);

function mergeToolCallArrays(existing = [], next = []) {
    const merged = Array.isArray(existing)
        ? existing.map((item) => cloneJson(item) || {})
        : [];

    (Array.isArray(next) ? next : []).forEach((item, index) => {
        const normalizedItem = cloneJson(item) || {};
        const targetIndex = Number.isInteger(Number(item?.index))
            ? Number(item.index)
            : index;
        const current = merged[targetIndex];
        merged[targetIndex] = isPlainObject(current)
            ? mergeReplayValue(current, normalizedItem, 'tool_call')
            : normalizedItem;
    });

    return merged.filter((item) => item !== undefined);
}

function mergeReplayValue(existing, next, fieldName = '') {
    if (next === undefined) return existing;
    if (existing === undefined) {
        return cloneJson(next);
    }
    if (next === null && APPENDABLE_STRING_FIELDS.has(String(fieldName || ''))) {
        return existing;
    }
    if (fieldName === 'tool_calls' && Array.isArray(existing) && Array.isArray(next)) {
        return mergeToolCallArrays(existing, next);
    }
    if (typeof existing === 'string' && typeof next === 'string') {
        if (APPENDABLE_STRING_FIELDS.has(String(fieldName || ''))) {
            if (existing === next) return existing;
            if (next.startsWith(existing)) return next;
            if (existing.startsWith(next)) return existing;
            return `${existing}${next}`;
        }
        return existing === next ? existing : cloneJson(next);
    }
    if (Array.isArray(existing) && Array.isArray(next)) {
        return existing.concat(cloneJson(next) || []);
    }
    if (isPlainObject(existing) && isPlainObject(next)) {
        const merged = { ...existing };
        Object.entries(next).forEach(([key, value]) => {
            merged[key] = mergeReplayValue(merged[key], value, key);
        });
        return merged;
    }
    return cloneJson(next);
}

export function buildReplayableAssistantMessage(message = {}, choice = {}) {
    const replayableMessage = isPlainObject(message)
        ? (cloneJson(message) || {})
        : {};
    const choiceExtras = isPlainObject(choice)
        ? (cloneJson(choice) || {})
        : {};

    delete choiceExtras.message;
    delete choiceExtras.finish_reason;
    delete choiceExtras.index;
    delete choiceExtras.logprobs;
    delete choiceExtras.delta;

    Object.entries(choiceExtras).forEach(([key, value]) => {
        replayableMessage[key] = mergeReplayValue(replayableMessage[key], value, key);
    });

    if (!replayableMessage.role) {
        replayableMessage.role = 'assistant';
    }

    return sanitizeOpenAICompatibleMessage(replayableMessage) || { role: 'assistant' };
}

export function buildProviderPayload(message, choice = {}) {
    const preserved = sanitizeOpenAICompatibleMessage(buildReplayableAssistantMessage(message, choice));
    if (!preserved || typeof preserved !== 'object' || Array.isArray(preserved)) {
        return undefined;
    }
    return {
        openaiCompatibleMessage: preserved,
    };
}

export function mergeReplayMessages(existing = {}, next = {}) {
    if (!isPlainObject(existing)) return cloneJson(next);
    if (!isPlainObject(next)) return cloneJson(existing);
    return mergeReplayValue(cloneJson(existing) || {}, next, '');
}

export function buildNativeMessages(task, model = '') {
    const sourceMessages = Array.isArray(task.messages) ? task.messages : [];
    const lastUserIndex = getLastUserMessageIndex(sourceMessages);
    const normalizedMessages = sourceMessages.map((message, index) => {
        const topLevelToolCalls = normalizeToolCallsForReplay(message?.tool_calls);
        if (shouldPreserveAssistantReplayMessage(message, index, lastUserIndex)) {
            const preserved = normalizeOpenAICompatibleMessage(message);
            if (hasValidToolCalls(preserved)) {
                return ensureReasoningContentForToolCalls({
                    ...preserved,
                    ...(topLevelToolCalls.length ? { tool_calls: topLevelToolCalls } : {}),
                }, model);
            }
        }

        const baseMessage = {
            role: message.role,
            content: message.content,
        };

        if (message.role === 'tool' && message.tool_call_id) {
            baseMessage.tool_call_id = message.tool_call_id;
        }

        if (message.role === 'assistant' && topLevelToolCalls.length) {
            baseMessage.tool_calls = topLevelToolCalls;
        }

        return ensureReasoningContentForToolCalls(baseMessage, model);
    });

    const systemPrompt = String(task.systemPrompt || '').trim();
    if (systemPrompt && normalizedMessages[0]?.role !== 'system') {
        normalizedMessages.unshift({
            role: 'system',
            content: systemPrompt,
        });
    }

    return normalizeFinalClaudeLikeMessageRole(normalizedMessages, model);
}

function buildTaggedProtocolPrompt(task) {
    const toolDescriptions = (task.tools || []).map((tool) => [
        `- ${tool.function.name}: ${tool.function.description || ''}`.trim(),
        `  参数 JSON Schema: ${JSON.stringify(tool.function.parameters || {})}`,
    ].join('\n')).join('\n');

    return [
        task.systemPrompt || '',
        '如果你需要调用工具，不要使用原生 tool calling 字段。',
        '用 <tool_call> 和 </tool_call> 明确 JSON 范围，请严格输出如下边界标记和包裹的 JSON，不要改写边界标记：',
        '<tool_call>{"name":"工具名","arguments":{...}}</tool_call>',
        '如果需要多个工具调用，可以连续输出多段 <tool_call> ... </tool_call>。',
        '在输出第一个 <tool_call> 之前，可根据任务复杂度决定是否需要先说明：简单查询可直接输出 <tool_call>；复杂任务可先简要说明你准备查什么或怎么查。',
        '一旦开始输出第一个 <tool_call>，就不要再继续输出面向用户的正文、解释、总结或补充；把本轮需要的 tool_call 连续输出完就结束。',
        toolDescriptions ? `可用工具:\n${toolDescriptions}` : '',
    ].filter(Boolean).join('\n\n');
}

export function buildTaggedMessages(task, model = '') {
    const toolNameById = new Map();
    const messages = [];
    const sourceMessages = Array.isArray(task.messages) ? task.messages : [];

    sourceMessages.forEach((message) => {
        if (message.role === 'assistant') {
            const toolCalls = getReplayableToolCalls(message);
            if (toolCalls.length) {
                const preserved = normalizeOpenAICompatibleMessage(message);
                const content = typeof preserved?.content === 'string'
                    ? preserved.content
                    : String(message.content || '');
                const taggedBlocks = toolCalls.map((toolCall, index) => {
                    const toolName = toolCall.function?.name || '';
                    const toolId = toolCall.id || `tool-call-${index + 1}`;
                    if (toolName) {
                        toolNameById.set(toolId, toolName);
                    }
                    return `<tool_call>${JSON.stringify({
                        id: toolId,
                        name: toolName,
                        arguments: safeParseArguments(toolCall.function?.arguments || '{}'),
                    })}</tool_call>`;
                }).join('\n');

                messages.push({
                    role: 'assistant',
                    content: [content, taggedBlocks].filter(Boolean).join('\n\n'),
                });
                return;
            }
        }

        if (message.role === 'tool') {
            const toolName = String(message.toolName || message.tool_name || '').trim()
                || toolNameById.get(message.tool_call_id || '')
                || 'unknown_tool';
            if (message.tool_call_id) toolNameById.delete(message.tool_call_id);
            const toolContent = String(message.content || '');
            messages.push({
                role: 'user',
                content: [
                    '<tool_result>',
                    '这是系统工具执行结果，不是用户新发言。',
                    `name: ${toolName}`,
                    'content:',
                    toolContent,
                    '</tool_result>',
                ].join('\n'),
            });
            return;
        }

        messages.push({
            role: message.role,
            content: message.content,
        });
    });

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

    return normalizeFinalClaudeLikeMessageRole(messages, model);
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

export function summarizeReplayMessageForDebug(message) {
    const normalized = isPlainObject(message) ? message : {};
    return {
        role: normalized.role || '',
        keys: Object.keys(normalized).sort(),
        hasReasoningContent: typeof normalized.reasoning_content === 'string' && normalized.reasoning_content.length > 0,
        hasReasoning: !!normalized.reasoning,
        hasThinking: !!normalized.thinking,
        toolCallCount: Array.isArray(normalized.tool_calls) ? normalized.tool_calls.length : 0,
        contentPreview: typeof normalized.content === 'string'
            ? normalized.content.slice(0, 120)
            : '',
    };
}

function appendStreamField(target, key, value) {
    if (!target || !key || value === undefined) return;
    target[key] = mergeReplayValue(target[key], value, key);
}

function appendStreamToolCalls(target, toolCalls = []) {
    if (!Array.isArray(toolCalls) || !toolCalls.length) return;
    if (!Array.isArray(target.tool_calls)) {
        target.tool_calls = [];
    }
    toolCalls.forEach((toolCallDelta) => {
        const index = Number(toolCallDelta?.index ?? 0);
        const current = target.tool_calls[index] || {};
        const nextToolCall = { ...current };

        Object.entries(toolCallDelta || {}).forEach(([key, value]) => {
            if (key === 'index') return;
            if (key === 'function' && (value === null || value === undefined)) return;
            if (key === 'function' && isPlainObject(value)) {
                nextToolCall.function = isPlainObject(nextToolCall.function)
                    ? { ...nextToolCall.function }
                    : {};
                Object.entries(value).forEach(([fnKey, fnValue]) => {
                    nextToolCall.function[fnKey] = mergeReplayValue(nextToolCall.function[fnKey], fnValue, fnKey);
                });
                return;
            }
            nextToolCall[key] = mergeReplayValue(nextToolCall[key], value, key);
        });

        target.tool_calls[index] = nextToolCall;
    });
}

export function accumulateStreamedAssistantSnapshot(target, choice = {}) {
    if (!target || !choice || typeof choice !== 'object') return;

    Object.entries(choice).forEach(([key, value]) => {
        if (key === 'delta' || key === 'finish_reason' || key === 'index' || key === 'logprobs') return;
        appendStreamField(target, key, value);
    });

    const delta = isPlainObject(choice.delta) ? choice.delta : {};
    Object.entries(delta).forEach(([key, value]) => {
        if (key === 'tool_calls') {
            appendStreamToolCalls(target, value);
            return;
        }
        appendStreamField(target, key, value);
    });
}

export function applyToolCallDelta(snapshot, toolCallDelta = {}) {
    if (!snapshot || !isPlainObject(toolCallDelta)) return;
    const index = Number(toolCallDelta.index ?? 0);
    const current = snapshot.toolCalls[index] || {
        id: '',
        type: 'function',
        function: {
            name: '',
            arguments: '',
        },
    };
    const toolFunction = isPlainObject(toolCallDelta.function) ? toolCallDelta.function : {};
    snapshot.toolCalls[index] = {
        ...current,
        id: toolCallDelta.id || current.id,
        type: toolCallDelta.type || current.type,
        function: {
            name: toolFunction.name || current.function?.name || '',
            arguments: `${current.function?.arguments || ''}${toolFunction.arguments || ''}`,
        },
    };
}

async function readSseEventsFromResponse(response, onEvent) {
    const reader = response.body?.getReader?.();
    if (!reader) {
        throw new Error('openai_compatible_stream_missing_body');
    }
    const decoder = new TextDecoder();
    let buffer = '';
    const boundaryPattern = /\r?\n\r?\n/;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        while (true) {
            const boundaryMatch = buffer.match(boundaryPattern);
            if (!boundaryMatch || typeof boundaryMatch.index !== 'number') break;
            const boundaryIndex = boundaryMatch.index;
            const rawEvent = buffer.slice(0, boundaryIndex);
            buffer = buffer.slice(boundaryIndex + boundaryMatch[0].length);
            const data = rawEvent
                .split(/\r?\n/)
                .filter((line) => line.startsWith('data:'))
                .map((line) => line.slice(5).trimStart())
                .join('\n')
                .trim();
            if (!data || data === '[DONE]') {
                continue;
            }
            onEvent(JSON.parse(data));
        }
    }

    const trailing = buffer.trim();
    if (trailing && trailing !== '[DONE]') {
        const data = trailing
            .split(/\r?\n/)
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trimStart())
            .join('\n')
            .trim();
        if (data && data !== '[DONE]') {
            onEvent(JSON.parse(data));
        }
    }
}

export class OpenAICompatibleAdapter {
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

    buildRequestBody(task) {
        const toolMode = this.config.toolMode || 'native';
        const isTaggedMode = toolMode === 'tagged-json' && Array.isArray(task.tools) && task.tools.length > 0;
        const nativeTools = !isTaggedMode && Array.isArray(task.tools) && task.tools.length
            ? task.tools
            : null;
        const body = {
            model: this.config.model,
            messages: isTaggedMode ? buildTaggedMessages(task, this.config.model) : buildNativeMessages(task, this.config.model),
            ...(nativeTools ? { tools: nativeTools, tool_choice: task.toolChoice || 'auto' } : {}),
            ...(task.maxTokens ? { max_tokens: task.maxTokens } : {}),
        };
        if (!task.reasoning?.enabled && typeof task.temperature === 'number') {
            body.temperature = task.temperature;
        }
        if (task.reasoning?.enabled) {
            body.reasoning_effort = task.reasoning.effort;
        }
        return body;
    }

    inspectRequest(task, options = {}) {
        const stream = typeof task.onStreamProgress === 'function';
        const body = {
            ...(options.body || this.buildRequestBody(task)),
            ...(stream ? { stream: true } : {}),
        };
        const baseUrl = String(this.config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
        return buildSdkRequestInspection({
            provider: 'openai-compatible',
            model: this.config.model,
            transport: 'openai-compatible',
            url: `${baseUrl}/chat/completions`,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.config.apiKey ? `Bearer ${this.config.apiKey}` : '',
            },
            body,
            sdk: stream
                ? 'client.chat.completions.create(..., { stream: true })'
                : 'client.chat.completions.create',
        });
    }

    async streamNativeChatCompletions(task, body) {
        const url = `${String(this.config.baseUrl || 'https://api.openai.com/v1').replace(/\/$/, '')}/chat/completions`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                ...body,
                stream: true,
            }),
            signal: task.signal,
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(errorText || `openai_compatible_stream_http_${response.status}`);
        }

        const snapshot = {
            content: '',
            toolCalls: [],
        };
        const assistantSnapshot = {
            role: 'assistant',
        };
        let lastFinishReason = 'stop';
        let lastModel = this.config.model;

        await readSseEventsFromResponse(response, (payload) => {
            lastModel = payload?.model || lastModel;
            const choice = payload?.choices?.[0];
            const delta = choice?.delta || {};
            accumulateStreamedAssistantSnapshot(assistantSnapshot, choice);
            if (choice?.finish_reason) {
                lastFinishReason = choice.finish_reason;
            }
            if (typeof delta.content === 'string') {
                snapshot.content += delta.content;
            }
            if (Array.isArray(delta.tool_calls)) {
                delta.tool_calls.forEach((toolCallDelta) => {
                    applyToolCallDelta(snapshot, toolCallDelta);
                });
            }

            const thinkTagged = extractThinkTaggedContent(snapshot.content);
            const standardToolCalls = snapshot.toolCalls.filter((item) => item?.function?.name);
            const progressToolCalls = standardToolCalls.length
                ? buildToolCallResultsFromOpenAI(snapshot.toolCalls)
                : buildTaggedToolCallDraft(thinkTagged.cleaned);
            const cleanedText = standardToolCalls.length
                ? thinkTagged.cleaned
                : stripTaggedToolCallsForDisplay(thinkTagged.cleaned);
            emitStreamProgress(task, {
                text: cleanedText,
                thoughts: extractThoughtsFromMessage(assistantSnapshot, choice).concat(thinkTagged.thoughts),
                ...(progressToolCalls.length ? { toolCalls: progressToolCalls } : {}),
                ...(!standardToolCalls.length && progressToolCalls.length ? { toolCallDraft: true } : {}),
            });
        });

        const providerPayload = buildProviderPayload(assistantSnapshot);
        const standardToolCalls = buildToolCallResultsFromOpenAI(snapshot.toolCalls);
        const thinkTagged = extractThinkTaggedContent(snapshot.content);
        const thoughts = extractThoughtsFromMessage(assistantSnapshot, {});
        thinkTagged.thoughts.forEach((item) => thoughts.push(item));
        const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);
        const toolCalls = [...standardToolCalls, ...taggedToolCalls];
        const cleanedText = standardToolCalls.length
            ? thinkTagged.cleaned
            : stripTaggedToolCallsForDisplay(thinkTagged.cleaned);

        return {
            text: cleanedText,
            toolCalls,
            thoughts,
            finishReason: lastFinishReason,
            model: lastModel,
            provider: 'openai-compatible',
            providerPayload,
        };
    }

    async chat(task) {
        const toolMode = this.config.toolMode || 'native';
        const isTaggedMode = toolMode === 'tagged-json' && Array.isArray(task.tools) && task.tools.length > 0;
        const shouldUseStreaming = typeof task.onStreamProgress === 'function';
        const body = this.buildRequestBody(task);
        const requestInspection = this.inspectRequest(task, { body });
        if (shouldUseStreaming) {
            if (!isTaggedMode) {
                return {
                    ...await this.streamNativeChatCompletions(task, body),
                    requestInspection,
                };
            }
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
            const assistantSnapshot = {
                role: 'assistant',
            };
            let lastFinishReason = 'stop';
            let lastModel = this.config.model;
            let providerPayload;

            for await (const chunk of stream) {
                lastModel = chunk.model || lastModel;
                const choice = chunk.choices?.[0];
                const delta = choice?.delta || {};
                accumulateStreamedAssistantSnapshot(assistantSnapshot, choice);
                if (choice?.finish_reason) {
                    lastFinishReason = choice.finish_reason;
                }
                if (typeof delta.content === 'string') {
                    snapshot.content += delta.content;
                }
                if (Array.isArray(delta.tool_calls)) {
                    delta.tool_calls.forEach((toolCallDelta) => {
                        applyToolCallDelta(snapshot, toolCallDelta);
                    });
                }

                const thinkTagged = extractThinkTaggedContent(snapshot.content);
                const standardToolCalls = snapshot.toolCalls.filter((item) => item?.function?.name);
                const progressToolCalls = standardToolCalls.length
                    ? buildToolCallResultsFromOpenAI(snapshot.toolCalls)
                    : buildTaggedToolCallDraft(thinkTagged.cleaned);
                const cleanedText = standardToolCalls.length
                    ? thinkTagged.cleaned
                    : stripTaggedToolCallsForDisplay(thinkTagged.cleaned);
                emitStreamProgress(task, {
                    text: cleanedText,
                    thoughts: extractThoughtsFromMessage(assistantSnapshot, choice).concat(thinkTagged.thoughts),
                    ...(progressToolCalls.length ? { toolCalls: progressToolCalls } : {}),
                    ...(!standardToolCalls.length && progressToolCalls.length ? { toolCallDraft: true } : {}),
                });
            }
            const finalCompletion = typeof stream.finalChatCompletion === 'function'
                ? await stream.finalChatCompletion()
                : null;
            const finalChoice = finalCompletion?.choices?.[0] || null;
            const finalMessage = finalChoice?.message || assistantSnapshot;
            const replayableFinalMessage = mergeReplayMessages(
                assistantSnapshot,
                buildReplayableAssistantMessage(finalMessage, finalChoice || {}),
            );
            providerPayload = buildProviderPayload(replayableFinalMessage);
            const standardToolCalls = buildToolCallResultsFromOpenAI(snapshot.toolCalls);
            const thinkTagged = extractThinkTaggedContent(snapshot.content);
            const thoughts = extractThoughtsFromMessage(replayableFinalMessage, finalChoice || {});
            thinkTagged.thoughts.forEach((item) => thoughts.push(item));
            const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);
            const toolCalls = [...standardToolCalls, ...taggedToolCalls];
            const cleanedText = standardToolCalls.length
                ? thinkTagged.cleaned
                : stripTaggedToolCallsForDisplay(thinkTagged.cleaned);

            return {
                text: cleanedText,
                toolCalls,
                thoughts,
                finishReason: lastFinishReason,
                model: lastModel,
                provider: 'openai-compatible',
                providerPayload,
                requestInspection,
            };
        }

        const response = await this.client.chat.completions.create(body, {
            signal: task.signal,
        });

        const choice = response.choices?.[0] || {};
        const message = choice.message || {};
        const thoughts = extractThoughtsFromMessage(message, choice);
        const standardToolCalls = buildToolCallResultsFromOpenAI(message.tool_calls || []);
        const contentText = flattenTextContent(message.content);
        const thinkTagged = extractThinkTaggedContent(contentText);
        thinkTagged.thoughts.forEach((item) => thoughts.push(item));
        const taggedToolCalls = standardToolCalls.length ? [] : extractTaggedToolCalls(thinkTagged.cleaned);
        const toolCalls = [...standardToolCalls, ...taggedToolCalls];
        const cleanedText = standardToolCalls.length
            ? thinkTagged.cleaned
            : stripTaggedToolCallsForDisplay(thinkTagged.cleaned);
        const replayableMessage = buildReplayableAssistantMessage(message, choice);

        return {
            text: cleanedText,
            toolCalls,
            thoughts,
            finishReason: choice.finish_reason || 'stop',
            model: response.model || this.config.model,
            provider: 'openai-compatible',
            providerPayload: buildProviderPayload(replayableMessage),
            requestInspection,
        };
    }
}
