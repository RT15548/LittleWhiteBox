import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceRoot = path.resolve('modules/variables/state2');
const yamlModuleUrl = pathToFileURL(path.resolve('libs/js-yaml.mjs')).href;

function copySourceFile(tempDir, name, transform = source => source) {
    const source = readFileSync(path.join(sourceRoot, name), 'utf8');
    writeFileSync(path.join(tempDir, name), transform(source), 'utf8');
}

async function createHarness() {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'lwb-state2-'));

    writeFileSync(path.join(tempDir, 'package.json'), '{"type":"module"}\n', 'utf8');
    writeFileSync(path.join(tempDir, 'mock-env.js'), `
export const state = {
  ctx: {
    chatId: 'test-chat',
    chat: [],
    chatMetadata: { variables: {}, extensions: {} },
    saveCount: 0,
    saveMetadataDebounced() { this.saveCount += 1; },
  },
};

export function resetContext() {
  state.ctx.chatId = 'test-chat';
  state.ctx.chat = [];
  state.ctx.chatMetadata = { variables: {}, extensions: {} };
  state.ctx.saveCount = 0;
}
`, 'utf8');
    writeFileSync(path.join(tempDir, 'mock-extensions.js'), `
import { state } from './mock-env.js';
export function getContext() {
  return state.ctx;
}
`, 'utf8');
    writeFileSync(path.join(tempDir, 'mock-variables.js'), `
import { state } from './mock-env.js';

export function getLocalVariable(name) {
  const variables = state.ctx.chatMetadata.variables ||= {};
  const value = variables[name];
  if (value == null) return '';
  if (typeof value !== 'string') return value;
  return value.trim?.() === '' || isNaN(Number(value)) ? value : Number(value);
}

export function setLocalVariable(name, value) {
  if (!name) throw new Error('Variable name cannot be empty or undefined.');
  const variables = state.ctx.chatMetadata.variables ||= {};
  variables[name] = value;
  state.ctx.saveMetadataDebounced();
  return value;
}
`, 'utf8');

    copySourceFile(tempDir, 'parser.js', source => source
        .replace("import jsyaml from '../../../libs/js-yaml.mjs';", `import jsyaml from '${yamlModuleUrl}';`));
    copySourceFile(tempDir, 'semantic.js');
    copySourceFile(tempDir, 'guard-core.js');
    copySourceFile(tempDir, 'guard.js', source => source
        .replace("import { getContext } from '../../../../../../extensions.js';", "import { getContext } from './mock-extensions.js';"));
    copySourceFile(tempDir, 'executor.js', source => source
        .replace("import { getContext } from '../../../../../../extensions.js';", "import { getContext } from './mock-extensions.js';")
        .replace("import { getLocalVariable, setLocalVariable } from '../../../../../../variables.js';", "import { getLocalVariable, setLocalVariable } from './mock-variables.js';"));

    const envModuleUrl = pathToFileURL(path.join(tempDir, 'mock-env.js')).href;
    const executorModuleUrl = pathToFileURL(path.join(tempDir, 'executor.js')).href;
    const guardModuleUrl = pathToFileURL(path.join(tempDir, 'guard.js')).href;
    // eslint-disable-next-line no-unsanitized/method
    const env = await import(envModuleUrl);
    // eslint-disable-next-line no-unsanitized/method
    const executor = await import(executorModuleUrl);
    // eslint-disable-next-line no-unsanitized/method
    const guard = await import(guardModuleUrl);

    return {
        tempDir,
        env,
        executor,
        guard,
        reset() {
            env.resetContext();
        },
        cleanup() {
            rmSync(tempDir, { recursive: true, force: true });
        },
    };
}

function readStoredValue(ctx, root) {
    const raw = ctx.chatMetadata.variables?.[root];
    if (typeof raw !== 'string') return raw;
    try { return JSON.parse(raw); } catch { return raw; }
}

function lwbMeta(ctx) {
    return ctx.chatMetadata.extensions?.LittleWhiteBox || {};
}

let harness;

test.before(async () => {
    harness = await createHarness();
});

test.beforeEach(() => {
    harness.reset();
});

test.after(() => {
    harness?.cleanup();
});

test('state2 apply runs parser, rules, guard coercion, WAL, and idempotency together', () => {
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

    const log = lwbMeta(ctx).stateLogV2;
    assert.ok(log.floors['1']);
    assert.equal(log.floors['1'].rules.length, 5);
    assert.equal(log.floors['1'].ops.length, 1);
    assert.deepEqual(log.floors['1'].roots, ['数据']);

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

test('state2 restore replays WAL to the requested floor and restores rules', async () => {
    const { ctx } = harness.env.state;
    harness.executor.applyStateForMessage(1, `
<state>
$schema 数据
  背包:
    - 名称: ""
      数量: 0
数据.背包: +{"名称":"蓝药","数量":"5"}
</state>
`);
    harness.executor.applyStateForMessage(2, `
<state>
数据.背包: +{"名称":"红药","数量":"7"}
</state>
`);
    harness.executor.applyStateForMessage(3, `
<state>
数据.背包: +{"名称":"坏药","数量":"9"}
</state>
`);

    await harness.executor.restoreStateV2ToFloor(2);

    assert.deepEqual(readStoredValue(ctx, '数据'), {
        背包: [
            { 名称: '蓝药', 数量: 5 },
            { 名称: '红药', 数量: 7 },
        ],
    });
    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2['数据.背包.[*].数量'], { typeLock: 'number' });

    const guard = harness.guard.validate('set', '数据.背包.2.数量', '8', undefined);
    assert.equal(guard.allow, true);
    assert.equal(guard.value, 8);
});

test('state2 trim removes future WAL/checkpoints/applied signatures before restore', async () => {
    const { ctx } = harness.env.state;
    ctx.chatMetadata.extensions = {
        LittleWhiteBox: {
            stateCkptV2: { version: 1, every: 1, points: {} },
        },
    };

    harness.executor.applyStateForMessage(1, `
<state>
数据.值: 1
</state>
`);
    harness.executor.applyStateForMessage(2, `
<state>
数据.值: 2
</state>
`);
    harness.executor.applyStateForMessage(3, `
<state>
数据.值: 3
</state>
`);

    assert.ok(lwbMeta(ctx).stateCkptV2.points['3']);

    await harness.executor.trimStateV2FromFloor(3);
    await harness.executor.restoreStateV2ToFloor(10);

    assert.deepEqual(readStoredValue(ctx, '数据'), { 值: 2 });
    assert.equal(lwbMeta(ctx).stateLogV2.floors['3'], undefined);
    assert.equal(lwbMeta(ctx).stateCkptV2.points['3'], undefined);
});

test('state2 checkpoint replay matches full replay and keeps later floors', async () => {
    const { ctx } = harness.env.state;
    ctx.chatMetadata.extensions = {
        LittleWhiteBox: {
            stateCkptV2: { version: 1, every: 2, points: {} },
        },
    };

    harness.executor.applyStateForMessage(1, `
<state>
数据.值: 1
</state>
`);
    harness.executor.applyStateForMessage(2, `
<state>
数据.值: +4
</state>
`);
    harness.executor.applyStateForMessage(3, `
<state>
数据.列表: +["x"]
</state>
`);

    assert.deepEqual(lwbMeta(ctx).stateCkptV2.points['2'].vars, {
        数据: '{"值":5}',
        LWB_STATE_ERRORS: '',
    });

    await harness.executor.restoreStateV2ToFloor(3);
    assert.deepEqual(readStoredValue(ctx, '数据'), {
        值: 5,
        列表: ['x'],
    });
});

test('state2 checkpoint saving can be disabled without breaking restore', async () => {
    const { ctx } = harness.env.state;
    ctx.chatMetadata.extensions = {
        LittleWhiteBox: {
            stateCkptV2: { version: 1, every: 0, points: {} },
        },
    };

    harness.executor.applyStateForMessage(1, `
<state>
数据.值: 1
</state>
`);
    harness.executor.applyStateForMessage(2, `
<state>
数据.值: +2
</state>
`);

    assert.deepEqual(lwbMeta(ctx).stateCkptV2.points, {});
    await harness.executor.restoreStateV2ToFloor(2);
    assert.deepEqual(readStoredValue(ctx, '数据'), { 值: 3 });
});

test('state2 restore and trim handle invalid floors defensively', async () => {
    const { ctx } = harness.env.state;
    harness.executor.applyStateForMessage(1, `
<state>
数据.值: 1
</state>
`);

    const invalidRestore = await harness.executor.restoreStateV2ToFloor('bad');
    assert.deepEqual(invalidRestore, { ok: true, usedCheckpoint: null });
    assert.equal(ctx.chatMetadata.variables.数据, undefined);

    const invalidTrim = await harness.executor.trimStateV2FromFloor('bad');
    assert.deepEqual(invalidTrim, { ok: false });
});

test('state2 restore below zero clears only State2-owned roots and rules', async () => {
    const { ctx } = harness.env.state;
    ctx.chatMetadata.variables.外部 = '{"保留":true}';
    ctx.chatMetadata.LWB_RULES_V2 = {
        '外部.字段': { typeLock: 'string' },
    };

    harness.executor.applyStateForMessage(1, `
<state>
$schema 数据
  值: 0
数据.值: 1
</state>
`);

    await harness.executor.restoreStateV2ToFloor(-1);

    assert.deepEqual(readStoredValue(ctx, '外部'), { 保留: true });
    assert.equal(ctx.chatMetadata.variables.数据, undefined);
    assert.deepEqual(ctx.chatMetadata.LWB_RULES_V2, {
        '外部.字段': { typeLock: 'string' },
    });
});

test('state2 removing state block clears that floor WAL and reapplies prior state on restore', async () => {
    const { ctx } = harness.env.state;
    harness.executor.applyStateForMessage(1, `
<state>
数据.值: 1
</state>
`);
    harness.executor.applyStateForMessage(2, `
<state>
数据.值: 2
</state>
`);

    const result = harness.executor.applyStateForMessage(2, 'no state here');
    assert.equal(result.skipped, false);
    assert.equal(lwbMeta(ctx).stateLogV2.floors['2'], undefined);

    await harness.executor.restoreStateV2ToFloor(2);
    assert.deepEqual(readStoredValue(ctx, '数据'), { 值: 1 });
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
