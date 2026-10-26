import test from 'node:test';
import assert from 'node:assert/strict';

import { OpenAICompatibleAdapter, extractTaggedToolCalls } from '../../../agent-core/adapters/openai-compatible.js';
import { ScenePlannerError, buildToolProtocolRetryCorrection } from '../scene-plan-contract.js';
import { generateAndParseScenePlan } from '../scene-planner.js';
import { getLastDrawAgentDiagnostic, resetDrawAgentRuntimeForTests } from '../draw-agent.js';

// Contract: a retry after a tool-protocol error tells the model what was wrong (one message, about the last
// failure only), and the tagged-json parser itself stays strict: it never repairs the mis-nested call.

const IMAGE = { index: 1, insert_after: 1, scene: 'opening door, indoor', characters: [] };
// 日志里的形状：prelude 之后 arguments 提前闭合，images 成了封装的同级字段，末尾还多一个 }。
const MIS_NESTED = '{"name":"submit_scene_plan","arguments":{"mindful_prelude":{"steps":[{"a":1}]}},'
    + `"images":${JSON.stringify([IMAGE])}}}`;
const BAD_TEXT = `<tool_call>${MIS_NESTED}</tool_call>`;
const GOOD_TEXT = `<tool_call>${JSON.stringify({ name: 'submit_scene_plan', arguments: { images: [IMAGE] } })}</tool_call>`;

function taggedError() {
    try {
        extractTaggedToolCalls(BAD_TEXT);
    } catch (error) {
        return error;
    }
    return assert.fail('the mis-nested call must be rejected');
}

function plannerError(code, message, details = null, options = {}) {
    return new ScenePlannerError(message, code, details, options);
}

test('the parser still rejects the mis-nested call and names the stray field without repairing it', () => {
    const error = taggedError();
    assert.equal(error.code, 'TAGGED_TOOL_CALL_INVALID');
    assert.match(error.message, /之外的字段/);
    assert.deepEqual(error.extraFields, ['images']);
});

test('correction text: generic variant carries the parser error and the fixed hint', () => {
    const message = 'JSON 工具调用格式无效：JSON 括号不匹配，无法确定调用边界（位置 7）。本轮工具未执行。';
    const text = buildToolProtocolRetryCorrection(plannerError('TAGGED_TOOL_CALL_INVALID', message, { offset: 7 }));
    assert.ok(text.includes(`解析器报错：${message}`));
    assert.ok(text.includes('<tool_call>') && text.includes('arguments 里面'));
    assert.equal(text.includes('arguments 外面'), false);
});

test('correction text: pointed variant names the offending keys, bounded in count and length', () => {
    const pointed = buildToolProtocolRetryCorrection(
        plannerError('TAGGED_TOOL_CALL_INVALID', 'x', { offset: 1, extraFields: ['images'] }),
    );
    assert.ok(pointed.includes('"images" 被写到了 arguments 外面'));
    const many = buildToolProtocolRetryCorrection(plannerError('TAGGED_TOOL_CALL_INVALID', 'x', {
        extraFields: ['a', 'b', 'c', 'd', 'e', 'f', 'k'.repeat(100)],
    }));
    assert.equal(many.includes('"f"'), false);
    assert.equal(many.includes('k'.repeat(41)), false);
});

test('correction text: other protocol codes get a hint, non-protocol errors get none', () => {
    const missing = buildToolProtocolRetryCorrection(plannerError('TOOL_CALL_MISSING', '没有解析到 Tool Call'));
    assert.ok(missing.includes('没有解析到 Tool Call') && missing.includes('submit_scene_plan'));
    const dsml = buildToolProtocolRetryCorrection(plannerError('DSML_TOOL_CALL_INVALID', '设置建议', null, {
        cause: new Error('设置建议', { cause: new Error('invoke 未闭合（位置 3）') }),
    }));
    assert.ok(dsml.includes('invoke 未闭合（位置 3）') && !dsml.includes('设置建议'));
    assert.equal(buildToolProtocolRetryCorrection(plannerError('TOOL_ARGUMENTS_SCHEMA_INVALID', 'x')), '');
    assert.equal(buildToolProtocolRetryCorrection(plannerError('PROVIDER_REQUEST_FAILED', 'x')), '');
    assert.equal(buildToolProtocolRetryCorrection(new Error('plain')), '');
});

async function runPlanner(responses, maxRetries) {
    resetDrawAgentRuntimeForTests();
    const requests = [];
    const settings = {
        currentPresetName: '主预设',
        presets: { 主预设: { provider: 'openai-compatible', modelConfigs: { 'openai-compatible': {
            baseUrl: 'https://main.example/v1', model: 'gpt-4o', apiKey: 'k', toolMode: 'tagged-json',
        } } } },
    };
    const run = generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        plannerRetry: { maxRetries, baseDelayMs: 1 },
        promptDefaults: { topSystem: 'OPEN', tagGuideContent: 'GUIDE', sceneRules: 'RULES', fieldDescriptions: '' },
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => settings },
            loadAgentCore: async () => ({
                createAgentAdapter: (providerConfig) => {
                    const adapter = new OpenAICompatibleAdapter(providerConfig);
                    adapter.client.chat.completions.create = async (body) => {
                        requests.push(structuredClone(body));
                        const content = responses[requests.length - 1];
                        return { choices: [{ message: { role: 'assistant', content }, finish_reason: 'stop' }] };
                    };
                    return adapter;
                },
            }),
        },
    });
    return { tasks: await run, requests };
}

const lastContent = request => request.messages.at(-1).content;

test('planner retry: the retry request carries the parser error and the hint; corrections are recorded', async (t) => {
    t.mock.method(console, 'log', () => {});
    const { tasks, requests } = await runPlanner([BAD_TEXT, GOOD_TEXT], 2);
    assert.equal(tasks.length, 1);
    assert.equal(requests.length, 2);
    const error = taggedError();
    assert.equal(requests[0].messages.some(message => String(message.content).includes('解析器报错')), false);
    assert.ok(requests[1].messages.length > requests[0].messages.length);
    assert.equal(requests[1].messages.at(-1).role, 'user');
    assert.ok(lastContent(requests[1]).includes(error.message));
    assert.ok(lastContent(requests[1]).includes('"images" 被写到了 arguments 外面'));
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.correctionCount, 1);
    assert.equal(diagnostic.corrections.length, 1);
    assert.equal(diagnostic.corrections[0].errorCode, 'TAGGED_TOOL_CALL_INVALID');
    assert.equal(diagnostic.corrections[0].feedbackSent, true);
    assert.equal(diagnostic.corrections[0].attempt, 1);
    assert.equal(diagnostic.retryCount, 1);
});

test('planner retry: corrections do not pile up across retries', async (t) => {
    t.mock.method(console, 'log', () => {});
    const { tasks, requests } = await runPlanner([BAD_TEXT, BAD_TEXT, GOOD_TEXT], 2);
    assert.equal(tasks.length, 1);
    assert.equal(requests.length, 3);
    assert.equal(requests[2].messages.length, requests[1].messages.length);
    const corrections = requests[2].messages.filter(message => String(message.content).includes('解析器报错'));
    assert.equal(corrections.length, 1);
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.correctionCount, 2);
    assert.deepEqual(diagnostic.corrections.map(item => item.attempt), [1, 2]);
});

test('planner retry: the retry limit is unchanged when every attempt fails', async (t) => {
    t.mock.method(console, 'log', () => {});
    await assert.rejects(() => runPlanner([BAD_TEXT, BAD_TEXT, BAD_TEXT, BAD_TEXT], 2), { code: 'TAGGED_TOOL_CALL_INVALID' });
    assert.equal(getLastDrawAgentDiagnostic().correctionCount, 2);
});
