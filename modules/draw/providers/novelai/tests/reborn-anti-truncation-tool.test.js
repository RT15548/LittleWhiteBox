// Reborn2.4.2 的“防截断2.0”（提示词块 + game_content 工具绑定）作为请求结构里一条“附带工具”的消息：
// 经真实的模板导入路径进来（没确认时这条消息连同工具一起停用），启用后工具名解析为 game_content；
// 若模型照说明把所有输出放进 game_content、不提交 submit_scene_plan，给出明确的报错。
import assert from 'node:assert/strict';
import test from 'node:test';

import { OpenAICompatibleAdapter } from '../../../../agent-core/adapters/openai-compatible.js';
import { collectToolBlocks, extractToolName, resolveCustomToolDefinitions } from '../../../shared/custom-tools.js';
import { getLastDrawAgentDiagnostic, resetDrawAgentRuntimeForTests } from '../../../shared/draw-agent.js';
import { generateAndParseScenePlan } from '../../../shared/scene-planner.js';
import { hasTool, setBlocksEnabled } from '../../../shared/scene-planner-layout.js';
import { createInProcessToolHost } from '../../../shared/tests/helpers/in-process-tool-host.js';
import { parseNovelPromptPresetImport } from '../novel-prompt-import.js';

// 逐字取自 Reborn2.4.2.json：提示词块「防截断2.0」的 content 与 ToolBindings 里的 code。
const INSTRUCTION = '<output_method>\n# 非常重要！\n# 严禁直接输出任何消息，**所有输出内容**必须调用game_content函数工具，放在content参数中输出。\n</output_method>';
const CODE = 'return {\n    name: "game_content",\n    description: "# 你的全部输出应当在此工具内。",\n    parameters: {\n        "type": "object",\n        "properties": {\n            "content": {\n                "type": "string"\n            }\n        },\n        "required": [\n            "content"\n        ]\n    },\n    action: async (args) => {\n        return JSON.stringify({ ok: true });\n    },\n    stealth: false,\n};';

const TEMPLATE = {
    _type: 'novel-draw-prompt-template',
    _version: 4,
    name: 'Reborn + 防截断2.0',
    topSystem: 's',
    sceneRules: 'r',
    modelGuideOverrides: {},
    layout: {
        version: 1,
        blocks: [
            { id: 'opening' }, { id: 'frame' }, { id: 'guide' }, { id: 'rules' },
            { id: 'tools' }, { id: 'worldInfo' }, { id: 'content' }, { id: 'limits' },
            { id: 'msg-69zf15', role: 'system', name: '防截断2.0', content: INSTRUCTION, enabled: true, tool: { code: CODE } },
        ],
    },
};

test('the anti-truncation message survives the real import path: kept verbatim, imported disabled, resolves to game_content once enabled', async () => {
    const imported = parseNovelPromptPresetImport(TEMPLATE);
    assert.equal(imported.disabledToolBlocks, 1);
    const block = imported.layout.blocks.find(hasTool);
    assert.equal(block.enabled, false);
    assert.equal(block.content, INSTRUCTION);
    assert.equal(block.tool.code, CODE);
    assert.equal(extractToolName(block.tool.code), 'game_content');
    assert.equal(imported.layout.blocks.at(-1).id, 'msg-69zf15', 'Reborn 把它排在最后');
    assert.deepEqual(collectToolBlocks(imported.layout), []);

    const enabled = setBlocksEnabled(imported.layout, [block.id], true);
    const [definition] = await resolveCustomToolDefinitions(enabled, createInProcessToolHost());
    assert.equal(definition.name, 'game_content');
    assert.equal(definition.description, '# 你的全部输出应当在此工具内。');
    assert.deepEqual(definition.parameters.required, ['content']);
    assert.equal(definition.stealth, false);
});

test('a confirmed import keeps the block enabled straight away', async () => {
    const imported = parseNovelPromptPresetImport(TEMPLATE, { keepToolBlocks: true });
    assert.equal(imported.disabledToolBlocks, undefined);
    const [definition] = await resolveCustomToolDefinitions(imported.layout, createInProcessToolHost());
    assert.equal(definition.name, 'game_content');
});

test('if the model follows the instruction and puts everything into game_content, the run ends with a clear error instead of a silent failure', async () => {
    resetDrawAgentRuntimeForTests();
    const imported = parseNovelPromptPresetImport(TEMPLATE);
    const layout = setBlocksEnabled(imported.layout, [imported.layout.blocks.find(hasTool).id], true);
    const settings = {
        currentPresetName: '主预设',
        presets: { 主预设: { provider: 'openai-compatible', modelConfigs: { 'openai-compatible': { baseUrl: 'https://x.example/v1', model: 'm', apiKey: 'k', toolMode: 'native', reasoning: { mode: 'off' } } } } },
    };
    const replies = [
        { choices: [{ message: { role: 'assistant', content: '', tool_calls: [{ id: 'a', type: 'function', function: { name: 'game_content', arguments: JSON.stringify({ content: '阿璃推开门。（整段规划写进了这里）' }) } }] }, finish_reason: 'tool_calls' }] },
        { choices: [{ message: { role: 'assistant', content: '已按要求输出。' }, finish_reason: 'stop' }] },
        { choices: [{ message: { role: 'assistant', content: '已按要求输出。' }, finish_reason: 'stop' }] },
        { choices: [{ message: { role: 'assistant', content: '已按要求输出！' }, finish_reason: 'stop' }] },
    ];
    let sent = 0;
    const host = createInProcessToolHost();
    await assert.rejects(generateAndParseScenePlan({
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
                    adapter.client.chat.completions.create = async () => replies[sent++];
                    return adapter;
                },
            }),
        },
    }), error => error.code === 'TOOL_CALL_MISSING' && /模型只调用了自定义工具，没有提交 submit_scene_plan/.test(error.message));
    assert.deepEqual(host.calls.map(item => item.name), ['game_content']);
    const diagnostic = getLastDrawAgentDiagnostic();
    assert.equal(diagnostic.status, 'error');
    assert.equal(diagnostic.customToolCalls[0].name, 'game_content');
    assert.match(diagnostic.errorMessage, /只调用了自定义工具/);
});
