import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { ECONOMY_PARTITION, ECONOMY_TRANSACTION_CAPABILITY, createEconomyCapabilityRegistrations } from '../capabilities/economy/index.js';
import { projectBalances } from '../domains/economy/ledger.js';
import { createBankService } from '../apps/bank/application/service.js';
import { BANK_PARTITION } from '../apps/bank/partition.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { DICE_PARTITION } from '../apps/dice/partition.js';
import { createDiceSheetService } from '../apps/dice/application/sheet-service.js';
import { generateCoc7Sheet } from '../apps/dice/domain/coc7-creation.js';
import { resetLegacyChatEconomy } from '../storage/reset-chat-economy.js';
import { initialUserPartitions } from '../host/user-initial-partitions.js';
import { createLearningRewards } from '../apps/learning/application/rewards.js';
import { LEARNING_REWARDS_PARTITION } from '../apps/learning/reward-partition.js';
import { LEARNING_PARTITION } from '../apps/learning/partition.js';
import { createKernelComposition } from '../host/kernel-composition.js';

test('one user wallet opens once without a chat; cards, branches and reload share the balance', async () => {
    const h = await userEconomyHarness();
    h.switchStory(null);
    await h.economy.ensureOpen();
    assert.equal(h.economy.getPlayerBalance(), 100);
    assert.equal(h.state.referencesCreated, 0);
    const sheet = createDiceSheetService(h.store(DICE_PARTITION), h.transactions);
    await sheet.save(generateCoc7Sheet(), () => true);
    await sheet.save(null, () => true);
    for (const id of ['a', 'b', 'branch']) {
        h.switchStory(id);
        await h.economy.ensureOpen();
        assert.equal(h.economy.getPlayerBalance(), 0);
    }
    const reloaded = await userEconomyHarness({ files: h.state.files });
    await reloaded.economy.refresh();
    assert.equal(reloaded.economy.getPlayerBalance(), 0);
    assert.equal(reloaded.document().partitions.economy.transactions.filter(tx => tx.kind === 'opening_grant').length, 1);
    assert.deepEqual(reloaded.document().stories, {});
});

test('COC reset: cancellation, insufficient funds, definite failure, unknown save and retries keep money and sheet atomic', async () => {
    const h = await userEconomyHarness();
    await h.economy.refresh();
    const sheets = createDiceSheetService(h.store(DICE_PARTITION), h.transactions);
    const original = generateCoc7Sheet();
    await sheets.save(original, () => true);
    await assert.rejects(sheets.save(null, () => false));
    assert.equal(h.economy.getPlayerBalance(), 100);
    h.state.mode = 'rejected';
    await assert.rejects(sheets.save(null, () => true));
    assert.deepEqual(sheets.read(), original);
    assert.equal(h.economy.getPlayerBalance(), 100);
    h.state.mode = 'unknown';
    await assert.rejects(sheets.save(null, () => true));
    const candidate = structuredClone(h.state.writes.at(-1));
    assert.equal(h.transactions.getFileState(), 'unconfirmed');
    assert.equal(h.economy.getPlayerBalance(), 100);
    h.switchStory('b');
    await assert.rejects(sheets.save(null, () => true));
    h.state.mode = 'confirmed';
    await sheets.confirm();
    assert.deepEqual(h.state.writes.at(-1), candidate);
    assert.equal(h.economy.getPlayerBalance(), 0);
    assert.equal(sheets.read(), null);
    await sheets.save(null, () => true);
    assert.equal(h.document().partitions.economy.transactions.length, 2);
    await sheets.save(original, () => true);
    await assert.rejects(sheets.save(null, () => true));
    assert.deepEqual(sheets.read(), original);
    assert.equal(h.document().partitions.economy.transactions.filter(tx => tx.kind === 'coc7_reset').length, 1);
});

test('lost acknowledgement is confirmed by readback without charging twice', async () => {
    const h = await userEconomyHarness();
    const sheets = createDiceSheetService(h.store(DICE_PARTITION), h.transactions);
    await sheets.save(generateCoc7Sheet(), () => true);
    h.state.mode = 'written-unknown';
    await sheets.save(null, () => true);
    assert.equal(h.economy.getPlayerBalance(), 0);
    assert.equal(h.transactions.hasPendingCommit(), false);
    assert.equal(h.document().partitions.economy.transactions.length, 2);
});

test('bank positions are global: switching stories sees the same deposit and settles it only once', async () => {
    const h = await userEconomyHarness();
    await h.economy.refresh();
    // Banks need two deposits to exercise a same-ID collision, not an impossible overdraft.
    await h.store(ECONOMY_PARTITION).transact(tx => {
        const ledger = tx.currentOrInitial();
        const opening = ledger.transactions[0];
        ledger.transactions.push({ ...opening, id: 'fixture-grant', sequence: 2, idempotencyKey: 'fixture', actionId: 'fixture',
            amount: 100, kind: 'fixture', sourceDomain: 'fixture', sourceId: 'fixture' });
        tx.replace(ledger);
    });
    let eventId = 0;
    const bank = () => createBankService(h.store(BANK_PARTITION), h.transactions, h.economy, {
        createEventId: () => `event-${++eventId}`, createPositionId: () => 'position-1', createActivityId: () => 'activity-1',
        getCurrentAssistantTurn: () => 0, isMainGenerationActive: () => false,
    });
    const service = bank();
    const view = await service.refreshCurrent();
    await service.openDeposit({ actionId: 'open-1', expectedRevision: view.revision, expectedEventId: view.eventId,
        productId: 'short-term', amount: 100 });
    h.switchStory('b');
    assert.equal((await service.refreshCurrent()).deposits[0].id, 'position-1');
    await service.advanceTurns(10);
    assert.equal(service.readCurrent().deposits[0].claimable, true);
    const balances = projectBalances(h.document().partitions.economy);
    assert.equal(balances['escrow:bank:position-1'], 100);
    h.switchStory('branch');
    assert.equal((await h.store(BANK_PARTITION).read()).value.events.length, 1);
    const claimed = await service.settleDue({ actionId: 'claim-1', expectedRevision: service.readCurrent().revision,
        expectedEventId: service.readCurrent().eventId });
    assert.equal(claimed.deposits.length, 0);
    assert.equal(claimed.balance, 206);
    service.dispose();
});

test('global Bank does not create a story reference; story-owned Tasks still confirms one and rejects a queued switch', async () => {
    const h = await userEconomyHarness();
    h.switchStory('fresh', false);
    const result = await h.store(BANK_PARTITION).transact(tx => { tx.replace(tx.currentOrInitial()); });
    assert.equal(result.status, 'confirmed');
    assert.equal(h.state.referencesCreated, 0);
    assert.ok(h.document().partitions.bank);
    const storyResult = await h.store(TASKS_PARTITION).transact(tx => { tx.replace(tx.currentOrInitial()); });
    assert.equal(storyResult.status, 'confirmed');
    assert.equal(h.state.referencesCreated, 1);
    assert.ok(h.document().stories['new-story'].tasks);
    let release;
    const hold = new Promise(resolve => { release = resolve; });
    const first = h.store(DICE_PARTITION).transact(async () => { await hold; });
    let executed = false;
    const queued = h.store(TASKS_PARTITION).transact(() => { executed = true; });
    h.switchStory('other'); release();
    await first;
    assert.equal((await queued).status, 'failed');
    assert.equal(executed, false);
});

test('upgrade discards only old chat economics, retaining conversation-owned data and sheet/learning outcomes', async () => {
    let sidecar = { formatVersion: 1, osId: 'a', binding: { kind: 'character', ownerLocator: 'a.png', chatId: 'chat' }, revision: 1, commitId: 'old',
        partitions: { economy: { schemaVersion: 2, transactions: [] }, bank: { events: ['old'] }, game: {}, shop: {}, tasks: {},
            messages: { items: ['keep'] }, learning: { teacher: { name: 'teacher', note: '' } }, world: { keep: true } } };
    const original = structuredClone(sidecar);
    const port = resetLegacyChatEconomy({ read: async () => sidecar, replace: async ({ candidate }) => { sidecar = candidate; return { status: 'confirmed' }; }, delete: async () => 'deleted' });
    const migrated = await port.read('a');
    assert.deepEqual(migrated.partitions, { messages: original.partitions.messages, learning: original.partitions.learning, world: original.partitions.world });
    assert.equal((await port.read('a')).commitId, migrated.commitId);
    const sheet = generateCoc7Sheet();
    const learning = { read: async () => {}, snapshot: () => ({ status: 'ready', document: { data: { profiles: [{ completions: [{ unitId: 'old-unit' }] }] } } }) };
    const initial = await initialUserPartitions(sheet, learning);
    assert.deepEqual(initial.dice.sheet, sheet);
    assert.deepEqual(initial['learning-rewards'].retiredUnitIds, ['old-unit']);
    assert.equal(projectBalances(initial.economy).player, 100);
});

test('global Bank keeps its account across cards while story-owned Tasks cannot spend another story escrow', async () => {
    const h = await userEconomyHarness();
    await h.economy.refresh();
    const bank = h.store(BANK_PARTITION);
    await bank.transact(tx => tx.useCapability(ECONOMY_TRANSACTION_CAPABILITY).postAction({ legs: [{
        actionId: 'stake', idempotencyKey: 'stake', fromAccountId: 'player', toAccountId: 'escrow:bank:position', amount: 50,
        sourceId: 'position', kind: 'deposit', title: 'deposit', sourceScope: 'b',
    }] }));
    const transaction = h.document().partitions.economy.transactions.at(-1);
    assert.equal(transaction.sourceScope, 'user');
    const tasks = h.store(TASKS_PARTITION);
    await tasks.transact(tx => tx.useCapability(ECONOMY_TRANSACTION_CAPABILITY).postAction({ legs: [{
        actionId: 'commission', idempotencyKey: 'commission', fromAccountId: 'player', toAccountId: 'escrow:task:position', amount: 50,
        sourceId: 'position', kind: 'task_funding', title: 'commission', sourceScope: 'b',
    }] }));
    assert.equal(h.document().partitions.economy.transactions.at(-1).sourceScope, 'a');
    h.switchStory('b');
    const global = await bank.transact(tx => {
        const economy = tx.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
        assert.equal(economy.getAccountBalance('escrow:bank:position'), 50);
    });
    assert.equal(global.status, 'unchanged');
    const isolated = await tasks.transact(tx => {
        const economy = tx.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
        assert.equal(economy.listOwnedTransactions().length, 0);
        assert.equal(economy.getAccountBalance('escrow:task:position'), 0);
    });
    assert.equal(isolated.status, 'unchanged');
});

test('retired learning completions never pay the new wallet, with or without an old receipt', async () => {
    const completions = [{ unitId: 'old-unclaimed' }, { unitId: 'old-paid', receipt: { transactionId: 'old-payment', receivedAt: 1 } }];
    const repository = { read: async () => {}, snapshot: () => ({ status: 'ready', document: { data: { profiles: [{ language: 'en', completions }] } } }) };
    const h = await userEconomyHarness({ initialPartitions: () => initialUserPartitions(null, repository) });
    const rewards = createLearningRewards({ repository, store: h.store(LEARNING_REWARDS_PARTITION), economy: h.economy, files: h.transactions });
    for (const completion of completions) {
        assert.equal(await rewards.settle('en', completion.unitId, true, () => true), 'retired');
        assert.equal(rewards.status(completion), 'retired');
    }
    assert.equal(h.economy.getPlayerBalance(), 100);
    assert.equal(h.document().partitions.economy.transactions.length, 1);
});

test('a pending global wallet does not block chat saves and cannot be accessed from a chat transaction', async () => {
    const binding = { kind: 'character', ownerLocator: 'a.png', chatId: 'a' };
    const capture = { identityKey: 'a', binding, reference: { formatVersion: 1, osId: 'a' } };
    let sidecar = { formatVersion: 1, osId: 'a', binding, revision: 1, commitId: 'initial', partitions: {} };
    let store;
    const composition = createKernelComposition({
        storage: { read: async () => structuredClone(sidecar), replace: async ({ candidate }) => { sidecar = structuredClone(candidate); return { status: 'confirmed' }; }, delete: async () => 'missing' },
        chatReferences: { hasPending: () => false, capture: () => capture, isCurrent: () => true, install: async () => ({ status: 'confirmed' }) },
        capabilities: createEconomyCapabilityRegistrations(),
        modules: [{ descriptor: { id: 'learning', name: 'Learning', accent: '#000' }, partition: LEARNING_PARTITION,
            capabilities: [ECONOMY_TRANSACTION_CAPABILITY], install(context) { store = context.partition; } }],
        user: { storage: { read: async () => null, replace: async () => { throw new Error('response lost'); } },
            initialPartitions: async () => ({ economy: ECONOMY_PARTITION.createInitial() }), resolveStory: async () => capture },
    });
    await composition.install();
    try {
        await assert.rejects(composition.userTransactions.prepare());
        assert.equal(composition.userTransactions.getFileState(), 'unconfirmed');
        assert.equal((await store.transact(tx => tx.replace(tx.currentOrInitial()))).status, 'confirmed');
        assert.ok(sidecar.partitions.learning);
        const before = structuredClone(sidecar);
        await assert.rejects(store.transact(tx => tx.useCapability(ECONOMY_TRANSACTION_CAPABILITY).getPlayerBalance()));
        assert.deepEqual(sidecar, before);
        assert.equal(composition.transactions.getFileState(), 'ready');
        assert.equal(composition.userTransactions.getFileState(), 'unconfirmed');
    } finally { await composition.dispose(); }
});
