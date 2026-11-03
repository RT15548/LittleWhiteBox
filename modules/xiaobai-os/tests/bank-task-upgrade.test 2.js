import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { createBankService } from '../apps/bank/application/service.js';
import { createBankController } from '../apps/bank/host/controller.js';
import { BANK_PARTITION } from '../apps/bank/partition.js';
import { buildBankEconomyLegs } from '../apps/bank/application/economy-protocol.js';
import { createTasksService } from '../apps/tasks/application/service.js';
import { createTaskController } from '../apps/tasks/host/controller.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { upgradeLegacyTasks } from '../apps/tasks/upgrade/legacy-v1.js';
import { economyScope } from '../capabilities/economy/scope.js';
import { ensureEconomy, postAction } from '../domains/economy/ledger.js';
import { validateLegacyBankDomain } from '../domains/bank/invariants.js';
import { USER_DOCUMENT_FILENAME } from '../kernel/user-document.js';
import { userEconomyHarness } from './user-economy-harness.js';

const fixture = name => JSON.parse(readFileSync(fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)), 'utf8'));

function oldUserFile({ badBank = false, twoBanks = false, decliningTurns = false } = {}) {
    const bank = fixture('bank-v1.json');
    const tasks = fixture('tasks-v1.json');
    if (decliningTurns) {
        bank.events[0].assistantTurn = 100;
        bank.events[0].result.changes[0].position.startTurn = 100;
        bank.events[0].result.changes[0].position.maturityTurn = 110;
        const second = structuredClone(fixture('bank-v1.json').events[0]);
        second.revision = 2;
        second.eventId = 'bank-event-b';
        second.actionId = 'bank-action-b';
        second.command.positionId = 'bank-position-b';
        second.result.changes[0].position.id = 'bank-position-b';
        bank.events.push(second);
    }
    validateLegacyBankDomain(bank);
    const currentTask = upgradeLegacyTasks(tasks);
    assert.equal(currentTask.checks['task-a'].phase, 'pending');
    let serial = 0;
    const ids = { now: () => ++serial, createId: () => `ledger-${serial}` };
    let ledger = ensureEconomy(undefined, ids);
    const post = leg => {ledger = postAction(ledger, [leg], ids).ledger;};
    post({ idempotencyKey: 'grant', actionId: 'grant', sourceDomain: 'test', sourceId: 'grant',
        fromAccountId: 'system:mint', toAccountId: 'player', amount: 200,
        kind: 'test_grant', title: '测试充值' });
    if (twoBanks || decliningTurns) {post({ idempotencyKey: 'second-grant', actionId: 'second-grant',
        sourceDomain: 'test', sourceId: 'second-grant', fromAccountId: 'system:mint',
        toAccountId: 'player', amount: 100, kind: 'test_grant', title: '测试充值' });}
    for (const event of bank.events) {
        for (const leg of buildBankEconomyLegs(event)) {
            post(economyScope('a').qualify({ ...leg, sourceDomain: 'bank' }));
        }
    }
    if (twoBanks) {post(economyScope('b').qualify({ ...buildBankEconomyLegs(bank.events[0])[0], sourceDomain: 'bank' }));}
    post(economyScope('b').qualify({ idempotencyKey: 'tasks:event:task-event-a:funding',
        actionId: 'task-action-a', sourceDomain: 'tasks', sourceId: 'task-a',
        fromAccountId: 'player', toAccountId: 'escrow:task:task-a', amount: 50,
        kind: 'task_funding', title: '任务报酬托管' }));
    return {
        formatVersion: 1, revision: 1, commitId: 'old-user-file',
        partitions: { economy: ledger },
        stories: { a: { bank: badBank ? { ...bank, events: [{ broken: true }] } : bank },
            b: { tasks, ...(twoBanks ? { bank: structuredClone(bank) } : {}) } },
    };
}

test('production v1 bank matures at frozen value once, and an orphaned v1 commission refunds in its original scope', async () => {
    const files = new Map([[USER_DOCUMENT_FILENAME, oldUserFile()]]);
    const h = await userEconomyHarness({ files });
    await h.economy.refresh();
    assert.equal(h.economy.getPlayerBalance(), 150);
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    await bank.ensureReady();
    assert.equal(h.economy.getPlayerBalance(), 256);
    assert.equal(h.document().stories.a.bank, undefined);
    assert.equal(h.document().partitions.bank.history.length, 1);
    assert.equal((await bank.refreshCurrent()).activities[0].sourceStoryId, 'a');
    await bank.ensureReady();
    assert.equal(h.economy.getPlayerBalance(), 256);

    // Chat b need not exist in the host any longer; its user-file scope still owns the escrow.
    const tasks = createTasksService(h.store(TASKS_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    await tasks.ensureReady('new-story-baseline');
    assert.equal(h.document().stories.b.tasks.checks['task-a'].phase, 'pending');
    const commission = tasks.readCommission('b', 'task-a').record;
    await tasks.cancelCommission({ scopeId: 'b', taskId: 'task-a', actionId: 'cancel-once',
        expectedTaskRevision: commission.taskRevision, expectedEventId: commission.eventId });
    assert.equal(h.economy.getPlayerBalance(), 306);
    await tasks.cancelCommission({ scopeId: 'b', taskId: 'task-a', actionId: 'cancel-once',
        expectedTaskRevision: commission.taskRevision, expectedEventId: commission.eventId });
    assert.equal(h.economy.getPlayerBalance(), 306);
    assert.equal(h.document().stories.b.tasks.checks['task-a'], undefined);
    tasks.dispose();
    bank.dispose();
});

test('an unknown legacy task upgrade opens its own save recovery page and resumes initialization', async t => {
    const files = new Map([[USER_DOCUMENT_FILENAME, oldUserFile()]]);
    const h = await userEconomyHarness({ files });
    await h.economy.refresh();
    h.switchStory('b');
    const tasks = createTasksService(h.store(TASKS_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions, getEvidenceDigest: () => 'opening-baseline' });
    const posted = [];
    const controller = createTaskController({
        tasks, economy: h.economy,
        generation: { cancelAll() {} },
        settings: { read: () => null, subscribe: () => () => {} },
        maintenance: { getStatus: () => ({ state: 'idle', message: '', reason: '', mode: null, lastRunAt: null }),
            subscribeStatus: () => () => {} },
        getChatIdentity: () => h.state.capture.identityKey,
        isMainGenerationActive: () => false, subscribeGeneration: () => () => {}, report: () => {},
    });
    t.after(() => {controller.stopBackground(); tasks.dispose();});
    controller.startBackground();
    h.state.mode = 'unknown';
    const first = controller.activate({ post: (type, payload) => {posted.push({ type, payload });} });
    assert.equal(first.status, 'loading');
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(posted.findLast(item => item.type === 'tasks/state')?.payload.state.status, 'unconfirmed');
    h.state.mode = 'confirmed';
    const response = await controller.handleMessage({ type: 'tasks/save/confirm',
        payload: { chatIdentity: h.state.capture.identityKey } });
    assert.equal(response.confirmation, 'confirmed');
    await new Promise(resolve => setTimeout(resolve, 30));
    assert.equal(posted.findLast(item => item.type === 'tasks/state')?.payload.state.status, 'ready');
    assert.equal(h.document().stories.b.tasks.checks['task-a'].digest, 'opening-baseline');
});

test('two legacy stories with overlapping local bank IDs settle independently and retain their source', async () => {
    const h = await userEconomyHarness({ files: new Map([[USER_DOCUMENT_FILENAME, oldUserFile({ twoBanks: true })]]) });
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    await bank.ensureReady();
    const view = await bank.refreshCurrent();
    assert.equal(view.balance, 362);
    assert.deepEqual(view.activities.map(activity => activity.sourceStoryId).sort(), ['a', 'b']);
    assert.equal(h.document().stories.a.bank, undefined);
    assert.equal(h.document().stories.b.bank, undefined);
    bank.dispose();
});

test('a hidden-history drop in legacy turn count keeps both frozen deposits payable', async () => {
    const h = await userEconomyHarness({ files: new Map([[USER_DOCUMENT_FILENAME, oldUserFile({ decliningTurns: true })]]) });
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    await bank.ensureReady();
    const view = await bank.refreshCurrent();
    assert.equal(view.balance, 362);
    assert.equal(view.activities.length, 2);
    assert.equal(h.document().stories.a.bank, undefined);
    assert.equal(h.document().partitions.economy.transactions.filter(tx => tx.sourceId.startsWith('bank:upgrade:')).length, 4);
    bank.dispose();
});

test('invalid legacy bank prevents migration but leaves the valid wallet intact', async () => {
    const files = new Map([[USER_DOCUMENT_FILENAME, oldUserFile({ badBank: true })]]);
    const h = await userEconomyHarness({ files });
    await h.economy.refresh();
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    await assert.rejects(bank.ensureReady());
    assert.equal(h.economy.getPlayerBalance(), 150);
    assert.equal(h.document().stories.a.bank.events[0].broken, true);
    assert.equal(h.document().partitions.bank, undefined);
    bank.dispose();
});

test('definite failure does not mutate the wallet; a retry migrates once', async () => {
    const files = new Map([[USER_DOCUMENT_FILENAME, oldUserFile()]]);
    const h = await userEconomyHarness({ files });
    await h.economy.refresh();
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    h.state.mode = 'rejected';
    await assert.rejects(bank.ensureReady());
    assert.equal(h.economy.getPlayerBalance(), 150);
    assert.ok(h.document().stories.a.bank);
    h.state.mode = 'confirmed';
    await bank.ensureReady();
    assert.equal(h.economy.getPlayerBalance(), 256);
    bank.dispose();
});

test('unknown upload is confirmed before retrying migration and never pays a second time', async () => {
    for (const mode of ['unknown', 'written-unknown']) {
        const files = new Map([[USER_DOCUMENT_FILENAME, oldUserFile()]]);
        const h = await userEconomyHarness({ files });
        await h.economy.refresh();
        const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
            { userTransactions: h.transactions });
        h.state.mode = mode;
        if (mode === 'unknown') {
            await assert.rejects(bank.ensureReady());
            assert.equal(h.economy.getPlayerBalance(), 150);
            assert.ok(h.document().stories.a.bank);
            h.state.mode = 'confirmed';
            assert.equal((await h.transactions.retryPending()).status, 'confirmed');
        } else {
            await bank.ensureReady();
            assert.equal(h.transactions.hasPendingCommit(), false);
        }
        await bank.ensureReady();
        assert.equal(h.economy.getPlayerBalance(), 256);
        assert.equal(h.document().stories.a.bank, undefined);
        assert.equal(h.document().partitions.economy.transactions.filter(tx => tx.sourceId.startsWith('bank:upgrade:')).length, 2);
        bank.dispose();
    }
});

test('unknown bank upgrade remains confirmable in the page and pays the frozen contract once', async () => {
    const h = await userEconomyHarness({ files: new Map([[USER_DOCUMENT_FILENAME, oldUserFile()]]) });
    await h.economy.refresh();
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    const controller = createBankController({ bank, economy: h.economy });
    const pending = new Promise(resolve => {
        controller.activate({ post(type, payload) {
            if (type === 'bank/state' && ['blocked', 'unconfirmed'].includes(payload.state.status)) {
                resolve(payload.state);
            }
        } });
    });
    h.state.mode = 'unknown';
    const initial = await pending;
    assert.equal(initial.status, 'unconfirmed');
    assert.equal(h.transactions.getFileState(), 'unconfirmed');
    h.state.mode = 'confirmed';
    const confirmed = await controller.handleMessage({ type: 'bank/confirm-save',
        payload: { chatIdentity: 'user' } });
    assert.equal(confirmed.state.status, 'ready');
    assert.equal(confirmed.state.balance, 256);
    assert.equal(h.document().stories.a.bank, undefined);
    await bank.ensureReady();
    assert.equal(h.economy.getPlayerBalance(), 256);
    controller.stopBackground();
    bank.dispose();
});

test('one global bank turn clock survives card switches and buffers definite and unknown save failures', async () => {
    const h = await userEconomyHarness();
    await h.economy.refresh();
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy);
    const initial = await bank.refreshCurrent();
    await bank.openDeposit({ actionId: 'open-global', expectedRevision: initial.revision,
        expectedEventId: initial.eventId, productId: 'short-term', amount: 100 });
    await bank.advanceTurns(5);
    h.switchStory('b');
    await bank.advanceTurns(3);
    assert.equal(bank.readCurrent().currentTurn, 8);
    h.state.mode = 'rejected';
    await assert.rejects(bank.advanceTurns(1));
    await bank.advanceTurns(1);
    assert.equal(bank.readCurrent().unsavedTurns, 2);
    assert.equal(bank.readCurrent().currentTurn, 8);
    const view = bank.readCurrent();
    await assert.rejects(bank.openDeposit({ actionId: 'cannot-overtake-clock', expectedRevision: view.revision,
        expectedEventId: view.eventId, productId: 'short-term', amount: 100 }),
    error => error.code === 'bank_turns_unsaved');
    h.state.mode = 'confirmed';
    await bank.confirmPending();
    assert.equal(bank.readCurrent().currentTurn, 10);
    assert.equal(bank.readCurrent().unsavedTurns, 0);
    assert.equal(bank.readCurrent().deposits[0].claimable, true);
    h.state.mode = 'unknown';
    await assert.rejects(bank.advanceTurns(1));
    await bank.advanceTurns(1);
    assert.equal(bank.readCurrent().unsavedTurns, 2);
    h.state.mode = 'confirmed';
    await bank.confirmPending();
    assert.equal(bank.readCurrent().currentTurn, 12);
    assert.equal(bank.readCurrent().unsavedTurns, 0);
    const matured = await bank.settleDue({ actionId: 'claim-global', expectedRevision: view.revision,
        expectedEventId: view.eventId });
    assert.equal(matured.balance, 106);
    assert.equal(matured.deposits.length, 0);
    bank.dispose();
});

test('an old active task takes its first evidence baseline only in its own chat', async () => {
    const files = new Map([[USER_DOCUMENT_FILENAME, oldUserFile()]]);
    const h = await userEconomyHarness({ files });
    await h.economy.refresh();
    const tasks = createTasksService(h.store(TASKS_PARTITION), h.transactions, h.economy,
        { userTransactions: h.transactions });
    await tasks.ensureReady('wrong-chat', 'chat-a');
    assert.equal(h.document().stories.b.tasks.checks['task-a'].phase, 'pending');
    h.switchStory('b');
    await tasks.ensureReady('own-existing-story', 'chat-b');
    assert.deepEqual(h.document().stories.b.tasks.checks['task-a'], {
        taskRevision: 3, phase: 'baseline', digest: 'own-existing-story',
    });
    await tasks.ensureReady('later-story', 'chat-b');
    assert.equal(h.document().stories.b.tasks.checks['task-a'].digest, 'own-existing-story');
    tasks.dispose();
});
