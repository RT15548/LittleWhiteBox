import test from 'node:test';
import assert from 'node:assert/strict';

import { SillyTavernOpenAICompatibleAdapter } from '../app-src/adapters/sillytavern-openai-compatible.js';
import {
    HOST_CHAT_COMPLETIONS_GENERATE_ENDPOINT,
    HOST_CHAT_COMPLETIONS_STATUS_ENDPOINT,
    buildHostOpenAICompatibleGeneratePayload,
    buildHostOpenAICompatibleStatusPayload,
    fetchHostOpenAICompatibleModels,
    setHostChatCompletionsRequestHeadersProvider,
} from '../../../shared/host-llm/chat-completions/client.js';

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
            reasoning: { enabled: true, effort: 'high' },
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
    assert.equal(payload.reasoning_effort, 'high');
    assert.equal(Object.hasOwn(payload, 'temperature'), false);
    assert.equal(payload.tool_choice, 'auto');
    assert.equal(payload.tools.length, 1);
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

test('host OpenAI-compatible model pull maps CSRF and HTML failures to refresh guidance', async () => {
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

test('sillytavern OpenAI-compatible adapter streams native tool calls through host generate endpoint', async () => {
    const adapter = new SillyTavernOpenAICompatibleAdapter({
        baseUrl: 'https://example.com/v1',
        apiKey: 'test-key',
        model: 'compat-model',
        toolMode: 'native',
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
                model: 'compat-model',
                choices: [{
                    index: 0,
                    delta: {
                        role: 'assistant',
                        content: '我先读文件。',
                        tool_calls: [{
                            index: 0,
                            id: 'call-1',
                            type: 'function',
                            function: {
                                name: 'Read',
                                arguments: '{"path"',
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
            onStreamProgress: () => {},
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
            id: 'call-1',
            name: 'Read',
            arguments: '{"path":"local/test.txt"}',
        }]);
        assert.equal(result.providerPayload?.openaiCompatibleMessage?.reasoning_content, '先读取一个轻量文件确认工具链。');
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
