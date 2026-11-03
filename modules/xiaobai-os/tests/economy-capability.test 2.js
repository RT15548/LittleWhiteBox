import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createEconomyCapabilityRegistrations,
    ECONOMY_PARTITION,
    ECONOMY_READ_CAPABILITY,
    ECONOMY_TRANSACTION_CAPABILITY,
} from '../capabilities/economy/index.js';
import { ensureEconomy } from '../domains/economy/ledger.js';
import { createCapabilityRegistry } from '../kernel/capability-registry.js';

function accessHarness() {
    let ledger = ensureEconomy(undefined, { now: () => 1, createId: () => 'opening' });
    const access = {
        readPartition(registration) {
            assert.equal(registration, ECONOMY_PARTITION);
            return structuredClone(ledger);
        },
        replacePartition(registration, value) {
            assert.equal(registration, ECONOMY_PARTITION);
            ledger = structuredClone(value);
        },
    };
    return { access, ledger: () => ledger };
}

async function installedRegistry(ledger = null, options) {
    const registry = createCapabilityRegistry(createEconomyCapabilityRegistrations(options));
    const listeners = new Set();
    await registry.install({
        createStore: () => ({
            read: async () => ({
                identityKey: 'character:avatar.png:chat-a',
                osId: 'os_1',
                envelopeRevision: 0,
                value: structuredClone(ledger),
            }),
            peekCurrent: () => ({
                identityKey: 'character:avatar.png:chat-a',
                osId: 'os_1',
                envelopeRevision: 0,
                value: structuredClone(ledger),
            }),
            transact: async () => assert.fail('this harness does not execute owner transactions'),
            subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        }),
        files: {
            retryPending: async () => ({ status: 'none' }),
            adoptServerState: async () => ({ status: 'none' }),
            getFileState: () => 'ready',
            subscribeFileState: () => () => undefined,
        },
    });
    return registry;
}

test('wallet read capability cannot obtain a write method', async () => {
    const harness = accessHarness();
    const registry = await installedRegistry(harness.ledger());
    const capability = registry.require(ECONOMY_READ_CAPABILITY);
    await capability.refresh();
    assert.equal(capability.getPlayerBalance(), 100);
    assert.equal(capability.postAction, undefined);
});

test('Economy transaction capability binds sourceDomain to the caller', async () => {
    const harness = accessHarness();
    const registry = await installedRegistry(harness.ledger());
    const capability = registry.bind(
        ECONOMY_TRANSACTION_CAPABILITY,
        'game',
        harness.access,
    );
    const result = capability.postAction({
        legs: [{
            idempotencyKey: 'game:round:1:stake',
            actionId: 'game:round:1',
            fromAccountId: 'player',
            toAccountId: 'escrow:game:round-1',
            amount: 10,
            kind: 'stake',
            title: '下注',
            sourceId: 'round-1',
        }],
    });
    assert.equal(result.created, true);
    assert.equal(result.transactions[0].sourceDomain, 'game');
    assert.equal(harness.ledger().transactions[1].sourceDomain, 'game');
    assert.deepEqual(capability.listOwnedTransactions().map(transaction => transaction.sourceDomain), ['game']);
    assert.throws(() => capability.getAccountBalance('escrow:tasks:other'), /cannot read account/);
    assert.throws(() => capability.postAction({
        legs: [{
            idempotencyKey: 'forged-mint',
            actionId: 'forged-mint',
            fromAccountId: 'system:mint',
            toAccountId: 'player',
            amount: 1,
            kind: 'forged',
            title: 'forged',
            sourceId: 'forged',
        }],
    }), error => error.code === 'economy_account_not_authorized');
    assert.throws(() => capability.postAction({
        legs: [{
            idempotencyKey: 'cross-domain',
            actionId: 'cross-domain',
            fromAccountId: 'player',
            toAccountId: 'escrow:tasks:other',
            amount: 1,
            kind: 'forged',
            title: 'forged',
            sourceId: 'forged',
        }],
    }), error => error.code === 'economy_account_not_authorized');
});

test('Economy transaction account namespaces are explicit without changing source ownership', async () => {
    const harness = accessHarness();
    const registry = await installedRegistry(harness.ledger(), {
        transactionAccountNamespaces: { tasks: 'task' },
    });
    const capability = registry.bind(
        ECONOMY_TRANSACTION_CAPABILITY,
        'tasks',
        harness.access,
    );

    const result = capability.postAction({
        legs: [{
            idempotencyKey: 'tasks:event:one:funding',
            actionId: 'tasks:publish:one',
            fromAccountId: 'player',
            toAccountId: 'escrow:task:one',
            amount: 10,
            kind: 'task_funding',
            title: '任务报酬托管',
            sourceId: 'one',
        }],
    });

    assert.equal(result.transactions[0].sourceDomain, 'tasks');
    assert.equal(capability.getAccountBalance('escrow:task:one'), 10);
    assert.throws(
        () => capability.getAccountBalance('escrow:tasks:one'),
        error => error.code === 'economy_account_not_authorized',
    );
});

test('missing Economy data remains unopened until an explicit owner transaction', async () => {
    const access = {
        readPartition: () => null,
        replacePartition: () => assert.fail('read access must not create Economy data'),
    };
    const registry = await installedRegistry();
    const read = registry.require(ECONOMY_READ_CAPABILITY);
    await read.refresh();
    const transaction = registry.bind(ECONOMY_TRANSACTION_CAPABILITY, 'game', access);

    assert.equal(read.getPlayerBalance(), 0);
    assert.deepEqual(read.listTransactions(), { transactions: [], nextCursor: null, hasMore: false });
    assert.throws(() => transaction.postAction({ legs: [] }), error => error.code === 'economy_account_not_open');
});
