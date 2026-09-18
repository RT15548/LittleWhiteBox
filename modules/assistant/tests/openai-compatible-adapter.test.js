import test from 'node:test';
import assert from 'node:assert/strict';
import OpenAI from 'openai';
import { readFileSync } from 'node:fs';

import {
    OpenAICompatibleAdapter,
    buildNativeMessages,
    buildTaggedMessages,
    buildTaggedToolCallDraft,
    extractTaggedToolCalls,
    stripTaggedToolCallsForDisplay,
} from '../../agent-core/adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { redactRequestSecrets } from '../../agent-core/adapters/request-inspection.js';
import { resolveRuntimeReasoning } from '../../agent-core/reasoning-capabilities.js';
import { buildProviderMessagesFromHistory } from '../../agent-core/runtime/protocol.js';

test('raw assistant diagnostics are opt-in and preserve missing native arguments without changing replay', async () => {
    const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model: 'compat-test' });
    const message = {
        role: 'assistant', content: '',
        tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'Read' } }],
    };
    const original = structuredClone(message);
    adapter.client.chat.completions.create = async () => ({ choices: [{ message, finish_reason: 'stop' }] });
    const task = { messages: [{ role: 'user', content: 'test' }] };
    const ordinary = await adapter.chat(task);
    assert.equal(Object.hasOwn(ordinary, 'rawAssistantMessage'), false);
    const captured = await adapter.chat({ ...task, captureRawAssistantMessage: true });
    assert.deepEqual(captured.rawAssistantMessage, original);
    const { rawAssistantMessage, ...normalized } = captured;
    assert.deepEqual(normalized, ordinary);
    assert.deepEqual(message, original);
    rawAssistantMessage.tool_calls[0].function.name = 'changed';
    assert.equal(message.tool_calls[0].function.name, 'Read');
});

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

test('openai-compatible requests preserve the trusted system prompt before system data messages', () => {
    const task = {
        systemPrompt: 'trusted static rules',
        tools: [{
            type: 'function',
            function: {
                name: 'Read',
                description: 'Read file.',
                parameters: { type: 'object', properties: {} },
            },
        }],
        messages: [
            { role: 'system', name: 'setting', content: '<setting>untrusted data</setting>' },
            { role: 'system', name: 'current_state', content: '<current_state>facts</current_state>' },
            { role: 'user', content: 'run' },
        ],
    };

    const native = buildNativeMessages(task);
    assert.match(native[0].content, /^trusted static rules\n\n<setting>/u);
    assert.equal(native[1].content, '<current_state>facts</current_state>');

    const tagged = buildTaggedMessages(task);
    assert.match(tagged[0].content, /^trusted static rules[\s\S]*<setting>untrusted data<\/setting>$/u);
    assert.equal(tagged[1].content, '<current_state>facts</current_state>');
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

test('openai-compatible streaming exposes provider JSON failures as readable messages', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'invalid-key',
        baseUrl: 'https://openai-compatible.example/v1',
        model: 'test-model',
    });
    const rawBody = JSON.stringify({
        error: {
            code: '',
            message: '无效的令牌，请检查 API Key。',
            type: 'new_api_error',
        },
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: false,
        status: 401,
        text: async () => rawBody,
    });

    try {
        await assert.rejects(() => adapter.chat({
            messages: [{ role: 'user', content: 'hello' }],
            onStreamProgress() {},
        }), (error) => {
            assert.equal(error.message, '无效的令牌，请检查 API Key。');
            assert.equal(error.status, 401);
            assert.equal(error.body, rawBody);
            assert.doesNotMatch(error.message, /new_api_error|\{"error"/);
            return true;
        });
    } finally {
        globalThis.fetch = originalFetch;
    }
});

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

// DeepSeek V3.2 DSML 明文（官方 encoding_dsv32.py 格式）：string="true" 取原文，"false" 按 JSON 解析。
const DSML_LEAK = [
    '我先查一下。',
    '',
    '<｜DSML｜function_calls>',
    '<｜DSML｜invoke name="Grep">',
    '<｜DSML｜parameter name="pattern" string="true">preset-|preset |CompletionPreset</｜DSML｜parameter>',
    '<｜DSML｜parameter name="path" string="true">references/stscript-reference.md</｜DSML｜parameter>',
    '<｜DSML｜parameter name="contextLines" string="false">2</｜DSML｜parameter>',
    '<｜DSML｜parameter name="useRegex" string="false">true</｜DSML｜parameter>',
    '</｜DSML｜invoke>',
    '<｜DSML｜invoke name="Read">',
    '<｜DSML｜parameter name="filePath" string="true">book/state.md</｜DSML｜parameter>',
    '<｜DSML｜parameter name="ranges" string="false">[{"start":1,"end":40}]</｜DSML｜parameter>',
    '</｜DSML｜invoke>',
    '</｜DSML｜function_calls>',
].join('\n');

test('tagged-json parses leaked DeepSeek DSML tool calls like <tool_call> blocks', () => {
    const calls = extractTaggedToolCalls(DSML_LEAK);
    assert.deepEqual(calls.map((call) => [call.id, call.name, JSON.parse(call.arguments)]), [
        ['tool-call-1', 'Grep', {
            pattern: 'preset-|preset |CompletionPreset',
            path: 'references/stscript-reference.md',
            contextLines: 2,
            useRegex: true,
        }],
        ['tool-call-2', 'Read', { filePath: 'book/state.md', ranges: [{ start: 1, end: 40 }] }],
    ]);
    assert.equal(stripTaggedToolCallsForDisplay(DSML_LEAK), '我先查一下。');
    assert.deepEqual(buildTaggedToolCallDraft(DSML_LEAK.slice(0, DSML_LEAK.indexOf('">') + 2)).map((call) => call.name), ['Grep']);
    assert.throws(() => extractTaggedToolCalls(DSML_LEAK.slice(0, DSML_LEAK.indexOf('</｜DSML｜invoke>'))), {
        code: 'DSML_TOOL_CALL_INVALID',
    });
});

test('tagged-json accepts half-width DSML bars from token-rewriting relays', () => {
    const calls = extractTaggedToolCalls(DSML_LEAK.replaceAll('｜', '|'));
    assert.deepEqual(calls.map((call) => call.name), ['Grep', 'Read']);
});

function dsmlParameter(name, value, string = 'true') {
    return `<｜DSML｜parameter name="${name}" string="${string}">${value}</｜DSML｜parameter>`;
}

function dsmlInvoke(name, body = '') {
    return `<｜DSML｜invoke name="${name}">\n${body}\n</｜DSML｜invoke>`;
}

test('DSML rejects the whole response when parameter or call boundaries are incomplete', () => {
    const path = dsmlParameter('filePath', 'book/notes/test.md');
    const invalidBodies = [
        `${path}<｜DSML｜parameter name="content" string="true">unfinished`,
        `${path}<｜DSML｜parameter name="content" string="true">unfinished${dsmlParameter('other', 'value')}`,
        `${path}<｜DSML｜parameter name="content">missing string attribute</｜DSML｜parameter>`,
        `${path}${dsmlParameter('filePath', 'book/notes/other.md')}`,
        `${path}unexpected text`,
    ];
    const invalidResponses = [
        ...invalidBodies.map(body => dsmlInvoke('Write', body)),
        `<｜DSML｜function_calls>${dsmlInvoke('Write', path)}`,
        `<｜DSML｜function_calls>${dsmlInvoke('Write', path)}</｜DSML｜calls>`,
        `${dsmlInvoke('PlanList')}<｜DSML`,
        `${dsmlInvoke('PlanList')}<｜｜D`,
    ];
    for (const text of invalidResponses) {
        // No earlier call is released if a later DSML call is malformed.
        assert.throws(() => extractTaggedToolCalls(`${dsmlInvoke('PlanList')}\n${text}`), {
            code: 'DSML_TOOL_CALL_INVALID',
        });
    }
});

test('DSML string values are opaque to invoke and tagged-json scanning', () => {
    const content = [
        'Literal closing token: </｜DSML｜invoke>',
        dsmlInvoke('PlanList'),
        dsmlInvoke('PlanList'),
        '<tool_call>{"name":"Delete","arguments":{"path":"book/notes/example.md"}}</tool_call>',
        '<think>literal file text</think>',
        'Quotes: "hello"; backslashes: C:\\notes\\file.md',
    ].join('\n');
    const calls = extractTaggedToolCalls(dsmlInvoke('Write', [
        dsmlParameter('filePath', 'book/notes/test.md'),
        dsmlParameter('content', content),
    ].join('\n')));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].name, 'Write');
    assert.deepEqual(JSON.parse(calls[0].arguments), { filePath: 'book/notes/test.md', content });
});

test('mixed text tool protocols preserve source order and do not collide with explicit ids', () => {
    const calls = extractTaggedToolCalls([
        dsmlInvoke('Write', dsmlParameter('filePath', 'book/notes/test.md') + dsmlParameter('content', 'hello')),
        '<Tool_Call>{"id":"tool-call-1","name":"Read","arguments":{"filePath":"book/notes/test.md"}}</Tool_Call>',
        dsmlInvoke('PlanList'),
    ].join('\n'));
    assert.deepEqual(calls.map(call => call.name), ['Write', 'Read', 'PlanList']);
    assert.equal(calls[1].id, 'tool-call-1');
    assert.equal(new Set(calls.map(call => call.id)).size, 3);
    assert.equal(buildTaggedToolCallDraft('<tool_call>{"name":"Read","arguments":{}}</tool_call>\n' + dsmlInvoke('PlanList'))[0].name, 'Read');
});

test('DSML preserves typed JSON and rejects invalid non-string values instead of coercing them', () => {
    const calls = extractTaggedToolCalls(dsmlInvoke('Example', [
        dsmlParameter('count', '3', 'false'),
        dsmlParameter('enabled', 'true', 'false'),
        dsmlParameter('items', '[1,{"text":"hello"}]', 'false'),
        dsmlParameter('__proto__', '{"safe":true}', 'false'),
        dsmlParameter('literal', '  null  '),
    ].join('\n')));
    assert.deepEqual(JSON.parse(calls[0].arguments), JSON.parse('{"count":3,"enabled":true,"items":[1,{"text":"hello"}],"__proto__":{"safe":true},"literal":"  null  "}'));
    for (const value of ['tru', '{"missing":', '', 'undefined']) {
        assert.throws(() => extractTaggedToolCalls(dsmlInvoke('Grep', dsmlParameter('useRegex', value, 'false'))), {
            code: 'DSML_TOOL_CALL_INVALID',
        });
    }
});

test('DSML recognizes reported marker spelling but rejects the original unclosed response', () => {
    const original = readFileSync(new URL('./fixtures/deepseek-dsml-unclosed.txt', import.meta.url), 'utf8');
    assert.equal(stripTaggedToolCallsForDisplay(original), '我先查文档，确认命令与参数细节。');
    assert.equal(buildTaggedToolCallDraft(original)[0].name, 'Grep');
    assert.throws(() => extractTaggedToolCalls(original), { code: 'DSML_TOOL_CALL_INVALID' });
    // Separate complete examples verify the spelling, not an invented repair of the fixture.
    for (const marker of ['｜｜DSML｜｜ ', '||DSML|| ', '｜dsml｜']) {
        const complete = DSML_LEAK.replaceAll('｜DSML｜', marker).replaceAll('function_calls', 'calls');
        assert.deepEqual(extractTaggedToolCalls(complete).map(call => call.name), ['Grep', 'Read']);
    }
    const hybrid = '<tool_call>{"name":"submit_scene_plan","arguments":{"images":[]}}' +
        '</｜｜DSML｜｜ parameter>\n</｜｜DSML｜｜ invoke>\n</｜｜DSML｜｜ calls>';
    assert.throws(() => extractTaggedToolCalls(hybrid), { code: 'DSML_TOOL_CALL_INVALID' });
});

test('tagged JSON recovers the reported complete scene plan with extra protocol closers', () => {
    const raw = readFileSync(new URL('./fixtures/tagged-scene-plan-dsml-suffix.txt', import.meta.url), 'utf8');
    const expected = JSON.parse(raw.slice(raw.indexOf('{'), raw.indexOf('</｜｜DSML｜｜ parameter>')));
    const [call] = extractTaggedToolCalls(raw);
    assert.equal(call.name, 'submit_scene_plan');
    assert.deepEqual(JSON.parse(call.arguments), expected.arguments);
    assert.deepEqual(JSON.parse(call.arguments).images.map(image => image.insert_after), [52, 73]);
});

test('tagged JSON strips surrounding prose, fences and arbitrary tags without editing string data', () => {
    const content = 'literal </tool_call> <tool_call>{"name":"Delete","arguments":{}}</tool_call> '
        + '</｜DSML｜invoke> <think>keep</think> \\"quoted\\" \\ path { [ } ]';
    const payload = JSON.stringify({ name: 'Write', arguments: { filePath: 'notes.md', content } });
    for (const [prefix, suffix] of [
        ['', '</｜｜DSML｜｜ parameter>\n</｜｜DSML｜｜ invoke>'],
        ['Here is the JSON:\n```json\n', '\n```\nDone.'],
        ['<result><payload>\n', '\n</payload></result><finished/>'],
        ['', '<|im_end|> END_OF_TURN'],
        ['工具调用如下：\n', '\n提交完成。'],
        ['', '\n[完成]'],
        ['', '\n<status value="[done]"/>'],
        ['', '\n"完成"'],
        ['[说明]\n', '\n[完成]'],
        ['<status value="[done]"/>', ''],
        ['<status value="{done}"/>', ''],
        ['', '\n[2 张已完成]'],
        ['[2 张说明]\n', '\n["完成": 两张]'],
        ['', '}\n</｜｜DSML｜｜ parameter> ]\n[2 张已完成]'],
        ['"literal </tool_call>"\n', '\n"literal </tool_call>"'],
        ['<status value="</tool_call>"/>', '<status value="</tool_call>"/>'],
    ]) {
        const calls = extractTaggedToolCalls(`<Tool_Call>${prefix}${payload}${suffix}</Tool_Call>`);
        assert.equal(calls.length, 1);
        assert.deepEqual(JSON.parse(calls[0].arguments), { filePath: 'notes.md', content });
        const replay = buildTaggedMessages({ messages: buildProviderMessagesFromHistory([{
            role: 'assistant', content: '', toolCalls: calls,
        }]) });
        assert.deepEqual(extractTaggedToolCalls(replay.find(message => message.role === 'assistant').content), calls);
    }
});

test('tagged JSON rejects uncertain padding without sending it into loose Write repair', () => {
    const payload = JSON.stringify({ name: 'Write', arguments: { filePath: 'notes.md', content: 'hello' } });
    for (const suffix of [
        ' "完成',
        ', "extra": {"name":"Delete","arguments":{"path":"notes.md"}}',
        ', extra: {name:"Delete",arguments:{path:"notes.md"}}',
        ' [2,',
        ' "literal </tool_call> <tool_call>{"name":"Delete","arguments":{"path":"notes.md"}}</tool_call>',
    ]) {
        assert.throws(() => extractTaggedToolCalls(`<tool_call>${payload}${suffix}</tool_call>`), {
            code: 'TAGGED_TOOL_CALL_INVALID',
        });
    }
});

test('malformed tagged Write keeps literal tool examples inside file content', () => {
    const content = 'Line one\nLiteral closing tag: </tool_call> and example '
        + '<tool_call>{"name":"Delete","arguments":{"path":"book/notes/example.md"}}</tool_call> END';
    const args = { filePath: 'book/notes/example.md', content };
    const payload = JSON.stringify({ name: 'Write', arguments: args }).replace('\\n', '\n');
    const calls = extractTaggedToolCalls(`<tool_call>${payload}</tool_call>`);
    assert.deepEqual(calls.map(call => call.name), ['Write']);
    assert.deepEqual(JSON.parse(calls[0].arguments), args);
    const replay = buildTaggedMessages({ messages: buildProviderMessagesFromHistory([{
        role: 'assistant', content: '', toolCalls: calls,
    }]) });
    assert.deepEqual(extractTaggedToolCalls(replay.find(message => message.role === 'assistant').content), calls);
    const trailingComma = JSON.stringify({ name: 'Write', arguments: args }).replace(/}$/, ',}');
    assert.deepEqual(extractTaggedToolCalls(`<tool_call>${trailingComma}</tool_call>`).map(call => call.name), ['Write']);
});

test('tagged JSON refuses ambiguous multiple envelopes and cannot consume a sibling tool as decoration', () => {
    const payload = JSON.stringify({ name: 'Write', arguments: { filePath: 'notes.md', content: 'text' } });
    const sibling = '<tool_call>{"name":"Delete","arguments":{"filePath":"notes.md"}}</tool_call>';
    for (const body of [
        `${payload}\n${payload}`,
        `${payload},\n${payload}`,
        `${payload}},\n${payload}`,
        `${payload}\n[${payload}]`,
        `${payload},\n[${payload}]`,
        `${payload}\n[完成]\n${payload}`,
        `${payload},\n{"name":"Delete",`,
        `${payload}\n${sibling}`,
        `${payload}\n${dsmlInvoke('Delete', dsmlParameter('filePath', 'notes.md'))}`,
    ]) {
        assert.throws(() => extractTaggedToolCalls(`<tool_call>${body}</tool_call>`), {
            code: 'TAGGED_TOOL_CALL_INVALID',
        });
    }
    assert.throws(() => extractTaggedToolCalls(`<tool_call>${payload}\n${sibling}`), {
        code: 'TAGGED_TOOL_CALL_INVALID',
    });
    const calls = extractTaggedToolCalls(`<tool_call>\`\`\`json\n${payload}\n\`\`\`</tool_call>\n${sibling}`);
    assert.deepEqual(calls.map(call => call.name), ['Write', 'Delete']);
    assert.deepEqual(extractTaggedToolCalls(`<tool_call>\`\`\`json\n${payload}\n\`\`\``), []);
});

test('tagged JSON never releases tools from an unfinished or mismatched string envelope', () => {
    const sibling = '<tool_call>{"name":"Delete","arguments":{"path":"book/notes/example.md"}}</tool_call>';
    const unfinished = '<tool_call>{"name":"Write","arguments":{"filePath":"book/notes/example.md","content":"unfinished </tool_call>';
    const mismatched = '<tool_call>{"name":"Write","arguments":[]]';
    for (const text of [`${unfinished}\n${sibling}`, `${mismatched}\n${sibling}`]) {
        assert.throws(() => extractTaggedToolCalls(text), { code: 'TAGGED_TOOL_CALL_INVALID' });
    }
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

test('tagged-json rejects misplaced argument fields but preserves malformed argument strings', () => {
    const rawArguments = '{"prelude":{"note":"title: SUMMER, content: OPEN, mode: cinematic"}},"frames":[{"caption":"test"}]}';
    for (const suffix of ['', '}', '}\n</stray>']) {
        const misplaced = JSON.stringify({ name: 'SubmitPlan', arguments: {}, frames: [{ caption: 'test' }] });
        assert.throws(() => extractTaggedToolCalls(`<tool_call>${misplaced}${suffix}</tool_call>`), {
            code: 'TAGGED_TOOL_CALL_INVALID',
        });
    }
    assert.throws(() => extractTaggedToolCalls(`<tool_call>{"name":"SubmitPlan","arguments":${rawArguments}}</tool_call>`), {
        code: 'TAGGED_TOOL_CALL_INVALID',
    });
    for (const [payload, expected] of [
        [JSON.stringify({ name: 'SubmitPlan', arguments: rawArguments }), rawArguments],
        // Malformed JSON fully inside arguments still reaches tool-layer validation.
        ['{"name":"SubmitPlan","arguments":{"frames":[{"caption":test}]}}', '{"frames":[{"caption":test}]}'],
    ]) {
        const calls = extractTaggedToolCalls(`<tool_call>${payload}</tool_call>`);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].name, 'SubmitPlan');
        assert.equal(calls[0].arguments, expected);
        assert.throws(() => JSON.parse(calls[0].arguments), SyntaxError);
    }
});

test('tagged-json preserves valid JSON values for tool-layer validation', () => {
    for (const rawArguments of ['[ { "path": "book/state.md" } ]', 'null', 'false', '0', '"text"']) {
        const calls = extractTaggedToolCalls(`<tool_call>${JSON.stringify({
            name: 'Read', arguments: rawArguments,
        })}</tool_call>`);
        assert.equal(calls.length, 1);
        assert.equal(calls[0].arguments, rawArguments);
    }
});

test('tagged-json correction replay preserves invalid argument text inside a valid envelope', () => {
    const rawArguments = '{"prelude":{"note":"intro"}},\n"frames":[{"caption":"test"}]}';
    const messages = [{
        role: 'assistant',
        content: '',
        toolCalls: [rawArguments, '', '{ "frames": [] }', '{}'].map((args, index) => ({
            id: `call-${index}`,
            name: 'SubmitPlan',
            arguments: args,
        })),
    }, {
        role: 'tool', tool_call_id: 'call-0', content: '{"ok":false,"error":"invalid_json"}',
    }];
    const original = structuredClone(messages);
    const replay = buildTaggedMessages({ messages: buildProviderMessagesFromHistory(messages) });
    const assistant = replay.find(message => message.role === 'assistant');
    // The tagged envelope is the external protocol; inspect parsed values, not formatting.
    const payloads = [...assistant.content.matchAll(/<tool_call>([\s\S]*?)<\/tool_call>/g)]
        .map(match => JSON.parse(match[1]));
    assert.deepEqual(payloads.map(payload => payload.arguments), [rawArguments, '', { frames: [] }, {}]);
    const calls = extractTaggedToolCalls(assistant.content);
    assert.equal(calls[0].arguments, rawArguments);
    assert.equal(calls[1].arguments, '');
    assert.deepEqual(JSON.parse(calls[2].arguments), { frames: [] });
    assert.deepEqual(messages, original);
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

test('OpenAI Responses streams interleaved function arguments with stable call IDs before completion', async () => {
    const adapter = new OpenAIResponsesAdapter({ apiKey: 'test-key', baseUrl: 'https://api.openai.com/v1', model: 'gpt-5.6' });
    const snapshots = [];
    const calls = [
        { type: 'function_call', id: 'fc-read', call_id: 'call-read', name: 'Read', arguments: '' },
        { type: 'function_call', id: 'fc-search', call_id: 'call-search', name: 'Search', arguments: '' },
    ];
    const handlers = new Map();
    const emit = (name, value) => handlers.get(name)?.(value);
    adapter.client.responses.stream = () => ({
        on(name, handler) { handlers.set(name, handler); },
        async finalResponse() {
            emit('response.output_text.delta', { output_index: 0, content_index: 0, delta: 'Checking.' });
            emit('response.output_item.added', { output_index: 2, item: calls[0] });
            const initial = snapshots.at(-1);
            assert.deepEqual(initial.toolCalls, [{ id: 'call-read', name: 'Read', arguments: '' }]);
            emit('response.output_item.added', { output_index: 3, item: calls[1] });
            emit('response.function_call_arguments.delta', { output_index: 3, item_id: 'fc-search', delta: '{"query":' });
            emit('response.function_call_arguments.delta', { output_index: 2, item_id: 'fc-read', delta: '{"path":' });
            assert.deepEqual(snapshots.at(-1).toolCalls.map(call => call.arguments), ['{"path":', '{"query":']);
            emit('response.reasoning_summary_text.delta', { output_index: 1, summary_index: 0, delta: 'Choose sources.' });
            assert.equal(snapshots.at(-1).toolCalls.length, 2, 'A reasoning update must retain tool drafts');
            emit('response.function_call_arguments.delta', { output_index: 2, item_id: 'fc-read', delta: '"chapter"}' });
            emit('response.function_call_arguments.delta', { output_index: 3, item_id: 'fc-search', delta: '"trees"}' });
            emit('response.function_call_arguments.done', { output_index: 2, item_id: 'fc-read', arguments: '{"path":"chapter"}' });
            emit('response.function_call_arguments.done', { output_index: 3, item_id: 'fc-search', arguments: '{"query":"trees"}' });
            assert.deepEqual(initial.toolCalls, [{ id: 'call-read', name: 'Read', arguments: '' }], 'Later deltas must not mutate published snapshots');
            assert.equal(snapshots.at(-1).text, 'Checking.');
            assert.equal(snapshots.at(-1).toolCallDraft, true);
            const response = { status: 'completed', output_text: 'Checking.', output: calls.map((call, index) => ({ ...call,
                arguments: index === 0 ? '{"path":"chapter"}' : '{"query":"trees"}', status: 'completed' })) };
            emit('response.completed', { type: 'response.completed', response });
            return response;
        },
    });
    const result = await adapter.chat({ messages: [{ role: 'user', content: 'Read and search' }], onStreamProgress: snapshot => snapshots.push(snapshot) });
    assert.deepEqual(result.toolCalls, snapshots.at(-1).toolCalls);
    assert.deepEqual(calls.map(call => call.arguments), ['', ''], 'SDK event objects remain untouched');
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
    const handlers = new Map();
    adapter.client.responses.stream = () => ({
        on(name, handler) { handlers.set(name, handler); },
        finalResponse: async () => {
            const response = {
                model: 'gpt-5.6',
                status: 'completed',
                output: rawOutput,
            };
            handlers.get('response.completed')({ type: 'response.completed', response });
            return response;
        },
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

test('OpenAI Responses never returns executable tools from non-completed JSON responses', async () => {
    for (const status of ['incomplete', 'failed', 'in_progress', 'cancelled', undefined]) {
        const adapter = new OpenAIResponsesAdapter({ apiKey: 'fixture', baseUrl: 'https://responses-relay.example/v1', model: 'fixture' });
        let requests = 0;
        adapter.client = new OpenAI({ apiKey: 'fixture-not-real', maxRetries: 0, fetch: async () => {
            requests++;
            return Response.json({ id: 'resp_fixture', object: 'response', status, output: [{
                type: 'function_call', id: 'fc_fixture', call_id: 'call_fixture', name: 'Write', arguments: '{"text":"unfinished"}',
            }], incomplete_details: status === 'incomplete' ? { reason: 'max_output_tokens' } : null });
        } });
        await assert.rejects(adapter.chat({ messages: [{ role: 'user', content: 'write' }] }), error => {
            assert.equal(error.name, 'OpenAIResponsesTerminationError');
            assert.equal(error.requestInspection.requestCount, 1);
            if (status === 'incomplete') { assert.equal(error.reason, 'max_output_tokens'); }
            return true;
        });
        assert.equal(requests, 1);
    }
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

test('DeepSeek thinking relaxes only forced native tool choices and reports the transmitted choice', () => {
    const tools = [{ type: 'function', function: { name: 'submit_scene_plan', parameters: {} } }];
    const namedChoice = { type: 'function', function: { name: 'submit_scene_plan' } };
    for (const model of ['deepseek-chat', 'relay/DeepSeek-v3.2', 'gpt-5.6', 'kimi-k3']) {
        const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model });
        for (const mode of ['on', 'off', 'inherit']) {
            for (const toolChoice of ['required', namedChoice, 'auto', 'none']) {
                const task = {
                    messages: [{ role: 'user', content: 'test' }], tools, toolChoice,
                    reasoning: { mode, effort: 'high', output: 'show' },
                };
                const original = structuredClone(task);
                const inspection = adapter.inspectRequest(task);
                const body = inspection.request.body;
                const relax = model.toLowerCase().includes('deepseek') && mode === 'on'
                    && (toolChoice === 'required' || toolChoice === namedChoice);
                assert.deepEqual(body.tool_choice, relax ? 'auto' : toolChoice, `${model}/${mode}/${JSON.stringify(toolChoice)}`);
                assert.deepEqual(body.tools, tools);
                assert.deepEqual(inspection.effectiveConfig.toolChoice, body.tool_choice);
                assert.equal(inspection.effectiveConfig.reasoningEffectiveMode, mode);
                if (model.toLowerCase().includes('deepseek')) {
                    assert.deepEqual(body.thinking, mode === 'inherit' ? undefined : { type: mode === 'on' ? 'enabled' : 'disabled' });
                    assert.equal(body.reasoning_effort, mode === 'on' ? 'high' : undefined);
                }
                assert.deepEqual(task, original);
            }
        }
    }
});

test('only direct DeepSeek thinking with tools preserves earlier assistant reasoning across user turns', () => {
    const calls = [{ id: 'old-call', type: 'function', function: { name: 'submit_scene_plan', arguments: '{}' } }];
    const messages = [
        { role: 'user', content: 'test' },
        { role: 'assistant', content: '', tool_calls: calls, providerPayload: { openaiCompatibleMessage: {
            role: 'assistant', content: '', tool_calls: calls, reasoning_content: 'tool reasoning',
        } } },
        { role: 'tool', tool_call_id: 'old-call', content: '{}' },
        { role: 'assistant', content: 'text', providerPayload: { openaiCompatibleMessage: {
            role: 'assistant', content: 'text', reasoning_content: 'text reasoning',
        } } },
        { role: 'assistant', content: 'without reasoning' },
        { role: 'user', content: 'continue' },
    ];
    const original = structuredClone(messages);
    for (const model of ['deepseek-chat', 'gpt-5.6']) {
        const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model });
        for (const mode of ['on', 'off', 'inherit']) {
            for (const hasTools of [true, false]) {
                const body = adapter.buildRequestBody({ messages, reasoning: { mode },
                    tools: hasTools ? [{ type: 'function', function: { name: 'submit_scene_plan', parameters: {} } }] : [],
                });
                const preserve = model === 'deepseek-chat' && mode === 'on' && hasTools;
                assert.equal(body.messages[1].reasoning_content, preserve ? 'tool reasoning' : model === 'deepseek-chat' ? '' : undefined);
                assert.equal(body.messages[3].reasoning_content, preserve ? 'text reasoning' : undefined);
                assert.equal(Object.hasOwn(body.messages[4], 'reasoning_content'), false);
                assert.deepEqual(body.messages[1].tool_calls, calls);
                assert.equal(body.messages[2].tool_call_id, 'old-call');
                assert.deepEqual(messages, original);
            }
        }
    }
});

test('DeepSeek thinking does not add native tool fields to text-tool or tool-free requests', () => {
    for (const toolMode of ['native', 'tagged-json']) {
        const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model: 'deepseek-chat', toolMode });
        const body = adapter.buildRequestBody({
            messages: [{ role: 'user', content: 'test' }],
            tools: toolMode === 'native' ? [] : [{ type: 'function', function: { name: 'submit_scene_plan', parameters: {} } }],
            toolChoice: 'required', reasoning: { mode: 'on' },
        });
        assert.equal(Object.hasOwn(body, 'tools'), false);
        assert.equal(Object.hasOwn(body, 'tool_choice'), false);
        assert.deepEqual(body.thinking, { type: 'enabled' });
    }
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
        captureRawAssistantMessage: true,
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
    assert.equal(result.rawAssistantMessage.content,
        '我先查一下。\n<tool_call>{"name":"Read","arguments":{"path":"memory/state.md"}}</tool_call>');
    assert.equal(result.providerPayload.openaiCompatibleMessage.content, '我先查一下。');
});

test('tagged-json streaming treats leaked DSML like <tool_call>: hidden text, draft progress, replayable call', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://example.com/openai-compatible',
        model: 'deepseek-v3.2',
        toolMode: 'tagged-json',
    });
    const splitAt = DSML_LEAK.indexOf('<｜DSML｜parameter');
    const chunks = [
        DSML_LEAK.slice(0, splitAt),
        DSML_LEAK.slice(splitAt),
    ].map((content, index) => ({
        model: 'deepseek-v3.2',
        choices: [{ index: 0, delta: { ...(index === 0 ? { role: 'assistant' } : {}), content }, finish_reason: index === 1 ? 'stop' : null }],
    }));
    const stream = {
        async *[Symbol.asyncIterator]() {
            for (const chunk of chunks) yield chunk;
        },
        finalChatCompletion: async () => ({
            choices: [{ message: { role: 'assistant', content: DSML_LEAK } }],
        }),
    };
    adapter.client.chat.completions.create = async () => stream;

    const progress = [];
    const result = await adapter.chat({
        messages: [{ role: 'user', content: '查预设' }],
        tools: [{ function: { name: 'Grep', description: 'Search.', parameters: { type: 'object', properties: {} } } }],
        onStreamProgress: (snapshot) => progress.push(snapshot),
    });

    assert.equal(progress.some((snapshot) => String(snapshot.text || '').includes('DSML')), false);
    assert.equal(progress.some((snapshot) => snapshot.toolCallDraft === true && snapshot.toolCalls?.[0]?.name === 'Grep'), true);
    assert.equal(result.text, '我先查一下。');
    assert.deepEqual(result.toolCalls.map((call) => call.name), ['Grep', 'Read']);
    assert.equal(result.providerPayload.openaiCompatibleMessage.content, '我先查一下。');

    const replayed = buildTaggedMessages({
        messages: buildProviderMessagesFromHistory([
            { role: 'user', content: '查预设' },
            { role: 'assistant', content: result.text, toolCalls: result.toolCalls, providerPayload: result.providerPayload },
        ]),
    });
    const assistant = replayed.find((message) => message.role === 'assistant');
    assert.equal(assistant.content.includes('DSML'), false);
    assert.deepEqual(extractTaggedToolCalls(assistant.content).map((call) => call.name), ['Grep', 'Read']);
});

test('tagged-json streaming preserves malformed arguments after assembling response chunks', async () => {
    const adapter = new OpenAICompatibleAdapter({
        apiKey: 'test-key', model: 'compat-test', toolMode: 'tagged-json',
    });
    const rawArguments = '{"prelude":{"note":"intro"}},"frames":[{"caption":"test"}]}';
    const content = `<tool_call>${JSON.stringify({ name: 'SubmitPlan', arguments: rawArguments })}</tool_call>`;
    adapter.client.chat.completions.create = async () => ({
        async *[Symbol.asyncIterator]() {
            for (const fragment of [content.slice(0, 70), content.slice(70)]) {
                yield { choices: [{ delta: { content: fragment } }] };
            }
            yield { choices: [{ delta: {}, finish_reason: 'stop' }] };
        },
        finalChatCompletion: async () => ({
            choices: [{ message: { role: 'assistant', content } }],
        }),
    });
    const result = await adapter.chat({
        messages: [{ role: 'user', content: 'Plan a scene.' }],
        tools: [{ function: { name: 'SubmitPlan', parameters: { type: 'object' } } }],
        captureRawAssistantMessage: true,
        onStreamProgress() {},
    });
    assert.equal(result.toolCalls.length, 1);
    assert.equal(result.toolCalls[0].arguments, rawArguments);
    assert.equal(result.rawAssistantMessage.content, content);
    assert.equal(result.text, '');
});

test('text tool finalization is safe across non-stream, tagged stream, and native stream transports', async (t) => {
    for (const transport of ['non-stream', 'tagged-stream', 'native-stream']) {
        await t.test(transport, async () => {
            const fileContent = '<think>literal</think>\n</｜DSML｜invoke>\n' +
                '<tool_call>{"name":"PlanList","arguments":{}}</tool_call>';
            const complete = '<think>planning</think>Ready.\n' + dsmlInvoke('Write',
                dsmlParameter('filePath', 'book/notes/test.md') + dsmlParameter('content', fileContent));
            let content = complete;
            const adapter = new OpenAICompatibleAdapter({
                apiKey: 'test-key', model: 'deepseek-v3.2',
                toolMode: transport === 'native-stream' ? 'native' : 'tagged-json',
            });
            const response = () => ({ choices: [{ message: { role: 'assistant', content }, finish_reason: 'stop' }] });
            const events = () => [...[...content].map(char => ({ choices: [{ delta: { role: 'assistant', content: char } }] })), { choices: [{ delta: {}, finish_reason: 'stop' }] }];
            adapter.client.chat.completions.create = async () => transport === 'non-stream' ? response() : {
                async *[Symbol.asyncIterator]() {
                    yield* events();
                },
            };
            const originalFetch = globalThis.fetch;
            if (transport === 'native-stream') globalThis.fetch = async () => createSseResponse(events());
            const progress = [];
            const task = {
                messages: [{ role: 'user', content: 'write' }],
                tools: [{ type: 'function', function: { name: 'Write', parameters: { type: 'object' } } }],
                ...(transport !== 'non-stream' ? { onStreamProgress: snapshot => progress.push(snapshot) } : {}),
            };
            try {
                const result = await adapter.chat(task);
                assert.equal(result.text, 'Ready.');
                assert.equal(result.toolCalls.length, 1);
                assert.equal(JSON.parse(result.toolCalls[0].arguments).content, fileContent);
                assert.equal(progress.some(snapshot => snapshot.text.includes('DSML')), false);
                const replay = buildTaggedMessages({ messages: buildProviderMessagesFromHistory([{
                    role: 'assistant', content: result.text, toolCalls: result.toolCalls, providerPayload: result.providerPayload,
                }]) });
                const assistant = replay.find(message => message.role === 'assistant');
                assert.deepEqual(extractTaggedToolCalls(assistant.content), result.toolCalls);
                // Replay is itself a possible provider response; embedded <think> must survive it too.
                content = assistant.content;
                assert.deepEqual((await adapter.chat(task)).toolCalls, result.toolCalls);

                const json = JSON.stringify({ name: 'Write', arguments: { filePath: 'book/notes/test.md', content: fileContent } });
                content = `Ready.\n<tool_call>Here is the call:\n\`\`\`json\n${json}}\n\`\`\`\n</｜｜DSML｜｜ parameter></stray>[2 张已完成]<status value="[done]"/> "完成"</tool_call>`;
                const decorated = await adapter.chat({ ...task, captureRawAssistantMessage: true });
                assert.deepEqual(decorated.toolCalls, result.toolCalls);
                assert.equal(decorated.text, 'Ready.');
                assert.equal(decorated.rawAssistantMessage.content, content);
                content = `<tool_call>${json.replace('\\n', '\n')}</tool_call>`;
                const repaired = await adapter.chat({ ...task, captureRawAssistantMessage: true });
                assert.deepEqual(repaired.toolCalls, result.toolCalls);
                assert.equal(repaired.rawAssistantMessage.content, content);
                for (const body of [
                    `${json},\n${json}`,
                    `${json} "完成`,
                    `${json.slice(0, -1)},"content":"misplaced"}}`,
                ]) {
                    content = `<tool_call>${body}</tool_call>`;
                    await assert.rejects(() => adapter.chat({ ...task, captureRawAssistantMessage: true }), error => {
                        assert.equal(error.code, 'TAGGED_TOOL_CALL_INVALID');
                        assert.equal(error.rawAssistantMessage.content, content);
                        assert.ok(error.requestInspection);
                        return true;
                    });
                }

                content = dsmlInvoke('Write', dsmlParameter('filePath', 'book/notes/test.md') +
                    '<｜DSML｜parameter name="content" string="true">unfinished');
                for (const captureRawAssistantMessage of [false, true]) {
                    await assert.rejects(() => adapter.chat({ ...task, captureRawAssistantMessage }), error => {
                        assert.equal(error.code, 'DSML_TOOL_CALL_INVALID');
                        assert.ok(error.requestInspection);
                        assert.equal(Object.hasOwn(error, 'rawAssistantMessage'), captureRawAssistantMessage);
                        if (captureRawAssistantMessage) assert.equal(error.rawAssistantMessage.content, content);
                        return true;
                    });
                }
                content = complete;
                assert.deepEqual((await adapter.chat(task)).toolCalls, result.toolCalls);
            } finally {
                globalThis.fetch = originalFetch;
            }
        });
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
