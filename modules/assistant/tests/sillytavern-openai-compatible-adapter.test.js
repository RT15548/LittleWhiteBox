import test from 'node:test';
import assert from 'node:assert/strict';

import { SillyTavernClaudeAdapter, HOST_CLAUDE_FORCED_TOOL_REASONING_NOTICE } from '../../agent-core/adapters/sillytavern-claude.js';
import { SillyTavernGoogleAdapter } from '../../agent-core/adapters/sillytavern-google.js';
import { SillyTavernOpenAICompatibleAdapter } from '../../agent-core/adapters/sillytavern-openai-compatible.js';
import { normalizeAnthropicSdkBaseUrl } from '../../agent-core/adapters/anthropic.js';
import {
    HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT,
    HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT,
    buildHostClaudeGeneratePayload,
    buildHostChatCompletionsStatusPayload,
    buildHostGoogleGeneratePayload,
    buildHostOpenAICompatibleGeneratePayload,
    buildHostOpenAICompatibleStatusPayload,
    createHostChatCompletion,
    fetchHostChatCompletionsModels,
    fetchHostOpenAICompatibleModels,
    setHostChatCompletionsRequestHeadersProvider,
    streamHostChatCompletion,
} from '../../../shared/host-llm/chat-completions/client.js';
import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { resolveResultToolCalls } from '../../agent-core/runtime/protocol.js';
import { pullModelsForProvider } from '../../agent-core/ui/settings-panel.js';
import { buildNativeMessages } from '../../agent-core/adapters/openai-compatible.js';

test('SillyTavern hosted Claude and Google always include and deduplicate systemPrompt', () => {
    for (const Adapter of [SillyTavernClaudeAdapter, SillyTavernGoogleAdapter]) {
        const adapter = new Adapter({ model: 'hosted-model' });
        assert.deepEqual(adapter.buildMessages({
            systemPrompt: 'Shared system prompt',
            messages: [{ role: 'user', content: 'hello' }],
        }).slice(0, 2), [
            { role: 'system', content: 'Shared system prompt' },
            { role: 'user', content: 'hello' },
        ]);
        assert.deepEqual(adapter.buildMessages({
            systemPrompt: 'Shared system prompt',
            messages: [
                { role: 'system', content: 'Shared system prompt' },
                { role: 'user', content: 'hello' },
            ],
        }).filter((message) => message.role === 'system'), [
            { role: 'system', content: 'Shared system prompt' },
        ]);
        assert.deepEqual(adapter.buildMessages({
            systemPrompt: 'Shared system prompt',
            messages: [
                { role: 'system', content: 'Different system prompt' },
                { role: 'user', content: 'hello' },
            ],
        }).slice(0, 2), [
            { role: 'system', content: 'Shared system prompt' },
            { role: 'system', content: 'Different system prompt' },
        ]);
    }
});

test('hosted Claude translates required toolChoice to Anthropic any and guards manual thinking', () => {
    const tools = [{ type: 'function', function: { name: 'submit_scene_plan', parameters: {} } }];
    const baseTask = {
        systemPrompt: 'Scene Planner',
        messages: [{ role: 'user', content: 'plan' }],
        tools,
        toolChoice: 'required',
        temperature: 0.5,
        maxTokens: 4096,
    };

    // Anthropic vocabulary is produced at this adapter boundary only.
    assert.equal(
        new SillyTavernClaudeAdapter({ model: 'claude-sonnet-4-5' }).buildPayload(baseTask).tool_choice,
        'any',
    );
    assert.equal(
        new SillyTavernClaudeAdapter({ model: 'claude-sonnet-4-5' })
            .buildPayload({ ...baseTask, toolChoice: 'none' }).tool_choice,
        'none',
    );
    assert.equal(
        new SillyTavernClaudeAdapter({ model: 'claude-sonnet-4-5' })
            .buildPayload({ ...baseTask, toolChoice: 'auto' }).tool_choice,
        'auto',
    );
    assert.equal(
        new SillyTavernClaudeAdapter({ model: 'claude-sonnet-4-5' })
            .buildPayload({ ...baseTask, tools: [], toolChoice: 'required' }).tool_choice,
        undefined,
    );
    for (const toolChoice of ['tool', 'any', 'submit_scene_plan']) {
        assert.throws(
            () => new SillyTavernClaudeAdapter({ model: 'claude-sonnet-4-5' })
                .buildPayload({ ...baseTask, toolChoice }),
            /仅支持 auto\/required\/none/,
        );
    }

    // Google keeps receiving the generic value; the shared host helper is untouched.
    assert.equal(
        new SillyTavernGoogleAdapter({ model: 'gemini-2.5-pro' }).buildPayload(baseTask).tool_choice,
        'required',
    );

    const reasoningTask = {
        ...baseTask,
        reasoning: { mode: 'on', effort: 'high', output: 'show' },
    };
    // Manual (budgeted) thinking conflicts with a forced tool; the tool contract wins.
    const manual = new SillyTavernClaudeAdapter({ model: 'claude-sonnet-4-5' });
    const manualProtocol = manual.resolveToolProtocol(reasoningTask);
    assert.equal(manualProtocol.reasoningDisabledForForcedTool, true);
    assert.equal(manual.buildPayload(reasoningTask).reasoning_effort, 'auto');
    assert.equal(manual.buildPayload(reasoningTask).temperature, 0.5);
    const manualInspection = manual.buildRequestInspection({ url: '/x' }, manualProtocol, reasoningTask);
    assert.deepEqual(
        manualInspection.notices,
        [HOST_CLAUDE_FORCED_TOOL_REASONING_NOTICE],
    );
    assert.deepEqual(manualInspection.effectiveConfig, {
        toolChoice: 'any',
        reasoningRequestedMode: 'on',
        reasoningRequestedOutput: 'show',
        reasoningProfileId: 'sillytavern-claude-manual',
        reasoningEffectiveMode: 'off',
        reasoningEffort: '',
        reasoningBudgetTokens: null,
        reasoningControlFields: {},
        reasoningOutputVisible: false,
    });
    // Claude 4.6 adaptive thinking depends on host config the client cannot observe.
    assert.equal(
        new SillyTavernClaudeAdapter({ model: 'claude-opus-4-6' })
            .resolveToolProtocol(reasoningTask).reasoningDisabledForForcedTool,
        true,
    );

    // Confirmed adaptive thinking supports forced tool use, so reasoning is preserved.
    const adaptive = new SillyTavernClaudeAdapter({ model: 'claude-opus-4-7' });
    assert.equal(adaptive.resolveToolProtocol(reasoningTask).reasoningDisabledForForcedTool, false);
    assert.equal(adaptive.buildPayload(reasoningTask).reasoning_effort, 'high');
    const adaptiveInspection = adaptive.buildRequestInspection(
        { url: '/x' },
        adaptive.resolveToolProtocol(reasoningTask),
        reasoningTask,
    );
    assert.equal(adaptiveInspection.notices, undefined);
    assert.deepEqual(adaptiveInspection.effectiveConfig, {
        toolChoice: 'any',
        reasoningRequestedMode: 'on',
        reasoningRequestedOutput: 'show',
        reasoningProfileId: 'sillytavern-claude-adaptive',
        reasoningEffectiveMode: 'on',
        reasoningEffort: 'high',
        reasoningBudgetTokens: null,
        reasoningControlFields: {},
        reasoningOutputVisible: true,
    });
    // A non-forced tool choice never touches reasoning.
    assert.equal(
        manual.resolveToolProtocol({ ...reasoningTask, toolChoice: 'auto' }).reasoningDisabledForForcedTool,
        false,
    );
});

test('hosted adapters encode inherit, on, and off at their own protocol boundary', () => {
    const messages = [{ role: 'user', content: 'hello' }];
    const claude = new SillyTavernClaudeAdapter({ model: 'claude-opus-4-7' });
    const claudeInherit = claude.buildPayload({
        messages,
        reasoning: { mode: 'inherit', output: 'show' },
    });
    assert.equal(Object.hasOwn(claudeInherit, 'reasoning_effort'), false);
    assert.equal(Object.hasOwn(claudeInherit, 'include_reasoning'), false);
    const claudeOn = claude.buildPayload({
        messages,
        reasoning: { mode: 'on', effort: 'max', output: 'hide' },
    });
    assert.equal(claudeOn.reasoning_effort, 'max');
    assert.equal(claudeOn.include_reasoning, false);
    assert.equal(claude.buildPayload({
        messages,
        reasoning: { mode: 'off', output: 'show' },
    }).reasoning_effort, 'auto');

    const google = new SillyTavernGoogleAdapter({ model: 'gemini-2.5-flash' });
    const googleInherit = google.buildPayload({
        messages,
        reasoning: { mode: 'inherit', output: 'show' },
    });
    assert.equal(Object.hasOwn(googleInherit, 'reasoning_effort'), false);
    assert.equal(Object.hasOwn(googleInherit, 'include_reasoning'), false);
    const googleOn = google.buildPayload({
        messages,
        reasoning: { mode: 'on', effort: 'max', output: 'show' },
    });
    assert.equal(googleOn.reasoning_effort, 'max');
    assert.equal(googleOn.include_reasoning, true);
    assert.deepEqual(
        {
            reasoning_effort: google.buildPayload({
                messages,
                reasoning: { mode: 'off', output: 'show' },
            }).reasoning_effort,
            include_reasoning: google.buildPayload({
                messages,
                reasoning: { mode: 'off', output: 'show' },
            }).include_reasoning,
        },
        { reasoning_effort: 'min', include_reasoning: false },
    );

    const openai = new SillyTavernOpenAICompatibleAdapter({ model: 'gpt-5.2' });
    const openaiInherit = openai.buildPayload({
        messages,
        reasoning: { mode: 'inherit', output: 'show' },
    });
    assert.equal(Object.hasOwn(openaiInherit, 'reasoning_effort'), false);
    assert.equal(openai.buildPayload({
        messages,
        reasoning: { mode: 'on', effort: 'xhigh', output: 'hide' },
    }).reasoning_effort, 'xhigh');
    assert.equal(openai.buildPayload({
        messages,
        reasoning: { mode: 'off', output: 'hide' },
    }).reasoning_effort, 'none');
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
        status: 200,
        body: stream,
        text: async () => payload,
    };
}

function createJsonResponse(data, ok = true, status = 200) {
    return {
        ok,
        status,
        text: async () => JSON.stringify(data),
    };
}

test('host OpenAI-compatible payloads use SillyTavern backend fields without leaking direct-provider shape', () => {
    assert.deepEqual(buildHostOpenAICompatibleStatusPayload({
        baseUrl: 'https://example.com/v1/',
        apiKey: 'test-key',
    }), {
        chat_completion_source: 'openai',
        reverse_proxy: 'https://example.com/v1',
        proxy_password: 'test-key',
    });

    const payload = buildHostOpenAICompatibleGeneratePayload(
        {
            baseUrl: 'https://example.com/v1/',
            apiKey: 'test-key',
            model: 'compat-model',
        },
        {
            maxTokens: 1234,
            temperature: 0.7,
            reasoning: { mode: 'on', effort: 'high', output: 'hide' },
            tools: [{
                type: 'function',
                function: {
                    name: 'Read',
                    parameters: { type: 'object', properties: {} },
                },
            }],
        },
        [{ role: 'user', content: 'hello' }],
        true,
    );

    assert.equal(payload.chat_completion_source, 'openai');
    assert.equal(payload.reverse_proxy, 'https://example.com/v1');
    assert.equal(payload.proxy_password, 'test-key');
    assert.equal(payload.model, 'compat-model');
    assert.equal(payload.stream, true);
    assert.equal(payload.max_tokens, 1234);
    assert.equal(Object.hasOwn(payload, 'reasoning_effort'), false);
    assert.equal(payload.temperature, 0.7);
    assert.equal(payload.tool_choice, 'auto');
    assert.equal(payload.tools.length, 1);
});

test('OpenAI-compatible native messages keep task system prompt in the actual request', async () => {
    const messages = buildNativeMessages({
        systemPrompt: 'You are the background manager.',
        messages: [{ role: 'user', content: 'hello' }],
    });
    assert.deepEqual(messages.slice(0, 2), [
        { role: 'system', content: 'You are the background manager.' },
        { role: 'user', content: 'hello' },
    ]);

    const adapter = new SillyTavernOpenAICompatibleAdapter({
        model: 'compat-model',
        toolMode: 'native',
    });
    const inspection = await adapter.inspectRequest({
        systemPrompt: 'You are the background manager.',
        messages: [{ role: 'user', content: 'hello' }],
    });
    assert.equal(inspection.request.body.messages[0]?.role, 'system');
    assert.equal(inspection.request.body.messages[0]?.content, 'You are the background manager.');
});

test('SillyTavern OpenAI-compatible never deletes a rejected reasoning field and retries silently', async () => {
    const config = {
        baseUrl: 'https://reasoning-rejection.example/v1',
        apiKey: 'test-key',
        model: 'gpt-5.5',
        toolMode: 'native',
    };
    const adapter = new SillyTavernOpenAICompatibleAdapter(config);
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (_url, options = {}) => {
        requests.push(JSON.parse(String(options.body || '{}')));
        return createJsonResponse({
            error: {
                code: 400,
                message: 'Invalid value for reasoning_effort.',
            },
        }, false, 400);
    };

    try {
        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: 'hello' }],
            reasoning: { mode: 'on', effort: 'high', output: 'hide' },
        }), /Invalid value for reasoning_effort/);

        assert.equal(requests.length, 1);
        assert.equal(requests[0].reasoning_effort, 'high');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('SillyTavern OpenAI-compatible never retries a reasoning stream after accepting it', async () => {
    const config = {
        baseUrl: 'https://reasoning-stream-late-error.example/v1',
        apiKey: 'test-key',
        model: 'gpt-5.5',
        toolMode: 'native',
    };
    const adapter = new SillyTavernOpenAICompatibleAdapter(config);
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
        assert.equal(adapter.buildPayload({
            messages: [{ role: 'user', content: 'hello' }],
            reasoning: { mode: 'on', effort: 'low', output: 'hide' },
        }).reasoning_effort, 'low');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('SillyTavern OpenAI-compatible hidden reasoning stays out of stream progress and remains replayable', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: 'https://reasoning.example/v1',
        apiKey: 'test-key',
        model: 'gpt-5.5',
        toolMode: 'native',
    });
    const originalFetch = globalThis.fetch;
    const progress = [];
    globalThis.fetch = async () => createSseResponse([{
        model: 'gpt-5.5',
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

test('SillyTavern OpenAI-compatible replay skips a corrupted signed tool exchange atomically', () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: 'https://example.com/v1',
        apiKey: 'test-key',
        model: '[v]gemini-3.7-flash',
        toolMode: 'native',
    });
    const task = {
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
                        arguments: '{"filePath":"book/state.md"}',
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
                                arguments: '{"filePath":',
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
            { role: 'assistant', content: '读取完成。' },
            { role: 'user', content: '开始下一轮。' },
        ],
        tools: [],
    };
    const originalWarn = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args);
    try {
        const payload = adapter.buildPayload(task);
        const repeatedPayload = adapter.buildPayload(task);

        assert.deepEqual(payload.messages, [
            { role: 'user', content: '继续。' },
            { role: 'assistant', content: '读取完成。' },
            { role: 'user', content: '开始下一轮。' },
        ]);
        assert.deepEqual(repeatedPayload.messages, payload.messages);
        assert.equal(warnings.length, 1);
        assert.equal(warnings[0][1].code, 'openai_compatible_signed_tool_call_history_corrupted');
    } finally {
        console.warn = originalWarn;
    }
});

test('SillyTavern OpenAI-compatible keeps parallel id-less signed calls paired with tool results', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: 'https://example.com/v1',
        apiKey: 'test-key',
        model: '[v]gemini-3.7-flash',
        toolMode: 'native',
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createJsonResponse({
        model: '[v]gemini-3.7-flash',
        choices: [{
            finish_reason: 'tool_calls',
            message: {
                role: 'assistant',
                content: '',
                tool_calls: [
                    {
                        type: 'function',
                        function: { name: 'Read', arguments: '{"filePath":"a.md"}' },
                        extra_content: {
                            google: { thoughtSignature: 'gemini-signature' },
                        },
                    },
                    {
                        type: 'function',
                        function: { name: 'Read', arguments: '{"filePath":"b.md"}' },
                    },
                ],
            },
        }],
    });

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '并行读取。' }],
            tools: [],
        });
        const providerToolCalls = result.providerPayload.openaiCompatibleMessage.tool_calls;

        assert.deepEqual(result.toolCalls.map((toolCall) => toolCall.id), [
            'openai-tool-1',
            'openai-tool-2',
        ]);
        assert.deepEqual(providerToolCalls.map((toolCall) => toolCall.id), [
            'openai-tool-1',
            'openai-tool-2',
        ]);

        const payload = adapter.buildPayload({
            messages: [
                { role: 'user', content: '并行读取。' },
                {
                    role: 'assistant',
                    content: '',
                    providerPayload: result.providerPayload,
                    tool_calls: result.toolCalls.map((toolCall) => ({
                        id: toolCall.id,
                        type: 'function',
                        function: {
                            name: toolCall.name,
                            arguments: toolCall.arguments,
                        },
                    })),
                },
                { role: 'tool', tool_call_id: result.toolCalls[0].id, content: '{"ok":true}' },
                { role: 'tool', tool_call_id: result.toolCalls[1].id, content: '{"ok":true}' },
            ],
            tools: [],
        });

        assert.deepEqual(payload.messages[1].tool_calls.map((toolCall) => toolCall.id), [
            'openai-tool-1',
            'openai-tool-2',
        ]);
        assert.deepEqual(payload.messages.slice(2).map((message) => message.tool_call_id), [
            'openai-tool-1',
            'openai-tool-2',
        ]);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('SillyTavern OpenAI-compatible Claude-like requests coerce the final system role only in the request messages', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        model: 'anthropic/claude-sonnet-4-6',
        toolMode: 'native',
    });
    const inspection = await adapter.inspectRequest({
        messages: [
            { role: 'system', content: '<meta_protocol>' },
            { role: 'assistant', content: '历史 AI' },
            { role: 'system', content: '跑团协议' },
            { role: 'user', content: '继续' },
            { role: 'system', content: '</meta_protocol>' },
        ],
        tools: [{
            type: 'function',
            function: {
                name: 'ActionCheck',
                parameters: { type: 'object', properties: {} },
            },
        }],
    });
    const messages = inspection.request.body.messages;

    assert.deepEqual(messages.map((message) => message.role), [
        'system',
        'assistant',
        'system',
        'user',
        'user',
    ]);
    assert.equal(messages[4].content, '</meta_protocol>');
    assert.equal(inspection.request.body.tools[0].function.name, 'ActionCheck');
});

test('host Claude and Google payloads select the matching SillyTavern chat-completions source', () => {
    const claudePayload = buildHostClaudeGeneratePayload(
        {
            baseUrl: 'https://claude-proxy.example/v1/',
            apiKey: 'claude-key',
            model: 'claude-sonnet-4-0',
        },
        {
            maxTokens: 32000,
            temperature: 0.4,
            reasoning: { mode: 'on', effort: 'medium', output: 'hide' },
            tools: [{
                type: 'function',
                function: {
                    name: 'Read',
                    parameters: { type: 'object', properties: {} },
                },
            }],
        },
        [{ role: 'user', content: 'hello' }],
        true,
    );
    const googlePayload = buildHostGoogleGeneratePayload(
        {
            baseUrl: 'https://google-proxy.example/',
            apiKey: 'google-key',
            model: 'gemini-2.5-pro',
        },
        {
            temperature: 0.3,
            tools: [{
                type: 'function',
                function: {
                    name: 'Write',
                    parameters: { type: 'object', properties: {} },
                },
            }],
        },
        [{ role: 'user', content: 'hello' }],
        false,
    );

    assert.equal(claudePayload.chat_completion_source, 'claude');
    assert.equal(claudePayload.reverse_proxy, 'https://claude-proxy.example/v1');
    assert.equal(claudePayload.proxy_password, 'claude-key');
    assert.equal(claudePayload.use_sysprompt, true);
    assert.equal(Object.hasOwn(claudePayload, 'reasoning_effort'), false);
    assert.equal(Object.hasOwn(claudePayload, 'include_reasoning'), false);
    assert.equal(claudePayload.tool_choice, 'auto');
    assert.equal(googlePayload.chat_completion_source, 'makersuite');
    assert.equal(googlePayload.reverse_proxy, 'https://google-proxy.example');
    assert.equal(googlePayload.proxy_password, 'google-key');
    assert.equal(googlePayload.use_sysprompt, true);
    assert.equal(googlePayload.tool_choice, 'auto');

    const googleReasoningPayload = new SillyTavernGoogleAdapter({ model: 'gemini-3-pro' })
        .buildPayload({
            messages: [{ role: 'user', content: 'hello' }],
            reasoning: { mode: 'on', effort: 'high', output: 'hide' },
        });
    assert.equal(googleReasoningPayload.reasoning_effort, 'high');
    assert.equal(googleReasoningPayload.include_reasoning, false);
});

test('direct Anthropic adapter strips v1 because the SDK appends it itself', () => {
    assert.equal(normalizeAnthropicSdkBaseUrl(''), 'https://api.anthropic.com');
    assert.equal(normalizeAnthropicSdkBaseUrl('https://api.anthropic.com/v1/'), 'https://api.anthropic.com');
    assert.equal(normalizeAnthropicSdkBaseUrl('https://proxy.example/anthropic/v1'), 'https://proxy.example/anthropic');
});

test('host Claude payload adds v1 because SillyTavern appends messages itself', () => {
    const claudePayload = buildHostClaudeGeneratePayload(
        {
            baseUrl: 'https://beta.smolproxy.org/deepseek/anthropic',
            apiKey: 'proxy-key',
            model: 'deepseek-v4-pro',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );

    assert.equal(claudePayload.chat_completion_source, 'claude');
    assert.equal(claudePayload.reverse_proxy, 'https://beta.smolproxy.org/deepseek/anthropic/v1');
    assert.equal(claudePayload.proxy_password, 'proxy-key');
});

test('host Claude payload keeps explicit API versions instead of duplicating v1', () => {
    const v1Payload = buildHostClaudeGeneratePayload(
        {
            baseUrl: 'https://beta.smolproxy.org/deepseek/anthropic/v1',
            apiKey: 'proxy-key',
            model: 'deepseek-v4-pro',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );
    const v3Payload = buildHostClaudeGeneratePayload(
        {
            baseUrl: 'https://proxy.example/anthropic/v3',
            apiKey: 'proxy-key',
            model: 'custom-anthropic-model',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );

    assert.equal(v1Payload.reverse_proxy, 'https://beta.smolproxy.org/deepseek/anthropic/v1');
    assert.equal(v3Payload.reverse_proxy, 'https://proxy.example/anthropic/v3');
});

test('host Claude and Google payloads use LittleWhiteBox keys when Base URL is blank', () => {
    const claudePayload = buildHostClaudeGeneratePayload(
        {
            baseUrl: '',
            apiKey: 'claude-key',
            model: 'claude-sonnet-4-0',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );
    const googlePayload = buildHostGoogleGeneratePayload(
        {
            baseUrl: '',
            apiKey: 'google-key',
            model: 'gemini-2.5-pro',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );

    assert.equal(claudePayload.chat_completion_source, 'claude');
    assert.equal(claudePayload.reverse_proxy, 'https://api.anthropic.com/v1');
    assert.equal(claudePayload.proxy_password, 'claude-key');
    assert.equal(googlePayload.chat_completion_source, 'makersuite');
    assert.equal(googlePayload.reverse_proxy, 'https://generativelanguage.googleapis.com');
    assert.equal(googlePayload.proxy_password, 'google-key');
});

test('host Google payload strips API version from reverse proxy before calling SillyTavern', () => {
    const googlePayload = buildHostGoogleGeneratePayload(
        {
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta/',
            apiKey: 'google-key',
            model: 'gemini-2.5-pro',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );

    assert.equal(googlePayload.chat_completion_source, 'makersuite');
    assert.equal(googlePayload.reverse_proxy, 'https://generativelanguage.googleapis.com');
    assert.equal(googlePayload.proxy_password, 'google-key');
});

test('host Google payload strips nonstandard API versions before calling SillyTavern', () => {
    const googlePayload = buildHostGoogleGeneratePayload(
        {
            baseUrl: 'https://generativelanguage.googleapis.com/v3/',
            apiKey: 'google-key',
            model: 'gemini-2.5-pro',
        },
        {},
        [{ role: 'user', content: 'hello' }],
        false,
    );

    assert.equal(googlePayload.chat_completion_source, 'makersuite');
    assert.equal(googlePayload.reverse_proxy, 'https://generativelanguage.googleapis.com');
    assert.equal(googlePayload.proxy_password, 'google-key');
});

test('host Google status payload strips API version from reverse proxy before calling SillyTavern', () => {
    assert.deepEqual(buildHostChatCompletionsStatusPayload({
        baseUrl: 'https://generativelanguage.googleapis.com/v1/',
        apiKey: 'google-key',
    }, 'makersuite'), {
        chat_completion_source: 'makersuite',
        reverse_proxy: 'https://generativelanguage.googleapis.com',
        proxy_password: 'google-key',
    });
});

test('sillytavern Claude adapter streams tool calls through host generate endpoint', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-sonnet-4-0',
    });
    const originalFetch = globalThis.fetch;
    const requests = [];
    const progress = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createSseResponse([
            {
                type: 'message_start',
                message: { model: 'claude-sonnet-4-0' },
            },
            {
                type: 'content_block_start',
                index: 0,
                content_block: { type: 'text', text: '' },
            },
            {
                type: 'content_block_delta',
                index: 0,
                delta: { type: 'text_delta', text: '我先读取文件。' },
            },
            {
                type: 'content_block_start',
                index: 1,
                content_block: { type: 'tool_use', id: 'toolu_1', name: 'Read', input: {} },
            },
            {
                type: 'content_block_delta',
                index: 1,
                delta: { type: 'input_json_delta', partial_json: '{"filePath":"book/outline.md"}' },
            },
            {
                type: 'message_delta',
                delta: { stop_reason: 'tool_use' },
            },
        ]);
    };

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '读大纲' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Read',
                    description: 'Read file.',
                    parameters: { type: 'object', properties: { filePath: { type: 'string' } } },
                },
            }],
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.equal(requests[0].url, HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT);
        assert.equal(requests[0].body.chat_completion_source, 'claude');
        assert.equal(requests[0].body.stream, true);
        assert.equal(requests[0].body.use_sysprompt, true);
        assert.equal(result.text, '我先读取文件。');
        assert.deepEqual(result.toolCalls, [{
            id: 'toolu_1',
            name: 'Read',
            arguments: '{"filePath":"book/outline.md"}',
        }]);
        assert.equal(result.provider, 'sillytavern-claude');
        assert.equal(result.providerPayload.anthropicContent[1].type, 'tool_use');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Claude hides thinking output without dropping its replay signature', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-opus-4-7',
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createJsonResponse({
        content: [
            {
                type: 'thinking',
                thinking: '不应展示的内部思考。',
                signature: 'anthropic-signature-1',
            },
            { type: 'text', text: '可见答复。' },
        ],
        stop_reason: 'end_turn',
        model: 'claude-opus-4-7',
    });

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '继续' }],
            reasoning: { mode: 'on', effort: 'high', output: 'hide' },
        });

        assert.equal(result.text, '可见答复。');
        assert.deepEqual(result.thoughts, []);
        assert.deepEqual(result.providerPayload?.anthropicContent?.[0], {
            type: 'thinking',
            thinking: '不应展示的内部思考。',
            signature: 'anthropic-signature-1',
        });
        assert.deepEqual(adapter.buildMessages({
            messages: [{
                role: 'assistant',
                content: result.text,
                providerPayload: result.providerPayload,
            }],
        })[0].content[0], result.providerPayload.anthropicContent[0]);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Claude adapter parses tool input only after stream completion', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-sonnet-4-0',
    });
    const originalFetch = globalThis.fetch;
    const progress = [];
    globalThis.fetch = async () => createSseResponse([
        {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'tool_use', id: 'toolu_write', name: 'Write', input: {} },
        },
        {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'input_json_delta', partial_json: '{"filePath":"book/chapters/001.md",' },
        },
        {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'input_json_delta', partial_json: '"content":"第一行\\n\\"对话\\""}' },
        },
        {
            type: 'message_delta',
            delta: { stop_reason: 'tool_use' },
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '写一章' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Write',
                    description: 'Write file.',
                    parameters: { type: 'object', properties: {} },
                },
            }],
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.equal(progress.length >= 2, true);
        assert.deepEqual(result.toolCalls, [{
            id: 'toolu_write',
            name: 'Write',
            arguments: '{"filePath":"book/chapters/001.md","content":"第一行\\n\\"对话\\""}',
        }]);
        assert.deepEqual(result.providerPayload.anthropicContent[0].input, {
            filePath: 'book/chapters/001.md',
            content: '第一行\n"对话"',
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Claude adapter preserves malformed final tool input for tool-layer errors', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-sonnet-4-0',
    });
    const originalFetch = globalThis.fetch;
    const progress = [];
    const rawArguments = '{"filePath":"book/outline.md","edits":[';
    globalThis.fetch = async () => createSseResponse([
        {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'tool_use', id: 'toolu_bad', name: 'Edit', input: {} },
        },
        {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'input_json_delta', partial_json: rawArguments },
        },
        {
            type: 'message_delta',
            delta: { stop_reason: 'tool_use' },
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '改大纲' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Edit',
                    description: 'Edit file.',
                    parameters: { type: 'object', properties: {} },
                },
            }],
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.deepEqual(result.toolCalls, [{
            id: 'toolu_bad',
            name: 'Edit',
            arguments: rawArguments,
        }]);
        assert.deepEqual(result.providerPayload.anthropicContent[0], {
            type: 'tool_use',
            id: 'toolu_bad',
            name: 'Edit',
            input: {},
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Claude malformed Write input can be repaired by shared tool-call normalization', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-sonnet-4-0',
    });
    const originalFetch = globalThis.fetch;
    const rawArguments = [
        '{"filePath":"book/chapters/001.md","content":"她说："回来。"',
        '第二行"}',
    ].join('\n');
    globalThis.fetch = async () => createSseResponse([
        {
            type: 'content_block_start',
            index: 0,
            content_block: { type: 'tool_use', id: 'toolu_write_bad', name: 'Write', input: {} },
        },
        {
            type: 'content_block_delta',
            index: 0,
            delta: { type: 'input_json_delta', partial_json: rawArguments },
        },
        {
            type: 'message_delta',
            delta: { stop_reason: 'tool_use' },
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '写一章' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Write',
                    description: 'Write file.',
                    parameters: { type: 'object', properties: {} },
                },
            }],
            onStreamProgress: () => {},
        });
        const toolCalls = resolveResultToolCalls(result, { provider: 'sillytavern-claude' });

        assert.equal(result.toolCalls[0].arguments, rawArguments);
        assert.deepEqual(JSON.parse(toolCalls[0].arguments), {
            filePath: 'book/chapters/001.md',
            content: '她说："回来。"\n第二行',
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Google adapter streams function calls through host generate endpoint', async () => {
    const adapter = new SillyTavernGoogleAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'gemini-2.5-pro',
    });
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createSseResponse([
            {
                candidates: [{
                    content: {
                        role: 'model',
                        parts: [{ text: '我先写一个测试文件。' }],
                    },
                }],
            },
            {
                candidates: [{
                    finishReason: 'STOP',
                    content: {
                        role: 'model',
                        parts: [{
                            functionCall: {
                                name: 'Write',
                                args: { filePath: 'book/notes/test.md', content: 'hello' },
                            },
                        }],
                    },
                }],
            },
        ]);
    };

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '写测试文件' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Write',
                    description: 'Write file.',
                    parameters: { type: 'object', properties: { filePath: { type: 'string' } } },
                },
            }],
            onStreamProgress: () => {},
        });

        assert.equal(requests[0].url, HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT);
        assert.equal(requests[0].body.chat_completion_source, 'makersuite');
        assert.equal(requests[0].body.stream, true);
        assert.equal(requests[0].body.use_sysprompt, true);
        assert.equal(result.text, '我先写一个测试文件。');
        assert.deepEqual(result.toolCalls, [{
            id: 'st-google-tool-1',
            name: 'Write',
            arguments: '{"filePath":"book/notes/test.md","content":"hello"}',
        }]);
        assert.equal(result.provider, 'sillytavern-google');
        assert.equal(result.providerPayload.googleContent.parts.length, 2);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Claude adapter replays preserved anthropic content through host generate endpoint', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-sonnet-4-0',
    });
    const originalFetch = globalThis.fetch;
    const requests = [];
    const preservedContent = [
        { type: 'text', text: '我先看看。' },
        { type: 'thinking', thinking: '保留原生思考块。' },
        {
            type: 'tool_use',
            id: 'toolu_1',
            name: 'Read',
            input: { filePath: 'book/outline.md' },
        },
    ];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({
            content: [{ type: 'text', text: '继续完成。' }],
            stop_reason: 'end_turn',
            model: 'claude-sonnet-4-0',
        });
    };

    try {
        const result = await adapter.chat({
            messages: [
                { role: 'user', content: '继续处理' },
                {
                    role: 'assistant',
                    content: '',
                    providerPayload: {
                        anthropicContent: preservedContent,
                    },
                },
                {
                    role: 'tool',
                    tool_call_id: 'toolu_1',
                    content: JSON.stringify({ ok: true }),
                },
            ],
            tools: [],
        });

        assert.equal(requests[0].url, HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT);
        assert.deepEqual(requests[0].body.messages[1], {
            role: 'assistant',
            content: preservedContent,
        });
        assert.equal(requests[0].body.messages[2].role, 'tool');
        assert.equal(result.text, '继续完成。');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Claude replay prefers repaired top-level tool arguments over raw preserved tool input', async () => {
    const adapter = new SillyTavernClaudeAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'claude-sonnet-4-0',
    });
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({
            content: [{ type: 'text', text: '继续完成。' }],
            stop_reason: 'end_turn',
            model: 'claude-sonnet-4-0',
        });
    };

    try {
        await adapter.chat({
            messages: [
                { role: 'user', content: '继续处理' },
                {
                    role: 'assistant',
                    content: '',
                    providerPayload: {
                        anthropicContent: [
                            { type: 'text', text: '我来写。' },
                            { type: 'tool_use', id: 'toolu_write', name: 'Write', input: {} },
                        ],
                    },
                    tool_calls: [{
                        id: 'toolu_write',
                        type: 'function',
                        function: {
                            name: 'Write',
                            arguments: '{"filePath":"book/chapters/001.md","content":"正文"}',
                        },
                    }],
                },
                {
                    role: 'tool',
                    tool_call_id: 'toolu_write',
                    content: JSON.stringify({ ok: true }),
                },
            ],
            tools: [],
        });

        assert.deepEqual(requests[0].body.messages[1].content, [
            { type: 'text', text: '我来写。' },
            {
                type: 'tool_use',
                id: 'toolu_write',
                name: 'Write',
                input: {
                    filePath: 'book/chapters/001.md',
                    content: '正文',
                },
            },
        ]);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern Google adapter replays preserved google contents with host tool-call signatures', async () => {
    const adapter = new SillyTavernGoogleAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'gemini-2.5-pro',
    });
    const originalFetch = globalThis.fetch;
    const requests = [];
    const googleContents = [
        {
            role: 'model',
            parts: [{
                text: '我先说明一下。',
                thoughtSignature: 'sig-text',
            }],
        },
        {
            role: 'model',
            parts: [{
                functionCall: {
                    id: 'call-1',
                    name: 'Read',
                    args: { filePath: 'book/outline.md' },
                },
                thoughtSignature: 'sig-call',
            }],
        },
    ];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({
            model: 'gemini-2.5-pro',
            choices: [{
                finish_reason: 'STOP',
                message: {
                    content: '继续完成。',
                },
            }],
            responseContent: {
                role: 'model',
                parts: [{ text: '继续完成。' }],
            },
        });
    };

    try {
        const result = await adapter.chat({
            messages: [
                { role: 'user', content: '继续处理' },
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

        assert.equal(requests[0].url, HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT);
        assert.deepEqual(requests[0].body.messages.slice(1, 3), [
            {
                role: 'assistant',
                content: [{
                    type: 'text',
                    text: '我先说明一下。',
                }],
                signature: 'sig-text',
            },
            {
                role: 'assistant',
                content: [{
                    type: 'tool_calls',
                    tool_calls: [{
                        id: 'call-1',
                        type: 'function',
                        function: {
                            name: 'Read',
                            arguments: '{"filePath":"book/outline.md"}',
                        },
                        signature: 'sig-call',
                    }],
                }],
            },
        ]);
        assert.equal(requests[0].body.messages[3].role, 'tool');
        assert.equal(result.text, '继续完成。');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('agent factory allows SillyTavern Claude and Google without direct API keys', () => {
    assert.equal(createAgentAdapter({
        provider: 'sillytavern-claude',
        model: 'claude-sonnet-4-0',
        apiKey: '',
    }) instanceof SillyTavernClaudeAdapter, true);
    assert.equal(createAgentAdapter({
        provider: 'sillytavern-google',
        model: 'gemini-2.5-pro',
        apiKey: '',
    }) instanceof SillyTavernGoogleAdapter, true);
});

test('host OpenAI-compatible model pull posts to SillyTavern status endpoint', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            method: options.method,
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({
            data: [
                { id: 'chat-model' },
                { id: 'chat-model' },
                { id: 'embedding-model' },
            ],
        });
    };

    try {
        const models = await fetchHostOpenAICompatibleModels({
            baseUrl: 'https://example.com/v1',
            apiKey: 'test-key',
        });

        assert.deepEqual(requests, [{
            url: HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT,
            method: 'POST',
            body: {
                chat_completion_source: 'openai',
                reverse_proxy: 'https://example.com/v1',
                proxy_password: 'test-key',
            },
        }]);
        assert.deepEqual(models, ['chat-model', 'embedding-model']);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host OpenAI-compatible model pull preserves explicit v3 reverse proxy URLs', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            method: options.method,
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({
            data: [
                { id: 'volcengine-model' },
            ],
        });
    };

    try {
        const models = await fetchHostOpenAICompatibleModels({
            baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
            apiKey: 'test-key',
        });

        assert.deepEqual(requests, [{
            url: HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT,
            method: 'POST',
            body: {
                chat_completion_source: 'openai',
                reverse_proxy: 'https://ark.cn-beijing.volces.com/api/v3',
                proxy_password: 'test-key',
            },
        }]);
        assert.deepEqual(models, ['volcengine-model']);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host Google model pull posts LittleWhiteBox key through SillyTavern status endpoint', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            method: options.method,
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({
            data: [
                { id: 'gemini-2.5-pro' },
                { id: 'embedding-model' },
            ],
        });
    };

    try {
        const models = await fetchHostChatCompletionsModels({
            baseUrl: '',
            apiKey: 'google-key',
        }, 'makersuite');

        assert.deepEqual(requests, [{
            url: HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT,
            method: 'POST',
            body: {
                chat_completion_source: 'makersuite',
                reverse_proxy: 'https://generativelanguage.googleapis.com',
                proxy_password: 'google-key',
            },
        }]);
        assert.deepEqual(models, ['gemini-2.5-pro', 'embedding-model']);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host Claude status payload uses LittleWhiteBox key when Base URL is blank', () => {
    assert.deepEqual(buildHostChatCompletionsStatusPayload({
        baseUrl: '',
        apiKey: 'claude-key',
    }, 'claude'), {
        chat_completion_source: 'claude',
        reverse_proxy: 'https://api.anthropic.com/v1',
        proxy_password: 'claude-key',
    });
});

test('SillyTavern Claude model pull honors custom proxy model lists', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            headers: options.headers,
        });
        return createJsonResponse({
            data: [
                { id: 'deepseek-chat' },
                { id: 'deepseek-reasoner' },
            ],
        });
    };

    try {
        const models = await pullModelsForProvider({
            provider: 'sillytavern-claude',
            baseUrl: 'https://beta.smolproxy.org/deepseek/anthropic',
            apiKey: 'proxy-key',
        });

        assert.equal(requests[0].url, 'https://beta.smolproxy.org/deepseek/anthropic/v1/models');
        assert.equal(requests[0].headers['x-api-key'], 'proxy-key');
        assert.deepEqual(models, ['deepseek-chat', 'deepseek-reasoner']);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('SillyTavern Claude model pull does not hide custom proxy failures behind Claude defaults', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => createJsonResponse({
        error: {
            message: 'proxy model list unavailable',
        },
    }, false, 404);

    try {
        await assert.rejects(
            async () => {
                await pullModelsForProvider({
                    provider: 'sillytavern-claude',
                    baseUrl: 'https://beta.smolproxy.org/deepseek/anthropic',
                    apiKey: 'proxy-key',
                });
            },
            /proxy model list unavailable/,
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host OpenAI-compatible requests include injected SillyTavern CSRF headers', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    setHostChatCompletionsRequestHeadersProvider(() => ({
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'csrf-test-token',
    }));
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            headers: options.headers,
            body: JSON.parse(String(options.body || '{}')),
        });
        return createJsonResponse({ data: [{ id: 'chat-model' }] });
    };

    try {
        await fetchHostOpenAICompatibleModels({});

        assert.deepEqual(requests, [{
            url: HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': 'csrf-test-token',
                Accept: 'application/json',
            },
            body: {
                chat_completion_source: 'openai',
            },
        }]);
    } finally {
        setHostChatCompletionsRequestHeadersProvider(null);
        globalThis.fetch = originalFetch;
    }
});

test('host OpenAI-compatible requests resolve fresh async SillyTavern headers per request', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    let csrfIndex = 0;
    setHostChatCompletionsRequestHeadersProvider(async () => ({
        'X-CSRF-Token': `csrf-live-${++csrfIndex}`,
    }));
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            headers: options.headers,
        });
        return createJsonResponse({ data: [{ id: 'chat-model' }] });
    };

    try {
        await fetchHostOpenAICompatibleModels({});
        await fetchHostOpenAICompatibleModels({});

        assert.deepEqual(requests.map((request) => request.headers), [
            {
                'Content-Type': 'application/json',
                'X-CSRF-Token': 'csrf-live-1',
                Accept: 'application/json',
            },
            {
                'Content-Type': 'application/json',
                'X-CSRF-Token': 'csrf-live-2',
                Accept: 'application/json',
            },
        ]);
    } finally {
        setHostChatCompletionsRequestHeadersProvider(null);
        globalThis.fetch = originalFetch;
    }
});

test('host OpenAI-compatible model pull maps explicit CSRF failures to refresh guidance', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: false,
        status: 403,
        text: async () => '<!DOCTYPE html><html><body>ForbiddenError: Invalid CSRF token. Please refresh the page and try again.</body></html>',
    });

    try {
        await assert.rejects(
            async () => {
                await fetchHostOpenAICompatibleModels({});
            },
            /酒馆当前页面的 CSRF token 已失效，请按 F5 刷新并重新进入酒馆后再试。/,
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host model pull reports generic HTML gateway failures without mislabeling them as CSRF', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        headers: { get: (name) => name === 'content-type' ? 'text/html; charset=utf-8' : '' },
        text: async () => '<!DOCTYPE html><html><head><title>Bad Gateway</title></head><body>upstream unavailable</body></html>',
    });

    try {
        await assert.rejects(
            async () => fetchHostOpenAICompatibleModels({}),
            (error) => {
                assert.match(error.message, /非 JSON 的 HTML 页面/);
                assert.match(error.message, /HTTP 502 Bad Gateway/);
                assert.match(error.message, /Bad Gateway/);
                assert.doesNotMatch(error.message, /CSRF token 已失效/);
                return true;
            },
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host non-stream generation identifies an HTML login page instead of reporting CSRF', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        headers: { get: () => 'text/html' },
        text: async () => '<html><head><title>登录</title></head><body>请重新登录</body></html>',
    });

    try {
        await assert.rejects(
            async () => createHostChatCompletion({ messages: [] }),
            (error) => {
                assert.match(error.message, /酒馆后端生成失败/);
                assert.match(error.message, /HTTP 200/);
                assert.match(error.message, /登录/);
                assert.doesNotMatch(error.message, /CSRF token 已失效/);
                return true;
            },
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('host stream generation preserves HTML service errors with their HTTP status', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        headers: { get: () => 'text/html' },
        text: async () => '<!DOCTYPE html><html><body><h1>Service temporarily unavailable</h1></body></html>',
    });

    try {
        await assert.rejects(
            async () => streamHostChatCompletion({ messages: [] }, () => {}),
            (error) => {
                assert.match(error.message, /HTTP 503 Service Unavailable/);
                assert.match(error.message, /Service temporarily unavailable/);
                assert.doesNotMatch(error.message, /CSRF token 已失效/);
                return true;
            },
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern OpenAI-compatible adapter streams native tool calls through host generate endpoint', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: 'https://example.com/v1',
        apiKey: 'test-key',
        model: 'compat-model',
        toolMode: 'native',
    });

    const originalFetch = globalThis.fetch;
    const requests = [];
    const progress = [];
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '{}')),
        });
        return createSseResponse([
            {
                model: 'compat-model',
                choices: [{
                    index: 0,
                    delta: {
                        role: 'assistant',
                        content: '我先读文件。',
                        tool_calls: [{
                            index: 0,
                            type: 'function',
                            function: {
                                name: 'Read',
                                arguments: '{"path"',
                            },
                            extra_content: {
                                google: {
                                    thoughtSignature: 'stream-signature',
                                },
                            },
                        }],
                    },
                    reasoning_content: '先读取一个轻量文件确认工具链。',
                    finish_reason: null,
                }],
            },
            {
                model: 'compat-model',
                choices: [{
                    index: 0,
                    delta: {
                        tool_calls: [{
                            index: 0,
                            function: {
                                arguments: ':"local/test.txt"}',
                            },
                        }],
                    },
                    finish_reason: 'tool_calls',
                }],
            },
        ]);
    };

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '做一轮工具测试' }],
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
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.equal(requests.length, 1);
        assert.equal(requests[0].url, HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT);
        assert.equal(requests[0].body.stream, true);
        assert.equal(requests[0].body.chat_completion_source, 'openai');
        assert.equal(requests[0].body.reverse_proxy, 'https://example.com/v1');
        assert.equal(requests[0].body.proxy_password, 'test-key');
        assert.equal(requests[0].body.tools.length, 1);
        assert.equal(requests[0].body.tool_choice, 'auto');
        assert.equal(result.text, '我先读文件。');
        assert.deepEqual(result.toolCalls, [{
            id: 'openai-tool-1',
            name: 'Read',
            arguments: '{"path":"local/test.txt"}',
        }]);
        assert.equal(result.providerPayload?.openaiCompatibleMessage?.tool_calls?.[0]?.id, 'openai-tool-1');
        assert.equal(progress.some((snapshot) => snapshot.toolCalls?.[0]?.name === 'Read'), true);
        assert.equal(progress.some((snapshot) => String(snapshot.text || '').includes('我先读文件。')), true);
        assert.equal(result.providerPayload?.openaiCompatibleMessage?.reasoning_content, '先读取一个轻量文件确认工具链。');
        assert.equal(
            result.providerPayload?.openaiCompatibleMessage?.tool_calls?.[0]?.extra_content?.google?.thoughtSignature,
            'stream-signature',
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern OpenAI-compatible tagged-json streaming hides raw tool JSON and emits tool draft progress', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'compat-model',
        toolMode: 'tagged-json',
    });

    const originalFetch = globalThis.fetch;
    const progress = [];
    globalThis.fetch = async () => createSseResponse([
        {
            model: 'compat-model',
            choices: [{
                index: 0,
                delta: { role: 'assistant', content: '我先查一下。' },
            }],
        },
        {
            model: 'compat-model',
            choices: [{
                index: 0,
                delta: { content: '\n<tool_call>{"name":"Read"' },
            }],
        },
        {
            model: 'compat-model',
            choices: [{
                index: 0,
                delta: { content: ',"arguments":{"path":"local/test.txt"}}</tool_call>' },
                finish_reason: 'stop',
            }],
        },
    ]);

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '读文件' }],
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
            onStreamProgress: (snapshot) => progress.push(snapshot),
        });

        assert.equal(progress.some((snapshot) => String(snapshot.text || '').includes('<tool_call>')), false);
        assert.equal(progress.some((snapshot) => snapshot.toolCallDraft === true), true);
        assert.equal(progress.some((snapshot) => snapshot.toolCalls?.[0]?.name === 'Read'), true);
        assert.equal(result.text, '我先查一下。');
        assert.equal(result.toolCalls?.[0]?.name, 'Read');
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern OpenAI-compatible tagged-json mode does not send native tools to host backend', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'compat-model',
        toolMode: 'tagged-json',
    });

    const originalFetch = globalThis.fetch;
    let receivedBody = null;
    globalThis.fetch = async (url, options = {}) => {
        assert.equal(String(url), HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT);
        receivedBody = JSON.parse(String(options.body || '{}'));
        return createJsonResponse({
            model: 'compat-model',
            choices: [{
                finish_reason: 'tool_calls',
                message: {
                    role: 'assistant',
                    content: '<tool_call>{"name":"Read","arguments":{"path":"local/test.txt"}}</tool_call>',
                },
            }],
        });
    };

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '读文件' }],
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

        assert.equal(Object.hasOwn(receivedBody, 'tools'), false);
        assert.equal(Object.hasOwn(receivedBody, 'tool_choice'), false);
        assert.equal(receivedBody.messages[0].role, 'system');
        assert.equal(receivedBody.messages[0].content.includes('<tool_call>{"name":"工具名","arguments":{...}}</tool_call>'), true);
        assert.deepEqual(result.toolCalls, [{
            id: 'tool-call-1',
            name: 'Read',
            arguments: '{"path":"local/test.txt"}',
        }]);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern OpenAI-compatible retries malformed native tool host failures as tagged-json', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'compat-model',
        toolMode: 'native',
    });

    const originalFetch = globalThis.fetch;
    const requests = [];
    const fallbackEvents = [];
    globalThis.fetch = async (url, options = {}) => {
        const body = JSON.parse(String(options.body || '{}'));
        requests.push({
            url: String(url),
            body,
        });
        if (requests.length === 1) {
            return createJsonResponse({
                error: {
                    message: "Cannot read properties of null (reading 'function')",
                    type: 'badresponsestatuscode',
                    code: 'badresponsestatuscode',
                },
            }, false, 500);
        }
        return createJsonResponse({
            model: 'compat-model',
            choices: [{
                finish_reason: 'tool_calls',
                message: {
                    role: 'assistant',
                    content: '<tool_call>{"name":"Read","arguments":{"path":"book/state.md"}}</tool_call>',
                },
            }],
        });
    };

    try {
        const result = await adapter.chat({
            messages: [{ role: 'user', content: '读状态' }],
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
            onToolProtocolFallback: (event) => {
                fallbackEvents.push(event);
            },
        });

        assert.equal(requests.length, 2);
        assert.deepEqual(fallbackEvents, [{
            provider: 'sillytavern-openai-compatible',
            fromToolMode: 'native',
            toToolMode: 'tagged-json',
            reason: 'malformed_native_tool_host_error',
        }]);
        assert.equal(requests[0].body.tools.length, 1);
        assert.equal(Object.hasOwn(requests[1].body, 'tools'), false);
        assert.equal(Object.hasOwn(requests[1].body, 'tool_choice'), false);
        assert.equal(requests[1].body.messages[0].content.includes('<tool_call>{"name":"工具名","arguments":{...}}</tool_call>'), true);
        assert.deepEqual(result.toolCalls, [{
            id: 'tool-call-1',
            name: 'Read',
            arguments: '{"path":"book/state.md"}',
        }]);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('sillytavern OpenAI-compatible can forbid automatic tool protocol fallback', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: '',
        apiKey: '',
        model: 'compat-model',
        toolMode: 'native',
    });
    const originalFetch = globalThis.fetch;
    let requestCount = 0;
    globalThis.fetch = async () => {
        requestCount += 1;
        return createJsonResponse({
            error: {
                message: "Cannot read properties of null (reading 'function')",
                type: 'badresponsestatuscode',
                code: 'badresponsestatuscode',
            },
        }, false, 500);
    };

    try {
        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: '读状态' }],
            tools: [{
                type: 'function',
                function: {
                    name: 'Read',
                    description: 'Read file.',
                    parameters: { type: 'object', properties: {} },
                },
            }],
            allowToolProtocolFallback: false,
        }), /Cannot read properties of null/);
        assert.equal(requestCount, 1);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
