import {
    getLatestTavernMessage,
    type TavernMessageRecord,
} from './session-db';

export interface TavernPhoneBoundary {
    messageId: string;
    order: number;
    timelineRevision: number;
}

export type TavernExpectedPhoneBoundary = TavernPhoneBoundary | null;

export type TavernPhoneBoundaryErrorCode =
    | 'phone_boundary_invalid'
    | 'phone_timeline_conflict';

export class TavernPhoneBoundaryError extends Error {
    readonly code: TavernPhoneBoundaryErrorCode;

    constructor(code: TavernPhoneBoundaryErrorCode, detail = '') {
        super(detail ? `${code}:${detail}` : code);
        this.name = 'TavernPhoneBoundaryError';
        this.code = code;
    }
}

export function throwTavernPhoneBoundaryError(code: TavernPhoneBoundaryErrorCode, detail = ''): never {
    throw new TavernPhoneBoundaryError(code, detail);
}

function normalizeTimelineRevision(value: unknown): number {
    return Math.max(1, Math.floor(Number(value) || 1));
}

export function normalizeTavernExpectedPhoneBoundary(
    boundary: TavernExpectedPhoneBoundary,
): TavernExpectedPhoneBoundary {
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
        throwTavernPhoneBoundaryError('phone_boundary_invalid');
    }
    return { messageId, order, timelineRevision };
}

function boundaryFromMessage(message: TavernMessageRecord | null): TavernExpectedPhoneBoundary {
    if (!message) {return null;}
    return {
        messageId: String(message.messageId || '').trim(),
        order: Math.floor(Number(message.order)),
        timelineRevision: normalizeTimelineRevision(message.timelineRevision),
    };
}

function sameBoundary(
    current: TavernExpectedPhoneBoundary,
    expected: TavernExpectedPhoneBoundary,
): boolean {
    if (current === null || expected === null) {return current === expected;}
    return current.messageId === expected.messageId
        && current.order === expected.order
        && current.timelineRevision === expected.timelineRevision;
}

export async function captureTavernPhoneBoundary(
    sessionId = '',
): Promise<TavernExpectedPhoneBoundary> {
    return normalizeTavernExpectedPhoneBoundary(boundaryFromMessage(await getLatestTavernMessage(sessionId)));
}

export function tavernPhoneBoundaryAnchorOrder(
    boundary: TavernExpectedPhoneBoundary,
): number {
    const normalized = normalizeTavernExpectedPhoneBoundary(boundary);
    return (normalized?.order ?? -1) + 1;
}

/** Must run inside a write transaction that includes the messages table. */
export async function assertTavernPhoneBoundaryInCurrentTransaction(
    sessionId: string,
    boundary: TavernExpectedPhoneBoundary,
): Promise<TavernPhoneBoundary | null> {
    const expected = normalizeTavernExpectedPhoneBoundary(boundary);
    const current = boundaryFromMessage(await getLatestTavernMessage(sessionId));
    if (!sameBoundary(current, expected)) {
        throwTavernPhoneBoundaryError('phone_timeline_conflict');
    }
    return expected;
}
