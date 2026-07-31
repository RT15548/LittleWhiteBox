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
import { createTavernPetEggState, deriveTavernPetPersona } from '../shared/pet/pet-rules';
import {
    appendTavernPetTransitionInCurrentDbTransaction,
    getTavernPetCompanionInCurrentDbTransaction,
    getTavernPetPrivateSnapshotForChat,
    lureTavernPet,
} from '../shared/pet/pet-service';
import { commitTavernAssistantResponseWithPetForLatestUser } from '../shared/pet/pet-story-turn';
import type {
    TavernPetMutationBoundary,
    TavernPetOrigin,
    TavernPetPhase,
    TavernPetState,
} from '../shared/pet/pet-types';

export const PET_TEST_ORIGIN: TavernPetOrigin = Object.freeze({
    specimenNumber: 72,
    birthBias: Object.freeze({ closeness: 1, sharing: 1, tempo: 1 }),
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

/** Builds only canonical hard-cut state shapes for direct domain fixtures. */
export function createTavernPetTestState(
    phase: TavernPetPhase,
    overrides: Partial<TavernPetState> = {},
): TavernPetState {
    const state = createTavernPetEggState({ origin: clone(PET_TEST_ORIGIN) });
    if (phase === 'juvenile') {
        state.phase = 'juvenile';
        state.petTurn = 1;
        state.nextMomentPetTurn = 7;
    } else if (phase === 'adult') {
        state.phase = 'adult';
        state.petTurn = 30;
        state.personaId = deriveTavernPetPersona(state);
        state.lastEvolutionPetTurn = 25;
        state.nextMomentPetTurn = 36;
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
        createTavernPetSequenceRandomSource([71, 15, 15, 15]),
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
