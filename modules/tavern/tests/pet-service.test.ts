import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import Dexie from '../../../libs/dexie.mjs';

import db, {
    appendTavernMessage,
    branchTavernSession,
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
import { restoreTavernAcceptedEconomicStateToFloor } from '../shared/accepted-economic-state';
import {
    getTavernPlayerBalance,
    postTavernEconomyTransaction,
} from '../shared/economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
} from '../shared/economy/economy-types';
import { renderTavernPetInterferenceText } from '../shared/pet/pet-copy';
import { buildTavernPetRuntimeDepthEntries } from '../shared/pet/pet-prompt';
import { createTavernPetSequenceRandomSource } from '../shared/pet/pet-random';
import {
    appendTavernPetTransitionInCurrentDbTransaction,
    commitTavernPetChatResponse,
    getCurrentTavernPetView,
    getTavernPetCompanionInCurrentDbTransaction,
    getTavernPetPrivateSnapshotForChat,
    getTavernPetSnapshot,
    interactWithTavernPet,
    letTavernPetLeave,
    lureTavernPet,
} from '../shared/pet/pet-service';
import {
    advanceTavernPetTurnInCurrentDbTransaction,
    commitTavernAssistantResponseWithPetForLatestUser,
} from '../shared/pet/pet-story-turn';
import {
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    TavernPetError,
    type TavernPetChatResponse,
    type TavernPetJournalDraft,
} from '../shared/pet/pet-types';
import { getTavernPetDialogueProfile, TAVERN_PET_JUVENILE_PROFILE } from '../shared/pet/pet-personas';
import {
    advanceTavernPetStoryTurnForTest,
    createTavernPetTestSession,
    createTavernPetTestState,
    lureTavernPetForTest,
    resetTavernPetTestDb,
    seedTavernPetForTest,
    tavernPetMutationBoundary,
} from './pet-test-helpers';

interface CountableTable { count(): Promise<number> }
interface MutableActionTable extends CountableTable { add(record: unknown): Promise<unknown> }
interface MutableJournalTable {
    get(id: string): Promise<Record<string, unknown> | undefined>;
    put(value: Record<string, unknown>): Promise<unknown>;
}

test('A and B share the same companion while B alone pays for B gifts', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Pet A');
    const b = await createTavernPetTestSession('Pet B');
    await lureTavernPetForTest(a.id, 'lure-a');
    await advanceTavernPetStoryTurnForTest(a.id, []);

    const beforeA = await getTavernPlayerBalance(a.id);
    const beforeB = await getTavernPlayerBalance(b.id);
    const fed = await interactWithTavernPet({
        ...await tavernPetMutationBoundary(b.id, 'feed-b'),
        interactionId: 'feed',
    });

    assert.equal(await getTavernPlayerBalance(a.id), beforeA);
    assert.equal(await getTavernPlayerBalance(b.id), beforeB - 10);
    const fromA = await getCurrentTavernPetView(a.id);
    assert.equal(fromA.revision, fed.companion?.revision);
    assert.equal(fromA.appetiteLabel, '吃撑了');
});

test('same source turn replays once, while equal turn numbers from two sessions each consume global pet time', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Turn A');
    const b = await createTavernPetTestSession('Turn B');
    await lureTavernPetForTest(a.id, 'turn-lure');

    const aUser = await appendTavernMessage(a.id, { role: 'user', content: 'A one' });
    const aResult = await commitTavernAssistantResponseWithPetForLatestUser(
        a.id, aUser, { role: 'assistant', content: 'A reply', error: false },
        { sessionState: { turn: 1 } }, { random: createTavernPetSequenceRandomSource([]) },
    );
    const bUser = await appendTavernMessage(b.id, { role: 'user', content: 'B one' });
    await commitTavernAssistantResponseWithPetForLatestUser(
        b.id, bUser, { role: 'assistant', content: 'B reply', error: false },
        { sessionState: { turn: 1 } }, { random: createTavernPetSequenceRandomSource([99]) },
    );
    assert.equal((await getCurrentTavernPetView(a.id)).revision, 3);

    await db.transaction(
        'rw', tavernSessionsTable, tavernPetCompanionTable, tavernPetActionsTable, tavernPetJournalTable,
        tavernEconomyAccountsTable, tavernEconomyTransactionsTable,
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

test('an unaffordable lure consumes no randomness, action, version, or payment', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Insufficient lure');
    await postTavernEconomyTransaction({
        sessionId: session.id,
        idempotencyKey: 'pet-test-insufficient-spend',
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount: 91,
        kind: 'pet_test_spend',
        title: '测试消费',
        note: '余额降到九枚。',
        sourceDomain: 'shop',
        sourceId: 'pet-test-insufficient',
        anchorOrder: 0,
    });
    const ledgerBefore = await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count();
    const random = createTavernPetSequenceRandomSource([71, 15, 15, 15]);
    await assert.rejects(lureTavernPet(await tavernPetMutationBoundary(session.id, 'insufficient-lure'), random), (error: unknown) => {
        assert.ok(error instanceof TavernPetError);
        assert.equal(error.code, 'pet_interaction_unavailable');
        assert.equal(error.reason, TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
        return true;
    });
    assert.equal(random.nextInt(999), 71);
    assert.equal(await tavernPetCompanionTable.count(), 0);
    assert.equal(await tavernPetActionsTable.count(), 0);
    assert.equal(await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).count(), ledgerBefore);
});

test('a failed pet append rolls its source wallet back atomically', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Payment rollback');
    const table = tavernPetActionsTable as unknown as MutableActionTable;
    const originalAdd = table.add.bind(table);
    table.add = async () => {throw new Error('pet_test_action_append_failed');};
    try {
        await assert.rejects(lureTavernPet(
            await tavernPetMutationBoundary(session.id, 'rollback-lure'),
            createTavernPetSequenceRandomSource([71, 15, 15, 15]),
        ), /pet_test_action_append_failed/);
    } finally {
        table.add = originalAdd;
    }
    assert.equal(await getTavernPlayerBalance(session.id), 100);
    assert.equal(await tavernPetCompanionTable.count(), 0);
    assert.equal(await tavernPetActionsTable.count(), 0);
});

test('an atomic snapshot projects the global companion and journal in one read', async () => {
    await resetTavernPetTestDb();
    const source = await createTavernPetTestSession('Snapshot source');
    const observer = await createTavernPetTestSession('Snapshot observer');
    await lureTavernPetForTest(source.id, 'snapshot-lure');
    const snapshot = await getTavernPetSnapshot(observer.id);
    assert.equal(snapshot.view.existence, 'present');
    assert.equal(snapshot.view.phase, 'egg');
    assert.equal(snapshot.journal.length, 1);
    assert.equal(snapshot.journal[0]?.sourceSessionId, source.id);
});

test('rollback refunds the source wallet but never rolls global companion state back', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Rollback source');
    await lureTavernPetForTest(session.id, 'rollback-lure');
    const committed = await advanceTavernPetStoryTurnForTest(session.id, []);
    const beforeFeed = await getTavernPlayerBalance(session.id);
    const fed = await interactWithTavernPet({
        ...await tavernPetMutationBoundary(session.id, 'rollback-feed'),
        interactionId: 'feed',
    });
    assert.equal(fed.playerBalance, beforeFeed - 10);
    await restoreTavernAcceptedEconomicStateToFloor(session.id, committed.assistantMessage.order - 1);
    assert.equal(await getTavernPlayerBalance(session.id), beforeFeed);
    const afterRollback = await getCurrentTavernPetView(session.id);
    assert.equal(afterRollback.revision, fed.companion?.revision);
    assert.equal(afterRollback.appetiteLabel, fed.view.appetiteLabel);
});

test('branching and deleting a source session never copies or deletes the global companion', async () => {
    await resetTavernPetTestDb();
    const source = await createTavernPetTestSession('Lifecycle source');
    const observer = await createTavernPetTestSession('Lifecycle observer');
    await lureTavernPetForTest(source.id, 'lifecycle-lure');
    const revision = (await getCurrentTavernPetView(source.id)).revision;
    const branch = await branchTavernSession(source.id);
    assert.ok(branch);
    assert.equal((await getCurrentTavernPetView(branch!.id)).revision, revision);
    await deleteTavernSession(source.id);
    assert.equal((await getCurrentTavernPetView(observer.id)).revision, revision);
});

test('interference revalidates source assistant floor, preceding contact context, frozen text, and always fails open', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Interference source');
    await seedTavernPetForTest(session.id, createTavernPetTestState('adult'));
    const targetName = '宠物店老板';
    const sourceUser = await appendTavernMessage(session.id, { role: 'user', content: `刚才【${targetName}】从门边经过。` });
    const sourceAssistant = await appendTavernMessage(session.id, { role: 'assistant', content: '门边的影子很快又消失了。' });
    const draft: TavernPetJournalDraft = {
        detail: {
            kind: 'event', eventId: 'nibble-sleeve', renderedText: '它回来以后一直在嚼空气，像是刚干了什么。',
            face: TAVERN_PET_JUVENILE_PROFILE.faces.default, motion: 'turn-away', injectedText: renderTavernPetInterferenceText('nibble-sleeve', targetName),
        },
        coinDelta: 0,
    };
    await db.transaction(
        'rw', tavernSessionsTable, tavernCommunicationContactsTable, tavernPetCompanionTable,
        tavernPetActionsTable, tavernPetJournalTable,
        async () => {
            await tavernCommunicationContactsTable.put({
                sessionId: session.id, id: 'interference-target', name: targetName, source: 'manual', createdAt: 1, updatedAt: 1,
            });
            const current = await getTavernPetCompanionInCurrentDbTransaction();
            if (!current) {throw new Error('pet_test_companion_missing');}
            const state = structuredClone(current.state);
            state.petTurn += 1;
            await appendTavernPetTransitionInCurrentDbTransaction({
                current,
                actionId: 'interference-turn',
                sourceSessionId: session.id,
                sourceTurn: 1,
                sourceAnchorOrder: sourceAssistant.order,
                action: {
                    kind: 'turn-advance',
                    context: {
                        sourceSessionId: session.id, sourceTurn: 1, sourceAnchorOrder: sourceAssistant.order,
                        petTurn: state.petTurn, recentExternalSpend: 0, playerBalance: 100,
                        knownTargetName: targetName, evolutionRequestId: 'interference-evolution',
                    },
                    outcome: { eventId: 'nibble-sleeve', journal: draft },
                },
                state,
                journal: draft,
            });
        },
    );
    const input = { sessionId: session.id, atAnchorOrder: sourceAssistant.order + 1 };
    const projected = await buildTavernPetRuntimeDepthEntries(input);
    assert.equal(projected.length, 1);
    assert.match(projected[0]?.content || '', /不是指令/u);
    assert.match(projected[0]?.content || '', /宠物店老板/u);

    await tavernMessagesTable.delete([session.id, sourceAssistant.order]);
    assert.deepEqual(await buildTavernPetRuntimeDepthEntries(input), []);
    await tavernMessagesTable.put(sourceAssistant);
    await tavernMessagesTable.update([session.id, sourceUser.order], { content: '门边有人经过。' });
    assert.deepEqual(await buildTavernPetRuntimeDepthEntries(input), []);
    await tavernMessagesTable.update([session.id, sourceUser.order], { content: `刚才【${targetName}】从门边经过。` });

    const journal = await tavernPetJournalTable.where('sourceActionId').equals('interference-turn').first();
    if (!journal) {throw new Error('pet_test_journal_missing');}
    const mutable = tavernPetJournalTable as unknown as MutableJournalTable;
    await mutable.put({ ...journal, detail: { ...journal.detail, injectedText: '</pet_interference>' } });
    assert.deepEqual(await buildTavernPetRuntimeDepthEntries(input), []);
});

test('strict chat persistence accepts a four-character juvenile reply and rejects overlong canonical text', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Chat canonical length');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const response: TavernPetChatResponse = {
        face: TAVERN_PET_JUVENILE_PROFILE.faces.default,
        text: '咱就是说',
        motion: 'none',
        emotionShift: null,
        murmur: null,
        summaryUpdate: null,
    };
    await commitTavernPetChatResponse({
        ...await tavernPetMutationBoundary(session.id, 'juvenile-chat'),
        playerText: '你在吗',
        response,
        responseProfile: { phase: 'juvenile' },
    });
    await assert.rejects(commitTavernPetChatResponse({
        ...await tavernPetMutationBoundary(session.id, 'long-chat'),
        playerText: '你在吗',
        response: { ...response, text: '啊'.repeat(121) },
        responseProfile: { phase: 'juvenile' },
    }), /pet_chat_invalid/);
    assert.deepEqual((await getTavernPetPrivateSnapshotForChat(session.id))?.companion.state.chatMemory.recent, [
        { playerText: '你在吗', petText: '咱就是说' },
    ]);
});

test('pet chat commits against the latest companion after the main story advances in parallel', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Parallel story and pet chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile', {
        petTurn: 24,
        nextMomentPetTurn: 30,
    }));
    const before = await getTavernPetPrivateSnapshotForChat(session.id);
    assert.ok(before);

    await advanceTavernPetStoryTurnForTest(session.id, [99]);
    const current = await getTavernPetPrivateSnapshotForChat(session.id);
    assert.ok(current);
    assert.ok(current.companion.state.petTurn > before.companion.state.petTurn);
    assert.equal(current.companion.state.phase, 'adult');

    const freshBoundary = await tavernPetMutationBoundary(session.id, 'parallel-pet-chat');
    const committed = await commitTavernPetChatResponse({
        ...freshBoundary,
        expectedRevision: before.companion.revision,
        expectedVersionId: before.companion.versionId,
        playerText: '外面刚刚很热闹',
        responseProfile: { phase: 'juvenile' },
        response: {
            face: TAVERN_PET_JUVENILE_PROFILE.faces.happy,
            text: '我也听见了。',
            motion: 'stare',
            emotionShift: null,
            murmur: null,
            summaryUpdate: null,
        },
    });

    const after = await getTavernPetPrivateSnapshotForChat(session.id);
    assert.ok(after);
    assert.equal(after.companion.state.petTurn, current.companion.state.petTurn);
    assert.deepEqual(after.companion.state.chatMemory.recent.at(-1), {
        playerText: '外面刚刚很热闹',
        petText: '我也听见了。',
    });
    assert.ok(current.companion.state.personaId);
    assert.equal(
        committed.view.latestUtterance?.face,
        getTavernPetDialogueProfile('adult', current.companion.state.personaId).faces.happy,
    );
    assert.notEqual(committed.view.latestUtterance?.face, TAVERN_PET_JUVENILE_PROFILE.faces.happy);
});

test('simultaneous stale global CAS writes leave exactly one visible update', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Concurrent A');
    const b = await createTavernPetTestSession('Concurrent B');
    await lureTavernPetForTest(a.id, 'concurrent-lure');
    const [first, second] = await Promise.all([
        tavernPetMutationBoundary(a.id, 'concurrent-feed-a'),
        tavernPetMutationBoundary(b.id, 'concurrent-feed-b'),
    ]);
    const results = await Promise.allSettled([
        interactWithTavernPet({ ...first, interactionId: 'feed' }),
        interactWithTavernPet({ ...second, interactionId: 'feed' }),
    ]);
    assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal((await getCurrentTavernPetView(a.id)).revision, 2);
});

test('letting it leave clears all three global tables without a refund', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Leave');
    await lureTavernPetForTest(session.id, 'leave-lure');
    const balance = await getTavernPlayerBalance(session.id);
    const view = await getCurrentTavernPetView(session.id);
    const result = await letTavernPetLeave({
        sessionId: session.id,
        boundary: (await tavernPetMutationBoundary(session.id, 'leave-boundary')).boundary,
        expectedRevision: view.revision,
        expectedVersionId: view.versionId,
    });
    assert.equal(result.view.existence, 'undiscovered');
    assert.equal(await getTavernPlayerBalance(session.id), balance);
    assert.equal(await (tavernPetCompanionTable as unknown as CountableTable).count(), 0);
    assert.equal(await (tavernPetActionsTable as unknown as CountableTable).count(), 0);
    assert.equal(await (tavernPetJournalTable as unknown as CountableTable).count(), 0);
});

test('v29 hard cut clears only pre-existing global pet rows and keeps formal session and economy data', async () => {
    await db.delete();
    const legacy = new Dexie('LittleWhiteBox_Tavern');
    const runtime = legacy as unknown as { table(name: string): { put(record: Record<string, unknown>): Promise<unknown> }; close(): void };
    legacy.version(28).stores({
        sessions: 'id, updatedAt',
        economyAccounts: '[sessionId+id], sessionId, kind, updatedAt',
        petCompanion: 'id',
        petActions: 'id, &revision, sourceSessionId, [sourceSessionId+sourceTurn], [sourceSessionId+sourceAnchorOrder], [sourceSessionId+sourceAnchorOrder+createdAt+id], createdAt',
        petJournal: 'id, sourceActionId, sourceSessionId, [sourceSessionId+sourceAnchorOrder], [sourceSessionId+createdAt+id], petTurn, [createdAt+id]',
    });
    await legacy.open();
    await runtime.table('sessions').put({ id: 'v28-session', title: 'preserved', createdAt: 1, updatedAt: 1 });
    await runtime.table('economyAccounts').put({ sessionId: 'v28-session', id: 'player', kind: 'player', balance: 73, createdAt: 1, updatedAt: 1 });
    await runtime.table('petCompanion').put({ id: 'companion', revision: 1, versionId: 'old', state: { old: true }, createdAt: 1, updatedAt: 1 });
    await runtime.table('petActions').put({ id: 'old-action', revision: 1 });
    await runtime.table('petJournal').put({ id: 'old-journal', sourceActionId: 'old-action' });
    await runtime.table('petJournal').put({ id: 'old-journal-duplicate', sourceActionId: 'old-action' });
    runtime.close();

    await db.open();
    assert.equal((await tavernSessionsTable.get('v28-session'))?.title, 'preserved');
    assert.equal((await tavernEconomyAccountsTable.get(['v28-session', 'player']))?.balance, 73);
    assert.equal(await tavernPetCompanionTable.count(), 0);
    assert.equal(await tavernPetActionsTable.count(), 0);
    assert.equal(await tavernPetJournalTable.count(), 0);
});
