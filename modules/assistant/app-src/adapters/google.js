import { FunctionCallingConfigMode, GoogleGenAI } from '@google/genai';

function logOutgoingRequest(label, payload) {
    try {
        console.groupCollapsed(label);
        console.log(JSON.parse(JSON.stringify(payload)));
        console.groupEnd();
    } catch {
        console.log(label, payload);
    }
}

function parseArguments(text) {
    try {
        return JSON.parse(text || '{}');
    } catch {
        return {};
    }
}

function buildConversation(messages) {
    const toolNameById = new Map();
    const contents = [];

    messages.forEach((message) => {
        (message.tool_calls || []).forEach((toolCall) => {
            if (toolCall.id && toolCall.function?.name) {
                toolNameById.set(toolCall.id, toolCall.function.name);
            }
        });
    });

    for (const message of messages) {
        if (message.role === 'system') continue;

        if (message.role === 'tool') {
            contents.push({
                role: 'user',
                parts: [{
                    functionResponse: {
                        name: toolNameById.get(message.tool_call_id || '') || 'tool_result',
                        response: parseArguments(message.content),
                    },
                }],
            });
            continue;
        }

        if (message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
            contents.push({
                role: 'model',
                parts: [
                    ...(message.content ? [{ text: message.content }] : []),
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
            parts: [{ text: message.content || '' }],
        });
    }

    if (!contents.length) {
        return {
            history: [],
            latestMessage: [{ text: '' }],
        };
    }

    const latest = contents[contents.length - 1];
    if (latest.role === 'user') {
        return {
            history: contents.slice(0, -1),
            latestMessage: latest.parts,
        };
    }

    return {
        history: contents,
        latestMessage: [{ text: '' }],
    };
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
        const createPayload = {
            model: this.config.model,
            history: conversation.history,
            config: {
                systemInstruction: task.systemPrompt,
                temperature: task.temperature,
                tools: [{
                    functionDeclarations: (task.tools || []).map((tool) => ({
                        name: tool.function.name,
                        description: tool.function.description,
                        parameters: tool.function.parameters,
                    })),
                }],
                toolConfig: {
                    functionCallingConfig: {
                        mode: FunctionCallingConfigMode.AUTO,
                    },
                },
                ...(task.maxTokens ? { maxOutputTokens: task.maxTokens } : {}),
            },
        };
        logOutgoingRequest('[LittleWhiteBox Assistant] Google AI outgoing create payload', createPayload);
        const chat = this.client.chats.create(createPayload);

        const sendPayload = {
            message: conversation.latestMessage,
            config: {
                abortSignal: task.signal,
            },
        };
        logOutgoingRequest('[LittleWhiteBox Assistant] Google AI outgoing send payload', sendPayload);
        const response = await chat.sendMessage(sendPayload);

        const toolCalls = (response.functionCalls || []).map((item, index) => ({
            id: item.id || `google-tool-${index + 1}`,
            name: item.name || '',
            arguments: JSON.stringify(item.args || {}),
        })).filter((item) => item.name);

        const text = typeof response.text === 'string'
            ? response.text
            : (response.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').filter(Boolean).join('\n');

        return {
            text,
            toolCalls,
            finishReason: response.candidates?.[0]?.finishReason || 'STOP',
            model: response.modelVersion || this.config.model,
            provider: 'google',
        };
    }
}
