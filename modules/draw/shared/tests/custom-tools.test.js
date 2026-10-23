import assert from 'node:assert/strict';
import test from 'node:test';
import {
    DEFAULT_TOOL_CODE,
    collectToolBlocks,
    extractToolName,
    formatToolResult,
    normalizeToolDefinition,
    normalizeToolDefinitions,
    resolveCustomToolDefinitions,
    toFunctionTool,
    toToolResponseObject,
} from '../custom-tools.js';
import {
    MAX_TOOLS,
    MAX_TOOL_CODE_CHARS,
    addBlockAfter,
    createCustomBlock,
    createDefaultLayout,
    describeBlock,
    duplicateBlocks,
    hasTool,
    isDefaultLayout,
    layoutForStorage,
    normalizeLayout,
    setBlocksEnabled,
    updateBlock,
} from '../scene-planner-layout.js';
import { planScenePlannerMessages } from '../scene-planner-assembly.js';
import { createInProcessToolHost } from './helpers/in-process-tool-host.js';
import { createToolBlock } from './helpers/tool-block.js';

// Oversize executable code must remain intact in drafts and be rejected before storage/execution (lost code / unintended execution).
test('oversize code survives editing and normalization but cannot be stored or executed', async () => {
    const code = 'x'.repeat(MAX_TOOL_CODE_CHARS + 1);
    const block = createCustomBlock({ tool: { code } });
    const layout = addBlockAfter(createDefaultLayout(), block);
    assert.equal(normalizeLayout(layout).layout.blocks.at(-1).tool.code, code);
    assert.throws(() => layoutForStorage(layout), { code: 'CUSTOM_TOOL_CODE_TOO_LONG' });
    let defined = false;
    await assert.rejects(resolveCustomToolDefinitions(layout, { define() { defined = true; } }), error => {
        assert.equal(error.code, 'CUSTOM_TOOL_INVALID');
        assert.equal(error.cause.code, 'CUSTOM_TOOL_CODE_TOO_LONG');
        return true;
    });
    assert.equal(defined, false);
    assert.equal(layout.blocks.at(-1).tool.code, code);
    const shorter = updateBlock(layout, block.id, { tool: { code: code.slice(0, MAX_TOOL_CODE_CHARS) } });
    assert.equal(layoutForStorage(shorter).blocks.at(-1).tool.code.length, MAX_TOOL_CODE_CHARS);
});

const GAME_CONTENT_CODE = `return {
    name: "game_content",
    description: "# 你的全部输出应当在此工具内。",
    parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
    action: async (args) => { return JSON.stringify({ ok: true }); },
    stealth: false,
};`;

test('a message can carry a tool; it survives normalization and other blocks stay exactly as before', () => {
    const tool = createToolBlock({ name: '防截断', content: '说明', code: GAME_CONTENT_CODE }, [], () => 0.1);
    const plain = createCustomBlock({ role: 'user', content: 'hi' }, [tool.id], () => 0.2);
    const layout = addBlockAfter(addBlockAfter(createDefaultLayout(), tool), plain, tool.id);
    const blocks = layout.blocks.filter(block => !describeBlock(block).builtin);
    assert.deepEqual(blocks[0], { ...tool });
    assert.deepEqual(blocks[0].tool, { code: GAME_CONTENT_CODE });
    assert.equal(blocks[0].role, 'system');
    assert.equal(Object.hasOwn(blocks[1], 'tool'), false);
    assert.equal(describeBlock(blocks[0]).hasTool, true);
    assert.equal(Object.hasOwn(describeBlock(blocks[1]), 'hasTool'), false);
    // 序列化往返不变；默认布局不受影响。
    assert.deepEqual(normalizeLayout(JSON.parse(JSON.stringify(layout))).layout, layout);
    assert.equal(isDefaultLayout(createDefaultLayout()), true);
    assert.equal(isDefaultLayout(layout), false);
    assert.deepEqual(layoutForStorage(layout), layout);
});

test('the tool is attached, edited and detached by patching the message; disabling the message disables the tool', () => {
    const tool = createToolBlock({ code: 'return {}' }, [], () => 0.3);
    const plain = createCustomBlock({ content: 'x' }, [tool.id], () => 0.4);
    let layout = addBlockAfter(addBlockAfter(createDefaultLayout(), tool), plain);
    const find = id => layout.blocks.find(block => block.id === id);
    layout = updateBlock(layout, tool.id, { tool: { code: GAME_CONTENT_CODE } });
    assert.equal(find(tool.id).tool.code, GAME_CONTENT_CODE);
    layout = updateBlock(layout, plain.id, { tool: { code: 'return {}' } });
    assert.equal(hasTool(find(plain.id)), true, '勾上“附带工具”就是给这条消息 patch 一个 tool');
    layout = updateBlock(layout, plain.id, { tool: null });
    assert.equal(Object.hasOwn(find(plain.id), 'tool'), false);
    assert.equal(find(plain.id).content, 'x', '取消附带工具不动消息本身');
    layout = updateBlock(layout, plain.id, { code: 'evil()', kind: 'tool' });
    assert.equal(Object.hasOwn(find(plain.id), 'code'), false);
    assert.equal(Object.hasOwn(find(plain.id), 'kind'), false);
    // 复制只带消息，不带工具（两个同名工具会冲突）。
    const copied = duplicateBlocks(layout, [tool.id, plain.id], () => 0.5);
    assert.deepEqual(copied.copies.map(copy => copy.droppedTool), [true, false]);
    const copy = copied.layout.blocks.find(block => block.id === copied.copies[0].id);
    assert.equal(copy.content, find(tool.id).content);
    assert.equal(Object.hasOwn(copy, 'tool'), false);
    assert.equal(collectToolBlocks(copied.layout).length, 1);
    layout = setBlocksEnabled(layout, [tool.id], false);
    assert.equal(find(tool.id).enabled, false);
    assert.equal(collectToolBlocks(layout).length, 0);
});

test('an old standalone tool block (kind: tool + code) is not migrated: it reads as a plain message', () => {
    const raw = { version: 1, blocks: [{ id: 'old1', role: 'system', name: '旧工具', content: '说明', enabled: true, kind: 'tool', code: GAME_CONTENT_CODE }] };
    const { layout } = normalizeLayout(raw);
    const old = layout.blocks.find(block => block.id === 'old1');
    assert.equal(old.content, '说明');
    assert.equal(Object.hasOwn(old, 'tool'), false);
    assert.equal(Object.hasOwn(old, 'kind'), false);
    assert.equal(Object.hasOwn(old, 'code'), false);
    assert.equal(collectToolBlocks(layout).length, 0);
});

test('at most MAX_TOOLS attached tools survive normalization (the messages stay), with a note', () => {
    const raw = { version: 1, blocks: Array.from({ length: MAX_TOOLS + 2 }, (_, index) => ({ id: `t${index}`, role: 'system', name: '', content: 'm', enabled: true, tool: { code: 'x' } })) };
    const { layout, notes } = normalizeLayout(raw);
    assert.equal(layout.blocks.filter(hasTool).length, MAX_TOOLS);
    assert.equal(layout.blocks.filter(block => !describeBlock(block).builtin).length, MAX_TOOLS + 2);
    assert.ok(notes.some(note => note.includes('附带工具最多')));
});

test('a message with a tool sends its content like any custom message and only while enabled', () => {
    const tool = createToolBlock({ content: '请调用 game_content', code: GAME_CONTENT_CODE }, [], () => 0.6);
    const layout = addBlockAfter(createDefaultLayout(), tool);
    const builtinTexts = { opening: 'O', frame: 'F', guide: 'G', rules: 'R', worldInfo: 'W', content: 'C', limits: 'L' };
    const on = planScenePlannerMessages({ layout, builtinTexts });
    assert.ok(on.templates.some(item => item.template.includes('请调用 game_content')));
    const off = planScenePlannerMessages({ layout: setBlocksEnabled(layout, [tool.id], false), builtinTexts });
    assert.ok(!off.templates.some(item => item.template.includes('请调用 game_content')));
    assert.ok(!JSON.stringify(on).includes('return {'), '代码本身不会进请求');
});

test('extractToolName only reads text, it never runs code', () => {
    assert.equal(extractToolName(GAME_CONTENT_CODE), 'game_content');
    assert.equal(extractToolName(DEFAULT_TOOL_CODE), 'note');
    assert.equal(extractToolName("return { name: 'a_b' }"), 'a_b');
    assert.equal(extractToolName('throw new Error("boom")'), '');
});

test('normalizeToolDefinition accepts a Reborn style definition and rejects bad ones with readable reasons', () => {
    const ok = normalizeToolDefinition({ name: 'game_content', description: 'd', parameters: { type: 'object', properties: { content: { type: 'string' } }, required: ['content'] }, stealth: true });
    assert.deepEqual(toFunctionTool(ok), {
        type: 'function',
        function: { name: 'game_content', description: 'd', parameters: { type: 'object', properties: { content: { type: 'string' } }, required: ['content'] } },
    });
    assert.equal(ok.stealth, true);
    assert.deepEqual(normalizeToolDefinition({ name: 'x' }).parameters, { type: 'object', properties: {} });
    assert.throws(() => normalizeToolDefinition(null), /return 一个对象/);
    assert.throws(() => normalizeToolDefinition({ name: '1bad' }), /工具名无效/);
    assert.throws(() => normalizeToolDefinition({ name: 'a-b' }), /工具名无效/);
    assert.throws(() => normalizeToolDefinition({ name: 'submit_scene_plan' }), /不能叫 submit_scene_plan/);
    assert.throws(() => normalizeToolDefinition({ name: 'a', parameters: { type: 'string' } }), /type 为 "object"/);
    assert.throws(() => normalizeToolDefinition({ name: 'a', parameters: { type: 'object', required: 'x' } }), /required/);
    assert.throws(() => normalizeToolDefinition({ name: 'a' }, { usedNames: ['a'] }), /工具名重复/);
    assert.throws(() => normalizeToolDefinitions([{ name: 'a' }, { name: 'a' }]), /工具名重复/);
});

test('tool results are formatted for the model: strings as is, other values as JSON, capped', () => {
    assert.equal(formatToolResult('ok'), 'ok');
    assert.equal(formatToolResult({ ok: true }), '{"ok":true}');
    assert.equal(formatToolResult(undefined), '{}');
    assert.match(formatToolResult('x'.repeat(30000)), /已截断，共 30000 字/);
    assert.deepEqual(toToolResponseObject('{"ok":true}'), { ok: true });
    assert.deepEqual(toToolResponseObject('plain'), { result: 'plain' });
    assert.deepEqual(toToolResponseObject('[1]'), { result: '[1]' });
});

test('resolveCustomToolDefinitions reads enabled blocks through the host and refuses to run without one', async () => {
    const on = createToolBlock({ name: 'T', code: GAME_CONTENT_CODE }, [], () => 0.11);
    const off = createToolBlock({ code: 'return {}', enabled: false }, [on.id], () => 0.12);
    const empty = createToolBlock({ code: '   ' }, [on.id, off.id], () => 0.13);
    let layout = createDefaultLayout();
    for (const block of [on, off, empty]) layout = addBlockAfter(layout, block);
    const host = createInProcessToolHost();
    const definitions = await resolveCustomToolDefinitions(layout, host);
    assert.deepEqual(definitions.map(item => item.name), ['game_content']);
    assert.deepEqual(await resolveCustomToolDefinitions(createDefaultLayout(), null), []);
    await assert.rejects(resolveCustomToolDefinitions(layout, null), { code: 'CUSTOM_TOOL_HOST_MISSING' });
    const broken = addBlockAfter(createDefaultLayout(), createToolBlock({ name: '坏的', code: 'return { name: "1x", action() {} }' }, [], () => 0.2));
    await assert.rejects(resolveCustomToolDefinitions(broken, host), error => error.code === 'CUSTOM_TOOL_INVALID' && /坏的/.test(error.message) && /工具名无效/.test(error.message));
    const throwing = addBlockAfter(createDefaultLayout(), createToolBlock({ code: 'throw new Error("boom")' }, [], () => 0.3));
    await assert.rejects(resolveCustomToolDefinitions(throwing, host), { code: 'CUSTOM_TOOL_INVALID' });
    const duplicate = addBlockAfter(addBlockAfter(createDefaultLayout(), createToolBlock({ code: GAME_CONTENT_CODE }, [], () => 0.4)), createToolBlock({ code: GAME_CONTENT_CODE }, ['msg-x'], () => 0.5));
    await assert.rejects(resolveCustomToolDefinitions(duplicate, host), /工具名重复/);
});
