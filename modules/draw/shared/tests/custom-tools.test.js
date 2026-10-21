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
    MAX_TOOL_BLOCKS,
    addBlockAfter,
    createCustomBlock,
    createDefaultLayout,
    createToolBlock,
    describeBlock,
    duplicateBlocks,
    isDefaultLayout,
    layoutForStorage,
    normalizeLayout,
    setBlocksEnabled,
    updateBlock,
} from '../scene-planner-layout.js';
import { planScenePlannerMessages } from '../scene-planner-assembly.js';
import { createInProcessToolHost } from './helpers/in-process-tool-host.js';

const GAME_CONTENT_CODE = `return {
    name: "game_content",
    description: "# 你的全部输出应当在此工具内。",
    parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] },
    action: async (args) => { return JSON.stringify({ ok: true }); },
    stealth: false,
};`;

test('tool blocks keep kind and code through normalization, other blocks stay exactly as before', () => {
    const tool = createToolBlock({ name: '防截断', content: '说明', code: GAME_CONTENT_CODE }, [], () => 0.1);
    const plain = createCustomBlock({ role: 'user', content: 'hi' }, [tool.id], () => 0.2);
    const layout = addBlockAfter(addBlockAfter(createDefaultLayout(), tool), plain, tool.id);
    const blocks = layout.blocks.filter(block => !describeBlock(block).builtin);
    assert.deepEqual(blocks[0], { ...tool });
    assert.equal(blocks[0].kind, 'tool');
    assert.equal(blocks[0].role, 'system');
    assert.equal(Object.hasOwn(blocks[1], 'kind'), false);
    assert.equal(Object.hasOwn(blocks[1], 'code'), false);
    assert.equal(describeBlock(blocks[0]).kind, 'tool');
    // 序列化往返不变；默认布局不受影响。
    assert.deepEqual(normalizeLayout(JSON.parse(JSON.stringify(layout))).layout, layout);
    assert.equal(isDefaultLayout(createDefaultLayout()), true);
    assert.equal(isDefaultLayout(layout), false);
    assert.deepEqual(layoutForStorage(layout), layout);
});

test('tool block code is editable, copyable and toggleable like other custom blocks; plain blocks ignore code patches', () => {
    const tool = createToolBlock({ code: 'return {}' }, [], () => 0.3);
    const plain = createCustomBlock({ content: 'x' }, [tool.id], () => 0.4);
    let layout = addBlockAfter(addBlockAfter(createDefaultLayout(), tool), plain);
    layout = updateBlock(layout, tool.id, { code: GAME_CONTENT_CODE });
    layout = updateBlock(layout, plain.id, { code: 'evil()' });
    const find = id => layout.blocks.find(block => block.id === id);
    assert.equal(find(tool.id).code, GAME_CONTENT_CODE);
    assert.equal(Object.hasOwn(find(plain.id), 'code'), false);
    const copied = duplicateBlocks(layout, [tool.id], () => 0.5);
    assert.equal(copied.copies.length, 1);
    const copy = copied.layout.blocks.find(block => block.id === copied.copies[0].id);
    assert.equal(copy.kind, 'tool');
    assert.equal(copy.code, GAME_CONTENT_CODE);
    layout = setBlocksEnabled(layout, [tool.id], false);
    assert.equal(find(tool.id).enabled, false);
    assert.equal(collectToolBlocks(layout).length, 0);
});

test('at most MAX_TOOL_BLOCKS tool blocks survive normalization, with a note', () => {
    const raw = { version: 1, blocks: Array.from({ length: MAX_TOOL_BLOCKS + 2 }, (_, index) => ({ id: `t${index}`, role: 'system', name: '', content: '', enabled: true, kind: 'tool', code: 'x' })) };
    const { layout, notes } = normalizeLayout(raw);
    assert.equal(layout.blocks.filter(block => block.kind === 'tool').length, MAX_TOOL_BLOCKS);
    assert.ok(notes.some(note => note.includes('工具块最多')));
});

test('a tool block sends its instruction like a custom message and only while enabled', () => {
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
