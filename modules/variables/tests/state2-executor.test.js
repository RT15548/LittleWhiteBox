import test from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';
let harness;

test.before(async () => {
    harness = await createHarness();
});

test.beforeEach(() => {
    harness.reset();
    harness.env.state.ctx.chat = Array.from({ length: 9 }, () => ({ mes: 'existing message', swipe_id: 0 }));
});

test.after(() => {
    harness?.cleanup();
});

test('state2 apply runs parser, rules, guard coercion, request recording, and idempotency together', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(1, `
before
<state>
$schema 数据
  背包:
    - 名称: ""
      数量: 0
</state>
middle
<state>
数据.背包: +{"名称":"蓝药","数量":"5"}
</state>
`);

    assert.equal(result.skipped, false);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        背包: [{ 名称: '蓝药', 数量: 5 }],
    });
    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2['数据.背包.[*].数量'], { typeLock: 'number' });

    const record = ctx.chat[1].extra.LittleWhiteBox_state2;
    assert.equal(record.v, 1);
    assert.equal(record.entries.length, 1);
    assert.equal(record.entries[0].rules.length, 5);
    assert.deepEqual(record.entries[0].ops, [{ op: 'push', path: '数据.背包', value: { 名称: '蓝药', 数量: '5' }, source: 'text' }]);
    const second = harness.executor.applyStateForMessage(1, `
before
<state>
$schema 数据
  背包:
    - 名称: ""
      数量: 0
</state>
middle
<state>
数据.背包: +{"名称":"蓝药","数量":"5"}
</state>
`);
    assert.equal(second.skipped, true);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        背包: [{ 名称: '蓝药', 数量: 5 }],
    });
});

test('state2 executor preserves [*] array template paths separately from object wildcard paths', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(1, `
<state>
$schema 数据
  背包:
    - 数量: 0
  同行者:
    "*":
      HP: 0
</state>
`);

    assert.equal(result.errors.length, 0);
    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2['数据.背包.[*].数量'], { typeLock: 'number' });
    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2['数据.同行者.*.HP'], { typeLock: 'number' });
    assert.equal(ctx.chatMetadata.LWB_RULES_V2['数据.背包.*.数量'], undefined);
});

test('state2 rejects invalid deep writes without storing bad values', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(2, `
<state>
$schema 数据
  背包:
    - 名称: ""
      数量: 0
数据.背包: +{"名称":"蓝药","数量":"bad"}
数据.背包: +{"名称":"红药","数量":"3"}
</state>
`);

    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /类型不匹配/);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        背包: [{ 名称: '红药', 数量: 3 }],
    });
    assert.match(ctx.chatMetadata.variables.LWB_STATE_ERRORS, /类型不匹配/);
});

test('state2 rejects push to schema paths that are not arrays', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(8, `
<state>
$schema 数据
  名称: ""
数据.名称: +"x"
</state>
`);

    assert.equal(result.atoms.length, 0);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /期望 array/);
    assert.equal(ctx.chatMetadata.variables.数据, undefined);
    assert.match(ctx.chatMetadata.variables.LWB_STATE_ERRORS, /期望 array/);
});

test('state2 parser operation forms execute through the real executor', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(3, `
<state>
数据.计数: 1
数据.计数: +4
数据.标签: +["a","b"]
数据.标签: +"c"
数据.标签: -"b"
数据.对象: {"保留":true}
数据.对象: null
</state>
`);

    assert.equal(result.errors.length, 0);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        计数: 5,
        标签: ['a', 'c'],
    });
});

test('state2 parser preserves quoted colons and ignores inline comments outside quotes', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(4, `
<state>
数据.文本: "a: b # kept" # dropped
数据.单引号: 'x # kept'
数据.对象:
  标题: "里:面"
  备注: "井号 # 留下"
</state>
`);

    assert.equal(result.errors.length, 0);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        文本: 'a: b # kept',
        单引号: 'x # kept',
        对象: {
            标题: '里:面',
            备注: '井号 # 留下',
        },
    });
});

test('state2 parser reports malformed inline json without corrupting later ops', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(5, `
<state>
数据.坏对象: {"a":
数据.好对象: {"a":1}
数据.坏推入: +{"a":
数据.好列表: +"ok"
</state>
`);

    assert.equal(result.errors.length, 2);
    assert.match(result.errors[0], /JSON 解析失败/);
    assert.match(result.errors[1], /\+\{\} 解析失败/);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        坏对象: '{"a":',
        好对象: { a: 1 },
        坏推入: '+{"a":',
        好列表: ['ok'],
    });
});

test('state2 parser handles multiple and malformed state tags defensively', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(6, `
ignored <statement>not a state</statement>
<state id="a">
数据.A: 1
</state   >
<state>
数据.B: 2
</state>
<state>
数据.C: 3
`);

    assert.equal(result.errors.length, 0);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        A: 1,
        B: 2,
    });
});

test('state2 deletes array indexes by original index order before other ops', () => {
    const { ctx } = harness.env.state;
    harness.executor.applyStateForMessage(1, `
<state>
数据.列表: ["a","b","c","d"]
</state>
`);

    const result = harness.executor.applyStateForMessage(2, `
<state>
数据.列表.1: null
数据.列表.2: null
数据.列表: +"e"
</state>
`);

    assert.equal(result.errors.length, 0);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        列表: ['a', 'd', 'e'],
    });
});

test('state2 execution records operation failures without writing atoms', () => {
    const { ctx } = harness.env.state;
    const result = harness.executor.applyStateForMessage(7, `
<state>
数据.文本: "not array"
数据.文本: +"x"
数据.缺失: -"x"
</state>
`);

    assert.equal(result.atoms.length, 1);
    assert.equal(result.errors.length, 2);
    assert.match(result.errors[0], /not-array/);
    assert.match(result.errors[1], /not-array/);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        文本: 'not array',
    });
    assert.match(ctx.chatMetadata.variables.LWB_STATE_ERRORS, /not-array/);
});

test('state2 guard metadata wrapper saves and reloads core rules', () => {
    const { ctx } = harness.env.state;
    harness.guard.clearAllRules();
    harness.guard.setRule('数据.HP', { typeLock: 'number', min: 0, max: 10 });
    harness.guard.saveRulesToMeta();

    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2, {
        '数据.HP': { typeLock: 'number', min: 0, max: 10 },
    });

    const savedRules = ctx.chatMetadata.LWB_RULES_V2;
    harness.guard.clearAllRules();
    ctx.chatMetadata.LWB_RULES_V2 = savedRules;
    assert.equal(harness.guard.validate('set', '数据.HP', '12', 0).value, '12');

    harness.guard.loadRulesFromMeta();
    const result = harness.guard.validate('set', '数据.HP', '12', 0);
    assert.equal(result.allow, true);
    assert.equal(result.value, 10);
});

test('state2 guard metadata wrapper clears a single rule and persists siblings', () => {
    const { ctx } = harness.env.state;
    harness.guard.clearAllRules();
    harness.guard.setRule('数据.HP', { typeLock: 'number' });
    harness.guard.setRule('数据.MP', { typeLock: 'number' });
    harness.guard.saveRulesToMeta();

    harness.guard.clearRule('数据.HP');

    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2, {
        '数据.MP': { typeLock: 'number' },
    });

    harness.guard.clearAllRules();
    ctx.chatMetadata.LWB_RULES_V2 = { '数据.MP': { typeLock: 'number' } };
    harness.guard.loadRulesFromMeta();

    assert.equal(harness.guard.validate('set', '数据.HP', '12', 0).value, '12');
    assert.equal(harness.guard.validate('set', '数据.MP', '12', 0).value, 12);
});
