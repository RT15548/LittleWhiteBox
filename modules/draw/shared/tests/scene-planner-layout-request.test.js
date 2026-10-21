import test from 'node:test';
import assert from 'node:assert/strict';

import {
    OpenAICompatibleAdapter,
    buildTaggedMessages,
} from '../../../agent-core/adapters/openai-compatible.js';
import { TOOL_PROTOCOL_MARKER as M } from '../../../agent-core/adapters/tool-protocol-marker.js';
import {
    buildScenePlannerTask,
    generateAndParseScenePlan,
    prepareScenePlannerInput,
} from '../scene-planner.js';
import { createPreparedScenePlannerTask } from '../scene-planner-executor.js';
import { getLastDrawAgentDiagnostic, resetDrawAgentRuntimeForTests } from '../draw-agent.js';
import {
    addBlock,
    createCustomBlock,
    createDefaultLayout,
    reorderBlocks,
} from '../scene-planner-layout.js';

const PROMPTS = { topSystem: 'OPEN', tagGuideContent: 'GUIDE', sceneRules: 'RULES', fieldDescriptions: '' };
const NARRATIVE = '雨声停了。阿璃推开门。';

let idCounter = 0;
function custom(role, content, options = {}) {
    return createCustomBlock({ role, content, name: 'x', ...options }, [], () => (idCounter += 1) / 36 ** 6);
}

const DEFAULT_ORDER = ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'];
function layoutOf(order, customs = {}) {
    let layout = reorderBlocks(createDefaultLayout(), order);
    // customs: { 位置: 块 }，按位置从前往后插入
    for (const [index, block] of Object.entries(customs).sort(([a], [b]) => a - b)) {
        layout = addBlock(layout, block, Number(index));
    }
    return layout;
}

// 宏桩：只展开 {{user}}，并记录每次调用的入参；其余（含 {{lastMessage}} 等）保持字面量。
function createRuntime() {
    const calls = [];
    const emits = [];
    return {
        calls,
        emits,
        runtime: {
            substituteParams: (text) => {
                calls.push(text);
                return text.split('{{user}}').join('〈用户〉');
            },
            promptReadyEvent: 'READY',
            eventSource: { emit: async (event, payload) => { emits.push(JSON.parse(JSON.stringify(payload))); } },
        },
    };
}

async function build(layout, options = {}) {
    const recorder = createRuntime();
    const task = await buildScenePlannerTask({
        messageText: NARRATIVE,
        maxImages: 1,
        promptDefaults: PROMPTS,
        customPrompts: layout === undefined ? null : { layout },
        expansionOptions: { runtime: recorder.runtime },
        ...options,
    });
    return { task, ...recorder };
}

function protocolTextFor(task) {
    return buildTaggedMessages({
        systemPrompt: '', tools: task.tools, toolChoice: task.toolChoice, messages: [{ role: 'user', content: 'x' }],
    })[0].content;
}

function adapterBody(task, toolMode, model = 'gpt-4o') {
    const adapter = new OpenAICompatibleAdapter({
        provider: 'openai-compatible', model, toolMode, apiKey: 'k', baseUrl: 'http://127.0.0.1:1/v1',
    });
    return adapter.buildRequestBody(task);
}

// ───────── 默认布局 ─────────

test('absent, explicit-default and ignored layouts all produce the identical request (5 macro calls)', async () => {
    const baseline = await build(undefined);
    const variants = [
        createDefaultLayout(),
        { version: 1, blocks: [{ id: 'content' }] },
        'garbage',
        // 停用的自定义块不改变请求
        addBlock(createDefaultLayout(), custom('assistant', 'GHOST', { enabled: false }), 3),
    ];
    for (const layout of variants) {
        const result = await build(layout);
        assert.deepEqual(result.task, baseline.task);
        assert.deepEqual(result.emits, baseline.emits);
        assert.deepEqual(result.calls.map((text) => text.replace(/XBDRAWSLOT_(\w+?)_\w+/g, 'S_$1')),
            baseline.calls.map((text) => text.replace(/XBDRAWSLOT_(\w+?)_\w+/g, 'S_$1')));
        assert.equal(result.calls.length, 5);
    }
    assert.equal(baseline.calls.length, 5);
    assert.equal(baseline.task.messages.length, 1);
    assert.equal(baseline.task.messages[0].role, 'user');
    assert.equal(baseline.task.systemPrompt.includes(M), false);
    // emit 载荷：system + user，与改造前一致。
    assert.deepEqual(baseline.emits.map((payload) => payload.chat.map((message) => message.role)), [['system', 'user']]);
});

test('default layout through the adapter keeps today request: protocol appended to the system message', async () => {
    const { task } = await build(createDefaultLayout());
    const protocol = protocolTextFor(task);
    const tagged = adapterBody(task, 'tagged-json');
    assert.deepEqual(tagged.messages, [
        { role: 'system', content: `${task.systemPrompt}\n\n${protocol}` },
        { role: 'user', content: task.messages[0].content },
    ]);
    const native = adapterBody(task, 'native');
    assert.deepEqual(native.messages, [
        { role: 'system', content: task.systemPrompt },
        { role: 'user', content: task.messages[0].content },
    ]);
    assert.equal(native.tools.length, 1);
});

// ───────── 仍是 [system, user] 的自定义布局（legacy） ─────────

test('custom blocks that keep the [system, user] shape stay on the legacy prompt shape', async () => {
    const layout = layoutOf(DEFAULT_ORDER, { 1: custom('system', 'EXTRA-SYS'), 7: custom('user', 'EXTRA-USER') });
    const { task, calls } = await build(layout);
    assert.equal(task.messages.length, 1);
    assert.equal(task.messages[0].role, 'user');
    assert.ok(task.systemPrompt.startsWith('OPEN\n\nEXTRA-SYS\n\n## 你收到的材料'));
    assert.ok(task.systemPrompt.endsWith('## 场景规则\n\nRULES'));
    assert.match(task.messages[0].content, /<\/worldInfo>\n\nEXTRA-USER\n\n<content>/);
    assert.equal(task.systemPrompt.includes(M), false);
    assert.equal(calls.length, 5);
});

// ───────── 非 legacy 布局 ─────────

test('assistant tail layout: systemPrompt empty, messages hold system/user/assistant in order; 6 macro calls', async () => {
    const layout = layoutOf(DEFAULT_ORDER, { 99: custom('assistant', '{{user}} 的前缀') });
    const { task, calls, emits } = await build(layout);
    assert.equal(task.systemPrompt, '');
    assert.deepEqual(task.messages.map((message) => message.role), ['system', 'user', 'assistant']);
    assert.equal(task.messages[0].content.endsWith(`\n\n${M}`), true);
    assert.equal(task.messages[2].content, '〈用户〉 的前缀');
    // 3 次动态值 + 每条合并后的消息 1 次。
    assert.equal(calls.length, 3 + 3);
    // 预览载荷里永远看不到标记。
    assert.equal(JSON.stringify(emits).includes('XBDRAW_TOOL_PROTOCOL'), false);
    assert.deepEqual(emits[0].chat.map((message) => message.role), ['system', 'user', 'assistant']);
    assert.equal(emits[0].chat[0].content.endsWith('## 场景规则\n\nRULES'), true);
});

test('tools block inside the user group becomes its own system message; emit hides it and merges neighbours', async () => {
    const layout = layoutOf(['opening', 'frame', 'guide', 'rules', 'worldInfo', 'tools', 'content', 'limits']);
    const { task, emits, calls } = await build(layout);
    assert.deepEqual(task.messages.map((message) => message.role), ['system', 'user', 'system', 'user']);
    assert.equal(task.messages[2].content, M);
    assert.equal(calls.length, 3 + 4);
    // 预览 = 原生模式实际会发送的内容：标记消息被剔除后，两条相邻 user 合并。
    assert.deepEqual(emits[0].chat.map((message) => message.role), ['system', 'user']);
    assert.match(emits[0].chat[1].content, /<\/worldInfo>\n\n<content>/);
});

test('messages that expand to nothing are dropped in non-legacy mode', async () => {
    const layout = layoutOf(DEFAULT_ORDER, { 99: custom('assistant', '{{empty}}') });
    const recorder = createRuntime();
    const baseSubstitute = recorder.runtime.substituteParams;
    recorder.runtime.substituteParams = (text) => baseSubstitute(text).split('{{empty}}').join('');
    const task = await buildScenePlannerTask({
        messageText: NARRATIVE,
        maxImages: 1,
        promptDefaults: PROMPTS,
        customPrompts: { layout },
        expansionOptions: { runtime: recorder.runtime },
    });
    assert.deepEqual(task.messages.map((message) => message.role), ['system', 'user']);
    assert.equal(task.systemPrompt, '');
});

// ───────── 安全模型：自定义块不能使用动态槽位 / 标记 ─────────

test('custom blocks cannot read the dynamic slots; their placeholders stay literal', async () => {
    const secret = '独一无二的叙事XYZ';
    const layout = layoutOf(DEFAULT_ORDER, {
        0: custom('system', '系统块 {{lastMessage}} {$worldInfo} {{characterInfo}}'),
        99: custom('assistant', '尾块 {{lastMessage}} {$worldInfo} {{characterInfo}}'),
    });
    const { task } = await build(layout, {
        messageText: `${secret}。第二句。`,
        worldbookEntries: '世界书独有条目QQQ',
        presentCharacters: [{ name: '阿璃', type: 'girl' }],
    });
    const [system, user, assistant] = task.messages;
    assert.ok(system.content.startsWith('系统块 {{lastMessage}} {$worldInfo} {{characterInfo}}'));
    assert.equal(assistant.content, '尾块 {{lastMessage}} {$worldInfo} {{characterInfo}}');
    // 动态内容只出现在内置块里，且各一次。
    const all = task.messages.map((message) => message.content).join('\n');
    assert.equal(all.split(secret).length - 1, 1);
    assert.equal(all.split('世界书独有条目QQQ').length - 1, 1);
    assert.equal(system.content.includes(secret), false);
    assert.equal(assistant.content.includes(secret), false);
    assert.ok(user.content.includes(secret));
    assert.equal(/XBDRAWSLOT_/.test(all), false);
});

test('tool protocol marker is stripped from custom text and from narrative / world info / characters', async () => {
    const layout = layoutOf(DEFAULT_ORDER, { 99: custom('assistant', `头${M}尾`), 0: custom('user', M) });
    const { task } = await build(layout, {
        messageText: `她说${M}然后走了。`,
        worldbookEntries: `条目${M}`,
        presentCharacters: [{ name: `阿${M}璃`, type: 'girl' }],
    });
    const markerHolders = task.messages.filter((message) => message.content.includes(M));
    assert.equal(markerHolders.length, 1);
    assert.equal(markerHolders[0].role, 'system');
    assert.equal(task.messages.at(-1).content, '头尾');
    assert.ok(task.messages[1].content.includes('她说然后走了。'));
});

// ───────── 快照与执行 ─────────

test('prepared snapshot carries the multi-message prompt and the executor task replays it', async () => {
    const layout = layoutOf(DEFAULT_ORDER, { 99: custom('assistant', 'PREFILL') });
    const prepared = await prepareScenePlannerInput({
        messageText: NARRATIVE,
        maxImages: 1,
        promptDefaults: PROMPTS,
        customPrompts: { layout },
        expansionOptions: { runtime: createRuntime().runtime },
        agentCaller: async () => {},
        agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'm' } },
    });
    const transferred = JSON.parse(JSON.stringify(prepared));
    assert.equal(transferred.planner.prompt.systemPrompt, '');
    assert.deepEqual(transferred.planner.prompt.messages.map((message) => message.role), ['system', 'user', 'assistant']);
    const task = createPreparedScenePlannerTask(transferred);
    assert.equal(task.systemPrompt, '');
    assert.deepEqual(task.messages.map(({ role, content }) => ({ role, content })), transferred.planner.prompt.messages);
    assert.equal(task.messages[0].toolProtocolMarker, true);
    assert.equal(transferred.planner.prompt.messages.some(message => Object.hasOwn(message, 'toolProtocolMarker')), false);
    assert.equal(task.toolChoice, 'required');
});

// ───────── 经真实适配器 ─────────

test('adapter: tools block moved before the opening puts the protocol text first (tagged)', async () => {
    const layout = layoutOf(['tools', 'opening', 'frame', 'guide', 'rules', 'worldInfo', 'content', 'limits']);
    const { task } = await build(layout);
    const protocol = protocolTextFor(task);
    const body = adapterBody(task, 'tagged-json');
    assert.equal(body.messages.length, 2);
    assert.equal(body.messages[0].role, 'system');
    assert.ok(body.messages[0].content.startsWith(`${protocol}\n\nOPEN\n\n## 你收到的材料`));
    assert.equal(JSON.stringify(body).includes('XBDRAW_TOOL_PROTOCOL'), false);
    assert.equal(Object.hasOwn(body, 'tools'), false);
});

test('adapter: tools block between user messages is a separate system message in tagged mode', async () => {
    const layout = layoutOf(['opening', 'frame', 'guide', 'rules', 'worldInfo', 'tools', 'content', 'limits']);
    const { task } = await build(layout);
    const protocol = protocolTextFor(task);
    const body = adapterBody(task, 'tagged-json');
    assert.deepEqual(body.messages.map((message) => message.role), ['system', 'user', 'system', 'user']);
    assert.equal(body.messages[2].content, protocol);
    assert.ok(body.messages[1].content.startsWith('<worldInfo>'));
    assert.ok(body.messages[3].content.startsWith('<content>'));
    // 协议文本只出现一次，不会再额外塞进首条 system。
    assert.equal(body.messages.filter((message) => message.content.includes('<tool_call>')).length, 1);
});

test('adapter: native mode strips the marker, keeps tools, and merges the emptied neighbours', async () => {
    const layout = layoutOf(['opening', 'frame', 'guide', 'rules', 'worldInfo', 'tools', 'content', 'limits']);
    const { task } = await build(layout);
    const body = adapterBody(task, 'native');
    assert.equal(JSON.stringify(body.messages).includes('XBDRAW_TOOL_PROTOCOL'), false);
    assert.equal(body.tools.length, 1);
    assert.equal(body.tools[0].function.name, 'submit_scene_plan');
    assert.deepEqual(body.messages.map((message) => message.role), ['system', 'user']);

    const headBody = adapterBody((await build(layoutOf(['tools', 'opening', 'frame', 'guide', 'rules', 'worldInfo', 'content', 'limits']))).task, 'native');
    assert.deepEqual(headBody.messages.map((message) => message.role), ['system', 'user']);
    assert.ok(headBody.messages[0].content.startsWith('OPEN\n\n'));
});

test('adapter: a custom assistant tail message is last in both modes', async () => {
    const layout = layoutOf(DEFAULT_ORDER, { 99: custom('assistant', 'PREFILL') });
    const { task } = await build(layout);
    for (const toolMode of ['tagged-json', 'native']) {
        const body = adapterBody(task, toolMode);
        assert.deepEqual(body.messages.at(-1), { role: 'assistant', content: 'PREFILL' });
        assert.deepEqual(body.messages.map((message) => message.role), ['system', 'user', 'assistant']);
        assert.equal(JSON.stringify(body.messages).includes('XBDRAW_TOOL_PROTOCOL'), false);
    }
    const tagged = adapterBody(task, 'tagged-json');
    assert.ok(tagged.messages[0].content.includes('<tool_call>'));
});

// ───────── 端到端：伪 provider + 纠错轮 ─────────

function buildSettings(toolMode) {
    return {
        currentPresetName: '主预设',
        presets: {
            主预设: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': { baseUrl: 'https://main.example/v1', model: 'gpt-4o', apiKey: 'k', toolMode },
                },
            },
        },
    };
}

const VALID_ARGUMENTS = JSON.stringify({
    images: [{ index: 1, insert_after: 1, scene: 'opening door, indoor', characters: [] }],
});

async function runEndToEnd(layout, toolMode) {
    resetDrawAgentRuntimeForTests();
    const settings = buildSettings(toolMode);
    const requests = [];
    const responses = ['{}', VALID_ARGUMENTS];
    const result = await generateAndParseScenePlan({
        messageText: '阿璃推开门。',
        maxImages: 1,
        promptDefaults: PROMPTS,
        customPrompts: { layout },
        expansionOptions: { runtime: { substituteParams: (text) => text } },
        agentOptions: {
            dependencies: { getAgentSettings: async () => settings },
            loadAgentCore: async () => ({
                createAgentAdapter: (providerConfig) => {
                    const adapter = new OpenAICompatibleAdapter(providerConfig);
                    adapter.client.chat.completions.create = async (body) => {
                        requests.push(structuredClone(body));
                        const args = responses[requests.length - 1];
                        const message = toolMode === 'native'
                            ? {
                                role: 'assistant',
                                content: '',
                                tool_calls: [{ id: `call-${requests.length}`, type: 'function', function: { name: 'submit_scene_plan', arguments: args } }],
                            }
                            : { role: 'assistant', content: `<tool_call>${JSON.stringify({ name: 'submit_scene_plan', arguments: args })}</tool_call>` };
                        return { choices: [{ message, finish_reason: toolMode === 'native' ? 'tool_calls' : 'stop' }] };
                    };
                    return adapter;
                },
            }),
        },
    });
    return { result, requests };
}

test('end to end: correction turns append after the layout messages (tagged and native)', async (t) => {
    t.mock.method(console, 'log', () => {});
    const layout = layoutOf(['tools', 'opening', 'frame', 'guide', 'rules', 'worldInfo', 'content', 'limits'], {
        99: custom('system', '追加的系统块'),
    });
    for (const toolMode of ['tagged-json', 'native']) {
        const { result, requests } = await runEndToEnd(layout, toolMode);
        assert.equal(result.length, 1);
        assert.equal(requests.length, 2);
        const first = requests[0].messages;
        const second = requests[1].messages;
        assert.equal(JSON.stringify(requests).includes('XBDRAW_TOOL_PROTOCOL'), false);
        if (toolMode === 'tagged-json') {
            assert.ok(first[0].content.startsWith('如果你需要调用工具'));
            assert.equal(Object.hasOwn(requests[0], 'tools'), false);
        } else {
            assert.ok(first[0].content.startsWith('OPEN'));
            assert.equal(requests[0].tools.length, 1);
        }
        // 第二次请求以第一次的全部消息为前缀，纠错轮只在末尾追加。
        assert.deepEqual(second.slice(0, first.length), first);
        assert.ok(second.length > first.length);
        assert.equal(getLastDrawAgentDiagnostic().correctionCount, 1);
    }
});

test('end to end: default layout request has the legacy shape', async (t) => {
    t.mock.method(console, 'log', () => {});
    const { requests } = await runEndToEnd(undefined, 'tagged-json');
    assert.deepEqual(requests[0].messages.map((message) => message.role), ['system', 'user']);
    assert.ok(requests[0].messages[0].content.startsWith('OPEN'));
    assert.ok(requests[0].messages[0].content.includes('如果你需要调用工具'));
});
