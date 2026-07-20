import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
} from '../session-db';
import { throwTavernEconomyError } from './economy-errors';
import {
    TAVERN_ECONOMY_OPENING_GRANT,
    TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY,
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type ListTavernEconomyTransactionsOptions,
    type PostTavernEconomyTransactionInput,
    type ReverseTavernEconomyTransactionInput,
    type TavernEconomyAccountKind,
    type TavernEconomyAccountRecord,
    type TavernEconomyCurrentTransactionOptions,
    type TavernEconomySummary,
    type TavernEconomyTransactionPage,
    type TavernEconomyTransactionRecord,
} from './economy-types';

const DEFAULT_TRANSACTION_PAGE_SIZE = 24;
const MAX_TRANSACTION_PAGE_SIZE = 100;

type EconomyRangeCollection<T> = {
    reverse(): EconomyRangeCollection<T>;
    limit(count: number): EconomyRangeCollection<T>;
    first(): Promise<T | undefined>;
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

type NormalizedTransactionInput = Required<Omit<PostTavernEconomyTransactionInput, 'title' | 'note'>> & {
    title: string;
    note: string;
    reversalOfTransactionId?: string;
};

function now(): number {
    return Date.now();
}

function createTransactionId(): string {
    return `economy-${now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernEconomyError('economy_session_required');}
    return sessionId;
}

function normalizeText(value: unknown, limit: number): string {
    return String(value || '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
}

function normalizeRequiredText(value: unknown, limit: number, errorCode: 'economy_idempotency_key_required'): string {
    const text = normalizeText(value, limit);
    if (!text) {throwTavernEconomyError(errorCode);}
    return text;
}

export function tavernEconomyAccountKind(accountId = ''): TavernEconomyAccountKind {
    const id = String(accountId || '').trim();
    if (id === TAVERN_PLAYER_ACCOUNT_ID) {return 'player';}
    if (id === TAVERN_SYSTEM_MINT_ACCOUNT_ID || id === TAVERN_SYSTEM_SINK_ACCOUNT_ID) {return 'system';}
    if (/^contact:[^:\s][^\s]*$/u.test(id)) {return 'contact';}
    if (/^counterparty:[^:\s][^\s]*$/u.test(id)) {return 'counterparty';}
    if (/^escrow:[^:\s][^\s]*$/u.test(id)) {return 'escrow';}
    throwTavernEconomyError('economy_account_id_invalid', id);
}

function normalizeAccountId(value: unknown): string {
    const id = normalizeText(value, 180);
    tavernEconomyAccountKind(id);
    return id;
}

function normalizeAmount(value: unknown): number {
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
        throwTavernEconomyError('economy_amount_invalid', String(value));
    }
    return amount;
}

function normalizeAnchorOrder(value: unknown): number {
    const anchorOrder = Number(value);
    if (!Number.isSafeInteger(anchorOrder) || anchorOrder < -1) {
        throwTavernEconomyError('economy_anchor_order_invalid', String(value));
    }
    return anchorOrder;
}

function normalizeLedgerOrder(value: unknown): number {
    const ledgerOrder = Number(value);
    if (!Number.isSafeInteger(ledgerOrder) || ledgerOrder < 0) {
        throwTavernEconomyError('economy_ledger_order_invalid', String(value));
    }
    return ledgerOrder;
}

function normalizeTransactionInput(
    input: PostTavernEconomyTransactionInput,
    options: { reversalOfTransactionId?: string } = {},
): NormalizedTransactionInput {
    const fromAccountId = normalizeAccountId(input.fromAccountId);
    const toAccountId = normalizeAccountId(input.toAccountId);
    if (fromAccountId === toAccountId) {throwTavernEconomyError('economy_transfer_accounts_same', fromAccountId);}
    const kind = normalizeText(input.kind, 100);
    const sourceDomain = normalizeText(input.sourceDomain, 100);
    const sourceId = normalizeText(input.sourceId, 180);
    return {
        sessionId: normalizeSessionId(input.sessionId),
        idempotencyKey: normalizeRequiredText(input.idempotencyKey, 220, 'economy_idempotency_key_required'),
        fromAccountId,
        toAccountId,
        amount: normalizeAmount(input.amount),
        kind: kind || 'transfer',
        title: normalizeText(input.title, 140) || kind || '小白币交易',
        note: normalizeText(input.note, 1200),
        sourceDomain: sourceDomain || 'economy',
        sourceId,
        anchorOrder: normalizeAnchorOrder(input.anchorOrder),
        ...(options.reversalOfTransactionId
            ? { reversalOfTransactionId: normalizeText(options.reversalOfTransactionId, 180) }
            : {}),
    };
}

function accountCanOverdraw(account: TavernEconomyAccountRecord): boolean {
    return account.kind === 'system' || account.kind === 'contact' || account.kind === 'counterparty';
}

function assertSafeBalance(value: number): number {
    if (!Number.isSafeInteger(value)) {throwTavernEconomyError('economy_balance_overflow');}
    return value;
}

function createEmptyAccount(sessionId: string, accountId: string, timestamp: number): TavernEconomyAccountRecord {
    return {
        sessionId,
        id: accountId,
        kind: tavernEconomyAccountKind(accountId),
        balance: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

async function getTransactionByIdempotencyKey(sessionId: string, idempotencyKey: string) {
    const rows = await tavernEconomyTransactionsTable
        .where('[sessionId+idempotencyKey]')
        .equals([sessionId, idempotencyKey])
        .toArray();
    return rows[0] || null;
}

async function getLatestTransaction(sessionId: string): Promise<TavernEconomyTransactionRecord | null> {
    return await (tavernEconomyTransactionsTable as unknown as EconomyRangeTable<TavernEconomyTransactionRecord>)
        .where('[sessionId+ledgerOrder]')
        .between(
            [sessionId, 0],
            [sessionId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .reverse()
        .first() || null;
}

async function getHighestAnchorTransaction(sessionId: string): Promise<TavernEconomyTransactionRecord | null> {
    return await (tavernEconomyTransactionsTable as unknown as EconomyRangeTable<TavernEconomyTransactionRecord>)
        .where('[sessionId+anchorOrder+ledgerOrder]')
        .between(
            [sessionId, -1, 0],
            [sessionId, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .reverse()
        .first() || null;
}

async function nextLedgerOrder(
    input: NormalizedTransactionInput,
    options: { allowDelayedAnchorCommit?: boolean } = {},
): Promise<number> {
    const latest = await getLatestTransaction(input.sessionId);
    if (!latest) {return 0;}
    if (!options.allowDelayedAnchorCommit) {
        const highestAnchor = await getHighestAnchorTransaction(input.sessionId);
        const highestAnchorOrder = normalizeAnchorOrder(highestAnchor?.anchorOrder ?? latest.anchorOrder);
        if (input.anchorOrder < highestAnchorOrder) {
            throwTavernEconomyError(
                'economy_anchor_order_regression',
                `${input.anchorOrder}<${highestAnchorOrder}`,
            );
        }
    }
    const ledgerOrder = normalizeLedgerOrder(latest.ledgerOrder) + 1;
    return normalizeLedgerOrder(ledgerOrder);
}

function transactionMatchesInput(
    transaction: TavernEconomyTransactionRecord,
    input: NormalizedTransactionInput,
): boolean {
    return transaction.sessionId === input.sessionId
        && transaction.idempotencyKey === input.idempotencyKey
        && transaction.fromAccountId === input.fromAccountId
        && transaction.toAccountId === input.toAccountId
        && transaction.amount === input.amount
        && transaction.kind === input.kind
        && transaction.title === input.title
        && transaction.note === input.note
        && transaction.sourceDomain === input.sourceDomain
        && transaction.sourceId === input.sourceId
        && transaction.anchorOrder === input.anchorOrder
        && String(transaction.reversalOfTransactionId || '') === String(input.reversalOfTransactionId || '');
}

function assertIdempotentTransaction(
    transaction: TavernEconomyTransactionRecord,
    input: NormalizedTransactionInput,
): TavernEconomyTransactionRecord {
    if (!transactionMatchesInput(transaction, input)) {
        throwTavernEconomyError('economy_idempotency_conflict', input.idempotencyKey);
    }
    return transaction;
}

async function getOrCreateAccount(
    sessionId: string,
    accountId: string,
    timestamp: number,
): Promise<TavernEconomyAccountRecord> {
    const existing = await tavernEconomyAccountsTable.get([sessionId, accountId]);
    if (existing) {return existing;}
    const account = createEmptyAccount(sessionId, accountId, timestamp);
    await tavernEconomyAccountsTable.put(account);
    return account;
}

async function postTransactionInCurrentDbTransaction(
    input: NormalizedTransactionInput,
    options: {
        touchSessionOnCreate: boolean;
        allowDelayedAnchorCommit?: boolean;
    },
): Promise<TavernEconomyTransactionRecord> {
    const existing = await getTransactionByIdempotencyKey(input.sessionId, input.idempotencyKey);
    if (existing) {return assertIdempotentTransaction(existing, input);}

    const ledgerOrder = await nextLedgerOrder(input, options);
    const timestamp = now();
    const [fromAccount, toAccount, playerAccount] = await Promise.all([
        getOrCreateAccount(input.sessionId, input.fromAccountId, timestamp),
        getOrCreateAccount(input.sessionId, input.toAccountId, timestamp),
        getOrCreateAccount(input.sessionId, TAVERN_PLAYER_ACCOUNT_ID, timestamp),
    ]);
    if (!accountCanOverdraw(fromAccount) && fromAccount.balance < input.amount) {
        throwTavernEconomyError('economy_balance_insufficient', fromAccount.id);
    }

    fromAccount.balance = assertSafeBalance(fromAccount.balance - input.amount);
    fromAccount.updatedAt = timestamp;
    toAccount.balance = assertSafeBalance(toAccount.balance + input.amount);
    toAccount.updatedAt = timestamp;
    const nextPlayerBalance = input.fromAccountId === TAVERN_PLAYER_ACCOUNT_ID
        ? fromAccount.balance
        : input.toAccountId === TAVERN_PLAYER_ACCOUNT_ID
            ? toAccount.balance
            : playerAccount.balance;
    const transaction: TavernEconomyTransactionRecord = {
        id: createTransactionId(),
        sessionId: input.sessionId,
        idempotencyKey: input.idempotencyKey,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        kind: input.kind,
        title: input.title,
        note: input.note,
        sourceDomain: input.sourceDomain,
        sourceId: input.sourceId,
        anchorOrder: input.anchorOrder,
        ledgerOrder,
        playerBalanceAfter: nextPlayerBalance,
        createdAt: timestamp,
        ...(input.reversalOfTransactionId ? { reversalOfTransactionId: input.reversalOfTransactionId } : {}),
    };

    await tavernEconomyAccountsTable.bulkPut(
        fromAccount.id === toAccount.id ? [fromAccount] : [fromAccount, toAccount],
    );
    await (tavernEconomyTransactionsTable as unknown as {
        add(record: TavernEconomyTransactionRecord): Promise<unknown>;
    }).add(transaction);
    if (options.touchSessionOnCreate) {
        await tavernSessionsTable.update(input.sessionId, { updatedAt: timestamp });
    }
    return transaction;
}

async function ensureEconomyInCurrentDbTransaction(sessionId: string): Promise<TavernEconomySummary> {
    const session = await tavernSessionsTable.get(sessionId);
    if (!session) {throwTavernEconomyError('economy_session_missing', sessionId);}

    const openingInput = normalizeTransactionInput({
        sessionId,
        idempotencyKey: TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY,
        fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        amount: TAVERN_ECONOMY_OPENING_GRANT,
        kind: 'opening_grant',
        title: '首次开户',
        note: '当前会话的初始小白币',
        sourceDomain: 'economy',
        sourceId: 'opening-grant',
        anchorOrder: -1,
    });
    const existingOpening = await getTransactionByIdempotencyKey(sessionId, openingInput.idempotencyKey);
    if (existingOpening) {
        assertIdempotentTransaction(existingOpening, openingInput);
        const player = await tavernEconomyAccountsTable.get([sessionId, TAVERN_PLAYER_ACCOUNT_ID]);
        if (!player || !Number.isSafeInteger(player.balance)) {
            throwTavernEconomyError('economy_account_state_invalid', TAVERN_PLAYER_ACCOUNT_ID);
        }
        return {
            playerBalance: player.balance,
            openingTransaction: existingOpening,
            created: false,
        };
    }

    const timestamp = now();
    await Promise.all([
        getOrCreateAccount(sessionId, TAVERN_PLAYER_ACCOUNT_ID, timestamp),
        getOrCreateAccount(sessionId, TAVERN_SYSTEM_MINT_ACCOUNT_ID, timestamp),
        getOrCreateAccount(sessionId, TAVERN_SYSTEM_SINK_ACCOUNT_ID, timestamp),
    ]);
    const openingTransaction = await postTransactionInCurrentDbTransaction(openingInput, {
        touchSessionOnCreate: false,
    });
    return {
        playerBalance: openingTransaction.playerBalanceAfter,
        openingTransaction,
        created: true,
    };
}

export async function ensureTavernEconomy(sessionId = ''): Promise<TavernEconomySummary> {
    const id = normalizeSessionId(sessionId);
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => ensureEconomyInCurrentDbTransaction(id),
    );
}

export async function getTavernPlayerBalance(sessionId = ''): Promise<number> {
    return (await ensureTavernEconomy(sessionId)).playerBalance;
}

/**
 * Posts a ledger entry inside the caller's active Dexie transaction.
 * The caller must include sessions, economyAccounts and economyTransactions
 * in that transaction. This is intentionally narrow so another domain can
 * commit its own state and the corresponding wallet fact atomically.
 */
export async function postTavernEconomyTransactionInCurrentDbTransaction(
    input: PostTavernEconomyTransactionInput,
    options: TavernEconomyCurrentTransactionOptions = {},
): Promise<TavernEconomyTransactionRecord> {
    const normalized = normalizeTransactionInput(input);
    await ensureEconomyInCurrentDbTransaction(normalized.sessionId);
    return await postTransactionInCurrentDbTransaction(normalized, {
        touchSessionOnCreate: options.touchSessionOnCreate !== false,
        allowDelayedAnchorCommit: options.allowDelayedAnchorCommit === true,
    });
}

export async function postTavernEconomyTransaction(
    input: PostTavernEconomyTransactionInput,
): Promise<TavernEconomyTransactionRecord> {
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => postTavernEconomyTransactionInCurrentDbTransaction(input),
    );
}

export async function reverseTavernEconomyTransactionInCurrentDbTransaction(
    input: ReverseTavernEconomyTransactionInput,
    options: TavernEconomyCurrentTransactionOptions = {},
): Promise<TavernEconomyTransactionRecord> {
    const sessionId = normalizeSessionId(input.sessionId);
    const transactionId = normalizeText(input.transactionId, 180);
    if (!transactionId) {throwTavernEconomyError('economy_transaction_missing');}
    const anchorOrder = normalizeAnchorOrder(input.anchorOrder);
    await ensureEconomyInCurrentDbTransaction(sessionId);
    const original = await tavernEconomyTransactionsTable.get([sessionId, transactionId]);
    if (!original) {throwTavernEconomyError('economy_transaction_missing', transactionId);}
    if (anchorOrder < original.anchorOrder) {
        throwTavernEconomyError('economy_reversal_anchor_invalid', original.id);
    }
    const idempotencyKey = normalizeText(input.idempotencyKey, 220) || `economy:reverse:${original.id}`;
    const normalized = normalizeTransactionInput({
        sessionId,
        idempotencyKey,
        fromAccountId: original.toAccountId,
        toAccountId: original.fromAccountId,
        amount: original.amount,
        kind: normalizeText(input.kind, 100) || 'reversal',
        title: normalizeText(input.title, 140) || `退款 · ${original.title}`,
        note: normalizeText(input.note, 1200) || `冲正交易 ${original.id}`,
        sourceDomain: normalizeText(input.sourceDomain, 100) || original.sourceDomain,
        sourceId: normalizeText(input.sourceId, 180) || original.sourceId,
        anchorOrder,
    }, { reversalOfTransactionId: original.id });
    const existingReversals = await tavernEconomyTransactionsTable
        .where('[sessionId+reversalOfTransactionId]')
        .equals([sessionId, original.id])
        .toArray();
    const existingReversal = existingReversals[0];
    if (existingReversal) {
        if (existingReversal.idempotencyKey === idempotencyKey) {
            return assertIdempotentTransaction(existingReversal, normalized);
        }
        throwTavernEconomyError('economy_transaction_already_reversed', original.id);
    }
    return await postTransactionInCurrentDbTransaction(normalized, {
        touchSessionOnCreate: options.touchSessionOnCreate !== false,
        allowDelayedAnchorCommit: options.allowDelayedAnchorCommit === true,
    });
}

export async function reverseTavernEconomyTransaction(
    input: ReverseTavernEconomyTransactionInput,
): Promise<TavernEconomyTransactionRecord> {
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => reverseTavernEconomyTransactionInCurrentDbTransaction(input),
    );
}

export async function listTavernEconomyTransactions(
    sessionId = '',
    options: ListTavernEconomyTransactionsOptions = {},
): Promise<TavernEconomyTransactionPage> {
    const id = normalizeSessionId(sessionId);
    await ensureTavernEconomy(id);
    const limit = Math.min(
        MAX_TRANSACTION_PAGE_SIZE,
        Math.max(1, Math.floor(Number(options.limit) || DEFAULT_TRANSACTION_PAGE_SIZE)),
    );
    const cursor = options.before && Number.isSafeInteger(options.before.ledgerOrder) && options.before.ledgerOrder >= 0
        ? { ledgerOrder: Number(options.before.ledgerOrder) }
        : null;
    const lower = [id, 0];
    const upper = cursor
        ? [id, cursor.ledgerOrder]
        : [id, Number.MAX_SAFE_INTEGER];
    const { rows, playerBalance } = await db.transaction<{
        rows: TavernEconomyTransactionRecord[];
        playerBalance: number;
    }>(
        'r',
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const [transactions, playerAccount] = await Promise.all([
                (tavernEconomyTransactionsTable as unknown as EconomyRangeTable<TavernEconomyTransactionRecord>)
                    .where('[sessionId+ledgerOrder]')
                    .between(lower, upper, true, !cursor)
                    .reverse()
                    .limit(limit + 1)
                    .toArray(),
                tavernEconomyAccountsTable.get([id, TAVERN_PLAYER_ACCOUNT_ID]),
            ]);
            if (!playerAccount || !Number.isSafeInteger(playerAccount.balance)) {
                throwTavernEconomyError('economy_account_state_invalid', TAVERN_PLAYER_ACCOUNT_ID);
            }
            return { rows: transactions, playerBalance: playerAccount.balance };
        },
    );
    const transactions = rows.slice(0, limit);
    const last = transactions.at(-1) || null;
    return {
        transactions,
        nextCursor: rows.length > limit && last
            ? { ledgerOrder: last.ledgerOrder }
            : null,
        playerBalance,
    };
}
