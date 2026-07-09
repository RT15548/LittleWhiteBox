import test from 'node:test';
import assert from 'node:assert/strict';

import { parseStateBlock } from '../state2/parser.js';
import {
    clearAllRules,
    clearRule,
    getRuleNode,
    getRulesSnapshot,
    replaceRules,
    setRule,
    validate,
} from '../state2/guard-core.js';

function installRules(block) {
    clearAllRules();
    const parsed = parseStateBlock(block);
    for (const { path, rule } of parsed.rules) {
        setRule(path, rule);
    }
    return parsed.rules;
}

test('state2 guard snapshots and replaces rule tables without sharing the top level', () => {
    clearAllRules();
    setRule('数据.HP', { typeLock: 'number' });

    const snapshot = getRulesSnapshot();
    assert.deepEqual(snapshot, { '数据.HP': { typeLock: 'number' } });

    snapshot['数据.MP'] = { typeLock: 'number' };
    assert.equal(getRuleNode('数据.MP'), null);

    replaceRules(snapshot);
    assert.deepEqual(getRuleNode('数据.MP'), { typeLock: 'number' });

    replaceRules(null);
    assert.equal(getRuleNode('数据.HP'), null);
    assert.equal(getRuleNode('数据.MP'), null);
});

test('state2 schema parser emits object-array item rules', () => {
    const rules = installRules(`
$schema 数据
  背包:
    - 名称: ""
      数量: 0
`);

    assert.deepEqual(
        rules.map(item => item.path),
        ['数据', '数据.背包', '数据.背包.[*]', '数据.背包.[*].名称', '数据.背包.[*].数量'],
    );
    assert.deepEqual(getRuleNode('数据.背包.0'), { typeLock: 'object', allowedKeys: ['名称', '数量'] });
    assert.deepEqual(getRuleNode('数据.背包.0.数量'), { typeLock: 'number' });
});

test('state2 object-array schema still rejects invalid leaf writes', () => {
    installRules(`
$schema 数据
  背包:
    - 名称: ""
      数量: 0
`);

    assert.equal(validate('set', '数据.背包.0.非法', 'x', undefined).allow, false);

    const wrongType = validate('set', '数据.背包.0.数量', 'abc', 3);
    assert.equal(wrongType.allow, false);
    assert.match(wrongType.reason, /类型不匹配/);
});

test('state2 wildcard matching prefers numeric array templates over object wildcards', () => {
    clearAllRules();
    setRule('数据.背包.[*].数量', { typeLock: 'number' });
    setRule('数据.背包.*.数量', { typeLock: 'string' });

    assert.deepEqual(getRuleNode('数据.背包.0.数量'), { typeLock: 'number' });
    assert.deepEqual(getRuleNode('数据.背包.任意.数量'), { typeLock: 'string' });

    const numericItem = validate('set', '数据.背包.0.数量', '12', 0);
    assert.equal(numericItem.allow, true);
    assert.equal(numericItem.value, 12);

    const dynamicItem = validate('set', '数据.背包.任意.数量', 12, '');
    assert.equal(dynamicItem.allow, false);
    assert.match(dynamicItem.reason, /类型不匹配/);
});

test('state2 wildcard matching uses exact-prefix tie order for equal-score candidates', () => {
    clearAllRules();
    setRule('数据.*.状态', { enum: ['generic'] });
    setRule('数据.同行者.*', { typeLock: 'number' });

    assert.deepEqual(getRuleNode('数据.同行者.状态'), { typeLock: 'number' });

    const equalScoreTie = validate('set', '数据.同行者.状态', 'generic', '');
    assert.equal(equalScoreTie.allow, false);
    assert.match(equalScoreTie.reason, /类型不匹配/);

    const pathHeadSpecific = validate('set', '数据.同行者.莉娜', '7', 0);
    assert.equal(pathHeadSpecific.allow, true);
    assert.equal(pathHeadSpecific.value, 7);
});

test('state2 scalar schema locks primitive types and coerces numeric strings', () => {
    installRules(`
$schema 数据
  名称: ""
  等级: 0
  激活: false
`);

    const numberValue = validate('set', '数据.等级', '12', 1);
    assert.equal(numberValue.allow, true);
    assert.equal(numberValue.value, 12);

    const booleanValue = validate('set', '数据.激活', 'true', false);
    assert.equal(booleanValue.allow, false);
    assert.match(booleanValue.reason, /类型不匹配/);

    const stringValue = validate('set', '数据.名称', 100, '旧名');
    assert.equal(stringValue.allow, false);
    assert.match(stringValue.reason, /类型不匹配/);
});

test('state2 scalar schema distinguishes arrays, objects, and null values', () => {
    clearAllRules();
    setRule('数据.列表', { typeLock: 'array' });
    setRule('数据.对象', { typeLock: 'object', objectExt: true });
    setRule('数据.空值', { typeLock: 'null' });

    assert.deepEqual(validate('set', '数据.列表', ['a'], []).value, ['a']);
    assert.deepEqual(validate('set', '数据.对象', { a: 1 }, {}).value, { a: 1 });
    assert.equal(validate('set', '数据.空值', null, null).value, null);

    const wrongArray = validate('set', '数据.列表', { a: 1 }, []);
    assert.equal(wrongArray.allow, false);
    assert.match(wrongArray.reason, /期望 array/);
});

test('state2 object schemas reject extra keys and protect template keys from deletion', () => {
    installRules(`
$schema 数据
  名称: ""
  等级: 0
`);

    const extra = validate('set', '数据', { 名称: '莉娜', 等级: 1, 非法: true }, { 名称: '', 等级: 0 });
    assert.equal(extra.allow, false);
    assert.equal(extra.reason, '字段不在结构模板中');

    const missing = validate('set', '数据', { 名称: '莉娜' }, { 名称: '', 等级: 0 });
    assert.equal(missing.allow, false);
    assert.equal(missing.reason, '缺少模板字段：等级');

    const deleteTemplateKey = validate('del', '数据.等级', undefined, 1);
    assert.equal(deleteTemplateKey.allow, false);
    assert.equal(deleteTemplateKey.reason, '模板定义的字段不能删除');
});

test('state2 set deeply validates whole root and whole object array payloads', () => {
    installRules(`
$schema 数据
  背包:
    - 名称: ""
      数量: 0
`);

    const oldValue = { 背包: [{ 名称: '旧药', 数量: 1 }] };

    const wholeRoot = validate('set', '数据', {
        背包: [{ 名称: '回血药', 数量: 3, 非法: 'x' }],
    }, oldValue);
    assert.equal(wholeRoot.allow, false);
    assert.equal(wholeRoot.reason, '字段不在结构模板中');

    const wholeArray = validate('set', '数据.背包', [
        { 名称: '回血药', 数量: 3, 非法: 'x' },
    ], oldValue.背包);
    assert.equal(wholeArray.allow, false);
    assert.equal(wholeArray.reason, '字段不在结构模板中');

    const missingRequired = validate('set', '数据.背包', [
        { 名称: '回血药' },
    ], oldValue.背包);
    assert.equal(missingRequired.allow, false);
    assert.equal(missingRequired.reason, '缺少模板字段：数量');
});

test('state2 set coerces and constrains nested object-array fields', () => {
    installRules(`
$schema 数据
  背包:
    - 名称: ""
      数量: 0
$range=[0,10] 数据.背包.[*].数量
`);

    const result = validate('set', '数据.背包', [
        { 名称: '回血药', 数量: '30' },
    ], []);

    assert.equal(result.allow, true);
    assert.deepEqual(result.value, [{ 名称: '回血药', 数量: 10 }]);
    assert.match(result.note, /超出范围，已限制到 10/);
});

test('state2 set merges notes from multiple constrained subtree fields', () => {
    installRules(`
$schema 数据
  坐标:
    x: 0
    y: 0
$range=[0,10] 数据.坐标.x
$range=[0,10] 数据.坐标.y
`);

    const result = validate('set', '数据.坐标', { x: -5, y: 20 }, { x: 1, y: 1 });

    assert.equal(result.allow, true);
    assert.deepEqual(result.value, { x: 0, y: 10 });
    assert.match(result.note, /超出范围，已限制到 0/);
    assert.match(result.note, /超出范围，已限制到 10/);
});

test('state2 enum rules reject invalid nested values', () => {
    installRules(`
$schema 数据
  天气: ""
  区域:
    状态: ""
$enum={晴,雨,雪} 数据.天气
$enum={安全,危险} 数据.区域.状态
`);

    const leaf = validate('set', '数据.天气', '雾', '晴');
    assert.equal(leaf.allow, false);
    assert.match(leaf.reason, /枚举不匹配/);

    const wholeRoot = validate('set', '数据', {
        天气: '雨',
        区域: { 状态: '未知' },
    }, { 天气: '晴', 区域: { 状态: '安全' } });
    assert.equal(wholeRoot.allow, false);
    assert.match(wholeRoot.reason, /枚举不匹配/);
});

test('state2 push validates object-array items before appending', () => {
    installRules(`
$schema 数据
  背包:
    - 名称: ""
      数量: 0
`);

    const current = [{ 名称: '回血药', 数量: 3 }];

    const extra = validate('push', '数据.背包', { 名称: '蓝药', 数量: 5, 非法: 'x' }, current);
    assert.equal(extra.allow, false);
    assert.equal(extra.reason, '字段不在结构模板中');

    const missing = validate('push', '数据.背包', { 名称: '蓝药' }, current);
    assert.equal(missing.allow, false);
    assert.equal(missing.reason, '缺少模板字段：数量');

    const valid = validate('push', '数据.背包', { 名称: '蓝药', 数量: '5' }, current);
    assert.equal(valid.allow, true);
    assert.deepEqual(valid.value, { 名称: '蓝药', 数量: 5 });
});

test('state2 push validates every item in batch payloads', () => {
    installRules(`
$schema 数据
  背包:
    - 名称: ""
      数量: 0
`);

    const invalidBatch = validate('push', '数据.背包', [
        { 名称: '回血药', 数量: 3 },
        { 名称: '蓝药', 数量: 'bad' },
    ], []);
    assert.equal(invalidBatch.allow, false);
    assert.match(invalidBatch.reason, /类型不匹配/);

    const validBatch = validate('push', '数据.背包', [
        { 名称: '回血药', 数量: '3' },
        { 名称: '蓝药', 数量: 5 },
    ], []);
    assert.equal(validBatch.allow, true);
    assert.deepEqual(validBatch.value, [
        { 名称: '回血药', 数量: 3 },
        { 名称: '蓝药', 数量: 5 },
    ]);
});

test('state2 arrayGrow false rejects push before item validation', () => {
    clearAllRules();
    setRule('数据.固定列表', { typeLock: 'array', arrayGrow: false });

    const result = validate('push', '数据.固定列表', '新项', []);
    assert.equal(result.allow, false);
    assert.equal(result.reason, '数组不允许扩展');
});

test('state2 push rejects paths whose schema target is not an array', () => {
    installRules(`
$schema 数据
  名称: ""
  档案: {}
`);

    const scalarTarget = validate('push', '数据.名称', 'x', undefined);
    assert.equal(scalarTarget.allow, false);
    assert.equal(scalarTarget.reason, '类型不匹配，期望 array，实际 string');

    const objectTarget = validate('push', '数据.档案', { a: 1 }, undefined);
    assert.equal(objectTarget.allow, false);
    assert.equal(objectTarget.reason, '类型不匹配，期望 array，实际 object');
});

test('state2 readonly fields reject direct writes and changed subtree writes', () => {
    installRules(`
$schema 数据
  档案:
    id: ""
    备注: ""
$ro 数据.档案.id
`);

    const current = { 档案: { id: 'fixed', 备注: 'old' } };

    const direct = validate('set', '数据.档案.id', 'fixed', 'fixed');
    assert.equal(direct.allow, false);
    assert.equal(direct.reason, '只读字段');

    const unchanged = validate('set', '数据', {
        档案: { id: 'fixed', 备注: 'new' },
    }, current);
    assert.equal(unchanged.allow, true);

    const changed = validate('set', '数据', {
        档案: { id: 'changed', 备注: 'new' },
    }, current);
    assert.equal(changed.allow, false);
    assert.equal(changed.reason, '只读字段');
});

test('state2 readonly subtree compare uses fallback serialization before rejecting changes', () => {
    clearAllRules();
    setRule('数据', { typeLock: 'object', allowedKeys: ['锁定值', '循环'] });
    setRule('数据.锁定值', { ro: true });
    setRule('数据.循环', { ro: true });

    const unchangedBigInt = validate('set', '数据', { 锁定值: 1n, 循环: 'ok' }, { 锁定值: 1n, 循环: 'ok' });
    assert.equal(unchangedBigInt.allow, true);

    const currentCycle = {};
    currentCycle.self = currentCycle;
    const changedCycle = validate('set', '数据', { 锁定值: 1n, 循环: { self: 'changed' } }, { 锁定值: 1n, 循环: currentCycle });
    assert.equal(changedCycle.allow, false);
    assert.equal(changedCycle.reason, '只读字段');
});

test('state2 inc applies step and range rules and rejects readonly counters', () => {
    installRules(`
$schema 数据
  HP: 0
  锁定值: 0
$range=[0,10] 数据.HP
$step=3 数据.HP
$ro 数据.锁定值
`);

    const positive = validate('inc', '数据.HP', 8, 5);
    assert.equal(positive.allow, true);
    assert.equal(positive.value, 8);
    assert.match(positive.note, /超出步长限制/);

    const negative = validate('inc', '数据.HP', -8, 8);
    assert.equal(negative.allow, true);
    assert.equal(negative.value, 5);
    assert.match(negative.note, /超出步长限制，已限制到 -3/);

    const clamped = validate('inc', '数据.HP', 3, 9);
    assert.equal(clamped.allow, true);
    assert.equal(clamped.value, 10);
    assert.match(clamped.note, /超出范围/);

    const steppedAndClamped = validate('inc', '数据.HP', -8, 1);
    assert.equal(steppedAndClamped.allow, true);
    assert.equal(steppedAndClamped.value, 0);
    assert.match(steppedAndClamped.note, /超出步长限制，已限制到 -3/);
    assert.match(steppedAndClamped.note, /超出范围，已限制到 0/);

    const invalidDelta = validate('inc', '数据.HP', 'bad', 5);
    assert.equal(invalidDelta.allow, false);
    assert.equal(invalidDelta.reason, 'delta 不是数字');

    const readonly = validate('inc', '数据.锁定值', 1, 0);
    assert.equal(readonly.allow, false);
    assert.equal(readonly.reason, '只读字段');
});

test('state2 empty object schema allows extension under that object only', () => {
    installRules(`
$schema 数据
  固定: ""
  自由: {}
`);

    const freeLeaf = validate('set', '数据.自由.临时字段', 123, undefined);
    assert.equal(freeLeaf.allow, true);
    assert.equal(freeLeaf.value, 123);

    const freeSubtree = validate('set', '数据.自由', { a: 1, b: { c: true } }, {});
    assert.equal(freeSubtree.allow, true);
    assert.deepEqual(freeSubtree.value, { a: 1, b: { c: true } });

    const rootExtra = validate('set', '数据.额外', 'x', undefined);
    assert.equal(rootExtra.allow, false);
    assert.equal(rootExtra.reason, '字段不在结构模板中');
});

test('state2 locked object rule without allowedKeys rejects only new keys', () => {
    clearAllRules();
    setRule('数据.固定对象', { typeLock: 'object' });

    const existingOnly = validate('set', '数据.固定对象', { 已有: 2 }, { 已有: 1 });
    assert.equal(existingOnly.allow, true);
    assert.deepEqual(existingOnly.value, { 已有: 2 });

    const newKey = validate('set', '数据.固定对象', { 新字段: 1 }, { 已有: 1 });
    assert.equal(newKey.allow, false);
    assert.equal(newKey.reason, '父层结构已锁定，不允许新增字段');

    const directNewKey = validate('set', '数据.固定对象.新字段', 1, undefined);
    assert.equal(directNewKey.allow, false);
    assert.equal(directNewKey.reason, '父层结构已锁定，不允许新增字段');
});

test('state2 object wildcard schemas validate dynamic keys', () => {
    installRules(`
$schema 数据
  同行者:
    "*":
      HP: 0
      状态: ""
`);

    const dynamicLeaf = validate('set', '数据.同行者.莉娜.HP', '8', 5);
    assert.equal(dynamicLeaf.allow, true);
    assert.equal(dynamicLeaf.value, 8);

    const validDynamicObject = validate('set', '数据.同行者', {
        莉娜: { HP: '8', 状态: '同行' },
        真昼: { HP: 6, 状态: '休息' },
    }, {});
    assert.equal(validDynamicObject.allow, true);
    assert.deepEqual(validDynamicObject.value, {
        莉娜: { HP: 8, 状态: '同行' },
        真昼: { HP: 6, 状态: '休息' },
    });

    const extraInDynamicObject = validate('set', '数据.同行者', {
        莉娜: { HP: 8, 状态: '同行', 非法: true },
    }, {});
    assert.equal(extraInDynamicObject.allow, false);
    assert.equal(extraInDynamicObject.reason, '字段不在结构模板中');
});

test('state2 paths without rules remain permissive', () => {
    clearAllRules();

    const setValue = validate('set', '临时.任何.路径', { a: [1, 'x'] }, undefined);
    assert.equal(setValue.allow, true);
    assert.deepEqual(setValue.value, { a: [1, 'x'] });

    const pushValue = validate('push', '临时.列表', { 任意: true }, undefined);
    assert.equal(pushValue.allow, true);
    assert.deepEqual(pushValue.value, { 任意: true });
});

test('state2 unknown operations pass through unchanged', () => {
    clearAllRules();
    const result = validate('noop', '数据.任意', 'value', undefined);

    assert.equal(result.allow, true);
    assert.equal(result.value, 'value');
});

test('state2 clearRule removes one rule without clearing siblings', () => {
    clearAllRules();
    setRule('数据.HP', { typeLock: 'number' });
    setRule('数据.MP', { typeLock: 'number' });

    clearRule('数据.HP');

    assert.equal(getRuleNode('数据.HP'), null);
    assert.deepEqual(getRuleNode('数据.MP'), { typeLock: 'number' });
});

test('state2 wildcard matching handles nested array templates', () => {
    installRules(`
$schema 数据
  矩阵:
    - - 0
`);

    const leaf = validate('set', '数据.矩阵.0.1', '7', 0);
    assert.equal(leaf.allow, true);
    assert.equal(leaf.value, 7);

    const wholeRoot = validate('set', '数据', {
        矩阵: [[1, 'bad']],
    }, { 矩阵: [[0, 0]] });
    assert.equal(wholeRoot.allow, false);
    assert.match(wholeRoot.reason, /类型不匹配/);
});
