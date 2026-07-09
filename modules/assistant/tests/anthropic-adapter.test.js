import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

import { AnthropicAdapter, buildAnthropicMessages } from '../../agent-core/adapters/anthropic.js';

test('Anthropic adapter groups consecutive tool results into one user message', () => {
    const messages = buildAnthropicMessages([
        { role: 'user', content: 'read two files' },
        {
            role: 'assistant',
            content: 'I will read them.',
            providerPayload: {
                anthropicContent: [
                    { type: 'text', text: 'I will read them.' },
                    { type: 'tool_use', id: 'call-1', name: 'Read', input: { filePath: 'book/one.md' } },
                    { type: 'tool_use', id: 'call-2', name: 'Read', input: { filePath: 'book/two.md' } },
                ],
            },
            tool_calls: [
                {
                    id: 'call-1',
                    type: 'function',
                    function: { name: 'Read', arguments: '{"filePath":"book/one.md"}' },
                },
                {
                    id: 'call-2',
                    type: 'function',
                    function: { name: 'Read', arguments: '{"filePath":"book/two.md"}' },
                },
            ],
        },
        { role: 'tool', tool_call_id: 'call-1', content: '{"ok":true,"content":"one"}' },
        { role: 'tool', tool_call_id: 'call-2', content: '{"ok":true,"content":"two"}' },
    ]);

    assert.equal(messages.length, 3);
    assert.equal(messages[1].role, 'assistant');
    assert.equal(messages[1].content.filter((block) => block.type === 'tool_use').length, 2);
    assert.deepEqual(messages[2], {
        role: 'user',
        content: [
            { type: 'tool_result', tool_use_id: 'call-1', content: '{"ok":true,"content":"one"}' },
            { type: 'tool_result', tool_use_id: 'call-2', content: '{"ok":true,"content":"two"}' },
        ],
    });
});

test('Anthropic adapter prefers repaired top-level tool arguments over raw preserved tool input', () => {
    const messages = buildAnthropicMessages([
        { role: 'user', content: 'write file' },
        {
            role: 'assistant',
            content: '',
            providerPayload: {
                anthropicContent: [
                    { type: 'text', text: 'I will write it.' },
                    { type: 'tool_use', id: 'call-write', name: 'Write', input: {} },
                ],
            },
            tool_calls: [{
                id: 'call-write',
                type: 'function',
                function: {
                    name: 'Write',
                    arguments: '{"filePath":"book/chapters/001.md","content":"正文"}',
                },
            }],
        },
        { role: 'tool', tool_call_id: 'call-write', content: '{"ok":true}' },
    ]);

    assert.equal(messages[1].role, 'assistant');
    assert.deepEqual(messages[1].content, [
        { type: 'text', text: 'I will write it.' },
        {
            type: 'tool_use',
            id: 'call-write',
            name: 'Write',
            input: {
                filePath: 'book/chapters/001.md',
                content: '正文',
            },
        },
    ]);
});

test('Anthropic adapter keeps a single tool result immediately after the tool use message', () => {
    const messages = buildAnthropicMessages([
        { role: 'user', content: 'read file' },
        {
            role: 'assistant',
            content: '',
            tool_calls: [{
                id: 'call-1',
                type: 'function',
                function: { name: 'Read', arguments: '{"filePath":"book/one.md"}' },
            }],
        },
        { role: 'tool', tool_call_id: 'call-1', content: '{"ok":true,"content":"one"}' },
        { role: 'assistant', content: 'Done.' },
    ]);

    assert.equal(messages.length, 4);
    assert.equal(messages[1].role, 'assistant');
    assert.equal(messages[2].role, 'user');
    assert.deepEqual(messages[2].content, [
        { type: 'tool_result', tool_use_id: 'call-1', content: '{"ok":true,"content":"one"}' },
    ]);
    assert.equal(messages[3].content[0].text, 'Done.');
});

test('Anthropic adapter streams tool draft arguments from input_json_delta events', async () => {
    const adapter = new AnthropicAdapter({
        apiKey: 'test-key',
        baseUrl: 'https://anthropic.example',
        model: 'claude-test',
    });
    const progress = [];
    adapter.client.messages.stream = () => {
        const stream = new EventEmitter();
        stream.finalMessage = async () => {
            stream.emit('text', 'I will read it.', 'I will read it.');
            stream.emit('streamEvent', {
                type: 'content_block_start',
                index: 1,
                content_block: { type: 'tool_use', id: 'call-read', name: 'Read', input: {} },
            });
            stream.emit('streamEvent', {
                type: 'content_block_delta',
                index: 1,
                delta: { type: 'input_json_delta', partial_json: '{"filePath":"memory/state.md"}' },
            });
            return {
                model: 'claude-test',
                stop_reason: 'tool_use',
                content: [
                    { type: 'text', text: 'I will read it.' },
                    { type: 'tool_use', id: 'call-read', name: 'Read', input: { filePath: 'memory/state.md' } },
                ],
            };
        };
        return stream;
    };

    const result = await adapter.chat({
        messages: [{ role: 'user', content: 'read state' }],
        tools: [{
            function: {
                name: 'Read',
                description: 'Read memory.',
                parameters: { type: 'object', properties: { filePath: { type: 'string' } } },
            },
        }],
        onStreamProgress: (snapshot) => progress.push(snapshot),
    });

    assert.equal(progress.some((snapshot) => snapshot.toolCallDraft === true), true);
    assert.equal(progress.some((snapshot) => snapshot.toolCalls?.[0]?.name === 'Read'), true);
    assert.equal(progress.some((snapshot) => String(snapshot.toolCalls?.[0]?.arguments || '').includes('memory/state.md')), true);
    assert.equal(progress.some((snapshot) => String(snapshot.text || '').includes('I will read it.')), true);
    assert.deepEqual(result.toolCalls, [{
        id: 'call-read',
        name: 'Read',
        arguments: '{"filePath":"memory/state.md"}',
    }]);
});
