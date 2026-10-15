import { getContext } from '../../../../../../extensions.js';
import { chat_metadata, getRequestHeaders } from '../../../../../../../script.js';
import { EXT_ID } from '../../../core/constants.js';
import { sameMemory } from '../maintenance/domain.js';
import { createMetadataConfirmation, MetadataConfirmationError } from './metadata-confirmation.js';
import { invalidateChangedMaintenance } from '../maintenance/ranges.js';
import { createAbortError, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';

const FIELDS = ['storySummary', 'stateAtoms', 'l0Index'];
// Scoped to the loaded metadata object. Recovery only rereads; it never replays a save.
const transactions = new WeakMap();
const confirmedSnapshots = new WeakMap();

function extension() {
    chat_metadata.extensions ||= {};
    return chat_metadata.extensions[EXT_ID] ||= {};
}

function project(owner) {
    // Internal projection borrows the host store; public reads detach its mutable shell.
    return { storySummary: owner.storySummary || {}, stateAtoms: owner.stateAtoms || [],
        l0Index: owner.l0Index || { version: 1, byFloor: {} } };
}

export function readSummaryMemory() { return structuredClone(project(extension())); }

export function rememberLoadedMemory() {
    const owner = extension();
    if (!confirmedSnapshots.has(owner)) confirmedSnapshots.set(owner,
        structuredClone(Object.fromEntries(FIELDS.map(key => [key, owner[key]]))));
}

export function getMemoryCommitState() { return transactions.get(chat_metadata.extensions?.[EXT_ID])?.status || 'ready'; }

// Settlement is not success: consumers must reread the final state after waiting.
export function getPendingMemoryCommit(owner = chat_metadata.extensions?.[EXT_ID]) {
    const transaction = transactions.get(owner);
    return transaction?.status === 'saving' ? transaction.settled : null;
}

// A caller can wait for an in-flight save without consuming its unpublished draft.
export async function waitForMemoryCommit(signal) {
    const owner = extension();
    const uncertain = transactions.get(owner);
    throwIfSignalAborted(signal);
    const recovery = uncertain?.status === 'unconfirmed' ? uncertain.reconfirm?.() : null;
    // The caller may cancel its wait while the bounded, read-only confirmation
    // finishes. Observe the result below without leaving an unhandled rejection.
    recovery?.catch(() => {});
    let pending;
    while ((pending = getPendingMemoryCommit(owner))) {
        throwIfSignalAborted(signal);
        let onAbort;
        const cancelled = new Promise((_, reject) => {
            onAbort = () => reject(createAbortError());
            signal?.addEventListener('abort', onAbort, { once: true });
        });
        try { await Promise.race([pending, cancelled]); }
        finally { signal?.removeEventListener('abort', onAbort); }
    }
    throwIfSignalAborted(signal);
    await recovery;
}

export function getRuntimeInvalidSourceFloor() { return transactions.get(chat_metadata.extensions?.[EXT_ID])?.sourceInvalidFloor; }

// The source has already changed in the host. Preserve this runtime block even if saving
// its durable marker fails; a later successful rollback/import/clear explicitly resolves it.
export function noteInvalidMemorySource(fromFloor) {
    const owner = extension();
    const current = transactions.get(owner);
    const sourceInvalidFloor = Math.min(current?.sourceInvalidFloor ?? fromFloor, fromFloor);
    transactions.set(owner, { status: 'source_invalid', previous: structuredClone(project(owner)), sourceInvalidFloor });
}

// Borrowed read view: a pending save owns its draft, readers keep the complete
// previous memory. Persistence uncertainty does not make that memory unreadable.
export function getPublishedSummaryMemory() {
    const pending = transactions.get(chat_metadata.extensions?.[EXT_ID]);
    const memory = pending ? pending.previous : project(extension());
    // install replaces collections but mutates the host store's outer object.
    // Detach only that shell: async readers keep their published data without
    // cloning the full memory or following a later save's unpublished draft.
    return { ...memory, storySummary: { ...memory.storySummary } };
}

export function readPublishedSummaryMemory() { return structuredClone(getPublishedSummaryMemory()); }

export function assertMemoryWritable(chatId = getContext()?.chatId) {
    if (!chatId || getContext()?.chatId !== chatId) throw new MetadataConfirmationError('summary_chat_changed_before_save');
    const status = getMemoryCommitState();
    if (['saving', 'unconfirmed'].includes(status)) throw new MetadataConfirmationError(`metadata_${status}`, status === 'unconfirmed');
}

function install(owner, snapshot) {
    // Keep the store reference held by renderers; never touch another loaded chat's metadata.
    owner.storySummary ||= {};
    for (const key of Object.keys(owner.storySummary)) delete owner.storySummary[key];
    Object.assign(owner.storySummary, structuredClone(snapshot.storySummary));
    owner.stateAtoms = structuredClone(snapshot.stateAtoms);
    owner.l0Index = structuredClone(snapshot.l0Index);
}

/** The sole durable write for summary JSON, history, anchors and extraction status. */
export async function commitSummaryMemory(chatId, next, { previous = readSummaryMemory(), invalidate, validate, resolvesSourceInvalidity = false, maintenanceWrite = false } = {}) {
    if (getMemoryCommitState() === 'unconfirmed') await waitForMemoryCommit();
    assertMemoryWritable(chatId);
    const owner = extension();
    const context = getContext();
    const rawPrevious = structuredClone(Object.fromEntries(FIELDS.map(key => [key, owner[key]])));
    if (typeof context.saveMetadata !== 'function') throw new MetadataConfirmationError('summary_metadata_save_unavailable');
    const confirm = createMetadataConfirmation(context, getRequestHeaders);
    const expected = structuredClone(next);
    if (!FIELDS.every(key => Object.hasOwn(expected, key))) throw new MetadataConfirmationError('metadata_incomplete_draft');
    invalidateChangedMaintenance(previous, expected, { maintenanceWrite });
    const assertBaseline = () => {
        if (getContext()?.chatId !== chatId || extension() !== owner || !sameMemory(project(owner), previous)) {
            throw new MetadataConfirmationError('metadata_draft_conflict');
        }
        validate?.();
    };
    assertBaseline();
    const sourceInvalidFloor = transactions.get(owner)?.sourceInvalidFloor;
    let settle;
    const settled = new Promise(resolve => { settle = resolve; });
    const transaction = { status: 'saving', previous: structuredClone(previous), sourceInvalidFloor, settled };
    const release = resolved => {
        if (sourceInvalidFloor != null && !resolved) transactions.set(owner, { status: 'source_invalid', previous: structuredClone(project(owner)), sourceInvalidFloor });
        else transactions.delete(owner);
    };
    const confirmAndPublish = async () => {
        await confirm(expected, rawPrevious, confirmedSnapshots.get(owner));
        if (!sameMemory(project(owner), expected)) throw new MetadataConfirmationError('metadata_save_conflict', true);
        release(resolvesSourceInvalidity || expected.storySummary.sourceInvalidFromFloor != null);
        confirmedSnapshots.set(owner, expected);
        return expected;
    };
    transactions.set(owner, transaction);
    let staged = false;
    try {
        try { await invalidate?.(); }
        catch (error) { error.code ||= 'memory_cache_invalidation_failed'; throw error; }
        assertBaseline();
        install(owner, expected);
        staged = true;
        let saveError;
        try { await context.saveMetadata(); }
        catch (error) { saveError = error; }
        // Even a thrown host save can already have reached disk. Only readback decides.
        try { return await confirmAndPublish(); }
        catch (error) { if (saveError) error.cause ||= saveError; throw error; }
    } catch (error) {
        if (staged && (error.uncertain || !sameMemory(project(owner), expected))) {
            transaction.status = 'unconfirmed';
            // A transport failure is not evidence of a conflicting write. The
            // next write preparation may confirm the same save without reload.
            if (error.code === 'metadata_save_unconfirmed') {
                transaction.reconfirm = async () => {
                    transaction.status = 'saving';
                    let finish;
                    transaction.settled = new Promise(resolve => { finish = resolve; });
                    try {
                        await confirmAndPublish();
                    } catch (confirmationError) {
                        transaction.status = 'unconfirmed';
                        if (confirmationError.code === 'metadata_not_saved' && sameMemory(project(owner), expected)) {
                            install(owner, previous);
                            release(false);
                        } else if (confirmationError.code !== 'metadata_save_unconfirmed') {
                            delete transaction.reconfirm;
                        }
                        throw confirmationError;
                    } finally { finish(); }
                };
            }
            error.uncertain = true;
        } else {
            if (staged) install(owner, previous);
            release(false);
        }
        throw error;
    } finally { settle(); }
}
