import assert from 'node:assert/strict';
import test from 'node:test';

import { createBankService } from '../apps/bank/application/service.js';
import { createBankMaturityRuntime } from '../apps/bank/host/maturity-runtime.js';
import { BANK_PARTITION } from '../apps/bank/partition.js';
import { ensureEconomy, postAction, projectBalances } from '../domains/economy/ledger.js';
import { USER_DOCUMENT_FILENAME } from '../kernel/user-document.js';
import { userEconomyHarness } from './user-economy-harness.js';

const foreign = { malformed: true, nested: ['preserve', 1] };

function initialEconomy(grant) {
    let id = 0;
    const dependencies = { now: () => ++id, createId: () => `opening-${id}` };
    let ledger = ensureEconomy(undefined, dependencies);
    if (grant > 0) {
        ledger = postAction(ledger, [{
            idempotencyKey: `test:grant:${grant}`,
            actionId: `test:grant:${grant}`,
            fromAccountId: 'system:mint',
            toAccountId: 'player',
            amount: grant,
            kind: 'test_grant',
            title: '测试资金',
            sourceDomain: 'test',
            sourceId: `grant-${grant}`,
        }], dependencies).ledger;
    }
    return ledger;
}

async function createHarness(randomValues = [], grant = 0) {
    const h = await userEconomyHarness({ initialPartitions: async () => ({
        economy: initialEconomy(grant), foreign: structuredClone(foreign),
    }) });
    const { state, transactions: coordinator, economy } = h;
    Object.defineProperties(state, {
        persisted: { get: () => h.document() },
        replaces: { get: () => state.writes },
    });
    state.persist = candidate => state.files.set(USER_DOCUMENT_FILENAME, structuredClone(candidate));
    let eventId = 0;
    let positionId = 0;
    let activityId = 0;
    let randomCalls = 0;
    const randomQueue = [...randomValues];
    let clock = 1_000;
    const store = h.store(BANK_PARTITION);
    const bank = createBankService(store, coordinator, economy, {
        now: () => ++clock,
        createEventId: () => `bank-event-${++eventId}`,
        createPositionId: () => `bank-position-${++positionId}`,
        createActivityId: () => `bank-activity-${++activityId}`,
        random: {
            nextInt(maxExclusive) {
                randomCalls += 1;
                const value = randomQueue.shift();
                assert.notEqual(value, undefined, 'test random sequence exhausted');
                assert.ok(value >= 0 && value < maxExclusive);
                return value;
            },
        },
    });
    await bank.refreshCurrent();
    state.replaces.length = 0;

    return {
        bank,
        store,
        switchStory: h.switchStory,
        coordinator,
        economy,
        foreign,
        state,
        storage: h.storage,
        calls: () => ({ eventId, positionId, activityId, random: randomCalls }),
        addAssistant(count) { return bank.advanceTurns(count); },
    };
}

function command(view, actionId, intent = {}) {
    return {
        actionId,
        expectedRevision: view.revision,
        expectedEventId: view.eventId,
        ...intent,
    };
}

function ledger(harness) {
    return harness.state.persisted.partitions.economy;
}

function bankTransactions(harness, actionId) {
    return ledger(harness).transactions.filter(transaction => (
        transaction.sourceDomain === 'bank' && transaction.actionId === actionId
    ));
}

test('confirmed deposit and fund maturities notify once without opening the OS or settling funds', async t => {
    const h = await createHarness([0, 2_500], 1_000);
    const notices = [];
    const runtime = createBankMaturityRuntime({ store: h.store, notify: notice => notices.push(notice) });
    t.after(() => runtime.stopBackground());
    await runtime.startBackground();
    await runtime.startBackground();
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'notice-deposit', {
        productId: 'short-term', amount: 100,
    }));
    for (const actionId of ['notice-loss', 'notice-profit']) {
        await h.bank.openFund(command(h.bank.readCurrent(), actionId, {
            productId: 'steady-fund', amount: 200,
        }));
    }
    const balance = h.bank.readCurrent().balance;
    await h.addAssistant(9);
    assert.equal(notices.length, 0);
    await h.addAssistant(1);
    assert.equal(notices.length, 1);
    h.switchStory('b');
    await runtime.handleChatChanged?.();
    await h.bank.refreshCurrent();
    assert.equal(notices.length, 1);
    await h.addAssistant(10);
    assert.equal(notices.length, 3);
    const view = h.bank.readCurrent();
    assert.equal(view.deposits[0].claimable, true);
    assert.ok(view.investments.every(position => position.claimable));
    assert.ok(view.investments[0].settlementAmount < view.investments[0].principal);
    assert.ok(view.investments[1].settlementAmount > view.investments[1].principal);
    assert.equal(view.balance, balance);
    await h.bank.refreshCurrent();
    await h.bank.settleDue(command(view, 'claim-notified-positions'));
    assert.equal(notices.length, 3);
    assert.equal(h.bank.readCurrent().deposits.length, 0);
    assert.equal(h.bank.readCurrent().investments.length, 0);
});

test('loading or restarting with existing maturities stays silent, but subsequent maturities notify', async t => {
    const h = await createHarness([0], 1_000);
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'old-deposit', {
        productId: 'short-term', amount: 100,
    }));
    await h.bank.openFund(command(h.bank.readCurrent(), 'old-fund', {
        productId: 'steady-fund', amount: 200,
    }));
    await h.addAssistant(10);
    // Start before the persisted user document has been read, as on a fresh page.
    const reopened = await userEconomyHarness({ files: h.state.files });
    const store = reopened.store(BANK_PARTITION);
    const notices = [];
    const runtime = createBankMaturityRuntime({ store, notify: notice => notices.push(notice) });
    t.after(() => runtime.stopBackground());
    await runtime.startBackground();
    await store.read();
    assert.equal(notices.length, 0);
    await runtime.stopBackground();
    await h.addAssistant(10);
    await store.read();
    assert.equal(notices.length, 0);
    await runtime.startBackground();
    await store.read();
    assert.equal(notices.length, 0);
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'new-deposit', {
        productId: 'short-term', amount: 100,
    }));
    await store.read();
    await h.addAssistant(10);
    await store.read();
    await store.read();
    assert.equal(notices.length, 1);
});

test('failed or uncertain maturity saves stay silent until confirmed recovery', async t => {
    for (const mode of ['rejected', 'unknown']) {
        await t.test(mode, async t => {
            const h = await createHarness();
            const notices = [];
            const runtime = createBankMaturityRuntime({ store: h.store, notify: notice => notices.push(notice) });
            t.after(() => runtime.stopBackground());
            await runtime.startBackground();
            await h.bank.openDeposit(command(h.bank.readCurrent(), 'recover-maturity', {
                productId: 'short-term', amount: 100,
            }));
            h.state.mode = mode;
            await assert.rejects(h.addAssistant(10));
            assert.equal(notices.length, 0);
            assert.equal(h.bank.readCurrent().deposits[0].claimable, false);
            h.state.mode = 'confirmed';
            if (mode === 'unknown') {
                h.state.persist(h.state.writes.at(-1));
                assert.equal((await h.coordinator.retryPending({ readOnly: true })).status, 'confirmed');
            }
            await h.bank.confirmPending();
            assert.equal(notices.length, 1);
            assert.equal(h.bank.readCurrent().deposits[0].claimable, true);
            await h.bank.refreshCurrent();
            assert.equal(notices.length, 1);
        });
    }
});

test('a failed maturity notification neither interrupts other notices nor changes bank state', async t => {
    const h = await createHarness([], 100);
    let attempts = 0;
    t.mock.method(console, 'warn', () => {});
    const runtime = createBankMaturityRuntime({ store: h.store, notify: () => {
        attempts++;
        throw new Error('toast unavailable');
    } });
    t.after(() => runtime.stopBackground());
    await runtime.startBackground();
    for (const actionId of ['first-notice', 'second-notice']) {
        await h.bank.openDeposit(command(h.bank.readCurrent(), actionId, {
            productId: 'short-term', amount: 100,
        }));
    }
    await h.addAssistant(10);
    assert.equal(attempts, 2);
    assert.ok(h.bank.readCurrent().deposits.every(position => position.claimable));
    assert.equal(h.bank.readCurrent().balance, 0);
    await h.bank.refreshCurrent();
    assert.equal(attempts, 2);
    await h.bank.settleDue(command(h.bank.readCurrent(), 'claim-after-notice-failure'));
    assert.equal(h.bank.readCurrent().balance, 212);
});

test('one global action replaces Bank and Economy once without parsing another partition', async () => {
    const harness = await createHarness();
    const empty = harness.bank.readCurrent();
    assert.equal(empty.balance, 100);
    assert.equal(empty.revision, 0);
    assert.equal(harness.state.persisted.partitions.bank, undefined);

    const opened = await harness.bank.openDeposit(command(empty, 'open-deposit', {
        productId: 'short-term',
        amount: 100,
    }));

    assert.equal(harness.state.replaces.length, 1);
    assert.equal(opened.balance, 0);
    assert.equal(opened.lockedAmount, 100);
    assert.equal(opened.deposits[0].id, 'bank-position-1');
    assert.equal(harness.state.persisted.partitions.bank.events.length, 1);
    assert.equal(bankTransactions(harness, 'open-deposit').length, 1);
    assert.deepEqual(harness.state.persisted.partitions.foreign, harness.foreign);
    assert.deepEqual(bankTransactions(harness, 'open-deposit').map(transaction => ({
        from: transaction.fromAccountId,
        to: transaction.toAccountId,
        amount: transaction.amount,
        sourceDomain: transaction.sourceDomain,
    })), [{
        from: 'player',
        to: 'escrow:bank:bank-position-1',
        amount: 100,
        sourceDomain: 'bank',
    }]);
});

test('a rejected retry clears only its own uncertain turn batch and network recovery saves it once', async () => {
    const h = await createHarness();
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'turn-recovery-deposit', {
        productId: 'short-term', amount: 100,
    }));
    h.state.mode = 'unknown';
    await assert.rejects(h.addAssistant(1), error => error.uncertain === true);
    assert.equal(h.bank.readCurrent().unsavedTurns, 1);
    h.state.mode = 'rejected';
    assert.equal((await h.bank.confirmPending()).status, 'failed');
    assert.equal(h.bank.readCurrent().unsavedTurns, 1);
    h.state.mode = 'confirmed';
    assert.equal((await h.bank.confirmPending()).status, 'none');
    assert.equal(h.bank.readCurrent().currentTurn, 1);
    assert.equal(h.bank.readCurrent().unsavedTurns, 0);
    assert.equal(h.state.persisted.partitions.bank.currentTurn, 1);
});

test('wallet-side readback confirms the bank turn batch without replaying it', async () => {
    const h = await createHarness();
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'shared-confirm-deposit', {
        productId: 'short-term', amount: 100,
    }));
    h.state.mode = 'unknown';
    await assert.rejects(h.addAssistant(1), error => error.uncertain === true);
    h.state.persist(h.state.writes.at(-1));
    assert.equal((await h.coordinator.retryPending({ readOnly: true })).status, 'confirmed');
    assert.equal(h.bank.readCurrent().unsavedTurns, 0);
    assert.equal((await h.bank.confirmPending()).status, 'none');
    assert.equal(h.bank.readCurrent().currentTurn, 1);
});

test('a failed readback after an unknown write keeps its candidate and never replays turns', async () => {
    const h = await createHarness();
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'read-failure-deposit', {
        productId: 'short-term', amount: 100,
    }));
    h.state.mode = 'unknown';
    await assert.rejects(h.addAssistant(1), error => error.uncertain === true);
    const candidate = h.state.writes.at(-1);
    const previousRead = h.storage.read;
    h.storage.read = async () => {throw new Error('read unavailable');};
    assert.equal((await h.bank.confirmPending()).status, 'unconfirmed');
    assert.equal(h.coordinator.hasPendingCommit('bank'), true);
    assert.equal(h.bank.readCurrent().unsavedTurns, 1);
    h.storage.read = previousRead;
    h.state.persist(candidate);
    assert.equal((await h.coordinator.retryPending({ readOnly: true })).status, 'confirmed');
    assert.equal(h.bank.readCurrent().unsavedTurns, 0);
    assert.equal(h.state.persisted.partitions.bank.currentTurn, 1);
});

test('adopting a different server file never treats an unknown bank batch as rejected', async () => {
    const h = await createHarness();
    await h.bank.openDeposit(command(h.bank.readCurrent(), 'adopt-deposit', {
        productId: 'short-term', amount: 100,
    }));
    h.state.mode = 'unknown';
    await assert.rejects(h.addAssistant(1), error => error.uncertain === true);
    assert.equal((await h.coordinator.adoptServerState()).status, 'adopted');
    assert.equal(h.bank.readCurrent().unsavedTurns, 1);
    assert.equal(h.bank.readCurrent().turnConfirmationAbandoned, true);
    assert.equal((await h.bank.confirmPending()).status, 'conflict');
    assert.equal(h.state.persisted.partitions.bank.currentTurn, 0);
});

test('Bank partition rejects non-canonical data', () => {
    const invalid = BANK_PARTITION.parse({ schemaVersion: 2, currentTurn: 0, events: [], history: [], extra: true });
    assert.equal(invalid.ok, false);
    assert.match(invalid.error.message, /bank_invalid_domain/);
});

test('corrupt Bank data is isolated from Economy reads', async () => {
    const harness = await createHarness();
    harness.state.persisted.partitions.bank = 'corrupt-bank-data';
    const reopened = await userEconomyHarness({ files: harness.state.files });
    await reopened.economy.refresh();
    assert.equal(reopened.economy.getPlayerBalance(), 100);
    assert.equal(reopened.economy.isOpen(), true);
    await assert.rejects(reopened.store(BANK_PARTITION).read(),
        error => error.code === 'partition_invalid' && error.partitionKey === 'bank');
    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(reopened.transactions.getFileState(), 'ready');
});

test('early withdrawal settles every other due position and funds a new action from due payouts', async () => {
    const harness = await createHarness([], 1_000);
    let view = harness.bank.readCurrent();
    view = await harness.bank.openDeposit(command(view, 'open-short', {
        productId: 'short-term', amount: 100,
    }));
    view = await harness.bank.openDeposit(command(view, 'open-mid', {
        productId: 'mid-term', amount: 200,
    }));
    await harness.addAssistant(10);
    const replacesBefore = harness.state.replaces.length;

    const withdrawn = await harness.bank.withdrawDeposit(command(view, 'withdraw-mid', {
        positionId: 'bank-position-2',
    }));

    assert.equal(harness.state.replaces.length, replacesBefore + 1);
    assert.equal(withdrawn.deposits.length, 0);
    assert.equal(withdrawn.balance, 1_096);
    const event = harness.state.persisted.partitions.bank.events.at(-1);
    assert.deepEqual(event.command, {
        kind: 'deposit-withdraw-early',
        positionId: 'bank-position-2',
        settledPositionIds: ['bank-position-1'],
    });
    assert.deepEqual(event.result.activities.map(activity => ({
        sourceId: activity.sourceId,
        payout: activity.payout,
        outcome: activity.detail.outcome,
    })), [
        { sourceId: 'bank-position-1', payout: 106, outcome: 'matured' },
        { sourceId: 'bank-position-2', payout: 190, outcome: 'withdrawn-early' },
    ]);
    const balances = projectBalances(ledger(harness));
    assert.equal(balances['escrow:bank:bank-position-1'], 0);
    assert.equal(balances['escrow:bank:bank-position-2'], 0);
    assert.equal(balances['system:sink'], 10);

    const dueFunding = await createHarness();
    const opened = await dueFunding.bank.openDeposit(command(dueFunding.bank.readCurrent(), 'due-source', {
        productId: 'short-term', amount: 100,
    }));
    await dueFunding.addAssistant(10);
    const reopened = await dueFunding.bank.openDeposit(command(opened, 'funded-by-due', {
        productId: 'short-term', amount: 100,
    }));
    assert.equal(reopened.balance, 6);
    assert.equal(reopened.deposits.length, 1);
});

test('a due early-withdraw target fails before IDs, replacement, or settlement', async () => {
    const harness = await createHarness();
    const opened = await harness.bank.openDeposit(command(harness.bank.readCurrent(), 'open-due', {
        productId: 'short-term', amount: 100,
    }));
    await harness.addAssistant(10);
    const before = structuredClone(harness.state.persisted);
    const callsBefore = harness.calls();
    const replacesBefore = harness.state.replaces.length;

    await assert.rejects(
        harness.bank.withdrawDeposit(command(opened, 'late-early-withdraw', {
            positionId: 'bank-position-1',
        })),
        error => error.code === 'bank_position_state_changed',
    );

    assert.deepEqual(harness.state.persisted, before);
    assert.deepEqual(harness.calls(), callsBefore);
    assert.equal(harness.state.replaces.length, replacesBefore);
    assert.equal(harness.bank.readCurrent().deposits[0].claimable, true);
});

test('fund replay ignores stale CAS and never regenerates IDs or resamples return', async () => {
    const harness = await createHarness([2_500], 200);
    const input = command(harness.bank.readCurrent(), 'stable-fund', {
        productId: 'steady-fund', amount: 200,
    });
    const first = await harness.bank.openFund(input);
    const callsAfterFirst = harness.calls();
    await harness.addAssistant(1);

    const replay = await harness.bank.openFund({
        ...input,
        expectedRevision: -1,
        expectedEventId: ' stale ',
    });

    assert.equal(replay.revision, 1);
    assert.equal(replay.investments[0].claimable, false);
    assert.deepEqual(harness.calls(), callsAfterFirst);
    assert.equal(harness.state.replaces.length, 2);
    assert.equal(harness.state.persisted.partitions.bank.events[0].result.changes[0].position.resolvedReturnBps, 2_000);
    await assert.rejects(
        harness.bank.openFund({ ...input, amount: 201 }),
        error => error.code === 'bank_action_conflict',
    );
    assert.deepEqual(harness.calls(), callsAfterFirst);
    assert.equal(first.eventId, replay.eventId);
});

test('settleDue posts exact profit and loss legs and closes both escrows', async () => {
    const harness = await createHarness([2_500, 0], 2_000);
    let view = await harness.bank.openFund(command(harness.bank.readCurrent(), 'open-profit', {
        productId: 'steady-fund', amount: 200,
    }));
    view = await harness.bank.openFund(command(view, 'open-loss', {
        productId: 'growth-fund', amount: 500,
    }));
    await harness.addAssistant(30);

    const settled = await harness.bank.settleDue(command(view, 'settle-funds'));

    assert.equal(settled.investments.length, 0);
    assert.equal(settled.balance, 2_040);
    assert.deepEqual(bankTransactions(harness, 'settle-funds').map(transaction => ({
        from: transaction.fromAccountId,
        to: transaction.toAccountId,
        amount: transaction.amount,
        kind: transaction.kind,
        sourceId: transaction.sourceId,
    })), [
        {
            from: 'counterparty:bank:reserve', to: 'escrow:bank:bank-position-1', amount: 40,
            kind: 'bank_position_profit', sourceId: 'settle-funds',
        },
        {
            from: 'escrow:bank:bank-position-1', to: 'player', amount: 240,
            kind: 'bank_position_payout', sourceId: 'settle-funds',
        },
        {
            from: 'escrow:bank:bank-position-2', to: 'player', amount: 400,
            kind: 'bank_position_payout', sourceId: 'settle-funds',
        },
        {
            from: 'escrow:bank:bank-position-2', to: 'system:sink', amount: 100,
            kind: 'bank_position_loss', sourceId: 'settle-funds',
        },
    ]);
    const balances = projectBalances(ledger(harness));
    assert.equal(balances['escrow:bank:bank-position-1'], 0);
    assert.equal(balances['escrow:bank:bank-position-2'], 0);
    assert.equal(bankTransactions(harness, 'settle-funds').some(transaction => transaction.amount === 0), false);
});

test('insufficient funds, stale CAS, and action conflicts do not sample or replace', async () => {
    const harness = await createHarness([0]);
    const empty = harness.bank.readCurrent();

    await assert.rejects(
        harness.bank.openFund(command(empty, 'insufficient-fund', {
            productId: 'steady-fund', amount: 200,
        })),
        error => error.code === 'economy_insufficient_funds',
    );
    assert.deepEqual(harness.calls(), { eventId: 0, positionId: 0, activityId: 0, random: 0 });
    assert.equal(harness.state.replaces.length, 0);

    const opened = await harness.bank.openDeposit(command(empty, 'first-action', {
        productId: 'short-term', amount: 100,
    }));
    const before = structuredClone(harness.state.persisted);
    await assert.rejects(
        harness.bank.openFund(command(empty, 'stale-fund', {
            productId: 'steady-fund', amount: 200,
        })),
        error => error.code === 'bank_revision_conflict',
    );
    await assert.rejects(
        harness.bank.openDeposit(command(opened, 'first-action', {
            productId: 'short-term', amount: 101,
        })),
        error => error.code === 'bank_action_conflict',
    );
    assert.deepEqual(harness.state.persisted, before);
    assert.equal(harness.calls().random, 0);
    assert.equal(harness.state.replaces.length, 1);
});

test('failed and unconfirmed writes do not publish prepared state; retry reuses the frozen candidate', async () => {
    const failed = await createHarness([0], 100);
    const before = structuredClone(failed.state.persisted);
    failed.state.mode = 'rejected';

    await assert.rejects(
        failed.bank.openFund(command(failed.bank.readCurrent(), 'failed-fund', {
            productId: 'steady-fund', amount: 200,
        })),
        error => error.code === 'storage_write_failed',
    );
    assert.deepEqual(failed.state.persisted, before);
    assert.equal(failed.bank.readCurrent().revision, 0);
    assert.equal(failed.bank.readCurrent().balance, 200);
    assert.equal(failed.bank.getWriteState(), 'ready');
    assert.equal(failed.calls().random, 1);

    const pending = await createHarness([2_500], 100);
    let frozenCandidate;
    pending.state.mode = 'unknown';
    const input = command(pending.bank.readCurrent(), 'pending-fund', {
        productId: 'steady-fund', amount: 200,
    });
    await assert.rejects(pending.bank.openFund(input), error => error.code === 'SAVE_UNCONFIRMED');
    frozenCandidate = structuredClone(pending.state.replaces.at(-1));
    assert.equal(pending.bank.readCurrent().revision, 0);
    assert.equal(pending.bank.readCurrent().balance, 200);
    assert.equal(pending.bank.getWriteState(), 'unconfirmed');
    assert.equal(pending.calls().random, 1);
    await assert.rejects(pending.bank.openFund(input), error => error.code === 'storage_unconfirmed');
    assert.equal(pending.calls().random, 1);
    assert.equal(pending.state.replaces.length, 1);

    pending.state.mode = 'confirmed';
    assert.deepEqual(await pending.bank.confirmPending(), { status: 'confirmed' });
    assert.deepEqual(pending.state.replaces.at(-1), frozenCandidate);
    assert.equal(pending.bank.getWriteState(), 'ready');
    assert.equal(pending.bank.readCurrent().revision, 1);
    assert.equal(pending.bank.readCurrent().balance, 0);
    assert.equal(pending.calls().random, 1);
    assert.equal(pending.state.replaces.length, 2);
});

test('active generation does not block the global bank, while ledger inconsistency blocks writes', async () => {
    const harness = await createHarness();
    const initial = harness.bank.readCurrent();
    const input = command(initial, 'committed-before-generation', {
        productId: 'short-term', amount: 100,
    });
    const opened = await harness.bank.openDeposit(input);
    const callsAfterOpen = harness.calls();
    const replay = await harness.bank.openDeposit(input);
    assert.equal(replay.revision, opened.revision);
    assert.deepEqual(harness.calls(), callsAfterOpen);
    await harness.addAssistant(10);
    await harness.bank.settleDue(command(opened, 'settle-after-generation'));
    const committed = structuredClone(harness.state.persisted);
    const committedView = harness.bank.readCurrent();
    const globalView = harness.bank.readCurrent();
    assert.equal(globalView.revision, committedView.revision);
    assert.equal(globalView.balance, committedView.balance);
    assert.equal(globalView.deposits.length, 0);
    assert.deepEqual(harness.state.persisted, committed);

    const bankTransaction = harness.state.persisted.partitions.economy.transactions
        .find(transaction => transaction.sourceDomain === 'bank');
    bankTransaction.sourceId = 'wrong-action-source';
    const reopened = await userEconomyHarness({ files: harness.state.files });
    await reopened.economy.refresh();
    const bank = createBankService(reopened.store(BANK_PARTITION), reopened.transactions, reopened.economy);
    await bank.refreshCurrent();
    const replacementsBefore = harness.state.replaces.length;
    await assert.rejects(
        bank.openDeposit(command(globalView, 'detect-corruption', {
            productId: 'short-term', amount: 100,
        })),
        error => error.code === 'bank_economy_inconsistent',
    );
    assert.equal(harness.state.replaces.length, replacementsBefore);
});
