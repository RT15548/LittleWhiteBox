import type { EconomyReadCapability } from '../../../capabilities/economy/index.js';
import type { XiaobaiOsExecutionScope } from '../../../kernel/execution-scope.js';
import type { XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import type { EconomyTransaction, EconomyTransactionPage } from '../../../domains/economy/types.js';
import type { XiaobaiOsHostFrameMessage } from '../../../host/frame-bridge.js';
import type {
    XiaobaiOsAppActivationContext,
    XiaobaiOsAppRuntime,
    XiaobaiOsChatIdentity,
} from '../../../types.js';
import type {
    WalletClientState,
    WalletStatus,
    WalletTransactionDirection,
    WalletTransactionPageView,
    WalletTransactionView,
} from '../types.js';

type UnknownRecord = Record<string, unknown>;
const WALLET_PAGE_SIZE = 18;
const WALLET_SOURCE_LABELS: Readonly<Record<string, string>> = Object.freeze({
    economy: '小白 OS',
    game: '游戏',
    tasks: '任务',
    bank: '银行',
    shop: '商店',
});
const WALLET_TRANSACTION_TITLES: Readonly<Record<string, string>> = Object.freeze({
    'Game stake escrow': '游戏下注',
    'Game reserve funding': '游戏奖池补足',
    'Game payout': '游戏派奖',
    'Game loss settlement': '游戏输局结算',
});

interface WalletActivation {
    chatIdentity: string;
    post: XiaobaiOsAppActivationContext['post'];
}

export interface WalletControllerDependencies {
    economy: EconomyReadCapability;
    confirmPending: XiaobaiOsFileControls['retryPending'];
    getChatIdentity: () => XiaobaiOsChatIdentity | { key?: unknown } | string | null;
    execution?: XiaobaiOsExecutionScope;
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function identityKey(identity: ReturnType<WalletControllerDependencies['getChatIdentity']>): string {
    return typeof identity === 'string' ? identity : String(identity?.key || '');
}

function transactionDirection(transaction: EconomyTransaction): WalletTransactionDirection {
    if (transaction.toAccountId === 'player') { return 'income'; }
    if (transaction.fromAccountId === 'player') { return 'expense'; }
    return 'transfer';
}

function projectTransaction(transaction: EconomyTransaction): WalletTransactionView {
    return {
        id: transaction.id,
        sequence: transaction.sequence,
        title: WALLET_TRANSACTION_TITLES[transaction.title] || transaction.title,
        note: transaction.note,
        source: WALLET_SOURCE_LABELS[transaction.sourceDomain] || transaction.sourceDomain,
        sourceDomain: transaction.sourceDomain,
        amount: transaction.amount,
        direction: transactionDirection(transaction),
        createdAt: transaction.createdAt,
    };
}

function projectPage(page: EconomyTransactionPage): WalletTransactionPageView {
    return {
        transactions: page.transactions.map(projectTransaction),
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
    };
}

function resolveStatus(
    writeState: ReturnType<EconomyReadCapability['getFileState']>,
    opened: boolean,
): { status: WalletStatus; message: string } {
    if (writeState === 'loading') { return { status: 'loading', message: '' }; }
    if (writeState === 'saving') { return { status: 'saving', message: '正在保存账目…' }; }
    if (writeState === 'unconfirmed') {
        return { status: 'unconfirmed', message: '还不确定账目是否保存成功，暂时不能操作小白币。请先检查保存。' };
    }
    if (writeState === 'conflict') {
        return { status: 'conflict', message: '服务器上的账本与当前内容不同，请先检查保存。' };
    }
    if (writeState === 'failed') {
        return { status: 'blocked', message: '钱包数据暂时无法读取，请稍后重试。' };
    }
    if (!opened) { return { status: 'blocked', message: '钱包还未开通，请重新加载。' }; }
    return { status: 'ready', message: '' };
}

export function createWalletController({
    economy,
    confirmPending,
    getChatIdentity,
    execution,
}: WalletControllerDependencies): XiaobaiOsAppRuntime & {
    activate: NonNullable<XiaobaiOsAppRuntime['activate']>;
    handleMessage: NonNullable<XiaobaiOsAppRuntime['handleMessage']>;
} {
    let activation: WalletActivation | null = null;
    let preparation: { activation: WalletActivation; error: string } | null = null;
    let unsubscribeEconomy: (() => void) | null = null;

    const currentChatIdentity = (): string => identityKey(getChatIdentity());
    const isCurrent = (current: WalletActivation): boolean =>
        activation === current && currentChatIdentity() === current.chatIdentity;

    function assertActivation(payload: UnknownRecord = {}): WalletActivation {
        if (!activation) { throw new Error('钱包 APP 未激活'); }
        if (!isCurrent(activation) || String(payload.chatIdentity || '') !== activation.chatIdentity) {
            throw new Error('聊天已切换，请重新打开钱包');
        }
        return activation;
    }

    function buildState(chatIdentity: string): WalletClientState {
        const next: WalletClientState = {
            chatIdentity,
            currency: '小白币',
            balance: economy.getPlayerBalance(),
            transactionCount: economy.getTransactionCount(),
            ...projectPage(economy.listTransactions({ limit: WALLET_PAGE_SIZE })),
            ...resolveStatus(economy.getFileState(), economy.isOpen()),
        };
        if (!preparation || preparation.activation !== activation) { return next; }
        if (preparation.error) { return { ...next, status: 'blocked', message: preparation.error }; }
        if (next.status === 'unconfirmed' || next.status === 'conflict') { return next; }
        return { ...next, status: 'loading', message: '' };
    }

    function emitState(current = activation): WalletClientState {
        if (!current) { throw new Error('钱包 APP 未激活'); }
        const state = buildState(current.chatIdentity);
        current.post('wallet/state', { state });
        return state;
    }

    function schedulePreparation(current: WalletActivation): void {
        const pending = { activation: current, error: '' };
        preparation = pending;
        const prepare = async () => {
            if (preparation !== pending || !isCurrent(current)) { return; }
            try {
                await economy.ensureOpen();
                if (preparation !== pending || !isCurrent(current)) { return; }
                preparation = null;
                emitState(current);
            } catch (error) {
                if (preparation !== pending || !isCurrent(current)) { return; }
                preparation = isRecord(error) && error.uncertain === true
                    ? null
                    : { activation: current, error: '钱包数据暂时无法读取，请稍后重试。' };
                emitState(current);
            }
        };
        if (execution) { execution.setTimeout(prepare, 0); }
        else { globalThis.setTimeout(() => { void prepare(); }, 0); }
    }

    function activate(context: XiaobaiOsAppActivationContext): WalletClientState {
        cancelForeground();
        const chatIdentity = currentChatIdentity();
        if (!chatIdentity) { throw new Error('请先打开一个聊天'); }
        const current = { chatIdentity, post: context.post };
        activation = current;
        if (!economy.isOpen()) { schedulePreparation(current); }
        return buildState(chatIdentity);
    }

    function cancelForeground(): void {
        activation = null;
        preparation = null;
    }

    async function handleMessage(message: XiaobaiOsHostFrameMessage): Promise<unknown> {
        const payload = isRecord(message.payload) ? message.payload : {};
        const current = assertActivation(payload);
        if (message.type === 'wallet/confirm-save') {
            preparation = null;
            const confirmation = await confirmPending();
            if (!isCurrent(current)) {throw new Error('聊天已切换，请重新打开钱包');}
            return { confirmation: confirmation.status, state: emitState(current) };
        }
        if (message.type === 'wallet/refresh') {
            preparation = null;
            await economy.refresh();
            if (economy.getFileState() === 'ready' && !economy.isOpen()) { await economy.ensureOpen(); }
            if (!isCurrent(current)) { throw new Error('聊天已切换，请重新打开钱包'); }
            return emitState(current);
        }
        if (message.type === 'wallet/load-more') {
            const beforeSequence = Number(payload.beforeSequence);
            if (!Number.isSafeInteger(beforeSequence) || beforeSequence < 2) {
                throw new Error('无法加载这页账目，请重新打开钱包');
            }
            return projectPage(economy.listTransactions({ beforeSequence, limit: WALLET_PAGE_SIZE }));
        }
        throw new Error('未知的钱包操作');
    }

    function handleExternalState(): void {
        const current = activation;
        if (!current || !isCurrent(current)) { return; }
        try { emitState(current); }
        catch { current.post('wallet/error', { message: '钱包状态暂时无法读取，请重新打开。' }); }
    }

    execution?.addCleanup(() => cancelForeground());

    return Object.freeze({
        activate,
        deactivate: cancelForeground,
        cancelForeground,
        cancelAll: cancelForeground,
        handleChatChanged: cancelForeground,
        handleMessage,
        startBackground() { unsubscribeEconomy ||= economy.subscribe(handleExternalState); },
        stopBackground() {
            unsubscribeEconomy?.();
            unsubscribeEconomy = null;
            cancelForeground();
        },
    });
}
