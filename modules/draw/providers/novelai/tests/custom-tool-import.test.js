import assert from 'node:assert/strict';
import test from 'node:test';
import { parseNovelPromptPresetImport } from '../novel-prompt-import.js';
import { MAX_TOOL_CODE_CHARS, addBlock, createCustomBlock, createDefaultLayout, hasTool } from '../../../shared/scene-planner-layout.js';
import { createToolBlock } from '../../../shared/tests/helpers/tool-block.js';

// Imported executable code stays disabled unless explicitly accepted (unwanted execution).
const TYPE = 'novel-draw-prompt-template';

// Import refuses oversize code without changing the supplied template (lost executable source).
test('import rejects an oversize tool whether or not its execution was accepted', () => {
    const code = 'x'.repeat(MAX_TOOL_CODE_CHARS + 1);
    const file = { _type: TYPE, _version: 4, topSystem: '', sceneRules: '', name: 'long',
        layout: addBlock(createDefaultLayout(), createCustomBlock({ tool: { code } })) };
    const before = JSON.stringify(file);
    for (const keepToolBlocks of [false, true]) {
        assert.throws(() => parseNovelPromptPresetImport(file, { keepToolBlocks }), { code: 'CUSTOM_TOOL_CODE_TOO_LONG' });
        assert.equal(JSON.stringify(file), before);
    }
});

test('imported messages with a tool arrive disabled with their code kept, and the import reports how many', () => {
    const tool = createToolBlock({ name: '防截断', content: '说明', code: 'return { name: "game_content", action() {} };' }, [], () => 0.2);
    const plain = createCustomBlock({ content: 'hi' }, [tool.id], () => 0.4);
    const layout = addBlock(addBlock(createDefaultLayout(), tool), plain);
    const file = { _type: TYPE, _version: 4, name: 'p', topSystem: 's', sceneRules: 'r', modelGuideOverrides: {}, layout };
    const imported = parseNovelPromptPresetImport(file);
    const blocks = imported.layout.blocks.filter(block => !['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'].includes(block.id));
    assert.deepEqual(blocks.map(block => [hasTool(block) ? 'tool' : 'message', block.enabled]), [['tool', false], ['message', true]]);
    assert.equal(blocks[0].tool.code, 'return { name: "game_content", action() {} };');
    assert.equal(blocks[0].content, '说明', '消息本身也一起关了');
    assert.equal(imported.disabledToolBlocks, 1);
    // 没有带工具的消息的文件完全不带这个字段。
    const without = parseNovelPromptPresetImport({ ...file, layout: addBlock(createDefaultLayout(), plain) });
    assert.equal(Object.hasOwn(without, 'disabledToolBlocks'), false);
});

test('after the user confirmed on the page, imported messages with a tool keep the enabled state from the file', () => {
    const tool = createToolBlock({ name: '防截断', code: 'return { name: "game_content", action() {} };' }, [], () => 0.2);
    const off = createToolBlock({ name: '关着的', code: 'return { name: "x", action() {} };', enabled: false }, [tool.id], () => 0.6);
    const layout = addBlock(addBlock(createDefaultLayout(), tool), off);
    const file = { _type: TYPE, _version: 4, name: 'p', topSystem: 's', sceneRules: 'r', modelGuideOverrides: {}, layout };
    const kept = parseNovelPromptPresetImport(file, { keepToolBlocks: true });
    const blocks = kept.layout.blocks.filter(hasTool);
    assert.deepEqual(blocks.map(block => block.enabled), [true, false]);
    assert.equal(Object.hasOwn(kept, 'disabledToolBlocks'), false);
    // 没确认（默认）：启用的先关，原本就关着的不计数。
    const declined = parseNovelPromptPresetImport(file);
    assert.deepEqual(declined.layout.blocks.filter(hasTool).map(block => block.enabled), [false, false]);
    assert.equal(declined.disabledToolBlocks, 1);
});
