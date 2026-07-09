import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildProviderMessagesFromHistory,
    filterThoughtsForTurn,
    mergeThoughtBlocks,
    resolveResultToolCalls,
} from '../../agent-core/runtime/protocol.js';

test('agent protocol maps stored tool-call history into provider messages', () => {
    const providerMessages = buildProviderMessagesFromHistory([
        { role: 'user', content: '读取文件', contextPrefix: '[Current context]\n...' },
        {
            role: 'assistant',
            content: '我先读取。',
            providerPayload: { replay: true },
            toolCalls: [{
                id: 'call-read',
                name: 'Read',
                arguments: '{"filePath":"local/a.md"}',
            }],
        },
        {
            role: 'tool',
            toolCallId: 'call-read',
            toolName: 'Read',
            content: '{"ok":true,"content":"demo"}',
        },
    ], {
        buildUserContent: (message) => [message.contextPrefix, message.content].filter(Boolean).join('\n\n'),
    });

    assert.deepEqual(providerMessages, [
        { role: 'user', providerPayload: undefined, content: '[Current context]\n...\n\n读取文件' },
        {
            role: 'assistant',
            content: '我先读取。',
            providerPayload: { replay: true },
            tool_calls: [{
                id: 'call-read',
                type: 'function',
                function: {
                    name: 'Read',
                    arguments: '{"filePath":"local/a.md"}',
                },
            }],
        },
        {
            role: 'tool',
            tool_call_id: 'call-read',
            toolName: 'Read',
            content: '{"ok":true,"content":"demo"}',
        },
    ]);
});

test('agent protocol omits empty internal tool names from provider messages', () => {
    const providerMessages = buildProviderMessagesFromHistory([
        {
            role: 'tool',
            toolCallId: 'call-empty',
            content: '{}',
        },
    ]);

    assert.deepEqual(providerMessages, [{
        role: 'tool',
        tool_call_id: 'call-empty',
        content: '{}',
    }]);
});

test('agent protocol recognizes Google providerPayload function calls', () => {
    const toolCalls = resolveResultToolCalls({
        provider: 'google',
        providerPayload: {
            googleContent: {
                role: 'model',
                parts: [{
                    functionCall: {
                        id: 'google-read',
                        name: 'Read',
                        args: { filePath: 'book/outline.md' },
                    },
                }],
            },
        },
    }, {});

    assert.deepEqual(toolCalls, [{
        id: 'google-read',
        name: 'Read',
        arguments: '{"filePath":"book/outline.md"}',
    }]);
});

test('agent protocol repairs malformed raw Write arguments before execution', () => {
    const toolCalls = resolveResultToolCalls({
        provider: 'sillytavern-claude',
        toolCalls: [{
            id: 'claude-write',
            name: 'Write',
            arguments: [
                '{"filePath":"book/chapters/001.md","content":"她说："回来。"',
                '第二行"}',
            ].join('\n'),
        }],
    }, {});

    assert.equal(toolCalls.length, 1);
    assert.equal(toolCalls[0].id, 'claude-write');
    assert.equal(toolCalls[0].name, 'Write');
    assert.deepEqual(JSON.parse(toolCalls[0].arguments), {
        filePath: 'book/chapters/001.md',
        content: '她说："回来。"\n第二行',
    });
});

test('agent protocol does not treat key-like text inside Write content as arguments', () => {
    const toolCalls = resolveResultToolCalls({
        toolCalls: [{
            id: 'claude-write-key-text',
            name: 'Write',
            arguments: '{"filePath":"book/chapters/001.md","content":"正文里出现 "path":"不是字段"，后面还要保留"}',
        }],
    }, {});

    assert.deepEqual(JSON.parse(toolCalls[0].arguments), {
        filePath: 'book/chapters/001.md',
        content: '正文里出现 "path":"不是字段"，后面还要保留',
    });
});

test('agent protocol normalizes and filters thought blocks per turn', () => {
    const normalized = mergeThoughtBlocks(
        [{ label: '思考块', text: '先读取。' }],
        [{ label: '思考块', text: '先读取。' }, { label: '推理摘要', text: '需要改。' }],
    );
    assert.deepEqual(normalized, [
        { label: '思考块', text: '先读取。' },
        { label: '推理摘要', text: '需要改。' },
    ]);

    const filtered = filterThoughtsForTurn(normalized, [{
        role: 'assistant',
        thoughts: [{ label: '思考块', text: '先读取。' }],
    }]);

    assert.deepEqual(filtered, [
        { label: '推理摘要', text: '需要改。' },
    ]);
});
