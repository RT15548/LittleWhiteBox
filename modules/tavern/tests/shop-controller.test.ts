import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, effectScope, nextTick, ref, type Ref } from 'vue';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    createTavernSession,
    tavernEconomyTransactionsTable,
    tavernShopStateVersionsTable,
} from '../shared/session-db';
import { ensureTavernEconomy } from '../shared/economy/economy-service';
import { getTavernShopItem } from '../shared/shop/shop-catalog';
import { useTavernShopController } from '../app-src/features/phone-os/apps/shop/useTavernShopController';

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((resolvePromise) => {resolve = resolvePromise;});
    return { promise, resolve };
}

function createController(input: {
    selectedSessionId: Ref<string>;
    balance?: number;
    balanceReady?: boolean;
    balanceError?: string;
    chatRunning?: Ref<boolean>;
    balanceRef?: Ref<number>;
    balanceReadyRef?: Ref<boolean>;
    refreshWallet?: () => void | Promise<void>;
}) {
    const scope = effectScope();
    const controller = scope.run(() => useTavernShopController({
        selectedSessionId: input.selectedSessionId,
        chatRunning: input.chatRunning || ref(false),
        chatCancelling: ref(false),
        phoneSending: ref(false),
        memoryEditorMode: ref<'preview' | 'edit'>('preview'),
        characterArchiveBusy: computed(() => false),
        wallet: {
            balance: input.balanceRef || ref(input.balance ?? 100),
            balanceError: ref(input.balanceError || ''),
            balanceLoading: ref(false),
            balanceReady: input.balanceReadyRef || ref(input.balanceReady ?? true),
            refreshAfterEconomyDomainChange: input.refreshWallet || (() => {}),
        },
        knownTargetNames: computed(() => ['艾琳']),
    }));
    if (!controller) {throw new Error('shop_controller_scope_missing');}
    return { controller, scope };
}

test('shop controller turns a rapid double purchase into one committed action', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Shop controller double click' });
    await ensureTavernEconomy(session.id);
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.prepareShop();
        const intent = await controller.preparePurchase(getTavernShopItem('flower'));
        assert.ok(intent);
        const [first, second] = await Promise.all([
            controller.purchase(intent),
            controller.purchase(intent),
        ]);
        assert.ok(first);
        assert.equal(second, null);
        assert.equal(controller.currentVersion.value?.state.items.flower?.quantity, 1);
        assert.equal(
            (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
                .filter((transaction) => transaction.kind === 'shop_purchase').length,
            1,
        );
    } finally {
        scope.stop();
    }
});

test('shop controller blocks purchase when wallet truth is not ready', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Shop controller wallet unavailable' });
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({
        selectedSessionId,
        balanceReady: false,
        balanceError: '钱包暂时无法读取',
    });
    try {
        await controller.prepareShop();
        const item = getTavernShopItem('flower');
        assert.match(controller.purchaseBlockedReason(item), /钱包/);
        assert.equal(await controller.preparePurchase(item), null);
        assert.match(controller.actionError.value, /钱包/);
    } finally {
        scope.stop();
    }
});

test('shop controller rechecks the live interaction and wallet gates when a dialog intent submits', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Shop controller submit gates' });
    await ensureTavernEconomy(session.id);
    const selectedSessionId = ref(session.id);
    const chatRunning = ref(false);
    const balance = ref(100);
    const { controller, scope } = createController({
        selectedSessionId,
        chatRunning,
        balanceRef: balance,
    });
    try {
        await controller.prepareShop();
        const item = getTavernShopItem('flower');
        const runningIntent = await controller.preparePurchase(item);
        assert.ok(runningIntent);
        chatRunning.value = true;
        assert.equal(await controller.purchase(runningIntent), null);
        assert.match(controller.actionError.value, /角色正在回复/);
        assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(session.id).count(), 0);

        chatRunning.value = false;
        const walletIntent = await controller.preparePurchase(item);
        assert.ok(walletIntent);
        balance.value = 0;
        assert.equal(await controller.purchase(walletIntent), null);
        assert.match(controller.actionError.value, /还差/);
        assert.equal(await tavernShopStateVersionsTable.where('sessionId').equals(session.id).count(), 0);
        assert.equal(
            (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
                .filter((transaction) => transaction.kind === 'shop_purchase').length,
            0,
        );
    } finally {
        scope.stop();
    }
});

test('shop controller reports a committed purchase even when wallet refresh fails', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Shop controller refresh failure' });
    await ensureTavernEconomy(session.id);
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({
        selectedSessionId,
        refreshWallet: async () => {throw new Error('wallet_refresh_failed');},
    });
    try {
        await controller.prepareShop();
        const intent = await controller.preparePurchase(getTavernShopItem('flower'));
        assert.ok(intent);
        const result = await controller.purchase(intent);
        assert.ok(result);
        assert.equal(controller.actionError.value, '');
        assert.match(controller.status.value, /已经生效.*刷新失败/);
        assert.equal(controller.currentVersion.value?.state.items.flower?.quantity, 1);
    } finally {
        scope.stop();
    }
});

test('a late purchase result from the previous session cannot replace the new session state', async () => {
    await db.delete();
    await db.open();
    const firstSession = await createTavernSession({ title: 'Shop controller old session' });
    const secondSession = await createTavernSession({ title: 'Shop controller new session' });
    await Promise.all([ensureTavernEconomy(firstSession.id), ensureTavernEconomy(secondSession.id)]);
    const selectedSessionId = ref(firstSession.id);
    const { controller, scope } = createController({ selectedSessionId });
    const table = tavernShopStateVersionsTable as unknown as {
        add(record: unknown): Promise<unknown>;
    };
    const originalAdd = table.add.bind(table);
    const writeStarted = deferred<void>();
    const releaseWrite = deferred<void>();
    table.add = async (record: unknown) => {
        writeStarted.resolve();
        await (Dexie as unknown as { waitFor<T>(promise: Promise<T>): Promise<T> }).waitFor(releaseWrite.promise);
        return await originalAdd(record);
    };
    try {
        await controller.prepareShop();
        const intent = await controller.preparePurchase(getTavernShopItem('flower'));
        assert.ok(intent);
        const purchase = controller.purchase(intent);
        await writeStarted.promise;
        selectedSessionId.value = secondSession.id;
        releaseWrite.resolve();
        assert.ok(await purchase);
        assert.equal(controller.currentVersion.value, null);
        await controller.refreshShop();
        assert.equal(controller.currentVersion.value, null);
    } finally {
        table.add = originalAdd;
        releaseWrite.resolve();
        scope.stop();
    }
});

test('a stale session owner cannot clear a newer same-action busy state', async () => {
    await db.delete();
    await db.open();
    const firstSession = await createTavernSession({ title: 'Shop controller owner A' });
    const secondSession = await createTavernSession({ title: 'Shop controller owner B' });
    await Promise.all([ensureTavernEconomy(firstSession.id), ensureTavernEconomy(secondSession.id)]);
    const selectedSessionId = ref(firstSession.id);
    const firstRefreshStarted = deferred<void>();
    const secondRefreshStarted = deferred<void>();
    const releaseFirstRefresh = deferred<void>();
    const releaseSecondRefresh = deferred<void>();
    let refreshCount = 0;
    const { controller, scope } = createController({
        selectedSessionId,
        refreshWallet: async () => {
            refreshCount += 1;
            if (refreshCount === 1) {
                firstRefreshStarted.resolve();
                await releaseFirstRefresh.promise;
                return;
            }
            secondRefreshStarted.resolve();
            await releaseSecondRefresh.promise;
        },
    });
    try {
        await controller.prepareShop();
        const firstIntent = await controller.preparePurchase(getTavernShopItem('flower'));
        assert.ok(firstIntent);
        const firstPurchase = controller.purchase(firstIntent);
        await firstRefreshStarted.promise;
        assert.equal(controller.busyAction.value, 'purchase:flower:');

        selectedSessionId.value = secondSession.id;
        await nextTick();
        await controller.prepareShop();
        const secondIntent = await controller.preparePurchase(getTavernShopItem('flower'));
        assert.ok(secondIntent);
        const secondPurchase = controller.purchase(secondIntent);
        await secondRefreshStarted.promise;
        assert.equal(controller.busyAction.value, 'purchase:flower:');

        releaseFirstRefresh.resolve();
        assert.ok(await firstPurchase);
        assert.equal(controller.busyAction.value, 'purchase:flower:');

        releaseSecondRefresh.resolve();
        assert.ok(await secondPurchase);
        assert.equal(controller.busyAction.value, '');
    } finally {
        releaseFirstRefresh.resolve();
        releaseSecondRefresh.resolve();
        scope.stop();
    }
});
