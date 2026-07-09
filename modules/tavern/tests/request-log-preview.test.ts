import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRequestLogPreview, displayRequestLogContent, segmentRequestLogText } from '../app-src/utils/request-log-preview';

test('request log preview parses a top-level messages array', () => {
    const preview = buildRequestLogPreview(JSON.stringify([
        { role: 'system', content: 'Rules first.' },
        { role: 'model', content: 'Understood.' },
    ]));

    assert.equal(preview.parseError, '');
    assert.deepEqual(preview.messages.map((message) => message.role), ['system', 'assistant']);
    assert.deepEqual(preview.messages.map((message) => message.roleLabel), ['SYSTEM', 'ASSISTANT']);
    assert.equal(preview.messages[0]?.contentText, 'Rules first.');
    assert.ok(preview.chips.includes('23 chars'));
    assert.deepEqual(preview.requestFieldsBeforeMessages, []);
    assert.deepEqual(preview.requestFieldsAfterMessages, []);
});

test('request log preview splits top-level request fields around messages in source order', () => {
    const preview = buildRequestLogPreview(JSON.stringify({
        model: 'claude-opus-4-6',
        temperature: 0.8,
        messages: [{ role: 'user', content: 'Hello' }],
        tools: [{ name: 'EventPatch' }],
        stream: true,
    }));

    assert.deepEqual(preview.requestFieldsBeforeMessages.map((field) => field.key), ['model', 'temperature']);
    assert.deepEqual(preview.requestFieldsAfterMessages.map((field) => field.key), ['tools', 'stream']);
    assert.equal(preview.messages.length, 1);
    assert.equal(preview.messages[0]?.role, 'user');
});

test('request log preview parses wrapper request body messages without flattening outer metadata', () => {
    const preview = buildRequestLogPreview(JSON.stringify({
        provider: 'openai-compatible',
        transport: 'actual',
        request: {
            url: '/api/backends/chat-completions/generate',
            body: JSON.stringify({
                model: 'little-model',
                messages: [{ role: 'human', content: 'Ping' }],
                tools: [{ type: 'function', function: { name: 'MemoryInspect' } }],
            }),
        },
    }), {
        providerLabel: 'OpenAI 兼容',
        capturedAt: 1730000000000,
    });

    assert.deepEqual(preview.outerFields.map((field) => field.key), ['provider', 'transport']);
    assert.deepEqual(preview.requestFieldsBeforeMessages.map((field) => field.key), ['url', 'body.model']);
    assert.deepEqual(preview.requestFieldsAfterMessages.map((field) => field.key), ['body.tools']);
    assert.equal(preview.messages[0]?.role, 'user');
    assert.equal(preview.chips.includes('OpenAI 兼容'), false);
    assert.ok(preview.chips.includes('4 chars'));
});

test('request log preview chips keep only character count and capture time', () => {
    const preview = buildRequestLogPreview(JSON.stringify({
        provider: 'openai-compatible',
        model: 'claude-opus-4-6',
        request: {
            messages: [{ role: 'user', content: 'Hello' }],
        },
    }), {
        requestKind: 'actual',
        providerLabel: 'OpenAI 兼容',
        model: 'ignored-model',
        presetName: '酒馆 actual',
        messageChars: 12,
        capturedAt: 1730000000000,
    });

    assert.equal(preview.chips[0], '12 chars');
    assert.equal(preview.chips.length, 2);
    assert.match(preview.chips[1] || '', /\d/);
    assert.equal(preview.chips.includes('酒馆 actual'), false);
    assert.equal(preview.chips.includes('1 messages'), false);
    assert.equal(preview.chips.includes('actual'), false);
    assert.equal(preview.chips.includes('OpenAI 兼容'), false);
    assert.equal(preview.chips.includes('ignored-model'), false);
});

test('request log preview renders message content and meta without html strings', () => {
    const preview = buildRequestLogPreview(JSON.stringify({
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Look here.' },
                    { type: 'image_url', image_url: { url: 'data:image/png;base64,abc' } },
                    { type: 'tool_result', content: 'done' },
                ],
            },
            {
                role: 'assistant',
                content: null,
                tool_calls: [{ id: 'call-1', function: { name: 'EventInspect' } }],
            },
        ],
    }));

    assert.equal(preview.messages[0]?.contentText, 'Look here.\n\n[image]\n\n[tool_result]');
    assert.equal(preview.messages[1]?.contentText, 'null');
    assert.deepEqual(preview.messages[0]?.contentSegments.map((segment) => segment.kind), ['text']);
    assert.deepEqual(preview.messages[1]?.metaFields.map((field) => field.key), ['tool_calls']);
    assert.equal(displayRequestLogContent({ type: 'unknown', value: '<tag>' }), '{\n  "type": "unknown",\n  "value": "<tag>"\n}');
});

test('request log preview marks xml tags as text segments without html rendering', () => {
    const preview = buildRequestLogPreview(JSON.stringify({
        messages: [{ role: 'system', content: '<world_info>\nSecret\n</world_info>' }],
    }));

    assert.deepEqual(preview.messages[0]?.contentSegments, [
        { text: '<world_info>', kind: 'xml-tag' },
        { text: '\nSecret\n', kind: 'text' },
        { text: '</world_info>', kind: 'xml-tag' },
    ]);
});

test('request log preview follows message-preview xml angle bracket boundaries', () => {
    assert.deepEqual(segmentRequestLogText('A <tag value="1"> B <3> C'), [
        { text: 'A ', kind: 'text' },
        { text: '<tag value="1">', kind: 'xml-tag' },
        { text: ' B ', kind: 'text' },
        { text: '<3>', kind: 'xml-tag' },
        { text: ' C', kind: 'text' },
    ]);
    assert.deepEqual(segmentRequestLogText('A <tag & bad> B <outer <inner>> C'), [
        { text: 'A <tag & bad> B <outer ', kind: 'text' },
        { text: '<inner>', kind: 'xml-tag' },
        { text: '> C', kind: 'text' },
    ]);
});

test('request log preview returns a parse error state instead of throwing', () => {
    const preview = buildRequestLogPreview('{ bad json');

    assert.match(preview.parseError, /Expected property name|Unexpected token|JSON/);
    assert.deepEqual(preview.chips, ['解析失败']);
    assert.equal(preview.messages.length, 0);
    assert.deepEqual(preview.requestFieldsBeforeMessages.map((field) => field.key), ['raw']);
    assert.equal(preview.requestFieldsBeforeMessages[0]?.text, '{ bad json');
});
