import { parseLearningData } from '../../../domains/learning/data.js';
import { mergeLearningExposure } from '../../../domains/learning/merge-exposure.js';
import type { LearningData } from '../../../domains/learning/types.js';
import type { JsonUserFilePort } from '../../../kernel/contracts.js';
import { JsonUserFileParseError, XiaobaiOsStorageError } from '../../../storage/storage-port.js';
import { createLearningId } from '../application/identity.js';
import { LEARNING_FILENAME, MAX_LEARNING_WRITE_BYTES, parseLearningDocument, sameLearningDocument, type LearningDocument } from './document.js';

export class LearningStorageError extends Error {
    constructor(readonly code: string) { super(code); }
}

type SaveResult = (
    | { status: 'confirmed' | 'unchanged'; document: LearningDocument | null }
    | { status: 'cancelled' | 'unconfirmed' | 'conflict' }) & { commitId?: string };

/** Runtime-only acknowledgement of this exact write, including later verification. */
export type LearningSaveConfirmation = (result: Extract<SaveResult, { status: 'confirmed' | 'unchanged' }>) => void;

interface PendingWrite {
    expected: LearningDocument | null;
    candidate: LearningDocument;
    onConfirmed?: LearningSaveConfirmation;
    invalidBaseline?: InvalidLearningFile;
}

type InvalidLearningFile = { kind: 'json'; source: string } | { kind: 'document'; value: unknown };

/** One instance per host session; closing the OS must not discard an uncertain upload. */
export function createLearningRepository(files: JsonUserFilePort, options: {
    createId?: () => string;
    now?: () => string;
} = {}) {
    const createId = options.createId ?? createLearningId;
    const now = options.now ?? (() => new Date().toISOString());
    // A v1 file is upgraded on every read until the first save; one stamp keeps those reads identical, not a false conflict.
    let upgradedAt: string | undefined;
    const upgradeClock = () => (upgradedAt ??= now());
    let confirmed: LearningDocument | null | undefined;
    let pending: PendingWrite | null = null;
    let conflict = false;
    let invalidFile: InvalidLearningFile | null = null;
    let queue: Promise<unknown> = Promise.resolve();

    function enqueue<T>(work: () => Promise<T>): Promise<T> {
        const result = queue.then(work, work);
        queue = result.catch(() => undefined);
        return result;
    }

    async function readFile(): Promise<LearningDocument | null> {
        let raw;
        try { raw = await files.read(LEARNING_FILENAME); }
        catch (error) {
            if (!(error instanceof JsonUserFileParseError)) { throw new LearningStorageError('learning_read_failed'); }
            invalidFile = { kind: 'json', source: error.source };
            throw new LearningStorageError('learning_file_invalid');
        }
        if (raw === null) { invalidFile = null; return null; }
        try { const document = parseLearningDocument(raw, upgradeClock); invalidFile = null; return document; }
        catch { invalidFile = { kind: 'document', value: structuredClone(raw) }; throw new LearningStorageError('learning_file_invalid'); }
    }

    function snapshot() {
        return { document: structuredClone(confirmed),
            status: invalidFile && (!pending?.invalidBaseline || conflict) ? 'invalid' as const : conflict ? 'conflict' as const : pending ? 'unconfirmed' as const : confirmed === undefined ? 'unloaded' as const : 'ready' as const };
    }

    function accept(entry: PendingWrite, document: LearningDocument): SaveResult {
        confirmed = document;
        invalidFile = null;
        pending = null;
        conflict = false;
        const result = { status: 'confirmed' as const, document: structuredClone(document), commitId: document.commitId };
        entry.onConfirmed?.(result);
        return result;
    }

    async function inspectPending(): Promise<{ result: SaveResult; observed?: LearningDocument | null }> {
        if (!pending) { return { result: { status: conflict ? 'conflict' : 'unchanged', document: structuredClone(confirmed ?? null) } }; }
        let observed;
        try { observed = await readFile(); }
        catch (error) {
            if (error instanceof LearningStorageError && error.code === 'learning_file_invalid') {
                conflict = !pending.invalidBaseline || JSON.stringify(invalidFile) !== JSON.stringify(pending.invalidBaseline);
                return { result: { status: conflict ? 'conflict' : 'unconfirmed' }, ...(conflict ? {} : { observed: null }) };
            }
            return { result: { status: 'unconfirmed' } };
        }
        if (sameLearningDocument(observed, pending.candidate)) {
            return { result: accept(pending, observed!), observed };
        }
        conflict = !sameLearningDocument(observed, pending.expected);
        return { result: { status: conflict ? 'conflict' : 'unconfirmed' }, observed };
    }

    async function verifyWrite(): Promise<SaveResult> {
        return (await inspectPending()).result;
    }

    async function ensureLoaded(): Promise<void> {
        if (confirmed === undefined || invalidFile) { confirmed = await readFile(); }
    }

    async function upload(entry: PendingWrite): Promise<SaveResult> {
        pending = entry;
        try {
            await files.replace(LEARNING_FILENAME, structuredClone(entry.candidate));
        } catch (error) {
            const status = error instanceof XiaobaiOsStorageError ? error.httpStatus : undefined;
            if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
                pending = null;
                throw new LearningStorageError('learning_write_rejected');
            }
            // A rejected fetch may still complete on the server. Never resend it on this evidence alone.
            return { ...await verifyWrite(), commitId: entry.candidate.commitId };
        }
        return accept(entry, entry.candidate);
    }

    function save(expected: LearningDocument | null, data: LearningData, isCurrent: () => boolean, onConfirmed?: LearningSaveConfirmation): Promise<SaveResult> {
        // Freeze caller inputs before entering the queue; queued changes cannot mutate this intent.
        const baseline = expected === null ? null : parseLearningDocument(expected);
        const next = parseLearningData(data);
        return enqueue(() => saveNow(baseline, next, isCurrent, onConfirmed));
    }

    async function saveNow(baseline: LearningDocument | null, next: LearningData, isCurrent: () => boolean, onConfirmed?: LearningSaveConfirmation): Promise<SaveResult> {
        if (!isCurrent()) { return { status: 'cancelled' }; }
        if (pending || conflict) { throw new LearningStorageError('learning_resolve_pending_first'); }
        await ensureLoaded();
        const observed = confirmed ?? null;
        if (!isCurrent()) { return { status: 'cancelled' }; }
        const rebased = baseline?.revision !== observed?.revision || baseline?.commitId !== observed?.commitId
            ? baseline && observed ? mergeLearningExposure(baseline.data, observed.data, next) : null : next;
        if (!rebased) { return { status: 'cancelled' }; }
        confirmed = observed;
        if (JSON.stringify(observed?.data ?? { profiles: [] }) === JSON.stringify(rebased)) {
            const result = { status: 'unchanged' as const, document: structuredClone(observed) };
            onConfirmed?.(result);
            return result;
        }
        const candidate = parseLearningDocument({ schemaVersion: 2, revision: (observed?.revision ?? 0) + 1,
            commitId: createId(), data: rebased });
        if (candidate.commitId === observed?.commitId) { throw new LearningStorageError('learning_commit_id_reused'); }
        if (new TextEncoder().encode(JSON.stringify(candidate)).byteLength > MAX_LEARNING_WRITE_BYTES) {
            throw new LearningStorageError('learning_file_full');
        }
        if (!isCurrent()) { return { status: 'cancelled' }; }
        return upload({ expected: observed, candidate, onConfirmed });
    }

    return Object.freeze({
        snapshot,
        pendingCommitId: () => pending?.candidate.commitId ?? null,
        save,
        read: () => enqueue(async () => {
            if (!pending) { await ensureLoaded(); }
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
            if (pending && sameLearningDocument(observed, pending.candidate)) { accept(pending, observed!); return snapshot(); }
            confirmed = observed;
            pending = null;
            conflict = false;
            return snapshot();
        }),
        clear: (expected: LearningDocument | null, isCurrent: () => boolean) => save(expected, { profiles: [] }, isCurrent),
        resetInvalid: (isCurrent: () => boolean, onConfirmed?: LearningSaveConfirmation) => enqueue(async (): Promise<SaveResult> => {
            if (!isCurrent()) { return { status: 'cancelled' }; }
            // Explicit reset may abandon an uncertain edit once the file is proven invalid.
            if ((pending || conflict) && snapshot().status !== 'invalid') {
                throw new LearningStorageError('learning_resolve_pending_first');
            }
            // Recheck before the destructive write: a repaired file must not be erased.
            try {
                const observed = await readFile();
                if (!isCurrent()) { return { status: 'cancelled' }; }
                if (pending && sameLearningDocument(observed, pending.candidate)) { return accept(pending, observed!); }
                confirmed = observed;
                pending = null;
                conflict = false;
                return { status: 'cancelled' };
            } catch (error) {
                if (!(error instanceof LearningStorageError) || error.code !== 'learning_file_invalid') { throw error; }
            }
            if (!isCurrent()) { return { status: 'cancelled' }; }
            // Reuse an uncertain reset candidate so even a late first upload cannot undo this reset.
            const previousReset = pending?.invalidBaseline ? pending : null;
            const candidate = previousReset?.candidate ?? parseLearningDocument({ schemaVersion: 2, revision: 1, commitId: createId(), data: { profiles: [] } });
            conflict = false;
            return upload({ expected: null, candidate, invalidBaseline: structuredClone(invalidFile!),
                onConfirmed: previousReset?.onConfirmed ?? onConfirmed });
        }),
    });
}
