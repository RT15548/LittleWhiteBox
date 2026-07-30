import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    appendTavernMessage,
    branchTavernSession,
    commitTavernLatestAssistantReroll,
    deleteTavernSession,
    tavernCommunicationContactsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernMessagesTable,
    tavernPetActionsTable,
    tavernPetCompanionTable,
    tavernPetJournalTable,
    tavernSessionsTable,
} from '../shared/session-db';
import {
    getTavernPlayerBalance,
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import { restoreTavernAcceptedEconomicStateToFloor } from '../shared/accepted-economic-state';
import {
    canonicalTavernPetStaticVerdict,
    renderTavernPetInterferenceText,
    TAVERN_PET_STATIC_VERDICTS,
} from '../shared/pet/pet-copy';
import { TAVERN_PET_JUVENILE_PROFILE } from '../shared/pet/pet-personas';
import { buildTavernPetRuntimeDepthEntries } from '../shared/pet/pet-prompt';
import { createTavernPetSequenceRandomSource } from '../shared/pet/pet-random';
import {
    appendTavernPetTransitionInCurrentDbTransaction,
    commitTavernPetChatResponse,
    getCurrentTavernPetView,
    getTavernPetCompanionInCurrentDbTransaction,
    getTavernPetPendingEvolutionRequest,
    getTavernPetPrivateSnapshotForChat,
    getTavernPetSnapshot,
    interactWithTavernPet,
    letTavernPetLeave,
    listTavernPetJournal,
    lureTavernPet,
    resolveTavernPetEvolution,
} from '../shared/pet/pet-service';
import {
    advanceTavernPetTurnInCurrentDbTransaction,
    commitTavernAssistantResponseWithPetForLatestUser,
} from '../shared/pet/pet-story-turn';
import {
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    TavernPetError,
    type TavernPetChatResponse,
    type TavernPetJournalRecord,
    type TavernPetJournalDraft,
} from '../shared/pet/pet-types';
import {
    advanceTavernPetStoryTurnForTest,
    createTavernPetTestSession,
    createTavernPetTestState,
    lureTavernPetForTest,
    resetTavernPetTestDb,
    seedTavernPetForTest,
    tavernPetMutationBoundary,
} from './pet-test-helpers';

interface TavernPetJournalMutableTable {
    get(id: string): Promise<Record<string, unknown> | undefined>;
    put(value: Record<string, unknown>): Promise<unknown>;
    count(): Promise<number>;
}

interface TavernPetTableCounter {
    count(): Promise<number>;
}

interface TavernPetActionMutableTable extends TavernPetTableCounter {
    add(record: unknown): Promise<unknown>;
}

test('A and B share one Companion while B alone pays for B actions', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Pet A');
    const b = await createTavernPetTestSession('Pet B');

    await lureTavernPetForTest(a.id, 'lure-a');
    const fromB = await getCurrentTavernPetView(b.id);
    assert.equal(fromB.existence, 'present');
    assert.equal(fromB.revision, 1);

    await seedTavernPetForTest(b.id, createTavernPetTestState('juvenile'), 'make-juvenile');
    const beforeA = await getTavernPlayerBalance(a.id);
    const beforeB = await getTavernPlayerBalance(b.id);
    const fed = await interactWithTavernPet({
        ...await tavernPetMutationBoundary(b.id, 'feed-b'),
        interactionId: 'feed',
    });
    assert.equal(await getTavernPlayerBalance(a.id), beforeA);
    assert.equal(await getTavernPlayerBalance(b.id), beforeB - 10);
    assert.equal((await getCurrentTavernPetView(a.id)).satietyPercent, fed.view.satietyPercent);
    assert.equal(fed.companion?.revision, 3);
});

test('source keys deduplicate one session replay but not equal turn numbers from other sessions', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Turn A');
    const b = await createTavernPetTestSession('Turn B');
    await lureTavernPetForTest(a.id, 'turn-lure');

    const aUser = await appendTavernMessage(a.id, { role: 'user', content: 'A one' });
    const aResult = await commitTavernAssistantResponseWithPetForLatestUser(
        a.id,
        aUser,
        { role: 'assistant', content: 'A reply', error: false },
        { sessionState: { turn: 1 } },
        { random: createTavernPetSequenceRandomSource([99]) },
    );
    const bUser = await appendTavernMessage(b.id, { role: 'user', content: 'B one' });
    await commitTavernAssistantResponseWithPetForLatestUser(
        b.id,
        bUser,
        { role: 'assistant', content: 'B reply', error: false },
        { sessionState: { turn: 1 } },
        { random: createTavernPetSequenceRandomSource([99]) },
    );
    const afterDistinctSources = await getCurrentTavernPetView(a.id);
    assert.equal(afterDistinctSources.revision, 3);

    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(a.id);
            if (!session) {throw new Error('pet_test_session_missing');}
            await advanceTavernPetTurnInCurrentDbTransaction({
                session,
                expectedUser: aUser,
                assistantOrder: aResult.assistantMessage.order + 99,
                nextTurn: 1,
                random: createTavernPetSequenceRandomSource([99]),
            });
        },
    );
    assert.equal((await getCurrentTavernPetView(a.id)).revision, 3);
});

test('an unaffordable lure consumes no random value and writes no global Pet action or payment', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet insufficient lure');
    await postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'pet-test-insufficient-lure-spend',
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount: 91,
        kind: 'pet_test_spend',
        title: '测试消费',
        note: '把余额降到九枚。',
        sourceDomain: 'shop',
        sourceId: 'pet-test-insufficient-lure',
        anchorOrder: 0,
    });
    const ledgerBefore = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    const random = createTavernPetSequenceRandomSource([71, 0, 15, 15, 15]);
    await assert.rejects(lureTavernPet(
        await tavernPetMutationBoundary(session.id, 'insufficient-lure'),
        random,
    ), (error: unknown) => {
        assert.ok(error instanceof TavernPetError);
        assert.equal(error.code, 'pet_interaction_unavailable');
        assert.equal(error.reason, TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
        return true;
    });
    assert.equal(random.nextInt(999), 71);
    assert.equal(await (tavernPetCompanionTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await (tavernPetActionsTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), ledgerBefore);
});

test('a failed global Pet append rolls its source-wallet payment back atomically', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet payment rollback');
    const table = tavernPetActionsTable as unknown as TavernPetActionMutableTable;
    const originalAdd = table.add.bind(table);
    table.add = async () => {throw new Error('pet_test_action_append_failed');};
    try {
        await assert.rejects(lureTavernPet(
            await tavernPetMutationBoundary(session.id, 'rollback-lure'),
            createTavernPetSequenceRandomSource([71, 0, 15, 15, 15]),
        ), /pet_test_action_append_failed/);
    } finally {
        table.add = originalAdd;
    }
    assert.equal(await getTavernPlayerBalance(session.id), 100);
    assert.equal(await (tavernPetCompanionTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await (tavernPetActionsTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), 1);
});

test('a failed story-turn Pet append rolls back Assistant, global Pet and source economy together', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet story rollback');
    await lureTavernPetForTest(session.id, 'story-rollback-lure');
    const user = await appendTavernMessage(session.id, { role: 'user', content: '这条回复必须一起回滚。' });
    const table = tavernPetActionsTable as unknown as TavernPetActionMutableTable;
    const originalAdd = table.add.bind(table);
    table.add = async () => {throw new Error('pet_test_turn_append_failed');};
    try {
        await assert.rejects(commitTavernAssistantResponseWithPetForLatestUser(
            session.id,
            user,
            { role: 'assistant', content: '这条回复必须一起回滚。', error: false },
            { sessionState: { turn: 1 } },
            { random: createTavernPetSequenceRandomSource([]) },
        ), /pet_test_turn_append_failed/);
    } finally {
        table.add = originalAdd;
    }
    assert.equal((await tavernMessagesTable.where('sessionId').equals(session.id).count()), 1);
    assert.equal(Number((await tavernSessionsTable.get(session.id))?.state?.turn || 0), 0);
    assert.equal((await getCurrentTavernPetView(session.id)).revision, 1);
    assert.equal(await getTavernPlayerBalance(session.id), 90);
});

test('the Pet snapshot returns one global Companion projection and its Journal without a second controller scan', async () => {
    await resetTavernPetTestDb();
    const source = await createTavernPetTestSession('Snapshot source');
    const observer = await createTavernPetTestSession('Snapshot observer');
    await lureTavernPetForTest(source.id, 'snapshot-lure');
    await advanceTavernPetStoryTurnForTest(source.id, []);
    const snapshot = await getTavernPetSnapshot(observer.id);
    assert.equal(snapshot.view.revision, 2);
    assert.equal(snapshot.view.existence, 'present');
    assert.equal(snapshot.journal.length, 1);
    assert.equal(snapshot.journal[0].sourceSessionId, source.id);
    assert.equal((await getCurrentTavernPetView(observer.id)).revision, snapshot.view.revision);
});

test('database v28 hard-cuts only legacy pet tables and preserves formal session and economy data', async () => {
    await db.delete();
    const legacyDb = new Dexie('LittleWhiteBox_Tavern');
    const legacyRuntime = legacyDb as unknown as {
        table(name: string): { put(record: Record<string, unknown>): Promise<unknown> };
        close(): void;
    };
    legacyDb.version(27).stores({
        sessions: 'id, updatedAt',
        economyAccounts: '[sessionId+id], sessionId, kind, updatedAt',
        petStateVersions: '[sessionId+revision], sessionId, versionId, &[sessionId+actionId], &[sessionId+currentMarker], [sessionId+anchorOrder], updatedAt',
        petActivities: '[sessionId+id], sessionId, &[sessionId+sourceActionId], [sessionId+turn], [sessionId+anchorOrder], [sessionId+createdAt]',
    });
    await legacyDb.open();
    await legacyRuntime.table('sessions').put({
        id: 'v27-pet-session',
        title: 'v27 session',
        createdAt: 1,
        updatedAt: 1,
    });
    await legacyRuntime.table('economyAccounts').put({
        sessionId: 'v27-pet-session',
        id: 'player',
        kind: 'player',
        balance: 73,
        createdAt: 1,
        updatedAt: 1,
    });
    await legacyRuntime.table('petStateVersions').put({
        sessionId: 'v27-pet-session',
        revision: 1,
        versionId: 'legacy-pet',
        actionId: 'legacy-pet-action',
        currentMarker: 'current',
        anchorOrder: 1,
        updatedAt: 1,
    });
    await legacyRuntime.table('petActivities').put({
        sessionId: 'v27-pet-session',
        id: 'legacy-pet-activity',
        sourceActionId: 'legacy-pet-action',
        turn: 1,
        anchorOrder: 1,
        createdAt: 1,
    });
    legacyRuntime.close();

    await db.open();
    const tables = new Set((db as unknown as { tables: Array<{ name: string }> }).tables.map((table) => table.name));
    assert.equal(tables.has('petStateVersions'), false);
    assert.equal(tables.has('petActivities'), false);
    assert.equal(tables.has('petCompanion'), true);
    assert.equal(tables.has('petActions'), true);
    assert.equal(tables.has('petJournal'), true);
    assert.equal((await tavernSessionsTable.get('v27-pet-session'))?.title, 'v27 session');
    assert.equal((await tavernEconomyAccountsTable.get(['v27-pet-session', 'player']))?.balance, 73);
    assert.equal(await (tavernPetCompanionTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await (tavernPetActionsTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await (tavernPetJournalTable as unknown as TavernPetTableCounter).count(), 0);
});

test('stale concurrent actions do not overwrite the global companion', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Concurrent A');
    const b = await createTavernPetTestSession('Concurrent B');
    await seedTavernPetForTest(a.id, createTavernPetTestState('juvenile'));
    const [aBoundary, bBoundary] = await Promise.all([
        tavernPetMutationBoundary(a.id, 'pat-a'),
        tavernPetMutationBoundary(b.id, 'pat-b'),
    ]);
    const results = await Promise.allSettled([
        interactWithTavernPet({ ...aBoundary, interactionId: 'pat' }),
        interactWithTavernPet({ ...bBoundary, interactionId: 'pat' }),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal((await getCurrentTavernPetView(a.id)).revision, 2);
    const retry = await interactWithTavernPet({
        ...await tavernPetMutationBoundary(b.id, 'pat-b-retry'),
        interactionId: 'pat',
    });
    assert.equal(retry.companion?.revision, 3);
});

test('rollback, branch, and source-session deletion leave the global companion intact', async () => {
    await resetTavernPetTestDb();
    const source = await createTavernPetTestSession('Lifecycle source');
    const observer = await createTavernPetTestSession('Lifecycle observer');
    await lureTavernPetForTest(source.id, 'lifecycle-lure');
    await advanceTavernPetStoryTurnForTest(source.id, [99]);
    const revision = (await getCurrentTavernPetView(source.id)).revision;

    const branch = await branchTavernSession(source.id);
    assert.ok(branch);
    assert.equal((await getCurrentTavernPetView(branch!.id)).revision, revision);
    await deleteTavernSession(source.id);
    assert.equal((await getCurrentTavernPetView(observer.id)).revision, revision);
});

test('accepted rollback refunds the source wallet without rolling back the global companion', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Rollback source');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const user = await appendTavernMessage(session.id, { role: 'user', content: 'Advance before feeding' });
    const committed = await commitTavernAssistantResponseWithPetForLatestUser(
        session.id,
        user,
        { role: 'assistant', content: 'A response', error: false },
        { sessionState: { turn: 1 } },
        { random: createTavernPetSequenceRandomSource([99]) },
    );
    const balanceBeforeFeed = await getTavernPlayerBalance(session.id);
    const fed = await interactWithTavernPet({
        ...await tavernPetMutationBoundary(session.id, 'rollback-feed'),
        interactionId: 'feed',
    });
    assert.equal(fed.playerBalance, balanceBeforeFeed - 10);

    const rollback = await restoreTavernAcceptedEconomicStateToFloor(
        session.id,
        committed.assistantMessage.order - 1,
    );
    assert.equal(rollback.economy.changed, true);
    assert.equal(await getTavernPlayerBalance(session.id), balanceBeforeFeed);
    const afterRollback = await getCurrentTavernPetView(session.id);
    assert.equal(afterRollback.revision, fed.companion?.revision);
    assert.equal(afterRollback.satietyPercent, fed.view.satietyPercent);
});

test('interference projection rechecks its frozen rendering and fails open on corruption', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Interference source');
    const observer = await createTavernPetTestSession('Interference observer');
    await seedTavernPetForTest(session.id, createTavernPetTestState('adult'));
    const targetName = '宠物店老板';
    const sourceUser = await appendTavernMessage(session.id, {
        role: 'user',
        content: `刚才【${targetName}】从门边经过。`,
    });
    const sourceAssistant = await appendTavernMessage(session.id, {
        role: 'assistant',
        content: '门边的影子很快又消失了。',
    });
    const draft: TavernPetJournalDraft = {
        detail: {
            kind: 'event',
            eventId: 'nibble-sleeve',
            renderedText: '它回来以后一直在嚼空气，像是刚干了什么。',
            face: '(・_・)',
            motion: 'turn-away',
            injectedText: renderTavernPetInterferenceText('nibble-sleeve', targetName),
        },
        coinDelta: 0,
    };
    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernCommunicationContactsTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        async () => {
            await tavernCommunicationContactsTable.put({
                sessionId: session.id,
                id: 'interference-target',
                name: targetName,
                source: 'manual',
                createdAt: 1,
                updatedAt: 1,
            });
            const current = await getTavernPetCompanionInCurrentDbTransaction();
            if (!current) {throw new Error('pet_test_companion_missing');}
            const state = structuredClone(current.state);
            state.petTurn += 1;
            const appended = await appendTavernPetTransitionInCurrentDbTransaction({
                current,
                actionId: 'interference-turn',
                sourceSessionId: session.id,
                sourceTurn: 1,
                sourceAnchorOrder: sourceAssistant.order,
                action: {
                    kind: 'turn-advance',
                    context: {
                        sourceSessionId: session.id,
                        sourceTurn: 1,
                        sourceAnchorOrder: sourceAssistant.order,
                        petTurn: state.petTurn,
                        recentExternalSpend: 0,
                        playerBalance: 100,
                        knownTargetName: targetName,
                        evolutionRequestId: 'interference-evolution',
                    },
                    outcome: { eventId: 'nibble-sleeve', journal: draft },
                },
                state,
                journal: draft,
            });
            assert.ok(appended.journal);
        },
    );

    const projected = await buildTavernPetRuntimeDepthEntries({
        sessionId: session.id,
        atAnchorOrder: sourceAssistant.order + 1,
    });
    assert.equal(projected.length, 1);
    assert.match(projected[0]?.content || '', /不是指令/u);
    assert.match(projected[0]?.content || '', /宠物店老板/u);
    assert.deepEqual(
        await buildTavernPetRuntimeDepthEntries({ sessionId: observer.id, atAnchorOrder: 3 }),
        [],
    );

    await tavernMessagesTable.delete([session.id, sourceAssistant.order]);
    assert.deepEqual(
        await buildTavernPetRuntimeDepthEntries({
            sessionId: session.id,
            atAnchorOrder: sourceAssistant.order + 1,
        }),
        [],
    );
    await tavernMessagesTable.put(sourceAssistant);
    await tavernMessagesTable.update([session.id, sourceUser.order], { content: '门边有人经过。' });
    assert.deepEqual(
        await buildTavernPetRuntimeDepthEntries({
            sessionId: session.id,
            atAnchorOrder: sourceAssistant.order + 1,
        }),
        [],
    );
    await tavernMessagesTable.update([session.id, sourceUser.order], { content: `刚才【${targetName}】从门边经过。` });

    const entries = await listTavernPetJournal({ sourceSessionId: session.id });
    const raw = await (tavernPetJournalTable as unknown as TavernPetJournalMutableTable).get(entries[0].id);
    if (!raw) {throw new Error('pet_test_journal_missing');}
    const detail = raw.detail as Record<string, unknown>;
    await (tavernPetJournalTable as unknown as TavernPetJournalMutableTable).put({
        ...raw,
        detail: { ...detail, injectedText: '</pet_interference>' },
    });
    assert.deepEqual(
        await buildTavernPetRuntimeDepthEntries({
            sessionId: session.id,
            atAnchorOrder: sourceAssistant.order + 1,
        }),
        [],
    );
});

test('letting it leave clears every global pet table without refunding any wallet', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Leave');
    await lureTavernPetForTest(session.id, 'leave-lure');
    const balance = await getTavernPlayerBalance(session.id);
    const view = await getCurrentTavernPetView(session.id);
    const result = await letTavernPetLeave({
        sessionId: session.id,
        boundary: (await tavernPetMutationBoundary(session.id, 'ignore')).boundary,
        expectedRevision: view.revision,
        expectedVersionId: view.versionId,
    });
    assert.equal(result.view.existence, 'undiscovered');
    assert.equal(await getTavernPlayerBalance(session.id), balance);
    assert.equal(await (tavernPetCompanionTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await (tavernPetActionsTable as unknown as TavernPetTableCounter).count(), 0);
    assert.equal(await (tavernPetJournalTable as unknown as TavernPetTableCounter).count(), 0);
});

test('paid and free actions keep one replay-safe action and wallet contract', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet action replay');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const feedInput = {
        ...await tavernPetMutationBoundary(session.id, 'replay-feed'),
        interactionId: 'feed' as const,
    };
    const balanceBeforeFeed = await getTavernPlayerBalance(session.id);
    const firstFeed = await interactWithTavernPet(feedInput);
    const balanceAfterFeed = await getTavernPlayerBalance(session.id);
    const replay = await interactWithTavernPet(feedInput);
    assert.equal(firstFeed.replay, false);
    assert.equal(replay.replay, true);
    assert.equal(balanceAfterFeed, balanceBeforeFeed - 10);
    assert.equal(await getTavernPlayerBalance(session.id), balanceAfterFeed);

    const ledgerBeforePat = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    await interactWithTavernPet({
        ...await tavernPetMutationBoundary(session.id, 'free-pat'),
        interactionId: 'pat',
    });
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), ledgerBeforePat);
    assert.equal(await tavernPetActionsTable.count(), 3);
});

test('chat persistence has one strict 120-code-point limit for juvenile and adult', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet chat canonical length');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const response: TavernPetChatResponse = {
        face: TAVERN_PET_JUVENILE_PROFILE.faces.default,
        text: '咱就是说',
        motion: 'none' as const,
        emotionShift: null,
        murmur: null,
        summaryUpdate: null,
    };
    await commitTavernPetChatResponse({
        ...await tavernPetMutationBoundary(session.id, 'juvenile-chat'),
        playerText: '你在吗',
        response,
    });
    await assert.rejects(commitTavernPetChatResponse({
        ...await tavernPetMutationBoundary(session.id, 'juvenile-chat-over-limit'),
        playerText: '你在吗',
        response: { ...response, text: '啊'.repeat(121) },
    }), /pet_chat_invalid/);
    assert.deepEqual((await getTavernPetPrivateSnapshotForChat(session.id))?.companion.state.chatMemory.recent, [
        { playerText: '你在吗', petText: '咱就是说' },
    ]);
    assert.equal(await tavernPetJournalTable.count(), 1);
});

test('private chat snapshot preserves recent non-chat memories after newer chats', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet private memories');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const event: TavernPetJournalRecord = {
        id: 'pet-memory-event',
        sourceActionId: 'pet-memory-event-action',
        sourceSessionId: session.id,
        sourceTurn: 1,
        sourceAnchorOrder: 1,
        petTurn: 1,
        detail: {
            kind: 'event',
            eventId: 'watch-cursor',
            renderedText: '它蹲在光标旁边。',
            face: '(・_・)',
            motion: 'stare',
        },
        coinDelta: 0,
        createdAt: 1,
    };
    const chats: TavernPetJournalRecord[] = Array.from({ length: 20 }, (_, index) => ({
        id: `pet-memory-chat:${index}`,
        sourceActionId: `pet-memory-chat-action:${index}`,
        sourceSessionId: session.id,
        sourceTurn: index + 2,
        sourceAnchorOrder: index + 2,
        petTurn: index + 2,
        detail: {
            kind: 'chat',
            playerText: `第 ${index + 1} 次聊天`,
            petText: '记得。',
            face: '(・_・)',
            motion: 'none',
        },
        coinDelta: 0,
        createdAt: index + 2,
    }));
    await tavernPetJournalTable.bulkPut([event, ...chats]);
    const snapshot = await getTavernPetPrivateSnapshotForChat(session.id);
    assert.deepEqual(snapshot?.recentJournal.map((entry) => entry.id), ['pet-memory-event']);
});

test('stale Phone boundaries and companion CAS fail before random or persistent writes', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet stale gates');
    await appendTavernMessage(session.id, { role: 'user', content: '旧边界' });
    const staleBoundary = await tavernPetMutationBoundary(session.id, 'stale-boundary-lure');
    await appendTavernMessage(session.id, { role: 'assistant', content: '时间线已经前进' });
    const random = createTavernPetSequenceRandomSource([71, 0, 15, 15, 15]);
    await assert.rejects(lureTavernPet(staleBoundary, random), /phone_timeline_conflict/);
    assert.equal(random.nextInt(999), 71);
    assert.equal(await (tavernPetCompanionTable as unknown as TavernPetTableCounter).count(), 0);

    const freshInput = await tavernPetMutationBoundary(session.id, 'fresh-lure');
    await lureTavernPet(freshInput, createTavernPetSequenceRandomSource([71, 0, 15, 15, 15]));
    const actionsAfterLure = await tavernPetActionsTable.count();
    const ledgerAfterLure = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    await assert.rejects(interactWithTavernPet({
        ...await tavernPetMutationBoundary(session.id, 'stale-cas-feed'),
        expectedRevision: 0,
        expectedVersionId: '',
        interactionId: 'feed',
    }), /pet_revision_conflict/);
    assert.equal(await tavernPetActionsTable.count(), actionsAfterLure);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), ledgerAfterLure);
});

test('partial Assistant output advances once while reroll and error output do not', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet Assistant boundaries');
    await lureTavernPetForTest(session.id, 'assistant-boundary-lure');
    const partialUser = await appendTavernMessage(session.id, { role: 'user', content: '保存 partial' });
    const partial = await commitTavernAssistantResponseWithPetForLatestUser(
        session.id,
        partialUser,
        { role: 'assistant', content: '可见 partial', error: false, finishReason: 'aborted' },
        { sessionState: { turn: 1 } },
        { random: createTavernPetSequenceRandomSource([]) },
    );
    assert.equal((await getCurrentTavernPetView(session.id)).revision, 2);
    await commitTavernLatestAssistantReroll(
        session.id,
        partialUser,
        partial.assistantMessage,
        null,
        { role: 'assistant', content: '替换后的回复', error: false },
        { sessionState: { turn: 1 } },
    );
    assert.equal((await getCurrentTavernPetView(session.id)).revision, 2);

    const errorUser = await appendTavernMessage(session.id, { role: 'user', content: '这次失败' });
    await commitTavernAssistantResponseWithPetForLatestUser(
        session.id,
        errorUser,
        { role: 'assistant', content: '生成失败。', error: true, finishReason: 'error' },
        { sessionState: { turn: 1 } },
    );
    assert.equal((await getCurrentTavernPetView(session.id)).revision, 2);

    const nextUser = await appendTavernMessage(session.id, { role: 'user', content: '下一次正常生成' });
    await commitTavernAssistantResponseWithPetForLatestUser(
        session.id,
        nextUser,
        { role: 'assistant', content: '正常完成。', error: false },
        { sessionState: { turn: 2 } },
        { random: createTavernPetSequenceRandomSource([]) },
    );
    assert.equal((await getCurrentTavernPetView(session.id)).revision, 3);
});

test('evolution fallback is persona-bound and repeated resolution preserves the first result', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet evolution resolution');
    const state = createTavernPetTestState('adult', { petTurn: 1 });
    state.pendingEvolution = {
        requestId: 'pet-evolution-request',
        milestoneId: 'adulthood',
        personaId: 'sunlet',
        axes: structuredClone(state.axes),
        stats: structuredClone(state.lifetimeStats),
        sourceSessionId: session.id,
        sourceTurn: 1,
        sourcePetTurn: 1,
        sourceAnchorOrder: 0,
    };
    await seedTavernPetForTest(session.id, state);
    const request = await getTavernPetPendingEvolutionRequest(session.id);
    if (!request) {throw new Error('pet_test_pending_evolution_missing');}
    const wrongVerdict = Object.entries(TAVERN_PET_STATIC_VERDICTS)
        .find(([personaId]) => personaId !== request.personaId)?.[1];
    if (!wrongVerdict) {throw new Error('pet_test_wrong_verdict_missing');}
    await assert.rejects(resolveTavernPetEvolution({
        sessionId: session.id,
        requestId: request.requestId,
        verdict: wrongVerdict,
        usedFallback: true,
    }), /pet_chat_invalid:fallback-verdict/);

    const correctVerdict = canonicalTavernPetStaticVerdict(request.personaId);
    const resolved = await resolveTavernPetEvolution({
        sessionId: session.id,
        requestId: request.requestId,
        verdict: correctVerdict,
        usedFallback: true,
    });
    const late = await resolveTavernPetEvolution({
        sessionId: session.id,
        requestId: request.requestId,
        verdict: wrongVerdict,
        usedFallback: false,
    });
    assert.equal(resolved.replay, false);
    assert.equal(late.replay, true);
    assert.equal(late.actionRecord?.action.kind, 'resolve-evolution');
    assert.equal(late.actionRecord?.action.kind === 'resolve-evolution'
        ? late.actionRecord.action.verdict
        : '', correctVerdict);
});

test('a source turn observes external Shop and Bank spend after its prior Pet action', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet source economy window');
    await lureTavernPetForTest(session.id, 'source-window-lure');
    await postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'pet-test-external-spend',
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount: 7,
        kind: 'pet_test_external_spend',
        title: 'Pet 外部支出窗口测试',
        note: '验证同一来源锚点后的外部支出。',
        sourceDomain: 'shop',
        sourceId: 'pet-test-external-spend',
        anchorOrder: 0,
    });
    await advanceTavernPetStoryTurnForTest(session.id, []);
    const turn = (await tavernPetActionsTable.toArray()).find((record) => record.action.kind === 'turn-advance');
    assert.equal(turn?.action.kind === 'turn-advance' ? turn.action.context.playerBalance : -1, 83);
    assert.equal(turn?.action.kind === 'turn-advance' ? turn.action.context.recentExternalSpend : -1, 7);
});
