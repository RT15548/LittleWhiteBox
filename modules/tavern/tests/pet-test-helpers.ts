import db, {
    appendTavernMessage,
    createTavernSession,
    getLatestTavernMessage,
    tavernPetStateVersionsTable,
    tavernSessionsTable,
    type TavernSessionRecord,
} from '../shared/session-db';
import { ensureTavernEconomy } from '../shared/economy/economy-service';
import { captureTavernPhoneBoundary } from '../shared/phone-boundary';
import {
    getTavernPetPrivateSnapshotForChat,
    interactWithTavernPet,
    lureTavernPet,
} from '../shared/pet/pet-service';
import { parseCanonicalTavernPetStateVersionRecord } from '../shared/pet/pet-invariants';
import { createTavernPetSequenceRandomSource } from '../shared/pet/pet-random';
import { createTavernPetLuringState } from '../shared/pet/pet-rules';
import { commitTavernAssistantResponseWithPetForLatestUser } from '../shared/pet/pet-story-turn';
import {
    TAVERN_PET_CURRENT_MARKER,
    type TavernPetMutationBoundary,
    type TavernPetPhase,
    type TavernPetState,
    type TavernPetStateVersionRecord,
} from '../shared/pet/pet-types';

export const PET_TEST_ORIGIN = Object.freeze({
    specimenNumber: 72,
    arrivalTurn: 1,
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
    const state = createTavernPetLuringState({
        origin: clone(PET_TEST_ORIGIN),
        currentTurn: 0,
        observedEconomyLedgerOrder: 0,
    });
    if (phase !== 'luring') {
        state.phase = phase;
        state.satiety = 50;
        if (phase === 'egg') {
            state.incubation = { feedCount: 0, tapCount: 0, bgmCount: 0 };
        }
        if (phase === 'adult') {
            state.axes = { tameness: 30, generosity: 30, brightness: 30 };
            state.personaId = 'sunlet';
            state.lastEvolutionActiveTurn = 0;
        }
    }
    return Object.assign(state, clone(overrides));
}

/**
 * Inserts one canonical current row for Controller-focused tests.
 * This fixture intentionally does not claim to be an archive-valid replay chain.
 */
export async function seedCurrentTavernPetState(
    sessionId: string,
    state: TavernPetState,
): Promise<TavernPetStateVersionRecord> {
    await ensureTavernEconomy(sessionId);
    const [session, latestMessage] = await Promise.all([
        tavernSessionsTable.get(sessionId),
        getLatestTavernMessage(sessionId),
    ]);
    if (!session) {throw new Error('pet_test_session_missing');}
    const timestamp = Date.now();
    const record = parseCanonicalTavernPetStateVersionRecord({
        sessionId,
        revision: 1,
        versionId: `pet-test-version:${sessionId}`,
        currentMarker: TAVERN_PET_CURRENT_MARKER,
        actionId: `pet-test-seed:${sessionId}`,
        action: { kind: 'lure', origin: clone(state.origin) },
        anchorOrder: Math.max(0, Number(latestMessage?.order ?? -1) + 1),
        turn: Number(session.state?.turn || 0),
        state: clone(state),
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    await tavernPetStateVersionsTable.put(record);
    return record;
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
        expectedRevision: snapshot?.record.revision || 0,
        expectedVersionId: snapshot?.record.versionId || '',
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
    const previousTurn = Number(session.state?.turn || 0);
    const nextTurn = previousTurn + 1;
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

export async function advanceTavernPetToAdultPendingForTest(
    sessionId: string,
): Promise<TavernPetStateVersionRecord> {
    if (!await getTavernPetPrivateSnapshotForChat(sessionId)) {
        await lureTavernPetForTest(sessionId);
    }
    for (let index = 0; index < 70; index += 1) {
        const snapshot = await getTavernPetPrivateSnapshotForChat(sessionId);
        if (!snapshot) {throw new Error('pet_test_state_missing');}
        if (snapshot.record.state.pendingEvolution) {return snapshot.record;}
        if (snapshot.record.state.dormant) {throw new Error('pet_test_matured_dormant');}
        if (snapshot.record.state.phase !== 'luring' && snapshot.record.state.satiety <= 12) {
            await interactWithTavernPet({
                ...await tavernPetMutationBoundary(sessionId, `pet-test-feed:${snapshot.record.turn}:${index}`),
                interactionId: 'feed',
            });
        }
        await advanceTavernPetStoryTurnForTest(sessionId, [99]);
    }
    throw new Error('pet_test_adulthood_timeout');
}

export async function advanceTavernPetUntilDormantForTest(
    sessionId: string,
): Promise<TavernPetStateVersionRecord> {
    for (let index = 0; index < 30; index += 1) {
        const snapshot = await getTavernPetPrivateSnapshotForChat(sessionId);
        if (!snapshot) {throw new Error('pet_test_state_missing');}
        if (snapshot.record.state.dormant) {return snapshot.record;}
        await advanceTavernPetStoryTurnForTest(sessionId, [99]);
    }
    throw new Error('pet_test_dormant_timeout');
}
