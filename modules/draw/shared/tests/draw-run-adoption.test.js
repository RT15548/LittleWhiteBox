import assert from 'node:assert/strict';
import test from 'node:test';

import { adoptExistingJobFromDrawRun } from '../draw-run-adoption.js';
import { deriveDrawRunChildJobId, deriveDrawRunItemIds } from '../draw-run-identifiers.js';
import { PendingImageJobLostError, PendingJobAdoptionPhase, PendingJobState } from '../pending-image-jobs.js';
import { hashSceneSource, normalizeMessageSceneSourceText } from '../scene-source.js';

const RUN_ID = 'run-test-401';
const SOURCE = 'Alpha. Beta.';
const CHAT_TARGET = {
    kind: 'character',
    chatId: 'chat-1',
    endpoint: '/api/chats/get',
    body: { ch_name: 'Alice', file_name: 'chat-1', avatar_url: 'alice.png' },
};

function fixture() {
    const sourceHash = hashSceneSource(normalizeMessageSceneSourceText(SOURCE));
    const ids = deriveDrawRunItemIds(RUN_ID, 0);
    const marker = { version: 1, provider: 'novelai', sourceHash, createdAt: 100 };
    const run = {
        id: RUN_ID,
        state: 'dispatched',
        provider: 'novelai',
        sourceHash,
        handoffManifest: {
            childJobId: deriveDrawRunChildJobId(RUN_ID),
            provider: 'novelai',
            sourceHash,
            placementContract: 1,
            items: [{ index: 0, ...ids, insertOffset: 6, displayMetadata: { tags: 'scene' } }],
        },
    };
    const message = {
        name: 'Alice',
        mes: SOURCE,
        swipe_id: 0,
        swipes: [SOURCE],
    };
    const target = {
        runId: RUN_ID,
        marker,
        message,
        messageId: 4,
        swipeIndex: 0,
        chatId: 'chat-1',
    };
    return { ids, marker, message, run, target };
}

function createJournal(initialRecord = null) {
    const store = new Map();
    if (initialRecord) store.set(initialRecord.jobId, initialRecord);
    let leaseCounter = 0;
    const journal = {
        store,
        async get(jobId) { return store.get(jobId) || null; },
        async create(record) {
            if (store.has(record.jobId)) return null;
            const created = {
                ...record,
                leaseId: `lease-${++leaseCounter}`,
                leaseExpiresAt: 1_000,
                state: PendingJobState.ADOPTING,
                adoptionPhase: PendingJobAdoptionPhase.PENDING,
            };
            store.set(created.jobId, created);
            return created;
        },
        async claim(jobId) {
            const current = store.get(jobId);
            if (!current || current.leaseExpiresAt > 0) return null;
            const claimed = { ...current, leaseId: `lease-${++leaseCounter}`, leaseExpiresAt: 1_000 };
            store.set(jobId, claimed);
            return claimed;
        },
        async fence(jobId, leaseId) {
            const current = store.get(jobId);
            if (!current || current.leaseId !== leaseId) {
                throw new PendingImageJobLostError(jobId, '所有权已变化');
            }
            return current;
        },
        async markPlacing(jobId, leaseId) {
            const current = await journal.fence(jobId, leaseId);
            const updated = { ...current, adoptionPhase: PendingJobAdoptionPhase.PLACING };
            store.set(jobId, updated);
            return updated;
        },
        async markReady(jobId, leaseId, delivery) {
            const current = await journal.fence(jobId, leaseId);
            const updated = {
                ...current,
                delivery,
                adoptionPhase: PendingJobAdoptionPhase.READY,
            };
            store.set(jobId, updated);
            return updated;
        },
        async release(jobId, leaseId) {
            const current = await journal.fence(jobId, leaseId);
            const updated = { ...current, leaseExpiresAt: 0 };
            store.set(jobId, updated);
            return updated;
        },
    };
    return journal;
}

test('a dispatched child persists its slots before becoming an active image journal', async () => {
    const { ids, marker, message, run, target } = fixture();
    const journal = createJournal();
    let confirmedText = '';
    let renderedAfterSave = false;
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal,
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        confirmSlots({ slotIds }) {
            confirmedText = message.mes;
            assert.deepEqual(slotIds, [ids.slotId]);
        },
        syncSlots() { renderedAfterSave = Boolean(confirmedText); },
    });

    assert.equal(result.status, 'ready');
    assert.equal(result.delivery, 'slots');
    assert.match(confirmedText, new RegExp(`\\[image:${ids.slotId}\\]`));
    assert.deepEqual(result.record.delivery, {
        mode: 'slots', chatId: 'chat-1', messageId: '4', swipeIndex: 0,
    });
    assert.equal(result.record.adoptionPhase, PendingJobAdoptionPhase.READY);
    assert.equal(renderedAfterSave, true);
});

test('source edits switch child delivery to gallery without touching the edited message', async () => {
    const { marker, message, run, target } = fixture();
    message.mes = 'User edited this text.';
    message.swipes[0] = message.mes;
    const journal = createJournal();
    let confirmCalled = false;
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal,
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        confirmSlots() { confirmCalled = true; },
    });

    assert.equal(result.status, 'ready');
    assert.equal(result.delivery, 'gallery');
    assert.deepEqual(result.record.delivery, { mode: 'gallery', reason: 'source_changed' });
    assert.equal(message.mes, 'User edited this text.');
    assert.equal(confirmCalled, false);
});

test('a placing record recovered without persisted slots never resurrects them', async () => {
    const { marker, message, run, target } = fixture();
    const childJobId = deriveDrawRunChildJobId(RUN_ID);
    const journal = createJournal({
        jobId: childJobId,
        provider: 'novelai',
        originRunId: RUN_ID,
        chatTarget: CHAT_TARGET,
        sourceHash: run.sourceHash,
        leaseId: 'expired-lease',
        leaseExpiresAt: 0,
        state: PendingJobState.ADOPTING,
        adoptionPhase: PendingJobAdoptionPhase.PLACING,
        delivery: { mode: 'slots', chatId: 'chat-1', messageId: '4' },
        items: run.handoffManifest.items,
    });
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal,
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        confirmSlots() { throw new Error('placing recovery must not insert or save slots'); },
    });

    assert.equal(result.delivery, 'gallery');
    assert.equal(message.mes, SOURCE);
});

test('editing waits before creating an adoption journal', async () => {
    const { marker, run, target } = fixture();
    const journal = createJournal();
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal,
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        isMessageBeingEdited: () => true,
        confirmSlots() {},
    });

    assert.deepEqual(result, { status: 'wait', reason: 'message_editing', owned: false });
    assert.equal(journal.store.size, 0);
});

test('an expired child still adopts its retained manifest for visible first-knife settlement', async () => {
    const { marker, run, target } = fixture();
    run.state = 'child_expired';
    const journal = createJournal();
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal,
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        confirmSlots() {},
    });
    assert.equal(result.status, 'ready');
    assert.equal(result.delivery, 'slots');
});

test('a child cancelled after dispatch enters the first-knife cancellation settlement path', async () => {
    const { marker, run, target } = fixture();
    run.cancelRequestedAt = 200;
    const journal = createJournal();
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal,
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        confirmSlots() {},
    });
    assert.equal(result.status, 'ready');
    assert.equal(result.record.cancelRequested, true);
    assert.equal(result.record.state, PendingJobState.ADOPTING);
});

test('a null cancel timestamp does not turn a normal child into cancellation', async () => {
    const { marker, run, target } = fixture();
    run.cancelRequestedAt = null;
    const result = await adoptExistingJobFromDrawRun({
        run,
        marker,
        journal: createJournal(),
        chatTarget: CHAT_TARGET,
        now: () => 0,
        resolveTarget: () => target,
        confirmSlots() {},
    });
    assert.equal(result.record.cancelRequested, false);
});
