import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOL_PROTOCOL_MARKER as M } from '../../../agent-core/adapters/tool-protocol-marker.js';
import { planScenePlannerMessages } from '../scene-planner-assembly.js';
import { addBlock, createCustomBlock, createDefaultLayout, reorderBlocks } from '../scene-planner-layout.js';

const TEXTS = { opening: 'OPEN', frame: 'FRAME', guide: 'GUIDE', rules: 'RULES', worldInfo: 'WORLD', content: 'CONTENT', limits: 'LIMITS' };
const ORDER = ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'];
let sequence = 0;
const custom = (role, content, enabled = true) => createCustomBlock({ role, content, enabled }, [], () => ++sequence / 36 ** 6);
const plan = (layout, builtinTexts = TEXTS) => planScenePlannerMessages({ layout, builtinTexts }).templates;
const results = templates => templates.filter(item => item.role === 'tool');

// The external message protocol, not the prose wording, is the contract under test.
test('default request reads materials, reads requirements, then receives approval in three paired exchanges', () => {
    const templates = plan();
    assert.deepEqual(templates.map(item => item.role), ['system', 'user', 'assistant', 'tool', 'assistant', 'tool', 'assistant', 'tool']);
    const calls = templates.flatMap(item => item.tool_calls || []);
    assert.deepEqual(calls.map(call => call.function.name), ['read_scene_materials', 'read_drawing_guide', 'request_draw_approval']);
    assert.deepEqual(calls.map(call => call.id), results(templates).map(item => item.tool_call_id));
    assert.equal(new Set(calls.map(call => call.id)).size, 3);
    calls.forEach(call => assert.deepEqual(JSON.parse(call.function.arguments), {}));
    assert.equal(templates[0].template, `OPEN\n\nFRAME\n\n${M}`);
    assert.equal(results(templates)[0].template, 'WORLD\n\nCONTENT');
    assert.equal(results(templates)[1].template, 'GUIDE\n\nRULES\n\nLIMITS');
    assert.equal(results(templates)[2].approved, true);
});

test('absent, invalid and explicit default layouts use one assembly path', () => {
    const expected = plan(createDefaultLayout());
    for (const value of [undefined, null, 'oops', 7, {}, [], { blocks: 'x' }, { version: 1, blocks: [{ id: 'content' }] }]) {
        assert.deepEqual(plan(value), expected);
    }
});

test('empty document sections disappear without dropping the completed read exchange', () => {
    const templates = plan(undefined, { ...TEXTS, opening: ' ', guide: '', rules: '\t', worldInfo: '', limits: '' });
    assert.equal(templates[0].template, `FRAME\n\n${M}`);
    assert.equal(results(templates)[0].template, 'CONTENT');
    assert.equal(results(templates)[1].template, '');
    assert.equal(results(templates).length, 3);
});

test('legacy document order cannot rearrange the fixed readings', () => {
    const layout = reorderBlocks(createDefaultLayout(), ['opening', 'frame', 'limits', 'rules', 'guide', 'tools', 'content', 'worldInfo']);
    const templates = plan(layout);
    assert.equal(results(templates)[0].template, 'WORLD\n\nCONTENT');
    assert.equal(results(templates)[1].template, 'GUIDE\n\nRULES\n\nLIMITS');
});

test('custom blocks retain their roles and relative order outside atomic tool pairs', () => {
    const extra = [custom('system', 'EXTRA-S'), custom('user', 'EXTRA-U'), custom('assistant', 'EXTRA-A')];
    let layout = createDefaultLayout();
    layout = addBlock(layout, extra[0], 1);
    layout = addBlock(layout, extra[1], 7);
    layout = addBlock(layout, extra[2], 99);
    const templates = plan(layout);
    const customIds = new Set(extra.map(block => block.id));
    assert.deepEqual(templates.flatMap(item => item.blockIds.filter(id => customIds.has(id)).map(id => ({ id, role: item.role }))),
        extra.map(block => ({ id: block.id, role: block.role })));
    for (const item of results(templates)) assert.equal(item.blockIds.some(id => customIds.has(id)), false);
    templates.forEach((item, index) => {
        if (item.tool_calls) assert.equal(templates[index + 1].tool_call_id, item.tool_calls[0].id);
    });
    assert.equal(templates.at(-1).approved, true);
});

test('empty and disabled custom messages do not alter the request', () => {
    let layout = addBlock(createDefaultLayout(), custom('assistant', 'DISABLED', false), 2);
    layout = addBlock(layout, custom('user', ' '), 1);
    assert.deepEqual(plan(layout), plan());
});

test('adjacent custom messages still merge by role, while the action checklist stays separate', () => {
    let layout = addBlock(createDefaultLayout(), custom('assistant', 'A1'), 99);
    layout = addBlock(layout, custom('assistant', 'A2'), 99);
    const templates = plan(layout);
    assert.equal(templates.find(item => item.template === 'A1\n\nA2').role, 'assistant');
    assert.equal(templates.filter(item => item.role === 'user').length, 1);
});

for (const order of [
    ['tools', ...ORDER.filter(id => id !== 'tools')],
    ['opening', 'frame', 'guide', 'rules', 'worldInfo', 'tools', 'content', 'limits'],
    [...ORDER.filter(id => id !== 'tools'), 'tools'],
]) {
    test(`legacy tool placement is normalized to the opening: ${order.indexOf('tools')}`, () => {
        const templates = plan(reorderBlocks(createDefaultLayout(), order));
        const directIds = templates.filter(item => item.role !== 'tool').flatMap(item => item.blockIds);
        assert.deepEqual(directIds, ['opening', 'frame', 'tools']);
        const holders = templates.filter(item => item.template.includes(M));
        assert.equal(holders.length, 1);
        assert.equal(holders[0].role, 'system');
    });
}

test('protocol markers in document and custom text cannot create a second protocol position', () => {
    const layout = addBlock(createDefaultLayout(), custom('user', `BEFORE${M}AFTER`), 99);
    const templates = plan(layout, { ...TEXTS, opening: `O${M}P`, content: `C${M}ONTENT` });
    assert.equal(templates.map(item => item.template).join('').split(M).length - 1, 1);
    assert.equal(results(templates)[0].template, 'WORLD\n\nCONTENT');
    assert.equal(templates.find(item => item.template === 'BEFOREAFTER').role, 'user');
});

test('assembly does not mutate layout or source texts', () => {
    const layout = addBlock(createDefaultLayout(), custom('assistant', 'A'), 99);
    const before = structuredClone({ layout, texts: TEXTS });
    plan(layout);
    assert.deepEqual({ layout, texts: TEXTS }, before);
});
