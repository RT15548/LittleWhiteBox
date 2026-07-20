import db, {
    tavernMessagesTable,
    tavernSessionsTable,
    tavernTaskBoardsTable,
} from '../session-db';
import {
    normalizeTavernTaskAnchorOrder,
    normalizeTavernTaskBoardRecord,
    normalizeTavernTaskListings,
    parseTavernTaskBoardResponse,
    throwTavernTaskError,
    type TavernTaskBoardRecord,
    type TavernTaskBoardState,
    type TavernTaskExpectedPhoneBoundary,
    type TavernTaskListing,
    type TaskBoardParseOptions,
} from './task-types';
import {
    assertTavernTaskPhoneBoundaryInCurrentTransaction,
    tavernTaskPhoneBoundaryAnchorOrder,
} from './task-phone-boundary';

export { parseTavernTaskBoardResponse, parseTavernTaskCandidatesResponse } from './task-types';

function now(): number {
    return Date.now();
}

function createId(prefix: string): string {
    return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function sessionId(value = ''): string {
    const id = String(value || '').trim();
    if (!id) {throwTavernTaskError('task_session_required');}
    return id;
}

function expectedRevision(value: unknown): number {
    const revision = Number(value);
    if (!Number.isSafeInteger(revision) || revision < 0) {
        throwTavernTaskError('task_board_revision_invalid', String(value));
    }
    return revision;
}

function expectedEpoch(value: unknown): number {
    const epoch = Number(value);
    if (!Number.isSafeInteger(epoch) || epoch < 1) {
        throwTavernTaskError('task_board_epoch_invalid', String(value));
    }
    return epoch;
}

export interface ReplaceTavernTaskBoardInput {
    sessionId: string;
    expectedRevision: number;
    expectedEpoch: number;
    boundary: TavernTaskExpectedPhoneBoundary;
    listings: TavernTaskListing[];
    generationId?: string;
    generatedAt?: number;
}

export async function getTavernTaskBoard(value = ''): Promise<TavernTaskBoardRecord | null> {
    const id = sessionId(value);
    const record = await tavernTaskBoardsTable.get(id);
    return record || null;
}

export async function getTavernTaskBoardState(value = ''): Promise<TavernTaskBoardState> {
    const id = sessionId(value);
    return await db.transaction('r', tavernSessionsTable, tavernTaskBoardsTable, async () => {
        const [session, record] = await Promise.all([
            tavernSessionsTable.get(id),
            tavernTaskBoardsTable.get(id),
        ]);
        if (!session) {throwTavernTaskError('task_session_missing', id);}
        return {
            board: record || null,
            revision: Number(record?.revision) || 0,
            epoch: Math.max(1, Math.floor(Number(session.taskBoardEpoch) || 1)),
        };
    });
}

/**
 * Replaces the single current board only after a successful parse/validation.
 * A stale generation cannot overwrite a newer board because the comparison and
 * replacement happen in the same transaction.
 */
export async function replaceTavernTaskBoard(input: ReplaceTavernTaskBoardInput): Promise<TavernTaskBoardRecord> {
    const id = sessionId(input.sessionId);
    const expected = expectedRevision(input.expectedRevision);
    const expectedEpochValue = expectedEpoch(input.expectedEpoch);
    const anchorOrder = normalizeTavernTaskAnchorOrder(tavernTaskPhoneBoundaryAnchorOrder(input.boundary));
    const listings = normalizeTavernTaskListings(input.listings, { min: 6, max: 6 });
    const generationId = String(input.generationId || '').trim() || createId('task-board');
    const generatedAt = Number(input.generatedAt ?? now());
    if (!Number.isSafeInteger(generatedAt) || generatedAt <= 0) {
        throwTavernTaskError('task_board_payload_invalid', 'generatedAt');
    }
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernTaskBoardsTable,
        async () => {
            const [session, current] = await Promise.all([
                tavernSessionsTable.get(id),
                tavernTaskBoardsTable.get(id),
            ]);
            if (!session) {throwTavernTaskError('task_session_missing', id);}
            await assertTavernTaskPhoneBoundaryInCurrentTransaction(id, input.boundary);
            const currentRevision = Number(current?.revision) || 0;
            const currentEpoch = Math.max(1, Math.floor(Number(session.taskBoardEpoch) || 1));
            if (currentRevision !== expected) {
                throwTavernTaskError('task_board_revision_conflict', `${expected}:${currentRevision}`);
            }
            if (currentEpoch !== expectedEpochValue) {
                throwTavernTaskError('task_board_epoch_conflict', `${expectedEpochValue}:${currentEpoch}`);
            }
            const nextEpoch = currentEpoch + 1;
            const record = normalizeTavernTaskBoardRecord({
                sessionId: id,
                generationId,
                revision: currentRevision + 1,
                epoch: nextEpoch,
                anchorOrder,
                listings,
                generatedAt,
            });
            await tavernTaskBoardsTable.put(record);
            await tavernSessionsTable.update(id, { taskBoardEpoch: nextEpoch, updatedAt: now() });
            return record;
        },
    );
}

export async function replaceTavernTaskBoardFromResponse(input: Omit<ReplaceTavernTaskBoardInput, 'listings'> & {
    responseText: string;
    parseOptions?: TaskBoardParseOptions;
}): Promise<TavernTaskBoardRecord> {
    const listings = parseTavernTaskBoardResponse(input.responseText, {
        ...(input.parseOptions || {}),
    });
    return await replaceTavernTaskBoard({ ...input, listings });
}
