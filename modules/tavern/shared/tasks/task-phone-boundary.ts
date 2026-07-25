import {
    assertTavernPhoneBoundaryInCurrentTransaction,
    captureTavernPhoneBoundary,
    tavernPhoneBoundaryAnchorOrder,
    TavernPhoneBoundaryError,
} from '../phone-boundary';
import {
    throwTavernTaskError,
    type TavernTaskExpectedPhoneBoundary,
    type TavernTaskPhoneBoundary,
} from './task-types';

function rethrowAsTaskTimelineConflict(error: unknown): never {
    if (error instanceof TavernPhoneBoundaryError) {
        throwTavernTaskError('task_timeline_conflict');
    }
    throw error;
}

export async function captureTavernTaskPhoneBoundary(
    sessionId = '',
): Promise<TavernTaskExpectedPhoneBoundary> {
    try {
        return await captureTavernPhoneBoundary(sessionId);
    } catch (error) {
        rethrowAsTaskTimelineConflict(error);
    }
}

export function tavernTaskPhoneBoundaryAnchorOrder(
    boundary: TavernTaskExpectedPhoneBoundary,
): number {
    try {
        return tavernPhoneBoundaryAnchorOrder(boundary);
    } catch (error) {
        rethrowAsTaskTimelineConflict(error);
    }
}

/** Must run inside a write transaction that includes the messages table. */
export async function assertTavernTaskPhoneBoundaryInCurrentTransaction(
    sessionId: string,
    boundary: TavernTaskExpectedPhoneBoundary,
): Promise<TavernTaskPhoneBoundary | null> {
    try {
        return await assertTavernPhoneBoundaryInCurrentTransaction(sessionId, boundary);
    } catch (error) {
        rethrowAsTaskTimelineConflict(error);
    }
}
