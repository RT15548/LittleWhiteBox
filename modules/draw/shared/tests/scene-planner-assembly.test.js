import test from 'node:test';
import assert from 'node:assert/strict';

import { TOOL_PROTOCOL_MARKER as M } from '../../../agent-core/adapters/tool-protocol-marker.js';
import { planScenePlannerMessages } from '../scene-planner-assembly.js';
import {
    addBlock,
    createCustomBlock,
    createDefaultLayout,
    reorderBlocks,
} from '../scene-planner-layout.js';
const BASE_TEXTS = {
    opening: 'OPEN',
    frame: 'FRAME',
    guide: 'GUIDE',
    rules: 'RULES',
    worldInfo: 'WORLD',
    content: 'CONTENT',
    limits: 'LIMITS',
};

// 注入确定性 random，保证自定义块 id 互不相同。
let idCounter = 0;
function custom(role, content, { enabled } = {}) {
    return createCustomBlock({ role, content, name: 'x', enabled }, [], () => (idCounter += 1) / 36 ** 6);
}

function withCustom(layout, block, index) {
    return addBlock(layout, block, index);
}

function plan(layout, texts = BASE_TEXTS) {
    return planScenePlannerMessages({ layout, builtinTexts: texts });
}

function simplify(result) {
    return result.templates.map((item) => [item.role, item.template]);
}

test('default layout is legacy: [system, user], tools marker stripped, blocks joined by blank lines', () => {
    const result = plan(createDefaultLayout());
    assert.equal(result.legacy, true);
    assert.deepEqual(simplify(result), [
        ['system', 'OPEN\n\nFRAME\n\nGUIDE\n\nRULES'],
        ['user', 'WORLD\n\nCONTENT\n\nLIMITS'],
    ]);
    // blockIds 仍记录 tools 块，便于调用方定位。
    assert.deepEqual(result.templates[0].blockIds, ['opening', 'frame', 'guide', 'rules', 'tools']);
    assert.deepEqual(result.templates[1].blockIds, ['worldInfo', 'content', 'limits']);
});

test('absent / invalid layouts behave as the default layout', () => {
    const expected = plan(createDefaultLayout());
    for (const raw of [undefined, null, 'oops', 7, {}, { blocks: 'x' }, []]) {
        assert.deepEqual(plan(raw), expected);
    }
    // 缺内置块的布局会被自愈补回，仍是默认请求。
    assert.deepEqual(plan({ version: 1, blocks: [{ id: 'content' }] }).templates.map((item) => item.role), ['system', 'user']);
});

test('missing builtinTexts is tolerated and yields an empty legacy request', () => {
    for (const input of [undefined, {}, { layout: undefined }, { builtinTexts: null }]) {
        const result = planScenePlannerMessages(input);
        assert.equal(result.legacy, true);
        assert.deepEqual(simplify(result), [['system', ''], ['user', '']]);
    }
});

test('empty built-in blocks are omitted entirely', () => {
    const result = plan(createDefaultLayout(), { ...BASE_TEXTS, opening: '  \n ', guide: '', rules: '\t', worldInfo: '' });
    assert.deepEqual(simplify(result), [['system', 'FRAME'], ['user', 'CONTENT\n\nLIMITS']]);
    assert.deepEqual(result.templates[0].blockIds, ['frame', 'tools']);
    assert.deepEqual(result.templates[1].blockIds, ['content', 'limits']);
});

test('block texts are trimmed before joining', () => {
    const result = plan(createDefaultLayout(), { ...BASE_TEXTS, opening: '\n\n OPEN \n\n', limits: ' LIMITS\n' });
    assert.deepEqual(simplify(result), [
        ['system', 'OPEN\n\nFRAME\n\nGUIDE\n\nRULES'],
        ['user', 'WORLD\n\nCONTENT\n\nLIMITS'],
    ]);
});

test('empty custom blocks do not split neighbouring same-role blocks', () => {
    let layout = createDefaultLayout();
    // opening 与 frame 之间插一条空的 user 自定义块：若不省略，会把 system 劈成两条。
    layout = withCustom(layout, custom('user', '   '), 1);
    layout = withCustom(layout, custom('assistant', ''), 3);
    const result = plan(layout);
    assert.equal(result.legacy, true);
    assert.deepEqual(simplify(result), [
        ['system', 'OPEN\n\nFRAME\n\nGUIDE\n\nRULES'],
        ['user', 'WORLD\n\nCONTENT\n\nLIMITS'],
    ]);
});

test('disabled custom blocks are skipped and do not split merges', () => {
    let layout = createDefaultLayout();
    layout = withCustom(layout, custom('assistant', 'GHOST', { enabled: false }), 2);
    layout = withCustom(layout, custom('system', 'GHOST2', { enabled: false }), 6);
    const result = plan(layout);
    assert.equal(result.legacy, true);
    assert.equal(JSON.stringify(result).includes('GHOST'), false);
    assert.deepEqual(simplify(result), simplify(plan(createDefaultLayout())));
});

test('custom block present but the result is still [system, user]: legacy, equal to plain concatenation', () => {
    let layout = createDefaultLayout();
    layout = withCustom(layout, custom('system', 'EXTRA-SYS'), 1);
    layout = withCustom(layout, custom('user', 'EXTRA-USER'), 7);
    const result = plan(layout);
    assert.equal(result.legacy, true);
    assert.deepEqual(simplify(result), [
        ['system', 'OPEN\n\nEXTRA-SYS\n\nFRAME\n\nGUIDE\n\nRULES'],
        ['user', 'WORLD\n\nEXTRA-USER\n\nCONTENT\n\nLIMITS'],
    ]);
});

test('reordering inside the user group keeps legacy and follows the new order', () => {
    const layout = reorderBlocks(createDefaultLayout(), ['opening', 'frame', 'guide', 'rules', 'tools', 'limits', 'content', 'worldInfo']);
    const result = plan(layout);
    assert.equal(result.legacy, true);
    assert.deepEqual(simplify(result)[1], ['user', 'LIMITS\n\nCONTENT\n\nWORLD']);
});

test('tools block moved to the front of the system group: not legacy, marker leads the system message', () => {
    const layout = reorderBlocks(createDefaultLayout(), ['tools', 'opening', 'frame', 'guide', 'rules', 'worldInfo', 'content', 'limits']);
    const result = plan(layout);
    assert.equal(result.legacy, false);
    assert.deepEqual(simplify(result), [
        ['system', `${M}\n\nOPEN\n\nFRAME\n\nGUIDE\n\nRULES`],
        ['user', 'WORLD\n\nCONTENT\n\nLIMITS'],
    ]);
});

test('tools block alone between user messages becomes its own system message', () => {
    const layout = reorderBlocks(createDefaultLayout(), ['opening', 'frame', 'guide', 'rules', 'worldInfo', 'tools', 'content', 'limits']);
    const result = plan(layout);
    assert.equal(result.legacy, false);
    assert.deepEqual(simplify(result), [
        ['system', 'OPEN\n\nFRAME\n\nGUIDE\n\nRULES'],
        ['user', 'WORLD'],
        ['system', M],
        ['user', 'CONTENT\n\nLIMITS'],
    ]);
});

test('a system block after the tools block pushes the marker off the end: not legacy', () => {
    const layout = withCustom(createDefaultLayout(), custom('system', 'AFTER-TOOLS'), 5);
    const result = plan(layout);
    assert.equal(result.legacy, false);
    assert.deepEqual(simplify(result)[0], ['system', `OPEN\n\nFRAME\n\nGUIDE\n\nRULES\n\n${M}\n\nAFTER-TOOLS`]);
});

test('a custom assistant tail message makes the request non-legacy and ends the list', () => {
    const layout = withCustom(createDefaultLayout(), custom('assistant', 'PREFILL'), 8);
    const result = plan(layout);
    assert.equal(result.legacy, false);
    assert.deepEqual(result.templates.map((item) => item.role), ['system', 'user', 'assistant']);
    assert.deepEqual(result.templates.at(-1), { role: 'assistant', template: 'PREFILL', blockIds: [layout.blocks[8].id] });
    // 非 legacy 时 system 末尾的标记原样保留，由适配器决定如何处理。
    assert.equal(result.templates[0].template.endsWith(`\n\n${M}`), true);
});

test('tools block placed after the user group yields a trailing system message', () => {
    const layout = reorderBlocks(createDefaultLayout(), ['opening', 'frame', 'guide', 'rules', 'worldInfo', 'content', 'limits', 'tools']);
    const result = plan(layout);
    assert.equal(result.legacy, false);
    assert.deepEqual(result.templates.map((item) => item.role), ['system', 'user', 'system']);
    assert.equal(result.templates[2].template, M);
});

test('tool protocol marker is removed from custom and built-in text; only the tools block yields it', () => {
    let layout = createDefaultLayout();
    layout = withCustom(layout, custom('system', `前${M}后`), 0);
    layout = withCustom(layout, custom('user', M), 7);
    layout = withCustom(layout, custom('system', `${M}\n\n${M}`), 4);
    const result = plan(layout, { ...BASE_TEXTS, opening: `O${M}P`, content: `${M}CONTENT` });
    const joined = result.templates.map((item) => item.template).join('\n---\n');
    // 只剩 tools 块那一个标记，且 legacy 时被剥掉。
    assert.equal(result.legacy, true);
    assert.equal(joined.includes(M), false);
    assert.deepEqual(simplify(result), [
        ['system', '前后\n\nOP\n\nFRAME\n\nGUIDE\n\nRULES'],
        ['user', 'WORLD\n\nCONTENT\n\nLIMITS'],
    ]);

    // 非 legacy 时恰好剩 tools 块的一个标记。
    const nonLegacy = plan(withCustom(layout, custom('assistant', `x${M}y`), 11), BASE_TEXTS);
    const count = nonLegacy.templates.map((item) => item.template).join('\n').split(M).length - 1;
    assert.equal(nonLegacy.legacy, false);
    assert.equal(count, 1);
    assert.equal(nonLegacy.templates.at(-1).template, 'xy');
});

test('a marker in the user template can never survive (stripped before legacy detection)', () => {
    const result = plan(createDefaultLayout(), { ...BASE_TEXTS, worldInfo: `W${M}` });
    assert.equal(result.legacy, true);
    assert.equal(result.templates[1].template.includes(M), false);
});

test('request without any user text keeps an empty user entry (same as before for the default layout)', () => {
    const result = plan(createDefaultLayout(), { opening: 'O', frame: 'F' });
    assert.equal(result.legacy, true);
    assert.deepEqual(simplify(result), [['system', 'O\n\nF'], ['user', '']]);

    // 非 legacy：也补一条空 user 在末尾，由调用方在展开后丢弃。
    const nonLegacy = plan(withCustom(createDefaultLayout(), custom('assistant', 'A'), 8), { opening: 'O', frame: 'F' });
    assert.equal(nonLegacy.legacy, false);
    assert.deepEqual(nonLegacy.templates.map((item) => item.role), ['system', 'assistant', 'user']);
});

test('consecutive same-role custom blocks merge across the whole list', () => {
    let layout = createDefaultLayout();
    layout = withCustom(layout, custom('assistant', 'A1'), 8);
    layout = withCustom(layout, custom('assistant', 'A2'), 9);
    layout = withCustom(layout, custom('user', 'U-LAST'), 10);
    const result = plan(layout);
    assert.deepEqual(simplify(result), [
        ['system', 'OPEN\n\nFRAME\n\nGUIDE\n\nRULES\n\n' + M],
        ['user', 'WORLD\n\nCONTENT\n\nLIMITS'],
        ['assistant', 'A1\n\nA2'],
        ['user', 'U-LAST'],
    ]);
});

test('planning does not mutate its input layout', () => {
    const layout = withCustom(createDefaultLayout(), custom('assistant', 'A'), 8);
    const snapshot = structuredClone(layout);
    plan(layout);
    assert.deepEqual(layout, snapshot);
});
