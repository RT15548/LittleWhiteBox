import {
    ECONOMY_TRANSACTION_CAPABILITY,
    type EconomyReadCapability,
    type EconomyTransactionCapability,
} from '../../../capabilities/economy/index.js';
import { createStorageId } from '../../../kernel/identity.js';
import type {
    PendingCommitRecoveryResult,
    PartitionStore,
    XiaobaiOsFileControls,
    XiaobaiOsFileState,
} from '../../../kernel/contracts.js';
import type { UserTransactions } from '../../../kernel/user-transactions.js';
import { bankRandomSource } from '../../../domains/bank/random.js';
import { appendBankEvent, replayBankEvents } from '../../../domains/bank/timeline.js';
import {
    throwBankError,
    type BankAction,
    type BankCasToken,
    type BankClientView,
    type BankDepositProductId,
    type BankDomainV1,
    type BankEventResult,
    type BankFundProductId,
    type BankRandomSource,
    type BankState,
} from '../../../domains/bank/types.js';
import { createBankView, type CreateBankViewInput } from '../../../domains/bank/view.js';
import {
    assertActionId,
    assertCas,
    replayMatches,
    type BankCommandInput,
} from './action-policy.js';
import { createBankCommands } from './commands.js';
import { upgradeBankUserFile } from './upgrade.js';
import {
    buildBankEconomyLegs,
    validateBankEconomyConsistency,
} from './economy-protocol.js';

export interface BankServiceView extends BankClientView {
    balance: number;
    writeState: XiaobaiOsFileState;
    unsavedTurns: number;
    turnConfirmationAbandoned: boolean;
}

export type BankReadOptions = Pick<CreateBankViewInput, 'activityOffset' | 'activityLimit'>;

export interface BankServiceCommand extends BankCasToken {
    actionId: string;
}

export interface BankOpenDepositCommand extends BankServiceCommand {
    productId: BankDepositProductId;
    amount: number;
}

export interface BankWithdrawDepositCommand extends BankServiceCommand {
    positionId: string;
}

export interface BankOpenFundCommand extends BankServiceCommand {
    productId: BankFundProductId;
    amount: number;
}

export type BankSettleDueCommand = BankServiceCommand;

export interface BankService {
    ensureReady(): Promise<void>;
    advanceTurns(count: number): Promise<void>;
    readCurrent(options?: BankReadOptions): BankServiceView;
    refreshCurrent(options?: BankReadOptions): Promise<BankServiceView>;
    openDeposit(input: BankOpenDepositCommand): Promise<BankServiceView>;
    withdrawDeposit(input: BankWithdrawDepositCommand): Promise<BankServiceView>;
    openFund(input: BankOpenFundCommand): Promise<BankServiceView>;
    settleDue(input: BankSettleDueCommand): Promise<BankServiceView>;
    confirmPending(): Promise<PendingCommitRecoveryResult>;
    getWriteState(): XiaobaiOsFileState;
    subscribe(listener: () => void): () => void;
    dispose(): void;
}

export interface BankServiceDependencies {
    now?: () => number;
    createEventId?: () => string;
    createPositionId?: () => string;
    createActivityId?: () => string;
    random?: BankRandomSource;
    userTransactions?: UserTransactions;
}

export interface PreparedBankAction {
    domain: BankDomainV1;
    state: BankState;
    assistantTurn: number;
    playerBalance: number;
}

export type RunBankAction = (
    kind: BankAction['kind'],
    input: BankCommandInput,
    create: (prepared: PreparedBankAction) => {
        eventId: string;
        command: BankAction;
        result: BankEventResult;
    },
) => Promise<BankServiceView>;

interface PreparedResult {
    domain: BankDomainV1;
    assistantTurn: number;
    playerBalance: number;
}

function defaultId(prefix: string): string {
    return `${prefix}-${createStorageId()}`;
}

function transactionError(result: {
    status: 'failed' | 'unconfirmed' | 'conflict';
    error?: { code: string; message: string; retryable: boolean };
}): Error {
    const code = result.error?.code
        ?? (result.status === 'unconfirmed' ? 'SAVE_UNCONFIRMED' : 'SAVE_CONFLICT');
    return Object.assign(new Error(result.error?.message || code), {
        code,
        retryable: result.error?.retryable ?? true,
        uncertain: result.status === 'unconfirmed',
    });
}

export function createBankService(
    store: PartitionStore<BankDomainV1>,
    files: XiaobaiOsFileControls,
    economy: EconomyReadCapability,
    {
        now = Date.now,
        createEventId = () => defaultId('bank-event'),
        createPositionId = () => defaultId('bank-position'),
        createActivityId = () => defaultId('bank-activity'),
        random = bankRandomSource,
        userTransactions,
    }: BankServiceDependencies = {},
): BankService {
    const listeners = new Set<() => void>();
    const publish = (): void => {
        for (const listener of listeners) {
            try { listener(); } catch (error) {
                console.error('[LittleWhiteBox] Bank state listener failed', error);
            }
        }
    };
    const unsubscribeStore = store.subscribe(publish);
    const unsubscribeEconomy = economy.subscribe(publish);
    const unsubscribeFiles = files.subscribeFileState(publish);
    const currentDomain = (): BankDomainV1 | null => store.peekCurrent()?.value ?? null;
    let upgraded = !userTransactions;
    let queue: Promise<unknown> = Promise.resolve();
    let unsavedTurns = 0;
    let unsettled: { count: number; abandoned: boolean } | null = null;
    const serialize = <T>(work: () => Promise<T>): Promise<T> => {
        const pending = queue.then(work, work);
        queue = pending.catch((caughtError) => { console.debug({ source: import.meta.url, operation: "serialize" }, caughtError); });
        return pending;
    };

    async function ensureReady(): Promise<void> {
        if (!upgraded && userTransactions) {
            await upgradeBankUserFile(userTransactions);
            upgraded = true;
        }
        if (!currentDomain()) {await store.read();}
    }

    async function persistTurns(count: number): Promise<void> {
        try {
            await ensureReady();
            if (unsettled) {throw new Error('bank_turn_confirmation_unavailable');}
            const batch = { count, abandoned: false };
            unsettled = batch;
            let result;
            try {result = await store.transact(transaction => {
                const domain = transaction.currentOrInitial();
                if (!replayBankEvents(domain).openDeposits.length
                    && !replayBankEvents(domain).openInvestments.length) {return;}
                const next = { ...domain, currentTurn: domain.currentTurn + count };
                if (!Number.isSafeInteger(next.currentTurn)) {throw new Error('bank_turn_overflow');}
                transaction.replace(next);
            }, { discardRejectedCandidate: true, onSettled: status => {
                if (unsettled !== batch) {return;}
                if (status === 'confirmed') {unsavedTurns -= count; unsettled = null;}
                else if (status === 'rejected') {unsettled = null;}
                else {batch.abandoned = true;}
                publish();
            } });}
            catch (error) {
                if (unsettled === batch && !files.hasPendingCommit('bank')) {unsettled = null;}
                throw error;
            }
            if (result.status !== 'confirmed' && result.status !== 'unchanged') {
                if (result.status !== 'unconfirmed' && unsettled === batch) {unsettled = null;}
                throw transactionError(result);
            }
            if (result.status === 'confirmed' && unsettled === batch) {unsavedTurns -= count; unsettled = null;}
            if (result.status === 'unchanged') {unsavedTurns -= count; unsettled = null;}
        } finally {publish();}
    }

    async function advanceTurns(count: number): Promise<void> {
        if (!Number.isSafeInteger(count) || count < 1) {throw new TypeError('Invalid bank turn increment');}
        return serialize(async () => {
            if (!Number.isSafeInteger(unsavedTurns + count)) {throw new Error('bank_turn_overflow');}
            unsavedTurns += count;
            if (unsavedTurns !== count) {publish(); return;}
            await persistTurns(count);
        });
    }

    async function confirmPending(): Promise<PendingCommitRecoveryResult> {
        return serialize(async () => {
            const result = await files.retryPending();
            publish();
            if (result.status === 'unconfirmed' || result.status === 'conflict' || result.status === 'failed') {
                return result;
            }
            if (unsettled) {return { status: 'conflict' };}
            if (unsavedTurns) {await persistTurns(unsavedTurns);}
            return result;
        });
    }

    function buildView(
        domain: BankDomainV1 | null,
        playerBalance: number,
        options: BankReadOptions = {},
    ): BankServiceView {
        return {
            ...createBankView({ domain, ...options }),
            balance: playerBalance,
            writeState: files.getFileState(),
            unsavedTurns,
            turnConfirmationAbandoned: unsettled?.abandoned === true,
        };
    }

    function readCurrent(options: BankReadOptions = {}): BankServiceView {
        return buildView(currentDomain(), economy.getPlayerBalance(), options);
    }

    async function refreshCurrent(options: BankReadOptions = {}): Promise<BankServiceView> {
        await ensureReady();
        await economy.refresh();
        await store.read();
        return readCurrent(options);
    }

    const runAction: RunBankAction = (kind, input, create) => serialize(async () => {
        if (unsavedTurns) {throw Object.assign(new Error('bank_turns_unsaved'), { code: 'bank_turns_unsaved' });}
        await ensureReady();
        const result = await store.transact(transaction => {
            const transactionEconomy: EconomyTransactionCapability = transaction.useCapability(
                ECONOMY_TRANSACTION_CAPABILITY,
            );
            const domain = transaction.currentOrInitial();
            validateBankEconomyConsistency(domain, transactionEconomy);
            const assistantTurn = domain.currentTurn;
            const existing = domain.events.find(event => event.actionId === input.actionId);
            if (existing) {
                if (!replayMatches(existing, kind, input)) { throwBankError('bank_action_conflict'); }
                return {
                    domain,
                    assistantTurn,
                    playerBalance: transactionEconomy.getPlayerBalance(),
                };
            }

            assertActionId(input.actionId);
            assertCas(domain, input);
            const prepared: PreparedBankAction = {
                domain,
                state: replayBankEvents(domain),
                assistantTurn,
                playerBalance: transactionEconomy.getPlayerBalance(),
            };
            const action = create(prepared);
            const appended = appendBankEvent(domain, {
                ...input,
                eventId: action.eventId,
                command: action.command,
                result: action.result,
                assistantTurn,
                createdAt: now(),
            });
            const legs = buildBankEconomyLegs(appended.event);
            if (legs.length === 0) { throwBankError('bank_no_due_positions'); }
            transactionEconomy.postAction({ legs });
            transaction.replace(appended.domain);
            validateBankEconomyConsistency(appended.domain, transactionEconomy);
            return {
                domain: appended.domain,
                assistantTurn,
                playerBalance: transactionEconomy.getPlayerBalance(),
            };
        });

        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw transactionError(result);
        }
        const prepared: PreparedResult = result.result;
        return buildView(prepared.domain, prepared.playerBalance);
    });

    const commands = createBankCommands({
        createActivityId,
        createEventId,
        createPositionId,
        random,
        runAction,
    });

    return Object.freeze({
        ensureReady,
        advanceTurns,
        readCurrent,
        refreshCurrent,
        ...commands,
        confirmPending,
        getWriteState: files.getFileState,
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose() {
            unsubscribeStore();
            unsubscribeEconomy();
            unsubscribeFiles();
            listeners.clear();
        },
    });
}
