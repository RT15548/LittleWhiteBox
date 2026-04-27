import test from 'node:test';
import assert from 'node:assert/strict';

import { GoogleAdapter } from '../app-src/adapters/google.js';

test('google adapter preserves visible text alongside tool calls in non-streaming responses', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    adapter.client.chats.create = () => ({
        sendMessage: async () => ({
            functionCalls: [{
                id: 'call-1',
                name: 'Write',
                args: {
                    path: 'local/test.txt',
                    content: 'hello',
                },
            }],
            candidates: [{
                finishReason: 'STOP',
                content: {
                    role: 'model',
                    parts: [
                        { text: '我先写一个测试文件。' },
                        {
                            functionCall: {
                                name: 'Write',
                                args: {
                                    path: 'local/test.txt',
                                    content: 'hello',
                                },
                            },
                        },
                    ],
                },
            }],
            modelVersion: 'gemini-test',
        }),
    });

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '做一轮工具测试',
        }],
        tools: [{
            function: {
                name: 'Write',
                description: 'Write a file.',
                parameters: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                        content: { type: 'string' },
                    },
                },
            },
        }],
    });

    assert.equal(result.text, '我先写一个测试文件。');
    assert.deepEqual(result.toolCalls, [{
        id: 'call-1',
        name: 'Write',
        arguments: JSON.stringify({
            path: 'local/test.txt',
            content: 'hello',
        }),
    }]);
});

test('google adapter streams chat calls when tools are enabled', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    let sendMessageCalled = 0;
    let sendMessageStreamCalled = 0;
    adapter.client.chats.create = () => ({
        sendMessage: async () => {
            sendMessageCalled += 1;
            return {
                text: '我先执行工具。',
                functionCalls: [{
                    id: 'call-1',
                    name: 'RunJavaScriptApi',
                    args: { code: 'return 1;' },
                }],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{
                            functionCall: {
                                id: 'call-1',
                                name: 'RunJavaScriptApi',
                                args: { code: 'return 1;' },
                            },
                        }],
                    },
                }],
                modelVersion: 'gemini-test',
            };
        },
        sendMessageStream: async function* sendMessageStream() {
            sendMessageStreamCalled += 1;
            yield {
                text: '我先执行工具。',
                functionCalls: [{
                    id: 'call-1',
                    name: 'RunJavaScriptApi',
                    args: { code: 'return 1;' },
                }],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [
                            { text: '我先执行工具。' },
                            {
                                functionCall: {
                                    id: 'call-1',
                                    name: 'RunJavaScriptApi',
                                    args: { code: 'return 1;' },
                                },
                            },
                        ],
                    },
                }],
                modelVersion: 'gemini-test',
            };
        },
    });

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '做一轮工具测试',
        }],
        tools: [{
            function: {
                name: 'RunJavaScriptApi',
                description: 'Run a JS API call.',
                parameters: {
                    type: 'object',
                    properties: {
                        code: { type: 'string' },
                    },
                },
            },
        }],
        onStreamProgress: () => {},
    });

    assert.equal(sendMessageCalled, 0);
    assert.equal(sendMessageStreamCalled, 1);
    assert.equal(result.text, '我先执行工具。');
    assert.deepEqual(result.toolCalls, [{
        id: 'call-1',
        name: 'RunJavaScriptApi',
        arguments: JSON.stringify({ code: 'return 1;' }),
    }]);
});

test('google adapter prefers sdk text getter when visible text is exposed there', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    adapter.client.chats.create = () => ({
        sendMessage: async () => ({
            text: '工具测试已完成，读写链路正常。',
            functionCalls: [],
            candidates: [{
                finishReason: 'STOP',
                content: {
                    role: 'model',
                    parts: [],
                },
            }],
            modelVersion: 'gemini-test',
        }),
    });

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '做一轮工具测试',
        }],
        tools: [],
    });

    assert.equal(result.text, '工具测试已完成，读写链路正常。');
    assert.deepEqual(result.toolCalls, []);
});

test('google adapter keeps raw google content for future rounds and uses session tool loop', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    let createPayload = null;
    adapter.client.chats.create = (payload) => {
        createPayload = payload;
        return {
            sendMessage: async () => ({
                text: '好的。',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{ text: '好的。' }],
                    },
                }],
                modelVersion: 'gemini-test',
            }),
        };
    };

    assert.equal(adapter.supportsSessionToolLoop, true);

    const preservedContent = {
        role: 'model',
        parts: [
            { text: '我来调用工具。' },
            {
                functionCall: {
                    name: 'RunJavaScriptApi',
                    args: { code: "return 'ok';" },
                },
            },
        ],
    };

    const result = await adapter.chat({
        messages: [
            {
                role: 'user',
                content: '做一轮工具测试',
            },
            {
                role: 'assistant',
                content: '',
                providerPayload: {
                    googleContent: preservedContent,
                },
            },
            {
                role: 'tool',
                tool_call_id: 'tool-1',
                content: JSON.stringify({ ok: true, value: 'ok' }),
            },
        ],
        tools: [],
    });

    assert.equal(createPayload.history[0].role, 'user');
    assert.deepEqual(createPayload.history[1], preservedContent);
    assert.deepEqual(createPayload.sendPayload, undefined);
    assert.deepEqual(result.providerPayload, {
        googleContent: {
            role: 'model',
            parts: [{ text: '好的。' }],
        },
        googleContents: [{
            role: 'model',
            parts: [{ text: '好的。' }],
        }],
    });
});

test('google adapter sends tool responses through the active chat session', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    let receivedPayload = null;
    const sendMessage = async () => ({
        text: '工具已执行完成。',
        functionCalls: [],
        candidates: [{
            finishReason: 'STOP',
            content: {
                role: 'model',
                parts: [{ text: '工具已执行完成。' }],
            },
        }],
        modelVersion: 'gemini-test',
    });

    adapter.activeChat = {
        sendMessage: async (payload) => {
            receivedPayload = payload;
            return await sendMessage(payload);
        },
        history: [],
    };

    const result = await adapter.chat({
        toolResponses: [{
            id: 'tool-1',
            name: 'ReadSkillsCatalog',
            response: { ok: true, skillCount: 1 },
        }],
    });

    assert.equal(result.text, '工具已执行完成。');
    assert.deepEqual(result.toolCalls, []);
    assert.deepEqual(receivedPayload, {
        message: {
            role: 'user',
            parts: [{
                functionResponse: {
                    name: 'ReadSkillsCatalog',
                    response: { ok: true, skillCount: 1 },
                },
            }],
        },
    });
});

test('google adapter streams tool responses through the active chat session', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    let receivedPayload = null;
    let sendMessageCalled = 0;
    let sendMessageStreamCalled = 0;
    const history = [];
    adapter.activeChat = {
        sendMessage: async () => {
            sendMessageCalled += 1;
            return {};
        },
        sendMessageStream: async function* sendMessageStream(payload) {
            sendMessageStreamCalled += 1;
            receivedPayload = payload;
            const content = {
                role: 'model',
                parts: [{ text: '工具已执行完成。' }],
            };
            yield {
                text: '工具已执行完成。',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content,
                }],
                modelVersion: 'gemini-test',
            };
            history.push(payload.message, content);
        },
        getHistory: () => history,
    };

    const result = await adapter.chat({
        toolResponses: [{
            id: 'tool-1',
            name: 'ReadSkillsCatalog',
            response: { ok: true, skillCount: 1 },
        }],
        onStreamProgress: () => {},
    });

    assert.equal(sendMessageCalled, 0);
    assert.equal(sendMessageStreamCalled, 1);
    assert.equal(result.text, '工具已执行完成。');
    assert.deepEqual(result.toolCalls, []);
    assert.deepEqual(receivedPayload, {
        message: {
            role: 'user',
            parts: [{
                functionResponse: {
                    name: 'ReadSkillsCatalog',
                    response: { ok: true, skillCount: 1 },
                },
            }],
        },
    });
    assert.deepEqual(result.providerPayload, {
        googleContent: {
            role: 'model',
            parts: [{ text: '工具已执行完成。' }],
        },
        googleContents: [{
            role: 'model',
            parts: [{ text: '工具已执行完成。' }],
        }],
    });
});

test('google adapter streams final answer reminders through the active chat session', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    let receivedPayload = null;
    let sendMessageCalled = 0;
    let sendMessageStreamCalled = 0;
    let createCalled = 0;
    adapter.client.chats.create = () => {
        createCalled += 1;
        return {};
    };
    adapter.activeChat = {
        sendMessage: async () => {
            sendMessageCalled += 1;
            return {};
        },
        sendMessageStream: async function* sendMessageStream(payload) {
            sendMessageStreamCalled += 1;
            receivedPayload = payload;
            yield {
                text: '最终答复已完成。',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{ text: '最终答复已完成。' }],
                    },
                }],
                modelVersion: 'gemini-test',
            };
        },
        getHistory: () => [],
    };

    const result = await adapter.chat({
        finalAnswerReminderText: '请直接给出最终答复。',
        onStreamProgress: () => {},
    });

    assert.equal(createCalled, 0);
    assert.equal(sendMessageCalled, 0);
    assert.equal(sendMessageStreamCalled, 1);
    assert.deepEqual(receivedPayload, {
        message: [{ text: '请直接给出最终答复。' }],
    });
    assert.equal(result.text, '最终答复已完成。');
    assert.deepEqual(result.toolCalls, []);
});

test('google adapter preserves streamed google content when thought signatures only appear before the last chunk', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    const history = [];
    const signedContent = {
        role: 'model',
        parts: [{
            functionCall: {
                id: 'call-1',
                name: 'ReadSkillsCatalog',
                args: {},
            },
            thoughtSignature: 'sig-1',
        }],
    };
    adapter.client.chats.create = () => ({
        sendMessageStream: async function* sendMessageStream() {
            yield {
                text: '',
                functionCalls: [{
                    id: 'call-1',
                    name: 'ReadSkillsCatalog',
                    args: {},
                }],
                candidates: [{
                    finishReason: 'STOP',
                    content: signedContent,
                }],
                modelVersion: 'gemini-test',
            };

            yield {
                text: '',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [],
                    },
                }],
                modelVersion: 'gemini-test',
            };
            history.push(
                { role: 'user', parts: [{ text: '做一轮工具测试' }] },
                signedContent,
            );
        },
        getHistory: () => history,
    });

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '做一轮工具测试',
        }],
        tools: [],
        onStreamProgress: () => {},
    });

    assert.deepEqual(result.providerPayload, {
        googleContent: signedContent,
        googleContents: [signedContent],
    });
});

test('google adapter accumulates streamed tool calls even when the final chunk is empty', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    adapter.client.chats.create = () => ({
        sendMessageStream: async function* sendMessageStream() {
            yield {
                text: '',
                functionCalls: [{
                    id: 'call-1',
                    name: 'ReadSkillsCatalog',
                    args: {},
                }],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{
                            functionCall: {
                                id: 'call-1',
                                name: 'ReadSkillsCatalog',
                                args: {},
                            },
                        }],
                    },
                }],
                modelVersion: 'gemini-test',
            };
            yield {
                text: '',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [],
                    },
                }],
                modelVersion: 'gemini-test',
            };
        },
    });

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '做一轮工具测试',
        }],
        tools: [{
            function: {
                name: 'ReadSkillsCatalog',
                description: 'Read skills catalog.',
                parameters: {
                    type: 'object',
                    properties: {},
                },
            },
        }],
        onStreamProgress: () => {},
    });

    assert.deepEqual(result.toolCalls, [{
        id: 'call-1',
        name: 'ReadSkillsCatalog',
        arguments: '{}',
    }]);
});

test('google adapter reads streamed tool calls from content parts when sdk functionCalls is empty', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    adapter.client.chats.create = () => ({
        sendMessageStream: async function* sendMessageStream() {
            yield {
                text: '',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{
                            functionCall: {
                                id: 'call-1',
                                name: 'ReadSkillsCatalog',
                                args: {},
                            },
                        }],
                    },
                }],
                modelVersion: 'gemini-test',
            };
            yield {
                text: '',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [],
                    },
                }],
                modelVersion: 'gemini-test',
            };
        },
    });

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '做一轮工具测试',
        }],
        tools: [{
            function: {
                name: 'ReadSkillsCatalog',
                description: 'Read skills catalog.',
                parameters: {
                    type: 'object',
                    properties: {},
                },
            },
        }],
        onStreamProgress: () => {},
    });

    assert.deepEqual(result.toolCalls, [{
        id: 'call-1',
        name: 'ReadSkillsCatalog',
        arguments: '{}',
    }]);
});

test('google adapter replays preserved googleContents in cold-start history order', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });

    let createPayload = null;
    adapter.client.chats.create = (payload) => {
        createPayload = payload;
        return {
            sendMessage: async () => ({
                text: '继续完成。',
                functionCalls: [],
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{ text: '继续完成。' }],
                    },
                }],
                modelVersion: 'gemini-test',
            }),
        };
    };

    const googleContents = [
        {
            role: 'model',
            parts: [{ text: '我先说明一下。' }],
        },
        {
            role: 'model',
            parts: [{
                functionCall: {
                    id: 'call-1',
                    name: 'ReadSkillsCatalog',
                    args: {},
                },
                thoughtSignature: 'sig-1',
            }],
        },
    ];

    await adapter.chat({
        messages: [
            {
                role: 'user',
                content: '做一轮工具测试',
            },
            {
                role: 'assistant',
                content: '',
                providerPayload: {
                    googleContent: googleContents[1],
                    googleContents,
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-1',
                content: JSON.stringify({ ok: true }),
            },
        ],
        tools: [],
    });

    assert.deepEqual(createPayload.history.slice(1, 3), googleContents);
});
