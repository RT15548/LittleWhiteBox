import test from 'node:test';
import assert from 'node:assert/strict';

import {
    OpenAICompatibleAdapter,
    buildNativeMessages,
    buildTaggedMessages,
    extractTaggedToolCalls,
    stripTaggedToolCallsForDisplay,
} from '../../agent-core/adapters/openai-compatible.js';

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

test('openai-compatible adapter hides incomplete tagged tool blocks from display text', () => {
    assert.equal(
        stripTaggedToolCallsForDisplay('我先查一下。\n<tool_call>{"name":"Read","arguments":{"filePath":"book/state.md"}'),
        '我先查一下。',
    );
    assert.equal(
        stripTaggedToolCallsForDisplay('前置说明\n<tool_call>{"name":"Read","arguments":{}}</tool_call>\n<tool_call>{"name":"Grep"'),
        '前置说明',
    );
    assert.equal(
        stripTaggedToolCallsForDisplay('前置说明\n<tool_call>{"name":"Read","arguments":{}}</tool_call>\n这段不该进入下一轮'),
        '前置说明',
    );
});

test('openai-compatible adapter sanitizes malformed replay tool calls before sending', () => {
    const messages = buildNativeMessages({
        messages: [
            {
                role: 'user',
                content: '继续。',
            },
            {
                role: 'assistant',
                content: '我需要读文件。',
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '我需要读文件。',
                        tool_calls: [
                            null,
                            {
                                id: 'bad-call',
                                type: 'function',
                                function: null,
                            },
                            {
                                id: 'call-1',
                                type: 'function',
                                index: 0,
                                function: {
                                    name: 'Read',
                                    arguments: { path: 'book/state.md' },
                                },
                            },
                        ],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-1',
                content: '{}',
            },
        ],
    }, 'compat-model');

    assert.deepEqual(messages[1].tool_calls, [{
        id: 'call-1',
        type: 'function',
        function: {
            name: 'Read',
            arguments: '{"path":"book/state.md"}',
        },
    }]);
});

test('openai-compatible Claude-like native messages coerce only the final system or assistant role to user', () => {
    const messages = buildNativeMessages({
        messages: [
            { role: 'system', content: '<meta_protocol>' },
            { role: 'assistant', content: 'history assistant' },
            { role: 'system', content: 'runtime system stays in place' },
            { role: 'user', content: 'current user' },
            { role: 'system', content: '</meta_protocol>' },
        ],
    }, 'anthropic/claude-sonnet-4-6');

    assert.deepEqual(messages.map((message) => message.role), [
        'system',
        'assistant',
        'system',
        'user',
        'user',
    ]);
    assert.equal(messages[4].content, '</meta_protocol>');

    const assistantTailMessages = buildNativeMessages({
        messages: [
            { role: 'system', content: 'rules' },
            { role: 'user', content: 'continue' },
            { role: 'assistant', content: 'prefill' },
        ],
    }, 'claude-sonnet-4-0');

    assert.deepEqual(assistantTailMessages.map((message) => message.role), [
        'system',
        'user',
        'user',
    ]);

    const toolTailMessages = buildNativeMessages({
        messages: [
            { role: 'user', content: 'run tool' },
            { role: 'tool', tool_call_id: 'call-1', content: '{"ok":true}' },
        ],
    }, 'claude-sonnet-4-0');

    assert.equal(toolTailMessages[1].role, 'tool');
    assert.equal(toolTailMessages[1].tool_call_id, 'call-1');

    const nonClaudeMessages = buildNativeMessages({
        messages: [
            { role: 'user', content: 'hello' },
            { role: 'system', content: 'tail marker' },
        ],
    }, 'gpt-4o-mini');

    assert.equal(nonClaudeMessages[1].role, 'system');
});

test('openai-compatible adapter removes tagged-json tool garbage from replay payload', () => {
    const messages = buildNativeMessages({
        messages: [
            {
                role: 'user',
                content: '继续。',
            },
            {
                role: 'assistant',
                content: '前置说明',
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '前置说明\n<tool_call>{"name":"Read","arguments":{"path":"book/state.md"}}</tool_call>\n闭合后的多余正文',
                        tool_calls: [{
                            id: 'call-1',
                            type: 'function',
                            function: {
                                name: 'Read',
                                arguments: '{"path":"book/state.md"}',
                            },
                        }],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-1',
                content: '{}',
            },
        ],
    }, 'compat-model');

    assert.equal(messages[1].content, '前置说明');
    assert.equal(messages[1].content.includes('tool_call'), false);
    assert.equal(messages[1].content.includes('闭合后的多余正文'), false);
});

test('openai-compatible adapter falls back to top-level tool calls when preserved payload has no tool calls', () => {
    const messages = buildNativeMessages({
        messages: [
            {
                role: 'user',
                content: '继续。',
            },
            {
                role: 'assistant',
                content: '我需要读文件。',
                tool_calls: [{
                    id: 'call-read',
                    type: 'function',
                    function: {
                        name: 'Read',
                        arguments: '{"filePath":"book/state.md"}',
                    },
                }],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '我需要读文件。',
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-read',
                content: '{}',
            },
        ],
    }, 'compat-model');

    assert.deepEqual(messages[1].tool_calls, [{
        id: 'call-read',
        type: 'function',
        function: {
            name: 'Read',
            arguments: '{"filePath":"book/state.md"}',
        },
    }]);
});

test('openai-compatible replay prefers repaired top-level tool arguments over raw preserved payload', () => {
    const repairedArguments = '{"filePath":"book/chapters/001.md","content":"她说：\\"回来。\\"\\n第二行"}';
    const rawBrokenArguments = '{"filePath":"book/chapters/001.md","content":"她说："回来。"\n第二行"}';
    const nativeMessages = buildNativeMessages({
        messages: [
            { role: 'user', content: '继续。' },
            {
                role: 'assistant',
                content: '',
                tool_calls: [{
                    id: 'call-write',
                    type: 'function',
                    function: {
                        name: 'Write',
                        arguments: repairedArguments,
                    },
                }],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '',
                        tool_calls: [{
                            id: 'call-write',
                            type: 'function',
                            function: {
                                name: 'Write',
                                arguments: rawBrokenArguments,
                            },
                        }],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-write',
                content: '{"ok":true}',
            },
        ],
    }, 'compat-model');

    assert.equal(nativeMessages[1].tool_calls[0].function.arguments, repairedArguments);

    const taggedMessages = buildTaggedMessages({
        systemPrompt: '你是测试助手。',
        tools: [{ function: { name: 'Write', description: 'Write file.', parameters: { type: 'object', properties: {} } } }],
        messages: nativeMessages,
    });
    const taggedAssistant = taggedMessages.find((message) => (
        message.role === 'assistant' && String(message.content || '').includes('<tool_call>')
    ));
    assert.match(taggedAssistant.content, /\\"回来。\\"/);
    assert.doesNotMatch(taggedAssistant.content, /她说："回来。"/);
});

test('openai-compatible tagged replay maps tool results from top-level tool calls without stale id bleed', () => {
    const messages = buildTaggedMessages({
        systemPrompt: '你是测试助手。',
        tools: [{
            function: {
                name: 'Read',
                description: 'Read file.',
                parameters: { type: 'object', properties: {} },
            },
        }],
        messages: [
            {
                role: 'user',
                content: '连续调用两个工具。',
            },
            {
                role: 'assistant',
                content: '先写。',
                tool_calls: [{
                    id: 'tool-call-1',
                    type: 'function',
                    function: {
                        name: 'Write',
                        arguments: '{"filePath":"book/chapters/001.md","content":"正文"}',
                    },
                }],
            },
            {
                role: 'tool',
                tool_call_id: 'tool-call-1',
                content: '{"ok":true,"summary":"已写入 book/chapters/001.md。"}',
            },
            {
                role: 'assistant',
                content: '再读。',
                tool_calls: [{
                    id: 'tool-call-1',
                    type: 'function',
                    function: {
                        name: 'Read',
                        arguments: '{"filePath":"book/chapters/001.md"}',
                    },
                }],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '再读。',
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'tool-call-1',
                content: '{"ok":true,"summary":"读取 book/chapters/001.md。"}',
            },
        ],
    });

    const toolResultMessages = messages.filter((message) => String(message.content || '').includes('<tool_result>'));
    assert.equal(toolResultMessages.length, 2);
    assert.match(toolResultMessages[0].content, /name: Write/);
    assert.match(toolResultMessages[1].content, /name: Read/);
    assert.doesNotMatch(toolResultMessages[1].content, /name: Write/);
    assert.match(toolResultMessages[1].content, /这是系统工具执行结果，不是用户新发言。/);
});

test('openai-compatible tagged replay uses preserved tool result names when call id mapping is unavailable', () => {
    const messages = buildTaggedMessages({
        systemPrompt: '你是测试助手。',
        tools: [{
            function: {
                name: 'Read',
                description: 'Read file.',
                parameters: { type: 'object', properties: {} },
            },
        }],
        messages: [
            { role: 'user', content: '继续。' },
            {
                role: 'tool',
                tool_call_id: 'call-read',
                toolName: 'Read',
                content: '{"ok":true,"summary":"读取 book/state.md。"}',
            },
        ],
    });

    const toolResult = messages.find((message) => String(message.content || '').includes('<tool_result>'));
    assert.match(toolResult.content, /name: Read/);
    assert.doesNotMatch(toolResult.content, /name: unknown_tool/);
});

test('openai-compatible native replay strips internal tool result names from provider payload', () => {
    const messages = buildNativeMessages({
        messages: [
            { role: 'user', content: '继续。' },
            {
                role: 'tool',
                tool_call_id: 'call-read',
                toolName: 'Read',
                content: '{}',
            },
        ],
    }, 'compat-model');

    assert.equal(messages[1].tool_call_id, 'call-read');
    assert.equal(Object.hasOwn(messages[1], 'toolName'), false);
});

test('openai-compatible adapter repairs malformed tagged-json Write arguments', () => {
    const calls = extractTaggedToolCalls([
        '<tool_call>{"name":"Write","arguments":{"filePath":"book/chapters/001.md","content":"她说："回来。"',
        '第二行"}} </tool_call>',
    ].join('\n'));

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'Write');
    const args = JSON.parse(calls[0].arguments);
    assert.deepEqual(args, {
        filePath: 'book/chapters/001.md',
        content: '她说："回来。"\n第二行',
    });
});

test('openai-compatible adapter repairs malformed tagged-json string arguments', () => {
    const calls = extractTaggedToolCalls(
        '<tool_call>{"name":"Write","arguments":"{\\"filePath\\":\\"book/notes/a.md\\",\\"content\\":\\"第一行\n第二行\\"}"}</tool_call>',
    );

    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'Write');
    const args = JSON.parse(calls[0].arguments);
    assert.deepEqual(args, {
        filePath: 'book/notes/a.md',
        content: '第一行\n第二行',
    });
});

test('openai-compatible adapter keeps incomplete tagged-json blocks out of tool calls', () => {
    const calls = extractTaggedToolCalls(
        '<tool_call>{"name":"Write","arguments":{"filePath":"book/chapters/001.md","content":"半截',
    );

    assert.deepEqual(calls, []);
});

test('openai-compatible adapter ignores a replay message with no valid tool calls', () => {
    const messages = buildNativeMessages({
        messages: [
            {
                role: 'user',
                content: '继续。',
            },
            {
                role: 'assistant',
                content: '我需要读文件。',
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '我需要读文件。',
                        tool_calls: [
                            null,
                            {
                                id: 'bad-call',
                                type: 'function',
                                function: null,
                            },
                        ],
                    },
                },
            },
        ],
    });

    assert.equal(Object.hasOwn(messages[1], 'tool_calls'), false);
});

test('openai-compatible adapter omits tool fields for pure text requests', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    let requestBody = null;
    adapter.client.chat.completions.create = async (body) => {
        requestBody = body;
        return {
            choices: [{
                finish_reason: 'stop',
                message: {
                    role: 'assistant',
                    content: '纯文本完成。',
                },
            }],
            model: 'compat-test',
        };
    };

    const result = await adapter.chat({
        messages: [{
            role: 'user',
            content: '只做总结，不要工具。',
        }],
        tools: [],
        toolChoice: 'none',
    });

    assert.equal(result.text, '纯文本完成。');
    assert.equal(Object.hasOwn(requestBody, 'tools'), false);
    assert.equal(Object.hasOwn(requestBody, 'tool_choice'), false);
});

test('openai-compatible adapter ignores malformed non-streaming native tool calls', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    adapter.client.chat.completions.create = async () => ({
        choices: [{
            finish_reason: 'tool_calls',
            message: {
                role: 'assistant',
                content: '我先读文件。',
                tool_calls: [
                    null,
                    {
                        id: 'bad-call',
                        type: 'function',
                        function: null,
                    },
                    {
                        id: 'call-1',
                        type: 'function',
                        function: {
                            name: 'Read',
                            arguments: { path: 'book/state.md' },
                        },
                    },
                ],
            },
        }],
        model: 'compat-test',
    });

    const result = await adapter.chat({
        messages: [{ role: 'user', content: '读一下状态。' }],
        tools: [{
            type: 'function',
            function: {
                name: 'Read',
                description: 'Read file.',
                parameters: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                    },
                },
            },
        }],
    });

    assert.deepEqual(result.toolCalls, [{
        id: 'call-1',
        name: 'Read',
        arguments: '{"path":"book/state.md"}',
    }]);
    assert.deepEqual(result.providerPayload.openaiCompatibleMessage.tool_calls, [{
        id: 'call-1',
        type: 'function',
        function: {
            name: 'Read',
            arguments: '{"path":"book/state.md"}',
        },
    }]);
});

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

test('openai-compatible adapter does not persist null function tool-call deltas', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
    });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([
        {
            model: 'compat-test',
            choices: [{
                index: 0,
                delta: {
                    role: 'assistant',
                    content: '我先读文件。',
                    tool_calls: [{
                        index: 0,
                        id: 'call-1',
                        type: 'function',
                        function: null,
                    }],
                },
                finish_reason: null,
            }],
        },
        {
            model: 'compat-test',
            choices: [{
                index: 0,
                delta: {
                    tool_calls: [{
                        index: 0,
                        function: {
                            name: 'Read',
                            arguments: '{"path":"book/state.md"}',
                        },
                    }],
                },
                finish_reason: 'tool_calls',
            }],
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '读一下状态。' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Read',
                    description: 'Read file.',
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

        assert.deepEqual(result.toolCalls, [{
            id: 'call-1',
            name: 'Read',
            arguments: '{"path":"book/state.md"}',
        }]);
        assert.deepEqual(result.providerPayload.openaiCompatibleMessage.tool_calls, [{
            id: 'call-1',
            type: 'function',
            function: {
                name: 'Read',
                arguments: '{"path":"book/state.md"}',
            },
        }]);
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

test('openai-compatible tagged-json streaming hides raw tool JSON and emits tool draft progress', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'compat-test',
        toolMode: 'tagged-json',
    });

    const chunks = [
        {
            model: 'compat-test',
            choices: [{
                index: 0,
                delta: { role: 'assistant', content: '我先查一下。' },
            }],
        },
        {
            model: 'compat-test',
            choices: [{
                index: 0,
                delta: { content: '\n<tool_call>{"name":"Read"' },
            }],
        },
        {
            model: 'compat-test',
            choices: [{
                index: 0,
                delta: { content: ',"arguments":{"path":"memory/state.md"}}</tool_call>' },
                finish_reason: 'stop',
            }],
        },
    ];
    const stream = {
        async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) {
                yield chunk;
            }
        },
        finalChatCompletion: async () => ({
            choices: [{
                message: {
                    role: 'assistant',
                    content: '我先查一下。\n<tool_call>{"name":"Read","arguments":{"path":"memory/state.md"}}</tool_call>',
                },
            }],
        }),
    };
    adapter.client.chat.completions.create = async () => stream;

    const progress = [];
    const result = await adapter.chat({
        messages: [{ role: 'user', content: '查状态' }],
        tools: [{
            function: {
                name: 'Read',
                description: 'Read memory.',
                parameters: { type: 'object', properties: { path: { type: 'string' } } },
            },
        }],
        onStreamProgress: (snapshot) => progress.push(snapshot),
    });

    assert.equal(progress.some((snapshot) => String(snapshot.text || '').includes('<tool_call>')), false);
    assert.equal(progress.some((snapshot) => snapshot.toolCallDraft === true), true);
    assert.equal(progress.some((snapshot) => snapshot.toolCalls?.[0]?.name === 'Read'), true);
    assert.equal(result.text, '我先查一下。');
    assert.equal(result.toolCalls?.[0]?.name, 'Read');
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
