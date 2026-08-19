import test from 'node:test';
import assert from 'node:assert/strict';

import { GoogleAdapter } from '../../agent-core/adapters/google.js';

test('google reasoning keeps model effort separate from thought output visibility', () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-3-flash-preview',
    });
    const hiddenTask = {
        messages: [{ role: 'user', content: 'think' }],
        reasoning: { mode: 'on', effort: 'minimal', output: 'hide' },
    };
    const hiddenPayload = adapter.buildChatPayload(hiddenTask);
    assert.deepEqual(hiddenPayload.createPayload.config.thinkingConfig, {
        includeThoughts: false,
        thinkingLevel: 'MINIMAL',
    });
    assert.deepEqual(adapter.inspectRequest(hiddenTask, { payload: hiddenPayload }).effectiveConfig, {
        reasoningRequestedMode: 'on',
        reasoningRequestedOutput: 'hide',
        reasoningProfileId: 'google-gemini-3-flash',
        reasoningEffectiveMode: 'on',
        reasoningEffort: 'MINIMAL',
        reasoningBudgetTokens: null,
        reasoningControlFields: {
            thinkingConfig: { includeThoughts: false, thinkingLevel: 'MINIMAL' },
        },
        reasoningOutputVisible: false,
    });

    const visiblePayload = adapter.buildChatPayload({
        ...hiddenTask,
        reasoning: { ...hiddenTask.reasoning, output: 'show' },
    });
    assert.equal(visiblePayload.createPayload.config.thinkingConfig.includeThoughts, true);

    const flash25 = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-2.5-flash',
    });
    assert.deepEqual(flash25.buildChatPayload({
        messages: hiddenTask.messages,
        reasoning: { mode: 'off', output: 'hide' },
    }).createPayload.config.thinkingConfig, {
        includeThoughts: false,
        thinkingBudget: 0,
    });
    assert.deepEqual(flash25.buildChatPayload({
        messages: hiddenTask.messages,
        reasoning: { mode: 'inherit', output: 'show' },
    }).createPayload.config.thinkingConfig, {
        includeThoughts: true,
    });
});

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
                    id: 'tool-1',
                    name: 'ReadSkillsCatalog',
                    response: { ok: true, skillCount: 1 },
                },
            }],
        },
    });
    assert.deepEqual(result.requestInspection?.request?.body?.sendMessage?.message, receivedPayload.message);
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
                    id: 'tool-1',
                    name: 'ReadSkillsCatalog',
                    response: { ok: true, skillCount: 1 },
                },
            }],
        },
    });
    assert.deepEqual(result.requestInspection?.request?.body?.sendMessage?.message, receivedPayload.message);
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

test('google adapter preserves tool ids and maps toolChoice to Gemini config', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });
    let createPayload;
    let sendPayload;
    adapter.client.chats.create = (payload) => {
        createPayload = payload;
        return {
            sendMessage: async (payload) => {
                sendPayload = payload;
                return { candidates: [{ content: { role: 'model', parts: [{ text: 'ok' }] } }] };
            },
        };
    };
    await adapter.chat({
        messages: [
            { role: 'user', content: '继续' },
            {
                role: 'assistant',
                content: '',
                tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'Read', arguments: '{}' } }],
            },
            { role: 'tool', tool_call_id: 'call-1', content: '{"ok":true}' },
        ],
        tools: [{ function: { name: 'Read', description: 'read', parameters: { type: 'object' } } }],
        toolChoice: 'Read',
    });
    assert.equal(createPayload.config.toolConfig.functionCallingConfig.mode, 'ANY');
    assert.deepEqual(createPayload.config.toolConfig.functionCallingConfig.allowedFunctionNames, ['Read']);
    const modelTurn = createPayload.history.find((content) => content.parts?.some((part) => part.functionCall));
    assert.equal(modelTurn.parts.find((part) => part.functionCall).functionCall.id, 'call-1');
    assert.equal(sendPayload.message[0].functionResponse.id, 'call-1');

    const requiredPayload = adapter.buildChatPayload({
        messages: [{ role: 'user', content: '继续' }],
        tools: [{ function: { name: 'Read', description: 'read', parameters: { type: 'object' } } }],
        toolChoice: 'required',
    });
    assert.equal(requiredPayload.createPayload.config.toolConfig.functionCallingConfig.mode, 'ANY');
    assert.equal(Object.hasOwn(requiredPayload.createPayload.config.toolConfig.functionCallingConfig, 'allowedFunctionNames'), false);
});

test('google adapter sends the full session config with abortSignal and keeps duplicate stream deltas', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });
    let requestPayload;
    adapter.client.chats.create = () => ({
        sendMessageStream: async function* sendMessageStream(payload) {
            requestPayload = payload;
            yield {
                candidates: [{ content: { role: 'model', parts: [{ text: 'A' }] } }],
                functionCalls: [
                    { id: 'call-1', name: 'Read', args: { path: 'a' } },
                    { id: 'call-2', name: 'Read', args: { path: 'b' } },
                ],
            };
            yield {
                candidates: [{ content: { role: 'model', parts: [{ text: 'A' }] } }],
                functionCalls: [{ id: 'call-1', name: 'Read', args: { mode: 'full' } }],
            };
        },
    });
    const controller = new AbortController();
    const result = await adapter.chat({
        messages: [{ role: 'user', content: '读取' }],
        tools: [{ function: { name: 'Read', description: 'read', parameters: { type: 'object' } } }],
        onStreamProgress: () => {},
        signal: controller.signal,
    });
    assert.equal(requestPayload.config.abortSignal, controller.signal);
    assert.equal(result.text, 'AA');
    assert.deepEqual(result.toolCalls.map((item) => item.id), ['call-1', 'call-2']);
    assert.deepEqual(JSON.parse(result.toolCalls[0].arguments), { path: 'a', mode: 'full' });
});

test('google adapter keeps local ids for parallel id-less calls and omits them from function responses', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });
    let receivedToolResponsePayload = null;
    let sendCount = 0;
    adapter.client.chats.create = () => ({
        sendMessage: async (payload) => {
            sendCount += 1;
            if (sendCount === 1) {
                return {
                    functionCalls: [
                        { name: 'Read', args: { path: 'a.md' } },
                        { name: 'Read', args: { path: 'b.md' } },
                    ],
                    candidates: [{
                        content: {
                            role: 'model',
                            parts: [
                                { functionCall: { name: 'Read', args: { path: 'a.md' } } },
                                { functionCall: { name: 'Read', args: { path: 'b.md' } } },
                            ],
                        },
                    }],
                };
            }
            receivedToolResponsePayload = payload;
            return {
                text: '两个文件都已读取。',
                candidates: [{
                    content: { role: 'model', parts: [{ text: '两个文件都已读取。' }] },
                }],
            };
        },
    });

    const first = await adapter.chat({
        messages: [{ role: 'user', content: '分别读取两个文件' }],
        tools: [{ function: { name: 'Read', description: 'read', parameters: { type: 'object' } } }],
    });
    assert.equal(first.toolCalls.length, 2);
    assert.notEqual(first.toolCalls[0].id, first.toolCalls[1].id);
    assert.ok(first.toolCalls.every((call) => call.id.startsWith('google-tool-')));
    assert.deepEqual(first.toolCalls.map((call) => call.providerId), ['', '']);

    await adapter.chat({
        toolResponses: first.toolCalls.map((call) => ({
            id: call.id,
            providerId: call.providerId,
            name: call.name,
            response: { ok: true },
        })),
    });
    const functionResponses = receivedToolResponsePayload.message.parts.map((part) => part.functionResponse);
    assert.deepEqual(functionResponses.map((response) => response.name), ['Read', 'Read']);
    assert.ok(functionResponses.every((response) => !Object.prototype.hasOwnProperty.call(response, 'id')));
});

test('google adapter omits id-less Google call ids when replaying persisted history', async () => {
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
                candidates: [{ content: { role: 'model', parts: [{ text: '继续。' }] } }],
            }),
        };
    };

    await adapter.chat({
        messages: [
            { role: 'user', content: '读取两个文件' },
            {
                role: 'assistant',
                content: '',
                tool_calls: [
                    {
                        id: 'google-tool-1-1',
                        type: 'function',
                        providerToolCallId: '',
                        function: { name: 'Read', arguments: '{"path":"a.md"}' },
                    },
                    {
                        id: 'google-tool-1-2',
                        type: 'function',
                        providerToolCallId: '',
                        function: { name: 'Read', arguments: '{"path":"b.md"}' },
                    },
                ],
            },
            { role: 'tool', tool_call_id: 'google-tool-1-1', toolName: 'Read', content: '{"ok":true}' },
            { role: 'tool', tool_call_id: 'google-tool-1-2', toolName: 'Read', content: '{"ok":true}' },
            { role: 'user', content: '继续' },
        ],
        tools: [{ function: { name: 'Read', description: 'read', parameters: { type: 'object' } } }],
    });

    const functionCalls = createPayload.history[1].parts.map((part) => part.functionCall);
    const functionResponses = createPayload.history[2].parts.map((part) => part.functionResponse);
    assert.ok(functionCalls.every((call) => !Object.prototype.hasOwnProperty.call(call, 'id')));
    assert.ok(functionResponses.every((response) => !Object.prototype.hasOwnProperty.call(response, 'id')));
});

test('google adapter keeps separate id-less calls from separate stream chunks', async () => {
    const adapter = new GoogleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/google',
        model: 'gemini-test',
    });
    adapter.client.chats.create = () => ({
        sendMessageStream: async function* sendMessageStream() {
            yield {
                functionCalls: [{ name: 'Read', args: { path: 'first.md' } }],
                candidates: [{ content: { role: 'model', parts: [{ functionCall: { name: 'Read', args: { path: 'first.md' } } }] } }],
            };
            yield {
                functionCalls: [{ name: 'Read', args: { path: 'second.md' } }],
                candidates: [{ content: { role: 'model', parts: [{ functionCall: { name: 'Read', args: { path: 'second.md' } } }] } }],
            };
        },
    });

    const result = await adapter.chat({
        messages: [{ role: 'user', content: '读取两个不同文件' }],
        tools: [{ function: { name: 'Read', description: 'read', parameters: { type: 'object' } } }],
        onStreamProgress: () => {},
    });

    assert.equal(result.toolCalls.length, 2);
    assert.notEqual(result.toolCalls[0].id, result.toolCalls[1].id);
    assert.deepEqual(result.toolCalls.map((call) => JSON.parse(call.arguments).path), ['first.md', 'second.md']);
    assert.deepEqual(result.toolCalls.map((call) => call.providerId), ['', '']);
    const replayCalls = result.providerPayload.googleContent.parts.map((part) => part.functionCall).filter(Boolean);
    assert.equal(replayCalls.length, 2);
    assert.ok(replayCalls.every((call) => !Object.prototype.hasOwnProperty.call(call, 'id')));
});
