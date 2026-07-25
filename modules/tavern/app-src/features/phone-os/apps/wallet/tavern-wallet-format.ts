import {
    TAVERN_PLAYER_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../../../../../shared/economy/economy-types';

const walletTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

export type TavernWalletTransactionDirection = 'income' | 'expense' | 'transfer';

export function formatTavernWalletCoins(value: unknown): string {
    const amount = Number(value);
    return Number.isSafeInteger(amount) ? amount.toLocaleString('zh-CN') : '0';
}

export function tavernWalletTransactionDirection(
    transaction: TavernEconomyTransactionRecord,
): TavernWalletTransactionDirection {
    if (transaction.toAccountId === TAVERN_PLAYER_ACCOUNT_ID) {return 'income';}
    if (transaction.fromAccountId === TAVERN_PLAYER_ACCOUNT_ID) {return 'expense';}
    return 'transfer';
}

export function formatTavernWalletTransactionAmount(
    transaction: TavernEconomyTransactionRecord,
): string {
    const direction = tavernWalletTransactionDirection(transaction);
    const amount = formatTavernWalletCoins(transaction.amount);
    if (direction === 'income') {return `+${amount}`;}
    if (direction === 'expense') {return `−${amount}`;}
    return amount;
}

export function formatTavernWalletTransactionAnchor(
    transaction: TavernEconomyTransactionRecord,
): string {
    const time = walletTimeFormatter.format(new Date(transaction.createdAt));
    if (transaction.anchorOrder < 0) {return `会话开户 · ${time}`;}
    return `第 ${transaction.anchorOrder} 楼 · ${time}`;
}
