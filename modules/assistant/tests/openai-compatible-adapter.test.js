import test from 'node:test';
import assert from 'node:assert/strict';

import { OpenAICompatibleAdapter } from '../app-src/adapters/openai-compatible.js';

function createSseResponse(events = [], delimiter = '\n\n') {
    const payload = events.map((event) => `data: ${JSON.stringify(event)}${delimiter}`).join('') + `data: [DONE]${delimiter}`;
    const stream = new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(payload));
            controller.close();
        },
    });
    return {
        ok: true,
        body: stream,
        text: async () => payload,
    };
}

test('openai-compatible adapter keeps streaming enabled in reasoning mode and preserves raw assistant payload', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createSseResponse([{
            model: 'compat-test',
            choices: [{
                index: 0,
                delta: {
                    role: 'assistant',
                    content: '我先读取技能目录。',
                    tool_calls: [{
                        index: 0,
                        id: 'call-1',
                        type: 'function',
                        function: {
                            name: 'ReadSkillsCatalog',
                            arguments: '{}',
                        },
                    }],
                },
                reasoning_content: '先确认可用技能，再决定下一步。',
                finish_reason: 'tool_calls',
            }],
        }]);
    };

    try {
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
            reasoning: {
                enabled: true,
                effort: 'high',
            },
            onStreamProgress: () => {},
        });

        assert.equal(requests.length, 1);
        assert.equal(requests[0].body.stream, true);
        assert.equal(result.text, '我先读取技能目录。');
        assert.deepEqual(result.toolCalls, [{
            id: 'call-1',
            name: 'ReadSkillsCatalog',
            arguments: '{}',
        }]);
        assert.deepEqual(result.providerPayload, {
            openaiCompatibleMessage: {
                role: 'assistant',
                content: '我先读取技能目录。',
                reasoning_content: '先确认可用技能，再决定下一步。',
                tool_calls: [{
                    id: 'call-1',
                    type: 'function',
                    function: {
                        name: 'ReadSkillsCatalog',
                        arguments: '{}',
                    },
                }],
            },
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('openai-compatible adapter merges choice-level reasoning fields into the replay payload in non-streaming mode', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    adapter.client.chat.completions.create = async () => ({
        choices: [{
            finish_reason: 'tool_calls',
            reasoning_content: '这是 choice 级别的隐藏推理。',
            message: {
                role: 'assistant',
                content: '我先读取技能目录。',
                tool_calls: [{
                    id: 'call-1',
                    type: 'function',
                    function: {
                        name: 'ReadSkillsCatalog',
                        arguments: '{}',
                    },
                }],
            },
        }],
        model: 'compat-test',
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
    });

    assert.deepEqual(result.providerPayload, {
        openaiCompatibleMessage: {
            role: 'assistant',
            content: '我先读取技能目录。',
            reasoning_content: '这是 choice 级别的隐藏推理。',
            tool_calls: [{
                id: 'call-1',
                type: 'function',
                function: {
                    name: 'ReadSkillsCatalog',
                    arguments: '{}',
                },
            }],
        },
    });
});

test('openai-compatible adapter does not duplicate scalar fields like role while merging replay payloads', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    const progressSnapshots = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([{
        model: 'compat-test',
        choices: [{
            index: 0,
            role: 'assistant',
            delta: {
                role: 'assistant',
                content: '工具测试完成。',
            },
            finish_reason: 'stop',
        }],
    }]);

    try {
        const result = await adapter.chat({
            messages: [{
                role: 'user',
                content: '随便做一个工具测试',
            }],
            onStreamProgress: (snapshot) => {
                progressSnapshots.push(snapshot);
            },
        });

        assert.equal(progressSnapshots.length > 0, true);
        assert.equal(result.providerPayload?.openaiCompatibleMessage?.role, 'assistant');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('openai-compatible adapter keeps reasoning_content captured from stream chunks even when final completion omits it', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([{
        model: 'compat-test',
        choices: [{
            index: 0,
            delta: {
                role: 'assistant',
                content: '我先读取一下工作区文件状态。',
                tool_calls: [{
                    index: 0,
                    id: 'call-1',
                    type: 'function',
                    function: {
                        name: 'Read',
                        arguments: '{"path":"local/test-workspace.txt"}',
                    },
                }],
            },
            reasoning_content: '先读取一个轻量文件确认工具链正常。',
            finish_reason: 'tool_calls',
        }],
    }]);

    try {
        const result = await adapter.chat({
            messages: [{
                role: 'user',
                content: '随便做一个工具测试',
            }],
            tools: [{
                function: {
                    name: 'Read',
                    description: 'Read a file.',
                    parameters: {
                        type: 'object',
                        properties: {
                            path: { type: 'string' },
                        },
                    },
                },
            }],
            onStreamProgress: () => {},
        });

        assert.equal(result.providerPayload?.openaiCompatibleMessage?.reasoning_content, '先读取一个轻量文件确认工具链正常。');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('openai-compatible adapter accepts CRLF-delimited SSE events in native streaming mode', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([{
        model: 'compat-test',
        choices: [{
            index: 0,
            delta: {
                role: 'assistant',
                content: '第一段',
            },
            finish_reason: null,
        }],
    }, {
        model: 'compat-test',
        choices: [{
            index: 0,
            delta: {
                content: '第二段',
            },
            finish_reason: 'stop',
        }],
    }], '\r\n\r\n');

    try {
        const result = await adapter.chat({
            messages: [{
                role: 'user',
                content: '随便做一个工具测试',
            }],
            onStreamProgress: () => {},
        });

        assert.equal(result.text, '第一段第二段');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('openai-compatible adapter replays preserved assistant message on the next tool round', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    const preservedMessage = {
        role: 'assistant',
        content: '我先读取技能目录。',
        reasoning_content: '先确认可用技能，再决定下一步。',
        tool_calls: [{
            id: 'call-1',
            type: 'function',
            function: {
                name: 'ReadSkillsCatalog',
                arguments: '{}',
            },
        }],
    };

    let receivedBody = null;
    adapter.client.chat.completions.create = async (body) => {
        receivedBody = body;
        return {
            choices: [{
                finish_reason: 'stop',
                message: {
                    role: 'assistant',
                    content: '工具测试完成。',
                },
            }],
            model: 'compat-test',
        };
    };

    await adapter.chat({
        messages: [
            {
                role: 'user',
                content: '做一轮工具测试',
            },
            {
                role: 'assistant',
                content: '我先读取技能目录。',
                providerPayload: {
                    openaiCompatibleMessage: preservedMessage,
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-1',
                content: JSON.stringify({ ok: true, skillCount: 1 }),
            },
        ],
        reasoning: {
            enabled: true,
            effort: 'high',
        },
    });

    assert.deepEqual(receivedBody.messages[1], preservedMessage);
    assert.deepEqual(receivedBody.messages[2], {
        role: 'tool',
        tool_call_id: 'call-1',
        content: JSON.stringify({ ok: true, skillCount: 1 }),
    });
});

test('openai-compatible adapter does not replay historical reasoning payloads from completed older turns', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    let receivedBody = null;
    adapter.client.chat.completions.create = async (body) => {
        receivedBody = body;
        return {
            choices: [{
                finish_reason: 'stop',
                message: {
                    role: 'assistant',
                    content: '这一轮结束。',
                },
            }],
            model: 'compat-test',
        };
    };

    await adapter.chat({
        messages: [
            {
                role: 'user',
                content: '上一轮做个工具测试',
            },
            {
                role: 'assistant',
                content: '我先读取技能目录。',
                tool_calls: [{
                    id: 'old-call-1',
                    type: 'function',
                    function: {
                        name: 'ReadSkillsCatalog',
                        arguments: '{}',
                    },
                }],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '我先读取技能目录。',
                        reasoning_content: '这是上一轮的隐藏推理，不应该再原样回放。',
                        tool_calls: [{
                            id: 'old-call-1',
                            type: 'function',
                            function: {
                                name: 'ReadSkillsCatalog',
                                arguments: '{}',
                            },
                        }],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'old-call-1',
                content: JSON.stringify({ ok: true }),
            },
            {
                role: 'assistant',
                content: '上一轮结束。',
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '上一轮结束。',
                        reasoning_content: '这一段历史推理也不该继续带着。',
                    },
                },
            },
            {
                role: 'user',
                content: '这一轮继续做工具测试',
            },
            {
                role: 'assistant',
                content: '我先读取工作记录。',
                tool_calls: [{
                    id: 'current-call-1',
                    type: 'function',
                    function: {
                        name: 'ReadWorklog',
                        arguments: '{}',
                    },
                }],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '我先读取工作记录。',
                        reasoning_content: '这是当前续接中的隐藏推理，必须保留。',
                        tool_calls: [{
                            id: 'current-call-1',
                            type: 'function',
                            function: {
                                name: 'ReadWorklog',
                                arguments: '{}',
                            },
                        }],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'current-call-1',
                content: JSON.stringify({ ok: true }),
            },
        ],
        reasoning: {
            enabled: true,
            effort: 'high',
        },
    });

    assert.deepEqual(receivedBody.messages[1], {
        role: 'assistant',
        content: '我先读取技能目录。',
        tool_calls: [{
            id: 'old-call-1',
            type: 'function',
            function: {
                name: 'ReadSkillsCatalog',
                arguments: '{}',
            },
        }],
    });
    assert.deepEqual(receivedBody.messages[3], {
        role: 'assistant',
        content: '上一轮结束。',
    });
    assert.deepEqual(receivedBody.messages[5], {
        role: 'assistant',
        content: '我先读取工作记录。',
        reasoning_content: '这是当前续接中的隐藏推理，必须保留。',
        tool_calls: [{
            id: 'current-call-1',
            type: 'function',
            function: {
                name: 'ReadWorklog',
                arguments: '{}',
            },
        }],
    });
});

test('openai-compatible adapter replays a current turn with multiple tool calls and reasoning_content intact', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    let receivedBody = null;
    adapter.client.chat.completions.create = async (body) => {
        receivedBody = body;
        return {
            choices: [{
                finish_reason: 'stop',
                message: {
                    role: 'assistant',
                    content: '工具测试完成。',
                },
            }],
            model: 'compat-test',
        };
    };

    const replayableAssistant = {
        role: 'assistant',
        content: '好，做几个基础工具调用，验证各通道是否正常。',
        reasoning_content: '先分别调用 slash、identity、worklog 三个只读工具，再统一总结。',
        tool_calls: [
            {
                id: 'call-1',
                type: 'function',
                function: {
                    name: 'RunSlashCommand',
                    arguments: '{"command":"/char-get field=name"}',
                },
            },
            {
                id: 'call-2',
                type: 'function',
                function: {
                    name: 'ReadIdentity',
                    arguments: '{}',
                },
            },
            {
                id: 'call-3',
                type: 'function',
                function: {
                    name: 'ReadWorklog',
                    arguments: '{}',
                },
            },
        ],
    };

    await adapter.chat({
        messages: [
            {
                role: 'user',
                content: '随便做一个工具测试',
            },
            {
                role: 'assistant',
                content: replayableAssistant.content,
                tool_calls: replayableAssistant.tool_calls,
                providerPayload: {
                    openaiCompatibleMessage: replayableAssistant,
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-1',
                content: JSON.stringify({ ok: true, output: '角色名' }),
            },
            {
                role: 'tool',
                tool_call_id: 'call-2',
                content: JSON.stringify({ ok: true, path: 'LittleWhiteBox_Assistant_Identity.md' }),
            },
            {
                role: 'tool',
                tool_call_id: 'call-3',
                content: JSON.stringify({ ok: true, path: 'LittleWhiteBox_Assistant_Worklog.md' }),
            },
        ],
        reasoning: {
            enabled: true,
            effort: 'high',
        },
    });

    assert.deepEqual(receivedBody.messages, [
        {
            role: 'user',
            content: '随便做一个工具测试',
        },
        replayableAssistant,
        {
            role: 'tool',
            tool_call_id: 'call-1',
            content: JSON.stringify({ ok: true, output: '角色名' }),
        },
        {
            role: 'tool',
            tool_call_id: 'call-2',
            content: JSON.stringify({ ok: true, path: 'LittleWhiteBox_Assistant_Identity.md' }),
        },
        {
            role: 'tool',
            tool_call_id: 'call-3',
            content: JSON.stringify({ ok: true, path: 'LittleWhiteBox_Assistant_Worklog.md' }),
        },
    ]);
});

test('openai-compatible adapter adds empty reasoning_content for DeepSeek assistant tool-call turns when missing', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'deepseek-reasoner',
    });

    let receivedBody = null;
    adapter.client.chat.completions.create = async (body) => {
        receivedBody = body;
        return {
            choices: [{
                finish_reason: 'stop',
                message: {
                    role: 'assistant',
                    content: '完成。',
                },
            }],
            model: 'deepseek-reasoner',
        };
    };

    await adapter.chat({
        messages: [
            {
                role: 'user',
                content: '做一轮工具测试',
            },
            {
                role: 'assistant',
                content: '先读一下身份和工作记录。',
                tool_calls: [
                    {
                        id: 'call-1',
                        type: 'function',
                        function: {
                            name: 'ReadIdentity',
                            arguments: '{}',
                        },
                    },
                    {
                        id: 'call-2',
                        type: 'function',
                        function: {
                            name: 'ReadWorklog',
                            arguments: '{}',
                        },
                    },
                ],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '先读一下身份和工作记录。',
                        tool_calls: [
                            {
                                id: 'call-1',
                                type: 'function',
                                function: {
                                    name: 'ReadIdentity',
                                    arguments: '{}',
                                },
                            },
                            {
                                id: 'call-2',
                                type: 'function',
                                function: {
                                    name: 'ReadWorklog',
                                    arguments: '{}',
                                },
                            },
                        ],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-1',
                content: JSON.stringify({ ok: true }),
            },
            {
                role: 'tool',
                tool_call_id: 'call-2',
                content: JSON.stringify({ ok: true }),
            },
        ],
        reasoning: {
            enabled: true,
            effort: 'high',
        },
    });

    assert.equal(receivedBody.messages[1].reasoning_content, '');
});

test('openai-compatible adapter keeps streamed reasoning_content when later chunks send null', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'deepseek-v4-pro',
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([
        {
            model: 'deepseek-v4-pro',
            choices: [{
                index: 0,
                delta: {
                    role: 'assistant',
                    content: '好的，我先调用这两个工具：',
                    tool_calls: [{
                        index: 0,
                        id: 'call-1',
                        type: 'function',
                        function: {
                            name: 'ReadIdentity',
                            arguments: '{}',
                        },
                    }],
                },
                reasoning_content: '先读 identity 再继续。',
                finish_reason: null,
            }],
        },
        {
            model: 'deepseek-v4-pro',
            choices: [{
                index: 0,
                delta: {
                    tool_calls: [{
                        index: 1,
                        id: 'call-2',
                        type: 'function',
                        function: {
                            name: 'ReadWorklog',
                            arguments: '{}',
                        },
                    }],
                },
                reasoning_content: null,
                finish_reason: 'tool_calls',
            }],
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{
                role: 'user',
                content: '做一轮工具测试',
            }],
            tools: [
                {
                    type: 'function',
                    function: {
                        name: 'ReadIdentity',
                        description: 'Read identity.',
                        parameters: { type: 'object', properties: {} },
                    },
                },
                {
                    type: 'function',
                    function: {
                        name: 'ReadWorklog',
                        description: 'Read worklog.',
                        parameters: { type: 'object', properties: {} },
                    },
                },
            ],
            reasoning: {
                enabled: true,
                effort: 'high',
            },
            onStreamProgress: () => {},
        });

        assert.equal(
            result.providerPayload?.openaiCompatibleMessage?.reasoning_content,
            '先读 identity 再继续。',
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});
