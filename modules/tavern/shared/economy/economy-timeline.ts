import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
} from '../session-db';
import { throwTavernEconomyError } from './economy-errors';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    type TavernEconomyRestoreImpact,
    type TavernEconomyRestoreResult,
    type TavernEconomyRestoreCurrentTransactionOptions,
    type TavernEconomyTransactionRecord,
} from './economy-types';

type EconomyRangeCollection<T> = {
    toArray(): Promise<T[]>;
};

type EconomyRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): EconomyRangeCollection<T>;
    };
};

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernEconomyError('economy_session_required');}
    return sessionId;
}

function normalizeTargetFloor(value: unknown): number {
    const floor = Number(value);
    if (!Number.isSafeInteger(floor) || floor < -1) {
        throwTavernEconomyError('economy_anchor_order_invalid', String(value));
    }
    return floor;
}

async function listTransactionsAfterFloor(sessionId: string, floor: number): Promise<TavernEconomyTransactionRecord[]> {
    return await (tavernEconomyTransactionsTable as unknown as EconomyRangeTable<TavernEconomyTransactionRecord>)
        .where('[sessionId+anchorOrder+ledgerOrder]')
        .between(
            [sessionId, floor + 1, 0],
            [sessionId, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .toArray();
}

function playerDelta(transactions: TavernEconomyTransactionRecord[]): number {
    return transactions.reduce((total, transaction) => {
        if (transaction.toAccountId === TAVERN_PLAYER_ACCOUNT_ID) {return total + transaction.amount;}
        if (transaction.fromAccountId === TAVERN_PLAYER_ACCOUNT_ID) {return total - transaction.amount;}
        return total;
    }, 0);
}

function affectedAccountIds(transactions: TavernEconomyTransactionRecord[]): Set<string> {
    return new Set(transactions.flatMap((transaction) => [transaction.fromAccountId, transaction.toAccountId]));
}

async function rebuildRetainedPlayerBalances(sessionId: string, expectedBalance: number): Promise<void> {
    const retained = await tavernEconomyTransactionsTable.where('sessionId').equals(sessionId).toArray();
    retained.sort((left, right) => left.ledgerOrder - right.ledgerOrder);
    let playerBalance = 0;
    const changed: TavernEconomyTransactionRecord[] = [];
    for (const transaction of retained) {
        if (transaction.toAccountId === TAVERN_PLAYER_ACCOUNT_ID) {playerBalance += transaction.amount;}
        if (transaction.fromAccountId === TAVERN_PLAYER_ACCOUNT_ID) {playerBalance -= transaction.amount;}
        if (!Number.isSafeInteger(playerBalance)) {throwTavernEconomyError('economy_balance_overflow');}
        if (transaction.playerBalanceAfter !== playerBalance) {
            changed.push({ ...transaction, playerBalanceAfter: playerBalance });
        }
    }
    if (playerBalance !== expectedBalance) {
        throwTavernEconomyError('economy_account_state_invalid', TAVERN_PLAYER_ACCOUNT_ID);
    }
    if (changed.length) {await tavernEconomyTransactionsTable.bulkPut(changed);}
}

export async function describeTavernEconomyRestoreImpact(
    sessionId = '',
    targetFloor = -1,
): Promise<TavernEconomyRestoreImpact> {
    const id = normalizeSessionId(sessionId);
    const floor = normalizeTargetFloor(targetFloor);
    return await db.transaction(
        'r',
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const [transactions, playerAccount] = await Promise.all([
                listTransactionsAfterFloor(id, floor),
                tavernEconomyAccountsTable.get([id, TAVERN_PLAYER_ACCOUNT_ID]),
            ]);
            const currentPlayerBalance = Number(playerAccount?.balance) || 0;
            return {
                changed: transactions.length > 0,
                targetFloor: floor,
                transactionCount: transactions.length,
                affectedAccountCount: affectedAccountIds(transactions).size,
                currentPlayerBalance,
                targetPlayerBalance: currentPlayerBalance - playerDelta(transactions),
            };
        },
    );
}

export async function restoreTavernEconomyToFloor(
    sessionId = '',
    targetFloor = -1,
): Promise<TavernEconomyRestoreResult> {
    const id = normalizeSessionId(sessionId);
    const floor = normalizeTargetFloor(targetFloor);
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => restoreTavernEconomyToFloorInCurrentDbTransaction(id, floor),
    );
}

/** Caller must include sessions, economyAccounts and economyTransactions in the active transaction. */
export async function restoreTavernEconomyToFloorInCurrentDbTransaction(
    sessionId = '',
    targetFloor = -1,
    options: TavernEconomyRestoreCurrentTransactionOptions = {},
): Promise<TavernEconomyRestoreResult> {
    const id = normalizeSessionId(sessionId);
    const floor = normalizeTargetFloor(targetFloor);
    const transactions = await listTransactionsAfterFloor(id, floor);
    const accountIds = affectedAccountIds(transactions);
    const playerAccount = await tavernEconomyAccountsTable.get([id, TAVERN_PLAYER_ACCOUNT_ID]);
    const currentPlayerBalance = Number(playerAccount?.balance) || 0;
    const impact: TavernEconomyRestoreImpact = {
        changed: transactions.length > 0,
        targetFloor: floor,
        transactionCount: transactions.length,
        affectedAccountCount: accountIds.size,
        currentPlayerBalance,
        targetPlayerBalance: currentPlayerBalance - playerDelta(transactions),
    };
    if (!transactions.length) {
        return { ...impact, deletedTransactionIds: [] };
    }

    const balanceDeltas = new Map<string, number>();
    for (const transaction of transactions) {
        balanceDeltas.set(
            transaction.fromAccountId,
            (balanceDeltas.get(transaction.fromAccountId) || 0) + transaction.amount,
        );
        balanceDeltas.set(
            transaction.toAccountId,
            (balanceDeltas.get(transaction.toAccountId) || 0) - transaction.amount,
        );
    }
    const timestamp = Date.now();
    const accounts = await Promise.all(Array.from(accountIds).map(async (accountId) => {
        const account = await tavernEconomyAccountsTable.get([id, accountId]);
        if (!account) {throwTavernEconomyError('economy_account_missing', accountId);}
        const balance = account.balance + (balanceDeltas.get(accountId) || 0);
        if (!Number.isSafeInteger(balance)) {throwTavernEconomyError('economy_balance_overflow', accountId);}
        if ((account.kind === 'player' || account.kind === 'escrow') && balance < 0) {
            throwTavernEconomyError('economy_balance_insufficient', accountId);
        }
        return { ...account, balance, updatedAt: timestamp };
    }));
    await tavernEconomyAccountsTable.bulkPut(accounts);
    await tavernEconomyTransactionsTable.bulkDelete(
        transactions.map((transaction) => [transaction.sessionId, transaction.id]),
    );
    await rebuildRetainedPlayerBalances(id, impact.targetPlayerBalance);
    if (options.touchSessionOnChange !== false) {
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
    }
    return {
        ...impact,
        deletedTransactionIds: transactions.map((transaction) => transaction.id),
    };
}
