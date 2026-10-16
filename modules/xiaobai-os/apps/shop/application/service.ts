import {
    ECONOMY_TRANSACTION_CAPABILITY,
    type EconomyReadCapability,
} from '../../../capabilities/economy/index.js';
import type {
    PendingCommitRecoveryResult,
    PartitionStore,
    ScopedTransactionResult,
    XiaobaiOsFileControls,
    XiaobaiOsFileState,
} from '../../../kernel/contracts.js';
import { parseShopEffectReceipt } from '../../../domains/shop/invariants.js';
import { createStorageId } from '../../../kernel/identity.js';
import {
    activateShopItem,
    createEmptyShopState,
    deactivateShopItem,
    deliverShopEffects,
    getShopCasToken,
    projectShopState,
    purchaseShopItem,
} from '../../../domains/shop/timeline.js';
import type {
    ShopCasToken,
    ShopDomainV2,
    ShopEffectReceipt,
    ShopStateProjection,
} from '../../../domains/shop/types.js';
import {
    createShopPurchaseIntent,
    validateShopEconomyConsistency,
} from './economy-protocol.js';

export interface ShopServiceView {
    domain: ShopDomainV2 | null;
    projection: ShopStateProjection;
    balance: number;
    writeState: XiaobaiOsFileState;
}

export interface ShopServiceCommand extends ShopCasToken {
    actionId: string;
}

export interface ShopPurchaseCommand extends ShopServiceCommand {
    itemId: string;
}

export interface ShopActivateCommand extends ShopServiceCommand {
    itemId: string;
    parameters?: Record<string, unknown>;
}

export interface ShopDeactivateCommand extends ShopServiceCommand {
    itemId: string;
    activationId: string;
}

export interface ShopCommitDeliveryCommand {
    chatIdentity: string;
    actionId: string;
    receipt: ShopEffectReceipt;
}

export interface ShopService {
    readCurrent(): ShopServiceView;
    refreshCurrent(): Promise<ShopServiceView>;
    purchaseCurrent(input: ShopPurchaseCommand): Promise<ShopServiceView>;
    activateCurrent(input: ShopActivateCommand): Promise<ShopServiceView>;
    deactivateCurrent(input: ShopDeactivateCommand): Promise<ShopServiceView>;
    commitDeliveryCurrent(input: ShopCommitDeliveryCommand): Promise<ShopServiceView>;
    confirmPending(): Promise<PendingCommitRecoveryResult>;
    adoptServerState(): Promise<PendingCommitRecoveryResult>;
    getWriteState(): XiaobaiOsFileState;
    subscribe(listener: () => void): () => void;
    dispose(): void;
}

export interface ShopServiceDependencies {
    getCurrentChatIdentity: () => string;
    now?: () => number;
    createEventId?: () => string;
    createActivationId?: () => string;
    isMainGenerationActive?: () => boolean;
}

function transactionError(result: {
    status: 'failed' | 'unconfirmed' | 'conflict';
    error?: { code: string; message: string; retryable: boolean };
}): Error {
    return Object.assign(new Error(result.error?.message || `shop_${result.status}`), {
        code: result.error?.code || (result.status === 'unconfirmed' ? 'SAVE_UNCONFIRMED' : 'SAVE_CONFLICT'),
        retryable: result.error?.retryable ?? true,
        uncertain: result.status === 'unconfirmed',
    });
}

export function createShopService(
    store: PartitionStore<ShopDomainV2>,
    files: XiaobaiOsFileControls,
    economy: EconomyReadCapability,
    {
        getCurrentChatIdentity,
        now = Date.now,
        createEventId,
        createActivationId = () => `shop-activation-${createStorageId()}`,
        isMainGenerationActive = () => false,
    }: ShopServiceDependencies,
): ShopService {
    const commandDependencies = { now, ...(createEventId ? { createEventId } : {}) };
    const listeners = new Set<() => void>();
    let publishScheduled = false;

    const schedulePublish = (): void => {
        if (publishScheduled) {return;}
        publishScheduled = true;
        queueMicrotask(() => {
            publishScheduled = false;
            for (const listener of listeners) {
                try { listener(); }
                catch (error) { console.error('[LittleWhiteBox] Shop listener failed', error); }
            }
        });
    };
    const unsubscribeStore = store.subscribe(schedulePublish);
    const unsubscribeEconomy = economy.subscribe(schedulePublish);
    const unsubscribeFiles = files.subscribeFileState(schedulePublish);
    const currentDomain = (): ShopDomainV2 | null => store.peekCurrent()?.value ?? null;

    function buildView(domain = currentDomain()): ShopServiceView {
        return {
            domain: domain ? structuredClone(domain) : null,
            projection: projectShopState(domain || createEmptyShopState()),
            balance: economy.getPlayerBalance(),
            writeState: files.getFileState(),
        };
    }

    async function refreshCurrent(): Promise<ShopServiceView> {
        await store.read();
        return buildView();
    }

    function assertGenerationIdle(): void {
        if (isMainGenerationActive()) {throw new Error('shop_main_generation_active');}
    }

    function assertDeliveryChat(chatIdentity: string): void {
        const expected = String(chatIdentity || '').trim();
        if (!expected || getCurrentChatIdentity() !== expected) {
            throw new Error('shop_generation_chat_changed');
        }
    }

    async function acceptResult(
        result: ScopedTransactionResult<ShopDomainV2, ShopDomainV2>,
    ): Promise<ShopServiceView> {
        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw transactionError(result);
        }
        return buildView(result.status === 'confirmed' ? result.snapshot.value : result.result);
    }

    async function purchaseCurrent(input: ShopPurchaseCommand): Promise<ShopServiceView> {
        const result = await store.transact(transaction => {
            const current = transaction.currentOrInitial();
            const shopResult = purchaseShopItem(current, input, commandDependencies);
            const economyTransaction = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            if (shopResult.created) {
                economyTransaction.postAction(createShopPurchaseIntent(shopResult.event));
                transaction.replace(shopResult.domain);
            }
            validateShopEconomyConsistency(shopResult.domain, economyTransaction);
            return shopResult.domain;
        });
        return acceptResult(result);
    }

    async function activateCurrent(input: ShopActivateCommand): Promise<ShopServiceView> {
        assertGenerationIdle();
        const result = await store.transact(transaction => {
            assertGenerationIdle();
            const current = transaction.currentOrInitial();
            const economyTransaction = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateShopEconomyConsistency(current, economyTransaction);
            const existing = current.events.find(event => event.actionId === input.actionId);
            const activationId = existing?.action.kind === 'activate'
                ? existing.action.activationId
                : String(createActivationId() || '').trim();
            const shopResult = activateShopItem(current, { ...input, activationId }, commandDependencies);
            if (shopResult.created) { transaction.replace(shopResult.domain); }
            return shopResult.domain;
        }, {
            commitGuard: () => {
                assertGenerationIdle();
                return true;
            },
        });
        return acceptResult(result);
    }

    async function deactivateCurrent(input: ShopDeactivateCommand): Promise<ShopServiceView> {
        assertGenerationIdle();
        const result = await store.transact(transaction => {
            assertGenerationIdle();
            const current = transaction.currentOrInitial();
            const economyTransaction = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateShopEconomyConsistency(current, economyTransaction);
            const shopResult = deactivateShopItem(current, input, commandDependencies);
            if (shopResult.created) { transaction.replace(shopResult.domain); }
            return shopResult.domain;
        }, {
            commitGuard: () => {
                assertGenerationIdle();
                return true;
            },
        });
        return acceptResult(result);
    }

    async function commitDeliveryCurrent(input: ShopCommitDeliveryCommand): Promise<ShopServiceView> {
        const receipt = parseShopEffectReceipt(input.receipt);
        assertDeliveryChat(input.chatIdentity);
        const result = await store.transact(transaction => {
            assertDeliveryChat(input.chatIdentity);
            const current = transaction.currentOrInitial();
            const economyTransaction = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateShopEconomyConsistency(current, economyTransaction);
            const delivery = deliverShopEffects(current, {
                ...getShopCasToken(current),
                actionId: input.actionId,
                receipt,
            }, commandDependencies);
            if (delivery.created) { transaction.replace(delivery.domain); }
            return delivery.domain;
        }, {
            commitGuard: () => {
                assertDeliveryChat(input.chatIdentity);
                return true;
            },
        });
        return acceptResult(result);
    }

    return Object.freeze({
        readCurrent: () => buildView(),
        refreshCurrent,
        purchaseCurrent,
        activateCurrent,
        deactivateCurrent,
        commitDeliveryCurrent,
        confirmPending: files.retryPending,
        adoptServerState: files.adoptServerState,
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
