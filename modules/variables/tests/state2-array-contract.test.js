import test from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Protect JSON batch intake without changing deployed text/request execution semantics.
let harness;
let api;
const KEY = 'LittleWhiteBox_state2';
const ctx = () => harness.env.state.ctx;
const value = () => readStoredValue(ctx(), 'data');
const state = body => `<state>\n${body}\n</state>`;
const snapshot = () => structuredClone({ metadata: ctx().chatMetadata, records: ctx().chat.map(message => message.extra) });
const seed = (data = { a: ['A', 'B', 'C', 'D'], b: ['U', 'V', 'W'] }) => {
    harness.reset();
    ctx().chat = Array.from({ length: 50 }, () => ({ mes: 'existing', swipe_id: 0 }));
    api = harness.executor.createStateApi();
    const initialized = harness.executor.applyStateForMessage(0, state(`data: ${JSON.stringify(data)}`));
    assert.equal(initialized.errors.length, 0);
};
const replay = () => {
    const expected = structuredClone(value());
    harness.executor.rebuildStateV2();
    assert.deepEqual(value(), expected, 'warm replay');
    delete ctx().chatMetadata.extensions.LittleWhiteBox.stateCkptV2;
    harness.executor.rebuildStateV2();
    assert.deepEqual(value(), expected, 'cold replay');
};
const reject = (ops, index = 1, conflictsWith = 0) => {
    const before = snapshot();
    const result = api.apply({ ops });
    assert.equal(result.status, 'failed');
    assert.deepEqual(result.changes, []);
    assert.equal(result.errors[0]?.code, 'conflicting_operations');
    assert.equal(result.errors[0]?.index, index);
    assert.equal(result.errors[0]?.conflictsWith, conflictsWith);
    assert.equal(result.errors[0]?.pointer, `/ops/${index}/path`);
    assert.deepEqual(snapshot(), before, 'conflict changes neither variables/rules/checkpoints nor message records');
};

test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => seed());
test.after(() => harness.cleanup());

test('safe distinct index deletions retain reverse-order protection and replay', () => {
    const result = api.apply({ ops: [
        { op: 'del', path: 'data.a.1' },
        { op: 'del', path: 'data.a[2]' },
    ] });
    assert.equal(result.status, 'success');
    assert.deepEqual(value().a, ['A', 'D']);
    assert.deepEqual(result.changes.map(change => change.index), [1, 0]);
    replay();
});

test('duplicate index deletion including dot/bracket aliases rejects the entire batch', () => {
    for (const [first, second] of [
        ['data.a.0', 'data.a.0'],
        ['data.a.0', 'data.a[0]'],
        ['data.a.1', 'data.a["01"]'],
    ]) {
        seed();
        reject([
            { op: 'del', path: first },
            { op: 'del', path: second },
            { op: 'push', path: 'data.b', value: 'must-not-run' },
        ]);
    }
});

test('deleting an item and editing its original successor rejects before any write', () => {
    seed({ a: [{ id: 'A', n: 1 }, { id: 'B', n: 2 }, { id: 'C', n: 3 }] });
    reject([
        { op: 'del', path: 'data.a.0' },
        { op: 'set', path: 'data.a[1].n', value: 99 },
    ]);
});

test('moving the indexed edit earlier within the same JSON batch does not bypass conflict checks', () => {
    reject([
        { op: 'set', path: 'data.a.2', value: 'edited' },
        { op: 'del', path: 'data.a.0' },
    ]);
});

test('array or ancestor set/delete overlaps reject without records or variable changes', () => {
    for (const other of [
        { op: 'set', path: 'data.a', value: ['X'] },
        { op: 'set', path: 'data', value: { a: ['X'] } },
        { op: 'del', path: 'data.a' },
        { op: 'del', path: 'data' },
    ]) {
        seed();
        reject([{ op: 'del', path: 'data.a.1' }, other]);
    }
});

test('outer deletion and shifted nested deletion cannot accidentally delete another original item', () => {
    seed({ a: [['A0', 'A1'], ['B0', 'B1'], ['C0', 'C1']] });
    reject([
        { op: 'del', path: 'data.a.0' },
        { op: 'del', path: 'data.a.1.0' },
    ]);
});

test('independent arrays and modifications below every deleted index remain legal', () => {
    const result = api.apply({ ops: [
        { op: 'del', path: 'data.a.2' },
        { op: 'set', path: 'data.a.0', value: 'edited-A' },
        { op: 'del', path: 'data.b[1]' },
    ] });
    assert.equal(result.status, 'success');
    assert.deepEqual(value(), { a: ['edited-A', 'B', 'D'], b: ['U', 'W'] });
    replay();
});

test('same-array push/remove keep delete-first semantics rather than becoming source-order execution', () => {
    const result = api.apply({ ops: [
        { op: 'push', path: 'data.a', value: 'E' },
        { op: 'remove', path: 'data.a', value: 'A' },
        { op: 'del', path: 'data.a.1' },
    ] });
    assert.equal(result.status, 'success');
    assert.deepEqual(value().a, ['C', 'D', 'E']);
    assert.deepEqual(result.changes.map(change => change.op), ['del', 'push', 'remove']);
    replay();
});

test('two JSON body blocks cannot bypass whole-entry conflict validation', () => {
    const before = snapshot();
    const blocks = [
        { ops: [{ op: 'del', path: 'data.a.0' }] },
        { ops: [{ op: 'del', path: 'data.a[0]' }] },
    ].map(input => state(JSON.stringify(input))).join('\n');
    const result = harness.executor.applyStateForMessage(49, blocks);
    assert.equal(result.atoms.length, 0);
    assert.ok(result.errors.length > 0);
    assert.deepEqual(snapshot(), before);
});

test('mixed text and JSON blocks are checked together, unlike old all-text requests', () => {
    const before = snapshot();
    const blocks = state('data.a.0: null') + state(JSON.stringify({ ops: [{ op: 'del', path: 'data.a[0]' }] }));
    const result = harness.executor.applyStateForMessage(49, blocks);
    assert.equal(result.atoms.length, 0);
    assert.ok(result.errors.length > 0);
    assert.deepEqual(snapshot(), before);
});

test('legacy all-text duplicate deletion retains its deployed meaning and replays unchanged', () => {
    const result = harness.executor.applyStateForMessage(49, state('data.a.0: null\ndata.a[0]: null'));
    assert.equal(result.errors.length, 0);
    assert.deepEqual(value().a, ['C', 'D']);
    assert.equal(ctx().chat[49].extra[KEY].entries[0].ops.length, 2);
    replay();
});

test('unrelated JSON does not redefine a purely textual duplicate-delete pair', () => {
    const blocks = state('data.a.0: null\ndata.a[0]: null')
        + state(JSON.stringify({ ops: [{ op: 'push', path: 'data.b', value: 'X' }] }));
    const result = harness.executor.applyStateForMessage(49, blocks);
    assert.equal(result.errors.length, 0);
    assert.deepEqual(value(), { a: ['C', 'D'], b: ['U', 'V', 'W', 'X'] });
    replay();
});

test('already stored requests replay their deployed meaning without new intake validation', () => {
    ctx().chat[49].extra = { [KEY]: { v: 1, entries: [{
        kind: 'call', source: 'json', roots: [], ops: [
            { op: 'del', path: 'data.a.0', source: 'json' },
            { op: 'del', path: 'data.a[0]', source: 'json' },
        ],
    }] } };
    harness.executor.rebuildStateV2();
    assert.deepEqual(value().a, ['C', 'D']);
    replay();
});

test('caller can correct a rejected batch and resubmit as two calls without a ghost earlier record', () => {
    seed({ a: [{ id: 'A', n: 1 }, { id: 'B', n: 2 }, { id: 'C', n: 3 }] });
    reject([
        { op: 'del', path: 'data.a.0' },
        { op: 'set', path: 'data.a.1.n', value: 99 },
    ]);
    assert.equal(api.apply({ ops: [{ op: 'set', path: 'data.a.1.n', value: 99 }] }).status, 'success');
    assert.equal(api.apply({ ops: [{ op: 'del', path: 'data.a.0' }] }).status, 'success');
    assert.equal(ctx().chat[49].extra[KEY].entries.length, 2);
    assert.deepEqual(value().a, [{ id: 'B', n: 99 }, { id: 'C', n: 3 }]);
    replay();
});

test('one JSON batch can edit an original item then remove another by value without index ambiguity', () => {
    seed({ a: [{ id: 'A', n: 1 }, { id: 'B', n: 2 }, { id: 'C', n: 3 }] });
    const result = api.apply({ ops: [
        { op: 'set', path: 'data.a[1].n', value: 99 },
        { op: 'remove', path: 'data.a', value: { id: 'A', n: 1 } },
    ] });
    assert.equal(result.status, 'success');
    assert.deepEqual(value().a, [{ id: 'B', n: 99 }, { id: 'C', n: 3 }]);
    replay();
});

test('quoted dotted key paths remain structurally distinct during alias validation', () => {
    seed({ 'x.y': ['A', 'B'], x: { y: ['U', 'V'] } });
    const result = api.apply({ ops: [
        { op: 'del', path: 'data["x.y"].0' },
        { op: 'del', path: 'data.x.y.0' },
    ] });
    assert.equal(result.status, 'success');
    assert.deepEqual(value(), { 'x.y': ['B'], x: { y: ['V'] } });
    replay();
});
