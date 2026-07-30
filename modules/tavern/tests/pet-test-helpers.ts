import db, {
    appendTavernMessage,
    createTavernSession,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernMessagesTable,
    tavernPetActionsTable,
    tavernPetCompanionTable,
    tavernPetJournalTable,
    tavernSessionsTable,
    type TavernSessionRecord,
} from '../shared/session-db';
import { ensureTavernEconomy } from '../shared/economy/economy-service';
import { captureTavernPhoneBoundary } from '../shared/phone-boundary';
import { createTavernPetSequenceRandomSource } from '../shared/pet/pet-random';
import { createTavernPetLuringState } from '../shared/pet/pet-rules';
import {
    appendTavernPetTransitionInCurrentDbTransaction,
    getTavernPetCompanionInCurrentDbTransaction,
    getTavernPetPrivateSnapshotForChat,
    lureTavernPet,
} from '../shared/pet/pet-service';
import { commitTavernAssistantResponseWithPetForLatestUser } from '../shared/pet/pet-story-turn';
import type {
    TavernPetMutationBoundary,
    TavernPetPhase,
    TavernPetState,
} from '../shared/pet/pet-types';

export const PET_TEST_ORIGIN = Object.freeze({
    specimenNumber: 72,
    arrivalAfterTurns: 1,
    birthBias: { tameness: 1, generosity: 1, brightness: 1 },
});

function clone<T>(value: T): T {
    return structuredClone(value);
}

export async function resetTavernPetTestDb(): Promise<void> {
    await db.delete();
    await db.open();
}

export async function createTavernPetTestSession(
    title: string,
    overrides: Partial<Parameters<typeof createTavernSession>[0]> = {},
): Promise<TavernSessionRecord> {
    const session = await createTavernSession({ title, ...overrides });
    await ensureTavernEconomy(session.id);
    return session;
}

export function createTavernPetTestState(
    phase: TavernPetPhase,
    overrides: Partial<TavernPetState> = {},
): TavernPetState {
    const state = createTavernPetLuringState({ origin: clone(PET_TEST_ORIGIN), petTurn: 0 });
    if (phase !== 'luring') {
        state.phase = phase;
        state.satiety = 50;
        if (phase === 'egg') {
            state.incubation = { feedCount: 0, tapCount: 0, bgmCount: 0 };
        }
        if (phase === 'juvenile') {
            state.phaseTurnCount = 1;
        }
        if (phase === 'adult') {
            state.phaseTurnCount = 1;
            state.axes = { tameness: 30, generosity: 30, brightness: 30 };
            state.personaId = 'sunlet';
            state.lastEvolutionActiveTurn = 0;
        }
    }
    return Object.assign(state, clone(overrides));
}

export async function seedTavernPetForTest(
    sessionId: string,
    state: TavernPetState,
    actionId = `pet-test-seed:${sessionId}`,
): Promise<void> {
    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernPetCompanionTable,
        tavernPetActionsTable,
        tavernPetJournalTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throw new Error('pet_test_session_missing');}
            const current = await getTavernPetCompanionInCurrentDbTransaction();
            await appendTavernPetTransitionInCurrentDbTransaction({
                current,
                actionId,
                sourceSessionId: sessionId,
                sourceTurn: Number(session.state?.turn || 0),
                sourceAnchorOrder: 0,
                action: { kind: 'lure', origin: clone(state.origin) },
                state,
            });
        },
    );
}

export async function tavernPetMutationBoundary(
    sessionId: string,
    actionId: string,
): Promise<TavernPetMutationBoundary> {
    const snapshot = await getTavernPetPrivateSnapshotForChat(sessionId);
    return {
        sessionId,
        boundary: await captureTavernPhoneBoundary(sessionId),
        actionId,
        expectedRevision: snapshot?.companion.revision || 0,
        expectedVersionId: snapshot?.companion.versionId || '',
    };
}

export async function lureTavernPetForTest(
    sessionId: string,
    actionId = 'pet-test-lure',
) {
    return await lureTavernPet(
        await tavernPetMutationBoundary(sessionId, actionId),
        createTavernPetSequenceRandomSource([71, 0, 15, 15, 15]),
    );
}

export async function advanceTavernPetStoryTurnForTest(
    sessionId: string,
    randomValues: readonly number[] = [99],
) {
    const session = await tavernSessionsTable.get(sessionId);
    if (!session) {throw new Error('pet_test_session_missing');}
    const nextTurn = Number(session.state?.turn || 0) + 1;
    const user = await appendTavernMessage(sessionId, {
        role: 'user',
        content: `Pet test turn ${nextTurn}`,
    });
    return await commitTavernAssistantResponseWithPetForLatestUser(
        sessionId,
        user,
        { role: 'assistant', content: `Pet test assistant ${nextTurn}`, error: false },
        { sessionState: { turn: nextTurn } },
        { random: createTavernPetSequenceRandomSource(randomValues) },
    );
}
