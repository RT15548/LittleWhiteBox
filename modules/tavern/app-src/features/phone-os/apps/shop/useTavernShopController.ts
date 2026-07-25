import { computed, ref, watch, type ComputedRef, type Ref } from 'vue';
import { captureTavernPhoneBoundary, type TavernExpectedPhoneBoundary } from '../../../../../shared/phone-boundary';
import { getTavernSession, normalizeTavernSessionState } from '../../../../../shared/session-db';
import {
    activateTavernShopItem,
    deactivateTavernShopItem,
    getCurrentTavernShopState,
    purchaseTavernShopItem,
    type TavernShopActivateResult,
    type TavernShopDeactivateResult,
    type TavernShopPurchaseResult,
} from '../../../../../shared/shop/shop-service';
import type {
    TavernShopActivation,
    TavernShopItem,
    TavernShopStateVersionRecord,
} from '../../../../../shared/shop/shop-types';
import { tavernShopUiError } from './tavern-shop-errors';
import { projectTavernShopInventory, projectTavernShopShelf } from './tavern-shop-presentation';

export type TavernShopActionKind = 'purchase' | 'activate' | 'deactivate';

export interface TavernShopActionIntent {
    kind: TavernShopActionKind;
    sessionId: string;
    itemId: string;
    activationId?: string;
    boundary: TavernExpectedPhoneBoundary;
    expectedRevision: number;
    expectedVersionId: string;
    actionId: string;
}

export interface TavernShopControllerOptions {
    selectedSessionId: Ref<string>;
    chatRunning: Ref<boolean>;
    chatCancelling: Ref<boolean>;
    phoneSending: Ref<boolean>;
    memoryEditorMode: Ref<'preview' | 'edit'>;
    characterArchiveBusy: ComputedRef<boolean>;
    wallet: {
        balance: Ref<number>;
        balanceError: Ref<string>;
        balanceLoading: Ref<boolean>;
        balanceReady: Ref<boolean>;
        refreshAfterEconomyDomainChange: () => void | Promise<void>;
    };
    knownTargetNames?: ComputedRef<string[]>;
    showToast?: (message: string, options?: { tone?: 'info' | 'warning'; durationMs?: number }) => void;
}

function emptyState() {
    return { items: {} };
}

function createActionId(kind: TavernShopActionKind): string {
    return `phone-shop:${kind}:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useTavernShopController(options: TavernShopControllerOptions) {
    const currentVersion = ref<TavernShopStateVersionRecord | null>(null);
    const currentTurn = ref(0);
    const loading = ref(false);
    const loadError = ref('');
    const actionError = ref('');
    const status = ref('');
    const busyAction = ref('');
    let readSequence = 0;
    let mutationRevision = 0;

    const inventoryState = computed(() => currentVersion.value?.state || emptyState());
    const shelfItems = computed(() => projectTavernShopShelf(inventoryState.value));
    const inventory = computed(() => projectTavernShopInventory(inventoryState.value, currentTurn.value));
    const activeItems = computed(() => inventory.value.active);
    const heldItems = computed(() => inventory.value.held);
    const exhaustedItems = computed(() => inventory.value.exhausted);
    const knownTargetNames = computed(() => [...new Set(
        (options.knownTargetNames?.value || []).map((name) => String(name || '').trim()).filter(Boolean),
    )]);
    const interactionBlockedReason = computed(() => {
        if (!currentSessionId()) {return '请先进入一个会话。';}
        if (options.chatRunning.value || options.chatCancelling.value) {return '角色正在回复，规则当铺暂时封柜。';}
        if (options.phoneSending.value) {return '私人消息正在等待回复，暂时不能改变生效规则。';}
        if (options.memoryEditorMode.value === 'edit') {return '请先退出记忆编辑，再操作规则当铺。';}
        if (options.characterArchiveBusy.value) {return '角色档案正在同步，规则当铺暂时封柜。';}
        if (loading.value) {return '背包仍在清点，请稍候。';}
        if (loadError.value) {return '背包状态读取失败，请先重试。';}
        return '';
    });

    function currentSessionId(): string {
        return String(options.selectedSessionId.value || '').trim();
    }

    function resetState(): void {
        readSequence += 1;
        mutationRevision += 1;
        currentVersion.value = null;
        currentTurn.value = 0;
        loading.value = false;
        loadError.value = '';
        actionError.value = '';
        status.value = '';
        busyAction.value = '';
    }

    async function refreshShop(): Promise<void> {
        const sessionId = currentSessionId();
        const sequence = ++readSequence;
        const readMutationRevision = mutationRevision;
        if (!sessionId) {
            resetState();
            return;
        }
        loading.value = true;
        loadError.value = '';
        try {
            const [session, version] = await Promise.all([
                getTavernSession(sessionId),
                getCurrentTavernShopState(sessionId),
            ]);
            if (!session) {throw new Error('shop_session_missing');}
            if (
                sequence !== readSequence
                || readMutationRevision !== mutationRevision
                || sessionId !== currentSessionId()
            ) {return;}
            currentVersion.value = version;
            currentTurn.value = normalizeTavernSessionState(session.state).turn;
        } catch (error) {
            if (
                sequence !== readSequence
                || readMutationRevision !== mutationRevision
                || sessionId !== currentSessionId()
            ) {return;}
            loadError.value = tavernShopUiError(error).message;
        } finally {
            if (sequence === readSequence) {loading.value = false;}
        }
    }

    async function prepareShop(): Promise<void> {
        actionError.value = '';
        status.value = '';
        await refreshShop();
    }

    function purchaseBlockedReason(item: TavernShopItem): string {
        const blocked = interactionBlockedReason.value;
        if (blocked) {return blocked;}
        if (busyAction.value) {return '上一项契约仍在提交。';}
        const row = shelfItems.value.find((candidate) => candidate.item.id === item.id);
        if (row?.purchaseLimitReached) {return '当前会话已达到限购数量。';}
        if (options.wallet.balanceLoading.value) {return '钱包余额正在读取。';}
        if (!options.wallet.balanceReady.value || options.wallet.balanceError.value) {return '钱包暂时无法确认余额。';}
        if (options.wallet.balance.value < item.price) {return `还差 ${item.price - options.wallet.balance.value} 小白币。`;}
        return '';
    }

    function activationBlockedReason(): string {
        return interactionBlockedReason.value || (busyAction.value ? '上一项契约仍在提交。' : '');
    }

    async function createIntent(
        kind: TavernShopActionKind,
        itemId: string,
        activationId = '',
    ): Promise<TavernShopActionIntent | null> {
        const sessionId = currentSessionId();
        if (!sessionId || activationBlockedReason()) {return null;}
        const version = currentVersion.value;
        const boundary = await captureTavernPhoneBoundary(sessionId);
        if (sessionId !== currentSessionId()) {return null;}
        return {
            kind,
            sessionId,
            itemId: String(itemId || '').trim(),
            ...(activationId ? { activationId: String(activationId) } : {}),
            boundary,
            expectedRevision: version?.revision || 0,
            expectedVersionId: version?.versionId || '',
            actionId: createActionId(kind),
        };
    }

    async function preparePurchase(item: TavernShopItem): Promise<TavernShopActionIntent | null> {
        actionError.value = '';
        const blocked = purchaseBlockedReason(item);
        if (blocked) {
            actionError.value = blocked;
            return null;
        }
        return await createIntent('purchase', item.id);
    }

    async function prepareActivation(item: TavernShopItem): Promise<TavernShopActionIntent | null> {
        actionError.value = '';
        const blocked = activationBlockedReason();
        if (blocked) {
            actionError.value = blocked;
            return null;
        }
        return await createIntent('activate', item.id);
    }

    async function prepareDeactivation(
        item: TavernShopItem,
        activation: TavernShopActivation,
    ): Promise<TavernShopActionIntent | null> {
        actionError.value = '';
        if (item.duration.kind !== 'manual') {
            actionError.value = '这个效果不能手动关闭。';
            return null;
        }
        const blocked = activationBlockedReason();
        if (blocked) {
            actionError.value = blocked;
            return null;
        }
        return await createIntent('deactivate', item.id, activation.id);
    }

    function intentMatchesCurrentSession(intent: TavernShopActionIntent): boolean {
        return intent.sessionId === currentSessionId();
    }

    async function recoverFromActionError(error: unknown): Promise<void> {
        const uiError = tavernShopUiError(error);
        actionError.value = uiError.message;
        if (uiError.kind === 'conflict' || uiError.kind === 'timeline') {
            mutationRevision += 1;
            await refreshShop();
        } else if (uiError.kind === 'wallet') {
            try {await options.wallet.refreshAfterEconomyDomainChange();} catch {
                status.value = '钱包显示仍未刷新，重新打开钱包会再次读取。';
            }
        }
    }

    async function runAction<TResult extends { record: TavernShopStateVersionRecord }>(
        intent: TavernShopActionIntent,
        execute: () => Promise<TResult>,
        successMessage: string,
        refreshWallet: boolean,
    ): Promise<TResult | null> {
        if (busyAction.value || !intentMatchesCurrentSession(intent)) {return null;}
        const actionKey = `${intent.kind}:${intent.itemId}:${intent.activationId || ''}`;
        busyAction.value = actionKey;
        actionError.value = '';
        status.value = '';
        try {
            const result = await execute();
            if (!intentMatchesCurrentSession(intent)) {return result;}
            mutationRevision += 1;
            currentVersion.value = result.record;
            options.showToast?.(successMessage);
            if (refreshWallet) {
                try {
                    await options.wallet.refreshAfterEconomyDomainChange();
                } catch {
                    status.value = '契约已经生效，但钱包显示刷新失败；重新打开钱包会再次读取。';
                    options.showToast?.(status.value, { tone: 'warning', durationMs: 4200 });
                }
            }
            return result;
        } catch (error) {
            if (intentMatchesCurrentSession(intent)) {await recoverFromActionError(error);}
            return null;
        } finally {
            if (busyAction.value === actionKey) {busyAction.value = '';}
        }
    }

    async function purchase(intent: TavernShopActionIntent): Promise<TavernShopPurchaseResult | null> {
        if (intent.kind !== 'purchase') {return null;}
        return await runAction(intent, () => purchaseTavernShopItem(intent), '已购入，契约已放进背包。', true);
    }

    async function activate(
        intent: TavernShopActionIntent,
        parameters: Record<string, unknown>,
    ): Promise<TavernShopActivateResult | null> {
        if (intent.kind !== 'activate') {return null;}
        return await runAction(intent, () => activateTavernShopItem({ ...intent, parameters }), '契约已经生效。', false);
    }

    async function deactivate(intent: TavernShopActionIntent): Promise<TavernShopDeactivateResult | null> {
        if (intent.kind !== 'deactivate' || !intent.activationId) {return null;}
        return await runAction(intent, () => deactivateTavernShopItem({
            ...intent,
            activationId: intent.activationId!,
        }), '契约已经关闭。', false);
    }

    async function refreshAfterShopDomainChange(): Promise<void> {
        if (!currentSessionId()) {return;}
        mutationRevision += 1;
        await refreshShop();
    }

    watch(options.selectedSessionId, resetState);

    return {
        actionError,
        activeItems,
        activate,
        activationBlockedReason,
        busyAction,
        currentTurn,
        currentVersion,
        deactivate,
        exhaustedItems,
        heldItems,
        interactionBlockedReason,
        knownTargetNames,
        loadError,
        loading,
        prepareActivation,
        prepareDeactivation,
        preparePurchase,
        prepareShop,
        purchase,
        purchaseBlockedReason,
        refreshAfterShopDomainChange,
        refreshShop,
        shelfItems,
        status,
    };
}
