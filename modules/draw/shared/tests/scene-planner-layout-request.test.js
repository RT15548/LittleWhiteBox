import test from 'node:test';
import assert from 'node:assert/strict';
import { OpenAICompatibleAdapter, buildTaggedMessages } from '../../../agent-core/adapters/openai-compatible.js';
import { TOOL_PROTOCOL_MARKER as M } from '../../../agent-core/adapters/tool-protocol-marker.js';
import { buildScenePlannerTask, generateAndParseScenePlan, prepareScenePlannerInput } from '../scene-planner.js';
import { createPreparedScenePlannerTask } from '../scene-planner-executor.js';
import { assertScenePlannerMessages } from '../scene-planner-messages.js';
import { getLastDrawAgentDiagnostic, resetDrawAgentRuntimeForTests } from '../draw-agent.js';
import { addBlock, createCustomBlock, createDefaultLayout, reorderBlocks } from '../scene-planner-layout.js';
import { buildScenePlannerChainPreview } from '../scene-planner-frame.js';

const PROMPTS = { topSystem: 'OPEN', tagGuideContent: 'GUIDE', sceneRules: 'RULES', fieldDescriptions: '' };
const NARRATIVE = '雨声停了。阿璃推开门。';
const ORDER = ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'];
const ROLES = ['system', 'user', 'assistant', 'tool', 'assistant', 'tool', 'assistant', 'tool'];
let idCounter = 0;
const custom = (role, content, options = {}) => createCustomBlock({ role, content, ...options }, [], () => ++idCounter / 36 ** 6);
function layoutOf(order = ORDER, customs = {}) {
    let layout = reorderBlocks(createDefaultLayout(), order);
    for (const [index, block] of Object.entries(customs).sort(([a], [b]) => a - b)) layout = addBlock(layout, block, Number(index));
    return layout;
}
function createRuntime() {
    const calls = [], emits = [];
    return { calls, emits, runtime: {
        substituteParams: text => { calls.push(text); return text.split('{{user}}').join('〈用户〉'); },
        promptReadyEvent: 'READY',
        eventSource: { emit: async (_event, payload) => { emits.push(structuredClone(payload)); } },
    } };
}
async function build(layout, options = {}) {
    const recorder = createRuntime();
    const task = await buildScenePlannerTask({ messageText: NARRATIVE, maxImages: 1, promptDefaults: PROMPTS,
        customPrompts: layout === undefined ? null : { layout }, expansionOptions: { runtime: recorder.runtime }, ...options });
    return { task, ...recorder };
}
const receipts = task => task.messages.filter(message => message.role === 'tool');
const documents = task => receipts(task).map(message => JSON.parse(message.content));
// Cost: dropping continuity here silently changes a later paid image request.
test('continuity reaches planner materials once and an empty snapshot leaves the request unchanged', async () => {
    const baseline = await build();
    assert.deepEqual((await build(undefined, { continuityText: '' })).task, baseline.task);
    const continuityText = 'Alice: blue coat, silver hair';
    const { task } = await build(undefined, { continuityText });
    assert.equal(documents(task).map(value => value.content).join('\n').split(continuityText).length - 1, 1);
});
function adapterBody(task, toolMode) {
    return new OpenAICompatibleAdapter({ provider: 'openai-compatible', model: 'gpt-4o', toolMode,
        apiKey: 'fixture', baseUrl: 'http://127.0.0.1:1/v1' }).buildRequestBody(task);
}

// Check observable role/data/protocol contracts, not production prompt prose.
test('default, absent and disabled-only layouts produce the same completed handoff', async () => {
    const baseline = await build();
    for (const layout of [createDefaultLayout(), { version: 1, blocks: [{ id: 'content' }] }, 'garbage',
        addBlock(createDefaultLayout(), custom('assistant', 'GHOST', { enabled: false }), 3)]) {
        const result = await build(layout);
        assert.deepEqual(result.task, baseline.task);
        assert.deepEqual(result.emits, baseline.emits);
    }
    assert.equal(baseline.task.systemPrompt, '');
    assert.equal(baseline.task.toolChoice, 'auto');
    assert.deepEqual(baseline.task.messages.map(message => message.role), ROLES);
    assert.equal(documents(baseline.task).at(-1).approved, true);
    assert.deepEqual(baseline.emits[0].chat.map(message => message.role), ROLES);
    assert.equal(JSON.stringify(baseline.emits).includes(M), false);
});

test('materials and requirements move into separate JSON results without duplicate data', async () => {
    const world = '世界资料："雨城"\n\\街道 $& $1 $$';
    const character = { name: '阿璃', type: 'girl', appearance: 'silver hair', outfits: [{ name: '外套', tags: 'red coat' }] };
    const { task } = await build(undefined, { worldbookEntries: world, presentCharacters: [character],
        maxCharactersPerImage: 2, messageText: '独一无二的正文。她说"你好"。' });
    const [materials, guide] = documents(task);
    assert.ok(materials.content.includes(world));
    assert.ok(materials.content.includes(character.appearance));
    assert.ok(materials.content.includes('red coat'));
    assert.ok(materials.content.includes('【插图点 1】'));
    assert.ok(guide.content.includes(PROMPTS.tagGuideContent));
    assert.ok(guide.content.includes(PROMPTS.sceneRules));
    const data = task.messages.map(message => message.role === 'tool' ? JSON.parse(message.content).content : message.content).join('\n');
    for (const token of [world, character.appearance, '独一无二的正文', PROMPTS.tagGuideContent, PROMPTS.sceneRules]) {
        assert.equal(data.split(token).length - 1, 1, token);
    }
    assert.equal(task.tools[0].function.parameters.properties.images.items.properties.characters.maxItems, 2);
});

test('dynamic macros expand once before JSON serialization and custom blocks cannot capture data slots', async () => {
    const runtime = createRuntime();
    runtime.runtime.substituteParams = text => {
        runtime.calls.push(text);
        return text.replace(/\{\{(user|nested|later)\}\}/g, (_, key) => ({ user: '〈用户〉', nested: '{{later}}', later: 'WRONG_SECOND_PASS' })[key]);
    };
    const layout = layoutOf(ORDER, { 0: custom('system', '{{lastMessage}} {$worldInfo} {{characterInfo}}'), 99: custom('assistant', '{{user}} / {{lastMessage}}') });
    const { task } = await build(layout, { messageText: '剧情{{nested}}，她拿着$&和"钥匙"。', worldbookEntries: 'WORLD{{nested}}',
        presentCharacters: [{ name: '角色{{nested}}', type: 'girl' }], expansionOptions: { runtime: runtime.runtime } });
    const [materials] = documents(task);
    assert.ok(materials.content.includes('剧情{{later}}'));
    assert.ok(materials.content.includes('WORLD{{later}}'));
    assert.ok(materials.content.includes('角色{{later}}'));
    assert.ok(materials.content.includes('$&'));
    assert.equal(JSON.stringify(task).includes('WRONG_SECOND_PASS'), false);
    assert.equal(task.messages.find(message => message.content === '〈用户〉 / {{lastMessage}}').role, 'assistant');
    assert.equal(JSON.stringify(task).includes('XBDRAWSLOT_'), false);
    assert.equal(runtime.calls.filter(text => text.includes('剧情{{nested}}')).length, 1);
    assert.equal(runtime.calls.filter(text => text.includes('WORLD{{nested}}')).length, 1);
    assert.equal(runtime.calls.filter(text => text.includes('角色{{nested}}')).length, 1);
});

test('custom messages keep roles, order and enabled state, followed by the final approval', async () => {
    const layout = layoutOf(ORDER, { 1: custom('system', 'EXTRA-S'), 7: custom('user', 'EXTRA-U'),
        99: custom('assistant', 'TAIL {{user}}'), 100: custom('user', 'GHOST', { enabled: false }) });
    const { task } = await build(layout);
    const expected = [['EXTRA-S', 'system'], ['EXTRA-U', 'user'], ['TAIL 〈用户〉', 'assistant']];
    const positions = expected.map(([text, role]) => {
        const index = task.messages.findIndex(message => message.content.includes(text));
        assert.equal(task.messages[index].role, role);
        return index;
    });
    assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
    assert.equal(JSON.stringify(task).includes('GHOST'), false);
    assert.equal(documents(task).at(-1).approved, true);
    assertScenePlannerMessages(task.messages.map(({ toolProtocolMarker: _marker, ...message }) => message));
});

test('messages that expand to empty disappear without dropping an empty guide tool result', async () => {
    const layout = layoutOf(ORDER, { 99: custom('assistant', '{{empty}}') });
    const { task } = await build(layout, { promptDefaults: { ...PROMPTS, tagGuideContent: '', sceneRules: '' },
        expansionOptions: { runtime: { substituteParams: text => text.replace('{{empty}}', '') } } });
    assert.deepEqual(task.messages.map(message => message.role), ROLES);
    assert.equal(receipts(task).length, 3);
    assert.ok(task.messages.every(message => message.content.trim()));
});

test('untrusted marker text cannot inject tool instructions into a document or custom message', async () => {
    const { task } = await build(layoutOf(ORDER, { 99: custom('assistant', `头${M}尾`) }), {
        messageText: `她说${M}然后走了。`, worldbookEntries: `条目${M}`, presentCharacters: [{ name: `阿${M}璃`, type: 'girl' }],
    });
    assert.equal(task.messages.filter(message => message.content.includes(M)).length, 1);
    assert.equal(documents(task)[0].content.includes(M), false);
    assert.equal(task.messages.find(message => message.content === '头尾').role, 'assistant');
});

for (const toolMode of ['native', 'tagged-json']) {
    test(`${toolMode}: actual adapter preserves all handoff calls and JSON result data`, async () => {
        const { task, emits } = await build();
        const body = adapterBody(task, toolMode);
        assert.equal(JSON.stringify(body).includes(M), false);
        const calls = task.messages.flatMap(message => message.tool_calls || []);
        if (toolMode === 'native') {
            assert.equal(body.tool_choice, 'auto');
            assert.deepEqual(body.tools.map(tool => tool.function.name), ['submit_scene_plan']);
            assert.deepEqual(body.messages, emits[0].chat.map(({ providerPayload: _provider, ...message }) => message));
            assert.deepEqual(body.messages.filter(message => message.role === 'tool').map(message => message.tool_call_id), calls.map(call => call.id));
        } else {
            assert.equal(Object.hasOwn(body, 'tools'), false);
            assert.equal(Object.hasOwn(body, 'tool_choice'), false);
            const replayCalls = body.messages.filter(message => message.role === 'assistant').map(message => JSON.parse(message.content.match(/<tool_call>([\s\S]*?)<\/tool_call>/)[1]));
            assert.deepEqual(replayCalls.map(call => call.name), calls.map(call => call.function.name));
            assert.deepEqual(replayCalls.map(call => call.id), calls.map(call => call.id));
            const outputs = body.messages.filter(message => message.role === 'user' && message.content.startsWith('<tool_result>'));
            assert.deepEqual(outputs.map(message => JSON.parse(message.content.split('content:\n')[1].split('\n</tool_result>')[0])), documents(task));
        }
    });
}

for (const order of [['tools', ...ORDER.filter(id => id !== 'tools')],
    ['opening', 'frame', 'guide', 'rules', 'worldInfo', 'tools', 'content', 'limits'],
    [...ORDER.filter(id => id !== 'tools'), 'tools']]) {
    test(`moved tool instructions stay outside documents and appear once: ${order.indexOf('tools')}`, async () => {
        const { task } = await build(layoutOf(order));
        const protocol = buildTaggedMessages({ tools: task.tools, toolChoice: task.toolChoice, messages: [{ role: 'user', content: 'x' }] })[0].content;
        const body = adapterBody(task, 'tagged-json');
        assert.equal(body.messages.filter(message => message.role === 'system' && message.content.includes(protocol)).length, 1);
        assert.equal(documents(task).some(result => result.content.includes(M)), false);
        assert.equal(adapterBody(task, 'native').messages.some(message => message.content.includes(M)), false);
    });
}

test('prepared prompt survives JSON transfer and replays the same paired messages', async () => {
    const prepared = await prepareScenePlannerInput({ messageText: NARRATIVE, promptDefaults: PROMPTS,
        customPrompts: { layout: layoutOf(ORDER, { 99: custom('assistant', 'TAIL') }) },
        expansionOptions: { runtime: createRuntime().runtime }, agentCaller: async () => {},
        agentOptions: { providerConfig: { provider: 'openai-compatible', model: 'offline' } } });
    const transferred = JSON.parse(JSON.stringify(prepared));
    assertScenePlannerMessages(transferred.planner.prompt.messages);
    const task = createPreparedScenePlannerTask(transferred);
    assert.equal(task.toolChoice, 'auto');
    assert.deepEqual(task.messages.map(({ toolProtocolMarker: _marker, ...message }) => message), transferred.planner.prompt.messages);
    assert.deepEqual(task.tools.map(tool => tool.function.name), ['submit_scene_plan']);
});

test('default structure preview locates editable sections in their actual message stages', async () => {
    const { task } = await build();
    const preview = buildScenePlannerChainPreview();
    assert.deepEqual(preview.filter(item => item.role !== 'tools').map(item => item.role), task.messages.map(message => message.role));
    assert.equal(preview.find(item => item.sections?.some(section => section.key === 'topSystem')).role, 'system');
    assert.equal(preview.find(item => item.sections?.some(section => section.key === 'tagGuide')).role, 'tool');
    assert.equal(preview.find(item => item.sections?.some(section => section.key === 'content')).role, 'tool');
});

test('current-draft preview follows actual assembly after custom insertion, disabling and legacy reordering', async () => {
    const extras = [custom('user', 'EARLY'), custom('assistant', 'MIDDLE'), custom('user', 'DISABLED', { enabled: false })];
    for (const order of [ORDER, [...ORDER].reverse()]) {
        const layout = { version: 1, blocks: [...order.slice(0, 2).map(id => ({ id })), extras[0],
            ...order.slice(2, 5).map(id => ({ id })), extras[1], ...order.slice(5).map(id => ({ id })), extras[2]] };
        const { task } = await build(layout);
        const preview = buildScenePlannerChainPreview({ layout }).filter(item => item.role !== 'tools');
        assert.deepEqual(preview.map(item => item.role), task.messages.map(message => message.role));
        const shown = preview.flatMap(item => item.sections).filter(section => extras.some(block => block.id === section.key));
        assert.deepEqual(shown.map(section => section.content), ['EARLY', 'MIDDLE']);
    }
});

const VALID_ARGUMENTS = { images: [{ index: 1, insert_after: 1, scene: 'opening door, indoor', characters: [] }] };
async function runPlanner(toolMode, replies) {
    resetDrawAgentRuntimeForTests();
    const requests = [];
    const result = await generateAndParseScenePlan({ messageText: '阿璃推开门。', maxImages: 1, promptDefaults: PROMPTS,
        expansionOptions: { runtime: { substituteParams: text => text } },
        agentOptions: {
            providerConfig: { provider: 'openai-compatible', model: 'gpt-4o', apiKey: 'fixture', toolMode },
            agentCore: { createAgentAdapter: config => {
                const adapter = new OpenAICompatibleAdapter(config);
                adapter.client.chat.completions.create = async body => {
                    requests.push(structuredClone(body));
                    const args = JSON.stringify(replies[requests.length - 1]);
                    const message = toolMode === 'native'
                        ? { role: 'assistant', content: '', tool_calls: [{ id: `submit-${requests.length}`, type: 'function', function: { name: 'submit_scene_plan', arguments: args } }] }
                        : { role: 'assistant', content: `<tool_call>${JSON.stringify({ name: 'submit_scene_plan', arguments: JSON.parse(args) })}</tool_call>` };
                    return { choices: [{ message, finish_reason: toolMode === 'native' ? 'tool_calls' : 'stop' }] };
                };
                return adapter;
            } },
        },
    });
    return { result, requests };
}
for (const toolMode of ['native', 'tagged-json']) {
    test(`${toolMode}: completed history adds no model request on a successful plan`, async t => {
        t.mock.method(console, 'log', () => {});
        const { result, requests } = await runPlanner(toolMode, [VALID_ARGUMENTS]);
        assert.equal(requests.length, 1);
        assert.equal(result.length, 1);
        assert.equal(result[0].scene, VALID_ARGUMENTS.images[0].scene);
        assert.equal(getLastDrawAgentDiagnostic().toolChoice, 'auto');
        assert.equal(getLastDrawAgentDiagnostic().correctionCount, 0);
    });
    test(`${toolMode}: existing correction appends to the handoff without replaying local reads`, async t => {
        t.mock.method(console, 'log', () => {});
        const { result, requests } = await runPlanner(toolMode, [{}, VALID_ARGUMENTS]);
        assert.equal(result.length, 1);
        assert.equal(requests.length, 2);
        assert.deepEqual(requests[1].messages.slice(0, requests[0].messages.length), requests[0].messages);
        assert.equal(getLastDrawAgentDiagnostic().correctionCount, 1);
    });
}
