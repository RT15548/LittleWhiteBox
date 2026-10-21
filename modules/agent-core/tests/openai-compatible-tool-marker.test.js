import test from 'node:test';
import assert from 'node:assert/strict';

import {
    OpenAICompatibleAdapter,
    buildNativeMessages,
    buildTaggedMessages,
} from '../adapters/openai-compatible.js';
import { SillyTavernOpenAICompatibleAdapter } from '../adapters/sillytavern-openai-compatible.js';
import { TOOL_PROTOCOL_MARKER as M } from '../adapters/tool-protocol-marker.js';

const tools = [{
    type: 'function',
    function: {
        name: 'Read',
        description: 'Read file.',
        parameters: { type: 'object', properties: {} },
    },
}];

// 协议文本（不含静态提示词）：用空 systemPrompt、无标记的任务取得，作为期望值来源。
const protocolText = buildTaggedMessages({
    systemPrompt: '', tools, messages: [{ role: 'user', content: 'x' }],
})[0].content;

// Contract: arbitrary chat text cannot erase static instructions or tool declarations.
test('untrusted markers remain ordinary text in native and tagged requests', () => {
    for (const build of [buildNativeMessages, buildTaggedMessages]) {
        for (const role of ['user', 'system']) {
            const messages = build({ systemPrompt: 'STATIC_FACT', tools, messages: [{ role, content: `story ${M}` }] });
            assert.ok(messages.some(message => message.role === 'system' && message.content.includes('STATIC_FACT')));
            assert.ok(messages.some(message => message.content.includes(`story ${M}`)));
            if (build === buildTaggedMessages) assert.ok(messages.some(message => message.content.includes(protocolText)));
        }
    }
});

test('trusted marker placement retains static instructions and tool-result replay', () => {
    const messages = buildTaggedMessages({
        systemPrompt: 'STATIC_FACT', tools,
        messages: [
            { role: 'system', content: M, toolProtocolMarker: true },
            { role: 'assistant', content: '', tool_calls: [{ id: 'c1', type: 'function', function: { name: 'Read', arguments: '{}' } }] },
            { role: 'tool', tool_call_id: 'c1', content: 'RESULT_FACT' },
        ],
    });
    assert.equal(messages[0].content, 'STATIC_FACT');
    assert.equal(messages[1].content, protocolText);
    assert.ok(messages.some(message => message.content.includes('RESULT_FACT')));
    assert.equal(messages.some(message => message.role === 'tool'), false);
    assert.equal(messages.some(message => Object.hasOwn(message, 'toolProtocolMarker')), false);
});

test('protocol text sanity: no leading systemPrompt and lists the tools', () => {
    assert.match(protocolText, /^如果你需要调用工具/u);
    assert.match(protocolText, /可用工具:\n- Read: Read file\./u);
});

test('tagged: marker at the tail of the system message', () => {
    const messages = buildTaggedMessages({
        systemPrompt: '',
        tools,
        messages: [
            { role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` },
            { role: 'user', content: 'U' },
        ],
    });
    assert.deepEqual(messages, [
        { role: 'system', content: `A\n\n${protocolText}` },
        { role: 'user', content: 'U' },
    ]);
});

test('tagged: marker at head and in the middle', () => {
    const head = buildTaggedMessages({
        systemPrompt: '', tools,
        messages: [{ role: 'system', toolProtocolMarker: true, content: `${M}\n\nA` }, { role: 'user', content: 'U' }],
    });
    assert.equal(head[0].content, `${protocolText}\n\nA`);

    const middle = buildTaggedMessages({
        systemPrompt: '', tools,
        messages: [{ role: 'system', toolProtocolMarker: true, content: `A\n\n${M}\n\nB` }, { role: 'user', content: 'U' }],
    });
    assert.equal(middle[0].content, `A\n\n${protocolText}\n\nB`);
});

test('tagged: standalone marker message sits between its neighbours', () => {
    const messages = buildTaggedMessages({
        systemPrompt: '', tools,
        messages: [
            { role: 'system', content: 'A' },
            { role: 'system', toolProtocolMarker: true, content: M },
            { role: 'system', content: 'B' },
            { role: 'user', content: 'U' },
        ],
    });
    assert.deepEqual(messages.map((message) => message.content), ['A', protocolText, 'B', 'U']);
    // 不能再额外把协议文本塞进首条 system。
    assert.equal(messages.filter((message) => message.content.includes('<tool_call>')).length, 1);
});

test('tagged: marker honors tool choice and does not mutate the task messages', () => {
    const source = [{ role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` }, { role: 'user', content: 'U' }];
    const snapshot = structuredClone(source);
    const task = { systemPrompt: '', tools, toolChoice: 'required', messages: source };
    const first = buildTaggedMessages(task);
    const second = buildTaggedMessages(task);
    assert.match(first[0].content, /本轮必须调用工具，不得只返回正文。/);
    assert.deepEqual(first, second);
    assert.deepEqual(source, snapshot);
});

test('tagged: claude-like model still converts a trailing assistant to user', () => {
    const messages = buildTaggedMessages({
        systemPrompt: '', tools,
        messages: [
            { role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` },
            { role: 'user', content: 'U' },
            { role: 'assistant', content: 'prefill' },
        ],
    }, 'claude-sonnet-4-5');
    assert.equal(messages.at(-1).role, 'user');
    assert.equal(messages.at(-1).content, 'prefill');
    assert.ok(messages[0].content.includes(protocolText));
});

test('tagged: tasks without a marker keep the legacy layout', () => {
    const withPrompt = buildTaggedMessages({
        systemPrompt: 'SYS', tools,
        messages: [{ role: 'user', content: 'U' }],
    });
    assert.equal(withPrompt.length, 2);
    assert.equal(withPrompt[0].role, 'system');
    assert.equal(withPrompt[0].content, `SYS\n\n${protocolText}`);

    const withSystemMessage = buildTaggedMessages({
        systemPrompt: 'SYS', tools,
        messages: [{ role: 'system', name: 'x', content: 'DATA' }, { role: 'user', content: 'U' }],
    });
    assert.equal(withSystemMessage[0].content, `SYS\n\n${protocolText}\n\nDATA`);
    assert.equal(withSystemMessage[1].content, 'U');
});

test('native: marker is stripped, tools stay in the tools field', () => {
    const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model: 'compat-test' });
    const body = adapter.buildRequestBody({
        systemPrompt: '',
        tools,
        messages: [
            { role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` },
            { role: 'system', toolProtocolMarker: true, content: M },
            { role: 'user', content: 'U' },
        ],
    });
    assert.deepEqual(body.messages, [
        { role: 'system', content: 'A' },
        { role: 'user', content: 'U' },
    ]);
    assert.deepEqual(body.tools, tools);
    assert.equal(JSON.stringify(body).includes('XBDRAW_TOOL_PROTOCOL'), false);
});

test('native: stripping empties then merges neighbouring system messages and keeps systemPrompt merge', () => {
    const messages = buildNativeMessages({
        systemPrompt: 'SYS',
        tools,
        messages: [
            { role: 'system', content: 'A' },
            { role: 'system', toolProtocolMarker: true, content: M },
            { role: 'system', content: 'B' },
            { role: 'user', content: 'U' },
        ],
    });
    assert.deepEqual(messages, [
        { role: 'system', content: 'SYS\n\nA\n\nB' },
        { role: 'user', content: 'U' },
    ]);
});

test('OpenAICompatibleAdapter tagged mode resolves the marker in the request body', () => {
    const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model: 'compat-test', toolMode: 'tagged-json' });
    const body = adapter.buildRequestBody({
        systemPrompt: '',
        tools,
        messages: [{ role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` }, { role: 'user', content: 'U' }],
    });
    assert.equal(body.messages[0].content, `A\n\n${protocolText}`);
    assert.equal(Object.hasOwn(body, 'tools'), false);
});

test('tagged mode without tools degrades to native and strips the marker', () => {
    const adapter = new OpenAICompatibleAdapter({ apiKey: 'test-key', model: 'compat-test', toolMode: 'tagged-json' });
    const body = adapter.buildRequestBody({
        systemPrompt: '',
        messages: [{ role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` }, { role: 'user', content: 'U' }],
    });
    assert.deepEqual(body.messages, [
        { role: 'system', content: 'A' },
        { role: 'user', content: 'U' },
    ]);
});

test('SillyTavern adapter: tagged resolves the marker, native strips it, fallback path matches', () => {
    const task = {
        systemPrompt: '',
        tools,
        messages: [{ role: 'system', toolProtocolMarker: true, content: `A\n\n${M}` }, { role: 'user', content: 'U' }],
    };
    const tagged = new SillyTavernOpenAICompatibleAdapter({ model: 'compat-test', toolMode: 'tagged-json' });
    assert.equal(tagged.buildMessages(task)[0].content, `A\n\n${protocolText}`);
    assert.equal(tagged.buildPayload(task, true).messages[0].content, `A\n\n${protocolText}`);

    const native = new SillyTavernOpenAICompatibleAdapter({ model: 'compat-test' });
    const nativePayload = native.buildPayload(task, false);
    assert.deepEqual(nativePayload.messages, [
        { role: 'system', content: 'A' },
        { role: 'user', content: 'U' },
    ]);
    assert.deepEqual(nativePayload.tools, tools);
    // 原生失败后回退到 tagged 时，同一份 task 重新构建仍能得到协议文本。
    assert.equal(native.buildPayload(task, true).messages[0].content, `A\n\n${protocolText}`);
    assert.equal(JSON.stringify(nativePayload).includes('XBDRAW_TOOL_PROTOCOL'), false);
});
