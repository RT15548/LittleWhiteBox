export const TAVERN_PLAYER_ACCOUNT_ID = 'player' as const;
export const TAVERN_SYSTEM_MINT_ACCOUNT_ID = 'system:mint' as const;
export const TAVERN_SYSTEM_SINK_ACCOUNT_ID = 'system:sink' as const;
export const TAVERN_ECONOMY_OPENING_GRANT = 100 as const;
export const TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY = 'economy:opening-grant:v1' as const;

export type TavernEconomyAccountKind = 'player' | 'system' | 'contact' | 'counterparty' | 'escrow';

export interface TavernEconomyCurrentTransactionOptions {
    touchSessionOnCreate?: boolean;
    /**
     * A staged domain fact may be committed after a newer wallet fact while
     * retaining the narrative floor where the fact was observed. This is
     * intentionally opt-in for internal atomic domain commits only.
     */
    allowDelayedAnchorCommit?: boolean;
}

export interface TavernEconomyRestoreCurrentTransactionOptions {
    touchSessionOnChange?: boolean;
}

export interface TavernEconomyAccountRecord {
    sessionId: string;
    id: string;
    kind: TavernEconomyAccountKind;
    balance: number;
    createdAt: number;
    updatedAt: number;
}

export interface TavernEconomyTransactionRecord {
    id: string;
    sessionId: string;
    idempotencyKey: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    kind: string;
    title: string;
    note: string;
    sourceDomain: string;
    sourceId: string;
    anchorOrder: number;
    ledgerOrder: number;
    playerBalanceAfter: number;
    createdAt: number;
    reversalOfTransactionId?: string;
}

export interface TavernEconomySummary {
    playerBalance: number;
    openingTransaction: TavernEconomyTransactionRecord;
    created: boolean;
}

export interface PostTavernEconomyTransactionInput {
    sessionId: string;
    idempotencyKey: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    kind: string;
    title?: string;
    note?: string;
    sourceDomain: string;
    sourceId: string;
    anchorOrder: number;
}

export interface ReverseTavernEconomyTransactionInput {
    sessionId: string;
    transactionId: string;
    anchorOrder: number;
    idempotencyKey?: string;
    kind?: string;
    title?: string;
    note?: string;
    sourceDomain?: string;
    sourceId?: string;
}

export interface TavernEconomyTransactionCursor {
    ledgerOrder: number;
}

export interface ListTavernEconomyTransactionsOptions {
    limit?: number;
    before?: TavernEconomyTransactionCursor | null;
}

export interface TavernEconomyTransactionPage {
    transactions: TavernEconomyTransactionRecord[];
    nextCursor: TavernEconomyTransactionCursor | null;
    playerBalance: number;
}

export interface TavernEconomyRestoreImpact {
    changed: boolean;
    targetFloor: number;
    transactionCount: number;
    affectedAccountCount: number;
    currentPlayerBalance: number;
    targetPlayerBalance: number;
}

export interface TavernEconomyRestoreResult extends TavernEconomyRestoreImpact {
    deletedTransactionIds: string[];
}
