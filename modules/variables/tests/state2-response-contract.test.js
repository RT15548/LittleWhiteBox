import test from 'node:test';
import assert from 'node:assert/strict';

import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Receipts stay isolated from observers; operation errors and notification warnings are distinct.


let harness;
const context = () => harness.env.state.ctx;
const readRole = () => readStoredValue(context(), '角色');
const block = body => `<state>\n${body}\n</state>`;
const inc = delta => ({ op: 'inc', path: '角色.金钱', delta });
const initialize = extra => harness.executor.applyStateForMessage(0, block('角色: {"金钱":100,"背包":["a","b","c"],"位置":"家"}\n' + (extra || '')));

test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => {
  harness.reset();
  context().chat = [{ mes: '', swipe_id: 0 }, { mes: '', swipe_id: 0 }];
  initialize();
});
test.after(() => harness.cleanup());

test('synchronous and retained observers cannot rewrite the JSON response values', () => {
  let observed;
  const api = harness.executor.createStateApi({ notify(event) {
    observed = event;
    event.atoms[0].oldValue[0] = 'observer-old';
    event.atoms[0].newValue.push('observer-now');
  } });
  const result = api.apply({ ops: [{ op: 'push', path: '角色.背包', value: 'd' }] });
  assert.deepEqual(result.changes[0].oldValue, ['a', 'b', 'c']);
  assert.deepEqual(result.changes[0].newValue, ['a', 'b', 'c', 'd']);
  observed.atoms[0].oldValue.push('observer-later');
  observed.atoms[0].newValue.push('observer-later');
  assert.deepEqual(result.changes[0].oldValue, ['a', 'b', 'c']);
  assert.deepEqual(result.changes[0].newValue, ['a', 'b', 'c', 'd']);
  assert.deepEqual(readRole().背包, ['a', 'b', 'c', 'd']);
  assert.equal(context().chat[1].extra.LittleWhiteBox_state2.entries.length, 1);
  harness.executor.rebuildStateV2();
  assert.deepEqual(readRole().背包, ['a', 'b', 'c', 'd']);
});

test('notification failures are warnings, not operation errors, and do not rerun committed writes', () => {
  let notified = 0;
  const api = harness.executor.createStateApi({ notify() { notified++; throw new Error('observer failed'); } });
  const result = api.apply({ ops: [inc(-20)] });
  assert.equal(result.status, 'success');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings.map(warning => warning.code), ['notification_failed']);
  assert.equal(notified, 1);
  assert.equal(readRole().金钱, 80);
  assert.equal(context().chat[1].extra.LittleWhiteBox_state2.entries.length, 1);
  harness.executor.rebuildStateV2();
  assert.equal(readRole().金钱, 80);
  assert.equal(notified, 1);
});

test('every JSON result has warnings, including noop and input rejection', () => {
  const api = harness.executor.createStateApi();
  for (const input of [{ ops: [] }, '{']) {
    const result = api.apply(input);
    assert.deepEqual(result.warnings, []);
  }
});

test('changes expose only operation results, retaining input index, public names and actual inc delta', () => {
  const notifications = [];
  const api = harness.executor.createStateApi({ notify: event => notifications.push(event) });
  const result = api.apply({ ops: [inc(-20), { op: 'remove', path: '角色.背包', value: 'b' }] });
  assert.deepEqual(result.changes.map(change => Object.keys(change).sort()), [
    ['index', 'path', 'op', 'oldValue', 'newValue', 'delta'].sort(),
    ['index', 'path', 'op', 'oldValue', 'newValue'].sort(),
  ]);
  assert.deepEqual(result.changes.map(change => ({ index: change.index, op: change.op })), [{ index: 0, op: 'inc' }, { index: 1, op: 'remove' }]);
  assert.equal(result.changes[0].delta, -20);
  assert.equal(result.changes[0].oldValue, 100);
  assert.equal(result.changes[0].newValue, 80);
  assert.deepEqual(result.changes[1].oldValue, ['a', 'b', 'c']);
  assert.deepEqual(result.changes[1].newValue, ['a', 'c']);
  assert.equal(notifications[0].atoms[1].op, 'pop');
  assert.ok(notifications[0].atoms[1].atomId);
});

test('corrections retain the requested delta and guarded target for corrected noops', () => {
  initialize('$range=[0,100] 角色.金钱');
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [inc(20)] });
  assert.equal(result.status, 'noop');
  assert.deepEqual(result.changes, []);
  assert.equal(result.corrections[0].index, 0);
  assert.equal(result.corrections[0].requested, 20);
  assert.equal(result.corrections[0].value, 100);
  assert.equal(readRole().金钱, 100);
});

test('a guard refusal has the original input index and no successful guard correction', () => {
  harness.executor.applyStateForMessage(1, block('$ro 角色.金钱'));
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [inc(-20)] });
  assert.equal(result.status, 'failed');
  assert.deepEqual(result.changes, []);
  assert.deepEqual(result.corrections, []);
  assert.equal(result.errors[0].index, 0);
  assert.equal(result.errors[0].code, 'rule_rejected');
  assert.equal(readRole().金钱, 100);
});

test('a correction is a guarded candidate, not an applied effect when execution later fails', () => {
  initialize('$range=[0,10] 角色.位置.[*]');
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [inc(-20), { op: 'push', path: '角色.位置', value: 20 }] });
  assert.equal(result.status, 'partial');
  assert.deepEqual(result.changes.map(change => change.index), [0]);
  assert.equal(result.corrections[0].index, 1);
  assert.equal(result.corrections[0].requested, 20);
  assert.equal(result.corrections[0].value, 10);
  assert.equal(result.errors[0].index, 1);
  assert.equal(result.errors[0].code, 'operation_failed');
  assert.equal(readRole().位置, '家');
  assert.equal(readRole().金钱, 80);
});

test('prototype-named fields are absent until written and return a committed receipt', () => {
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [inc(-10), { op: 'set', path: '角色.toString', value: 'hello' }] });
  assert.equal(result.status, 'success');
  assert.deepEqual(result.errors, []);
  assert.equal(result.changes[1].oldValue, undefined);
  assert.equal(result.changes[1].newValue, 'hello');
  assert.equal(readRole().金钱, 90);
  assert.equal(readRole().toString, 'hello');
  assert.equal(context().chat[1].extra.LittleWhiteBox_state2.entries[0].ops.length, 2);
  harness.executor.rebuildStateV2();
  assert.equal(readRole().金钱, 90);
  assert.equal(readRole().toString, 'hello');
});

test('prototype-named members follow normal increment, array, nested write and delete semantics', () => {
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [
    { op: 'inc', path: '角色.valueOf', delta: 3 },
    { op: 'push', path: '角色.hasOwnProperty', value: ['a', 'b'] },
    { op: 'set', path: '角色.toString.name', value: 'nested' },
    { op: 'del', path: '角色.toLocaleString' },
  ] });
  assert.equal(result.status, 'success');
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.changes.map(change => change.oldValue), [undefined, undefined, undefined]);
  assert.equal(readRole().valueOf, 3);
  assert.deepEqual(readRole().hasOwnProperty, ['a', 'b']);
  assert.deepEqual(readRole().toString, { name: 'nested' });
  harness.executor.rebuildStateV2();
  assert.equal(readRole().valueOf, 3);
  assert.deepEqual(readRole().hasOwnProperty, ['a', 'b']);
  assert.deepEqual(readRole().toString, { name: 'nested' });
  const removed = api.apply({ ops: [
    { op: 'remove', path: '角色.hasOwnProperty', value: 'a' },
    { op: 'del', path: '角色.toString' },
  ] });
  assert.equal(removed.status, 'success');
  assert.equal(removed.changes[1].newValue, undefined);
  harness.executor.rebuildStateV2();
  assert.deepEqual(readRole().hasOwnProperty, ['b']);
  assert.equal(Object.hasOwn(readRole(), 'toString'), false);
});

test('a prototype-named root has no inherited initial value or rule', () => {
  const initialized = harness.executor.applyStateForMessage(0, block('toString: {"n":100}'));
  assert.deepEqual(initialized.errors, []);
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [{ op: 'inc', path: 'toString.n', delta: -10 }] });
  assert.equal(result.status, 'success');
  assert.equal(result.changes[0].oldValue, 100);
  harness.executor.rebuildStateV2();
  assert.deepEqual(readStoredValue(context(), 'toString'), { n: 90 });
});

test('an inherited member cannot bypass the schema restriction on new fields', () => {
  harness.executor.applyStateForMessage(1, block('$schema 角色\n  金钱: 0'));
  const api = harness.executor.createStateApi();
  const result = api.apply({ ops: [inc(-10), { op: 'set', path: '角色.toString', value: 'hello' }] });
  assert.equal(result.status, 'partial');
  assert.equal(result.errors[0].code, 'rule_rejected');
  assert.equal(result.errors[0].index, 1);
  assert.deepEqual(result.changes.map(change => change.index), [0]);
  assert.equal(readRole().金钱, 90);
  assert.equal(Object.hasOwn(readRole(), 'toString'), false);
});

test('a checkpoint from inherited-property execution cannot bypass corrected request replay', () => {
  while (context().chat.length < 50) context().chat.push({ mes: '', swipe_id: 0 });
  harness.executor.applyStateForMessage(49, block('角色.toString: +"a"'));
  const cache = context().chatMetadata.extensions.LittleWhiteBox.stateCkptV2;
  // v3 treated the inherited function as an existing non-array and cached the failed push.
  cache.v = 3;
  delete cache.points[0].variables.角色.toString;
  const before = structuredClone(context().chat.map(message => message.extra));
  assert.equal(harness.executor.rebuildStateV2().usedCheckpoint, null);
  assert.deepEqual(readRole().toString, ['a']);
  assert.deepEqual(context().chat.map(message => message.extra), before);
  assert.equal(harness.executor.rebuildStateV2().usedCheckpoint, 49);
  assert.deepEqual(readRole().toString, ['a']);
});

test('receipt construction failure publishes neither the batch nor its record', () => {
  const api = harness.executor.createStateApi();
  const before = structuredClone(context().chatMetadata);
  const clone = globalThis.structuredClone;
  // Inject failure at the receipt data boundary, not at a source-code location.
  globalThis.structuredClone = value => {
    const changes = Array.isArray(value) ? value : value?.changes;
    if (changes?.some(change => change.path === '角色.金钱' && change.op === 'inc')) throw new DOMException('receipt unavailable', 'DataCloneError');
    return clone(value);
  };
  try {
    assert.throws(() => api.apply({ ops: [inc(-10)] }), { name: 'DataCloneError' });
  } finally {
    globalThis.structuredClone = clone;
  }
  assert.deepEqual(context().chatMetadata, before);
  assert.equal(context().chat[1].extra, undefined);
  assert.equal(readRole().金钱, 100);
});

test('the preserved applyText response does not acquire JSON warnings or result fields', () => {
  const api = harness.executor.createStateApi();
  const result = api.applyText(block('角色.金钱: -20'), { silent: true });
  assert.deepEqual(Object.keys(result).sort(), ['atoms', 'errors', 'skipped']);
  assert.equal(readRole().金钱, 80);
});
