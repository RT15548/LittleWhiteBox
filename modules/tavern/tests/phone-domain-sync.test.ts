import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, effectScope, ref } from 'vue';

import db, {
    appendTavernMessage,
    createTavernManagerRun,
    createTavernSession,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    touchRunningTavernManagerRun,
} from '../shared/session-db';
import {
    ensureTavernEconomy,
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import { replaceTavernTaskBoard } from '../shared/tasks/task-board';
import type { TavernTaskListing } from '../shared/tasks/task-types';
import { useTavernTasksController } from '../app-src/features/phone-os/apps/tasks/useTavernTasksController';
import { useTavernWalletController } from '../app-src/features/phone-os/apps/wallet/useTavernWalletController';
import { useTavernShopController } from '../app-src/features/phone-os/apps/shop/useTavernShopController';
import { useTavernBankController } from '../app-src/features/phone-os/apps/bank/useTavernBankController';
import { useTavernPetController } from '../app-src/features/phone-os/apps/pet/useTavernPetController';
import { useTavernPhoneDomainSync } from '../app-src/features/phone-os/useTavernPhoneDomainSync';
import { purchaseTavernShopItem } from '../shared/shop/shop-service';
import {
    bidTavernBankDiceGame,
    getCurrentTavernBankState,
    openTavernBankDeposit,
    startTavernBankDiceGame,
} from '../shared/bank/bank-service';
import { createTavernBankSequenceRandom } from '../shared/bank/bank-random';
import { captureTavernPhoneBoundary } from '../shared/phone-boundary';
import {
    advanceTavernPetStoryTurnForTest,
    createTavernPetTestSession,
    lureTavernPetForTest,
} from './pet-test-helpers';

function taskListings(): TavernTaskListing[] {
    const rows = [
        ['禁忌', 'B', 150, '易介入', '现在就行'],
        ['接触', 'C', 60, '易介入', '任意时候'],
        ['夹缝', 'C', 100, '易介入', '现在就行'],
        ['窥秘', 'C', 80, '中介入', '任意时候'],
        ['掠夺', 'C', 100, '中介入', '特定时机：下课后'],
        ['怪癖', 'D', 25, '深介入', '特定时机：入夜后'],
    ] as const;
    return rows.map(([direction, grade, reward, posture, timing], index) => ({
        id: `domain-sync-listing-${index}`,
        grade,
        tags: [direction, '同步'],
        posture,
        title: `跨标签委托 ${index}`,
        issuer: {
            id: `domain-sync-issuer-${index}`,
            name: `委托人 ${index}`,
            description: '用于验证跨标签任务板刷新。',
        },
        hook: '新的委托已经送达。',
        objective: '验证另一个页面能看到已提交的任务事实。',
        location: '测试区',
        timing,
        risk: '无',
        reward,
    }));
}

async function settleLiveQueries(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 30));
}

async function waitUntil(predicate: () => boolean): Promise<void> {
    for (let index = 0; index < 80; index += 1) {
        if (predicate()) {return;}
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
    }
    throw new Error('phone_domain_sync_timeout');
}

function createSyncedBankObserver(
    selectedSessionId: ReturnType<typeof ref<string>>,
    showToast?: (message: string) => void,
) {
    const scope = effectScope();
    const observer = scope.run(() => {
        const wallet = useTavernWalletController({
            selectedSessionId,
            isLedgerVisible: () => true,
        });
        const bank = useTavernBankController({
            selectedSessionId,
            memoryEditorMode: ref<'preview' | 'edit'>('preview'),
            characterArchiveBusy: computed(() => false),
            acceptedRollbackBusy: computed(() => false),
            wallet,
            showToast,
        });
        useTavernPhoneDomainSync({
            selectedSessionId,
            onTasksChanged: () => {},
            onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
            onShopChanged: () => {},
            onBankChanged: (change) => bank.refreshAfterBankDomainChange(
                change.sessionId,
                change.settledPositionIds,
            ),
            onPetChanged: () => {},
        });
        return { bank, wallet };
    });
    if (!observer) {throw new Error('phone_bank_domain_sync_scope_missing');}
    return { ...observer, scope };
}

function createSyncedPetObserver(
    selectedSessionId: ReturnType<typeof ref<string>>,
    showToast?: (message: string) => void,
) {
    const scope = effectScope();
    const observer = scope.run(() => {
        const wallet = useTavernWalletController({
            selectedSessionId,
            isLedgerVisible: () => true,
        });
        const pet = useTavernPetController({
            selectedSessionId,
            agentConfig: ref({}),
            chatRunning: ref(false),
            chatCancelling: ref(false),
            memoryEditorMode: ref<'preview' | 'edit'>('preview'),
            characterArchiveBusy: computed(() => false),
            acceptedRollbackBusy: computed(() => false),
            wallet,
            showToast,
        });
        useTavernPhoneDomainSync({
            selectedSessionId,
            onTasksChanged: () => {},
            onEconomyChanged: async () => {
                await Promise.all([
                    wallet.refreshAfterEconomyDomainChange(),
                    pet.refreshAfterEconomyDomainChange(),
                ]);
            },
            onShopChanged: () => {},
            onBankChanged: () => {},
            onPetChanged: (change) => pet.refreshAfterPetDomainChange(change.journalIds),
        });
        return { pet, wallet };
    });
    if (!observer) {throw new Error('phone_pet_domain_sync_scope_missing');}
    return { ...observer, scope };
}

async function bankMutationHead(sessionId: string) {
    const current = await getCurrentTavernBankState(sessionId);
    return {
        sessionId,
        boundary: await captureTavernPhoneBoundary(sessionId),
        expectedRevision: current?.revision || 0,
        expectedVersionId: current?.versionId || '',
    };
}

test('phone domain sync establishes a baseline and ignores ordinary manager run saves and heartbeats', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Domain sync baseline' });
    await ensureTavernEconomy(session.id);
    const selectedSessionId = ref(session.id);
    let taskRefreshes = 0;
    let economyRefreshes = 0;
    const scope = effectScope();
    scope.run(() => useTavernPhoneDomainSync({
        selectedSessionId,
        onTasksChanged: () => {taskRefreshes += 1;},
        onEconomyChanged: () => {economyRefreshes += 1;},
        onShopChanged: () => {},
        onBankChanged: () => {},
        onPetChanged: () => {},
    }));

    try {
        await settleLiveQueries();
        assert.equal(taskRefreshes, 0);
        assert.equal(economyRefreshes, 0);

        const managerRun = await createTavernManagerRun({
            sessionId: session.id,
            status: 'running',
            leaseOwnerId: 'phone-domain-sync-test',
            leaseExpiresAt: Date.now() + 30_000,
        });
        await touchRunningTavernManagerRun(managerRun.id, {
            leaseOwnerId: 'phone-domain-sync-test',
        });
        await settleLiveQueries();
        assert.equal(taskRefreshes, 0);
        assert.equal(economyRefreshes, 0);

        await replaceTavernTaskBoard({
            sessionId: session.id,
            expectedRevision: 0,
            expectedEpoch: 1,
            boundary: null,
            generationId: 'domain-sync-board',
            listings: taskListings(),
        });
        await waitUntil(() => taskRefreshes === 1);
        assert.equal(economyRefreshes, 0);

        await postTavernEconomyTransaction({
            sessionId: session.id,
            idempotencyKey: 'domain-sync-spend',
            fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
            amount: 15,
            kind: 'test_spend',
            title: '同步测试支出',
            sourceDomain: 'test',
            sourceId: 'domain-sync-spend',
            anchorOrder: -1,
        });
        await waitUntil(() => economyRefreshes === 1);
        assert.equal(taskRefreshes, 1);
    } finally {
        scope.stop();
    }
});

test('an observing phone controller refreshes tasks and wallet after another writer commits domain changes', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Domain sync observer' });
    await ensureTavernEconomy(session.id);
    const selectedSessionId = ref(session.id);
    const scope = effectScope();
    const observer = scope.run(() => {
        const wallet = useTavernWalletController({
            selectedSessionId,
            isLedgerVisible: () => true,
        });
        const tasks = useTavernTasksController({
            selectedSessionId,
            effectiveContext: computed(() => ({})),
            agentConfig: ref({}),
            chatRunning: ref(false),
            chatCancelling: ref(false),
            memoryEditorMode: ref<'preview' | 'edit'>('preview'),
            characterArchiveBusy: computed(() => false),
            getNativeWorldInfoRuntime: async () => ({ timedState: { sticky: {}, cooldown: {} } }),
            onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
        });
        const shop = useTavernShopController({
            selectedSessionId,
            chatRunning: ref(false),
            chatCancelling: ref(false),
            phoneSending: ref(false),
            memoryEditorMode: ref<'preview' | 'edit'>('preview'),
            characterArchiveBusy: computed(() => false),
            wallet,
        });
        const bank = useTavernBankController({
            selectedSessionId,
            memoryEditorMode: ref<'preview' | 'edit'>('preview'),
            characterArchiveBusy: computed(() => false),
            acceptedRollbackBusy: computed(() => false),
            wallet,
        });
        useTavernPhoneDomainSync({
            selectedSessionId,
            onTasksChanged: tasks.refreshAfterTaskDomainChange,
            onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
            onShopChanged: shop.refreshAfterShopDomainChange,
            onBankChanged: (change) => bank.refreshAfterBankDomainChange(
                change.sessionId,
                change.settledPositionIds,
            ),
            onPetChanged: () => {},
        });
        return { bank, shop, tasks, wallet };
    });
    if (!observer) {throw new Error('phone_domain_sync_scope_missing');}

    try {
        await Promise.all([
            observer.tasks.refreshTaskData(),
            observer.wallet.refreshWallet(),
            observer.shop.refreshShop(),
            observer.bank.refreshBank(),
        ]);
        await settleLiveQueries();
        assert.equal(observer.tasks.board.value, null);
        assert.equal(observer.wallet.balance.value, 100);
        assert.equal(observer.wallet.transactions.value.length, 1);
        assert.equal(observer.bank.deposits.value.length, 0);

        const board = await replaceTavernTaskBoard({
            sessionId: session.id,
            expectedRevision: 0,
            expectedEpoch: 1,
            boundary: null,
            generationId: 'domain-sync-observer-board',
            listings: taskListings(),
        });
        await waitUntil(() => observer.tasks.board.value?.generationId === board.generationId);

        const transaction = await postTavernEconomyTransaction({
            sessionId: session.id,
            idempotencyKey: 'domain-sync-observer-spend',
            fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
            amount: 20,
            kind: 'test_spend',
            title: '另一个页面的支出',
            sourceDomain: 'test',
            sourceId: 'domain-sync-observer-spend',
            anchorOrder: -1,
        });
        await waitUntil(() => (
            observer.wallet.balance.value === 80
            && observer.wallet.transactions.value[0]?.id === transaction.id
        ));

        const purchase = await purchaseTavernShopItem({
            sessionId: session.id,
            itemId: 'flower',
            boundary: null,
            actionId: 'domain-sync-shop-purchase',
            expectedRevision: 0,
            expectedVersionId: '',
        });
        await waitUntil(() => (
            observer.shop.currentVersion.value?.versionId === purchase.record.versionId
            && observer.wallet.balance.value === 30
        ));
        assert.equal(observer.shop.heldItems.value[0]?.item.id, 'flower');
        assert.equal(observer.shop.heldItems.value[0]?.quantity, 1);

        await postTavernEconomyTransaction({
            sessionId: session.id,
            idempotencyKey: 'domain-sync-observer-top-up',
            fromAccountId: TAVERN_SYSTEM_MINT_ACCOUNT_ID,
            toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            amount: 100,
            kind: 'test_top_up',
            title: '另一个页面的充值',
            sourceDomain: 'test',
            sourceId: 'domain-sync-observer-top-up',
            anchorOrder: 0,
        });
        await waitUntil(() => observer.wallet.balance.value === 130);

        const deposit = await openTavernBankDeposit({
            sessionId: session.id,
            boundary: null,
            actionId: 'domain-sync-bank-deposit',
            expectedRevision: 0,
            expectedVersionId: '',
            productId: 'short-term',
            amount: 100,
        });
        await waitUntil(() => (
            observer.bank.view.value.versionId === deposit.record?.versionId
            && observer.wallet.balance.value === 30
        ));
        assert.equal(observer.bank.deposits.value.length, 1);
    } finally {
        scope.stop();
    }
});

test('Pet domain sync refreshes a globally shared resident but emits Journal notifications only in their source session', async () => {
    await db.delete();
    await db.open();
    const source = await createTavernPetTestSession('Pet domain sync source');
    const observerSession = await createTavernPetTestSession('Pet domain sync observer');
    const selectedSessionId = ref(observerSession.id);
    const toasts: string[] = [];
    const sourceToasts: string[] = [];
    const lateToasts: string[] = [];
    const observer = createSyncedPetObserver(selectedSessionId, (message) => {toasts.push(message);});
    const sourceObserver = createSyncedPetObserver(ref(source.id), (message) => {sourceToasts.push(message);});
    let late: ReturnType<typeof createSyncedPetObserver> | null = null;
    try {
        await Promise.all([
            observer.pet.preparePet(),
            observer.wallet.refreshWallet(),
            sourceObserver.pet.preparePet(),
            sourceObserver.wallet.refreshWallet(),
        ]);
        await settleLiveQueries();
        assert.equal(observer.pet.view.value.existence, 'undiscovered');
        assert.equal(sourceObserver.pet.view.value.existence, 'undiscovered');
        assert.equal(observer.wallet.balance.value, 100);

        await lureTavernPetForTest(source.id, 'domain-sync-pet-lure');
        await waitUntil(() => (
            observer.pet.view.value.phase === 'egg'
            && observer.wallet.balance.value === 100
        ));
        assert.deepEqual(toasts, []);

        await advanceTavernPetStoryTurnForTest(source.id, []);
        await waitUntil(() => (
            observer.pet.view.value.phase === 'juvenile'
            && sourceObserver.pet.view.value.phase === 'juvenile'
            && sourceToasts.includes('住户破壳了。')
        ));
        assert.deepEqual(toasts, []);
        assert.ok(sourceToasts.includes('住户破壳了。'));
        assert.equal(observer.pet.homeNotice.value, true);
        observer.pet.clearHomeNotice();
        assert.equal(observer.pet.homeNotice.value, false);

        late = createSyncedPetObserver(selectedSessionId, (message) => {lateToasts.push(message);});
        await Promise.all([late.pet.preparePet(), late.wallet.refreshWallet()]);
        await settleLiveQueries();
        assert.equal(late.pet.view.value.phase, 'juvenile');
        assert.deepEqual(lateToasts, []);
    } finally {
        observer.scope.stop();
        sourceObserver.scope.stop();
        late?.scope.stop();
    }
});

test('Bank domain sync clears a dismissed old outcome for a remote new game and reveals the new persisted result', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Bank outcome domain sync' });
    await ensureTavernEconomy(session.id);
    await appendTavernMessage(session.id, { role: 'user', content: '跨标签开骰局' });
    const observer = createSyncedBankObserver(ref(session.id));
    try {
        await Promise.all([observer.bank.refreshBank(), observer.wallet.refreshWallet()]);
        await settleLiveQueries();

        const firstStart = await startTavernBankDiceGame({
            ...await bankMutationHead(session.id),
            actionId: 'domain-sync-dice-start-1',
            bet: 50,
        }, { random: createTavernBankSequenceRandom([0, 1, 2, 3, 4, 5, 0, 1, 2, 3]) });
        const firstGameId = String(firstStart.actionRecord?.action.kind === 'dice-start'
            ? firstStart.actionRecord.action.gameId
            : '');
        await waitUntil(() => observer.bank.activeGame.value?.id === firstGameId);
        assert.equal(observer.bank.lastGameOutcome.value, null);

        await bidTavernBankDiceGame({
            ...await bankMutationHead(session.id),
            actionId: 'domain-sync-dice-end-1',
            gameId: firstGameId,
            bid: { count: 10, face: 6 },
        }, { random: createTavernBankSequenceRandom([]) });
        await waitUntil(() => observer.bank.lastGameOutcome.value?.sourceId === firstGameId);
        const firstOutcomeId = String(observer.bank.lastGameOutcome.value?.id || '');
        observer.bank.clearGameOutcome();
        assert.equal(observer.bank.lastGameOutcome.value, null);

        const secondStart = await startTavernBankDiceGame({
            ...await bankMutationHead(session.id),
            actionId: 'domain-sync-dice-start-2',
            bet: 50,
        }, { random: createTavernBankSequenceRandom([5, 4, 3, 2, 1, 0, 5, 4, 3, 2]) });
        const secondGameId = String(secondStart.actionRecord?.action.kind === 'dice-start'
            ? secondStart.actionRecord.action.gameId
            : '');
        await waitUntil(() => observer.bank.activeGame.value?.id === secondGameId);
        assert.equal(observer.bank.lastGameOutcome.value, null);

        await bidTavernBankDiceGame({
            ...await bankMutationHead(session.id),
            actionId: 'domain-sync-dice-end-2',
            gameId: secondGameId,
            bid: { count: 10, face: 6 },
        }, { random: createTavernBankSequenceRandom([]) });
        await waitUntil(() => observer.bank.lastGameOutcome.value?.sourceId === secondGameId);
        const outcome = observer.bank.lastGameOutcome.value;
        assert.ok(outcome && outcome.id !== firstOutcomeId);
        assert.equal(outcome.detail.kind, 'dice');
        if (outcome.detail.kind === 'dice') {
            assert.equal(outcome.detail.playerDice.length, 5);
            assert.equal(outcome.detail.dealerDice.length, 5);
            assert.deepEqual(outcome.detail.finalBid, { by: 'player', count: 10, face: 6 });
        }
    } finally {
        observer.scope.stop();
    }
});

test('Bank domain sync turns a remote turn advance into one automatic maturity settlement', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Bank turn settlement sync' });
    await ensureTavernEconomy(session.id);
    await appendTavernMessage(session.id, { role: 'user', content: '等待存单到期' });
    const selectedSessionId = ref(session.id);
    const firstToasts: string[] = [];
    const secondToasts: string[] = [];
    const lateToasts: string[] = [];
    const first = createSyncedBankObserver(selectedSessionId, (message) => {firstToasts.push(message);});
    const second = createSyncedBankObserver(selectedSessionId, (message) => {secondToasts.push(message);});
    let late: ReturnType<typeof createSyncedBankObserver> | null = null;
    try {
        await Promise.all([
            first.bank.refreshBank(),
            first.wallet.refreshWallet(),
            second.bank.refreshBank(),
            second.wallet.refreshWallet(),
        ]);
        await settleLiveQueries();
        await openTavernBankDeposit({
            ...await bankMutationHead(session.id),
            actionId: 'domain-sync-maturity-deposit',
            productId: 'short-term',
            amount: 100,
        });
        await waitUntil(() => first.bank.deposits.value.length === 1 && second.bank.deposits.value.length === 1);
        const record = await tavernSessionsTable.get(session.id);
        await tavernSessionsTable.update(session.id, {
            state: { ...(record?.state || {}), turn: 999 },
        });
        await waitUntil(() => (
            first.bank.deposits.value.length === 0
            && second.bank.deposits.value.length === 0
            && firstToasts.some((message) => /银行到账：短期存单 106 币/.test(message))
            && secondToasts.some((message) => /银行到账：短期存单 106 币/.test(message))
        ));
        const settlements = (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
            .filter((transaction) => transaction.kind === 'bank_settlement');
        assert.equal(settlements.length, 1);
        assert.equal(settlements[0].amount, 106);
        assert.equal(first.bank.actionError.value, '');
        assert.equal(second.bank.actionError.value, '');
        const firstNoticeCount = firstToasts.length;
        const secondNoticeCount = secondToasts.length;
        late = createSyncedBankObserver(selectedSessionId, (message) => {lateToasts.push(message);});
        await Promise.all([late.bank.refreshBank(), late.wallet.refreshWallet()]);
        await settleLiveQueries();
        const settledSession = await tavernSessionsTable.get(session.id);
        await tavernSessionsTable.update(session.id, {
            state: { ...(settledSession?.state || {}), turn: 1_000 },
        });
        await waitUntil(() => (
            first.bank.currentTurn.value === 1_000
            && second.bank.currentTurn.value === 1_000
            && late?.bank.currentTurn.value === 1_000
        ));
        assert.equal(firstToasts.length, firstNoticeCount);
        assert.equal(secondToasts.length, secondNoticeCount);
        assert.deepEqual(lateToasts, []);
    } finally {
        first.scope.stop();
        second.scope.stop();
        late?.scope.stop();
    }
});
