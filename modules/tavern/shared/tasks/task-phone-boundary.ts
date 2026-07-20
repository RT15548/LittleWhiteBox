import {
    getLatestTavernMessage,
    type TavernMessageRecord,
} from '../session-db';
import {
    throwTavernTaskError,
    type TavernTaskExpectedPhoneBoundary,
    type TavernTaskPhoneBoundary,
} from './task-types';

function normalizeTimelineRevision(value: unknown): number {
    return Math.max(1, Math.floor(Number(value) || 1));
}

function normalizeBoundary(boundary: TavernTaskExpectedPhoneBoundary): TavernTaskExpectedPhoneBoundary {
    if (boundary === null) {return null;}
    const messageId = String(boundary?.messageId || '').trim();
    const order = Number(boundary?.order);
    const timelineRevision = Number(boundary?.timelineRevision);
    if (
        !messageId
        || !Number.isSafeInteger(order)
        || order < 0
        || !Number.isSafeInteger(timelineRevision)
        || timelineRevision < 1
    ) {
        throwTavernTaskError('task_timeline_conflict');
    }
    return { messageId, order, timelineRevision };
}

function boundaryFromMessage(message: TavernMessageRecord | null): TavernTaskExpectedPhoneBoundary {
    if (!message) {return null;}
    return {
        messageId: String(message.messageId || '').trim(),
        order: Math.floor(Number(message.order)),
        timelineRevision: normalizeTimelineRevision(message.timelineRevision),
    };
}

function sameBoundary(
    current: TavernTaskExpectedPhoneBoundary,
    expected: TavernTaskExpectedPhoneBoundary,
): boolean {
    if (current === null || expected === null) {return current === expected;}
    return current.messageId === expected.messageId
        && current.order === expected.order
        && current.timelineRevision === expected.timelineRevision;
}

export async function captureTavernTaskPhoneBoundary(
    sessionId = '',
): Promise<TavernTaskExpectedPhoneBoundary> {
    return normalizeBoundary(boundaryFromMessage(await getLatestTavernMessage(sessionId)));
}

export function tavernTaskPhoneBoundaryAnchorOrder(
    boundary: TavernTaskExpectedPhoneBoundary,
): number {
    const normalized = normalizeBoundary(boundary);
    return (normalized?.order ?? -1) + 1;
}

/** Must run inside a write transaction that includes the messages table. */
export async function assertTavernTaskPhoneBoundaryInCurrentTransaction(
    sessionId: string,
    boundary: TavernTaskExpectedPhoneBoundary,
): Promise<TavernTaskPhoneBoundary | null> {
    const expected = normalizeBoundary(boundary);
    const current = boundaryFromMessage(await getLatestTavernMessage(sessionId));
    if (!sameBoundary(current, expected)) {
        throwTavernTaskError('task_timeline_conflict');
    }
    return expected;
}
