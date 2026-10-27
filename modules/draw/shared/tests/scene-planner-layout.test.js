// 场景规划块布局：默认值、自愈规范化、稀疏存储与纯操作。
import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BUILTIN_BLOCKS,
    BUILTIN_BLOCK_IDS,
    addBlock,
    addBlockAfter,
    createCustomBlock,
    createDefaultLayout,
    duplicateBlocks,
    isDefaultLayout,
    layoutFingerprint,
    layoutForStorage,
    moveBlock,
    moveBlocks,
    normalizeLayout,
    removeBlock,
    removeBlocks,
    reorderBlocks,
    setBlocksEnabled,
    updateBlock,
} from '../scene-planner-layout.js';

const DEFAULT_ORDER = ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits'];

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(deepFreeze);
    }
    return value;
}

function ids(layout) {
    return layout.blocks.map(block => block.id);
}

function custom(id, extra = {}) {
    return { id, role: 'user', name: '', content: '', enabled: true, ...extra };
}

function layoutOf(...blocks) {
    return { version: 1, blocks };
}

function withBuiltins(order, extras = {}) {
    return layoutOf(...order.map(id => extras[id] || { id }));
}

test('isDefaultLayout：默认、含自定义块、重排与排回', () => {
    assert.equal(isDefaultLayout(createDefaultLayout()), true);
    assert.equal(isDefaultLayout(undefined), true);
    assert.equal(isDefaultLayout(null), true);
    // 缺失的内置块规范化后会补回，所以仍是默认
    assert.equal(isDefaultLayout(withBuiltins(DEFAULT_ORDER.slice(0, 4))), true);

    const withCustom = addBlock(createDefaultLayout(), custom('msg-aaaaaa'));
    assert.equal(isDefaultLayout(withCustom), false);
    // 默认顺序 + 一个自定义块（即使停用）仍然不是默认
    assert.equal(isDefaultLayout(addBlock(createDefaultLayout(), custom('msg-aaaaaa', { enabled: false }))), false);

    const moved = moveBlock(createDefaultLayout(), 'frame', -1);
    assert.equal(isDefaultLayout(moved), false);
    assert.equal(isDefaultLayout(moveBlock(moved, 'frame', 1)), true);
    assert.equal(isDefaultLayout(removeBlock(withCustom, 'msg-aaaaaa')), true);
});

test('layoutForStorage：默认为 undefined，否则返回规范化副本', () => {
    assert.equal(layoutForStorage(undefined), undefined);
    assert.equal(layoutForStorage(createDefaultLayout()), undefined);
    assert.equal(layoutForStorage('garbage'), undefined);

    const moved = moveBlock(createDefaultLayout(), 'limits', -1);
    const stored = layoutForStorage(moved);
    assert.deepEqual(stored, moved);
    assert.notEqual(stored, moved);

    // 内置块只存 {id}，多余字段不落盘
    const dirty = layoutOf(...DEFAULT_ORDER.map(id => ({ id, role: 'assistant', content: 'x' })), custom('msg-bbbbbb', { name: ' n ' }));
    const out = layoutForStorage(dirty);
    assert.deepEqual(out.blocks.slice(0, 8), DEFAULT_ORDER.map(id => ({ id })));
    assert.deepEqual(out.blocks[8], custom('msg-bbbbbb', { name: 'n' }));
});

test('规范化：缺省输入为默认且不算修复', () => {
    for (const raw of [undefined, null]) {
        const result = normalizeLayout(raw);
        assert.deepEqual(result.layout, createDefaultLayout());
        assert.equal(result.repaired, false);
        assert.deepEqual(result.notes, []);
    }
});

test('规范化：非对象根（字符串/数字/布尔/函数）回默认并算修复', () => {
    for (const raw of ['abc', '', 42, 0, true, false, () => 1, Symbol('x')]) {
        const result = normalizeLayout(raw);
        assert.deepEqual(result.layout, createDefaultLayout());
        assert.equal(result.repaired, true);
        assert.ok(result.notes.length > 0);
    }
});

test('规范化：数组根按 blocks 处理', () => {
    const result = normalizeLayout([{ id: 'limits' }, { id: 'content' }, custom('msg-cccccc')]);
    assert.equal(result.repaired, true);
    assert.equal(result.layout.version, 1);
    // limits 在前、content 在后：原顺序保留；缺失的内置块插到各自前驱之后/最前
    assert.deepEqual(ids(result.layout), ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'limits', 'content', 'msg-cccccc']);
});

test('规范化：数组根里混入垃圾条目', () => {
    const result = normalizeLayout([null, 5, 'opening', [], undefined, true, { id: 'frame' }, { nope: 1 }]);
    assert.equal(result.repaired, true);
    // 6 个非对象条目被丢弃；{nope:1} 是缺 id 的对象，按自定义块处理（角色缺失 => 停用）
    const customs = result.layout.blocks.filter(b => !BUILTIN_BLOCK_IDS.includes(b.id));
    assert.equal(customs.length, 1);
    assert.equal(customs[0].enabled, false);
    assert.match(customs[0].id, /^msg-[0-9a-z]{6}$/);
    assert.ok(result.notes.some(n => n.includes('6')));
    for (const id of DEFAULT_ORDER) assert.equal(ids(result.layout).filter(x => x === id).length, 1);
});

test('规范化：对象缺 blocks 或 blocks 非数组', () => {
    const empty = normalizeLayout({});
    assert.deepEqual(empty.layout, createDefaultLayout());
    const bad = normalizeLayout({ version: 1, blocks: 'nope' });
    assert.deepEqual(bad.layout, createDefaultLayout());
    assert.equal(bad.repaired, true);
    assert.ok(bad.notes.some(n => n.includes('blocks')));
});

test('规范化：版本高于 1 尽力读取并输出版本 1', () => {
    const result = normalizeLayout({ version: 7, blocks: [custom('msg-dddddd', { content: 'hi' })], future: { a: 1 } });
    assert.equal(result.layout.version, 1);
    assert.equal(result.repaired, true);
    assert.ok(result.notes.some(n => n.includes('7')));
    assert.equal(result.layout.blocks.find(b => b.id === 'msg-dddddd').content, 'hi');
    assert.deepEqual(Object.keys(result.layout), ['version', 'blocks']);

    const invalid = normalizeLayout({ version: 'x', blocks: createDefaultLayout().blocks });
    assert.equal(invalid.repaired, true);
    assert.equal(invalid.layout.version, 1);

    // 缺 version 不算修复
    assert.equal(normalizeLayout({ blocks: createDefaultLayout().blocks }).repaired, false);
});

test('规范化：内置块重复只保留第一次出现', () => {
    const result = normalizeLayout(layoutOf(
        { id: 'frame' }, { id: 'opening' }, { id: 'frame' }, { id: 'guide' }, { id: 'opening' },
        { id: 'rules' }, { id: 'tools' }, { id: 'worldInfo' }, { id: 'content' }, { id: 'limits' }, { id: 'limits' },
    ));
    assert.deepEqual(ids(result.layout), ['frame', 'opening', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits']);
    assert.equal(result.repaired, true);
    assert.ok(result.notes.some(n => n.includes('3')));
});

test('规范化：每个内置块单独缺失都会补回到规范位置', () => {
    for (const missing of DEFAULT_ORDER) {
        const order = DEFAULT_ORDER.filter(id => id !== missing);
        const result = normalizeLayout(withBuiltins(order));
        assert.deepEqual(ids(result.layout), DEFAULT_ORDER, `缺失 ${missing}`);
        assert.equal(result.repaired, true);
        assert.ok(result.notes.some(n => n.includes(BUILTIN_BLOCKS.find(b => b.id === missing).label)));
    }
});

test('规范化：缺失的内置块插在最近前驱之后，而不是回到绝对位置', () => {
    // 用户把 limits 放到最前，content 缺失：前驱 worldInfo 在最后，content 紧随其后
    const result = normalizeLayout(withBuiltins(['limits', 'opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo']));
    assert.deepEqual(ids(result.layout), ['limits', 'opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content']);

    // 前驱之后紧跟自定义块时，插在前驱与自定义块之间
    const x = custom('msg-eeeeee');
    const r2 = normalizeLayout(layoutOf({ id: 'opening' }, x, { id: 'guide' }, { id: 'rules' }, { id: 'tools' }, { id: 'worldInfo' }, { id: 'content' }, { id: 'limits' }));
    assert.deepEqual(ids(r2.layout), ['opening', 'frame', 'msg-eeeeee', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits']);

    // 没有任何前驱存在：放最前
    const r3 = normalizeLayout(layoutOf(x, { id: 'guide' }));
    assert.deepEqual(ids(r3.layout).slice(0, 3), ['opening', 'frame', 'msg-eeeeee']);
});

test('规范化：连续缺失保持规范顺序', () => {
    const r1 = normalizeLayout(withBuiltins(['opening', 'limits']));
    assert.deepEqual(ids(r1.layout), ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits']);
    const r2 = normalizeLayout(withBuiltins(['limits', 'content']));
    assert.deepEqual(ids(r2.layout), ['opening', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'limits', 'content']);
});

test('规范化：全部内置块缺失（含只有自定义块）', () => {
    const only = normalizeLayout(layoutOf());
    assert.deepEqual(only.layout, createDefaultLayout());
    assert.equal(only.repaired, true);

    const a = custom('msg-ffffff');
    const result = normalizeLayout(layoutOf(a));
    // 没有前驱则每个都放最前；canonical 顺序处理 => 自定义块被挤到全部内置块之后
    assert.deepEqual(ids(result.layout), [...DEFAULT_ORDER, 'msg-ffffff']);
});

test('自定义块：字段规范化（name 去空白、content 原样、enabled 仅 false 停用）', () => {
    const content = '  前导空格\n\n\t尾部空白 \n';
    const result = normalizeLayout(layoutOf(
        ...DEFAULT_ORDER.map(id => ({ id })),
        { id: 'msg-111111', role: 'assistant', name: '  名字  ', content, enabled: undefined },
        { id: 'msg-222222', role: 'system', name: 7, content: 8, enabled: false },
        { id: 'msg-333333', role: 'user', name: undefined, content: null, enabled: 0 },
    ));
    const [a, b, c] = result.layout.blocks.slice(8);
    assert.deepEqual(a, { id: 'msg-111111', role: 'assistant', name: '名字', content, enabled: true });
    assert.deepEqual(b, { id: 'msg-222222', role: 'system', name: '7', content: '8', enabled: false });
    // enabled 只有严格 false 才停用；0 不是 false
    assert.deepEqual(c, { id: 'msg-333333', role: 'user', name: '', content: '', enabled: true });
    assert.equal(result.repaired, true);
    assert.deepEqual(Object.keys(a), ['id', 'role', 'name', 'content', 'enabled']);
});

test('自定义块：对象/数组类型的 name、content 当作空串', () => {
    const result = normalizeLayout(layoutOf(...DEFAULT_ORDER.map(id => ({ id })), { id: 'msg-444444', role: 'user', name: { a: 1 }, content: ['x'] }));
    const block = result.layout.blocks[8];
    assert.equal(block.name, '');
    assert.equal(block.content, '');
});

test('自定义块：角色缺失或非法 => user 且停用', () => {
    for (const role of [undefined, null, '', 'SYSTEM', 'tool', 5, {}]) {
        const result = normalizeLayout(layoutOf(...DEFAULT_ORDER.map(id => ({ id })), { id: 'msg-555555', role, content: 'c', enabled: true }));
        const block = result.layout.blocks[8];
        assert.equal(block.role, 'user');
        assert.equal(block.enabled, false);
        assert.equal(block.content, 'c');
        assert.equal(result.repaired, true);
        assert.ok(result.notes.some(n => n.includes('角色')));
    }
});

test('自定义块：非法、缺失、与内置/先前 id 冲突时重新生成且互不重复', () => {
    const result = normalizeLayout(layoutOf(
        ...DEFAULT_ORDER.map(id => ({ id })),
        custom('msg-aaaaaa', { content: '1' }),
        custom('msg-aaaaaa', { content: '2' }),
        custom('bad id!', { content: '3' }),
        custom('', { content: '4' }),
        custom('x'.repeat(65), { content: '5' }),
        { role: 'user', content: '6' },
        { id: 42, role: 'user', content: '7' },
        custom('msg-000001', { content: '8' }),
    ));
    const customs = result.layout.blocks.slice(8);
    assert.equal(customs.length, 8);
    const all = ids(result.layout);
    assert.equal(new Set(all).size, all.length);
    for (const block of customs) assert.match(block.id, /^[A-Za-z0-9_-]{1,64}$/);
    assert.equal(customs[0].id, 'msg-aaaaaa');
    assert.equal(customs[0].content, '1');
    // 有效的 msg-000001 先占位，重新生成的 id 不能抢它
    assert.equal(customs[7].id, 'msg-000001');
    assert.deepEqual(customs.map(b => b.content), ['1', '2', '3', '4', '5', '6', '7', '8']);
    assert.equal(result.repaired, true);
});

test('自定义块：id 重新生成是确定性的（同一输入同一输出）', () => {
    const raw = layoutOf(...DEFAULT_ORDER.map(id => ({ id })), custom('dup'), custom('dup'), { role: 'user' });
    assert.deepEqual(normalizeLayout(raw).layout, normalizeLayout(raw).layout);
});

test('自定义块：超大内容原样保留，不截断不限量', () => {
    const big = 'x'.repeat(3_000_000) + '\n  尾';
    const blocks = Array.from({ length: 300 }, (_, i) => custom(`msg-${String(i).padStart(6, '0')}`, { content: i === 0 ? big : `c${i}`, name: `n${i}` }));
    const result = normalizeLayout(layoutOf(...DEFAULT_ORDER.map(id => ({ id })), ...blocks));
    assert.equal(result.repaired, false);
    assert.equal(result.layout.blocks.length, 308);
    assert.equal(result.layout.blocks[8].content, big);
    assert.equal(result.layout.blocks[8].content.length, big.length);
});

test('内置块：id 命中即内置，多余字段被忽略', () => {
    const result = normalizeLayout(layoutOf({ id: 'opening', role: 'assistant', content: 'hack', enabled: false, name: 'x' }, ...DEFAULT_ORDER.slice(1).map(id => ({ id }))));
    assert.deepEqual(result.layout, createDefaultLayout());
});

test('规范化：幂等', () => {
    const inputs = [
        undefined, null, 'x', 5, [],
        [null, { id: 'limits' }, { id: 'limits' }, custom('dup'), custom('dup'), { role: 'nope' }],
        { version: 9, blocks: [{ id: 'worldInfo' }, { id: 'content', extra: 1 }, { id: 'msg-zzzzzz', role: 'assistant', name: ' a ', content: ' b ' }] },
        layoutOf(),
        { blocks: 'bad' },
        withBuiltins(['limits', 'content', 'opening']),
    ];
    for (const raw of inputs) {
        const first = normalizeLayout(raw);
        const second = normalizeLayout(first.layout);
        assert.deepEqual(second.layout, first.layout);
        assert.equal(second.repaired, false);
        assert.deepEqual(second.notes, []);
    }
});

test('规范化：不改动入参且输出与入参无共享引用', () => {
    const raw = deepFreeze({
        version: 1,
        blocks: [
            { id: 'opening' },
            { id: 'frame' },
            { id: 'guide' },
            { id: 'rules' },
            { id: 'tools' },
            { id: 'worldInfo' },
            { id: 'content' },
            { id: 'limits' },
            { id: 'msg-777777', role: 'system', name: 'n', content: 'c', enabled: true },
        ],
    });
    const snapshot = JSON.stringify(raw);
    const result = normalizeLayout(raw);
    assert.equal(JSON.stringify(raw), snapshot);
    assert.notEqual(result.layout, raw);
    assert.notEqual(result.layout.blocks, raw.blocks);
    result.layout.blocks.forEach((block, i) => assert.notEqual(block, raw.blocks[i]));
    // 输出可变，改动不会回灌入参
    result.layout.blocks[8].content = 'changed';
    assert.equal(raw.blocks[8].content, 'c');
});

test('layoutFingerprint：稳定且对每类改动敏感', () => {
    const base = addBlock(createDefaultLayout(), custom('msg-888888', { content: 'a', name: 'n' }));
    const fp = layoutFingerprint(base);
    assert.equal(typeof fp, 'string');
    assert.equal(layoutFingerprint(JSON.parse(JSON.stringify(base))), fp);
    assert.equal(layoutFingerprint(normalizeLayout(base).layout), fp);
    // 默认与缺省一致；多余字段、内置块多余内容不影响
    assert.equal(layoutFingerprint(undefined), layoutFingerprint(createDefaultLayout()));
    assert.equal(layoutFingerprint({ ...base, junk: 1 }), fp);
    assert.equal(layoutFingerprint(updateBlock(base, 'msg-888888', { name: '  n  ' })), fp);

    const variants = [
        moveBlock(base, 'msg-888888', -1),
        moveBlock(base, 'frame', 1),
        updateBlock(base, 'msg-888888', { content: 'b' }),
        updateBlock(base, 'msg-888888', { name: 'm' }),
        updateBlock(base, 'msg-888888', { role: 'assistant' }),
        updateBlock(base, 'msg-888888', { enabled: false }),
        removeBlock(base, 'msg-888888'),
    ];
    const seen = new Set([fp]);
    for (const variant of variants) seen.add(layoutFingerprint(variant));
    assert.equal(seen.size, variants.length + 1);
});

test('addBlock：末尾、指定位置、越界钳制，且不改入参', () => {
    const base = deepFreeze(createDefaultLayout());
    const a = addBlock(base, custom('msg-a00001'));
    assert.deepEqual(ids(a), [...DEFAULT_ORDER, 'msg-a00001']);

    const front = addBlock(base, custom('msg-a00002'), 0);
    assert.equal(ids(front)[0], 'msg-a00002');
    const mid = addBlock(base, custom('msg-a00003'), 3);
    assert.deepEqual(ids(mid).slice(2, 5), ['guide', 'msg-a00003', 'rules']);
    assert.equal(ids(addBlock(base, custom('msg-a00004'), 999)).at(-1), 'msg-a00004');
    assert.equal(ids(addBlock(base, custom('msg-a00005'), -5))[0], 'msg-a00005');
    assert.equal(ids(addBlock(base, custom('msg-a00006'), NaN)).at(-1), 'msg-a00006');
    assert.equal(ids(addBlock(base, custom('msg-a00007'), 2.9))[2], 'msg-a00007');

    assert.equal(base.blocks.length, 8);
    assert.notEqual(a.blocks, base.blocks);
});

test('addBlock：id 冲突时改发新 id、内置块和垃圾不会被加入', () => {
    const one = addBlock(createDefaultLayout(), custom('msg-b00001', { content: 'x' }));
    const two = addBlock(one, custom('msg-b00001', { content: 'y' }));
    assert.equal(ids(two).length, 10);
    assert.equal(new Set(ids(two)).size, 10);
    assert.equal(two.blocks[8].content, 'x');
    assert.equal(two.blocks[9].content, 'y');

    assert.deepEqual(addBlock(createDefaultLayout(), { id: 'opening' }), createDefaultLayout());
    assert.deepEqual(addBlock(createDefaultLayout(), null), createDefaultLayout());
    assert.deepEqual(addBlock(createDefaultLayout(), 'str'), createDefaultLayout());
    // 入参为垃圾时先自愈
    assert.deepEqual(ids(addBlock('garbage', custom('msg-b00002'))), [...DEFAULT_ORDER, 'msg-b00002']);
});

test('removeBlock：只能删自定义块，内置块为空操作', () => {
    const layout = deepFreeze(addBlock(createDefaultLayout(), custom('msg-c00001')));
    assert.deepEqual(ids(removeBlock(layout, 'msg-c00001')), DEFAULT_ORDER);
    for (const id of DEFAULT_ORDER) {
        assert.deepEqual(removeBlock(layout, id), layout);
    }
    assert.deepEqual(removeBlock(layout, 'nope'), layout);
    assert.deepEqual(removeBlock(layout, undefined), layout);
    assert.notEqual(removeBlock(layout, 'nope'), layout);
});

test('updateBlock：只改自定义块的 role/name/content/enabled', () => {
    const layout = deepFreeze(addBlock(createDefaultLayout(), custom('msg-d00001', { name: 'a', content: 'b' })));
    const updated = updateBlock(layout, 'msg-d00001', {
        role: 'assistant', name: 'N', content: '  C  ', enabled: false, id: 'hijack', extra: 1,
    });
    assert.deepEqual(updated.blocks[8], { id: 'msg-d00001', role: 'assistant', name: 'N', content: '  C  ', enabled: false });
    assert.equal('extra' in updated.blocks[8], false);

    // 非法值忽略
    const ignored = updateBlock(layout, 'msg-d00001', { role: 'tool', name: 5, content: null, enabled: 'yes' });
    assert.deepEqual(ignored, layout);

    // 内置块与不存在的 id 为空操作
    assert.deepEqual(updateBlock(layout, 'content', { content: 'x', role: 'assistant' }), layout);
    assert.deepEqual(updateBlock(layout, 'nope', { content: 'x' }), layout);
    assert.deepEqual(updateBlock(layout, 'msg-d00001', null), layout);
});

test('updateBlock：编辑过程中保留名称两端空格，存储/指纹层再去除', () => {
    const layout = addBlock(createDefaultLayout(), custom('msg-d00002', { name: 'a' }));
    const typing = updateBlock(layout, 'msg-d00002', { name: 'a ' });
    assert.equal(typing.blocks[8].name, 'a ');
    assert.equal(layoutForStorage(typing).blocks[8].name, 'a');
});

test('moveBlock：上移下移一格，两端钳制，未知 id 与方向为空操作', () => {
    const base = deepFreeze(createDefaultLayout());
    assert.deepEqual(ids(moveBlock(base, 'frame', -1)).slice(0, 2), ['frame', 'opening']);
    assert.deepEqual(ids(moveBlock(base, 'frame', 1)).slice(0, 3), ['opening', 'guide', 'frame']);
    assert.deepEqual(ids(moveBlock(base, 'opening', -1)), DEFAULT_ORDER);
    assert.deepEqual(ids(moveBlock(base, 'limits', 1)), DEFAULT_ORDER);
    assert.deepEqual(ids(moveBlock(base, 'nope', 1)), DEFAULT_ORDER);
    assert.deepEqual(ids(moveBlock(base, 'frame', 0)), DEFAULT_ORDER);
    assert.deepEqual(ids(moveBlock(base, 'frame', NaN)), DEFAULT_ORDER);
    // 只移动一格，即使 direction 绝对值更大
    assert.deepEqual(ids(moveBlock(base, 'tools', -5)).slice(2, 6), ['guide', 'tools', 'rules', 'worldInfo']);
    assert.notEqual(moveBlock(base, 'opening', -1), base);
});

test('reorderBlocks：未知 id 忽略，未列出的块保持相对顺序排在后面，不增不减', () => {
    const base = deepFreeze(addBlock(createDefaultLayout(), custom('msg-e00001')));
    const result = reorderBlocks(base, ['limits', 'ghost', 'opening', 'limits', 42, null, 'msg-e00001']);
    assert.deepEqual(ids(result), ['limits', 'opening', 'msg-e00001', 'frame', 'guide', 'rules', 'tools', 'worldInfo', 'content']);
    assert.equal(result.blocks.length, base.blocks.length);

    assert.deepEqual(reorderBlocks(base, []), base);
    assert.deepEqual(reorderBlocks(base, 'not-array'), base);
    assert.deepEqual(reorderBlocks(base, undefined), base);
    assert.deepEqual(reorderBlocks(base, ids(base)), base);
    assert.deepEqual(ids(reorderBlocks(base, [...ids(base)].reverse())), [...ids(base)].reverse());
    // 完整列出自定义块内容不丢
    assert.deepEqual(result.blocks.find(b => b.id === 'msg-e00001'), base.blocks[8]);
});

test('createCustomBlock：默认值与字段处理', () => {
    const block = createCustomBlock();
    assert.match(block.id, /^msg-[0-9a-z]{6}$/);
    assert.deepEqual({ ...block, id: 'x' }, { id: 'x', role: 'user', name: '', content: '', enabled: true });
    assert.deepEqual(Object.keys(block), ['id', 'role', 'name', 'content', 'enabled']);

    const b2 = createCustomBlock({ role: 'assistant', name: '  n  ', content: '  keep  ', enabled: false });
    assert.equal(b2.role, 'assistant');
    assert.equal(b2.name, 'n');
    assert.equal(b2.content, '  keep  ');
    assert.equal(b2.enabled, false);
    assert.equal(createCustomBlock({ role: 'bogus' }).role, 'user');
    assert.equal(createCustomBlock({}).enabled, true);
});

test('createCustomBlock：id 由注入的 random 决定', () => {
    assert.equal(createCustomBlock({}, [], () => 0).id, 'msg-000000');
    assert.equal(createCustomBlock({}, [], () => 0.5).id, 'msg-' + (36 ** 6 / 2).toString(36).padStart(6, '0'));
    // 越界或非数字的随机数被钳制
    assert.match(createCustomBlock({}, [], () => 1).id, /^msg-z{6}$/);
    assert.equal(createCustomBlock({}, [], () => NaN).id, 'msg-000000');
});

test('createCustomBlock：random 一直重复也能得到唯一 id', () => {
    const existing = [];
    const stuck = () => 0.123456;
    for (let i = 0; i < 50; i += 1) {
        const block = createCustomBlock({}, existing, stuck);
        assert.ok(!existing.includes(block.id));
        assert.ok(!BUILTIN_BLOCK_IDS.includes(block.id));
        existing.push(block.id);
    }
    assert.equal(new Set(existing).size, 50);
    // existingIds 也接受 Set；非可迭代入参当空处理
    const first = createCustomBlock({}, new Set(['msg-000000']), () => 0);
    assert.notEqual(first.id, 'msg-000000');
    assert.equal(createCustomBlock({}, undefined, () => 0).id, 'msg-000000');
    assert.equal(createCustomBlock({}, 'msg-000000', () => 0).id, 'msg-000000');
});

test('createCustomBlock：生成的块可直接通过规范化而不被改动', () => {
    const block = createCustomBlock({ name: 'a', content: 'b' }, [], () => 0.25);
    const layout = addBlock(createDefaultLayout(), block);
    assert.deepEqual(layout.blocks[8], block);
    assert.equal(normalizeLayout(layout).repaired, false);
});

test('操作链：所有操作结果都是合法规范化布局', () => {
    let layout = createDefaultLayout();
    const block = createCustomBlock({ name: 'x', content: 'y' }, ids(layout), () => 0.3);
    layout = addBlock(layout, block, 2);
    layout = moveBlock(layout, block.id, 1);
    layout = updateBlock(layout, block.id, { role: 'assistant', content: 'z' });
    layout = reorderBlocks(layout, ['limits', block.id]);
    const normalised = normalizeLayout(layout);
    assert.equal(normalised.repaired, false);
    assert.deepEqual(normalised.layout, layout);
    assert.equal(isDefaultLayout(layout), false);
    layout = removeBlock(layout, block.id);
    layout = reorderBlocks(layout, DEFAULT_ORDER);
    assert.equal(isDefaultLayout(layout), true);
    assert.equal(layoutForStorage(layout), undefined);
});

// ---- 请求结构编辑器的批量 / 定点操作 ----

function threeCustom() {
    return withBuiltins(DEFAULT_ORDER, {});
}

function layoutWithCustoms() {
    // opening, frame, A, guide, B, C, rules, tools, worldInfo, content, limits
    return layoutOf(
        { id: 'opening' }, { id: 'frame' }, custom('A', { content: 'a' }), { id: 'guide' },
        custom('B', { content: 'b', enabled: false }), custom('C', { content: 'c' }),
        { id: 'rules' }, { id: 'tools' }, { id: 'worldInfo' }, { id: 'content' }, { id: 'limits' },
    );
}

test('addBlockAfter：插到指定块的正下方，找不到就放末尾，内置块不能再加', () => {
    const base = layoutWithCustoms();
    assert.deepEqual(ids(addBlockAfter(base, custom('N'), 'A')), ['opening', 'frame', 'A', 'N', 'guide', 'B', 'C', 'rules', 'tools', 'worldInfo', 'content', 'limits']);
    assert.deepEqual(ids(addBlockAfter(base, custom('N'), 'opening')).slice(0, 3), ['opening', 'N', 'frame'], '也可以插在内置块后面');
    assert.equal(ids(addBlockAfter(base, custom('N'), 'limits')).at(-1), 'N');
    assert.equal(ids(addBlockAfter(base, custom('N'), 'nope')).at(-1), 'N');
    assert.equal(ids(addBlockAfter(base, custom('N'))).at(-1), 'N');
    assert.deepEqual(ids(addBlockAfter(base, { id: 'guide' }, 'A')), ids(base));
    const frozen = deepFreeze(layoutWithCustoms());
    assert.doesNotThrow(() => addBlockAfter(frozen, custom('N'), 'A'));
});

test('duplicateBlocks：副本紧跟在各自原块后面，内容原样带过去，内置块与未知 id 跳过', () => {
    const base = layoutWithCustoms();
    const result = duplicateBlocks(base, ['A', 'C', 'guide', 'nope'], (() => { let n = 0; return () => { n += 1; return n * 0.01; }; })());
    assert.deepEqual(result.skipped.sort(), ['guide', 'nope']);
    assert.equal(result.copies.length, 2);
    assert.deepEqual(result.copies.map(copy => copy.sourceId), ['A', 'C']);
    const out = ids(result.layout);
    assert.equal(out.length, ids(base).length + 2);
    assert.equal(out[out.indexOf('A') + 1], result.copies[0].id);
    assert.equal(out[out.indexOf('C') + 1], result.copies[1].id);
    assert.equal(new Set(out).size, out.length, 'id 不重复');
    const copyOfA = result.layout.blocks.find(block => block.id === result.copies[0].id);
    assert.deepEqual({ ...copyOfA, id: 'A' }, base.blocks.find(block => block.id === 'A'));
    assert.deepEqual(result.layout.blocks.filter(block => BUILTIN_BLOCK_IDS.includes(block.id)).map(block => block.id), DEFAULT_ORDER, '内置块顺序不变');
    assert.equal(duplicateBlocks(base, ['guide']).copies.length, 0);
    assert.deepEqual(ids(duplicateBlocks(base, ['guide']).layout), ids(base), '全是内置块时布局不变');
    assert.equal(duplicateBlocks(base, null).copies.length, 0);
    assert.doesNotThrow(() => duplicateBlocks(deepFreeze(layoutWithCustoms()), ['A']));
});

test('duplicateBlocks：副本保留停用状态；random 一直撞库也能给出唯一 id', () => {
    const result = duplicateBlocks(layoutWithCustoms(), ['B'], () => 0);
    const copy = result.layout.blocks.find(block => block.id === result.copies[0].id);
    assert.equal(copy.enabled, false);
    assert.notEqual(copy.id, 'B');
    assert.equal(new Set(ids(result.layout)).size, ids(result.layout).length);
});

test('removeBlocks：只删自定义块，内置块保留并报告', () => {
    const base = layoutWithCustoms();
    const result = removeBlocks(base, ['A', 'B', 'guide', 'nope']);
    assert.deepEqual(result.removedIds, ['A', 'B']);
    assert.deepEqual(result.skipped.sort(), ['guide', 'nope']);
    assert.deepEqual(ids(result.layout), ['opening', 'frame', 'guide', 'C', 'rules', 'tools', 'worldInfo', 'content', 'limits']);
    assert.deepEqual(ids(removeBlocks(base, ['guide', 'rules']).layout), ids(base));
    assert.deepEqual(ids(removeBlocks(base, undefined).layout), ids(base));
    assert.doesNotThrow(() => removeBlocks(deepFreeze(layoutWithCustoms()), ['A']));
});

test('setBlocksEnabled：批量启用 / 停用自定义块，内置块忽略', () => {
    const base = layoutWithCustoms();
    const off = setBlocksEnabled(base, ['A', 'C', 'guide'], false);
    assert.deepEqual(off.blocks.filter(block => !BUILTIN_BLOCK_IDS.includes(block.id)).map(block => block.enabled), [false, false, false]);
    assert.deepEqual(ids(off), ids(base));
    const on = setBlocksEnabled(base, ['B'], true);
    assert.equal(on.blocks.find(block => block.id === 'B').enabled, true);
    assert.deepEqual(setBlocksEnabled(base, [], false), base);
});

test('moveBlocks：整组上移 / 下移一格，组内顺序不变，内置块也可以一起动', () => {
    const base = layoutWithCustoms();
    assert.deepEqual(ids(moveBlocks(base, ['B', 'C'], -1)), ['opening', 'frame', 'A', 'B', 'C', 'guide', 'rules', 'tools', 'worldInfo', 'content', 'limits']);
    assert.deepEqual(ids(moveBlocks(base, ['B', 'C'], 1)), ['opening', 'frame', 'A', 'guide', 'rules', 'B', 'C', 'tools', 'worldInfo', 'content', 'limits']);
    assert.deepEqual(ids(moveBlocks(base, ['A', 'guide'], -1)).slice(0, 4), ['opening', 'A', 'guide', 'frame'], '不连续的组：先并拢到上一个位置');
    assert.deepEqual(ids(moveBlocks(base, ['opening', 'frame'], -1)), ids(base), '已在最前');
    assert.deepEqual(ids(moveBlocks(base, ['content', 'limits'], 1)), ids(base), '已在最后');
    assert.deepEqual(ids(moveBlocks(base, [], 1)), ids(base));
    assert.deepEqual(ids(moveBlocks(base, ['A'], 0)), ids(base));
    assert.deepEqual(ids(moveBlocks(base, ['A'], 1)), ids(moveBlock(base, 'A', 1)), '一个块时等于 moveBlock');
    assert.deepEqual(ids(moveBlocks(base, ['A'], -1)), ids(moveBlock(base, 'A', -1)));
    assert.deepEqual(base.blocks.length, 11, '不改动入参');
});

test('批量操作的结果永远是合法布局，默认布局不被改动', () => {
    const base = createDefaultLayout();
    assert.equal(isDefaultLayout(duplicateBlocks(base, [...DEFAULT_ORDER]).layout), true);
    assert.equal(isDefaultLayout(removeBlocks(base, [...DEFAULT_ORDER]).layout), true);
    assert.equal(isDefaultLayout(setBlocksEnabled(base, [...DEFAULT_ORDER], false)), true);
    const lots = threeCustom();
    for (const layout of [moveBlocks(lots, ['opening'], 1), addBlockAfter(lots, custom('Z'), 'opening')]) {
        assert.equal(normalizeLayout(layout).repaired, false);
    }
});
