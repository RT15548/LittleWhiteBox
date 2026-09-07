import { parseLearningData } from '../../../domains/learning/data.js';
import type { LearningData } from '../../../domains/learning/types.js';
import type { JsonUserFilePort } from '../../../storage/sidecar-index.js';
import { XiaobaiOsStorageError } from '../../../storage/storage-port.js';
import { createLearningId } from '../application/identity.js';
import { LEARNING_FILENAME, MAX_LEARNING_WRITE_BYTES, parseLearningDocument, sameLearningDocument, type LearningDocument } from './document.js';

export class LearningStorageError extends Error {
    constructor(readonly code: string) { super(code); }
}

type SaveResult = (
    | { status: 'confirmed' | 'unchanged'; document: LearningDocument | null }
    | { status: 'cancelled' | 'unconfirmed' | 'conflict' }) & { commitId?: string };

interface PendingWrite {
    expected: LearningDocument | null;
    candidate: LearningDocument;
}

/** One instance per host session; closing the OS must not discard an uncertain upload. */
export function createLearningRepository(files: JsonUserFilePort, options: {
    createId?: () => string;
} = {}) {
    const createId = options.createId ?? createLearningId;
    let confirmed: LearningDocument | null | undefined;
    let pending: PendingWrite | null = null;
    let conflict = false;
    let queue: Promise<unknown> = Promise.resolve();

    function enqueue<T>(work: () => Promise<T>): Promise<T> {
        const result = queue.then(work, work);
        queue = result.catch(() => undefined);
        return result;
    }

    async function readFile(): Promise<LearningDocument | null> {
        let raw;
        try { raw = await files.read(LEARNING_FILENAME); }
        catch { throw new LearningStorageError('learning_read_failed'); }
        if (raw === null) { return null; }
        try { return parseLearningDocument(raw); }
        catch { throw new LearningStorageError('learning_file_invalid'); }
    }

    function snapshot() {
        return { document: structuredClone(confirmed),
            status: conflict ? 'conflict' as const : pending ? 'unconfirmed' as const : confirmed === undefined ? 'unloaded' as const : 'ready' as const };
    }

    async function inspectPending(): Promise<{ result: SaveResult; observed?: LearningDocument | null }> {
        if (!pending) { return { result: { status: conflict ? 'conflict' : 'unchanged', document: structuredClone(confirmed ?? null) } }; }
        let observed;
        try { observed = await readFile(); }
        catch { return { result: { status: 'unconfirmed' } }; }
        if (sameLearningDocument(observed, pending.candidate)) {
            confirmed = observed;
            pending = null;
            conflict = false;
            return { result: { status: 'confirmed', document: structuredClone(confirmed) }, observed };
        }
        conflict = !sameLearningDocument(observed, pending.expected);
        return { result: { status: conflict ? 'conflict' : 'unconfirmed' }, observed };
    }

    async function verifyWrite(): Promise<SaveResult> {
        return (await inspectPending()).result;
    }

    async function ensureLoaded(): Promise<void> {
        if (confirmed === undefined) { confirmed = await readFile(); }
    }

    async function upload(entry: PendingWrite): Promise<SaveResult> {
        pending = entry;
        try {
            await files.replace(LEARNING_FILENAME, structuredClone(entry.candidate));
            confirmed = entry.candidate;
            pending = null;
            conflict = false;
            return { status: 'confirmed', document: structuredClone(confirmed), commitId: entry.candidate.commitId };
        } catch (error) {
            const status = error instanceof XiaobaiOsStorageError ? error.httpStatus : undefined;
            if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
                pending = null;
                throw new LearningStorageError('learning_write_rejected');
            }
            // A rejected fetch may still complete on the server. Never resend it on this evidence alone.
        }
        return { ...await verifyWrite(), commitId: entry.candidate.commitId };
    }

    function save(expected: LearningDocument | null, data: LearningData, isCurrent: () => boolean): Promise<SaveResult> {
        // Freeze caller inputs before entering the queue; queued changes cannot mutate this intent.
        const baseline = expected === null ? null : parseLearningDocument(expected);
        const next = parseLearningData(data);
        return enqueue(async () => {
            if (!isCurrent()) { return { status: 'cancelled' }; }
            if (pending || conflict) { throw new LearningStorageError('learning_resolve_pending_first'); }
            await ensureLoaded();
            const observed = confirmed ?? null;
            if (!isCurrent()) { return { status: 'cancelled' }; }
            if (baseline?.revision !== observed?.revision || baseline?.commitId !== observed?.commitId) {
                return { status: 'cancelled' };
            }
            confirmed = observed;
            if (JSON.stringify(observed?.data ?? { profiles: [] }) === JSON.stringify(next)) {
                return { status: 'unchanged', document: structuredClone(observed) };
            }
            const candidate = parseLearningDocument({ schemaVersion: 1, revision: (observed?.revision ?? 0) + 1,
                commitId: createId(), data: next });
            if (candidate.commitId === observed?.commitId) { throw new LearningStorageError('learning_commit_id_reused'); }
            if (new TextEncoder().encode(JSON.stringify(candidate)).byteLength > MAX_LEARNING_WRITE_BYTES) {
                throw new LearningStorageError('learning_file_full');
            }
            if (!isCurrent()) { return { status: 'cancelled' }; }
            return upload({ expected: observed, candidate });
        });
    }

    return Object.freeze({
        snapshot,
        pendingCommitId: () => pending?.candidate.commitId ?? null,
        save,
        read: () => enqueue(async () => {
            await ensureLoaded();
            return snapshot();
        }),
        refresh: () => enqueue(async () => {
            if (!pending && !conflict) { confirmed = await readFile(); }
            return snapshot();
        }),
        verify: () => enqueue(verifyWrite),
        retry: (isCurrent: () => boolean) => enqueue(async (): Promise<SaveResult> => {
            const { result, observed } = await inspectPending();
            if (!pending || result.status === 'conflict' || result.status === 'confirmed') { return result; }
            if (observed === undefined) { return { status: 'unconfirmed' }; }
            if (!isCurrent()) { return { status: 'cancelled' }; }
            // The single read above found the original baseline. Reuse this exact candidate/commit ID.
            return upload(pending);
        }),
        adoptServer: () => enqueue(async () => {
            const observed = await readFile();
            confirmed = observed;
            pending = null;
            conflict = false;
            return snapshot();
        }),
        clear: (expected: LearningDocument | null, isCurrent: () => boolean) => save(expected, { profiles: [] }, isCurrent),
    });
}
