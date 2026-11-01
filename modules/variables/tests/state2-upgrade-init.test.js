import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Unmodified JSONL saved by SillyTavern 1.18 + official 08a52c34/build 2d89bcef0d8c47f59674.
// A real character initialization task ran via doNewChat; ordinary first-message sync erased its WAL.
// Complete: the user's script plus 后宫: {}, then a real /sendas state decrement and reload (100 -> 90).
// Rules-only: the verbatim script was rejected for its missing schema field; no data value was admitted.
function fixture(name) {
    const [header, ...chat] = readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
        .trim().split(/\r?\n/).map(line => JSON.parse(line));
    return { chat, metadata: header.chat_metadata };
}
const complete = fixture('state2-wal-v1-init-complete.jsonl');
const rulesOnly = fixture('state2-wal-v1-init-rules-only.jsonl');
let harness;
const ctx = () => harness.env.state.ctx;
const legacy = () => ctx().chatMetadata.extensions.LittleWhiteBox;
function load(saved) {
    harness.reset();
    ctx().chat = structuredClone(saved.chat);
    ctx().chatMetadata = structuredClone(saved.metadata);
}
function coldOpen() {
    const saved = JSON.parse(JSON.stringify({ chat: ctx().chat, metadata: ctx().chatMetadata }));
    load(saved);
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
}
const life = () => readStoredValue(ctx(), '数据')?.角色?.生命值;

test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => load(complete));
test.after(() => harness.cleanup());

test('real initialization survives migration, cold reload, plain first-message sync and deletion of its later delta', () => {
    const initial = JSON.parse(legacy().stateCkptV2.points['0'].vars.数据);
    const rules = structuredClone(legacy().stateCkptV2.points['0'].rules);
    assert.equal(life(), 90);
    assert.equal(Object.hasOwn(legacy().stateLogV2.floors, '0'), false);
    harness.executor.openStateChat();
    assert.equal(life(), 90); // Opening converts history without rerunning the initializer.
    assert.equal(legacy().stateLogV2, undefined);
    coldOpen();
    assert.equal(life(), 90);
    assert.deepEqual(ctx().chatMetadata.LWB_RULES_V2, rules);
    harness.executor.applyStateForMessage(0, ctx().chat[0].mes);
    harness.executor.rebuildStateV2();
    assert.equal(life(), 90);
    ctx().chat.pop();
    harness.executor.rebuildStateV2();
    assert.deepEqual(readStoredValue(ctx(), '数据'), initial);
    coldOpen();
    assert.deepEqual(readStoredValue(ctx(), '数据'), initial);
    assert.deepEqual(ctx().chatMetadata.LWB_RULES_V2, rules);
    const result = harness.executor.createStateApi().apply({ ops: [
        { op: 'inc', path: '数据.角色.生命值', delta: 100 },
        { op: 'set', path: '数据.角色.额外字段', value: 'not in schema' },
    ] });
    assert.equal(result.status, 'partial');
    assert.equal(result.errors[0].code, 'rule_rejected');
    assert.equal(life(), 150); // Preserved step=50 still governs the increment.
    coldOpen();
    assert.equal(life(), 150);
});

test('checkpoint values are admitted before readonly rules rather than revalidated as new assignments', () => {
    legacy().stateCkptV2.points['0'].rules['数据.角色.姓名'].ro = true;
    ctx().chatMetadata.LWB_RULES_V2['数据.角色.姓名'].ro = true;
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
    assert.equal(readStoredValue(ctx(), '数据').角色.姓名, '苏晚');
    assert.equal(life(), 90);
    const result = harness.executor.createStateApi().apply({ ops: [
        { op: 'set', path: '数据.角色.姓名', value: 'changed' },
    ] });
    assert.equal(result.errors[0].code, 'rule_rejected');
    coldOpen();
    assert.equal(readStoredValue(ctx(), '数据').角色.姓名, '苏晚');
});

test('snapshot extras and a later WAL claim do not authorize recovery of native initial values', () => {
    legacy().stateCkptV2.points['0'].vars.Native = '100';
    legacy().stateCkptV2.points['0'].vars.Independent = 'old snapshot';
    ctx().chatMetadata.variables.Native = '90';
    ctx().chatMetadata.variables.Independent = 'keep current native';
    const text = '<state>Native: -10</state>';
    ctx().chat.push({ mes: text, swipe_id: 0 });
    legacy().stateLogV2.floors['2'] = {
        signature: text, rules: [], ops: [{ path: 'Native', op: 'inc', delta: -10 }], roots: ['Native'],
    };
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
    assert.equal(life(), 90);
    assert.equal(readStoredValue(ctx(), 'Native'), -10);
    assert.equal(readStoredValue(ctx(), 'Independent'), 'keep current native');
    const result = harness.executor.createStateApi().apply({ ops: [
        { op: 'set', path: 'Independent', value: 'takeover' },
    ] });
    assert.equal(result.errors[0].code, 'unmanaged_root');
    coldOpen();
    assert.equal(readStoredValue(ctx(), 'Native'), -10);
    assert.equal(readStoredValue(ctx(), 'Independent'), 'keep current native');
});

for (const roots of [[], ['数据']]) {
    test(`an existing floor-zero WAL remains authoritative with ${roots.length ? 'declared' : 'empty'} ownership`, () => {
        legacy().stateLogV2.floors['0'] = {
            signature: '<state>数据.角色.生命值: -1</state>', rules: [],
            ops: [{ path: '数据.角色.生命值', op: 'inc', delta: -1 }], roots,
        };
        harness.executor.openStateChat();
        assert.deepEqual(ctx().chat[0].extra.LittleWhiteBox_state2.entries[0].roots, roots);
        harness.executor.rebuildStateV2();
        assert.equal(life(), -11); // Replay the existing requests, never substitute checkpoint=100.
        assert.deepEqual(ctx().chatMetadata.LWB_RULES_V2, {});
    });
}

test('an existing current record is never supplemented from an old checkpoint', () => {
    ctx().chat[0].extra.LittleWhiteBox_state2 = { v: 1, entries: [{
        kind: 'call', source: 'text', blocks: [], rules: [], roots: ['数据'],
        ops: [{ op: 'set', path: '数据', value: { 角色: { 生命值: 200 } }, source: 'text' }],
    }] };
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
    assert.equal(life(), 190);
    assert.deepEqual(ctx().chatMetadata.LWB_RULES_V2, {});
});

test('a real rejected initializer preserves its declared rules without inventing its missing data', () => {
    load(rulesOnly);
    const rules = structuredClone(legacy().stateCkptV2.points['0'].rules);
    harness.executor.openStateChat();
    coldOpen();
    assert.equal(readStoredValue(ctx(), '数据'), undefined);
    assert.equal(Object.hasOwn(ctx().chatMetadata.variables, '数据'), false);
    assert.deepEqual(ctx().chatMetadata.LWB_RULES_V2, rules);
    const result = harness.executor.createStateApi().apply({ ops: [
        { op: 'set', path: '数据.角色.额外字段', value: 'not in schema' },
    ] });
    assert.equal(result.errors[0].code, 'rule_rejected'); // The root is managed, but the field is forbidden.
    assert.equal(readStoredValue(ctx(), '数据'), undefined);
});

test('unknown checkpoint versions are not interpreted and rule-free snapshots grant no initial scope', () => {
    legacy().stateCkptV2.version = 2;
    legacy().stateCkptV2.points = null;
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
    assert.equal(life(), -10);
    load(complete);
    legacy().stateCkptV2.points['0'].rules = {};
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
    assert.equal(life(), -10);
});

for (const [name, damage] of [
    ['invalid points', store => { store.stateCkptV2.points = []; }],
    ['null initial point', store => { store.stateCkptV2.points['0'] = null; }],
    ['invalid initial variables', store => { store.stateCkptV2.points['0'].vars = []; }],
    ['invalid rule map', store => { store.stateCkptV2.points['0'].rules = []; }],
    ['invalid rule', store => { store.stateCkptV2.points['0'].rules.数据 = null; }],
    ['invalid rule path', store => { store.stateCkptV2.points['0'].rules[''] = { typeLock: 'object' }; }],
    ['null existing WAL is not a missing WAL', store => { store.stateLogV2.floors['0'] = null; }],
]) {
    test(`malformed legacy candidate fails atomically: ${name}`, () => {
        damage(legacy());
        const before = structuredClone({ chat: ctx().chat, metadata: ctx().chatMetadata });
        assert.throws(() => harness.executor.openStateChat(), error => error.code === 'legacy_conversion_failed');
        assert.deepEqual({ chat: ctx().chat, metadata: ctx().chatMetadata }, before);
        assert.equal(ctx().saveCount, 0);
        assert.equal(ctx().metadataSaveCount, 0);
    });
}
