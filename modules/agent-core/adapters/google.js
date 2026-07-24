import { FunctionCallingConfigMode, GoogleGenAI, ThinkingLevel } from '@google/genai';
import { buildSdkRequestInspection } from './request-inspection.js';

function parseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
    }
}

function cloneJson(value) {
    if (value === undefined) return undefined;
    try {
        return JSON.parse(JSON.stringify(value));
    } catch {
        return undefined;
    }
}

function buildTextPart(text) {
    return { text: String(text || '') };
}

function buildInlineDataPart(dataUrl = '') {
    const match = String(dataUrl || '').match(/^data:([^;,]+);base64,(.+)$/);
    if (!match) return null;
    return {
        inlineData: {
            mimeType: match[1],
            data: match[2],
        },
    };
}

function buildMessageParts(content) {
    if (typeof content === 'string') {
        return [buildTextPart(content)];
    }
    if (!Array.isArray(content)) {
        return [buildTextPart('')];
    }
    const parts = content.map((part) => {
        if (!part || typeof part !== 'object') return null;
        if (part.type === 'text') {
            return buildTextPart(part.text || '');
        }
        if (part.type === 'image_url' && part.image_url?.url) {
            return buildInlineDataPart(part.image_url.url);
        }
        return null;
    }).filter(Boolean);
    return parts.length ? parts : [buildTextPart('')];
}

function buildFallbackUserContent() {
    return {
        role: 'user',
        parts: [buildTextPart('')],
    };
}

function normalizeGoogleContentValue(content, fallbackRole = 'model') {
    if (!content?.parts?.length) return null;
    const cloned = cloneJson(content);
    if (!cloned) return null;
    if (!cloned.role) {
        cloned.role = fallbackRole;
    }
    return cloned;
}

function hasThoughtSignaturePart(content) {
    return !!content?.parts?.some((part) => typeof part?.thoughtSignature === 'string' && part.thoughtSignature);
}

function hasFunctionCallPart(content) {
    return !!content?.parts?.some((part) => part?.functionCall?.name);
}

function getFunctionCallPartKey(part, partIndex, contentIndex = 0) {
    if (!part?.functionCall?.name) return '';
    const id = String(part.functionCall.id || '').trim();
    if (id) return `id:${id}`;
    return [
        String(contentIndex),
        String(part.functionCall.name || ''),
        String(partIndex),
    ].join('\u0000');
}

function mergeGoogleFunctionCallPart(currentPart, incomingPart) {
    const currentCall = currentPart?.functionCall || {};
    const incomingCall = incomingPart?.functionCall || {};
    const currentArgs = currentCall.args && typeof currentCall.args === 'object' && !Array.isArray(currentCall.args)
        ? currentCall.args
        : {};
    const incomingArgs = incomingCall.args && typeof incomingCall.args === 'object' && !Array.isArray(incomingCall.args)
        ? incomingCall.args
        : {};
    return {
        ...currentPart,
        ...incomingPart,
        ...(currentPart?.thoughtSignature && !incomingPart?.thoughtSignature
            ? { thoughtSignature: currentPart.thoughtSignature }
            : {}),
        functionCall: {
            ...currentCall,
            ...incomingCall,
            args: { ...currentArgs, ...incomingArgs },
        },
    };
}

function buildRepairedStreamedContent(contents = [], streamedText = '') {
    const normalizedContents = contents
        .map((content) => normalizeGoogleContentValue(content, 'model'))
        .filter(Boolean);
    if (!normalizedContents.length) return null;

    const latestSignedContent = [...normalizedContents]
        .reverse()
        .find((content) => hasThoughtSignaturePart(content)) || null;
    const latestFunctionCallContent = [...normalizedContents]
        .reverse()
        .find((content) => hasFunctionCallPart(content)) || null;
    const baseSourceContent = latestSignedContent || latestFunctionCallContent || normalizedContents[normalizedContents.length - 1];
    const baseContentIndex = normalizedContents.indexOf(baseSourceContent);
    const baseContent = cloneJson(baseSourceContent);
    if (!baseContent?.parts?.length) {
        return normalizedContents[normalizedContents.length - 1];
    }

    if (latestFunctionCallContent) {
        const bestFunctionCallParts = new Map();
        const orderedFunctionCallKeys = [];
        normalizedContents.forEach((content, contentIndex) => {
            content.parts.forEach((part, index) => {
                const key = getFunctionCallPartKey(part, index, contentIndex);
                if (!key) return;
                if (!bestFunctionCallParts.has(key)) {
                    orderedFunctionCallKeys.push(key);
                }
                const currentBest = bestFunctionCallParts.get(key);
                if (!currentBest) {
                    bestFunctionCallParts.set(key, cloneJson(part));
                } else {
                    bestFunctionCallParts.set(key, mergeGoogleFunctionCallPart(currentBest, part));
                }
            });
        });

        const existingKeys = new Set();
        baseContent.parts = baseContent.parts.map((part, index) => {
            const key = getFunctionCallPartKey(part, index, baseContentIndex);
            if (!key) return part;
            existingKeys.add(key);
            return bestFunctionCallParts.get(key) || part;
        });

        orderedFunctionCallKeys.forEach((key) => {
            if (existingKeys.has(key)) return;
            baseContent.parts.push(bestFunctionCallParts.get(key));
            existingKeys.add(key);
        });
    }

    const nextText = String(streamedText || '');
    const preservedNonVisibleParts = baseContent.parts.filter((part) => !(typeof part?.text === 'string' && !part?.thought));
    baseContent.parts = nextText
        ? [{ text: nextText }, ...preservedNonVisibleParts]
        : preservedNonVisibleParts;

    return baseContent.parts.length
        ? baseContent
        : normalizedContents[normalizedContents.length - 1];
}

function extractVisibleText(response) {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    const visibleText = parts
        .filter((part) => !part?.thought && typeof part?.text === 'string' && part.text)
        .map((part) => part.text)
        .join('\n');
    if (visibleText || parts.length) {
        return visibleText;
    }
    return typeof response?.text === 'string' && response.text
        ? response.text
        : '';
}

function getRawFunctionCalls(response) {
    const sdkFunctionCalls = Array.isArray(response?.functionCalls)
        ? response.functionCalls
        : [];
    const contentFunctionCalls = (response?.candidates?.[0]?.content?.parts || [])
        .map((item) => item?.functionCall || item)
        .filter((item) => item && item.name);
    return sdkFunctionCalls.length
        ? sdkFunctionCalls
        : contentFunctionCalls;
}

function normalizeFunctionCallArguments(item) {
    try {
        return JSON.stringify(item?.args || {});
    } catch {
        return '{}';
    }
}

function parseFunctionCallArguments(argumentsText) {
    try {
        const value = JSON.parse(String(argumentsText || '{}'));
        return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch {
        return null;
    }
}

function mergeFunctionCallArguments(currentArguments, incomingArguments) {
    const current = parseFunctionCallArguments(currentArguments);
    const incoming = parseFunctionCallArguments(incomingArguments);
    if (current && incoming) {
        return JSON.stringify({ ...current, ...incoming });
    }
    return String(incomingArguments || '').trim() || String(currentArguments || '{}');
}

function extractFunctionCalls(response, internalIdPrefix = 'google-tool') {
    return getRawFunctionCalls(response)
        .map((item, index) => {
            const providerId = String(item.id || '').trim();
            return {
                // The runtime needs a stable local key even when Gemini legitimately omits functionCall.id.
                id: providerId || `${internalIdPrefix}-${index + 1}`,
                name: item.name || '',
                arguments: normalizeFunctionCallArguments(item),
                // Keep an explicit empty marker: it tells the response writer to omit id entirely.
                ...(providerId ? {} : { providerId: '' }),
            };
        })
        .filter((item) => item.name);
}

function createStreamFunctionCallAccumulator(internalIdPrefix) {
    const calls = [];
    const callsByProviderId = new Map();
    let nextLocalId = 0;

    function mergeInto(call, item, providerId, argumentsText) {
        call.name = String(item.name || call.name || '').trim();
        call.arguments = mergeFunctionCallArguments(call.arguments, argumentsText);
        if (providerId) {
            callsByProviderId.set(providerId, call);
            if (call.id !== providerId) {
                call.providerId = providerId;
            } else {
                delete call.providerId;
            }
        }
        return call;
    }

    function append(response) {
        getRawFunctionCalls(response).forEach((item) => {
            const name = String(item?.name || '').trim();
            if (!name) return;
            const providerId = String(item?.id || '').trim();
            const argumentsText = normalizeFunctionCallArguments(item);
            let call = providerId ? callsByProviderId.get(providerId) : null;
            if (!call) {
                call = {
                    id: providerId || `${internalIdPrefix}-${++nextLocalId}`,
                    name,
                    arguments: argumentsText,
                    ...(providerId ? {} : { providerId: '' }),
                };
                calls.push(call);
            } else {
                mergeInto(call, item, providerId, argumentsText);
            }
            if (providerId) {
                callsByProviderId.set(providerId, call);
            }
        });
        return calls.map((call) => ({ ...call }));
    }

    return { append };
}

function buildToolResponseMessage(toolResponses = []) {
    return {
        role: 'user',
        parts: toolResponses
            .filter((item) => item && item.name)
            .map((item) => {
                const responseId = Object.prototype.hasOwnProperty.call(item, 'providerId')
                    ? String(item.providerId || '').trim()
                    : String(item.id || '').trim();
                return {
                    functionResponse: {
                        ...(responseId ? { id: responseId } : {}),
                        name: item.name,
                        response: item.response || {},
                    },
                };
            }),
    };
}

function mapThinkingLevel(effort) {
    switch (effort) {
        case 'high':
            return ThinkingLevel.HIGH;
        case 'medium':
            return ThinkingLevel.MEDIUM;
        case 'low':
        default:
            return ThinkingLevel.LOW;
    }
}

function extractThoughts(response) {
    const parts = response?.candidates?.[0]?.content?.parts || [];
    return parts
        .filter((part) => part?.thought && typeof part.text === 'string' && part.text.trim())
        .map((part, index) => ({
            label: `思考块 ${index + 1}`,
            text: part.text.trim(),
        }));
}

function resolveSystemInstruction(task) {
    const parts = [
        String(task.systemPrompt || '').trim(),
        ...((task.messages || [])
            .filter((message) => message.role === 'system')
            .map((message) => String(message.content || '').trim())),
    ].filter(Boolean);

    if (!parts.length) return undefined;
    return [...new Set(parts)].join('\n\n');
}

function normalizeGoogleContent(message) {
    const content = message?.providerPayload?.googleContent;
    return normalizeGoogleContentValue(content, 'model');
}

function normalizeGoogleContents(message) {
    const contents = message?.providerPayload?.googleContents;
    if (!Array.isArray(contents) || !contents.length) {
        const legacyContent = normalizeGoogleContent(message);
        return legacyContent ? [legacyContent] : [];
    }
    return contents
        .map((content) => normalizeGoogleContentValue(content, 'model'))
        .filter(Boolean);
}

function buildProviderPayloadFromContents(contents = []) {
    const normalizedContents = (Array.isArray(contents) ? contents : [])
        .map((content) => normalizeGoogleContentValue(content, 'model'))
        .filter(Boolean);
    if (!normalizedContents.length) return undefined;
    return {
        googleContent: normalizedContents[normalizedContents.length - 1],
        googleContents: normalizedContents,
    };
}

function buildProviderPayload(response) {
    const content = response?.candidates?.[0]?.content;
    return buildProviderPayloadFromContents(content ? [content] : []);
}

function buildProviderPayloadFromContent(content) {
    return buildProviderPayloadFromContents(content ? [content] : []);
}

function getChatHistory(chat) {
    try {
        if (typeof chat?.getHistory === 'function') {
            return chat.getHistory(false);
        }
    } catch {
        return [];
    }
    return Array.isArray(chat?.history)
        ? (cloneJson(chat.history) || [])
        : [];
}

function getNewModelContentsFromHistory(chat, beforeLength = 0) {
    const history = getChatHistory(chat);
    return history
        .slice(Math.max(0, beforeLength))
        .filter((content) => content?.role === 'model')
        .map((content) => normalizeGoogleContentValue(content, 'model'))
        .filter(Boolean);
}

function buildConversation(messages) {
    const toolNameById = new Map();
    const providerToolCallIdByInternalId = new Map();
    const contents = [];
    const filteredMessages = (messages || []).filter((message) => (
        message.role === 'user' || message.role === 'assistant' || message.role === 'tool'
    ));

    filteredMessages.forEach((message) => {
        (message.tool_calls || []).forEach((toolCall) => {
            if (toolCall.id && toolCall.function?.name) {
                toolNameById.set(toolCall.id, toolCall.function.name);
            }
            if (toolCall.id && Object.prototype.hasOwnProperty.call(toolCall, 'providerToolCallId')) {
                providerToolCallIdByInternalId.set(toolCall.id, String(toolCall.providerToolCallId || '').trim());
            }
        });
    });

    for (let index = 0; index < filteredMessages.length; index += 1) {
        const message = filteredMessages[index];
        if (message.role === 'tool') {
            const parts = [];
            let cursor = index;
            while (cursor < filteredMessages.length && filteredMessages[cursor].role === 'tool') {
                const toolMessage = filteredMessages[cursor];
                const internalId = String(toolMessage.tool_call_id || '').trim();
                const responseId = providerToolCallIdByInternalId.has(internalId)
                    ? providerToolCallIdByInternalId.get(internalId)
                    : internalId;
                parts.push({
                    functionResponse: {
                        ...(responseId ? { id: responseId } : {}),
                        name: String(toolMessage.toolName || toolMessage.tool_name || '').trim()
                            || toolNameById.get(internalId)
                            || 'tool_result',
                        response: parseArguments(toolMessage.content),
                    },
                });
                cursor += 1;
            }
            contents.push({
                role: 'user',
                parts,
            });
            index = cursor - 1;
            continue;
        }

        if (message.role === 'assistant') {
            const preservedContents = normalizeGoogleContents(message);
            if (preservedContents.length) {
                contents.push(...preservedContents);
                continue;
            }
        }

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            contents.push({
                role: 'model',
                parts: [
                    ...(message.content ? [buildTextPart(message.content)] : []),
                    ...message.tool_calls.map((toolCall) => ({
                        functionCall: {
                            ...(() => {
                                const providerId = Object.prototype.hasOwnProperty.call(toolCall, 'providerToolCallId')
                                    ? String(toolCall.providerToolCallId || '').trim()
                                    : String(toolCall.id || '').trim();
                                return providerId ? { id: providerId } : {};
                            })(),
                            name: toolCall.function.name,
                            args: parseArguments(toolCall.function.arguments),
                        },
                    })),
                ],
            });
            continue;
        }

        contents.push({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: buildMessageParts(message.content),
        });
    }

    if (!contents.length) {
        const fallbackContent = buildFallbackUserContent();
        return {
            history: [],
            latestMessage: fallbackContent.parts,
        };
    }

    const latest = contents[contents.length - 1];
    if (latest.role === 'user' && latest.parts?.length) {
        return {
            history: contents.slice(0, -1),
            latestMessage: latest.parts,
        };
    }

    const fallbackContent = buildFallbackUserContent();
    return {
        history: contents,
        latestMessage: fallbackContent.parts,
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

function mergeStreamText(previous, incoming) {
    return `${String(previous || '')}${String(incoming || '')}`;
}

export class GoogleAdapter {
    constructor(config) {
        this.config = config;
        this.supportsSessionToolLoop = true;
        this.activeChat = null;
        this.toolCallResponseSequence = 0;
        this.client = new GoogleGenAI({
            apiKey: config.apiKey,
            httpOptions: {
                baseUrl: String(config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
                timeout: Number(config.timeoutMs) || 15 * 60 * 1000,
            },
        });
    }

    buildChatPayload(task) {
        const conversation = buildConversation(task.messages);
        const tools = Array.isArray(task.tools) ? task.tools : [];
        const systemInstruction = resolveSystemInstruction(task);
        const config = {
            ...(systemInstruction ? { systemInstruction } : {}),
            temperature: task.temperature,
            ...(task.maxTokens ? { maxOutputTokens: task.maxTokens } : {}),
        };
        if (task.reasoning?.enabled) {
            config.thinkingConfig = {
                includeThoughts: true,
                thinkingLevel: mapThinkingLevel(task.reasoning.effort),
            };
        }

        if (tools.length) {
            config.tools = [{
                functionDeclarations: tools.map((tool) => ({
                    name: tool.function.name,
                    description: tool.function.description,
                    parameters: tool.function.parameters,
                })),
            }];
        }

        if (tools.length) {
            const toolChoice = String(task.toolChoice || 'auto').trim();
            const functionCallingConfig = toolChoice === 'none'
                ? { mode: FunctionCallingConfigMode.NONE }
                : toolChoice === 'auto'
                    ? { mode: FunctionCallingConfigMode.AUTO }
                    : toolChoice === 'required'
                        ? { mode: FunctionCallingConfigMode.ANY }
                    : {
                        mode: FunctionCallingConfigMode.ANY,
                        allowedFunctionNames: [toolChoice],
                    };
            config.toolConfig = {
                functionCallingConfig,
            };
        }

        const createPayload = {
            model: this.config.model,
            history: conversation.history,
            config,
        };
        return {
            createPayload,
            sendPayload: {
                message: conversation.latestMessage,
            },
        };
    }

    inspectRequest(task, options = {}) {
        const payload = options.payload || this.buildChatPayload(task);
        const baseUrl = String(this.config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
        return buildSdkRequestInspection({
            provider: 'google',
            model: this.config.model,
            transport: 'google-genai-sdk',
            url: `${baseUrl}/models/${encodeURIComponent(this.config.model || '')}:generateContent`,
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.config.apiKey || '',
            },
            body: {
                chatCreate: payload.createPayload,
                sendMessage: payload.sendPayload,
                stream: typeof task.onStreamProgress === 'function',
            },
            sdk: typeof task.onStreamProgress === 'function'
                ? 'client.chats.create(...).sendMessageStream'
                : 'client.chats.create(...).sendMessage',
        });
    }

    inspectSendRequest(sendPayload, task) {
        const baseUrl = String(this.config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
        return buildSdkRequestInspection({
            provider: 'google',
            model: this.config.model,
            transport: 'google-genai-sdk',
            url: `${baseUrl}/models/${encodeURIComponent(this.config.model || '')}:generateContent`,
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': this.config.apiKey || '',
            },
            body: {
                sendMessage: sendPayload,
                stream: typeof task.onStreamProgress === 'function',
            },
            sdk: typeof task.onStreamProgress === 'function'
                ? 'activeChat.sendMessageStream'
                : 'activeChat.sendMessage',
        });
    }

    createChat(task) {
        const payload = this.buildChatPayload(task);
        const chat = this.client.chats.create(payload.createPayload);
        return {
            chat,
            sessionConfig: payload.createPayload.config,
            sendPayload: payload.sendPayload,
            requestInspection: this.inspectRequest(task, { payload }),
        };
    }

    async sendThroughChat(chat, sendPayload, task) {
        let response;
        let thoughts;
        let text;
        let finalFunctionCalls = [];
        const internalIdPrefix = `google-tool-${++this.toolCallResponseSequence}`;
        const streamFunctionCalls = createStreamFunctionCallAccumulator(internalIdPrefix);
        let streamedGoogleContent = null;
        const requestConfig = task.signal
            ? {
                ...(this.sessionConfig || {}),
                abortSignal: task.signal,
            }
            : undefined;
        const requestPayload = {
            ...sendPayload,
            ...(requestConfig ? { config: requestConfig } : {}),
        };
        const shouldUseStreaming = typeof task.onStreamProgress === 'function';
        const historyLengthBeforeSend = getChatHistory(chat).length;
        // Google SDK 的 sendMessage/sendMessageStream 一旦传 per-request config，
        // 就不会继承 chats.create() 时的 session config。
        // 这里不能只为了 abortSignal 再拼一个 config，否则会把
        // systemInstruction / tools / thinkingConfig 冲掉。

        if (shouldUseStreaming) {
            const stream = await chat.sendMessageStream(requestPayload);
            const thoughtMap = new Map();
            let streamedText = '';
            let lastChunk = null;
            const streamedContents = [];

            for await (const chunk of stream) {
                lastChunk = chunk;
                const chunkContent = chunk?.candidates?.[0]?.content;
                if (chunkContent?.parts?.length) {
                    streamedContents.push(chunkContent);
                }
                extractThoughts(chunk).forEach((item, index) => {
                    const key = `${item.label}:${index}`;
                    thoughtMap.set(key, mergeStreamText(thoughtMap.get(key) || '', item.text));
                });

                finalFunctionCalls = streamFunctionCalls.append(chunk);

                const chunkText = extractVisibleText(chunk);
                streamedText = mergeStreamText(streamedText, chunkText);

                emitStreamProgress(task, {
                    text: streamedText,
                    thoughts: Array.from(thoughtMap.values())
                        .filter(Boolean)
                        .map((value, index) => ({
                            label: `思考块 ${index + 1}`,
                            text: value,
                        })),
                    ...(finalFunctionCalls.length ? { toolCalls: finalFunctionCalls, toolCallDraft: true } : {}),
                });
            }

            response = {
                ...(lastChunk || {}),
                functionCalls: finalFunctionCalls,
            };
            streamedGoogleContent = buildRepairedStreamedContent(streamedContents, streamedText)
                || response?.candidates?.[0]?.content
                || null;
            thoughts = Array.from(thoughtMap.values())
                .filter(Boolean)
                .map((value, index) => ({
                    label: `思考块 ${index + 1}`,
                    text: value,
                }));
            text = streamedText;
        } else {
            response = await chat.sendMessage(requestPayload);
            thoughts = extractThoughts(response);
            text = extractVisibleText(response);
        }

        const normalizedToolCalls = shouldUseStreaming
            ? finalFunctionCalls
            : extractFunctionCalls(response, internalIdPrefix);
        const historyModelContents = getNewModelContentsFromHistory(chat, historyLengthBeforeSend);

        return {
            text,
            toolCalls: normalizedToolCalls,
            thoughts,
            finishReason: response.candidates?.[0]?.finishReason || 'STOP',
            model: response.modelVersion || this.config.model,
            provider: 'google',
            providerPayload: buildProviderPayloadFromContents(historyModelContents)
                || buildProviderPayloadFromContent(streamedGoogleContent)
                || buildProviderPayload(response),
        };
    }

    async chat(task) {
        if (Array.isArray(task.toolResponses) && task.toolResponses.length) {
            if (!this.activeChat) {
                throw new Error('google_chat_session_missing');
            }
            const sendPayload = {
                message: buildToolResponseMessage(task.toolResponses),
            };
            return {
                ...await this.sendThroughChat(this.activeChat, sendPayload, task),
                requestInspection: this.inspectSendRequest(sendPayload, task),
            };
        }

        const finalAnswerReminderText = String(task.finalAnswerReminderText || '').trim();
        if (finalAnswerReminderText) {
            if (!this.activeChat) {
                throw new Error('google_chat_session_missing');
            }
            const sendPayload = {
                message: [buildTextPart(finalAnswerReminderText)],
            };
            return {
                ...await this.sendThroughChat(this.activeChat, sendPayload, task),
                requestInspection: this.inspectSendRequest(sendPayload, task),
            };
        }

        const created = this.createChat(task);
        this.activeChat = created.chat;
        this.sessionConfig = created.sessionConfig;
        return {
            ...await this.sendThroughChat(this.activeChat, created.sendPayload, task),
            requestInspection: created.requestInspection,
        };
    }
}
