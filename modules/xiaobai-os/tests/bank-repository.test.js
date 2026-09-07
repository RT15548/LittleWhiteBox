import assert from 'node:assert/strict';
import test from 'node:test';

import { createBankService } from '../apps/bank/application/service.js';
import { BANK_PARTITION } from '../apps/bank/partition.js';
import {
    createEconomyCapabilityRegistrations,
    ECONOMY_PARTITION,
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
} from '../capabilities/economy/index.js';
import { ensureEconomy, postAction, projectBalances } from '../domains/economy/ledger.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';

const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId: 'bank-chat' };
const foreignPartition = {
    key: 'foreign',
    ownerId: 'foreign',
    schemaVersion: 1,
    parse: () => ({ ok: false, error: { code: 'partition_invalid', message: 'must remain opaque' } }),
    serialize: value => value,
    createInitial: () => ({ schemaVersion: 1 }),
};

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
    const foreign = { malformed: true, nested: ['preserve', 1] };
    const state = {
        capture: {
            identityKey: 'character:avatar.png:bank-chat',
            binding,
            reference: { formatVersion: 1, osId: 'bank_os' },
        },
        persisted: {
            formatVersion: 1,
            osId: 'bank_os',
            binding,
            revision: 0,
            commitId: 'bank_commit_0',
            partitions: {
                economy: initialEconomy(grant),
                foreign: structuredClone(foreign),
            },
        },
        reads: 0,
        replaces: [],
        replaceImpl: null,
        generationActive: false,
        assistantTurns: 0,
        persist(candidate) {
            state.persisted = structuredClone(candidate);
        },
    };
    const storage = {
        async read(osId) {
            state.reads += 1;
            assert.equal(osId, state.persisted.osId);
            return structuredClone(state.persisted);
        },
        async replace(input) {
            state.replaces.push(structuredClone(input));
            if (state.replaceImpl) { return await state.replaceImpl(input); }
            state.persist(input.candidate);
            return { status: 'confirmed' };
        },
        async delete() { return 'deleted'; },
    };
    const chatReferences = {
        capture: () => structuredClone(state.capture),
        isCurrent: captured => captured.identityKey === state.capture.identityKey,
        async install(_captured, reference) {
            state.capture.reference = structuredClone(reference);
            return { status: 'confirmed' };
        },
    };
    const partitions = new XiaobaiOsPartitionRegistry();
    partitions.register(ECONOMY_PARTITION);
    partitions.register(BANK_PARTITION);
    partitions.register(foreignPartition);
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    let kernelId = 0;
    const coordinator = createTransactionCoordinator({
        storage,
        partitions,
        chatReferences,
        capabilityBinder: capabilities,
        createId: () => `kernel-${++kernelId}`,
    });
    await capabilities.install({
        createStore: (registration, allowedCapabilities) => (
            coordinator.createScopedStore(registration, { allowedCapabilities })
        ),
        files: coordinator,
    });
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    const store = coordinator.createScopedStore(BANK_PARTITION, {
        allowedCapabilities: [ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY],
    });
    let eventId = 0;
    let positionId = 0;
    let activityId = 0;
    let randomCalls = 0;
    const randomQueue = [...randomValues];
    let clock = 1_000;
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
        getCurrentAssistantTurn: () => state.assistantTurns,
        isMainGenerationActive: () => state.generationActive,
    });
    await bank.refreshCurrent();
    state.replaces.length = 0;

    return {
        bank,
        coordinator,
        economy,
        foreign,
        state,
        calls: () => ({ eventId, positionId, activityId, random: randomCalls }),
        addAssistant(count) { state.assistantTurns += count; },
        setAssistantTurns(count) { state.assistantTurns = count; },
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

test('one scoped action replaces Bank and Economy once without parsing another partition', async () => {
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

test('Bank partition rejects non-canonical data', () => {
    const invalid = BANK_PARTITION.parse({ schemaVersion: 1, events: [], extra: true });
    assert.equal(invalid.ok, false);
    assert.match(invalid.error.message, /bank_invalid_domain/);
});

test('corrupt Bank data is isolated from Economy reads', async () => {
    const harness = await createHarness();
    harness.state.persisted.partitions.bank = 'corrupt-bank-data';
    await harness.coordinator.refresh();

    await harness.economy.refresh();
    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(harness.economy.isOpen(), true);
    await assert.rejects(
        harness.bank.refreshCurrent(),
        error => error.code === 'partition_invalid' && error.partitionKey === 'bank',
    );
    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(harness.coordinator.getFileState(), 'ready');
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
    harness.addAssistant(10);
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
    dueFunding.addAssistant(10);
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
    harness.addAssistant(10);
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
    harness.addAssistant(1);

    const replay = await harness.bank.openFund({
        ...input,
        expectedRevision: -1,
        expectedEventId: ' stale ',
    });

    assert.equal(replay.revision, 1);
    assert.equal(replay.investments[0].claimable, false);
    assert.deepEqual(harness.calls(), callsAfterFirst);
    assert.equal(harness.state.replaces.length, 1);
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
    harness.addAssistant(30);

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
    failed.state.replaceImpl = async () => ({
        status: 'failed',
        error: { code: 'SAVE_UNAVAILABLE', message: 'save unavailable', retryable: true },
    });

    await assert.rejects(
        failed.bank.openFund(command(failed.bank.readCurrent(), 'failed-fund', {
            productId: 'steady-fund', amount: 200,
        })),
        error => error.code === 'SAVE_UNAVAILABLE',
    );
    assert.deepEqual(failed.state.persisted, before);
    assert.equal(failed.bank.readCurrent().revision, 0);
    assert.equal(failed.bank.readCurrent().balance, 200);
    assert.equal(failed.bank.getWriteState(), 'ready');
    assert.equal(failed.calls().random, 1);

    const pending = await createHarness([2_500], 100);
    let frozenCandidate;
    pending.state.replaceImpl = async input => {
        frozenCandidate = structuredClone(input.candidate);
        return { status: 'unconfirmed', observed: structuredClone(pending.state.persisted) };
    };
    const input = command(pending.bank.readCurrent(), 'pending-fund', {
        productId: 'steady-fund', amount: 200,
    });
    await assert.rejects(pending.bank.openFund(input), error => error.code === 'SAVE_UNCONFIRMED');
    assert.equal(pending.bank.readCurrent().revision, 0);
    assert.equal(pending.bank.readCurrent().balance, 200);
    assert.equal(pending.bank.getWriteState(), 'unconfirmed');
    assert.equal(pending.calls().random, 1);
    await assert.rejects(pending.bank.openFund(input), error => error.code === 'storage_unconfirmed');
    assert.equal(pending.calls().random, 1);
    assert.equal(pending.state.replaces.length, 1);

    pending.state.replaceImpl = async input => {
        assert.deepEqual(input.candidate, frozenCandidate);
        pending.state.persist(input.candidate);
        return { status: 'confirmed' };
    };
    assert.deepEqual(await pending.bank.confirmPending(), { status: 'confirmed' });
    assert.equal(pending.bank.getWriteState(), 'ready');
    assert.equal(pending.bank.readCurrent().revision, 1);
    assert.equal(pending.bank.readCurrent().balance, 0);
    assert.equal(pending.calls().random, 1);
    assert.equal(pending.state.replaces.length, 2);
});

test('generation guard, turn regression, and caller-bound consistency preserve committed money', async () => {
    const harness = await createHarness();
    const initial = harness.bank.readCurrent();
    const input = command(initial, 'committed-before-generation', {
        productId: 'short-term', amount: 100,
    });
    const opened = await harness.bank.openDeposit(input);
    const callsAfterOpen = harness.calls();
    harness.state.generationActive = true;

    const replay = await harness.bank.openDeposit(input);
    assert.equal(replay.revision, opened.revision);
    assert.deepEqual(harness.calls(), callsAfterOpen);
    await assert.rejects(harness.bank.openDeposit(command(opened, 'generation-write', {
        productId: 'short-term', amount: 100,
    })), /bank_main_generation_active/);
    assert.deepEqual(harness.calls(), callsAfterOpen);

    harness.state.generationActive = false;
    harness.addAssistant(10);
    await harness.bank.settleDue(command(opened, 'settle-after-generation'));
    const committed = structuredClone(harness.state.persisted);
    const committedView = harness.bank.readCurrent();
    harness.setAssistantTurns(0);
    const regressed = harness.bank.readCurrent();
    assert.equal(regressed.revision, committedView.revision);
    assert.equal(regressed.balance, committedView.balance);
    assert.equal(regressed.deposits.length, 0);
    assert.deepEqual(harness.state.persisted, committed);

    const bankTransaction = harness.state.persisted.partitions.economy.transactions
        .find(transaction => transaction.sourceDomain === 'bank');
    bankTransaction.sourceId = 'wrong-action-source';
    await harness.coordinator.refresh();
    const replacementsBefore = harness.state.replaces.length;
    await assert.rejects(
        harness.bank.openDeposit(command(regressed, 'detect-corruption', {
            productId: 'short-term', amount: 100,
        })),
        error => error.code === 'bank_economy_inconsistent',
    );
    assert.equal(harness.state.replaces.length, replacementsBefore);
});
