import db, {
    tavernSessionsTable,
    tavernTaskBoardsTable,
} from '../session-db';
import {
    normalizeTavernTaskAnchorOrder,
    normalizeTavernTaskListings,
    parseTavernTaskBoardResponse,
    throwTavernTaskError,
    type TavernTaskBoardRecord,
    type TavernTaskListing,
    type TaskBoardParseOptions,
} from './task-types';

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

export interface ReplaceTavernTaskBoardInput {
    sessionId: string;
    expectedRevision: number;
    anchorOrder: number;
    listings: TavernTaskListing[];
    generationId?: string;
    generatedAt?: number;
}

export async function getTavernTaskBoard(value = ''): Promise<TavernTaskBoardRecord | null> {
    const id = sessionId(value);
    return await tavernTaskBoardsTable.get(id) || null;
}

/**
 * Replaces the single current board only after a successful parse/validation.
 * A stale generation cannot overwrite a newer board because the comparison and
 * replacement happen in the same transaction.
 */
export async function replaceTavernTaskBoard(input: ReplaceTavernTaskBoardInput): Promise<TavernTaskBoardRecord> {
    const id = sessionId(input.sessionId);
    const expected = expectedRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const listings = normalizeTavernTaskListings(input.listings, { min: 6, max: 6 });
    const generationId = String(input.generationId || '').trim() || createId('task-board');
    const generatedAt = Number(input.generatedAt ?? now());
    if (!Number.isSafeInteger(generatedAt) || generatedAt <= 0) {
        throwTavernTaskError('task_board_payload_invalid', 'generatedAt');
    }
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernTaskBoardsTable,
        async () => {
            const [session, current] = await Promise.all([
                tavernSessionsTable.get(id),
                tavernTaskBoardsTable.get(id),
            ]);
            if (!session) {throwTavernTaskError('task_session_missing', id);}
            const currentRevision = Number(current?.revision) || 0;
            if (currentRevision !== expected) {
                throwTavernTaskError('task_board_revision_conflict', `${expected}:${currentRevision}`);
            }
            const record: TavernTaskBoardRecord = {
                sessionId: id,
                generationId,
                revision: currentRevision + 1,
                anchorOrder,
                listings,
                generatedAt,
            };
            await tavernTaskBoardsTable.put(record);
            await tavernSessionsTable.update(id, { updatedAt: now() });
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
