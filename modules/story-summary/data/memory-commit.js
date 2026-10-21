import { getContext } from '../../../../../../extensions.js';
import { chat_metadata, getRequestHeaders } from '../../../../../../../script.js';
import { EXT_ID } from '../../../core/constants.js';
import { sameMemory } from '../maintenance/domain.js';
import { createMetadataConfirmation, MetadataConfirmationError, METADATA_CONFIRMATION_TIMEOUT_MS } from './metadata-confirmation.js';
import { invalidateChangedMaintenance } from '../maintenance/ranges.js';
import { invalidateMemoryAnchors, invalidateMemoryAnchorsAtFloors } from './anchor-invalidation.js';
import { createAbortError, throwIfSignalAborted, runWithAbortDeadline } from '../../../shared/common/abort-utils.js';

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
export async function waitForMemoryCommit(signal, { recover = true } = {}) {
    const owner = extension();
    const uncertain = transactions.get(owner);
    throwIfSignalAborted(signal);
    const recovery = recover && uncertain?.status === 'unconfirmed' ? uncertain.reconfirm?.() : null;
    // The caller may cancel its wait while the bounded, read-only confirmation
    // finishes. Observe the result below without leaving an unhandled rejection.
    recovery?.catch((caughtError) => { console.warn({ source: import.meta.url, operation: "waitForMemoryCommit" }, caughtError); });
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
    return transactions.get(owner)?.status !== 'unconfirmed';
}

export function getRuntimeInvalidSourceFloor() { return transactions.get(chat_metadata.extensions?.[EXT_ID])?.sourceInvalidFloor; }
export function getRuntimeSourceRollbackFloor() { return transactions.get(chat_metadata.extensions?.[EXT_ID])?.sourceRollbackFloor; }

// Failed cache retirement and an actual pending L2 undo are independent facts.
// Keep unsaved boundaries on this metadata owner until persisted or resolved.
export function noteInvalidMemorySource(fromFloor, rollbackFromFloor = null) {
    const owner = extension();
    const current = transactions.get(owner);
    const sourceInvalidFloor = Math.min(current?.sourceInvalidFloor ?? fromFloor, fromFloor);
    const sourceRollbackFloor = rollbackFromFloor == null ? current?.sourceRollbackFloor
        : Math.min(current?.sourceRollbackFloor ?? rollbackFromFloor, rollbackFromFloor);
    if (current && ['saving', 'unconfirmed'].includes(current.status)) {
        Object.assign(current, { sourceInvalidFloor, sourceRollbackFloor });
    } else transactions.set(owner, { status: 'source_invalid', previous: structuredClone(project(owner)), sourceInvalidFloor, sourceRollbackFloor });
}

// Borrowed read view: a pending save owns its draft, readers keep the complete
// previous memory. Persistence uncertainty does not make that memory unreadable.
export function getPublishedSummaryMemory() {
    const pending = transactions.get(chat_metadata.extensions?.[EXT_ID]);
    const memory = pending ? applyRetirements(pending.previous, pending) : project(extension());
    // install replaces collections but mutates the host store's outer object.
    // Detach only that shell: async readers keep their published data without
    // cloning the full memory or following a later save's unpublished draft.
    return { ...memory, storySummary: { ...memory.storySummary } };
}

export function readPublishedSummaryMemory() { return structuredClone(getPublishedSummaryMemory()); }

function assertMemoryOwner(chatId, owner) {
    if (!chatId || getContext()?.chatId !== chatId || owner && chat_metadata.extensions?.[EXT_ID] !== owner) {
        throw new MetadataConfirmationError('summary_chat_changed_before_save');
    }
}

export function assertMemoryWritable(chatId = getContext()?.chatId) {
    assertMemoryOwner(chatId);
    const status = getMemoryCommitState();
    if (['saving', 'unconfirmed'].includes(status)) throw new MetadataConfirmationError(`metadata_${status}`, status === 'unconfirmed');
}

function install(owner, snapshot, { clone = true } = {}) {
    // Keep the store reference held by renderers; never touch another loaded chat's metadata.
    const copy = clone ? structuredClone(snapshot) : { ...snapshot, storySummary: { ...snapshot.storySummary } };
    owner.storySummary ||= {};
    for (const key of Object.keys(owner.storySummary)) delete owner.storySummary[key];
    Object.assign(owner.storySummary, copy.storySummary);
    owner.stateAtoms = copy.stateAtoms;
    owner.l0Index = copy.l0Index;
}

function applyRetirements(snapshot, transaction) {
    if (!snapshot || !transaction?.retirements?.length) return snapshot;
    return transaction.retirements.reduce((memory, { fromFloor, floors, reason, at }) => (
        fromFloor == null ? invalidateMemoryAnchorsAtFloors(memory, floors, reason, at)
            : invalidateMemoryAnchors(memory, fromFloor, reason, at)
    ).next, project(snapshot));
}

/** Automatic source changes are visible before any asynchronous cache work or host save. */
export function retireSummaryMemorySources(chatId, { fromFloor = null, floors = [], reason = 'source_changed' } = {}) {
    assertMemoryOwner(chatId);
    const owner = extension();
    const transaction = transactions.get(owner);
    const retirement = { fromFloor, floors: [...floors], reason, at: Date.now() };
    if (transaction && ['saving', 'unconfirmed'].includes(transaction.status)) {
        const retirements = transaction.retirements ||= [];
        if (!retirements.some(item => item.fromFloor === fromFloor && item.reason === reason && sameMemory(item.floors, floors))) {
            retirements.push(retirement);
        }
    }
    const previous = project(owner);
    const result = fromFloor == null ? invalidateMemoryAnchorsAtFloors(previous, floors, reason, retirement.at)
        : invalidateMemoryAnchors(previous, fromFloor, reason, retirement.at);
    if (result.next !== previous) install(owner, result.next, { clone: false });
    if (transaction?.status === 'source_invalid') transaction.previous = structuredClone(project(owner));
    return result;
}

/** Live-only publication: the next ordinary host save owns persistence. No IO or recovery. */
export function publishSummaryMemory(chatId, next, { previous = readSummaryMemory(), validate, resolvesSourceInvalidity = false } = {}) {
    assertMemoryWritable(chatId);
    const owner = extension();
    if (!sameMemory(project(owner), previous)) throw new MetadataConfirmationError('metadata_draft_conflict');
    if (!FIELDS.every(key => Object.hasOwn(next, key))) throw new MetadataConfirmationError('metadata_incomplete_draft');
    validate?.();
    invalidateChangedMaintenance(previous, next);
    install(owner, next);
    const transaction = transactions.get(owner);
    if (transaction?.status === 'source_invalid') {
        if (resolvesSourceInvalidity) transactions.delete(owner);
        else transaction.previous = structuredClone(project(owner));
    }
    return next;
}

/** The sole durable write for summary JSON, history, anchors and extraction status. */
export async function commitSummaryMemory(chatId, next, { previous = readSummaryMemory(), invalidate, validate, resolvesSourceInvalidity = false, maintenanceWrite = false } = {}) {
    // Atomic acquisition: the stretch from this check to transactions.set below stays
    // synchronous, so exactly one writer holds the transaction. A loser that wakes to
    // 'saving' keeps waiting here instead of being rejected as busy. No await may be
    // introduced in that stretch (prep is sync by design; validate callbacks are sync).
    const owner = extension();
    for (;;) {
        // A waiter still belongs to the metadata object it queued against. Check
        // that identity before waiting or reconfirming, including after each await.
        assertMemoryOwner(chatId, owner);
        const existing = transactions.get(owner);
        if (existing?.status === 'saving' || existing?.reconfirm) { await waitForMemoryCommit(); continue; }
        assertMemoryWritable(chatId);
        break;
    }
    const context = getContext();
    const rawPrevious = structuredClone(Object.fromEntries(FIELDS.map(key => [key, owner[key]])));
    const baseline = project(rawPrevious);
    if (!sameMemory(baseline, previous)) throw new MetadataConfirmationError('metadata_draft_conflict');
    if (typeof context.saveMetadata !== 'function') throw new MetadataConfirmationError('summary_metadata_save_unavailable');
    const confirm = createMetadataConfirmation(context, getRequestHeaders);
    const expected = structuredClone(next);
    if (!FIELDS.every(key => Object.hasOwn(expected, key))) throw new MetadataConfirmationError('metadata_incomplete_draft');
    invalidateChangedMaintenance(previous, expected, { maintenanceWrite });
    const assertBaseline = () => {
        if (getContext()?.chatId !== chatId || extension() !== owner || !sameMemory(project(owner), applyRetirements(baseline, transactions.get(owner)))) {
            throw new MetadataConfirmationError('metadata_draft_conflict');
        }
        validate?.();
    };
    assertBaseline();
    const sourceInvalidFloor = transactions.get(owner)?.sourceInvalidFloor;
    const sourceRollbackFloor = transactions.get(owner)?.sourceRollbackFloor;
    let settle;
    const settled = new Promise(resolve => { settle = resolve; });
    const transaction = { status: 'saving', previous: baseline, sourceInvalidFloor, sourceRollbackFloor, settled };
    const current = snapshot => applyRetirements(snapshot, transaction);
    // The failed caller retains this tiny proof token even after another reader
    // resolves and releases the owner transaction. It never retains a second draft.
    const confirmation = { state: 'unknown' };
    const release = resolved => {
        const invalidFloor = transaction.sourceInvalidFloor;
        const rollbackFloor = transaction.sourceRollbackFloor;
        if ((invalidFloor != null || rollbackFloor != null) && !resolved) transactions.set(owner, {
            status: 'source_invalid', previous: structuredClone(project(owner)), sourceInvalidFloor: invalidFloor, sourceRollbackFloor: rollbackFloor,
        });
        else transactions.delete(owner);
    };
    let saveSettled = false;
    const assertNotSuperseded = () => {
        if (transaction.retirements?.length && !sameMemory(expected, baseline) && sameMemory(current(expected), current(baseline))) {
            throw new MetadataConfirmationError('metadata_source_changed');
        }
    };
    const confirmAndPublish = async (timeoutMs = METADATA_CONFIRMATION_TIMEOUT_MS) => {
        assertNotSuperseded();
        const persisted = await confirm(expected, rawPrevious, confirmedSnapshots.get(owner), { timeoutMs, savePending: () => !saveSettled, normalize: current });
        assertNotSuperseded();
        if (!sameMemory(project(owner), current(expected))) throw new MetadataConfirmationError('metadata_save_conflict', true);
        const sourceBoundariesPersisted = (sourceInvalidFloor == null || (expected.storySummary.sourceInvalidFromFloor ?? Infinity) <= sourceInvalidFloor)
            && (sourceRollbackFloor == null || (expected.storySummary.sourceRollbackFromFloor ?? Infinity) <= sourceRollbackFloor);
        confirmation.state = 'confirmed';
        release((resolvesSourceInvalidity || sourceBoundariesPersisted)
            && transaction.sourceInvalidFloor === sourceInvalidFloor && transaction.sourceRollbackFloor === sourceRollbackFloor);
        confirmedSnapshots.set(owner, persisted);
        return current(expected);
    };
    transactions.set(owner, transaction);
    let staged = false;
    try {
        try { await invalidate?.(); }
        catch (error) { error.code ||= 'memory_cache_invalidation_failed'; throw error; }
        assertBaseline();
        install(owner, current(expected));
        staged = true;
        let saveError;
        // The host owns this save; timing out our wait cannot cancel or replay it.
        const deadline = Date.now() + METADATA_CONFIRMATION_TIMEOUT_MS;
        // Invoke before yielding: SillyTavern's method reads the active chat, not
        // the context object it was obtained from.
        const saving = (async () => {
            try { await context.saveMetadata(); }
            catch (error) { saveError = error; }
            finally { saveSettled = true; }
        })();
        try {
            await runWithAbortDeadline(() => saving, { timeoutMs: Math.max(1, deadline - Date.now()) });
        } catch (error) {
            throw new MetadataConfirmationError('metadata_save_unconfirmed', true,
                Object.assign(new Error('metadata_save_timeout'), { code: 'metadata_save_timeout', cause: saveError || error }));
        }
        try { return await confirmAndPublish(Math.max(1, deadline - Date.now())); }
        catch (error) { if (saveError) error.cause ||= saveError; throw error; }
    } catch (error) {
        if (staged && (error.uncertain || !sameMemory(project(owner), current(expected)))) {
            transaction.status = 'unconfirmed';
            error.confirmation = confirmation;
            // A transport failure is not evidence of a conflicting write. The
            // next write preparation may confirm the same save without reload.
            if (error.code === 'metadata_save_unconfirmed' || error.code === 'metadata_save_conflict') {
                transaction.reconfirm = async () => {
                    transaction.status = 'saving';
                    let finish;
                    transaction.settled = new Promise(resolve => { finish = resolve; });
                    try {
                        await confirmAndPublish();
                    } catch (confirmationError) {
                        confirmationError.confirmation = confirmation;
                        transaction.status = 'unconfirmed';
                        if (['metadata_not_saved', 'metadata_source_changed'].includes(confirmationError.code) && sameMemory(project(owner), current(expected))) {
                            install(owner, current(baseline));
                            confirmation.state = 'not_saved';
                            release(false);
                        } else confirmationError.uncertain = true;
                        throw confirmationError;
                    } finally { finish(); }
                };
            }
            error.uncertain = true;
        } else {
            if (staged) install(owner, current(baseline));
            release(false);
        }
        throw error;
    } finally { settle(); }
}
