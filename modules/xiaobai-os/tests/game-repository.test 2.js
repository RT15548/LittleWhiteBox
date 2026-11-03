import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createEconomyCapabilityRegistrations,
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
} from '../capabilities/economy/index.js';
import { createGameService } from '../apps/game/application/service.js';
import { GAME_PARTITION } from '../apps/game/partition.js';
import { ensureEconomy, projectBalances } from '../domains/economy/ledger.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';
import { XiaobaiOsPartitionRegistry } from '../kernel/partition-registry.js';
import { createTransactionCoordinator } from '../kernel/transaction-coordinator.js';

const binding = { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' };

function command(view, actionId, extra = {}) {
    return {
        actionId,
        expectedRevision: view.revision,
        expectedEventId: view.eventId,
        ...extra,
    };
}

async function createHarness(randomValues = [], { gamePartition } = {}) {
    const opening = ensureEconomy(undefined, { now: () => 1_000, createId: () => 'opening-grant' });
    const partitions = { economy: opening };
    if (gamePartition !== undefined) { partitions.game = structuredClone(gamePartition); }
    const state = {
        persisted: {
            formatVersion: 1,
            osId: 'os-game',
            binding,
            revision: 0,
            commitId: 'commit-0',
            partitions,
        },
        writes: [],
        replaceImpl: null,
        randomCalls: 0,
        gameIds: 0,
        eventIds: 0,
        activityIds: 0,
        kernelIds: 0,
        generationActive: false,
    };
    const storage = {
        async read(osId) {
            assert.equal(osId, 'os-game');
            return structuredClone(state.persisted);
        },
        async replace(input) {
            state.writes.push(structuredClone(input));
            if (state.replaceImpl) { return await state.replaceImpl(input); }
            state.persisted = structuredClone(input.candidate);
            return { status: 'confirmed' };
        },
        async delete() { return 'deleted'; },
    };
    const chatReferences = {
        capture: () => ({
            identityKey: 'character:avatar.png:chat-a',
            binding,
            reference: { formatVersion: 1, osId: 'os-game' },
        }),
        isCurrent: () => true,
        install: async () => ({ status: 'confirmed' }),
    };
    const capabilities = createCapabilityRegistry(createEconomyCapabilityRegistrations());
    const registry = new XiaobaiOsPartitionRegistry();
    for (const registration of capabilities.partitions()) { registry.register(registration); }
    registry.register(GAME_PARTITION);
    const coordinator = createTransactionCoordinator({
        storage,
        partitions: registry,
        chatReferences,
        capabilityBinder: capabilities,
        createId: () => `kernel-${++state.kernelIds}`,
    });
    await capabilities.install({
        createStore: (registration, allowedCapabilities) =>
            coordinator.createScopedStore(registration, { allowedCapabilities }),
        files: coordinator,
    });
    const economy = capabilities.require(ECONOMY_READ_CAPABILITY);
    const values = [...randomValues];
    const game = createGameService(
        coordinator.createScopedStore(GAME_PARTITION, {
            allowedCapabilities: [ECONOMY_READ_CAPABILITY, ECONOMY_TRANSACTION_CAPABILITY],
        }),
        coordinator,
        economy,
        {
            now: (() => { let clock = 2_000; return () => ++clock; })(),
            random: {
                nextInt(maxExclusive) {
                    state.randomCalls += 1;
                    const value = values.shift();
                    if (!Number.isSafeInteger(value) || value < 0 || value >= maxExclusive) {
                        throw new Error(`test_random_invalid:${String(value)}/${maxExclusive}`);
                    }
                    return value;
                },
            },
            createGameId: kind => `game-${kind}-${++state.gameIds}`,
            createEventId: () => `game-event-${++state.eventIds}`,
            createActivityId: () => `game-activity-${++state.activityIds}`,
            isMainGenerationActive: () => state.generationActive,
        },
    );
    await economy.refresh();
    return { capabilities, coordinator, economy, game, state };
}

async function openGame(harness) {
    await harness.game.refreshCurrent();
    harness.state.writes.length = 0;
}

function gameTransactions(harness) {
    return harness.state.persisted.partitions.economy.transactions
        .filter(transaction => transaction.sourceDomain === 'game');
}

function escrowBalance(harness, gameId) {
    return projectBalances(harness.state.persisted.partitions.economy)[`escrow:game:${gameId}`] || 0;
}

test('read-only Game projection uses Economy without creating a Game partition', async () => {
    const harness = await createHarness();
    await openGame(harness);

    const view = harness.game.readCurrent();

    assert.equal(view.balance, 100);
    assert.equal(view.writeState, 'ready');
    assert.equal(view.revision, 0);
    assert.equal(view.eventId, '');
    assert.equal(view.lockedAmount, 0);
    assert.equal(Object.hasOwn(harness.state.persisted.partitions, 'game'), false);
    assert.equal(harness.state.writes.length, 0);
});

test('all three starts replace Game and Economy together with one upload', async t => {
    const cases = [
        {
            name: 'dice',
            random: Array(10).fill(0),
            expectedRandomCalls: 10,
            bet: 50,
            start: (game, view) => game.startDice(command(view, 'start-dice', { bet: 50 })),
        },
        {
            name: 'push',
            random: Array(9).fill(0),
            expectedRandomCalls: 9,
            bet: 50,
            start: (game, view) => game.startPush(command(view, 'start-push')),
        },
        {
            name: 'ladder',
            random: [],
            expectedRandomCalls: 0,
            bet: 80,
            start: (game, view) => game.startLadder(command(view, 'start-ladder', { bet: 80 })),
        },
    ];

    for (const scenario of cases) {
        await t.test(scenario.name, async () => {
            const harness = await createHarness(scenario.random);
            await openGame(harness);

            const started = await scenario.start(harness.game, harness.game.readCurrent());
            const [write] = harness.state.writes;
            const [stake] = gameTransactions(harness);

            assert.equal(harness.state.writes.length, 1);
            assert.deepEqual(Object.keys(write.candidate.partitions).sort(), ['economy', 'game']);
            assert.equal(write.candidate.partitions.game.events.length, 1);
            assert.equal(write.candidate.partitions.economy.transactions.length, 2);
            assert.equal(started.activeGame.kind, scenario.name);
            assert.equal(started.balance, 100 - scenario.bet);
            assert.equal(started.lockedAmount, scenario.bet);
            assert.equal(stake.fromAccountId, 'player');
            assert.equal(stake.toAccountId, `escrow:game:${started.activeGame.id}`);
            assert.equal(stake.amount, scenario.bet);
            assert.equal(escrowBalance(harness, started.activeGame.id), scenario.bet);
            assert.equal(harness.state.randomCalls, scenario.expectedRandomCalls);
        });
    }
});

test('Dice keeps its 1.8 payout and empties escrow atomically', async () => {
    const harness = await createHarness(Array(10).fill(0));
    await openGame(harness);
    const started = await harness.game.startDice(command(harness.game.readCurrent(), 'dice-start', { bet: 50 }));

    const settled = await harness.game.bidDice(command(started, 'dice-max-bid', {
        gameId: started.activeGame.id,
        bid: { count: 10, face: 6 },
    }));

    assert.equal(settled.balance, 140);
    assert.equal(settled.activeGame, undefined);
    assert.deepEqual(gameTransactions(harness).map(transaction => ({
        from: transaction.fromAccountId,
        to: transaction.toAccountId,
        amount: transaction.amount,
    })), [
        { from: 'player', to: `escrow:game:${started.activeGame.id}`, amount: 50 },
        { from: 'counterparty:game:reserve', to: `escrow:game:${started.activeGame.id}`, amount: 40 },
        { from: `escrow:game:${started.activeGame.id}`, to: 'player', amount: 90 },
    ]);
    assert.equal(escrowBalance(harness, started.activeGame.id), 0);
    assert.deepEqual({
        amountIn: settled.activities[0].amountIn,
        payout: settled.activities[0].payout,
        net: settled.activities[0].net,
    }, { amountIn: 50, payout: 90, net: 40 });
    assert.equal(harness.state.randomCalls, 10);
});

test('action replay returns the latest committed projection without new random, IDs or upload', async () => {
    const harness = await createHarness(Array(10).fill(0));
    await openGame(harness);
    const input = command(harness.game.readCurrent(), 'stable-start', { bet: 50 });
    const first = await harness.game.startDice(input);
    const counts = {
        random: harness.state.randomCalls,
        game: harness.state.gameIds,
        event: harness.state.eventIds,
        activity: harness.state.activityIds,
        writes: harness.state.writes.length,
    };

    const replay = await harness.game.startDice({
        ...input,
        expectedRevision: 999,
        expectedEventId: 'stale-event',
    });

    assert.equal(replay.eventId, first.eventId);
    assert.deepEqual({
        random: harness.state.randomCalls,
        game: harness.state.gameIds,
        event: harness.state.eventIds,
        activity: harness.state.activityIds,
        writes: harness.state.writes.length,
    }, counts);
    await assert.rejects(
        harness.game.startDice({ ...input, bet: 60 }),
        error => error.code === 'game_action_conflict',
    );
    assert.equal(harness.state.randomCalls, counts.random);
});

test('a failed upload keeps one private candidate and retry saves it without rerunning the game', async () => {
    const harness = await createHarness(Array(9).fill(0));
    await openGame(harness);
    const before = structuredClone(harness.state.persisted);
    let candidate;
    harness.state.replaceImpl = async input => {
        candidate = structuredClone(input.candidate);
        return {
        status: 'failed',
        error: { code: 'storage_rejected', message: 'rejected', retryable: false },
        };
    };

    await assert.rejects(
        harness.game.startPush(command(harness.game.readCurrent(), 'failed-start')),
        error => error.code === 'storage_rejected' && error.retryable === false,
    );

    assert.deepEqual(harness.state.persisted, before);
    assert.equal(harness.game.readCurrent().balance, 100);
    assert.equal(harness.game.readCurrent().revision, 0);
    assert.equal(harness.game.getWriteState(), 'failed');
    assert.equal(harness.game.hasPendingSave(), true);
    assert.equal(harness.state.writes.length, 1);

    const counts = {
        random: harness.state.randomCalls,
        game: harness.state.gameIds,
        event: harness.state.eventIds,
        activity: harness.state.activityIds,
    };
    harness.state.replaceImpl = async input => {
        assert.deepEqual(input.candidate, candidate);
        harness.state.persisted = structuredClone(input.candidate);
        return { status: 'confirmed' };
    };

    assert.deepEqual(await harness.game.confirmPending(), { status: 'confirmed' });
    assert.deepEqual({
        random: harness.state.randomCalls,
        game: harness.state.gameIds,
        event: harness.state.eventIds,
        activity: harness.state.activityIds,
    }, counts);
    assert.equal(harness.game.hasPendingSave(), false);
    assert.equal(harness.game.readCurrent().activeGame.kind, 'push');
    assert.equal(harness.state.writes.length, 2);
});

test('an unconfirmed candidate stays private and file-control retry never reruns random or IDs', async () => {
    const harness = await createHarness(Array(20).fill(0));
    await openGame(harness);
    let preparedCandidate;
    harness.state.replaceImpl = async input => {
        preparedCandidate = structuredClone(input.candidate);
        return { status: 'unconfirmed', observed: structuredClone(harness.state.persisted) };
    };
    const input = command(harness.game.readCurrent(), 'pending-dice', { bet: 50 });

    await assert.rejects(
        harness.game.startDice(input),
        error => error.code === 'storage_unconfirmed' && error.uncertain === true,
    );
    const counts = {
        random: harness.state.randomCalls,
        game: harness.state.gameIds,
        event: harness.state.eventIds,
        activity: harness.state.activityIds,
    };
    assert.equal(harness.game.readCurrent().revision, 0);
    assert.equal(harness.game.readCurrent().balance, 100);
    assert.equal(harness.game.getWriteState(), 'unconfirmed');

    harness.state.replaceImpl = async input => {
        assert.deepEqual(input.candidate, preparedCandidate);
        harness.state.persisted = structuredClone(input.candidate);
        return { status: 'confirmed' };
    };
    assert.deepEqual(await harness.game.confirmPending(), { status: 'confirmed' });

    assert.deepEqual({
        random: harness.state.randomCalls,
        game: harness.state.gameIds,
        event: harness.state.eventIds,
        activity: harness.state.activityIds,
    }, counts);
    assert.equal(harness.game.readCurrent().revision, 1);
    assert.equal(harness.game.readCurrent().balance, 50);
    assert.equal(harness.game.getWriteState(), 'ready');
    assert.equal(harness.state.writes.length, 2);
});

test('corrupt Game data is isolated from Economy reads', async () => {
    const harness = await createHarness([], { gamePartition: 'corrupt-game-data' });

    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(harness.economy.isOpen(), true);
    await assert.rejects(
        harness.game.refreshCurrent(),
        error => error.code === 'partition_invalid' && error.partitionKey === 'game',
    );
    assert.equal(harness.economy.getPlayerBalance(), 100);
    assert.equal(harness.coordinator.getFileState(), 'ready');
});

test('Game rejects forged owned Economy history before drawing or writing', async () => {
    const harness = await createHarness(Array(11).fill(0));
    await openGame(harness);
    const started = await harness.game.startDice(command(harness.game.readCurrent(), 'private-dice', { bet: 50 }));
    const randomBefore = harness.state.randomCalls;
    const writesBefore = harness.state.writes.length;
    harness.state.persisted.partitions.economy.transactions[1].sourceId = 'wrong-game';
    await harness.coordinator.refresh();
    await harness.economy.refresh();
    await harness.game.refreshCurrent();

    await assert.rejects(
        harness.game.bidDice(command(started, 'forged-bid', {
            gameId: started.activeGame.id,
            bid: { count: 1, face: 2 },
        })),
        /Game action is inconsistent/,
    );
    assert.equal(harness.state.randomCalls, randomBefore);
    assert.equal(harness.state.writes.length, writesBefore);
});
