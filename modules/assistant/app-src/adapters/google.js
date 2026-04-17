import { FunctionCallingConfigMode, GoogleGenAI, ThinkingLevel } from '@google/genai';

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

function parseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
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
        parts: [buildTextPart('继续。')],
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
        this.client = new GoogleGenAI({
            apiKey: config.apiKey,
            httpOptions: {
                baseUrl: String(config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, ''),
                timeout: Number(config.timeoutMs) || 180000,
            },
        });
    }

    async chat(task) {
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
        logOutgoingRequest('[LittleWhiteBox Assistant] Google AI outgoing create payload', createPayload);
        const chat = this.client.chats.create(createPayload);

        const sendPayload = {
            message: conversation.latestMessage,
        };
        logOutgoingRequest('[LittleWhiteBox Assistant] Google AI outgoing send payload', sendPayload);
        let response;
        let thoughts;
        let text;
        let finalFunctionCalls = [];

        if (typeof task.onStreamProgress === 'function') {
            const stream = await chat.sendMessageStream(sendPayload);
            const thoughtMap = new Map();
            let streamedText = '';
            let streamedToolCalls = [];
            let lastChunk = null;

            for await (const chunk of stream) {
                lastChunk = chunk;
                const chunkText = typeof chunk.text === 'string'
                    ? chunk.text
                    : (chunk.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').filter(Boolean).join('\n');
                streamedText = mergeStreamText(streamedText, chunkText);

                extractThoughts(chunk).forEach((item, index) => {
                    const key = `${item.label}:${index}`;
                    thoughtMap.set(key, mergeStreamText(thoughtMap.get(key) || '', item.text));
                });

                streamedToolCalls = (chunk.functionCalls || []).map((item, index) => ({
                    id: item.id || `google-tool-${index + 1}`,
                    name: item.name || '',
                    arguments: JSON.stringify(item.args || {}),
                })).filter((item) => item.name);
                finalFunctionCalls = streamedToolCalls;

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
            thoughts = Array.from(thoughtMap.values())
                .filter(Boolean)
                .map((value, index) => ({
                    label: `思考块 ${index + 1}`,
                    text: value,
                }));
            text = streamedText;
        } else {
            response = await chat.sendMessage(sendPayload);
            thoughts = extractThoughts(response);
            text = typeof response.text === 'string'
                ? response.text
                : (response.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').filter(Boolean).join('\n');
        }
        const toolCalls = (response.functionCalls || []).map((item, index) => ({
            id: item.id || `google-tool-${index + 1}`,
            name: item.name || '',
            arguments: JSON.stringify(item.args || {}),
        })).filter((item) => item.name);
        const normalizedToolCalls = toolCalls.length
            ? toolCalls
            : finalFunctionCalls;

        return {
            text,
            toolCalls: normalizedToolCalls,
            thoughts,
            finishReason: response.candidates?.[0]?.finishReason || 'STOP',
            model: response.modelVersion || this.config.model,
            provider: 'google',
        };
    }
}
