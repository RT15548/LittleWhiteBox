import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    branchTavernSession,
    createTavernSession,
    deleteTavernSession,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
} from '../shared/session-db';
import {
    ensureTavernEconomy,
    getTavernPlayerBalance,
    listTavernEconomyTransactions,
    postTavernEconomyTransaction,
    reverseTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    describeTavernEconomyRestoreImpact,
    restoreTavernEconomyToFloor,
} from '../shared/economy/economy-timeline';
import {
    describeAcceptedStateRollbackImpact,
    restoreAcceptedStateBeforeMessage,
    rollbackImpactLines,
} from '../app-src/features/accepted-rollback/accepted-rollback';
import {
    TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY,
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';

function playerSpendInput(sessionId: string, idempotencyKey: string, amount: number, anchorOrder: number) {
    return {
        sessionId,
        idempotencyKey,
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount,
        kind: 'intel_purchase',
        title: '购买情报',
        note: '测试交易',
        sourceDomain: 'intel',
        sourceId: idempotencyKey,
        anchorOrder,
    };
}

test('database v18 adds empty economy storage and existing sessions open lazily', async () => {
    await db.delete();
    const legacyDb = new Dexie('LittleWhiteBox_Tavern');
    const legacyRuntime = legacyDb as unknown as {
        table: (name: string) => {
            put: (record: Record<string, unknown>) => Promise<unknown>;
        };
        close: () => void;
    };
    legacyDb.version(17).stores({
        sessions: 'id, updatedAt',
    });
    await legacyDb.open();
    await legacyRuntime.table('sessions').put({
        id: 'v17-economy-session',
        title: 'Existing v17 session',
        characterKey: '',
        characterName: '',
        createdAt: 1,
        updatedAt: 1,
        state: { turn: 0 },
    });
    legacyRuntime.close();

    await db.open();
    const runtimeDb = db as unknown as { tables: Array<{ name: string }> };
    const tableNames = new Set(runtimeDb.tables.map((table) => table.name));
    assert.equal(tableNames.has('economyAccounts'), true);
    assert.equal(tableNames.has('economyTransactions'), true);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals('v17-economy-session').count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('v17-economy-session').count(), 0);

    const economy = await ensureTavernEconomy('v17-economy-session');
    assert.equal(economy.playerBalance, 100);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals('v17-economy-session').count(), 3);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals('v17-economy-session').count(), 1);
});

test('economy opens once per session and keeps identical idempotency keys session-scoped', async () => {
    await db.delete();
    await db.open();
    const firstSession = await createTavernSession({ title: 'Economy A' });
    const secondSession = await createTavernSession({ title: 'Economy B' });

    const repeated = await Promise.all([
        ensureTavernEconomy(firstSession.id),
        ensureTavernEconomy(firstSession.id),
    ]);
    assert.deepEqual(repeated.map((result) => result.created).sort(), [false, true]);
    assert.equal(await getTavernPlayerBalance(firstSession.id), 100);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(firstSession.id).count(), 3);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(firstSession.id).count(), 1);

    await ensureTavernEconomy(secondSession.id);
    assert.equal(await getTavernPlayerBalance(secondSession.id), 100);
    assert.equal(await tavernEconomyTransactionsTable.where('[sessionId+idempotencyKey]').equals([
        firstSession.id,
        TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY,
    ]).count(), 1);
    assert.equal(await tavernEconomyTransactionsTable.where('[sessionId+idempotencyKey]').equals([
        secondSession.id,
        TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY,
    ]).count(), 1);
});

test('economy posts atomically, retries once, and rejects conflicts or partial insufficient writes', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Atomic economy' });
    await ensureTavernEconomy(session.id);
    const input = playerSpendInput(session.id, 'intel-purchase:one', 15, 2);

    const [first, retry] = await Promise.all([
        postTavernEconomyTransaction(input),
        postTavernEconomyTransaction(input),
    ]);
    assert.equal(first.id, retry.id);
    assert.equal(first.playerBalanceAfter, 85);
    assert.equal(await getTavernPlayerBalance(session.id), 85);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_MINT_ACCOUNT_ID]))?.balance, -100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_SINK_ACCOUNT_ID]))?.balance, 15);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);

    await assert.rejects(postTavernEconomyTransaction({ ...input, amount: 16 }), /economy_idempotency_conflict/);
    await assert.rejects(postTavernEconomyTransaction({ ...input, kind: 'task_escrow' }), /economy_idempotency_conflict/);

    const beforeInsufficient = await getTavernPlayerBalance(session.id);
    await assert.rejects(postTavernEconomyTransaction({
        ...playerSpendInput(session.id, 'task-escrow:too-large', 999, 3),
        toAccountId: 'escrow:task-too-large',
        kind: 'task_escrow',
        sourceDomain: 'tasks',
    }), /economy_balance_insufficient/);
    assert.equal(await getTavernPlayerBalance(session.id), beforeInsufficient);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_SINK_ACCOUNT_ID]))?.balance, 15);
    assert.equal(await tavernEconomyAccountsTable.get([session.id, 'escrow:task-too-large']), undefined);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);

    const creatingHook = (tavernEconomyTransactionsTable as unknown as {
        hook(event: 'creating'): {
            subscribe(callback: (...args: unknown[]) => void): void;
            unsubscribe(callback: (...args: unknown[]) => void): void;
        };
    }).hook('creating');
    const failForcedWrite = (...args: unknown[]) => {
        const transaction = args[1] as { idempotencyKey?: string } | undefined;
        if (transaction?.idempotencyKey === 'forced-ledger-failure') {throw new Error('forced_ledger_failure');}
    };
    creatingHook.subscribe(failForcedWrite);
    try {
        await assert.rejects(postTavernEconomyTransaction({
            ...playerSpendInput(session.id, 'forced-ledger-failure', 5, 3),
            toAccountId: 'escrow:forced-failure',
            kind: 'task_escrow',
            sourceDomain: 'tasks',
        }), /forced_ledger_failure/);
    } finally {
        creatingHook.unsubscribe(failForcedWrite);
    }
    assert.equal(await getTavernPlayerBalance(session.id), beforeInsufficient);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_SINK_ACCOUNT_ID]))?.balance, 15);
    assert.equal(await tavernEconomyAccountsTable.get([session.id, 'escrow:forced-failure']), undefined);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 2);

    const firstPage = await listTavernEconomyTransactions(session.id, { limit: 1 });
    assert.equal(firstPage.playerBalance, 85);
    assert.deepEqual(firstPage.transactions.map((transaction) => transaction.id), [first.id]);
    assert.ok(firstPage.nextCursor);
    const secondPage = await listTavernEconomyTransactions(session.id, { limit: 1, before: firstPage.nextCursor });
    assert.equal(secondPage.playerBalance, 85);
    assert.equal(secondPage.transactions[0]?.kind, 'opening_grant');
    assert.equal(secondPage.nextCursor, null);
});

test('economy touches the session only for newly committed ledger changes', async () => {
    await db.delete();
    await db.open();
    const originalDateNow = Date.now;
    let timestamp = 1_725_100_000_000;
    Date.now = () => timestamp;
    try {
        const session = await createTavernSession({ title: 'Economy session activity' });

        timestamp += 1_000;
        const opening = await ensureTavernEconomy(session.id);
        assert.equal(opening.created, true);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, session.updatedAt);

        const input = playerSpendInput(session.id, 'session-touch-spend', 15, 2);
        timestamp += 1_000;
        const purchase = await postTavernEconomyTransaction(input);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, timestamp);

        timestamp += 1_000;
        const purchaseRetry = await postTavernEconomyTransaction(input);
        assert.equal(purchaseRetry.id, purchase.id);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, timestamp - 1_000);

        const reversalInput = {
            sessionId: session.id,
            transactionId: purchase.id,
            idempotencyKey: 'session-touch-refund',
            anchorOrder: 3,
        };
        timestamp += 1_000;
        const reversal = await reverseTavernEconomyTransaction(reversalInput);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, timestamp);

        timestamp += 1_000;
        const reversalRetry = await reverseTavernEconomyTransaction(reversalInput);
        assert.equal(reversalRetry.id, reversal.id);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, timestamp - 1_000);

        timestamp += 1_000;
        const restore = await restoreTavernEconomyToFloor(session.id, 2);
        assert.equal(restore.changed, true);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, timestamp);

        timestamp += 1_000;
        const restoreRetry = await restoreTavernEconomyToFloor(session.id, 2);
        assert.equal(restoreRetry.changed, false);
        assert.equal((await tavernSessionsTable.get(session.id))?.updatedAt, timestamp - 1_000);
    } finally {
        Date.now = originalDateNow;
    }
});

test('economy ledger order stays causal within one millisecond and rejects anchor regressions', async () => {
    await db.delete();
    await db.open();
    const originalDateNow = Date.now;
    Date.now = () => 1_725_000_000_000;
    try {
        const session = await createTavernSession({ title: 'Ordered economy' });
        const spend = await postTavernEconomyTransaction(playerSpendInput(
            session.id,
            'same-millisecond-spend',
            10,
            2,
        ));
        const reward = await postTavernEconomyTransaction({
            sessionId: session.id,
            idempotencyKey: 'same-millisecond-reward',
            fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
            toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            amount: 5,
            kind: 'task_reward',
            title: '同毫秒奖励',
            sourceDomain: 'tasks',
            sourceId: 'same-millisecond-reward',
            anchorOrder: 2,
        });
        assert.equal(spend.createdAt, reward.createdAt);
        assert.equal(spend.ledgerOrder, 1);
        assert.equal(reward.ledgerOrder, 2);

        const page = await listTavernEconomyTransactions(session.id, { limit: 10 });
        assert.equal(page.playerBalance, 95);
        assert.deepEqual(
            page.transactions.map((transaction) => [transaction.kind, transaction.playerBalanceAfter]),
            [['task_reward', 95], ['intel_purchase', 90], ['opening_grant', 100]],
        );

        await assert.rejects(postTavernEconomyTransaction({
            ...playerSpendInput(session.id, 'regressed-anchor', 5, 1),
            toAccountId: 'escrow:regressed-anchor',
            kind: 'task_escrow',
            sourceDomain: 'tasks',
        }), /economy_anchor_order_regression/);
        assert.equal(await getTavernPlayerBalance(session.id), 95);
        assert.equal(await tavernEconomyAccountsTable.get([session.id, 'escrow:regressed-anchor']), undefined);
    } finally {
        Date.now = originalDateNow;
    }
});

test('economy reversals are immutable transactions with full idempotency checks', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Economy reversal' });
    const purchase = await postTavernEconomyTransaction(playerSpendInput(session.id, 'intel-purchase:reverse-me', 15, 2));
    const reversalInput = {
        sessionId: session.id,
        transactionId: purchase.id,
        idempotencyKey: 'intel-refund:reverse-me',
        anchorOrder: 3,
        kind: 'intel_refund',
        title: '情报退款',
        sourceDomain: 'intel',
        sourceId: 'reverse-me',
    };
    const reversal = await reverseTavernEconomyTransaction(reversalInput);
    const retry = await reverseTavernEconomyTransaction(reversalInput);
    assert.equal(reversal.id, retry.id);
    assert.equal(reversal.reversalOfTransactionId, purchase.id);
    assert.equal(await getTavernPlayerBalance(session.id), 100);
    await assert.rejects(
        reverseTavernEconomyTransaction({ ...reversalInput, anchorOrder: 4 }),
        /economy_idempotency_conflict/,
    );
    await assert.rejects(
        reverseTavernEconomyTransaction({ ...reversalInput, idempotencyKey: 'another-refund-key' }),
        /economy_transaction_already_reversed/,
    );

    const secondPurchase = await postTavernEconomyTransaction(playerSpendInput(session.id, 'intel-purchase:later', 5, 6));
    await assert.rejects(reverseTavernEconomyTransaction({
        sessionId: session.id,
        transactionId: secondPurchase.id,
        anchorOrder: 5,
    }), /economy_reversal_anchor_invalid/);
});

test('economy timeline rollback removes only later facts and preserves the opening grant', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Economy rollback' });
    const spend = await postTavernEconomyTransaction(playerSpendInput(session.id, 'floor-two-spend', 10, 2));
    const reward = await postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'floor-three-reward',
        fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: 30,
        kind: 'task_reward',
        title: '任务奖励',
        sourceDomain: 'tasks',
        sourceId: 'task-3',
        anchorOrder: 3,
    });
    await postTavernEconomyTransaction(playerSpendInput(session.id, 'floor-four-spend', 5, 4));
    assert.equal(await getTavernPlayerBalance(session.id), 115);

    assert.deepEqual(await describeTavernEconomyRestoreImpact(session.id, 2), {
        changed: true,
        targetFloor: 2,
        transactionCount: 2,
        affectedAccountCount: 3,
        currentPlayerBalance: 115,
        targetPlayerBalance: 90,
    });
    const firstRestore = await restoreTavernEconomyToFloor(session.id, 2);
    assert.equal(firstRestore.transactionCount, 2);
    assert.equal(await getTavernPlayerBalance(session.id), 90);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_MINT_ACCOUNT_ID]))?.balance, -100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_SINK_ACCOUNT_ID]))?.balance, 10);
    assert.ok(await tavernEconomyTransactionsTable.get([session.id, spend.id]));
    assert.equal(await tavernEconomyTransactionsTable.get([session.id, reward.id]), undefined);

    await restoreTavernEconomyToFloor(session.id, 1);
    assert.equal(await getTavernPlayerBalance(session.id), 100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_MINT_ACCOUNT_ID]))?.balance, -100);
    assert.equal((await tavernEconomyAccountsTable.get([session.id, TAVERN_SYSTEM_SINK_ACCOUNT_ID]))?.balance, 0);
    const remaining = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray();
    assert.deepEqual(remaining.map((transaction) => transaction.kind), ['opening_grant']);
    assert.equal(remaining[0]?.anchorOrder, -1);
});

test('accepted state rollback includes wallet impact and restores the economy floor', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Accepted economy rollback' });
    await postTavernEconomyTransaction(playerSpendInput(session.id, 'accepted-floor-spend', 12, 2));

    const impact = await describeAcceptedStateRollbackImpact(session.id, 2);
    assert.equal(impact.economy.changed, true);
    assert.equal(impact.economy.targetFloor, 1);
    assert.equal(impact.economy.targetPlayerBalance, 100);
    assert.equal(impact.willRollbackState, true);
    assert.ok(rollbackImpactLines(impact).some((line) => line.includes('钱包流水')));

    await restoreAcceptedStateBeforeMessage(session.id, 2);
    assert.equal(await getTavernPlayerBalance(session.id), 100);
    const transactions = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray();
    assert.deepEqual(transactions.map((transaction) => transaction.kind), ['opening_grant']);
});

test('economy follows branch and delete lifecycle without cross-session writes', async () => {
    await db.delete();
    await db.open();
    const source = await createTavernSession({ title: 'Economy lifecycle' });
    await postTavernEconomyTransaction(playerSpendInput(source.id, 'source-spend', 20, 1));
    const branch = await branchTavernSession(source.id);
    assert.ok(branch);
    assert.equal(await getTavernPlayerBalance(source.id), 80);
    assert.equal(await getTavernPlayerBalance(branch.id), 80);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(branch.id).count(), 3);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(branch.id).count(), 2);

    await postTavernEconomyTransaction(playerSpendInput(branch.id, 'branch-spend', 5, 2));
    assert.equal(await getTavernPlayerBalance(branch.id), 75);
    assert.equal(await getTavernPlayerBalance(source.id), 80);

    assert.equal(await deleteTavernSession(source.id), 1);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(source.id).count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(source.id).count(), 0);
    await assert.rejects(ensureTavernEconomy(source.id), /economy_session_missing/);
    assert.equal(await tavernEconomyAccountsTable.where('sessionId').equals(source.id).count(), 0);
    assert.equal(await getTavernPlayerBalance(branch.id), 75);
});
