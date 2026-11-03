import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { userEconomyHarness } from './user-economy-harness.js';
import { DICE_PARTITION } from '../apps/dice/partition.ts';
import { BANK_PARTITION } from '../apps/bank/partition.ts';
import { ECONOMY_TRANSACTION_CAPABILITY } from '../capabilities/economy/index.js';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { createDiceRerollService } from '../apps/dice/application/reroll-service.ts';
import { createDiceResults } from '../apps/dice/application/results.ts';
import { DICE_REROLL_COST, rerollCheck, replaceCheck } from '../apps/dice/domain/reroll.ts';
import { checkBasis, createResultOverride } from '../apps/dice/domain/result-override.ts';
import { rollCoc7AgainstThreshold } from '../apps/dice/domain/coc7.ts';
import { convertDicePartitionV1, upgradeDiceUserFile } from '../apps/dice/upgrade/partition-v1.ts';

const call = '<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>';
function candidate() {
    const { body, records } = prepareActionCheck({ body: call, generatedFrom: 0, id: 'check', random: () => .3 });
    return { body, records, source: { key: 'chat-a' }, swipe: 0 };
}
async function fixture(t, sample = .8) {
    const h = await userEconomyHarness();
    await h.economy.refresh();
    const store = h.store(DICE_PARTITION);
    const results = createDiceResults(store);
    const initial = candidate();
    const state = { samples: 0, errors: [], waits: [], valid: true, wait: async () => {} };
    const service = createDiceRerollService(store, h.transactions, h.economy, results, () => state.valid, {
        random: () => { state.samples++; return sample; }, onError: error => state.errors.push(error),
        wait: ms => { state.waits.push(ms); return state.wait(); },
    });
    t.after(() => { service.dispose(); results.dispose(); });
    const target = () => ({ ...initial, records: results.records(initial.records) });
    return { h, state, service, results, initial, target };
}

test('D20 rerolls preserve captured DC, ID, question and critical rules, including production historical DCs', () => {
    for (const dc of [1, 12, 30]) {
        const original = { ...candidate().records.checks[0], dc };
        for (const [sample, outcome] of [[0, 'critical_failure'], [.999, 'critical_success']]) {
            const next = rerollCheck(original, () => sample);
            assert.equal(next.dc, dc);
            assert.equal(next.id, original.id);
            assert.deepEqual(next.request, original.request);
            assert.equal(next.outcome, outcome);
        }
    }
});
test('CoC rerolls keep recorded ability and threshold and share first-roll adjudication', () => {
    const record = { rule: 'coc7', id: 'coc', request: { action: 'Jump', stat: '体魄', difficulty: 'hard' },
        resolution: { kind: 'mapped', input: 'STR' }, result: rollCoc7AgainstThreshold(60, 30, () => .5) };
    for (const faces of [[.1, 0], [0, 0], [.6, .9], [.3, .2]]) {
        let at = 0, replay = 0;
        const next = rerollCheck(record, () => faces[at++]);
        assert.equal(at, 2);
        assert.deepEqual(next.request, record.request);
        assert.deepEqual(next.result, rollCoc7AgainstThreshold(60, 30, () => faces[replay++]));
        assert.equal(checkBasis(next), checkBasis({ ...record, request: { difficulty: 'hard', stat: '体魄', action: 'Jump' },
            resolution: { input: 'STR', kind: 'mapped' } }));
    }
});
test('replacement consumes no new check allowance', () => {
    const first = candidate().records.checks[0];
    const records = { schemaVersion: 3, checks: Array.from({ length: 8 }, (_, i) => ({ ...first, id: `check-${i}` })) };
    const replaced = replaceCheck(records, rerollCheck(records.checks[7], () => .9));
    assert.equal(replaced.checks.length, 8);
    assert.deepEqual(replaced.checks.slice(0, 7), records.checks.slice(0, 7));
});

test('new result is usable immediately; one user-file commit saves result and fee without mutating the initial chat record', async t => {
    const { h, state, service, target, initial } = await fixture(t);
    const before = structuredClone(initial);
    const barrier = Promise.withResolvers();
    const replace = h.storage.replace;
    h.storage.replace = async (...args) => { await barrier.promise; return replace(...args); };
    const operation = service.reroll(target());
    assert.equal(target().records.checks[0].roll, 17);
    assert.equal(h.economy.getPlayerBalance(), 100);
    barrier.resolve(); await operation.saved;
    assert.equal(h.economy.getPlayerBalance(), 100 - DICE_REROLL_COST);
    assert.equal(state.samples, 1);
    assert.deepEqual(initial, before);
    assert.equal(Object.values(h.document().partitions.dice.resultOverrides)[0].result.roll, 17);
    assert.equal(h.document().partitions.economy.transactions.filter(item => item.kind === 'dice_reroll').length, 1);
});
test('identical result is a valid paid operation; duplicate credential is consumed only once', async t => {
    const { h, state, service, target } = await fixture(t, .3);
    const original = target();
    const operation = service.reroll(original);
    assert.deepEqual(operation.target.records, original.records);
    assert.throws(() => service.reroll(original), { code: 'dice_target_changed' });
    await operation.saved;
    assert.equal(state.samples, 1);
    assert.equal(h.economy.getPlayerBalance(), 90);
});
test('known insufficient balance or changed target rejects before sampling', async t => {
    const { h, state, service, target } = await fixture(t);
    state.valid = false;
    assert.throws(() => service.reroll(target()), { code: 'dice_target_changed' });
    state.valid = true;
    for (let i = 0; i < 10; i++) await service.reroll(target()).saved;
    assert.throws(() => service.reroll(target()), { code: 'dice_insufficient_funds' });
    assert.equal(state.samples, 10);
    assert.equal(h.economy.getPlayerBalance(), 0);
});
for (const mode of ['unknown', 'rejected']) {
    test(`${mode}: three short retries keep one result and stable fee identity, then stop without reverting`, async t => {
        const { h, state, service, target } = await fixture(t);
        h.state.mode = mode;
        const before = h.state.writes.length;
        await service.reroll(target()).saved;
        assert.deepEqual(state.waits, [300, 600, 1000]);
        assert.equal(state.samples, 1);
        assert.equal(state.errors.length, 1);
        assert.equal(target().records.checks[0].roll, 17);
        const writes = h.state.writes.slice(before);
        assert.equal(writes.length, 4);
        assert.equal(new Set(writes.map(doc => Object.values(doc.partitions.dice.resultOverrides)[0].version)).size, 1);
        assert.equal(h.economy.getPlayerBalance(), 100);
        h.state.mode = 'confirmed';
        await h.transactions.retryPending();
        assert.equal(h.state.writes.length, before + 4);
        const refreshed = createDiceResults(h.store(DICE_PARTITION));
        assert.equal(refreshed.records(candidate().records).checks[0].roll, 7);
        refreshed.dispose();
    });
}
test('a temporary failure retries the same candidate, confirmation loss is read back, restart restores the latest roll', async t => {
    const { h, state, service, target, initial } = await fixture(t);
    h.state.mode = 'unknown';
    state.wait = async () => { h.state.mode = 'stored-ack-lost'; };
    await service.reroll(target()).saved;
    assert.deepEqual(state.waits, [300]);
    assert.equal(state.errors.length, 0);
    const restarted = await userEconomyHarness({ files: h.state.files });
    await restarted.economy.refresh();
    const results = createDiceResults(restarted.store(DICE_PARTITION));
    assert.equal(results.records(initial.records).checks[0].roll, 17);
    const unrelated = { ...initial.records, checks: initial.records.checks.map(record => ({ ...record, id: 'other-check' })) };
    assert.equal(results.records(unrelated).checks[0].roll, 7);
    assert.equal(restarted.economy.getPlayerBalance(), 90);
    results.dispose();
});
test('two in-flight rolls save serially; older completion does not overwrite the latest memory or another chat', async t => {
    const { h, service, target, state } = await fixture(t);
    const barrier = Promise.withResolvers();
    const replace = h.storage.replace;
    h.storage.replace = async (...args) => { await barrier.promise; return replace(...args); };
    const first = service.reroll(target());
    const second = service.reroll(target());
    assert.notEqual(first.operationId, second.operationId);
    h.switchStory('b'); state.valid = false;
    barrier.resolve(); await Promise.all([first.saved, second.saved]);
    const saved = Object.values(h.document().partitions.dice.resultOverrides);
    assert.equal(saved.length, 1);
    assert.deepEqual(Object.keys(h.document().partitions.dice.resultOverrides), ['check']);
    assert.equal(saved[0].version, second.operationId);
    assert.equal(h.economy.getPlayerBalance(), 80);
});
test('storage unavailability is not absence of overrides', () => {
    const results = createDiceResults({ subscribe: () => () => {}, peekCurrent: () => null });
    assert.throws(() => results.records(candidate().records), { code: 'dice_results_unavailable' });
});

test('native fetch read failures retry without resampling or charging twice', async t => {
    const { h, state, service, target } = await fixture(t);
    const read = h.storage.read;
    let failures = 3;
    h.storage.read = async (...args) => {
        if (failures-- > 0) { throw new TypeError('Failed to fetch'); }
        return read(...args);
    };
    await service.reroll(target()).saved;
    assert.deepEqual(state.waits, [300, 600, 1000]);
    assert.equal(state.samples, 1);
    assert.equal(state.errors.length, 0);
    assert.equal(h.economy.getPlayerBalance(), 90);
});

for (const mode of ['unknown', 'stored-ack-lost']) {
    test(`${mode}: unreadable confirmation releases Dice without blocking the next bank write or chasing its fee`, async t => {
        const { h, state, service, target } = await fixture(t);
        const read = h.storage.read;
        const replace = h.storage.replace;
        h.state.mode = mode;
        h.storage.replace = async (...args) => {
            h.storage.read = async () => { throw new TypeError('Failed to fetch'); };
            return replace(...args);
        };
        const before = h.state.writes.length;
        await service.reroll(target()).saved;
        assert.equal(state.errors.length, 1);
        assert.deepEqual(state.waits, [300, 600, 1000]);
        assert.equal(state.samples, 1);
        assert.equal(h.transactions.hasPendingCommit(), false);
        h.storage.read = read; h.storage.replace = replace; h.state.mode = 'confirmed';
        // No recovery call: an ordinary unrelated write must read the actual server state.
        const saved = await h.store(BANK_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()));
        assert.equal(saved.status, 'confirmed');
        assert.equal(h.state.writes.length, before + 2);
        const charged = mode === 'stored-ack-lost';
        assert.equal(h.economy.getPlayerBalance(), charged ? 90 : 100);
        assert.equal(h.document().partitions.economy.transactions.filter(item => item.kind === 'dice_reroll').length, charged ? 1 : 0);
        assert.equal(target().records.checks[0].roll, 17);
        await service.reroll(target()).saved;
        assert.equal(h.economy.getPlayerBalance(), charged ? 80 : 90);
        assert.equal(state.errors.length, 1);
    });
}

test('disposing Dice waits for its submitted write before another app can save, without leaving a recoverable fee', async t => {
    const { h, service, target } = await fixture(t);
    const started = Promise.withResolvers();
    const finish = Promise.withResolvers();
    const replace = h.storage.replace;
    let first = true;
    h.storage.replace = async (...args) => {
        if (first) {
            first = false; started.resolve(); await finish.promise;
            throw new Error('connection lost');
        }
        return replace(...args);
    };
    const operation = service.reroll(target());
    await started.promise;
    const before = h.state.writes.length;
    service.dispose();
    const next = h.store(BANK_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()));
    assert.equal(h.transactions.getFileState(), 'saving');
    assert.equal(h.state.writes.length, before);
    finish.resolve();
    await operation.saved;
    assert.equal((await next).status, 'confirmed');
    assert.equal(h.state.writes.length, before + 1);
    assert.equal(h.economy.getPlayerBalance(), 100);
    assert.equal(h.transactions.hasPendingCommit(), false);
});

test('a concurrent purchase consuming the balance preserves the delivered reroll free', async t => {
    const { h, state, service, target } = await fixture(t);
    // The click sees sufficient balance; the queued transaction reads the purchase first.
    const purchase = h.store(BANK_PARTITION).transact(tx => {
        const wallet = tx.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
        wallet.postAction({ legs: [{ idempotencyKey: 'purchase', actionId: 'purchase', sourceId: 'purchase',
            fromAccountId: 'player', toAccountId: 'counterparty:bank:test', amount: 100, kind: 'purchase', title: 'Purchase' }] });
    });
    const roll = service.reroll(target());
    await purchase; await roll.saved;
    assert.equal(h.economy.getPlayerBalance(), 0);
    assert.equal(state.errors.length, 0);
    assert.equal(Object.values(h.document().partitions.dice.resultOverrides)[0].result.roll, 17);
    assert.equal(h.document().partitions.economy.transactions.filter(item => item.kind === 'dice_reroll').length, 0);
});
test('foreign pending transaction is not retried or abandoned by Dice', async t => {
    const { h, state, service, target } = await fixture(t);
    h.state.mode = 'unknown';
    await h.store(BANK_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()));
    const before = h.state.writes.length;
    await service.reroll(target()).saved;
    assert.equal(h.state.writes.length, before);
    assert.equal(h.transactions.hasPendingCommit(BANK_PARTITION.key), true);
    assert.equal(state.errors.length, 1);
});
test('explicit cleanup waits for saving and deletes only this chat overrides, preserving sheet and ledger', async t => {
    const { h, service, target, results } = await fixture(t);
    const operation = service.reroll(target());
    await service.clearResults(new Set(['check'])); await operation.saved;
    assert.deepEqual(h.document().partitions.dice, { sheet: null, resultOverrides: {} });
    assert.equal(h.economy.getPlayerBalance(), 90);
    assert.equal(results.records(candidate().records).checks[0].roll, 7);
});

test('result lookup takes one validated snapshot per file change, even with many saved checks', () => {
    const initial = candidate().records;
    const record = initial.checks[0];
    const override = createResultOverride(rerollCheck(record, () => .8), 'version-1');
    const data = { sheet: null, resultOverrides: Object.fromEntries(Array.from({ length: 10000 }, (_, i) => [`saved-${i}`, override])) };
    data.resultOverrides[record.id] = override;
    let reads = 0, publish;
    const results = createDiceResults({
        peekCurrent: () => { reads++; return { value: data }; },
        subscribe: listener => { publish = listener; return () => {}; },
    });
    for (let i = 0; i < 1000; i++) {
        assert.equal(results.records(initial).checks[0].roll, 17);
        results.version(initial);
    }
    assert.equal(reads, 1, 'rendering must not read/copy the entire user partition for each card');
    const latest = createResultOverride(rerollCheck(record, () => .9), 'version-2');
    publish({ value: { ...data, resultOverrides: { ...data.resultOverrides, [record.id]: latest } } });
    assert.equal(results.records(initial).checks[0].roll, 19);
    assert.equal(reads, 1);
    results.dispose();
});

test('a confirmed local roll retires so a later explicit read adopts another window result and credential', async t => {
    const { h, service, target, results } = await fixture(t);
    await service.reroll(target()).saved;
    const version = results.version(candidate().records);
    const other = await userEconomyHarness({ files: h.state.files }); await other.economy.refresh();
    const replacement = createResultOverride(rerollCheck(candidate().records.checks[0], () => .9), 'other-window');
    await other.store(DICE_PARTITION).transact(tx => {
        const data = tx.currentOrInitial();
        tx.replace({ ...data, resultOverrides: { ...data.resultOverrides, check: replacement } });
    });
    await h.store(DICE_PARTITION).read();
    assert.equal(target().records.checks[0].roll, 19);
    assert.notEqual(results.version(candidate().records), version);
});

test('an older confirmation cannot retire a later unsaved or failed result', () => {
    const record = candidate().records.checks[0];
    let publish;
    const results = createDiceResults({ peekCurrent: () => ({ value: DICE_PARTITION.createInitial() }),
        subscribe: listener => { publish = listener; return () => {}; } });
    const earlier = createResultOverride(rerollCheck(record, () => .8), 'earlier');
    const later = createResultOverride(rerollCheck(record, () => .9), 'later');
    results.apply(record.id, earlier);
    results.apply(record.id, later);
    const version = results.version(candidate().records);
    publish({ value: { sheet: null, resultOverrides: { [record.id]: earlier } } });
    assert.equal(results.records(candidate().records).checks[0].roll, 19);
    assert.equal(results.version(candidate().records), version);
    publish({ value: DICE_PARTITION.createInitial() });
    assert.equal(results.records(candidate().records).checks[0].roll, 19);
    publish({ value: { sheet: null, resultOverrides: { [record.id]: later } } });
    publish({ value: DICE_PARTITION.createInitial() });
    assert.equal(results.records(candidate().records).checks[0].roll, 7);
    results.dispose();
});

test('user partition rejects unexpected payloads and cleanup preserves unrelated checks, sheet and wallet', async t => {
    const { h, service, target } = await fixture(t);
    await service.reroll(target()).saved;
    const ownId = target().records.checks[0].id;
    const original = structuredClone(h.document());
    const sheet = { assignments: { body: 60 }, opaque: 'preserve' };
    await h.store(DICE_PARTITION).transact(tx => {
        const data = tx.currentOrInitial();
        tx.replace({ ...data, sheet, resultOverrides: { ...data.resultOverrides, unrelated: data.resultOverrides[ownId] } });
    });
    const invalid = structuredClone(h.document().partitions.dice);
    invalid.resultOverrides[ownId].chatSnapshot = [{ mes: 'must not be stored' }];
    assert.equal(DICE_PARTITION.parse(invalid).ok, false);
    assert.deepEqual(h.document().partitions.economy, original.partitions.economy);
    await service.clearResults(new Set([ownId]));
    assert.deepEqual(h.document().partitions.dice.sheet, sheet);
    assert.deepEqual(Object.keys(h.document().partitions.dice.resultOverrides), ['unrelated']);
    assert.deepEqual(h.document().partitions.economy, original.partitions.economy);
});
test('production partition migration retains opaque sheet data, runs once and leaves economy untouched', async () => {
    const original = JSON.parse(readFileSync(new URL('./fixtures/dice-partition-v1.json', import.meta.url), 'utf8'));
    assert.deepEqual(convertDicePartitionV1(original), { ...original, resultOverrides: {} });
    const h = await userEconomyHarness(); await h.economy.refresh();
    const damaged = { assignments: { unknown: ['keep', 12] }, schemaVersion: 99 };
    h.document().partitions.dice = { sheet: damaged };
    const economy = structuredClone(h.document().partitions.economy);
    await upgradeDiceUserFile(h.transactions);
    assert.deepEqual(h.document().partitions.dice, { sheet: damaged, resultOverrides: {} });
    assert.deepEqual(h.document().partitions.economy, economy);
    const writes = h.state.writes.length;
    await upgradeDiceUserFile(h.transactions);
    assert.equal(h.state.writes.length, writes);
});
