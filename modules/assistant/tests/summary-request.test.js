import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSummaryRequest, readSubmittedSummary, SUMMARY_TOOLS } from '../app-src/runtime/summary-request.js';
import { SUMMARY_REQUIREMENTS } from '../app-src/prompts/summary-prompt.js';
import { summaryResult, summarySource } from './helpers/summary.js';
import { OpenAICompatibleAdapter } from '../../agent-core/adapters/openai-compatible.js';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { GoogleAdapter } from '../../agent-core/adapters/google.js';
import { AnthropicAdapter } from '../../agent-core/adapters/anthropic.js';

// Acceptance contracts:
// - Preserve the supplied source once and three correctly paired preparation exchanges (lost memory / invalid protocol).
// - Native and JSON tool delivery reach the same summary reader (broken compaction).
// - Missing, ambiguous, malformed, empty or truncated delivery never replaces memory (lost work).
const source = '已有历史摘要：港口任务\n用户：继续\n助手：工具 Write {"content":"const x = `甲`;\\n乙"}\n工具：保存成功';
const config = { provider: 'openai-compatible', apiKey: 'test-key', model: 'fixture', maxTokens: 4000 };
const count = (text, value) => text.split(value).length - 1;

for (const toolMode of ['native', 'tagged-json']) test(`summary source and three preparation pairs survive ${toolMode} serialization`, async () => {
    const request = buildSummaryRequest(source, { ...config, toolMode });
    assert.equal(summarySource(request), source);
    assert.equal(request.toolChoice, 'auto');
    assert.deepEqual(request.tools.map(tool => tool.function.name), Object.values(SUMMARY_TOOLS));
    assert.deepEqual(request.messages.map(message => message.role), ['user', 'assistant', 'tool', 'assistant', 'tool', 'assistant', 'tool']);
    for (let i = 1; i < request.messages.length; i += 2) {
        const call = request.messages[i].tool_calls[0];
        assert.equal(request.messages[i + 1].tool_call_id, call.id);
        assert.equal(request.messages[i + 1].toolName, call.function.name);
        assert.deepEqual(JSON.parse(call.function.arguments), {});
    }
    const adapter = new OpenAICompatibleAdapter({ ...config, toolMode });
    let sent;
    adapter.client.chat.completions.create = async body => {
        sent = body;
        const call = summaryResult('# 当前目标\n继续港口任务').toolCalls[0];
        const message = toolMode === 'native'
            ? { role: 'assistant', content: '', tool_calls: [{ id: call.id, type: 'function', function: { name: call.name, arguments: call.arguments } }] }
            : { role: 'assistant', content: `<tool_call>${JSON.stringify({ name: call.name, arguments: JSON.parse(call.arguments) })}</tool_call>` };
        return { choices: [{ message, finish_reason: toolMode === 'native' ? 'tool_calls' : 'stop' }] };
    };
    const result = await adapter.chat(request);
    assert.equal(readSubmittedSummary(result), '# 当前目标\n继续港口任务');
    const sentText = [...sent.messages.map(message => message.content || ''), ...(sent.tools || []).map(tool => tool.function.description)].join('\n');
    assert.equal(count(sentText, source), 1);
    assert.equal(count(sentText, SUMMARY_REQUIREMENTS), 1);
    assert.equal(sent.messages.at(-1).role, toolMode === 'native' ? 'tool' : 'user');
    assert.equal(sent.tool_choice, toolMode === 'native' ? 'auto' : undefined);
});

test('native summary preparation is legal Google, Anthropic and Responses history', () => {
    const request = buildSummaryRequest(source, config);
    const google = new GoogleAdapter({ ...config, model: 'gemini-3-flash-preview' }).buildChatPayload(request);
    const history = google.createPayload.history;
    assert.deepEqual(history.map(message => message.role), ['user', 'model', 'user', 'model', 'user', 'model']);
    const calls = history.flatMap(message => message.parts.filter(part => part.functionCall));
    assert.equal(calls.length, 3);
    assert.ok(calls.every(part => part.thoughtSignature === 'skip_thought_signature_validator'));
    assert.equal(google.sendPayload.message[0].functionResponse.name, SUMMARY_TOOLS.approval);
    const anthropic = new AnthropicAdapter({ ...config, model: 'claude-sonnet-4-5' }).buildRequestBody(request);
    assert.deepEqual(anthropic.messages.map(message => message.role), ['user', 'assistant', 'user', 'assistant', 'user', 'assistant', 'user']);
    assert.equal(anthropic.messages.at(-1).content[0].type, 'tool_result');
    assert.equal(anthropic.tool_choice.type, 'auto');
    const responses = new OpenAIResponsesAdapter(config).buildRequestBody(request);
    assert.equal(responses.input.filter(item => item.type === 'function_call').length, 3);
    assert.equal(responses.input.filter(item => item.type === 'function_call_output').length, 3);
    assert.equal(responses.input.at(-1).type, 'function_call_output');
    assert.equal(responses.tool_choice, 'auto');
});

test('summary delivery accepts only one complete content submission, without inspecting prose wording', () => {
    assert.equal(readSubmittedSummary({ ...summaryResult('  # 当前目标\n继续  '), text: 'other prose' }), '# 当前目标\n继续');
    assert.equal(readSubmittedSummary({ toolCalls: [{ name: SUMMARY_TOOLS.submit, arguments: { content: 'recorded facts' } }] }), 'recorded facts');
    const invalid = [
        { text: '抱歉，我无法协助处理这段内容。' },
        { toolCalls: [{ name: SUMMARY_TOOLS.source, arguments: '{}' }] },
        { toolCalls: [...summaryResult('one').toolCalls, ...summaryResult('two').toolCalls] },
        { toolCalls: [{ name: SUMMARY_TOOLS.submit, arguments: '{"content":"cut off' }] },
        { toolCalls: [{ name: SUMMARY_TOOLS.submit, arguments: '{"content":42}' }] },
        { toolCalls: [{ name: SUMMARY_TOOLS.submit, arguments: '{"content":"ok","note":"extra"}' }] },
        summaryResult('   '),
        { ...summaryResult('cut off'), truncated: true },
    ];
    for (const result of invalid) assert.throws(() => readSubmittedSummary(result));
});
