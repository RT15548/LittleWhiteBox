import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers/promises';
import { startSaveRecovery } from '../host/save-recovery.js';
import { userEconomyHarness } from './user-economy-harness.js';
import { createChatReferencePort } from '../storage/chat-reference.js';
import { createChatBindingManager } from '../storage/chat-binding.js';
import { createSidecarIndex } from '../storage/sidecar-index.js';
import { createUserStoryResolver } from '../host/user-story.js';
import { createDiceSheetService } from '../apps/dice/application/sheet-service.js';
import { generateCoc7Sheet } from '../apps/dice/domain/coc7-creation.js';
import { DICE_PARTITION } from '../apps/dice/partition.js';
import { BANK_PARTITION } from '../apps/bank/partition.js';
import { createBankService } from '../apps/bank/application/service.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { createTasksService } from '../apps/tasks/application/service.js';
import { USER_DOCUMENT_FILENAME } from '../kernel/user-document.js';

test('automatic user-document recovery settles one bank payment without repeating the debit', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const h = await userEconomyHarness(); await h.economy.refresh();
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy);
    t.after(bank.dispose);
    const initial = await bank.refreshCurrent();
    const stop = startSaveRecovery(h.transactions); t.after(stop);
    h.state.mode = 'unknown';
    await assert.rejects(bank.openDeposit({ actionId: 'one-deposit', expectedRevision: initial.revision,
        expectedEventId: initial.eventId, productId: 'short-term', amount: 100 }));
    const candidate = h.state.writes.at(-1);
    h.state.mode = 'confirmed';
    t.mock.timers.tick(2_000);
    await setImmediate();
    assert.equal(h.transactions.getFileState(), 'ready');
    assert.deepEqual(h.state.writes.at(-1), candidate);
    assert.equal(bank.readCurrent().deposits.length, 1);
    assert.equal(h.economy.getPlayerBalance(), 0);
    const writes = h.state.writes.length;
    t.mock.timers.tick(60_000);
    await setImmediate();
    assert.equal(h.state.writes.length, writes);
});

test('only an opted-in candidate can be abandoned, and an old abort cannot release another owner', async () => {
    const h = await userEconomyHarness(); await h.economy.refresh();
    const finished = new AbortController();
    const settled = [];
    await h.store(DICE_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()),
        { signal: finished.signal, abandonOnAbort: true, onSettled: status => settled.push(status) });
    const recoverable = new AbortController();
    h.state.mode = 'unknown';
    const saved = await h.store(BANK_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()), { signal: recoverable.signal });
    assert.equal(saved.status, 'unconfirmed');
    finished.abort(); recoverable.abort();
    const blocked = await h.store(DICE_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()));
    assert.equal(blocked.error.code, 'storage_unconfirmed');
    assert.equal(h.transactions.hasPendingCommit(BANK_PARTITION.key), true);
    assert.deepEqual(settled, ['confirmed']);
});

// Real reference and binding owners, with failures only at the host persistence boundary.
function storyFixture() {
    const state = { current: { identityKey: 'chat-a', binding: { kind: 'character', ownerLocator: 'a.png', chatId: 'a' }, metadata: {} },
        persisted: null, rejectSave: true, installs: [] };
    const files = new Map();
    const metadata = {
        capture: () => state.current,
        read: async () => structuredClone(state.persisted),
        async save(capture) {
            if (state.rejectSave) { throw new Error('connection lost'); }
            state.persisted = structuredClone(capture.metadata);
        },
    };
    const references = createChatReferencePort(metadata);
    let serial = 0;
    const manager = createChatBindingManager({ metadata, references,
        createId: () => `story-${++serial}`,
        storage: { read: async id => structuredClone(files.get(id) ?? null),
            replace: async ({ candidate }) => { files.set(candidate.osId, structuredClone(candidate)); return { status: 'confirmed' }; },
            delete: async id => files.delete(id) ? 'deleted' : 'missing' },
        index: createSidecarIndex({ read: async name => files.get(name) ?? null, replace: async (name, value) => { files.set(name, value); } }),
    });
    const resolveStory = createUserStoryResolver({ ready: async () => {}, references, manager,
        install: async envelope => { state.installs.push(envelope); } });
    return { state, references, manager, files, resolveStory };
}

test('global bank trades without creating or waiting for a chat reference', async t => {
    const story = storyFixture();
    const h = await userEconomyHarness(story);
    await h.economy.refresh();
    const bank = createBankService(h.store(BANK_PARTITION), h.transactions, h.economy);
    t.after(bank.dispose);
    const empty = await bank.refreshCurrent();
    const saved = await bank.openDeposit({ actionId: 'deposit', expectedRevision: empty.revision,
        expectedEventId: empty.eventId, productId: 'short-term', amount: 100 });
    assert.equal(saved.deposits.length, 1);
    assert.equal(h.economy.getPlayerBalance(), 0);
    assert.deepEqual(h.document().stories, {});
    assert.equal(story.state.persisted, null);
    assert.equal((await bank.refreshCurrent()).deposits.length, 1);
});

test('a reference pending in the chat coordinator cannot bypass financial confirmation either', async () => {
    const story = storyFixture();
    const capture = story.references.capture();
    const reference = { formatVersion: 1, osId: 'chat-owned' };
    story.files.set(reference.osId, { formatVersion: 1, osId: reference.osId, binding: capture.binding,
        revision: 0, commitId: 'chat-created', partitions: {} });
    assert.equal((await story.references.install(capture, reference)).status, 'unconfirmed');
    await assert.rejects(story.resolveStory(true), { code: 'storage_unconfirmed' });
    story.state.rejectSave = false;
    assert.deepEqual((await story.resolveStory(true)).reference, reference);
    assert.deepEqual(story.state.persisted.extensions.LittleWhiteBox.xiaobaiOsRef, reference);
});

test('another page payment survives both explicit refresh and a save from an old page', async t => {
    for (const refreshFirst of [false, true]) { await t.test(String(refreshFirst), async () => {
        const first = await userEconomyHarness();
        const sheet = generateCoc7Sheet();
        const firstSheets = createDiceSheetService(first.store(DICE_PARTITION), first.transactions);
        await firstSheets.save(sheet, () => true);
        const second = await userEconomyHarness({ files: first.state.files });
        await createDiceSheetService(second.store(DICE_PARTITION), second.transactions).save(null, () => true);
        if (refreshFirst) { await first.economy.refresh(); assert.equal(first.economy.getPlayerBalance(), 0); }
        await firstSheets.save(sheet, () => true);
        assert.equal(first.economy.getPlayerBalance(), 0);
        assert.equal(first.document().partitions.economy.transactions.length, 2);
        assert.deepEqual(firstSheets.read(), sheet);
    }); }
});

test('a server change during candidate preparation conflicts without an upload; adoption keeps all saved business together', async () => {
    const first = await userEconomyHarness();
    const sheet = generateCoc7Sheet();
    await createDiceSheetService(first.store(DICE_PARTITION), first.transactions).save(sheet, () => true);
    const second = await userEconomyHarness({ files: first.state.files });
    const writes = first.state.writes.length;
    const result = await first.store(DICE_PARTITION).transact(async tx => {
        tx.replace({ sheet });
        await createDiceSheetService(second.store(DICE_PARTITION), second.transactions).save(null, () => true);
    });
    assert.equal(result.status, 'conflict');
    assert.equal(first.state.writes.length, writes);
    assert.equal((await first.transactions.retryPending()).status, 'conflict');
    assert.equal((await first.transactions.adoptServerState()).status, 'adopted');
    assert.equal(first.economy.getPlayerBalance(), 0);
    assert.equal(first.store(DICE_PARTITION).peekCurrent().value.sheet, null);
});

test('task retry preserves its original evidence guard, while readback can confirm an already saved reward', async t => {
    for (const saved of [false, true]) { await t.test(String(saved), async t => {
        const h = await userEconomyHarness();
        const tasks = createTasksService(h.store(TASKS_PARTITION), h.transactions, h.economy,
            { getEvidenceDigest: () => 'accepted-story' });
        t.after(tasks.dispose);
        const board = await tasks.replaceBoard({ expectedBoardId: null, generatedAt: 10, listings: [{
            grade: 'B', tags: ['禁忌', '旧城'], posture: '中介入', title: '送信', hook: '一封信需要送达。',
            objective: '把信交给守卫', requirements: '不得拆封', location: '钟楼', timing: '任意时候', risk: '巡逻', reward: 150,
        }] }, () => true);
        const accepted = await tasks.acceptListing({ actionId: 'accept', boardId: board.view.domain.board.boardId,
            listingId: board.view.domain.board.listings[0].listingId }, () => true);
        let evidenceValid = true;
        h.state.mode = 'unknown';
        await assert.rejects(tasks.commitMaintenance({ checkedTasks: [{ taskId: accepted.record.taskId,
            expectedTaskRevision: accepted.record.taskRevision, expectedEventId: accepted.record.eventId }],
            evidenceDigest: 'new-story', commands: [{
            kind: 'complete', actionId: 'complete', taskId: accepted.record.taskId,
            expectedTaskRevision: accepted.record.taskRevision, expectedEventId: accepted.record.eventId, resultSummary: '已送达',
        }] }, () => evidenceValid), { code: 'storage_unconfirmed' });
        const candidate = structuredClone(h.state.writes.at(-1));
        const writes = h.state.writes.length;
        if (saved) { h.state.files.set(USER_DOCUMENT_FILENAME, candidate); }
        evidenceValid = false;
        h.state.mode = 'confirmed';
        const recovery = await h.transactions.retryPending({ beforeRetry: () => true });
        assert.equal(h.state.writes.length, writes);
        assert.equal(recovery.status, saved ? 'confirmed' : 'failed');
        if (!saved) {
            assert.equal(recovery.error.code, 'commit_guard_rejected');
            assert.equal(h.transactions.hasPendingCommit(), true);
            assert.equal((await h.transactions.adoptServerState()).status, 'adopted');
        }
        assert.equal(h.economy.getPlayerBalance(), saved ? 250 : 100);
        assert.equal(tasks.readCurrent().records[0].status, saved ? 'completed' : 'active');
    }); }
});
