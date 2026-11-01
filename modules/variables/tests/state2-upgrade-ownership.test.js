import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { executeStateOperations } from '../state2/executor.js';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Frozen output of the actual upstream/main 08a52c34 executor, not a current-model fixture.
const fixture = JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1-ownership.json', import.meta.url), 'utf8'));
const KEY = 'LittleWhiteBox_state2';
let harness;
const ctx = () => harness.env.state.ctx;
const entries = floor => ctx().chat[floor].extra[KEY].entries;
const load = scenario => {
    harness.reset();
    ctx().chat = structuredClone(scenario.chat);
    ctx().chatMetadata = structuredClone(scenario.metadata);
};

test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => load(fixture.failedOnly));
test.after(() => harness.cleanup());

test('migration retains explicit empty production ownership and every failed request without executing it', () => {
    const before = structuredClone(ctx().chatMetadata.variables);
    const old = ctx().chatMetadata.extensions.LittleWhiteBox.stateLogV2.floors['0'];
    harness.executor.openStateChat();
    assert.deepEqual(ctx().chatMetadata.variables, before);
    assert.deepEqual(entries(0)[0].roots, []);
    assert.deepEqual(entries(0)[0].ops, old.ops.map(op => ({ ...op, source: 'text' })));
    harness.executor.rebuildStateV2();
    assert.equal(readStoredValue(ctx(), 'X'), 'keep');
    assert.equal(readStoredValue(ctx(), 'independent'), 'safe');
});

test('replaying a formerly failed request cannot authorize JSON or seize the native root', () => {
    harness.executor.openStateChat();
    harness.executor.rebuildStateV2();
    const api = harness.executor.createStateApi();
    const result = api.apply({ ops: [{ op: 'set', path: 'X', value: 'takeover' }] });
    assert.equal(result.status, 'failed');
    assert.equal(result.errors[0].code, 'unmanaged_root');
    assert.deepEqual(result.changes, []);
    harness.executor.rebuildStateV2();
    assert.equal(readStoredValue(ctx(), 'X'), 'keep');
    assert.deepEqual(entries(0).map(entry => entry.roots), [[], []]);
});

test('a later production claim preserves all earlier replay effects in its whole-log scope', () => {
    load(fixture.laterOwned);
    harness.executor.openStateChat();
    assert.deepEqual(entries(0)[0].roots, []);
    assert.deepEqual(entries(1)[0].roots, ['X']);
    // This is the official cold-replay result. A native warm checkpoint is not a request baseline.
    harness.executor.rebuildStateV2();
    assert.deepEqual(readStoredValue(ctx(), 'X'), ['bad', 'later']);
    assert.equal(readStoredValue(ctx(), 'independent'), 'safe');
});

for (const roots of [undefined, 'not-an-array']) {
    test(`production ${roots === undefined ? 'missing' : 'non-array'} roots uses its deployed request-derived fallback`, () => {
        const old = ctx().chatMetadata.extensions.LittleWhiteBox.stateLogV2.floors['0'];
        if (roots === undefined) delete old.roots;
        else old.roots = roots;
        harness.executor.openStateChat();
        assert.deepEqual(entries(0)[0].roots, ['X']);
        harness.executor.rebuildStateV2();
        assert.deepEqual(readStoredValue(ctx(), 'X'), ['bad']);
    });
}

test('complete request checkpoints keep unclaimed replay values for a later legitimate claim', () => {
    harness.executor.openStateChat();
    while (ctx().chat.length < 50) ctx().chat.push({ mes: '', swipe_id: 0 });
    harness.executor.rebuildStateV2();
    const checkpoint = ctx().chatMetadata.extensions.LittleWhiteBox.stateCkptV2.points[0];
    assert.deepEqual(checkpoint.variables.X, ['bad']);
    assert.equal(readStoredValue(ctx(), 'X'), 'keep');
    ctx().chat.push({ mes: '', swipe_id: 0 });
    harness.executor.applyStateForMessage(50, '<state>X[1]: "later"</state>');
    const result = harness.executor.rebuildStateV2();
    assert.equal(result.usedCheckpoint, 49);
    assert.deepEqual(readStoredValue(ctx(), 'X'), ['bad', 'later']);
});

test('declared claims, not successful replay, govern same-entry JSON admission', () => {
    const meta = { variables: {}, LWB_RULES_V2: {} };
    const result = executeStateOperations(meta, [], [
        { op: 'push', path: 'X', value: 'bad', source: 'text' },
        { op: 'set', path: 'X', value: 'takeover', source: 'json' },
    ], { memory: true, ownedRoots: new Set(), claimRoots: new Set() });
    assert.equal(result.errors[0].code, 'unmanaged_root');
    assert.deepEqual(meta.variables.X, ['bad']);
});

test('new rule/text entries declare their intake claims while JSON entries claim no roots', () => {
    harness.reset();
    ctx().chat = [{ mes: '', swipe_id: 0 }];
    const api = harness.executor.createStateApi();
    api.applyText('<state>\n$schema Data\n  n: 0\nData.n: 5\n</state>', { silent: true });
    assert.equal(api.apply({ ops: [{ op: 'inc', path: 'Data.n', delta: 2 }] }).status, 'success');
    assert.deepEqual(entries(0).map(entry => entry.roots), [['Data'], []]);
    harness.executor.rebuildStateV2();
    assert.deepEqual(readStoredValue(ctx(), 'Data'), { n: 7 });
});
