import assert from 'node:assert/strict';
import test from 'node:test';

import { OpenAICompatibleAdapter } from '../../../agent-core/adapters/openai-compatible.js';
import { getLastDrawAgentDiagnostic, resetDrawAgentRuntimeForTests } from '../draw-agent.js';
import { MAX_CUSTOM_TOOL_CALLS } from '../custom-tools.js';
import { executePreparedScenePlanner } from '../scene-planner-executor.js';
import { generateAndParseScenePlan, prepareScenePlannerInput } from '../scene-planner.js';
import { addBlockAfter, createDefaultLayout } from '../scene-planner-layout.js';
import { createInProcessToolHost } from './helpers/in-process-tool-host.js';
import { createToolBlock } from './helpers/tool-block.js';

const NOTE_CODE = `return {
    name: "note",
    description: "记下分析。",
    parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
    action: async (args) => JSON.stringify({ ok: true, len: String(args.content).length }),
    stealth: STEALTH,
};`;
const PLAN_ARGUMENTS = { images: [{ index: 1, insert_after: 1, scene: 'opening door, indoor', characters: [] }] };

function buildSettings(toolMode) {
    return {
        currentPresetName: '主预设',
        presets: {
            主预设: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': { baseUrl: 'https://main.example/v1', model: 'tool-model', apiKey: 'k', toolMode, reasoning: { mode: 'off' } },
                },
            },
        },
    };
}

function layoutWithTool({ code = NOTE_CODE.replace('STEALTH', 'false'), content = '先调用 note 再提交。', enabled = true } = {}) {
    return addBlockAfter(createDefaultLayout(), createToolBlock({ name: '分析', content, code, enabled }, [], () => 0.21));
}

const call = (name, args) => ({ name, args });
const reply = (toolMode, calls, text = '') => (toolMode === 'native'
    ? {
        choices: [{
            message: {
                role: 'assistant',
                content: text,
                tool_calls: calls.map((item, index) => ({ id: `c${index}-${Math.random()}`, type: 'function', function: { name: item.name, arguments: JSON.stringify(item.args) } })),
            },
            finish_reason: calls.length ? 'tool_calls' : 'stop',
        }],
    }
    : {
        choices: [{
            message: { role: 'assistant', content: `${text}${calls.map(item => `<tool_call>${JSON.stringify({ name: item.name, arguments: item.args })}</tool_call>`).join('')}` },
            finish_reason: 'stop',
        }],
    });

async function runPlanner({ toolMode, replies, layout = layoutWithTool(), host = createInProcessToolHost() }) {
    resetDrawAgentRuntimeForTests();
    const requests = [];
    const settings = buildSettings(toolMode);
    const outcome = await generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        customPrompts: { layout },
        customToolHost: host,
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => settings },
            loadAgentCore: async () => ({
                createAgentAdapter: (providerConfig) => {
                    const adapter = new OpenAICompatibleAdapter(providerConfig);
                    adapter.client.chat.completions.create = async (body) => {
                        requests.push(JSON.parse(JSON.stringify(body)));
                        const next = replies[requests.length - 1];
                        if (!next) throw new Error('测试里没有准备更多的回复');
                        return next;
                    };
                    return adapter;
                },
            }),
        },
    }).then(tasks => ({ tasks }), error => ({ error }));
    return { ...outcome, requests, host, diagnostic: getLastDrawAgentDiagnostic() };
}

for (const toolMode of ['native', 'tagged-json']) {
    test(`${toolMode}: the model calls the custom tool first, gets its result, then submits the plan`, async () => {
        const { tasks, error, requests, host, diagnostic } = await runPlanner({
            toolMode,
            replies: [reply(toolMode, [call('note', { content: '先想想' })]), reply(toolMode, [call('submit_scene_plan', PLAN_ARGUMENTS)])],
        });
        assert.equal(error, undefined, error?.message);
        assert.equal(tasks[0].scene, 'opening door, indoor');
        assert.equal(requests.length, 2);
        assert.deepEqual(host.calls, [{ name: 'note', args: { content: '先想想' } }]);
        // 两个工具都发给了模型；工具块的说明消息也在请求里，但代码不在。
        if (toolMode === 'native') assert.deepEqual(requests[0].tools.map(tool => tool.function.name), ['submit_scene_plan', 'note']);
        else assert.match(JSON.stringify(requests[0].messages), /- note: 记下分析/);
        assert.match(JSON.stringify(requests[0].messages), /先调用 note 再提交/);
        assert.doesNotMatch(JSON.stringify(requests[0]), /action: async/);
        // 第二次请求带着工具的结果。
        assert.match(JSON.stringify(requests[1].messages), /\{\\"ok\\":true,\\"len\\":3\}|"ok":true,"len":3/);
        assert.equal(diagnostic.status, 'success');
        assert.equal(diagnostic.customToolCalls.length, 1);
        assert.equal(diagnostic.customToolCalls[0].name, 'note');
        assert.deepEqual(diagnostic.customToolCalls[0].arguments, { content: '先想想' });
        assert.match(diagnostic.customToolCalls[0].result, /"len":3/);
        assert.equal(diagnostic.toolsCount, 2);
        assert.equal(diagnostic.correctionCount, 0);
    });
}

test('stealth tools still run but leave no call in the records', async () => {
    const layout = layoutWithTool({ code: NOTE_CODE.replace('STEALTH', 'true') });
    const { tasks, error, host, diagnostic } = await runPlanner({
        toolMode: 'native',
        layout,
        replies: [reply('native', [call('note', { content: 'x' })]), reply('native', [call('submit_scene_plan', PLAN_ARGUMENTS)])],
    });
    assert.equal(error, undefined, error?.message);
    assert.equal(tasks.length, 1);
    assert.equal(host.calls.length, 1);
    assert.deepEqual(diagnostic.customToolCalls || [], []);
    assert.equal(diagnostic.customToolCallCount, 1);
});

test('a tool that throws returns the error text to the model instead of failing the run', async () => {
    const layout = layoutWithTool({ code: 'return { name: "note", parameters: { type: "object", properties: {} }, action: async () => { throw new Error("工具炸了"); } };' });
    const { tasks, error, requests, diagnostic } = await runPlanner({
        toolMode: 'native',
        layout,
        replies: [reply('native', [call('note', {})]), reply('native', [call('submit_scene_plan', PLAN_ARGUMENTS)])],
    });
    assert.equal(error, undefined, error?.message);
    assert.equal(tasks.length, 1);
    assert.match(JSON.stringify(requests[1].messages), /工具炸了/);
    assert.equal(diagnostic.customToolCalls[0].error, '工具炸了');
});

test('tool-only rounds do not eat the correction budget', async () => {
    const replies = [
        reply('native', [call('note', { content: 'a' })]),
        reply('native', [call('note', { content: 'b' })]),
        reply('native', [call('submit_scene_plan', { images: [] })]),
        reply('native', [call('submit_scene_plan', PLAN_ARGUMENTS)]),
    ];
    const { tasks, error, requests } = await runPlanner({ toolMode: 'native', replies });
    assert.equal(error, undefined, error?.message);
    assert.equal(tasks.length, 1);
    assert.equal(requests.length, 4);
});

test('a reply that calls submit_scene_plan together with a custom tool does not run the tool', async () => {
    const { tasks, error, host, diagnostic } = await runPlanner({
        toolMode: 'native',
        replies: [reply('native', [call('note', { content: 'x' }), call('submit_scene_plan', PLAN_ARGUMENTS)])],
    });
    assert.equal(error, undefined, error?.message);
    assert.equal(tasks.length, 1);
    assert.equal(host.calls.length, 0);
    assert.deepEqual(diagnostic.customToolCalls || [], []);
});

test('endless custom tool calls stop at the cap with a message that says the plan was never submitted', async () => {
    const replies = Array.from({ length: MAX_CUSTOM_TOOL_CALLS + 2 }, () => reply('native', [call('note', { content: 'again' })]));
    const { error, host, diagnostic } = await runPlanner({ toolMode: 'native', replies });
    assert.equal(error?.code, 'CUSTOM_TOOL_LIMIT_EXCEEDED');
    assert.match(error.message, /只调用了自定义工具.*没有提交 submit_scene_plan/);
    assert.equal(host.calls.length, MAX_CUSTOM_TOOL_CALLS);
    assert.equal(diagnostic.status, 'error');
    assert.equal(diagnostic.errorCode, 'CUSTOM_TOOL_LIMIT_EXCEEDED');
});

test('a model that only used the custom tool and then stopped gets a clear feedback turn, then the error', async () => {
    const replies = [
        reply('native', [call('note', { content: '全部输出都放这里' })]),
        reply('native', [], '好的，已完成。'),
        reply('native', [], '真的完成了。'),
        reply('native', [], '。'),
    ];
    const { error, requests, diagnostic } = await runPlanner({ toolMode: 'native', replies });
    assert.equal(error?.code, 'TOOL_CALL_MISSING');
    assert.match(error.message, /模型只调用了自定义工具，没有提交 submit_scene_plan/);
    // 纠错内容也明确告诉模型“只调用了自定义工具”。
    assert.match(JSON.stringify(requests[2].messages), /只调用了自定义工具/);
    assert.match(diagnostic.validationFailures[0].errorMessage, /只调用了自定义工具/);
});

test('without a host the tool block is refused before any request is sent', async () => {
    resetDrawAgentRuntimeForTests();
    const requests = [];
    await assert.rejects(generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        customPrompts: { layout: layoutWithTool() },
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => buildSettings('native') },
            loadAgentCore: async () => ({ createAgentAdapter: () => ({ chat: async (task) => { requests.push(task); return {}; } }) }),
        },
    }), { code: 'CUSTOM_TOOL_HOST_MISSING' });
    assert.equal(requests.length, 0);
});

test('a disabled tool block is ignored: no host needed, single tool, nothing extra sent', async () => {
    const { tasks, error, requests } = await runPlanner({
        toolMode: 'native',
        layout: layoutWithTool({ enabled: false }),
        host: null,
        replies: [reply('native', [call('submit_scene_plan', PLAN_ARGUMENTS)])],
    });
    assert.equal(error, undefined, error?.message);
    assert.equal(tasks.length, 1);
    assert.deepEqual(requests[0].tools.map(tool => tool.function.name), ['submit_scene_plan']);
});

test('the prepared snapshot carries tool definitions but never code, and a host-less executor (background run) refuses it', async () => {
    const host = createInProcessToolHost();
    const prepared = await prepareScenePlannerInput({
        messageText: '阿璃推开门。',
        maxImages: 1,
        customPrompts: { layout: layoutWithTool() },
        customToolHost: host,
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'm', toolMode: 'native' } },
    });
    assert.deepEqual(prepared.planner.customTools.map(tool => tool.name), ['note']);
    assert.doesNotMatch(JSON.stringify(prepared), /action: async/);
    resetDrawAgentRuntimeForTests();
    await assert.rejects(executePreparedScenePlanner(prepared, { agentCaller: async () => { throw new Error('不应被调用'); } }), { code: 'CUSTOM_TOOL_HOST_MISSING' });
    assert.equal(getLastDrawAgentDiagnostic().errorCode, 'CUSTOM_TOOL_HOST_MISSING');

    // 快照里的定义不合格 = 快照无效。
    const tampered = JSON.parse(JSON.stringify(prepared));
    tampered.planner.customTools[0].name = 'submit_scene_plan';
    await assert.rejects(executePreparedScenePlanner(tampered, { customToolHost: host }), { code: 'PREPARED_INPUT_INVALID' });
});

test('default requests are untouched: no customTools key in the snapshot and a single tool', async () => {
    const prepared = await prepareScenePlannerInput({
        messageText: '阿璃推开门。',
        maxImages: 1,
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'm', toolMode: 'native' } },
    });
    assert.equal(Object.hasOwn(prepared.planner, 'customTools'), false);
});
