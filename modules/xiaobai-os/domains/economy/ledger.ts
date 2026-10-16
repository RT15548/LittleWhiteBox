import { validateLedger } from './invariants.js';
import { createStorageId } from '../../kernel/identity.js';
import {
    ECONOMY_SCHEMA_VERSION,
    OPENING_GRANT_ACTION_ID,
    OPENING_GRANT_AMOUNT,
    OPENING_GRANT_IDEMPOTENCY_KEY,
    EconomyError,
    type EconomyLedger,
    type EconomyPostActionResult,
    type EconomyPostResult,
    type EconomyTransaction,
    type EconomyTransactionPage,
    type PostTransactionInput,
    type ReverseTransactionInput,
} from './types.js';

interface LedgerDependencies {
    now?: () => number;
    createId?: () => string;
}

function defaultCreateId(): string {
    return `tx-${createStorageId()}`;
}

function normalizedInput(input: PostTransactionInput): Omit<EconomyTransaction, 'id' | 'sequence' | 'createdAt'> {
    return {
        sourceScope: input.sourceScope ?? 'user',
        idempotencyKey: input.idempotencyKey,
        actionId: input.actionId,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
        amount: input.amount,
        kind: input.kind,
        title: input.title,
        note: input.note || '',
        sourceDomain: input.sourceDomain,
        sourceId: input.sourceId,
        ...(input.reversalOfTransactionId ? { reversalOfTransactionId: input.reversalOfTransactionId } : {}),
    };
}

function sameInput(transaction: EconomyTransaction, input: PostTransactionInput): boolean {
    return transaction.idempotencyKey === input.idempotencyKey
        && transaction.sourceScope === (input.sourceScope ?? 'user')
        && transaction.actionId === input.actionId
        && transaction.fromAccountId === input.fromAccountId
        && transaction.toAccountId === input.toAccountId
        && transaction.amount === input.amount
        && transaction.kind === input.kind
        && transaction.title === input.title
        && transaction.note === (input.note || '')
        && transaction.sourceDomain === input.sourceDomain
        && transaction.sourceId === input.sourceId
        && transaction.reversalOfTransactionId === input.reversalOfTransactionId;
}

export function ensureEconomy(
    ledger: EconomyLedger | undefined,
    { now = Date.now, createId = defaultCreateId }: LedgerDependencies = {},
): EconomyLedger {
    if (ledger) {
        validateLedger(ledger);
        return structuredClone(ledger);
    }
    const created: EconomyLedger = {
        schemaVersion: ECONOMY_SCHEMA_VERSION,
        transactions: [{
            id: createId(),
            sequence: 1,
            idempotencyKey: OPENING_GRANT_IDEMPOTENCY_KEY,
            actionId: OPENING_GRANT_ACTION_ID,
            fromAccountId: 'system:mint',
            toAccountId: 'player',
            amount: OPENING_GRANT_AMOUNT,
            kind: 'opening_grant',
            title: '开户赠礼',
            note: '欢迎来到小白 OS',
            sourceDomain: 'economy',
            sourceScope: 'user',
            sourceId: 'opening-grant:v1',
            createdAt: now(),
        }],
    };
    validateLedger(created);
    return created;
}

export function postTransaction(
    ledger: EconomyLedger,
    input: PostTransactionInput,
    { now = Date.now, createId = defaultCreateId }: LedgerDependencies = {},
): EconomyPostResult {
    validateLedger(ledger);
    const existing = ledger.transactions.find((transaction) => transaction.idempotencyKey === input.idempotencyKey);
    if (existing) {
        if (!sameInput(existing, input)) {
            throw new EconomyError('economy_idempotency_conflict', 'idempotency key was reused with different transaction data');
        }
        return { ledger: structuredClone(ledger), transaction: structuredClone(existing), created: false };
    }
    const next = structuredClone(ledger);
    const transaction: EconomyTransaction = {
        id: createId(),
        sequence: next.transactions.length + 1,
        createdAt: now(),
        ...normalizedInput(input),
    };
    next.transactions.push(transaction);
    validateLedger(next);
    return { ledger: next, transaction: structuredClone(transaction), created: true };
}

export function postAction(
    ledger: EconomyLedger,
    inputs: readonly PostTransactionInput[],
    dependencies: LedgerDependencies = {},
): EconomyPostActionResult {
    validateLedger(ledger);
    if (!Array.isArray(inputs) || inputs.length === 0) {
        throw new TypeError('economy action must contain at least one transaction');
    }
    const [first] = inputs;
    const idempotencyKeys = new Set<string>();
    for (const input of inputs) {
        if (idempotencyKeys.has(input.idempotencyKey)) {
            throw new EconomyError('economy_duplicate_action_leg', 'economy action legs need unique idempotency keys');
        }
        idempotencyKeys.add(input.idempotencyKey);
        if (
            input.actionId !== first.actionId ||
            input.sourceDomain !== first.sourceDomain || (input.sourceScope ?? 'user') !== (first.sourceScope ?? 'user') ||
            input.sourceId !== first.sourceId
        ) {
            throw new EconomyError(
                'economy_inconsistent_action',
                'economy action legs must share an action and source',
            );
        }
    }

    const existingByInput = inputs.map((input) =>
        ledger.transactions.find((transaction) => transaction.idempotencyKey === input.idempotencyKey),
    );
    for (let index = 0; index < inputs.length; index += 1) {
        const existing = existingByInput[index];
        if (existing && !sameInput(existing, inputs[index])) {
            throw new EconomyError(
                'economy_idempotency_conflict',
                'idempotency key was reused with different transaction data',
            );
        }
    }
    const existingAction = ledger.transactions.filter((transaction) => transaction.actionId === first.actionId);
    if (existingByInput.some(Boolean) || existingAction.length > 0) {
        const isCompleteReplay =
            existingAction.length === inputs.length &&
            existingByInput.every((transaction, index) => transaction === existingAction[index]);
        if (!isCompleteReplay) {
            throw new EconomyError('economy_partial_action', 'economy action is only partially present in the ledger');
        }
    }

    let next = structuredClone(ledger);
    const transactions: EconomyTransaction[] = [];
    let created = false;
    for (const input of inputs) {
        const posted = postTransaction(next, input, dependencies);
        next = posted.ledger;
        transactions.push(posted.transaction);
        created ||= posted.created;
    }
    return { ledger: next, transactions, created };
}

export function reverseTransaction(
    ledger: EconomyLedger,
    input: ReverseTransactionInput,
    dependencies: LedgerDependencies = {},
): EconomyPostResult {
    validateLedger(ledger);
    const original = ledger.transactions.find((transaction) => transaction.id === input.transactionId);
    if (!original || original.actionId === OPENING_GRANT_ACTION_ID || original.reversalOfTransactionId) {
        throw new EconomyError('economy_invalid_reversal', 'transaction cannot be reversed');
    }
    const existingReversal = ledger.transactions.find((transaction) => transaction.reversalOfTransactionId === original.id);
    if (existingReversal && existingReversal.idempotencyKey !== input.idempotencyKey) {
        throw new EconomyError('economy_already_reversed', 'transaction has already been reversed');
    }
    return postTransaction(ledger, {
        idempotencyKey: input.idempotencyKey,
        actionId: input.actionId,
        fromAccountId: original.toAccountId,
        toAccountId: original.fromAccountId,
        amount: original.amount,
        kind: 'reversal',
        title: input.title,
        note: input.note,
        sourceDomain: input.sourceDomain,
        sourceId: input.sourceId,
        reversalOfTransactionId: original.id,
        sourceScope: original.sourceScope,
    }, dependencies);
}

export function projectBalances(ledger: EconomyLedger): Readonly<Record<string, number>> {
    validateLedger(ledger);
    const balances: Record<string, number> = {};
    for (const transaction of ledger.transactions) {
        balances[transaction.fromAccountId] = (balances[transaction.fromAccountId] || 0) - transaction.amount;
        balances[transaction.toAccountId] = (balances[transaction.toAccountId] || 0) + transaction.amount;
    }
    return Object.freeze(balances);
}

export function listTransactions(
    ledger: EconomyLedger,
    { beforeSequence = Number.POSITIVE_INFINITY, limit = 18 }: { beforeSequence?: number; limit?: number } = {},
): EconomyTransactionPage {
    validateLedger(ledger);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new TypeError('transaction page limit must be an integer from 1 to 100');
    }
    const eligible = ledger.transactions.filter((transaction) => transaction.sequence < beforeSequence).reverse();
    const transactions = eligible.slice(0, limit).map((transaction) => structuredClone(transaction));
    const hasMore = eligible.length > transactions.length;
    return {
        transactions,
        nextCursor: hasMore ? transactions[transactions.length - 1]?.sequence ?? null : null,
        hasMore,
    };
}
