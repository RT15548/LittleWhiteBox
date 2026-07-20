import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, effectScope, ref } from 'vue';

import db, {
    createTavernManagerRun,
    createTavernSession,
    touchRunningTavernManagerRun,
} from '../shared/session-db';
import {
    ensureTavernEconomy,
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import { replaceTavernTaskBoard } from '../shared/tasks/task-board';
import type { TavernTaskListing } from '../shared/tasks/task-types';
import { useTavernTasksController } from '../app-src/features/phone-os/apps/tasks/useTavernTasksController';
import { useTavernWalletController } from '../app-src/features/phone-os/apps/wallet/useTavernWalletController';
import { useTavernPhoneDomainSync } from '../app-src/features/phone-os/useTavernPhoneDomainSync';

function taskListings(): TavernTaskListing[] {
    return (['E', 'D', 'C', 'B', 'A', 'S'] as const).map((grade, index) => ({
        id: `domain-sync-listing-${index}`,
        grade,
        tags: ['同步'],
        title: `跨标签委托 ${index}`,
        issuer: {
            id: `domain-sync-issuer-${index}`,
            name: `委托人 ${index}`,
            description: '用于验证跨标签任务板刷新。',
        },
        hook: '新的委托已经送达。',
        objective: '验证另一个页面能看到已提交的任务事实。',
        location: '测试区',
        risk: '无',
        reward: [10, 25, 60, 180, 400, 900][index],
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
            onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
        });
        useTavernPhoneDomainSync({
            selectedSessionId,
            onTasksChanged: tasks.refreshAfterTaskDomainChange,
            onEconomyChanged: wallet.refreshAfterEconomyDomainChange,
        });
        return { tasks, wallet };
    });
    if (!observer) {throw new Error('phone_domain_sync_scope_missing');}

    try {
        await Promise.all([
            observer.tasks.refreshTaskData(),
            observer.wallet.refreshWallet(),
        ]);
        await settleLiveQueries();
        assert.equal(observer.tasks.board.value, null);
        assert.equal(observer.wallet.balance.value, 100);
        assert.equal(observer.wallet.transactions.value.length, 1);

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
    } finally {
        scope.stop();
    }
});
