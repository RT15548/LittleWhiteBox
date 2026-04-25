import { FunctionCallingConfigMode, GoogleGenAI, ThinkingLevel } from '@google/genai';

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

function getFunctionCallPartKey(part, index) {
    if (!part?.functionCall?.name) return '';
    return [
        String(part.functionCall.id || ''),
        String(part.functionCall.name || ''),
        JSON.stringify(part.functionCall.args || {}),
        String(index),
    ].join('\u0000');
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
    const baseContent = cloneJson(latestSignedContent || latestFunctionCallContent || normalizedContents[normalizedContents.length - 1]);
    if (!baseContent?.parts?.length) {
        return normalizedContents[normalizedContents.length - 1];
    }

    if (latestFunctionCallContent) {
        const bestFunctionCallParts = new Map();
        normalizedContents.forEach((content) => {
            content.parts.forEach((part, index) => {
                const key = getFunctionCallPartKey(part, index);
                if (!key) return;
                const currentBest = bestFunctionCallParts.get(key);
                if (!currentBest || part.thoughtSignature || !currentBest.thoughtSignature) {
                    bestFunctionCallParts.set(key, cloneJson(part));
                }
            });
        });

        const existingKeys = new Set();
        baseContent.parts = baseContent.parts.map((part, index) => {
            const key = getFunctionCallPartKey(part, index);
            if (!key) return part;
            existingKeys.add(key);
            return bestFunctionCallParts.get(key) || part;
        });

        latestFunctionCallContent.parts.forEach((part, index) => {
            const key = getFunctionCallPartKey(part, index);
            if (!key || existingKeys.has(key)) return;
            baseContent.parts.push(bestFunctionCallParts.get(key) || cloneJson(part));
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

function extractFunctionCalls(response) {
    const sdkFunctionCalls = Array.isArray(response?.functionCalls)
        ? response.functionCalls
        : [];
    const contentFunctionCalls = (response?.candidates?.[0]?.content?.parts || [])
        .map((item) => item?.functionCall || item)
        .filter((item) => item && item.name);
    const rawCalls = sdkFunctionCalls.length
        ? sdkFunctionCalls
        : contentFunctionCalls;
    return rawCalls
        .map((item, index) => ({
            id: item.id || `google-tool-${index + 1}`,
            name: item.name || '',
            arguments: JSON.stringify(item.args || {}),
        }))
        .filter((item) => item.name);
}

function mergeFunctionCalls(existing = [], incoming = []) {
    const merged = Array.isArray(existing) ? [...existing] : [];
    (Array.isArray(incoming) ? incoming : []).forEach((item) => {
        if (!item?.name) return;
        const key = [
            String(item.id || ''),
            String(item.name || ''),
            String(item.arguments || ''),
        ].join('\u0000');
        const exists = merged.some((current) => [
            String(current.id || ''),
            String(current.name || ''),
            String(current.arguments || ''),
        ].join('\u0000') === key);
        if (!exists) {
            merged.push(item);
        }
    });
    return merged;
}

function buildToolResponseMessage(toolResponses = []) {
    return {
        role: 'user',
        parts: toolResponses
            .filter((item) => item && item.name)
            .map((item) => ({
                functionResponse: {
                    name: item.name,
                    response: item.response || {},
                },
            })),
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
    const contents = [];
    const filteredMessages = (messages || []).filter((message) => (
        message.role === 'user' || message.role === 'assistant' || message.role === 'tool'
    ));

    filteredMessages.forEach((message) => {
        (message.tool_calls || []).forEach((toolCall) => {
            if (toolCall.id && toolCall.function?.name) {
                toolNameById.set(toolCall.id, toolCall.function.name);
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
                parts.push({
                    functionResponse: {
                        name: toolNameById.get(toolMessage.tool_call_id || '') || 'tool_result',
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
    });
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

export class GoogleAdapter {
    constructor(config) {
        this.config = config;
        this.supportsSessionToolLoop = true;
        this.activeChat = null;
        this.client = new GoogleGenAI({
            apiKey: config.apiKey,
            httpOptions: {
                baseUrl: String(config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
                timeout: Number(config.timeoutMs) || 180000,
            },
        });
    }

    createChat(task) {
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

        if (tools.length && task.toolChoice && task.toolChoice !== 'auto' && task.toolChoice !== 'none') {
            config.toolConfig = {
                functionCallingConfig: {
                    mode: FunctionCallingConfigMode.ANY,
                },
            };
        }

        const createPayload = {
            model: this.config.model,
            history: conversation.history,
            config,
        };
        const chat = this.client.chats.create(createPayload);
        return {
            chat,
            sendPayload: {
                message: conversation.latestMessage,
            },
        };
    }

    async sendThroughChat(chat, sendPayload, task) {
        let response;
        let thoughts;
        let text;
        let finalFunctionCalls = [];
        let streamedGoogleContent = null;
        const requestPayload = { ...sendPayload };
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
            let streamedToolCalls = [];
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

                streamedToolCalls = (chunk.functionCalls || []).map((item, index) => ({
                    id: item.id || `google-tool-${index + 1}`,
                    name: item.name || '',
                    arguments: JSON.stringify(item.args || {}),
                })).filter((item) => item.name);
                finalFunctionCalls = mergeFunctionCalls(
                    finalFunctionCalls,
                    streamedToolCalls.length ? streamedToolCalls : extractFunctionCalls(chunk),
                );

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
                });
            }

            response = lastChunk || { functionCalls: streamedToolCalls };
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

        const toolCalls = extractFunctionCalls(response);
        const normalizedToolCalls = toolCalls.length
            ? toolCalls
            : finalFunctionCalls;
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
            return await this.sendThroughChat(this.activeChat, {
                message: buildToolResponseMessage(task.toolResponses),
            }, task);
        }

        const finalAnswerReminderText = String(task.finalAnswerReminderText || '').trim();
        if (finalAnswerReminderText) {
            if (!this.activeChat) {
                throw new Error('google_chat_session_missing');
            }
            return await this.sendThroughChat(this.activeChat, {
                message: [buildTextPart(finalAnswerReminderText)],
            }, task);
        }

        const created = this.createChat(task);
        this.activeChat = created.chat;
        return await this.sendThroughChat(this.activeChat, created.sendPayload, task);
    }
}
