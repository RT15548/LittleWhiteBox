import test from 'node:test';
import assert from 'node:assert/strict';

import {
    OpenAICompatibleAdapter,
    buildNativeMessages,
    buildTaggedMessages,
    extractTaggedToolCalls,
    stripTaggedToolCallsForDisplay,
} from '../../agent-core/adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { redactRequestSecrets } from '../../agent-core/adapters/request-inspection.js';
import { resolveRuntimeReasoning } from '../../agent-core/reasoning-capabilities.js';

test('tagged-json prompt honors required, named, and none tool choices', () => {
    const buildSystem = (toolChoice) => buildTaggedMessages({
        systemPrompt: '你是测试助手。',
        toolChoice,
        tools: [{
            type: 'function',
            function: {
                name: 'Read',
                description: 'Read file.',
                parameters: { type: 'object', properties: {} },
            },
        }],
        messages: [{ role: 'user', content: '执行任务。' }],
    })[0].content;

    assert.match(buildSystem('required'), /本轮必须调用工具，不得只返回正文。/);
    assert.match(buildSystem('Read'), /本轮必须调用工具 Read，不得调用其他工具，也不得只返回正文。/);
    assert.match(buildSystem('none'), /本轮不得调用工具，不得输出 <tool_call> 标签。/);
});

test('request inspection redacts credentials without hiding token limits', () => {
    assert.deepEqual(redactRequestSecrets({
        Authorization: 'Bearer secret',
        'x-csrf-token': 'csrf-secret',
        max_tokens: 32000,
        budget_tokens: 8192,
        nested: {
            api_key: 'api-secret',
            token_count: 123,
        },
    }), {
        Authorization: '[redacted]',
        'x-csrf-token': '[redacted]',
        max_tokens: 32000,
        budget_tokens: 8192,
        nested: {
            api_key: '[redacted]',
            token_count: 123,
        },
    });
});

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

test('openai-compatible unsigned GPT replay prefers repaired top-level tool arguments over raw preserved payload', () => {
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
                            index: 0,
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
    }, 'gpt-5');

    assert.deepEqual(nativeMessages[1].tool_calls, [{
        id: 'call-write',
        type: 'function',
        function: {
            name: 'Write',
            arguments: repairedArguments,
        },
    }]);

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

test('openai-compatible replay keeps Gemini signed tool calls exactly as preserved', () => {
    const signedArguments = '{"filePath":"book/state.md"}';
    const messages = buildNativeMessages({
        messages: [
            { role: 'user', content: '继续。' },
            {
                role: 'assistant',
                content: '',
                tool_calls: [{
                    id: 'call-read',
                    type: 'function',
                    function: {
                        name: 'Read',
                        // 上层重建的参数经过修复流程，字节可能与签名时不同，绝不能覆盖签名调用。
                        arguments: '{ "filePath": "book/state.md" }',
                    },
                }],
                providerPayload: {
                    openaiCompatibleMessage: {
                        role: 'assistant',
                        content: '',
                        tool_calls: [{
                            index: 0,
                            id: 'call-read',
                            type: 'function',
                            function: {
                                name: 'Read',
                                arguments: signedArguments,
                            },
                            extra_content: {
                                google: {
                                    thoughtSignature: 'gemini-signature',
                                },
                            },
                        }],
                    },
                },
            },
            {
                role: 'tool',
                tool_call_id: 'call-read',
                content: '{"ok":true}',
            },
        ],
    }, '[v]gemini-3.7-flash');

    assert.deepEqual(messages[1].tool_calls, [{
        id: 'call-read',
        type: 'function',
        function: {
            name: 'Read',
            arguments: signedArguments,
        },
        extra_content: {
            google: {
                thoughtSignature: 'gemini-signature',
            },
        },
    }]);
    assert.equal(messages[2].tool_call_id, 'call-read');
});

test('openai-compatible streaming derives tool calls and replay payload from one snapshot', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://signed-single-source.example/v1',
        model: 'gemini-3-pro',
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([
        {
            model: 'gemini-3-pro',
            choices: [{
                delta: {
                    tool_calls: [
                        {
                            index: 0,
                            id: 'call-a',
                            type: 'function',
                            function: { name: 'Read', arguments: '{"filePath":' },
                            extra_content: { google: { thought_signature: 'sig-a' } },
                        },
                        {
                            index: 1,
                            id: 'call-b',
                            type: 'function',
                            function: { name: 'Grep', arguments: '{"pattern":' },
                        },
                    ],
                },
            }],
        },
        {
            choices: [{
                delta: {
                    tool_calls: [
                        {
                            index: 0,
                            id: '',
                            function: { arguments: '"a.md"}' },
                            extra_content: { google: { thought_signature: '' } },
                        },
                        { index: 1, id: '', function: { arguments: '"todo"}' } },
                    ],
                },
                finish_reason: 'tool_calls',
            }],
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '并行读取。' }],
            tools: [{ function: { name: 'Read' } }, { function: { name: 'Grep' } }],
            onStreamProgress: () => {},
        });

        const preservedToolCalls = result.providerPayload.openaiCompatibleMessage.tool_calls;
        assert.equal(result.toolCalls.length, 2);
        assert.equal(preservedToolCalls.length, result.toolCalls.length);
        assert.deepEqual(
            result.toolCalls.map((item) => [item.id, item.name, item.arguments]),
            [
                ['call-a', 'Read', '{"filePath":"a.md"}'],
                ['call-b', 'Grep', '{"pattern":"todo"}'],
            ],
        );
        assert.deepEqual(
            preservedToolCalls.map((item) => [item.id, item.function.arguments]),
            result.toolCalls.map((item) => [item.id, item.arguments]),
        );
        assert.equal(preservedToolCalls[0].extra_content.google.thought_signature, 'sig-a');
        assert.equal(Object.hasOwn(preservedToolCalls[1], 'extra_content'), false);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('openai-compatible streaming rejects a truncated unsigned member of a signed parallel batch', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://signed-corrupted.example/v1',
        model: 'gemini-3-pro',
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([{
        model: 'gemini-3-pro',
        choices: [{
            delta: {
                tool_calls: [
                    {
                        index: 0,
                        id: 'call-read',
                        type: 'function',
                        function: { name: 'Read', arguments: '{"filePath":"state.md"}' },
                        extra_content: { google: { thought_signature: 'gemini-signature' } },
                    },
                    {
                        index: 1,
                        id: 'call-grep',
                        type: 'function',
                        function: { name: 'Grep', arguments: '{"pattern":' },
                    },
                ],
            },
            finish_reason: 'tool_calls',
        }],
    }]);

    try {
        // 签名调用必须原样回放：参数被截断时既不能改写也不能丢签名，只能终止本轮让上层重试。
        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: '读取状态。' }],
            tools: [{ function: { name: 'Read' } }, { function: { name: 'Grep' } }],
            onStreamProgress: () => {},
        }), /openai_compatible_signed_tool_call_corrupted/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('openai-compatible streaming validates signed arguments before replay normalization', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://signed-missing-arguments.example/v1',
        model: 'gemini-3-pro',
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createSseResponse([{
        model: 'gemini-3-pro',
        choices: [{
            delta: {
                tool_calls: [{
                    index: 0,
                    id: 'call-read',
                    type: 'function',
                    function: { name: 'Read' },
                    extra_content: { google: { thought_signature: 'gemini-signature' } },
                }],
            },
            finish_reason: 'tool_calls',
        }],
    }]);

    try {
        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: '读取状态。' }],
            tools: [{ function: { name: 'Read' } }],
            onStreamProgress: () => {},
        }), (error) => {
            assert.equal(error.message, 'openai_compatible_signed_tool_call_corrupted');
            assert.equal(error.reason, 'invalid_function_arguments');
            return true;
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
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

test('OpenAI Responses sends exact model effort, explicit off, and visible inherited output', () => {
    const adapter = new OpenAIResponsesAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-5.6',
    });
    const buildTask = (reasoning) => ({
        messages: [{ role: 'user', content: 'hello' }],
        reasoning: resolveRuntimeReasoning({
            provider: 'openai-responses',
            baseUrl: 'https://api.openai.com/v1',
            model: 'gpt-5.6',
        }, reasoning),
    });

    const visibleTask = buildTask({ mode: 'on', effort: 'max', output: 'show' });
    const visibleBody = adapter.buildRequestBody(visibleTask);
    assert.deepEqual(visibleBody.reasoning, { effort: 'max', summary: 'auto' });
    assert.deepEqual(visibleBody.include, ['reasoning.encrypted_content']);

    const hiddenTask = buildTask({ mode: 'on', effort: 'low', output: 'hide' });
    const hiddenBody = adapter.buildRequestBody(hiddenTask);
    assert.deepEqual(hiddenBody.reasoning, { effort: 'low' });
    assert.equal(Object.hasOwn(hiddenBody.reasoning, 'summary'), false);

    const offBody = adapter.buildRequestBody(buildTask({ mode: 'off', output: 'hide' }));
    assert.deepEqual(offBody.reasoning, { effort: 'none' });

    const inheritBody = adapter.buildRequestBody(buildTask({ mode: 'inherit', output: 'show' }));
    assert.deepEqual(inheritBody.reasoning, { summary: 'auto' });
    assert.deepEqual(inheritBody.include, ['reasoning.encrypted_content']);

    const effective = adapter.inspectRequest(visibleTask, { body: visibleBody }).effectiveConfig;
    assert.equal(effective.reasoningRequestedMode, 'on');
    assert.equal(effective.reasoningProfileId, 'openai-gpt-5.6');
    assert.equal(effective.reasoningEffectiveMode, 'on');
    assert.equal(effective.reasoningEffort, 'max');
    assert.equal(effective.reasoningOutputVisible, true);
});

test('OpenAI Responses uses one visible default for request, response, and diagnostics', async () => {
    const adapter = new OpenAIResponsesAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-5.6',
    });
    let requestBody;
    adapter.client.responses.create = async (body) => {
        requestBody = body;
        return {
            model: 'gpt-5.6',
            status: 'completed',
            output_text: '完成。',
            output: [{
                type: 'reasoning',
                content: [{ type: 'reasoning_text', text: '默认可见的推理。' }],
            }],
        };
    };

    const result = await adapter.chat({
        messages: [{ role: 'user', content: 'think' }],
        reasoning: { mode: 'on', effort: 'high' },
    });

    assert.deepEqual(requestBody.reasoning, { effort: 'high', summary: 'auto' });
    assert.deepEqual(result.thoughts, [{ label: '推理文本', text: '默认可见的推理。' }]);
    assert.equal(result.requestInspection.effectiveConfig.reasoningRequestedOutput, 'show');
    assert.equal(result.requestInspection.effectiveConfig.reasoningOutputVisible, true);

    const offTask = {
        messages: [{ role: 'user', content: 'do not think' }],
        reasoning: { mode: 'off', output: 'show' },
    };
    const offBody = adapter.buildRequestBody(offTask);
    const offInspection = adapter.inspectRequest(offTask, { body: offBody });
    assert.deepEqual(offBody.reasoning, { effort: 'none' });
    assert.equal(offInspection.effectiveConfig.reasoningRequestedOutput, 'show');
    assert.equal(offInspection.effectiveConfig.reasoningOutputVisible, false);
    const offResult = await adapter.chat(offTask);
    assert.deepEqual(offResult.thoughts, []);
});

test('OpenAI Responses strips SDK parsed projections before storing and replaying tool output', async () => {
    const adapter = new OpenAIResponsesAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-5.6',
    });
    const rawOutput = [{
        type: 'reasoning',
        id: 'reasoning-1',
        encrypted_content: 'encrypted-reasoning',
        summary: [],
    }, {
        type: 'message',
        id: 'message-1',
        role: 'assistant',
        status: 'completed',
        content: [{
            type: 'output_text',
            text: '先读取文件。',
            annotations: [],
            parsed: null,
        }],
    }, {
        type: 'function_call',
        id: 'function-call-item-1',
        call_id: 'call-1',
        name: 'Read',
        arguments: '{"filePath":"book/chapter.md"}',
        status: 'completed',
        parsed_arguments: { filePath: 'book/chapter.md' },
    }];
    adapter.client.responses.stream = () => ({
        on() {},
        finalResponse: async () => ({
            model: 'gpt-5.6',
            status: 'completed',
            output: rawOutput,
        }),
    });

    const firstResult = await adapter.chat({
        messages: [{ role: 'user', content: '读取章节。' }],
        tools: [{
            type: 'function',
            function: {
                name: 'Read',
                description: 'Read file.',
                parameters: { type: 'object', properties: {} },
            },
        }],
        onStreamProgress() {},
    });

    assert.equal(firstResult.providerPayload.openAIResponseOutput[1].content[0].parsed, undefined);
    assert.equal(firstResult.providerPayload.openAIResponseOutput[2].parsed_arguments, undefined);
    assert.equal(firstResult.providerPayload.openAIResponseOutput[0].encrypted_content, 'encrypted-reasoning');

    const replayBody = adapter.buildRequestBody({
        messages: [{ role: 'user', content: '读取章节。' }, {
            role: 'assistant',
            content: '先读取文件。',
            providerPayload: { openAIResponseOutput: rawOutput },
        }, {
            role: 'tool',
            tool_call_id: 'call-1',
            content: '{"ok":true,"content":"chapter"}',
        }],
    });

    assert.equal(replayBody.input[2].content[0].parsed, undefined);
    assert.equal(replayBody.input[3].parsed_arguments, undefined);
    assert.equal(replayBody.input[1].encrypted_content, 'encrypted-reasoning');
    assert.deepEqual(replayBody.input[4], {
        type: 'function_call_output',
        call_id: 'call-1',
        output: '{"ok":true,"content":"chapter"}',
    });
});

test('OpenAI Responses performs only one empty-response fallback and records both requests', async () => {
    const adapter = new OpenAIResponsesAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://responses-relay.example/v1',
        model: 'gpt-5.6',
    });
    const bodies = [];
    adapter.client.responses.create = async (body) => {
        bodies.push(body);
        return bodies.length === 1
            ? { model: 'gpt-5.6', status: 'completed', output: [] }
            : { model: 'gpt-5.6', status: 'completed', output: [], output_text: '' };
    };

    const result = await adapter.chat({
        systemPrompt: 'system rules',
        messages: [{ role: 'user', content: 'hello' }],
    });

    assert.equal(bodies.length, 2);
    assert.equal(bodies[0].instructions, 'system rules');
    assert.equal(Object.hasOwn(bodies[1], 'instructions'), true);
    assert.equal(bodies[1].instructions, undefined);
    assert.equal(result.requestInspection.requestCount, 2);
    assert.equal(result.requestInspection.fallbackCount, 1);
    assert.deepEqual(
        result.requestInspection.requests.map(request => request.reason),
        ['initial', 'empty_response'],
    );
});

test('OpenAI Responses performs at most one compatibility-error fallback', async () => {
    const adapter = new OpenAIResponsesAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://responses-relay.example/v1',
        model: 'gpt-5.6',
    });
    let requestCount = 0;
    adapter.client.responses.create = async () => {
        requestCount += 1;
        throw new Error('unsupported instructions');
    };

    await assert.rejects(() => adapter.chat({
        systemPrompt: 'system rules',
        messages: [{ role: 'user', content: 'hello' }],
    }), (error) => {
        assert.equal(requestCount, 2);
        assert.equal(error.requestInspection.requestCount, 2);
        assert.equal(error.requestInspection.fallbackCount, 1);
        assert.deepEqual(
            error.requestInspection.requests.map(request => request.reason),
            ['initial', 'legacy_system_error'],
        );
        return true;
    });
});

test('OpenAI Responses rejects Chat Completions and malformed response shapes without retrying', async () => {
    for (const response of [
        { choices: [{ message: { content: 'wrong endpoint' } }] },
        { output_text: 'missing output' },
        { output: {} },
    ]) {
        const adapter = new OpenAIResponsesAdapter({
            apiKey: 'test-key',
            baseUrl: 'https://responses-relay.example/v1',
            model: 'gpt-5.6',
        });
        let requestCount = 0;
        adapter.client.responses.create = async () => {
            requestCount += 1;
            return response;
        };

        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: 'hello' }],
        }), (error) => {
            assert.equal(error.code, 'OPENAI_RESPONSES_ENDPOINT_MISMATCH');
            assert.match(error.message, /不是 Responses API，请改用 OpenAI 兼容/);
            assert.equal(error.requestInspection.requestCount, 1);
            return true;
        });
        assert.equal(requestCount, 1);
    }
});

test('OpenAI-compatible OpenAI family requests use the latest max_completion_tokens field', () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const o1MiniBody = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'o1-mini',
    }).buildRequestBody({
        messages,
        maxTokens: 4096,
        reasoning: { mode: 'inherit', output: 'hide' },
    });
    assert.equal(o1MiniBody.max_completion_tokens, 4096);
    assert.equal(Object.hasOwn(o1MiniBody, 'max_tokens'), false);
    assert.equal(Object.hasOwn(o1MiniBody, 'reasoning_effort'), false);

    const regularBody = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
    }).buildRequestBody({
        messages,
        maxTokens: 4096,
    });
    assert.equal(regularBody.max_completion_tokens, 4096);
    assert.equal(Object.hasOwn(regularBody, 'max_tokens'), false);
});

test('OpenAI-compatible matches model families broadly and encodes their latest protocols', () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const kimiK3 = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k3',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'on', effort: 'max', output: 'hide' },
    });
    assert.equal(kimiK3.reasoning_effort, 'max');

    const kimiK3Off = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k3',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'off', output: 'hide' },
    });
    assert.equal(kimiK3Off.reasoning_effort, 'off');

    const kimiK25Off = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k2.5',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'off', output: 'hide' },
    });
    assert.equal(kimiK25Off.reasoning_effort, 'off');
    assert.equal(Object.hasOwn(kimiK25Off, 'thinking'), false);

    const kimiK26On = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k2.6',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'on', output: 'hide' },
    });
    assert.equal(kimiK26On.reasoning_effort, 'max');
    assert.equal(Object.hasOwn(kimiK26On, 'thinking'), false);

    const deepSeek = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://unrelated-relay.example/v1',
        model: 'relay/Experimental-DeepSeek-R1',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'on', effort: 'max', output: 'hide' },
    });
    assert.deepEqual(deepSeek.thinking, { type: 'enabled' });
    assert.equal(deepSeek.reasoning_effort, 'max');

    const deepSeekOff = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-reasoner',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'off', output: 'hide' },
    });
    assert.deepEqual(deepSeekOff.thinking, { type: 'disabled' });
    assert.equal(Object.hasOwn(deepSeekOff, 'reasoning_effort'), false);

    const gemini = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://unrelated-relay.example/v1',
        model: 'relay/Gemini-2.5-Pro',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'on', effort: 'high', output: 'hide' },
    });
    assert.equal(gemini.reasoning_effort, 'high');

    const claudeOff = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://unrelated-relay.example/v1',
        model: 'relay/Claude-Sonnet-4',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'off', output: 'hide' },
    });
    assert.equal(claudeOff.reasoning_effort, 'none');

    const qwen = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://unrelated-relay.example/v1',
        model: 'relay/Qwen3-Max',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'on', effort: 'high', output: 'hide' },
    });
    assert.equal(qwen.reasoning_effort, 'high');

    const kimiInherit = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.moonshot.ai/v1',
        model: 'kimi-k3',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'inherit', output: 'show' },
    });
    assert.equal(Object.hasOwn(kimiInherit, 'reasoning_effort'), false);
    assert.equal(Object.hasOwn(kimiInherit, 'thinking'), false);

    const custom = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/v1',
        model: 'TheBloke/Llama-2-7B-GPTQ',
    }).buildRequestBody({
        messages,
        tools: [{ type: 'function', function: { name: 'submit_scene_plan', parameters: {} } }],
        toolChoice: 'required',
        maxTokens: 2048,
        reasoning: { mode: 'on', effort: 'high', output: 'hide' },
    });
    assert.equal(custom.reasoning_effort, 'high');
    assert.equal(custom.tool_choice, 'required');
    assert.equal(custom.tools[0].function.name, 'submit_scene_plan');
    assert.equal(custom.max_tokens, 2048);
    assert.equal(Object.hasOwn(custom, 'max_completion_tokens'), false);

    const customOff = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/v1',
        model: 'another-private-alias',
    }).buildRequestBody({
        messages,
        reasoning: { mode: 'off', output: 'hide' },
    });
    assert.equal(customOff.reasoning_effort, 'none');
});

test('openai-compatible adapter does not retry ambiguous reasoning_effort errors', async () => {
    const config = {
        apiKey: 'test-key',
        baseUrl: 'https://reasoning-invalid-value.example/v1',
        model: 'gpt-5.6',
    };
    const adapter = new OpenAICompatibleAdapter(config);
    let requestCount = 0;
    adapter.client.chat.completions.create = async () => {
        requestCount += 1;
        const error = new Error('Unsupported value for reasoning_effort: high');
        error.status = 400;
        error.code = 'unsupported_value';
        error.param = 'reasoning_effort';
        throw error;
    };

    await assert.rejects(() => adapter.chat({
        messages: [{ role: 'user', content: 'hello' }],
        reasoning: { mode: 'on', effort: 'high', output: 'hide' },
    }), /Unsupported value for reasoning_effort/);
    assert.equal(requestCount, 1);
    assert.equal(new OpenAICompatibleAdapter(config).buildRequestBody({
        messages: [{ role: 'user', content: 'hello' }],
        reasoning: { mode: 'on', effort: 'low', output: 'hide' },
    }).reasoning_effort, 'low');
});

test('openai-compatible adapter never retries a native stream after the response is accepted', async () => {
    const config = {
        apiKey: 'test-key',
        baseUrl: 'https://reasoning-stream-late-error.example/v1',
        model: 'gpt-5.6',
    };
    const adapter = new OpenAICompatibleAdapter(config);
    const originalFetch = globalThis.fetch;
    const progress = [];
    let requestCount = 0;
    const eventChunk = new TextEncoder().encode(`data: ${JSON.stringify({
        model: config.model,
        choices: [{
            index: 0,
            delta: { role: 'assistant', content: 'partial' },
            finish_reason: null,
        }],
    })}\n\n`);
    const lateError = new Error('Unknown parameter: reasoning_effort');
    lateError.status = 400;
    globalThis.fetch = async () => {
        requestCount += 1;
        let readCount = 0;
        return {
            ok: true,
            status: 200,
            body: {
                getReader: () => ({
                    read: async () => {
                        readCount += 1;
                        if (readCount === 1) {
                            return { done: false, value: eventChunk };
                        }
                        throw lateError;
                    },
                }),
            },
        };
    };

    try {
        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: 'hello' }],
            reasoning: { mode: 'on', effort: 'high', output: 'hide' },
            onStreamProgress: (snapshot) => progress.push(snapshot.text),
        }), /Unknown parameter: reasoning_effort/);

        assert.equal(requestCount, 1);
        assert.deepEqual(progress, ['partial']);
        assert.equal(new OpenAICompatibleAdapter(config).buildRequestBody({
            messages: [{ role: 'user', content: 'hello' }],
            reasoning: { mode: 'on', effort: 'low', output: 'hide' },
        }).reasoning_effort, 'low');
    } finally {
        globalThis.fetch = originalFetch;
    }
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
        model: 'deepseek-reasoner',
    });

    const originalFetch = globalThis.fetch;
    const requests = [];
    const progress = [];
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
                        extra_content: {
                            google: {
                                thoughtSignature: 'stream-signature',
                            },
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
                mode: 'on',
                effort: 'high',
            },
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.equal(requests.length, 1);
        assert.equal(requests[0].body.stream, true);
        assert.equal(result.text, '我先读取技能目录。');
        assert.equal(progress.some((snapshot) => snapshot.thoughts?.[0]?.text === '先确认可用技能，再决定下一步。'), true);
        assert.deepEqual(result.thoughts, [{ label: '推理文本', text: '先确认可用技能，再决定下一步。' }]);
        assert.equal(result.requestInspection.effectiveConfig.reasoningRequestedOutput, 'show');
        assert.equal(result.requestInspection.effectiveConfig.reasoningOutputVisible, true);
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
                    extra_content: {
                        google: {
                            thoughtSignature: 'stream-signature',
                        },
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
            mode: 'on',
            effort: 'high',
        },
    });

    assert.equal(receivedBody.messages[1].reasoning_content, '');
});

test('openai-compatible adapter keeps streamed reasoning_content when later chunks send null', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'deepseek-reasoner',
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
                mode: 'on',
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

test('openai-compatible hidden reasoning never leaks through stream progress but remains replayable', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://api.deepseek.com/v1',
        model: 'deepseek-reasoner',
    });
    const originalFetch = globalThis.fetch;
    const progress = [];
    globalThis.fetch = async () => createSseResponse([{
        model: 'deepseek-reasoner',
        choices: [{
            index: 0,
            delta: {
                role: 'assistant',
                content: '完成。',
                reasoning_content: '不应展示的内部思考',
            },
            finish_reason: 'stop',
        }],
    }]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '回答。' }],
            reasoning: { mode: 'on', effort: 'high', output: 'hide' },
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.equal(progress.length > 0, true);
        assert.equal(progress.every((snapshot) => snapshot.thoughts?.length === 0), true);
        assert.deepEqual(result.thoughts, []);
        assert.equal(
            result.providerPayload.openaiCompatibleMessage.reasoning_content,
            '不应展示的内部思考',
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});
