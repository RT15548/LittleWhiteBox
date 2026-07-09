import {
    buildHostChatCompletionGenerateRequest,
    buildHostGoogleGeneratePayload,
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

function normalizeContent(content) {
    if (typeof content === 'string') {
        return {
            role: 'model',
            parts: content ? [{ text: content }] : [],
        };
    }
    if (!content || typeof content !== 'object') {
        return {
            role: 'model',
            parts: [],
        };
    }
    const cloned = cloneJson(content) || {};
    cloned.role = cloned.role || 'model';
    cloned.parts = Array.isArray(cloned.parts) ? cloned.parts : [];
    return cloned;
}

function normalizeGoogleContents(message) {
    const contents = Array.isArray(message?.providerPayload?.googleContents)
        ? message.providerPayload.googleContents
        : [];
    if (contents.length) {
        return contents
            .map((content) => normalizeContent(content))
            .filter((content) => Array.isArray(content.parts) && content.parts.length);
    }
    const content = message?.providerPayload?.googleContent;
    const normalized = normalizeContent(content);
    return normalized.parts.length ? [normalized] : [];
}

function buildMediaPartFromInlineData(inlineData = {}) {
    const mimeType = String(inlineData?.mimeType || '').trim();
    const data = String(inlineData?.data || '').trim();
    if (!mimeType || !data) return null;
    const dataUrl = `data:${mimeType};base64,${data}`;
    if (mimeType.startsWith('image/')) {
        return {
            type: 'image_url',
            image_url: {
                url: dataUrl,
            },
        };
    }
    if (mimeType.startsWith('video/')) {
        return {
            type: 'video_url',
            video_url: {
                url: dataUrl,
            },
        };
    }
    if (mimeType.startsWith('audio/')) {
        return {
            type: 'audio_url',
            audio_url: {
                url: dataUrl,
            },
        };
    }
    return null;
}

function buildHostGoogleMessageFromContent(content = {}, index = 0) {
    const normalized = normalizeContent(content);
    if (!normalized.parts.length) return null;

    const hostMessage = {
        role: normalized.role === 'user' ? 'user' : 'assistant',
        content: [],
    };
    const textSignature = normalized.parts.find((part) => (
        !part?.thought
        && typeof part?.text === 'string'
        && typeof part?.thoughtSignature === 'string'
        && part.thoughtSignature
    ))?.thoughtSignature || '';
    const toolCalls = [];

    normalized.parts.forEach((part) => {
        if (!part || typeof part !== 'object') return;
        if (!part.thought && typeof part.text === 'string' && part.text) {
            hostMessage.content.push({
                type: 'text',
                text: part.text,
            });
            return;
        }
        if (part.functionCall?.name) {
            toolCalls.push({
                id: String(part.functionCall.id || `st-google-tool-${index + 1}-${toolCalls.length + 1}`),
                type: 'function',
                function: {
                    name: String(part.functionCall.name || ''),
                    arguments: JSON.stringify(part.functionCall.args || {}),
                },
                ...(typeof part.thoughtSignature === 'string' && part.thoughtSignature
                    ? { signature: part.thoughtSignature }
                    : {}),
            });
            return;
        }
        const mediaPart = buildMediaPartFromInlineData(part.inlineData);
        if (mediaPart) {
            hostMessage.content.push(mediaPart);
        }
    });

    if (toolCalls.length) {
        hostMessage.content.push({
            type: 'tool_calls',
            tool_calls: toolCalls,
        });
    }
    if (textSignature && hostMessage.content.some((part) => part?.type === 'text')) {
        hostMessage.signature = textSignature;
    }
    if (!hostMessage.content.length) return null;
    return hostMessage;
}

function buildHostGoogleMessages(task = {}) {
    const sourceMessages = Array.isArray(task.messages) ? task.messages : [];
    const messages = [];
    sourceMessages.forEach((message) => {
        if (!message || typeof message !== 'object') return;
        const preservedContents = normalizeGoogleContents(message);
        if (message.role === 'assistant' && preservedContents.length) {
            preservedContents.forEach((content, index) => {
                const hostMessage = buildHostGoogleMessageFromContent(content, index);
                if (hostMessage) messages.push(hostMessage);
            });
            return;
        }
        const cloned = cloneJson(message) || {};
        delete cloned.providerPayload;
        messages.push(cloned);
    });
    return messages;
}

function getEventContent(event = {}) {
    return normalizeContent(event?.responseContent || event?.candidates?.[0]?.content || '');
}

function extractVisibleText(content = {}) {
    return (content.parts || [])
        .filter((part) => !part?.thought && typeof part?.text === 'string' && part.text)
        .map((part) => part.text)
        .join('\n');
}

function extractThoughts(content = {}) {
    return (content.parts || [])
        .filter((part) => part?.thought && typeof part.text === 'string' && part.text.trim())
        .map((part, index) => ({
            label: `思考块 ${index + 1}`,
            text: part.text.trim(),
        }));
}

function extractFunctionCalls(content = {}) {
    return (content.parts || [])
        .map((part) => part?.functionCall || null)
        .filter((item) => item?.name)
        .map((item, index) => ({
            id: item.id || `st-google-tool-${index + 1}`,
            name: item.name,
            arguments: JSON.stringify(item.args || {}),
        }));
}

function mergeStreamText(previous, incoming) {
    const next = String(incoming || '');
    const current = String(previous || '');
    if (!next) return current;
    if (!current) return next;
    if (next.startsWith(current)) return next;
    if (current.endsWith(next)) return current;
    return `${current}${next}`;
}

function mergeToolCalls(existing = [], incoming = []) {
    const merged = Array.isArray(existing) ? [...existing] : [];
    incoming.forEach((item) => {
        const key = [item.id || '', item.name || '', item.arguments || ''].join('\u0000');
        const found = merged.some((current) => (
            [current.id || '', current.name || '', current.arguments || ''].join('\u0000') === key
        ));
        if (!found) merged.push(item);
    });
    return merged;
}

function buildProviderPayload(content) {
    const normalized = normalizeContent(content);
    return normalized.parts.length
        ? {
            googleContent: normalized,
            googleContents: [normalized],
        }
        : undefined;
}

function parseGoogleResult(response = {}, options = {}) {
    const content = getEventContent(response);
    const fallbackText = response?.choices?.[0]?.message?.content || '';
    const text = extractVisibleText(content) || fallbackText;
    return {
        text,
        toolCalls: extractFunctionCalls(content),
        thoughts: extractThoughts(content),
        finishReason: response?.candidates?.[0]?.finishReason || response?.choices?.[0]?.finish_reason || options.finishReason || 'STOP',
        model: response?.model || response?.modelVersion || options.model || '',
        provider: 'sillytavern-google',
        providerPayload: buildProviderPayload(content),
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

function createGoogleStreamAccumulator(task, config = {}) {
    let text = '';
    let toolCalls = [];
    let thoughts = [];
    let finishReason = 'STOP';
    let model = config.model || '';
    const parts = [];

    return {
        accept(event = {}) {
            model = event.model || event.modelVersion || model;
            finishReason = event?.candidates?.[0]?.finishReason || finishReason;
            const content = getEventContent(event);
            if (content.parts.length) {
                parts.push(...(cloneJson(content.parts) || []));
            }
            text = mergeStreamText(text, extractVisibleText(content));
            toolCalls = mergeToolCalls(toolCalls, extractFunctionCalls(content));
            const nextThoughts = extractThoughts(content);
            if (nextThoughts.length) {
                thoughts = nextThoughts;
            }
            emitStreamProgress(task, {
                text,
                thoughts,
                ...(toolCalls.length ? { toolCalls, toolCallDraft: true } : {}),
            });
        },
        result() {
            const content = normalizeContent({
                role: 'model',
                parts: parts.length ? parts : (text ? [{ text }] : []),
            });
            return {
                text,
                toolCalls,
                thoughts,
                finishReason,
                model,
                provider: 'sillytavern-google',
                providerPayload: buildProviderPayload(content),
            };
        },
    };
}

export class SillyTavernGoogleAdapter {
    constructor(config) {
        this.config = config;
    }

    buildMessages(task) {
        return buildHostGoogleMessages(task);
    }

    buildPayload(task) {
        const stream = typeof task.onStreamProgress === 'function';
        const messages = this.buildMessages(task);
        return buildHostGoogleGeneratePayload(this.config, task, messages, stream);
    }

    async inspectRequest(task, options = {}) {
        const payload = options.payload || this.buildPayload(task);
        const request = await buildHostChatCompletionGenerateRequest(
            payload,
            typeof task.onStreamProgress === 'function',
        );
        return this.buildRequestInspection(request);
    }

    buildRequestInspection(request) {
        return {
            provider: 'sillytavern-google',
            model: this.config.model,
            transport: 'sillytavern-chat-completions',
            request: redactRequestSecrets(request),
        };
    }

    async chat(task) {
        const stream = typeof task.onStreamProgress === 'function';
        const payload = this.buildPayload(task);
        let requestInspection = null;
        const onRequest = (request) => {
            requestInspection = this.buildRequestInspection(request);
        };

        try {
            if (stream) {
                const accumulator = createGoogleStreamAccumulator(task, this.config);
                await streamHostChatCompletion(payload, (event) => {
                    accumulator.accept(event);
                }, { signal: task.signal, onRequest });
                return {
                    ...accumulator.result(),
                    requestInspection,
                };
            }

            const response = await createHostChatCompletion(payload, { signal: task.signal, onRequest });
            return {
                ...parseGoogleResult(response, { model: this.config.model }),
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
