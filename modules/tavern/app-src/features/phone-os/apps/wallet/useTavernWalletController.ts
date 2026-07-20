import { computed, ref, watch, type Ref } from 'vue';
import {
    getTavernPlayerBalance,
    listTavernEconomyTransactions,
} from '../../../../../shared/economy/economy-service';
import type {
    TavernEconomyTransactionCursor,
    TavernEconomyTransactionRecord,
} from '../../../../../shared/economy/economy-types';

const WALLET_TRANSACTION_PAGE_SIZE = 18;

export interface TavernWalletControllerOptions {
    selectedSessionId: Ref<string>;
    isLedgerVisible?: (sessionId: string) => boolean;
}

function walletErrorText(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error || 'economy_wallet_load_failed');
    if (message.startsWith('economy_session_missing')) {return '这段剧情已经不存在。';}
    if (message.startsWith('economy_account_state_invalid')) {return '钱包账本状态异常，暂时无法读取。';}
    return '钱包暂时无法读取，请稍后重试。';
}

export function useTavernWalletController(options: TavernWalletControllerOptions) {
    const balance = ref(0);
    const balanceReady = ref(false);
    const balanceLoading = ref(false);
    const balanceError = ref('');
    const transactions = ref<TavernEconomyTransactionRecord[]>([]);
    const nextCursor = ref<TavernEconomyTransactionCursor | null>(null);
    const ledgerLoading = ref(false);
    const loadingMore = ref(false);
    const loadMoreError = ref('');
    const error = ref('');
    let walletReadSequence = 0;
    let ledgerRequestSequence = 0;
    let mutationRevision = 0;

    const hasMore = computed(() => !!nextCursor.value);

    function currentSessionId(): string {
        return String(options.selectedSessionId.value || '').trim();
    }

    function resetWalletState() {
        walletReadSequence += 1;
        ledgerRequestSequence += 1;
        balance.value = 0;
        balanceReady.value = false;
        balanceLoading.value = false;
        balanceError.value = '';
        transactions.value = [];
        nextCursor.value = null;
        ledgerLoading.value = false;
        loadingMore.value = false;
        loadMoreError.value = '';
        error.value = '';
        mutationRevision += 1;
    }

    async function refreshBalance(): Promise<void> {
        const sessionId = currentSessionId();
        const requestSequence = ++walletReadSequence;
        const readMutationRevision = mutationRevision;
        if (!sessionId) {
            resetWalletState();
            return;
        }
        balanceLoading.value = true;
        balanceError.value = '';
        try {
            const nextBalance = await getTavernPlayerBalance(sessionId);
            if (
                requestSequence !== walletReadSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            balance.value = nextBalance;
            balanceReady.value = true;
        } catch (cause) {
            if (
                requestSequence !== walletReadSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            balanceReady.value = false;
            balanceError.value = walletErrorText(cause);
        } finally {
            if (requestSequence === walletReadSequence) {balanceLoading.value = false;}
        }
    }

    async function refreshWallet(): Promise<void> {
        const sessionId = currentSessionId();
        const requestSequence = ++ledgerRequestSequence;
        const readSequence = ++walletReadSequence;
        const readMutationRevision = mutationRevision;
        if (!sessionId) {
            resetWalletState();
            return;
        }
        ledgerLoading.value = true;
        balanceLoading.value = true;
        loadingMore.value = false;
        balanceError.value = '';
        loadMoreError.value = '';
        error.value = '';
        transactions.value = [];
        nextCursor.value = null;
        try {
            const page = await listTavernEconomyTransactions(sessionId, { limit: WALLET_TRANSACTION_PAGE_SIZE });
            if (
                requestSequence !== ledgerRequestSequence
                || readSequence !== walletReadSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            balance.value = page.playerBalance;
            balanceReady.value = true;
            balanceError.value = '';
            transactions.value = page.transactions;
            nextCursor.value = page.nextCursor;
        } catch (cause) {
            if (
                requestSequence !== ledgerRequestSequence
                || readSequence !== walletReadSequence
                || sessionId !== currentSessionId()
            ) {return;}
            const message = walletErrorText(cause);
            balanceReady.value = false;
            balanceError.value = message;
            error.value = message;
        } finally {
            if (requestSequence === ledgerRequestSequence) {ledgerLoading.value = false;}
            if (readSequence === walletReadSequence) {balanceLoading.value = false;}
        }
    }

    async function loadMore(): Promise<void> {
        const sessionId = currentSessionId();
        const cursor = nextCursor.value;
        const requestSequence = ledgerRequestSequence;
        const readMutationRevision = mutationRevision;
        if (!sessionId || !cursor || ledgerLoading.value || loadingMore.value) {return;}
        loadingMore.value = true;
        loadMoreError.value = '';
        try {
            const page = await listTavernEconomyTransactions(sessionId, {
                limit: WALLET_TRANSACTION_PAGE_SIZE,
                before: cursor,
            });
            if (
                requestSequence !== ledgerRequestSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            const existingIds = new Set(transactions.value.map((transaction) => transaction.id));
            transactions.value = [
                ...transactions.value,
                ...page.transactions.filter((transaction) => !existingIds.has(transaction.id)),
            ];
            nextCursor.value = page.nextCursor;
        } catch (cause) {
            if (
                requestSequence !== ledgerRequestSequence
                || sessionId !== currentSessionId()
                || readMutationRevision !== mutationRevision
            ) {return;}
            loadMoreError.value = walletErrorText(cause);
        } finally {
            if (requestSequence === ledgerRequestSequence) {loadingMore.value = false;}
        }
    }

    async function prepareWallet(): Promise<void> {
        await refreshWallet();
    }

    async function refreshAfterEconomyDomainChange(): Promise<void> {
        const sessionId = currentSessionId();
        if (!sessionId) {return;}
        mutationRevision += 1;
        if (options.isLedgerVisible?.(sessionId)) {
            await refreshWallet();
            return;
        }
        await refreshBalance();
    }

    watch(options.selectedSessionId, resetWalletState);

    return {
        balance,
        balanceError,
        balanceLoading,
        balanceReady,
        error,
        hasMore,
        ledgerLoading,
        loadMore,
        loadMoreError,
        loadingMore,
        nextCursor,
        prepareWallet,
        refreshBalance,
        refreshAfterEconomyDomainChange,
        refreshWallet,
        transactions,
    };
}
