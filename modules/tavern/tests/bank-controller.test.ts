import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { computed, effectScope, nextTick, ref, type Ref } from 'vue';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    appendTavernMessage,
    createTavernSession,
    tavernBankActivitiesTable,
    tavernSessionsTable,
    tavernEconomyTransactionsTable,
    tavernBankStateVersionsTable,
} from '../shared/session-db';
import { ensureTavernEconomy } from '../shared/economy/economy-service';
import { useTavernBankController } from '../app-src/features/phone-os/apps/bank/useTavernBankController';
import { tavernBankUiError } from '../app-src/features/phone-os/apps/bank/tavern-bank-errors';
import { TavernBankError } from '../shared/bank/bank-types';
import {
    isAcceptedRollbackInProgress,
    withAcceptedRollbackGate,
} from '../app-src/features/accepted-rollback/accepted-rollback';

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    const promise = new Promise<T>((resolvePromise) => {resolve = resolvePromise;});
    return { promise, resolve };
}

function createController(input: {
    selectedSessionId: Ref<string>;
    refreshWallet?: () => void | Promise<void>;
    memoryEditorMode?: Ref<'preview' | 'edit'>;
    characterArchiveBusy?: Ref<boolean>;
    acceptedRollbackBusy?: Ref<boolean>;
    showToast?: (message: string, options?: { tone?: 'info' | 'warning'; durationMs?: number }) => void;
}) {
    const scope = effectScope();
    const archiveBusy = input.characterArchiveBusy || ref(false);
    const rollbackBusy = input.acceptedRollbackBusy || ref(false);
    const controller = scope.run(() => useTavernBankController({
        selectedSessionId: input.selectedSessionId,
        memoryEditorMode: input.memoryEditorMode || ref<'preview' | 'edit'>('preview'),
        characterArchiveBusy: computed(() => archiveBusy.value),
        acceptedRollbackBusy: computed(() => rollbackBusy.value),
        wallet: {
            refreshAfterEconomyDomainChange: input.refreshWallet || (() => {}),
        },
        showToast: input.showToast,
    }));
    if (!controller) {throw new Error('bank_controller_scope_missing');}
    return { controller, scope };
}

async function seedBankSession(title: string) {
    const session = await createTavernSession({ title });
    await ensureTavernEconomy(session.id);
    await appendTavernMessage(session.id, { role: 'user', content: '走进小白银行' });
    return session;
}

test('bank UI treats an anchor regression as a timeline conflict that requires refresh', () => {
    const error = tavernBankUiError(new TavernBankError('bank_anchor_order_regression'));
    assert.equal(error.kind, 'timeline');
    assert.match(error.message, /金库已刷新/);
});

test('bank controller turns a rapid double deposit into one committed action', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller double click');
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.prepareBank();
        const [first, second] = await Promise.all([
            controller.openDeposit('short-term', 100),
            controller.openDeposit('short-term', 100),
        ]);
        assert.ok(first);
        assert.equal(second, null);
        assert.equal(controller.deposits.value.length, 1);
        assert.equal(
            (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
                .filter((transaction) => transaction.kind === 'bank_deposit_lock').length,
            1,
        );
    } finally {
        scope.stop();
    }
});

test('bank controller surfaces an insufficient balance without writing a version', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller insufficient');
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.prepareBank();
        assert.equal(await controller.openDeposit('short-term', 200), null);
        assert.match(controller.actionError.value, /余额不足/);
        assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 0);
        assert.equal(
            (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
                .filter((transaction) => transaction.kind === 'bank_deposit_lock').length,
            0,
        );
    } finally {
        scope.stop();
    }
});

test('bank controller accepts the null phone boundary before a session has any messages', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Bank controller empty timeline' });
    await ensureTavernEconomy(session.id);
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.prepareBank();
        const result = await controller.openDeposit('short-term', 100);
        assert.ok(result);
        assert.equal(controller.deposits.value.length, 1);
        assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
    } finally {
        scope.stop();
    }
});

test('bank controller closes the accepted-rollback gate even when it changes during boundary capture', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller accepted rollback');
    const selectedSessionId = ref(session.id);
    const acceptedRollbackBusy = computed(() => isAcceptedRollbackInProgress(session.id));
    const { controller, scope } = createController({ selectedSessionId, acceptedRollbackBusy });
    const releaseRollback = deferred<void>();
    try {
        await controller.prepareBank();
        const pendingDeposit = controller.openDeposit('short-term', 100);
        const rollback = withAcceptedRollbackGate(session.id, async () => {
            await releaseRollback.promise;
        });
        await nextTick();
        assert.equal(await pendingDeposit, null);
        assert.match(controller.actionError.value, /剧情楼层正在回滚/);
        assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 0);
        assert.equal(await controller.openDeposit('short-term', 100), null);
        releaseRollback.resolve();
        await rollback;
        await nextTick();
        assert.ok(await controller.openDeposit('short-term', 100));
    } finally {
        releaseRollback.resolve();
        scope.stop();
    }
});

test('bank controller blocks and rechecks the memory-editor gate around the async boundary', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller memory editing');
    const selectedSessionId = ref(session.id);
    const memoryEditorMode = ref<'preview' | 'edit'>('preview');
    const { controller, scope } = createController({ selectedSessionId, memoryEditorMode });
    try {
        await controller.prepareBank();
        // Gate closes before the action even starts.
        memoryEditorMode.value = 'edit';
        assert.equal(await controller.openDeposit('short-term', 100), null);
        assert.match(controller.actionError.value, /记忆编辑/);
        assert.equal(await tavernBankStateVersionsTable.where('sessionId').equals(session.id).count(), 0);
        // Gate reopens: the same action now commits.
        memoryEditorMode.value = 'preview';
        assert.ok(await controller.openDeposit('short-term', 100));
        assert.equal(controller.deposits.value.length, 1);
    } finally {
        scope.stop();
    }
});

test('bank controller auto-settles a matured deposit when the vault is reopened', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller auto settle');
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.prepareBank();
        assert.ok(await controller.openDeposit('short-term', 100));
        assert.equal(controller.deposits.value.length, 1);
        // Advance the main-turn clock past the 10-round lock, then reopen the vault:
        // settlement must fire from the production open path, not only as a mutation side-effect.
        const record = await tavernSessionsTable.get(session.id);
        await tavernSessionsTable.update(session.id, { state: { ...(record?.state || {}), turn: 999 } });
        await controller.prepareBank();
        assert.equal(controller.deposits.value.length, 0);
        const settlements = (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
            .filter((transaction) => transaction.kind === 'bank_settlement');
        assert.equal(settlements.length, 1);
        assert.equal(settlements[0].amount, 106);
    } finally {
        scope.stop();
    }
});

test('bank controller reports a committed deposit even when wallet refresh fails', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller refresh failure');
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({
        selectedSessionId,
        refreshWallet: async () => {throw new Error('wallet_refresh_failed');},
    });
    try {
        await controller.prepareBank();
        const result = await controller.openDeposit('short-term', 100);
        assert.ok(result);
        assert.equal(controller.actionError.value, '');
        assert.match(controller.status.value, /钱包显示刷新失败/);
        assert.equal(controller.deposits.value.length, 1);
    } finally {
        scope.stop();
    }
});

test('a late deposit result from the previous session is discarded by its mutation owner', async () => {
    await db.delete();
    await db.open();
    const firstSession = await seedBankSession('Bank controller old session');
    const secondSession = await seedBankSession('Bank controller new session');
    const selectedSessionId = ref(firstSession.id);
    const { controller, scope } = createController({ selectedSessionId });
    const table = tavernBankStateVersionsTable as unknown as {
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
        await controller.prepareBank();
        const deposit = controller.openDeposit('short-term', 100);
        await writeStarted.promise;
        selectedSessionId.value = secondSession.id;
        await nextTick();
        releaseWrite.resolve();
        assert.equal(await deposit, null);
        assert.equal(controller.deposits.value.length, 0);
        await controller.refreshBank();
        assert.equal(controller.deposits.value.length, 0);
    } finally {
        table.add = originalAdd;
        releaseWrite.resolve();
        scope.stop();
    }
});

test('switching sessions during the post-commit Bank refresh suppresses the old toast and wallet refresh', async () => {
    await db.delete();
    await db.open();
    const firstSession = await seedBankSession('Bank controller refresh owner old');
    const secondSession = await seedBankSession('Bank controller refresh owner new');
    const selectedSessionId = ref(firstSession.id);
    const toasts: string[] = [];
    let walletRefreshes = 0;
    const { controller, scope } = createController({
        selectedSessionId,
        refreshWallet: () => {walletRefreshes += 1;},
        showToast: (message) => {toasts.push(message);},
    });
    type TestCollection = { toArray(): Promise<unknown[]> };
    type TestWhereClause = { equals(key: unknown): TestCollection };
    const table = tavernBankStateVersionsTable as unknown as {
        where(index: string): TestWhereClause;
    };
    const originalWhere = table.where.bind(table);
    const refreshStarted = deferred<void>();
    const releaseRefresh = deferred<void>();
    let currentMarkerReads = 0;
    try {
        await controller.prepareBank();
        table.where = (index: string) => {
            const clause = originalWhere(index);
            if (index !== '[sessionId+currentMarker]') {return clause;}
            const originalEquals = clause.equals.bind(clause);
            clause.equals = (key: unknown) => {
                const collection = originalEquals(key);
                const originalToArray = collection.toArray.bind(collection);
                collection.toArray = async () => {
                    currentMarkerReads += 1;
                    if (currentMarkerReads === 2) {
                        refreshStarted.resolve();
                        await releaseRefresh.promise;
                    }
                    return await originalToArray();
                };
                return collection;
            };
            return clause;
        };
        const deposit = controller.openDeposit('short-term', 100);
        await refreshStarted.promise;
        selectedSessionId.value = secondSession.id;
        await nextTick();
        releaseRefresh.resolve();
        assert.equal(await deposit, null);
        assert.deepEqual(toasts, []);
        assert.equal(walletRefreshes, 0);
        assert.equal(controller.deposits.value.length, 0);
        table.where = originalWhere;
        assert.equal((await tavernBankStateVersionsTable.where('sessionId').equals(firstSession.id).toArray()).length, 1);
    } finally {
        table.where = originalWhere;
        releaseRefresh.resolve();
        scope.stop();
    }
});

test('two Bank controllers racing the same automatic settlement converge without an error', async () => {
    await db.delete();
    await db.open();
    const session = await seedBankSession('Bank controller settlement race');
    const selectedSessionId = ref(session.id);
    const first = createController({ selectedSessionId });
    const second = createController({ selectedSessionId });
    try {
        await Promise.all([first.controller.prepareBank(), second.controller.prepareBank()]);
        assert.ok(await first.controller.openDeposit('short-term', 100));
        const record = await tavernSessionsTable.get(session.id);
        await tavernSessionsTable.update(session.id, { state: { ...(record?.state || {}), turn: 999 } });
        await Promise.all([first.controller.prepareBank(), second.controller.prepareBank()]);
        assert.equal(first.controller.actionError.value, '');
        assert.equal(second.controller.actionError.value, '');
        assert.equal(first.controller.deposits.value.length, 0);
        assert.equal(second.controller.deposits.value.length, 0);
        const settlements = (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
            .filter((transaction) => transaction.kind === 'bank_settlement');
        assert.equal(settlements.length, 1);
        assert.equal(await tavernBankActivitiesTable.where('sessionId').equals(session.id).count(), 1);
    } finally {
        first.scope.stop();
        second.scope.stop();
    }
});
