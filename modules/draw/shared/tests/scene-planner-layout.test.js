// Contracts: preset data is preserved and the message skeleton cannot be rearranged.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
    BUILTIN_BLOCK_IDS, MAX_TOOL_CODE_CHARS, SCENE_PLANNER_LAYOUT_VERSION,
    addBlock, addBlockAfter, createCustomBlock, createDefaultLayout, duplicateBlocks,
    isDefaultLayout, layoutFingerprint, layoutForStorage, moveBlock, moveBlocks,
    normalizeLayout, projectScenePlannerLayout, removeBlock, removeBlocks,
    reorderBlocks, setBlocksEnabled, updateBlock,
} from '../scene-planner-layout.js';

const ORDER = ['opening', 'frame', 'tools', 'worldInfo', 'content', 'guide', 'rules', 'limits'];
const OLD_ORDER = ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'];
const custom = (id, extra = {}) => ({ id, role: 'user', name: '', content: '', enabled: true, ...extra });
const ids = layout => layout.blocks.map(block => block.id);
// afterApproval 只表示位置（提交确认之前 / 之后），不属于消息内容，比较内容时去掉。
const customs = layout => layout.blocks.filter(block => !BUILTIN_BLOCK_IDS.includes(block.id)).map((block) => {
    const content = { ...block };
    delete content.afterApproval;
    return content;
});
function fixed(layout) {
    assert.deepEqual(ids(layout).filter(id => BUILTIN_BLOCK_IDS.includes(id)), ORDER);
    for (const stage of projectScenePlannerLayout(layout)) {
        assert.deepEqual(stage.blocks.slice(0, stage.blockIds.length).map(block => block.id), stage.blockIds);
    }
}

test('v1 preset parsing fixes built-ins without losing or reordering custom messages and tool code', () => {
    const messages = [
        custom('a', { role: 'system', content: '  exact\ntext  ' }),
        custom('b', { role: 'assistant', enabled: false, tool: { code: 'return { name: "b" };' } }),
        custom('c', { content: '$& {{macro}} <script>test</script>', tool: { code: 'return { name: "c" };' } }),
    ];
    for (const order of [OLD_ORDER, [...OLD_ORDER].reverse(), ...OLD_ORDER.map((_, i) => [...OLD_ORDER.slice(i), ...OLD_ORDER.slice(0, i)])]) {
        const raw = { version: 1, blocks: [messages[0], ...order.slice(0, 3).map(id => ({ id })), messages[1], ...order.slice(3).map(id => ({ id })), messages[2]] };
        const snapshot = JSON.stringify(raw);
        const { layout } = normalizeLayout(raw);
        fixed(layout);
        assert.equal(layout.version, SCENE_PLANNER_LAYOUT_VERSION);
        assert.deepEqual(customs(layout), messages);
        assert.equal(JSON.stringify(raw), snapshot);
        assert.deepEqual(normalizeLayout(layout).layout, layout);
        assert.deepEqual(layoutForStorage(JSON.parse(JSON.stringify(layout))), layout);
    }
});

test('missing and duplicate built-ins are restored once without deleting custom messages', () => {
    for (const missing of ORDER) {
        const raw = { version: 1, blocks: [...OLD_ORDER.filter(id => id !== missing).map(id => ({ id })), { id: 'opening' }, custom('kept')] };
        const { layout } = normalizeLayout(raw);
        fixed(layout);
        assert.deepEqual(customs(layout), [custom('kept')]);
    }
    assert.equal(layoutForStorage(undefined), undefined);
    assert.equal(layoutForStorage({ version: 1, blocks: OLD_ORDER.map(id => ({ id })) }), undefined);
    assert.equal(isDefaultLayout(createDefaultLayout()), true);
});

test('insertion and repeated moves preserve complete stages and custom data', () => {
    for (const anchor of [...ORDER, undefined]) {
        let layout = addBlockAfter(createDefaultLayout(), custom('a', { content: 'A' }), anchor);
        layout = addBlockAfter(layout, custom('b', { content: 'B', enabled: false }), 'a');
        for (const direction of [-1, -1, -1, 1, 1, 1, 1, -1]) {
            layout = moveBlocks(layout, ['a', 'b', 'frame'], direction);
            fixed(layout);
            assert.deepEqual(customs(layout), [custom('a', { content: 'A' }), custom('b', { content: 'B', enabled: false })]);
        }
        const moved = reorderBlocks(layout, ['a', ...ids(layout).filter(id => id !== 'a')]);
        fixed(moved);
        assert.deepEqual(customs(moved), customs(layout));
        assert.deepEqual(moveBlock(layout, 'frame', -1), layout);
        assert.deepEqual(removeBlock(layout, 'content'), layout);
    }
});

test('one keyboard move crosses an entire stage and reversing it restores the same layout', () => {
    const start = addBlockAfter(createDefaultLayout(), custom('message'), 'tools');
    const next = moveBlock(start, 'message', 1);
    assert.deepEqual(projectScenePlannerLayout(next).map(stage => stage.customBlocks.map(block => block.id)), [[], ['message'], []]);
    assert.deepEqual(moveBlock(next, 'message', -1), start);
    const top = moveBlock(start, 'message', -1);
    assert.deepEqual(projectScenePlannerLayout(top)[0].leadingBlocks.map(block => block.id), ['message']);
    assert.deepEqual(moveBlock(top, 'message', 1), start);
    assert.deepEqual(moveBlock(top, 'message', -1), top);
});

test('custom messages can sit before every group; the groups keep their order and stay unsplit', () => {
    const raw = { version: 2, blocks: [custom('a', { role: 'system' }), custom('b'), ...ORDER.map(id => ({ id })), custom('c')] };
    const { layout } = normalizeLayout(raw);
    assert.deepEqual(ids(layout).slice(0, 2), ['a', 'b']);
    assert.deepEqual(projectScenePlannerLayout(layout)[0].leadingBlocks.map(block => block.id), ['a', 'b']);
    fixed(layout);
    assert.deepEqual(layout, normalizeLayout(layout).layout);
    for (const at of [0, 1, 3, 5, 7, 8]) {
        const placed = addBlock(createDefaultLayout(), custom('x'), at);
        fixed(placed);
        assert.equal(ids(placed).includes('x'), true);
    }
    assert.equal(ids(addBlock(createDefaultLayout(), custom('x'), 0))[0], 'x');
});

test('edit, disable, copy and delete affect only selected messages; copies do not register duplicate tools', () => {
    let layout = addBlock(createDefaultLayout(), custom('a', { tool: { code: 'private user source' } }));
    layout = addBlock(layout, custom('b', { content: 'B' }));
    const snapshot = structuredClone(layout);
    layout = updateBlock(layout, 'a', { content: 'new', role: 'assistant', name: 'draft ', enabled: false });
    assert.equal(customs(layout)[0].name, 'draft ');
    assert.equal(customs(layoutForStorage(layout))[0].name, 'draft');
    assert.notEqual(layoutFingerprint(layout), layoutFingerprint(snapshot));
    const result = duplicateBlocks(layout, ['a', 'frame'], () => 0);
    const copied = result.layout.blocks.find(block => block.id === result.copies[0].id);
    assert.equal(copied.enabled, false);
    assert.equal(copied.content, 'new');
    assert.equal(copied.tool, undefined);
    assert.equal(customs(layout)[0].tool.code, 'private user source');
    fixed(result.layout);
    const disabled = setBlocksEnabled(layout, ['b', 'content'], false);
    assert.deepEqual(customs(disabled).map(block => block.enabled), [false, false]);
    assert.deepEqual(removeBlocks(disabled, ['a', 'content']).removedIds, ['a']);
    assert.deepEqual(customs(removeBlocks(disabled, ['a', 'b']).layout), []);
    assert.deepEqual(snapshot.blocks.at(-2).tool, { code: 'private user source' });
});

test('invalid roles are disabled, duplicate IDs are unique, and user text survives intact', () => {
    const content = 'large\n'.repeat(10000);
    const { layout } = normalizeLayout({ version: 1, blocks: [
        ...OLD_ORDER.map(id => ({ id })), custom('same', { content }), custom('same', { role: 'tool' }),
        custom('bad id!', { content: 'keep' }), { role: 'system', content: 'missing-id' },
    ] });
    fixed(layout);
    assert.equal(new Set(ids(layout)).size, layout.blocks.length);
    assert.equal(customs(layout)[1].enabled, false);
    assert.deepEqual(customs(layout).map(block => block.content), [content, '', 'keep', 'missing-id']);
    assert.deepEqual(normalizeLayout(layout).layout, layout);
});

test('oversized source survives parsing and editing but cannot be silently truncated on save', () => {
    const code = 'x'.repeat(MAX_TOOL_CODE_CHARS + 1);
    const layout = addBlock(createDefaultLayout(), custom('tool', { tool: { code } }));
    assert.equal(customs(normalizeLayout(layout).layout)[0].tool.code, code);
    assert.throws(() => layoutForStorage(layout), { code: 'CUSTOM_TOOL_CODE_TOO_LONG' });
    assert.equal(customs(layout)[0].tool.code, code);
});

test('message IDs remain unique even when the random source repeats', () => {
    const taken = [...ORDER];
    for (let index = 0; index < 40; index++) {
        const block = createCustomBlock({ content: String(index) }, taken, () => 0);
        assert.equal(taken.includes(block.id), false);
        taken.push(block.id);
    }
});

test('a whole fixed group can move across neighbouring custom messages but never past another group', () => {
    const start = addBlockAfter(createDefaultLayout(), custom('m'), 'tools');
    const down = moveBlocks(start, ['tools'], 1);
    assert.deepEqual(projectScenePlannerLayout(down)[0].leadingBlocks.map(block => block.id), ['m']);
    fixed(down);
    assert.deepEqual(moveBlocks(down, ['tools'], -1), start);
    assert.deepEqual(moveBlocks(createDefaultLayout(), ['content'], -1), createDefaultLayout());
    assert.deepEqual(moveBlocks(createDefaultLayout(), ['limits'], 1), createDefaultLayout());
    assert.deepEqual(moveBlocks(start, ['frame'], 1), start);
});

test('messages can follow the approval pair; crossing it only flips their position and keeps their data', () => {
    let layout = addBlockAfter(createDefaultLayout(), custom('end', { content: 'END' }));
    assert.equal(layout.blocks.at(-1).afterApproval, true);
    assert.deepEqual(projectScenePlannerLayout(layout).at(-1).trailingBlocks.map(block => block.id), ['end']);
    assert.deepEqual(projectScenePlannerLayout(layout).at(-1).customBlocks, []);
    fixed(layout);
    const before = moveBlocks(layout, ['end'], -1);
    assert.equal(before.blocks.at(-1).afterApproval, undefined);
    assert.deepEqual(projectScenePlannerLayout(before).at(-1).customBlocks.map(block => block.id), ['end']);
    assert.deepEqual(moveBlocks(before, ['end'], 1), layout);
    assert.equal(customs(before)[0].content, 'END');
    const next = addBlockAfter(layout, custom('later'), 'end');
    assert.equal(next.blocks.at(-1).afterApproval, true);
    assert.deepEqual(reorderBlocks(layout, [...ids(layout).filter(id => id !== 'end'), 'approval', 'end']), layout);
    // 提交确认拖到这条消息之后：消息回到提交确认之前，数据不变。
    const flipped = reorderBlocks(layout, [...ids(layout).filter(id => id !== 'end'), 'end', 'approval']);
    assert.equal(flipped.blocks.at(-1).afterApproval, undefined);
    assert.deepEqual(flipped, before);
    assert.deepEqual(layout, normalizeLayout(layout).layout);
    assert.deepEqual(layoutForStorage(layout), layout);
    assert.equal(isDefaultLayout(layout), false);
});

test('a message whose id is the approval marker id is regenerated instead of vanishing on the next move', () => {
    const raw = { version: SCENE_PLANNER_LAYOUT_VERSION, blocks: [...ORDER.map(id => ({ id })), custom('approval', { content: '别丢' })] };
    const { layout } = normalizeLayout(raw);
    const [kept] = customs(layout);
    assert.equal(kept.content, '别丢');
    assert.notEqual(kept.id, 'approval');
    const moved = moveBlocks(layout, [kept.id], -1);
    assert.equal(customs(moved).length, 1);
    assert.equal(customs(reorderBlocks(layout, ids(layout))).length, 1);
});
